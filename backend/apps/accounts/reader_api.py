import json

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model, login, logout, update_session_auth_hash
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.db.models import Q
from django.http import FileResponse, Http404, JsonResponse
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.csrf import csrf_protect

from apps.content.models import Post
from apps.events.models import Ticket
from apps.magazine.models import Order, OrderItem
from apps.submissions.models import Nomination
from .google_login import google_start, google_callback
from .models import AccountToken, CommentReport, ReaderAccount, ReaderComment, SavedArticle
from .reader_services import ReaderError, create_reader, email_field, field, get_action_token, rate_limit, reader_for, reader_json, send_account_email


def published_post(slug):
    return get_object_or_404(Post.objects.live().public(), slug=slug)


def account_orders(reader):
    return Order.objects.filter(Q(user=reader.user) | Q(user__isnull=True, email__iexact=reader.email))


def dashboard(reader):
    saved = [{"id": item.post_id, "title": item.post.title, "slug": item.post.slug}
             for item in SavedArticle.objects.filter(reader=reader, post__in=Post.objects.live().public()).select_related("post")]
    result = {"saved": saved, "orders": [], "tickets": [], "applications": []}
    if not reader.verified_at:
        return result
    for order in account_orders(reader).prefetch_related("items__issue").order_by("-created_at")[:100]:
        result["orders"].append({"id": order.pk, "status": order.get_status_display(), "amount": str(order.amount),
            "date": order.created_at.isoformat(), "items": [{"title": item.issue.title, "quantity": item.quantity,
                "format": item.get_format_display(), "download": f"/api/visitor/download/{item.pk}" if order.status == "paid" and item.format == "digital" and item.issue.digital_file else None}
                for item in order.items.all()]})
    for ticket in Ticket.objects.filter(Q(buyer=reader.user) | Q(buyer__isnull=True, buyer_email__iexact=reader.email)).select_related("event", "ticket_type").order_by("-created_at")[:100]:
        result["tickets"].append({"id": ticket.pk, "event": ticket.event.name, "tier": ticket.ticket_type.name,
            "date": str(ticket.event.start_date), "status": ticket.get_status_display(),
            "code": ticket.check_in_code if ticket.status == "paid" else None})
    result["applications"] = [{"reference": str(item.reference), "call": item.get_open_call_display(),
        "status": item.get_status_display(), "date": item.created_at.isoformat()}
        for item in Nomination.objects.filter(email__iexact=reader.email).order_by("-created_at")[:100]]
    return result


def session_data(request):
    try:
        reader = reader_for(request)
    except ReaderError:
        reader = None
    return {"reader": reader_json(reader) if reader else None, "csrf": get_token(request),
        "google_enabled": bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET),
        "email_enabled": settings.AUTH_EMAIL_ENABLED}


def password_value(data, user):
    password = data.get("password")
    if not isinstance(password, str) or not password or len(password) > 128:
        raise ReaderError("Use a password between 8 and 128 characters.")
    validate_password(password, user)
    return password


def handle(request, route, data):
    if route == "session":
        return session_data(request)
    if route == "register":
        email = email_field(data)
        rate_limit("register", email, 5, 3600)
        name = field(data, "display_name", 80)
        password = password_value(data, get_user_model()(email=email))
        reader = create_reader(email, name, password)
        login(request, reader.user, backend="django.contrib.auth.backends.ModelBackend")
        request.session.set_expiry(60 * 60 * 24 * 14)
        sent = send_account_email(reader, "verify")
        return {**session_data(request), "detail": "Account created. Check your email to verify it." if sent else "Account created. Email verification is not available yet; please try resending later."}
    if route == "login":
        email = email_field(data)
        rate_limit("login", email)
        reader = ReaderAccount.objects.select_related("user").filter(email=email).first()
        password = data.get("password", "")
        if not isinstance(password, str) or len(password) > 128:
            raise ReaderError("Invalid email or password.", 401)
        user = authenticate(request, username=reader.user.username if reader else "missing_reader", password=password)
        if not user or not reader or user.is_staff or user.is_superuser:
            raise ReaderError("Invalid email or password.", 401)
        login(request, user)
        request.session.set_expiry(60 * 60 * 24 * 14)
        return session_data(request)
    if route == "logout":
        logout(request)
        return {"detail": "Signed out."}
    if route == "verification/resend":
        reader = reader_for(request)
        if reader.verified_at:
            return {"detail": "Your email is already verified."}
        rate_limit("email", reader.email, 3, 3600)
        if not send_account_email(reader, "verify"):
            raise ReaderError("Verification email could not be sent. Please try again later.", 503)
        return {"detail": "Verification email sent."}
    if route == "verification/confirm":
        with transaction.atomic():
            token = get_action_token(field(data, "token", 200), "verify")
            token.reader.verified_at = timezone.now()
            token.reader.save(update_fields=["verified_at"])
            AccountToken.objects.filter(reader=token.reader, purpose="verify", used_at__isnull=True).update(used_at=timezone.now())
        return {"detail": "Email verified. You can now sign in and access your account."}
    if route == "password/request":
        email = email_field(data)
        rate_limit("email", email, 3, 3600)
        if not settings.AUTH_EMAIL_ENABLED:
            raise ReaderError("Password reset email is not available yet. Please try again later.", 503)
        reader = ReaderAccount.objects.select_related("user").filter(email=email, user__is_active=True, user__is_staff=False, user__is_superuser=False).first()
        if reader:
            send_account_email(reader, "reset")
        return {"detail": "If an account exists, password reset instructions have been requested."}
    if route == "password/reset":
        with transaction.atomic():
            token = get_action_token(field(data, "token", 200), "reset")
            user = token.reader.user
            user.set_password(password_value(data, user))
            user.save(update_fields=["password"])
            # Possession of a valid mailbox reset link proves ownership.
            token.reader.verified_at = timezone.now()
            token.reader.save(update_fields=["verified_at"])
            AccountToken.objects.filter(reader=token.reader, used_at__isnull=True).update(used_at=timezone.now())
        return {"detail": "Password updated. Please sign in."}
    if route == "profile":
        reader = reader_for(request)
        reader.display_name = field(data, "display_name", 80)
        reader.save(update_fields=["display_name"])
        return {"reader": reader_json(reader), "detail": "Profile saved."}
    if route == "password/change":
        reader = reader_for(request, verified=True)
        current_password = data.get("current_password", "")
        if not isinstance(current_password, str) or len(current_password) > 128 or not reader.user.check_password(current_password):
            raise ReaderError("The current password is incorrect.")
        reader.user.set_password(password_value(data, reader.user))
        reader.user.save(update_fields=["password"])
        update_session_auth_hash(request, reader.user)
        return {"detail": "Password updated."}
    if route == "google/start":
        return google_start(request, data)
    if route == "google/callback":
        return google_callback(request)
    if route == "dashboard":
        return dashboard(reader_for(request))
    if route.startswith("download/"):
        reader = reader_for(request, verified=True)
        item = get_object_or_404(OrderItem.objects.select_related("issue"), pk=route.split("/")[1],
            order__in=account_orders(reader).filter(status="paid"), format="digital")
        if not item.issue.digital_file:
            raise Http404
        try:
            return FileResponse(item.issue.digital_file.open("rb"), as_attachment=True, filename=f"{item.issue.slug}.pdf")
        except FileNotFoundError:
            raise Http404
    if route.startswith("saved/"):
        reader = reader_for(request)
        post = published_post(route.split("/")[1])
        if data.get("saved") is True:
            SavedArticle.objects.get_or_create(reader=reader, post=post)
        elif data.get("saved") is False:
            SavedArticle.objects.filter(reader=reader, post=post).delete()
        else:
            raise ReaderError("Choose whether to save this article.")
        return {"saved": data["saved"]}
    if route.startswith("comments/"):
        parts = route.split("/")
        post = published_post(parts[1])
        try:
            reader = reader_for(request)
        except ReaderError:
            reader = None
        if request.method == "GET":
            comments = ReaderComment.objects.filter(post=post).filter(Q(hidden=False) | Q(reader=reader)).select_related("reader")
            before = request.GET.get("before")
            if before:
                if not before.isdigit():
                    raise ReaderError("Invalid page.")
                comments = comments.filter(pk__lt=int(before))
            batch = list(comments.order_by("-pk")[:51])
            return {"comments": [{"id": c.pk, "name": c.reader.display_name, "body": c.body,
                "created_at": c.created_at.isoformat(), "edited_at": c.edited_at.isoformat(),
                "hidden": c.hidden, "own": bool(reader and c.reader_id == reader.pk)} for c in batch[:50]],
                "next": batch[49].pk if len(batch) > 50 else None,
                "saved": bool(reader and SavedArticle.objects.filter(reader=reader, post=post).exists())}
        reader = reader_for(request, verified=True)
        rate_limit("comment", reader.pk, 10, 60)
        if len(parts) == 2:
            if reader.commenting_suspended:
                raise ReaderError("Your commenting privileges are suspended.", 403)
            comment = ReaderComment.objects.create(reader=reader, post=post, body=field(data, "body", 2000), hidden=True)
            return {"id": comment.pk, "detail": "Your comment was submitted for moderation."}
        comment = get_object_or_404(ReaderComment, pk=parts[2], post=post)
        action = data.get("action")
        if action == "report":
            if comment.hidden:
                raise Http404
            CommentReport.objects.get_or_create(reader=reader, comment=comment, defaults={"reason": field(data, "reason", 500)})
            return {"detail": "Report received."}
        if comment.reader_id != reader.pk:
            raise ReaderError("You can only change your own comments.", 403)
        if action == "delete":
            comment.delete()
            return {"detail": "Comment deleted."}
        if action == "edit":
            if reader.commenting_suspended:
                raise ReaderError("Your commenting privileges are suspended.", 403)
            comment.body = field(data, "body", 2000)
            # Preserve moderation state when a reader edits a hidden comment.
            comment.save(update_fields=["body", "edited_at"])
            return {"detail": "Comment updated."}
        raise ReaderError("Unknown comment action.")
    raise Http404


@csrf_protect
def reader_api(request, route):
    get_routes = {"session", "dashboard", "google/callback"}
    allow_get = route in get_routes or route.startswith("download/") or route.startswith("comments/")
    if request.method not in ("GET", "POST") or (request.method == "GET" and not allow_get) or (request.method == "POST" and route in get_routes):
        return JsonResponse({"detail": "Method not allowed."}, status=405)
    try:
        if request.method == "POST":
            if len(request.body) > 16384:
                raise ReaderError("Request is too large.", 413)
            data = json.loads(request.body or b"{}")
            if not isinstance(data, dict):
                raise ReaderError("Expected an object.")
        else:
            data = {}
        result = handle(request, route, data)
        response = JsonResponse(result) if isinstance(result, dict) else result
    except ReaderError as exc:
        response = JsonResponse({"detail": exc.message}, status=exc.status)
    except ValidationError as exc:
        response = JsonResponse({"detail": " ".join(exc.messages)}, status=400)
    except (ValueError, TypeError):
        response = JsonResponse({"detail": "Invalid request."}, status=400)
    except IntegrityError:
        response = JsonResponse({"detail": "This account or item already exists. Please refresh and try again."}, status=409)
    response["Cache-Control"] = "private, no-store"
    response["Referrer-Policy"] = "no-referrer"
    return response

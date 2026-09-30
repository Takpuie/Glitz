import hashlib
import logging
import secrets
import uuid
from datetime import timedelta
from urllib.parse import urlencode

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.db import transaction
from django.utils import timezone

from .models import AccountToken, ReaderAccount

logger = logging.getLogger(__name__)


class ReaderError(Exception):
    def __init__(self, message, status=400):
        self.message, self.status = message, status


def rate_limit(scope, identity, limit=10, seconds=600):
    key = "reader:" + hashlib.sha256(f"{scope}:{identity}".encode()).hexdigest()
    cache.add(key, 0, seconds)
    try:
        count = cache.incr(key)
    except ValueError:
        cache.set(key, 1, seconds)
        count = 1
    if count > limit:
        raise ReaderError("Too many attempts. Please try again later.", 429)


def field(data, name, limit=2000, required=True):
    value = data.get(name, "")
    if not isinstance(value, str):
        raise ReaderError(f"Invalid {name.replace('_', ' ')}.")
    value = value.strip()
    if (required and not value) or len(value) > limit:
        raise ReaderError(f"Please provide a valid {name.replace('_', ' ')} (up to {limit} characters).")
    return value


def email_field(data):
    email = field(data, "email", 254).lower()
    try:
        validate_email(email)
    except ValidationError:
        raise ReaderError("Please enter a valid email address.")
    return email


def reader_for(request, verified=False):
    if not request.user.is_authenticated or request.user.is_staff or request.user.is_superuser:
        raise ReaderError("Please sign in with a visitor account.", 401)
    try:
        reader = request.user.reader_account
    except ReaderAccount.DoesNotExist:
        raise ReaderError("Please sign in with a visitor account.", 401)
    if verified and not reader.verified_at:
        raise ReaderError("Verify your email address first.", 403)
    return reader


def reader_json(reader):
    return {"id": reader.pk, "email": reader.email, "display_name": reader.display_name,
            "verified": bool(reader.verified_at), "google_connected": bool(reader.google_subject),
            "commenting_suspended": reader.commenting_suspended}


def create_reader(email, display_name, password=None, google_subject=None, verified=False):
    User = get_user_model()
    # Existing staff or legacy identities cannot be claimed through visitor signup.
    if User.objects.filter(email__iexact=email).exists():
        raise ReaderError("An account already uses this email. Sign in or reset its password.", 409)
    with transaction.atomic():
        user = User.objects.create_user(username="reader_" + uuid.uuid4().hex, email=email, password=password)
        return ReaderAccount.objects.create(user=user, email=email, display_name=display_name,
            google_subject=google_subject, verified_at=timezone.now() if verified else None)


def send_account_email(reader, purpose):
    if not settings.AUTH_EMAIL_ENABLED:
        return False
    raw = secrets.token_urlsafe(32)
    lifetime = timedelta(hours=24) if purpose == "verify" else timedelta(minutes=60)
    token = AccountToken.objects.create(reader=reader, digest=hashlib.sha256(raw.encode()).hexdigest(),
        purpose=purpose, expires_at=timezone.now() + lifetime)
    url = settings.FRONTEND_BASE_URL.rstrip("/") + "/account?" + urlencode({"action": purpose, "token": raw})
    subject = "Verify your Glitz Africa email" if purpose == "verify" else "Reset your Glitz Africa password"
    body = f"{subject}\n\nOpen this link and follow the instructions:\n{url}\n\nIf you did not request this, ignore this message."
    try:
        if send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [reader.email]) != 1:
            raise RuntimeError("Email not accepted")
    except Exception:
        token.delete()
        logger.warning("Account email delivery failed for reader %s", reader.pk)
        return False
    return True


def get_action_token(raw, purpose):
    token = AccountToken.objects.select_for_update().select_related("reader__user").filter(
        digest=hashlib.sha256(raw.encode()).hexdigest(), purpose=purpose,
        used_at__isnull=True, expires_at__gt=timezone.now()).first()
    if not token or not token.reader.user.is_active or token.reader.user.is_staff or token.reader.user.is_superuser:
        raise ReaderError("This link is invalid or has expired. Request a new one.")
    return token

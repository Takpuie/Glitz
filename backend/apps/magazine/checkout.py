"""Magazine checkout: create a pending Order from a cart (one or more
issues, each digital or print, each with a quantity), open a single
multi-line Stripe Checkout Session, and fulfillment on payment — a gated
download link per digital item, nothing automated for print (the plan
leaves print fulfillment as a manual, address-in-hand process for now).
"""

from urllib.parse import quote

from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from glitz_backend.stripe_client import StripeError, create_checkout_session, retrieve_checkout_session
from .models import MagazineIssue, Order, OrderItem


def _download_url(session_id, email, issue_slug):
    return (
        f"{settings.WAGTAILADMIN_BASE_URL}/api/orders/{session_id}/download/"
        f"?email={quote(email)}&issue={quote(issue_slug)}"
    )


class OrderItemSerializer(serializers.ModelSerializer):
    issue_title = serializers.CharField(source="issue.title", read_only=True)
    issue_slug = serializers.CharField(source="issue.slug", read_only=True)
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ["issue_title", "issue_slug", "format", "quantity", "unit_price", "download_url"]

    def get_download_url(self, obj):
        order = obj.order
        if (
            order.status == Order.Status.PAID
            and obj.format == OrderItem.Format.DIGITAL
            and obj.issue.digital_file
        ):
            return _download_url(order.stripe_session_id, order.email, obj.issue.slug)
        return None


class OrderStatusSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ["stripe_session_id", "status", "email", "amount", "items"]


class CartItemSerializer(serializers.Serializer):
    slug = serializers.SlugField()
    format = serializers.ChoiceField(choices=OrderItem.Format.choices)
    quantity = serializers.IntegerField(min_value=1, max_value=20)


class CartCheckoutSerializer(serializers.Serializer):
    items = CartItemSerializer(many=True)
    buyer_email = serializers.EmailField()
    shipping_address = serializers.CharField(required=False, allow_blank=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Your bag is empty.")
        return value

    def validate(self, data):
        has_print = any(item["format"] == OrderItem.Format.PRINT for item in data["items"])
        if has_print and not data.get("shipping_address", "").strip():
            raise serializers.ValidationError(
                {"shipping_address": "Required when your bag includes a print item."}
            )
        return data


def mark_order_paid(session_id):
    """Idempotent — used by both the webhook and the verify-on-callback
    path. Returns True if this session id belongs to an Order at all (paid
    or not), so the shared webhook knows not to also check Ticket."""
    order = Order.objects.filter(stripe_session_id=session_id).first()
    if not order:
        return False
    if order.status == Order.Status.PENDING:
        order.status = Order.Status.PAID
        order.save(update_fields=["status"])
    return True


class MagazineCheckoutView(APIView):
    """POST /api/magazine/checkout/ — creates a pending Order from a cart
    (one or more issues, each with its own format and quantity) and
    returns a single Stripe Checkout Session url covering the whole bag."""

    permission_classes = []
    authentication_classes = []

    def post(self, request):
        serializer = CartCheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        line_items = []
        total = 0
        with transaction.atomic():
            order = Order.objects.create(
                email=data["buyer_email"],
                amount=0,
                status=Order.Status.PENDING,
                shipping_address=data.get("shipping_address", ""),
            )
            for cart_item in data["items"]:
                issue = get_object_or_404(MagazineIssue, slug=cart_item["slug"])
                fmt = cart_item["format"]
                qty = cart_item["quantity"]

                if fmt == OrderItem.Format.DIGITAL and not issue.is_digital_available:
                    return Response(
                        {"detail": f'The digital edition of "{issue.title}" isn\'t available.'}, status=409
                    )
                if fmt == OrderItem.Format.PRINT and (not issue.is_print_available or issue.print_sold_out):
                    return Response(
                        {"detail": f'The print edition of "{issue.title}" is sold out.'}, status=409
                    )

                OrderItem.objects.create(
                    order=order, issue=issue, format=fmt, quantity=qty, unit_price=issue.price
                )
                total += issue.price * qty
                line_items.append(
                    {
                        "name": f"{issue.title} ({fmt}) × {qty}" if qty > 1 else f"{issue.title} ({fmt})",
                        "unit_amount": int(issue.price * 100),
                        "quantity": qty,
                    }
                )
            order.amount = total
            order.save(update_fields=["amount"])

        callback_url = f"{settings.FRONTEND_BASE_URL}/magazine/checkout/callback"
        try:
            session = create_checkout_session(
                email=data["buyer_email"],
                currency="ghs",
                line_items=line_items,
                success_url=f"{callback_url}?reference={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{settings.FRONTEND_BASE_URL}/cart",
                metadata={"order_id": order.id},
            )
        except StripeError as exc:
            order.status = Order.Status.FAILED
            order.save(update_fields=["status"])
            return Response({"detail": str(exc)}, status=502)

        order.stripe_session_id = session.id
        order.save(update_fields=["stripe_session_id"])

        return Response({"reference": session.id, "checkout_url": session.url}, status=201)


class OrderVerifyView(APIView):
    """GET /api/orders/verify/<reference>/ — used by the checkout callback
    page. Re-checks with Stripe directly if the order is still pending."""

    permission_classes = []
    authentication_classes = []

    def get(self, request, reference):
        order = get_object_or_404(Order, stripe_session_id=reference)
        if order.status == Order.Status.PENDING:
            try:
                session = retrieve_checkout_session(reference)
            except StripeError:
                session = None
            if session and session.payment_status == "paid":
                mark_order_paid(reference)
                order.refresh_from_db()
        return Response(OrderStatusSerializer(order).data)


class DigitalDownloadView(APIView):
    """GET /api/orders/<reference>/download/?email=...&issue=<slug> — where
    each digital OrderItem's download_url points, instead of the raw media
    path: 403 unless the order is paid and the email matches, 404 if that
    issue isn't a digital item on this order or has no file yet."""

    permission_classes = []
    authentication_classes = []

    def get(self, request, reference):
        from django.http import HttpResponseRedirect

        order = get_object_or_404(Order, stripe_session_id=reference)
        email = request.query_params.get("email", "")
        issue_slug = request.query_params.get("issue", "")
        if order.status != Order.Status.PAID:
            return Response({"detail": "This order hasn't been paid yet."}, status=403)
        if email.strip().lower() != order.email.strip().lower():
            return Response({"detail": "Email does not match this order."}, status=403)

        item = order.items.filter(format=OrderItem.Format.DIGITAL, issue__slug=issue_slug).first()
        if not item or not item.issue.digital_file:
            return Response({"detail": "The digital file for this issue isn't available yet."}, status=404)

        return HttpResponseRedirect(item.issue.digital_file.url)

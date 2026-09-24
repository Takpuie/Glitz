"""Magazine checkout: create a pending Order (single issue, digital or
print), open a Stripe Checkout Session, and fulfillment on payment — a
gated download link for digital, nothing automated for print (the plan
leaves print fulfillment as a manual, address-in-hand process for now).
"""

from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from glitz_backend.stripe_client import StripeError, create_checkout_session, retrieve_checkout_session
from .models import MagazineIssue, Order, OrderItem


class OrderStatusSerializer(serializers.ModelSerializer):
    issue_title = serializers.SerializerMethodField()
    format = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ["stripe_session_id", "status", "email", "amount", "delivery_link", "issue_title", "format"]

    def get_issue_title(self, obj):
        item = obj.items.first()
        return item.issue.title if item else ""

    def get_format(self, obj):
        item = obj.items.first()
        return item.format if item else ""


class MagazineCheckoutSerializer(serializers.Serializer):
    format = serializers.ChoiceField(choices=OrderItem.Format.choices)
    buyer_email = serializers.EmailField()
    shipping_address = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        if data["format"] == OrderItem.Format.PRINT and not data.get("shipping_address", "").strip():
            raise serializers.ValidationError({"shipping_address": "Required for print orders."})
        return data


def _download_url(session_id, email):
    from urllib.parse import quote

    return f"{settings.WAGTAILADMIN_BASE_URL}/api/orders/{session_id}/download/?email={quote(email)}"


def mark_order_paid(session_id):
    """Idempotent — used by both the webhook and the verify-on-callback
    path. Returns True if this session id belongs to an Order at all (paid
    or not), so the shared webhook knows not to also check Ticket."""
    order = Order.objects.filter(stripe_session_id=session_id).first()
    if not order:
        return False
    if order.status == Order.Status.PENDING:
        order.status = Order.Status.PAID
        item = order.items.first()
        if item and item.format == OrderItem.Format.DIGITAL and item.issue.digital_file:
            order.delivery_link = _download_url(order.stripe_session_id, order.email)
        order.save(update_fields=["status", "delivery_link"])
    return True


class MagazineCheckoutView(APIView):
    """POST /api/magazine-issues/<slug>/checkout/ — creates a pending Order
    for one issue in one format and returns a Stripe Checkout Session url."""

    permission_classes = []
    authentication_classes = []

    def post(self, request, slug):
        issue = get_object_or_404(MagazineIssue, slug=slug)
        serializer = MagazineCheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        fmt = data["format"]

        if fmt == OrderItem.Format.DIGITAL and not issue.is_digital_available:
            return Response({"detail": "The digital edition isn't available for this issue."}, status=409)
        if fmt == OrderItem.Format.PRINT and (not issue.is_print_available or issue.print_sold_out):
            return Response({"detail": "The print edition is sold out for this issue."}, status=409)

        with transaction.atomic():
            order = Order.objects.create(
                email=data["buyer_email"],
                amount=issue.price,
                status=Order.Status.PENDING,
                shipping_address=data.get("shipping_address", ""),
            )
            OrderItem.objects.create(
                order=order, issue=issue, format=fmt, quantity=1, unit_price=issue.price
            )

        callback_url = f"{settings.FRONTEND_BASE_URL}/magazine/checkout/callback"
        try:
            session = create_checkout_session(
                email=data["buyer_email"],
                amount_minor_units=int(issue.price * 100),
                currency="ghs",
                product_name=f"{issue.title} ({fmt})",
                success_url=f"{callback_url}?reference={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{settings.FRONTEND_BASE_URL}/magazine",
                metadata={"order_id": order.id, "issue_slug": issue.slug, "format": fmt},
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
    """GET /api/orders/<reference>/download/?email=... — the delivery_link
    fulfillment points here rather than at the raw media file, so a paid
    order is the only way in and the email on the order has to match."""

    permission_classes = []
    authentication_classes = []

    def get(self, request, reference):
        from django.http import HttpResponseRedirect

        order = get_object_or_404(Order, stripe_session_id=reference)
        email = request.query_params.get("email", "")
        if order.status != Order.Status.PAID:
            return Response({"detail": "This order hasn't been paid yet."}, status=403)
        if email.strip().lower() != order.email.strip().lower():
            return Response({"detail": "Email does not match this order."}, status=403)

        item = order.items.filter(format=OrderItem.Format.DIGITAL).first()
        if not item or not item.issue.digital_file:
            return Response({"detail": "The digital file for this issue isn't available yet."}, status=404)

        return HttpResponseRedirect(item.issue.digital_file.url)

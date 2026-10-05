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

from glitz_backend.paystack_client import PaystackError, initialize_transaction, verify_transaction
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
            return _download_url(order.payment_reference, order.email, obj.issue.slug)
        return None


class OrderStatusSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ["payment_reference", "status", "email", "amount", "items"]


class CartItemSerializer(serializers.Serializer):
    slug = serializers.SlugField()
    format = serializers.ChoiceField(choices=OrderItem.Format.choices)
    quantity = serializers.IntegerField(min_value=1, max_value=20)


class CartCheckoutSerializer(serializers.Serializer):
    items = CartItemSerializer(many=True)
    buyer_email = serializers.EmailField()
    shipping_name = serializers.CharField(required=False, allow_blank=True, max_length=120)
    shipping_phone = serializers.CharField(required=False, allow_blank=True, max_length=30)
    shipping_address_line1 = serializers.CharField(required=False, allow_blank=True, max_length=200)
    shipping_address_line2 = serializers.CharField(required=False, allow_blank=True, max_length=200)
    shipping_city = serializers.CharField(required=False, allow_blank=True, max_length=100)
    shipping_region = serializers.CharField(required=False, allow_blank=True, max_length=100)
    shipping_postal_code = serializers.CharField(required=False, allow_blank=True, max_length=30)
    shipping_country = serializers.RegexField(r"^[A-Z]{2}$", required=False, default="GH")

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Your bag is empty.")
        return value

    def validate(self, data):
        has_print = any(item["format"] == OrderItem.Format.PRINT for item in data["items"])
        if has_print:
            required = ("shipping_name", "shipping_phone", "shipping_address_line1", "shipping_city", "shipping_region", "shipping_country")
            missing = [field for field in required if not data.get(field, "").strip()]
            if missing:
                raise serializers.ValidationError({field: "Required for print delivery." for field in missing})
        return data


def mark_order_paid(session_id):
    """Idempotent — used by both the webhook and the verify-on-callback
    path. Returns True if this session id belongs to an Order at all (paid
    or not), so the shared webhook knows not to also check Ticket."""
    order = Order.objects.filter(payment_reference=session_id).first()
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
                shipping_address="\n".join(filter(None, [data.get("shipping_address_line1"), data.get("shipping_address_line2"), data.get("shipping_city"), data.get("shipping_region"), data.get("shipping_postal_code"), data.get("shipping_country")])),
                shipping_name=data.get("shipping_name", ""), shipping_phone=data.get("shipping_phone", ""),
                shipping_address_line1=data.get("shipping_address_line1", ""), shipping_address_line2=data.get("shipping_address_line2", ""),
                shipping_city=data.get("shipping_city", ""), shipping_region=data.get("shipping_region", ""),
                shipping_postal_code=data.get("shipping_postal_code", ""), shipping_country=data.get("shipping_country", "GH"),
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
        reference = f"glitz-order-{order.id}"
        try:
            transaction_data = initialize_transaction(
                email=data["buyer_email"], amount=int(total * 100), reference=reference,
                callback_url=callback_url,
                metadata={"order_id": order.id, "cancel_action": f"{settings.FRONTEND_BASE_URL}/cart", "items": line_items},
            )
        except PaystackError as exc:
            order.status = Order.Status.FAILED
            order.save(update_fields=["status"])
            return Response({"detail": str(exc)}, status=502)

        order.payment_reference = transaction_data["reference"]
        order.save(update_fields=["payment_reference"])

        return Response({"reference": transaction_data["reference"], "checkout_url": transaction_data["authorization_url"]}, status=201)


class OrderVerifyView(APIView):
    """GET /api/orders/verify/<reference>/ — used by the checkout callback
    page. Re-checks with Stripe directly if the order is still pending."""

    permission_classes = []
    authentication_classes = []

    def get(self, request, reference):
        order = get_object_or_404(Order, payment_reference=reference)
        if order.status == Order.Status.PENDING:
            try:
                payment = verify_transaction(reference)
            except PaystackError:
                payment = None
            if payment and payment.get("status") == "success" and payment.get("currency") == "GHS" and payment.get("amount") == int(order.amount * 100):
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

        order = get_object_or_404(Order, payment_reference=reference)
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

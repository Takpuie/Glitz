"""One Stripe webhook endpoint for the whole project — tickets and
magazine orders share a payment provider, so they share the signature
check and the dispatch. Each domain owns its own idempotent "mark paid"
function; this just verifies the signature and hands the session id off.
"""

from rest_framework.response import Response
from rest_framework.views import APIView

from glitz_backend.stripe_client import verify_webhook_event
from glitz_backend.paystack_client import valid_webhook_signature


class StripeWebhookView(APIView):
    """POST /api/webhooks/stripe/ — the source of truth for payment
    confirmation. Signature-verified; everything else is untrusted input."""

    permission_classes = []
    authentication_classes = []

    def post(self, request):
        signature = request.headers.get("Stripe-Signature", "")
        event = verify_webhook_event(request.body, signature)
        if event is None:
            return Response(status=401)

        if event["type"] != "checkout.session.completed":
            return Response(status=200)

        # event["data"]["object"] is a StripeObject, not a plain dict — it
        # supports [] access (like a dict) but not .get(), so use [] with
        # a StripeObject default rather than .get().
        session = event["data"]["object"]
        if session["payment_status"] != "paid":
            return Response(status=200)

        session_id = session["id"]
        if not session_id:
            return Response(status=200)

        # Imported here, not at module level, so this project-level module
        # doesn't have to load every app's models before Django is ready.
        from apps.events.checkout import mark_ticket_paid
        from apps.magazine.checkout import mark_order_paid

        if not mark_ticket_paid(session_id):
            mark_order_paid(session_id)
        return Response(status=200)


class PaystackWebhookView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        if not valid_webhook_signature(request.body, request.headers.get("X-Paystack-Signature", "")):
            return Response(status=401)
        event = request.data
        if event.get("event") != "charge.success":
            return Response(status=200)
        data = event.get("data", {})
        reference = data.get("reference")
        if not reference:
            return Response(status=200)
        from apps.events.models import Ticket
        from apps.events.checkout import mark_ticket_paid
        from apps.magazine.models import Order
        from apps.magazine.checkout import mark_order_paid
        ticket = Ticket.objects.select_related("ticket_type").filter(paystack_reference=reference).first()
        if ticket and data.get("currency") == "GHS" and data.get("amount") == int(ticket.ticket_type.price * 100):
            mark_ticket_paid(reference)
            return Response(status=200)
        order = Order.objects.filter(payment_reference=reference).first()
        if order and data.get("currency") == "GHS" and data.get("amount") == int(order.amount * 100):
            mark_order_paid(reference)
        return Response(status=200)

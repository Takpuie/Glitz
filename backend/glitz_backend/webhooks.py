"""One Stripe webhook endpoint for the whole project — tickets and
magazine orders share a payment provider, so they share the signature
check and the dispatch. Each domain owns its own idempotent "mark paid"
function; this just verifies the signature and hands the session id off.
"""

from rest_framework.response import Response
from rest_framework.views import APIView

from glitz_backend.stripe_client import verify_webhook_event


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

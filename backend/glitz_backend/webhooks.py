"""One Paystack webhook endpoint for the whole project — tickets and
magazine orders share a payment provider, so they share the signature
check and the dispatch. Each domain owns its own idempotent "mark paid"
function; this just verifies the signature and hands the reference off.
"""

from rest_framework.response import Response
from rest_framework.views import APIView

from glitz_backend.paystack import verify_webhook_signature


class PaystackWebhookView(APIView):
    """POST /api/webhooks/paystack/ — the source of truth for payment
    confirmation. Signature-verified; everything else is untrusted input."""

    permission_classes = []
    authentication_classes = []

    def post(self, request):
        signature = request.headers.get("X-Paystack-Signature", "")
        if not verify_webhook_signature(request.body, signature):
            return Response(status=401)

        if request.data.get("event") != "charge.success":
            return Response(status=200)

        reference = request.data.get("data", {}).get("reference")
        if not reference:
            return Response(status=200)

        # Imported here, not at module level, so this project-level module
        # doesn't have to load every app's models before Django is ready.
        from apps.events.checkout import mark_ticket_paid
        from apps.magazine.checkout import mark_order_paid

        if not mark_ticket_paid(reference):
            mark_order_paid(reference)
        return Response(status=200)

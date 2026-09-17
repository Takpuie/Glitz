"""Ticket checkout: create a pending Ticket, open a Paystack transaction,
and the two ways a ticket gets marked paid — the webhook (source of truth)
and the frontend's post-redirect verify call (belt-and-braces, idempotent).
"""

import uuid

from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Event, Ticket, TicketType
from .paystack import PaystackError, initialize_transaction, verify_transaction, verify_webhook_signature


class TicketStatusSerializer(serializers.ModelSerializer):
    event_name = serializers.CharField(source="event.name", read_only=True)
    ticket_type_name = serializers.CharField(source="ticket_type.name", read_only=True)

    class Meta:
        model = Ticket
        fields = [
            "paystack_reference",
            "status",
            "check_in_code",
            "buyer_name",
            "buyer_email",
            "event_name",
            "ticket_type_name",
        ]


class TicketCheckoutSerializer(serializers.Serializer):
    ticket_type_id = serializers.IntegerField()
    buyer_name = serializers.CharField(max_length=150)
    buyer_email = serializers.EmailField()


def _mark_ticket_paid(reference):
    Ticket.objects.filter(paystack_reference=reference, status=Ticket.Status.PENDING).update(
        status=Ticket.Status.PAID
    )


class TicketCheckoutView(APIView):
    """POST /api/events/<slug>/checkout/ — creates a pending Ticket and
    returns a Paystack authorization_url for the browser to redirect to."""

    permission_classes = []
    authentication_classes = []

    def post(self, request, slug):
        event = get_object_or_404(Event, slug=slug)
        serializer = TicketCheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        with transaction.atomic():
            ticket_type = get_object_or_404(
                TicketType.objects.select_for_update(), id=data["ticket_type_id"], event=event
            )
            if ticket_type.remaining <= 0:
                return Response({"detail": "This ticket tier is sold out."}, status=409)

            reference = f"{event.slug.upper()}-{uuid.uuid4().hex[:10].upper()}"
            ticket = Ticket.objects.create(
                event=event,
                ticket_type=ticket_type,
                buyer_name=data["buyer_name"],
                buyer_email=data["buyer_email"],
                paystack_reference=reference,
                status=Ticket.Status.PENDING,
            )

        callback_url = f"{settings.FRONTEND_BASE_URL}/events/{event.slug}/checkout/callback"
        try:
            init_data = initialize_transaction(
                email=data["buyer_email"],
                amount_kobo=int(ticket_type.price * 100),
                reference=reference,
                callback_url=f"{callback_url}?reference={reference}",
                metadata={"ticket_id": ticket.id, "event_slug": event.slug},
            )
        except PaystackError as exc:
            ticket.status = Ticket.Status.CANCELLED
            ticket.save(update_fields=["status"])
            return Response({"detail": str(exc)}, status=502)

        return Response(
            {"reference": reference, "authorization_url": init_data["authorization_url"]},
            status=201,
        )


class TicketVerifyView(APIView):
    """GET /api/tickets/verify/<reference>/ — used by the checkout callback
    page. Re-checks with Paystack directly if the ticket is still pending,
    so a slow or missed webhook doesn't strand the buyer on a spinner."""

    permission_classes = []
    authentication_classes = []

    def get(self, request, reference):
        ticket = get_object_or_404(Ticket, paystack_reference=reference)
        if ticket.status == Ticket.Status.PENDING:
            try:
                result = verify_transaction(reference)
            except PaystackError:
                result = None
            if result and result.get("status") == "success":
                _mark_ticket_paid(reference)
                ticket.refresh_from_db()
        return Response(TicketStatusSerializer(ticket).data)


class PaystackWebhookView(APIView):
    """POST /api/webhooks/paystack/ — the source of truth for payment
    confirmation. Signature-verified; everything else is untrusted input."""

    permission_classes = []
    authentication_classes = []

    def post(self, request):
        signature = request.headers.get("X-Paystack-Signature", "")
        if not verify_webhook_signature(request.body, signature):
            return Response(status=401)

        event_type = request.data.get("event")
        if event_type == "charge.success":
            reference = request.data.get("data", {}).get("reference")
            if reference:
                _mark_ticket_paid(reference)
        return Response(status=200)

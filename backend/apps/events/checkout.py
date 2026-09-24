"""Ticket checkout: create a pending Ticket, open a Stripe Checkout
Session, and the two ways a ticket gets marked paid — the webhook (source
of truth, see glitz_backend/webhooks.py) and the frontend's post-redirect
verify call (belt-and-braces, idempotent).
"""

from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from glitz_backend.stripe_client import StripeError, create_checkout_session, retrieve_checkout_session
from .models import Event, Ticket, TicketType


class TicketStatusSerializer(serializers.ModelSerializer):
    event_name = serializers.CharField(source="event.name", read_only=True)
    ticket_type_name = serializers.CharField(source="ticket_type.name", read_only=True)

    class Meta:
        model = Ticket
        fields = [
            "stripe_session_id",
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


def mark_ticket_paid(session_id):
    """Idempotent — used by both the webhook and the verify-on-callback
    path. Returns True if this session id belongs to a Ticket at all (paid
    or not), so the shared webhook knows not to also check Order — a
    duplicate webhook delivery must not be mistaken for "not mine"."""
    ticket = Ticket.objects.filter(stripe_session_id=session_id).first()
    if not ticket:
        return False
    if ticket.status == Ticket.Status.PENDING:
        ticket.status = Ticket.Status.PAID
        ticket.save(update_fields=["status"])
    return True


class TicketCheckoutView(APIView):
    """POST /api/events/<slug>/checkout/ — creates a pending Ticket and
    returns a Stripe Checkout Session url for the browser to redirect to."""

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

            ticket = Ticket.objects.create(
                event=event,
                ticket_type=ticket_type,
                buyer_name=data["buyer_name"],
                buyer_email=data["buyer_email"],
                status=Ticket.Status.PENDING,
            )

        callback_url = f"{settings.FRONTEND_BASE_URL}/events/{event.slug}/checkout/callback"
        try:
            session = create_checkout_session(
                email=data["buyer_email"],
                amount_minor_units=int(ticket_type.price * 100),
                currency="ghs",
                product_name=f"{event.name} — {ticket_type.name}",
                success_url=f"{callback_url}?reference={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{settings.FRONTEND_BASE_URL}/events/{event.slug}",
                metadata={"ticket_id": ticket.id, "event_slug": event.slug},
            )
        except StripeError as exc:
            ticket.status = Ticket.Status.CANCELLED
            ticket.save(update_fields=["status"])
            return Response({"detail": str(exc)}, status=502)

        ticket.stripe_session_id = session.id
        ticket.save(update_fields=["stripe_session_id"])

        return Response({"reference": session.id, "checkout_url": session.url}, status=201)


class TicketVerifyView(APIView):
    """GET /api/tickets/verify/<reference>/ — used by the checkout callback
    page. Re-checks with Stripe directly if the ticket is still pending, so
    a slow or missed webhook doesn't strand the buyer on a spinner."""

    permission_classes = []
    authentication_classes = []

    def get(self, request, reference):
        ticket = get_object_or_404(Ticket, stripe_session_id=reference)
        if ticket.status == Ticket.Status.PENDING:
            try:
                session = retrieve_checkout_session(reference)
            except StripeError:
                session = None
            if session and session.payment_status == "paid":
                mark_ticket_paid(reference)
                ticket.refresh_from_db()
        return Response(TicketStatusSerializer(ticket).data)

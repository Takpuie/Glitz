from unittest.mock import patch

from django.test import SimpleTestCase, TestCase

from .checkout import TicketCheckoutSerializer, mark_ticket_paid
from .models import Event, Ticket, TicketType
from .api import EventSerializer


class EventExternalPaymentTests(SimpleTestCase):
    def test_external_payment_link_is_exposed_to_frontend(self):
        event = Event(
            name="Hosted checkout event", slug="hosted-checkout", start_date="2026-11-01",
            external_payment_url="https://tickets.example.com/event/123",
            external_payment_label="Buy passes",
        )
        data = EventSerializer(event).data
        self.assertEqual(data["external_payment_url"], "https://tickets.example.com/event/123")
        self.assertEqual(data["external_payment_label"], "Buy passes")


class TicketPaymentProviderTests(SimpleTestCase):
    def payload(self, **extra):
        return {"ticket_type_id": 1, "buyer_name": "Ama Mensah", "buyer_email": "ama@example.com", **extra}

    def test_paystack_is_default_provider(self):
        serializer = TicketCheckoutSerializer(data=self.payload())
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["payment_provider"], "paystack")

    def test_stripe_can_be_selected(self):
        serializer = TicketCheckoutSerializer(data=self.payload(payment_provider="stripe"))
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["payment_provider"], "stripe")

    def test_unknown_provider_is_rejected(self):
        serializer = TicketCheckoutSerializer(data=self.payload(payment_provider="other"))
        self.assertFalse(serializer.is_valid())

    def test_email_is_normalized_and_control_characters_in_name_are_rejected(self):
        serializer = TicketCheckoutSerializer(data=self.payload(buyer_email=" AMA@Example.com "))
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["buyer_email"], "ama@example.com")
        invalid = TicketCheckoutSerializer(data=self.payload(buyer_name="Ama\nInjected"))
        self.assertFalse(invalid.is_valid())


class TicketEmailTests(TestCase):
    @patch("apps.events.emails.send_ticket_confirmation")
    def test_paid_transition_schedules_one_confirmation(self, send_confirmation):
        event = Event.objects.create(name="Test event", slug="test-event", start_date="2026-11-01")
        tier = TicketType.objects.create(event=event, name="Standard", price="100.00", capacity=10)
        ticket = Ticket.objects.create(event=event, ticket_type=tier, buyer_email="reader@example.com", paystack_reference="paid-ticket")
        with self.captureOnCommitCallbacks(execute=True):
            self.assertTrue(mark_ticket_paid("paid-ticket"))
        with self.captureOnCommitCallbacks(execute=True):
            self.assertTrue(mark_ticket_paid("paid-ticket"))
        send_confirmation.assert_called_once_with(ticket.pk)

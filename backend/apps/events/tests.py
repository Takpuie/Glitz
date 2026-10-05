from django.test import SimpleTestCase

from .checkout import TicketCheckoutSerializer


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

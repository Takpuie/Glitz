import hashlib
import hmac

from unittest.mock import patch

from django.test import SimpleTestCase, TestCase, override_settings

from glitz_backend.paystack_client import valid_webhook_signature
from .checkout import CartCheckoutSerializer, mark_order_paid
from .models import Order


class ShippingCheckoutTests(SimpleTestCase):
    def test_print_requires_structured_shipping_fields(self):
        serializer = CartCheckoutSerializer(data={
            "buyer_email": "reader@example.com",
            "items": [{"slug": "issue-1", "format": "print", "quantity": 1}],
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn("shipping_name", serializer.errors)
        self.assertIn("shipping_address_line1", serializer.errors)

    def test_digital_order_does_not_require_shipping(self):
        serializer = CartCheckoutSerializer(data={
            "buyer_email": "reader@example.com",
            "items": [{"slug": "issue-1", "format": "digital", "quantity": 1}],
        })
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_checkout_rejects_duplicate_and_oversized_carts(self):
        item = {"slug": "issue-1", "format": "digital", "quantity": 1}
        duplicate = CartCheckoutSerializer(data={"buyer_email": "reader@example.com", "items": [item, item]})
        oversized = CartCheckoutSerializer(data={"buyer_email": "reader@example.com", "items": [
            {"slug": f"issue-{number}", "format": "digital", "quantity": 1} for number in range(21)
        ]})
        self.assertFalse(duplicate.is_valid())
        self.assertFalse(oversized.is_valid())

    def test_shipping_phone_is_validated_and_email_normalized(self):
        payload = {
            "buyer_email": " READER@Example.com ",
            "items": [{"slug": "issue-1", "format": "print", "quantity": 1}],
            "shipping_name": "Reader", "shipping_phone": "not-a-phone",
            "shipping_address_line1": "1 High Street", "shipping_city": "Accra",
            "shipping_region": "Greater Accra", "shipping_country": "GH",
        }
        invalid = CartCheckoutSerializer(data=payload)
        self.assertFalse(invalid.is_valid())
        payload["shipping_phone"] = "+233 50 938 8934"
        valid = CartCheckoutSerializer(data=payload)
        self.assertTrue(valid.is_valid(), valid.errors)
        self.assertEqual(valid.validated_data["buyer_email"], "reader@example.com")


class PaystackSignatureTests(SimpleTestCase):
    @override_settings(PAYSTACK_SECRET_KEY="secret")
    def test_signature_is_verified_with_sha512(self):
        body = b'{"event":"charge.success"}'
        signature = hmac.new(b"secret", body, hashlib.sha512).hexdigest()
        self.assertTrue(valid_webhook_signature(body, signature))
        self.assertFalse(valid_webhook_signature(body, "wrong"))


class OrderEmailTests(TestCase):
    @patch("apps.magazine.emails.send_order_confirmation")
    def test_paid_transition_schedules_one_confirmation(self, send_confirmation):
        order = Order.objects.create(email="reader@example.com", amount="10.00", payment_reference="paid-order")
        with self.captureOnCommitCallbacks(execute=True):
            self.assertTrue(mark_order_paid("paid-order"))
        with self.captureOnCommitCallbacks(execute=True):
            self.assertTrue(mark_order_paid("paid-order"))
        send_confirmation.assert_called_once_with(order.pk)

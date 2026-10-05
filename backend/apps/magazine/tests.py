import hashlib
import hmac

from django.test import SimpleTestCase, override_settings

from glitz_backend.paystack_client import valid_webhook_signature
from .checkout import CartCheckoutSerializer


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


class PaystackSignatureTests(SimpleTestCase):
    @override_settings(PAYSTACK_SECRET_KEY="secret")
    def test_signature_is_verified_with_sha512(self):
        body = b'{"event":"charge.success"}'
        signature = hmac.new(b"secret", body, hashlib.sha512).hexdigest()
        self.assertTrue(valid_webhook_signature(body, signature))
        self.assertFalse(valid_webhook_signature(body, "wrong"))

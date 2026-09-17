"""Thin Paystack REST client. No SDK dependency — two JSON endpoints and an
HMAC signature check cover everything the plan's payment flow needs.
"""

import hashlib
import hmac

import requests
from django.conf import settings

PAYSTACK_BASE_URL = "https://api.paystack.co"
REQUEST_TIMEOUT = 10


class PaystackError(Exception):
    pass


def _headers():
    if not settings.PAYSTACK_SECRET_KEY:
        raise PaystackError("PAYSTACK_SECRET_KEY is not configured.")
    return {
        "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
        "Content-Type": "application/json",
    }


def initialize_transaction(*, email, amount_kobo, reference, callback_url, metadata=None):
    resp = requests.post(
        f"{PAYSTACK_BASE_URL}/transaction/initialize",
        json={
            "email": email,
            "amount": amount_kobo,
            "reference": reference,
            "callback_url": callback_url,
            "metadata": metadata or {},
        },
        headers=_headers(),
        timeout=REQUEST_TIMEOUT,
    )
    data = resp.json()
    if not resp.ok or not data.get("status"):
        raise PaystackError(data.get("message", "Paystack initialization failed."))
    return data["data"]


def verify_transaction(reference):
    resp = requests.get(
        f"{PAYSTACK_BASE_URL}/transaction/verify/{reference}",
        headers=_headers(),
        timeout=REQUEST_TIMEOUT,
    )
    data = resp.json()
    if not resp.ok or not data.get("status"):
        raise PaystackError(data.get("message", "Paystack verification failed."))
    return data["data"]


def verify_webhook_signature(raw_body: bytes, signature: str) -> bool:
    """Per Paystack's docs: HMAC-SHA512 of the raw request body, keyed with
    the secret key, hex-encoded, compared against X-Paystack-Signature."""
    if not settings.PAYSTACK_SECRET_KEY or not signature:
        return False
    computed = hmac.new(
        settings.PAYSTACK_SECRET_KEY.encode("utf-8"), raw_body, hashlib.sha512
    ).hexdigest()
    return hmac.compare_digest(computed, signature)

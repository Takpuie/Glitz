import hashlib
import hmac

import requests
from django.conf import settings


class PaystackError(Exception):
    pass


def _headers():
    if not settings.PAYSTACK_SECRET_KEY:
        raise PaystackError("Paystack is not configured yet.")
    return {"Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}", "Content-Type": "application/json"}


def initialize_transaction(*, email, amount, reference, callback_url, metadata):
    try:
        response = requests.post("https://api.paystack.co/transaction/initialize", headers=_headers(), json={
            "email": email, "amount": amount, "currency": "GHS", "reference": reference,
            "callback_url": callback_url, "metadata": metadata,
        }, timeout=15)
        payload = response.json()
        response.raise_for_status()
        if not payload.get("status") or not payload.get("data", {}).get("authorization_url"):
            raise PaystackError(payload.get("message", "Paystack could not initialize the payment."))
        return payload["data"]
    except requests.RequestException as exc:
        raise PaystackError("Paystack could not initialize the payment.") from exc


def verify_transaction(reference):
    try:
        response = requests.get(f"https://api.paystack.co/transaction/verify/{reference}", headers=_headers(), timeout=15)
        payload = response.json()
        response.raise_for_status()
        return payload.get("data", {}) if payload.get("status") else {}
    except requests.RequestException as exc:
        raise PaystackError("Paystack could not verify the payment.") from exc


def valid_webhook_signature(body, signature):
    if not settings.PAYSTACK_SECRET_KEY or not signature:
        return False
    expected = hmac.new(settings.PAYSTACK_SECRET_KEY.encode(), body, hashlib.sha512).hexdigest()
    return hmac.compare_digest(expected, signature)

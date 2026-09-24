"""Thin wrapper around the official Stripe SDK. Stripe Checkout (a
Stripe-hosted payment page) covers the whole flow the plan needs — create
a Session, redirect the browser to its url, verify on the way back.
"""

import stripe
from django.conf import settings


class StripeError(Exception):
    pass


def _configure():
    if not settings.STRIPE_SECRET_KEY:
        raise StripeError("STRIPE_SECRET_KEY is not configured.")
    stripe.api_key = settings.STRIPE_SECRET_KEY


def create_checkout_session(*, email, currency, line_items, success_url, cancel_url, metadata=None):
    """Creates a Stripe Checkout Session and returns it. `session.id` is
    what we store as our own reference — Stripe generates it, we don't get
    to pick it the way Paystack let us.

    `line_items` is our own simplified shape: a list of
    {name, unit_amount, quantity} — one per cart line — translated here
    into Stripe's price_data structure so callers don't need to know it."""
    _configure()
    try:
        return stripe.checkout.Session.create(
            mode="payment",
            payment_method_types=["card"],
            customer_email=email,
            line_items=[
                {
                    "price_data": {
                        "currency": currency,
                        "unit_amount": item["unit_amount"],
                        "product_data": {"name": item["name"]},
                    },
                    "quantity": item["quantity"],
                }
                for item in line_items
            ],
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata or {},
        )
    except stripe.error.StripeError as exc:
        raise StripeError(str(exc)) from exc


def retrieve_checkout_session(session_id):
    _configure()
    try:
        return stripe.checkout.Session.retrieve(session_id)
    except stripe.error.StripeError as exc:
        raise StripeError(str(exc)) from exc


def verify_webhook_event(raw_body: bytes, signature: str):
    """Verifies and parses a Stripe webhook payload. Returns the parsed
    Event on success, None if the signature is missing/invalid or the
    webhook secret isn't configured — mirrors the boolean-ish contract the
    old Paystack HMAC check had, but Stripe's SDK does signature check and
    JSON parsing together, so this returns the already-parsed event."""
    if not settings.STRIPE_WEBHOOK_SECRET or not signature:
        return None
    try:
        return stripe.Webhook.construct_event(raw_body, signature, settings.STRIPE_WEBHOOK_SECRET)
    except (ValueError, stripe.error.SignatureVerificationError):
        return None

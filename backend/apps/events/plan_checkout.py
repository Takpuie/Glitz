"""On-site checkout for payment plans (e.g. the Marrakech Retreat).

Flow: register (creates a PlanRegistration and a pending InstallmentPayment
for the amount due now) → the browser pays on the Glitz site with Stripe's
Payment Element or Paystack's Inline popup → the webhook (source of truth)
or the verify endpoint (belt and braces, idempotent) marks it paid.

Later installments are paid from a private manage link, keyed by
PlanRegistration.manage_token. The browser never decides that a payment
succeeded: verify and the webhooks ask the provider and check the exact
amount and currency.
"""

import hashlib
import logging
import secrets

from django.conf import settings
from django.core.cache import cache
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import serializers
from rest_framework.exceptions import Throttled
from rest_framework.response import Response
from rest_framework.views import APIView

from glitz_backend.paystack_client import PaystackError, initialize_transaction, verify_transaction
from glitz_backend.request_security import require_frontend_origin
from glitz_backend.stripe_client import StripeError, create_payment_intent, retrieve_payment_intent
from .models import Event, InstallmentPayment, PaymentPlan, PlanRegistration

logger = logging.getLogger(__name__)

PROVIDERS = ("stripe", "paystack")


def enabled_providers():
    providers = []
    if settings.STRIPE_SECRET_KEY and settings.STRIPE_PUBLISHABLE_KEY:
        providers.append("stripe")
    if settings.PAYSTACK_SECRET_KEY and settings.PAYSTACK_PUBLIC_KEY:
        providers.append("paystack")
    return providers


def _clean_text(value):
    value = value.strip()
    if any(ord(char) < 32 for char in value):
        raise serializers.ValidationError("Enter a valid value.")
    return value


class PlanRegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.RegexField(r"^[+\d][\d\s()\-]{5,38}$", max_length=40, required=False, allow_blank=True)
    provider = serializers.ChoiceField(choices=PROVIDERS)

    def validate_name(self, value):
        return _clean_text(value)

    def validate_email(self, value):
        return value.strip().lower()


class PlanPaySerializer(serializers.Serializer):
    provider = serializers.ChoiceField(choices=PROVIDERS)
    pay_all = serializers.BooleanField(default=False)


def _throttle(email):
    key = "checkout:plan:" + hashlib.sha256(email.encode()).hexdigest()
    cache.add(key, 0, 3600)
    try:
        count = cache.incr(key)
    except ValueError:
        cache.set(key, 1, 3600)
        count = 1
    if count > 10:
        raise Throttled(wait=3600)


def _money(value):
    return f"{value:.2f}"


def registration_payload(registration):
    today = timezone.localdate()
    plan = registration.plan
    return {
        "event": {"name": registration.event.name, "slug": registration.event.slug},
        "plan": {"id": plan.pk, "name": plan.name, "currency": plan.currency, "total": _money(plan.total)},
        "name": registration.name,
        "status": registration.status,
        "amount_paid": _money(registration.amount_paid),
        "balance": _money(registration.balance),
        "amount_due_now": _money(registration.amount_due_now(today)),
        "schedule": [
            {
                "label": row["label"],
                "amount": _money(row["amount"]),
                "due_date": row["due_date"].isoformat(),
                "paid": row["paid"],
                "overdue": row["overdue"],
            }
            for row in registration.schedule(today)
        ],
        "payments": [
            {"amount": _money(p.amount), "currency": p.currency, "paid_at": p.paid_at, "provider": p.provider}
            for p in registration.payments.all()
            if p.status == InstallmentPayment.Status.PAID
        ],
        "providers": enabled_providers(),
    }


def _start_payment(registration, amount, provider):
    """Creates a pending InstallmentPayment and the provider transaction,
    returning only what the browser needs to show the payment form."""
    if provider not in enabled_providers():
        return Response({"detail": "This payment method is not available yet. Please choose another."}, status=400)
    if amount <= 0:
        return Response({"detail": "Nothing is due on this registration."}, status=409)

    plan = registration.plan
    payment = InstallmentPayment.objects.create(
        registration=registration, amount=amount, currency=plan.currency,
        provider=provider, status=InstallmentPayment.Status.PENDING,
    )
    metadata = {
        "installment_payment_id": payment.pk,
        "registration_id": registration.pk,
        "event_slug": registration.event.slug,
    }
    description = f"{registration.event.name} — {plan.name}"
    try:
        if provider == "stripe":
            intent = create_payment_intent(
                amount=payment.amount_minor, currency=plan.currency, email=registration.email,
                description=description, metadata=metadata,
            )
            payment.reference = intent.id
            extra = {"client_secret": intent.client_secret, "publishable_key": settings.STRIPE_PUBLISHABLE_KEY}
        else:
            data = initialize_transaction(
                email=registration.email, amount=payment.amount_minor,
                reference="glitz-plan-" + secrets.token_urlsafe(24),
                callback_url=f"{settings.FRONTEND_BASE_URL.rstrip('/')}/events/{registration.event.slug}/registration/callback",
                metadata=metadata, currency=plan.currency,
            )
            payment.reference = data["reference"]
            extra = {"access_code": data["access_code"], "public_key": settings.PAYSTACK_PUBLIC_KEY}
    except (StripeError, PaystackError) as exc:
        payment.status = InstallmentPayment.Status.CANCELLED
        payment.save(update_fields=["status"])
        logger.warning("Plan payment could not start (%s): %s", provider, exc)
        return Response({"detail": str(exc)}, status=502)

    payment.save(update_fields=["reference"])
    return Response({
        "reference": payment.reference,
        "provider": provider,
        "amount": _money(payment.amount),
        "currency": payment.currency,
        "manage_token": registration.manage_token,
        **extra,
    }, status=201)


def mark_plan_payment_paid(reference, *, amount_minor=None, currency=None):
    """Idempotent. Returns True if the reference belongs to a plan payment
    (paid or not), so the shared webhooks know not to look elsewhere.

    When the caller passes the provider-reported amount and currency, both
    must match what this payment was created for, or nothing is recorded."""
    with transaction.atomic():
        payment = InstallmentPayment.objects.select_for_update().filter(reference=reference).first()
        if not payment:
            return False
        if amount_minor is not None and (
            int(amount_minor) != payment.amount_minor or (currency or "").upper() != payment.currency.upper()
        ):
            logger.warning(
                "Plan payment %s reported %s %s, expected %s %s — not recorded.",
                reference, currency, amount_minor, payment.currency, payment.amount_minor,
            )
            return True
        # A payment cancelled as stale can still complete afterwards; record it.
        if payment.status != InstallmentPayment.Status.PAID:
            payment.status = InstallmentPayment.Status.PAID
            payment.paid_at = timezone.now()
            payment.save(update_fields=["status", "paid_at"])  # Also refreshes the registration status.
            from .emails import send_plan_payment_confirmation
            transaction.on_commit(lambda payment_id=payment.pk: send_plan_payment_confirmation(payment_id))
    return True


def _registration(token):
    return get_object_or_404(
        PlanRegistration.objects.select_related("event", "plan").prefetch_related("plan__installments", "payments"),
        manage_token=token,
    )


class PlanRegisterView(APIView):
    """POST /api/events/<slug>/plans/<plan_id>/register/"""

    permission_classes = []
    authentication_classes = []

    def post(self, request, slug, plan_id):
        require_frontend_origin(request)
        event = get_object_or_404(Event, slug=slug)
        plan = get_object_or_404(PaymentPlan.objects.prefetch_related("installments"), pk=plan_id, event=event)
        if not plan.is_open():
            return Response({"detail": "This payment option is no longer available."}, status=409)
        serializer = PlanRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        _throttle(data["email"])

        registration = PlanRegistration.objects.create(
            event=event, plan=plan, name=data["name"], email=data["email"], phone=data.get("phone", ""),
        )
        return _start_payment(registration, registration.amount_due_now(), data["provider"])


class PlanRegistrationView(APIView):
    """GET /api/plan-registrations/<token>/ — the registrant's own schedule."""

    permission_classes = []
    authentication_classes = []

    def get(self, request, token):
        return Response(registration_payload(_registration(token)))


class PlanRegistrationPayView(APIView):
    """POST /api/plan-registrations/<token>/pay/ — pays the amount due now,
    or the whole balance with pay_all."""

    permission_classes = []
    authentication_classes = []

    def post(self, request, token):
        require_frontend_origin(request)
        registration = _registration(token)
        if registration.status == PlanRegistration.Status.CANCELLED:
            return Response({"detail": "This registration has been cancelled. Please contact the team."}, status=409)
        serializer = PlanPaySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        _throttle(registration.email)
        amount = registration.balance if data["pay_all"] else registration.amount_due_now()
        return _start_payment(registration, amount, data["provider"])


class PlanPaymentVerifyView(APIView):
    """GET /api/plan-payments/verify/<reference>/ — asks the provider directly
    if the payment is still pending, so a slow webhook never strands the
    buyer on a spinner."""

    permission_classes = []
    authentication_classes = []

    def get(self, request, reference):
        payment = get_object_or_404(InstallmentPayment.objects.select_related("registration"), reference=reference)
        if payment.status != InstallmentPayment.Status.PAID and payment.provider in PROVIDERS:
            try:
                if payment.provider == "stripe":
                    intent = retrieve_payment_intent(reference)
                    if intent.status == "succeeded":
                        mark_plan_payment_paid(reference, amount_minor=intent.amount_received, currency=intent.currency)
                else:
                    data = verify_transaction(reference)
                    if data.get("status") == "success":
                        mark_plan_payment_paid(reference, amount_minor=data.get("amount") or 0, currency=data.get("currency") or "")
            except (StripeError, PaystackError):
                pass
            payment.refresh_from_db()
        registration = PlanRegistration.objects.get(pk=payment.registration_id)
        return Response({
            "status": payment.status,
            "amount": _money(payment.amount),
            "currency": payment.currency,
            "manage_token": registration.manage_token,
            "event_slug": registration.event.slug,
            "registration_status": registration.status,
            "balance": _money(registration.balance),
        })

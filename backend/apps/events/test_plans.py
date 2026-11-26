from datetime import date, datetime, timezone as dt_timezone
from decimal import Decimal
from io import StringIO
from types import SimpleNamespace
from unittest.mock import patch

from django.conf import settings
from django.core import mail
from django.core.management import call_command
from django.test import TestCase, override_settings
from django.urls import reverse

from .api import EventSerializer
from .models import (
    Event, InstallmentPayment, InstallmentReminder, PaymentPlan, PlanInstallment, PlanRegistration, add_months,
)
from .plan_checkout import mark_plan_payment_paid

KEYS = dict(
    STRIPE_SECRET_KEY="sk_test", STRIPE_PUBLISHABLE_KEY="pk_test",
    PAYSTACK_SECRET_KEY="ps_secret", PAYSTACK_PUBLIC_KEY="ps_public",
)


def at(day):
    return datetime(day.year, day.month, day.day, 12, tzinfo=dt_timezone.utc)


class PlanTestBase(TestCase):
    def setUp(self):
        self.event = Event.objects.create(
            name="SheBoss Global Marrakech Retreat 2027", slug="retreat", start_date=date(2027, 2, 3),
        )
        self.monthly = PaymentPlan.objects.create(
            event=self.event, name="Monthly installments", currency="USD",
            available_until=date(2027, 1, 22), final_deadline=date(2027, 1, 22), display_order=2,
        )
        for i, label in enumerate(["First", "Second", "Third"]):
            PlanInstallment.objects.create(
                plan=self.monthly, label=f"{label} installment", amount=Decimal("1184"),
                months_after_signup=i, sort_order=i,
            )
        self.early = PaymentPlan.objects.create(
            event=self.event, name="Early Bird", currency="USD", available_until=date(2026, 12, 15),
        )
        PlanInstallment.objects.create(plan=self.early, label="Full payment", amount=Decimal("3300"))

    def register(self, plan=None, signup=date(2026, 11, 30), **extra):
        return PlanRegistration.objects.create(
            event=self.event, plan=plan or self.monthly, name="Ama Mensah", email="ama@example.com",
            created_at=at(signup), **extra,
        )

    def pay(self, registration, amount, provider="manual"):
        return InstallmentPayment.objects.create(
            registration=registration, amount=Decimal(amount), provider=provider,
            status=InstallmentPayment.Status.PAID,
        )


class ScheduleTests(PlanTestBase):
    def test_add_months_clamps_to_month_end(self):
        self.assertEqual(add_months(date(2027, 1, 31), 1), date(2027, 2, 28))
        self.assertEqual(add_months(date(2026, 12, 15), 1), date(2027, 1, 15))

    def test_due_dates_are_monthly_from_signup_and_capped_at_final_deadline(self):
        reg = self.register(signup=date(2026, 11, 30))
        dues = [row["due_date"] for row in reg.schedule(date(2026, 11, 30))]
        self.assertEqual(dues, [date(2026, 11, 30), date(2026, 12, 30), date(2027, 1, 22)])

    def test_late_signup_squeezes_into_final_deadline(self):
        reg = self.register(signup=date(2027, 1, 20))
        dues = [row["due_date"] for row in reg.schedule(date(2027, 1, 20))]
        self.assertEqual(dues, [date(2027, 1, 20), date(2027, 1, 22), date(2027, 1, 22)])

    def test_amount_due_now_is_next_installment_or_catch_up(self):
        reg = self.register(signup=date(2026, 11, 30))
        self.assertEqual(reg.amount_due_now(date(2026, 11, 30)), Decimal("1184"))
        self.pay(reg, "1184")
        reg = PlanRegistration.objects.get(pk=reg.pk)
        self.assertEqual(reg.status, PlanRegistration.Status.ACTIVE)
        # Not yet due: the next installment is offered.
        self.assertEqual(reg.amount_due_now(date(2026, 12, 10)), Decimal("1184"))
        # Both remaining installments overdue: catch-up.
        self.assertEqual(reg.amount_due_now(date(2027, 1, 23)), Decimal("2368"))
        rows = reg.schedule(date(2027, 1, 23))
        self.assertEqual([r["paid"] for r in rows], [True, False, False])
        self.assertEqual([r["overdue"] for r in rows], [False, True, True])

    def test_part_payment_is_respected(self):
        reg = self.register()
        self.pay(reg, "1000")
        reg = PlanRegistration.objects.get(pk=reg.pk)
        self.assertEqual(reg.amount_due_now(date(2026, 12, 1)), Decimal("184"))
        self.assertEqual(reg.balance, Decimal("2552"))

    def test_manual_payments_complete_the_registration(self):
        reg = self.register()
        self.pay(reg, "3552")
        reg.save()
        reg.refresh_from_db()
        self.assertEqual(reg.status, PlanRegistration.Status.COMPLETE)
        self.assertEqual(reg.amount_due_now(), Decimal("0"))

    def test_cancelled_status_is_never_overwritten(self):
        reg = self.register(status=PlanRegistration.Status.CANCELLED)
        self.pay(reg, "1184")
        reg.save()
        reg.refresh_from_db()
        self.assertEqual(reg.status, PlanRegistration.Status.CANCELLED)

    def test_plan_availability(self):
        self.assertTrue(self.early.is_open(date(2026, 12, 15)))
        self.assertFalse(self.early.is_open(date(2026, 12, 16)))

    def test_api_lists_only_open_plans(self):
        with patch("apps.events.api.timezone.localdate", return_value=date(2026, 12, 20)):
            data = EventSerializer(self.event).data
        self.assertEqual([p["name"] for p in data["payment_plans"]], ["Monthly installments"])
        self.assertEqual(data["payment_plans"][0]["total"], "3552.00")


@override_settings(**KEYS)
class CheckoutViewTests(PlanTestBase):
    def post(self, url, payload):
        return self.client.post(url, payload, content_type="application/json", HTTP_ORIGIN=settings.FRONTEND_BASE_URL)

    def register_url(self, plan):
        return reverse("plan-register", args=[self.event.slug, plan.pk])

    @patch("apps.events.plan_checkout.create_payment_intent")
    def test_register_with_stripe_returns_only_client_secret(self, create_intent):
        create_intent.return_value = SimpleNamespace(id="pi_123", client_secret="pi_123_secret_abc")
        response = self.post(self.register_url(self.monthly), {
            "name": "Ama Mensah", "email": " AMA@Example.com ", "phone": "+233 553 540 970", "provider": "stripe",
        })
        self.assertEqual(response.status_code, 201, response.content)
        body = response.json()
        self.assertEqual(body["client_secret"], "pi_123_secret_abc")
        self.assertEqual(body["publishable_key"], "pk_test")
        self.assertEqual(body["amount"], "1184.00")
        self.assertNotIn("sk_test", response.content.decode())
        self.assertEqual(create_intent.call_args.kwargs["amount"], 118400)
        self.assertEqual(create_intent.call_args.kwargs["currency"], "USD")
        payment = InstallmentPayment.objects.get(reference="pi_123")
        self.assertEqual(payment.status, InstallmentPayment.Status.PENDING)
        self.assertEqual(payment.registration.email, "ama@example.com")

    @patch("apps.events.plan_checkout.initialize_transaction")
    def test_register_with_paystack_uses_plan_currency(self, initialize):
        initialize.return_value = {"reference": "glitz-plan-x", "access_code": "acc_1", "authorization_url": "https://x"}
        response = self.post(self.register_url(self.monthly), {
            "name": "Ama Mensah", "email": "ama@example.com", "provider": "paystack",
        })
        self.assertEqual(response.status_code, 201, response.content)
        self.assertEqual(response.json()["access_code"], "acc_1")
        self.assertEqual(initialize.call_args.kwargs["currency"], "USD")
        self.assertEqual(initialize.call_args.kwargs["amount"], 118400)

    def test_closed_plan_is_rejected(self):
        with patch("apps.events.models.timezone.localdate", return_value=date(2026, 12, 16)):
            response = self.post(self.register_url(self.early), {
                "name": "Ama Mensah", "email": "ama@example.com", "provider": "stripe",
            })
        self.assertEqual(response.status_code, 409)
        self.assertFalse(PlanRegistration.objects.exists())

    @override_settings(STRIPE_SECRET_KEY="", STRIPE_PUBLISHABLE_KEY="")
    def test_unconfigured_provider_is_rejected(self):
        response = self.post(self.register_url(self.monthly), {
            "name": "Ama Mensah", "email": "ama@example.com", "provider": "stripe",
        })
        self.assertEqual(response.status_code, 400)

    def test_control_characters_are_rejected(self):
        response = self.post(self.register_url(self.monthly), {
            "name": "Ama\nInjected", "email": "ama@example.com", "provider": "stripe",
        })
        self.assertEqual(response.status_code, 400)

    @patch("apps.events.plan_checkout.create_payment_intent")
    def test_pay_all_charges_the_balance(self, create_intent):
        create_intent.return_value = SimpleNamespace(id="pi_all", client_secret="s")
        reg = self.register()
        self.pay(reg, "1184")
        url = reverse("plan-registration-pay", args=[reg.manage_token])
        response = self.post(url, {"provider": "stripe", "pay_all": True})
        self.assertEqual(response.status_code, 201, response.content)
        self.assertEqual(create_intent.call_args.kwargs["amount"], 236800)

    def test_pay_rejected_when_nothing_due(self):
        reg = self.register()
        self.pay(reg, "3552")
        response = self.post(reverse("plan-registration-pay", args=[reg.manage_token]), {"provider": "stripe"})
        self.assertEqual(response.status_code, 409)

    def test_status_endpoint_returns_schedule(self):
        reg = self.register()
        self.pay(reg, "1184")
        response = self.client.get(reverse("plan-registration", args=[reg.manage_token]))
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["amount_paid"], "1184.00")
        self.assertEqual(body["balance"], "2368.00")
        self.assertEqual(len(body["schedule"]), 3)
        self.assertNotIn("staff_notes", body)
        self.assertEqual(self.client.get(reverse("plan-registration", args=["wrong"])).status_code, 404)

    @patch("apps.events.plan_checkout.retrieve_payment_intent")
    def test_verify_checks_the_provider_amount(self, retrieve):
        reg = self.register()
        InstallmentPayment.objects.create(
            registration=reg, amount=Decimal("1184"), provider="stripe", reference="pi_v",
            status=InstallmentPayment.Status.PENDING,
        )
        retrieve.return_value = SimpleNamespace(status="succeeded", amount_received=100, currency="usd")
        body = self.client.get(reverse("plan-payment-verify", args=["pi_v"])).json()
        self.assertEqual(body["status"], "pending")  # Wrong amount: not recorded.

        retrieve.return_value = SimpleNamespace(status="succeeded", amount_received=118400, currency="usd")
        with self.captureOnCommitCallbacks(execute=True):
            body = self.client.get(reverse("plan-payment-verify", args=["pi_v"])).json()
        self.assertEqual(body["status"], "paid")
        self.assertEqual(body["registration_status"], "active")
        self.assertEqual(body["manage_token"], reg.manage_token)


class MarkPaidTests(PlanTestBase):
    def pending(self, reg, reference, amount="1184"):
        return InstallmentPayment.objects.create(
            registration=reg, amount=Decimal(amount), provider="stripe", reference=reference,
            status=InstallmentPayment.Status.PENDING,
        )

    @patch("apps.events.emails.send_plan_payment_confirmation")
    def test_idempotent_with_one_email(self, send):
        reg = self.register()
        payment = self.pending(reg, "pi_1")
        for _ in range(2):
            with self.captureOnCommitCallbacks(execute=True):
                self.assertTrue(mark_plan_payment_paid("pi_1", amount_minor=118400, currency="usd"))
        send.assert_called_once_with(payment.pk)
        reg.refresh_from_db()
        self.assertEqual(reg.status, PlanRegistration.Status.ACTIVE)

    def test_unknown_reference_is_not_claimed(self):
        self.assertFalse(mark_plan_payment_paid("cs_ticket_session"))

    def test_wrong_currency_is_not_recorded(self):
        reg = self.register()
        payment = self.pending(reg, "pi_2")
        self.assertTrue(mark_plan_payment_paid("pi_2", amount_minor=118400, currency="ghs"))
        payment.refresh_from_db()
        self.assertEqual(payment.status, InstallmentPayment.Status.PENDING)

    @patch("apps.events.emails.send_plan_payment_confirmation")
    def test_cancelled_stale_payment_still_records_when_it_succeeds(self, send):
        reg = self.register()
        payment = self.pending(reg, "pi_3")
        payment.status = InstallmentPayment.Status.CANCELLED
        payment.save()
        with self.captureOnCommitCallbacks(execute=True):
            mark_plan_payment_paid("pi_3", amount_minor=118400, currency="USD")
        payment.refresh_from_db()
        self.assertEqual(payment.status, InstallmentPayment.Status.PAID)

    @override_settings(AUTH_EMAIL_ENABLED=True, OPERATIONS_EMAILS=["ops@example.com"])
    def test_confirmation_email_contents(self):
        reg = self.register()
        self.pending(reg, "pi_4")
        with self.captureOnCommitCallbacks(execute=True):
            mark_plan_payment_paid("pi_4", amount_minor=118400, currency="USD")
        customer = next(m for m in mail.outbox if m.to == ["ama@example.com"])
        self.assertIn("USD 1,184.00", customer.body)
        self.assertIn("Balance: USD 2,368.00", customer.body)
        self.assertIn(reg.manage_token, customer.body)
        self.assertIn("flights and accommodation are not included", customer.body)
        self.assertTrue(any(m.to == ["ops@example.com"] for m in mail.outbox))


@override_settings(STRIPE_WEBHOOK_SECRET="whsec", PAYSTACK_SECRET_KEY="ps_secret")
class WebhookTests(PlanTestBase):
    @patch("apps.events.emails.send_plan_payment_confirmation")
    @patch("glitz_backend.webhooks.verify_webhook_event")
    def test_stripe_payment_intent_succeeded(self, verify, send):
        reg = self.register()
        InstallmentPayment.objects.create(
            registration=reg, amount=Decimal("1184"), provider="stripe", reference="pi_w",
            status=InstallmentPayment.Status.PENDING,
        )
        verify.return_value = {"type": "payment_intent.succeeded", "data": {"object": {
            "id": "pi_w", "amount_received": 118400, "currency": "usd",
        }}}
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(reverse("stripe-webhook"), b"{}", content_type="application/json", HTTP_STRIPE_SIGNATURE="sig")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(InstallmentPayment.objects.get(reference="pi_w").status, InstallmentPayment.Status.PAID)

    @patch("apps.events.emails.send_plan_payment_confirmation")
    @patch("glitz_backend.webhooks.valid_webhook_signature", return_value=True)
    def test_paystack_charge_success(self, _valid, send):
        reg = self.register()
        InstallmentPayment.objects.create(
            registration=reg, amount=Decimal("1184"), provider="paystack", reference="glitz-plan-w",
            status=InstallmentPayment.Status.PENDING,
        )
        payload = {"event": "charge.success", "data": {"reference": "glitz-plan-w", "amount": 118400, "currency": "USD"}}
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(reverse("paystack-webhook"), payload, content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(InstallmentPayment.objects.get(reference="glitz-plan-w").status, InstallmentPayment.Status.PAID)


@override_settings(AUTH_EMAIL_ENABLED=True, OPERATIONS_EMAILS=["ops@example.com"])
class ReminderTests(PlanTestBase):
    def run_on(self, day):
        call_command("send_installment_reminders", date=day, stdout=StringIO())

    def test_each_reminder_sends_once(self):
        reg = self.register(signup=date(2026, 11, 30))
        self.pay(reg, "1184")  # Second installment due 30 Dec.
        self.run_on(date(2026, 12, 25))
        self.run_on(date(2026, 12, 26))
        self.assertEqual(len([m for m in mail.outbox if m.to == ["ama@example.com"]]), 1)
        self.assertTrue(InstallmentReminder.objects.filter(kind="week_before").exists())

        self.run_on(date(2026, 12, 29))
        self.assertTrue(InstallmentReminder.objects.filter(kind="day_before").exists())

        mail.outbox.clear()
        self.run_on(date(2027, 1, 2))
        self.run_on(date(2027, 1, 3))
        overdue = [m for m in mail.outbox if m.to == ["ama@example.com"]]
        self.assertEqual(len(overdue), 1)
        self.assertIn("overdue", overdue[0].subject.lower())
        self.assertTrue(any(m.to == ["ops@example.com"] for m in mail.outbox))

    def test_unpaid_and_complete_registrations_are_skipped(self):
        self.register(signup=date(2026, 11, 30))  # Never paid: pending.
        done = self.register(signup=date(2026, 11, 30))
        self.pay(done, "3552")
        done.save()
        self.run_on(date(2026, 12, 29))
        self.assertEqual(len(mail.outbox), 0)

    @override_settings(AUTH_EMAIL_ENABLED=False)
    def test_reminder_retried_when_email_is_off(self):
        reg = self.register(signup=date(2026, 11, 30))
        self.pay(reg, "1184")
        self.run_on(date(2026, 12, 25))
        self.assertFalse(InstallmentReminder.objects.exists())

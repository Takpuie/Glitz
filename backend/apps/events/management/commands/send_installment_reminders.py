"""Emails registrants about upcoming and overdue installments.

Run once a day (TechNE Cron Jobs), e.g. 08:00:
    python manage.py send_installment_reminders

For each registration that is part-paid, it looks at the next unpaid
installment and sends at most one of each reminder kind for it:
  - 7 days before (sent when the due date is 2–7 days away)
  - 1 day before  (due tomorrow or today)
  - overdue       (past due; the operations team is copied)
InstallmentReminder rows make re-runs safe: nothing is sent twice.
"""

from datetime import date

from django.core.management.base import BaseCommand
from django.db import IntegrityError, transaction
from django.utils import timezone

from apps.events.emails import send_installment_reminder
from apps.events.models import InstallmentReminder, PlanRegistration


def reminder_kind(days_until_due):
    if days_until_due < 0:
        return InstallmentReminder.Kind.OVERDUE
    if days_until_due <= 1:
        return InstallmentReminder.Kind.DAY_BEFORE
    if days_until_due <= 7:
        return InstallmentReminder.Kind.WEEK_BEFORE
    return None


class Command(BaseCommand):
    help = "Send installment reminders (7 days before, 1 day before, overdue)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--date", type=date.fromisoformat, default=None,
            help="Act as if today were this date (YYYY-MM-DD). For testing only.",
        )

    def handle(self, *args, **options):
        today = options["date"] or timezone.localdate()
        sent = 0
        registrations = (
            PlanRegistration.objects.filter(status=PlanRegistration.Status.ACTIVE)
            .select_related("event", "plan")
            .prefetch_related("plan__installments", "payments")
        )
        for registration in registrations:
            row = registration.next_due(today)
            if not row:
                continue
            kind = reminder_kind((row["due_date"] - today).days)
            if not kind:
                continue
            try:
                with transaction.atomic():
                    reminder = InstallmentReminder.objects.create(
                        registration=registration, installment=row["installment"], kind=kind,
                    )
            except IntegrityError:
                continue  # Already sent.
            if send_installment_reminder(registration, row, kind, today=today):
                sent += 1
            else:
                reminder.delete()  # Email off or failed: try again on the next run.
        self.stdout.write(self.style.SUCCESS(f"Sent {sent} installment reminder(s)."))

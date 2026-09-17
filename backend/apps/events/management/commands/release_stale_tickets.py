"""Cancels pending tickets whose checkout was abandoned, so their seat
frees back up in TicketType.remaining. A pending ticket holds a seat the
moment checkout starts (see TicketType.sold_count) — without this, someone
who opens checkout and never pays would permanently shrink capacity.

Intended to run on a schedule (TechNE Cron Jobs, per the build plan) —
not on every request.
"""

from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.events.models import Ticket

STALE_AFTER = timedelta(minutes=30)


class Command(BaseCommand):
    help = "Cancel pending tickets older than 30 minutes so their seat is released."

    def handle(self, *args, **options):
        cutoff = timezone.now() - STALE_AFTER
        stale = Ticket.objects.filter(status=Ticket.Status.PENDING, created_at__lt=cutoff)
        count = stale.count()
        stale.update(status=Ticket.Status.CANCELLED)
        self.stdout.write(self.style.SUCCESS(f"Released {count} stale pending ticket(s)."))

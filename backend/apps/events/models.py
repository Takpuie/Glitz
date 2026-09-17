import secrets

from django.conf import settings
from django.db import models
from modelcluster.fields import ParentalKey
from modelcluster.models import ClusterableModel
from wagtail.admin.panels import FieldPanel, InlinePanel
from wagtail.api import APIField
from wagtail.images.api.fields import ImageRenditionField
from wagtail.snippets.models import register_snippet


@register_snippet
class Event(ClusterableModel):
    class Status(models.TextChoices):
        ON_SALE = "on_sale", "On sale"
        APPLICATIONS_OPEN = "applications_open", "Applications open"
        SAVE_THE_DATE = "save_the_date", "Save the date"
        ARCHIVED = "archived", "Archived"

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    tagline = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    venue = models.CharField(max_length=255, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.SAVE_THE_DATE)
    cover_image = models.ForeignKey(
        "wagtailimages.Image", null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )

    panels = [
        FieldPanel("name"),
        FieldPanel("slug"),
        FieldPanel("tagline"),
        FieldPanel("description"),
        FieldPanel("venue"),
        FieldPanel("start_date"),
        FieldPanel("end_date"),
        FieldPanel("status"),
        FieldPanel("cover_image"),
        InlinePanel("ticket_types", label="Ticket types"),
        InlinePanel("gallery_items", label="Gallery"),
    ]

    api_fields = [
        APIField("slug"),
        APIField("tagline"),
        APIField("description"),
        APIField("venue"),
        APIField("start_date"),
        APIField("end_date"),
        APIField("status"),
        APIField("cover_image", serializer=ImageRenditionField("fill-1600x1000")),
        APIField("ticket_types"),
        APIField("gallery_items"),
    ]

    class Meta:
        ordering = ["start_date"]

    def __str__(self):
        return self.name


class TicketType(models.Model):
    event = ParentalKey(Event, on_delete=models.CASCADE, related_name="ticket_types")
    name = models.CharField(max_length=120)
    description = models.CharField(max_length=255, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    capacity = models.PositiveIntegerField()

    panels = [
        FieldPanel("name"),
        FieldPanel("description"),
        FieldPanel("price"),
        FieldPanel("capacity"),
    ]

    api_fields = [
        APIField("name"),
        APIField("description"),
        APIField("price"),
        APIField("capacity"),
        APIField("remaining"),
    ]

    class Meta:
        ordering = ["price"]

    def __str__(self):
        return f"{self.event.name} — {self.name}"

    @property
    def sold_count(self):
        # Counts pending tickets too, not just paid ones — a tier at its last
        # few seats must not let two concurrent checkouts both "succeed" the
        # capacity check while their payments are still in flight. Abandoned
        # pending tickets are released by the release_stale_tickets command.
        return self.tickets.filter(status__in=[Ticket.Status.PENDING, Ticket.Status.PAID]).count()

    @property
    def remaining(self):
        return max(self.capacity - self.sold_count, 0)


def generate_check_in_code():
    return secrets.token_hex(4).upper()


class Ticket(models.Model):
    """A ticket / event registration. `status` tracks the Paystack payment
    lifecycle; `check_in_code` is issued once and scanned at the door.
    """

    class Status(models.TextChoices):
        PENDING = "pending", "Pending payment"
        PAID = "paid", "Paid"
        CANCELLED = "cancelled", "Cancelled"
        REFUNDED = "refunded", "Refunded"

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="tickets")
    ticket_type = models.ForeignKey(TicketType, on_delete=models.PROTECT, related_name="tickets")
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="tickets"
    )
    buyer_name = models.CharField(max_length=150, blank=True)
    buyer_email = models.EmailField()
    paystack_reference = models.CharField(max_length=120, unique=True, null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    check_in_code = models.CharField(
        max_length=16, unique=True, default=generate_check_in_code, editable=False
    )
    checked_in_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.check_in_code} — {self.event.name} ({self.get_status_display()})"

import calendar
import secrets
from datetime import date
from decimal import Decimal

from django.conf import settings
from django.db import models
from django.utils import timezone
from modelcluster.fields import ParentalKey
from modelcluster.models import ClusterableModel
from wagtail.admin.panels import FieldPanel, InlinePanel
from wagtail.api import APIField
from wagtail.images.api.fields import ImageRenditionField
from wagtail.snippets.models import register_snippet
from wagtail.snippets.views.snippets import SnippetViewSet


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
    external_payment_url = models.URLField(
        blank=True,
        help_text="Optional hosted ticket/payment page. When set, ticket buttons send visitors here.",
    )
    external_payment_label = models.CharField(
        max_length=60, blank=True, default="Get Tickets", help_text="Button text for the external payment link."
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
        FieldPanel("external_payment_url"),
        FieldPanel("external_payment_label"),
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
        APIField("cover_image", serializer=ImageRenditionField("max-2000x2000")),
        APIField("external_payment_url"),
        APIField("external_payment_label"),
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
    """A ticket / event registration. `status` tracks the Stripe payment
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
    stripe_session_id = models.CharField(max_length=120, unique=True, null=True, blank=True)
    paystack_reference = models.CharField(max_length=120, unique=True, null=True, blank=True)
    payment_provider = models.CharField(max_length=10, choices=(("stripe", "Stripe"), ("paystack", "Paystack")), default="stripe")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    check_in_code = models.CharField(
        max_length=16, unique=True, default=generate_check_in_code, editable=False
    )
    checked_in_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    panels = [
        FieldPanel("event"),
        FieldPanel("ticket_type"),
        FieldPanel("buyer_name"),
        FieldPanel("buyer_email"),
        FieldPanel("status"),
        FieldPanel("checked_in_at"),
        FieldPanel("check_in_code", read_only=True),
        FieldPanel("stripe_session_id", read_only=True),
        FieldPanel("paystack_reference", read_only=True),
        FieldPanel("payment_provider", read_only=True),
        FieldPanel("created_at", read_only=True),
    ]

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.check_in_code} — {self.event.name} ({self.get_status_display()})"


class TicketViewSet(SnippetViewSet):
    model = Ticket
    icon = "tag"
    menu_label = "Tickets"
    menu_order = 301
    list_display = ["check_in_code", "event", "ticket_type", "buyer_name", "buyer_email", "status", "created_at"]
    list_filter = ["status", "event"]
    search_fields = ["check_in_code", "buyer_name", "buyer_email", "stripe_session_id", "paystack_reference"]
    ordering = ["-created_at"]
    list_export = [
        "id", "check_in_code", "event", "ticket_type", "buyer_name", "buyer_email",
        "payment_provider", "stripe_session_id", "paystack_reference", "status",
        "checked_in_at", "created_at",
    ]
    export_filename = "event-tickets"


class EventViewSet(SnippetViewSet):
    model = Event
    icon = "date"
    list_display = ["name", "start_date", "end_date", "venue", "status"]
    list_filter = ["status"]
    search_fields = ["name", "tagline", "venue", "description"]
    list_export = [
        "name", "slug", "tagline", "description", "venue", "start_date", "end_date",
        "status", "external_payment_url", "external_payment_label",
    ]
    export_filename = "events"


register_snippet(EventViewSet)
register_snippet(Ticket, viewset=TicketViewSet)


# ---------------------------------------------------------------------------
# Payment plans: the site's own checkout for multi-payment registrations
# (first used by the SheBoss Global Marrakech Retreat 2027, alongside Luma).
#
# A plan is a list of installments, each due a number of months after the
# person signs up, capped at the plan's final deadline. Payments are not tied
# to specific installments: installments count as covered, in order, as the
# running total of paid payments grows. That rule handles catch-up payments,
# manual bank transfers and part-payments in the same way.
# ---------------------------------------------------------------------------


def to_minor_units(amount):
    """Decimal major units (e.g. dollars) to integer minor units (cents)."""
    return int((Decimal(amount) * 100).to_integral_value())


def add_months(day: date, months: int) -> date:
    month_index = day.month - 1 + months
    year, month = day.year + month_index // 12, month_index % 12 + 1
    return date(year, month, min(day.day, calendar.monthrange(year, month)[1]))


class PaymentPlan(ClusterableModel):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="payment_plans")
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    currency = models.CharField(max_length=3, default="USD", help_text="ISO code, e.g. USD or GHS.")
    available_until = models.DateField(
        null=True, blank=True,
        help_text="Last day new registrations can choose this plan. Leave empty for no deadline.",
    )
    final_deadline = models.DateField(
        null=True, blank=True,
        help_text="No installment falls due after this date, however late someone registers.",
    )
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    panels = [
        FieldPanel("event"),
        FieldPanel("name"),
        FieldPanel("description"),
        FieldPanel("currency"),
        FieldPanel("available_until"),
        FieldPanel("final_deadline"),
        FieldPanel("display_order"),
        FieldPanel("is_active"),
        InlinePanel("installments", label="Installments", min_num=1),
    ]

    class Meta:
        ordering = ["display_order", "id"]

    def __str__(self):
        return f"{self.event.name} — {self.name}"

    @property
    def total(self):
        return sum((i.amount for i in self.installments.all()), Decimal("0"))

    def is_open(self, today=None):
        today = today or timezone.localdate()
        return self.is_active and (self.available_until is None or today <= self.available_until)

    def due_dates(self, signup: date):
        dates = []
        for inst in self.installments.all():
            due = add_months(signup, inst.months_after_signup)
            if self.final_deadline:
                due = min(due, max(self.final_deadline, signup))
            dates.append((inst, due))
        return dates


class PlanInstallment(models.Model):
    plan = ParentalKey(PaymentPlan, on_delete=models.CASCADE, related_name="installments")
    label = models.CharField(max_length=80, help_text="e.g. First installment")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    months_after_signup = models.PositiveSmallIntegerField(
        default=0, help_text="0 = paid at registration, 1 = one month later, and so on."
    )
    sort_order = models.PositiveIntegerField(default=0)

    panels = [FieldPanel("label"), FieldPanel("amount"), FieldPanel("months_after_signup"), FieldPanel("sort_order")]

    class Meta:
        ordering = ["sort_order", "months_after_signup", "id"]

    def __str__(self):
        return f"{self.label} — {self.amount}"


def generate_manage_token():
    return secrets.token_urlsafe(24)


class PlanRegistration(ClusterableModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Awaiting first payment"
        ACTIVE = "active", "Paying"
        COMPLETE = "complete", "Paid in full"
        CANCELLED = "cancelled", "Cancelled"

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="plan_registrations")
    plan = models.ForeignKey(PaymentPlan, on_delete=models.PROTECT, related_name="registrations")
    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=40, blank=True)
    manage_token = models.CharField(max_length=64, unique=True, default=generate_manage_token, editable=False)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    staff_notes = models.TextField(blank=True, help_text="Private. Never shown to the registrant.")
    created_at = models.DateTimeField(default=timezone.now)

    panels = [
        FieldPanel("event"),
        FieldPanel("plan"),
        FieldPanel("name"),
        FieldPanel("email"),
        FieldPanel("phone"),
        FieldPanel("status", help_text="Recalculated from payments on save, unless set to Cancelled."),
        FieldPanel("staff_notes"),
        InlinePanel(
            "payments", label="Payments",
            help_text="Online payments are recorded automatically. Add a Manual payment for bank transfers or mobile money.",
        ),
    ]

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} — {self.plan}"

    @property
    def signup_date(self):
        return timezone.localdate(self.created_at)

    @property
    def amount_paid(self):
        return sum(
            (p.amount for p in self.payments.all() if p.status == InstallmentPayment.Status.PAID), Decimal("0")
        )

    @property
    def balance(self):
        return max(self.plan.total - self.amount_paid, Decimal("0"))

    def schedule(self, today=None):
        """Installments in order with their due dates, each marked paid
        (covered by the running total) and overdue (unpaid, past due)."""
        today = today or timezone.localdate()
        paid = self.amount_paid
        running = Decimal("0")
        rows = []
        for inst, due in self.plan.due_dates(self.signup_date):
            running += inst.amount
            covered = paid >= running
            rows.append({
                "installment": inst,
                "label": inst.label,
                "amount": inst.amount,
                "due_date": due,
                "paid": covered,
                "overdue": (not covered) and due < today,
            })
        return rows

    def amount_due_now(self, today=None):
        """The next payment: everything already due (catch-up), or else the
        rest of the next unpaid installment."""
        today = today or timezone.localdate()
        balance = self.balance
        if balance <= 0:
            return Decimal("0")
        paid = self.amount_paid
        rows = self.schedule(today)
        already_due = sum((r["amount"] for r in rows if r["due_date"] <= today), Decimal("0"))
        if already_due > paid:
            return min(already_due - paid, balance)
        running = Decimal("0")
        for row in rows:
            running += row["amount"]
            if running > paid:
                return min(running - paid, balance)
        return balance

    def next_due(self, today=None):
        return next((row for row in self.schedule(today) if not row["paid"]), None)

    def computed_status(self):
        if self.status == self.Status.CANCELLED:
            return self.status
        paid = self.amount_paid
        if paid <= 0:
            return self.Status.PENDING
        if paid >= self.plan.total:
            return self.Status.COMPLETE
        return self.Status.ACTIVE

    def refresh_status(self):
        new_status = self.computed_status()
        if new_status != self.status:
            self.status = new_status
            type(self).objects.filter(pk=self.pk).update(status=new_status)
        return self.status

    def save(self, *args, **kwargs):
        # ClusterableModel saves inline payments after the parent row, so the
        # status is recalculated once super().save() has returned.
        super().save(*args, **kwargs)
        self.refresh_status()

    @property
    def manage_url(self):
        return f"{settings.FRONTEND_BASE_URL.rstrip('/')}/events/{self.event.slug}/registration/{self.manage_token}"


class InstallmentPayment(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        CANCELLED = "cancelled", "Cancelled"

    class Provider(models.TextChoices):
        STRIPE = "stripe", "Stripe (card)"
        PAYSTACK = "paystack", "Paystack"
        MANUAL = "manual", "Manual (bank transfer / mobile money)"

    registration = ParentalKey(PlanRegistration, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, blank=True)
    provider = models.CharField(max_length=10, choices=Provider.choices, default=Provider.MANUAL)
    reference = models.CharField(max_length=120, unique=True, null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PAID)
    paid_at = models.DateTimeField(null=True, blank=True)
    note = models.CharField(max_length=255, blank=True, help_text="e.g. bank transfer reference.")
    created_at = models.DateTimeField(default=timezone.now)

    panels = [
        FieldPanel("amount"),
        FieldPanel("provider"),
        FieldPanel("status"),
        FieldPanel("paid_at"),
        FieldPanel("note"),
        FieldPanel("reference", read_only=True),
    ]

    class Meta:
        ordering = ["created_at", "id"]

    def __str__(self):
        return f"{self.currency} {self.amount} ({self.get_provider_display()}, {self.get_status_display()})"

    @property
    def amount_minor(self):
        return to_minor_units(self.amount)

    def save(self, *args, **kwargs):
        if not self.currency and self.registration_id:
            self.currency = self.registration.plan.currency
        if self.status == self.Status.PAID and not self.paid_at:
            self.paid_at = timezone.now()
        super().save(*args, **kwargs)
        # Keep the registration's status in step however the payment was
        # recorded (webhook, verify, Wagtail inline, shell).
        PlanRegistration.objects.get(pk=self.registration_id).refresh_status()


class InstallmentReminder(models.Model):
    class Kind(models.TextChoices):
        WEEK_BEFORE = "week_before", "7 days before"
        DAY_BEFORE = "day_before", "1 day before"
        OVERDUE = "overdue", "Overdue"

    registration = models.ForeignKey(PlanRegistration, on_delete=models.CASCADE, related_name="reminders")
    installment = models.ForeignKey(PlanInstallment, on_delete=models.CASCADE, related_name="+")
    kind = models.CharField(max_length=20, choices=Kind.choices)
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["registration", "installment", "kind"], name="unique_installment_reminder"),
        ]


class PaymentPlanViewSet(SnippetViewSet):
    model = PaymentPlan
    icon = "list-ul"
    menu_label = "Payment plans"
    list_display = ["name", "event", "currency", "available_until", "final_deadline", "is_active"]
    list_filter = ["event", "is_active"]
    search_fields = ["name"]


class PlanRegistrationViewSet(SnippetViewSet):
    model = PlanRegistration
    icon = "user"
    menu_label = "Plan registrations"
    list_display = ["name", "email", "phone", "plan", "status", "amount_paid", "balance", "created_at"]
    list_filter = ["status", "event", "plan"]
    search_fields = ["name", "email", "phone"]
    ordering = ["-created_at"]
    list_export = [
        "id", "name", "email", "phone", "event", "plan", "status", "amount_paid", "balance", "created_at",
    ]
    export_filename = "plan-registrations"


register_snippet(PaymentPlanViewSet)
register_snippet(PlanRegistrationViewSet)

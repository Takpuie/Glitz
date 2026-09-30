import uuid

from django.db import models
from django.urls import reverse
from django.utils.html import format_html
from wagtail.admin.panels import FieldPanel, HelpPanel
from wagtail.snippets.models import register_snippet
from wagtail.snippets.views.snippets import SnippetViewSet
from wagtail.permission_policies import ModelPermissionPolicy
from wagtail.permissions import register_permission_policy

from .storage import PortfolioStorage


def portfolio_path(instance, filename):
    return f"portfolios/{uuid.uuid4().hex}.{filename.rsplit('.', 1)[-1].lower()}"


class NewsletterSubscriber(models.Model):
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    consent_at = models.DateTimeField(auto_now_add=True)

    panels = [FieldPanel("email", read_only=True), FieldPanel("is_active"), FieldPanel("consent_at", read_only=True)]

    class Meta:
        ordering = ["-consent_at"]

    def __str__(self):
        return self.email


class Nomination(models.Model):
    class Call(models.TextChoices):
        DESIGNERS = "designers", "GAFW Young Designers Showcase"
        HONOURS = "honours", "Ghana Women of the Year — Nominate an Honouree"
        STYLE = "style", "Glitz Style Awards — Reader Nomination"

    class Status(models.TextChoices):
        RECEIVED = "received", "Received"
        SHORTLISTED = "shortlisted", "Shortlisted"
        SELECTED = "selected", "Selected"
        NOT_SELECTED = "not_selected", "Not selected"

    reference = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    submission_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    open_call = models.CharField(max_length=20, choices=Call.choices)
    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    portfolio_link = models.URLField(blank=True)
    portfolio_file = models.FileField(storage=PortfolioStorage(), upload_to=portfolio_path, blank=True)
    statement = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.RECEIVED)
    notes = models.TextField(blank=True, help_text="Internal staff notes; not sent to the applicant.")
    created_at = models.DateTimeField(auto_now_add=True)

    panels = [FieldPanel(field, read_only=True) for field in (
        "reference", "open_call", "full_name", "email", "portfolio_link", "statement", "created_at"
    )] + [HelpPanel(template="submissions/portfolio_panel.html", heading="Portfolio"), FieldPanel("status"), FieldPanel("notes")]

    @property
    def portfolio_download(self):
        if not self.portfolio_file:
            return "No file attached"
        return format_html('<a href="{}">Download portfolio</a>', reverse("nomination-portfolio", args=[self.pk]))

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} — {self.get_open_call_display()}"


class Enquiry(models.Model):
    class Kind(models.TextChoices):
        GENERAL = "general", "General enquiry"
        EVENT = "event", "Event interest"
        SPONSORSHIP = "sponsorship", "Sponsorship enquiry"

    class Status(models.TextChoices):
        NEW = "new", "New"
        IN_PROGRESS = "in_progress", "In progress"
        RESOLVED = "resolved", "Resolved"

    reference = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    submission_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    kind = models.CharField(max_length=20, choices=Kind.choices)
    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    company = models.CharField(max_length=200, blank=True)
    message = models.TextField(blank=True)
    event = models.ForeignKey("events.Event", null=True, blank=True, on_delete=models.SET_NULL, related_name="enquiries")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    notes = models.TextField(blank=True, help_text="Private staff notes.")
    created_at = models.DateTimeField(auto_now_add=True)

    panels = [FieldPanel(field, read_only=True) for field in (
        "reference", "kind", "full_name", "email", "company", "event", "message", "created_at"
    )] + [FieldPanel("status"), FieldPanel("notes")]

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} — {self.get_kind_display()}"


class NewsletterSubscriberViewSet(SnippetViewSet):
    model = NewsletterSubscriber
    icon = "mail"
    list_display = ["email", "is_active", "consent_at"]
    list_filter = ["is_active"]
    search_fields = ["email"]


class NominationViewSet(SnippetViewSet):
    model = Nomination
    icon = "form"
    list_display = ["full_name", "email", "open_call", "status", "created_at"]
    list_filter = ["open_call", "status"]
    search_fields = ["full_name", "email"]


class EnquiryViewSet(SnippetViewSet):
    model = Enquiry
    icon = "form"
    list_display = ["full_name", "email", "kind", "event", "status", "created_at"]
    list_filter = ["kind", "status", "event"]
    search_fields = ["full_name", "email", "company", "message"]


class SubmissionPermissionPolicy(ModelPermissionPolicy):
    def user_has_permission(self, user, action):
        # Records originate from submitted forms; staff review existing entries.
        return action != "add" and super().user_has_permission(user, action)


for submission_model in (NewsletterSubscriber, Nomination, Enquiry):
    register_permission_policy(submission_model, SubmissionPermissionPolicy(submission_model))

register_snippet(NewsletterSubscriberViewSet)
register_snippet(NominationViewSet)
register_snippet(EnquiryViewSet)

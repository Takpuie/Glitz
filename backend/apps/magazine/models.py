from django.conf import settings
from django.db import models
from wagtail.admin.panels import FieldPanel
from wagtail.api import APIField
from wagtail.images.api.fields import ImageRenditionField
from wagtail.snippets.models import register_snippet


@register_snippet
class MagazineIssue(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    issue_number = models.CharField(max_length=40, help_text="e.g. 'Issue 118'")
    season = models.CharField(max_length=100, blank=True, help_text="e.g. 'October / November 2026'")
    description = models.TextField(blank=True)
    cover_image = models.ForeignKey(
        "wagtailimages.Image", null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    price = models.DecimalField(max_digits=8, decimal_places=2)

    is_digital_available = models.BooleanField(default=True)
    digital_file = models.FileField(upload_to="magazine_issues/", null=True, blank=True)

    is_print_available = models.BooleanField(default=True)
    print_sku = models.CharField(max_length=60, blank=True)
    print_sold_out = models.BooleanField(default=False)

    publish_date = models.DateField()
    is_current_issue = models.BooleanField(
        default=False, help_text="Only one issue should be current at a time."
    )

    panels = [
        FieldPanel("title"),
        FieldPanel("slug"),
        FieldPanel("issue_number"),
        FieldPanel("season"),
        FieldPanel("description"),
        FieldPanel("cover_image"),
        FieldPanel("price"),
        FieldPanel("is_digital_available"),
        FieldPanel("digital_file"),
        FieldPanel("is_print_available"),
        FieldPanel("print_sku"),
        FieldPanel("print_sold_out"),
        FieldPanel("publish_date"),
        FieldPanel("is_current_issue"),
    ]

    api_fields = [
        APIField("slug"),
        APIField("issue_number"),
        APIField("season"),
        APIField("description"),
        APIField("cover_image", serializer=ImageRenditionField("fill-1000x1300")),
        APIField("price"),
        APIField("is_digital_available"),
        APIField("is_print_available"),
        APIField("print_sold_out"),
        APIField("publish_date"),
        APIField("is_current_issue"),
    ]

    class Meta:
        ordering = ["-publish_date"]

    def __str__(self):
        return self.title


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending payment"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="orders"
    )
    email = models.EmailField(help_text="Captured even for guest checkout.")
    amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="Total, in GHS.")
    paystack_reference = models.CharField(max_length=120, unique=True, null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    delivery_link = models.URLField(
        blank=True, help_text="Signed digital-download link, set once payment is confirmed."
    )
    shipping_address = models.TextField(blank=True, help_text="Required only for print items.")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.pk} — {self.get_status_display()}"


class OrderItem(models.Model):
    class Format(models.TextChoices):
        DIGITAL = "digital", "Digital"
        PRINT = "print", "Print"

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    issue = models.ForeignKey(MagazineIssue, on_delete=models.PROTECT, related_name="order_items")
    format = models.CharField(max_length=10, choices=Format.choices, default=Format.DIGITAL)
    quantity = models.PositiveSmallIntegerField(default=1)
    unit_price = models.DecimalField(
        max_digits=8, decimal_places=2, help_text="Price at time of purchase, not the issue's current price."
    )

    def __str__(self):
        return f"{self.issue.title} × {self.quantity} ({self.get_format_display()})"

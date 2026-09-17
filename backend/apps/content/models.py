from django.db import models
from modelcluster.fields import ParentalKey
from wagtail.admin.panels import FieldPanel, InlinePanel
from wagtail.api import APIField
from wagtail.fields import StreamField
from wagtail.images.api.fields import ImageRenditionField
from wagtail.models import Page
from wagtail.search import index
from wagtail.snippets.models import register_snippet

from .blocks import BodyStreamBlock


@register_snippet
class Category(models.Model):
    """News / Entertainment / Fashion / Hair & Beauty / Lifestyle — managed
    in the CMS rather than hardcoded, so an editor can add one without a
    deploy.
    """

    name = models.CharField(max_length=60, unique=True)
    slug = models.SlugField(max_length=60, unique=True)

    panels = [
        FieldPanel("name"),
        FieldPanel("slug"),
    ]

    api_fields = [
        APIField("name"),
        APIField("slug"),
    ]

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class PostIndexPage(Page):
    """A simple listing parent for Post pages (e.g. 'Stories') — lets
    editors organise posts under one page in the Wagtail page tree.
    """

    intro = models.CharField(max_length=255, blank=True)

    content_panels = Page.content_panels + [FieldPanel("intro")]
    subpage_types = ["content.Post"]

    api_fields = [APIField("intro")]


class Post(Page):
    dek = models.CharField(
        max_length=300,
        blank=True,
        help_text="One-sentence summary shown on cards and below the headline.",
    )
    body = StreamField(BodyStreamBlock(), use_json_field=True, blank=True)
    author_name = models.CharField(max_length=120, blank=True)
    category = models.ForeignKey(
        Category, null=True, blank=True, on_delete=models.SET_NULL, related_name="posts"
    )
    cover_image = models.ForeignKey(
        "wagtailimages.Image",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )
    published_date = models.DateField(null=True, blank=True)
    read_time_minutes = models.PositiveSmallIntegerField(null=True, blank=True)

    search_fields = Page.search_fields + [
        index.SearchField("dek"),
        index.SearchField("body"),
        index.FilterField("category"),
    ]

    content_panels = Page.content_panels + [
        FieldPanel("dek"),
        FieldPanel("cover_image"),
        FieldPanel("author_name"),
        FieldPanel("category"),
        FieldPanel("published_date"),
        FieldPanel("read_time_minutes"),
        FieldPanel("body"),
        InlinePanel("gallery", label="Gallery images"),
    ]

    parent_page_types = ["content.PostIndexPage"]
    subpage_types = []

    api_fields = [
        APIField("dek"),
        APIField("author_name"),
        APIField("category"),
        APIField("published_date"),
        APIField("read_time_minutes"),
        APIField("cover_image", serializer=ImageRenditionField("fill-1200x1500")),
        APIField("body"),
        APIField("gallery"),
    ]

    class Meta:
        ordering = ["-published_date"]


class MediaAsset(models.Model):
    """Event photo/video gallery item. Belongs to exactly one of a Post or
    an Event — a fashion-week recap post and the GAFW event page can point
    at the same uploaded assets rather than duplicating uploads, by tagging
    the same image/file to both.
    """

    class Kind(models.TextChoices):
        IMAGE = "image", "Image"
        VIDEO = "video", "Video"

    kind = models.CharField(max_length=10, choices=Kind.choices, default=Kind.IMAGE)
    image = models.ForeignKey(
        "wagtailimages.Image", null=True, blank=True, on_delete=models.CASCADE, related_name="+"
    )
    video_file = models.FileField(upload_to="event_videos/", null=True, blank=True)
    caption = models.CharField(max_length=255, blank=True)
    event_tag = models.CharField(
        max_length=120,
        blank=True,
        help_text="Free-text tag, e.g. 'GAFW 2026' — lets a gallery be filtered without a hard FK.",
    )

    post = ParentalKey(
        Post, null=True, blank=True, on_delete=models.CASCADE, related_name="gallery"
    )
    event = ParentalKey(
        "events.Event", null=True, blank=True, on_delete=models.CASCADE, related_name="gallery_items"
    )

    order = models.PositiveIntegerField(default=0)

    panels = [
        FieldPanel("kind"),
        FieldPanel("image"),
        FieldPanel("video_file"),
        FieldPanel("caption"),
        FieldPanel("event_tag"),
        FieldPanel("event"),
        FieldPanel("order"),
    ]

    api_fields = [
        APIField("kind"),
        APIField("image", serializer=ImageRenditionField("fill-1200x900")),
        APIField("video_file"),
        APIField("caption"),
        APIField("event_tag"),
        APIField("order"),
    ]

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.caption or f"{self.kind} #{self.pk}"

    def clean(self):
        from django.core.exceptions import ValidationError

        if not self.post_id and not self.event_id:
            raise ValidationError("A media asset must belong to a Post or an Event.")

from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator, RegexValidator, URLValidator
from modelcluster.fields import ParentalKey
from wagtail.admin.panels import FieldPanel, InlinePanel
from wagtail.api import APIField
from wagtail.fields import StreamField
from wagtail.images.api.fields import ImageRenditionField
from wagtail.models import Page, PageManager
from wagtail.search import index
from wagtail.snippets.models import register_snippet
from wagtail.snippets.views.snippets import SnippetViewSet

from .blocks import BodyStreamBlock
from .media import video_embed_url


class Photo(models.Model):
    title = models.CharField(max_length=200)
    image = models.ForeignKey("wagtailimages.Image", on_delete=models.PROTECT, related_name="media_photos")
    alt_text = models.CharField(max_length=250, help_text="Describe the image for visitors using screen readers.")
    caption = models.TextField(blank=True)
    credit = models.CharField(max_length=150, blank=True)
    event = models.ForeignKey(
        "events.Event", null=True, blank=True, on_delete=models.SET_NULL, related_name="photos"
    )
    display_order = models.PositiveIntegerField(default=0, help_text="Lower numbers appear first.")
    is_visible = models.BooleanField(default=False, help_text="Show this photo on the Media page.")

    panels = [FieldPanel(field) for field in (
        "title", "image", "alt_text", "caption", "credit", "event", "display_order", "is_visible"
    )]

    class Meta:
        verbose_name = "media gallery item"
        verbose_name_plural = "Media Gallery"
        ordering = ["display_order", "-pk"]

    def __str__(self):
        return self.title


class PhotoViewSet(SnippetViewSet):
    model = Photo
    icon = "image"
    list_display = ["title", "event", "display_order", "is_visible"]
    list_filter = ["is_visible", "event"]
    search_fields = ["title", "caption", "credit"]


register_snippet(PhotoViewSet)


class Video(models.Model):
    title = models.CharField(max_length=200)
    thumbnail = models.ForeignKey(
        "wagtailimages.Image", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="+",
    )
    video_url = models.URLField(
        blank=True, help_text="HTTPS YouTube or public Vimeo link. Use either a link or an uploaded video."
    )
    video_file = models.FileField(
        upload_to="media_videos/", blank=True,
        validators=[FileExtensionValidator(["mp4", "webm"])],
        help_text="MP4 or WebM. Leave the video link empty when uploading a file.",
    )
    duration = models.CharField(
        max_length=12, blank=True, help_text="Optional duration, e.g. 6:42 or 1:06:42.",
        validators=[RegexValidator(r"^(?:\d+:)?\d{1,2}:[0-5]\d$", "Use m:ss or h:mm:ss.")],
    )
    event = models.ForeignKey(
        "events.Event", null=True, blank=True, on_delete=models.SET_NULL, related_name="videos"
    )
    display_order = models.PositiveIntegerField(default=0, help_text="Lower numbers appear first.")
    is_visible = models.BooleanField(default=False, help_text="Show this video on the Media page.")

    panels = [FieldPanel(field) for field in (
        "title", "thumbnail", "video_url", "video_file", "duration", "event", "display_order", "is_visible"
    )]

    class Meta:
        ordering = ["display_order", "-pk"]

    def __str__(self):
        return self.title

    def clean(self):
        super().clean()
        if bool(self.video_url) == bool(self.video_file):
            raise ValidationError("Provide either a video link or an uploaded video, but not both.")
        if self.video_url and not video_embed_url(self.video_url):
            raise ValidationError({"video_url": "Use an HTTPS YouTube or public Vimeo video link."})


class PressCoverage(models.Model):
    headline = models.CharField(max_length=250)
    publication = models.CharField(max_length=150)
    article_url = models.URLField(validators=[URLValidator(schemes=["http", "https"])])
    published_date = models.DateField()
    display_order = models.PositiveIntegerField(default=0, help_text="Lower numbers appear first.")
    is_visible = models.BooleanField(default=False, help_text="Show this article on the Media page.")

    panels = [FieldPanel(field) for field in (
        "headline", "publication", "article_url", "published_date", "display_order", "is_visible"
    )]

    class Meta:
        verbose_name = "press coverage"
        verbose_name_plural = "press coverage"
        ordering = ["display_order", "-published_date", "-pk"]

    def __str__(self):
        return self.headline


class VideoViewSet(SnippetViewSet):
    model = Video
    icon = "media"
    list_display = ["title", "event", "duration", "display_order", "is_visible"]
    list_filter = ["is_visible", "event"]
    search_fields = ["title"]


class PressCoverageViewSet(SnippetViewSet):
    model = PressCoverage
    icon = "doc-full"
    list_display = ["headline", "publication", "published_date", "display_order", "is_visible"]
    list_filter = ["is_visible"]
    search_fields = ["headline", "publication"]


register_snippet(VideoViewSet)
register_snippet(PressCoverageViewSet)


@register_snippet
class HomepageSlide(models.Model):
    title = models.CharField(max_length=120)
    eyebrow = models.CharField(max_length=100, blank=True)
    description = models.CharField(max_length=300, blank=True)
    poster = models.ForeignKey("wagtailimages.Image", on_delete=models.PROTECT, related_name="+")
    video = models.ForeignKey(Video, null=True, blank=True, on_delete=models.SET_NULL, related_name="homepage_slides", help_text="Choose a visible video with an uploaded MP4/WebM for background playback.")
    button_label = models.CharField(max_length=60, default="Explore")
    button_path = models.CharField(max_length=250, default="/events", help_text="A site path, e.g. /events/gafw")
    display_order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=False)

    panels = [FieldPanel(field) for field in ("title", "eyebrow", "description", "poster", "video", "button_label", "button_path", "display_order", "is_visible")]

    class Meta:
        ordering = ["display_order", "pk"]

    def __str__(self):
        return self.title

    def clean(self):
        super().clean()
        if not self.button_path.startswith("/") or self.button_path.startswith("//") or "\\" in self.button_path or any(c.isspace() for c in self.button_path):
            raise ValidationError({"button_path": "Use a local site path beginning with one slash."})
        if self.video_id and (not self.video.video_file or not self.video.is_visible):
            raise ValidationError({"video": "Choose a visible video with an uploaded MP4 or WebM file."})


@register_snippet
class PartnerLogo(models.Model):
    name = models.CharField(max_length=120)
    logo = models.ForeignKey("wagtailimages.Image", on_delete=models.PROTECT, related_name="+")
    website = models.URLField(blank=True, validators=[URLValidator(schemes=["https", "http"])])
    display_order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=False)

    panels = [FieldPanel(field) for field in ("name", "logo", "website", "display_order", "is_visible")]

    class Meta:
        ordering = ["display_order", "pk"]

    def __str__(self):
        return self.name


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


class PostManager(PageManager):
    def get_queryset(self):
        # The Wagtail API lists every Post at once (the frontend's article
        # feed) — without this, each post's `category(name,slug)` field
        # expansion fires its own query (N+1: 18 posts, 18 identical-shape
        # queries against a 5-row table). select_related folds it into the
        # single base query instead.
        return super().get_queryset().select_related("category")


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

    objects = PostManager()

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

    def get_preview_template(self, request, mode_name):
        # Render the editor's in-memory draft, not the published API version.
        return "content/post_preview.html"


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

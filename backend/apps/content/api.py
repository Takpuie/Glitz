from rest_framework import serializers, viewsets

from urllib.parse import urljoin
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.http import require_GET

from .models import Category, Photo, PressCoverage, Video, HomepageSlide, PartnerLogo, Post
from .image_utils import rendition_dict
from .media import video_embed_url


class PhotoSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    full_image = serializers.SerializerMethodField()
    event = serializers.SerializerMethodField()

    class Meta:
        model = Photo
        fields = ["id", "title", "image", "full_image", "alt_text", "caption", "credit", "event"]

    def get_image(self, obj):
        return rendition_dict(obj.image.get_rendition("fill-900x675"))

    def get_full_image(self, obj):
        return rendition_dict(obj.image.get_rendition("max-2400x2400"))

    def get_event(self, obj):
        return {"name": obj.event.name, "slug": obj.event.slug} if obj.event else None


class PhotoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Photo.objects.filter(is_visible=True).select_related("image", "event").prefetch_related("image__renditions")
    serializer_class = PhotoSerializer
    permission_classes = []
    pagination_class = None


class VideoSerializer(serializers.ModelSerializer):
    thumbnail = serializers.SerializerMethodField()
    embed_url = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    event = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = ["id", "title", "thumbnail", "embed_url", "file_url", "duration", "event"]

    def get_thumbnail(self, obj):
        if obj.thumbnail:
            return rendition_dict(obj.thumbnail.get_rendition("fill-900x1100"))
        return None

    def get_embed_url(self, obj):
        return video_embed_url(obj.video_url) if obj.video_url else None

    def get_file_url(self, obj):
        return urljoin(settings.WAGTAILADMIN_BASE_URL, obj.video_file.url) if obj.video_file else None

    def get_event(self, obj):
        return {"name": obj.event.name, "slug": obj.event.slug} if obj.event else None


class VideoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Video.objects.filter(is_visible=True).select_related("thumbnail", "event")
    serializer_class = VideoSerializer
    permission_classes = []
    pagination_class = None


class PressCoverageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PressCoverage
        fields = ["id", "headline", "publication", "article_url", "published_date"]


class PressCoverageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PressCoverage.objects.filter(is_visible=True)
    serializer_class = PressCoverageSerializer
    permission_classes = []
    pagination_class = None


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Public, read-only — the Stories page filter chips need this list."""

    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = []
    pagination_class = None


class HomepageSlideSerializer(serializers.ModelSerializer):
    poster = serializers.SerializerMethodField()
    video_url = serializers.SerializerMethodField()

    class Meta:
        model = HomepageSlide
        fields = ["id", "title", "eyebrow", "description", "poster", "video_url", "button_label", "button_path"]

    def get_poster(self, obj):
        return rendition_dict(obj.poster.get_rendition("fill-1920x1080"))

    def get_video_url(self, obj):
        if obj.video and obj.video.is_visible and obj.video.video_file:
            return urljoin(settings.WAGTAILADMIN_BASE_URL, obj.video.video_file.url)
        return None


class HomepageSlideViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = HomepageSlide.objects.filter(is_visible=True).select_related("poster", "video")
    serializer_class = HomepageSlideSerializer
    permission_classes = []
    pagination_class = None


@require_GET
def sitemap_content(request):
    posts = Post.objects.live().values("slug", "published_date", "last_published_at")
    return JsonResponse({
        "posts": [
            {
                "slug": post["slug"],
                "last_modified": post["last_published_at"] or post["published_date"],
            }
            for post in posts
        ]
    })


class PartnerLogoSerializer(serializers.ModelSerializer):
    logo = serializers.SerializerMethodField()

    class Meta:
        model = PartnerLogo
        fields = ["id", "name", "logo", "website"]

    def get_logo(self, obj):
        return rendition_dict(obj.logo.get_rendition("max-400x160"))


class PartnerLogoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PartnerLogo.objects.filter(is_visible=True).select_related("logo")
    serializer_class = PartnerLogoSerializer
    permission_classes = []
    pagination_class = None

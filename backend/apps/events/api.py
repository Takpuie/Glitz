from rest_framework import serializers, viewsets

from apps.content.image_utils import rendition_dict
from apps.content.models import MediaAsset
from .models import Event, TicketType


class GalleryItemSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = MediaAsset
        fields = ["id", "kind", "image", "caption", "order"]

    def get_image(self, obj):
        if not obj.image:
            return None
        return rendition_dict(obj.image.get_rendition("fill-1200x900"))


class TicketTypeSerializer(serializers.ModelSerializer):
    remaining = serializers.ReadOnlyField()

    class Meta:
        model = TicketType
        fields = ["id", "name", "description", "price", "capacity", "remaining"]


class EventSerializer(serializers.ModelSerializer):
    ticket_types = TicketTypeSerializer(many=True, read_only=True)
    gallery_items = GalleryItemSerializer(many=True, read_only=True)
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id",
            "name",
            "slug",
            "tagline",
            "description",
            "venue",
            "start_date",
            "end_date",
            "status",
            "cover_image",
            "ticket_types",
            "gallery_items",
        ]

    def get_cover_image(self, obj):
        if not obj.cover_image:
            return None
        return rendition_dict(obj.cover_image.get_rendition("fill-1600x1000"))


class EventViewSet(viewsets.ReadOnlyModelViewSet):
    """Public, read-only. Ticket purchase is a separate authenticated
    endpoint (Phase 2 — not built yet)."""

    queryset = Event.objects.prefetch_related("ticket_types", "gallery_items")
    serializer_class = EventSerializer
    permission_classes = []
    lookup_field = "slug"
    pagination_class = None

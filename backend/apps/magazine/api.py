from rest_framework import serializers, viewsets

from .models import MagazineIssue


class MagazineIssueSerializer(serializers.ModelSerializer):
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = MagazineIssue
        fields = [
            "id",
            "title",
            "slug",
            "issue_number",
            "season",
            "description",
            "cover_image",
            "price",
            "is_digital_available",
            "is_print_available",
            "print_sold_out",
            "publish_date",
            "is_current_issue",
        ]

    def get_cover_image(self, obj):
        if not obj.cover_image:
            return None
        rendition = obj.cover_image.get_rendition("fill-1000x1300")
        return {"url": rendition.url, "width": rendition.width, "height": rendition.height}


class MagazineIssueViewSet(viewsets.ReadOnlyModelViewSet):
    """Public, read-only. Purchasing an issue is a separate authenticated
    checkout endpoint (Phase 3 — not built yet)."""

    queryset = MagazineIssue.objects.all()
    serializer_class = MagazineIssueSerializer
    permission_classes = []
    lookup_field = "slug"
    pagination_class = None

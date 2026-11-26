from django.utils import timezone
from rest_framework import serializers, viewsets

from apps.content.image_utils import rendition_dict
from apps.content.models import MediaAsset
from .models import Event, PaymentPlan, PlanInstallment, TicketType
from .plan_checkout import enabled_providers


class GalleryItemSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = MediaAsset
        fields = ["id", "kind", "image", "caption", "order"]

    def get_image(self, obj):
        if not obj.image:
            return None
        return rendition_dict(obj.image.get_rendition("max-2000x2000"))


class TicketTypeSerializer(serializers.ModelSerializer):
    remaining = serializers.ReadOnlyField()

    class Meta:
        model = TicketType
        fields = ["id", "name", "description", "price", "capacity", "remaining"]


class PlanInstallmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanInstallment
        fields = ["label", "amount", "months_after_signup"]


class PaymentPlanSerializer(serializers.ModelSerializer):
    installments = PlanInstallmentSerializer(many=True, read_only=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = PaymentPlan
        fields = ["id", "name", "description", "currency", "available_until", "final_deadline", "total", "installments"]


class EventSerializer(serializers.ModelSerializer):
    ticket_types = TicketTypeSerializer(many=True, read_only=True)
    gallery_items = GalleryItemSerializer(many=True, read_only=True)
    cover_image = serializers.SerializerMethodField()
    payment_plans = serializers.SerializerMethodField()
    payment_providers = serializers.SerializerMethodField()

    def get_payment_plans(self, obj):
        # Only plans someone can still sign up for; the register endpoint
        # enforces the same rule server-side.
        if not obj.pk:
            return []
        today = timezone.localdate()
        return PaymentPlanSerializer([p for p in obj.payment_plans.all() if p.is_open(today)], many=True).data

    def get_payment_providers(self, obj):
        return enabled_providers()

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
            "external_payment_url",
            "external_payment_label",
            "ticket_types",
            "gallery_items",
            "payment_plans",
            "payment_providers",
        ]

    def get_cover_image(self, obj):
        if not obj.cover_image:
            return None
        return rendition_dict(obj.cover_image.get_rendition("max-2000x2000"))


class EventViewSet(viewsets.ReadOnlyModelViewSet):
    """Public, read-only. Ticket purchase is a separate authenticated
    endpoint (Phase 2 — not built yet)."""

    queryset = Event.objects.prefetch_related("ticket_types", "gallery_items", "payment_plans__installments")
    serializer_class = EventSerializer
    permission_classes = []
    lookup_field = "slug"
    pagination_class = None

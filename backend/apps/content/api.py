from rest_framework import serializers, viewsets

from .models import Category


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

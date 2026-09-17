from django.conf import settings


def rendition_dict(rendition):
    """Wagtail's own API (ImageRenditionField) returns an absolute full_url;
    hand-written DRF serializers for non-Page models don't get that for
    free, so this matches the shape manually."""
    return {
        "url": rendition.url,
        "full_url": f"{settings.WAGTAILADMIN_BASE_URL}{rendition.url}",
        "width": rendition.width,
        "height": rendition.height,
    }

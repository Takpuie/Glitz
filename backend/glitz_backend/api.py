"""Wagtail API v2 router — exposes CMS content (Post pages, images) to the
Next.js frontend. Orders/events/tickets are handled separately by DRF (see
each app's api.py) since that's custom business logic, not CMS content.
"""

from wagtail.api.v2.router import WagtailAPIRouter
from wagtail.api.v2.views import PagesAPIViewSet
from wagtail.images.api.v2.views import ImagesAPIViewSet

api_router = WagtailAPIRouter("wagtailapi")
api_router.register_endpoint("pages", PagesAPIViewSet)
api_router.register_endpoint("images", ImagesAPIViewSet)

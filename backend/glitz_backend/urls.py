from django.conf import settings
from django.urls import include, path
from django.contrib import admin
from rest_framework.routers import DefaultRouter

from wagtail.admin import urls as wagtailadmin_urls
from wagtail import urls as wagtail_urls
from wagtail.documents import urls as wagtaildocs_urls

from apps.content.api import CategoryViewSet
from apps.events.api import EventViewSet
from apps.events.checkout import TicketCheckoutView, TicketVerifyView
from apps.magazine.api import MagazineIssueViewSet
from apps.magazine.checkout import DigitalDownloadView, MagazineCheckoutView, OrderVerifyView
from search import views as search_views

from .api import api_router
from .webhooks import StripeWebhookView

drf_router = DefaultRouter()
drf_router.register("categories", CategoryViewSet, basename="category")
drf_router.register("events", EventViewSet, basename="event")
drf_router.register("magazine-issues", MagazineIssueViewSet, basename="magazineissue")

urlpatterns = [
    path("django-admin/", admin.site.urls),
    path("admin/", include(wagtailadmin_urls)),
    path("documents/", include(wagtaildocs_urls)),
    path("search/", search_views.search, name="search"),
    path("api/v2/", api_router.urls),
    path(
        "api/events/<slug:slug>/checkout/",
        TicketCheckoutView.as_view(),
        name="ticket-checkout",
    ),
    path(
        "api/tickets/verify/<str:reference>/",
        TicketVerifyView.as_view(),
        name="ticket-verify",
    ),
    path(
        "api/magazine/checkout/",
        MagazineCheckoutView.as_view(),
        name="magazine-checkout",
    ),
    path(
        "api/orders/verify/<str:reference>/",
        OrderVerifyView.as_view(),
        name="order-verify",
    ),
    path(
        "api/orders/<str:reference>/download/",
        DigitalDownloadView.as_view(),
        name="order-download",
    ),
    path("api/webhooks/stripe/", StripeWebhookView.as_view(), name="stripe-webhook"),
    path("api/", include(drf_router.urls)),
]


if settings.DEBUG:
    from django.conf.urls.static import static
    from django.contrib.staticfiles.urls import staticfiles_urlpatterns

    # Serve static and media files from development server
    urlpatterns += staticfiles_urlpatterns()
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns = urlpatterns + [
    # For anything not caught by a more specific rule above, hand over to
    # Wagtail's page serving mechanism. This should be the last pattern in
    # the list:
    path("", include(wagtail_urls)),
]

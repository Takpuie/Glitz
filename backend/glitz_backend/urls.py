from decouple import config
from django.conf import settings
from django.contrib import admin
from django.shortcuts import redirect
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from wagtail.admin import urls as wagtailadmin_urls
from wagtail import urls as wagtail_urls
from wagtail.documents import urls as wagtaildocs_urls

from apps.content.api import CategoryViewSet, PhotoViewSet, PressCoverageViewSet, VideoViewSet, HomepageSlideViewSet, PartnerLogoViewSet
from apps.events.api import EventViewSet
from apps.events.checkout import TicketCheckoutView, TicketVerifyView
from apps.magazine.api import MagazineIssueViewSet
from apps.magazine.checkout import DigitalDownloadView, MagazineCheckoutView, OrderVerifyView
from apps.submissions.api import SubmissionView, nomination_portfolio
from apps.accounts.reader_api import reader_api
from search import views as search_views

from .api import api_router
from .webhooks import PaystackWebhookView, StripeWebhookView

FRONTEND_BASE_URL = config("FRONTEND_BASE_URL", default="http://localhost:3000")

drf_router = DefaultRouter()
drf_router.register("categories", CategoryViewSet, basename="category")
drf_router.register("videos", VideoViewSet, basename="video")
drf_router.register("homepage-slides", HomepageSlideViewSet, basename="homepage-slide")
drf_router.register("partner-logos", PartnerLogoViewSet, basename="partner-logo")
drf_router.register("photos", PhotoViewSet, basename="photo")
drf_router.register("press-coverage", PressCoverageViewSet, basename="presscoverage")
drf_router.register("events", EventViewSet, basename="event")
drf_router.register("magazine-issues", MagazineIssueViewSet, basename="magazineissue")


def root_redirect(request):
    if request.user.is_authenticated:
        return redirect("/admin/")
    return redirect("/admin/login/")


def frontend_redirect(path: str):
    def _redirect(request):
        return redirect(f"{FRONTEND_BASE_URL}{path}")

    return _redirect


def frontend_slug_redirect(path_template: str):
    def _redirect(request, slug):
        return redirect(f"{FRONTEND_BASE_URL}{path_template.format(slug=slug)}")

    return _redirect


urlpatterns = [
    path("api/visitor/<path:route>/", reader_api, name="visitor-api"),
    path("api/submissions/<str:kind>/", SubmissionView.as_view(), name="submission-create"),
    path("staff/nominations/<int:pk>/portfolio/", nomination_portfolio, name="nomination-portfolio"),
    path("", root_redirect, name="root-redirect"),
    path("stories/", frontend_redirect("/articles/"), name="stories-index-redirect"),
    path(
        "stories/living-acra-design-district/",
        frontend_redirect("/articles/living-accra-design-district/"),
        name="stories-legacy-typo-redirect",
    ),
    path(
        "stories/living-acra-design-district",
        frontend_redirect("/articles/living-accra-design-district"),
        name="stories-legacy-typo-no-slash-redirect",
    ),
    path("stories/<slug:slug>/", frontend_slug_redirect("/articles/{slug}/"), name="stories-slug-redirect"),
    path("stories/<slug:slug>", frontend_slug_redirect("/articles/{slug}"), name="stories-slug-no-slash-redirect"),
    path("events/", frontend_redirect("/events/"), name="events-index-redirect"),
    path("events/<slug:slug>/", frontend_slug_redirect("/events/{slug}/"), name="events-slug-redirect"),
    path("events/<slug:slug>", frontend_slug_redirect("/events/{slug}"), name="events-slug-no-slash-redirect"),
    path("magazine/", frontend_redirect("/magazine/"), name="magazine-index-redirect"),
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
    path("api/webhooks/paystack/", PaystackWebhookView.as_view(), name="paystack-webhook"),
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

from django.conf import settings
from django.urls import include, path
from django.contrib import admin
from rest_framework.routers import DefaultRouter

from wagtail.admin import urls as wagtailadmin_urls
from wagtail import urls as wagtail_urls
from wagtail.documents import urls as wagtaildocs_urls

from apps.content.api import CategoryViewSet
from apps.events.api import EventViewSet
from apps.magazine.api import MagazineIssueViewSet
from search import views as search_views

from .api import api_router

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

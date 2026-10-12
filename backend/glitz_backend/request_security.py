from urllib.parse import urlsplit

from django.conf import settings
from rest_framework.exceptions import PermissionDenied


def require_frontend_origin(request):
    """Block cross-site browser POSTs to public APIs in production.

    Non-browser clients can forge Origin, so abuse prevention still relies on
    validation and throttling. This check specifically closes CSRF-style form
    posts made from an unrelated website.
    """
    if settings.DEBUG:
        return
    origin = request.headers.get("Origin", "")
    allowed = set(settings.CORS_ALLOWED_ORIGINS)
    frontend = settings.FRONTEND_BASE_URL.rstrip("/")
    if frontend:
        allowed.add(frontend)
    try:
        normalized = f"{urlsplit(origin).scheme}://{urlsplit(origin).netloc}"
    except ValueError:
        normalized = ""
    if not origin or normalized not in allowed:
        raise PermissionDenied("Invalid request origin.")

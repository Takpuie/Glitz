from .base import *  # noqa: F401,F403

# TechNE's FastCGI process does not consistently forward application stderr
# into the domain error logs. Keep a small local error log so production 500s
# can be diagnosed without enabling DEBUG or exposing tracebacks to visitors.
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "production_file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": BASE_DIR / "django-errors.log",  # noqa: F405
            "maxBytes": 2 * 1024 * 1024,
            "backupCount": 2,
            "formatter": "verbose",
            "level": "ERROR",
        },
    },
    "formatters": {
        "verbose": {
            "format": "{asctime} {levelname} {name} {message}",
            "style": "{",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["production_file"],
            "level": "ERROR",
            "propagate": False,
        },
    },
}

# ManifestStaticFilesStorage is recommended in production, to prevent
# outdated JavaScript / CSS assets being served from cache
# (e.g. after a Wagtail upgrade).
STORAGES["staticfiles"]["BACKEND"] = (  # noqa: F405
    "django.contrib.staticfiles.storage.ManifestStaticFilesStorage"
)

# Transport security — HTTPS is already terminated at TechNE via its issued
# certificates; these settings enforce it at the application level too.
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 60 * 60 * 24 * 365
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
# Wagtail renders page previews in a same-origin iframe within the admin.
# SAMEORIGIN keeps third-party framing blocked while allowing that editor UI.
X_FRAME_OPTIONS = "SAMEORIGIN"

try:
    from .local import *  # noqa: F401,F403
except ImportError:
    pass

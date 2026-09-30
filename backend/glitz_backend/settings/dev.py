from .base import *  # noqa: F401,F403

EMAIL_BACKEND = config("EMAIL_BACKEND", default="django.core.mail.backends.console.EmailBackend")

try:
    from .local import *  # noqa: F401,F403
except ImportError:
    pass

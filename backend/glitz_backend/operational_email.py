import logging

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def deliver(subject, body, recipients):
    """Send an operational email without breaking the completed action."""
    if not settings.AUTH_EMAIL_ENABLED:
        return False
    recipients = [address for address in recipients if address]
    if not recipients:
        return False
    try:
        return send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, recipients) == 1
    except Exception:
        logger.exception("Operational email delivery failed: %s", subject)
        return False


def notify_operations(subject, body):
    return deliver(subject, body, settings.OPERATIONS_EMAILS)


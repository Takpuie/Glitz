from django.conf import settings

from .branded_email import Email, from_plain_text, send


def deliver(subject, body, recipients):
    """Send an operational email without breaking the completed action.

    Accepts either a plain-text body (wrapped in the branded layout) or a
    ready-made branded Email."""
    email = body if isinstance(body, Email) else from_plain_text(subject, body)
    return send(email, recipients)


def notify_operations(subject, body):
    email = body if isinstance(body, Email) else from_plain_text(
        subject, body, eyebrow="Team notification",
        reason="Sent to the Glitz Africa operations team.",
    )
    return send(email, settings.OPERATIONS_EMAILS)

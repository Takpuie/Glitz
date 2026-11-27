from django.conf import settings

from glitz_backend.branded_email import Email, button, details, para, send
from glitz_backend.operational_email import notify_operations
from .models import Enquiry, Nomination


def send_submission_confirmation(record):
    reference = str(record.reference)
    if isinstance(record, Nomination):
        label = record.get_open_call_display()
        subject = "Your Glitz Africa submission has been received"
        heading = "Your submission is in."
        eyebrow = "Awards & Nominations"
        staff_subject = "New Glitz Africa nomination/application"
        detail = ("Open call", label)
    elif isinstance(record, Enquiry):
        label = record.get_kind_display()
        subject = "We received your Glitz Africa enquiry"
        heading = "Thank you for getting in touch."
        eyebrow = "Enquiries"
        staff_subject = "New Glitz Africa enquiry"
        detail = ("Type", label)
    else:
        return

    send(Email(
        subject=subject,
        eyebrow=eyebrow,
        heading=heading,
        preheader=f"Reference {reference}.",
        blocks=[
            para(f"Hello {record.full_name.split(' ')[0]}, thank you. We have received your submission."),
            details([("Reference", reference), detail]),
            para("Our team will review it and contact you if a response is required. Please keep your reference for any follow-up."),
        ],
        reason="You're receiving this because you submitted a form on glitzafrica.com.",
    ), [record.email])

    notify_operations(staff_subject, Email(
        subject=staff_subject,
        eyebrow="Team notification",
        heading=staff_subject.replace("Glitz Africa ", ""),
        blocks=[
            para("A new submission is ready for review in Wagtail."),
            details([("Name", record.full_name), ("Email", record.email), detail, ("Reference", reference)]),
        ],
        reason="Sent to the Glitz Africa operations team.",
    ))


def send_newsletter_confirmation(email):
    site = settings.FRONTEND_BASE_URL.rstrip("/")
    send(Email(
        subject="Welcome to Glitz Africa",
        eyebrow="Stay in the know",
        heading="Welcome to Glitz Africa.",
        preheader="Your subscription is confirmed.",
        blocks=[
            para("Your subscription is confirmed. You'll now receive the best of Glitz: fashion, beauty, culture, "
                 "business and the people shaping Africa's creative economy."),
            button("Read the latest stories", f"{site}/articles"),
        ],
        reason="You're receiving this because you subscribed to the Glitz Africa newsletter.",
    ), [email])

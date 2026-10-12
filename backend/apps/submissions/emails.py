from glitz_backend.operational_email import deliver, notify_operations
from .models import Enquiry, Nomination


def send_submission_confirmation(record):
    reference = str(record.reference)
    if isinstance(record, Nomination):
        label = record.get_open_call_display()
        subject = "Your Glitz Africa submission has been received"
        staff_subject = "New Glitz Africa nomination/application"
        details = f"Open call: {label}"
    elif isinstance(record, Enquiry):
        label = record.get_kind_display()
        subject = "We received your Glitz Africa enquiry"
        staff_subject = "New Glitz Africa enquiry"
        details = f"Type: {label}"
    else:
        return
    deliver(subject, "\n".join([
        f"Hello {record.full_name},", "", "Thank you. Your submission has been received.",
        f"Reference: {reference}", details, "", "Our team will review it and contact you if a response is required.",
    ]), [record.email])
    notify_operations(staff_subject, "\n".join([
        "A new submission is ready for review in Wagtail.", "", f"Name: {record.full_name}",
        f"Email: {record.email}", details, f"Reference: {reference}",
    ]))


def send_newsletter_confirmation(email):
    deliver("Welcome to Glitz Africa", "Your subscription has been confirmed. You will now receive updates from Glitz Africa.", [email])


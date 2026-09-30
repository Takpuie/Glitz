import tempfile
import uuid

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse

from apps.events.models import Event
from .models import Enquiry, NewsletterSubscriber, Nomination


class SubmissionTests(TestCase):
    def setUp(self):
        cache.clear()
        self.event = Event.objects.create(name="Test event", slug="test-event", start_date="2026-11-01")

    def nomination(self, **changes):
        data = {"submission_id": str(uuid.uuid4()), "full_name": "Applicant", "email": "applicant@example.com", "open_call": "designers", "statement": "My work", "consent": "true"}
        data.update(changes)
        return data

    def enquiry(self, **changes):
        data = {"submission_id": str(uuid.uuid4()), "full_name": "Visitor", "email": "visitor@example.com", "kind": "general", "message": "Hello", "consent": "true"}
        data.update(changes)
        return data

    def test_newsletter_normalizes_email_and_deduplicates(self):
        for email in ["Reader@Example.com", "reader@example.com"]:
            response = self.client.post("/api/submissions/newsletter/", {"email": email, "consent": "true"})
            self.assertIn(response.status_code, (200, 201))
        self.assertEqual(NewsletterSubscriber.objects.count(), 1)
        self.assertEqual(NewsletterSubscriber.objects.get().email, "reader@example.com")

    def test_disabled_subscriber_is_not_reactivated(self):
        subscriber = NewsletterSubscriber.objects.create(email="reader@example.com", is_active=False)
        self.client.post("/api/submissions/newsletter/", {"email": subscriber.email, "consent": "true"})
        subscriber.refresh_from_db()
        self.assertFalse(subscriber.is_active)

    def test_invalid_or_unconsented_submissions_are_not_saved(self):
        for payload in ({"email": "invalid", "consent": "true"}, {"email": "reader@example.com", "consent": "false"}, {"email": "reader@example.com", "consent": "true", "website": "spam"}):
            self.assertEqual(self.client.post("/api/submissions/newsletter/", payload).status_code, 400)
        self.assertFalse(NewsletterSubscriber.objects.exists())

    def test_nomination_is_saved_and_retries_are_idempotent(self):
        data = self.nomination(status="selected", notes="Injected note")
        first = self.client.post("/api/submissions/nominations/", data)
        second = self.client.post("/api/submissions/nominations/", data)
        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(first.json()["reference"], second.json()["reference"])
        record = Nomination.objects.get()
        self.assertEqual(record.status, "received")
        self.assertEqual(record.notes, "")

    def test_nomination_validation(self):
        for changes in ({"open_call": "unknown"}, {"statement": ""}, {"portfolio_link": "not-url"}):
            self.assertEqual(self.client.post("/api/submissions/nominations/", self.nomination(**changes)).status_code, 400)
        self.assertFalse(Nomination.objects.exists())

    def test_each_enquiry_kind_is_saved(self):
        for kind in ["general", "event", "sponsorship"]:
            response = self.client.post("/api/submissions/enquiries/", self.enquiry(kind=kind, event=self.event.slug, company="Brand"))
            self.assertEqual(response.status_code, 201, response.content)
        self.assertEqual(Enquiry.objects.count(), 3)
        self.assertTrue(all(item.event == self.event for item in Enquiry.objects.all()))

    def test_enquiry_requirements_and_event_validation(self):
        for changes in ({"kind": "event"}, {"kind": "event", "event": "missing"}, {"kind": "sponsorship"}, {"message": ""}):
            self.assertEqual(self.client.post("/api/submissions/enquiries/", self.enquiry(**changes)).status_code, 400)
        self.assertFalse(Enquiry.objects.exists())

    def test_submissions_cannot_be_listed_publicly(self):
        for kind in ["newsletter", "nominations", "enquiries"]:
            self.assertEqual(self.client.get(f"/api/submissions/{kind}/").status_code, 405)

    def test_rate_limit(self):
        for _ in range(10):
            self.client.post("/api/submissions/newsletter/", {"email": "reader@example.com", "consent": "true"})
        self.assertEqual(self.client.post("/api/submissions/newsletter/", {"email": "reader@example.com", "consent": "true"}).status_code, 429)

    def test_invalid_attachments_are_rejected(self):
        for filename, content in [("test.html", b"html"), ("fake.jpg", b"not an image"), ("fake.pdf", b"not a PDF")]:
            response = self.client.post("/api/submissions/nominations/", self.nomination(portfolio_file=SimpleUploadedFile(filename, content)))
            self.assertEqual(response.status_code, 400)

    def test_portfolio_is_private_and_admin_can_review(self):
        storage = Nomination._meta.get_field("portfolio_file").storage
        with tempfile.TemporaryDirectory() as directory:
            from unittest.mock import patch
            with patch.object(storage, "_location", directory):
                storage.__dict__.pop("location", None)
                storage.__dict__.pop("base_location", None)
                response = self.client.post("/api/submissions/nominations/", self.nomination(portfolio_file=SimpleUploadedFile("portfolio.pdf", b"%PDF-1.4\n%%EOF")))
                self.assertEqual(response.status_code, 201, response.content)
                record = Nomination.objects.get()
                url = reverse("nomination-portfolio", args=[record.pk])
                self.assertEqual(self.client.get(url).status_code, 403)
                reader = get_user_model().objects.create_user(username="reader", password="test-only")
                self.client.force_login(reader)
                self.assertEqual(self.client.get(url).status_code, 403)
                editor = get_user_model().objects.create_superuser(username="editor", email="editor@example.com", password="test-only")
                self.client.force_login(editor)
                response = self.client.get(url)
                self.assertEqual(response.status_code, 200)
                self.assertIn("attachment", response["Content-Disposition"])
                self.assertTrue(b"".join(response.streaming_content).startswith(b"%PDF-"))
                response = self.client.get(reverse("wagtailsnippets_submissions_nomination:edit", args=[record.pk]))
                self.assertContains(response, "Download portfolio")
                response = self.client.post(reverse("wagtailsnippets_submissions_nomination:edit", args=[record.pk]), {"status": "shortlisted", "notes": "Review notes"})
                self.assertEqual(response.status_code, 302)
                record.refresh_from_db()
                self.assertEqual(record.status, "shortlisted")
                self.assertEqual(record.notes, "Review notes")
        storage.__dict__.pop("location", None)
        storage.__dict__.pop("base_location", None)

    def test_wagtail_lists_and_enquiry_status_updates(self):
        editor = get_user_model().objects.create_superuser(username="editor", email="editor@example.com", password="test-only")
        self.client.force_login(editor)
        for model in ["newslettersubscriber", "nomination", "enquiry"]:
            self.assertEqual(self.client.get(reverse(f"wagtailsnippets_submissions_{model}:list")).status_code, 200)
        self.client.post("/api/submissions/enquiries/", self.enquiry())
        record = Enquiry.objects.get()
        response = self.client.post(reverse("wagtailsnippets_submissions_enquiry:edit", args=[record.pk]), {"status": "resolved", "notes": "Handled"})
        self.assertEqual(response.status_code, 302)
        record.refresh_from_db()
        self.assertEqual(record.status, "resolved")

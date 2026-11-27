from django.core import mail
from django.test import SimpleTestCase, override_settings

from .branded_email import Email, button, code, details, note, para, send, table
from .operational_email import deliver, notify_operations


@override_settings(AUTH_EMAIL_ENABLED=True, FRONTEND_BASE_URL="https://glitzafrica.com",
                   DEFAULT_FROM_EMAIL="Glitz Africa <hello@glitzafrica.com>", OPERATIONS_EMAILS=["ops@example.com"])
class BrandedEmailTests(SimpleTestCase):
    def sample(self, name="Ama"):
        return Email(
            subject="Payment received",
            eyebrow="SheBoss Global",
            heading=f"Thank you, {name}.",
            preheader="We received USD 1,000.00.",
            blocks=[
                para(f"Hello {name}"),
                details([("Amount", "USD 1,000.00"), ("Empty", "")]),
                table(["Payment", "Status"], [{"cells": ["First", "Paid"], "tone": "ok"}]),
                button("View schedule", "https://glitzafrica.com/events/x/registration/tok"),
                note("Flights are not included."),
                code("Check-in code", "AB12CD34"),
            ],
            reason="You registered.",
        )

    def test_sends_html_and_plain_text(self):
        self.assertTrue(send(self.sample(), ["ama@example.com"]))
        message = mail.outbox[0]
        html, mime = message.alternatives[0]
        self.assertEqual(mime, "text/html")
        self.assertIn("https://glitzafrica.com/images/email/glitz-logo-white.png", html)
        self.assertIn("View schedule", html)
        self.assertIn("AB12CD34", html)
        self.assertIn("Amount: USD 1,000.00", message.body)
        self.assertIn("View schedule: https://glitzafrica.com/events/x/registration/tok", message.body)
        self.assertNotIn("Empty", message.body)  # Empty detail rows are dropped.

    def test_user_text_is_escaped(self):
        send(self.sample(name='<script>alert("x")</script>'), ["ama@example.com"])
        html = mail.outbox[0].alternatives[0][0]
        self.assertNotIn("<script>", html)
        self.assertIn("&lt;script&gt;", html)

    def test_reply_to(self):
        send(self.sample(), ["ama@example.com"], reply_to=["sheboss@glitzafrica.com"])
        self.assertEqual(mail.outbox[0].reply_to, ["sheboss@glitzafrica.com"])

    @override_settings(AUTH_EMAIL_ENABLED=False)
    def test_disabled_email_never_claims_delivery(self):
        self.assertFalse(send(self.sample(), ["ama@example.com"]))
        self.assertEqual(mail.outbox, [])

    def test_plain_text_callers_are_branded_too(self):
        deliver("Welcome", "Line one\nLine two\n\nSecond paragraph", ["ama@example.com"])
        notify_operations("Comment reported", "A comment was reported.")
        customer, ops = mail.outbox
        self.assertIn("glitz-logo-white.png", customer.alternatives[0][0])
        self.assertIn("Line one<br>Line two", customer.alternatives[0][0])
        self.assertEqual(ops.to, ["ops@example.com"])
        self.assertIn("Team notification", ops.alternatives[0][0])

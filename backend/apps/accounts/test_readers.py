import hashlib
import json
import secrets
from datetime import timedelta
from unittest.mock import Mock, patch
from urllib.parse import parse_qs, urlsplit

from django.contrib.auth import get_user_model
from django.core import mail
from django.core.cache import cache
from django.test import Client, TestCase, override_settings
from django.urls import reverse
from django.utils import timezone
from wagtail.models import Page

from apps.content.models import Post, PostIndexPage
from apps.events.models import Event, Ticket, TicketType
from apps.magazine.models import MagazineIssue, Order, OrderItem
from apps.submissions.models import Nomination
from .models import AccountToken, CommentReport, ReaderAccount, ReaderComment, SavedArticle
from .reader_services import create_reader, send_account_email


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend", AUTH_EMAIL_ENABLED=True,
                   GOOGLE_CLIENT_ID="test-client", GOOGLE_CLIENT_SECRET="test-secret", FRONTEND_BASE_URL="http://localhost:3000")
class ReaderTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.reader = create_reader("reader@example.com", "Reader", "Reader-password-493!", verified=True)
        cls.other = create_reader("other@example.com", "Other", "Other-password-382!", verified=True)
        cls.index = Page.objects.get(depth=1).add_child(instance=PostIndexPage(title="Stories", slug="reader-stories"))
        cls.post = cls.index.add_child(instance=Post(title="Public article", slug="public-article"))
        cls.post.save_revision().publish()
        cls.draft = cls.index.add_child(instance=Post(title="Draft article", slug="draft-article", live=False))

    def setUp(self):
        cache.clear()

    def api(self, route, data=None, client=None):
        client = client or self.client
        url = f"/api/visitor/{route}/"
        if data is None:
            return client.get(url)
        return client.post(url, json.dumps(data), content_type="application/json")

    def sign_in(self, reader=None):
        self.client.force_login((reader or self.reader).user)

    def make_token(self, purpose="verify", reader=None, expires=None):
        raw = secrets.token_urlsafe(32)
        AccountToken.objects.create(reader=reader or self.reader, digest=hashlib.sha256(raw.encode()).hexdigest(),
            purpose=purpose, expires_at=expires or timezone.now() + timedelta(hours=1))
        return raw

    def test_signup_creates_only_nonstaff_unverified_reader(self):
        response = self.api("register", {"email": "NEW@Example.com", "display_name": "New reader", "password": "Brand-new-password-583!", "is_staff": True})
        self.assertEqual(response.status_code, 200, response.content)
        reader = ReaderAccount.objects.get(email="new@example.com")
        self.assertFalse(reader.user.is_staff)
        self.assertFalse(reader.user.is_superuser)
        self.assertIsNone(reader.verified_at)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("action=verify", mail.outbox[0].body)
        self.assertNotIn("token", response.json())
        self.assertFalse(response.json()["reader"]["verified"])

    def test_signup_rejects_weak_password_and_existing_email(self):
        self.assertEqual(self.api("register", {"email": "test@example.com", "display_name": "Test", "password": "123"}).status_code, 400)
        self.assertEqual(self.api("register", {"email": "reader@example.com", "display_name": "Claim", "password": "Different-password-532!"}).status_code, 409)

    def test_staff_identity_cannot_be_claimed(self):
        get_user_model().objects.create_superuser(username="staff", email="staff@example.com", password="Staff-password-382!")
        self.assertEqual(self.api("register", {"email": "staff@example.com", "display_name": "Staff", "password": "Different-password-532!"}).status_code, 409)
        self.assertEqual(self.api("login", {"email": "staff@example.com", "password": "Staff-password-382!"}).status_code, 401)

    def test_login_logout_and_password_protection(self):
        self.assertEqual(self.api("login", {"email": "reader@example.com", "password": "wrong"}).status_code, 401)
        self.assertEqual(self.api("login", {"email": "reader@example.com", "password": "Reader-password-493!"}).status_code, 200)
        self.assertEqual(self.api("session").json()["reader"]["id"], self.reader.pk)
        self.assertEqual(self.api("logout", {}).status_code, 200)
        self.assertIsNone(self.api("session").json()["reader"])

    def test_csrf_required_on_login_and_changes(self):
        client = Client(enforce_csrf_checks=True)
        self.assertEqual(self.api("login", {"email": "reader@example.com", "password": "Reader-password-493!"}, client).status_code, 403)
        token = self.api("session", client=client).json()["csrf"]
        response = client.post("/api/visitor/login/", json.dumps({"email": "reader@example.com", "password": "Reader-password-493!"}), content_type="application/json", HTTP_X_CSRFTOKEN=token)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.api("profile", {"display_name": "Changed"}, client).status_code, 403)

    def test_verification_token_is_expiring_and_single_use(self):
        pending = create_reader("pending@example.com", "Pending", "Pending-password-732!")
        token = self.make_token(reader=pending)
        self.assertEqual(self.api("verification/confirm", {"token": token}).status_code, 200)
        self.assertEqual(self.api("verification/confirm", {"token": token}).status_code, 400)
        pending.refresh_from_db()
        self.assertIsNotNone(pending.verified_at)
        expired = self.make_token(expires=timezone.now() - timedelta(seconds=1))
        self.assertEqual(self.api("verification/confirm", {"token": expired}).status_code, 400)

    def test_reset_revokes_old_sessions_and_tokens(self):
        old_client = Client()
        old_client.force_login(self.reader.user)
        token = self.make_token("reset")
        response = self.api("password/reset", {"token": token, "password": "Changed-password-958!"})
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(self.api("session", client=old_client).json()["reader"])
        self.assertEqual(self.api("password/reset", {"token": token, "password": "Changed-password-959!"}).status_code, 400)

    def test_reset_response_does_not_disclose_email_membership(self):
        known = self.api("password/request", {"email": "reader@example.com"})
        unknown = self.api("password/request", {"email": "nobody@example.com"})
        self.assertEqual(known.json(), unknown.json())
        self.assertEqual(len(mail.outbox), 1)

    @override_settings(AUTH_EMAIL_ENABLED=False)
    def test_no_email_configuration_never_claims_delivery(self):
        self.assertEqual(self.api("password/request", {"email": "reader@example.com"}).status_code, 503)
        self.assertFalse(send_account_email(self.reader, "verify"))
        self.assertFalse(AccountToken.objects.exists())

    def test_profile_cannot_change_identity_or_privileges(self):
        self.sign_in()
        self.assertEqual(self.api("profile", {"display_name": "New name", "email": "other@example.com", "verified_at": "now", "is_staff": True}).status_code, 200)
        self.reader.refresh_from_db()
        self.assertEqual(self.reader.email, "reader@example.com")
        self.assertFalse(self.reader.user.is_staff)

    def test_dashboard_requires_verification_and_excludes_other_owners(self):
        own = Order.objects.create(email=self.reader.email, amount="10.00", status="paid")
        Order.objects.create(user=self.other.user, email=self.reader.email, amount="20.00", status="paid")
        Order.objects.create(email=self.other.email, amount="30.00", status="paid")
        Nomination.objects.create(open_call="designers", full_name="Reader", email=self.reader.email, statement="Statement", notes="Private note")
        self.sign_in()
        data = self.api("dashboard").json()
        self.assertEqual([order["id"] for order in data["orders"]], [own.pk])
        self.assertEqual(len(data["applications"]), 1)
        self.assertNotIn("Private note", json.dumps(data))
        self.reader.verified_at = None
        self.reader.save()
        self.assertEqual(self.api("dashboard").json()["orders"], [])
        self.assertEqual(self.api("dashboard").json()["applications"], [])

    def test_ticket_codes_only_shown_for_paid_owned_tickets(self):
        event = Event.objects.create(name="Event", slug="reader-event", start_date="2026-11-01")
        tier = TicketType.objects.create(event=event, name="Seat", price="10", capacity=100)
        paid = Ticket.objects.create(event=event, ticket_type=tier, buyer_email=self.reader.email, status="paid")
        Ticket.objects.create(event=event, ticket_type=tier, buyer_email=self.reader.email, status="pending")
        Ticket.objects.create(event=event, ticket_type=tier, buyer_email=self.other.email, status="paid")
        self.sign_in()
        data = self.api("dashboard").json()["tickets"]
        self.assertEqual(len(data), 2)
        self.assertEqual([item["code"] for item in data if item["code"]], [paid.check_in_code])

    def test_save_articles_is_private_and_draft_is_inaccessible(self):
        self.sign_in()
        self.assertEqual(self.api("saved/public-article", {"saved": True}).status_code, 200)
        self.assertEqual(self.api("saved/public-article", {"saved": True}).status_code, 200)
        self.assertEqual(SavedArticle.objects.count(), 1)
        self.assertEqual(self.api("saved/draft-article", {"saved": True}).status_code, 404)
        self.sign_in(self.other)
        self.assertEqual(self.api("dashboard").json()["saved"], [])

    def test_comments_publish_immediately_without_exposing_email(self):
        self.sign_in()
        self.assertEqual(self.api("comments/public-article", {"body": "An interesting story."}).status_code, 200)
        self.client.logout()
        response = self.api("comments/public-article")
        self.assertEqual(response.json()["comments"][0]["body"], "An interesting story.")
        self.assertNotContains(response, self.reader.email)
        self.assertNotContains(response, "google_subject")

    def test_comments_require_verified_active_reader_and_published_post(self):
        self.assertEqual(self.api("comments/public-article", {"body": "Test"}).status_code, 401)
        self.sign_in()
        self.assertEqual(self.api("comments/draft-article", {"body": "Test"}).status_code, 404)
        self.assertEqual(self.api("comments/public-article", {"body": " "}).status_code, 400)
        self.assertEqual(self.api("comments/public-article", {"body": "x" * 2001}).status_code, 400)
        self.reader.verified_at = None
        self.reader.save()
        self.assertEqual(self.api("comments/public-article", {"body": "Test"}).status_code, 403)

    def test_comments_ownership_and_moderation_are_preserved(self):
        comment = ReaderComment.objects.create(post=self.post, reader=self.reader, body="Original", hidden=True)
        self.sign_in(self.other)
        self.assertEqual(self.api(f"comments/public-article/{comment.pk}", {"action": "edit", "body": "Intrusion"}).status_code, 403)
        self.assertEqual(self.api("comments/public-article").json()["comments"], [])
        self.sign_in()
        self.assertEqual(self.api(f"comments/public-article/{comment.pk}", {"action": "edit", "body": "Updated", "hidden": False}).status_code, 200)
        comment.refresh_from_db()
        self.assertTrue(comment.hidden)
        self.assertTrue(self.api("comments/public-article").json()["comments"][0]["hidden"])
        self.assertEqual(self.api(f"comments/public-article/{comment.pk}", {"action": "delete"}).status_code, 200)

    def test_suspended_reader_can_delete_but_not_add_or_edit(self):
        comment = ReaderComment.objects.create(post=self.post, reader=self.reader, body="Original")
        self.reader.commenting_suspended = True
        self.reader.save()
        self.sign_in()
        self.assertEqual(self.api("comments/public-article", {"body": "Test"}).status_code, 403)
        self.assertEqual(self.api(f"comments/public-article/{comment.pk}", {"action": "edit", "body": "Test"}).status_code, 403)
        self.assertEqual(self.api(f"comments/public-article/{comment.pk}", {"action": "delete"}).status_code, 200)

    def test_reports_are_deduplicated_and_private(self):
        comment = ReaderComment.objects.create(post=self.post, reader=self.other, body="Test")
        self.sign_in()
        for _ in range(2):
            self.assertEqual(self.api(f"comments/public-article/{comment.pk}", {"action": "report", "reason": "Spam"}).status_code, 200)
        self.assertEqual(CommentReport.objects.count(), 1)
        self.assertNotIn("Spam", self.api("comments/public-article").content.decode())

    def test_wagtail_can_hide_comments_and_suspend_readers(self):
        staff = get_user_model().objects.create_superuser(username="moderator", email="mod@example.com", password="Moderator-password-928!")
        comment = ReaderComment.objects.create(post=self.post, reader=self.reader, body="Test")
        self.client.force_login(staff)
        for name in ["readeraccount", "readercomment", "commentreport"]:
            self.assertEqual(self.client.get(reverse(f"wagtailsnippets_accounts_{name}:list")).status_code, 200)
        self.assertEqual(self.client.post(reverse("wagtailsnippets_accounts_readercomment:edit", args=[comment.pk]), {"hidden": "on"}).status_code, 302)
        comment.refresh_from_db()
        self.assertTrue(comment.hidden)
        self.assertEqual(self.client.post(reverse("wagtailsnippets_accounts_readeraccount:edit", args=[self.reader.pk]), {"commenting_suspended": "on"}).status_code, 302)
        self.reader.refresh_from_db()
        self.assertTrue(self.reader.commenting_suspended)

    def google_flow(self, link=False):
        response = self.api("google/start", {"link": link})
        self.assertEqual(response.status_code, 200, response.content)
        query = parse_qs(urlsplit(response.json()["url"]).query)
        self.assertEqual(query["code_challenge_method"], ["S256"])
        return query["state"][0], query["nonce"][0]

    def google_finish(self, state, nonce, email="newreader@gmail.com", subject="google-123", **extra):
        claims = {"sub": subject, "email": email, "email_verified": True, "nonce": nonce, "name": "Google reader", **extra}
        with patch("apps.accounts.google_login.requests.post", return_value=Mock(json=lambda: {"id_token": "signed"})), patch("apps.accounts.google_login.id_token.verify_oauth2_token", return_value=claims):
            return self.client.get("/api/visitor/google/callback/", {"code": "code", "state": state})

    def test_google_signup_and_returning_subject(self):
        state, nonce = self.google_flow()
        response = self.google_finish(state, nonce)
        self.assertEqual(response.url, "http://localhost:3000/account")
        reader = ReaderAccount.objects.get(google_subject="google-123")
        self.assertIsNotNone(reader.verified_at)
        self.assertFalse(reader.user.has_usable_password())
        self.assertFalse(reader.user.is_staff)
        self.client.logout()
        state, nonce = self.google_flow()
        self.google_finish(state, nonce)
        self.assertEqual(self.api("session").json()["reader"]["id"], reader.pk)

    def test_google_never_auto_links_existing_email(self):
        state, nonce = self.google_flow()
        response = self.google_finish(state, nonce, email=self.reader.email)
        self.assertIn("error=", response.url)
        self.reader.refresh_from_db()
        self.assertIsNone(self.reader.google_subject)
        self.assertIsNone(self.api("session").json()["reader"])

    def test_google_link_requires_matching_verified_session(self):
        self.sign_in()
        state, nonce = self.google_flow(link=True)
        self.assertNotIn("error=", self.google_finish(state, nonce, email=self.reader.email).url)
        self.reader.refresh_from_db()
        self.assertEqual(self.reader.google_subject, "google-123")

    def test_google_rejects_wrong_state_nonce_or_unverified_claim(self):
        state, nonce = self.google_flow()
        self.assertIn("error=", self.google_finish("wrong", nonce).url)
        state, nonce = self.google_flow()
        self.assertIn("error=", self.google_finish(state, "wrong").url)
        state, nonce = self.google_flow()
        self.assertIn("error=", self.google_finish(state, nonce, email_verified=False).url)
        self.assertFalse(ReaderAccount.objects.filter(google_subject="google-123").exists())

    def test_google_third_party_mailbox_needs_local_verification(self):
        state, nonce = self.google_flow()
        self.google_finish(state, nonce, email="newreader@example.net")
        self.assertIsNone(ReaderAccount.objects.get(google_subject="google-123").verified_at)
        self.assertEqual(len(mail.outbox), 1)

from django.contrib.auth import get_user_model
from django.test import RequestFactory, SimpleTestCase, TestCase
from django.urls import reverse
from wagtail.models import Page

from apps.content.models import Post, PostIndexPage


class PostPreviewTests(SimpleTestCase):
    def test_unsaved_post_renders_current_content(self):
        page = Post(
            title="Unsaved preview title",
            slug="unsaved-preview",
            content_type_id=1,
            dek="An unpublished summary",
            author_name="Preview author",
            body=[
                ("paragraph", "<p>Draft <strong>formatted text</strong></p>"),
                ("quote", {"quote": "A draft quote", "attribution": "An editor"}),
            ],
        )
        response = page.serve_preview(RequestFactory().get("/"), "")
        response.render()
        self.assertContains(response, "Unsaved preview title")
        self.assertContains(response, "An unpublished summary")
        self.assertContains(response, "<strong>formatted text</strong>", html=True)
        self.assertContains(response, "A draft quote")
        self.assertContains(response, "An editor")
        self.assertNotIn("Location", response)

    def test_empty_post_can_be_previewed(self):
        page = Post(title="New post", content_type_id=1)
        response = page.serve_preview(RequestFactory().get("/"), "")
        response.render()
        self.assertContains(response, "New post")


class PostAdminPreviewTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.editor = get_user_model().objects.create_superuser(
            username="preview-editor", email="preview@example.com", password="test-only"
        )
        cls.index = Page.objects.get(depth=1).add_child(
            instance=PostIndexPage(title="Stories", slug="preview-stories")
        )
        cls.post = cls.index.add_child(
            instance=Post(title="Published title", slug="preview-post")
        )
        cls.post.save_revision().publish()
        cls.post.title = "Saved draft title"
        cls.post.save_revision()

    def test_saved_draft_uses_revision_not_published_content(self):
        self.client.force_login(self.editor)
        response = self.client.get(reverse("wagtailadmin_pages:view_draft", args=[self.post.pk]))
        self.assertContains(response, "Saved draft title")
        self.assertNotContains(response, "Published title")
        self.assertIn("private", response.headers["Cache-Control"])

    def test_live_preview_shows_unsaved_changes_without_publishing(self):
        self.client.force_login(self.editor)
        url = reverse("wagtailadmin_pages:preview_on_edit", args=[self.post.pk])
        response = self.client.post(url, {
            "title": "Unsaved editor title",
            "slug": self.post.slug,
            "body-count": "0",
            "gallery-TOTAL_FORMS": "0",
            "gallery-INITIAL_FORMS": "0",
            "gallery-MIN_NUM_FORMS": "0",
            "gallery-MAX_NUM_FORMS": "1000",
        })
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["is_valid"])
        response = self.client.get(url, {"in_preview_panel": "true"})
        self.assertContains(response, "Unsaved editor title")
        self.assertEqual(response.headers["X-Frame-Options"], "SAMEORIGIN")
        self.post.refresh_from_db()
        self.assertEqual(self.post.title, "Published title")

    def test_anonymous_user_cannot_view_draft(self):
        response = self.client.get(reverse("wagtailadmin_pages:view_draft", args=[self.post.pk]))
        self.assertEqual(response.status_code, 302)
        self.assertIn("/login/", response.url)

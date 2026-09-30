from datetime import date
from io import BytesIO
from PIL import Image as PillowImage
from wagtail.images import get_image_model

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import SimpleTestCase, TestCase, override_settings
from django.urls import reverse

from .media import video_embed_url
from .models import Photo, PressCoverage, Video


class VideoValidationTests(SimpleTestCase):
    def test_supported_links_become_embed_urls(self):
        for link in (
            "https://youtu.be/abcdefghijk",
            "https://www.youtube.com/watch?v=abcdefghijk&t=20",
            "https://youtube.com/shorts/abcdefghijk",
        ):
            with self.subTest(link=link):
                self.assertEqual(video_embed_url(link), "https://www.youtube-nocookie.com/embed/abcdefghijk")
        self.assertEqual(video_embed_url("https://vimeo.com/123456"), "https://player.vimeo.com/video/123456")

    def test_unsupported_links_are_rejected(self):
        for link in ("https://example.com/video", "https://youtube.com.evil.test/watch?v=abcdefghijk", "javascript:alert(1)", "https://youtube.com/playlist?list=123"):
            with self.subTest(link=link), self.assertRaises(ValidationError):
                Video(title="Test", video_url=link).clean()

    def test_requires_exactly_one_source(self):
        with self.assertRaises(ValidationError):
            Video(title="Empty").clean()
        with self.assertRaises(ValidationError):
            Video(title="Both", video_url="https://youtu.be/abcdefghijk", video_file="videos/test.mp4").clean()
        Video(title="Upload", video_file="videos/test.mp4").clean()

    def test_invalid_upload_extension_is_rejected(self):
        with self.assertRaises(ValidationError):
            Video._meta.get_field("video_file").clean(SimpleUploadedFile("test.html", b"not video"), None)

    def test_press_requires_web_link(self):
        with self.assertRaises(ValidationError):
            PressCoverage._meta.get_field("article_url").clean("ftp://example.com/article", None)


@override_settings(STORAGES={
    "default": {"BACKEND": "django.core.files.storage.InMemoryStorage"},
    "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
})
class MediaAPITests(TestCase):
    def test_photo_gallery_visibility_order_and_renditions(self):
        image_data = BytesIO()
        PillowImage.new("RGB", (1200, 600), color="blue").save(image_data, format="JPEG")
        image = get_image_model().objects.create(
            title="Gallery image", file=SimpleUploadedFile("gallery.jpg", image_data.getvalue(), content_type="image/jpeg")
        )
        hidden = Photo.objects.create(title="Hidden photo", image=image, alt_text="Blue image")
        for title, order in [("Last photo", 20), ("First photo", 1)]:
            Photo.objects.create(title=title, image=image, alt_text="Blue image", caption="Runway moment", credit="Photographer", display_order=order, is_visible=True)
        response = self.client.get("/api/photos/")
        self.assertEqual(response.status_code, 200)
        photos = response.json()
        self.assertEqual([photo["title"] for photo in photos], ["First photo", "Last photo"])
        self.assertEqual(photos[0]["alt_text"], "Blue image")
        self.assertEqual(photos[0]["credit"], "Photographer")
        self.assertTrue(photos[0]["image"]["full_url"].startswith("http"))
        self.assertEqual(photos[0]["full_image"]["width"], 1200)
        self.assertEqual(photos[0]["full_image"]["height"], 600)
        self.assertEqual(self.client.get(f"/api/photos/{hidden.pk}/").status_code, 404)
        self.assertEqual(self.client.post("/api/photos/", {}).status_code, 405)

    def test_video_visibility_order_and_read_only_access(self):
        hidden = Video.objects.create(title="Hidden", video_url="https://youtu.be/abcdefghijk")
        last = Video.objects.create(title="Last", video_url="https://youtu.be/abcdefghijk", is_visible=True, display_order=20)
        first = Video.objects.create(title="First", video_url="https://vimeo.com/123456", is_visible=True, display_order=1)
        response = self.client.get("/api/videos/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["id"] for item in response.json()], [first.pk, last.pk])
        self.assertEqual(response.json()[0]["embed_url"], "https://player.vimeo.com/video/123456")
        self.assertIsNone(response.json()[0]["thumbnail"])
        self.assertEqual(self.client.get(f"/api/videos/{hidden.pk}/").status_code, 404)
        self.assertEqual(self.client.post("/api/videos/", {"title": "No"}).status_code, 405)

    @override_settings(WAGTAILADMIN_BASE_URL="https://cms.example.com")
    def test_uploaded_video_has_absolute_playback_url(self):
        Video.objects.create(title="Upload", is_visible=True, video_file=SimpleUploadedFile("film.mp4", b"test file"))
        data = self.client.get("/api/videos/").json()[0]
        self.assertTrue(data["file_url"].startswith("https://cms.example.com/media/media_videos/"))
        self.assertIsNone(data["embed_url"])

    def test_press_visibility_order_and_links(self):
        hidden = PressCoverage.objects.create(headline="Hidden", publication="Paper", article_url="https://example.com/hidden", published_date=date(2026, 1, 1))
        for headline, order in [("Last", 20), ("First", 1)]:
            PressCoverage.objects.create(headline=headline, publication="Paper", article_url="https://example.com/article", published_date=date(2026, 1, 1), is_visible=True, display_order=order)
        data = self.client.get("/api/press-coverage/").json()
        self.assertEqual([item["headline"] for item in data], ["First", "Last"])
        self.assertEqual(data[0]["article_url"], "https://example.com/article")
        self.assertEqual(self.client.get(f"/api/press-coverage/{hidden.pk}/").status_code, 404)
        self.assertEqual(self.client.post("/api/press-coverage/", {}).status_code, 405)

    def test_snippet_forms_are_available(self):
        editor = get_user_model().objects.create_superuser(username="media-editor", email="editor@example.com", password="test-only")
        self.client.force_login(editor)
        response = self.client.get(reverse("wagtailsnippets_content_photo:add"))
        self.assertContains(response, 'name="image"')
        self.assertContains(response, 'name="alt_text"')
        response = self.client.get(reverse("wagtailsnippets_content_video:add"))
        self.assertContains(response, 'name="video_file"')
        self.assertContains(response, 'name="is_visible"')
        response = self.client.get(reverse("wagtailsnippets_content_presscoverage:add"))
        self.assertContains(response, 'name="article_url"')

from io import BytesIO

from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from PIL import Image
from wagtail.images import get_image_model

from .models import HomepageSlide, PartnerLogo, Video


@override_settings(STORAGES={
    "default": {"BACKEND": "django.core.files.storage.InMemoryStorage"},
    "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
})
class HomepageTests(TestCase):
    def setUp(self):
        data = BytesIO()
        Image.new("RGB", (100, 60), color="blue").save(data, "PNG")
        self.image = get_image_model().objects.create(title="Poster", file=SimpleUploadedFile("poster.png", data.getvalue(), content_type="image/png"))

    def test_only_visible_slides_are_public_and_ordered(self):
        hidden = HomepageSlide.objects.create(title="Hidden", poster=self.image)
        HomepageSlide.objects.create(title="Last", poster=self.image, display_order=10, is_visible=True)
        HomepageSlide.objects.create(title="First", poster=self.image, display_order=1, is_visible=True)
        response = self.client.get("/api/homepage-slides/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual([slide["title"] for slide in response.json()], ["First", "Last"])
        self.assertIn("full_url", response.json()[0]["poster"])
        self.assertEqual(self.client.get(f"/api/homepage-slides/{hidden.pk}/").status_code, 404)
        self.assertEqual(self.client.post("/api/homepage-slides/", {}).status_code, 405)

    def test_hidden_video_is_not_exposed_by_visible_slide(self):
        video = Video.objects.create(title="Film", video_file="media_videos/film.mp4", is_visible=True)
        slide = HomepageSlide.objects.create(title="Film", poster=self.image, video=video, is_visible=True)
        url = f"/api/homepage-slides/{slide.pk}/"
        self.assertTrue(self.client.get(url).json()["video_url"].endswith("/media_videos/film.mp4"))
        video.is_visible = False
        video.save()
        self.assertIsNone(self.client.get(url).json()["video_url"])

    def test_slides_require_local_links_and_uploaded_visible_videos(self):
        for path in ("https://example.com", "//example.com", "/\\example.com", "/ bad"):
            with self.subTest(path=path), self.assertRaises(ValidationError):
                HomepageSlide(title="Test", poster=self.image, button_path=path).clean()
        video = Video.objects.create(title="Embedded", video_url="https://youtu.be/abcdefghijk", is_visible=True)
        with self.assertRaises(ValidationError):
            HomepageSlide(title="Test", poster=self.image, video=video).clean()
        HomepageSlide(title="Poster only", poster=self.image, button_path="/events/gafw").clean()

    def test_partner_visibility_and_logo_rendition(self):
        hidden = PartnerLogo.objects.create(name="Hidden", logo=self.image)
        PartnerLogo.objects.create(name="Partner", logo=self.image, is_visible=True)
        response = self.client.get("/api/partner-logos/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["name"] for item in response.json()], ["Partner"])
        self.assertIn("full_url", response.json()[0]["logo"])
        self.assertEqual(self.client.get(f"/api/partner-logos/{hidden.pk}/").status_code, 404)
        self.assertEqual(self.client.post("/api/partner-logos/", {}).status_code, 405)

from django.apps import AppConfig


class ContentConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.content"

    def ready(self):
        # TechNE's MySQL service has returned 0 affected rows for some valid
        # no-op UPDATEs even though Django requests CLIENT_FOUND_ROWS. Django
        # normally interprets that as "the row was deleted" and falls back to
        # INSERT, which produces duplicate-primary-key errors when Wagtail
        # saves page-subscription and multi-table page records. The legacy
        # select-on-save path verifies that the row still exists before ever
        # falling back to INSERT.
        from wagtail.models import PageSubscription

        from .models import Post, PostIndexPage

        for model in (PageSubscription, Post, PostIndexPage):
            model._meta.select_on_save = True

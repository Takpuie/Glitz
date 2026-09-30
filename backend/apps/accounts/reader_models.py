from django.conf import settings
from django.db import models
from wagtail.admin.panels import FieldPanel
from wagtail.permission_policies import ModelPermissionPolicy
from wagtail.permissions import register_permission_policy
from wagtail.snippets.models import register_snippet
from wagtail.snippets.views.snippets import SnippetViewSet


class ReaderAccount(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reader_account")
    email = models.EmailField(unique=True)
    display_name = models.CharField(max_length=80)
    verified_at = models.DateTimeField(null=True, blank=True)
    google_subject = models.CharField(max_length=255, unique=True, null=True, blank=True)
    commenting_suspended = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    panels = [FieldPanel(field, read_only=True) for field in ("email", "display_name", "verified_at", "created_at")] + [FieldPanel("commenting_suspended")]

    def __str__(self):
        return self.display_name


class AccountToken(models.Model):
    reader = models.ForeignKey(ReaderAccount, on_delete=models.CASCADE)
    digest = models.CharField(max_length=64, unique=True)
    purpose = models.CharField(max_length=12)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)


class SavedArticle(models.Model):
    reader = models.ForeignKey(ReaderAccount, on_delete=models.CASCADE, related_name="saved_articles")
    post = models.ForeignKey("content.Post", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["reader", "post"], name="unique_reader_saved_article")]
        ordering = ["-created_at"]


class ReaderComment(models.Model):
    post = models.ForeignKey("content.Post", on_delete=models.CASCADE, related_name="reader_comments")
    reader = models.ForeignKey(ReaderAccount, on_delete=models.CASCADE)
    body = models.TextField(max_length=2000)
    hidden = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(auto_now=True)
    panels = [FieldPanel(field, read_only=True) for field in ("post", "reader", "body", "created_at", "edited_at")] + [FieldPanel("hidden")]

    class Meta:
        ordering = ["-created_at", "-pk"]

    def __str__(self):
        return self.body[:80]


class CommentReport(models.Model):
    comment = models.ForeignKey(ReaderComment, on_delete=models.CASCADE, related_name="reports")
    reader = models.ForeignKey(ReaderAccount, on_delete=models.CASCADE)
    reason = models.CharField(max_length=500)
    resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    panels = [FieldPanel(field, read_only=True) for field in ("comment", "reader", "reason", "created_at")] + [FieldPanel("resolved")]

    class Meta:
        constraints = [models.UniqueConstraint(fields=["reader", "comment"], name="unique_reader_comment_report")]
        ordering = ["-created_at"]

    def __str__(self):
        return f"Report on comment {self.comment_id}"


class ReviewPermissionPolicy(ModelPermissionPolicy):
    def user_has_permission(self, user, action):
        return action != "add" and super().user_has_permission(user, action)


class ReaderAccountViewSet(SnippetViewSet):
    model = ReaderAccount
    icon = "user"
    list_display = ["display_name", "email", "verified_at", "commenting_suspended"]
    list_filter = ["commenting_suspended"]
    search_fields = ["display_name", "email"]


class ReaderCommentViewSet(SnippetViewSet):
    model = ReaderComment
    icon = "comment"
    list_display = ["body", "post", "reader", "hidden", "created_at"]
    list_filter = ["hidden", "post"]
    search_fields = ["body", "reader__display_name"]


class CommentReportViewSet(SnippetViewSet):
    model = CommentReport
    icon = "warning"
    list_display = ["comment", "reader", "reason", "resolved", "created_at"]
    list_filter = ["resolved"]


for viewset in (ReaderAccountViewSet, ReaderCommentViewSet, CommentReportViewSet):
    register_permission_policy(viewset.model, ReviewPermissionPolicy(viewset.model))
    register_snippet(viewset)

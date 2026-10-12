from glitz_backend.operational_email import notify_operations
from .models import CommentReport, ReaderComment


def notify_comment_moderators(comment_id):
    comment = ReaderComment.objects.select_related("reader", "post").get(pk=comment_id)
    notify_operations("Reader comment awaiting moderation", "\n".join([
        "A reader comment is waiting for moderation in Wagtail.", "",
        f"Article: {comment.post.title}", f"Reader: {comment.reader.display_name} <{comment.reader.email}>",
        "", comment.body,
    ]))


def notify_comment_report(report_id):
    report = CommentReport.objects.select_related("reader", "comment__post").get(pk=report_id)
    notify_operations("Reader comment reported", "\n".join([
        "A published comment has been reported.", "", f"Article: {report.comment.post.title}",
        f"Reported by: {report.reader.display_name} <{report.reader.email}>",
        f"Reason: {report.reason}",
    ]))


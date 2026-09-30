from pathlib import Path

from django.conf import settings
from django.core.files.storage import FileSystemStorage


class PortfolioStorage(FileSystemStorage):
    """Application attachments are outside publicly served MEDIA_ROOT."""
    def __init__(self):
        super().__init__(location=Path(settings.BASE_DIR) / "private_uploads")

    def url(self, name):
        raise ValueError("Portfolio files are only available through the staff download view.")

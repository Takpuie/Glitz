import csv
import html
import re
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

from django.core.management.base import BaseCommand, CommandError
from django.utils.html import strip_tags
from django.utils.text import slugify

from apps.content.models import Category, Post, PostIndexPage


IMG_RE = re.compile(r'<img\b[^>]*\bsrc=["\']([^"\']+)["\'][^>]*>', re.I)
UNSAFE_RE = re.compile(r'<(script|style|iframe|form|object|embed)\b[^>]*>.*?</\1\s*>', re.I | re.S)
SHORTCODE_RE = re.compile(r'\[(?:/?)[a-zA-Z][^\]]*\]')


def clean_html(value):
    value = UNSAFE_RE.sub("", value or "")
    value = IMG_RE.sub("", value)
    value = SHORTCODE_RE.sub("", value)
    value = re.sub(r'<!--.*?-->', "", value, flags=re.S)
    return value.strip()


def summary(excerpt, content):
    text = re.sub(r"\s+", " ", html.unescape(strip_tags(excerpt or content or ""))).strip()
    return text[:297] + "..." if len(text) > 300 else text


class Command(BaseCommand):
    help = "Import published WordPress posts from a wp_posts CSV export. Dry-run unless --commit is supplied."

    def add_arguments(self, parser):
        parser.add_argument("csv_path")
        parser.add_argument("--commit", action="store_true")
        parser.add_argument("--report", help="Write recoverable embedded image URLs to this CSV path.")

    def handle(self, *args, **options):
        source = Path(options["csv_path"])
        if not source.is_file():
            raise CommandError(f"CSV not found: {source}")
        parent = PostIndexPage.objects.first()
        if not parent:
            raise CommandError("Create a PostIndexPage before importing posts.")
        category, _ = Category.objects.get_or_create(slug="archive", defaults={"name": "Archive"})
        existing = set(Post.objects.values_list("slug", flat=True))
        seen = set()
        imported = skipped = invalid = 0
        image_rows = []

        with source.open(encoding="utf-8-sig", errors="replace", newline="") as handle:
            reader = csv.DictReader(handle)
            required = {"ID", "post_title", "post_name", "post_date", "post_content", "post_excerpt", "post_status", "post_type"}
            if not reader.fieldnames or not required.issubset(reader.fieldnames):
                raise CommandError("This is not a supported WordPress posts CSV export.")
            for row in reader:
                if row["post_type"] != "post" or row["post_status"] != "publish":
                    continue
                title = re.sub(r"\s+", " ", html.unescape(row["post_title"])).strip()[:255]
                slug = slugify(row["post_name"] or title)[:255]
                if not title or not slug:
                    invalid += 1
                    continue
                image_urls = IMG_RE.findall(row["post_content"] or "")
                for position, url in enumerate(image_urls, 1):
                    if urlparse(url).scheme in {"http", "https"}:
                        image_rows.append({"wordpress_id": row["ID"], "slug": slug, "title": title, "position": position, "image_url": url})
                if slug in existing or slug in seen:
                    skipped += 1
                    continue
                seen.add(slug)
                try:
                    published = datetime.strptime(row["post_date"], "%Y-%m-%d %H:%M:%S").date()
                except ValueError:
                    invalid += 1
                    continue
                body_html = clean_html(row["post_content"])
                words = len(strip_tags(body_html).split())
                if options["commit"]:
                    post = Post(
                        title=title, slug=slug, dek=summary(row["post_excerpt"], body_html),
                        author_name="Glitz Africa", category=category, published_date=published,
                        read_time_minutes=max(1, round(words / 220)) if words else 1,
                        body=[("paragraph", body_html)] if body_html else [],
                    )
                    parent.add_child(instance=post)
                    post.save_revision().publish()
                    existing.add(slug)
                imported += 1

        if options["report"]:
            report = Path(options["report"])
            report.parent.mkdir(parents=True, exist_ok=True)
            with report.open("w", encoding="utf-8-sig", newline="") as handle:
                writer = csv.DictWriter(handle, fieldnames=["wordpress_id", "slug", "title", "position", "image_url"])
                writer.writeheader()
                writer.writerows(image_rows)
        mode = "IMPORTED" if options["commit"] else "WOULD IMPORT"
        self.stdout.write(self.style.SUCCESS(f"{mode}: {imported}; skipped existing/duplicate: {skipped}; invalid: {invalid}; recoverable image URLs: {len(image_rows)}"))

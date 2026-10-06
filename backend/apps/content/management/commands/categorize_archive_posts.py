import re
from collections import Counter

from django.core.management.base import BaseCommand

from apps.content.models import Category, Post


CATEGORY_RULES = (
    ("Hair & Beauty", re.compile(
        r"\b(beauty|hair|hairstyle|braid|wig|makeup|cosmetic|skincare|skin care|"
        r"perfume|fragrance|nail|salon|barber|grooming)\b", re.I,
    )),
    ("Fashion", re.compile(
        r"\b(fashion|style|stylish|designer|design house|runway|couture|collection|"
        r"outfit|dress|gown|wardrobe|model|modelling|modeling|textile|fabric|"
        r"jewellery|jewelry|accessor(?:y|ies)|shoe|sneaker|handbag|clothing|wear)\b", re.I,
    )),
    ("Entertainment", re.compile(
        r"\b(entertainment|celebrity|actor|actress|film|movie|cinema|television|tv|"
        r"music|musician|singer|rapper|album|song|concert|festival|showbiz|"
        r"netflix|nollywood|ghallywood|grammy|oscars?|emmys?)\b", re.I,
    )),
    ("Lifestyle", re.compile(
        r"\b(lifestyle|travel|destination|hotel|restaurant|food|recipe|health|"
        r"wellness|fitness|relationship|marriage|wedding|parenting|motherhood|"
        r"career|business|entrepreneur|finance|money|home|decor|interior|"
        r"education|leadership|inspiration|self care|self-care)\b", re.I,
    )),
)


def category_for(post):
    # Titles and slugs describe the article itself. Legacy excerpts are often
    # polluted with sidebar/promotional copy from the old WordPress theme and
    # produce misleading matches (for example, politics filed as Lifestyle).
    text = " ".join((post.title or "", post.slug or ""))
    for name, pattern in CATEGORY_RULES:
        if pattern.search(text):
            return name
    return "News"


class Command(BaseCommand):
    help = "Classify WordPress archive imports into editorial categories. Dry-run unless --commit is supplied."

    def add_arguments(self, parser):
        parser.add_argument("--commit", action="store_true")

    def handle(self, *args, **options):
        archive = Category.objects.filter(slug="archive").first()
        if not archive:
            self.stdout.write(self.style.WARNING("No Archive category exists; nothing to classify."))
            return

        posts = list(Post.objects.filter(category=archive).only("id", "title", "slug", "dek", "category_id"))
        names = [name for name, _ in CATEGORY_RULES] + ["News"]
        categories = {}
        if options["commit"]:
            for name in names:
                slug = "hair-beauty" if name == "Hair & Beauty" else name.lower().replace(" & ", "-").replace(" ", "-")
                categories[name], _ = Category.objects.get_or_create(slug=slug, defaults={"name": name})

        counts = Counter()
        for post in posts:
            name = category_for(post)
            counts[name] += 1
            if options["commit"]:
                post.category_id = categories[name].id

        if options["commit"] and posts:
            Post.objects.bulk_update(posts, ["category"], batch_size=250)

        mode = "CATEGORIZED" if options["commit"] else "WOULD CATEGORIZE"
        self.stdout.write(self.style.SUCCESS(f"{mode}: {len(posts)}"))
        for name in names:
            self.stdout.write(f"  {name}: {counts[name]}")

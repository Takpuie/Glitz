"""Seeds enough real content to prove the pipeline end to end: categories,
a Stories index page with the full article catalog, one live event (GAFW)
with ticket types, and the current magazine issue. Safe to re-run — it
updates in place rather than duplicating.

Reuses the real GAFW / Female CEO Summit photography already approved for
the Next.js frontend (frontend/public/images/...) instead of placeholders.
"""

from datetime import date
from pathlib import Path

from django.core.files.images import ImageFile
from django.core.management.base import BaseCommand
from wagtail.images.models import Image
from wagtail.models import Page

from apps.content.models import Category, Post, PostIndexPage
from apps.events.models import Event, TicketType
from apps.magazine.models import MagazineIssue

FRONTEND_IMAGES = Path(__file__).resolve().parents[5] / "public" / "images"


def get_or_create_image(relative_path: str, title: str) -> Image | None:
    existing = Image.objects.filter(title=title).first()
    if existing:
        return existing
    file_path = FRONTEND_IMAGES / relative_path
    if not file_path.exists():
        return None
    with file_path.open("rb") as f:
        return Image.objects.create(title=title, file=ImageFile(f, name=file_path.name))


CATEGORIES = ["News", "Entertainment", "Fashion", "Hair & Beauty", "Lifestyle"]

POSTS = [
    {
        "slug": "gafw-2026-lineup",
        "title": "Inside the GAFW 2026 Lineup: Twenty Designers Redefining African Luxury",
        "dek": "From Accra to Lagos to the diaspora, the Glitz Africa Fashion Week runway returns this November with its most ambitious showcase yet.",
        "author_name": "Ama Boateng",
        "category": "Fashion",
        "published_date": date(2026, 9, 16),
        "read_time_minutes": 8,
        "image": ("gafw/hero-designer-and-model.jpg", "GAFW 2026 — designer and model"),
        "body": [
            "It is easy to talk about African fashion as a single story — one continent, one aesthetic, one moment. Spend an afternoon on the trade tent floor and that story falls apart within minutes.",
            "What emerges instead is closer to the truth: a hundred smaller stories, each with its own supply chain, its own client base, its own argument about what luxury means outside of Paris and Milan. This is the story Glitz Africa keeps returning to, issue after issue, event after event.",
            "“We are not asking for a seat at someone else's table anymore,” one designer told us backstage, still pinning a hem minutes before doors opened. “We built our own table. Now we're deciding who sits where.”",
        ],
    },
    {
        "slug": "ghana-female-ceo-summit-recap",
        "title": "Inside the Ghana Female CEO Summit: Expanding Trade Opportunities for Women-Led Enterprises",
        "dek": "Panellists on market access, lending gaps, and what actually moves the needle for women-owned businesses in Ghana.",
        "author_name": "Efua Mensah",
        "category": "News",
        "published_date": date(2026, 9, 12),
        "read_time_minutes": 7,
        "image": ("female-ceo-summit/panel-trade-opportunities.jpg", "Female CEO Summit — trade opportunities panel"),
        "body": [
            "Five panellists, one recurring theme: access to capital and access to markets are still the two biggest levers for women-led enterprises in Ghana — and neither moves without deliberate policy, not just goodwill.",
            "Evelyn Abakah of the Ghana Commodity Exchange opened with a number that reframed the room: women-owned SMEs make up nearly half of registered businesses in Ghana but receive a fraction of formal trade financing. The panel spent the next forty minutes on why.",
            "The clearest consensus was procedural, not aspirational — collateral requirements, invoice financing timelines, and export documentation were named repeatedly as the quiet mechanisms that keep the gap in place long after the policy language has caught up.",
        ],
    },
    {
        "slug": "kosi-yankey-ayeh-kaya-institute",
        "title": "Kosi Yankey-Ayeh on Building the KAYA Women's Leadership Institute From the Ground Up",
        "dek": "The former GIPC CEO on why she left the public sector to build a training pipeline for Ghana's next generation of women executives.",
        "author_name": "Nana Yaa Asante",
        "category": "News",
        "published_date": date(2026, 9, 10),
        "read_time_minutes": 9,
        "image": None,
        "body": [
            "Kosi Yankey-Ayeh spent seven years running the Ghana Investment Promotion Centre before she decided the more urgent work was upstream — not attracting investment, but building the executives who'd eventually negotiate it.",
            "“I kept meeting brilliant women who'd hit the same ceiling for the same reason,” she says. “Nobody had ever taught them the parts of leadership that aren't in the job description — how a boardroom actually works, who to call before the meeting, not during it.”",
            "KAYA's first cohort graduates in December. She's already planning the second.",
        ],
    },
    {
        "slug": "claudia-lumor-interview",
        "title": "Claudia Lumor on Building a Media House That Refuses to Choose One Lane",
        "dek": "The Glitz Africa founder on publishing, events, and why the brand had to become a platform.",
        "author_name": "Nana Yaa Asante",
        "category": "News",
        "published_date": date(2026, 8, 28),
        "read_time_minutes": 11,
        "image": None,
        "body": [
            "“We are not asking for a seat at someone else's table anymore,” Claudia Lumor says. “We built our own table. Now we're deciding who sits where.”",
            "It's a line she's used before, about a different context — but it holds just as well for Kollage Media itself. What started as a magazine now runs five annual events, a shop, and a foundation, and Lumor is unapologetic about the sprawl.",
            "“A magazine that only publishes can't fund an honours programme. An events company with no publication has no memory. You need both, or you're just doing one thing well and everything else badly.”",
        ],
    },
    {
        "slug": "gwoty-honourees-announced",
        "title": "Ghana Women of the Year 2026: Meet the Honourees",
        "dek": "Sixteen women across business, government, arts and advocacy join the GWOTY roll of honour.",
        "author_name": "Efua Mensah",
        "category": "News",
        "published_date": date(2026, 8, 20),
        "read_time_minutes": 6,
        "image": None,
        "body": [
            "Sixteen names, four categories, one criterion that doesn't change year to year: measurable impact, not just visibility.",
            "This year's list skews younger than usual — three honourees are under 35 — and includes, for the first time, a category recognising work in climate adaptation alongside the usual business, government and arts honours.",
            "Full profiles publish individually over the coming weeks; the honours dinner is set for December 6.",
        ],
    },
    {
        "slug": "gcb-bank-women-sme-fund",
        "title": "Inside GCB Bank's New GHS 50M Fund for Women-Owned SMEs",
        "dek": "Lower collateral requirements and a mentorship track — how the country's largest bank is trying to close the gender lending gap.",
        "author_name": "Efua Mensah",
        "category": "News",
        "published_date": date(2026, 9, 5),
        "read_time_minutes": 7,
        "image": None,
        "body": [
            "The headline number is GHS 50 million. The more interesting number is 30% — the share of the fund ring-fenced for businesses with no prior formal credit history at all.",
            "GCB's structure pairs every loan with six months of mandatory mentorship from the bank's SME desk, a condition designed less to police the money than to catch the operational mistakes that sink first-time borrowers before they become defaults.",
        ],
    },
    {
        "slug": "kente-couture-comeback",
        "title": "Kente, Reimagined: The Fabric's Quiet Couture Comeback",
        "dek": "A new generation of designers is taking Ghana's most storied textile onto international runways.",
        "author_name": "Kwame Owusu",
        "category": "Fashion",
        "published_date": date(2026, 8, 15),
        "read_time_minutes": 7,
        "image": None,
        "body": [
            "Kente has never left Ghanaian wardrobes, but it has spent the last decade mostly confined to ceremony — weddings, graduations, the occasional durbar. What's changed is who's cutting it, and for what.",
            "A handful of designers are now treating the strip-woven cloth as structural fabric rather than symbolic drape — tailored jackets, bias-cut gowns, pieces engineered so the pattern reads as couture rather than costume.",
        ],
    },
    {
        "slug": "christie-brown-ashanti-regalia-collection",
        "title": "Christie Brown's New Collection Draws on Ashanti Royal Regalia",
        "dek": "Gold-dust embroidery, kente structuring and a runway show staged like a durbar — inside the house's most ambitious season yet.",
        "author_name": "Ama Boateng",
        "category": "Fashion",
        "published_date": date(2026, 8, 22),
        "read_time_minutes": 6,
        "image": None,
        "body": [
            "The invitation alone signalled intent — hand-lettered, sealed with wax, delivered a week early. What followed was a show built less like a fashion presentation than a procession.",
            "Gold-dust embroidery, structured kente panelling and silhouettes borrowed from Ashanti royal regalia ran through eighteen looks, each one referencing a specific historical garment without literally reproducing it.",
        ],
    },
    {
        "slug": "slow-fashion-accra-independent-designers",
        "title": "The Rise of Slow Fashion Among Accra's Independent Designers",
        "dek": "Made-to-order runs, deadstock fabric and a generation of designers who would rather sell fewer pieces, better.",
        "author_name": "Selasi Tetteh",
        "category": "Fashion",
        "published_date": date(2026, 8, 12),
        "read_time_minutes": 7,
        "image": None,
        "body": [
            "None of the five designers we spoke to for this piece run a warehouse. Most don't have a fixed collection calendar. All of them are turning away wholesale orders on purpose.",
            "The math is straightforward once you hear it: a made-to-order piece at full price beats a discounted overrun every time, and deadstock fabric solves the sourcing problem that scale would otherwise force on them.",
        ],
    },
    {
        "slug": "why-african-fashion-weeks-matter",
        "title": "Why Africa Needs More Fashion Weeks, Not Fewer",
        "dek": "An argument for platform over prestige — and why GAFW's model of trade tents alongside runway is worth copying.",
        "author_name": "Editorial Board",
        "category": "Entertainment",
        "published_date": date(2026, 7, 30),
        "read_time_minutes": 6,
        "image": None,
        "body": [
            "The critique arrives every season, in some form: does the continent really need another fashion week? We think the question is upside down.",
            "GAFW's answer — trade tents running alongside the runway, buyers in the room on day one, not just editors — is the model worth scaling, not consolidating away.",
        ],
    },
    {
        "slug": "amaarae-gyakie-new-afrobeats-wave",
        "title": "Amaarae, Gyakie and the Sound Defining Ghana's New Afrobeats Wave",
        "dek": "Three producers on the alté-highlife hybrid that's pulling Accra back onto the continent's playlists.",
        "author_name": "Kwame Owusu",
        "category": "Entertainment",
        "published_date": date(2026, 8, 26),
        "read_time_minutes": 8,
        "image": None,
        "body": [
            "Ask three producers to define the sound and you'll get three different reference points — but all three will mention the same tempo range, the same guitar tone borrowed from highlife's back catalogue.",
            "What's actually new isn't the ingredients. It's the confidence to keep them unmixed — highlife guitar sitting next to trap hi-hats without either side getting sanded down to fit the other.",
        ],
    },
    {
        "slug": "sarkodie-grammy-nomination-hiplife",
        "title": "Sarkodie's Grammy Nomination and What It Means for Hip-Life",
        "dek": "A first for the genre — and a reminder of how long Ghanaian rap has been waiting for this exact recognition.",
        "author_name": "Editorial Board",
        "category": "Entertainment",
        "published_date": date(2026, 8, 18),
        "read_time_minutes": 5,
        "image": None,
        "body": [
            "Twenty years of hip-life records, and this is the first nomination of its kind. The delay says more about the Grammy's categories than about the genre.",
            "Sarkodie's response, when we reached him, was characteristically brief: “This one's not just mine.”",
        ],
    },
    {
        "slug": "skincare-harmattan-edit",
        "title": "The Harmattan Edit: Skincare for West Africa's Dry Season",
        "dek": "Dermatologists and editors weigh in on the routine that actually survives the dust and the dry heat.",
        "author_name": "Linda Appiah",
        "category": "Hair & Beauty",
        "published_date": date(2026, 8, 5),
        "read_time_minutes": 5,
        "image": None,
        "body": [
            "Harmattan skincare advice tends to repeat the same three words — moisturise, moisturise, moisturise — without addressing why so many routines fail anyway: most products aren't formulated for dust exposure, only dryness.",
            "We asked two Accra-based dermatologists to build a routine around barrier repair first, hydration second. Both landed on the same unglamorous answer: fewer products, applied more consistently.",
        ],
    },
    {
        "slug": "shea-butter-ghanaian-brands-going-global",
        "title": "Shea Butter, Reinvented: The Ghanaian Brands Going Global",
        "dek": "From Tamale co-operatives to Sephora shelves — how three founders took the country's most exported ingredient upmarket.",
        "author_name": "Linda Appiah",
        "category": "Hair & Beauty",
        "published_date": date(2026, 8, 8),
        "read_time_minutes": 6,
        "image": None,
        "body": [
            "Ghana has exported raw shea for decades. What's new is who's capturing the margin on the finished product — and it's increasingly Ghanaian founders, not the brands buying the raw material downstream.",
            "All three founders we spoke to started with the same co-operative relationships their mothers used. The difference is packaging, formulation, and a retail deal that keeps the story — and the profit — at home.",
        ],
    },
    {
        "slug": "accra-natural-hair-salon-boom",
        "title": "Inside Accra's Boom in Natural Hair Salons",
        "dek": "A wave of new studios is betting that clients want technique and community, not just a wash-and-go.",
        "author_name": "Adjoa Darko",
        "category": "Hair & Beauty",
        "published_date": date(2026, 7, 28),
        "read_time_minutes": 5,
        "image": None,
        "body": [
            "Five new natural-hair studios have opened in Accra this year, each one built around a specific technique — locs, twist-outs, protective styling — rather than a general-service menu.",
            "The specialisation is the pitch. Clients are choosing salons the way they'd choose a personal trainer: for the one thing that studio does better than anyone else in the neighbourhood.",
        ],
    },
    {
        "slug": "accra-chop-bar-revival",
        "title": "A Foodie's Guide to Accra's New Wave of Chop Bar Revivals",
        "dek": "Waakye and red-red get a design upgrade as a new generation reopens the neighbourhood chop bar as a destination.",
        "author_name": "Kwame Owusu",
        "category": "Lifestyle",
        "published_date": date(2026, 7, 20),
        "read_time_minutes": 6,
        "image": None,
        "body": [
            "The food hasn't changed — waakye is still waakye. What's changed is the room it's served in, and who's willing to queue for it now.",
            "A handful of second-generation owners are reopening their parents' chop bars with the same recipes and a completely different sense of what the space itself should feel like.",
        ],
    },
    {
        "slug": "boutique-hotels-ghanaian-hospitality",
        "title": "Inside the Boutique Hotels Redefining Ghanaian Hospitality",
        "dek": "Small, design-forward properties in Accra, Kumasi and the Volta Region are rewriting what a Ghana stay looks like.",
        "author_name": "Efua Mensah",
        "category": "Lifestyle",
        "published_date": date(2026, 7, 14),
        "read_time_minutes": 5,
        "image": None,
        "body": [
            "None of the properties on this list have more than twenty rooms. That's the point — each one is designed around a specific sense of place rather than a chain's template.",
            "What they share is a refusal of the generic international-hotel look. Furniture is commissioned locally, art is sourced from named artists, and the result reads as considered rather than default.",
        ],
    },
    {
        "slug": "living-accra-design-district",
        "title": "A Design-Lover's Weekend Guide to Accra's Osu District",
        "dek": "Studios, concept stores and the best light for a Sunday walk, mapped by Glitz Africa Living.",
        "author_name": "Selasi Tetteh",
        "category": "Lifestyle",
        "published_date": date(2026, 7, 24),
        "read_time_minutes": 4,
        "image": None,
        "body": [
            "Osu rewards a slow walk more than almost any other Accra neighbourhood — the kind where you plan two stops and end up making six.",
            "This route starts at the design studios clustered near Oxford Street, threads through two concept stores worth the detour, and ends where the light is best for a late-afternoon coffee.",
        ],
    },
]


class Command(BaseCommand):
    help = "Seed categories, the full article catalog, the GAFW event, and the current magazine issue."

    def handle(self, *args, **options):
        categories = {}
        for name in CATEGORIES:
            slug = name.lower().replace(" & ", "-").replace(" ", "-")
            cat, _ = Category.objects.update_or_create(slug=slug, defaults={"name": name})
            categories[name] = cat
        self.stdout.write(self.style.SUCCESS(f"Categories: {len(categories)}"))

        home = Page.objects.get(depth=2)
        index_page = PostIndexPage.objects.first()
        if not index_page:
            index_page = PostIndexPage(title="Stories", slug="stories", intro="Glitz Africa Journal")
            home.add_child(instance=index_page)
            index_page.save_revision().publish()
        self.stdout.write(self.style.SUCCESS(f"Post index page: {index_page.url_path}"))

        for data in POSTS:
            post = Post.objects.filter(slug=data["slug"]).first()
            cover_image = None
            if data["image"]:
                rel_path, image_title = data["image"]
                cover_image = get_or_create_image(rel_path, image_title)

            body = [{"type": "paragraph", "value": p} for p in data["body"]]

            if post:
                post.title = data["title"]
                post.dek = data["dek"]
                post.author_name = data["author_name"]
                post.category = categories[data["category"]]
                post.published_date = data["published_date"]
                post.read_time_minutes = data["read_time_minutes"]
                if cover_image:
                    post.cover_image = cover_image
                post.body = body
                post.save_revision().publish()
            else:
                post = Post(
                    title=data["title"],
                    slug=data["slug"],
                    dek=data["dek"],
                    author_name=data["author_name"],
                    category=categories[data["category"]],
                    published_date=data["published_date"],
                    read_time_minutes=data["read_time_minutes"],
                    cover_image=cover_image,
                    body=body,
                )
                index_page.add_child(instance=post)
                post.save_revision().publish()
        self.stdout.write(self.style.SUCCESS(f"Posts: {len(POSTS)}"))

        gafw_cover = get_or_create_image("gafw/group-finale-walk.jpg", "GAFW — finale walk")
        event, _ = Event.objects.update_or_create(
            slug="gafw",
            defaults={
                "name": "Glitz Africa Fashion Week",
                "tagline": "The continent's runway, three days in Accra.",
                "description": (
                    "Runway, exhibitions and the Young Designers Showcase — GAFW 2026 brings "
                    "together established houses and emerging talent from across Africa and "
                    "the diaspora for its landmark 3-day edition."
                ),
                "venue": "Accra International Conference Centre",
                "start_date": date(2026, 11, 10),
                "end_date": date(2026, 11, 13),
                "status": Event.Status.ON_SALE,
                "cover_image": gafw_cover,
            },
        )
        ticket_tiers = [
            {
                "name": "Runway — General",
                "description": "Single-day mainstage runway access, Day Three or Day Four.",
                "price": 450,
                "capacity": 800,
            },
            {
                "name": "Runway — VIP",
                "description": "Front-section seating, VIP reception access, gift bag.",
                "price": 1200,
                "capacity": 150,
            },
            {
                "name": "Trade Tents Pass",
                "description": "All-access to exhibitions and trade tents, Days One & Two.",
                "price": 150,
                "capacity": 2000,
            },
            {
                "name": "Full Festival Pass",
                "description": "All four days, VIP runway seating, GAFW Village access.",
                "price": 2800,
                "capacity": 300,
            },
            {
                "name": "Table of 10 — Finale Gala",
                "description": "Reserved table, finale runway and closing gala, Day Four.",
                "price": 18000,
                "capacity": 20,
            },
        ]
        for tier in ticket_tiers:
            TicketType.objects.update_or_create(
                event=event,
                name=tier["name"],
                defaults={"description": tier["description"], "price": tier["price"], "capacity": tier["capacity"]},
            )
        self.stdout.write(self.style.SUCCESS(f"Event: {event.name} ({event.ticket_types.count()} ticket types)"))

        issues = [
            {
                "slug": "issue-118",
                "title": "The Power Issue",
                "issue_number": "Issue 118",
                "season": "October / November 2026",
                "description": (
                    "The women redefining power across business and culture, a first look at "
                    "GAFW 2026, and the interviews that opened doors this year."
                ),
                "price": 60,
                "is_digital_available": True,
                "is_print_available": True,
                "print_sold_out": False,
                "publish_date": date(2026, 10, 1),
                "is_current_issue": True,
            },
            {
                "slug": "issue-117",
                "title": "The Bridal Issue",
                "issue_number": "Issue 117",
                "season": "August / September 2026",
                "description": "Ghana's wedding season, styled — designers, venues and the real budgets behind the big day.",
                "price": 55,
                "is_digital_available": True,
                "is_print_available": True,
                "print_sold_out": False,
                "publish_date": date(2026, 8, 1),
                "is_current_issue": False,
            },
            {
                "slug": "issue-116",
                "title": "The Beauty Issue",
                "issue_number": "Issue 116",
                "season": "June / July 2026",
                "description": "Skincare for the harmattan and beyond, and the founders building Ghana's beauty industry.",
                "price": 55,
                "is_digital_available": True,
                "is_print_available": True,
                "print_sold_out": False,
                "publish_date": date(2026, 6, 1),
                "is_current_issue": False,
            },
            {
                "slug": "issue-115",
                "title": "The GAFW Issue",
                "issue_number": "Issue 115",
                "season": "April / May 2026",
                "description": "The full GAFW 2025 recap — every look, every designer, every trend that mattered.",
                "price": 55,
                "is_digital_available": True,
                "is_print_available": True,
                "print_sold_out": True,
                "publish_date": date(2026, 4, 1),
                "is_current_issue": False,
            },
        ]
        for data in issues:
            MagazineIssue.objects.update_or_create(slug=data["slug"], defaults={k: v for k, v in data.items() if k != "slug"})
        self.stdout.write(self.style.SUCCESS(f"Magazine issues: {len(issues)}"))

        self.stdout.write(self.style.SUCCESS("Done."))

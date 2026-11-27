"""Branded Glitz Africa emails.

Every email the site sends goes through here, so they all share one look:
a black masthead with the GLITZ wordmark, editorial serif headings, gold
accents and a consistent footer. Each email is built from a few simple
blocks, rendered twice: as HTML (templates/emails/base.html) and as a plain-
text alternative for clients that don't show HTML.

    email = Email(
        subject="Payment received",
        eyebrow="SheBoss Global Marrakech Retreat 2027",
        heading="Thank you, Ama.",
        blocks=[
            para("We have received your payment."),
            details([("Amount", "USD 1,000.00"), ("Balance", "USD 2,550.00")]),
            button("View your payment schedule", url),
        ],
    )
    send(email, ["ama@example.com"])
"""

import logging
from dataclasses import dataclass, field
from datetime import date

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)

SOCIAL_LINKS = [
    ("Instagram", "https://www.instagram.com/glitzafrica_hq/"),
    ("TikTok", "https://www.tiktok.com/@glitz.africa"),
    ("X", "https://x.com/glitzafrica"),
]


# -- Blocks -------------------------------------------------------------------

def para(text, *, muted=False):
    return {"type": "para", "text": text, "muted": muted}


def details(rows, *, title=""):
    """Label/value rows, e.g. [("Amount", "USD 1,000.00")]. Empty values are skipped."""
    return {"type": "details", "title": title, "rows": [(k, v) for k, v in rows if v not in (None, "")]}


def table(headers, rows, *, title=""):
    """A small data table. Each row is a list of cells, or
    {"cells": [...], "tone": "ok" | "alert" | "muted"} to colour its last cell."""
    normalised = [r if isinstance(r, dict) else {"cells": list(r), "tone": ""} for r in rows]
    return {"type": "table", "title": title, "headers": headers, "rows": normalised}


def button(label, url):
    return {"type": "button", "label": label, "url": url}


def bullets(items, *, title=""):
    return {"type": "bullets", "title": title, "items": list(items)}


def note(text, *, title=""):
    """A highlighted box for important information."""
    return {"type": "note", "title": title, "text": text}


def code(label, value):
    """A large, centred value: a check-in code or reference to keep."""
    return {"type": "code", "label": label, "value": value}


def divider():
    return {"type": "divider"}


# -- Email --------------------------------------------------------------------

@dataclass
class Email:
    subject: str
    heading: str
    blocks: list = field(default_factory=list)
    eyebrow: str = ""
    preheader: str = ""
    reason: str = ""  # Footer line: why the recipient got this email.

    def context(self):
        asset_base = getattr(settings, "EMAIL_ASSET_BASE_URL", "") or settings.FRONTEND_BASE_URL
        site = settings.FRONTEND_BASE_URL.rstrip("/")
        return {
            "email": self,
            "logo_url": asset_base.rstrip("/") + "/images/email/glitz-logo-white.png",
            "site_url": site,
            "site_label": site.split("://", 1)[-1],
            "social_links": SOCIAL_LINKS,
            "year": date.today().year,
        }

    def html(self):
        return render_to_string("emails/base.html", self.context())

    def text(self):
        lines = []
        if self.eyebrow:
            lines += [self.eyebrow.upper(), ""]
        lines += [self.heading, ""]
        for block in self.blocks:
            kind = block["type"]
            if block.get("title"):
                lines.append(block["title"].upper())
            if kind == "para":
                lines.append(block["text"])
            elif kind == "details":
                lines += [f"{label}: {value}" for label, value in block["rows"]]
            elif kind == "table":
                lines.append(" | ".join(block["headers"]))
                lines += [" | ".join(str(c) for c in row["cells"]) for row in block["rows"]]
            elif kind == "button":
                lines.append(f"{block['label']}: {block['url']}")
            elif kind == "bullets":
                lines += [f"- {item}" for item in block["items"]]
            elif kind == "note":
                lines.append(block["text"])
            elif kind == "code":
                lines.append(f"{block['label']}: {block['value']}")
            elif kind == "divider":
                lines.append("-" * 24)
            lines.append("")
        lines += [
            "—",
            "Glitz Africa · Fashion, Culture, Lifestyle & Entertainment",
            settings.FRONTEND_BASE_URL.rstrip("/"),
        ]
        if self.reason:
            lines.append(self.reason)
        return "\n".join(lines)


def build_message(email, recipients, *, reply_to=None):
    message = EmailMultiAlternatives(
        subject=email.subject,
        body=email.text(),
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=recipients,
        reply_to=reply_to,
    )
    message.attach_alternative(email.html(), "text/html")
    return message


def send(email, recipients, *, reply_to=None):
    """Send without ever breaking the action that triggered it. Returns True
    only if the email was handed to the mail server."""
    if not settings.AUTH_EMAIL_ENABLED:
        return False
    recipients = [address for address in recipients if address]
    if not recipients:
        return False
    try:
        return build_message(email, recipients, reply_to=reply_to).send() == 1
    except Exception:
        logger.exception("Email delivery failed: %s", email.subject)
        return False


def from_plain_text(subject, body, *, eyebrow="", reason=""):
    """Wraps an existing plain-text body in the branded layout: blank lines
    separate paragraphs, single line breaks are kept."""
    paragraphs = [p.strip("\n") for p in body.split("\n\n") if p.strip()]
    return Email(subject=subject, heading=subject, eyebrow=eyebrow, reason=reason,
                 blocks=[para(p) for p in paragraphs])

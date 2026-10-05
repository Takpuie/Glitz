# Glitz Africa — Backend

Django 5.2 + Wagtail 8 (headless CMS via the Wagtail API v2) + Django REST
Framework, backing the Next.js frontend in the repo root.

- **Phase 1 (Foundation)** — CMS-driven articles, events, and magazine
  issues, all served as JSON.
- **Phase 2 (Events)** — live Stripe Checkout for GAFW tickets: pending
  ticket creation with an atomic capacity check, a signature-verified
  Stripe webhook, and a verify-by-session endpoint for the frontend's
  post-payment callback page.
- **Phase 3 (Commerce)** — live Stripe Checkout for magazine issues,
  digital or print, with a gated digital-download link on payment
  confirmation. Shares the webhook and Stripe client with Phase 2.
- Originally built against Paystack (the build plan's choice, for its
  flat 1.95% fee and Ghana-market fit) and switched to Stripe on request.
  The switch is a straight swap of the payment layer — capacity checks,
  fulfillment, and the webhook dispatch pattern are unchanged.
- **Phase 4 (Polish & buffer)** — deploy-readiness checks, dependency
  audits, an N+1 query fix, and the FastCGI deployment finding below.
  What this phase *couldn't* cover from a dev sandbox: a real load test
  against TechNE's actual 10% CPU limit, and proving `index.fcgi` against
  TechNE's real Apache + FastCGI setup rather than a local protocol-level
  simulation. See "Deployment (TechNE)" and "What's not built yet" below.

## Stack

- **Django 5.2** — project/app structure, auth, admin
- **Wagtail 8** — page tree + StreamField content model for `Post`, exposed
  read-only via `wagtail.api.v2`
- **Django REST Framework** — read-only endpoints for `Category`, `Event`,
  `MagazineIssue` (custom apps, not Wagtail pages)
- **MySQL 8** — the production database on TechNE, using InnoDB, strict mode
  and `utf8mb4`; PostgreSQL remains supported for existing local setups
- **python-decouple** — all config via environment variables / `.env`

## Local setup

```bash
cd backend
python3 -m venv ../backend-venv
source ../backend-venv/bin/activate
pip install -r requirements.txt

cp .env.example .env   # then fill in real local values — never commit .env

# MySQL 8: create a local database + user matching your .env, e.g.
#   mysql -u root -p -e "CREATE DATABASE glitz_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
#   mysql -u root -p -e "CREATE USER 'glitz'@'localhost' IDENTIFIED BY '...'; GRANT ALL ON glitz_dev.* TO 'glitz'@'localhost';"

python manage.py migrate
python manage.py createsuperuser
python manage.py seed_demo_content   # optional — loads the real article/event/issue catalog
python manage.py runserver 0.0.0.0:8000
```

Wagtail admin: `http://localhost:8000/admin/`
Django admin: `http://localhost:8000/django-admin/`

### Post previews

Open a post in Wagtail and use **Preview** to see current unsaved edits,
or **View draft** to see the latest saved revision. Previews render inside
the backend using `templates/content/post_preview.html`, including rich
text, cover/body images, pull quotes, and gallery items. They use a dedicated
responsive article layout; they are not an exact rendering of the Next.js
page. The frontend server does not need to be running for previews.

Wagtail's existing permissions protect draft previews. Previewing does not
publish the post or expose drafts through the public articles API.

### Events navigation

The **Glitz Events** dropdown (desktop and mobile) and the Events page read
the full CMS event list. Add or rename an event under **Snippets → Events**
to update its menu entry; no frontend code change is needed. Archived events
remain listed. Event data has a 30-second revalidation interval; refresh the
website after the cache refreshes to see changes in an already open menu.

### Website submissions

### Visitor accounts and reader comments

`/account` supports email/password registration and login, Google sign-in,
logout, email verification, password reset, display-name editing, and password
changes. Guest checkout remains available. Verified visitors can see up to 100
recent orders, tickets, and applications associated with their verified email,
plus saved articles. Records explicitly owned by another user are excluded.
Paid digital downloads use an authenticated account endpoint that rechecks
ownership and current payment status. Application staff notes are never returned.
Email changes are not offered in this version; display names can be changed.

Visitor sessions use separate HttpOnly cookies (`glitz_visitor_session` and
`glitz_visitor_csrf`) through the same-origin Next.js `/api/visitor/` proxy.
Wagtail's staff cookies are not forwarded. Unsafe requests require a matching
Origin and Django CSRF token. Serve the public frontend over HTTPS in production;
the proxy marks visitor cookies Secure in production. Configure the same
`FRONTEND_BASE_URL` on Django and Next.js, and set `BACKEND_API_URL` for Next.js.
The proxy currently maps Django's default `sessionid` and `csrftoken` cookie names.

To activate email, set the SMTP variables in `.env.example`, set a verified
`DEFAULT_FROM_EMAIL`, set `EMAIL_BACKEND` to Django's SMTP backend, and enable
`AUTH_EMAIL_ENABLED`. In local development, enabling that flag with the default
console backend prints links instead of sending mail. Verification links expire
after 24 hours and password-reset links after one hour; tokens are stored hashed
and consumed once. Password resets invalidate prior sessions. Missing email
configuration is reported in the UI, never treated as delivered mail.

To activate Google sign-in, create a Web OAuth client in the Google Cloud project,
configure the consent screen, set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`,
and register `<FRONTEND_BASE_URL>/api/visitor/google/callback` as the redirect URI.
The callback validates signed ID tokens, audience, expiry, state, nonce and PKCE.
Existing email/password accounts must first sign in and explicitly connect
Google from their profile. No automatic email-based account linking occurs.
Non-Gmail/non-Workspace Google identities still require Glitz email verification
before accessing email-associated purchases. Secrets stay on Django.

Published public posts support plain-text reader comments. Verified readers can
post, edit/delete their own comments, report comments, and save articles. Comments
appear immediately. In Wagtail **Snippets**, use **Reader comments** to hide or
delete comments, **Comment reports** to review/resolve reports, and **Reader
accounts** to suspend commenting. Editing a hidden comment never unhides it.
Suspended readers may still delete their own comments. Comments load 50 at a time.
Give moderators view/change/delete permissions on these three models as needed.
Auth and comment rate limits use Django's cache; use a shared cache across workers
in production. No automated content-classification service is connected.

Wagtail sends its built-in workflow task, approval, and rejection notifications
through the configured SMTP backend. Each staff user must have an email address
and enable the relevant options under Account settings → Notifications. Set
`WAGTAILADMIN_NOTIFICATION_FROM_EMAIL` to the sender shown on those messages.

This release does not send submission status notifications or newsletter
campaigns. It adds only account verification and recovery emails when enabled.

### Website form records

Website forms save directly to Wagtail **Snippets**:

- **Newsletter subscribers**: footer signups, consent time, and active status.
- **Nominations**: application details, portfolio attachment/link, review status,
  and private staff notes. Review statuses are Received, Shortlisted, Selected,
  and Not selected.
- **Enquiries**: contact messages (`/contact`), event interest (event pages), and
  sponsorship requests (`/partners#enquire`). Filter by enquiry type, event,
  or status (New, In progress, Resolved).

Give the relevant staff groups view/change permissions for these records.
Public endpoints at `POST /api/submissions/{newsletter,nominations,enquiries}/`
accept submissions but do not expose lists or private records. The frontend
proxies these requests, displays errors, and only confirms successful saves.
Retries of an application/enquiry use a unique submission ID to avoid duplicate
records. Newsletter emails are normalised and deduplicated; public signups do
not reactivate records staff have disabled. Forms require explicit consent and
include a honeypot plus a limit of 10 attempts per email address per hour.
The limiter uses Django's cache; configure a shared cache for consistent limits
across multiple server processes.

Portfolios accept one PDF/JPG up to 20 MB. They live in `backend/private_uploads/`,
outside public media. Never configure the web server to expose this directory;
include it in private backups. Downloads require the nomination view permission.
Staff can download attachments from a nomination's edit screen.

No confirmation emails, staff notification emails, status emails, or newsletter
campaigns are sent. Status changes and notes stay inside Wagtail. The old
nonfunctional Save Draft button has been removed.
Run `python manage.py migrate` when deploying.

### Media content management

Manage **Media Gallery**, **Videos**, and **Press coverage** under Wagtail's **Snippets** menu.
Media Gallery entries use Wagtail's image library: upload or choose an image, add a title
and accessibility description, then optional caption, photographer credit,
and event association. Set display order and enable **Is visible** to show
it in the Media page gallery. Clicking a photo opens an uncropped rendition
in a new tab. `/api/photos/` only lists visible entries. Hiding a photo
removes its listing but does not revoke previously shared image URLs.
Videos accept an HTTPS YouTube/public Vimeo video link or an MP4/WebM upload
(exactly one source), an optional thumbnail, duration, and event association.
Press coverage contains a headline, publication, article URL, and date.
For all media entries, lower **Display order** numbers come first. Enable **Is visible**
when an entry is ready to appear publicly; new entries start hidden.

The Media page fetches `/api/videos/` and `/api/press-coverage/`, which only
return visible entries and are read-only. Content refreshes through the
frontend's 60-second cache. Video players load after a visitor clicks Play;
external hosts must permit embedding. Hiding an uploaded video removes its
listing but does not revoke access to a previously shared file URL.
No placeholder videos or press claims are imported: the page starts empty
until real entries are added. Deployments must run `python manage.py migrate`
to create the media tables.

All content — articles, events, magazine issues, and now orders/tickets —
is manageable from the Wagtail admin's **Snippets** menu, so day-to-day
staff work never needs the Django admin. `Order` (Snippets → Orders) and
`Ticket` (Snippets → Tickets) are registered there alongside `Event` and
`MagazineIssue`, with read-only panels for the fields the checkout/webhook
flow owns (`stripe_session_id`, `check_in_code`, `created_at`, etc.) so
staff can review or manually correct a status without touching data that
must stay consistent with Stripe. The Django admin registrations
(`OrderAdmin`, `TicketAdmin`) are left in place too — both interfaces read
and write the same tables, so use whichever is convenient.

## Environment variables

See `.env.example` for the full list. Notable ones:

| Variable | Purpose |
|---|---|
| `DJANGO_SECRET_KEY` | Required, no default — generate a real one per environment |
| `DJANGO_DEBUG` | `True` locally, `False` in production |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated; must list the real prod hostname |
| `DB_ENGINE` | `mysql` in production; `postgresql` remains available for local development |
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` / `DB_HOST` / `DB_PORT` | Database connection (`localhost:3306` on TechNE MySQL) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated; the Next.js origin(s) only — never `*` |
| `WAGTAILADMIN_BASE_URL` | Used to build absolute image URLs returned by the API |
| `PAYSTACK_SECRET_KEY` | Paystack server key; never reaches the frontend |
| `PAYSTACK_PUBLIC_KEY` | Reserved for a future inline checkout; hosted checkout does not require it |
| `STRIPE_SECRET_KEY` | Still used by the existing event-ticket checkout |
| `STRIPE_PUBLISHABLE_KEY` | Not currently used (Stripe Checkout is a hosted page) — reserved for a future Elements-based flow |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for `/api/webhooks/stripe/`, from the Stripe Dashboard or `stripe listen` in development |
| `FRONTEND_BASE_URL` | The Next.js origin — used to build Stripe Checkout's `success_url`/`cancel_url` |

Production secrets are entered directly into TechNE's config panel, never
committed — `backend/.env` is gitignored and `.env.example` holds only
placeholder values.

**Checkout needs a real Stripe secret key to actually complete a payment.**
Without one (the local default), `POST /api/events/<slug>/checkout/` and
`POST /api/magazine/checkout/` still create the pending Ticket/Order and
enforce capacity/availability correctly, but fail at the
Stripe API call with a clear `STRIPE_SECRET_KEY is not configured` error
and mark the row cancelled/failed — verified behavior, not a guess. Get a
free test secret key from the Stripe Dashboard and set it (plus
`STRIPE_WEBHOOK_SECRET`, from `stripe listen --forward-to
localhost:8000/api/webhooks/stripe/`) in `.env` to test a real checkout
end to end with Stripe's test-mode card numbers.

## Data model

- **`apps.accounts`** — custom `User` (role: staff / editor / customer)
- **`apps.content`** — `Category` (snippet), `Post` (Wagtail page — dek,
  StreamField `body`, author, category, cover image), `PostIndexPage`
  (parent page for the article tree), `MediaAsset` (gallery image/video,
  belongs to a `Post` or an `Event`)
- **`apps.events`** — `Event` (snippet, with ticket types + gallery inline),
  `TicketType`, `Ticket` (snippet — buyer, Stripe session id, check-in code)
- **`apps.magazine`** — `MagazineIssue` (snippet), `Order` (snippet, with
  order items inline), `OrderItem` (issue purchases, digital and/or print)

`Event`, `Post`, and `Order` are `ClusterableModel`/Wagtail `Page`
subclasses so their child relations (`TicketType`, `MediaAsset`,
`OrderItem`) use `ParentalKey` + `InlinePanel` for inline editing in the
CMS — a plain `ForeignKey` does not support that. `Ticket` has no child
relations of its own, so it's registered as a plain Wagtail snippet
without needing `ClusterableModel`.

## API

- **Wagtail API v2** — `GET /api/v2/pages/?type=content.Post`
  - Supports Wagtail's native field-expansion syntax, e.g.
    `?fields=title,dek,category(name,slug),cover_image,body`
  - Filter a single post: `?slug=<slug>`
  - Order: `?order=-published_date`
  - `WAGTAILAPI_LIMIT_MAX` is raised to 100 (default is 20) so the frontend
    can fetch the full catalog in one request
- **DRF endpoints** (read-only, unauthenticated):
  - `GET /api/categories/`
  - `GET /api/events/` and `GET /api/events/<slug>/`
  - `GET /api/magazine-issues/` and `GET /api/magazine-issues/<slug>/`
- **Ticket checkout** (`apps/events/checkout.py`):
  - `POST /api/events/<slug>/checkout/` — body `{ticket_type_id, buyer_name,
    buyer_email}`. Creates a `Ticket` (status `pending`) inside a
    `select_for_update()` transaction so two concurrent buyers can't both
    pass the capacity check for the last seat, then opens a Stripe
    Checkout Session and returns `{reference, checkout_url}` — `reference`
    is Stripe's own session id (`cs_test_...`/`cs_live_...`; unlike
    Paystack, Stripe generates this, we don't get to pick it), stored on
    the Ticket once the session exists. `TicketType.remaining` counts
    pending *and* paid tickets against capacity — see
    `release_stale_tickets` below.
  - `POST /api/webhooks/stripe/` — the source of truth for payment
    confirmation. Verifies the `Stripe-Signature` header via the Stripe
    SDK's `Webhook.construct_event` before trusting anything in the
    payload; marks the ticket `paid` on `checkout.session.completed`.
  - `GET /api/tickets/verify/<reference>/` — used by the frontend's
    post-redirect callback page (`reference` is the Stripe session id).
    If the ticket is still `pending`, it re-checks directly with Stripe
    (belt-and-braces in case the webhook is slow or missed) before
    returning status.
  - `python manage.py release_stale_tickets` — cancels pending tickets
    older than 30 minutes so an abandoned checkout doesn't permanently
    hold a seat. Meant to run on a schedule (TechNE Cron Jobs).
- **Magazine checkout** (`apps/magazine/checkout.py`) — cart-based, one
  Order can cover several issues:
  - `POST /api/magazine/checkout/` — body `{items: [{slug, format,
    quantity}], buyer_email, shipping_address}` (`shipping_address`
    required if any item is `print`). Validates each item's availability
    (`is_digital_available`, `is_print_available` and not
    `print_sold_out`) before creating one pending `Order` with one
    `OrderItem` per cart line and opening a single Stripe Checkout
    Session with one line item per cart line.
  - `GET /api/orders/verify/<reference>/` — same belt-and-braces pattern
    as ticket verify; returns the order with its full `items` list, each
    carrying a `download_url` once paid (digital items with a file only).
  - `GET /api/orders/<reference>/download/?email=...&issue=<slug>` —
    where each digital `OrderItem`'s `download_url` points, instead of
    the raw media path: 403 unless the order is `paid` *and* the email
    matches, 404 if that issue isn't a digital item on this order or has
    no file uploaded yet.
  - The Stripe webhook (`glitz_backend/webhooks.py`) is shared between
    tickets and orders: on `checkout.session.completed` it tries
    `mark_ticket_paid` first, then `mark_order_paid`, keyed off the
    Stripe session id — each function reports whether that session id
    belongs to it, so the shared dispatcher doesn't need to know
    anything about which domain owns which session ahead of time.

## Frontend integration

The Next.js app (`../lib/backend.ts`) fetches from this API as Server
Components, using `BACKEND_API_URL` (see `../.env.local`, defaults to
`http://localhost:8000`). `data/articles.ts` re-exports that client so
existing page imports didn't need to change shape — only `await`ed.

`../lib/cart-context.tsx` is a real shopping cart (add/remove/quantity),
client-side and `localStorage`-backed — there's no customer account
system yet, so the cart is guest-only and doesn't survive a device
switch. `/cart` posts the whole cart in one call to
`POST /api/magazine/checkout/` and is cleared once the post-payment
callback page confirms the order is paid.

## Required WordPress archive import

The production database must include the legacy Glitz Africa article archive. After deploying code and running migrations, upload `glitzafrica_published_posts.csv` to a private server location outside the public web root, then run:

```bash
cd /home/www/glitz_backend/backend
source /home/venv/bin/activate
python manage.py import_wordpress_posts /home/glitzafrica_published_posts.csv --commit --report /home/wordpress-image-recovery.csv
```

The importer is restart-safe and skips slugs already present in Wagtail. Do not use `glitzafrica_posts.csv`; it also contains trashed, draft, and auto-draft records. Confirm the result with:

```bash
python manage.py shell -c "from apps.content.models import Post; print(Post.objects.live().filter(category__slug='archive').count())"
```

The expected archive count is **2,670**. Keep the source CSV and image-recovery report outside the public website directory.

## Deployment (TechNE)

TechNE's Python hosting fronts Django apps with Apache via FastCGI
(`.htaccess` routes requests to an `index.fcgi` script), not a direct
WSGI/reverse-proxy setup — different from what the build plan originally
assumed and from how this repo's Dockerfile/gunicorn are set up for local
dev and other hosts.

`backend/index.fcgi` is that entry point, using
[`flup6`](https://pypi.org/project/flup6/) to bridge FastCGI to Django's
WSGI application. **Not `django-fastcgi`** — that package (the one
sometimes suggested for exactly this kind of hosting) is Python 2-only
(`import msvcrt`, Python 2 `except`/`raise` syntax, `dict.has_key()`) and
fails outright under Python 3. `flup6` is the maintained, Python
3-compatible fork of the same classic FastCGI bridge library.

Verified locally by speaking raw FastCGI protocol to a `flup6`
`WSGIServer` wrapping this app's real WSGI application (not just checking
that it imports) — full requests through `/api/categories/` and
`/api/events/gafw/` round-tripped correctly, including the
`SECURE_SSL_REDIRECT`/HSTS middleware firing as expected. Not yet proven
against TechNE's actual Apache + mod_fastcgi/mod_fcgid — only the Python
side of the bridge.

To deploy:
1. `pip install -r requirements.txt` in the TechNE-provisioned virtualenv
   (installs `flup6` along with everything else).
2. Point `.htaccess` (or however TechNE's panel wants it configured) at
   `backend/index.fcgi`.
3. Set the same environment variables as `.env.example`, through TechNE's
   Python App config panel — not a committed `.env` file.
4. `index.fcgi` defaults `DJANGO_SETTINGS_MODULE` to
   `glitz_backend.settings.production`.

## Security notes (see the build plan for full detail)

- Secrets only via environment variables, never committed
- `DEBUG=False` and a real `ALLOWED_HOSTS` in production
- HTTPS enforced in production (`SECURE_SSL_REDIRECT`, HSTS) — see
  `glitz_backend/settings/production.py`
- CORS restricted to the Next.js origin(s), credentials allowed, never `*`
- Stripe webhook signatures are verified before marking a ticket/order
  paid (`StripeWebhookView`) — the secret key never reaches the frontend
- All write endpoints go through DRF serializers for validation
- Upload size is capped (`WAGTAILIMAGES_MAX_UPLOAD_SIZE`,
  `WAGTAILDOCS_MAX_UPLOAD_SIZE`)
- `python manage.py check --deploy` passes cleanly against production
  settings (DEBUG=False, real ALLOWED_HOSTS) — no warnings
- `collectstatic` (not `--dry-run`) succeeds under
  `ManifestStaticFilesStorage` — all 241 static files post-process without
  a missing-reference error, the most common real failure mode with that
  storage backend
- `pip-audit` clean (a `setuptools` CVE was patched); `npm audit` flags
  several Next.js CVEs only fixed in Next 16 — checked exposure (no
  middleware, no custom server, no Server Actions, no next.config.js
  rewrites in this codebase) and closed the one actually reachable one
  (Image Optimization API RCE/DoS) by setting `images.unoptimized: true`
  in `next.config.js`, since every `<Image>` already used that prop
  anyway. Deliberately not bumping the Next major version 7 weeks before
  GAFW — revisit after launch
- Fixed an N+1 query on the article list endpoint (18 posts → 18 separate
  `Category` queries) with `select_related` on `Post`'s manager — verified
  by counting real queries before/after (30 → 12), not just reasoning
  about it

## Deployment: what's proven vs. what isn't

**Proven from this dev sandbox:**
- The full request path (Wagtail API, DRF endpoints, both Stripe checkout
  flows, the shared webhook — including a real signature-verified
  `checkout.session.completed` dispatched through to both a Ticket and an
  Order from the same endpoint) against production Django settings
- `index.fcgi` correctly bridges FastCGI to Django's WSGI app via
  `flup6`, verified by speaking raw FastCGI protocol to a running
  instance and getting real API responses back — see "Deployment
  (TechNE)" above

**Not provable without real TechNE access — genuinely open:**
- A real load test against TechNE's 10% CPU limit (the build plan flags
  this as an explicit open risk — it still is)
- `index.fcgi` against TechNE's actual Apache + mod_fastcgi/mod_fcgid,
  as opposed to a local protocol-level simulation of the same bridge
- Whether SSH/Shell access and PostgreSQL Databases are actually
  available on this specific TechNE account (TechNE support could
  describe the platform in general but not this account's specifics)

## What's not built yet (later phases)

- Production deployment to TechNE itself — the deployment *mechanism*
  (`index.fcgi`) is built and locally verified, but nobody has run it
  against the real TechNE panel yet
- Auth-gated endpoints for the customer account area
- Events hub (`/events`) and the other four event pages still read from
  the frontend's static `data/events.ts` — only GAFW is backend-wired,
  matching Phase 2's explicit scope
- Magazine subscriptions (the three plans on `/magazine`) are display-only
  — not in the plan's data model, only single-issue purchases are wired
- No real magazine PDF has been uploaded for any issue yet
  (`MagazineIssue.digital_file` is empty), so a paid digital order's
  `delivery_link` stays blank until one is uploaded via the Wagtail admin
  — verified behavior (404 with a clear message), not a bug
- A real Stripe test key hasn't been used against either checkout flow —
  both are verified up to the Stripe API call
- GAFW's day-by-day programme and the runway gallery are still static
  frontend content, not modeled in the backend (not part of any phase's
  explicit data-model scope so far)
# Homepage video and partner sections

In Wagtail **Snippets → Videos**, upload an MP4/WebM, add a thumbnail, and enable visibility. Visible videos also appear in the homepage's swipeable film carousel. Uploaded files have muted previews; YouTube/Vimeo links play after a visitor clicks.

In **Snippets → Homepage slides**, add a headline, poster, optional uploaded video, button text and local destination (for example `/events/gafw`). Enable visibility and use display order to arrange slides. Without published slides, the hero uses existing Glitz event photos. A hidden or removed video falls back to its slide's poster.

In **Snippets → Partner logos**, upload each partner's logo, name and optional website, then enable visibility. Logos scroll continuously and pause on hover, keyboard focus or the Pause button. With no visible partners, the strip is hidden. Both animated sections respect reduced-motion preferences. Allow up to 60 seconds for published content to refresh on the frontend.

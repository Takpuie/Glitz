# Glitz Africa — Backend

Django 5.2 + Wagtail 8 (headless CMS via the Wagtail API v2) + Django REST
Framework, backing the Next.js frontend in the repo root.

- **Phase 1 (Foundation)** — CMS-driven articles, events, and magazine
  issues, all served as JSON.
- **Phase 2 (Events)** — live Paystack ticket checkout for GAFW: pending
  ticket creation with an atomic capacity check, a signature-verified
  Paystack webhook, and a verify-by-reference endpoint for the frontend's
  post-payment callback page.
- **Phase 3 (Commerce)** — live Paystack checkout for magazine issues,
  digital or print, with a gated digital-download link on payment
  confirmation. Shares the webhook and Paystack client with Phase 2.

## Stack

- **Django 5.2** — project/app structure, auth, admin
- **Wagtail 8** — page tree + StreamField content model for `Post`, exposed
  read-only via `wagtail.api.v2`
- **Django REST Framework** — read-only endpoints for `Category`, `Event`,
  `MagazineIssue` (custom apps, not Wagtail pages)
- **PostgreSQL 16** — local dev and production both run Postgres (no SQLite
  fallback, to keep dev/prod parity)
- **python-decouple** — all config via environment variables / `.env`

## Local setup

```bash
cd backend
python3 -m venv ../backend-venv
source ../backend-venv/bin/activate
pip install -r requirements.txt

cp .env.example .env   # then fill in real local values — never commit .env

# Postgres: create a local database + role matching your .env, e.g.
#   sudo -u postgres psql -c "CREATE DATABASE glitz_dev;"
#   sudo -u postgres psql -c "CREATE USER glitz WITH PASSWORD '...';"
#   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE glitz_dev TO glitz;"

python manage.py migrate
python manage.py createsuperuser
python manage.py seed_demo_content   # optional — loads the real article/event/issue catalog
python manage.py runserver 0.0.0.0:8000
```

Wagtail admin: `http://localhost:8000/admin/`
Django admin: `http://localhost:8000/django-admin/`

## Environment variables

See `.env.example` for the full list. Notable ones:

| Variable | Purpose |
|---|---|
| `DJANGO_SECRET_KEY` | Required, no default — generate a real one per environment |
| `DJANGO_DEBUG` | `True` locally, `False` in production |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated; must list the real prod hostname |
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` / `DB_HOST` / `DB_PORT` | Postgres connection |
| `CORS_ALLOWED_ORIGINS` | Comma-separated; the Next.js origin(s) only — never `*` |
| `WAGTAILADMIN_BASE_URL` | Used to build absolute image URLs returned by the API |
| `PAYSTACK_SECRET_KEY` / `PAYSTACK_PUBLIC_KEY` | Empty locally; only the public key ever reaches the frontend |
| `FRONTEND_BASE_URL` | The Next.js origin — used to build the Paystack `callback_url` |

Production secrets are entered directly into TechNE's config panel, never
committed — `backend/.env` is gitignored and `.env.example` holds only
placeholder values.

**Ticket checkout needs a real Paystack secret key to actually complete a
payment.** Without one (the local default), `POST /api/events/<slug>/checkout/`
still creates the pending ticket and enforces capacity correctly, but fails
at the Paystack API call with a clear `PAYSTACK_SECRET_KEY is not configured`
error and cancels the ticket — verified behavior, not a guess. Get a free
test secret key from the Paystack dashboard and set it in `.env` to test a
real checkout end to end (use Paystack's test-mode card numbers).

## Data model

- **`apps.accounts`** — custom `User` (role: staff / editor / customer)
- **`apps.content`** — `Category` (snippet), `Post` (Wagtail page — dek,
  StreamField `body`, author, category, cover image), `PostIndexPage`
  (parent page for the article tree), `MediaAsset` (gallery image/video,
  belongs to a `Post` or an `Event`)
- **`apps.events`** — `Event` (snippet, with ticket types + gallery inline),
  `TicketType`, `Ticket` (buyer, Paystack reference, check-in code)
- **`apps.magazine`** — `MagazineIssue`, `Order`, `OrderItem` (issue
  purchases, digital and/or print)

`Event` and `Post` are `ClusterableModel`/Wagtail `Page` subclasses so their
child relations (`TicketType`, `MediaAsset`) use `ParentalKey` +
`InlinePanel` for inline editing in the CMS — a plain `ForeignKey` does not
support that.

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
    pass the capacity check for the last seat, then opens a Paystack
    transaction and returns `{reference, authorization_url}` for the
    browser to redirect to. `TicketType.remaining` counts pending *and*
    paid tickets against capacity — see `release_stale_tickets` below.
  - `POST /api/webhooks/paystack/` — the source of truth for payment
    confirmation. Verifies `X-Paystack-Signature` (HMAC-SHA512 over the
    raw body) before trusting anything in the payload; marks the ticket
    `paid` on `charge.success`.
  - `GET /api/tickets/verify/<reference>/` — used by the frontend's
    post-redirect callback page. If the ticket is still `pending`, it
    re-checks directly with Paystack (belt-and-braces in case the webhook
    is slow or missed) before returning status.
  - `python manage.py release_stale_tickets` — cancels pending tickets
    older than 30 minutes so an abandoned checkout doesn't permanently
    hold a seat. Meant to run on a schedule (TechNE Cron Jobs).
- **Magazine checkout** (`apps/magazine/checkout.py`) — same shape as
  ticket checkout, one issue at a time:
  - `POST /api/magazine-issues/<slug>/checkout/` — body
    `{format: "digital"|"print", buyer_email, shipping_address}`
    (`shipping_address` required for `print`). Validates the issue is
    actually available in that format (`is_digital_available`,
    `is_print_available` and not `print_sold_out`) before creating a
    pending `Order` + `OrderItem` and opening a Paystack transaction.
  - `GET /api/orders/verify/<reference>/` — same belt-and-braces pattern
    as ticket verify.
  - `GET /api/orders/<reference>/download/?email=...` — where a paid
    digital order's `delivery_link` points, instead of the raw media
    path: 403 unless the order is `paid` *and* the email matches, 404 if
    no digital file has been uploaded for the issue yet.
  - The Paystack webhook (`glitz_backend/webhooks.py`) is shared between
    tickets and orders: it tries `mark_ticket_paid` first, then
    `mark_order_paid`, keyed off whichever reference actually exists —
    ticket and order references use different prefixes
    (`<EVENT>-...` vs `MAG-...`) but the dispatch doesn't rely on that,
    it just checks which one owns the reference.

## Frontend integration

The Next.js app (`../lib/backend.ts`) fetches from this API as Server
Components, using `BACKEND_API_URL` (see `../.env.local`, defaults to
`http://localhost:8000`). `data/articles.ts` re-exports that client so
existing page imports didn't need to change shape — only `await`ed.

## Security notes (see the build plan for full detail)

- Secrets only via environment variables, never committed
- `DEBUG=False` and a real `ALLOWED_HOSTS` in production
- HTTPS enforced in production (`SECURE_SSL_REDIRECT`, HSTS) — see
  `glitz_backend/settings/production.py`
- CORS restricted to the Next.js origin(s), credentials allowed, never `*`
- Paystack webhook signatures are verified before marking a ticket paid
  (`PaystackWebhookView`) — the secret key never reaches the frontend
- All write endpoints go through DRF serializers for validation
- Upload size is capped (`WAGTAILIMAGES_MAX_UPLOAD_SIZE`,
  `WAGTAILDOCS_MAX_UPLOAD_SIZE`)

## What's not built yet (later phases)

- Production deployment to TechNE (Dockerfile exists from the Wagtail
  scaffold; not yet adapted/tested against TechNE's VPS setup)
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
- A real Paystack test key hasn't been used against either checkout flow
  (see above) — both are verified up to the Paystack API call

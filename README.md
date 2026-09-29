# Glitz Africa

Next.js 14 frontend for the Glitz Africa Pan-African fashion/culture/business
media platform, backed by the Django + Wagtail CMS in `backend/` (see
`backend/README.md` for the backend's own stack, data model, and API
details).

The frontend never talks to the backend from the browser — every fetch
(articles, events, magazine issues, cart checkout) runs server-side, in
Server Components or in the `app/api/*` route handlers, using the
server-only `BACKEND_API_URL` env var. That's also why the backend must be
reachable *at build time*, not just at runtime: `generateStaticParams` for
`/articles/[slug]` and `/events/[slug]` fetches the article/event list from
it while building the static pages — `npm run build` fails outright with
`ECONNREFUSED` if the backend isn't up yet. Deploy/start the backend first.

## Local setup

```bash
npm install
cp .env.example .env.local   # BACKEND_API_URL, defaults to localhost:8000
npm run dev                  # http://localhost:3000 — needs the backend running too
```

See `backend/README.md` for backend setup (Postgres, migrations, seed data).

## Deployment (TechNE)

Both the frontend and backend are hosted on TechNE — the frontend as a
Node.js app (TechNE's "Node.js App" panel, Passenger-managed), the backend
as a Python app via FastCGI (`backend/README.md` → "Deployment (TechNE)"
has the full detail on that half). Order matters:

1. **Backend first.** Deploy and start the Django app per
   `backend/README.md`, with `WAGTAILADMIN_BASE_URL` set to the backend's
   real public URL (it's baked into every image URL the API returns) and
   `CORS_ALLOWED_ORIGINS`/`FRONTEND_BASE_URL` set to the frontend's real
   public URL (Stripe's success/cancel redirects and the checkout API
   depend on it) — even though the frontend isn't live yet, these just need
   to be the URLs it *will* have.
2. **Then the frontend:**
   1. In TechNE's Node.js App panel, set the application root to this
      repo, the **startup file to `server.js`** (not `next start` — a
      Passenger-managed Node app runs `node <startup file>` directly and
      expects it to listen on `process.env.PORT`, which `server.js`
      wraps Next's request handler to do; `next start` alone doesn't fit
      that contract). Node **>=18.17** (see `engines` in `package.json`).
   2. Set `BACKEND_API_URL` to the backend's real public URL through the
      panel's environment variables — not a committed `.env.local`.
   3. `npm install`, then `npm run build` (needs the backend already
      running — see above), then let Passenger start `server.js`.

Verified locally by running this exact sequence — production build
(`npm run build`) against a live backend, then `NODE_ENV=production node
server.js` on a fixed port — and confirming real 200s from the homepage,
static pages, an SSG article page (`/articles/[slug]`), an ISR page that
revalidates against the backend (`/events/gafw`), and an `app/api/*` route
handler (`/api/checkout`, correctly 400s on a missing body rather than
404ing). Not yet proven against TechNE's actual Node.js App panel/Passenger
process — same caveat as the backend's FastCGI bridge: the local
verification exercises the real code path, not TechNE's specific process
manager.

### Environment variables that must match across both apps

| Frontend var | Backend var | Must be |
|---|---|---|
| `BACKEND_API_URL` | — | The backend's real public URL |
| — | `WAGTAILADMIN_BASE_URL` | The backend's real public URL (same value) |
| — | `CORS_ALLOWED_ORIGINS`, `FRONTEND_BASE_URL` | The frontend's real public URL |

Getting these three out of sync is the most likely deploy-day break: images
will 404/broken-link if `WAGTAILADMIN_BASE_URL` is wrong, checkout requests
will fail CORS if `CORS_ALLOWED_ORIGINS` is wrong, and Stripe's post-payment
redirect will land on the wrong host if `FRONTEND_BASE_URL` is wrong.

## What's not built yet

See `backend/README.md` → "What's not built yet" for the backend-side list.
On the frontend side: no real load test, and the Node.js App panel path
above is written from the same kind of first-principles verification as the
backend's FastCGI section (confirmed locally, not against TechNE's real
panel) — treat the first real deploy as the actual proof, and check
Passenger's logs immediately if `server.js` doesn't come up.

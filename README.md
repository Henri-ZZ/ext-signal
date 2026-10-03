# ExtSignal

ExtSignal is a Chrome Web Store search intelligence platform.

It tracks how extensions rank for **keyword × locale** combinations over time, so you can see search
visibility, ranking movement, locale coverage and competitive overlap for any public Chrome Web Store
listing.

The dashboard is backed by Neon Postgres and reads live ranking data. Collection is performed by a
separate Cloudflare Worker project, [ext-probe](https://github.com/Henri-ZZ/ext-probe) — this app never
crawls the Chrome Web Store itself.

## Tech stack

| Area      | Choice                                        |
| --------- | --------------------------------------------- |
| Framework | Next.js (App Router, Turbopack)               |
| Language  | TypeScript (strict)                           |
| Styling   | Tailwind CSS v4                               |
| UI        | shadcn/ui + Radix primitives + Lucide Icons   |
| Charts    | Recharts via shadcn chart components          |
| Theming   | Semantic tokens in `globals.css` + `next-themes` — see `docs/design-system.md` |
| Database  | Neon Postgres (`@neondatabase/serverless`)    |
| Auth      | Neon Auth (Managed Better Auth), Google only  |
| Package   | pnpm (only pnpm — no npm/yarn lockfiles)      |

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then fill in DATABASE_URL and the NEON_AUTH_* pair
pnpm dev
```

`/` is a placeholder entry point; the dashboard lives at `/dashboard` and requires signing in.

### Environment variables

| Variable                  | Required | Purpose                                                                          |
| ------------------------- | -------- | -------------------------------------------------------------------------------- |
| `DATABASE_URL`            | yes      | Neon connection string, shared with ext-probe                                    |
| `NEON_AUTH_BASE_URL`      | yes      | Neon Console → branch → **Auth → Configuration** → Auth URL                       |
| `NEON_AUTH_COOKIE_SECRET` | yes      | `openssl rand -base64 32` — signs the session-data cookie (min 32 characters)     |
| `EXT_PROBE_URL`           | no       | ext-probe Worker base URL — used by **Track now** and by metadata resolve on add  |
| `EXT_PROBE_TOKEN`         | no       | `MANUAL_TRIGGER_TOKEN` of the ext-probe Worker                                    |

Without `EXT_PROBE_URL` / `EXT_PROBE_TOKEN` everything still works: the manual trigger reports that it
is not configured, and a newly added extension shows a monogram fallback until ext-probe backfills
its title and icon on the next collection. Scheduled collection keeps running on Cloudflare regardless.

Auth configuration is read lazily on the first request that needs it, not at import time, so `pnpm build`
and preview deployments succeed without the secrets. A deployment that is missing them returns a clear
error instead of silently treating every visitor as the same user.

### Scripts

```bash
pnpm dev        # start the dev server
pnpm build      # production build (does not touch the database)
pnpm start      # serve the production build
pnpm lint       # eslint (flat config)
pnpm typecheck  # next typegen && tsc --noEmit
```

## Database setup

Schema lives in `db/schema.sql` and is idempotent. Apply it **after** ext-probe's schema, because
`target_latest` is a view over `ranking_runs`:

1. `ext-probe/db/schema.sql` → `collection_batches`, `ranking_runs`, `ranking_results`
2. `ext-signal/db/schema.sql` → `extensions`, `tracking_targets`, `target_latest` (view)

### Ownership of tables

| Table                                                      | Writer     | Reader                |
| ---------------------------------------------------------- | ---------- | --------------------- |
| `extensions`, `tracking_targets`                            | ext-signal | ext-probe, ext-signal |
| `collection_batches`, `ranking_runs`, `ranking_results`     | ext-probe  | ext-signal            |
| `extension_profiles` (titles, icons, ratings)               | ext-probe  | ext-signal            |

The rule is: **whoever owns the table does the fetching.** ext-signal never writes ranking
or metadata rows, and ext-probe never writes tracking configuration. Every Chrome Web Store
request stays in ext-probe, so the store's bot handling always sees the same egress IP that the
collector was validated against.

When an extension is added, the Server Action asks ext-probe to resolve its metadata once
(`POST /admin/resolve`) so the title and icon appear immediately. If the probe is unreachable the
extension is still created — ext-probe backfills metadata on its next collection.

## Project structure

```
assets/logo.png                # brand source (1254px), NOT served — the icons below
                               #   are downsized from it; see "Brand assets"
db/schema.sql                  # tables + target_latest view
docs/design-system.md          # the UI contract — read before adding UI
src/
  proxy.ts                     # route protection for /dashboard/* (Next 16 proxy)
  app/
    api/auth/[...path]/route.ts # Better Auth → Neon Auth proxy
    auth/sign-in/page.tsx      # Google sign-in screen
    design-system/page.tsx     # token/component reference (dev only, 404 in prod)
    dashboard/
      layout.tsx               # sidebar shell, force-dynamic
      actions.ts               # Server Actions: add/remove extension, manage targets, trigger probe
      page.tsx                 # Overview
      extensions/[id]/page.tsx # extension detail
  components/
    dashboard/                 # composed app components
    ui/                        # shadcn/ui primitives
  data/extensions.ts           # all Neon reads
  lib/
    auth/server.ts             # Neon Auth server instance (lazily configured)
    auth/client.ts             # browser auth client (same-origin /api/auth)
    session.ts                 # current-user seam
    db.ts                      # Neon client + value normalisation
    rankings.ts                # rank tiers, aggregation, formatting
    cws.ts                     # Chrome Web Store URL / ID parsing
    locales.ts                 # locale codes shared with ext-probe
scripts/
  apply-schema.mjs             # applies db/schema.sql to DATABASE_URL
```

Pages are Server Components. Client boundaries are limited to what genuinely needs interactivity:
the sidebar, dialogs, the target form, the chart, the tabs container and the Track now button.

## Brand assets

`assets/logo.png` is the 1254px master and is **never served** — it is not inside `public/`. Everything
users actually download is downsized and re-compressed from it:

| File                       | Size          | Used for                                      |
| -------------------------- | ------------- | --------------------------------------------- |
| `src/app/favicon.ico`      | 16 / 32 / 48  | `/favicon.ico`, requested directly by browsers |
| `src/app/icon.png`         | 96            | modern browser tab icon                        |
| `src/app/apple-icon.png`   | 180           | iOS home screen                                |
| `public/icon-192.png`      | 192           | declared in `public/site.webmanifest`          |
| `public/icon-512.png`      | 512           | declared in `public/site.webmanifest`          |
| `public/logo.png`          | 256           | in-app wordmark, served through `next/image`   |

The three files under `src/app/` are picked up automatically by Next's file-based metadata, so the
`<link>` tags are generated at build time and `layout.tsx` only declares the manifest.

The 16px entry is inherently muddy — the artwork carries far more detail than fits in 16 pixels. A
crisp tab icon at that size would need a simplified mark, not a downscale.

## Design system

The visual contract lives in [`docs/design-system.md`](docs/design-system.md) — brand colour,
light and dark palettes, semantic tokens, and the rules for buttons, tables, ranking colours,
charts and forms. **Read it before adding UI.**

All tokens are declared in `src/app/globals.css` as `oklch()` with the source hex in a trailing
comment. Components consume semantic classes (`bg-card`, `text-muted-foreground`, `text-ranking-top`)
and never hardcode a hex — there are currently zero hardcoded colours outside `globals.css`.

Light / Dark / System is handled by `next-themes` (`src/components/theme-provider.tsx`), toggled
from the account menu. `/design-system` renders every token and component state for review; it is
development-only and returns 404 in a production build.

## How tracking works

1. Add an extension on `/dashboard/extensions/[id]` — either a store URL or a bare 32-character ID.
2. Add a **keyword × locale matrix** on that page's Rankings tab. Every keyword is tracked in every
   selected locale, producing one *tracking target* per pair.
3. ext-probe reads `tracking_targets` on its Cron schedule, collects the Chrome Web Store SERP for each
   distinct `(keyword, locale)`, and writes one `ranking_runs` row per target extension.
4. The matrix shows the latest state per target.

### Matrix cell states

| Cell  | Meaning                                                                     |
| ----- | --------------------------------------------------------------------------- |
| `#12` | Ranked, collected successfully                                              |
| `NR`  | The collection was reliable but the extension was not in the checked range   |
| `!`   | The last collection failed — the ranking is unknown, not zero                |
| `—`   | Not collected yet                                                           |

`NR` and `!` are deliberately distinct: `NR` is a conclusion, `!` is a missing conclusion.

Locale codes use the Chrome Web Store URL parameter (`en`, `zh_CN`) because that value is part of the
join key against probe data. Do not normalise them to BCP 47 dashes.

Any public listing can be tracked; there is no ownership verification and no "my extensions" concept.

## Authentication

Sign-in is Neon Auth (Managed Better Auth) with **Google as the only provider**. Google currently runs on
Neon's _shared_ OAuth credentials, so no Google Cloud project is needed — but the consent screen shows
Neon's branding. Before launch, add your own client ID and secret under
Console → branch → **Auth → OAuth providers** and point Google's authorized redirect URI at
`{NEON_AUTH_BASE_URL}/callback/google`.

How it fits together:

- `src/proxy.ts` protects `/dashboard/*` and refreshes the session cookie on every dashboard request.
  Anonymous visitors are redirected to `/auth/sign-in?next=<original path>`; `next` is validated to a
  same-origin relative path before use, so it cannot be turned into an open redirect. The middleware only
  runs where the matcher points, so `/` and `/auth/*` are never blocked.
- `src/app/api/auth/[...path]/route.ts` proxies every Better Auth call to Neon Auth. The browser client
  (`src/lib/auth/client.ts`) talks only to that same-origin route, so the auth URL is never exposed
  client-side.
- `src/lib/session.ts` is the single seam the app consumes: `requireCurrentUser()` for anything that needs
  a user, `getCurrentUser()` when `null` is meaningful.

Ownership is keyed on the Neon Auth **user id** (`extensions.owner_user_id`,
`user_preferences.owner_user_id`), so a signed-in account only ever sees its own rows. The id is the
primary key of `neon_auth."user"` and never changes, which is what makes changing the account's email
address a non-event — every row stays attached to the same workspace. `tracking_targets` carries no owner
of its own: it follows `extensions` through `extension_id`, so there is only one place to get this right.

## Deployment

Web: Next.js on Vercel. Dashboard routes are `force-dynamic`, and `pnpm build` requires neither database
nor auth access, so a build succeeds without secrets — but `DATABASE_URL`, `NEON_AUTH_BASE_URL` and
`NEON_AUTH_COOKIE_SECRET` must all be set in the Vercel project for the app to work at runtime.
Add the production domain to Neon Auth's trusted domains, or sign-in redirects will be rejected.

Crawler: Cloudflare Workers (separate repository, ext-probe).

Cold historical storage: Cloudflare R2, for long-term rank history (future).

## Roadmap

1. Replace Neon's shared Google credentials with our own OAuth client, and add more providers.
2. Add TanStack Table for client-side sorting/filtering/pagination on the Extensions and Keywords tables.
3. Sync extension titles and metadata (belongs in ext-probe, since it requires fetching store pages).
4. Historical rank charts per keyword × locale, not just the aggregate.
5. Keyword discovery and cross-extension comparison workspaces.

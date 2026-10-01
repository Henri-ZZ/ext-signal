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
| Database  | Neon Postgres (`@neondatabase/serverless`)    |
| Package   | pnpm (only pnpm — no npm/yarn lockfiles)      |

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then fill in DATABASE_URL
pnpm dev
```

`/` is a placeholder entry point; the dashboard lives at `/dashboard`.

### Environment variables

| Variable            | Required | Purpose                                                                 |
| ------------------- | -------- | ----------------------------------------------------------------------- |
| `DATABASE_URL`      | yes      | Neon connection string, shared with ext-probe                                     |
| `EXT_PROBE_URL`     | no       | ext-probe Worker base URL — used by **Track now** and by metadata resolve on add  |
| `EXT_PROBE_TOKEN`   | no       | `MANUAL_TRIGGER_TOKEN` of the ext-probe Worker                                    |

Without `EXT_PROBE_URL` / `EXT_PROBE_TOKEN` everything still works: the manual trigger reports that it
is not configured, and a newly added extension shows a monogram fallback until ext-probe backfills
its title and icon on the next collection. Scheduled collection keeps running on Cloudflare regardless.

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
assets/logo.png                # brand source (1254px), not served — 界面与图标用的
                               #   public/logo.png、src/app/icon.png、apple-icon.png 都由它生成
db/schema.sql                  # tables + target_latest view
src/
  app/
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
    db.ts                      # Neon client + value normalisation
    session.ts                 # current-user seam
    rankings.ts                # rank tiers, aggregation, formatting
    cws.ts                     # Chrome Web Store URL / ID parsing
    locales.ts                 # locale codes shared with ext-probe
scripts/
  apply-schema.mjs             # applies db/schema.sql to DATABASE_URL
```

Pages are Server Components. Client boundaries are limited to what genuinely needs interactivity:
the sidebar, dialogs, the target form, the chart, the tabs container and the Track now button.

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

Not wired up yet. `src/lib/session.ts` is the single seam that resolves the current user and currently
returns a hardcoded workspace owner (`henri@henriz.dev`). Everything else — Server Actions, queries,
ownership checks — already scopes by that email, so adding Neon Auth means replacing that one function.

## Deployment

Web: Next.js on Vercel. Dashboard routes are `force-dynamic`, and `pnpm build` does not require database
access, so a build succeeds without `DATABASE_URL`; the env var must be set in the Vercel project.

Crawler: Cloudflare Workers (separate repository, ext-probe).

Cold historical storage: Cloudflare R2, for long-term rank history (future).

## Roadmap

1. Wire up Neon Auth and replace the user seam.
2. Add TanStack Table for client-side sorting/filtering/pagination on the Extensions and Keywords tables.
3. Sync extension titles and metadata (belongs in ext-probe, since it requires fetching store pages).
4. Historical rank charts per keyword × locale, not just the aggregate.
5. Keyword discovery and cross-extension comparison workspaces.

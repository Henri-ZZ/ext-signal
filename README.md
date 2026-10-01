# ExtSignal

ExtSignal is a Chrome Web Store search intelligence platform.

It tracks how extensions rank for **keyword × locale** combinations over time, so you can see search
visibility, ranking movement, locale coverage and competitive overlap for any public Chrome Web Store
listing.

This repository currently contains the **dashboard UI skeleton**: project infrastructure, the app
shell and a data-first dashboard built entirely on mock data. There is no database, auth, billing or
crawler wiring yet.

## Tech stack

| Area      | Choice                                        |
| --------- | --------------------------------------------- |
| Framework | Next.js (App Router, Turbopack)               |
| Language  | TypeScript (strict)                           |
| Styling   | Tailwind CSS v4                               |
| UI        | shadcn/ui + Radix primitives + Lucide Icons   |
| Charts    | Recharts via shadcn chart components          |
| Package   | pnpm (only pnpm — no npm/yarn lockfiles)      |

## Getting started

```bash
pnpm install
pnpm dev
```

The app runs on http://localhost:3000. `/` is a placeholder entry point; the dashboard lives at
`/dashboard`.

### Scripts

```bash
pnpm dev        # start the dev server
pnpm build      # production build
pnpm start      # serve the production build
pnpm lint       # eslint (flat config)
pnpm typecheck  # next typegen && tsc --noEmit
```

## Project structure

```
src/
  app/
    page.tsx                     # placeholder landing page
    dashboard/
      layout.tsx                 # sidebar shell
      page.tsx                   # Overview
      extensions/
        page.tsx                 # tracked extensions
        [id]/page.tsx            # extension detail (Overview / Rankings / Keywords / Competitors / Locales)
      keywords|competitors|discover|settings/page.tsx
  components/
    dashboard/                   # app-level composed components
    ui/                          # shadcn/ui primitives
  data/
    mock.ts                      # all mock data (single source, easy to replace)
  lib/
    rankings.ts                  # rank tiers + aggregation helpers
    utils.ts                     # cn()
  hooks/
```

Data flows one way: `data/mock.ts` → `components/dashboard/*` → `app/*`. When Neon is connected,
`data/mock.ts` is the module that gets replaced; no component holds its own hardcoded figures.

Pages are Server Components. Client boundaries are limited to what genuinely needs interactivity:
the sidebar, the account menu, the `Add Extension` dialog, the chart and the detail page tabs
(panels themselves stay server-rendered and are passed down as children).

## Product concepts

- **Extension** — a tracked public Chrome Web Store listing, identified by its CWS ID.
- **Tracking target** — one `keyword × locale` pair. This is the core unit of data.
- **Rank tier** — rankings are bucketed into Top 3 / Top 10 / Top 20 / Top 50 / NR, rendered as a
  compact matrix on `/dashboard/extensions/[id]` → Rankings.

Any public listing can be tracked; there is no ownership verification and no "my extensions" concept.

## Future architecture

**Web** — Next.js on Vercel.

**Database** — Neon Postgres. `src/data/mock.ts` becomes the query layer.

**Auth** — Neon Auth.

**Crawler** — runs independently on Cloudflare Workers. It is deliberately not part of this
Next.js app: the web app only reads crawl results.

**Cold historical storage** — Cloudflare R2 for long-term rank history (future).

## Roadmap

1. Connect Neon Postgres and replace `src/data/mock.ts` with real queries.
2. Add Neon Auth and scope tracked extensions to a workspace.
3. Introduce TanStack Table for the Extensions/Keywords tables (filtering, sorting, pagination).
4. Build the crawler on Cloudflare Workers and persist rank history.
5. Historical rank charts, competitor tracking and keyword discovery.

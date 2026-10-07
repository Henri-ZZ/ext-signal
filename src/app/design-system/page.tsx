import type { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  DialogDemo,
  DropdownDemo,
  ChartDemo,
} from "@/components/design-system/interactive-demos"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { RankTag, RankTagUntracked } from "@/components/dashboard/rank-tag"
import {
  PENDING_CELL,
  RANK_TIER_META,
  RANK_TIER_ORDER,
  type RankCell,
} from "@/lib/rankings"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Design system",
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4 border-t pt-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-lg font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

/** A swatch driven by a semantic class, so it follows the active theme. */
function Swatch({
  token,
  className,
  note,
}: {
  token: string
  className: string
  note?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className={cn("h-12 rounded-lg border border-border/60", className)} />
      <div className="flex flex-col gap-0.5">
        <code className="font-mono text-xs">{token}</code>
        {note ? (
          <span className="text-xs text-muted-foreground">{note}</span>
        ) : null}
      </div>
    </div>
  )
}

function SwatchGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {children}
    </div>
  )
}

const RANKED = (rank: number): RankCell => ({ ...PENDING_CELL, state: "ranked", rank })
const NOT_FOUND_SHALLOW: RankCell = {
  ...PENDING_CELL,
  state: "not-found",
  checkedWithin: 10,
}
const NOT_FOUND: RankCell = { ...PENDING_CELL, state: "not-found", checkedWithin: 50 }
const FAILED: RankCell = {
  ...PENDING_CELL,
  state: "failed",
  failures: 3,
  message: "HTTP 429",
}

const RANK_STATES: { cell: RankCell; label: string }[] = [
  { cell: RANKED(3), label: "green · 1–10" },
  { cell: RANKED(22), label: "grey · 11–30" },
  { cell: RANKED(42), label: "yellow · 31–50" },
  { cell: NOT_FOUND_SHALLOW, label: "grey · not in top 10" },
  { cell: NOT_FOUND, label: "red · >50" },
  { cell: FAILED, label: "Collection failed" },
  { cell: PENDING_CELL, label: "Not collected" },
]

export default function DesignSystemPage() {
  // Development-only reference. In a production build this route prerenders as
  // a 404, so nothing internal is exposed on the deployed site.
  if (process.env.NODE_ENV === "production") notFound()

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          ExtSignal design system
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Development reference for the tokens in{" "}
          <code className="font-mono">src/app/globals.css</code>. Everything here is
          driven by semantic classes, so switching the theme in the account menu
          repaints every swatch below. The written contract lives in{" "}
          <code className="font-mono">docs/design-system.md</code>.
        </p>
      </header>

      <Section
        title="Brand"
        description="Green is spent on brand, primary actions, selection, focus and positive data — never as a surface."
      >
        <SwatchGrid>
          <Swatch token="bg-primary" className="bg-primary" note="Primary / brand" />
          <Swatch token="bg-primary-hover" className="bg-primary-hover" note="Hover" />
          <Swatch token="bg-primary-active" className="bg-primary-active" note="Active" />
          <Swatch token="bg-primary-soft" className="bg-primary-soft" note="Soft / selected" />
          <Swatch
            token="bg-primary-soft-hover"
            className="bg-primary-soft-hover"
            note="Soft hover"
          />
        </SwatchGrid>
      </Section>

      <Section
        title="Surfaces and text"
        description="Most of the interface is neutral. Card and canvas stay a step apart in both themes."
      >
        <SwatchGrid>
          <Swatch token="bg-background" className="bg-background" note="Canvas" />
          <Swatch token="bg-card" className="bg-card" note="Card / popover" />
          <Swatch token="bg-secondary" className="bg-secondary" note="Secondary surface" />
          <Swatch token="bg-muted" className="bg-muted" note="Muted / hover" />
          <Swatch token="bg-sidebar" className="bg-sidebar" note="Sidebar" />
          <Swatch token="border-border" className="bg-border" note="Border" />
          <Swatch token="bg-input" className="bg-input" note="Stronger border / input" />
          <Swatch
            token="text-foreground"
            className="flex items-center justify-center bg-card text-foreground"
            note="Primary text"
          />
          <Swatch
            token="text-muted-foreground"
            className="flex items-center justify-center bg-card text-muted-foreground"
            note="Secondary text"
          />
          <Swatch token="ring-ring" className="bg-ring" note="Focus ring" />
        </SwatchGrid>
      </Section>

      <Section
        title="Status"
        description="Status colours are pairs: a soft surface plus a readable foreground."
      >
        <SwatchGrid>
          <Swatch token="bg-success" className="bg-success" note="Success / positive" />
          <Swatch token="bg-success-soft" className="bg-success-soft" note="Success soft" />
          <Swatch token="bg-warning" className="bg-warning" note="Warning" />
          <Swatch token="bg-warning-soft" className="bg-warning-soft" note="Warning soft" />
          <Swatch token="bg-info" className="bg-info" note="Info / new" />
          <Swatch token="bg-info-soft" className="bg-info-soft" note="Info soft" />
          <Swatch token="bg-destructive" className="bg-destructive" note="Danger" />
          <Swatch
            token="bg-destructive/10"
            className="bg-destructive/10"
            note="Danger soft"
          />
        </SwatchGrid>
      </Section>

      <Section
        title="Ranking language"
        description="Four bands — green, grey, yellow, red. Grey covers 11–30 so that only the bands needing attention carry colour. Hue carries the meaning; no band is subdivided into shades."
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            {RANK_STATES.map(({ cell, label }) => (
              <span key={label} className="flex items-center gap-2">
                <RankTag cell={cell} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </span>
            ))}
            <span className="flex items-center gap-2">
              <RankTagUntracked />
              <span className="text-xs text-muted-foreground">No target</span>
            </span>
          </div>

          <SwatchGrid>
            {RANK_TIER_ORDER.map((tier) => (
              <Swatch
                key={tier}
                token={`ranking-${tier}`}
                className={RANK_TIER_META[tier].swatch}
                note={RANK_TIER_META[tier].label}
              />
            ))}
            <Swatch
              token="text-ranking-positive"
              className="flex items-center justify-center bg-card font-mono text-ranking-positive"
              note="↑ +6"
            />
            <Swatch
              token="text-ranking-negative"
              className="flex items-center justify-center bg-card font-mono text-ranking-negative"
              note="↓ −3"
            />
          </SwatchGrid>
        </div>
      </Section>

      <Section title="Typography">
        <div className="flex flex-col gap-3">
          <p className="font-heading text-2xl font-semibold tracking-tight">
            Heading · font-heading
          </p>
          <p className="text-sm">
            Body · text-sm — the default size for dashboard copy and table cells.
          </p>
          <p className="text-sm text-muted-foreground">
            Secondary · text-muted-foreground — labels, descriptions, timestamps.
          </p>
          <p className="text-xs text-muted-foreground">
            Caption · text-xs — helper text and legends.
          </p>
          <p className="font-mono text-sm tabular-nums">
            Mono · tabular-nums — ranks, locale codes, extension IDs.
          </p>
        </div>
      </Section>

      <Section
        title="Buttons"
        description="Primary is the only saturated button. Outline is the secondary action; ghost is for dense toolbars."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button>Add Extension</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Delete</Button>
            <Button variant="link">Link</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="xs">Extra small</Button>
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Icon button">
              <span className="font-mono text-xs">A</span>
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Badges" description="Status pills always come from a variant.">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="success">Top 10</Badge>
          <Badge variant="warning">Paused</Badge>
          <Badge variant="info">New</Badge>
          <Badge variant="destructive">Error</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </Section>

      <Section title="Forms">
        <div className="grid max-w-xl gap-4">
          <Input placeholder="Paste a Chrome Web Store URL or extension ID" />
          <Input disabled placeholder="Disabled" />
          <Input aria-invalid placeholder="Invalid state" />
          <Textarea placeholder="Add keywords, one per line" />
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked className="peer sr-only" />
              <span className="inline-flex h-6 items-center rounded-md border px-2 font-mono text-xs text-muted-foreground transition-colors select-none peer-checked:border-primary/45 peer-checked:bg-primary-soft peer-checked:text-primary-active peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50">
                en
              </span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input type="checkbox" defaultChecked className="peer sr-only" />
              <span className="relative h-5 w-9 shrink-0 rounded-full bg-input transition-colors after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-card after:transition-transform after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-4 peer-checked:after:bg-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50" />
              <span className="text-muted-foreground">Switch (on)</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input type="checkbox" className="peer sr-only" />
              <span className="relative h-5 w-9 shrink-0 rounded-full bg-input transition-colors after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-card after:transition-transform after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-4 peer-checked:after:bg-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50" />
              <span className="text-muted-foreground">Switch (off)</span>
            </label>
          </div>
        </div>
      </Section>

      <Section title="Surfaces">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Card</CardTitle>
              <CardDescription>Sits on the canvas, hairline border, no shadow.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Cards group one idea. Prefer a panel with dividers over a grid of cards
              for data-dense sections.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Metric</CardTitle>
              <CardDescription>Only the hero number earns colour.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-baseline gap-2">
              <span className="font-heading text-2xl font-semibold tracking-tight tabular-nums">
                24
              </span>
              <span className="text-xs text-ranking-positive">↑ +6</span>
              <span className="text-xs text-muted-foreground">keywords in top 10</span>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section
        title="Table"
        description="White surface, subtle borders, quiet hover. No zebra striping."
      >
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Keyword</TableHead>
                <TableHead className="text-right">EN</TableHead>
                <TableHead className="text-right">ZH-CN</TableHead>
                <TableHead className="text-right">ES</TableHead>
                <TableHead className="text-right">DE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { keyword: "edit page", cells: [RANKED(3), RANKED(8), RANKED(17), RANKED(34)] },
                { keyword: "page editor", cells: [RANKED(7), RANKED(12), RANKED(28), NOT_FOUND] },
                { keyword: "web page editor", cells: [RANKED(11), FAILED, RANKED(18), PENDING_CELL] },
              ].map((row) => (
                <TableRow key={row.keyword}>
                  <TableCell>{row.keyword}</TableCell>
                  {row.cells.map((cell, index) => (
                    <TableCell key={index} className="text-right">
                      <RankTag cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

      <Section title="Overlays">
        <div className="flex flex-wrap items-center gap-3">
          <DropdownDemo />
          <DialogDemo />
        </div>
      </Section>

      <Section
        title="Charts"
        description="Green is reserved for your own extension or the primary metric. Every other series is a different hue."
      >
        <div className="flex flex-col gap-4">
          <ChartDemo />
          <SwatchGrid>
            <Swatch token="--chart-1" className="bg-[var(--chart-1)]" note="Own extension" />
            <Swatch token="--chart-2" className="bg-[var(--chart-2)]" note="Competitor" />
            <Swatch token="--chart-3" className="bg-[var(--chart-3)]" note="Series 3" />
            <Swatch token="--chart-4" className="bg-[var(--chart-4)]" note="Series 4" />
            <Swatch token="--chart-5" className="bg-[var(--chart-5)]" note="Baseline" />
          </SwatchGrid>
        </div>
      </Section>
    </main>
  )
}

import Link from "next/link"

import { AddTargetsForm } from "@/components/dashboard/add-targets-form"
import {
  DataTable,
  type DataTableColumn,
} from "@/components/dashboard/data-table"
import { ExtensionIcon } from "@/components/dashboard/extension-icon"
import { Panel } from "@/components/dashboard/panel"
import { RankingsMatrix } from "@/components/dashboard/rankings-matrix"
import { RemoveExtensionDialog } from "@/components/dashboard/remove-extension-dialog"
import { SectionHeading } from "@/components/dashboard/section-heading"
import { StatGroup, StatTile } from "@/components/dashboard/stat-tile"
import { TargetsTable } from "@/components/dashboard/targets-table"
import { VisibilityChart } from "@/components/dashboard/visibility-chart"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type {
  Competitor,
  ExtensionSummary,
  HistoryPoint,
  MatrixRow,
  RankingsMatrix as Matrix,
} from "@/data/extensions"
import { localeLabel, localeName } from "@/lib/locales"
import {
  RANK_TIER_META,
  formatAverageRank,
  formatPercent,
  formatRelativeTime,
  rankTier,
  summarizeCells,
} from "@/lib/rankings"
import { cn } from "@/lib/utils"

function cellsFor(row: MatrixRow, locales: string[]) {
  return locales.flatMap((locale) => (row.cells[locale] ? [row.cells[locale]] : []))
}

function bestRankedLocale(row: MatrixRow, locales: string[]) {
  let best: { locale: string; rank: number } | null = null

  for (const locale of locales) {
    const cell = row.cells[locale]
    if (cell?.state === "ranked" && cell.rank != null) {
      if (best == null || cell.rank < best.rank) {
        best = { locale, rank: cell.rank }
      }
    }
  }

  return best
}

export function OverviewTab({
  extension,
  matrix,
  history,
}: {
  extension: ExtensionSummary
  matrix: Matrix
  history: HistoryPoint[]
}) {
  const coverage = summarizeCells(
    matrix.rows.flatMap((row) => Object.values(row.cells)),
  )

  return (
    <div className="flex flex-col gap-5">
      <StatGroup>
        <StatTile
          label="Visibility"
          value={extension.targetCount > 0 ? formatPercent(extension.visibility) : "—"}
          detail={`${extension.rankedCount} of ${extension.targetCount} targets ranked`}
        />
        <StatTile
          label="Best rank"
          value={extension.bestRank == null ? "—" : `#${extension.bestRank}`}
          detail="across every tracked locale"
        />
        <StatTile
          label="Keywords in Top 10"
          value={String(extension.top10Count)}
          detail={`${extension.keywordCount} keywords tracked`}
        />
        <StatTile
          label="Locales"
          value={String(extension.localeCount)}
          detail="columns in the rankings matrix"
        />
      </StatGroup>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
        <span>
          <span className="font-medium text-foreground tabular-nums">
            {coverage.rankedCount}
          </span>{" "}
          ranked
        </span>
        <span>
          <span className="font-medium text-foreground tabular-nums">
            {coverage.notFoundCount}
          </span>{" "}
          not ranked
        </span>
        <span>
          <span className="font-medium text-foreground tabular-nums">
            {coverage.failedCount}
          </span>{" "}
          collection failed
        </span>
        <span>
          <span className="font-medium text-foreground tabular-nums">
            {coverage.pendingCount}
          </span>{" "}
          not collected yet
        </span>
        <span className="text-muted-foreground/80">
          last collection {formatRelativeTime(extension.lastCollectedAt)}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Visibility</CardTitle>
          <CardDescription>
            Visibility and average ranking position over time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VisibilityChart data={history} />
        </CardContent>
      </Card>

      <Panel className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="grid gap-0.5">
          <p className="text-sm font-medium">Remove extension</p>
          <p className="text-xs text-muted-foreground">
            Stops tracking every keyword × locale target. Collected rankings
            stay in the database.
          </p>
        </div>
        <RemoveExtensionDialog
          extensionId={extension.id}
          name={extension.name}
        />
      </Panel>
    </div>
  )
}

export function RankingsTab({
  extension,
  matrix,
}: {
  extension: ExtensionSummary
  matrix: Matrix
}) {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <SectionHeading
          title="Add tracking targets"
          description="Every keyword is tracked in every locale you select."
        />
        <Panel className="p-4">
          <AddTargetsForm extensionId={extension.id} />
        </Panel>
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeading
          title="Keyword × locale rankings"
          description={`${matrix.rows.length} keywords across ${matrix.locales.length} locales · refreshed ${formatRelativeTime(extension.lastCollectedAt)}`}
        />
        <Panel>
          <RankingsMatrix matrix={matrix} />
        </Panel>
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeading
          title="Targets"
          description="Pause or remove individual keyword × locale pairs."
        />
        <Panel>
          <TargetsTable matrix={matrix} />
        </Panel>
      </section>
    </div>
  )
}

export function KeywordsTab({ matrix }: { matrix: Matrix }) {
  const columns: DataTableColumn<MatrixRow>[] = [
    {
      id: "keyword",
      header: "Keyword",
      cell: (row) => <span className="font-medium">{row.keyword}</span>,
    },
    {
      id: "bestRank",
      header: "Best rank",
      align: "right",
      cell: (row) => {
        const best = bestRankedLocale(row, matrix.locales)
        if (!best) return <span className="text-muted-foreground">—</span>

        return (
          <Badge
            variant="secondary"
            className={cn(
              "font-mono tabular-nums",
              RANK_TIER_META[rankTier(best.rank)].cell,
            )}
          >
            #{best.rank}
          </Badge>
        )
      },
    },
    {
      id: "bestLocale",
      header: "Best locale",
      align: "right",
      cell: (row) => {
        const best = bestRankedLocale(row, matrix.locales)
        return best ? (
          <span className="font-mono text-xs">{localeLabel(best.locale)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
    },
    {
      id: "averageRank",
      header: "Average rank",
      align: "right",
      cell: (row) =>
        formatAverageRank(summarizeCells(cellsFor(row, matrix.locales)).averageRank),
    },
    {
      id: "coverage",
      header: "Locales ranked",
      align: "right",
      cell: (row) => {
        const summary = summarizeCells(cellsFor(row, matrix.locales))
        return (
          <span className="text-muted-foreground tabular-nums">
            {summary.rankedCount} / {matrix.locales.length}
          </span>
        )
      },
    },
  ]

  if (matrix.rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">
        No keywords yet. Add targets on the Rankings tab.
      </p>
    )
  }

  return (
    <Panel>
      <DataTable
        columns={columns}
        rows={matrix.rows}
        getRowKey={(row) => row.keyword}
        className="min-w-[42rem]"
      />
    </Panel>
  )
}

const competitorColumns: DataTableColumn<Competitor>[] = [
  {
    id: "extension",
    header: "Extension",
    cell: (competitor) => (
      <Link
        href={`https://chromewebstore.google.com/detail/${competitor.cwsId}`}
        target="_blank"
        rel="noreferrer"
        className="group/competitor flex items-center gap-2.5"
      >
        <ExtensionIcon
          iconUrl={competitor.iconUrl}
          name={competitor.title ?? competitor.cwsId}
        />
        <span className="grid gap-0.5">
          <span className="font-medium group-hover/competitor:underline">
            {competitor.title ?? "Unknown title"}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {competitor.cwsId}
          </span>
        </span>
      </Link>
    ),
  },
  {
    id: "sharedTargets",
    header: "Shared targets",
    align: "right",
    cell: (competitor) => competitor.sharedTargets,
  },
  {
    id: "averagePosition",
    header: "Avg. position",
    align: "right",
    cell: (competitor) => formatAverageRank(competitor.averagePosition),
  },
  {
    id: "bestPosition",
    header: "Best position",
    align: "right",
    cell: (competitor) =>
      competitor.bestPosition == null ? "—" : `#${competitor.bestPosition}`,
  },
]

export function CompetitorsTab({
  competitors,
}: {
  competitors: Competitor[]
}) {
  if (competitors.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <SectionHeading
          title="Competitors"
          description="Listings that appear in the same search results as this extension."
        />
        <p className="rounded-xl border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">
          No competitor data yet. Rankings must be collected before overlap can
          be computed.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <SectionHeading
        title="Competitors"
        description="Listings that share the tracked search results, ranked by overlap. Names and icons come from the metadata ext-probe resolves from the store."
      />
      <Panel>
        <DataTable
          columns={competitorColumns}
          rows={competitors}
          getRowKey={(competitor) => competitor.cwsId}
          className="min-w-[40rem]"
        />
      </Panel>
    </div>
  )
}

type LocaleRow = {
  locale: string
  rankedCount: number
  top10Count: number
  averageRank: number | null
  targetCount: number
}

export function LocalesTab({ matrix }: { matrix: Matrix }) {
  const rows: LocaleRow[] = matrix.locales.map((locale) => {
    const summary = summarizeCells(
      matrix.rows.flatMap((row) => (row.cells[locale] ? [row.cells[locale]] : [])),
    )

    return {
      locale,
      rankedCount: summary.rankedCount,
      top10Count: summary.top10Count,
      averageRank: summary.averageRank,
      targetCount: summary.targetCount,
    }
  })

  const columns: DataTableColumn<LocaleRow>[] = [
    {
      id: "locale",
      header: "Locale",
      cell: (row) => (
        <span className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono">
            {localeLabel(row.locale)}
          </Badge>
          <span className="text-muted-foreground">{localeName(row.locale)}</span>
        </span>
      ),
    },
    {
      id: "ranked",
      header: "Keywords ranked",
      align: "right",
      cell: (row) => (
        <span className="tabular-nums">
          {row.rankedCount} / {row.targetCount}
        </span>
      ),
    },
    {
      id: "top10",
      header: "Top 10",
      align: "right",
      cell: (row) => row.top10Count,
    },
    {
      id: "averageRank",
      header: "Average rank",
      align: "right",
      cell: (row) => formatAverageRank(row.averageRank),
    },
  ]

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">
        No locales yet. Add targets on the Rankings tab.
      </p>
    )
  }

  return (
    <Panel>
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.locale}
        className="min-w-[34rem]"
      />
    </Panel>
  )
}


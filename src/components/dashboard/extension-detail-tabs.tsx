import {
  getCompetitors,
  locales,
  type CompetitorRow,
  type LocaleInfo,
  type TrackedExtension,
} from "@/data/mock"
import {
  RANK_TIER_META,
  formatAverageRank,
  formatDelta,
  formatRank,
  formatRelativeMinutes,
  rankTier,
  summarizeKeyword,
  summarizeLocale,
  type LocaleCode,
  type LocaleSummary,
  type RankedKeyword,
} from "@/lib/rankings"
import { cn } from "@/lib/utils"

import {
  DataTable,
  type DataTableColumn,
} from "@/components/dashboard/data-table"
import { Panel } from "@/components/dashboard/panel"
import { RankingsMatrix } from "@/components/dashboard/rankings-matrix"
import { SectionHeading } from "@/components/dashboard/section-heading"
import { StatGroup, StatTile } from "@/components/dashboard/stat-tile"
import { Badge } from "@/components/ui/badge"

const localeCodes: LocaleCode[] = locales.map((locale) => locale.code)

function localeLabel(code: LocaleCode) {
  return locales.find((locale) => locale.code === code)?.label ?? code
}

function RankBadge({ rank }: { rank: number | null }) {
  const tier = rankTier(rank)
  return (
    <Badge
      variant="secondary"
      className={cn("font-mono tabular-nums", RANK_TIER_META[tier].cell)}
    >
      {formatRank(rank)}
    </Badge>
  )
}

export function OverviewTab({ extension }: { extension: TrackedExtension }) {
  return (
    <StatGroup>
      <StatTile
        label="Visibility"
        value={`${extension.visibility}%`}
        detail={`${formatDelta(extension.visibilityChange)} pts over 30 days`}
      />
      <StatTile
        label="Average rank"
        value={formatAverageRank(extension.averageRank)}
        detail={`${extension.top10Count} keywords inside the top 10`}
      />
      <StatTile
        label="Keywords tracked"
        value={String(extension.keywordsTracked)}
        detail={`${extension.rankings.length} shown in the matrix`}
      />
      <StatTile
        label="Locales tracked"
        value={String(extension.localesTracked)}
        detail={`${locales.length} compared in the matrix`}
      />
    </StatGroup>
  )
}

export function RankingsTab({ extension }: { extension: TrackedExtension }) {
  return (
    <div className="flex flex-col gap-3">
      <SectionHeading
        title="Keyword × locale rankings"
        description={`${extension.rankings.length} tracked keywords across ${locales.length} locales · refreshed ${formatRelativeMinutes(extension.lastCheckedMinutes)}`}
      />
      <Panel>
        <RankingsMatrix keywords={extension.rankings} />
      </Panel>
    </div>
  )
}

type KeywordRow = {
  keyword: RankedKeyword
  bestRank: number | null
  bestLocale: LocaleCode | null
  averageRank: number | null
  rankedCount: number
}

const keywordColumns: DataTableColumn<KeywordRow>[] = [
  {
    id: "keyword",
    header: "Keyword",
    cell: (row) => <span className="font-medium">{row.keyword.keyword}</span>,
  },
  {
    id: "bestRank",
    header: "Best rank",
    align: "right",
    cell: (row) => <RankBadge rank={row.bestRank} />,
  },
  {
    id: "bestLocale",
    header: "Best locale",
    align: "right",
    cell: (row) =>
      row.bestLocale ? (
        <span className="font-mono text-xs">{localeLabel(row.bestLocale)}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: "averageRank",
    header: "Average rank",
    align: "right",
    cell: (row) => formatAverageRank(row.averageRank),
  },
  {
    id: "coverage",
    header: "Locales ranked",
    align: "right",
    cell: (row) => (
      <span className="text-muted-foreground">
        {row.rankedCount} / {localeCodes.length}
      </span>
    ),
  },
]

export function KeywordsTab({ extension }: { extension: TrackedExtension }) {
  const rows: KeywordRow[] = extension.rankings.map((keyword) => {
    const summary = summarizeKeyword(keyword, localeCodes)
    return {
      keyword,
      bestRank: summary.bestRank,
      bestLocale: summary.bestLocale,
      averageRank: summary.averageRank,
      rankedCount: summary.rankedCount,
    }
  })

  return (
    <div className="flex flex-col gap-3">
      <SectionHeading
        title="Keywords"
        description="Best position per keyword and how widely it ranks across locales."
      />
      <Panel>
        <DataTable
          columns={keywordColumns}
          rows={rows}
          getRowKey={(row) => row.keyword.keyword}
          className="min-w-[42rem]"
        />
      </Panel>
    </div>
  )
}

const competitorColumns: DataTableColumn<CompetitorRow>[] = [
  {
    id: "extension",
    header: "Extension",
    cell: (competitor) => (
      <div className="grid gap-0.5">
        <span className="font-medium">{competitor.name}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {competitor.cwsId}
        </span>
      </div>
    ),
  },
  {
    id: "overlap",
    header: "Keyword overlap",
    align: "right",
    cell: (competitor) => `${competitor.keywordOverlap}%`,
  },
  {
    id: "shared",
    header: "Shared keywords",
    align: "right",
    cell: (competitor) => competitor.sharedKeywords,
  },
  {
    id: "averageRank",
    header: "Avg. rank",
    align: "right",
    cell: (competitor) => formatAverageRank(competitor.averageRank),
  },
  {
    id: "visibility",
    header: "Visibility",
    align: "right",
    cell: (competitor) => `${competitor.visibility}%`,
  },
]

export function CompetitorsTab({ extension }: { extension: TrackedExtension }) {
  const competitors = getCompetitors(extension.id)

  return (
    <div className="flex flex-col gap-3">
      <SectionHeading
        title="Competitors"
        description="Listings that share the same tracked keywords in the Chrome Web Store."
      />
      <Panel>
        <DataTable
          columns={competitorColumns}
          rows={competitors}
          getRowKey={(competitor) => competitor.id}
          className="min-w-[46rem]"
        />
      </Panel>
    </div>
  )
}

type LocaleRow = {
  locale: LocaleInfo
  summary: LocaleSummary
}

const localeColumns: DataTableColumn<LocaleRow>[] = [
  {
    id: "locale",
    header: "Locale",
    cell: (row) => (
      <span className="flex items-center gap-2">
        <Badge variant="outline" className="font-mono">
          {row.locale.label}
        </Badge>
        <span className="text-muted-foreground">{row.locale.name}</span>
      </span>
    ),
  },
  {
    id: "ranked",
    header: "Keywords ranked",
    align: "right",
    cell: (row) => row.summary.rankedCount,
  },
  {
    id: "top10",
    header: "Top 10",
    align: "right",
    cell: (row) => row.summary.top10Count,
  },
  {
    id: "averageRank",
    header: "Average rank",
    align: "right",
    cell: (row) => formatAverageRank(row.summary.averageRank),
  },
]

export function LocalesTab({ extension }: { extension: TrackedExtension }) {
  const rows: LocaleRow[] = locales.map((locale) => ({
    locale,
    summary: summarizeLocale(extension.rankings, locale.code),
  }))

  return (
    <div className="flex flex-col gap-3">
      <SectionHeading
        title="Locales"
        description="Ranking coverage for each locale the extension is tracked in."
      />
      <Panel>
        <DataTable
          columns={localeColumns}
          rows={rows}
          getRowKey={(row) => row.locale.code}
        />
      </Panel>
    </div>
  )
}

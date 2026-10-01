import { locales, type KeywordRanking } from "@/data/mock"
import {
  RANK_TIER_META,
  RANK_TIER_ORDER,
  formatRank,
  rankTier,
} from "@/lib/rankings"
import { cn } from "@/lib/utils"
import {
  DataTable,
  type DataTableColumn,
} from "@/components/dashboard/data-table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const columns: DataTableColumn<KeywordRanking>[] = [
  {
    id: "keyword",
    header: "Keyword",
    cell: (keyword) => <span className="font-medium">{keyword.keyword}</span>,
  },
  ...locales.map<DataTableColumn<KeywordRanking>>((locale) => ({
    id: locale.code,
    header: (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="font-mono">{locale.label}</span>
        </TooltipTrigger>
        <TooltipContent>{locale.name}</TooltipContent>
      </Tooltip>
    ),
    align: "right",
    cell: (keyword) => {
      const rank = keyword.ranks[locale.code]
      return (
        <span
          className={cn(
            "inline-flex h-6 min-w-10 items-center justify-center rounded-md px-1.5 font-mono text-xs tabular-nums",
            RANK_TIER_META[rankTier(rank)].cell,
          )}
        >
          {formatRank(rank)}
        </span>
      )
    },
  })),
]

function RankTierLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">Rank tiers</span>
      {RANK_TIER_ORDER.map((tier) => (
        <span key={tier} className="flex items-center gap-1.5">
          <span
            className={cn("size-2.5 rounded-[3px]", RANK_TIER_META[tier].swatch)}
          />
          {RANK_TIER_META[tier].label}
        </span>
      ))}
      <span className="ml-auto hidden sm:block">
        NR = not ranked in the tracked window
      </span>
    </div>
  )
}

/**
 * The keyword x locale matrix — the core data shape of the product.
 */
export function RankingsMatrix({ keywords }: { keywords: KeywordRanking[] }) {
  return (
    <>
      <DataTable
        columns={columns}
        rows={keywords}
        getRowKey={(keyword) => keyword.keyword}
        className="min-w-[46rem]"
      />
      <RankTierLegend />
    </>
  )
}

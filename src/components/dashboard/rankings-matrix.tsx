import {
  cellDescription,
  cellLabel,
  cellStyle,
  RANK_TIER_META,
  RANK_TIER_ORDER,
} from "@/lib/rankings"
import { formatLocaleLabel, localeDescription } from "@/lib/locales"
import { cn } from "@/lib/utils"

import type { RankingsMatrix as Matrix } from "@/data/extensions"
import {
  DataTable,
  type DataTableColumn,
} from "@/components/dashboard/data-table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type MatrixRow = Matrix["rows"][number]

function buildColumns(
  matrix: Matrix,
  showRegion: boolean,
): DataTableColumn<MatrixRow>[] {
  return [
    {
      id: "keyword",
      header: "Keyword",
      cell: (row) => <span className="font-medium">{row.keyword}</span>,
    },
    ...matrix.locales.map<DataTableColumn<MatrixRow>>((locale) => ({
      id: locale,
      header: (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="font-mono">
              {formatLocaleLabel(locale, showRegion)}
            </span>
          </TooltipTrigger>
          <TooltipContent>{localeDescription(locale)}</TooltipContent>
        </Tooltip>
      ),
      align: "right",
      cell: (row) => {
        const cell = row.cells[locale]
        if (!cell) {
          return <span className="text-muted-foreground/30">·</span>
        }

        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "inline-flex h-6 min-w-10 items-center justify-center rounded-md px-1.5 font-mono text-xs tabular-nums",
                  cellStyle(cell),
                  !cell.enabled && "opacity-50",
                )}
              >
                {cellLabel(cell)}
              </span>
            </TooltipTrigger>
            <TooltipContent>{cellDescription(cell)}</TooltipContent>
          </Tooltip>
        )
      },
    })),
  ]
}

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
      <span className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-[3px] bg-amber-500/50" />
        Failed
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-[3px] bg-transparent ring-1 ring-inset ring-border" />
        Not collected
      </span>
    </div>
  )
}

/**
 * The keyword x locale matrix — the core data shape of the product.
 * Columns are derived from the locales that are actually tracked.
 */
export function RankingsMatrix({
  matrix,
  showRegion,
}: {
  matrix: Matrix
  showRegion: boolean
}) {
  if (matrix.rows.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-sm text-muted-foreground">
        No targets yet. Add keywords and locales above to start tracking.
      </p>
    )
  }

  return (
    <>
      <DataTable
        columns={buildColumns(matrix, showRegion)}
        rows={matrix.rows}
        getRowKey={(row) => row.keyword}
        className="min-w-[46rem]"
      />
      <RankTierLegend />
    </>
  )
}

import { Pause, Play, Trash2 } from "lucide-react"

import {
  deleteTargetAction,
  setTargetEnabledAction,
} from "@/app/dashboard/actions"
import {
  DataTable,
  type DataTableColumn,
} from "@/components/dashboard/data-table"
import { Button } from "@/components/ui/button"
import type { MatrixCell, RankingsMatrix } from "@/data/extensions"
import { formatLocaleLabel } from "@/lib/locales"
import {
  cellDescription,
  cellLabel,
  cellStyle,
  formatRelativeTime,
  formatRelativeTimeFromNow,
} from "@/lib/rankings"
import { cn } from "@/lib/utils"

type TargetEntry = {
  targetId: string
  keyword: string
  locale: string
  cell: MatrixCell
}

function flatten(matrix: RankingsMatrix): TargetEntry[] {
  const entries: TargetEntry[] = []

  for (const row of matrix.rows) {
    for (const locale of matrix.locales) {
      const cell = row.cells[locale]
      if (!cell) continue
      entries.push({
        targetId: cell.targetId,
        keyword: row.keyword,
        locale,
        cell,
      })
    }
  }

  return entries
}

function buildColumns(showRegion: boolean): DataTableColumn<TargetEntry>[] {
  return [
    {
      id: "keyword",
      header: "Keyword",
      cell: (entry) => <span className="font-medium">{entry.keyword}</span>,
    },
    {
      id: "locale",
      header: "Locale",
      cell: (entry) => (
        <span className="font-mono text-xs">
          {formatLocaleLabel(entry.locale, showRegion)}
        </span>
      ),
    },
  {
    id: "status",
    header: "Status",
    cell: (entry) => (
      <span className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex h-6 min-w-10 items-center justify-center rounded-md px-1.5 font-mono text-xs tabular-nums",
            cellStyle(entry.cell),
          )}
          title={cellDescription(entry.cell)}
        >
          {cellLabel(entry.cell)}
        </span>
        {!entry.cell.enabled ? (
          <span className="text-xs text-muted-foreground">paused</span>
        ) : null}
        {entry.cell.failures > 1 ? (
          <span
            className="text-xs text-warning"
            title={cellDescription(entry.cell)}
          >
            {entry.cell.failures}× failing
            {entry.cell.retryAfter
              ? ` · retry ${formatRelativeTimeFromNow(entry.cell.retryAfter)}`
              : ""}
          </span>
        ) : null}
      </span>
    ),
  },
  {
    id: "collected",
    header: "Last collected",
    cell: (entry) => (
      <span className="text-muted-foreground">
        {formatRelativeTime(entry.cell.collectedAt)}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    align: "right",
    cell: (entry) => (
      <span className="flex items-center justify-end gap-1">
        <form action={setTargetEnabledAction}>
          <input type="hidden" name="targetId" value={entry.targetId} />
          <input
            type="hidden"
            name="enabled"
            value={entry.cell.enabled ? "false" : "true"}
          />
          <Button
            type="submit"
            size="icon-sm"
            variant="ghost"
            title={entry.cell.enabled ? "Pause tracking" : "Resume tracking"}
          >
            {entry.cell.enabled ? <Pause /> : <Play />}
            <span className="sr-only">
              {entry.cell.enabled ? "Pause" : "Resume"}
            </span>
          </Button>
        </form>
        <form action={deleteTargetAction}>
          <input type="hidden" name="targetId" value={entry.targetId} />
          <Button
            type="submit"
            size="icon-sm"
            variant="ghost"
            title="Stop tracking this target"
          >
            <Trash2 />
            <span className="sr-only">Delete target</span>
          </Button>
        </form>
      </span>
    ),
  },
  ]
}

export function TargetsTable({
  matrix,
  showRegion,
}: {
  matrix: RankingsMatrix
  showRegion: boolean
}) {
  const entries = flatten(matrix)

  if (entries.length === 0) return null

  return (
    <DataTable
      columns={buildColumns(showRegion)}
      rows={entries}
      getRowKey={(entry) => entry.targetId}
      className="min-w-[42rem]"
    />
  )
}

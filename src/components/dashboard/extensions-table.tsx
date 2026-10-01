import Link from "next/link"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"

import {
  DataTable,
  type DataTableColumn,
} from "@/components/dashboard/data-table"
import type { TrackedExtension } from "@/data/mock"
import { formatDelta, formatRelativeMinutes } from "@/lib/rankings"
import { cn } from "@/lib/utils"

function VisibilityCell({ extension }: { extension: TrackedExtension }) {
  const improving = extension.visibilityChange >= 0
  const TrendIcon = improving ? ArrowUpRight : ArrowDownRight

  return (
    <div className="flex items-center gap-2">
      <span className="w-9 font-medium tabular-nums">
        {extension.visibility}%
      </span>
      <span className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
        <span
          className="block h-full rounded-full bg-foreground/60"
          style={{ width: `${extension.visibility}%` }}
        />
      </span>
      <span
        className={cn(
          "flex items-center gap-0.5 text-xs tabular-nums",
          improving
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-muted-foreground",
        )}
      >
        <TrendIcon className="size-3" />
        {formatDelta(extension.visibilityChange)}
      </span>
    </div>
  )
}

const columns: DataTableColumn<TrackedExtension>[] = [
  {
    id: "extension",
    header: "Extension",
    cell: (extension) => (
      <Link
        href={`/dashboard/extensions/${extension.id}`}
        className="group/extension grid gap-0.5"
      >
        <span className="font-medium group-hover/extension:underline">
          {extension.name}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {extension.cwsId}
        </span>
      </Link>
    ),
  },
  {
    id: "visibility",
    header: "Visibility",
    cell: (extension) => <VisibilityCell extension={extension} />,
  },
  {
    id: "keywords",
    header: "Keywords",
    align: "right",
    cell: (extension) => extension.keywordsTracked,
  },
  {
    id: "top10",
    header: "Top 10",
    align: "right",
    cell: (extension) => extension.top10Count,
  },
  {
    id: "locales",
    header: "Locales",
    align: "right",
    cell: (extension) => extension.localesTracked,
  },
  {
    id: "lastChecked",
    header: "Last checked",
    align: "right",
    cell: (extension) => (
      <span className="text-muted-foreground">
        {formatRelativeMinutes(extension.lastCheckedMinutes)}
      </span>
    ),
  },
]

export function ExtensionsTable({
  extensions,
}: {
  extensions: TrackedExtension[]
}) {
  return (
    <DataTable
      columns={columns}
      rows={extensions}
      getRowKey={(extension) => extension.id}
      className="min-w-[52rem]"
    />
  )
}

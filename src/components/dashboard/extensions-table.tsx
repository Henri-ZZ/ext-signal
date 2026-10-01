import Link from "next/link"

import {
  DataTable,
  type DataTableColumn,
} from "@/components/dashboard/data-table"
import { ExtensionIcon } from "@/components/dashboard/extension-icon"
import type { ExtensionSummary } from "@/data/extensions"
import { formatPercent, formatRelativeTime } from "@/lib/rankings"

function VisibilityCell({ extension }: { extension: ExtensionSummary }) {
  if (extension.targetCount === 0) {
    return <span className="text-xs text-muted-foreground">No targets</span>
  }

  return (
    <div className="flex items-center gap-2">
      <span className="w-9 font-medium tabular-nums">
        {formatPercent(extension.visibility)}
      </span>
      <span className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
        <span
          className="block h-full rounded-full bg-foreground/60"
          style={{ width: `${extension.visibility}%` }}
        />
      </span>
      <span className="text-xs text-muted-foreground tabular-nums">
        {extension.rankedCount}/{extension.targetCount}
      </span>
    </div>
  )
}

const columns: DataTableColumn<ExtensionSummary>[] = [
  {
    id: "extension",
    header: "Extension",
    cell: (extension) => (
      <Link
        href={`/dashboard/extensions/${extension.id}`}
        className="group/extension flex items-center gap-2.5"
      >
        <ExtensionIcon iconUrl={extension.iconUrl} name={extension.name} />
        <span className="grid gap-0.5">
          <span className="font-medium group-hover/extension:underline">
            {extension.name}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {extension.cwsId}
          </span>
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
    cell: (extension) => extension.keywordCount,
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
    cell: (extension) => extension.localeCount,
  },
  {
    id: "lastChecked",
    header: "Last checked",
    align: "right",
    cell: (extension) => (
      <span className="text-muted-foreground">
        {formatRelativeTime(extension.lastCollectedAt)}
      </span>
    ),
  },
]

export function ExtensionsTable({
  extensions,
}: {
  extensions: ExtensionSummary[]
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

import type { Metadata } from "next"
import Link from "next/link"
import { Puzzle } from "lucide-react"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { EmptyState } from "@/components/dashboard/empty-state"
import { ExtensionsTable } from "@/components/dashboard/extensions-table"
import { Panel } from "@/components/dashboard/panel"
import { SectionHeading } from "@/components/dashboard/section-heading"
import { StatGroup, StatTile } from "@/components/dashboard/stat-tile"
import { VisibilityChart } from "@/components/dashboard/visibility-chart"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  getLatestCollection,
  getOverviewStats,
  getWorkspaceHistory,
  listExtensions,
} from "@/data/extensions"
import { formatRelativeTime } from "@/lib/rankings"
import { getCurrentUser } from "@/lib/session"

export const metadata: Metadata = {
  title: "Overview",
}

function collectionSummary(
  collection: Awaited<ReturnType<typeof getLatestCollection>>,
): string {
  if (!collection) {
    return "No probe run recorded yet. Add targets, then use Track now."
  }

  const when = formatRelativeTime(
    collection.completedAt ?? collection.scheduledAt,
  )

  return `Probe last ran ${when} · ${collection.succeededCount} succeeded, ${collection.failedCount} failed`
}

export default async function DashboardOverviewPage() {
  const user = await getCurrentUser()
  const [stats, extensions, history, collection] = await Promise.all([
    getOverviewStats(user.email),
    listExtensions(user.email),
    getWorkspaceHistory(user.email, 30),
    getLatestCollection(),
  ])

  if (stats.extensionCount === 0) {
    return (
      <>
        <DashboardHeader
          title="Overview"
          description="Search visibility for every tracked extension, keyword and locale."
        />
        <div className="px-4 py-5 md:px-6">
          <EmptyState
            icon={Puzzle}
            title="No extensions tracked yet"
            description="Add a public Chrome Web Store extension, then define a keyword × locale matrix to start collecting rankings."
          />
        </div>
      </>
    )
  }

  const metrics = [
    {
      label: "Tracked Extensions",
      value: String(stats.extensionCount),
      detail: `${stats.localeCount} locales covered`,
    },
    {
      label: "Tracking Targets",
      value: String(stats.targetCount),
      detail: "keyword × locale pairs",
    },
    {
      label: "Keywords in Top 10",
      value: String(stats.top10Count),
      detail: `${stats.rankedCount} targets ranked`,
    },
    {
      label: "Locales",
      value: String(stats.localeCount),
      detail: "columns in the rankings matrix",
    },
  ]

  return (
    <>
      <DashboardHeader
        title="Overview"
        description="Search visibility for every tracked extension, keyword and locale."
      />

      <div className="flex flex-col gap-6 px-4 py-5 md:px-6">
        <StatGroup>
          {metrics.map((metric) => (
            <StatTile
              key={metric.label}
              label={metric.label}
              value={metric.value}
              detail={metric.detail}
            />
          ))}
        </StatGroup>

        <Card>
          <CardHeader>
            <CardTitle>Search Visibility</CardTitle>
            <CardDescription>{collectionSummary(collection)}</CardDescription>
          </CardHeader>
          <CardContent>
            <VisibilityChart data={history} />
          </CardContent>
        </Card>

        <section className="flex flex-col gap-3">
          <SectionHeading
            title="Extensions"
            description={`${extensions.length} extensions currently tracked`}
            action={
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/extensions">View all</Link>
              </Button>
            }
          />
          <Panel>
            <ExtensionsTable extensions={extensions} />
          </Panel>
        </section>
      </div>
    </>
  )
}

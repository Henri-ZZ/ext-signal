import type { Metadata } from "next"
import Link from "next/link"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
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
import { overviewMetrics, trackedExtensions } from "@/data/mock"

export const metadata: Metadata = {
  title: "Overview",
}

export default function DashboardOverviewPage() {
  return (
    <>
      <DashboardHeader
        title="Overview"
        description="Search visibility for every tracked extension, keyword and locale."
      />

      <div className="flex flex-col gap-6 px-4 py-5 md:px-6">
        <StatGroup>
          {overviewMetrics.map((metric) => (
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
            <CardDescription>
              Visibility and average ranking position over time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VisibilityChart />
          </CardContent>
        </Card>

        <section className="flex flex-col gap-3">
          <SectionHeading
            title="Extensions"
            description={`${trackedExtensions.length} extensions currently tracked`}
            action={
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/extensions">View all</Link>
              </Button>
            }
          />
          <Panel>
            <ExtensionsTable extensions={trackedExtensions} />
          </Panel>
        </section>
      </div>
    </>
  )
}

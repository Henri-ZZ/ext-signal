import type { Metadata } from "next"
import { Search } from "lucide-react"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { EmptyState } from "@/components/dashboard/empty-state"

export const metadata: Metadata = {
  title: "Keywords",
}

export default function KeywordsPage() {
  return (
    <>
      <DashboardHeader
        title="Keywords"
        description="Tracked keywords and their ranking footprint per locale."
      />

      <div className="px-4 py-5 md:px-6">
        <EmptyState
          icon={Search}
          title="Keyword workspace"
          description="A cross-extension keyword table with locale filters, ranking history and keyword discovery will live here. Rankings are already visible per extension today."
        />
      </div>
    </>
  )
}

import type { Metadata } from "next"
import { Swords } from "lucide-react"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { EmptyState } from "@/components/dashboard/empty-state"

export const metadata: Metadata = {
  title: "Competitors",
}

export default function CompetitorsPage() {
  return (
    <>
      <DashboardHeader
        title="Competitors"
        description="Compare tracked extensions against the listings they compete with."
      />

      <div className="px-4 py-5 md:px-6">
        <EmptyState
          icon={Swords}
          title="Competitor workspace"
          description="Keyword overlap and head-to-head ranking movement across every tracked extension. Per-extension competitor data is available on each extension page."
        />
      </div>
    </>
  )
}

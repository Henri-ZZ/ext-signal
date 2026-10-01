import type { Metadata } from "next"
import { Compass } from "lucide-react"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { EmptyState } from "@/components/dashboard/empty-state"

export const metadata: Metadata = {
  title: "Discover",
}

export default function DiscoverPage() {
  return (
    <>
      <DashboardHeader
        title="Discover"
        description="Find new extension and keyword opportunities in the Chrome Web Store."
      />

      <div className="px-4 py-5 md:px-6">
        <EmptyState
          icon={Compass}
          title="Keyword discovery"
          description="Surface extensions worth tracking and keywords they rank for, based on category, locale and visibility gaps."
        />
      </div>
    </>
  )
}

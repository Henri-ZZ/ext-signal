import type { Metadata } from "next"
import { Settings } from "lucide-react"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { EmptyState } from "@/components/dashboard/empty-state"

export const metadata: Metadata = {
  title: "Settings",
}

export default function SettingsPage() {
  return (
    <>
      <DashboardHeader
        title="Settings"
        description="Workspace, tracking preferences and account."
      />

      <div className="px-4 py-5 md:px-6">
        <EmptyState
          icon={Settings}
          title="Workspace settings"
          description="Tracking frequency, locale defaults and team access will be configured here once authentication and the database are connected."
        />
      </div>
    </>
  )
}

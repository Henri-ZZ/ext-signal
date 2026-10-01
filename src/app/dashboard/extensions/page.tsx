import type { Metadata } from "next"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ExtensionsTable } from "@/components/dashboard/extensions-table"
import { Panel } from "@/components/dashboard/panel"
import { trackedExtensions } from "@/data/mock"

export const metadata: Metadata = {
  title: "Extensions",
}

export default function ExtensionsPage() {
  return (
    <>
      <DashboardHeader
        title="Extensions"
        description="Every public Chrome Web Store listing tracked in this workspace."
      />

      <div className="px-4 py-5 md:px-6">
        <Panel>
          <ExtensionsTable extensions={trackedExtensions} />
        </Panel>
      </div>
    </>
  )
}

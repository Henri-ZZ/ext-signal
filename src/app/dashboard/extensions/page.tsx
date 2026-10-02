import type { Metadata } from "next"
import { Puzzle } from "lucide-react"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { EmptyState } from "@/components/dashboard/empty-state"
import { ExtensionsTable } from "@/components/dashboard/extensions-table"
import { Panel } from "@/components/dashboard/panel"
import { listExtensions } from "@/data/extensions"
import { requireCurrentUser } from "@/lib/session"

export const metadata: Metadata = {
  title: "Extensions",
}

export default async function ExtensionsPage() {
  const user = await requireCurrentUser()
  const extensions = await listExtensions(user.email)

  return (
    <>
      <DashboardHeader
        title="Extensions"
        description="Every public Chrome Web Store listing tracked in this workspace."
      />

      <div className="px-4 py-5 md:px-6">
        {extensions.length === 0 ? (
          <EmptyState
            icon={Puzzle}
            title="No extensions tracked yet"
            description="Add a public Chrome Web Store extension, then define a keyword × locale matrix to start collecting rankings."
          />
        ) : (
          <Panel>
            <ExtensionsTable extensions={extensions} />
          </Panel>
        )}
      </div>
    </>
  )
}

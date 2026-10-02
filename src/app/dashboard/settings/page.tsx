import type { Metadata } from "next"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { LocaleDisplayToggle } from "@/components/dashboard/locale-display-toggle"
import { Panel } from "@/components/dashboard/panel"
import { SectionHeading } from "@/components/dashboard/section-heading"
import { getUserPreferences } from "@/data/preferences"
import { getCurrentUser } from "@/lib/session"

export const metadata: Metadata = {
  title: "Settings",
}

export default async function SettingsPage() {
  const user = await getCurrentUser()
  const preferences = await getUserPreferences(user.email)

  return (
    <>
      <DashboardHeader
        title="Settings"
        description="Display preferences for this workspace."
      />

      <div className="flex flex-col gap-6 px-4 py-5 md:px-6">
        <section className="flex flex-col gap-3">
          <SectionHeading
            title="Display"
            description="How locale codes and rankings are rendered."
          />
          <Panel className="p-4">
            <LocaleDisplayToggle showRegion={preferences.localeShowRegion} />
          </Panel>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeading
            title="Tracking"
            description="Collection frequency, locale defaults and team access will be configured here once authentication and per-workspace settings land."
          />
          <Panel className="px-4 py-6">
            <p className="text-sm text-muted-foreground">
              Collection currently runs every 15 minutes on ext-probe and picks
              up new targets automatically.
            </p>
          </Panel>
        </section>
      </div>
    </>
  )
}

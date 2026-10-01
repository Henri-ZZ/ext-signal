import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ExtensionIcon } from "@/components/dashboard/extension-icon"
import {
  ExtensionTabs,
  type ExtensionTab,
} from "@/components/dashboard/extension-tabs"
import {
  CompetitorsTab,
  KeywordsTab,
  LocalesTab,
  OverviewTab,
  RankingsTab,
} from "@/components/dashboard/extension-detail-tabs"
import {
  getCompetitors,
  getExtensionHistory,
  getExtensionSummary,
  getRankingsMatrix,
} from "@/data/extensions"
import { getCurrentUser } from "@/lib/session"

type ExtensionPageProps = PageProps<"/dashboard/extensions/[id]">

export async function generateMetadata({
  params,
}: ExtensionPageProps): Promise<Metadata> {
  const { id } = await params
  const user = await getCurrentUser()
  const extension = await getExtensionSummary(user.email, id)

  return {
    title: extension?.name ?? "Extension",
  }
}

export default async function ExtensionDetailPage({
  params,
}: ExtensionPageProps) {
  const { id } = await params
  const user = await getCurrentUser()
  const extension = await getExtensionSummary(user.email, id)

  if (!extension) {
    notFound()
  }

  const [matrix, history, competitors] = await Promise.all([
    getRankingsMatrix(extension.id),
    getExtensionHistory(extension.cwsId, 30),
    getCompetitors(extension.cwsId),
  ])

  const tabs: ExtensionTab[] = [
    {
      value: "overview",
      label: "Overview",
      content: (
        <OverviewTab
          extension={extension}
          matrix={matrix}
          history={history}
        />
      ),
    },
    {
      value: "rankings",
      label: "Rankings",
      content: <RankingsTab extension={extension} matrix={matrix} />,
    },
    {
      value: "keywords",
      label: "Keywords",
      content: <KeywordsTab matrix={matrix} />,
    },
    {
      value: "competitors",
      label: "Competitors",
      content: <CompetitorsTab competitors={competitors} />,
    },
    {
      value: "locales",
      label: "Locales",
      content: <LocalesTab matrix={matrix} />,
    },
  ]

  return (
    <>
      <DashboardHeader
        title={extension.name}
        leading={
          <ExtensionIcon
            iconUrl={extension.iconUrl}
            name={extension.name}
            size={28}
          />
        }
        breadcrumbs={[
          { label: "Extensions", href: "/dashboard/extensions" },
          { label: extension.name },
        ]}
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-mono text-xs">
              Chrome Web Store ID: {extension.cwsId}
            </span>
            {extension.rating == null ? null : (
              <span className="text-xs">
                ★ {extension.rating.toFixed(1)}
                {extension.ratingCount == null
                  ? ""
                  : ` (${extension.ratingCount.toLocaleString("en-US")} ratings)`}
              </span>
            )}
          </span>
        }
      />
      <ExtensionTabs tabs={tabs} />
    </>
  )
}

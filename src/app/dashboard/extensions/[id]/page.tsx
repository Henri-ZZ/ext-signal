import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
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
import { getExtension, trackedExtensions } from "@/data/mock"

type ExtensionPageProps = PageProps<"/dashboard/extensions/[id]">

export function generateStaticParams() {
  return trackedExtensions.map((extension) => ({ id: extension.id }))
}

export async function generateMetadata({
  params,
}: ExtensionPageProps): Promise<Metadata> {
  const { id } = await params
  const extension = getExtension(id)

  return {
    title: extension?.name ?? "Extension",
  }
}

export default async function ExtensionDetailPage({
  params,
}: ExtensionPageProps) {
  const { id } = await params
  const extension = getExtension(id)

  if (!extension) {
    notFound()
  }

  const tabs: ExtensionTab[] = [
    {
      value: "overview",
      label: "Overview",
      content: <OverviewTab extension={extension} />,
    },
    {
      value: "rankings",
      label: "Rankings",
      content: <RankingsTab extension={extension} />,
    },
    {
      value: "keywords",
      label: "Keywords",
      content: <KeywordsTab extension={extension} />,
    },
    {
      value: "competitors",
      label: "Competitors",
      content: <CompetitorsTab extension={extension} />,
    },
    {
      value: "locales",
      label: "Locales",
      content: <LocalesTab extension={extension} />,
    },
  ]

  return (
    <>
      <DashboardHeader
        title={extension.name}
        breadcrumbs={[
          { label: "Extensions", href: "/dashboard/extensions" },
          { label: extension.name },
        ]}
        description={
          <span className="font-mono text-xs">
            Chrome Web Store ID: {extension.cwsId}
          </span>
        }
      />
      <ExtensionTabs tabs={tabs} />
    </>
  )
}

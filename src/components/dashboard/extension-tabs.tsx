"use client"

import type { ReactNode } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type ExtensionTab = {
  value: string
  label: string
  /** Server-rendered panel body, passed down as a React node. */
  content: ReactNode
}

export function ExtensionTabs({ tabs }: { tabs: ExtensionTab[] }) {
  const [firstTab] = tabs

  return (
    <Tabs defaultValue={firstTab?.value} className="gap-0">
      <div className="border-b px-4 py-3 md:px-6">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {tabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          // Panels are server-rendered up front so switching tabs never waits
          // on a round trip and the rankings matrix ships in the initial HTML.
          forceMount
          className="px-4 py-5 data-[state=inactive]:hidden md:px-6"
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}

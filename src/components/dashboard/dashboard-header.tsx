import { Fragment, type ReactNode } from "react"
import Link from "next/link"

import { AddExtensionDialog } from "@/components/dashboard/add-extension-dialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export type Crumb = {
  label: string
  href?: string
}

type DashboardHeaderProps = {
  title: string
  description?: ReactNode
  breadcrumbs?: Crumb[]
  /** Defaults to the global `Add Extension` action. */
  actions?: ReactNode
}

export function DashboardHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex flex-col gap-3 border-b bg-background/80 px-4 py-3 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1.5" />
        {breadcrumbs?.length ? (
          <>
            <Separator orientation="vertical" className="h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <Fragment key={`${crumb.label}-${index}`}>
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {crumb.href ? (
                        <BreadcrumbLink asChild>
                          <Link href={crumb.href}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </>
        ) : null}
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            {title}
          </h1>
          {description ? (
            <div className="text-sm text-muted-foreground">{description}</div>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {actions ?? <AddExtensionDialog />}
        </div>
      </div>
    </header>
  )
}

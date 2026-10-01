import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * Bordered surface used for tables and charts.
 * Deliberately lighter than a Card so the dashboard stays data-first.
 */
export function Panel({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10",
        className,
      )}
    >
      {children}
    </div>
  )
}

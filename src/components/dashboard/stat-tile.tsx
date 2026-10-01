import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * A row of metrics rendered as a single panel with hairline dividers, rather
 * than a set of separate cards.
 */
export function StatGroup({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-border ring-1 ring-foreground/10 lg:grid-cols-4",
        className,
      )}
    >
      {children}
    </dl>
  )
}

export function StatTile({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 bg-card px-4 py-3.5">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="font-heading text-2xl leading-none font-semibold tracking-tight tabular-nums">
        {value}
      </dd>
      {detail ? (
        <dd className="text-xs text-muted-foreground">{detail}</dd>
      ) : null}
    </div>
  )
}

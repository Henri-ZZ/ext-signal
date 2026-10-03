import { cellDescription, cellLabel, cellStyle, type RankCell } from "@/lib/rankings"
import { cn } from "@/lib/utils"

const PILL =
  "inline-flex h-6 min-w-10 items-center justify-center rounded-md px-1.5 font-mono text-xs font-semibold tabular-nums"

/**
 * A single keyword x locale cell.
 *
 * Ranked cells are tinted pills — the tint band is the rank, so the cell is
 * readable without parsing the number.
 *
 * The two "no data" states are drawn as a bar instead of a text glyph. A `·` or
 * an em dash at low opacity disappears at this size, and a bar gives a
 * predictable length and weight regardless of font metrics.
 */
export function RankTag({
  cell,
  title,
  muted,
}: {
  cell: RankCell
  title?: string
  muted?: boolean
}) {
  const className = cn(PILL, cellStyle(cell), muted && "opacity-50")

  if (cell.state === "pending") {
    return (
      <span className={className} title={title}>
        <span
          className="h-[3px] w-4 rounded-full bg-muted-foreground/45"
          aria-hidden
        />
        <span className="sr-only">{cellDescription(cell)}</span>
      </span>
    )
  }

  return (
    <span className={className} title={title}>
      {cellLabel(cell)}
    </span>
  )
}

/**
 * A keyword x locale combination with no tracking target configured at all.
 * Quieter than {@link RankTag}'s pending state: nothing is scheduled here.
 */
export function RankTagUntracked() {
  return (
    <span className={`${PILL} font-normal`}>
      <span className="h-[2px] w-3 rounded-full bg-border" aria-hidden />
      <span className="sr-only">Not tracked in this locale</span>
    </span>
  )
}

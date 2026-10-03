/**
 * Rank domain types, tiers and aggregation.
 *
 * `keyword x locale` is the core unit of data in ExtSignal. A cell can be in
 * four states, mirroring ext-probe's collection semantics:
 *
 *   ranked    已排名，值就是名次
 *   not-found 已可靠检查到某个深度但没找到（NR）
 *   failed    最近一次采集失败，无法下结论（unknown）
 *   pending   还没有采集过
 *
 * NR 与 failed 必须区分：NR 是结论，failed 是缺失的结论。
 */

export type RankCellState = "ranked" | "not-found" | "failed" | "pending"

export type RankCell = {
  state: RankCellState
  /** 仅 ranked 有值。 */
  rank: number | null
  /** NR 时表示已可靠检查到的名次范围。 */
  checkedWithin: number | null
  collectedAt: string | null
  message: string | null
  /** 连续采集失败次数（ext-probe 的 collection_state）。 */
  failures: number
  /** 退避到期时间。非空表示探针正在冷却这一组，到期前不会重试。 */
  retryAfter: string | null
}

export const PENDING_CELL: RankCell = {
  state: "pending",
  rank: null,
  checkedWithin: null,
  collectedAt: null,
  message: null,
  failures: 0,
  retryAfter: null,
}

export type RankTier = "top10" | "top30" | "top50" | "over50"

export const RANK_TIER_ORDER: RankTier[] = [
  "top10",
  "top30",
  "top50",
  "over50",
]

type RankTierMeta = {
  label: string
  cell: string
  swatch: string
}

/**
 * Four bands, one hue each: green → grey → yellow → red.
 *
 * Grey is the "nothing to see here" band and covers the widest range (11–30).
 * That is the point: colouring only the bands that need attention keeps the
 * matrix quiet, so the green cells find the eye on their own instead of every
 * cell competing for it.
 *
 * There is deliberately no second shade inside a band. Adjacent tints of one
 * hue are not reliably distinguishable at cell size — verified by rendering
 * them side by side — so extra shades would add noise, not signal.
 *
 * Boundaries follow the store's own pagination: 1–10 is page one, 11–30 is
 * pages two and three, 31–50 is pages four and five, beyond that the listing is
 * effectively invisible.
 */
export const RANK_TIER_META: Record<RankTier, RankTierMeta> = {
  top10: {
    label: "1–10",
    cell: "bg-ranking-top10-soft text-ranking-top10",
    swatch: "bg-ranking-top10-soft ring-1 ring-inset ring-ranking-top10/30",
  },
  top30: {
    label: "11–30",
    cell: "bg-ranking-top30-soft text-ranking-top30",
    swatch: "bg-ranking-top30-soft ring-1 ring-inset ring-ranking-top30/30",
  },
  top50: {
    label: "31–50",
    cell: "bg-ranking-top50-soft text-ranking-top50",
    swatch: "bg-ranking-top50-soft ring-1 ring-inset ring-ranking-top50/30",
  },
  over50: {
    label: ">50",
    cell: "bg-ranking-over50-soft text-ranking-over50",
    swatch: "bg-ranking-over50-soft ring-1 ring-inset ring-ranking-over50/30",
  },
}

export function rankTier(rank: number | null | undefined): RankTier {
  if (rank == null) return "over50"
  if (rank <= 10) return "top10"
  if (rank <= 30) return "top30"
  if (rank <= 50) return "top50"
  return "over50"
}

export function isRanked(rank: number | null | undefined): rank is number {
  return rank != null
}

/** Cell classes for the keyword x locale matrix. Empty for the pending state,
 *  which `RankTag` renders as a bar instead of a tinted pill. */
export function cellStyle(cell: RankCell): string {
  if (cell.state === "ranked" && cell.rank != null) {
    return RANK_TIER_META[rankTier(cell.rank)].cell
  }
  if (cell.state === "not-found") {
    return RANK_TIER_META.over50.cell
  }
  if (cell.state === "failed") {
    // Outlined rather than filled: a failure is a *missing* conclusion, so it
    // has to stay distinguishable from every band of the rank scale itself.
    return "bg-background text-warning ring-1 ring-inset ring-warning/45"
  }
  return ""
}

export function cellLabel(cell: RankCell): string {
  if (cell.state === "ranked" && cell.rank != null) return `#${cell.rank}`
  // Renders as `>50` today. Driven by the collected depth rather than a
  // hardcoded 50, so it stays truthful if the probe ever looks deeper.
  if (cell.state === "not-found") return `>${cell.checkedWithin ?? 50}`
  if (cell.state === "failed") return "!"
  return "—"
}

export function cellDescription(cell: RankCell): string {
  if (cell.state === "ranked" && cell.rank != null) {
    return `Position ${cell.rank} · collected ${formatRelativeTime(cell.collectedAt)}`
  }
  if (cell.state === "not-found") {
    const within = cell.checkedWithin ?? 50
    return `Not ranked within the top ${within} · collected ${formatRelativeTime(cell.collectedAt)}`
  }
  if (cell.state === "failed") {
    const parts = [
      `Last collection failed${cell.message ? `: ${cell.message}` : ""}`,
    ]
    if (cell.failures > 1) parts.push(`${cell.failures} consecutive failures`)
    if (cell.retryAfter) {
      parts.push(`retrying ${formatRelativeTimeFromNow(cell.retryAfter)}`)
    }
    return parts.join(" · ")
  }
  return "Not collected yet"
}

/** 该组是否正处在失败退避（冷却）中。 */
export function isBackingOff(cell: RankCell): boolean {
  return cell.state === "failed" && cell.retryAfter !== null
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

export type CellSummary = {
  targetCount: number
  rankedCount: number
  notFoundCount: number
  failedCount: number
  pendingCount: number
  top10Count: number
  bestRank: number | null
  averageRank: number | null
}

export function summarizeCells(cells: RankCell[]): CellSummary {
  const summary: CellSummary = {
    targetCount: cells.length,
    rankedCount: 0,
    notFoundCount: 0,
    failedCount: 0,
    pendingCount: 0,
    top10Count: 0,
    bestRank: null,
    averageRank: null,
  }

  let rankSum = 0

  for (const cell of cells) {
    if (cell.state === "ranked" && cell.rank != null) {
      summary.rankedCount += 1
      rankSum += cell.rank
      if (cell.rank <= 10) summary.top10Count += 1
      if (summary.bestRank == null || cell.rank < summary.bestRank) {
        summary.bestRank = cell.rank
      }
      continue
    }

    if (cell.state === "not-found") summary.notFoundCount += 1
    else if (cell.state === "failed") summary.failedCount += 1
    else summary.pendingCount += 1
  }

  if (summary.rankedCount > 0) {
    summary.averageRank = rankSum / summary.rankedCount
  }

  return summary
}

/** 已确认名次的 target 占比。未采集和采集异常都不算「有排名」。 */
export function visibilityPercent(rankedCount: number, targetCount: number): number {
  if (targetCount === 0) return 0
  return (rankedCount / targetCount) * 100
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

export function formatAverageRank(value: number | null): string {
  return value == null ? "—" : value.toFixed(1)
}

export function formatPercent(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`
}

export function formatRelativeTime(iso: string | null): string {
  if (!iso) return "never"

  const timestamp = new Date(iso).getTime()
  if (Number.isNaN(timestamp)) return "unknown"

  const minutes = Math.floor((Date.now() - timestamp) / 60_000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes} min ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`

  const days = Math.floor(hours / 24)
  return `${days} ${days === 1 ? "day" : "days"} ago`
}

/** 未来的时间点，例如 `in 12 hours`。 */
export function formatRelativeTimeFromNow(iso: string | null): string {
  if (!iso) return "unknown"

  const timestamp = new Date(iso).getTime()
  if (Number.isNaN(timestamp)) return "unknown"

  const minutes = Math.round((timestamp - Date.now()) / 60_000)
  if (minutes <= 0) return "shortly"
  if (minutes < 60) return `in ${minutes} min`

  const hours = Math.round(minutes / 60)
  if (hours < 24) return `in ${hours} ${hours === 1 ? "hour" : "hours"}`

  const days = Math.round(hours / 24)
  return `in ${days} ${days === 1 ? "day" : "days"}`
}

/** Fixed UTC format — avoids locale-dependent output between server and client. */
export function formatDateTime(iso: string | null): string {
  if (!iso) return "—"

  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"

  const pad = (value: number) => String(value).padStart(2, "0")
  return [
    `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`,
    `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())} UTC`,
  ].join(" ")
}

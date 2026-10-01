/**
 * Rank domain types and formatting helpers.
 *
 * `keyword x locale` is the core unit of data in ExtSignal, so rank
 * presentation and aggregation live in one place and are shared by the
 * rankings matrix, the extension table and the detail tabs.
 */

export type LocaleCode = "en" | "zh-CN" | "es" | "de" | "ja"

/** Search position per locale. `null` means not ranked / not checked yet. */
export type RankMap = Record<LocaleCode, number | null>

export type RankedKeyword = {
  keyword: string
  ranks: RankMap
}

/**
 * Buckets a raw search position into a display tier.
 * Positions beyond the tracked top-50 window are reported as `unranked` (NR).
 */
export type RankTier = "top3" | "top10" | "top20" | "top50" | "unranked"

export const RANK_TIER_ORDER: RankTier[] = [
  "top3",
  "top10",
  "top20",
  "top50",
  "unranked",
]

type RankTierMeta = {
  label: string
  description: string
  /** Tailwind classes used inside a matrix cell. */
  cell: string
  /** Tailwind classes used for the legend swatch. */
  swatch: string
}

export const RANK_TIER_META: Record<RankTier, RankTierMeta> = {
  top3: {
    label: "Top 3",
    description: "Position 1-3",
    cell: "bg-emerald-500/10 font-semibold text-emerald-700 dark:text-emerald-400",
    swatch: "bg-emerald-500/60",
  },
  top10: {
    label: "Top 10",
    description: "Position 4-10",
    cell: "bg-foreground/[0.07] font-medium text-foreground dark:bg-foreground/15",
    swatch: "bg-foreground/35",
  },
  top20: {
    label: "Top 20",
    description: "Position 11-20",
    cell: "text-foreground/80",
    swatch: "bg-foreground/20",
  },
  top50: {
    label: "Top 50",
    description: "Position 21-50",
    cell: "text-muted-foreground",
    swatch: "bg-foreground/10",
  },
  unranked: {
    label: "NR",
    description: "Not ranked in the tracked window",
    cell: "text-muted-foreground/50",
    swatch: "bg-transparent ring-1 ring-inset ring-border",
  },
}

export function rankTier(rank: number | null | undefined): RankTier {
  if (rank == null) return "unranked"
  if (rank <= 3) return "top3"
  if (rank <= 10) return "top10"
  if (rank <= 20) return "top20"
  if (rank <= 50) return "top50"
  return "unranked"
}

export function isRanked(rank: number | null | undefined): rank is number {
  return rank != null
}

export function formatRank(rank: number | null | undefined): string {
  return rank == null ? "NR" : `#${rank}`
}

/** Mean of the ranked positions, or `null` when nothing is ranked yet. */
export function averageRank(ranks: (number | null | undefined)[]): number | null {
  const ranked = ranks.filter(isRanked)
  if (ranked.length === 0) return null
  return ranked.reduce((total, rank) => total + rank, 0) / ranked.length
}

export function formatAverageRank(value: number | null): string {
  return value == null ? "NR" : value.toFixed(1)
}

export function formatRelativeMinutes(minutes: number): string {
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes} min ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`

  const days = Math.floor(hours / 24)
  return `${days} ${days === 1 ? "day" : "days"} ago`
}

export function formatDelta(value: number, digits = 1): string {
  const sign = value > 0 ? "+" : value < 0 ? "\u2212" : ""
  return `${sign}${Math.abs(value).toFixed(digits)}`
}

export type KeywordSummary = {
  bestRank: number | null
  bestLocale: LocaleCode | null
  averageRank: number | null
  rankedCount: number
}

export function summarizeKeyword(
  keyword: RankedKeyword,
  localeCodes: LocaleCode[],
): KeywordSummary {
  let bestRank: number | null = null
  let bestLocale: LocaleCode | null = null

  for (const code of localeCodes) {
    const rank = keyword.ranks[code]
    if (!isRanked(rank)) continue
    if (bestRank == null || rank < bestRank) {
      bestRank = rank
      bestLocale = code
    }
  }

  return {
    bestRank,
    bestLocale,
    averageRank: averageRank(localeCodes.map((code) => keyword.ranks[code])),
    rankedCount: localeCodes.filter((code) => isRanked(keyword.ranks[code])).length,
  }
}

export type LocaleSummary = {
  rankedCount: number
  top10Count: number
  averageRank: number | null
}

export function summarizeLocale(
  keywords: RankedKeyword[],
  code: LocaleCode,
): LocaleSummary {
  const ranks = keywords.map((keyword) => keyword.ranks[code])
  const ranked = ranks.filter(isRanked)

  return {
    rankedCount: ranked.length,
    top10Count: ranked.filter((rank) => rank <= 10).length,
    averageRank: averageRank(ranks),
  }
}

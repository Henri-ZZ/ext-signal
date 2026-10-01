import type { LocaleCode, RankedKeyword } from "@/lib/rankings"

/**
 * Mock data for the ExtSignal dashboard skeleton.
 *
 * Everything the UI renders comes from here so that swapping in Neon Postgres
 * later is a matter of replacing this module with real queries — no component
 * should hold its own hardcoded figures.
 *
 * `MOCK_TODAY` keeps generated series stable across server and client renders.
 */

const MOCK_TODAY = "2026-10-01"

export type LocaleInfo = {
  code: LocaleCode
  /** Short label used as a matrix column header. */
  label: string
  name: string
}

export const locales: LocaleInfo[] = [
  { code: "en", label: "EN", name: "English (United States)" },
  { code: "zh-CN", label: "ZH-CN", name: "Chinese (Simplified)" },
  { code: "es", label: "ES", name: "Spanish" },
  { code: "de", label: "DE", name: "German" },
  { code: "ja", label: "JA", name: "Japanese" },
]

export type KeywordRanking = RankedKeyword

export type TrackedExtension = {
  id: string
  name: string
  /** Chrome Web Store extension ID. */
  cwsId: string
  tagline: string
  /** Share of tracked keyword x locale pairs ranking in the top 100. */
  visibility: number
  /** Change in visibility points over the last 30 days. */
  visibilityChange: number
  keywordsTracked: number
  top10Count: number
  localesTracked: number
  averageRank: number
  lastCheckedMinutes: number
  rankings: KeywordRanking[]
}

export const trackedExtensions: TrackedExtension[] = [
  {
    id: "edit-page",
    name: "Edit Page",
    cwsId: "edjbgblhciojhakodeflnpampekciifl",
    tagline: "Edit any web page text, images and layout directly in the browser.",
    visibility: 68,
    visibilityChange: 4.2,
    keywordsTracked: 24,
    top10Count: 11,
    localesTracked: 30,
    averageRank: 14.8,
    lastCheckedMinutes: 8,
    rankings: [
      {
        keyword: "edit page",
        ranks: { en: 8, "zh-CN": 8, es: 14, de: 19, ja: 31 },
      },
      {
        keyword: "page editor",
        ranks: { en: 8, "zh-CN": 9, es: 17, de: 22, ja: null },
      },
      {
        keyword: "edit webpage",
        ranks: { en: 6, "zh-CN": 6, es: 12, de: 25, ja: null },
      },
      {
        keyword: "web page editor",
        ranks: { en: 11, "zh-CN": 9, es: 18, de: 27, ja: null },
      },
      {
        keyword: "pdf editor",
        ranks: { en: 19, "zh-CN": 22, es: 35, de: null, ja: null },
      },
      {
        keyword: "edit text on website",
        ranks: { en: 24, "zh-CN": 27, es: 41, de: null, ja: null },
      },
    ],
  },
  {
    id: "verbia",
    name: "Verbia",
    cwsId: "klnfbmjapndogbkceidjlhmfjboaecdp",
    tagline: "AI writing assistant for rewriting, summarizing and grammar fixes.",
    visibility: 54,
    visibilityChange: 1.6,
    keywordsTracked: 38,
    top10Count: 9,
    localesTracked: 24,
    averageRank: 21.4,
    lastCheckedMinutes: 22,
    rankings: [
      {
        keyword: "grammar checker",
        ranks: { en: 12, "zh-CN": 15, es: 21, de: 18, ja: null },
      },
      {
        keyword: "paraphrasing tool",
        ranks: { en: 9, "zh-CN": 11, es: 26, de: 30, ja: null },
      },
      {
        keyword: "ai writing assistant",
        ranks: { en: 7, "zh-CN": 8, es: 16, de: 24, ja: 38 },
      },
      {
        keyword: "text rewriter",
        ranks: { en: 18, "zh-CN": 20, es: 29, de: null, ja: null },
      },
    ],
  },
  {
    id: "stealth-browser-assistant",
    name: "Stealth Browser Assistant",
    cwsId: "gomeacpbmcpncbakghkddkkfijglbfff",
    tagline: "Automation, user-agent switching and scraping utilities for Chrome.",
    visibility: 41,
    visibilityChange: -2.3,
    keywordsTracked: 24,
    top10Count: 4,
    localesTracked: 18,
    averageRank: 27.9,
    lastCheckedMinutes: 47,
    rankings: [
      {
        keyword: "browser automation",
        ranks: { en: 14, "zh-CN": 19, es: 33, de: null, ja: null },
      },
      {
        keyword: "user agent switcher",
        ranks: { en: 6, "zh-CN": 12, es: 25, de: 34, ja: null },
      },
      {
        keyword: "web scraper",
        ranks: { en: 23, "zh-CN": 28, es: 44, de: null, ja: null },
      },
      {
        keyword: "proxy switcher",
        ranks: { en: 31, "zh-CN": 36, es: null, de: null, ja: null },
      },
    ],
  },
]

export function getExtension(id: string): TrackedExtension | undefined {
  return trackedExtensions.find((extension) => extension.id === id)
}

export const currentUser = {
  name: "Avery Chen",
  email: "avery@extsignal.app",
  initials: "AC",
  plan: "Workspace owner",
}

export type OverviewMetric = {
  label: string
  value: string
  detail: string
}

export const overviewMetrics: OverviewMetric[] = [
  {
    label: "Tracked Extensions",
    value: "3",
    detail: "1 added in the last 7 days",
  },
  {
    label: "Tracking Targets",
    value: "86",
    detail: "keyword \u00d7 locale pairs",
  },
  {
    label: "Keywords in Top 10",
    value: "24",
    detail: "across all tracked locales",
  },
  {
    label: "Locales",
    value: "12",
    detail: "5 shown in rankings",
  },
]

export type VisibilityPoint = {
  date: string
  label: string
  visibility: number
  averageRank: number
}

/**
 * 30 days of search visibility plus the average ranking position.
 * Deterministic so server and client renders agree.
 */
function buildVisibilityHistory(days: number): VisibilityPoint[] {
  const end = new Date(`${MOCK_TODAY}T00:00:00Z`)
  const points: VisibilityPoint[] = []

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = new Date(end)
    day.setUTCDate(end.getUTCDate() - offset)

    const step = days - 1 - offset
    const wave = Math.sin(step / 4.2)
    const visibility = 58 + wave * 3.2 + step * 0.24 + Math.sin(step / 1.7) * 1.1
    const averageRank = 13.6 - wave * 0.5 - step * 0.035 + Math.sin(step / 2.3) * 0.18

    points.push({
      date: day.toISOString().slice(0, 10),
      label: `${day.getUTCMonth() + 1}/${day.getUTCDate()}`,
      visibility: Math.round(visibility * 10) / 10,
      averageRank: Math.round(averageRank * 100) / 100,
    })
  }

  return points
}

export const visibilityHistory: VisibilityPoint[] = buildVisibilityHistory(30)

export type CompetitorRow = {
  id: string
  name: string
  cwsId: string
  /** Share of the tracked keywords where both listings rank. */
  keywordOverlap: number
  sharedKeywords: number
  averageRank: number
  visibility: number
}

const competitorsByExtension: Record<string, CompetitorRow[]> = {
  "edit-page": [
    {
      id: "page-tuner",
      name: "Page Tuner",
      cwsId: "bmnlcjabgnpnenekpadlanbbkooimhnj",
      keywordOverlap: 74,
      sharedKeywords: 16,
      averageRank: 12.1,
      visibility: 72,
    },
    {
      id: "quick-edit",
      name: "Quick Edit",
      cwsId: "nlkfokjhkgkbgpnbplnlkgjcbhcapnma",
      keywordOverlap: 61,
      sharedKeywords: 13,
      averageRank: 17.4,
      visibility: 55,
    },
    {
      id: "web-canvas",
      name: "Web Canvas",
      cwsId: "hhlbgnnlcibejkkmnhjlkmojgpjacheo",
      keywordOverlap: 48,
      sharedKeywords: 10,
      averageRank: 24.9,
      visibility: 43,
    },
  ],
  verbia: [
    {
      id: "lumen-write",
      name: "Lumen Write",
      cwsId: "ojnllfcmkkhbacbnhfmpkkdelkmjeaop",
      keywordOverlap: 69,
      sharedKeywords: 18,
      averageRank: 15.8,
      visibility: 64,
    },
    {
      id: "grammar-flow",
      name: "GrammarFlow",
      cwsId: "dbfapfnjbplpnljcikjbmdpahcegbodb",
      keywordOverlap: 57,
      sharedKeywords: 14,
      averageRank: 19.2,
      visibility: 51,
    },
    {
      id: "syntax-ai",
      name: "Syntax AI",
      cwsId: "pjeafmlfbdhlmjkhgbpepjjclmoinmnf",
      keywordOverlap: 44,
      sharedKeywords: 9,
      averageRank: 23.6,
      visibility: 39,
    },
  ],
  "stealth-browser-assistant": [
    {
      id: "ghost-spoofer",
      name: "Ghost Spoofer",
      cwsId: "keplndkfbanllgcpgdcmmljbnnbkkgpp",
      keywordOverlap: 66,
      sharedKeywords: 14,
      averageRank: 21.3,
      visibility: 48,
    },
    {
      id: "automate-now",
      name: "Automate Now",
      cwsId: "fnjjbmjegpjhdakkgldjllcmoaalfebn",
      keywordOverlap: 52,
      sharedKeywords: 9,
      averageRank: 26.7,
      visibility: 37,
    },
    {
      id: "scrape-kit",
      name: "Scrape Kit",
      cwsId: "gclbamhfhhdpmjjilbkclcfpplddkblk",
      keywordOverlap: 39,
      sharedKeywords: 6,
      averageRank: 31.4,
      visibility: 29,
    },
  ],
}

export function getCompetitors(extensionId: string): CompetitorRow[] {
  return competitorsByExtension[extensionId] ?? []
}

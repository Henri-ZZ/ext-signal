import { getDb, toIsoString, toNumber } from "@/lib/db"
import { sortLocales } from "@/lib/locales"
import {
  PENDING_CELL,
  visibilityPercent,
  type RankCell,
} from "@/lib/rankings"

/**
 * All reads against Neon.
 *
 * `extensions` and `tracking_targets` are owned by this app; `ranking_runs`,
 * `ranking_results` and `collection_batches` are written by ext-probe and read
 * only here. `target_latest` (see db/schema.sql) resolves the newest success /
 * failure per tracking target so every query shares one definition.
 */

export type ExtensionSummary = {
  id: string
  cwsId: string
  /** 商店标题优先，其次是添加扩展时填写的名称。 */
  name: string
  iconUrl: string | null
  rating: number | null
  ratingCount: number | null
  createdAt: string
  /** distinct keywords */
  keywordCount: number
  /** keyword x locale pairs */
  targetCount: number
  top10Count: number
  localeCount: number
  rankedCount: number
  visibility: number
  bestRank: number | null
  lastCollectedAt: string | null
}

export type MatrixCell = RankCell & {
  targetId: string
  enabled: boolean
}

export type MatrixRow = {
  keyword: string
  /** locale code -> cell */
  cells: Record<string, MatrixCell>
}

export type RankingsMatrix = {
  locales: string[]
  rows: MatrixRow[]
}

export type HistoryPoint = {
  day: string
  visibility: number
  averageRank: number | null
  rankedCount: number
  targetCount: number
}

export type Competitor = {
  cwsId: string
  /** 商店标题，未采集到元数据时为 null。 */
  title: string | null
  iconUrl: string | null
  sharedTargets: number
  averagePosition: number | null
  bestPosition: number | null
}

export type OverviewStats = {
  extensionCount: number
  targetCount: number
  top10Count: number
  localeCount: number
  rankedCount: number
  pendingCount: number
}

export type CollectionStatus = {
  scheduledAt: string | null
  completedAt: string | null
  status: string | null
  succeededCount: number
  failedCount: number
}

type ExtensionRow = {
  id: string
  cws_id: string
  name: string
  icon_url: string | null
  rating: unknown
  rating_count: unknown
  created_at: unknown
  keyword_count: unknown
  target_count: unknown
  top10_count: unknown
  locale_count: unknown
  ranked_count: unknown
  best_rank: unknown
  last_collected_at: unknown
}

function toSummary(row: ExtensionRow): ExtensionSummary {
  const targetCount = toNumber(row.target_count) ?? 0
  const rankedCount = toNumber(row.ranked_count) ?? 0

  return {
    id: row.id,
    cwsId: row.cws_id,
    name: row.name,
    iconUrl: row.icon_url,
    rating: toNumber(row.rating),
    ratingCount: toNumber(row.rating_count),
    createdAt: toIsoString(row.created_at) ?? "",
    keywordCount: toNumber(row.keyword_count) ?? 0,
    targetCount,
    top10Count: toNumber(row.top10_count) ?? 0,
    localeCount: toNumber(row.locale_count) ?? 0,
    rankedCount,
    visibility: visibilityPercent(rankedCount, targetCount),
    bestRank: toNumber(row.best_rank),
    lastCollectedAt: toIsoString(row.last_collected_at),
  }
}

/** extension_profiles 由 ext-probe 写入，这里只读取。 */
const SUMMARY_COLUMNS = `
  e.id,
  e.cws_id,
  COALESCE(p.title, e.name) AS name,
  p.icon_url,
  p.rating,
  p.rating_count,
  e.created_at,
  COUNT(DISTINCT tl.keyword)::int AS keyword_count,
  COUNT(tl.target_id)::int AS target_count,
  COUNT(*) FILTER (WHERE tl.target_rank <= 10)::int AS top10_count,
  COUNT(DISTINCT tl.locale)::int AS locale_count,
  COUNT(tl.target_rank)::int AS ranked_count,
  MIN(tl.target_rank)::int AS best_rank,
  MAX(tl.collected_at) AS last_collected_at
`

export async function listExtensions(
  ownerEmail: string,
): Promise<ExtensionSummary[]> {
  const sql = getDb()
  const rows = (await sql`
    SELECT ${sql.unsafe(SUMMARY_COLUMNS)}
    FROM extensions e
    LEFT JOIN extension_profiles p ON p.cws_id = e.cws_id
    LEFT JOIN target_latest tl
      ON tl.extension_id = e.id AND tl.enabled = true
    WHERE e.owner_email = ${ownerEmail}
    GROUP BY e.id, p.title, p.icon_url, p.rating, p.rating_count
    ORDER BY e.created_at DESC
  `) as ExtensionRow[]

  return rows.map(toSummary)
}

export async function getExtensionSummary(
  ownerEmail: string,
  extensionId: string,
): Promise<ExtensionSummary | null> {
  const sql = getDb()
  const rows = (await sql`
    SELECT ${sql.unsafe(SUMMARY_COLUMNS)}
    FROM extensions e
    LEFT JOIN extension_profiles p ON p.cws_id = e.cws_id
    LEFT JOIN target_latest tl
      ON tl.extension_id = e.id AND tl.enabled = true
    WHERE e.owner_email = ${ownerEmail} AND e.id = ${extensionId}::uuid
    GROUP BY e.id, p.title, p.icon_url, p.rating, p.rating_count
  `) as ExtensionRow[]

  const [row] = rows
  return row ? toSummary(row) : null
}

export async function getExtensionIdByCwsId(
  ownerEmail: string,
  cwsId: string,
): Promise<string | null> {
  const sql = getDb()
  const rows = (await sql`
    SELECT id FROM extensions
    WHERE owner_email = ${ownerEmail} AND cws_id = ${cwsId}
  `) as { id: string }[]

  return rows[0]?.id ?? null
}

type TargetRow = {
  target_id: string
  keyword: string
  locale: string
  enabled: boolean
  target_rank: unknown
  not_found_within: unknown
  collected_at: unknown
  failed_message: string | null
  failed_at: unknown
  consecutive_failures: unknown
  retry_after: unknown
}

function toCell(row: TargetRow): RankCell {
  const rank = toNumber(row.target_rank)
  const collectedAt = toIsoString(row.collected_at)
  const failures = toNumber(row.consecutive_failures) ?? 0
  const retryAfter = toIsoString(row.retry_after)

  if (rank != null) {
    return {
      state: "ranked",
      rank,
      checkedWithin: null,
      collectedAt,
      message: null,
      failures,
      retryAfter,
    }
  }

  if (collectedAt) {
    return {
      state: "not-found",
      rank: null,
      checkedWithin: toNumber(row.not_found_within),
      collectedAt,
      message: null,
      failures,
      retryAfter,
    }
  }

  const failedAt = toIsoString(row.failed_at)
  if (failedAt) {
    return {
      state: "failed",
      rank: null,
      checkedWithin: null,
      collectedAt: failedAt,
      message: row.failed_message,
      failures,
      retryAfter,
    }
  }

  return PENDING_CELL
}

export async function getRankingsMatrix(
  extensionId: string,
): Promise<RankingsMatrix> {
  const sql = getDb()
  const rows = (await sql`
    SELECT
      tl.target_id,
      tl.keyword,
      tl.locale,
      tl.enabled,
      tl.target_rank,
      tl.not_found_within,
      tl.collected_at,
      tl.failed_message,
      tl.failed_at,
      tl.consecutive_failures,
      tl.retry_after
    FROM target_latest tl
    WHERE tl.extension_id = ${extensionId}::uuid
    ORDER BY
      min(tl.target_created_at) OVER (PARTITION BY tl.keyword),
      tl.keyword,
      tl.locale
  `) as TargetRow[]

  const locales = new Set<string>()
  const rowsByKeyword = new Map<string, MatrixRow>()

  for (const row of rows) {
    locales.add(row.locale)

    let matrixRow = rowsByKeyword.get(row.keyword)
    if (!matrixRow) {
      matrixRow = { keyword: row.keyword, cells: {} }
      rowsByKeyword.set(row.keyword, matrixRow)
    }

    matrixRow.cells[row.locale] = {
      ...toCell(row),
      targetId: row.target_id,
      enabled: row.enabled,
    }
  }

  return {
    locales: sortLocales([...locales]),
    rows: [...rowsByKeyword.values()],
  }
}

type HistoryRow = {
  day: string
  total: unknown
  ranked: unknown
  average_rank: unknown
}

function toHistoryPoint(row: HistoryRow): HistoryPoint {
  const targetCount = toNumber(row.total) ?? 0
  const rankedCount = toNumber(row.ranked) ?? 0

  return {
    day: row.day,
    visibility: visibilityPercent(rankedCount, targetCount),
    averageRank: toNumber(row.average_rank),
    rankedCount,
    targetCount,
  }
}

const HISTORY_SELECT = `
  SELECT
    (rr.collected_at AT TIME ZONE 'UTC')::date::text AS day,
    COUNT(*)::int AS total,
    COUNT(rr.target_rank)::int AS ranked,
    AVG(rr.target_rank)::float8 AS average_rank
  FROM ranking_runs rr
`

export async function getWorkspaceHistory(
  ownerEmail: string,
  days = 30,
): Promise<HistoryPoint[]> {
  const sql = getDb()
  const rows = (await sql`
    ${sql.unsafe(HISTORY_SELECT)}
    WHERE rr.status = 'success'
      AND rr.collected_at >= now() - (${days}::int * interval '1 day')
      AND rr.target_extension_id IN (
        SELECT cws_id FROM extensions WHERE owner_email = ${ownerEmail}
      )
    GROUP BY 1
    ORDER BY 1
  `) as HistoryRow[]

  return rows.map(toHistoryPoint)
}

export async function getExtensionHistory(
  cwsId: string,
  days = 30,
): Promise<HistoryPoint[]> {
  const sql = getDb()
  const rows = (await sql`
    ${sql.unsafe(HISTORY_SELECT)}
    WHERE rr.status = 'success'
      AND rr.target_extension_id = ${cwsId}
      AND rr.collected_at >= now() - (${days}::int * interval '1 day')
    GROUP BY 1
    ORDER BY 1
  `) as HistoryRow[]

  return rows.map(toHistoryPoint)
}

type CompetitorRow = {
  cws_id: string
  title: string | null
  icon_url: string | null
  shared_targets: unknown
  average_position: unknown
  best_position: unknown
}

export async function getCompetitors(
  cwsId: string,
  limit = 10,
): Promise<Competitor[]> {
  const sql = getDb()
  const rows = (await sql`
    WITH targets AS (
      SELECT DISTINCT t.keyword, t.locale
      FROM tracking_targets t
      JOIN extensions e ON e.id = t.extension_id
      WHERE e.cws_id = ${cwsId} AND t.enabled = true
    ),
    latest_runs AS (
      SELECT DISTINCT ON (rr.keyword, rr.locale) rr.id, rr.keyword, rr.locale
      FROM ranking_runs rr
      JOIN targets tg ON tg.keyword = rr.keyword AND tg.locale = rr.locale
      WHERE rr.target_extension_id = ${cwsId} AND rr.status = 'success'
      ORDER BY rr.keyword, rr.locale, rr.collected_at DESC
    )
    SELECT
      res.extension_id AS cws_id,
      MAX(p.title) AS title,
      MAX(p.icon_url) AS icon_url,
      COUNT(DISTINCT (lr.keyword, lr.locale))::int AS shared_targets,
      AVG(res.position)::float8 AS average_position,
      MIN(res.position)::int AS best_position
    FROM latest_runs lr
    JOIN ranking_results res ON res.run_id = lr.id
    LEFT JOIN extension_profiles p ON p.cws_id = res.extension_id
    WHERE res.extension_id <> ${cwsId}
    GROUP BY res.extension_id
    ORDER BY shared_targets DESC, average_position ASC
    LIMIT ${limit}
  `) as CompetitorRow[]

  return rows.map((row) => ({
    cwsId: row.cws_id,
    title: row.title,
    iconUrl: row.icon_url,
    sharedTargets: toNumber(row.shared_targets) ?? 0,
    averagePosition: toNumber(row.average_position),
    bestPosition: toNumber(row.best_position),
  }))
}

type OverviewRow = {
  extension_count: unknown
  target_count: unknown
  locale_count: unknown
  top10_count: unknown
  ranked_count: unknown
  pending_count: unknown
}

export async function getOverviewStats(
  ownerEmail: string,
): Promise<OverviewStats> {
  const sql = getDb()
  const rows = (await sql`
    SELECT
      (SELECT COUNT(*)::int FROM extensions WHERE owner_email = ${ownerEmail})
        AS extension_count,
      COUNT(*)::int AS target_count,
      COUNT(DISTINCT tl.locale)::int AS locale_count,
      COUNT(*) FILTER (WHERE tl.target_rank <= 10)::int AS top10_count,
      COUNT(*) FILTER (WHERE tl.target_rank IS NOT NULL)::int AS ranked_count,
      COUNT(*) FILTER (WHERE tl.collected_at IS NULL)::int AS pending_count
    FROM target_latest tl
    WHERE tl.owner_email = ${ownerEmail} AND tl.enabled = true
  `) as OverviewRow[]

  const [row] = rows

  return {
    extensionCount: toNumber(row?.extension_count) ?? 0,
    targetCount: toNumber(row?.target_count) ?? 0,
    localeCount: toNumber(row?.locale_count) ?? 0,
    top10Count: toNumber(row?.top10_count) ?? 0,
    rankedCount: toNumber(row?.ranked_count) ?? 0,
    pendingCount: toNumber(row?.pending_count) ?? 0,
  }
}

type CollectionRow = {
  scheduled_at: unknown
  completed_at: unknown
  status: string
  succeeded_count: unknown
  failed_count: unknown
}

export async function getLatestCollection(): Promise<CollectionStatus | null> {
  const sql = getDb()
  const rows = (await sql`
    SELECT scheduled_at, completed_at, status, succeeded_count, failed_count
    FROM collection_batches
    ORDER BY scheduled_at DESC
    LIMIT 1
  `) as CollectionRow[]

  const [row] = rows
  if (!row) return null

  return {
    scheduledAt: toIsoString(row.scheduled_at),
    completedAt: toIsoString(row.completed_at),
    status: row.status,
    succeededCount: toNumber(row.succeeded_count) ?? 0,
    failedCount: toNumber(row.failed_count) ?? 0,
  }
}

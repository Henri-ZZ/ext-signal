-- ExtSignal 表结构。与 ext-probe 共用同一个 Neon 数据库，可重复执行。
--
-- 分工：
--   ext-signal  拥有 extensions / tracking_targets，负责写入「要跟踪什么」。
--   ext-probe   读取 tracking_targets 决定采集任务，写入 ranking_* 表。
--   ext-signal  只读 ranking_* 表，不写入。
--
-- 依赖 ext-probe/db/schema.sql 中的 collection_batches / ranking_runs /
-- ranking_results / extension_profiles 已经存在。请先执行 ext-probe 的 schema。
--
-- extension_profiles 由 ext-probe 写入（所有 Chrome Web Store 出网请求都留在
-- 探针里），本项目的查询只读取它来展示标题、图标与评分。

-- 被跟踪的 Chrome Web Store 扩展。cws_id 即 ranking_runs.target_extension_id。
CREATE TABLE IF NOT EXISTS extensions (
  id uuid PRIMARY KEY,
  cws_id text NOT NULL,
  name text NOT NULL,
  -- 预留多租户：接入 Neon Auth 后这里换成 user_id uuid。
  owner_email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT extensions_owner_cws_unique UNIQUE (owner_email, cws_id)
);

-- 一个 keyword x locale 组合即一个 tracking target，是产品的核心数据单元。
CREATE TABLE IF NOT EXISTS tracking_targets (
  id uuid PRIMARY KEY,
  extension_id uuid NOT NULL REFERENCES extensions(id) ON DELETE CASCADE,
  keyword text NOT NULL,
  locale text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tracking_targets_triple_unique UNIQUE (extension_id, keyword, locale),
  CONSTRAINT tracking_targets_keyword_not_blank CHECK (btrim(keyword) <> ''),
  CONSTRAINT tracking_targets_locale_not_blank CHECK (btrim(locale) <> '')
);

-- 用户级显示偏好。接入 Neon Auth 后 owner_email 换成 user_id。
CREATE TABLE IF NOT EXISTS user_preferences (
  owner_email text PRIMARY KEY,
  -- 是否在 locale 代码前显示国家，例如 China (zh-CN)。
  locale_show_region boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 探针按 (keyword, locale) 归并任务时使用。
CREATE INDEX IF NOT EXISTS tracking_targets_due_idx
  ON tracking_targets (enabled, keyword, locale);

CREATE INDEX IF NOT EXISTS tracking_targets_extension_idx
  ON tracking_targets (extension_id);

CREATE INDEX IF NOT EXISTS extensions_owner_created_idx
  ON extensions (owner_email, created_at DESC);

-- 「每个 target 的当前状态」只在这里定义一次。
-- ok   = 最近一次成功采集，target_rank 为数字即已排名，为 NULL 即 NR
--        （not_found_within 表示已可靠检查到的名次范围）。
-- fail = 最近一次失败采集。既没有 ok 也没有 fail 时前端显示「待采集」。
CREATE OR REPLACE VIEW target_latest AS
SELECT
  t.id AS target_id,
  t.extension_id,
  e.cws_id,
  e.owner_email,
  t.keyword,
  t.locale,
  t.enabled,
  t.created_at AS target_created_at,
  ok.target_rank,
  ok.not_found_within,
  ok.collected_at,
  fail.error_message AS failed_message,
  fail.collected_at AS failed_at
FROM tracking_targets t
JOIN extensions e ON e.id = t.extension_id
LEFT JOIN LATERAL (
  SELECT rr.target_rank, rr.not_found_within, rr.collected_at
  FROM ranking_runs rr
  WHERE rr.keyword = t.keyword
    AND rr.locale = t.locale
    AND rr.target_extension_id = e.cws_id
    AND rr.status = 'success'
  ORDER BY rr.collected_at DESC
  LIMIT 1
) ok ON true
LEFT JOIN LATERAL (
  SELECT rr.error_message, rr.collected_at
  FROM ranking_runs rr
  WHERE rr.keyword = t.keyword
    AND rr.locale = t.locale
    AND rr.target_extension_id = e.cws_id
    AND rr.status = 'failed'
  ORDER BY rr.collected_at DESC
  LIMIT 1
) fail ON true;

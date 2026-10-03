-- 归属键：owner_email → Neon Auth 的 user id。
--
-- 为什么换。email 是可变标识：Google 账号换邮箱、或者以后想让多个账号共用
-- 一个工作区，都得改数据才能保住归属。auth 的 user id 是 neon_auth."user" 的
-- 主键，永不变，所以它才是正确的归属键。
--
-- 幂等。可以重复执行：回填步骤会检查 owner_email 是否还在，列已被删除时自动跳过。
-- 全程在单个事务里，不会留下半迁移状态。
--
-- 执行顺序。本迁移必须先于代码部署：迁移提交后旧代码会因为找不到 owner_email
-- 而读不出数据，请紧接着部署。空窗期只影响 Web 端读取，ext-probe 完全不碰
-- 这两列（已确认零引用），采集不受影响，也不存在数据丢失风险。

BEGIN;

-- 视图要在改表之前删除：它引用了 e.owner_email，而且列名变了的情况下
-- CREATE OR REPLACE 不被允许（不能改已有列的名字）。
-- 事务内其他连接看不到中间态，要么看到旧视图要么看到新视图。
DROP VIEW IF EXISTS target_latest;

-- ---------------------------------------------------------------- extensions
ALTER TABLE extensions ADD COLUMN IF NOT EXISTS owner_user_id uuid;

DO $$
DECLARE
  orphan int;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'extensions'
       AND column_name = 'owner_email'
  ) THEN
    -- 按 email 匹配 auth 用户。用 lower() 比较，因为 email 大小写不敏感。
    UPDATE extensions e
       SET owner_user_id = u.id
      FROM neon_auth."user" u
     WHERE e.owner_user_id IS NULL
       AND lower(u.email) = lower(e.owner_email);

    -- 没有对应 auth 用户的残留行会让 SET NOT NULL 失败。这里先明确报错，
    -- 而不是等到后面抛一个难懂的约束错误。
    SELECT count(*) INTO orphan
      FROM extensions
     WHERE owner_user_id IS NULL AND owner_email IS NOT NULL;
    IF orphan > 0 THEN
      RAISE EXCEPTION 'extensions 有 % 行找不到对应的 auth 用户，先处理再迁移', orphan;
    END IF;
  END IF;
END $$;

ALTER TABLE extensions ALTER COLUMN owner_user_id SET NOT NULL;

ALTER TABLE extensions DROP CONSTRAINT IF EXISTS extensions_owner_cws_unique;
ALTER TABLE extensions ADD CONSTRAINT extensions_owner_user_id_cws_unique
  UNIQUE (owner_user_id, cws_id);

DROP INDEX IF EXISTS extensions_owner_created_idx;
CREATE INDEX IF NOT EXISTS extensions_owner_user_created_idx
  ON extensions (owner_user_id, created_at DESC);

ALTER TABLE extensions DROP COLUMN IF EXISTS owner_email;

-- ---------------------------------------------------------- user_preferences
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS owner_user_id uuid;

DO $$
DECLARE
  orphan int;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'user_preferences'
       AND column_name = 'owner_email'
  ) THEN
    UPDATE user_preferences p
       SET owner_user_id = u.id
      FROM neon_auth."user" u
     WHERE p.owner_user_id IS NULL
       AND lower(u.email) = lower(p.owner_email);

    SELECT count(*) INTO orphan
      FROM user_preferences
     WHERE owner_user_id IS NULL AND owner_email IS NOT NULL;
    IF orphan > 0 THEN
      RAISE EXCEPTION 'user_preferences 有 % 行找不到对应的 auth 用户', orphan;
    END IF;
  END IF;
END $$;

ALTER TABLE user_preferences ALTER COLUMN owner_user_id SET NOT NULL;

-- 主键原本在 owner_email 上，先摘掉才能删列。
ALTER TABLE user_preferences DROP CONSTRAINT IF EXISTS user_preferences_pkey;
ALTER TABLE user_preferences ADD CONSTRAINT user_preferences_pkey
  PRIMARY KEY (owner_user_id);

ALTER TABLE user_preferences DROP COLUMN IF EXISTS owner_email;

-- --------------------------------------------------------------- target_latest
-- 与 db/schema.sql 中的定义保持一致，仅把 owner_email 换成 owner_user_id。
CREATE VIEW target_latest AS
SELECT
  t.id AS target_id,
  t.extension_id,
  e.cws_id,
  e.owner_user_id,
  t.keyword,
  t.locale,
  t.enabled,
  t.created_at AS target_created_at,
  ok.target_rank,
  ok.not_found_within,
  ok.collected_at,
  fail.error_message AS failed_message,
  fail.collected_at AS failed_at,
  COALESCE(cs.consecutive_failures, 0) AS consecutive_failures,
  cs.next_attempt_at AS retry_after
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
) fail ON true
LEFT JOIN collection_state cs
  ON cs.keyword = t.keyword AND cs.locale = t.locale;

-- 迁移后的自检：归属唯一且完整。
DO $$
DECLARE
  ext_total int;
  ext_owned int;
  pref_total int;
BEGIN
  SELECT count(*), count(owner_user_id) INTO ext_total, ext_owned FROM extensions;
  SELECT count(*) INTO pref_total FROM user_preferences;

  RAISE NOTICE 'extensions: % 行，其中 % 行有归属；user_preferences: % 行',
    ext_total, ext_owned, pref_total;

  IF ext_total <> ext_owned THEN
    RAISE EXCEPTION '仍有 % 行 extensions 没有归属', ext_total - ext_owned;
  END IF;
END $$;

COMMIT;

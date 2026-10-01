#!/usr/bin/env node
/**
 * Applies db/schema.sql to the Neon database in DATABASE_URL.
 *
 * The Neon HTTP driver runs one statement per request, so the file is split on
 * `;` (safe here: the schema contains no functions, triggers or string
 * literals with embedded semicolons). Every statement is idempotent, so this
 * can be re-run at any time.
 *
 * Usage: pnpm db:apply
 */

import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { neon } from "@neondatabase/serverless"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

async function resolveDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL

  try {
    const content = await readFile(path.join(root, ".env.local"), "utf8")

    for (const line of content.split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
      if (!match) continue

      const [, key, rawValue] = match
      const value = rawValue.replace(/^["']|["']$/g, "")
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // .env.local is optional when DATABASE_URL comes from the environment.
  }

  return process.env.DATABASE_URL
}

function splitStatements(sqlText) {
  return sqlText
    .split("\n")
    .filter((line) => !/^\s*--/.test(line))
    .join("\n")
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean)
}

const databaseUrl = await resolveDatabaseUrl()
if (!databaseUrl) {
  console.error(
    "缺少 DATABASE_URL。请写入 ext-signal/.env.local，或在环境变量中提供。",
  )
  process.exit(1)
}

const sql = neon(databaseUrl)
const source = await readFile(path.join(root, "db", "schema.sql"), "utf8")
const statements = splitStatements(source)

console.log(`对 ${new URL(databaseUrl).host} 执行 ${statements.length} 条语句`)

for (const statement of statements) {
  const label = statement.replace(/\s+/g, " ").slice(0, 72)

  try {
    await sql.query(statement)
    console.log(`✓ ${label}`)
  } catch (error) {
    console.error(`✗ ${label}`)
    throw error
  }
}

const objects = await sql.query(`
  SELECT table_name, table_type
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'collection_batches', 'ranking_runs', 'ranking_results',
      'extensions', 'tracking_targets', 'target_latest'
    )
  ORDER BY table_type, table_name
`)

console.log("\n当前数据库中的相关对象：")
for (const row of objects) {
  console.log(`  ${row.table_type === "VIEW" ? "view " : "table"} ${row.table_name}`)
}

const missing = ["ranking_runs", "ranking_results"].filter(
  (name) => !objects.some((row) => row.table_name === name),
)

if (missing.length > 0) {
  console.error(
    `\n警告：缺少 ${missing.join("、")}。请先执行 ext-probe 的 db/schema.sql，再执行本脚本。`,
  )
  process.exit(1)
}

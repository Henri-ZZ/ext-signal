"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { getExtensionIdByCwsId } from "@/data/extensions"
import { normalizeKeyword, parseExtensionInput } from "@/lib/cws"
import { getDb } from "@/lib/db"
import type { FormState } from "@/lib/form-state"
import { isSupportedLocale } from "@/lib/locales"
import { requireCurrentUser } from "@/lib/session"

/** 矩阵相关页面全部挂在 /dashboard 下，一次刷新整棵子树。 */
function revalidateDashboard() {
  revalidatePath("/dashboard", "layout")
}

/**
 * 让探针同步抓一次商店元数据（标题、图标）。
 *
 * 抓取只发生在 ext-probe，这里只是请求它去做；探针不可达时直接放弃，
 * 扩展照常创建，元数据由下一次采集批次自愈。
 */
async function warmProfile(cwsId: string): Promise<void> {
  const baseUrl = process.env.EXT_PROBE_URL?.trim()
  const token = process.env.EXT_PROBE_TOKEN?.trim()
  if (!baseUrl || !token) return

  try {
    await fetch(`${baseUrl.replace(/\/$/, "")}/admin/resolve`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cwsIds: [cwsId] }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    })
  } catch {
    // 忽略：元数据不是创建扩展的必要条件。
  }
}

export async function addExtensionAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireCurrentUser()

  const parsed = parseExtensionInput(String(formData.get("extension") ?? ""))
  if (!parsed.ok) {
    return { status: "error", message: parsed.error }
  }

  const nameInput = String(formData.get("name") ?? "").trim()
  const name = nameInput || parsed.value.suggestedName || parsed.value.cwsId
  const sql = getDb()

  const inserted = (await sql`
    INSERT INTO extensions (id, cws_id, name, owner_user_id)
    VALUES (${crypto.randomUUID()}::uuid, ${parsed.value.cwsId}, ${name}, ${user.id}::uuid)
    ON CONFLICT (owner_user_id, cws_id) DO NOTHING
    RETURNING id
  `) as { id: string }[]

  const extensionId =
    inserted[0]?.id ?? (await getExtensionIdByCwsId(user.id, parsed.value.cwsId))

  if (!extensionId) {
    return { status: "error", message: "Could not add the extension. Try again." }
  }

  await warmProfile(parsed.value.cwsId)

  revalidateDashboard()
  redirect(`/dashboard/extensions/${extensionId}`)
}

export async function addTargetsAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireCurrentUser()

  const extensionId = String(formData.get("extensionId") ?? "").trim()
  if (!extensionId) {
    return { status: "error", message: "Missing extension id." }
  }

  const locales = [...new Set(formData.getAll("locales").map(String))]
  if (locales.length === 0) {
    return { status: "error", message: "Select at least one locale." }
  }

  const unsupported = locales.filter((locale) => !isSupportedLocale(locale))
  if (unsupported.length > 0) {
    return {
      status: "error",
      message: `Unsupported locale: ${unsupported.join(", ")}`,
    }
  }

  const keywords = [
    ...new Set(
      String(formData.get("keywords") ?? "")
        .split(/[\n,]/)
        .map(normalizeKeyword)
        .filter(Boolean),
    ),
  ]
  if (keywords.length === 0) {
    return { status: "error", message: "Enter at least one keyword." }
  }

  const sql = getDb()
  const owned = (await sql`
    SELECT 1 FROM extensions
    WHERE id = ${extensionId}::uuid AND owner_user_id = ${user.id}::uuid
  `) as unknown[]
  if (owned.length === 0) {
    return { status: "error", message: "Extension not found." }
  }

  const records = keywords.flatMap((keyword) =>
    locales.map((locale) => ({
      id: crypto.randomUUID(),
      keyword,
      locale,
    })),
  )

  const inserted = (await sql`
    INSERT INTO tracking_targets (id, extension_id, keyword, locale)
    SELECT item.id::uuid, ${extensionId}::uuid, item.keyword, item.locale
    FROM jsonb_to_recordset(${JSON.stringify(records)}::jsonb)
      AS item(id text, keyword text, locale text)
    ON CONFLICT (extension_id, keyword, locale) DO NOTHING
    RETURNING id
  `) as { id: string }[]

  revalidateDashboard()

  const skipped = records.length - inserted.length
  return {
    status: "success",
    message:
      skipped > 0
        ? `Added ${inserted.length} targets, skipped ${skipped} that already existed.`
        : `Added ${inserted.length} targets.`,
  }
}

/** 只影响显示：locale 代码是否带上国家前缀。 */
export async function setLocaleRegionAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireCurrentUser()
  const showRegion = String(formData.get("localeShowRegion") ?? "") === "true"
  const sql = getDb()

  await sql`
    INSERT INTO user_preferences (owner_user_id, locale_show_region)
    VALUES (${user.id}::uuid, ${showRegion})
    ON CONFLICT (owner_user_id) DO UPDATE SET
      locale_show_region = EXCLUDED.locale_show_region,
      updated_at = now()
  `

  revalidateDashboard()
  return { status: "success", message: "" }
}

export async function setTargetEnabledAction(formData: FormData): Promise<void> {
  const user = await requireCurrentUser()

  const targetId = String(formData.get("targetId") ?? "")
  const enabled = String(formData.get("enabled") ?? "") === "true"
  if (!targetId) return

  const sql = getDb()
  await sql`
    UPDATE tracking_targets t
    SET enabled = ${enabled}
    FROM extensions e
    WHERE t.id = ${targetId}::uuid
      AND t.extension_id = e.id
      AND e.owner_user_id = ${user.id}::uuid
  `

  revalidateDashboard()
}

export async function deleteTargetAction(formData: FormData): Promise<void> {
  const user = await requireCurrentUser()

  const targetId = String(formData.get("targetId") ?? "")
  if (!targetId) return

  const sql = getDb()
  await sql`
    DELETE FROM tracking_targets t
    USING extensions e
    WHERE t.id = ${targetId}::uuid
      AND t.extension_id = e.id
      AND e.owner_user_id = ${user.id}::uuid
  `

  revalidateDashboard()
}

export async function deleteExtensionAction(formData: FormData): Promise<void> {
  const user = await requireCurrentUser()

  const extensionId = String(formData.get("extensionId") ?? "")
  if (!extensionId) return

  const sql = getDb()
  await sql`
    DELETE FROM extensions
    WHERE id = ${extensionId}::uuid AND owner_user_id = ${user.id}::uuid
  `

  revalidateDashboard()
  redirect("/dashboard/extensions")
}

/**
 * 手动触发一次采集。ext-probe 会挑选最久未采集的目标，
 * 需要 EXT_PROBE_URL 与 EXT_PROBE_TOKEN 两个环境变量。
 */
export async function triggerCollectionAction(
  _previous: FormState,
  _formData: FormData,
): Promise<FormState> {
  await requireCurrentUser()

  const baseUrl = process.env.EXT_PROBE_URL?.trim()
  const token = process.env.EXT_PROBE_TOKEN?.trim()
  if (!baseUrl || !token) {
    return {
      status: "error",
      message:
        "EXT_PROBE_URL / EXT_PROBE_TOKEN are not configured, so collection cannot be triggered.",
    }
  }

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/admin/run`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })

    const payload = (await response.json().catch(() => null)) as {
      ok?: boolean
      collected?: number
      failed?: number
      error?: string
    } | null

    if (!response.ok) {
      return {
        status: "error",
        message: `Probe returned an error: ${payload?.error ?? response.status}`,
      }
    }

    revalidateDashboard()
    return {
      status: "success",
      message: `Collection finished: ${payload?.collected ?? 0} jobs succeeded, ${payload?.failed ?? 0} failed. Reload to see new rankings.`,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { status: "error", message: `Could not reach the probe: ${message}` }
  }
}

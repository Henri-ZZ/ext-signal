import { getDb } from "@/lib/db"

/**
 * 用户级显示偏好。没有记录时回退到默认值，所以新用户不需要预先建行。
 */
export type UserPreferences = {
  localeShowRegion: boolean
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  localeShowRegion: false,
}

type PreferenceRow = {
  locale_show_region: boolean
}

export async function getUserPreferences(
  ownerUserId: string,
): Promise<UserPreferences> {
  const sql = getDb()
  const rows = (await sql`
    SELECT locale_show_region
    FROM user_preferences
    WHERE owner_user_id = ${ownerUserId}::uuid
  `) as PreferenceRow[]

  const [row] = rows
  if (!row) return DEFAULT_PREFERENCES

  return { localeShowRegion: row.locale_show_region }
}

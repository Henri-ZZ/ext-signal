import { redirect } from "next/navigation"

import { getAuth } from "@/lib/auth/server"

export type SessionUser = {
  id: string
  email: string
  name: string
  image: string | null
  initials: string
}

/**
 * The signed-in user, or `null` when nobody is signed in.
 *
 * `src/proxy.ts` already turns anonymous dashboard requests away, so `null`
 * here means the session lapsed between the proxy and the render — a safety
 * net rather than the normal path.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const { data } = await getAuth().getSession()
  const user = data?.user
  if (!user?.email) return null

  return {
    id: user.id,
    email: user.email,
    name: user.name?.trim() || user.email,
    image: user.image ?? null,
    initials: initialsFrom(user.name, user.email),
  }
}

/** Same as {@link getCurrentUser}, but sends anonymous visitors to sign-in. */
export async function requireCurrentUser(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/sign-in")
  return user
}

function initialsFrom(name: string | null | undefined, email: string): string {
  const source = name?.trim() || email.split("@")[0] || email
  const parts = source.split(/[\s._-]+/).filter(Boolean)

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }

  return source.slice(0, 2).toUpperCase()
}

/**
 * Single seam for the current user.
 *
 * Authentication is not wired up yet, so every request resolves to the
 * hardcoded workspace owner. When Neon Auth lands, replace the body of
 * `getCurrentUser` with a real session read — nothing else in the app
 * knows where the identity comes from.
 */

export type SessionUser = {
  email: string
  name: string
  initials: string
}

const DEFAULT_USER: SessionUser = {
  email: "henri@henriz.dev",
  name: "Henri Z",
  initials: "HZ",
}

export async function getCurrentUser(): Promise<SessionUser> {
  return DEFAULT_USER
}

export async function requireCurrentUser(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Not signed in.")
  }
  return user
}

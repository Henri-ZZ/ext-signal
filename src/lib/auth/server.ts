import { createNeonAuth } from "@neondatabase/auth/next/server"

type Auth = ReturnType<typeof createNeonAuth>

let cached: Auth | null = null

/**
 * Server-side Neon Auth singleton, created on first use.
 *
 * Configuration is validated lazily on purpose: `next build` and Vercel
 * previews stay green without the secrets, and a deployment that is missing
 * them fails loudly on the first request that needs auth rather than quietly
 * treating every visitor as the same user.
 */
export function getAuth(): Auth {
  if (cached) return cached

  const baseUrl = process.env.NEON_AUTH_BASE_URL?.trim()
  const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET?.trim()

  if (!baseUrl || !cookieSecret) {
    throw new Error(
      "Neon Auth is not configured. Set NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET (see .env.example).",
    )
  }

  cached = createNeonAuth({
    baseUrl,
    cookies: {
      // Signs the encrypted session-data cookie that lets most requests skip
      // the upstream round trip. Neon Auth requires at least 32 characters.
      secret: cookieSecret,
    },
  })

  return cached
}

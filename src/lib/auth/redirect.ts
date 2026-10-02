export const DEFAULT_REDIRECT = "/dashboard"

const SIGN_IN_PATH = "/auth/sign-in"

/**
 * Where to send a user after signing in.
 *
 * Sign-in carries the intended destination as `next` so a deep link survives
 * the round trip through Google. Only same-origin relative paths are honored —
 * absolute URLs and protocol-relative `//host` values would turn the parameter
 * into an open redirect.
 */
export function safeNextPath(value: string | string[] | undefined): string {
  const candidate = Array.isArray(value) ? value[0] : value

  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return DEFAULT_REDIRECT
  }

  // Signing in must not bounce back to the sign-in screen.
  if (candidate === SIGN_IN_PATH || candidate.startsWith(`${SIGN_IN_PATH}?`)) {
    return DEFAULT_REDIRECT
  }

  return candidate
}

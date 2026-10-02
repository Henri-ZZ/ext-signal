import { NextResponse, type NextRequest } from "next/server"

import { getAuth } from "@/lib/auth/server"

const SIGN_IN_PATH = "/auth/sign-in"

/**
 * Pages that must keep rendering for signed-out visitors.
 *
 * `/` belongs here even though it reads the session: Neon Auth sends first-time
 * users there to finish the OAuth handshake (`newUserURL` defaults to the
 * origin), so the proxy has to run on it — but an anonymous visitor must still
 * see the landing page instead of being bounced to sign-in.
 */
const PUBLIC_PATHS = new Set(["/"])

type Protect = ReturnType<ReturnType<typeof getAuth>["middleware"]>

let protect: Protect | null = null

function getProtect(): Protect {
  protect ??= getAuth().middleware({ loginUrl: SIGN_IN_PATH })
  return protect
}

/**
 * Neon Auth decides who gets into `/dashboard` and finishes the OAuth handshake
 * by exchanging `neon_auth_session_verifier` for the session cookie. That
 * exchange only runs inside this proxy, so every path the handshake can land on
 * has to be in the matcher below.
 */
export default async function proxy(request: NextRequest) {
  const response = await getProtect()(request)

  const location = response.headers.get("location")
  if (!location) return response

  const target = new URL(location)
  if (target.pathname !== SIGN_IN_PATH) return response

  // A signed-out visitor on a public page is the normal state, so render it —
  // keeping any cookies the handshake set on the way through.
  if (PUBLIC_PATHS.has(request.nextUrl.pathname)) {
    return withCookies(response, NextResponse.next())
  }

  // The SDK redirects bare, so re-issue it with the intended destination
  // attached — otherwise a deep link is lost the moment the user signs in.
  const signIn = new URL(SIGN_IN_PATH, request.url)
  const from = `${request.nextUrl.pathname}${request.nextUrl.search}`
  if (from !== "/dashboard") {
    signIn.searchParams.set("next", from)
  }

  return withCookies(response, NextResponse.redirect(signIn))
}

function withCookies(from: Response, to: NextResponse) {
  for (const cookie of from.headers.getSetCookie()) {
    to.headers.append("set-cookie", cookie)
  }
  return to
}

export const config = {
  // `/` is listed explicitly: it is where first-time sign-ups land to finish the
  // handshake. Everything else stays opt-in, so static assets, `/privacy` and
  // `/terms` never touch auth — Google fetches the legal pages to validate the
  // consent screen, and they must work even if auth is misconfigured.
  matcher: ["/", "/dashboard/:path*"],
}

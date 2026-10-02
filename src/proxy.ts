import { NextResponse, type NextRequest } from "next/server"

import { getAuth } from "@/lib/auth/server"

const SIGN_IN_PATH = "/auth/sign-in"

type Protect = ReturnType<ReturnType<typeof getAuth>["middleware"]>

let protect: Protect | null = null

function getProtect(): Protect {
  protect ??= getAuth().middleware({ loginUrl: SIGN_IN_PATH })
  return protect
}

/**
 * Neon Auth decides who gets into `/dashboard` and refreshes the session cookie
 * on the way through. `/auth/*` and `/api/auth/*` are always public, so
 * sign-in itself is never blocked.
 */
export default async function proxy(request: NextRequest) {
  const response = await getProtect()(request)

  const location = response.headers.get("location")
  if (!location) return response

  const redirectTo = new URL(location)
  if (redirectTo.pathname !== SIGN_IN_PATH) return response

  // The SDK redirects bare, so re-issue it with the intended destination
  // attached — otherwise a deep link is lost the moment the user signs in.
  const signIn = new URL(SIGN_IN_PATH, request.url)
  const from = `${request.nextUrl.pathname}${request.nextUrl.search}`
  if (from !== "/dashboard") {
    signIn.searchParams.set("next", from)
  }

  const withNext = NextResponse.redirect(signIn)
  for (const cookie of response.headers.getSetCookie()) {
    withNext.headers.append("set-cookie", cookie)
  }

  return withNext
}

export const config = {
  matcher: ["/dashboard/:path*"],
}

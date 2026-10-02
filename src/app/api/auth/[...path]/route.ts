import { getAuth } from "@/lib/auth/server"

type AuthHandler = ReturnType<ReturnType<typeof getAuth>["handler"]>

let handler: AuthHandler | null = null

function getHandler(): AuthHandler {
  handler ??= getAuth().handler()
  return handler
}

type AuthRouteContext = RouteContext<"/api/auth/[...path]">

/** Proxies every Better Auth request (`get-session`, `sign-in/social`, ...) to Neon Auth. */
export async function GET(request: Request, context: AuthRouteContext) {
  return getHandler().GET(request, context)
}

export async function POST(request: Request, context: AuthRouteContext) {
  return getHandler().POST(request, context)
}

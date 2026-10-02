"use client"

import { createAuthClient } from "@neondatabase/auth/next"

/**
 * Browser-side auth client.
 *
 * It talks to our own `/api/auth/*` route (see `app/api/auth/[...path]`), which
 * proxies to Neon Auth, so no base URL is needed here.
 */
export const authClient = createAuthClient()

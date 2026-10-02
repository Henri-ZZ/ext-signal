import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button"
import { safeNextPath } from "@/lib/auth/redirect"
import { getCurrentUser } from "@/lib/session"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Sign in",
}

export default async function SignInPage({
  searchParams,
}: PageProps<"/auth/sign-in">) {
  const params = await searchParams
  const next = safeNextPath(params.next)

  // Already signed in: skip the form entirely.
  if (await getCurrentUser()) {
    redirect(next)
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-xs">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image
            src="/logo.png"
            alt=""
            width={48}
            height={48}
            priority
            className="size-12"
          />
          <div className="grid gap-1">
            <h1 className="font-heading text-lg font-semibold tracking-tight">
              Sign in to ExtSignal
            </h1>
            <p className="text-sm text-muted-foreground">
              Chrome Web Store search intelligence and rank tracking.
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-3">
          <GoogleSignInButton next={next} />
          <p className="text-center text-xs text-muted-foreground">
            Continue with your Google account — no password to remember.
          </p>
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          <Link
            href="/"
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            Back to home
          </Link>
        </p>
      </div>
    </main>
  )
}

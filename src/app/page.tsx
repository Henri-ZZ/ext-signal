import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/session"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const user = await getCurrentUser()

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <div className="grid justify-items-center gap-3">
        <Image
          src="/logo.png"
          alt=""
          width={72}
          height={72}
          priority
          className="mb-1 size-18"
        />
        <span className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
          Chrome Web Store search intelligence
        </span>
        <h1 className="font-heading text-4xl font-semibold tracking-tight">
          ExtSignal
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Track how extensions rank for keyword × locale combinations and see
          how search visibility changes over time.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Button asChild size="lg">
          <Link href={user ? "/dashboard" : "/auth/sign-in"}>
            {user ? "Open Dashboard" : "Sign in"}
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>

        {user ? (
          <p className="text-xs text-muted-foreground">
            Signed in as {user.email}
          </p>
        ) : null}
      </div>

      <footer className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <Link href="/privacy" className="underline-offset-4 hover:text-foreground hover:underline">
          Privacy
        </Link>
        <Link href="/terms" className="underline-offset-4 hover:text-foreground hover:underline">
          Terms
        </Link>
      </footer>
    </main>
  )
}

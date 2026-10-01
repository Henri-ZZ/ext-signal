import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <div className="grid justify-items-center gap-3">
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

      <Button asChild size="lg">
        <Link href="/dashboard">
          Open Dashboard
          <ArrowRight data-icon="inline-end" />
        </Link>
      </Button>
    </main>
  )
}

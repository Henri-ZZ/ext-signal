import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"

const prose =
  "flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground " +
  "[&_a]:font-medium [&_a]:text-foreground [&_a]:underline-offset-4 [&_a]:hover:underline " +
  "[&_strong]:font-medium [&_strong]:text-foreground " +
  "[&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-1 [&_ul]:pl-5"

/**
 * Shared shell for the public legal pages.
 *
 * These routes must stay reachable without signing in — Google fetches them to
 * validate the OAuth consent screen, so nothing here may touch the session.
 */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: ReactNode
}) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-4">
        <Link href="/" className="flex items-center gap-2 self-start">
          <Image src="/logo.png" alt="" width={24} height={24} className="size-6" />
          <span className="font-heading text-sm font-semibold tracking-tight">
            ExtSignal
          </span>
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          <p className="text-xs text-muted-foreground">Last updated {updated}</p>
        </div>
      </header>

      <div className="flex flex-col gap-7">{children}</div>

      <footer className="flex flex-col gap-2 border-t pt-6 text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/privacy" className="underline-offset-4 hover:text-foreground hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms" className="underline-offset-4 hover:text-foreground hover:underline">
            Terms of Service
          </Link>
          <Link href="/" className="underline-offset-4 hover:text-foreground hover:underline">
            Home
          </Link>
        </div>
        <p>
          Questions? Email{" "}
          <a
            href="mailto:henri@henriz.dev"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            henri@henriz.dev
          </a>
          .
        </p>
      </footer>
    </main>
  )
}

export function LegalSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-heading text-sm font-semibold text-foreground">{title}</h2>
      <div className={prose}>{children}</div>
    </section>
  )
}

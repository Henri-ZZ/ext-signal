"use client"

import type { ComponentProps } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

/**
 * Light / Dark / System, persisted by next-themes.
 *
 * `attribute="class"` toggles `.dark` on `<html>`, which is what the
 * `@custom-variant dark` in globals.css keys off. The inline script next-themes
 * injects runs before paint, so there is no flash of the wrong theme; the cost
 * is that `<html>` needs `suppressHydrationWarning`.
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="extsignal-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

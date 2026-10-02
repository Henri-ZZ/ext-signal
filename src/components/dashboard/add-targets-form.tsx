"use client"

import { useActionState, useEffect, useRef } from "react"

import { addTargetsAction } from "@/app/dashboard/actions"
import { FormMessage } from "@/components/dashboard/form-message"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { INITIAL_FORM_STATE } from "@/lib/form-state"
import {
  formatLocaleLabel,
  localeDescription,
  SUPPORTED_LOCALES,
} from "@/lib/locales"
import { cn } from "@/lib/utils"

/**
 * Adds a keyword x locale matrix in one step: every keyword is tracked in
 * every selected locale. Locale chips are plain checkboxes so the whole form
 * works without any client-side state.
 */
export function AddTargetsForm({
  extensionId,
  showRegion,
}: {
  extensionId: string
  showRegion: boolean
}) {
  const [state, formAction, isPending] = useActionState(
    addTargetsAction,
    INITIAL_FORM_STATE,
  )
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset()
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="grid gap-4">
      <input type="hidden" name="extensionId" value={extensionId} />

      <div className="grid gap-1.5">
        <label htmlFor="keywords" className="text-xs font-medium">
          Keywords
        </label>
        <Textarea
          id="keywords"
          name="keywords"
          rows={3}
          required
          placeholder={"edit page\npage editor\nweb page editor"}
          className="font-mono text-xs md:text-xs"
        />
        <p className="text-xs text-muted-foreground">
          One keyword per line. Each keyword is tracked in every locale you
          select below.
        </p>
      </div>

      <fieldset className="grid gap-1.5">
        <legend className="mb-1.5 text-xs font-medium">Locales</legend>
        <div className="flex flex-wrap gap-1.5">
          {SUPPORTED_LOCALES.map((locale) => (
            <label
              key={locale.code}
              className="cursor-pointer"
              title={localeDescription(locale.code)}
            >
              <input
                type="checkbox"
                name="locales"
                value={locale.code}
                defaultChecked={locale.code === "en"}
                className="peer sr-only"
              />
              <span
                className={cn(
                  "inline-flex h-6 items-center rounded-md border px-2 font-mono text-xs text-muted-foreground transition-colors select-none",
                  // Selected state is brand green, not neutral: selection is one
                  // of the few places the design system spends colour.
                  "peer-checked:border-primary/45 peer-checked:bg-primary-soft peer-checked:text-primary-active",
                  "peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50",
                )}
              >
                {formatLocaleLabel(locale.code, showRegion)}
              </span>
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Locale codes follow the Chrome Web Store URL parameter (
          <span className="font-mono">en</span>,{" "}
          <span className="font-mono">zh_CN</span>). These two are validated
          against browser ground truth; the rest use the same collector but have
          not been hand-checked yet.
        </p>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Adding…" : "Add targets"}
        </Button>
        <FormMessage state={state} />
      </div>
    </form>
  )
}

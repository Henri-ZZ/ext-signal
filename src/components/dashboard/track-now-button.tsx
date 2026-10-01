"use client"

import { useActionState } from "react"
import { RefreshCw } from "lucide-react"

import { triggerCollectionAction } from "@/app/dashboard/actions"
import { FormMessage } from "@/components/dashboard/form-message"
import { Button } from "@/components/ui/button"
import { INITIAL_FORM_STATE } from "@/lib/form-state"

/**
 * Asks ext-probe to run a collection batch right away. The probe picks the
 * least recently collected targets first, so repeated clicks make progress.
 */
export function TrackNowButton() {
  const [state, formAction, isPending] = useActionState(
    triggerCollectionAction,
    INITIAL_FORM_STATE,
  )

  return (
    <form action={formAction} className="flex items-center gap-2">
      <Button type="submit" size="sm" variant="outline" disabled={isPending}>
        <RefreshCw
          data-icon="inline-start"
          className={isPending ? "animate-spin" : undefined}
        />
        {isPending ? "Collecting…" : "Track now"}
      </Button>
      {state.status === "error" ? <FormMessage state={state} /> : null}
    </form>
  )
}

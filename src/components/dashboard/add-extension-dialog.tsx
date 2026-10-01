"use client"

import { useActionState } from "react"
import { Plus } from "lucide-react"

import { addExtensionAction } from "@/app/dashboard/actions"
import { FormMessage } from "@/components/dashboard/form-message"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { INITIAL_FORM_STATE } from "@/lib/form-state"

export function AddExtensionDialog() {
  const [state, formAction, isPending] = useActionState(
    addExtensionAction,
    INITIAL_FORM_STATE,
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus data-icon="inline-start" />
          Add Extension
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add extension</DialogTitle>
          <DialogDescription>
            Track any public extension from the Chrome Web Store.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="grid gap-4">
          <div className="grid gap-3">
            <Input
              name="extension"
              required
              autoComplete="off"
              placeholder="Paste a Chrome Web Store URL or extension ID"
              aria-label="Chrome Web Store URL or extension ID"
            />
            <Input
              name="name"
              autoComplete="off"
              placeholder="Display name (optional)"
              aria-label="Display name"
            />
            <FormMessage state={state} />
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
              {isPending ? "Adding…" : "Add Extension"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

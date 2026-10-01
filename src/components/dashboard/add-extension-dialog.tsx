"use client"

import { Plus } from "lucide-react"

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

export function AddExtensionDialog() {
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

        {/* TODO: wire to a Server Action once Neon is connected. */}
        <form
          className="grid gap-4"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="grid gap-2">
            <Input
              name="extension"
              autoComplete="off"
              placeholder="Paste a Chrome Web Store URL or extension ID"
              aria-label="Chrome Web Store URL or extension ID"
            />
            <p className="text-xs text-muted-foreground">
              ExtSignal reads the public listing only. No publisher access is
              required.
            </p>
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full sm:w-auto">
              Add Extension
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

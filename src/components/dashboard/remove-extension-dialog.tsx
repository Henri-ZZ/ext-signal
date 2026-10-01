"use client"

import { deleteExtensionAction } from "@/app/dashboard/actions"
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

export function RemoveExtensionDialog({
  extensionId,
  name,
}: {
  extensionId: string
  name: string
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Remove
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Remove extension</DialogTitle>
          <DialogDescription>
            Stop tracking “{name}”. Every keyword × locale target for it is
            deleted. Rankings already collected stay in the database.
          </DialogDescription>
        </DialogHeader>

        <form action={deleteExtensionAction}>
          <input type="hidden" name="extensionId" value={extensionId} />
          <DialogFooter>
            <Button type="submit" variant="destructive" className="w-full sm:w-auto">
              Remove extension
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

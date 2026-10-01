import type { FormState } from "@/lib/form-state"
import { cn } from "@/lib/utils"

export function FormMessage({ state }: { state: FormState }) {
  if (state.status === "idle" || !state.message) return null

  return (
    <p
      role="status"
      className={cn(
        "text-xs",
        state.status === "error"
          ? "text-destructive"
          : "text-emerald-600 dark:text-emerald-400",
      )}
    >
      {state.message}
    </p>
  )
}

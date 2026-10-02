"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

import { GoogleIcon } from "@/components/auth/google-icon"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth/client"

export function GoogleSignInButton({ next }: { next: string }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function signIn() {
    setPending(true)
    setError(null)

    try {
      const { error: authError } = await authClient.signIn.social({
        provider: "google",
        callbackURL: next,
        // Without this, Neon Auth sends accounts created by this very sign-in to
        // the bare origin instead of `next`, which lands the user on the
        // marketing page while the session handshake finishes elsewhere.
        newUserCallbackURL: next,
      })

      if (authError) {
        setError(authError.message ?? "Google sign-in failed. Try again.")
        setPending(false)
      }
      // On success the browser is already on its way to Google, so the button
      // deliberately stays in its pending state.
    } catch {
      setError("Could not reach the sign-in service.")
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={pending}
        onClick={() => void signIn()}
      >
        {pending ? (
          <Loader2 data-icon="inline-start" className="animate-spin" />
        ) : (
          <GoogleIcon data-icon="inline-start" />
        )}
        Continue with Google
      </Button>

      {error ? (
        <p role="alert" className="text-center text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

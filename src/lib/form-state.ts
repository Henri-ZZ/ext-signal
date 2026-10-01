/**
 * Shared state shape for forms driven by `useActionState`.
 * Kept out of the `"use server"` module, which may only export async functions.
 */

export type FormState = {
  status: "idle" | "success" | "error"
  message: string
}

export const INITIAL_FORM_STATE: FormState = {
  status: "idle",
  message: "",
}

"use client"

import { useActionState, useRef } from "react"

import { setLocaleRegionAction } from "@/app/dashboard/actions"
import { FormMessage } from "@/components/dashboard/form-message"
import { INITIAL_FORM_STATE } from "@/lib/form-state"

/**
 * 原生 checkbox + peer 样式做成开关，切换后自动提交表单，
 * 因此不需要额外的组件库开关，没有 JS 时也能用提交按钮保存。
 */
export function LocaleDisplayToggle({ showRegion }: { showRegion: boolean }) {
  const [state, formAction, isPending] = useActionState(
    setLocaleRegionAction,
    INITIAL_FORM_STATE,
  )
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form ref={formRef} action={formAction} className="grid gap-2">
      <label className="flex cursor-pointer items-start justify-between gap-6">
        <span className="grid gap-0.5">
          <span className="text-sm font-medium">
            Show country before locale codes
          </span>
          <span className="text-xs text-muted-foreground">
            Displays locales as{" "}
            <span className="font-mono text-foreground">China (zh-CN)</span>{" "}
            instead of <span className="font-mono text-foreground">zh-CN</span>.
          </span>
        </span>

        <span className="flex items-center gap-3 pt-0.5">
          <input
            type="checkbox"
            name="localeShowRegion"
            value="true"
            defaultChecked={showRegion}
            disabled={isPending}
            onChange={() => formRef.current?.requestSubmit()}
            className="peer sr-only"
          />
          <span
            // `bg-input` instead of `bg-muted`: the off track has to stay
            // visible against the card, especially in dark mode.
            className="relative h-5 w-9 shrink-0 rounded-full bg-input transition-colors after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-card after:transition-transform after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-4 peer-checked:after:bg-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50 peer-disabled:opacity-50"
            aria-hidden
          />
        </span>
      </label>
      <FormMessage state={state} />
    </form>
  )
}

import Image from "next/image"

import { cn } from "@/lib/utils"

/**
 * Store icon with a deterministic monogram fallback.
 * Metadata comes from ext-probe's `extension_profiles`; until the probe has
 * resolved it, the first letter of the name is shown instead.
 */
export function ExtensionIcon({
  iconUrl,
  name,
  size = 20,
  className,
}: {
  iconUrl: string | null
  name: string
  size?: number
  className?: string
}) {
  if (!iconUrl) {
    return (
      <span
        aria-hidden
        className={cn(
          "flex shrink-0 items-center justify-center rounded-md bg-muted font-medium text-muted-foreground",
          className,
        )}
        style={{ width: size, height: size, fontSize: Math.round(size * 0.44) }}
      >
        {(name.trim().charAt(0) || "?").toUpperCase()}
      </span>
    )
  }

  return (
    <Image
      src={iconUrl}
      alt=""
      width={size}
      height={size}
      // Small store icons: skip the optimizer, the source is already sized.
      unoptimized
      className={cn("shrink-0 rounded-md", className)}
    />
  )
}

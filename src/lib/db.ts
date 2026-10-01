import { neon, type NeonQueryFunction } from "@neondatabase/serverless"

export type Sql = NeonQueryFunction<false, false>

let cached: Sql | null = null

/**
 * Neon HTTP driver. Stateless, so a module-level singleton is safe on
 * serverless runtimes (local dev, Vercel, and during `next build`).
 */
export function getDb(): Sql {
  if (cached) return cached

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add your Neon connection string to ext-signal/.env.local.",
    )
  }

  cached = neon(connectionString)
  return cached
}

/** timestamptz columns may arrive as Date or string depending on the driver. */
export function toIsoString(value: unknown): string | null {
  if (value == null) return null
  if (value instanceof Date) return value.toISOString()

  const parsed = new Date(String(value))
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

export function toNumber(value: unknown): number | null {
  if (value == null) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

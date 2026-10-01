/**
 * Chrome Web Store extension ID parsing.
 *
 * CWS extension IDs are 32 characters from `a` to `p`. Users paste either a
 * bare ID or a store URL, so both forms are accepted.
 */

const CWS_ID_PATTERN = /^[a-p]{32}$/i
const CWS_ID_IN_TEXT = /[a-p]{32}/gi

export type ParsedExtension = {
  cwsId: string
  /** Best-effort display name derived from the URL slug. */
  suggestedName: string | null
}

export type ParseResult =
  | { ok: true; value: ParsedExtension }
  | { ok: false; error: string }

function titleCaseSlug(slug: string): string {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function parseExtensionInput(raw: string): ParseResult {
  const input = raw.trim()
  if (!input) {
    return { ok: false, error: "Enter a Chrome Web Store URL or extension ID." }
  }

  if (CWS_ID_PATTERN.test(input)) {
    return {
      ok: true,
      value: { cwsId: input.toLowerCase(), suggestedName: null },
    }
  }

  let url: URL | null = null
  try {
    url = new URL(input.startsWith("http") ? input : `https://${input}`)
  } catch {
    url = null
  }

  if (url) {
    const segments = url.pathname.split("/").filter(Boolean)
    const match = segments.find((segment) => CWS_ID_PATTERN.test(segment))

    if (match) {
      // .../detail/<slug>/<id> → slug 是 ID 的前一段。
      const index = segments.indexOf(match)
      const slug = index > 0 ? segments[index - 1] : undefined
      const isSlug = slug && slug !== "detail" && !CWS_ID_PATTERN.test(slug)

      return {
        ok: true,
        value: {
          cwsId: match.toLowerCase(),
          suggestedName: isSlug ? titleCaseSlug(slug) : null,
        },
      }
    }
  }

  const found = input.match(CWS_ID_IN_TEXT)
  if (found?.length === 1) {
    return {
      ok: true,
      value: { cwsId: found[0].toLowerCase(), suggestedName: null },
    }
  }

  return {
    ok: false,
    error:
      "Could not find an extension ID. Paste a chromewebstore.google.com link or the 32 character extension ID.",
  }
}

export function normalizeKeyword(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").toLowerCase()
}

/**
 * Locale codes follow the Chrome Web Store URL parameter, which is the same
 * string ext-probe stores in `ranking_runs.locale` (underscore form:
 * `zh_CN`, `pt_BR`). That value is part of the join key against probe data,
 * so it is never rewritten — only the display format changes.
 *
 * Display format: language lowercase, region uppercase (`zh-CN`, `pt-BR`).
 */

export type LocaleOption = {
  /** 存储键：Chrome Web Store 的 hl 参数，不随显示格式变化。 */
  code: string
  /** 语言名，例如 "Chinese (Simplified)"。 */
  language: string
  /** 国家 / 地区名。纯语言 locale（如 en）没有对应的国家。 */
  region: string | null
  /** 是否已通过 ext-probe 的 browser ground truth 人工校验。 */
  verified: boolean
}

export const SUPPORTED_LOCALES: LocaleOption[] = [
  { code: "en", language: "English", region: null, verified: true },
  { code: "zh_CN", language: "Chinese (Simplified)", region: "China", verified: true },
  { code: "zh_TW", language: "Chinese (Traditional)", region: "Taiwan", verified: false },
  { code: "ja", language: "Japanese", region: "Japan", verified: false },
  { code: "ko", language: "Korean", region: "South Korea", verified: false },
  { code: "de", language: "German", region: "Germany", verified: false },
  { code: "fr", language: "French", region: "France", verified: false },
  { code: "es", language: "Spanish", region: "Spain", verified: false },
  { code: "pt_BR", language: "Portuguese", region: "Brazil", verified: false },
  { code: "it", language: "Italian", region: "Italy", verified: false },
  { code: "ru", language: "Russian", region: "Russia", verified: false },
  { code: "tr", language: "Turkish", region: "Türkiye", verified: false },
]

/** 矩阵列顺序：按上面声明的顺序排，未知 locale 排在最后。 */
const LOCALE_ORDER = new Map(
  SUPPORTED_LOCALES.map((locale, index) => [locale.code, index]),
)

function findLocale(code: string): LocaleOption | undefined {
  return SUPPORTED_LOCALES.find(
    (locale) => locale.code.toLowerCase() === code.toLowerCase(),
  )
}

export function sortLocales(codes: string[]): string[] {
  return [...codes].sort((a, b) => {
    const orderA = LOCALE_ORDER.get(a) ?? Number.MAX_SAFE_INTEGER
    const orderB = LOCALE_ORDER.get(b) ?? Number.MAX_SAFE_INTEGER
    return orderA === orderB ? a.localeCompare(b) : orderA - orderB
  })
}

/**
 * `zh_CN` -> `zh-CN`，`en` -> `en`。
 * 未知 locale 也按同样规则格式化，保证不会出现全大写。
 */
export function formatLocaleCode(code: string): string {
  const [language, region] = code.split(/[-_]/)
  const normalizedLanguage = language.toLowerCase()

  return region
    ? `${normalizedLanguage}-${region.toUpperCase()}`
    : normalizedLanguage
}

export function localeLanguage(code: string): string {
  return findLocale(code)?.language ?? code
}

export function localeRegion(code: string): string | null {
  return findLocale(code)?.region ?? null
}

/**
 * 界面统一入口。
 * `withRegion` 打开时显示成 `China (zh-CN)`，纯语言 locale 回退到语言名
 * （`en` -> `English (en)`），因为英文并没有对应的国家。
 */
export function formatLocaleLabel(code: string, withRegion = false): string {
  const formatted = formatLocaleCode(code)
  if (!withRegion) return formatted

  const name = localeRegion(code) ?? localeLanguage(code)
  return name === code ? formatted : `${name} (${formatted})`
}

/** tooltip 用的完整描述。 */
export function localeDescription(code: string): string {
  const language = localeLanguage(code)
  const region = localeRegion(code)
  return region ? `${language} · ${region}` : language
}

export function isSupportedLocale(code: string): boolean {
  return findLocale(code) !== undefined
}

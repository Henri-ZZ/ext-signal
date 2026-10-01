/**
 * Locale codes follow the Chrome Web Store URL parameter, which is the same
 * string ext-probe stores in `ranking_runs.locale` (underscore form:
 * `zh_CN`, `pt_BR`). Never normalise these to BCP 47 dashes — the value is
 * part of the join key against probe data.
 */

export type LocaleOption = {
  code: string
  label: string
  name: string
  /** 是否已通过 ext-probe 的 browser ground truth 人工校验。 */
  verified: boolean
}

export const SUPPORTED_LOCALES: LocaleOption[] = [
  { code: "en", label: "EN", name: "English (United States)", verified: true },
  { code: "zh_CN", label: "ZH-CN", name: "Chinese (Simplified)", verified: true },
  { code: "zh_TW", label: "ZH-TW", name: "Chinese (Traditional)", verified: false },
  { code: "ja", label: "JA", name: "Japanese", verified: false },
  { code: "ko", label: "KO", name: "Korean", verified: false },
  { code: "de", label: "DE", name: "German", verified: false },
  { code: "fr", label: "FR", name: "French", verified: false },
  { code: "es", label: "ES", name: "Spanish", verified: false },
  { code: "pt_BR", label: "PT-BR", name: "Portuguese (Brazil)", verified: false },
  { code: "it", label: "IT", name: "Italian", verified: false },
  { code: "ru", label: "RU", name: "Russian", verified: false },
  { code: "tr", label: "TR", name: "Turkish", verified: false },
]

/** 矩阵列顺序：按上面声明的顺序排，未知 locale 排在最后。 */
const LOCALE_ORDER = new Map(
  SUPPORTED_LOCALES.map((locale, index) => [locale.code, index]),
)

export function sortLocales(codes: string[]): string[] {
  return [...codes].sort((a, b) => {
    const orderA = LOCALE_ORDER.get(a) ?? Number.MAX_SAFE_INTEGER
    const orderB = LOCALE_ORDER.get(b) ?? Number.MAX_SAFE_INTEGER
    return orderA === orderB ? a.localeCompare(b) : orderA - orderB
  })
}

export function localeLabel(code: string): string {
  return SUPPORTED_LOCALES.find((locale) => locale.code === code)?.label ?? code
}

export function localeName(code: string): string {
  return SUPPORTED_LOCALES.find((locale) => locale.code === code)?.name ?? code
}

export function isSupportedLocale(code: string): boolean {
  return SUPPORTED_LOCALES.some((locale) => locale.code === code)
}

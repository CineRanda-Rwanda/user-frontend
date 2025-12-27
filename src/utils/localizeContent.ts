import type { SupportedLanguage } from '@/i18n'

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object') return null
  return value as Record<string, unknown>
}

const getNested = (obj: Record<string, unknown>, path: string[]): unknown => {
  let cur: unknown = obj
  for (const key of path) {
    const rec = asRecord(cur)
    if (!rec) return undefined
    cur = rec[key]
  }
  return cur
}

const tryString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

const suffixFromLanguageCode = (code: string): string | null => {
  const normalized = String(code || '').toLowerCase()
  if (normalized.startsWith('en')) return 'En'
  if (normalized.startsWith('fr')) return 'Fr'
  if (normalized.startsWith('rw')) return 'Rw'
  if (normalized.startsWith('kin') || normalized.includes('kinyarwanda')) return 'Kin'
  return null
}

const languageAliases = (lng: SupportedLanguage | string): string[] => {
  const normalized = String(lng || '').toLowerCase()
  if (normalized.startsWith('rw')) return ['rw', 'kin', 'kinyarwanda', 'rw-rw']
  if (normalized.startsWith('fr')) return ['fr', 'fr-fr']
  if (normalized.startsWith('en')) return ['en', 'en-us', 'en-gb']
  return [normalized]
}

/**
 * Picks a localized text field from a backend object.
 *
 * Supports common backend shapes:
 * - obj.translations[lng][field]
 * - obj.i18n[lng][field]
 * - obj[field + '_' + lng] (e.g. title_fr)
 * - obj[field] (fallback)
 */
export const getLocalizedText = (
  obj: unknown,
  field: string,
  lng: SupportedLanguage | string,
  fallbackLng: SupportedLanguage | string = 'en'
): string => {
  const record = asRecord(obj)
  if (!record) return ''

  const preferred = [...languageAliases(lng), ...languageAliases(fallbackLng)]

  for (const code of preferred) {
    const fromTranslations = tryString(getNested(record, ['translations', code, field]))
    if (fromTranslations) return fromTranslations

    const fromI18n = tryString(getNested(record, ['i18n', code, field]))
    if (fromI18n) return fromI18n

    const fromFlat = tryString(record[`${field}_${code}`])
    if (fromFlat) return fromFlat

    const suffix = suffixFromLanguageCode(code)
    if (suffix) {
      const fromCamel = tryString(record[`${field}${suffix}`])
      if (fromCamel) return fromCamel
      const fromUpper = tryString(record[`${field}${suffix.toUpperCase()}`])
      if (fromUpper) return fromUpper
    }
  }

  return tryString(record[field]) || ''
}

/**
 * True when the backend object contains an explicit localized value for the requested language.
 * This is useful to decide whether to invoke machine-translation as a fallback.
 */
export const hasLocalizedText = (
  obj: unknown,
  field: string,
  lng: SupportedLanguage | string
): boolean => {
  const record = asRecord(obj)
  if (!record) return false

  const preferred = languageAliases(lng)

  for (const code of preferred) {
    const fromTranslations = tryString(getNested(record, ['translations', code, field]))
    if (fromTranslations) return true

    const fromI18n = tryString(getNested(record, ['i18n', code, field]))
    if (fromI18n) return true

    const fromFlat = tryString(record[`${field}_${code}`])
    if (fromFlat) return true
  }

  return false
}

export const getLocalizedContentTitle = (content: unknown, lng: SupportedLanguage | string) =>
  getLocalizedText(content, 'title', lng)

export const getLocalizedContentDescription = (content: unknown, lng: SupportedLanguage | string) =>
  getLocalizedText(content, 'description', lng)

export const getLocalizedSeasonTitle = (season: unknown, lng: SupportedLanguage | string) =>
  getLocalizedText(season, 'seasonTitle', lng)

export const getLocalizedEpisodeTitle = (episode: unknown, lng: SupportedLanguage | string) =>
  getLocalizedText(episode, 'title', lng)

export const getLocalizedEpisodeDescription = (episode: unknown, lng: SupportedLanguage | string) =>
  getLocalizedText(episode, 'description', lng)

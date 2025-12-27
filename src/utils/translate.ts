import type { SupportedLanguage } from '@/i18n'

type TranslationProvider = 'libretranslate'
type TranslationSourceLanguage = SupportedLanguage | 'auto'

const isTranslationEnabled = () => {
  // Vite exposes env vars as strings.
  return String(import.meta.env.VITE_TRANSLATION_ENABLED || '').toLowerCase() === 'true'
}

const getProvider = (): TranslationProvider => {
  const raw = String(import.meta.env.VITE_TRANSLATION_PROVIDER || '').toLowerCase()
  if (raw === 'libretranslate') return 'libretranslate'
  return 'libretranslate'
}

const getLibreTranslateUrl = () => {
  // Example: http://localhost:5000
  return String(import.meta.env.VITE_LIBRETRANSLATE_URL || '').trim().replace(/\/$/, '')
}

const memoryCache = new Map<string, string>()
const inFlight = new Map<string, Promise<string>>()

export const normalizeSupportedLanguage = (lng?: string | null): SupportedLanguage => {
  const raw = String(lng || '').toLowerCase()
  if (raw.startsWith('fr')) return 'fr'
  if (raw.startsWith('rw') || raw.includes('kinyarwanda') || raw.startsWith('kin')) return 'rw'
  if (raw.startsWith('en')) return 'en'
  return 'en'
}

const safeLocalStorage = (): Storage | null => {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

const hashText = (value: string) => {
  // Simple djb2 hash, stable across sessions.
  let hash = 5381
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(i)
  }
  return (hash >>> 0).toString(16)
}

const cacheKey = (source: TranslationSourceLanguage, target: SupportedLanguage, text: string) =>
  `translate:v1:${source}:${target}:${hashText(text)}`

export type TranslateOptions = {
  source?: TranslationSourceLanguage
  signal?: AbortSignal
}

export const getCachedTranslation = (
  text: string,
  target: SupportedLanguage,
  options: Pick<TranslateOptions, 'source'> = {}
): string | null => {
  const trimmed = String(text || '').trim()
  if (!trimmed) return ''

  const source = options.source || 'en'
  if (target === source) return trimmed
  // Our current runtime translator does not support Kinyarwanda.
  // Requirement: when language is rw, keep backend-provided dynamic content in English.
  if (target === 'rw') return trimmed
  if (!isTranslationEnabled()) return trimmed

  const key = cacheKey(source, target, trimmed)
  const fromMemory = memoryCache.get(key)
  if (fromMemory) return fromMemory

  const storage = safeLocalStorage()
  const fromStorage = storage?.getItem(key)
  if (fromStorage) {
    memoryCache.set(key, fromStorage)
    return fromStorage
  }

  return null
}

const translateViaLibreTranslate = async (
  text: string,
  source: TranslationSourceLanguage,
  target: SupportedLanguage,
  signal?: AbortSignal
) => {
  const baseUrl = getLibreTranslateUrl()
  if (!baseUrl) {
    throw new Error('LibreTranslate URL not configured (VITE_LIBRETRANSLATE_URL)')
  }

  const response = await fetch(`${baseUrl}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text, source, target, format: 'text' }),
    signal,
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Translation request failed (${response.status}): ${body || response.statusText}`)
  }

  const json = (await response.json().catch(() => null)) as null | { translatedText?: unknown }
  const translated = typeof json?.translatedText === 'string' ? json.translatedText.trim() : ''
  if (!translated) throw new Error('Translation response missing translatedText')
  return translated
}

export const translateText = async (
  text: string,
  target: SupportedLanguage,
  options: TranslateOptions = {}
): Promise<string> => {
  const trimmed = String(text || '').trim()
  if (!trimmed) return ''

  const source = options.source || 'en'
  if (target === source) return trimmed
  if (target === 'rw') return trimmed
  if (!isTranslationEnabled()) return trimmed

  // Guard against huge payloads / accidental HTML blobs.
  if (trimmed.length > 5000) return trimmed

  const provider = getProvider()

  if (provider === 'libretranslate') {
    return translateViaLibreTranslate(trimmed, source, target, options.signal)
  }

  return trimmed
}

export const translateTextCached = async (
  text: string,
  target: SupportedLanguage,
  options: TranslateOptions = {}
): Promise<string> => {
  const trimmed = String(text || '').trim()
  if (!trimmed) return ''

  const source = options.source || 'en'
  if (target === source) return trimmed
  if (target === 'rw') return trimmed
  if (!isTranslationEnabled()) return trimmed

  const key = cacheKey(source, target, trimmed)

  const fromMemory = memoryCache.get(key)
  if (fromMemory) return fromMemory

  const storage = safeLocalStorage()
  const fromStorage = storage?.getItem(key)
  if (fromStorage) {
    memoryCache.set(key, fromStorage)
    return fromStorage
  }

  const existing = inFlight.get(key)
  if (existing) return existing

  const promise = (async () => {
    try {
      const translated = await translateText(trimmed, target, options)
      memoryCache.set(key, translated)
      storage?.setItem(key, translated)
      return translated
    } finally {
      inFlight.delete(key)
    }
  })()

  inFlight.set(key, promise)
  return promise
}

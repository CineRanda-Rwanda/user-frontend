import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import en from './locales/en/translation.json'
import fr from './locales/fr/translation.json'
import rw from './locales/rw/translation.json'

export const supportedLanguages = ['en', 'rw', 'fr'] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]

const normalizeLanguage = (lng?: string): SupportedLanguage => {
  const raw = String(lng || '').toLowerCase()
  if (raw.startsWith('fr')) return 'fr'
  if (raw.startsWith('rw') || raw.includes('kinyarwanda')) return 'rw'
  if (raw.startsWith('en')) return 'en'
  return 'en'
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      rw: { translation: rw }
    },
    fallbackLng: 'en',
    supportedLngs: [...supportedLanguages],
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'app.language'
    },
    react: {
      useSuspense: false
    }
  })

// Ensure a supported language is selected.
const resolved = normalizeLanguage(i18n.language)
if (i18n.language !== resolved) {
  void i18n.changeLanguage(resolved)
}

export default i18n

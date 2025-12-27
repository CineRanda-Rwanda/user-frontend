import { useEffect, useMemo, useRef, useState } from 'react'
import type { SupportedLanguage } from '@/i18n'
import { getCachedTranslation, translateTextCached } from '@/utils/translate'

type UseAutoTranslateOptions = {
  enabled?: boolean
  source?: SupportedLanguage
  /** If true, returns empty string until translation is available (or cached). */
  hideUntilTranslated?: boolean
}

export const useAutoTranslate = (
  text: string,
  target: SupportedLanguage,
  options: UseAutoTranslateOptions = {}
) => {
  const enabled = options.enabled ?? true
  const source = options.source ?? 'en'
  const hideUntilTranslated = options.hideUntilTranslated ?? false

  const input = useMemo(() => String(text || ''), [text])

  const [translated, setTranslated] = useState(() => {
    const trimmed = String(text || '').trim()
    if (!trimmed) return ''
    if (!enabled || target === source) return trimmed
    const cached = getCachedTranslation(trimmed, target, { source })
    if (cached !== null) return cached
    return hideUntilTranslated ? '' : trimmed
  })
  const [loading, setLoading] = useState(false)

  const lastKeyRef = useRef<string>('')

  useEffect(() => {
    const trimmed = input.trim()
    if (!trimmed) {
      setTranslated('')
      return
    }

    if (!enabled || target === source) {
      setTranslated(trimmed)
      return
    }

    const cached = getCachedTranslation(trimmed, target, { source })
    if (cached !== null) {
      setTranslated(cached)
      return
    }

    setTranslated(hideUntilTranslated ? '' : trimmed)
  }, [enabled, hideUntilTranslated, input, source, target])

  useEffect(() => {
    const trimmed = input.trim()
    if (!trimmed) {
      setTranslated('')
      setLoading(false)
      return
    }

    if (!enabled || target === source) {
      setTranslated(trimmed)
      setLoading(false)
      return
    }

    const cached = getCachedTranslation(trimmed, target, { source })
    if (cached !== null) {
      setTranslated(cached)
      setLoading(false)
      return
    }

    const requestKey = `${source}:${target}:${trimmed}`
    if (lastKeyRef.current === requestKey) return
    lastKeyRef.current = requestKey

    const controller = new AbortController()

    setLoading(true)
    ;(async () => {
      try {
        const result = await translateTextCached(trimmed, target, {
          source,
          signal: controller.signal,
        })

        if (!controller.signal.aborted) {
          setTranslated(result)
        }
      } catch {
        // Fallback to original input silently.
        if (!controller.signal.aborted) {
          setTranslated(trimmed)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    })()

    return () => {
      controller.abort()
    }
  }, [enabled, input, source, target])

  const ready = !enabled || target === source || !input.trim() || (!!translated && !loading)
  return { text: translated, loading, ready }
}

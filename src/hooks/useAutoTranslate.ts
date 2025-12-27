import { useEffect, useMemo, useRef, useState } from 'react'
import type { SupportedLanguage } from '@/i18n'
import { translateTextCached } from '@/utils/translate'

type UseAutoTranslateOptions = {
  enabled?: boolean
  source?: SupportedLanguage
}

export const useAutoTranslate = (
  text: string,
  target: SupportedLanguage,
  options: UseAutoTranslateOptions = {}
) => {
  const enabled = options.enabled ?? true
  const source = options.source ?? 'en'

  const input = useMemo(() => String(text || ''), [text])

  const [translated, setTranslated] = useState(input)
  const [loading, setLoading] = useState(false)

  const lastKeyRef = useRef<string>('')

  useEffect(() => {
    setTranslated(input)
  }, [input])

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

  return { text: translated, loading }
}

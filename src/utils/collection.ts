export const extractCollection = <T = any>(response: any, preferredKeys: string[] = []): T[] => {
  if (!response) return []

  const layers = [response?.data?.data, response?.data, response]
  for (const layer of layers) {
    const result = coerceToArray<T>(layer, preferredKeys)
    if (result.length) {
      return result
    }
  }

  return []
}

const coerceToArray = <T>(value: any, preferredKeys: string[]): T[] => {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value !== 'object') return []

  const container = value as Record<string, unknown>
  const keys = [...preferredKeys, 'data', 'items', 'results', 'content', 'list']

  for (const key of keys) {
    const nested = container[key]
    if (Array.isArray(nested)) {
      return nested as T[]
    }
  }

  return []
}

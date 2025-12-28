import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { toast } from 'react-toastify'

type SupportedAppLanguage = 'en' | 'fr' | 'rw'

const normalizeAppLanguage = (raw?: string | null): SupportedAppLanguage => {
  const value = String(raw || '').toLowerCase()
  if (value.startsWith('fr')) return 'fr'
  if (value.startsWith('rw') || value.includes('kinyarwanda') || value.startsWith('kin')) return 'rw'
  return 'en'
}

const buildAcceptLanguage = (lng: SupportedAppLanguage) => {
  // Prefer the selected app language but allow English fallback.
  if (lng === 'en') return 'en'
  return `${lng}, en;q=0.9`
}

const normalizeApiBaseUrl = (raw: unknown) => {
  const value = String(raw ?? '').trim().replace(/\/$/, '')
  if (!value) return ''

  // Accept absolute URLs.
  if (/^https?:\/\//i.test(value)) return value

  // If a host is provided without scheme, default to https.
  // This prevents axios from treating it as a relative URL (which would hit the Vercel frontend domain).
  if (/^[a-z0-9.-]+(?::\d+)?(\/|$)/i.test(value)) {
    return `https://${value}`.replace(/\/$/, '')
  }

  // Otherwise (e.g. '/api/v1') return as-is.
  return value
}

const resolvedApiBaseUrl =
  normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL) || 'http://localhost:5000/api/v1'

const api = axios.create({
  baseURL: resolvedApiBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
})

type CacheEntry = {
  expiresAt: number
  response: AxiosResponse
}

const responseCache = new Map<string, CacheEntry>()

const stableStringify = (value: any): string => {
  if (value === null || value === undefined) return String(value)
  if (typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  const keys = Object.keys(value).sort()
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`
}

const getDefaultCacheTTL = (url: string) => {
  if (!url) return 0
  // Public lists and metadata: safe to cache briefly.
  if (url.startsWith('/content/public/')) return 60_000
  if (url === '/genres' || url === '/categories' || url === '/categories/featured') return 5 * 60_000
  if (url.startsWith('/content/search')) return 30_000

  // Authenticated but navigation-heavy endpoints.
  if (url === '/watch-history/in-progress') return 20_000
  if (url === '/watch-history') return 20_000
  if (url === '/content/unlocked') return 20_000

  // Public content details.
  if (/^\/content\/[^/]+$/.test(url)) return 60_000
  if (/^\/content\/series\/[^/]+$/.test(url)) return 60_000

  return 0
}

const hashToken = (token?: string | null) => {
  const raw = String(token || '')
  if (!raw) return 'anon'
  // djb2-ish hash, good enough for cache keying (not cryptographic).
  let hash = 5381
  for (let i = 0; i < raw.length; i++) {
    hash = (hash * 33) ^ raw.charCodeAt(i)
  }
  return `t${(hash >>> 0).toString(16)}`
}

const buildCacheKey = (config: InternalAxiosRequestConfig, appLanguage: SupportedAppLanguage, token?: string | null) => {
  const method = String(config.method || 'get').toLowerCase()
  const url = String(config.url || '')
  const params = (config as any).params
  const explicit = (config as any).cacheKey
  const tokenKey = hashToken(token)
  if (explicit) return `${method}:${explicit}:${appLanguage}:${tokenKey}`
  return `${method}:${String(config.baseURL || '')}${url}?${stableStringify(params)}:${appLanguage}:${tokenKey}`
}

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Let the backend know which language the user selected.
    // If the backend supports localization, it can return translated dynamic content.
    const appLanguage = normalizeAppLanguage(localStorage.getItem('app.language'))
    if (config.headers) {
      config.headers['Accept-Language'] = buildAcceptLanguage(appLanguage)
    }

    const method = String(config.method || 'get').toLowerCase()
    const url = String(config.url || '')
    const noCache = Boolean((config as any).noCache)
    const explicitTTL = (config as any).cacheTTL
    const ttl = typeof explicitTTL === 'number' ? explicitTTL : getDefaultCacheTTL(url)

    if (!noCache && method === 'get' && ttl > 0) {
      const cacheKey = buildCacheKey(config, appLanguage, token)
      const existing = responseCache.get(cacheKey)
      if (existing && existing.expiresAt > Date.now()) {
        config.adapter = async () => {
          return existing.response
        }
        return config
      }

      ;(config as any)._cacheKey = cacheKey
      ;(config as any)._cacheTTL = ttl
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors and token refresh
let refreshing: Promise<{ token: string; refreshToken?: string }> | null = null
api.interceptors.response.use(
  (response) => {
    // Avoid heavy logging in production.
    if (import.meta.env.DEV) {
      console.log('API Response:', response.config.url, response.data)
    }

    const cfg: any = response.config as any
    const cacheKey: string | undefined = cfg?._cacheKey
    const cacheTTL: number | undefined = cfg?._cacheTTL
    if (cacheKey && typeof cacheTTL === 'number' && cacheTTL > 0) {
      responseCache.set(cacheKey, { expiresAt: Date.now() + cacheTTL, response })
    }

    return response
  },
  async (error: AxiosError) => {
    if (import.meta.env.DEV) {
      console.error('API Error:', error.config?.url, error.response?.status, error.response?.data)
    }
    
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    const requestUrl = String(originalRequest?.url || '')
    const isAuthFlowRequest =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/verify') ||
      requestUrl.includes('/auth/forgot') ||
      requestUrl.includes('/auth/reset') ||
      requestUrl.includes('/auth/google')

    // Handle 401 Unauthorized - Try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthFlowRequest) {
      originalRequest._retry = true

      try {
        const existing = refreshing
        if (existing) {
          const res = await existing
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${res.token}`
          }
          return api(originalRequest)
        }

        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          // No refresh token available; treat as a normal 401.
          return Promise.reject(error)
        }

        refreshing = (async () => {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'}/auth/refresh-token`,
            { refreshToken }
          )
          const newToken: string = (data as any).data?.token || (data as any).token
          const newRefreshToken: string | undefined = (data as any).data?.refreshToken || (data as any).refreshToken
          localStorage.setItem('accessToken', newToken)
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken)
          }
          return { token: newToken, refreshToken: newRefreshToken }
        })()

        const res = await refreshing
        refreshing = null

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${res.token}`
        }
        return api(originalRequest)
      } catch (refreshError) {
        refreshing = null
        // Refresh failed - clear tokens and redirect to login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Handle other errors
    const message = (error.response?.data as any)?.message || error.message || 'An error occurred'
    const shouldSuppressToast = originalRequest?.suppressErrorToast

    // Don't show toast for 401 errors (handled above)
    if (!shouldSuppressToast && error.response?.status !== 401) {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

export default api

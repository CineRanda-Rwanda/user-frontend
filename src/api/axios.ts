import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
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

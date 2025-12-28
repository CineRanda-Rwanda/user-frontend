import 'axios'

declare module 'axios' {
  interface AxiosRequestConfig {
    suppressErrorToast?: boolean
    cacheTTL?: number
    cacheKey?: string
    noCache?: boolean
  }

  interface InternalAxiosRequestConfig {
    suppressErrorToast?: boolean
    cacheTTL?: number
    cacheKey?: string
    noCache?: boolean
  }
}

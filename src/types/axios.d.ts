import 'axios'

declare module 'axios' {
  interface AxiosRequestConfig {
    suppressErrorToast?: boolean
  }

  interface InternalAxiosRequestConfig {
    suppressErrorToast?: boolean
  }
}

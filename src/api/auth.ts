import api from './axios'
import {
  LoginRequest,
  PhoneRegisterRequest,
  EmailRegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  VerifyRegistrationRequest,
  VerifyEmailRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from '@/types/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'
const GOOGLE_OAUTH_BASE_URL = (import.meta.env.VITE_GOOGLE_OAUTH_URL as string | undefined)?.trim()

const getGoogleRedirectUri = () => {
  const configured = (import.meta.env.VITE_GOOGLE_REDIRECT_URI as string | undefined)?.trim()
  if (configured) return configured
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/oauth/google/callback`
  }
  return ''
}

export const getGoogleRedirectUriForClient = getGoogleRedirectUri

const buildGoogleOAuthUrl = () => {
  const fallbackBase = `${API_BASE_URL.replace(/\/$/, '')}/auth/google`
  const base = GOOGLE_OAUTH_BASE_URL || fallbackBase
  const redirectUri = getGoogleRedirectUri()

  if (!redirectUri) {
    return base
  }

  try {
    const target = new URL(base)
    if (!target.searchParams.has('redirect_uri')) {
      target.searchParams.set('redirect_uri', redirectUri)
    }
    return target.toString()
  } catch (error) {
    const encoded = encodeURIComponent(redirectUri)
    const separator = base.includes('?') ? '&' : '?'
    return `${base}${separator}redirect_uri=${encoded}`
  }
}

export const authAPI = {
  // Register new user via phone - Step 1: Send OTP
  registerPhone: (data: PhoneRegisterRequest) => {
    const { method: _method, ...payload } = data
    return api.post('/auth/register', payload)
  },

  // Register via email/password (no OTP)
  registerEmail: (data: EmailRegisterRequest) => {
    const { method: _method, ...payload } = data
    return api.post<AuthResponse>('/auth/register/email', payload)
  },

  // Register - Step 2: Verify OTP (requires original credentials)
  verifyRegistration: (payload: VerifyRegistrationRequest) =>
    api.post<AuthResponse>('/auth/verify-registration', payload),

  verifyEmail: (payload: VerifyEmailRequest) =>
    api.post<AuthResponse>('/auth/verify-email', payload),

  // Login user (identifier can be username or phone)
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data),

  // Get current user profile
  getProfile: () =>
    api.get('/auth/profile'),

  // Update user profile
  updateProfile: (data: any) =>
    api.patch('/auth/profile', data),

  // Refresh access token
  refreshToken: (data: RefreshTokenRequest) =>
    api.post<AuthResponse>('/auth/refresh-token', data),

  // Logout user
  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  },

  // Change PIN
  changePin: (oldPin: string, newPin: string) =>
    api.post('/auth/change-pin', { oldPin, newPin }),

  // Request PIN reset (forgot PIN)
  forgotPin: (phoneNumber: string) =>
    api.post('/auth/forgot-pin', { phoneNumber }),

  // Reset PIN with verification code
  resetPin: (code: string, newPin: string) =>
    api.post('/auth/reset-pin', { code, newPin }),

  requestPasswordReset: (payload: ForgotPasswordRequest) =>
    api.post('/auth/forgot-password', payload),

  resetPassword: (payload: ResetPasswordRequest) =>
    api.post('/auth/reset-password', payload),

  exchangeGoogleAuthorizationCode: (payload: { code: string; redirectUri: string }) =>
    api.post<AuthResponse>('/auth/google/exchange', payload, { withCredentials: true }),

  // Google OAuth helper
  getGoogleOAuthUrl: () => buildGoogleOAuthUrl()
}

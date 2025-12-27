import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authAPI } from '@/api/auth'
import { userAPI } from '@/api/user'
import { UpdateUserProfile, User } from '@/types/user'
import { LoginRequest, RegisterRequest, VerifyRegistrationRequest, VerifyEmailRequest, AuthResponse } from '@/types/auth'
import { STORAGE_KEYS } from '@/utils/constants'
import { toast } from 'react-toastify'
import { formatCurrency } from '@/utils/formatters'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<any>
  verifyRegistration: (payload: VerifyRegistrationRequest) => Promise<void>
  verifyEmail: (payload: VerifyEmailRequest) => Promise<void>
  logout: (options?: { silent?: boolean }) => void
  refreshUser: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  completeOAuthLogin: (payload: OAuthCallbackPayload) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type NormalizedAuthPayload = {
  user?: User
  token?: string
  refreshToken?: string
  welcomeBonus?: number
  message?: string
}

type OAuthCallbackPayload = {
  token: string
  refreshToken?: string
  user?: User
  message?: string
}

const normalizeAuthPayload = (raw: AuthResponse): NormalizedAuthPayload => {
  const normalizedUser = ((raw as any).user || raw?.data?.user) as User | undefined
  const token = (raw as any)?.token || (raw as any)?.data?.token
  const refreshToken = (raw as any)?.refreshToken || (raw as any)?.data?.refreshToken
  const message = (raw as any)?.message || (raw as any)?.data?.message

  return {
    user: normalizedUser,
    token,
    refreshToken,
    welcomeBonus: raw?.data?.welcomeBonus,
    message
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useTranslation()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const logout = useCallback(
    (options?: { silent?: boolean }) => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    setUser(null)
      if (!options?.silent) {
        toast.info(t('auth.toasts.loggedOut'))
      }
      navigate('/', { replace: true })
    },
    [navigate, t]
  )

  const persistTokens = useCallback((token?: string, refreshToken?: string) => {
    if (!token) return
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
    }
  }, [])

  const persistSession = useCallback(
    (payload: NormalizedAuthPayload) => {
      const sessionUser = payload.user
      const token = payload.token

      if (!sessionUser || !token) {
        throw new Error('Invalid response from server')
      }

      persistTokens(token, payload.refreshToken)
      setUser(sessionUser as any)
    },
    [persistTokens]
  )

  const completeOAuthLogin = useCallback(
    async (payload: OAuthCallbackPayload) => {
      const { token, refreshToken, user: oauthUser, message } = payload

      if (!token) {
        throw new Error('Missing token from OAuth payload')
      }

      persistTokens(token, refreshToken)

      try {
        if (oauthUser) {
          setUser(oauthUser as any)
        } else {
          const { data } = await userAPI.getCurrentUser()
          const userData = (data as any).data?.user || (data as any).user || data
          setUser(userData as any)
        }

        toast.success(message || t('auth.oauth.toasts.signedIn'))
        navigate('/browse', { replace: true })
      } catch (error) {
        console.error('Failed to finalize OAuth login:', error)
        logout({ silent: true })
        toast.error(t('auth.oauth.errors.couldNotComplete'))
        throw error
      }
    },
    [logout, navigate, persistTokens, t]
  )


  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      if (token) {
        try {
          const { data } = await userAPI.getCurrentUser()
          const userData = (data as any).data?.user || (data as any).user || data
          setUser(userData as any)
        } catch (error) {
          console.error('Failed to load user:', error)
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
        }
      }
      setLoading(false)
    }

    loadUser()
  }, [])

  const login = async (credentials: LoginRequest) => {
    try {
      const { data } = await authAPI.login(credentials)
      const normalized = normalizeAuthPayload(data)
      persistSession(normalized)

      toast.success(normalized.message || t('auth.toasts.welcomeBack'))
      navigate('/browse')
    } catch (error: any) {
      const message = error.response?.data?.message || t('errors.loginFailed')
      toast.error(message)
      throw error
    }
  }

  const register = async (credentials: RegisterRequest) => {
    try {
      if (credentials.method === 'phone') {
        const { data } = await authAPI.registerPhone(credentials)
        toast.success(data.message || t('auth.register.toasts.smsSent'))
        return data
      }

      const { data } = await authAPI.registerEmail(credentials)
      const normalized = normalizeAuthPayload(data)
      if (normalized.user && normalized.token) {
        persistSession(normalized)
        toast.success(normalized.message || t('auth.register.toasts.accountReady'))
        navigate('/browse')
      } else {
        toast.success(data.message || t('auth.register.toasts.checkEmail'))
      }
      return data
    } catch (error: any) {
      const message = error.response?.data?.message || t('errors.registrationFailed')
      toast.error(message)
      throw error
    }
  }

  const verifyRegistration = async (payload: VerifyRegistrationRequest) => {
    try {
      const { data } = await authAPI.verifyRegistration(payload)
      const normalized = normalizeAuthPayload(data)
      persistSession(normalized)

      const bonusMessage = normalized.welcomeBonus
        ? t('auth.register.toasts.welcomeBonusAdded', { amount: formatCurrency(normalized.welcomeBonus) })
        : undefined

      toast.success(normalized.message || bonusMessage || t('auth.register.toasts.completed'))
      navigate('/browse')
    } catch (error: any) {
      const message = error.response?.data?.message || t('errors.verificationFailed')
      toast.error(message)
      throw error
    }
  }

  const verifyEmail = async (payload: VerifyEmailRequest) => {
    try {
      const { data } = await authAPI.verifyEmail(payload)
      const normalized = normalizeAuthPayload(data)
      persistSession(normalized)

      toast.success(normalized.message || t('auth.register.toasts.emailVerified'))
      navigate('/browse')
    } catch (error: any) {
      const message = error.response?.data?.message || t('errors.verificationFailed')
      toast.error(message)
      throw error
    }
  }

  const refreshUser = async () => {
    try {
      const { data } = await userAPI.getCurrentUser()
      const userData = (data as any).data?.user || (data as any).user || data
      setUser(userData as any)
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      const payload: UpdateUserProfile = {
        username: profileData.username,
        phoneNumber: profileData.phoneNumber ?? undefined,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        preferredLanguage: profileData.preferredLanguage,
        theme: profileData.theme,
      }

      const { data } = await userAPI.updateProfile(payload)
      const userData = (data as any).data?.user || (data as any).user || data
      setUser(userData as any)
    } catch (error) {
      console.error('Failed to update profile:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    verifyRegistration,
    verifyEmail,
    logout,
    refreshUser,
    updateProfile,
    completeOAuthLogin
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

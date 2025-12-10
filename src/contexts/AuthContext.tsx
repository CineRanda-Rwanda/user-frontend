import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '@/api/auth'
import { userAPI } from '@/api/user'
import { User } from '@/types/user'
import { LoginRequest, RegisterRequest, VerifyRegistrationRequest } from '@/types/auth'
import { STORAGE_KEYS } from '@/utils/constants'
import { toast } from 'react-toastify'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<any>
  verifyRegistration: (payload: VerifyRegistrationRequest) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

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
      
      // Handle both response formats from API
      const user = (data as any).user || (data as any).data?.user
      const token = data.token
      const refreshToken = data.refreshToken
      
      if (user && token) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
        if (refreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
        }
        setUser(user as any)
        
        toast.success('Welcome back!')
        navigate('/browse')
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      throw error
    }
  }

  const register = async (credentials: RegisterRequest) => {
    try {
      const { data } = await authAPI.register(credentials)
      
      // Registration returns verification required message
      toast.success(data.message || 'Verification code sent!')
      return data // Return data for next step
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      throw error
    }
  }

  const verifyRegistration = async (payload: VerifyRegistrationRequest) => {
    try {
      const { data } = await authAPI.verifyRegistration(payload)
      
      // Handle the response format from API
      const user = (data as any).user || (data as any).data?.user
      const token = data.token
      const refreshToken = data.refreshToken
      
      if (user && token) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
        if (refreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
        }
        setUser(user as any)
        
        toast.success('Registration completed successfully!')
        navigate('/browse')
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Verification failed'
      toast.error(message)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    setUser(null)
    toast.info('Logged out successfully')
    navigate('/', { replace: true })
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
      const { data } = await userAPI.updateProfile(profileData)
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
    logout,
    refreshUser,
    updateProfile
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

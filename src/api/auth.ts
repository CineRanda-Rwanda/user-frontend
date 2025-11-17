import api from './axios'
import { LoginRequest, RegisterRequest, AuthResponse, RefreshTokenRequest } from '@/types/auth'

export const authAPI = {
  // Register new user - Step 1: Send OTP
  register: (data: RegisterRequest) =>
    api.post('/auth/register', data),

  // Register - Step 2: Verify OTP
  verifyRegistration: (phoneNumber: string, verificationCode: string) =>
    api.post<AuthResponse>('/auth/verify-registration', { phoneNumber, verificationCode }),

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
    api.post('/auth/reset-pin', { code, newPin })
}

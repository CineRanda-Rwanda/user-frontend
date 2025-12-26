// Auth types
export type LoginMethod = 'phone' | 'email'

export interface PhoneLoginRequest {
  method: 'phone'
  phoneNumber: string
  pin: string
}

export interface EmailLoginRequest {
  method: 'email'
  email: string
  password: string
}

export type LoginRequest = PhoneLoginRequest | EmailLoginRequest

export interface PhoneRegisterRequest {
  method: 'phone'
  username: string
  phoneNumber: string
  pin: string
  preferredChannel?: 'sms' | 'whatsapp'
}

export interface EmailRegisterRequest {
  method: 'email'
  username: string
  email: string
  password: string
}

export type RegisterRequest = PhoneRegisterRequest | EmailRegisterRequest
export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface VerifyRegistrationRequest {
  username: string
  phoneNumber: string
  pin: string
  verificationCode: string
}

export interface VerifyEmailRequest {
  email: string
  verificationCode: string
  password: string
}

export interface WalletTransaction {
  amount: number
  type: string
  description: string
  createdAt: string
  _id: string
}

export interface Wallet {
  balance: number
  bonusBalance: number
  transactions: WalletTransaction[]
  _id: string
}

export interface AuthUser {
  _id: string
  username?: string
  phoneNumber?: string | null
  authProvider?: 'email' | 'phone' | 'google' | string
  email?: string
  firstName?: string
  lastName?: string
  profilePictureUrl?: string
  role: 'user' | 'admin'
  location: string
  isActive: boolean
  isEmailVerified: boolean
  phoneVerified: boolean
  loginCount: number
  wallet: Wallet
  balance: number // RWF balance (legacy field)
  isTwoFactorEnabled: boolean
  pendingVerification: boolean
  preferredLanguage?: 'english' | 'french' | 'kinyarwanda'
  theme?: 'light' | 'dark'
  watchHistory: any[]
  purchasedContent: string[]
  purchasedEpisodes: string[]
  purchasedSeasons: string[]
  transactions: any[]
  lastActive?: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponseData {
  user: AuthUser
  welcomeBonus?: number
}

export interface AuthResponse {
  status: string
  token: string
  refreshToken?: string
  user?: AuthUser
  data?: AuthResponseData
  message?: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

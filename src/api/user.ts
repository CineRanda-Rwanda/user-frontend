import api from './axios'
import { User, WatchHistory, UpdateUserProfile } from '@/types/user'

export const userAPI = {
  // Get current user profile (uses auth/profile endpoint)
  getCurrentUser: () =>
    api.get<User>('/auth/profile'),

  // Update user profile
  updateProfile: (data: UpdateUserProfile) =>
    api.patch<User>('/auth/profile', data),

  // Change PIN
  changePin: (oldPin: string, newPin: string) =>
    api.post('/auth/change-pin', { oldPin, newPin }),

  // Get user's purchased content (library) - uses content/unlocked
  getLibrary: () =>
    api.get('/content/unlocked'),

  // Get user's watch history
  getWatchHistory: () =>
    api.get<WatchHistory[]>('/users/watch-history'),

  // Get watch progress for specific content
  getWatchProgress: (contentId: string) =>
    api.get<WatchHistory>(`/users/watch-history/${contentId}`),

  // Update watch progress
  updateWatchProgress: (data: {
    contentId: string
    episodeId?: string
    lastPosition: number
    totalDuration: number
    completed?: boolean
  }) =>
    api.post('/users/watch-history', data),

  // Get wallet balance (from user profile)
  getWallet: () =>
    api.get('/auth/profile'),

  // Delete account
  deleteAccount: () =>
    api.delete('/users/me')
}

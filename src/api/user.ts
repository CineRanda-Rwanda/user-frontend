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
    api.get<WatchHistory[]>('/watch-history'),

  // Get watch progress for specific content
  getWatchProgress: (contentId: string, episodeId?: string) =>
    api.get<WatchHistory>(`/watch-progress/${contentId}` , {
      params: episodeId ? { episodeId } : undefined,
      validateStatus: (status) => status === 200 || status === 404,
    }),

  // Update watch progress
  updateWatchProgress: (data: {
    contentId: string
    episodeId?: string
    lastPosition: number
    totalDuration: number
    completed?: boolean
  }) => {
    const payload = {
      contentId: data.contentId,
      episodeId: data.episodeId,
      progress: Math.floor(data.lastPosition),
      totalDuration: Math.floor(data.totalDuration),
      completed: data.completed ?? false,
    }

    return api
      .post('/watch-progress', payload, {
        validateStatus: (status) =>
          Boolean(status) &&
          ((status >= 200 && status < 300) || status === 404 || status === 501),
      })
      .then((response) => {
        if (response.status !== 404 && response.status !== 501) {
          return response
        }

        return api
          .post(
            '/watch-history/update',
            {
              movieId: data.contentId,
              watchedDuration: Math.floor(data.lastPosition),
              totalDuration: Math.floor(data.totalDuration),
              episodeId: data.episodeId,
              completed: data.completed ?? false,
            },
            {
              validateStatus: (status) =>
                Boolean(status) &&
                ((status >= 200 && status < 300) || status === 404),
            }
          )
          .then((legacyResponse) => {
            if (legacyResponse.status === 404) {
              console.warn('Legacy watch history endpoint could not find this movie; skipping server progress sync.')
            }
            return legacyResponse
          })
      })
  },

  // Get wallet balance (from user profile)
  getWallet: () =>
    api.get('/auth/profile'),

  // Delete account
  deleteAccount: () =>
    api.delete('/users/me')
}

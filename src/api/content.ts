import api from './axios'

export const contentAPI = {
  // Get all published movies (public)
  getPublishedMovies: (page: number = 1, limit: number = 10) =>
    api.get('/content/public/movies', { params: { page, limit } }),

  // Get all published series
  getPublishedSeries: (page: number = 1, limit: number = 10) =>
    api.get('/content/public/type/Series', { params: { page, limit } }),

  // Get content by type (Movie or Series) - PUBLIC
  getContentByType: (type: 'Movie' | 'Series', page: number = 1, limit: number = 10) =>
    api.get(`/content/public/type/${type}`, { params: { page, limit } }),

  // Get movie by ID
  getMovieById: (id: string) =>
    api.get(`/content/${id}`),

  // Get movie trailer (public)
  getMovieTrailer: (id: string) =>
    api.get(`/content/movies/${id}/trailer`),

  // Get series by ID with all seasons and episodes
  getSeriesById: (id: string) =>
    api.get(`/content/series/${id}`),

  // Get content by ID (tries movie first, then series)
  getContentById: async (id: string) => {
    try {
      // Try fetching as movie/generic content first
      return await api.get(`/content/${id}`, { suppressErrorToast: true });
    } catch (error: any) {
      // If it fails or if we need to be specific about series
      return await api.get(`/content/series/${id}`);
    }
  },

  // Get specific season from a series
  getSeasonDetails: (seriesId: string, seasonNumber: number) =>
    api.get(`/content/series/${seriesId}/seasons/${seasonNumber}`),

  // Get specific episode from a series
  getEpisodeDetails: (seriesId: string, episodeId: string) =>
    api.get(`/content/series/${seriesId}/episodes/${episodeId}`),

  // Get episode trailer (public)
  getEpisodeTrailer: (seriesId: string, seasonNumber: number, episodeId: string) =>
    api.get(`/content/series/${seriesId}/seasons/${seasonNumber}/episodes/${episodeId}/trailer`),

  // Get secure playback URL for content or specific episodes (per API docs: /content/:id/watch)
  getStreamUrl: (contentId: string, params?: { episodeId?: string; seasonNumber?: number; episodeNumber?: number }) =>
    api.get(`/content/${contentId}/watch`, params ? { params } : undefined),

  // Search content (public)
  searchContent: (query: string, page: number = 1, limit: number = 10) =>
    api.get('/content/search', { params: { q: query, page, limit } }),

  // Get movies by genre (public)
  getMoviesByGenre: (genreId: string, page: number = 1, limit: number = 10) =>
    api.get(`/content/public/movies/genre/${genreId}`, { params: { page, limit } }),

  // Get movies by category (public)
  getMoviesByCategory: (categoryId: string, page: number = 1, limit: number = 10) =>
    api.get(`/content/public/movies/category/${categoryId}`, { params: { page, limit } }),

  // Get all genres (public)
  getGenres: () =>
    api.get('/genres'),

  // Get all categories (public)
  getCategories: () =>
    api.get('/categories'),

  // Get featured categories (public)
  getFeaturedCategories: () =>
    api.get('/categories/featured'),

  // Get user's unlocked content (purchased movies and series)
  getUnlockedContent: () =>
    api.get('/content/unlocked'),

  // Check if user has access to content
  checkAccess: (contentId: string) =>
    api.get(`/content/${contentId}/access`),

  // Get similar content (placeholder - implement based on backend)
  getSimilarContent: (contentId: string, genres: string[], limit: number = 10) =>
    api.get('/content/similar', {
      params: { contentId, genres: genres.join(','), limit }
    }),

  // Record watch progress
  updateWatchProgress: (contentId: string, progress: number, duration: number) =>
    api.post(`/content/${contentId}/progress`, { progress, duration }),

  // Rate content
  rateContent: (contentId: string, rating: number) =>
    api.post(`/content/${contentId}/rate`, { rating })
}

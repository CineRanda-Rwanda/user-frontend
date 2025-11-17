import api from './axios'

export const contentAPI = {
  // Get all published movies
  getPublishedMovies: (page: number = 1, limit: number = 10) =>
    api.get('/content/movies', { params: { page, limit } }),

  // Get all published series
  getPublishedSeries: (page: number = 1, limit: number = 10) =>
    api.get('/content/series', { params: { page, limit } }),

  // Get content by type (Movie or Series)
  getContentByType: (type: 'Movie' | 'Series', page: number = 1, limit: number = 10) =>
    api.get(`/content/type/${type}`, { params: { page, limit } }),

  // Get movie by ID
  getMovieById: (id: string) =>
    api.get(`/content/movies/${id}`),

  // Get series by ID with all seasons and episodes
  getSeriesById: (id: string) =>
    api.get(`/content/series/${id}`),

  // Get content by ID (tries movie first, then series)
  getContentById: async (id: string) => {
    try {
      return await api.get(`/content/movies/${id}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return await api.get(`/content/series/${id}`);
      }
      throw error;
    }
  },

  // Get specific season from a series
  getSeasonDetails: (seriesId: string, seasonNumber: number) =>
    api.get(`/content/series/${seriesId}/seasons/${seasonNumber}`),

  // Get specific episode from a series
  getEpisodeDetails: (seriesId: string, episodeId: string) =>
    api.get(`/content/series/${seriesId}/episodes/${episodeId}`),

  // Search movies
  searchMovies: (query: string, page: number = 1, limit: number = 10) =>
    api.get('/content/movies/search', { params: { query, page, limit } }),

  // Get movies by genre
  getMoviesByGenre: (genreId: string, page: number = 1, limit: number = 10) =>
    api.get(`/content/movies/genre/${genreId}`, { params: { page, limit } }),

  // Get movies by category
  getMoviesByCategory: (categoryId: string, page: number = 1, limit: number = 10) =>
    api.get(`/content/movies/category/${categoryId}`, { params: { page, limit } }),

  // Get series by genre
  getSeriesByGenre: (genreId: string, page: number = 1, limit: number = 10) =>
    api.get(`/content/series/genre/${genreId}`, { params: { page, limit } }),

  // Get series by category
  getSeriesByCategory: (categoryId: string, page: number = 1, limit: number = 10) =>
    api.get(`/content/series/category/${categoryId}`, { params: { page, limit } }),

  // Get featured movies
  getFeaturedMovies: () =>
    api.get('/content/movies/featured'),

  // Get all genres
  getGenres: () =>
    api.get('/genres'),

  // Get all categories
  getCategories: () =>
    api.get('/categories'),

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

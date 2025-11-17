import axios from './axios';

export interface Rating {
  _id: string;
  userId: string;
  movieId: string;
  rating: number; // 1-5
  review: string;
  user: {
    _id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SubmitRatingRequest {
  movieId: string;
  rating: number; // 1-5
  review: string;
}

export interface RatingsResponse {
  ratings: Rating[];
  pagination: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
}

/**
 * Submit a rating/review for content
 */
export const submitRating = async (
  data: SubmitRatingRequest
): Promise<Rating> => {
  const response = await axios.post('/ratings', data);
  return response.data.data.rating;
};

/**
 * Get all ratings for specific content
 */
export const getRatings = async (
  movieId: string,
  page: number = 1,
  limit: number = 10
): Promise<RatingsResponse> => {
  const response = await axios.get(`/ratings/movie/${movieId}`, {
    params: { page, limit },
  });
  return response.data.data;
};

/**
 * Delete user's own rating
 */
export const deleteRating = async (ratingId: string): Promise<void> => {
  await axios.delete(`/ratings/${ratingId}`);
};

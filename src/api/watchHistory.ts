import axios from './axios';
import { Content } from '../types/content';

export interface WatchHistoryItem {
  _id: string;
  userId: string;
  movieId: string;
  contentType: 'Movie' | 'Series';
  watchedDuration: number; // in seconds
  totalDuration: number; // in seconds
  lastWatched: string; // ISO date string
  progress: number; // percentage 0-100
  content: Content; // Populated content details
}

export interface UpdateProgressRequest {
  movieId: string;
  watchedDuration: number; // in seconds
}

/**
 * Update watch progress for a movie/episode
 */
export const updateWatchProgress = async (
  movieId: string,
  watchedDuration: number
): Promise<WatchHistoryItem> => {
  const response = await axios.post('/watch-history/update', {
    movieId,
    watchedDuration,
  });
  return response.data.data;
};

/**
 * Get complete watch history
 */
export const getWatchHistory = async (): Promise<WatchHistoryItem[]> => {
  const response = await axios.get('/watch-history');
  return response.data.data.history || [];
};

/**
 * Get in-progress content (Continue Watching)
 */
export const getContinueWatching = async (): Promise<WatchHistoryItem[]> => {
  const response = await axios.get('/watch-history/in-progress');
  return response.data.data.history || [];
};

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../api/user';
import { getContinueWatching } from '../api/watchHistory';
import { Content } from '../types/content';
import { WatchHistoryItem } from '../api/watchHistory';
import { toast } from 'react-toastify';
import { FiStar, FiPlay, FiClock } from 'react-icons/fi';

const MyLibrary: React.FC = () => {
  const navigate = useNavigate();
  const [purchasedContent, setPurchasedContent] = useState<Content[]>([]);
  const [continueWatching, setContinueWatching] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'Movie' | 'Series'>('all');

  useEffect(() => {
    loadLibraryData();
  }, []);

  const loadLibraryData = async () => {
    try {
      setLoading(true);
      const [libraryResponse, continueWatchingData] = await Promise.all([
        userAPI.getLibrary().catch(err => {
          console.error('Library load error:', err);
          return { data: { data: { content: [] } } };
        }),
        getContinueWatching().catch(err => {
          console.error('Continue watching error:', err);
          return [];
        }),
      ]);
      
      // Handle different response structures with safe navigation
      const libraryData = libraryResponse?.data?.data?.content || 
                         libraryResponse?.data?.content || 
                         [];
      setPurchasedContent(Array.isArray(libraryData) ? libraryData : []);
      setContinueWatching(Array.isArray(continueWatchingData) ? continueWatchingData : []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load library');
    } finally {
      setLoading(false);
    }
  };

  const filteredContent = filter === 'all' 
    ? purchasedContent 
    : purchasedContent.filter(c => c.contentType === filter);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getProgressPercentage = (item: WatchHistoryItem) => {
    return Math.round((item.watchedDuration / item.totalDuration) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Library</h1>
          <p className="text-gray-400">Your purchased movies and series</p>
        </div>

        {/* Continue Watching Section */}
        {continueWatching.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FiClock className="text-yellow-500" />
              Continue Watching
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {continueWatching.map((item) => (
                <div
                  key={item._id}
                  onClick={() => navigate(`/watch/${item.movieId}`)}
                  className="group relative bg-gray-900 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-yellow-500 transition"
                >
                  <div className="relative aspect-video">
                    <img
                      src={item.content.posterImageUrl}
                      alt={item.content.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center group-hover:scale-110 transition">
                        <FiPlay className="w-8 h-8 text-black ml-1" />
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                      <div
                        className="h-full bg-yellow-500"
                        style={{ width: `${getProgressPercentage(item)}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-lg mb-1 truncate">
                      {item.content.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>{getProgressPercentage(item)}% watched</span>
                      <span>{formatDuration(item.totalDuration - item.watchedDuration)} left</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-800">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 font-semibold transition ${
              filter === 'all'
                ? 'text-yellow-500 border-b-2 border-yellow-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All ({purchasedContent.length})
          </button>
          <button
            onClick={() => setFilter('Movie')}
            className={`px-6 py-3 font-semibold transition ${
              filter === 'Movie'
                ? 'text-yellow-500 border-b-2 border-yellow-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Movies ({purchasedContent.filter(c => c.contentType === 'Movie').length})
          </button>
          <button
            onClick={() => setFilter('Series')}
            className={`px-6 py-3 font-semibold transition ${
              filter === 'Series'
                ? 'text-yellow-500 border-b-2 border-yellow-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Series ({purchasedContent.filter(c => c.contentType === 'Series').length})
          </button>
        </div>

        {/* Content Grid */}
        {filteredContent.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              {filter === 'all' ? 'No purchased content yet' : `No ${filter.toLowerCase()}s purchased`}
            </h3>
            <p className="text-gray-400 mb-6">
              Browse our catalog and start building your library!
            </p>
            <button
              onClick={() => navigate('/browse')}
              className="px-6 py-3 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-600 transition"
            >
              Browse Content
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredContent.map((content) => (
              <div
                key={content._id}
                onClick={() => navigate(`/content/${content._id}`)}
                className="group relative bg-gray-900 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-yellow-500 transition"
              >
                <div className="relative aspect-[2/3]">
                  <img
                    src={content.posterImageUrl}
                    alt={content.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2 text-white text-sm mb-2">
                        <FiStar className="text-yellow-500" fill="currentColor" />
                        <span>{content.averageRating?.toFixed(1) || 'N/A'}</span>
                        <span>•</span>
                        <span>{content.releaseYear}</span>
                      </div>
                      <button className="w-full bg-yellow-500 text-black py-2 rounded font-semibold hover:bg-yellow-600 transition flex items-center justify-center gap-2">
                        <FiPlay /> Watch Now
                      </button>
                    </div>
                  </div>
                  {/* Purchased Badge */}
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Owned
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-white font-semibold truncate">{content.title}</h3>
                  <p className="text-sm text-gray-400">{content.contentType}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLibrary;

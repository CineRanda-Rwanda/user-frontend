import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contentAPI } from '../api/content';
import { purchaseContentWithWallet, purchaseEpisodeWithWallet } from '../api/payment';
import { getWalletBalance } from '../api/wallet';
import { submitRating, getRatings } from '../api/ratings';
import { Content } from '../types/content';
import { WalletBalance } from '../api/wallet';
import { Rating } from '../api/ratings';
import { toast } from 'react-toastify';
import { FiStar, FiPlay, FiDollarSign, FiLock, FiCheck, FiClock } from 'react-icons/fi';

const ContentDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState<Content | null>(null);
  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userReview, setUserReview] = useState('');

  useEffect(() => {
    if (id) {
      loadContentDetails();
    }
  }, [id]);

  const loadContentDetails = async () => {
    try {
      setLoading(true);
      const [contentResponse, walletData, ratingsData] = await Promise.all([
        contentAPI.getContentById(id!),
        getWalletBalance().catch(err => {
          console.error('Wallet load error:', err);
          return { balance: 0, coinBalance: 0 };
        }),
        getRatings(id!).catch(err => {
          console.error('Ratings load error:', err);
          return { ratings: [], pagination: { page: 1, pages: 1, total: 0, limit: 10 } };
        }),
      ]);
      
      // Handle different response structures with safe navigation
      const contentData = contentResponse?.data?.data?.movie || 
                         contentResponse?.data?.data?.series || 
                         contentResponse?.data?.data || 
                         contentResponse?.data;
      
      if (!contentData) {
        throw new Error('Content not found');
      }
      
      setContent(contentData);
      setWallet(walletData);
      setRatings(Array.isArray(ratingsData?.ratings) ? ratingsData.ratings : []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load content details');
      navigate('/browse');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!content || !wallet) return;

    // Check balance
    const price = content.priceInRwf;
    if (wallet.balance < price) {
      toast.error('Insufficient balance. Please top up your wallet.');
      navigate('/profile?tab=wallet');
      return;
    }

    try {
      setPurchasing(true);
      await purchaseContentWithWallet(content._id);
      toast.success('Content purchased successfully!');
      setShowPurchaseModal(false);
      loadContentDetails(); // Reload to update purchase status
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!content) return;

    try {
      await submitRating({
        movieId: content._id,
        rating: userRating,
        review: userReview,
      });
      toast.success('Rating submitted successfully!');
      setShowRatingModal(false);
      setUserRating(5);
      setUserReview('');
      loadContentDetails(); // Reload ratings
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!content) return null;

  const isPurchased = content.isPurchased || content.userAccess?.isPurchased;
  const isFree = content.isFree || content.priceInRwf === 0;

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div 
        className="relative h-[70vh] bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${content.posterImageUrl})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">{content.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-white mb-6">
              <div className="flex items-center gap-2 bg-yellow-500 text-black px-3 py-1 rounded">
                <FiStar fill="currentColor" />
                <span className="font-semibold">{content.averageRating?.toFixed(1) || 'N/A'}</span>
              </div>
              <span>{content.releaseYear}</span>
              <span>•</span>
              <span>{content.contentType}</span>
              {content.duration && (
                <>
                  <span>•</span>
                  <span>{content.duration} min</span>
                </>
              )}
              <span>•</span>
              <span className="capitalize">{content.language || 'English'}</span>
            </div>

            <p className="text-xl text-gray-300 max-w-3xl mb-8">{content.description}</p>

            <div className="flex flex-wrap gap-4">
              {(isPurchased || isFree) ? (
                <button
                  onClick={() => navigate(`/watch/${content._id}`)}
                  className="flex items-center gap-2 px-8 py-4 bg-yellow-500 text-black rounded-lg font-bold text-lg hover:bg-yellow-600 transition"
                >
                  <FiPlay /> Watch Now
                </button>
              ) : (
                <button
                  onClick={() => setShowPurchaseModal(true)}
                  className="flex items-center gap-2 px-8 py-4 bg-yellow-500 text-black rounded-lg font-bold text-lg hover:bg-yellow-600 transition"
                >
                  <FiDollarSign /> Purchase - {content.priceInRwf} RWF
                </button>
              )}
              
              {(isPurchased || isFree) && (
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="flex items-center gap-2 px-8 py-4 bg-gray-800 text-white rounded-lg font-bold text-lg hover:bg-gray-700 transition"
                >
                  <FiStar /> Rate & Review
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pricing Info */}
            {!isPurchased && !isFree && (
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-white mb-4">Pricing</h3>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-yellow-500">{content.priceInRwf}</span>
                    <span className="text-gray-400">RWF</span>
                  </div>
                  <div className="text-gray-400">or</div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-red-500">{content.priceInCoins}</span>
                    <span className="text-gray-400">Coins</span>
                  </div>
                </div>
                {wallet && (
                  <div className="mt-4 text-sm text-gray-400">
                    Your balance: {wallet.balance} RWF • {wallet.coinBalance} Coins
                  </div>
                )}
              </div>
            )}

            {/* Cast & Crew */}
            {content.cast && content.cast.length > 0 && (
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-white mb-4">Cast</h3>
                <div className="flex flex-wrap gap-2">
                  {content.cast.map((actor, index) => (
                    <span key={index} className="px-4 py-2 bg-gray-800 text-white rounded-full">
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Genres */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-white mb-4">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {content.genres.map((genre) => (
                  <span key={genre._id} className="px-4 py-2 bg-yellow-500 text-black rounded-full font-semibold">
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Ratings & Reviews */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ratings & Reviews ({ratings.length})
              </h3>
              {ratings.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-4">
                  {ratings.slice(0, 5).map((rating) => (
                    <div key={rating._id} className="border-b border-gray-800 pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1 text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <FiStar key={i} fill={i < rating.rating ? 'currentColor' : 'none'} />
                          ))}
                        </div>
                        <span className="text-white font-semibold">@{rating.user.username}</span>
                      </div>
                      <p className="text-gray-300">{rating.review}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  {isPurchased ? (
                    <span className="text-green-500 flex items-center gap-1">
                      <FiCheck /> Purchased
                    </span>
                  ) : isFree ? (
                    <span className="text-blue-500 flex items-center gap-1">
                      <FiCheck /> Free
                    </span>
                  ) : (
                    <span className="text-yellow-500 flex items-center gap-1">
                      <FiLock /> Locked
                    </span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Views</span>
                  <span className="text-white">{content.viewCount?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rating Count</span>
                  <span className="text-white">{content.ratingCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Age Rating</span>
                  <span className="text-white">{content.ageRating || 'NR'}</span>
                </div>
              </div>
            </div>

            {content.trailerYoutubeLink && (
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Trailer</h3>
                <a
                  href={content.trailerYoutubeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-red-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Watch on YouTube
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Confirm Purchase</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to purchase "{content.title}" for {content.priceInRwf} RWF?
            </p>
            {wallet && wallet.balance < content.priceInRwf && (
              <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-4">
                <p className="text-red-400">
                  Insufficient balance. You need {content.priceInRwf - wallet.balance} more RWF.
                </p>
              </div>
            )}
            <div className="flex gap-4">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                disabled={purchasing || (wallet && wallet.balance < content.priceInRwf)}
                className="flex-1 px-4 py-3 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {purchasing ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Rate & Review</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Your Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setUserRating(star)}
                    className="text-3xl transition hover:scale-110"
                  >
                    <FiStar
                      className={star <= userRating ? 'text-yellow-500' : 'text-gray-600'}
                      fill={star <= userRating ? 'currentColor' : 'none'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Your Review</label>
              <textarea
                value={userReview}
                onChange={(e) => setUserReview(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Share your thoughts about this content..."
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={!userReview.trim()}
                className="flex-1 px-4 py-3 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentDetails;

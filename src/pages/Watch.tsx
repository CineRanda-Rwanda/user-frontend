import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { FiArrowLeft, FiPlay, FiChevronRight, FiLock, FiUnlock } from 'react-icons/fi'
import { contentAPI } from '../api/content'
import { purchaseContentWithWallet } from '../api/payment'
import { getWalletBalance, WalletBalance } from '../api/wallet'
import { Content } from '../types/content'
import { toast } from 'react-toastify'

interface Episode {
  _id: string
  episodeNumber: number
  title: string
  description: string
  duration: number
  videoUrl?: string
  isFree?: boolean
  isUnlocked?: boolean
}

const Watch: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)
  const [showEpisodes, setShowEpisodes] = useState(true)
  
  // Purchase State
  const [wallet, setWallet] = useState<WalletBalance | null>(null)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    loadContent()
    loadWallet()
  }, [id])

  const loadWallet = async () => {
    try {
      const balance = await getWalletBalance()
      setWallet(balance)
    } catch (error) {
      console.error('Failed to load wallet', error)
    }
  }

  const loadContent = async () => {
    try {
      setLoading(true)
      const response = await contentAPI.getContentById(id!)
      const contentData = response?.data?.data?.movie || 
                         response?.data?.data?.series || 
                         response?.data?.data || 
                         response?.data

      setContent(contentData)

      // Get season and episode from URL params
      const seasonParam = searchParams.get('season')
      const episodeParam = searchParams.get('episode')

      // Auto-select episode from URL params or first episode if series
      if (contentData.contentType === 'Series' && contentData.seasons?.length > 0) {
        const targetSeasonNum = seasonParam ? parseInt(seasonParam) : 1
        const targetSeason = contentData.seasons.find((s: any) => s.seasonNumber === targetSeasonNum) || contentData.seasons[0]
        
        if (targetSeason.episodes?.length > 0) {
          const targetEpisodeNum = episodeParam ? parseInt(episodeParam) : 1
          const targetEpisode = targetSeason.episodes.find((e: any) => e.episodeNumber === targetEpisodeNum) || targetSeason.episodes[0]
          
          setSelectedEpisode(targetEpisode)
          setSelectedSeason(targetSeason.seasonNumber)
        }
      }
    } catch (error: any) {
      toast.error('Failed to load content')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleEpisodeSelect = (episode: Episode, seasonNumber: number) => {
    setSelectedEpisode(episode)
    setSelectedSeason(seasonNumber)
  }

  const handlePurchase = async () => {
    if (!content || !wallet) return
    
    if (wallet.balance < content.priceInRwf) {
      toast.error('Insufficient balance. Please top up your wallet.')
      navigate('/profile?tab=wallet')
      return
    }

    try {
      setPurchasing(true)
      await purchaseContentWithWallet(content._id)
      toast.success('Content purchased successfully!')
      loadContent() // Reload to update access
      loadWallet()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Purchase failed')
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  if (!content) return null

  const videoUrl = content.contentType === 'Movie' 
    ? content.movieFileUrl 
    : selectedEpisode?.videoUrl

  const isPurchased = content.isPurchased || content.userAccess?.isPurchased
  const isFree = content.isFree || content.priceInRwf === 0
  
  // Check if specific episode is unlocked (for series)
  const isEpisodeUnlocked = content.contentType === 'Series' && selectedEpisode
    ? (selectedEpisode.isFree || selectedEpisode.isUnlocked || isPurchased)
    : (isPurchased || isFree)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent p-4 pointer-events-none">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white hover:text-yellow-500 transition pointer-events-auto"
        >
          <FiArrowLeft size={24} />
          <span className="text-lg font-semibold">Back</span>
        </button>
      </div>

      {/* Video Player Area */}
      <div className="relative w-full bg-gray-900" style={{ paddingTop: '56.25%' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          {isEpisodeUnlocked && videoUrl ? (
            <video
              className="w-full h-full"
              controls
              autoPlay
              controlsList="nodownload"
              poster={content.posterImageUrl}
              src={videoUrl}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center">
              <img 
                src={content.posterImageUrl} 
                alt={content.title}
                className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm"
              />
              <div className="relative z-10 max-w-lg bg-black/80 p-8 rounded-xl border border-gray-800 backdrop-blur-md">
                <FiLock className="mx-auto text-yellow-500 mb-4" size={48} />
                <h2 className="text-2xl font-bold mb-2">
                  {content.contentType === 'Series' ? 'Series Locked' : 'Movie Locked'}
                </h2>
                <p className="text-gray-300 mb-6">
                  Purchase <strong>{content.title}</strong> to watch this content.
                </p>
                
                <div className="flex flex-col gap-3">
                  <div className="text-3xl font-bold text-yellow-500 mb-2">
                    {content.priceInRwf} RWF
                  </div>
                  
                  {wallet ? (
                    <button
                      onClick={handlePurchase}
                      disabled={purchasing || wallet.balance < content.priceInRwf}
                      className="w-full py-3 px-6 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {purchasing ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                      ) : (
                        <>
                          <FiUnlock /> Unlock Now
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full py-3 px-6 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition"
                    >
                      Login to Purchase
                    </button>
                  )}
                  
                  {wallet && wallet.balance < content.priceInRwf && (
                    <p className="text-red-400 text-sm mt-2">
                      Insufficient balance ({wallet.balance} RWF). <span className="underline cursor-pointer" onClick={() => navigate('/profile?tab=wallet')}>Top up</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Info */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {content.contentType === 'Series' && selectedEpisode
              ? `${content.title} - S${selectedSeason}E${selectedEpisode.episodeNumber}: ${selectedEpisode.title}`
              : content.title}
          </h1>
          <p className="text-gray-400">
            {content.contentType === 'Series' && selectedEpisode
              ? selectedEpisode.description
              : content.description}
          </p>
        </div>

        {/* Episodes List for Series */}
        {content.contentType === 'Series' && content.seasons && content.seasons.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Episodes</h2>
              <button
                onClick={() => setShowEpisodes(!showEpisodes)}
                className="text-yellow-500 hover:text-yellow-400"
              >
                {showEpisodes ? 'Hide' : 'Show'}
              </button>
            </div>

            {showEpisodes && (
              <>
                {/* Season Selector */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {content.seasons.map((season) => (
                    <button
                      key={season._id}
                      onClick={() => setSelectedSeason(season.seasonNumber)}
                      className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
                        selectedSeason === season.seasonNumber
                          ? 'bg-yellow-500 text-black'
                          : 'bg-gray-800 text-white hover:bg-gray-700'
                      }`}
                    >
                      Season {season.seasonNumber}
                    </button>
                  ))}
                </div>

                {/* Episodes Grid */}
                <div className="grid gap-4">
                  {content.seasons
                    .find((s) => s.seasonNumber === selectedSeason)
                    ?.episodes.map((episode) => {
                      const isPlaying = selectedEpisode?._id === episode._id
                      const isUnlocked = episode.isFree || episode.isUnlocked || isPurchased

                      return (
                        <div
                          key={episode._id}
                          onClick={() => handleEpisodeSelect(episode, selectedSeason)}
                          className={`flex gap-4 p-4 rounded-lg cursor-pointer transition ${
                            isPlaying
                              ? 'bg-yellow-500/20 border-2 border-yellow-500'
                              : 'bg-gray-800 hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex-shrink-0 w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center text-xl font-bold relative overflow-hidden">
                             {/* Lock Icon Overlay */}
                             {!isUnlocked && (
                               <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                 <FiLock className="text-yellow-500" />
                               </div>
                             )}
                            {episode.episodeNumber}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold truncate">
                                {episode.title}
                              </h3>
                              {isPlaying && (
                                <span className="text-yellow-500 text-sm">Now Playing</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400 line-clamp-2">
                              {episode.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                              <span>{episode.duration} min</span>
                              {!isUnlocked && (
                                <span className="text-yellow-500">• Locked</span>
                              )}
                            </div>
                          </div>
                          {isUnlocked && (
                            <div className="flex items-center">
                              <FiChevronRight className="text-gray-400" size={24} />
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Release Year</div>
            <div className="font-semibold">{content.releaseYear}</div>
          </div>
          <div>
            <div className="text-gray-400">Rating</div>
            <div className="font-semibold">{content.averageRating?.toFixed(1) || 'N/A'}</div>
          </div>
          <div>
            <div className="text-gray-400">Type</div>
            <div className="font-semibold">{content.contentType}</div>
          </div>
          <div>
            <div className="text-gray-400">Duration</div>
            <div className="font-semibold">
              {content.contentType === 'Movie' 
                ? `${content.duration} min`
                : selectedEpisode 
                ? `${selectedEpisode.duration} min`
                : 'N/A'}
            </div>
          </div>
        </div>

        {/* Genres */}
        {content.genres && content.genres.length > 0 && (
          <div className="mt-6">
            <div className="text-gray-400 text-sm mb-2">Genres</div>
            <div className="flex flex-wrap gap-2">
              {content.genres.map((genre) => (
                <span
                  key={genre._id}
                  className="px-3 py-1 bg-gray-800 rounded-full text-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Watch

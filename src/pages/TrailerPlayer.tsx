import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FiX } from 'react-icons/fi'

const TrailerPlayer: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const trailerUrl = searchParams.get('url')
  const title = searchParams.get('title') || 'Trailer'

  useEffect(() => {
    // Prevent body scroll
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return ''
    
    if (url.includes('youtube.com/embed/')) {
      return `${url}${url.includes('?') ? '&' : '?'}autoplay=1&rel=0`
    }
    
    let videoId = ''
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split(/[?&]/)[0] || ''
    } else if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || ''
    } else if (url.includes('youtube.com/shorts/')) {
      videoId = url.split('shorts/')[1]?.split(/[?&]/)[0] || ''
    }
    
    return videoId 
      ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
      : url
  }

  const handleClose = () => {
    navigate(-1)
  }

  if (!trailerUrl) {
    navigate(-1)
    return null
  }

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: '#000',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem'
  }

  const buttonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '1.5rem',
    right: '1.5rem',
    backgroundColor: '#dc2626',
    color: '#fff',
    border: 'none',
    borderRadius: '999px',
    width: '3.5rem',
    height: '3.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
  }

  const titleStyle: React.CSSProperties = {
    position: 'absolute',
    top: '1.5rem',
    left: '1.5rem',
    color: '#fff',
    fontSize: '2rem',
    fontWeight: 700,
    textShadow: '0 2px 10px rgba(0,0,0,0.6)'
  }

  const videoWrapperStyle: React.CSSProperties = {
    width: '90vw',
    maxWidth: '1280px',
    aspectRatio: '16 / 9',
    backgroundColor: '#000'
  }

  const iframeStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    border: 'none',
    borderRadius: '1rem',
    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
    backgroundColor: '#000'
  }

  const hintStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '1.5rem',
    color: '#9ca3af',
    fontSize: '0.9rem'
  }

  return (
    <div style={overlayStyle}>
      <button onClick={handleClose} style={buttonStyle} aria-label="Close trailer">
        <FiX size={28} />
      </button>

      <div style={titleStyle}>{title}</div>

      <div style={videoWrapperStyle}>
        <iframe
          style={iframeStyle}
          src={getYouTubeEmbedUrl(trailerUrl)}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <div style={hintStyle}>Press ESC or click outside to close</div>
    </div>
  )
}

export default TrailerPlayer

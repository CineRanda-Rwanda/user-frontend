import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { Content } from '@/types/content'
import styles from './AnimatedCarousel.module.css'

interface AnimatedCarouselProps {
  items: Content[]
  title?: string
}

const AnimatedCarousel: React.FC<AnimatedCarouselProps> = ({ items, title = 'New Releases' }) => {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(true)
  const intervalRef = useRef<number | null>(null)

  // Debug: Log items to see what we're receiving
  useEffect(() => {
    console.log('AnimatedCarousel items:', items)
    if (items.length > 0) {
      console.log('First item posterImageUrl:', items[0].posterImageUrl)
    }
  }, [items])

  useEffect(() => {
    if (isAnimating && items.length > 0) {
      intervalRef.current = window.setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length)
      }, 4000) // 4 seconds: 2 sec delay + 2 sec for animation
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isAnimating, items.length])

  const handleItemClick = (item: Content) => {
    setIsAnimating(false)
    console.log('Clicked item:', item.title, 'Type:', item.contentType)
    
    // Check both contentType and type field for compatibility
    const type = item.contentType || (item as any).type
    const route = type === 'Movie' ? '/movies' : '/series'
    
    console.log('Navigating to:', route)
    navigate(`${route}?selected=${item._id}`)
  }

  const handleMouseEnter = () => {
    setIsAnimating(false)
  }

  const handleMouseLeave = () => {
    setIsAnimating(true)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
    setIsAnimating(false)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length)
    setIsAnimating(false)
  }

  if (!items || items.length === 0) {
    return null
  }

  // Get visible items: 1 center (primary), rest (secondary)
  const getVisibleItems = () => {
    const result = []

    // Show items from -3 to +3 positions around current
    for (let i = -3; i <= 3; i++) {
      const index = (currentIndex + i + items.length) % items.length
      const item = items[index]
      
      let focusLevel: 'primary' | 'secondary' = 'secondary'
      
      // Primary: Center item only (i === 0)
      if (i === 0) {
        focusLevel = 'primary'
      } 
      // Secondary: All others
      else {
        focusLevel = 'secondary'
      }

      result.push({
        item,
        focusLevel,
        position: i,
        key: `${item._id}-${index}-${currentIndex}` // Unique key for each position
      })
    }

    return result
  }

  const visibleItems = getVisibleItems()
  
  // Get the primary (focused) item for background
  const primaryItem = visibleItems.find(item => item.focusLevel === 'primary')
  const backgroundImage = primaryItem?.item.posterImageUrl || ''

  return (
    <div className={styles.carouselContainer}>
      {/* Dynamic Background */}
      {backgroundImage && (
        <div 
          className={styles.backgroundImage}
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      
      {title && <h2 className={styles.title}>{title}</h2>}
      
      <div 
        className={styles.carousel}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Previous Button */}
        <button
          className={`${styles.navButton} ${styles.prevButton}`}
          onClick={goToPrevious}
          aria-label="Previous"
        >
          <FiChevronLeft />
        </button>

        <div className={styles.track}>
          {visibleItems.map(({ item, focusLevel, position, key }) => (
            <div
              key={key}
              className={`${styles.item} ${styles[focusLevel]}`}
              onClick={() => handleItemClick(item)}
              style={{
                transform: `translateX(${position * 200}px) scale(${
                  focusLevel === 'primary' ? 1.08 : 0.95
                }) translateZ(${
                  focusLevel === 'primary' ? 30 : 0
                }px)`,
                zIndex: focusLevel === 'primary' ? 30 : 20,
                opacity: focusLevel === 'primary' ? 1 : 0.7,
                filter: focusLevel === 'primary' ? 'none' : 'blur(0.5px)'
              }}
            >
              <div className={styles.poster}>
                <img 
                  src={item.posterImageUrl} 
                  alt={item.title}
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = 'https://via.placeholder.com/200x300?text=' + encodeURIComponent(item.title)
                  }}
                />
                <div className={styles.overlay}>
                  <div className={styles.info}>
                    <h3 className={styles.itemTitle}>{item.title}</h3>
                    <span className={styles.type}>{item.contentType}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Next Button */}
        <button
          className={`${styles.navButton} ${styles.nextButton}`}
          onClick={goToNext}
          aria-label="Next"
        >
          <FiChevronRight />
        </button>

        {/* Navigation dots */}
        <div className={styles.dots}>
          {items.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
              onClick={() => {
                setCurrentIndex(index)
                setIsAnimating(false)
              }}
              aria-label={`Go to item ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default AnimatedCarousel

import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { Content } from '@/types/content'
import ContentCard from './ContentCard'
import styles from './ContentRow.module.css'

interface ContentRowProps {
  title: string
  content: Content[]
  viewAllLink?: string
  showBadge?: boolean
  hidePrice?: boolean
}

const ContentRow: React.FC<ContentRowProps> = ({
  title,
  content,
  viewAllLink,
  showBadge = false,
  hidePrice = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 800
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  if (content.length === 0) return null

  return (
    <div className={styles.row}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {viewAllLink && (
          <Link to={viewAllLink} className={styles.viewAll}>
            View All
          </Link>
        )}
      </div>

      <div className={styles.scrollContainer}>
        <button
          className={`${styles.scrollButton} ${styles.left}`}
          onClick={() => scroll('left')}
        >
          <FiChevronLeft />
        </button>

        <div className={styles.grid} ref={scrollRef}>
          {content.map((item) => (
            <ContentCard key={item._id} content={item} showBadge={showBadge} hidePrice={hidePrice} />
          ))}
        </div>

        <button
          className={`${styles.scrollButton} ${styles.right}`}
          onClick={() => scroll('right')}
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  )
}

export default ContentRow

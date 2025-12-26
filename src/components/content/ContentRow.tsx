import React, { useEffect, useRef } from 'react'
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
  autoAdvance?: boolean
  autoAdvanceIntervalMs?: number
}

const ContentRow: React.FC<ContentRowProps> = ({
  title,
  content,
  viewAllLink,
  showBadge = false,
  hidePrice = false,
  autoAdvance = false,
  autoAdvanceIntervalMs = 3500,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isSingle = content.length === 1
  const isFew = content.length > 1 && content.length <= 4

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

  useEffect(() => {
    if (!autoAdvance) return
    if (content.length <= 1) return
    if (isFew) return

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) return

    const el = scrollRef.current
    if (!el) return

    const tick = () => {
      const node = scrollRef.current
      if (!node) return

      const items = Array.from(node.children).filter((child): child is HTMLElement => child instanceof HTMLElement)
      if (items.length <= 1) return

      const maxScrollLeft = Math.max(0, node.scrollWidth - node.clientWidth)
      if (maxScrollLeft <= 0) return

      // Build a list of reachable scroll positions (some cards near the end can have offsetLeft > maxScrollLeft).
      const rawPositions = items
        .map((item) => Math.min(item.offsetLeft, maxScrollLeft))
        .sort((a, b) => a - b)

      // Deduplicate (avoid multiple cards mapping to the same maxScrollLeft).
      const positions: number[] = []
      for (const pos of rawPositions) {
        if (!positions.length || Math.abs(positions[positions.length - 1] - pos) > 2) {
          positions.push(pos)
        }
      }

      if (positions.length <= 1) return

      const current = node.scrollLeft
      let currentIndex = 0
      let bestDistance = Number.POSITIVE_INFINITY
      for (let index = 0; index < positions.length; index += 1) {
        const distance = Math.abs(positions[index] - current)
        if (distance < bestDistance) {
          bestDistance = distance
          currentIndex = index
        }
      }

      const nextIndex = (currentIndex + 1) % positions.length
      node.scrollTo({ left: positions[nextIndex], behavior: 'smooth' })
    }

    const id = window.setInterval(tick, Math.max(1200, autoAdvanceIntervalMs))
    return () => window.clearInterval(id)
  }, [autoAdvance, autoAdvanceIntervalMs, content.length, isFew])

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
        {!isSingle && !isFew && (
          <button
            className={`${styles.scrollButton} ${styles.left}`}
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            type="button"
          >
            <FiChevronLeft />
          </button>
        )}

        <div
          className={`${styles.grid} ${isSingle ? styles.gridSingle : ''} ${isFew ? styles.gridFew : ''}`}
          ref={scrollRef}
          style={
            isFew
              ? ({ ['--content-count' as any]: content.length } as React.CSSProperties)
              : undefined
          }
        >
          {content.map((item) => (
            <ContentCard key={item._id} content={item} showBadge={showBadge} hidePrice={hidePrice} />
          ))}
        </div>

        {!isSingle && !isFew && (
          <button
            className={`${styles.scrollButton} ${styles.right}`}
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            type="button"
          >
            <FiChevronRight />
          </button>
        )}
      </div>
    </div>
  )
}

export default ContentRow

import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Button from '@/components/common/Button'

const NotFound: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold text-white mb-4">404</h1>
        <h2 className="text-3xl font-bold text-white mb-4">{t('notFound.title')}</h2>
        <p className="text-gray-400 mb-8">
          {t('notFound.message')}
        </p>
        <Link to="/browse">
          <Button variant="primary">{t('common.goToBrowse')}</Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFound

import React from 'react'
import { Link } from 'react-router-dom'
import Button from '@/components/common/Button'

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold text-white mb-4">404</h1>
        <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/browse">
          <Button variant="primary">Go to Browse</Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFound

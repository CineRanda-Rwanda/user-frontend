import React from 'react'
import { useParams } from 'react-router-dom'

const Watch: React.FC = () => {
  const { id } = useParams()

  return (
    <div style={{ minHeight: '100vh', background: '#000', padding: '2rem' }}>
      <h1>Watch Page</h1>
      <p>Content ID: {id}</p>
      <p>TODO: Implement video player with controls, progress tracking, and episode selector</p>
    </div>
  )
}

export default Watch

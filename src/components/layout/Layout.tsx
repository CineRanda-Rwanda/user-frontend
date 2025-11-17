import React, { ReactNode } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

interface LayoutProps {
  children: ReactNode
  showFooter?: boolean
}

const Layout: React.FC<LayoutProps> = ({ children, showFooter = true }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  )
}

export default Layout

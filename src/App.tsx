import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { NotificationsProvider } from './contexts/NotificationsContext'
import Loader from './components/common/Loader'
import ScrollToTop from './components/common/ScrollToTop'

// Lazy load pages
const Login = lazy(() => import('./pages/Auth/Login'))
const Register = lazy(() => import('./pages/Auth/Register'))
const Browse = lazy(() => import('./pages/Browse'))
const Movies = lazy(() => import('./pages/Movies'))
const Series = lazy(() => import('./pages/Series'))
const ContentDetails = lazy(() => import('./pages/ContentDetails'))
const Watch = lazy(() => import('./pages/Watch'))
const Search = lazy(() => import('./pages/Search'))
const MyLibrary = lazy(() => import('./pages/MyLibrary'))
const Wallet = lazy(() => import('./pages/Wallet'))
const Profile = lazy(() => import('./pages/Profile'))
const NotificationsPage = lazy(() => import('./pages/Notifications'))
const NotFound = lazy(() => import('./pages/NotFound'))
const TrailerPlayer = lazy(() => import('./pages/TrailerPlayer'))

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <Loader fullScreen text="Loading..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Public Route Component (accessible to all users)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}

// AppRoutes component that uses the auth context
const AppRoutes = () => {
  return (
    <div className="app">
      <ScrollToTop />
      <Suspense fallback={<Loader fullScreen text="Loading..." />}>
        <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Public Home Route */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <Browse />
                </PublicRoute>
              }
            />
            <Route
              path="/browse"
              element={
                <PublicRoute>
                  <Browse />
                </PublicRoute>
              }
            />
            <Route
              path="/home"
              element={
                <PublicRoute>
                  <Browse />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/movies"
              element={
                <PublicRoute>
                  <Movies />
                </PublicRoute>
              }
            />
            <Route
              path="/series"
              element={
                <PublicRoute>
                  <Series />
                </PublicRoute>
              }
            />
            <Route
              path="/content/:id"
              element={
                <PublicRoute>
                  <ContentDetails />
                </PublicRoute>
              }
            />
            <Route
              path="/trailer"
              element={
                <PublicRoute>
                  <TrailerPlayer />
                </PublicRoute>
              }
            />
            <Route
              path="/watch/:id"
              element={
                <ProtectedRoute>
                  <Watch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <PublicRoute>
                  <Search />
                </PublicRoute>
              }
            />
            <Route
              path="/my-library"
              element={
                <ProtectedRoute>
                  <MyLibrary />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallet"
              element={
                <ProtectedRoute>
                  <Wallet />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>

        {/* Toast Notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <AppRoutes />
      </NotificationsProvider>
    </AuthProvider>
  )
}

export default App

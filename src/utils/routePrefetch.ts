type RoutePrefetchFn = () => Promise<unknown>

const stripQueryAndHash = (raw: string) => raw.split('?')[0].split('#')[0]

const prefetchers: Array<{ test: (path: string) => boolean; prefetch: RoutePrefetchFn }> = [
  { test: (p) => p === '/' || p === '/browse' || p === '/home', prefetch: () => import('../pages/Browse') },
  { test: (p) => p === '/movies', prefetch: () => import('../pages/Movies') },
  { test: (p) => p === '/series', prefetch: () => import('../pages/Series') },
  { test: (p) => p === '/search', prefetch: () => import('../pages/Search') },
  { test: (p) => p === '/my-library', prefetch: () => import('../pages/MyLibrary') },
  { test: (p) => p === '/profile', prefetch: () => import('../pages/Profile') },
  { test: (p) => p === '/watch' || p.startsWith('/watch/'), prefetch: () => import('../pages/Watch') },
  { test: (p) => p === '/content' || p.startsWith('/content/'), prefetch: () => import('../pages/ContentDetails') },
  { test: (p) => p === '/trailer', prefetch: () => import('../pages/TrailerPlayer') },

  { test: (p) => p === '/login', prefetch: () => import('../pages/Auth/Login') },
  { test: (p) => p === '/register', prefetch: () => import('../pages/Auth/Register') },
  { test: (p) => p === '/reset-password', prefetch: () => import('../pages/Auth/ResetPassword') },
  { test: (p) => p === '/oauth/google/callback', prefetch: () => import('../pages/Auth/OAuthCallback') },

  { test: (p) => p === '/help', prefetch: () => import('../pages/HelpCenter') },
  { test: (p) => p === '/contact', prefetch: () => import('../pages/Contact') },
  { test: (p) => p === '/faq', prefetch: () => import('../pages/FAQ') },
  { test: (p) => p === '/terms', prefetch: () => import('../pages/Terms') },
  { test: (p) => p === '/notifications', prefetch: () => import('../pages/Notifications') },
  { test: (p) => p === '/payment-failed', prefetch: () => import('../pages/PaymentFailed') },
]

const inFlight = new Map<string, Promise<unknown>>()

export const prefetchRoute = (rawPath: string) => {
  const path = stripQueryAndHash(String(rawPath || ''))
  if (!path) return

  const prefetcher = prefetchers.find((p) => p.test(path))
  if (!prefetcher) return

  if (inFlight.has(path)) return

  const promise = prefetcher
    .prefetch()
    .catch(() => undefined)
    .finally(() => {
      inFlight.delete(path)
    })

  inFlight.set(path, promise)
}

export const prefetchCommonRoutes = () => {
  ;['/movies', '/series', '/search', '/my-library', '/profile', '/help'].forEach(prefetchRoute)
}

import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import Loader from '@/components/common/Loader'
import Button from '@/components/common/Button'
import { useAuth } from '@/contexts/AuthContext'
import { User } from '@/types/user'
import { authAPI, getGoogleRedirectUriForClient } from '@/api/auth'
import styles from './Auth.module.css'

type ParamGetter = (key: string) => string | null

type ExtractedOAuthPayload = {
  token?: string
  refreshToken?: string
  user?: User
  message?: string
  code?: string
}

const tryParseJson = <T,>(raw?: string | null): T | undefined => {
  if (!raw) return undefined

  const attempts: string[] = [raw]

  try {
    const decoded = decodeURIComponent(raw)
    if (decoded !== raw) {
      attempts.push(decoded)
    }
  } catch (error) {
    // Ignore decode failures and try other strategies.
  }

  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    try {
      attempts.push(window.atob(raw))
    } catch (error) {
      // Base64 decoding failed; continue with other attempts.
    }
  }

  for (const value of attempts) {
    try {
      return JSON.parse(value) as T
    } catch (error) {
      // Continue trying other formats.
    }
  }

  return undefined
}

const getValueByPath = (source: Record<string, unknown> | undefined, path: string) => {
  if (!source) return undefined
  return path.split('.').reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[segment]
    }
    return undefined
  }, source)
}

const extractOAuthPayload = (getParam: ParamGetter): ExtractedOAuthPayload => {
  const candidates = ['payload', 'data', 'response', 'auth']
    .map((key) => tryParseJson<Record<string, unknown>>(getParam(key)))
    .filter(Boolean) as Record<string, unknown>[]

  const pickFromCandidates = <T,>(paths: string[]): T | undefined => {
    for (const candidate of candidates) {
      for (const path of paths) {
        const value = getValueByPath(candidate, path)
        if (value !== undefined && value !== null) {
          return value as T
        }
      }
    }
    return undefined
  }

  const token =
    getParam('token') ||
    getParam('accessToken') ||
    pickFromCandidates<string>(['token', 'accessToken', 'data.token', 'data.accessToken'])

  const refreshToken = getParam('refreshToken') || pickFromCandidates<string>(['refreshToken', 'data.refreshToken'])

  const user =
    tryParseJson<User>(getParam('user')) ||
    pickFromCandidates<User>(['user', 'data.user', 'data.data.user'])

  const message = getParam('message') || pickFromCandidates<string>(['message', 'data.message'])

  const code = getParam('code') || undefined

  return {
    token: token || undefined,
    refreshToken: refreshToken || undefined,
    user,
    message: message || undefined,
    code
  }
}

const extractAuthFields = (raw: any) => {
  const token: string | undefined = raw?.token || raw?.data?.token
  const refreshToken: string | undefined = raw?.refreshToken || raw?.data?.refreshToken
  const user: User | undefined = raw?.user || raw?.data?.user
  const message: string | undefined = raw?.message || raw?.data?.message

  return { token, refreshToken, user, message }
}

const OAuthCallback: React.FC = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { completeOAuthLogin } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let redirectTimer: number | undefined
    let isMounted = true

    const finalizeLogin = async () => {
      const searchParams = new URLSearchParams(location.search)
      const hashParams = new URLSearchParams(location.hash.startsWith('#') ? location.hash.slice(1) : '')
      const getParam: ParamGetter = (key) => searchParams.get(key) || hashParams.get(key)

      const reportedError = getParam('error')
      const status = getParam('status')
      if (reportedError || status === 'error') {
        throw new Error(reportedError || getParam('message') || t('auth.oauth.errors.googleFailed'))
      }

      const payload = extractOAuthPayload(getParam)

      // 1) Preferred contract (per Postman): backend returns `code` to the SPA,
      // SPA exchanges it for tokens via POST /auth/google/exchange.
      if (!payload.token && payload.code) {
        const redirectUri = getGoogleRedirectUriForClient()
        const { data } = await authAPI.exchangeGoogleAuthorizationCode({
          code: payload.code,
          redirectUri
        })

        const fields = extractAuthFields(data)
        if (!fields.token) {
          throw new Error(t('auth.oauth.errors.exchangeMissingToken'))
        }

        await completeOAuthLogin({
          token: fields.token,
          refreshToken: fields.refreshToken,
          user: fields.user,
          message: fields.message
        })
        return
      }

      // 2) Also support token-in-URL redirects (some backends do this).
      if (!payload.token) {
        throw new Error(t('auth.oauth.errors.missingSessionToken'))
      }

      await completeOAuthLogin({
        token: payload.token,
        refreshToken: payload.refreshToken,
        user: payload.user,
        message: payload.message
      })
    }

    finalizeLogin().catch((err) => {
      if (!isMounted) return
      const fallback = err instanceof Error ? err.message : t('auth.oauth.errors.couldNotComplete')
      setError(fallback)
      toast.error(fallback)
      redirectTimer = window.setTimeout(() => navigate('/login', { replace: true }), 4000)
    })

    return () => {
      isMounted = false
      if (redirectTimer !== undefined) {
        window.clearTimeout(redirectTimer)
      }
    }
  }, [completeOAuthLogin, location.hash, location.search, navigate, t])

  if (!error) {
    return <Loader fullScreen text={t('auth.oauth.finishing')} />
  }

  return (
    <div className={styles['login-container']}>
      <div className={styles['login-box']}>
        <h2 className={styles.title}>{t('auth.oauth.failedTitle')}</h2>
        <p className={styles['helper-note']}>{error}</p>
        <Button type="button" variant="secondary" fullWidth onClick={() => navigate('/login')}>
          {t('auth.oauth.backToLogin')}
        </Button>
      </div>
    </div>
  )
}

export default OAuthCallback

const normalizeBaseUrl = (value?: string) => String(value || '').trim().replace(/\/$/, '')

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const baseUrl = normalizeBaseUrl(process.env.LIBRETRANSLATE_URL)
  if (!baseUrl) {
    return res.status(500).json({ error: 'LIBRETRANSLATE_URL is not configured' })
  }

  const { q, source, target, format } = (req.body || {}) as {
    q?: unknown
    source?: unknown
    target?: unknown
    format?: unknown
  }

  if (typeof q !== 'string' || !q.trim()) {
    return res.status(400).json({ error: 'Missing q' })
  }

  // Basic payload-size guard for serverless.
  if (q.length > 5000) {
    return res.status(413).json({ error: 'Text too large' })
  }

  const payload = {
    q,
    source: typeof source === 'string' && source.trim() ? source : 'auto',
    target: typeof target === 'string' && target.trim() ? target : 'en',
    format: typeof format === 'string' && format.trim() ? format : 'text',
  }

  try {
    const upstream = await fetch(`${baseUrl}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const text = await upstream.text()

    res.status(upstream.status)
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json')
    return res.send(text)
  } catch (error) {
    return res.status(502).json({ error: 'Translation upstream failed' })
  }
}

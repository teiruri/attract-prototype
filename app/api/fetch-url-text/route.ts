import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

// URLからテキストを取得するAPI
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URLが指定されていません' }, { status: 400 })
    }

    // Validate URL format
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: '無効なURLです' }, { status: 400 })
    }

    // Only allow http/https
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: 'http/https のURLのみ対応しています' }, { status: 400 })
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HRFarm/1.0)',
        'Accept': 'text/html, application/json, text/plain, */*',
      },
    })
    clearTimeout(timeoutId)

    if (!res.ok) {
      return NextResponse.json({ error: `URLの取得に失敗しました (${res.status})` }, { status: 400 })
    }

    const contentType = res.headers.get('content-type') || ''
    let text = ''

    if (contentType.includes('application/json')) {
      const json = await res.json()
      text = JSON.stringify(json, null, 2)
    } else {
      const html = await res.text()
      // Strip HTML tags to get plain text
      text = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, '\n')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    }

    // Limit text length
    const maxLen = 50000
    if (text.length > maxLen) {
      text = text.substring(0, maxLen) + '\n\n[...truncated]'
    }

    return NextResponse.json({ text, url, content_type: contentType })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return NextResponse.json({ error: 'URLの取得がタイムアウトしました' }, { status: 408 })
    }
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

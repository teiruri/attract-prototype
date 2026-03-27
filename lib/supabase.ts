import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

let _client: SupabaseClient | null = null
let _serverClient: SupabaseClient | null = null

function getUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || ''
}

function getAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
}

// ブラウザ用クライアント（@supabase/ssr - cookieベース認証）
export function getSupabase(): SupabaseClient {
  const url = getUrl()
  const key = getAnonKey()
  if (!url || !key || !url.startsWith('http')) {
    throw new Error('Supabase が設定されていません。.env.local に NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。')
  }
  if (!_client) {
    _client = createBrowserClient(url, key) as unknown as SupabaseClient
  }
  return _client
}

// サーバー用クライアント（Service Role Key使用 - RLSバイパス）
export function createServerClient(): SupabaseClient {
  const url = getUrl()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!url || !serviceRoleKey || !url.startsWith('http')) {
    throw new Error('Supabase が設定されていません。.env.local に必要な環境変数を設定してください。')
  }
  if (!_serverClient) {
    _serverClient = createClient(url, serviceRoleKey, {
      auth: { persistSession: false }
    })
  }
  return _serverClient
}

// Supabase設定済みかチェック
export function isSupabaseConfigured(): boolean {
  const url = getUrl()
  const key = getAnonKey()
  return !!(url && key && url.startsWith('http'))
}

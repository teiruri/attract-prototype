import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'signup' | 'email' | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('confirmed', 'true')
      return NextResponse.redirect(redirectUrl)
    }
  }

  const redirectUrl = new URL('/login', request.url)
  redirectUrl.searchParams.set('error', 'confirmation_failed')
  return NextResponse.redirect(redirectUrl)
}

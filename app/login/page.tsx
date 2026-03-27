'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Zap, Eye, EyeOff, ArrowRight, Shield, Sparkles, UserPlus, Loader2 } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const confirmed = searchParams.get('confirmed') === 'true'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  // ログインページ表示時に既存セッションをクリア
  useEffect(() => {
    try {
      const supabase = getSupabase()
      supabase.auth.signOut()
    } catch {
      // ignore
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください')
      return
    }

    setIsLoading(true)

    try {
      const supabase = getSupabase()

      if (mode === 'signup') {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const result = await res.json()
        if (!res.ok) {
          setError(result.error || 'アカウント作成に失敗しました')
          return
        }
        setSuccess('アカウントを作成しました！登録したメールアドレスとパスワードでログインしてください。')
        setMode('login')
        return
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) {
          setError('メールアドレスまたはパスワードが正しくありません')
          return
        }
      }

      window.location.href = '/'
    } catch (err) {
      setError('ログインに失敗しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: Login Form */}
      <div className="flex-1 flex items-center justify-center px-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 leading-tight">HR FARM</p>
              <p className="text-xs text-gray-400 leading-tight">by カケハシスカイ</p>
            </div>
          </div>

          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {mode === 'login' ? 'おかえりなさい' : 'アカウント作成'}
            </h1>
            <p className="text-sm text-gray-500">
              {mode === 'login'
                ? 'アカウントにログインして、採用活動を続けましょう'
                : '新しいアカウントを作成して、HR FARMを始めましょう'}
            </p>
          </div>

          {confirmed && (
            <div className="mb-4">
              <p className="text-sm text-emerald-700 font-medium bg-emerald-50 rounded-xl px-4 py-3">
                メール認証が完了しました。ログインしてください。
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-700">パスワード</label>
                {mode === 'login' && (
                  <button type="button" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                    パスワードを忘れた場合
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-50 text-emerald-700 text-xs px-4 py-3 rounded-xl">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-colors shadow-lg shadow-indigo-200"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <>
                  ログイン
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  アカウントを作成
                </>
              )}
            </button>
          </form>

          {/* Toggle login/signup */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[10px] text-gray-400">または</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
            className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl text-sm transition-colors"
          >
            {mode === 'login' ? (
              <>
                <UserPlus className="w-4 h-4 text-gray-500" />
                新しいアカウントを作成
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 text-gray-500" />
                既存のアカウントでログイン
              </>
            )}
          </button>

          {/* Footer */}
          <p className="text-center text-[10px] text-gray-400 mt-8">
            ログインすることで、利用規約およびプライバシーポリシーに同意したものとみなされます
          </p>
        </div>
      </div>

      {/* Right: Visual */}
      <div className="hidden lg:flex w-[480px] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 items-center justify-center p-12 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-20 -right-16 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/3 rounded-full" />
        </div>

        <div className="relative z-10 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          {/* Headline */}
          <h2 className="text-2xl font-bold text-white mb-4 leading-relaxed">
            AIが採用の
            <br />
            「惹きつけ力」を変える
          </h2>
          <p className="text-sm text-indigo-200 leading-relaxed mb-10">
            候補者一人ひとりのシグナルを読み取り、
            <br />
            最適な魅力の伝え方をAIがオーケストレーション。
            <br />
            内定承諾率の向上を実現します。
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '85%', label: '内定承諾率' },
              { value: '60%', label: '工数削減' },
              { value: '3x', label: '選考速度' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-[10px] text-indigo-200 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

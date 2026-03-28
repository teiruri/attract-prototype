'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { RefreshCw, TrendingUp, TrendingDown, Minus, Users, BarChart3, Target } from 'lucide-react'

interface Factor {
  label: string
  impact: string
  type: 'positive' | 'negative' | 'neutral'
}

interface PredictionData {
  offer_prediction: {
    score: number
    confidence: string
    factors: Factor[]
    stage: string
  }
  acceptance_prediction: {
    score: number
    confidence: string
    factors: Factor[]
  }
  historical_comparison: {
    similar_candidates: number
    offer_rate: number
    acceptance_rate: number
  }
}

function useAnimatedNumber(target: number, duration = 1200): number {
  const [current, setCurrent] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const start = performance.now()
    const from = 0

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(Math.round(from + (target - from) * eased))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return current
}

function CircularGauge({ score, label, size = 120 }: { score: number; label: string; size?: number }) {
  const animatedScore = useAnimatedNumber(score)
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  const color =
    score > 70 ? { stroke: '#10b981', text: 'text-emerald-600', bg: 'text-emerald-50' } :
    score >= 40 ? { stroke: '#f59e0b', text: 'text-amber-600', bg: 'text-amber-50' } :
    { stroke: '#ef4444', text: 'text-red-600', bg: 'text-red-50' }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="8"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${color.text}`}>{animatedScore}%</span>
        </div>
      </div>
      <span className="text-xs font-medium text-gray-600 text-center">{label}</span>
    </div>
  )
}

function ConfidenceBadge({ level }: { level: string }) {
  const config =
    level === '高' ? { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: '信頼度: 高' } :
    level === '中' ? { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: '信頼度: 中' } :
    { bg: 'bg-gray-100 text-gray-500 border-gray-200', label: '信頼度: 低' }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${config.bg}`}>
      <BarChart3 className="w-3 h-3" />
      {config.label}
    </span>
  )
}

function FactorList({ factors }: { factors: Factor[] }) {
  if (factors.length === 0) {
    return <p className="text-xs text-gray-400">データ不足のため予測因子なし</p>
  }

  return (
    <div className="space-y-1">
      {factors.map((f, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          {f.type === 'positive' ? (
            <TrendingUp className="w-3 h-3 text-emerald-500 flex-shrink-0" />
          ) : f.type === 'negative' ? (
            <TrendingDown className="w-3 h-3 text-red-500 flex-shrink-0" />
          ) : (
            <Minus className="w-3 h-3 text-gray-400 flex-shrink-0" />
          )}
          <span className="text-gray-700 flex-1">{f.label}</span>
          <span className={
            f.type === 'positive' ? 'text-emerald-600 font-medium' :
            f.type === 'negative' ? 'text-red-600 font-medium' :
            'text-gray-500'
          }>
            {f.impact}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function PredictionCard({ candidateId }: { candidateId: string }) {
  const [data, setData] = useState<PredictionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPrediction = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/candidates/${candidateId}/prediction`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `HTTP ${res.status}`)
      }
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [candidateId])

  useEffect(() => {
    fetchPrediction()
  }, [fetchPrediction])

  if (loading && !data) {
    return (
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-bold text-gray-900">内定予測・内定承諾予測</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <span className="ml-2 text-xs text-gray-400">予測を計算中...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-bold text-gray-900">内定予測・内定承諾予測</h2>
        </div>
        <p className="text-xs text-red-500 mb-2">予測データの取得に失敗しました</p>
        <button
          onClick={fetchPrediction}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
        >
          再試行
        </button>
      </div>
    )
  }

  if (!data) return null

  const { offer_prediction, acceptance_prediction, historical_comparison } = data

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-bold text-gray-900">内定予測・内定承諾予測</h2>
        </div>
        <button
          onClick={fetchPrediction}
          disabled={loading}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
          title="更新"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stage indicator */}
      <div className="mb-4">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-medium">
          現在: {offer_prediction.stage}
        </span>
      </div>

      {/* Gauges */}
      <div className="flex items-start justify-around mb-4">
        <CircularGauge score={offer_prediction.score} label="内定予測" />
        <CircularGauge score={acceptance_prediction.score} label="内定承諾予測" />
      </div>

      {/* Confidence */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <ConfidenceBadge level={offer_prediction.confidence} />
      </div>

      {/* Factors */}
      <div className="space-y-3 mb-4">
        <div>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">内定予測の要因</p>
          <FactorList factors={offer_prediction.factors} />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">承諾予測の要因</p>
          <FactorList factors={acceptance_prediction.factors} />
        </div>
      </div>

      {/* Historical comparison */}
      {historical_comparison.similar_candidates > 0 && (
        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Users className="w-3 h-3 text-gray-400" />
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              過去の類似候補者
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-lg font-bold text-gray-800">{historical_comparison.similar_candidates}</p>
              <p className="text-[10px] text-gray-500">候補者数</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-lg font-bold text-gray-800">{historical_comparison.offer_rate}%</p>
              <p className="text-[10px] text-gray-500">内定率</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-lg font-bold text-gray-800">{historical_comparison.acceptance_rate}%</p>
              <p className="text-[10px] text-gray-500">承諾率</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

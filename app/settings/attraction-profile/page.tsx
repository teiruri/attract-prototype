'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, Plus, Trash2, CheckCircle2, Save, BarChart3, ArrowRight } from 'lucide-react'
import { companyAttractionProfile } from '@/lib/mock-data'

export default function AttractionProfilePage() {
  const [profile] = useState(companyAttractionProfile)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <h1 className="text-2xl font-bold text-gray-900">企業魅力・採用コンセプト設定</h1>
          </div>
          <p className="text-sm text-gray-500">
            AIのAttract生成の土台となります。ここの設定品質がすべてのAI出力品質を決定します。
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/settings/evp-survey" className="btn-secondary">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            Recruiting-EVP連携
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button onClick={handleSave} className="btn-primary">
            {saved ? (
              <><CheckCircle2 className="w-4 h-4" />保存しました</>
            ) : (
              <><Save className="w-4 h-4" />変更を保存</>
            )}
          </button>
        </div>
      </div>

      {/* EVP Survey Banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">Recruiting-EVPサーベイ連携済み</p>
              <p className="text-xs text-emerald-600">最終連携: 2025年3月10日 ／ 社員42名・退職者8名・候補者15名の回答データから生成</p>
            </div>
          </div>
          <Link href="/settings/evp-survey" className="text-xs text-emerald-700 font-medium hover:text-emerald-800 flex items-center gap-1">
            サーベイ結果を確認 <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div className="space-y-6 max-w-4xl">
        {/* Hiring Concept */}
        <div className="card p-6">
          <h2 className="section-title">採用コンセプト</h2>
          <p className="text-xs text-gray-400 mb-3">
            「なぜこの会社で働くのか」を一言で定義します。AIはこれを軸に訴求を設計します。
          </p>
          <textarea
            defaultValue={profile.hiringConcept}
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
          />
          <p className="text-xs text-indigo-500 mt-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            良い採用コンセプト例: 具体的なエピソード・数字を含み、ターゲットが「これは自分のことだ」と感じられる内容
          </p>
        </div>

        {/* Target Persona */}
        <div className="card p-6">
          <h2 className="section-title">ターゲットペルソナ定義</h2>
          <p className="text-xs text-gray-400 mb-3">
            採用したい人物像を具体的に記述します。AIはシグナルとの照合に使用します。
          </p>
          <textarea
            defaultValue={profile.targetPersona}
            rows={4}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
          />
        </div>

        {/* EVP */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title mb-0">EVP（従業員価値提案）</h2>
              <p className="text-xs text-gray-400 mt-0.5">企業が従業員に提供できる価値を項目別に整理します</p>
            </div>
            <button className="btn-secondary text-xs">
              <Plus className="w-3.5 h-3.5" />
              追加
            </button>
          </div>
          <div className="space-y-3">
            {profile.evp.map((evp, i) => (
              <div key={i} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                <span className="text-xl">{evp.icon}</span>
                <div className="flex-1">
                  <input
                    type="text"
                    defaultValue={evp.category}
                    className="text-sm font-semibold text-gray-800 bg-transparent border-0 border-b border-dashed border-gray-300 focus:outline-none focus:border-indigo-400 w-full mb-1.5 pb-0.5"
                  />
                  <textarea
                    defaultValue={evp.content}
                    rows={2}
                    className="w-full text-sm text-gray-600 bg-transparent border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <button className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Appeal Points */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title mb-0">アピールポイント</h2>
              <p className="text-xs text-gray-400 mt-0.5">候補者に訴求できる具体的な魅力と、それを裏付ける証拠を整理します</p>
            </div>
            <button className="btn-secondary text-xs">
              <Plus className="w-3.5 h-3.5" />
              追加
            </button>
          </div>
          <div className="space-y-3">
            {profile.appealPoints.map((point, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex gap-3 mb-3">
                  <div className="flex-1">
                    <label className="label mb-1 block">アピールポイント</label>
                    <input
                      type="text"
                      defaultValue={point.point}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 mt-6">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mb-3">
                  <label className="label mb-1 block">根拠・エビデンス</label>
                  <input
                    type="text"
                    defaultValue={point.evidence}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="label mb-1 block">対象セグメント（刺さる候補者像）</label>
                  <div className="flex flex-wrap gap-1.5">
                    {point.targetSegments.map((seg, j) => (
                      <span key={j} className="badge bg-indigo-50 text-indigo-600 cursor-pointer hover:bg-red-50 hover:text-red-500 transition-colors">
                        {seg} ×
                      </span>
                    ))}
                    <button className="badge bg-gray-100 text-gray-500 hover:bg-gray-200">
                      <Plus className="w-3 h-3 mr-1" />追加
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Culture Keywords */}
        <div className="card p-6">
          <h2 className="section-title">カルチャーキーワード</h2>
          <p className="text-xs text-gray-400 mb-3">会社の文化・価値観を表すキーワードを設定します。AIがコミュニケーションのトーンを調整します。</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {profile.cultureKeywords.map((kw, i) => (
              <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium cursor-pointer hover:bg-red-50 hover:text-red-500 transition-colors">
                {kw} ×
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="キーワードを追加..."
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button className="btn-secondary text-xs">
              <Plus className="w-3.5 h-3.5" />追加
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={handleSave} className="btn-primary px-8">
            {saved ? (
              <><CheckCircle2 className="w-4 h-4" />保存しました</>
            ) : (
              <><Save className="w-4 h-4" />変更を保存する</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, AlertCircle, GraduationCap, Briefcase, Sparkles } from 'lucide-react'

type HiringType = 'midcareer' | 'newgrad'

export default function NewCandidatePage() {
  const [consentChecked, setConsentChecked] = useState(false)
  const [aiConsentChecked, setAiConsentChecked] = useState(false)
  const [hiringType, setHiringType] = useState<HiringType>('midcareer')
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = () => {
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/candidates" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">候補者を登録</h1>
      </div>

      <div className="max-w-2xl">
        {/* Success Banner */}
        {showSuccess && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">候補者を登録しました</p>
              <p className="text-xs text-emerald-600">デモ版のため実際のデータは保存されません</p>
            </div>
          </div>
        )}

        <div className="card p-6 space-y-5">
          {/* Hiring Type Toggle */}
          <div>
            <h2 className="section-title">採用区分</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setHiringType('midcareer')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${
                  hiringType === 'midcareer'
                    ? 'border-indigo-400 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    hiringType === 'midcareer' ? 'bg-indigo-100' : 'bg-gray-100'
                  }`}>
                    <Briefcase className={`w-5 h-5 ${hiringType === 'midcareer' ? 'text-indigo-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${hiringType === 'midcareer' ? 'text-indigo-900' : 'text-gray-700'}`}>
                      中途採用
                    </p>
                    <p className="text-xs text-gray-400">経験者・キャリア採用</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setHiringType('newgrad')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${
                  hiringType === 'newgrad'
                    ? 'border-pink-400 bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    hiringType === 'newgrad' ? 'bg-pink-100' : 'bg-gray-100'
                  }`}>
                    <GraduationCap className={`w-5 h-5 ${hiringType === 'newgrad' ? 'text-pink-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${hiringType === 'newgrad' ? 'text-pink-900' : 'text-gray-700'}`}>
                      新卒採用
                    </p>
                    <p className="text-xs text-gray-400">2026年卒・学生</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Basic Info */}
          <div className="border-t border-gray-100 pt-5">
            <h2 className="section-title">基本情報</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label mb-1 block">氏名 <span className="text-red-400">*</span></label>
                <input type="text" placeholder="田中 美咲" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="label mb-1 block">メールアドレス <span className="text-red-400">*</span></label>
                <input type="email" placeholder="example@email.com" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="label mb-1 block">電話番号</label>
                <input type="tel" placeholder="090-0000-0000" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="label mb-1 block">流入元</label>
                <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {hiringType === 'newgrad' ? (
                    <>
                      <option>Wantedly（新卒向け）</option>
                      <option>マイナビ</option>
                      <option>リクナビ</option>
                      <option>就活イベント</option>
                      <option>大学キャリアセンター</option>
                      <option>リファラル</option>
                      <option>その他</option>
                    </>
                  ) : (
                    <>
                      <option>LinkedIn スカウト</option>
                      <option>リファラル（社員紹介）</option>
                      <option>Wantedly</option>
                      <option>Indeed</option>
                      <option>エージェント</option>
                      <option>その他</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Mid-career specific fields */}
          {hiringType === 'midcareer' && (
            <div className="border-t border-gray-100 pt-5">
              <h2 className="section-title">キャリア情報</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label mb-1 block">現職企業名</label>
                  <input type="text" placeholder="株式会社○○" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="label mb-1 block">現職役職</label>
                  <input type="text" placeholder="プロダクトマネージャー" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="label mb-1 block">経験年数</label>
                  <input type="number" placeholder="5" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </div>
          )}

          {/* New grad specific fields */}
          {hiringType === 'newgrad' && (
            <div className="border-t border-gray-100 pt-5">
              <h2 className="section-title flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-pink-500" />
                学生情報
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label mb-1 block">大学名 <span className="text-red-400">*</span></label>
                  <input type="text" placeholder="東京大学" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="label mb-1 block">学部・学科</label>
                  <input type="text" placeholder="経済学部 経済学科" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="label mb-1 block">卒業予定年月</label>
                  <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>2026年3月</option>
                    <option>2027年3月</option>
                  </select>
                </div>
                <div>
                  <label className="label mb-1 block">TOEIC スコア</label>
                  <input type="number" placeholder="860" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="col-span-2">
                  <label className="label mb-1 block">インターン経験</label>
                  <input type="text" placeholder="メガベンチャーC（半年・プロダクト企画）" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="col-span-2">
                  <label className="label mb-1 block">課外活動・実績</label>
                  <input type="text" placeholder="プロダクト研究会（代表）、ビジネスコンテスト全国3位" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="col-span-2">
                  <label className="label mb-1 block">就活の軸</label>
                  <textarea
                    rows={2}
                    placeholder="①裁量をもってプロジェクトを動かせる ②ユーザーに近い距離で仕事できる ③グローバルに活躍できる環境"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Job */}
          <div className="border-t border-gray-100 pt-5">
            <h2 className="section-title">応募情報</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label mb-1 block">応募求人 <span className="text-red-400">*</span></label>
                <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {hiringType === 'newgrad' ? (
                    <option>プロダクトマネージャー（新卒2026）</option>
                  ) : (
                    <option>シニアプロダクトマネージャー</option>
                  )}
                </select>
              </div>
              <div>
                <label className="label mb-1 block">担当採用者</label>
                <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>佐藤 彩花</option>
                  <option>前田 真琴</option>
                </select>
              </div>
            </div>
          </div>

          {/* Consent */}
          <div className="border-t border-gray-100 pt-5">
            <h2 className="section-title flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              個人情報の取り扱いに関する同意（必須）
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-xs text-gray-600 leading-relaxed">
              <p className="font-semibold text-gray-800 mb-2">個人情報の利用目的</p>
              <p>収集した個人情報（氏名、連絡先、経歴、面接内容、評価等）は、以下の目的のみに使用します：</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>採用選考の実施および採用可否の判断</li>
                <li>採用後の入社手続き</li>
                <li>AI解析機能による採用支援（候補者カルテ、フィードバック生成等）</li>
              </ul>
              <p className="mt-2">保管期間: 選考終了後1年間（内定承諾者は入社後3年間）。期間経過後は適切な方法で消去します。</p>
            </div>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">
                  上記の個人情報の取り扱いについて、候補者本人から同意を得ています <span className="text-red-400">*</span>
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiConsentChecked}
                  onChange={(e) => setAiConsentChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">
                  AI解析機能（候補者情報の解析・カルテ生成・フィードバック生成）への利用について同意を得ています <span className="text-red-400">*</span>
                </span>
              </label>
            </div>
          </div>

          {/* AI hint */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-indigo-800 mb-0.5">登録後にATTRACT AIが自動で行うこと</p>
              <p className="text-xs text-indigo-600 leading-relaxed">
                候補者を登録すると、最初の面談後にAIシグナル抽出、フィードバックレター生成、Attractプラン策定が利用可能になります。
                企業魅力プロファイルとの照合も自動で実行されます。
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="border-t border-gray-100 pt-5 flex gap-3 justify-end">
            <Link href="/candidates" className="btn-secondary">
              キャンセル
            </Link>
            <button
              disabled={!consentChecked || !aiConsentChecked}
              onClick={handleSubmit}
              className={`btn-primary ${(!consentChecked || !aiConsentChecked) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <CheckCircle2 className="w-4 h-4" />
              候補者を登録する
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

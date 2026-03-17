'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'

export default function NewCandidatePage() {
  const [consentChecked, setConsentChecked] = useState(false)
  const [aiConsentChecked, setAiConsentChecked] = useState(false)

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/candidates" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">候補者を登録</h1>
      </div>

      <div className="max-w-2xl">
        <div className="card p-6 space-y-5">
          {/* Basic Info */}
          <div>
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
                  <option>LinkedIn スカウト</option>
                  <option>リファラル</option>
                  <option>Wantedly</option>
                  <option>Indeed</option>
                  <option>エージェント</option>
                  <option>その他</option>
                </select>
              </div>
              <div>
                <label className="label mb-1 block">現職企業名</label>
                <input type="text" placeholder="株式会社○○" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="label mb-1 block">現職役職</label>
                <input type="text" placeholder="プロダクトマネージャー" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
          </div>

          {/* Job */}
          <div className="border-t border-gray-100 pt-5">
            <h2 className="section-title">応募情報</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label mb-1 block">応募求人 <span className="text-red-400">*</span></label>
                <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>シニアプロダクトマネージャー</option>
                </select>
              </div>
              <div>
                <label className="label mb-1 block">担当採用者</label>
                <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>佐藤 彩花</option>
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

          {/* Submit */}
          <div className="border-t border-gray-100 pt-5 flex gap-3 justify-end">
            <Link href="/candidates" className="btn-secondary">
              キャンセル
            </Link>
            <button
              disabled={!consentChecked || !aiConsentChecked}
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

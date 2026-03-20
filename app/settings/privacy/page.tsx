'use client'

import Link from 'next/link'
import { Shield, Clock, Trash2, CheckCircle2, ChevronRight } from 'lucide-react'

const policySettings = [
  {
    icon: Clock,
    label: '候補者データ保管期間',
    value: '選考終了後1年',
    description: '不採用・辞退の候補者データは選考終了後1年で自動削除されます',
    status: '設定済み',
  },
  {
    icon: CheckCircle2,
    label: '内定承諾者データ',
    value: '入社後3年',
    description: '内定承諾・入社した候補者のデータは入社日から3年間保持されます',
    status: '設定済み',
  },
  {
    icon: Trash2,
    label: '自動削除',
    value: '有効',
    description: '保管期間を超過したデータは毎月1日に自動的に完全削除されます',
    status: '有効',
  },
  {
    icon: Shield,
    label: 'AI解析データ',
    value: '選考期間中のみ保持',
    description: 'AIが生成した解析・スコアリングデータは選考終了と同時に削除されます',
    status: '設定済み',
  },
]

export default function PrivacyPage() {
  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
        <Link href="/settings" className="hover:text-gray-600 transition-colors">設定</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600">プライバシー・個人情報保護設定</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-indigo-500" />
            <h1 className="text-2xl font-bold text-gray-900">プライバシー・個人情報保護設定</h1>
          </div>
          <p className="text-sm text-gray-500">候補者の同意設定・保管期間・削除ポリシーを管理します</p>
        </div>
        <button className="btn-primary">
          <Shield className="w-4 h-4" />
          ポリシーを更新
        </button>
      </div>

      <div className="space-y-6 max-w-4xl">
        {/* Compliance Badge */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">コンプライアンス準拠</p>
              <p className="text-xs text-emerald-600">
                個人情報保護法（2022年改正対応済み） ／ GDPR準拠 ／ 最終監査: 2025年4月15日
              </p>
            </div>
          </div>
        </div>

        {/* Policy Settings Cards */}
        <div className="card p-6">
          <h2 className="section-title">現在のポリシー設定</h2>
          <p className="text-xs text-gray-400 mb-4">候補者データの取り扱いに関する現在の設定です</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {policySettings.map((setting) => {
              const Icon = setting.icon
              return (
                <div key={setting.label} className="p-4 border border-gray-200 rounded-lg hover:border-indigo-200 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <label className="label">{setting.label}</label>
                        <span className="badge bg-emerald-100 text-emerald-600">{setting.status}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">{setting.value}</p>
                      <p className="text-xs text-gray-400">{setting.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Data Handling Summary */}
        <div className="card p-6">
          <h2 className="section-title">データ取り扱いサマリー</h2>
          <p className="text-xs text-gray-400 mb-4">現在のデータ保持状況の概要です</p>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">128</p>
              <p className="text-xs text-gray-500 mt-1">保持中の候補者データ</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-indigo-600">12</p>
              <p className="text-xs text-gray-500 mt-1">今月削除予定</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-emerald-600">100%</p>
              <p className="text-xs text-gray-500 mt-1">同意取得率</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { Bell, Clock, Mail, CheckCircle2, ChevronRight } from 'lucide-react'

const plannedFeatures = [
  {
    icon: Clock,
    title: '面接前日リマインダー',
    description: '面接の前日に担当者と候補者へ自動リマインドメールを送信します',
  },
  {
    icon: Mail,
    title: '合格・通過レター未送付アラート',
    description: '面接後48時間以内に合格・通過レターが送付されていない場合にアラートします',
  },
  {
    icon: Bell,
    title: '候補者ステータス変更通知',
    description: '候補者のステージ移動・ステータス変更時にリアルタイムで通知します',
  },
  {
    icon: CheckCircle2,
    title: '週次サマリーレポート',
    description: '毎週月曜日に採用パイプラインの進捗サマリーをメールで配信します',
  },
]

export default function NotificationsPage() {
  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
        <Link href="/settings" className="hover:text-gray-600 transition-colors">設定</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600">通知設定</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-indigo-500" />
            <h1 className="text-2xl font-bold text-gray-900">通知設定</h1>
          </div>
          <p className="text-sm text-gray-500">メール通知のタイミングと内容を設定します</p>
        </div>
        <span className="badge bg-gray-100 text-gray-500">Phase 2</span>
      </div>

      <div className="space-y-6 max-w-4xl">
        {/* Coming Soon Banner */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6 text-center">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bell className="w-7 h-7 text-indigo-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">通知機能は現在開発中です</h2>
          <p className="text-sm text-gray-500 mb-3">
            より効率的な採用オペレーションを実現するため、<br />
            通知・リマインダー機能を準備しています。
          </p>
          <span className="badge bg-indigo-100 text-indigo-600">
            <Clock className="w-3 h-3" />
            開発予定: 2025年Q3
          </span>
        </div>

        {/* Planned Features */}
        <div className="card p-6">
          <h2 className="section-title">実装予定の機能</h2>
          <p className="text-xs text-gray-400 mb-4">Phase 2で実装予定の通知機能の一覧です</p>

          <div className="space-y-3">
            {plannedFeatures.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{feature.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{feature.description}</p>
                  </div>
                  <span className="badge bg-gray-100 text-gray-400 flex-shrink-0">準備中</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Feedback CTA */}
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">ご要望をお聞かせください</p>
            <p className="text-xs text-gray-400 mt-0.5">
              通知機能に関するご要望がありましたら、フィードバックをお寄せください
            </p>
          </div>
          <button className="btn-secondary">
            フィードバックを送る
          </button>
        </div>
      </div>
    </div>
  )
}

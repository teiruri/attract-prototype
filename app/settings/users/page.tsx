'use client'

import Link from 'next/link'
import { Users, Shield, Plus, Mail, ChevronRight } from 'lucide-react'

const teamMembers = [
  {
    name: '佐藤 彩花',
    role: '採用担当',
    badge: '管理者',
    badgeColor: 'bg-indigo-100 text-indigo-600',
    email: 'a.sato@example.co.jp',
    lastActive: '2025年6月18日',
  },
  {
    name: '前田 真琴',
    role: 'HRBP',
    badge: '編集者',
    badgeColor: 'bg-emerald-100 text-emerald-600',
    email: 'm.maeda@example.co.jp',
    lastActive: '2025年6月17日',
  },
]

const roles = [
  {
    name: '管理者',
    description: 'すべての設定変更、メンバー招待、データ削除が可能です',
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    name: '編集者',
    description: '候補者データの閲覧・編集、Attract生成が可能です。設定変更はできません',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    name: '閲覧者',
    description: '候補者データの閲覧のみ可能です。編集・削除はできません',
    color: 'bg-gray-100 text-gray-500',
  },
]

export default function UsersPage() {
  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
        <Link href="/settings" className="hover:text-gray-600 transition-colors">設定</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600">ユーザー・権限管理</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-indigo-500" />
            <h1 className="text-2xl font-bold text-gray-900">ユーザー・権限管理</h1>
          </div>
          <p className="text-sm text-gray-500">チームメンバーの招待とロールを管理します</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" />
          メンバーを招待
        </button>
      </div>

      <div className="space-y-6 max-w-4xl">
        {/* Members Table */}
        <div className="card p-6">
          <h2 className="section-title">チームメンバー</h2>
          <p className="text-xs text-gray-400 mb-4">現在のチームメンバーと権限の一覧です</p>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">メンバー</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">ロール</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">権限</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">最終アクティブ</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <tr key={member.email} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-indigo-600">{member.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{member.role}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${member.badgeColor}`}>{member.badge}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{member.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role Explanation */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-indigo-500" />
            <h2 className="section-title mb-0">ロール定義</h2>
          </div>
          <p className="text-xs text-gray-400 mb-4">各ロールに割り当てられた権限の概要です</p>

          <div className="space-y-3">
            {roles.map((role) => (
              <div key={role.name} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className={`badge ${role.color} mt-0.5`}>{role.name}</span>
                <p className="text-sm text-gray-600">{role.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

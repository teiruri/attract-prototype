'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Download,
  BarChart3,
  Users,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  Star,
  TrendingUp,
  Zap,
  AlertCircle,
  Info,
} from 'lucide-react'

// カケハシスカイ Recruiting-EVP サーベイ結果（モックデータ）
const SURVEY_RESULTS = {
  surveyName: 'Recruiting-EVP サーベイ 2025年版',
  conductedAt: '2025年2月〜3月',
  respondents: { employees: 42, leavers: 8, candidates: 15, total: 65 },
  updatedAt: '2025-03-10',
  overallScore: 4.2,
  categories: [
    {
      id: 'autonomy',
      name: '裁量と意思決定',
      icon: '🎯',
      score: 4.8,
      maxScore: 5.0,
      highlight: true,
      findings: [
        { text: '入社6ヶ月以内に担当プロダクト領域を持てた社員：91%', type: 'fact' },
        { text: '意思決定の速さを入社理由に挙げた社員：78%', type: 'fact' },
        { text: '「裁量があることで仕事の質が上がった」：89%が同意', type: 'sentiment' },
      ],
      evpDraft: '入社3ヶ月以内に担当プロダクト領域を持ち、ロードマップの策定から施策の優先順位付けまで自分で意思決定できる環境',
      recruitingMessage: '大企業では数年かかる「自分の担当プロダクトを持つ」体験を、弊社では入社3ヶ月以内に実現できます。',
    },
    {
      id: 'ceo_proximity',
      name: '経営との距離感',
      icon: '🤝',
      score: 4.6,
      maxScore: 5.0,
      highlight: true,
      findings: [
        { text: 'CEOとの週次1on1制度：全社員対象', type: 'fact' },
        { text: '全社MTGへの全員参加（週次）：実施率98%', type: 'fact' },
        { text: '入社後「経営の近さに驚いた」と言った社員：82%', type: 'sentiment' },
      ],
      evpDraft: 'CEOとの週1回の1on1と全社MTGへの参加が標準。事業戦略の議論に初日から加われる',
      recruitingMessage: '事業戦略の議論に「入社初日」から参加できる。CEOとの週次1on1は全社員対象です。',
    },
    {
      id: 'product_thinking',
      name: 'プロダクト思考の組織',
      icon: '🧠',
      score: 4.3,
      maxScore: 5.0,
      highlight: false,
      findings: [
        { text: '「エンジニアと対等に議論できる」と感じている社員：87%', type: 'sentiment' },
        { text: 'スプリントレビューへの全職種参加率：94%', type: 'fact' },
        { text: 'PMが主導したロードマップ変更の承認率：91%', type: 'fact' },
      ],
      evpDraft: 'エンジニア・デザイナー全員がプロダクト思考を持ち、PMとの協働スタイルが文化として根付いている',
      recruitingMessage: 'エンジニアもデザイナーも「なぜその機能か？」から議論する文化。PMは対等なパートナーです。',
    },
    {
      id: 'growth',
      name: '成長と学習',
      icon: '📈',
      score: 4.1,
      maxScore: 5.0,
      highlight: false,
      findings: [
        { text: '学習コスト全額会社負担制度：全社員適用', type: 'fact' },
        { text: '外部カンファレンス登壇実績（昨年）：12件', type: 'fact' },
        { text: '「入社後のスキルアップ速度が早い」と感じる社員：79%', type: 'sentiment' },
      ],
      evpDraft: '四半期ごとに全員が「学習目標」を設定し、会社が学習コストを全額負担。外部カンファレンス登壇も奨励',
      recruitingMessage: '学習コストは全額会社負担。外部カンファレンスへの登壇も積極的に支援します。',
    },
    {
      id: 'compensation',
      name: '報酬・処遇',
      icon: '💰',
      score: 3.8,
      maxScore: 5.0,
      highlight: false,
      findings: [
        { text: '年収レンジ：700〜1,100万円（シニアPM）', type: 'fact' },
        { text: '年2回の報酬レビュー：全社員対象', type: 'fact' },
        { text: 'ストックオプション付与：入社6ヶ月後', type: 'fact' },
      ],
      evpDraft: '年収レンジ700〜1,100万円。成果に連動した年2回の報酬レビュー。ストックオプション付与あり',
      recruitingMessage: '年収700〜1,100万円＋ストックオプション。成果に応じて年2回レビューします。',
    },
  ],
}

const IMPORT_MAPPING = [
  { surveyCategory: '裁量と意思決定', evpCategory: '裁量と意思決定', status: 'matched', score: 4.8 },
  { surveyCategory: '経営との距離感', evpCategory: '経営との距離感', status: 'matched', score: 4.6 },
  { surveyCategory: 'プロダクト思考の組織', evpCategory: 'プロダクト思考の組織', status: 'matched', score: 4.3 },
  { surveyCategory: '成長と学習', evpCategory: '成長と学習', status: 'matched', score: 4.1 },
  { surveyCategory: '報酬・処遇', evpCategory: '報酬・処遇', status: 'matched', score: 3.8 },
]

export default function EvpSurveyPage() {
  const [importPhase, setImportPhase] = useState<'idle' | 'importing' | 'done'>('idle')
  const [importStep, setImportStep] = useState(0)
  const [expandedCategory, setExpandedCategory] = useState<string | null>('autonomy')

  const handleImport = async () => {
    setImportPhase('importing')
    setImportStep(0)
    for (let i = 0; i < IMPORT_MAPPING.length; i++) {
      await new Promise((r) => setTimeout(r, 500))
      setImportStep(i + 1)
    }
    await new Promise((r) => setTimeout(r, 300))
    setImportPhase('done')
  }

  const scoreColor = (score: number) =>
    score >= 4.5 ? 'text-emerald-600' : score >= 4.0 ? 'text-blue-600' : score >= 3.5 ? 'text-amber-600' : 'text-red-600'

  const scoreBarColor = (score: number) =>
    score >= 4.5 ? 'bg-emerald-500' : score >= 4.0 ? 'bg-blue-500' : score >= 3.5 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-400">
        <Link href="/settings" className="hover:text-gray-600">設定</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/settings/attraction-profile" className="hover:text-gray-600">企業魅力設定</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700">Recruiting-EVPサーベイ連携</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Recruiting-EVPサーベイ連携</h1>
            <span className="badge bg-emerald-100 text-emerald-700">カケハシスカイ連携</span>
          </div>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            カケハシスカイの「Recruiting-EVPサーベイ」を通じて収集したデータを、HR FARMの企業魅力プロファイルに自動連携します。
            社員・退職者・候補者の回答を基に、証拠に裏付けられたEVPを構築できます。
          </p>
        </div>
        <a
          href="#"
          className="btn-secondary text-xs"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Recruiting-EVPを開く
        </a>
      </div>

      {/* Integration Status Banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl border border-emerald-200 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-bold text-gray-900">{SURVEY_RESULTS.surveyName}</p>
                <span className="badge bg-emerald-100 text-emerald-700">最新データ</span>
              </div>
              <p className="text-xs text-gray-500">
                実施期間: {SURVEY_RESULTS.conductedAt} ／ 回答者: {SURVEY_RESULTS.respondents.total}名（社員{SURVEY_RESULTS.respondents.employees}名・退職者{SURVEY_RESULTS.respondents.leavers}名・候補者{SURVEY_RESULTS.respondents.candidates}名）
              </p>
              <p className="text-xs text-gray-400 mt-0.5">最終更新: {SURVEY_RESULTS.updatedAt}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-2xl font-bold text-gray-900">{SURVEY_RESULTS.overallScore}</span>
                <span className="text-sm text-gray-400">/5.0</span>
              </div>
              <p className="text-xs text-gray-500">総合EVPスコア</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Survey Results */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">サーベイ結果 — EVPカテゴリ別スコア</h2>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Info className="w-3.5 h-3.5" />
              スコアが高いほど「採用訴求力が高い」項目です
            </div>
          </div>

          {SURVEY_RESULTS.categories.map((cat) => (
            <div
              key={cat.id}
              className={`card overflow-hidden ${cat.highlight ? 'ring-2 ring-emerald-400 ring-offset-1' : ''}`}
            >
              <button
                className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
              >
                <span className="text-2xl">{cat.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                    {cat.highlight && (
                      <span className="badge bg-emerald-50 text-emerald-700">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        採用訴求力 最高
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${scoreBarColor(cat.score)}`}
                        style={{ width: `${(cat.score / cat.maxScore) * 100}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold ${scoreColor(cat.score)}`}>{cat.score}</span>
                    <span className="text-xs text-gray-400">/ {cat.maxScore}</span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedCategory === cat.id ? 'rotate-90' : ''}`} />
              </button>

              {expandedCategory === cat.id && (
                <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Findings */}
                    <div>
                      <p className="text-xs font-bold text-gray-700 mb-2">サーベイで判明したこと</p>
                      <div className="space-y-2">
                        {cat.findings.map((finding, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                              finding.type === 'fact' ? 'bg-blue-500' : 'bg-emerald-500'
                            }`} />
                            <p className="text-xs text-gray-600 leading-relaxed">{finding.text}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-3 mt-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />ファクト</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />感情・体験</span>
                      </div>
                    </div>

                    {/* EVP Draft */}
                    <div>
                      <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        HR FARM EVP文（連携先）
                      </p>
                      <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200 mb-3">
                        <p className="text-xs text-indigo-800 leading-relaxed">{cat.evpDraft}</p>
                      </div>
                      <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                        <Users className="w-3 h-3 text-violet-500" />
                        候補者向けメッセージ例
                      </p>
                      <div className="p-3 bg-violet-50 rounded-lg border border-violet-200">
                        <p className="text-xs text-violet-800 leading-relaxed italic">「{cat.recruitingMessage}」</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right: Import Panel */}
        <div className="space-y-4">
          {/* Import CTA */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Download className="w-4 h-4 text-indigo-600" />
              <p className="text-sm font-bold text-gray-900">HR FARMに取り込む</p>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              サーベイ結果をHR FARMの企業魅力プロファイルに反映します。既存のEVP設定はサーベイデータで上書き・強化されます。
            </p>

            {importPhase === 'idle' && (
              <button
                onClick={handleImport}
                className="w-full btn-primary justify-center py-3"
              >
                <Sparkles className="w-4 h-4" />
                EVPデータを取り込む
              </button>
            )}

            {importPhase === 'importing' && (
              <div className="space-y-2">
                {IMPORT_MAPPING.map((m, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 p-2.5 rounded-lg text-xs transition-all ${
                      importStep > i ? 'bg-emerald-50 text-emerald-700' :
                      importStep === i ? 'bg-indigo-50 text-indigo-700' :
                      'bg-gray-50 text-gray-400'
                    }`}
                  >
                    {importStep > i ? (
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    ) : importStep === i ? (
                      <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 border-2 border-gray-300 rounded-full flex-shrink-0" />
                    )}
                    {m.surveyCategory}
                    <ArrowRight className="w-3 h-3 mx-1 flex-shrink-0" />
                    {m.evpCategory}
                  </div>
                ))}
              </div>
            )}

            {importPhase === 'done' && (
              <div>
                <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <p className="text-xs font-bold text-emerald-700">5カテゴリの取り込み完了！</p>
                </div>
                <div className="space-y-1.5 mb-4">
                  {IMPORT_MAPPING.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-emerald-700">
                      <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                      <span>{m.evpCategory}</span>
                      <span className="ml-auto font-bold">{m.score}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Link href="/settings/attraction-profile" className="flex-1 btn-primary justify-center text-xs py-2.5">
                    企業魅力プロファイルを確認
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Benefits */}
          <div className="card p-5 bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200">
            <p className="text-xs font-bold text-indigo-800 mb-3 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Recruiting-EVP連携のメリット
            </p>
            <div className="space-y-2">
              {[
                { title: '証拠に裏付けられたEVP', desc: '実際の社員・退職者・候補者の声から生成されたEVPが採用訴求に使える' },
                { title: 'AI出力の精度が上がる', desc: '通過・内定レターと惹きつけメモの生成品質が大幅に向上' },
                { title: '訴求軸の優先順位が明確に', desc: 'スコアの高い項目から優先的に訴求することで承諾率が上がる' },
              ].map((b, i) => (
                <div key={i} className="p-3 bg-white rounded-lg border border-indigo-100">
                  <p className="text-xs font-semibold text-indigo-800 mb-0.5">{b.title}</p>
                  <p className="text-[11px] text-indigo-600 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Notice */}
          <div className="card p-4 bg-amber-50 border-amber-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-800 mb-1">ご注意</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  取り込み後はHR FARM内のEVP設定を確認・調整してから保存してください。
                  サーベイデータはあくまで叩き台です。実際の採用コンセプトに合わせて編集を推奨します。
                </p>
              </div>
            </div>
          </div>

          {/* Update Schedule */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
              <p className="text-xs font-semibold text-gray-700">次回サーベイ更新</p>
            </div>
            <p className="text-xs text-gray-500">2025年6月（四半期ごとに実施）</p>
            <a href="#" className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-1">
              サーベイ設定を変更
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

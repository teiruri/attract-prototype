import type {
  Candidate,
  CompanyAttractionProfile,
  UploadedDocument,
} from './types'

// ==========================================
// 企業魅力プロファイル
// ==========================================
export const companyAttractionProfile: CompanyAttractionProfile = {
  id: 'cap_001',
  jobId: 'job_001',
  jobTitle: 'シニアプロダクトマネージャー',
  hiringConcept:
    '「意思決定できるPMを、もっと速く」— 大企業で埋もれているプロダクト思考のある人材が、ここでは入社3ヶ月で担当プロダクトを持ち、自らの意思で動かせる。',
  evp: [
    {
      category: '裁量と意思決定',
      content: '入社3ヶ月以内に担当プロダクト領域を持ち、ロードマップの策定から施策の優先順位付けまで自分で意思決定できる環境',
      icon: '🎯',
    },
    {
      category: '経営との距離感',
      content: 'CEOとの週1回の1on1と全社MTGへの参加が標準。事業戦略の議論に初日から加われる',
      icon: '🤝',
    },
    {
      category: 'プロダクト思考の組織',
      content: 'エンジニア・デザイナー全員がプロダクト思考を持ち、PMとの協働スタイルが文化として根付いている',
      icon: '🧠',
    },
    {
      category: '成長と学習',
      content: '四半期ごとに全員が「学習目標」を設定し、会社が学習コストを全額負担。外部カンファレンス登壇も奨励',
      icon: '📈',
    },
    {
      category: '報酬・処遇',
      content: '年収レンジ700〜1,100万円。成果に連動した年2回の報酬レビュー。ストックオプション付与あり',
      icon: '💰',
    },
  ],
  targetPersona:
    '大企業・SIerでITコンサルやPM補佐として3〜8年のキャリアを積んでいるが、意思決定権の少なさや組織の遅さに限界を感じているミドルキャリア層。プロダクトそのものに愛着を持ち、ユーザーのために動きたいという欲求が高い。',
  appealPoints: [
    {
      point: '入社直後からプロダクト担当を持てる',
      evidence: '昨年入社した3名が全員、入社2ヶ月以内に担当領域を持ちロードマップを策定',
      targetSegments: ['裁量重視', '成長重視', '自律志向'],
    },
    {
      point: 'チームの意思決定速度が圧倒的に速い',
      evidence: '機能リリースの意思決定から実装完了まで平均9日（業界平均は6〜8週間）',
      targetSegments: ['スピード重視', '大企業の遅さに不満'],
    },
    {
      point: 'エンジニアが対等なパートナー',
      evidence: 'Retro・Sprint Planningに全員参加、PMの提案を「なぜ？」から議論する文化',
      targetSegments: ['プロダクト思考', 'チームビルディング志向'],
    },
    {
      point: '顧客と直接話せる距離感',
      evidence: 'PM全員が月10件以上のユーザーインタビューを実施。営業同行も自由',
      targetSegments: ['ユーザー志向', '現場重視'],
    },
  ],
  cultureKeywords: ['透明性', '議論文化', '心理的安全性', 'ミッション駆動', 'オーナーシップ', 'フィードバック文化'],
  updatedAt: '2025-03-10',
}

// ==========================================
// 候補者データ
// ==========================================
export const candidates: Candidate[] = [
  // ==========================================
  // 候補者1: 田中 美咲（メインシナリオ）
  // ==========================================
  {
    id: 'cand_001',
    tenantId: 'tenant_001',
    fullName: '田中 美咲',
    email: 'misaki.tanaka@example.com',
    phone: '090-1234-5678',
    source: 'LinkedIn スカウト',
    currentCompany: 'NTTデータ フロンティア株式会社',
    currentTitle: 'ITコンサルタント / PM補佐',
    yearsExperience: 5,
    consentGiven: true,
    consentDate: '2025-02-15',
    createdAt: '2025-02-15',
    avatarInitials: '田中',
    avatarColor: 'bg-violet-500',
    documents: [
      {
        id: 'doc_001',
        candidateId: 'cand_001',
        type: 'resume',
        fileName: '田中美咲_履歴書.pdf',
        fileSize: '245 KB',
        uploadedAt: '2025-02-15',
        uploadedBy: '佐藤 彩花',
        parseStatus: 'parsed',
        parsedData: {
          summary: 'NTTデータ フロンティアにて5年間、ITコンサルタントおよびPM補佐として大規模プロジェクトを推進。プロダクト思考が高く、ユーザー視点での課題解決に長けた人材。PMP・PSPO取得済み。',
          keySkills: ['プロジェクトマネジメント', 'プロダクト企画', 'ユーザーリサーチ', 'アジャイル開発', 'ステークホルダー管理', 'データ分析'],
          careerHistory: [
            { company: 'NTTデータ フロンティア株式会社', role: 'ITコンサルタント / PM補佐', period: '2020年4月〜現在', highlights: ['大手製造業ERPプロジェクト（50名規模）のPMO', '社内新規事業のPM補佐として0→1フェーズを推進', '顧客向けワークショップを年間20回以上ファシリテート'] },
            { company: 'アクセンチュア株式会社（インターン）', role: 'コンサルタント補佐', period: '2019年8月〜2020年2月', highlights: ['DX推進プロジェクトにて業務プロセス分析を担当'] },
          ],
          education: [
            { school: '慶應義塾大学', faculty: '総合政策学部', year: '2020年3月卒' },
          ],
          certifications: ['PMP（Project Management Professional）', 'PSPO（Professional Scrum Product Owner）', 'TOEIC 890点'],
          strengths: ['ユーザー視点での課題抽出力', 'エンジニアとの協働・翻訳力', 'ステークホルダーとの合意形成力', 'データに基づく意思決定'],
          motivationKeywords: ['裁量', '意思決定', 'プロダクト思考', 'スピード感', 'ユーザーリサーチ'],
          attractAngleHints: ['現職では裁量が限定的 → 自社プロダクトを持てる環境が最大の訴求軸', '大企業の意思決定速度に不満 → スピード感のある組織文化を訴求', 'ユーザーリサーチへの強い関心 → 月10件のインタビュー実績で訴求'],
        },
      },
      {
        id: 'doc_002',
        candidateId: 'cand_001',
        type: 'cv',
        fileName: '田中美咲_職務経歴書.pdf',
        fileSize: '380 KB',
        uploadedAt: '2025-02-15',
        uploadedBy: '佐藤 彩花',
        parseStatus: 'parsed',
        parsedData: {
          summary: '大規模ERPプロジェクトのPMOを3年経験後、社内新規事業のPM補佐として0→1フェーズを推進。プロダクト思考とアジャイル手法を実践的に身につけた人材。特にユーザーインタビューの設計・実施に強み。',
          keySkills: ['要件定義', 'ロードマップ策定', 'スプリント設計', 'ユーザーインタビュー設計', 'KPI設計・分析', 'プレゼンテーション'],
          careerHistory: [
            { company: 'NTTデータ フロンティア株式会社', role: 'PM補佐（新規事業）', period: '2023年4月〜現在', highlights: ['社内新規事業の0→1フェーズをPMO→PM補佐として推進', 'ユーザーインタビュー（累計40件以上）の設計・実施・分析', 'ロードマップの策定からMVPリリースまでの管理を担当'] },
            { company: 'NTTデータ フロンティア株式会社', role: 'ITコンサルタント（ERPプロジェクト）', period: '2020年4月〜2023年3月', highlights: ['大手製造業向けERP導入プロジェクト（予算5億円・50名体制）のPMO', '業務プロセス分析・要件定義・ベンダー管理を推進', 'ステークホルダー（部長〜役員クラス）との合意形成をリード'] },
          ],
          education: [{ school: '慶應義塾大学', faculty: '総合政策学部', year: '2020年3月卒' }],
          certifications: ['PMP', 'PSPO'],
          strengths: ['0→1フェーズのプロダクト立ち上げ経験', 'ユーザーインタビュー設計力', '大規模プロジェクトの管理経験'],
          motivationKeywords: ['自律', 'プロダクトオーナーシップ', '仮説検証', 'MVP開発'],
          attractAngleHints: ['新規事業PM補佐の経験 → フルPMとしての裁量拡大を訴求', '大規模→スタートアップへの転換志向 → スピード感を訴求'],
        },
      },
    ],
    applications: [
      {
        id: 'app_001',
        candidateId: 'cand_001',
        jobId: 'job_001',
        jobTitle: 'シニアプロダクトマネージャー',
        currentStage: 'interview_2',
        status: 'active',
        appliedAt: '2025-02-15',
        recruiter: '佐藤 彩花',
        gapAnalysis: {
          matching: [
            {
              point: '裁量と意思決定権の拡大',
              signalEvidence: '「自分の意見が通らない環境に限界」と明言。裁量への渇望が最も強いシグナル',
              matchScore: 98,
            },
            {
              point: 'スピード感のある意思決定',
              signalEvidence: '現職の意思決定の遅さを繰り返し言及。リリースサイクルへの不満が高い',
              matchScore: 92,
            },
            {
              point: 'プロダクト思考の組織文化',
              signalEvidence: '「エンジニアと対等に議論したい」と質問。プロダクト組織への関心が高い',
              matchScore: 87,
            },
          ],
          untold: [
            {
              point: 'ユーザーインタビューへの参加機会',
              recommendation: '二次面接で「月10件のユーザーインタビュー」を具体的に紹介する',
            },
            {
              point: 'ストックオプションの設計',
              recommendation: 'オファーフェーズで詳しく説明。フェアバリュー・行使条件を資料化して提示',
            },
          ],
          concernResponses: [
            {
              concern: 'スタートアップの事業継続リスク',
              response: '直近の資金調達状況・ARR成長率・主要顧客リストをデータで提示する。CFOとの面談設定も検討',
            },
            {
              concern: '現職より給与が下がる可能性',
              response: '現職年収を確認した上で、ストックオプション込みのトータルコンペンセーションで提示',
            },
          ],
        },
        attractStrategy: {
          id: 'ast_001',
          coreAngle: '裁量と意思決定速度',
          coreAngleRationale:
            '田中さんの最も強いシグナルは「自分の意見が通らない・意思決定が遅い」への不満。弊社の「入社3ヶ月でプロダクト担当を持てる」環境と、リリースサイクルの速さが最も刺さる訴求軸。',
          subAngles: [
            'エンジニアと対等なプロダクト組織',
            '経営との近さ・戦略への参画',
            'ユーザーと直接話せる環境',
          ],
          concernsToAddress: [
            {
              concern: '事業継続リスク',
              approach: '数値（ARR・顧客数・資金状況）で安心感を提供。CFO面談設定を検討',
            },
            {
              concern: '給与水準',
              approach: 'ストックオプション込みのトータルパッケージで提示。現職+αを明確に',
            },
          ],
          stepwiseApproach: [
            {
              step: 'カジュアル面談（済）',
              focus: '不満と志向の掘り起こし。裁量・スピードへの期待を確認',
            },
            {
              step: '一次面接（済）',
              focus: '担当領域・意思決定権の具体的事例を紹介。プロダクト思考の深さを確認',
            },
            {
              step: '二次面接（次回）',
              focus: 'CEO・役員との対話で「経営との距離感」を体感させる。懸念（リスク）への回答を準備',
            },
            {
              step: 'オファー',
              focus: 'トータルコンペンセーション提示。志向に響く個別オファーレターで承諾率を高める',
            },
          ],
          competitorDiff:
            '競合A社（大手SaaS）と比較した際の差別化：規模ではなく「自分の意思が直接プロダクトに反映される体験」を訴求。A社では担当持つまで1〜2年かかることを間接的に伝える。',
          generatedAt: '2025-03-05',
          version: 2,
        },
        candidateCard: {
          id: 'cc_001',
          version: 2,
          profileSummary:
            'NTTデータ系SIerでITコンサルタント・PM補佐として5年のキャリア。プロダクト思考が高く、ユーザー視点の発言が多い。現職での裁量のなさ・意思決定の遅さへの不満が強いモチベーター。論理的かつ熱量のある候補者で、面接官への質問の鋭さが際立つ。',
          careerHighlights: [
            '大手製造業向けERPのPMO経験（3年）— 50名規模のプロジェクト管理',
            '社内新規事業のPM補佐として0→1フェーズを経験',
            'PMP資格・PSPO取得済み',
          ],
          impressionByStage: [
            {
              stage: 'カジュアル面談',
              impression: '現職への不満が明確。裁量と速度への渇望が強いが、ネガティブな印象はなく前向き。志望動機の解像度は高い。',
            },
            {
              stage: '一次面接',
              impression: 'プロダクト思考の深さが確認できた。「なぜその機能か？」の問いへの答えがユーザー視点で一貫しており、即戦力感が高い。懸念は事業リスクへの言及が増えたこと。',
            },
          ],
          recommendation: 'strong_yes',
          hiringScore: 91,
          bestAttractAngle: '入社直後からプロダクト担当を持ち、自分の意思でロードマップを動かせること',
          remainingConcerns: [
            '事業継続性・資金状況への不安（数値で払拭必要）',
            '給与が現職を下回る可能性（ストックオプション含めたパッケージ説明で対処）',
          ],
          offerRecommendation:
            '年収900〜950万円 + SO付与を提案。入社後の担当プロダクト領域を明示した上でオファーを提示することで、「単なる条件提示」ではなくキャリアビジョンの提案として受け取ってもらう。',
          generatedAt: '2025-03-08',
        },
        interviews: [
          // ==============================
          // カジュアル面談（完了）
          // ==============================
          {
            id: 'int_001',
            applicationId: 'app_001',
            stage: 'casual',
            stageLabel: 'カジュアル面談',
            scheduledAt: '2025-02-20 14:00',
            conductedAt: '2025-02-20 14:00',
            format: 'online',
            interviewers: ['佐藤 彩花（採用担当）'],
            status: 'completed',
            evaluation: {
              overallScore: 4,
              skillScore: 3,
              cultureFitScore: 4,
              potentialScore: 5,
              comment:
                '現職での不満が具体的で、弊社に求めているものが明確。プロダクトへの愛着と熱量を強く感じた。スキルの深さは次回確認が必要だが、カルチャーフィットは高いと判断。',
              concerns: '事業リスクについての言及が少しあった。次回以降で払拭が必要。',
              recommendation: 'yes',
              submittedBy: '佐藤 彩花',
              submittedAt: '2025-02-20 16:00',
            },
            signal: {
              id: 'sig_001',
              interviewId: 'int_001',
              stageLabel: 'カジュアル面談',
              careerValues: [
                {
                  value: '裁量・意思決定権',
                  strength: 'high',
                  evidence: '「自分のアイデアを通せる環境が一番大事。今の会社では上司の承認に3ヶ月かかる」と発言',
                },
                {
                  value: '成長速度・学習環境',
                  strength: 'high',
                  evidence: '「3年後に自分がどう成長できるかを重視している」と明言',
                },
                {
                  value: '安定性・会社規模',
                  strength: 'low',
                  evidence: 'リスクについての質問はあったが、決定要因にはしていない様子',
                },
              ],
              interests: [
                'プロダクト戦略の立案',
                'ユーザーリサーチ・インタビュー',
                'エンジニアチームとの協働',
                '新規機能のGo-to-Market設計',
              ],
              concerns: [
                {
                  concern: 'スタートアップの事業継続リスク',
                  severity: 'medium',
                  response: '次回以降、財務状況と成長数値で払拭予定',
                },
              ],
              positiveReactions: [
                {
                  topic: '入社直後からプロダクト担当を持てる話',
                  description: '「えっ、本当ですか？」と前のめりになり、具体的にどの領域かを質問してきた',
                },
                {
                  topic: 'CEOとの週1回の1on1',
                  description: '「それは魅力的ですね」と笑顔になり、経営陣の考え方について深掘りの質問をしてきた',
                },
              ],
              questionsAsked: [
                '入社後、最初にどのプロダクト領域を担当することになりますか？',
                '今一番リソースを集中しているプロダクト課題はなんですか？',
                'PMとエンジニアの関係性はどんな感じですか？PMが偉いとかはないですか？',
                '成長している実感は社員の皆さんが感じているか気になります',
              ],
              energyLevel: 5,
              overallNote: '非常に高い熱量。質問の角度が鋭く、自分でしっかり考えていることが伝わる。ぜひ次のステップへ。',
              source: 'manual',
              createdAt: '2025-02-20',
            },
            feedbackLetter: {
              id: 'fl_001',
              interviewId: 'int_001',
              stageLabel: 'カジュアル面談',
              type: 'stage_pass',
              subject: '【テクノベーション株式会社】カジュアル面談の御礼と次のステップについて',
              salutation: '田中 美咲 様',
              passReasonSection:
                '本日はお時間をいただきありがとうございました。面談を通じて、田中さんのプロダクトへの強い思いと、ユーザーのために動きたいという姿勢が非常に印象的でした。特に、「アイデアを実際に形にできる環境」を重視されているお考えは、私たちが採用で大切にしている価値観と深く重なると感じています。',
              passReasons: [
                'プロダクトの本質的な価値に対して明確な考えをお持ちで、ユーザー視点のコメントが随所に見られた',
                '現職での経験（PMO・PM補佐）から得た学びを、次のステップでどう活かすかを具体的に語られていた',
                '質問の切り口が鋭く、弊社の課題や組織に対して真剣に向き合ってくださっているのが伝わった',
              ],
              attractSection:
                '田中さんが大切にされている「自分の意思でプロダクトを動かせる環境」について、もう少しお伝えさせてください。弊社では、入社2〜3ヶ月以内に担当プロダクト領域をアサインし、ロードマップの策定から施策の優先順位付けまで、PMが主体的に意思決定します。昨年入社した松田（元SIer）も、入社1.5ヶ月で担当プロダクトを持ち、今では週次でCEOと戦略を議論しています。田中さんがご質問くださった「PMとエンジニアの関係性」についても、次回の面接でエンジニアリングリードに直接お話しいただく機会を設けたいと考えています。',
              nextStepSection:
                '次のステップとして、一次面接をご案内したいと思います。弊社のプロダクト責任者・CPOとエンジニアリングリードがご参加し、田中さんのプロダクト思考や具体的な経験について、より深くお話しできればと思っています。',
              closing:
                '田中さんとお会いできることを、チーム一同楽しみにしています。ご都合の良い日程をいくつかお知らせいただけますでしょうか。',
              status: 'sent',
              generatedAt: '2025-02-20',
              reviewedAt: '2025-02-20',
              sentAt: '2025-02-21',
            },
            handoffNotes: [
              '裁量・意思決定速度が最優先事項。「入社直後から担当持てる」話に最も反応した',
              '事業継続リスクへの懸念あり → 一次面接でCFO・数値資料を準備して払拭',
              'PMとエンジニアの対等な関係に関心が高い → エンジニアとの質疑機会を設ける',
              '「3年後の自分」視点で考えている → 成長ロードマップを具体的に示す',
            ],
          },
          // ==============================
          // 一次面接（完了）
          // ==============================
          {
            id: 'int_002',
            applicationId: 'app_001',
            stage: 'interview_1',
            stageLabel: '一次面接',
            scheduledAt: '2025-02-28 15:00',
            conductedAt: '2025-02-28 15:00',
            format: 'online',
            interviewers: ['山田 CPO', '中村 エンジニアリングリード'],
            status: 'completed',
            evaluation: {
              overallScore: 5,
              skillScore: 4,
              cultureFitScore: 5,
              potentialScore: 5,
              comment:
                'プロダクト思考の深さが確認できた。「なぜその機能を優先するか？」の問いに対して、定量的根拠とユーザー行動の観点から答えられており、即戦力レベル。エンジニアとのディスカッションでも対等に意見を述べており、協働できる人材だと確信。ぜひ次のステップへ進めたい。',
              concerns:
                '事業リスクについての質問が2回あった。財務状況と成長トラクションを次回までに資料化して提示したい。',
              recommendation: 'strong_yes',
              submittedBy: '山田 CPO',
              submittedAt: '2025-02-28 17:30',
            },
            signal: {
              id: 'sig_002',
              interviewId: 'int_002',
              stageLabel: '一次面接',
              careerValues: [
                {
                  value: '裁量・意思決定権',
                  strength: 'high',
                  evidence: '「最終的にPMが意思決定できるんですね」と確認し、嬉しそうにメモを取っていた',
                },
                {
                  value: 'プロダクト思考の組織',
                  strength: 'high',
                  evidence: 'エンジニアとの議論パートで非常に活性化。「こういう議論ができる環境が理想です」と発言',
                },
                {
                  value: 'ユーザーとの距離感',
                  strength: 'high',
                  evidence: 'ユーザーインタビューの頻度を聞いて「月10件ですか！それはすごい」と反応',
                },
              ],
              interests: [
                'プロダクトロードマップの策定プロセス',
                'ユーザーインタビューの設計・実施',
                'スプリント設計・開発との協働',
                '競合分析とポジショニング戦略',
              ],
              concerns: [
                {
                  concern: '事業の資金調達・継続性',
                  severity: 'high',
                  response: '二次面接でCFO・代表から直接説明。財務サマリーを事前共有予定',
                },
                {
                  concern: '既存プロダクトの技術的負債',
                  severity: 'low',
                  response: 'エンジニアから現状を率直に説明済み。納得してもらった様子',
                },
              ],
              positiveReactions: [
                {
                  topic: 'ロードマップ策定事例の紹介',
                  description: '具体的なロードマップ画面を見せた際、非常に食いついてきた。「こういう粒度で議論するんですね」と興奮気味',
                },
                {
                  topic: 'ユーザーインタビュー月10件の話',
                  description: '「現職では年2回のアンケートしかない」と比較し、明確にポジティブな反応',
                },
              ],
              questionsAsked: [
                '直近のシリーズ調達はいつで、ランウェイはどのくらいですか？',
                '今フォーカスしているARRの目標と進捗を教えてもらえますか？',
                'PMのKPIはどう設定されていますか？OKRですか？',
                '入社後の最初の3ヶ月でどんなことを期待しますか？',
                'エンジニアからPMへのフィードバックはどういう形でありますか？',
              ],
              energyLevel: 5,
              overallNote: '一次面接でここまでのフィット感は珍しい。懸念は事業リスクのみで、次回でしっかり払拭できれば確度は非常に高い。',
              source: 'manual',
              createdAt: '2025-02-28',
            },
            feedbackLetter: {
              id: 'fl_002',
              interviewId: 'int_002',
              stageLabel: '一次面接',
              type: 'stage_pass',
              subject: '【テクノベーション株式会社】一次面接の結果と次のステップについて',
              salutation: '田中 美咲 様',
              passReasonSection:
                '先日は一次面接にお越しいただきありがとうございました。山田・中村との面接後、チームで時間をかけて話し合いました。田中さんが一次面接を通過されたことをお伝えします。',
              passReasons: [
                '「なぜその機能を優先するか」という問いへの回答が、ユーザー行動の観点と定量データを組み合わせており、プロダクト思考の深さが際立っていました',
                'エンジニアの中村との議論で、技術的制約を踏まえながら代替案を即座に提案するアジリティが印象的でした',
                '質問の密度と角度から、弊社のプロダクトと組織に対して真剣に向き合ってくださっていることが伝わりました',
              ],
              attractSection:
                '田中さんがご質問くださった事業の成長状況について、次の面接では代表の坂本から直接お話しする機会を設けます。また、田中さんが興味を持ってくださった「ユーザーインタビューの設計」については、入社後すぐに既存のユーザーパネルにアクセスいただけます。先月だけで弊社PMチームは28件のインタビューを実施しており、田中さんが希望されるユーザー起点のプロダクト開発が日常的に行われています。',
              nextStepSection:
                '次のステップとして、代表の坂本と、事業責任者の前田との最終面接をご案内します。今回より少し踏み込んで、田中さんが入社後にどんなプロダクト課題に取り組むか、具体的なビジョンをお互いに話し合う場にしたいと考えています。',
              closing:
                '田中さんのご参加を心よりお待ちしています。改めて、素晴らしい時間をありがとうございました。',
              status: 'reviewed',
              generatedAt: '2025-03-01',
              reviewedAt: '2025-03-01',
            },
            handoffNotes: [
              '【重要】事業継続リスクへの懸念が高まっている。二次面接前に財務サマリー資料を候補者に送付すること',
              '「入社後の最初の3ヶ月で何を期待するか」を質問→ 坂本代表から具体的な期待値を話してもらう',
              'ユーザーインタビュー月10件に非常に好反応 → 具体的な事例（先月28件）を次回も使う',
              'PMのKPI・OKR設計に関心あり → 実際のOKRシートを見せるか、前田事業責任者から説明',
              '競合A社も選考が進んでいると示唆 → スピード感を持ってオファーまで持っていく',
            ],
          },
          // ==============================
          // 二次面接（予定）
          // ==============================
          {
            id: 'int_003',
            applicationId: 'app_001',
            stage: 'interview_2',
            stageLabel: '二次面接（役員面接）',
            scheduledAt: '2025-03-15 14:00',
            format: 'offline',
            interviewers: ['坂本 代表取締役CEO', '前田 事業責任者'],
            status: 'scheduled',
            attractPlan: {
              id: 'ap_001',
              interviewId: 'int_003',
              continuityNotes: [
                '【引き継ぎ①】事業継続リスクへの懸念が高まっている（2回言及）→ 面接冒頭で坂本代表から財務状況・ARR成長を先手で共有すること',
                '【引き継ぎ②】「入社後の最初の3ヶ月で何を期待するか？」を田中さんが質問している → 前田から具体的なオンボーディングプランと初期担当領域を提示',
                '【引き継ぎ③】ユーザーインタビューへの強い関心 → 先月の実績（28件）を数字で伝え、入社後に参加できる既存ユーザーパネルを紹介',
                '【引き継ぎ④】競合A社も選考が進んでいる模様 → 今回でほぼ意思決定に影響する面接。熱量を持って向き合うこと',
              ],
              keyMessages: [
                {
                  message: '「田中さんが入社したら、○○プロダクトの担当になってほしい」と具体的に伝える',
                  rationale: '田中さんの最大関心事は「入社後に自分が何者になれるか」。抽象的な期待値ではなく、具体的な担当領域を提示することで一歩踏み込んだコミットメントを示せる',
                  signalBasis: '一次面接「入社後の最初の3ヶ月で何を期待しますか？」の質問から',
                },
                {
                  message: '弊社の意思決定速度を「数字と体験」で伝える',
                  rationale: 'スピード感への期待が最も強いシグナル。「平均9日でリリース」という数字に加え、坂本代表が実際の意思決定シーンを話すと体感につながる',
                  signalBasis: 'カジュアル面談・一次面接を通じて一貫して「速さ」へのシグナルが強い',
                },
                {
                  message: '事業の成長トラクションを先手でオープンに共有する',
                  rationale: '懸念を放置すると承諾阻害要因になる。坂本代表が「隠さずに話す」姿勢を見せることで、逆に信頼を高める機会にできる',
                  signalBasis: '一次面接で資金調達・ランウェイについて2回質問あり',
                },
              ],
              talkTracks: [
                {
                  scenario: '面接冒頭（坂本代表からの導入）',
                  script:
                    '「田中さん、今日はお越しいただきありがとうございます。前回、資金状況について質問をいただいていましたよね。それ、すごく大事な質問だと思っているので、冒頭でオープンにお話しさせてください。直近の状況をお伝えすると...（ARR・成長率・ランウェイを共有）。隠さず話すのが弊社のスタイルです。」',
                },
                {
                  scenario: '田中さんの担当領域の提示（前田から）',
                  script:
                    '「田中さんに入社いただいた場合、最初にお任せしたいのは○○プロダクトの担当です。具体的には...（ロードマップ・課題を共有）。田中さんがカジュアル面談で話されていた「自分の意思でプロダクトを動かしたい」というのが、まさにここで実現できると考えています。」',
                },
                {
                  scenario: '競合比較の質問が来た場合',
                  script:
                    '「他社との比較は当然していただきたいですし、私たちも比べてもらって構いません。一つだけお伝えすると、弊社でのPMは、入社数ヶ月でロードマップを自分で持ちます。他社で同じことができるまでにかかる時間を、田中さん自身で比べてみてください。」',
                },
              ],
              questionsToAsk: [
                '今のキャリアで「もっとこうできたら」と感じていることは何ですか？（自己成長の観点を深掘り）',
                '田中さんにとって、「良いプロダクトチーム」の定義はどんなイメージですか？',
                '入社を決めるとしたら、何が決め手になりそうですか？（懸念の最終確認）',
              ],
              contentToSend: [
                '面接前日に送付：事業概要・ARR成長率・主要顧客リストの資料（PDF）',
                '面接前日に送付：入社後の担当プロダクト概要（1ページ）',
              ],
              openingMessage:
                '坂本代表より：「田中さん、本日はお越しいただきありがとうございます。前回のご質問を踏まえて、今日はより率直にお話しできればと思っています。まず私から、事業の現状を正直にお伝えさせてください。」',
              generatedAt: '2025-03-08',
              status: 'confirmed',
            },
          },
        ],
      },
    ],
  },

  // ==========================================
  // 候補者2: 山本 健太
  // ==========================================
  {
    id: 'cand_002',
    tenantId: 'tenant_001',
    fullName: '山本 健太',
    email: 'kenta.yamamoto@example.com',
    phone: '090-9876-5432',
    source: 'リファラル（社員紹介）',
    currentCompany: 'スタートアップX株式会社',
    currentTitle: 'エンジニアリングマネージャー',
    yearsExperience: 8,
    consentGiven: true,
    consentDate: '2025-01-20',
    createdAt: '2025-01-20',
    avatarInitials: '山本',
    avatarColor: 'bg-emerald-500',
    applications: [
      {
        id: 'app_002',
        candidateId: 'cand_002',
        jobId: 'job_001',
        jobTitle: 'シニアプロダクトマネージャー',
        currentStage: 'final',
        status: 'active',
        appliedAt: '2025-01-20',
        recruiter: '佐藤 彩花',
        interviews: [
          {
            id: 'int_004',
            applicationId: 'app_002',
            stage: 'casual',
            stageLabel: 'カジュアル面談',
            scheduledAt: '2025-01-25 11:00',
            conductedAt: '2025-01-25 11:00',
            format: 'online',
            interviewers: ['佐藤 彩花（採用担当）'],
            status: 'completed',
            evaluation: {
              overallScore: 4,
              skillScore: 5,
              cultureFitScore: 3,
              potentialScore: 4,
              comment: 'エンジニアリング経験が豊富で技術的素養は申し分ない。PMへの転向希望は本物だが、プロダクト思考の深さはまだ確認が必要。',
              concerns: 'カルチャーフィットはもう少し確認が必要。EM→PMへのモチベーションの深さを次回確認。',
              recommendation: 'yes',
              submittedBy: '佐藤 彩花',
              submittedAt: '2025-01-25 13:00',
            },
            signal: {
              id: 'sig_003',
              interviewId: 'int_004',
              stageLabel: 'カジュアル面談',
              careerValues: [
                { value: 'プロダクトへの直接関与', strength: 'high', evidence: '「コードより製品全体の価値を考える仕事がしたい」と明言' },
                { value: 'チームビルディング', strength: 'high', evidence: '「良いチームを作ることが自分の強み」と強調' },
                { value: '技術的深さ', strength: 'medium', evidence: '技術的な話になると饒舌になる傾向あり' },
              ],
              interests: ['プロダクト戦略', 'エンジニアとの協働設計', 'チームOKR設計'],
              concerns: [{ concern: 'PM未経験でのキャッチアップ不安', severity: 'medium' }],
              positiveReactions: [
                { topic: 'エンジニアとPMが対等に議論する文化', description: '「それは自分に向いている環境だと思う」と明確にポジティブ' },
              ],
              questionsAsked: [
                'EMからPMに転向した社員はいますか？',
                'エンジニア出身のPMはどんな強みが活きていますか？',
              ],
              energyLevel: 4,
              overallNote: '技術力を活かしたPMとして大きなポテンシャル。EM→PM転換のモチベーションをさらに深掘りが必要。',
              source: 'manual',
              createdAt: '2025-01-25',
            },
            feedbackLetter: {
              id: 'fl_003',
              interviewId: 'int_004',
              stageLabel: 'カジュアル面談',
              type: 'stage_pass',
              subject: '【テクノベーション株式会社】面談の御礼と次のステップについて',
              salutation: '山本 健太 様',
              passReasonSection: '本日はお時間をいただきありがとうございました。山本さんのエンジニアリング経験とチームビルディングへの深い知見が、プロダクト組織にとって大きな強みになると感じました。',
              passReasons: [
                'エンジニアリングの実務知識をプロダクト意思決定に活かせる稀有な視点をお持ちです',
                'チームのパフォーマンスを高めることへの情熱が伝わり、弊社の文化と重なりました',
              ],
              attractSection: '山本さんがご関心を持ってくださった「EMからPMへの転向」については、実際に弊社にEM出身のPMが2名おり、次回の面接でお引き合わせできればと思います。エンジニアリング知識を活かしたプロダクト意思決定が、弊社では日常的に起きています。',
              nextStepSection: '次のステップとして、弊社CPOの山田との一次面接をご案内します。',
              closing: '引き続きよろしくお願いいたします。',
              status: 'sent',
              generatedAt: '2025-01-25',
              reviewedAt: '2025-01-25',
              sentAt: '2025-01-26',
            },
          },
          {
            id: 'int_005',
            applicationId: 'app_002',
            stage: 'interview_1',
            stageLabel: '一次面接',
            scheduledAt: '2025-02-05 15:00',
            conductedAt: '2025-02-05 15:00',
            format: 'online',
            interviewers: ['山田 CPO'],
            status: 'completed',
            evaluation: {
              overallScore: 4,
              skillScore: 5,
              cultureFitScore: 4,
              potentialScore: 5,
              comment: 'プロダクト思考の解像度が想定以上に高かった。EMとしてのユーザー視点の高さが際立つ。最終面接へ進めたい。',
              concerns: '特になし。',
              recommendation: 'strong_yes',
              submittedBy: '山田 CPO',
              submittedAt: '2025-02-05 17:00',
            },
            signal: {
              id: 'sig_004',
              interviewId: 'int_005',
              stageLabel: '一次面接',
              careerValues: [
                { value: 'プロダクトと技術の橋渡し', strength: 'high', evidence: '「自分の強みはエンジニアとPMの翻訳ができること」と語った' },
                { value: '組織設計への関与', strength: 'high', evidence: 'チームのOKR設計やピープルマネジメントへの強い関心' },
              ],
              interests: ['エンジニア組織とPMの協働設計', 'プロダクトのKPI設計', 'スクラム・アジャイルの高度化'],
              concerns: [{ concern: '給与レンジ（現職比較）', severity: 'low' }],
              positiveReactions: [
                { topic: 'PM全員がエンジニアリングの素養を持つ採用方針', description: '「それは理想的」と前のめりに反応' },
              ],
              questionsAsked: [
                '入社後のオンボーディングはどんな設計ですか？',
                '他のPMのバックグラウンドを教えてください',
                'プロダクトのKPIはどのように設定されていますか？',
              ],
              energyLevel: 5,
              overallNote: '非常に高いポテンシャル。最終面接で代表と対話させると意欲がさらに上がると思う。',
              source: 'manual',
              createdAt: '2025-02-05',
            },
            feedbackLetter: {
              id: 'fl_004',
              interviewId: 'int_005',
              stageLabel: '一次面接',
              type: 'stage_pass',
              subject: '【テクノベーション株式会社】一次面接通過のご連絡',
              salutation: '山本 健太 様',
              passReasonSection: '先日の一次面接、ありがとうございました。山田との面接後、チームで議論しました。山本さんが一次面接を通過されたことをお伝えします。',
              passReasons: [
                '「PMとエンジニアの翻訳者」としてのご自身の強みの言語化が非常に明確で、弊社の課題にまさにフィットします',
                'EMとして培ったユーザー視点が、プロダクト意思決定に直結していることが確認できました',
              ],
              attractSection: '山本さんがご質問くださった「他のPMのバックグラウンド」について、弊社PMチームの5名中2名がエンジニアリング出身です。次の最終面接では、そのうちの1名と直接お話しいただける場を設けます。',
              nextStepSection: '最終面接として、代表の坂本との対話をご案内します。',
              closing: '次回もどうぞよろしくお願いいたします。',
              status: 'sent',
              generatedAt: '2025-02-06',
              reviewedAt: '2025-02-06',
              sentAt: '2025-02-06',
            },
          },
          {
            id: 'int_006',
            applicationId: 'app_002',
            stage: 'final',
            stageLabel: '最終面接',
            scheduledAt: '2025-03-18 10:00',
            format: 'offline',
            interviewers: ['坂本 代表取締役CEO'],
            status: 'scheduled',
          },
        ],
      },
    ],
  },

  // ==========================================
  // 候補者4: 田村 萌（新卒2026年卒・カジュアル面談）
  // ==========================================
  {
    id: 'cand_004',
    tenantId: 'tenant_001',
    fullName: '田村 萌',
    email: 'moe.tamura@example.com',
    phone: '080-4321-9876',
    source: 'Wantedly（新卒向け）',
    currentCompany: '東京大学（2026年3月卒予定）',
    currentTitle: '学部4年生 / 経済学部',
    yearsExperience: 0,
    consentGiven: true,
    consentDate: '2025-03-13',
    createdAt: '2025-03-13',
    avatarInitials: '田村',
    avatarColor: 'bg-pink-500',
    hiringType: 'newgrad',
    university: '東京大学',
    faculty: '経済学部 経済学科',
    graduationYear: 2026,
    clubActivities: 'プロダクト研究会（代表）、ビジネスコンテスト全国3位',
    internship: 'メガベンチャーC（半年・プロダクト企画）',
    jobHuntingAxis: '①裁量をもってプロジェクトを動かせる ②ユーザーに近い距離で仕事できる ③グローバルに活躍できる環境',
    toeicScore: 860,
    documents: [
      {
        id: 'doc_003',
        candidateId: 'cand_004',
        type: 'entry_sheet',
        fileName: '田村萌_エントリーシート.pdf',
        fileSize: '180 KB',
        uploadedAt: '2025-03-13',
        uploadedBy: '佐藤 彩花',
        parseStatus: 'parsed',
        parsedData: {
          summary: '東京大学経済学部4年生。プロダクト研究会の代表としてプロジェクト設計〜実行を完結させた経験を持つ。ビジネスコンテスト全国3位の実績あり。メガベンチャーCでの半年間のインターン（プロダクト企画）が原体験。',
          keySkills: ['プロジェクト設計・実行', 'ユーザーインタビュー', 'プレゼンテーション', 'チームリーダーシップ', 'データ分析（Excel・Python基礎）', '英語コミュニケーション'],
          careerHistory: [
            { company: 'メガベンチャーC（インターン）', role: 'プロダクト企画アシスタント', period: '2024年4月〜2024年9月', highlights: ['新機能のユーザーインタビュー15件を設計・実施', 'プロダクトロードマップの策定に参加', 'MVP機能の企画提案がプロダクトに採用'] },
          ],
          education: [
            { school: '東京大学', faculty: '経済学部 経済学科', year: '2026年3月卒予定' },
          ],
          certifications: ['TOEIC 860点'],
          strengths: ['プロジェクト推進力（研究会代表として10名以上をマネジメント）', 'ユーザー視点の課題発見力（インターンでの原体験）', '論理的思考力（ビジネスコンテスト全国3位）', 'グローバルコミュニケーション力（TOEIC860）'],
          motivationKeywords: ['裁量', 'ユーザー近接', 'プロダクト企画', 'グローバル', '若手活躍'],
          attractAngleHints: ['インターンでユーザーインタビューの面白さに目覚めた → 月10件のインタビュー実績で訴求', '研究会代表経験 → 入社半年でリーダー機会がある環境を訴求', 'TOEIC860 → グローバルプロダクト開発への参画を訴求'],
        },
      },
      {
        id: 'doc_004',
        candidateId: 'cand_004',
        type: 'resume',
        fileName: '田村萌_履歴書.pdf',
        fileSize: '210 KB',
        uploadedAt: '2025-03-13',
        uploadedBy: '佐藤 彩花',
        parseStatus: 'parsed',
        parsedData: {
          summary: '東京大学経済学部在籍。学業と並行してプロダクト研究会の代表を務め、メガベンチャーCでのインターンを経験。プロダクトマネジメントへの志向が明確で、理論と実践の両面から基礎を身につけている。',
          keySkills: ['経済分析', '統計学', 'Python（基礎）', '企画書作成', 'ファシリテーション'],
          careerHistory: [],
          education: [{ school: '東京大学', faculty: '経済学部 経済学科', year: '2026年3月卒予定' }],
          certifications: ['TOEIC 860点', '日商簿記2級'],
          strengths: ['学業成績優秀（GPA 3.6/4.0）', 'プロダクト研究会代表としてのリーダーシップ', 'インターンでの実務経験'],
          motivationKeywords: ['成長機会', '若手抜擢', 'ユーザー価値'],
          attractAngleHints: ['学業×実践の両立 → 成長速度の速さを訴求', 'GPA 3.6 → 学習意欲と能力の高さの証拠'],
        },
      },
    ],
    applications: [
      {
        id: 'app_004',
        candidateId: 'cand_004',
        jobId: 'job_002',
        jobTitle: 'プロダクトマネージャー（新卒2026）',
        currentStage: 'casual',
        status: 'active',
        appliedAt: '2025-03-13',
        recruiter: '佐藤 彩花',
        interviews: [
          {
            id: 'int_007',
            applicationId: 'app_004',
            stage: 'casual',
            stageLabel: 'カジュアル面談',
            scheduledAt: '2025-03-13 14:00',
            conductedAt: '2025-03-13 14:00',
            format: 'online',
            interviewers: ['佐藤 彩花（採用担当）'],
            status: 'completed',
            evaluation: {
              overallScore: 5,
              skillScore: 4,
              cultureFitScore: 5,
              potentialScore: 5,
              comment: '新卒とは思えない解像度で就活軸を語れる。プロダクト研究会の代表経験とインターン経験から、プロダクト思考の基礎が既に育っている。裁量・ユーザー近接への欲求が非常に強く、弊社の新卒PMポジションにドンピシャ。A社（大手IT）の最終面接待ちという競合状況あり。スピード感が重要。',
              concerns: 'スタートアップへの不安（安定性）はあるが、財務状況の説明で解消できる見込み。研修制度への不安も説明済みで解消傾向。',
              recommendation: 'strong_yes',
              submittedBy: '佐藤 彩花',
              submittedAt: '2025-03-13 16:00',
            },
            signal: {
              id: 'sig_007',
              interviewId: 'int_007',
              stageLabel: 'カジュアル面談',
              careerValues: [
                {
                  value: '裁量・プロジェクト主導',
                  strength: 'high',
                  evidence: '「自分でプロジェクト設計〜実行を完結させたい」「入社半年でリーダー機会がある話」に目の色が変わった',
                },
                {
                  value: 'ユーザーとの距離感',
                  strength: 'high',
                  evidence: '「ユーザーの声に直接触れながら仕事したい」を複数回強調。インターンでのユーザーインタビュー体験が原体験',
                },
                {
                  value: 'グローバル・語学活用',
                  strength: 'medium',
                  evidence: 'TOEIC860点・英語スキルを活かしたいと言及。海外展開への関心あり',
                },
              ],
              interests: [
                'プロダクト企画・立案プロセス',
                'ユーザーインタビューの設計',
                'グローバル展開・海外ユーザーへの対応',
                '若手でも意見が通る組織文化',
              ],
              concerns: [
                {
                  concern: 'スタートアップの長期安定性',
                  severity: 'medium',
                  response: '財務状況・成長数値の開示で解消傾向。次のステップで資料送付',
                },
                {
                  concern: '研修・オンボーディング制度',
                  severity: 'low',
                  response: '既に説明済みで「安心した」と回答。詳細資料を送付予定',
                },
              ],
              positiveReactions: [
                {
                  topic: '入社半年でプロジェクトリーダーになれる機会',
                  description: '「え、本当ですか！」と前のめり。表情が大きく変わり、具体的にどんなプロジェクトか質問してきた',
                },
                {
                  topic: '若手の意見が実際にプロダクトに反映された事例',
                  description: '事例を話すと「そういう環境を探していました」と明言。大企業とのギャップを感じている様子',
                },
                {
                  topic: '弊社の説明会でのプロダクト紹介',
                  description: '「すごくわかりやすくて感動した」と自発的に言及',
                },
              ],
              questionsAsked: [
                '若手でも意見が通るって、実際どんな感じですか？',
                '入社後の最初の1年でどんなことを経験できますか？',
                '新卒でプロダクトマネージャーになった先輩はいますか？',
                'グローバル展開の計画はありますか？英語を使う機会はありますか？',
                '他の新卒PMはどんなバックグラウンドの方が多いですか？',
              ],
              energyLevel: 5,
              overallNote: '非常に高い熱量。新卒とは思えない質問の鋭さとプロダクトへの理解度。A社の動向に注意しながら、できるだけ早くネクストステップに進める。',
              source: 'manual',
              createdAt: '2025-03-13',
            },
            feedbackLetter: {
              id: 'fl_007',
              interviewId: 'int_007',
              stageLabel: 'カジュアル面談',
              type: 'stage_pass',
              subject: '【テクノベーション株式会社】面談の御礼と次のステップについて',
              salutation: '田村 萌 様',
              passReasonSection: '先日はお時間をいただきありがとうございました。面談を通じて、田村さんのプロダクトへの深い関心と、「自分がユーザーのために直接動ける環境」を真剣に探されている姿勢が非常に印象的でした。',
              passReasons: [
                'プロダクト研究会の代表として、自分でプロジェクトを設計〜実行まで完結させてきた経験から、プロダクト思考の基礎がすでに育っていると感じました',
                '就活の軸（裁量・ユーザー近接・グローバル）が明確で、弊社が大切にしている価値観と深く重なっています',
                'インターンでのユーザーインタビュー体験を原体験として持ち、ユーザーのために動きたいという思いが本物だと伝わりました',
              ],
              attractSection: '田村さんが最も反応されていた「入社後すぐに裁量を持てる環境」について、もう少し具体的にお伝えします。弊社では新卒1年目でも、入社半年後にはプロジェクトのリード機会があります。昨年入社した林（新卒）は、入社8ヶ月で担当するプロダクト機能のロードマップを自分で作り、エンジニアチームとともに実装まで進めました。また、田村さんのTOEIC860点のスキルは、弊社の海外ユーザー向けプロダクト開発で即活かせます。英語でのユーザーインタビューや、海外パートナーとのプロダクト連携など、グローバルなプロジェクトに入社初日から関われる環境があります。',
              nextStepSection: '次のステップとして、弊社の新卒採用の一次面接をご案内します。弊社CPOの山田と、実際に新卒から活躍している若手メンバーが参加します。田村さんが入社後にどんなプロダクト課題に取り組みたいか、一緒に話し合える場にしたいと思っています。',
              closing: '田村さんとお話しできることを楽しみにしています。ご都合の良い日程を2〜3候補お知らせいただけますでしょうか。',
              status: 'draft',
              generatedAt: '2025-03-13',
            },
            handoffNotes: [
              '【最重要】A社（大手IT）の最終面接待ち。スピード感を持って一次面接をセッティングすること',
              '裁量・プロジェクト主導が最大の訴求軸。「入社半年でリーダー機会」を具体的エピソードで伝える',
              'TOEIC860点→海外プロダクト開発への参加を訴求する（グローバル志向が中〜高）',
              '研修・オンボーディング不安は解消傾向。詳細資料を一次面接前に送付',
              '「新卒からプロダクトマネージャーになった先輩」との対話機会を一次面接でセッティング',
            ],
          },
        ],
        attractStrategy: {
          id: 'ast_004',
          coreAngle: '入社初日からプロダクトに関われる裁量と、ユーザーとの近さ',
          coreAngleRationale: '田村さんの最も強いシグナルは「自分でプロジェクトを動かせる環境」への渇望。新卒でも入社半年でリーダー機会があることと、ユーザーインタビューに初日から参加できる環境が最も刺さる訴求軸。',
          subAngles: [
            'TOEIC860点を活かしたグローバルプロダクト開発',
            '新卒PMの先輩社員との対話・ロールモデルの存在',
            '若手の意見が実際にプロダクトに反映される事例',
          ],
          concernsToAddress: [
            { concern: 'スタートアップの安定性', approach: '財務状況・ARR成長率・主要顧客数を数字で開示。CFOからの説明も検討' },
            { concern: '研修・サポート体制', approach: 'オンボーディングプログラムの詳細資料を事前送付。メンター制度を紹介' },
          ],
          stepwiseApproach: [
            { step: 'カジュアル面談（済）', focus: '就活軸の把握。裁量・ユーザー近接への期待を確認' },
            { step: '一次面接（次回）', focus: 'CPOと若手PMとの対話。プロダクト思考の深さを確認。海外展開の話をする' },
            { step: '二次面接', focus: '代表との対話。入社後のキャリアパスを具体的に提示' },
            { step: '最終・内定', focus: '個別内定承諾レターで「あなたに期待する理由」を伝える' },
          ],
          competitorDiff: '競合A社（大手IT）との差別化：大手では入社3〜5年は下積みが多い。弊社では入社半年でリーダー機会があり、「今すぐプロダクトを動かしたい」田村さんの軸に直接応える。',
          generatedAt: '2025-03-13',
          version: 1,
        },
      },
    ],
  },

  // ==========================================
  // 候補者3: 鈴木 あいり（書類選考中）
  // ==========================================
  {
    id: 'cand_003',
    tenantId: 'tenant_001',
    fullName: '鈴木 あいり',
    email: 'airi.suzuki@example.com',
    phone: '090-2222-3333',
    source: 'Wantedly',
    currentCompany: 'メガベンチャーB株式会社',
    currentTitle: 'プロダクトマネージャー',
    yearsExperience: 3,
    consentGiven: true,
    consentDate: '2025-03-10',
    createdAt: '2025-03-10',
    avatarInitials: '鈴木',
    avatarColor: 'bg-orange-500',
    applications: [
      {
        id: 'app_003',
        candidateId: 'cand_003',
        jobId: 'job_001',
        jobTitle: 'シニアプロダクトマネージャー',
        currentStage: 'casual',
        status: 'active',
        appliedAt: '2025-03-10',
        recruiter: '佐藤 彩花',
        interviews: [],
      },
    ],
  },
]

// ユーティリティ関数
export function getCandidateById(id: string): Candidate | undefined {
  return candidates.find((c) => c.id === id)
}

export function getApplicationById(candidateId: string, appId: string) {
  const candidate = getCandidateById(candidateId)
  return candidate?.applications.find((a) => a.id === appId)
}

export function getStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    briefing: '企業説明会・OB訪問',
    es: 'ES選考',
    aptitude: '適性検査',
    casual: 'カジュアル面談',
    gd: 'グループディスカッション',
    interview_1: '一次面接',
    interview_2: '二次面接',
    final: '最終面接',
    offer: 'オファー・内定',
    hired: '内定承諾',
    rejected: '不合格',
    withdrawn: '辞退',
  }
  return labels[stage] ?? stage
}

export function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    briefing: 'bg-teal-50 text-teal-700',
    es: 'bg-cyan-100 text-cyan-700',
    aptitude: 'bg-sky-100 text-sky-700',
    casual: 'bg-gray-100 text-gray-700',
    gd: 'bg-lime-100 text-lime-700',
    interview_1: 'bg-blue-100 text-blue-700',
    interview_2: 'bg-indigo-100 text-indigo-700',
    final: 'bg-purple-100 text-purple-700',
    offer: 'bg-amber-100 text-amber-700',
    hired: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    withdrawn: 'bg-gray-100 text-gray-500',
  }
  return colors[stage] ?? 'bg-gray-100 text-gray-700'
}

export function getSignalStrengthLabel(strength: string): string {
  return { high: '強', medium: '中', low: '低' }[strength] ?? strength
}

export function getSignalStrengthColor(strength: string): string {
  return (
    { high: 'text-emerald-600 bg-emerald-50', medium: 'text-amber-600 bg-amber-50', low: 'text-gray-500 bg-gray-50' }[strength] ??
    'text-gray-500 bg-gray-50'
  )
}

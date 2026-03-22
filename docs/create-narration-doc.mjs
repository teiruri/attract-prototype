/**
 * ATTRACT チュートリアル動画 ナレーション原稿 Word出力
 */

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, LevelFormat,
} from 'docx';
import fs from 'fs';

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 100, bottom: 100, left: 150, right: 150 };

// ── ナレーション原稿データ ──
const SCENES = [
  {
    no: '00',
    title: 'オープニング',
    screen: 'ブランドスプラッシュ画面\n（ATTRACTロゴ＋キャッチコピー）',
    narration:
      '優秀な人材に出会えたのに、辞退されてしまった。\n' +
      'アトラクトは、候補者ひとりひとりに最適なくどき方を、AIが自動で設計する仕組みです。\n' +
      '操作画面で、その流れをご紹介します。',
    subtitle: '優秀な人材の辞退を防ぐ／AIが最適なくどき方を自動設計／操作画面で流れをご紹介',
    notes: '冒頭で課題を提示し、プロダクトの一文定義を伝える。',
  },
  {
    no: '01',
    title: 'ログイン',
    screen: 'ログイン画面\n→ メール入力 → パスワード入力 → ログインボタン',
    narration:
      'メールアドレスとパスワードでログインします。',
    subtitle: 'メールアドレスでログイン',
    notes: '短く。操作ガイドのみ。',
  },
  {
    no: '02',
    title: 'ダッシュボード',
    screen:
      'ダッシュボード画面\n' +
      '→ 右上の求人セレクタをクリック\n' +
      '→ KPIカード（選考中・要対応・内定予測・承諾予測）\n' +
      '→ 要対応タスク一覧\n' +
      '→ 選考ファネル分析＋AIプレディクション',
    narration:
      'ダッシュボードです。\n' +
      '右上で求人を選ぶと、画面全体がその求人の数値に切り替わります。\n' +
      '上部に、選考中の人数、要対応タスク、内定予測、承諾予測の4つの数値があります。\n' +
      '下には対応すべきタスクが優先順で並びます。\n' +
      'さらに選考ファネルで、各段階の人数やAIの予測値をひと目で確認できます。',
    subtitle:
      '求人ごとの数値管理画面／選考中・タスク・内定予測・承諾予測／対応タスクを優先順で表示／選考ファネルでAI予測を可視化',
    notes:
      '求人ごとの数値管理であることを強調。\n' +
      '内定予測：志望度×ペルソナマッチ度からAI算出（70%以上を内定見込みとしてカウント）\n' +
      '承諾予測：内定見込み者のうち承諾確率70%以上をカウント\n' +
      '選考ファネル：エントリー→選考中→選考辞退→内定予測→承諾予測の5段階。分母を明示。',
  },
  {
    no: '03',
    title: 'REVP診断レポート（土台）',
    screen:
      'REVP診断レポート画面\n' +
      '→ EVPサマリータブ（7項目スコア＋NPS）\n' +
      '→ 認識ギャップ分析タブ（人事×若手×中堅×新入社員）\n' +
      '→ 職種別比較、ペルソナ分析',
    narration:
      'ここで、アトラクトの土台となる機能をご紹介します。\n' +
      'レップ診断レポートです。\n' +
      'レップとは、求職者から見た自社の採用力を診断する仕組みです。\n' +
      '社員アンケートの結果をもとに、自社の魅力を7つの項目で数値化します。\n' +
      'たとえば、職種ごとに、どんなターゲットに対して、どんな魅力をアピールすべきかが、データで明確になります。\n' +
      '人事と現場の認識のズレや、入社前と入社後のギャップも、見える化されます。\n' +
      'この診断結果が土台となり、ここから先にご紹介する、候補者ひとりひとりへのくどき戦略が設計されていきます。',
    subtitle:
      'アトラクトの土台となる機能／レップ＝自社の採用力診断／7項目で魅力を数値化／職種×ターゲット×魅力を明確化／人事と現場の認識ズレを発見／この土台の上にくどき戦略を設計',
    notes:
      'REVPをダッシュボード直後に配置し、「土台」として位置づけ。\n' +
      '7つのEVP項目：仕事内容・待遇・成長機会・組織文化・人間関係・経営・働き方\n' +
      'ギャップ分析：HR vs 若手 vs 中堅 vs 新入社員の4視点\n' +
      '職種比較：全体 vs SE vs PG\n' +
      '★ポイント：REVP診断 → 訴求軸が決まる → 候補者ごとのくどき戦略に反映、という構造を伝える。',
  },
  {
    no: '04',
    title: '候補者の取り込み',
    screen:
      '候補者一覧画面\n' +
      '→ 新規登録画面\n' +
      '→ ①CSVインポート ②書類アップロード',
    narration:
      '候補者の取り込みは2通りです。\n' +
      'ひとつ目は、求人媒体や採用管理ツールから、CSVで一括取り込みする方法。\n' +
      'ふたつ目は、履歴書やエントリーシートを個別にアップロードする方法です。\n' +
      'どちらの場合も、AIが自動で情報を読み取り、候補者のカルテを作成します。',
    subtitle:
      '2つの取り込み方法／①CSVで一括取り込み／②書類から個別アップロード／AIが自動でカルテを作成',
    notes:
      '手入力が不要であることは前提とし、言及しない。\n' +
      '順序：まずCSV（一括）→次に個別アップロード。\n' +
      'ATS連携：現時点はCSV。将来的にAPI自動連携（Phase 2）。\n' +
      'ATSとの住み分け：ATSは管理台帳、ATTRACTは司令塔。ATTRACT内で選考を進行し、結果をATSに自動連携する設計。',
  },
  {
    no: '05',
    title: '書類管理・AI解析',
    screen:
      '候補者詳細 → 書類管理画面\n' +
      '→ アップロード → AI解析ステップ\n' +
      '→ スキル・資格・経歴の構造化表示\n' +
      '→ AI統合ビュー（くどきヒント）',
    narration:
      '書類管理では、アップロードした履歴書をAIが自動で解析します。\n' +
      '技術、資格、経歴を、整理されたデータとして取り出します。\n' +
      'さらに、この候補者をくどくためのヒントまで、自動で提案してくれます。',
    subtitle:
      '書類をアップロード／AIが自動で内容を読み取り／技術・資格・経歴を自動整理／くどきヒントまで自動提案',
    notes:
      'AI解析の6ステップ：PDF読取→テキスト構造化→スキル抽出→強み分析→アトラクトヒント生成→カルテ反映\n' +
      '「30分かかる作業」の表現は削除済み（実際には1名30分はかからないため）。',
  },
  {
    no: '06',
    title: '面接録音→シグナル抽出',
    screen:
      'シグナル入力画面\n' +
      '→ 録音データアップロード\n' +
      '→ AI抽出アニメーション（7ステップ）\n' +
      '→ シグナル一覧・エネルギーレベル表示',
    narration:
      '面接が終わったら、録音データをアップロードします。\n' +
      'AIが音声を文字に起こし、候補者の本音を自動で読み取ります。\n' +
      '何を大切にしているか、何に興味を持ったか、何を心配しているか。\n' +
      'この情報が、くどき戦略の自動設計につながります。',
    subtitle:
      '録音データをアップロード／AIが候補者の本音を読み取り／何を大切にし何に興味があるか／くどき戦略の自動設計へ',
    notes:
      '録音→文字起こし→発話者識別→キーワード抽出→価値観分析→懸念検出→シグナル生成の7ステップ。\n' +
      'メモ入力も可能だが、録音アップロードが主要導線。\n' +
      '★シグナル＝候補者の本音。この用語を一般向けに「本音」と言い換え。',
  },
  {
    no: '07',
    title: 'くどき戦略ボード',
    screen:
      'Attract戦略画面\n' +
      '→ メイン訴求軸\n' +
      '→ 刺さる訴求ポイント（マッチ度スコア付き）\n' +
      '→ まだ伝えていないこと\n' +
      '→ ステップ別アプローチ',
    narration:
      'くどき戦略ボードです。\n' +
      'レップ診断の結果と候補者の本音をてらしあわせて、何をどう伝えれば響くかを表示します。\n' +
      'まだ伝えていないポイントや、面接ごとのシナリオも、AIが自動で設計します。',
    subtitle:
      'くどき戦略ボード／何を伝えれば響くかを表示／まだ伝えていないポイントも表示／面接ごとのシナリオを自動設計',
    notes:
      'REVP診断（マクロ：職種×ターゲット×魅力）＋シグナル（ミクロ：候補者個人の本音）を掛け合わせて戦略を設計。\n' +
      'この画面が「ATTRACT」の名前の由来・コア機能であることを暗に伝える。',
  },
  {
    no: '08',
    title: '合格通知レター',
    screen:
      'フィードバックレター画面\n' +
      '→ 面接選択 → レター生成\n' +
      '→ プレビュー・編集\n' +
      '→ メール送信モーダル',
    narration:
      '面接のあと、候補者に合わせた合格通知のレターを、AIが自動で作成します。\n' +
      '本音にもとづいた内容で、この会社は自分をちゃんと見てくれている、という印象を与えます。\n' +
      'システムからそのままメールで送信することもできます。',
    subtitle:
      '合格通知レターをAIが自動作成／候補者の本音に基づく内容／「この会社は自分を見てくれている」／システムからメール送信も可能',
    notes:
      'レター＝合格通知であることを明確に。\n' +
      '面接後24時間以内の送付を推奨（候補者体験の観点）。\n' +
      'メール送信機能：To（候補者メール）・件名・本文プレビュー→送信。',
  },
  {
    no: '09',
    title: '面接官ブリーフィング',
    screen:
      '面接官ブリーフィング画面\n' +
      '→ 自動生成元（録音テキスト＋アンケート）\n' +
      '→ 申し送り事項（黄色ハイライト）\n' +
      '→ 伝えるべきメッセージ・質問例\n' +
      '→ コピー・共有ボタン',
    narration:
      '面接官向けのブリーフィングシートも自動で生成します。\n' +
      '録音テキストとアンケートからAIが作成するため、面接官の準備はゼロです。\n' +
      '前回の面接内容のもうしおくりにより、候補者は、この会社はちゃんと連携が取れている、と感じてくれます。',
    subtitle:
      '面接官向けブリーフィングを自動作成／録音テキスト＋アンケートから生成／面接官の準備はゼロ／前回の内容を引き継いで面接に臨む',
    notes:
      '生成元：面接録音テキスト＋候補者アンケート回答＋Attract戦略データ。\n' +
      '面接官が手作業で準備する必要がない点を強調。\n' +
      '申し送り＝前回面接の内容引き継ぎ。これが候補者体験を大きく改善する。',
  },
  {
    no: '10',
    title: 'エンディング',
    screen: 'ダッシュボード画面に戻る\n→ スクロール → トップに戻る',
    narration:
      'アトラクトは、経験と勘をデータに変え、チームで共有する仕組みです。\n' +
      '選ばれる採用を、アトラクトで実現しましょう。\n' +
      'ご視聴ありがとうございました。',
    subtitle:
      '経験と勘をデータに変える／チーム全員で共有する採用戦略／選ばれる採用を実現',
    notes: 'クロージング。短くまとめる。',
  },
];

// ── Document 作成 ──
const doc = new Document({
  styles: {
    default: {
      document: { run: { font: 'Meiryo', size: 22 } }, // 11pt
    },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: 'Meiryo', color: '1F2937' },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Meiryo', color: '374151' },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 },
      },
      {
        id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, font: 'Meiryo', color: '4F46E5' },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
    ],
  },
  sections: [
    // ── 表紙 ──
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: [
        new Paragraph({ spacing: { before: 3000 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: 'ATTRACT', font: 'Meiryo', size: 72, bold: true, color: '4F46E5' })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: '1to1 AI採用アトラクション', font: 'Meiryo', size: 32, color: '6B7280' })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
          children: [new TextRun({ text: 'オーケストレーションプラットフォーム', font: 'Meiryo', size: 32, color: '6B7280' })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 2, color: '4F46E5', space: 20 } },
          spacing: { before: 400, after: 200 },
          children: [new TextRun({ text: 'チュートリアル動画 ナレーション原稿', font: 'Meiryo', size: 36, bold: true, color: '1F2937' })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: '株式会社カケハシスカイ', font: 'Meiryo', size: 24, color: '6B7280' })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: `作成日：${new Date().toISOString().slice(0, 10)}`, font: 'Meiryo', size: 22, color: '9CA3AF' })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: '話速：日常会話の少しだけ早め（+10%） / 声：NanamiNeural', font: 'Meiryo', size: 20, color: '9CA3AF' })],
        }),
        new Paragraph({ children: [new PageBreak()] }),

        // ── 目次的なサマリー ──
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('構成サマリー')] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: '全11シーン構成。REVP診断をダッシュボード直後（03）に配置し、「土台としてのREVP → その上で候補者ごとの惹きつけ」という流れで説明。', size: 22 })],
        }),

        // シーン一覧テーブル
        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [800, 3200, 5026],
          rows: [
            // Header
            new TableRow({
              children: ['No.', 'シーン名', 'ポイント'].map((text, ci) =>
                new TableCell({
                  borders,
                  width: { size: [800, 3200, 5026][ci], type: WidthType.DXA },
                  shading: { fill: '4F46E5', type: ShadingType.CLEAR },
                  margins: cellMargins,
                  children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: 'FFFFFF', font: 'Meiryo', size: 20 })] })],
                })
              ),
            }),
            // Data rows
            ...SCENES.map((scene, i) =>
              new TableRow({
                children: [
                  new TableCell({
                    borders, width: { size: 800, type: WidthType.DXA }, margins: cellMargins,
                    shading: { fill: i % 2 === 0 ? 'F9FAFB' : 'FFFFFF', type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: scene.no, size: 20, font: 'Meiryo' })] })],
                  }),
                  new TableCell({
                    borders, width: { size: 3200, type: WidthType.DXA }, margins: cellMargins,
                    shading: { fill: i % 2 === 0 ? 'F9FAFB' : 'FFFFFF', type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: scene.title, size: 20, bold: true, font: 'Meiryo' })] })],
                  }),
                  new TableCell({
                    borders, width: { size: 5026, type: WidthType.DXA }, margins: cellMargins,
                    shading: { fill: i % 2 === 0 ? 'F9FAFB' : 'FFFFFF', type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: scene.notes.split('\n')[0], size: 20, font: 'Meiryo' })] })],
                  }),
                ],
              })
            ),
          ],
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // ── 各シーン詳細 ──
        ...SCENES.flatMap((scene, i) => {
          const rows = [
            ['画面・操作', scene.screen],
            ['ナレーション原稿', scene.narration],
            ['テロップ（字幕）', scene.subtitle],
            ['仕様メモ・備考', scene.notes],
          ];

          return [
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun(`Scene ${scene.no}：${scene.title}`)],
            }),
            new Table({
              width: { size: 9026, type: WidthType.DXA },
              columnWidths: [2400, 6626],
              rows: rows.map(([label, value]) =>
                new TableRow({
                  children: [
                    new TableCell({
                      borders,
                      width: { size: 2400, type: WidthType.DXA },
                      margins: cellMargins,
                      shading: { fill: 'EEF2FF', type: ShadingType.CLEAR },
                      children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20, font: 'Meiryo', color: '4338CA' })] })],
                    }),
                    new TableCell({
                      borders,
                      width: { size: 6626, type: WidthType.DXA },
                      margins: cellMargins,
                      children: value.split('\n').map(line =>
                        new Paragraph({
                          spacing: { after: 60 },
                          children: [new TextRun({ text: line, size: 21, font: 'Meiryo' })],
                        })
                      ),
                    }),
                  ],
                })
              ),
            }),
            // 改ページ（最後のシーン以外）
            ...(i < SCENES.length - 1 ? [new Paragraph({ spacing: { after: 400 } })] : []),
          ];
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // ── 付録：プロダクト仕様概要 ──
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('付録：プロダクト仕様概要')] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: 'ナレーション原稿の背景にあるシステム仕様の整理。原稿ブラッシュアップの際の参照用。', size: 22, color: '6B7280' })],
        }),

        // 仕様セクション
        ...[
          {
            title: 'ダッシュボード KPI設計',
            items: [
              '4つのKPIカード：選考中（人）・要対応タスク（件）・内定予測（人）・内定承諾予測（人）',
              '求人セレクタで求人を切り替え → 全数値が連動',
              '内定予測：志望度×ターゲットペルソナマッチ度から算出。offerProb >= 70% を内定見込みとしてカウント',
              '内定承諾予測：内定見込み者のうち acceptProb >= 70% をカウント',
              '承諾確率の算出要素：過去傾向・ターゲット一致率・興味度・理解度・志望度',
              '選考ファネル：エントリー→選考中→選考辞退→内定予測→承諾予測。各段階で分母を明示',
            ],
          },
          {
            title: 'REVP診断レポート（土台）',
            items: [
              'REVP = Recruitment EVP（採用における従業員価値提案）',
              '社員アンケート結果をもとに7項目でEVPスコアを算出',
              '7項目：仕事内容・待遇/報酬・成長機会・組織文化・人間関係・経営/ビジョン・働き方',
              '4視点ギャップ分析：人事 vs 若手 vs 中堅 vs 新入社員',
              '職種別比較：全体 vs SE vs PG',
              'NPS（推奨度スコア）の分布表示',
              '入社後ギャップ分析：期待と現実の乖離を可視化',
              '★位置づけ：マクロ視点で「どの職種×どのターゲットに×何を訴求するか」を決める土台',
            ],
          },
          {
            title: 'ATSとの住み分け',
            items: [
              'ATS ＝ 応募者の「管理台帳」（エントリー受付・基本情報管理）',
              'ATTRACT ＝ 採用の「司令塔」（惹きつけ・見極め・口説きのAI支援）',
              'フロー：候補者エントリー → ATS蓄積 → ATTRACT取り込み（CSV/API） → ATTRACT内で選考進行 → 結果をATSに自動連携',
              'ATTRACTにしかない価値：AI候補者分析・内定予測・録音→シグナル抽出・ブリーフィング自動生成・EVP診断ベースの口説き戦略',
              'Phase 1：CSVインポート（手動連携）/ Phase 2：主要ATSとAPI自動連携 / Phase 3：双方向リアルタイム同期',
            ],
          },
          {
            title: '候補者取り込み',
            items: [
              '方法①：求人媒体/ATSからCSVで一括取り込み',
              '方法②：履歴書・エントリーシート等を個別アップロード → AIが自動でカルテ生成',
              '手入力は不要（前提として言及しない方針）',
            ],
          },
          {
            title: '面接録音→シグナル抽出',
            items: [
              '録音データアップロード → AIが7ステップで処理',
              '7ステップ：音声読込→文字起こし→発話者識別→キーワード抽出→価値観分析→懸念検出→シグナル生成',
              'シグナル＝候補者の本音（何を大切にしているか・何に興味があるか・何を心配しているか）',
              'メモ/議事録からの取り込みも可能（サブ導線）',
            ],
          },
          {
            title: '面接官評価入力',
            items: [
              '5つの評価軸：スキルマッチ度・カルチャーフィット・志望度/意欲・コミュニケーション・ポテンシャル',
              '各軸1-5点のスコア＋総合星評価＋コメント＋懸念事項',
              '候補者詳細画面内に配置',
            ],
          },
          {
            title: '合格通知レター＋メール送信',
            items: [
              'AIが候補者のシグナルに基づきパーソナライズしたレターを自動生成',
              'プレビュー・編集可能',
              'システムからメール直接送信（To・件名・本文）',
              '面接後24時間以内の送付を推奨',
            ],
          },
          {
            title: '面接官ブリーフィング',
            items: [
              '生成元：面接録音テキスト＋候補者アンケート回答＋Attract戦略データ',
              '面接官の手準備ゼロ',
              '申し送り事項（前回面接の引き継ぎ）が最重要',
              '今回伝えるべきメッセージ・推薦トーク例・質問例を含む',
              'コピー/Slack共有/直接送付に対応',
            ],
          },
        ].flatMap(section => [
          new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(section.title)] }),
          ...section.items.map(item =>
            new Paragraph({
              numbering: { reference: 'bullets', level: 0 },
              spacing: { after: 60 },
              children: [new TextRun({ text: item, size: 20, font: 'Meiryo' })],
            })
          ),
        ]),
      ],
    },
  ],
});

// ── 出力 ──
const outputPath = 'C:/Users/K-USER01027/recruitment-journey/docs/ATTRACT_tutorial_narration.docx';
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ 完成: ${outputPath}`);
  console.log(`   サイズ: ${(buffer.length / 1024).toFixed(0)} KB`);
});

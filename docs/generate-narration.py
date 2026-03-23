"""
ATTRACT チュートリアル動画 ナレーション音声生成スクリプト
Microsoft Edge TTSを使用して高品質な日本語音声を生成
"""
import asyncio
import edge_tts
import os

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "tutorial-audio")
os.makedirs(OUTPUT_DIR, exist_ok=True)

VOICE = "ja-JP-NanamiNeural"
# 話速：日常会話の少しだけ早め
RATE = "+10%"

# シーン順序 (16シーン):
# 00_opening → 01_login → 02_dashboard → 03_revp（土台） →
# 04_register → 05_document → 06_signal →
# 07_ai_interview → 08_attract → 09_development → 10_feedback →
# 11_brief → 12_employee_pool → 13_candidate_pool →
# 14_recruitment_summary → 15_ending
#
# ※漢字ヨミ対策: TTSが誤読しやすい漢字はひらがなに開くか言い換え
#   口説き→くどき / 照合→てらしあわせ / 訴求→アピール / 申し送り→もうしおくり

SCENES = [
    {
        "filename": "00_opening.mp3",
        "text": (
            "せっかく優秀な人材に出会えたのに、辞退されてしまった。"
            "そんな経験はありませんか？"
            "アトラクトは、候補者ひとりひとりに合った最適なひきつけ方を、"
            "AIが自動で設計する仕組みです。"
            "操作画面で、その流れをご紹介します。"
        ),
    },
    {
        "filename": "01_login.mp3",
        "text": (
            "メールアドレスとパスワードでログインします。"
        ),
    },
    {
        "filename": "02_dashboard.mp3",
        "text": (
            "ダッシュボードです。"
            "右上で求人を選ぶと、画面がその求人の数値に切り替わります。"
            "上部に、選考中の人数、要対応タスク、内定予測、承諾予測の4つの数値があります。"
            "下には対応すべきタスクが優先順で並びます。"
            "さらに選考ファネルで、各段階の人数やAIの予測値を確認できます。"
        ),
    },
    {
        "filename": "03_revp_report.mp3",
        "text": (
            "ここで、アトラクトの土台となる機能をご紹介します。"
            "レップ診断レポートです。"
            "レップとは、求職者から見た自社の採用力を診断する仕組みです。"
            "内定者や社員のサーベイ結果をもとに、自社の魅力を7つの項目で数値化。"
            "職種ごとに、どんなターゲットに対して、どんな魅力をアピールすべきかを、"
            "データの裏付けも加味して設定します。"
            "人事と現場の認識のズレや、入社前と入社後のギャップも、見える化されます。"
            "この診断内容を土台として、候補者ひとりひとりの志向や興味に合わせて"
            "ひきつけ戦略が設計されていきます。"
        ),
    },
    {
        "filename": "04_register_candidate.mp3",
        "text": (
            "候補者の取り込みは、求人媒体や採用管理ツールから、"
            "CSVで一括取り込みが可能です。"
            "また、履歴書やエントリーシートを個別にアップロードすることもできます。"
            "どちらの場合も、AIが自動で情報を読み取り、候補者のカルテを作成します。"
        ),
    },
    {
        "filename": "05_document_upload.mp3",
        "text": (
            "書類管理では、アップロードした履歴書をAIが自動で解析します。"
            "技術、資格、経歴を、整理されたデータとして取り出します。"
            "さらに、この候補者をひきつけるためのヒントまで、自動で提案してくれます。"
        ),
    },
    {
        "filename": "06_signal_extraction.mp3",
        "text": (
            "面接が終わったら、録音データもしくはテキストメモをアップロードします。"
            "AIが面接官のコメントや候補者が何を大切にしているか、"
            "何に興味を持ったか、何を心配しているかを分析します。"
        ),
    },
    {
        "filename": "07_ai_interview.mp3",
        "text": (
            "オプションとして、アイエンター社が提供するAIレコメンとの連携が可能です。"
            "AI面接を実施した場合、そのコミュニケーション内容は"
            "候補者情報として自動で取り込まれます。"
            "選考設計や合格レター、ブリーフィング、カルテなど、"
            "すべてのプロセスにAI面接のデータが反映されます。"
        ),
    },
    {
        "filename": "08_attract_strategy.mp3",
        "text": (
            "ひきつけ戦略ボードです。"
            "レップ診断の結果と候補者の本音をてらしあわせて、"
            "何をどう伝えれば響くかを表示します。"
            "まだ伝えきれていないポイントや、面接ごとのシナリオも、"
            "AIが自動で設計します。"
        ),
    },
    {
        "filename": "09_development.mp3",
        "text": (
            "候補者育成フィードバック機能です。"
            "内定を出すにあたって、候補者にどんな成長が必要か、"
            "何が不足しているかを、AIが面接データから自動で分析します。"
            "さらに、それをどう伝えれば候補者に前向きに受け止めてもらえるか、"
            "伝え方のガイドまでAIが提案してくれます。"
            "リクルーターや面接官が、建設的なフィードバックを行えるようになります。"
        ),
    },
    {
        "filename": "10_feedback_letter.mp3",
        "text": (
            "面接を終えたら、合格者ひとりひとりに合わせた合格通知レターを、"
            "AIが自動で作成します。"
            "面接での会話や候補者のアンケート内容なども踏まえてレターを生成するので、"
            "この会社は自分をちゃんと見てくれている、という印象を与えることにつながります。"
            "システムからそのままメールで送信することもできます。"
        ),
    },
    {
        "filename": "11_interviewer_brief.mp3",
        "text": (
            "次回面接官向けのブリーフィングシートも自動で生成します。"
            "面接録音テキストや評価者コメント、候補者アンケートから"
            "AIが作成するため、面接官の工数はほぼかかりません。"
            "前回の面接内容のもうしおくりにより、"
            "候補者は、この会社はちゃんと連携が取れている、と感じてくれます。"
        ),
    },
    {
        "filename": "12_employee_pool.mp3",
        "text": (
            "社員タレントプールです。"
            "自社の社員情報を、部署遍歴や役職推移、表彰歴とともに管理します。"
            "面接時に、候補者と似た経歴の社員を紹介したり、"
            "合格レターで将来の同僚として紹介することで、"
            "候補者の入社意欲を高めることができます。"
        ),
    },
    {
        "filename": "13_candidate_pool.mp3",
        "text": (
            "応募者タレントプールです。"
            "タイミングや条件が合わなかったものの、"
            "優秀な候補者をリストとしてストックする仕組みです。"
            "選考時の情報やコミュニケーション履歴を保持し、"
            "しかるべきタイミングで定期連絡を取れるようにスケジュール管理します。"
        ),
    },
    {
        "filename": "14_recruitment_summary.mp3",
        "text": (
            "採用活動総括の機能です。"
            "任意のタイミングでレポートを生成すると、"
            "求人ごとの応募者数や目標人数、候補者のスキル傾向、"
            "面接官の所感やアンケート結果から、"
            "採用を成功させるためにテコ入れすべき施策をAIが分析し、提案してくれます。"
        ),
    },
    {
        "filename": "15_ending.mp3",
        "text": (
            "アトラクトは、経験と勘にたよった採用活動から脱却し、"
            "候補者ひとりひとりの心の動きをデータとして可視化し、"
            "チームで共有する仕組みです。"
            "候補者をひきつけて選ばれる採用プロセスを、"
            "アトラクトで実現しましょう。"
            "ご視聴ありがとうございました。"
        ),
    },
]


async def generate_audio(scene):
    output_path = os.path.join(OUTPUT_DIR, scene["filename"])
    print(f"  生成中: {scene['filename']}...")
    communicate = edge_tts.Communicate(scene["text"], VOICE, rate=RATE)
    await communicate.save(output_path)
    size_kb = os.path.getsize(output_path) / 1024
    print(f"  完了: {scene['filename']} ({size_kb:.0f} KB)")


async def main():
    print("=" * 60)
    print("ATTRACT チュートリアル ナレーション音声生成")
    print(f"ボイス: {VOICE} / 話速: {RATE}")
    print(f"出力先: {OUTPUT_DIR}")
    print("=" * 60)

    for i, scene in enumerate(SCENES):
        print(f"\n[{i}/{len(SCENES)-1}] シーン: {scene['filename']}")
        await generate_audio(scene)

    print("\n" + "=" * 60)
    print("全シーンの音声生成が完了しました！")
    print("=" * 60)

    total_size = 0
    for scene in SCENES:
        p = os.path.join(OUTPUT_DIR, scene["filename"])
        size = os.path.getsize(p) / 1024
        total_size += size
        print(f"  {scene['filename']:35s} {size:6.0f} KB")
    print(f"  {'合計':35s} {total_size:6.0f} KB")


if __name__ == "__main__":
    asyncio.run(main())

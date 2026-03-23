#!/usr/bin/env python3
"""
Generate SRT subtitle files for HR FARM tutorial video.
Subtitles follow narration content.
"""

import os
import re
from dataclasses import dataclass

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tutorial-subtitles")

@dataclass
class SubtitleEntry:
    index: int
    start_ms: int
    end_ms: int
    text: str

def ms_to_srt_time(ms: int) -> str:
    hours = ms // 3_600_000
    ms %= 3_600_000
    minutes = ms // 60_000
    ms %= 60_000
    seconds = ms // 1_000
    millis = ms % 1_000
    return f"{hours:02d}:{minutes:02d}:{seconds:02d},{millis:03d}"

def format_srt(entries: list[SubtitleEntry]) -> str:
    lines = []
    for e in entries:
        lines.append(str(e.index))
        lines.append(f"{ms_to_srt_time(e.start_ms)} --> {ms_to_srt_time(e.end_ms)}")
        lines.append(e.text)
        lines.append("")
    return "\n".join(lines)

def split_narration_to_subtitles(text: str, duration_s: float) -> list[SubtitleEntry]:
    sentences = re.split(r'(?<=[。？！])', text)
    sentences = [s.strip() for s in sentences if s.strip()]

    segments = []
    for sentence in sentences:
        if len(sentence) <= 26:
            segments.append(sentence)
        else:
            clauses = re.split(r'(?<=[、])', sentence)
            clauses = [c.strip() for c in clauses if c.strip()]
            buffer = ""
            for clause in clauses:
                if buffer and len(buffer) + len(clause) > 26:
                    segments.append(buffer)
                    buffer = clause
                else:
                    buffer = buffer + clause if buffer else clause
            if buffer:
                segments.append(buffer)

    if not segments:
        return []

    char_counts = [len(seg) for seg in segments]
    total_chars = sum(char_counts)
    total_ms = int(duration_s * 1000)
    gap_ms = 60
    margin_ms = 200

    entries = []
    current_ms = margin_ms

    for i, (seg, chars) in enumerate(zip(segments, char_counts)):
        proportion = chars / total_chars
        dur_ms = int(proportion * (total_ms - margin_ms * 2))
        dur_ms = max(800, min(5000, dur_ms))
        end_ms = min(current_ms + dur_ms, total_ms - 50)

        entries.append(SubtitleEntry(
            index=i + 1, start_ms=current_ms, end_ms=end_ms, text=seg,
        ))
        current_ms = end_ms + gap_ms
        if current_ms >= total_ms:
            break

    return entries

# 16 scenes matching generate-narration.py
SCENES = [
    {
        "id": "00_opening",
        "duration_s": 16.0,
        "narration": "せっかく優秀な人材に出会えたのに、辞退されてしまった。そんな経験はありませんか？エイチアールファームは、応募者の志望度を耕し、採用確率を高める仕組みです。候補者ひとりひとりに合った最適なひきつけ方を、AIが自動で設計します。操作画面で、その流れをご紹介します。",
    },
    {
        "id": "01_login",
        "duration_s": 4.5,
        "narration": "メールアドレスとパスワードでログインします。",
    },
    {
        "id": "02_dashboard",
        "duration_s": 27.0,
        "narration": "ダッシュボードです。右上で求人を選ぶと、画面がその求人の数値に切り替わります。上部に、選考中の人数、要対応タスク、内定予測、承諾予測の4つの数値があります。下には対応すべきタスクが優先順で並びます。さらに選考ファネルで、各段階の人数やAIの予測値を確認できます。",
    },
    {
        "id": "03_revp_report",
        "duration_s": 38.0,
        "narration": "ここで、エイチアールファームの土台となる機能をご紹介します。レップ診断レポートです。レップとは、求職者から見た自社の採用力を診断する仕組みです。内定者や社員のサーベイ結果をもとに、自社の魅力を7つの項目で数値化。職種ごとに、どんなターゲットに対して、どんな魅力をアピールすべきかを、データの裏付けも加味して設定します。人事と現場の認識のズレや、入社前と入社後のギャップも、見える化されます。この診断内容を土台として、候補者ひとりひとりの志向や興味に合わせてひきつけ戦略が設計されていきます。",
    },
    {
        "id": "04_register_candidate",
        "duration_s": 18.0,
        "narration": "候補者の取り込みは、求人媒体や採用管理ツールから、CSVで一括取り込みが可能です。また、履歴書やエントリーシートを個別にアップロードすることもできます。どちらの場合も、AIが自動で情報を読み取り、候補者のカルテを作成します。",
    },
    {
        "id": "05_document_upload",
        "duration_s": 16.0,
        "narration": "書類管理では、アップロードした履歴書をAIが自動で解析します。技術、資格、経歴を、整理されたデータとして取り出します。さらに、この候補者をひきつけるためのヒントまで、自動で提案してくれます。",
    },
    {
        "id": "06_signal_extraction",
        "duration_s": 16.0,
        "narration": "面接が終わったら、録音データもしくはテキストメモをアップロードします。AIが面接官のコメントや候補者が何を大切にしているか、何に興味を持ったか、何を心配しているかを分析します。",
    },
    {
        "id": "07_ai_interview",
        "duration_s": 20.0,
        "narration": "オプションとして、アイエンター社が提供するAIレコメンとの連携が可能です。AI面接を実施した場合、そのコミュニケーション内容は候補者情報として自動で取り込まれます。選考設計や合格レター、ブリーフィング、カルテなど、すべてのプロセスにAI面接のデータが反映されます。",
    },
    {
        "id": "08_attract_strategy",
        "duration_s": 18.0,
        "narration": "ひきつけ戦略ボードです。レップ診断の結果と候補者の本音をてらしあわせて、何をどう伝えれば響くかを表示します。まだ伝えきれていないポイントや、面接ごとのシナリオも、AIが自動で設計します。",
    },
    {
        "id": "09_development",
        "duration_s": 20.0,
        "narration": "候補者育成フィードバック機能です。内定を出すにあたって、候補者にどんな成長が必要か、何が不足しているかを、AIが面接データから自動で分析します。さらに、それをどう伝えれば候補者に前向きに受け止めてもらえるか、伝え方のガイドまでAIが提案してくれます。リクルーターや面接官が、建設的なフィードバックを行えるようになります。",
    },
    {
        "id": "10_feedback_letter",
        "duration_s": 22.0,
        "narration": "面接を終えたら、合格者ひとりひとりに合わせた合格通知レターを、AIが自動で作成します。面接での会話や候補者のアンケート内容なども踏まえてレターを生成するので、この会社は自分をちゃんと見てくれている、という印象を与えることにつながります。システムからそのままメールで送信することもできます。",
    },
    {
        "id": "11_interviewer_brief",
        "duration_s": 22.0,
        "narration": "次回面接官向けのブリーフィングシートも自動で生成します。面接録音テキストや評価者コメント、候補者アンケートからAIが作成するため、面接官の工数はほぼかかりません。前回の面接内容のもうしおくりにより、候補者は、この会社はちゃんと連携が取れている、と感じてくれます。",
    },
    {
        "id": "12_employee_pool",
        "duration_s": 16.0,
        "narration": "社員タレントプールです。自社の社員情報を、部署遍歴や役職推移、表彰歴とともに管理します。面接時に、候補者と似た経歴の社員を紹介したり、合格レターで将来の同僚として紹介することで、候補者の入社意欲を高めることができます。",
    },
    {
        "id": "13_candidate_pool",
        "duration_s": 16.0,
        "narration": "応募者タレントプールです。タイミングや条件が合わなかったものの、優秀な候補者をリストとしてストックする仕組みです。選考時の情報やコミュニケーション履歴を保持し、しかるべきタイミングで定期連絡を取れるようにスケジュール管理します。",
    },
    {
        "id": "14_recruitment_summary",
        "duration_s": 18.0,
        "narration": "採用活動総括の機能です。任意のタイミングでレポートを生成すると、求人ごとの応募者数や目標人数、候補者のスキル傾向、面接官の所感やアンケート結果から、採用を成功させるためにテコ入れすべき施策をAIが分析し、提案してくれます。",
    },
    {
        "id": "15_ending",
        "duration_s": 18.0,
        "narration": "エイチアールファームは、経験と勘にたよった採用活動から脱却し、候補者ひとりひとりの心の動きをデータとして可視化し、チームで共有する仕組みです。候補者をひきつけて選ばれる採用プロセスを、エイチアールファームで実現しましょう。ご視聴ありがとうございました。",
    },
]


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Output directory: {OUTPUT_DIR}\n")

    all_entries = []
    cumulative_offset_ms = 0

    for scene in SCENES:
        entries = split_narration_to_subtitles(scene["narration"], scene["duration_s"])

        srt_content = format_srt(entries)
        filepath = os.path.join(OUTPUT_DIR, f"{scene['id']}.srt")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(srt_content)

        print(f"[{scene['id']}] {len(entries)} subtitles, {scene['duration_s']}s")

        for e in entries:
            all_entries.append(SubtitleEntry(
                index=len(all_entries) + 1,
                start_ms=e.start_ms + cumulative_offset_ms,
                end_ms=e.end_ms + cumulative_offset_ms,
                text=e.text
            ))

        cumulative_offset_ms += int(scene["duration_s"] * 1000)

    combined_path = os.path.join(OUTPUT_DIR, "combined.srt")
    with open(combined_path, "w", encoding="utf-8") as f:
        f.write(format_srt(all_entries))

    total_s = sum(s["duration_s"] for s in SCENES)
    print(f"\nScenes: {len(SCENES)}, Subtitles: {len(all_entries)}, Duration: {total_s:.0f}s ({int(total_s//60)}m{int(total_s%60)}s)")

if __name__ == "__main__":
    main()

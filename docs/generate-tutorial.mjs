/**
 * ATTRACT チュートリアル動画 統合生成スクリプト v4
 * 1. edge-tts でナレーション音声を生成
 * 2. 字幕ファイル(.srt)を生成
 * 3. Playwright でシーンごとにブラウザ録画
 * 4. ffmpeg で音声+字幕を合成 → 最終動画を結合
 */

import { chromium } from 'playwright';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://attract-prototype.vercel.app';
const PYTHON = 'C:/Users/K-USER01027/AppData/Local/Programs/Python/Python312/python.exe';
const AUDIO_DIR = 'C:/Users/K-USER01027/recruitment-journey/docs/tutorial-audio';
const SUB_DIR = 'C:/Users/K-USER01027/recruitment-journey/docs/tutorial-subtitles';
const VIDEO_DIR = 'C:/Users/K-USER01027/recruitment-journey/docs/tutorial-video';

function findFfmpeg() {
  const wingetPath = 'C:/Users/K-USER01027/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin/ffmpeg.exe';
  if (fs.existsSync(wingetPath)) return wingetPath;
  try { execSync('ffmpeg -version', { stdio: 'ignore' }); return 'ffmpeg'; } catch {}
  const common = ['C:/ffmpeg/bin/ffmpeg.exe', 'C:/ProgramData/chocolatey/bin/ffmpeg.exe'];
  for (const p of common) { if (fs.existsSync(p)) return p; }
  console.error('ffmpeg not found'); process.exit(1);
}

const FFMPEG = findFfmpeg();
fs.mkdirSync(VIDEO_DIR, { recursive: true });
fs.mkdirSync(path.join(VIDEO_DIR, 'scenes'), { recursive: true });

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function smoothScroll(page, targetY, steps = 10) {
  const currentY = await page.evaluate(() => window.scrollY);
  const diff = targetY - currentY;
  for (let i = 1; i <= steps; i++) {
    await page.evaluate(y => window.scrollTo({ top: y, behavior: 'auto' }), currentY + (diff * i / steps));
    await sleep(60);
  }
}

// ============================================
// ナレーションテキスト（平易な日本語・英語なし）
// ============================================
const NARRATIONS = {
  '00_opening': 'アトラクトは、候補者一人ひとりに合った魅力の伝え方を、自動で設計する採用支援システムです。せっかくの優秀な人材に辞退されないために。内定の承諾率を高める、新しい採用のかたちをご紹介します。',
  '01_login': 'まず、ログイン画面です。メールアドレスとパスワードを入力してログインします。会社の統合認証にも対応しているので、安全にご利用いただけます。',
  '02_dashboard': 'ログインすると、ダッシュボードが表示されます。画面右上で求人を切り替えると、すべての数字がその求人に連動します。選考中の人数、やるべきタスク、内定が出そうな人数、さらに内定を承諾しそうな人数まで、ひと目で把握できます。下にスクロールすると、選考の各段階ごとの人数の推移や、候補者ごとの内定予測もご覧いただけます。',
  '03_register_candidate': '候補者の登録は、手で入力する必要がありません。履歴書や職務経歴書をアップロードするだけで、自動で内容を読み取り、候補者のカルテを作成します。まとめて取り込みたい場合は、一括登録にも対応しています。',
  '04_document_upload': '候補者の詳細画面では、アップロードした書類の内容が自動で整理されて表示されます。スキル、経歴、資格はもちろん、この候補者を惹きつけるための訴求ポイントまで自動で提案されます。',
  '05_signal_extraction': '面接の録音データをアップロードすると、自動で文字に起こし、候補者の本音を読み取ります。何に興味があるのか、どんな不安を感じているのか、どの話題に良い反応を示したかなど、選考に大切な情報を整理して表示します。',
  '06_attract_strategy': '読み取った候補者の本音と、自社の魅力情報を掛け合わせて、その候補者だけの惹きつけ戦略を自動で作成します。次の面接で何を伝えるべきか、どう質問すべきか、具体的な会話の進め方まで提案します。',
  '07_feedback_letter': '選考結果の通知メールも、候補者に合わせた内容を自動で作成します。なぜ合格なのか、自社のどんな魅力が合っているのか、次の選考の案内まで、一貫した流れで設計されます。作成したメールは、そのまま画面から送信できます。',
  '08_interviewer_brief': '面接官向けの事前準備資料も、録音の内容と候補者のアンケートから自動で作成されます。面接官が手作業で準備する必要はありません。前回までの引き継ぎ事項、伝えるべき内容、おすすめの質問まで、すべて揃った状態でお渡しします。',
  '09_revp_report': '採用ブランディングの診断レポートも搭載しています。自社の魅力を7つの観点で数値化し、社内の立場による認識のズレや、採用活動の各段階での候補者の気持ちの変化を可視化します。具体的な改善の方向性まで提案します。',
  '10_ending': 'アトラクトは、すべての選考データを蓄積し、使えば使うほど予測の精度が高まります。内定予測や承諾予測の確度が上がることで、より戦略的な採用活動が実現します。新しい採用のかたちを、アトラクトで始めましょう。',
};

// ============================================
// 字幕テキスト（平易な日本語・要点のみ）
// ============================================
const SUBTITLES = {
  '00_opening': [
    [0.5, 3.5, '候補者に合った魅力の伝え方を自動設計'],
    [4.0, 7.0, '内定承諾率を高める 新しい採用のかたち'],
  ],
  '01_login': [
    [0.5, 3.0, 'メールアドレスで安全にログイン'],
    [3.5, 5.5, '会社の統合認証にも対応'],
  ],
  '02_dashboard': [
    [0.5, 4.0, '求人ごとに採用の進捗をひと目で把握'],
    [5.0, 9.0, '選考中・タスク・内定予測・承諾予測の4指標'],
    [10.0, 14.0, '段階ごとの人数推移を可視化'],
    [15.0, 18.0, '候補者ごとの内定予測も自動算出'],
  ],
  '03_register_candidate': [
    [0.5, 3.0, '候補者の登録は手入力不要'],
    [3.5, 6.5, '書類をアップロードするだけで自動作成'],
    [7.0, 9.0, 'まとめて一括登録にも対応'],
  ],
  '04_document_upload': [
    [0.5, 3.5, '書類の内容を自動で整理して表示'],
    [4.0, 7.0, 'スキル・経歴・訴求ポイントまで抽出'],
    [7.5, 10.0, '採用に必要な情報をすぐに把握'],
  ],
  '05_signal_extraction': [
    [0.5, 3.5, '面接の録音から候補者の本音を読み取り'],
    [4.5, 7.5, '興味・不安・良い反応を自動で整理'],
    [8.5, 11.0, '選考判断の精度が大きく向上'],
  ],
  '06_attract_strategy': [
    [0.5, 3.5, '候補者だけの惹きつけ戦略を自動作成'],
    [4.5, 7.5, '伝え方・質問の進め方まで提案'],
  ],
  '07_feedback_letter': [
    [0.5, 3.0, '候補者に合わせた結果通知を自動作成'],
    [3.5, 6.0, '合格理由から次の案内まで一貫設計'],
    [6.5, 8.5, '画面からそのままメール送信が可能'],
  ],
  '08_interviewer_brief': [
    [0.5, 3.5, '面接官の事前準備を自動で完了'],
    [4.0, 6.5, '録音とアンケートから資料を作成'],
    [7.0, 9.0, '引き継ぎ・質問例もすべて完備'],
  ],
  '09_revp_report': [
    [0.5, 3.5, '自社の魅力を7つの観点で数値化'],
    [4.0, 7.0, '社内の認識のズレをデータで把握'],
    [7.5, 10.0, '改善の方向性まで具体的に提案'],
  ],
  '10_ending': [
    [0.5, 3.5, 'すべての選考データを蓄積して活用'],
    [4.0, 6.5, '使うほど予測の精度が向上'],
    [7.0, 9.5, '新しい採用を アトラクトで'],
  ],
};

// ============================================
// シーン定義（録画アクション）
// ============================================
const SCENES = [
  {
    name: '00_opening',
    actions: async (page, dur) => {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
      await sleep(dur * 1000);
    },
  },
  {
    name: '01_login',
    actions: async (page, dur) => {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
      const step = (dur * 1000) / 3;
      await sleep(step);
      // Type email
      await page.fill('input[type="email"]', 'sato.ayaka@technovation.co.jp');
      await sleep(step);
      // Type password
      await page.fill('input[type="password"]', '••••••••');
      await sleep(step);
    },
  },
  {
    name: '02_dashboard',
    actions: async (page, dur) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      const step = (dur * 1000) / 6;
      await sleep(step);          // show KPIs (4 cards)
      await smoothScroll(page, 300);
      await sleep(step);          // efficiency banner
      await smoothScroll(page, 550);
      await sleep(step);          // action items
      await smoothScroll(page, 850);
      await sleep(step);          // funnel analysis
      await smoothScroll(page, 1200);
      await sleep(step);          // AI predictions
      await smoothScroll(page, 1500);
      await sleep(step);          // bottom
    },
  },
  {
    name: '03_register_candidate',
    actions: async (page, dur) => {
      const step = (dur * 1000) / 4;
      await page.goto(`${BASE_URL}/candidates`, { waitUntil: 'networkidle' });
      await sleep(step);
      await page.goto(`${BASE_URL}/candidates/new`, { waitUntil: 'networkidle' });
      await sleep(step);
      await smoothScroll(page, 300);
      await sleep(step);
      await smoothScroll(page, 600);
      await sleep(step);
    },
  },
  {
    name: '04_document_upload',
    actions: async (page, dur) => {
      const step = (dur * 1000) / 5;
      await page.goto(`${BASE_URL}/candidates/cand_001`, { waitUntil: 'networkidle' });
      await sleep(step);
      await page.goto(`${BASE_URL}/candidates/cand_001/documents`, { waitUntil: 'networkidle' });
      await sleep(step);
      await smoothScroll(page, 300);
      await sleep(step);
      await smoothScroll(page, 600);
      await sleep(step);
      await smoothScroll(page, 900);
      await sleep(step);
    },
  },
  {
    name: '05_signal_extraction',
    actions: async (page, dur) => {
      const step = (dur * 1000) / 5;
      await page.goto(`${BASE_URL}/candidates/cand_001/signal-input`, { waitUntil: 'networkidle' });
      await sleep(step);
      await smoothScroll(page, 250);
      await sleep(step);
      await smoothScroll(page, 500);
      await sleep(step);
      await smoothScroll(page, 800);
      await sleep(step);
      await smoothScroll(page, 1100);
      await sleep(step);
    },
  },
  {
    name: '06_attract_strategy',
    actions: async (page, dur) => {
      const step = (dur * 1000) / 3;
      await page.goto(`${BASE_URL}/candidates/cand_001/attract`, { waitUntil: 'networkidle' });
      await sleep(step);
      await smoothScroll(page, 350);
      await sleep(step);
      await smoothScroll(page, 700);
      await sleep(step);
    },
  },
  {
    name: '07_feedback_letter',
    actions: async (page, dur) => {
      const step = (dur * 1000) / 3;
      await page.goto(`${BASE_URL}/candidates/cand_001/feedback-letter`, { waitUntil: 'networkidle' });
      await sleep(step);
      await smoothScroll(page, 300);
      await sleep(step);
      await smoothScroll(page, 550);
      await sleep(step);
    },
  },
  {
    name: '08_interviewer_brief',
    actions: async (page, dur) => {
      const step = (dur * 1000) / 3;
      await page.goto(`${BASE_URL}/candidates/cand_001/brief`, { waitUntil: 'networkidle' });
      await sleep(step);
      await smoothScroll(page, 250);
      await sleep(step);
      await smoothScroll(page, 550);
      await sleep(step);
    },
  },
  {
    name: '09_revp_report',
    actions: async (page, dur) => {
      const step = (dur * 1000) / 4;
      await page.goto(`${BASE_URL}/settings/revp-report`, { waitUntil: 'networkidle' });
      await sleep(step);
      await smoothScroll(page, 350);
      await sleep(step);
      await smoothScroll(page, 700);
      await sleep(step);
      await smoothScroll(page, 0);
      await sleep(step);
    },
  },
  {
    name: '10_ending',
    actions: async (page, dur) => {
      const step = (dur * 1000) / 3;
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await sleep(step);
      await smoothScroll(page, 400);
      await sleep(step);
      await smoothScroll(page, 0);
      await sleep(step);
    },
  },
];

// ============================================
// Step 1: Generate narration audio
// ============================================
async function generateAudio() {
  console.log('\n🎙️  ナレーション音声を生成中...\n');
  fs.mkdirSync(AUDIO_DIR, { recursive: true });

  for (const [name, text] of Object.entries(NARRATIONS)) {
    const outFile = path.join(AUDIO_DIR, `${name}.mp3`);
    const escaped = text.replace(/"/g, '\\"');
    const cmd = `"${PYTHON}" -m edge_tts --voice ja-JP-NanamiNeural --rate=+5% --text "${escaped}" --write-media "${outFile}"`;
    try {
      execSync(cmd, { stdio: 'pipe', timeout: 30000 });
      console.log(`  ✅ ${name}.mp3`);
    } catch (e) {
      console.log(`  ❌ ${name}: ${e.message?.substring(0, 100)}`);
    }
  }
}

// ============================================
// Step 2: Generate subtitle files
// ============================================
function generateSubtitles() {
  console.log('\n📝 字幕ファイルを生成中...\n');
  fs.mkdirSync(SUB_DIR, { recursive: true });

  for (const [name, entries] of Object.entries(SUBTITLES)) {
    const srtContent = entries.map((e, i) => {
      const startH = Math.floor(e[0] / 3600);
      const startM = Math.floor((e[0] % 3600) / 60);
      const startS = Math.floor(e[0] % 60);
      const startMs = Math.round((e[0] % 1) * 1000);
      const endH = Math.floor(e[1] / 3600);
      const endM = Math.floor((e[1] % 3600) / 60);
      const endS = Math.floor(e[1] % 60);
      const endMs = Math.round((e[1] % 1) * 1000);

      const fmt = (h, m, s, ms) => `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(ms).padStart(3,'0')}`;

      return `${i + 1}\n${fmt(startH, startM, startS, startMs)} --> ${fmt(endH, endM, endS, endMs)}\n${e[2]}`;
    }).join('\n\n');

    fs.writeFileSync(path.join(SUB_DIR, `${name}.srt`), srtContent, 'utf-8');
    console.log(`  ✅ ${name}.srt`);
  }
}

// ============================================
// Step 3: Get audio durations
// ============================================
function getAudioDurations() {
  console.log('\n⏱️  音声尺を取得中...\n');
  const durations = {};
  const ffprobe = FFMPEG.replace('ffmpeg.exe', 'ffprobe.exe').replace(/ffmpeg$/, 'ffprobe');

  for (const name of Object.keys(NARRATIONS)) {
    const audioFile = path.join(AUDIO_DIR, `${name}.mp3`);
    if (!fs.existsSync(audioFile)) { durations[name] = 8; continue; }
    try {
      const result = execSync(`"${ffprobe}" -v quiet -show_entries format=duration -of csv=p=0 "${audioFile}"`, { encoding: 'utf-8', timeout: 10000 });
      durations[name] = parseFloat(result.trim()) || 8;
      console.log(`  ${name}: ${durations[name].toFixed(1)}s`);
    } catch {
      // Fallback: estimate from file size
      const size = fs.statSync(audioFile).size;
      durations[name] = Math.max(5, size / 16000);
      console.log(`  ${name}: ~${durations[name].toFixed(1)}s (estimated)`);
    }
  }
  return durations;
}

// ============================================
// Step 4: Record scenes with Playwright
// ============================================
async function recordScenes(durations) {
  console.log('\n📹 シーンを録画中...\n');

  const browser = await chromium.launch({ headless: true });

  for (const scene of SCENES) {
    const dur = durations[scene.name] || 8;
    console.log(`  Recording ${scene.name} (${dur.toFixed(1)}s)...`);

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: {
        dir: path.join(VIDEO_DIR, 'scenes'),
        size: { width: 1440, height: 900 },
      },
      locale: 'ja-JP',
    });

    const page = await context.newPage();
    await scene.actions(page, dur);

    const videoObj = page.video();
    await page.close();
    await context.close();

    const videoPath = await videoObj.path();
    const targetPath = path.join(VIDEO_DIR, 'scenes', `${scene.name}.webm`);
    if (fs.existsSync(videoPath)) {
      if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
      fs.renameSync(videoPath, targetPath);
      console.log(`  ✅ ${scene.name}.webm`);
    } else {
      console.log(`  ⚠️ Video file not found`);
    }
  }

  await browser.close();
}

// ============================================
// Step 5: Combine video + audio + subtitles
// ============================================
function combineScenes() {
  console.log('\n🔧 映像・音声・字幕を合成中...\n');
  const fontPath = 'C\\\\:/Windows/Fonts/NotoSansJP-VF.ttf';

  const sceneOutputs = [];
  for (const scene of SCENES) {
    const videoFile = path.join(VIDEO_DIR, 'scenes', `${scene.name}.webm`);
    const audioFile = path.join(AUDIO_DIR, `${scene.name}.mp3`);
    const subtitleFile = path.join(SUB_DIR, `${scene.name}.srt`);
    const outputFile = path.join(VIDEO_DIR, 'scenes', `${scene.name}_final.mp4`);

    if (!fs.existsSync(videoFile)) { console.log(`  ⚠️ Skip ${scene.name}: no video`); continue; }
    if (!fs.existsSync(audioFile)) { console.log(`  ⚠️ Skip ${scene.name}: no audio`); continue; }

    // Read subtitles and build drawtext filter chain
    let filterComplex = '';
    if (fs.existsSync(subtitleFile)) {
      const srtContent = fs.readFileSync(subtitleFile, 'utf-8');
      const blocks = srtContent.trim().split(/\n\n+/);
      const drawTexts = [];

      for (const block of blocks) {
        const lines = block.split('\n');
        if (lines.length < 3) continue;
        const timeMatch = lines[1].match(/(\d+):(\d+):(\d+)[.,](\d+)\s*-->\s*(\d+):(\d+):(\d+)[.,](\d+)/);
        if (!timeMatch) continue;
        const startSec = parseInt(timeMatch[1])*3600 + parseInt(timeMatch[2])*60 + parseInt(timeMatch[3]) + parseInt(timeMatch[4])/1000;
        const endSec = parseInt(timeMatch[5])*3600 + parseInt(timeMatch[6])*60 + parseInt(timeMatch[7]) + parseInt(timeMatch[8])/1000;
        const text = lines.slice(2).join('\\n').replace(/'/g, "'\\\\\\''").replace(/:/g, '\\:');

        drawTexts.push(`drawtext=fontfile='${fontPath}':text='${text}':fontsize=28:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=h-100:enable='between(t,${startSec},${endSec})'`);
      }

      if (drawTexts.length > 0) {
        filterComplex = `-filter_complex "[0:v]${drawTexts.join(',')}[v]" -map "[v]" -map 1:a`;
      }
    }

    const cmd = filterComplex
      ? `"${FFMPEG}" -y -i "${videoFile}" -i "${audioFile}" ${filterComplex} -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k -shortest "${outputFile}"`
      : `"${FFMPEG}" -y -i "${videoFile}" -i "${audioFile}" -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k -shortest "${outputFile}"`;

    console.log(`  Processing ${scene.name}...`);
    try {
      execSync(cmd, { stdio: 'pipe', timeout: 180000 });
      sceneOutputs.push(outputFile);
      console.log(`  ✅ ${scene.name}_final.mp4`);
    } catch (e) {
      // Fallback: no subtitles
      const cmdFallback = `"${FFMPEG}" -y -i "${videoFile}" -i "${audioFile}" -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k -shortest "${outputFile}"`;
      try {
        execSync(cmdFallback, { stdio: 'pipe', timeout: 180000 });
        sceneOutputs.push(outputFile);
        console.log(`  ✅ ${scene.name}_final.mp4 (no subs)`);
      } catch (e2) {
        console.log(`  ❌ Failed: ${e2.message?.substring(0, 200)}`);
      }
    }
  }

  return sceneOutputs;
}

// ============================================
// Step 6: Concatenate all scenes
// ============================================
function concatenateScenes(sceneOutputs) {
  if (sceneOutputs.length === 0) { console.log('No scenes to concatenate'); return; }

  console.log('\n🎬 最終動画を結合中...\n');

  const concatFile = path.join(VIDEO_DIR, 'concat_list.txt');
  fs.writeFileSync(concatFile, sceneOutputs.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n'));

  const finalOutput = path.join(VIDEO_DIR, 'ATTRACT_tutorial_complete.mp4');
  const concatCmd = `"${FFMPEG}" -y -f concat -safe 0 -i "${concatFile}" -c copy "${finalOutput}"`;

  try {
    execSync(concatCmd, { stdio: 'pipe', timeout: 300000 });
    const sizeMB = (fs.statSync(finalOutput).size / (1024 * 1024)).toFixed(1);
    console.log(`✅ 完成！`);
    console.log(`📁 ${finalOutput}`);
    console.log(`📏 ${sizeMB} MB`);
    console.log(`🎬 シーン数: ${sceneOutputs.length}`);
  } catch (e) {
    console.log(`❌ Concat failed: ${e.message?.substring(0, 200)}`);
  }
}

// ============================================
// Main
// ============================================
(async () => {
  console.log('🎬 ATTRACT チュートリアル動画 自動生成開始\n');
  console.log(`ffmpeg: ${FFMPEG}`);
  console.log(`python: ${PYTHON}\n`);

  // Step 1: Audio
  await generateAudio();

  // Step 2: Subtitles
  generateSubtitles();

  // Step 3: Durations
  const durations = getAudioDurations();

  // Step 4: Record
  await recordScenes(durations);

  // Step 5: Combine
  const sceneOutputs = combineScenes();

  // Step 6: Concatenate
  concatenateScenes(sceneOutputs);

  console.log('\n🎬 チュートリアル動画生成完了！');
})();

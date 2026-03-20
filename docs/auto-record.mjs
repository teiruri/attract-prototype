/**
 * ATTRACT チュートリアル動画 自動録画スクリプト v3
 * - Playwright: ブラウザ自動操作＋録画
 * - ffmpeg: 音声合成＋テロップ(字幕)焼き込み
 * - タイミング: 音声の尺に合わせて画面操作を配分
 * - テロップ: 要点のみ・メリハリ付き
 */

import { chromium } from 'playwright';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://attract-prototype.vercel.app';
const AUDIO_DIR = 'C:/Users/K-USER01027/recruitment-journey/docs/tutorial-audio';
const SUB_DIR = 'C:/Users/K-USER01027/recruitment-journey/docs/tutorial-subtitles';
const VIDEO_DIR = 'C:/Users/K-USER01027/recruitment-journey/docs/tutorial-video';

// Find ffmpeg
function findFfmpeg() {
  const wingetPath = 'C:/Users/K-USER01027/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin/ffmpeg.exe';
  if (fs.existsSync(wingetPath)) return wingetPath;
  try { execSync('ffmpeg -version', { stdio: 'ignore' }); return 'ffmpeg'; } catch { }
  // Check common locations
  const common = ['C:/ffmpeg/bin/ffmpeg.exe', 'C:/ProgramData/chocolatey/bin/ffmpeg.exe'];
  for (const p of common) { if (fs.existsSync(p)) return p; }
  console.error('ffmpeg not found'); process.exit(1);
}

const FFMPEG = findFfmpeg();

fs.mkdirSync(VIDEO_DIR, { recursive: true });
fs.mkdirSync(path.join(VIDEO_DIR, 'scenes'), { recursive: true });

// Audio durations (seconds, estimated from file sizes)
const DURATIONS = {
  '00_opening': 7.2, '01_dashboard': 11.0, '02_register_candidate': 8.9,
  '03_document_upload': 9.8, '04_signal_extraction': 10.8, '05_attract_strategy': 7.8,
  '06_feedback_letter': 7.3, '07_interviewer_brief': 7.5, '08_ending': 8.4,
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function smoothScroll(page, targetY, steps = 10) {
  const currentY = await page.evaluate(() => window.scrollY);
  const diff = targetY - currentY;
  for (let i = 1; i <= steps; i++) {
    await page.evaluate(y => window.scrollTo({ top: y, behavior: 'auto' }), currentY + (diff * i / steps));
    await sleep(60);
  }
}

// Scene definitions: name -> { actions(page), duration }
const SCENES = [
  {
    name: '00_opening',
    actions: async (page, dur) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await sleep(dur * 1000);
    },
  },
  {
    name: '01_dashboard',
    actions: async (page, dur) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      const step = (dur * 1000) / 4;
      await sleep(step);          // show KPIs
      await smoothScroll(page, 400);
      await sleep(step);          // show efficiency banner + actions
      await smoothScroll(page, 750);
      await sleep(step);          // show analytics
      await smoothScroll(page, 1100);
      await sleep(step);          // show predictions
    },
  },
  {
    name: '02_register_candidate',
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
    name: '03_document_upload',
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
    name: '04_signal_extraction',
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
    name: '05_attract_strategy',
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
    name: '06_feedback_letter',
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
    name: '07_interviewer_brief',
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
    name: '08_ending',
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

(async () => {
  console.log('🎬 ATTRACT チュートリアル動画 自動録画開始\n');
  console.log(`ffmpeg: ${FFMPEG}\n`);

  const browser = await chromium.launch({ headless: true });

  // Record each scene
  for (const scene of SCENES) {
    const dur = DURATIONS[scene.name];
    console.log(`📹 Recording ${scene.name} (${dur}s)...`);

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
      console.log(`  ✅ ${targetPath}`);
    } else {
      console.log(`  ⚠️  Video file not found`);
    }
  }

  await browser.close();

  // Combine video + audio + subtitles for each scene
  console.log('\n🔧 Combining scenes with audio and subtitles...\n');

  const sceneOutputs = [];
  for (const scene of SCENES) {
    const videoFile = path.join(VIDEO_DIR, 'scenes', `${scene.name}.webm`);
    const audioFile = path.join(AUDIO_DIR, `${scene.name}.mp3`);
    const subtitleFile = path.join(SUB_DIR, `${scene.name}.srt`);
    const outputFile = path.join(VIDEO_DIR, 'scenes', `${scene.name}_final.mp4`);

    if (!fs.existsSync(videoFile)) { console.log(`  ⚠️ Skip ${scene.name}`); continue; }

    const subPathEscaped = subtitleFile.replace(/\\/g, '/').replace(/:/g, '\\\\:');

    // Try with subtitles first
    const cmdSub = `"${FFMPEG}" -y -i "${videoFile}" -i "${audioFile}" -filter_complex "[0:v]subtitles='${subPathEscaped}':force_style='FontName=Noto Sans JP,FontSize=24,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,BorderStyle=3,Outline=2,Shadow=1,Alignment=2,MarginV=60,Bold=1'[v]" -map "[v]" -map 1:a -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k -shortest "${outputFile}"`;

    console.log(`  Processing ${scene.name}...`);
    try {
      execSync(cmdSub, { stdio: 'pipe', timeout: 180000 });
      sceneOutputs.push(outputFile);
      console.log(`  ✅ ${scene.name}_final.mp4 (with subtitles)`);
    } catch (e) {
      // Fallback without subtitles
      const cmdNoSub = `"${FFMPEG}" -y -i "${videoFile}" -i "${audioFile}" -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k -shortest "${outputFile}"`;
      try {
        execSync(cmdNoSub, { stdio: 'pipe', timeout: 180000 });
        sceneOutputs.push(outputFile);
        console.log(`  ✅ ${scene.name}_final.mp4 (no subtitles)`);
      } catch (e2) {
        console.log(`  ❌ Failed: ${e2.message?.substring(0, 200)}`);
      }
    }
  }

  // Concatenate all scenes
  if (sceneOutputs.length > 0) {
    const concatFile = path.join(VIDEO_DIR, 'concat_list.txt');
    fs.writeFileSync(concatFile, sceneOutputs.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n'));

    const finalOutput = path.join(VIDEO_DIR, 'ATTRACT_tutorial_complete.mp4');
    const concatCmd = `"${FFMPEG}" -y -f concat -safe 0 -i "${concatFile}" -c copy "${finalOutput}"`;

    console.log('\n🎬 Concatenating final video...');
    try {
      execSync(concatCmd, { stdio: 'pipe', timeout: 300000 });
      const sizeMB = (fs.statSync(finalOutput).size / (1024 * 1024)).toFixed(1);
      console.log(`\n✅ 完成！`);
      console.log(`📁 ${finalOutput}`);
      console.log(`📏 ${sizeMB} MB`);
    } catch (e) {
      console.log(`  ❌ Concat failed`);
    }
  }

  console.log('\n🎬 録画完了！');
})();

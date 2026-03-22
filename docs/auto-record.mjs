/**
 * ATTRACT チュートリアル動画 自動録画スクリプト v5
 * - ブランドスプラッシュ画面（冒頭）
 * - カーソル表示＋赤丸クリックインジケーター
 * - Playwright録画＋ffmpeg音声合成
 */

import { chromium } from 'playwright';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://attract-prototype.vercel.app';
const AUDIO_DIR = 'C:/Users/K-USER01027/recruitment-journey/docs/tutorial-audio';
const VIDEO_DIR = 'C:/Users/K-USER01027/recruitment-journey/docs/tutorial-video';
const FFMPEG = 'C:/Users/K-USER01027/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin/ffmpeg.exe';
const FFPROBE = 'C:/Users/K-USER01027/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin/ffprobe.exe';

fs.mkdirSync(VIDEO_DIR, { recursive: true });
fs.mkdirSync(path.join(VIDEO_DIR, 'scenes'), { recursive: true });

const sleep = ms => new Promise(r => setTimeout(r, ms));

function getAudioDuration(audioFile) {
  try {
    const result = execSync(
      `"${FFPROBE}" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioFile}"`,
      { encoding: 'utf-8', timeout: 10000 }
    );
    return parseFloat(result.trim());
  } catch { return null; }
}

// ─── Cursor & Click Indicator Helpers ───

// Inject a visible cursor + click indicator system into the page
async function injectCursorSystem(page) {
  await page.evaluate(() => {
    // Custom cursor
    const cursor = document.createElement('div');
    cursor.id = '__tutorial_cursor';
    cursor.style.cssText = `
      position: fixed; z-index: 99999; pointer-events: none;
      width: 20px; height: 20px;
      background: white; border: 2px solid #333; border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      transform: translate(-50%, -50%);
      transition: left 0.4s ease, top 0.4s ease;
      left: -100px; top: -100px;
    `;
    document.body.appendChild(cursor);

    // Click ring container
    const ringContainer = document.createElement('div');
    ringContainer.id = '__tutorial_rings';
    ringContainer.style.cssText = 'position:fixed;z-index:99998;pointer-events:none;top:0;left:0;width:100%;height:100%;';
    document.body.appendChild(ringContainer);

    // Expose functions
    window.__moveCursor = (x, y) => {
      cursor.style.left = x + 'px';
      cursor.style.top = y + 'px';
    };

    window.__showClickRing = (x, y) => {
      const ring = document.createElement('div');
      ring.style.cssText = `
        position: fixed; pointer-events: none;
        left: ${x}px; top: ${y}px;
        width: 0; height: 0;
        border: 3px solid #ef4444;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        animation: __clickRingPulse 1.2s ease-out forwards;
      `;
      ringContainer.appendChild(ring);

      // Add animation keyframes if not already added
      if (!document.getElementById('__clickRingStyle')) {
        const style = document.createElement('style');
        style.id = '__clickRingStyle';
        style.textContent = `
          @keyframes __clickRingPulse {
            0% { width: 0; height: 0; opacity: 1; border-width: 3px; }
            50% { width: 60px; height: 60px; opacity: 0.8; border-width: 3px; }
            100% { width: 80px; height: 80px; opacity: 0; border-width: 2px; }
          }
        `;
        document.head.appendChild(style);
      }

      setTimeout(() => ring.remove(), 1300);
    };

    window.__hideCursor = () => {
      cursor.style.left = '-100px';
      cursor.style.top = '-100px';
    };
  });
}

// Move cursor to element and show click ring
async function pointAndClick(page, selector, opts = {}) {
  const { click = true, delay = 600 } = opts;
  try {
    const el = await page.$(selector);
    if (!el) return;
    const box = await el.boundingBox();
    if (!box) return;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.evaluate(([cx, cy]) => window.__moveCursor(cx, cy), [x, y]);
    await sleep(delay);
    if (click) {
      await page.evaluate(([cx, cy]) => window.__showClickRing(cx, cy), [x, y]);
      await sleep(400);
      await el.click();
    }
  } catch (e) {
    // Selector not found, skip
  }
}

// Move cursor to coordinates
async function moveCursorTo(page, x, y) {
  await page.evaluate(([cx, cy]) => window.__moveCursor(cx, cy), [x, y]);
}

async function hideCursor(page) {
  await page.evaluate(() => window.__hideCursor && window.__hideCursor());
}

async function smoothScroll(page, targetY, steps = 10) {
  const currentY = await page.evaluate(() => window.scrollY);
  const diff = targetY - currentY;
  for (let i = 1; i <= steps; i++) {
    await page.evaluate(y => window.scrollTo({ top: y, behavior: 'auto' }), currentY + (diff * i / steps));
    await sleep(60);
  }
}

// ─── Splash Screen HTML ───
const SPLASH_HTML = `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1440px; height: 900px; overflow: hidden;
    background: linear-gradient(145deg, #0d9488 0%, #14b8a6 30%, #06b6d4 60%, #0891b2 100%);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Noto Sans JP', 'Meiryo', sans-serif;
    position: relative;
  }
  .container { text-align: center; animation: fadeIn 1.2s ease; position: relative; z-index: 2; }
  @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
  .logo-box {
    width: 140px; height: 140px; background: rgba(255,255,255,0.18);
    border-radius: 36px; display: flex; align-items: center; justify-content: center;
    margin: 0 auto 40px; backdrop-filter: blur(12px);
    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  }
  .logo-icon { font-size: 72px; filter: brightness(1.2); }
  .brand { font-size: 84px; font-weight: 900; color: white; letter-spacing: 16px; margin-bottom: 12px; text-shadow: 0 4px 20px rgba(0,0,0,0.2); }
  .catch { font-size: 26px; color: rgba(255,255,255,0.95); font-weight: 600; line-height: 1.9; margin-top: 32px; }
  .catch span { display: block; }
  .by { font-size: 15px; color: rgba(255,255,255,0.55); margin-top: 48px; letter-spacing: 2px; font-weight: 500; }
  .deco1, .deco2, .deco3, .deco4 { position: absolute; border-radius: 50%; }
  .deco1 { width: 500px; height: 500px; top: -160px; right: -120px; background: rgba(255,255,255,0.06); }
  .deco2 { width: 350px; height: 350px; bottom: -80px; left: -60px; background: rgba(255,255,255,0.05); }
  .deco3 { width: 250px; height: 250px; top: 40%; left: 8%; background: rgba(255,255,255,0.04); }
  .deco4 { width: 180px; height: 180px; top: 15%; right: 12%; background: rgba(6,182,212,0.3); filter: blur(40px); }
</style></head>
<body>
  <div class="deco1"></div><div class="deco2"></div><div class="deco3"></div><div class="deco4"></div>
  <div class="container">
    <div class="logo-box"><div class="logo-icon">⚡</div></div>
    <div class="brand">カケハシOS</div>
    <div class="catch">
      <span>～一人ひとりとのつながり強化が、採用成功を実現させる～</span>
    </div>
    <div class="by">株式会社カケハシスカイ</div>
  </div>
</body>
</html>
`;


// ─── Scene Definitions ───
// 順序: opening → login → dashboard → REVP（土台） →
//       候補者取込 → 書類 → シグナル → 戦略 → レター → ブリーフ → ending
const SCENES = [
  {
    name: '00_opening',
    actions: async (page, dur) => {
      await page.setContent(SPLASH_HTML);
      await sleep(dur * 1000);
    },
  },
  {
    name: '01_login',
    actions: async (page, dur) => {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
      await injectCursorSystem(page);
      const step = (dur * 1000) / 5;
      await sleep(step);
      await pointAndClick(page, 'input[type="email"]', { delay: 500 });
      await page.fill('input[type="email"]', 'sato@technovation.co.jp');
      await sleep(step);
      await pointAndClick(page, 'input[type="password"]', { delay: 500 });
      await page.fill('input[type="password"]', 'password123');
      await sleep(step);
      await pointAndClick(page, 'button[type="submit"]', { delay: 800 });
      await sleep(step);
      await hideCursor(page);
      await sleep(step);
    },
  },
  {
    name: '02_dashboard',
    actions: async (page, dur) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await injectCursorSystem(page);
      const step = (dur * 1000) / 9;
      await sleep(step);
      await pointAndClick(page, '.relative button', { delay: 600 });
      await sleep(step * 0.7);
      await page.click('h1');
      await sleep(step * 0.3);
      await moveCursorTo(page, 400, 230);
      await sleep(step);
      await hideCursor(page);
      await smoothScroll(page, 350);
      await sleep(step);
      await moveCursorTo(page, 500, 400);
      await sleep(step);
      await smoothScroll(page, 650);
      await sleep(step);
      await smoothScroll(page, 950);
      await sleep(step);
      await moveCursorTo(page, 500, 500);
      await sleep(step);
      await smoothScroll(page, 1400);
      await hideCursor(page);
      await sleep(step);
    },
  },
  {
    // REVP診断 — ダッシュボード直後、土台として紹介
    name: '03_revp_report',
    actions: async (page, dur) => {
      const step = (dur * 1000) / 7;
      await page.goto(`${BASE_URL}/settings/revp-report`, { waitUntil: 'networkidle' });
      await injectCursorSystem(page);
      await sleep(step);
      // Point to EVP scores
      await moveCursorTo(page, 700, 350);
      await sleep(step);
      await smoothScroll(page, 300);
      await sleep(step);
      await smoothScroll(page, 550);
      await sleep(step);
      // Click tab 2 (認識ギャップ)
      await pointAndClick(page, 'button:has-text("認識ギャップ")', { delay: 400 });
      await sleep(step);
      await smoothScroll(page, 300);
      await sleep(step);
      await smoothScroll(page, 0);
      await hideCursor(page);
      await sleep(step);
    },
  },
  {
    name: '04_register_candidate',
    actions: async (page, dur) => {
      const step = (dur * 1000) / 5;
      await page.goto(`${BASE_URL}/candidates`, { waitUntil: 'networkidle' });
      await injectCursorSystem(page);
      await sleep(step);
      await pointAndClick(page, 'a[href="/candidates/new"]', { delay: 600, click: true });
      await sleep(step);
      await injectCursorSystem(page);
      await smoothScroll(page, 200);
      await sleep(step);
      await smoothScroll(page, 500);
      await sleep(step);
      await hideCursor(page);
      await sleep(step);
    },
  },
  {
    // スカウトメール（新機能）
    name: '05_scout_mail',
    actions: async (page, dur) => {
      const step = (dur * 1000) / 5;
      await page.goto(`${BASE_URL}/candidates/cand_001/scout-mail`, { waitUntil: 'networkidle' });
      await injectCursorSystem(page);
      await sleep(step);
      await moveCursorTo(page, 700, 350);
      await sleep(step);
      await smoothScroll(page, 300);
      await sleep(step);
      await smoothScroll(page, 600);
      await sleep(step);
      await hideCursor(page);
      await smoothScroll(page, 0);
      await sleep(step);
    },
  },
  {
    name: '06_document_upload',
    actions: async (page, dur) => {
      const step = (dur * 1000) / 5;
      await page.goto(`${BASE_URL}/candidates/cand_001/documents`, { waitUntil: 'networkidle' });
      await injectCursorSystem(page);
      await sleep(step);
      await smoothScroll(page, 300);
      await sleep(step);
      await smoothScroll(page, 600);
      await sleep(step);
      await smoothScroll(page, 900);
      await sleep(step);
      await hideCursor(page);
      await sleep(step);
    },
  },
  {
    name: '07_signal_extraction',
    actions: async (page, dur) => {
      const step = (dur * 1000) / 5;
      await page.goto(`${BASE_URL}/candidates/cand_001/signal-input`, { waitUntil: 'networkidle' });
      await injectCursorSystem(page);
      await sleep(step);
      await moveCursorTo(page, 500, 400);
      await sleep(step);
      await smoothScroll(page, 300);
      await sleep(step);
      await smoothScroll(page, 700);
      await sleep(step);
      await hideCursor(page);
      await sleep(step);
    },
  },
  {
    // AI面接（AIレコメン連携・新機能）
    name: '08_ai_interview',
    actions: async (page, dur) => {
      const step = (dur * 1000) / 5;
      await page.goto(`${BASE_URL}/candidates/cand_001/ai-interview`, { waitUntil: 'networkidle' });
      await injectCursorSystem(page);
      await sleep(step);
      await moveCursorTo(page, 700, 350);
      await sleep(step);
      await smoothScroll(page, 300);
      await sleep(step);
      await smoothScroll(page, 600);
      await sleep(step);
      await hideCursor(page);
      await smoothScroll(page, 0);
      await sleep(step);
    },
  },
  {
    name: '09_attract_strategy',
    actions: async (page, dur) => {
      const step = (dur * 1000) / 5;
      await page.goto(`${BASE_URL}/candidates/cand_001/attract`, { waitUntil: 'networkidle' });
      await injectCursorSystem(page);
      await sleep(step);
      await moveCursorTo(page, 700, 300);
      await sleep(step);
      await smoothScroll(page, 350);
      await sleep(step);
      await moveCursorTo(page, 1100, 350);
      await sleep(step);
      await smoothScroll(page, 700);
      await hideCursor(page);
      await sleep(step);
    },
  },
  {
    name: '10_feedback_letter',
    actions: async (page, dur) => {
      const step = (dur * 1000) / 5;
      await page.goto(`${BASE_URL}/candidates/cand_001/feedback-letter`, { waitUntil: 'networkidle' });
      await injectCursorSystem(page);
      await sleep(step);
      await smoothScroll(page, 200);
      await sleep(step);
      await smoothScroll(page, 400);
      await sleep(step);
      await moveCursorTo(page, 700, 600);
      await sleep(step);
      await hideCursor(page);
      await smoothScroll(page, 550);
      await sleep(step);
    },
  },
  {
    name: '11_interviewer_brief',
    actions: async (page, dur) => {
      const step = (dur * 1000) / 5;
      await page.goto(`${BASE_URL}/candidates/cand_001/brief`, { waitUntil: 'networkidle' });
      await injectCursorSystem(page);
      await sleep(step);
      await moveCursorTo(page, 500, 300);
      await sleep(step);
      await smoothScroll(page, 300);
      await sleep(step);
      await moveCursorTo(page, 700, 400);
      await sleep(step);
      await smoothScroll(page, 600);
      await hideCursor(page);
      await sleep(step);
    },
  },
  {
    name: '12_ending',
    actions: async (page, dur) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      const step = (dur * 1000) / 3;
      await sleep(step);
      await smoothScroll(page, 400);
      await sleep(step);
      await smoothScroll(page, 0);
      await sleep(step);
    },
  },
];

(async () => {
  console.log('🎬 カケハシOS チュートリアル動画 自動録画開始 (v6)\n');

  // Get actual audio durations
  const DURATIONS = {};
  for (const scene of SCENES) {
    const audioFile = path.join(AUDIO_DIR, `${scene.name}.mp3`);
    if (fs.existsSync(audioFile)) {
      const dur = getAudioDuration(audioFile);
      DURATIONS[scene.name] = dur ? dur + 1.5 : 20;
    } else {
      DURATIONS[scene.name] = 20;
    }
    console.log(`  ${scene.name}: ${DURATIONS[scene.name].toFixed(1)}s`);
  }

  const browser = await chromium.launch({ headless: true });

  for (const scene of SCENES) {
    const dur = DURATIONS[scene.name];
    console.log(`\n📹 Recording ${scene.name} (${dur.toFixed(1)}s)...`);

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
      console.log(`  ✅ saved`);
    } else {
      console.log(`  ⚠️ video not found`);
    }
  }

  await browser.close();
  console.log('\n🎬 全シーン録画完了！次に burn-subtitles.mjs で字幕焼き込み＋結合してください');
})();

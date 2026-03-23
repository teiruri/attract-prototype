/**
 * HR FARM チュートリアル動画 自動録画スクリプト v10
 * - 12シーン構成（スカウトメール除外）
 * - Windows風矢印カーソル
 * - 字幕タイムスタンプ基準の精密カーソル同期
 * - ボタン/要素の赤枠ハイライト
 * - ログイン白画面修正（プリロード + 待機強化）
 */

import { chromium } from 'playwright';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://attract-prototype.vercel.app';
const AUDIO_DIR = 'C:/Users/K-USER01027/recruitment-journey/docs/tutorial-audio';
const VIDEO_DIR = 'C:/Users/K-USER01027/recruitment-journey/docs/tutorial-video';
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

// ─── Windows Arrow Cursor SVG ───
const ARROW_SVG = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="32" viewBox="0 0 28 32">
  <defs><filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="1" dy="2" stdDeviation="1.5" flood-opacity="0.35"/></filter></defs>
  <path d="M2 1L2 25L8.5 18.5L13.5 28L17.5 26L12.5 16.5L21 16.5Z" fill="white" stroke="black" stroke-width="1.3" stroke-linejoin="round" filter="url(#s)"/>
</svg>`)}`;

// ─── Cursor & Highlight System ───

async function injectCursorSystem(page) {
  await page.evaluate((svgUrl) => {
    if (document.getElementById('__tutorial_cursor')) return;

    const cursor = document.createElement('div');
    cursor.id = '__tutorial_cursor';
    cursor.style.cssText = `
      position: fixed; z-index: 99999; pointer-events: none;
      width: 28px; height: 32px;
      background-image: url("${svgUrl}");
      background-size: contain; background-repeat: no-repeat;
      transition: left 0.45s cubic-bezier(0.25, 0.1, 0.25, 1), top 0.45s cubic-bezier(0.25, 0.1, 0.25, 1);
      left: -100px; top: -100px;
    `;
    document.body.appendChild(cursor);

    const hlContainer = document.createElement('div');
    hlContainer.id = '__tutorial_highlights';
    hlContainer.style.cssText = 'position:fixed;z-index:99997;pointer-events:none;top:0;left:0;width:100%;height:100%;';
    document.body.appendChild(hlContainer);

    if (!document.getElementById('__tutorialStyles')) {
      const style = document.createElement('style');
      style.id = '__tutorialStyles';
      style.textContent = `
        @keyframes __hlPulse {
          0% { opacity: 0; transform: scale(0.97); }
          15% { opacity: 1; transform: scale(1); }
          75% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.01); }
        }
      `;
      document.head.appendChild(style);
    }

    window.__moveCursor = (x, y) => {
      cursor.style.left = x + 'px';
      cursor.style.top = y + 'px';
    };

    window.__highlightRect = (x, y, w, h, duration = 2000) => {
      const hl = document.createElement('div');
      hl.style.cssText = `
        position: fixed; pointer-events: none;
        left: ${x - 4}px; top: ${y - 4}px;
        width: ${w + 8}px; height: ${h + 8}px;
        border: 3px solid #ef4444;
        border-radius: 8px;
        box-shadow: 0 0 16px rgba(239, 68, 68, 0.5), inset 0 0 8px rgba(239, 68, 68, 0.1);
        animation: __hlPulse ${duration}ms ease-out forwards;
      `;
      hlContainer.appendChild(hl);
      setTimeout(() => hl.remove(), duration + 100);
    };

    window.__hideCursor = () => {
      cursor.style.left = '-100px';
      cursor.style.top = '-100px';
    };
  }, ARROW_SVG);
}

async function moveCursorTo(page, x, y) {
  await page.evaluate(([cx, cy]) => window.__moveCursor(cx, cy), [x, y]);
}

async function moveCursorToEl(page, selector) {
  try {
    const el = await page.$(selector);
    if (!el) return;
    const box = await el.boundingBox();
    if (!box) return;
    await page.evaluate(([cx, cy]) => window.__moveCursor(cx, cy), [box.x + box.width / 2 - 2, box.y + box.height / 2 - 2]);
  } catch {}
}

async function highlightEl(page, selector, duration = 2000) {
  try {
    const el = await page.$(selector);
    if (!el) return;
    const box = await el.boundingBox();
    if (!box) return;
    await page.evaluate(([bx, by, bw, bh, dur]) => window.__highlightRect(bx, by, bw, bh, dur), [box.x, box.y, box.width, box.height, duration]);
  } catch {}
}

async function pointAndClick(page, selector, opts = {}) {
  const { click = true, delay = 400, highlight = true, highlightDuration = 2000 } = opts;
  try {
    const el = await page.$(selector);
    if (!el) return;
    const box = await el.boundingBox();
    if (!box) return;
    await page.evaluate(([cx, cy]) => window.__moveCursor(cx, cy), [box.x + box.width / 2 - 2, box.y + box.height / 2 - 2]);
    await sleep(delay);
    if (highlight) {
      await page.evaluate(([bx, by, bw, bh, dur]) => window.__highlightRect(bx, by, bw, bh, dur), [box.x, box.y, box.width, box.height, highlightDuration]);
      await sleep(300);
    }
    if (click) await el.click();
  } catch {}
}

async function hideCursor(page) {
  await page.evaluate(() => window.__hideCursor && window.__hideCursor());
}

async function smoothScroll(page, targetY, steps = 12) {
  const currentY = await page.evaluate(() => window.scrollY);
  const diff = targetY - currentY;
  for (let i = 1; i <= steps; i++) {
    await page.evaluate(y => window.scrollTo({ top: y, behavior: 'auto' }), currentY + (diff * i / steps));
    await sleep(50);
  }
}

// Navigate and wait for full render
async function navigateTo(page, url, waitSelector = 'main') {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  try { await page.waitForSelector(waitSelector, { state: 'visible', timeout: 10000 }); } catch {}
  await sleep(600);
  await injectCursorSystem(page);
}

// ─── Timed Sequence Helper ───
// Executes cursor actions at precise timestamps (in seconds)
// Each action: [timestamp_seconds, async_function]
async function timedSequence(actions, totalDuration) {
  const t0 = Date.now();
  for (const [ts, fn] of actions) {
    const targetMs = t0 + ts * 1000;
    const waitMs = targetMs - Date.now();
    if (waitMs > 0) await sleep(waitMs);
    await fn();
  }
  // Wait remaining time
  const remaining = (totalDuration * 1000) - (Date.now() - t0);
  if (remaining > 0) await sleep(remaining);
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
    <div class="brand">HR FARM</div>
    <div class="catch">～応募者の志望度を耕し、採用確率を高める仕組み～</div>
    <div class="by">KAKEHASHI SKY</div>
  </div>
</body>
</html>
`;

// ─── Scene Definitions (16 scenes) ───
const SCENES = [
  {
    // 00 Opening — スプラッシュ画面
    name: '00_opening',
    actions: async (page, dur) => {
      await page.setContent(SPLASH_HTML);
      await sleep(dur * 1000);
    },
  },
  {
    // 01 Login — 「メールアドレスとパスワードでログインします」(0.2-4.3s)
    name: '01_login',
    actions: async (page, dur) => {
      // Start with white background matching login page — prevents any loading flash
      await page.setContent(`<!DOCTYPE html><html><body style="margin:0;background:#fff;width:1440px;height:900px;"></body></html>`);
      // Navigate in background: fetch page while showing white bg
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
      try { await page.waitForSelector('input[type="email"]', { state: 'visible', timeout: 15000 }); } catch {}
      try { await page.waitForSelector('button[type="submit"]', { state: 'visible', timeout: 10000 }); } catch {}
      // Wait for fonts, animations, and full hydration to settle
      await sleep(1500);
      await injectCursorSystem(page);

      await timedSequence([
        // 0.2: 「メールアドレスとパスワードで…」→ cursor to email
        [0.0, async () => { await moveCursorTo(page, 350, 380); }],
        [0.5, async () => {
          await pointAndClick(page, 'input[type="email"]', { click: true, delay: 300, highlightDuration: 1500 });
          await page.fill('input[type="email"]', 'sato@technovation.co.jp');
        }],
        // 1.8: cursor to password
        [1.8, async () => {
          await pointAndClick(page, 'input[type="password"]', { click: true, delay: 300, highlightDuration: 1500 });
          await page.fill('input[type="password"]', 'password123');
        }],
        // 3.2: cursor to login button + highlight + click
        [3.2, async () => {
          await pointAndClick(page, 'button[type="submit"]', { click: true, delay: 400, highlightDuration: 2000 });
        }],
        // 4.5: fade cursor
        [4.5, async () => { await hideCursor(page); }],
      ], dur);
    },
  },
  {
    // 02 Dashboard — KPI + ファネル
    // Subtitles: 0.2-2.23 / 2.29-4.32 / 4.38-8.24 / 8.30-13.03 / 13.03-16.28 / 16.34-20.60 / 20.66-22.89 / 22.95-26.95
    name: '02_dashboard',
    actions: async (page, dur) => {
      await navigateTo(page, BASE_URL, 'h1');

      await timedSequence([
        // 0.2: 「ダッシュボードです」→ cursor at title
        [0.2, async () => { await moveCursorTo(page, 350, 120); }],

        // 2.3: 「右上で求人を選ぶと」→ cursor to job selector + highlight + click
        [2.3, async () => {
          await pointAndClick(page, 'select, .relative button, [class*="selector"]', { click: true, delay: 400, highlightDuration: 2000 });
        }],

        // 4.4: 「画面がその求人の数値に切り替わります」→ close dropdown, sweep across
        [4.4, async () => { try { await page.click('h1'); } catch {} }],
        [4.8, async () => { await moveCursorTo(page, 350, 250); }],
        [5.5, async () => { await moveCursorTo(page, 700, 250); }],

        // 8.3: 「選考中の人数、要対応タスク、内定予測」→ visit KPI cards
        [8.3, async () => { await moveCursorTo(page, 350, 260); }],
        [9.5, async () => { await moveCursorTo(page, 590, 260); }],
        [10.8, async () => { await moveCursorTo(page, 830, 260); }],

        // 13.0: 「承諾予測の4つの数値」→ 4th card
        [13.0, async () => { await moveCursorTo(page, 1070, 260); }],

        // 16.3: 「対応すべきタスクが優先順で並びます」→ scroll to tasks
        [16.3, async () => { await smoothScroll(page, 400); }],
        [17.0, async () => { await moveCursorTo(page, 500, 430); }],
        [18.5, async () => { await moveCursorTo(page, 500, 490); }],

        // 20.7: 「さらに選考ファネルで」→ scroll to funnel
        [20.7, async () => { await smoothScroll(page, 750); }],
        [21.3, async () => { await moveCursorTo(page, 400, 470); }],

        // 23.0: 「各段階の人数やAIの予測値を確認できます」→ trace funnel
        [23.0, async () => { await moveCursorTo(page, 500, 500); }],
        [24.5, async () => { await smoothScroll(page, 1000); }],
        [25.0, async () => { await moveCursorTo(page, 600, 480); }],
        [26.5, async () => { await hideCursor(page); }],
      ], dur);
    },
  },
  {
    // 03 REVP Report — 土台機能
    // Subtitles: 0.2-1.0 / 1.06-4.77 / 4.83-6.69 / 6.75-7.68 / 7.74-11.45 / 11.51-14.30 / 14.36-16.83 / 16.89-19.83 / 19.89-22.36 / 22.42-25.21 / 25.27-27.28 / 27.34-30.90 / 30.96-32.97 / 33.03-37.95
    name: '03_revp_report',
    actions: async (page, dur) => {
      await navigateTo(page, `${BASE_URL}/settings/revp-report`, 'h1');

      await timedSequence([
        // 0.2: 「ここで」→ cursor appears
        [0.2, async () => { await moveCursorTo(page, 400, 200); }],

        // 1.1: 「ATTRACTの土台となる機能をご紹介します」→ cursor at heading
        [1.1, async () => { await moveCursorToEl(page, 'h1'); }],

        // 4.8: 「REVP診断レポートです」→ highlight title
        [4.8, async () => { await highlightEl(page, 'h1', 2000); }],

        // 6.8: 「REVPとは」→ cursor at description
        [6.8, async () => { await moveCursorTo(page, 600, 300); }],

        // 7.7: 「求職者から見た自社の採用力を診断する仕組み」→ cursor at data area
        [7.7, async () => { await moveCursorTo(page, 700, 350); }],

        // 11.5: 「内定者や社員のサーベイ結果をもとに」→ cursor at survey data
        [11.5, async () => { await moveCursorTo(page, 500, 380); }],

        // 14.4: 「自社の魅力を7つの項目で数値化」→ sweep items
        [14.4, async () => { await moveCursorTo(page, 350, 420); }],
        [15.5, async () => { await moveCursorTo(page, 700, 420); }],

        // 16.9: 「職種ごとに…ターゲットに対して」→ scroll & point
        [16.9, async () => { await smoothScroll(page, 300); }],
        [17.5, async () => { await moveCursorTo(page, 600, 400); }],

        // 19.9: 「どんな魅力をアピールすべきか」→ cursor at appeal items
        [19.9, async () => { await moveCursorTo(page, 800, 380); }],

        // 22.4: 「データの裏付けも加味して設定」→ cursor at data
        [22.4, async () => { await moveCursorTo(page, 600, 350); }],

        // 25.3: 「人事と現場の認識のズレ」→ click tab + highlight
        [25.3, async () => {
          await smoothScroll(page, 200);
        }],
        [25.8, async () => {
          await pointAndClick(page, 'button:has-text("認識ギャップ")', { delay: 400, highlightDuration: 2500 });
        }],

        // 27.3: 「入社前と入社後のギャップも見える化」→ sweep gap data
        [27.3, async () => { await smoothScroll(page, 350); }],
        [28.0, async () => { await moveCursorTo(page, 500, 400); }],
        [29.5, async () => { await moveCursorTo(page, 800, 430); }],

        // 31.0: 「この診断内容を土台として」→ scroll back
        [31.0, async () => { await smoothScroll(page, 0); }],
        [31.5, async () => { await moveCursorTo(page, 400, 250); }],

        // 33.0: 「候補者ひとりひとり…ひきつけ戦略」→ cursor at summary
        [33.0, async () => { await moveCursorTo(page, 600, 300); }],
        [36.0, async () => { await hideCursor(page); }],
      ], dur);
    },
  },
  {
    // 04 Register Candidate
    // Subtitles: 0.2-4.13 / 4.19-6.70 / 6.76-7.56 / 7.62-12.62 / 12.68-16.14 / 16.20-17.95
    name: '04_register_candidate',
    actions: async (page, dur) => {
      await navigateTo(page, `${BASE_URL}/candidates`, 'h1');

      await timedSequence([
        // 0.2: 「候補者の取り込みは、求人媒体や採用管理ツールから」→ cursor at list
        [0.2, async () => { await moveCursorTo(page, 500, 300); }],

        // 4.2: 「CSVで一括取り込みが可能」→ highlight add/import button
        [4.2, async () => {
          await pointAndClick(page, 'a[href="/candidates/new"]', { click: false, delay: 400, highlightDuration: 2000 });
        }],

        // 6.8: 「また」→ small move
        [6.8, async () => { await moveCursorTo(page, 600, 350); }],

        // 7.6: 「履歴書やエントリーシートを個別にアップロード」→ click to navigate
        [7.6, async () => {
          await pointAndClick(page, 'a[href="/candidates/new"]', { click: true, delay: 300, highlightDuration: 1500 });
        }],
        [9.0, async () => {
          await injectCursorSystem(page);
          await moveCursorTo(page, 500, 350);
        }],
        [10.0, async () => { await smoothScroll(page, 200); }],

        // 12.7: 「どちらの場合も、AIが自動で情報を読み取り」→ cursor at form
        [12.7, async () => { await moveCursorTo(page, 600, 400); }],
        [14.0, async () => { await smoothScroll(page, 400); }],

        // 16.2: 「候補者のカルテを作成します」→ cursor at karte
        [16.2, async () => { await moveCursorTo(page, 500, 450); }],
        [17.5, async () => { await hideCursor(page); }],
      ], dur);
    },
  },
  {
    // 05 Document Upload (was 06)
    // Subtitles: 0.2-1.35 / 1.41-5.35 / 5.41-7.05 / 7.11-10.07 / 10.13-14.07 / 14.13-15.95
    name: '05_document_upload',
    actions: async (page, dur) => {
      await navigateTo(page, `${BASE_URL}/candidates/cand_001/documents`, 'h1, h2');

      await timedSequence([
        // 0.2: 「書類管理では」→ cursor at heading
        [0.2, async () => { await moveCursorToEl(page, 'h1, h2'); }],

        // 1.4: 「アップロードした履歴書をAIが自動で解析」→ cursor at document area
        [1.4, async () => { await moveCursorTo(page, 500, 350); }],
        [3.0, async () => { await moveCursorTo(page, 700, 380); }],

        // 5.4: 「技術、資格、経歴を」→ sweep parsed items
        [5.4, async () => { await smoothScroll(page, 250); }],
        [5.8, async () => { await moveCursorTo(page, 400, 380); }],
        [6.5, async () => { await moveCursorTo(page, 700, 380); }],

        // 7.1: 「整理されたデータとして取り出します」→ cursor at structured data
        [7.1, async () => { await smoothScroll(page, 450); }],
        [8.0, async () => { await moveCursorTo(page, 500, 400); }],

        // 10.1: 「この候補者をひきつけるためのヒント」→ cursor at hints
        [10.1, async () => { await smoothScroll(page, 650); }],
        [11.0, async () => { await moveCursorTo(page, 600, 420); }],

        // 14.1: 「自動で提案してくれます」→ cursor highlights
        [14.1, async () => { await moveCursorTo(page, 700, 450); }],
        [15.5, async () => { await hideCursor(page); }],
      ], dur);
    },
  },
  {
    // 06 Signal Extraction (was 07)
    // Subtitles: 0.2-1.80 / 1.86-6.46 / 6.52-11.31 / 11.37-15.95
    name: '06_signal_extraction',
    actions: async (page, dur) => {
      await navigateTo(page, `${BASE_URL}/candidates/cand_001/signal-input`, 'h1, h2');

      await timedSequence([
        // 0.2: 「面接が終わったら」→ cursor at heading
        [0.2, async () => { await moveCursorTo(page, 400, 200); }],

        // 1.9: 「録音データもしくはテキストメモをアップロードします」→ highlight upload
        [1.9, async () => {
          await pointAndClick(page, 'button:has-text("アップロード"), textarea, [class*="upload"], [class*="drop"]', { click: false, delay: 400, highlightDuration: 2500 });
        }],
        [3.5, async () => { await moveCursorTo(page, 600, 400); }],

        // 6.5: 「AIが面接官のコメントや候補者が何を大切に」→ scroll to results
        [6.5, async () => { await smoothScroll(page, 300); }],
        [7.2, async () => { await moveCursorTo(page, 500, 400); }],
        [9.0, async () => { await moveCursorTo(page, 700, 430); }],

        // 11.4: 「何に興味…何を心配…分析」→ sweep signal items
        [11.4, async () => { await smoothScroll(page, 550); }],
        [12.0, async () => { await moveCursorTo(page, 400, 420); }],
        [13.5, async () => { await moveCursorTo(page, 700, 480); }],
        [15.5, async () => { await hideCursor(page); }],
      ], dur);
    },
  },
  {
    // 07 AI Interview (was 08)
    // Subtitles: 0.2-1.54 / 1.60-5.75 / 5.81-7.59 / 7.65-12.55 / 12.61-16.33 / 16.39-19.95
    name: '07_ai_interview',
    actions: async (page, dur) => {
      await navigateTo(page, `${BASE_URL}/candidates/cand_001/ai-interview`, 'h1, h2, [class*="text-2xl"]');

      await timedSequence([
        // 0.2: 「オプションとして」→ cursor appears
        [0.2, async () => { await moveCursorTo(page, 400, 200); }],

        // 1.6: 「アイエンター社…AIレコメン…連携可能」→ highlight header
        [1.6, async () => {
          await pointAndClick(page, 'h1, h2, [class*="text-2xl"]', { click: false, delay: 400, highlightDuration: 2500 });
        }],

        // 5.8: 「AI面接を実施した場合」→ cursor at results
        [5.8, async () => { await moveCursorTo(page, 600, 350); }],

        // 7.7: 「コミュニケーション内容は候補者情報として自動で取り込まれます」→ data section
        [7.7, async () => { await smoothScroll(page, 250); }],
        [8.5, async () => { await moveCursorTo(page, 500, 400); }],
        [10.5, async () => { await moveCursorTo(page, 700, 420); }],

        // 12.6: 「選考設計や合格レター、ブリーフィング、カルテなど」→ sweep integration items
        [12.6, async () => { await smoothScroll(page, 500); }],
        [13.5, async () => { await moveCursorTo(page, 400, 430); }],
        [14.5, async () => { await moveCursorTo(page, 600, 430); }],
        [15.5, async () => { await moveCursorTo(page, 800, 430); }],

        // 16.4: 「すべてのプロセスにAI面接のデータが反映」→ integration status
        [16.4, async () => { await moveCursorTo(page, 600, 480); }],
        [18.5, async () => { await hideCursor(page); }],
      ], dur);
    },
  },
  {
    // 08 Attract Strategy (was 09)
    // Subtitles: 0.2-2.47 / 2.53-7.07 / 7.13-10.54 / 10.60-13.62 / 13.68-17.95
    name: '08_attract_strategy',
    actions: async (page, dur) => {
      await navigateTo(page, `${BASE_URL}/candidates/cand_001/attract`, 'h1, h2');

      await timedSequence([
        // 0.2: 「ひきつけ戦略ボードです」→ title + highlight
        [0.2, async () => {
          await pointAndClick(page, 'h1, h2', { click: false, delay: 300, highlightDuration: 2000 });
        }],

        // 2.5: 「REVP診断の結果と候補者の本音をてらしあわせて」→ comparison area
        [2.5, async () => { await moveCursorTo(page, 400, 350); }],
        [4.5, async () => { await moveCursorTo(page, 700, 350); }],

        // 7.1: 「何をどう伝えれば響くか」→ strategy cards
        [7.1, async () => { await smoothScroll(page, 250); }],
        [7.8, async () => { await moveCursorTo(page, 600, 400); }],

        // 10.6: 「まだ伝えきれていないポイント」→ undelivered section
        [10.6, async () => { await moveCursorTo(page, 500, 450); }],
        [12.0, async () => { await smoothScroll(page, 450); }],

        // 13.7: 「面接ごとのシナリオも…AIが自動で設計」→ scenario section
        [13.7, async () => { await smoothScroll(page, 600); }],
        [14.5, async () => { await moveCursorTo(page, 700, 400); }],
        [16.5, async () => { await hideCursor(page); }],
      ], dur);
    },
  },
  {
    // 09 Development Feedback (NEW)
    name: '09_development',
    actions: async (page, dur) => {
      await navigateTo(page, `${BASE_URL}/candidates/cand_001/development`, 'h1, h2');

      await timedSequence([
        // 0.2: 「候補者育成フィードバック機能です」→ title highlight
        [0.2, async () => {
          await pointAndClick(page, 'h1, h2', { click: false, delay: 300, highlightDuration: 2500 });
        }],

        // 2.5: 「内定を出すにあたって…成長が必要か」→ gap analysis section
        [2.5, async () => { await moveCursorTo(page, 500, 350); }],
        [4.0, async () => { await moveCursorTo(page, 700, 380); }],

        // 6.0: 「何が不足しているかを…自動で分析」→ gap bars
        [6.0, async () => { await smoothScroll(page, 200); }],
        [7.0, async () => { await moveCursorTo(page, 600, 400); }],

        // 9.0: 「どう伝えれば候補者に前向きに受け止めてもらえるか」→ communication guide
        [9.0, async () => { await smoothScroll(page, 450); }],
        [10.0, async () => { await moveCursorTo(page, 500, 420); }],
        [12.0, async () => { await moveCursorTo(page, 700, 440); }],

        // 14.0: 「伝え方のガイドまでAIが提案」→ NG/OK examples
        [14.0, async () => { await smoothScroll(page, 650); }],
        [15.0, async () => { await moveCursorTo(page, 600, 430); }],

        // 17.0: 「建設的なフィードバックを行える」→ action plan
        [17.0, async () => { await smoothScroll(page, 800); }],
        [18.0, async () => { await moveCursorTo(page, 500, 450); }],
        [19.5, async () => { await hideCursor(page); }],
      ], dur);
    },
  },
  {
    // 10 Feedback Letter
    name: '10_feedback_letter',
    actions: async (page, dur) => {
      await navigateTo(page, `${BASE_URL}/candidates/cand_001/feedback-letter`, 'h1, h2');

      await timedSequence([
        [0.2, async () => { await moveCursorTo(page, 400, 200); }],
        [1.5, async () => { await moveCursorTo(page, 600, 350); }],
        [3.0, async () => { await moveCursorTo(page, 700, 380); }],
        [5.0, async () => {
          await pointAndClick(page, 'button:has-text("生成"), button:has-text("AI"), button:has-text("作成")', { click: false, delay: 300, highlightDuration: 2000 });
        }],
        [6.8, async () => { await smoothScroll(page, 200); }],
        [7.5, async () => { await moveCursorTo(page, 500, 400); }],
        [9.5, async () => { await moveCursorTo(page, 700, 420); }],
        [11.9, async () => { await smoothScroll(page, 350); }],
        [12.5, async () => { await moveCursorTo(page, 600, 430); }],
        [15.0, async () => { await moveCursorTo(page, 700, 400); }],
        [17.9, async () => { await smoothScroll(page, 500); }],
        [18.5, async () => {
          await pointAndClick(page, 'button:has-text("送信"), button:has-text("メール")', { click: false, delay: 300, highlightDuration: 2500 });
        }],
        [21.0, async () => { await hideCursor(page); }],
      ], dur);
    },
  },
  {
    // 11 Interviewer Brief
    name: '11_interviewer_brief',
    actions: async (page, dur) => {
      await navigateTo(page, `${BASE_URL}/candidates/cand_001/brief`, 'h1, h2');

      await timedSequence([
        [0.2, async () => {
          await pointAndClick(page, 'h1, h2', { click: false, delay: 300, highlightDuration: 2500 });
        }],
        [4.9, async () => { await moveCursorTo(page, 500, 350); }],
        [7.7, async () => { await moveCursorTo(page, 700, 370); }],
        [9.0, async () => { await smoothScroll(page, 250); }],
        [11.1, async () => { await moveCursorTo(page, 400, 400); }],
        [12.5, async () => { await moveCursorTo(page, 800, 400); }],
        [13.8, async () => { await smoothScroll(page, 450); }],
        [14.5, async () => { await moveCursorTo(page, 500, 420); }],
        [16.0, async () => { await moveCursorTo(page, 700, 440); }],
        [17.7, async () => { await moveCursorTo(page, 600, 460); }],
        [20.7, async () => { await hideCursor(page); }],
      ], dur);
    },
  },
  {
    // 12 Employee Talent Pool (NEW)
    name: '12_employee_pool',
    actions: async (page, dur) => {
      await navigateTo(page, `${BASE_URL}/talent-pool/employees`, 'h1, h2');

      await timedSequence([
        // 0.2: 「社員タレントプールです」→ title highlight
        [0.2, async () => {
          await pointAndClick(page, 'h1, h2', { click: false, delay: 300, highlightDuration: 2500 });
        }],

        // 2.5: 「部署遍歴や役職推移、表彰歴とともに管理」→ stats bar
        [2.5, async () => { await moveCursorTo(page, 400, 200); }],
        [4.0, async () => { await moveCursorTo(page, 800, 200); }],

        // 5.5: 「面接時に、候補者と似た経歴の社員を紹介」→ employee cards
        [5.5, async () => { await moveCursorTo(page, 400, 400); }],
        [7.0, async () => { await moveCursorTo(page, 700, 400); }],

        // 9.0: 「合格レターで将来の同僚として紹介」→ scroll to more cards
        [9.0, async () => { await smoothScroll(page, 300); }],
        [10.0, async () => { await moveCursorTo(page, 500, 420); }],

        // 12.0: 「候補者の入社意欲を高める」→ detail expand
        [12.0, async () => { await smoothScroll(page, 500); }],
        [13.0, async () => { await moveCursorTo(page, 600, 450); }],
        [15.0, async () => { await hideCursor(page); }],
      ], dur);
    },
  },
  {
    // 13 Candidate Talent Pool (NEW)
    name: '13_candidate_pool',
    actions: async (page, dur) => {
      await navigateTo(page, `${BASE_URL}/talent-pool/candidates`, 'h1, h2');

      await timedSequence([
        // 0.2: 「応募者タレントプールです」→ title highlight
        [0.2, async () => {
          await pointAndClick(page, 'h1, h2', { click: false, delay: 300, highlightDuration: 2500 });
        }],

        // 2.5: 「タイミングや条件が合わなかったものの」→ stats bar
        [2.5, async () => { await moveCursorTo(page, 400, 200); }],

        // 4.5: 「優秀な候補者をリストとしてストック」→ candidate cards
        [4.5, async () => { await moveCursorTo(page, 500, 380); }],
        [6.0, async () => { await moveCursorTo(page, 800, 380); }],

        // 8.0: 「選考時の情報やコミュニケーション履歴を保持」→ scroll to details
        [8.0, async () => { await smoothScroll(page, 300); }],
        [9.0, async () => { await moveCursorTo(page, 600, 400); }],

        // 11.0: 「しかるべきタイミングで定期連絡」→ contact schedule
        [11.0, async () => { await smoothScroll(page, 500); }],
        [12.0, async () => { await moveCursorTo(page, 500, 430); }],
        [14.0, async () => { await moveCursorTo(page, 700, 450); }],
        [15.5, async () => { await hideCursor(page); }],
      ], dur);
    },
  },
  {
    // 14 Recruitment Summary (NEW)
    name: '14_recruitment_summary',
    actions: async (page, dur) => {
      await navigateTo(page, `${BASE_URL}/recruitment-summary`, 'h1, h2');

      await timedSequence([
        // 0.2: 「採用活動総括の機能です」→ title highlight
        [0.2, async () => {
          await pointAndClick(page, 'h1, h2', { click: false, delay: 300, highlightDuration: 2500 });
        }],

        // 2.5: 「任意のタイミングでレポートを生成すると」→ generate button highlight
        [2.5, async () => {
          await pointAndClick(page, 'button:has-text("生成"), button:has-text("総括")', { click: true, delay: 400, highlightDuration: 2500 });
        }],

        // 5.5: 「求人ごとの応募者数や目標人数」→ progress summary
        [5.5, async () => { await moveCursorTo(page, 500, 350); }],
        [7.0, async () => { await moveCursorTo(page, 800, 350); }],

        // 8.5: 「候補者のスキル傾向」→ profile analysis
        [8.5, async () => { await smoothScroll(page, 400); }],
        [9.5, async () => { await moveCursorTo(page, 600, 400); }],

        // 11.0: 「面接官の所感やアンケート結果から」→ survey section
        [11.0, async () => { await smoothScroll(page, 650); }],
        [12.0, async () => { await moveCursorTo(page, 500, 420); }],

        // 14.0: 「テコ入れすべき施策をAIが分析し、提案」→ AI recommendations
        [14.0, async () => { await smoothScroll(page, 900); }],
        [15.0, async () => { await moveCursorTo(page, 600, 430); }],
        [17.0, async () => { await hideCursor(page); }],
      ], dur);
    },
  },
  {
    // 15 Ending
    name: '15_ending',
    actions: async (page, dur) => {
      await navigateTo(page, BASE_URL, 'h1');

      await timedSequence([
        [0.2, async () => { await moveCursorTo(page, 180, 45); }],
        [1.7, async () => { await moveCursorTo(page, 400, 250); }],
        [3.0, async () => { await moveCursorTo(page, 700, 250); }],
        [4.5, async () => { await moveCursorTo(page, 500, 260); }],
        [6.5, async () => { await moveCursorTo(page, 900, 260); }],
        [8.3, async () => { await smoothScroll(page, 350); }],
        [9.0, async () => { await moveCursorTo(page, 500, 400); }],
        [10.4, async () => { await smoothScroll(page, 700); }],
        [11.0, async () => { await moveCursorTo(page, 600, 450); }],
        [13.5, async () => { await smoothScroll(page, 0); }],
        [14.0, async () => { await moveCursorTo(page, 400, 300); }],
        [16.0, async () => { await hideCursor(page); }],
      ], dur);
    },
  },
];

// ─── Main Recording ───

(async () => {
  console.log('🎬 HR FARM チュートリアル動画 自動録画開始 (v10)\n');
  console.log('  16シーン / 矢印カーソル / タイムスタンプ同期 / 赤枠ハイライト\n');

  // Get actual audio durations
  const DURATIONS = {};
  for (const scene of SCENES) {
    const audioFile = path.join(AUDIO_DIR, `${scene.name}.mp3`);
    if (fs.existsSync(audioFile)) {
      const dur = getAudioDuration(audioFile);
      DURATIONS[scene.name] = dur ? dur + 2.0 : 20;
    } else {
      DURATIONS[scene.name] = 20;
    }
    console.log(`  ${scene.name}: ${DURATIONS[scene.name].toFixed(1)}s`);
  }

  const browser = await chromium.launch({ headless: true });

  // ── Pre-warm: visit key pages to populate browser cache ──
  console.log('\n🔄 Pre-warming browser cache...');
  const warmCtx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ja-JP' });
  const warmPage = await warmCtx.newPage();
  const warmUrls = ['/login', '/', '/settings/revp-report', '/candidates', '/candidates/cand_001/documents', '/candidates/cand_001/development', '/talent-pool/employees', '/talent-pool/candidates', '/recruitment-summary'];
  for (const u of warmUrls) {
    try {
      await warmPage.goto(`${BASE_URL}${u}`, { waitUntil: 'networkidle', timeout: 20000 });
      await sleep(500);
    } catch {}
  }
  await warmPage.close();
  await warmCtx.close();
  console.log('  ✅ Cache warmed\n');

  // ── Record each scene ──
  for (const scene of SCENES) {
    const dur = DURATIONS[scene.name];
    console.log(`📹 Recording ${scene.name} (${dur.toFixed(1)}s)...`);

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: {
        dir: path.join(VIDEO_DIR, 'scenes'),
        size: { width: 1440, height: 900 },
      },
      locale: 'ja-JP',
    });

    const page = await context.newPage();

    try {
      await scene.actions(page, dur);
    } catch (e) {
      console.log(`  ⚠️ Error: ${e.message}`);
    }

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
  console.log('\n🎬 全16シーン録画完了！次に burn-subtitles.mjs で字幕焼き込み＋結合してください');
})();

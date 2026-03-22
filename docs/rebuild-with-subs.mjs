/**
 * 字幕焼き込み再合成スクリプト
 * filter_complex_script ファイル方式で drawtext を適用
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const FFMPEG = 'C:/Users/K-USER01027/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin/ffmpeg.exe';
const VIDEO_DIR = 'C:/Users/K-USER01027/recruitment-journey/docs/tutorial-video';
const AUDIO_DIR = 'C:/Users/K-USER01027/recruitment-journey/docs/tutorial-audio';
const SUB_DIR = 'C:/Users/K-USER01027/recruitment-journey/docs/tutorial-subtitles';
const FONT_PATH = 'C\\:/Windows/Fonts/NotoSansJP-VF.ttf';

const SCENE_NAMES = [
  '00_opening', '01_login', '02_dashboard', '03_register_candidate',
  '04_document_upload', '05_signal_extraction', '06_attract_strategy',
  '07_feedback_letter', '08_interviewer_brief', '09_revp_report', '10_ending'
];

function parseSrt(srtContent) {
  const blocks = srtContent.trim().split(/\n\n+/);
  const entries = [];
  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length < 3) continue;
    const timeMatch = lines[1].match(/(\d+):(\d+):(\d+)[.,](\d+)\s*-->\s*(\d+):(\d+):(\d+)[.,](\d+)/);
    if (!timeMatch) continue;
    const startSec = parseInt(timeMatch[1])*3600 + parseInt(timeMatch[2])*60 + parseInt(timeMatch[3]) + parseInt(timeMatch[4])/1000;
    const endSec = parseInt(timeMatch[5])*3600 + parseInt(timeMatch[6])*60 + parseInt(timeMatch[7]) + parseInt(timeMatch[8])/1000;
    const text = lines.slice(2).join('\\n');
    entries.push({ startSec, endSec, text });
  }
  return entries;
}

function escapeDrawtext(text) {
  // In filter_complex_script file, minimal escaping needed
  // Single quotes around text handle most cases, but we escape internal single quotes
  return text
    .replace(/'/g, "\\'");
}

console.log('🔧 字幕付きで再合成中...\n');

const sceneOutputs = [];

for (const name of SCENE_NAMES) {
  const videoFile = path.join(VIDEO_DIR, 'scenes', `${name}.webm`);
  const audioFile = path.join(AUDIO_DIR, `${name}.mp3`);
  const subtitleFile = path.join(SUB_DIR, `${name}.srt`);
  const outputFile = path.join(VIDEO_DIR, 'scenes', `${name}_final.mp4`);
  const filterFile = path.join(VIDEO_DIR, 'scenes', `${name}_filter.txt`);

  if (!fs.existsSync(videoFile) || !fs.existsSync(audioFile)) {
    console.log(`  ⚠️ Skip ${name}: missing files`);
    continue;
  }

  let useFilter = false;

  if (fs.existsSync(subtitleFile)) {
    const srtContent = fs.readFileSync(subtitleFile, 'utf-8');
    const entries = parseSrt(srtContent);

    if (entries.length > 0) {
      // 黒帯（半透明背景）＋ 黄色文字で視認性を大幅向上
      const drawTexts = [];
      entries.forEach(e => {
        const escaped = escapeDrawtext(e.text);
        // 背景帯: 画面下部に黒い半透明バー
        drawTexts.push(`drawbox=x=0:y=h-120:w=iw:h=100:color=black@0.65:t=fill:enable='between(t,${e.startSec},${e.endSec})'`);
        // テキスト: 黄色・太字・影付き
        drawTexts.push(`drawtext=fontfile='${FONT_PATH}':text='${escaped}':fontsize=32:fontcolor=#FFEE00:shadowcolor=black@0.8:shadowx=2:shadowy=2:x=(w-text_w)/2:y=h-95:enable='between(t,${e.startSec},${e.endSec})'`);
      });

      const filterContent = `[0:v]${drawTexts.join(',')}[v]`;
      fs.writeFileSync(filterFile, filterContent, 'utf-8');
      useFilter = true;
    }
  }

  const cmd = useFilter
    ? `"${FFMPEG}" -y -i "${videoFile}" -i "${audioFile}" -filter_complex_script "${filterFile}" -map "[v]" -map 1:a -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k -shortest "${outputFile}"`
    : `"${FFMPEG}" -y -i "${videoFile}" -i "${audioFile}" -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k -shortest "${outputFile}"`;

  console.log(`  Processing ${name}...`);
  try {
    execSync(cmd, { stdio: 'pipe', timeout: 180000 });
    sceneOutputs.push(outputFile);
    console.log(`  ✅ ${name}_final.mp4${useFilter ? ' (with subs)' : ''}`);
  } catch (e) {
    // Fallback without subtitles
    const cmdFallback = `"${FFMPEG}" -y -i "${videoFile}" -i "${audioFile}" -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k -shortest "${outputFile}"`;
    try {
      execSync(cmdFallback, { stdio: 'pipe', timeout: 180000 });
      sceneOutputs.push(outputFile);
      console.log(`  ✅ ${name}_final.mp4 (no subs fallback)`);
    } catch (e2) {
      console.log(`  ❌ ${name}: ${e2.message?.substring(0, 200)}`);
    }
  }
}

// Concatenate
if (sceneOutputs.length > 0) {
  console.log('\n🎬 最終動画を結合中...\n');

  const concatFile = path.join(VIDEO_DIR, 'concat_list.txt');
  fs.writeFileSync(concatFile, sceneOutputs.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n'));

  const finalOutput = path.join(VIDEO_DIR, 'ATTRACT_tutorial_complete.mp4');
  try {
    execSync(`"${FFMPEG}" -y -f concat -safe 0 -i "${concatFile}" -c copy "${finalOutput}"`, { stdio: 'pipe', timeout: 300000 });
    const sizeMB = (fs.statSync(finalOutput).size / (1024 * 1024)).toFixed(1);
    console.log(`✅ 完成！`);
    console.log(`📁 ${finalOutput}`);
    console.log(`📏 ${sizeMB} MB`);
    console.log(`🎬 シーン数: ${sceneOutputs.length}`);
  } catch (e) {
    console.log(`❌ Concat failed`);
  }
}

console.log('\n🎬 字幕付き動画の再合成完了！');

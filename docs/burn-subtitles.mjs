/**
 * Burn subtitles into existing scene videos using drawtext filter
 * Font: meiryo.ttc (guaranteed on Windows)
 * Style: white text on semi-transparent black box
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const FFMPEG = 'C:/Users/K-USER01027/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin/ffmpeg.exe';
const SUB_DIR = 'C:/Users/K-USER01027/recruitment-journey/docs/tutorial-subtitles';
const AUDIO_DIR = 'C:/Users/K-USER01027/recruitment-journey/docs/tutorial-audio';
const VIDEO_DIR = 'C:/Users/K-USER01027/recruitment-journey/docs/tutorial-video';
const FONT_PATH = "C\\:/Windows/Fonts/meiryo.ttc";

const SCENES = [
  '00_opening', '01_login', '02_dashboard', '03_revp_report',
  '04_register_candidate', '05_scout_mail', '06_document_upload', '07_signal_extraction',
  '08_ai_interview', '09_attract_strategy', '10_feedback_letter', '11_interviewer_brief', '12_ending',
];

function parseSrt(srtPath) {
  const content = fs.readFileSync(srtPath, 'utf-8').replace(/\r\n/g, '\n');
  const blocks = content.trim().split(/\n\n+/);
  const entries = [];

  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length < 3) continue;
    const timeLine = lines[1];
    const text = lines.slice(2).join(' ');
    const match = timeLine.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
    if (!match) continue;
    const startSec = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3]) + parseInt(match[4]) / 1000;
    const endSec = parseInt(match[5]) * 3600 + parseInt(match[6]) * 60 + parseInt(match[7]) + parseInt(match[8]) / 1000;
    entries.push({ startSec, endSec, text });
  }
  return entries;
}

// Escape text for ffmpeg drawtext
function escapeText(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "'\\''")
    .replace(/:/g, '\\:')
    .replace(/%/g, '%%');
}

console.log('🔧 Burning subtitles into scene videos...\n');

const sceneOutputs = [];

for (const sceneName of SCENES) {
  const videoFile = path.join(VIDEO_DIR, 'scenes', `${sceneName}.webm`);
  const audioFile = path.join(AUDIO_DIR, `${sceneName}.mp3`);
  const srtFile = path.join(SUB_DIR, `${sceneName}.srt`);
  const outputFile = path.join(VIDEO_DIR, 'scenes', `${sceneName}_final.mp4`);

  if (!fs.existsSync(videoFile) || !fs.existsSync(audioFile)) {
    console.log(`  ⚠️ Skip ${sceneName}`);
    continue;
  }

  const entries = fs.existsSync(srtFile) ? parseSrt(srtFile) : [];

  if (entries.length === 0) {
    // No subtitles - just combine video + audio
    const cmd = `"${FFMPEG}" -y -i "${videoFile}" -i "${audioFile}" -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k -shortest "${outputFile}"`;
    try {
      execSync(cmd, { stdio: 'pipe', timeout: 180000 });
      sceneOutputs.push(outputFile);
      console.log(`  ✅ ${sceneName} (no subtitles)`);
    } catch (e) {
      console.log(`  ❌ ${sceneName}: ${e.message?.substring(0, 100)}`);
    }
    continue;
  }

  // Build drawtext filter chain
  const filters = entries.map(e => {
    const escaped = escapeText(e.text);
    return `drawtext=fontfile='${FONT_PATH}':text='${escaped}':fontcolor=white:fontsize=28:box=1:boxcolor=black@0.75:boxborderw=14:x=(w-text_w)/2:y=h-85:enable='between(t,${e.startSec},${e.endSec})'`;
  });

  const filterChain = filters.join(',');
  const cmd = `"${FFMPEG}" -y -i "${videoFile}" -i "${audioFile}" -vf "${filterChain}" -map 0:v -map 1:a -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k -shortest "${outputFile}"`;

  try {
    execSync(cmd, { stdio: 'pipe', timeout: 180000 });
    sceneOutputs.push(outputFile);
    console.log(`  ✅ ${sceneName} (${entries.length} subtitles)`);
  } catch (e) {
    // Fallback without subtitles
    console.log(`  ⚠️ ${sceneName} subtitle burn failed, trying without...`);
    const cmdFb = `"${FFMPEG}" -y -i "${videoFile}" -i "${audioFile}" -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k -shortest "${outputFile}"`;
    try {
      execSync(cmdFb, { stdio: 'pipe', timeout: 180000 });
      sceneOutputs.push(outputFile);
      console.log(`  ✅ ${sceneName} (fallback, no subtitles)`);
    } catch (e2) {
      console.log(`  ❌ ${sceneName}: failed completely`);
    }
  }
}

// Concatenate
if (sceneOutputs.length > 0) {
  const concatFile = path.join(VIDEO_DIR, 'concat_list.txt');
  fs.writeFileSync(concatFile, sceneOutputs.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n'));

  const finalOutput = path.join(VIDEO_DIR, 'ATTRACT_tutorial_complete.mp4');
  const concatCmd = `"${FFMPEG}" -y -f concat -safe 0 -i "${concatFile}" -c copy "${finalOutput}"`;

  console.log('\n🎬 Concatenating final video...');
  try {
    execSync(concatCmd, { stdio: 'pipe', timeout: 300000 });
    const sizeMB = (fs.statSync(finalOutput).size / (1024 * 1024)).toFixed(1);
    console.log(`\n✅ 完成！ ${finalOutput} (${sizeMB} MB)`);
  } catch (e) {
    console.log(`  ❌ Concat failed`);
  }
}

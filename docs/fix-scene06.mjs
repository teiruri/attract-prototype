import { execSync } from 'child_process';
import fs from 'fs';

const FFMPEG = 'C:/Users/K-USER01027/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin/ffmpeg.exe';
const FONT = "C\\:/Windows/Fonts/meiryo.ttc";

const srt = fs.readFileSync('docs/tutorial-subtitles/06_document_upload.srt', 'utf-8').replace(/\r\n/g, '\n');
const blocks = srt.trim().split(/\n\n+/);
const entries = [];
for (const block of blocks) {
  const lines = block.split('\n');
  if (lines.length < 3) continue;
  const m = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
  if (!m) continue;
  const s = parseInt(m[1])*3600 + parseInt(m[2])*60 + parseInt(m[3]) + parseInt(m[4])/1000;
  const e = parseInt(m[5])*3600 + parseInt(m[6])*60 + parseInt(m[7]) + parseInt(m[8])/1000;
  entries.push({ s, e, text: lines.slice(2).join(' ') });
}

console.log(`Parsed ${entries.length} subtitles`);
entries.forEach((e, i) => console.log(`  ${i}: [${e.s}-${e.e}] ${e.text}`));

function escapeText(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "'\\''")
    .replace(/:/g, '\\:')
    .replace(/%/g, '%%');
}

const filters = entries.map(e => {
  const t = escapeText(e.text);
  return `drawtext=fontfile='${FONT}':text='${t}':fontcolor=white:fontsize=28:box=1:boxcolor=black@0.75:boxborderw=14:x=(w-text_w)/2:y=h-85:enable='between(t,${e.s},${e.e})'`;
});

const filterChain = filters.join(',');
console.log(`\nFilter length: ${filterChain.length} chars`);

const cmd = `"${FFMPEG}" -y -i "docs/tutorial-video/scenes/06_document_upload.webm" -i "docs/tutorial-audio/06_document_upload.mp3" -vf "${filterChain}" -map 0:v -map 1:a -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k -shortest "docs/tutorial-video/scenes/06_document_upload_final.mp4"`;

console.log(`\nCommand length: ${cmd.length} chars`);
console.log(`Running...`);

try {
  execSync(cmd, { timeout: 120000 });
  console.log('✅ SUCCESS');
} catch(e) {
  const stderr = e.stderr?.toString() || '';
  console.log('❌ FAILED');
  console.log('Last 500 chars of stderr:', stderr.substring(stderr.length - 500));
}

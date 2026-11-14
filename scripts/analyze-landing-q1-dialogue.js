// analyze-landing-q1-dialogue.js — Q1 dialogue-defect counter (landing r130).
// Reads landing transcript .txt files in DIR (argv[2]) and counts, per sitting:
//   D2  — verbatim warn_you warning-line repeat within one sitting (the same
//         convoWantWarning line delivered twice: thread-resume + want-opener).
//   D3  — ask:village "How are the injured doing?" answered with the
//         leadership-tension line ("there's tension about who's in charge").
//   HEED — warn_you sitting where the want stays stage 1 for >=10 turns
//         while [dlg:heed]/[dlg:details] are offered >=3 times and never taken.
//   D1  — garbled personal-thread label "We never finished — themselves."
// Output is counts + the sitting ids, so a run note can quote them.
// Usage: node scripts/analyze-landing-q1-dialogue.js <DIR>
const fs = require('fs');
const path = require('path');
const dir = process.argv[2];
if (!dir) { console.error('usage: node scripts/analyze-landing-q1-dialogue.js <DIR>'); process.exit(2); }
const files = fs.readdirSync(dir).filter(f => f.startsWith('journey-landing-r62-transcript-') && f.endsWith('.txt')).sort();
const WARN_LINES = [
  "I don't know what's moving out there, but something is. Keep your eyes up past the treeline.",
  "Something's been moving out past the treeline. I can't name it, but I can feel it. Don't go out alone.",
  "The woods don't feel empty tonight. They haven't for a while. Stay close to the fire.",
];
let d2 = [], d3 = [], heed = [], d1 = 0, d1Files = [];
let warnSittings = 0, warnStuck10 = 0;
for (const f of files) {
  const text = fs.readFileSync(path.join(dir, f), 'utf8');
  const lines = text.split('\n');
  // D1: garbled label anywhere in this file.
  const d1n = (text.match(/We never finished — themselves\./g) || []).length;
  if (d1n) { d1 += d1n; d1Files.push(f + ':' + d1n); }
  // Per-sitting parse: a file is one sitting (one seed-day-villager).
  const wantLine = (text.match(/want: (\S+) \(stage (\d+)\)/) || [])[1];
  if (wantLine !== 'warn_you') continue;
  warnSittings++;
  // D2: count each warning line's THEM deliveries in this sitting.
  const counts = {};
  for (const wl of WARN_LINES) {
    const n = lines.filter(l => l.includes(wl)).length;
    if (n) counts[wl] = n;
  }
  for (const [wl, n] of Object.entries(counts)) {
    if (n >= 2) d2.push({ file: f, line: wl.slice(0, 60), n });
  }
  // D3: ask:village injured question -> next THEM line. Only actual picks
  // (YOU:) count — menu re-prints list the same label every turn.
  // A hit is a tension-ONLY answer: the tension line AND NO injured
  // status named. (r130 fix: the injured status now leads the village
  // line, so a fixed answer names the injured even when tension follows.)
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('YOU: [ask:village]') && /injured|hurt/i.test(lines[i])) {
      for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
        if (lines[j].startsWith('THEM:')) {
          if (lines[j].includes("tension about who's in charge") && !/injured/i.test(lines[j])) {
            d3.push({ file: f, turn: lines[i].trim().slice(0, 80), answer: lines[j].trim().slice(0, 100) });
          }
          break;
        }
      }
    }
  }
  // HEED: turns in sitting + heed/details offered vs taken.
  const turnCount = (text.match(/^menu \(\d+\)/gm) || []).length;
  const heedOffered = (text.match(/\[dlg:heed\]/g) || []).length;
  const detailsOffered = (text.match(/\[dlg:details\]/g) || []).length;
  const heedTaken = (text.match(/YOU: \[dlg:heed\]/g) || []).length;
  const detailsTaken = (text.match(/YOU: \[dlg:details\]/g) || []).length;
  const stage1End = /\(want=warn_you stage=1\)\s*$/.test(text.trim()) || text.includes('(want=warn_you stage=1)');
  if (turnCount >= 10 && (heedOffered + detailsOffered) >= 3 && heedTaken === 0 && detailsTaken === 0) {
    heed.push({ file: f, turns: turnCount, heedOffered, detailsOffered, heedTaken, detailsTaken });
  }
  if (turnCount >= 10 && stage1End) warnStuck10++;
}
console.log('Q1 DIALOGUE COUNTER — dir ' + dir);
console.log('transcript files: ' + files.length + ' | warn_you sittings: ' + warnSittings);
console.log('D2 verbatim warning repeats (same line 2+ times in one sitting): ' + d2.length);
d2.forEach(r => console.log('  D2 ' + r.file + ' x' + r.n + ' :: ' + r.line));
console.log('D3 injured question answered with tension line: ' + d3.length);
d3.forEach(r => console.log('  D3 ' + r.file + ' :: ' + r.answer));
console.log('HEED filler loop (>=10 turns, heed/details offered >=3x, never taken): ' + heed.length);
heed.forEach(r => console.log('  HEED ' + r.file + ' turns=' + r.turns + ' heedOffered=' + r.heedOffered + ' detailsOffered=' + r.detailsOffered));
console.log('warn_you sittings >=10 turns ending stage 1: ' + warnStuck10);
console.log('D1 garbled label occurrences: ' + d1 + (d1Files.length ? ' :: ' + d1Files.join(', ') : ''));

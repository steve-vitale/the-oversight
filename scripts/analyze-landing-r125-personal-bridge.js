// R125 PERSONAL-BRIDGE analyzer (journey-landing r125, Q1 PRIMARY) — read-only
// before/after comparison of the personal-bridge repeat on matched seeds.
// For each transcript file in a corpus dir, counts each known
// BRIDGES.personal line by SUBSTRING match (a voiceLine opener/closer may
// wrap the bridge text, and the r124 voice-closer case proved exact-match
// grep misses real repeats) and reports:
//   sittings        — transcript files read
//   servings        — total personal-bridge servings (all 6 lines)
//   repeatSittings  — files where any one line appears >1 time
//   repeatInstances — sum over (count - 1) per line per file (the repeats
//     over and above the first honest serving)
// The r124 defect (seed 1150 d6 Wei sitting): '"Anyway. What did you
// want?"' x2 and '"That\'s me, I guess. What\'s on your mind?"' x2 in ONE
// sitting — both lines are the WHOLE 2-line BRIDGES.personal pool, so
// convoPickCycle alternates A,B,A,B. The fix expands the pool to 6 lines.
// Usage:
//   node scripts/analyze-landing-r125-personal-bridge.js <beforeDir> [afterDir]
//   node scripts/analyze-landing-r125-personal-bridge.js <dir>   (single corpus)
'use strict';
const fs = require('fs');
const path = require('path');

const PERSONAL_LINES = [
  "That's me, I guess. What's on your mind?",
  'Anyway. What did you want?',
  "Enough about me — you've got something on your mind, I can tell.",
  "That's my story, anyway. What's yours today?",
  "I could go on about myself all day. Better if I don't — what do you need?",
  "Right. Me, me, me. Your turn — what's up?",
];

function analyzeDir(dir) {
  const out = { dir, sittings: 0, servings: 0, repeatSittings: 0, repeatInstances: 0, cases: [] };
  if (!dir || !fs.existsSync(dir)) { out.missing = true; return out; }
  const files = fs.readdirSync(dir)
    .filter(f => /^journey-landing-r62-transcript-\d+-day\d+\.txt$/.test(f)).sort();
  for (const f of files) {
    let text;
    try { text = fs.readFileSync(path.join(dir, f), 'utf8'); } catch (e) { continue; }
    out.sittings++;
    const counts = {};
    for (const line of PERSONAL_LINES) {
      let n = 0, idx = 0;
      while ((idx = text.indexOf(line, idx)) !== -1) { n++; idx += line.length; }
      if (n > 0) { counts[line] = n; out.servings += n; }
      if (n > 1) {
        out.repeatInstances += (n - 1);
        out.cases.push({ file: f, line, count: n });
      }
    }
    if (Object.values(counts).some(n => n > 1)) out.repeatSittings++;
  }
  return out;
}

function printSide(label, r) {
  console.log(`=== ${label} ===`);
  if (r.missing) { console.log('MISSING DIR: ' + r.dir); return; }
  console.log(`sittings=${r.sittings} servings=${r.servings} repeatSittings=${r.repeatSittings} repeatInstances=${r.repeatInstances}`);
  for (const c of r.cases) {
    console.log(`  REPEAT ${c.file}: ${JSON.stringify(c.line)} x${c.count}`);
  }
}

const beforeDir = process.argv[2];
const afterDir = process.argv[3] || null;
if (!beforeDir) { console.error('usage: node analyze-landing-r125-personal-bridge.js <beforeDir> [afterDir]'); process.exit(2); }
const b = analyzeDir(beforeDir);
printSide('BEFORE', b);
let a = null;
if (afterDir) {
  a = analyzeDir(afterDir);
  printSide('AFTER', a);
  console.log(`Q1-PERSONAL: repeatSittings before=${b.repeatSittings} after=${a.repeatSittings} repeatInstances before=${b.repeatInstances} after=${a.repeatInstances} servings before=${b.servings} after=${a.servings}`);
}

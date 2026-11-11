// R126 BRIDGE-POOLS analyzer (journey-landing r126, Q2 VOICE PASS) —
// generalizes the r125 personal-bridge analyzer to every remaining 2-line
// BRIDGES pool in src/js/convo-beats.js:174 (personal + want are already 6
// and are checked separately by the r125 analyzer as a regression check).
// For each transcript file in a corpus dir, counts each known pool line by
// SUBSTRING match (a voiceLine opener/closer may wrap the bridge text, and
// the r124 voice-closer case proved exact-match grep misses real repeats)
// and reports, per pool:
//   sittings        — transcript files read (same for every pool)
//   servings        — total servings of that pool's lines
//   repeatSittings  — files where any one line of the pool appears >1 time
//   repeatInstances — sum over (count - 1) per line per file (the repeats
//     over and above the first honest serving)
// The r124/r125 defect shape: a 2-line pool cycles A,B,A,B through
// convoPickCycle, so a third bridge in one sitting repeats a line heard
// two turns earlier. Any pool with repeatInstances > 0 on the BEFORE
// corpus is the next voice-pass item (expand to 6 with its own proof).
// Usage:
//   node scripts/analyze-landing-r126-bridge-pools.js <beforeDir> [afterDir]
//   node scripts/analyze-landing-r126-bridge-pools.js <dir>   (single corpus)
'use strict';
const fs = require('fs');
const path = require('path');

// The 9 remaining 2-line pools, lines copied verbatim from
// src/js/convo-beats.js BRIDGES (including the surrounding double quotes,
// as the transcripts render them). personal + want are NOT here — they
// are 6 lines since r124/r125 and are covered by the r125 analyzer.
const POOLS = {
  grief: ['"Sorry — I got lost in it for a second. What did you want to ask?"', '"...Anyway. Sorry. What\'s on your mind?"'],
  cheer: ['"Ha — sorry, I\'m rambling. What\'s up?"', '"Good times. What did you want to talk about?"'],
  goal: ['"Anyway — that\'s my cross to carry. What\'s on your mind?"', '"Right. Sorry, I go on about it. What did you want?"'],
  past: ['"Ancient history. What\'s on your mind?"', '"...That was a lifetime ago. What did you want to ask?"'],
  village: ['"That\'s the state of things. What\'s up?"', '"Anyway — people stuff. What did you want?"'],
  plans: ['"That\'s the plan, anyway. What\'s on your mind?"', '"We\'ll see how it goes. What did you want?"'],
  gossip: ['"That\'s what I heard, anyway. What\'s up?"', '"Take it with salt. What did you want to ask?"'],
  secret: ['"Don\'t tell anyone I told you. What\'s on your mind?"', '"...Anyway. What did you want to ask?"'],
  small: ['"Sure — what\'s on your mind?"', '"Yeah? What\'s up?"'],
};

function analyzeDir(dir) {
  const out = { dir, sittings: 0, pools: {} };
  for (const name of Object.keys(POOLS)) out.pools[name] = { servings: 0, repeatSittings: 0, repeatInstances: 0, cases: [] };
  if (!dir || !fs.existsSync(dir)) { out.missing = true; return out; }
  const files = fs.readdirSync(dir)
    .filter(f => /^journey-landing-r62-transcript-\d+-day\d+\.txt$/.test(f)).sort();
  for (const f of files) {
    let text;
    try { text = fs.readFileSync(path.join(dir, f), 'utf8'); } catch (e) { continue; }
    out.sittings++;
    for (const [name, lines] of Object.entries(POOLS)) {
      const p = out.pools[name];
      let fileRepeat = false;
      for (const line of lines) {
        let n = 0, idx = 0;
        while ((idx = text.indexOf(line, idx)) !== -1) { n++; idx += line.length; }
        if (n > 0) p.servings += n;
        if (n > 1) {
          p.repeatInstances += (n - 1);
          p.cases.push({ file: f, line, count: n });
          fileRepeat = true;
        }
      }
      if (fileRepeat) p.repeatSittings++;
    }
  }
  return out;
}

function printSide(label, r) {
  console.log(`=== ${label} ===`);
  if (r.missing) { console.log('MISSING DIR: ' + r.dir); return; }
  console.log(`sittings=${r.sittings}`);
  for (const [name, p] of Object.entries(r.pools)) {
    console.log(`  ${name}: servings=${p.servings} repeatSittings=${p.repeatSittings} repeatInstances=${p.repeatInstances}`);
    for (const c of p.cases) {
      console.log(`    REPEAT ${c.file}: ${JSON.stringify(c.line)} x${c.count}`);
    }
  }
}

const beforeDir = process.argv[2];
const afterDir = process.argv[3] || null;
if (!beforeDir) { console.error('usage: node analyze-landing-r126-bridge-pools.js <beforeDir> [afterDir]'); process.exit(2); }
const b = analyzeDir(beforeDir);
printSide('BEFORE', b);
let a = null;
if (afterDir) {
  a = analyzeDir(afterDir);
  printSide('AFTER', a);
  console.log('Q2-BRIDGES: per-pool repeatInstances before -> after:');
  for (const name of Object.keys(POOLS)) {
    console.log(`  ${name}: ${b.pools[name].repeatInstances} -> ${a.pools[name].repeatInstances} (repeatSittings ${b.pools[name].repeatSittings} -> ${a.pools[name].repeatSittings})`);
  }
}

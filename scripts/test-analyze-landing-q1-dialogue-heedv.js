// test-analyze-landing-q1-dialogue-heedv.js — proof for the r136 HEED-V
// discriminator (journey-landing r136 prereg Q1b, per the r135 metric
// review: "the counter should weigh verbatim repetition, not just
// offer-count").
//
// Black-box: runs scripts/analyze-landing-q1-dialogue.js on two corpora
// and asserts the counts it prints:
//   1. The r135 corpus (104 transcripts, goal hidden_files): HEED = 1,
//      HEED-V = 0. The one legacy-flagged sitting (Dauletkhan, 1150 d6)
//      was read in full — every brush-off a different line, want engaged
//      (stage 3) — so the verbatim discriminator must read 0 there.
//   2. A /tmp fixture: the same sitting twice — once verbatim, once with
//      a single THEM brush-off line duplicated verbatim — must read
//      HEED = 2, HEED-V = 1. The duplicated line is the discriminator's
//      trip-wire: without it the sitting is a player dodge, with it a
//      real filler loop.
//
// Usage: node scripts/test-analyze-landing-q1-dialogue-heedv.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO = path.join(__dirname, '..');
const ANALYZER = path.join(REPO, 'scripts', 'analyze-landing-q1-dialogue.js');
const R135_CORPUS = path.join(
  process.env.HOME || os.homedir(),
  'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-14/landing-r135-after');
const DAULET = 'journey-landing-r62-transcript-1150-day6.txt';
// A brush-off line in that sitting: distinct, >=20 chars, non-warning.
const BRUSHOFF = 'THEM: "Anyway — people stuff. What did you want?"';

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (detail != null ? ' — ' + detail : '')); }
}

function runAnalyzer(dir) {
  const r = spawnSync(process.execPath, [ANALYZER, dir], { encoding: 'utf8', timeout: 60000 });
  if (r.status !== 0) return { error: 'analyzer exit ' + r.status + ': ' + (r.stderr || '').slice(0, 300) };
  const out = r.stdout || '';
  const heed = (out.match(/^HEED filler loop \(>=10 turns.*?: (\d+)/m) || [])[1];
  const heedV = (out.match(/^HEED-V verbatim filler loop.*?: (\d+)/m) || [])[1];
  return { heed: heed == null ? null : +heed, heedV: heedV == null ? null : +heedV, out };
}

// --- 1. r135 corpus: HEED 1, HEED-V 0 ---
if (!fs.existsSync(path.join(R135_CORPUS, DAULET))) {
  ok('r135 corpus present', false, 'missing ' + path.join(R135_CORPUS, DAULET));
} else {
  const r = runAnalyzer(R135_CORPUS);
  if (r.error) ok('r135 corpus analyzes', false, r.error);
  else {
    ok('r135 corpus HEED = 1 (legacy)', r.heed === 1, 'got=' + r.heed);
    ok('r135 corpus HEED-V = 0 (verbatim discriminator)', r.heedV === 0, 'got=' + r.heedV);
  }
}

// --- 2. Fixture: same sitting twice, one with a verbatim-duplicated brush-off ---
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'heedv-'));
try {
  const orig = fs.readFileSync(path.join(R135_CORPUS, DAULET), 'utf8');
  ok('fixture source sitting contains the brush-off line', orig.includes(BRUSHOFF));
  fs.writeFileSync(path.join(tmp, DAULET), orig);
  // Duplicate the brush-off line verbatim, right after its first delivery.
  const dup = orig.replace(BRUSHOFF, BRUSHOFF + '\n' + BRUSHOFF);
  ok('fixture duplicate applied', dup !== orig && (dup.match(/Anyway — people stuff/g) || []).length === 2);
  fs.writeFileSync(path.join(tmp, 'journey-landing-r62-transcript-1150-day6b.txt'), dup);
  const r = runAnalyzer(tmp);
  if (r.error) ok('fixture analyzes', false, r.error);
  else {
    ok('fixture HEED = 2 (both copies legacy-flagged)', r.heed === 2, 'got=' + r.heed);
    ok('fixture HEED-V = 1 (only the duplicated copy)', r.heedV === 1, 'got=' + r.heedV);
  }
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

console.log(fail ? ('FAIL ' + fail + ' / pass ' + pass) : ('PASS all ' + pass));
process.exit(fail ? 1 : 0);

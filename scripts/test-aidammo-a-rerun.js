// test-aidammo-a-rerun.js — proof for the sim-aidammo-a RE-ANALYSIS.
//
// Re-runs the FIXED scripts/analyze-aidammo-a.js over the committed aidammo
// corpus (evidence/2026-11-24/perseed-aidammo-a/, seeds 110501-110508) and
// proves, against the frozen prereg evidence/2026-11-27/sim-aidammo-a-prereg.md:
//   B1 dominant share stands within 0.005 of published 0.849
//   B2 mechanism rate stands within 0.005 of published 0.577
//   B3 attribution completeness >= 0.99 (published 1.000)
//   B4 original verdict bars still pass (pool >= 10, attribution >= 0.90,
//      dominant >= 0.50)
//   B5 instrument clean: 8/8 corpus files parsed, 0 errors
//   B6 determinism: two analyzer passes produce identical output
//   P7 empty-fighter split recomputed with (seed,vid) scoping:
//      131 never-supplied / 18 spent of 149 empty rows (published figures)
//   plus a sensitivity check proving the test can see the bug: the same
//   split under the BUGGY bare-vid scoping is 119/30, not 131/18.
//
// Writes nothing into the repo: analyzer passes go to os.tmpdir() and are
// compared against the committed re-analysis JSON.
// Run: node scripts/test-aidammo-a-rerun.js  (exit 0 = all checks pass)
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ANALYZER = path.join(ROOT, 'scripts', 'analyze-aidammo-a.js');
const CORPUS = path.join(ROOT, 'evidence', '2026-11-24', 'perseed-aidammo-a');
const PUBLISHED = path.join(ROOT, 'evidence', '2026-11-24', 'aidammo-a-analysis.json');
const REANALYSIS = path.join(ROOT, 'evidence', '2026-11-27', 'aidammo-a-reanalysis.json');
// Corpus md5-list hash frozen in the prereg (sorted per-file md5s, md5'd).
const FROZEN_CORPUS_HASH = 'f41ffd706a5df8d1bcf70ed4e2acaa99';

let passed = 0, failed = 0;
function check(name, ok, detail) {
  if (ok) { passed++; console.log('  PASS ' + name); }
  else { failed++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
function md5(buf) { return crypto.createHash('md5').update(buf).digest('hex'); }

function runAnalyzer(outPath) {
  // Pass the dir RELATIVE, exactly as the original arm invoked it, so the
  // echoed `dir` fields match the committed outputs byte-for-byte.
  execFileSync(process.execPath, [ANALYZER, '--dir', 'evidence/2026-11-24/perseed-aidammo-a', '--out', outPath],
    { cwd: ROOT, stdio: 'pipe', encoding: 'utf8' });
  return JSON.parse(fs.readFileSync(outPath, 'utf8'));
}

// --- 0. The analyzer under test IS the fixed one -------------------------
const analyzerSrc = fs.readFileSync(ANALYZER, 'utf8');
check('analyzer scopes meetingsByVid by (seed,vid)',
  analyzerSrc.includes("d.seed + '|' + vid"),
  'fixed scoping marker missing from analyze-aidammo-a.js');

// --- 1. Corpus integrity (frozen prereg §3) ------------------------------
const files = fs.readdirSync(CORPUS).filter(function (f) { return f.endsWith('.json'); }).sort();
check('corpus has 8 files', files.length === 8, 'found ' + files.length);
const perFile = files.map(function (f) { return md5(fs.readFileSync(path.join(CORPUS, f))); }).sort();
check('corpus md5-list hash matches frozen prereg',
  md5(Buffer.from(perFile.join('\n') + '\n', 'utf8')) === FROZEN_CORPUS_HASH,
  'corpus bytes differ from the frozen corpus');

// --- 2. Two analyzer passes (B6 determinism) -----------------------------
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'aidammo-rerun-'));
const pass1 = runAnalyzer(path.join(tmp, 'pass1.json'));
const pass2 = runAnalyzer(path.join(tmp, 'pass2.json'));
check('analyzer pass 1 and pass 2 identical (determinism)',
  JSON.stringify(pass1) === JSON.stringify(pass2), 'passes differ');
const committed = JSON.parse(fs.readFileSync(REANALYSIS, 'utf8'));
check('committed re-analysis matches fresh analyzer pass',
  JSON.stringify(committed) === JSON.stringify(pass1),
  'committed aidammo-a-reanalysis.json differs from a fresh run');

// --- 3. Instrument clean (B5) --------------------------------------------
check('8/8 corpus files valid, 0 errors',
  pass1.pair.valid === 8 && pass1.pair.errors === 0 &&
  pass1.ledger.valid === 8 && pass1.ledger.errors === 0,
  JSON.stringify({ pairValid: pass1.pair.valid, pairErrors: pass1.pair.errors,
    ledgerValid: pass1.ledger.valid, ledgerErrors: pass1.ledger.errors }));

// --- 4. Corrected numbers vs published (B1-B4) ---------------------------
const pub = JSON.parse(fs.readFileSync(PUBLISHED, 'utf8'));
check('B1 dominant share within 0.005 of published 0.849',
  Math.abs(pass1.dominantShare - 0.8491027732463295) <= 0.005,
  'corrected ' + pass1.dominantShare);
check('B1b dominant share EXACTLY equals published (entry path untouched by fix)',
  pass1.dominantShare === pub.dominantShare,
  'corrected ' + pass1.dominantShare + ' vs published ' + pub.dominantShare);
check('B2 mechanism rate within 0.005 of published 0.577',
  Math.abs(pass1.mechanismRate - 0.5767045454545454) <= 0.005,
  'corrected ' + pass1.mechanismRate);
check('B2b mechanism rate EXACTLY equals published',
  pass1.mechanismRate === pub.mechanismRate,
  'corrected ' + pass1.mechanismRate + ' vs published ' + pub.mechanismRate);
check('B3 attribution completeness >= 0.99 (published 1.000)',
  pass1.ledger.attributionCompleteness >= 0.99,
  'corrected ' + pass1.ledger.attributionCompleteness);
check('B4 pool floor: pair meetings >= 10 (published 21)',
  pass1.pair.meetings >= 10, 'corrected ' + pass1.pair.meetings);
check('B4 dominant source still home-duty >= 0.50',
  pass1.dominantSource === 'home-duty' && pass1.dominantShare >= 0.50,
  pass1.dominantSource + ' ' + pass1.dominantShare);
check('B4 verdict still DIAG-GO DOMINANT-SOURCE',
  pass1.verdict === 'DIAG-GO' && pass1.kind === 'DOMINANT-SOURCE',
  pass1.verdict + ' ' + pass1.kind);

// --- 5. Delivery numbers (report-only; must equal published) -------------
check('delivery batches unchanged (home-duty 92, departure-craft 18, pile 15)',
  pass1.ledger.deliveredBatchesBySource['home-duty'] === 92 &&
  pass1.ledger.deliveredBatchesBySource['departure-craft'] === 18 &&
  pass1.ledger.deliveredBatchesBySource['departure-pile-stones'] === 15,
  JSON.stringify(pass1.ledger.deliveredBatchesBySource));
check('delivery units unchanged (home-duty 460, departure-craft 90, pile 65)',
  pass1.ledger.deliveredUnitsBySource['home-duty'] === 460 &&
  pass1.ledger.deliveredUnitsBySource['departure-craft'] === 90 &&
  pass1.ledger.deliveredUnitsBySource['departure-pile-stones'] === 65,
  JSON.stringify(pass1.ledger.deliveredUnitsBySource));

// --- 6. The fix is visible in the output (keys are (seed,vid)-scoped) ----
const keys = Object.keys(pass1.ledger.meetingsByVid);
check('meetingsByVid keys are (seed,vid)-scoped',
  keys.length > 0 && keys.every(function (k) { return k.indexOf('|') !== -1; }),
  keys.slice(0, 3).join(', '));
check('meetingsByVid has 101 (seed,vid) keys vs 91 bare-vid keys published',
  keys.length === 101, 'found ' + keys.length + ' (published 91)');
check('10 colliding vids are split (e.g. ingrid_vik in two seeds)',
  keys.some(function (k) { return k === '110501|ingrid_vik'; }) &&
  keys.some(function (k) { return k === '110503|ingrid_vik'; }),
  'ingrid_vik not split across seeds');

// --- 7. Empty-fighter split P7, recomputed with (seed,vid) scoping ------
// Row method (the one that reproduces the published 131/18): for each
// wave-4+ meeting row (lead + allies) with a ranged weapon and
// ammoAtEntry == 0, the fighter counts as never-supplied when no
// production event exists for that (seed,vid) on or before the meeting
// day. "On or before" because a batch made later cannot have armed
// that meeting; a batch made the same day counts as supplied-before.
const rows = [];
const prod = [];
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8'));
  for (const ev of ((d.ammoLedger || {}).events || [])) {
    if (ev.kind !== 'production') continue;
    prod.push({ seed: d.seed, vid: ev.vid, day: ev.day });
  }
  for (const r of (d.v4encounters || [])) {
    if ((r.wave | 0) < 4) continue;
    rows.push({ seed: d.seed, vid: r.vid, day: r.day, ammoAtEntry: r.ammoAtEntry | 0, rangedId: r.rangedId });
    for (const a of (r.alliesAmmo || [])) {
      rows.push({ seed: d.seed, vid: a.vid, day: r.day, ammoAtEntry: a.ammoAtEntry | 0, rangedId: a.rangedId });
    }
  }
}
const empty = rows.filter(function (r) { return r.rangedId && (r.ammoAtEntry | 0) === 0; });
check('empty rows total 149 (published denominator)',
  empty.length === 149, 'found ' + empty.length);
function neverCount(scoped) {
  return empty.filter(function (r) {
    return !prod.some(function (p) {
      if (p.day > r.day) return false;
      return scoped ? (p.seed === r.seed && p.vid === r.vid) : (p.vid === r.vid);
    });
  }).length;
}
const neverFixed = neverCount(true);
const neverBuggy = neverCount(false);
check('P7 fixed scoping: 131 never-supplied / 18 spent of 149',
  neverFixed === 131 && (empty.length - neverFixed) === 18,
  'fixed gives never=' + neverFixed + ' spent=' + (empty.length - neverFixed));
check('P7 sensitivity: buggy bare-vid scoping gives 119/30, not 131/18',
  neverBuggy === 119 && (empty.length - neverBuggy) === 30,
  'buggy gives never=' + neverBuggy + ' spent=' + (empty.length - neverBuggy));

// --- 8. Whole-analysis equality (no other number moved) ------------------
function flat(o, p, out) {
  p = p || ''; out = out || {};
  if (o && typeof o === 'object' && !Array.isArray(o)) {
    for (const k of Object.keys(o)) flat(o[k], p + '/' + k, out);
  } else if (Array.isArray(o)) { out[p + '[len]'] = o.length; }
  else { out[p] = o; }
  return out;
}
const flatPub = flat(pub), flatNew = flat(pass1);
let moved = [];
for (const k of Object.keys(flatPub)) {
  if (k.indexOf('/meetingsByVid') !== -1) continue; // key format changed by design
  if (flatPub[k] !== flatNew[k]) moved.push(k + ': ' + flatPub[k] + ' -> ' + flatNew[k]);
}
check('no other number moved vs published (outside meetingsByVid keys)',
  moved.length === 0, moved.slice(0, 5).join('; '));

console.log('AIDAMMO_RERUN_FAILS ' + failed);
console.log('AIDAMMO_RERUN_PASSED ' + passed + '/' + (passed + failed));
if (failed) process.exit(1);

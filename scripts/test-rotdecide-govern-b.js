#!/usr/bin/env node
// test-rotdecide-govern-b.js — proof for the fresh deciding corpus
// (sim-rotdecide-govern-b, 2026-10-24, oversight-flesh-out-loop-b, axis
// food-economy). Measurement/tooling only: zero src/js game changes.
//
// T1 converter: synthetic corpus files -> exactly the govern input;
//   a foreign-anchor file and a missing-cell corpus are both REFUSED.
// T2 governing verdict: govern-verdict.js on the fresh corpus exits 0
//   and its governing step matches an independent recomputation from
//   the raw per-seed files (median-of-ratios, numeric sort, even-n
//   mean-of-middle) to 3 decimals.
// T3 corpus completeness: 64/64 per-seed files, anchorCommit tags +
//   seeds matching, both PD sides per anchor per seed.
// Usage: node scripts/test-rotdecide-govern-b.js
// Exit 0 iff every check passes; exit 1 otherwise (loud failure).
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const { convert, PARENT, COMMIT } = require('./convert-rotdecide-govern-b');
const { governVerdict } = require('./govern-verdict');

let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function synthRow(seed, anchor, pd, rotFresh, rotPres, days) {
  return { seed, policy: 'leadfeast', plentydepri: pd, depositgate: 1,
    daysAlive: days, villageDays: days * 12, rotFreshKcal: rotFresh,
    rotPreservedKcal: rotPres, depriKcal: 0, deathCauses: {}, national: true,
    table: false, win: false, waveReach: [1, 2], medianSurvival: null,
    anchorCommit: anchor };
}
function synthFile(dir, seed, anchor, pd, rotFresh, rotPres, days) {
  const a8 = anchor.slice(0, 8);
  const f = `leg2drift-b-${a8}-pd${pd}-dg1-leadfeast-s${seed}.json`;
  fs.writeFileSync(path.join(dir, f), JSON.stringify(synthRow(seed, anchor, pd, rotFresh, rotPres, days)));
  return f;
}

// --- T1: converter on synthetic corpora (temp dir, never the repo) ---
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rotdecide-govern-test-'));
try {
  const good = path.join(tmp, 'good'); fs.mkdirSync(good);
  // Seed 1: parent pd0 rot 100000/100d, pd1 50000 -> r 0.5; commit pd0 100000, pd1 20000 -> r 0.2.
  synthFile(good, 1, PARENT, 0, 100000, 0, 100);
  synthFile(good, 1, PARENT, 1, 50000, 0, 100);
  synthFile(good, 1, COMMIT, 0, 100000, 0, 100);
  synthFile(good, 1, COMMIT, 1, 20000, 0, 100);
  const out = convert(good);
  check('T1a converter emits 1 record', out.records.length === 1, JSON.stringify(out.records.length));
  const r0 = out.records[0];
  check('T1b converter rot sums fresh+preserved', r0.parent.pd0.rot === 100000 && r0.commit.pd1.rot === 20000);
  const v = governVerdict(out.records);
  check('T1c synthetic governing step 0.400 STEP', v.governingStep === 0.4 && v.verdict === 'STEP',
    `step=${v.governingStep} verdict=${v.verdict}`);

  // Foreign anchor refused: run the CLI (convert() itself exits via fatal, so use a child).
  const foreign = path.join(tmp, 'foreign'); fs.mkdirSync(foreign);
  synthFile(foreign, 1, PARENT, 0, 1000, 0, 100);
  synthFile(foreign, 1, 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeef', 1, 1000, 0, 100);
  const rf = spawnSync('node', [path.join(__dirname, 'convert-rotdecide-govern-b.js'), foreign, path.join(tmp, 'foreign-out.json')],
    { encoding: 'utf8' });
  check('T1d foreign-anchor corpus refused (exit 2)', rf.status === 2, 'exit ' + rf.status);

  // Missing cell refused.
  const missing = path.join(tmp, 'missing'); fs.mkdirSync(missing);
  synthFile(missing, 1, PARENT, 0, 1000, 0, 100);
  synthFile(missing, 1, PARENT, 1, 1000, 0, 100);
  synthFile(missing, 1, COMMIT, 0, 1000, 0, 100);
  const rm = spawnSync('node', [path.join(__dirname, 'convert-rotdecide-govern-b.js'), missing, path.join(tmp, 'missing-out.json')],
    { encoding: 'utf8' });
  check('T1e missing-cell corpus refused (exit 2)', rm.status === 2, 'exit ' + rm.status);
} finally {
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
}

// --- T2+T3: the real fresh corpus ---
const corpusDir = path.join(ROOT, 'evidence', '2026-10-24', 'rotdecide-govern-b-corpus');
const files = fs.existsSync(corpusDir)
  ? fs.readdirSync(corpusDir).filter((f) => f.startsWith('leg2drift-b-') && f.endsWith('.json')).sort()
  : [];
check('T3a corpus has 64/64 per-seed files', files.length === 64, `found ${files.length}`);
let tagsOk = true, seedsOk = true, sidesOk = true;
const seen = new Map();
for (const f of files) {
  let row;
  try { row = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8')); }
  catch (e) { tagsOk = false; continue; }
  const m = f.match(/-s(\d+)\.json$/);
  if (!m || row.seed !== parseInt(m[1], 10)) seedsOk = false;
  if (row.anchorCommit !== PARENT && row.anchorCommit !== COMMIT) tagsOk = false;
  const key = `${row.seed}|${row.anchorCommit}|${row.plentydepri}`;
  if (seen.has(key)) tagsOk = false;
  seen.set(key, true);
}
for (let s = 9310; s <= 9325; s++) {
  for (const a of [PARENT, COMMIT]) for (const pd of [0, 1]) {
    if (!seen.has(`${s}|${a}|${pd}`)) sidesOk = false;
  }
}
check('T3b anchorCommit tags are the pre-registered pair only', tagsOk);
check('T3c filename seeds match file seeds', seedsOk);
check('T3d both PD sides per anchor per seed, 9310-9325', sidesOk);

if (files.length === 64 && tagsOk && seedsOk && sidesOk) {
  const { records } = convert(corpusDir);
  // Independent recomputation (not the tool): median-of-ratios, numeric sort.
  const med = (xs) => {
    const s = xs.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
    if (!s.length) return null;
    const mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  };
  const ratio = (rec, anchorKey) => {
    const pd0 = rec[anchorKey].pd0, pd1 = rec[anchorKey].pd1;
    if (!pd0 || !pd1 || pd0.days <= 0 || pd1.days <= 0) return null;
    const r0 = pd0.rot / pd0.days * 100, r1 = pd1.rot / pd1.days * 100;
    if (r0 === 0) return null;
    return r1 / r0;
  };
  const mP = med(records.map((r) => ratio(r, 'parent')));
  const mC = med(records.map((r) => ratio(r, 'commit')));
  const step = (mP && mC !== null && mP !== 0) ? mC / mP : null;
  const tool = governVerdict(records);
  check('T2a govern-verdict governing step matches independent recomputation (3dp)',
    step !== null && tool.governingStep !== null
      && Math.abs(tool.governingStep - step) < 0.0005
      && tool.medianParent === mP && tool.medianCommit === mC,
    `tool=${tool.governingStep} recomputed=${step} mP=${mP} mC=${mC}`);
  check('T2b tool verdict label is one of STEP/NO-STEP/INCONCLUSIVE (+CONTESTED)',
    /^(STEP|NO-STEP|INCONCLUSIVE)( \(CONTESTED\))?$/.test(tool.verdict), tool.verdict);
  console.log(`GOVERNING: verdict=${tool.verdict} step=${tool.governingStep} M(parent)=${tool.medianParent} M(commit)=${tool.medianCommit}`);
  console.log(`DIAGNOSTICS: aggregate=${tool.diagnostics.aggregateStep} rom=${tool.diagnostics.ratioOfMediansStep} medPerSeed=${tool.diagnostics.medianPerSeedStep}`);
} else {
  check('T2 skipped: corpus incomplete (run after the full sweep)', false, 'corpus not 64/64 valid');
}

console.log(`\n${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);

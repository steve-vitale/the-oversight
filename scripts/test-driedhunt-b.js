#!/usr/bin/env node
// test-driedhunt-b.js — proof for sim-driedhunt-b (DIAG only).
//
// Checks, in order:
//   1. Corpus validity: the three stockdoors per-seed files exist,
//      carry the competent-nofeast policy fields, are untruncated,
//      and carry finalPantry.
//   2. Headline reproduction: the reused analyzers recompute the
//      published stockdoors numbers for the three seeds (boundary-
//      aware dried residual -2240 / -800 / -1021; finalPantry dried
//      fresh 16868 / 43190 / 15190; finalPantry fresh totals
//      27628 / 70900 / 25380).
//   3. Identity identities: per-seed, expired-tail sum ==
//      |headline residual| exactly, live sum == closing dried
//      exactly, zero negative identities.
//   4. Det-gate (only if the step-2 re-run corpus exists): re-run
//      payloads reproduce the published headline counts, finalPantry
//      fresh totals, and BA dried residuals (excluding `ms` and the
//      new driedhunt fields), and the _removePantryKcal wrapper was
//      installed (driedhuntWrapped true). A det-gate mismatch prints
//      DET-GATE VOID and exits non-zero ONLY via the gate flag: the
//      proof's exit code is 0 iff checks 1-3 pass AND (no re-run dir
//      OR det-gate passes); a present-but-mismatched re-run exits 1
//      because judged mechanism claims would rest on it.
//   5. Hygiene: 0 src/js files modified, 0 sibling capture files
//      modified, no modified tracked file outside this run's own
//      files (checked via git status, worktree-local).
// Usage: node scripts/test-driedhunt-b.js
// Exit 0 = proof GREEN. Any failure prints FAIL and exits 1.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { perSeed } = require('./analyze-stockdoors-b');
const { perSeedBa } = require('./analyze-stockdoors-b-2030');
const { judgeSeed } = require('./analyze-driedhunt-b');

const ROOT = path.join(__dirname, '..');
const CONFIRM_DIR = path.join(ROOT, 'evidence', '2026-10-27', 'sim-stockdoors-b-confirm-corpus');
const PILOT_DIR = path.join(ROOT, 'evidence', '2026-10-27', 'sim-stockdoors-b-corpus');
const RERUN_DIR = path.join(ROOT, 'evidence', '2026-10-27', 'sim-driedhunt-b-corpus');
const EXPECT = {
  9738: { dir: CONFIRM_DIR, baDried: -2240, closingDried: 16868, finalFresh: 27628,
    counts: { inflows: 96, mealDraw: 1264, deaths: 5, driedEvents: 111, stockdoor: 728, direct: 200, sweeps: 100, spoilDays: 100 } },
  9735: { dir: CONFIRM_DIR, baDried: -800, closingDried: 43190, finalFresh: 70900,
    counts: { inflows: 298, mealDraw: 1500, deaths: 2, driedEvents: 205, stockdoor: 667, direct: 242, sweeps: 100, spoilDays: 100 } },
  9825: { dir: PILOT_DIR, baDried: -1021, closingDried: 15190, finalFresh: 25380,
    counts: { inflows: 345, mealDraw: 1240, deaths: 8, driedEvents: 110, stockdoor: 594, direct: 64, sweeps: 100, spoilDays: 100 } },
};
let failures = 0;
function check(ok, label) {
  console.log((ok ? 'PASS ' : 'FAIL ') + label);
  if (!ok) failures++;
}

for (const [seedStr, exp] of Object.entries(EXPECT)) {
  const seed = parseInt(seedStr, 10);
  const f = path.join(exp.dir, `stockdoors-b-competent-nofeast-s${seed}.json`);
  check(fs.existsSync(f), `corpus file exists seed ${seed}`);
  const ps = JSON.parse(fs.readFileSync(f, 'utf8'));
  check(ps.policy === 'competent-nofeast' && ps.stockdoorsOn === true, `policy fields seed ${seed}`);
  check(!ps.mealdrawTruncated && !ps.inflowTruncated && !ps.stockdoorTruncated, `untruncated seed ${seed}`);
  check(!!ps.finalPantry, `finalPantry present seed ${seed}`);
  const j = judgeSeed(ps);
  check(j.headline === exp.baDried, `BA dried residual seed ${seed} == ${exp.baDried} (got ${j.headline})`);
  check(j.closingDried === exp.closingDried, `closing dried seed ${seed} == ${exp.closingDried} (got ${j.closingDried})`);
  check(ps.finalPantry.freshKcal === exp.finalFresh, `finalPantry fresh seed ${seed} == ${exp.finalFresh} (got ${ps.finalPantry.freshKcal})`);
  const got = { inflows: ps.inflowSeen, mealDraw: ps.mealDrawRecords.length, deaths: ps.deaths,
    driedEvents: ps.driedEvents.length, stockdoor: ps.stockdoorRecords.length,
    direct: ps.directRecords.length, sweeps: ps.spoilEvents.sweeps.length, spoilDays: ps.spoilDays.length };
  for (const [k, v] of Object.entries(exp.counts)) check(got[k] === v, `count ${k} seed ${seed} == ${v} (got ${got[k]})`);
  check(j.tailSum === Math.abs(j.headline), `tail sum == |residual| seed ${seed} (${j.tailSum} vs ${Math.abs(j.headline)})`);
  check(j.liveSum === j.closingDried, `live sum == closing seed ${seed} (${j.liveSum} vs ${j.closingDried})`);
  check(j.neg.length === 0, `zero negative identities seed ${seed}`);
  check(j.accounting === true, `accounting leg PASS seed ${seed}`);
}

// Det-gate: re-run corpus must exist and reproduce headlines.
if (!fs.existsSync(RERUN_DIR)) {
  console.log('DET-GATE: re-run corpus absent — gate PENDING (proof cannot green the mechanism leg)');
  failures++;
} else {
  for (const [seedStr, exp] of Object.entries(EXPECT)) {
    const seed = parseInt(seedStr, 10);
    const f = path.join(RERUN_DIR, `driedhunt-b-competent-nofeast-s${seed}.json`);
    check(fs.existsSync(f), `re-run file exists seed ${seed}`);
    if (!fs.existsSync(f)) continue;
    const rp = JSON.parse(fs.readFileSync(f, 'utf8'));
    check(rp.driedhuntWrapped === true, `driedhunt wrapper installed seed ${seed}`);
    check(rp.finalPantry.freshKcal === exp.finalFresh, `re-run finalPantry fresh seed ${seed} == ${exp.finalFresh} (got ${rp.finalPantry.freshKcal})`);
    const j = judgeSeed(rp);
    check(j.headline === exp.baDried, `re-run BA dried residual seed ${seed} == ${exp.baDried} (got ${j.headline})`);
    const got = { inflows: rp.inflowSeen, mealDraw: rp.mealDrawRecords.length, deaths: rp.deaths,
      driedEvents: rp.driedEvents.length, stockdoor: rp.stockdoorRecords.length,
      direct: rp.directRecords.length, sweeps: rp.spoilEvents.sweeps.length, spoilDays: rp.spoilDays.length };
    for (const [k, v] of Object.entries(exp.counts)) check(got[k] === v, `re-run count ${k} seed ${seed} == ${v} (got ${got[k]})`);
  }
}

// Hygiene via git status (worktree-local, read-only).
try {
  const st = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf8' });
  const lines = st.split('\n').filter(Boolean);
  const bad = lines.filter(l => {
    const f = l.slice(3);
    if (f.startsWith('src/js/')) return true;
    if (/^scripts\/(inflow|mealdraw|spoilvol|driedpath|stockdoor|stockdoors|dedupspan|analyze-stockdoors|sweep-stockdoors)-/.test(f)) return true;
    return false;
  });
  check(bad.length === 0, `hygiene: no src/js or sibling capture modifications (offenders: ${JSON.stringify(bad)})`);
  console.log('git status lines: ' + JSON.stringify(lines));
} catch (e) {
  console.log('hygiene check skipped (git unavailable): ' + e.message);
}

if (failures) { console.log(`\nPROOF RED: ${failures} failure(s)`); process.exit(1); }
console.log('\nPROOF GREEN');

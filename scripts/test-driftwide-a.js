#!/usr/bin/env node
// scripts/test-driftwide-a.js — sim-driftwide-a proof test
// (scale-onramp axis, 2026-10-26: wider drift bisect, DIAG ONLY.)
//
// What this proves (read the evidence header for the binding
// pre-registration; this file checks the computation, the
// verdict lives in evidence/2026-10-26/sim-driftwide-a.md):
//  (1) Corpus completeness: 8 rows per column (colA/colB/colC)
//      + colA + colB reruns of 73671, no extra files.
//  (2) Code identity: every colA row carries competentSha
//      b0adaacc (HEAD: cook+fish), every colB row 76abf6f3
//      (8ea64d848: neither fallback), every colC row 926f87f9
//      (3701dfa4a: cook-only); the three sets are distinct.
//  (3) Band recomputation: summary.json bands equal bands
//      recomputed from the rows on disk.
//  (4) Instrument validity: colC rows reproduce the natpair
//      rows AND the r54bisect colA rows per-seed exactly on
//      every trajectory field + deaths map + ts (the 301 band
//      is a cook-only band — see evidence).
//  (5) Determinism: colA + colB reruns of 73671 equal their
//      main rows on every trajectory field + deaths map.
//  (6) NEWPAIRED on every row: snap nationalEver, tsNationalDay
//      presence, and maxRank>=national, all coerced to 0/1, agree.
//  (7) Coherence: win -> nationalEver + entered; entered ->
//      nationalEver; table -> nationalEver.
//  (8) C1/C3 git facts: src/ diff base..HEAD is exactly
//      build.js + conversation.js; src/data diff empty;
//      sim-harness.js + sweep-compare.js diffs empty;
//      tableseat-nowait/leanlinkrescue/leanlink diffs empty.
//  (9) Verdict legs as data (failures here ARE verdict
//      information, cf. freshtransient precedent — do not
//      weaken them to green): colB band == 0126Z band;
//      colC band == 301 band. colA band is reported, not
//      gated (it IS the true-current band under measurement).
//
// Usage: node scripts/test-driftwide-a.js
// Exit 0 only if every check passes (including verdict legs).
// Exit 1 otherwise, with per-leg PASS/FAIL lines.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-driftwide-a');
const SEEDS = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
const TRAJ = ['days', 'gameDays', 'endReason', 'won', 'waveReach', 'maxArc',
  'finalRank', 'maxRank', 'nationalEver', 'nationalFinal', 'table', 'entered',
  'deathTotal', 'starvationDeaths'];
const RANK = { village: 0, regional: 1, national: 2, global: 3 };
const SHA = { colA: 'b0adaacc0ba86ae9e242f051840fbdb17d41423e5722149c331061c8ede83ae7',
  colB: '76abf6f316bfa4aa2fc56129a5c83c34ed4040d93ccffc71a571e18ed0adc512', colC: '926f87f93359e13105fa14adaec952e6e2a8e5ee82fc3524e39109b231acc229' };
const BAND_0126Z = { deathTotal: 260, nationalEver: 6, nationalFinal: 5, table: 4,
  entered: 4, won: 4, wave4: 5, wave5: 0, medianDays: 143, starvationTotal: 9 };
const BAND_301 = { deathTotal: 301, nationalEver: 8, nationalFinal: 5, table: 4,
  entered: 4, won: 4, wave4: 5, wave5: 0, medianDays: 143, starvationTotal: 2 };

let pass = 0, fail = 0;
const fails = [];
function check(name, ok, extra) {
  if (ok) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; fails.push(name); console.log(`  FAIL ${name}${extra ? ' :: ' + extra : ''}`); }
}
function medianOf(arr) { const s = arr.slice().sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; }
function aggregate(rows) {
  const wave = (n) => rows.filter(r => (r.waveReach || 1) >= n).length;
  return { n: rows.length, won: rows.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(rows.map(r => r.days)),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    wave4: wave(4), wave5: wave(5),
    starvationTotal: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0) };
}
function bandEq(b, t) { return Object.keys(t).every(k => b[k] === t[k]); }
// Order-insensitive object equality: JSON.stringify is key-order
// sensitive, and rows persisted via the ROWJSON stdout fallback
// (tool-path write during the flap) carry alphabetical key order
// while sweep-written rows carry insertion order. Comparing
// strings would false-fail on identical maps (caught 2026-10-26:
// all 3 first-run proof failures were this bug, not row diffs).
function objEq(a, b) {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  const ka = Object.keys(a).sort(), kb = Object.keys(b).sort();
  return JSON.stringify(ka) === JSON.stringify(kb) && ka.every(k => a[k] === b[k]);
}
function gitDiffNames(a, b, paths) {
  try { return execFileSync('git', ['diff', '--name-only', a, b, '--'].concat(paths),
    { cwd: REPO, encoding: 'utf8' }).trim().split('\n').filter(Boolean).sort();
  } catch (e) { return null; }
}

function main() {
  console.log('=== sim-driftwide-a proof ===');
  const cols = {};
  for (const col of ['colA', 'colB', 'colC']) {
    cols[col] = [];
    for (const seed of SEEDS) {
      const p = path.join(DIR, `s${seed}-${col}.json`);
      check(`file ${col} ${seed} exists`, fs.existsSync(p));
      if (fs.existsSync(p)) cols[col].push(JSON.parse(fs.readFileSync(p, 'utf8')));
    }
    check(`${col} has 8 rows`, cols[col].length === 8);
    check(`${col} shas all ${SHA[col].slice(0, 12)}`,
      cols[col].every(r => r.competentSha === SHA[col]),
      cols[col].map(r => (r.competentSha || '').slice(0, 12)).join(','));
    check(`${col} seeds are 73671-73678`,
      JSON.stringify(cols[col].map(r => r.seed)) === JSON.stringify(SEEDS));
  }
  // Corpus hygiene: exactly 8*3 rows + 2 reruns + summary.json.
  const files = fs.readdirSync(DIR).sort();
  const expected = new Set();
  for (const col of ['colA', 'colB', 'colC']) for (const s of SEEDS) expected.add(`s${s}-${col}.json`);
  expected.add('s73671-colA-rerun.json'); expected.add('s73671-colB-rerun.json'); expected.add('summary.json');
  check('corpus hygiene (no extra files)', files.every(f => expected.has(f)) && expected.size === files.length,
    'extra: ' + files.filter(f => !expected.has(f)).join(',') + ' missing: ' + [...expected].filter(f => !files.includes(f)).join(','));
  // Summary bands recomputed.
  const summary = JSON.parse(fs.readFileSync(path.join(DIR, 'summary.json'), 'utf8'));
  for (const [col, key] of [['colA', 'bandA'], ['colB', 'bandB'], ['colC', 'bandC']]) {
    const b = aggregate(cols[col]);
    const s = summary[key];
    check(`summary ${key} recomputed`, s && Object.keys(b).every(k => k === 'n' || k === 'maxDays' || k === 'maxArc' || k === 'wave3' || s[k] === b[k]),
      JSON.stringify(s));
    console.log(`  BAND ${col}: deaths=${b.deathTotal} natEver=${b.nationalEver} natFinal=${b.nationalFinal} table=${b.table} entered=${b.entered} won=${b.won} wave4=${b.wave4} wave5=${b.wave5} med=${b.medianDays} starv=${b.starvationTotal}`);
  }
  // Verdict legs (failures are verdict information).
  check('VERDICT-LEG colB band == 0126Z band', bandEq(aggregate(cols.colB), BAND_0126Z),
    JSON.stringify(aggregate(cols.colB)));
  check('VERDICT-LEG colC band == 301 band', bandEq(aggregate(cols.colC), BAND_301),
    JSON.stringify(aggregate(cols.colC)));
  console.log(`  INFO colA band (true-current, not gated): ${JSON.stringify(aggregate(cols.colA))}`);
  // Instrument validity: colC == natpair rows and == r54bisect colA rows.
  for (const [label, dir, suffix] of [['natpair', 'perseed-sim-natpair-a', 'natpair'],
    ['r54bisect-colA', 'perseed-sim-r54bisect-a', 'colA']]) {
    let allOk = true, detail = '';
    for (const seed of SEEDS) {
      const ref = JSON.parse(fs.readFileSync(
        path.join(REPO, 'evidence', '2026-10-26', dir, `s${seed}-${suffix}.json`), 'utf8'));
      const row = cols.colC.find(r => r.seed === seed);
      const ok = TRAJ.every(k => JSON.stringify(row[k]) === JSON.stringify(ref[k]))
        && objEq(row.deaths, ref.deaths)
        && objEq(row.ts, ref.ts)
        && row.finalPop === ref.finalPop && row.finalPantry === ref.finalPantry;
      if (!ok) { allOk = false; detail += seed + ' '; }
    }
    check(`colC reproduces ${label} rows exactly (all 8 seeds)`, allOk, 'diff seeds: ' + detail);
  }
  // Determinism reruns.
  for (const col of ['colA', 'colB']) {
    const p = path.join(DIR, `s73671-${col}-rerun.json`);
    check(`rerun file ${col} 73671 exists`, fs.existsSync(p));
    if (fs.existsSync(p)) {
      const re = JSON.parse(fs.readFileSync(p, 'utf8'));
      const main = cols[col].find(r => r.seed === 73671);
      check(`rerun ${col} 73671 == main row`,
        TRAJ.every(k => JSON.stringify(re[k]) === JSON.stringify(main[k]))
        && objEq(re.deaths, main.deaths));
    }
  }
  // NEWPAIRED + coherence on every row of every column.
  for (const col of ['colA', 'colB', 'colC']) {
    for (const r of cols[col]) {
      const snap = r.nationalEver ? 1 : 0;
      const ts = (r.ts && r.ts.tsNationalDay != null) ? 1 : 0;
      const mx = (RANK[r.maxRank] || 0) >= 2 ? 1 : 0;
      check(`NEWPAIRED ${col} ${r.seed}`, snap === ts && ts === mx,
        `snap=${snap} ts=${ts} maxRank=${mx}`);
      check(`coherence ${col} ${r.seed}`,
        (!r.won || (r.nationalEver === 1 && r.entered === 1))
        && (!r.entered || r.nationalEver === 1)
        && (!r.table || r.nationalEver === 1));
    }
  }
  // C1/C3 git facts.
  const srcDiff = gitDiffNames('8ea64d848', 'HEAD', ['src/']);
  check('C1 src diff is exactly build.js + conversation.js',
    srcDiff && srcDiff.length === 2
    && srcDiff.includes('src/js/build.js') && srcDiff.includes('src/js/conversation.js'),
    JSON.stringify(srcDiff));
  check('C1 src/data diff empty',
    gitDiffNames('8ea64d848', 'HEAD', ['src/data/']) !== null
    && gitDiffNames('8ea64d848', 'HEAD', ['src/data/']).length === 0);
  check('C3 sim-harness + sweep-compare diffs empty',
    gitDiffNames('8ea64d848', 'HEAD', ['scripts/sim-harness.js', 'scripts/sweep-compare.js']) !== null
    && gitDiffNames('8ea64d848', 'HEAD', ['scripts/sim-harness.js', 'scripts/sweep-compare.js']).length === 0);
  check('C2 tableseat/leanlink files diff empty',
    gitDiffNames('8ea64d848', 'HEAD', ['scripts/policies/tableseat-nowait.js', 'scripts/policies/leanlinkrescue.js', 'scripts/policies/leanlink.js']) !== null
    && gitDiffNames('8ea64d848', 'HEAD', ['scripts/policies/tableseat-nowait.js', 'scripts/policies/leanlinkrescue.js', 'scripts/policies/leanlink.js']).length === 0);
  console.log(`\n=== ${pass} passed, ${fail} failed ===`);
  if (fail) { console.log('failed legs: ' + fails.join('; ')); process.exit(1); }
}
main();

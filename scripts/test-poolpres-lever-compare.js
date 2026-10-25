#!/usr/bin/env node
// scripts/test-poolpres-lever-compare.js — sim-poolpres-lever-b compare
// (scale-onramp axis, 2026-10-25: pool-presence lever arm).
//
// READ-ONLY over both corpora: reads the poolpres analyzer summary.json
// files (control band vs lever band, each produced by
// scripts/test-poolpres-diag.js --summary with EVID set to that band's
// corpus dir) and prints the pre-registered PRIMARY + GUARDS table.
// It never runs a sweep, never writes outside stdout, never touches
// game code. Exit 0 prints the verdict table; exit 1 means a corpus
// file is missing/unreadable (not a lever verdict — the verdict is
// printed, not encoded in the exit code, so a NO-GO lever still exits 0).
//
// Usage:
//   node scripts/test-poolpres-lever-compare.js \
//     --control evidence/2026-10-25/perseed-sim-poolpres-lever-b/control \
//     --armed evidence/2026-10-25/perseed-sim-poolpres-lever-b/armed
// Defaults are the two band dirs above (relative to the repo root).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const BASE = path.join(REPO, 'evidence', '2026-10-25', 'perseed-sim-poolpres-lever-b');
function argVal(flag, dflt) {
  const i = process.argv.indexOf(flag);
  return (i >= 0 && process.argv[i + 1]) ? process.argv[i + 1] : dflt;
}
function loadBand(dir) {
  const p = path.join(dir, 'summary.json');
  const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
  const a = raw.analysis || {};
  const w = raw.wall || {};
  return {
    dir, wall: w,
    raids: a.raidCount, raiders: a.raiderCount,
    poolTotal: a.poolTotal, poolByWave: a.poolByWave,
    poolW3Count: a.poolW3Count, poolW3Share: a.poolW3Share,
    poolW3ShareSE: a.poolW3ShareSE,
    w3plusPerRaid: a.w3plusPerRaidValue,
    raidsWithW3Drafted: a.raidsWithW3Drafted,
    raidsWithW3InPool: a.raidsWithW3InPool,
    meanRaidN: a.meanRaidN,
    impliedMean: a.impliedPresenceMeanRaidN,
    impliedDist: a.impliedPresenceDistWeighted,
    hyper: a.hypergeometric || {},
    timeSeries: a.timeSeries || {},
    perSeedPool: a.perSeedPool || {},
  };
}
function pct(x) { return (x == null || Number.isNaN(x)) ? 'n/a' : (x * 100).toFixed(2) + '%'; }
function main() {
  const control = loadBand(argVal('--control', path.join(BASE, 'control')));
  const armed = loadBand(argVal('--armed', path.join(BASE, 'armed')));
  const primShare = armed.poolW3Share >= 0.23;
  const primPerRaid = armed.w3plusPerRaid >= 0.9;
  const primary = primShare && primPerRaid;
  const gWins = armed.wall.won >= 3;
  const gNat = armed.wall.nationalEver >= 6;
  const lo = control.wall.deathTotal * 0.8, hi = control.wall.deathTotal * 1.2;
  const gDeaths = armed.wall.deathTotal >= lo && armed.wall.deathTotal <= hi;
  const guards = gWins && gNat && gDeaths;
  const verdict = (primary && guards) ? 'GO' : 'NO-GO';
  console.log('\n=== sim-poolpres-lever-b: control vs lever (identical seeds 73671-73678) ===');
  console.log(`CONTROL: raids=${control.raids} raiders=${control.raiders} poolN=${control.poolTotal} poolW3=${control.poolW3Count} share=${pct(control.poolW3Share)} w3+/raid=${(control.w3plusPerRaid || 0).toFixed(3)} won=${control.wall.won}/8 natEver=${control.wall.nationalEver}/8 deaths=${control.wall.deathTotal} medianDays=${control.wall.medianDays}`);
  console.log(`LEVER:   raids=${armed.raids} raiders=${armed.raiders} poolN=${armed.poolTotal} poolW3=${armed.poolW3Count} share=${pct(armed.poolW3Share)} w3+/raid=${(armed.w3plusPerRaid || 0).toFixed(3)} won=${armed.wall.won}/8 natEver=${armed.wall.nationalEver}/8 deaths=${armed.wall.deathTotal} medianDays=${armed.wall.medianDays}`);
  console.log(`PRIMARY pool share >= 23%: ${pct(armed.poolW3Share)} -> ${primShare ? 'PASS' : 'FAIL'}`);
  console.log(`PRIMARY w3+/raid >= 0.9: ${(armed.w3plusPerRaid || 0).toFixed(3)} -> ${primPerRaid ? 'PASS' : 'FAIL'}`);
  console.log(`PRIMARY (both): ${primary ? 'PASS' : 'FAIL'}`);
  console.log(`GUARD wins >= 3/8: ${armed.wall.won}/8 -> ${gWins ? 'PASS' : 'FAIL'}`);
  console.log(`GUARD national-ever >= 6/8: ${armed.wall.nationalEver}/8 -> ${gNat ? 'PASS' : 'FAIL'}`);
  console.log(`GUARD deaths within ±20% of control ${control.wall.deathTotal} [${lo.toFixed(1)}, ${hi.toFixed(1)}]: ${armed.wall.deathTotal} -> ${gDeaths ? 'PASS' : 'FAIL'}`);
  console.log(`GUARDS (all): ${guards ? 'PASS' : 'FAIL'}`);
  console.log(`SECONDARY raids with >=1 w3+ raider: control ${control.raidsWithW3Drafted}/${control.raids} lever ${armed.raidsWithW3Drafted}/${armed.raids}`);
  console.log(`SECONDARY wave-5 pool presence: control w5=${(control.poolByWave['5'] || 0)} lever w5=${(armed.poolByWave['5'] || 0)} (finding only, not a bar)`);
  console.log(`SECONDARY wave-4 pool: control w4=${(control.poolByWave['4'] || 0)} lever w4=${(armed.poolByWave['4'] || 0)}`);
  console.log(`VERDICT: ${verdict}${verdict === 'GO' ? ' — land the lever' : ' — do not land; revert game code, commit measurement only'}`);
  console.log(`  (mean-count bar: 23% buys ~1 w3+ raider/raid ON AVERAGE, not one in every raid)`);
}
if (require.main === module) {
  try { main(); }
  catch (e) { console.error('POOLPRES-LEVER-COMPARE FAILED:', (e && e.stack) || e); process.exit(1); }
}

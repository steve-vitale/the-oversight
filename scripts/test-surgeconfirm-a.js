#!/usr/bin/env node
// scripts/test-surgeconfirm-a.js — proof validator + analyzer for
// sim-surgeconfirm-a (scale-onramp axis, 2026-10-27: CONFIRMING
// MEASUREMENT for the wave-4 arrival surge attribution.
// DIAG ONLY, zero src/js changes.)
//
// Pure corpus analysis: no harness, no RNG, no game state. Reads
// evidence/2026-10-27/perseed-surgeconfirm-a/s<seed>-<arm>.json
// (arms: control, fallbackoff), re-derives per-seed metrics with the
// VERBATIM analyzer (scripts/test-w4funnel-diag.js, exported
// analyzeW4funnel), re-derives the control band and the control-vs-
// repin comparison, checks corpus recorder errors, checks the five
// recorder sha256 values against the prereg, checks the fallback-off
// variant diffs (competent-nofallback byte-identical to the
// pre-fallback competent.js blob; leanlink/tableseat variants differ
// only in the require line + policy id), and judges the BINDING
// PROMOTION RULE from the prereg:
//
//   EXPLAINS iff fallback-off total arrivals <= 18 AND median
//   first-standing-100 day >= control median + 5 days.
//   DEMOTE iff fallback-off arrivals >= 24.
//   Otherwise INCONCLUSIVE.
//
// Unit-tests the promotion-rule function and the median function at
// the boundaries (18/19/24 arrivals, median +5 edge). Exit non-zero
// on any failed check. A control-vs-repin difference is REPORTED,
// never a failure (base movement, prereg rule); the verdict itself
// (EXPLAINS / DEMOTE / INCONCLUSIVE) is an output, never a failure.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const { analyzeW4funnel } = require('./test-w4funnel-diag');

const REPO = path.join(__dirname, '..');
const DIR = process.argv[2] || path.join(REPO, 'evidence', '2026-10-27', 'perseed-surgeconfirm-a');
const SEEDS = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
const REPIN = {
  nationalEver: 7, nationalFinal: 5, table: 5, entered: 4, wins: 4,
  wave4: 5, wave5: 0, medianDays: 130, deaths: 284, starvation: 2,
  arrivals: 31, tileEntry: 28, scriptedTitan: 3,
};
const RECORDER_SHA = {
  'raftdraft-diag.js': '5aef723cb3c902bee6d03eb9b40f8194bbd616a7798049f226c1417194e10b97',
  'spawnsrc-diag.js': '31c496ac41e1213095b3b25854a6c7e584cc05c0bbb255e39c9376a0a3da4e17',
  'oldcore-diag.js': 'efedd0cd0999d9f1b4987671b1da791109579ebdf72bb97d7478dc85c6e706cd',
  'w5births-diag.js': 'b2f2d909f0bdc8a3d4bb2fd40e6d70d7a7a578da169e4b3d49ab63b7b0da1ebe',
  'defwound-diag.js': '3f3f8eed58bb1a4bf02e124ae47f0ff5255a059339898cc93b1231bcb1fd9401',
};
const SHA = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function medianOf(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function promotionRule(offArrivals, offMedian, controlMedian) {
  if (offArrivals <= 18 && offMedian !== null && controlMedian !== null && offMedian >= controlMedian + 5) return 'EXPLAINS';
  if (offArrivals >= 24) return 'DEMOTE';
  return 'INCONCLUSIVE';
}
let failures = 0;
function check(name, ok, extra) {
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${extra !== undefined ? ' ' + extra : ''}`);
  if (!ok) failures++;
}

// --- unit checks: promotion rule + median boundaries (no corpus) ---
check('unit: 18 arrivals + median+5 => EXPLAINS', promotionRule(18, 105, 100) === 'EXPLAINS');
check('unit: 18 arrivals + median+4 => INCONCLUSIVE', promotionRule(18, 104, 100) === 'INCONCLUSIVE');
check('unit: 19 arrivals + median+20 => INCONCLUSIVE', promotionRule(19, 120, 100) === 'INCONCLUSIVE');
check('unit: 24 arrivals => DEMOTE (even with late median)', promotionRule(24, 200, 100) === 'DEMOTE');
check('unit: 23 arrivals => INCONCLUSIVE', promotionRule(23, 200, 100) === 'INCONCLUSIVE');
check('unit: 0 arrivals + null median => INCONCLUSIVE (no median to compare)', promotionRule(0, null, 100) === 'INCONCLUSIVE');
check('unit: median [100,120] => 120 (upper median, 2 values)', medianOf([100, 120]) === 120);
check('unit: median [] => null', medianOf([]) === null);
check('unit: median [90,100,110] => 100', medianOf([90, 100, 110]) === 100);

// --- recorder identity (verbatim claim) ---
for (const [file, want] of Object.entries(RECORDER_SHA)) {
  const got = SHA(path.join(REPO, 'scripts', 'policies', file));
  check(`recorder sha ${file}`, got === want, got === want ? '' : `got=${got}`);
}

// --- variant diff checks (git) ---
try {
  const pre = execSync('git show 908ad0f12^:scripts/policies/competent.js', { cwd: REPO, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const variant = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent-nofallback.js'), 'utf8');
  check('variant: competent-nofallback == pre-fallback competent.js blob', pre === variant);
} catch (e) { check('variant: competent-nofallback == pre-fallback blob (git read)', false, String(e).slice(0, 120)); }
try {
  const ll = execSync('git diff --no-index -- scripts/policies/leanlinkrescue.js scripts/policies/leanlinkrescue-nofallback.js || true', { cwd: REPO, encoding: 'utf8' });
  const llLines = ll.split('\n').filter(l => (l.startsWith('-') && !l.startsWith('---')) || (l.startsWith('+') && !l.startsWith('+++')));
  check('variant: leanlinkrescue diff is require+id only', llLines.length === 4
    && llLines.some(l => l.includes("require('./competent-nofallback')"))
    && llLines.some(l => l.includes('leanlinkrescue-nofallback')), JSON.stringify(llLines));
} catch (e) { check('variant: leanlinkrescue diff', false, String(e).slice(0, 120)); }
try {
  const ts = execSync('git diff --no-index -- scripts/policies/tableseat-nowait.js scripts/policies/tableseat-nowait-nofallback.js || true', { cwd: REPO, encoding: 'utf8' });
  const tsLines = ts.split('\n').filter(l => (l.startsWith('-') && !l.startsWith('---')) || (l.startsWith('+') && !l.startsWith('+++')));
  check('variant: tableseat diff is require line only', tsLines.length === 2
    && tsLines.some(l => l.includes("require('./leanlinkrescue-nofallback')")), JSON.stringify(tsLines));
} catch (e) { check('variant: tableseat diff', false, String(e).slice(0, 120)); }
try {
  const status = execSync('git status --porcelain -- scripts/policies/competent.js', { cwd: REPO, encoding: 'utf8' }).trim();
  check('variant: competent.js untouched by this run', status === '', status ? `status=${status}` : '');
} catch (e) { check('variant: competent.js untouched', false, String(e).slice(0, 120)); }

// --- corpus analysis ---
const perArm = {};
for (const arm of ['control', 'fallbackoff']) {
  const rows = [];
  for (const seed of SEEDS) {
    const p = path.join(DIR, `s${seed}-${arm}.json`);
    check(`corpus: ${arm} seed ${seed} row exists`, fs.existsSync(p));
    if (!fs.existsSync(p)) continue;
    const row = JSON.parse(fs.readFileSync(p, 'utf8'));
    rows.push(row);
  }
  const analyzed = rows.map(r => analyzeW4funnel(r));
  const arrivals = analyzed.reduce((t, a) => t + a.arrivals, 0);
  const srcCounts = {};
  for (const a of analyzed) for (const [k, v] of Object.entries(a.arrivalSrcCounts || {})) srcCounts[k] = (srcCounts[k] || 0) + v;
  const corpusOk = rows.every(r => r.days > 0 && r.spawnsrc && r.spawnsrc.diag.errs === 0
    && r.raftdraft && r.raftdraft.diag.errs === 0 && r.oldcore && r.oldcore.diag.errs === 0
    && r.w5births && r.w5births.diag.errs === 0 && r.defwound && r.defwound.diag.errs === 0
    && (r.surge.standingErrs | 0) === 0 && (r.surge.readinessErrs | 0) === 0);
  check(`corpus: ${arm} recorder errors 0 + surge reads clean`, corpusOk);
  const band = {
    won: rows.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(rows.map(r => r.days)),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    deaths: rows.reduce((t, r) => t + r.deathTotal, 0),
    starvation: rows.reduce((t, r) => t + r.starvationDeaths, 0),
  };
  const metrics = rows.map((r, i) => ({
    seed: r.seed, days: r.days, endReason: r.endReason, won: r.won, waveReach: r.waveReach,
    arrivals: analyzed[i].arrivals,
    arrivalDetail: (analyzed[i].detail || []).map(d => `${d.type}@d${d.arrivalDay}:${d.src}->${d.outcome}`),
    firstStanding100Day: r.surge.firstStanding100Day,
    firstReadinessDay: r.surge.firstReadinessDay,
    derivedOpenDay: r.surge.derivedOpenDay,
    feasts: (r.surge.endStanding || {}).feasts,
    endStandingTotal: (r.surge.endStanding || {}).total,
    cookStaffed: r.ctxCounters.cookStaffed, fishStaffed: r.ctxCounters.fishStaffed,
    cookStaffFallback: r.ctxCounters.cookStaffFallback, fishStaffFallback: r.ctxCounters.fishStaffFallback,
  }));
  const reachDays = metrics.map(m => m.firstStanding100Day).filter(d => d !== null);
  const medStanding = medianOf(reachDays);
  perArm[arm] = { rows, analyzed, arrivals, srcCounts, band, metrics, medStanding, reachCount: reachDays.length };
  console.log(`\n  --- ${arm}: arrivals=${arrivals} src=${JSON.stringify(srcCounts)} band won=${band.won}/${rows.length} medD=${band.medianDays} natEver=${band.nationalEver} natFinal=${band.nationalFinal} table=${band.table} entered=${band.entered} wave4=${band.wave4} wave5=${band.wave5} deaths=${band.deaths} starv=${band.starvation} medianStanding100d=${medStanding} (reached ${reachDays.length}/8) ---`);
  for (const m of metrics) console.log(`    seed ${m.seed}: days=${m.days} ${m.endReason} wave=${m.waveReach} won=${m.won} arrivals=${m.arrivals} [${m.arrivalDetail.join('; ')}] standing100d=${m.firstStanding100Day} readinessd=${m.firstReadinessDay} opend=${m.derivedOpenDay} feasts=${m.feasts} endStanding=${m.endStandingTotal} cook=${m.cookStaffed} fish=${m.fishStaffed} cookFB=${m.cookStaffFallback} fishFB=${m.fishStaffFallback}`);
}

// --- control vs repin per-seed (trajectory fields + ts + faced + log) ---
// The band-level table flag is a transient-capture artifact, not base
// movement, iff: every trajectory field matches on every seed, the ts
// seat records match, and only the table (tableWaiting-ever-observed)
// flag differs — because this sweep's wrapper snaps AFTER base.daily
// while the repin's snapped BEFORE it, and tableWaiting is set
// overnight and consumed by the next day's seat leg.
const SHARED = ['days', 'gameDays', 'endReason', 'won', 'waveReach', 'maxArc', 'finalRank', 'maxRank', 'nationalEver', 'nationalFinal', 'entered', 'deathTotal', 'starvationDeaths'];
for (const seed of SEEDS) {
  const repPath = path.join(REPO, 'evidence', '2026-10-27', 'perseed-w4funnel-repin-a', `s${seed}-armed.json`);
  const rep = JSON.parse(fs.readFileSync(repPath, 'utf8'));
  const ctl = perArm.control.rows.find(r => r.seed === seed);
  const trajDiffs = SHARED.filter(f => JSON.stringify(rep[f]) !== JSON.stringify(ctl[f]));
  const tsSame = JSON.stringify(rep.ts || {}) === JSON.stringify(ctl.ts || {});
  const facedSame = JSON.stringify((rep.raftdraft || {}).faced || {}) === JSON.stringify((ctl.raftdraft || {}).faced || {});
  const logSame = JSON.stringify((rep.raftdraft || {}).logEntries || []) === JSON.stringify((ctl.raftdraft || {}).logEntries || []);
  console.log(`  repin-vs-control seed ${seed}: trajectory diffs=[${trajDiffs.join(',') || 'none'}] table rep=${rep.table} ctl=${ctl.table} tsSame=${tsSame} facedSame=${facedSame} logSame=${logSame}`);
}
console.log('  (table-flag note: this sweep snaps after base.daily; the repin snapped before it. A tableWaiting set overnight is consumed by the next day\'s seat leg before this sweep\'s snap, so everTable can read 0 while entered + ts seat records prove the invitation happened.)');

// --- control vs repin (report-only) ---
// Full-table exactness INCLUDES the transient table (invited) flag, so
// it reads MOVED on the snap-timing artifact alone; trajectory
// exactness excludes only that flag and is the base-movement test.
const cb = perArm.control.band;
const controlExactTrajectory = cb.nationalEver === REPIN.nationalEver && cb.nationalFinal === REPIN.nationalFinal
  && cb.entered === REPIN.entered && cb.won === REPIN.wins
  && cb.wave4 === REPIN.wave4 && cb.wave5 === REPIN.wave5 && cb.medianDays === REPIN.medianDays
  && cb.deaths === REPIN.deaths && cb.starvation === REPIN.starvation
  && perArm.control.arrivals === REPIN.arrivals
  && (perArm.control.srcCounts['tile-entry'] || 0) === REPIN.tileEntry
  && (perArm.control.srcCounts['scripted-titan'] || 0) === REPIN.scriptedTitan;
const controlExact = controlExactTrajectory && cb.table === REPIN.table;
console.log(`\n  CONTROL-vs-REPIN (report-only): full-table ${controlExact ? 'EXACT' : 'MOVED'}; trajectory+arrivals ${controlExactTrajectory ? 'EXACT' : 'MOVED'} — control won=${cb.won} natEver=${cb.nationalEver} natFinal=${cb.nationalFinal} table=${cb.table} (repin ${REPIN.table}, transient-flag artifact, see per-seed lines) entered=${cb.entered} wave4=${cb.wave4} wave5=${cb.wave5} medD=${cb.medianDays} deaths=${cb.deaths} starv=${cb.starvation} arrivals=${perArm.control.arrivals} src=${JSON.stringify(perArm.control.srcCounts)}`);
console.log(`  REPIN reference: wins=${REPIN.wins} natEver=${REPIN.nationalEver} natFinal=${REPIN.nationalFinal} table=${REPIN.table} entered=${REPIN.entered} wave4=${REPIN.wave4} wave5=${REPIN.wave5} medD=${REPIN.medianDays} deaths=${REPIN.deaths} starv=${REPIN.starvation} arrivals=${REPIN.arrivals} tile-entry=${REPIN.tileEntry} scripted-titan=${REPIN.scriptedTitan}`);

// --- promotion verdict (binding rule) ---
const verdict = promotionRule(perArm.fallbackoff.arrivals, perArm.fallbackoff.medStanding, perArm.control.medStanding);
console.log(`\n  PROMOTION RULE: fallback-off arrivals=${perArm.fallbackoff.arrivals} (EXPLAINS needs <=18, DEMOTE needs >=24); fallback-off median standing-100 day=${perArm.fallbackoff.medStanding} vs control median=${perArm.control.medStanding} (EXPLAINS needs >= control+5 = ${perArm.control.medStanding === null ? 'n/a' : perArm.control.medStanding + 5}); reaching counts control=${perArm.control.reachCount}/8 fallback-off=${perArm.fallbackoff.reachCount}/8`);
console.log(`  VERDICT: ${verdict}`);

console.log(`\nSURGEONFIRM PROOF: ${failures === 0 ? 'ALL CHECKS PASS' : failures + ' CHECK(S) FAILED'} (verdict: ${verdict})`);
if (failures) process.exit(1);

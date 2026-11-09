#!/usr/bin/env node
// scripts/test-tendretest-a-judge.js — sim-tendretest-a cross-leg judge.
//
// Adapted from scripts/test-tenddrive-a-judge.js (same lever, same
// instruments, new band 76409–76420, 12 seeds). Reads the BEFORE (unfixed
// tree) and AFTER (fixed tree) leg summaries
// (scripts/test-tendretest-a-sweep.js output) and judges the retest
// against the PRE-REGISTERED bars in
// evidence/2026-11-08/sim-tendretest-a-prereg.md (§14 — a miss is NO-GO,
// never re-scored). The judgment compares the RECORDED arms across
// legs, identical instruments, only the game code differs.
//
// Bars (prereg):
//   JUDGEABILITY GATE (first): the baseline leg must show >=1
//     national-loss event (diag.nationalLost on the armed arm). Zero
//     events = NO-GO-unjudgeable — the verdict is that, whatever the
//     other bars say. Do NOT widen the band, do NOT re-run.
//   PRIMARY: candidate national final >= baseline + 2 AND every
//     baseline loss seed (a seed with >=1 nationalLost event on the
//     baseline armed leg) holds national to end on the candidate leg
//     (nationalFinal === 1).
//   MECHANISM: engine tends while nationalLive observed on >=1 seed,
//     AND >=1 link topped to trust >=55 while national BY A TEND
//     (tend-attributed topping: an engine-winplan tend while national
//     with trustBefore < 55 <= trustAfter — the bare topped-55 is
//     non-discriminating, the baseline already reaches >=55 via
//     court/aid gains).
//   SECONDARY (scalemetric): starvation <= control + 2 (totals AND
//     arm-only), median >= 0.8x control median.
//   GO = gate + primary + mechanism + secondary all hold.
// Usage: node scripts/test-tendretest-a-judge.js [beforeSummary] [afterSummary]
//   Defaults: evidence/2026-11-08/perseed-tendretest-a-before/summary.json
//   and .../perseed-tendretest-a-after/summary.json.
// Prints one JSON object; exit 0 on GO, 1 on NO-GO (or on unreadable input).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const beforePath = process.argv[2] || path.join(REPO, 'evidence', '2026-11-08', 'perseed-tendretest-a-before', 'summary.json');
const afterPath = process.argv[3] || path.join(REPO, 'evidence', '2026-11-08', 'perseed-tendretest-a-after', 'summary.json');

function load(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { console.error('JUDGE-INPUT-FAIL ' + p + ': ' + String((e && e.message) || e).slice(0, 200)); process.exit(1); }
}
function armedRows(summary) {
  return (summary.rows || []).filter(r => r.policy === 'armed');
}
function rowBySeed(rows, seed) { return rows.find(r => r.seed === seed) || null; }
function natLostCount(row) {
  if (!row || !row.diag) return 0;
  return (row.diag.nationalLost || []).length;
}

const before = load(beforePath);
const after = load(afterPath);
const bArmed = armedRows(before);
const aArmed = armedRows(after);
const bAgg = before.byPolicy && before.byPolicy.armed ? before.byPolicy.armed : null;
const aAgg = after.byPolicy && after.byPolicy.armed ? after.byPolicy.armed : null;
const seeds = (before.seeds && before.seeds.length ? before.seeds : bArmed.map(r => r.seed));

const bars = {};
// JUDGEABILITY GATE: >=1 national-loss event on the baseline armed leg.
const baselineLossSeeds = bArmed.filter(r => natLostCount(r) > 0).map(r => r.seed);
const baselineLossEvents = bArmed.reduce((t, r) => t + natLostCount(r), 0);
bars.judgeability = {
  baselineNationalLossEvents: baselineLossEvents,
  baselineLossSeeds,
  pass: baselineLossEvents >= 1,
};
// PRIMARY: national final delta + every baseline loss seed holds.
const bNatFinal = bAgg ? bAgg.nationalFinal : bArmed.reduce((t, r) => t + (r.nationalFinal || 0), 0);
const aNatFinal = aAgg ? aAgg.nationalFinal : aArmed.reduce((t, r) => t + (r.nationalFinal || 0), 0);
const lossSeedsHold = {};
for (const seed of baselineLossSeeds) {
  lossSeedsHold[seed] = (rowBySeed(aArmed, seed) || {}).nationalFinal === 1;
}
bars.primary = {
  baselineNationalFinal: bNatFinal, candidateNationalFinal: aNatFinal,
  delta: aNatFinal - bNatFinal, neededDelta: 2,
  lossSeedsHold,
  pass: (aNatFinal - bNatFinal) >= 2 && Object.keys(lossSeedsHold).every(s => lossSeedsHold[s]),
};
// MECHANISM: engine tends while nationalLive on >=1 seed + >=1
// TEND-ATTRIBUTED topping to >=55 while national.
const aTend = aAgg ? aAgg.tend : null;
const engNat = aTend ? aTend.engineTendsWhileNational : 0;
const engNatSeeds = aTend ? aTend.engineTendsWhileNationalSeeds : [];
const topped55Seeds = aTend ? aTend.topped55Seeds : [];
const tendAttrTopped55Seeds = aTend ? (aTend.tendAttributedTopped55Seeds || []) : [];
bars.mechanism = {
  engineTendsWhileNational: engNat, engineTendsWhileNationalSeeds: engNatSeeds,
  topped55Seeds,
  tendAttributedTopped55Seeds,
  pass: engNat >= 1 && tendAttrTopped55Seeds.length >= 1,
};
// SECONDARY: starvation totals AND arm-only <= control + 2; median >= 0.8x control.
const bStarvAll = (before.rows || []).reduce((t, r) => t + (r.starvationDeaths || 0), 0);
const aStarvAll = (after.rows || []).reduce((t, r) => t + (r.starvationDeaths || 0), 0);
const bStarvArmed = bAgg ? bAgg.starvationTotal : 0;
const aStarvArmed = aAgg ? aAgg.starvationTotal : 0;
const bMed = bAgg ? bAgg.medianDays : 0;
const aMed = aAgg ? aAgg.medianDays : 0;
bars.secondary = {
  starvationTotalBefore: bStarvAll, starvationTotalAfter: aStarvAll,
  starvationArmedBefore: bStarvArmed, starvationArmedAfter: aStarvArmed,
  medianBefore: bMed, medianAfter: aMed, medianRatio: bMed ? +(aMed / bMed).toFixed(3) : null,
  pass: aStarvAll <= bStarvAll + 2 && aStarvArmed <= bStarvArmed + 2 && bMed > 0 && aMed >= 0.8 * bMed,
};
// Context (not bars): per-seed national picture.
const perSeed = {};
for (const seed of seeds) {
  const b = rowBySeed(bArmed, seed), a = rowBySeed(aArmed, seed);
  perSeed[seed] = {
    before: b ? { days: b.days, nationalEver: b.nationalEver, nationalFinal: b.nationalFinal, nationalLost: natLostCount(b), finalRank: b.finalRank, won: b.won } : null,
    after: a ? { days: a.days, nationalEver: a.nationalEver, nationalFinal: a.nationalFinal, nationalLost: natLostCount(a), finalRank: a.finalRank, won: a.won } : null,
  };
}
const go = bars.judgeability.pass && bars.primary.pass && bars.mechanism.pass && bars.secondary.pass;
const verdict = !bars.judgeability.pass ? 'NO-GO-unjudgeable' : (go ? 'GO' : 'NO-GO');
const result = {
  verdict,
  bars, perSeed,
  note: 'Loss seeds are defined by the baseline armed leg (diag.nationalLost events). No seed is excluded from win claims a priori on this band; any seed that never forms a third sub is context, not a bar.',
  before: beforePath, after: afterPath,
};
console.log(JSON.stringify(result, null, 1));
console.log(`JUDGE ${result.verdict} — gate ${bars.judgeability.pass ? 'PASS' : 'FAIL'} (baseline natLoss events=${baselineLossEvents} seeds=${JSON.stringify(baselineLossSeeds)}) | primary ${bars.primary.pass ? 'PASS' : 'FAIL'} (natFinal ${bNatFinal}->${aNatFinal}, hold ${JSON.stringify(lossSeedsHold)}) | mechanism ${bars.mechanism.pass ? 'PASS' : 'FAIL'} (engTendsWhileNat=${engNat} seeds=${JSON.stringify(engNatSeeds)} tendAttrTopped55=${JSON.stringify(tendAttrTopped55Seeds)} bareTopped55=${JSON.stringify(topped55Seeds)}) | secondary ${bars.secondary.pass ? 'PASS' : 'FAIL'} (starv total ${bStarvAll}->${aStarvAll}, armed ${bStarvArmed}->${aStarvArmed}, median ${bMed}->${aMed})`);
process.exit(go ? 0 : 1);

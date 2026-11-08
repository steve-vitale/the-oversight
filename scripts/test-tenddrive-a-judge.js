#!/usr/bin/env node
// scripts/test-tenddrive-a-judge.js — sim-tenddrive-a cross-leg judge.
//
// Reads the BEFORE (unfixed tree) and AFTER (fixed tree) leg summaries
// (scripts/test-tenddrive-a-sweep.js output) and judges the pilot
// against the PRE-REGISTERED bars in
// evidence/2026-11-08/sim-tenddrive-a-prereg.md (§14 — a miss is NO-GO,
// never re-scored). The judgment compares the RECORDED arms across
// legs, identical instruments, only the game code differs.
//
// Bars:
//   PRIMARY: candidate national final >= baseline + 2 (i.e. >=5/8 if
//     baseline replicates 3/8) AND the two observed loss seeds (76407,
//     76408) hold national to end.
//   MECHANISM: engine tends while nationalLive observed on >=1 seed,
//     AND at least one link topped to trust >=55 while national.
//   SECONDARY (scalemetric): starvation <= control + 2 (totals AND
//     arm-only), median >= 0.8x control median.
//   76404 is EXCLUDED from any win claim (never forms a third sub).
//   GO = primary + mechanism + secondary all hold.
// Usage: node scripts/test-tenddrive-a-judge.js [beforeSummary] [afterSummary]
//   Defaults: evidence/2026-11-08/perseed-tenddrive-a-before/summary.json
//   and .../perseed-tenddrive-a-after/summary.json.
// Prints one JSON object; exit 0 on GO, 1 on NO-GO (or on unreadable input).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const beforePath = process.argv[2] || path.join(REPO, 'evidence', '2026-11-08', 'perseed-tenddrive-a-before', 'summary.json');
const afterPath = process.argv[3] || path.join(REPO, 'evidence', '2026-11-08', 'perseed-tenddrive-a-after', 'summary.json');

function load(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { console.error('JUDGE-INPUT-FAIL ' + p + ': ' + String((e && e.message) || e).slice(0, 200)); process.exit(1); }
}
function armedRows(summary) {
  return (summary.rows || []).filter(r => r.policy === 'armed');
}
function rowBySeed(rows, seed) { return rows.find(r => r.seed === seed) || null; }

const before = load(beforePath);
const after = load(afterPath);
const bArmed = armedRows(before);
const aArmed = armedRows(after);
const bAgg = before.byPolicy && before.byPolicy.armed ? before.byPolicy.armed : null;
const aAgg = after.byPolicy && after.byPolicy.armed ? after.byPolicy.armed : null;

const bars = {};
// PRIMARY: national final delta + the two loss seeds hold.
const bNatFinal = bAgg ? bAgg.nationalFinal : bArmed.reduce((t, r) => t + (r.nationalFinal || 0), 0);
const aNatFinal = aAgg ? aAgg.nationalFinal : aArmed.reduce((t, r) => t + (r.nationalFinal || 0), 0);
const hold76407 = (rowBySeed(aArmed, 76407) || {}).nationalFinal === 1;
const hold76408 = (rowBySeed(aArmed, 76408) || {}).nationalFinal === 1;
bars.primary = {
  baselineNationalFinal: bNatFinal, candidateNationalFinal: aNatFinal,
  delta: aNatFinal - bNatFinal, neededDelta: 2,
  lossSeedsHold: { 76407: hold76407, 76408: hold76408 },
  pass: (aNatFinal - bNatFinal) >= 2 && hold76407 && hold76408,
};
// MECHANISM: engine tends while nationalLive on >=1 seed + a link topped >=55 while national.
const aTend = aAgg ? aAgg.tend : null;
const engNat = aTend ? aTend.engineTendsWhileNational : 0;
const engNatSeeds = aTend ? aTend.engineTendsWhileNationalSeeds : [];
const topped55Seeds = aTend ? aTend.topped55Seeds : [];
bars.mechanism = {
  engineTendsWhileNational: engNat, engineTendsWhileNationalSeeds: engNatSeeds,
  topped55Seeds,
  pass: engNat >= 1 && topped55Seeds.length >= 1,
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
// Context (not bars): per-seed national picture, 76404 exclusion note.
const perSeed = {};
for (const seed of [76401, 76402, 76403, 76404, 76405, 76406, 76407, 76408]) {
  const b = rowBySeed(bArmed, seed), a = rowBySeed(aArmed, seed);
  perSeed[seed] = {
    before: b ? { days: b.days, nationalEver: b.nationalEver, nationalFinal: b.nationalFinal, finalRank: b.finalRank, won: b.won } : null,
    after: a ? { days: a.days, nationalEver: a.nationalEver, nationalFinal: a.nationalFinal, finalRank: a.finalRank, won: a.won } : null,
  };
}
const go = bars.primary.pass && bars.mechanism.pass && bars.secondary.pass;
const result = {
  verdict: go ? 'GO' : 'NO-GO',
  bars, perSeed,
  note: '76404 excluded from any win claim (never forms a third sub; no tend count fixes it — tendtrust spec).',
  before: beforePath, after: afterPath,
};
console.log(JSON.stringify(result, null, 1));
console.log(`JUDGE ${result.verdict} — primary ${bars.primary.pass ? 'PASS' : 'FAIL'} (natFinal ${bNatFinal}->${aNatFinal}, hold 76407=${hold76407} 76408=${hold76408}) | mechanism ${bars.mechanism.pass ? 'PASS' : 'FAIL'} (engTendsWhileNat=${engNat} seeds=${JSON.stringify(engNatSeeds)} topped55=${JSON.stringify(topped55Seeds)}) | secondary ${bars.secondary.pass ? 'PASS' : 'FAIL'} (starv total ${bStarvAll}->${aStarvAll}, armed ${bStarvArmed}->${aStarvArmed}, median ${bMed}->${aMed})`);
process.exit(go ? 0 : 1);

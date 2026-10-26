#!/usr/bin/env node
// analyze-fishfallback-b.js — before/after comparison for sim-fishfallback-b.
// Reads the sim-fishfallback-b-corpus dir, pairs baseline vs armed per-seed
// files, prints the per-seed table, and judges the run against the
// PRE-REGISTERED GO legs in evidence/2026-10-26/sim-fishfallback-b.md:
//   G1 RESCUE: every pilot seed with baseline snapFishDays==0 has armed
//      snapFishDays>=5 AND armed ok>=5.
//   G2 NO EMPTY BURN: no seed with armed ok==0 and armed refused>=10.
//   G3 FALLBACK FIRES: armed ctx fishStaffFallback total >= 1.
//   G4 COST BARS: per seed armed starvation <= baseline starvation + 2,
//      and armed median daysAlive >= 0.8 x baseline median daysAlive.
// Exit 0 = GO (all legs hold) or a report-only run when --report-only is
// passed; exit 1 = NO-GO. Never re-scores: thresholds are constants here.
// Usage: node scripts/analyze-fishfallback-b.js <corpus-dir> [seeds-csv]
//   (seeds-csv defaults to the pilot band 9750-9757; pass the confirm band
//   for a confirm run). With --report-only it prints the table + legs
//   without exiting nonzero on NO-GO (for evidence drafting).
'use strict';
const fs = require('fs');
const path = require('path');
const dir = process.argv[2];
const reportOnly = process.argv.includes('--report-only');
const seedsArg = process.argv.find(a => /^\d+(,\d+)*$/.test(a));
const seeds = seedsArg ? seedsArg.split(',').map(Number) : [9750, 9751, 9752, 9753, 9754, 9755, 9756, 9757];
if (!dir) { console.error('usage: analyze-fishfallback-b.js <corpus-dir> [seeds-csv] [--report-only]'); process.exit(2); }
const load = (arm, side, seed) => {
  const f = `fishfallback-b-${arm}-${side}-dg1-leadfeast-s${seed}.json`;
  const p = path.join(dir, f);
  if (!fs.existsSync(p)) return null;
  return { file: f, j: JSON.parse(fs.readFileSync(p, 'utf8')) };
};
const med = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
const rows = [];
let missing = [];
for (const seed of seeds) {
  const b = load('baseline', 'pd0', seed);
  const a = load('armed', 'pd0', seed);
  if (!b || !a) { missing.push(seed); continue; }
  const ba = b.j.fishAgg, aa = a.j.fishAgg;
  const maxRef = (agg) => { let m = 0, who = '-'; for (const [v, n] of Object.entries(agg.refusedByVid || {})) if (n > m) { m = n; who = v; } return { n: m, who }; };
  rows.push({ seed,
    bDays: b.j.daysAlive, aDays: a.j.daysAlive,
    bOk: ba.fishOk, aOk: aa.fishOk, bRef: ba.fishRefused, aRef: aa.fishRefused,
    bMaxRef: maxRef(ba), aMaxRef: maxRef(aa),
    bSnap: ba.snapFishDays, aSnap: aa.snapFishDays,
    bFresh: ba.holdersByClass['FRESH-OK'] || 0, aFresh: aa.holdersByClass['FRESH-OK'] || 0,
    bStale: ba.holdersByClass.STALE || 0, aStale: aa.holdersByClass.STALE || 0,
    bGap: ba.holdersByClass.GAP || 0, aGap: aa.holdersByClass.GAP || 0,
    bStarv: b.j.starvationDeaths, aStarv: a.j.starvationDeaths,
    bDeaths: b.j.deaths, aDeaths: a.j.deaths,
    bWave: b.j.waveReach, aWave: a.j.waveReach, bNat: b.j.national, aNat: a.j.national,
    bWin: b.j.win, aWin: a.j.win,
    bFb: (b.j.ctxEnd || {}).fishStaffFallback || 0, aFb: (a.j.ctxEnd || {}).fishStaffFallback || 0,
    bStaffed: (b.j.ctxEnd || {}).fishStaffed || 0, aStaffed: (a.j.ctxEnd || {}).fishStaffed || 0,
    bHead: b.j.head, aHead: a.j.head, bDig: b.j.competentDigest, aDig: a.j.competentDigest });
}
console.log('seed | days B->A | ok B->A | refused B->A (max single vid A) | snapDays B->A | FRESH B->A | STALE B->A | starv B->A | deaths B->A | wave B->A | nat B->A | fallbackCtx A');
for (const r of rows) console.log(`${r.seed} | ${r.bDays}->${r.aDays} | ${r.bOk}->${r.aOk} | ${r.bRef}->${r.aRef} (max ${r.aMaxRef.n} ${r.aMaxRef.who}) | ${r.bSnap}->${r.aSnap} | ${r.bFresh}->${r.aFresh} | ${r.bStale}->${r.aStale} | ${r.bStarv}->${r.aStarv} | ${r.bDeaths}->${r.aDeaths} | ${r.bWave}->${r.aWave} | ${r.bNat}->${r.aNat} | ${r.aFb} (staffed ${r.aStaffed})`);
if (missing.length) console.log('MISSING pairs for seeds: ' + missing.join(','));
const legs = [];
const g1Fails = rows.filter(r => r.bSnap === 0 && !(r.aSnap >= 5 && r.aOk >= 5));
legs.push({ id: 'G1 RESCUE', pass: g1Fails.length === 0, detail: g1Fails.length ? 'fail seeds: ' + g1Fails.map(r => r.seed).join(',') : 'all baseline-zero-snap seeds rescued (snap>=5, ok>=5)' });
const g2Fails = rows.filter(r => r.aOk === 0 && r.aRef >= 10);
legs.push({ id: 'G2 NO EMPTY BURN', pass: g2Fails.length === 0, detail: g2Fails.length ? 'fail seeds: ' + g2Fails.map(r => r.seed).join(',') : 'no seed burned >=10 refusals with zero staffing' });
const fbTotal = rows.reduce((t, r) => t + r.aFb, 0);
legs.push({ id: 'G3 FALLBACK FIRES', pass: fbTotal >= 1, detail: `armed ctx fishStaffFallback total = ${fbTotal}` });
const g4StarvFails = rows.filter(r => r.aStarv > r.bStarv + 2);
const bMed = med(rows.map(r => r.bDays)), aMed = med(rows.map(r => r.aDays));
legs.push({ id: 'G4 COST BARS', pass: g4StarvFails.length === 0 && aMed >= 0.8 * bMed, detail: `starv fails: ${g4StarvFails.map(r => r.seed).join(',') || 'none'}; median days ${bMed} -> ${aMed} (bar >= ${(0.8 * bMed).toFixed(1)})` });
console.log('\nGO LEGS (pre-registered, evidence/2026-10-26/sim-fishfallback-b.md):');
for (const l of legs) console.log(`${l.pass ? 'PASS' : 'FAIL'} ${l.id}: ${l.detail}`);
const go = legs.every(l => l.pass) && missing.length === 0;
console.log(go ? '\nVERDICT: GO' : '\nVERDICT: NO-GO' + (missing.length ? ' (incomplete pairs)' : ''));
console.log(`heads: baseline ${rows[0] ? rows[0].bHead : '?'} digest ${rows[0] ? rows[0].bDig : '?'} | armed ${rows[0] ? rows[0].aHead : '?'} digest ${rows[0] ? rows[0].aDig : '?'}`);
process.exit(go || reportOnly ? 0 : 1);

#!/usr/bin/env node
// THROTTLE-CONFIRM RE-ADJUDICATION vs VARIANCE-CALIBRATED GUARDRAILS
// (fleshout-b, 2026-10-14).
//
// Re-judges the EXISTING confirm data (evidence/2026-10-14/
// throttleconfirm-before.json, throttleconfirm-armed.json) against the
// variance-calibrated guardrails from the A/A repeat — per the confirm's
// own §14 metric review (points 2, 3, 6), which prescribed this run.
//
// PRE-REGISTERED VERDICT RULE (§14 binding): PROMOTE the lever to confirmed
// iff PRIMARY ≥15% reduction (already measured −41.1%) AND the calibrated
// guardrails G1 (median survival) and G2 (denominator-aware starvation)
// pass — plus the previously-passing guardrails (national, hungryDays,
// combat) as a consistency check. Else the NO-GO verdict stands ("cost
// is real").
//
// The confirm rows lack villager-days, so G2 uses the village-day
// denominator: starve-per-100-village-days = 100*Σstarve/Σdays, identical
// seeds on both sides, bound calibrated from the A/A per-seed rate deltas.
//
// Usage: node scripts/adjudicate-throttleconfirm-calibrated-20261014.js \
//          <before.json> <armed.json> <calibration.json>
'use strict';
const fs = require('fs');
const [bPath, aPath, calPath] = process.argv.slice(2);
const B = JSON.parse(fs.readFileSync(bPath, 'utf8'));
const A = JSON.parse(fs.readFileSync(aPath, 'utf8'));
const CAL = JSON.parse(fs.readFileSync(calPath, 'utf8'));

const sum = (rows, k) => rows.reduce((t, r) => t + (r[k] || 0), 0);
const med = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
const deaths = (rows) => { const o = {}; for (const r of rows) for (const [k, n] of Object.entries(r.deaths || {})) o[k] = (o[k] || 0) + n; return o; };
const starve = (d) => Object.entries(d).filter(([k]) => /starv|hunger|famine/i.test(k)).reduce((t, [, n]) => t + n, 0);
const combat = (d) => Object.entries(d).filter(([k]) => /combat|monster|ambush|fight|kill/i.test(k)).reduce((t, [, n]) => t + n, 0);

const bR = B.rows, aR = A.rows;
const bRot = sum(bR, 'rotFresh'), aRot = sum(aR, 'rotFresh');
const bMed = med(bR.map(r => r.days)), aMed = med(aR.map(r => r.days));
const bNat = sum(bR, 'national'), aNat = sum(aR, 'national');
const bHun = sum(bR, 'hungryDays'), aHun = sum(aR, 'hungryDays');
const bD = deaths(bR), aD = deaths(aR);
const bSt = starve(bD), aSt = starve(aD);
const bCo = combat(bD), aCo = combat(aD);
const bDays = sum(bR, 'days'), aDays = sum(aR, 'days');
const bRate = 100 * bSt / bDays, aRate = 100 * aSt / aDays;

const MB = CAL.guardrails.G1_median_survival_days.MEDIAN_BOUND_DAYS;
const RB = CAL.guardrails.G2_starvation_per100days.STARVE_RATE_BOUND;

const checks = [];
const go = (name, cond, detail) => { checks.push({ name, pass: !!cond, detail }); };

go('PRIMARY: armed rotFresh <= 0.85 * before', aRot <= 0.85 * bRot,
  `armed ${(aRot / 1000).toFixed(1)}k vs before ${(bRot / 1000).toFixed(1)}k = ${((aRot / bRot - 1) * 100).toFixed(1)}%`);
go(`G1 median survival: armed >= before - ${MB}d (variance-calibrated, one-sided)`, aMed >= bMed - MB, `${aMed}d vs ${bMed}d (Δ=${aMed - bMed}d)`);
go(`G2 starvation/100 village-days: armed <= before + ${RB} (variance-calibrated)`, aRate <= bRate + RB,
  `${aRate.toFixed(3)} vs ${bRate.toFixed(3)} (Δ=${(aRate - bRate).toFixed(3)}; counts ${aSt} vs ${bSt} over ${aDays}/${bDays} days)`);
go('GUARD national: armed >= before-2', aNat >= bNat - 2, `${aNat} vs ${bNat}`);
go('GUARD hungryDays: armed <= before + max(5, 10%)', aHun <= bHun + Math.max(5, 0.10 * bHun), `${aHun} vs ${bHun}`);
go('GUARD combat deaths: no 2x explosion', aCo <= 2 * bCo, `${aCo} vs ${bCo}`);

console.log('=== THROTTLE-CONFIRM re-adjudication (variance-calibrated) ===');
console.log(`rotFresh: ${(bRot / 1000).toFixed(1)}k -> ${(aRot / 1000).toFixed(1)}k (${((aRot / bRot - 1) * 100).toFixed(1)}%)`);
console.log(`median survival: ${bMed}d -> ${aMed}d (Δ=${aMed - bMed}d; calibrated bound: -${MB}d)`);
console.log(`starvation/100 village-days: ${bRate.toFixed(3)} -> ${aRate.toFixed(3)} (Δ=${(aRate - bRate).toFixed(3)}; calibrated bound: +${RB})`);
console.log(`  (raw counts: ${bSt} -> ${aSt}; village-days ${bDays} -> ${aDays})`);
console.log(`national: ${bNat} -> ${aNat}; hungryDays: ${bHun} -> ${aHun}; combat: ${bCo} -> ${aCo}`);
console.log('--- verdicts ---');
for (const c of checks) console.log(`  ${c.pass ? 'PASS' : 'FAIL'} ${c.name} — ${c.detail}`);
const allPass = checks.every(c => c.pass);
console.log(allPass ? '\nRE-VERDICT: PROMOTE the lever to confirmed' : '\nRE-VERDICT: NO-GO stands (cost is real)');
process.exit(allPass ? 0 : 1);

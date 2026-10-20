#!/usr/bin/env node
// analyze-retagrot-b.js — pilot verdict for the ROT re-tag.
//
// Reads the 4 per-seed sweep JSONs (control/armed x lead/belong), judges the
// pre-registered PRIMARY (ROT) + GUARDRAILS, and prints the wall numbers.
//
// NOTE (instrument signature): the re-tag redirects the share write through
// Game.stockPantry(give, 'Foraged food'), which the DIAG instruments classify
// as 'away_wild' (name match, no duty flag). So on the armed side the honest
// signature is share_surplus DOWN + away_wild UP — the re-tag made visible.
// PRIMARY is judged on TOTAL pooled fast-rot, not channels.
//
// Usage: node scripts/analyze-retagrot-b.js <dir-with-4-jsons>
'use strict';
const fs = require('fs');
const path = require('path');

const dir = process.argv[2] || 'evidence/2026-10-20/perseed-retagrot-b';
const files = {
  'lead-control': 'control-lead.json', 'lead-armed': 'armed-lead.json',
  'belong-control': 'control-belong.json', 'belong-armed': 'armed-belong.json',
};
const D = {};
for (const [k, f] of Object.entries(files)) {
  D[k] = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')).rows;
}
const sum = (a) => a.reduce((t, x) => t + x, 0);
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length % 2 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };

// per run: totals, fast-rot, inflow
function runStats(row) {
  const e = row.end;
  const fastRot = sum(Object.values(e.rotByChFast || {}));
  const inflowTot = sum(Object.values(e.inflow || {}));
  return {
    seed: row.seed, days: e.days, fastRot, inflowTot,
    laundered: e.laundered || 0,
    starveDeaths: e.starveDeaths || 0, starveDays: e.starveDays || 0,
    won: !!e.won, national: !!e.nationalLive, rank: e.rank,
    arc: e.arc, maxWave: e.maxWave, endReason: e.endReason,
    deaths: e.deaths || [], retag: e.retag || {},
    inflowCh: e.inflow || {},
  };
}

const S = {};
for (const [k, rows] of Object.entries(D)) S[k] = rows.map(runStats);

function pooled(keys) {
  const all = keys.flatMap(k => S[k]);
  return {
    n: all.length,
    days: sum(all.map(r => r.days)),
    fastRot: sum(all.map(r => r.fastRot)),
    inflowTot: sum(all.map(r => r.inflowTot)),
    laundered: sum(all.map(r => r.laundered)),
    starveDeaths: sum(all.map(r => r.starveDeaths)),
    starveDays: sum(all.map(r => r.starveDays)),
    won: sum(all.map(r => r.won ? 1 : 0)),
    national: sum(all.map(r => r.national ? 1 : 0)),
    medSurv: median(all.map(r => r.days)),
    maxSurv: Math.max(...all.map(r => r.days)),
    deaths: all.flatMap(r => r.deaths),
    retagDays: sum(all.map(r => (r.retag.days || 0))),
    retagKcal: sum(all.map(r => (r.retag.movedKcal || 0))),
    retagArms: sum(all.map(r => (r.retag.arms || 0))),
    inflowCh: mergeCh(all.map(r => r.inflowCh)),
  };
}
function mergeCh(list) {
  const o = {};
  for (const m of list) for (const [k, v] of Object.entries(m)) o[k] = (o[k] || 0) + v;
  return o;
}

const C = pooled(['lead-control', 'belong-control']);
const A = pooled(['lead-armed', 'belong-armed']);
const r1 = (x) => Math.round(x * 100) / 100;

console.log('=== SIM-RETAGROT-B PILOT VERDICT ===\n');
const fastRotC = C.fastRot / (C.days / 100), fastRotA = A.fastRot / (A.days / 100);
const rotRatio = fastRotC > 0 ? fastRotA / fastRotC : 0;
console.log(`PRIMARY — pooled fast-rot ratio (armed/control, pooled lead+belong, /100d):`);
console.log(`  control: ${Math.round(C.fastRot).toLocaleString()} kcal over ${C.days} run-days (${Math.round(fastRotC).toLocaleString()}/100d)`);
console.log(`  armed:   ${Math.round(A.fastRot).toLocaleString()} kcal over ${A.days} run-days (${Math.round(fastRotA).toLocaleString()}/100d)`);
console.log(`  RATIO: ${r1(rotRatio)}x  (bar <= 0.8x)  -> ${rotRatio <= 0.8 ? 'GO' : 'NO-GO'}`);

console.log(`\nChannel signature (instrument-classified; re-tag reads as away_wild):`);
for (const ch of Object.keys({ ...C.inflowCh, ...A.inflowCh }).sort()) {
  const c = Math.round(C.inflowCh[ch] || 0), a = Math.round(A.inflowCh[ch] || 0);
  console.log(`  ${ch}: control ${c.toLocaleString()} -> armed ${a.toLocaleString()} (${c ? r1(a / c) + 'x' : 'n/a'})`);
}
console.log(`\nRetag telemetry (armed side): ${A.retagArms} armed daily-evals, ${A.retagDays} re-tag days, ${Math.round(A.retagKcal).toLocaleString()} kcal re-tagged into the PANTRY funnel`);

const inflowRatio = C.inflowTot > 0 ? A.inflowTot / C.inflowTot : 0;
console.log(`\nGUARDRAILS (hard):`);
console.log(`  total inflow: control ${Math.round(C.inflowTot).toLocaleString()} vs armed ${Math.round(A.inflowTot).toLocaleString()} = ${r1(inflowRatio)}x (bar >= 0.9x) -> ${inflowRatio >= 0.9 ? 'PASS' : 'FAIL'}`);
console.log(`  starvation deaths: control ${C.starveDeaths} vs armed ${A.starveDeaths} (bar <= control) -> ${A.starveDeaths <= C.starveDeaths ? 'PASS' : 'FAIL'}`);
console.log(`  median survival: control ${C.medSurv}d vs armed ${A.medSurv}d (bar >= control-10d) -> ${A.medSurv >= C.medSurv - 10 ? 'PASS' : 'FAIL'}`);
console.log(`  national: control ${C.national} vs armed ${A.national} (bar >= control-2) -> ${A.national >= C.national - 2 ? 'PASS' : 'FAIL'}`);
console.log(`  laundering: control ${C.laundered} vs armed ${A.laundered} (bar 0) -> ${A.laundered === 0 ? 'PASS' : 'FAIL'}`);
const causeSet = (P) => [...new Set(P.deaths.map(d => d.cause))].sort();
const newModes = causeSet(A).filter(c => !causeSet(C).includes(c));
console.log(`  new death modes (name-level; mechanism-triaged in the evidence): ${newModes.length ? newModes.join(', ') : 'none'}`);

console.log(`\nWALL NUMBERS:`);
for (const [nm, P] of [['control', C], ['armed', A]]) {
  const causes = {};
  for (const d of P.deaths) causes[d.cause] = (causes[d.cause] || 0) + 1;
  console.log(`  ${nm}: won ${P.won}/${P.n} national ${P.national}/${P.n} med ${P.medSurv}d max ${P.maxSurv}d starveD ${P.starveDays}`);
  console.log(`    death causes: ${Object.entries(causes).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ')}`);
}
const out = {
  primary: { ratio: r1(rotRatio), bar: 0.8, go: rotRatio <= 0.8 },
  guardrails: {
    inflowRatio: r1(inflowRatio), starveDeaths: [C.starveDeaths, A.starveDeaths],
    medSurv: [C.medSurv, A.medSurv], national: [C.national, A.national],
    laundered: [C.laundered, A.laundered], newModes,
  },
  control: { fastRot: Math.round(C.fastRot), days: C.days, inflow: Math.round(C.inflowTot) },
  armed: { fastRot: Math.round(A.fastRot), days: A.days, inflow: Math.round(A.inflowTot), retagDays: A.retagDays, retagKcal: Math.round(A.retagKcal) },
};
fs.writeFileSync(path.join(dir, 'retagrot-b-analysis.json'), JSON.stringify(out, null, 1));
console.log('\nwrote ' + path.join(dir, 'retagrot-b-analysis.json'));

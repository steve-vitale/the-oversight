#!/usr/bin/env node
// analyze-sharelean-b.js — pilot verdict for the share_surplus lean valve.
//
// Reads the 4 per-seed sweep JSONs (control/armed x lead/belong), judges the
// pre-registered PRIMARY + GUARDRAILS, and prints the wall numbers.
//
// NOTE (instrument signature): the valve re-tags share_surplus writes through
// Game.stockPantry(give, 'Foraged food'), which the DIAG instruments classify
// as 'away_wild' (name match, no duty flag). So on the armed side the honest
// signature is share_surplus DOWN + away_wild UP on lean days — the re-tag
// made visible. PRIMARY is judged on TOTAL lean-day inflow, not channels.
//
// Usage: node scripts/analyze-sharelean-b.js <dir-with-4-jsons>
'use strict';
const fs = require('fs');
const path = require('path');

const dir = process.argv[2] || 'evidence/2026-10-20/perseed-sharelean-b';
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

// per run: lean-day inflow (dawn freshDays <= 4), total inflow, channels, fast-rot
function runStats(row) {
  const e = row.end;
  const dawnByDay = {};
  for (const d of (e.dawn || [])) dawnByDay[d.day] = d.freshDays;
  let leanInflow = 0, fatInflow = 0, leanDays = 0, fatDays = 0;
  const leanCh = {}, fatCh = {};
  for (const [dayS, chs] of Object.entries(e.dayInflow || {})) {
    const day = parseInt(dayS, 10);
    const fd = dawnByDay[day];
    const tot = sum(Object.values(chs));
    if (fd !== undefined && fd <= 4) {
      leanDays++; leanInflow += tot;
      for (const [c, v] of Object.entries(chs)) leanCh[c] = (leanCh[c] || 0) + v;
    } else {
      fatDays++; fatInflow += tot;
      for (const [c, v] of Object.entries(chs)) fatCh[c] = (fatCh[c] || 0) + v;
    }
  }
  const fastRot = sum(Object.values(e.rotByChFast || {}));
  return {
    seed: row.seed, days: e.days, leanDays, fatDays, leanInflow, fatInflow,
    leanCh, fatCh, fastRot, laundered: e.laundered || 0,
    starveDeaths: e.starveDeaths || 0, starveDays: e.starveDays || 0,
    won: !!e.won, national: !!e.nationalLive, rank: e.rank,
    arc: e.arc, maxWave: e.maxWave, endReason: e.endReason,
    deaths: e.deaths || [], valve: e.valve || {},
  };
}

const S = {};
for (const [k, rows] of Object.entries(D)) S[k] = rows.map(runStats);

function pooled(keys) {
  const all = keys.flatMap(k => S[k]);
  return {
    n: all.length,
    leanInflow: sum(all.map(r => r.leanInflow)),
    fatInflow: sum(all.map(r => r.fatInflow)),
    leanDays: sum(all.map(r => r.leanDays)),
    days: sum(all.map(r => r.days)),
    fastRot: sum(all.map(r => r.fastRot)),
    laundered: sum(all.map(r => r.laundered)),
    starveDeaths: sum(all.map(r => r.starveDeaths)),
    starveDays: sum(all.map(r => r.starveDays)),
    won: sum(all.map(r => r.won ? 1 : 0)),
    national: sum(all.map(r => r.national ? 1 : 0)),
    medSurv: median(all.map(r => r.days)),
    maxSurv: Math.max(...all.map(r => r.days)),
    leanCh: mergeCh(all.map(r => r.leanCh)),
    deaths: all.flatMap(r => r.deaths),
    valveDays: sum(all.map(r => (r.valve.valveDays || 0))),
    valveKcal: sum(all.map(r => (r.valve.movedKcal || 0))),
    valveArms: sum(all.map(r => (r.valve.arms || 0))),
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

console.log('=== SIM-SHARELEAN-B PILOT VERDICT ===\n');
console.log(`PRIMARY — lean-day inflow ratio (armed/control, pooled lead+belong):`);
console.log(`  control: ${Math.round(C.leanInflow).toLocaleString()} kcal over ${C.leanDays} lean-days`);
console.log(`  armed:   ${Math.round(A.leanInflow).toLocaleString()} kcal over ${A.leanDays} lean-days`);
console.log(`  RATIO: ${r1(A.leanInflow / C.leanInflow)}x  (bar >= 1.3x)  -> ${A.leanInflow / C.leanInflow >= 1.3 ? 'GO' : 'NO-GO'}`);
console.log(`  (fat-day inflow: control ${Math.round(C.fatInflow).toLocaleString()} vs armed ${Math.round(A.fatInflow).toLocaleString()} = ${r1(A.fatInflow / C.fatInflow)}x — the fat-side culture check)`);
console.log(`\nLean-day channel signature (instrument-classified; valve re-tag reads as away_wild):`);
for (const ch of Object.keys({ ...C.leanCh, ...A.leanCh }).sort()) {
  const c = Math.round(C.leanCh[ch] || 0), a = Math.round(A.leanCh[ch] || 0);
  console.log(`  ${ch}: control ${c.toLocaleString()} -> armed ${a.toLocaleString()} (${c ? r1(a / c) + 'x' : 'n/a'})`);
}
console.log(`\nValve telemetry (armed side): ${A.valveArms} armed daily-evals, ${A.valveDays} voiced valve-days, ${Math.round(A.valveKcal).toLocaleString()} kcal re-tagged`);

console.log(`\nGUARDRAILS (hard):`);
const fastRotC = C.fastRot / (C.days / 100), fastRotA = A.fastRot / (A.days / 100);
console.log(`  fast-rot/100d: control ${Math.round(fastRotC).toLocaleString()} vs armed ${Math.round(fastRotA).toLocaleString()} = ${r1(fastRotA / fastRotC)}x (bar <= 1.15x) -> ${fastRotA / fastRotC <= 1.15 ? 'PASS' : 'FAIL'}`);
console.log(`  starvation deaths: control ${C.starveDeaths} vs armed ${A.starveDeaths} (bar <= control) -> ${A.starveDeaths <= C.starveDeaths ? 'PASS' : 'FAIL'}`);
console.log(`  median survival: control ${C.medSurv}d vs armed ${A.medSurv}d (bar >= control-10d) -> ${A.medSurv >= C.medSurv - 10 ? 'PASS' : 'FAIL'}`);
console.log(`  national: control ${C.national} vs armed ${A.national} (bar >= control-2) -> ${A.national >= C.national - 2 ? 'PASS' : 'FAIL'}`);
console.log(`  laundering: control ${C.laundered} vs armed ${A.laundered} (bar 0) -> ${A.laundered === 0 ? 'PASS' : 'FAIL'}`);
const causeSet = (P) => [...new Set(P.deaths.map(d => d.cause))].sort();
const newModes = causeSet(A).filter(c => !causeSet(C).includes(c));
console.log(`  new death modes: ${newModes.length ? newModes.join(', ') + ' -> FAIL' : 'none -> PASS'}`);

console.log(`\nWALL NUMBERS:`);
for (const [nm, P] of [['control', C], ['armed', A]]) {
  const causes = {};
  for (const d of P.deaths) causes[d.cause] = (causes[d.cause] || 0) + 1;
  console.log(`  ${nm}: won ${P.won}/${P.n} national ${P.national}/${P.n} med ${P.medSurv}d max ${P.maxSurv}d starveD ${P.starveDays}`);
  console.log(`    death causes: ${Object.entries(causes).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ')}`);
}
const out = { primary: { ratio: r1(A.leanInflow / C.leanInflow), bar: 1.3, go: A.leanInflow / C.leanInflow >= 1.3 }, guardrails: { fastRotRatio: r1(fastRotA / fastRotC), starveDeaths: [C.starveDeaths, A.starveDeaths], medSurv: [C.medSurv, A.medSurv], national: [C.national, A.national], laundered: [C.laundered, A.laundered], newModes }, control: { leanInflow: Math.round(C.leanInflow), leanDays: C.leanDays }, armed: { leanInflow: Math.round(A.leanInflow), leanDays: A.leanDays, valveDays: A.valveDays, valveKcal: Math.round(A.valveKcal) } };
fs.writeFileSync(path.join(dir, 'sharelean-b-analysis.json'), JSON.stringify(out, null, 1));
console.log('\nwrote ' + path.join(dir, 'sharelean-b-analysis.json'));

#!/usr/bin/env node
// analyze-dutyfish-b.js — pilot verdict for the duty_fish scale-up arm.
//
// Reads the 4 per-seed sweep JSONs (control/armed x lead/belong), judges the
// pre-registered PRIMARY + GUARDRAILS, and prints the wall numbers.
//
// PRIMARY (binding): armed/control lean-day FISH-channel inflow ratio >= 1.3x
//   (pooled lead+belong, identical seeds). The lever's own channel should
//   scale with more fishers — sharelean missed at 1.05x on a 1.3x bar.
// CO-PRIMARY (compositional): per-villager capture = lean-day total inflow /
//   sum(lean-day roster); armed/control must be >= 1.0x — the widening must
//   ADD production, not dilute it across a collapsing roster.
//
// GUARDRAILS (hard): starvation deaths <= control; median survival >=
//   control-10d; national >= control-2; fast-rot pooled/100d <= 1.15x
//   control; laundering 0; no new death MECHANISM.
//
// Usage: node scripts/analyze-dutyfish-b.js <dir-with-4-jsons>
'use strict';
const fs = require('fs');
const path = require('path');

const dir = process.argv[2] || 'evidence/2026-10-20/perseed-dutyfish-b';
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
const mergeCh = (maps) => { const o = {}; for (const m of maps) for (const [c, v] of Object.entries(m)) o[c] = (o[c] || 0) + v; return o; };

// per run: lean-day inflow (dawn freshDays <= 4), channels, roster-days on lean days
function runStats(row) {
  const e = row.end;
  const dawnByDay = {};
  for (const d of (e.dawn || [])) dawnByDay[d.day] = d.freshDays;
  const rosterByDay = {};
  for (const d of (e.dawn || [])) rosterByDay[d.day] = d.roster;
  let leanInflow = 0, fatInflow = 0, leanDays = 0, fatDays = 0, leanRosterDays = 0;
  const leanCh = {}, fatCh = {};
  for (const [dayS, chs] of Object.entries(e.dayInflow || {})) {
    const day = parseInt(dayS, 10);
    const fd = dawnByDay[day];
    const tot = sum(Object.values(chs));
    const ros = rosterByDay[day] || 0;
    if (fd !== undefined && fd <= 4) {
      leanDays++; leanInflow += tot; leanRosterDays += ros;
      for (const [c, v] of Object.entries(chs)) leanCh[c] = (leanCh[c] || 0) + v;
    } else {
      fatDays++; fatInflow += tot;
      for (const [c, v] of Object.entries(chs)) fatCh[c] = (fatCh[c] || 0) + v;
    }
  }
  const fastRot = sum(Object.values(e.rotByChFast || {}));
  return {
    seed: row.seed, days: e.days, leanDays, fatDays, leanInflow, fatInflow,
    leanRosterDays, leanCh, fatCh, fastRot, laundered: e.laundered || 0,
    starveDeaths: e.starveDeaths || 0, starveDays: e.starveDays || 0,
    won: !!e.won, national: !!e.nationalLive, rank: e.rank, table: !!e.table,
    arc: e.arc, maxWave: e.maxWave, endReason: e.endReason,
    deaths: e.deaths || [], df: e.dutyfish || {},
    assignCounts: e.assignCounts || {},
  };
}

const S = {};
for (const [k, rows] of Object.entries(D)) S[k] = rows.map(runStats);

function pooled(keys) {
  const all = keys.flatMap(k => S[k]);
  const leanFish = sum(all.map(r => (r.leanCh.duty_fish || 0)));
  const waveDist = {};
  for (const r of all) { const w = r.maxWave || 1; waveDist[w] = (waveDist[w] || 0) + 1; }
  return {
    n: all.length,
    leanInflow: sum(all.map(r => r.leanInflow)),
    fatInflow: sum(all.map(r => r.fatInflow)),
    leanDays: sum(all.map(r => r.leanDays)),
    leanRosterDays: sum(all.map(r => r.leanRosterDays)),
    leanFish,
    days: sum(all.map(r => r.days)),
    fastRot: sum(all.map(r => r.fastRot)),
    laundered: sum(all.map(r => r.laundered)),
    starveDeaths: sum(all.map(r => r.starveDeaths)),
    starveDays: sum(all.map(r => r.starveDays)),
    won: sum(all.map(r => r.won ? 1 : 0)),
    national: sum(all.map(r => r.national ? 1 : 0)),
    table: sum(all.map(r => r.table ? 1 : 0)),
    medSurv: median(all.map(r => r.days)),
    maxSurv: Math.max(...all.map(r => r.days)),
    waveDist,
    leanCh: mergeCh(all.map(r => r.leanCh)),
    staffed: sum(all.map(r => r.df.staffed || 0)),
    staffDays: sum(all.map(r => r.df.staffDays || 0)),
    throttleHits: sum(all.map(r => r.df.throttleHits || 0)),
    fishAssigns: sum(all.map(r => (r.assignCounts.fish || 0))),
    deaths: all.flatMap(r => r.deaths),
    ends: all.map(r => r.endReason),
  };
}

const ctrl = pooled(['lead-control', 'belong-control']);
const armed = pooled(['lead-armed', 'belong-armed']);

const fmt = (n) => (typeof n === 'number' && isFinite(n)) ? (Math.abs(n) >= 10000 ? Math.round(n).toLocaleString() : (Math.round(n * 100) / 100)) : String(n);
const r2 = (a, b) => b ? fmt(a / b) + 'x' : (a ? 'inf' : '0');

console.log('=== sim-dutyfish-b pilot analysis ===');
console.log(`control: n=${ctrl.n} armed: n=${armed.n} (8 seeds x lead+belong, paired)`);

console.log('\n--- PRIMARY: lean-day duty_fish inflow (armed/control >= 1.3x) ---');
console.log(`  lean-day duty_fish: control ${fmt(ctrl.leanFish)} vs armed ${fmt(armed.leanFish)} = ${r2(armed.leanFish, ctrl.leanFish)}`);
console.log(`  lean days: control ${ctrl.leanDays} vs armed ${armed.leanDays} (endogenous classification — see metric review)`);

console.log('\n--- CO-PRIMARY: per-villager capture on lean days (armed/control >= 1.0x) ---');
const capC = ctrl.leanRosterDays ? ctrl.leanInflow / ctrl.leanRosterDays : 0;
const capA = armed.leanRosterDays ? armed.leanInflow / armed.leanRosterDays : 0;
console.log(`  per-villager lean capture: control ${fmt(capC)} vs armed ${fmt(capA)} kcal/person/lean-day = ${r2(capA, capC)}`);
console.log(`  lean-day roster-days: control ${fmt(ctrl.leanRosterDays)} vs armed ${fmt(armed.leanRosterDays)}`);

console.log('\n--- mechanism ---');
console.log(`  dutyfish staffed (armed): ${armed.staffed} over ${armed.staffDays} staff-days; throttle hits on staffed days: ${armed.throttleHits}`);
console.log(`  fish duty assignments: control ${ctrl.fishAssigns} vs armed ${armed.fishAssigns} = ${r2(armed.fishAssigns, ctrl.fishAssigns)}`);
console.log(`  lean-channel mix control: ${JSON.stringify(Object.fromEntries(Object.entries(ctrl.leanCh).sort((a, b) => b[1] - a[1]).slice(0, 6)), (k, v) => typeof v === 'number' ? Math.round(v) : v)}`);
console.log(`  lean-channel mix armed:   ${JSON.stringify(Object.fromEntries(Object.entries(armed.leanCh).sort((a, b) => b[1] - a[1]).slice(0, 6)), (k, v) => typeof v === 'number' ? Math.round(v) : v)}`);
console.log(`  total lean inflow: control ${fmt(ctrl.leanInflow)} vs armed ${fmt(armed.leanInflow)} = ${r2(armed.leanInflow, ctrl.leanInflow)}`);
console.log(`  total fat inflow:  control ${fmt(ctrl.fatInflow)} vs armed ${fmt(armed.fatInflow)} = ${r2(armed.fatInflow, ctrl.fatInflow)}`);

console.log('\n--- GUARDRAILS ---');
const fastPer100 = (p) => p.days ? p.fastRot / p.days * 100 : 0;
console.log(`  fast-rot/100d: control ${fmt(fastPer100(ctrl))} vs armed ${fmt(fastPer100(armed))} = ${r2(fastPer100(armed), fastPer100(ctrl))} (bar <= 1.15x)`);
console.log(`  starvation deaths: control ${ctrl.starveDeaths} vs armed ${armed.starveDeaths} (bar <= control)`);
console.log(`  median survival: control ${ctrl.medSurv}d vs armed ${armed.medSurv}d (bar >= control-10d)`);
console.log(`  max survival: control ${ctrl.maxSurv}d vs armed ${armed.maxSurv}d`);
console.log(`  national: control ${ctrl.national} vs armed ${armed.national} (bar >= control-2)`);
console.log(`  laundered: control ${ctrl.laundered} vs armed ${armed.laundered} (bar 0)`);
console.log(`  wins: control ${ctrl.won} vs armed ${armed.won}`);

console.log('\n--- per-seed lean-fish ratios (paired, pooled-channel basis) ---');
for (const pid of ['lead', 'belong']) {
  for (const rc of S[pid + '-control']) {
    const ra = S[pid + '-armed'].find(x => x.seed === rc.seed);
    const fC = rc.leanCh.duty_fish || 0, fA = ra ? (ra.leanCh.duty_fish || 0) : 0;
    console.log(`  ${pid} s${rc.seed}: control ${Math.round(fC)} vs armed ${Math.round(fA)} = ${r2(fA, fC)} (lean days ${rc.leanDays}/${ra ? ra.leanDays : '?'})`);
  }
}

console.log('\n--- death causes (armed vs control) ---');
const causes = {};
for (const d of ctrl.deaths) { const k = 'c:' + (d.cause || '?').slice(0, 28); causes[k] = (causes[k] || 0) + 1; }
for (const d of armed.deaths) { const k = 'a:' + (d.cause || '?').slice(0, 28); causes[k] = (causes[k] || 0) + 1; }
const causeCounts = Object.entries(causes).sort((a, b) => b[1] - a[1]).slice(0, 14);
for (const [k, v] of causeCounts) console.log(`  ${k}: ${v}`);

console.log('\n--- wall numbers ---');
console.log(`  control: won ${ctrl.won}/${ctrl.n} national ${ctrl.national}/${ctrl.n} table ${ctrl.table}/${ctrl.n} med ${ctrl.medSurv}d max ${ctrl.maxSurv}d`);
console.log(`  armed:   won ${armed.won}/${armed.n} national ${armed.national}/${armed.n} table ${armed.table}/${armed.n} med ${armed.medSurv}d max ${armed.maxSurv}d`);
console.log(`  wave reach control: ${JSON.stringify(ctrl.waveDist)} | armed: ${JSON.stringify(armed.waveDist)}`);

const verdict = {
  primaryFishRatio: ctrl.leanFish ? armed.leanFish / ctrl.leanFish : null,
  captureRatio: capC ? capA / capC : null,
  primaryBar: 1.3, captureBar: 1.0,
  primaryGo: (ctrl.leanFish ? armed.leanFish / ctrl.leanFish : 0) >= 1.3,
  captureGo: (capC ? capA / capC : 0) >= 1.0,
  fastRotRatio: fastPer100(ctrl) ? fastPer100(armed) / fastPer100(ctrl) : null,
  starveDeaths: { control: ctrl.starveDeaths, armed: armed.starveDeaths },
  medSurv: { control: ctrl.medSurv, armed: armed.medSurv },
  national: { control: ctrl.national, armed: armed.national },
  laundered: { control: ctrl.laundered, armed: armed.laundered },
  wins: { control: ctrl.won, armed: armed.won },
};
fs.writeFileSync(path.join(dir, 'dutyfish-b-analysis.json'), JSON.stringify({ verdict, control: summary(ctrl), armed: summary(armed) }, null, 1));
function summary(p) {
  return { n: p.n, leanInflow: p.leanInflow, fatInflow: p.fatInflow, leanDays: p.leanDays, leanRosterDays: p.leanRosterDays, leanFish: p.leanFish, leanCh: p.leanCh, fastRot: p.fastRot, staffed: p.staffed, staffDays: p.staffDays, throttleHits: p.throttleHits, fishAssigns: p.fishAssigns, medSurv: p.medSurv, maxSurv: p.maxSurv, national: p.national, won: p.won, ends: p.ends };
}
console.log('\nverdict:', JSON.stringify(verdict, null, 1));

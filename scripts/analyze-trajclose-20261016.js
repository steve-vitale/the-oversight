#!/usr/bin/env node
// scripts/analyze-trajclose-20261016.js — SIM-TRAJCLOSE-B analysis.
// Reads evidence/2026-10-16/perseed-trajclose/*.json, checks the per-seed
// schema (exact numeric national/table/wins/exiled), computes the
// pre-registered PRIMARY (driver-vs-pristine aggregate absolute fresh-rot
// kcal ratio), the GUARDRAILS, and the TRAJECTORY METRICS. Prints the
// GO/KILL verdict per §14 (no re-scoring).
//
// Usage: node scripts/analyze-trajclose-20261016.js [PERSEED_DIR]
'use strict';
const fs = require('fs');
const path = require('path');

const dir = process.argv[2] || 'evidence/2026-10-16/perseed-trajclose';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
if (!files.length) { console.log('no per-seed files in ' + dir); process.exit(1); }

const rows = files.map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
const fails = [];
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) fails.push(name);
}

console.log(`== trajclose analysis — n=${rows.length} ==`);

// ---- schema check: exact numeric national/table/wins/exiled ----
let drift = 0;
for (const r of rows) {
  for (const k of ['national', 'table', 'wins', 'exiled']) {
    if (typeof r[k] !== 'number') { drift++; console.log(`  DRIFT ${r.key}-s${r.seed}: ${k}=${JSON.stringify(r[k])}`); }
  }
}
console.log(`schema-drift check: ${drift} drifts over ${rows.length} files`);

const cells = ['pristine', 'driver'];
const byCell = {};
for (const c of cells) {
  const rs = rows.filter(r => r.cell === c);
  const rot = rs.reduce((t, r) => t + r.rotFresh, 0);
  const vdays = rs.reduce((t, r) => t + r.villagerDays, 0);
  const da = rs.map(r => r.days).sort((a, b) => a - b);
  byCell[c] = {
    n: rs.length, rotFresh: rot,
    rotPerVd: rot / Math.max(1, vdays),
    national: rs.reduce((t, r) => t + r.national, 0),
    table: rs.reduce((t, r) => t + r.table, 0),
    wins: rs.reduce((t, r) => t + r.wins, 0),
    exiled: rs.reduce((t, r) => t + r.exiled, 0),
    wave4: rs.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rs.filter(r => (r.waveReach || 1) >= 5).length,
    medianDays: da[Math.floor(da.length / 2)],
    maxDays: da[da.length - 1],
    hungryDays: rs.reduce((t, r) => t + r.hungryDays, 0),
    starveDeaths: rs.reduce((t, r) => t + r.starveDeaths, 0),
    triggerDays: rs.reduce((t, r) => t + r.triggerDays, 0),
    feastDays: rs.reduce((t, r) => t + r.feastDays, 0),
    tcAid: rs.reduce((t, r) => t + r.tcAid, 0),
    tcAidKcal: rs.reduce((t, r) => t + r.tcAidKcal, 0),
    tcFeasts: rs.reduce((t, r) => t + r.tcFeasts, 0),
    tcFeastKcal: rs.reduce((t, r) => t + r.tcFeastKcal, 0),
    tcGateHeld: rs.reduce((t, r) => t + r.tcGateHeld, 0),
    tcHoldDays: rs.reduce((t, r) => t + r.tcHoldDays, 0),
    firstAidDays: rs.map(r => r.tcFirstAidDay).filter(d => d >= 0),
    firstFeastDays: rs.map(r => r.tcFirstFeastDay).filter(d => d >= 0),
    deaths: rs.reduce((m, r) => { for (const k of Object.keys(r.deaths || {})) m[k] = (m[k] || 0) + r.deaths[k]; return m; }, {}),
  };
}
for (const c of cells) {
  const b = byCell[c];
  console.log(`  ${c}: rot=${(b.rotFresh / 1000).toFixed(1)}k r/vd=${b.rotPerVd.toFixed(0)} nat=${b.national}/8 tab=${b.table}/8 win=${b.wins} ex=${b.exiled} w4=${b.wave4} w5=${b.wave5} medD=${b.medianDays} maxD=${b.maxDays} hungry=${b.hungryDays} starv=${b.starveDeaths}`);
}

// ---- per-seed ratios ----
console.log('\nper-seed driver/pristine fresh-rot:');
const seedRows = {};
for (const r of rows) { (seedRows[r.seed] = seedRows[r.seed] || {})[r.cell] = r; }
for (const s of Object.keys(seedRows).map(Number).sort((a, b) => a - b)) {
  const p = seedRows[s].pristine, d = seedRows[s].driver;
  const ratio = p.rotFresh < 5000 ? 'nz' : (d.rotFresh / Math.max(1, p.rotFresh)).toFixed(2);
  console.log(`  s${s}: pristine=${(p.rotFresh / 1000).toFixed(0)}k driver=${(d.rotFresh / 1000).toFixed(0)}k ratio=${ratio} trigP=${p.triggerDays}/trigD=${d.triggerDays} aid=${d.tcAid} feast=${d.tcFeasts}`);
}

// ---- PRIMARY ----
const ratio = byCell.driver.rotFresh / Math.max(1, byCell.pristine.rotFresh);
console.log(`\nPRIMARY driver/pristine fresh-rot ratio: ${ratio.toFixed(3)}`);
const primaryGo = ratio <= 0.7;
check('PRIMARY GO (<= 0.7x — the 4x reproduces same-sweep)', primaryGo, `ratio=${ratio.toFixed(3)}`);
const guardFails = [];

// ---- GUARDRAILS (per road vs own neither → here vs own pristine) ----
console.log('\nGUARDRAILS (driver vs pristine):');
const gBefore = fails.length;
check('national >= pristine-2', byCell.driver.national >= byCell.pristine.national - 2,
  `${byCell.driver.national} vs ${byCell.pristine.national}`);
check('starvation deaths <= pristine+2', byCell.driver.starveDeaths <= byCell.pristine.starveDeaths + 2,
  `${byCell.driver.starveDeaths} vs ${byCell.pristine.starveDeaths}`);
// no new death mode (n>=3): every n>=3 category on driver must exist on pristine
{
  const newModes = [];
  for (const k of Object.keys(byCell.driver.deaths)) {
    if ((byCell.driver.deaths[k] || 0) >= 3 && !(byCell.pristine.deaths[k] || 0)) newModes.push(k);
  }
  check('no new death mode (n>=3)', newModes.length === 0, newModes.length ? newModes.join(',') : 'none');
}
guardFails.push(...fails.slice(gBefore));
console.log(`  median survival (report-only): pristine=${byCell.pristine.medianDays}d driver=${byCell.driver.medianDays}d`);

// ---- TRAJECTORY METRICS (mechanism lens only if PRIMARY goes) ----
console.log('\nTRAJECTORY METRICS:');
console.log('  day-type composition:');
console.log(`    overstock-trigger days (fd>4): pristine=${byCell.pristine.triggerDays} driver=${byCell.driver.triggerDays}`);
console.log(`    aid days (= aid verbs): driver=${byCell.driver.tcAid} (${(byCell.driver.tcAidKcal / 1000).toFixed(0)}k kcal)`);
console.log(`    feast days (ALL engine feasts): pristine=${byCell.pristine.feastDays} driver=${byCell.driver.feastDays}`);
console.log(`    driver feast verbs: ${byCell.driver.tcFeasts} (${(byCell.driver.tcFeastKcal / 1000).toFixed(0)}k kcal)`);
console.log(`    siege-hold counts: ${byCell.driver.tcGateHeld} on ${byCell.driver.tcHoldDays} distinct days`);
const aidD = byCell.driver.firstAidDays, feastD = byCell.driver.firstFeastDays;
console.log(`  event timing: first aid day: ${aidD.length ? aidD.join(',') : 'none'}; first driver-feast day: ${feastD.length ? feastD.join(',') : 'none'}`);
console.log('  pantry-kcal histogram (daily samples, bins 0-25k … 175-200k, 200k+):');
const labels = ['0-25k', '25-50k', '50-75k', '75-100k', '100-125k', '125-150k', '150-175k', '175-200k', '200k+'];
for (const c of cells) {
  const rs = rows.filter(r => r.cell === c);
  const ph = new Array(9).fill(0);
  for (const r of rs) (r.pantryHist || []).forEach((n, i) => { ph[i] += n; });
  const tot = ph.reduce((a, b) => a + b, 0) || 1;
  console.log(`    ${c}: ` + ph.map((n, i) => `${labels[i]}=${(100 * n / tot).toFixed(1)}%`).join(' '));
}
console.log('  rot accumulation (top rotByDay days per cell):');
for (const c of cells) {
  const rs = rows.filter(r => r.cell === c);
  const curve = {};
  for (const r of rs) for (const d of Object.keys(r.rotByDay || {})) curve[d] = (curve[d] || 0) + r.rotByDay[d];
  const top = Object.keys(curve).map(Number).sort((a, b) => curve[b] - curve[a]).slice(0, 8);
  console.log(`    ${c}: ` + top.map(d => `d${d}=${(curve[d] / 1000).toFixed(0)}k`).join(' '));
}

if (!primaryGo) {
  console.log(`\nVERDICT: KILL — PRIMARY missed (ratio=${ratio.toFixed(3)} vs <= 0.7). Lineage CLOSED: the 4x was cross-sweep drift; the "trajectory effect" residual is retired.`);
  process.exit(1);
}
if (guardFails.length) {
  console.log(`\nVERDICT: KILL — PRIMARY went (ratio=${ratio.toFixed(3)}) but guardrail(s) failed: ${guardFails.join('; ')}.`);
  process.exit(1);
}
console.log(`\nVERDICT: GO — the 4x reproduces same-sweep (ratio=${ratio.toFixed(3)}). Proceed to the second measurement round characterizing WHERE the trajectory diverges.`);
process.exit(0);

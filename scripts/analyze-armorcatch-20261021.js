#!/usr/bin/env node
// analyze-armorcatch-20261021.js — analyzer for the sim-armorcatch pilot.
//
// PRIMARY (binding, brief): armed runs reaching (max-daily armored@P15 >= 4
// AND >=1 villager-attributed wave-4 kill, kill-time, same run) >= 2/16 AND
// >= control+1. GO = PRIMARY met. Miss = NO-GO.
// GUARDRAILS: median survival >= control-10d; villager combat deaths <=
// control x1.2; no new death mode (>=2-event rule); starvation deaths <=
// control+2.
// SECONDARY (report): armor trajectories of staged fighters (does the
// preservation hold?); w5vetsMax; wave-5 unlocks; wall numbers
// (national/table/wins, wave-4/5, median/max survival, exiled); ac counter
// totals; death-cause shares.
//
// Usage: node scripts/analyze-armorcatch-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-21', 'perseed-armorcatch');
const SEEDS = [65421, 65422, 65423, 65424, 65425, 65426, 65427, 65428];
const POLICIES = ['leadfeast', 'belongfeast'];

function load(arm) {
  const rows = [];
  for (const p of POLICIES) {
    const tag = arm === 'control' ? p : p + '-armorcatch';
    for (const seed of SEEDS) {
      const fp = path.join(DIR, `${arm}-${tag}-s${seed}.json`);
      if (!fs.existsSync(fp)) { console.error('MISSING ' + fp); process.exit(2); }
      rows.push(JSON.parse(fs.readFileSync(fp, 'utf8')));
    }
  }
  return rows;
}
const median = (a) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const sum = (a) => a.reduce((t, x) => t + x, 0);

// PRIMARY judge line per run: max-daily armored@P15 >= 4 AND >=1
// kill-time-attributed villager wave-4 kill.
const primaryMet = (r) => (r.armoredMax | 0) >= 4 && (r.nW4Villagers | 0) >= 1;

function wall(rows) {
  return {
    n: rows.length,
    national: sum(rows.map(r => r.national | 0)),
    table: sum(rows.map(r => r.table | 0)),
    won: sum(rows.map(r => r.won | 0)),
    wave4: sum(rows.map(r => r.wave4 | 0)),
    wave5: sum(rows.map(r => r.wave5 | 0)),
    exiled: sum(rows.map(r => r.exiled | 0)),
    medSurv: median(rows.map(r => r.gameDays | 0)),
    maxSurv: Math.max(...rows.map(r => r.gameDays | 0)),
    w5vetsMax2: sum(rows.map(r => ((r.w5vetsMax | 0) >= 2 ? 1 : 0))),
  };
}

function report(arm, rows) {
  const prim = rows.filter(primaryMet);
  const w = wall(rows);
  const acT = sum(rows.map(r => ((r.ac || {}).acChaffVetos | 0) + ((r.ac || {}).acTriageVetos | 0)));
  const dc = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deathCauses || {})) dc[k] = (dc[k] || 0) + v;
  return {
    arm, primary: prim.length,
    primarySeeds: prim.map(r => `${r.policy}-s${r.seed}`),
    wall: w,
    acCounters: acT,
    villagerCombatDeaths: sum(rows.map(r => r.villagerCombatDeaths | 0)),
    starvationDeaths: sum(rows.map(r => r.starvationDeaths | 0)),
    deathCauses: dc,
    villW4Kills: rows.map(r => ({ s: r.seed, p: r.policy, n: r.nW4Villagers, sch: r.w4scholarKills, armMax: r.armoredMax, kills: r.w4villagerKills })),
  };
}

const control = report('control', load('control'));
const armed = report('armorcatch', load('armorcatch'));

console.log('=== sim-armorcatch pilot — PRIMARY (binding) ===');
console.log(`control primary (armoredMax>=4 AND villW4>=1): ${control.primary}/16 [${control.primarySeeds.join(', ')}]`);
console.log(`armed   primary (armoredMax>=4 AND villW4>=1): ${armed.primary}/16 [${armed.primarySeeds.join(', ')}]`);
const go = armed.primary >= 2 && armed.primary >= control.primary + 1;
console.log(`GO bar: >=2/16 armed AND >= control+1  ->  ${go ? 'GO' : 'NO-GO'}`);

console.log('\n=== guardrails ===');
const medC = control.wall.medSurv, medA = armed.wall.medSurv;
console.log(`median survival: control ${medC}d, armed ${medA}d (bar >= ${medC - 10}d): ${medA >= medC - 10 ? 'PASS' : 'FAIL'}`);
console.log(`villager combat deaths: control ${control.villagerCombatDeaths}, armed ${armed.villagerCombatDeaths} (bar <= ${(control.villagerCombatDeaths * 1.2).toFixed(1)}): ${armed.villagerCombatDeaths <= control.villagerCombatDeaths * 1.2 ? 'PASS' : 'FAIL'}`);
console.log(`starvation deaths: control ${control.starvationDeaths}, armed ${armed.starvationDeaths} (bar <= ${control.starvationDeaths + 2}): ${armed.starvationDeaths <= control.starvationDeaths + 2 ? 'PASS' : 'FAIL'}`);
// new death mode: a cause with >=2 events on armed and 0 on control
const newModes = Object.keys(armed.deathCauses).filter(k => (armed.deathCauses[k] | 0) >= 2 && !(control.deathCauses[k] > 0));
console.log(`new death mode (>=2-event rule): ${newModes.length ? 'FAIL ' + newModes.join(',') : 'PASS'}`);

console.log('\n=== wall numbers ===');
for (const r of [control, armed]) {
  const w = r.wall;
  console.log(`${r.arm}: national ${w.national}/16, table ${w.table}/16, won ${w.won}/16, wave4 ${w.wave4}/16, wave5 ${w.wave5}/16, exiled ${w.exiled}, medSurv ${w.medSurv}d, maxSurv ${w.maxSurv}d, w5vetsMax>=2 ${w.w5vetsMax2}/16`);
}
console.log(`ac counters (armed): ${armed.acCounters} (control: ${control.acCounters})`);

console.log('\n=== villager wave-4 kills (kill-time) ===');
for (const r of [control, armed]) {
  console.log(`-- ${r.arm}`);
  for (const k of r.villW4Kills) {
    if (k.n > 0 || k.sch > 0) {
      console.log(`   s${k.s} ${k.p}: vill=${k.n} sch=${k.sch} armMax=${k.armMax} ` +
        k.kills.map(x => `${x.byName}@d${x.d}(${x.mid},${x.via})`).join(' '));
    }
  }
}

console.log('\n=== death causes ===');
const allCauses = new Set([...Object.keys(control.deathCauses), ...Object.keys(armed.deathCauses)]);
for (const c of [...allCauses].sort()) {
  console.log(`   ${c}: control ${control.deathCauses[c] | 0}, armed ${armed.deathCauses[c] | 0}`);
}

const out = { control, armed, verdict: go ? 'GO' : 'NO-GO' };
fs.writeFileSync(path.join(DIR, '_analysis.json'), JSON.stringify(out, null, 1) + '\n');
console.log('\nwrote ' + path.join(DIR, '_analysis.json'));
console.log(`\nVERDICT: ${go ? 'GO' : 'NO-GO'}`);
process.exit(go ? 0 : 3);

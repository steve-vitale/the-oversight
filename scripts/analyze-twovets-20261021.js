#!/usr/bin/env node
// analyze-twovets-20261021.js — sim-twovets-r2 PILOT analyzer.
//
// Judges the pilot against the BINDING pre-registration (brief):
//   PRIMARY: per-seed count of seeds where (distinct villagers with
//     wave-4 kills >= 2) AND (scholar wave-4 kills = 0). A seed counts if
//     EITHER policy config (leadfeast, belongfeast) reaches it.
//   GO: >= 2/8 armed seeds AND armed seeds >= control seeds + 2.
//   Miss = NO-GO, never re-scored (§14).
//
// Guardrails: villager combat deaths <= control×1.2; median survival
// (non-winning, per-seed matched) >= control−10d; starvation deaths <=
// control; no new death mode (≥2-event rule); wins within ±4/16
// (report-class).
//
// Usage: node scripts/analyze-twovets-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-21', 'perseed-twovets');
const SEEDS = [64841, 64842, 64843, 64844, 64845, 64846, 64847, 64848];
const BASES = ['leadfeast', 'belongfeast'];

function load(arm, tag, seed) {
  const fp = path.join(DIR, `${arm}-${tag}-s${seed}.json`);
  return JSON.parse(fs.readFileSync(fp, 'utf8'));
}
function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// PRIMARY per config: (distinct villagers with wave-4 kills >= 2) AND
// (scholar wave-4 kills = 0).
function primaryMet(r) { return (r.nW4Villagers | 0) >= 2 && (r.w4scholarKills | 0) === 0; }

const perSeed = [];
for (const seed of SEEDS) {
  const row = { seed };
  for (const arm of ['control', 'twovets']) {
    const cfgs = [];
    for (const base of BASES) {
      const tag = arm === 'twovets' ? base + '-twovets' : base;
      let r = null;
      try { r = load(arm, tag, seed); } catch (e) { r = null; }
      cfgs.push({ base, r, primary: r ? primaryMet(r) : false });
    }
    row[arm] = { configs: cfgs, seedCounts: cfgs.some(c => c.primary) };
  }
  perSeed.push(row);
}

const armedCount = perSeed.filter(r => r.twovets.seedCounts).length;
const controlCount = perSeed.filter(r => r.control.seedCounts).length;
const goBar = armedCount >= 2 && armedCount >= controlCount + 2;
const verdict = goBar ? 'GO' : 'NO-GO';

console.log('=== sim-twovets-r2 PILOT — PRIMARY vs pre-registered bar ===');
console.log('Bar: >= 2/8 armed seeds AND armed >= control+2. Seed counts if EITHER policy config reaches (nW4Villagers>=2 AND w4scholarKills=0).');
console.log('');
console.log('seed   | control lead  | control belong | twovets lead   | twovets belong  | seed: C T');
for (const r of perSeed) {
  const c = r.control.configs, t = r.twovets.configs;
  const cell = (x) => x.r ? `n=${x.r.nW4Villagers},s=${x.r.w4scholarKills}${x.primary ? '*' : ''}`.padEnd(14) : 'MISSING'.padEnd(14);
  console.log(`${r.seed} | ${cell(c[0])} | ${cell(c[1])} | ${cell(t[0])} | ${cell(t[1])} | ${r.control.seedCounts ? 1 : 0} ${r.twovets.seedCounts ? 1 : 0}`);
}
console.log('');
console.log(`armed seeds reaching primary: ${armedCount}/8; control: ${controlCount}/8`);
console.log(`VERDICT: ${verdict} (armed>=2: ${armedCount >= 2}; armed>=control+2: ${armedCount >= controlCount + 2})`);

// --- SECONDARY: wall numbers ---
function wall(rows) {
  const g = (f) => rows.map(f).reduce((a, b) => a + b, 0);
  return {
    national: g(r => r.national | 0), table: g(r => r.table | 0), won: g(r => r.won | 0),
    wave4: g(r => r.wave4 | 0), wave5: g(r => r.wave5 | 0), exiled: g(r => r.exiled | 0),
    medSurv: median(rows.map(r => r.gameDays | 0)), maxSurv: Math.max(...rows.map(r => r.gameDays | 0)),
    w5vets2: g(r => (r.w5vetsMax | 0) >= 2 ? 1 : 0),
  };
}
const all = { control: [], twovets: [] };
for (const r of perSeed) for (const arm of ['control', 'twovets']) for (const c of r[arm].configs) if (c.r) all[arm].push(c.r);
console.log('\n=== wall numbers (16 configs/arm) ===');
for (const arm of ['control', 'twovets']) console.log(arm.padEnd(8), JSON.stringify(wall(all[arm])));

// --- GUARDRAILS ---
const cg = { vcd: 0, starv: 0 }, ag = { vcd: 0, starv: 0 };
const deathModes = { control: {}, twovets: {} };
for (const r of perSeed) for (const arm of ['control', 'twovets']) for (const c of r[arm].configs) {
  if (!c.r) continue;
  const t = arm === 'control' ? cg : ag;
  t.vcd += c.r.villagerCombatDeaths | 0;
  t.starv += c.r.starvationDeaths | 0;
  for (const [k, v] of Object.entries(c.r.deathCauses || {})) deathModes[arm][k] = (deathModes[arm][k] || 0) + v;
}
const matchedSurv = [];
for (const r of perSeed) {
  const cw = r.control.configs.filter(c => c.r && !c.r.won).map(c => c.r.gameDays | 0);
  const aw = r.twovets.configs.filter(c => c.r && !c.r.won).map(c => c.r.gameDays | 0);
  matchedSurv.push({ seed: r.seed, control: median(cw), armed: median(aw) });
}
const winsC = wall(all.control).won, winsA = wall(all.twovets).won;
const newModes = Object.entries(deathModes.twovets).filter(([k, v]) => v >= 2 && !(deathModes.control[k] >= 1));
console.log('\n=== guardrails ===');
console.log(`villager combat deaths: armed=${ag.vcd} control=${cg.vcd} (bar: <= ${Math.round(cg.vcd * 1.2)}) -> ${ag.vcd <= cg.vcd * 1.2 ? 'PASS' : 'FAIL'}`);
console.log(`starvation deaths: armed=${ag.starv} control=${cg.starv} (bar: <= control) -> ${ag.starv <= cg.starv ? 'PASS' : 'FAIL'}`);
console.log('median survival, non-winning, per-seed matched (bar: armed >= control-10d):');
let survOk = true;
for (const m of matchedSurv) {
  const ok = m.armed == null || m.control == null || m.armed >= m.control - 10;
  if (!ok) survOk = false;
  console.log(`  s${m.seed}: control=${m.control} armed=${m.armed} -> ${ok ? 'PASS' : 'FAIL'}`);
}
console.log(`overall median survival: control=${median(all.control.filter(r => !r.won).map(r => r.gameDays | 0))} armed=${median(all.twovets.filter(r => !r.won).map(r => r.gameDays | 0))}`);
console.log(`new death modes (>=2 events, unseen in control): ${newModes.length ? JSON.stringify(newModes) : 'none'} -> ${newModes.length ? 'FAIL' : 'PASS'}`);
console.log(`wins: armed=${winsA} control=${winsC} (report-class, bar ±4) -> ${Math.abs(winsA - winsC) <= 4 ? 'PASS' : 'FLAG'}`);

// --- wave-4 kill detail (mechanism) ---
console.log('\n=== wave-4 kill detail (armed) ===');
for (const r of perSeed) for (const c of r.twovets.configs) {
  if (!c.r) continue;
  for (const k of (c.r.w4killsDetail || [])) {
    console.log(`  s${r.seed} ${c.base}: d${k.d} ${k.mid} by=${k.byName}(${k.by}) via=${k.via}`);
  }
}
console.log('\n=== wave-4 kill detail (control) ===');
for (const r of perSeed) for (const c of r.control.configs) {
  if (!c.r) continue;
  for (const k of (c.r.w4killsDetail || [])) {
    console.log(`  s${r.seed} ${c.base}: d${k.d} ${k.mid} by=${k.byName}(${k.by}) via=${k.via}`);
  }
}

// tv counters
console.log('\n=== tv counters (armed) ===');
for (const r of perSeed) for (const c of r.twovets.configs) {
  if (!c.r) continue;
  console.log(`  s${r.seed} ${c.base}: ${JSON.stringify(c.r.tv)}`);
}

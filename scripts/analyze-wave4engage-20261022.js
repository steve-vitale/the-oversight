#!/usr/bin/env node
// analyze-wave4engage-20261022.js — sim-wave4engage PILOT analyzer.
//
// Judges the pilot against the BINDING pre-registration (brief):
//   PRIMARY (a): villager wave-4 engagement events (kill-time attributed,
//      killdisc v2: startCombat wave==4, started, partySize>=1) summed
//      over the 16 configs: armed >= 1.5x control. (Floor: if the control
//      total is 0, armed >= 3 counts as GO on (a) — not noise, not zero.)
//   PRIMARY (b): armed runs with >=1 villager-attributed wave-4 kill
//      (waveKillLog w=4, by != bearer-on-the-kill's-day, by != 'player'
//      — sim-killtime MANDATORY) >= 2/16. A seed counts if EITHER policy
//      config reaches it.
//   GO = both (a) and (b). Miss = NO-GO, never re-scored (§14).
//
// Guardrails: villager combat deaths <= control x1.2; median survival
// (non-winning, per-seed matched) >= control-10d; starvation deaths <=
// control+2; no new death mode (>=2-event rule).
//
// Usage: node scripts/analyze-wave4engage-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-22', 'perseed-wave4engage-r2');
const SEEDS = [65451, 65452, 65453, 65454, 65455, 65456, 65457, 65458];
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

// PRIMARY (b) per config: >=1 villager-attributed wave-4 kill.
function primaryMet(r) { return (r.nW4Villagers | 0) >= 1; }

const arms = {};
for (const arm of ['control', 'wave4engage']) {
  const rows = [];
  for (const seed of SEEDS) for (const base of BASES) {
    const tag = arm === 'wave4engage' ? base + '-wave4engage' : base;
    let r = null;
    try { r = load(arm, tag, seed); } catch (e) { r = null; }
    rows.push({ seed, base, r });
  }
  arms[arm] = rows;
}

function sumFor(arm, k) { return arms[arm].reduce((t, x) => t + ((x.r && x.r[k]) | 0), 0); }

// PRIMARY (a)
const engC = sumFor('control', 'w4EngageEvents');
const engA = sumFor('wave4engage', 'w4EngageEvents');
const aGo = engC === 0 ? engA >= 3 : engA >= 1.5 * engC;

// PRIMARY (b): per-seed, either config.
const perSeed = [];
for (const seed of SEEDS) {
  const row = { seed };
  for (const arm of ['control', 'wave4engage']) {
    const cfgs = BASES.map(base => {
      const rows = arms[arm].filter(x => x.seed === seed && x.base === base);
      const r = rows.length ? rows[0].r : null;
      return { base, r, primary: r ? primaryMet(r) : false };
    });
    row[arm] = { configs: cfgs, seedCounts: cfgs.some(c => c.primary) };
  }
  perSeed.push(row);
}
const armedCount = perSeed.filter(r => r.wave4engage.seedCounts).length;
const controlCount = perSeed.filter(r => r.control.seedCounts).length;
const bGo = armedCount >= 2;

const verdict = (aGo && bGo) ? 'GO' : 'NO-GO';

console.log('PRIMARY (a) villager wave-4 engagement events (16 configs/arm):');
console.log(`  control=${engC} armed=${engA} ratio=${engC ? (engA / engC).toFixed(2) : 'n/a(control 0)'} -> ${aGo ? 'GO' : 'NO-GO'}`);
console.log('PRIMARY (b) seeds with >=1 villager-attributed wave-4 kill:');
for (const row of perSeed) {
  const c = row.control.configs.map(c => (c.r ? `${c.base.slice(0, 4)}:${c.r.nW4Villagers}v/${c.r.w4scholarKills}s` : `${c.base.slice(0, 4)}:MISS`)).join(' ');
  const a = row.wave4engage.configs.map(c => (c.r ? `${c.base.slice(0, 4)}:${c.r.nW4Villagers}v/${c.r.w4scholarKills}s` : `${c.base.slice(0, 4)}:MISS`)).join(' ');
  console.log(`  s${row.seed} C[${c}] A[${a}] C/T=${row.control.seedCounts ? 1 : 0}/${row.wave4engage.seedCounts ? 1 : 0}`);
}
console.log(`  armed=${armedCount}/8 control=${controlCount}/8 (bar >= 2/8 armed) -> ${bGo ? 'GO' : 'NO-GO'}`);
console.log(`VERDICT: ${verdict}`);
console.log('');

// Wall numbers (16 configs/arm).
function wall(arm) {
  const rows = arms[arm].map(x => x.r).filter(Boolean);
  const n = rows.length;
  const c = k => rows.filter(r => r[k]).length;
  const med = median(rows.map(r => r.gameDays | 0).filter(Number.isFinite));
  const mx = Math.max.apply(null, rows.map(r => r.gameDays | 0));
  return { n, national: c('national'), table: c('table'), won: c('won'), wave4: c('wave4'), wave5: c('wave5'), exiled: c('exiled'), medSurv: med, maxSurv: mx,
    w5vets2: rows.filter(r => (r.w5vetsMax | 0) >= 2).length, w4kills: rows.reduce((t, r) => t + (r.w4kills | 0), 0) };
}
const wC = wall('control'), wA = wall('wave4engage');
console.log('wall control   ', JSON.stringify(wC));
console.log('wall wave4engage', JSON.stringify(wA));
console.log('');

// Guardrails.
const vcdC = sumFor('control', 'villagerCombatDeaths'), vcdA = sumFor('wave4engage', 'villagerCombatDeaths');
const stC = sumFor('control', 'starvationDeaths'), stA = sumFor('wave4engage', 'starvationDeaths');
console.log(`guardrail villagerCombatDeaths: control=${vcdC} armed=${vcdA} bar<=${(vcdC * 1.2).toFixed(1)} -> ${vcdA <= vcdC * 1.2 ? 'PASS' : 'FAIL'}`);
console.log(`guardrail starvationDeaths: control=${stC} armed=${stA} bar<=${stC + 2} -> ${stA <= stC + 2 ? 'PASS' : 'FAIL'}`);
// Median survival (non-winning, per-seed matched): median over seeds of
// (armed - control) game-days for non-winning matched configs.
const survDiffs = [];
for (const seed of SEEDS) for (const base of BASES) {
  const cr = arms.control.find(x => x.seed === seed && x.base === base).r;
  const ar = arms.wave4engage.find(x => x.seed === seed && x.base === base).r;
  if (!cr || !ar || cr.won || ar.won) continue;
  survDiffs.push((ar.gameDays | 0) - (cr.gameDays | 0));
}
const medSurvDiff = median(survDiffs);
console.log(`guardrail median survival (non-winning matched, n=${survDiffs.length}): diff=${medSurvDiff} bar>=-10 -> ${medSurvDiff == null ? 'N/A' : (medSurvDiff >= -10 ? 'PASS' : 'FAIL')}`);
// New death mode (>=2-event rule): death causes present on armed with >=2
// events but absent on control.
const dcC = {}, dcA = {};
for (const x of arms.control) { if (x.r) for (const [k, v] of Object.entries(x.r.deathCauses || {})) dcC[k] = (dcC[k] || 0) + v; }
for (const x of arms.wave4engage) { if (x.r) for (const [k, v] of Object.entries(x.r.deathCauses || {})) dcA[k] = (dcA[k] || 0) + v; }
const newModes = Object.keys(dcA).filter(k => (dcA[k] | 0) >= 2 && !(dcC[k] | 0));
console.log(`guardrail new death mode (>=2 events, absent on control): ${newModes.length ? 'FAIL ' + JSON.stringify(newModes) : 'PASS'}`);

// Mechanism counters (armed arm).
const we4tot = {};
for (const x of arms.wave4engage) { if (x.r && x.r.we4) for (const [k, v] of Object.entries(x.r.we4)) we4tot[k] = (we4tot[k] | 0) + (v | 0); }
console.log('we4 counters (armed):', JSON.stringify(we4tot));
console.log('wins control/armed:', wC.won, wA.won, '(report-class)');

// Wave-4 kill detail (armed), kill-time attributed.
console.log('');
console.log('armed wave-4 kill detail (kill-time):');
for (const x of arms.wave4engage) {
  if (!x.r || !x.r.w4killsDetail || !x.r.w4killsDetail.length) continue;
  for (const d of x.r.w4killsDetail) {
    console.log(`  s${x.seed} ${x.base} d${d.d} ${d.mid} by=${d.byName} via=${d.via}`);
  }
}

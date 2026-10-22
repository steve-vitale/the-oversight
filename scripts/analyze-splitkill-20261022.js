#!/usr/bin/env node
// analyze-splitkill-20261022.js — sim-splitkill PILOT analyzer.
//
// Judges the pilot against the BINDING pre-registration (evidence header):
//   PRIMARY: armed configs' villager wave-4 kills (waveKillLog w=4,
//      kill-time attributed: by != bearer-on-that-day, by != 'player' —
//      sim-killtime MANDATORY) >= control+2 AND >=2/8 armed seeds.
//      A seed counts if EITHER policy config reaches >=1.
//   GO = primary met. A miss is NO-GO, never re-scored (§14).
//
// Guardrails: median survival within ±10d of control (non-winning,
// per-seed matched); starvation deaths <= control+2; no new death mode
// (>=2-event rule); scholar-fight mortality watch (scholar combat deaths
// armed vs control — the discipline must not accelerate the killer's
// death); wave-4 unlock count not reduced.
//
// Usage: node scripts/analyze-splitkill-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-22', 'perseed-splitkill');
const SEEDS = [65501, 65502, 65503, 65504, 65505, 65506, 65507, 65508];
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

function primaryMet(r) { return (r.nW4Villagers | 0) >= 1; }

const arms = {};
for (const arm of ['control', 'splitkill']) {
  const rows = [];
  for (const seed of SEEDS) for (const base of BASES) {
    const tag = arm === 'splitkill' ? base + '-splitkill' : base;
    let r = null;
    try { r = load(arm, tag, seed); } catch (e) { r = null; }
    rows.push({ seed, base, r });
  }
  arms[arm] = rows;
}
const missing = arms.control.concat(arms.splitkill).filter(x => !x.r);
if (missing.length) { console.error(`ANALYZER STOP: ${missing.length} configs missing JSON.`); process.exit(2); }

function sumFor(arm, k) { return arms[arm].reduce((t, x) => t + ((x.r && x.r[k]) | 0), 0); }

// PRIMARY: per-seed, either config; armed >= control+2 AND >=2/8.
const perSeed = [];
for (const seed of SEEDS) {
  const row = { seed };
  for (const arm of ['control', 'splitkill']) {
    const cfgs = BASES.map(base => {
      const r = arms[arm].find(x => x.seed === seed && x.base === base).r;
      return { base, r, primary: primaryMet(r) };
    });
    row[arm] = { configs: cfgs, seedCounts: cfgs.some(c => c.primary) };
  }
  perSeed.push(row);
}
const armedSeeds = perSeed.filter(r => r.splitkill.seedCounts).length;
const controlSeeds = perSeed.filter(r => r.control.seedCounts).length;
const primaryGo = armedSeeds >= controlSeeds + 2 && armedSeeds >= 2;
const verdict = primaryGo ? 'GO' : 'NO-GO';

console.log('PRIMARY seeds with >=1 villager-attributed wave-4 kill (kill-time):');
for (const row of perSeed) {
  const c = row.control.configs.map(c => `${c.base.slice(0, 4)}:${c.r.nW4Villagers}v/${c.r.w4scholarKills}s`).join(' ');
  const a = row.splitkill.configs.map(c => `${c.base.slice(0, 4)}:${c.r.nW4Villagers}v/${c.r.w4scholarKills}s`).join(' ');
  console.log(`  s${row.seed} C[${c}] A[${a}] C/A=${row.control.seedCounts ? 1 : 0}/${row.splitkill.seedCounts ? 1 : 0}`);
}
console.log(`  armed=${armedSeeds}/8 control=${controlSeeds}/8 (bar: >=control+2 AND >=2/8) -> ${primaryGo ? 'GO' : 'NO-GO'}`);
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
const wC = wall('control'), wA = wall('splitkill');
console.log('wall control  ', JSON.stringify(wC));
console.log('wall splitkill', JSON.stringify(wA));
console.log('');

// Guardrails.
const stC = sumFor('control', 'starvationDeaths'), stA = sumFor('splitkill', 'starvationDeaths');
console.log(`guardrail starvationDeaths: control=${stC} armed=${stA} bar<=${stC + 2} -> ${stA <= stC + 2 ? 'PASS' : 'FAIL'}`);
const survDiffs = [];
for (const seed of SEEDS) for (const base of BASES) {
  const cr = arms.control.find(x => x.seed === seed && x.base === base).r;
  const ar = arms.splitkill.find(x => x.seed === seed && x.base === base).r;
  if (!cr || !ar || cr.won || ar.won) continue;
  survDiffs.push((ar.gameDays | 0) - (cr.gameDays | 0));
}
const medSurvDiff = median(survDiffs);
const survGo = medSurvDiff == null ? null : Math.abs(medSurvDiff) <= 10;
console.log(`guardrail median survival (non-winning matched, n=${survDiffs.length}): diff=${medSurvDiff} bar within ±10 -> ${survGo == null ? 'N/A' : (survGo ? 'PASS' : 'FAIL')}`);
const dcC = {}, dcA = {};
for (const x of arms.control) for (const [k, v] of Object.entries(x.r.deathCauses || {})) dcC[k] = (dcC[k] || 0) + v;
for (const x of arms.splitkill) for (const [k, v] of Object.entries(x.r.deathCauses || {})) dcA[k] = (dcA[k] || 0) + v;
const newModes = Object.keys(dcA).filter(k => (dcA[k] | 0) >= 2 && !(dcC[k] | 0));
console.log(`guardrail new death mode (>=2 events, absent on control): ${newModes.length ? 'FAIL ' + JSON.stringify(newModes) : 'PASS'}`);
const scdC = sumFor('control', 'scholarCombatDeaths'), scdA = sumFor('splitkill', 'scholarCombatDeaths');
console.log(`watch scholarCombatDeaths: control=${scdC} armed=${scdA} (must not accelerate) -> ${scdA <= scdC ? 'PASS' : 'WATCH'}`);
const w4uC = sumFor('control', 'wave4'), w4uA = sumFor('splitkill', 'wave4');
console.log(`guardrail wave-4 unlocks: control=${w4uC} armed=${w4uA} (not reduced) -> ${w4uA >= w4uC ? 'PASS' : 'FAIL'}`);

// Mechanism counters (armed arm).
const skTot = {};
for (const x of arms.splitkill) { const t = (x.r && x.r.skTele) || {}; for (const k of Object.keys(t)) skTot[k] = (skTot[k] | 0) + (t[k] | 0); }
console.log('sk counters (armed):', JSON.stringify(skTot));

// Armed wave-4 kill detail (kill-time).
console.log('');
console.log('armed wave-4 kill detail (kill-time):');
for (const x of arms.splitkill) {
  const det = (x.r.w4killsDetail || []).map(e => `${e.mid}@d${e.d} by=${e.byName}(${e.by}) via=${e.via}`).join('; ');
  if (det) console.log(`  s${x.seed} ${x.base}: ${det}`);
}
console.log('');
console.log('control wave-4 kill detail (kill-time):');
for (const x of arms.control) {
  const det = (x.r.w4killsDetail || []).map(e => `${e.mid}@d${e.d} by=${e.byName}(${e.by}) via=${e.via}`).join('; ');
  if (det) console.log(`  s${x.seed} ${x.base}: ${det}`);
}

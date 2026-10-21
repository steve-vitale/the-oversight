#!/usr/bin/env node
// analyze-wave4hunt-r2-20261021.js — sim-wave4hunt-r2 PILOT/CONFIRM analyzer.
//
// Judges the run against the BINDING pre-registration (brief):
//   PRIMARY: number of runs with >=1 villager wave-4 kill (kill-time
//     attributed: waveKillLog w=4, by != scholar-vid-at-that-day,
//     by != 'player'). A seed counts if EITHER policy config reaches it.
//   PILOT GO (4 seeds x 2 policies x 2 arms = 16 configs): >= 2/8 armed
//     configs AND armed >= control + 1.
//   FULL GO (8 seeds, 32 configs): >= 3/16 armed runs AND armed >= control + 2.
//   Miss = NO-GO, never re-scored (§14).
//
// Guardrails: scholar deaths <= control+2/16; villager combat deaths <=
//   control x 1.25; wins >= control-4/16; median survival >= control-10d;
//   starvation deaths <= control; no new death mode (>=2-event rule).
//
// Usage:
//   node scripts/analyze-wave4hunt-r2-20261021.js                      # all 8 seeds (full bar)
//   SEEDS=64406,64703,64858,64843 node scripts/analyze-wave4hunt-r2-20261021.js  # pilot bar
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-21', 'perseed-wave4hunt-r2');
const PILOT_SEEDS = [64406, 64703, 64858, 64843];
const FULL_SEEDS = [64406, 64703, 64858, 64843, 64847, 64841, 64842, 64844];
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : FULL_SEEDS).filter(Number.isFinite);
const BASES = ['leadfeast', 'belongfeast'];
const isPilot = SEEDS.length === 4 && PILOT_SEEDS.every(s => SEEDS.includes(s));

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

// PRIMARY per config: >=1 villager wave-4 kill (kill-time attributed).
function primaryMet(r) { return (r.villagerW4Kill | 0) >= 1; }

const perSeed = [];
let missing = 0;
for (const seed of SEEDS) {
  const row = { seed };
  for (const arm of ['control', 'wave4hunt']) {
    const cfgs = [];
    for (const base of BASES) {
      const tag = arm === 'wave4hunt' ? base + '-wave4hunt-r2' : base;
      let r = null;
      try { r = load(arm, tag, seed); } catch (e) { r = null; missing++; }
      cfgs.push({ base, r, primary: r ? primaryMet(r) : false });
    }
    row[arm] = { configs: cfgs, seedCounts: cfgs.some(c => c.primary) };
  }
  perSeed.push(row);
}

const nArmedRuns = SEEDS.length * 2;
const armedCount = perSeed.filter(r => r.wave4hunt.seedCounts).length;
const controlCount = perSeed.filter(r => r.control.seedCounts).length;
let barDesc, goBar;
if (isPilot) {
  barDesc = '>= 2/8 armed configs AND armed >= control+1';
  goBar = armedCount >= 2 && armedCount >= controlCount + 1;
} else {
  barDesc = '>= 3/16 armed runs AND armed >= control+2';
  goBar = armedCount >= 3 && armedCount >= controlCount + 2;
}
const verdict = goBar ? 'GO' : 'NO-GO';

console.log(`=== sim-wave4hunt-r2 ${isPilot ? 'PILOT' : 'FULL'} — PRIMARY vs pre-registered bar ===`);
console.log(`Bar: ${barDesc}. Seed counts if EITHER policy config reaches (villagerW4Kill>=1, kill-time attributed).`);
console.log('');
console.log('seed   | control lead  | control belong | armed lead    | armed belong   | seed: C T');
for (const r of perSeed) {
  const c = r.control.configs, t = r.wave4hunt.configs;
  const cell = (x) => x.r ? `v=${x.r.villagerW4Kill},s=${x.r.w4scholarKills}${x.primary ? '*' : ''}`.padEnd(14) : 'MISSING'.padEnd(14);
  console.log(`${r.seed} | ${cell(c[0])} | ${cell(c[1])} | ${cell(t[0])} | ${cell(t[1])} | ${r.control.seedCounts ? 1 : 0} ${r.wave4hunt.seedCounts ? 1 : 0}`);
}
console.log('');
console.log(`armed runs reaching primary: ${armedCount}/${SEEDS.length}; control: ${controlCount}/${SEEDS.length}`);
console.log(`VERDICT: ${verdict} (${barDesc})`);
if (missing) console.log(`WARNING: ${missing} configs missing`);

// --- mechanism: w4h counters ---
console.log('\n--- mechanism (w4h counters, armed arm) ---');
for (const r of perSeed) {
  for (const cfg of r.wave4hunt.configs) {
    const w = (cfg.r && cfg.r.w4h) || {};
    const keys = ['w4hSorties', 'w4hFights', 'w4hW4Fights', 'w4hYields', 'w4hSoftStrikes', 'w4hChaffStrikes', 'w4hHolds', 'w4hBreakoffs', 'w4hDelegates', 'w4hNoTarget', 'w4hSkippedParty', 'w4hSkippedHurt', 'w4hSkippedHungry'];
    console.log(`s${r.seed} ${cfg.base}: ` + keys.map(k => `${k.replace('w4h', '')}=${w[k] | 0}`).join(' '));
  }
}
// scholar wave-4 kills (the discipline check): must be 0 on armed.
const armedScholarKills = perSeed.reduce((t, r) => t + r.wave4hunt.configs.reduce((x, c) => x + ((c.r && c.r.w4scholarKills) | 0), 0), 0);
console.log(`armed scholar wave-4 kills (discipline check, want 0): ${armedScholarKills}`);

// --- SECONDARY: wall numbers ---
function wall(rows) {
  const g = (f) => rows.map(f).reduce((a, b) => a + b, 0);
  return {
    national: g(r => r.national | 0), table: g(r => r.table | 0), won: g(r => r.won | 0),
    wave4: g(r => r.wave4 | 0), wave5: g(r => r.wave5 | 0), exiled: g(r => r.exiled | 0),
    medSurv: median(rows.map(r => r.gameDays | 0)), maxSurv: Math.max(...rows.map(r => r.gameDays | 0)),
  };
}
const controlRows = [], armedRows = [];
for (const r of perSeed) {
  for (const c of r.control.configs) if (c.r) controlRows.push(c.r);
  for (const c of r.wave4hunt.configs) if (c.r) armedRows.push(c.r);
}
console.log('\n--- wall numbers ---');
console.log('control:', JSON.stringify(wall(controlRows)));
console.log('armed:  ', JSON.stringify(wall(armedRows)));

// wave-4 fights by channel (#749 split)
function channels(rows) {
  const o = { heraldFights: 0, monsterFights: 0, heraldRefused: 0 };
  for (const r of rows) { const c = r.w4channels || {}; o.heraldFights += c.heraldFights | 0; o.monsterFights += c.monsterFights | 0; o.heraldRefused += c.heraldRefused | 0; }
  return o;
}
console.log('wave-4 fight channels (#749) control:', JSON.stringify(channels(controlRows)));
console.log('wave-4 fight channels (#749) armed:  ', JSON.stringify(channels(armedRows)));

// --- GUARDRAILS ---
console.log('\n--- guardrails ---');
const g = (f) => controlRows.map(f).reduce((a, b) => a + b, 0);
const h = (f) => armedRows.map(f).reduce((a, b) => a + b, 0);
const n = controlRows.length;
const scholarDeathsC = g(r => r.scholarDeaths | 0), scholarDeathsA = h(r => r.scholarDeaths | 0);
const vcdC = g(r => r.villagerCombatDeaths | 0), vcdA = h(r => r.villagerCombatDeaths | 0);
const winsC = g(r => r.won | 0), winsA = h(r => r.won | 0);
const starvC = g(r => r.starvationDeaths | 0), starvA = h(r => r.starvationDeaths | 0);
// median survival, per-seed matched on non-winning runs
function medSurvMatched() {
  const pairs = [];
  for (const r of perSeed) {
    for (let i = 0; i < 2; i++) {
      const c = r.control.configs[i].r, a = r.wave4hunt.configs[i].r;
      if (c && a && !c.won && !a.won) pairs.push([c.gameDays | 0, a.gameDays | 0]);
    }
  }
  return { c: median(pairs.map(p => p[0])), a: median(pairs.map(p => p[1])), n: pairs.length };
}
const ms = medSurvMatched();
// new death mode (>=2-event rule): death causes present on armed but not control
const causesC = {}, causesA = {};
for (const r of controlRows) for (const [k, v] of Object.entries(r.deathCauses || {})) causesC[k] = (causesC[k] || 0) + v;
for (const r of armedRows) for (const [k, v] of Object.entries(r.deathCauses || {})) causesA[k] = (causesA[k] || 0) + v;
const newModes = Object.keys(causesA).filter(k => (causesA[k] | 0) >= 2 && !(causesC[k] > 0));
const checks = [
  [`scholar deaths <= control+${Math.ceil(n / 8)} (${scholarDeathsA} <= ${scholarDeathsC}+${Math.ceil(n / 8)})`, scholarDeathsA <= scholarDeathsC + Math.ceil(n / 8)],
  [`villager combat deaths <= control x 1.25 (${vcdA} <= ${(vcdC * 1.25).toFixed(1)})`, vcdA <= vcdC * 1.25],
  [`wins >= control-${Math.ceil(n / 4)}/16 (${winsA} >= ${winsC - Math.ceil(n / 4)})`, winsA >= winsC - Math.ceil(n / 4)],
  [`median survival (non-winning, per-seed matched, n=${ms.n}) >= control-10d (${ms.a} >= ${ms.c - 10})`, ms.a != null && ms.c != null && ms.a >= ms.c - 10],
  [`starvation deaths <= control (${starvA} <= ${starvC})`, starvA <= starvC],
  [`no new death mode (>=2-event rule): ${newModes.length ? newModes.join(',') : 'none'}`, newModes.length === 0],
];
for (const [label, ok] of checks) console.log((ok ? 'PASS ' : 'MISS ') + label);
const guardrailsPass = checks.every(c => c[1]);
console.log(`\nGUARDRAILS: ${guardrailsPass ? 'ALL PASS' : 'MISSES PRESENT'}`);
console.log(`\nOVERALL: ${verdict}${guardrailsPass ? '' : ' (guardrail misses — see above)'}`);

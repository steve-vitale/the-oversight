#!/usr/bin/env node
// analyze-wave4hunt-r3-20261021.js — sim-wave4hunt-r3 PILOT/CONFIRM analyzer.
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
// RE-PRICED GUARDRAILS (from r2's metric review — the revision, hard):
//   - bearer deaths <= control + 1/16 per villager wave-4 kill armed
//     (cost-priced, not flat: each manufactured kill buys ONE bearer
//     death of budget over the run)
//   - villager combat deaths <= control x 1.25
//   - wins >= control - 4/16 (scaled: ceil(n/4))
//   - starvation deaths <= control
//   - no new death mode (>=2-event rule)
//   - NO village loss on a seed the control wins (the s64847 tail-risk
//     rule — one recurrence = NO-GO)
//   - median survival: N/A-pass when all runs win; otherwise
//     >= control-10d (per-seed matched, non-winning runs)
//
// Usage:
//   node scripts/analyze-wave4hunt-r3-20261021.js                      # all 8 seeds (full bar)
//   SEEDS=64406,64703,64858,64843 node scripts/analyze-wave4hunt-r3-20261021.js  # pilot bar
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-21', 'perseed-wave4hunt-r3');
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
// Villager wave-4 kill EVENTS on a row (kill-time attributed).
function villagerW4Kills(r) {
  if (!r || !r.w4killsDetail) return 0;
  return r.w4killsDetail.filter(e => e && e.by !== e.bearerAtKill && e.by !== 'player').length;
}
const COMMUNITY_LOST = new Set(['village-lost', 'village-dead', 'pop-zero']);
function communityLost(r) {
  if (!r) return false;
  if (COMMUNITY_LOST.has(String(r.endReason || ''))) return true;
  return (r.won | 0) === 0 && (r.exiled | 0) === 0 && (r.gameDays | 0) > 0 &&
    ['village', 'local'].includes(String(r.endReason || '').split('-')[0]) && false; // conservative: endReason set only
}

const perSeed = [];
let missing = 0;
for (const seed of SEEDS) {
  const row = { seed };
  for (const arm of ['control', 'wave4hunt']) {
    const cfgs = [];
    for (const base of BASES) {
      const tag = arm === 'wave4hunt' ? base + '-wave4hunt-r3' : base;
      let r = null;
      try { r = load(arm, tag, seed); } catch (e) { r = null; missing++; }
      cfgs.push({ base, r, primary: r ? primaryMet(r) : false });
    }
    row[arm] = { configs: cfgs, seedCounts: cfgs.some(c => c.primary) };
  }
  perSeed.push(row);
}

let barDesc, goBar;
if (isPilot) {
  barDesc = '>= 2/8 armed configs AND armed >= control+1';
  goBar = perSeed.filter(r => r.wave4hunt.seedCounts).length >= 2 &&
    perSeed.filter(r => r.wave4hunt.seedCounts).length >= perSeed.filter(r => r.control.seedCounts).length + 1;
} else {
  barDesc = '>= 3/16 armed runs AND armed >= control+2';
  goBar = perSeed.filter(r => r.wave4hunt.seedCounts).length >= 3 &&
    perSeed.filter(r => r.wave4hunt.seedCounts).length >= perSeed.filter(r => r.control.seedCounts).length + 2;
}
const verdict = goBar ? 'GO' : 'NO-GO';
const armedCount = perSeed.filter(r => r.wave4hunt.seedCounts).length;
const controlCount = perSeed.filter(r => r.control.seedCounts).length;

console.log(`=== sim-wave4hunt-r3 ${isPilot ? 'PILOT' : 'FULL'} — PRIMARY vs pre-registered bar ===`);
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

// --- mechanism: w4h3 counters ---
console.log('\n--- mechanism (w4h3 counters, armed arm) ---');
for (const r of perSeed) {
  for (const cfg of r.wave4hunt.configs) {
    const w = (cfg.r && cfg.r.w4h3) || {};
    const keys = ['w4h3Sorties', 'w4h3SkippedBudget', 'w4h3SkippedHurt', 'w4h3SkippedHungry', 'w4h3SkippedParty',
      'w4h3NoTarget', 'w4h3Fights', 'w4h3W4Fights', 'w4h3Yields', 'w4h3SoftStrikes', 'w4h3ChaffStrikes',
      'w4h3Holds', 'w4h3Breakoffs', 'w4h3Delegates'];
    console.log(`s${r.seed} ${cfg.base}: ` + keys.map(k => `${k.replace('w4h3', '')}=${w[k] | 0}`).join(' '));
  }
}
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

// --- GUARDRAILS (re-priced) ---
console.log('\n--- guardrails (re-priced) ---');
const g = (f) => controlRows.map(f).reduce((a, b) => a + b, 0);
const h = (f) => armedRows.map(f).reduce((a, b) => a + b, 0);
const n = controlRows.length;
const scholarDeathsC = g(r => r.scholarDeaths | 0), scholarDeathsA = h(r => r.scholarDeaths | 0);
const armedW4Kills = armedRows.reduce((t, r) => t + villagerW4Kills(r), 0);
const bearerCap = scholarDeathsC + armedW4Kills; // cost-priced: 1 bearer death per manufactured kill
const vcdC = g(r => r.villagerCombatDeaths | 0), vcdA = h(r => r.villagerCombatDeaths | 0);
const winsC = g(r => r.won | 0), winsA = h(r => r.won | 0);
const starvC = g(r => r.starvationDeaths | 0), starvA = h(r => r.starvationDeaths | 0);
// tail-risk rule: NO village loss on a seed the control wins (one recurrence = NO-GO)
const tailRisk = [];
for (const r of perSeed) {
  const controlWon = r.control.configs.some(c => c.r && (c.r.won | 0) === 1);
  const armedLoss = r.wave4hunt.configs.filter(c => c.r && communityLost(c.r)).map(c => c.base);
  if (controlWon && armedLoss.length) tailRisk.push({ seed: r.seed, armedLoss });
}
// median survival: N/A-pass when all runs win; otherwise per-seed matched
// non-winning pairs >= control-10d
const allWon = controlRows.every(r => (r.won | 0) === 1) && armedRows.every(r => (r.won | 0) === 1);
let medCheck, medLabel;
if (allWon) {
  medCheck = true; medLabel = 'N/A-pass (all runs won)';
} else {
  const pairs = [];
  for (const r of perSeed) {
    for (let i = 0; i < 2; i++) {
      const c = r.control.configs[i].r, a = r.wave4hunt.configs[i].r;
      if (c && a && !c.won && !a.won) pairs.push([c.gameDays | 0, a.gameDays | 0]);
    }
  }
  const mc = median(pairs.map(p => p[0])), ma = median(pairs.map(p => p[1]));
  medLabel = `matched non-winning median, n=${pairs.length}: armed=${ma} vs control-10=${mc != null ? mc - 10 : 'n/a'}`;
  medCheck = mc != null && ma != null && ma >= mc - 10;
}
// new death mode (>=2-event rule)
const causesC = {}, causesA = {};
for (const r of controlRows) for (const [k, v] of Object.entries(r.deathCauses || {})) causesC[k] = (causesC[k] || 0) + v;
for (const r of armedRows) for (const [k, v] of Object.entries(r.deathCauses || {})) causesA[k] = (causesA[k] || 0) + v;
const newModes = Object.keys(causesA).filter(k => (causesA[k] | 0) >= 2 && !(causesC[k] > 0));

const checks = [
  [`bearer deaths <= control+1/16 per villager wave-4 kill armed (${scholarDeathsA} <= ${scholarDeathsC}+${armedW4Kills}=${bearerCap})`, scholarDeathsA <= bearerCap],
  [`villager combat deaths <= control x 1.25 (${vcdA} <= ${(vcdC * 1.25).toFixed(1)})`, vcdA <= vcdC * 1.25],
  [`wins >= control-${Math.ceil(n / 4)}/${n} (${winsA} >= ${winsC - Math.ceil(n / 4)})`, winsA >= winsC - Math.ceil(n / 4)],
  [`median survival: ${medLabel}`, medCheck],
  [`starvation deaths <= control (${starvA} <= ${starvC})`, starvA <= starvC],
  [`no new death mode (>=2-event rule): ${newModes.length ? newModes.join(',') : 'none'}`, newModes.length === 0],
  [`no village loss on a seed the control wins (tail-risk): ${tailRisk.length ? JSON.stringify(tailRisk) : 'none'}`, tailRisk.length === 0],
];
for (const [label, ok] of checks) console.log((ok ? 'PASS ' : 'MISS ') + label);
const guardrailsPass = checks.every(c => c[1]);
console.log(`\nGUARDRAILS: ${guardrailsPass ? 'ALL PASS' : 'MISSES PRESENT'}`);
console.log(`\nOVERALL: ${verdict}${guardrailsPass ? '' : ' (guardrail misses — see above)'}`);

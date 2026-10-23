#!/usr/bin/env node
// analyze-splitclose-20261022.js — the pre-registered judge for sim-splitclose.
//
// Judges the 32-config pilot against the BINDING pre-registration in
// evidence/2026-10-22/sim-splitclose.md (§14 — never re-scored):
//   PRIMARY: armed seeds with >=1 kill-time villager wave-4 kill
//     (waveKillLog w=4, by != bearerAtKill, by != 'player') >= control+2
//     AND >=2/8 armed. A seed counts if EITHER policy config reaches it.
//   SECONDARY (reported): damage-majority villager kills (non-scholar
//     share >= 0.5 of the kill fight's damage).
//   GUARDRAILS: scholar-combat-mortality/100d (paired) armed <= control+2;
//     median survival (matched, non-winning) >= control-10d; starvation
//     deaths <= control+2; no new death mode (>=2-event rule); no channel
//     laundering (scholar >80% of a villager-credited kill's fight damage)
//     armed <= control+2; wave-4 unlocks not reduced.
// Also reports: mechanism counters (did the discipline fire?), companion
// damage per wave-4 fight armed vs control, FEASTED-window attribution,
// and the wall numbers (national/table/wins, wave 4-5, median survival).
//
// Usage: node scripts/analyze-splitclose-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-22', 'perseed-splitclose');

const SEEDS = [65611, 65612, 65613, 65614, 65615, 65616, 65617, 65618];
const POLICIES = ['leadfeast', 'belongfeast'];

function load(arm) {
  const rows = [];
  for (const p of POLICIES) {
    const tag = arm === 'control' ? p : p + '-splitclose';
    for (const seed of SEEDS) {
      const fp = path.join(DIR, `${arm}-${tag}-s${seed}.json`);
      if (!fs.existsSync(fp)) throw new Error('missing sweep file: ' + fp);
      rows.push({ policy: p, seed, r: JSON.parse(fs.readFileSync(fp, 'utf8')) });
    }
  }
  return rows;
}
// Kill-time villager wave-4 kills in one config (the pre-registered rule:
// by != bearerAtKill && by != 'player').
function villagerKills(r) {
  return (r.w4killsDetail || []).filter(e => e.by && e.by !== 'player' && e.by !== e.bearerAtKill);
}
// TRICKTAG cross-check: companion landed the killing blow (via='companion').
function tricktagKills(r) {
  return (r.w4killRows || []).filter(k => k.via === 'companion');
}
// Damage-majority villager kills (non-scholar share >= 0.5).
function dmgMajKills(r) {
  return (r.w4killRows || []).filter(k => {
    if (k.via !== 'companion') return false;
    const tot = (k.dmgScholar | 0) + (k.dmgCompanion | 0) + (k.dmgOther | 0);
    if (tot <= 0) return false;
    return ((k.dmgCompanion | 0) + (k.dmgOther | 0)) / tot >= 0.5;
  });
}
// Laundered kills: villager-credited (kill-time) but scholar dealt >80%.
function launderedKills(r) {
  const out = [];
  for (const e of villagerKills(r)) {
    const row = (r.w4killRows || []).find(k => k.day === e.d && k.mid === e.mid && String(k.by) === String(e.by));
    if (!row) continue;
    const tot = (row.dmgScholar | 0) + (row.dmgCompanion | 0) + (row.dmgOther | 0);
    if (tot > 0 && (row.dmgScholar | 0) / tot > 0.8) out.push({ day: e.d, mid: e.mid, by: e.by, scholarShare: ((row.dmgScholar | 0) / tot).toFixed(2) });
  }
  return out;
}
function median(a) {
  if (!a.length) return null;
  const s = a.slice().sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const control = load('control'), armed = load('splitclose');
const bySeed = {};
for (const r of [...control, ...armed]) {
  const k = r.seed;
  bySeed[k] = bySeed[k] || { control: {}, armed: {} };
  const arm = control.includes(r) ? 'control' : 'armed';
  bySeed[k][arm][r.policy] = r.r;
}

console.log('=== sim-splitclose pilot: pre-registered judge ===\n');

// PRIMARY
let armedSeeds = 0, controlSeeds = 0;
const armedSeedList = [], controlSeedList = [];
for (const seed of SEEDS) {
  const ac = Object.values(bySeed[seed].armed).some(r => villagerKills(r).length >= 1);
  const cc = Object.values(bySeed[seed].control).some(r => villagerKills(r).length >= 1);
  if (ac) { armedSeeds++; armedSeedList.push(seed); }
  if (cc) { controlSeeds++; controlSeedList.push(seed); }
}
const armedKillTotal = armed.reduce((t, r) => t + villagerKills(r.r).length, 0);
const controlKillTotal = control.reduce((t, r) => t + villagerKills(r.r).length, 0);
console.log(`PRIMARY (binding): kill-time villager wave-4 kills`);
console.log(`  armed seeds with >=1: ${armedSeeds}/8 [${armedSeedList.join(',')}] (bar >=2/8)`);
console.log(`  control seeds with >=1: ${controlSeeds}/8 [${controlSeedList.join(',')}]`);
console.log(`  armed kill total: ${armedKillTotal} vs control ${controlKillTotal} (bar >= control+2 = ${controlKillTotal + 2})`);
const primaryGo = armedSeeds >= 2 && armedKillTotal >= controlKillTotal + 2;
console.log(`  VERDICT: ${primaryGo ? 'GO' : 'NO-GO'}`);

// Per-seed detail
console.log('\nPer-seed kill-time villager kills (armed vs control):');
for (const seed of SEEDS) {
  const a = Object.entries(bySeed[seed].armed).map(([p, r]) => `${p}:${villagerKills(r).length}`).join(' ');
  const c = Object.entries(bySeed[seed].control).map(([p, r]) => `${p}:${villagerKills(r).length}`).join(' ');
  console.log(`  s${seed}  armed[${a}]  control[${c}]`);
}

// SECONDARY: damage-majority
const armedDM = armed.reduce((t, r) => t + dmgMajKills(r.r).length, 0);
const controlDM = control.reduce((t, r) => t + dmgMajKills(r.r).length, 0);
const armedTT = armed.reduce((t, r) => t + tricktagKills(r.r).length, 0);
const controlTT = control.reduce((t, r) => t + tricktagKills(r.r).length, 0);
console.log(`\nSECONDARY (reported): damage-majority (non-scholar share>=0.5): armed=${armedDM} control=${controlDM}`);
console.log(`TRICKTAG cross-check (via=companion): armed=${armedTT} control=${controlTT}`);

// Laundering guardrail
const armedLaun = armed.reduce((t, r) => t + launderedKills(r.r).length, 0);
const controlLaun = control.reduce((t, r) => t + launderedKills(r.r).length, 0);
console.log(`\nLaundered kills (scholar>80% of a villager-credited kill): armed=${armedLaun} control=${controlLaun} (bar <= ${controlLaun + 2}) ${armedLaun <= controlLaun + 2 ? 'PASS' : 'FAIL'}`);

// FEASTED-window attribution (the drivenofeast honesty rule)
function feastedSplit(rows) {
  let f = 0, s = 0, u = 0;
  for (const r of rows) for (const k of tricktagKills(r.r)) {
    if (k.feasted === true) f++; else if (k.feasted === false) s++; else u++;
  }
  return { feasted: f, sober: s, unknown: u };
}
console.log('\nFEASTED-window attribution of TRICKTAG villager kills:');
console.log(`  armed: ${JSON.stringify(feastedSplit(armed))}  control: ${JSON.stringify(feastedSplit(control))}`);

// MECHANISM: did the discipline fire?
console.log('\nMECHANISM counters (armed arm, 16 configs):');
const scSum = {};
for (const r of armed) {
  for (const [k, v] of Object.entries(r.r.sc || {})) scSum[k] = (scSum[k] | 0) + (v | 0);
}
for (const [k, v] of Object.entries(scSum).sort()) console.log(`  ${k}: ${v}`);

// Companion damage per wave-4 fight
function compDmg(rows) {
  const out = [];
  for (const r of rows) for (const f of (r.r.w4FightDmg || [])) out.push(f.companion | 0);
  return out;
}
const acd = compDmg(armed), ccd = compDmg(control);
console.log(`\nCompanion damage per wave-4 fight: armed median=${median(acd)} mean=${(acd.reduce((a, b) => a + b, 0) / Math.max(1, acd.length)).toFixed(1)} (n=${acd.length})`);
console.log(`  control median=${median(ccd)} mean=${(ccd.reduce((a, b) => a + b, 0) / Math.max(1, ccd.length)).toFixed(1)} (n=${ccd.length})`);

// GUARDRAILS
console.log('\nGUARDRAILS:');
// scholar-combat-mortality/100d (paired)
const mortDiffs = [];
for (const seed of SEEDS) for (const p of POLICIES) {
  const a = bySeed[seed].armed[p], c = bySeed[seed].control[p];
  const am = (a.scholarCombatDeaths | 0) * 100 / Math.max(1, a.gameDays || 0);
  const cm = (c.scholarCombatDeaths | 0) * 100 / Math.max(1, c.gameDays || 0);
  mortDiffs.push(am - cm);
}
const mortMean = mortDiffs.reduce((x, y) => x + y, 0) / Math.max(1, mortDiffs.length);
console.log(`  scholar-combat-mortality/100d paired mean diff: ${mortMean.toFixed(2)} (bar <= +2) ${mortMean <= 2 ? 'PASS' : 'FAIL'}`);
// median survival (matched, non-winning)
const survDiffs = [];
for (const seed of SEEDS) for (const p of POLICIES) {
  const a = bySeed[seed].armed[p], c = bySeed[seed].control[p];
  if (a.won || c.won) continue;
  survDiffs.push((a.gameDays || 0) - (c.gameDays || 0));
}
const survMed = median(survDiffs);
console.log(`  median survival diff (non-winning matched, n=${survDiffs.length}): ${survMed} (bar >= -10) ${survMed >= -10 ? 'PASS' : 'FAIL'}`);
// starvation
const aStarv = armed.reduce((t, r) => t + (r.r.starvationDeaths | 0), 0);
const cStarv = control.reduce((t, r) => t + (r.r.starvationDeaths | 0), 0);
console.log(`  starvation deaths: armed=${aStarv} control=${cStarv} (bar <= ${cStarv + 2}) ${aStarv <= cStarv + 2 ? 'PASS' : 'FAIL'}`);
// new death mode
const aCauses = {}, cCauses = {};
for (const r of armed) for (const [k, v] of Object.entries(r.r.deathCauses || {})) aCauses[k] = (aCauses[k] | 0) + v;
for (const r of control) for (const [k, v] of Object.entries(r.r.deathCauses || {})) cCauses[k] = (cCauses[k] | 0) + v;
const newModes = Object.keys(aCauses).filter(k => (aCauses[k] | 0) >= 2 && !(cCauses[k] | 0));
console.log(`  new death modes (>=2 armed, 0 control): ${newModes.length ? newModes.join(', ') : 'none'} ${newModes.length ? 'FAIL' : 'PASS'}`);
// wave-4 unlocks
const aW4 = armed.filter(r => r.r.wave4).length, cW4 = control.filter(r => r.r.wave4).length;
console.log(`  wave-4 unlocks: armed=${aW4}/16 control=${cW4}/16 (not reduced) ${aW4 >= cW4 ? 'PASS' : 'FAIL'}`);

// WALL
console.log('\nWALL (per arm, 16 configs):');
for (const [label, rows] of [['control', control], ['splitclose', armed]]) {
  const nat = rows.filter(r => r.r.national).length;
  const tab = rows.filter(r => r.r.table).length;
  const won = rows.filter(r => r.r.won).length;
  const w4 = rows.filter(r => r.r.wave4).length;
  const w5 = rows.filter(r => r.r.wave5).length;
  const ex = rows.filter(r => r.r.exiled).length;
  const vets = rows.filter(r => (r.r.w5vetsMax | 0) >= 2).length;
  const surv = rows.map(r => r.r.gameDays || 0);
  console.log(`  ${label}: national=${nat} table=${tab} won=${won} wave4=${w4}/16 wave5=${w5}/16 exiled=${ex} w5vets2max=${vets}/16 medSurv=${median(surv)} maxSurv=${Math.max(...surv)}`);
}
// death-cause shares
console.log('\nDeath-cause shares (armed):');
const tot = Object.values(aCauses).reduce((x, y) => x + y, 0);
for (const [k, v] of Object.entries(aCauses).sort((a, b) => b[1] - a[1]).slice(0, 8))
  console.log(`  ${k}: ${v} (${(100 * v / Math.max(1, tot)).toFixed(1)}%)`);

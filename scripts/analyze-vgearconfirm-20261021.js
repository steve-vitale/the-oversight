#!/usr/bin/env node
// analyze-vgearconfirm-20261021.js — confirm analysis for sim-vgearconfirm.
//
// Reads evidence/2026-10-21/perseed-vgearconfirm/{control,vgear}-*.json
// and judges the pre-registered header (see evidence/2026-10-21/
// sim-vgearconfirm.md):
//   PRIMARY: seeds reaching w5vetsMax >= 2 — GO iff >= 2/16 armed seeds
//     AND armed seeds >= control seeds + 2.
//   SECONDARY: wall numbers (national/table/wins, wave-4/5 unlocks, median
//     survival, exiled); wave-4 kills via=villager (mechanism); w5vetsEnd;
//     armed/armored census; layer engagement; death-cause shares.
//   GUARDRAILS: villager combat deaths <= control*1.2; median survival >=
//     control-10d (per-seed matched on non-winning runs); starvation deaths
//     <= control; no new death mode (>=2 events); wins within +-4/16.
// Usage: node scripts/analyze-vgearconfirm-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-21', 'perseed-vgearconfirm');
const SEEDS = [64701, 64702, 64703, 64704, 64705, 64706, 64707, 64708, 64709, 64710, 64711, 64712, 64713, 64714, 64715, 64716];
const POLICIES = ['leadfeast', 'belongfeast'];

function load(arm) {
  const rows = [];
  for (const p of POLICIES) {
    const tag = arm === 'control' ? p : p + '-vgear';
    for (const seed of SEEDS) {
      const fp = path.join(DIR, `${arm}-${tag}-s${seed}.json`);
      if (!fs.existsSync(fp)) { console.error('MISSING sweep file: ' + fp); process.exit(2); }
      rows.push(JSON.parse(fs.readFileSync(fp, 'utf8')));
    }
  }
  return rows;
}
const control = load('control'), armed = load('vgear');

function sumDeaths(rows, pred) {
  let n = 0;
  for (const r of rows) for (const [k, v] of Object.entries(r.deathCauses || {})) if (pred(k)) n += v;
  return n;
}
const isVillCombat = k => /villager/i.test(k) && /combat|fight|battle|monster|raid/i.test(k);
const isStarv = k => /starv|hunger|famine/i.test(k);
function median(a) { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; }

// PRIMARY: per-seed w5vetsMax >= 2 (seed counts if EITHER config reaches it).
function seedsWithVets(rows) {
  const bySeed = {};
  for (const r of rows) { bySeed[r.seed] = bySeed[r.seed] || 0; if ((r.w5vetsMax | 0) >= 2) bySeed[r.seed] = 1; }
  return Object.entries(bySeed).filter(([, v]) => v).map(([s]) => +s);
}
function seedsWithVillagerW4(rows) {
  const bySeed = {};
  for (const r of rows) { bySeed[r.seed] = bySeed[r.seed] || 0; if (r.hasVillagerW4Kill) bySeed[r.seed] = 1; }
  return Object.entries(bySeed).filter(([, v]) => v).map(([s]) => +s);
}
const cVetSeeds = seedsWithVets(control), aVetSeeds = seedsWithVets(armed);
const cVillW4Seeds = seedsWithVillagerW4(control), aVillW4Seeds = seedsWithVillagerW4(armed);

const GO = aVetSeeds.length >= 2 && aVetSeeds.length >= cVetSeeds.length + 2;

// Guardrails.
const cVillD = sumDeaths(control, isVillCombat), aVillD = sumDeaths(armed, isVillCombat);
const cStarv = sumDeaths(control, isStarv), aStarv = sumDeaths(armed, isStarv);
// Median survival per-seed matched on non-winning runs (pre-registered).
function matchedMedian(rows) {
  const bySeed = {};
  for (const r of rows) { (bySeed[r.seed] = bySeed[r.seed] || []).push(r); }
  const vals = [];
  for (const s of SEEDS) {
    const rs = (bySeed[s] || []).filter(r => !r.won);
    if (rs.length) vals.push(median(rs.map(r => r.gameDays || 0)));
  }
  return median(vals);
}
const cMed = matchedMedian(control), aMed = matchedMedian(armed);
const cMax = Math.max(...control.map(r => r.gameDays || 0)), aMax = Math.max(...armed.map(r => r.gameDays || 0));
const cModes = new Set(), aModes = new Set();
for (const r of control) for (const k of Object.keys(r.deathCauses || {})) cModes.add(k);
for (const r of armed) for (const k of Object.keys(r.deathCauses || {})) aModes.add(k);
const newModes = [...aModes].filter(m => !cModes.has(m) && (armed.reduce((n, r) => n + ((r.deathCauses || {})[m] || 0), 0) >= 2));
const cWins = control.filter(r => r.won).length, aWins = armed.filter(r => r.won).length;
const guards = [
  ['villager combat deaths <= control*1.2', aVillD <= cVillD * 1.2, `${aVillD} vs ${cVillD}`],
  ['median survival (non-winning, per-seed matched) >= control-10d', aMed >= cMed - 10, `${aMed}d vs ${cMed}d`],
  ['starvation deaths <= control', aStarv <= cStarv, `${aStarv} vs ${cStarv}`],
  ['no new death mode (>=2 events)', newModes.length === 0, newModes.join(',') || 'none'],
  ['wins within +-4/16 of control', Math.abs(aWins - cWins) <= 4, `${aWins}/32 vs ${cWins}/32`],
];
const guardPass = guards.every(g => g[1]);

// Wall numbers.
function wall(rows) {
  return {
    runs: rows.length,
    national: rows.filter(r => r.national).length,
    table: rows.filter(r => r.table).length,
    wins: rows.filter(r => r.won).length,
    exiled: rows.filter(r => r.exiled).length,
    wave4: rows.filter(r => r.wave4).length,
    wave5: rows.filter(r => r.wave5).length,
    maxWaveDist: {},
    medianSurv: median(rows.map(r => r.gameDays || 0)),
    maxSurv: Math.max(...rows.map(r => r.gameDays || 0)),
  };
}
const wC = wall(control), wA = wall(armed);
for (const r of control) { wC.maxWaveDist[r.maxWave] = (wC.maxWaveDist[r.maxWave] || 0) + 1; }
for (const r of armed) { wA.maxWaveDist[r.maxWave] = (wA.maxWaveDist[r.maxWave] || 0) + 1; }

// Mechanism + layer engagement.
function mechanism(rows) {
  return {
    w4kills: rows.reduce((n, r) => n + (r.w4kills | 0), 0),
    villW4: rows.reduce((n, r) => n + (r.w4villagerKills | 0), 0),
    compW4: rows.reduce((n, r) => n + (r.w4companionKills | 0), 0),
    runsWithVillW4: rows.filter(r => r.hasVillagerW4Kill).length,
    donations: rows.reduce((n, r) => n + (r.donations | 0), 0),
    invites: rows.reduce((n, r) => n + (r.invites | 0), 0),
    armedV: +(rows.reduce((n, r) => n + (r.armedVillagers | 0), 0) / rows.length).toFixed(2),
    armP10: +(rows.reduce((n, r) => n + (r.armoredVillagersP10 | 0), 0) / rows.length).toFixed(2),
    armP15: +(rows.reduce((n, r) => n + (r.armoredVillagersP15 | 0), 0) / rows.length).toFixed(2),
  };
}
const mC = mechanism(control), mA = mechanism(armed);

function shares(rows) {
  const dc = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deathCauses || {})) dc[k] = (dc[k] || 0) + v;
  const tot = Object.values(dc).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(dc).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k}:${v}(${(100 * v / tot).toFixed(0)}%)`).join(' ');
}

const out = {
  verdict: { GO, guardPass, killedAtConfirm: !GO },
  primary: {
    bar: '>= 2/16 armed seeds AND armed >= control + 2',
    armedSeeds: aVetSeeds, controlSeeds: cVetSeeds,
    armedRunsVetsMax2: armed.filter(r => (r.w5vetsMax | 0) >= 2).map(r => `s${r.seed}/${r.policy}`),
    controlRunsVetsMax2: control.filter(r => (r.w5vetsMax | 0) >= 2).map(r => `s${r.seed}/${r.policy}`),
  },
  guardrails: guards.map(g => ({ name: g[0], pass: g[1], detail: g[2] })),
  mechanism: { control: mC, armed: mA },
  mechanismSeeds: { villW4control: cVillW4Seeds, villW4armed: aVillW4Seeds },
  wall: { control: wC, armed: wA },
  deathShares: { control: shares(control), armed: shares(armed) },
  instrumentErrors: control.reduce((n, r) => n + (r.instrumentErrors || []).length, 0) + armed.reduce((n, r) => n + (r.instrumentErrors || []).length, 0),
};

console.log(JSON.stringify(out, null, 1));
fs.writeFileSync(path.join(DIR, '_analysis.json'), JSON.stringify(out, null, 1) + '\n');
console.log('\n=== PRIMARY: seeds with w5vetsMax>=2 ===');
console.log(`control: ${cVetSeeds.length}/16 ${JSON.stringify(cVetSeeds)}`);
console.log(`armed:   ${aVetSeeds.length}/16 ${JSON.stringify(aVetSeeds)}`);
console.log(`GO (>=2/16 AND armed>=control+2): ${GO ? 'GO' : 'NO-GO'}`);
console.log('\n=== GUARDRAILS ===');
for (const g of guards) console.log(`${g[1] ? 'PASS' : 'MISS'} ${g[0]} (${g[2]})`);
console.log('\n=== WALL NUMBERS ===');
console.log(`control: national ${wC.national}/32 table ${wC.table}/32 wins ${wC.wins}/32 exiled ${wC.exiled}/32 wave4 ${wC.wave4}/32 wave5 ${wC.wave5}/32 median ${wC.medianSurv}d max ${wC.maxSurv}d`);
console.log(`armed:   national ${wA.national}/32 table ${wA.table}/32 wins ${wA.wins}/32 exiled ${wA.exiled}/32 wave4 ${wA.wave4}/32 wave5 ${wA.wave5}/32 median ${wA.medianSurv}d max ${wA.maxSurv}d`);
console.log('\n=== MECHANISM (vgear proven metric) ===');
console.log(`control: w4kills ${mC.w4kills} villW4 ${mC.villW4} compW4 ${mC.compW4} don ${mC.donations} inv ${mC.invites} armedV ${mC.armedV}`);
console.log(`armed:   w4kills ${mA.w4kills} villW4 ${mA.villW4} compW4 ${mA.compW4} don ${mA.donations} inv ${mA.invites} armedV ${mA.armedV}`);
console.log(`instrument errors: ${out.instrumentErrors}`);

#!/usr/bin/env node
// analyze-armored15-confirm.js — sim-armored15-confirm CONFIRM analysis.
// Reads evidence/2026-10-23/perseed-armored15-confirm/{control,armed}/*.json,
// judges the pre-registered primary + engagement + guardrails, prints verdict.
//
// PRIMARY (binding): armored15 median-of-medians armed >= control + 0.5.
// ENGAGEMENT (binding): deposits>=2 on >=6/8 armed seeds;
//   equipped-from-structure>=2 on >=6/8 armed seeds.
// GO = primary + engagement + all guardrails pass.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-23', 'perseed-armored15-confirm');

function load(arm) {
  const d = path.join(DIR, arm);
  return fs.readdirSync(d).filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(d, f), 'utf8')));
}
function median(xs) {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : null;
}

const control = load('control');
const armed = load('armed');
console.log(`configs: control ${control.length}, armed ${armed.length}`);

// anchors: all per-seed JSONs must share one anchorCommit (stale-base lesson)
const anchors = new Set([...control, ...armed].map(r => r.anchorCommit));
console.log(`anchorCommit(s): ${[...anchors].join(', ')}${anchors.size === 1 ? ' (single, clean)' : '  *** MULTI-ANCHOR ***'}`);

function bySeed(rows) {
  const m = {};
  for (const r of rows) {
    const k = r.seed;
    m[k] = m[k] || { seed: k, deposits: 0, equipped: 0, crafts: 0, armMeds: [] };
    m[k].deposits = Math.max(m[k].deposits, r.deposits);
    m[k].equipped = Math.max(m[k].equipped, r.equippedFromStructure);
    m[k].crafts = Math.max(m[k].crafts, r.crafts);
    if (r.medDailyArmored15 != null) m[k].armMeds.push(r.medDailyArmored15);
  }
  return Object.values(m).map(s => Object.assign(s, { armMed: median(s.armMeds) }));
}

const cSeeds = bySeed(control), aSeeds = bySeed(armed);

// PRIMARY
const cMed = median(cSeeds.map(s => s.armMed).filter(x => x != null));
const aMed = median(aSeeds.map(s => s.armMed).filter(x => x != null));
const primaryOK = aMed != null && cMed != null && aMed >= cMed + 0.5;
console.log(`PRIMARY armored15 median-of-medians: control ${cMed}, armed ${aMed} (bar armed >= control+0.5) ${primaryOK ? 'PASS' : 'FAIL'}`);
console.log('  per-seed armored15 medians (control):', JSON.stringify(cSeeds.map(s => s.armMed)));
console.log('  per-seed armored15 medians (armed):  ', JSON.stringify(aSeeds.map(s => s.armMed)));

// ENGAGEMENT (armed, per seed, n = armed seeds)
const bar1 = aSeeds.filter(s => s.deposits >= 2).length;
const bar2 = aSeeds.filter(s => s.equipped >= 2).length;
const bar3 = aSeeds.filter(s => s.crafts >= 1).length; // recorded, not binding (pre-reg)
console.log(`ENGAGEMENT (armed, per seed, n=${aSeeds.length}):`);
console.log(`  (1) deposits>=2: ${bar1}/${aSeeds.length} ${bar1 >= 6 ? 'PASS' : 'FAIL'}`);
console.log(`  (2) equipped-from-structure>=2: ${bar2}/${aSeeds.length} ${bar2 >= 6 ? 'PASS' : 'FAIL'}`);
console.log(`  (3) crafts>=1 (informational, pilot-documented starved): ${bar3}/${aSeeds.length}`);

// GUARDRAILS — paired (seed x policy) comparisons
const key = r => `${r.seed}|${r.policy}`;
const cByKey = Object.fromEntries(control.map(r => [key(r), r]));
const diffs = armed.map(r => cByKey[key(r)] ? r.days - cByKey[key(r)].days : null).filter(x => x != null);
const medPairedDiff = median(diffs);
console.log(`guardrail paired median survival diff (armed-control): ${medPairedDiff}d (bar within +-10d) ${Math.abs(medPairedDiff) <= 10 ? 'PASS' : 'FAIL'}`);
const cDays = median(control.map(r => r.days)), aDays = median(armed.map(r => r.days));
console.log(`  (informational unpaired medians: control ${cDays}d armed ${aDays}d; pilot showed symmetric chaos tails)`);
const cStarv = control.reduce((s, r) => s + r.starvDeaths, 0), aStarv = armed.reduce((s, r) => s + r.starvDeaths, 0);
console.log(`guardrail starvation: control ${cStarv} armed ${aStarv} (bar armed <= control+2) ${aStarv <= cStarv + 2 ? 'PASS' : 'FAIL'}`);
const causeShare = (rows) => {
  const by = {};
  for (const r of rows) for (const d of r.deaths) {
    const k = String(d.cause || 'unknown').slice(0, 40);
    by[k] = (by[k] || 0) + 1;
  }
  return by;
};
const cc = causeShare(control), ac = causeShare(armed);
const totC = Object.values(cc).reduce((a, b) => a + b, 0), totA = Object.values(ac).reduce((a, b) => a + b, 0);
let shareOK = true;
for (const [k, v] of Object.entries(ac)) {
  const cs = totC ? (cc[k] || 0) / totC : 0, as = totA ? v / totA : 0;
  if (cs > 0 && as > 2 * cs) { shareOK = false; console.log(`  share spike: ${k} control ${(cs * 100).toFixed(1)}% -> armed ${(as * 100).toFixed(1)}%`); }
}
console.log(`guardrail death-cause shares sane (no cause >2x control share): ${shareOK ? 'PASS' : 'FAIL'}`);
const cKinds = new Set(control.flatMap(r => r.deaths.map(d => String(d.kind || '?'))));
const armedKindCounts = {};
for (const r of armed) for (const d of r.deaths) {
  const k = String(d.kind || '?');
  if (!cKinds.has(k)) armedKindCounts[k] = (armedKindCounts[k] || 0) + 1;
}
const newKinds = Object.entries(armedKindCounts).filter(([, n]) => n >= 2).map(([k]) => k);
console.log(`guardrail new death modes (armed-only, >=2 events): ${newKinds.length ? JSON.stringify(newKinds) + ' FAIL' : 'none PASS'}`);

// WALL BLOCK (standing directive — recorded, both arms)
function wall(rows) {
  return {
    n: rows.length,
    national: rows.reduce((s, r) => s + (r.national | 0), 0),
    nationalEver: rows.reduce((s, r) => s + (r.nationalEver | 0), 0),
    table: rows.reduce((s, r) => s + (r.table | 0), 0),
    wins: rows.reduce((s, r) => s + (r.wins | 0), 0),
    wave4: rows.reduce((s, r) => s + (r.wave4 | 0), 0),
    wave5: rows.reduce((s, r) => s + (r.wave5 | 0), 0),
    medDays: median(rows.map(r => r.days)),
  };
}
const wc = wall(control), wa = wall(armed);
const wallLine = w => `n=${w.n} national ${w.national}/${w.nationalEver}Ever table ${w.table} wins ${w.wins} wave4 ${w.wave4} wave5 ${w.wave5} medSurv ${w.medDays}d`;
console.log(`WALL control: ${wallLine(wc)}`);
console.log(`WALL armed:   ${wallLine(wa)}`);

const primaryGO = primaryOK && bar1 >= 6 && bar2 >= 6 && Math.abs(medPairedDiff) <= 10
  && aStarv <= cStarv + 2 && newKinds.length === 0 && shareOK && anchors.size === 1;
console.log(`\nPRIMARY VERDICT: ${primaryGO ? 'GO' : 'NO-GO'}`);
console.log(JSON.stringify({ primaryOK, bar1, bar2, medPairedDiff, cStarv, aStarv, newKinds, shareOK, wallControl: wc, wallArmed: wa }, null, 1));

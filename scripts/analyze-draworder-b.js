#!/usr/bin/env node
// analyze-draworder-b.js — judge the sim-draworder-b arm against its
// pre-registered thresholds. Reads the per-seed corpora and prints the
// verdict. Usage: node scripts/analyze-draworder-b.js
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'evidence', '2026-10-21', 'perseed-draworder-b');
// Fast-rot kcal (pre-registered): ALL rot kcal attributed to the engine's
// fresh funnels (stockPantry + stockSurplus writes) — the perishable rung
// this draw-order lever targets. 'other-path' (hierarchy long-clock writers,
// pantryAdd finished goods) is excluded: the lever cannot touch it.
const FAST_CLASSES = ['pantry-coarse', 'pantry-base', 'pantry-clock6', 'pantry-cap', 'surplus-3d'];

function load(policy, arm) {
  const f = path.join(DIR, `${policy}-${arm}.json`);
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}
function fastRot(row) {
  const rc = (row.end.rd || {}).rotClass || {};
  return FAST_CLASSES.reduce((t, c) => t + (rc[c] || 0), 0);
}
function median(xs) { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }

const POLICIES = ['leadfeast', 'belongfeast'];
const corp = {};
for (const p of POLICIES) for (const a of ['control', 'armed']) corp[`${p}-${a}`] = load(p, a);

const out = { primary: {}, guardrails: {}, wall: {} };
const lines = [];
const push = l => lines.push(l);

// ---- PRIMARY: pooled fast-rot kcal ratio (armed/control) <= 0.80x ----
let armedP = 0, controlP = 0;
for (const p of POLICIES) {
  let a = 0, c = 0;
  const paired = [];
  const cm = new Map(corp[`${p}-control`].rows.map(r => [r.seed, r]));
  for (const r of corp[`${p}-armed`].rows) {
    const cr = cm.get(r.seed);
    if (!cr) continue;
    const ra = fastRot(r), rc = fastRot(cr);
    a += ra; c += rc;
    paired.push(rc > 0 ? ra / rc : null);
  }
  armedP += a; controlP += c;
  const ratio = c > 0 ? a / c : null;
  const medPair = median(paired.filter(x => x != null));
  out.primary[p] = { armedKcal: Math.round(a), controlKcal: Math.round(c), ratio, medPairedRatio: medPair };
  push(`${p}: fast-rot armed=${Math.round(a / 1000)}k control=${Math.round(c / 1000)}k ratio=${ratio == null ? '?' : ratio.toFixed(3)} (median paired ${medPair == null ? '?' : medPair.toFixed(3)})`);
}
const pooledRatio = controlP > 0 ? armedP / controlP : null;
out.primary.pooled = { armedKcal: Math.round(armedP), controlKcal: Math.round(controlP), ratio: pooledRatio };
push(`POOLED fast-rot: armed=${Math.round(armedP / 1000)}k control=${Math.round(controlP / 1000)}k ratio=${pooledRatio == null ? '?' : pooledRatio.toFixed(3)} (GO bar <= 0.80x)`);

// ---- GUARDRAILS ----
const guard = [];
function gr(name, ok, detail) { guard.push({ name, ok, detail }); push(`  ${ok ? 'PASS' : 'FAIL'} ${name}: ${detail}`); }
push('GUARDRAILS:');
let starvA = 0, starvC = 0, natA = 0, natC = 0;
const daysA = [], daysC = [], causeA = new Set(), causeC = new Set();
for (const p of POLICIES) {
  for (const r of corp[`${p}-armed`].rows) {
    starvA += r.end.starvationDeaths || 0; if (r.end.national) natA++;
    daysA.push(r.end.days); for (const d of r.end.deaths || []) causeA.add(d.cause);
  }
  for (const r of corp[`${p}-control`].rows) {
    starvC += r.end.starvationDeaths || 0; if (r.end.national) natC++;
    daysC.push(r.end.days); for (const d of r.end.deaths || []) causeC.add(d.cause);
  }
}
gr('starvation deaths <= control+1', starvA <= starvC + 1, `armed=${starvA} control=${starvC}`);
gr('median survival >= control-10d', median(daysA) >= median(daysC) - 10,
  `armed=${median(daysA).toFixed(0)}d control=${median(daysC).toFixed(0)}d`);
gr('national >= control-2', natA >= natC - 2, `armed=${natA} control=${natC}`);
const newCauses = [...causeA].filter(c => !causeC.has(c));
gr('no new death modes', newCauses.length === 0, newCauses.length ? newCauses.join(', ') : `causes seen: ${[...causeA].slice(0, 8).join(', ')}...`);
out.guardrails = { starvA, starvC, medDaysA: median(daysA), medDaysC: median(daysC), natA, natC, newCauses };

// ---- WALL ----
push('WALL (armed vs control):');
let winsA = 0, winsC = 0, tabA = 0, tabC = 0, w4A = 0, w4C = 0, w5A = 0, w5C = 0;
for (const p of POLICIES) {
  for (const r of corp[`${p}-armed`].rows) { winsA += r.end.wins; if (r.end.table) tabA++; if (r.end.maxWave >= 4) w4A++; if (r.end.maxWave >= 5) w5A++; }
  for (const r of corp[`${p}-control`].rows) { winsC += r.end.wins; if (r.end.table) tabC++; if (r.end.maxWave >= 4) w4C++; if (r.end.maxWave >= 5) w5C++; }
}
push(`  national: armed=${natA} control=${natC} | table: armed=${tabA} control=${tabC} | wins: armed=${winsA} control=${winsC}`);
push(`  wave4+: armed=${w4A} control=${w4C} | wave5: armed=${w5A} control=${w5C} | median survival: armed=${median(daysA).toFixed(0)}d control=${median(daysC).toFixed(0)}d`);
out.wall = { natA, natC, tabA, tabC, winsA, winsC, w4A, w4C, w5A, w5C };

// ---- VERDICT ----
const primaryGO = pooledRatio != null && pooledRatio <= 0.80;
const guardGO = guard.every(g => g.ok);
out.verdict = primaryGO && guardGO ? 'GO' : 'NO-GO';
push(`\nVERDICT: ${out.verdict} (primary ${primaryGO ? 'met' : 'MISSED'}, guardrails ${guardGO ? 'pass' : 'FAILED'})`);
const o = path.join(DIR, 'analysis-draworder-b.json');
fs.writeFileSync(o, JSON.stringify(out, null, 2) + '\n');
console.log(lines.join('\n'));
console.log('wrote ' + o);

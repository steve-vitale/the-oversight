#!/usr/bin/env node
// scripts/analyze-cookbulk-b3.js — paired analysis for the sim-cookbulk-b3 pilot.
//
// Reads evidence/2026-10-19/perseed-cookbulk-b3/, prints:
//   - PRIMARY: mean cooked kcal/side (bar >= 20k) vs control ~0
//   - CO-PRIMARY: median survival armed vs control (bar >= control-10d)
//   - survival attribution: per-pair deltas + Pearson(waterDrawnL, survivalDelta)
//     + rationed-days armed vs control (the b2 -46d mechanism test)
//   - guardrails: starvation deaths, national, new death modes
//
// Usage: node scripts/analyze-cookbulk-b3.js
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-cookbulk-b3');
const SEEDS = [94101, 94102, 94103, 94104, 94105, 94106, 94107, 94108];
const POLICIES = ['leadfeast', 'belongfeast'];

const load = (arm, p, s) => JSON.parse(fs.readFileSync(path.join(DIR, `${arm}-${p}-s${s}.json`), 'utf8'));
const median = (v) => { const a = v.slice().sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : 0; };
const mean = (v) => v.length ? v.reduce((t, x) => t + x, 0) / v.length : 0;
function pearson(xs, ys) {
  const n = xs.length;
  if (n < 3) return null;
  const mx = mean(xs), my = mean(ys);
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; }
  return (sxx > 0 && syy > 0) ? sxy / Math.sqrt(sxx * syy) : null;
}

const pairs = [];
for (const p of POLICIES) for (const s of SEEDS) {
  const c = load('control', p, s), b = load('b3', p, s);
  pairs.push({
    key: `${p}-s${s}`,
    cooked: b.cookedKcal || 0, cookDays: b.cookDays || 0,
    waterL: b.waterDrawnL || 0,
    dSurv: (b.days || 0) - (c.days || 0),
    dGame: (b.gameDays || 0) - (c.gameDays || 0),
    dRationed: (b.rationedDays || 0) - (c.rationedDays || 0),
    dStarvD: (b.starvationDeaths || 0) - (c.starvationDeaths || 0),
    bDays: b.days || 0, cDays: c.days || 0,
    bNat: b.national || 0, cNat: c.national || 0,
  });
}

const armed = pairs.map(x => x.bDays), ctrl = pairs.map(x => x.cDays);
console.log('=== PRIMARY: cooked kcal/side ===');
console.log(`  b3 mean cookedKcal/side = ${Math.round(mean(pairs.map(x => x.cooked)))} (bar >= 20000)`);
console.log(`  b3 mean cookDays/side = ${mean(pairs.map(x => x.cookDays)).toFixed(1)}`);
console.log(`  per-side: ${pairs.map(x => `${x.key}:${Math.round(x.cooked)}`).join(' ')}`);
console.log('=== CO-PRIMARY: survival ===');
console.log(`  median survival b3=${median(armed)}d vs control=${median(ctrl)}d (bar >= control-10d)`);
console.log(`  per-pair survival deltas (b3-control): ${pairs.map(x => `${x.key}:${x.dSurv}`).join(' ')}`);
console.log('=== survival attribution (the -46d mechanism test) ===');
const r = pearson(pairs.map(x => x.waterL), pairs.map(x => -x.dSurv));
console.log(`  Pearson(waterDrawnL, survivalLoss) = ${r == null ? 'n/a' : r.toFixed(2)} (mechanism predicts positive)`);
console.log(`  mean waterDrawnL/side = ${mean(pairs.map(x => x.waterL)).toFixed(1)}`);
console.log(`  rationed-days delta/side (b3-control): ${pairs.map(x => `${x.key}:${x.dRationed}`).join(' ')}`);
console.log(`  mean rationed delta = ${mean(pairs.map(x => x.dRationed)).toFixed(1)}d`);
console.log('=== guardrails ===');
const starvB = pairs.reduce((t, x) => t + 0, 0);
const bStarv = SEEDS.flatMap(s => POLICIES.map(p => load('b3', p, s).starvationDeaths || 0)).reduce((a, b) => a + b, 0);
const cStarv = SEEDS.flatMap(s => POLICIES.map(p => load('control', p, s).starvationDeaths || 0)).reduce((a, b) => a + b, 0);
console.log(`  starvation deaths: b3=${bStarv} control=${cStarv} (bar b3 <= control+2)`);
const bNat = pairs.reduce((t, x) => t + x.bNat, 0), cNat = pairs.reduce((t, x) => t + x.cNat, 0);
console.log(`  national: b3=${bNat}/16 control=${cNat}/16 (bar b3 >= control-2)`);
const causes = {};
for (const p of POLICIES) for (const s of SEEDS) {
  const b = load('b3', p, s);
  for (const [k, v] of Object.entries(b.causeCounts || {})) causes[k] = (causes[k] || 0) + v;
}
console.log('  b3 death causes:', JSON.stringify(causes));

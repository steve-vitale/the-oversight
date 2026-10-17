#!/usr/bin/env node
// landing-r21-analyze.js — computes the r19 binding metrics V1'..V6 from the
// r21 census JSONs. Mirrors the r19 note's metric definitions.
'use strict';
const fs = require('fs'), path = require('path');
const DIR = process.argv[2] || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-17/landing-r21';
const seeds = [80, 81, 82, 83];
const verdicts = {};
for (const s of seeds) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, `journey-landing-r18-census-${s}.json`), 'utf8'));
  const per = (d.villageAutonomy && d.villageAutonomy.perVillager) || [];
  // V1' autonomy (corrected denominator): every living non-bearer-day villager
  // passes; hunger>90 villager-days < 10%.
  const lows = per.filter(p => !p.v1Pass);
  const v1 = lows.length === 0;
  // V2 work: villager production covers >=40% of 14-day kcal draw.
  // Approximation from the r19 note: per-villager produced vs expected effort.
  const prod = per.filter(p => p.v1Denom > 0);
  const selfSuff = prod.length ? prod.reduce((t, p) => t + p.produced, 0) / prod.reduce((t, p) => t + p.expected, 0) : 0;
  const v2 = selfSuff >= 0.40;
  // V3 structure: >=1 trust>=40 villager, favor instance, or moot.
  const ss = d.socialStructure || {};
  const v3 = ((ss.trustPairs40 || []).length >= 1) || (ss.favorInstances || 0) >= 1 || (ss.mootConvened || 0) >= 1;
  // V5' regression pieces computable here: names known pre-System (day<=7).
  const nbd = d.namesKnownByDay || [];
  const namesPre = nbd.reduce((m, e) => (e && e.day <= 7 ? Math.max(m, e.n || 0) : m), 0);
  const alive = (d.census || []).filter(r => r.alive).length;
  const v6 = alive >= 6 && !d.overAt; // village alive at day 14 (not scattered)
  const v5names = namesPre >= 6;
  verdicts[s] = { v1, v1Lows: lows.map(p => p.name), v2, selfSuff: +selfSuff.toFixed(2),
    v3, trustPairs40: (ss.trustPairs40 || []).length, favors: ss.favorInstances || 0, moots: ss.mootConvened || 0,
    v5names, namesPreSystem: namesPre, v6, alive, systemDay: d.systemDay, overAt: d.overAt };
}
console.log(JSON.stringify(verdicts, null, 1));
const go = (k, gate) => { const n = seeds.filter(s => verdicts[s][k]).length; return { gate, hit: n, GO: n >= gate }; };
console.log('\nGATES:', JSON.stringify({
  V1: go('v1', 3), V2: go('v2', 3), V3: go('v3', 3),
  V5names: go('v5names', 3), V6: go('v6', 4),
}, null, 1));

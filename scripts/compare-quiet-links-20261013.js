#!/usr/bin/env node
// scripts/compare-quiet-links-20261013.js — baseline vs after comparison for
// the quiet-links lever. Pairs rows by (policy, seed); verifies game
// outcomes identical; measures internal linkWith+switchboard verb counts and
// the guardrails (linksSeasonedEver, linksGoodEver ±10%; deliberate/day).
// Usage: node scripts/compare-quiet-links-20261013.js
'use strict';
const base = require('../evidence/2026-10-13/sim-quiet-links-baseline.json');
const after = require('../evidence/2026-10-13/sim-quiet-links-after.json');
const B = Array.isArray(base) ? base : base.rows;
const A = Array.isArray(after) ? after : after.rows;
const key = r => r.policy + '/s' + r.seed;
const am = new Map(A.map(r => [key(r), r]));

const OUTCOME_FIELDS = ['days', 'endReason', 'linksProposed', 'linksAccepted',
  'linksSeasonedEver', 'linksGoodEver', 'nationalFirstDay', 't4Day', 't5Day',
  'wave4Day', 'wave5Day'];
const j = v => JSON.stringify(v === undefined ? null : v);
let mismatches = 0, pairs = 0;
let bIntLW = 0, bIntSW = 0, aIntLW = 0, aIntSW = 0;
let bDelib = [], aDelib = [];
let bSeas = 0, aSeas = 0, bGood = 0, aGood = 0;

for (const b of B) {
  const a = am.get(key(b));
  if (!a) { console.log('MISSING after-row for', key(b)); mismatches++; continue; }
  pairs++;
  for (const f of OUTCOME_FIELDS) {
    const bv = f === 'endReason' ? b[f] : j(b[f]);
    const av = f === 'endReason' ? a[f] : j(a[f]);
    // waveKills compared separately (object)
    if (String(bv) !== String(av)) { console.log(`OUTCOME-DIFF ${key(b)}.${f}: base=${bv} after=${av}`); mismatches++; }
  }
  if (j(b.waveKills) !== j(a.waveKills)) { console.log(`OUTCOME-DIFF ${key(b)}.waveKills`); mismatches++; }
  const bib = (b.pacing && b.pacing.internalByVerb) || {};
  const aib = (a.pacing && a.pacing.internalByVerb) || {};
  bIntLW += bib.linkWith || 0; bIntSW += bib.switchboard || 0;
  aIntLW += aib.linkWith || 0; aIntSW += aib.switchboard || 0;
  bDelib.push((b.pacing || {}).medianDeliberatePerDay || 0);
  aDelib.push((a.pacing || {}).medianDeliberatePerDay || 0);
  bSeas += b.linksSeasonedEver || 0; aSeas += a.linksSeasonedEver || 0;
  bGood += b.linksGoodEver || 0; aGood += a.linksGoodEver || 0;
}
const med = v => { v = v.slice().sort((x, y) => x - y); return v.length ? v[Math.floor(v.length / 2)] : 0; };
const bInt = bIntLW + bIntSW, aInt = aIntLW + aIntSW;
console.log(`pairs: ${pairs}/32, outcome mismatches: ${mismatches}`);
console.log(`internal linkWith+switchboard: baseline ${bInt} (${bIntLW}+${bIntSW}) -> after ${aInt} (${aIntLW}+${aIntSW})`);
console.log(`  reduction: ${bInt ? ((1 - aInt / bInt) * 100).toFixed(1) : 'n/a'}%`);
console.log(`linksSeasonedEver: ${bSeas} -> ${aSeas} (${bSeas ? (((aSeas - bSeas) / bSeas) * 100).toFixed(1) : 'n/a'}%)`);
console.log(`linksGoodEver: ${bGood} -> ${aGood} (${bGood ? (((aGood - bGood) / bGood) * 100).toFixed(1) : 'n/a'}%)`);
console.log(`median deliberate/day: ${med(bDelib)} -> ${med(aDelib)}`);
console.log(`mean deliberate/day: ${(bDelib.reduce((t, v) => t + v, 0) / Math.max(1, bDelib.length)).toFixed(1)} -> ${(aDelib.reduce((t, v) => t + v, 0) / Math.max(1, aDelib.length)).toFixed(1)}`);
process.exit(mismatches ? 1 : 0);

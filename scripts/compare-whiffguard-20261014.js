#!/usr/bin/env node
// Compares whiffguard sweep outputs: A1 vs A2 (noise floor), A1 vs B (effect).
// Usage: node scripts/compare-whiffguard-20261014.js
'use strict';
const fs = require('fs');
const path = '/tmp/wg';

const seeds = [11, 22, 33, 44, 55, 66, 77, 88];
const pols = ['leadcourt', 'belongseek'];

function load(f) {
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); }
  catch (e) { return null; }
}
function canonStr(o) {
  if (!o) return null;
  const c = Object.assign({}, o);
  delete c.guard; // metadata, not trajectory
  return JSON.stringify(c);
}

let aaSame = 0, aaDiff = 0, abSame = 0, abDiff = 0, stalled = [];
const rows = [];
for (const pol of pols) {
  for (const seed of seeds) {
    const a1 = load(`${path}/a1-${pol}-${seed}.json`);
    const a2 = load(`${path}/a2-${pol}-${seed}.json`);
    const b = load(`${path}/b-${pol}-${seed}.json`);
    const s1 = canonStr(a1), s2 = canonStr(a2), sb = canonStr(b);
    let aa, ab;
    if (!s1 || !s2) { aa = 'MISSING/STALL'; }
    else if (s1 === s2) { aa = 'identical'; aaSame++; }
    else { aa = 'DIVERGE'; aaDiff++; }
    if (!s1) { ab = 'A1-STALL'; stalled.push(`${pol}/${seed}/a1`); }
    else if (!sb) { ab = 'B-STALL'; stalled.push(`${pol}/${seed}/b`); }
    else if (s1 === sb) { ab = 'identical'; abSame++; }
    else { ab = 'DIVERGE'; abDiff++; }
    rows.push({ pol, seed, aa, ab,
      a1days: a1 ? a1.days : null, bdays: b ? b.days : null,
      a1end: a1 ? a1.endReason : null, bend: b ? b.endReason : null });
  }
}
console.log('seed/pol: A1vsA2 (noise) | A1vsB (effect) | days a1->b | endReason a1->b');
for (const r of rows) {
  console.log(`${r.pol}/${r.seed}: ${r.aa} | ${r.ab} | ${r.a1days}->${r.bdays} | ${r.a1end}->${r.bend}`);
}
console.log(`\nA/A identical: ${aaSame}/16, diverged: ${aaDiff}/16`);
console.log(`A1/B identical: ${abSame}/16, diverged: ${abDiff}/16`);
if (stalled.length) console.log('stalled/missing: ' + stalled.join(', '));

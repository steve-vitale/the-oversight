#!/usr/bin/env node
// Det-gate adjudicator for THROTTLEBEAT (2026-10-14).
// Compares per-seed JSONs: before (pristine) vs after (patched) vs aa
// (patched rerun). The change is narration + counter ONLY, so EVERY
// gameplay field must be identical across all three legs except
// throttleExemptDepth (the new counter — present only after/aa).
// Usage: node scripts/detgate-throttlebeat-20261014.js
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = 'evidence/2026-10-14';
const PERSEED = { before: 'throttlebeat-before-perseed', after: 'throttlebeat-after-perseed', aa: 'throttlebeat-aa-perseed' };
const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const POLICIES = ['leadcourt', 'belongseek'];

// fields allowed to differ: the new counter (absent on pristine), and
// nothing else. 'deaths' compared via JSON key-sort.
const SKIP = new Set(['throttleExemptDepth']);

function load(side, pid, seed) {
  const f = path.join(DIR, PERSEED[side], `throttlebeat-${side}-${pid}-s${seed}.json`);
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

function canon(obj) {
  if (Array.isArray(obj)) return '[' + obj.map(canon).join(',') + ']';
  if (obj && typeof obj === 'object') {
    return '{' + Object.keys(obj).sort().map(k => JSON.stringify(k) + ':' + canon(obj[k])).join(',') + '}';
  }
  return JSON.stringify(obj);
}

function strip(r) {
  const c = {};
  for (const k of Object.keys(r)) if (!SKIP.has(k)) c[k] = r[k];
  return c;
}

const fails = [];
const diffs = [];
function cmp(label, a, b) {
  const ca = canon(strip(a)), cb = canon(strip(b));
  if (ca !== cb) {
    fails.push(label);
    // pinpoint the first differing key
    const sa = strip(a), sb = strip(b);
    const keys = new Set([...Object.keys(sa), ...Object.keys(sb)]);
    for (const k of [...keys].sort()) {
      if (canon(sa[k]) !== canon(sb[k])) diffs.push(`${label}: ${k} = ${canon(sa[k])} vs ${canon(sb[k])}`);
    }
  }
}

let exemptRuns = 0, exemptTotal = 0;
for (const pid of POLICIES) {
  for (const seed of SEEDS) {
    const b = load('before', pid, seed), a = load('after', pid, seed), r = load('aa', pid, seed);
    cmp(`[${pid} s${seed}] before-vs-after`, b, a);
    cmp(`[${pid} s${seed}] after-vs-aa`, a, r);
    exemptTotal += a.throttleExemptDepth || 0;
    if ((a.throttleExemptDepth || 0) > 0) exemptRuns++;
  }
}

console.log(`det-gate: ${16 * 2 - fails.length}/${16 * 2} leg-comparisons byte-identical (before/after + after/aa across 16 combos)`);
if (diffs.length) {
  console.log('DIFFERENCES:');
  for (const d of diffs.slice(0, 20)) console.log('  ' + d);
  if (diffs.length > 20) console.log(`  ... +${diffs.length - 20} more`);
}
console.log(`counter: throttleExemptDepth fired on ${exemptRuns}/16 runs, total ${exemptTotal} exempted duties`);
console.log(fails.length === 0 ? 'DET-GATE GREEN' : `DET-GATE NO-GO: ${fails.length} divergent leg(s)`);
process.exit(fails.length === 0 ? 0 : 1);

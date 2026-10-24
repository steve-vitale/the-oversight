#!/usr/bin/env node
// scripts/test-gapw3-huntroster-count.js — proof for gap-closure findings
// #644 (phase 2 bundle W3-food-villager-social, sim-findings.md line 644):
// the huntroster named fix spec said "14 hunt-relevant occupations" but
// listed 13 ids (8 x huntTier 1.4 + 5 x huntTier 1.2), and the landed data
// has 13. The correction is 14 -> 13 in the spec-carrying test headers
// (scripts/test-huntfix-b.js, scripts/test-huntfix-reapply-b.js) — no
// 14th occupation invented (the vinebank sub-item was killed at pilot).
// This test pins the data count so the slip cannot silently reappear.
//
// Usage: node scripts/test-gapw3-huntroster-count.js
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'characterGen.json'), 'utf8'));
const occs = data.occupations || [];
const tiered = occs.filter(o => o && o.huntTier != null);
const t14 = tiered.filter(o => o.huntTier === 1.4).map(o => o.id).sort();
const t12 = tiered.filter(o => o.huntTier === 1.2).map(o => o.id).sort();
console.log(`  huntTier occupations: total=${tiered.length} 1.4=${t14.length} 1.2=${t12.length}`);
console.log(`  1.4: ${t14.join(',')}`);
console.log(`  1.2: ${t12.join(',')}`);
assert(tiered.length === 13, `expected 13 huntTier occupations, got ${tiered.length}`);
assert(t14.length === 8, `expected 8 x 1.4, got ${t14.length}`);
assert(t12.length === 5, `expected 5 x 1.2, got ${t12.length}`);
for (const f of ['test-huntfix-b.js', 'test-huntfix-reapply-b.js']) {
  const src = fs.readFileSync(path.join(__dirname, f), 'utf8');
  assert(!/on the 14 hunt-relevant/.test(src), f + ' still says 14');
  assert(/on the 13 hunt-relevant/.test(src), f + ' does not say 13');
}
console.log('PASS test-gapw3-huntroster-count: 13 huntTier occupations (8x1.4 + 5x1.2), spec headers corrected');

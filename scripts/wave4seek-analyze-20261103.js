#!/usr/bin/env node
// wave4seek-analyze-20261103.js — pilot table + GO verdict for the
// wave4seek arm. Reads evidence/2026-11-03/perseed-wave4seek/w4-*.json.
// Usage: node scripts/wave4seek-analyze-20261103.js [run]
// Prints a per-seed baseline-vs-variant table and the prereg GO verdict:
// GO iff >= 2/8 variant seeds record >= 1 w4 fought AND baseline is 0/8
// on identical seeds (the prereg's exact wording: ">= 2/8 pilot seeds
// record >= 1 wave-4 fought under the variant vs 0/8 under baseline").
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const RUN = process.argv[2] || 'w4pilot';
const dir = path.join(REPO, 'evidence', '2026-11-03', 'perseed-wave4seek');
const files = fs.readdirSync(dir).filter(f => f.endsWith(`-${RUN}.json`)).sort();
const bySeed = {};
for (const f of files) {
  try {
    const r = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    (bySeed[r.seed] = bySeed[r.seed] || {})[r.arm] = r;
  } catch (e) { console.error('SKIP ' + f + ': ' + e.message); }
}
const seeds = Object.keys(bySeed).map(Number).sort((a, b) => a - b);
console.log('seed | base w4 (unlockDay) | var w4 (unlockDay, patrols) | base days/end | var days/end');
let basePos = 0, varPos = 0, baseSeeds = 0, varSeeds = 0;
for (const s of seeds) {
  const b = bySeed[s].baseline, v = bySeed[s].variant;
  if (b) { baseSeeds++; if (b.w4Count >= 1) basePos++; }
  if (v) { varSeeds++; if (v.w4Count >= 1) varPos++; }
  console.log(`${s} | ${b ? `${b.w4Count} [${(b.w4Faced || []).join(',')}] (u${b.w4UnlockDay})` : '—'} | ${v ? `${v.w4Count} [${(v.w4Faced || []).join(',')}] (u${v.w4UnlockDay}, p${v.patrols})` : '—'} | ${b ? `${b.days}/${b.endReason}` : '—'} | ${v ? `${v.days}/${v.endReason}` : '—'}`);
}
console.log(`baseline: ${basePos}/${baseSeeds} seeds with >=1 w4 fought`);
console.log(`variant:  ${varPos}/${varSeeds} seeds with >=1 w4 fought`);
const go = (baseSeeds === 8 && varSeeds === 8 && basePos === 0 && varPos >= 2);
console.log('VERDICT: ' + (go ? 'GO' : 'KILLED') + ` (prereg: variant >=2/8 with baseline 0/8)`);

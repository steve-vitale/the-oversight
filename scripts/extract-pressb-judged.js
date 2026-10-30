#!/usr/bin/env node
// extract-pressb-judged.js — write judged morning rows for replay
// comparators: for every control-leg stranded field morning
// (same-day evening bucket creek + rescued false, wake tile not
// haven), dump the control recorder morning row to
// evidence/2026-10-30/sim-pressb-b-judged-mornings/
//   pressb-judged-s<seed>-d<loopDay>.json
// The replay driver (wakeforage-replay-b.js, unmodified) reads
// these via JUDGED_MORNING and equality-gates its pre-press snap
// against them. Pure reads.
// Usage: node scripts/extract-pressb-judged.js <controlDir> <outDir>
'use strict';
const fs = require('fs');
const path = require('path');
const dir = process.argv[2], outDir = process.argv[3];
if (!dir || !outDir) { console.error('usage: extract-pressb-judged.js <controlDir> <outDir>'); process.exit(2); }
fs.mkdirSync(outDir, { recursive: true });
let n = 0;
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
  const inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const mo = {};
  for (const m of (inst.mornings || [])) mo[m.loopDay] = m;
  for (const e of (inst.evenings || [])) {
    const w = e.woodcarry || {};
    if (!(w.bucket === 'creek' && !w.rescued)) continue;
    const m = mo[e.loopDay];
    if (!m || m.tile === 'haven') continue;
    const name = `pressb-judged-s${inst.seed}-d${e.loopDay}.json`;
    fs.writeFileSync(path.join(outDir, name), JSON.stringify(m, null, 2));
    console.log('judged seed ' + inst.seed + ' day ' + e.loopDay + ' tile ' + m.tile + ' wake ' + m.mx + ',' + m.my + ' kcal ' + m.kcal);
    n++;
  }
}
console.log('wrote ' + n + ' judged mornings to ' + outDir);

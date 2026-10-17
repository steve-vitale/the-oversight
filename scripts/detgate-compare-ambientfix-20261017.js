#!/usr/bin/env node
// scripts/detgate-compare-ambientfix-20261017.js — det-gate comparator for
// sim-ambientfix-b (#440). Compares the control (pre-fix) and armed
// (post-fix) per-seed JSONs from scripts/sweep-ambientfix-20261017.js.
//
// PRIMARY det-gate: 16/16 seeds with byte-identical mechanics-only
// trajectory hashes (say TEXT is not in the hash — voice-only lever).
// Wall metrics (national/table/wins/maxWave/maxArc/medianSurvival/exiled,
// endReason) must also be 16/16 identical. Variety is measured
// directionally (armed distinct pilot-food texts > control == 1), not as a
// gate.
//
// Usage:
//   node scripts/detgate-compare-ambientfix-20261017.js <control-dir> <armed-dir>
'use strict';
const fs = require('fs');
const path = require('path');

const ctl = process.argv[2], arm = process.argv[3];
if (!ctl || !arm) { console.error('usage: detgate-compare-ambientfix-20261017.js <control-dir> <armed-dir>'); process.exit(2); }

const FILES = fs.readdirSync(ctl).filter(f => /^(control|armed)-.*-s\d+\.json$/.test(f) && !/-summary\.json$/.test(f));
let hashOk = 0, hashBad = 0, wallOk = 0, wallBad = 0, missing = 0;
const WALL_KEYS = ['national', 'table', 'wins', 'maxWave', 'maxArc', 'medianSurvival', 'exiled', 'endReason', 'days', 'gameDays'];
for (const f of FILES.sort()) {
  const af = path.join(arm, f.replace(/^(control|armed)-/, 'armed-'));
  if (!fs.existsSync(af)) { console.log(`  MISSING armed file for ${f}`); missing++; continue; }
  const c = JSON.parse(fs.readFileSync(path.join(ctl, f), 'utf8'));
  const a = JSON.parse(fs.readFileSync(af, 'utf8'));
  const hc = JSON.stringify(c.hashes), ha = JSON.stringify(a.hashes);
  const hSame = hc === ha;
  hSame ? hashOk++ : hashBad++;
  const wDiff = WALL_KEYS.filter(k => JSON.stringify(c[k]) !== JSON.stringify(a[k]));
  wDiff.length ? wallBad++ : wallOk++;
  console.log(`  ${f.replace(/^control-/, '')}: hashes ${hSame ? 'IDENTICAL' : 'DIFFER (' + c.hashes.length + 'v' + a.hashes.length + ')'} wall ${wDiff.length ? 'DIFFER:' + wDiff.join(',') : 'identical'}`);
}
console.log(`\nDET-GATE: hashes ${hashOk}/16 identical (${hashBad} differ), wall ${wallOk}/16 identical (${wallBad} differ), missing ${missing}`);
const go = hashBad === 0 && wallBad === 0 && missing === 0 && hashOk === 16;
console.log(go ? 'RESULT: GO — voice-only, zero mechanics movement' : 'RESULT: NO-GO — trajectory moved');
process.exit(go ? 0 : 1);

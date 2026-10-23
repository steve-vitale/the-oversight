#!/usr/bin/env node
// build-easingchannels-summaries-b.js — rebuilds the 8 sweep-<cell>-<policy>.json
// summary files the analyzer reads (scripts/analyze-easingchannels-b.js) from
// the committed per-seed corpus (evidence/2026-10-23/easingchannels-b-corpus/).
// Each summary row mirrors the sweep's row shape (sayLines excluded).
// Usage: node scripts/build-easingchannels-summaries-b.js
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const ROOT = path.join(__dirname, '..');
const CORPUS = path.join(ROOT, 'evidence/2026-10-23/easingchannels-b-corpus');
const OUTDIR = path.join(os.homedir(), 'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-easingchannels-b');
const CELLS = ['pd0dg0', 'pd0dg1', 'pd1dg0', 'pd1dg1'];
const POLICIES = ['leadfeast', 'belongfeast'];

let fail = 0;
for (const policy of POLICIES) for (const cell of CELLS) {
  const rows = [];
  for (let s = 9250; s <= 9265; s++) {
    const p = path.join(CORPUS, `easingchannels-b-${cell}-${policy}-s${s}.json`);
    if (!fs.existsSync(p)) { console.log('MISSING ' + p); fail++; continue; }
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    rows.push(j);
  }
  const pd = cell.startsWith('pd1') ? '1' : '0', dg = cell.endsWith('dg1') ? '1' : '0';
  const out = {
    meta: { cell, policy, days: 100, seeds: rows.map(r => r.seed), rebuilt_from_corpus: true,
      env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', PLENTYDEPRI: pd, DEPOSITGATE: dg } },
    rows,
  };
  const dest = path.join(OUTDIR, `sweep-${cell}-${policy}.json`);
  fs.writeFileSync(dest, JSON.stringify(out, null, 1));
  console.log(`wrote ${dest} rows=${rows.length}`);
}
console.log(fail ? `BUILD: ${fail} missing files` : 'BUILD: all 8 summaries written');
process.exit(fail ? 1 : 0);

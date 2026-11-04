#!/usr/bin/env node
// test-pilot-corpus-purity-r130.js — journey-endgame r130 (lane B).
// Proves the r129/r130 OUTDIR fix: diagnostics must never write into the
// pilot dir. Two modes:
//   node scripts/test-pilot-corpus-purity-r130.js snapshot
//     — records pilot dir file set + sha256 manifest (outside the pilot
//       dir) AND asserts the r130 probe reads EVID from process.env.EVIDDIR.
//   node scripts/test-pilot-corpus-purity-r130.js verify
//     — re-hashes the pilot dir and fails if any file was added,
//       removed, or changed since the snapshot.
// Exit 0 = pure, 1 = contamination (or missing snapshot / missing override).
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PILOT = path.join(__dirname, '..', 'evidence', '2026-11-04', 'perseed-endgame-r130');
const MANIFEST = path.join(__dirname, '..', 'evidence', '2026-11-04', 'perseed-endgame-r130-manifest.json');
const PROBE = path.join(__dirname, 'probe-endgame-r130-20261104.js');

function sha(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}
function snapshotDir() {
  const out = {};
  for (const f of fs.readdirSync(PILOT).sort()) out[f] = sha(path.join(PILOT, f));
  return out;
}

const mode = process.argv[2];
if (mode !== 'snapshot' && mode !== 'verify') {
  console.error('usage: test-pilot-corpus-purity-r130.js snapshot|verify');
  process.exit(2);
}

// Static leg of the proof: the probe MUST honor EVIDDIR.
const probeSrc = fs.readFileSync(PROBE, 'utf8');
if (!/process\.env\.EVIDDIR/.test(probeSrc)) {
  console.error('FAIL: probe does not read process.env.EVIDDIR (OUTDIR fix missing)');
  process.exit(1);
}
console.log('probe EVIDDIR override present: OK');

if (mode === 'snapshot') {
  const snap = snapshotDir();
  fs.writeFileSync(MANIFEST, JSON.stringify(snap, null, 1));
  console.log(`snapshot: ${Object.keys(snap).length} pilot files -> ${MANIFEST}`);
  process.exit(0);
}

if (!fs.existsSync(MANIFEST)) {
  console.error('FAIL: no manifest — run snapshot first');
  process.exit(1);
}
const before = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const after = snapshotDir();
const problems = [];
for (const f of Object.keys(before)) {
  if (!(f in after)) problems.push(`removed: ${f}`);
  else if (before[f] !== after[f]) problems.push(`changed: ${f}`);
}
for (const f of Object.keys(after)) {
  if (!(f in before)) problems.push(`added: ${f}`);
}
if (problems.length) {
  console.error('FAIL: pilot corpus contaminated:\n' + problems.map(p => '  ' + p).join('\n'));
  process.exit(1);
}
console.log(`pilot corpus pure: ${Object.keys(after).length} files identical to snapshot`);
process.exit(0);

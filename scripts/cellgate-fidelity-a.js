#!/usr/bin/env node
// scripts/cellgate-fidelity-a.js — fidelity check, arm sim-cellgate-a.
// Compares the cellgate control-leg corpus for seed 107053 against the
// gunrate-a arm corpus for the same seed, on every SIMULATION field,
// excluding only the metadata that differs by construction:
//  - top-level: arm/run/mode/leg, gameSha, anchorCommit, and the new
//    cellgateOn/cellgatePresent/v4cellgate keys;
//  - 'seq' keys: a per-PROCESS counter (the gunrate driver runs all 8
//    seeds in one process, so seed 107053's seqs start at ~177; this
//    wrapper runs one seed per process, so they start at 1);
//  - worktree paths inside string values ('frame', 'caller', ...):
//    stack-frame strings embed the driver's file path
//    (sim-cellgate-a vs sim-gunrate-a); the paths differ, the calls
//    do not — normalized to <WT> before comparing.
// Any remaining difference means the rebuilt substrate is not faithful
// — stop and investigate before judging anything (prereg §14b item 5).
// Usage: node scripts/cellgate-fidelity-a.js [--ctl DIR] [--gun DIR]
// Exit 0 = all simulation fields match. Exit 1 = a difference (listed).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EXCLUDE = new Set(['arm', 'run', 'mode', 'leg', 'gameSha', 'anchorCommit',
  'cellgateOn', 'cellgatePresent', 'v4cellgate']);
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const ctlFile = path.join(REPO, argvVal('--ctl', 'evidence/2026-11-20/perseed-cellgate-a-ctl'),
  'cellgate-a-s107053-cellgate-a-ctl.json');
const gunFile = path.join(REPO, argvVal('--gun', 'evidence/2026-11-20/perseed-gunrate-a-arm'),
  'gunrate-a-s107053-gunrate-a-arm.json');

function normalize(v) {
  if (typeof v === 'string') {
    return v.replace(/\/home\/hatch\/workspace\/worktrees\/[^/]+\//g, '<WT>/');
  }
  if (Array.isArray(v)) return v.map(normalize);
  if (v && typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v)) {
      if (k === 'seq') continue;
      o[k] = normalize(v[k]);
    }
    return o;
  }
  return v;
}

function diffPaths(a, b, prefix, out) {
  if (out.length >= 10) return;
  if (JSON.stringify(a) === JSON.stringify(b)) return;
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const keys = new Set(Object.keys(a).concat(Object.keys(b)));
    for (const k of keys) {
      if (out.length >= 10) return;
      diffPaths(a[k], b[k], prefix ? prefix + '.' + k : k, out);
    }
    return;
  }
  out.push(prefix + ': ctl=' + JSON.stringify(a) + ' gun=' + JSON.stringify(b));
}

function main() {
  let ctl, gun;
  try { ctl = JSON.parse(fs.readFileSync(ctlFile, 'utf8')); }
  catch (e) { console.error('FIDELITY STOP: cannot read ctl corpus: ' + ctlFile + ' (' + e.message + ')'); process.exit(2); }
  try { gun = JSON.parse(fs.readFileSync(gunFile, 'utf8')); }
  catch (e) { console.error('FIDELITY STOP: cannot read gunrate corpus: ' + gunFile + ' (' + e.message + ')'); process.exit(2); }
  const diffs = [];
  const keys = new Set(Object.keys(ctl).concat(Object.keys(gun)));
  for (const k of keys) {
    if (EXCLUDE.has(k)) continue;
    diffPaths(normalize(ctl[k]), normalize(gun[k]), k, diffs);
  }
  if (diffs.length) {
    console.log('FIDELITY FAIL — ' + diffs.length + ' differing simulation field(s) (showing up to 10):');
    for (const d of diffs) console.log('  ' + d);
    process.exit(1);
  }
  console.log('FIDELITY PASS — all simulation fields match for seed 107053 (excluded: metadata ' + Array.from(EXCLUDE).join(', ') + '; per-process seq; worktree paths in strings)');
}
if (require.main === module) main();

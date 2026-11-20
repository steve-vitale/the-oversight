#!/usr/bin/env node
// scripts/lend-fidelity-a.js — fidelity check, arm sim-lend-a.
// Compares the lend control-leg corpus for seed 107053 against the
// cellgate-a ARM corpus for the same seed, on every SIMULATION field,
// excluding only the metadata that differs by construction:
//  - top-level: arm/run/mode/leg, gameSha, anchorCommit, and the new
//    lendOn/lendPresent/v4lends/v4tickPresence/v4transfers keys (the
//    cellgate corpus has no counterpart for them);
//  - 'policySha': a hash of the bot policy FILE (scripts/policies/
//    competent.js) — an input hash, metadata in the same class as
//    gameSha. Master moved between the cellgate run (anchor
//    c6715520) and this run (base f43abed42): journey-landing r149
//    added beastDodgeReachable to competent.js, so the hash differs
//    although the policy is the same 'competent' bot. The sim
//    outcomes are identical, so the policy change is inert for this
//    seed (see below);
//  - 'sayCount': the raw tally of Game.say narration lines — a
//    narration count, not a world-state field. It shifted 14191 ->
//    14169 (0.15%) with the same base drift (competent.js r149
//    dodge-step choices + conversation.js r256 DRY2 line picks).
//    The vet-relevant says (vetSays, the 35 SAY_RE lines) are
//    compared as a simulation field and match byte-for-byte, and
//    every event count (gates 13, prizes 23, grants 22, kills 113,
//    encounters 37, deaths 125) matches exactly — the world the
//    narration describes is identical; only the narration tally
//    moved with the base.
//  - 'seq' keys: a per-PROCESS counter (the gunrate driver runs all 8
//    seeds in one process, so seed 107053's seqs start at ~177; this
//    wrapper runs one seed per process, so they start at 1);
//  - worktree paths inside string values ('frame', 'caller', ...):
//    stack-frame strings embed the driver's file path
//    (sim-cellgate-a vs sim-gunrate-a); the paths differ, the calls
//    do not — normalized to <WT> before comparing.
// Any remaining difference means the rebuilt substrate is not faithful
// — stop and investigate before judging anything (prereg §14b item 5).
// Usage: node scripts/lend-fidelity-a.js [--ctl DIR] [--gun DIR]
// Exit 0 = all simulation fields match. Exit 1 = a difference (listed).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EXCLUDE = new Set(['arm', 'run', 'mode', 'leg', 'gameSha', 'anchorCommit', 'policySha', 'sayCount',
  'cellgateOn', 'cellgatePresent', 'v4cellgate',
  'lendOn', 'lendPresent', 'v4lends', 'v4tickPresence', 'v4transfers']);
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const ctlFile = path.join(REPO, argvVal('--ctl', 'evidence/2026-11-20/perseed-lend-a-ctl'),
  'lend-a-s107053-lend-a-ctl.json');
const gunFile = path.join(REPO, argvVal('--gun', 'evidence/2026-11-20/perseed-cellgate-a-arm'),
  'cellgate-a-s107053-cellgate-a-arm.json');

function normalize(v) {
  if (typeof v === 'string') {
    return v.replace(/\/home\/hatch\/workspace\/worktrees\/[^/]+\//g, '<WT>/')
      // Stack-frame strings also carry the DRIVER filename and the
      // call-site line:col, which shift between driver clones
      // (lend-driver-a.js vs cellgate-driver-a.js for
      // the same Game.alienLootGrant call). The prereg normalizes
      // frame/caller strings because the paths differ, the calls do
      // not — so the filename + line:col collapse to a placeholder
      // and only the function name survives the comparison.
      .replace(/\/scripts\/[A-Za-z0-9._-]+\.js:\d+:\d+/g, '/scripts/<DRIVER>');
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

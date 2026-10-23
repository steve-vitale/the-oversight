#!/usr/bin/env node
// mantlerestraint-detcheck.js — the cross-tree det-gate: the sweep's
// CONTROL arm (MANTLERESTRAINT unset) must reproduce the committed
// re-stage control corpus dayHash chains BYTE-IDENTICALLY.
// Same substrate (VS.substrateFor = armorydrive stack), same seeds
// (65511-65518 x {lead,belong}), same pinned env. If the ledger.js
// change leaks into trajectories with the gate OFF, this fails LOUD.
//
// Compares:
//   evidence/2026-10-23/perseed-mantlerestraint/control-<policy>-s<seed>.json
//     -> hashes
// vs
//   evidence/2026-10-23/perseed-vetrestage/control-<policy>-s<seed>.json
//     -> hashes   (committed on master by the re-stage arm)
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const NEW = process.env.MR_EVID || path.join(REPO, 'evidence', '2026-10-23', 'perseed-mantlerestraint');
const OLD = path.join(REPO, 'evidence', '2026-10-23', 'perseed-vetrestage');
const SEEDS = [65511, 65512, 65513, 65514, 65515, 65516, 65517, 65518];
const POLICIES = ['leadfeast', 'belongfeast'];

let match = 0, mismatch = 0, missing = 0;
const mismatched = [];
for (const seed of SEEDS) {
  for (const policy of POLICIES) {
    const nf = path.join(NEW, `control-${policy}-s${seed}.json`);
    const of = path.join(OLD, `control-${policy}-s${seed}.json`);
    if (!fs.existsSync(nf) || !fs.existsSync(of)) { missing++; console.log('MISSING', policy, seed); continue; }
    const a = (JSON.parse(fs.readFileSync(nf, 'utf8')).hashes || []).join('\n');
    const b = (JSON.parse(fs.readFileSync(of, 'utf8')).hashes || []).join('\n');
    if (a === b && a.length) { match++; }
    else { mismatch++; mismatched.push(`${policy}/s${seed} (new=${a.split('\n').length} old=${b.split('\n').length})`); }
  }
}
console.log(`DETCHECK: match=${match} mismatch=${mismatch} missing=${missing}`);
if (mismatched.length) console.log('MISMATCHED:', mismatched.join(' '));
process.exit(mismatch || missing ? 1 : 0);

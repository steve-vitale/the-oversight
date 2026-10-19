#!/usr/bin/env node
// test-w4finish-20261018.js — INFO-SKIP (kill protocol).
//
// The sim-w4finish layer (scripts/policies/w4finish.js) was KILLED at PILOT
// on 2026-10-18: primary bar missed (armed 1/8 w4killRuns < 2/8) and a
// critical bug (153,000-turn pathological fight on s65101 — the commitment
// had no turn cap, converting "no early retreat" into "never retreat").
// See evidence/2026-10-18/sim-w4finish.md for the full post-mortem.
//
// This proof is retained as INFO-SKIP to document the kill. It verifies
// the layer is zero-trace removed (no file, no references) and exits 0.
'use strict';
const fs = require('fs');
const path = require('path');

const LAYER = path.join(__dirname, 'policies', 'w4finish.js');

if (fs.existsSync(LAYER)) {
  console.error('FAIL: w4finish.js still exists — kill protocol incomplete');
  process.exit(1);
}

// Zero-trace check: no remaining references to the layer in scripts/.
const { execSync } = require('child_process');
let refs = '';
try {
  refs = execSync('grep -rln "w4finish" scripts/ --include="*.js" | grep -v test-w4finish-20261018', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim();
} catch (e) { refs = ''; }
// The sweep/analyzer/evidence legitimately reference the arm name; the
// layer file itself must be gone (checked above). Filter to policy requires.
const policyRefs = refs.split('\n').filter(f => f && f.includes('policies/w4finish'));
if (policyRefs.length) {
  console.error('FAIL: stale references to policies/w4finish: ' + policyRefs.join(', '));
  process.exit(1);
}

console.log('INFO-SKIP: sim-w4finish layer killed at PILOT (2026-10-18).');
console.log('  Primary bar missed: armed 1/8 w4killRuns < 2/8.');
console.log('  Critical bug: 153k-turn pathological fight (no turn cap on commitment).');
console.log('  See evidence/2026-10-18/sim-w4finish.md.');
console.log('  Layer file removed; no policy references remain.');
process.exit(0);

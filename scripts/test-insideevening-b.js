#!/usr/bin/env node
// test-insideevening-b.js — proof for the insideevening instrument
// and measurement (sim-insideevening-b).
//
// Usage:
//   node scripts/test-insideevening-b.js --before <control-dir>
//     --after <policy-dir> [--seeds 10700,...,10707]
// Legs:
//   T1 corpus completeness (one file per seed, both legs)
//   T2 every evening row carries position + access (no gaps)
//   T3 policy record vs driver position never disagrees
//        (positionAgreesWithPolicy never false)
//   T4 gate honesty: every inside evening reads access 'inside'
//   T5 tap honesty: every attempted tap has a say window and
//        a classified outcome; every inside tap reads 'inside'
//   T6 control shape: control tap rows are complete and their
//        access values are recorded (the comparison, not an
//        assertion that control is always 'none' — competent
//        may occasionally end inside honestly)
//   T7 no src/ changes (policy-side arm only)
//   T8 sense anchor: at least one walk+go-inside evening's
//        tail contains 'You step into the Haven hall.'
// Exits 0 with PROOF-GREEN iff every leg passes.
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const arg = (n, f) => { const i = process.argv.indexOf('--' + n); return i < 0 ? f : process.argv[i + 1]; };
const beforeDir = arg('before', null), afterDir = arg('after', null);
const seeds = arg('seeds', '10700,10701,10702,10703,10704,10705,10706,10707')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
if (!beforeDir || !afterDir) { console.error('usage: --before <dir> --after <dir> [--seeds ...]'); process.exit(2); }

const fails = [];
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!ok) fails.push(name);
}
function load(dir, seed, policy) {
  const f = path.join(dir, `insideevening-b-${policy}-s${seed}.json`);
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

// T1
let t1 = true;
for (const s of seeds) {
  if (!load(beforeDir, s, 'competent')) { t1 = false; console.log('  missing control seed ' + s); }
  if (!load(afterDir, s, 'insideevening')) { t1 = false; console.log('  missing policy seed ' + s); }
}
check('T1 corpus completeness', t1, seeds.length + ' seeds x 2 legs');

// T2 + T3 + T4 + T5 (policy leg), T2 + T6 (control leg)
let t2 = true, t3 = true, t4 = true, t5 = true, t6 = true, t8 = false;
let policyEvenings = 0, controlEvenings = 0;
for (const s of seeds) {
  const pol = load(afterDir, s, 'insideevening');
  const ctl = load(beforeDir, s, 'competent');
  for (const j of [pol, ctl]) {
    if (!j) continue;
    for (const e of (j.evenings || [])) {
      if (j.policy === 'insideevening') policyEvenings++; else controlEvenings++;
      if (e.inside === null || e.inside === undefined || e.tile === null || e.tile === undefined || e.access === null || e.access === undefined || !e.eveningOutcome) t2 = false;
      if (e.inside === true && e.tile === 'haven' && e.access !== 'inside') t4 = false;
      if (e.positionAgreesWithPolicy === false) t3 = false;
      if (j.policy === 'insideevening' && e.eveningOutcome === 'completed' && (e.eveningSayTail || []).some((l) => /You step into the Haven hall\./.test(l))) t8 = true;
    }
    for (const t of (j.taps || [])) {
      if (t.outcome === 'attempted') {
        if (!Array.isArray(t.sayWindow) || !t.tapOutcomeClass) t5 = false;
        if (j.policy === 'insideevening' && t.eveningOutcome !== 'not-attempted-away' && t.accessAtTap !== 'inside' && (t.eveningOutcome === 'completed' || t.eveningOutcome === 'already-inside')) t5 = false;
      }
      if (t.accessAtTap === null || t.accessAtTap === undefined) t6 = false;
    }
  }
}
check('T2 evening rows carry position+access', t2, policyEvenings + ' policy + ' + controlEvenings + ' control evenings');
check('T3 policy record vs driver position agrees', t3);
check('T4 inside evenings read access inside', t4);
check('T5 tap honesty (say window, class, inside taps read inside)', t5);
check('T6 control tap rows carry access values', t6);
check('T8 sense anchor: a walk+go-inside tail says "You step into the Haven hall."', t8);

// T7
let srcDirty = '';
try { srcDirty = cp.execFileSync('git', ['status', '--short', 'src/'], { encoding: 'utf8', cwd: path.join(__dirname, '..') }).trim(); } catch (e) { srcDirty = 'git-error'; }
check('T7 no src/ changes', srcDirty === '', srcDirty || 'clean');

if (fails.length) { console.log('PROOF-RED: ' + fails.join(', ')); process.exit(1); }
console.log('PROOF-GREEN');

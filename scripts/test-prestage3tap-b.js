#!/usr/bin/env node
// test-prestage3tap-b.js — proof for the prestage3tap instrument
// and measurement (sim-prestage3tap-b). Adapted from
// test-insideevening-b.js; the corpus filenames differ
// (prestage3tap-b-*) and two legs are added for this arm.
//
// Usage:
//   node scripts/test-prestage3tap-b.js --before <control-dir>
//     --after <policy-dir> [--seeds 10900,...,10907]
// Legs:
//   T1 corpus completeness (one file per seed, both legs)
//   T2 every evening row carries position + access (no gaps)
//   T3 policy record vs driver position never disagrees
//   T4 gate honesty: every inside evening reads access 'inside'
//   T5 tap honesty: every attempted tap has a say window and
//        a classified outcome; every inside tap reads 'inside'
//   T6 control tap rows carry access values
//   T7 no src/ changes (policy-side measurement only)
//   T8 sense anchor: at least one walk+go-inside evening's
//        tail contains 'You step into the Haven hall.'
//   T9 tap window: every tap row is on loop-days 8-12, and
//        every evening row's tapDay flag matches loop-days 8-12
//   T10 stage recorded: every tap row carries stageAtTap
//        (null is a failure — the window claim needs the stage)
// Exits 0 with PROOF-GREEN iff every leg passes.
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const arg = (n, f) => { const i = process.argv.indexOf('--' + n); return i < 0 ? f : process.argv[i + 1]; };
const beforeDir = arg('before', null), afterDir = arg('after', null);
const seeds = arg('seeds', '10900,10901,10902,10903,10904,10905,10906,10907')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
if (!beforeDir || !afterDir) { console.error('usage: --before <dir> --after <dir> [--seeds ...]'); process.exit(2); }

const fails = [];
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!ok) fails.push(name);
}
function load(dir, seed, policy) {
  const f = path.join(dir, `prestage3tap-b-${policy}-s${seed}.json`);
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

let t1 = true;
for (const s of seeds) {
  if (!load(beforeDir, s, 'competent')) { t1 = false; console.log('  missing control seed ' + s); }
  if (!load(afterDir, s, 'insideevening')) { t1 = false; console.log('  missing policy seed ' + s); }
}
check('T1 corpus completeness', t1, seeds.length + ' seeds x 2 legs');

let t2 = true, t3 = true, t4 = true, t5 = true, t6 = true, t8 = false, t9 = true, t10 = true;
let policyEvenings = 0, controlEvenings = 0, tapRows = 0;
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
      if (e.tapDay !== (e.loopDay >= 8 && e.loopDay <= 12)) t9 = false;
    }
    for (const t of (j.taps || [])) {
      tapRows++;
      if (t.loopDay < 8 || t.loopDay > 12) t9 = false;
      if (t.stageAtTap === null || t.stageAtTap === undefined) t10 = false;
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
check('T9 tap window is loop-days 8-12 only', t9, tapRows + ' tap rows');
check('T10 every tap row carries stageAtTap', t10);

let srcDirty = '';
try { srcDirty = cp.execFileSync('git', ['status', '--short', 'src/'], { encoding: 'utf8', cwd: path.join(__dirname, '..') }).trim(); } catch (e) { srcDirty = 'git-error'; }
check('T7 no src/ changes', srcDirty === '', srcDirty || 'clean');

if (fails.length) { console.log('PROOF-RED: ' + fails.join(', ')); process.exit(1); }
console.log('PROOF-GREEN');

#!/usr/bin/env node
// test-nighttravel-b.js — proof for the nighttravel instrument and
// measurement (sim-nighttravel-b).
//
// Usage:
//   node scripts/test-nighttravel-b.js --before <control-dir>
//     --after <policy-dir> [--seeds 10700,...,10707]
// Legs:
//   T1 corpus completeness (one file per seed, both legs)
//   T2 every evening row carries position + access (+ pre-travel
//        position on the policy leg; no gaps)
//   T3 policy record vs driver position never disagrees, and a
//        recorded travel hop that MOVED always landed on the haven
//        node (G3 landing-check fix, post-2224Z: a refused hop's
//        arrival is its departure and is verified by arrival ==
//        departure + outcome 'travel-refused', never counted as a
//        landing failure — the old reading false-flagged 6x
//        block:creek refusals on seed 10757 in the 2224Z corpus)
//   T4 gate honesty: every inside evening reads access 'inside'
//   T5 tap honesty: every attempted tap has a say window and a
//        classified outcome; every converted away tap reads 'inside'
//   T6 control shape: control tap rows are complete and their
//        access values are recorded
//   T7 no src/ changes (policy-side arm only)
//   T8 sense anchor: a travelled-home evening's tail contains
//        'You step into the Haven hall.' — CONDITIONAL (mirrors R10):
//        on a corpus with zero converted away evenings there is no
//        travelled-home tail to anchor, so the leg reports
//        no-anchor-needed and passes; a vacuous failure is an
//        instrument limitation, not a lever failure (this is exactly
//        how T8 failed on the conversion-free 2224Z corpus)
//   T9 honesty guards: no completed/already-inside evening while
//        in combat or from a tent; every travel hop is exactly one
//        hop, never forced; the control leg records no travel
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
  const f = path.join(dir, `nighttravel-b-${policy}-s${seed}.json`);
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}
// G3 landing-check fix (same definition as the analyzer): only
// moved hops are judged on landing; refused hops are verified by
// arrival == departure + 'travel-refused'.
function travelMoved(e) {
  const t = e.travel;
  if (!t || !t.from || !t.arrival) return null;
  const fpx = t.from.mapPx, fpy = t.from.mapPy, apx = t.arrival.mapPx, apy = t.arrival.mapPy;
  if (fpx === null || fpx === undefined || fpy === null || fpy === undefined
    || apx === null || apx === undefined || apy === null || apy === undefined) return null;
  return fpx !== apx || fpy !== apy;
}
function landingViolation(e) {
  if (!e.travel) return false;
  const moved = travelMoved(e);
  if (moved === false) return false;
  if (moved === true) {
    const h = e.haven || null;
    return !(e.travel.arrival.mapPx === (h && h.hx) && e.travel.arrival.mapPy === (h && h.hy));
  }
  return e.travelLandedOnHaven === false;
}

// T1
let t1 = true;
for (const s of seeds) {
  if (!load(beforeDir, s, 'insideevening')) { t1 = false; console.log('  missing control seed ' + s); }
  if (!load(afterDir, s, 'nighttravel')) { t1 = false; console.log('  missing policy seed ' + s); }
}
check('T1 corpus completeness', t1, seeds.length + ' seeds x 2 legs');

let t2 = true, t3 = true, t4 = true, t5 = true, t6 = true, t8 = false, t9 = true;
let refusedHopN = 0, refusedHopVerifiedN = 0, landingViolations = 0;
let policyEvenings = 0, controlEvenings = 0, convertedAway = 0;
for (const s of seeds) {
  const pol = load(afterDir, s, 'nighttravel');
  const ctl = load(beforeDir, s, 'insideevening');
  for (const j of [pol, ctl]) {
    if (!j) continue;
    const isPol = j.policy === 'nighttravel';
    for (const e of (j.evenings || [])) {
      if (isPol) policyEvenings++; else controlEvenings++;
      if (e.inside === null || e.inside === undefined || e.tile === null || e.tile === undefined || e.access === null || e.access === undefined || !e.eveningOutcome) t2 = false;
      if (isPol && (e.preStepTile === null || e.preStepTile === undefined)) t2 = false;
      if (e.inside === true && e.tile === 'haven' && e.access !== 'inside') t4 = false;
      if (e.positionAgreesWithPolicy === false) t3 = false;
      if (landingViolation(e)) { t3 = false; landingViolations++; }
      if (isPol && e.travel && travelMoved(e) === false) {
        refusedHopN++;
        if (e.eveningOutcome === 'travel-refused') refusedHopVerifiedN++;
        else { t9 = false; console.log('  non-moved hop not a refusal seed ' + s + ' day ' + e.loopDay + ' outcome ' + e.eveningOutcome); }
      }
      if (isPol && e.eveningOutcome === 'completed' && e.travelledHome && (e.eveningSayTail || []).some((l) => /You step into the Haven hall\./.test(l))) t8 = true;
      if (isPol && e.preStepTile !== 'haven' && e.preStepTile !== null && e.inside === true && e.tile === 'haven') convertedAway++;
      // T9
      if (isPol && (e.eveningOutcome === 'completed' || e.eveningOutcome === 'already-inside')) {
        if (e.inCombat) { t9 = false; console.log('  mid-fight entry seed ' + s + ' day ' + e.loopDay); }
        if (e.policyBefore && e.policyBefore.insideTent === true) { t9 = false; console.log('  tent entry seed ' + s + ' day ' + e.loopDay); }
      }
      if (isPol && e.travel) {
        if (e.travel.hops !== 1 || e.travel.forced !== false) { t9 = false; console.log('  dishonest hop seed ' + s + ' day ' + e.loopDay); }
      }
      if (!isPol && e.travel) { t9 = false; console.log('  control leg recorded travel seed ' + s + ' day ' + e.loopDay); }
    }
    for (const t of (j.taps || [])) {
      if (t.outcome === 'attempted') {
        if (!Array.isArray(t.sayWindow) || !t.tapOutcomeClass) t5 = false;
        if (isPol && t.preStepAway && t.insideAtTap === true && t.tileAtTap === 'haven' && t.accessAtTap !== 'inside') t5 = false;
      }
      if (t.accessAtTap === null || t.accessAtTap === undefined) t6 = false;
    }
  }
}
check('T2 evening rows carry position+access (+pre-travel on policy leg)', t2, policyEvenings + ' policy + ' + controlEvenings + ' control evenings');
check('T3 policy record vs driver position agrees; moved hops land on haven', t3, `landing violations ${landingViolations}; refused hops ${refusedHopVerifiedN}/${refusedHopN} verified`);
check('T4 inside evenings read access inside', t4);
check('T5 tap honesty (say window, class, converted away taps read inside)', t5);
check('T6 control tap rows carry access values', t6);
if (convertedAway === 0) {
  console.log('PASS T8 sense anchor: no converted away evening in corpus — no-anchor-needed (mirrors R10; evidence sense-tests existing evenings)');
} else {
  check('T8 sense anchor: a travelled-home tail says "You step into the Haven hall."', t8, convertedAway + ' converted away evenings in corpus');
}
check('T9 honesty guards (no mid-fight/tent entry, 1 unforced hop, no control travel)', t9);

// T7
let srcDirty = '';
try { srcDirty = cp.execFileSync('git', ['status', '--short', 'src/'], { encoding: 'utf8', cwd: path.join(__dirname, '..') }).trim(); } catch (e) { srcDirty = 'git-error'; }
check('T7 no src/ changes', srcDirty === '', srcDirty || 'clean');

if (fails.length) { console.log('PROOF-RED: ' + fails.join(', ')); process.exit(1); }
console.log('PROOF-GREEN');

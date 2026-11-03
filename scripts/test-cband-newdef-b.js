#!/usr/bin/env node
// test-cband-newdef-b.js — proof for sim-cband-newdef-b.
// Prereg: evidence/2026-11-03/sim-cband-newdef-b-prereg.md (committed
// BEFORE any judged leg).
// Census (proof, not judged evidence):
// (a) scripts/analyze-cband-newdef-b.js on fixture legs in /tmp
//     (never the repo): NEWDEF-OUT true exactly on the decided
//     outward-attempt form (integrity-ok + shadow attempt simOk
//     false + armed attempt vetoed + armed day-6 dayEnd ok true);
//     false when the armed day-6 stay fails (the decided form's
//     second clause — established-band still true there), when
//     the shadow hop passes, when the armed hop is not vetoed,
//     on start-mismatch, and on attempt-not-offered; summary
//     counts across a two-pair run.
// (b) The homeward leg of the combined count: the UNCHANGED
//     shapes analyzer on a synthetic C-qualifying pair emits
//     EPISODE-C and EPISODES C=1 (so OUT + HOME addition in the
//     evidence file rests on a proven HOME counter, not a claim).
// (c) Reused files unmodified (cband analyzer, shapes analyzer,
//     driver, policies, competent.js, src/js untouched by this arm).
// The 8-destination route table is proven by scripts/test-cband-b.js
// (25/25, re-run green on this base before judging) and is NOT
// re-proven here.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + String(extra).slice(0, 500) : '')); }
}

function hop(fx, fy, tx, ty, simOk, extra) {
  return Object.assign({ from: { x: fx, y: fy }, to: { x: tx, y: ty }, simOk: !!simOk,
    directOk: true, via: null, legs: 0, creditUsed: 0, vetoed: false,
    homeward: false, originSimOk: null, silent: false, shadow: false }, extra || {});
}
function day6(startPos, endPos, endOk, hops, attempt) {
  return { loopDay: 6,
    start: { pos: startPos, haven: { x: 4, y: 4 }, over: false, day: 6, kcal: 2000, hydration: 80 },
    forages: [],
    end: { pos: endPos, haven: { x: 4, y: 4 }, over: false, day: 6, kcal: 1500, hydration: 80 },
    vetoes: 0, silentVetoes: 0, lateralPasses: 0, creditUses: 0, simChecks: 0,
    beyondUngenerated: 0, homewardVetoes: 0, vetoOriginPass: 0, vetoOriginFail: 0,
    hops, dayEndReturnSim: { ok: endOk, via: null, directOk: true, legs: 0, reason: null, creditUsed: 0, hops: 0, beyondUngenerated: 0 },
    construct: { shape: 'C', loopDay: 6, kind: 'attempt', startPos, steps: [], posAfterForced: null, attempt } };
}
function inst(seed, days) {
  return { seed, policy: 'construct-shadow', days: 30, daysAlive: 30, endReason: 'done', gameDays: 30, days };
}
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cband-newdef-proof-'));
function runNewdef(s, a, dest, origin, stage2start) {
  const sf = path.join(tmp, 's.jsonl'), af = path.join(tmp, 'a.jsonl');
  fs.writeFileSync(sf, (Array.isArray(s) ? s : [s]).map((i) => JSON.stringify(i)).join('\n') + '\n');
  fs.writeFileSync(af, (Array.isArray(a) ? a : [a]).map((i) => JSON.stringify(i)).join('\n') + '\n');
  return execFileSync('node', [path.join(ROOT, 'scripts', 'analyze-cband-newdef-b.js'),
    '--shadow', sf, '--armed', af, '--dest', dest, '--origin', origin, '--stage2start', stage2start],
    { encoding: 'utf8' });
}
const DEST = '0,7', ORIGIN = '0,6', S2 = '0,6';
const att = { hop: '0,6>0,7', attempted: true, moved: false, reason: 'refused' };
const attNotOffered = { hop: '0,6>0,7', attempted: false, moved: false, reason: 'not-offered' };
// Fixture 1: decided form fully met -> OUT true.
{
  const s = inst(69702, [day6({ x: 0, y: 6 }, { x: 0, y: 6 }, false, [hop(0, 6, 0, 7, false)], att)]);
  const a = inst(69702, [day6({ x: 0, y: 6 }, { x: 0, y: 6 }, true, [hop(0, 6, 0, 7, false, { vetoed: true, homeward: false, originSimOk: null })], att)]);
  const out = runNewdef(s, a, DEST, ORIGIN, S2);
  check('newdef OUT true on decided form', /newdefOut=true/.test(out) && /establishedBand=true/.test(out), out);
}
// Fixture 2: veto fired but armed day-6 stay fails -> OUT false, band still true.
{
  const s = inst(69702, [day6({ x: 0, y: 6 }, { x: 0, y: 6 }, false, [hop(0, 6, 0, 7, false)], att)]);
  const a = inst(69702, [day6({ x: 0, y: 6 }, { x: 0, y: 6 }, false, [hop(0, 6, 0, 7, false, { vetoed: true, homeward: false, originSimOk: null })], att)]);
  const out = runNewdef(s, a, DEST, ORIGIN, S2);
  check('newdef OUT false when armed stay fails', /newdefOut=false/.test(out) && /establishedBand=true/.test(out), out);
}
// Fixture 3: shadow hop passes -> OUT false.
{
  const s = inst(69702, [day6({ x: 0, y: 6 }, { x: 0, y: 7 }, true, [hop(0, 6, 0, 7, true)], att)]);
  const a = inst(69702, [day6({ x: 0, y: 6 }, { x: 0, y: 6 }, true, [hop(0, 6, 0, 7, true)], att)]);
  const out = runNewdef(s, a, DEST, ORIGIN, S2);
  check('newdef OUT false when shadow hop passes', /newdefOut=false/.test(out), out);
}
// Fixture 4: armed hop not vetoed -> OUT false.
{
  const s = inst(69702, [day6({ x: 0, y: 6 }, { x: 0, y: 6 }, false, [hop(0, 6, 0, 7, false)], att)]);
  const a = inst(69702, [day6({ x: 0, y: 6 }, { x: 0, y: 6 }, true, [hop(0, 6, 0, 7, false)], att)]);
  const out = runNewdef(s, a, DEST, ORIGIN, S2);
  check('newdef OUT false when armed not vetoed', /newdefOut=false/.test(out), out);
}
// Fixture 5: start-mismatch -> OUT false.
{
  const s = inst(69702, [day6({ x: 0, y: 6 }, { x: 0, y: 6 }, false, [hop(0, 6, 0, 7, false)], att)]);
  const a = inst(69702, [day6({ x: 3, y: 6 }, { x: 3, y: 6 }, true, [], att)]);
  const out = runNewdef(s, a, DEST, ORIGIN, S2);
  check('newdef OUT false on start-mismatch', /integrity=FAIL:start-mismatch/.test(out) && /newdefOut=false/.test(out), out);
}
// Fixture 6: attempt-not-offered -> OUT false.
{
  const s = inst(69702, [day6({ x: 0, y: 6 }, { x: 0, y: 6 }, false, [hop(0, 6, 0, 7, false)], att)]);
  const a = inst(69702, [day6({ x: 0, y: 6 }, { x: 0, y: 6 }, true, [], attNotOffered)]);
  const out = runNewdef(s, a, DEST, ORIGIN, S2);
  check('newdef OUT false on attempt-not-offered', /integrity=FAIL:attempt-not-offered/.test(out) && /newdefOut=false/.test(out), out);
}
// Fixture 7: two-pair run sums to 1.
{
  const s1 = inst(69702, [day6({ x: 0, y: 6 }, { x: 0, y: 6 }, false, [hop(0, 6, 0, 7, false)], att)]);
  const a1 = inst(69702, [day6({ x: 0, y: 6 }, { x: 0, y: 6 }, true, [hop(0, 6, 0, 7, false, { vetoed: true, homeward: false, originSimOk: null })], att)]);
  const s2 = inst(69704, [day6({ x: 0, y: 6 }, { x: 0, y: 6 }, false, [hop(0, 6, 0, 7, false)], att)]);
  const a2 = inst(69704, [day6({ x: 0, y: 6 }, { x: 0, y: 6 }, false, [hop(0, 6, 0, 7, false, { vetoed: true, homeward: false, originSimOk: null })], att)]);
  const out = runNewdef([s1, s2], [a1, a2], DEST, ORIGIN, S2);
  check('newdef summary counts 1 of 2', /NEWDEF-SUMMARY .* newdefOut=1/.test(out), out);
}

// (b) Homeward leg: unchanged shapes analyzer emits EPISODE-C on a
// C-qualifying day (armed start != haven, vetoed homeward hop
// simOk false + originSimOk true, both dayEnds true, shadow same
// hop simOk false, homewardVetoes >= 1).
{
  function shapeDay(loopDay, startPos, endOk, hops, hv) {
    return { loopDay,
      start: { pos: startPos, haven: { x: 4, y: 4 }, over: false, day: loopDay, kcal: 2000, hydration: 80 },
      forages: [],
      end: { pos: startPos, haven: { x: 4, y: 4 }, over: false, day: loopDay, kcal: 1500, hydration: 80 },
      vetoes: 0, silentVetoes: 0, lateralPasses: 0, creditUses: 0, simChecks: 0,
      beyondUngenerated: 0, homewardVetoes: hv, vetoOriginPass: 1, vetoOriginFail: 0,
      hops, dayEndReturnSim: { ok: endOk, via: null, directOk: true, legs: 0, reason: null, creditUsed: 0, hops: 0, beyondUngenerated: 0 },
      construct: null };
  }
  const s = { seed: 69601, policy: 'construct-shadow', days: 30, daysAlive: 30, endReason: 'done', gameDays: 30,
    days: [shapeDay(6, { x: 2, y: 8 }, true, [hop(2, 8, 4, 8, false, { homeward: true })], 0)] };
  const a = { seed: 69601, policy: 'construct-armed', days: 30, daysAlive: 30, endReason: 'done', gameDays: 30,
    days: [shapeDay(6, { x: 2, y: 8 }, true, [hop(2, 8, 4, 8, false, { vetoed: true, homeward: true, originSimOk: true })], 1)] };
  const sf = path.join(tmp, 'hs.jsonl'), af = path.join(tmp, 'ha.jsonl');
  fs.writeFileSync(sf, JSON.stringify(s) + '\n');
  fs.writeFileSync(af, JSON.stringify(a) + '\n');
  const out = execFileSync('node', [path.join(ROOT, 'scripts', 'analyze-homeward-shapes-b.js'),
    '--episodes', '--shadow', sf, '--armed', af], { encoding: 'utf8' });
  check('shapes analyzer EPISODE-C on homeward fixture', /EPISODE-C seed=69601/.test(out) && /EPISODES total=1 A=0 C=1/.test(out), out);
}

// (c) Reused files unmodified.
const REUSED = ['scripts/analyze-cband-b.js', 'scripts/analyze-homeward-shapes-b.js',
  'scripts/homeconstruct-b-driver.js', 'scripts/analyze-homeconstruct-b.js',
  'scripts/analyze-destfirst-b.js', 'scripts/destfirst-b-screen.js', 'scripts/destfirst-b-confirm.js',
  'scripts/policies/competent-homewardconstruct-b.js', 'scripts/policies/competent-homewardstep-b.js',
  'scripts/policies/competent.js', 'src/js'];
let gitOut = '';
try {
  gitOut = execFileSync('git', ['status', '--porcelain', '--'].concat(REUSED), { cwd: ROOT, encoding: 'utf8' });
} catch (e) { gitOut = 'ERROR ' + (e && e.message); }
check('reused files unmodified', gitOut.trim() === '', gitOut);

console.log('cband-newdef proof: ' + pass + ' pass, ' + fail + ' fail');
process.exit(fail ? 1 : 0);

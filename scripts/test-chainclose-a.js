#!/usr/bin/env node
// scripts/test-chainclose-a.js — sim-chainclose-a fixture + determinism proof.
// DIAG ONLY: pure functions + one scratch re-run; never game state.
// Usage:
//   node scripts/test-chainclose-a.js
//     (fixtures; prints FIXTURES-PASS / FIXTURES-FAIL, exit code)
//   node scripts/test-chainclose-a.js --determinism <seed>
//     (re-runs that seed into a scratch EVID dir via sweep-chainclose-a.js
//      --one, diffs the row JSON byte-for-byte against the corpus row, prints
//      the verdict, and removes the scratch dir afterwards.)
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { closeTarget, meetingsAvail, bindingClass, computeCloseTargets, buildChains, medianOf } =
  require('./analyze-chainclose-a');

let checks = 0, fails = 0;
function check(name, cond) {
  checks++;
  if (!cond) { fails++; console.log(`FAIL: ${name}`); }
}
function eq(name, a, b) { check(`${name} (got ${JSON.stringify(a)} want ${JSON.stringify(b)})`, a === b); }

// Worked illustration from the prereg (chainfinish numbers ONLY, to pin arithmetic).
eq('illustration meetingsAvail(0.8,27)', meetingsAvail(0.8, 27), 21);
eq('illustration closeTarget(853,21)', closeTarget(853, 21), 41);
eq('ceil rounds up', closeTarget(100, 3), 34);
eq('exact division', closeTarget(100, 4), 25);
eq('zero remaining -> 0', closeTarget(0, 5), 0);
eq('M=0 -> Infinity', closeTarget(853, 0), Infinity);
eq('M<1 -> Infinity', closeTarget(853, 0.5), Infinity);
eq('meetingsAvail floor', meetingsAvail(0.8, 27), 21);
eq('meetingsAvail zero pace', meetingsAvail(0, 27), 0);
eq('meetingsAvail null pace', meetingsAvail(null, 27), 0);
eq('meetingsAvail negative runway', meetingsAvail(0.8, -1), 0);
// Binding classes.
eq('binding daily>60', bindingClass(100, 200), 'LIFETIME-HP-BOUND');
eq('binding daily inf', bindingClass(Infinity, Infinity), 'LIFETIME-HP-BOUND');
eq('binding pace', bindingClass(30, 100), 'PACE-BOUND');
eq('binding pace inf chain', bindingClass(30, Infinity), 'PACE-BOUND');
eq('binding damage-scale', bindingClass(30, 41), 'DAMAGE-SCALE-QUESTION');
// Chain splitting on an HP break.
{
  const chains = buildChains([
    { seed: 1, day: 55, part: 0, mid: 'eulogy', mHpStart: 900, mHpLeft: 877, mDealt: 23 },
    { seed: 1, day: 56, part: 0, mid: 'eulogy', mHpStart: 877, mHpLeft: 853, mDealt: 24 },
    { seed: 1, day: 70, part: 0, mid: 'eulogy', mHpStart: 900, mHpLeft: 900, mDealt: 0 },
  ]);
  eq('split chains count', chains.length, 2);
  eq('first chain n', chains[0].meetings.length, 2);
  eq('second chain n', chains[1].meetings.length, 1);
}
// computeCloseTargets on synthetic chains.
{
  const rows = [{ seed: 1, days: 86, endReason: 'village-lost' }];
  const wild = [
    { seed: 1, day: 55, part: 0, mid: 'eulogy', mDealt: 23 },
    { seed: 1, day: 56, part: 0, mid: 'eulogy', mDealt: 24 },
    { seed: 1, day: 57, part: 0, mid: 'eulogy', mDealt: 0 },
    { seed: 1, day: 59, part: 0, mid: 'eulogy', mDealt: 0 },
    { seed: 1, day: 74, part: 0, mid: 'audit', mDealt: 58 },
  ];
  const chains = [{
    mid: 'eulogy', seed: 1, openingHp: 900, lastLeft: 853, breakReason: null,
    n: 4, dealt: [23, 24, 0, 0], medianRate: 11.5, bestRate: 24, remainingHp: 853,
    meetingsToFinishMedian: 75, meetingsToFinishBest: 36, intervals: [1, 1, 2],
    meetings: wild.slice(0, 4).map(m => ({ day: m.day, part: m.part })),
  }, {
    mid: 'audit', seed: 1, openingHp: 1066, lastLeft: 1008, breakReason: null,
    n: 1, dealt: [58], medianRate: 58, bestRate: 58, remainingHp: 1008,
    meetingsToFinishMedian: null, meetingsToFinishBest: null, intervals: [],
    meetings: [{ day: 74, part: 0 }],
  }];
  const res = computeCloseTargets(chains, rows, wild);
  const eul = res.targets.find(t => t.mid === 'eulogy');
  const aud = res.targets.find(t => t.mid === 'audit');
  eq('eulogy pChain', eul.pChain, 0.8);
  eq('eulogy tRem', eul.tRem, 27);
  eq('eulogy mChain', eul.mChain, 21);
  eq('eulogy cChain', eul.cChain, 41);
  eq('eulogy binding', eul.binding, 'DAMAGE-SCALE-QUESTION');
  eq('eulogy cDaily', eul.cDaily, 32); // ceil(853/27)=32 <=60, pace gives 41 <=60
  eq('audit cChain null (n=1)', aud.cChain, null);
  check('audit cSeed finite', isFinite(aud.cSeed));
  eq('undefChainPace count', res.nChainPaceUndefined, 1);
  eq('lifetime after first contact', res.lifetime[1].lifetimeAfterFirstContact, 31);
  eq('lifetime censored false', res.lifetime[1].censored, false);
  // Threshold fractions: chain pace denom = 1 (eulogy only); eulogy 41 <= 41, <= 60, not <= 20.
  eq('frac le20 chain pace', res.chainPaceFrac.le20, 0);
  eq('frac le41 chain pace', res.chainPaceFrac.le41, 1);
  eq('frac le60 chain pace', res.chainPaceFrac.le60, 1);
  eq('seed level le41', res.seedLevel.le41[0], 1);
  eq('seed level le41 denom', res.seedLevel.le41[1], 1);
  // Censored carry.
  const res2 = computeCloseTargets(chains, [{ seed: 1, days: 180, endReason: 'survived' }], wild);
  eq('censored true', res2.lifetime[1].censored, true);
  eq('censored tRem', res2.targets[0].tRem, 121);
  // Infinity case: chain whose last meeting is the death day -> T_rem 0.
  const res3 = computeCloseTargets(chains, [{ seed: 1, days: 59, endReason: 'village-lost' }], wild);
  const eul3 = res3.targets.find(t => t.mid === 'eulogy');
  eq('T_rem 0 -> mChain 0', eul3.mChain, 0);
  eq('T_rem 0 -> cChain Infinity', eul3.cChain, Infinity);
  eq('Infinity counts as not closable in frac', res3.chainPaceFrac.le60, 0);
// Cross-seed same-mid separation (prereg: same mid on the SAME seed).
{
  const chains = buildChains([
    { seed: 1, day: 74, part: 0, mid: 'audit', mHpStart: 1100, mHpLeft: 1042, mDealt: 58 },
    { seed: 2, day: 60, part: 0, mid: 'audit', mHpStart: 1100, mHpLeft: 1086, mDealt: 14 },
    { seed: 1, day: 80, part: 0, mid: 'audit', mHpStart: 1042, mHpLeft: 1000, mDealt: 42 },
  ]);
  eq('cross-seed chains count', chains.length, 2);
  const s1 = chains.find(c => c.seed === 1 || (c.meetings[0] && c.meetings[0].seed === 1));
  check('seed1 audit chain has 2 meetings', s1 && s1.meetings.length === 2);
  check('seed1 audit chain unbroken', s1 && !s1.breakReason);
}
// Censored = survived only; over-other (won run) is run-end-exact.
{
  const rows = [{ seed: 1, days: 118, endReason: 'over-other' }];
  const wild = [{ seed: 1, day: 57, part: 0, mid: 'reunion', mDealt: 12 }];
  const chains = [{ mid: 'reunion', seed: 1, openingHp: 1200, lastLeft: 1188, breakReason: null,
    n: 1, dealt: [12], medianRate: 12, bestRate: 12, remainingHp: 1188,
    meetingsToFinishMedian: null, meetingsToFinishBest: null, intervals: [],
    meetings: [{ day: 57, part: 0 }] }];
  const res = computeCloseTargets(chains, rows, wild);
  eq('over-other not censored', res.lifetime[1].censored, false);
  eq('n=1 binding pace-unknown', res.targets[0].binding, 'PACE-UNKNOWN-N1');
}
  // medianOf sanity.
  eq('medianOf even', medianOf([23, 24, 0, 0]), 11.5);
}

function determinism(seed) {
  const corpusDir = path.join(REPO, 'evidence', '2026-10-30', 'perseed-chainclose-a');
  const scratch = path.join(REPO, 'evidence', '2026-10-30', `perseed-chainclose-a-det-${seed}`);
  try { fs.rmSync(scratch, { recursive: true, force: true }); } catch (e) {}
  console.log(`DETERMINISM: re-running seed ${seed} into scratch dir...`);
  try {
    execFileSync(process.execPath, [path.join(REPO, 'scripts', 'sweep-chainclose-a.js'), '--one', String(seed)],
      { cwd: REPO, env: Object.assign({}, process.env, { EVID: scratch }), stdio: 'inherit', timeout: 600000 });
  } catch (e) {
    console.log('DETERMINISM-FAIL: scratch re-run errored');
    try { fs.rmSync(scratch, { recursive: true, force: true }); } catch (e2) {}
    return false;
  }
  const corpusRow = path.join(corpusDir, `s${seed}-fresh.json`);
  const scratchRow = path.join(scratch, `s${seed}-fresh.json`);
  let ok = false;
  try {
    const a = fs.readFileSync(corpusRow, 'utf8');
    const b = fs.readFileSync(scratchRow, 'utf8');
    ok = (a === b);
    console.log(ok ? 'DETERMINISM-PASS: row JSON byte-identical' : 'DETERMINISM-FAIL: row JSON differs');
  } catch (e) {
    console.log(`DETERMINISM-FAIL: read error ${e && e.message}`);
  }
  try { fs.rmSync(scratch, { recursive: true, force: true }); console.log('DETERMINISM: scratch dir removed'); } catch (e) {}
  return ok;
}

function main() {
  const args = process.argv.slice(2);
  if (args.indexOf('--determinism') >= 0) {
    const seed = parseInt(args[args.indexOf('--determinism') + 1], 10);
    if (!Number.isFinite(seed)) { console.log('DETERMINISM-FAIL: bad seed'); process.exit(1); }
    process.exit(determinism(seed) ? 0 : 1);
  }
  console.log(`FIXTURES: ${checks} checks, ${fails} fails`);
  console.log(fails === 0 ? 'FIXTURES-PASS' : 'FIXTURES-FAIL');
  process.exit(fails === 0 ? 0 : 1);
}
if (require.main === module) main();
module.exports = { determinism };

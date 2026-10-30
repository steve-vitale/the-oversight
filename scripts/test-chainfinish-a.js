#!/usr/bin/env node
// scripts/test-chainfinish-a.js — sim-chainfinish-a fixture + determinism proof.
// DIAG ONLY: pure functions + one scratch re-run; never game state.
// Usage:
//   node scripts/test-chainfinish-a.js --fixtures
//   node scripts/test-chainfinish-a.js --determinism <seed>
//     (re-runs that seed into a scratch EVID dir via sweep-chainfinish-a.js
//      --one, diffs the row byte-for-byte against the corpus row, prints
//      the verdict, and removes the scratch dir afterwards.)
// When required as a module, main() does NOT run.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { classifyZero, medianOf, price, buildChains, chainPrice } = require('./analyze-chainfinish-a');

function fixtures() {
  let checks = 0, fails = 0;
  const eq = (name, got, want) => {
    checks++;
    if (JSON.stringify(got) !== JSON.stringify(want)) {
      fails++;
      console.log(`  FIXTURE-FAIL ${name}: got=${JSON.stringify(got)} want=${JSON.stringify(want)}`);
    }
  };
  const J = (o) => Object.assign({
    bl: { rounds: 1, outcome: 'vFlee', trickLog: [], mDealt: 0 },
    dp: { log: [], loadoutPost: { melee: 'kitchen_knife', ranged: null, carriedWeapons: ['kitchen_knife'] } },
    fp: { leader: { armed: true } },
  }, o);
  // Pre-contact classes.
  eq('pre-contact scatter', classifyZero(J({ bl: { rounds: 0, outcome: 'mFlee', trickLog: [] } })).cls, 'PRE-CONTACT-SCATTER');
  eq('pre-contact flee', classifyZero(J({ bl: { rounds: 0, outcome: 'vFlee', trickLog: [] } })).cls, 'PRE-CONTACT-FLEE');
  eq('pre-contact death', classifyZero(J({ bl: { rounds: 0, outcome: 'vDie', trickLog: [] } })).cls, 'PRE-CONTACT-DEATH');
  // Narration beats weapon (both present -> narration).
  eq('narration beats weapon', classifyZero(J({
    bl: { rounds: 2, outcome: 'vDie', trickLog: ['contradict', 'contradict'] },
    dp: { log: ['R1: Aria contradicts the narration — it says Aria runs — Aria advances.',
      'Daniyar has Sling but no arrows — the string stays drawn, useless.'],
      loadoutPost: { melee: null, ranged: 'sling', carriedWeapons: ['sling'] } },
  })).cls, 'NARRATION-SUPPRESSED');
  // Narration via log line alone (empty trickLog).
  eq('narration via log only', classifyZero(J({
    bl: { rounds: 1, outcome: 'vFlee', trickLog: [] },
    dp: { log: ['R1: Daniyar contradicts the narration — it says Daniyar runs — Daniyar advances.'],
      loadoutPost: { melee: null, ranged: 'sling', carriedWeapons: ['sling'] } },
  })).cls, 'NARRATION-SUPPRESSED');
  // No usable weapon: ranged-only, no arrows, no contradict.
  eq('no usable weapon sling', classifyZero(J({
    bl: { rounds: 2, outcome: 'vDie', trickLog: [] },
    dp: { log: ['Daniyar has Sling but no arrows — the string stays drawn, useless.',
      'R1: Daniyar stops mid-fight and binds the wound — field medicine, +20 HP.'],
      loadoutPost: { melee: null, ranged: 'sling', carriedWeapons: ['sling'] } },
  })).cls, 'NO-USABLE-WEAPON');
  // Unarmed fighter.
  eq('unarmed', classifyZero(J({
    bl: { rounds: 1, outcome: 'vFlee', trickLog: [] },
    dp: { log: [], loadoutPost: { melee: null, ranged: null, carriedWeapons: [] } },
    fp: { leader: { armed: false } },
  })).cls, 'NO-USABLE-WEAPON');
  // Melee weapon present, no strike, medicine consumed the turn.
  eq('turn consumed medicine', classifyZero(J({
    bl: { rounds: 1, outcome: 'vFlee', trickLog: [] },
    dp: { log: ['R1: Ursula stops mid-fight and binds the wound — field medicine, +20 HP.'],
      loadoutPost: { melee: 'bow', ranged: null, carriedWeapons: ['bow'] } },
  })).cls, 'TURN-CONSUMED-OTHER');
  // Strike line present but zero damage -> contradiction class.
  eq('strike without damage', classifyZero(J({
    bl: { rounds: 1, outcome: 'vFlee', trickLog: [] },
    dp: { log: ['R1: Faina strikes for 15 (1185 left)'],
      loadoutPost: { melee: 'hatchet', ranged: null, carriedWeapons: ['hatchet'] } },
  })).cls, 'STRIKE-WITHOUT-DAMAGE');
  // Round-0 kill is not a pre-contact class -> OTHER (taxonomy must not hide it).
  eq('round0 vKill is OTHER', classifyZero(J({ bl: { rounds: 0, outcome: 'vKill', trickLog: [] } })).cls, 'OTHER');
  // Beast vs leader zero split (definitions, hand-computed).
  const leaderDealt = (mDealt, allyDealt) => mDealt - allyDealt;
  eq('beast-zero both zero', leaderDealt(0, 0) === 0 && 0 === 0, true);
  eq('leader-zero ally-positive is NOT beast-zero', leaderDealt(6, 6) === 0 && 6 > 0, true);
  eq('leader-positive', leaderDealt(24, 6), 18);
  // Median / price arithmetic (hand-computed).
  eq('median odd', medianOf([23, 24, 0]), 23);
  eq('median even', medianOf([0, 0, 23, 24]), 11.5);
  eq('median single', medianOf([15]), 15);
  eq('price median eulogy-like', price(853, 11.5), 75);
  eq('price best', price(853, 24), 36);
  eq('price zero rate is never', price(853, 0), null);
  eq('price zero remaining', price(0, 11.5), 0);
  // Chain splitting on an HP break (hand-computed).
  const ms = [
    { seed: 75102, day: 55, part: 1, mid: 'eulogy', mHpStart: 900, mHpLeft: 877, mDealt: 23, outcome: 'vFlee', rounds: 2, caller: 'resolve', leaderVid: 'a' },
    { seed: 75102, day: 56, part: 2, mid: 'eulogy', mHpStart: 877, mHpLeft: 877, mDealt: 0, outcome: 'vFlee', rounds: 1, caller: 'aid', leaderVid: 'b' },
    { seed: 75102, day: 65, part: 3, mid: 'eulogy', mHpStart: 900, mHpLeft: 900, mDealt: 0, outcome: 'vDie', rounds: 1, caller: 'aid', leaderVid: 'c' },
  ];
  const chains = buildChains(ms);
  eq('chain split count', chains.length, 2);
  eq('chain1 n', chains[0].meetings.length, 2);
  eq('chain2 n', chains[1].meetings.length, 1);
  eq('chain2 break reason mentions prev left', (chains[1].breakReason || '').indexOf('877') >= 0, true);
  const cp = chainPrice(chains[0]);
  eq('chain price dealt', cp.dealt, [23, 0]);
  eq('chain price median', cp.medianRate, 11.5);
  eq('chain price best', cp.bestRate, 23);
  eq('chain price remaining', cp.remainingHp, 877);
  eq('chain price median meetings', cp.meetingsToFinishMedian, 77); // ceil(877/11.5)=77 (76.26)
  eq('chain price best meetings', cp.meetingsToFinishBest, 39); // ceil(877/23)=39 (38.13)
  eq('chain intervals', cp.intervals, [1]);
  // Single-meeting chain gets no median price.
  const cp1 = chainPrice(chains[1]);
  eq('single chain no median price', cp1.meetingsToFinishMedian, null);
  eq('single chain no best price', cp1.meetingsToFinishBest, null);
  // Median-zero chain prices never at median but prices at best.
  const cz = chainPrice({ meetings: [
    { mDealt: 0 }, { mDealt: 0 }, { mDealt: 24 } ], lastLeft: 971 });
  eq('median-zero price null', cz.meetingsToFinishMedian, null);
  eq('median-zero best price', cz.meetingsToFinishBest, 41); // ceil(971/24)=41 (40.46)
  console.log(fails === 0 ? `FIXTURES-PASS (${checks} checks, 0 fails)` : `FIXTURES-FAIL (${checks} checks, ${fails} fails)`);
  return fails === 0;
}

function determinism(seed) {
  const corpusDir = path.join(REPO, 'evidence', '2026-10-29', 'perseed-chainfinish-a');
  const corpusRow = path.join(corpusDir, `s${seed}-fresh.json`);
  if (!fs.existsSync(corpusRow)) { console.log(`DETERMINISM-FAIL: corpus row missing: ${corpusRow}`); return false; }
  const scratch = path.join(REPO, 'evidence', '2026-10-29', `perseed-chainfinish-a-det-${seed}`);
  try { fs.rmSync(scratch, { recursive: true, force: true }); } catch (e) {}
  console.log(`DETERMINISM: re-running seed ${seed} into scratch dir...`);
  try {
    execSync(`node scripts/sweep-chainfinish-a.js --one ${seed}`, {
      cwd: REPO, env: Object.assign({}, process.env, { EVID: scratch }), stdio: 'inherit', timeout: 600000,
    });
  } catch (e) {
    console.log('DETERMINISM-FAIL: scratch re-run errored');
    try { fs.rmSync(scratch, { recursive: true, force: true }); } catch (e2) {}
    return false;
  }
  const scratchRow = path.join(scratch, `s${seed}-fresh.json`);
  let ok = false;
  try {
    const a = fs.readFileSync(corpusRow, 'utf8');
    const b = fs.readFileSync(scratchRow, 'utf8');
    ok = (a === b);
    console.log(ok ? `DETERMINISM-PASS: seed ${seed} row byte-identical` : `DETERMINISM-FAIL: seed ${seed} row differs (corpus ${a.length} bytes, rerun ${b.length} bytes)`);
  } catch (e) {
    console.log(`DETERMINISM-FAIL: diff error: ${e.message}`);
  }
  try { fs.rmSync(scratch, { recursive: true, force: true }); console.log('DETERMINISM: scratch dir removed'); } catch (e) {}
  return ok;
}

function main() {
  const args = process.argv.slice(2);
  if (args.indexOf('--determinism') >= 0) {
    const seed = parseInt(args[args.indexOf('--determinism') + 1], 10);
    if (!Number.isFinite(seed)) { console.log('DETERMINISM-FAIL: pass a seed'); process.exit(1); }
    process.exit(determinism(seed) ? 0 : 1);
  }
  process.exit(fixtures() ? 0 : 1);
}
if (require.main === module) main();
module.exports = { fixtures, determinism };

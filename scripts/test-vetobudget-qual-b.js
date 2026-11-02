#!/usr/bin/env node
// test-vetobudget-qual-b.js — proof for the qualification screen analyzer
// (sim-vetobudget-qual-b). Synthetic driver records only; no game boot.
// Checks, on fake guard-only records:
//  1. a step with 6 total silent vetoes (any day spread) => repetition seed
//  2. a step with silent vetoes on 4 distinct days (fewer than 6 total)
//     => repetition seed
//  3. a step with 5 total silent on 3 days => NOT a repetition seed
//  4. a step with 3 total silent => would-abandon, but NOT repetition
//  5. a 1-silent 2-day flicker (the 1345Z confirm band's max) => neither
//  6. spoken vetoes (vetoed && !silent) never count toward any total
//  7. different step keys carry independent totals
//  8. band rule: 2 repetition seeds => QUALIFIED; 1 would-abandon step
//     with 0 repetition seeds => QUALIFIED; neither => NOT-QUALIFIED
//  9. non-guard-only policy input is rejected (exit 2) by the CLI
'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { analyzeSeed } = require('./analyze-vetobudget-qual-b');

function hop(from, to, silent) {
  const [fx, fy] = from.split(',').map(Number);
  const [tx, ty] = to.split(',').map(Number);
  return { from: { x: fx, y: fy }, to: { x: tx, y: ty }, vetoed: true, silent: !!silent };
}
function rec(seed, dayHops) {
  // dayHops: array of [loopDay, hops[]]
  return { seed, policy: 'competent-homewardstep-b', daysAlive: 60, endReason: 'survived',
    maxWaveUnlocked: 3,
    days: dayHops.map(([loopDay, hops]) => ({
      loopDay, vetoes: hops.length,
      silentVetoes: hops.filter((h) => h.silent).length, hops,
    })) };
}
function qualify(seeds) {
  const a = seeds.map(analyzeSeed);
  const reps = a.filter((s) => s.isRepetitionSeed).length;
  const wa = a.reduce((t, s) => t + s.wouldAbandon.length, 0);
  return { reps, wa, qualified: reps >= 2 || wa >= 1 };
}
let n = 0;
function check(name, fn) { fn(); n++; console.log('ok ' + n + ' - ' + name); }

// 1. six total silent => repetition
check('6 total silent => repetition', () => {
  const s = analyzeSeed(rec(1, [[9, [hop('4,4', '4,1', true), hop('4,4', '4,1', true), hop('4,4', '4,1', true)]],
    [10, [hop('4,4', '4,1', true), hop('4,4', '4,1', true), hop('4,4', '4,1', true)]]]));
  assert.equal(s.isRepetitionSeed, true);
  assert.equal(s.steps[0].total, 6);
});
// 2. four distinct days => repetition (4 total)
check('4 distinct days => repetition', () => {
  const s = analyzeSeed(rec(2, [9, 10, 11, 12].map((d) => [d, [hop('3,3', '5,3', true)]])));
  assert.equal(s.isRepetitionSeed, true);
  assert.equal(s.steps[0].days, 4);
});
// 3. five total on three days => NOT repetition
check('5 total / 3 days => not repetition', () => {
  const s = analyzeSeed(rec(3, [[9, [hop('3,3', '5,3', true), hop('3,3', '5,3', true)]],
    [10, [hop('3,3', '5,3', true), hop('3,3', '5,3', true)]],
    [11, [hop('3,3', '5,3', true)]]]));
  assert.equal(s.isRepetitionSeed, false);
  assert.equal(s.wouldAbandon.length, 1); // 5 >= 3, so it IS would-abandon
});
// 4. three total silent => would-abandon, not repetition
check('3 total silent => would-abandon only', () => {
  const s = analyzeSeed(rec(4, [[9, [hop('3,3', '5,3', true), hop('3,3', '5,3', true), hop('3,3', '5,3', true)]]]));
  assert.equal(s.isRepetitionSeed, false);
  assert.equal(s.wouldAbandon.length, 1);
  assert.equal(s.wouldAbandon[0].total, 3);
});
// 5. 1-silent 2-day flicker => neither
check('1 silent / 2 days => neither', () => {
  const s = analyzeSeed(rec(5, [[34, [hop('3,3', '5,3', false), hop('3,3', '6,4', false)]],
    [35, [hop('3,3', '5,3', true)]]]));
  assert.equal(s.isRepetitionSeed, false);
  assert.equal(s.wouldAbandon.length, 0);
  assert.equal(s.vetoes, 3);
  assert.equal(s.silentVetoes, 1);
});
// 6. spoken vetoes never count
check('spoken vetoes never count', () => {
  const s = analyzeSeed(rec(6, [[9, Array(8).fill().map(() => hop('4,4', '4,1', false))]]));
  assert.equal(s.silentVetoes, 0);
  assert.equal(s.steps.length, 0);
  assert.equal(s.isRepetitionSeed, false);
});
// 7. independent step keys
check('step keys independent', () => {
  const s = analyzeSeed(rec(7, [[9, [hop('4,4', '4,1', true), hop('4,4', '4,1', true), hop('4,4', '4,1', true),
    hop('4,7', '2,7', true), hop('4,7', '2,7', true), hop('4,7', '2,7', true)]]]));
  assert.equal(s.steps.length, 2);
  assert.equal(s.wouldAbandon.length, 2);
  assert.equal(s.isRepetitionSeed, false);
});
// 8. band rule
check('band rule: 2 reps qualify', () => {
  const q = qualify([rec(11, [9, 10, 11, 12].map((d) => [d, [hop('3,3', '5,3', true)]])),
    rec(12, [9, 10, 11, 12].map((d) => [d, [hop('3,3', '5,3', true)]]))]);
  assert.equal(q.qualified, true);
});
check('band rule: 1 would-abandon qualifies, 0 reps', () => {
  const q = qualify([rec(13, [[9, [hop('3,3', '5,3', true), hop('3,3', '5,3', true), hop('3,3', '5,3', true)]]]),
    rec(14, [])]);
  assert.equal(q.reps, 0);
  assert.equal(q.qualified, true);
});
check('band rule: neither => not qualified', () => {
  const q = qualify([rec(15, [[35, [hop('3,3', '5,3', true)]]]), rec(16, [])]);
  assert.equal(q.qualified, false);
});
// 9. CLI rejects a non-guard-only leg
check('CLI rejects non-guard leg', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vetoqual-'));
  const f = path.join(dir, 'armed.jsonl');
  fs.writeFileSync(f, JSON.stringify({ seed: 1, policy: 'competent-vetobudget-b', days: [] }) + '\n');
  let code = 0;
  try { execFileSync(process.execPath, [path.join(__dirname, 'analyze-vetobudget-qual-b.js'), f], { stdio: 'pipe' }); } catch (e) { code = e.status; }
  assert.equal(code, 2);
  fs.rmSync(dir, { recursive: true, force: true });
});
console.log('test-vetobudget-qual-b: PASS ' + n + ' checks');

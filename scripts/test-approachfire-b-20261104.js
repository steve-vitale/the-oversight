// test-approachfire-b-20261104.js — proof for arm sim-approachfire-b.
// Proves, against the REAL policy loaded verbatim by the replay harness:
//  1. Zero policy/src behavior change (git diff empty for both policy files).
//  2. Baseline gate: the primary baseline replay reproduces the corpus
//     loop shape exactly (14 turns, all tbPlayerMove(0,7), 14 "No path
//     there.", 0 strikes, direct counters all 0, every branch flee).
//  3. Armed primary: the loop breaks WITHOUT the fallback firing
//     (2 turns: directional flee step + barrier exit, marks 0) — the
//     NO-GO evidence for the firing claim on this geometry.
//  4. Repeat determinism: two fresh runs of both primary legs are
//     byte-identical (JSON + transcript).
//  5. Counter validation: on the blocked-adjacent sensitivity the
//     direct counter DOES read >= 1 (marks 3, waits 15) and no
//     same-target blocked run >= 3 recurs after the first mark.
//  6. Approach-only gates: the loop persists (20/20 flee turns,
//     marks 0) — the fallback is unreachable while flee pre-empts it.
//  7. Haven sensitivity: flee held at haven, approach step to (3,6)
//     succeeds, strikes follow, marks 0.
// All harness runs go to /tmp (never into the repo). Evidence corpus
// generation is the harness itself, run by hand, not by this test.
// Run: node scripts/test-approachfire-b-20261104.js (exit 0 = all pass).
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const assert = require('assert');
const cp = require('child_process');
const REPO = path.join(__dirname, '..');
const HARNESS = path.join(REPO, 'scripts', 'probe-approachfire-b-20261104.js');

function runHarness(dir, leg, scenario, gates) {
  const args = [HARNESS, '--leg', leg, '--scenario', scenario, '--out', dir];
  if (gates) args.push('--gates', gates);
  cp.execFileSync(process.execPath, args, { encoding: 'utf8' });
  const base = 'approachfire-' + scenario + '-' + leg + (gates ? '-' + gates : '');
  return {
    json: JSON.parse(fs.readFileSync(path.join(dir, base + '.json'), 'utf8')),
    txt: fs.readFileSync(path.join(dir, base + '.txt'), 'utf8'),
    base: base,
  };
}
function maxRunAfterMark(turns) {
  const markTurn = turns.find(function (t) { return (t.countersAfter.marks || 0) > 0; });
  assert.ok(markTurn, 'a mark turn must exist for this check');
  let run = 0, max = 0, last = null;
  for (const t of turns) {
    if (t.turn <= markTurn.turn) continue;
    const mv = t.actions.filter(function (a) { return a.fn === 'tbPlayerMove'; });
    const zero = mv.length > 0 && t.post.mx === t.pre.mx && t.post.my === t.pre.my;
    const tgt = mv.length ? mv[mv.length - 1].args.join(',') : null;
    if (zero && tgt === last) run++;
    else if (zero) { run = 1; last = tgt; }
    else { run = 0; last = null; }
    if (run > max) max = run;
  }
  return max;
}

function main() {
  // 1. Zero policy behavior change.
  const diff = cp.execSync('git diff HEAD -- scripts/policies/competent.js scripts/policies/competent-approachfall-b.js', { cwd: REPO, encoding: 'utf8' });
  assert.strictEqual(diff.trim(), '', 'policy files must be unmodified vs HEAD');
  console.log('policy files unmodified vs HEAD (zero behavior change)');

  const dirA = fs.mkdtempSync(path.join(os.tmpdir(), 'approachfire-a-'));
  const dirB = fs.mkdtempSync(path.join(os.tmpdir(), 'approachfire-b-'));
  try {
    // 2. Baseline gate.
    const base = runHarness(dirA, 'baseline', 'primary');
    assert.strictEqual(base.json.turns.length, 14, 'baseline: 14 player turns');
    for (const t of base.json.turns) {
      assert.deepStrictEqual(t.actions.map(function (a) { return a.fn + '(' + a.args.join(',') + ')'; }), ['tbPlayerMove(0,7)'], 'baseline: every turn moves to (0,7)');
      assert.deepStrictEqual(t.say, ['No path there.'], 'baseline: every turn says No path there.');
      assert.strictEqual(t.branch, 'flee', 'baseline: every turn is a flee-branch turn');
    }
    assert.strictEqual(base.json.summary.noPathLines, 14, 'baseline: 14 No-path lines');
    assert.strictEqual(base.json.summary.strikes, 0, 'baseline: 0 strikes');
    assert.strictEqual(base.json.summary.maxSameTargetBlockedRun, 14, 'baseline: max run 14');
    assert.deepStrictEqual(base.json.summary.countersFinal, { marks: 0, waits: 0, repickSteps: 0, stuckTurns: 0, fleeBlocked: false, approachBlocked: false }, 'baseline: direct counters all 0');
    console.log('baseline gate: 14x (0,7) flee turns, No path x14, counters 0');

    // 3. Armed primary: loop broken without fallback firing.
    const armed = runHarness(dirA, 'armed', 'primary');
    assert.strictEqual(armed.json.turns.length, 2, 'armed primary: 2 turns to exit');
    assert.deepStrictEqual(armed.json.summary.branches, ['flee', 'flee-exit'], 'armed primary: directional flee step + barrier exit');
    assert.strictEqual(armed.json.summary.barrierExits, 1, 'armed primary: 1 barrier exit');
    assert.strictEqual(armed.json.summary.countersFinal.marks, 0, 'armed primary: marks 0 (fallback never fired)');
    assert.strictEqual(armed.json.summary.countersFinal.waits, 0, 'armed primary: waits 0');
    assert.strictEqual(armed.json.summary.countersFinal.repickSteps, 0, 'armed primary: repicks 0');
    console.log('armed primary: loop broken by directional flee exit in 2 turns, fallback marks 0');

    // 4. Repeat determinism.
    const base2 = runHarness(dirB, 'baseline', 'primary');
    const armed2 = runHarness(dirB, 'armed', 'primary');
    assert.strictEqual(base2.txt, base.txt, 'baseline transcript byte-identical on repeat');
    assert.strictEqual(base2.json && JSON.stringify(base2.json), JSON.stringify(base.json), 'baseline JSON identical on repeat');
    assert.strictEqual(armed2.txt, armed.txt, 'armed transcript byte-identical on repeat');
    assert.strictEqual(JSON.stringify(armed2.json), JSON.stringify(armed.json), 'armed JSON identical on repeat');
    console.log('repeat determinism: both primary legs byte-identical');

    // 5. Counter validation on blocked-adjacent sensitivity.
    const blocked = runHarness(dirA, 'armed', 'blocked-adjacent');
    assert.ok(blocked.json.summary.countersFinal.marks >= 1, 'blocked-adjacent: marks >= 1');
    assert.ok(blocked.json.summary.countersFinal.waits >= 1, 'blocked-adjacent: waits >= 1');
    assert.strictEqual(maxRunAfterMark(blocked.json.turns), 1, 'blocked-adjacent: no run >= 3 after the first mark (single re-probes only)');
    console.log('counter validation: blocked-adjacent marks=' + blocked.json.summary.countersFinal.marks + ' waits=' + blocked.json.summary.countersFinal.waits + ', max run after mark 1');

    // 6. Approach-only gates: loop persists, fallback unreachable.
    const only = runHarness(dirA, 'armed', 'primary', 'approach-only');
    assert.strictEqual(only.json.turns.length, 20, 'approach-only: 20 turns run');
    assert.strictEqual(only.json.summary.maxSameTargetBlockedRun, 20, 'approach-only: loop persists 20/20');
    assert.strictEqual(only.json.summary.countersFinal.marks, 0, 'approach-only: marks 0');
    console.log('approach-only: loop persists 20/20, marks 0 (flee pre-emption)');

    // 7. Haven sensitivity: approach step + strikes, marks 0.
    const haven = runHarness(dirA, 'armed', 'haven');
    assert.deepStrictEqual(haven.json.turns[0].actions.map(function (a) { return a.fn + '(' + a.args.join(',') + ')'; }), ['tbPlayerMove(3,6)'], 'haven: first turn steps to (3,6)');
    assert.strictEqual(haven.json.turns[0].branch, 'approach', 'haven: first turn is approach');
    assert.ok(haven.json.summary.strikes >= 1, 'haven: strikes follow');
    assert.strictEqual(haven.json.summary.countersFinal.marks, 0, 'haven: marks 0');
    console.log('haven: approach step (3,6) then strikes, marks 0');
  } finally {
    fs.rmSync(dirA, { recursive: true, force: true });
    fs.rmSync(dirB, { recursive: true, force: true });
  }
  console.log('test-approachfire-b-20261104: ALL PASS');
}

main();

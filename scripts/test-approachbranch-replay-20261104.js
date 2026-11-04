// test-approachbranch-replay-20261104.js — proof for the true-approach
// replay (arm sim-approachbranch-a). Proves, against the REAL policy
// loaded verbatim by the replay harness:
//   1. Zero policy/src behavior change (git diff empty for both
//      policy files).
//   2. Baseline gate: the primary baseline replay reproduces the
//      corpus shape on judged turns 1-7 (every move tbPlayerMove(3,5),
//      "No path there.", 0 strikes, direct counters all 0, every
//      branch approach). Turn 8 (HP 0.25) is a legacy-flee turn and
//      is NOT gated (it issues tbPlayerMove(0,4) -> "Too far").
//   3. Armed primary (the prereg's judged leg): marks 1 at turn 3,
//      repick step to (4,5) at turn 4, strikes on turns 5-8, post-
//      firing max blocked run 0 — the fallback FIRES and BREAKS the
//      loop on a true-approach geometry.
//   4. Repeat determinism: two fresh runs of both primary legs are
//      byte-identical (JSON + transcript).
//   5. seq5 sensitivity: same shape (marks 1, repick turn 4).
//   6. Approach-only gates: marks 1, repick turn 4 — the firing
//      isolates to the fallback gate, not the other three gates.
//   7. Negative controls for the live board: cornercut ((4,5)
//      blocked alone) steps around via (3,4) and lands (3,5) on
//      turn 1; bothsides ((4,5)+(3,4) blocked) steps along the
//      detour path to (2,3) on turn 1 and lands (3,5) on turn 2.
//      Neither reproduces the corpus "No path there." line, so the
//      live board blocks (3,5) itself — the primary board is
//      forced, not merely minimal.
//   8. Priming: unprimed+haven is turn-for-turn identical to the
//      primed primary (haven hold falls through to approach);
//      unprimed+node42 diverges at turn 1 (directional flee walk
//      to (4,5), then strikes, marks 0) — the fight-start
//      assessment fires on turn 1 only, and priming is what keeps
//      the replay on the recorded round-2+ trajectory.
// All harness runs go to /tmp (never into the repo). Evidence corpus
// generation is the harness itself, run by hand, not by this test.
// Run: node scripts/test-approachbranch-replay-20261104.js (exit 0 = all pass).
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const assert = require('assert');
const cp = require('child_process');
const REPO = path.join(__dirname, '..');
const HARNESS = path.join(REPO, 'scripts', 'probe-approachbranch-a-20261104.js');

function runHarness(dir, leg, scenario, gates) {
  const args = [HARNESS, '--leg', leg, '--scenario', scenario, '--out', dir];
  if (gates) args.push('--gates', gates);
  cp.execFileSync(process.execPath, args, { encoding: 'utf8' });
  const base = 'approachbranch-' + scenario + '-' + leg + (gates ? '-' + gates : '');
  return {
    json: JSON.parse(fs.readFileSync(path.join(dir, base + '.json'), 'utf8')),
    txt: fs.readFileSync(path.join(dir, base + '.txt'), 'utf8'),
    base: base,
  };
}
function acts(t) {
  return t.actions.map(function (a) { return a.fn + '(' + a.args.join(',') + ')'; });
}

function main() {
  // 1. Zero policy behavior change.
  const diff = cp.execSync('git diff HEAD -- scripts/policies/competent.js scripts/policies/competent-approachfall-b.js', { cwd: REPO, encoding: 'utf8' });
  assert.strictEqual(diff.trim(), '', 'policy files must be unmodified vs HEAD');
  console.log('policy files unmodified vs HEAD (zero behavior change)');

  const dirA = fs.mkdtempSync(path.join(os.tmpdir(), 'approachbranch-a-'));
  const dirB = fs.mkdtempSync(path.join(os.tmpdir(), 'approachbranch-b-'));
  try {
    // 2. Baseline gate (judged turns 1-7 only).
    const base = runHarness(dirA, 'baseline', 'primary');
    assert.strictEqual(base.json.turns.length, 8, 'baseline: 8 turns run');
    for (let i = 0; i < 7; i++) {
      const t = base.json.turns[i];
      assert.deepStrictEqual(acts(t), ['tbPlayerMove(3,5)'], 'baseline turn ' + (i + 1) + ': moves to (3,5)');
      assert.deepStrictEqual(t.say, ['No path there.'], 'baseline turn ' + (i + 1) + ': No path there.');
      assert.strictEqual(t.branch, 'approach', 'baseline turn ' + (i + 1) + ': approach branch');
    }
    assert.strictEqual(base.json.summary.strikes, 0, 'baseline: 0 strikes');
    assert.deepStrictEqual(base.json.summary.countersFinal,
      { marks: 0, waits: 0, repickSteps: 0, stuckTurns: 0, fleeBlocked: false, approachBlocked: false },
      'baseline: direct counters all 0');
    assert.strictEqual(base.json.turns[7].branch, 'flee', 'baseline turn 8: legacy flee (not gated)');
    assert.deepStrictEqual(acts(base.json.turns[7]), ['tbPlayerMove(0,4)'], 'baseline turn 8: legacy flee walk to (0,4)');
    console.log('baseline gate: turns 1-7 all (3,5) No-path approach steps, counters 0');

    // 3. Armed primary: the judged firing.
    const armed = runHarness(dirA, 'armed', 'primary');
    assert.strictEqual(armed.json.summary.countersFinal.marks, 1, 'armed primary: marks 1');
    assert.strictEqual(armed.json.summary.firstMarkTurn, 3, 'armed primary: first mark turn 3');
    assert.strictEqual(armed.json.summary.countersFinal.repickSteps, 1, 'armed primary: repickSteps 1');
    assert.strictEqual(armed.json.summary.countersFinal.stuckTurns, 3, 'armed primary: stuckTurns 3');
    assert.strictEqual(armed.json.summary.countersFinal.waits, 0, 'armed primary: waits 0');
    assert.deepStrictEqual(acts(armed.json.turns[3]), ['tbPlayerMove(4,5)'], 'armed primary turn 4: repick step to (4,5)');
    assert.strictEqual(armed.json.turns[3].branch, 'approach-repick', 'armed primary turn 4: approach-repick branch');
    // The blocked branch ends the turn after the re-pick step (endTurn
    // in competent.js), so moveLeft is 0 and acted is true post-turn.
    assert.deepStrictEqual(armed.json.turns[3].post, { mx: 4, my: 5, hp: 56, moveLeft: 0, acted: true }, 'armed primary turn 4: lands (4,5), turn ended');
    for (let i = 4; i < 8; i++) {
      assert.strictEqual(armed.json.turns[i].branch, 'strike', 'armed primary turn ' + (i + 1) + ': strike');
    }
    assert.strictEqual(armed.json.summary.strikes, 4, 'armed primary: 4 strikes');
    assert.strictEqual(armed.json.summary.postFiringMaxRun, 0, 'armed primary: post-firing max run 0');
    assert.strictEqual(armed.json.summary.maxSameTargetBlockedRun, 3, 'armed primary: max run 3 (pre-firing only)');
    console.log('armed primary: mark turn 3, repick (4,5) turn 4, strikes turns 5-8, post-firing run 0');

    // 4. Repeat determinism.
    const base2 = runHarness(dirB, 'baseline', 'primary');
    const armed2 = runHarness(dirB, 'armed', 'primary');
    assert.strictEqual(JSON.stringify(base2.json), JSON.stringify(base.json), 'baseline repeat: JSON identical');
    assert.strictEqual(base2.txt, base.txt, 'baseline repeat: transcript identical');
    assert.strictEqual(JSON.stringify(armed2.json), JSON.stringify(armed.json), 'armed repeat: JSON identical');
    assert.strictEqual(armed2.txt, armed.txt, 'armed repeat: transcript identical');
    console.log('repeat determinism: both primary legs byte-identical');

    // 5. seq5 sensitivity.
    const seq5 = runHarness(dirA, 'armed', 'seq5');
    assert.strictEqual(seq5.json.summary.countersFinal.marks, 1, 'seq5: marks 1');
    assert.deepStrictEqual(acts(seq5.json.turns[3]), ['tbPlayerMove(4,5)'], 'seq5 turn 4: repick to (4,5)');
    assert.strictEqual(seq5.json.summary.postFiringMaxRun, 0, 'seq5: post-firing run 0');
    console.log('seq5: marks 1, repick (4,5) turn 4, post-firing run 0');

    // 6. Approach-only gates isolate the firing to the fallback gate.
    const ao = runHarness(dirA, 'armed', 'primary', 'approach-only');
    assert.strictEqual(ao.json.summary.countersFinal.marks, 1, 'approach-only: marks 1');
    assert.deepStrictEqual(acts(ao.json.turns[3]), ['tbPlayerMove(4,5)'], 'approach-only turn 4: repick to (4,5)');
    console.log('approach-only: marks 1, repick (4,5) — firing isolates to the fallback gate');

    // 7. Negative controls for the live board.
    const cc = runHarness(dirA, 'armed', 'cornercut');
    assert.deepStrictEqual([cc.json.turns[0].post.mx, cc.json.turns[0].post.my], [3, 5], 'cornercut turn 1: lands (3,5) via detour');
    assert.strictEqual(cc.json.summary.countersFinal.marks, 0, 'cornercut: marks 0 (no loop to break)');
    const bs = runHarness(dirA, 'armed', 'bothsides');
    assert.deepStrictEqual([bs.json.turns[0].post.mx, bs.json.turns[0].post.my], [2, 3], 'bothsides turn 1: detour step to (2,3)');
    assert.deepStrictEqual([bs.json.turns[1].post.mx, bs.json.turns[1].post.my], [3, 5], 'bothsides turn 2: lands (3,5)');
    assert.strictEqual(bs.json.summary.countersFinal.marks, 0, 'bothsides: marks 0 (no loop to break)');
    console.log('negative controls: cornercut/bothsides walk around — only (3,5)-blocked reproduces the corpus line');

    // 8. Priming.
    const unp = runHarness(dirA, 'armed', 'unprimed');
    assert.strictEqual(JSON.stringify(unp.json.turns.map(function (t) { return t.actions; })),
      JSON.stringify(armed.json.turns.map(function (t) { return t.actions; })),
      'unprimed+haven: turn actions identical to primed primary');
    const unp42 = runHarness(dirA, 'armed', 'unprimed-node42');
    assert.deepStrictEqual([unp42.json.turns[0].post.mx, unp42.json.turns[0].post.my], [4, 5], 'unprimed-node42 turn 1: flee walk to (4,5)');
    assert.strictEqual(unp42.json.turns[0].branch, 'flee', 'unprimed-node42 turn 1: flee branch');
    assert.strictEqual(unp42.json.summary.countersFinal.marks, 0, 'unprimed-node42: marks 0 (fight-start assessment moves the fighter first)');
    console.log('priming: unprimed+haven identical to primary; unprimed+node42 diverges at turn 1 (flee walk)');
  } finally {
    fs.rmSync(dirA, { recursive: true, force: true });
    fs.rmSync(dirB, { recursive: true, force: true });
  }
  console.log('ALL PASS');
}

main();

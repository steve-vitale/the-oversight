// Proof test for the r122 fleeloop analyzer (Q1 flee execution).
// Runs the REAL analyzer (child process) on (a) synthetic before/after
// fixture corpora built from the r121 death shapes and (b) the r121 landing
// AFTER corpus as calibration, and asserts the counts.
//   Fixtures (one census file per corpus):
//   BEFORE — the r121 shapes: seed 1148 d25 Union Rep, 10 rounds, 9 moves
//     all to (0,0), 0 strikes, playerHpEnd -1 (noop-same-tile flee-loop
//     death); seed 1143 d11 Highbeam Deer, 6 rounds, 5 moves toward (0,3)
//     (two !moved), 0 strikes, playerHpEnd -1 (walk-toward-edge flee-loop
//     death); seed 1144 d14 Hummice, 4 strikes, scholar lived (control —
//     not a flee-loop death); seed 1147 d27 Loud-Eyes, 1 round, routed,
//     no scholar verbs (control — not a death at all).
//   AFTER — the fixed shapes: seed 1148 d25 Union Rep, scholar fled
//     (playerFled true, playerHpEnd 12, 2 moves then a barrier exit —
//     NOT a flee-loop death: the scholar lived); seed 1143 d11 Highbeam
//     Deer, scholar struck twice and lived (NOT a flee-loop death);
//     seed 1144 d14 Hummice unchanged (control).
//   Calibration (r121 AFTER corpus, reported never re-scored — the r121
//   panel verdicts stand): fights=12 scholarDeaths=2 fleeLoopDeaths=2
//   (1148 noop-same-tile, 1143 walk-toward-edge).
// Usage: node scripts/test-landing-r122-fleeloop.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

const ANALYZER = path.join(__dirname, 'analyze-landing-r122-fleeloop.js');
const GOAL = path.join(process.env.HOME || '/home/hatch',
  'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-09');

function runPair(beforeDir, afterDir) {
  return execSync(`node ${ANALYZER} ${beforeDir} ${afterDir}`, { encoding: 'utf8' });
}
function section(out, label) {
  const start = out.indexOf('=== ' + label);
  assert(start >= 0, 'no ' + label + ' section');
  const end = out.indexOf('\n=== ', start + 1);
  return out.slice(start, end < 0 ? undefined : end);
}
function num(sec, key) {
  const m = new RegExp('\\b' + key + '=(\\d+)').exec(sec);
  assert(m, 'no ' + key + ' in section');
  return +m[1];
}
function move(to, moved) { return { turn: 'player-move', to, moved: moved !== false }; }
function strike() { return { turn: 'player-strike', targetKey: 'm_0' }; }
function mturn() { return { turn: 'monster-turn', monsterKey: 'm_0' }; }
function fight(day, monster, rounds, log, hpEnd, extra) {
  return Object.assign({
    day, monsters: [{ key: 'm_0', name: monster }],
    rounds, fightLog: log, playerHpEnd: hpEnd, endResult: hpEnd <= 0 ? 'lost' : 'won',
    playerFled: false,
  }, extra || {});
}
function census(seed, fights) { return { seed, fights81: fights }; }
function writeCorpus(dir, seed, c) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `journey-landing-r62-census-${seed}.json`), JSON.stringify(c));
}
function tmpdir(tag) { return fs.mkdtempSync(path.join(os.tmpdir(), `r122-fleeloop-${tag}-`)); }

// ---- fixtures ----
const beforeDir = tmpdir('before');
const afterDir = tmpdir('after');
// BEFORE seed 1148: the arena no-op — 9 moves all to (0,0), 0 strikes, died.
writeCorpus(beforeDir, 1148, census(1148, [fight(25, 'The Union Rep', 10,
  [move([0, 0]), mturn(), move([0, 0]), mturn(), move([0, 0]), mturn(),
   move([0, 0]), mturn(), move([0, 0]), mturn(), move([0, 0]), mturn(),
   move([0, 0]), mturn(), move([0, 0]), mturn(), move([0, 0]), mturn()],
  -1)]));
// BEFORE seed 1143: the edge walk — 5 moves toward (0,3), 0 strikes, died.
writeCorpus(beforeDir, 1143, census(1143, [fight(11, 'Highbeam Deer', 6,
  [move([0, 3], false), move([4, 4]), move([3, 3]), move([2, 3]), move([0, 3], false),
   mturn(), mturn(), mturn(), mturn(), mturn()],
  -1)]));
// BEFORE seed 1144: control — strikes, lived.
writeCorpus(beforeDir, 1144, census(1144, [fight(14, 'Hummice 1', 4,
  [strike(), strike(), strike(), strike(), mturn(), mturn()], 64)]));
// BEFORE seed 1147: control — routed, 1 round, no scholar verbs, lived.
writeCorpus(beforeDir, 1147, census(1147, [fight(27, 'Loud-Eyes', 1, [], 80, { endResult: 'routed' })]));
// AFTER seed 1148: fled — 2 moves then out, lived.
writeCorpus(afterDir, 1148, census(1148, [fight(25, 'The Union Rep', 3,
  [move([1, 1]), move([0, 0]), mturn()], 12, { endResult: 'fled', playerFled: true })]));
// AFTER seed 1143: fought it out — 2 strikes, lived.
writeCorpus(afterDir, 1143, census(1143, [fight(11, 'Highbeam Deer', 4,
  [move([4, 4]), strike(), strike(), mturn()], 41)]));
// AFTER seed 1144: control unchanged.
writeCorpus(afterDir, 1144, census(1144, [fight(14, 'Hummice 1', 4,
  [strike(), strike(), strike(), strike(), mturn(), mturn()], 64)]));

const out = runPair(beforeDir, afterDir);
const bSec = section(out, 'BEFORE');
const aSec = section(out, 'AFTER');
assert.strictEqual(num(bSec, 'fights'), 4, 'before fights');
assert.strictEqual(num(bSec, 'scholarDeaths'), 2, 'before scholarDeaths');
assert.strictEqual(num(bSec, 'fleeLoopDeaths'), 2, 'before fleeLoopDeaths');
assert(bSec.includes('pattern=noop-same-tile'), 'before noop-same-tile case');
assert(bSec.includes('pattern=walk-toward-edge'), 'before walk-toward-edge case');
assert.strictEqual(num(aSec, 'fights'), 3, 'after fights');
assert.strictEqual(num(aSec, 'scholarDeaths'), 0, 'after scholarDeaths');
assert.strictEqual(num(aSec, 'fleeLoopDeaths'), 0, 'after fleeLoopDeaths');
assert(out.includes('Q1-FLEELOOP: fleeLoopDeaths before=2 after=0 scholarDeaths before=2 after=0'), 'Q1 line');

// ---- calibration: r121 AFTER corpus (verdicts stand, never re-scored) ----
const calDir = path.join(GOAL, 'landing-r121-after');
if (fs.existsSync(calDir)) {
  const cal = execSync(`node ${ANALYZER} ${calDir}`, { encoding: 'utf8' });
  const calSec = section(cal, 'BEFORE');
  assert.strictEqual(num(calSec, 'fights'), 12, 'r121 fights');
  assert.strictEqual(num(calSec, 'scholarDeaths'), 2, 'r121 scholarDeaths');
  assert.strictEqual(num(calSec, 'fleeLoopDeaths'), 2, 'r121 fleeLoopDeaths');
  assert(calSec.includes('1148') && calSec.includes('noop-same-tile'), 'r121 1148 case');
  assert(calSec.includes('1143') && calSec.includes('walk-toward-edge'), 'r121 1143 case');
  console.log('CALIBRATION r121-after: fights=12 scholarDeaths=2 fleeLoopDeaths=2 (1148 noop-same-tile, 1143 walk-toward-edge)');
} else {
  console.log('CALIBRATION SKIPPED (no r121-after corpus at ' + calDir + ')');
}

console.log('PASS test-landing-r122-fleeloop: before 2/2 flee-loop deaths, after 0/0');

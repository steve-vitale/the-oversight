#!/usr/bin/env node
// test-guardablate-lingerer-turns.js — multi-turn lingerer check for
// the guard-removal ablation (arm sim-guardablate-a).
//
// WHY THIS EXISTS (adjudication, recorded in the proof §8): the
// pre-registered §8 expectation was that test-cascade-b's unit-lingering
// case would INVERT on the subject in a single monsterTurn — the
// lingering adjacent raider would step onto the scholar and start
// combat. It does not: the freshly spawned lingerer draws the
// 'territorial' stance, which warns twice and fights on the third turn
// (cascade-b's own comment on the positive control). The guard's absence
// is therefore invisible in ONE turn with an unstaged stance — the
// stance machine, not the guard, gates the first turn. The SAME fixture
// over multiple turns shows it: on the subject the lingerer is assigned
// its stance on turn 1, steps onto the scholar's cell on turn 2, and
// starts the fight on turn 3; on the baseline the guard returns before
// the stance machine runs, so the lingerer never moves, never fights,
// and its stance stays null across 6 turns.
//
// This script stages the identical fixture (seed 100207, lingering
// algorithm adjacent to the scholar at Haven, awake, on the haven tile)
// and loops monsterTurn up to --turns (default 6):
//   --expect=fight   exit 0 iff a fight starts within the turns
//   --expect=nofight exit 0 iff no fight starts within the turns
// Prints one JSON line: {case, pass, foughtAt, turns, stance, cell}.
// Usage: node scripts/test-guardablate-lingerer-turns.js [--turns 6] [--expect fight|nofight]
'use strict';
const path = require('path');
const repo = path.join(__dirname, '..');
function out(o) { console.log(JSON.stringify(o)); }
function fail(detail, extra) { out(Object.assign({ case: 'linger-turns', pass: false, detail: detail }, extra || {})); process.exit(1); }
function pass(extra) { out(Object.assign({ case: 'linger-turns', pass: true }, extra || {})); process.exit(0); }

const argv = process.argv.slice(2);
function argvVal(flag, dflt) {
  const i = argv.indexOf(flag);
  return i < 0 ? dflt : argv[i + 1];
}
const TURNS = parseInt(argvVal('--turns', '6'), 10) || 6;
const EXPECT = argvVal('--expect', 'fight');

(async () => {
  const { loadGame, setupGame } = require(path.join(repo, 'scripts', 'sim-harness'));
  const { Game } = await loadGame({ seed: 100207, mode: 'cascade-test-unit', fullTelemetry: false });
  await setupGame(Game);
  const s = Game.state.scholar;
  Game.map.px = 4; Game.map.py = 4;
  s.mx = 4; s.my = 4; s.insideHaven = true;
  try { Game._sleeping = false; } catch (e) {}
  const m = Game.spawnWorldMonster('algorithm', 4, 4, { mx: 4, my: 5, lingering: true });
  if (!m) fail('spawnWorldMonster returned nothing');
  if (!m.lingering) fail('spawned monster did not carry lingering=true');
  let foughtAt = 0;
  let lastStance = null;
  for (let t = 1; t <= TURNS; t++) {
    Game.monsterTurn();
    lastStance = m.stance;
    if (Game.tbfight) { foughtAt = t; break; }
  }
  const result = { foughtAt: foughtAt, turns: TURNS, stance: lastStance, cell: [m.mx, m.my] };
  if (EXPECT === 'fight') {
    if (!foughtAt) fail('no fight started within ' + TURNS + ' turns (guard absence not observed)', result);
    pass(result);
  } else if (EXPECT === 'nofight') {
    if (foughtAt) fail('fight started on turn ' + foughtAt + ' (guard should hold)', result);
    pass(result);
  } else {
    fail('--expect must be fight or nofight, got ' + EXPECT, result);
  }
})().catch(function (e) { console.error(e.stack); process.exit(1); });

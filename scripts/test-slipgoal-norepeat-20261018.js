#!/usr/bin/env node
// PROOF: slipGoal pool verbatim repeat (journey establishment r14, 2026-10-18).
//
// The r14 pilot's seed-7 transcript carried the same slipGoal observation
// beat VERBATIM twice, 11 game-days apart:
//   "👀 Vikram claims to belong somewhere — then spends the whole evening
//    oriented around something they won't name. The wanting is real.
//    The word for it isn't \"to belong somewhere\"."
// Root cause: src/js/truth.js `slipGoal` pool has only 2 lines. The
// drawTruthLine per-game no-repeat recycles after the pool is exhausted,
// so the 3rd firing is guaranteed to re-serve a seen line (reset keeps only
// lastIdx out; with a 2-line pool the other line is always the pick).
// The game's own standard (Steve: "in-character, non-repeated dialogue")
// deserves better than a 2-line pool for a beat that can fire repeatedly
// across a 40-day leg.
//
// The fix (this run, truth.js): expand the slipGoal pool to 4 lines —
// same voice (the crack shows, the truth stays hidden), so verbatim echoes
// are rare inside one run.
//
// Case: 4 consecutive slipGoal draws in one fresh game state must render
// 4 pairwise-distinct lines (no repeat inside the first cycle).
//
// RED: on the pristine 2-line pool this FAILS by pigeonhole (3rd draw
// re-serves line 1).
// GREEN: with the 4-line pool, all 4 draws are distinct.
// Usage: SEED=7 node scripts/test-slipgoal-norepeat-20261018.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');
const SEED = parseInt(process.env.SEED || '7', 10);

let failures = 0;
function check(name, cond, detail) {
  if (cond) console.log('PASS', name);
  else { failures++; console.log('FAIL', name, '::', detail || ''); }
}

async function main() {
const { Game } = await loadGame({ seed: SEED, mode: 'mvc' });
await setupGame(Game);
const vids = (Game.state.villagers || []).map(v => v.id).filter(Boolean);
console.log('INFO villagers=' + vids.length + ' (drawTruthLine degrades gracefully without one)');
if (!vids.length) vids.push('probe-vid');
check('Game.drawTruthLine exists', typeof Game.drawTruthLine === 'function');
const poolLen = ((Game.truthLinePools || {}).slipGoal || []).length;
console.log('INFO slipGoal pool size =', poolLen);

const lines = [];
for (let i = 0; i < 4; i++) {
  const t = Game.drawTruthLine('slipGoal', vids[0], { told: 'to belong somewhere' });
  lines.push(t);
}
const distinct = new Set(lines).size;
check('4 draws render 4 distinct lines (no verbatim repeat in first cycle)',
  distinct === 4, 'distinct=' + distinct + ' of 4; lines=' + JSON.stringify(lines.map(l => l.slice(0, 60))));
// the crack-only discipline still holds on every line
const leakRe = /is (secretly|actually)|real goal is|truly wants/i;
check('no line leaks the hidden truth', lines.every(l => !leakRe.test(l)));

if (failures) { console.log('RESULT: FAIL (' + failures + ')'); process.exit(1); }
console.log('RESULT: ALL GREEN');
}
main().catch(e => { console.error('HARNESS ERROR:', e && e.message); process.exit(2); });

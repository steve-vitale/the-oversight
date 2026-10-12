#!/usr/bin/env node
// play-washedout-scenario-20261012.js — PLAY the debug scenario (Steve's QA
// rule: the builder plays it, asserting postconditions, not just existence).
// Scenario: washedout — a real washed-out blockage on a wild node's exit.
// Two taps in-fiction: nearby panel -> "Cross the washed-out gap".
'use strict';
const { loadGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

(async () => {
  let s = 99;
  Math.random = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const { Game } = await loadGame({ seed: 99, mode: 'competent', fullTelemetry: false });

  // TAP 0: open the scenario.
  const started = Game.debugScenario('washedout');
  check('scenario starts', started === true);

  const px = Game.map.px, py = Game.map.py;
  check('scenario drops you on a wild node (>=2 from haven)',
    Math.abs(px - 4) + Math.abs(py - 4) >= 2, `at (${px},${py})`);

  // Find the planted blockage next to the player.
  let bx = -1, by = -1;
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    const t = Game.map.tiles[py + dy] && Game.map.tiles[py + dy][px + dx];
    if (t && t.blockFrom && t.blockFrom.type === 'washed_out') { bx = px + dx; by = py + dy; }
  }
  check('a washed-out gap blocks one exit', bx >= 0, bx >= 0 ? `at (${bx},${by})` : 'none found');

  // The warning path: travelBlockage (what the nearby panel checks) fires.
  const block = Game.travelBlockage(bx, by);
  check('travelBlockage reports washed_out (nearby panel would offer the crossing)',
    !!block && block.blockType === 'washed_out');

  // TAP 1 (attempt): walking into it refuses, honestly.
  const kcalBefore = Game.state.scholar.kcal;
  const res = Game.travelTo(bx, by);
  check('travelTo refuses the blocked exit', Game.map.px === px && Game.map.py === py,
    `moved=(${Game.map.px},${Game.map.py})`);

  // TAP 2: cross the gap (the nearby button calls clearBlockage).
  // wood < 4 in a fresh scenario, so this is the scramble path (-80 kcal).
  const cleared = Game.clearBlockage(bx, by);
  check('clearBlockage scrambles through', cleared !== false &&
    !Game.map.tiles[by][bx].blockFrom);
  check('crossing cost ~80 kcal', Game.state.scholar.kcal <= kcalBefore - 70,
    `before=${kcalBefore} after=${Game.state.scholar.kcal}`);

  // The path is honestly open now.
  check('no more warning after crossing', !Game.travelBlockage(bx, by));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('CRASH: ' + (e && e.stack || e)); process.exit(1); });

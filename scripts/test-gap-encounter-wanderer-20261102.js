#!/usr/bin/env node
// test-gap-encounter-wanderer-20261102.js — gap-round leg 6 proof:
// wanderer trigger wave-4 fights.
//
// QUESTION (evidence/2026-11-02/sim-scale-onramp-round-1915.md): the
// wanderer-contact path (triggerEncounter) produced ZERO wave-4 fights
// on all 8 seeds — and the instrument corpus shows it is zero across
// ALL waves (evidence/2026-11-02/perseed-wave4encounter-diag: triggerRows
// empty on every seed). The corpus also shows why: a single wanderer
// paces ONE row forever — e.g. seed 98207's day-3 speedbump on row 7 is
// still pacing row 7 on day 91 while the player sits/forages around
// row 4 — and while it lives, the cast slot stays occupied, so no new
// wanderer is ever cast. A wanderer on the wrong row can never meet
// the player: contact needs the exact tile at a part boundary.
//
// FIX (game code): when the wanderer bounces off a map edge, it also
// shifts one row toward Haven's row — it ranges toward habitation, the
// way the Herald already steers Haven-ward (build-herald-steer
// 2026-11-01: "a bias, not a homing missile"). A place, never a roster
// or a person: the target is the village's tile row, not the player's
// position. Safe tiles still turn it away (havens stay safe), and the
// tile-entry contact path is untouched. Over a run the wanderer
// converges on the rows the player actually travels, contacts happen,
// the slot frees, and new wanderers — including wave-4 casts once wave
// 4 is unlocked — get their turn.
//
// PROOF (seeded, identical before/after): a wanderer starts on row 7,
// the player stands on a wild tile on row 4 (Haven's row). Step
// moveWanderer 200 times (50 days of parts). Before: it paces row 7
// forever, 0 triggers. After: edge bounces walk it to row 4, it steps
// onto the player's tile, triggerEncounter fires, pendingEncounter is
// set (the sim harness resolves pendings into fights, as the live
// Face-it button does).
// Usage: node scripts/test-gap-encounter-wanderer-20261102.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

let checks = 0, fails = 0;
function check(name, cond, extra) {
  checks++;
  if (cond) console.log('PASS ' + name);
  else { fails++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}

(async () => {
  const { Game } = await loadGame({ seed: 97339, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village || {};
  const hx = v.px ?? 4, hy = v.py ?? 4;
  // Player on a wild tile on Haven's row; wanderer on a far row.
  // (Node travel is one hop at a time from an unrevealed map.)
  Game.travelTo(hx - 1, hy);
  Game.travelTo(hx - 2, hy);
  const ptx = Game.map.px, pty = Game.map.py;
  check('scene: player on a wild tile on Haven row',
    pty === hy && !Game.isSafeTile(ptx, pty), { playerTile: ptx + ',' + pty, havenRow: hy });
  Game.wanderer = { x: 0, y: 7, dir: 1, monsterId: 'eulogy', veteran: false };
  Game.encounterDone = false;
  let triggers = 0;
  const origTrig = Game.triggerEncounter;
  Game.triggerEncounter = function (mid) { triggers++; return origTrig.apply(this, arguments); };
  let rowsSeen = {};
  let steps = 0, contacted = false;
  for (let i = 0; i < 200; i++) {
    if (!Game.wanderer) { contacted = true; break; }
    rowsSeen[Game.wanderer.y] = true;
    Game.moveWanderer();
    steps++;
    if (triggers > 0) { contacted = true; break; }
  }
  Game.triggerEncounter = origTrig;
  console.log('INFO wanderer rows paced: ' + JSON.stringify(Object.keys(rowsSeen).sort()) +
    ' steps: ' + steps + ' triggers: ' + triggers +
    ' pendingEncounter: ' + !!Game.pendingEncounter + ' pendingMonsterId: ' + (Game.pendingMonsterId || null));
  check('wanderer ranges off its starting row', Object.keys(rowsSeen).length > 1, Object.keys(rowsSeen).sort());
  check('wanderer contacts the player (triggerEncounter fires)', triggers >= 1, { triggers });
  check('contact leaves a pending encounter for the fight', !!Game.pendingEncounter && Game.pendingMonsterId === 'eulogy',
    { pending: !!Game.pendingEncounter, id: Game.pendingMonsterId });
  console.log(`\n${checks - fails}/${checks} checks passed`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('PROOF-FAILED', (e && e.stack) || e); process.exit(1); });

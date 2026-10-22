#!/usr/bin/env node
// test-ledger-beat-combat-defer-20261022.js — PROOF for journey establishment
// r26 (2026-10-22): ledger threshold beats must not narrate the haven fire
// mid-combat.
//
// The blank: LEDGER_BEATS threshold beats fire immediately from ledgerAdd.
// When a legend threshold crossed DURING a turn-based fight (kills/style in
// the fight push the ledger over), the beat narrated "You overhear it at the
// fire, and stop pretending not to listen..." while the player fought for
// their life (2 occurrences in the r26 pilot corpus: seed 61 d17 choir-toad
// fight, seed 82 d23 moderator fight).
//
// The fix (src/js/ledger.js _checkDimBeats): when a tbfight is active, a
// gate-passing beat QUEUES for the endDay flushLedgerBeats instead of firing
// immediately — the fire is where the fiction says it happens.
//
// Scenarios (all on the real ledgerAdd path, narration live):
//   G1 (no combat): ledgerAdd('might',5) fires the beat immediately —
//       narration line appears, queue stays empty. The normal path is intact.
//   G2 (real tbfight active): the same ledgerAdd produces NO narration line
//       and the beat lands in the queue. Proves the deferral.
//   G3 (fight over + flush): flushLedgerBeats() fires the queued beat — the
//       line appears, carrying the fire framing (correct at endDay).
//   G4 (sense): the deferred beat text still reads as a fire-side beat, and
//       nothing about the fight was narrated by the ledger.
//
// Usage: node scripts/test-ledger-beat-combat-defer-20261022.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL ' + name + (extra ? ' -- ' + extra : '')); }
}
function logTexts(Game) {
  try { return (Game.log || []).map(e => String((e && e.text) || e)); } catch (e) { return []; }
}
function queueKeys(Game) {
  try { return (Game._beatQueue() || []).map(e => e.k); } catch (e) { return []; }
}

async function newGame(seed) {
  // narration LIVE: say/sysSay must reach Game.log for the assertions.
  const { Game } = await loadGame({ seed, mode: 'mvc', narration: true });
  await setupGame(Game);
  return Game;
}

async function startRealFight(Game) {
  const s = Game.state.scholar;
  s.health = 100;
  s.mx = 4; s.my = 4;
  s.monster = { id: 'hushwolf', mx: 6, my: 4 };
  Game.startCombat('hushwolf');
  if (!Game.tbfight || Game.tbfight.over) throw new Error('no tbfight started');
}

(async () => {
  // ---- G1: no combat — beat fires immediately ----
  {
    const Game = await newGame(4241);
    const before = logTexts(Game).length;
    const q0 = queueKeys(Game).length;
    Game.ledgerAdd('might', 5); // crosses LEDGER_BEATS.might[0].at = 5
    const after = logTexts(Game);
    const fired = after.slice(before).join('\n');
    ok('G1 beat fires immediately with no combat', /deer story again/.test(fired), fired.slice(0, 120));
    ok('G1 queue stays empty', queueKeys(Game).length === q0);
    ok('G1 fire framing present (first gossip beat)', /overhear it at the fire/.test(fired));
  }

  // ---- G2: real fight active — beat defers to the queue ----
  {
    const Game = await newGame(4242);
    await startRealFight(Game);
    const before = logTexts(Game).length;
    Game.ledgerAdd('might', 5);
    const after = logTexts(Game).slice(before).join('\n');
    ok('G2 no narration line mid-combat', !/deer story again/.test(after), after.slice(0, 160));
    ok('G2 beat queued', queueKeys(Game).indexOf('might:0') >= 0, queueKeys(Game).join(','));
    ok('G2 fight still active (untouched)', !!Game.tbfight && !Game.tbfight.over);
    // ---- G3: fight over + endDay flush — the beat lands ----
    Game.tbfight.over = true;
    const b2 = logTexts(Game).length;
    Game.flushLedgerBeats();
    const fired = logTexts(Game).slice(b2).join('\n');
    ok('G3 queued beat fires at flush', /deer story again/.test(fired), fired.slice(0, 120));
    ok('G3 queue drained', queueKeys(Game).indexOf('might:0') < 0);
    ok('G3 fire framing intact at endDay', /overhear it at the fire/.test(fired));
  }

  // ---- G4: non-gossip beats also defer (kind gate passes but combat wins) ----
  {
    const Game = await newGame(4243);
    await startRealFight(Game);
    const before = logTexts(Game).length;
    Game.ledgerAdd('brokerage', 5); // crosses brokerage[0].at = 5, kind gossip
    const after = logTexts(Game).slice(before).join('\n');
    ok('G4 brokerage beat also defers mid-combat', !/makes deals hold/.test(after));
    ok('G4 brokerage beat queued', queueKeys(Game).indexOf('brokerage:0') >= 0);
  }

  console.log(pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', (e && e.stack) || e); process.exit(1); });

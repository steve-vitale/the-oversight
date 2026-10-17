#!/usr/bin/env node
// test-table-reactor-seat-honesty-20261017.js — proof for the journey-endgame
// r14 blank fill (2026-10-17).
//
// THE BLANK: a fusion-reactor bearer can never mark feastSurgeUsed —
// grantFeastBuff refuses while the reactor is online ("the engine that never
// hungers never feasts"), and the pellet never comes out ("death is the only
// uninstall"). So the lesser seat's food-thesis deed is permanently
// uncompletable for that bearer: Arc IV never fires, the table never comes,
// and the run sits at arc 3 in silence. Measured: seed 8907, 190 days,
// national, 24 contests, 4 crises, stage 3 — zero table beats.
//
// RED (before the fix): checkArc on such a run says nothing about the table.
// GREEN (after): it says the pellet's price aloud exactly once, naming the
// missing deeds, and never repeats itself.
//
// Usage: node scripts/test-table-reactor-seat-honesty-20261017.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function fail(msg) { console.error('FAIL: ' + msg); process.exit(1); }
function ok(msg) { console.log('ok: ' + msg); }

async function main() {
  const { Game } = await loadGame({ seed: 4242, mode: 'reactor-honesty-proof' });
  await setupGame(Game);
  const lines = [];
  const osay = Game.say;
  Game.say = function (t) { try { lines.push(String(t)); } catch (e) {} return osay.call(this, t); };

  // ---- build the deep reactor-run state ----
  Game.state.systemArrived = true;
  const s = Game.state.scholar;
  s.day = 95;
  s.integration = 60; // stage 2
  // reactor online: installed + ability held
  s.fusionReactor = { installed: true, online: true };
  s.abilities = s.abilities || [];
  if (!s.abilities.some(a => ((a && a.id) || a) === 'fusion_reactor')) s.abilities.push({ id: 'fusion_reactor' });
  if (typeof Game.fusionReactorOnline !== 'function' || !Game.fusionReactorOnline()) {
    fail('setup: fusionReactorOnline() is not true — the test state is wrong');
  }
  const pg = Game.progState();
  pg.crises = { 'first-grave': 1, 'hunger-winter': 1 };
  pg.sentimentTaught = true; // the lesson fired; only the surge is blocked
  // breadth >= 12 for arc 3
  Game.state.codex = Game.state.codex || {};
  Game.state.codex.plants = Game.state.codex.plants || {};
  for (let i = 0; i < 14; i++) Game.state.codex.plants['proofplant' + i] = { level: 3 };
  // waves 4/4/3 faced, contests, national — everything but the food deed
  const d = Game.deedState();
  d.wavesFaced = { a: 1, b: 1, c: 1, e: 1, f: 2, g: 2, h: 2, i: 2, j: 3, k: 3, l: 3 };
  d.contestsSurvived = 3;
  Game.state.contestsHeld = 1; // deedDone for arc 2 (baseBreadth anchors on first checkArc)
  // seat must price 'none' (the food deed is the blocker)
  const seat = Game.tableSeat();
  if (!seat || seat.seat !== 'none') fail('setup: expected seat none, got ' + JSON.stringify(seat && seat.seat));

  // ---- RED/GREEN ----
  const beatLines = () => lines.filter(t => /PELLET HUMS|COLD SPOT AT EVERY TABLE/.test(t));
  Game.checkArc();
  const after1 = beatLines().length;
  Game.checkArc();
  const after2 = beatLines().length;

  if (after1 === 0) fail('RED: no reactor seat-honesty beat fired on a deep reactor run (the silence this test was written to fix)');
  ok(`beat fired on first checkArc (${after1} line${after1 === 1 ? '' : 's'})`);
  const beat = beatLines()[0] || '';
  if (!/food-thesis|FEAST/.test(beat)) fail('beat does not name the blocked food deed');
  ok('beat names the blocked food deed');
  if (!/mantle may pass to hungrier hands/.test(beat)) fail('beat does not name the honest out (mantle passing)');
  ok('beat names the honest out (mantle passing)');
  if (after2 !== after1) fail(`beat re-fired on second checkArc (${after1} -> ${after2}) — must fire once`);
  ok('beat fires exactly once (no repeat)');
  if (!pg.reactorSeatTold) fail('pg.reactorSeatTold not set');
  ok('pg.reactorSeatTold set');

  // ---- the beat must NOT fire for non-reactor runs (no nagging) ----
  const lines2 = [];
  Game.say = function (t) { try { lines2.push(String(t)); } catch (e) {} return osay.call(this, t); };
  s.fusionReactor.online = false; // pellet offline
  pg.reactorSeatTold = false;
  Game.checkArc();
  if (lines2.some(t => /PELLET HUMS|COLD SPOT AT EVERY TABLE/.test(t))) {
    fail('beat fired with the reactor offline — must only fire for the permanent block');
  }
  ok('no beat when the reactor is offline');

  console.log('\nPASS: reactor seat-honesty beat (RED->GREEN proven by the assertions above)');
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });

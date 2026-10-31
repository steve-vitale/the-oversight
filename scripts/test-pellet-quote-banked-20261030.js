#!/usr/bin/env node
// test-pellet-quote-banked-20261030.js — proof for the journey-endgame r74
// pellet-quote blank (r73 88964: the withdrawal beat's fixed quote said
// "NO FEAST, NO SURGE" for a bearer <redacted> feasted 6 times before the pellet —
// the pellet blocks NEW feasts, it does not erase banked food deeds).
//
// BEFORE: both bearers get the never-feasted quote.
// AFTER: a never-feasted pellet bearer still gets the original quote, but a
// bearer <redacted> banked food deeds gets the banked variant — no "NO FEAST,
// NO SURGE", no "COLD SPOT" — and the miss list still names the true bar.
// Narration only: no seat logic, no gate, no deed value changes.
//
// Modeled on scripts/test-table-reactor-seat-honesty-20261017.js (same
// deep-reactor-run setup, same checkArc beat path).
//
// Usage: node scripts/test-pellet-quote-banked-20261030.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function fail(msg) { console.error('FAIL: ' + msg); process.exit(1); }
function ok(msg) { console.log('ok: ' + msg); }

async function main() {
  const { Game } = await loadGame({ seed: 4242, mode: 'pellet-quote-proof' });
  await setupGame(Game);
  const lines = [];
  const osay = Game.say;
  Game.say = function (t) { try { lines.push(String(t)); } catch (e) {} return osay.call(this, t); };

  // ---- shared deep reactor-run state (as in the r14 honesty test) ----
  Game.state.systemArrived = true;
  const s = Game.state.scholar;
  s.day = 95;
  s.integration = 60; // stage 2
  s.fusionReactor = { installed: true, online: true };
  s.abilities = s.abilities || [];
  if (!s.abilities.some(a => ((a && a.id) || a) === 'fusion_reactor')) s.abilities.push({ id: 'fusion_reactor' });
  if (typeof Game.fusionReactorOnline !== 'function' || !Game.fusionReactorOnline()) {
    fail('setup: fusionReactorOnline() is not true — the test state is wrong');
  }
  const pg = Game.progState();
  pg.crises = { 'first-grave': 1, 'hunger-winter': 1 };
  pg.sentimentTaught = true;
  Game.state.codex = Game.state.codex || {};
  Game.state.codex.plants = Game.state.codex.plants || {};
  for (let i = 0; i < 14; i++) Game.state.codex.plants['proofplant' + i] = { level: 3 };
  Game.state.contestsHeld = 1;
  const d = Game.deedState();
  d.contestsSurvived = 3;

  const beatLines = () => lines.filter(t => /PELLET HUMS/.test(t));

  // ---- Case A: never-feasted bearer — original quote, unchanged ----
  s.prog = s.prog || {};
  s.prog.feastSurgeUsed = false;
  d.wavesFaced = { a: 1, b: 1, c: 1, e: 1, f: 2, g: 2, h: 2, i: 2, j: 3, k: 3, l: 3 };
  let seat = Game.tableSeat();
  if (!seat || seat.seat !== 'none') fail('setup A: expected seat none, got ' + JSON.stringify(seat && seat.seat));
  pg.reactorSeatTold = false;
  lines.length = 0;
  Game.checkArc();
  if (beatLines().length !== 1) fail('case A: expected exactly 1 pellet beat, got ' + beatLines().length);
  const beatA = beatLines()[0];
  if (!/NO FEAST, NO SURGE/.test(beatA)) fail('case A: original quote lost its NO FEAST, NO SURGE clause: ' + beatA);
  if (!/COLD SPOT AT EVERY TABLE/.test(beatA)) fail('case A: original quote lost its COLD SPOT clause');
  if (!/food-thesis/.test(beatA)) fail('case A: beat does not name the blocked food deed');
  ok('case A (never-feasted): original quote intact, names the food deed');

  // ---- Case B: banked bearer — variant quote, true missing bar named ----
  // Same run, but the surge WAS banked before the pellet, and one wave-3
  // type is short so the seat is still none (the r73 88964 shape).
  s.prog.feastSurgeUsed = true;
  d.wavesFaced = { a: 1, b: 1, c: 1, e: 1, f: 2, g: 2, h: 2, i: 2, k: 3, l: 3 }; // w3: 2/3
  seat = Game.tableSeat();
  if (!seat || seat.seat !== 'none') fail('setup B: expected seat none, got ' + JSON.stringify(seat && seat.seat));
  if (!seat.detail.foodDeeds) fail('setup B: expected detail.foodDeeds true (banked surge)');
  pg.reactorSeatTold = false;
  lines.length = 0;
  Game.checkArc();
  if (beatLines().length !== 1) fail('case B: expected exactly 1 pellet beat, got ' + beatLines().length);
  const beatB = beatLines()[0];
  if (/NO FEAST, NO SURGE/.test(beatB)) fail('case B: variant still claims NO FEAST, NO SURGE for a bearer <redacted> feasted: ' + beatB);
  if (/COLD SPOT AT EVERY TABLE/.test(beatB)) fail('case B: variant still claims COLD SPOT for a bearer <redacted> feasted');
  if (!/WHAT IT BANKED STANDS/.test(beatB)) fail('case B: variant does not name the banked feasts: ' + beatB);
  if (!/PELLET HUMS/.test(beatB)) fail('case B: variant lost the pellet framing');
  if (!/wave-3 monsters faced/.test(beatB)) fail('case B: beat does not name the true missing bar (wave-3): ' + beatB);
  if (!/mantle may pass to hungrier hands/.test(beatB)) fail('case B: beat lost the honest out (mantle passing)');
  ok('case B (banked): variant quote, no never-feasted claim, true bar named');

  // ---- Beat still fires exactly once per run ----
  lines.length = 0;
  Game.checkArc();
  if (beatLines().length !== 0) fail('beat re-fired on second checkArc — must fire once');
  ok('beat fires exactly once (no repeat)');

  console.log('\nPASS: pellet quote variant (banked vs never-feasted)');
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });

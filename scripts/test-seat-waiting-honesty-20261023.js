#!/usr/bin/env node
// scripts/test-seat-waiting-honesty-20261023.js — proof test for journey-scale
// r24 (2026-10-23): SEAT-WAITING HONESTY (src/js/progression.js checkArc).
//
// The blank (observed in the wild): r23's 60001 reached GLOBAL (d94) with
// seat 'none' (one wave-2 fight short of the lesser bar) and sat silent at
// the top of the ladder to d155 — no Arc IV, no seat voicing, nothing naming
// the missing bar. r24's 70002 repeated it (global d128, seat 'none', missing
// food-thesis deeds, scattered d146 in silence). The reactor beat
// (journey-endgame r14) named the miss-list aloud, but only for pellet
// bearers. The fix: non-reactor bearers at want>=3, day>=90, seat 'none'
// get the same once-per-run miss-list voicing ("Not yet... The ledger still
// wants: ..."), without the pellet framing.
//
// Construction (honest state, no stubs): a fresh game is given real Arc-III
// conditions (systemArrived, day 95 -> notability 10; contestsHeld 1 ->
// deedDone; integration 45 -> stage 2; 5 learned test plants -> breadth 12;
// 2 crises) and NO deeds (seat 'none', the natural fresh-game state).
//
// GREEN means:
//   A. checkArc fires the seat-waiting line once, naming a missing bar
//      ("The ledger still wants:") and the pg.seatWaitingTold flag sets.
//   B. a second checkArc does NOT re-fire (once per run).
//   C. with a full lesser-seat deed profile (seat 'lesser'), checkArc does
//      NOT fire the waiting line.
//   D. with pg.reactorSeatTold set (reactor path owns the voicing), the new
//      block does NOT fire.
//   E. at day 89 (below the day-90 floor), no fire; at day 95 it fires.
// Usage: node scripts/test-seat-waiting-honesty-20261023.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const WAIT_BITS = ['Not yet.', 'The ledger still wants:'];

function countWait(cap) {
  return cap.filter(l => WAIT_BITS.every(b => String(l).includes(b))).length;
}

async function main() {
  const fails = [];
  const { Game } = await loadGame({ seed: 777003, mode: 'seatwaiting-proof' });
  await setupGame(Game);
  const sayCap = [];
  const _say = Game.say;
  Game.say = function (...a) { sayCap.push(String(a[0])); try { return _say.apply(this, a); } catch (e) { return a[0]; } };

  // --- honest Arc-III construction ---
  Game.state.systemArrived = true;
  const s = Game.state.scholar;
  s.day = 95;
  s.integration = 45;                       // stage 2 (neural creep)
  Game.state.contestsHeld = 1;              // deedDone
  const pg = Game.progState();
  pg.crises = { 'first-grave': 1, 'hunger-winter': 1 };
  const cx = Game.state.codex; cx.plants = cx.plants || {};
  for (let i = 0; i < 5; i++) cx.plants['testplant_sw' + i] = { level: 1 }; // breadth 7 -> 12

  const seat0 = Game.tableSeat();
  if (!seat0 || seat0.seat !== 'none') fails.push(`construction invalid: seat=${seat0 && seat0.seat} (expected none)`);

  // --- A: fires once, names the missing bar ---
  Game.checkArc();
  const aCount = countWait(sayCap);
  if (aCount !== 1) fails.push(`A: seat-waiting line fired ${aCount}x (expected 1)`);
  if (!pg.seatWaitingTold) fails.push('A: pg.seatWaitingTold not set');
  const aLine = sayCap.find(l => WAIT_BITS.every(b => String(l).includes(b))) || '';
  if (!/wave-1 monsters faced|wave-2 monsters faced|wave-3 monsters faced|contests survived|crises weathered|a regional standing|deeper integration|the food-thesis deeds/.test(aLine))
    fails.push('A: line names no missing bar: ' + aLine.slice(0, 120));

  // --- B: no re-fire ---
  const bBefore = sayCap.length;
  Game.checkArc();
  if (countWait(sayCap) !== 1 || sayCap.length !== bBefore) fails.push('B: re-fired on second checkArc');

  // --- C: lesser seat -> no waiting line ---
  pg.seatWaitingTold = false;
  const deeds = Game.deedState();
  deeds.wavesFaced = { a: 1, b: 1, c: 1, d: 1, e: 2, f: 2, g: 2, h: 2, i: 3, j: 3, k: 3 };
  deeds.contestsSurvived = 2;
  Game.state.networkLive = true;
  pg.sentimentTaught = true;
  s.prog = s.prog || {}; s.prog.feastSurgeUsed = true;
  const seatC = Game.tableSeat();
  if (!seatC || seatC.seat !== 'lesser') fails.push(`C construction invalid: seat=${seatC && seatC.seat} (expected lesser)`);
  else {
    Game.checkArc();
    if (countWait(sayCap) !== 1) fails.push('C: waiting line fired despite lesser seat');
  }

  // --- D: reactor path owns the voicing ---
  pg.seatWaitingTold = false;
  pg.reactorSeatTold = true;   // as if the reactor beat already spoke
  s.integration = 45;
  Game.checkArc();
  if (countWait(sayCap) !== 1) fails.push('D: waiting line fired while reactorSeatTold set');
  pg.reactorSeatTold = false;

  // --- E: day floor ---
  pg.seatWaitingTold = false;
  s.day = 89;
  // strip the lesser profile back to 'none' for a clean floor check
  deeds.wavesFaced = {}; deeds.contestsSurvived = 0; Game.state.networkLive = false;
  pg.sentimentTaught = false; s.prog.feastSurgeUsed = false;
  const seatE = Game.tableSeat();
  if (!seatE || seatE.seat !== 'none') fails.push(`E construction invalid: seat=${seatE && seatE.seat} (expected none)`);
  else {
    Game.checkArc();
    if (countWait(sayCap) !== 1) fails.push('E: waiting line fired at day 89 (below floor)');
    s.day = 95;
    Game.checkArc();
    if (countWait(sayCap) !== 2) fails.push('E: waiting line did not fire at day 95');
  }

  if (fails.length) { console.log('FAIL'); fails.forEach(f => console.log(' - ' + f)); process.exit(1); }
  console.log('ALL GREEN: seat-waiting honesty (A-E)');
}

main().catch(e => { console.error('TEST ERROR:', e && e.stack || e); process.exit(2); });

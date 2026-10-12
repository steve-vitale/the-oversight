#!/usr/bin/env node
// test-tablechain-20261012.js — proof test for winpath r5 (2026-10-12).
// LEVER: winseek tableRoad now DRAINS the table prompt queue (one sitting,
// like a human at the modal) instead of answering once per game-day.
// Proves on a real lesser-seat scenario (real state, no stubs):
//   T1: tableSeat() prices a lesser seat from assembled deed state
//   T2: tableScene() stages (audit + paths offered)
//   T3: the drain walks path -> beats -> finals -> WIN in one call (won=true)
//   T4: the drain terminates when answers stop changing the prompt (stall guard)
//   T5: the drain stops when the game ends mid-drain
//   T6: table state (pg.table) survives a mantle pass; the pending prompt stays answerable
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');
const { tableRoad } = require('./policies/winseek');

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL: ' + name); }
}

// Assemble a REAL lesser-seat state (fields the seat function reads — no stubs).
function makeLesser(Game) {
  Game.state.systemArrived = true;
  Game.state.scholar.integration = 40; // stage 2
  Game.state.networkLive = true; // scaleRank() -> regional
  const d = Game.deedState();
  d.wavesFaced = { a: 1, b: 1, c: 1, e2: 1, f: 2, g: 2, h: 2, i: 2, j: 3, k: 3, l: 3 };
  d.contestsSurvived = 2;
  const pg = Game.progState();
  pg.crises = { 'first-grave': 1, breach: 1 };
  pg.sentimentTaught = true;
  Game.state.scholar.prog = Game.state.scholar.prog || {};
  Game.state.scholar.prog.feastSurgeUsed = true;
}

(async () => {
  // ---- T1: lesser seat prices from real state ----
  {
    const { Game } = await loadGame({ seed: 4242 });
    await setupGame(Game);
    makeLesser(Game);
    const seat = Game.tableSeat();
    ok(seat.seat === 'lesser', 'T1 lesser seat prices (got ' + seat.seat + ')');
    ok(seat.detail.w1 >= 4 && seat.detail.w2 >= 4 && seat.detail.w3 >= 3, 'T1 waves 4/4/3 counted');
    ok(seat.detail.foodDeeds === true, 'T1 food-thesis deeds read');
  }

  // ---- T2+T3: scene stages, drain walks to WIN ----
  {
    const { Game } = await loadGame({ seed: 4242 });
    await setupGame(Game);
    makeLesser(Game);
    Game.tableScene();
    const T = Game.tableState();
    ok(T.phase === 'paths', 'T2 tableScene stages to paths phase (got ' + T.phase + ')');
    const s = Game.state.scholar;
    ok(!!(s.tableChoices && s.tableChoices.options.length), 'T2 paths prompt offered');
    let answers = 0;
    const origChoose = Game.chooseTableOption.bind(Game);
    Game.chooseTableOption = function (id) { answers++; return origChoose(id); };
    const ctx = {};
    tableRoad(Game, ctx);
    ok(Game.won === true, 'T3 drain resolves the table to WON (won=' + Game.won + ', phase=' + Game.tableState().phase + ')');
    ok(answers >= 5, 'T3 drain answered the full chain (answers=' + answers + ', expect >=5: path+3 beats+final)');
    ok(!Game.state.scholar.tableChoices, 'T3 no prompt left pending after win');
    ok((ctx.tableAnswers | 0) === answers, 'T3 ctx.tableAnswers counted (' + ctx.tableAnswers + ')');
  }

  // ---- T4: stall guard terminates ----
  {
    const { Game } = await loadGame({ seed: 99 });
    await setupGame(Game);
    Game.state.scholar.tableChoices = { frame: 'stuck', options: [{ id: 'x', label: 'y' }] };
    Game.chooseTableOption = function () { /* no-op: prompt never changes */ };
    const t0 = Date.now();
    tableRoad(Game, {});
    ok(Date.now() - t0 < 5000, 'T4 drain terminates on a stuck prompt (' + (Date.now() - t0) + 'ms)');
  }

  // ---- T5: drain stops when the game ends ----
  {
    const { Game } = await loadGame({ seed: 100 });
    await setupGame(Game);
    Game.state.scholar.tableChoices = { frame: 'x', options: [{ id: 'x', label: 'y' }] };
    let calls = 0;
    Game.chooseTableOption = function () { calls++; Game.over = true; };
    tableRoad(Game, {});
    ok(calls === 1, 'T5 drain stops after the game ends (calls=' + calls + ')');
  }

  // ---- T6: mantle pass keeps the table alive ----
  {
    const { Game } = await loadGame({ seed: 4242 });
    await setupGame(Game);
    makeLesser(Game);
    Game.tableScene();
    Game.chooseTableOption('path:feared');
    const before = Game.tableState();
    ok(before.phase === 'challenge' && before.path === 'feared', 'T6 challenge started');
    // the pending prompt lives on state.scholar; pg.table lives on progState.
    // The mantle pass MUTATES the same scholar object (villagerId swap), so
    // both must survive a bearer change.
    const pgTableBefore = JSON.stringify(Game.tableState());
    const tcBefore = JSON.stringify((Game.state.scholar.tableChoices || {}).options.map(o => o.id));
    Game.state.scholar.villagerId = 'successor-vid';
    const pgTableAfter = JSON.stringify(Game.tableState());
    const tcAfter = JSON.stringify(((Game.state.scholar.tableChoices || {}).options || []).map(o => o.id));
    ok(pgTableBefore === pgTableAfter, 'T6 pg.table survives bearer change');
    ok(tcBefore === tcAfter && tcAfter.length > 2, 'T6 pending prompt survives bearer change');
    const ctx = {};
    tableRoad(Game, ctx);
    ok(Game.won === true, 'T6 successor answers the table to WON');
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });

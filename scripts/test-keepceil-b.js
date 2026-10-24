#!/usr/bin/env node
// test-keepceil-b.js — KEEPCEIL keep-ceiling volume knob, KILL STATE
// (sim-keepceil-b, 2026-10-24, axis food-economy, oversight-flesh-out-loop-b).
//
// KILL VERDICT (pilot NO-GO, see evidence/2026-10-24/sim-keepceil-b.md):
// the lever was killed at pilot — the run-level volume-knob concept does
// not hold (leadfeast means flat: 134.0/140.8/138.1 per glut-day, killed by
// trajectory divergence + the kept-food feedback loop, seed 9253 brought
// growing 150k->266k with ceiling). The game-code layer was reverted to
// ZERO TRACE in src/js/game.js. This test proves the kill state:
//
//   - _keepCeilingKcal is ABSENT (no helper, no env read, no KEEPCEIL
//     reference anywhere in game.js behavior).
//   - The LANDED behavior is intact: DG=1 homecoming keeps exactly 6000
//     whatever KEEPCEIL says (4000/8000/unset are all IGNORED — the env
//     cannot steer the ceiling anymore); DG=0 keeps the base 2000.
//   - The pre-kill mechanism proof ran GREEN in-branch (kept == KEEPCEIL
//     for 4000/6000/8000, OFF-vs-6000 state-hash identical, invalid values
//     falling back to 6000 — recorded in the evidence file §hook proof).
//
// Fixture (same as the live proof): plentiful pantry (100000 fresh kcal ->
// freshDays > 4, gate engaged on DG=1, pantry room 20000 under the 120000
// cap) + scholar pack of exactly 10000 finished kcal. One returnToVillage()
// call runs the keep/give split; kept = pack food kcal after the call.
// Exit 0 iff all checks pass.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';
process.env.PLENTYDEPRI = '0';

function packKcal(Game) {
  const inv = ((Game.state || {}).scholar || {}).inventory || [];
  let t = 0;
  for (const i of inv) {
    if (((i.kcalEach || 0) > 0) && !(Game.isUnprocessed && Game.isUnprocessed(i))) t += (i.units || 0) * (i.kcalEach || 0);
  }
  return Math.round(t);
}

async function fixture() {
  const { Game } = await loadGame({ seed: 9001, mode: 'proof-keepceil', fullTelemetry: false });
  await setupGame(Game);
  Game.state.scholar.day = 30;
  const v = Game.state.village;
  v.pantry = [];
  Game.stockPantry(100000, 'Foraged food');
  Game.state.scholar.inventory = [
    { name: 'Test pemmican', kcalEach: 100, units: 100, spoilDay: 99999 },
  ];
  return Game;
}

(async () => {
  let fail = 0;
  const check = (name, cond, detail) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail !== undefined ? ' — ' + detail : '')); if (!cond) fail++; };

  async function homecoming(keepceil, dg) {
    if (keepceil === undefined) delete process.env.KEEPCEIL; else process.env.KEEPCEIL = keepceil;
    process.env.DEPOSITGATE = dg;
    const Game = await fixture();
    check('fixture plentiful (freshDays>4)', Game.pantryFreshDays() > 4);
    check('fixture brought 10000', packKcal(Game) === 10000);
    Game.returnToVillage();
    return { Game, kept: packKcal(Game) };
  }

  // ---------- KILL zero game-code trace ----------
  {
    const Game = await fixture();
    check('KILL zero game-code trace: _keepCeilingKcal absent', Game._keepCeilingKcal === undefined);
    check('KILL landed behavior intact: _depositGateEngaged present', typeof Game._depositGateEngaged === 'function');
  }

  // ---------- KILL: KEEPCEIL env is IGNORED on DG=1 (always landed 6000) ----------
  for (const kc of [undefined, '4000', '8000', 'banana']) {
    const r = await homecoming(kc, '1');
    check('KILL DG=1 KEEPCEIL=' + JSON.stringify(kc) + ' ignored, keeps landed 6000', r.kept === 6000, 'kept=' + r.kept);
  }

  // ---------- KILL: DG=0 still base 2000 ----------
  for (const kc of [undefined, '8000']) {
    const r = await homecoming(kc, '0');
    check('KILL DG=0 KEEPCEIL=' + JSON.stringify(kc) + ' keeps base 2000', r.kept === 2000, 'kept=' + r.kept);
  }

  console.log(fail === 0 ? '\nALL GREEN (kill-state)' : `\n${fail} FAILURES (kill-state)`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('PROOF CRASH', e); process.exit(2); });

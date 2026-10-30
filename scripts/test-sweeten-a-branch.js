#!/usr/bin/env node
// test-sweeten-a-branch.js — DIAG ONLY, sim-sweeten-a.
// Proves the engine sweeten branch (hierarchy.js answerCounter
// 'sweeten') is LIVE code, not dead code: a staged counter answered
// 'sweeten' removes exactly 1,500 pantry kcal and clears the counter
// (link formed at your terms on re-judgment success, refusal with the
// food kept by the other side on failure — either outcome proves the
// branch ran). A second leg proves the under-funded failure path:
// pantry < 1,500 leaves the counter standing and returns 'counter'.
// This is a fixture, not a sim: it stages the counter directly via
// _stageCounter (the same method proposeLink calls on a mid-band
// score), exactly as test-tributecost-zero.js stages its counters.
// Usage: node scripts/test-sweeten-a-branch.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ok ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}
function pantryKcal(Game) {
  return ((Game.state.village || {}).pantry || [])
    .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
}
function setPantry(Game, totalKcal) {
  // 500-kcal units divide 1,500 exactly, so the sweetener removal is
  // exactly 1,500 (no whole-unit over-removal noise).
  const units = Math.round(totalKcal / 500);
  Game.state.village.pantry = [{ name: 'fixture grain', kcalEach: 500, units, spoilDay: 99999 }];
}

async function main() {
  const { Game } = await loadGame({ seed: 9911, mode: 'sweeten-a-branch' });
  await setupGame(Game);
  check('H1 answerCounter exposed', typeof Game.answerCounter === 'function');
  check('H2 _stageCounter exposed', typeof Game._stageCounter === 'function');
  const ovs = (Game.state.otherVillages || []).filter(v => v && v.id);
  check('H3 at least two other villages', ovs.length >= 2, 'found ' + ovs.length);
  if (fail) { console.log(`${pass} passed, ${fail} failed`); process.exit(1); }

  // Leg 1: funded sweeten.
  Game._stageCounter(ovs[0].id, { asSubordinate: false, tributeKcalPerWeek: 4000 }, null);
  check('L1 counter staged', !!Game.state.pendingCounter);
  setPantry(Game, 30000);
  check('L1 pantry set to 30000', pantryKcal(Game) === 30000, 'got ' + pantryKcal(Game));
  const before = pantryKcal(Game);
  const out = Game.answerCounter('sweeten');
  const after = pantryKcal(Game);
  check('L1 sweeten removes exactly 1500', before - after === 1500, `before=${before} after=${after}`);
  check('L1 counter cleared after sweeten', !Game.state.pendingCounter);
  check('L1 outcome is link-formed or refusal (both prove branch ran)',
    (out && typeof out === 'object') || out === null, 'got ' + JSON.stringify(out));
  if (out && typeof out === 'object') {
    check('L1 formed link is Haven-primary (your terms)', out.primary === 'haven', 'primary=' + out.primary);
  } else {
    console.log('  note L1 outcome was refusal: food taken, no link (branch ran, re-judgment failed)');
  }

  // Leg 2: under-funded sweeten keeps the counter standing.
  const target2 = ovs[1].id;
  Game._stageCounter(target2, { asSubordinate: false, tributeKcalPerWeek: 4000 }, null);
  setPantry(Game, 1000);
  const out2 = Game.answerCounter('sweeten');
  check('L2 under-funded sweeten returns counter', out2 === 'counter', 'got ' + JSON.stringify(out2));
  check('L2 counter still standing', !!Game.state.pendingCounter);
  check('L2 pantry drained to 0 by partial removal', pantryKcal(Game) === 0, 'got ' + pantryKcal(Game));

  console.log(`${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });

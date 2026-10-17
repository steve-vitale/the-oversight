#!/usr/bin/env node
// scripts/test-phantomfood-20261017.js — PHANTOMFOOD arm proof test.
//
// THE BLANK: stockSurplus's Math.round(give/200) mints systematic phantom
// food — ~+72 kcal/call when give sits in [100,200) (+6,731 over 93 calls/12d
// on wasterate seed 4301), and crumbs <100 kcal evaporate silently. The
// "symmetric error" comment is wrong for the observed give distribution.
// THE FIX: remainder-carry — v._surplusRemainder accumulates sub-unit
// surplus across shares; whole 200-kcal units emit, the fraction waits.
// Both dishonesties die in one mechanism.
//
// Fixture plan (asserts the FIXED behavior; run on pristine to see RED):
//   A. five gives of 150: fixed -> 3 units (600) + remainder 150
//      (pristine: 5 units = 1000 -> +250 phantom minted)
//   B. four gives of 50: fixed -> 1 unit (200) + remainder 0
//      (pristine: 0 units -> 200 kcal evaporated)
//   C. cap: pantry near cap -> units truncated at the cap door (preserved),
//      remainder still carried honestly
//   D. fresh clock + stacking: same-day shares merge into one stack with
//      spoilDay = day+3; next-day share opens a fresh stack; item shape kept
//   E. legacy gate: PHANTOMFOOD_FIX=0 -> pristine Math.round behavior
//      (skipped with INFO note on pristine, where the gate doesn't exist)
// SENSE: stockSurplus emits no narration — a share must say nothing new.
// The fixture captures Game.say and fails if stockSurplus narrates.
// Node harness: sim-harness loadGame (full src/js list, Math.random seeded
// before eval), Game.save never stubbed.
'use strict';
const { loadGame, setupGame, quietLog } = require('./sim-harness');

const EPS = 1e-6;

function foragedStacks(Game, v) {
  return ((v || {}).pantry || []).filter(p => p && p.name === 'Foraged food' && (p.kcalEach || 0) === 200);
}
function foragedKcal(Game, v) {
  return foragedStacks(Game, v).reduce((t, i) => t + (i.units || 0) * 200, 0);
}
function freshVillage(Game, day) {
  const v = Game.state.village;
  v.pantry = [];
  v.day = day;
  delete v._surplusRemainder;
  return v;
}

(async () => {
  const { Game } = await loadGame({ seed: 42, mode: 'proof-phantomfood', fullTelemetry: false });
  await quietLog(async () => { await setupGame(Game); });
  const day = (Game.state.scholar || {}).day || 1;

  // capture any narration stockSurplus emits
  const said = [];
  const origSay = Game.say;
  Game.say = function (m) { said.push(String(m)); return origSay.call(this, m); };

  let fail = 0;
  const check = (name, cond, extra) => {
    console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (extra ? ' [' + extra + ']' : ''));
    if (!cond) fail++;
  };
  const remOf = (v) => Number(v._surplusRemainder) || 0;

  // ---- A: five 150s in [100,200) ----
  let v = freshVillage(Game, day);
  for (let i = 0; i < 5; i++) Game.stockSurplus(v, 150);
  check('A: five 150s deposit exactly 3 units (600 kcal)', foragedKcal(Game, v) === 600,
    'deposited=' + foragedKcal(Game, v));
  check('A: remainder carries 150 (750 given, 600 emitted)', Math.abs(remOf(v) - 150) < EPS,
    'remainder=' + remOf(v));
  check('A: remainder < 200 (bounded carry)', remOf(v) < 200, 'remainder=' + remOf(v));

  // ---- B: crumbs accumulate then emit ----
  v = freshVillage(Game, day);
  Game.stockSurplus(v, 50); Game.stockSurplus(v, 50); Game.stockSurplus(v, 50);
  check('B: three 50s deposit nothing yet (crumbs kept, not evaporated)',
    foragedKcal(Game, v) === 0 && Math.abs(remOf(v) - 150) < EPS,
    'deposited=' + foragedKcal(Game, v) + ' remainder=' + remOf(v));
  Game.stockSurplus(v, 50); // 200 total -> emits
  check('B: fourth 50 emits exactly 1 unit (200 in, 200 out)',
    foragedKcal(Game, v) === 200 && Math.abs(remOf(v)) < EPS,
    'deposited=' + foragedKcal(Game, v) + ' remainder=' + remOf(v));

  // ---- C: cap door preserved; remainder still honest ----
  v = freshVillage(Game, day);
  const cap = Game.pantryCapKcal();
  // fill pantry to cap-100 with a non-foraged filler
  v.pantry = [{ name: 'Filler', kcalEach: 1, units: cap - 100, spoilDay: day + 30, safe: true, kg: 1 }];
  Game.stockSurplus(v, 500); // floor(500/200)=2 units, room=100 -> 0 deposit
  check('C: cap truncates units to 0 (room 100 < 200)', foragedKcal(Game, v) === 0,
    'deposited=' + foragedKcal(Game, v));
  check('C: remainder still carries the un-emitted 100', Math.abs(remOf(v) - 100) < EPS,
    'remainder=' + remOf(v));
  check('C: filler untouched', (v.pantry.find(p => p.name === 'Filler') || {}).units === cap - 100);

  // ---- D: fresh clock + spoilDay-matched stacking + item shape ----
  v = freshVillage(Game, day);
  Game.stockSurplus(v, 200); // 1 unit, fresh clock day+3
  Game.stockSurplus(v, 200); // merges
  let stacks = foragedStacks(Game, v);
  check('D: same-day shares merge into one stack', stacks.length === 1 && stacks[0].units === 2,
    'stacks=' + stacks.length + ' units=' + ((stacks[0] || {}).units));
  check('D: fresh clock spoilDay = day+3', stacks[0] && stacks[0].spoilDay === day + 3,
    'spoilDay=' + (stacks[0] && stacks[0].spoilDay));
  const shape = stacks[0] || {};
  check('D: item shape preserved (kcalEach/200, kg/0.2, safe)',
    shape.kcalEach === 200 && shape.kg === 0.2 && shape.safe === true,
    JSON.stringify({ k: shape.kcalEach, kg: shape.kg, safe: shape.safe }));
  v.day = day + 1; // tomorrow's clock
  Game.stockSurplus(v, 200);
  stacks = foragedStacks(Game, v);
  check('D: next-day share opens a fresh stack (own clock)',
    stacks.length === 2 && stacks.some(s => s.spoilDay === day + 4),
    'stacks=' + stacks.length + ' days=' + stacks.map(s => s.spoilDay).join(','));

  // ---- E: legacy gate ----
  if (typeof Game._phantomFoodFixOff === 'function') {
    v = freshVillage(Game, day);
    const savedEnv = process.env.PHANTOMFOOD_FIX;
    process.env.PHANTOMFOOD_FIX = '0';
    Game.stockSurplus(v, 150); // pristine: Math.round(150/200) = 1 unit
    if (savedEnv === undefined) delete process.env.PHANTOMFOOD_FIX;
    else process.env.PHANTOMFOOD_FIX = savedEnv;
    check('E: PHANTOMFOOD_FIX=0 restores legacy Math.round (1 unit for 150)',
      foragedKcal(Game, v) === 200, 'deposited=' + foragedKcal(Game, v));
    check('E: legacy path writes no remainder field', v._surplusRemainder === undefined,
      'remainder=' + v._surplusRemainder);
  } else {
    console.log('INFO E: gate absent (pristine tree) — legacy fixtures skipped');
  }

  // ---- SENSE: voice-invisible ----
  Game.say = origSay;
  const surplusSaid = said.some(s => /surplus|remainder|share/i.test(s));
  check('SENSE: stockSurplus narrates nothing new (voice-invisible)', !surplusSaid,
    said.length ? 'said=' + JSON.stringify(said.slice(0, 2)) : 'silent');

  console.log(fail === 0 ? 'ALL GREEN' : `${fail} FAILURES`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST CRASH:', e && e.stack || e); process.exit(2); });

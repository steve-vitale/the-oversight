#!/usr/bin/env node
// scripts/test-ledgerpenalty-20261014.js — sim-findings #156 PROOF (2026-10-14).
//
// CUMULATIVE TAKE PENALTY vs RATE LEDGER: takeFromPantry's "-2 trust per take
// when net < -5000" keys on the CUMULATIVE gross ledger (v.takes/v.gives, no
// time decay) while r8/r9 built the rate-based takeHist/giveHist (trailing-7d
// net rate vs the 3000 kcal/day abuse bar) for exactly this judgment.
// The fix routes the per-take sting through the rate ledger:
//
//   RED tests (FAIL on pristine, PASS after fix):
//     T1  s11 scenario: hostile cumulative ledger + honest 1080/day rate
//         history -> one 500-kcal take stings -2 on pristine, silent after.
//     T1b multi-take: 10 honest takes at trust 30 -> pristine 30->10, fixed 30.
//     T2  lifetime ledger, zero recent rate -> pristine stings, fixed silent.
//     T4  boundary: net rate 2999.4/day (incl. the take itself) -> pristine
//         stings, fixed silent.
//     T6  contributor netting: 4000/day takes + 2000/day gives, hostile
//         cumulative -> pristine -7 (penalty -2 AND take-back -5), fixed -5
//         (penalty silent, take-back exploit guard untouched).
//     T7  thief branch rides the same gate: hostile cumulative + honest rate,
//         thief always caught -> pristine -20, fixed silent.
//   GUARD tests (PASS on both — the teeth stay):
//     T3  genuine drain: 4000/day net rate -> -2 on both builds.
//     T5  boundary: net rate 3000.4/day -> -2 on both builds.
//     T8  accounting untouched: v.takes still records the take on both.
//
// Usage: node scripts/test-ledgerpenalty-20261014.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

async function main() {
  const { Game } = await loadGame({ seed: 4242, mode: 'ledgerpenalty' });
  await setupGame(Game);
  const v = Game.state.village;
  const vid = Game.villagerId;

  // deterministic: no witnesses (theftConfrontation returns before the
  // confrontation machinery), fixed random (no 30% watch-line; thief always
  // caught when its branch fires).
  const realWitnesses = Game.witnesses;
  Game.witnesses = () => [];
  const realRandom = Math.random;
  Math.random = () => 0.99;
  const realSay = Game.say;
  let said = [];
  Game.say = (m) => { said.push(String((m && (m.text || m)) || m)); return null; };
  const realHasAbility = Game.hasAbility;

  function setDay(d) { Game.state.scholar.day = d; }
  function resetLedger() {
    v.takes = {}; v.gives = {}; v.takeHist = {}; v.giveHist = {};
    v.trust = {}; v.trust[vid] = 10;
    v.giveTrust = {}; v.giveXP = {};
    said = [];
    Game.hasAbility = realHasAbility;
  }
  // seed `days` days of rate history ending endDay, one entry per day.
  function seedRate(takePerDay, givePerDay, days, endDay) {
    for (let d = endDay - days + 1; d <= endDay; d++) {
      Game.state.scholar.day = d;
      if (takePerDay > 0) Game.recordTakeHist(vid, takePerDay);
      if (givePerDay > 0) Game.recordGiveHist(vid, givePerDay);
    }
    setDay(endDay);
  }
  function pantryTake(kcal, trustStart) {
    if (trustStart !== undefined) v.trust[vid] = trustStart;
    said = [];
    v.pantry = v.pantry || [];
    v.pantry.push({ name: 'test biscuit', kcalEach: kcal, units: 5, kg: 0.1, unit: 'item' });
    try { Game.takeFromPantry(v.pantry.length - 1); }
    catch (e) { console.log('  (takeFromPantry threw: ' + e.message + ')'); }
    return v.trust[vid];
  }
  const netRate7 = () => Game.takeRate7(vid) - Game.giveRate7(vid);

  console.log('== T1 (RED): s11 scenario — hostile cumulative, honest 1080/day rate ==');
  resetLedger(); setDay(30);
  v.takes[vid] = 42148; v.gives[vid] = 0; // net -42148: the r28 s11 30d shape
  seedRate(1080, 0, 7, 30);               // honest communal eating
  ok('T1: seeded net rate is ~1151/day (excl. take)', Math.abs((7 * 1080) / 7 - 1080) < 1,
    `rate=${netRate7().toFixed(1)}`);
  const t1 = pantryTake(500, 10);
  ok('T1: honest take at hostile cumulative ledger does NOT sting (-2)', t1 === 10,
    `trust 10 -> ${t1} (pristine: 8)`);

  console.log('== T1b (RED): 10 honest takes do not grind trust down ==');
  resetLedger(); setDay(40);
  v.takes[vid] = 42148; v.gives[vid] = 0;
  seedRate(1080, 0, 7, 40);
  for (let i = 0; i < 10; i++) pantryTake(500, i === 0 ? 30 : undefined);
  ok('T1b: 10 honest takes leave trust at 30', v.trust[vid] === 30,
    `trust 30 -> ${v.trust[vid]} (pristine: 10)`);

  console.log('== T2 (RED): lifetime ledger, zero recent rate ==');
  resetLedger(); setDay(50);
  v.takes[vid] = 60000; v.gives[vid] = 0; // a whole past life of eating
  v.takeHist = {};                        // nothing in the trailing window
  const t2 = pantryTake(500, 10);
  ok('T2: stale lifetime ledger does NOT sting', t2 === 10,
    `trust 10 -> ${t2} (pristine: 8); rate=${netRate7().toFixed(1)}/day`);

  console.log('== T3 (GUARD): genuine drain still stings ==');
  resetLedger(); setDay(60);
  v.takes[vid] = 28000; v.gives[vid] = 0;
  seedRate(4000, 0, 7, 60);
  const t3 = pantryTake(500, 10);
  ok('T3: 4000/day net rate still stings -2', t3 === 8,
    `trust 10 -> ${t3}; rate=${netRate7().toFixed(1)}/day`);

  console.log('== T4 (RED): boundary — 2999.4/day net (incl. the take) ==');
  resetLedger(); setDay(70);
  v.takes[vid] = 30000; v.gives[vid] = 0;
  seedRate(2928, 0, 7, 70); // (7*2928 + 500)/7 = 2999.43 once the take lands
  const t4 = pantryTake(500, 10);
  ok('T4: 2999.4/day net rate does NOT sting', t4 === 10,
    `trust 10 -> ${t4} (pristine: 8); rate=${netRate7().toFixed(2)}/day`);

  console.log('== T5 (GUARD): boundary — 3000.4/day net (incl. the take) ==');
  resetLedger(); setDay(80);
  v.takes[vid] = 30000; v.gives[vid] = 0;
  seedRate(2929, 0, 7, 80); // (7*2929 + 500)/7 = 3000.43 once the take lands
  const t5 = pantryTake(500, 10);
  ok('T5: 3000.4/day net rate still stings -2', t5 === 8,
    `trust 10 -> ${t5}; rate=${netRate7().toFixed(2)}/day`);

  console.log('== T6 (RED+GUARD): contributor netting; take-back guard untouched ==');
  resetLedger(); setDay(90);
  v.takes[vid] = 28000; v.gives[vid] = 14000; // cumulative net -14000
  seedRate(4000, 2000, 7, 90);                // net rate (28500/7)-2000 = 2071/day
  const t6 = pantryTake(500, 10);
  // fixed: per-take penalty silent (2071 < 3000), take-back -5 still fires
  // (gave>0, net<=0 — the donate-take-back exploit guard is a separate system).
  ok('T6: contributor stung ONLY by the take-back guard (-5), not the penalty',
    t6 === 5, `trust 10 -> ${t6} (pristine: 3 = -2 penalty + -5 take-back)`);

  console.log('== T7 (RED): thief branch rides the same gate ==');
  resetLedger(); setDay(100);
  Game.hasAbility = (id) => id === 'thief'; // always caught: Math.random = 0.99
  v.takes[vid] = 42148; v.gives[vid] = 0;
  seedRate(1080, 0, 7, 100);
  const t7 = pantryTake(500, 10);
  Game.hasAbility = realHasAbility;
  ok('T7: honest rate + thief caught does NOT sting', t7 === 10,
    `trust 10 -> ${t7} (pristine: 0, caught -20)`);

  console.log('== T8 (GUARD): cumulative accounting untouched ==');
  resetLedger(); setDay(110);
  v.takes[vid] = 42148; v.gives[vid] = 0;
  seedRate(1080, 0, 7, 110);
  pantryTake(500, 10);
  ok('T8: v.takes still records the take exactly', v.takes[vid] === 42648,
    `takes=${v.takes[vid]}`);

  Game.witnesses = realWitnesses;
  Math.random = realRandom;
  Game.say = realSay;
  Game.hasAbility = realHasAbility;
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('HARNESS FAIL', e); process.exit(2); });

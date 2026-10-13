#!/usr/bin/env node
// test-fight-assess-r1.js — mechanism proof for the scale-wall r3
// FIGHT-ASSESS lever (policy-side pre-fight damage-race assessment).
// Pure-function tests with mock Games: race math, knowledge gating, counter
// discount, dead-in-two rule, lore learning, map-level decline, gate wiring.
'use strict';
const monsters = require('../src/data/monsters.json');
const C = require('./policies/competent.js');

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
function mockGame(opts) {
  opts = opts || {};
  return {
    state: {
      codex: { monsters: opts.codexMonsters || {} },
      scholar: { hp: opts.hp || 100, health: opts.hp || 100 },
      monsterCounters: opts.counters || {},
    },
    data: { monsters },
    equippedWeapon: () => ({ bonus: opts.bonus || 0 }),
    maxHealth: () => 100,
    monsterAt: opts.monsterAt || (() => null),
  };
}
function fighter(mid, hp) {
  const def = monsters.find(d => d.id === mid);
  const h = hp || (def && def.hp ? Math.round((def.hp[0] + def.hp[1]) / 2) : 100);
  return { kind: 'monster', hp: h, maxHp: h, monsterId: mid };
}

// T1: unwinnable race declines — gallowdeer (codex-known, 20–30 DPR, 160 HP)
// vs unarmed scholar (100 HP, DPR 13).
{
  const G = mockGame({ codexMonsters: { gallowdeer: { stage: 'observed' } } });
  const ctx = {};
  const p = { hp: 100, maxHp: 100 };
  const race = C.fightAssessRace(G, ctx, [fighter('gallowdeer')], p);
  ok('T1 decline=true', race.decline === true, JSON.stringify(race.detail));
  ok('T1 lostRace', race.detail.lostRace === true);
  ok('T1 monsterDPR=25 (def midpoint)', race.detail.monsterDPR === 25, 'got ' + race.detail.monsterDPR);
  ok('T1 roundsToKill>roundsToDie', race.detail.roundsToKill > race.detail.roundsToDie,
    JSON.stringify({ k: race.detail.roundsToKill, d: race.detail.roundsToDie }));
}

// T2: winnable fight holds — weak monster vs machete-armed scholar.
{
  const G = mockGame({ bonus: 35, codexMonsters: { ducks_in_a_row: { stage: 'slain' } } });
  const ctx = {};
  const p = { hp: 110, maxHp: 110 };
  const race = C.fightAssessRace(G, ctx, [fighter('ducks_in_a_row', 40)], p);
  ok('T2 decline=false (winnable)', race.decline === false, JSON.stringify(race.detail));
  ok('T2 playerDPR=48', race.detail.playerDPR === 48, 'got ' + race.detail.playerDPR);
}

// T3: knowledge gating — unknown species uses the pessimistic prior.
{
  const G = mockGame({});
  const ctx = {};
  const dpr = C.fightAssessDPR(G, ctx, 'gallowdeer');
  ok('T3 unknown -> prior 20', dpr === 20, 'got ' + dpr);
  const G2 = mockGame({ codexMonsters: { gallowdeer: { stage: 'observed' } } });
  const dpr2 = C.fightAssessDPR(G2, {}, 'gallowdeer');
  ok('T3 codex-known -> def midpoint 25', dpr2 === 25, 'got ' + dpr2);
}

// T4: lore overrides the prior — the scholar learns from its own fights.
{
  const G = mockGame({});
  const ctx = {};
  // two ticks: 100 -> 80 HP with 2 monsters of the same species present
  const f = { fighters: [fighter('gallowdeer'), fighter('gallowdeer')] };
  C.fightAssessLore(G, ctx, f, { hp: 100 }, f.fighters);
  C.fightAssessLore(G, ctx, f, { hp: 80 }, f.fighters);
  const lore = (ctx._fightLore || {}).gallowdeer || {};
  // two same-species monsters share the 20-HP drop: 10 each, 2 samples
  ok('T4 lore recorded', lore.samples === 2 && lore.taken === 20,
    JSON.stringify(lore));
  const dpr = C.fightAssessDPR(G, ctx, 'gallowdeer');
  ok('T4 lore DPR=10 replaces prior', dpr === 10, 'got ' + dpr);
}

// T5: dead-in-two rule — overwhelming incoming DPR declines even when the
// race math is close (tiny monster, huge damage).
{
  const G = mockGame({ codexMonsters: { bulldozer: { stage: 'observed' } } });
  const ctx = {};
  const p = { hp: 100, maxHp: 100 };
  const m = fighter('bulldozer', 5); // 5 HP but 18–25 DPR
  const race = C.fightAssessRace(G, ctx, [m], p);
  // playerDPR 13 kills it in 0.4 rounds — but 21.5 DPR vs 100 HP: not dead-in-two; check logic path
  ok('T5 runs', typeof race.decline === 'boolean');
  const p2 = { hp: 30, maxHp: 100 };
  const race2 = C.fightAssessRace(G, {}, [fighter('bulldozer', 200)], p2);
  ok('T5 deadInTwo declines (43/2 >= 15)', race2.decline === true && race2.detail.deadInTwo === true,
    JSON.stringify(race2.detail));
}

// T6: known counter discounts DPR — bulldozer (counter known via slain codex)
// DPR 21.5 -> ×0.7 = 15.05.
{
  const G = mockGame({ codexMonsters: { bulldozer: { stage: 'slain' } } });
  const ctx = {};
  const race = C.fightAssessRace(G, ctx, [fighter('bulldozer', 200)], { hp: 200, maxHp: 200 });
  ok('T6 counter discount applied', Math.abs(race.detail.monsterDPR - 15.05) < 0.1,
    'got ' + race.detail.monsterDPR);
  const G2 = mockGame({ codexMonsters: { bulldozer: { stage: 'observed' } } });
  const race2 = C.fightAssessRace(G2, {}, [fighter('bulldozer', 200)], { hp: 200, maxHp: 200 });
  ok('T6 observed-only: no discount', Math.abs(race2.detail.monsterDPR - 21.5) < 0.01,
    'got ' + race2.detail.monsterDPR);
}

// T7: fightAssessHook wires through flee on decline; gate wiring.
{
  process.env.COMPETENT_FIGHT_ASSESS = '1';
  ok('T7 gate on', C.fightAssessOn() === true);
  const G = mockGame({ codexMonsters: { gallowdeer: { stage: 'observed' } } });
  const ctx = {};
  const f = { fighters: [fighter('gallowdeer')] };
  let fled = false;
  const r = C.fightAssessHook(G, f, ctx, { hp: 100, maxHp: 100 }, () => { fled = true; return true; });
  ok('T7 hook disengages lost race', r === true && fled === true);
  ok('T7 counters', ctx.faChecks === 1 && ctx.faDeclined === 1,
    JSON.stringify({ c: ctx.faChecks, d: ctx.faDeclined }));
  const G2 = mockGame({ codexMonsters: { ducks_in_a_row: { stage: 'slain' } } });
  const ctx2 = {};
  const f2 = { fighters: [fighter('ducks_in_a_row', 40)] };
  const r2 = C.fightAssessHook(G2, f2, ctx2, { hp: 110, maxHp: 110 }, () => true);
  ok('T7 hook holds winnable fight', r2 === false && !ctx2.faDeclined);
  delete process.env.COMPETENT_FIGHT_ASSESS;
  ok('T7 gate off default', C.fightAssessOn() === false);
}

// T8: map-level decline — monster-active tile with unwinnable race is skipped.
{
  process.env.COMPETENT_FIGHT_ASSESS = '1';
  const wm = { id: 'gallowdeer', hp: 160, maxHp: 160, tx: 3, ty: 3 };
  const G = mockGame({
    codexMonsters: { gallowdeer: { stage: 'observed' } },
    monsterAt: (x, y) => (x === 3 && y === 3 ? wm : null),
  });
  const ctx = {};
  ok('T8 skip unwinnable tile', C.fightAssessSkipTile(G, ctx, 3, 3) === true);
  ok('T8 skip counter', ctx.faSkipped === 1);
  ok('T8 clean tile not skipped', C.fightAssessSkipTile(G, {}, 4, 4) === false);
  delete process.env.COMPETENT_FIGHT_ASSESS;
}

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

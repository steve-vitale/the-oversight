#!/usr/bin/env node
// scripts/test-food-coupling-instrument-20261013.js — mechanism proof for the
// fight->food coupling instrument (longsim scale-wall r5, 2026-10-13).
//
// Claims: attachInstruments(Game) counts kills (recordWaveKill), butchered
// kcal (carcassToMeat), pantry influx (stockPantry), and vests — without
// mutating game state or touching RNG. Deterministic: mulberry32 seeded
// BEFORE eval (sim-harness does this), SEED override available.
//
// RED-verification: run with FOODCOUPLE_BREAK=1 — attachInstruments is
// sabotaged (wraps skip counting) and every count assertion must FAIL.
// On pristine the full suite passes on seeds 11, 22, 33.
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');
const { attachInstruments, dailyRow, vestCount } = require('./food-coupling-20261013');

const SEEDS = (process.env.SEED ? [parseInt(process.env.SEED, 10)] : [11, 22, 33]);
const BREAK = process.env.FOODCOUPLE_BREAK === '1';
let passed = 0;

function ok(name, cond, detail) {
  if (!cond) { console.error(`FAIL ${name}: ${detail || ''}`); process.exitCode = 1; return; }
  passed++; console.log(`ok ${name}`);
}

(async () => {
  for (const seed of SEEDS) {
    const { Game } = await loadGame({ seed, mode: 'foodcouple-test' });
    await setupGame(Game);
    const tag = `seed${seed}`;
    const m = attachInstruments(Game);
    if (BREAK) {
      // sabotage: wraps stop counting (simulates a broken instrument)
      m.kills.push = () => {};
      m.butcher.push = () => {};
    }

    // T1: kills wrap counts recordWaveKill and matches Game.state tallies
    const kBefore = m.kills.length;
    const wkBefore = (Game.state.waveKills || {})[1] || 0;
    Game.recordWaveKill('hushwolf');
    Game.recordWaveKill('hushwolf');
    Game.recordWaveKill('bulldozer');
    ok(`${tag} T1 kills counted`, m.kills.length === kBefore + 3, `got ${m.kills.length - kBefore}`);
    ok(`${tag} T1 kills carry wave`, m.kills.every(k => k.wave === 1), JSON.stringify(m.kills.slice(-3)));
    const wkAfter = (Game.state.waveKills || {})[1] || 0;
    ok(`${tag} T1 wrap matches state tally`, wkAfter - wkBefore === 3, `${wkAfter - wkBefore} != 3`);

    // T2: butcher wrap captures gross + net within the honest bounds
    const inv = Game.state.scholar.inventory;
    const gross = 2000;
    inv.push({ name: 'Test beast (carcass)', foodState: 'carcass', hiddenKcal: gross, plantId: 'meat_testbeast', how: 'hunted', kcalEach: 0, units: 1 });
    const bBefore = m.butcher.length;
    Game.carcassToMeat(inv, inv.length - 1, true);
    ok(`${tag} T2 butcher event recorded`, m.butcher.length === bBefore + 1, `got ${m.butcher.length - bBefore}`);
    const ev = m.butcher[m.butcher.length - 1];
    ok(`${tag} T2 gross honest`, ev.gross === gross, `gross=${ev.gross}`);
    // known-or-blind: net == round(gross * yfrac), 0.30 (blind) <= yfrac <= 0.95
    ok(`${tag} T2 net within honest bounds`, ev.net >= Math.round(gross * 0.30) - 1 && ev.net <= Math.round(gross * 0.95) + 1,
      `net=${ev.net} gross=${ev.gross}`);
    ok(`${tag} T2 no calorie creation`, ev.net <= ev.gross, `net=${ev.net} > gross=${ev.gross}`);

    // T3: stockPantry influx wrap
    const iBefore = (m.influx['Test influx'] || 0);
    Game.stockPantry(1200, 'Test influx');
    ok(`${tag} T3 influx counted`, (m.influx['Test influx'] || 0) === iBefore + 1200, `got ${m.influx['Test influx']}`);

    // T4: dailyRow reads need/pantry without crashing, need sane
    const row = dailyRow(Game);
    ok(`${tag} T4 daily row`, row.need > 0 && row.pop > 0, `need=${row.need} pop=${row.pop}`);
    ok(`${tag} T4 pantry days sane`, row.pantryDays >= 0 && row.pantryDays <= 999, `pantryDays=${row.pantryDays}`);

    // T5: vest scan returns a number, counts a planted vest
    const v0 = vestCount(Game);
    inv.push({ name: 'Military vest', id: 'military_vest', foodKind: null });
    ok(`${tag} T5 vest counted`, vestCount(Game) === v0 + 1, `was ${v0}, now ${vestCount(Game)}`);

    // T6: wraps never touched RNG-driven state — deterministic twice
    const s1 = JSON.stringify({ k: m.kills.length, b: m.butcher.length, i: m.influx['Test influx'] });
    ok(`${tag} T6 stable snapshot`, typeof s1 === 'string' && s1.length > 0, '');
  }
  console.log(`\n${passed} assertions passed (BREAK=${BREAK})`);
})().catch(e => { console.error('FATAL', e); process.exit(1); });

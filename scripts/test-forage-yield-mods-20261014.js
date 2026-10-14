#!/usr/bin/env node
// test-forage-yield-mods-20261014.js — the LIVE forage sweep (doAction
// 'forage') honors the modifier pipeline: a bonded relic whose enhancement
// maps to forage.yield (efficient_action x1.25, careful_hands x1.2) raises the units harvested.
// Before the fix, forage.yield / luck.global were read only by
// engine/forage.js, which the live sweep never calls.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('forage-yield-mods');

function sweep(Game, withRelic) {
  const s = Game.state.scholar;
  const t = Game.playerTile();
  t.type = 'forest'; t.stock = 100; t.detailRegrow = {};
  s.mx = 4; s.my = 4;
  // same character both sweeps; only the relic differs
  s.inventory = []; s.abilities = []; s.backgroundAbilities = [];
  if (withRelic) {
    s.inventory.push({ itemId: 'test_relic', name: 'Test relic', units: 1, kg: 0, bonded: true, bond: 100, enhancements: ['efficient_action', 'careful_hands'] });
  }
  const detail = [];
  for (let y = 0; y < 9; y++) { detail.push([]); for (let x = 0; x < 9; x++) detail[y].push('plant'); }
  const og = { genDetail: Game.genDetail, cellScorched: Game.cellScorched, cellPlantSpecies: Game.cellPlantSpecies, rnd: Math.random };
  Game.genDetail = () => detail;
  Game.cellScorched = () => false;
  Game.cellPlantSpecies = () => 'hickory_nut';
  Math.random = () => 0.5;
  const mult = Game.modTarget('forage.yield', 1); // before the sweep teaches anything
  const before = new Set(s.inventory);
  try { Game.doAction('forage', { cx: 4, cy: 4 }); }
  finally { Object.assign(Game, { genDetail: og.genDetail, cellScorched: og.cellScorched, cellPlantSpecies: og.cellPlantSpecies }); Math.random = og.rnd; }
  let units = 0;
  for (const it of s.inventory) {
    if (before.has(it) || !it) continue;
    if (it.plantId === 'hickory_nut' || (it.lump && it.lump.hickory_nut)) units += it.lump ? it.lump.hickory_nut.units : (it.units || 0);
  }
  return { units, mult };
}

(async () => {
  const Game = await K.load({ seed: 1014 });
  K.newRun(Game);
  const base = sweep(Game, false);
  const relic = sweep(Game, true);
  T.ok('control sweep harvests something', base.units > 0, 'units=' + base.units);
  T.ok('relic multiplies forage.yield by 1.5', Math.abs(relic.mult / base.mult - 1.5) < 1e-9, `base=${base.mult} relic=${relic.mult}`);
  T.ok('relic raises live forage units', relic.units > base.units, `base=${base.units} relic=${relic.units}`);
  T.done();
})().catch(e => { console.error(e); process.exitCode = 2; });

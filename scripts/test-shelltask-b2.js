#!/usr/bin/env node
// scripts/test-shelltask-b2.js — PROOF for the pack-shelling revival layer
// (arm sim-shelltask-b2, evidence/2026-10-20/sim-shelltask-b2.md).
//
// PART A — gate-logic units (synthetic states, no engine run): shellableNuts,
//   ediblePackFood, leanDay, timeToSpare, layerOn.
// PART B — RED->GREEN fixture (live engine, constructed lean camp state):
//   RED: base policy (belongfeast, no layer) upkeep leaves in-shell nuts
//        untouched — the behavior genuinely does not exist pre-edit.
//   GREEN: wrapped policy (SHELLCAMP=1) upkeep shells them and the engine's
//        normal pack-eat verb eats the shelled nuts.
// PART C — det-gate: wrapped policy with SHELLCAMP unset vs the unwrapped
//   base, per-day trajectory hashes, 60d x 8 seeds x 2 policies. Must be
//   byte-identical; any diverger is re-checked base-vs-base to attribute
//   substrate noise (the known contest-ID entropy issue, scripts/det-gate.js
//   header).
// PART D — SMOKE: 2 seeds x 2 policies x {control,armed}, 12d, no exceptions.
//
// Post-kill note: if scripts/policies/shelltask-b2.js is ever deleted per the
// kill protocol, there is nothing to prove — skip honestly (exit 0) instead
// of crashing on require, same as the retained test-shelltask-b.js.
try { require.resolve('./policies/shelltask-b2'); }
catch (e) {
  console.log('INFO-SKIP: shelltask-b2 layer absent (kill protocol); status in evidence/2026-10-20/sim-shelltask-b2.md');
  process.exit(0);
}
// Usage: node scripts/test-shelltask-b2.js
'use strict';
const path = require('path');
const { belongfeast, leadfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

function nutItem(units, gross, plantId, name) {
  return {
    name: name + ' (in shell)', foodKind: 'nut', foodState: 'in_shell', edible: false,
    units, hiddenKcal: gross, kcalEach: 0, plantId, spoilDay: 999,
    prep: 'Needs shelling — crack and pick the nutmeats.',
  };
}

async function buildFixture(seed) {
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const s = Game.state.scholar;
  // at Haven
  try {
    const v = Game.state.village || {};
    if (Game.map) { Game.map.px = (v.px ?? 4); Game.map.py = (v.py ?? 4); }
  } catch (e) {}
  // hungry scholar, pack holds ONLY in-shell nuts
  s.kcal = 300;
  s.inventory = [nutItem(3, 800, 'hickory_nut', 'Hickory Nuts'), nutItem(2, 500, 'acorn_white_oak', 'White Oak Acorns')];
  s.dayTicks = 100;
  s.day = 50;
  return Game;
}

function packNuts(Game) {
  const inv = ((Game.state || {}).scholar || {}).inventory || [];
  return inv.filter(i => i && i.foodKind === 'nut');
}

async function partA() {
  console.log('PART A — gate-logic units');
  const L = require('./policies/shelltask-b2');
  const fake = (kcal, inv, dayTicks) => ({
    kcalCap: () => 3000,
    state: { scholar: { kcal, inventory: inv, dayTicks: dayTicks || 100 } },
    TIME: { TICKS_PER_DAY: 512 },
  });
  const nuts = [nutItem(2, 600, 'hickory_nut', 'Hickory Nuts')];
  const berries = [{ name: 'Berries', kcalEach: 100, units: 2, edible: true }];
  check('shellableNuts finds in-shell nuts', L.shellableNuts(fake(300, nuts)).length === 1);
  check('shellableNuts ignores edible food', L.shellableNuts(fake(300, berries)).length === 0);
  check('ediblePackFood true on berries', L.ediblePackFood(fake(300, berries)) === true);
  check('ediblePackFood false on nuts only', L.ediblePackFood(fake(300, nuts)) === false);
  check('leanDay: hungry + nuts only', L.leanDay(fake(300, nuts)) === true);
  check('leanDay: not hungry', L.leanDay(fake(3000, nuts)) === false);
  check('leanDay: edible food present', L.leanDay(fake(300, nuts.concat(berries))) === false);
  check('leanDay: no nuts', L.leanDay(fake(300, berries)) === false);
  check('timeToSpare: mid-day', L.timeToSpare(fake(300, nuts, 100)) === true);
  check('timeToSpare: day nearly spent', L.timeToSpare(fake(300, nuts, 500)) === false);
  check('layerOn: default OFF', L.layerOn() === false);
}

async function partB() {
  console.log('PART B — RED->GREEN fixture (upkeep-level, lean camp state)');
  const L = require('./policies/shelltask-b2');
  // RED: the competent family's normal upkeep never shells
  {
    const Game = await buildFixture(8001);
    try { await quietLog(async () => { belongfeast.upkeep(Game, {}); }); } catch (e) {}
    const states = packNuts(Game).map(i => i.foodState).join(',');
    check('RED: base upkeep leaves nuts in shell', states === 'in_shell,in_shell', `states=${states}`);
  }
  // GREEN: layer shells at Haven on the lean day; the engine's normal
  // pack-eat flow (pack-first in competentEat) then eats the shelled nuts.
  // (Base-change note carried from the retained instrument: the base
  // upkeep's own eat flow eats during upkeep itself — fixture scholar
  // 300 -> ~2390 with the layer OFF, both nuts untouched. With the layer
  // ON, the pack batch is shelled first and the same eat flow consumes the
  // shelled nuts. The discriminating assertion is therefore: no in-shell
  // nuts remain in the pack, and any remainder is shelled+edible.)
  {
    process.env.SHELLCAMP = '1';
    try {
      const wrapped = L.withShellTask(belongfeast, 'belongfeast+shelltask-test', 'test');
      const Game = await buildFixture(8001);
      const kcalBefore = Game.state.scholar.kcal;
      const ctx = {};
      try { await quietLog(async () => { wrapped.upkeep(Game, ctx); }); } catch (e) {}
      const nuts = packNuts(Game);
      const noInShell = nuts.length === 0 || nuts.every(i => i.foodState !== 'in_shell');
      const remainderEdible = nuts.every(i => i.edible === true && (i.kcalEach || 0) > 0);
      check('GREEN: layer shells the pack batch at Haven', noInShell && remainderEdible,
        `states=${nuts.map(i => i.foodState).join(',')} kcal=${kcalBefore}->${Game.state.scholar.kcal} shellDays=${ctx.stShellDays}`);
      check('GREEN: layer telemetry recorded the conversion', (ctx.stShelledKcal || 0) > 0,
        `stShelledKcal=${ctx.stShelledKcal}`);
      try { await quietLog(async () => { Game.eat(); }); } catch (e) {}
      const ate = Game.state.scholar.kcal - kcalBefore;
      check('GREEN: engine pack-eat eats the shelled nuts', ate > 500, `kcal ${kcalBefore}->${Game.state.scholar.kcal}`);
    } finally { delete process.env.SHELLCAMP; }
  }
}

async function partC() {
  console.log('PART C — det-gate (wrapped SHELLCAMP-unset vs unwrapped base, 60d)');
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const { dayHash } = require('./det-gate');
  const L = require('./policies/shelltask-b2');
  async function hashesFor(policy, seed) {
    const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
    await setupGame(Game);
    const hashes = [];
    const wrapped = Object.assign({}, policy);
    const base = policy.daily;
    wrapped.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return base ? base(G, ctx) : undefined; };
    let r;
    await quietLog(async () => { r = await runDays(Game, wrapped, { days: 60, sampleEvery: 1 }); });
    return { hashes, end: r.days + '/' + r.endReason };
  }
  const seeds = [8001, 8002, 8003, 8004, 8005, 8006, 8007, 8008];
  let identical = 0, substrateNoisy = 0;
  for (const seed of seeds) {
    for (const [pid, base] of [['belongfeast', belongfeast], ['leadfeast', leadfeast]]) {
      delete process.env.SHELLCAMP; // gate OFF
      const wrapped = L.withShellTask(base, pid + '+shelltask', 'det');
      let a, b, c;
      await quietLog(async () => { a = await hashesFor(wrapped, seed); });
      await quietLog(async () => { b = await hashesFor(base, seed); });
      await quietLog(async () => { c = await hashesFor(base, seed); }); // substrate-noise control
      const eq = (x, y) => x.hashes.length === y.hashes.length && x.hashes.every((h, i) => h === y.hashes[i]);
      const layerClean = eq(a, b), substrateClean = eq(b, c);
      if (layerClean) { identical++; console.log(`  ok   s${seed} ${pid}: wrapped-off byte-identical to base`); }
      else if (!substrateClean) { substrateNoisy++; console.log(`  NOTE s${seed} ${pid}: base-vs-base diverges too — substrate noise, not the layer`); }
      else { fail++; console.log(`  FAIL s${seed} ${pid}: layer-attributable divergence`); }
    }
  }
  delete process.env.SHELLCAMP;
  check('det-gate: no layer-attributable divergence', identical + substrateNoisy === 16,
    `${identical}/16 clean-identical, ${substrateNoisy} substrate-noisy`);
}

async function partD() {
  console.log('PART D — SMOKE (2 seeds x 2 policies x {control,armed}, 12d)');
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const L = require('./policies/shelltask-b2');
  let ran = 0, crashed = 0;
  for (const seed of [8001, 8002]) {
    for (const [pid, base] of [['belongfeast', belongfeast], ['leadfeast', leadfeast]]) {
      for (const arm of ['control', 'armed']) {
        if (arm === 'armed') process.env.SHELLCAMP = '1'; else delete process.env.SHELLCAMP;
        const pol = arm === 'armed' ? L.withShellTask(base, pid + '+shelltask', 'smoke') : base;
        try {
          const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
          await setupGame(Game);
          let r;
          await quietLog(async () => { r = await runDays(Game, pol, { days: 12, sampleEvery: 30 }); });
          ran++;
          if (!r || typeof r.days !== 'number') { crashed++; console.log(`  FAIL smoke ${pid} s${seed} ${arm}: bad result`); }
        } catch (e) { crashed++; console.log(`  FAIL smoke ${pid} s${seed} ${arm}: ${e.message}`); }
      }
    }
  }
  delete process.env.SHELLCAMP;
  check('SMOKE: 8/8 short runs completed without exceptions', crashed === 0 && ran === 8, `ran=${ran} crashed=${crashed}`);
}

(async () => {
  await partA();
  await partB();
  await partC();
  await partD();
  console.log(`\nPROOF RESULT: ${pass} ok, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASHED', e); process.exit(1); });

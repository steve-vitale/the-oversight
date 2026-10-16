#!/usr/bin/env node
// scripts/test-monstermeat-20261015.js — proof test for the pack→mouth
// last-mile layer (scripts/policies/monstermeat.js, ARM sim-monstermeat-b).
//
// PART A (fixtures, seed 42): the two beats, each with a real RED phase
//   (gate OFF → the beat is a pure no-op) and GREEN phase (MONSTERMEAT=1 →
//   the honest effect), plus the guard beats:
//     A1 eat-first: hungry scholar eats revealed meat first (kcal rises)
//     A2 pack→pantry donation: hall access → meat moves to pantry; no hall
//        access → untouched (no refusal spam)
//     A3 knowledge law: edible:false meat untouched by every beat
//     A4 trembles: meat_human untouched by every beat
// (A former A2 — knowledge-gated in-pack cooking — was removed with the beat:
//  it never fired in 24 pilot runs and its fire check diverged trajectories.
//  See monstermeat.js header.)
// PART B (det-gate): gate-OFF wrapped vs pristine leadfeast/belongfeast —
//   30d on seeds 121, 232 must be BYTE-IDENTICAL (the layer is inert when
//   the gate is unset).
// PART C (SMOKE=1 honesty): the layer-live marker is honest —
//   mm.layerOn() === (MONSTERMEAT==='1').
//
// Usage: node scripts/test-monstermeat-20261015.js
//        SMOKE=1 node scripts/test-monstermeat-20261015.js   (PART C only)
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const mm = require('./policies/monstermeat');

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; }
  else { failed++; process.stderr.write('  FAIL ' + name + (extra ? ' — ' + extra : '') + '\n'); }
}
function dayOf(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function dayHash(Game) {
  try {
    const s = (Game.state || {}).scholar || {}, v = (Game.state || {}).village || {};
    const pk = ((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0));
    return [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
      (v.roster || []).length, Math.round(pk / 100),
      ((Game.state.corpses || []).length)].join('|');
  } catch (e) { return 'ERR'; }
}
function meatItem(day, over) {
  return Object.assign({
    plantId: 'meat_hushwolf', foodKind: 'meat', name: 'Hushwolf (cleaned)',
    foodState: 'cleaned', edible: true, kcalEach: 100, units: 2,
    spoilDay: day + 2,
  }, over || {});
}
function packOf(Game) { return (Game.state.scholar || {}).inventory || []; }
function pantryOf(Game) { return ((Game.state.village || {}).pantry) || []; }

async function freshGame() {
  const { Game } = await loadGame({ seed: 42, mode: 'monstermeat-test', fullTelemetry: false });
  await setupGame(Game);
  Game.state.scholar.inventory = [];
  return Game;
}

async function partA() {
  console.log('PART A — beat fixtures (RED→GREEN)');
  // ---- A1: eat-first ----
  {
    const Game = await freshGame();
    const day = dayOf(Game);
    Game.state.scholar.inventory.push(meatItem(day));
    Game.state.scholar.kcal = 100; // hungry
    const ctx = {};
    delete process.env.MONSTERMEAT;
    const k0 = Game.state.scholar.kcal;
    mm.eatRevealedFirst(Game, ctx);
    check('A1 RED: gate-off eat-first is a no-op', Game.state.scholar.kcal === k0 && packOf(Game)[0].units === 2,
      `kcal=${Game.state.scholar.kcal} units=${packOf(Game)[0].units}`);
    process.env.MONSTERMEAT = '1';
    mm.eatRevealedFirst(Game, ctx);
    check('A1 GREEN: hungry scholar eats revealed meat first',
      Game.state.scholar.kcal > k0 && (ctx.mmAte || 0) > 0,
      `kcal ${k0}→${Game.state.scholar.kcal} mmAte=${ctx.mmAte || 0}`);
    delete process.env.MONSTERMEAT;
  }
  // ---- A2: donation ----
  {
    const Game = await freshGame();
    const day = dayOf(Game);
    Game.state.scholar.inventory.push(meatItem(day));
    Game.havenStoresAccess = () => 'none'; // away from the hall
    const ctx = {};
    const pan0 = pantryOf(Game).length;
    delete process.env.MONSTERMEAT;
    mm.donateRevealedMeat(Game, ctx);
    check('A2 RED: gate-off donate is a no-op', packOf(Game).length === 1 && pantryOf(Game).length === pan0,
      `pack=${packOf(Game).length} pantry ${pan0}→${pantryOf(Game).length}`);
    process.env.MONSTERMEAT = '1';
    mm.donateRevealedMeat(Game, ctx);
    check('A2 GREEN no-hall: away from hall → untouched, no refusal spam',
      packOf(Game).length === 1 && !(ctx.mmDonated > 0), `pack=${packOf(Game).length}`);
    Game.havenStoresAccess = () => 'inside';
    mm.donateRevealedMeat(Game, ctx);
    const inPantry = pantryOf(Game).some(i => i.plantId === 'meat_hushwolf');
    check('A2 GREEN donate: hall access → revealed meat moves to pantry',
      packOf(Game).length === 0 && inPantry && (ctx.mmDonated || 0) > 0,
      `pack=${packOf(Game).length} inPantry=${inPantry} mmDonated=${ctx.mmDonated || 0}`);
    delete process.env.MONSTERMEAT;
  }
  // ---- A3: knowledge law (edible:false untouched by every beat) ----
  {
    const Game = await freshGame();
    const day = dayOf(Game);
    const unk = meatItem(day, { edible: false, kcalEach: 0, hiddenKcal: 500, name: 'Unknown flesh' });
    Game.state.scholar.inventory.push(unk);
    Game.state.scholar.kcal = 100;
    Game.havenStoresAccess = () => 'inside';
    process.env.MONSTERMEAT = '1';
    const ctx = {};
    mm.eatRevealedFirst(Game, ctx);
    mm.donateRevealedMeat(Game, ctx);
    const it = packOf(Game)[0];
    check('A3 knowledge law: edible:false meat untouched by every beat',
      it && it.edible === false && it.foodState === 'cleaned' && packOf(Game).length === 1,
      `edible=${it && it.edible} state=${it && it.foodState} pack=${packOf(Game).length}`);
    delete process.env.MONSTERMEAT;
  }
  // ---- A4: trembles (meat_human untouched by every beat) ----
  {
    const Game = await freshGame();
    const day = dayOf(Game);
    const hm = meatItem(day, { plantId: 'meat_human', name: 'Human flesh', edible: true });
    Game.state.scholar.inventory.push(hm);
    Game.state.scholar.kcal = 100;
    Game.havenStoresAccess = () => 'inside';
    process.env.MONSTERMEAT = '1';
    const ctx = {};
    mm.eatRevealedFirst(Game, ctx);
    mm.donateRevealedMeat(Game, ctx);
    const it = packOf(Game)[0];
    check('A4 trembles: meat_human untouched by every beat',
      it && it.plantId === 'meat_human' && it.foodState === 'cleaned' && packOf(Game).length === 1,
      `plantId=${it && it.plantId} state=${it && it.foodState}`);
    delete process.env.MONSTERMEAT;
  }
  // ---- A5: composition — policyForRun chains the feast substrate ----
  {
    const p = mm.policyForRun('leadcourt');
    check('A5 policyForRun leadcourt chains', typeof p.upkeep === 'function' && /monstermeat$/.test(p.id || ''), 'id=' + p.id);
    const p2 = mm.policyForRun('belongseek');
    check('A5 policyForRun belongseek chains', typeof p2.upkeep === 'function' && /monstermeat$/.test(p2.id || ''), 'id=' + p2.id);
    let threw = false;
    try { mm.policyForRun('nope'); } catch (e) { threw = true; }
    check('A5 policyForRun rejects unknown policy', threw);
  }
}

async function partB() {
  console.log('PART B — det-gate (gate-OFF wrapped vs pristine, byte-identical)');
  const fs_ = require('./policies/feastscale');
  for (const seed of [121, 232]) {
    for (const pid of ['leadcourt', 'belongseek']) {
      const pristine = pid === 'leadcourt' ? fs_.leadfeast : fs_.belongfeast;
      delete process.env.MONSTERMEAT;
      const wrapped = mm.policyForRun(pid); // gate off → pure delegation
      const hashes = [];
      for (const pol of [pristine, wrapped]) {
        process.env.POLICY = pid;
        const { Game } = await loadGame({ seed, mode: 'monstermeat-det-' + pid, fullTelemetry: false });
        await setupGame(Game);
        const hs = [];
        const od = pol.daily;
        const pw = Object.assign({}, pol);
        pw.daily = (G, ctx) => { hs.push(dayHash(G)); if (od) return od(G, ctx); };
        await quietLog(async () => { await runDays(Game, pw, { days: 30, manifest: undefined, sampleEvery: 10 }); });
        hashes.push(hs.join('\n'));
      }
      check(`B det [${pid} s${seed}] gate-off trajectories byte-identical`,
        hashes[0] === hashes[1] && hashes[0].length > 0,
        `len=${hashes[0].length}`);
    }
  }
  delete process.env.POLICY;
}

async function partC() {
  console.log('PART C — SMOKE layer-live marker honesty');
  delete process.env.MONSTERMEAT;
  const off = mm.layerOn() === false;
  process.env.MONSTERMEAT = '1';
  const on = mm.layerOn() === true;
  delete process.env.MONSTERMEAT;
  check('C layerOn() === (MONSTERMEAT==="1")', off && on, `off=${off} on=${on}`);
}

async function main() {
  if (process.env.SMOKE === '1') { await partC(); }
  else { await partA(); await partB(); await partC(); }
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });

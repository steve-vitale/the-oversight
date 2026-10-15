#!/usr/bin/env node
// scripts/test-tribfloor-20261015.js — proof for the tribute-gate floor
// (sim-tribfloor, 2026-10-15, scale-onramp axis).
//
// The layer (scripts/policies/tribfloor.js, TRIBFLOOR=1, default OFF, zero
// src/js) wraps leadfeast/belongfeast. Tribute payments never leave the
// pantry below the 2-day floor (engine pantry-days convention):
//   * Game.payTribute: a payment that would breach the floor is CAPPED at
//     max(0, pantry - floor); the engine's linkTick posts the shortfall
//     as arrears at the week's end (posted, never forgiven).
//   * Game.answerDemand(linkId, true) on a tribute-kind demand: honoring
//     that would breach the floor is REFUSED via the engine's honest path
//     (trust -15) instead of honored into starvation.
//
// REAL RED phases first (the levered asserts must FAIL with TRIBFLOOR
// unset — the base gates empty the pantry), then GREEN with TRIBFLOOR=1.
// D0 pins gate-off pure delegation (byte-identical).
//
// HARNESS QUIRK (2026-10-15, from sim-tribshield): back-to-back loadGame()
// calls diverge by one trust point — fixtures use the interleaved
// create-run pattern (the sweep's oneRun shape).
//
// Usage: node scripts/test-tribfloor-20261015.js
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

let passed = 0, failed = 0;
function ok(name, fn) {
  return Promise.resolve().then(fn).then(
    () => { passed++; console.log('  PASS ' + name); },
    (e) => { failed++; console.log('  FAIL ' + name + ' — ' + e.message); });
}
function expectFail(name, fn) {
  return Promise.resolve().then(fn).then(
    () => { failed++; console.log('  FAIL(red) ' + name + ' — levered assert did NOT fail on the base policy (RED is insensitive!)'); },
    () => { passed++; console.log('  PASS(red) ' + name + ' — correctly failed on the base policy'); });
}

const TF = () => require('./policies/tribfloor');
const BASE = () => require('./policies/feastscale');

function setGate(on) {
  if (on) process.env.TRIBFLOOR = '1';
  else delete process.env.TRIBFLOOR;
}

function pantryKcal(Game) {
  return ((Game.state.village || {}).pantry || [])
    .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
}
async function freshGame() {
  const { Game } = await loadGame({ seed: 4242, mode: 'tribfloor-fixture' });
  await setupGame(Game);
  Game.state.scholar = Game.state.scholar || {};
  Game.state.scholar.day = 80;
  Game.state.village = Game.state.village || {};
  Game.state.village.burnHistory = [3000, 3000, 3000, 3000, 3000, 3000, 3000]; // floor = 6000
  Game.state.otherVillages = [];
  Game.mshipState().links = [];
  return Game;
}
// A Haven-subordinate link with a LEVERAGED weekly bill (the x1.5-compounded
// old-link spiral from the s77 transcript: 18,000 kcal/week).
function subLink(Game, id, opts) {
  const l = Object.assign({ id, status: 'active', primary: 'emberhold',
    subordinate: 'haven', trust: 55, day: 10, tributeKcalPerWeek: 18000,
    arrears: 0, tributePaidWeek: -1, tributePaidKcal: 0, tributeWeek: -1 }, opts || {});
  Game.mshipState().links.push(l);
  return l;
}
function runDaily(Game, policy) {
  const ctx = { policyId: policy.id, notes: [] };
  policy.daily(Game, ctx);
  return ctx;
}
function snap(Game) {
  return JSON.stringify({
    links: Game.mshipState().links.map(l => ({ id: l.id, trust: l.trust, arrears: l.arrears,
      tributePaidWeek: l.tributePaidWeek, tributePaidKcal: l.tributePaidKcal, pendingDemand: !!l.pendingDemand })),
    pantry: pantryKcal(Game),
  });
}
// The leveraged-partial fixture: pantry 16k passes the 15k gate, the
// 18k leveraged bill would take it all.
async function leveragedFixture() {
  const Game = await freshGame();
  Game.state.village.pantry = [{ kcalEach: 1000, units: 16 }];
  const link = subLink(Game, 'l-sub');
  return { Game, link };
}
// The thin-pantry demand fixture (the s77 numbers): 12,657 kcal demand,
// 3,468 kcal in the pantry.
async function demandFixture() {
  const Game = await freshGame();
  Game.state.village.pantry = [{ kcalEach: 1, units: 3468 }];
  const link = subLink(Game, 'l-d', { tributeKcalPerWeek: 25314 });
  link.pendingDemand = { kind: 'tribute', costKcal: 12657 };
  return { Game, link };
}

async function main() {
  // ---------- D0: gate-off pure delegation (byte-identical) ----------
  console.log('\nD0 (det): gate-off delegation is byte-identical to the base policy');
  await ok('D0 wrapped gate-off == base on the leveraged fixture', async () => {
    setGate(false);
    const a = await leveragedFixture();
    runDaily(a.Game, BASE().belongfeast);
    const b = await leveragedFixture();
    runDaily(b.Game, TF().belongfeast);
    assert.strictEqual(snap(b.Game), snap(a.Game), 'gate-off wrapper diverged from base');
  });

  // ---------- R1/R2 (RED): the base gates empty the pantry ----------
  console.log('\nR1-R2 (RED): base policy must leave the pantry below the floor');
  await expectFail('R1 the leveraged partial is capped at the floor', async () => {
    setGate(false);
    const { Game } = await leveragedFixture();
    runDaily(Game, BASE().belongfeast);
    const floor = TF().floorKcal(Game);
    assert.ok(pantryKcal(Game) >= floor,
      `pantry ${pantryKcal(Game)} below the floor ${Math.round(floor)} on the base policy`);
  });
  await expectFail('R2 the thin-pantry demand is refused at the floor', async () => {
    setGate(false);
    const { Game, link } = await demandFixture();
    runDaily(Game, BASE().belongfeast);
    const floor = TF().floorKcal(Game);
    assert.ok(pantryKcal(Game) >= floor,
      `pantry ${pantryKcal(Game)} below the floor ${Math.round(floor)} on the base policy`);
    assert.ok(link.trust === 40, 'demand was refused (trust 55->40)');
  });

  // ---------- GREEN: TRIBFLOOR=1 ----------
  console.log('\nGREEN: TRIBFLOOR=1');
  await ok('G1 the leveraged partial is capped at/above the floor (unit-aware)', async () => {
    setGate(true);
    const { Game, link } = await leveragedFixture();
    const floor = Math.round(TF().floorKcal(Game));
    const week = Game._week();
    const ctx = runDaily(Game, TF().belongfeast);
    // cap = 16000 - 6000 - 1000 (max unit) = 9000; whole units remove exactly.
    assert.ok(Math.round(pantryKcal(Game)) >= floor, `pantry ${pantryKcal(Game)} below the floor ${floor}`);
    assert.strictEqual(link.tributePaidKcal, 9000, 'capped payment recorded, got ' + link.tributePaidKcal);
    assert.notStrictEqual(link.tributePaidWeek, week, 'the week is not current (partial)');
    assert.strictEqual(ctx.tfCapped, 1, 'ctx counted the cap, got ' + ctx.tfCapped);
  });
  await ok('G2 the shortfall posts as arrears at the week boundary (never forgiven)', async () => {
    setGate(true);
    const { Game, link } = await leveragedFixture();
    runDaily(Game, TF().belongfeast);
    assert.strictEqual(link.arrears, 0, 'no arrears before the boundary');
    Game.state.scholar.day = 88; // cross into week 12: linkTick settles week 11
    Game.linkTick();
    assert.strictEqual(link.arrears, 9000, 'arrears posted 18000-9000, got ' + link.arrears);
    assert.strictEqual(link.trust, 49, 'trust 55-6 on the short week, got ' + link.trust);
  });
  await ok('G3 the thin-pantry demand is refused (pantry untouched, honest -15)', async () => {
    setGate(true);
    const { Game, link } = await demandFixture();
    const ctx = runDaily(Game, TF().belongfeast);
    assert.strictEqual(Math.round(pantryKcal(Game)), 3468, 'pantry untouched, got ' + pantryKcal(Game));
    assert.strictEqual(link.trust, 40, 'trust 55-15 on refusal, got ' + link.trust);
    assert.strictEqual(link.arrears, 0, 'refusal posts no demand arrears');
    assert.strictEqual(link.pendingDemand, null, 'demand cleared');
    assert.strictEqual(ctx.tfDemandRefused, 1, 'ctx counted the refusal, got ' + ctx.tfDemandRefused);
  });
  await ok('G4 a healthy payment passes through the identical engine path', async () => {
    setGate(true);
    const Game = await freshGame();
    Game.state.village.pantry = [{ kcalEach: 1000, units: 40 }]; // 40k, bill 6k, floor 6k
    const link = subLink(Game, 'l-ok', { tributeKcalPerWeek: 6000 });
    const week = Game._week();
    const ctx = runDaily(Game, TF().belongfeast);
    assert.strictEqual(link.tributePaidKcal, 6000, 'full bill paid, got ' + link.tributePaidKcal);
    assert.strictEqual(link.tributePaidWeek, week, 'the week is current');
    assert.strictEqual(link.arrears, 0, 'no arrears');
    assert.strictEqual(link.trust, 58, 'full-payment +3, got ' + link.trust);
    assert.ok(!ctx.tfCapped, 'no cap counted');
  });
  await ok('G5 a self-covering village (burn <= 0) never binds the gate', async () => {
    setGate(true);
    const Game = await freshGame();
    Game.state.village.burnHistory = [-500, -500, -500, -500, -500, -500, -500];
    Game.state.village.pantry = [{ kcalEach: 1000, units: 16 }];
    const link = subLink(Game, 'l-sub');
    const ctx = runDaily(Game, TF().belongfeast);
    assert.strictEqual(link.tributePaidKcal, 16000, 'paid in full despite the breach math, got ' + link.tributePaidKcal);
    assert.ok(!ctx.tfCapped, 'no cap counted on a holding pantry');
  });
  await ok('G6 armed determinism x2 on the leveraged fixture', async () => {
    setGate(true);
    const a = await leveragedFixture();
    runDaily(a.Game, TF().belongfeast);
    const b = await leveragedFixture();
    runDaily(b.Game, TF().belongfeast);
    assert.strictEqual(snap(b.Game), snap(a.Game), 'armed runs diverged');
  });
  await ok('G7 the unit tax: big-unit pantry cannot breach via over-removal', async () => {
    // 4 x 4000 kcal units = 16000. A naive kcal-exact cap (16000-6000 =
    // 10000) would over-remove: ceil(10000/4000) = 3 units = 12000,
    // leaving 4000 < floor 6000. The unit-aware cap (16000-6000-4000 =
    // 6000) removes ceil(6000/4000) = 2 units = 8000, leaving 8000.
    setGate(true);
    const Game = await freshGame();
    Game.state.village.pantry = [{ kcalEach: 4000, units: 4 }];
    const link = subLink(Game, 'l-big');
    const floor = Math.round(TF().floorKcal(Game));
    const ctx = runDaily(Game, TF().belongfeast);
    assert.strictEqual(ctx.tfCapped, 1, 'the cap bound, got ' + ctx.tfCapped);
    assert.ok(Math.round(pantryKcal(Game)) >= floor,
      `pantry ${pantryKcal(Game)} below the floor ${floor} — the unit tax failed`);
    assert.strictEqual(link.tributePaidKcal, 8000, 'whole units removed, got ' + link.tributePaidKcal);
  });

  setGate(false);
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(2); });

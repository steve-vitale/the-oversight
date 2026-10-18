#!/usr/bin/env node
// scripts/test-armorstock-20261017.js — proof for the ARMORSTOCK quartermaster
// protocol (flesh-out loop arm sim-armorstock, 2026-10-17, scale-onramp).
//
// 1. Unit: reservePieces / scholarWornP / armorCorpsesAtNode / withArmorstock
//    shape on fixture games.
// 2. RED->GREEN: gate OFF (ARMORSTOCK unset) the legs are inert (no ctx
//    writes, no verb calls); gate ON (ARMORSTOCK=1) the legs engage —
//    craft leg attempts hide_armor when L1+materials+need hold; recovery leg
//    calls lootCorpse on a same-node armor corpse; reserve leg counts the
//    stockpile; succession leg fires on bearer change.
// 3. DET-GATE: withArmorstock(base) with ARMORSTOCK unset produces
//    byte-identical day-hash trajectories to the pristine base policy
//    (4 seeds x {leadfeast, belongfeast}, 60d). The gate-off path is pure
//    delegation — any divergence is a loud failure.
//
// Substrate: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
// WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 (asserted).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 \
//     SEATDRIVE=0 node scripts/test-armorstock-20261017.js
'use strict';
// KILL PROTOCOL (2026-10-17): the ARMORSTOCK layer was killed at the §14
// PRIMARY (armed-control w4-unlocks = 0, GO needed >= +3). The policy file
// was deleted zero-trace; this proof INFO-SKIPs honestly. It was 22/22
// GREEN pre-kill (2026-10-17, substrate as asserted below).
const fs = require('fs');
const path = require('path');
if (!fs.existsSync(path.join(__dirname, 'policies', 'armorstock.js'))) {
  console.log('INFO-SKIP: armorstock policy killed at §14 PRIMARY — nothing to prove.');
  process.exit(0);
}
const AS = require('./policies/armorstock');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

let passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (cond) { passed++; console.log(`  ok: ${name}`); }
  else { failed++; console.log(`  FAIL: ${name}${detail ? ' — ' + detail : ''}`); }
}

function assertSubstrate() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
    if (process.env[k] !== '1') throw new Error(`SUBSTRATE STOP: ${k}=1 is required.`);
  }
  if (process.env.SEATDRIVE !== '0') throw new Error('SUBSTRATE STOP: SEATDRIVE must be 0.');
}

// ---- 1. unit: reads on a real loaded game ------------------------------
async function fixtures() {
  delete process.env.ARMORSTOCK;
  const { Game } = await loadGame({ seed: 4101117, mode: 'armorstock-fixture', fullTelemetry: false });
  await quietLog(async () => { await setupGame(Game); });
  ok('armorstockOn() false when unset', AS.armorstockOn() === false);
  process.env.ARMORSTOCK = '1';
  ok('armorstockOn() true when =1', AS.armorstockOn() === true);
  delete process.env.ARMORSTOCK;
  ok('armorstockOn() false after delete', AS.armorstockOn() === false);

  // reservePieces on the live scholar inventory (read-only, never throws)
  const r = AS.reservePieces(Game);
  ok('reservePieces returns array', Array.isArray(r));
  ok('reservePieces entries have P>=15', r.every(x => x.P >= 15 && typeof x.iid === 'string'));
  const wp = AS.scholarWornP(Game);
  ok('scholarWornP returns number', typeof wp === 'number' && wp >= 0);
  const ac = AS.armorCorpsesAtNode(Game);
  ok('armorCorpsesAtNode returns array', Array.isArray(ac));

  // withArmorstock shape: id/desc set, setup/daily present
  const w = AS.withArmorstock(leadfeast, 'x', 'y');
  ok('withArmorstock sets id', w.id === 'x');
  ok('withArmorstock keeps base daily', typeof w.daily === 'function' && typeof w.setup === 'function');
  ok('exports armorstockLead/Belong', !!AS.armorstockLead && !!AS.armorstockBelong);
}

// ---- 2. RED -> GREEN on the legs (fake-Game harness) -------------------
function fakeGame() {
  const said = [];
  return {
    said,
    state: { scholar: { day: 10, inventory: [], equipped: {} }, codex: { recipes: {} }, village: { roster: [] } },
    data: { items: [
      { id: 'bloodplate', armor: { protection: 40 } },
      { id: 'hide_armor', armor: { protection: 20 } },
      { id: 'flannel_shirt', armor: { protection: 2 } },
    ] },
    villagerId: 'v_scholar',
    armorBonus() { return 2; },
    say(m) { said.push(m); },
    lootCorpse() { this._looted = (this._looted || 0) + 1; },
    corpses() { return []; },
    corpseIsPerson() { return true; },
    map: { px: 0, py: 0 },
    craft(id) { this._crafted = this._crafted || []; this._crafted.push(id); return { itemId: id }; },
  };
}

async function redGreen() {
  // RED: gate off — legs inert, no ctx writes, no verb calls.
  delete process.env.ARMORSTOCK;
  {
    const G = fakeGame();
    G.state.scholar.inventory = [{ itemId: 'bloodplate' }, { material: 'hide', units: 3 }, { material: 'vine', units: 2 }];
    G.state.codex.recipes = { hide_armor: { level: 3 } };
    const ctx = {};
    const w = AS.withArmorstock({ daily: () => 'base', setup: () => {} }, 'x', 'y');
    const ret = w.daily(G, ctx);
    ok('RED: gate-off delegates to base daily', ret === 'base');
    ok('RED: gate-off writes no as* ctx keys',
      Object.keys(ctx).every(k => !k.startsWith('as')));
    ok('RED: gate-off calls no verbs', !G._looted && !G._crafted);
  }
  // GREEN: gate on — craft leg engages (L3 + materials + worn P<20 + no trophy in pack... give it no trophy).
  process.env.ARMORSTOCK = '1';
  {
    const G = fakeGame();
    G.state.scholar.inventory = [{ material: 'hide', units: 3 }, { material: 'vine', units: 2 }];
    G.state.codex.recipes = { hide_armor: { level: 3 } };
    const ctx = {};
    const w = AS.withArmorstock({ daily: () => 'base', setup: () => {} }, 'x', 'y');
    w.daily(G, ctx);
    ok('GREEN: craft leg attempts hide_armor when L3+materials+need',
      G._crafted && G._crafted.includes('hide_armor'), JSON.stringify(G._crafted));
    ok('GREEN: craft leg counted', (ctx.asCraftTries | 0) >= 1);
    ok('GREEN: reserve leg counted empty reserve', ctx.asReserve === 0);
  }
  // GREEN: reserve leg counts trophy pieces; craft leg stands down when a trophy is held.
  {
    const G = fakeGame();
    G.state.scholar.inventory = [{ itemId: 'bloodplate' }, { material: 'hide', units: 3 }, { material: 'vine', units: 2 }];
    G.state.codex.recipes = { hide_armor: { level: 3 } };
    const ctx = {};
    const w = AS.withArmorstock({ daily: () => 'base', setup: () => {} }, 'x', 'y');
    w.daily(G, ctx);
    ok('GREEN: reserve counts trophy pieces', ctx.asReserve === 1, `asReserve=${ctx.asReserve}`);
    ok('GREEN: craft stands down with trophy in pack', !G._crafted, JSON.stringify(G._crafted));
  }
  // GREEN: recovery leg loots a same-node armor corpse.
  {
    const G = fakeGame();
    const corpse = { id: 'c1', buried: false, node: { x: 0, y: 0 },
      items: [{ itemId: 'bloodplate', units: 1 }] };
    G.corpses = () => [corpse];
    const ctx = {};
    const w = AS.withArmorstock({ daily: () => 'base', setup: () => {} }, 'x', 'y');
    w.daily(G, ctx);
    ok('GREEN: recovery leg calls lootCorpse on armor corpse', (G._looted | 0) >= 1, `looted=${G._looted}`);
  }
  // GREEN: succession leg fires on bearer change.
  {
    const G = fakeGame();
    const ctx = {};
    const w = AS.withArmorstock({ daily: () => 'base', setup: (gg, cc) => { cc.asBearer = null; } }, 'x', 'y');
    w.setup(G, ctx);
    G.villagerId = 'v_scholar';
    w.daily(G, ctx); // sets asBearer
    G.villagerId = 'v_newscholar';
    w.daily(G, ctx); // bearer change -> succession
    ok('GREEN: succession fires on bearer change', (ctx.asSuccessions | 0) === 1,
      `successions=${ctx.asSuccessions}`);
    ok('GREEN: succession narrates', G.said.some(m => /mantle passes/i.test(m)));
  }
  delete process.env.ARMORSTOCK;
}

// ---- 3. det-gate: gate-off wrapped == pristine -------------------------
const DET_SEEDS = [4101117, 4211219, 4321321, 4431423];
const DET_POLICIES = ['leadfeast', 'belongfeast'];
const DET_DAYS = 60;

function policyFor(id) { return id === 'leadfeast' ? leadfeast : belongfeast; }

async function hashesOnce(seed, policyId, wrapped) {
  delete process.env.ARMORSTOCK; // gate-off for both sides
  const base = policyFor(policyId);
  const pol = wrapped ? AS.withArmorstock(base, 'det', 'det') : base;
  const { Game } = await loadGame({ seed, mode: 'armorstock-det', fullTelemetry: false });
  await quietLog(async () => { await setupGame(Game); });
  const hashes = [];
  const w2 = Object.assign({}, pol);
  const oDaily = pol.daily;
  w2.daily = (G, ctx) => {
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    return oDaily ? oDaily(G, ctx) : undefined;
  };
  let r;
  await quietLog(async () => { r = await runDays(Game, w2, { days: DET_DAYS, sampleEvery: 1 }); });
  return { hashes, days: r.days, endReason: r.endReason };
}

async function detGate() {
  let allSame = true;
  for (const seed of DET_SEEDS) {
    for (const policyId of DET_POLICIES) {
      const a = await hashesOnce(seed, policyId, false);
      const b = await hashesOnce(seed, policyId, true);
      const same = a.hashes.length === b.hashes.length && a.hashes.every((h, i) => h === b.hashes[i]);
      console.log(`  det-gate ${policyId} s${seed}: ${same ? 'BYTE-IDENTICAL' : 'DIVERGED'} (${a.hashes.length} vs ${b.hashes.length} hashes)`);
      if (!same) allSame = false;
    }
  }
  ok('det-gate: gate-off wrapped == pristine (4x2, 60d)', allSame);
}

(async () => {
  assertSubstrate();
  console.log('== armorstock fixtures ==');
  await fixtures();
  console.log('== armorstock RED->GREEN ==');
  await redGreen();
  console.log('== armorstock det-gate ==');
  await detGate();
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('TEST CRASH:', e); process.exit(2); });

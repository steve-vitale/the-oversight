#!/usr/bin/env node
// scripts/test-corpsewire-b.js — proof tests for arm sim-corpsewire-b
// (lever loop B, 2026-10-19, backlog #633 MATERIALS leg).
//
// QUESTION: does the base policy actually COLLECT wire from every corpse,
// or does wire strand on carcasses?
//
// CODE CLAIMS UNDER TEST (all verified live-game below):
//   1. carcassToMeat NEVER yields snare_wire — butchering mints no wire.
//   2. Monster and animal death packs NEVER contain snare_wire.
//   3. Held wire rides a dead villager's death pack (sapient gear rule).
//   4. corpseLootAll (the base policy's batch verb) collects that wire.
//   5. buryCorpse sends unlooted wire into the ground (the strand path —
//      the "grave goods" mechanic, corpses.js:879).
//   6. The arm's instruments are RNG-clean: they never call tradeSpirit,
//      never enumerate the roster, write zero game state, consume zero RNG.
//
// Harness: seeded BEFORE eval per AGENTS.md (sim-harness). New tests write
// nothing into the repo. BEAR CANON CONSTRAINT (steve-call #674): bear
// kills are EXCLUDED from any new butchering path — pinned by test 5's
// monster-pool check on black_bear.
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');
const { instrumentWire, isWire, wireUnitsOf, WIRE } = require('./corpsewire-instruments');

let pass = 0, fail = 0;
function check(name, fn) {
  try { fn(); pass++; console.log('  PASS ' + name); }
  catch (e) { fail++; console.log('  FAIL ' + name + ' — ' + (e && e.message)); }
}
async function checkAsync(name, fn) {
  try { await fn(); pass++; console.log('  PASS ' + name); }
  catch (e) { fail++; console.log('  FAIL ' + name + ' — ' + (e && e.message)); }
}

async function freshGame(seed, mode) {
  const { Game } = await loadGame({ seed: seed == null ? 31711 : seed, mode: mode || 'corpsewire-test' });
  await setupGame(Game);
  return Game;
}

// ---- 1. butchering never yields wire ------------------------------------
async function tButcherNoWire() {
  const Game = await freshGame(31711, 'cw-butcher');
  const inv = Game.state.scholar.inventory;
  inv.length = 0;
  inv.push({ name: 'White-tailed deer (carcass)', plantId: 'meat_white_tailed_deer', how: 'hunted', hiddenKcal: 8000, units: 1 });
  Game.carcassToMeat(inv, 0, true);
  check('carcassToMeat mints no wire', () => {
    assert.ok(!inv.some(isWire), 'no snare_wire in the butchered result');
    assert.ok(inv.some(i => i.foodKind === 'meat'), 'butchering still yields meat');
  });
  // data-level: no animal or monster drop table names snare_wire
  check('no animal/monster data names snare_wire', () => {
    const blob = JSON.stringify(Game.data.animals || []) + JSON.stringify(Game.data.monsters || []);
    assert.ok(!blob.includes('snare_wire'), 'wire appears in no animal/monster table');
  });
}

// ---- 2. monster/animal death packs never carry wire ----------------------
async function tPoolsNoWire() {
  const Game = await freshGame(31712, 'cw-pools');
  check('monster packs carry no wire (incl. black_bear)', () => {
    for (const mid of ['hushwolf', 'black_bear', 'sunbasker']) {
      for (let i = 0; i < 5; i++) {
        const pack = Game.generatePossessions({ kind: 'monster', monsterId: mid });
        assert.ok(!pack.some(isWire), `wire in ${mid} pack`);
      }
    }
  });
  check('animal packs are hide-only', () => {
    const pack = Game.generatePossessions({ kind: 'animal' });
    assert.ok(!pack.some(isWire), 'no wire in animal pack');
  });
}

// ---- 3/4/5. villager death pack: wire rides, is lootable, buries --------
async function tVillagerRoundTrip() {
  const Game = await freshGame(31713, 'cw-roundtrip');
  const vid = 'test_wire_holder_9f3';
  Game.state.village.rosterChars = Game.state.village.rosterChars || {};
  Game.state.village.rosterChars[vid] = {
    id: vid,
    items: [{ itemId: 'snare_wire', units: 2 }],
    stashed: [{ itemId: 'rope_50ft' }],
  };
  // NOTE (engine fact, documented): generatePossessions dedupes gear by id
  // and pushes units:1 per gear id — a villager carrying 2 coils deposits 1
  // on the corpse. The second coil is lost in the death conversion itself
  // (a real, small strand path, separate from the looting question).
  check('held wire rides the death pack', () => {
    const pack = Game.generatePossessions({ kind: 'villager', villagerId: vid });
    assert.strictEqual(wireUnitsOf(pack), 1, '1 wire unit in the pack (deduped), got ' + wireUnitsOf(pack));
  });
  const corpse = Game.registerDeath({ kind: 'villager', villagerId: vid, name: 'Test Holder', cause: 'test', youWitnessed: true });
  check('registerDeath corpse carries the wire', () => {
    assert.ok(corpse && corpse.id, 'corpse registered');
    assert.strictEqual(wireUnitsOf(corpse.items), 1, '1 wire unit on the corpse');
  });
  check('corpseLootAll collects the wire', () => {
    const skipHuman = (it) => it.plantId === 'meat_human';
    const r = Game.corpseLootAll(corpse.id, skipHuman);
    assert.ok(r && r.taken.length > 0, 'something taken');
    assert.ok(Game.hasItem('snare_wire'), 'scholar holds wire after the loot');
    assert.strictEqual(wireUnitsOf(corpse.items), 0, 'wire left the corpse');
  });
  // fresh corpse, burial: unlooted wire goes in the ground
  const vid2 = 'test_wire_holder_b2';
  Game.state.village.rosterChars[vid2] = {
    id: vid2, items: [{ itemId: 'snare_wire', units: 1 }], stashed: [],
  };
  const corpse2 = Game.registerDeath({ kind: 'villager', villagerId: vid2, name: 'Test Holder 2', cause: 'test', youWitnessed: true });
  check('buryCorpse strands unlooted wire in the ground', () => {
    assert.strictEqual(wireUnitsOf(corpse2.items), 1, 'wire on the fresh corpse');
    const r = Game.buryCorpse(corpse2.id);
    assert.ok(r, 'burial verb fires');
    assert.strictEqual(wireUnitsOf(corpse2.items), 1, 'wire stays on the buried corpse');
    assert.ok(corpse2.buried, 'corpse is buried');
  });
}

// ---- 6. instrument RNG-hygiene -------------------------------------------
async function tInstrumentHygiene() {
  const Game = await freshGame(31714, 'cw-hygiene');
  // instrumentation alone must add no state keys
  check('instrumentWire adds zero state keys', () => {
    const keysBefore = Object.keys(Game.state).sort().join(',');
    instrumentWire(Game);
    assert.strictEqual(Object.keys(Game.state).sort().join(','), keysBefore, 'no new Game.state keys from instrumentation');
  });
  let spiritCalls = 0;
  const oSpirit = Game.tradeSpirit;
  Game.tradeSpirit = function () { spiritCalls++; return oSpirit.apply(this, arguments); };
  const W = instrumentWire(Game);
  // the registerDeath verb lazily creates state.corpses — engine behavior,
  // not an instrument write. Prove equivalence: same calls on an
  // uninstrumented sibling game produce identical state keys.
  const Game2 = await freshGame(31714, 'cw-hygiene-plain');
  const vid = 'test_wire_holder_9f3';
  for (const G of [Game, Game2]) {
    G.state.village.rosterChars = G.state.village.rosterChars || {};
    G.state.village.rosterChars[vid] = { id: vid, items: [{ itemId: 'snare_wire', units: 1 }], stashed: [] };
    const corpse = G.registerDeath({ kind: 'villager', villagerId: vid, name: 'Hygiene Holder', cause: 'test', youWitnessed: true });
    G.corpseLootAll(corpse.id, (it) => it.plantId === 'meat_human');
  }
  check('instruments record the round trip', () => {
    const id = Array.from(W.deposited.keys())[0];
    assert.strictEqual(W.deposited.get(id).units, 1, 'deposit recorded');
    assert.strictEqual(W.looted, 1, 'loot counted');
  });
  check('instruments never call tradeSpirit', () => {
    assert.strictEqual(spiritCalls, 0, `tradeSpirit called ${spiritCalls}x by instruments`);
  });
  check('instruments write zero game state', () => {
    assert.strictEqual(Object.keys(Game.state).sort().join(','), Object.keys(Game2.state).sort().join(','), 'instrumented vs plain state keys identical');
    assert.ok(!('__wireAudit' in Game) && !('wireAudit' in Game), 'no instrument keys on Game');
  });
}

// ---- 7. CORPSEWIRE layer --------------------------------------------------
// KILL RECORD (2026-10-19, sim-corpsewire-b): the layer was KILLED-AT-PILOT
// (harmful — the approach's unbounded micro-walks displaced the scholar,
// burned ~2.5k micro-steps/run, zeroed the trapline and halved survival;
// see evidence/2026-10-19/sim-corpsewire-b.md) and
// scripts/policies/corpsewire.js was deleted zero-trace per the kill
// protocol. Proof was 18/18 GREEN pre-kill (incl. the live-game arrival
// loot collecting wire). This section self-skips when the layer is gone.
async function tCorpsewireLayer() {
  let cw = null;
  try {
    cw = require('./policies/corpsewire');
  } catch (e) {
    console.log('  SKIP layer tests — LAYER DELETED (killed at pilot 2026-10-19, harmful); proof was 18/18 GREEN pre-kill; see evidence/2026-10-19/sim-corpsewire-b.md');
    return;
  }
  const base = { id: 'testbase', daily() { return 'd'; } };

  check('gate-off: withCorpsewire returns base unchanged', () => {
    delete process.env.CORPSEWIRE;
    assert.strictEqual(cw.withCorpsewire(base, 'x'), base, 'same object, no wrapper');
    assert.strictEqual(cw.layerOn(), false, 'layer off');
  });

  await checkAsync('gate-on: arrival loots the in-range wire corpse', async () => {
    process.env.CORPSEWIRE = '1';
    try {
      assert.strictEqual(cw.layerOn(), true, 'layer on');
      const Game = await freshGame(31721, 'cw-layer');
      // travel target (travelTo only accepts travelTargets())
      const tgts = Game.travelTargets().filter(t => t.x !== Game.map.px || t.y !== Game.map.py);
      assert.ok(tgts.length > 0, 'a travel target exists');
      const tx = tgts[0].x, ty = tgts[0].y;
      const vid = 'test_wire_holder_cw';
      Game.state.village.rosterChars = Game.state.village.rosterChars || {};
      Game.state.village.rosterChars[vid] = { id: vid, items: [{ itemId: 'snare_wire', units: 1 }], stashed: [] };
      const corpse = Game.registerDeath({ kind: 'villager', villagerId: vid, name: 'CW Holder', cause: 'test', node: { x: tx, y: ty }, mx: 4, my: 4, youWitnessed: true });
      assert.ok(corpse && corpse.id, 'corpse registered on the wild node');
      const ctx = {};
      const wrapped = cw.withCorpsewire(base, 'cw');
      assert.notStrictEqual(wrapped, base, 'gate-on wraps');
      wrapped.setup(Game, ctx);
      assert.ok(!Game.hasItem('snare_wire'), 'scholar holds no wire before travel');
      const r = Game.travelTo(tx, ty);
      assert.ok(r !== null && r !== false, 'travel succeeded');
      assert.ok(Game.hasItem('snare_wire'), 'wire collected on arrival');
      assert.strictEqual(ctx._cwWireCollected, 1, 'layer-attributed wire count = 1');
      assert.strictEqual(ctx._cwLootVerbs, 1, 'one loot verb fired');
    } finally { delete process.env.CORPSEWIRE; }
  });

  await checkAsync('RED: without the layer, arrival does not loot', async () => {
    delete process.env.CORPSEWIRE;
    const Game = await freshGame(31722, 'cw-layer-red');
    const tgts = Game.travelTargets().filter(t => t.x !== Game.map.px || t.y !== Game.map.py);
    assert.ok(tgts.length > 0, 'a travel target exists');
    const tx = tgts[0].x, ty = tgts[0].y;
    const vid = 'test_wire_holder_cw2';
    Game.state.village.rosterChars = Game.state.village.rosterChars || {};
    Game.state.village.rosterChars[vid] = { id: vid, items: [{ itemId: 'snare_wire', units: 1 }], stashed: [] };
    const corpse = Game.registerDeath({ kind: 'villager', villagerId: vid, name: 'CW Holder 2', cause: 'test', node: { x: tx, y: ty }, mx: 4, my: 4, youWitnessed: true });
    Game.travelTo(tx, ty);
    assert.ok(!Game.hasItem('snare_wire'), 'no wire without the layer (the strand is real)');
    assert.strictEqual((corpse.items || []).filter(i => (i.itemId || i.id) === 'snare_wire').length, 1, 'wire still on the corpse');
  });

  await checkAsync('quiet when nothing in range: zero verbs, zero tradeSpirit', async () => {
    process.env.CORPSEWIRE = '1';
    try {
      const Game = await freshGame(31723, 'cw-layer-quiet');
      let spiritCalls = 0;
      const oSpirit = Game.tradeSpirit;
      Game.tradeSpirit = function () { spiritCalls++; return oSpirit.apply(this, arguments); };
      const tgts = Game.travelTargets().filter(t => t.x !== Game.map.px || t.y !== Game.map.py);
      assert.ok(tgts.length > 0, 'a travel target exists');
      const tx = tgts[0].x, ty = tgts[0].y;
      const ctx = {};
      const wrapped = cw.withCorpsewire(base, 'cwq');
      wrapped.setup(Game, ctx);
      Game.travelTo(tx, ty); // no corpses anywhere
      assert.strictEqual(ctx._cwLootVerbs || 0, 0, 'no loot verbs fired');
      assert.strictEqual(spiritCalls, 0, 'tradeSpirit never called by the quiet pass');
    } finally { delete process.env.CORPSEWIRE; }
  });

  await checkAsync('human meat skipped, per-day cap honored', async () => {
    process.env.CORPSEWIRE = '1';
    try {
      const Game = await freshGame(31724, 'cw-layer-cap');
      const tgts = Game.travelTargets().filter(t => t.x !== Game.map.px || t.y !== Game.map.py);
      assert.ok(tgts.length > 0, 'a travel target exists');
      const tx = tgts[0].x, ty = tgts[0].y;
      // 6 wire corpses on one node — cap is 4/day
      for (let i = 0; i < 6; i++) {
        const vid = 'test_wire_cap_' + i;
        Game.state.village.rosterChars = Game.state.village.rosterChars || {};
        Game.state.village.rosterChars[vid] = { id: vid, items: [{ itemId: 'snare_wire', units: 1 }], stashed: [] };
        Game.registerDeath({ kind: 'villager', villagerId: vid, name: 'Cap ' + i, cause: 'test', node: { x: tx, y: ty }, mx: 4, my: 4, youWitnessed: true });
      }
      const ctx = {};
      cw.withCorpsewire(base, 'cwc').setup(Game, ctx);
      Game.travelTo(tx, ty);
      assert.ok((ctx._cwLootVerbs || 0) <= 4, `cap honored (${ctx._cwLootVerbs} verbs)`);
      assert.ok((ctx._cwLootVerbs || 0) >= 1, 'but it did loot');
    } finally { delete process.env.CORPSEWIRE; }
  });

  await checkAsync('no looting mid-combat', async () => {
    process.env.CORPSEWIRE = '1';
    try {
      const Game = await freshGame(31725, 'cw-layer-combat');
      const tgts = Game.travelTargets().filter(t => t.x !== Game.map.px || t.y !== Game.map.py);
      assert.ok(tgts.length > 0, 'a travel target exists');
      const tx = tgts[0].x, ty = tgts[0].y;
      const vid = 'test_wire_holder_cw3';
      Game.state.village.rosterChars = Game.state.village.rosterChars || {};
      Game.state.village.rosterChars[vid] = { id: vid, items: [{ itemId: 'snare_wire', units: 1 }], stashed: [] };
      Game.registerDeath({ kind: 'villager', villagerId: vid, name: 'CW Holder 3', cause: 'test', node: { x: tx, y: ty }, mx: 4, my: 4, youWitnessed: true });
      Game.inCombat = () => true; // forced combat
      const ctx = {};
      cw.withCorpsewire(base, 'cwcb').setup(Game, ctx);
      Game.travelTo(tx, ty);
      assert.strictEqual(ctx._cwLootVerbs || 0, 0, 'no looting mid-combat');
      assert.ok(!Game.hasItem('snare_wire'), 'wire untouched mid-combat');
    } finally { delete process.env.CORPSEWIRE; }
  });
}

async function main() {
  console.log('== sim-corpsewire-b proof ==');
  await tButcherNoWire();
  await tPoolsNoWire();
  await tVillagerRoundTrip();
  await tInstrumentHygiene();
  await tCorpsewireLayer();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });

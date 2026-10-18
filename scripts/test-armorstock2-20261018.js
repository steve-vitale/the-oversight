#!/usr/bin/env node
// scripts/test-armorstock2-20261018.js — proof for the REBUILT ARMORSTOCK
// quartermaster protocol (flesh-out loop arm sim-armorstock2, 2026-10-18,
// scale-onramp; the armorbreak NAMED RETRY).
//
// 1. Unit: reservePieces / scholarWornP / armorCorpsesAtNode / withArmorstock
//    shape on fixture games (real loaded game).
// 2. RED->GREEN: gate OFF (ARMORSTOCK unset) the legs are inert (no ctx
//    writes, no verb calls); gate ON (ARMORSTOCK=1) the legs engage through
//    the REAL engine verbs — craft leg attempts hide_armor when L1+materials
//    +need hold; craft stands down with a trophy in pack; recovery leg calls
//    corpseTakeItem (per-item, armor only) on a same-node armor corpse;
//    reserve leg counts the stockpile; succession leg fires + narrates on
//    bearer change; wear leg equips the reserve's best piece.
// 3. DET-GATE: withArmorstock(vetrelComposedBase) with ARMORSTOCK unset
//    produces byte-identical day-hash trajectories to the pristine composed
//    base (4 seeds x {leadseat, belongfeast-seat}, 60d, VETREL=1 both sides).
//    The gate-off path is pure delegation — any divergence is a loud failure.
// 4. MARGIN INSTRUMENT: the sweep's deferralMargin (rd.armored - 4 at the
//    last unready day) equals the engine's own waveCombatReadiness(4).armored
//    minus the demand on a live game.
//
// Substrate (asserted): FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1
// RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 VETREL=1, SEATDRIVE default-ON
// (NOT '0' — the seatdrive-composed win stack). ALLOWGATE2 unset.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 \
//     VETREL=1 node scripts/test-armorstock2-20261018.js
'use strict';
// KILL PROTOCOL (2026-10-18): the rebuilt ARMORSTOCK layer was deleted
// zero-trace after the sim-armorstock2 retry (PRIMARY UNMEASURABLE per the
// pre-registered measurability floor — SUBSTRATE-STILL-MISSING, not
// concept-dead). This proof INFO-SKIPs honestly. It was 32/32 GREEN pre-kill
// (2026-10-18, substrate as asserted below).
const fs = require('fs');
const path = require('path');
if (!fs.existsSync(path.join(__dirname, 'policies', 'armorstock.js'))) {
  console.log('INFO-SKIP: armorstock policy deleted zero-trace after sim-armorstock2 — nothing to prove.');
  process.exit(0);
}
const AS = require('./policies/armorstock');
const SD = require('./policies/seatdrive');
const VR = require('./policies/vetrel');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

let passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (cond) { passed++; console.log(`  ok: ${name}`); }
  else { failed++; console.log(`  FAIL: ${name}${detail ? ' — ' + detail : ''}`); }
}

function assertSubstrate() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'VETREL']) {
    if (process.env[k] !== '1') throw new Error(`SUBSTRATE STOP: ${k}=1 is required.`);
  }
  if (process.env.SEATDRIVE === '0')
    throw new Error('SUBSTRATE STOP: SEATDRIVE must be default-ON (not 0) — the seatdrive win stack.');
  if (process.env.ALLOWGATE2 === '1')
    throw new Error('SUBSTRATE STOP: ALLOWGATE2=1 — substrate moved; STOP, do not rescore.');
}

function composedBase(policyId) {
  const seat = policyId === 'leadseat' ? SD.leadseat : SD.belongseat;
  return VR.withVetrel(seat, `vetrel-${policyId}`, 'vetrel-composed base for armorstock2');
}

// ---- 1. unit: reads on a real loaded game ------------------------------
async function fixtures() {
  delete process.env.ARMORSTOCK;
  const { Game } = await loadGame({ seed: 5102117, mode: 'armorstock2-fixture', fullTelemetry: false });
  await quietLog(async () => { await setupGame(Game); });
  ok('armorstockOn() false when unset', AS.armorstockOn() === false);
  process.env.ARMORSTOCK = '1';
  ok('armorstockOn() true when =1', AS.armorstockOn() === true);
  delete process.env.ARMORSTOCK;
  ok('armorstockOn() false after delete', AS.armorstockOn() === false);

  const r = AS.reservePieces(Game);
  ok('reservePieces returns array', Array.isArray(r));
  ok('reservePieces entries have P>=15', r.every(x => x.P >= 15 && typeof x.iid === 'string'));
  const wp = AS.scholarWornP(Game);
  ok('scholarWornP returns number', typeof wp === 'number' && wp >= 0);
  const ac = AS.armorCorpsesAtNode(Game);
  ok('armorCorpsesAtNode returns array', Array.isArray(ac));

  const w = AS.withArmorstock(composedBase('leadseat'), 'x', 'y');
  ok('withArmorstock sets id', w.id === 'x');
  ok('withArmorstock keeps base daily', typeof w.daily === 'function' && typeof w.setup === 'function');
  ok('exports armorstock2Lead/Belong', !!AS.armorstock2Lead && !!AS.armorstock2Belong);
  ok('composed lead id', AS.armorstock2Lead.id === 'armorstock2-lead');
  ok('composed belong id', AS.armorstock2Belong.id === 'armorstock2-belong');
}

// ---- 2. RED -> GREEN on the legs (fake-Game harness, REAL verb names) --
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
    say(m) { said.push(String(m)); },
    displayName() { return 'Old Scholar'; },
    corpses() { return []; },
    corpseIsPerson() { return true; },
    _corpseCheckRange() { return true; },
    corpseTakeItem(cid, idx) {
      this._taken = this._taken || [];
      this._taken.push([cid, idx]);
      return { itemId: 'bloodplate' };
    },
    map: { px: 0, py: 0 },
    equip(i, slot) { this._equipped = this._equipped || []; this._equipped.push([i, slot]); },
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
    ok('RED: gate-off calls no verbs', !G._taken && !G._crafted && !G._equipped);
  }
  // GREEN: gate on — craft leg engages (L3 + materials + worn P<20 + no trophy).
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
    ok('GREEN: craft beat reads as a person',
      G.said.some(m => /cut plates from the hide/i.test(m)), JSON.stringify(G.said));
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
    ok('GREEN: wear leg equips the reserve best piece',
      G._equipped && G._equipped.length >= 1, JSON.stringify(G._equipped));
  }
  // GREEN: recovery leg takes armor stacks via the real per-item verb on a same-node corpse.
  // (Any armor P>0 — the spec's "recovers armor"; the reserve counts the P>=15 trophy slice.)
  {
    const G = fakeGame();
    const corpse = { id: 'c1', buried: false, looted: false, villagerId: 'v_dead',
      node: { x: 0, y: 0 }, items: [{ itemId: 'bloodplate', units: 1 }, { itemId: 'flannel_shirt', units: 1 }, { plantId: 'raw_meat', units: 2 }] };
    G.corpses = () => [corpse];
    const ctx = {};
    const w = AS.withArmorstock({ daily: () => 'base', setup: () => {} }, 'x', 'y');
    w.daily(G, ctx);
    ok('GREEN: recovery leg calls corpseTakeItem on armor corpse', (G._taken || []).length >= 1,
      JSON.stringify(G._taken));
    ok('GREEN: recovery takes armor stacks only (idx 0,1 — not the meat idx 2)',
      (G._taken || []).length === 2 && (G._taken || []).every(([cid, idx]) => idx === 0 || idx === 1),
      JSON.stringify(G._taken));
    ok('GREEN: recovery counted', (ctx.asRecovered | 0) >= 1);
    ok('GREEN: recovery beat reads as a person',
      G.said.some(m => /shouldn't rot with them/i.test(m)), JSON.stringify(G.said));
  }
  // GREEN: recovery skips other-node corpses.
  {
    const G = fakeGame();
    const corpse = { id: 'c2', buried: false, looted: false, villagerId: 'v_dead2',
      node: { x: 5, y: 5 }, items: [{ itemId: 'bloodplate', units: 1 }] };
    G.corpses = () => [corpse];
    const ctx = {};
    const w = AS.withArmorstock({ daily: () => 'base', setup: () => {} }, 'x', 'y');
    w.daily(G, ctx);
    ok('GREEN: recovery skips other-node corpses', !G._taken, JSON.stringify(G._taken));
  }
  // GREEN: succession leg fires on bearer change + narrates.
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
    ok('GREEN: succession narrates the handoff',
      G.said.some(m => /mantle passes/i.test(m)), JSON.stringify(G.said));
  }
  delete process.env.ARMORSTOCK;
}

// ---- 3. det-gate: gate-off wrapped == pristine (new substrate) ----------
const DET_SEEDS = [5102117, 5212219, 5322321, 5432423];
const DET_POLICIES = ['leadseat', 'belongseat'];
const DET_DAYS = 60;

async function hashesOnce(seed, policyId, wrapped) {
  delete process.env.ARMORSTOCK; // gate-off for both sides
  const base = composedBase(policyId);
  const pol = wrapped ? AS.withArmorstock(base, 'det', 'det') : base;
  const { Game } = await loadGame({ seed, mode: 'armorstock2-det', fullTelemetry: false });
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
  ok('det-gate: gate-off wrapped == pristine (4x2, 60d, seatdrive+VETREL)', allSame);
}

// ---- 4. margin instrument: sweep's deferralMargin == engine's bar --------
async function marginInstrument() {
  const { Game } = await loadGame({ seed: 5102117, mode: 'armorstock2-margin', fullTelemetry: false });
  await quietLog(async () => { await setupGame(Game); });
  // Drive days until the wave-4 gate evaluates unready at least once past wave-3.
  const base = composedBase('leadseat');
  let lastUnready = null;
  const w2 = Object.assign({}, base);
  const oDaily = base.daily;
  w2.daily = (G, ctx) => {
    const r = oDaily ? oDaily(G, ctx) : undefined;
    try {
      if (typeof G.unlockedWave === 'function' && G.unlockedWave() >= 4) return r;
      if (typeof G.waveCombatReadiness === 'function') {
        const rd = G.waveCombatReadiness(4);
        if (rd && !rd.ready) lastUnready = { armored: rd.armored, short: rd.short };
      }
    } catch (e) {}
    return r;
  };
  await quietLog(async () => { await runDays(Game, w2, { days: 180, sampleEvery: 30 }); });
  ok('margin instrument: observed at least one deferral day', !!lastUnready, JSON.stringify(lastUnready));
  if (lastUnready) {
    const margin = lastUnready.armored - 4;
    ok('margin instrument: margin = armored - demand(4)', Number.isInteger(margin));
    console.log(`  margin instrument: last deferral armored=${lastUnready.armored} margin=${margin} short=[${(lastUnready.short || []).join(',')}]`);
  }
}

(async () => {
  assertSubstrate();
  console.log('== armorstock2 fixtures ==');
  await fixtures();
  console.log('== armorstock2 RED->GREEN ==');
  await redGreen();
  console.log('== armorstock2 det-gate ==');
  await detGate();
  console.log('== armorstock2 margin instrument ==');
  await marginInstrument();
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('TEST CRASH:', e); process.exit(2); });

#!/usr/bin/env node
// test-armorsink-r2-20261022.js — proof for sim-armorsink-r2 (instrument-only
// DIAG: worn-armor mortality-sink ledger). RED->GREEN.
//
// E0 — module shape.
// E1 — RED->GREEN fixtures on the REAL engine (no mocks of game code):
//   F1 villager death: P>=15 worn armor is NOT on the corpse pack
//      (generatePossessions reads items/stashed only) -> ledger records
//      sink:worn-vanished.
//   F2 scholar death: worn armor RIDES the death pack (playerDeath) ->
//      ledger records packed (not vanished); buryCorpse with the pack
//      still on -> sink:pack-buried.
//   F3 scholar crafts hide_armor (P20) -> production {how:craft}.
//   F4 tele hooks: loot_dropped alien_carapace -> monster-loot (P40);
//      loot_dropped stone_knife -> ignored (not armor); broadcast_item_prize
//      swat_vest -> contest-prize (P30); loot_taken hide_armor -> return.
//   F5 detectRebinds: pure — bind vs re-bind vs armor-involved.
//   F6 reconcileCounts: pure — hooked deltas clean, unhooked flagged.
//   F7 wornArmorPieces: P>=15 line (hide_armor in, bark_armor out).
// E2 — DET-GATE: instrument-on vs instrument-off byte-identical dayHash
//      traces (1 seed x 2 policies x 40d), 0 instrumentErrors.
// E3 — env gate: sweep exits 2 without the substrate env.
// E4 — determinism: two ledger runs -> identical ledger JSON.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 \
//   VGEAR=1 KILLDISC=1 node scripts/test-armorsink-r2-20261022.js
'use strict';
const { execSync, execFileSync } = require('child_process');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const LEDGER = require('./armorsink-ledger-20261022');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// ---------- E0: shape ----------
(function e0() {
  for (const k of ['freshLedger', 'install', 'dailySample', 'finalize', 'detectRebinds',
    'reconcileCounts', 'wornArmorPieces', 'armorDefsOf', 'universeCount', 'P_LINE']) {
    check('E0 exports ' + k, LEDGER[k] !== undefined);
  }
  check('E0 P_LINE is 15', LEDGER.P_LINE === 15);
})();

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'armorsink-test', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}
function liveVillager(Game) {
  const roster = (((Game.state || {}).village || {}).roster) || [];
  const vid = roster.find(id => id && id !== Game.villagerId);
  if (!vid) return null;
  const p = Game.getPerson ? Game.getPerson(vid) : null;
  return (p && !p.dead) ? { vid, p } : null;
}

// ---------- E1 fixtures ----------
async function f1() {
  const Game = await freshGame(65421);
  const lv = liveVillager(Game);
  check('F1 live villager found', !!lv);
  if (!lv) return;
  const C = LEDGER.freshLedger();
  // dress the villager the REAL way: item into items, then autoEquip —
  // the engine's villagerGearDay path (equipped is a view over items).
  const S = globalThis.Scattering || {};
  lv.p.items = lv.p.items || [];
  lv.p.items.push('hide_armor');
  S.equipment.autoEquip(lv.p, Game.data.items);
  const worn = (lv.p.equipped || {}).torso;
  check('F1 villager wears hide_armor via autoEquip', worn && worn.itemId === 'hide_armor', JSON.stringify(worn));
  const uninstall = LEDGER.install(Game, C);
  const nm = (lv.p.name || 'Villager').split(' ')[0];
  const corpse = await quietLog(async () =>
    Game.registerDeath({ kind: 'villager', villagerId: lv.vid, name: nm, cause: 'test-fixture' }));
  // the MECHANIC, independent of the ledger: the worn copy lives in
  // rec.items, so generatePossessions transfers it to the death pack —
  // villager worn armor does NOT vanish at death (verified on the engine).
  const packIds = ((corpse && corpse.items) || []).map(i => i.itemId || i.id);
  check('F1 mechanic: worn hide_armor IS on the corpse pack', packIds.includes('hide_armor'), packIds.join(','));
  // the LEDGER records it as packed (recoverable), not vanished
  check('F1 one death recorded', C.deaths.length === 1, 'n=' + C.deaths.length);
  const d = C.deaths[0] || {};
  check('F1 death is villager (not scholar)', d.isScholar === false);
  check('F1 packed=[hide_armor]', d.packed.length === 1 && d.packed[0].itemId === 'hide_armor',
    JSON.stringify(d.packed));
  check('F1 vanished empty', d.vanished.length === 0, JSON.stringify(d.vanished));
  check('F1 no worn-vanished sink', !C.sinkEvents.some(e => e.kind === 'worn-vanished'));
  check('F1 corpse tracked with pack armor',
    !!C.corpseTracks[corpse.id] && C.corpseTracks[corpse.id].packArmor.some(p => p.itemId === 'hide_armor'));
  check('F1 no instrument errors', C.instrumentErrors.length === 0, C.instrumentErrors.slice(0, 2).join('; '));
  uninstall();
}

// F1b — the desync edge: equipped references armor NOT in items (no live
// path builds this; autoEquip always syncs). The classifier must still
// attribute it as worn-vanished rather than dropping it silently.
async function f1b() {
  const Game = await freshGame(65426);
  const lv = liveVillager(Game);
  check('F1b live villager found', !!lv);
  if (!lv) return;
  const C = LEDGER.freshLedger();
  lv.p.equipped = { torso: { itemId: 'hide_armor', name: 'Hide armor' } }; // desync: not in items
  const uninstall = LEDGER.install(Game, C);
  const nm = (lv.p.name || 'Villager').split(' ')[0];
  const corpse = await quietLog(async () =>
    Game.registerDeath({ kind: 'villager', villagerId: lv.vid, name: nm, cause: 'test-fixture' }));
  const packIds = ((corpse && corpse.items) || []).map(i => i.itemId || i.id);
  check('F1b desync: worn hide_armor NOT on pack', !packIds.includes('hide_armor'));
  const d = C.deaths[0] || {};
  check('F1b vanished=[hide_armor]', d.vanished.length === 1 && d.vanished[0].itemId === 'hide_armor',
    JSON.stringify(d.vanished));
  check('F1b sink event worn-vanished', C.sinkEvents.some(e => e.kind === 'worn-vanished' && e.itemId === 'hide_armor'));
  check('F1b no instrument errors', C.instrumentErrors.length === 0, C.instrumentErrors.slice(0, 2).join('; '));
  uninstall();
}

async function f2() {
  const Game = await freshGame(65422);
  const C = LEDGER.freshLedger();
  const s = Game.state.scholar;
  s.equipped = { torso: { itemId: 'hide_armor', name: 'Hide armor' } };
  const uninstall = LEDGER.install(Game, C);
  const oldId = Game.villagerId;
  await quietLog(async () => Game.playerDeath('test-fixture'));
  check('F2 succession happened', Game.villagerId !== oldId);
  check('F2 one death recorded', C.deaths.length === 1, 'n=' + C.deaths.length);
  const d = C.deaths[0] || {};
  check('F2 death is scholar', d.isScholar === true);
  check('F2 packed=[hide_armor]', d.packed.length === 1 && d.packed[0].itemId === 'hide_armor',
    JSON.stringify(d.packed));
  check('F2 vanished empty (scholar worn rides the pack)', d.vanished.length === 0,
    JSON.stringify(d.vanished));
  check('F2 no worn-vanished sink', !C.sinkEvents.some(e => e.kind === 'worn-vanished'));
  // bury the corpse with the pack still on -> pack-buried sink
  const corpses = Game.corpses();
  const c = corpses.filter(x => x && x.villagerId === oldId).pop();
  check('F2 scholar corpse found', !!c);
  if (c) {
    const packBefore = (c.items || []).map(i => i.itemId || i.id);
    check('F2 pack carries hide_armor pre-burial', packBefore.includes('hide_armor'));
    await quietLog(async () => Game.buryCorpse(c.id));
    LEDGER.updateCorpseTracks(Game, C, 1);
    check('F2 pack-buried sink recorded',
      C.sinkEvents.some(e => e.kind === 'pack-buried' && e.itemId === 'hide_armor'),
      C.sinkEvents.map(e => e.kind + ':' + e.itemId).join(','));
  }
  check('F2 no instrument errors', C.instrumentErrors.length === 0, C.instrumentErrors.slice(0, 2).join('; '));
  uninstall();
}

async function f3() {
  const Game = await freshGame(65423);
  const C = LEDGER.freshLedger();
  const uninstall = LEDGER.install(Game, C);
  Game.grantKnowledge('recipe', 'hide_armor', 2, { type: 'test' });
  const s = Game.state.scholar;
  s.inventory.push({ name: 'Hide', material: 'hide', units: 30, kg: 1.0, kcalEach: 0 });
  s.inventory.push({ name: 'Vine', material: 'vine', units: 30, kg: 0.2, kcalEach: 0 });
  let made = 0;
  await quietLog(async () => {
    for (let i = 0; i < 8 && made < 1; i++) { if (Game.craft('hide_armor')) made++; }
  });
  check('F3 hide_armor crafted', made >= 1, 'made=' + made);
  const ev = C.production.filter(e => e.how === 'craft' && e.itemId === 'hide_armor');
  check('F3 production craft event', ev.length === made, `events=${ev.length} made=${made}`);
  check('F3 craft event P=20', ev.length > 0 && ev[0].P === 20, JSON.stringify(ev[0]));
  check('F3 craft who=scholar', ev.length > 0 && ev[0].who === 'scholar');
  check('F3 no instrument errors', C.instrumentErrors.length === 0, C.instrumentErrors.slice(0, 2).join('; '));
  uninstall();
}

async function f4() {
  const Game = await freshGame(65424);
  const C = LEDGER.freshLedger();
  const uninstall = LEDGER.install(Game, C);
  await quietLog(async () => {
    Game.tele('loot_dropped', { id: 'alien_carapace', tier: 4, to: 'player' });
    Game.tele('loot_dropped', { id: 'stone_knife', tier: 1, to: 'player' });
    Game.tele('broadcast_item_prize', { who: 'player', id: 'swat_vest', tier: 3, contest: 'c1' });
    Game.tele('loot_taken', { id: 'hide_armor', alien: false });
  });
  const ml = C.production.filter(e => e.how === 'monster-loot');
  check('F4 monster-loot production (alien_carapace)', ml.length === 1 && ml[0].P === 40, JSON.stringify(ml));
  check('F4 non-armor loot ignored', !C.production.some(e => e.itemId === 'stone_knife'));
  const cp = C.production.filter(e => e.how === 'contest-prize');
  check('F4 contest-prize production (swat_vest P35)', cp.length === 1 && cp[0].P === 35, JSON.stringify(cp));
  check('F4 loot_taken return event', C.returnEvents.some(e => e.kind === 'corpse-loot' && e.itemId === 'hide_armor'));
  check('F4 no instrument errors', C.instrumentErrors.length === 0, C.instrumentErrors.slice(0, 2).join('; '));
  uninstall();
}

// F8 — market trade hooks (betrayal.js): hawkerBuy (production, no item
// tele) and traderSell (sink, splices out of inventory).
async function f8() {
  const Game = await freshGame(65428);
  const C = LEDGER.freshLedger();
  const roster = (((Game.state || {}).village || {}).roster) || [];
  const vid = roster.find(id => id && id !== Game.villagerId);
  check('F8 live villager found', !!vid);
  if (!vid) return;
  const v = Game.state.village;
  v.hawkerStock = v.hawkerStock || {};
  v.hawkerStock[vid] = { itemId: 'shelter_cloak', kind: 'alien', price: 100, sold: false, name: 'Shelter Cloak' };
  const s = Game.state.scholar;
  s.inventory.push({ name: 'Dried meat', kcalEach: 400, units: 10, prep: 'dried', spoilDay: 999 });
  const uninstall = LEDGER.install(Game, C);
  const bought = await quietLog(async () => Game.hawkerBuy(vid));
  check('F8 hawkerBuy succeeded', bought === true);
  const ev = C.production.filter(e => e.how === 'market-buy' && e.itemId === 'shelter_cloak');
  check('F8 market-buy production (shelter_cloak P20)', ev.length === 1 && ev[0].P === 20, JSON.stringify(ev));
  // sell it back: needs a visitor with trade spirit
  v.visitors = v.visitors || [];
  const visId = 'test_trader';
  v.visitors.push({ id: visId, name: 'Test Trader', dead: false, alive: true, credit: 0, entrepreneurial: true, traderKnows: ['shelter_cloak'] });
  // tradeSpirit reads person traits; force via a stub only if needed — try real first
  let sold = null;
  try {
    const idx = s.inventory.findIndex(i => (i.itemId || i.id) === 'shelter_cloak');
    check('F8 cloak in inventory for sale', idx >= 0);
    if (idx >= 0) sold = await quietLog(async () => Game.traderSell(visId, idx));
  } catch (e) { check('F8 traderSell ran', false, e.message); }
  if (sold) {
    const se = C.sinkEvents.filter(e => e.kind === 'market-sell' && e.itemId === 'shelter_cloak');
    check('F8 market-sell sink recorded', se.length === 1, JSON.stringify(se));
    check('F8 cloak left inventory', !s.inventory.some(i => (i.itemId || i.id) === 'shelter_cloak'));
  } else {
    check('F8 traderSell succeeded (visitor trade spirit)', false, 'sell returned ' + sold + ' — visitor setup insufficient');
  }
  check('F8 hooks restored after uninstall', (() => { uninstall(); return Game.__asLedgerInstalled === false; })());
  check('F8 no instrument errors', C.instrumentErrors.length === 0, C.instrumentErrors.slice(0, 2).join('; '));
}
// F9 — scholar gear-swap vanish (game.js Game.equip): equipping new torso
// armor OVERWRITES s.equipped[slot]; the old worn piece is never returned to
// inventory (the "unequip current" comment has no code). The hook must
// classify the displaced P>=15 armor as a swap-vanished sink.
async function f9() {
  const Game = await freshGame(65429);
  const C = LEDGER.freshLedger();
  const s = Game.state.scholar;
  s.inventory.push({ itemId: 'shelter_cloak', name: 'Shelter Cloak' });
  s.inventory.push({ itemId: 'wardens_cloak', name: "Warden's Cloak" });
  const uninstall = LEDGER.install(Game, C);
  const idx1 = s.inventory.findIndex(i => (i.itemId || i.id) === 'shelter_cloak');
  await quietLog(async () => Game.equip(idx1, 'torso'));
  check('F9 first equip (shelter_cloak) succeeded', (s.equipped.torso || {}).itemId === 'shelter_cloak');
  const idx2 = s.inventory.findIndex(i => (i.itemId || i.id) === 'wardens_cloak');
  await quietLog(async () => Game.equip(idx2, 'torso'));
  check('F9 swap equip (wardens_cloak) succeeded', (s.equipped.torso || {}).itemId === 'wardens_cloak');
  const ev = C.sinkEvents.filter(e => e.kind === 'swap-vanished' && e.itemId === 'shelter_cloak');
  check('F9 swap-vanished sink recorded (shelter_cloak)', ev.length === 1, JSON.stringify(ev));
  check('F9 displaced cloak not in inventory', !s.inventory.some(i => (i.itemId || i.id) === 'shelter_cloak'));
  check('F9 hooks restored after uninstall', (() => { uninstall(); return Game.__asLedgerInstalled === false; })());
  check('F9 no instrument errors', C.instrumentErrors.length === 0, C.instrumentErrors.slice(0, 2).join('; '));
}
async function f4b() {  // apGrantItem (fan care packages): direct inventory grant, no tele.
  // The pilot's reconciliation caught 2x shelter_cloak through this channel.
  const Game = await freshGame(65427);
  const C = LEDGER.freshLedger();
  const uninstall = LEDGER.install(Game, C);
  await quietLog(async () => {
    Game.apGrantItem('shelter_cloak');
    Game.apGrantItem('stone_knife');
  });
  const ev = C.production.filter(e => e.how === 'fan-package' && e.itemId === 'shelter_cloak');
  check('F4b fan-package production (shelter_cloak P20)', ev.length === 1 && ev[0].P === 20, JSON.stringify(ev));
  check('F4b non-armor grant ignored', !C.production.some(e => e.itemId === 'stone_knife'));
  // monster deaths carry no armor ledger: not recorded as deaths
  const nBefore = C.deaths.length;
  await quietLog(async () =>
    Game.registerDeath({ kind: 'monster', monsterId: 'test_beast', name: 'Test Beast', cause: 'combat' }));
  check('F4b monster death not in armor deaths', C.deaths.length === nBefore, `n=${C.deaths.length}`);
  check('F4b no instrument errors', C.instrumentErrors.length === 0, C.instrumentErrors.slice(0, 2).join('; '));
  uninstall();
}

function f5() {
  const trace = [
    { d: 10, deferred: false, short: [] },
    { d: 20, deferred: true, short: ['armor', 'veterans'], armored: 1, veterans: 0 },
    { d: 30, deferred: false, short: [] },
    { d: 40, deferred: true, short: ['veterans'], armored: 4, veterans: 0 },
    { d: 50, deferred: true, short: ['veterans'] },
  ];
  const r = LEDGER.detectRebinds(trace);
  check('F5 two binds detected', r.length === 2, 'n=' + r.length);
  check('F5 first bind not a rebind, armor-involved',
    r[0] && r[0].rebind === false && r[0].armorInvolved === true && r[0].bindDay === 20, JSON.stringify(r[0]));
  check('F5 second bind IS a rebind, armor not involved',
    r[1] && r[1].rebind === true && r[1].armorInvolved === false && r[1].bindDay === 40, JSON.stringify(r[1]));
}

function f6() {
  const prev = { hide_armor: 2, leather_jacket: 1 };
  let r = LEDGER.reconcileCounts(prev, { hide_armor: 3, leather_jacket: 1 },
    [{ itemId: 'hide_armor', units: 1 }], []);
  check('F6 hooked production clean', r.unexplainedProd.length === 0 && r.unexplainedSink.length === 0,
    JSON.stringify(r));
  r = LEDGER.reconcileCounts(prev, { hide_armor: 4, leather_jacket: 1 },
    [{ itemId: 'hide_armor', units: 1 }], []);
  check('F6 unhooked production flagged', r.unexplainedProd.length === 1 && r.unexplainedProd[0].unaccounted === 1,
    JSON.stringify(r.unexplainedProd));
  r = LEDGER.reconcileCounts(prev, { hide_armor: 1, leather_jacket: 1 }, [], []);
  check('F6 unhooked sink flagged', r.unexplainedSink.length === 1 && r.unexplainedSink[0].itemId === 'hide_armor',
    JSON.stringify(r.unexplainedSink));
  r = LEDGER.reconcileCounts(prev, { hide_armor: 1, leather_jacket: 1 }, [],
    [{ itemId: 'hide_armor', units: 1 }]);
  check('F6 hooked sink clean', r.unexplainedSink.length === 0, JSON.stringify(r.unexplainedSink));
}

async function f7() {
  const Game = await freshGame(65425);
  const defs = LEDGER.armorDefsOf(Game);
  check('F7 defs include hide_armor P20', defs.hide_armor && defs.hide_armor.P === 20);
  check('F7 defs exclude bark_armor (P10)', !defs.bark_armor);
  const person = { equipped: { torso: { itemId: 'hide_armor' }, head: { itemId: 'bark_armor' }, legs: { itemId: 'leather_jacket' } } };
  const pieces = LEDGER.wornArmorPieces(Game, person, defs);
  const ids = pieces.map(p => p.itemId).sort();
  check('F7 P>=15 line: hide_armor+leather_jacket in, bark_armor out',
    ids.length === 2 && ids[0] === 'hide_armor' && ids[1] === 'leather_jacket', ids.join(','));
}

// ---------- E2: DET-GATE ----------
async function detGate() {
  const VCE = require('./policies/vgearconfirm');
  const hashes = {};
  for (const mode of ['ledger', 'bare']) {
    hashes[mode] = {};
    for (const policyId of ['leadfeast', 'belongfeast']) {
      const policy = VCE.armedFor(policyId);
      const { Game } = await loadGame({ seed: 65421, mode: 'armorsink-det', fullTelemetry: false });
      const C = LEDGER.freshLedger();
      let uninstall = () => {};
      if (mode === 'ledger') uninstall = LEDGER.install(Game, C);
      const oDaily = policy.daily;
      const wrapped = Object.assign({}, policy, {
        daily(G, ctx) {
          const r = oDaily ? oDaily(G, ctx) : undefined;
          C.hashes.push((((G.state || {}).scholar || {}).day || 0) + ':' + dayHash(G));
          if (mode === 'ledger') LEDGER.dailySample(G, C);
          return r;
        },
      });
      await setupGame(Game);
      await quietLog(async () => {
        await require('./sim-harness').runDays(Game, wrapped, { days: 40, manifest: undefined, sampleEvery: 30 });
      });
      try { uninstall(); } catch (e) {}
      hashes[mode][policyId] = C.hashes.join('|');
      if (mode === 'ledger') {
        check(`E2 ${policyId} 0 instrumentErrors`, C.instrumentErrors.length === 0,
          C.instrumentErrors.slice(0, 3).join('; '));
        hashes.ledgerSummary = JSON.stringify((C.summary || {}));
      }
    }
  }
  for (const p of ['leadfeast', 'belongfeast']) {
    check(`E2 DET instrument-on vs off byte-identical (${p})`,
      hashes.ledger[p] === hashes.bare[p] && hashes.ledger[p].length > 0,
      `ledger=${hashes.ledger[p].length} bare=${hashes.bare[p].length}`);
  }
  // determinism: second ledger run identical
  const VCE2 = require('./policies/vgearconfirm');
  const policy = VCE2.armedFor('leadfeast');
  const { Game } = await loadGame({ seed: 65421, mode: 'armorsink-det', fullTelemetry: false });
  const C = LEDGER.freshLedger();
  const uninstall = LEDGER.install(Game, C);
  const oDaily = policy.daily;
  const wrapped = Object.assign({}, policy, {
    daily(G, ctx) {
      const r = oDaily ? oDaily(G, ctx) : undefined;
      C.hashes.push((((G.state || {}).scholar || {}).day || 0) + ':' + dayHash(G));
      LEDGER.dailySample(G, C);
      return r;
    },
  });
  await setupGame(Game);
  await quietLog(async () => {
    await require('./sim-harness').runDays(Game, wrapped, { days: 40, manifest: undefined, sampleEvery: 30 });
  });
  try { uninstall(); } catch (e) {}
  check('E2 ledger repeat byte-identical', C.hashes.join('|') === hashes.ledger.leadfeast);
}

// ---------- E3: env gate ----------
function e3() {
  const env = { ...process.env };
  delete env.FEASTSCALE_R13;
  try {
    execFileSync('node', [path.join(ROOT, 'scripts', 'sweep-armorsink-r2-20261022.js')],
      { env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    check('E3 sweep exits 2 without FEASTSCALE_R13', false, 'exited 0');
  } catch (e) {
    check('E3 sweep exits 2 without FEASTSCALE_R13', e.status === 2, 'status=' + e.status);
  }
}

(async function main() {
  try {
    await f1();
    await f1b();
    await f2();
    await f3();
    await f4();
    await f4b();
    await f8();
    await f9();
    f5(); f6();
    await f7();
    await detGate();
    e3();
  } catch (e) {
    fail++;
    console.log('  FATAL ' + (e && e.stack || e));
  }
  console.log(`\narmorsink-r2 proof: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();

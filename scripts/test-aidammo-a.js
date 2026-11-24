#!/usr/bin/env node
// scripts/test-aidammo-a.js — proof test, arm sim-aidammo-a (finding #2602).
//
// Proves the ammo-provenance LEDGER (prereg §1b): the FIFO provenance
// queues (production sources, stash<->carried transfers preserving
// source, volley spends consuming oldest-first), the daily-diff 'other'
// catch-all, and the live game behavior the driver wraps read
// (home-duty craft, departure pocket stash/craft/stones, the volley
// spend itself). The driver wraps (in aidammo-driver-a.js oneRun) call
// the originals exactly once and draw no RNG; this test proves the
// helpers those wraps use, on a LIVE loaded village.
//
// Fixture (encounter-gear rule, Steve 2026-11-13): the villagers are
// geared wave-4 hunters as the launch leaves them — a bow, a sling, a
// crossbow — not fresh solo scholars.
//
// Usage: node scripts/test-aidammo-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo; prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
const path = require('path');
const fs = require('fs');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { createAmmoLedger, ammoSnapVid, ammoSnapAll, ammoRangedKit,
  provPush, provTake, provMove, provShares, ledgerSeed, ledgerDaily,
  summarizeProv, AMMO_IDS } = require('./aidammo-driver-a');
const REPO = path.join(__dirname, '..');

let passed = 0, failed = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function personOf(Game, vid) {
  try { if (Game.getPerson) { const p = Game.getPerson(vid); if (p) return p; } } catch (e) {}
  return ((Game.data.villagers || []).find(x => x.id === vid) ||
    (Game.data.background_survivors || []).find(x => x.id === vid) || {});
}
function ammoCountOf(items, ammoId) {
  let n = 0;
  for (const e of (items || [])) {
    const eid = (typeof e === 'string') ? e : (e && (e.itemId || e.id || e.material));
    if (eid === ammoId) n += (typeof e === 'string') ? 1 : (e.units || 1);
  }
  return n;
}
function stashMats(Game) {
  try { const st = Game.stashState ? Game.stashState() : null; return (st && st.materials) || {}; }
  catch (e) { return ((Game.state.village.stash || {}).materials || {}); }
}
function setMats(Game, mats) {
  try { const st = Game.stashState(); st.materials = Object.assign({}, mats); } catch (e) {}
  try { Game.state.village.stash.materials = Object.assign({}, mats); } catch (e2) {}
}
function resetVillager(Game, p) {
  p.items = []; p.equipped = {}; p.stashed = [];
  try { Game.state.village.ammoCraft = Game.state.village.ammoCraft || {}; delete Game.state.village.ammoCraft[p.id]; } catch (e) {}
  try { Game.state.village.arrowCraftCd = Game.state.village.arrowCraftCd || {}; delete Game.state.village.arrowCraftCd[p.id]; } catch (e) {}
}

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'aidammo-unit' });
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  const p = personOf(Game, vid);
  const vid2 = roster[1] || roster[0];
  const p2 = personOf(Game, vid2);
  const vid3 = roster[2] || roster[0];
  const p3 = personOf(Game, vid3);
  console.log('fighter=' + vid + ' second=' + vid2 + ' third=' + vid3 + ' roster=' + roster.length);
  check('ledger helpers load', typeof createAmmoLedger === 'function' && typeof ledgerSeed === 'function' && typeof ledgerDaily === 'function');
  check('ammo ids are arrow/bolt/stone/fusion_cell', JSON.stringify(AMMO_IDS.slice().sort()) === JSON.stringify(['arrow', 'bolt', 'fusion_cell', 'stone']));
  check('villagerPocketAmmo exists', typeof Game.villagerPocketAmmo === 'function');
  check('villagerAmmoCraftDay exists', typeof Game.villagerAmmoCraftDay === 'function');
  check('villagerKillLoot exists', typeof Game.villagerKillLoot === 'function');

  // ---- 1. Pure FIFO: oldest batch spends first, shares aggregate ----
  const L0 = createAmmoLedger();
  provPush(L0, 'v1', 'arrow', 'carried', 'starting-kit', 1, 2);
  provPush(L0, 'v1', 'arrow', 'carried', 'home-duty', 10, 5);
  check('FIFO shares aggregate by source (starting-kit 2, home-duty 5)',
    JSON.stringify(provShares(L0, 'v1', 'arrow', 'carried')) === JSON.stringify([{ source: 'home-duty', units: 5 }, { source: 'starting-kit', units: 2 }]));
  const took = provTake(L0, 'v1', 'arrow', 'carried', 3, 20);
  check('FIFO spend takes oldest first (starting-kit 2 + home-duty 1)',
    JSON.stringify(took) === JSON.stringify([{ source: 'starting-kit', units: 2 }, { source: 'home-duty', units: 1 }]),
    JSON.stringify(took));
  check('FIFO remainder is home-duty 4', JSON.stringify(provShares(L0, 'v1', 'arrow', 'carried')) === JSON.stringify([{ source: 'home-duty', units: 4 }]));
  const over = provTake(L0, 'v1', 'arrow', 'carried', 9, 21);
  check('overspend returns what exists and records the shortfall',
    over.length === 1 && over[0].units === 4 && L0.unattributedSpend.length === 1 && L0.unattributedSpend[0].units === 5,
    JSON.stringify({ over: over, unatt: L0.unattributedSpend }));
  const L1 = createAmmoLedger();
  provPush(L1, 'v1', 'arrow', 'stashed', 'home-duty', 10, 5);
  const moved = provMove(L1, 'v1', 'arrow', 'stashed', 'carried', 3, 12);
  check('stash->carried transfer preserves the production source',
    JSON.stringify(moved) === JSON.stringify([{ source: 'home-duty', units: 3 }]) &&
    JSON.stringify(provShares(L1, 'v1', 'arrow', 'carried')) === JSON.stringify([{ source: 'home-duty', units: 3 }]) &&
    JSON.stringify(provShares(L1, 'v1', 'arrow', 'stashed')) === JSON.stringify([{ source: 'home-duty', units: 2 }]),
    JSON.stringify({ moved: moved, carried: provShares(L1, 'v1', 'arrow', 'carried') }));

  // ---- 2. Live: ledgerSeed records starting-kit; daily 'other' catches an unexplained gain ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }, { itemId: 'arrow', name: 'Arrow', units: 2, kg: 0.1 }];
  p.stashed = [{ itemId: 'arrow', name: 'Arrow', units: 3, kg: 0.1 }];
  const L2 = createAmmoLedger();
  ledgerSeed(L2, Game, 1);
  check('seed attributes carried arrows to starting-kit (2)',
    JSON.stringify(provShares(L2, vid, 'arrow', 'carried')) === JSON.stringify([{ source: 'starting-kit', units: 2 }]),
    JSON.stringify(provShares(L2, vid, 'arrow', 'carried')));
  check('seed attributes stashed arrows to starting-kit (3)',
    JSON.stringify(provShares(L2, vid, 'arrow', 'stashed')) === JSON.stringify([{ source: 'starting-kit', units: 3 }]),
    JSON.stringify(provShares(L2, vid, 'arrow', 'stashed')));
  // Inject an unexplained gain (an unnamed production path) and reconcile.
  p.items.push({ itemId: 'arrow', name: 'Arrow', units: 4, kg: 0.1 });
  const errs = [];
  ledgerDaily(L2, Game, 2, errs);
  check('daily reconcile catches an unexplained gain as other (4 arrows)',
    L2.other.length === 1 && L2.other[0].units === 4 && L2.other[0].ammoId === 'arrow' && L2.other[0].vid === vid,
    JSON.stringify(L2.other));
  check('daily reconcile attributes the gain to other in the queue',
    JSON.stringify(provShares(L2, vid, 'arrow', 'carried')) === JSON.stringify([{ source: 'other', units: 4 }, { source: 'starting-kit', units: 2 }]),
    JSON.stringify(provShares(L2, vid, 'arrow', 'carried')));
  check('daily reconcile reports no errors', errs.length === 0, JSON.stringify(errs));
  // A second reconcile with no change records nothing new.
  const otherBefore = L2.other.length;
  ledgerDaily(L2, Game, 3, errs);
  check('daily reconcile is silent when nothing changed', L2.other.length === otherBefore);

  // ---- 3. Live: home-duty craft attributed to home-duty ----
  resetVillager(Game, p2);
  p2.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }];
  Game.villagerGearUp(vid2, true);
  Game.state.village.ammoCraft = Game.state.village.ammoCraft || {};
  Game.state.village.ammoCraft[vid2] = { arrow: 2 };
  setMats(Game, { wood: 5, vine: 5, branch: 5, stick: 20, stone: 20, fiber: 10 });
  const kit2 = ammoRangedKit(Game, vid2);
  check('home-duty fixture holds a bow with arrow ammo', kit2.rangedId === 'bow' && kit2.ammoId === 'arrow' && kit2.ammoAtEntry === 0, JSON.stringify(kit2));
  const savedRandom = Math.random;
  Math.random = () => 0.1; // learned 85% craft succeeds
  let made = null;
  try { made = Game.villagerAmmoCraftDay(); } finally { Math.random = savedRandom; }
  check('home duty crafts at least one batch', made >= 1, 'made=' + made);
  check('home-duty arrows land in the pack (5)', ammoCountOf(p2.items, 'arrow') === 5, 'arrows=' + ammoCountOf(p2.items, 'arrow'));
  // The driver's accounting for this event: diff + provPush home-duty.
  const L3 = createAmmoLedger();
  ledgerSeed(L3, Game, 1);
  const sh3 = provShares(L3, vid2, 'arrow', 'carried');
  check('seeded ledger sees the home-duty arrows as starting-kit (seed after the fact)',
    sh3.length === 1 && sh3[0].source === 'starting-kit' && sh3[0].units === 5, JSON.stringify(sh3));
  // Cooldown: a second call the same day crafts nothing for this villager.
  Math.random = () => 0.1;
  try { Game.villagerAmmoCraftDay(); } finally { Math.random = savedRandom; }
  check('home-duty cooldown blocks a same-day second batch', ammoCountOf(p2.items, 'arrow') === 5, 'arrows=' + ammoCountOf(p2.items, 'arrow'));

  // ---- 4. Live: departure stash transfer preserves source ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }];
  p.stashed = [{ itemId: 'arrow', name: 'Arrow', units: 3, kg: 0.1 }];
  Game.villagerGearUp(vid, true);
  setMats(Game, { wood: 0, vine: 0, branch: 0, stick: 0, stone: 0, fiber: 0 });
  const L4 = createAmmoLedger();
  ledgerSeed(L4, Game, 1);
  const outStash = Game.villagerPocketAmmo(vid);
  check('stashed arrows pocket without crafting', outStash.pocketed === 3 && outStash.crafted === 0, JSON.stringify(outStash));
  check('stash arrows land in the pack', ammoCountOf(p.items, 'arrow') === 3 && (p.stashed || []).length === 0);
  provMove(L4, vid, 'arrow', 'stashed', 'carried', 3, 5);
  check('transfer keeps the starting-kit source after pocketing',
    JSON.stringify(provShares(L4, vid, 'arrow', 'carried')) === JSON.stringify([{ source: 'starting-kit', units: 3 }]),
    JSON.stringify(provShares(L4, vid, 'arrow', 'carried')));

  // ---- 5. Live: departure craft attributed to departure-craft ----
  resetVillager(Game, p3);
  p3.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }];
  Game.villagerGearUp(vid3, true);
  Game.state.village.ammoCraft[vid3] = { arrow: 2 };
  setMats(Game, { wood: 5, vine: 5, branch: 5, stick: 10, stone: 10, fiber: 5 });
  Math.random = () => 0.1;
  let outCraft = null;
  try { outCraft = Game.villagerPocketAmmo(vid3); } finally { Math.random = savedRandom; }
  check('learned departure craft succeeds', outCraft.crafted === 1 && outCraft.craftedOk === true && outCraft.ammoId === 'arrow', JSON.stringify(outCraft));
  check('crafted arrows land in the pack (5)', ammoCountOf(p3.items, 'arrow') === 5, 'arrows=' + ammoCountOf(p3.items, 'arrow'));
  const L5 = createAmmoLedger();
  provPush(L5, vid3, 'arrow', 'carried', 'departure-craft', 5, 5);
  check('departure-craft batch sits in the ledger as its own source',
    JSON.stringify(provShares(L5, vid3, 'arrow', 'carried')) === JSON.stringify([{ source: 'departure-craft', units: 5 }]));

  // ---- 6. Live: departure pile stones attributed to departure-pile-stones ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'sling', name: 'Sling', units: 1, kg: 0.3 }];
  Game.villagerGearUp(vid, true);
  setMats(Game, { wood: 0, vine: 0, branch: 0, stick: 0, stone: 4, fiber: 0 });
  const outStone = Game.villagerPocketAmmo(vid);
  check('sling pockets pile stones', outStone.ammoId === 'stone' && outStone.pocketed === 4 && outStone.crafted === 0, JSON.stringify(outStone));
  check('stones land in the pack', ammoCountOf(p.items, 'stone') === 4);

  // ---- 7. Live: the volley spends FIFO (oldest batch first) ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }];
  Game.villagerGearUp(vid, true);
  Game.state.village.ammoCraft[vid] = { arrow: 2 };
  setMats(Game, { wood: 5, vine: 5, branch: 5, stick: 10, stone: 10, fiber: 5 });
  Math.random = () => 0.1;
  try { Game.villagerPocketAmmo(vid); } finally { Math.random = savedRandom; }
  const arrowsBefore = ammoCountOf(p.items, 'arrow');
  // Ledger view: 2 starting-kit + 3 home-duty (staged to prove FIFO order).
  const L7 = createAmmoLedger();
  provPush(L7, vid, 'arrow', 'carried', 'starting-kit', 1, 2);
  provPush(L7, vid, 'arrow', 'carried', 'home-duty', 2, 3);
  const mdef = (Game.data.monsters || []).find(m => m.id === 'eulogy') || (Game.data.monsters || [])[0];
  let rec = null;
  try { rec = Game.fieldFight(vid, mdef, null, { allies: 1 }); } catch (e) { console.log('fieldFight error: ' + e.message); }
  check('pocketed bow volleys in a wave-4 fight', arrowsBefore > 0 && rec && rec.volley && rec.volley.shots > 0, 'arrows=' + arrowsBefore + ' ' + JSON.stringify(rec && rec.volley));
  const spent = arrowsBefore - ammoCountOf(p.items, 'arrow');
  check('volley spends exactly its shots', rec && rec.volley && spent === rec.volley.shots, 'spent=' + spent + ' shots=' + (rec && rec.volley && rec.volley.shots));
  const spentShares = provTake(L7, vid, 'arrow', 'carried', spent, 6);
  const spentStarting = (spentShares.find(s => s.source === 'starting-kit') || { units: 0 }).units;
  check('FIFO spend consumes starting-kit first', spentStarting === Math.min(2, spent), JSON.stringify(spentShares));
  const remaining = provShares(L7, vid, 'arrow', 'carried');
  const remainingTotal = remaining.reduce((a, b) => a + b.units, 0);
  check('ledger remainder matches the pack after the volley', remainingTotal === ammoCountOf(p.items, 'arrow'), JSON.stringify({ remaining: remaining, pack: ammoCountOf(p.items, 'arrow') }));

  // ---- 8. Frozen ground: kill loot can only ever drop fusion cells ----
  const reward = Game.data.rewardEconomy || {};
  const killItems = reward.killItems || {};
  const ammoInKill = [];
  for (const tier of Object.keys(killItems)) {
    for (const id of (killItems[tier] || [])) if (AMMO_IDS.indexOf(id) !== -1) ammoInKill.push(id);
  }
  check('no arrow/bolt/stone in any killItems tier (loot can only be cells)', ammoInKill.length === 0, JSON.stringify(ammoInKill));
  const cellDef = (Game.data.items || []).find(i => i.id === 'fusion_cell');
  check('fusion_cell is alien-origin lootTier 4 (the only lootable ammo)', !!cellDef && cellDef.origin === 'alien' && cellDef.lootTier === 4, JSON.stringify(cellDef && { origin: cellDef.origin, lootTier: cellDef.lootTier }));

  // ---- 9. Ranged-kit reads: spear carries no ammo id ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'hunting_spear', name: 'Hunting spear', units: 1, kg: 1.0 }];
  Game.villagerGearUp(vid, true);
  const spearKit = ammoRangedKit(Game, vid);
  check('spear kit has no ammo id (never an empty quiver)', spearKit.ammoId === null && spearKit.ammoAtEntry === 0, JSON.stringify(spearKit));
  const snapAll = ammoSnapAll(Game);
  check('snapshot covers the roster + scholar', Object.keys(snapAll).length >= roster.length, 'vids=' + Object.keys(snapAll).length + ' roster=' + roster.length);
  const prov = summarizeProv(L7);
  check('summarizeProv exposes the queues', !!prov[vid] && !!prov[vid].arrow, JSON.stringify(prov[vid]));

  console.log('AIDAMMO_FAILS ' + failed + (fails.length ? ' ' + fails.join(',') : ''));
  console.log('AIDAMMO_PASSED ' + passed + '/' + (passed + failed));
  if (failed) process.exitCode = 1;
}

main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });

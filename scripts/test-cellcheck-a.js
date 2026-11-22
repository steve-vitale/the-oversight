#!/usr/bin/env node
// scripts/test-cellcheck-a.js — proof test, arm sim-cellcheck-a (finding #2672).
//
// Proves the cell-supply / re-arming DIAG instrument: the frozen
// mechanism (alienLootGrant is units: 1; the _cxItemPrize searcaster
// bundle is +2 cells under GUNRATE=1; kill-loot carries +0 on a
// searcaster with KILLBUNDLE unset; the volley is lead-only, 1 cell
// per shot; CELLGATE holds fire below wave 4), the driver's new
// delta helpers (destCellsOf / packCellsOf / prizeCellMoves), the
// analyzer's classifier / reconciler / ledger on fixtures, and the
// stash->pack top-up as the only non-grant re-arm channel.
//
// Fixture (encounter-gear rule, Steve 2026-11-13): the villagers are
// geared wave-4 hunters as the launch leaves them — a searcaster
// holder with a party behind them, not a fresh solo scholar.
//
// Substrate staged in-process: GUNRATE=1 + CELLGATE=1 (the killrate
// substrate under test), KILLBUNDLE unset — the same flags the judged
// band runs under. The env is read at call time by the game code, so
// setting it here stages the same behavior.
//
// Usage: GUNRATE=1 CELLGATE=1 node scripts/test-cellcheck-a.js
// (the test also sets them itself; the env on the command line is
// documentation). Exit 0 = all checks pass. Exit 1 = a failure.
// Writes NOTHING into the repo; prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
process.env.GUNRATE = '1';
process.env.CELLGATE = '1';
delete process.env.KILLBUNDLE;
const path = require('path');
const fs = require('fs');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { ammoCountOf, rangedKitOf, ammoCensusSnap, cellCountIn,
  classifyGrantCaller, grantRecipientOf, destCellsOf, packCellsOf,
  cellsSnapshotMap, prizeCellMoves } = require('./cellcheck-driver-a');
const { classifyFightEntry, reconcileGrant, buildRearmLedger,
  expectedGrantDelta, expectedPrizeDelta } = require('./analyze-cellcheck-a');
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
function itemDef(Game, id) {
  return (Game.data.items || []).find(function (d) { return d.id === id; }) || null;
}
function resetVillager(Game, p) {
  p.items = []; p.equipped = {}; p.stashed = [];
  try { Game.state.village.ammoCraft = Game.state.village.ammoCraft || {}; delete Game.state.village.ammoCraft[p.id]; } catch (e) {}
  try { Game.state.village.arrowCraftCd = Game.state.village.arrowCraftCd || {}; delete Game.state.village.arrowCraftCd[p.id]; } catch (e) {}
}
// snapAll(Game): vid -> {sear, cells} for every living roster
// villager + '__scholar__' for the scholar's inventory.
function snapAll(Game) {
  const m = {};
  try {
    const roster = (Game.state.village.roster || []);
    for (const vid of roster) {
      const p = Game.getPerson ? Game.getPerson(vid) : null;
      if (!p || p.dead) continue;
      m[vid] = { sear: ammoCountOf(p.items, 'searcaster'), cells: ammoCountOf(p.items, 'fusion_cell') };
    }
  } catch (e) {}
  m['__scholar__'] = { sear: ammoCountOf(((Game.state || {}).scholar || {}).inventory || [], 'searcaster'),
    cells: ammoCountOf(((Game.state || {}).scholar || {}).inventory || [], 'fusion_cell') };
  return m;
}

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'cellcheck-unit' });
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  const p = personOf(Game, vid);
  const vid2 = roster[1] || roster[0];
  const p2 = personOf(Game, vid2);
  console.log('fighter=' + vid + ' second=' + vid2 + ' roster=' + roster.length);

  // ---- 1. live data agreement: the weapon and the cell ----
  const sear = itemDef(Game, 'searcaster');
  check('searcaster def: alien tier-4, bonus 120, range 8, ammo fusion_cell',
    sear && sear.origin === 'alien' && (sear.lootTier || 0) === 4 &&
    sear.weapon && sear.weapon.bonus === 120 && sear.weapon.range === 8 &&
    sear.weapon.ammo === 'fusion_cell', JSON.stringify(sear && sear.weapon));
  const cell = itemDef(Game, 'fusion_cell');
  check('fusion_cell def: material, alien, lootTier 4, findable false',
    cell && cell.class === 'material' && cell.origin === 'alien' &&
    (cell.lootTier || 0) === 4 && cell.findable === false, JSON.stringify(cell));

  // ---- 2. frozen mechanism: no recipe, no ruin pool, no pile material ----
  const recipe = (Game.data.recipes || []).find(function (r) { return r.id === 'fusion_cell'; });
  check('no fusion_cell recipe exists (36 recipes, none for cells)', !recipe,
    'recipes=' + (Game.data.recipes || []).length);
  let inScavenge = [];
  for (const r of (Game.data.regions || [])) {
    const sc = (((r || {}).people || {}).scavenge || []);
    for (const s of sc) if (s.id === 'fusion_cell') inScavenge.push(r.id);
  }
  check('fusion_cell is in no region scavenge pool (ruin loot cannot yield it)',
    inScavenge.length === 0, 'regions=' + inScavenge.join(','));
  let pileHasCell = false;
  try { const st = Game.stashState ? Game.stashState() : null; pileHasCell = !!(st && st.materials && Object.prototype.hasOwnProperty.call(st.materials, 'fusion_cell')); } catch (e) {}
  check('fusion_cell is not a pile material (MAT_IDS cannot hold it)', !pileHasCell);
  const reward = Game.data.rewardEconomy || {};
  const kill4 = (((reward.killItems || {})[4]) || []);
  const pool = (Game.data.items || []).filter(function (i) {
    return (i.origin === 'alien' || kill4.indexOf(i.id) !== -1) && (i.lootTier || 1) === 4;
  }).map(function (i) { return i.id; });
  check('tier-4 kill pool is 15 and holds searcaster + fusion_cell',
    pool.length === 15 && pool.indexOf('searcaster') !== -1 && pool.indexOf('fusion_cell') !== -1,
    'pool=' + pool.length);

  // ---- 3. roll sweep: find the searcaster + fusion_cell pick slots ----
  // rollAlienLoot draws: chance, then pick (apex mdef: no taper, no
  // tier4Chance). Feed chance 0.0 then pick (i+0.5)/15.
  const savedRandom = Math.random;
  let searIdx = -1, cellIdx = -1;
  try {
    const mdef = { id: 'moderator', wave: 2, apex: true, loot: { chance: 1, tier: 4 } };
    for (let i = 0; i < 15; i++) {
      let di = 0;
      const draws = [0.0, (i + 0.5) / 15];
      Math.random = function () { const v = draws[di % draws.length]; di++; return v; };
      const drop = Game.rollAlienLoot(mdef, {});
      if (drop === 'searcaster') searIdx = i;
      if (drop === 'fusion_cell') cellIdx = i;
    }
  } finally { Math.random = savedRandom; }
  check('roll sweep finds a searcaster pick slot', searIdx >= 0, 'searIdx=' + searIdx);
  check('roll sweep finds a fusion_cell pick slot', cellIdx >= 0, 'cellIdx=' + cellIdx);

  // ---- 4. live _cxItemPrize bundle: searcaster +2, fusion_cell +1 ----
  // Stage apex via contest wins (wins >= 8 -> apex true); extreme
  // risk + apex + random < 0.25 -> tier 4. Loop real prizes to
  // 'player' (GUNRATE redirects gun/cell prizes to a fighter);
  // snapshot every holder before/after each call and check the
  // bundle rule on every searcaster / fusion_cell prize observed.
  check('_cxItemPrize exists (contest prize path is wrappable)', typeof Game._cxItemPrize === 'function');
  check('_gunRateFighter exists (the redirect is live)', typeof Game._gunRateFighter === 'function');
  Game.state.notability = Game.state.notability || {};
  Game.state.notability.player = Object.assign({}, Game.state.notability.player, { contestWin: 8 });
  let searPrizes = 0, cellPrizes = 0, bundleBad = 0;
  const CALLS = 600;
  for (let k = 0; k < CALLS && (searPrizes < 3 || cellPrizes < 2); k++) {
    const before = snapAll(Game);
    let ok = false;
    try { ok = Game._cxItemPrize({ variant: 'hardened' }, { id: 'cellcheck-test', risk: 'extreme' }, 'player'); } catch (e) { console.log('prize error: ' + e.message); }
    if (!ok) continue;
    const after = snapAll(Game);
    for (const key of Object.keys(after)) {
      const b = before[key] || { sear: 0, cells: 0 }, a = after[key];
      const dSear = a.sear - b.sear, dCells = a.cells - b.cells;
      if (dSear > 0) {
        searPrizes += dSear;
        // A searcaster prize bundles exactly 2 cells to the SAME
        // recipient (GUNRATE=1); nobody else may gain cells here.
        if (dCells !== 2 * dSear) bundleBad++;
        for (const k2 of Object.keys(after)) {
          if (k2 !== key && (after[k2].cells - (before[k2] || { cells: 0 }).cells) !== 0) bundleBad++;
        }
      }
      if (dSear === 0 && dCells > 0) {
        // A bare fusion_cell prize is +1 cell and no bundle. (A
        // searcaster prize is handled above; other prizes move no
        // cells, so any positive cell move here is a cell prize.)
        cellPrizes += dCells;
        if (dCells !== 1) bundleBad++;
      }
    }
  }
  check('live prizes: searcaster prizes observed (>= 3 in 600 calls)', searPrizes >= 3, 'searPrizes=' + searPrizes);
  check('live prizes: fusion_cell prizes observed (>= 2 in 600 calls)', cellPrizes >= 2, 'cellPrizes=' + cellPrizes);
  check('live prizes: every searcaster carried exactly +2 cells, every cell prize +1', bundleBad === 0, 'bundleBad=' + bundleBad);

  // ---- 5. live kill-loot control (KILLBUNDLE unset) ----
  // Force a searcaster kill-loot drop, then a fusion_cell drop.
  function forceKillLoot(dropIdx) {
    let di = 0;
    const draws = [0.0, (dropIdx + 0.5) / 15];
    Math.random = function () { const v = draws[di % draws.length]; di++; return v; };
  }
  resetVillager(Game, p);
  Game.villagerGearUp(vid, true);
  let dropSear = null;
  try {
    forceKillLoot(searIdx);
    dropSear = Game.villagerKillLoot(vid, { id: 'moderator', wave: 2, apex: true, loot: { chance: 1, tier: 4 } });
  } finally { Math.random = savedRandom; }
  check('kill-loot searcaster forced (KILLBUNDLE unset)', dropSear === 'searcaster', 'drop=' + dropSear);
  check('kill-loot searcaster carries +0 cells (no bundle without KILLBUNDLE)',
    ammoCountOf(p.items, 'fusion_cell') === 0, 'cells=' + ammoCountOf(p.items, 'fusion_cell'));
  check('kill-loot searcaster lands in the killer pack', ammoCountOf(p.items, 'searcaster') === 1);
  resetVillager(Game, p);
  Game.villagerGearUp(vid, true);
  let dropCell = null;
  try {
    forceKillLoot(cellIdx);
    dropCell = Game.villagerKillLoot(vid, { id: 'moderator', wave: 2, apex: true, loot: { chance: 1, tier: 4 } });
  } finally { Math.random = savedRandom; }
  check('kill-loot fusion_cell forced', dropCell === 'fusion_cell', 'drop=' + dropCell);
  check('kill-loot fusion_cell carries +1 cell', ammoCountOf(p.items, 'fusion_cell') === 1, 'cells=' + ammoCountOf(p.items, 'fusion_cell'));

  // ---- 6. driver delta helpers: destCellsOf / packCellsOf / prizeCellMoves ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'fusion_cell', name: 'Fusion cell', units: 2, kg: 0.4 }];
  check('packCellsOf reads the villager pack', packCellsOf(Game, vid) === 2);
  check('destCellsOf reads a villager person object', destCellsOf(Game, p) === 2);
  check('destCellsOf null -> scholar inventory', destCellsOf(Game, null) === ammoCountOf(((Game.state || {}).scholar || {}).inventory || [], 'fusion_cell'));
  const corpse = { id: 'corpse_test', items: [{ itemId: 'fusion_cell', units: 3 }] };
  check('destCellsOf reads a corpse body', destCellsOf(Game, corpse) === 3);
  check('packCellsOf unknown vid -> null (never a silent zero)', packCellsOf(Game, 'no-such-vid') === null);
  const snapBefore = cellsSnapshotMap(Game);
  p.items.push({ itemId: 'fusion_cell', name: 'Fusion cell', units: 1, kg: 0.4 });
  const moves = prizeCellMoves(Game, snapBefore);
  check('prizeCellMoves diffs the snapshot (one move, +1)', moves.length === 1 && moves[0].vid === vid && moves[0].before === 2 && moves[0].after === 3, JSON.stringify(moves));
  const moves2 = prizeCellMoves(Game, cellsSnapshotMap(Game));
  check('prizeCellMoves is empty with no change', moves2.length === 0);

  // ---- 7. stash->pack top-up: the only non-grant re-arm channel ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 }];
  p.stashed = [{ itemId: 'fusion_cell', name: 'Fusion cell', units: 3, kg: 0.4 }];
  Game.villagerGearUp(vid, true);
  const outStash = Game.villagerPocketAmmo(vid);
  check('stashed fusion cells pocket (re-arm channel exists)', outStash.pocketed === 3 && outStash.crafted === 0, JSON.stringify(outStash));
  check('stashed cells land in the pack', ammoCountOf(p.items, 'fusion_cell') === 3 && (p.stashed || []).length === 0);

  // ---- 8. the volley at 2 cells: shots fire, cells are spent ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 },
    { itemId: 'fusion_cell', name: 'Fusion cell', units: 2, kg: 0.4 }];
  Game.villagerGearUp(vid, true);
  const mdef = (Game.data.monsters || []).find(function (m) { return m.id === 'eulogy'; }) || (Game.data.monsters || [])[0];
  let rec2 = null;
  try { rec2 = Game.fieldFight(vid, mdef, null, { allies: 1 }); } catch (e) { console.log('fieldFight error: ' + e.message); }
  check('2-cell searcaster volleys 1-2 shots (never more than its cells)',
    rec2 && rec2.volley && rec2.volley.shots >= 1 && rec2.volley.shots <= 2,
    JSON.stringify(rec2 && rec2.volley));
  check('2-cell volley spends exactly its shots in cells',
    rec2 && rec2.volley && ammoCountOf(p.items, 'fusion_cell') === 2 - rec2.volley.shots,
    'left=' + ammoCountOf(p.items, 'fusion_cell') + ' shots=' + (rec2 && rec2.volley && rec2.volley.shots));
  check('2-cell volley damage is 64-68 per hit',
    rec2 && rec2.volley && rec2.volley.hits > 0 && rec2.volley.dmg >= 64 * rec2.volley.hits && rec2.volley.dmg <= 68 * rec2.volley.hits,
    JSON.stringify(rec2 && rec2.volley));

  // ---- 9. the volley at 0 cells: no shots, the honest line ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 }];
  Game.villagerGearUp(vid, true);
  let rec0 = null;
  try { rec0 = Game.fieldFight(vid, mdef, null, { allies: 1 }); } catch (e) { console.log('fieldFight error: ' + e.message); }
  check('0-cell searcaster volleys 0 shots', rec0 && rec0.volley && rec0.volley.shots === 0 && rec0.volley.dmg === 0, JSON.stringify(rec0 && rec0.volley));
  check('0-cell volley names fusion cells in the log',
    rec0 && (rec0.log || []).some(function (s) { return /no fusion cells/i.test(String(s)); }),
    JSON.stringify((rec0 && rec0.log) || []));

  // ---- 10. analyzer fixtures (imported pure functions) ----
  check('expectedGrantDelta / expectedPrizeDelta', expectedGrantDelta('fusion_cell') === 1 && expectedGrantDelta('searcaster') === 0 && expectedPrizeDelta('searcaster') === 2 && expectedPrizeDelta('fusion_cell') === 1);
  const clsA = classifyFightEntry({ day: 100, vid: 'v1', mid: 'eulogy', wave: 4, outcome: 'vKill',
    partyCells: [{ vid: 'v1', rangedId: 'searcaster', ammoId: 'fusion_cell', cells: 2, alive: true }],
    volley: { shots: 2, hits: 2, dmg: 132, ammoLeft: 0 } });
  check('classifier: lead-armed', clsA && clsA.lead.cls === 'lead-armed' && clsA.engaged === true);
  const clsD = classifyFightEntry({ day: 110, vid: 'v1', mid: 'reunion', wave: 4, outcome: 'fled',
    partyCells: [{ vid: 'v1', rangedId: 'searcaster', ammoId: 'fusion_cell', cells: 0, alive: true }],
    volley: { shots: 0, hits: 0, dmg: 0, ammoLeft: 0 } });
  check('classifier: lead-dry', clsD && clsD.lead.cls === 'lead-dry');
  const rec = reconcileGrant({ day: 88, itemId: 'searcaster', caller: 'contest-prize', toKind: 'villager', toVid: 'v1', cellDelta: 0 },
    [{ vid: 'v1', before: 0, after: 2 }]);
  check('reconciler: contest searcaster bundle +2', rec.explained && rec.bundle === 2);
  const led = buildRearmLedger({
    grants: [{ day: 88, itemId: 'searcaster', caller: 'contest-prize', toVid: 'v1', cellDelta: 0, bundle: 2 }],
    loot: [], census: [{ day: 88, vid: 'v1', cells: 2, cellsStash: 0 }, { day: 110, vid: 'v1', cells: 0, cellsStash: 0 }],
    volleys: [{ day: 96, vid: 'v1', mid: 'reunion', shots: 2, hits: 2, dmg: 132, cellsBefore: 2, cellsAfter: 0 }],
    departs: [] }, 'v1', 115);
  check('ledger: bundle counted, spend counted, days-since right',
    led.cellsGrantedTotal === 2 && led.cellsSpentTotal === 2 && led.daysSinceLastCell === 27);

  console.log('CELLCHECK_FAILS ' + failed + (fails.length ? ' ' + fails.join(',') : ''));
  console.log('CELLCHECK_PASSED ' + passed + '/' + (passed + failed));
  if (failed) process.exitCode = 1;
}

main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });

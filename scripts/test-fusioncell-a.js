#!/usr/bin/env node
// scripts/test-fusioncell-a.js — proof test, arm sim-fusioncell-a (finding #2599).
//
// Proves the fusion-cell supply DIAG instrument: the frozen mechanism
// (no recipe, no ruin-salvage pool, no pile material, no starting
// gear; loot is the sole in-code route), the cell census reads
// (per-villager cells + stash, pile sections, scholar inventory),
// the pocketAmmo no-source classification, and the searcaster volley
// at 0 cells vs armed (the volley-loss cost itself).
//
// Fixture (encounter-gear rule, Steve 2026-11-13): the villagers are
// geared wave-4 hunters as the launch leaves them — a searcaster
// holder with a party behind them, not a fresh solo scholar.
//
// Usage: node scripts/test-fusioncell-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo; prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
const path = require('path');
const fs = require('fs');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { classifyPocketAmmo, ammoCountOf, rangedKitOf, ammoCensusSnap,
  cellCountIn, pileCellsOf, scholarCellsOf,
  classifyGrantCaller, grantRecipientOf } = require('./fusioncell-driver-a');
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
function itemDef(Game, id) {
  return (Game.data.items || []).find(function (d) { return d.id === id; }) || null;
}

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'fusioncell-unit' });
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
  const searInPool = (Game.data.items || []).filter(function (i) { return (i.lootTier || 1) === 4; }).map(function (i) { return i.id; });
  check('fusion_cell is a tier-4 item (loot-pool tier)', searInPool.indexOf('fusion_cell') !== -1 && searInPool.indexOf('searcaster') !== -1,
    't4 count=' + searInPool.length);

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
  const mats = stashMats(Game);
  check('fusion_cell is not a pile material (MAT_IDS cannot hold it)',
    !Object.prototype.hasOwnProperty.call(mats, 'fusion_cell'),
    'pile keys=' + Object.keys(mats).join(','));
  // Starting-gear filter (game.js: the take('weapon') + wild-card
  // filter): lootTier <= 2 AND origin !== 'alien'. Both cell-side
  // items fail it.
  const startFilter = function (def) { return (def.lootTier || 1) <= 2 && def.origin !== 'alien'; };
  check('starting-gear filter excludes searcaster and fusion_cell',
    startFilter(sear) === false && startFilter(cell) === false);

  // ---- 3. loot is the sole route: the tier-4 kill pool contains fusion_cell ----
  // Replicate rollAlienLoot's pool filter live: (origin alien OR
  // killItems[4] OR extraItems[4]) AND lootTier 4 — on the KILL
  // path rewardSource is unset, so extraItems contributes nothing
  // (extra = [] in the code); the kill pool is alien t4 + killItems t4.
  const reward = Game.data.rewardEconomy || {};
  const kill4 = (((reward.killItems || {})[4]) || []);
  const extra4 = []; // kill path: rewardSource unset -> extra is []
  const pool = (Game.data.items || []).filter(function (i) {
    return (i.origin === 'alien' || extra4.indexOf(i.id) !== -1 || kill4.indexOf(i.id) !== -1) &&
      (i.lootTier || 1) === 4;
  }).map(function (i) { return i.id; });
  check('tier-4 kill pool holds fusion_cell (1/15 per tier-4 drop)',
    pool.indexOf('fusion_cell') !== -1 && pool.length === 15,
    'pool=' + pool.length + ' ' + JSON.stringify(pool));
  check('killItems[4] names 11 members (the non-alien half of the pool)',
    kill4.length === 11, 'kill4=' + kill4.length);

  // ---- 4. live loot: sweeping the pick draw proves a cell CAN drop ----
  // rollAlienLoot with an apex tier-4 monster: chance 1 (always
  // proceeds), no taper (apex), no tier4Chance — the only draw that
  // matters is the pool pick. Feed chance-draw 0.0 then pick-draw
  // (i+0.5)/15 for i in 0..14, ten cycles: every pool slot is hit
  // exactly 10 times, so fusion_cell (pool[0]) drops exactly 10.
  const savedRandom = Math.random;
  let cellDrops = 0, totalDrops = 0;
  try {
    const draws = [];
    for (let cyc = 0; cyc < 10; cyc++) {
      for (let i = 0; i < 15; i++) { draws.push(0.0); draws.push((i + 0.5) / 15); }
    }
    let di = 0;
    Math.random = function () { const v = draws[di % draws.length]; di++; return v; };
    const mdef = { id: 'moderator', wave: 2, apex: true, loot: { chance: 1, tier: 4 } };
    for (let k = 0; k < 150; k++) {
      const drop = Game.rollAlienLoot(mdef, {});
      if (drop) { totalDrops++; if (drop === 'fusion_cell') cellDrops++; }
    }
  } finally { Math.random = savedRandom; }
  check('live loot sweep: 150/150 tier-4 drops, fusion_cell exactly 10 (pool[0], 1/15)',
    totalDrops === 150 && cellDrops === 10, 'drops=' + totalDrops + ' cells=' + cellDrops);

  // ---- 5. driver helpers: cell census reads ----
  check('cellCountIn counts string + object entries',
    cellCountIn(['fusion_cell', { itemId: 'fusion_cell', units: 3 }, { itemId: 'arrow', units: 9 }], 'fusion_cell') === 4);
  check('pileCellsOf reads all sections (fresh game: 0 everywhere)',
    (function () { const pc = pileCellsOf(Game); return pc.total === 0 && pc.materials === 0 && pc.weapons === 0; })(),
    JSON.stringify(pileCellsOf(Game)));
  check('scholarCellsOf reads scholar inventory (fresh game: 0 cells)',
    scholarCellsOf(Game).cells === 0, JSON.stringify(scholarCellsOf(Game)));

  // ---- 6. classifyPocketAmmo: fusion_cell has no source kind ----
  const preCell = { ammoId: 'fusion_cell', carriedBefore: 0, stashBefore: 0, pileBefore: { stick: 10, stone: 10, fiber: 5 }, matsSufficient: false, cap: 5 };
  check('classify no-source-kind (fusion_cell)',
    classifyPocketAmmo(preCell, { pocketed: 0, crafted: 0, craftedOk: false }, 0).reason === 'no-source-kind');

  // ---- 7. live pocketAmmo: searcaster pockets nothing (no stash, full pile) ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 }];
  Game.villagerGearUp(vid, true);
  setMats(Game, { wood: 5, vine: 5, branch: 5, stick: 10, stone: 10, fiber: 5 });
  const outCell = Game.villagerPocketAmmo(vid);
  check('searcaster pockets nothing with no stashed cells', outCell.ammoId === 'fusion_cell' && outCell.crafted === 0 && outCell.pocketed === 0, JSON.stringify(outCell));
  check('searcaster departs with zero cells', ammoCountOf(p.items, 'fusion_cell') === 0);

  // ---- 8. live pocketAmmo: the stash path DOES work for cells ----
  // The only in-game route to a pocketed cell is a cell already in
  // the personal stash (e.g. a looted cell stashed earlier).
  resetVillager(Game, p);
  p.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 }];
  p.stashed = [{ itemId: 'fusion_cell', name: 'Fusion cell', units: 3, kg: 0.4 }];
  Game.villagerGearUp(vid, true);
  setMats(Game, { wood: 0, vine: 0, branch: 0, stick: 0, stone: 0, fiber: 0 });
  const outStashCell = Game.villagerPocketAmmo(vid);
  check('stashed fusion cells pocket (the only pocket route)', outStashCell.pocketed === 3 && outStashCell.crafted === 0, JSON.stringify(outStashCell));
  check('stashed cells land in the pack', ammoCountOf(p.items, 'fusion_cell') === 3 && (p.stashed || []).length === 0);

  // ---- 9. live craft: Game.craft('fusion_cell') creates nothing ----
  const scholarInv = (Game.state.scholar || {}).inventory || [];
  const cellsBefore = ammoCountOf(scholarInv, 'fusion_cell');
  let craftRet = null, craftThrew = false;
  try { craftRet = Game.craft('fusion_cell'); } catch (e) { craftThrew = true; }
  check('Game.craft(fusion_cell) makes no cell (no recipe: null return or throw, never a cell)',
    ammoCountOf((Game.state.scholar || {}).inventory || [], 'fusion_cell') === cellsBefore,
    'ret=' + JSON.stringify(craftRet) + ' threw=' + craftThrew + ' before=' + cellsBefore);

  // ---- 10. census snap carries the cell fields ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 }];
  Game.villagerGearUp(vid, true);
  const snap = ammoCensusSnap(Game);
  const row = snap.census.find(function (r) { return r.vid === vid; });
  check('census finds the searcaster holder at zero cells', !!row && row.rangedId === 'searcaster' && row.ammoId === 'fusion_cell' && row.cells === 0 && row.cellsStash === 0, JSON.stringify(row));
  check('census snapshot carries pileCells + scholarCells', snap.pileCells && snap.scholarCells && snap.pileCells.total === 0, JSON.stringify({ pile: snap.pileCells, sch: snap.scholarCells }));

  // ---- 11. the volley at 0 cells: no shots, the honest line ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 }];
  Game.villagerGearUp(vid, true);
  const mdef = (Game.data.monsters || []).find(function (m) { return m.id === 'eulogy'; }) || (Game.data.monsters || [])[0];
  let rec0 = null;
  try { rec0 = Game.fieldFight(vid, mdef, null, { allies: 1 }); } catch (e) { console.log('fieldFight error: ' + e.message); }
  check('0-cell searcaster volleys 0 shots', rec0 && rec0.volley && rec0.volley.shots === 0 && rec0.volley.dmg === 0, JSON.stringify(rec0 && rec0.volley));
  check('0-cell volley names fusion cells in the log',
    rec0 && (rec0.log || []).some(function (s) { return /no fusion cells/i.test(String(s)); }),
    JSON.stringify((rec0 && rec0.log) || []));

  // ---- 12. the volley armed: shots fire, cells are spent ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 },
    { itemId: 'fusion_cell', name: 'Fusion cell', units: 4, kg: 0.4 }];
  Game.villagerGearUp(vid, true);
  const cellsBeforeFight = ammoCountOf(p.items, 'fusion_cell');
  let rec1 = null;
  try { rec1 = Game.fieldFight(vid, mdef, null, { allies: 1 }); } catch (e) { console.log('fieldFight error: ' + e.message); }
  check('armed searcaster volleys (shots > 0)', cellsBeforeFight === 4 && rec1 && rec1.volley && rec1.volley.shots > 0,
    'cells=' + cellsBeforeFight + ' ' + JSON.stringify(rec1 && rec1.volley));
  check('armed volley spends exactly its shots in cells',
    rec1 && rec1.volley && ammoCountOf(p.items, 'fusion_cell') === cellsBeforeFight - rec1.volley.shots,
    'left=' + ammoCountOf(p.items, 'fusion_cell') + ' shots=' + (rec1 && rec1.volley && rec1.volley.shots));
  check('armed volley hits land in the searcaster band (64-68 per hit)',
    rec1 && rec1.volley && rec1.volley.hits > 0 && rec1.volley.dmg >= 64 * rec1.volley.hits && rec1.volley.dmg <= 68 * rec1.volley.hits,
    JSON.stringify(rec1 && rec1.volley));

  // ---- 13. v2 grant wraps: classifier + recipient + live grants ----
  check('classifyGrantCaller contest-prize', classifyGrantCaller('at G._cxItemPrize (contests.js:185)') === 'contest-prize');
  check('classifyGrantCaller show-gift', classifyGrantCaller('at G._showVillagerEnd (contests.js:1403)') === 'show-gift');
  check('classifyGrantCaller trade', classifyGrantCaller('at tradeGoods (betrayal.js:4092)') === 'trade');
  check('classifyGrantCaller kill-loot-corpse', classifyGrantCaller('at tbEnd (game.js:47465) corpseForKill') === 'kill-loot-corpse');
  check('classifyGrantCaller other (no rule matches)', classifyGrantCaller('at somethingElse (game.js:123)') === 'other');
  check('grantRecipientOf null -> scholar', grantRecipientOf(Game, null).toKind === 'scholar');
  check('grantRecipientOf villager person -> villager', grantRecipientOf(Game, p).toKind === 'villager' && grantRecipientOf(Game, p).toVid === p.id);
  check('grantRecipientOf corpse-like object -> corpse', grantRecipientOf(Game, { id: 'corpse_1', items: [] }).toKind === 'corpse');
  check('_cxItemPrize exists (contest prize path is wrappable)', typeof Game._cxItemPrize === 'function');
  check('_corpseTakeStack exists (scholar corpse-take path is wrappable)', typeof Game._corpseTakeStack === 'function');
  check('alienLootGrant exists (the shared grant path)', typeof Game.alienLootGrant === 'function');
  // Live: grant a cell to the villager -> lands in their pack.
  resetVillager(Game, p);
  Game.villagerGearUp(vid, true);
  const grantedV = Game.alienLootGrant('fusion_cell', p);
  check('live alienLootGrant to a villager puts the cell in their pack',
    !!grantedV && ammoCountOf(p.items, 'fusion_cell') === 1, JSON.stringify(grantedV && grantedV.entry));
  // Live: grant a cell to nobody -> scholar inventory.
  const scholarCellsBefore = ammoCountOf((Game.state.scholar || {}).inventory || [], 'fusion_cell');
  const grantedS = Game.alienLootGrant('fusion_cell', null);
  check('live alienLootGrant to null puts the cell in the scholar pack',
    !!grantedS && ammoCountOf((Game.state.scholar || {}).inventory || [], 'fusion_cell') === scholarCellsBefore + 1);
  // Live: grant a cell to a corpse object -> stays with the body.
  const corpse = { id: 'corpse_test', items: [] };
  const grantedC = Game.alienLootGrant('fusion_cell', corpse);
  check('live alienLootGrant to a corpse stays on the body (loot-as-action)',
    !!grantedC && corpse.items.length === 1 && (corpse.items[0].itemId || corpse.items[0].id) === 'fusion_cell',
    JSON.stringify(corpse.items));

  console.log('FUSIONCELL_FAILS ' + failed + (fails.length ? ' ' + fails.join(',') : ''));
  console.log('FUSIONCELL_PASSED ' + passed + '/' + (passed + failed));
  if (failed) process.exitCode = 1;
}

main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });

#!/usr/bin/env node
// scripts/test-fusioncell-fix-a.js — proof test, arm sim-fusioncell-fix-a
// (finding #2599). The fix: a searcaster contest-prize grant BUNDLES
// 2 fusion cells with the weapon, and the standalone fusion-cell
// contest-prize weight goes up (tier-4 contest roll: 0.25 outright
// cell pick). Env-gated FUSIONCELL=1; unset = the old prize table,
// byte-identical.
//
// Proves, per the frozen prereg:
// (a) the bundle — a searcaster prize gives the SAME holder 2 cells,
//     for a villager AND for the player (scholar inventory);
// (b) the standalone cell prize still works, and the 0.25 override
//     fires only on tier-4 CONTEST rolls — trade and kill-loot paths
//     are untouched (no extra draw consumed there);
// (c) control-leg identity — FUSIONCELL unset: same prize, no bundle,
//     no override draw;
// (d) the tier-4 contest pool read live (15 items, fusion_cell present);
// (e) the armed searcaster volley on the encounter-gear fixture
//     (a geared villager fighter with a party — never a fresh un-geared
//     solo scholar): shots fire, cells are spent, hits land 64–68;
// (f) the analyzer --selftest covers the cross-leg judge shapes
//     (GO, NO-GO per bar).
//
// The _cxItemPrize bundle is proven with the wave stubbed to 4 (so the
// apex tier-4 roll is reachable) and Math.random fed a fixed draw
// sequence: apex draw, chance draw, override draw, pool-pick draw.
// Draw counts are asserted, so a stray extra draw fails loudly.
//
// Usage: node scripts/test-fusioncell-fix-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo; prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { classifyPocketAmmo, ammoCountOf, rangedKitOf, ammoCensusSnap,
  cellCountIn, pileCellsOf, scholarCellsOf,
  classifyGrantCaller, grantRecipientOf } = require('./fusioncell-driver-fix-a');
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
function resetVillager(Game, p) {
  p.items = []; p.equipped = {}; p.stashed = [];
  try { Game.state.village.ammoCraft = Game.state.village.ammoCraft || {}; delete Game.state.village.ammoCraft[p.id]; } catch (e) {}
  try { Game.state.village.arrowCraftCd = Game.state.village.arrowCraftCd || {}; delete Game.state.village.arrowCraftCd[p.id]; } catch (e) {}
}
function itemDef(Game, id) {
  return (Game.data.items || []).find(function (d) { return d.id === id; }) || null;
}
// Feed Math.random a fixed draw sequence; returns how many draws were consumed.
function withDraws(draws, fn) {
  const saved = Math.random;
  let di = 0;
  Math.random = function () { const v = draws[di % draws.length]; di++; return v; };
  try { return { out: fn(), used: di }; }
  finally { Math.random = saved; }
}
function setFusioncell(on) { if (on) process.env.FUSIONCELL = '1'; else delete process.env.FUSIONCELL; }

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'fusioncell-fix-unit' });
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  const p = personOf(Game, vid);
  console.log('fighter=' + vid + ' roster=' + roster.length);

  // ---- 1. live data agreement: the weapon, the cell, the contest pool ----
  const sear = itemDef(Game, 'searcaster');
  check('searcaster def: alien tier-4, bonus 120, range 8, ammo fusion_cell',
    sear && sear.origin === 'alien' && (sear.lootTier || 0) === 4 &&
    sear.weapon && sear.weapon.bonus === 120 && sear.weapon.range === 8 &&
    sear.weapon.ammo === 'fusion_cell', JSON.stringify(sear && sear.weapon));
  const cell = itemDef(Game, 'fusion_cell');
  check('fusion_cell def: material, alien, lootTier 4, findable false',
    cell && cell.class === 'material' && cell.origin === 'alien' &&
    (cell.lootTier || 0) === 4 && cell.findable === false, JSON.stringify(cell));
  const reward = Game.data.rewardEconomy || {};
  const extra4 = ((reward.extraItems || {})[4]) || [];
  const contestPool = (Game.data.items || []).filter(function (i) {
    return (i.origin === 'alien' || extra4.indexOf(i.id) !== -1) && (i.lootTier || 1) === 4;
  }).map(function (i) { return i.id; });
  check('tier-4 contest pool is 15 items (4 alien + 11 extraItems[4])',
    contestPool.length === 15 && extra4.length === 11,
    'pool=' + contestPool.length + ' extra4=' + extra4.length + ' ' + JSON.stringify(contestPool));
  check('tier-4 contest pool holds fusion_cell AND searcaster',
    contestPool.indexOf('fusion_cell') !== -1 && contestPool.indexOf('searcaster') !== -1,
    JSON.stringify(contestPool));
  const searIdx = contestPool.indexOf('searcaster');
  const kill4 = ((reward.killItems || {})[4]) || [];
  const killPool = (Game.data.items || []).filter(function (i) {
    return (i.origin === 'alien' || kill4.indexOf(i.id) !== -1) && (i.lootTier || 1) === 4;
  }).map(function (i) { return i.id; });
  check('tier-4 kill pool is 15 items with its own 11 killItems[4] members (contest and kill pools share only the 4 alien + bloodplate)',
    killPool.length === 15 && kill4.length === 11 && killPool.indexOf('fusion_cell') !== -1,
    'kill=' + killPool.length + ' kill4=' + kill4.length);

  // ---- 2. rollAlienLoot: the 0.25 override, on and off, contest only ----
  const contestMdef = { wave: 4, loot: { chance: 1, tier: 4, rewardSource: 'contest' } };
  setFusioncell(true);
  let r = withDraws([0.0, 0.1], function () { return Game.rollAlienLoot(contestMdef, {}); });
  check('FUSIONCELL on: override draw < 0.25 returns fusion_cell outright',
    r.out === 'fusion_cell' && r.used === 2, 'drop=' + r.out + ' draws=' + r.used);
  r = withDraws([0.0, 0.9, 0.5], function () { return Game.rollAlienLoot(contestMdef, {}); });
  check('FUSIONCELL on: override draw >= 0.25 falls through to the pool pick (pool[7])',
    r.out === contestPool[7] && r.used === 3, 'drop=' + r.out + ' want=' + contestPool[7] + ' draws=' + r.used);
  setFusioncell(false);
  r = withDraws([0.0, 0.5], function () { return Game.rollAlienLoot(contestMdef, {}); });
  check('FUSIONCELL unset: no override draw consumed, same pool pick (pool[7])',
    r.out === contestPool[7] && r.used === 2, 'drop=' + r.out + ' want=' + contestPool[7] + ' draws=' + r.used);
  // Trade path: rewardSource 'trade' — the override must NOT fire and no
  // extra draw is consumed, even with FUSIONCELL=1.
  setFusioncell(true);
  const tradeMdef = { wave: 4, loot: { chance: 1, tier: 4, rewardSource: 'trade' } };
  r = withDraws([0.0, 0.5], function () { return Game.rollAlienLoot(tradeMdef, {}); });
  check('trade path untouched: FUSIONCELL on, 2 draws, pool pick (pool[7])',
    r.out === contestPool[7] && r.used === 2, 'drop=' + r.out + ' draws=' + r.used);
  // Kill-loot path: no rewardSource — taper draw then pick, no override.
  const killMdef = { wave: 4, apex: false, loot: { chance: 1, tier: 4 } };
  r = withDraws([0.0, 0.5, 0.5], function () { return Game.rollAlienLoot(killMdef, {}); });
  check('kill-loot path untouched: 3 draws (chance, taper, pick), pool pick (pool[7])',
    r.out === killPool[7] && r.used === 3, 'drop=' + r.out + ' want=' + killPool[7] + ' draws=' + r.used);
  setFusioncell(false);

  // ---- 3. the bundle: _cxItemPrize grants searcaster + 2 cells ----
  // Stub the wave to 4 so the apex tier-4 roll is reachable; the
  // draw sequence is [apex 0.1 (<0.25 -> tier 4), chance 0.0,
  // override 0.9 (>=0.25 -> pool pick), pick (searIdx+0.5)/15].
  const realWave = Game.unlockedWave;
  try { Game.unlockedWave = function () { return 4; }; } catch (e) {}
  check('wave stub reads 4', Game.unlockedWave() === 4);
  const pickDraw = (searIdx + 0.5) / 15;
  const ac = { variant: 'hardened' };
  const contest = { risk: 'extreme' };
  // Villager, FUSIONCELL=1.
  setFusioncell(true);
  resetVillager(Game, p);
  Game.villagerGearUp(vid, true);
  const cellsBeforeV = ammoCountOf(p.items, 'fusion_cell');
  r = withDraws([0.1, 0.0, 0.9, pickDraw], function () { return Game._cxItemPrize(ac, contest, vid); });
  check('bundle (villager, on): prize granted', r.out !== false && r.out !== null, 'ret=' + JSON.stringify(r.out) + ' draws=' + r.used);
  check('bundle (villager, on): searcaster in the pack',
    p.items.some(function (e) { return (e.itemId || e.id) === 'searcaster'; }), JSON.stringify(p.items.map(function (e) { return e.itemId || e.id; })));
  check('bundle (villager, on): exactly +2 fusion cells beside it',
    ammoCountOf(p.items, 'fusion_cell') === cellsBeforeV + 2,
    'cells=' + ammoCountOf(p.items, 'fusion_cell') + ' before=' + cellsBeforeV);
  // Player, FUSIONCELL=1.
  const scholarInv = (Game.state.scholar || {}).inventory || [];
  const cellsBeforeS = ammoCountOf(scholarInv, 'fusion_cell');
  const searsBeforeS = scholarInv.filter(function (e) { return (e.itemId || e.id) === 'searcaster'; }).length;
  r = withDraws([0.1, 0.0, 0.9, pickDraw], function () { return Game._cxItemPrize(ac, contest, 'player'); });
  check('bundle (player, on): prize granted', r.out !== false && r.out !== null, 'ret=' + JSON.stringify(r.out));
  check('bundle (player, on): searcaster in the scholar inventory',
    ammoCountOf((Game.state.scholar || {}).inventory || [], 'searcaster') === searsBeforeS + 1);
  check('bundle (player, on): exactly +2 fusion cells in the scholar inventory',
    ammoCountOf((Game.state.scholar || {}).inventory || [], 'fusion_cell') === cellsBeforeS + 2,
    'cells=' + ammoCountOf((Game.state.scholar || {}).inventory || [], 'fusion_cell') + ' before=' + cellsBeforeS);
  // Control: FUSIONCELL unset — same prize, NO bundle.
  setFusioncell(false);
  resetVillager(Game, p);
  Game.villagerGearUp(vid, true);
  const cellsBeforeC = ammoCountOf(p.items, 'fusion_cell');
  r = withDraws([0.1, 0.0, pickDraw], function () { return Game._cxItemPrize(ac, contest, vid); });
  check('control (villager, off): prize granted (same prize, no bundle)',
    r.out !== false && r.out !== null && r.used === 3, 'ret=' + JSON.stringify(r.out) + ' draws=' + r.used);
  check('control (villager, off): searcaster in the pack',
    p.items.some(function (e) { return (e.itemId || e.id) === 'searcaster'; }));
  check('control (villager, off): zero cells bundled',
    ammoCountOf(p.items, 'fusion_cell') === cellsBeforeC,
    'cells=' + ammoCountOf(p.items, 'fusion_cell') + ' before=' + cellsBeforeC);
  try { Game.unlockedWave = realWave; } catch (e) {}
  setFusioncell(false);

  // ---- 4. the volley, armed and at 0 cells (encounter-gear fixture) ----
  const mdef = (Game.data.monsters || []).find(function (m) { return m.id === 'eulogy'; }) || (Game.data.monsters || [])[0];
  resetVillager(Game, p);
  p.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 }];
  Game.villagerGearUp(vid, true);
  let rec0 = null;
  try { rec0 = Game.fieldFight(vid, mdef, null, { allies: 1 }); } catch (e) { console.log('fieldFight error: ' + e.message); }
  check('0-cell searcaster volleys 0 shots', rec0 && rec0.volley && rec0.volley.shots === 0 && rec0.volley.dmg === 0, JSON.stringify(rec0 && rec0.volley));
  check('0-cell volley names fusion cells in the log',
    rec0 && (rec0.log || []).some(function (s) { return /no fusion cells/i.test(String(s)); }),
    JSON.stringify((rec0 && rec0.log) || []));
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

  // ---- 5. analyzer selftest (cross-leg judge shapes) ----
  console.log('\n=== Analyzer selftest (analyze-fusioncell-fix-a --selftest) ===');
  let anaSelf = null;
  try {
    const anaOut = execFileSync(process.execPath, [path.join(REPO, 'scripts', 'analyze-fusioncell-fix-a.js'), '--selftest'],
      { encoding: 'utf8', timeout: 120000, maxBuffer: 16 * 1024 * 1024, env: process.env });
    console.log('  ' + anaOut.trim().split('\n').filter(Boolean).pop());
    anaSelf = /34 passed, 0 failed/.test(anaOut);
  } catch (e) {
    console.log('  (analyzer selftest failed: ' + (e && e.message) + ')');
  }
  check('analyzer selftest passes (34 passed, 0 failed — incl. the GO / NO-GO-per-bar judge)', anaSelf === true, anaSelf === null ? 'no output' : 'see output above');

  console.log('FUSIONCELL_FAILS ' + failed + (fails.length ? ' ' + fails.join(',') : ''));
  console.log('FUSIONCELL_PASSED ' + passed + '/' + (passed + failed));
  if (failed) process.exitCode = 1;
}

main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });

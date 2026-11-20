#!/usr/bin/env node
// scripts/test-gunrate-a.js — proof test, arm sim-gunrate-a
// (finding #2599: the searcaster GUN rate). The lever, env-gated
// GUNRATE=1; unset = the old prize table, byte-identical:
// (a) a searcaster contest-prize grant BUNDLES 2 fusion cells with
//     the gun, to the SAME recipient (villager or player);
// (b) a searcaster/fusion_cell contest prize won by the PLAYER is
//     REDIRECTED to the village's lead-weighted living villager
//     instead of the scholar's pack — expedition holders first
//     (currently on an expedition +8, launches +2 each capped +8),
//     wave-kill deeds second (wave3Kill 4, wave2Kill 2, contestWin
//     1 each), roster-order tie-break; other prizes stay with the
//     player;
// (c) the tier-4 contest pool weights searcaster x4 (1/15 -> 4/18),
//     contest paths ONLY — trade and kill-loot paths untouched;
// (d) DRAW-NEUTRALITY: the lever adds ZERO Math.random() draws on
//     either leg (asserted draw counts on every live call);
// (e) the armed searcaster volley on the encounter-gear fixture
//     (a geared villager fighter with a party — never a fresh un-geared
//     solo scholar): grant -> gear-up -> equipped searcaster -> lead
//     volley fires, cells are spent, hits land 64-68;
// (f) the analyzer --selftest covers the cross-leg judge shapes
//     (GO, NO-GO per bar incl. the exposure-normalized guardrail).
//
// The _cxItemPrize tests stub the wave to 4 (so the apex tier-4 roll
// is reachable) and feed Math.random a fixed draw sequence: apex draw,
// chance draw, pool-pick draw. Draw counts are asserted, so a stray
// extra draw fails loudly.
//
// Usage: node scripts/test-gunrate-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo; prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
const path = require('path');
const { execFileSync } = require('child_process');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { ammoCountOf, rangedKitOf } = require('./gunrate-driver-a');
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
function setGunrate(on) { if (on) process.env.GUNRATE = '1'; else delete process.env.GUNRATE; }

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'gunrate-unit' });
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
  const cellIdx = contestPool.indexOf('fusion_cell');

  // ---- 2. rollAlienLoot: the gun reweight, on and off, contest only ----
  const contestMdef = { wave: 4, loot: { chance: 1, tier: 4, rewardSource: 'contest' } };
  setGunrate(true);
  // Appended-searcaster draw: pool is 18 on-leg (15 + 3 extra searcasters at 15,16,17).
  let r = withDraws([0.0, 15.5 / 18], function () { return Game.rollAlienLoot(contestMdef, {}); });
  check('GUNRATE on: appended-searcaster draw returns searcaster (pool 18)',
    r.out === 'searcaster' && r.used === 2, 'drop=' + r.out + ' draws=' + r.used);
  r = withDraws([0.0, (searIdx + 0.5) / 18], function () { return Game.rollAlienLoot(contestMdef, {}); });
  check('GUNRATE on: searcaster still pickable at its own index (pool 18)',
    r.out === 'searcaster' && r.used === 2, 'drop=' + r.out + ' draws=' + r.used);
  r = withDraws([0.0, (cellIdx + 0.5) / 18], function () { return Game.rollAlienLoot(contestMdef, {}); });
  check('GUNRATE on: fusion_cell still pickable at its own index (pool 18)',
    r.out === 'fusion_cell' && r.used === 2, 'drop=' + r.out + ' draws=' + r.used);
  setGunrate(false);
  r = withDraws([0.0, (searIdx + 0.5) / 15], function () { return Game.rollAlienLoot(contestMdef, {}); });
  check('GUNRATE unset: same searcaster pick, 2 draws (draw-neutral)',
    r.out === 'searcaster' && r.used === 2, 'drop=' + r.out + ' draws=' + r.used);
  // The same appended-searcaster draw OFF-leg must land on an ordinary pool
  // item, not a searcaster (the reweight is off-leg absent).
  let offDraw = 15.5 / 18, offIdx = Math.floor(offDraw * 15);
  if (contestPool[offIdx] === 'searcaster') { offDraw = 16.5 / 18; offIdx = Math.floor(offDraw * 15); }
  if (contestPool[offIdx] === 'searcaster') { offDraw = 17.5 / 18; offIdx = Math.floor(offDraw * 15); }
  r = withDraws([0.0, offDraw], function () { return Game.rollAlienLoot(contestMdef, {}); });
  check('GUNRATE unset: the appended-searcaster draw lands on an ordinary pool item, not a searcaster',
    r.out === contestPool[offIdx] && r.out !== 'searcaster' && r.used === 2,
    'drop=' + r.out + ' want=' + contestPool[offIdx] + ' draws=' + r.used);
  // Trade path: rewardSource 'trade' — the reweight must NOT fire and no
  // extra draw is consumed, even with GUNRATE=1.
  setGunrate(true);
  const tradeMdef = { wave: 4, loot: { chance: 1, tier: 4, rewardSource: 'trade' } };
  r = withDraws([0.0, 0.5], function () { return Game.rollAlienLoot(tradeMdef, {}); });
  check('trade path untouched: GUNRATE on, 2 draws, pool pick (pool[7])',
    r.out === contestPool[7] && r.used === 2, 'drop=' + r.out + ' draws=' + r.used);
  // Kill-loot path: no rewardSource — taper draw then pick, no reweight.
  const killMdef = { wave: 4, apex: false, loot: { chance: 1, tier: 4 } };
  const kill4 = ((reward.killItems || {})[4]) || [];
  const killPool = (Game.data.items || []).filter(function (i) {
    return (i.origin === 'alien' || kill4.indexOf(i.id) !== -1) && (i.lootTier || 1) === 4;
  }).map(function (i) { return i.id; });
  r = withDraws([0.0, 0.5, 0.5], function () { return Game.rollAlienLoot(killMdef, {}); });
  check('kill-loot path untouched: 3 draws (chance, taper, pick), pool pick (pool[7])',
    r.out === killPool[7] && r.used === 3, 'drop=' + r.out + ' want=' + killPool[7] + ' draws=' + r.used);
  setGunrate(false);

  // ---- 3. _gunRateFighter: expedition holders lead the pick ----
  // Fixture villagers: vidB = the deed-fighter (wave-3 kill),
  // vidC = currently on an expedition (no deeds), vidD = launch
  // history (3 expeditions, no deeds), vidE = plain (no deeds).
  const vidB = roster[1], vidC = roster[2], vidD = roster[3], vidE = roster[4];
  Game.state.notability = Game.state.notability || {};
  for (const id of roster) {
    Game.state.notability[id] = Object.assign({}, Game.state.notability[id], { wave3Kill: false, wave2Kill: false, contestWin: 0 });
  }
  Game.state.notability[vidB] = Object.assign({}, Game.state.notability[vidB], { wave3Kill: true });
  const agency = Game.agencyState ? Game.agencyState() : null;
  check('agencyState reads exped + stats maps', !!agency && !!agency.exped && !!agency.stats,
    JSON.stringify(agency && Object.keys(agency)));
  // (a) current expedition holder beats the deed-fighter.
  agency.exped[vidC] = { tx: 6, ty: 6, dist: 2, legs: 0, sinceDay: 1, sincePart: 0, duration: 10, finds: [], encounters: [] };
  let fighter = Game._gunRateFighter ? Game._gunRateFighter() : null;
  check('redirect recipient: current expedition holder beats the wave-3 killer (8 > 4)',
    fighter === vidC, 'fighter=' + fighter + ' want=' + vidC);
  // (b) launch history beats deeds when no one is currently out:
  // vidD has 3 launches (+6) vs vidB's wave-3 kill (+4).
  delete agency.exped[vidC];
  agency.stats[vidD] = { expeditions: 3, monsterKills: 0, caches: 0, nodes: {} };
  fighter = Game._gunRateFighter ? Game._gunRateFighter() : null;
  check('redirect recipient: 3 launches (+6) beats the wave-3 kill (+4)',
    fighter === vidD, 'fighter=' + fighter + ' want=' + vidD);
  // (c) deeds win when the launch history is thin: vidD 1 launch (+2) < vidB (+4).
  agency.stats[vidD] = { expeditions: 1, monsterKills: 0, caches: 0, nodes: {} };
  fighter = Game._gunRateFighter ? Game._gunRateFighter() : null;
  check('redirect recipient: wave-3 kill (+4) beats 1 launch (+2)',
    fighter === vidB, 'fighter=' + fighter + ' want=' + vidB);
  // (d) roster-order tie-break: vidB and vidE both score 0 after
  // clearing deeds — the earlier roster id wins. (vidB is roster[1],
  // vidE is roster[4]; clear vidB's deeds and vidD's stats.)
  Game.state.notability[vidB] = Object.assign({}, Game.state.notability[vidB], { wave3Kill: false });
  delete agency.stats[vidD];
  fighter = Game._gunRateFighter ? Game._gunRateFighter() : null;
  check('redirect recipient: tie-break is earliest roster order',
    fighter === roster[0] || fighter === vid, 'fighter=' + fighter + ' roster0=' + roster[0]);
  // (e) a dead deed-holder is skipped, not picked.
  Game.state.notability[vidB] = Object.assign({}, Game.state.notability[vidB], { wave3Kill: true });
  const pB = personOf(Game, vidB);
  const wasDead = pB.dead;
  pB.dead = true;
  fighter = Game._gunRateFighter ? Game._gunRateFighter() : null;
  check('redirect recipient: dead wave-3 killer is skipped',
    fighter !== vidB, 'fighter=' + fighter + ' (must not be ' + vidB + ')');
  pB.dead = wasDead;
  // Restore the (a) fixture for the prize tests: vidC out, vidB the deed-fighter.
  agency.exped[vidC] = { tx: 6, ty: 6, dist: 2, legs: 0, sinceDay: 1, sincePart: 0, duration: 10, finds: [], encounters: [] };
  fighter = Game._gunRateFighter ? Game._gunRateFighter() : null;
  check('redirect recipient restored: expedition holder leads again',
    fighter === vidC, 'fighter=' + fighter + ' want=' + vidC);
  const pC = personOf(Game, vidC);

  // ---- 4. _cxItemPrize: bundle, redirect, and control-leg identity ----
  // Stub the wave to 4 so the apex tier-4 roll is reachable; the draw
  // sequence is [apex 0.1 (<0.25 -> tier 4), chance 0.0, pool-pick].
  const realWave = Game.unlockedWave;
  try { Game.unlockedWave = function () { return 4; }; } catch (e) {}
  check('wave stub reads 4', Game.unlockedWave() === 4);
  const ac = { variant: 'hardened' };
  const contest = { risk: 'extreme' };
  // Villager winner, GUNRATE=1: bundle to the same villager.
  setGunrate(true);
  resetVillager(Game, p);
  Game.villagerGearUp(vid, true);
  const cellsBeforeV = ammoCountOf(p.items, 'fusion_cell');
  r = withDraws([0.1, 0.0, (searIdx + 0.5) / 18], function () { return Game._cxItemPrize(ac, contest, vid); });
  check('bundle (villager, on): prize granted, 3 draws', r.out !== false && r.out !== null && r.used === 3, 'ret=' + JSON.stringify(r.out) + ' draws=' + r.used);
  check('bundle (villager, on): searcaster in the pack',
    p.items.some(function (e) { return (e.itemId || e.id) === 'searcaster'; }), JSON.stringify(p.items.map(function (e) { return e.itemId || e.id; })));
  check('bundle (villager, on): exactly +2 fusion cells beside it',
    ammoCountOf(p.items, 'fusion_cell') === cellsBeforeV + 2,
    'cells=' + ammoCountOf(p.items, 'fusion_cell') + ' before=' + cellsBeforeV);
  // Gear-up equips the granted searcaster (the volley reads the slot).
  Game.villagerGearUp(vid, true);
  const kit = rangedKitOf(Game, p);
  check('gear-up equips the granted searcaster in the ranged slot',
    kit && kit.rwId === 'searcaster', JSON.stringify(kit));
  // Player winner, GUNRATE=1: searcaster REDIRECTED to the expedition holder + bundle.
  resetVillager(Game, pC);
  const scholarInv = (Game.state.scholar || {}).inventory || [];
  const searsBeforeS = scholarInv.filter(function (e) { return (e.itemId || e.id) === 'searcaster'; }).length;
  const cellsBeforeC = ammoCountOf(pC.items, 'fusion_cell');
  r = withDraws([0.1, 0.0, (searIdx + 0.5) / 18], function () { return Game._cxItemPrize(ac, contest, 'player'); });
  check('redirect (player searcaster, on): prize granted, 3 draws', r.out !== false && r.out !== null && r.used === 3, 'ret=' + JSON.stringify(r.out) + ' draws=' + r.used);
  check('redirect (player searcaster, on): searcaster lands on the expedition holder, not the scholar pack',
    pC.items.some(function (e) { return (e.itemId || e.id) === 'searcaster'; }) &&
    scholarInv.filter(function (e) { return (e.itemId || e.id) === 'searcaster'; }).length === searsBeforeS,
    'holderHas=' + pC.items.some(function (e) { return (e.itemId || e.id) === 'searcaster'; }) + ' scholarSears=' + scholarInv.filter(function (e) { return (e.itemId || e.id) === 'searcaster'; }).length);
  check('redirect (player searcaster, on): +2 cells bundled to the holder',
    ammoCountOf(pC.items, 'fusion_cell') === cellsBeforeC + 2,
    'cells=' + ammoCountOf(pC.items, 'fusion_cell') + ' before=' + cellsBeforeC);
  // Player winner, GUNRATE=1: a fusion_cell prize is redirected too.
  resetVillager(Game, pC);
  const cellsBeforeC2 = ammoCountOf(pC.items, 'fusion_cell');
  const cellsBeforeS = ammoCountOf((Game.state.scholar || {}).inventory || [], 'fusion_cell');
  r = withDraws([0.1, 0.0, (cellIdx + 0.5) / 18], function () { return Game._cxItemPrize(ac, contest, 'player'); });
  check('redirect (player cell, on): prize granted, 3 draws', r.out !== false && r.out !== null && r.used === 3, 'ret=' + JSON.stringify(r.out) + ' draws=' + r.used);
  check('redirect (player cell, on): the cell lands on the holder, not the scholar pack',
    ammoCountOf(pC.items, 'fusion_cell') === cellsBeforeC2 + 1 &&
    ammoCountOf((Game.state.scholar || {}).inventory || [], 'fusion_cell') === cellsBeforeS,
    'holderCells=' + ammoCountOf(pC.items, 'fusion_cell') + ' scholarCells=' + ammoCountOf((Game.state.scholar || {}).inventory || [], 'fusion_cell'));
  // Player winner, GUNRATE=1: an ordinary tier-4 prize stays with the player.
  // (Pick the first pool index that is NEITHER searcaster NOR fusion_cell —
  // those two redirect, so they cannot prove the no-redirect path.)
  let ordinaryIdx = -1;
  for (let i = 0; i < contestPool.length; i++) {
    if (contestPool[i] !== 'searcaster' && contestPool[i] !== 'fusion_cell') { ordinaryIdx = i; break; }
  }
  const ordinaryId = contestPool[ordinaryIdx];
  const ordBeforeS = (Game.state.scholar.inventory || []).filter(function (e) { return (e.itemId || e.id) === ordinaryId; }).length;
  const ordBeforeC = pC.items.filter(function (e) { return (e.itemId || e.id) === ordinaryId; }).length;
  r = withDraws([0.1, 0.0, (ordinaryIdx + 0.5) / 18], function () { return Game._cxItemPrize(ac, contest, 'player'); });
  check('no redirect for ordinary prizes (player keeps ' + ordinaryId + ')',
    r.out !== false && r.out !== null && r.used === 3 &&
    (Game.state.scholar.inventory || []).filter(function (e) { return (e.itemId || e.id) === ordinaryId; }).length === ordBeforeS + 1 &&
    pC.items.filter(function (e) { return (e.itemId || e.id) === ordinaryId; }).length === ordBeforeC,
    'ret=' + JSON.stringify(r.out) + ' draws=' + r.used);
  // Control: GUNRATE unset — same searcaster prize to a villager, NO bundle.
  setGunrate(false);
  resetVillager(Game, p);
  Game.villagerGearUp(vid, true);
  const cellsBeforeCtl = ammoCountOf(p.items, 'fusion_cell');
  r = withDraws([0.1, 0.0, (searIdx + 0.5) / 15], function () { return Game._cxItemPrize(ac, contest, vid); });
  check('control (villager, off): prize granted (same prize, no bundle), 3 draws',
    r.out !== false && r.out !== null && r.used === 3, 'ret=' + JSON.stringify(r.out) + ' draws=' + r.used);
  check('control (villager, off): searcaster in the pack',
    p.items.some(function (e) { return (e.itemId || e.id) === 'searcaster'; }));
  check('control (villager, off): zero cells bundled',
    ammoCountOf(p.items, 'fusion_cell') === cellsBeforeCtl,
    'cells=' + ammoCountOf(p.items, 'fusion_cell') + ' before=' + cellsBeforeCtl);
  // Control: GUNRATE unset — a player searcaster stays in the scholar pack.
  const searsBeforeS2 = (Game.state.scholar.inventory || []).filter(function (e) { return (e.itemId || e.id) === 'searcaster'; }).length;
  const searsBeforeC2 = pC.items.filter(function (e) { return (e.itemId || e.id) === 'searcaster'; }).length;
  r = withDraws([0.1, 0.0, (searIdx + 0.5) / 15], function () { return Game._cxItemPrize(ac, contest, 'player'); });
  check('control (player, off): searcaster stays in the scholar pack, no redirect, no bundle',
    r.out !== false && r.out !== null && r.used === 3 &&
    (Game.state.scholar.inventory || []).filter(function (e) { return (e.itemId || e.id) === 'searcaster'; }).length === searsBeforeS2 + 1 &&
    pC.items.filter(function (e) { return (e.itemId || e.id) === 'searcaster'; }).length === searsBeforeC2,
    'ret=' + JSON.stringify(r.out) + ' draws=' + r.used);
  try { Game.unlockedWave = realWave; } catch (e) {}
  setGunrate(false);

  // ---- 5. the volley, armed and at 0 cells (encounter-gear fixture) ----
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

  // ---- 6. analyzer selftest (cross-leg judge shapes) ----
  console.log('\n=== Analyzer selftest (analyze-gunrate-a --selftest) ===');
  let anaSelf = null;
  try {
    const anaOut = execFileSync(process.execPath, [path.join(REPO, 'scripts', 'analyze-gunrate-a.js'), '--selftest'],
      { encoding: 'utf8', timeout: 120000, maxBuffer: 16 * 1024 * 1024, env: process.env });
    console.log('  ' + anaOut.trim().split('\n').filter(Boolean).pop());
    anaSelf = /45 passed, 0 failed/.test(anaOut);
  } catch (e) {
    console.log('  (analyzer selftest failed: ' + (e && e.message) + ')');
  }
  check('analyzer selftest passes (45 passed, 0 failed — incl. the GO / NO-GO-per-bar judge)', anaSelf === true, anaSelf === null ? 'no output' : 'see output above');

  console.log('GUNRATE_FAILS ' + failed + (fails.length ? ' ' + fails.join(',') : ''));
  console.log('GUNRATE_PASSED ' + passed + '/' + (passed + failed));
  if (failed) process.exitCode = 1;
}

main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });

#!/usr/bin/env node
// scripts/test-holdersupply-a.js — proof test, arm sim-holdersupply-a
// (finding #2628: HOLDER SUPPLY — a bigger cell bundle per gun).
// The lever, env-gated BIGBUNDLE=1; unset = the old 2-cell bundle:
// (a) a searcaster contest-prize grant bundles 6 fusion cells (3
//     volleys) with the gun, to the SAME recipient, when BIGBUNDLE=1
//     and GUNRATE=1; with BIGBUNDLE unset the bundle stays 2;
// (b) BIGBUNDLE alone does nothing — the bundle lives under GUNRATE,
//     so with GUNRATE unset a searcaster prize bundles 0 cells even
//     with BIGBUNDLE=1;
// (c) the redirect is unchanged: a player-won searcaster still goes
//     to the lead-weighted villager (expedition holder first), and a
//     fusion_cell prize still redirects as exactly +1 cell (the bundle
//     is searcaster-only); ordinary prizes stay with the player;
// (d) DRAW-NEUTRALITY: the lever adds ZERO Math.random() draws
//     (asserted draw counts on every live call — the bundle is a
//     constant, not a roll);
// (e) the 6-cell gun under CELLGATE=1 holds its fire below wave 4
//     (0 shots, all 6 cells kept, honest hold line) and fires at
//     wave 4+ leaving cells for a SECOND volley (6 - loosed > 0) —
//     the mechanism's whole point: the holder stays armed after the
//     first hard fight.
// The encounter-gear fixture (a geared villager fighter with a
// party — never a fresh un-geared solo scholar) is shared with the
// gunrate/cellgate tests. The GUNRATE substrate itself is proven by
// scripts/test-gunrate-a.js (run unmodified, 39/39) and the gate by
// scripts/test-cellgate-a.js (12/12); this test proves ONLY the bundle.
//
// Usage: node scripts/test-holdersupply-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo; prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
const path = require('path');
const { execFileSync } = require('child_process');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { ammoCountOf } = require('./gunrate-driver-a');
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
function setBigbundle(on) { if (on) process.env.BIGBUNDLE = '1'; else delete process.env.BIGBUNDLE; }
function setCellgate(on) { if (on) process.env.CELLGATE = '1'; else delete process.env.CELLGATE; }

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'holdersupply-unit' });
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  const p = personOf(Game, vid);
  console.log('fighter=' + vid + ' roster=' + roster.length);

  // ---- 1. live data agreement ----
  const sear = itemDef(Game, 'searcaster');
  check('searcaster def: alien tier-4, range 8, ammo fusion_cell',
    sear && sear.origin === 'alien' && (sear.lootTier || 0) === 4 &&
    sear.weapon && sear.weapon.range === 8 && sear.weapon.ammo === 'fusion_cell',
    JSON.stringify(sear && sear.weapon));
  const cell = itemDef(Game, 'fusion_cell');
  check('fusion_cell def: material, alien, lootTier 4',
    cell && cell.class === 'material' && cell.origin === 'alien' && (cell.lootTier || 0) === 4,
    JSON.stringify(cell));
  const reward = Game.data.rewardEconomy || {};
  const extra4 = ((reward.extraItems || {})[4]) || [];
  const contestPool = (Game.data.items || []).filter(function (i) {
    return (i.origin === 'alien' || extra4.indexOf(i.id) !== -1) && (i.lootTier || 1) === 4;
  }).map(function (i) { return i.id; });
  const searIdx = contestPool.indexOf('searcaster');
  const cellIdx = contestPool.indexOf('fusion_cell');
  check('tier-4 contest pool holds fusion_cell AND searcaster',
    searIdx !== -1 && cellIdx !== -1, JSON.stringify(contestPool));

  // ---- 2. redirect fixture: expedition holder leads the pick ----
  const vidB = roster[1], vidC = roster[2];
  Game.state.notability = Game.state.notability || {};
  for (const id of roster) {
    Game.state.notability[id] = Object.assign({}, Game.state.notability[id], { wave3Kill: false, wave2Kill: false, contestWin: 0 });
  }
  Game.state.notability[vidB] = Object.assign({}, Game.state.notability[vidB], { wave3Kill: true });
  const agency = Game.agencyState ? Game.agencyState() : null;
  check('agencyState reads exped + stats maps', !!agency && !!agency.exped && !!agency.stats,
    JSON.stringify(agency && Object.keys(agency)));
  agency.exped[vidC] = { tx: 6, ty: 6, dist: 2, legs: 0, sinceDay: 1, sincePart: 0, duration: 10, finds: [], encounters: [] };
  const fighter = Game._gunRateFighter ? Game._gunRateFighter() : null;
  check('redirect recipient: expedition holder leads the pick',
    fighter === vidC, 'fighter=' + fighter + ' want=' + vidC);
  const pC = personOf(Game, vidC);

  // ---- 3. _cxItemPrize: bundle size on / off / alone ----
  // Stub the wave to 4 so the apex tier-4 roll is reachable; the draw
  // sequence is [apex 0.1 (<0.25 -> tier 4), chance 0.0, pool-pick].
  const realWave = Game.unlockedWave;
  try { Game.unlockedWave = function () { return 4; }; } catch (e) {}
  check('wave stub reads 4', Game.unlockedWave() === 4);
  const ac = { variant: 'hardened' };
  const contest = { risk: 'extreme' };

  // (a) GUNRATE=1, BIGBUNDLE unset: the old 2-cell bundle.
  setGunrate(true); setBigbundle(false);
  resetVillager(Game, p);
  Game.villagerGearUp(vid, true);
  const cellsBefore2 = ammoCountOf(p.items, 'fusion_cell');
  let r = withDraws([0.1, 0.0, (searIdx + 0.5) / 18], function () { return Game._cxItemPrize(ac, contest, vid); });
  check('bundle 2 (GUNRATE on, BIGBUNDLE unset): prize granted, 3 draws',
    r.out !== false && r.out !== null && r.used === 3, 'ret=' + JSON.stringify(r.out) + ' draws=' + r.used);
  check('bundle 2: exactly +2 fusion cells beside the searcaster',
    ammoCountOf(p.items, 'fusion_cell') === cellsBefore2 + 2,
    'cells=' + ammoCountOf(p.items, 'fusion_cell') + ' before=' + cellsBefore2);

  // (b) GUNRATE=1, BIGBUNDLE=1: the 6-cell bundle, same draws.
  setBigbundle(true);
  resetVillager(Game, p);
  Game.villagerGearUp(vid, true);
  const cellsBefore6 = ammoCountOf(p.items, 'fusion_cell');
  r = withDraws([0.1, 0.0, (searIdx + 0.5) / 18], function () { return Game._cxItemPrize(ac, contest, vid); });
  check('bundle 6 (GUNRATE + BIGBUNDLE on): prize granted, 3 draws (draw-neutral)',
    r.out !== false && r.out !== null && r.used === 3, 'ret=' + JSON.stringify(r.out) + ' draws=' + r.used);
  check('bundle 6: exactly +6 fusion cells beside the searcaster',
    ammoCountOf(p.items, 'fusion_cell') === cellsBefore6 + 6,
    'cells=' + ammoCountOf(p.items, 'fusion_cell') + ' before=' + cellsBefore6);
  check('bundle 6: searcaster in the pack beside the cells',
    p.items.some(function (e) { return (e.itemId || e.id) === 'searcaster'; }),
    JSON.stringify(p.items.map(function (e) { return e.itemId || e.id; })));

  // (c) Player winner, GUNRATE + BIGBUNDLE on: redirected to the
  // expedition holder with the 6-cell bundle, not the scholar pack.
  resetVillager(Game, pC);
  const scholarInv = (Game.state.scholar || {}).inventory || [];
  const searsBeforeS = scholarInv.filter(function (e) { return (e.itemId || e.id) === 'searcaster'; }).length;
  const cellsBeforeC = ammoCountOf(pC.items, 'fusion_cell');
  r = withDraws([0.1, 0.0, (searIdx + 0.5) / 18], function () { return Game._cxItemPrize(ac, contest, 'player'); });
  check('redirect + bundle 6 (player searcaster, on): prize granted, 3 draws',
    r.out !== false && r.out !== null && r.used === 3, 'ret=' + JSON.stringify(r.out) + ' draws=' + r.used);
  check('redirect + bundle 6: searcaster lands on the expedition holder, not the scholar pack',
    pC.items.some(function (e) { return (e.itemId || e.id) === 'searcaster'; }) &&
    scholarInv.filter(function (e) { return (e.itemId || e.id) === 'searcaster'; }).length === searsBeforeS,
    'holderHas=' + pC.items.some(function (e) { return (e.itemId || e.id) === 'searcaster'; }));
  check('redirect + bundle 6: +6 cells bundled to the holder',
    ammoCountOf(pC.items, 'fusion_cell') === cellsBeforeC + 6,
    'cells=' + ammoCountOf(pC.items, 'fusion_cell') + ' before=' + cellsBeforeC);

  // (d) A fusion_cell prize still redirects as exactly +1 cell —
  // the bundle is searcaster-only, even with BIGBUNDLE=1.
  resetVillager(Game, pC);
  const cellsBeforeC2 = ammoCountOf(pC.items, 'fusion_cell');
  r = withDraws([0.1, 0.0, (cellIdx + 0.5) / 18], function () { return Game._cxItemPrize(ac, contest, 'player'); });
  check('cell prize with BIGBUNDLE on: redirected as exactly +1 cell, 3 draws',
    r.out !== false && r.out !== null && r.used === 3 && ammoCountOf(pC.items, 'fusion_cell') === cellsBeforeC2 + 1,
    'ret=' + JSON.stringify(r.out) + ' draws=' + r.used + ' cells=' + ammoCountOf(pC.items, 'fusion_cell'));

  // (e) An ordinary tier-4 prize stays with the player.
  let ordinaryIdx = -1;
  for (let i = 0; i < contestPool.length; i++) {
    if (contestPool[i] !== 'searcaster' && contestPool[i] !== 'fusion_cell') { ordinaryIdx = i; break; }
  }
  const ordinaryId = contestPool[ordinaryIdx];
  const ordBeforeS = (Game.state.scholar.inventory || []).filter(function (e) { return (e.itemId || e.id) === ordinaryId; }).length;
  const ordBeforeC = pC.items.filter(function (e) { return (e.itemId || e.id) === ordinaryId; }).length;
  r = withDraws([0.1, 0.0, (ordinaryIdx + 0.5) / 18], function () { return Game._cxItemPrize(ac, contest, 'player'); });
  check('no redirect for ordinary prizes with BIGBUNDLE on (player keeps ' + ordinaryId + ')',
    r.out !== false && r.out !== null && r.used === 3 &&
    (Game.state.scholar.inventory || []).filter(function (e) { return (e.itemId || e.id) === ordinaryId; }).length === ordBeforeS + 1 &&
    pC.items.filter(function (e) { return (e.itemId || e.id) === ordinaryId; }).length === ordBeforeC,
    'ret=' + JSON.stringify(r.out) + ' draws=' + r.used);

  // (f) BIGBUNDLE alone does nothing: GUNRATE unset, BIGBUNDLE=1 —
  // the bundle lives under GUNRATE, so 0 cells beside the searcaster.
  setGunrate(false); setBigbundle(true);
  resetVillager(Game, p);
  Game.villagerGearUp(vid, true);
  const cellsBeforeAlone = ammoCountOf(p.items, 'fusion_cell');
  r = withDraws([0.1, 0.0, (searIdx + 0.5) / 15], function () { return Game._cxItemPrize(ac, contest, vid); });
  check('BIGBUNDLE alone (GUNRATE unset): prize granted, 3 draws',
    r.out !== false && r.out !== null && r.used === 3, 'ret=' + JSON.stringify(r.out) + ' draws=' + r.used);
  check('BIGBUNDLE alone: zero cells bundled (bundle lives under GUNRATE)',
    ammoCountOf(p.items, 'fusion_cell') === cellsBeforeAlone,
    'cells=' + ammoCountOf(p.items, 'fusion_cell') + ' before=' + cellsBeforeAlone);
  try { Game.unlockedWave = realWave; } catch (e) {}
  setGunrate(false); setBigbundle(false);

  // ---- 4. the 6-cell gun under CELLGATE=1: hold low, fire high, stay loaded ----
  const moth = (Game.data.monsters || []).find(function (m) { return m.id === 'mirrormoth'; });
  const eulogy = (Game.data.monsters || []).find(function (m) { return m.id === 'eulogy'; });
  check('mirrormoth fixture is wave 1', moth && (moth.wave || 1) === 1, JSON.stringify(moth && moth.wave));
  check('eulogy fixture is wave 4', eulogy && (eulogy.wave || 1) === 4, JSON.stringify(eulogy && eulogy.wave));
  function loosedCount(rec) {
    return (rec && rec.log || []).filter(function (s) { return /^  loosed/.test(String(s)); }).length;
  }
  function armSearcaster(cells) {
    resetVillager(Game, p);
    p.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 }];
    if (cells > 0) p.items.push({ itemId: 'fusion_cell', name: 'Fusion cell', units: cells, kg: 0.4 });
    Game.villagerGearUp(vid, true);
  }
  setCellgate(true);
  armSearcaster(6);
  let recH = null;
  try { recH = Game.fieldFight(vid, moth, null, { allies: 1 }); } catch (e) { console.log('fieldFight error: ' + e.message); }
  check('gate holds the 6-cell volley below wave 4 (0 shots, CELLGATE=1)',
    recH && recH.volley && recH.volley.shots === 0, JSON.stringify(recH && recH.volley));
  check('gate keeps all 6 cells below wave 4 (ammoLeft 6, pack still holds 6)',
    recH && recH.volley && recH.volley.ammoLeft === 6 && ammoCountOf(p.items, 'fusion_cell') === 6,
    'ammoLeft=' + (recH && recH.volley && recH.volley.ammoLeft) + ' cells=' + ammoCountOf(p.items, 'fusion_cell'));
  armSearcaster(6);
  let recW = null;
  try { recW = Game.fieldFight(vid, eulogy, null, { allies: 1 }); } catch (e) { console.log('fieldFight error: ' + e.message); }
  check('gate fires the 6-cell volley at wave 4+ (shots > 0, CELLGATE=1)',
    recW && recW.volley && recW.volley.shots > 0, JSON.stringify(recW && recW.volley));
  check('wave-4+ volley spends exactly its loosed shots in cells',
    recW && recW.volley && loosedCount(recW) > 0 && ammoCountOf(p.items, 'fusion_cell') === 6 - loosedCount(recW),
    'left=' + ammoCountOf(p.items, 'fusion_cell') + ' loosed=' + loosedCount(recW) + ' planned=' + (recW && recW.volley && recW.volley.shots));
  check('after one wave-4 volley the gun is STILL loaded (cells left > 0 — a second volley exists)',
    recW && recW.volley && ammoCountOf(p.items, 'fusion_cell') > 0,
    'cells left=' + ammoCountOf(p.items, 'fusion_cell'));
  setCellgate(false);

  // ---- 5. analyzer selftest (analyze-holdersupply-a --selftest) ----
  console.log('\n=== Analyzer selftest (analyze-holdersupply-a --selftest) ===');
  let anaSelf = null;
  try {
    const anaOut = execFileSync(process.execPath, [path.join(REPO, 'scripts', 'analyze-holdersupply-a.js'), '--selftest'],
      { encoding: 'utf8', timeout: 120000, maxBuffer: 16 * 1024 * 1024, env: process.env });
    console.log('  ' + anaOut.trim().split('\n').filter(Boolean).pop());
    anaSelf = /passed, 0 failed/.test(anaOut);
  } catch (e) {
    console.log('  (analyzer selftest failed: ' + (e && e.message) + ')');
  }
  check('analyzer selftest passes (0 failed — incl. the GO / NO-GO-per-bar judge + pool-presence bar)', anaSelf === true, anaSelf === null ? 'no output' : 'see output above');

  console.log('HOLDERSUPPLY_FAILS ' + failed + (fails.length ? ' ' + fails.join(',') : ''));
  console.log('HOLDERSUPPLY_PASSED ' + passed + '/' + (passed + failed));
  if (failed) process.exitCode = 1;
}

main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });

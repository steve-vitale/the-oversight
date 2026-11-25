#!/usr/bin/env node
// scripts/test-homecraft-gate-a.js — proof test, arm sim-homecraft-gate-a.
//
// Proves the craft-gate SNAPSHOT (prereg §1b) and the §1c classifier wiring:
// the gate helpers read live state (home / cooldown / materials / level /
// attempted-from-cooldown-diff), the snapshot buckets match the frozen
// taxonomy, a live home-duty attempt fires exactly when the gate says
// eligible, and the analyzer classifies driver-shaped corpora into the
// named causes. The driver wraps (in homecraft-gate-driver-a.js oneRun)
// call the original exactly once and draw no RNG; this test proves the
// helpers those wraps use, on a LIVE loaded village.
//
// Fixture (encounter-gear rule, Steve 2026-11-13): the villagers are
// geared wave-4 hunters as the launch leaves them — a bow, a sling, a
// crossbow — not fresh solo scholars.
//
// Usage: node scripts/test-homecraft-gate-a.js [SEED=7]
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo (fixture corpora go to a tmp dir);
// prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { gateRecipes, pileMats, gateOwnMat, gateMatsSufficient,
  gateSnapshotPre, gateSnapshotPost, GATE_MATS,
  createAmmoLedger, ledgerSeed, ammoRangedKit } = require('./homecraft-gate-driver-a');
const { classifyEmpty, gateStats, judgeDiagGate, gateBucketOf, ammoIdFor, gateHash } = require('./analyze-homecraft-gate-a');
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
  try { delete (Game.state.village.away || {})[p.id]; } catch (e) {}
}
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function gateRowFor(pre, vid) { return (pre.carriers || []).find(function (r) { return r.vid === vid; }) || null; }

async function main() {
  const seed = parseInt(process.env.SEED || '7', 10) || 7;
  const { Game } = await loadGame({ seed: seed, mode: 'homecraft-unit' });
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  const p = personOf(Game, vid);
  const vid2 = roster[1] || roster[0];
  const p2 = personOf(Game, vid2);
  const vid3 = roster[2] || roster[0];
  const p3 = personOf(Game, vid3);
  const day = gday(Game);
  console.log('seed=' + seed + ' day=' + day + ' fighter=' + vid + ' second=' + vid2 + ' third=' + vid3 + ' roster=' + roster.length + ' scholar=' + Game.villagerId);
  check('gate helpers load', typeof gateRecipes === 'function' && typeof gateSnapshotPre === 'function' && typeof gateSnapshotPost === 'function' && typeof pileMats === 'function');
  check('analyzer helpers load', typeof classifyEmpty === 'function' && typeof gateBucketOf === 'function' && typeof judgeDiagGate === 'function');
  check('gate material keys are stick/stone/fiber', JSON.stringify(GATE_MATS.slice().sort()) === JSON.stringify(['fiber', 'stick', 'stone']));

  // ---- 1. Recipes: live data, exact materials (prereg §1) ----
  const recipes = gateRecipes(Game);
  check('arrow recipe present: 2 stick + 1 stone + 1 fiber, makes 5',
    !!recipes.arrow && recipes.arrow.makesUnits === 5 &&
    recipes.arrow.materials.stick === 2 && recipes.arrow.materials.stone === 1 && recipes.arrow.materials.fiber === 1,
    JSON.stringify(recipes.arrow));
  check('bolt recipe present: 2 stick + 1 stone, makes 5',
    !!recipes.bolt && recipes.bolt.makesUnits === 5 &&
    recipes.bolt.materials.stick === 2 && recipes.bolt.materials.stone === 1,
    JSON.stringify(recipes.bolt));
  const pile0 = pileMats(Game);
  check('pileMats reads live stash materials as numbers',
    typeof pile0.stick === 'number' && typeof pile0.stone === 'number' && typeof pile0.fiber === 'number',
    JSON.stringify(pile0));

  // ---- 2. Gate buckets, staged one at a time on the live village ----
  // (a) eligible: bow, home, short, no cooldown, pile full.
  resetVillager(Game, p);
  p.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }];
  Game.villagerGearUp(vid, true);
  p.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }];
  setMats(Game, { stick: 20, stone: 20, fiber: 20 });
  let pre = gateSnapshotPre(Game, day);
  let row = gateRowFor(pre, vid);
  check('eligible bucket: home bow-carrier, short, no cooldown, pile full',
    !!row && row.home === true && row.dutyHome === true && row.ammoId === 'arrow' &&
    row.carriedAmmo === 0 && row.cooldownActive === false &&
    row.pileSufficient === true && row.combinedSufficient === true &&
    gateBucketOf(row) === 'eligible',
    JSON.stringify(row));
  check('snapshot is a pure read: two pre snapshots are identical',
    JSON.stringify(gateSnapshotPre(Game, day)) === JSON.stringify(pre),
    'second snapshot differed');
  // (b) no-materials: pile empty + own pack empty.
  setMats(Game, { stick: 0, stone: 0, fiber: 0 });
  pre = gateSnapshotPre(Game, day);
  row = gateRowFor(pre, vid);
  check('no-materials bucket: pile empty, own pack empty',
    !!row && row.pileSufficient === false && row.ownSufficient === false &&
    row.combinedSufficient === false && gateBucketOf(row) === 'no-materials',
    JSON.stringify(row));
  // (c) own-sufficient: own pack covers the recipe, pile empty.
  p.items.push({ itemId: 'stick', material: 'stick', units: 5 });
  p.items.push({ itemId: 'stone', material: 'stone', units: 5 });
  p.items.push({ itemId: 'fiber', material: 'fiber', units: 5 });
  pre = gateSnapshotPre(Game, day);
  row = gateRowFor(pre, vid);
  check('own-sufficient split: own covers it, pile does not, combined does',
    !!row && row.ownSufficient === true && row.pileSufficient === false &&
    row.combinedSufficient === true && gateBucketOf(row) === 'eligible',
    JSON.stringify(row));
  check('gateOwnMat counts own carried materials (stick 5)',
    gateOwnMat(Game, p, 'stick') === 5, 'stick=' + gateOwnMat(Game, p, 'stick'));
  // (d) cooldown: attempt within the last 3 days blocks.
  resetVillager(Game, p);
  p.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }];
  Game.villagerGearUp(vid, true);
  p.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }];
  setMats(Game, { stick: 20, stone: 20, fiber: 20 });
  Game.state.village.arrowCraftCd = Game.state.village.arrowCraftCd || {};
  Game.state.village.arrowCraftCd[vid] = day;
  pre = gateSnapshotPre(Game, day);
  row = gateRowFor(pre, vid);
  check('cooldown bucket: cooldown set today blocks a new attempt',
    !!row && row.cooldownActive === true && gateBucketOf(row) === 'cooldown',
    JSON.stringify(row));
  delete Game.state.village.arrowCraftCd[vid];
  // (e) away: the carrier is not home.
  Game.state.village.away = Game.state.village.away || {};
  Game.state.village.away[vid] = true;
  pre = gateSnapshotPre(Game, day);
  row = gateRowFor(pre, vid);
  check('away bucket: away carrier is not home',
    !!row && row.home === false && row.dutyHome === false && gateBucketOf(row) === 'away',
    JSON.stringify(row));
  delete Game.state.village.away[vid];
  // (f) stocked: a full batch needs nothing.
  p.items.push({ itemId: 'arrow', name: 'Arrow', units: 5, kg: 0.1 });
  pre = gateSnapshotPre(Game, day);
  row = gateRowFor(pre, vid);
  check('stocked bucket: 5 carried arrows need nothing',
    !!row && row.carriedAmmo === 5 && gateBucketOf(row) === 'stocked',
    JSON.stringify(row));
  // (g) sling: no home-duty recipe, so no gate row at all.
  resetVillager(Game, p);
  p.items = [{ itemId: 'sling', name: 'Sling', units: 1, kg: 0.3 }];
  Game.villagerGearUp(vid, true);
  p.items = [{ itemId: 'sling', name: 'Sling', units: 1, kg: 0.3 }];
  pre = gateSnapshotPre(Game, day);
  row = gateRowFor(pre, vid);
  check('sling carrier has no gate row (stone has no home-duty recipe)',
    row === null, JSON.stringify(row));
  check('ammoIdFor sling is stone (the (c1) cause)', ammoIdFor('sling') === 'stone');
  // (h) scholar: the duty never serves the player.
  const sp = personOf(Game, Game.villagerId);
  sp.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }];
  Game.villagerGearUp(Game.villagerId, true);
  sp.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }];
  setMats(Game, { stick: 20, stone: 20, fiber: 20 });
  pre = gateSnapshotPre(Game, day);
  row = gateRowFor(pre, Game.villagerId);
  check('scholar row: isScholar true, dutyHome false (duty excludes the player)',
    !!row && row.isScholar === true && row.dutyHome === false,
    JSON.stringify(row));
  sp.items = [];

  // ---- 3. Live attempt: eligible gate fires, cooldown then blocks ----
  resetVillager(Game, p2);
  p2.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }];
  Game.villagerGearUp(vid2, true);
  p2.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }];
  Game.state.village.ammoCraft = Game.state.village.ammoCraft || {};
  Game.state.village.ammoCraft[vid2] = { arrow: 2 }; // learned: 85%
  setMats(Game, { stick: 50, stone: 50, fiber: 50 });
  const savedRandom = Math.random;
  Math.random = () => 0.1; // learned 85% craft succeeds
  let preLive = gateSnapshotPre(Game, day);
  let rowLive = gateRowFor(preLive, vid2);
  check('live fixture is eligible before the call',
    !!rowLive && gateBucketOf(rowLive) === 'eligible' && rowLive.level === 2,
    JSON.stringify(rowLive));
  let made = null;
  try { made = Game.villagerAmmoCraftDay(); } finally { Math.random = savedRandom; }
  const postLive = gateSnapshotPost(Game, day, preLive, {});
  rowLive = gateRowFor(postLive, vid2);
  // The post gains map is the wrap's job; here the arrows in the pack are
  // the ground truth for madeBatch, so re-derive it from the pack diff.
  const arrowsNow = ammoCountOf(p2.items, 'arrow');
  check('live home-duty attempt fires on an eligible gate (batch made)',
    made >= 1 && arrowsNow === 5, 'made=' + made + ' arrows=' + arrowsNow);
  check('post snapshot records attempted from the cooldown diff',
    !!rowLive && rowLive.attempted === true, JSON.stringify(rowLive));
  // Second call the same day: cooldown blocks, nothing new is made.
  preLive = gateSnapshotPre(Game, day);
  rowLive = gateRowFor(preLive, vid2);
  check('cooldown is set after the attempt (same-day second call blocked)',
    !!rowLive && rowLive.cooldownActive === true && gateBucketOf(rowLive) === 'cooldown',
    JSON.stringify(rowLive));
  Math.random = () => 0.1;
  try { Game.villagerAmmoCraftDay(); } finally { Math.random = savedRandom; }
  check('second same-day call crafts nothing more for this villager',
    ammoCountOf(p2.items, 'arrow') === 5, 'arrows=' + ammoCountOf(p2.items, 'arrow'));

  // ---- 4. Live: a failed blind attempt still sets the cooldown ----
  resetVillager(Game, p3);
  p3.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }];
  Game.villagerGearUp(vid3, true);
  p3.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }];
  Game.state.village.ammoCraft[vid3] = { arrow: 1 }; // blind: 35%
  setMats(Game, { stick: 50, stone: 50, fiber: 50 });
  preLive = gateSnapshotPre(Game, day);
  rowLive = gateRowFor(preLive, vid3);
  check('blind fixture is eligible with level 1',
    !!rowLive && gateBucketOf(rowLive) === 'eligible' && rowLive.level === 1,
    JSON.stringify(rowLive));
  Math.random = () => 0.9; // blind 35% craft fails
  try { Game.villagerAmmoCraftDay(); } finally { Math.random = savedRandom; }
  const postFail = gateSnapshotPost(Game, day, preLive, {});
  rowLive = gateRowFor(postFail, vid3);
  check('failed attempt still sets the cooldown (attempted true, 0 arrows)',
    !!rowLive && rowLive.attempted === true && ammoCountOf(p3.items, 'arrow') === 0,
    JSON.stringify(rowLive) + ' arrows=' + ammoCountOf(p3.items, 'arrow'));

  // ---- 5. Analyzer reads driver-shaped corpora into the named causes ----
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fc-homecraft-proof-'));
  const cdir = path.join(tmp, 'corpus');
  fs.mkdirSync(cdir);
  function crow(vid, o) {
    return Object.assign({ vid: vid, isScholar: false, home: true, dutyHome: true,
      rangedId: 'bow', rangedIdPost: 'bow', ammoId: 'arrow', carriedAmmo: 0,
      cooldownActive: false, cooldownDay: null, level: 1,
      ownSufficient: false, pileSufficient: false, combinedSufficient: false,
      recipePresent: true, attempted: false, madeBatch: false }, o);
  }
  const seedDoc = {
    seed: 999001, days: 150, gameDays: 150, scaleRank: 'regional', won: false,
    maxWave: 4, endReason: 'survived', instrumentErrors: [],
    scholarId: 'scholar1',
    craftGate: { recipes: { arrow: { materials: { stick: 2, stone: 1, fiber: 1 }, makesUnits: 5 }, bolt: { materials: { stick: 2, stone: 1 }, makesUnits: 5 } },
      days: [
        { day: 1, pile: { stick: 0, stone: 0, fiber: 0 }, carriers: [crow('fA', { combinedSufficient: false }), crow('fB', { home: false })] },
        { day: 2, pile: { stick: 0, stone: 0, fiber: 0 }, carriers: [crow('fA', { combinedSufficient: false }), crow('fB', { home: false })] },
        { day: 3, pile: { stick: 0, stone: 0, fiber: 0 }, carriers: [crow('fA', { combinedSufficient: false }), crow('fB', { home: false })] },
        { day: 4, pile: { stick: 0, stone: 0, fiber: 0 }, carriers: [crow('fA', { combinedSufficient: false }), crow('fB', { home: false })] },
        { day: 5, pile: { stick: 0, stone: 0, fiber: 0 }, carriers: [crow('fA', { combinedSufficient: false }), crow('fB', { home: false })] },
      ] },
    v4encounters: [
      { day: 10, vid: 'fA', mid: 'audit', wave: 4, origin: 'expedition', allyVids: [], outcome: 'vFlee', rounds: 2, mDealt: 60, mHpStart: 1100, vTaken: 70, rangedId: 'bow', ammoAtEntry: 0, ammoProv: [], alliesAmmo: [], volley: null, log: [] },
      { day: 11, vid: 'fB', mid: 'eulogy', wave: 4, origin: 'aid', allyVids: [], outcome: 'vFlee', rounds: 2, mDealt: 50, mHpStart: 1200, vTaken: 90, rangedId: 'bow', ammoAtEntry: 0, ammoProv: [], alliesAmmo: [], volley: null, log: [] },
      { day: 12, vid: 'fC', mid: 'suburb', wave: 4, origin: 'world-tick', allyVids: [], outcome: 'vFlee', rounds: 2, mDealt: 40, mHpStart: 1000, vTaken: 60, rangedId: 'bow', ammoAtEntry: 0, ammoProv: [], alliesAmmo: [], volley: null, log: [] },
    ],
    ammoLedger: { events: [
      { seq: 1, day: 6, kind: 'production', vid: 'fC', ammoId: 'arrow', units: 5, source: 'home-duty', loc: 'carried' },
    ], other: [], unattributedSpend: [], transfers: [], spends: [],
      counters: { homeDutyBatches: 1, homeDutyCalls: 5, departureCalls: 0, departureCraftAttempts: 0, departureCraftOk: 0, departureStones: 0, departureStashMoved: 0, lootDrops: 0, lootAmmoDrops: 0 },
      finalProv: {} },
    v4departs: [], v4gates: [], deaths: [], daily: [], samples: { villagers: [] },
  };
  fs.writeFileSync(path.join(cdir, 's999001.json'), JSON.stringify(seedDoc));
  const C = classifyEmpty(cdir);
  check('classifier on driver-shaped corpus: 3 empty, 1 received (d), 2 never',
    C.emptyFighters === 3 && C.received === 1 && C.neverReceived === 2,
    JSON.stringify({ e: C.emptyFighters, r: C.received, n: C.neverReceived }));
  check('causes named: fA (a) no-materials, fB (b) rarely-home',
    C.byCause['(a) no-materials'] === 1 && C.byCause['(b) rarely-home'] === 1,
    JSON.stringify(C.byCause));
  const G = gateStats(cdir);
  check('gate stats on driver-shaped corpus: 5 pile days, all below arrow need',
    G.pileDays === 5 && G.pileDaysBelowArrowNeed === 5 && G.carrierRows === 10,
    JSON.stringify({ d: G.pileDays, b: G.pileDaysBelowArrowNeed, r: G.carrierRows }));
  const gh1 = gateHash(seedDoc);
  check('gateHash stable on identical input', gh1 === gateHash(JSON.parse(JSON.stringify(seedDoc))));
  const jg = judgeDiagGate(C, G, { errors: 0, selftestPass: true, proofPass: true });
  check('judge thin-pool on the 2-fighter proof corpus (never < 10)',
    jg.verdict === 'DIAG-NO-GO' && jg.kind === 'THIN-POOL', JSON.stringify(jg));
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}

  console.log('HOMECRAFT_FAILS ' + failed + (fails.length ? ' ' + fails.join(',') : ''));
  console.log('HOMECRAFT_PASSED ' + passed + '/' + (passed + failed));
  if (failed) process.exitCode = 1;
}

main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });

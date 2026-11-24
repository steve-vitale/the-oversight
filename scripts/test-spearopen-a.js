#!/usr/bin/env node
// scripts/test-spearopen-a.js — proof test, arm sim-spearopen-a (DIAG).
//
// Proves the spear-opening measurement chain on a LIVE loaded game:
//   1. Spear defs carry no weapon.ammo (melee, range 2) — the desk
//      diagnosis, pinned at the data level.
//   2. A spear sits in the ranged slot (rangedWeaponOf returns it)
//      but cannot volley (volleyWeaponOf returns null).
//   3. A live fieldFight with a spear-only carrier vs a wave-4
//      monster: rec.volley === null, no "no arrows" dry line — the
//      opening is silently skipped, not narrated.
//   4. Controls: bow + arrows volleys (shots >= 1, ammo spent);
//      bow + 0 arrows is blocked with the honest dry line.
//   5. Gate telemetry: villagerStageBow bumps spearSeen on every
//      spear departure and spearPassed only with SPEARGATE=1.
//   6. The analyzer classifies the live records exactly as the
//      prereg's taxonomy requires (spear -> no-volley-path).
//
// Fixture (encounter-gear rule, Steve 2026-11-13): a geared wave-4
// hunter as the launch leaves them — a spear or a bow with arrows —
// never a fresh un-geared solo scholar.
//
// Usage: node scripts/test-spearopen-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo; prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
const path = require('path');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { classifyOpening } = require('./analyze-spearopen-a');
const spearDriver = require('./spearopen-driver-a');

let passed = 0, failed = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function personOf(Game, vid) {
  try { if (Game.getPerson) { const p = Game.getPerson(vid); if (p) return p; } } catch (e) {}
  return ((Game.data.villagers || []).find(x => x.id === vid) || {});
}
function setHealth(Game, vid, hp) {
  (Game.state.village.health = Game.state.village.health || {})[vid] = hp;
}
function setMats(Game, mats) {
  try { const st = Game.stashState(); st.materials = Object.assign({}, mats); } catch (e) {}
  try { Game.state.village.stash.materials = Object.assign({}, mats); } catch (e2) {}
}
function emptyArmory(Game) {
  try { const st = Game.stashState ? Game.stashState() : null; const pile = (st && st.weapons) || []; pile.length = 0; } catch (e) {}
}
function resetVillager(Game, p) {
  p.items = []; p.equipped = {}; p.stashed = [];
}
function ammoCount(items, ammoId) {
  let n = 0;
  for (const e of (items || [])) {
    const id = (typeof e === 'string') ? e : (e && (e.itemId || e.id || e.material));
    if (id === ammoId) n += (typeof e === 'string') ? 1 : (e.units || 1);
  }
  return n;
}

async function main() {
  const { Game, loadFails } = await loadGame({ seed: 7, mode: 'spearopen-unit' });
  if (loadFails && loadFails.length) { console.log('  FAIL module load: ' + loadFails.join('; ')); process.exitCode = 1; return; }
  await quietLog(async () => { await setupGame(Game); });
  const S = globalThis.Scattering || {};
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  if (roster.length < 1) { console.log('  FAIL need 1+ NPCs, have ' + roster.length); process.exitCode = 1; return; }
  const vid = roster[0];
  const p = personOf(Game, vid);
  const mdef = (id) => (Game.data.monsters || []).find(m => m.id === id);
  const defOf = (id) => (Game.data.items || []).find(d => d.id === id);
  const eulogy = mdef('eulogy');
  console.log('fighter=' + vid + ' roster=' + roster.length + ' monster=eulogy(wave ' + (eulogy && eulogy.wave) + ', speed ' + (eulogy && eulogy.speed) + ')');
  check('eulogy is a wave-4 monster', !!eulogy && eulogy.wave === 4);

  // ---- 1. Spear defs: melee, range 2, NO ammo (the desk diagnosis) ----
  const SPEARS = ['hunting_spear', 'fire_hardened_spear', 'shard_spear', 'starfall_lance', 'godslayer_spear'];
  for (const id of SPEARS) {
    const d = defOf(id);
    check('def ' + id + ' is melee range-2 with no ammo',
      !!d && d.weapon && d.weapon.type === 'melee' && d.weapon.range === 2 && !d.weapon.ammo,
      JSON.stringify(d && d.weapon));
  }
  check('def bow carries ammo arrow', (defOf('bow') || {}).weapon && defOf('bow').weapon.ammo === 'arrow');

  // ---- 2. Slot reads: spear sits ranged, but cannot volley ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'hunting_spear', units: 1 }];
  Game.villagerGearUp(vid, true);
  const slotRw = S.equipment.rangedWeaponOf(p, Game.data.items);
  check('spear-only carrier: ranged slot holds the spear',
    !!slotRw && (slotRw.itemId || slotRw.id) === 'hunting_spear', JSON.stringify(slotRw));
  const volleyRw = S.equipment.volleyWeaponOf(p, Game.data.items);
  check('spear-only carrier: volleyWeaponOf is null (no ammo def)', volleyRw === null, JSON.stringify(volleyRw));
  resetVillager(Game, p);
  p.items = [{ itemId: 'bow', units: 1 }, { itemId: 'arrow', units: 5 }];
  Game.villagerGearUp(vid, true);
  check('bow carrier: volleyWeaponOf returns the bow',
    (S.equipment.volleyWeaponOf(p, Game.data.items) || {}).itemId === 'bow' ||
    (S.equipment.volleyWeaponOf(p, Game.data.items) || {}).id === 'bow');

  // ---- 3. Live fight, spear-only carrier: volley null, silent ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'hunting_spear', units: 1 }];
  Game.villagerGearUp(vid, true);
  setHealth(Game, vid, 100);
  const rSpear = Game.fieldFight(vid, eulogy, null, { rng: mulberry32(7) });
  check('spear fight: rec.volley is null (opening never fires)', rSpear.volley === null, JSON.stringify(rSpear.volley));
  check('spear fight: no dry-ammo line (the skip is silent, not narrated)',
    !(rSpear.log || []).some(function (l) { return /but no (arrows|stones|bolts|fusion cells)/i.test(String(l)); }),
    (rSpear.log || []).slice(0, 4).join(' | '));
  const spearRow = { rangedId: 'hunting_spear', ammoAtEntry: 0, volley: rSpear.volley, log: rSpear.log || [] };
  check('analyzer classifies the live spear record as no-volley-path',
    classifyOpening(spearRow, (function () { const m = {}; for (const d of Game.data.items) m[d.id] = d; return m; })()).cls === 'no-volley-path');

  // ---- 4a. Control: bow + 5 arrows volleys, ammo spent ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'bow', units: 1 }, { itemId: 'arrow', units: 5 }];
  Game.villagerGearUp(vid, true);
  setHealth(Game, vid, 100);
  const before = ammoCount(p.items, 'arrow');
  const rBow = Game.fieldFight(vid, eulogy, null, { rng: mulberry32(7) });
  check('bow fight: volley fires (shots >= 1)', !!rBow.volley && rBow.volley.shots >= 1, JSON.stringify(rBow.volley));
  check('bow fight: volley spends real ammo (' + before + ' -> ' + ammoCount(p.items, 'arrow') + ')',
    ammoCount(p.items, 'arrow') === before - (rBow.volley ? rBow.volley.shots : 0),
    'before ' + before + ' after ' + ammoCount(p.items, 'arrow'));
  const bowRow = { rangedId: 'bow', ammoAtEntry: 5, volley: rBow.volley, log: rBow.log || [] };
  check('analyzer classifies the live bow record as fired',
    classifyOpening(bowRow, (function () { const m = {}; for (const d of Game.data.items) m[d.id] = d; return m; })()).cls === 'fired');

  // ---- 4b. Control: bow + 0 arrows is blocked, honestly narrated ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'bow', units: 1 }];
  Game.villagerGearUp(vid, true);
  setHealth(Game, vid, 100);
  const rDry = Game.fieldFight(vid, eulogy, null, { rng: mulberry32(7) });
  check('dry bow fight: volley is shots 0', !!rDry.volley && rDry.volley.shots === 0, JSON.stringify(rDry.volley));
  check('dry bow fight: the "no arrows" line is narrated',
    (rDry.log || []).some(function (l) { return /but no arrows/i.test(String(l)); }),
    (rDry.log || []).slice(0, 4).join(' | '));
  const dryRow = { rangedId: 'bow', ammoAtEntry: 0, volley: rDry.volley, log: rDry.log || [] };
  check('analyzer classifies the live dry-bow record as blocked-empty-ammo',
    classifyOpening(dryRow, (function () { const m = {}; for (const d of Game.data.items) m[d.id] = d; return m; })()).cls === 'blocked-empty-ammo');

  // ---- 5. Gate telemetry (villagerStageBow) ----
  delete process.env.BOWOPEN; delete process.env.SPEARGATE;
  Game.state.village.bowOpen = undefined; Game.state.village.bowOpenByVid = undefined;
  process.env.BOWOPEN = '1'; process.env.SPEARGATE = '1';
  resetVillager(Game, p);
  p.items = [{ itemId: 'hunting_spear', units: 1 }];
  Game.villagerGearUp(vid, true);
  setMats(Game, { wood: 0, vine: 0, branch: 0, stick: 0, stone: 0, fiber: 0 });
  emptyArmory(Game);
  const seen0 = (Game.state.village.bowOpen || {}).spearSeen | 0;
  const passed0 = (Game.state.village.bowOpen || {}).spearPassed | 0;
  const rGate = Game.villagerStageBow(vid);
  const seen1 = (Game.state.village.bowOpen || {}).spearSeen | 0;
  const passed1 = (Game.state.village.bowOpen || {}).spearPassed | 0;
  check('SPEARGATE=1: stageBow bumps spearSeen on a spear departure', seen1 === seen0 + 1, seen0 + ' -> ' + seen1);
  check('SPEARGATE=1: stageBow bumps spearPassed (gate passes it on)', passed1 === passed0 + 1, passed0 + ' -> ' + passed1);
  check('SPEARGATE=1, no source anywhere: outcome is noSource', rGate.source === 'noSource', JSON.stringify(rGate));
  // SPEARGATE off: seen bumps, passed does not; the spear reads as alreadyHad.
  delete process.env.SPEARGATE;
  resetVillager(Game, p);
  p.items = [{ itemId: 'hunting_spear', units: 1 }];
  Game.villagerGearUp(vid, true);
  const rOff = Game.villagerStageBow(vid);
  const seen2 = (Game.state.village.bowOpen || {}).spearSeen | 0;
  const passed2 = (Game.state.village.bowOpen || {}).spearPassed | 0;
  check('SPEARGATE off: spearSeen still bumps (pure observation)', seen2 === seen1 + 1, seen1 + ' -> ' + seen2);
  check('SPEARGATE off: spearPassed does NOT bump', passed2 === passed1, passed1 + ' -> ' + passed2);
  check('SPEARGATE off: spear carrier reads as alreadyHad with the spear id',
    rOff.source === 'alreadyHad' && (Game.state.village.bowOpenByVid[vid] || {}).itemId === 'hunting_spear',
    JSON.stringify(rOff) + ' byVid=' + JSON.stringify(Game.state.village.bowOpenByVid[vid]));
  delete process.env.BOWOPEN; delete process.env.SPEARGATE;

  // ---- 6. Driver + analyzer modules load with the expected surface ----
  check('driver exports oneRun + classifiers', typeof spearDriver.oneRun === 'function' &&
    typeof spearDriver.classifySeedPath === 'function' && typeof spearDriver.fightOrigin === 'function');
  check('driver is the spearopen instrument (SEEDLAND hard-on)', spearDriver.SEEDLAND === true);

  console.log('test-spearopen-a: ' + passed + ' passed, ' + failed + ' failed' + (failed ? ' — ' + fails.join('; ') : ''));
  process.exitCode = failed ? 1 : 0;
}

main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

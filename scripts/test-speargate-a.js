#!/usr/bin/env node
// scripts/test-speargate-a.js — proof test, arm sim-speargate-a (finding #2590).
//
// Proves the spear gate: ranged-gated mechanisms must check weapon.ammo,
// not the slot. A spear (melee type, range 2, no ammo) sits in the ranged
// slot when its carrier holds no real ranged weapon; the staging gate must
// NOT count it as a ranged weapon (no alreadyHad), while the volley,
// pocketAmmo, ARMED bar and strike fold-in are audited-and-left-alone
// (they already ammo-gate, or are deliberately slot-based — see the
// prereg audit table) and must not move. Also proves #2593: the field-fight
// "no arrows" line names the weapon's actual ammo.
//
// Fixture (encounter-gear rule, Steve 2026-11-13): a LIVE loaded village
// with real roster/gear — a geared fighter (machete + hunting spear, the
// spear in the ranged slot, exactly the bowopen population: 6/27 engaged
// meetings) with a party of two armed companions — never a fresh un-geared
// solo scholar. The pilot's per-seed corpora carry the real encounter
// averages beside the verdict.
//
// Usage: BOWOPEN=1 node scripts/test-speargate-a.js
// (BOWOPEN=1 required: the gate fix lives inside villagerStageBow, which
// is itself BOWOPEN-gated. SPEARGATE is toggled inside the test.)
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo; prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
const path = require('path');
const fs = require('fs');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
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
function rangedOf(Game, p) {
  try {
    const S = globalThis.Scattering || {};
    if (S.equipment && S.equipment.rangedWeaponOf) return S.equipment.rangedWeaponOf(p, Game.data.items);
  } catch (e) {}
  return (p.equipped || {}).ranged || null;
}
function volleyOf(Game, p) {
  try {
    const S = globalThis.Scattering || {};
    if (S.equipment && S.equipment.volleyWeaponOf) return S.equipment.volleyWeaponOf(p, Game.data.items);
  } catch (e) {}
  return null;
}
function wbOf(Game, p) {
  const S = globalThis.Scattering || {};
  if (!S.equipment || !S.equipment.weaponBonusOf) return null;
  const m = S.equipment.weaponBonusOf(p, Game.data.items, 'melee') || 0;
  const r = S.equipment.weaponBonusOf(p, Game.data.items, 'ranged') || 0;
  return Math.round((m + r) / 2);
}
function ammoCount(items, ammoId) {
  let n = 0;
  for (const e of (items || [])) {
    const id = (typeof e === 'string') ? e : (e && (e.itemId || e.id || e.material));
    if (id === ammoId) n += (typeof e === 'string') ? 1 : (e.units || 1);
  }
  return n;
}
function setMats(Game, mats) {
  try { const st = Game.stashState(); st.materials = Object.assign({}, mats); } catch (e) {}
  try { Game.state.village.stash.materials = Object.assign({}, mats); } catch (e2) {}
}
function armoryWeapons(Game) {
  try { const st = Game.stashState ? Game.stashState() : null; return (st && st.weapons) || []; }
  catch (e) { return []; }
}
function resetVillager(Game, p) {
  p.items = []; p.equipped = {}; p.stashed = [];
  try { Game.state.village.weaponCraft = Game.state.village.weaponCraft || {}; delete Game.state.village.weaponCraft[p.id]; } catch (e) {}
}
function bowOpenCounters(Game) {
  const b = Game.state.village.bowOpen || {};
  return { alreadyHad: b.alreadyHad | 0, fromStash: b.fromStash | 0, fromArmory: b.fromArmory | 0,
    crafted: b.crafted | 0, craftedFail: b.craftedFail | 0, noSource: b.noSource | 0,
    spearSeen: b.spearSeen | 0, spearPassed: b.spearPassed | 0 };
}
function gearFighter(Game, p) {
  // Geared wave-4 hunter shape: machete in hand, hunting spear in the
  // ranged slot (autoEquip seats it there — no real ranged weapon is
  // carried, the sim-meleefirst-b rule). No ammo anywhere: the spear
  // can never volley.
  p.items = [
    { itemId: 'trailblazer_machete', name: 'Trailblazer machete', units: 1, kg: 0.8 },
    { itemId: 'hunting_spear', name: 'Hunting spear', units: 1, kg: 1.2 },
  ];
  p.stashed = [];
  Game.villagerGearUp(p.id, true);
}
function gearCompanion(Game, p) {
  p.items = [{ itemId: 'trailblazer_machete', name: 'Trailblazer machete', units: 1, kg: 0.8 }];
  p.stashed = [];
  Game.villagerGearUp(p.id, true);
}

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'speargate-unit' });
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  const c1 = roster[1], c2 = roster[2];
  const p = personOf(Game, vid);
  const p1 = personOf(Game, c1), p2 = personOf(Game, c2);
  console.log('fighter=' + vid + ' companions=' + c1 + ',' + c2 + ' roster=' + roster.length);
  check('villagerStageBow exists', typeof Game.villagerStageBow === 'function');
  check('volleyWeaponOf exists on S.equipment', !!(globalThis.Scattering && globalThis.Scattering.equipment && globalThis.Scattering.equipment.volleyWeaponOf));
  process.env.BOWOPEN = '1';

  // ---- 0. Party fixture: fighter + two armed companions ----
  gearFighter(Game, p);
  gearCompanion(Game, p1);
  gearCompanion(Game, p2);
  const rw0 = rangedOf(Game, p);
  check('fixture: spear sits in the ranged slot', rw0 && (rw0.itemId || rw0.id) === 'hunting_spear', JSON.stringify(rw0));
  check('fixture: machete sits in the melee slot beside it', !!(p.equipped.melee || p.equipped.weapon), JSON.stringify(p.equipped));
  check('fixture: both companions are armed', !!(rangedOf(Game, p1) || p1.equipped.melee) && !!(rangedOf(Game, p2) || p2.equipped.melee));

  // ---- 1. volleyWeaponOf: null for every spear, the def for every ammo weapon ----
  const S = globalThis.Scattering || {};
  const spears = ['hunting_spear', 'fire_hardened_spear', 'shard_spear', 'godslayer_spear'];
  let spearOk = true;
  for (const sid of spears) {
    p.equipped = { ranged: { itemId: sid } };
    if (volleyOf(Game, p) !== null) spearOk = false;
  }
  check('volleyWeaponOf is null for all 4 spears in the ranged slot', spearOk);
  const ammoWeapons = (Game.data.items || []).filter(d => d.weapon && d.weapon.ammo).map(d => d.id);
  let ammoOk = ammoWeapons.length === 8;
  for (const wid of ammoWeapons) {
    p.equipped = { ranged: { itemId: wid } };
    const v = volleyOf(Game, p);
    if (!v || (v.itemId || v.id) !== wid) ammoOk = false;
  }
  check('volleyWeaponOf returns the def for all 8 ammo-bearing weapons', ammoOk, 'ammoWeapons=' + JSON.stringify(ammoWeapons));
  check('volleyWeaponOf is null with no defs (fail-closed)', (function () {
    try { return S.equipment.volleyWeaponOf(p, null) === null; } catch (e) { return false; }
  })());

  // ---- 2. OLD-CODE CONTROL: SPEARGATE off = spear counts as ranged ----
  delete process.env.SPEARGATE;
  gearFighter(Game, p);
  setMats(Game, { wood: 0, vine: 0, branch: 0, stick: 0, stone: 0, fiber: 0 });
  try { armoryWeapons(Game).length = 0; } catch (e) {}
  const beforeOff = bowOpenCounters(Game);
  const rOff = Game.villagerStageBow(vid);
  const afterOff = bowOpenCounters(Game);
  check('CONTROL (flag off): spear-holder is alreadyHad', rOff.source === 'alreadyHad' && rOff.staged === false, JSON.stringify(rOff));
  check('CONTROL: alreadyHad records the spear id', (Game.state.village.bowOpenByVid[vid] || {}).itemId === 'hunting_spear', JSON.stringify(Game.state.village.bowOpenByVid[vid]));
  check('CONTROL: spearSeen bumps, spearPassed does not', afterOff.spearSeen === beforeOff.spearSeen + 1 && afterOff.spearPassed === beforeOff.spearPassed,
    'before=' + JSON.stringify(beforeOff) + ' after=' + JSON.stringify(afterOff));
  check('CONTROL: the spear stays in the ranged slot', (rangedOf(Game, p) || {}).itemId === 'hunting_spear' || (rangedOf(Game, p) || {}).id === 'hunting_spear');

  // ---- 3. THE FIX: SPEARGATE on = the same fighter is passed over ----
  process.env.SPEARGATE = '1';
  gearFighter(Game, p);
  setMats(Game, { wood: 0, vine: 0, branch: 0, stick: 0, stone: 0, fiber: 0 });
  try { armoryWeapons(Game).length = 0; } catch (e) {}
  const wbBefore = wbOf(Game, p);
  const beforeOn = bowOpenCounters(Game);
  const rOn = Game.villagerStageBow(vid);
  const afterOn = bowOpenCounters(Game);
  check('FIX: spear-holder is NOT alreadyHad', rOn.source !== 'alreadyHad', JSON.stringify(rOn));
  check('FIX: spear-holder goes to the sources (noSource — empty shelf)', rOn.source === 'noSource' && rOn.staged === false, JSON.stringify(rOn));
  check('FIX: spearSeen and spearPassed both bump', afterOn.spearSeen === beforeOn.spearSeen + 1 && afterOn.spearPassed === beforeOn.spearPassed + 1,
    'before=' + JSON.stringify(beforeOn) + ' after=' + JSON.stringify(afterOn));
  check('FIX: no alreadyHad-with-spear recorded', (Game.state.village.bowOpenByVid[vid] || {}).source === 'noSource', JSON.stringify(Game.state.village.bowOpenByVid[vid]));
  check('FIX: the spear stays in the ranged slot (nothing unequipped)', (rangedOf(Game, p) || {}).itemId === 'hunting_spear' || (rangedOf(Game, p) || {}).id === 'hunting_spear');
  check('FIX: fold-in unchanged by the gate (wb ' + wbBefore + ' before and after)', wbOf(Game, p) === wbBefore, 'wb=' + wbOf(Game, p));

  // ---- 4. A real bow still counts — equipped, and from the pack ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }];
  Game.villagerGearUp(p.id, true);
  const rBow = Game.villagerStageBow(vid);
  check('bow-holder is still alreadyHad (flag on)', rBow.source === 'alreadyHad' && rBow.staged === false, JSON.stringify(rBow));
  resetVillager(Game, p);
  p.items = [
    { itemId: 'trailblazer_machete', name: 'Trailblazer machete', units: 1, kg: 0.8 },
    { itemId: 'hunting_spear', name: 'Hunting spear', units: 1, kg: 1.2 },
    { itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 },
  ];
  Game.villagerGearUp(p.id, true);
  const rPack = Game.villagerStageBow(vid);
  check('spear-holder WITH a bow in the pack is alreadyHad via the bow', rPack.source === 'alreadyHad' && (Game.state.village.bowOpenByVid[vid] || {}).itemId === 'bow',
    JSON.stringify(rPack) + ' ' + JSON.stringify(Game.state.village.bowOpenByVid[vid]));

  // ---- 5. Audited-and-left-alone: ARMED bar still counts the spear-holder ----
  gearFighter(Game, p);
  let armedOff = null, armedOn = null;
  try { if (typeof Game.objVillagerArmed === 'function') armedOff = Game.objVillagerArmed(vid); } catch (e) {}
  delete process.env.SPEARGATE;
  try { if (typeof Game.objVillagerArmed === 'function') armedOff = Game.objVillagerArmed(vid); } catch (e) {}
  process.env.SPEARGATE = '1';
  try { if (typeof Game.objVillagerArmed === 'function') armedOn = Game.objVillagerArmed(vid); } catch (e) {}
  check('ARMED bar counts the spear-holder armed on both legs', armedOff === true && armedOn === true, 'off=' + armedOff + ' on=' + armedOn);

  // ---- 6. Volley still never fires for a spear-holder (live field fight) ----
  gearFighter(Game, p);
  const mdef = (Game.data.monsters || []).find(m => m.id === 'eulogy') || (Game.data.monsters || [])[0];
  let recSpear = null;
  try { recSpear = Game.fieldFight(vid, mdef, null, { allies: 1 }); } catch (e) { console.log('fieldFight error: ' + e.message); }
  check('spear-holder opens with no volley (rec.volley null)', recSpear && recSpear.volley === null, JSON.stringify(recSpear && recSpear.volley));
  check('spear-holder fight logs no "no arrows" line', !(recSpear && (recSpear.log || []).some(function (l) { return /no arrows|no fusion cells|no stones|no bolts/i.test(String(l)); })),
    JSON.stringify((recSpear && recSpear.log) || []));

  // ---- 7. #2593: the "no arrows" line names the actual ammo ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 }];
  Game.villagerGearUp(p.id, true);
  check('fixture: searcaster sits in the ranged slot', (rangedOf(Game, p) || {}).itemId === 'searcaster');
  let recCell = null;
  try { recCell = Game.fieldFight(vid, mdef, null, { allies: 0 }); } catch (e) { console.log('fieldFight error: ' + e.message); }
  const cellLine = (recCell && (recCell.log || []).find(function (l) { return /but no /i.test(String(l)); })) || null;
  check('#2593: searcaster with no ammo says "fusion cells", not "arrows"', cellLine != null && /fusion cells/i.test(cellLine) && !/arrows/i.test(cellLine), String(cellLine));
  resetVillager(Game, p);
  p.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }];
  Game.villagerGearUp(p.id, true);
  let recBow = null;
  try { recBow = Game.fieldFight(vid, mdef, null, { allies: 0 }); } catch (e) { console.log('fieldFight error: ' + e.message); }
  const bowLine = (recBow && (recBow.log || []).find(function (l) { return /but no /i.test(String(l)); })) || null;
  check('#2593: bow with no ammo still says "arrows"', bowLine != null && /arrows/i.test(bowLine), String(bowLine));
  resetVillager(Game, p);
  p.items = [{ itemId: 'crossbow', name: 'Crossbow', units: 1, kg: 1.0 }];
  Game.villagerGearUp(p.id, true);
  let recBolt = null;
  try { recBolt = Game.fieldFight(vid, mdef, null, { allies: 0 }); } catch (e) { console.log('fieldFight error: ' + e.message); }
  const boltLine = (recBolt && (recBolt.log || []).find(function (l) { return /but no /i.test(String(l)); })) || null;
  check('#2593: crossbow with no ammo says "crossbow bolts"', boltLine != null && /crossbow bolts/i.test(boltLine), String(boltLine));

  // ---- 8. BOWOPEN still gates staging (the fix does not bypass it) ----
  delete process.env.BOWOPEN;
  process.env.SPEARGATE = '1';
  gearFighter(Game, p);
  const rNoBow = Game.villagerStageBow(vid);
  check('BOWOPEN off still stages nothing even with SPEARGATE on', rNoBow.staged === false && rNoBow.source === null, JSON.stringify(rNoBow));
  process.env.BOWOPEN = '1';

  // ---- 9. Scope guards: SPEARGATE lives in stageBow only ----
  const gameSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
  const gpSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'godpath.js'), 'utf8');
  const equipSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'equipment.js'), 'utf8');
  const speargateHits = (gameSrc.match(/SPEARGATE/g) || []).length;
  check('SPEARGATE gate lives in game.js stageBow (gate + doc mentions only)', speargateHits >= 1 && speargateHits <= 6 && gameSrc.includes("process.env.SPEARGATE === '1'"), 'hits=' + speargateHits);
  check('SPEARGATE never appears in godpath.js', !gpSrc.includes('SPEARGATE'));
  check('volleyWeaponOf is exported from equipment.js', equipSrc.includes('volleyWeaponOf') && equipSrc.includes('meleeWeaponOf, rangedWeaponOf, volleyWeaponOf'));

  // ---- telemetry summary ----
  console.log('TELEMETRY ' + JSON.stringify(Game.state.village.bowOpen || {}));
  console.log('SPEARGATE_FAILS ' + failed + (fails.length ? ' ' + fails.join(',') : ''));
  console.log('SPEARGATE_PASSED ' + passed + '/' + (passed + failed));
  if (failed) process.exitCode = 1;
}

main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });

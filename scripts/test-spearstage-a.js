#!/usr/bin/env node
// scripts/test-spearstage-a.js — proof test, arm sim-spearstage-a (finding #2590).
//
// Proves the spear-in-ranged-slot staging blind spot is CLOSED by the
// SPEARGATE fix (already landed) under live BOWCRAFT ground: a spear
// (melee, range 2, no ammo) sitting in the ranged slot must NOT be read
// as "already has a ranged weapon" — the departure is passed to the
// sources, and when the villager personally knows the bow recipe and
// materials are reachable, a departure craft ATTEMPTS (crafted or
// craftedFail). When knowledge or materials are missing, the departure
// is honestly noSource. A real bow still counts on both legs, and the
// flag-off behavior is byte-identical to the old read.
//
// Fixture (encounter-gear rule, Steve 2026-11-13): a LIVE loaded village
// with real roster/gear — a geared fighter (machete + hunting spear, the
// spear in the ranged slot, exactly the bowopen population) with a party
// of two armed companions — never a fresh un-geared solo scholar.
//
// Usage: BOWOPEN=1 node scripts/test-spearstage-a.js
// (BOWOPEN=1 required: staging lives inside villagerStageBow, which is
// itself BOWOPEN-gated. SPEARGATE is toggled inside the test.)
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
function stagedTotal(c) { return c.fromStash + c.fromArmory + c.crafted + c.craftedFail; }
function seedBowKnowledge(Game, vid, level) {
  const v = Game.state.village;
  v.weaponCraft = v.weaponCraft || {};
  v.weaponCraft[vid] = { bow: level };
}
function clearBowKnowledge(Game, vid) {
  try { const v = Game.state.village; if (v.weaponCraft) delete v.weaponCraft[vid]; } catch (e) {}
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
  const { Game } = await loadGame({ seed: 7, mode: 'spearstage-unit' });
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  const c1 = roster[1], c2 = roster[2];
  const p = personOf(Game, vid);
  const p1 = personOf(Game, c1), p2 = personOf(Game, c2);
  console.log('fighter=' + vid + ' companions=' + c1 + ',' + c2 + ' roster=' + roster.length);
  check('villagerStageBow exists', typeof Game.villagerStageBow === 'function');
  process.env.BOWOPEN = '1';

  // ---- 0. Party fixture: fighter + two armed companions ----
  gearFighter(Game, p);
  gearCompanion(Game, p1);
  gearCompanion(Game, p2);
  const rw0 = rangedOf(Game, p);
  check('fixture: spear sits in the ranged slot', rw0 && (rw0.itemId || rw0.id) === 'hunting_spear', JSON.stringify(rw0));
  check('fixture: machete sits in the melee slot beside it', !!(p.equipped.melee || p.equipped.weapon), JSON.stringify(p.equipped));
  check('fixture: both companions are armed', !!(rangedOf(Game, p1) || p1.equipped.melee) && !!(rangedOf(Game, p2) || p2.equipped.melee));
  check('fixture: bow recipe is wood1+vine2 in data', (function () {
    const r = (Game.data.recipes || []).find(x => x.id === 'bow');
    return !!r && r.materials && r.materials.wood === 1 && r.materials.vine === 2;
  })());

  // ---- 1. CONTROL (a): SPEARGATE off = spear counts as ranged ----
  delete process.env.SPEARGATE;
  gearFighter(Game, p);
  clearBowKnowledge(Game, vid);
  setMats(Game, { wood: 0, vine: 0, branch: 0, stick: 0, stone: 0, fiber: 0 });
  try { armoryWeapons(Game).length = 0; } catch (e) {}
  const beforeOff = bowOpenCounters(Game);
  const rOff = Game.villagerStageBow(vid);
  const afterOff = bowOpenCounters(Game);
  check('(a) CONTROL (flag off): spear-holder is alreadyHad', rOff.source === 'alreadyHad' && rOff.staged === false, JSON.stringify(rOff));
  check('(a) CONTROL: alreadyHad records the spear id', (Game.state.village.bowOpenByVid[vid] || {}).itemId === 'hunting_spear', JSON.stringify(Game.state.village.bowOpenByVid[vid]));
  check('(a) CONTROL: spearSeen bumps, spearPassed does not', afterOff.spearSeen === beforeOff.spearSeen + 1 && afterOff.spearPassed === beforeOff.spearPassed,
    'before=' + JSON.stringify(beforeOff) + ' after=' + JSON.stringify(afterOff));

  // ---- 2. (b) GATE ON + bow knowledge L1 + materials -> craft ATTEMPTS ----
  process.env.SPEARGATE = '1';
  gearFighter(Game, p);
  seedBowKnowledge(Game, vid, 1);
  setMats(Game, { wood: 1, vine: 2, branch: 0, stick: 0, stone: 0, fiber: 0 });
  try { armoryWeapons(Game).length = 0; } catch (e) {}
  const beforeOn = bowOpenCounters(Game);
  const rOn = Game.villagerStageBow(vid);
  const afterOn = bowOpenCounters(Game);
  check('(b) GATE ON + knowledge + mats: a departure craft ATTEMPTS (crafted or craftedFail)', (rOn.source === 'crafted' || rOn.source === 'craftedFail') && rOn.staged === true, JSON.stringify(rOn));
  check('(b) never alreadyHad-with-spear', rOn.source !== 'alreadyHad', JSON.stringify(rOn));
  check('(b) spearSeen and spearPassed both bump', afterOn.spearSeen === beforeOn.spearSeen + 1 && afterOn.spearPassed === beforeOn.spearPassed + 1,
    'before=' + JSON.stringify(beforeOn) + ' after=' + JSON.stringify(afterOn));
  check('(b) staged total rises by exactly the attempt', stagedTotal(afterOn) === stagedTotal(beforeOn) + 1,
    'before=' + JSON.stringify(beforeOn) + ' after=' + JSON.stringify(afterOn));
  check('(b) no alreadyHad-with-spear recorded', (Game.state.village.bowOpenByVid[vid] || {}).source !== 'alreadyHad', JSON.stringify(Game.state.village.bowOpenByVid[vid]));

  // ---- 2b. The success branch, driven deterministically ----
  // Force the craft draw to succeed (Math.random -> 0.0 beats any rate)
  // and prove a crafted bow lands in the pack and seats in the ranged slot.
  const realRandom = Math.random;
  gearFighter(Game, p);
  seedBowKnowledge(Game, vid, 1);
  setMats(Game, { wood: 1, vine: 2, branch: 0, stick: 0, stone: 0, fiber: 0 });
  try { armoryWeapons(Game).length = 0; } catch (e) {}
  Math.random = () => 0.0;
  let rCraft;
  try { rCraft = Game.villagerStageBow(vid); } finally { Math.random = realRandom; }
  check('(b2) forced-success draw crafts a bow', rCraft.source === 'crafted' && rCraft.staged === true && rCraft.itemId === 'bow', JSON.stringify(rCraft));
  check('(b2) the crafted bow sits in the ranged slot', (rangedOf(Game, p) || {}).itemId === 'bow' || (rangedOf(Game, p) || {}).id === 'bow', JSON.stringify(rangedOf(Game, p)));
  check('(b2) the pile paid the recipes.json bow cost (wood1+vine2)', (function () {
    try { const m = Game.stashState().materials || {}; return (m.wood | 0) === 0 && (m.vine | 0) === 0; } catch (e) { return false; }
  })(), JSON.stringify((function () { try { return Game.stashState().materials; } catch (e) { return {}; } })()));
  // ---- 2c. The failure branch, driven deterministically ----
  gearFighter(Game, p);
  seedBowKnowledge(Game, vid, 1);
  setMats(Game, { wood: 1, vine: 2, branch: 0, stick: 0, stone: 0, fiber: 0 });
  try { armoryWeapons(Game).length = 0; } catch (e) {}
  Math.random = () => 0.99;
  let rFail;
  try { rFail = Game.villagerStageBow(vid); } finally { Math.random = realRandom; }
  check('(b3) forced-failure draw records craftedFail (still an attempt)', rFail.source === 'craftedFail' && rFail.staged === true, JSON.stringify(rFail));
  check('(b3) a failed craft leaves no bow in the ranged slot', (rangedOf(Game, p) || {}).itemId === 'hunting_spear' || (rangedOf(Game, p) || {}).id === 'hunting_spear', JSON.stringify(rangedOf(Game, p)));

  // ---- 3. (c) GATE ON + NO bow knowledge + materials -> noSource ----
  gearFighter(Game, p);
  clearBowKnowledge(Game, vid);
  setMats(Game, { wood: 1, vine: 2, branch: 0, stick: 0, stone: 0, fiber: 0 });
  try { armoryWeapons(Game).length = 0; } catch (e) {}
  const rNoKnow = Game.villagerStageBow(vid);
  check('(c) GATE ON + no knowledge: honestly noSource (gate conjures no bow)', rNoKnow.source === 'noSource' && rNoKnow.staged === false, JSON.stringify(rNoKnow));

  // ---- 4. GATE ON + bow knowledge + NO materials -> noSource ----
  gearFighter(Game, p);
  seedBowKnowledge(Game, vid, 1);
  setMats(Game, { wood: 0, vine: 0, branch: 0, stick: 0, stone: 0, fiber: 0 });
  try { armoryWeapons(Game).length = 0; } catch (e) {}
  const rNoMats = Game.villagerStageBow(vid);
  check('GATE ON + knowledge + no materials: honestly noSource', rNoMats.source === 'noSource' && rNoMats.staged === false, JSON.stringify(rNoMats));

  // ---- 5. (d) A real bow still counts — on both legs ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }];
  Game.villagerGearUp(p.id, true);
  const rBowOn = Game.villagerStageBow(vid);
  check('(d) bow-holder is still alreadyHad (flag on)', rBowOn.source === 'alreadyHad' && rBowOn.staged === false, JSON.stringify(rBowOn));
  delete process.env.SPEARGATE;
  resetVillager(Game, p);
  p.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }];
  Game.villagerGearUp(p.id, true);
  const rBowOff = Game.villagerStageBow(vid);
  check('(d) bow-holder is still alreadyHad (flag off)', rBowOff.source === 'alreadyHad' && rBowOff.staged === false, JSON.stringify(rBowOff));
  process.env.SPEARGATE = '1';

  // ---- 6. (e) Flag unset = old behavior, byte-identical ----
  delete process.env.SPEARGATE;
  gearFighter(Game, p);
  clearBowKnowledge(Game, vid);
  setMats(Game, { wood: 0, vine: 0, branch: 0, stick: 0, stone: 0, fiber: 0 });
  try { armoryWeapons(Game).length = 0; } catch (e) {}
  const beforeE = bowOpenCounters(Game);
  const rE = Game.villagerStageBow(vid);
  const afterE = bowOpenCounters(Game);
  // (record() leaves out.itemId null for alreadyHad by construction —
  // the spear id is recorded in bowOpenByVid, as the speargate test checks.)
  check('(e) flag unset: spear-holder is alreadyHad, exactly as the control', rE.source === 'alreadyHad' && rE.staged === false && (Game.state.village.bowOpenByVid[vid] || {}).itemId === 'hunting_spear', JSON.stringify(rE) + ' ' + JSON.stringify(Game.state.village.bowOpenByVid[vid]));
  check('(e) flag unset: same counter deltas as the control (spearSeen +1, spearPassed +0)',
    afterE.spearSeen === beforeE.spearSeen + 1 && afterE.spearPassed === beforeE.spearPassed && afterE.alreadyHad === beforeE.alreadyHad + 1,
    'before=' + JSON.stringify(beforeE) + ' after=' + JSON.stringify(afterE));
  process.env.SPEARGATE = '1';

  // ---- 7. Scope guard: SPEARGATE lives in stageBow only ----
  const gameSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
  const gpSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'godpath.js'), 'utf8');
  const speargateHits = (gameSrc.match(/SPEARGATE/g) || []).length;
  check('SPEARGATE gate lives in game.js stageBow (gate + doc mentions only)', speargateHits >= 1 && speargateHits <= 6 && gameSrc.includes("process.env.SPEARGATE === '1'"), 'hits=' + speargateHits);
  check('SPEARGATE never appears in godpath.js', !gpSrc.includes('SPEARGATE'));

  // ---- telemetry summary ----
  console.log('TELEMETRY ' + JSON.stringify(Game.state.village.bowOpen || {}));
  console.log('SPEARSTAGE_FAILS ' + failed + (fails.length ? ' ' + fails.join(',') : ''));
  console.log('SPEARSTAGE_PASSED ' + passed + '/' + (passed + failed));
  if (failed) process.exitCode = 1;
}

main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });

#!/usr/bin/env node
// scripts/test-arrowsupply-a.js — proof test, arm sim-arrowsupply-a (finding #2594).
//
// Proves the ammo-supply DIAG instrument: the departure pocketAmmo
// classification (stash / pile-stone / craft-ok / craft-failed /
// no-materials / no-source-kind / spear-no-ammo / already-full /
// already-had / craft-never-ran), the home ammo-duty attribution,
// the daily census read, and the analyzer judge shapes (the analyzer
// selftest covers the aggregation; this test covers the live game
// behavior the wraps read).
//
// Fixture (encounter-gear rule, Steve 2026-11-13): the villagers are
// geared wave-4 hunters as the launch leaves them — a bow, a
// crossbow, a sling, a searcaster — not fresh solo scholars.
//
// Usage: node scripts/test-arrowsupply-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo; prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
const path = require('path');
const fs = require('fs');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { classifyPocketAmmo, classifyHomeDutyRow, ammoCountOf, rangedKitOf, pileMatsOf,
  recipeNeedsOf, matsSufficient, homeCraftMatsOk, ammoCensusSnap } = require('./arrowsupply-driver-a');
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

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'arrowsupply-unit' });
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  const p = personOf(Game, vid);
  const vid2 = roster[1] || roster[0];
  const p2 = personOf(Game, vid2);
  console.log('fighter=' + vid + ' second=' + vid2 + ' roster=' + roster.length);
  check('villagerPocketAmmo exists', typeof Game.villagerPocketAmmo === 'function');
  check('villagerAmmoCraftDay exists', typeof Game.villagerAmmoCraftDay === 'function');
  check('driver helpers load', typeof classifyPocketAmmo === 'function' && typeof ammoCensusSnap === 'function');

  // ---- 1. classifyPocketAmmo fixtures (pure — the wrap's judge) ----
  const preBase = { ammoId: 'arrow', carriedBefore: 0, stashBefore: 0, pileBefore: { stick: 10, stone: 10, fiber: 5 }, matsSufficient: true, cap: 5 };
  check('classify craft-ok', classifyPocketAmmo(preBase, { pocketed: 0, crafted: 1, craftedOk: true }, 5).outcome === 'craft-ok', JSON.stringify(classifyPocketAmmo(preBase, { pocketed: 0, crafted: 1, craftedOk: true }, 5)));
  check('classify craft-failed', classifyPocketAmmo(preBase, { pocketed: 0, crafted: 1, craftedOk: false }, 0).reason === 'craft-failed', JSON.stringify(classifyPocketAmmo(preBase, { pocketed: 0, crafted: 1, craftedOk: false }, 0)));
  check('classify no-materials (no attempt, pile short)', classifyPocketAmmo(Object.assign({}, preBase, { matsSufficient: false }), { pocketed: 0, crafted: 0, craftedOk: false }, 0).reason === 'no-materials');
  check('classify craft-never-ran (mats sufficient, no attempt)', classifyPocketAmmo(preBase, { pocketed: 0, crafted: 0, craftedOk: false }, 0).reason === 'craft-never-ran');
  check('classify no-source-kind (fusion_cell)', classifyPocketAmmo(Object.assign({}, preBase, { ammoId: 'fusion_cell' }), { pocketed: 0, crafted: 0, craftedOk: false }, 0).reason === 'no-source-kind');
  check('classify spear-no-ammo', classifyPocketAmmo(Object.assign({}, preBase, { ammoId: null }), { pocketed: 0, crafted: 0, craftedOk: false }, 0).outcome === 'spear-no-ammo');
  check('classify already-full (carried 5)', classifyPocketAmmo(Object.assign({}, preBase, { carriedBefore: 5 }), { pocketed: 0, crafted: 0, craftedOk: false }, 5).outcome === 'already-full');
  check('classify already-had (carried 3, nothing added)', classifyPocketAmmo(Object.assign({}, preBase, { carriedBefore: 3 }), { pocketed: 0, crafted: 0, craftedOk: false }, 3).outcome === 'already-had');
  check('classify stash (pocketed, stash fell)', classifyPocketAmmo(Object.assign({}, preBase, { stashBefore: 5, stashAfter: 0 }), { pocketed: 5, crafted: 0, craftedOk: false }, 5).outcome === 'stash');
  check('classify pile-stone (pocketed, stash untouched)', classifyPocketAmmo(Object.assign({}, preBase, { ammoId: 'stone', stashBefore: 0, stashAfter: 0 }), { pocketed: 4, crafted: 0, craftedOk: false }, 4).outcome === 'pile-stone');

  // ---- 1b. classifyHomeDutyRow fixtures (pure — the duty's attribution) ----
  const hdBase = { carriedBefore: 0, cdBefore: null, matsOk: true, away: false };
  check('home classify success has no reason', classifyHomeDutyRow(hdBase, true, true, 50) === null);
  check('home classify craft-failed', classifyHomeDutyRow(hdBase, true, false, 50) === 'craft-failed');
  check('home classify away (duty never serves the away)', classifyHomeDutyRow(Object.assign({}, hdBase, { away: true }), false, false, 50) === 'away');
  check('home classify already-stocked (carried 5, correctly skipped)', classifyHomeDutyRow(Object.assign({}, hdBase, { carriedBefore: 5 }), false, false, 50) === 'already-stocked');
  check('home classify away wins over already-stocked', classifyHomeDutyRow(Object.assign({}, hdBase, { carriedBefore: 7, away: true }), false, false, 50) === 'away');
  check('home classify cooldown (attempt 2 days ago)', classifyHomeDutyRow(Object.assign({}, hdBase, { cdBefore: 48 }), false, false, 50) === 'cooldown');
  check('home classify no-materials', classifyHomeDutyRow(Object.assign({}, hdBase, { matsOk: false }), false, false, 50) === 'no-materials');
  check('home classify not-attempted-unknown (no gate explains it)', classifyHomeDutyRow(hdBase, false, false, 50) === 'not-attempted-unknown');
  check('home classify cooldown expires after 3 days', classifyHomeDutyRow(Object.assign({}, hdBase, { cdBefore: 46 }), false, false, 50) === 'not-attempted-unknown');

  // ---- 2. live pocketAmmo: learned arrow craft succeeds (forced RNG) ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }];
  Game.villagerGearUp(vid, true);
  Game.state.village.ammoCraft = Game.state.village.ammoCraft || {};
  Game.state.village.ammoCraft[vid] = { arrow: 2 };
  setMats(Game, { wood: 5, vine: 5, branch: 5, stick: 10, stone: 10, fiber: 5 });
  const savedRandom = Math.random;
  Math.random = () => 0.1; // 85% learned craft succeeds
  let outOk = null;
  try { outOk = Game.villagerPocketAmmo(vid); } finally { Math.random = savedRandom; }
  check('learned arrow craft succeeds at departure', outOk.crafted === 1 && outOk.craftedOk === true && outOk.ammoId === 'arrow', JSON.stringify(outOk));
  check('crafted arrows land in the pack (5)', ammoCountOf(p.items, 'arrow') === 5, 'arrows=' + ammoCountOf(p.items, 'arrow'));
  const mOk = stashMats(Game);
  check('craft spends exactly the recipe (stick 10->8, stone 10->9, fiber 5->4)', mOk.stick === 8 && mOk.stone === 9 && mOk.fiber === 4, JSON.stringify(mOk));

  // ---- 3. live pocketAmmo: blind craft fails (forced RNG), materials spent ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }];
  Game.villagerGearUp(vid, true);
  Game.state.village.ammoCraft[vid] = { arrow: 1 };
  setMats(Game, { wood: 5, vine: 5, branch: 5, stick: 10, stone: 10, fiber: 5 });
  Math.random = () => 0.9; // 35% blind craft fails
  let outFail = null;
  try { outFail = Game.villagerPocketAmmo(vid); } finally { Math.random = savedRandom; }
  check('blind arrow craft can fail at departure', outFail.crafted === 1 && outFail.craftedOk === false, JSON.stringify(outFail));
  check('failed departure craft leaves zero arrows', ammoCountOf(p.items, 'arrow') === 0, 'arrows=' + ammoCountOf(p.items, 'arrow'));
  const mFail = stashMats(Game);
  check('failed craft still spends the materials', mFail.stick === 8 && mFail.stone === 9 && mFail.fiber === 4, JSON.stringify(mFail));

  // ---- 4. live pocketAmmo: no materials -> no attempt, pile untouched ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }];
  Game.villagerGearUp(vid, true);
  Game.state.village.ammoCraft[vid] = { arrow: 2 };
  setMats(Game, { wood: 0, vine: 0, branch: 0, stick: 0, stone: 0, fiber: 0 });
  const outNoMat = Game.villagerPocketAmmo(vid);
  check('no materials means no craft attempt', outNoMat.crafted === 0 && outNoMat.craftedOk === false, JSON.stringify(outNoMat));
  check('no-materials departure leaves zero arrows', ammoCountOf(p.items, 'arrow') === 0);

  // ---- 5. live pocketAmmo: stashed arrows pocket first, no craft ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }];
  p.stashed = [{ itemId: 'arrow', name: 'Arrow', units: 3, kg: 0.1 }];
  Game.villagerGearUp(vid, true);
  setMats(Game, { wood: 0, vine: 0, branch: 0, stick: 0, stone: 0, fiber: 0 });
  const outStash = Game.villagerPocketAmmo(vid);
  check('stashed arrows pocket without crafting', outStash.pocketed === 3 && outStash.crafted === 0, JSON.stringify(outStash));
  check('stash arrows land in the pack', ammoCountOf(p.items, 'arrow') === 3 && (p.stashed || []).length === 0);

  // ---- 6. live pocketAmmo: searcaster has no source (fusion_cell) ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 }];
  Game.villagerGearUp(vid, true);
  setMats(Game, { wood: 5, vine: 5, branch: 5, stick: 10, stone: 10, fiber: 5 });
  const outCell = Game.villagerPocketAmmo(vid);
  check('searcaster pockets nothing (no fusion-cell source)', outCell.ammoId === 'fusion_cell' && outCell.crafted === 0 && outCell.pocketed === 0, JSON.stringify(outCell));
  check('searcaster departs with zero cells', ammoCountOf(p.items, 'fusion_cell') === 0);

  // ---- 7. live pocketAmmo: spear holder — no ammo id, immediate return ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'hunting_spear', name: 'Hunting spear', units: 1, kg: 1.0 }];
  Game.villagerGearUp(vid, true);
  const outSpear = Game.villagerPocketAmmo(vid);
  check('spear holder gets no ammo id', outSpear.ammoId === null && outSpear.crafted === 0 && outSpear.pocketed === 0, JSON.stringify(outSpear));

  // ---- 8. live pocketAmmo: sling takes stones from the pile ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'sling', name: 'Sling', units: 1, kg: 0.3 }];
  Game.villagerGearUp(vid, true);
  setMats(Game, { wood: 0, vine: 0, branch: 0, stick: 0, stone: 4, fiber: 0 });
  const outStone = Game.villagerPocketAmmo(vid);
  check('sling pockets pile stones', outStone.ammoId === 'stone' && outStone.pocketed === 4 && outStone.crafted === 0, JSON.stringify(outStone));
  check('stones land in the pack', ammoCountOf(p.items, 'stone') === 4);
  check('pile stone is spent', stashMats(Game).stone === 0);

  // ---- 9. live pocketAmmo: crossbow bolt craft (forced success) ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'crossbow', name: 'Crossbow', units: 1, kg: 1.2 }];
  Game.villagerGearUp(vid, true);
  Game.state.village.ammoCraft[vid] = { bolt: 2 };
  setMats(Game, { wood: 0, vine: 0, branch: 0, stick: 10, stone: 10, fiber: 0 });
  Math.random = () => 0.1;
  let outBolt = null;
  try { outBolt = Game.villagerPocketAmmo(vid); } finally { Math.random = savedRandom; }
  check('learned bolt craft succeeds at departure', outBolt.crafted === 1 && outBolt.craftedOk === true && outBolt.ammoId === 'bolt', JSON.stringify(outBolt));
  check('crafted bolts land in the pack (5)', ammoCountOf(p.items, 'bolt') === 5);

  // ---- 10. home duty: bow carrier at home crafts a batch (forced RNG) ----
  resetVillager(Game, p2);
  p2.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }];
  Game.villagerGearUp(vid2, true);
  Game.state.village.ammoCraft[vid2] = { arrow: 2 };
  setMats(Game, { wood: 5, vine: 5, branch: 5, stick: 10, stone: 10, fiber: 5 });
  const kit2 = rangedKitOf(Game, p2);
  check('home-duty fixture holds a bow with arrow ammo', kit2.rwId === 'bow' && kit2.ammoId === 'arrow', JSON.stringify(kit2));
  check('home-duty material check reads sufficient', homeCraftMatsOk(Game, p2, 'arrow') === true);
  Math.random = () => 0.1;
  let made = null;
  try { made = Game.villagerAmmoCraftDay(); } finally { Math.random = savedRandom; }
  check('home duty crafts at least one batch', made >= 1, 'made=' + made);
  check('home-duty arrows land in the pack (5)', ammoCountOf(p2.items, 'arrow') === 5, 'arrows=' + ammoCountOf(p2.items, 'arrow'));
  // Cooldown: a second call the same day crafts nothing for this villager.
  Math.random = () => 0.1;
  let made2 = null;
  try { made2 = Game.villagerAmmoCraftDay(); } finally { Math.random = savedRandom; }
  check('home-duty cooldown blocks a same-day second batch for the same villager', ammoCountOf(p2.items, 'arrow') === 5, 'arrows=' + ammoCountOf(p2.items, 'arrow') + ' made2=' + made2);

  // ---- 11. census snap reads ranged kit + ammo + pile ----
  const snap = ammoCensusSnap(Game);
  const row2 = snap.census.find(r => r.vid === vid2);
  check('census finds the bow carrier', !!row2 && row2.rangedId === 'bow' && row2.ammoId === 'arrow' && row2.ammo === 5, JSON.stringify(row2));
  check('census pile reads the recipe materials', snap.pile && typeof snap.pile.stick === 'number' && typeof snap.pile.fiber === 'number', JSON.stringify(snap.pile));
  const needs = recipeNeedsOf(Game, 'arrow');
  check('arrow recipe needs stick 2 + stone 1 + fiber 1', needs && needs.stick === 2 && needs.stone === 1 && needs.fiber === 1, JSON.stringify(needs));
  check('matsSufficient true on a full pile, false on an empty one', matsSufficient({ stick: 10, stone: 10, fiber: 5 }, needs) === true && matsSufficient({ stick: 0, stone: 10, fiber: 5 }, needs) === false);
  check('pileMatsOf copies the pile (stick/fiber present)', pileMatsOf(Game).stick != null && pileMatsOf(Game).fiber != null, JSON.stringify(pileMatsOf(Game)));

  // ---- 12. the volley still fires off pocketed arrows (Lena's counterfactual) ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }];
  Game.villagerGearUp(vid, true);
  Game.state.village.ammoCraft[vid] = { arrow: 2 };
  setMats(Game, { wood: 5, vine: 5, branch: 5, stick: 10, stone: 10, fiber: 5 });
  Math.random = () => 0.1;
  try { Game.villagerPocketAmmo(vid); } finally { Math.random = savedRandom; }
  const arrowsBefore = ammoCountOf(p.items, 'arrow');
  const mdef = (Game.data.monsters || []).find(m => m.id === 'eulogy') || (Game.data.monsters || [])[0];
  let rec = null;
  try { rec = Game.fieldFight(vid, mdef, null, { allies: 1 }); } catch (e) { console.log('fieldFight error: ' + e.message); }
  check('pocketed bow volleys in a wave-4 fight', arrowsBefore > 0 && rec && rec.volley && rec.volley.shots > 0, 'arrows=' + arrowsBefore + ' ' + JSON.stringify(rec && rec.volley));
  check('volley spends exactly its shots', rec && rec.volley && ammoCountOf(p.items, 'arrow') === arrowsBefore - rec.volley.shots,
    'left=' + ammoCountOf(p.items, 'arrow') + ' shots=' + (rec && rec.volley && rec.volley.shots));

  console.log('ARROWSUPPLY_FAILS ' + failed + (fails.length ? ' ' + fails.join(',') : ''));
  console.log('ARROWSUPPLY_PASSED ' + passed + '/' + (passed + failed));
  if (failed) process.exitCode = 1;
}

main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });

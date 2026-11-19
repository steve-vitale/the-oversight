#!/usr/bin/env node
// scripts/test-bowopen-a.js — proof test, arm sim-bowopen-a (finding #2544).
//
// Proves the ranged-opening half of the winning launched-party shape:
// launched parties stage a bow + arrows at launch gear-up
// (Game.villagerStageBow, called from startExpedition between
// villagerGearUp and villagerPocketAmmo), env-gated BOWOPEN=1.
//
// Fixture (encounter-gear rule, Steve 2026-11-13): the staged
// villagers are geared wave-4 hunters as the launch leaves them —
// a bonus-20 melee fighter, a bow, arrows — not a fresh solo scholar.
//
// Usage: node scripts/test-bowopen-a.js
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
function stashMats(Game) {
  try { const st = Game.stashState ? Game.stashState() : null; return (st && st.materials) || {}; }
  catch (e) { return ((Game.state.village.stash || {}).materials || {}); }
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

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'bowopen-unit' });
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  const p = personOf(Game, vid);
  console.log('fighter=' + vid + ' roster=' + roster.length);
  check('villagerStageBow exists', typeof Game.villagerStageBow === 'function');

  // ---- 1. Flag off is byte-identical old behavior: no-op, no state writes ----
  delete process.env.BOWOPEN;
  resetVillager(Game, p);
  p.stashed = [{ itemId: 'crude_bow', name: 'Crude bow', units: 1, kg: 0.6 }];
  const rOff = Game.villagerStageBow(vid);
  check('flag off stages nothing', rOff.staged === false && rOff.source === null, JSON.stringify(rOff));
  check('flag off writes no telemetry', Game.state.village.bowOpen === undefined, JSON.stringify(Game.state.village.bowOpen));
  check('flag off leaves the stashed bow alone', (p.stashed || []).length === 1 && rangedOf(Game, p) === null);

  // ---- 2. alreadyHad: bow-holder untouched ----
  process.env.BOWOPEN = '1';
  resetVillager(Game, p);
  p.items = [{ itemId: 'crude_bow', name: 'Crude bow', units: 1, kg: 0.6 }];
  Game.villagerGearUp(vid, true);
  const rHad = Game.villagerStageBow(vid);
  check('bow-holder is alreadyHad', rHad.source === 'alreadyHad' && rHad.staged === false, JSON.stringify(rHad));
  const rwHad = rangedOf(Game, p);
  check('bow-holder keeps the bow', rwHad && (rwHad.itemId || rwHad.id) === 'crude_bow', JSON.stringify(rwHad));

  // ---- 3. fromStash: own stashed bow moves to pack + ranged slot ----
  resetVillager(Game, p);
  p.stashed = [{ itemId: 'crude_bow', name: 'Crude bow', units: 1, kg: 0.6 }];
  setMats(Game, { wood: 0, vine: 0, branch: 0, stick: 0, stone: 0, fiber: 0 });
  const rStash = Game.villagerStageBow(vid);
  check('stashed bow stages fromStash', rStash.source === 'fromStash' && rStash.staged === true && rStash.itemId === 'crude_bow', JSON.stringify(rStash));
  const rwStash = rangedOf(Game, p);
  check('stashed bow is equipped ranged', rwStash && (rwStash.itemId || rwStash.id) === 'crude_bow', JSON.stringify(rwStash));
  check('stashed bow leaves the stash', (p.stashed || []).length === 0);

  // ---- 4. fromArmory: deposited bow borrowed, ledgered ----
  resetVillager(Game, p);
  const pile = armoryWeapons(Game);
  pile.length = 0;
  pile.push({ itemId: 'bow', name: 'Bow', units: 1 });
  setMats(Game, { wood: 0, vine: 0, branch: 0, stick: 0, stone: 0, fiber: 0 });
  const rArm = Game.villagerStageBow(vid);
  check('armory bow stages fromArmory', rArm.source === 'fromArmory' && rArm.staged === true && rArm.itemId === 'bow', JSON.stringify(rArm));
  const rwArm = rangedOf(Game, p);
  check('armory bow is equipped ranged', rwArm && (rwArm.itemId || rwArm.id) === 'bow', JSON.stringify(rwArm));
  check('armory borrow consumes the deposit', armoryWeapons(Game).length === 0, JSON.stringify(armoryWeapons(Game)));

  // ---- 5. craft success (forced RNG): known bow recipe, pile pays ----
  resetVillager(Game, p);
  Game.state.village.weaponCraft = Game.state.village.weaponCraft || {};
  Game.state.village.weaponCraft[vid] = { bow: 2 };
  setMats(Game, { wood: 5, vine: 5, branch: 0, stick: 0, stone: 0, fiber: 0 });
  const savedRandom = Math.random;
  Math.random = () => 0.1; // 85% learned craft succeeds
  let rCraft = null;
  try { rCraft = Game.villagerStageBow(vid); } finally { Math.random = savedRandom; }
  check('known bow crafts (forced success)', rCraft.source === 'crafted' && rCraft.craftedOk === true && rCraft.itemId === 'bow', JSON.stringify(rCraft));
  const rwCraft = rangedOf(Game, p);
  check('crafted bow is equipped ranged', rwCraft && (rwCraft.itemId || rwCraft.id) === 'bow', JSON.stringify(rwCraft));
  const mCraft = stashMats(Game);
  check('craft spends exactly the recipe (wood 5->4, vine 5->3)', mCraft.wood === 4 && mCraft.vine === 3, JSON.stringify(mCraft));

  // ---- 6. craft fail (forced RNG): materials spent, no bow ----
  resetVillager(Game, p);
  Game.state.village.weaponCraft[vid] = { bow: 1 };
  setMats(Game, { wood: 5, vine: 5, branch: 0, stick: 0, stone: 0, fiber: 0 });
  Math.random = () => 0.9; // 35% blind craft fails
  let rFail = null;
  try { rFail = Game.villagerStageBow(vid); } finally { Math.random = savedRandom; }
  check('blind bow craft can fail', rFail.source === 'craftedFail' && rFail.craftedOk === false, JSON.stringify(rFail));
  check('failed craft still spends materials', stashMats(Game).wood === 4 && stashMats(Game).vine === 3, JSON.stringify(stashMats(Game)));
  check('failed craft equips no bow', rangedOf(Game, p) === null);

  // ---- 7. no knowledge -> noSource, pile untouched ----
  resetVillager(Game, p);
  setMats(Game, { wood: 5, vine: 5, branch: 5, stick: 5, stone: 5, fiber: 5 });
  const rNoKnow = Game.villagerStageBow(vid);
  check('no knowledge means noSource', rNoKnow.source === 'noSource' && rNoKnow.staged === false, JSON.stringify(rNoKnow));
  const mNoKnow = stashMats(Game);
  check('noSource consumes nothing', mNoKnow.wood === 5 && mNoKnow.vine === 5 && mNoKnow.branch === 5, JSON.stringify(mNoKnow));

  // ---- 8. knowledge but no materials -> noSource ----
  resetVillager(Game, p);
  Game.state.village.weaponCraft[vid] = { bow: 2, crude_bow: 2 };
  setMats(Game, { wood: 0, vine: 0, branch: 0, stick: 0, stone: 0, fiber: 0 });
  const rNoMat = Game.villagerStageBow(vid);
  check('no materials means noSource', rNoMat.source === 'noSource' && rNoMat.staged === false, JSON.stringify(rNoMat));

  // ---- 9. fold-in lift: bonus-20 melee fighter, wb 10 -> 21 ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'trailblazer_machete', name: 'Trailblazer machete', units: 1, kg: 0.8 }];
  Game.villagerGearUp(vid, true);
  const wbBefore = wbOf(Game, p);
  check('melee-only fighter wb is 10 (20/2)', wbBefore === 10, 'wb=' + wbBefore);
  p.stashed = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }];
  const rFold = Game.villagerStageBow(vid);
  const wbAfter = wbOf(Game, p);
  check('staged bow lifts wb to 21 ((20+22)/2)', rFold.source === 'fromStash' && wbAfter === 21, 'wb=' + wbAfter + ' ' + JSON.stringify(rFold));
  const rwFold = rangedOf(Game, p);
  check('bow sits in the ranged slot beside the melee weapon', rwFold && (rwFold.itemId || rwFold.id) === 'bow' &&
    (p.equipped.melee || p.equipped.weapon) != null, JSON.stringify(p.equipped));

  // ---- 10. volley fires: staged bow + pocketed arrows in a real wave-4 fight ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'trailblazer_machete', name: 'Trailblazer machete', units: 1, kg: 0.8 }];
  p.stashed = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }];
  setMats(Game, { wood: 5, vine: 5, branch: 5, stick: 10, stone: 10, fiber: 5 });
  Game.villagerGearUp(vid, true);
  Game.villagerStageBow(vid);
  // Deterministic arrows: learned arrow-craft (85%) + forced RNG success.
  Game.state.village.ammoCraft = Game.state.village.ammoCraft || {};
  Game.state.village.ammoCraft[vid] = { arrow: 2 };
  const savedRandom2 = Math.random;
  Math.random = () => 0.1;
  let pocketed = null;
  try { pocketed = Game.villagerPocketAmmo(vid); } finally { Math.random = savedRandom2; }
  const arrowsBefore = ammoCount(p.items, 'arrow');
  const mdef = (Game.data.monsters || []).find(m => m.id === 'eulogy') || (Game.data.monsters || [])[0];
  let rec = null;
  try { rec = Game.fieldFight(vid, mdef, null, { allies: 1 }); } catch (e) { console.log('fieldFight error: ' + e.message); }
  check('pocketAmmo arms the staged bow', arrowsBefore > 0, 'arrows=' + arrowsBefore + ' ' + JSON.stringify(pocketed));
  check('volley fires in the wave-4 fight', rec && rec.volley && rec.volley.shots > 0, JSON.stringify(rec && rec.volley));
  check('volley deals damage', rec && rec.volley && rec.volley.dmg > 0, JSON.stringify(rec && rec.volley));
  check('volley spends exactly its shots', rec && rec.volley && ammoCount(p.items, 'arrow') === arrowsBefore - rec.volley.shots,
    'left=' + ammoCount(p.items, 'arrow') + ' shots=' + (rec && rec.volley && rec.volley.shots));

  // ---- 11. startExpedition wires it end to end ----
  const vid2 = roster[1] || roster[0];
  const p2 = personOf(Game, vid2);
  resetVillager(Game, p2);
  p2.items = [{ itemId: 'trailblazer_machete', name: 'Trailblazer machete', units: 1, kg: 0.8 }];
  p2.stashed = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }];
  setMats(Game, { wood: 5, vine: 5, branch: 5, stick: 10, stone: 10, fiber: 5 });
  Game.state.village.ammoCraft = Game.state.village.ammoCraft || {};
  Game.state.village.ammoCraft[vid2] = { arrow: 2 };
  const savedRandom3 = Math.random;
  Math.random = () => 0.1; // learned arrow-craft succeeds on the launch
  let expedOk = false, expedErr = null;
  try {
    Game.startExpedition(vid2, 4, 4, false, { tx: 5, ty: 5, duration: 10 });
    const st = Game.agencyState ? Game.agencyState() : null;
    expedOk = !!(st && st.exped && st.exped[vid2]);
  } catch (e) { expedErr = e.message; } finally { Math.random = savedRandom3; }
  check('startExpedition launches the villager', expedOk, expedErr);
  const rwExped = rangedOf(Game, p2);
  check('launch gear-up stages the bow', rwExped && (rwExped.itemId || rwExped.id) === 'bow', JSON.stringify(rwExped));
  check('launch gear-up pockets arrows for it', ammoCount(p2.items, 'arrow') > 0, 'arrows=' + ammoCount(p2.items, 'arrow'));

  // ---- 12. player skipped ----
  const rPlayer = Game.villagerStageBow(Game.villagerId);
  check('player skipped', rPlayer.staged === false && rPlayer.source === null, JSON.stringify(rPlayer));

  // ---- 13. Rage untouched: BOWOPEN appears nowhere near the Rage path ----
  const gameSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
  const gpSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'godpath.js'), 'utf8');
  const agencySrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-agency.js'), 'utf8');
  const bowopenHits = (gameSrc.match(/BOWOPEN/g) || []).length;
  check('BOWOPEN gate lives in game.js stageBow only (gate + 1 doc mention, no Rage touch)',
    bowopenHits === 2 && gameSrc.includes("process.env.BOWOPEN === '1'"), 'hits=' + bowopenHits);
  check('BOWOPEN never appears in godpath.js (Rage path untouched)', !gpSrc.includes('BOWOPEN'));
  check('startExpedition calls villagerStageBow', agencySrc.includes('villagerStageBow'));
  check('fieldBegin Rage branch untouched by this arm', !gpSrc.includes('villagerStageBow'));

  // ---- telemetry summary ----
  console.log('TELEMETRY ' + JSON.stringify(Game.state.village.bowOpen || {}));
  console.log('BOWOPEN_FAILS ' + failed + (fails.length ? ' ' + fails.join(',') : ''));
  console.log('BOWOPEN_PASSED ' + passed + '/' + (passed + failed));
  if (failed) process.exitCode = 1;
}

main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });

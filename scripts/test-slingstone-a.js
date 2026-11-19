#!/usr/bin/env node
// scripts/test-slingstone-a.js — proof test, arm sim-slingstone-a (finding #2600).
//
// Proves the sling-stone DIAG instrument: the per-villager stone
// ledger — departure top-ups (pile stones, cap 6), all-wave volley
// spends (1 stone/shot, ammoLeft cross-check), duty takes (weapon /
// ammo / armor / gear duties must NOT touch a sling carrier's stones
// — the wraps prove the zero), kill-loot stone moves, the death
// pre-read, the census anchor, and the analyzer ledger + judge
// shapes (the analyzer selftest covers the aggregation; this test
// covers the live game behavior the wraps read).
//
// Fixture (encounter-gear rule, Steve 2026-11-13): the villagers are
// geared hunters as the launch leaves them — a sling carrier with a
// full 6-stone pouch, a weaponless villager at the workbench — not
// fresh solo scholars.
//
// Usage: node scripts/test-slingstone-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo (the smoke corpus goes to a temp dir);
// prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
// Substrate env for the live smoke (the judged substrate, set before
// any driver require so its module-level consts see them).
process.env.SENSEEXPED = '1';
process.env.VETREENGAGE = '1';
process.env.PARTYSIZE4 = '1';
process.env.FLEEREPAIR2 = '1';
process.env.FIGHTALLY2 = '1';
process.env.DAYS = '5';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { ammoCountOf, rangedKitOf, pileMatsOf, recipeNeedsOf, matsSufficient,
  ammoCensusSnap, stoneCarriersSnap, SLING_IDS } = require('./slingstone-driver-a');
const { stoneStats, ledgerSeed, judge } = require('./analyze-slingstone-a');
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
  try { Game.state.village.weaponCraft = Game.state.village.weaponCraft || {}; delete Game.state.village.weaponCraft[p.id]; } catch (e) {}
  try { Game.state.village.weaponCraftCd = Game.state.village.weaponCraftCd || {}; delete Game.state.village.weaponCraftCd[p.id]; } catch (e) {}
}

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'slingstone-unit' });
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  const p = personOf(Game, vid);
  const vid2 = roster[1] || roster[0];
  const p2 = personOf(Game, vid2);
  console.log('fighter=' + vid + ' second=' + vid2 + ' roster=' + roster.length);
  check('villagerPocketAmmo exists', typeof Game.villagerPocketAmmo === 'function');
  check('villagerWeaponCraftDay exists', typeof Game.villagerWeaponCraftDay === 'function');
  check('villagerAmmoCraftDay exists', typeof Game.villagerAmmoCraftDay === 'function');
  check('villagerArmorCraftDay exists', typeof Game.villagerArmorCraftDay === 'function');
  check('villagerGearDay exists', typeof Game.villagerGearDay === 'function');
  check('registerDeath exists', typeof Game.registerDeath === 'function');
  check('driver helpers load', typeof stoneCarriersSnap === 'function' && SLING_IDS.sling === true && SLING_IDS.phase_sling === true);

  // ---- 0. substrate + canon notes (live reads, not assumptions) ----
  const wiringSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'party-wiring.js'), 'utf8');
  const gameSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
  check('SENSEEXPED present in party-wiring.js (live substrate)', wiringSrc.indexOf('SENSEEXPED') !== -1);
  check('LAUNCHPARTY absent from game.js (HELD-only, never landed)', gameSrc.indexOf('LAUNCHPARTY') === -1);
  const recipes = Game.data.recipes || [];
  const bark = recipes.find(r => r.id === 'bark_armor');
  const hide = recipes.find(r => r.id === 'hide_armor');
  check('armor recipes use no stone (bark/hide only)', bark && hide && !bark.materials.stone && !hide.materials.stone, JSON.stringify({ bark: bark && bark.materials, hide: hide && hide.materials }));
  const spearNeeds = recipeNeedsOf(Game, 'hunting_spear');
  check('hunting_spear recipe needs branch 1 + stone 1 + vine 1', spearNeeds && spearNeeds.branch === 1 && spearNeeds.stone === 1 && spearNeeds.vine === 1, JSON.stringify(spearNeeds));

  // ---- 1. live pocketAmmo: sling tops up to the 6-stone cap ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'sling', name: 'Sling', units: 1, kg: 0.3 }];
  Game.villagerGearUp(vid, true);
  setMats(Game, { wood: 0, vine: 0, branch: 0, stick: 0, stone: 10, fiber: 0 });
  const outStone = Game.villagerPocketAmmo(vid);
  check('sling pockets pile stones to the cap (6)', outStone.ammoId === 'stone' && outStone.pocketed === 6 && outStone.crafted === 0, JSON.stringify(outStone));
  check('stones land in the pack (6)', ammoCountOf(p.items, 'stone') === 6);
  check('pile stone is spent (10 -> 4)', stashMats(Game).stone === 4, JSON.stringify(stashMats(Game)));
  const outFull = Game.villagerPocketAmmo(vid);
  check('a full pouch pockets nothing more', outFull.pocketed === 0, JSON.stringify(outFull));

  // ---- 2. live pocketAmmo: partial pouch tops up only the gap ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'sling', name: 'Sling', units: 1, kg: 0.3 },
    { itemId: 'stone', material: 'stone', units: 4, name: 'Stone', kcalEach: 0, kg: 0.1 }];
  Game.villagerGearUp(vid, true);
  setMats(Game, { wood: 0, vine: 0, branch: 0, stick: 0, stone: 10, fiber: 0 });
  const outTop = Game.villagerPocketAmmo(vid);
  check('partial pouch tops up only to 6 (+2)', outTop.pocketed === 2 && ammoCountOf(p.items, 'stone') === 6, JSON.stringify(outTop) + ' carried=' + ammoCountOf(p.items, 'stone'));

  // ---- 3. stoneCarriersSnap reads sling carriers only ----
  const snap0 = stoneCarriersSnap(Game);
  check('stoneCarriersSnap finds the sling carrier at 6', snap0[vid] && snap0[vid].rangedId === 'sling' && snap0[vid].carried === 6, JSON.stringify(snap0[vid]));
  check('stoneCarriersSnap skips non-sling villagers', !snap0[vid2] || snap0[vid2] === undefined, JSON.stringify(Object.keys(snap0)));

  // ---- 4. live volley: a sling volley spends 1 stone per shot ----
  const mdef = (Game.data.monsters || []).find(m => m.wave === 1) || (Game.data.monsters || [])[0];
  const stonesBefore = ammoCountOf(p.items, 'stone');
  let rec = null;
  try { rec = Game.fieldFight(vid, mdef, null, { allies: 1 }); } catch (e) { console.log('fieldFight error: ' + e.message); }
  check('sling carrier volleys in a wave-1 fight', stonesBefore === 6 && rec && rec.volley && rec.volley.shots > 0, 'stones=' + stonesBefore + ' ' + JSON.stringify(rec && rec.volley));
  check('volley spends exactly its shots', rec && rec.volley && ammoCountOf(p.items, 'stone') === stonesBefore - rec.volley.shots,
    'left=' + ammoCountOf(p.items, 'stone') + ' shots=' + (rec && rec.volley && rec.volley.shots));
  check('volley ammoLeft cross-check holds (entry - shots)', rec && rec.volley && rec.volley.ammoLeft === stonesBefore - rec.volley.shots,
    JSON.stringify(rec && rec.volley));

  // ---- 5. weapon craft: the crafter's OWN stones are spent, never the sling carrier's ----
  // p keeps the sling + its remaining stones; p2 is weaponless, knows
  // hunting_spear, and carries the recipe's materials in their own pack.
  const stonesP = ammoCountOf(p.items, 'stone');
  resetVillager(Game, p2);
  p2.items = [{ itemId: 'stone', material: 'stone', units: 1, name: 'Stone', kcalEach: 0, kg: 0.1 },
    { itemId: 'branch', material: 'branch', units: 1, name: 'Branch', kcalEach: 0, kg: 0.1 },
    { itemId: 'vine', material: 'vine', units: 1, name: 'Vine', kcalEach: 0, kg: 0.1 }];
  Game.state.village.weaponCraft = Game.state.village.weaponCraft || {};
  Game.state.village.weaponCraft[vid2] = { hunting_spear: 1 };
  setMats(Game, { wood: 5, vine: 5, branch: 5, stick: 10, stone: 10, fiber: 5 });
  const savedRandom = Math.random;
  Math.random = () => 0.1; // 35% blind craft succeeds
  let made = null;
  try { made = Game.villagerWeaponCraftDay(); } finally { Math.random = savedRandom; }
  check('weapon craft fires for the weaponless villager', made >= 1, 'made=' + made);
  check('the crafter now holds a hunting_spear', (p2.items || []).some(e => (e.itemId || e.id || e) === 'hunting_spear'), JSON.stringify(p2.items));
  check('the craft spent the crafter\'s OWN carried stone (1 -> 0)', ammoCountOf(p2.items, 'stone') === 0, 'stones=' + ammoCountOf(p2.items, 'stone'));
  check('the sling carrier\'s stones are untouched by the weapon craft', ammoCountOf(p.items, 'stone') === stonesP, 'carrier stones=' + ammoCountOf(p.items, 'stone') + ' before=' + stonesP);

  // ---- 6. ammo craft: a sling carrier is excluded (arrow/bolt only) ----
  const stonesP2 = ammoCountOf(p.items, 'stone');
  Math.random = () => 0.1;
  try { Game.villagerAmmoCraftDay(); } finally { Math.random = savedRandom; }
  check('ammo craft day leaves the sling carrier\'s stones alone', ammoCountOf(p.items, 'stone') === stonesP2, 'carrier stones=' + ammoCountOf(p.items, 'stone'));

  // ---- 7. gear day: gifts move weapons, never stones ----
  const stonesP3 = ammoCountOf(p.items, 'stone');
  try { Game.villagerGearDay(); } catch (e) { console.log('gearDay error: ' + e.message); }
  check('gear day leaves the sling carrier\'s stones alone', ammoCountOf(p.items, 'stone') === stonesP3, 'carrier stones=' + ammoCountOf(p.items, 'stone'));

  // ---- 8. kill loot: a kill never takes or adds a sling carrier's stones ----
  const stonesP4 = ammoCountOf(p.items, 'stone');
  let drop = null;
  try { drop = Game.villagerKillLoot(vid, mdef); } catch (e) { console.log('killLoot error: ' + e.message); }
  check('kill loot leaves the carrier\'s stones alone (drop is alien, not stone)', ammoCountOf(p.items, 'stone') === stonesP4 && drop !== 'stone', 'drop=' + drop + ' stones=' + ammoCountOf(p.items, 'stone'));

  // ---- 9. death pre-read: the carrier's stones are readable before registerDeath ----
  const kitP = rangedKitOf(Game, p);
  check('death pre-read sees the sling + its stones', kitP.rwId === 'sling' && kitP.ammoId === 'stone' && ammoCountOf(p.items, 'stone') === stonesP4, JSON.stringify(kitP) + ' stones=' + ammoCountOf(p.items, 'stone'));

  // ---- 10. census snap reads the sling carrier ----
  const snap = ammoCensusSnap(Game);
  const rowP = snap.census.find(r => r.vid === vid);
  check('census finds the sling carrier with its stones', !!rowP && rowP.rangedId === 'sling' && rowP.ammoId === 'stone' && rowP.ammo === stonesP4, JSON.stringify(rowP));
  check('census pile reads stone', snap.pile && typeof snap.pile.stone === 'number', JSON.stringify(snap.pile));

  // ---- 11. live smoke: the judged driver runs 5 days on seed 107021 ----
  // (substrate env set at the top of this file; DAYS=5.)
  const driver = require('./slingstone-driver-a');
  let smoke = null;
  try { smoke = await driver.oneRun(107021); } catch (e) { console.log('smoke error: ' + (e && e.stack || e)); }
  check('smoke ran (seed 107021, 5 days)', !!smoke && smoke.seed === 107021 && smoke.days >= 1, JSON.stringify(smoke && { days: smoke.days, endReason: smoke.endReason }));
  check('smoke substrate flags recorded', !!smoke && smoke.senseexpedOn === true && smoke.bowopenOn === false, JSON.stringify(smoke && { sense: smoke.senseexpedOn, bowopen: smoke.bowopenOn }));
  check('smoke duty wraps ran (all four duties called)', !!smoke && smoke.dutyCalls && smoke.dutyCalls.weaponCraft > 0 && smoke.dutyCalls.ammoCraft > 0 && smoke.dutyCalls.armorCraft > 0 && smoke.dutyCalls.gearDay > 0, JSON.stringify(smoke && smoke.dutyCalls));
  check('smoke census + departures recorded', !!smoke && Array.isArray(smoke.ammoCensus) && smoke.ammoCensus.length > 0 && Array.isArray(smoke.ammoDeparts), JSON.stringify(smoke && { census: smoke.ammoCensus.length, departs: smoke.ammoDeparts.length }));
  check('smoke stone ledger arrays present', !!smoke && Array.isArray(smoke.stoneFights) && Array.isArray(smoke.stoneDutyTakes) && Array.isArray(smoke.stoneLoot) && Array.isArray(smoke.stoneDeaths), JSON.stringify(smoke && { f: smoke.stoneFights.length, d: smoke.stoneDutyTakes.length, l: smoke.stoneLoot.length, x: smoke.stoneDeaths.length }));
  check('smoke volley cross-check holds on every sling fight', !!smoke && smoke.stoneFights.every(function (r) { return !r.volley || r.volley.ammoLeft == null || r.volley.ammoLeft === (r.ammoAtEntry - r.volley.shots); }), JSON.stringify(smoke && smoke.stoneFights.slice(0, 3)));
  check('smoke has no instrument errors', !!smoke && (smoke.instrumentErrors || []).length === 0, JSON.stringify(smoke && smoke.instrumentErrors.slice(0, 3)));

  // ---- 12. analyzer interop on the live smoke corpus ----
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ss-test-'));
  const sdir = path.join(tmp, 'leg');
  fs.mkdirSync(sdir);
  fs.writeFileSync(path.join(sdir, 's107021.json'), JSON.stringify(smoke));
  const st = stoneStats(sdir);
  check('analyzer reads the smoke corpus (1 valid file)', st.n === 1 && st.valid === 1 && st.errors === 0, JSON.stringify({ n: st.n, v: st.valid, e: st.errors }));
  check('analyzer ledger runs on live data (intervals counted)', typeof st.intervals === 'number' && typeof st.completeness === 'number' || st.drainTotal === 0, JSON.stringify({ iv: st.intervals, c: st.completeness, D: st.drainTotal }));
  const j = judge(st);
  check('judge returns a verdict on the smoke corpus', j.verdict === 'DIAG-GO' || j.verdict === 'DIAG-NO-GO', j.verdict);
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}

  console.log('SLINGSTONE_FAILS ' + failed + (fails.length ? ' ' + fails.join(',') : ''));
  console.log('SLINGSTONE_PASSED ' + passed + '/' + (passed + failed));
  if (failed) process.exitCode = 1;
}

main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });

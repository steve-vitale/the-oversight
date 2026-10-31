#!/usr/bin/env node
// proof-lootabilities-w3.js — proof for Arm 6, VILLAGER SELF-CRAFT
// (prereg: evidence/2026-10-31/lootabilities-preregs-20261031.md, Arm 6).
//
// BAR: a weaponless villager with (a) materials in their own reach
// (camp pile / own inventory) and (b) the relevant knowledge crafts a
// spear or bow through the existing recipe ladder in a seeded proof
// run, and EQUIPS it. Controls: no materials -> no craft; no knowledge
// -> no craft; already armed -> no craft. Old code (pristine master)
// shows the villager remaining weaponless in the same scenario
// (at best the sharpened-stick whittle from villagerGearUp).
//
// Harness: scripts/sim-harness.js (seeded Math.random BEFORE eval,
// src/js in index.html order minus DOM-only files). Game.save is never
// stubbed. One loadGame in this process; the pristine contrast runs in
// a CHILD process against ~/workspace/the-scattering (never two
// harnesses in one process).
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

// --- pristine scenario, stringified into a child node process ---
function pristineScenario(harnessPath) {
  const { loadGame, setupGame } = require(harnessPath);
  (async () => {
    const { Game } = await loadGame({ seed: 31031, mode: 'mvc', fullTelemetry: false });
    await setupGame(Game);
    const v = Game.state.village || {};
    const vid = (v.roster || []).find(id => id !== Game.villagerId);
    const p = Game.getPerson(vid);
    p.items = []; p.equipped = {}; p.stashed = [];
    if (v.away) delete v.away[vid];
    // the same gifts the new-code scenario gets: knowledge record + pile
    v.weaponCraft = { [vid]: { hunting_spear: 2, bow: 2, crude_bow: 2 } };
    const st = Game.stashState();
    st.materials.branch = 4; st.materials.stone = 2; st.materials.vine = 6; st.materials.wood = 2;
    v.wood = 10; // enable the whittle fallback, pristine's best outcome
    const hasDuty = typeof Game.villagerWeaponCraftDay === 'function';
    if (hasDuty) Game.villagerWeaponCraftDay();
    if (Game.villagerBuildDay) Game.villagerBuildDay();
    if (Game.villagerGearUp) Game.villagerGearUp(vid, true);
    const eq = (p.equipped || {});
    console.log(JSON.stringify({
      hasDuty,
      melee: (eq.melee && eq.melee.itemId) || null,
      ranged: (eq.ranged && eq.ranged.itemId) || null,
      items: (p.items || []).map(e => (e && (e.itemId || e.id)) || e),
    }));
  })().catch(e => { console.log(JSON.stringify({ error: String(e && e.message || e) })); });
}

(async () => {
  // ---- Part A: static wiring ----
  const vb = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'villager-build.js'), 'utf8');
  check('A1 villagerWeaponCraftDay defined in villager-build.js', /villagerWeaponCraftDay\(\)\s*\{/.test(vb));
  check('A2 villagerBuildDay calls villagerWeaponCraftDay', /villagerBuildDay\(\)[\s\S]{0,2500}villagerWeaponCraftDay\(\)/.test(vb));
  check('A3 ladder reads recipes.json data (no invented costs)', /recipes\.find\(r => r\.id === rid\)/.test(vb));

  // ---- Part B: live, seeded ----
  const { Game } = await loadGame({ seed: 31031, mode: 'mvc', fullTelemetry: false });
  check('B0 villagerWeaponCraftDay callable', typeof Game.villagerWeaponCraftDay === 'function');
  if (typeof Game.villagerWeaponCraftDay !== 'function') { console.log('pass=' + pass + ' fail=' + fail); process.exit(1); }
  const sayLines = [];
  const teleEvents = [];
  const origSay = Game.say;
  Game.say = function (...a) { try { sayLines.push(String(a[0] || '')); } catch (e) {} return origSay.apply(this, a); };
  const origTele = Game.tele;
  Game.tele = function (t, d) { try { teleEvents.push({ t, d }); } catch (e) {} return origTele.apply(this, arguments); };
  await setupGame(Game);

  const v = Game.state.village || {};
  const vessel = Game.villagerId;
  const others = (v.roster || []).filter(id => id !== vessel);
  check('B0b roster has >=4 non-vessel villagers', others.length >= 4, others);
  const [mainVid, noMatVid, noKnowVid, armedVid0] = others;
  const armedVid = armedVid0 || noKnowVid;
  const person = (vid) => Game.getPerson(vid);
  const day = () => Game.state.scholar.day;
  // stand the player at haven so workbench narration is witnessed
  if (Game.map) { Game.map.px = v.px != null ? v.px : 4; Game.map.py = v.py != null ? v.py : 4; }
  const resetVillager = (vid) => {
    const p = person(vid);
    p.items = []; p.equipped = {}; p.stashed = []; p.dead = false;
    if (v.away) delete v.away[vid];
    return p;
  };
  const pinOthers = (except) => {
    v.weaponCraftCd = v.weaponCraftCd || {};
    for (const rid of (v.roster || [])) {
      if (rid !== vessel && rid !== except) v.weaponCraftCd[rid] = day();
    }
  };
  const setPile = (mats) => {
    const st = Game.stashState();
    for (const m of ['wood', 'branch', 'stone', 'fiber', 'stick', 'vine', 'bark']) st.materials[m] = 0;
    Object.assign(st.materials, mats);
    return st.materials;
  };
  const equippedId = (vid, slot) => { const e = (person(vid).equipped || {})[slot]; return e ? (e.itemId || e.id || null) : null; };
  const anyEquipped = (vid) => [equippedId(vid, 'melee'), equippedId(vid, 'ranged')].filter(Boolean);
  const craftTeleFor = (vid) => teleEvents.filter(e => e.t === 'weapon_craft' && e.d && e.d.vid === vid);
  const benchLines = () => sayLines.filter(l => /workbench/.test(l));

  // ---------- MAIN: materials + knowledge -> spear, then bow ----------
  console.log('\n=== MAIN SCENARIO (seed 31031): weaponless + materials + knowledge ===');
  const mp = resetVillager(mainVid);
  v.weaponCraft = v.weaponCraft || {};
  v.weaponCraft[mainVid] = { hunting_spear: 2, bow: 2, crude_bow: 2 };
  const pile0 = setPile({ branch: 4, stone: 2, vine: 6, wood: 2 });
  pinOthers(mainVid);
  sayLines.length = 0; teleEvents.length = 0;
  console.log('before: melee=' + equippedId(mainVid, 'melee') + ' ranged=' + equippedId(mainVid, 'ranged') +
    ' pile=' + JSON.stringify(pile0) + ' knowledge=' + JSON.stringify(v.weaponCraft[mainVid]));
  const made1 = Game.villagerWeaponCraftDay();
  console.log('duty returned: ' + made1);
  console.log('transcript: ' + JSON.stringify(benchLines(), null, 1));
  console.log('tele: ' + JSON.stringify(craftTeleFor(mainVid)));
  console.log('after spear step: melee=' + equippedId(mainVid, 'melee') + ' ranged=' + equippedId(mainVid, 'ranged') +
    ' pile=' + JSON.stringify(Game.stashState().materials));
  // NOTE: items.json gives hunting_spear range 2 (reach), so the game's
  // own equipment system equips it in the ranged slot — asserted as
  // "equipped somewhere", with the actual slot printed.
  check('B1 spear crafted and EQUIPPED (hunting_spear)', anyEquipped(mainVid).includes('hunting_spear'), anyEquipped(mainVid));
  check('B1b weapon_craft tele ok for spear', craftTeleFor(mainVid).some(e => e.d.item === 'hunting_spear' && e.d.ok === true), craftTeleFor(mainVid));
  check('B1c workbench narration witnessed at haven', benchLines().some(l => /Hunting spear/.test(l)), benchLines());
  check('B1d pile paid the recipes.json cost (branch1+stone1+vine1)',
    Game.stashState().materials.branch === 3 && Game.stashState().materials.stone === 1 && Game.stashState().materials.vine === 5,
    Game.stashState().materials);
  check('B1e ladder order: full knowledge chose the SPEAR, not the bow',
    craftTeleFor(mainVid).every(e => e.d.item === 'hunting_spear'), craftTeleFor(mainVid));

  // BOW RUNG: same villager, reset to weaponless, knowing ONLY the bow
  // (no spear knowledge) — the ladder's next rung crafts and equips.
  console.log('\n=== BOW RUNG: weaponless, knows bow only ===');
  resetVillager(mainVid);
  v.weaponCraft[mainVid] = { bow: 2 };
  delete (v.weaponCraftCd || {})[mainVid];
  setPile({ branch: 4, stone: 2, vine: 6, wood: 2 });
  pinOthers(mainVid);
  sayLines.length = 0; teleEvents.length = 0;
  const made2 = Game.villagerWeaponCraftDay();
  console.log('duty returned: ' + made2);
  console.log('transcript: ' + JSON.stringify(benchLines(), null, 1));
  console.log('tele: ' + JSON.stringify(craftTeleFor(mainVid)));
  console.log('after bow step: equipped=' + JSON.stringify(anyEquipped(mainVid)) +
    ' pile=' + JSON.stringify(Game.stashState().materials));
  check('B2 bow crafted and EQUIPPED (bow)', anyEquipped(mainVid).includes('bow'), anyEquipped(mainVid));
  check('B2b pile paid the recipes.json bow cost (wood1+vine2)',
    Game.stashState().materials.wood === 1 && Game.stashState().materials.vine === 4,
    Game.stashState().materials);
  pinOthers(null);

  // ---------- CONTROL A: knowledge, NO materials ----------
  console.log('\n=== CONTROL A: knowledge but no materials ===');
  resetVillager(noMatVid);
  v.weaponCraft[noMatVid] = { hunting_spear: 2, bow: 2, crude_bow: 2 };
  setPile({});
  pinOthers(noMatVid);
  teleEvents.length = 0;
  Game.villagerWeaponCraftDay();
  console.log('after: melee=' + equippedId(noMatVid, 'melee') + ' ranged=' + equippedId(noMatVid, 'ranged') +
    ' items=' + JSON.stringify(person(noMatVid).items) + ' craftTele=' + JSON.stringify(craftTeleFor(noMatVid)));
  check('C1 no materials -> no craft, stays weaponless',
    equippedId(noMatVid, 'melee') === null && equippedId(noMatVid, 'ranged') === null && craftTeleFor(noMatVid).length === 0,
    { melee: equippedId(noMatVid, 'melee'), tele: craftTeleFor(noMatVid) });
  pinOthers(null); // pin everyone, incl. this villager, for later calls

  // ---------- CONTROL B: materials, NO knowledge ----------
  console.log('\n=== CONTROL B: materials but no knowledge ===');
  resetVillager(noKnowVid);
  delete v.weaponCraft[noKnowVid];
  setPile({ branch: 4, stone: 2, vine: 6, wood: 2 });
  pinOthers(noKnowVid);
  teleEvents.length = 0;
  Game.villagerWeaponCraftDay();
  console.log('after: melee=' + equippedId(noKnowVid, 'melee') + ' ranged=' + equippedId(noKnowVid, 'ranged') +
    ' items=' + JSON.stringify(person(noKnowVid).items) + ' craftTele=' + JSON.stringify(craftTeleFor(noKnowVid)) +
    ' knowledgeRecord=' + JSON.stringify(v.weaponCraft[noKnowVid] || null));
  check('C2 no knowledge -> no craft, stays weaponless',
    equippedId(noKnowVid, 'melee') === null && equippedId(noKnowVid, 'ranged') === null && craftTeleFor(noKnowVid).length === 0,
    { melee: equippedId(noKnowVid, 'melee'), tele: craftTeleFor(noKnowVid) });
  pinOthers(null);

  // ---------- CONTROL C: already armed ----------
  console.log('\n=== CONTROL C: already armed (knowledge + materials present) ===');
  const ap = resetVillager(armedVid);
  ap.items = ['hunting_spear', 'crude_bow'];
  const EQ = (globalThis.Scattering || {}).equipment;
  if (EQ) EQ.autoEquip(ap, Game.data.items);
  v.weaponCraft[armedVid] = { hunting_spear: 2, bow: 2, crude_bow: 2 };
  setPile({ branch: 4, stone: 2, vine: 6, wood: 2 });
  pinOthers(armedVid);
  teleEvents.length = 0;
  const itemsBefore = JSON.stringify(ap.items);
  Game.villagerWeaponCraftDay();
  console.log('after: melee=' + equippedId(armedVid, 'melee') + ' ranged=' + equippedId(armedVid, 'ranged') +
    ' itemsBefore=' + itemsBefore + ' itemsAfter=' + JSON.stringify(ap.items) + ' craftTele=' + JSON.stringify(craftTeleFor(armedVid)));
  check('C3 already armed -> no craft attempt, kit unchanged',
    craftTeleFor(armedVid).length === 0 && JSON.stringify(ap.items) === itemsBefore,
    { tele: craftTeleFor(armedVid), items: ap.items });

  // ---------- PART C: pristine master contrast (child process) ----------
  console.log('\n=== PRISTINE MASTER (~/workspace/the-scattering) same scenario ===');
  let pristine = null;
  try {
    const out = execFileSync(process.execPath, ['-e', `(${pristineScenario})(${JSON.stringify('/home/hatch/workspace/the-scattering/scripts/sim-harness.js')})`],
      { encoding: 'utf8', timeout: 240000, maxBuffer: 16 * 1024 * 1024 });
    const lastLine = out.trim().split('\n').filter(Boolean).pop();
    pristine = JSON.parse(lastLine);
  } catch (e) {
    console.log('pristine child run failed: ' + (e && e.message));
  }
  if (pristine && !pristine.error) {
    console.log('pristine result: ' + JSON.stringify(pristine));
    check('P1 pristine has no villagerWeaponCraftDay', pristine.hasDuty === false, pristine);
    check('P2 pristine villager gets NO crafted spear/bow (whittle stick at best)',
      pristine.melee !== 'hunting_spear' && pristine.ranged !== 'bow' && pristine.ranged !== 'crude_bow', pristine);
  } else {
    // static fallback: pristine villager-build.js has no self-craft duty;
    // the only weaponless acquisition in pristine game.js villagerGearUp
    // is own stash -> deposited armory -> whittle a sharpened stick.
    const pvb = fs.readFileSync('/home/hatch/workspace/the-scattering/src/js/villager-build.js', 'utf8');
    check('P1s pristine villager-build.js has no villagerWeaponCraftDay (static)', !/villagerWeaponCraftDay/.test(pvb));
    console.log('pristine contrast by code reading: pristine villagerGearUp acquire order is own carried -> own stashed -> communal armory -> whittle sharpened_stick from the woodpile; no craft duty exists, so the scenario villager stays weaponless (or whittles a +5 stick).');
  }

  console.log('\npass=' + pass + ' fail=' + fail);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF ERROR', e); process.exit(2); });

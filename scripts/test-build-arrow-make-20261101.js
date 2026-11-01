#!/usr/bin/env node
// test-build-arrow-make-20261101.js — proof for BUILD ARM 5, ARCHER
// ARROW-MAKING (2026-11-01).
//
// BLANK (1415Z ammo census, reused — NOT re-run): bows with NO arrows
// in 24/65 wave-4 fights, volley literally 0%. The volley engine
// (fieldFights.js) already fires when the fighter CARRIES matching
// ammo, and villagerPocketAmmo (game.js) already crafts arrows at
// DEPARTURE — but a bow-carrier who never departs (home defense, a
// failed 35% blind departure craft, arrows spent in an earlier fight)
// reaches a fight arrowless, and nothing at home ever re-arms them.
//
// FIX (route call, documented in evidence/2026-11-01/build-arrow-make.md):
// extend the shipped self-craft pattern (villagerWeaponCraftDay, the
// daily at-home beat in villager-build.js) with villagerAmmoCraftDay:
// a bow/crossbow-carrier AT HOME carrying fewer than one batch (5) of
// matching ammo crafts one batch from their own carried materials +
// the communal camp pile, using the EXISTING arrow/bolt recipes and
// the player's craft odds exactly (blind 35%, learned 85%; a blind
// success teaches, the PRACTICE rule; shared v.ammoCraft record with
// villagerPocketAmmo). One attempt per villager per 3 days (the
// weapon-craft cooldown), so a failed blind craft cannot drain the
// pile day after day. REJECTED route: fight-entry top-up — fieldFight
// deliberately gears up acquire=false ("a fighter doesn't whittle a
// spear mid-fight"); a fighter far from home cannot honestly spend
// pile materials. This beat only fires at home, standing at the pile.
//
// BAR: (BEFORE) a bow-carrier with no arrows enters a wave-4 fight
// and volleys 0 shots; (AFTER) the same villager, after the daily
// beat with pile materials, carries a batch of arrows and the same
// fight volleys >= 1 shot. Controls: no ranged weapon -> no craft;
// no materials -> no craft; already stocked (5+) -> no attempt, pile
// untouched. On pre-fix master the duty does not exist, so the AFTER
// checks fail — that RED run is the proof-first gate (run this script
// before implementing: A1/B0 fail and the script exits nonzero).
//
// CAVEAT (volleyfix): perfect ammo alone is only ~2% of a wave-4
// beast's HP. This arm restores a verb; it does NOT claim lethality.
//
// Harness: scripts/sim-harness.js (seeded Math.random BEFORE eval).
// One loadGame in this process. The MAIN craft uses a temporary
// Math.random stub pinned to 0.0 (guaranteed success) so the mechanism
// + pile accounting are deterministic; the stub is restored
// immediately after the duty call. Controls need no RNG (they assert
// NO attempt, which holds for any roll).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

(async () => {
  // ---- Part A: static wiring ----
  const vb = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'villager-build.js'), 'utf8');
  check('A1 villagerAmmoCraftDay defined in villager-build.js', /villagerAmmoCraftDay\(\)\s*\{/.test(vb));
  check('A2 villagerBuildDay calls villagerAmmoCraftDay', /villagerBuildDay\(\)[\s\S]{0,3000}villagerAmmoCraftDay\(\)/.test(vb));
  check('A3 reads the EXISTING arrow/bolt recipe (no invented costs)', /recipes\.find\(r => r\.id === ammoId\)/.test(vb));
  check('A4 shares the pocket-ammo knowledge record (v.ammoCraft)', /v\.ammoCraft/.test(vb));
  check('A5 home-only: skips villagers away from home', /villagerAmmoCraftDay\(\)[\s\S]{0,3000}!\(\(v\.away/.test(vb));

  // ---- Part B: live, seeded ----
  const { Game } = await loadGame({ seed: 31101, mode: 'mvc', fullTelemetry: false });
  check('B0 villagerAmmoCraftDay callable', typeof Game.villagerAmmoCraftDay === 'function');
  if (typeof Game.villagerAmmoCraftDay !== 'function') { console.log('pass=' + pass + ' fail=' + fail); process.exit(1); }
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
  const [mainVid, noMatVid, noWeaponVid, stockedVid, beforeVid] = others;
  const person = (vid) => Game.getPerson(vid);
  const day = () => Game.state.scholar.day;
  if (Game.map) { Game.map.px = v.px != null ? v.px : 4; Game.map.py = v.py != null ? v.py : 4; }
  const EQ = (globalThis.Scattering || {}).equipment;
  const resetVillager = (vid) => {
    const p = person(vid);
    p.items = []; p.equipped = {}; p.stashed = []; p.dead = false;
    if (v.away) delete v.away[vid];
    return p;
  };
  const giveBow = (vid) => {
    const p = person(vid);
    p.items = [{ itemId: 'bow', units: 1 }];
    if (EQ) EQ.autoEquip(p, Game.data.items);
    return p;
  };
  const pinOthers = (except) => {
    v.arrowCraftCd = v.arrowCraftCd || {};
    for (const rid of (v.roster || [])) {
      if (rid !== vessel && rid !== except) v.arrowCraftCd[rid] = day();
    }
    // the scenario villager must actually REACH the decision (a
    // leftover cooldown pin from the previous scenario would make
    // every control pass vacuously by skipping them outright)
    if (except) delete v.arrowCraftCd[except];
  };
  const setPile = (mats) => {
    const st = Game.stashState();
    for (const m of ['wood', 'branch', 'stone', 'fiber', 'stick', 'vine', 'bark']) st.materials[m] = 0;
    Object.assign(st.materials, mats);
    return st.materials;
  };
  const pile = () => Game.stashState().materials;
  const carriedAmmo = (vid, ammoId) => {
    let n = 0;
    for (const e of (person(vid).items || [])) {
      const eid = (typeof e === 'string') ? e : (e && (e.itemId || e.id || e.material));
      if (eid === ammoId) n += (typeof e === 'string') ? 1 : (e.units || 1);
    }
    return n;
  };
  const equippedRanged = (vid) => {
    const e = (person(vid).equipped || {}).ranged;
    return e ? (e.itemId || e.id || null) : null;
  };
  const ammoTeleFor = (vid) => teleEvents.filter(e => e.t === 'ammo_craft' && e.d && e.d.vid === vid);
  const benchLines = () => sayLines.filter(l => /workbench/.test(l));
  const mdef = (Game.data.monsters || []).find(m => m.id === 'congregation');
  check('B0c wave-4 congregation def present', !!mdef && mdef.wave === 4, mdef && mdef.id);

  // ---------- CONTROL A: no ranged weapon -> no craft ----------
  console.log('\n=== CONTROL A: no ranged weapon, pile stocked ===');
  resetVillager(noWeaponVid);
  setPile({ stick: 10, stone: 10, fiber: 10 });
  pinOthers(noWeaponVid);
  teleEvents.length = 0;
  const pileBeforeA = JSON.stringify(pile());
  Game.villagerAmmoCraftDay();
  console.log('after: ranged=' + equippedRanged(noWeaponVid) + ' arrows=' + carriedAmmo(noWeaponVid, 'arrow') +
    ' tele=' + JSON.stringify(ammoTeleFor(noWeaponVid)) + ' pileSame=' + (JSON.stringify(pile()) === pileBeforeA));
  check('C1 no ranged weapon -> no craft attempt, pile untouched',
    ammoTeleFor(noWeaponVid).length === 0 && carriedAmmo(noWeaponVid, 'arrow') === 0 && JSON.stringify(pile()) === pileBeforeA,
    { tele: ammoTeleFor(noWeaponVid), pile: pile() });
  pinOthers(null);

  // ---------- CONTROL B: bow, NO materials -> no craft ----------
  console.log('\n=== CONTROL B: bow but no materials ===');
  resetVillager(noMatVid);
  giveBow(noMatVid);
  v.ammoCraft = v.ammoCraft || {};
  v.ammoCraft[noMatVid] = { arrow: 2 };
  setPile({});
  pinOthers(noMatVid);
  teleEvents.length = 0;
  Game.villagerAmmoCraftDay();
  console.log('after: ranged=' + equippedRanged(noMatVid) + ' arrows=' + carriedAmmo(noMatVid, 'arrow') +
    ' tele=' + JSON.stringify(ammoTeleFor(noMatVid)));
  check('C2 no materials -> no craft, stays arrowless',
    carriedAmmo(noMatVid, 'arrow') === 0 && ammoTeleFor(noMatVid).length === 0,
    { tele: ammoTeleFor(noMatVid) });
  pinOthers(null);

  // ---------- CONTROL C: already stocked (5+) -> no attempt ----------
  console.log('\n=== CONTROL C: bow + 5 arrows already ===');
  resetVillager(stockedVid);
  giveBow(stockedVid);
  person(stockedVid).items.push({ itemId: 'arrow', material: 'arrow', units: 5, name: 'Arrow', kcalEach: 0, kg: 0.1 });
  v.ammoCraft[stockedVid] = { arrow: 2 };
  setPile({ stick: 10, stone: 10, fiber: 10 });
  pinOthers(stockedVid);
  teleEvents.length = 0;
  const pileBeforeC = JSON.stringify(pile());
  Game.villagerAmmoCraftDay();
  console.log('after: arrows=' + carriedAmmo(stockedVid, 'arrow') + ' tele=' + JSON.stringify(ammoTeleFor(stockedVid)) +
    ' pileSame=' + (JSON.stringify(pile()) === pileBeforeC));
  check('C3 already stocked -> no attempt, pile untouched',
    ammoTeleFor(stockedVid).length === 0 && carriedAmmo(stockedVid, 'arrow') === 5 && JSON.stringify(pile()) === pileBeforeC,
    { tele: ammoTeleFor(stockedVid), pile: pile() });
  pinOthers(null);

  // ---------- BEFORE: bow, no arrows, wave-4 fight -> 0 volley shots ----------
  console.log('\n=== BEFORE (seed 31101): bow, no arrows, wave-4 fight ===');
  resetVillager(beforeVid);
  giveBow(beforeVid);
  console.log('before fight: ranged=' + equippedRanged(beforeVid) + ' arrows=' + carriedAmmo(beforeVid, 'arrow'));
  const recBefore = Game.fieldFight(beforeVid, mdef, null, {});
  console.log('fight outcome=' + recBefore.outcome + ' volley=' + JSON.stringify(recBefore.volley));
  check('D1 BEFORE: no arrows -> volley fires 0 shots',
    recBefore.volley && recBefore.volley.shots === 0, recBefore.volley);
  check('D1b BEFORE: the string-stays-drawn line is narrated, never silent',
    (recBefore.log || []).some(l => /no arrows/.test(l)), (recBefore.log || []).slice(0, 6));

  // ---------- MAIN: bow + pile -> batch of arrows ----------
  console.log('\n=== MAIN (seed 31101): bow + pile materials -> arrows ===');
  resetVillager(mainVid);
  giveBow(mainVid);
  v.ammoCraft[mainVid] = { arrow: 2 };
  setPile({ stick: 10, stone: 10, fiber: 10 });
  pinOthers(mainVid);
  sayLines.length = 0; teleEvents.length = 0;
  console.log('before: ranged=' + equippedRanged(mainVid) + ' arrows=' + carriedAmmo(mainVid, 'arrow') +
    ' pile=' + JSON.stringify(pile()));
  const realRandom = Math.random;
  Math.random = () => 0.0; // guaranteed success: mechanism + accounting, deterministic
  let made;
  try { made = Game.villagerAmmoCraftDay(); } finally { Math.random = realRandom; }
  console.log('duty returned: ' + made);
  console.log('transcript: ' + JSON.stringify(benchLines(), null, 1));
  console.log('tele: ' + JSON.stringify(ammoTeleFor(mainVid)));
  console.log('after: arrows=' + carriedAmmo(mainVid, 'arrow') + ' pile=' + JSON.stringify(pile()));
  check('B1 arrows crafted: one batch (5) in the pack', carriedAmmo(mainVid, 'arrow') === 5, carriedAmmo(mainVid, 'arrow'));
  check('B1b ammo_craft tele ok for arrows', ammoTeleFor(mainVid).some(e => e.d.item === 'arrow' && e.d.ok === true), ammoTeleFor(mainVid));
  check('B1c pile paid the recipes.json arrow cost exactly (stick2+stone1+fiber1)',
    pile().stick === 8 && pile().stone === 9 && pile().fiber === 9, pile());
  check('B1d workbench narration witnessed at haven', benchLines().some(l => /arrow/i.test(l)), benchLines());
  check('B1e duty counted the craft', made >= 1, made);

  // ---------- AFTER: same villager, now armed, same fight -> volley fires ----------
  console.log('\n=== AFTER (seed 31101): same villager, 5 arrows, wave-4 fight ===');
  console.log('before fight: ranged=' + equippedRanged(mainVid) + ' arrows=' + carriedAmmo(mainVid, 'arrow'));
  const recAfter = Game.fieldFight(mainVid, mdef, null, {});
  console.log('fight outcome=' + recAfter.outcome + ' volley=' + JSON.stringify(recAfter.volley) +
    ' arrowsLeft=' + carriedAmmo(mainVid, 'arrow'));
  check('D2 AFTER: arrows on hand -> volley fires >= 1 shot',
    recAfter.volley && recAfter.volley.shots >= 1, recAfter.volley);
  check('D2b AFTER: volley spent real ammo (quiver empties honestly)',
    carriedAmmo(mainVid, 'arrow') === 5 - (recAfter.volley ? recAfter.volley.shots : 0),
    { left: carriedAmmo(mainVid, 'arrow'), volley: recAfter.volley });

  console.log('\npass=' + pass + ' fail=' + fail);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF ERROR', e); process.exit(2); });

#!/usr/bin/env node
// test-pairarming-a.js — proof test for the wave-5 pair-arming
// diagnostic (arm sim-pairarming-a, run fleshout-20261112T1624Z
// follow-up).
//
// THE QUESTION (evidence/2026-11-12/sim-bisect-r9-cut-a.md §5,
// §8.5): on the r9 base, seed 190398 holds a wave-5 pair for 19
// days (d131–149) with armed 4–5 vs demand 6 and never qualifies;
// armed falls 4 → 3 over the block. WHY do armed counts fall while
// a pair holds — not whether pairs form.
//
// THE FIX-SWAP: this base (ee30f22a2, the r9 cut base) predates
// the r131 roster-check fix, so src/js/standing.js on disk is the
// PRE-FIX version (sha256 98c8bfad70d7...). The fix standing.js
// (sha256 f8fda4295a99..., from `git show
// 5157782a4:src/js/standing.js`) is swapped in UNCOMMITTED for the
// run and restored byte-identical afterwards. The driver refuses to
// run unless the on-disk standing.js carries the "ROSTER CHECK"
// marker AND its sha256 is exactly the fix sha. The proof's live
// legs REQUIRE the swap (a TB-fallen veteran reads 0 in readiness
// only with the fix in place), so the proof cannot pass green on
// an unswapped tree.
//
// WHAT THIS TEST PROVES (before any judged sim):
//   1. Engine APIs — the APIs the gear instrument needs exist on
//      the loaded game (villageStanding, standingCfg,
//      waveCombatReadiness, armorBonus, equippedWeapon, vpOf,
//      stashState; S.equipment armorOf/meleeWeaponOf/
//      rangedWeaponOf; standingCfg plentyCapT5 + readyDemand[5]).
//   2. Gear snapshot vs the engine rule — on a live fresh run the
//      replicated armed/armored/veterans totals equal the engine's
//      waveCombatReadiness(5) read with 0 instrument errors; on a
//      stub Game the armed predicate is exact (scholar equipped,
//      villager melee, villager carried-weapon, villager unarmed).
//   3. Attribution classes on synthetic day-pairs — death
//      (registerDeath row), death-flag-no-row, departure (exiles
//      entry, living vp), gear-loss transferred, gear-loss
//      stolen/vanished, scholar-death succession, join-armed gain,
//      veteran-loss, unattributed (drop with no member delta),
//      over-explained (instrument error, never silent), and
//      simultaneous losses + gain (3 deaths + 1 armed joiner is a
//      net drop of 2 with 3 explained events — not over-explained).
//   4. Hold detection — pair-hold (veterans >= 2, peak < 5) vs
//      deferral-hold (+ capped standing >= 200), blocks of
//      consecutive deferral-hold days, ceiling (roster < 6).
//   5. Replay-identity comparison on a synthetic corpus —
//      identical trajectories compare clean; one armed divergence,
//      one missing day, and one unreadable field are each counted;
//      duplicate-day snapshots (the village-loss day is recorded
//      twice: in-day, then a post-loss flush) align by occurrence
//      in order, and swapped occurrences mismatch.
//   6. Analyzer GO-bar table — GO only when unattributed <= 1
//      AND coverage 100% AND replay 100%; each failing condition
//      alone is NO-GO with its reason named.
//   7. Seed-band identity + driver leg guard — exactly seeds
//      190391–190398; driver writes to perseed-pairarming-a and
//      never to the r9 corpus; legGuard accepts the swapped fix
//      text (marker + exact fix sha, from the pinned vetphantom
//      commit) and refuses the pre-fix r9-base text and a
//      marker-bearing wrong-sha text.
//   8. Corpus completeness — the analyzer's loader reports 8/8
//      complete on a full synthetic corpus and names the missing
//      seed on a partial one.
//   9. Roster-check live — a TB-fallen veteran reads 0 in the
//      swapped-in readiness gate (the fix the whole diag stands
//      on); a scholar wave-3 kill reads 1.
//
// Usage: node scripts/test-pairarming-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const H = require('./sim-harness');
const { competent } = require('./policies/competent');
const VF = require('./vetfirst-instrument-20261111');
const PA = require('./pairarming-instrument-20261112');
const AN = require('./pairarming-analyze-20261112');
const DR = require('./pairarming-driver-20261112');
const T = K.reporter('pairarming-a');

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function snapRow(vid, fields) {
  const base = {
    vid: vid, name: vid, isScholar: false, alive: true, armed: false,
    meleeId: null, rangedId: null, carriedWeaponIds: [], equippedItemIds: [],
    carriedArmorIds: [], armorP: 0, veteranW4: false, hp: 10,
  };
  return Object.assign(base, fields || {});
}

function synthSnap(day, fields) {
  const base = {
    day: day, scholarId: 'scholar1', peakWave: 4, standingRaw: 210, cappedStanding: 210,
    ready5: { ready: false, armored: 1, armed: 2, tricks: 0, veterans: 2, short: [] },
    deathsToday: [], exiles: [], stashWeaponIds: [], stashArmorIds: [],
    pantryWeaponIds: [], pantryArmorIds: [], members: [], armed: 2, armored: 1,
    veteransW4: [], veterans: 2, prevVanished: [], instrumentErrors: [],
  };
  return Object.assign(base, fields || {});
}

(async () => {
  const Game = await K.load({ seed: 131102 });

  // ---- 1. Engine APIs the gear instrument needs ----
  T.section('1. Engine APIs — the gear instrument’s reads exist on the loaded game');
  const apis = ['villageStanding', 'standingCfg', 'waveCombatReadiness', 'armorBonus', 'equippedWeapon', 'vpOf', 'stashState'];
  for (const name of apis) {
    T.ok('Game.' + name + ' is a function', typeof Game[name] === 'function', typeof Game[name]);
  }
  const S = (typeof globalThis !== 'undefined' && globalThis.Scattering) || {};
  const eq = S.equipment || {};
  for (const name of ['armorOf', 'meleeWeaponOf', 'rangedWeaponOf']) {
    T.ok('S.equipment.' + name + ' is a function', typeof eq[name] === 'function', typeof eq[name]);
  }
  let cfg = null;
  try { cfg = Game.standingCfg(); } catch (e) { cfg = null; }
  T.ok('standingCfg() returns a cfg', !!cfg, cfg ? 'ok' : 'null');
  T.ok('standingCfg().plentyCapT5 is a number', cfg && typeof cfg.plentyCapT5 === 'number', 'plentyCapT5=' + (cfg && cfg.plentyCapT5));
  T.ok('standingCfg().readyDemand[5] exists', !!(cfg && cfg.readyDemand && cfg.readyDemand[5]), JSON.stringify(cfg && cfg.readyDemand && cfg.readyDemand[5]));

  // ---- 9. Roster-check live (the fix the diag stands on) ----
  T.section('9. Roster-check live — TB-fallen veteran reads 0 with the fix swapped in');
  function fresh() {
    K.newRun(Game);
    Game.state.waveKillLog = Game.state.waveKillLog || [];
    const roster = (Game.state.village && Game.state.village.roster) || [];
    const scholarId = Game.villagerId;
    const others = roster.filter(function (v) { return v && v !== scholarId; });
    if (others.length < 1) throw new Error('fresh run has <1 non-scholar roster member');
    return { vidA: others[0], scholarId: scholarId };
  }
  function giveKill(vid, w) {
    Game.state.waveKillLog.push({ by: vid, w: w, day: gday(Game) || 1 });
  }
  function onRoster(vid) { return ((Game.state.village || {}).roster || []).includes(vid); }
  let f = fresh();
  giveKill(f.vidA, 3);
  let r4 = -1;
  try { r4 = (Game.waveCombatReadiness(4) || {}).veterans; } catch (e) { r4 = 'ERR'; }
  T.ok('alive w3 killer: readiness(4) veterans = 1', r4 === 1, 'r4=' + r4);
  Game.tbVillagerFalls({ villagerId: f.vidA });
  T.ok('TB fall removes the villager from the roster', !onRoster(f.vidA), 'roster len ' + ((Game.state.village || {}).roster || []).length);
  try { r4 = (Game.waveCombatReadiness(4) || {}).veterans; } catch (e) { r4 = 'ERR'; }
  T.ok('death day: readiness(4) veterans = 0 (no phantom with the fix swapped in)', r4 === 0, 'r4=' + r4);
  f = fresh();
  giveKill(f.scholarId, 3);
  try { r4 = (Game.waveCombatReadiness(4) || {}).veterans; } catch (e) { r4 = 'ERR'; }
  T.ok('scholar w3 killer: readiness(4) veterans = 1 (scholar counts)', r4 === 1, 'r4=' + r4);

  // ---- 2. Gear snapshot vs the engine rule ----
  T.section('2. Gear snapshot vs the engine rule — live fresh run, then stub Game');
  f = fresh();
  let snap = null;
  try { snap = PA.gearSnapshot(Game, null, []); } catch (e) { snap = null; }
  T.ok('live gearSnapshot returns a snapshot', !!snap && Array.isArray(snap.members), snap ? snap.members.length + ' members' : 'null');
  T.ok('live gearSnapshot: 0 instrumentErrors', snap && snap.instrumentErrors.length === 0, JSON.stringify(snap && snap.instrumentErrors));
  T.ok('live gearSnapshot: replicated armed equals engine ready5.armed', snap && snap.ready5 && snap.armed === snap.ready5.armed, 'replicated ' + (snap && snap.armed) + ' vs engine ' + (snap && snap.ready5 && snap.ready5.armed));
  T.ok('live gearSnapshot: replicated armored equals engine ready5.armored', snap && snap.ready5 && snap.armored === snap.ready5.armored, 'replicated ' + (snap && snap.armored) + ' vs engine ' + (snap && snap.ready5 && snap.ready5.armored));
  T.ok('live gearSnapshot: replicated veterans equals engine ready5.veterans', snap && snap.ready5 && snap.veterans === snap.ready5.veterans, 'replicated ' + (snap && snap.veterans) + ' vs engine ' + (snap && snap.ready5 && snap.ready5.veterans));
  // Stub Game: exact armed predicate.
  const realEq = S.equipment;
  const stubEq = {
    armorOf: function (vp) { return (vp && vp.equipped && vp.equipped.armor) ? 16 : 0; },
    meleeWeaponOf: function (vp) { return (vp && vp.equipped && vp.equipped.melee) || null; },
    rangedWeaponOf: function (vp) { return (vp && vp.equipped && vp.equipped.ranged) || null; },
  };
  globalThis.Scattering.equipment = stubEq;
  const stubVps = {
    v1: { name: 'V One', dead: false, equipped: { melee: 'sword1', armor: 'armor1' }, items: [], hp: 10 },
    v2: { name: 'V Two', dead: false, equipped: {}, items: [{ itemId: 'sword1' }], hp: 10 },
  };
  const stubGame = {
    villagerId: 'scholar1',
    state: {
      scholar: { day: 5, inventory: [], equipped: {}, health: 10 },
      village: { roster: ['scholar1', 'v1', 'v2'], exiles: [], pantry: [] },
      waveKillLog: [{ by: 'v1', w: 4, day: 3 }],
      _standingPeakWave: 4,
    },
    data: { items: [{ id: 'sword1', weapon: true }, { id: 'armor1', armor: true }], villagers: [] },
    villageStanding: function () { return { total: 210, war: 100, diplomacy: 80, plenty: 60 }; },
    standingCfg: function () { return { plentyCapT5: 100 }; },
    waveCombatReadiness: function () { return { ready: false, armored: 1, armed: 3, tricks: 0, veterans: 1, short: [] }; },
    armorBonus: function () { return 10; },
    equippedWeapon: function () { return { itemId: 'sword1' }; },
    vpOf: function (vid) { return stubVps[vid] || null; },
    stashState: function () { return { weapons: [], armor: [] }; },
  };
  let stubSnap = null;
  try { stubSnap = PA.gearSnapshot(stubGame, null, []); } catch (e) { stubSnap = null; }
  globalThis.Scattering.equipment = realEq;
  T.ok('stub gearSnapshot returns a snapshot', !!stubSnap, stubSnap ? stubSnap.members.length + ' members' : 'null');
  T.ok('stub gearSnapshot: 0 instrumentErrors', stubSnap && stubSnap.instrumentErrors.length === 0, JSON.stringify(stubSnap && stubSnap.instrumentErrors));
  T.ok('stub: scholar armed via equipped weapon', stubSnap && stubSnap.members[0].armed === true && stubSnap.members[0].meleeId === 'sword1', JSON.stringify(stubSnap && stubSnap.members[0]));
  T.ok('stub: scholar armorP 10 (not armored at demand 15)', stubSnap && stubSnap.members[0].armorP === 10, 'armorP=' + (stubSnap && stubSnap.members[0].armorP));
  T.ok('stub: v1 armed via melee + armored (armorP 16)', stubSnap && stubSnap.members[1].armed === true && stubSnap.members[1].armorP === 16, JSON.stringify(stubSnap && stubSnap.members[1]));
  T.ok('stub: v1 is a wave-4 veteran', stubSnap && stubSnap.members[1].veteranW4 === true, 'veteranW4=' + (stubSnap && stubSnap.members[1].veteranW4));
  T.ok('stub: v2 armed via CARRIED weapon (not equipped)', stubSnap && stubSnap.members[2].armed === true && stubSnap.members[2].carriedWeaponIds.indexOf('sword1') >= 0, JSON.stringify(stubSnap && stubSnap.members[2]));
  T.ok('stub: totals armed 3 / armored 1 / veterans 1 match the engine', stubSnap && stubSnap.armed === 3 && stubSnap.armored === 1 && stubSnap.veterans === 1, 'armed=' + (stubSnap && stubSnap.armed) + ' armored=' + (stubSnap && stubSnap.armored) + ' veterans=' + (stubSnap && stubSnap.veterans));

  // ---- 3. Attribution classes on synthetic day-pairs ----
  T.section('3. Attribution classes on synthetic day-pairs');
  function armedPair(day, prevMembers, curMembers, extra) {
    const prev = synthSnap(day - 1, { members: prevMembers, armed: prevMembers.filter(function (m) { return m.alive && m.armed; }).length, veteransW4: prevMembers.filter(function (m) { return m.veteranW4; }).map(function (m) { return m.vid; }) });
    const cur = synthSnap(day, Object.assign({ members: curMembers, armed: curMembers.filter(function (m) { return m.alive && m.armed; }).length, veteransW4: curMembers.filter(function (m) { return m.veteranW4; }).map(function (m) { return m.vid; }) }, extra || {}));
    prev.ready5.armed = prev.armed; cur.ready5.armed = cur.armed;
    return PA.diffGearDays(prev, cur);
  }
  // death via registerDeath row
  let prevM = [snapRow('a', { armed: true, meleeId: 'sword1', equippedItemIds: ['sword1'] }), snapRow('b', { armed: true, meleeId: 'sword1', equippedItemIds: ['sword1'] })];
  let curM = [snapRow('b', { armed: true, meleeId: 'sword1', equippedItemIds: ['sword1'] })];
  let diff = armedPair(10, prevM, curM, { deathsToday: ['a'], prevVanished: [{ vid: 'a', name: 'a', exists: true, dead: true }] });
  T.ok('death: armed drop attributed to death (registerDeath row)', diff.armedEvents.length === 1 && diff.armedEvents[0].class === 'death' && diff.unattributedArmed === 0, JSON.stringify(diff.armedEvents));
  // death-flag-no-row
  diff = armedPair(10, prevM, curM, { deathsToday: [], prevVanished: [{ vid: 'a', name: 'a', exists: true, dead: true }] });
  T.ok('death-flag-no-row: armed drop attributed to death', diff.armedEvents.length === 1 && diff.armedEvents[0].class === 'death' && diff.armedEvents[0].subclass === 'death-flag-no-row', JSON.stringify(diff.armedEvents));
  // departure via exiles entry, living vp
  diff = armedPair(10, prevM, curM, { deathsToday: [], prevVanished: [{ vid: 'a', name: 'a', exists: true, dead: false }], exiles: [{ vid: 'a', how: 'exiled', day: 10 }] });
  T.ok('departure: armed drop attributed to departure/exiled', diff.armedEvents.length === 1 && diff.armedEvents[0].class === 'departure' && diff.armedEvents[0].subclass === 'exiled', JSON.stringify(diff.armedEvents));
  // gear-loss transferred
  prevM = [snapRow('a', { armed: true, meleeId: 'sword1', equippedItemIds: ['sword1'] }), snapRow('b', { armed: true, meleeId: 'axe1', equippedItemIds: ['axe1'] })];
  curM = [snapRow('a', { armed: false, meleeId: null, equippedItemIds: [] }), snapRow('b', { armed: true, meleeId: 'axe1', equippedItemIds: ['axe1', 'sword1'] })];
  diff = armedPair(10, prevM, curM, {});
  T.ok('gear-loss transferred: weapon found on another member', diff.armedEvents.length === 1 && diff.armedEvents[0].class === 'gear-loss' && diff.armedEvents[0].subclass === 'transferred', JSON.stringify(diff.armedEvents));
  // gear-loss stolen/vanished
  curM = [snapRow('a', { armed: false, meleeId: null, equippedItemIds: [] }), snapRow('b', { armed: true, meleeId: 'axe1', equippedItemIds: ['axe1'] })];
  diff = armedPair(10, prevM, curM, {});
  T.ok('gear-loss stolen/vanished: weapon found nowhere', diff.armedEvents.length === 1 && diff.armedEvents[0].class === 'gear-loss' && diff.armedEvents[0].subclass === 'stolen/vanished', JSON.stringify(diff.armedEvents));
  // scholar-death succession (the successor scholar id is read
  // from cur.scholarId, so it is set explicitly)
  prevM = [snapRow('scholar1', { isScholar: true, armed: true, meleeId: 'sword1', equippedItemIds: ['sword1'] }), snapRow('b', { armed: true, meleeId: 'axe1', equippedItemIds: ['axe1'] })];
  curM = [snapRow('b', { armed: true, meleeId: 'axe1', equippedItemIds: ['axe1'] })];
  const prev2 = synthSnap(9, { members: prevM, scholarId: 'scholar1', armed: 2 });
  const cur2 = synthSnap(10, { members: curM, scholarId: 'b', armed: 1, deathsToday: ['scholar1'], prevVanished: [{ vid: 'scholar1', name: 's', exists: true, dead: true }] });
  prev2.ready5.armed = 2; cur2.ready5.armed = 1;
  diff = PA.diffGearDays(prev2, cur2);
  T.ok('scholar-death succession: class death, subclass scholar-death, successionTo named', diff.armedEvents.length === 1 && diff.armedEvents[0].class === 'death' && diff.armedEvents[0].subclass === 'scholar-death' && diff.armedEvents[0].successionTo === 'b', JSON.stringify(diff.armedEvents));
  // simultaneous losses + gain: 3 deaths and 1 armed joiner is a
  // net drop of 2 with 3 explained events — NOT over-explained
  // (the 190391 d75 case that the pre-fix check flagged).
  prevM = [snapRow('a', { armed: true, meleeId: 'sword1', equippedItemIds: ['sword1'] }), snapRow('b', { armed: true, meleeId: 'sword1', equippedItemIds: ['sword1'] }), snapRow('c', { armed: true, meleeId: 'sword1', equippedItemIds: ['sword1'] }), snapRow('d', { armed: true, meleeId: 'sword1', equippedItemIds: ['sword1'] })];
  curM = [snapRow('d', { armed: true, meleeId: 'sword1', equippedItemIds: ['sword1'] }), snapRow('e', { armed: true, meleeId: 'sword1', equippedItemIds: ['sword1'] })];
  diff = armedPair(10, prevM, curM, { deathsToday: ['a', 'b', 'c'], prevVanished: [{ vid: 'a', exists: true, dead: true }, { vid: 'b', exists: true, dead: true }, { vid: 'c', exists: true, dead: true }] });
  T.ok('simultaneous gain: 3 death losses + 1 armed joiner, drop 2, is fully explained (no over-explained error)', diff.armedEvents.length === 3 && diff.instrumentErrors.length === 0 && diff.unattributedArmed === 0, 'events=' + diff.armedEvents.length + ' errors=' + JSON.stringify(diff.instrumentErrors) + ' unattributed=' + diff.unattributedArmed);
  T.ok('simultaneous gain: the join-armed gain is recorded', diff.gains.some(function (g) { return g.kind === 'join-armed' && g.vid === 'e'; }), JSON.stringify(diff.gains));
  prevM = [snapRow('b', { armed: true, meleeId: 'axe1', equippedItemIds: ['axe1'] })];
  curM = [snapRow('b', { armed: true, meleeId: 'axe1', equippedItemIds: ['axe1'] }), snapRow('c', { armed: true, meleeId: 'sword1', equippedItemIds: ['sword1'] })];
  diff = armedPair(10, prevM, curM, {});
  T.ok('join-armed gain recorded (does not count toward the GO bar)', diff.gains.some(function (g) { return g.kind === 'join-armed' && g.vid === 'c'; }), JSON.stringify(diff.gains));
  // veteran-loss via death
  prevM = [snapRow('a', { armed: true, meleeId: 'sword1', equippedItemIds: ['sword1'], veteranW4: true }), snapRow('b', { armed: true, meleeId: 'axe1', equippedItemIds: ['axe1'] })];
  curM = [snapRow('b', { armed: true, meleeId: 'axe1', equippedItemIds: ['axe1'] })];
  diff = armedPair(10, prevM, curM, { deathsToday: ['a'], prevVanished: [{ vid: 'a', name: 'a', exists: true, dead: true }] });
  T.ok('veteran-loss: wave-4+ killer death ends the pair (veteranEvents)', diff.veteranEvents.length === 1 && diff.veteranEvents[0].class === 'death', JSON.stringify(diff.veteranEvents));
  // unattributed: armed totals drop with no member delta
  const prevU = synthSnap(9, { members: [snapRow('a', { armed: true }), snapRow('b', { armed: true }), snapRow('c', { armed: true })], armed: 3, veteransW4: [] });
  const curU = synthSnap(10, { members: [snapRow('a', { armed: true }), snapRow('b', { armed: true }), snapRow('c', { armed: true })], armed: 2, veteransW4: [] });
  prevU.ready5.armed = 3; curU.ready5.armed = 2;
  diff = PA.diffGearDays(prevU, curU);
  T.ok('unattributed: drop with no member delta counts 1 unattributed (never silently dropped)', diff.unattributedArmed === 1 && diff.armedEvents.length === 0, 'unattributedArmed=' + diff.unattributedArmed);
  // over-explained: two events for a drop of 1 -> instrument error
  const prevO = synthSnap(9, { members: [snapRow('a', { armed: true }), snapRow('b', { armed: true })], armed: 2, veteransW4: [] });
  const curO = synthSnap(10, { members: [], armed: 1, veteransW4: [], deathsToday: ['a', 'b'], prevVanished: [{ vid: 'a', exists: true, dead: true }, { vid: 'b', exists: true, dead: true }] });
  prevO.ready5.armed = 2; curO.ready5.armed = 1;
  diff = PA.diffGearDays(prevO, curO);
  T.ok('over-explained: 2 events for a drop of 1 is an instrument error', diff.instrumentErrors.some(function (m) { return m.indexOf('over-explained-armed') === 0; }), JSON.stringify(diff.instrumentErrors));

  // ---- 4. Hold detection ----
  T.section('4. Hold detection — pair-hold vs deferral-hold, blocks, ceiling');
  function holdSnap(day, vets, capped, peak, aliveCount) {
    const members = [];
    for (let i = 0; i < (aliveCount || 8); i++) members.push(snapRow('m' + i, { armed: true }));
    return synthSnap(day, { ready5: { ready: false, armored: 4, armed: 6, tricks: 3, veterans: vets, short: [] }, cappedStanding: capped, peakWave: peak, members: members, armed: 6, veterans: vets, veteransW4: vets >= 2 ? ['x', 'y'] : [] });
  }
  const gear = [
    holdSnap(1, 2, 210, 4, 8), holdSnap(2, 2, 210, 4, 5), holdSnap(3, 2, 210, 4, 8),
    holdSnap(4, 2, 199, 4, 8), holdSnap(5, 1, 210, 4, 8), holdSnap(6, 2, 210, 5, 8), holdSnap(7, 2, 210, 4, 8),
  ];
  const holds = PA.findHoldBlocks(gear);
  T.ok('deferral-hold days are 1, 2, 3 and 7', JSON.stringify(holds.perDay.filter(function (p) { return p.deferralHold; }).map(function (p) { return p.day; })) === JSON.stringify([1, 2, 3, 7]), JSON.stringify(holds.perDay));
  T.ok('pair-hold day 4 is NOT a deferral-hold day (capped 199 < 200)', holds.perDay[3].pairHold === true && holds.perDay[3].deferralHold === false, JSON.stringify(holds.perDay[3]));
  T.ok('day 5 is no hold (veterans 1)', holds.perDay[4].pairHold === false && holds.perDay[4].deferralHold === false, JSON.stringify(holds.perDay[4]));
  T.ok('day 6 is no hold (peak 5 — wave 5 already released)', holds.perDay[5].pairHold === false, JSON.stringify(holds.perDay[5]));
  T.ok('blocks are [1–3] and [7]', JSON.stringify(holds.blocks) === JSON.stringify([{ startDay: 1, endDay: 3, days: 3 }, { startDay: 7, endDay: 7, days: 1 }]), JSON.stringify(holds.blocks));
  T.ok('ceiling: day 2 roster 5 < 6 flags ceiling', holds.perDay[1].ceiling === true && holds.perDay[0].ceiling === false, JSON.stringify(holds.perDay.map(function (p) { return p.ceiling; })));

  // ---- 5. Replay-identity comparison on a synthetic corpus ----
  T.section('5. Replay-identity comparison on a synthetic corpus');
  function r9Day(day, armed, armored, vets, rosterLen) {
    const roster = [];
    for (let i = 0; i < rosterLen; i++) roster.push({ vid: 'm' + i, name: 'm' + i, dead: false });
    return { day: day, ready5: { armed: armed, armored: armored, veterans: vets }, roster: roster };
  }
  const thisDaily = [r9Day(2, 4, 3, 2, 12), r9Day(3, 4, 3, 2, 12), r9Day(4, 5, 3, 2, 11)];
  const r9Daily = [r9Day(2, 4, 3, 2, 12), r9Day(3, 4, 3, 2, 12), r9Day(4, 5, 3, 2, 11)];
  let rep = AN.compareReplay(thisDaily, r9Daily);
  T.ok('identical trajectories: 0 mismatches on 3 days', rep.mismatches.length === 0 && rep.days === 3 && rep.uncomparable.length === 0, JSON.stringify(rep));
  const diverged = [r9Day(2, 4, 3, 2, 12), r9Day(3, 5, 3, 2, 12), r9Day(4, 5, 3, 2, 11)];
  rep = AN.compareReplay(diverged, r9Daily);
  T.ok('one armed divergence: exactly 1 mismatch, field armed, day 3', rep.mismatches.length === 1 && rep.mismatches[0].field === 'armed' && rep.mismatches[0].day === 3 && rep.mismatches[0].a === 5 && rep.mismatches[0].b === 4, JSON.stringify(rep.mismatches));
  const missingDay = [r9Day(2, 4, 3, 2, 12), r9Day(4, 5, 3, 2, 11)];
  rep = AN.compareReplay(missingDay, r9Daily);
  T.ok('missing day 3: counted as a mismatch', rep.mismatches.length === 1 && rep.mismatches[0].field === 'day-missing-in-this', JSON.stringify(rep.mismatches));
  const unreadable = [r9Day(2, 4, 3, 2, 12), { day: 3, ready5: null, roster: [] }, r9Day(4, 5, 3, 2, 11)];
  rep = AN.compareReplay(unreadable, r9Daily);
  T.ok('unreadable ready5: counted uncomparable, never silently passed', rep.uncomparable.length > 0, JSON.stringify(rep.uncomparable));
  // Duplicate-day occurrence alignment: both drivers emit TWO
  // snapshots for the village-loss day (in-day, then a post-loss
  // flush with the roster emptied). Occurrences align in order.
  const dupThis = [r9Day(42, 4, 3, 2, 5), r9Day(43, 1, 0, 0, 1), r9Day(43, 0, 0, 0, 0)];
  const dupR9 = [r9Day(42, 4, 3, 2, 5), r9Day(43, 1, 0, 0, 1), r9Day(43, 0, 0, 0, 0)];
  rep = AN.compareReplay(dupThis, dupR9);
  T.ok('duplicate loss day in the same order: 0 mismatches (in-day vs in-day, flush vs flush)', rep.mismatches.length === 0 && rep.days === 3, JSON.stringify(rep));
  const swappedThis = [r9Day(43, 0, 0, 0, 0), r9Day(43, 1, 0, 0, 1)];
  const swappedR9 = [r9Day(43, 1, 0, 0, 1), r9Day(43, 0, 0, 0, 0)];
  rep = AN.compareReplay(swappedThis, swappedR9);
  T.ok('duplicate loss day in swapped order: occurrences mismatch (order matters, not just the day)', rep.mismatches.length === 4, JSON.stringify(rep.mismatches));

  // ---- 6. Analyzer GO-bar table ----
  T.section('6. Analyzer GO-bar table — each failing condition alone is NO-GO');
  function fakeAnalysis(over) {
    return Object.assign({ unattributedTotal: 0, coverageOk: true, replayOk: true }, over || {});
  }
  T.ok('GO: 0 unattributed, coverage 100%, replay 100%', AN.judgeGO(fakeAnalysis()).verdict === 'GO', JSON.stringify(AN.judgeGO(fakeAnalysis())));
  T.ok('NO-GO: 1 unattributed still GO (bar <= 1)', AN.judgeGO(fakeAnalysis({ unattributedTotal: 1 })).verdict === 'GO', JSON.stringify(AN.judgeGO(fakeAnalysis({ unattributedTotal: 1 }))));
  const noGoU = AN.judgeGO(fakeAnalysis({ unattributedTotal: 2 }));
  T.ok('NO-GO: 2 unattributed', noGoU.verdict === 'NO-GO' && noGoU.reasons.join(' ').indexOf('unattributed') !== -1, JSON.stringify(noGoU));
  const noGoC = AN.judgeGO(fakeAnalysis({ coverageOk: false }));
  T.ok('NO-GO: coverage incomplete', noGoC.verdict === 'NO-GO' && noGoC.reasons.join(' ').indexOf('coverage') !== -1, JSON.stringify(noGoC));
  const noGoR = AN.judgeGO(fakeAnalysis({ replayOk: false }));
  T.ok('NO-GO: replay identity broken', noGoR.verdict === 'NO-GO' && noGoR.reasons.join(' ').indexOf('replay') !== -1, JSON.stringify(noGoR));

  // ---- 7. Seed-band identity + driver leg guard ----
  T.section('7. Seed-band identity + driver leg guard');
  T.ok('analyzer SEEDS = 190391–190398', JSON.stringify(AN.SEEDS) === JSON.stringify([190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398]),
    'SEEDS=' + JSON.stringify(AN.SEEDS));
  const driverSrc = fs.readFileSync(path.join(__dirname, 'pairarming-driver-20261112.js'), 'utf8');
  T.ok('driver writes to perseed-pairarming-a', driverSrc.indexOf('perseed-pairarming-a') !== -1, 'outDir check');
  T.ok('driver does NOT write to the r9 corpus', driverSrc.indexOf('perseed-bisect-r9-cut-a') === -1, 'no cross-corpus write');
  const analyzerSrc = fs.readFileSync(path.join(__dirname, 'pairarming-analyze-20261112.js'), 'utf8');
  T.ok('analyzer reads perseed-pairarming-a', analyzerSrc.indexOf('perseed-pairarming-a') !== -1, 'DIR check');
  const fixText = execSync('git show 5157782a4:src/js/standing.js', { cwd: path.join(__dirname, '..') }).toString();
  const preFixText = execSync('git show ee30f22a2:src/js/standing.js', { cwd: path.join(__dirname, '..') }).toString();
  const gFix = DR.legGuard(fixText);
  T.ok('legGuard accepts the swapped fix text', gFix.ok === true && gFix.fix === true, 'ok=' + gFix.ok + ' sha=' + gFix.sha);
  T.ok('legGuard records the vetphantom fix sha f8fda4295a99', gFix.sha === 'f8fda4295a99' && gFix.shaFull === DR.EXPECTED_FIX_SHA,
    'sha=' + gFix.sha);
  const gPre = DR.legGuard(preFixText);
  T.ok('legGuard refuses the pre-fix r9-base text (no marker)', gPre.ok === false && gPre.fix === false, 'ok=' + gPre.ok + ' fix=' + gPre.fix);
  T.ok('legGuard records the pre-fix sha 98c8bfad70d7', gPre.sha === '98c8bfad70d7' && gPre.shaFull === DR.PRE_FIX_SHA,
    'sha=' + gPre.sha);
  T.ok('legGuard refuses a marker-bearing text with the wrong sha', DR.legGuard('ROSTER CHECK\n' + preFixText).ok === false,
    'wrong-sha marker text refused');

  // ---- 8. Corpus completeness ----
  T.section('8. Corpus completeness — loader reports 8/8 and names the missing seed');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pairarming-proof-'));
  for (const seed of AN.SEEDS) {
    fs.writeFileSync(path.join(tmpDir, 'pairarming-s' + seed + '-' + AN.RUN + '-fix.json'), JSON.stringify({ seed: seed }));
  }
  let corpus = AN.loadCorpus(AN.SEEDS, tmpDir);
  T.ok('full synthetic corpus: 8/8 complete', corpus.complete === true && corpus.rows.length === 8, 'rows=' + corpus.rows.length);
  fs.unlinkSync(path.join(tmpDir, 'pairarming-s190395-' + AN.RUN + '-fix.json'));
  corpus = AN.loadCorpus(AN.SEEDS, tmpDir);
  T.ok('partial synthetic corpus: incomplete, missing seed named', corpus.complete === false && corpus.missing.join(',') === '190395', 'missing=' + corpus.missing.join(','));
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
  // The r9 corpus read must survive the real file sizes: 7 of the 8
  // per-seed files are 1.1–2.2 MB, over execSync's 1 MB default
  // maxBuffer (only 190394 at 349 KB loaded before the fix).
  const r9d391 = AN.loadR9Daily(190391);
  T.ok('loadR9Daily reads the large 190391 corpus (1.2 MB) via git show master:', Array.isArray(r9d391) && r9d391.length > 80, 'daily len=' + (r9d391 && r9d391.length));
  const r9d398 = AN.loadR9Daily(190398);
  T.ok('loadR9Daily reads the large 190398 corpus (2.0 MB)', Array.isArray(r9d398) && r9d398.length > 140, 'daily len=' + (r9d398 && r9d398.length));

  T.done();
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

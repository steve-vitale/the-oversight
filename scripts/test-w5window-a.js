#!/usr/bin/env node
// test-w5window-a.js — proof test for the wave-5 window non-gate fix
// (gap-w5window, 2026-11-02): the wanderer cast slot must not deadlock.
//
// Diagnosis it proves (from evidence/2026-11-03/sim-w5faced-a.md):
// the w5faced corpus shows castMonster returning a wave-5 id ZERO times
// on all five legs (2-7 casts per whole 86-180d run), triggerEncounter
// wave-5 ZERO times, and wanderer wave-5 days ZERO — while a single
// early wanderer (e.g. seed 97418's gallowdeer, pacing row y=0 from day 3)
// never contacts a home-based player, never expires, and therefore
// blocks every later cast: checkEncounter only casts when !wanderer.
// The fix: a wanderer that goes uncontacted for 7 days moves on
// (announced), freeing the slot so the next tile entry casts anew at
// the CURRENT wave. No unlock threshold, window length, spawn rate,
// seat timing, or win condition changes — a stuck state machine is
// repaired, not a rate retuned.
//
// Scenarios (one harness, seed 97418, sequential state resets):
//  (1) stuck wanderer expires at age 7 (alive at 6, gone at 7), with a
//      fade line and wandererNextDay reset to the expiry day;
//  (2) a fresh wanderer survives to age 6 and expires at 7; a legacy
//      wanderer with no bornDay is stamped, not instantly expired;
//  (3) after expiry, the next non-safe tile entry casts a NEW wanderer
//      carrying today's bornDay (the recast path);
//  (4) cast-channel revival over 30 days of daily tile entries from a
//      stuck start: before-fix 0 new wanderer casts, after-fix >= 2;
//  (5) conversion control: a wave-5 world monster spawned on the
//      player's tile DOES start a fight and count as faced — proving
//      the leak is upstream (the dead cast slot), not in conversion.
// Usage: node scripts/test-w5window-a.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
const INST = require(path.join(REPO, 'scripts', 'wave5encounter-instrument-20261103'));

let checks = 0, fails = 0;
function check(name, cond, extra) {
  checks++;
  if (cond) console.log('PASS ' + name);
  else { fails++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}

function findMeadowTile(Game) {
  const tiles = Game.map.tiles || [];
  for (let y = 0; y < tiles.length; y++) {
    for (let x = 0; x < (tiles[y] || []).length; x++) {
      const t = tiles[y][x];
      if (!t || t.type !== 'meadow') continue;
      if (y === 0) continue; // keep the row-mismatch shape of the corpus case
      try { if (Game.isSafeTile && Game.isSafeTile(x, y)) continue; } catch (e) {}
      return { x: x, y: y };
    }
  }
  return null;
}

(async () => {
  const { Game } = await loadGame({ seed: 97418, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  const says = [];
  const origSay = Game.say;
  Game.say = function () {
    try { if (typeof arguments[0] === 'string') says.push(String(arguments[0])); } catch (e) {}
    return origSay.apply(this, arguments);
  };
  const inst = INST.install(Game);
  const t = inst.t;
  const S = () => ((Game.state || {}).scholar || {});
  const setDay = (d) => { S().day = d; };
  const setPlayer = (x, y) => { Game.map.px = x; Game.map.py = y; };

  // (1) Stuck wanderer expires at age 7.
  setPlayer(4, 4); setDay(60);
  Game.wanderer = { x: 0, y: 0, dir: 1, monsterId: 'gallowdeer', veteran: false, bornDay: 60 };
  Game.encounterDone = false;
  let aliveAt6 = true;
  for (let d = 60; d <= 66; d++) { setDay(d); Game.moveWanderer(); if (!Game.wanderer) aliveAt6 = false; }
  check('stuck wanderer alive at age 6', aliveAt6 && !!Game.wanderer, Game.wanderer);
  const saysBefore = says.length;
  setDay(67); Game.moveWanderer();
  check('stuck wanderer expired at age 7', !Game.wanderer, Game.wanderer);
  check('expiry announced (fade line)', says.slice(saysBefore).some(function (l) { return /moved on/.test(l); }), says.slice(saysBefore));
  check('expiry resets wandererNextDay to today', (Game.state.wandererNextDay | 0) === 67, Game.state.wandererNextDay);

  // (2) Fresh wanderer survives to 6, expires at 7; legacy stamped.
  setDay(67);
  Game.wanderer = { x: 0, y: 0, dir: 1, monsterId: 'gallowdeer', veteran: false, bornDay: 67 };
  Game.encounterDone = false;
  let freshAlive = true;
  for (let d = 67; d <= 73; d++) { setDay(d); Game.moveWanderer(); if (!Game.wanderer) freshAlive = false; }
  check('fresh wanderer alive at age 6', freshAlive && !!Game.wanderer, Game.wanderer);
  setDay(74); Game.moveWanderer();
  check('fresh wanderer expired at age 7', !Game.wanderer, Game.wanderer);
  setDay(74);
  Game.wanderer = { x: 0, y: 0, dir: 1, monsterId: 'gallowdeer', veteran: false };
  Game.encounterDone = false;
  Game.moveWanderer();
  check('legacy wanderer stamped, not expired', !!(Game.wanderer && Game.wanderer.bornDay === 74), Game.wanderer);

  // (3) Recast after expiry carries today's bornDay.
  const meadow = findMeadowTile(Game);
  check('non-safe meadow tile found for recast', !!meadow, meadow);
  setDay(81);
  Game.wanderer = { x: 0, y: 0, dir: 1, monsterId: 'gallowdeer', veteran: false, bornDay: 74 };
  Game.encounterDone = false;
  Game.moveWanderer(); // age 7 -> expiry (after fix)
  check('recast precondition: slot freed by expiry', !Game.wanderer, Game.wanderer);
  if (meadow) {
    setPlayer(meadow.x, meadow.y);
    Game.state.wandererNextDay = 81;
    Game.pendingEncounter = false; Game.pendingMonsterId = null;
    try { Game.checkEncounter(); } catch (e) { check('recast checkEncounter runs', false, String(e.message)); }
    check('recast: new wanderer exists', !!Game.wanderer, Game.wanderer);
    check('recast: new wanderer born today', !!(Game.wanderer && Game.wanderer.bornDay === 81), Game.wanderer);
  }

  // (4) Cast-channel revival over 30 days of daily tile entries.
  if (meadow) {
    setPlayer(meadow.x, meadow.y);
    setDay(74);
    Game.wanderer = { x: 0, y: 0, dir: 1, monsterId: 'gallowdeer', veteran: false, bornDay: 74 };
    Game.encounterDone = false;
    Game.pendingEncounter = false; Game.pendingMonsterId = null;
    const castBefore = t.castRows.length;
    const trigBefore = t.triggerRows.length;
    for (let d = 75; d <= 104; d++) {
      setDay(d);
      for (let p = 0; p < 4; p++) { try { Game.moveWanderer(); } catch (e) {} }
      try { Game.checkEncounter(); } catch (e) {}
      Game.pendingEncounter = false; Game.pendingMonsterId = null;
    }
    const newCasts = t.castRows.slice(castBefore).filter(function (r) { return r.caller === 'checkEncounter'; });
    const newTrigs = t.triggerRows.slice(trigBefore);
    console.log('REVIVAL-LOOP casts=' + newCasts.length + ' triggers=' + newTrigs.length +
      ' castIds=' + JSON.stringify(newCasts.map(function (r) { return r.id; })));
    check('revival loop: >= 2 new wanderer casts in 30d', newCasts.length >= 2, newCasts);
  }

  // (5) Conversion control: world-spawned wave-5 monster fights + faces.
  if (meadow) {
    setPlayer(meadow.x, meadow.y);
    Game.pendingEncounter = false; Game.pendingMonsterId = null;
    try {
      const here = Game.monsterAt ? Game.monsterAt(meadow.x, meadow.y) : null;
      if (here) Game.removeWorldMonster(here);
    } catch (e) {}
    let mon = null;
    try { mon = Game.spawnWorldMonster({ id: 'rerun' }, meadow.x, meadow.y, { mx: 4, my: 4 }); } catch (e) { mon = null; }
    check('conversion: rerun spawned on player tile', !!(mon && mon.id === 'rerun'), mon);
    let started = false;
    try { Game.startCombat('rerun'); started = !!(Game.tbfight && !Game.tbfight.over); } catch (e) { started = false; }
    check('conversion: rerun fight starts', started, Game.tbfight ? Game.tbfight.id : null);
    let faced = null;
    try { faced = Game.deedState ? Game.deedState().wavesFaced || {} : {}; } catch (e) { faced = {}; }
    check('conversion: rerun counts as faced wave 5', faced && faced.rerun === 5, faced);
  }

  // spawnWaveTarget still returns wave 5 at the designed share on a wave-5 pool.
  const pool5 = (Game.data.monsters || []).filter(function (m) { return (m.wave || 1) <= 5; });
  let n5 = 0; const N = 200;
  for (let i = 0; i < N; i++) { try { if (Game.spawnWaveTarget(pool5) === 5) n5++; } catch (e) {} }
  console.log('SPAWNWAVETARGET wave5 share=' + n5 + '/' + N);
  check('spawnWaveTarget wave-5 share in 40-70% band', n5 >= 80 && n5 <= 140, n5);

  inst.uninstall();
  console.log('\n' + (checks - fails) + '/' + checks + ' checks passed');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('PROOF-FAILED', e && e.stack || e); process.exit(1); });

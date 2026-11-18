// test-fightgate-scope-b.js — proof test, arm sim-fightgate-scope-b.
// Proves the diagnostic's code premises and its instrument:
//   §1 LIVE: the wild path (no awareness option — the shape
//      resolveWildMonsterEncounter / resolvePatrol / aidFight use)
//      forces contact, and the Suburb leave still fires in round 1
//      when the trick is known (vFlee, fleeWise, rounds 1, dealt 0)
//      — while a villager who does NOT know the trick never leaves
//      wisely in round 1. This is the code fact behind #2506: the
//      wild paths have no pre-fight gate, only the in-fight trick.
//   §2 LIVE: the driver's wildSnapshot reads the gate inputs on a
//      live Game (plan stage/target/party, sensed + counted party,
//      per-member gear, isTableVeteran) and fightOrigin still maps
//      the four callers (expedition / world-tick / patrol / aid).
//   §3 Analyzer on synthetic legs: would-avoid classifier table,
//      wild census counts, D3 agreement/disagreement, frozen bars
//      (via the analyzer's own --selftest, asserted 0 failures).
//   §4 Driver module loads and exports its helpers.
// Live sections run through scripts/sim-harness.js (seeded, full
// src/js list in index.html order, Math.random seeded before eval).
// Usage: node scripts/test-fightgate-scope-b.js
'use strict';
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');
const driver = require('./fightgate-scope-driver-b');
const A = require('./analyze-fightgate-scope-b');

let failures = 0;
function fail(msg) { failures++; console.error('FAIL: ' + msg); }
function ok(msg) { console.log('ok: ' + msg); }
function assert(cond, msg) { if (cond) ok(msg); else fail(msg); }
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// ---- §1+§2 live, one harness (never two harnesses in one process) ----
async function live() {
  const { Game, loadFails } = await loadGame({ seed: 103602, mode: 'test' });
  if (loadFails && loadFails.length) { fail('live module load failures: ' + loadFails.join('; ')); return; }
  await setupGame(Game);
  const mdef = function (id) { return (Game.data.monsters || []).find(function (m) { return m.id === id; }); };
  const roster = (Game.state.village.roster || []).filter(function (id) { return id !== Game.villagerId; });
  if (roster.length < 3) { fail('live need 3+ NPCs, have ' + roster.length); return; }
  const setHealth = function (vid, hp) { ((Game.state.village.health = Game.state.village.health || {}))[vid] = hp; };
  assert(typeof Game.fieldFight === 'function', '§1 Game.fieldFight exists');
  assert(typeof Game.villagerFightAllies === 'function', '§2 Game.villagerFightAllies exists');

  // §1a: wild shape, trick KNOWN. No awareness option (exactly what
  // the wild routers pass) — contact is forced, then the round-1
  // leave fires.
  const suburb = mdef('suburb');
  assert(!!suburb && suburb.wave === 4, '§1 suburb def is wave 4');
  Game.state.villagerTricks = Game.state.villagerTricks || {};
  Game.state.villagerTricks.suburb = true;
  let left = null;
  for (let i = 0; i < roster.length && !left; i++) {
    const vid = roster[i];
    setHealth(vid, 100);
    const rec = Game.fieldFight(vid, suburb, null, {});
    if (rec && rec.outcome === 'vFlee' && rec.fleeWise && (rec.rounds | 0) === 1 && (rec.mDealt | 0) === 0) {
      left = { vid: vid, rec: rec };
    }
  }
  assert(!!left, '§1a wild shape + known trick: villager leaves in round 1 (vFlee, fleeWise, rounds 1, dealt 0)');
  if (left) {
    assert(left.rec.mHpLeft != null && left.rec.mHpLeft >= 1300 && left.rec.mHpLeft <= 1500,
      '§1a the Suburb is unmoved by the leave (mHpLeft ' + left.rec.mHpLeft + ' inside def range [1300,1500])');
    assert(/kill a suburb/i.test((left.rec.log || []).join(' ')),
      '§1a the leave is narrated as the correct counter ("you can\'t kill a suburb")');
  }
  // §1b: wild shape, trick UNKNOWN. No wise leave in round 1 — the
  // fighter fights, flees on morale, or dies; the trick cannot fire.
  delete Game.state.villagerTricks.suburb;
  let unknownRec = null;
  const used = new Set(left ? [left.vid] : []);
  for (let i = 0; i < roster.length && !unknownRec; i++) {
    const vid = roster[i];
    if (used.has(vid)) continue;
    setHealth(vid, 100);
    const rec = Game.fieldFight(vid, suburb, null, {});
    if (rec) unknownRec = rec;
  }
  assert(!!unknownRec, '§1b found a villager for the trick-unknown wild fight');
  if (unknownRec) {
    assert(!unknownRec.fleeWise,
      '§1b trick-unknown: no wise leave (outcome ' + unknownRec.outcome + ', fleeWise ' + !!unknownRec.fleeWise + ')');
  }
  Game.state.villagerTricks.suburb = true;

  // §2: wildSnapshot on a live Game.
  const snapVid = roster.find(function (id) { return id !== (left && left.vid); }) || roster[0];
  assert(!!snapVid, '§2 found a villager for the snapshot');
  if (snapVid) {
    const snap = driver.wildSnapshot(Game, snapVid);
    assert(!!snap, '§2 wildSnapshot returns a snapshot (not null)');
    if (snap) {
      assert(snap.party && snap.party[0] === snapVid && snap.partySize === snap.party.length,
        '§2 snapshot party starts with the fighter (partySize ' + snap.partySize + ')');
      assert(typeof snap.allArmed === 'boolean' && typeof snap.allArmored === 'boolean',
        '§2 snapshot carries allArmed/allArmored booleans');
      assert(snap.planStage === null && snap.isTableVeteran === false,
        '§2 plan-less villager: planStage null, isTableVeteran false');
      // Table-stage veteran shape: stage the plan + a wave-4 kill
      // in the log, and the snapshot must read veteran.
      const v = Game.state.village;
      v.winPlan = v.winPlan || {};
      v.winPlan[snapVid] = { stage: 'table', target: 'herald', node: null, party: [], sinceDay: 0, holdSinceDay: -1 };
      Game.state.waveKillLog = Game.state.waveKillLog || [];
      Game.state.waveKillLog.push({ by: snapVid, w: 4, mid: 'herald' });
      const snapVet = driver.wildSnapshot(Game, snapVid);
      assert(!!snapVet && snapVet.planStage === 'table' && snapVet.isTableVeteran === true,
        '§2 table-stage wave-4 killer reads isTableVeteran true (planStage ' +
        (snapVet && snapVet.planStage) + ', veteran ' + (snapVet && snapVet.isTableVeteran) + ')');
      assert(driver.isWave4Killer(Game, snapVid) === true, '§2 isWave4Killer true for the staged killer');
      assert(driver.isWave4Killer(Game, roster[0]) === (Game.state.waveKillLog.some(function (r) { return r.by === roster[0] && (r.w | 0) >= 4; })),
        '§2 isWave4Killer agrees with the log on an unstaged villager');
      delete v.winPlan[snapVid];
      Game.state.waveKillLog.pop();
    }
  }
  // fightOrigin taxonomy on synthetic stacks.
  assert(driver.fightOrigin('Error\n    at Object.expeditionMonster (src/js/villager-agency.js:645:10)') === 'expedition',
    '§2 fightOrigin maps expeditionMonster -> expedition');
  assert(driver.fightOrigin('Error\n    at Object.resolveWildMonsterEncounter (src/js/game.js:20845:10)') === 'world-tick',
    '§2 fightOrigin maps resolveWildMonsterEncounter -> world-tick');
  assert(driver.fightOrigin('Error\n    at Object.resolvePatrol (src/js/game.js:8102:10)') === 'patrol',
    '§2 fightOrigin maps resolvePatrol -> patrol');
  assert(driver.fightOrigin('Error\n    at Object.aidFight (src/js/comms.js:657:10)') === 'aid',
    '§2 fightOrigin maps aidFight -> aid');
  assert(driver.fightOrigin('Error\n    at Object.someNewRouter (src/js/game.js:1:1)') === 'other:someNewRouter',
    '§2 fightOrigin names an unknown caller instead of defaulting');
}

// ---- §3 analyzer ----
(function section3() {
  const C = A.classifyWouldAvoid;
  assert(C({ partySize: 1, allArmed: true, allArmored: true, planStage: 'table', isTableVeteran: true }, 3).rule === 'veteran-guard',
    '§3 classifier: lone table veteran vs wave-3 is veteran-guard');
  assert(C({ partySize: 3, allArmed: true, allArmored: true, planStage: 'hunt', isTableVeteran: false }, 4).wouldAvoid === false,
    '§3 classifier: full geared trio vs wave-4 is not avoided');
  assert(C(null, 4).rule === 'unclassified', '§3 classifier: null snapshot is unclassified');
  const stFailures = A.selftest();
  assert(stFailures === 0, '§3 analyzer --selftest passes with 0 failures');
})();

// ---- §4 driver module ----
(function section4() {
  assert(typeof driver.oneRun === 'function', '§4 driver exports oneRun');
  assert(typeof driver.wildSnapshot === 'function', '§4 driver exports wildSnapshot');
  assert(typeof driver.isWave4Killer === 'function', '§4 driver exports isWave4Killer');
  assert(typeof driver.fightOrigin === 'function', '§4 driver exports fightOrigin');
  assert(typeof driver.recoverMHpStart === 'function', '§4 driver exports recoverMHpStart');
  assert(typeof driver.classifySeedPath === 'function', '§4 driver exports classifySeedPath');
})();

async function main() {
  await live();
  console.log(failures === 0 ? 'ALL PASS' : failures + ' FAILURES');
  process.exitCode = failures === 0 ? 0 : 1;
}
if (require.main === module) main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

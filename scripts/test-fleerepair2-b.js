// test-fleerepair2-b.js — proof test, arm sim-fleerepair2-b.
// Proves finding #2500's mechanism and the seed-gate fix:
//   §1 LIVE reproduction of the #2500 shape (flag OFF — the mechanism
//      exists regardless of the fix): a villager who knows the Suburb
//      trick meets it in a field fight and 'leaves' in round 1 —
//      outcome vFlee, fleeWise, rounds 1, mDealt 0, monster HP
//      unmoved. The plain strike cannot miss in the field model, so
//      0 damage in round 1 PROVES the round-1 action was the trick.
//   §2 LIVE seed gate: winPlanSeedFromFight with a suburb def —
//      flag OFF seeds a plan targeting 'suburb'; flag ON (FLEEREPAIR2=1)
//      returns null and creates no plan; a non-leave wave-4 def
//      (strike) still seeds normally with the flag on; an existing
//      plan is left untouched by a gated call (stated limitation).
//   §3 Analyzer on synthetic legs: launched suburb meetings (and
//      their round-1-zero / wise-leave subsets) are counted; judgeB1
//      fails with >=1 and passes at 0; judgeB2 is the no-kill-loss
//      comparison; the instrument bar still counts a fought row
//      without HP as missing.
//   §4 Driver module loads and exports its helpers.
// Live sections run through scripts/sim-harness.js (seeded, full
// src/js list in index.html order, Math.random seeded before eval).
// Usage: node scripts/test-fleerepair2-b.js
'use strict';
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');
const driver = require('./fleerepair2-driver-b');
const A = require('./analyze-fleerepair2-b');

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
  assert(typeof Game.winPlanSeedFromFight === 'function', '§2 Game.winPlanSeedFromFight exists');

  // §1: the #2500 shape, live. The village knows the Suburb trick.
  const suburb = mdef('suburb');
  assert(!!suburb && suburb.wave === 4, '§1 suburb def is wave 4 (hp range ' + JSON.stringify(suburb && suburb.hp) + ')');
  Game.state.villagerTricks = Game.state.villagerTricks || {};
  Game.state.villagerTricks.suburb = true;
  let left = null;
  for (let i = 0; i < roster.length && !left; i++) {
    const vid = roster[i];
    setHealth(vid, 100);
    const rec = Game.fieldFight(vid, suburb, null, { awareness: false });
    if (rec && rec.outcome === 'vFlee' && rec.fleeWise && (rec.rounds | 0) === 1 && (rec.mDealt | 0) === 0) {
      left = { vid: vid, rec: rec };
    }
  }
  assert(!!left, '§1 a villager who knows the Suburb trick leaves in round 1 (vFlee, fleeWise, rounds 1, dealt 0)');
  if (left) {
    const rec = left.rec;
    assert(rec.mHpLeft != null && rec.mHpLeft >= 1300 && rec.mHpLeft <= 1500,
      '§1 the Suburb is unmoved by the leave (mHpLeft ' + rec.mHpLeft + ' inside def range [1300,1500])');
    const lines = (rec.log || []).join(' ');
    assert(/kill a suburb/i.test(lines),
      '§1 the leave is narrated as the correct counter ("you can\'t kill a suburb")');
    assert(rec.fleeHpFrac == null || rec.fleeHpFrac > 0.25,
      '§1 the leave is NOT a morale-floor flee (fleeHpFrac ' + rec.fleeHpFrac + ' — the villager walked out healthy)');
  }

  // §2: the seed gate, live. Use villagers with no plan yet.
  const strike = mdef('strike');
  assert(!!strike && strike.wave === 4, '§2 strike def is wave 4');
  const planOf = function (vid) { return ((Game.state.village.winPlan || {})[vid]) || null; };
  const used = new Set(left ? [left.vid] : []);
  const freshVid = function () {
    for (const id of roster) if (!used.has(id) && !planOf(id)) { used.add(id); return id; }
    return null;
  };
  // Flag OFF: a suburb flee seeds a hunt plan targeting 'suburb'.
  delete process.env.FLEEREPAIR2;
  const vOff = freshVid();
  assert(!!vOff, '§2 found a plan-less villager for the flag-off suburb seed');
  if (vOff) {
    const ret = Game.winPlanSeedFromFight(vOff, suburb, 'fled');
    const plan = planOf(vOff);
    assert(!!ret && !!plan && plan.target === 'suburb',
      '§2 flag OFF: fleeing a suburb seeds a plan targeting suburb (target=' + (plan && plan.target) + ')');
  }
  // Flag ON: the same call returns null and creates no plan.
  process.env.FLEEREPAIR2 = '1';
  const vOn = freshVid();
  assert(!!vOn, '§2 found a plan-less villager for the flag-on suburb seed');
  if (vOn) {
    const ret = Game.winPlanSeedFromFight(vOn, suburb, 'fled');
    assert(ret == null && planOf(vOn) == null,
      '§2 flag ON: fleeing a suburb seeds NOTHING (returned null, no plan created)');
    // The other outcomes seed nothing either.
    const retEv = Game.winPlanSeedFromFight(vOn, suburb, 'evaded');
    assert(retEv == null && planOf(vOn) == null,
      '§2 flag ON: an evaded suburb also seeds nothing');
  }
  // Flag ON: a non-leave wave-4 def still seeds normally.
  const vStrike = freshVid();
  assert(!!vStrike, '§2 found a plan-less villager for the flag-on strike seed');
  if (vStrike) {
    const ret = Game.winPlanSeedFromFight(vStrike, strike, 'fled');
    const plan = planOf(vStrike);
    assert(!!ret && !!plan && plan.target === 'strike',
      '§2 flag ON: fleeing a strike still seeds a plan targeting strike (target=' + (plan && plan.target) + ')');
    // A gated suburb call leaves that existing plan untouched.
    const ret2 = Game.winPlanSeedFromFight(vStrike, suburb, 'fled');
    const plan2 = planOf(vStrike);
    assert(ret2 == null && !!plan2 && plan2.target === 'strike',
      '§2 flag ON: a gated suburb call leaves an existing strike plan untouched (target still strike)');
  }
  delete process.env.FLEEREPAIR2;
}

// ---- §3 analyzer on synthetic legs ----
(function section3() {
  function seed(o) {
    return {
      seed: o.seed, days: 150, gameDays: 147, endReason: 'horizon', standing: 120, scaleRank: 'village',
      won: false, maxWave: 4, villageLost: false, instrumentErrors: [],
      winPlanStats: { partyTrios: 0, partyQuads: 0 },
      v4seeds: o.seeds || [], v4departs: o.departs || [], dawnbidScores: [],
      v4encounters: o.encounters || [],
      companionPool: [], deaths: [], daily: [{ day: 1 }, { day: 147 }],
    };
  }
  const launch = { vid: 'a', day: 90, result: 'launch', source: 'brain', target: 'suburb',
    targetWave: 4, party: ['b'], partySize: 3, companion: 'b', companion2: null, companion3: null };
  const suburbMeeting = { day: 91, vid: 'a', mid: 'suburb', wave: 4, outcome: 'vFlee',
    rounds: 1, mDealt: 0, mHpStart: 581, mHpStartRec: 581, alliesN: 2, allyVid: null,
    calledHelp: false, origin: 'world-tick', fleeWise: true, fleeLearn: false };
  const fought = A.seedAnalysis(seed({ seed: 104001, departs: [launch], encounters: [suburbMeeting] }));
  assert(fought.suburbLaunchedMeetings === 1,
    '§3 one launched suburb meeting is counted (suburbLaunchedMeetings=' + fought.suburbLaunchedMeetings + ')');
  assert(fought.suburbLaunchedRound1Zero === 1,
    '§3 the meeting is a round-1 zero-damage leave (round1Zero=' + fought.suburbLaunchedRound1Zero + ')');
  assert(fought.suburbLaunchedWiseLeaves === 1,
    '§3 the meeting carries fleeWise (wiseLeaves=' + fought.suburbLaunchedWiseLeaves + ')');
  assert(fought.launchedMeetings === 1 && fought.missingHp === 0,
    '§3 the meeting joins the launch and carries HP (instrument clean)');
  // judgeB1: fails with >=1, passes at 0.
  const armBad = A.summarize({ bySeed: { 104001: fought }, files: ['x'] });
  assert(A.judgeB1(armBad).pass === false, '§3 judgeB1 FAILS with 1 launched suburb meeting on the armed leg');
  const clean = A.seedAnalysis(seed({ seed: 104001, departs: [launch], encounters: [] }));
  const armGood = A.summarize({ bySeed: { 104001: clean }, files: ['x'] });
  assert(A.judgeB1(armGood).pass === true, '§3 judgeB1 PASSES with 0 launched suburb meetings on the armed leg');
  // judgeB2: no-kill-loss comparison.
  const ctlKills = A.seedAnalysis(seed({ seed: 104001, encounters: [
    { day: 50, vid: 'a', mid: 'strike', wave: 4, outcome: 'vKill', rounds: 5, mDealt: 400, mHpStart: null, alliesN: 1 },
  ] }));
  const ctlS = A.summarize({ bySeed: { 104001: ctlKills }, files: ['x'] });
  const armKills = A.seedAnalysis(seed({ seed: 104001, encounters: [
    { day: 50, vid: 'a', mid: 'strike', wave: 4, outcome: 'vKill', rounds: 5, mDealt: 400, mHpStart: null, alliesN: 1 },
    { day: 60, vid: 'a', mid: 'audit', wave: 4, outcome: 'vKill', rounds: 4, mDealt: 300, mHpStart: null, alliesN: 1 },
  ] }));
  const armS = A.summarize({ bySeed: { 104001: armKills }, files: ['x'] });
  assert(A.judgeB2(armS, ctlS).pass === true,
    '§3 judgeB2 PASSES when armed wave-4 kills (' + armS.w4kills + ') >= control (' + ctlS.w4kills + ')');
  assert(A.judgeB2(ctlS, armS).pass === false,
    '§3 judgeB2 FAILS when armed wave-4 kills fall below control');
  // Instrument bar: fought row without HP still counts missing.
  const gap = A.seedAnalysis(seed({ seed: 104001,
    encounters: [{ day: 50, vid: 'a', mid: 'eater', wave: 4, outcome: 'vFlee', rounds: 4, mDealt: 120, mHpStart: null, alliesN: 1 }],
  }));
  assert(gap.missingHp === 1, '§3 fought row without HP counts missing (missingHp=' + gap.missingHp + ')');
})();

// ---- §4 driver module ----
(function section4() {
  assert(typeof driver.recoverMHpStart === 'function', '§4 driver exports recoverMHpStart');
  assert(typeof driver.classifySeedPath === 'function', '§4 driver exports classifySeedPath');
  assert(typeof driver.oneRun === 'function', '§4 driver exports oneRun');
  assert(eq(driver.classifySeedPath('fled', 'at Object.resolveWildMonsterEncounter (src/js/game.js:20949:16)'), 'world-tick'),
    '§4 seed-path classifier still names the world-tick path');
})();

async function main() {
  await live();
  console.log(failures === 0 ? 'ALL PASS' : failures + ' FAILURES');
  process.exitCode = failures === 0 ? 0 : 1;
}
if (require.main === module) main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

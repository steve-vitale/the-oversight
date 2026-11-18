// test-fleerepair3-b.js — proof test, arm sim-fleerepair3-b.
// Proves finding #2500's field-fight mechanism and the leave fix:
//   §1 LIVE staged fights (one harness, seed 7; every fight takes a
//      fresh mulberry32(rngSeed) as opts.rng, so flag OFF vs ON on the
//      same rng seed is the SAME fight up to the lever):
//      a. determinism: same rng seed twice, flag OFF -> identical rec.
//      b. leave-first: villager wins initiative, leaves round 1 —
//         flag OFF vTaken > 0 (parting hit present); flag ON, SAME
//         rng seed: outcome still vFlee, fleeWise, rounds 1, mDealt 0,
//         vTaken 0, and the log holds the leave line with NO hit line
//         after it.
//      c. monster-first: the hit lands BEFORE the leave — vTaken > 0
//         on BOTH legs (the pre-leave hit is preserved, only the
//         parting hit goes).
//      d. wounded death: 20-HP leaver, flag OFF -> vDie with fleeWise
//         (died walking out); flag ON, SAME rng seed -> vFlee, vTaken 0.
//      e. trick-unknown: villager fights multi-round, deals damage —
//         flag OFF vs ON identical (the learning path is untouched).
//      f. non-suburb control: a strike fight — flag OFF vs ON identical.
//   §2 Analyzer on synthetic legs: the parting-hit classifier (leave
//      line before/after the hit line), judgeB1 pass/fail/unjudgeable,
//      judgeB2, instrument bar.
//   §3 Driver module loads and exports its helpers.
// Live sections run through scripts/sim-harness.js (seeded, full
// src/js list in index.html order, Math.random seeded before eval).
// Usage: node scripts/test-fleerepair3-b.js
'use strict';
const path = require('path');
const { loadGame, setupGame, mulberry32 } = require('./sim-harness');
const driver = require('./fleerepair3-driver-b');
const A = require('./analyze-fleerepair3-b');

let failures = 0;
function fail(msg) { failures++; console.error('FAIL: ' + msg); }
function ok(msg) { console.log('ok: ' + msg); }
function assert(cond, msg) { if (cond) ok(msg); else fail(msg); }
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

const LEAVE_RE = /reads the sterile streets/;
const HIT_RE = /hits .* for \d+/;
function logOrder(rec) {
  const log = rec.log || [];
  let leaveIdx = -1, hitIdx = -1;
  for (let i = 0; i < log.length; i++) {
    if (leaveIdx === -1 && LEAVE_RE.test(log[i])) leaveIdx = i;
    if (hitIdx === -1 && HIT_RE.test(log[i])) hitIdx = i;
  }
  return { leaveIdx: leaveIdx, hitIdx: hitIdx, leaveFirst: leaveIdx !== -1 && (hitIdx === -1 || leaveIdx < hitIdx) };
}

// ---- §1 live, one harness (never two harnesses in one process) ----
async function live() {
  const { Game, loadFails } = await loadGame({ seed: 7, mode: 'test' });
  if (loadFails && loadFails.length) { fail('live module load failures: ' + loadFails.join('; ')); return; }
  await setupGame(Game);
  const mdef = function (id) { return (Game.data.monsters || []).find(function (m) { return m.id === id; }); };
  const roster = (Game.state.village.roster || []).filter(function (id) { return id !== Game.villagerId; });
  if (roster.length < 4) { fail('live need 4+ NPCs, have ' + roster.length); return; }
  const setHealth = function (vid, hp) { ((Game.state.village.health = Game.state.village.health || {}))[vid] = hp; };
  assert(typeof Game.fieldFight === 'function', '§1 Game.fieldFight exists');
  const suburb = mdef('suburb');
  assert(!!suburb && suburb.wave === 4, '§1 suburb def is wave 4 (hp range ' + JSON.stringify(suburb && suburb.hp) + ')');
  Game.state.villagerTricks = Game.state.villagerTricks || {};
  Game.state.villagerTricks.suburb = true;

  const fight = function (vid, def, rngSeed, hp, flagOn) {
    setHealth(vid, hp);
    if (flagOn) process.env.FLEEREPAIR3 = '1'; else delete process.env.FLEEREPAIR3;
    const rec = Game.fieldFight(vid, def, null, { awareness: false, rng: mulberry32(rngSeed) });
    delete process.env.FLEEREPAIR3;
    return rec;
  };

  // §1a determinism: same rng seed, flag OFF, twice -> identical rec.
  const d1 = fight(roster[0], suburb, 101, 100, false);
  const d2 = fight(roster[0], suburb, 101, 100, false);
  assert(!!d1 && !!d2 && eq(d1, d2),
    '§1a same rng seed twice (flag OFF) reproduces the fight exactly (outcome ' + (d1 && d1.outcome) + ', vTaken ' + (d1 && d1.vTaken) + ')');

  // §1b leave-first: find a case, then re-run it with the flag ON.
  let lf = null;
  outerB:
  for (let vi = 0; vi < 4; vi++) {
    for (let s = 1; s <= 40; s++) {
      const rec = fight(roster[vi], suburb, s, 100, false);
      if (!rec || !rec.fleeWise || (rec.rounds | 0) !== 1) continue;
      if (logOrder(rec).leaveFirst && (rec.vTaken | 0) > 0) { lf = { vi: vi, rng: s, vTaken: rec.vTaken }; break outerB; }
    }
  }
  assert(!!lf, '§1b found a leave-first wise leave with a parting hit (flag OFF)');
  if (lf) {
    const off = fight(roster[lf.vi], suburb, lf.rng, 100, false);
    const on = fight(roster[lf.vi], suburb, lf.rng, 100, true);
    assert(off.vTaken === lf.vTaken && on.vTaken === 0,
      '§1b leave-first: flag OFF vTaken ' + off.vTaken + ' -> flag ON vTaken 0 (same rng seed ' + lf.rng + ')');
    assert(on.outcome === 'vFlee' && !!on.fleeWise && (on.rounds | 0) === 1 && (on.mDealt | 0) === 0,
      '§1b flag ON: still vFlee, fleeWise, rounds 1, dealt 0 (outcome ' + on.outcome + ')');
    const ord = logOrder(on);
    assert(ord.leaveFirst && ord.hitIdx === -1,
      '§1b flag ON: the log holds the leave line and NO hit line after it (leaveIdx ' + ord.leaveIdx + ', hitIdx ' + ord.hitIdx + ')');
    assert(/kill a suburb/i.test((on.log || []).join(' ')),
      '§1b flag ON: the leave is still narrated as the correct counter');
  }

  // §1c monster-first: the hit lands BEFORE the leave — preserved.
  let mf = null;
  outerC:
  for (let vi = 0; vi < 4; vi++) {
    for (let s = 1; s <= 40; s++) {
      const rec = fight(roster[vi], suburb, s, 100, false);
      if (!rec || !rec.fleeWise || (rec.rounds | 0) !== 1) continue;
      const o = logOrder(rec);
      if (!o.leaveFirst && (rec.vTaken | 0) > 0) { mf = { vi: vi, rng: s, vTaken: rec.vTaken }; break outerC; }
    }
  }
  assert(!!mf, '§1c found a monster-first wise leave (hit before the leave, flag OFF)');
  if (mf) {
    const off = fight(roster[mf.vi], suburb, mf.rng, 100, false);
    const on = fight(roster[mf.vi], suburb, mf.rng, 100, true);
    assert(on.vTaken === off.vTaken && (on.vTaken | 0) > 0,
      '§1c monster-first: the pre-leave hit is preserved — vTaken ' + off.vTaken + ' on BOTH legs');
    assert(on.outcome === 'vFlee' && !!on.fleeWise,
      '§1c monster-first: flag ON still leaves wisely (outcome ' + on.outcome + ')');
    const ord = logOrder(on);
    assert(!ord.leaveFirst && ord.hitIdx !== -1 && ord.hitIdx < ord.leaveIdx,
      '§1c monster-first: the hit line still precedes the leave line on the armed leg');
  }

  // §1d wounded death: a 20-HP leaver dies walking out (OFF), lives (ON).
  let wd = null;
  outerD:
  for (let vi = 0; vi < 4; vi++) {
    for (let s = 1; s <= 40; s++) {
      const rec = fight(roster[vi], suburb, s, 100, false);
      if (!rec || !rec.fleeWise || (rec.rounds | 0) !== 1) continue;
      if (!logOrder(rec).leaveFirst || (rec.vTaken | 0) < 20) continue;
      const w = fight(roster[vi], suburb, s, 20, false);
      if (w && w.outcome === 'vDie' && !!w.fleeWise) { wd = { vi: vi, rng: s, vTaken: w.vTaken }; break outerD; }
    }
  }
  assert(!!wd, '§1d found a wounded leaver who dies walking out (flag OFF)');
  if (wd) {
    const on = fight(roster[wd.vi], suburb, wd.rng, 20, true);
    assert(on.outcome === 'vFlee' && (on.vTaken | 0) === 0,
      '§1d wounded leaver: flag OFF vDie (vTaken ' + wd.vTaken + ') -> flag ON vFlee, vTaken 0 (same rng seed ' + wd.rng + ')');
  }

  // §1e trick-unknown: the learning path is untouched by the flag.
  delete Game.state.villagerTricks.suburb;
  const uOff = fight(roster[0], suburb, 201, 100, false);
  const uOn = fight(roster[0], suburb, 201, 100, true);
  assert(!!uOff && !!uOn && eq(uOff, uOn) && (uOff.rounds | 0) > 1 && (uOff.mDealt | 0) > 0,
    '§1e trick unknown: the villager fights multi-round and deals damage, flag OFF vs ON identical (rounds ' + (uOff && uOff.rounds) + ', dealt ' + (uOff && uOff.mDealt) + ')');
  Game.state.villagerTricks.suburb = true;

  // §1f non-suburb control: a strike fight is identical with the flag on.
  const strike = mdef('strike');
  assert(!!strike && strike.wave === 4, '§1f strike def is wave 4');
  const sOff = fight(roster[0], strike, 301, 100, false);
  const sOn = fight(roster[0], strike, 301, 100, true);
  assert(!!sOff && !!sOn && eq(sOff, sOn),
    '§1f strike fight: flag OFF vs ON identical (outcome ' + (sOff && sOff.outcome) + ', rounds ' + (sOff && sOff.rounds) + ')');
  delete process.env.FLEEREPAIR3;
}

// ---- §2 analyzer on synthetic legs ----
(function section2() {
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
  const LEAVE_LINE = 'R1: Miles reads the sterile streets — you can’t kill a suburb. They walk out. (Navigation is victory.)';
  const HIT_LINE = 'R1: HOA Fine hits Miles for 13 (87 left)';
  // Classifier unit checks.
  assert(A.classifyLeave([LEAVE_LINE, "Miles's gear absorbs 31.", HIT_LINE], 13).partingHit === true,
    '§2 classifier: leave line before hit line + damage = parting hit');
  assert(A.classifyLeave([LEAVE_LINE, "Miles's gear absorbs 31.", HIT_LINE], 13).leaveFirst === true,
    '§2 classifier: leave-first is true when the leave line precedes the hit line');
  assert(A.classifyLeave(["Miles's gear absorbs 20.", HIT_LINE, LEAVE_LINE], 9).partingHit === false,
    '§2 classifier: hit line before leave line (monster-first) is NOT a parting hit');
  assert(A.classifyLeave([LEAVE_LINE], 0).partingHit === false,
    '§2 classifier: leave with no damage taken is NOT a parting hit');
  assert(A.classifyLeave([LEAVE_LINE], 0).leaveFirst === true,
    '§2 classifier: leave with no hit line at all is leave-first');
  assert(A.classifyLeave([], 0).partingHit === false && A.classifyLeave([], 0).leaveFirst === false,
    '§2 classifier: empty log is neither leave-first nor a parting hit');
  // Synthetic meetings.
  const parting = { day: 91, vid: 'a', mid: 'suburb', wave: 4, outcome: 'vFlee',
    rounds: 1, mDealt: 0, mHpStart: 581, mHpStartRec: 581, vTaken: 13, alliesN: 2, allyVid: null,
    calledHelp: false, origin: 'world-tick', fleeWise: true, fleeLearn: false,
    log: [LEAVE_LINE, "Miles's gear absorbs 31.", HIT_LINE] };
  const monsterFirst = { day: 92, vid: 'a', mid: 'suburb', wave: 4, outcome: 'vFlee',
    rounds: 1, mDealt: 0, mHpStart: 581, mHpStartRec: 581, vTaken: 9, alliesN: 2, allyVid: null,
    calledHelp: false, origin: 'world-tick', fleeWise: true, fleeLearn: false,
    log: ["Miles's gear absorbs 20.", HIT_LINE, LEAVE_LINE] };
  const cleanLeave = { day: 93, vid: 'a', mid: 'suburb', wave: 4, outcome: 'vFlee',
    rounds: 1, mDealt: 0, mHpStart: 581, mHpStartRec: 581, vTaken: 0, alliesN: 2, allyVid: null,
    calledHelp: false, origin: 'world-tick', fleeWise: true, fleeLearn: false,
    log: [LEAVE_LINE] };
  const ctlSeed = A.seedAnalysis(seed({ seed: 103602, encounters: [parting, monsterFirst, cleanLeave] }));
  assert(ctlSeed.partingHits === 1,
    '§2 one parting hit is counted among three wise leaves (partingHits=' + ctlSeed.partingHits + ')');
  assert(ctlSeed.leaveFirstMeetings === 2 && ctlSeed.leaveFirstMeanTaken === 6.5,
    '§2 leave-first meetings 2, mean taken 6.5 (got ' + ctlSeed.leaveFirstMeetings + ' / ' + ctlSeed.leaveFirstMeanTaken + ')');
  assert(ctlSeed.wiseLeaveDeaths === 0, '§2 no wise-leave deaths on this synthetic leg');
  // judgeB1: pass at 0 armed with ctl >= 1; fail at armed >= 1;
  // UNJUDGEABLE when the control leg shows 0 parting hits.
  const ctlS = A.summarize({ bySeed: { 103602: ctlSeed }, files: ['x'] });
  const armClean = A.seedAnalysis(seed({ seed: 103602, encounters: [monsterFirst, cleanLeave] }));
  const armS = A.summarize({ bySeed: { 103602: armClean }, files: ['x'] });
  const b1pass = A.judgeB1(armS, ctlS);
  assert(b1pass.state === 'pass' && b1pass.pass === true,
    '§2 judgeB1 PASSES with 0 armed parting hits against a calibrating control (ctl ' + ctlS.partingHits + ')');
  const armBad = A.seedAnalysis(seed({ seed: 103602, encounters: [parting] }));
  const armBadS = A.summarize({ bySeed: { 103602: armBad }, files: ['x'] });
  assert(A.judgeB1(armBadS, ctlS).state === 'fail',
    '§2 judgeB1 FAILS with >= 1 armed parting hit');
  const ctlEmpty = A.seedAnalysis(seed({ seed: 103602, encounters: [monsterFirst, cleanLeave] }));
  const ctlEmptyS = A.summarize({ bySeed: { 103602: ctlEmpty }, files: ['x'] });
  assert(A.judgeB1(armS, ctlEmptyS).state === 'unjudgeable',
    '§2 judgeB1 is UNJUDGEABLE when the control leg shows 0 parting hits (not a GO)');
  // judgeB2: no-kill-loss comparison.
  const ctlKills = A.seedAnalysis(seed({ seed: 103602, encounters: [
    { day: 50, vid: 'a', mid: 'strike', wave: 4, outcome: 'vKill', rounds: 5, mDealt: 400, mHpStart: null, alliesN: 1 },
  ] }));
  const ctlKS = A.summarize({ bySeed: { 103602: ctlKills }, files: ['x'] });
  const armKills = A.seedAnalysis(seed({ seed: 103602, encounters: [
    { day: 50, vid: 'a', mid: 'strike', wave: 4, outcome: 'vKill', rounds: 5, mDealt: 400, mHpStart: null, alliesN: 1 },
    { day: 60, vid: 'a', mid: 'audit', wave: 4, outcome: 'vKill', rounds: 4, mDealt: 300, mHpStart: null, alliesN: 1 },
  ] }));
  const armKS = A.summarize({ bySeed: { 103602: armKills }, files: ['x'] });
  assert(A.judgeB2(armKS, ctlKS).pass === true,
    '§2 judgeB2 PASSES when armed wave-4 kills (' + armKS.w4kills + ') >= control (' + ctlKS.w4kills + ')');
  assert(A.judgeB2(ctlKS, armKS).pass === false,
    '§2 judgeB2 FAILS when armed wave-4 kills fall below control');
  // Instrument bar: fought row without HP still counts missing.
  const gap = A.seedAnalysis(seed({ seed: 103602,
    encounters: [{ day: 50, vid: 'a', mid: 'eater', wave: 4, outcome: 'vFlee', rounds: 4, mDealt: 120, mHpStart: null, alliesN: 1 }],
  }));
  assert(gap.missingHp === 1, '§2 fought row without HP counts missing (missingHp=' + gap.missingHp + ')');
})();

// ---- §3 driver module ----
(function section3() {
  assert(typeof driver.recoverMHpStart === 'function', '§3 driver exports recoverMHpStart');
  assert(typeof driver.classifySeedPath === 'function', '§3 driver exports classifySeedPath');
  assert(typeof driver.oneRun === 'function', '§3 driver exports oneRun');
  assert(eq(driver.classifySeedPath('fled', 'at Object.resolveWildMonsterEncounter (src/js/game.js:20949:16)'), 'world-tick'),
    '§3 seed-path classifier still names the world-tick path');
})();

async function main() {
  await live();
  console.log(failures === 0 ? 'ALL PASS' : failures + ' FAILURES');
  process.exitCode = failures === 0 ? 0 : 1;
}
if (require.main === module) main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

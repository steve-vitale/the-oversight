// test-aidleave-b.js — proof test, arm sim-aidleave-b.
// Proves the aid-path leave-hit diagnosis (finding #2540) and the
// staged probes from the frozen prereg:
//   §1 LIVE staged fights (one harness, seed 7; every fight takes a
//      fresh mulberry32(rngSeed) as opts.rng, so flag OFF vs ON on the
//      same rng seed is the SAME fight up to the lever):
//      a. determinism: same rng seed twice, flag OFF -> identical rec.
//      b. leave-first (plain shape): villager wins initiative, leaves
//         round 1 — flag OFF vTaken > 0 (parting hit present); flag
//         ON, SAME rng seed: outcome still vFlee, fleeWise, rounds 1,
//         mDealt 0, vTaken 0, and the log holds the leave line with NO
//         hit line after it.
//      c. P1 AID SHAPE: the same leave-first case re-staged through
//         the aid path's shape — allyFromStart + foreignAllies at the
//         door, exactly as aidFight calls fieldFight — flag OFF
//         vTaken > 0; flag ON, SAME rng seed: vTaken 0, still vFlee /
//         fleeWise / rounds 1 / mDealt 0. This proves the FLEEREPAIR3
//         break covers the aid path's fieldFight call.
//      d. monster-first: the hit lands BEFORE the leave — vTaken > 0
//         on BOTH legs (the pre-leave hit is preserved, only the
//         parting hit goes).
//      e. wounded death: 20-HP leaver, flag OFF -> vDie with fleeWise
//         (died walking out); flag ON, SAME rng seed -> vFlee, vTaken 0.
//      f. trick-unknown: villager fights multi-round, deals damage —
//         flag OFF vs ON identical (the learning path is untouched).
//      g. non-suburb control: a strike fight — flag OFF vs ON identical.
//   §2 Analyzer on synthetic legs: the aid-known cut (n / total /
//      parting / monster-first / deaths), the parting-hit classifier,
//      judgeD1 calibration (pass / unjudgeable), judgeD2 mechanism
//      (A / B / C / mix), the P2 counterfactual re-score, instrument bar.
//   §3 Driver module loads and exports its helpers.
// Live sections run through scripts/sim-harness.js (seeded, full
// src/js list in index.html order, Math.random seeded before eval).
// Usage: node scripts/test-aidleave-b.js
'use strict';
const path = require('path');
const { loadGame, setupGame, mulberry32 } = require('./sim-harness');
const driver = require('./aidleave-driver-b');
const A = require('./analyze-aidleave-b');

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
  assert(typeof Game.aidFight === 'function', '§1 Game.aidFight exists (the aid path routes through fieldFight)');
  const suburb = mdef('suburb');
  assert(!!suburb && suburb.wave === 4, '§1 suburb def is wave 4 (hp range ' + JSON.stringify(suburb && suburb.hp) + ')');
  Game.state.villagerTricks = Game.state.villagerTricks || {};
  Game.state.villagerTricks.suburb = true;

  // The aid shape, exactly as aidFight builds it: allies at the door
  // from round 1, foreign allies carrying their own names.
  const AID_OPTS = {
    allies: 2,
    allyVids: ['aid:testvillage:0', 'aid:testvillage:1'],
    allyFromStart: true,
    foreignAllies: {
      'aid:testvillage:0': { villageId: 'testvillage', face: 'Test Leader', name: 'Test Leader' },
      'aid:testvillage:1': { villageId: 'testvillage', face: 'Test Second', name: 'Test Second' },
    },
  };
  const fight = function (vid, def, rngSeed, hp, flagOn, aidShape) {
    setHealth(vid, hp);
    if (flagOn) process.env.FLEEREPAIR3 = '1'; else delete process.env.FLEEREPAIR3;
    const opts = { awareness: false, rng: mulberry32(rngSeed) };
    if (aidShape) Object.assign(opts, JSON.parse(JSON.stringify(AID_OPTS)));
    const rec = Game.fieldFight(vid, def, null, opts);
    delete process.env.FLEEREPAIR3;
    return rec;
  };

  // §1a determinism: same rng seed, flag OFF, twice -> identical rec.
  const d1 = fight(roster[0], suburb, 101, 100, false);
  const d2 = fight(roster[0], suburb, 101, 100, false);
  assert(!!d1 && !!d2 && eq(d1, d2),
    '§1a same rng seed twice (flag OFF) reproduces the fight exactly (outcome ' + (d1 && d1.outcome) + ', vTaken ' + (d1 && d1.vTaken) + ')');

  // §1b leave-first (plain shape): find a case, then re-run it with the flag ON.
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
  }

  // §1c P1 AID SHAPE: the same leave-first case through aidFight's shape.
  if (lf) {
    const aidOff = fight(roster[lf.vi], suburb, lf.rng, 100, false, true);
    assert(!!aidOff && !!aidOff.fleeWise && (aidOff.rounds | 0) === 1 && logOrder(aidOff).leaveFirst,
      '§1c P1 aid shape, flag OFF: still a leave-first wise leave (outcome ' + (aidOff && aidOff.outcome) + ', vTaken ' + (aidOff && aidOff.vTaken) + ')');
    const aidOn = fight(roster[lf.vi], suburb, lf.rng, 100, true, true);
    assert(!!aidOn && aidOn.outcome === 'vFlee' && !!aidOn.fleeWise && (aidOn.rounds | 0) === 1 && (aidOn.mDealt | 0) === 0 && (aidOn.vTaken | 0) === 0,
      '§1c P1 aid shape, flag ON: vFlee, fleeWise, rounds 1, dealt 0, vTaken 0 (same rng seed ' + lf.rng + '; OFF was ' + (aidOff && aidOff.vTaken) + ')');
    if (aidOff && aidOn) {
      assert((aidOff.vTaken | 0) > 0 && (aidOn.vTaken | 0) === 0,
        '§1c P1 aid shape: the parting hit is present OFF (' + aidOff.vTaken + ') and gone ON (0) — the FLEEREPAIR3 break covers the aid path');
      const ordOn = logOrder(aidOn);
      assert(ordOn.leaveFirst && ordOn.hitIdx === -1,
        '§1c P1 aid shape, flag ON: leave line present, NO hit line after it');
    }
  } else {
    fail('§1c P1 aid shape: no leave-first case found to re-stage (depends on §1b)');
  }

  // §1d monster-first: the hit lands BEFORE the leave — preserved.
  let mf = null;
  outerD:
  for (let vi = 0; vi < 4; vi++) {
    for (let s = 1; s <= 40; s++) {
      const rec = fight(roster[vi], suburb, s, 100, false);
      if (!rec || !rec.fleeWise || (rec.rounds | 0) !== 1) continue;
      const o = logOrder(rec);
      if (!o.leaveFirst && (rec.vTaken | 0) > 0) { mf = { vi: vi, rng: s, vTaken: rec.vTaken }; break outerD; }
    }
  }
  assert(!!mf, '§1d found a monster-first wise leave (hit before the leave, flag OFF)');
  if (mf) {
    const off = fight(roster[mf.vi], suburb, mf.rng, 100, false);
    const on = fight(roster[mf.vi], suburb, mf.rng, 100, true);
    assert(on.vTaken === off.vTaken && (on.vTaken | 0) > 0,
      '§1d monster-first: the pre-leave hit is preserved — vTaken ' + off.vTaken + ' on BOTH legs');
    assert(on.outcome === 'vFlee' && !!on.fleeWise,
      '§1d monster-first: flag ON still leaves wisely (outcome ' + on.outcome + ')');
  }

  // §1e wounded death: a 20-HP leaver dies walking out (OFF), lives (ON).
  let wd = null;
  outerE:
  for (let vi = 0; vi < 4; vi++) {
    for (let s = 1; s <= 40; s++) {
      const rec = fight(roster[vi], suburb, s, 100, false);
      if (!rec || !rec.fleeWise || (rec.rounds | 0) !== 1) continue;
      if (!logOrder(rec).leaveFirst || (rec.vTaken | 0) < 20) continue;
      const w = fight(roster[vi], suburb, s, 20, false);
      if (w && w.outcome === 'vDie' && !!w.fleeWise) { wd = { vi: vi, rng: s, vTaken: w.vTaken }; break outerE; }
    }
  }
  assert(!!wd, '§1e found a wounded leaver who dies walking out (flag OFF)');
  if (wd) {
    const on = fight(roster[wd.vi], suburb, wd.rng, 20, true);
    assert(on.outcome === 'vFlee' && (on.vTaken | 0) === 0,
      '§1e wounded leaver: flag OFF vDie (vTaken ' + wd.vTaken + ') -> flag ON vFlee, vTaken 0 (same rng seed ' + wd.rng + ')');
  }

  // §1f trick-unknown: the learning path is untouched by the flag.
  delete Game.state.villagerTricks.suburb;
  const uOff = fight(roster[0], suburb, 201, 100, false);
  const uOn = fight(roster[0], suburb, 201, 100, true);
  assert(!!uOff && !!uOn && eq(uOff, uOn) && (uOff.rounds | 0) > 1 && (uOff.mDealt | 0) > 0,
    '§1f trick unknown: the villager fights multi-round and deals damage, flag OFF vs ON identical (rounds ' + (uOff && uOff.rounds) + ', dealt ' + (uOff && uOff.mDealt) + ')');
  Game.state.villagerTricks.suburb = true;

  // §1g non-suburb control: a strike fight is identical with the flag on.
  const strike = mdef('strike');
  assert(!!strike && strike.wave === 4, '§1g strike def is wave 4');
  const sOff = fight(roster[0], strike, 301, 100, false);
  const sOn = fight(roster[0], strike, 301, 100, true);
  assert(!!sOff && !!sOn && eq(sOff, sOn),
    '§1g strike fight: flag OFF vs ON identical (outcome ' + (sOff && sOff.outcome) + ', rounds ' + (sOff && sOff.rounds) + ')');
  delete process.env.FLEEREPAIR3;
}

// ---- §2 analyzer on synthetic legs ----
(function section2() {
  function seed(o) {
    return {
      seed: o.seed, days: 150, gameDays: 147, endReason: 'horizon', standing: 120, scaleRank: 'village',
      won: false, maxWave: 4, villageLost: false, instrumentErrors: [],
      winPlanStats: { partyTrios: 0, partyQuads: 0, trickHolds: o.trickHolds || 0 },
      v4seeds: [], v4departs: [], dawnbidScores: [],
      v4encounters: o.encounters || [],
      companionPool: [], deaths: [], daily: [{ day: 1 }, { day: 147 }],
    };
  }
  const LEAVE_LINE = 'R1: Miles reads the sterile streets — you can’t kill a suburb. They walk out. (Navigation is victory.)';
  const HIT_LINE = 'R1: HOA Fine hits Miles for 13 (87 left)';
  function meet(o) {
    return { day: o.day, vid: 'a', mid: o.mid || 'suburb', wave: 4, outcome: o.outcome || 'vFlee',
      rounds: o.rounds == null ? 1 : o.rounds, mDealt: 0, mHpStart: 581, mHpStartRec: 581,
      vTaken: o.vTaken || 0, alliesN: 2, allyVid: null, calledHelp: false,
      origin: o.origin || 'aid', fleeWise: o.fleeWise == null ? true : o.fleeWise,
      fleeLearn: false, trickBefore: o.trickBefore == null ? true : o.trickBefore,
      trickAfter: true, log: o.log || [LEAVE_LINE] };
  }
  // Classifier unit checks.
  assert(A.classifyLeave([LEAVE_LINE, HIT_LINE], 13).partingHit === true,
    '§2 classifier: leave line before hit line + damage = parting hit');
  assert(A.classifyLeave([HIT_LINE, LEAVE_LINE], 9).partingHit === false,
    '§2 classifier: hit line before leave line (monster-first) is NOT a parting hit');
  assert(A.classifyLeave([LEAVE_LINE], 0).partingHit === false,
    '§2 classifier: leave with no damage taken is NOT a parting hit');
  assert(A.classifyLeave([], 0).partingHit === false && A.classifyLeave([], 0).leaveFirst === false,
    '§2 classifier: empty log is neither leave-first nor a parting hit');
  // Synthetic legs: the 104417 chain in miniature — 2 aid-known
  // parting hits (13, 17, one death), 1 monster-first (9), 1 clean.
  const ctlSeed = A.seedAnalysis(seed({ seed: 104417, trickHolds: 3, encounters: [
    meet({ day: 94, vTaken: 13, log: [LEAVE_LINE, HIT_LINE] }),
    meet({ day: 98, vTaken: 17, outcome: 'vDie', log: [LEAVE_LINE, HIT_LINE] }),
    meet({ day: 95, vTaken: 9, log: [HIT_LINE, LEAVE_LINE] }),
    meet({ day: 96, vTaken: 0 }),
  ] }));
  const ctlS = A.summarize({ bySeed: { 104417: ctlSeed }, files: ['x'] });
  assert(ctlS.aidKnown.n === 4 && ctlS.aidKnown.totalTaken === 39,
    '§2 aid-known slice n=4 total 39 (got ' + ctlS.aidKnown.n + ' / ' + ctlS.aidKnown.totalTaken + ')');
  assert(ctlS.aidKnown.partingHits === 2 && ctlS.aidKnown.partingDamage === 30,
    '§2 aid-known parting 2 / damage 30');
  assert(ctlS.aidKnown.monsterFirst === 1 && ctlS.aidKnown.monsterFirstDamage === 9,
    '§2 aid-known monster-first 1 / damage 9');
  assert(ctlS.aidKnown.deaths === 1 && ctlS.aidKnown.partingDeaths === 1,
    '§2 aid-known deaths 1, parting deaths 1');
  assert(ctlS.p2.meetingsAvoided === 4 && ctlS.p2.savedDamage === 39 && ctlS.p2.savedDeaths === 1,
    '§2 P2 re-score avoids 4, saves 39 damage, 1 death');
  // judgeD1: pass at ctl >= 1; UNJUDGEABLE at ctl 0.
  assert(A.judgeD1(ctlS, null).state === 'pass',
    '§2 judgeD1 PASSES with a calibrating control (fresh parting ' + ctlS.aidKnown.partingHits + ')');
  const armClean = A.seedAnalysis(seed({ seed: 104417, encounters: [
    meet({ day: 94, vTaken: 0 }), meet({ day: 95, vTaken: 9, log: [HIT_LINE, LEAVE_LINE] }),
  ] }));
  const armS = A.summarize({ bySeed: { 104417: armClean }, files: ['x'] });
  const d2mix = A.judgeD2(ctlS, armS);
  assert(d2mix.state === 'pass' && d2mix.mechanism === 'mix',
    '§2 judgeD2 classifies the mixed synthetic leg as mix (mechanism ' + d2mix.mechanism + ')');
  const ctlPure = A.seedAnalysis(seed({ seed: 104417, encounters: [
    meet({ day: 94, vTaken: 13, log: [LEAVE_LINE, HIT_LINE] }),
    meet({ day: 95, vTaken: 25, log: [LEAVE_LINE, HIT_LINE] }),
    meet({ day: 96, vTaken: 0 }),
  ] }));
  const armPure = A.seedAnalysis(seed({ seed: 104417, encounters: [
    meet({ day: 94, vTaken: 0 }), meet({ day: 95, vTaken: 0 }),
  ] }));
  const armPureS = A.summarize({ bySeed: { 104417: armPure }, files: ['x'] });
  assert(A.judgeD2(
    A.summarize({ bySeed: { 104417: ctlPure }, files: ['x'] }),
    armPureS).mechanism === 'A',
    '§2 judgeD2 mechanism A when the arm leg is all clean leaves');
  const armC = A.seedAnalysis(seed({ seed: 104417, encounters: [
    meet({ day: 94, vTaken: 13, log: [LEAVE_LINE, HIT_LINE] }),
  ] }));
  const armCS = A.summarize({ bySeed: { 104417: armC }, files: ['x'] });
  assert(A.judgeD2(ctlS, armCS).mechanism === 'C',
    '§2 judgeD2 mechanism C when the arm leg still takes leave-first damage');
  const emptyCtl = A.seedAnalysis(seed({ seed: 104417, encounters: [meet({ day: 96, vTaken: 0 })] }));
  const emptyS = A.summarize({ bySeed: { 104417: emptyCtl }, files: ['x'] });
  assert(A.judgeD1(emptyS, null).state === 'unjudgeable',
    '§2 judgeD1 is UNJUDGEABLE when the control leg shows 0 parting hits (not a GO)');
  // Instrument bar: fought row without HP still counts missing.
  const gap = A.seedAnalysis(seed({ seed: 104417,
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

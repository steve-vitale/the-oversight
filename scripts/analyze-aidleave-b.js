// analyze-aidleave-b.js — classifier for arm sim-aidleave-b
// (DIAG: the aid-path leave-hit, finding #2540 — the Suburb 'leave'
// trick does not make the leave free on the aid path.)
// Reads the aidleave driver corpora (ctl = VETREENGAGE=1 +
// PARTYSIZE4=1 + FLEEREPAIR2=1, arm = ctl + FLEEREPAIR3=1; band
// 104411-104418, 150d, competent verbatim) and judges the frozen
// prereg bars (evidence/2026-11-18/sim-aidleave-b-prereg.md):
//   D1 (PRIMARY): aid-path leave damage with the trick known,
//       ctl vs arm — aid-origin, mid 'suburb', trickBefore true,
//       fleeWise, rounds 1: n, vTaken total/mean/median/max,
//       parting-hit count, monster-first count, wise-leave deaths
//       attributable to the leave-hit. CALIBRATION (frozen): the
//       control leg (fresh ctl, else the archived wildavoid ctl
//       corpus passed as a third dir) must show >= 1 aid trick-known
//       parting hit; if 0 on both, D1 is UNJUDGEABLE.
//   D2 (mechanism): every ctl aid trick-known Suburb wise leave is
//       classified parting-hit / monster-first / clean by log order
//       (same classifier as analyze-fleerepair3-b.js). The verdict
//       names (A) parting hit, (B) monster-first, (C) aid-specific
//       second source, or a mix with damage shares. Classification
//       must cover >= 80% of the ctl leg's aid trick-known wise-leave
//       damage or D2 is UNJUDGEABLE.
//   D3 (known vs unknown, ctl leg): aid-origin Suburb wise-leave
//       damage per meeting with trickBefore true vs false.
//   D4 (staged probes): P2 counterfactual re-score — re-score every
//       aid trick-known Suburb wise leave as "avoided by a trick-hold
//       consult" (damage 0, no death); report saved damage / saved
//       deaths (the upper bound of what an aid-path trick-hold
//       consult would buy beyond FLEEREPAIR3). P3 gate check —
//       winPlanStats.trickHolds on the band vs aid trick-known
//       Suburb meetings (the existing gate holds only trick-UNKNOWN
//       seeks).
//   D5 (wall, reported not judged): wins, national standing/rank,
//       table (not instrumented — 0, as in fleerepair3-b), wave-4/5
//       unlock, median survival.
//   Instrument: all files parse, 0 instrument errors, every FOUGHT
//       encounter row carries mHpStart (same rule as fleerepair3-b:
//       no-contact evades and kills exempt), seed sets match.
//   Panel (§15) is built separately (build-aidleave-b-panels.js +
//   balance-panel.js compare); this analyzer does not judge it.
// Usage:
//   node scripts/analyze-aidleave-b.js <ctlDir> <armDir> [archDir]
//   node scripts/analyze-aidleave-b.js --selftest
// Writes evidence/2026-11-18/aidleave-b-analysis.json. Exits 0 iff
// the verdict is DIAG-GO; exits 1 on DIAG-NO-GO or UNJUDGEABLE.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

function loadDir(dir) {
  const out = {};
  const files = fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); }).sort();
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[j.seed] = j;
  }
  return { bySeed: out, files: files };
}
function round(x, n) { return Math.round(x * Math.pow(10, n)) / Math.pow(10, n); }
function med(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function mean(a) { return a.length ? a.reduce(function (t, x) { return t + x; }, 0) / a.length : null; }
function sum(a) { return a.reduce(function (t, x) { return t + x; }, 0); }

// Parting-hit classifier (identical to analyze-fleerepair3-b.js).
// A wise leave is narrated by "reads the sterile streets"; a monster
// hit by "R1: <attack> hits <name> for N". Leave-first = its line
// precedes the first hit line (villager won initiative and walked
// out) — or no hit line exists at all. A parting hit is a leave-first
// wise leave that still took damage: the monster phase ran after the
// exit. A monster-first leave (hit line before the leave line) is a
// legitimate hit and is NOT a parting hit. Exported for the proof test.
var LEAVE_RE = /reads the sterile streets/;
var HIT_RE = /hits .* for \d+/;
function classifyLeave(log, vTaken) {
  var lines = Array.isArray(log) ? log : [];
  var leaveIdx = -1, hitIdx = -1;
  for (var i = 0; i < lines.length; i++) {
    var s = String(lines[i]);
    if (leaveIdx === -1 && LEAVE_RE.test(s)) leaveIdx = i;
    if (hitIdx === -1 && HIT_RE.test(s)) hitIdx = i;
  }
  var leaveFirst = leaveIdx !== -1 && (hitIdx === -1 || leaveIdx < hitIdx);
  return { leaveIdx: leaveIdx, hitIdx: hitIdx, leaveFirst: leaveFirst,
    partingHit: leaveFirst && ((vTaken | 0) > 0) };
}

// One slice of Suburb meetings: origin + trickBefore. With
// wiseOnly (default true) it is the wise-leave slice (fleeWise,
// rounds 1) — the D1 slice. With wiseOnly false it is every fought
// meeting (rounds >= 1) — the D3 unknown baseline, since a
// trick-unknown villager can never fire the leave trick: their
// meetings are multi-round fights and morale flees, and the honest
// contrast is damage per meeting, known-wise-leave vs unknown-fought.
function sliceMeetings(meetings, origin, trickKnown, opts) {
  const wiseOnly = !opts || opts.wiseOnly !== false;
  const rows = meetings.filter(function (m) {
    if (m.mid !== 'suburb' || m.origin !== origin) return false;
    if ((m.trickBefore === true) !== trickKnown && trickKnown !== null) return false;
    if (wiseOnly) return !!m.fleeWise && (m.rounds | 0) === 1;
    return (m.rounds | 0) >= 1;
  });
  const taken = rows.map(function (m) { return m.vTaken | 0; });
  return {
    n: rows.length,
    totalTaken: sum(taken),
    meanTaken: taken.length ? round(mean(taken), 2) : null,
    medianTaken: med(taken),
    maxTaken: taken.length ? Math.max.apply(null, taken) : null,
    taken: taken,
    partingHits: rows.filter(function (m) { return !!m.partingHit; }).length,
    partingDamage: sum(rows.filter(function (m) { return !!m.partingHit; }).map(function (m) { return m.vTaken | 0; })),
    monsterFirst: rows.filter(function (m) { return !!m.monsterFirst; }).length,
    monsterFirstDamage: sum(rows.filter(function (m) { return !!m.monsterFirst; }).map(function (m) { return m.vTaken | 0; })),
    clean: rows.filter(function (m) { return (m.vTaken | 0) === 0; }).length,
    unclassifiedDamage: sum(rows.filter(function (m) {
      return (m.vTaken | 0) > 0 && !m.partingHit && !m.monsterFirst;
    }).map(function (m) { return m.vTaken | 0; })),
    deaths: rows.filter(function (m) { return m.outcome === 'vDie'; }).length,
    partingDeaths: rows.filter(function (m) { return m.outcome === 'vDie' && !!m.partingHit; }).length,
    monsterFirstDeaths: rows.filter(function (m) { return m.outcome === 'vDie' && !!m.monsterFirst; }).length,
    rows: rows,
  };
}

function seedAnalysis(j) {
  const encounters = (j.v4encounters || []).slice();
  let missingHp = 0, recMismatch = 0;
  const meetings = [];
  for (const e of encounters) {
    const noContact = e.outcome === 'evade' || e.outcome === 'alreadyDead' ||
      (((e.rounds | 0) === 0) && ((e.mDealt | 0) === 0));
    const isKill = e.outcome === 'vKill';
    if (e.mHpStart == null && !noContact && !isKill) missingHp++;
    if (e.mHpStart != null && e.mHpStartRec != null && e.mHpStart !== e.mHpStartRec) recMismatch++;
    const cls = classifyLeave(e.log, e.vTaken);
    const isWiseSuburbR1 = e.mid === 'suburb' && !!e.fleeWise && (e.rounds | 0) === 1;
    meetings.push({ day: e.day, vid: e.vid, mid: e.mid, wave: e.wave, outcome: e.outcome || null,
      rounds: e.rounds, mDealt: e.mDealt || 0, vTaken: e.vTaken | 0,
      origin: e.origin || null,
      fleeWise: !!e.fleeWise, fleeLearn: !!e.fleeLearn,
      trickBefore: (e.trickBefore == null ? null : !!e.trickBefore),
      trickAfter: (e.trickAfter == null ? null : !!e.trickAfter),
      leaveFirst: cls.leaveFirst,
      partingHit: isWiseSuburbR1 ? cls.partingHit : false,
      monsterFirst: isWiseSuburbR1 ? (!cls.leaveFirst && cls.hitIdx !== -1 && ((e.vTaken | 0) > 0)) : false,
      alliesN: e.alliesN, allyVid: e.allyVid || null,
      calledHelp: !!e.calledHelp });
  }
  const stats = j.winPlanStats || {};
  const deaths = j.deaths || [];
  return {
    seed: j.seed, days: j.days, gameDays: j.gameDays, endReason: j.endReason,
    standing: j.standing, scaleRank: j.scaleRank, won: !!j.won, maxWave: j.maxWave,
    villageLost: !!j.villageLost,
    instrumentErrors: (j.instrumentErrors || []).length,
    encounters: encounters.length, missingHp: missingHp, recMismatch: recMismatch,
    meetings: meetings,
    // D1 slices (aid origin, trick known / unknown) + world-tick control slices.
    aidKnown: sliceMeetings(meetings, 'aid', true),
    aidUnknown: sliceMeetings(meetings, 'aid', false, { wiseOnly: false }),
    tickKnown: sliceMeetings(meetings, 'world-tick', true),
    tickUnknown: sliceMeetings(meetings, 'world-tick', false),
    aidSuburbAll: sliceMeetings(meetings, 'aid', null),
    w4kills: meetings.filter(function (m) { return m.wave === 4 && m.outcome === 'vKill'; }).length,
    // P3: the existing gate's trick-holds on this seed.
    trickHolds: stats.trickHolds | 0,
    deaths: deaths.length,
    expedDeaths: deaths.filter(function (d) { return d.cause === 'expedition'; }).length,
  };
}

function summarize(leg) {
  const seeds = Object.keys(leg.bySeed).sort().map(function (k) { return leg.bySeed[k]; });
  function aggSlice(key) {
    const rows = [];
    for (const s of seeds) for (const r of (s[key].rows || [])) rows.push(r);
    const taken = rows.map(function (m) { return m.vTaken | 0; });
    return {
      n: rows.length,
      totalTaken: sum(taken),
      meanTaken: taken.length ? round(mean(taken), 2) : null,
      medianTaken: med(taken),
      maxTaken: taken.length ? Math.max.apply(null, taken) : null,
      taken: taken,
      partingHits: rows.filter(function (m) { return !!m.partingHit; }).length,
      partingDamage: sum(rows.filter(function (m) { return !!m.partingHit; }).map(function (m) { return m.vTaken | 0; })),
      monsterFirst: rows.filter(function (m) { return !!m.monsterFirst; }).length,
      monsterFirstDamage: sum(rows.filter(function (m) { return !!m.monsterFirst; }).map(function (m) { return m.vTaken | 0; })),
      clean: rows.filter(function (m) { return (m.vTaken | 0) === 0; }).length,
      unclassifiedDamage: sum(rows.filter(function (m) {
        return (m.vTaken | 0) > 0 && !m.partingHit && !m.monsterFirst;
      }).map(function (m) { return m.vTaken | 0; })),
      deaths: rows.filter(function (m) { return m.outcome === 'vDie'; }).length,
      partingDeaths: rows.filter(function (m) { return m.outcome === 'vDie' && !!m.partingHit; }).length,
      monsterFirstDeaths: rows.filter(function (m) { return m.outcome === 'vDie' && !!m.monsterFirst; }).length,
      rows: rows,
    };
  }
  const aidKnown = aggSlice('aidKnown');
  const aidUnknown = aggSlice('aidUnknown');
  const tickKnown = aggSlice('tickKnown');
  const tickUnknown = aggSlice('tickUnknown');
  const aidSuburbAll = aggSlice('aidSuburbAll');
  // P2 re-score on the aggregated aid-known slice: avoiding every
  // aid trick-known wise leave saves its whole vTaken and every
  // death in the slice (the deaths ARE leave-hit deaths: rounds 1,
  // mDealt 0, the only damage is the leave damage).
  const p2 = {
    meetingsAvoided: aidKnown.n,
    savedDamage: aidKnown.totalTaken,
    savedDeaths: aidKnown.deaths,
    savedPartingDamage: aidKnown.partingDamage,
    savedPartingDeaths: aidKnown.partingDeaths,
  };
  const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
  let encounters = 0, missingHp = 0, recMismatch = 0, w4kills = 0, deaths = 0, exped = 0, errors = 0, trickHolds = 0;
  for (const s of seeds) {
    encounters += s.encounters; missingHp += s.missingHp; recMismatch += s.recMismatch || 0;
    w4kills += s.w4kills; deaths += s.deaths; exped += s.expedDeaths; errors += s.instrumentErrors;
    trickHolds += s.trickHolds;
  }
  return {
    files: leg.files.length, seeds: seeds.length,
    seedList: seeds.map(function (s) { return s.seed; }),
    aidKnown: aidKnown, aidUnknown: aidUnknown,
    tickKnown: tickKnown, tickUnknown: tickUnknown,
    aidSuburbAll: aidSuburbAll,
    p2: p2,
    trickHolds: trickHolds,
    w4kills: w4kills,
    encounters: encounters, missingHp: missingHp, recMismatch: recMismatch,
    deaths: deaths, expedDeaths: exped,
    instrumentErrors: errors,
    survived: seeds.filter(function (s) { return !s.villageLost; }).length,
    medianSurvival: med(seeds.map(function (s) { return s.gameDays || s.days || 0; })),
    wall: {
      nationalStanding: seeds.filter(function (s) { return (s.standing || 0) >= 200; }).length,
      nationalRank: seeds.filter(function (s) { return (RANK_ORDER[s.scaleRank] || 0) >= 2; }).length,
      table: 0, wins: seeds.filter(function (s) { return !!s.won; }).length,
      wave4: seeds.filter(function (s) { return (s.maxWave || 1) >= 4; }).length,
      wave5: seeds.filter(function (s) { return (s.maxWave || 1) >= 5; }).length,
    },
    perSeed: seeds.map(function (s) {
      return { seed: s.seed, days: s.days, gameDays: s.gameDays, endReason: s.endReason,
        standing: s.standing, scaleRank: s.scaleRank, won: s.won, maxWave: s.maxWave,
        aidKnownN: s.aidKnown.n, aidKnownTaken: s.aidKnown.totalTaken,
        aidKnownParting: s.aidKnown.partingHits, aidKnownDeaths: s.aidKnown.deaths,
        aidUnknownN: s.aidUnknown.n, aidUnknownTaken: s.aidUnknown.totalTaken,
        tickKnownN: s.tickKnown.n, tickKnownTaken: s.tickKnown.totalTaken,
        trickHolds: s.trickHolds, w4kills: s.w4kills, deaths: s.deaths,
        instrumentErrors: s.instrumentErrors, missingHp: s.missingHp };
    }),
  };
}

// D1 calibration: the control leg must show >= 1 aid trick-known
// parting hit (fresh ctl, else the archived corpus). Exported.
function judgeD1(ctlS, archS) {
  const fresh = (ctlS.aidKnown.partingHits | 0);
  const arch = archS ? (archS.aidKnown.partingHits | 0) : 0;
  if (fresh === 0 && arch === 0) {
    return { state: 'unjudgeable', pass: false, fresh: fresh, archived: arch,
      reason: 'calibration: no aid trick-known parting hit on either control leg — phenomenon absent' };
  }
  return { state: 'pass', pass: true, fresh: fresh, archived: arch,
    reason: 'control shows ' + fresh + ' fresh + ' + arch + ' archived aid trick-known parting hit(s)' };
}

// D2 mechanism: classify the ctl leg's aid trick-known wise-leave
// damage. Coverage = classified damage / total damage in the slice.
// Mechanism (A) when the arm leg has 0 parting hits and parting
// damage dominates the ctl slice; (B) when monster-first dominates
// and arm damage persists; (C) when leave-first damage persists on
// the arm leg; else 'mix' with shares. Exported.
function judgeD2(ctlS, armS) {
  const c = ctlS.aidKnown, a = armS.aidKnown;
  const total = c.totalTaken || 0;
  const classified = (c.partingDamage || 0) + (c.monsterFirstDamage || 0);
  const coverage = total > 0 ? classified / total : 1;
  if (total === 0) {
    return { state: 'unjudgeable', pass: false, mechanism: null, coverage: coverage,
      reason: 'no aid trick-known wise-leave damage on the control leg to classify' };
  }
  if (coverage < 0.8) {
    return { state: 'unjudgeable', pass: false, mechanism: null, coverage: round(coverage, 3),
      reason: 'classified damage covers only ' + round(coverage * 100, 1) + '% of the slice (< 80%)' };
  }
  const partingShare = (c.partingDamage || 0) / total;
  const monsterShare = (c.monsterFirstDamage || 0) / total;
  let mechanism;
  if ((a.partingHits | 0) === 0 && partingShare >= 0.8) mechanism = 'A';
  else if ((a.totalTaken | 0) > 0 && (a.partingHits | 0) > 0) mechanism = 'C';
  else if (monsterShare >= 0.8) mechanism = 'B';
  else mechanism = 'mix';
  return { state: 'pass', pass: true, mechanism: mechanism, coverage: round(coverage, 3),
    partingShare: round(partingShare, 3), monsterShare: round(monsterShare, 3),
    ctlTotal: total, armTotal: a.totalTaken, armPartingHits: a.partingHits,
    reason: 'mechanism ' + mechanism + ' (parting ' + round(partingShare * 100, 1) +
      '%, monster-first ' + round(monsterShare * 100, 1) + '% of ctl damage; arm total ' +
      a.totalTaken + ', arm parting hits ' + a.partingHits + ')' };
}

function judgeInstrument(ctlS, armS) {
  const expectedFiles = Math.max(ctlS.files, armS.files);
  const ctlSeeds = (ctlS.seedList || []).slice().sort();
  const armSeeds = (armS.seedList || []).slice().sort();
  const seedsMatch = ctlSeeds.length === armSeeds.length &&
    ctlSeeds.every(function (s, i) { return s === armSeeds[i]; });
  const pass = ctlS.instrumentErrors === 0 && armS.instrumentErrors === 0 &&
    ctlS.files === expectedFiles && armS.files === expectedFiles &&
    ctlS.missingHp === 0 && armS.missingHp === 0 && seedsMatch;
  return { pass: pass, expectedFiles: expectedFiles, seedsMatch: seedsMatch };
}

function selftest() {
  let fails = 0;
  function assert(c, m) { if (c) console.log('ok: ' + m); else { fails++; console.error('FAIL: ' + m); } }
  const LEAVE_LINE = 'R1: Miles reads the sterile streets — you can’t kill a suburb. They walk out. (Navigation is victory.)';
  const HIT_LINE = 'R1: HOA Fine hits Miles for 13 (87 left)';
  assert(classifyLeave([LEAVE_LINE, HIT_LINE], 13).partingHit === true, 'selftest: leave-before-hit + damage = parting hit');
  assert(classifyLeave([HIT_LINE, LEAVE_LINE], 9).partingHit === false, 'selftest: hit-before-leave is NOT a parting hit');
  assert(classifyLeave([LEAVE_LINE], 0).partingHit === false, 'selftest: leave with no damage is NOT a parting hit');
  function seed(o) {
    return { seed: o.seed, days: 150, gameDays: 147, endReason: 'horizon', standing: 120, scaleRank: 'village',
      won: false, maxWave: 4, villageLost: false, instrumentErrors: [],
      winPlanStats: { partyTrios: 0, partyQuads: 0, trickHolds: o.trickHolds || 0 },
      v4seeds: [], v4departs: [], dawnbidScores: [], v4encounters: o.encounters || [],
      companionPool: [], deaths: o.deaths || [], daily: [{ day: 1 }, { day: 147 }] };
  }
  function meet(o) {
    return { day: o.day, vid: 'a', mid: o.mid || 'suburb', wave: 4, outcome: o.outcome || 'vFlee',
      rounds: o.rounds == null ? 1 : o.rounds, mDealt: 0, mHpStart: 581, mHpStartRec: 581,
      vTaken: o.vTaken || 0, alliesN: 2, allyVid: null, calledHelp: false,
      origin: o.origin || 'aid', fleeWise: o.fleeWise == null ? true : o.fleeWise,
      fleeLearn: false, trickBefore: o.trickBefore == null ? true : o.trickBefore,
      trickAfter: true, log: o.log || [LEAVE_LINE] };
  }
  // Synthetic ctl leg: 2 aid-known parting hits (13, 17 — one death),
  // 1 aid-known monster-first (9), 1 aid-known clean (0), 1 aid-unknown
  // multi-round fight, 1 tick-known parting hit.
  const ctlSeed = seed({ seed: 104417, trickHolds: 3, encounters: [
    meet({ day: 94, vTaken: 13, log: [LEAVE_LINE, HIT_LINE] }),
    meet({ day: 98, vTaken: 17, outcome: 'vDie', log: [LEAVE_LINE, HIT_LINE] }),
    meet({ day: 95, vTaken: 9, log: [HIT_LINE, LEAVE_LINE] }),
    meet({ day: 96, vTaken: 0 }),
    meet({ day: 90, vTaken: 40, trickBefore: false, fleeWise: false, rounds: 3, log: ['R1: Miles strikes.'] }),
    meet({ day: 97, vTaken: 11, origin: 'world-tick', log: [LEAVE_LINE, HIT_LINE] }),
  ] });
  const ctlS = summarize({ bySeed: { 104417: seedAnalysis(ctlSeed) }, files: ['x'] });
  assert(ctlS.aidKnown.n === 4, 'selftest: aid-known slice n=4 (got ' + ctlS.aidKnown.n + ')');
  assert(ctlS.aidKnown.totalTaken === 39, 'selftest: aid-known total 39 (got ' + ctlS.aidKnown.totalTaken + ')');
  assert(ctlS.aidKnown.partingHits === 2 && ctlS.aidKnown.partingDamage === 30,
    'selftest: aid-known parting 2 / damage 30 (got ' + ctlS.aidKnown.partingHits + ' / ' + ctlS.aidKnown.partingDamage + ')');
  assert(ctlS.aidKnown.monsterFirst === 1 && ctlS.aidKnown.monsterFirstDamage === 9,
    'selftest: aid-known monster-first 1 / damage 9');
  assert(ctlS.aidKnown.deaths === 1 && ctlS.aidKnown.partingDeaths === 1,
    'selftest: aid-known deaths 1, parting deaths 1');
  assert(ctlS.aidKnown.clean === 1, 'selftest: aid-known clean 1');
  assert(ctlS.aidUnknown.n === 1 && ctlS.aidUnknown.totalTaken === 40,
    'selftest: aid-unknown n=1 total 40');
  assert(ctlS.tickKnown.n === 1 && ctlS.tickKnown.partingHits === 1,
    'selftest: tick-known n=1 parting 1');
  assert(ctlS.p2.meetingsAvoided === 4 && ctlS.p2.savedDamage === 39 && ctlS.p2.savedDeaths === 1,
    'selftest: P2 re-score avoids 4, saves 39 damage, 1 death');
  assert(ctlS.trickHolds === 3, 'selftest: trickHolds 3');
  // D1 calibration passes on this ctl; fails (unjudgeable) on an empty ctl.
  const d1 = judgeD1(ctlS, null);
  assert(d1.state === 'pass' && d1.fresh === 2, 'selftest: D1 calibration passes (fresh parting ' + d1.fresh + ')');
  const emptySeed = seed({ seed: 104417, encounters: [meet({ day: 96, vTaken: 0 })] });
  const emptyS = summarize({ bySeed: { 104417: seedAnalysis(emptySeed) }, files: ['x'] });
  assert(judgeD1(emptyS, null).state === 'unjudgeable', 'selftest: D1 is UNJUDGEABLE with 0 control parting hits');
  // D2: mixed synthetic leg — parting share 30/39 = 0.769 < 0.8, arm
  // still has a monster-first hit (9) and 0 parting hits -> 'mix'.
  const armSeed = seed({ seed: 104417, encounters: [
    meet({ day: 94, vTaken: 0 }),
    meet({ day: 95, vTaken: 9, log: [HIT_LINE, LEAVE_LINE] }),
  ] });
  const armS = summarize({ bySeed: { 104417: seedAnalysis(armSeed) }, files: ['x'] });
  const d2 = judgeD2(ctlS, armS);
  assert(d2.state === 'pass' && d2.mechanism === 'mix',
    'selftest: D2 classifies the mixed synthetic leg as mix (mechanism ' + d2.mechanism + ', parting share ' + d2.partingShare + ')');
  // Pure-A synthetic: ctl all parting, arm all clean.
  const ctlPure = seed({ seed: 104417, encounters: [
    meet({ day: 94, vTaken: 13, log: [LEAVE_LINE, HIT_LINE] }),
    meet({ day: 95, vTaken: 25, log: [LEAVE_LINE, HIT_LINE] }),
  ] });
  const armPure = seed({ seed: 104417, encounters: [
    meet({ day: 94, vTaken: 0 }), meet({ day: 95, vTaken: 0 }),
  ] });
  const d2a = judgeD2(
    summarize({ bySeed: { 104417: seedAnalysis(ctlPure) }, files: ['x'] }),
    summarize({ bySeed: { 104417: seedAnalysis(armPure) }, files: ['x'] }));
  assert(d2a.mechanism === 'A', 'selftest: D2 mechanism A on pure parting leg (got ' + d2a.mechanism + ')');
  // Pure-C synthetic: arm still takes leave-first damage.
  const armC = seed({ seed: 104417, encounters: [
    meet({ day: 94, vTaken: 13, log: [LEAVE_LINE, HIT_LINE] }),
  ] });
  const d2c = judgeD2(
    summarize({ bySeed: { 104417: seedAnalysis(ctlPure) }, files: ['x'] }),
    summarize({ bySeed: { 104417: seedAnalysis(armC) }, files: ['x'] }));
  assert(d2c.mechanism === 'C', 'selftest: D2 mechanism C when arm still takes leave-first damage (got ' + d2c.mechanism + ')');
  // Instrument: matched seeds + 0 errors + 0 missingHp = clean.
  assert(judgeInstrument(ctlS, armS).pass === true, 'selftest: instrument clean on matched synthetic legs');
  console.log(fails === 0 ? 'SELFTEST ALL PASS' : fails + ' SELFTEST FAILURES');
  process.exitCode = fails === 0 ? 0 : 1;
}

function main() {
  const ctlDir = process.argv[2];
  const armDir = process.argv[3];
  const archDir = process.argv[4] || null;
  if (!ctlDir || !armDir) { console.error('AIDLEAVE ANALYZE STOP: ctlDir and armDir required.'); process.exit(2); }
  const ctlRaw = loadDir(ctlDir);
  const armRaw = loadDir(armDir);
  const archRaw = archDir ? loadDir(archDir) : null;
  for (const k of Object.keys(ctlRaw.bySeed)) ctlRaw.bySeed[k] = seedAnalysis(ctlRaw.bySeed[k]);
  for (const k of Object.keys(armRaw.bySeed)) armRaw.bySeed[k] = seedAnalysis(armRaw.bySeed[k]);
  if (archRaw) for (const k of Object.keys(archRaw.bySeed)) archRaw.bySeed[k] = seedAnalysis(archRaw.bySeed[k]);
  const ctlS = summarize(ctlRaw);
  const armS = summarize(armRaw);
  const archS = archRaw ? summarize(archRaw) : null;

  const d1 = judgeD1(ctlS, archS);
  const d2 = judgeD2(ctlS, armS);
  const instrument = judgeInstrument(ctlS, armS);
  const instrClean = instrument.pass;
  const verdict = d1.state === 'unjudgeable' ? 'UNJUDGEABLE'
    : d2.state === 'unjudgeable' ? 'UNJUDGEABLE'
    : (d1.pass && d2.pass && instrClean) ? 'DIAG-GO' : 'DIAG-NO-GO';

  const out = {
    arm: 'aidleave-b', run: 'aidleave-b',
    ctlDir: path.basename(ctlDir), armDir: path.basename(armDir),
    archDir: archDir ? path.basename(archDir) : null,
    ctl: ctlS, arm: armS, archived: archS,
    bars: {
      d1Calibration: d1,
      d2Mechanism: d2,
      d3KnownVsUnknown: {
        ctlAidKnownPerMeeting: ctlS.aidKnown.n ? round(ctlS.aidKnown.totalTaken / ctlS.aidKnown.n, 2) : null,
        ctlAidUnknownPerMeeting: ctlS.aidUnknown.n ? round(ctlS.aidUnknown.totalTaken / ctlS.aidUnknown.n, 2) : null,
        armAidKnownPerMeeting: armS.aidKnown.n ? round(armS.aidKnown.totalTaken / armS.aidKnown.n, 2) : null,
        armAidUnknownPerMeeting: armS.aidUnknown.n ? round(armS.aidUnknown.totalTaken / armS.aidUnknown.n, 2) : null,
      },
      d4Probes: {
        p2Ctl: ctlS.p2, p2Arm: armS.p2,
        p3TrickHolds: { ctl: ctlS.trickHolds, arm: armS.trickHolds },
      },
      instrument: { pass: instrClean, ctlErrors: ctlS.instrumentErrors, armErrors: armS.instrumentErrors,
        ctlFiles: ctlS.files, armFiles: armS.files, expectedFiles: instrument.expectedFiles,
        seedsMatch: instrument.seedsMatch, missingHp: { ctl: ctlS.missingHp, arm: armS.missingHp },
        recMismatch: { ctl: ctlS.recMismatch, arm: armS.recMismatch } },
    },
    verdict: verdict,
  };
  const outFile = process.env.AIDLEAVE_ANALYSIS_OUT
    ? path.join(REPO, process.env.AIDLEAVE_ANALYSIS_OUT)
    : path.join(REPO, 'evidence', '2026-11-18', 'aidleave-b-analysis.json');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');

  console.log('=== aidleave-b (ctl -> arm) ===');
  console.log('D1 aid-known Suburb wise leaves: n ' + ctlS.aidKnown.n + ' -> ' + armS.aidKnown.n +
    '  total taken ' + ctlS.aidKnown.totalTaken + ' -> ' + armS.aidKnown.totalTaken +
    '  mean ' + ctlS.aidKnown.meanTaken + ' -> ' + armS.aidKnown.meanTaken +
    '  median ' + ctlS.aidKnown.medianTaken + ' -> ' + armS.aidKnown.medianTaken +
    '  max ' + ctlS.aidKnown.maxTaken + ' -> ' + armS.aidKnown.maxTaken);
  console.log('D1 parting hits: ' + ctlS.aidKnown.partingHits + ' -> ' + armS.aidKnown.partingHits +
    '  parting damage ' + ctlS.aidKnown.partingDamage + ' -> ' + armS.aidKnown.partingDamage +
    '  monster-first ' + ctlS.aidKnown.monsterFirst + ' -> ' + armS.aidKnown.monsterFirst +
    '  monster-first damage ' + ctlS.aidKnown.monsterFirstDamage + ' -> ' + armS.aidKnown.monsterFirstDamage +
    '  clean ' + ctlS.aidKnown.clean + ' -> ' + armS.aidKnown.clean);
  console.log('D1 wise-leave deaths: ' + ctlS.aidKnown.deaths + ' -> ' + armS.aidKnown.deaths +
    '  parting deaths ' + ctlS.aidKnown.partingDeaths + ' -> ' + armS.aidKnown.partingDeaths +
    '  monster-first deaths ' + ctlS.aidKnown.monsterFirstDeaths + ' -> ' + armS.aidKnown.monsterFirstDeaths);
  console.log('D3 aid-unknown (ctl): n ' + ctlS.aidUnknown.n + ' total ' + ctlS.aidUnknown.totalTaken +
    '  per-meeting ' + (ctlS.aidUnknown.n ? round(ctlS.aidUnknown.totalTaken / ctlS.aidUnknown.n, 2) : null) +
    '  | tick-known (ctl): n ' + ctlS.tickKnown.n + ' total ' + ctlS.tickKnown.totalTaken +
    '  parting ' + ctlS.tickKnown.partingHits);
  console.log('D4 P2 re-score (ctl): avoid ' + ctlS.p2.meetingsAvoided + ' meetings, save ' +
    ctlS.p2.savedDamage + ' damage (' + ctlS.p2.savedPartingDamage + ' parting) and ' +
    ctlS.p2.savedDeaths + ' death(s)  | P3 trickHolds ctl/arm: ' + ctlS.trickHolds + '/' + armS.trickHolds);
  if (archS) {
    console.log('ARCHIVED wildavoid ctl: aid-known n ' + archS.aidKnown.n + ' total ' + archS.aidKnown.totalTaken +
      ' parting ' + archS.aidKnown.partingHits + ' deaths ' + archS.aidKnown.deaths);
  }
  console.log('wall ctl: ' + JSON.stringify(ctlS.wall) + ' medianSurvival ' + ctlS.medianSurvival);
  console.log('wall arm: ' + JSON.stringify(armS.wall) + ' medianSurvival ' + armS.medianSurvival);
  console.log('deaths: ' + ctlS.deaths + ' -> ' + armS.deaths + '  exped: ' + ctlS.expedDeaths + ' -> ' + armS.expedDeaths);
  console.log('bars: D1=' + d1.state.toUpperCase() + ' (' + d1.reason + ') D2=' + d2.state.toUpperCase() +
    ' (' + d2.reason + ') instrument=' + (instrClean ? 'CLEAN' : 'DIRTY') +
    ' recMismatch ctl/arm=' + ctlS.recMismatch + '/' + armS.recMismatch);
  console.log('VERDICT: ' + verdict);
  console.log('analysis: ' + path.relative(REPO, outFile));
  if (verdict !== 'DIAG-GO') process.exitCode = 1;
}

if (require.main === module) {
  if (process.argv[2] === '--selftest') selftest();
  else main();
}
module.exports = { seedAnalysis: seedAnalysis, summarize: summarize, judgeD1: judgeD1, judgeD2: judgeD2, judgeInstrument: judgeInstrument, classifyLeave: classifyLeave, sliceMeetings: sliceMeetings };

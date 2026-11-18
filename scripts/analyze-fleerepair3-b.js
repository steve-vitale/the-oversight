// analyze-fleerepair3-b.js — classifier for arm sim-fleerepair3-b
// (BUILD: the Suburb 'leave' trick ends the field fight at once — no
// parting hit after the villager has walked out — env-gated
// FLEEREPAIR3=1.)
// Reads the fleerepair3 driver corpora (ctl = VETREENGAGE=1 +
// PARTYSIZE4=1, arm = ctl + FLEEREPAIR3=1) and judges the frozen
// prereg bars (evidence/2026-11-18/sim-fleerepair3-b-prereg.md):
//   B1 (PRIMARY): parting hits on round-1 wise-leave meetings == 0
//       on the armed leg. A meeting is a parting hit iff mid is
//       'suburb', fleeWise, rounds == 1, the leave line precedes the
//       first monster-hit line in the row log (or no hit line
//       exists), AND vTaken > 0. CALIBRATION (frozen): the control
//       leg must show >= 1 parting hit; if 0, B1 is UNJUDGEABLE.
//   B2 (no-kill-loss): wave-4 kills armed >= control.
//   B3 (GUARDRAIL): expedition deaths armed <= control x 1.10 AND
//       total deaths armed <= control x 1.10.
//   Instrument: all files parse, 0 instrument errors, every FOUGHT
//       encounter row carries mHpStart. No-contact evades (rounds 0,
//       dealt 0) are correctly null and are not counted missing;
//       vKill rows carry no mHpStart and share at 1.0 by definition.
//       File count is corpus-derived (finding #2513): the two legs are
//       matched corpora from one driver run, so the fuller leg sets the
//       expected count and a short leg reads DIRTY — no hard-coded 8.
//       The seed sets must match too, or equal counts would be a false
//       clean. Expected count is reported in the instrument bar.
// Launch join (for fought meetings): a v4encounters row is a
// launched-party meeting iff some launch (v4departs result=launch)
// by the same vid (or with the fighter among its party) has
// target == mid (or target null) and meeting day in
// [launchDay, launchDay+21] (max expedition duration 8+12=20, +1).
// Launches are deduped by (vid, day) across the winPlanDepart +
// brain depart rows; partySize is the max across the group.
// Drift check: when NO leave fires on either leg (fleeWise total 0
// both legs), the lever never fired and the legs must be
// trajectory-identical — any divergence is an instrument/code
// defect to investigate, never a lever effect.
// Usage:
//   node scripts/analyze-fleerepair3-b.js <ctlDir> <armDir>
// Writes evidence/2026-11-18/fleerepair3-b-analysis.json. Exits 0 iff
// the verdict is GO; exits 1 on NO-GO or UNJUDGEABLE (neither is a GO).
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

// FLEEREPAIR3 — parting-hit classifier. A wise leave is narrated by
// the line "reads the sterile streets"; a monster hit is narrated by
// "R1: <attack> hits <name> for N". The leave is FIRST when its line
// precedes the first hit line (the villager won initiative and walked
// out) — or when no hit line exists at all. A parting hit is a
// leave-first wise leave that still took damage: the monster phase
// ran after the exit. A monster-first leave (hit line before the
// leave line) is a legitimate hit and is NOT a parting hit. Exported
// for the proof test.
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

// Dedupe launch rows by (vid, day): the winPlanDepart wrap and the
// brain wrap can both record one launch. partySize is the max across
// the group; companions are the union. WAVE-4+ ONLY: a launch counts
// here iff its plan is wave-4+ by the launchfunnel rule (needWave
// >= 4, or the target is a wave-4 species) — the wraps record every
// win-plan depart, including wave-3 hunts (needWave 3 / null).
const W4_IDS = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'];
function launchesForSeed(j) {
  const groups = {};
  for (const d of (j.v4departs || [])) {
    if (d.result !== 'launch') continue;
    if (!(((d.targetWave | 0) >= 4) || (d.target && W4_IDS.indexOf(d.target) !== -1))) continue;
    const k = d.vid + '|' + d.day;
    if (!groups[k]) groups[k] = { vid: d.vid, day: d.day, sources: [], partySize: 1, party: [], target: d.target || null, targetWave: d.targetWave || null, companion: null, companion2: null, companion3: null };
    const g = groups[k];
    if (g.sources.indexOf(d.source) === -1) g.sources.push(d.source);
    if ((d.partySize | 0) > g.partySize) g.partySize = d.partySize | 0;
    for (const p of (d.party || [])) if (p && g.party.indexOf(p) === -1) g.party.push(p);
    if (d.target && !g.target) g.target = d.target;
    if (d.companion && !g.companion) g.companion = d.companion;
    if (d.companion2 && !g.companion2) g.companion2 = d.companion2;
    if (d.companion3 && !g.companion3) g.companion3 = d.companion3;
  }
  return Object.keys(groups).map(function (k) { return groups[k]; });
}

function seedAnalysis(j) {
  const launches = launchesForSeed(j);
  const sizes = {};
  for (const l of launches) sizes[l.partySize] = (sizes[l.partySize] || 0) + 1;
  const fourthFills = launches.filter(function (l) { return l.partySize >= 4; }).length;
  const trioFills = launches.filter(function (l) { return l.partySize === 3; }).length;
  // companion3 picks at scoring (candidate carried one) and at commit.
  let c3cands = 0, c3commits = 0, c2cands = 0;
  for (const s of (j.dawnbidScores || [])) {
    for (const c of (s.cands || [])) {
      if (c && c.winPlanAction === 'party_launch') {
        if (c.companion2) c2cands++;
        if (c.companion3) c3cands++;
      }
    }
    if (s.commit && s.commit.winPlanAction === 'party_launch' && s.commit.companion3) c3commits++;
  }
  // Fought meetings + the launch join. Damage share needs mHpStart.
  // Instrument bar (revised, addendum): a row counts as missing HP
  // ONLY when it was a real fight (not a no-contact evade, which
  // correctly carries null) and not a kill (share 1.0 by definition).
  // recMismatch is diagnostic only: rows where the driver's post-call
  // recovery (mHpLeft + mDealt) disagrees with CONTACTREC's own
  // recorded spawn HP — a nonzero count is an investigation item,
  // never a silent re-score.
  const encounters = (j.v4encounters || []).slice();
  let missingHp = 0, recMismatch = 0;
  const meetings = [];
  for (const e of encounters) {
    const noContact = e.outcome === 'evade' || e.outcome === 'alreadyDead' ||
      (((e.rounds | 0) === 0) && ((e.mDealt | 0) === 0));
    const isKill = e.outcome === 'vKill';
    if (e.mHpStart == null && !noContact && !isKill) missingHp++;
    if (e.mHpStart != null && e.mHpStartRec != null && e.mHpStart !== e.mHpStartRec) recMismatch++;
    const share = isKill ? 1.0 : ((e.mHpStart != null && e.mHpStart > 0) ? (e.mDealt || 0) / e.mHpStart : null);
    let launched = null;
    for (const l of launches) {
      if (e.day < l.day || e.day > l.day + 21) continue;
      if (l.target && e.mid !== l.target) continue;
      const party = [l.vid].concat(l.party);
      if (e.vid === l.vid || party.indexOf(e.vid) !== -1) { launched = l; break; }
      if (e.allyVid && (e.allyVid === l.vid || party.indexOf(e.allyVid) !== -1)) { launched = l; break; }
    }
    meetings.push({ day: e.day, vid: e.vid, mid: e.mid, wave: e.wave, outcome: e.outcome || null,
      rounds: e.rounds, mDealt: e.mDealt || 0, mHpStart: e.mHpStart != null ? e.mHpStart : null,
      share: share != null ? round(share, 4) : null, alliesN: e.alliesN, allyVid: e.allyVid || null,
      calledHelp: !!e.calledHelp, origin: e.origin || null,
      fleeWise: !!e.fleeWise, fleeLearn: !!e.fleeLearn,
      vTaken: e.vTaken | 0,
      leaveFirst: classifyLeave(e.log, e.vTaken).leaveFirst,
      partingHit: (e.mid === 'suburb' && !!e.fleeWise && (e.rounds | 0) === 1) ? classifyLeave(e.log, e.vTaken).partingHit : false,
      launched: !!launched, launchPartySize: launched ? launched.partySize : null,
      launchDay: launched ? launched.day : null });
  }
  const launchedMeetings = meetings.filter(function (m) { return m.launched; });
  const launchedShares = launchedMeetings.filter(function (m) { return m.share != null; }).map(function (m) { return m.share; });
  const size4Meetings = launchedMeetings.filter(function (m) { return m.launchPartySize >= 4; });
  const size4Shares = size4Meetings.filter(function (m) { return m.share != null; }).map(function (m) { return m.share; });
  // FLEEREPAIR3: the #2500 shape — launched meetings vs a
  // leave-counter species, and the seed/launch funnel feeding them.
  const suburbSeeds = (j.v4seeds || []).filter(function (s) { return s.mid === 'suburb'; }).length;
  const blockedSuburbSeeds = (j.v4seeds || []).filter(function (s) { return s.mid === 'suburb' && s.blocked; }).length;
  const suburbLaunches = launches.filter(function (l) { return l.target === 'suburb'; }).length;
  const suburbLaunchedMeetings = launchedMeetings.filter(function (m) { return m.mid === 'suburb'; });
  const suburbLaunchedRound1Zero = suburbLaunchedMeetings.filter(function (m) { return (m.rounds | 0) === 1 && (m.mDealt | 0) === 0; }).length;
  const suburbLaunchedWiseLeaves = suburbLaunchedMeetings.filter(function (m) { return !!m.fleeWise; }).length;
  const w4kills = meetings.filter(function (m) { return m.wave === 4 && m.outcome === 'vKill'; }).length;
  // FLEEREPAIR3: the parting-hit aggregates — the primary bar.
  const wiseLeaves = meetings.filter(function (m) { return !!m.fleeWise; });
  const leaveFirstMeetings = wiseLeaves.filter(function (m) { return (m.rounds | 0) === 1 && !!m.leaveFirst; });
  const leaveFirstTaken = leaveFirstMeetings.map(function (m) { return m.vTaken | 0; });
  const partingHits = meetings.filter(function (m) { return !!m.partingHit; }).length;
  const wiseLeaveDeaths = wiseLeaves.filter(function (m) { return m.outcome === 'vDie'; }).length;
  // Companion pool distribution (scored dawns).
  const poolDist = { dawns: 0, eligible0: 0, eligible1: 0, eligible2: 0, eligible3plus: 0 };
  for (const row of (j.companionPool || [])) {
    poolDist.dawns++;
    const n = (row.eligible || []).length;
    if (n === 0) poolDist.eligible0++;
    else if (n === 1) poolDist.eligible1++;
    else if (n === 2) poolDist.eligible2++;
    else poolDist.eligible3plus++;
  }
  const deaths = j.deaths || [];
  const expedDeaths = deaths.filter(function (d) { return d.cause === 'expedition'; }).length;
  const starvDeaths = deaths.filter(function (d) { return d.cause === 'starvation'; }).length;
  const stats = j.winPlanStats || {};
  return {
    seed: j.seed, days: j.days, gameDays: j.gameDays, endReason: j.endReason,
    standing: j.standing, scaleRank: j.scaleRank, won: !!j.won, maxWave: j.maxWave,
    villageLost: !!j.villageLost,
    instrumentErrors: (j.instrumentErrors || []).length,
    launches: launches.length, launchedSizes: sizes,
    fourthFills: fourthFills, trioFills: trioFills,
    c2cands: c2cands, c3cands: c3cands, c3commits: c3commits,
    partyTrios: stats.partyTrios || 0, partyQuads: stats.partyQuads || 0,
    encounters: encounters.length, missingHp: missingHp, recMismatch: recMismatch,
    meetings: meetings, launchedMeetings: launchedMeetings.length,
    launchedMeanShare: launchedShares.length ? round(mean(launchedShares), 4) : null,
    launchedSharesN: launchedShares.length,
    size4Meetings: size4Meetings.length,
    size4MeanShare: size4Shares.length ? round(mean(size4Shares), 4) : null,
    size4SharesN: size4Shares.length,
    suburbSeeds: suburbSeeds, blockedSuburbSeeds: blockedSuburbSeeds,
    suburbLaunches: suburbLaunches,
    suburbLaunchedMeetings: suburbLaunchedMeetings.length,
    suburbLaunchedRound1Zero: suburbLaunchedRound1Zero,
    suburbLaunchedWiseLeaves: suburbLaunchedWiseLeaves,
    w4kills: w4kills,
    fleeWiseTotal: wiseLeaves.length,
    leaveFirstMeetings: leaveFirstMeetings.length,
    leaveFirstTaken: leaveFirstTaken,
    leaveFirstMeanTaken: leaveFirstTaken.length ? round(mean(leaveFirstTaken), 2) : null,
    partingHits: partingHits,
    wiseLeaveDeaths: wiseLeaveDeaths,
    poolDist: poolDist,
    deaths: deaths.length, expedDeaths: expedDeaths, starvDeaths: starvDeaths,
  };
}

function summarize(leg) {
  const seeds = Object.keys(leg.bySeed).sort().map(function (k) { return leg.bySeed[k]; });
  const sizes = {};
  let launches = 0, fourth = 0, trios = 0, c2cands = 0, c3cands = 0, c3commits = 0;
  let suburbSeeds = 0, blockedSuburbSeeds = 0, suburbLaunches = 0, suburbLaunchedMeetings = 0, suburbLaunchedRound1Zero = 0, suburbLaunchedWiseLeaves = 0, w4kills = 0;
  let partingHits = 0, leaveFirstMeetings = 0, wiseLeaveDeaths = 0, fleeWiseTotal = 0;
  const allLeaveFirstTaken = [];
  let encounters = 0, missingHp = 0, recMismatch = 0, launchedMeetings = 0, size4Meetings = 0;
  let deaths = 0, exped = 0, starv = 0, errors = 0;
  const poolDist = { dawns: 0, eligible0: 0, eligible1: 0, eligible2: 0, eligible3plus: 0 };
  const allLaunchedShares = [], allSize4Shares = [];
  const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
  for (const s of seeds) {
    launches += s.launches; fourth += s.fourthFills; trios += s.trioFills;
    suburbSeeds += s.suburbSeeds; blockedSuburbSeeds += s.blockedSuburbSeeds; suburbLaunches += s.suburbLaunches;
    suburbLaunchedMeetings += s.suburbLaunchedMeetings; suburbLaunchedRound1Zero += s.suburbLaunchedRound1Zero;
    suburbLaunchedWiseLeaves += s.suburbLaunchedWiseLeaves; w4kills += s.w4kills;
    partingHits += s.partingHits || 0; leaveFirstMeetings += s.leaveFirstMeetings || 0;
    wiseLeaveDeaths += s.wiseLeaveDeaths || 0; fleeWiseTotal += s.fleeWiseTotal || 0;
    for (const t of (s.leaveFirstTaken || [])) allLeaveFirstTaken.push(t);
    c2cands += s.c2cands; c3cands += s.c3cands; c3commits += s.c3commits;
    encounters += s.encounters; missingHp += s.missingHp; recMismatch += s.recMismatch || 0;
    launchedMeetings += s.launchedMeetings; size4Meetings += s.size4Meetings;
    deaths += s.deaths; exped += s.expedDeaths; starv += s.starvDeaths; errors += s.instrumentErrors;
    for (const k of Object.keys(s.launchedSizes)) sizes[k] = (sizes[k] || 0) + s.launchedSizes[k];
    for (const k of Object.keys(poolDist)) poolDist[k] += s.poolDist[k] || 0;
    for (const m of s.meetings) if (m.launched && m.share != null) allLaunchedShares.push(m.share);
    for (const m of s.meetings) if (m.launched && m.launchPartySize >= 4 && m.share != null) allSize4Shares.push(m.share);
  }
  return {
    files: leg.files.length, seeds: seeds.length,
    seedList: seeds.map(function (s) { return s.seed; }),
    launches: launches, launchedSizes: sizes,
    suburbSeeds: suburbSeeds, blockedSuburbSeeds: blockedSuburbSeeds,
    suburbLaunches: suburbLaunches,
    suburbLaunchedMeetings: suburbLaunchedMeetings,
    suburbLaunchedRound1Zero: suburbLaunchedRound1Zero,
    suburbLaunchedWiseLeaves: suburbLaunchedWiseLeaves,
    w4kills: w4kills,
    fleeWiseTotal: fleeWiseTotal,
    leaveFirstMeetings: leaveFirstMeetings,
    leaveFirstMeanTaken: allLeaveFirstTaken.length ? round(mean(allLeaveFirstTaken), 2) : null,
    leaveFirstTakenTotal: allLeaveFirstTaken.reduce(function (t, x) { return t + x; }, 0),
    partingHits: partingHits,
    wiseLeaveDeaths: wiseLeaveDeaths,
    fourthFills: fourth, trioFills: trios,
    c2cands: c2cands, c3cands: c3cands, c3commits: c3commits,
    encounters: encounters, missingHp: missingHp, recMismatch: recMismatch,
    launchedMeetings: launchedMeetings,
    launchedMeanShare: allLaunchedShares.length ? round(mean(allLaunchedShares), 4) : null,
    launchedSharesN: allLaunchedShares.length,
    size4Meetings: size4Meetings,
    size4MeanShare: allSize4Shares.length ? round(mean(allSize4Shares), 4) : null,
    size4SharesN: allSize4Shares.length,
    poolDist: poolDist,
    deaths: deaths, expedDeaths: exped, starvDeaths: starv,
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
    perSeed: seeds,
  };
}

// Trajectory digest for the drift check (armed ≡ control when the
// 4th slot never fills): end-state + death count + daily day list.
function trajDigest(j) {
  return JSON.stringify({
    g: j.gameDays, s: j.standing, w: j.maxWave, r: j.scaleRank,
    de: (j.deaths || []).length,
    d: ((j.daily || []).map(function (x) { return x.day; })),
  });
}

// B1 (PRIMARY): zero parting hits on the armed leg — CALIBRATED.
// The control leg must show >= 1 parting hit; if 0, the phenomenon
// never occurred on this band and B1 is UNJUDGEABLE (not a GO).
// Returns { state: 'pass' | 'fail' | 'unjudgeable', ... }. Exported
// for the proof test.
function judgeB1(armS, ctlS) {
  if ((ctlS.partingHits | 0) === 0) {
    return { state: 'unjudgeable', pass: false, bar: 0, armed: armS.partingHits | 0, control: 0,
      reason: 'calibration: control leg shows 0 parting hits — phenomenon absent on this band' };
  }
  var pass = (armS.partingHits | 0) === 0;
  return { state: pass ? 'pass' : 'fail', pass: pass, bar: 0, armed: armS.partingHits | 0, control: ctlS.partingHits | 0,
    reason: pass ? 'armed leg has 0 parting hits' : 'armed leg still has ' + armS.partingHits + ' parting hit(s)' };
}
function judgeB2(armS, ctlS) {
  return { pass: armS.w4kills >= ctlS.w4kills,
    armed: armS.w4kills, control: ctlS.w4kills };
}

// Instrument (finding #2513): expected file count is derived from the
// corpus itself — the fuller of the two matched legs sets the bar, so
// an 8-seed corpus reads 8, a 16-seed corpus reads 16, and a leg short
// of its partner still reads DIRTY. Seed sets must also match: equal
// counts with different seeds would be a false clean. Exported for
// the proof test.
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

function main() {
  const ctlDir = process.argv[2];
  const armDir = process.argv[3];
  if (!ctlDir || !armDir) { console.error('FLEEREPAIR3 ANALYZE STOP: ctlDir and armDir required.'); process.exit(2); }
  const ctlRaw = loadDir(ctlDir);
  const armRaw = loadDir(armDir);
  const ctl = loadDir(ctlDir);
  const arm = loadDir(armDir);
  for (const k of Object.keys(ctl.bySeed)) ctl.bySeed[k] = seedAnalysis(ctl.bySeed[k]);
  for (const k of Object.keys(arm.bySeed)) arm.bySeed[k] = seedAnalysis(arm.bySeed[k]);
  const ctlS = summarize(ctl);
  const armS = summarize(arm);

  // Drift check: when NO leave fires on either leg (fleeWise total 0
  // both legs), the lever never fired and the legs must be
  // trajectory-identical.
  let driftDivergences = null;
  if ((ctlS.fleeWiseTotal | 0) === 0 && (armS.fleeWiseTotal | 0) === 0) {
    driftDivergences = 0;
    const divSeeds = [];
    for (const k of Object.keys(ctlRaw.bySeed)) {
      const a = ctlRaw.bySeed[k], b = armRaw.bySeed[k];
      if (!b) { driftDivergences++; divSeeds.push(k + ':missing'); continue; }
      if (trajDigest(a) !== trajDigest(b)) { driftDivergences++; divSeeds.push(k); }
    }
    driftDivergences = { count: driftDivergences, seeds: divSeeds };
  }
  // (No rec/D2 leg on this arm: the recorder-off determinism leg is
  // the partysize arm's, not this run's.)

  const b1 = judgeB1(armS, ctlS);
  const b1Pass = b1.pass;
  const b2 = judgeB2(armS, ctlS);
  const b2Pass = b2.pass;
  const b3Pass = armS.expedDeaths <= ctlS.expedDeaths * 1.10 && armS.deaths <= ctlS.deaths * 1.10;
  const instrument = judgeInstrument(ctlS, armS);
  const instrClean = instrument.pass;
  const verdict = b1.state === 'unjudgeable' ? 'UNJUDGEABLE'
    : (b1Pass && b2Pass && b3Pass && instrClean) ? 'GO' : 'NO-GO';

  const out = {
    arm: 'fleerepair3-b', run: 'fleerepair3-b',
    ctlDir: path.basename(ctlDir), armDir: path.basename(armDir), recDir: null,
    ctl: ctlS, arm: armS,
    drift: driftDivergences, d2Divergences: null,
    bars: {
      b1PartingHits: { state: b1.state, pass: b1Pass, armed: armS.partingHits, control: ctlS.partingHits, bar: 0, reason: b1.reason },
      b2Wave4Kills: b2,
      b3Guardrail: { pass: b3Pass, expedDeaths: { ctl: ctlS.expedDeaths, arm: armS.expedDeaths, limit: round(ctlS.expedDeaths * 1.10, 1) },
        deaths: { ctl: ctlS.deaths, arm: armS.deaths, limit: round(ctlS.deaths * 1.10, 1) } },
      instrument: { pass: instrClean, ctlErrors: ctlS.instrumentErrors, armErrors: armS.instrumentErrors,
        ctlFiles: ctlS.files, armFiles: armS.files, expectedFiles: instrument.expectedFiles,
        seedsMatch: instrument.seedsMatch, missingHp: { ctl: ctlS.missingHp, arm: armS.missingHp },
        recMismatch: { ctl: ctlS.recMismatch, arm: armS.recMismatch } },
    },
    verdict: verdict,
  };
  // FLEEREPAIR3_ANALYSIS_OUT (sim-partysize-allycap-b): a path relative
  // to the repo root for the analysis JSON, so a later run never
  // clobbers the frozen fleerepair3-b-analysis.json. Default unchanged.
  const outFile = process.env.FLEEREPAIR3_ANALYSIS_OUT
    ? path.join(REPO, process.env.FLEEREPAIR3_ANALYSIS_OUT)
    : path.join(REPO, 'evidence', '2026-11-18', 'fleerepair3-b-analysis.json');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');

  console.log('=== fleerepair3-b (ctl -> arm) ===');
  console.log('launches: ' + ctlS.launches + ' -> ' + armS.launches +
    '  sizes ctl ' + JSON.stringify(ctlS.launchedSizes) + ' arm ' + JSON.stringify(armS.launchedSizes));
  console.log('suburb seeds: ' + ctlS.suburbSeeds + ' -> ' + armS.suburbSeeds +
    '  blocked: ' + ctlS.blockedSuburbSeeds + ' -> ' + armS.blockedSuburbSeeds +
    '  suburb launches: ' + ctlS.suburbLaunches + ' -> ' + armS.suburbLaunches);
  console.log('launched suburb meetings: ' + ctlS.suburbLaunchedMeetings + ' -> ' + armS.suburbLaunchedMeetings +
    '  round1-zero: ' + ctlS.suburbLaunchedRound1Zero + ' -> ' + armS.suburbLaunchedRound1Zero +
    '  wise leaves: ' + ctlS.suburbLaunchedWiseLeaves + ' -> ' + armS.suburbLaunchedWiseLeaves);
  console.log('PARTING HITS (B1): ' + ctlS.partingHits + ' -> ' + armS.partingHits +
    '  leave-first meetings: ' + ctlS.leaveFirstMeetings + ' -> ' + armS.leaveFirstMeetings +
    '  mean taken on leave-first: ' + ctlS.leaveFirstMeanTaken + ' -> ' + armS.leaveFirstMeanTaken +
    '  wise-leave deaths: ' + ctlS.wiseLeaveDeaths + ' -> ' + armS.wiseLeaveDeaths);
  console.log('wave-4 kills: ' + ctlS.w4kills + ' -> ' + armS.w4kills);
  console.log('c2cands: ' + ctlS.c2cands + ' -> ' + armS.c2cands +
    '  c3cands: ' + ctlS.c3cands + ' -> ' + armS.c3cands + '  c3commits: ' + ctlS.c3commits + ' -> ' + armS.c3commits);
  console.log('pool: ctl ' + JSON.stringify(ctlS.poolDist) + ' arm ' + JSON.stringify(armS.poolDist));
  console.log('launched meetings: ' + ctlS.launchedMeetings + ' -> ' + armS.launchedMeetings +
    '  mean share ctl ' + ctlS.launchedMeanShare + ' (n=' + ctlS.launchedSharesN + ')' +
    '  size4 meetings arm ' + armS.size4Meetings + ' mean share ' + armS.size4MeanShare + ' (n=' + armS.size4SharesN + ')');
  console.log('deaths: ' + ctlS.deaths + ' -> ' + armS.deaths +
    '  exped: ' + ctlS.expedDeaths + ' -> ' + armS.expedDeaths + '  starv: ' + ctlS.starvDeaths + ' -> ' + armS.starvDeaths);
  console.log('wall ctl: ' + JSON.stringify(ctlS.wall) + ' medianSurvival ' + ctlS.medianSurvival);
  console.log('wall arm: ' + JSON.stringify(armS.wall) + ' medianSurvival ' + armS.medianSurvival);
  console.log('drift (no leave either leg => identical): ' + JSON.stringify(driftDivergences));
  console.log('bars: B1=' + b1.state.toUpperCase() + ' (' + b1.reason + ') B2=' + (b2Pass ? 'PASS' : 'FAIL') +
    ' B3=' + (b3Pass ? 'PASS' : 'FAIL') + ' instrument=' + (instrClean ? 'CLEAN' : 'DIRTY') +
    ' recMismatch ctl/arm=' + ctlS.recMismatch + '/' + armS.recMismatch);
  console.log('VERDICT: ' + verdict);
  console.log('analysis: ' + path.relative(REPO, outFile));
  if (verdict !== 'GO') process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { launchesForSeed: launchesForSeed, seedAnalysis: seedAnalysis, summarize: summarize, trajDigest: trajDigest, judgeB1: judgeB1, judgeB2: judgeB2, judgeInstrument: judgeInstrument, classifyLeave: classifyLeave };

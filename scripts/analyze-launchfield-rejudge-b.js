// analyze-launchfield-rejudge-b.js — DIAG analyzer for arm sim-launchfield-rejudge-b
// (finding #2605 follow-up: sim-launchstate-b closed the day-level
// gap but its Leg S ledger left 2 unexplained parts — both seed
// 107305, day 150, part 3 — where a wave-4 field encounter consumed
// the part and the Haven sampler never fired. This arm adds the
// per-part FIELD-ENCOUNTER fallback to Leg S (below) and judges
// completeness over every holder-day AND every holder-day-part on a
// fresh band. It also pins the anchor expectation to the FROZEN BASE
// (the launchstate §6 proof compared the recorded anchor against the
// same run-time merge-base computation that produced it — a
// tautology; see the driver header).)
// Legs, all frozen in evidence/2026-11-22/sim-launchfield-rejudge-b-prereg.md
// (+ AMENDMENT 1, Leg S fallback rules, + the field-encounter
// fallback frozen in this arm's prereg):
//   Leg R (reproduction): the launcheng analyzer (required below, NOT
//   re-implemented) runs Taxonomy A + B' over the EXISTING strikeband4
//   corpora and must reproduce the 10 unknown days exactly.
//   Leg F (fresh band): this analyzer runs Taxonomy A + B' (reused
//   VERBATIM from the launcheng analyzer's code) over the fresh
//   launchfield corpora 107399-107406, then classifies every
//   B'-unknown day from the per-part holder-state rows (Taxonomy H,
//   extended with hs-scholar-idle + the churn-closing fallback).
//   Leg S (per-part scored-ness ledger): for every
//   instance-day in every candidate-not-bid / churned instance, for
//   each day-part 0-3: scored (a dawnbidScores row exists) or whyNot
//   from the tick-entry holder-state row in objTick code order,
//   with the AMENDMENT 1 fallbacks (seed-day / retargeted / dead /
//   plan-deleted) PLUS the field-encounter fallback (a v4encounters
//   row for the vid that day + Haven holder-state rows at other
//   parts of the day, none at this part) before no-rows. Leg P
//   (pool-first-fail) is REMOVED: the pool decomposition is already
//   judged by poolfirstfail-b.
// Instances and buckets come from the frozen classifiers
// (analyze-launchdef-a.js classifySeed, analyze-launchfunnel-a.js
// funnelForSeed); this analyzer ENRICHES them, never re-defines
// them. One deliberate counting change, frozen in the launcheng
// prereg (§7.3 decision, inherited): a launch is any v4departs row
// with result 'launch' whose target's wave in src/data/monsters.json
// is >= 4, regardless of targetWave — the companion plan-copy paths
// copy target but never needWave, so follow-on hunts carry targetWave
// null and the frozen launchesOf excludes them. The strikeband4
// verdict is NOT re-scored here.
// Usage:
//   node scripts/analyze-launchfield-rejudge-b.js <bandDir>
//   node scripts/analyze-launchfield-rejudge-b.js --selftest
// Writes evidence/2026-11-22/launchfield-rejudge-b-analysis.json. Exits 0 iff
// DIAG-GO (frozen bars in the prereg — (a) completeness incl. Leg S,
// (b) Leg R reproduction, (c) instrument); on DIAG-NO-GO it still
// writes the JSON and exits 1. The binding gate over assessed days
// and launch sanity are REPORTED but do not gate the verdict (prereg).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const LFA = require(path.join(REPO, 'scripts', 'analyze-launchfunnel-a.js'));
const LD = require(path.join(REPO, 'scripts', 'analyze-launchdef-a.js'));
const DSR = require(path.join(REPO, 'scripts', 'analyze-dmgshape-rerun-b.js'));
const LA = require(path.join(REPO, 'scripts', 'analyze-launcheng-b.js'));

const BAND_DIR = 'perseed-launchfield-rejudge-b-107399-107406';
const OLD_BAND_DIR = 'perseed-strikeband4-b-106241-106248';
const EXPECTED = {
  arm: 'launchfield-rejudge-b', run: 'launchfield-rejudge-b', mode: 'vre',
  policySha12: '1884c8852d38', anchor12: '1c11dbb149a6',
  flags: { senseexpedFlag: '1', partysize4Flag: '1', vetreengageFlag: '1',
    fleerepair2Flag: '1', fightally2Flag: '1', allyslot3Flag: '1', launchsurviveFlag: '1' },
  allyslot3InSrc: true,
  seeds: [107399, 107400, 107401, 107402, 107403, 107404, 107405, 107406],
};
// The 10 launcheng unknown-no-signal days (frozen target shape,
// prereg §"The question"): [seed, vid, target, day]. Leg R must
// reproduce exactly these 10 from the existing corpora.
const REPRODUCTION = [
  [106241, 'visjoin_91', 'algorithm', 97], [106241, 'visjoin_91', 'algorithm', 103],
  [106243, 'visjoin_116', 'influencer', 122],
  [106246, 'visjoin_125', 'strike', 129], [106246, 'visjoin_125', 'strike', 131],
  [106246, 'visjoin_125', 'strike', 135],
  [106246, 'visjoin_96', 'editor', 146],
  [106247, 'david_kim', 'eulogy', 72],
  [106247, 'fatima_hassan', 'reunion', 98],
  [106247, 'app_mgpspki2526', 'spoiler', 127],
];

let WAVE_BY_ID = {};
try {
  const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
  const list = raw.monsters || raw;
  for (const m of list) WAVE_BY_ID[m.id] = m.wave | 0;
} catch (e) {}

function sleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) {
    const t0 = process.hrtime.bigint();
    while (process.hrtime.bigint() - t0 < BigInt(ms) * 1000000n) {}
  }
}
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 120; i++) {
    try {
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, data);
        const back = fs.readFileSync(filePath, 'utf8');
        if (back.length !== data.length) throw new Error('readback length mismatch');
        return true;
      }
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp, 'utf8');
      if (back.length !== data.length) throw new Error('readback length mismatch');
      fs.renameSync(tmp, filePath);
      return true;
    } catch (e) {
      if (i === 119) return false;
      sleepMs(1000);
    }
  }
  return false;
}
function isUnknown(reason) { return typeof reason === 'string' && reason.indexOf('unknown') === 0; }
function modalOf(tally) {
  let best = null, bestN = -1;
  for (const k of Object.keys(tally)) if (tally[k] > bestN) { best = k; bestN = tally[k]; }
  return best;
}

// ---- Per-dawn scored reason (prereg taxonomy A) ----
// r: a part-0 dawnbidScores row; poolRow: the companionPool row for
// (vid, day) or null. Returns { reason, pool } where pool is the
// first-fail tally for party-no-companion dawns (or null).
function scoredDawnReason(r, poolRow) {
  const cands = r.cands || [];
  const acts = cands.map(function (c) { return c && c.winPlanAction; }).filter(Boolean);
  const stage = r.plan ? r.plan.stage : null;
  if (acts.indexOf('party_launch') !== -1) return { reason: 'bid', pool: null };
  if (acts.indexOf('gear_hold') !== -1) return { reason: 'gear-hold', pool: null };
  if (acts.indexOf('party_wait') !== -1) {
    return { reason: 'party-no-companion',
      pool: poolRow ? { eligible: (poolRow.eligible || []).length,
        counts: poolRow.counts || {}, rankedPick: poolRow.rankedPick || null } : 'unknown-no-pool-row' };
  }
  if (acts.indexOf('veteran_guard') !== -1) return { reason: 'veteran-guard', pool: null };
  if (acts.length === 0) {
    if (!r.plan) return { reason: 'unknown-no-plan', pool: null };
    if (stage === 'gear') {
      const g = r.holderGear || {};
      if (g.armed || g.armored) return { reason: 'gear-geared-silent', pool: null };
      return { reason: 'unknown-gear-ungeared-no-cand', pool: null };
    }
    if (stage === 'hunt' || stage === 'standing' || stage === 'table')
      return { reason: 'hunt-standing-table-no-companion-silent', pool: null };
    if (stage === 'party') return { reason: 'unknown-party-silent', pool: null };
    return { reason: 'unknown-stage:' + String(stage), pool: null };
  }
  return { reason: 'other-action:' + acts.join(','), pool: null };
}

// ---- Zero-row day reason (prereg Taxonomy B', CORRECTION
// 2026-11-21) ----
// day: a day in [seedDay, endDay] with NO score row for
// (vid, target). ctx carries censusByVidDay, memberAwayByVidDay,
// deathDayByVid, haven (as before) PLUS scholarByDay (daily
// scholarId), scoreTargetsByVidDay (vid -> day -> [targets in
// score rows]), encountersByVidDay (vid -> day -> true when the
// holder fought or allied in a v4 encounter). prevPick: the
// representative score row of the most recent assessed day
// before this day, or null. First match wins; the precedence
// order is frozen in the prereg correction.
function zeroRowDayReason(day, inst, ctx, prevPick) {
  const vid = inst.vid;
  const deathDay = ctx.deathDayByVid[vid] != null ? ctx.deathDayByVid[vid] : null;
  if (deathDay != null && day >= deathDay) return 'holder-dead';
  const censusRow = (ctx.censusByVidDay[vid] || {})[day] || null;
  if (censusRow && !censusRow.holderAlive) return 'holder-dead';
  if (ctx.scholarByDay[day] === vid && ctx.scholarByDay[day - 1] === vid) return 'holder-scholar';
  const targets = ((ctx.scoreTargetsByVidDay[vid] || {})[day]) || [];
  if (targets.some(function (t) { return t !== inst.target; })) return 'retarget-boundary';
  if (day === inst.seedDay) return 'seed-day';
  if (censusRow && censusRow.holderExped) return 'holder-on-expedition';
  const memberAway = ctx.memberAwayByVidDay[vid] && ctx.memberAwayByVidDay[vid][day] != null
    ? ctx.memberAwayByVidDay[vid][day] : null;
  if (memberAway === true) return 'holder-away';
  if ((ctx.encountersByVidDay[vid] || {})[day]) return 'field-encounter-day';
  if (!censusRow) return 'plan-not-in-census';
  const haven = ctx.haven;
  if (haven && censusRow.holderNode &&
      (censusRow.holderNode.nx !== haven.nx || censusRow.holderNode.ny !== haven.ny))
    return 'holder-off-haven';
  if (prevPick && prevPick.part === 3 &&
      prevPick.pick && prevPick.pick.corePick === 'VISIT') return 'phase-edge';
  return 'unknown-no-signal';
}

// ---- Day-level classification shared by not-bid and churn ----
// Every day in [seedDay, endDay] gets exactly one reason: assessed
// days (any score row at any part) take Taxonomy A on the part-0
// row if present, else the earliest mid-day row; zero-row days
// take zeroRowDayReason. A party_launch anywhere is a
// contradiction (unknown-midday-bid); a party-no-companion dawn
// with no pool row is unknown-no-pool-row.
function classifyInstanceDays(j, inst, ctx) {
  const vid = inst.vid;
  const finalDay = j.gameDays || j.days || 0;
  const endDay = inst.closeDay != null ? inst.closeDay : finalDay;
  const scoreRows = (j.dawnbidScores || []).filter(function (r) {
    return r.vid === vid && r.plan && r.plan.target === inst.target && r.day >= inst.seedDay &&
      (inst.closeDay == null || r.day <= inst.closeDay);
  }).sort(function (a, b) { return (a.day - b.day) || (a.part - b.part); });
  const rowsByDay = {};
  for (const r of scoreRows) (rowsByDay[r.day] = rowsByDay[r.day] || []).push(r);
  const assessed = [];
  const assessedTally = {};
  const zeroRow = [];
  const zeroRowTally = {};
  let unknown = 0, middayBids = 0, middayRows = 0;
  let prevPick = null;
  for (let d = inst.seedDay; d <= endDay; d++) {
    const rows = rowsByDay[d] || [];
    if (rows.length) {
      for (const r of rows) if (r.part !== 0) middayRows++;
      const rep = rows[0]; // part-0 if present, else the earliest mid-day row
      const poolRow = rep.part === 0 ? ((ctx.poolByVidDay[vid] || {})[d] || null) : null;
      const got = scoredDawnReason(rep, poolRow);
      let reason = got.reason;
      if (rep.part === 0 && got.pool === 'unknown-no-pool-row') reason = 'unknown-no-pool-row';
      // Contradiction check over ALL rows of the day, not just the
      // representative: any party_launch on a not-bid instance.
      let launchRows = 0;
      for (const r of rows) {
        const a = (r.cands || []).map(function (c) { return c && c.winPlanAction; }).filter(Boolean);
        if (a.indexOf('party_launch') !== -1) launchRows++;
      }
      if (launchRows > 0) { reason = 'unknown-midday-bid'; middayBids += launchRows; }
      if (isUnknown(reason)) unknown++;
      assessedTally[reason] = (assessedTally[reason] || 0) + 1;
      assessed.push({ day: d, part: rep.part, reason: reason,
        stage: rep.plan ? rep.plan.stage : null, rows: rows.length,
        holderGear: rep.holderGear || null,
        pool: (reason === 'party-no-companion' && got.pool && got.pool !== 'unknown-no-pool-row') ? got.pool : null });
      prevPick = rep;
    } else {
      const censusRow = (ctx.censusByVidDay[vid] || {})[d] || null;
      const memberAway = ctx.memberAwayByVidDay[vid] && ctx.memberAwayByVidDay[vid][d] != null
        ? ctx.memberAwayByVidDay[vid][d] : null;
      const reason = zeroRowDayReason(d, inst, ctx, prevPick);
      if (isUnknown(reason)) unknown++;
      zeroRowTally[reason] = (zeroRowTally[reason] || 0) + 1;
      zeroRow.push({ day: d, reason: reason,
        census: censusRow ? { stage: censusRow.stage, target: censusRow.target,
          holderAlive: censusRow.holderAlive, holderExped: censusRow.holderExped,
          holderNode: censusRow.holderNode, holderSick: censusRow.holderSick,
          holderHealth: censusRow.holderHealth } : null,
        memberAway: memberAway });
    }
  }
  const dawnDays = assessed.filter(function (a) { return a.part === 0; }).length;
  return { assessed: assessed, assessedTally: assessedTally,
    dawnDays: dawnDays, middayOnlyDays: assessed.length - dawnDays,
    assessedRows: scoreRows.length, middayRows: middayRows, middayBids: middayBids,
    zeroRow: zeroRow, zeroRowTally: zeroRowTally, zeroRowDays: zeroRow.length,
    instanceDays: endDay - inst.seedDay + 1, unknown: unknown };
}

function classifyNotBid(j, inst, ctx) {
  const days = classifyInstanceDays(j, inst, ctx);
  const scored = days.assessed.filter(function (a) { return a.part === 0; });
  const scoredTally = {};
  for (const s of scored) scoredTally[s.reason] = (scoredTally[s.reason] || 0) + 1;
  const modal = days.assessed.length ? modalOf(days.assessedTally) : 'no-dawn-after-seed';
  return { vid: inst.vid, target: inst.target, seedDay: inst.seedDay,
    closeDay: inst.closeDay, closeKind: inst.closeKind,
    scoredDawns: scored.length, scored: scored, scoredTally: scoredTally,
    middayRows: days.middayRows, middayBids: days.middayBids,
    assessedDays: days.assessed.length, dawnDays: days.dawnDays,
    middayOnlyDays: days.middayOnlyDays, assessedRows: days.assessedRows,
    assessed: days.assessed, assessedTally: days.assessedTally,
    zeroRowDays: days.zeroRowDays, zeroRow: days.zeroRow, zeroRowTally: days.zeroRowTally,
    instanceDays: days.instanceDays,
    reason: modal, unknown: days.unknown,
    classifierScoredDawns: inst.scoredDawns,
    scoredDawnsMatch: inst.scoredDawns === scored.length };
}

function classifyChurn(j, inst, ctx) {
  const vid = inst.vid;
  const finalDay = j.gameDays || j.days || 0;
  const endDay = inst.closeDay != null ? inst.closeDay : finalDay;
  let closing = null;
  if (inst.closeKind === 'holder-died') {
    const dr = (j.deaths || []).find(function (d) { return d && d.kind === 'villager' && d.who === vid && (d.day | 0) >= inst.seedDay; });
    closing = dr ? { kind: 'death-row', day: dr.day, cause: dr.cause || null } : { kind: 'death-row-missing', day: null };
  } else if (inst.closeKind === 'retargeted') {
    const rows = (j.v4seeds || []).filter(function (s) {
      return s.vid === vid && (s.wave | 0) >= 4 && s.day > inst.seedDay &&
        s.target !== inst.target && (s.stageAfter === 'gear' || s.stageAfter === 'party');
    }).sort(function (a, b) { return a.day - b.day; });
    if (rows.length) {
      closing = { kind: 'retarget-seed-row', day: rows[0].day,
        mid: rows[0].mid, target: rows[0].target, outcome: rows[0].outcome || null,
        path: rows[0].path || null, stageAfter: rows[0].stageAfter || null };
    } else {
      // H EXTENSION (launchfield prereg): the frozen gear/party
      // stageAfter filter was arbitrary — the seed row itself is
      // the retarget evidence. Fallback (a): any stageAfter.
      const anyRows = (j.v4seeds || []).filter(function (s) {
        return s.vid === vid && (s.wave | 0) >= 3 && s.day > inst.seedDay &&
          s.target !== inst.target;
      }).sort(function (a, b) { return a.day - b.day; });
      if (anyRows.length) {
        closing = { kind: 'retarget-seed-row-any-stage', day: anyRows[0].day,
          mid: anyRows[0].mid, target: anyRows[0].target, outcome: anyRows[0].outcome || null,
          path: anyRows[0].path || null, stageAfter: anyRows[0].stageAfter || null };
      } else {
        // Fallback (b): the plan target changed in the sampled
        // holder-state rows — direct evidence of a retarget.
        const hsRows = (j.holderState || []).filter(function (r) {
          return r && r.vid === vid && r.day > inst.seedDay && r.target && r.target !== inst.target;
        }).sort(function (a, b) { return (a.day - b.day) || (a.part - b.part); });
        closing = hsRows.length ? { kind: 'retarget-observed-holderstate', day: hsRows[0].day,
          part: hsRows[0].part, target: hsRows[0].target }
          : { kind: 'retarget-seed-row-missing', day: null };
      }
    }
  } else if (inst.closeKind === 'plan-deleted') {
    const rows = (j.dawnbidCensus || []).filter(function (c) { return c.vid === vid && c.day >= inst.seedDay; })
      .sort(function (a, b) { return a.day - b.day; });
    closing = rows.length ? { kind: 'last-census-day', day: rows[rows.length - 1].day }
      : { kind: 'no-census-rows', day: null };
  } else {
    closing = { kind: 'unknown-close-kind:' + String(inst.closeKind), day: null };
  }
  // Zero-row days in the window (same Taxonomy B' as not-bid).
  const days = classifyInstanceDays(j, inst, ctx);
  let unknown = days.unknown;
  if (closing.kind && closing.kind.indexOf('unknown') === 0) unknown++;
  if (closing.kind && closing.kind.indexOf('-missing') !== -1) unknown++;
  return { vid: vid, target: inst.target, seedDay: inst.seedDay,
    closeDay: inst.closeDay, closeKind: inst.closeKind, closing: closing,
    scoredDawns: days.dawnDays,
    assessedDays: days.assessed.length, assessed: days.assessed, assessedTally: days.assessedTally,
    zeroRowDays: days.zeroRowDays, zeroRow: days.zeroRow, zeroRowTally: days.zeroRowTally,
    instanceDays: days.instanceDays, unknown: unknown };
}

// ---- Taxonomy H — holder-state classification of B'-unknown days ----
// (prereg, frozen). Applies ONLY to zero-row days B' left
// 'unknown-no-signal'. The H reason is reported BESIDE the B'
// reason, never replacing it: the evidence table carries both
// columns. Reasons 'hs-unexplained' and 'hs-no-rows' stay unknown
// for the completeness bar; every other hs-* reason names a
// mechanism and the day counts as explained. LAUNCHSTATE
// EXTENSION: 'hs-scholar-idle' (scholar at every sampled
// tick-entry part, no score/gate row) is explained; the churn
// closings 'retarget-seed-row-any-stage' and
// 'retarget-observed-holderstate' are explained closings.
// The branch derivation follows objTick's code order from the
// sampled pre-state (tick-entry): scholar -> dead -> engaged ->
// expedition -> away -> off-haven -> refresh-gate -> chore-lived.
// A refresh opportunity is a tick-entry part where the holder
// REACHED the refresh check (not engaged, not away, at Haven, not
// on expedition, not the scholar, alive) with the objective
// done/idle: objRefreshPick runs there unless vbrainShouldRefresh
// refuses (commit from TODAY, no perception flag) — the
// refresh-blocked shape — or the pick is a hard gate (a gate row
// exists that day — the gate-pick shape). The perception flag
// itself is module-internal: a reached refresh with a STALE commit
// and no score/gate row is hs-unexplained, never assumed.
// The skip search spans from the last pick (score or gate row for
// vid+target, day <= D) through D, because a skipped part on an
// EARLIER day is what pushes the chore finish past D.
const WHEN_ORDER = { 'part-start': 0, 'tick-entry': 1, 'tick-exit': 2 };
const HS_SKIP_REASONS = ['hs-engaged-skip', 'hs-away-skip', 'hs-off-haven-skip', 'hs-expedition-skip'];
function buildHsCtx(j) {
  const hsByVidDay = {};
  for (const r of (j.holderState || [])) {
    if (!r || !r.vid || r.day == null) continue;
    if (!hsByVidDay[r.vid]) hsByVidDay[r.vid] = {};
    if (!hsByVidDay[r.vid][r.day]) hsByVidDay[r.vid][r.day] = [];
    hsByVidDay[r.vid][r.day].push(r);
  }
  for (const vid of Object.keys(hsByVidDay)) for (const d of Object.keys(hsByVidDay[vid])) {
    hsByVidDay[vid][d].sort(function (a, b) {
      return (a.part - b.part) || ((WHEN_ORDER[a.when] || 9) - (WHEN_ORDER[b.when] || 9));
    });
  }
  const gateByVidDay = {};
  for (const g of (j.holderGatePicks || [])) {
    if (!g || !g.vid || g.day == null) continue;
    if (!gateByVidDay[g.vid]) gateByVidDay[g.vid] = {};
    if (!gateByVidDay[g.vid][g.day]) gateByVidDay[g.vid][g.day] = [];
    gateByVidDay[g.vid][g.day].push(g);
  }
  // LAUNCHFIELD (sim-launchfield-rejudge-b prereg): v4encounters lookups for
  // the Leg S field-encounter fallback. encountersByVidDay mirrors
  // buildCtx exactly (vid as primary fighter OR ally, same map the
  // day-level field-encounter-day reason uses, so the two levels
  // agree on what counts as an encounter for a vid);
  // encounterRowsByVidDay carries the rows themselves for the
  // ledger trace ({mid, outcome, origin} of the first row).
  const encountersByVidDay = {};
  const encounterRowsByVidDay = {};
  for (const e of (j.v4encounters || [])) {
    if (!e || e.day == null) continue;
    const vids = [e.vid].concat(e.allyVids || [], e.allyVid ? [e.allyVid] : []).filter(Boolean);
    for (const v of vids) {
      if (!encountersByVidDay[v]) encountersByVidDay[v] = {};
      encountersByVidDay[v][e.day | 0] = true;
      if (!encounterRowsByVidDay[v]) encounterRowsByVidDay[v] = {};
      if (!encounterRowsByVidDay[v][e.day | 0]) encounterRowsByVidDay[v][e.day | 0] = [];
      encounterRowsByVidDay[v][e.day | 0].push(e);
    }
  }
  return { hsByVidDay: hsByVidDay, gateByVidDay: gateByVidDay,
    encountersByVidDay: encountersByVidDay,
    encounterRowsByVidDay: encounterRowsByVidDay,
    holderStateRows: (j.holderState || []).length,
    holderGateRows: (j.holderGatePicks || []).length };
}
function lastPickDayBefore(j, vid, target, day) {
  let best = null;
  const consider = function (d) { if (d != null && d <= day && (best == null || d > best)) best = d; };
  for (const r of (j.dawnbidScores || [])) {
    if (r && r.vid === vid && r.plan && r.plan.target === target) consider(r.day);
  }
  for (const g of (j.holderGatePicks || [])) {
    if (g && g.vid === vid && g.target === target) consider(g.day);
  }
  return best;
}
function classifyUnknownDayH(day, inst, j, hsCtx) {
  const vid = inst.vid;
  const allRows = ((hsCtx.hsByVidDay[vid] || {})[day]) || [];
  const dayRows = allRows.filter(function (r) { return r.target === inst.target; });
  const otherTargetRows = allRows.length - dayRows.length;
  const gates = (((hsCtx.gateByVidDay[vid] || {})[day]) || [])
    .filter(function (g) { return g.target === inst.target; });
  if (!dayRows.length && !gates.length)
    return { reason: 'hs-no-rows', trace: { parts: [], otherTargetRows: otherTargetRows } };
  if (gates.length)
    return { reason: 'hs-gate-pick',
      trace: { gates: gates.map(function (g) { return { part: g.part, kind: g.kind, gate: g.gate }; }), parts: [] } };
  // H EXTENSION (launchfield prereg): hs-scholar-idle — isScholar at
  // EVERY sampled tick-entry part of the day (at least one sampled),
  // no part showing otherwise, no score/gate row. objTick skips the
  // scholar at every part (villager-objectives.js:1783), so a
  // scholar-holder can never be scored, whatever the objective says.
  // This closes the B' day-1 gap (holder-scholar needs scholar today
  // AND yesterday) and the poolfirstfail thabo_maseko shape. The
  // objective state is reported in the trace, not a condition.
  const scholarEntries = dayRows.filter(function (r) { return r.when === 'tick-entry'; });
  if (scholarEntries.length &&
      scholarEntries.every(function (r) { return !!r.isScholar; })) {
    return { reason: 'hs-scholar-idle',
      trace: { scholarParts: scholarEntries.length,
        parts: scholarEntries.map(function (r) {
          return { part: r.part,
            obj: r.obj ? { kind: r.obj.kind, state: r.obj.state, partsLeft: r.obj.partsLeft } : null,
            commitDay: (r.commit && r.commit.day != null) ? r.commit.day : null }; }),
        otherTargetRows: otherTargetRows } };
  }
  // Per-part ledger (first tick-entry / first tick-exit per part;
  // objTick runs once per part via npcNodeTravel).
  const parts = [];
  let doneAt = null, readyAt = null, stillLive = true, anyExit = false;
  for (let p = 0; p < 4; p++) {
    const entry = dayRows.filter(function (r) { return r.part === p && r.when === 'tick-entry'; })[0] || null;
    const exit = dayRows.filter(function (r) { return r.part === p && r.when === 'tick-exit'; })[0] || null;
    const reached = !!(entry && !entry.engaged && !entry.away && entry.haven &&
      !entry.onExped && !entry.isScholar && !entry.dead && entry.obj);
    const e = { part: p,
      entryObj: entry && entry.obj ? { kind: entry.obj.kind, state: entry.obj.state, partsLeft: entry.obj.partsLeft } : null,
      exitObj: exit && exit.obj ? { kind: exit.obj.kind, state: exit.obj.state, partsLeft: exit.obj.partsLeft } : null,
      engaged: !!(entry && entry.engaged), away: !!(entry && entry.away),
      offHaven: !!(entry && entry.node && !entry.haven),
      onExped: !!(entry && entry.onExped),
      isScholar: !!(entry && entry.isScholar), dead: !!(entry && entry.dead),
      reachedRefresh: reached,
      commitDay: (entry && entry.commit) ? entry.commit.day : null };
    parts.push(e);
    if (entry && entry.obj && (entry.obj.state === 'done' || entry.obj.kind === 'idle')) {
      if (!doneAt) doneAt = { part: p, reached: reached, commitDay: e.commitDay };
    }
    if (entry && entry.obj && (entry.obj.state === 'ready' || (entry.obj.state === 'out' && entry.haven))) {
      if (!readyAt) readyAt = { part: p, state: entry.obj.state };
    }
    if (exit && exit.obj) {
      anyExit = true;
      const live = exit.obj.state === 'indoor' && exit.obj.partsLeft != null && exit.obj.partsLeft > 0;
      if (!live) stillLive = false;
    } else {
      stillLive = false;
    }
  }
  if (doneAt) stillLive = false;
  const trace = { parts: parts, otherTargetRows: otherTargetRows };
  if (stillLive && anyExit) {
    // The chore never finished this day: find the skip that pushed
    // it past the predicted day (search from the last pick through D).
    const fromDay = lastPickDayBefore(j, vid, inst.target, day);
    const startDay = fromDay != null ? fromDay : inst.seedDay;
    const skipParts = [];
    for (let d = startDay; d <= day; d++) {
      const rows = ((hsCtx.hsByVidDay[vid] || {})[d]) || [];
      for (const r of rows) {
        if (r.when !== 'tick-entry' || r.target !== inst.target) continue;
        if (r.engaged) skipParts.push({ day: d, part: r.part, branch: 'engaged' });
        else if (r.away) skipParts.push({ day: d, part: r.part, branch: 'away' });
        else if (r.node && !r.haven) skipParts.push({ day: d, part: r.part, branch: 'off-haven' });
        else if (r.onExped) skipParts.push({ day: d, part: r.part, branch: 'expedition' });
      }
    }
    trace.skipParts = skipParts;
    trace.skipWindow = [startDay, day];
    if (skipParts.some(function (s) { return s.branch === 'engaged'; })) return { reason: 'hs-engaged-skip', trace: trace };
    if (skipParts.some(function (s) { return s.branch === 'away'; })) return { reason: 'hs-away-skip', trace: trace };
    if (skipParts.some(function (s) { return s.branch === 'off-haven'; })) return { reason: 'hs-off-haven-skip', trace: trace };
    if (skipParts.some(function (s) { return s.branch === 'expedition'; })) return { reason: 'hs-expedition-skip', trace: trace };
    return { reason: 'hs-chore-not-finished-no-skip', trace: trace };
  }
  if (doneAt && doneAt.reached) {
    trace.doneAt = doneAt;
    if (doneAt.commitDay === day) return { reason: 'hs-refresh-blocked', trace: trace };
    return { reason: 'hs-unexplained', trace: trace };
  }
  if (readyAt) { trace.readyAt = readyAt; return { reason: 'hs-departure-pending', trace: trace }; }
  return { reason: 'hs-unexplained', trace: trace };
}
// applyHolderState(j, inst, enriched, hsCtx): Taxonomy H post-pass
// over one enriched instance (classifyNotBid / classifyChurn
// output). For each zero-row day B' left 'unknown-no-signal', runs
// classifyUnknownDayH. Mutates enriched: adds hDays (per day, with
// the B' reason beside the H reason + trace), hTally, hU (B'-unknown
// days), hE (explained), hS (skip-delay explained), and REDUCES
// enriched.unknown by the explained count. The B' reasons in
// zeroRow[] are never rewritten.
function applyHolderState(j, inst, enriched, hsCtx) {
  const hDays = [];
  const hTally = {};
  let hU = 0, hE = 0, hS = 0;
  for (const z of (enriched.zeroRow || [])) {
    if (z.reason !== 'unknown-no-signal') continue;
    hU++;
    const got = classifyUnknownDayH(z.day, inst, j, hsCtx);
    hDays.push({ day: z.day, bReason: 'unknown-no-signal', hReason: got.reason, trace: got.trace });
    hTally[got.reason] = (hTally[got.reason] || 0) + 1;
    if (got.reason === 'hs-unexplained' || got.reason === 'hs-no-rows') continue;
    hE++;
    enriched.unknown--;
    if (HS_SKIP_REASONS.indexOf(got.reason) !== -1) hS++;
  }
  enriched.hDays = hDays; enriched.hTally = hTally;
  enriched.hU = hU; enriched.hE = hE; enriched.hS = hS;
  return enriched;
}

// ---- Leg R (reproduction) ----
// Runs the launcheng analyzer (required above, NOT re-implemented)
// over the EXISTING strikeband4 corpora and checks its unknown days
// against the frozen REPRODUCTION list. Also asserts the old
// corpora carry zero holder-state rows (H is inapplicable there).
function reproduceOldBand() {
  const oldDir = path.join(REPO, 'evidence', '2026-11-20', OLD_BAND_DIR);
  const old = LA.bandOf(oldDir);
  const got = [];
  let holderStateRows = 0;
  const abs = path.isAbsolute(oldDir) ? oldDir : path.join(REPO, oldDir);
  for (const f of fs.readdirSync(abs).filter(function (x) { return x.endsWith('.json'); }).sort()) {
    try {
      const d = JSON.parse(fs.readFileSync(path.join(abs, f), 'utf8'));
      holderStateRows += ((d.holderState || []).length) + ((d.holderGatePicks || []).length);
    } catch (e) {}
  }
  for (const s of old.perSeed) {
    for (const inst of (s.notBid || []).concat(s.churn || [])) {
      for (const z of (inst.zeroRow || [])) {
        if (z.reason === 'unknown-no-signal') got.push([s.seed, inst.vid, inst.target, z.day]);
      }
    }
  }
  const key = function (t) { return t.join('|'); };
  const want = REPRODUCTION.map(key).sort();
  const have = got.map(key).sort();
  const exact = want.length === have.length && want.every(function (w, i) { return w === have[i]; });
  return { dir: OLD_BAND_DIR, files: old.files, unknownDays: got,
    expected: REPRODUCTION, exact: exact,
    holderStateRows: holderStateRows, holderStateRowsOk: holderStateRows === 0,
    bandUnknown: old.unknown };
}

// ---- Launch accounting (prereg §7.3 decision) ----
// A wave-4+ launch is any v4departs row with result 'launch' whose
// target's wave (monsters.json) is >= 4. Counted = the frozen
// launchesOf (targetWave >= 4); uncounted = the rest. Each row gets
// a realness check (same-day startExpedition call for the holder)
// and, for uncounted rows, a copy-link check (the holder rode an
// earlier launch against the same target as a companion/party
// member — the plan-copy path).
function launchAccounting(j) {
  const departs = (j.v4departs || []).slice();
  const starts = j.dawnbidStarts || [];
  const hasStart = function (vid, day) {
    for (let i = 0; i < starts.length; i++) if (starts[i].vid === vid && starts[i].day === day) return true;
    return false;
  };
  const rows = [];
  for (let i = 0; i < departs.length; i++) {
    const d = departs[i];
    if (d.result !== 'launch') continue;
    const w = d.target ? (WAVE_BY_ID[d.target] || 0) : 0;
    if (w < 4) continue;
    const counted = (d.targetWave | 0) >= 4;
    let copyLink = null;
    if (!counted) {
      for (let k = 0; k < i; k++) {
        const e = departs[k];
        if (e.result !== 'launch' || e.target !== d.target) continue;
        if (e.day > d.day) continue;
        const party = (e.party || []).concat([e.companion, e.companion2, e.companion3].filter(Boolean));
        if (party.indexOf(d.vid) !== -1) { copyLink = { day: e.day, holder: e.vid, source: e.source || null }; break; }
        if (e.vid === d.vid) { copyLink = { day: e.day, holder: e.vid, source: e.source || null, self: true }; break; }
      }
    }
    rows.push({ day: d.day, vid: d.vid, target: d.target, targetWave: d.targetWave != null ? d.targetWave : null,
      targetWaveLive: w, counted: counted, source: d.source || null,
      winPlanAction: d.winPlanAction || null, stage: d.stage || null,
      partySize: d.partySize != null ? d.partySize : null,
      party: (d.party || []).slice(),
      startCall: hasStart(d.vid, d.day),
      copyLink: copyLink });
  }
  return rows;
}

// ---- Repeat-target groups: a vid+target launched >= 2x with no
// meeting in the 21-day window after the first launch. Track rows
// (target persistence) are attached for the window.
function repeatTargetGroups(j, launchRows) {
  const groups = {};
  for (const r of launchRows) {
    const k = r.vid + '|' + r.target;
    if (!groups[k]) groups[k] = { vid: r.vid, target: r.target, launches: [] };
    groups[k].launches.push(r);
  }
  const out = [];
  for (const k of Object.keys(groups)) {
    const g = groups[k];
    if (g.launches.length < 2) continue;
    g.launches.sort(function (a, b) { return a.day - b.day; });
    const firstDay = g.launches[0].day;
    const meet = (j.v4encounters || []).filter(function (e) {
      return e.mid === g.target && e.day >= firstDay && e.day <= firstDay + 21 &&
        (e.rounds > 0 || (e.mDealt | 0) > 0);
    });
    const track = (j.v4launchTrack || []).filter(function (t) {
      return t.vid === g.vid && t.target === g.target && t.day >= firstDay && t.day <= firstDay + 21;
    }).map(function (t) {
      return { day: t.day, stage: t.stage, holderNode: t.holderNode,
        holderExped: t.holderExped, lastKnownTile: t.lastKnownTile,
        lastKnownSource: t.lastKnownSource, targetNearDist: t.targetNearDist,
        targetNearCount: t.targetNearCount, targetAliveCount: t.targetAliveCount };
    });
    out.push({ vid: g.vid, target: g.target, launches: g.launches.map(function (r) {
      return { day: r.day, counted: r.counted, partySize: r.partySize }; }),
      meetingsInWindow: meet.length,
      firstFightDay: meet.length ? meet[0].day : null,
      track: track });
  }
  return out;
}

function buildCtx(j) {
  const poolByVidDay = {};
  const memberAwayByVidDay = {};
  let haven = null;
  for (const p of (j.companionPool || [])) {
    if (!poolByVidDay[p.vid]) poolByVidDay[p.vid] = {};
    poolByVidDay[p.vid][p.day] = p;
    if (p.haven && !haven) haven = p.haven;
    for (const m of (p.members || [])) {
      if (!m.id || m.firstFail === 'selfOrScholar') continue;
      if (!memberAwayByVidDay[m.id]) memberAwayByVidDay[m.id] = {};
      if (memberAwayByVidDay[m.id][p.day] == null) memberAwayByVidDay[m.id][p.day] = !!m.away;
    }
  }
  const censusByVidDay = {};
  for (const c of (j.dawnbidCensus || [])) {
    if (!censusByVidDay[c.vid]) censusByVidDay[c.vid] = {};
    censusByVidDay[c.vid][c.day] = c;
  }
  const deathDayByVid = {};
  for (const d of (j.deaths || [])) {
    if (d && d.kind === 'villager' && d.who) {
      if (deathDayByVid[d.who] == null || (d.day | 0) < deathDayByVid[d.who]) deathDayByVid[d.who] = d.day | 0;
    }
  }
  // Day-level lookups for Taxonomy B' (prereg CORRECTION 2026-11-21).
  const scholarByDay = {};
  for (const d of (j.daily || [])) if (d && d.day != null) scholarByDay[d.day | 0] = d.scholarId || null;
  const scoreTargetsByVidDay = {};
  for (const r of (j.dawnbidScores || [])) {
    if (!r || !r.vid || r.day == null || !r.plan || !r.plan.target) continue;
    if (!scoreTargetsByVidDay[r.vid]) scoreTargetsByVidDay[r.vid] = {};
    if (!scoreTargetsByVidDay[r.vid][r.day]) scoreTargetsByVidDay[r.vid][r.day] = [];
    if (scoreTargetsByVidDay[r.vid][r.day].indexOf(r.plan.target) === -1)
      scoreTargetsByVidDay[r.vid][r.day].push(r.plan.target);
  }
  const encountersByVidDay = {};
  for (const e of (j.v4encounters || [])) {
    if (!e || e.day == null) continue;
    const vids = [e.vid].concat(e.allyVids || [], e.allyVid ? [e.allyVid] : []).filter(Boolean);
    for (const v of vids) {
      if (!encountersByVidDay[v]) encountersByVidDay[v] = {};
      encountersByVidDay[v][e.day | 0] = true;
    }
  }
  return { poolByVidDay: poolByVidDay, memberAwayByVidDay: memberAwayByVidDay,
    censusByVidDay: censusByVidDay, deathDayByVid: deathDayByVid, haven: haven,
    scholarByDay: scholarByDay, scoreTargetsByVidDay: scoreTargetsByVidDay,
    encountersByVidDay: encountersByVidDay };
}

function substrateOf(j) {
  const bad = [];
  if (j.arm !== EXPECTED.arm) bad.push('arm:' + j.arm);
  if (j.run !== EXPECTED.run) bad.push('run:' + j.run);
  if (j.mode !== EXPECTED.mode) bad.push('mode:' + j.mode);
  if ((j.policySha || '').slice(0, 12) !== EXPECTED.policySha12) bad.push('policySha:' + (j.policySha || '').slice(0, 12));
  if ((j.anchorCommit || '').slice(0, 12) !== EXPECTED.anchor12) bad.push('anchor:' + (j.anchorCommit || '').slice(0, 12));
  for (const k of Object.keys(EXPECTED.flags)) {
    if (String(j[k]) !== EXPECTED.flags[k]) bad.push(k + ':' + j[k]);
  }
  if (j.allyslot3InSrc !== EXPECTED.allyslot3InSrc) bad.push('allyslot3InSrc:' + j.allyslot3InSrc);
  return bad;
}

// ---- Leg S — per-part scored-ness ledger (sim-launchfield-rejudge-b prereg,
// frozen + AMENDMENT 1). For every instance-day in the window of
// every candidate-not-bid and churned instance, for each day-part
// 0-3: scored = a dawnbidScores row exists for (vid, target) that
// day+part; if not scored, whyNot from the tick-entry holder-state
// row for that part, first match in objTick code order (scholar ->
// dead -> engaged -> expedition -> away -> off-haven -> refresh-gate
// -> chore-lived). A gate-pick row that part explains the skip too
// (the pick bypassed scoring). AMENDMENT 1 fallbacks, before
// no-rows: seed-day (no row that part on the seed day — the plan
// did not exist yet), retargeted (another-target row or seed row
// that day+part), dead (death row on/before the day), plan-deleted
// (no census row that day), field-encounter (a v4encounters row
// for the vid that day + Haven holder-state rows at other parts of
// the day — see perPartWhyNot). no-rows = a genuine coverage gap,
// still UNEXPLAINED. refresh-unexplained = reached refresh with a
// stale commit and no pick (the perception flag is unrecorded) — also
// UNEXPLAINED, never assumed.
const S_UNEXPLAINED = { 'no-rows': true, 'refresh-unexplained': true };
function perPartWhyNot(day, part, inst, j, hsCtx) {
  const vid = inst.vid;
  const scored = (j.dawnbidScores || []).some(function (r) {
    return r && r.vid === vid && r.plan && r.plan.target === inst.target &&
      r.day === day && (r.part | 0) === part;
  });
  if (scored) return { scored: true, whyNot: null };
  const gates = (((hsCtx.gateByVidDay[vid] || {})[day]) || [])
    .filter(function (g) { return g.target === inst.target && (g.part | 0) === part; });
  if (gates.length) return { scored: false, whyNot: 'gate-pick' };
  const rows = ((hsCtx.hsByVidDay[vid] || {})[day]) || [];
  const entry = rows.filter(function (r) {
    return r.target === inst.target && r.part === part && r.when === 'tick-entry';
  })[0] || null;
  if (!entry) {
    // AMENDMENT 1 fallbacks (order frozen): retargeted, dead,
    // seed-day, plan-deleted — then no-rows.
    const otherTarget = rows.some(function (r) {
      return r.part === part && r.target && r.target !== inst.target;
    }) || (j.v4seeds || []).some(function (s) {
      return s && s.vid === vid && s.day === day && s.target && s.target !== inst.target;
    });
    if (otherTarget) return { scored: false, whyNot: 'retargeted' };
    const deathDay = (j.deaths || []).reduce(function (best, d) {
      if (d && d.kind === 'villager' && d.who === vid) {
        const dd = d.day | 0;
        if (best == null || dd < best) return dd;
      }
      return best;
    }, null);
    if (deathDay != null && day >= deathDay) return { scored: false, whyNot: 'dead' };
    if (day === inst.seedDay) return { scored: false, whyNot: 'seed-day' };
    const hasCensus = (j.dawnbidCensus || []).some(function (c) {
      return c && c.vid === vid && c.day === day;
    });
    if (!hasCensus) return { scored: false, whyNot: 'plan-deleted' };
    // LAUNCHFIELD FALLBACK (sim-launchfield-rejudge-b prereg): per-part
    // field-encounter — the day-level taxonomy already has
    // field-encounter-day; per-part, a holder-state row is missing
    // for THIS part but a v4encounters row exists for the vid that
    // day AND holder-state rows at other parts of the day show the
    // holder at Haven (Haven-rows-absent for this part). The
    // encounter rows carry NO part field, so the part is attributed
    // by elimination: vid+day match + Haven presence elsewhere
    // that day. The encountered monster need NOT be the plan
    // target — on 107305 d150 both holders met 'suburb' while
    // holding 'reunion'/'eulogy' plans — any wave-4 field
    // encounter consumes the part. The vid match uses the same
    // encountersByVidDay map as the day level (primary fighter OR
    // ally). If either condition fails, the part stays 'no-rows'
    // (unexplained) — never force-attributed. The first encounter
    // row is attached as `enc` for the ledger trace.
    const encRows = (((hsCtx.encounterRowsByVidDay || {})[vid] || {})[day]) || [];
    const havenElsewhere = rows.some(function (r) { return r.part !== part && r.haven; });
    if (encRows.length && havenElsewhere) {
      const e0 = encRows[0];
      return { scored: false, whyNot: 'field-encounter',
        enc: { mid: e0.mid || null, outcome: e0.outcome || null, origin: e0.origin || null } };
    }
    return { scored: false, whyNot: 'no-rows' };
  }
  if (entry.isScholar) return { scored: false, whyNot: 'scholar' };
  if (entry.dead) return { scored: false, whyNot: 'dead' };
  if (entry.engaged) return { scored: false, whyNot: 'engaged' };
  if (entry.onExped) return { scored: false, whyNot: 'on-expedition' };
  if (entry.away) return { scored: false, whyNot: 'away' };
  if (entry.node && !entry.haven) return { scored: false, whyNot: 'off-haven' };
  if (!entry.node) return { scored: false, whyNot: 'no-rows' };
  if (!entry.obj) return { scored: false, whyNot: 'no-rows' };
  if (entry.obj.state === 'done' || entry.obj.kind === 'idle') {
    if (entry.commit && entry.commit.day === day) return { scored: false, whyNot: 'refresh-blocked' };
    return { scored: false, whyNot: 'refresh-unexplained' };
  }
  if (entry.obj.state === 'ready' || (entry.obj.state === 'out' && entry.haven))
    return { scored: false, whyNot: 'departure-pending' };
  if (entry.obj.state === 'returning') return { scored: false, whyNot: 'returning' };
  if (entry.obj.state === 'indoor') return { scored: false, whyNot: 'chore-live' };
  return { scored: false, whyNot: 'no-rows' };
}
// applyPerPartLedger(j, inst, enriched, hsCtx): Leg S post-pass over
// one enriched instance (classifyNotBid / classifyChurn output).
// Mutates enriched: adds sParts (per day per part, with scored /
// whyNot), sTally, sPartsTotal, sScored, sExplained, sUnexplained,
// sSeedDayParts. The day-level B' + H reasons are never rewritten.
function applyPerPartLedger(j, inst, enriched, hsCtx) {
  const finalDay = j.gameDays || j.days || 0;
  const endDay = inst.closeDay != null ? inst.closeDay : finalDay;
  const sParts = [];
  const sTally = {};
  let sScored = 0, sExplained = 0, sUnexplained = 0, sSeedDayParts = 0;
  for (let d = inst.seedDay; d <= endDay; d++) {
    for (let p = 0; p < 4; p++) {
      const got = perPartWhyNot(d, p, inst, j, hsCtx);
      if (got.whyNot === 'seed-day') sSeedDayParts++;
      sTally[got.scored ? 'scored' : got.whyNot] =
        (sTally[got.scored ? 'scored' : got.whyNot] || 0) + 1;
      if (got.scored) sScored++;
      else if (S_UNEXPLAINED[got.whyNot]) sUnexplained++;
      else sExplained++;
      const sp = { day: d, part: p, scored: got.scored, whyNot: got.whyNot };
      if (got.enc) sp.enc = got.enc;
      sParts.push(sp);
    }
  }
  enriched.sParts = sParts; enriched.sTally = sTally;
  enriched.sPartsTotal = sParts.length; enriched.sScored = sScored;
  enriched.sExplained = sExplained; enriched.sUnexplained = sUnexplained;
  enriched.sSeedDayParts = sSeedDayParts;
  return enriched;
}

function seedOf(j) {
  const ctx = buildCtx(j);
  const hsCtx = buildHsCtx(j);
  const cls = LD.classifySeed(j, { launchDefinition: 'any-commit' });
  const funnel = LFA.funnelForSeed(j);
  const launches = DSR.launchesOf(j);
  const launchRows = launchAccounting(j);
  const notBid = [];
  const churn = [];
  for (const inst of cls.instances) {
    if (inst.bucket === 'candidate-not-bid') notBid.push(applyPerPartLedger(j, inst, applyHolderState(j, inst, classifyNotBid(j, inst, ctx), hsCtx), hsCtx));
    else if (inst.bucket === 'plan-churned-before-dawn') churn.push(applyPerPartLedger(j, inst, applyHolderState(j, inst, classifyChurn(j, inst, ctx), hsCtx), hsCtx));
  }
  // Pool aggregation over scored not-bid dawns only.
  const poolAgg = { dawns: 0, eligDist: { 0: 0, 1: 0, 2: 0, '3+': 0 },
    firstFails: {}, rankedPickNull: 0, holderProfiles: {},
    memberProfiles: {}, memberProfilesByAway: {} };
  for (const inst of notBid) {
    for (const s of inst.scored) {
      if (!s.pool) continue;
      poolAgg.dawns++;
      const n = s.pool.eligible;
      poolAgg.eligDist[n >= 3 ? '3+' : n]++;
      for (const k of Object.keys(s.pool.counts || {})) poolAgg.firstFails[k] = (poolAgg.firstFails[k] || 0) + (s.pool.counts[k] | 0);
      if (!s.pool.rankedPick) poolAgg.rankedPickNull++;
    }
  }
  // Roster profile census over ALL pool dawns (any holder) in this seed.
  for (const p of (j.companionPool || [])) {
    poolAgg.holderProfiles[p.holderProfile || 'null'] = (poolAgg.holderProfiles[p.holderProfile || 'null'] || 0) + 1;
    for (const m of (p.members || [])) {
      if (m.firstFail === 'selfOrScholar') continue;
      poolAgg.memberProfiles[m.profile || 'null'] = (poolAgg.memberProfiles[m.profile || 'null'] || 0) + 1;
      const k = (m.away ? 'away' : 'home') + ':' + (m.profile || 'null');
      poolAgg.memberProfilesByAway[k] = (poolAgg.memberProfilesByAway[k] || 0) + 1;
    }
  }
  const firstFights = [];
  for (const l of launches) {
    const f = DSR.firstFight(j, l);
    if (f) firstFights.push({ launchDay: l.day, launchVid: l.vid, target: l.target, fightDay: f.day, fightVid: f.vid, origin: f.origin || null, outcome: f.outcome || null, mDealt: f.mDealt | 0 });
  }
  const deaths = (j.deaths || []).length;
  const starvation = (j.deaths || []).filter(function (d) { return d.cause === 'starvation'; }).length;
  const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
  return { seed: j.seed, gameDays: j.gameDays || j.days || 0, endReason: j.endReason || null,
    standing: j.standing != null ? j.standing : null, scaleRank: j.scaleRank || null,
    won: !!j.won, maxWave: j.maxWave || 1,
    substrateBad: substrateOf(j),
    instrumentErrors: (j.instrumentErrors || []).length,
    funnel: funnel.byFunnel, funnelSub: funnel.byFunnelSub,
    instancesOpened: cls.instancesOpened,
    byBucket: cls.byBucket, bySub: cls.bySub,
    notBid: notBid, churn: churn,
    holderStateRows: hsCtx.holderStateRows, holderGateRows: hsCtx.holderGateRows,
    poolAgg: poolAgg,
    countedLaunches: launches.length,
    launchRows: launchRows,
    firstFights: firstFights,
    repeatTarget: repeatTargetGroups(j, launchRows),
    deaths: deaths, starvation: starvation,
    nationalStanding: (j.standing || 0) >= 200,
    nationalRank: (RANK_ORDER[j.scaleRank] || 0) >= 2,
    standing199: j.standing === 199 };
}

function bandOf(dir) {
  const abs = path.isAbsolute(dir) ? dir : path.join(REPO, dir);
  const files = fs.existsSync(abs) ? fs.readdirSync(abs).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const perSeed = [];
  let errors = 0, filesRead = 0;
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(abs, f), 'utf8')); } catch (e) { continue; }
    filesRead++;
    errors += ((d.instrumentErrors || []).length);
    perSeed.push(seedOf(d));
  }
  const sum = function (fn) { return perSeed.reduce(function (t, s) { return t + fn(s); }, 0); };
  const tally = function (fn) {
    const out = {};
    for (const s of perSeed) for (const k of Object.keys(fn(s) || {})) out[k] = (out[k] || 0) + (fn(s)[k] | 0);
    return out;
  };
  const scoredReasons = {};
  const assessedDayReasons = {};
  const zeroRowReasons = {};
  const churnZeroRowReasons = {};
  let unknown = 0, scoredDawns = 0, assessedDays = 0, dawnDays = 0,
    middayOnlyDays = 0, zeroRowDays = 0, unknownZeroRowDays = 0,
    assessedRows = 0, middayRows = 0, instanceDays = 0, scoredMismatch = 0;
  for (const s of perSeed) {
    for (const inst of s.notBid) {
      scoredDawns += inst.scoredDawns;
      assessedDays += inst.assessedDays;
      dawnDays += inst.dawnDays;
      middayOnlyDays += inst.middayOnlyDays;
      zeroRowDays += inst.zeroRowDays;
      assessedRows += inst.assessedRows;
      middayRows += inst.middayRows;
      instanceDays += inst.instanceDays;
      unknown += inst.unknown;
      unknownZeroRowDays += (inst.zeroRowTally['unknown-no-signal'] || 0);
      if (!inst.scoredDawnsMatch) scoredMismatch++;
      for (const k of Object.keys(inst.scoredTally)) scoredReasons[k] = (scoredReasons[k] || 0) + inst.scoredTally[k];
      for (const k of Object.keys(inst.assessedTally)) assessedDayReasons[k] = (assessedDayReasons[k] || 0) + inst.assessedTally[k];
      for (const k of Object.keys(inst.zeroRowTally)) zeroRowReasons[k] = (zeroRowReasons[k] || 0) + inst.zeroRowTally[k];
    }
    for (const inst of s.churn) {
      // Churn zero-row days count toward band unknown (bar 1 covers
      // churn) but NOT toward the not-bid frozen day totals.
      unknown += inst.unknown;
      for (const k of Object.keys(inst.zeroRowTally)) churnZeroRowReasons[k] = (churnZeroRowReasons[k] || 0) + inst.zeroRowTally[k];
    }
  }
  // Taxonomy H aggregation (prereg, frozen): U = B'-unknown days,
  // E = explained by H, S = explained by a skipped-part class.
  // `unknown` above is already POST-H (seedOf reduces inst.unknown
  // by the explained count); `unknownZeroRowDays` stays PRE-H (the
  // B' count) so U is visible beside it.
  const hTally = {};
  const hDays = [];
  let hU = 0, hE = 0, hS = 0;
  for (const s of perSeed) {
    for (const inst of s.notBid.concat(s.churn)) {
      hU += (inst.hU || 0); hE += (inst.hE || 0); hS += (inst.hS || 0);
      for (const k of Object.keys(inst.hTally || {})) hTally[k] = (hTally[k] || 0) + (inst.hTally[k] | 0);
      for (const hd of (inst.hDays || [])) hDays.push({ seed: s.seed, vid: inst.vid, target: inst.target,
        day: hd.day, bReason: hd.bReason, hReason: hd.hReason, trace: hd.trace });
    }
  }
  // Mechanism check (prereg, frozen): CONFIRMED iff S >= 1;
  // DENIED iff U >= 1 and S = 0; UNTESTED iff U = 0.
  const mechanism = hU === 0 ? 'UNTESTED' : (hS >= 1 ? 'CONFIRMED' : 'DENIED');
  const churnCloseKinds = {};
  for (const s of perSeed) for (const inst of s.churn) churnCloseKinds[inst.closeKind] = (churnCloseKinds[inst.closeKind] || 0) + 1;
  const poolFirstFails = {};
  const poolEligDist = { 0: 0, 1: 0, 2: 0, '3+': 0 };
  const memberProfiles = {};
  const memberProfilesByAway = {};
  const holderProfiles = {};
  for (const s of perSeed) {
    for (const k of Object.keys(s.poolAgg.firstFails || {})) poolFirstFails[k] = (poolFirstFails[k] || 0) + (s.poolAgg.firstFails[k] | 0);
    for (const k of Object.keys(s.poolAgg.eligDist || {})) poolEligDist[k] = (poolEligDist[k] || 0) + (s.poolAgg.eligDist[k] | 0);
    for (const k of Object.keys(s.poolAgg.memberProfiles || {})) memberProfiles[k] = (memberProfiles[k] || 0) + (s.poolAgg.memberProfiles[k] | 0);
    for (const k of Object.keys(s.poolAgg.memberProfilesByAway || {})) memberProfilesByAway[k] = (memberProfilesByAway[k] || 0) + (s.poolAgg.memberProfilesByAway[k] | 0);
    for (const k of Object.keys(s.poolAgg.holderProfiles || {})) holderProfiles[k] = (holderProfiles[k] || 0) + (s.poolAgg.holderProfiles[k] | 0);
  }
  const launchRows = [];
  for (const s of perSeed) for (const r of s.launchRows) launchRows.push(Object.assign({ seed: s.seed }, r));
  // Leg S band aggregation (prereg, frozen): over ALL instance-day-parts.
  const sWhyNot = {};
  const sDays = [];
  let sPartsTotal = 0, sScored = 0, sExplained = 0, sUnexplained = 0, sSeedDayParts = 0;
  for (const s of perSeed) {
    for (const inst of s.notBid.concat(s.churn)) {
      sPartsTotal += (inst.sPartsTotal || 0); sScored += (inst.sScored || 0);
      sExplained += (inst.sExplained || 0); sUnexplained += (inst.sUnexplained || 0);
      sSeedDayParts += (inst.sSeedDayParts || 0);
      for (const k of Object.keys(inst.sTally || {})) sWhyNot[k] = (sWhyNot[k] || 0) + (inst.sTally[k] | 0);
      for (const sp of (inst.sParts || [])) {
        if (!sp.scored && S_UNEXPLAINED[sp.whyNot]) sDays.push({ seed: s.seed, vid: inst.vid, target: inst.target, day: sp.day, part: sp.part, whyNot: sp.whyNot });
      }
    }
  }
  const uncounted = launchRows.filter(function (r) { return !r.counted; });
  const noStartCall = launchRows.filter(function (r) { return !r.startCall; });
  const noCopyLink = uncounted.filter(function (r) { return !r.copyLink; });
  const days = perSeed.map(function (s) { return s.gameDays; }).sort(function (a, b) { return a - b; });
  const medianDays = days.length ? (days.length % 2 ? days[(days.length - 1) / 2] : (days[days.length / 2 - 1] + days[days.length / 2]) / 2) : null;
  const wall = {
    wins: sum(function (s) { return s.won ? 1 : 0; }),
    nationalRank: sum(function (s) { return s.nationalRank ? 1 : 0; }),
    nationalStanding: sum(function (s) { return s.nationalStanding ? 1 : 0; }),
    table: 0, wave4: sum(function (s) { return s.maxWave >= 4 ? 1 : 0; }),
    wave5: sum(function (s) { return s.maxWave >= 5 ? 1 : 0; }),
    medianDays: medianDays,
    survived: sum(function (s) { return s.gameDays >= 150 ? 1 : 0; }),
    deaths: sum(function (s) { return s.deaths; }),
    starvation: sum(function (s) { return s.starvation; }),
    standing199: sum(function (s) { return s.standing199 ? 1 : 0; }),
  };
  return { dir: path.basename(abs), files: filesRead, seeds: perSeed.map(function (s) { return s.seed; }).sort(function (a, b) { return a - b; }),
    errors: errors,
    substrateBadFiles: perSeed.filter(function (s) { return (s.substrateBad || []).length; }).map(function (s) { return { seed: s.seed, bad: s.substrateBad }; }),
    instancesOpened: sum(function (s) { return s.instancesOpened; }),
    byBucket: tally(function (s) { return s.byBucket; }),
    byFunnel: tally(function (s) { return s.funnel; }),
    notBidInstances: sum(function (s) { return s.notBid.length; }),
    churnInstances: sum(function (s) { return s.churn.length; }),
    churnCloseKinds: churnCloseKinds,
    scoredNotBidDawns: scoredDawns, assessedNotBidDays: assessedDays,
    dawnDays: dawnDays, middayOnlyDays: middayOnlyDays,
    assessedRows: assessedRows, middayRows: middayRows,
    zeroRowNotBidDays: zeroRowDays, unknownZeroRowDays: unknownZeroRowDays,
    instanceDays: instanceDays,
    scoredReasons: scoredReasons, assessedDayReasons: assessedDayReasons,
    zeroRowReasons: zeroRowReasons, churnZeroRowReasons: churnZeroRowReasons,
    scoredDawnsMismatch: scoredMismatch,
    unknown: unknown,
    hU: hU, hE: hE, hS: hS, hTally: hTally, hDays: hDays, mechanism: mechanism,
    holderStateRows: sum(function (s) { return s.holderStateRows || 0; }),
    holderGateRows: sum(function (s) { return s.holderGateRows || 0; }),
    poolEligDist: poolEligDist, poolFirstFails: poolFirstFails,
    memberProfiles: memberProfiles, memberProfilesByAway: memberProfilesByAway,
    holderProfiles: holderProfiles,
    sPartsTotal: sPartsTotal, sScored: sScored, sExplained: sExplained,
    sUnexplained: sUnexplained, sSeedDayParts: sSeedDayParts, sWhyNot: sWhyNot,
    sUnexplainedParts: sDays,
    countedLaunches: sum(function (s) { return s.countedLaunches; }),
    launchRows: launchRows,
    wave4TargetLaunches: launchRows.length,
    uncountedLaunches: uncounted.length,
    launchNoStartCall: noStartCall.length,
    uncountedNoCopyLink: noCopyLink.length,
    firstFights: sum(function (s) { return s.firstFights.length; }),
    repeatTargetGroups: perSeed.reduce(function (t, s) { return t.concat(s.repeatTarget.map(function (g) { return Object.assign({ seed: s.seed }, g); })); }, []),
    wall: wall,
    perSeed: perSeed };
}

function judge(band, repro) {
  // Binding gate over ASSESSED DAYS (dawn + midday, launcheng
  // prereg CORRECTION 2026-11-21): the modal day-level reason must
  // hold a plurality of the assessed not-bid days.
  const dayReasons = band.assessedDayReasons || {};
  const bindingEntry = Object.keys(dayReasons).sort(function (a, b) { return (dayReasons[b] || 0) - (dayReasons[a] || 0); })[0] || null;
  const bindingCount = bindingEntry != null ? (dayReasons[bindingEntry] || 0) : 0;
  const bindingNamed = !!bindingEntry && bindingCount > 0 &&
    band.assessedNotBidDays > 0 && bindingCount * 2 > band.assessedNotBidDays;
  // Launch sanity (holderstate bar 5 shape): the report is complete —
  // every wave-4-target launch carries its realness check and, for
  // uncounted rows, its copy-link verdict. No frozen totals are
  // asserted for this fresh band; nonzero noStartCall / noCopyLink
  // counts are reported as findings, not bars.
  const launchSane = (band.launchRows || []).every(function (r) {
    return typeof r.startCall === 'boolean' && (r.counted || r.copyLink !== undefined);
  });
  // LEGACY bars (holderstate shape) — REPORTED, never gating, per
  // the launchfield prereg: this arm judges the RECORDER's
  // completeness, not a re-judgment of the pool or the gate.
  const legacyBars = {
    completeness: { pass: band.unknown === 0,
      unknown: band.unknown, scoredMismatch: band.scoredDawnsMismatch,
      hU: band.hU, hE: band.hE, hS: band.hS, hTally: band.hTally,
      mechanism: band.mechanism },
    reproduction: { pass: !!(repro && repro.exact && repro.holderStateRowsOk),
      exact: repro ? repro.exact : null,
      holderStateRows: repro ? repro.holderStateRows : null,
      holderStateRowsOk: repro ? repro.holderStateRowsOk : null,
      gotDays: repro ? repro.unknownDays.length : null,
      wantDays: REPRODUCTION.length },
    bindingGate: { pass: bindingNamed, gate: bindingEntry, count: bindingCount,
      assessedDays: band.assessedNotBidDays },
    launchSanity: { pass: launchSane,
      noStartCall: band.launchNoStartCall, noCopyLink: band.uncountedNoCopyLink,
      wave4TargetLaunches: band.wave4TargetLaunches, uncounted: band.uncountedLaunches },
    instrument: { pass: band.files === 8 && band.errors === 0 &&
        band.substrateBadFiles.length === 0,
      files: band.files, errors: band.errors,
      substrateBadFiles: band.substrateBadFiles.length,
      holderStateRows: band.holderStateRows, holderGateRows: band.holderGateRows,
      got: { instances: band.instancesOpened, candidateNotBid: band.notBidInstances,
        churned: band.churnInstances, wave4TargetLaunches: band.wave4TargetLaunches,
        uncountedLaunches: band.uncountedLaunches, scoredNotBidDawns: band.scoredNotBidDawns,
        instanceDays: band.instanceDays, assessedDays: band.assessedNotBidDays,
        dawnDays: band.dawnDays, middayOnlyDays: band.middayOnlyDays,
        assessedRows: band.assessedRows, middayRows: band.middayRows,
        zeroRowDays: band.zeroRowNotBidDays, unknownZeroRowDays: band.unknownZeroRowDays } },
  };
  // FROZEN DIAG BARS (launchfield prereg) — these gate: (a)
  // completeness (0 unknown days + 0 unexplained parts), (b) Leg R
  // reproduction, (c) instrument validity.
  const bars = {
    completeness: { pass: band.unknown === 0 && (band.sUnexplained || 0) === 0,
      unknown: band.unknown, scoredMismatch: band.scoredDawnsMismatch,
      hU: band.hU, hE: band.hE, hS: band.hS, hTally: band.hTally,
      mechanism: band.mechanism,
      sParts: band.sPartsTotal || 0, sScored: band.sScored || 0,
      sExplained: band.sExplained || 0, sUnexplained: band.sUnexplained || 0,
      sWhyNot: band.sWhyNot || {}, sSeedDayParts: band.sSeedDayParts || 0 },
    reproduction: { pass: !!(repro && repro.exact && repro.holderStateRowsOk),
      exact: repro ? repro.exact : null,
      holderStateRows: repro ? repro.holderStateRows : null,
      holderStateRowsOk: repro ? repro.holderStateRowsOk : null,
      gotDays: repro ? repro.unknownDays.length : null,
      wantDays: REPRODUCTION.length },
    instrument: { pass: band.files === 8 && band.errors === 0 &&
        band.substrateBadFiles.length === 0,
      files: band.files, errors: band.errors,
      substrateBadFiles: band.substrateBadFiles.length,
      holderStateRows: band.holderStateRows, holderGateRows: band.holderGateRows },
  };
  const go = bars.completeness.pass && bars.reproduction.pass && bars.instrument.pass;
  return { go: go, bars: bars, legacyBars: legacyBars, verdict: go ? 'DIAG-GO' : 'DIAG-NO-GO' };
}

function main() {
  const dir = process.argv[2] || path.join(REPO, 'evidence', '2026-11-22', BAND_DIR);
  const band = bandOf(dir);
  const repro = reproduceOldBand();
  const j = judge(band, repro);
  const out = { arm: 'launchfield-rejudge-b', run: 'launchfield-rejudge-b', band: band,
    repro: repro, bars: j.bars, legacyBars: j.legacyBars, verdict: j.verdict };
  const outFile = path.join(REPO, 'evidence', '2026-11-22', process.env.ANALYSIS_OUT || 'launchfield-rejudge-b-analysis.json');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  const wrote = writeRobust(outFile, JSON.stringify(out, null, 2) + '\n');
  console.log('band ' + band.dir + ' files=' + band.files + ' errors=' + band.errors +
    ' instances=' + band.instancesOpened + ' notBid=' + band.notBidInstances +
    ' churn=' + band.churnInstances + ' unknown=' + band.unknown +
    ' (B-unknown=' + band.unknownZeroRowDays + ' H-explained=' + band.hE + ' H-skip=' + band.hS + ')');
  console.log('instanceDays=' + band.instanceDays + ' assessedDays=' + band.assessedNotBidDays +
    ' (dawn=' + band.dawnDays + ' middayOnly=' + band.middayOnlyDays + ')' +
    ' assessedRows=' + band.assessedRows + ' zeroRowDays=' + band.zeroRowNotBidDays +
    ' unknownZeroRow=' + band.unknownZeroRowDays);
  console.log('assessedDayReasons=' + JSON.stringify(band.assessedDayReasons));
  console.log('zeroRowReasons=' + JSON.stringify(band.zeroRowReasons) +
    ' churnZeroRowReasons=' + JSON.stringify(band.churnZeroRowReasons));
  console.log('hTally=' + JSON.stringify(band.hTally) + ' mechanism=' + band.mechanism);
  console.log('holderStateRows=' + band.holderStateRows + ' holderGateRows=' + band.holderGateRows);
  console.log('repro: exact=' + repro.exact + ' gotDays=' + repro.unknownDays.length +
    ' wantDays=' + REPRODUCTION.length + ' holderStateRows=' + repro.holderStateRows);
  console.log('poolEligDist=' + JSON.stringify(band.poolEligDist) + ' poolFirstFails=' + JSON.stringify(band.poolFirstFails));
  console.log('legS parts=' + band.sPartsTotal + ' scored=' + band.sScored + ' explained=' + band.sExplained +
    ' unexplained=' + band.sUnexplained + ' seedDayParts=' + band.sSeedDayParts);
  console.log('legS whyNot=' + JSON.stringify(band.sWhyNot));
  console.log('launches counted=' + band.countedLaunches + ' wave4target=' + band.wave4TargetLaunches +
    ' uncounted=' + band.uncountedLaunches + ' noStartCall=' + band.launchNoStartCall +
    ' noCopyLink=' + band.uncountedNoCopyLink + ' firstFights=' + band.firstFights);
  console.log('wall=' + JSON.stringify(band.wall));
  console.log('bars: completeness=' + (j.bars.completeness.pass ? 'PASS' : 'FAIL') +
    ' reproduction=' + (j.bars.reproduction.pass ? 'PASS' : 'FAIL') +
    ' instrument=' + (j.bars.instrument.pass ? 'PASS' : 'FAIL'));
  console.log('legacy (reported, not gating): completeness=' + (j.legacyBars.completeness.pass ? 'PASS' : 'FAIL') +
    ' reproduction=' + (j.legacyBars.reproduction.pass ? 'PASS' : 'FAIL') +
    ' bindingGate=' + (j.legacyBars.bindingGate.pass ? 'PASS (' + j.legacyBars.bindingGate.gate + ' ' + j.legacyBars.bindingGate.count + ')' : 'FAIL') +
    ' launchSanity=' + (j.legacyBars.launchSanity.pass ? 'PASS' : 'FAIL') +
    ' instrument=' + (j.legacyBars.instrument.pass ? 'PASS' : 'FAIL'));
  console.log('VERDICT: ' + j.verdict + ' mechanism: ' + band.mechanism);
  console.log('analysis: ' + path.relative(REPO, outFile) + (wrote ? '' : ' (WRITE FAILED — flap)'));
  if (!j.go) process.exitCode = 1;
}

function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) { passed++; console.log('PASS ' + name); }
    else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
  }
  // §A SCORED-DAWN REASONS (synthetic rows).
  function mkScore(day, part, acts, stage, gear) {
    return { day: day, part: part, vid: 'h1',
      cands: acts.map(function (a) { return { kind: 'EXPEDITION', w: 5, winPlanAction: a }; }),
      plan: { stage: stage, target: 'algorithm', needWave: 4, party: [] },
      holderGear: gear || { armed: true, armored: true },
      commit: { kind: 'EXPEDITION', winPlanAction: acts[0] || null } };
  }
  const pool0 = { eligible: [], counts: { notRanger: 5, away: 2, selfOrScholar: 2 }, rankedPick: null };
  let r = scoredDawnReason(mkScore(10, 0, ['party_launch'], 'party'), pool0);
  check('§A party_launch is a bid', r.reason === 'bid', r);
  r = scoredDawnReason(mkScore(10, 0, ['party_wait'], 'party'), pool0);
  check('§A party_wait is party-no-companion with pool attached',
    r.reason === 'party-no-companion' && r.pool && r.pool.eligible === 0 && r.pool.counts.notRanger === 5, r);
  r = scoredDawnReason(mkScore(10, 0, ['gear_hold'], 'gear', { armed: false, armored: false }));
  check('§A gear_hold is gear-hold', r.reason === 'gear-hold', r);
  r = scoredDawnReason(mkScore(10, 0, ['veteran_guard'], 'table'), pool0);
  check('§A veteran_guard is veteran-guard', r.reason === 'veteran-guard', r);
  r = scoredDawnReason(mkScore(10, 0, [], 'gear', { armed: true, armored: false }));
  check('§A gear stage + armed + no cand is gear-geared-silent', r.reason === 'gear-geared-silent', r);
  r = scoredDawnReason(mkScore(10, 0, [], 'hunt'), pool0);
  check('§A hunt stage + no cand is hunt-standing-table-no-companion-silent',
    r.reason === 'hunt-standing-table-no-companion-silent', r);
  r = scoredDawnReason(mkScore(10, 0, [], 'standing'), pool0);
  check('§A standing stage + no cand is the same silent reason',
    r.reason === 'hunt-standing-table-no-companion-silent', r);
  r = scoredDawnReason(mkScore(10, 0, [], 'party'), pool0);
  check('§A party stage + no cand is unknown-party-silent (winPlanCands always emits here)',
    r.reason === 'unknown-party-silent', r);
  r = scoredDawnReason(mkScore(10, 0, [], 'bogus'), pool0);
  check('§A unknown stage is unknown-stage', r.reason === 'unknown-stage:bogus', r);
  const noPlan = mkScore(10, 0, [], 'party'); delete noPlan.plan;
  r = scoredDawnReason(noPlan, pool0);
  check('§A missing plan is unknown-no-plan', r.reason === 'unknown-no-plan', r);
  // §B ZERO-ROW DAY REASONS (Taxonomy B', prereg CORRECTION
  // 2026-11-21). ctx shape is the buildCtx output; prevPick is the
  // representative score row of the previous assessed day (or null).
  const haven = { nx: 4, ny: 4 };
  function mkCtx(over) {
    const base = { censusByVidDay: { h1: {} }, memberAwayByVidDay: {},
      deathDayByVid: {}, haven: haven, scholarByDay: {},
      scoreTargetsByVidDay: {}, encountersByVidDay: {} };
    return Object.assign(base, over || {});
  }
  const instB = { vid: 'h1', target: 'algorithm', seedDay: 10, closeDay: 12 };
  function censusAt(node, exped, alive) {
    return { holderAlive: alive !== false, holderExped: !!exped,
      holderNode: node || { nx: 4, ny: 4 } };
  }
  check('§B death day classifies holder-dead',
    zeroRowDayReason(12, instB, mkCtx({ deathDayByVid: { h1: 12 } }), null) === 'holder-dead');
  check('§B census holderAlive false classifies holder-dead',
    zeroRowDayReason(12, instB, mkCtx({ censusByVidDay: { h1: { 12: censusAt(null, false, false) } } }), null) === 'holder-dead');
  check('§B scholar at dawn (scholar today AND yesterday) classifies holder-scholar',
    zeroRowDayReason(12, instB, mkCtx({ scholarByDay: { 11: 'h1', 12: 'h1' },
      censusByVidDay: { h1: { 12: censusAt() } } }), null) === 'holder-scholar');
  check('§B scholar only today (mid-day inheritance) is NOT holder-scholar at dawn',
    zeroRowDayReason(12, instB, mkCtx({ scholarByDay: { 11: 'other', 12: 'h1' },
      censusByVidDay: { h1: { 12: censusAt() } } }), null) !== 'holder-scholar');
  check('§B another-target score row that day classifies retarget-boundary',
    zeroRowDayReason(12, instB, mkCtx({ scoreTargetsByVidDay: { h1: { 12: ['congregation'] } },
      censusByVidDay: { h1: { 12: censusAt() } } }), null) === 'retarget-boundary');
  check('§B seed day classifies seed-day',
    zeroRowDayReason(10, instB, mkCtx({ censusByVidDay: { h1: { 10: censusAt() } } }), null) === 'seed-day');
  check('§B census exped classifies holder-on-expedition',
    zeroRowDayReason(12, instB, mkCtx({ censusByVidDay: { h1: { 12: censusAt({ nx: 3, ny: 5 }, true) } } }), null) === 'holder-on-expedition');
  check('§B member-row away classifies holder-away',
    zeroRowDayReason(12, instB, mkCtx({ memberAwayByVidDay: { h1: { 12: true } },
      censusByVidDay: { h1: { 12: censusAt({ nx: 4, ny: 0 }) } } }), null) === 'holder-away');
  check('§B v4 encounter that day classifies field-encounter-day',
    zeroRowDayReason(12, instB, mkCtx({ encountersByVidDay: { h1: { 12: true } },
      censusByVidDay: { h1: { 12: censusAt() } } }), null) === 'field-encounter-day');
  check('§B no census row classifies plan-not-in-census',
    zeroRowDayReason(12, instB, mkCtx({}), null) === 'plan-not-in-census');
  check('§B off-haven node classifies holder-off-haven',
    zeroRowDayReason(12, instB, mkCtx({ censusByVidDay: { h1: { 12: censusAt({ nx: 4, ny: 0 }) } } }), null) === 'holder-off-haven');
  check('§B prev pick part 3 + VISIT classifies phase-edge',
    zeroRowDayReason(12, instB, mkCtx({ censusByVidDay: { h1: { 12: censusAt() } } }),
      { part: 3, pick: { corePick: 'VISIT' } }) === 'phase-edge');
  check('§B prev pick part 3 + FORAGE is NOT phase-edge',
    zeroRowDayReason(12, instB, mkCtx({ censusByVidDay: { h1: { 12: censusAt() } } }),
      { part: 3, pick: { corePick: 'FORAGE' } }) === 'unknown-no-signal');
  check('§B alive at haven with no other gate is unknown-no-signal',
    zeroRowDayReason(12, instB, mkCtx({ censusByVidDay: { h1: { 12: censusAt() } } }), null) === 'unknown-no-signal');
  // §C LAUNCH ACCOUNTING (synthetic corpus).
  (function () {
    const d = { seed: 999001, instrumentErrors: [],
      v4departs: [
        { day: 10, vid: 'h1', result: 'launch', target: 'algorithm', targetWave: 4, source: 'brain', stage: 'hunt', partySize: 3, party: ['c1', 'c2'], winPlanAction: 'party_launch' },
        { day: 12, vid: 'c1', result: 'launch', target: 'algorithm', targetWave: null, source: 'brain', stage: 'hunt', partySize: 2, party: ['c2'], winPlanAction: 'party_launch' },
        { day: 13, vid: 'x9', result: 'launch', target: 'eulogy', targetWave: null, source: 'brain', stage: 'hunt', partySize: 2, party: [], winPlanAction: 'party_launch' },
        { day: 14, vid: 'h2', result: 'launch', target: 'chorus_line', targetWave: 3, source: 'brain', stage: 'hunt', partySize: 2, party: [], winPlanAction: 'party_launch' },
        { day: 15, vid: 'h3', result: 'hold', target: 'algorithm', targetWave: 4, source: 'brain', stage: 'party', partySize: 1, party: [], winPlanAction: 'party_wait' },
      ],
      dawnbidStarts: [
        { day: 10, vid: 'h1' }, { day: 12, vid: 'c1' },
      ] };
    const rows = launchAccounting(d);
    check('§C wave-4-target launch rows are 3 (wave-3 chorus_line + hold excluded)',
      rows.length === 3, rows.length);
    check('§C counted row is the needWave=4 launch', rows.filter(function (x) { return x.counted; }).length === 1, rows);
    const unc = rows.filter(function (x) { return !x.counted; });
    check('§C uncounted rows are 2', unc.length === 2, unc.length);
    check('§C c1 copy-links to the h1 launch (companion in its party)',
      !!unc[0].copyLink && unc[0].copyLink.holder === 'h1' && unc[0].copyLink.day === 10, unc[0]);
    check('§C x9 has no copy link', !unc[1].copyLink, unc[1]);
    check('§C h1 + c1 have start calls, x9 does not',
      rows[0].startCall === true && rows[1].startCall === true && rows[2].startCall === false, rows.map(function (x) { return x.startCall; }));
  })();
  // §D REPEAT-TARGET GROUPS.
  (function () {
    const d = { seed: 999001, instrumentErrors: [],
      v4encounters: [
        { day: 20, vid: 'z', mid: 'algorithm', wave: 4, origin: 'expedition', outcome: 'vFlee', rounds: 3, mDealt: 100 },
      ],
      v4launchTrack: [
        { day: 10, vid: 'h1', target: 'algorithm', stage: 'hunt', holderNode: { nx: 3, ny: 5 }, holderExped: true, lastKnownTile: { nx: 3, ny: 5 }, lastKnownSource: 'sighting', targetNearDist: 2, targetNearCount: 1, targetAliveCount: 1 },
        { day: 15, vid: 'h1', target: 'algorithm', stage: 'hunt', holderNode: { nx: 3, ny: 5 }, holderExped: true, lastKnownTile: { nx: 3, ny: 5 }, lastKnownSource: 'sighting', targetNearDist: 4, targetNearCount: 0, targetAliveCount: 1 },
      ] };
    const rows = [
      { day: 10, vid: 'h1', target: 'algorithm', counted: true, partySize: 3 },
      { day: 15, vid: 'h1', target: 'algorithm', counted: true, partySize: 3 },
    ];
    const gs = repeatTargetGroups(d, rows);
    check('§D one repeat group for h1+algorithm (2 launches)',
      gs.length === 1 && gs[0].launches.length === 2, gs);
    check('§D the d20 meeting is inside the 21-day window (first fight d20)',
      gs[0].meetingsInWindow === 1 && gs[0].firstFightDay === 20, gs[0]);
    check('§D track rows attach with the nearDist drift 2 -> 4',
      gs[0].track.length === 2 && gs[0].track[0].targetNearDist === 2 && gs[0].track[1].targetNearDist === 4, gs[0].track);
    const gs2 = repeatTargetGroups({ v4encounters: [], v4launchTrack: [] },
      [{ day: 10, vid: 'h1', target: 'algorithm', counted: true, partySize: 3 }]);
    check('§D a single launch is not a repeat group', gs2.length === 0, gs2.length);
  })();
  // §E DAY-LEVEL CLASSIFICATION (Taxonomy B', prereg CORRECTION
  // 2026-11-21). One synthetic not-bid instance: seed d10; a
  // midday-only assessed day d11 (part-1 party_wait); a zero-row
  // scholar day d12 (holder is scholar d11 AND d12); window ends
  // d12. The seed day d10 itself is a zero-row seed-day.
  (function () {
    function row(day, part, acts, corePick) {
      return { day: day, part: part, vid: 'h1',
        cands: acts.map(function (a) { return { kind: 'HAVEN_CHORE', w: 4, winPlanAction: a }; }),
        pick: { kind: 'HAVEN_CHORE', winPlanAction: acts[0] || null, corePick: corePick || 'HAVEN_CHORE' },
        commit: { kind: 'HAVEN_CHORE', winPlanAction: acts[0] || null },
        plan: { stage: 'party', target: 'algorithm', needWave: 4, party: [] },
        holderGear: { armed: true, armored: true } };
    }
    const doc = { seed: 999002, arm: 'strikeband4-b', run: 'strikeband4-b', mode: 'vre',
      policySha: '1884c8852d38aaaa', senseexpedFlag: '1', partysize4Flag: '1',
      vetreengageFlag: '1', fleerepair2Flag: '1', fightally2Flag: '1',
      allyslot3Flag: '1', launchsurviveFlag: '1', allyslot3InSrc: true,
      days: 12, gameDays: 12, endReason: 'survived', standing: 199, scaleRank: 'regional',
      won: false, maxWave: 4, instrumentErrors: [],
      v4seeds: [{ day: 10, vid: 'h1', mid: 'algorithm', wave: 4, outcome: 'fled',
        path: 'world-tick', stageAfter: 'party', target: 'algorithm', node: null }],
      dawnbidScores: [row(11, 1, ['party_wait'], 'VISIT')],
      dawnbidDeparts: [], dawnbidCensus: [10, 11, 12].map(function (d) {
        return { day: d, vid: 'h1', target: 'algorithm', needWave: 4, stage: 'party',
          party: [], holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false,
          holderSick: false, holderHealth: 80, holderGear: { armed: true, armored: true } };
      }),
      dawnbidStarts: [], launchdefSkips: [], companionPool: [], v4launchTrack: [],
      v4departs: [], v4gates: [], v4encounters: [], deaths: [],
      daily: [11, 12].map(function (d) { return { day: d, scholarId: 'h1' }; }) };
    const ctx = buildCtx(doc);
    const inst = { vid: 'h1', target: 'algorithm', seedDay: 10, closeDay: 12, closeKind: null };
    const days = classifyInstanceDays(doc, inst, ctx);
    check('§E instance has 3 instance-days (d10-d12)', days.instanceDays === 3, days.instanceDays);
    check('§E d11 midday-only counts as assessed (party-no-companion, part 1)',
      days.assessed.length === 1 && days.assessed[0].day === 11 && days.assessed[0].part === 1 &&
      days.assessed[0].reason === 'party-no-companion' && days.middayOnlyDays === 1, days.assessed);
    check('§E d10 is a zero-row seed-day',
      days.zeroRow.some(function (z) { return z.day === 10 && z.reason === 'seed-day'; }), days.zeroRow);
    check('§E d12 is a zero-row holder-scholar day (scholar d11 AND d12)',
      days.zeroRow.some(function (z) { return z.day === 12 && z.reason === 'holder-scholar'; }), days.zeroRow);
    check('§E day-level classification has 0 unknown', days.unknown === 0, days.unknown);
  })();
  // §F TAXONOMY H FIXTURES (prereg, frozen). Synthetic holder-state
  // rows for one not-bid instance (h1, algorithm, seed d10).
  (function () {
    function hsRow(day, part, when, obj, over) {
      return Object.assign({ day: day, part: part, when: when, vid: 'h1',
        target: 'algorithm', stage: 'party',
        obj: obj, away: false, engaged: false, node: { nx: 4, ny: 4 }, haven: true,
        onExped: false, isScholar: false, dead: false, commit: null }, over || {});
    }
    function choreObj(pl) { return { kind: 'HAVEN_CHORE', state: 'indoor', partsLeft: pl, indoor: true, chore: 'wait', purpose: 'chore', targetVid: null, companion: null }; }
    function doneObj() { return { kind: 'idle', state: 'done', partsLeft: 0, indoor: false, chore: null, purpose: null, targetVid: null, companion: null }; }
    function readyObj() { return { kind: 'EXPEDITION', state: 'ready', partsLeft: null, indoor: false, chore: null, purpose: 'hunt', targetVid: null, companion: null }; }
    const inst = { vid: 'h1', target: 'algorithm', seedDay: 10, closeDay: 12 };
    function pickRow(day, part, corePick) {
      return { day: day, part: part, vid: 'h1',
        cands: [{ kind: 'HAVEN_CHORE', w: 4, winPlanAction: 'party_wait' }],
        pick: { kind: 'HAVEN_CHORE', winPlanAction: 'party_wait', corePick: corePick || 'VISIT' },
        commit: { kind: 'HAVEN_CHORE', winPlanAction: 'party_wait' },
        plan: { stage: 'party', target: 'algorithm', needWave: 4, party: [] },
        holderGear: { armed: true, armored: true } };
    }
    // F1 hs-engaged-skip: pick d10 p3 (VISIT, L=5 -> exit 4); d11 the
    // chore lives all day (exits 3,3,2,1) with an engaged part at p1.
    (function () {
      const commit10 = { day: 10, part: 3, kind: 'HAVEN_CHORE', winPlanAction: 'party_wait' };
      const doc = { dawnbidScores: [pickRow(10, 3, 'VISIT')], holderGatePicks: [],
        holderState: [
          hsRow(10, 3, 'tick-entry', doneObj(), { commit: null }),
          hsRow(10, 3, 'tick-exit', choreObj(4), { commit: commit10 }),
          hsRow(11, 0, 'tick-entry', choreObj(4), { commit: commit10 }),
          hsRow(11, 0, 'tick-exit', choreObj(3), { commit: commit10 }),
          hsRow(11, 1, 'tick-entry', choreObj(3), { engaged: true, commit: commit10 }),
          hsRow(11, 1, 'tick-exit', choreObj(3), { engaged: true, commit: commit10 }),
          hsRow(11, 2, 'tick-entry', choreObj(3), { commit: commit10 }),
          hsRow(11, 2, 'tick-exit', choreObj(2), { commit: commit10 }),
          hsRow(11, 3, 'tick-entry', choreObj(2), { commit: commit10 }),
          hsRow(11, 3, 'tick-exit', choreObj(1), { commit: commit10 }),
        ] };
      const hsCtx = buildHsCtx(doc);
      const got = classifyUnknownDayH(11, inst, doc, hsCtx);
      check('§F engaged skip delays the chore past the day (hs-engaged-skip)',
        got.reason === 'hs-engaged-skip' &&
        got.trace.skipParts.some(function (s) { return s.day === 11 && s.part === 1 && s.branch === 'engaged'; }), got);
    })();
    // F2 hs-away-skip: same shape, away at d11 p2 instead of engaged.
    (function () {
      const commit10 = { day: 10, part: 3, kind: 'HAVEN_CHORE', winPlanAction: 'party_wait' };
      const doc = { dawnbidScores: [pickRow(10, 3, 'VISIT')], holderGatePicks: [],
        holderState: [
          hsRow(10, 3, 'tick-entry', doneObj(), { commit: null }),
          hsRow(10, 3, 'tick-exit', choreObj(4), { commit: commit10 }),
          hsRow(11, 0, 'tick-entry', choreObj(4), { commit: commit10 }),
          hsRow(11, 0, 'tick-exit', choreObj(3), { commit: commit10 }),
          hsRow(11, 1, 'tick-entry', choreObj(3), { commit: commit10 }),
          hsRow(11, 1, 'tick-exit', choreObj(2), { commit: commit10 }),
          hsRow(11, 2, 'tick-entry', choreObj(2), { away: true, commit: commit10 }),
          hsRow(11, 2, 'tick-exit', choreObj(2), { away: true, commit: commit10 }),
          hsRow(11, 3, 'tick-entry', choreObj(2), { commit: commit10 }),
          hsRow(11, 3, 'tick-exit', choreObj(1), { commit: commit10 }),
        ] };
      const got = classifyUnknownDayH(11, inst, doc, buildHsCtx(doc));
      check('§F away skip delays the chore past the day (hs-away-skip)',
        got.reason === 'hs-away-skip' &&
        got.trace.skipParts.some(function (s) { return s.day === 11 && s.part === 2 && s.branch === 'away'; }), got);
    })();
    // F3 hs-gate-pick: a REST gate row on d11 explains the day even
    // though the chore trace would otherwise look live.
    (function () {
      const doc = { dawnbidScores: [pickRow(10, 3, 'VISIT')],
        holderGatePicks: [{ day: 11, part: 1, vid: 'h1', kind: 'REST', gate: 'low_energy', target: 'algorithm', stage: 'party' }],
        holderState: [hsRow(11, 1, 'tick-entry', doneObj(), { commit: { day: 10, part: 3, kind: 'HAVEN_CHORE', winPlanAction: 'party_wait' } })] };
      const got = classifyUnknownDayH(11, inst, doc, buildHsCtx(doc));
      check('§F a hard-gate pick on the day is hs-gate-pick (gate beats the trace)',
        got.reason === 'hs-gate-pick' && got.trace.gates.length === 1 &&
        got.trace.gates[0].kind === 'REST' && got.trace.gates[0].gate === 'low_energy', got);
    })();
    // F4 hs-refresh-blocked: done at a reached part, commit from
    // TODAY (a same-day pick for ANOTHER target — the commit is
    // per-vid, not per-target), no score/gate row for this target.
    (function () {
      const commit11 = { day: 11, part: 0, kind: 'HAVEN_CHORE', winPlanAction: 'party_wait' };
      const doc = { dawnbidScores: [{ day: 11, part: 0, vid: 'h1',
          cands: [{ kind: 'HAVEN_CHORE', w: 4, winPlanAction: 'party_wait' }],
          pick: { kind: 'HAVEN_CHORE', winPlanAction: 'party_wait' },
          commit: commit11,
          plan: { stage: 'party', target: 'congregation', needWave: 4, party: [] },
          holderGear: { armed: true, armored: true } }],
        holderGatePicks: [],
        holderState: [
          hsRow(11, 1, 'tick-entry', doneObj(), { commit: commit11 }),
          hsRow(11, 1, 'tick-exit', doneObj(), { commit: commit11 }),
        ] };
      const got = classifyUnknownDayH(11, inst, doc, buildHsCtx(doc));
      check('§F done at a reached part with a same-day commit is hs-refresh-blocked',
        got.reason === 'hs-refresh-blocked' && got.trace.doneAt && got.trace.doneAt.commitDay === 11, got);
    })();
    // F5 hs-unexplained: done at a reached part with a STALE commit
    // and no score/gate row — the refresh should have fired.
    (function () {
      const commit10 = { day: 10, part: 3, kind: 'HAVEN_CHORE', winPlanAction: 'party_wait' };
      const doc = { dawnbidScores: [pickRow(10, 3, 'VISIT')], holderGatePicks: [],
        holderState: [
          hsRow(11, 1, 'tick-entry', doneObj(), { commit: commit10 }),
          hsRow(11, 1, 'tick-exit', doneObj(), { commit: commit10 }),
        ] };
      const got = classifyUnknownDayH(11, inst, doc, buildHsCtx(doc));
      check('§F done at a reached part with a stale commit and no pick is hs-unexplained',
        got.reason === 'hs-unexplained', got);
    })();
    // F6 hs-departure-pending: objective ready at the parts, no done,
    // no gate, not still-live.
    (function () {
      const commit10 = { day: 10, part: 3, kind: 'HAVEN_CHORE', winPlanAction: 'party_wait' };
      const doc = { dawnbidScores: [pickRow(10, 3, 'VISIT')], holderGatePicks: [],
        holderState: [
          hsRow(11, 0, 'tick-entry', readyObj(), { commit: commit10 }),
          hsRow(11, 0, 'tick-exit', readyObj(), { commit: commit10 }),
          hsRow(11, 1, 'tick-entry', readyObj(), { commit: commit10 }),
          hsRow(11, 1, 'tick-exit', readyObj(), { commit: commit10 }),
        ] };
      const got = classifyUnknownDayH(11, inst, doc, buildHsCtx(doc));
      check('§F a ready objective with no pick is hs-departure-pending',
        got.reason === 'hs-departure-pending' && got.trace.readyAt && got.trace.readyAt.state === 'ready', got);
    })();
    // F7 hs-chore-not-finished-no-skip: still live all day, no skip
    // anywhere in the window — the phase model's clock is wrong.
    (function () {
      const commit10 = { day: 10, part: 3, kind: 'HAVEN_CHORE', winPlanAction: 'party_wait' };
      const doc = { dawnbidScores: [pickRow(10, 3, 'VISIT')], holderGatePicks: [],
        holderState: [
          hsRow(10, 3, 'tick-entry', doneObj(), { commit: null }),
          hsRow(10, 3, 'tick-exit', choreObj(4), { commit: commit10 }),
          hsRow(11, 0, 'tick-entry', choreObj(4), { commit: commit10 }),
          hsRow(11, 0, 'tick-exit', choreObj(3), { commit: commit10 }),
          hsRow(11, 1, 'tick-entry', choreObj(3), { commit: commit10 }),
          hsRow(11, 1, 'tick-exit', choreObj(2), { commit: commit10 }),
          hsRow(11, 2, 'tick-entry', choreObj(2), { commit: commit10 }),
          hsRow(11, 2, 'tick-exit', choreObj(1), { commit: commit10 }),
          hsRow(11, 3, 'tick-entry', choreObj(1), { commit: commit10 }),
          hsRow(11, 3, 'tick-exit', choreObj(1), { commit: commit10 }),
        ] };
      const got = classifyUnknownDayH(11, inst, doc, buildHsCtx(doc));
      check('§F still-live all day with no skip is hs-chore-not-finished-no-skip',
        got.reason === 'hs-chore-not-finished-no-skip' && got.trace.skipParts.length === 0, got);
    })();
    // F8 hs-no-rows: no holder-state rows and no gate rows at all.
    (function () {
      const doc = { dawnbidScores: [], holderGatePicks: [], holderState: [] };
      const got = classifyUnknownDayH(11, inst, doc, buildHsCtx(doc));
      check('§F no rows at all is hs-no-rows', got.reason === 'hs-no-rows', got);
    })();
    // F9 applyHolderState integration: a B'-unknown day explained
    // by H drops the instance unknown count to 0 (hU=1, hE=1, hS=1).
    (function () {
      const commit11 = { day: 11, part: 1, kind: 'HAVEN_CHORE', winPlanAction: 'party_wait' };
      const doc = { seed: 999003, arm: 'poolfirstfail-b', run: 'poolfirstfail-b', mode: 'vre',
        policySha: '1884c8852d38aaaa', senseexpedFlag: '1', partysize4Flag: '1',
        vetreengageFlag: '1', fleerepair2Flag: '1', fightally2Flag: '1',
        allyslot3Flag: '1', launchsurviveFlag: '1', allyslot3InSrc: true,
        days: 12, gameDays: 12, endReason: 'survived', standing: 199, scaleRank: 'regional',
        won: false, maxWave: 4, instrumentErrors: [],
        v4seeds: [{ day: 10, vid: 'h1', mid: 'algorithm', wave: 4, outcome: 'fled',
          path: 'world-tick', stageAfter: 'party', target: 'algorithm', node: null }],
        dawnbidScores: [pickRow(11, 1, 'VISIT')],
        dawnbidDeparts: [], dawnbidCensus: [10, 11, 12].map(function (d) {
          return { day: d, vid: 'h1', target: 'algorithm', needWave: 4, stage: 'party',
            party: [], holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false,
            holderSick: false, holderHealth: 80, holderGear: { armed: true, armored: true } };
        }),
        dawnbidStarts: [], launchdefSkips: [], companionPool: [], v4launchTrack: [],
        v4departs: [], v4gates: [], v4encounters: [], deaths: [],
        daily: [],
        holderGatePicks: [],
        holderState: [
          hsRow(11, 1, 'tick-entry', doneObj(), { commit: null }),
          hsRow(11, 1, 'tick-exit', choreObj(4), { commit: commit11 }),
          hsRow(12, 0, 'tick-entry', choreObj(4), { commit: commit11 }),
          hsRow(12, 0, 'tick-exit', choreObj(3), { commit: commit11 }),
          hsRow(12, 1, 'tick-entry', choreObj(3), { engaged: true, commit: commit11 }),
          hsRow(12, 1, 'tick-exit', choreObj(3), { engaged: true, commit: commit11 }),
          hsRow(12, 2, 'tick-entry', choreObj(3), { commit: commit11 }),
          hsRow(12, 2, 'tick-exit', choreObj(2), { commit: commit11 }),
          hsRow(12, 3, 'tick-entry', choreObj(2), { commit: commit11 }),
          hsRow(12, 3, 'tick-exit', choreObj(1), { commit: commit11 }),
        ] };
      const ctx = buildCtx(doc);
      const hsCtx = buildHsCtx(doc);
      const inst2 = { vid: 'h1', target: 'algorithm', seedDay: 10, closeDay: 12, closeKind: null };
      const enriched = applyHolderState(doc, inst2, classifyNotBid(doc, inst2, ctx), hsCtx);
      check('§F integration: B leaves d12 unknown-no-signal (hU=1)',
        enriched.hU === 1 && enriched.zeroRow.some(function (z) { return z.day === 12 && z.reason === 'unknown-no-signal'; }), enriched);
      check('§F integration: H explains d12 as hs-engaged-skip (hE=1, hS=1)',
        enriched.hE === 1 && enriched.hS === 1 &&
        enriched.hDays.length === 1 && enriched.hDays[0].day === 12 &&
        enriched.hDays[0].hReason === 'hs-engaged-skip', enriched.hDays);
      check('§F integration: instance unknown drops 1 -> 0 after H',
        enriched.unknown === 0, enriched.unknown);
      check('§F integration: the B reason in zeroRow[] is NOT rewritten',
        enriched.zeroRow.some(function (z) { return z.day === 12 && z.reason === 'unknown-no-signal'; }), enriched.zeroRow);
    })();
  })();
  // §G LEG R REPRODUCTION (real old corpora, read-only).
  (function () {
    const repro = reproduceOldBand();
    check('§G Leg R reproduces the 10 launcheng unknown days exactly',
      repro.exact === true && repro.unknownDays.length === 10, repro);
    check('§G Leg R: the old corpora carry zero holder-state rows (H inapplicable there)',
      repro.holderStateRows === 0 && repro.holderStateRowsOk === true, repro);
    check('§G Leg R: band unknown is 10', repro.bandUnknown === 10, repro.bandUnknown);
  })();
  // §H LEG S + H EXTENSIONS (launchfield prereg, frozen + AMENDMENT 1).
  // Synthetic holder-state rows + scores; no live sim.
  (function () {
    function hsRow(day, part, when, obj, over) {
      return Object.assign({ day: day, part: part, when: when, vid: 'h1',
        target: 'algorithm', stage: 'party', obj: obj, away: false, engaged: false,
        node: { nx: 4, ny: 4 }, haven: true, onExped: false, isScholar: false,
        dead: false, commit: null }, over || {});
    }
    function choreObj(pl) { return { kind: 'HAVEN_CHORE', state: 'indoor', partsLeft: pl, indoor: true, chore: 'wait', purpose: 'chore', targetVid: null, companion: null }; }
    function doneObj() { return { kind: 'idle', state: 'done', partsLeft: 0, indoor: false, chore: null, purpose: null, targetVid: null, companion: null }; }
    // H1 hs-scholar-idle: scholar at every sampled tick-entry part,
    // obj idle, no score/gate row.
    (function () {
      const doc = { seed: 999001, gameDays: 12, deaths: [], daily: [],
        dawnbidScores: [], holderGatePicks: [],
        holderState: [0, 1, 2, 3].map(function (p) {
          return hsRow(12, p, 'tick-entry', doneObj(), { isScholar: true, commit: { day: 11, part: 0, kind: 'HAVEN_CHORE', winPlanAction: 'party_wait' } });
        }) };
      const hsCtx = buildHsCtx(doc);
      const got = classifyUnknownDayH(12, { vid: 'h1', target: 'algorithm', seedDay: 10 }, doc, hsCtx);
      check('§H scholar at every sampled part with no score/gate row is hs-scholar-idle',
        got.reason === 'hs-scholar-idle' && got.trace.scholarParts === 4, got);
    })();
    // H1b negative: scholar only at parts 2-3 (became scholar mid-day)
    // with a stale commit and a done objective is NOT hs-scholar-idle.
    (function () {
      const doc = { seed: 999001, gameDays: 12, deaths: [], daily: [],
        dawnbidScores: [], holderGatePicks: [],
        holderState: [0, 1].map(function (p) {
          return hsRow(12, p, 'tick-entry', doneObj(), { commit: { day: 11, part: 0, kind: 'HAVEN_CHORE', winPlanAction: 'party_wait' } });
        }).concat([2, 3].map(function (p) {
          return hsRow(12, p, 'tick-entry', doneObj(), { isScholar: true, commit: { day: 11, part: 0, kind: 'HAVEN_CHORE', winPlanAction: 'party_wait' } });
        })) };
      const hsCtx = buildHsCtx(doc);
      const got = classifyUnknownDayH(12, { vid: 'h1', target: 'algorithm', seedDay: 10 }, doc, hsCtx);
      check('§H scholar at only some parts is NOT hs-scholar-idle (stale commit, no pick)',
        got.reason === 'hs-unexplained', got);
    })();
    // H2 churn fallback (a): a retarget seed row with stageAfter
    // 'hunt' (not gear/party) closes as retarget-seed-row-any-stage.
    (function () {
      const doc = { seed: 999002, gameDays: 11, deaths: [], daily: [],
        dawnbidScores: [], dawnbidCensus: [], companionPool: [], v4encounters: [],
        holderState: [], holderGatePicks: [],
        v4seeds: [{ day: 11, vid: 'h1', mid: 'congregation', wave: 4, outcome: 'fled',
          path: 'world-tick', stageAfter: 'hunt', target: 'congregation', node: null }] };
      const ctx = buildCtx(doc);
      const got = classifyChurn(doc, { vid: 'h1', target: 'algorithm', seedDay: 10, closeDay: 11, closeKind: 'retargeted' }, ctx);
      check('§H retarget seed row with stageAfter hunt closes as retarget-seed-row-any-stage',
        got.closing.kind === 'retarget-seed-row-any-stage' && got.closing.day === 11 && got.closing.target === 'congregation', got.closing);
    })();
    // H2 fallback (b): no seed row, but the holder-state rows show
    // the plan target changed — retarget-observed-holderstate.
    (function () {
      const doc = { seed: 999002, gameDays: 11, deaths: [], daily: [],
        dawnbidScores: [], dawnbidCensus: [], companionPool: [], v4encounters: [],
        holderState: [hsRow(11, 0, 'tick-entry', choreObj(2), { target: 'congregation' })],
        holderGatePicks: [], v4seeds: [] };
      const ctx = buildCtx(doc);
      const got = classifyChurn(doc, { vid: 'h1', target: 'algorithm', seedDay: 10, closeDay: 11, closeKind: 'retargeted' }, ctx);
      check('§H no seed row but holder-state target change closes as retarget-observed-holderstate',
        got.closing.kind === 'retarget-observed-holderstate' && got.closing.day === 11, got.closing);
    })();
    // H2 fallback (c): neither a seed row nor a holder-state target
    // change — retarget-seed-row-missing stays unknown.
    (function () {
      const doc = { seed: 999002, gameDays: 11, deaths: [], daily: [],
        dawnbidScores: [], dawnbidCensus: [], companionPool: [], v4encounters: [],
        holderState: [], holderGatePicks: [], v4seeds: [] };
      const ctx = buildCtx(doc);
      const got = classifyChurn(doc, { vid: 'h1', target: 'algorithm', seedDay: 10, closeDay: 11, closeKind: 'retargeted' }, ctx);
      check('§H no seed row and no holder-state target change stays retarget-seed-row-missing (unknown)',
        got.closing.kind === 'retarget-seed-row-missing' && got.unknown >= 1, got);
    })();
    // H3 Leg S ledger: 3 days x 4 parts, one of each shape. The
    // holder dies day 12, so the no-rows part sits on day 11
    // (alive, census row exists — a genuine coverage gap).
    (function () {
      function score(day, part) {
        return { day: day, part: part, vid: 'h1',
          cands: [{ kind: 'HAVEN_CHORE', w: 4, winPlanAction: 'party_wait' }],
          pick: { kind: 'HAVEN_CHORE', winPlanAction: 'party_wait', corePick: 'HAVEN_CHORE' },
          commit: { kind: 'HAVEN_CHORE', winPlanAction: 'party_wait' },
          plan: { stage: 'party', target: 'algorithm', needWave: 4, party: [] },
          holderGear: { armed: true, armored: true } };
      }
      function readyObj() { return { kind: 'EXPEDITION', state: 'ready', partsLeft: null, indoor: false, chore: null, purpose: 'hunt', targetVid: null, companion: null }; }
      const doc = { seed: 999003, gameDays: 12,
        deaths: [{ day: 12, kind: 'villager', who: 'h1', cause: 'test' }],
        daily: [], dawnbidCensus: [10, 11, 12].map(function (d) { return { day: d, vid: 'h1' }; }),
        v4seeds: [],
        dawnbidScores: [score(10, 0)],
        holderGatePicks: [{ day: 11, part: 1, vid: 'h1', kind: 'EAT', gate: 'hunger', target: 'algorithm', stage: 'party' }],
        holderState: [
          hsRow(10, 1, 'tick-entry', choreObj(2), { engaged: true }),
          hsRow(10, 2, 'tick-entry', choreObj(2)),
          hsRow(10, 3, 'tick-entry', doneObj(), { isScholar: true, commit: { day: 9, part: 0, kind: 'HAVEN_CHORE', winPlanAction: 'party_wait' } }),
          hsRow(11, 2, 'tick-entry', readyObj()),
          hsRow(11, 3, 'tick-entry', doneObj(), { commit: { day: 11, part: 0, kind: 'HAVEN_CHORE', winPlanAction: 'party_wait' } }),
          hsRow(12, 0, 'tick-entry', doneObj(), { dead: true }),
        ] };
      const hsCtx = buildHsCtx(doc);
      const inst = { vid: 'h1', target: 'algorithm', seedDay: 10, closeDay: 12 };
      const enriched = applyPerPartLedger(doc, inst, {}, hsCtx);
      check('§H Leg S: 12 parts total (3 days x 4)',
        enriched.sPartsTotal === 12, enriched.sPartsTotal);
      check('§H Leg S: 1 scored part (d10 p0)',
        enriched.sScored === 1, enriched.sScored);
      check('§H Leg S: 1 unexplained part (d11 p0, no-rows)',
        enriched.sUnexplained === 1, enriched.sUnexplained);
      check('§H Leg S: whyNot tally covers engaged/chore-live/scholar/departure-pending/refresh-blocked/gate-pick/dead/no-rows',
        enriched.sTally.engaged === 1 && enriched.sTally['chore-live'] === 1 &&
        enriched.sTally.scholar === 1 && enriched.sTally['departure-pending'] === 1 &&
        enriched.sTally['refresh-blocked'] === 1 && enriched.sTally['gate-pick'] === 1 &&
        enriched.sTally.dead === 4 && enriched.sTally['no-rows'] === 1, enriched.sTally);
      check('§H Leg S: no seed-day parts ride on the AMENDMENT 1 fallback here (rows exist)',
        enriched.sSeedDayParts === 0, enriched.sSeedDayParts);
    })();
    // H3b AMENDMENT 1: seed-day parts with no holder-state row are
    // 'seed-day', not 'no-rows'.
    (function () {
      const doc = { seed: 999004, gameDays: 10, deaths: [], daily: [],
        dawnbidCensus: [{ day: 10, vid: 'h1' }], v4seeds: [],
        dawnbidScores: [], holderGatePicks: [], holderState: [] };
      const hsCtx = buildHsCtx(doc);
      const inst = { vid: 'h1', target: 'algorithm', seedDay: 10, closeDay: 10 };
      const enriched = applyPerPartLedger(doc, inst, {}, hsCtx);
      check('§H Leg S AMENDMENT 1: seed-day parts with no rows are seed-day (explained)',
        enriched.sUnexplained === 0 && enriched.sTally['seed-day'] === 4 &&
        enriched.sSeedDayParts === 4, enriched.sTally);
    })();
    // H3c AMENDMENT 1: a non-seed day with rows for another target
    // only is 'retargeted', not 'no-rows'.
    (function () {
      const doc = { seed: 999005, gameDays: 11, deaths: [], daily: [],
        dawnbidCensus: [{ day: 11, vid: 'h1' }], v4seeds: [],
        dawnbidScores: [], holderGatePicks: [],
        holderState: [0, 1, 2, 3].map(function (p) {
          return hsRow(11, p, 'tick-entry', choreObj(2), { target: 'congregation' });
        }) };
      const hsCtx = buildHsCtx(doc);
      const inst = { vid: 'h1', target: 'algorithm', seedDay: 10, closeDay: 11 };
      const enriched = applyPerPartLedger(doc, inst, {}, hsCtx);
      check('§H Leg S AMENDMENT 1: other-target rows that day classify retargeted (explained)',
        enriched.sTally.retargeted === 4 && enriched.sUnexplained === 0, enriched.sTally);
    })();
    // H4 LAUNCHFIELD: per-part field-encounter fallback — mirrors
    // the launchstate gap (seed 107305, day 150, part 3): no
    // holder-state row at part 3, Haven rows at parts 0-2, a
    // v4encounters row for the vid that day (monster 'suburb', NOT
    // the plan target 'algorithm' — any wave-4 encounter consumes
    // the part), census row that day. Part 3 classifies
    // field-encounter (explained), not no-rows.
    (function () {
      const doc = { seed: 999006, gameDays: 11, deaths: [], daily: [],
        dawnbidCensus: [{ day: 11, vid: 'h1' }], v4seeds: [],
        dawnbidScores: [], holderGatePicks: [],
        v4encounters: [{ day: 11, vid: 'h1', mid: 'suburb', wave: 4,
          outcome: 'vFlee', origin: 'aid', rounds: 1 }],
        holderState: [0, 1, 2].map(function (p) {
          return hsRow(11, p, 'tick-entry', choreObj(2));
        }) };
      const hsCtx = buildHsCtx(doc);
      const inst = { vid: 'h1', target: 'algorithm', seedDay: 10, closeDay: 11 };
      const enriched = applyPerPartLedger(doc, inst, {}, hsCtx);
      check('§H Leg S LAUNCHFIELD: Haven rows at p0-2 + encounter that day classifies p3 field-encounter (explained)',
        enriched.sTally['field-encounter'] === 1 && enriched.sUnexplained === 0, enriched.sTally);
      const p3 = enriched.sParts.filter(function (sp) { return sp.day === 11 && sp.part === 3; })[0];
      check('§H Leg S LAUNCHFIELD: the field-encounter part carries the encounter trace (mid suburb, outcome vFlee)',
        p3 && p3.whyNot === 'field-encounter' && p3.enc && p3.enc.mid === 'suburb' && p3.enc.outcome === 'vFlee', p3);
    })();
    // H4b negative: an encounter row for a different vid that day
    // does NOT attribute the part — vid+day match is required.
    (function () {
      const doc = { seed: 999007, gameDays: 11, deaths: [], daily: [],
        dawnbidCensus: [{ day: 11, vid: 'h1' }], v4seeds: [],
        dawnbidScores: [], holderGatePicks: [],
        v4encounters: [{ day: 11, vid: 'h2', mid: 'suburb', wave: 4,
          outcome: 'vFlee', origin: 'aid', rounds: 1 }],
        holderState: [0, 1, 2].map(function (p) {
          return hsRow(11, p, 'tick-entry', choreObj(2));
        }) };
      const hsCtx = buildHsCtx(doc);
      const got = perPartWhyNot(11, 3, { vid: 'h1', target: 'algorithm', seedDay: 10 }, doc, hsCtx);
      check('§H Leg S LAUNCHFIELD negative: encounter for another vid leaves the part no-rows (unexplained)',
        got.whyNot === 'no-rows' && !got.scored, got);
    })();
    // H4c negative: an encounter row for the vid that day but NO
    // holder-state rows at all that day (no Haven presence to
    // anchor the attribution) does NOT attribute — stays no-rows.
    (function () {
      const doc = { seed: 999008, gameDays: 11, deaths: [], daily: [],
        dawnbidCensus: [{ day: 11, vid: 'h1' }], v4seeds: [],
        dawnbidScores: [], holderGatePicks: [],
        v4encounters: [{ day: 11, vid: 'h1', mid: 'suburb', wave: 4,
          outcome: 'vFlee', origin: 'aid', rounds: 1 }],
        holderState: [] };
      const hsCtx = buildHsCtx(doc);
      const got = perPartWhyNot(11, 3, { vid: 'h1', target: 'algorithm', seedDay: 10 }, doc, hsCtx);
      check('§H Leg S LAUNCHFIELD negative: encounter with no Haven rows that day leaves the part no-rows (unexplained)',
        got.whyNot === 'no-rows' && !got.scored, got);
    })();
    // H4d: the vid as an ALLY in another villager's encounter also
    // consumes the part — same map as the day-level reason.
    (function () {
      const doc = { seed: 999009, gameDays: 11, deaths: [], daily: [],
        dawnbidCensus: [{ day: 11, vid: 'h1' }], v4seeds: [],
        dawnbidScores: [], holderGatePicks: [],
        v4encounters: [{ day: 11, vid: 'h2', allyVid: 'h1', mid: 'suburb', wave: 4,
          outcome: 'vFlee', origin: 'aid', rounds: 1 }],
        holderState: [0, 1, 2].map(function (p) {
          return hsRow(11, p, 'tick-entry', choreObj(2));
        }) };
      const hsCtx = buildHsCtx(doc);
      const got = perPartWhyNot(11, 3, { vid: 'h1', target: 'algorithm', seedDay: 10 }, doc, hsCtx);
      check('§H Leg S LAUNCHFIELD: vid as encounter ally classifies field-encounter (same map as day level)',
        got.whyNot === 'field-encounter' && got.enc && got.enc.mid === 'suburb', got);
    })();
  })();
  console.log('analyze-launchfield-rejudge-b selftest: ' + passed + ' passed, ' + failed + ' failed');
  return failed === 0;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) {
    process.exit(selftest() ? 0 : 1);
  }
  main();
}

module.exports = { bandOf: bandOf, judge: judge, seedOf: seedOf, scoredDawnReason: scoredDawnReason,
  zeroRowDayReason: zeroRowDayReason, classifyInstanceDays: classifyInstanceDays,
  classifyNotBid: classifyNotBid,
  classifyChurn: classifyChurn, launchAccounting: launchAccounting,
  repeatTargetGroups: repeatTargetGroups, buildCtx: buildCtx, selftest: selftest,
  buildHsCtx: buildHsCtx, lastPickDayBefore: lastPickDayBefore,
  classifyUnknownDayH: classifyUnknownDayH, applyHolderState: applyHolderState,
  reproduceOldBand: reproduceOldBand,
  perPartWhyNot: perPartWhyNot, applyPerPartLedger: applyPerPartLedger,
  EXPECTED: EXPECTED, REPRODUCTION: REPRODUCTION };

// analyze-launcheng-b.js — DIAG analyzer for arm sim-launcheng-b
// (finding #2605: why are wave-4+ plan candidates never bid?).
// Classifies EVERY candidate-not-bid instance on the frozen band
// 106241-106248 (existing strikeband4 corpora — NO new sims) by the
// gate that rejected it, per the frozen taxonomy in
// evidence/2026-11-20/sim-launcheng-b-prereg.md AS CORRECTED
// 2026-11-21 (CORRECTION section: the unit is the INSTANCE-DAY,
// not the dawn — scoring happens at all 4 day-parts and the pick
// phase drifts, so a day is ASSESSED if any score row exists
// that day at any part; zero-row days take Taxonomy B').
// Instances and buckets come from the frozen classifiers
// (analyze-launchdef-a.js classifySeed, analyze-launchfunnel-a.js
// funnelForSeed); this analyzer ENRICHES them, never re-defines
// them. One deliberate counting change, frozen in the prereg
// (§7.3 decision): a launch is any v4departs row with result
// 'launch' whose target's wave in src/data/monsters.json is >= 4,
// regardless of targetWave — the companion plan-copy paths copy
// target but never needWave, so follow-on hunts carry targetWave
// null and the frozen launchesOf excludes them. The strikeband4
// verdict is NOT re-scored here.
// Usage:
//   node scripts/analyze-launcheng-b.js <bandDir>
//   node scripts/analyze-launcheng-b.js --selftest
// Writes evidence/2026-11-20/launcheng-b-analysis.json. Exits 0 iff
// DIAG-GO (frozen bars in the prereg); on DIAG-NO-GO it still writes
// the JSON and exits 1.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const LFA = require(path.join(REPO, 'scripts', 'analyze-launchfunnel-a.js'));
const LD = require(path.join(REPO, 'scripts', 'analyze-launchdef-a.js'));
const DSR = require(path.join(REPO, 'scripts', 'analyze-dmgshape-rerun-b.js'));

const BAND_DIR = 'perseed-strikeband4-b-106241-106248';
const EXPECTED = {
  arm: 'strikeband4-b', run: 'strikeband4-b', mode: 'vre',
  policySha12: '1884c8852d38',
  flags: { senseexpedFlag: '1', partysize4Flag: '1', vetreengageFlag: '1',
    fleerepair2Flag: '1', fightally2Flag: '1', allyslot3Flag: '1', launchsurviveFlag: '1' },
  allyslot3InSrc: false,
  seeds: [106241, 106242, 106243, 106244, 106245, 106246, 106247, 106248],
};
const FROZEN_TOTALS = { instances: 31, candidateNotBid: 19, churned: 7,
  wave4TargetLaunches: 22, uncountedLaunches: 15, scoredNotBidDawns: 141,
  // Prereg CORRECTION 2026-11-21: 143 -> 141 (2 pool rows are
  // retarget-boundary dawns); day-level totals below.
  instanceDays: 268, assessedDays: 223, dawnDays: 141, middayOnlyDays: 82,
  assessedRows: 226, middayRows: 85, zeroRowDays: 45, unknownZeroRowDays: 10 };

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
    closing = rows.length ? { kind: 'retarget-seed-row', day: rows[0].day,
      mid: rows[0].mid, target: rows[0].target, outcome: rows[0].outcome || null,
      path: rows[0].path || null, stageAfter: rows[0].stageAfter || null }
      : { kind: 'retarget-seed-row-missing', day: null };
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
  for (const k of Object.keys(EXPECTED.flags)) {
    if (String(j[k]) !== EXPECTED.flags[k]) bad.push(k + ':' + j[k]);
  }
  if (j.allyslot3InSrc !== EXPECTED.allyslot3InSrc) bad.push('allyslot3InSrc:' + j.allyslot3InSrc);
  return bad;
}

function seedOf(j) {
  const ctx = buildCtx(j);
  const cls = LD.classifySeed(j, { launchDefinition: 'any-commit' });
  const funnel = LFA.funnelForSeed(j);
  const launches = DSR.launchesOf(j);
  const launchRows = launchAccounting(j);
  const notBid = [];
  const churn = [];
  for (const inst of cls.instances) {
    if (inst.bucket === 'candidate-not-bid') notBid.push(classifyNotBid(j, inst, ctx));
    else if (inst.bucket === 'plan-churned-before-dawn') churn.push(classifyChurn(j, inst, ctx));
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
    poolEligDist: poolEligDist, poolFirstFails: poolFirstFails,
    memberProfiles: memberProfiles, memberProfilesByAway: memberProfilesByAway,
    holderProfiles: holderProfiles,
    countedLaunches: sum(function (s) { return s.countedLaunches; }),
    wave4TargetLaunches: launchRows.length,
    uncountedLaunches: uncounted.length,
    launchNoStartCall: noStartCall.length,
    uncountedNoCopyLink: noCopyLink.length,
    firstFights: sum(function (s) { return s.firstFights.length; }),
    repeatTargetGroups: perSeed.reduce(function (t, s) { return t.concat(s.repeatTarget.map(function (g) { return Object.assign({ seed: s.seed }, g); })); }, []),
    wall: wall,
    perSeed: perSeed };
}

function judge(band) {
  const totalsOk = band.instancesOpened === FROZEN_TOTALS.instances &&
    band.notBidInstances === FROZEN_TOTALS.candidateNotBid &&
    band.churnInstances === FROZEN_TOTALS.churned &&
    band.wave4TargetLaunches === FROZEN_TOTALS.wave4TargetLaunches &&
    band.uncountedLaunches === FROZEN_TOTALS.uncountedLaunches &&
    band.scoredNotBidDawns === FROZEN_TOTALS.scoredNotBidDawns &&
    band.instanceDays === FROZEN_TOTALS.instanceDays &&
    band.assessedNotBidDays === FROZEN_TOTALS.assessedDays &&
    band.dawnDays === FROZEN_TOTALS.dawnDays &&
    band.middayOnlyDays === FROZEN_TOTALS.middayOnlyDays &&
    band.assessedRows === FROZEN_TOTALS.assessedRows &&
    band.middayRows === FROZEN_TOTALS.middayRows &&
    band.zeroRowNotBidDays === FROZEN_TOTALS.zeroRowDays &&
    band.unknownZeroRowDays === FROZEN_TOTALS.unknownZeroRowDays;
  // Binding gate over ASSESSED DAYS (dawn + midday, prereg
  // CORRECTION 2026-11-21): the modal day-level reason must hold
  // a plurality of the assessed not-bid days.
  const dayReasons = band.assessedDayReasons || {};
  const bindingEntry = Object.keys(dayReasons).sort(function (a, b) { return (dayReasons[b] || 0) - (dayReasons[a] || 0); })[0] || null;
  const bindingCount = bindingEntry != null ? (dayReasons[bindingEntry] || 0) : 0;
  const bindingNamed = !!bindingEntry && bindingCount > 0 &&
    band.assessedNotBidDays > 0 && bindingCount * 2 > band.assessedNotBidDays;
  const bars = {
    completeness: { pass: band.unknown === 0,
      unknown: band.unknown, scoredMismatch: band.scoredDawnsMismatch },
    bindingGate: { pass: bindingNamed, gate: bindingEntry, count: bindingCount,
      assessedDays: band.assessedNotBidDays },
    launchAccounting: { pass: band.launchNoStartCall === 0 && band.uncountedNoCopyLink === 0 &&
        band.wave4TargetLaunches === FROZEN_TOTALS.wave4TargetLaunches &&
        band.uncountedLaunches === FROZEN_TOTALS.uncountedLaunches,
      noStartCall: band.launchNoStartCall, noCopyLink: band.uncountedNoCopyLink,
      wave4TargetLaunches: band.wave4TargetLaunches, uncounted: band.uncountedLaunches },
    instrument: { pass: band.files === 8 && band.errors === 0 &&
        band.substrateBadFiles.length === 0 && totalsOk,
      files: band.files, errors: band.errors,
      substrateBadFiles: band.substrateBadFiles.length, totalsOk: totalsOk,
      expected: FROZEN_TOTALS,
      got: { instances: band.instancesOpened, candidateNotBid: band.notBidInstances,
        churned: band.churnInstances, wave4TargetLaunches: band.wave4TargetLaunches,
        uncountedLaunches: band.uncountedLaunches, scoredNotBidDawns: band.scoredNotBidDawns,
        instanceDays: band.instanceDays, assessedDays: band.assessedNotBidDays,
        dawnDays: band.dawnDays, middayOnlyDays: band.middayOnlyDays,
        assessedRows: band.assessedRows, middayRows: band.middayRows,
        zeroRowDays: band.zeroRowNotBidDays, unknownZeroRowDays: band.unknownZeroRowDays } },
  };
  const go = bars.completeness.pass && bars.bindingGate.pass && bars.launchAccounting.pass && bars.instrument.pass;
  return { go: go, bars: bars, verdict: go ? 'DIAG-GO' : 'DIAG-NO-GO' };
}

function main() {
  const dir = process.argv[2];
  if (!dir) { console.error('LAUNCHENG STOP: band dir required.'); process.exit(2); }
  const band = bandOf(dir);
  const j = judge(band);
  const out = { arm: 'launcheng-b', run: 'launcheng-b', band: band,
    bars: j.bars, verdict: j.verdict };
  const outFile = path.join(REPO, 'evidence', '2026-11-20', 'launcheng-b-analysis.json');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  const wrote = writeRobust(outFile, JSON.stringify(out, null, 2) + '\n');
  console.log('band ' + band.dir + ' files=' + band.files + ' errors=' + band.errors +
    ' instances=' + band.instancesOpened + ' notBid=' + band.notBidInstances +
    ' churn=' + band.churnInstances + ' unknown=' + band.unknown);
  console.log('instanceDays=' + band.instanceDays + ' assessedDays=' + band.assessedNotBidDays +
    ' (dawn=' + band.dawnDays + ' middayOnly=' + band.middayOnlyDays + ')' +
    ' assessedRows=' + band.assessedRows + ' zeroRowDays=' + band.zeroRowNotBidDays +
    ' unknownZeroRow=' + band.unknownZeroRowDays);
  console.log('assessedDayReasons=' + JSON.stringify(band.assessedDayReasons));
  console.log('zeroRowReasons=' + JSON.stringify(band.zeroRowReasons) +
    ' churnZeroRowReasons=' + JSON.stringify(band.churnZeroRowReasons));
  console.log('poolEligDist=' + JSON.stringify(band.poolEligDist) + ' poolFirstFails=' + JSON.stringify(band.poolFirstFails));
  console.log('launches counted=' + band.countedLaunches + ' wave4target=' + band.wave4TargetLaunches +
    ' uncounted=' + band.uncountedLaunches + ' noStartCall=' + band.launchNoStartCall +
    ' noCopyLink=' + band.uncountedNoCopyLink + ' firstFights=' + band.firstFights);
  console.log('wall=' + JSON.stringify(band.wall));
  console.log('bars: completeness=' + (j.bars.completeness.pass ? 'PASS' : 'FAIL') +
    ' bindingGate=' + (j.bars.bindingGate.pass ? 'PASS (' + j.bars.bindingGate.gate + ' ' + j.bars.bindingGate.count + ')' : 'FAIL') +
    ' launchAccounting=' + (j.bars.launchAccounting.pass ? 'PASS' : 'FAIL') +
    ' instrument=' + (j.bars.instrument.pass ? 'PASS' : 'FAIL'));
  console.log('VERDICT: ' + j.verdict);
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
      allyslot3Flag: '1', launchsurviveFlag: '1', allyslot3InSrc: false,
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
  console.log('analyze-launcheng-b selftest: ' + passed + ' passed, ' + failed + ' failed');
  return failed === 0;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) {
    process.exit(selftest() ? 0 : 1);
  }
  main();
}

module.exports = { bandOf: bandOf, judge: judge, scoredDawnReason: scoredDawnReason,
  zeroRowDayReason: zeroRowDayReason, classifyInstanceDays: classifyInstanceDays,
  classifyNotBid: classifyNotBid,
  classifyChurn: classifyChurn, launchAccounting: launchAccounting,
  repeatTargetGroups: repeatTargetGroups, buildCtx: buildCtx, selftest: selftest,
  EXPECTED: EXPECTED, FROZEN_TOTALS: FROZEN_TOTALS };

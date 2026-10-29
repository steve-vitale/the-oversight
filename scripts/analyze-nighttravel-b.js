#!/usr/bin/env node
// analyze-nighttravel-b.js — per-seed away-conversion table + verdict
// vs the sim-nighttravel-b prereg bars (M1 pooled >= 0.50, G1/G2/G3).
//
// Usage:
//   node scripts/analyze-nighttravel-b.js --before <insideevening-dir>
//     --after <nighttravel-dir> [--out <analysis.json>]
// --before = insideevening control corpus, --after = nighttravel corpus.
// Prints a human table and writes the JSON analysis when --out is
// given. Exits 0 when the analysis is complete (the verdict is
// data, not an exit code — the evidence file judges it).
'use strict';
const fs = require('fs');
const path = require('path');
const arg = (n, f) => { const i = process.argv.indexOf('--' + n); return i < 0 ? f : process.argv[i + 1]; };
const beforeDir = arg('before', null), afterDir = arg('after', null);
const outFile = arg('out', null);
const rerun = process.argv.includes('--rerun');
if (!beforeDir || !afterDir) { console.error('usage: --before <dir> --after <dir> [--out <file>]'); process.exit(2); }

function loadDir(dir) {
  const out = {};
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith('.json')) continue;
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[j.seed] = j;
  }
  return out;
}
function median(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  if (!s.length) return null;
  return s.length % 2 ? s[Math.floor(s.length / 2)] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function isStarv(d) { return /starv|hunger|famine/i.test(String((d && d.cause) || '')); }
const BLOCKED = new Set(['blocked-combat', 'blocked-tent', 'game-over']);

function isBlockRefused(e) {
  return e.eveningOutcome === 'travel-refused' && e.travel
    && typeof e.travel.hopReturnKind === 'string' && e.travel.hopReturnKind.startsWith('block:');
}
// G3 LANDING-CHECK FIX (committed before any judged run after the
// 2224Z rerun; see evidence/2026-10-28/sim-nighttravel-rerun-b.md
// "Metric review"): the landing check judges ONLY hops that MOVED.
// A refused hop's arrival IS its departure by definition (position
// unchanged, block/null return), so counting the driver's raw
// travelLandedOnHaven === false on such a hop as a "landing
// failure" false-flagged all 6 block:creek refusals on seed 10757
// in the 2224Z corpus. A refused (non-moved) hop is verified
// instead by arrival == departure AND eveningOutcome
// 'travel-refused'; it is never a landing failure. A moved hop
// violates iff its arrival is not the haven node. When coords are
// unknown (no from/arrival record), fall back conservatively to
// the legacy travelLandedOnHaven field so unknowns never pass
// silently. travelLandFalse below keeps its LEGACY meaning
// (every raw false, for comparability); landingViolations is the
// fixed G3 count.
function travelMoved(e) {
  const t = e.travel;
  if (!t || !t.from || !t.arrival) return null;
  const fpx = t.from.mapPx, fpy = t.from.mapPy, apx = t.arrival.mapPx, apy = t.arrival.mapPy;
  if (fpx === null || fpx === undefined || fpy === null || fpy === undefined
    || apx === null || apx === undefined || apy === null || apy === undefined) return null;
  return fpx !== apx || fpy !== apy;
}
function landingViolation(e) {
  if (!e.travel) return false;
  const moved = travelMoved(e);
  if (moved === false) return false;
  if (moved === true) {
    const h = e.haven || null;
    return !(e.travel.arrival.mapPx === (h && h.hx) && e.travel.arrival.mapPy === (h && h.hy));
  }
  return e.travelLandedOnHaven === false;
}
function refusedHopVerified(e) {
  return travelMoved(e) === false && e.eveningOutcome === 'travel-refused';
}
function perSeed(j) {
  const evs = (j.evenings || []).filter((e) => e.eveningOutcome !== 'game-over');
  const outcomes = {};
  let away = 0, eligibleAway = 0, convertedAway = 0, atHaven = 0, insideAtHaven = 0;
  let travelledHome = 0, outOfReach = 0, travelRefused = 0, travelArrivedCombat = 0, travelDied = 0, havenUnknown = 0;
  // Rerun partition (disjoint, prereg order): blockedGuard, havenUnknownAway,
  // expeditionAway, blockedPathAway, withinReach, unclassifiedAway.
  let blockedGuardAway = 0, havenUnknownAway = 0, expeditionAway = 0, blockedPathAway = 0;
  let withinReachAway = 0, withinReachConverted = 0, unclassifiedAway = 0;
  const blockKindHist = {};
  let agreeFalse = 0, travelLandFalse = 0, landingViolations = 0, refusedHopN = 0, refusedHopVerifiedN = 0;
  const distHist = {};
  let kcalHopSum = 0, kcalHopN = 0, kcalEntrySum = 0, kcalEntryN = 0;
  for (const e of evs) {
    outcomes[e.eveningOutcome] = (outcomes[e.eveningOutcome] || 0) + 1;
    if (e.positionAgreesWithPolicy === false) agreeFalse++;
    if (e.travelLandedOnHaven === false) travelLandFalse++;
    if (landingViolation(e)) landingViolations++;
    if (e.travel && travelMoved(e) === false) {
      refusedHopN++;
      if (refusedHopVerified(e)) refusedHopVerifiedN++;
    }
    const preAway = e.preStepTile !== null && e.preStepTile !== undefined && e.preStepTile !== 'haven';
    const endsInside = e.inside === true && e.tile === 'haven';
    if (preAway) {
      away++;
      if (!BLOCKED.has(e.eveningOutcome)) {
        eligibleAway++;
        if (endsInside) convertedAway++;
      }
      if (BLOCKED.has(e.eveningOutcome)) blockedGuardAway++;
      else if (e.eveningOutcome === 'haven-unknown') havenUnknownAway++;
      else if (e.travelOffered === false) expeditionAway++;
      else if (isBlockRefused(e)) {
        blockedPathAway++;
        blockKindHist[e.travel.hopReturnKind] = (blockKindHist[e.travel.hopReturnKind] || 0) + 1;
      } else if (e.travelOffered === true) {
        withinReachAway++;
        if (endsInside) withinReachConverted++;
      } else unclassifiedAway++;
      if (e.havenDistance !== null && e.havenDistance !== undefined) {
        distHist[e.havenDistance] = (distHist[e.havenDistance] || 0) + 1;
      }
    } else if (e.preStepTile === 'haven') {
      atHaven++;
      if (endsInside) insideAtHaven++;
    }
    if (e.travelledHome) travelledHome++;
    if (e.eveningOutcome === 'out-of-reach') outOfReach++;
    if (e.eveningOutcome === 'travel-refused') travelRefused++;
    if (e.eveningOutcome === 'travel-arrived-combat') travelArrivedCombat++;
    if (e.eveningOutcome === 'travel-died') travelDied++;
    if (e.eveningOutcome === 'haven-unknown') havenUnknown++;
    if (e.travel) {
      if (typeof e.travel.kcalDeltaHop === 'number') { kcalHopSum += e.travel.kcalDeltaHop; kcalHopN++; }
      if (typeof e.travel.kcalDeltaEntry === 'number') { kcalEntrySum += e.travel.kcalDeltaEntry; kcalEntryN++; }
    }
  }
  // Streaks: maximal runs of consecutive loop-days with preStep away.
  // Broken iff the streak's last evening is a converted away evening.
  const sortedEvs = evs.slice().sort((a, b) => a.loopDay - b.loopDay);
  let awayStreaks = 0, streaksBroken = 0;
  const streakList = [];
  let cur = null;
  const finishStreak = () => {
    if (!cur) return;
    awayStreaks++;
    if (cur.lastConverted) streaksBroken++;
    streakList.push({ startDay: cur.startDay, endDay: cur.endDay, evenings: cur.count, broken: !!cur.lastConverted });
    cur = null;
  };
  for (const e of sortedEvs) {
    const preAway = e.preStepTile !== null && e.preStepTile !== undefined && e.preStepTile !== 'haven';
    const endsInside = e.inside === true && e.tile === 'haven';
    if (preAway && cur && e.loopDay === cur.endDay + 1) {
      cur.endDay = e.loopDay; cur.count++; cur.lastConverted = endsInside;
    } else if (preAway) {
      finishStreak();
      cur = { startDay: e.loopDay, endDay: e.loopDay, count: 1, lastConverted: endsInside };
    } else {
      finishStreak();
    }
  }
  finishStreak();
  const evByLoopDay = {};
  for (const e of evs) evByLoopDay[e.loopDay] = e;
  const taps = j.taps || [];
  const awayTaps = taps.filter((t) => t.preStepAway && t.outcome === 'attempted');
  const awayTapsConverted = awayTaps.filter((t) => t.insideAtTap === true && t.tileAtTap === 'haven');
  const withinReachAwayTaps = awayTaps.filter((t) => {
    const ev = evByLoopDay[t.loopDay];
    return ev && ev.travelOffered === true && !isBlockRefused(ev);
  });
  const withinReachAwayTapsConverted = withinReachAwayTaps.filter((t) => t.insideAtTap === true && t.tileAtTap === 'haven');
  const insideTaps = taps.filter((t) => t.outcome === 'attempted' && t.accessAtTap === 'inside');
  const mornings = j.mornings || [];
  const mornInside = mornings.filter((m) => m.inside === true && m.tile === 'haven').length;
  const starv = (j.deaths || []).filter(isStarv).length;
  return {
    seed: j.seed, daysAlive: j.daysAlive, endReason: j.endReason,
    evenings: evs.length, away, eligibleAway, convertedAway,
    awayRate: eligibleAway ? convertedAway / eligibleAway : null,
    atHaven, insideAtHaven,
    travelledHome, outOfReach, travelRefused, travelArrivedCombat, travelDied, havenUnknown,
    blockedGuardAway, havenUnknownAway, expeditionAway, blockedPathAway,
    withinReachAway, withinReachConverted,
    withinReachRate: withinReachAway ? withinReachConverted / withinReachAway : null,
    unclassifiedAway, blockKindHist,
    awayStreaks, streaksBroken, streakList,
    distHist, kcalHopMean: kcalHopN ? kcalHopSum / kcalHopN : null, kcalHopN,
    kcalEntryMean: kcalEntryN ? kcalEntrySum / kcalEntryN : null, kcalEntryN,
    agreeFalse, travelLandFalse, landingViolations, travelLandFalseLegacy: travelLandFalse,
    refusedHopN, refusedHopVerifiedN, outcomes,
    tapDays: taps.length, insideTaps: insideTaps.length,
    awayTaps: awayTaps.length, awayTapsConverted: awayTapsConverted.length,
    awayTapRate: awayTaps.length ? awayTapsConverted.length / awayTaps.length : null,
    withinReachAwayTaps: withinReachAwayTaps.length,
    withinReachAwayTapsConverted: withinReachAwayTapsConverted.length,
    withinReachAwayTapRate: withinReachAwayTaps.length ? withinReachAwayTapsConverted.length / withinReachAwayTaps.length : null,
    mornings: mornings.length, morningsInside: mornInside,
    deaths: (j.deaths || []).length, starvationDeaths: starv,
    deathCauses: (j.deaths || []).map((d) => d.cause || null),
    grantOk: j.grantOk,
  };
}

const before = loadDir(beforeDir), after = loadDir(afterDir);
const seeds = Object.keys(after).map(Number).sort((a, b) => a - b);
const rows = { before: {}, after: {} };
for (const s of seeds) {
  if (before[s]) rows.before[s] = perSeed(before[s]);
  rows.after[s] = perSeed(after[s]);
}
const sum = (rs, k) => Object.values(rs).reduce((t, r) => t + (r[k] || 0), 0);
const elig = sum(rows.after, 'eligibleAway'), conv = sum(rows.after, 'convertedAway');
const m1 = elig ? conv / elig : null;
const awayTaps = sum(rows.after, 'awayTaps'), awayTapsConv = sum(rows.after, 'awayTapsConverted');
const m2 = awayTaps ? awayTapsConv / awayTaps : null;
const medBefore = median(Object.values(rows.before).map((r) => r.daysAlive));
const medAfter = median(Object.values(rows.after).map((r) => r.daysAlive));
const starvBefore = sum(rows.before, 'starvationDeaths');
const starvAfter = sum(rows.after, 'starvationDeaths');
const g1 = medBefore === null ? null : (medAfter >= medBefore - 2);
const g2 = starvAfter <= starvBefore + 2;
const g3Violations = sum(rows.after, 'agreeFalse') + sum(rows.after, 'landingViolations');
const g3ViolationsLegacy = sum(rows.after, 'agreeFalse') + sum(rows.after, 'travelLandFalse');
const g3 = g3Violations === 0;
const verdict = {
  seeds: seeds.length,
  m1Converted: conv, m1Eligible: elig, m1, m1Bar: 0.5, m1Go: m1 !== null && m1 >= 0.5,
  m2AwayTapsConverted: awayTapsConv, m2AwayTaps: awayTaps, m2,
  medianDaysControl: medBefore, medianDaysPolicy: medAfter, g1,
  starvationControl: starvBefore, starvationPolicy: starvAfter, g2,
  g3Violations, g3ViolationsLegacy, g3,
  refusedHopN: sum(rows.after, 'refusedHopN'),
  refusedHopVerifiedN: sum(rows.after, 'refusedHopVerifiedN'),
  go: (m1 !== null && m1 >= 0.5) && g1 && g2 && g3,
};
// Rerun verdict (prereg sim-nighttravel-rerun-b): primary is the
// within-reach population only; expedition/blocked-path are separate
// populations, never pooled. Legacy m1 above is comparability only.
const wrN = sum(rows.after, 'withinReachAway');
const wrConv = sum(rows.after, 'withinReachConverted');
const wrRate = wrN ? wrConv / wrN : null;
const rerunVerdictStr = wrN < 8 ? 'insufficient-data'
  : ((wrRate !== null && wrRate >= 0.5) && g1 && g2 && g3 ? 'GO' : 'NO-GO');
verdict.rerun = {
  mode: 'rerun',
  primaryN: wrN, primaryConverted: wrConv, primaryRate: wrRate, primaryBar: 0.5,
  minN: 8, minNMet: wrN >= 8,
  expeditionAway: sum(rows.after, 'expeditionAway'),
  blockedPathAway: sum(rows.after, 'blockedPathAway'),
  havenUnknownAway: sum(rows.after, 'havenUnknownAway'),
  blockedGuardAway: sum(rows.after, 'blockedGuardAway'),
  unclassifiedAway: sum(rows.after, 'unclassifiedAway'),
  awayTotal: sum(rows.after, 'away'),
  streaksTotal: sum(rows.after, 'awayStreaks'),
  streaksBroken: sum(rows.after, 'streaksBroken'),
  tapAwayConverted: awayTapsConv, tapAwayN: awayTaps,
  withinReachTapConverted: sum(rows.after, 'withinReachAwayTapsConverted'),
  withinReachTapN: sum(rows.after, 'withinReachAwayTaps'),
  landingViolations: sum(rows.after, 'landingViolations'),
  travelLandFalseLegacy: sum(rows.after, 'travelLandFalse'),
  refusedHopN: sum(rows.after, 'refusedHopN'),
  refusedHopVerifiedN: sum(rows.after, 'refusedHopVerifiedN'),
  verdict: rerunVerdictStr,
  go: rerunVerdictStr === 'GO',
};
if (rerun) {
  // In --rerun mode the verdict.go exposed to the evidence file is
  // the rerun verdict, so a legacy pooled pass can never be mistaken
  // for a rerun pass (or vice versa).
  verdict.go = verdict.rerun.go;
  verdict.verdict = rerunVerdictStr;
}
const analysis = { verdict, rows };
console.log('seed | days | away elig conv rate | travHome outReach refus arrCombat | awayTaps conv | starv | end (policy leg; control in JSON)');
for (const s of seeds) {
  const r = rows.after[s];
  console.log(`${s} | ${r.daysAlive} | ${r.away} ${r.eligibleAway} ${r.convertedAway} ${r.awayRate === null ? 'null' : r.awayRate.toFixed(2)} | ${r.travelledHome} ${r.outOfReach} ${r.travelRefused} ${r.travelArrivedCombat} | ${r.awayTaps} ${r.awayTapsConverted} | ${r.starvationDeaths} | ${r.endReason}`);
}
if (rerun) {
  console.log('--- rerun partition (policy leg: withinReach / expedition / blockedPath / blockedGuard / havenUnknown / unclassified | streaks broken/total | withinReach taps) ---');
  for (const s of seeds) {
    const r = rows.after[s];
    console.log(`${s} | ${r.withinReachAway} ${r.withinReachConverted} ${r.withinReachRate === null ? 'null' : r.withinReachRate.toFixed(2)} | ${r.expeditionAway} | ${r.blockedPathAway} | ${r.blockedGuardAway} | ${r.havenUnknownAway} | ${r.unclassifiedAway} | ${r.streaksBroken}/${r.awayStreaks} | ${r.withinReachAwayTaps} ${r.withinReachAwayTapsConverted}`);
  }
}
console.log('--- control (insideevening) ---');
for (const s of seeds) {
  const r = rows.before[s];
  if (!r) { console.log(`${s} | MISSING`); continue; }
  console.log(`${s} | ${r.daysAlive} | ${r.away} ${r.eligibleAway} ${r.convertedAway} ${r.awayRate === null ? 'null' : r.awayRate.toFixed(2)} | ${r.travelledHome} ${r.outOfReach} ${r.travelRefused} ${r.travelArrivedCombat} | ${r.awayTaps} ${r.awayTapsConverted} | ${r.starvationDeaths} | ${r.endReason}`);
}
console.log('--- verdict ---');
console.log(JSON.stringify(verdict, null, 2));
if (outFile) fs.writeFileSync(outFile, JSON.stringify(analysis, null, 2) + '\n');

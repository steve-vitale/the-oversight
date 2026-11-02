#!/usr/bin/env node
// stancelayer-classify.js — PURE per-day gate classifier for
// sim-stancelayer-a. No game load, no I/O. Input: one seed's replay
// corpus {traces, travelEvents, arrivalRows, monsterTurnCalls,
// attempts}. Output: per-day labels for a judged window plus the
// seed-level verdict. Decision order per day (first match wins):
//   ATTEMPT > STEP_NO_ESCALATION > SHARED_NO_ESCALATION >
//   SCHOLAR_NEAR > APART > UNCLASSIFIED.
// Gate sub-labels for no-attempt shared/step days, from the day's
// shared monsterTurn call rows + the exit state (last shared call's
// post, else the arrival row):
//   NO_TURN / CURIOUS_FAR / CURIOUS_WATCHING / HUNGRY_OPEN / BLIND /
//   SLEEP_GUARD / TABLE_GUARD / GATE-UNRESOLVED.
// Attempt sub-labels: COINCIDED-AT-DAWN / CLOSED-IN-DAY /
// ATTEMPT-UNRESOLVED.
'use strict';

function cheb(a, b) {
  if (a == null || b == null) return null;
  return Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
}

function gateSublabel(dayCalls, arrivalRow, preTrace) {
  // Guards first: a suppressed turn explains everything else.
  for (const c of dayCalls) {
    if (c.sleeping === true && (c.havenTier || 0) >= 2 &&
        c.pre && c.pre.tile && c.pre.tile.x === 4 && c.pre.tile.y === 4) return 'SLEEP_GUARD';
    if (c.tableActive === true) return 'TABLE_GUARD';
  }
  if (!dayCalls.length) return 'NO_TURN';
  const first = dayCalls[0].pre || {};
  const last = dayCalls[dayCalls.length - 1].post || {};
  const lost0 = (first.lost == null ? 0 : first.lost);
  const lost1 = (last.lost == null ? 0 : last.lost);
  if (lost1 > lost0) return 'BLIND';
  const stance = last.stance || null;
  const dist = (last.dist == null && last.smx != null && last.hmx != null)
    ? cheb([last.smx, last.smy], [last.hmx, last.hmy]) : last.dist;
  if (stance === 'curious' && dist != null && dist > 3) return 'CURIOUS_FAR';
  if (stance === 'curious') return 'CURIOUS_WATCHING';
  if (stance === 'hungry' && dist != null && dist > 0) return 'HUNGRY_OPEN';
  if (stance === 'hungry' && dist === 0) return 'GATE-UNRESOLVED';
  if (stance == null && arrivalRow) {
    // Stance never initialized: no stance-machine turn ever ran for
    // this monster while shared (monsterTurn sets stance on first
    // shared run). Equivalent to NO_TURN when there are no calls.
    return dayCalls.length ? 'GATE-UNRESOLVED' : 'NO_TURN';
  }
  return 'GATE-UNRESOLVED';
}

function classifyDay(day, ctx) {
  const traces = ctx.tracesByDay[day] || [];
  const pre = traces.find(function (r) { return r.phase === 'pre'; }) || traces[0] || null;
  const post = traces.find(function (r) { return r.phase === 'post'; }) || null;
  const arrivals = ctx.arrivalsByDay[day] || [];
  const calls = ctx.callsByDay[day] || [];
  const attempts = ctx.attemptsByDay[day] || [];
  if (!traces.length) return { day: day, label: 'UNCLASSIFIED', sub: null, detail: {} };
  const shared = traces.some(function (r) { return r.same === true; });
  const minDist = traces.reduce(function (acc, r) {
    return (r.dist == null) ? acc : Math.min(acc, r.dist);
  }, Infinity);
  if (attempts.length) {
    // INSTRUMENT CORRECTION (see evidence metric review): the
    // pre-daily trace is sampled AFTER the harness's pre-daily waits,
    // so a pre-trace coincidence is the RESULT of wait-phase closing,
    // not its precondition. The sub-label therefore comes from the
    // FIRST firing call row, not from the pre trace: pre.coinc true
    // means the turn started already coincided; pre.coinc false +
    // post.coinc true means the call itself closed the distance.
    let sub = 'ATTEMPT-UNRESOLVED';
    const firing = calls.find(function (c) { return c.attemptDelta > 0; });
    if (firing) {
      if (firing.pre && firing.pre.coinc === true) sub = 'COINCIDED-AT-DAWN';
      else if (firing.post && firing.post.coinc === true) sub = 'CLOSED-IN-DAY';
    }
    return { day: day, label: 'ATTEMPT', sub: sub,
      detail: { attempts: attempts.length, arrivals: arrivals.length, sharedCalls: calls.length,
        preCoinc: pre ? pre.detailCoincide : null, preStance: pre ? pre.hstance : null,
        firingPreCoinc: firing ? (firing.pre ? firing.pre.coinc : null) : null } };
  }
  if (arrivals.length) {
    const sub = gateSublabel(calls, arrivals[0], pre);
    return { day: day, label: 'STEP_NO_ESCALATION', sub: sub,
      detail: { arrivals: arrivals.length, sharedCalls: calls.length,
        exitStance: calls.length ? calls[calls.length - 1].post.stance : arrivals[0].stance,
        exitWatch: calls.length ? calls[calls.length - 1].post.watch : arrivals[0].watch,
        exitDist: calls.length ? calls[calls.length - 1].post.dist : null } };
  }
  if (shared) {
    const sub = gateSublabel(calls, null, pre);
    return { day: day, label: 'SHARED_NO_ESCALATION', sub: sub,
      detail: { arrivals: 0, sharedCalls: calls.length,
        exitStance: calls.length ? calls[calls.length - 1].post.stance : (pre ? pre.hstance : null),
        exitWatch: calls.length ? calls[calls.length - 1].post.watch : (pre ? pre.hWatch : null),
        exitDist: calls.length ? calls[calls.length - 1].post.dist : null } };
  }
  if (minDist !== Infinity && minDist <= 3) {
    return { day: day, label: 'SCHOLAR_NEAR', sub: null, detail: { minDist: minDist } };
  }
  return { day: day, label: 'APART', sub: null, detail: { minDist: minDist === Infinity ? null : minDist } };
}

function groupByDay(rows, dayOf) {
  const out = {};
  for (const r of (rows || [])) {
    const d = dayOf(r);
    if (d == null) continue;
    (out[d] = out[d] || []).push(r);
  }
  return out;
}

function classifySeed(sl, fromDay, toDay) {
  const ctx = {
    tracesByDay: groupByDay(sl.traces, function (r) { return r.day; }),
    arrivalsByDay: groupByDay(sl.arrivalRows, function (r) { return r.day; }),
    callsByDay: groupByDay(sl.monsterTurnCalls, function (r) { return r.day; }),
    attemptsByDay: groupByDay(sl.attempts, function (a) { return a.day; }),
  };
  const days = [];
  for (let d = fromDay; d <= toDay; d++) days.push(classifyDay(d, ctx));
  const unclassified = days.filter(function (x) { return x.label === 'UNCLASSIFIED'; }).map(function (x) { return x.day; });
  const stepDays = days.filter(function (x) { return x.label === 'STEP_NO_ESCALATION'; });
  const unresolvedSteps = stepDays.filter(function (x) { return x.sub === 'GATE-UNRESOLVED'; }).map(function (x) { return x.day; });
  const attemptDays = days.filter(function (x) { return x.label === 'ATTEMPT'; });
  const unresolvedAttempts = attemptDays.filter(function (x) { return x.sub === 'ATTEMPT-UNRESOLVED'; }).map(function (x) { return x.day; });
  return { days: days,
    unclassifiedDays: unclassified,
    stepDays: stepDays.map(function (x) { return { day: x.day, sub: x.sub, detail: x.detail }; }),
    unresolvedStepDays: unresolvedSteps,
    attemptDays: attemptDays.map(function (x) { return { day: x.day, sub: x.sub, detail: x.detail }; }),
    unresolvedAttemptDays: unresolvedAttempts,
    counts: {
      attempt: attemptDays.length, stepNoEsc: stepDays.length,
      sharedNoEsc: days.filter(function (x) { return x.label === 'SHARED_NO_ESCALATION'; }).length,
      scholarNear: days.filter(function (x) { return x.label === 'SCHOLAR_NEAR'; }).length,
      apart: days.filter(function (x) { return x.label === 'APART'; }).length,
    } };
}

module.exports = { classifySeed: classifySeed, classifyDay: classifyDay, gateSublabel: gateSublabel };

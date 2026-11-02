'use strict';
// locatedengage-classify.js — PURE classifier for sim-locatedengage-a
// (Loop A 20261102T0815Z, axis scale-onramp). No game load, no I/O.
// Pre-registered in evidence/2026-11-02/sim-locatedengage-a-prereg.md.
// Input: one per-seed corpus record from
// scripts/locatedengage-replay-20261102.js (or a stub with the same
// fields: traces, travelEvents, attempts, lairTile).
//
// Daily labels, decision order (first match wins), per day:
//   ATTEMPT (sub: SCHOLAR-STEPPED / HERALD-STEPPED / SHARED-IDLE /
//     ATTEMPT-UNRESOLVED) — >= 1 herald attempt row that day.
//   SHARED_NO_ESCALATION — tiles shared at some trace row, 0 attempts.
//   SCHOLAR_NEAR — min Manhattan distance that day <= 3, never shared.
//   APART — min distance > 3 (or herald absent all day), never shared.
//   UNCLASSIFIED — no trace rows for the day at all.
//
// Step sub-labels (attempt days only; "stepped" requires the tiles to
// have been unshared at the pre-daily snapshot):
//   SCHOLAR-STEPPED — a 'moved' travel event that day whose target
//     equals the herald's tile before the move (hBefore).
//   HERALD-STEPPED — pre unshared, some later row shared, and no
//     scholar-stepped event (the herald's tile became the scholar's
//     tile — wander onto the scholar, on some travel's worldTick).
//   SHARED-IDLE — tiles already shared at the pre-daily snapshot.
//   ATTEMPT-UNRESOLVED — none of the above (a named unknown).
function rowsFor(rec, day) {
  const tr = Array.isArray(rec.traces) ? rec.traces : [];
  return tr.filter(function (r) { return r && r.day === day; });
}
function attemptsFor(rec, day) {
  const at = Array.isArray(rec.attempts) ? rec.attempts : [];
  return at.filter(function (a) { return a && a.day === day; });
}
function travelFor(rec, day) {
  const tv = Array.isArray(rec.travelEvents) ? rec.travelEvents : [];
  return tv.filter(function (e) { return e && e.day === day; });
}
function sameTile(a, b) { return !!a && !!b && a.x === b.x && a.y === b.y; }

function stepSublabel(dayRows, dayTravel, dayAttempts) {
  if (!dayAttempts.length) return null;
  const pre = dayRows.filter(function (r) { return r.phase === 'pre'; })[0] ||
    dayRows[0] || null;
  const preShared = !!(pre && pre.same);
  // NOTE: travel events carry the herald tile as {tx,ty}, not {x,y}.
  const scholarStepped = dayTravel.some(function (e) {
    return e.kind === 'moved' && e.hBefore && e.to && e.to.x === e.hBefore.tx && e.to.y === e.hBefore.ty;
  });
  if (!preShared && scholarStepped) return 'SCHOLAR-STEPPED';
  const anyShared = dayRows.some(function (r) { return r.same === true; });
  if (!preShared && anyShared) return 'HERALD-STEPPED';
  if (preShared) return 'SHARED-IDLE';
  return 'ATTEMPT-UNRESOLVED';
}

function classifyDay(rec, day) {
  const rows = rowsFor(rec, day);
  if (!rows.length) return { day: day, label: 'UNCLASSIFIED', sub: null, why: 'no trace rows for this day', minDist: null, everShared: false, everNear: false };
  const dayAtt = attemptsFor(rec, day);
  const dayTrav = travelFor(rec, day);
  const everShared = rows.some(function (r) { return r.same === true; });
  let minDist = null;
  for (const r of rows) {
    if (r.dist == null) continue;
    if (minDist == null || r.dist < minDist) minDist = r.dist;
  }
  const everNear = (minDist != null && minDist <= 3);
  if (dayAtt.length) {
    const sub = stepSublabel(rows, dayTrav, dayAtt);
    return { day: day, label: 'ATTEMPT', sub: sub, why: dayAtt.length + ' attempt(s), step ' + sub, minDist: minDist, everShared: everShared, everNear: everNear };
  }
  if (everShared) {
    return { day: day, label: 'SHARED_NO_ESCALATION', sub: null, why: 'tiles shared at a trace row, 0 attempts', minDist: minDist, everShared: true, everNear: everNear };
  }
  if (everNear) {
    return { day: day, label: 'SCHOLAR_NEAR', sub: null, why: 'min distance ' + minDist + ' (<=3, travelTargets radius), never shared', minDist: minDist, everShared: false, everNear: true };
  }
  return { day: day, label: 'APART', sub: null, why: (minDist == null ? 'herald absent all day' : 'min distance ' + minDist + ' (>3)'), minDist: minDist, everShared: false, everNear: false };
}

function classifyWindow(rec, fromDay, toDay) {
  const days = [];
  for (let d = fromDay; d <= toDay; d++) days.push(classifyDay(rec, d));
  const unclassified = days.filter(function (x) { return x.label === 'UNCLASSIFIED'; }).map(function (x) { return x.day; });
  const unresolved = days.filter(function (x) { return x.label === 'ATTEMPT' && x.sub === 'ATTEMPT-UNRESOLVED'; }).map(function (x) { return x.day; });
  const attemptDays = days.filter(function (x) { return x.label === 'ATTEMPT'; }).map(function (x) { return { day: x.day, sub: x.sub, why: x.why }; });
  const sharedDays = days.filter(function (x) { return x.everShared; }).map(function (x) { return x.day; });
  const nearDays = days.filter(function (x) { return x.everNear; }).map(function (x) { return x.day; });
  const counts = {};
  for (const x of days) counts[x.label] = (counts[x.label] || 0) + 1;
  return { fromDay: fromDay, toDay: toDay, days: days, counts: counts,
    unclassified: unclassified, unresolved: unresolved, attemptDays: attemptDays,
    sharedDays: sharedDays, nearDays: nearDays };
}

module.exports = { classifyDay, classifyWindow, stepSublabel, rowsFor, attemptsFor, travelFor };

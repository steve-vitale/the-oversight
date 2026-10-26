#!/usr/bin/env node
// substrate-days.js — shared racks-bound-day classifier (sim-substrate-b).
//
// Used identically by scripts/test-substrate-b.js (T1 fixtures, T2
// corpus assertions) and scripts/analyze-substrate-b.js, so the
// classification cannot drift between proof and report.
//
// Racks-bound day: >= 1 cook line that day with racksFull true via a
// spoken racksFull frame OR a plain line whose recompute says racksFull.
// Worked lines never mark a day racks-bound; a worked line whose
// recompute says racksFull is counted as workedRacksFull (anomaly).
//
// Classes (exhaustive over (F, R); F = duty forage returns that day,
// R = forage-task throttle redirects that day):
//   S-THROTTLED         F==0 && R>0
//   S-THROTTLED-PARTIAL F>0  && R>0
//   S-FORAGED           F>0  && R==0
//   S-NO-FORAGE-DUTY    F==0 && R==0
'use strict';

function buildDayTable(cookLines, events) {
  const byDay = new Map();
  function row(day) {
    if (!byDay.has(day)) byDay.set(day, {
      day, racksFullSpoken: 0, silenced: 0, cookLines: 0, workedLines: 0,
      workedRacksFull: 0, forageReturns: 0, forageReturnNames: [],
      forageKcal: 0, forageRedirects: 0, forageRedirectNames: [],
      forageRedirectAlts: [], gardenFishRedirects: 0, exemptLines: 0,
      restLines: 0, racksBoundLines: [], pantryFirst: null, pantryLast: null,
      preservedFirst: null, preservedLast: null, freshFirst: null,
      freshLast: null, throttleFirst: null, throttleLast: null,
      eligibleAny: false, eligibleKcalMax: 0, racksBound: false,
    });
    return byDay.get(day);
  }
  for (const c of (cookLines || [])) {
    const r = row(c.day);
    r.cookLines++;
    if (c.frame === 'worked') {
      r.workedLines++;
      if (c.racksFull) r.workedRacksFull++;
    }
    const isBound = (c.frame === 'racksFull') || (c.frame === 'plain' && c.racksFull);
    if (isBound) {
      r.racksBound = true;
      r.racksBoundLines.push(c);
      if (c.frame === 'racksFull') r.racksFullSpoken++;
      else r.silenced++;
      if (c.eligiblePresent) r.eligibleAny = true;
      if (c.eligibleKcal != null) r.eligibleKcalMax = Math.max(r.eligibleKcalMax, c.eligibleKcal);
      if (r.pantryFirst === null) {
        r.pantryFirst = c.pantryKcal; r.preservedFirst = c.preservedKcal;
        r.freshFirst = c.freshDays; r.throttleFirst = c.throttleEngaged;
      }
      r.pantryLast = c.pantryKcal; r.preservedLast = c.preservedKcal;
      r.freshLast = c.freshDays; r.throttleLast = c.throttleEngaged;
    }
  }
  for (const e of (events || [])) {
    const r = row(e.day);
    if (e.kind === 'forageReturn') {
      r.forageReturns++; r.forageKcal += (e.kcal || 0);
      if (e.name) r.forageReturnNames.push(e.name);
    } else if (e.kind === 'throttleRedirect') {
      if (e.fromTask === 'forage') {
        r.forageRedirects++;
        if (e.name) r.forageRedirectNames.push(e.name);
        if (e.altTask) r.forageRedirectAlts.push(e.altTask);
      } else {
        r.gardenFishRedirects++;
      }
    } else if (e.kind === 'throttleExempt') {
      r.exemptLines++;
    } else if (e.kind === 'fitnessRest') {
      r.restLines++;
    }
  }
  const days = [];
  for (const r of byDay.values()) {
    if (!r.racksBound) continue;
    const F = r.forageReturns, R = r.forageRedirects;
    let cls;
    if (F === 0 && R > 0) cls = 'S-THROTTLED';
    else if (F > 0 && R > 0) cls = 'S-THROTTLED-PARTIAL';
    else if (F > 0 && R === 0) cls = 'S-FORAGED';
    else cls = 'S-NO-FORAGE-DUTY';
    const assigned = Array.from(new Set([...r.forageReturnNames, ...r.forageRedirectNames]));
    days.push({
      day: r.day, class: cls,
      forageReturns: F, forageRedirects: R,
      assignedForage: assigned, assignedForageCount: assigned.length,
      forageReturnNames: r.forageReturnNames,
      forageRedirectNames: r.forageRedirectNames,
      forageRedirectAlts: r.forageRedirectAlts,
      forageKcal: r.forageKcal,
      gardenFishRedirects: r.gardenFishRedirects,
      exemptLines: r.exemptLines, restLines: r.restLines,
      racksFullSpoken: r.racksFullSpoken, silenced: r.silenced,
      cookLines: r.cookLines, workedLines: r.workedLines,
      workedRacksFull: r.workedRacksFull,
      pantryFirst: r.pantryFirst, pantryLast: r.pantryLast,
      preservedFirst: r.preservedFirst, preservedLast: r.preservedLast,
      freshFirst: r.freshFirst, freshLast: r.freshLast,
      throttleFirst: r.throttleFirst, throttleLast: r.throttleLast,
      eligibleAny: r.eligibleAny, eligibleKcalMax: r.eligibleKcalMax,
    });
  }
  days.sort((a, b) => a.day - b.day);
  return days;
}

module.exports = { buildDayTable };

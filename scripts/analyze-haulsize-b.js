#!/usr/bin/env node
// analyze-haulsize-b.js — haul-ceiling decomposition analyzer (DIAG).
// Reads a driver .jsonl (one JSON object per seed, stdout of
// haulsize-b-driver.js) and prints one summary JSON object per seed to
// stdout. Per-seed: live-return census (packcomp definitions), haul-size
// flag, per-day stopping classification (haulsize-b-lib), seed
// attribution, and forage/travel tick splits. Plants.json is read
// read-only for data calories / nut flags; missing data values are
// reported as null, never zero-filled, in the per-return rows (the
// summary combined then excludes that component and flags it).
'use strict';
const fs = require('fs');
const path = require('path');
const lib = require('./haulsize-b-lib');

let plants = null;
function plantData(pid) {
  try {
    if (!plants) plants = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'plants.json'), 'utf8'));
    if (Array.isArray(plants)) return plants.find((x) => x && x.id === pid) || null;
  } catch (e) {}
  return null;
}
function isNutPid(pid) {
  if (!pid) return false;
  if (pid === 'hickory_nut' || pid === 'acorn_white_oak') return true;
  const p = plantData(pid);
  return p ? /crack|shell|husk/i.test(p.preparation || '') : false;
}
function lumpValueOf(lump) {
  let total = 0, missing = false;
  for (const c of (lump || [])) {
    const p = plantData(c.pid);
    if (p && typeof p.caloriesPerUnit === 'number') {
      // Unknown nuts would shell at 0.75 like known nuts; unknown
      // non-nuts count at data calories. This is the packcomp (c)
      // value: each component in its final processed state.
      total += c.units * (isNutPid(c.pid) ? Math.round(p.caloriesPerUnit * 0.75) : p.caloriesPerUnit);
    } else missing = true;
  }
  return missing ? null : total;
}
function returnValue(packBefore) {
  // packBefore rows carry lump as [{pid, units}]; lib.summarizePack
  // wants lump as [{pid, units, dataCal}] — lumpValueOf above does its
  // own lookup, so pass rows through with a shim isUnprocessed: the
  // driver rows lack isUnprocessed; finished here = kcalEach > 0 AND
  // foodState NOT in_shell (packcomp's finished definition uses
  // Game.isUnprocessed, which for in-shell nuts is true; for lump
  // items kcalEach is 0 anyway). Approximation is documented: the
  // return combined is a tie-in census, not the judged metric.
  const rows = (packBefore || []).map((r) => ({
    kcalEach: r.kcalEach || 0, units: r.units || 0, foodKind: r.foodKind || null,
    foodState: r.foodState || null, hiddenKcal: r.hiddenKcal, plantId: r.plantId || null,
    lump: Array.isArray(r.lump) ? r.lump : null,
  }));
  const isUnproc = (it) => it.foodState === 'in_shell' || it.foodState === 'unprocessed';
  let unknownValue = null, missingUnknown = false;
  for (const r of rows) {
    if (Array.isArray(r.lump) && r.lump.length) {
      const v = lumpValueOf(r.lump);
      if (v == null) missingUnknown = true;
      else unknownValue = (unknownValue || 0) + v;
    }
  }
  const sum = lib.summarizePack(rows, isUnproc, () => 0); // lump handled above, not double-counted
  return { finishedKcal: sum.finishedKcal, shelledNet: sum.shelledNet,
    unknownValue, missingUnknown, combined: sum.finishedKcal + sum.shelledNet + (unknownValue || 0),
    nutUnits: sum.nutUnits, acornUnits: sum.acornUnits };
}

function analyzeSeed(inst) {
  const live = (inst.homecomings || []).filter((h) => !h.overAtEntry);
  const returns = live.map((h) => {
    const v = returnValue(h.packBefore);
    return { loopDay: h.loopDay, day: h.day, finished: v.finishedKcal, shelled: v.shelledNet,
      unknown: v.unknownValue, missingUnknown: v.missingUnknown, combined: v.combined,
      nutUnits: v.nutUnits, acornUnits: v.acornUnits, unload: h.unloadKcal || 0 };
  });
  const maxCombined = returns.length ? Math.max(...returns.map((r) => r.combined)) : 0;
  const haulSizeShaped = maxCombined < 2000;

  // Per-day decomposition.
  const dayRows = [];
  for (const day of (inst.days || [])) {
    const forages = day.forages || [];
    const successes = forages.filter((f) => f.ok);
    const attempts = forages.length;
    const failures = forages.filter((f) => !f.ok).map((f) => ({ say: (f.sayDuring || []).join(' ') }));
    const forageTicks = forages.reduce((t, f) => t + (f.ticksDelta || 0), 0);
    const travelTicks = (day.travels || []).reduce((t, tr) => t + (tr.ticksDelta || 0), 0);
    const tripSpan = (day.tripEnd && day.tripEnd.dayTicks != null && day.start && day.start.dayTicks != null)
      ? day.tripEnd.dayTicks - day.start.dayTicks : null;
    const endTicks = day.end ? day.end.dayTicks : null;
    const startTicks = day.start ? day.start.dayTicks : null;
    const daySpan = (endTicks != null && startTicks != null) ? endTicks - startTicks : null;
    // Species gained that day.
    let knownUnits = 0, unknownUnits = 0, nutUnits = 0, edibleKcal = 0, shelledKcal = 0, cells = 0;
    for (const f of forages) {
      if (f.tele && f.tele.cells != null) cells += f.tele.cells;
      for (const g of (f.unknownGains || [])) {
        unknownUnits += g.units || 0;
        if (isNutPid(g.plantId)) nutUnits += g.units || 0;
      }
      for (const row of (f.added || [])) {
        if (row.foodKind === 'nut') nutUnits += row.units || 0;
        if (row.known) knownUnits += row.units || 0;
        if (row.foodState === 'in_shell') shelledKcal += (row.units || 0) * lib.shelledNetEach(row.hiddenKcal, row.kcalEach);
        else if ((row.kcalEach || 0) > 0) edibleKcal += (row.units || 0) * row.kcalEach;
      }
    }
    dayRows.push({ loopDay: day.loopDay, attempts, successes: successes.length,
      failures, forageTicks, travelTicks, tripSpan, daySpan,
      startTicks, endTicks, tripEnd: !!day.tripEnd,
      tripEndTicks: day.tripEnd ? day.tripEnd.dayTicks : null,
      packKgAtTripEnd: day.tripEnd ? day.tripEnd.packKg : (day.end ? day.end.packKg : null),
      packCapAtTripEnd: day.tripEnd ? day.tripEnd.packCap : (day.end ? day.end.packCap : null),
      stockedRemaining: day.tripEnd ? (day.tripEnd.candidatesRemaining ? day.tripEnd.candidatesRemaining.length : null)
        : (day.end && day.end.candidates ? day.end.candidates.length : null),
      candidatesAtStart: day.start && day.start.candidates ? day.start.candidates.length : null,
      candidatesAtStartList: day.start ? day.start.candidates : null,
      secondTripAttempted: !!day.secondTripAttempted,
      knownUnits, unknownUnits, nutUnits, edibleKcal, shelledKcal, cells,
      startPos: day.start ? day.start.pos : null, endPos: day.end ? day.end.pos : null });
  }
  // Median trip span across successful-trip days (for OUT_OF_TIME).
  const spans = dayRows.filter((d) => d.successes > 0 && d.tripSpan != null).map((d) => d.tripSpan).sort((a, b) => a - b);
  const medianTripCost = spans.length ? spans[Math.floor(spans.length / 2)] : null;
  for (const d of dayRows) {
    const ticksRemaining = (d.tripEndTicks != null) ? 512 - d.tripEndTicks
      : (d.endTicks != null ? 512 - d.endTicks : null);
    d.ticksRemainingAtTripEnd = ticksRemaining;
    d.medianTripCost = medianTripCost;
    d.category = lib.classifyTripDay({ forageSuccesses: d.successes, forageAttempts: d.attempts,
      forageFailures: d.failures, packKgAtTripEnd: d.packKgAtTripEnd,
      packCapAtTripEnd: d.packCapAtTripEnd, stockedRemainingAtTripEnd: d.stockedRemaining,
      ticksRemainingAtTripEnd: ticksRemaining, medianTripCost,
      secondTripAttempted: d.secondTripAttempted });
  }
  const tripDays = dayRows.filter((d) => d.successes > 0);
  const attr = lib.attributeSeed(tripDays);
  const noTripDays = dayRows.filter((d) => d.category === 'NO_TRIP').length;
  const failedTripDays = dayRows.filter((d) => d.attempts > 0 && d.successes === 0).length;
  return { seed: inst.seed, daysAlive: inst.daysAlive, endReason: inst.endReason,
    gameDays: inst.gameDays, maxWaveUnlocked: inst.maxWaveUnlocked,
    liveReturns: live.length, maxCombined, haulSizeShaped,
    unloadTotal: returns.reduce((t, r) => t + r.unload, 0),
    medianTripCost, tripDays: tripDays.length, noTripDays, failedTripDays,
    attribution: attr, dayRows, returns };
}

function main() {
  const file = process.argv[2];
  if (!file) { console.error('usage: analyze-haulsize-b.js <jsonl>'); process.exit(2); }
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter((l) => l.trim());
  const out = [];
  for (const line of lines) {
    const inst = JSON.parse(line);
    const a = analyzeSeed(inst);
    out.push(a);
    console.error('haulsize seed=' + a.seed + ' liveReturns=' + a.liveReturns +
      ' maxCombined=' + a.maxCombined + ' haulSize=' + a.haulSizeShaped +
      ' tripDays=' + a.tripDays + ' noTrip=' + a.noTripDays +
      ' attr=' + (a.attribution.mechanism || ('UNATTRIBUTED:' + a.attribution.unattributedReason)) +
      ' share=' + a.attribution.share + ' n=' + a.attribution.n +
      ' medianTripCost=' + a.medianTripCost);
  }
  console.log(JSON.stringify(out, null, 2));
}

if (require.main === module) main();
module.exports = { analyzeSeed, returnValue, lumpValueOf, isNutPid };

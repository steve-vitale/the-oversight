#!/usr/bin/env node
// analyze-departdiag-b.js — departure-gate census analyzer (PURE READS).
// Implements exactly the prereg definitions (evidence/2026-10-31/
// sim-departdiag-b-prereg.md): startsAtHaven, departed, stay,
// away-origin, needTrip-false decomposition, stay gate classes, creek
// evenings (woodcarry bucket creek + rescued false, as in the strand
// censuses), stay-day activity classes (descriptive only; sense test
// reads the raw day lines).
// Usage: node scripts/analyze-departdiag-b.js <guardDir> <onDir> [--out <json>]
// Exit 0 always when both dirs read (verdict logic lives in the evidence
// file, judged against the prereg — this tool only counts).
'use strict';
const fs = require('fs');
const path = require('path');

function isAtHaven(pos) {
  if (!pos || typeof pos !== 'object') return false;
  if (pos.inside === true) return true;
  if (pos.tile === 'haven') return true;
  if (pos.mapPx !== null && pos.mapPx !== undefined && pos.mapPx === pos.havenPx
    && pos.mapPy !== null && pos.mapPy !== undefined && pos.mapPy === pos.havenPy) return true;
  return false;
}

function needTripDecomposition(dec) {
  const pantryKcal = dec.pantry ? dec.pantry.kcal : null;
  const vesselKcal = dec.morning ? dec.morning.kcal : null;
  const kcalCap = dec.kcalCap;
  const lastGive = dec.lastGiveDayBefore;
  const day = dec.day;
  const pantryOK = (pantryKcal === null ? null : pantryKcal >= 25000);
  const kcalOK = (vesselKcal === null || kcalCap === null ? null : vesselKcal >= kcalCap * 0.5);
  const giveOK = (lastGive === null || lastGive === undefined || day === null || day === undefined)
    ? null : (day - lastGive < 3);
  return { pantryKcal, vesselKcal, kcalCap, lastGiveDay: lastGive, day, pantryOK, kcalOK, giveOK };
}

function activityClass(dayLines, ctxDelta) {
  if (!dayLines || !dayLines.length) return 'silent';
  const text = dayLines.join(' ').toLowerCase();
  if (ctxDelta && ctxDelta.forageTrips > 0) return 'forage-trip';
  if (/forag/.test(text)) return 'forage-trip';
  // Assignment lines ("Fish. They'll report back by next part.") name a
  // task, not a fishing trip: check the assignment marker before the
  // fish keyword, or every assignment reads as a fishing day.
  if (/report back|assign/.test(text)) return 'assign';
  if (/garden|fish|trap|snare|\bsow\b/.test(text)) return 'garden-fish-trap';
  if (/talk|convers|gossip|\bask\b|tell/.test(text)) return 'talk';
  if (/eat|drink|rest|sleep|bean|water/.test(text)) return 'eat-drink-rest';
  return 'other';
}

// Gate class for one loop-day, given its decision record + evening record.
// Returns { kind, startsAtHaven, departed, stay, awayOrigin, ... }.
// kinds: departed-needtrip-true | departed-buffer-divergence |
//   stay-needtrip-false | stay-recovering | stay-day-trip-home |
//   stay-unknown-downstream | away-origin | game-over | no-evening |
function classifyDay(dec, eve) {
  const startsAtHaven = isAtHaven(dec.morning);
  if (!eve) return { kind: 'no-evening', startsAtHaven, departed: false, stay: false, awayOrigin: !startsAtHaven };
  if (eve.gameOver || eve.eveningOutcome === 'game-over') {
    return { kind: 'game-over', startsAtHaven, departed: false, stay: false, awayOrigin: !startsAtHaven };
  }
  const endsAtHaven = isAtHaven(eve);
  if (!startsAtHaven) return { kind: 'away-origin', startsAtHaven, departed: false, stay: false, awayOrigin: true };
  const departed = !endsAtHaven;
  if (departed) {
    if (dec.needTrip === false) return { kind: 'departed-buffer-divergence', startsAtHaven, departed: true, stay: false, awayOrigin: false };
    return { kind: 'departed-needtrip-true', startsAtHaven, departed: true, stay: false, awayOrigin: false };
  }
  // Stay day.
  if (dec.needTrip === false) return { kind: 'stay-needtrip-false', startsAtHaven, departed: false, stay: true, awayOrigin: false };
  if (dec.recovering === true) return { kind: 'stay-recovering', startsAtHaven, departed: false, stay: true, awayOrigin: false };
  if (dec.ctxDelta && dec.ctxDelta.forageTrips > 0) return { kind: 'stay-day-trip-home', startsAtHaven, departed: false, stay: true, awayOrigin: false };
  return { kind: 'stay-unknown-downstream', startsAtHaven, departed: false, stay: true, awayOrigin: false };
}

function analyzeSeed(inst) {
  const days = [];
  let departures = 0, stays = 0, awayOrigins = 0;
  const gateCounts = {};
  const activityCounts = {};
  let creekStill = 0, creekRescued = 0;
  const bump = (obj, k) => { obj[k] = (obj[k] || 0) + 1; };
  for (const dec of (inst.decisions || [])) {
    const eve = (inst.evenings || []).find((e) => e.loopDay === dec.loopDay) || null;
    const c = classifyDay(dec, eve);
    if (c.departed) departures++;
    if (c.stay) stays++;
    if (c.awayOrigin) awayOrigins++;
    bump(gateCounts, c.kind);
    if (c.stay) bump(activityCounts, activityClass(eve ? eve.dayLines : [], dec.ctxDelta));
    if (eve && eve.woodcarry) {
      if (eve.woodcarry.bucket === 'creek' && !eve.woodcarry.rescued) creekStill++;
      if (eve.woodcarry.bucket === 'creek' && eve.woodcarry.rescued) creekRescued++;
    }
    days.push({
      loopDay: dec.loopDay, gameDay: dec.day,
      startsAtHaven: c.startsAtHaven, kind: c.kind,
      needTrip: dec.needTrip, recovering: dec.recovering,
      pantryKcal: dec.pantry ? dec.pantry.kcal : null,
      vesselKcal: dec.morning ? dec.morning.kcal : null,
      kcalCap: dec.kcalCap, lastGiveDay: dec.lastGiveDayBefore,
      lastGiveDayAfter: dec.lastGiveDayAfter,
      needTripDecomp: needTripDecomposition(dec),
      eveningTile: eve ? eve.tile : null,
      eveningOutcome: eve ? eve.eveningOutcome : null,
      eveningMap: eve ? [eve.mapPx, eve.mapPy] : null,
      eveningInside: eve ? eve.inside : null,
      activity: c.stay ? activityClass(eve ? eve.dayLines : [], dec.ctxDelta) : null,
      forageTripsDelta: dec.ctxDelta ? dec.ctxDelta.forageTrips : null,
    });
  }
  const firstDepart = days.find((d) => d.kind === 'departed-needtrip-true' || d.kind === 'departed-buffer-divergence');
  return {
    seed: inst.seed, woodwarm: inst.woodwarm,
    daysAlive: inst.daysAlive, endReason: inst.endReason, errCount: inst.errCount,
    decisions: (inst.decisions || []).length, evenings: (inst.evenings || []).length,
    departures, stays, awayOrigins, gateCounts, activityCounts,
    creekStill, creekRescued,
    firstDepartureLoopDay: firstDepart ? firstDepart.loopDay : null,
    spawnVessel: inst.spawn && inst.spawn.pos ? inst.spawn.pos.vesselId : null,
    days,
  };
}

function loadDir(dir) {
  const files = fs.readdirSync(dir).filter((f) => /^departdiag-b-nighttravel-s\d+\.json$/.test(f)).sort();
  return files.map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
}

function main() {
  const args = process.argv.slice(2);
  const guardDir = args[0], onDir = args[1];
  if (!guardDir || !onDir) { console.error('usage: analyze-departdiag-b.js <guardDir> <onDir> [--out <json>]'); process.exit(2); }
  const outIdx = args.indexOf('--out');
  const outPath = outIdx >= 0 ? args[outIdx + 1] : null;
  const census = { guard: loadDir(guardDir).map(analyzeSeed), on: loadDir(onDir).map(analyzeSeed) };
  const summarize = (rows) => {
    const tot = { seeds: rows.length, departures: 0, stays: 0, awayOrigins: 0, creekStill: 0, creekRescued: 0, gateCounts: {}, activityCounts: {} };
    for (const r of rows) {
      tot.departures += r.departures; tot.stays += r.stays; tot.awayOrigins += r.awayOrigins;
      tot.creekStill += r.creekStill; tot.creekRescued += r.creekRescued;
      for (const [k, v] of Object.entries(r.gateCounts)) tot.gateCounts[k] = (tot.gateCounts[k] || 0) + v;
      for (const [k, v] of Object.entries(r.activityCounts)) tot.activityCounts[k] = (tot.activityCounts[k] || 0) + v;
    }
    return tot;
  };
  const result = { guard: census.guard, on: census.on, totals: { guard: summarize(census.guard), on: summarize(census.on) } };
  if (outPath) fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result.totals, null, 2));
  for (const leg of ['guard', 'on']) {
    for (const r of census[leg]) {
      console.log(leg + ' seed=' + r.seed + ' departures=' + r.departures + ' stays=' + r.stays + ' away=' + r.awayOrigins + ' creekStill=' + r.creekStill + ' firstDepart=' + r.firstDepartureLoopDay + ' daysAlive=' + r.daysAlive + ' errs=' + r.errCount);
    }
  }
}

if (require.main === module) main();

module.exports = { isAtHaven, needTripDecomposition, activityClass, classifyDay, analyzeSeed };

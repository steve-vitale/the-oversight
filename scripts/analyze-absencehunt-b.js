#!/usr/bin/env node
// analyze-absencehunt-b.js — overnight-absence census analyzer (DIAG ONLY).
// Implements the prereg definitions EXACTLY (evidence/2026-10-31/
// sim-absencehunt-b-prereg.md). Reads one corpus dir of per-seed JSON
// files (as written by scripts/split-absencehunt-jsonl-b.js) and writes
// a census JSON to <outFile>.
// Usage: node scripts/analyze-absencehunt-b.js <corpusDir> <outFile>
//
// Definitions:
// - atHaven(pos): pos.inside true OR pos.tile 'haven' OR map position
//   equals the village (px, py) node. Haven-checked; primary.
// - eveningAway: evening snap NOT atHaven.
// - onRoad: evening roadActive OR roadOnRoad true.
// - genuine: eveningAway AND NOT onRoad AND (following morning away
//   OR no following morning because the run ended that night).
// - sleepReturn: eveningAway AND following morning at haven (artifact,
//   excluded from genuine, reported separately).
// - departure: haven-morning -> away-evening transition, haven-board
//   only; road transitions counted separately.
// - dayTrip: starts haven, ends haven, outward evidence (forageTrips
//   delta > 0 OR patrols delta > 0 OR >= 1 travel-leg line).
// - multiHop: starts haven, ends haven, forageTrips delta == 0 AND
//   patrols delta == 0 AND >= 4 travel-leg lines.
// - travel-leg line: /travel \d+ tile|walk back into haven|you walk|walked to/i
// - awayOriginDay: a morning away (continuation, not a departure).
// - P1 raw bucket: woodcarry bucket 'creek' evenings (raw) vs
//   haven-checked genuine/creek evenings; both reported.
'use strict';
const fs = require('fs');
const path = require('path');

const TRAVEL_RE = /travel \d+ tile|walk back into haven|you walk|walked to/i;

function atHaven(pos) {
  if (!pos) return false;
  if (pos.inside === true) return true;
  if (pos.tile === 'haven') return true;
  if (pos.mapPx !== null && pos.mapPx !== undefined && pos.havenPx !== null && pos.havenPx !== undefined &&
      pos.mapPx === pos.havenPx && pos.mapPy === pos.havenPy) return true;
  return false;
}

function travelLegLines(dayLines) {
  if (!Array.isArray(dayLines)) return 0;
  let n = 0;
  for (const l of dayLines) { if (typeof l === 'string' && TRAVEL_RE.test(l)) n++; }
  return n;
}

function classifySeed(inst) {
  const days = [];
  const decisions = inst.decisions || [];
  const evenings = inst.evenings || [];
  const n = Math.max(decisions.length, evenings.length);
  for (let i = 0; i < n; i++) {
    const dec = decisions[i] || {};
    const eve = evenings[i] || {};
    const morning = dec.morning || null;
    const startsHaven = atHaven(morning);
    const endsHaven = atHaven(eve);
    const eveningAway = !endsHaven;
    const onRoad = !!(eve.roadActive || eve.roadOnRoad);
    const nextMorning = decisions[i + 1] ? decisions[i + 1].morning : null;
    const hasNextMorning = !!decisions[i + 1];
    const nextMorningAway = hasNextMorning ? !atHaven(nextMorning) : null;
    const delta = dec.ctxDelta || eve.ctxDelta || {};
    const forageDelta = delta.forageTrips || 0;
    const patrolDelta = delta.patrols || 0;
    const travelLines = travelLegLines(eve.dayLines);
    const outward = forageDelta > 0 || patrolDelta > 0 || travelLines >= 1;
    let cls = 'stay';
    if (startsHaven && eveningAway && onRoad) cls = 'road-absence';
    else if (startsHaven && eveningAway && !onRoad) {
      if (!hasNextMorning) cls = 'genuine-end-of-run';
      else if (nextMorningAway) cls = 'genuine';
      else cls = 'sleep-return';
    } else if (!startsHaven && eveningAway) cls = 'away-continuation';
    else if (!startsHaven && endsHaven) cls = 'away-return';
    else if (startsHaven && endsHaven && outward) {
      if (forageDelta === 0 && patrolDelta === 0 && travelLines >= 4) cls = 'multi-hop';
      else cls = 'day-trip';
    }
    const wc = eve.woodcarry || null;
    const rawCreek = !!(wc && wc.bucket === 'creek');
    const rawRescued = !!(wc && wc.rescued);
    days.push({
      loopDay: dec.loopDay || eve.loopDay || (i + 1),
      startsHaven, endsHaven, eveningAway, onRoad,
      hasNextMorning, nextMorningAway,
      class: cls,
      eveningOutcome: eve.eveningOutcome || null,
      eveningTile: eve.tile || null,
      eveningInside: eve.inside ?? null,
      eveningMap: [eve.mapPx ?? null, eve.mapPy ?? null],
      morningTile: morning ? (morning.tile || null) : null,
      forageDelta, patrolDelta, travelLines,
      rawCreek, rawRescued,
      inCombat: !!eve.inCombat,
    });
  }
  const count = (c) => days.filter((d) => d.class === c).length;
  const genuineDays = days.filter((d) => d.class === 'genuine' || d.class === 'genuine-end-of-run');
  return {
    seed: inst.seed,
    policy: inst.policy,
    days: inst.days || null,
    daysAlive: inst.daysAlive ?? null,
    endReason: inst.endReason || null,
    errCount: inst.errCount ?? null,
    loopDays: n,
    genuine: genuineDays.length,
    genuineDays: genuineDays.map((d) => d.loopDay),
    departures: count('genuine') + count('genuine-end-of-run') + count('sleep-return'),
    roadAbsences: count('road-absence'),
    sleepReturns: count('sleep-return'),
    dayTrips: count('day-trip'),
    multiHop: count('multi-hop'),
    awayOriginDays: days.filter((d) => !d.startsHaven).length,
    awayContinuations: count('away-continuation'),
    awayReturns: count('away-return'),
    stays: count('stay'),
    rawCreekEvenings: days.filter((d) => d.rawCreek).length,
    rawCreekDays: days.filter((d) => d.rawCreek).map((d) => d.loopDay),
    havenCheckedCreekEvenings: days.filter((d) => d.rawCreek && d.eveningAway && !d.onRoad).length,
    days,
  };
}

function analyzeDir(corpusDir) {
  const files = fs.readdirSync(corpusDir).filter((f) => f.endsWith('.json')).sort();
  const perSeed = [];
  for (const f of files) {
    const inst = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8'));
    perSeed.push(classifySeed(inst));
  }
  const sum = (k) => perSeed.reduce((t, s) => t + (s[k] || 0), 0);
  const seedsWithGenuine = perSeed.filter((s) => s.genuine > 0).map((s) => s.seed);
  return {
    corpusDir,
    policy: perSeed.length ? perSeed[0].policy : null,
    days: perSeed.length ? perSeed[0].days : null,
    legs: perSeed.length,
    seeds: perSeed.map((s) => s.seed),
    totalGenuine: sum('genuine'),
    seedsWithGenuine,
    totalDepartures: sum('departures'),
    totalRoadAbsences: sum('roadAbsences'),
    totalSleepReturns: sum('sleepReturns'),
    totalDayTrips: sum('dayTrips'),
    totalMultiHop: sum('multiHop'),
    totalAwayOriginDays: sum('awayOriginDays'),
    totalAwayContinuations: sum('awayContinuations'),
    totalAwayReturns: sum('awayReturns'),
    totalStays: sum('stays'),
    totalRawCreekEvenings: sum('rawCreekEvenings'),
    totalHavenCheckedCreekEvenings: sum('havenCheckedCreekEvenings'),
    totalErrs: sum('errCount'),
    perSeed,
  };
}

if (require.main === module) {
  const dir = process.argv[2];
  const out = process.argv[3];
  if (!dir || !out) { console.error('usage: analyze-absencehunt-b.js <corpusDir> <outFile>'); process.exit(2); }
  const census = analyzeDir(dir);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(census, null, 2));
  console.log('census: ' + census.legs + ' legs policy=' + census.policy + ' days=' + census.days +
    ' genuine=' + census.totalGenuine + ' seedsWithGenuine=' + JSON.stringify(census.seedsWithGenuine) +
    ' dayTrips=' + census.totalDayTrips + ' multiHop=' + census.totalMultiHop +
    ' road=' + census.totalRoadAbsences + ' sleepReturns=' + census.totalSleepReturns +
    ' rawCreek=' + census.totalRawCreekEvenings + ' checkedCreek=' + census.totalHavenCheckedCreekEvenings);
}

module.exports = { atHaven, travelLegLines, classifySeed, analyzeDir, TRAVEL_RE };

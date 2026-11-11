// travelfirst-analyze-20261110.js — travel/roads first-numbers analyzer
// (arm sim-travelfirst-a). Reads evidence/2026-11-10/perseed-travelfirst-a/
// control-leg JSON (+ neutral-leg JSON for the neutrality check) and
// prints per-seed + pooled tables as JSON.
// Usage: node scripts/travelfirst-analyze-20261110.js [--out <summary.json>]
//   [--dir <perseed-dir>] [--run <run-tag>] [--mode control]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const args = process.argv.slice(2);
function argVal(flag, def) {
  const i = args.indexOf(flag);
  return (i >= 0 && args[i + 1]) ? args[i + 1] : def;
}
const DIR = argVal('--dir', path.join(REPO, 'evidence', '2026-11-10', 'perseed-travelfirst-a'));
const RUN = argVal('--run', 'travelfirst-pilot');
const MODE = argVal('--mode', 'control');
const OUT = argVal('--out', null);

const TI = require(path.join(REPO, 'scripts', 'travelfirst-instrument-20261110'));
const classifyEvening = TI.classifyEvening;

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const n = s.length;
  return (n % 2) ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}
function mean(xs) {
  if (!xs.length) return null;
  return xs.reduce(function (a, b) { return a + b; }, 0) / xs.length;
}
function bump(obj, k, n) { obj[k] = (obj[k] || 0) + (n === undefined ? 1 : n); }

if (require.main !== module) { module.exports = { classifyEvening: classifyEvening, median: median, mean: mean }; return; }

function loadLeg(mode) {
  const files = fs.readdirSync(DIR)
    .filter(function (f) { return f.indexOf('travelfirst-s') === 0 && f.indexOf('-' + RUN + '-' + mode + '.json') !== -1; })
    .sort();
  return files.map(function (f) { return { file: f, o: JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')) }; });
}

const control = loadLeg(MODE);
if (!control.length) { console.error('TRAVELFIRST-ANALYZE STOP: no control files in ' + DIR); process.exit(2); }

const perSeed = [];
const pooled = {
  seeds: control.length,
  travelToTotal: 0, travelToByOutcome: {}, travelToByCaller: {}, travelToByCallerOutcome: {},
  travelToByBlockType: {}, travelToBlockedIntermediate: 0, travelToBlockedDestination: 0,
  travelToOtherRaw: [], travelToVia: {},
  trips: 0, tripSteps: [],
  maxCheb: 0, beyondMoved: 0, beyondAttempts: 0, nodeExitsMoved: 0, nodeExitsTotal: 0,
  walkHomes: 0, walkHomesReached: 0, walkHomeSteps: 0, walkHomeBlockedTypes: {}, walkHomeInterrupted: {},
  policyWalkHomeCalls: 0, policyWalkHomeByOutcome: {}, routeAroundCalls: 0,
  awayEvenings: 0, awayCause: {}, withinReachEvenings: 0, scholarDaysAway: 0, scholarDaysHaven: 0,
  strandRuns: [], maxStrand: 0, snapshotDays: 0, snapshotCoverage: [],
  blockedByType: {}, blockedTotal: 0,
  departures: 0, departuresByPurpose: {}, returns: 0, returnsByPurpose: {}, hurtReturns: 0,
  awayDaysByPurpose: {}, awayDaysTotal: 0, rosterDays: 0, maxNodeDistByVid: {},
  objectivesLast: {},
  roadLegCalls: {}, roadActiveDays: 0, roadLegIndexMax: 0,
  deathsInstrument: 0, deathsHarness: 0, deathsReconciled: 0,
  scholarDeaths: 0, scholarDeathsAway: 0, scholarDeathsHaven: 0,
  villagerDeaths: 0, villagerDeathsAway: 0, villagerDeathsHaven: 0,
  monsterDeaths: 0, pitTrapDeaths: 0,
  deathCausesAway: {}, deathCausesHaven: {},
  stepsPerDay: [], dayTicksEnd: [], dayTicksAtCap: 0,
  partsWithTravel: 0, partsObserved: 0, partsAway: 0,
  instrumentErrors: 0, wrapLive: {},
  wall: { wins: 0, national: 0, table: 0, wave4: 0, wave5: 0, regional: 0, survivals: [], deaths: 0, standings: [] },
};

for (const entry of control) {
  const o = entry.o;
  const s = {
    seed: o.seed, days: o.days, gameDays: o.gameDays, endReason: o.endReason,
    won: o.won, villageLost: o.villageLost, scaleRank: o.scaleRank,
    maxWave: o.maxWave, standing: o.standing, deaths: o.deaths.length,
    endPantryKcal: o.endPantryKcal, errors: o.instrumentErrors.length,
  };
  pooled.instrumentErrors += o.instrumentErrors.length;
  for (const w of Object.keys(o.wrapLive || {})) if (o.wrapLive[w]) pooled.wrapLive[w] = (pooled.wrapLive[w] || 0) + 1;

  // ---- Metric 1: travelTo ----
  const calls = o.travelTo || [];
  s.travelToTotal = calls.length;
  pooled.travelToTotal += calls.length;
  s.byOutcome = {}; s.byCaller = {}; s.byCallerOutcome = {}; s.byBlockType = {};
  s.blockedIntermediate = 0; s.blockedDestination = 0;
  const byDay = {};
  const partsWithTravel = {};
  let maxCheb = 0, beyondMoved = 0, beyondAttempts = 0;
  for (const c of calls) {
    bump(s.byOutcome, c.outcome); bump(pooled.travelToByOutcome, c.outcome);
    bump(s.byCaller, c.caller); bump(pooled.travelToByCaller, c.caller);
    const ck = c.caller + '|' + c.outcome;
    bump(s.byCallerOutcome, ck); bump(pooled.travelToByCallerOutcome, ck);
    if (c.via) { bump(s.via = s.via || {}, c.via); bump(pooled.travelToVia, c.via); }
    if (c.caller === 'other') pooled.travelToOtherRaw.push({ seed: o.seed, day: c.day, via: c.via, outcome: c.outcome, from: c.from, to: c.to });
    if (c.outcome === 'blocked') {
      bump(s.byBlockType, c.blockType || 'unknown'); bump(pooled.travelToByBlockType, c.blockType || 'unknown');
      bump(pooled.blockedByType, c.blockType || 'unknown');
      pooled.blockedTotal++;
      if (c.intermediate) { s.blockedIntermediate++; pooled.travelToBlockedIntermediate++; }
      else { s.blockedDestination++; pooled.travelToBlockedDestination++; }
    }
    if (c.outcome === 'moved' && c.movedTo) {
      const hv = { x: 4, y: 4 };
      const d = Math.max(Math.abs((c.movedTo.x || 0) - hv.x), Math.abs((c.movedTo.y || 0) - hv.y));
      if (d > maxCheb) maxCheb = d;
    }
    if (c.to && (c.to.x < 0 || c.to.x > 8 || c.to.y < 0 || c.to.y > 8)) {
      beyondAttempts++;
      if (c.outcome === 'moved') beyondMoved++;
    }
    byDay[c.day] = (byDay[c.day] || 0) + 1;
    if (c.part !== null && c.part !== undefined) partsWithTravel[c.day + ':' + c.part] = true;
  }
  s.maxChebFromTravel = maxCheb;
  s.beyondMoved = beyondMoved; s.beyondAttempts = beyondAttempts;
  pooled.beyondMoved += beyondMoved; pooled.beyondAttempts += beyondAttempts;
  if (maxCheb > pooled.maxCheb) pooled.maxCheb = maxCheb;
  // Trips: maximal runs of consecutive calls with same day+part+caller.
  let trips = 0; const tripSteps = [];
  let runKey = null, runLen = 0;
  for (const c of calls) {
    const k = c.day + ':' + c.part + ':' + c.caller;
    if (k === runKey) { runLen++; }
    else { if (runKey !== null) { trips++; tripSteps.push(runLen); } runKey = k; runLen = 1; }
  }
  if (runKey !== null) { trips++; tripSteps.push(runLen); }
  s.trips = trips; s.tripStepsMean = mean(tripSteps); s.tripStepsMax = tripSteps.length ? Math.max.apply(null, tripSteps) : 0;
  pooled.trips += trips; pooled.tripSteps = pooled.tripSteps.concat(tripSteps);
  s.stepsPerDay = {};
  for (const d of Object.keys(byDay)) s.stepsPerDay[d] = byDay[d];
  const stepsArr = Object.keys(byDay).map(function (d) { return byDay[d]; });
  s.stepsPerDayMean = mean(stepsArr); s.stepsPerDayMax = stepsArr.length ? Math.max.apply(null, stepsArr) : 0;
  pooled.stepsPerDay = pooled.stepsPerDay.concat(stepsArr);
  s.partsWithTravel = Object.keys(partsWithTravel).length;
  pooled.partsWithTravel += s.partsWithTravel;
  // Node exits.
  s.nodeExits = (o.nodeExits || []).length;
  s.nodeExitsMoved = (o.nodeExits || []).filter(function (x) { return x.result === 'moved'; }).length;
  pooled.nodeExitsTotal += s.nodeExits; pooled.nodeExitsMoved += s.nodeExitsMoved;

  // ---- Metric 2: engine walkHome + policy walkHome ----
  const wh = o.walkHomes || [];
  s.walkHomes = wh.length; s.walkHomesReached = wh.filter(function (x) { return x.reached; }).length;
  s.walkHomeSteps = wh.reduce(function (a, x) { return a + (x.steps || 0); }, 0);
  s.walkHomeBlockedTypes = {}; s.walkHomeInterrupted = {};
  for (const x of wh) {
    bump(s.walkHomeBlockedTypes, x.blockedType || 'none');
    bump(s.walkHomeInterrupted, x.interrupted || 'none');
    bump(pooled.walkHomeBlockedTypes, x.blockedType || 'none');
    bump(pooled.walkHomeInterrupted, x.interrupted || 'none');
  }
  pooled.walkHomes += s.walkHomes; pooled.walkHomesReached += s.walkHomesReached; pooled.walkHomeSteps += s.walkHomeSteps;
  s.policyWalkHomeCalls = calls.filter(function (c) { return c.caller === 'policy-walkHome'; }).length;
  s.policyWalkHomeByOutcome = {};
  for (const c of calls) if (c.caller === 'policy-walkHome') bump(s.policyWalkHomeByOutcome, c.outcome);
  pooled.policyWalkHomeCalls += s.policyWalkHomeCalls;
  for (const k of Object.keys(s.policyWalkHomeByOutcome)) bump(pooled.policyWalkHomeByOutcome, k, s.policyWalkHomeByOutcome[k]);
  s.routeAroundCalls = calls.filter(function (c) { return c.via === 'routeAround'; }).length;
  pooled.routeAroundCalls += s.routeAroundCalls;

  // ---- Metric 3: away evenings (snapshot days, deduped by day, last wins) ----
  const daily = o.daily || [];
  const byDaySnap = {};
  for (const snap of daily) byDaySnap[snap.day] = snap;
  const snapDays = Object.keys(byDaySnap).map(function (d) { return parseInt(d, 10); }).sort(function (a, b) { return a - b; });
  s.snapshotDays = snapDays.length;
  pooled.snapshotDays += snapDays.length;
  s.snapshotCoverage = snapDays.length + '/' + (o.gameDays || o.days);
  pooled.snapshotCoverage.push(s.snapshotCoverage);
  // Blocked travelTo per day + combat days (from tele combats).
  const blockedDays = {};
  for (const c of calls) if (c.outcome === 'blocked') blockedDays[c.day] = true;
  const combatDays = {};
  for (const cb of (o.combats || [])) if (cb.type === 'combat_start') combatDays[cb.day] = true;
  let awayEvenings = 0, withinReach = 0, scholarAway = 0, scholarHaven = 0;
  const cause = {};
  let run = 0; const strandRuns = [];
  let maxChebSnap = 0;
  for (const d of snapDays) {
    const snap = byDaySnap[d];
    if (snap.cheb !== null && snap.cheb !== undefined && snap.cheb > maxChebSnap) maxChebSnap = snap.cheb;
    if (snap.atHaven) { scholarHaven++; if (run > 0) { strandRuns.push(run); run = 0; } continue; }
    scholarAway++;
    awayEvenings++;
    run++;
    const bucket = classifyEvening({
      inCombat: !!snap.inCombat,
      inTent: !!snap.insideTent,
      havenKnown: snap.havenKnown !== false,
      travelOffered: !!snap.travelOffered,
      blockedToday: !!blockedDays[d],
    });
    bump(cause, bucket); bump(pooled.awayCause, bucket);
    if (bucket === 'within-reach') withinReach++;
  }
  if (run > 0) strandRuns.push(run);
  s.awayEvenings = awayEvenings; s.awayCause = cause; s.withinReach = withinReach;
  s.scholarDaysAway = scholarAway; s.scholarDaysHaven = scholarHaven;
  s.strandRuns = strandRuns; s.maxStrand = strandRuns.length ? Math.max.apply(null, strandRuns) : 0;
  s.maxChebSnap = maxChebSnap;
  s.maxCheb = Math.max(maxCheb, maxChebSnap);
  pooled.awayEvenings += awayEvenings; pooled.withinReachEvenings += withinReach;
  pooled.scholarDaysAway += scholarAway; pooled.scholarDaysHaven += scholarHaven;
  pooled.strandRuns = pooled.strandRuns.concat(strandRuns);
  if (s.maxStrand > pooled.maxStrand) pooled.maxStrand = s.maxStrand;

  // ---- Metric 5: villager travel ----
  const trips5 = o.villagerTrips || { departures: [], returns: [] };
  s.departures = (trips5.departures || []).length;
  s.returns = (trips5.returns || []).length;
  s.departuresByPurpose = {}; s.returnsByPurpose = {}; s.hurtReturns = 0;
  for (const dep of (trips5.departures || [])) { bump(s.departuresByPurpose, dep.purpose || 'unknown'); bump(pooled.departuresByPurpose, dep.purpose || 'unknown'); }
  for (const ret of (trips5.returns || [])) {
    bump(s.returnsByPurpose, ret.purpose || 'unknown'); bump(pooled.returnsByPurpose, ret.purpose || 'unknown');
    if (ret.hurtReturn) s.hurtReturns++;
  }
  pooled.departures += s.departures; pooled.returns += s.returns; pooled.hurtReturns += s.hurtReturns;
  // Away-days per purpose from snapshots (one snapshot-day per away vid).
  s.awayDaysByPurpose = {}; s.awayDaysTotal = 0; s.rosterDays = 0;
  const maxNodeDist = {};
  for (const d of snapDays) {
    const snap = byDaySnap[d];
    s.rosterDays += (snap.roster || 0);
    for (const vid of Object.keys(snap.away || {})) {
      const p = (snap.away[vid] || {}).purpose || 'unknown';
      bump(s.awayDaysByPurpose, p); bump(pooled.awayDaysByPurpose, p);
      s.awayDaysTotal++; pooled.awayDaysTotal++;
    }
    const hv = snap.haven || { x: 4, y: 4 };
    for (const vid of Object.keys(snap.nodes || {})) {
      const n = snap.nodes[vid];
      if (!n) continue;
      const dist = Math.max(Math.abs(n[0] - hv.x), Math.abs(n[1] - hv.y));
      if (maxNodeDist[vid] === undefined || dist > maxNodeDist[vid]) maxNodeDist[vid] = dist;
    }
  }
  pooled.rosterDays += s.rosterDays;
  s.maxNodeDist = maxNodeDist;
  for (const vid of Object.keys(maxNodeDist)) {
    if (pooled.maxNodeDistByVid[vid] === undefined || maxNodeDist[vid] > pooled.maxNodeDistByVid[vid]) pooled.maxNodeDistByVid[vid] = maxNodeDist[vid];
  }
  // Objectives at last snapshot.
  const lastSnap = snapDays.length ? byDaySnap[snapDays[snapDays.length - 1]] : null;
  s.objectivesLast = {};
  if (lastSnap) {
    for (const vid of Object.keys(lastSnap.objectives || {})) {
      const ob = lastSnap.objectives[vid];
      if (!ob) continue;
      bump(s.objectivesLast, (ob[0] || 'unknown') + '/' + (ob[1] || 'unknown') + '/' + (ob[2] || 'unknown'));
    }
  }
  for (const k of Object.keys(s.objectivesLast)) bump(pooled.objectivesLast, k, s.objectivesLast[k]);

  // ---- Metric 6: road legs ----
  s.roadLegs = {};
  for (const rl of (o.roadLegs || [])) bump(s.roadLegs, rl.verb);
  for (const k of Object.keys(s.roadLegs)) bump(pooled.roadLegCalls, k, s.roadLegs[k]);
  s.roadActiveDays = 0; s.roadLegIndexMax = 0;
  for (const d of snapDays) {
    const snap = byDaySnap[d];
    if (snap.road && snap.road.active) {
      s.roadActiveDays++;
      if (typeof snap.road.legIndex === 'number' && snap.road.legIndex > s.roadLegIndexMax) s.roadLegIndexMax = snap.road.legIndex;
    }
  }
  pooled.roadActiveDays += s.roadActiveDays;
  if (s.roadLegIndexMax > pooled.roadLegIndexMax) pooled.roadLegIndexMax = s.roadLegIndexMax;

  // ---- Metric 7: deaths by position ----
  const dp = o.deathsByPosition || [];
  s.deathsInstrument = dp.length; s.deathsHarness = o.deaths.length;
  pooled.deathsInstrument += s.deathsInstrument; pooled.deathsHarness += s.deathsHarness;
  if (s.deathsInstrument === s.deathsHarness) pooled.deathsReconciled++;
  s.scholarDeaths = 0; s.scholarDeathsAway = 0; s.scholarDeathsHaven = 0;
  s.villagerDeaths = 0; s.villagerDeathsAway = 0; s.villagerDeathsHaven = 0;
  s.monsterDeaths = 0; s.pitTrapDeaths = 0;
  s.deathCausesAway = {}; s.deathCausesHaven = {};
  for (const d of dp) {
    const isScholar = !!(d.playerArg || d.whoIsBearer);
    const isMonster = (d.kind === 'monster' || d.kind === 'animal');
    const away = (d.cheb || 0) > 0;
    if (d.cause === 'your own pit trap') s.pitTrapDeaths++;
    if (isMonster) { s.monsterDeaths++; continue; }
    if (isScholar) {
      s.scholarDeaths++;
      if (away) { s.scholarDeathsAway++; bump(s.deathCausesAway, d.cause || 'unknown'); }
      else { s.scholarDeathsHaven++; bump(s.deathCausesHaven, d.cause || 'unknown'); }
    } else {
      s.villagerDeaths++;
      if (away) { s.villagerDeathsAway++; bump(s.deathCausesAway, d.cause || 'unknown'); }
      else { s.villagerDeathsHaven++; bump(s.deathCausesHaven, d.cause || 'unknown'); }
    }
  }
  pooled.scholarDeaths += s.scholarDeaths; pooled.scholarDeathsAway += s.scholarDeathsAway; pooled.scholarDeathsHaven += s.scholarDeathsHaven;
  pooled.villagerDeaths += s.villagerDeaths; pooled.villagerDeathsAway += s.villagerDeathsAway; pooled.villagerDeathsHaven += s.villagerDeathsHaven;
  pooled.monsterDeaths += s.monsterDeaths; pooled.pitTrapDeaths += s.pitTrapDeaths;
  for (const k of Object.keys(s.deathCausesAway)) bump(pooled.deathCausesAway, k, s.deathCausesAway[k]);
  for (const k of Object.keys(s.deathCausesHaven)) bump(pooled.deathCausesHaven, k, s.deathCausesHaven[k]);

  // ---- Metric 8: travel time cost ----
  s.dayTicksEnd = [];
  s.dayTicksAtCap = 0;
  for (const d of snapDays) {
    const snap = byDaySnap[d];
    if (typeof snap.dayTicks === 'number') {
      s.dayTicksEnd.push(snap.dayTicks);
      if (snap.dayTicks >= 512) s.dayTicksAtCap++;
    }
  }
  s.dayTicksMean = mean(s.dayTicksEnd); s.dayTicksMedian = median(s.dayTicksEnd);
  pooled.dayTicksEnd = pooled.dayTicksEnd.concat(s.dayTicksEnd);
  pooled.dayTicksAtCap += s.dayTicksAtCap;
  const pp = o.partPositions || [];
  s.partsObserved = pp.length;
  s.partsAway = pp.filter(function (x) { return !x.atHaven; }).length;
  pooled.partsObserved += s.partsObserved; pooled.partsAway += s.partsAway;

  // ---- Metric 9: wall ----
  if (o.won) pooled.wall.wins++;
  if (o.scaleRank === 'national' || o.scaleRank === 'galactic') pooled.wall.national++;
  if (o.scaleRank === 'table' || o.scaleRank === 'galactic') pooled.wall.table++;
  if (o.scaleRank === 'regional' || o.scaleRank === 'national' || o.scaleRank === 'table' || o.scaleRank === 'galactic') pooled.wall.regional++;
  if ((o.maxWave || 1) >= 4) pooled.wall.wave4++;
  if ((o.maxWave || 1) >= 5) pooled.wall.wave5++;
  pooled.wall.survivals.push(o.days);
  pooled.wall.deaths += o.deaths.length;
  pooled.wall.standings.push(o.standing);

  perSeed.push(s);
}

pooled.wall.survivals.sort(function (a, b) { return a - b; });
pooled.wall.medianSurvival = median(pooled.wall.survivals);
pooled.wall.villageLost = perSeed.filter(function (s) { return s.villageLost; }).length;
pooled.tripStepsMean = mean(pooled.tripSteps);
pooled.tripStepsMax = pooled.tripSteps.length ? Math.max.apply(null, pooled.tripSteps) : 0;
pooled.stepsPerDayMean = mean(pooled.stepsPerDay);
pooled.stepsPerDayMax = pooled.stepsPerDay.length ? Math.max.apply(null, pooled.stepsPerDay) : 0;
pooled.dayTicksMean = mean(pooled.dayTicksEnd);
pooled.dayTicksMedian = median(pooled.dayTicksEnd);
pooled.maxStrand = pooled.strandRuns.length ? Math.max.apply(null, pooled.strandRuns) : 0;
pooled.awayEveningShare = (pooled.scholarDaysAway + pooled.scholarDaysHaven) ? pooled.scholarDaysAway / (pooled.scholarDaysAway + pooled.scholarDaysHaven) : null;
pooled.blockedPathShareOfAway = pooled.awayEvenings ? (pooled.awayCause['blocked-path'] || 0) / pooled.awayEvenings : null;
pooled.withinReachShareOfAway = pooled.awayEvenings ? pooled.withinReachEvenings / pooled.awayEvenings : null;
pooled.rosterAwayShare = pooled.rosterDays ? pooled.awayDaysTotal / pooled.rosterDays : null;
pooled.partsAwayShare = pooled.partsObserved ? pooled.partsAway / pooled.partsObserved : null;

// ---- GO table (prereg) ----
const go = {
  engagementFloor: { bar: '>=100 travelTo calls band-wide', value: pooled.travelToTotal, pass: pooled.travelToTotal >= 100 },
  unclassifiedCalls: { bar: '0 unclassified (other-caller) calls', value: pooled.travelToOtherRaw.length, pass: pooled.travelToOtherRaw.length === 0 },
  instrumentErrors: { bar: '0 instrument errors, all seeds, all legs', value: pooled.instrumentErrors, pass: pooled.instrumentErrors === 0 },
  completeCapture: { bar: 'per-seed tables for metrics 1-9 + sense scenes quoted', value: perSeed.length + ' seeds tabulated', pass: perSeed.length === control.length },
};
go.allPass = go.engagementFloor.pass && go.unclassifiedCalls.pass && go.instrumentErrors.pass && go.completeCapture.pass;

// ---- Neutrality: control vs neutral on days + end pantry kcal + deaths ----
const neutral = loadLeg('neutral');
const neutrality = { seeds: neutral.length, matches: 0, mismatches: [] };
if (neutral.length) {
  const nBySeed = {};
  for (const n of neutral) nBySeed[n.o.seed] = n.o;
  for (const entry of control) {
    const c = entry.o, n = nBySeed[c.seed];
    if (!n) { neutrality.mismatches.push({ seed: c.seed, reason: 'no neutral file' }); continue; }
    const okDays = c.days === n.days;
    const okPantry = c.endPantryKcal === n.endPantryKcal;
    const okDeaths = c.deaths.length === n.deaths.length;
    if (okDays && okPantry && okDeaths) neutrality.matches++;
    else neutrality.mismatches.push({ seed: c.seed, control: { days: c.days, pantry: c.endPantryKcal, deaths: c.deaths.length }, neutral: { days: n.days, pantry: n.endPantryKcal, deaths: n.deaths.length } });
  }
} else {
  neutrality.mismatches.push({ reason: 'no neutral files found' });
}
go.neutrality = { bar: 'days + end pantry kcal + deaths match exactly, 8/8 seeds', value: neutrality.matches + '/' + control.length, pass: neutrality.matches === control.length && neutrality.mismatches.length === 0 };
go.allPass = go.allPass && go.neutrality.pass;

const summary = { run: RUN, mode: MODE, files: control.map(function (e) { return e.file; }), perSeed: perSeed, pooled: pooled, go: go, neutrality: neutrality };
if (OUT) fs.writeFileSync(OUT, JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));

#!/usr/bin/env node
// analyze-confirmednight-b.js — confirmed-night + return-story census
// (sim-confirmednight-b; prereg: evidence/2026-10-31/
// sim-confirmednight-b-prereg.md, committed BEFORE any judged leg.)
//
// Reads one absencehunt corpus dir of per-seed JSON files (as written
// by scripts/split-absencehunt-jsonl-b.js) and adds, WITHOUT redefining
// any absencehunt or strandred class:
//  - confirmed creek nights: creek-tile evenings (strandred definition:
//    evening tile 'creek', NOT atHaven, NOT onRoad) whose following
//    morning EXISTS and is AWAY. In class terms: 'genuine' (which
//    guarantees a following away morning) OR 'away-continuation' WITH
//    a following away morning. 'sleep-return', haven-following
//    away-continuation, and 'genuine-end-of-run' evenings are
//    UNCONFIRMED and itemized separately, never counted in the primary.
//  - return story per confirmed night, from that day's own record:
//    FAILED-RETURN if eveningOutcome is 'out-of-reach' (nighttravel:
//    home travel not offered) or in {travel-refused, detour-stopped,
//    detour-nopath, detour-died, travel-died} or ctxDelta
//    .tripHomeDetours > 0; else NO-ATTEMPT; UNCLASSIFIED only if the
//    day's record is missing/inconsistent. The creek refusal line
//    ("no crossing without a bridge or a swim") is a secondary
//    BLOCKED-CROSSING flag only — it does not name home as the
//    destination, so it never promotes a night to FAILED-RETURN.
//  - camp-end story per creek camp (strandred camp = maximal run of
//    >= 2 consecutive creek-tile evenings): SUCCESSION (following
//    morning's vessel differs), WALK-HOME (following day starts away
//    same vessel and ends at haven), MOVED-ELSEWHERE (following day
//    starts away and ends non-creek non-haven),
//    WOKE-AT-HAVEN-SAME-VESSEL (following morning at haven, same
//    vessel), HORIZON (no following day).
'use strict';
const fs = require('fs');
const path = require('path');
const { classifySeed, atHaven } = require('./analyze-absencehunt-b');
const { classifyCreek, isCreekTileEvening } = require('./analyze-strandred-b');

const FAILED_OUTCOMES = new Set([
  'out-of-reach', 'travel-refused', 'detour-stopped', 'detour-nopath',
  'detour-died', 'travel-died',
]);
const BRIDGE_RE = /no crossing without a bridge/i;

function classifyReturnStory(day, raw) {
  if (!raw || !raw.eve) return { story: 'UNCLASSIFIED', signals: [], blockedCrossing: false };
  const outcome = raw.eve.eveningOutcome || day.eveningOutcome || null;
  const delta = (raw.dec && raw.dec.ctxDelta) || raw.eve.ctxDelta || {};
  const tripHomeDetours = delta.tripHomeDetours || 0;
  const dayLines = Array.isArray(raw.eve.dayLines) ? raw.eve.dayLines : [];
  const blockedCrossing = dayLines.some((l) => typeof l === 'string' && BRIDGE_RE.test(l));
  const signals = [];
  if (outcome && FAILED_OUTCOMES.has(outcome)) signals.push('outcome:' + outcome);
  if (tripHomeDetours > 0) signals.push('tripHomeDetours:' + tripHomeDetours);
  if (signals.length) return { story: 'FAILED-RETURN', signals, blockedCrossing };
  return { story: 'NO-ATTEMPT', signals: [], blockedCrossing };
}

function classifyConfirmed(inst) {
  const base = classifySeed(inst);
  const creek = classifyCreek(base.days);
  const byDay = new Map();
  const decisions = inst.decisions || [];
  const evenings = inst.evenings || [];
  for (let i = 0; i < decisions.length; i++) {
    const d = decisions[i] || {};
    byDay.set(d.loopDay || (i + 1), { dec: d, eve: evenings[i] || null, idx: i });
  }
  for (let i = 0; i < evenings.length; i++) {
    const e = evenings[i] || {};
    const k = e.loopDay || (i + 1);
    if (!byDay.has(k)) byDay.set(k, { dec: null, eve: e, idx: i });
    else if (!byDay.get(k).eve) byDay.get(k).eve = e;
  }
  const creekTileSet = new Set(creek.creekTileDays);
  const confirmed = [];
  const unconfirmed = [];
  for (const day of base.days) {
    if (!creekTileSet.has(day.loopDay)) continue;
    const raw = byDay.get(day.loopDay) || {};
    const next = byDay.get(day.loopDay + 1);
    const nextMorning = next && next.dec ? next.dec.morning : null;
    const nextVessel = nextMorning ? (nextMorning.vesselId ?? null) : null;
    const thisVessel = raw.dec && raw.dec.morning ? (raw.dec.morning.vesselId ?? null) : null;
    const vesselChanged = (thisVessel !== null && nextVessel !== null && thisVessel !== nextVessel);
    if (day.hasNextMorning && day.nextMorningAway === true) {
      const story = classifyReturnStory(day, raw);
      confirmed.push({
        loopDay: day.loopDay, class: day.class, ...story,
        eveningOutcome: (raw.eve && raw.eve.eveningOutcome) || day.eveningOutcome || null,
      });
    } else {
      let kind = 'other';
      if (day.class === 'sleep-return') kind = 'sleep-return';
      else if (!day.hasNextMorning) kind = 'end-of-run';
      else if (day.nextMorningAway === false) kind = 'haven-following';
      unconfirmed.push({
        loopDay: day.loopDay, class: day.class, kind,
        nextMorningAtHaven: day.hasNextMorning ? day.nextMorningAway === false : null,
        vesselChanged, thisVessel, nextVessel,
      });
    }
  }
  // Camp-end stories, per strandred camp.
  const camps = creek.camps.map((camp) => {
    const confirmedInCamp = confirmed.filter((c) => camp.days.includes(c.loopDay)).length;
    const lastDay = camp.endDay;
    const next = byDay.get(lastDay + 1);
    let endStory = 'horizon';
    if (next && next.dec) {
      const lastRaw = byDay.get(lastDay) || {};
      const lastVessel = lastRaw.dec && lastRaw.dec.morning ? (lastRaw.dec.morning.vesselId ?? null) : null;
      const nextVessel = next.dec.morning ? (next.dec.morning.vesselId ?? null) : null;
      if (lastVessel !== null && nextVessel !== null && lastVessel !== nextVessel) endStory = 'succession';
      else if (atHaven(next.dec.morning)) endStory = 'woke-at-haven-same-vessel';
      else if (next.eve && atHaven(next.eve)) endStory = 'walk-home';
      else endStory = 'moved-elsewhere';
    }
    return { ...camp, confirmedNights: confirmedInCamp, endStory };
  });
  const countStory = (s) => confirmed.filter((c) => c.story === s).length;
  return {
    seed: inst.seed, policy: inst.policy, horizonDays: base.horizonDays,
    daysAlive: base.daysAlive, endReason: base.endReason, errCount: base.errCount,
    genuine: base.genuine,
    creekTileEvenings: creek.creekTileEvenings, creekTileDays: creek.creekTileDays,
    genuineCreekTileEvenings: creek.genuineCreekTileEvenings,
    sleepReturnCreekEvenings: creek.sleepReturnCreekEvenings,
    camps: camps,
    confirmedNights: confirmed.length,
    confirmedDays: confirmed.map((c) => c.loopDay),
    confirmed: confirmed,
    failedReturn: countStory('FAILED-RETURN'),
    noAttempt: countStory('NO-ATTEMPT'),
    unclassified: countStory('UNCLASSIFIED'),
    blockedCrossingNights: confirmed.filter((c) => c.blockedCrossing).length,
    unconfirmed: unconfirmed,
    unconfirmedSleepReturn: unconfirmed.filter((u) => u.kind === 'sleep-return').length,
    unconfirmedHavenFollowing: unconfirmed.filter((u) => u.kind === 'haven-following').length,
    unconfirmedEndOfRun: unconfirmed.filter((u) => u.kind === 'end-of-run').length,
  };
}

function analyzeDir(corpusDir) {
  const files = fs.readdirSync(corpusDir).filter((f) => f.endsWith('.json')).sort();
  const perSeed = [];
  for (const f of files) {
    const inst = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8'));
    perSeed.push(classifyConfirmed(inst));
  }
  const sum = (k) => perSeed.reduce((t, s) => t + (s[k] || 0), 0);
  const confirmedTotal = sum('confirmedNights');
  const classifiedTotal = sum('failedReturn') + sum('noAttempt');
  return {
    corpusDir,
    policy: perSeed.length ? perSeed[0].policy : null,
    horizonDays: perSeed.length ? perSeed[0].horizonDays : null,
    legs: perSeed.length,
    seeds: perSeed.map((s) => s.seed),
    totalCreekTileEvenings: sum('creekTileEvenings'),
    totalConfirmedNights: confirmedTotal,
    totalFailedReturn: sum('failedReturn'),
    totalNoAttempt: sum('noAttempt'),
    totalUnclassified: sum('unclassified'),
    classificationCompleteness: confirmedTotal ? classifiedTotal / confirmedTotal : null,
    seedsWithConfirmedNight: perSeed.filter((s) => s.confirmedNights > 0).map((s) => s.seed),
    totalBlockedCrossingNights: sum('blockedCrossingNights'),
    totalUnconfirmedSleepReturn: sum('unconfirmedSleepReturn'),
    totalUnconfirmedHavenFollowing: sum('unconfirmedHavenFollowing'),
    totalUnconfirmedEndOfRun: sum('unconfirmedEndOfRun'),
    totalCamps: perSeed.reduce((t, s) => t + s.camps.length, 0),
    campEndStories: perSeed.reduce((acc, s) => {
      for (const c of s.camps) acc[c.endStory] = (acc[c.endStory] || 0) + 1;
      return acc;
    }, {}),
    totalGenuine: sum('genuine'),
    totalErrs: sum('errCount'),
    perSeed,
  };
}

if (require.main === module) {
  const dir = process.argv[2];
  const out = process.argv[3];
  if (!dir || !out) { console.error('usage: analyze-confirmednight-b.js <corpusDir> <outFile>'); process.exit(2); }
  const census = analyzeDir(dir);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(census, null, 2));
  console.log('confirmednight census: ' + census.legs + ' legs policy=' + census.policy + ' horizonDays=' + census.horizonDays +
    ' creekTile=' + census.totalCreekTileEvenings + ' confirmed=' + census.totalConfirmedNights +
    ' failedReturn=' + census.totalFailedReturn + ' noAttempt=' + census.totalNoAttempt +
    ' unclassified=' + census.totalUnclassified + ' completeness=' + census.classificationCompleteness +
    ' seedsWithConfirmed=' + JSON.stringify(census.seedsWithConfirmedNight) +
    ' unconfirmed(sleep/haven/eor)=' + census.totalUnconfirmedSleepReturn + '/' + census.totalUnconfirmedHavenFollowing + '/' + census.totalUnconfirmedEndOfRun +
    ' camps=' + census.totalCamps + ' campEnds=' + JSON.stringify(census.campEndStories) +
    ' genuine=' + census.totalGenuine);
}

module.exports = { FAILED_OUTCOMES, classifyReturnStory, classifyConfirmed, analyzeDir };

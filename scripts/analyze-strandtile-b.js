#!/usr/bin/env node
// analyze-strandtile-b.js — TILE-criterion strand-episode census
// (sim-strandtile-b; prereg: evidence/2026-10-31/
// sim-strandtile-b-prereg.md, committed BEFORE any judged leg.)
//
// Reads one absencehunt corpus dir of per-seed JSON files (as written
// by scripts/split-absencehunt-jsonl-b.js), reuses classifyConfirmed
// from scripts/analyze-confirmednight-b.js WITHOUT redefining any
// absencehunt, strandred, or confirmednight class, and adds:
//  - strand episodes: maximal runs of consecutive loop-days, each a
//    confirmed FAILED-RETURN night, for ONE vessel (morning vesselId).
//    A haven morning always breaks an episode (it makes the prior
//    evening unconfirmed); a vessel change breaks it even while
//    still away; singletons are episodes of length 1.
//  - episode-end classification per the prereg's exit-day rule.
//    Reconciliation note (prereg's truncation paragraph governs):
//    an exit day with NO decision record is HORIZON, EXCEPT when the
//    leg's endReason is a village loss and daysAlive <= the episode's
//    last day — then the run ended because the village died, so the
//    end is VILLAGE-DEATH, not horizon. This case can only fire on a
//    loss leg and is reported whenever it fires.
'use strict';
const fs = require('fs');
const path = require('path');
const { classifyConfirmed } = require('./analyze-confirmednight-b');
const { atHaven } = require('./analyze-absencehunt-b');

function groupEpisodes(frNights) {
  const sorted = frNights.slice().sort((a, b) => a.loopDay - b.loopDay);
  const episodes = [];
  let cur = null;
  for (const n of sorted) {
    if (cur && n.loopDay === cur.endDay + 1 && n.vesselId === cur.vesselId) {
      cur.endDay = n.loopDay;
      cur.days.push(n.loopDay);
    } else {
      cur = { vesselId: n.vesselId, startDay: n.loopDay, endDay: n.loopDay, days: [n.loopDay] };
      episodes.push(cur);
    }
  }
  for (const e of episodes) e.length = e.days.length;
  return episodes;
}

// lookup: {
//   exitExists, exitGameOver, exitMorningVessel, exitMorningAtHaven,
//   exitEveningAtHaven, exitEveningCreekTile, exitEveningExists,
//   exitConfirmedStory ('FAILED-RETURN'|'NO-ATTEMPT'|null),
//   exitFollowingExists, exitFollowingVessel, exitFollowingAtHaven,
//   legEndReason, legDaysAlive, episodeEndDay
// }
function classifyEpisodeEnd(episode, lookup) {
  const L = lookup || {};
  if (!L.exitExists) {
    if (L.legEndReason && L.legEndReason !== 'survived' &&
        L.legDaysAlive !== null && L.legDaysAlive !== undefined &&
        L.legDaysAlive <= episode.endDay) return 'VILLAGE-DEATH';
    return 'HORIZON';
  }
  if (L.exitGameOver) return 'VILLAGE-DEATH';
  if (L.exitEveningExists === false) {
    if (L.legEndReason && L.legEndReason !== 'survived' &&
        L.legDaysAlive !== null && L.legDaysAlive !== undefined &&
        L.legDaysAlive <= episode.endDay) return 'VILLAGE-DEATH';
    return 'HORIZON';
  }
  if (L.exitMorningVessel !== null && L.exitMorningVessel !== undefined &&
      episode.vesselId !== null && episode.vesselId !== undefined &&
      L.exitMorningVessel !== episode.vesselId) return 'SUCCESSION';
  if (L.exitMorningAtHaven) return 'UNCLASSIFIED-EDGE';
  if (L.exitEveningAtHaven) return 'WALK-HOME';
  if (L.exitEveningCreekTile) {
    if (L.exitConfirmedStory === 'NO-ATTEMPT') return 'ATTEMPT-STOPS';
    if (L.exitConfirmedStory === 'FAILED-RETURN') return 'UNCLASSIFIED-EDGE';
    if (!L.exitFollowingExists) return 'HORIZON';
    if (L.exitFollowingVessel !== null && L.exitFollowingVessel !== undefined &&
        episode.vesselId !== null && episode.vesselId !== undefined &&
        L.exitFollowingVessel !== episode.vesselId) return 'SUCCESSION';
    if (L.exitFollowingAtHaven) return 'SLEEP-RETURN';
    return 'UNCLASSIFIED-EDGE';
  }
  return 'MOVED-ELSEWHERE';
}

function analyzeSeed(inst) {
  const cc = classifyConfirmed(inst);
  const byDay = new Map();
  const decisions = inst.decisions || [];
  const evenings = inst.evenings || [];
  for (let i = 0; i < decisions.length; i++) {
    const d = decisions[i] || {};
    byDay.set(d.loopDay || (i + 1), { dec: d, eve: evenings[i] || null });
  }
  for (let i = 0; i < evenings.length; i++) {
    const e = evenings[i] || {};
    const k = e.loopDay || (i + 1);
    if (!byDay.has(k)) byDay.set(k, { dec: null, eve: e });
    else if (!byDay.get(k).eve) byDay.get(k).eve = e;
  }
  const vesselOf = (day) => {
    const rec = byDay.get(day);
    return rec && rec.dec && rec.dec.morning ? (rec.dec.morning.vesselId ?? null) : null;
  };
  const frNights = cc.confirmed
    .filter((c) => c.story === 'FAILED-RETURN')
    .map((c) => ({ loopDay: c.loopDay, vesselId: vesselOf(c.loopDay), signals: c.signals || [], blockedCrossing: !!c.blockedCrossing }));
  const episodes = groupEpisodes(frNights);
  const episodesOut = episodes.map((ep) => {
    const x = ep.endDay + 1;
    const exit = byDay.get(x);
    const exitEve = exit ? exit.eve : null;
    const exitDec = exit ? exit.dec : null;
    const exitConfirmed = cc.confirmed.find((c) => c.loopDay === x) || null;
    const following = byDay.get(x + 1);
    const followingMorning = following && following.dec ? following.dec.morning : null;
    const exitCreekTile = !!(exitEve && exitEve.tile === 'creek' &&
      !atHaven(exitEve) && !exitEve.roadActive && !exitEve.roadOnRoad);
    const lookup = {
      exitExists: !!exit,
      exitGameOver: !!(exitEve && exitEve.gameOver),
      exitMorningVessel: exitDec && exitDec.morning ? (exitDec.morning.vesselId ?? null) : null,
      exitMorningAtHaven: exitDec && exitDec.morning ? atHaven(exitDec.morning) : false,
      exitEveningAtHaven: exitEve ? atHaven(exitEve) : false,
      exitEveningCreekTile: exitCreekTile,
      exitEveningExists: !!exitEve,
      exitConfirmedStory: exitConfirmed ? exitConfirmed.story : null,
      exitFollowingExists: !!followingMorning,
      exitFollowingVessel: followingMorning ? (followingMorning.vesselId ?? null) : null,
      exitFollowingAtHaven: followingMorning ? atHaven(followingMorning) : false,
      legEndReason: inst.endReason || null,
      legDaysAlive: (inst.daysAlive === undefined ? null : inst.daysAlive),
      episodeEndDay: ep.endDay,
    };
    return {
      ...ep,
      nights: frNights.filter((n) => ep.days.includes(n.loopDay)),
      endStory: classifyEpisodeEnd(ep, lookup),
      exitDay: x,
    };
  });
  const gateOk = (inst.errCount === 0) &&
    (decisions.length === evenings.length) &&
    (decisions.length === (inst.days || decisions.length) ||
      (inst.endReason && inst.endReason !== 'survived' && inst.daysAlive !== undefined));
  return {
    seed: inst.seed, policy: inst.policy, horizonDays: cc.horizonDays,
    daysAlive: cc.daysAlive, endReason: cc.endReason, errCount: cc.errCount,
    decisions: decisions.length, evenings: evenings.length,
    gateOk,
    genuine: cc.genuine,
    creekTileEvenings: cc.creekTileEvenings, creekTileDays: cc.creekTileDays,
    confirmedNights: cc.confirmedNights, confirmedDays: cc.confirmedDays,
    failedReturn: cc.failedReturn, noAttempt: cc.noAttempt,
    unclassified: cc.unclassified,
    blockedCrossingNights: cc.blockedCrossingNights,
    unconfirmedSleepReturn: cc.unconfirmedSleepReturn,
    unconfirmedHavenFollowing: cc.unconfirmedHavenFollowing,
    unconfirmedEndOfRun: cc.unconfirmedEndOfRun,
    camps: cc.camps,
    episodes: episodesOut,
    episodeCount: episodesOut.length,
  };
}

function analyzeDir(corpusDir) {
  const files = fs.readdirSync(corpusDir).filter((f) => f.endsWith('.json')).sort();
  const perSeed = [];
  for (const f of files) {
    const inst = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8'));
    perSeed.push(analyzeSeed(inst));
  }
  const sum = (k) => perSeed.reduce((t, s) => t + (s[k] || 0), 0);
  const confirmedTotal = sum('confirmedNights');
  const classifiedTotal = sum('failedReturn') + sum('noAttempt');
  const episodes = perSeed.flatMap((s) => s.episodes.map((e) => ({ seed: s.seed, ...e })));
  const lengthDist = { 1: 0, '2-4': 0, '5+': 0 };
  for (const e of episodes) {
    if (e.length === 1) lengthDist[1]++;
    else if (e.length <= 4) lengthDist['2-4']++;
    else lengthDist['5+']++;
  }
  const episodesByEnd = {};
  for (const e of episodes) episodesByEnd[e.endStory] = (episodesByEnd[e.endStory] || 0) + 1;
  return {
    corpusDir,
    policy: perSeed.length ? perSeed[0].policy : null,
    horizonDays: perSeed.length ? perSeed[0].horizonDays : null,
    legs: perSeed.length,
    seeds: perSeed.map((s) => s.seed),
    gateOkLegs: perSeed.filter((s) => s.gateOk).length,
    gateFailures: perSeed.filter((s) => !s.gateOk).map((s) => s.seed),
    totalCreekTileEvenings: sum('creekTileEvenings'),
    totalConfirmedNights: confirmedTotal,
    totalFailedReturn: sum('failedReturn'),
    totalNoAttempt: sum('noAttempt'),
    totalUnclassified: sum('unclassified'),
    classificationCompleteness: confirmedTotal ? classifiedTotal / confirmedTotal : null,
    totalBlockedCrossingNights: sum('blockedCrossingNights'),
    totalUnconfirmedSleepReturn: sum('unconfirmedSleepReturn'),
    totalUnconfirmedHavenFollowing: sum('unconfirmedHavenFollowing'),
    totalUnconfirmedEndOfRun: sum('unconfirmedEndOfRun'),
    totalCamps: perSeed.reduce((t, s) => t + s.camps.length, 0),
    totalGenuine: sum('genuine'),
    totalErrs: sum('errCount'),
    totalEpisodes: episodes.length,
    episodesPerLeg: perSeed.length ? episodes.length / perSeed.length : null,
    seedsWithEpisode: perSeed.filter((s) => s.episodeCount > 0).map((s) => s.seed),
    lengthDist,
    episodesByEnd,
    episodes,
    perSeed,
  };
}

if (require.main === module) {
  const dir = process.argv[2];
  const out = process.argv[3];
  if (!dir || !out) { console.error('usage: analyze-strandtile-b.js <corpusDir> <outFile>'); process.exit(2); }
  const census = analyzeDir(dir);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(census, null, 2));
  console.log('strandtile census: ' + census.legs + ' legs policy=' + census.policy + ' horizonDays=' + census.horizonDays +
    ' gateOk=' + census.gateOkLegs + '/' + census.legs +
    ' creekTile=' + census.totalCreekTileEvenings + ' confirmed=' + census.totalConfirmedNights +
    ' failedReturn=' + census.totalFailedReturn + ' noAttempt=' + census.totalNoAttempt +
    ' unclassified=' + census.totalUnclassified + ' completeness=' + census.classificationCompleteness +
    ' episodes=' + census.totalEpisodes + ' seedsWithEpisode=' + JSON.stringify(census.seedsWithEpisode) +
    ' lengths=' + JSON.stringify(census.lengthDist) + ' ends=' + JSON.stringify(census.episodesByEnd));
}

module.exports = { groupEpisodes, classifyEpisodeEnd, analyzeSeed, analyzeDir };

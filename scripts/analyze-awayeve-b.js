#!/usr/bin/env node
// analyze-awayeve-b.js — away-evening census analyzer (DIAG ONLY).
// (sim-awayeve-b; prereg: evidence/2026-11-01/
// sim-awayeve-b-prereg.md, committed BEFORE any judged leg.)
//
// Reads one corpus dir of per-seed JSON files (as written by
// scripts/split-absencehunt-jsonl-b.js for the absencehunt and
// creekseek drivers) and writes a census JSON to <outFile>.
// Usage: node scripts/analyze-awayeve-b.js <corpusDir> <outFile>
//
// Reuses WITHOUT redefining: atHaven + travelLegLines from
// analyze-absencehunt-b.js, FAILED_OUTCOMES from
// analyze-confirmednight-b.js (the confirmednight signal set),
// classifySeed (genuine absences, continuity) and
// classifyConfirmed (creek camps, continuity). The ONLY new
// classes here are the prereg's own: haven / road / away
// evenings, end-cause, return story, away episodes.
//
// Definitions (prereg, exact):
// - atHaven: absencehunt haven-checked (inside true OR tile
//   'haven' OR map position equals the village (px, py) node).
// - road evening: NOT atHaven AND (roadActive OR roadOnRoad).
//   Reported separately, NEVER pooled into away.
// - away evening: NOT atHaven AND NOT on road. Primary unit.
// - end-cause, in order: blocked-combat (inCombat) >
//   tent-camp (insideTent) > return-attempted (eveningOutcome
//   in FAILED_OUTCOMES, or tripHomeDetours > 0; subkinds
//   travel-refused / out-of-reach / detour-* /
//   tripHomeDetours kept separate) > no-return-step
//   ('policy-no-record') > other (verbatim outcome).
// - return story, in order: still-away-at-horizon (no next
//   day, endReason 'survived') / ended-other (no next day
//   not survived = village-death; vessel change =
//   succession; next morning at haven same vessel =
//   woke-at-haven-same-vessel; next evening road =
//   road-transition; other continuations carry the
//   end-cause as subkind) / walked-home-next-day (next
//   day starts away same vessel, ends at haven) /
//   failed-return (next evening away, end-cause
//   return-attempted) / no-attempt (next evening away,
//   end-cause no-return-step) / UNCLASSIFIED (missing /
//   inconsistent next record — instrument failure only).
// - away episode: maximal run of consecutive loop-days,
//   each an away evening, for ONE morning vessel. A haven
//   evening, a road evening, or a vessel change breaks it.
'use strict';
const fs = require('fs');
const path = require('path');
const { atHaven, travelLegLines, classifySeed } = require('./analyze-absencehunt-b');
const { FAILED_OUTCOMES, classifyConfirmed } = require('./analyze-confirmednight-b');

const BRIDGE_RE = /no crossing without a bridge/i;

function endCauseOf(eve, delta) {
  const outcome = (eve && eve.eveningOutcome) || null;
  const tripHomeDetours = (delta && delta.tripHomeDetours) || 0;
  if (eve && eve.inCombat) return { cause: 'blocked-combat', subkind: null };
  if (eve && eve.insideTent) return { cause: 'tent-camp', subkind: null };
  if ((outcome && FAILED_OUTCOMES.has(outcome)) || tripHomeDetours > 0) {
    let subkind = null;
    if (outcome === 'travel-refused') subkind = 'travel-refused';
    else if (outcome === 'out-of-reach') subkind = 'out-of-reach';
    else if (outcome && FAILED_OUTCOMES.has(outcome)) subkind = outcome;
    else if (tripHomeDetours > 0) subkind = 'tripHomeDetours:' + tripHomeDetours;
    return { cause: 'return-attempted', subkind };
  }
  if (outcome === 'policy-no-record') return { cause: 'no-return-step', subkind: null };
  return { cause: 'other', subkind: outcome };
}

function returnStoryOf(rec, next, legEndReason) {
  // rec: away evening record; next: { dec, eve } | null for day+1.
  if (!next || !next.dec) {
    if (legEndReason === 'survived') return { story: 'still-away-at-horizon', subkind: null };
    return { story: 'ended-other', subkind: 'village-death:' + (legEndReason || 'unknown') };
  }
  const nextMorning = next.dec.morning || null;
  const thisVessel = rec.vesselId;
  const nextVessel = nextMorning ? (nextMorning.vesselId ?? null) : null;
  if (thisVessel !== null && nextVessel !== null && thisVessel !== nextVessel) {
    return { story: 'ended-other', subkind: 'succession' };
  }
  if (nextMorning && atHaven(nextMorning)) {
    return { story: 'ended-other', subkind: 'woke-at-haven-same-vessel' };
  }
  if (!next.eve) return { story: 'UNCLASSIFIED', subkind: 'missing-next-evening' };
  if (atHaven(next.eve)) return { story: 'walked-home-next-day', subkind: null };
  if (next.eve.roadActive || next.eve.roadOnRoad) {
    return { story: 'ended-other', subkind: 'road-transition' };
  }
  if (rec.endCause === 'return-attempted') return { story: 'failed-return', subkind: rec.endSubkind };
  if (rec.endCause === 'no-return-step') return { story: 'no-attempt', subkind: null };
  return { story: 'ended-other', subkind: rec.endCause + '-continuation' };
}

function analyzeSeed(inst) {
  const decisions = inst.decisions || [];
  const evenings = inst.evenings || [];
  const byDay = new Map();
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
  const daysComplete = decisions.length === (inst.days || decisions.length);
  const anyGameOverEve = evenings.some((e) => e && e.gameOver);
  const complete = daysComplete || anyGameOverEve ||
    (inst.endReason && inst.endReason !== 'survived');
  const gateOk = (inst.errCount === 0) && (decisions.length === evenings.length) && complete;

  const away = [];
  const road = [];
  let haven = 0;
  let incompleteDays = 0;
  const n = Math.max(decisions.length, evenings.length);
  for (let i = 0; i < n; i++) {
    const rec = byDay.get(i + 1) || {};
    const dec = rec.dec || {};
    const eve = rec.eve || {};
    const morning = dec.morning || null;
    if (!rec.eve || !rec.dec) { incompleteDays++; continue; }
    if (atHaven(eve)) { haven++; continue; }
    const onRoad = !!(eve.roadActive || eve.roadOnRoad);
    if (onRoad) {
      road.push({ loopDay: i + 1, tile: eve.tile || null, map: [eve.mapPx ?? null, eve.mapPy ?? null] });
      continue;
    }
    const delta = dec.ctxDelta || eve.ctxDelta || {};
    const cause = endCauseOf(eve, delta);
    const base = {
      loopDay: i + 1,
      vesselId: morning ? (morning.vesselId ?? null) : null,
      start: morning ? (atHaven(morning) ? 'departure' : 'continuation') : 'unknown',
      startOnRoad: morning ? !!(morning.roadActive || morning.roadOnRoad) : false,
      tile: eve.tile || null,
      map: [eve.mapPx ?? null, eve.mapPy ?? null],
      eveningOutcome: eve.eveningOutcome || null,
      endCause: cause.cause, endSubkind: cause.subkind,
      inCombat: !!eve.inCombat, insideTent: !!eve.insideTent,
      forageDelta: delta.forageTrips || 0, patrolDelta: delta.patrols || 0,
      travelLines: travelLegLines(eve.dayLines),
      blockedCrossing: Array.isArray(eve.dayLines) &&
        eve.dayLines.some((l) => typeof l === 'string' && BRIDGE_RE.test(l)),
      creekseek: eve.creekseek || null,
      woodcarryBucket: (eve.woodcarry && eve.woodcarry.bucket) || null,
    };
    const next = byDay.get(i + 2) || null;
    const story = returnStoryOf(base, next, inst.endReason || null);
    base.returnStory = story.story;
    base.returnSubkind = story.subkind;
    away.push(base);
  }

  // Away episodes: maximal consecutive away loop-days, one vessel.
  const episodes = [];
  let cur = null;
  for (const a of away) {
    if (cur && a.loopDay === cur.endDay + 1 && a.vesselId === cur.vesselId) {
      cur.endDay = a.loopDay;
      cur.days.push(a.loopDay);
    } else {
      cur = { vesselId: a.vesselId, startDay: a.loopDay, endDay: a.loopDay, days: [a.loopDay] };
      episodes.push(cur);
    }
  }
  for (const ep of episodes) {
    ep.length = ep.days.length;
    // Episode end uses the day AFTER the last away evening (endDay+1):
    // that day's morning/evening decide the end, mirroring the
    // strandtile exit-day rule shape.
    const exit = byDay.get(ep.endDay + 1) || null;
    if (!exit || !exit.dec) {
      ep.endStory = (inst.endReason === 'survived') ? 'HORIZON' : 'VILLAGE-DEATH';
    } else if (exit.dec.morning && ep.vesselId !== null &&
        exit.dec.morning.vesselId !== null &&
        exit.dec.morning.vesselId !== ep.vesselId) {
      ep.endStory = 'SUCCESSION';
    } else if (exit.dec.morning && atHaven(exit.dec.morning)) {
      ep.endStory = 'WOKE-AT-HAVEN-SAME-VESSEL';
    } else if (exit.eve && atHaven(exit.eve)) {
      ep.endStory = 'WALK-HOME';
    } else if (exit.eve && (exit.eve.roadActive || exit.eve.roadOnRoad)) {
      ep.endStory = 'ROAD-TRANSITION';
    } else if (exit.eve && exit.eve.gameOver) {
      ep.endStory = 'VILLAGE-DEATH';
    } else {
      ep.endStory = 'ENDED-OTHER';
    }
    ep.exitDay = ep.endDay + 1;
  }

  const countBy = (arr, key) => {
    const out = {};
    for (const r of arr) { const k = r[key] ?? 'null'; out[k] = (out[k] || 0) + 1; }
    return out;
  };
  const absence = classifySeed(inst);
  const confirmed = classifyConfirmed(inst);
  const classified = away.filter((a) => a.returnStory !== 'UNCLASSIFIED').length;
  return {
    seed: inst.seed, policy: inst.policy, horizonDays: inst.days || null,
    daysAlive: inst.daysAlive ?? null, endReason: inst.endReason || null,
    errCount: inst.errCount ?? null,
    decisions: decisions.length, evenings: evenings.length,
    gateOk, complete, incompleteDays,
    totalEvenings: n, havenEvenings: haven,
    roadEvenings: road.length, roadDays: road.map((r) => r.loopDay),
    awayEvenings: away.length, awayDays: away.map((a) => a.loopDay),
    awayShare: n ? away.length / n : null,
    awayShareNonRoad: (n - road.length) ? away.length / (n - road.length) : null,
    awayByTile: countBy(away, 'tile'),
    awayByStart: countBy(away, 'start'),
    awayByEndCause: countBy(away, 'endCause'),
    awayByEndSubkind: countBy(away, 'endSubkind'),
    awayByReturnStory: countBy(away, 'returnStory'),
    awayByReturnSubkind: countBy(away, 'returnSubkind'),
    awayUnclassified: away.filter((a) => a.returnStory === 'UNCLASSIFIED').length,
    classificationCompleteness: away.length ? classified / away.length : null,
    creekAwayEvenings: away.filter((a) => a.tile === 'creek').length,
    creekAwayDays: away.filter((a) => a.tile === 'creek').map((a) => a.loopDay),
    blockedCrossingAway: away.filter((a) => a.blockedCrossing).length,
    forageAway: away.filter((a) => a.forageDelta > 0).length,
    patrolAway: away.filter((a) => a.patrolDelta > 0).length,
    travelLineAway: away.filter((a) => a.travelLines >= 1).length,
    away, road,
    episodes, episodeCount: episodes.length,
    episodeLengthDist: (() => {
      const d = { 1: 0, '2-4': 0, '5+': 0 };
      for (const e of episodes) {
        if (e.length === 1) d[1]++;
        else if (e.length <= 4) d['2-4']++;
        else d['5+']++;
      }
      return d;
    })(),
    episodesByEnd: countBy(episodes, 'endStory'),
    genuine: absence.genuine, genuineDays: absence.genuineDays,
    camps: confirmed.camps, campCount: confirmed.camps.length,
    campEndStories: confirmed.camps.reduce((acc, c) => {
      acc[c.endStory] = (acc[c.endStory] || 0) + 1; return acc;
    }, {}),
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
  const mergeCounts = (key) => {
    const out = {};
    for (const s of perSeed) {
      for (const [k, v] of Object.entries(s[key] || {})) out[k] = (out[k] || 0) + v;
    }
    return out;
  };
  const totalAway = sum('awayEvenings');
  const totalEvenings = sum('totalEvenings');
  const totalRoad = sum('roadEvenings');
  const classified = totalAway - sum('awayUnclassified');
  const episodes = perSeed.flatMap((s) => s.episodes.map((e) => ({ seed: s.seed, ...e })));
  return {
    corpusDir,
    policy: perSeed.length ? perSeed[0].policy : null,
    horizonDays: perSeed.length ? perSeed[0].horizonDays : null,
    legs: perSeed.length,
    seeds: perSeed.map((s) => s.seed),
    gateOkLegs: perSeed.filter((s) => s.gateOk).length,
    gateFailures: perSeed.filter((s) => !s.gateOk).map((s) => s.seed),
    totalEvenings, totalHavenEvenings: sum('havenEvenings'),
    totalRoadEvenings: totalRoad,
    totalAwayEvenings: totalAway,
    awayShare: totalEvenings ? totalAway / totalEvenings : null,
    awayShareNonRoad: (totalEvenings - totalRoad) ? totalAway / (totalEvenings - totalRoad) : null,
    seedsWithAway: perSeed.filter((s) => s.awayEvenings > 0).map((s) => s.seed),
    awayByTile: mergeCounts('awayByTile'),
    awayByStart: mergeCounts('awayByStart'),
    awayByEndCause: mergeCounts('awayByEndCause'),
    awayByEndSubkind: mergeCounts('awayByEndSubkind'),
    awayByReturnStory: mergeCounts('awayByReturnStory'),
    awayByReturnSubkind: mergeCounts('awayByReturnSubkind'),
    totalUnclassified: sum('awayUnclassified'),
    classificationCompleteness: totalAway ? classified / totalAway : null,
    totalCreekAwayEvenings: sum('creekAwayEvenings'),
    totalBlockedCrossingAway: sum('blockedCrossingAway'),
    totalForageAway: sum('forageAway'),
    totalPatrolAway: sum('patrolAway'),
    totalTravelLineAway: sum('travelLineAway'),
    totalEpisodes: episodes.length,
    episodesPerLeg: perSeed.length ? episodes.length / perSeed.length : null,
    seedsWithEpisode: perSeed.filter((s) => s.episodeCount > 0).map((s) => s.seed),
    episodeLengthDist: (() => {
      const d = { 1: 0, '2-4': 0, '5+': 0 };
      for (const e of episodes) {
        if (e.length === 1) d[1]++;
        else if (e.length <= 4) d['2-4']++;
        else d['5+']++;
      }
      return d;
    })(),
    episodesByEnd: mergeCounts('episodesByEnd'),
    episodes,
    totalGenuine: sum('genuine'),
    totalCamps: sum('campCount'),
    campEndStories: mergeCounts('campEndStories'),
    totalErrs: sum('errCount'),
    perSeed,
  };
}

if (require.main === module) {
  const dir = process.argv[2];
  const out = process.argv[3];
  if (!dir || !out) { console.error('usage: analyze-awayeve-b.js <corpusDir> <outFile>'); process.exit(2); }
  const census = analyzeDir(dir);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(census, null, 2));
  console.log('awayeve census: ' + census.legs + ' legs policy=' + census.policy + ' horizonDays=' + census.horizonDays +
    ' gateOk=' + census.gateOkLegs + '/' + census.legs +
    ' evenings=' + census.totalEvenings + ' haven=' + census.totalHavenEvenings +
    ' road=' + census.totalRoadEvenings + ' away=' + census.totalAwayEvenings +
    ' awayShare=' + census.awayShare + ' completeness=' + census.classificationCompleteness +
    ' unclassified=' + census.totalUnclassified + ' episodes=' + census.totalEpisodes +
    ' seedsWithAway=' + JSON.stringify(census.seedsWithAway));
}

module.exports = { endCauseOf, returnStoryOf, analyzeSeed, analyzeDir };

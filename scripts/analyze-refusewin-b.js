#!/usr/bin/env node
// analyze-refusewin-b.js — refusal-episode analyzer (DIAG ONLY).
// (sim-refusewin-b; prereg: evidence/2026-11-01/
// sim-refusewin-b-prereg.md, committed BEFORE any judged leg.)
//
// Reads one corpus dir of per-seed JSON files (as written by
// scripts/split-absencehunt-jsonl-b.js), groups consecutive
// travel-refused evenings into episodes, and classifies each
// episode's end per the prereg definitions EXACTLY:
//   resolved-by-daytime-walk: first evening after the run has
//     eveningOutcome 'completed' AND tile 'haven' (inside true).
//   still-refused-at-horizon: episode includes the leg's last
//     evening day AND endReason 'survived' (days-complete).
//   ended-other: leg ended (endReason other than 'survived',
//     day recorded) OR first evening after the run has any other
//     outcome (outcome + day recorded).
//   UNCLASSIFIED: none of the above (instrument failure only).
// The gate2hunt analyzer VERBATIM remains the census
// cross-check: episode refusal counts here must agree with its
// totalRefusals per leg (checked by the runner, not hidden).
// Usage: node scripts/analyze-refusewin-b.js <corpusDir> <outFile>
'use strict';
const fs = require('fs');
const path = require('path');

function gateOf(leg) {
  const errs = leg.errCount != null ? leg.errCount : (Array.isArray(leg.errs) ? leg.errs.length : 0);
  const countsOk = Array.isArray(leg.decisions) && Array.isArray(leg.evenings)
    && leg.decisions.length === leg.evenings.length;
  const daysComplete = leg.daysAlive === leg.days;
  const eveningOver = Array.isArray(leg.evenings) && leg.evenings.some((e) => e.gameOver === true);
  const endRecorded = typeof leg.endReason === 'string' && leg.endReason !== 'survived';
  const complete = daysComplete || eveningOver || endRecorded;
  return { errs, countsOk, daysComplete, eveningOver, endRecorded, complete, pass: errs === 0 && countsOk && complete };
}

function groupEpisodes(evenings) {
  const byDay = new Map();
  for (const e of evenings) byDay.set(e.loopDay, e);
  const refused = evenings.filter((e) => e.eveningOutcome === 'travel-refused')
    .sort((a, b) => a.loopDay - b.loopDay);
  const episodes = [];
  let cur = null;
  for (const e of refused) {
    if (cur && e.loopDay === cur.days[cur.days.length - 1] + 1) {
      cur.days.push(e.loopDay);
      cur.evenings.push(e);
    } else {
      cur = { days: [e.loopDay], evenings: [e] };
      episodes.push(cur);
    }
  }
  return { byDay, episodes };
}

function travelLinesOf(eve) {
  if (!eve || !Array.isArray(eve.dayLines)) return [];
  return eve.dayLines.filter((l) => typeof l === 'string'
    && (/^Travel \d+ tiles? to /.test(l) || /walk back into Haven/.test(l)));
}

function classifyEpisode(ep, byDay, leg) {
  const lastDay = ep.days[ep.days.length - 1];
  const next = byDay.get(lastDay + 1) || null;
  const first = ep.evenings[0];
  const camps = [...new Set(ep.evenings.map((e) => e.tile + ' (' + e.mapPx + ',' + e.mapPy + ')'))];
  const campMaps = [...new Set(ep.evenings.map((e) => e.mapPx + ',' + e.mapPy))];
  const blocked = [...new Set(ep.evenings.map((e) => {
    const cr = e.creekremedy;
    if (cr && cr.blockedTile) return cr.blockedTile.x + ',' + cr.blockedTile.y;
    return null;
  }).filter(Boolean))];
  const routes = [...new Set(ep.evenings.map((e) => {
    const cr = e.creekremedy;
    return cr && Array.isArray(cr.routeAroundPath) ? JSON.stringify(cr.routeAroundPath) : null;
  }).filter(Boolean))];
  const hops = {};
  const buckets = {};
  for (const e of ep.evenings) {
    const h = (e.ntTravel && e.ntTravel.hopReturnKind) || (e.creekremedy && e.creekremedy.hopReturnKind) || 'unknown';
    hops[h] = (hops[h] || 0) + 1;
    const b = (e.creekremedy && e.creekremedy.blockType) || 'unknown';
    buckets[b] = (buckets[b] || 0) + 1;
  }
  const base = {
    days: ep.days, count: ep.days.length, camps, campMaps, blockedTiles: blocked,
    routeAroundPaths: routes, hopSplit: hops, blockTypeSplit: buckets,
  };
  if (next && next.eveningOutcome === 'completed' && next.tile === 'haven' && next.inside === true) {
    return Object.assign(base, {
      classification: 'resolved-by-daytime-walk',
      resolutionDay: next.loopDay,
      resolutionTravelLines: travelLinesOf(next),
    });
  }
  if (!next) {
    if (leg.endReason === 'survived' && leg.daysAlive === leg.days) {
      return Object.assign(base, { classification: 'still-refused-at-horizon', horizonDay: leg.days });
    }
    if (typeof leg.endReason === 'string' && leg.endReason !== 'survived') {
      return Object.assign(base, { classification: 'ended-other', endKind: 'leg-ended', endReason: leg.endReason, endDay: leg.daysAlive });
    }
    return Object.assign(base, { classification: 'UNCLASSIFIED', reason: 'no next evening, no recorded ending' });
  }
  return Object.assign(base, {
    classification: 'ended-other', endKind: 'next-evening-outcome',
    endOutcome: next.eveningOutcome, endDay: next.loopDay,
    endTile: next.tile + ' (' + next.mapPx + ',' + next.mapPy + ')',
  });
}

function analyzeLeg(leg) {
  const gate = gateOf(leg);
  const evenings = [...leg.evenings].sort((a, b) => a.loopDay - b.loopDay);
  const { byDay, episodes } = groupEpisodes(evenings);
  const classified = episodes.map((ep) => Object.assign(
    { seed: leg.seed }, classifyEpisode(ep, byDay, leg)));
  return {
    seed: leg.seed, policy: leg.policy, days: leg.days, daysAlive: leg.daysAlive,
    endReason: leg.endReason, gate, totalRefusals: episodes.reduce((n, e) => n + e.days.length, 0),
    episodeCount: classified.length, episodes: classified,
  };
}

function main() {
  const corpusDir = process.argv[2];
  const outFile = process.argv[3];
  if (!corpusDir || !outFile) { console.error('usage: analyze-refusewin-b.js <corpusDir> <outFile>'); process.exit(2); }
  const files = fs.readdirSync(corpusDir).filter((f) => f.endsWith('.json')).sort();
  const legs = [];
  let unclassified = 0;
  for (const f of files) {
    const leg = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8'));
    const a = analyzeLeg(leg);
    unclassified += a.episodes.filter((e) => e.classification === 'UNCLASSIFIED').length;
    legs.push(a);
  }
  const out = {
    corpusDir, legs,
    totalRefusals: legs.reduce((n, l) => n + l.totalRefusals, 0),
    totalEpisodes: legs.reduce((n, l) => n + l.episodeCount, 0),
    unclassifiedCount: unclassified,
    gatePass: legs.every((l) => l.gate.pass),
    gateFailures: legs.filter((l) => !l.gate.pass).map((l) => l.seed),
  };
  fs.writeFileSync(outFile, JSON.stringify(out, null, 1) + '\n');
  console.log('episodes: ' + out.totalEpisodes + ' legs=' + legs.length
    + ' refusals=' + out.totalRefusals + ' unclassified=' + unclassified
    + ' gatePass=' + out.gatePass);
}

if (require.main === module) main();
module.exports = { gateOf, groupEpisodes, classifyEpisode, analyzeLeg, travelLinesOf };

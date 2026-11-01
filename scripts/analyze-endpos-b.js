#!/usr/bin/env node
// analyze-endpos-b.js — daytime end-position distribution analyzer (DIAG ONLY).
// (sim-endpos-b; prereg: evidence/2026-11-01/sim-endpos-b-prereg.md,
// committed BEFORE any judged census.)
//
// Reads the committed offergeo corpora (per-seed JSON files as written
// by scripts/split-absencehunt-jsonl-b.js) and builds, from the corpus
// record alone:
//   (a) the EVENING-OUTCOME x ENDPOS-CLASS table: every evening,
//       not just offer-evaluated ones. Endpos = the villager's map
//       position when nightStep starts (see prereg for the recovery
//       order). Classes: H-IN (endpos haven, inside at evening
//       snap), H-OUT (endpos haven, not inside), A d<=3, B d=4-5,
//       C d>=6, UNPINNED (hop distance known, tile not — counted
//       separately, never banded). Haven classes are NEVER pooled
//       into a distance band.
//   (b) the departure-tile histogram (away endpos rows only).
//   (c) the day-bucket trend (loopDay 1-10 / 11-20 / 21-30).
//   (d) the mechanism distribution over away d>=4 evenings
//       (classes B + C), one class per evening, priority order
//       ROAD > COMBAT > CREEK-BLOCKED > CAMPED > OUT-AND-NOT-BACK
//       > AWAY-MOVED > OTHER (see prereg), plus non-exclusive
//       secondary descriptors.
//
// Departure recovery REUSES scripts/analyze-offergeo-b.js verbatim
// (required, not edited): manhattan / bandOf / classifyOffer /
// departureOf, including the woodcarry-departure correction for
// travel-refused evenings and the morning-gated creekseek
// cross-stack pin for hop evenings. Non-evaluated guard evenings
// (blocked-combat / blocked-tent) use the evening snap — the guard
// fires before any travel, so the step moves nothing. All other
// non-evaluated evenings are haven evenings by construction (the
// step delegates to the entry leg only when the villager stands
// on the haven tile or is already inside).
//
// Day-record helpers (per evening, same leg): the day's morning
// snap is decisions[loopDay - 1].morning (decisions are 0-indexed
// by loopDay; offergeo's nextMorning pairs evening loopDay d with
// decisions[d] as the FOLLOWING morning). The previous evening's
// endpos is the previous loopDay's classified endpos in the same
// leg (legs are processed in loopDay order; a missing previous
// evening — e.g. day 1, or a leg that starts mid-window —
// simply fails the CAMPED same-previous test, never invents one).
//
// Usage:
//   node scripts/analyze-endpos-b.js --census <dir...> <outFile>
//   node scripts/analyze-endpos-b.js --days <seedFile> <day,day...> <outFile>
//     (re-exports offergeo's days dump for sense reads; kept here so
//     the sense dumps cite this arm's analyzer.)
'use strict';
const fs = require('fs');
const path = require('path');
const offergeo = require('./analyze-offergeo-b.js');
const { manhattan, bandOf, classifyOffer, departureOf } = offergeo;

const HAVEN = { x: 4, y: 4 };
const CREEK_BLOCK_RE = /no crossing without a bridge or a swim/;
const TRAVEL_LINE_RE = /Travel (\d+) tiles? to ([\w ]+)\./;
const WOUND_REST_RE = /\b(wound|wounded|injured|injury|rest|resting)\b/i;

function atHavenPos(pos) {
  if (!pos) return false;
  if (pos.inside === true) return true;
  if (pos.tile === 'haven') return true;
  return false;
}

// Endpos class for one evening. dep = departureOf result (for
// evaluated evenings) or null. Returns { cls, dist, tile, mapPx,
// mapPy, provenance }. cls in H-IN, H-OUT, A<=3, B4-5, C>=6, UNPINNED.
// mapPx/mapPy are the endpos coords (null for line-derived hops
// whose tile is unpinned, and for UNPINNED rows) — the mechanism
// classifier and the previous-evening tracker read coords from
// here, never from the evening snap (a hop snap is haven).
function endposClass(eve, dep) {
  const cls = classifyOffer(eve);
  if (cls.evaluated) {
    if (dep && dep.distance !== null && dep.distance !== undefined) {
      const band = bandOf(dep.distance);
      return { cls: band, dist: dep.distance, tile: dep.tile, mapPx: dep.mapPx, mapPy: dep.mapPy, provenance: dep.provenance };
    }
    return { cls: 'UNPINNED', dist: null, tile: null, mapPx: null, mapPy: null, provenance: (dep && dep.provenance) || 'unpinned' };
  }
  const outcome = eve.eveningOutcome;
  if (outcome === 'blocked-combat' || outcome === 'blocked-tent') {
    // Guard: step moved nothing, evening snap IS the endpos.
    if (atHavenPos(eve)) {
      return { cls: eve.inside === true ? 'H-IN' : 'H-OUT', dist: 0, tile: 'haven', mapPx: 4, mapPy: 4, provenance: 'evening-snap (guard moved nothing; haven)' };
    }
    const d = manhattan(eve.mapPx, eve.mapPy);
    return { cls: bandOf(d), dist: d, tile: eve.tile, mapPx: eve.mapPx, mapPy: eve.mapPy, provenance: 'evening-snap (guard moved nothing; away)' };
  }
  if (outcome === 'policy-no-record' || outcome === 'game-over' || outcome === 'step-error' || outcome === 'haven-unknown') {
    return { cls: 'SURPRISE-NOSTEP', dist: null, tile: null, mapPx: null, mapPy: null, provenance: 'no-step outcome: ' + outcome };
  }
  // Entry-leg-only evenings: endpos is haven by construction.
  if (atHavenPos(eve)) {
    return { cls: eve.inside === true ? 'H-IN' : 'H-OUT', dist: 0, tile: 'haven', mapPx: 4, mapPy: 4, provenance: 'haven by construction (entry leg only)' };
  }
  // Away snap with no evaluation and no guard: a genuine surprise
  // (the step should have evaluated an away evening). Band it from
  // the snap but flag it, never silently pool it.
  const d = manhattan(eve.mapPx, eve.mapPy);
  return { cls: bandOf(d), dist: d, tile: eve.tile, mapPx: eve.mapPx, mapPy: eve.mapPy, provenance: 'SURPRISE: away non-evaluated non-guard evening' };
}

// Mechanism for one away d>=4 evening. ctx: { morning, prevEndpos,
// dayCtx }. Returns { mech, descriptors }.
function mechanismOf(eve, endpos, ctx) {
  const lines = Array.isArray(eve.dayLines) ? eve.dayLines : [];
  const descriptors = {
    morningHaven: false, morningSameTile: false, prevSameTile: false,
    forageTripsPositive: false, creekBlockLine: false, woundRestLine: false,
    roadFlag: false, inCombat: !!eve.inCombat, lastTravelDest: null,
    awayStreakGe2: false,
  };
  const morning = ctx.morning || null;
  if (morning) {
    descriptors.morningHaven = morning.tile === 'haven';
    descriptors.morningSameTile = morning.mapPx === endpos.mapPx && morning.mapPy === endpos.mapPy;
  }
  if (ctx.prevEndpos) {
    descriptors.prevSameTile = ctx.prevEndpos.mapPx === endpos.mapPx && ctx.prevEndpos.mapPy === endpos.mapPy;
  }
  const dayCtx = ctx.dayCtx || {};
  if (dayCtx.forageTrips) descriptors.forageTripsPositive = true;
  if (eve.roadActive || eve.roadOnRoad || dayCtx.nomadRoadDays || dayCtx.nomadMoves) descriptors.roadFlag = true;
  for (const l of lines) {
    if (typeof l !== 'string') continue;
    if (CREEK_BLOCK_RE.test(l)) descriptors.creekBlockLine = true;
    if (WOUND_REST_RE.test(l)) descriptors.woundRestLine = true;
    const m = l.match(TRAVEL_LINE_RE);
    if (m) descriptors.lastTravelDest = m[2];
  }
  descriptors.awayStreakGe2 = !!ctx.awayStreakGe2;
  let mech;
  if (descriptors.roadFlag) mech = 'ROAD';
  else if (eve.eveningOutcome === 'blocked-combat') mech = 'COMBAT';
  else if (descriptors.creekBlockLine) mech = 'CREEK-BLOCKED';
  else if (descriptors.prevSameTile || (descriptors.morningSameTile && !descriptors.morningHaven)) mech = 'CAMPED';
  else if (descriptors.morningHaven) mech = 'OUT-AND-NOT-BACK';
  else if (morning && !descriptors.morningSameTile) mech = 'AWAY-MOVED';
  else mech = 'OTHER';
  return { mech, descriptors };
}

function readDir(dir) {
  const out = [];
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith('.json')) continue;
    const inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out.push({ file: f, inst });
  }
  return out;
}

function analyzeInstances(instances) {
  // instances: [{ file, inst }] — insts as written by the corpus splitter.
  const cross = {}; // seed -> day -> { csFrom, csArrival }
  const mornings = {}; // seed -> day -> { policy -> morning snap }
  for (const { inst } of instances) {
    for (const dec of inst.decisions || []) {
      if (!dec.morning) continue;
      mornings[inst.seed] = mornings[inst.seed] || {};
      mornings[inst.seed][dec.loopDay] = mornings[inst.seed][dec.loopDay] || {};
      mornings[inst.seed][dec.loopDay][inst.policy] = dec.morning;
    }
    if (inst.policy !== 'creekseek-stack') continue;
    for (const eve of inst.evenings || []) {
      const cs = eve.creekseek || null;
      if (!cs) continue;
      cross[inst.seed] = cross[inst.seed] || {};
      const rec = cross[inst.seed][eve.loopDay] = cross[inst.seed][eve.loopDay] || {};
      if (cs.from) rec.csFrom = cs.from;
      if (cs.arrival) rec.csArrival = cs.arrival;
    }
  }
  const result = {
    haven: HAVEN, policies: {}, pooled: null,
    surprises: [], havenCoordViolations: [], legs: [],
    rows: [], mechRows: [],
  };
  const pooledTable = {}; // outcome -> class -> n
  const pooledTiles = {};
  const pooledBuckets = { '1-10': {}, '11-20': {}, '21-30': {} };
  const pooledMech = {};
  const pooledDesc = { n: 0, morningHaven: 0, morningSameTile: 0, prevSameTile: 0, forageTripsPositive: 0, creekBlockLine: 0, woundRestLine: 0, roadFlag: 0, inCombat: 0, awayStreakGe2: 0, lastTravelDest: {} };
  let pooledEvenings = 0, pooledErrLegs = 0;
  for (const { file, inst } of instances) {
    const pol = inst.policy || 'unknown';
    const P = (result.policies[pol] = result.policies[pol] || {
      files: 0, seeds: [], evenings: 0, errLegs: 0,
      table: {}, tiles: {}, buckets: { '1-10': {}, '11-20': {}, '21-30': {} },
      mech: {}, desc: { n: 0, morningHaven: 0, morningSameTile: 0, prevSameTile: 0, forageTripsPositive: 0, creekBlockLine: 0, woundRestLine: 0, roadFlag: 0, inCombat: 0, awayStreakGe2: 0, lastTravelDest: {} },
    });
    P.files++; P.seeds.push(inst.seed);
    const errs = inst.errCount === undefined ? null : inst.errCount;
    if (errs !== 0) P.errLegs++;
    if (errs !== 0) pooledErrLegs++;
    result.legs.push({ file, seed: inst.seed, policy: pol, evenings: (inst.evenings || []).length, errCount: errs, daysAlive: inst.daysAlive === undefined ? null : inst.daysAlive, endReason: inst.endReason || null });
    const decByDay = {};
    for (const dec of inst.decisions || []) decByDay[dec.loopDay] = dec;
    let prevEndpos = null; // { mapPx, mapPy, cls } of previous loopDay in this leg
    let awayStreak = 0;
    const evenings = (inst.evenings || []).slice().sort((a, b) => (a.loopDay || 0) - (b.loopDay || 0));
    for (const eve of evenings) {
      P.evenings++; pooledEvenings++;
      if (eve.tile === 'haven' && (eve.mapPx !== 4 || eve.mapPy !== 4)) {
        result.havenCoordViolations.push({ seed: inst.seed, policy: pol, day: eve.loopDay, mapPx: eve.mapPx, mapPy: eve.mapPy });
      }
      const clsOffer = classifyOffer(eve);
      if (clsOffer.surprise) result.surprises.push({ seed: inst.seed, policy: pol, day: eve.loopDay, outcome: eve.eveningOutcome, travelledHome: !!eve.travelledHome });
      let dep = null;
      if (clsOffer.evaluated) {
        const x = cross[inst.seed] && cross[inst.seed][eve.loopDay];
        const mIdx = mornings[inst.seed] && mornings[inst.seed][eve.loopDay];
        let morningGate = null;
        if (mIdx && mIdx['nighttravel-stack'] && mIdx['creekseek-stack']) {
          const a = mIdx['nighttravel-stack'], b = mIdx['creekseek-stack'];
          morningGate = a.tile === b.tile && a.mapPx === b.mapPx && a.mapPy === b.mapPy && a.vesselId === b.vesselId;
        }
        dep = departureOf(eve, x || null, pol, morningGate);
      }
      const ep = endposClass(eve, dep);
      if (ep.cls === 'SURPRISE-NOSTEP' || (ep.provenance || '').startsWith('SURPRISE')) {
        result.surprises.push({ seed: inst.seed, policy: pol, day: eve.loopDay, outcome: eve.eveningOutcome, travelledHome: !!eve.travelledHome, endposProvenance: ep.provenance });
      }
      const outcome = eve.eveningOutcome || 'null';
      const bucket = eve.loopDay <= 10 ? '1-10' : (eve.loopDay <= 20 ? '11-20' : '21-30');
      const bump = (table, k) => { table[k] = (table[k] || 0) + 1; };
      P.table[outcome] = P.table[outcome] || {}; bump(P.table[outcome], ep.cls);
      pooledTable[outcome] = pooledTable[outcome] || {}; bump(pooledTable[outcome], ep.cls);
      bump(P.buckets[bucket], ep.cls); bump(pooledBuckets[bucket], ep.cls);
      const isAway = ep.cls === 'A<=3' || ep.cls === 'B4-5' || ep.cls === 'C>=6';
      if (isAway) {
        const tkey = ep.mapPx + ',' + ep.mapPy + '|' + (ep.tile || '?');
        const T = (P.tiles[tkey] = P.tiles[tkey] || { n: 0, bands: {} });
        T.n++; bump(T.bands, ep.cls);
        const PT = (pooledTiles[tkey] = pooledTiles[tkey] || { n: 0, bands: {} });
        PT.n++; bump(PT.bands, ep.cls);
        awayStreak++;
      } else {
        awayStreak = 0;
      }
      const row = {
        seed: inst.seed, policy: pol, day: eve.loopDay, outcome, travelledHome: !!eve.travelledHome,
        endposClass: ep.cls, dist: ep.dist, tile: ep.tile, provenance: ep.provenance,
        eveningTile: eve.tile, eveningMap: [eve.mapPx, eve.mapPy], inside: eve.inside,
      };
      result.rows.push(row);
      // Mechanism: away d>=4 only (B + C). UNPINNED rows are excluded
      // from the denominator and listed separately (see mechRows with
      // mech null is never emitted; unpinned rows carry mech 'UNPINNED-EXCLUDED'
      // in the census's unpinned list instead — here we emit them as
      // mech rows with mech 'UNPINNED' so the exclusion is counted).
      if (ep.cls === 'B4-5' || ep.cls === 'C>=6' || ep.cls === 'UNPINNED') {
        const dec = decByDay[eve.loopDay] || {};
        const morning = dec.morning || null;
        const { mech, descriptors } = mechanismOf(eve, { mapPx: ep.mapPx, mapPy: ep.mapPy }, {
          morning, prevEndpos, dayCtx: dec.ctxDelta || {},
          awayStreakGe2: awayStreak >= 2,
        });
        const mrow = {
          seed: inst.seed, policy: pol, day: eve.loopDay, outcome, endposClass: ep.cls,
          dist: ep.dist, tile: ep.tile, mech: ep.cls === 'UNPINNED' ? 'UNPINNED' : mech,
          descriptors, morningTile: morning ? morning.tile : null,
          morningMap: morning ? [morning.mapPx, morning.mapPy] : null,
        };
        result.mechRows.push(mrow);
        if (ep.cls !== 'UNPINNED') {
          bump(P.mech, mech); bump(pooledMech, mech);
          const D = P.desc, PD = pooledDesc;
          D.n++; PD.n++;
          for (const k of ['morningHaven', 'morningSameTile', 'prevSameTile', 'forageTripsPositive', 'creekBlockLine', 'woundRestLine', 'roadFlag', 'inCombat', 'awayStreakGe2']) {
            if (descriptors[k]) { D[k]++; PD[k]++; }
          }
          if (descriptors.lastTravelDest) {
            D.lastTravelDest[descriptors.lastTravelDest] = (D.lastTravelDest[descriptors.lastTravelDest] || 0) + 1;
            PD.lastTravelDest[descriptors.lastTravelDest] = (PD.lastTravelDest[descriptors.lastTravelDest] || 0) + 1;
          }
        }
      }
      // Previous endpos for CAMPED: only away endpos rows carry coords;
      // a haven evening resets prevEndpos to the haven coords (a
      // villager who came home and left again is not "camped" from
      // the haven night — the morning-same-tile leg of CAMPED still
      // catches single-away-day repeats only when the morning is away).
      if (ep.cls === 'H-IN' || ep.cls === 'H-OUT') prevEndpos = { mapPx: 4, mapPy: 4, cls: ep.cls };
      else if (ep.mapPx !== null && ep.mapPx !== undefined) prevEndpos = { mapPx: ep.mapPx, mapPy: ep.mapPy, cls: ep.cls };
      else prevEndpos = null;
    }
  }
  result.pooled = {
    evenings: pooledEvenings, errLegs: pooledErrLegs,
    table: pooledTable, tiles: pooledTiles, buckets: pooledBuckets,
    mech: pooledMech, desc: pooledDesc,
  };
  return result;
}

function analyzeDirs(dirs) {
  const instances = [];
  for (const dir of dirs) instances.push(...readDir(dir));
  const res = analyzeInstances(instances);
  res.dirs = dirs;
  return res;
}

function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--census') {
    const outFile = args[args.length - 1];
    const dirs = args.slice(1, -1);
    const res = analyzeDirs(dirs);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    const tmp = outFile + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(res, null, 2) + '\n');
    fs.renameSync(tmp, outFile);
    console.error('endpos census: dirs=' + dirs.join(','));
    for (const [pol, P] of Object.entries(res.policies)) {
      console.error('  ' + pol + ': files=' + P.files + ' evenings=' + P.evenings + ' errLegs=' + P.errLegs + ' mech=' + JSON.stringify(P.mech));
    }
    console.error('  pooled evenings=' + res.pooled.evenings + ' surprises=' + res.surprises.length + ' havenCoordViolations=' + res.havenCoordViolations.length);
    console.error('  pooled mech=' + JSON.stringify(res.pooled.mech));
    return;
  }
  if (args[0] === '--days') {
    const res = offergeo.daysDump(args[1], args[2].split(',').map((s) => parseInt(s.trim(), 10)));
    const outFile = args[3];
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    const tmp = outFile + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(res, null, 2) + '\n');
    fs.renameSync(tmp, outFile);
    console.error('endpos days dump: ' + args[1] + ' days=' + args[2]);
    return;
  }
  console.error('usage: analyze-endpos-b.js --census <dir...> <outFile> | --days <seedFile> <day,day...> <outFile>');
  process.exit(2);
}

if (require.main === module) main();
module.exports = { manhattan, bandOf, endposClass, mechanismOf, analyzeInstances, analyzeDirs, HAVEN };

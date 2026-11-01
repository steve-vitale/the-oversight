#!/usr/bin/env node
// analyze-offergeo-b.js — offer-geometry + entry-failure-cost analyzer (DIAG ONLY).
// (sim-offergeo-b; prereg: evidence/2026-11-01/sim-offergeo-b-prereg.md,
// committed BEFORE any judged census.)
//
// Reads awayeve corpora (per-seed JSON files as written by
// scripts/split-absencehunt-jsonl-b.js) and builds, from the corpus
// record alone:
//   (1) the OFFER-BY-DISTANCE table: for every evening on which the
//       evening step evaluates the offer, the departure tile and the
//       Manhattan distance to haven, and whether haven was offered;
//   (2) the ENTRY-FAILURE COST comparison: haven-tile evenings split
//       by entry outcome (fail vs success), with next-morning
//       consequences read from the following day's own morning snap.
//
// Code facts (scripts/policies/nighttravel.js nightStep,
// scripts/policies/insideevening.js eveningStep, src/js/game.js
// travelTargets):
//   * Distance is Manhattan: |mapPx - hx| + |mapPy - hy|, haven (hx,hy)
//     default (4,4). travelTargets offers a home tile iff d > 0 AND
//     (d <= 3 AND tile.revealed OR d === 1), plus orthogonal-adjacent
//     beyond-edge tiles at d = 1.
//   * Offer classification from corpus fields alone (the corpus stores
//     eveningOutcome + travelledHome, not nighttravel's travelOffered
//     boolean; each outcome below is reachable by exactly one branch):
//       out-of-reach            -> NOT offered
//       travel-refused          -> offered, hop refused
//       travelledHome true      -> offered, hop moved (entry split)
//       travel-arrived-combat   -> offered, hop moved, entry skipped
//       travel-died             -> offered, hop moved, died
//     Everything else is EXCLUDED from the offer table with a reason:
//       completed/already-inside (not travelledHome) -> entry-only:
//         the day ended at haven on its own; the step never checks
//         the offer. walk-no-path / no-go-inside-button /
//         entry-refused / walk-interrupted-combat (not travelledHome)
//         -> entry-fail-only: same, entry leg only. blocked-combat /
//         blocked-tent -> guard: fires before the offer check.
//         policy-no-record -> no step. game-over -> no step.
//         haven-unknown / step-error / detour-* / unknown -> surprise.
//   * Departure recovery (prereg): for every evening on which the step
//     moves nothing, the evening snap's (mapPx, mapPy) IS the departure
//     tile (the entry walk moves detail mx/my only). For hop evenings
//     the evening snap is the haven node, so departure is recovered
//     (a) from a same-seed-day creekseek record (creekseek.from = the
//     post-daily position on the P1 stack, since the visit runs after
//     competent.daily; creekseek.arrival = the post-visit step
//     departure on the creekseek stack), or (b) from the day's own
//     "Travel N tiles to Haven." line, which states the hop distance
//     directly (tile then recorded as line-derived/uncertain, band
//     exact). Hop rows are always flagged with their provenance.
//   * Haven coords: corpus havenPx/havenPy are null, so haven is (4,4)
//     (nighttravel default + MAP.md village coordinate). The analyzer
//     ASSERTS every haven-tile evening snap sits at (4,4); a violation
//     is a surprise, never a silent re-centering.
//   * Next-morning measures: evening loopDay d pairs with
//     decisions[d] (0-indexed) as the following morning, when it
//     exists. Day-30 evenings have no following morning in the 30d
//     window and are excluded from next-morning measures (counted).
//     Morning snaps carry no inCombat field, so next-morning combat
//     is reported via the FOLLOWING EVENING's inCombat flag, labeled
//     as such — never presented as a morning flag.
//
// Usage:
//   node scripts/analyze-offergeo-b.js --census <dir...> <outFile>
//     (dirs are corpus dirs; each dir's policy is read from its files'
//     .policy field. A creekseek dir passed alongside a nighttravel
//     dir enables cross-stack hop-departure pinning for the same
//     seed-day.)
//   node scripts/analyze-offergeo-b.js --days <seedFile> <day,day...> <outFile>
//     (dumps full dayLines + morning/evening/next-morning for sense reads.)
'use strict';
const fs = require('fs');
const path = require('path');

const HAVEN = { x: 4, y: 4 };
const ENTRY_FAIL = new Set(['walk-no-path', 'no-go-inside-button', 'entry-refused', 'walk-interrupted-combat']);
const ENTRY_OK = new Set(['completed', 'already-inside']);

function manhattan(x, y, hx, hy) {
  return Math.abs(x - (hx === undefined ? HAVEN.x : hx)) + Math.abs(y - (hy === undefined ? HAVEN.y : hy));
}
function bandOf(d) {
  if (d === null || d === undefined) return null;
  if (d <= 3) return 'A<=3';
  if (d <= 5) return 'B4-5';
  return 'C>=6';
}
function atHavenPos(pos) {
  if (!pos) return false;
  if (pos.inside === true) return true;
  if (pos.tile === 'haven') return true;
  return false;
}

// Offer classification. Returns { evaluated, offered, kind, excludedReason, surprise }.
function classifyOffer(eve) {
  const outcome = (eve && eve.eveningOutcome) || null;
  const trav = !!(eve && eve.travelledHome);
  if (outcome === 'out-of-reach') return { evaluated: true, offered: false, kind: 'offer-no', surprise: false };
  if (outcome === 'travel-refused') return { evaluated: true, offered: true, kind: 'hop-refused', surprise: false };
  if (outcome === 'travel-arrived-combat') return { evaluated: true, offered: true, kind: 'hop-arrived-combat', surprise: false };
  if (outcome === 'travel-died') return { evaluated: true, offered: true, kind: 'hop-died', surprise: false };
  if (trav) {
    if (ENTRY_OK.has(outcome)) return { evaluated: true, offered: true, kind: 'hop-yes-entry-yes', surprise: false };
    if (ENTRY_FAIL.has(outcome)) return { evaluated: true, offered: true, kind: 'hop-yes-entry-no', surprise: false };
    return { evaluated: false, offered: null, kind: 'hop-surprise-outcome', excludedReason: 'surprise', surprise: true };
  }
  if (ENTRY_OK.has(outcome)) return { evaluated: false, offered: null, kind: 'entry-only', excludedReason: 'entry-only-haven', surprise: false };
  if (ENTRY_FAIL.has(outcome)) return { evaluated: false, offered: null, kind: 'entry-fail-only', excludedReason: 'entry-only-haven', surprise: false };
  if (outcome === 'blocked-combat') return { evaluated: false, offered: null, kind: 'guard-combat', excludedReason: 'guard-before-offer', surprise: false };
  if (outcome === 'blocked-tent') return { evaluated: false, offered: null, kind: 'guard-tent', excludedReason: 'guard-before-offer', surprise: false };
  if (outcome === 'policy-no-record') return { evaluated: false, offered: null, kind: 'no-step', excludedReason: 'no-step', surprise: false };
  if (outcome === 'game-over') return { evaluated: false, offered: null, kind: 'game-over', excludedReason: 'no-step', surprise: false };
  return { evaluated: false, offered: null, kind: 'surprise:' + outcome, excludedReason: 'surprise', surprise: true };
}

const HOP_LINE_RE = /Travel (\d+) tiles? to Haven\./;
// Departure for one evening. cross = same-seed-day creekseek record
// { csFrom, csArrival } (see header); policy selects which one pins
// this row: a creekseek row's step departure is the POST-VISIT
// arrival; a nighttravel row's step departure is the PRE-VISIT
// post-daily position (the visit runs after competent.daily, so the
// two stacks share the daily trajectory up to the step). Returns
// { mapPx, mapPy, tile, distance, provenance } or { provenance: 'unpinned' }.
function departureOf(eve, cross, policy) {
  const cls = classifyOffer(eve);
  if (!cls.evaluated) return { provenance: 'not-evaluated' };
  if (!eve.travelledHome && cls.kind !== 'hop-arrived-combat' && cls.kind !== 'hop-died') {
    return {
      mapPx: eve.mapPx, mapPy: eve.mapPy, tile: eve.tile,
      distance: manhattan(eve.mapPx, eve.mapPy),
      provenance: 'evening-snap (step moved nothing)',
    };
  }
  // Hop evening: evening snap is haven, not the departure.
  if (cross) {
    if (policy === 'creekseek-stack' && cross.csArrival) return { mapPx: cross.csArrival.mapPx, mapPy: cross.csArrival.mapPy, tile: cross.csArrival.tile || null, distance: manhattan(cross.csArrival.mapPx, cross.csArrival.mapPy), provenance: 'creekseek-arrival (post-visit step departure)' };
    if (cross.csFrom) return { mapPx: cross.csFrom.mapPx, mapPy: cross.csFrom.mapPy, tile: cross.csFrom.tile || null, distance: manhattan(cross.csFrom.mapPx, cross.csFrom.mapPy), provenance: 'creekseek-from (post-daily position, visit runs after daily)' };
    if (policy === 'creekseek-stack' && cross.csArrival) return { mapPx: cross.csArrival.mapPx, mapPy: cross.csArrival.mapPy, tile: cross.csArrival.tile || null, distance: manhattan(cross.csArrival.mapPx, cross.csArrival.mapPy), provenance: 'creekseek-arrival (post-visit step departure)' };
  }
  const lines = Array.isArray(eve.dayLines) ? eve.dayLines : [];
  for (const l of lines) {
    const m = typeof l === 'string' && l.match(HOP_LINE_RE);
    if (m) return { mapPx: null, mapPy: null, tile: null, distance: parseInt(m[1], 10), provenance: 'day-line hop distance (tile unpinned)' };
  }
  return { mapPx: null, mapPy: null, tile: null, distance: null, provenance: 'unpinned (no line, no cross-stack record)' };
}

function nextMorning(inst, eve) {
  // evenings[i].loopDay d -> decisions index d (0-based) is day d+1's morning.
  const idx = (eve.loopDay || 0); // decisions[loopDay] is the NEXT day (loopDay is 1-based)
  const dec = (inst.decisions || [])[idx];
  if (!dec || !dec.morning) return null;
  const nextEve = (inst.evenings || [])[idx] || null;
  return {
    morning: dec.morning,
    kcalDelta: (dec.morning.kcal === null || dec.morning.kcal === undefined || eve.kcal === null || eve.kcal === undefined)
      ? null : dec.morning.kcal - eve.kcal,
    stillAtHaven: atHavenPos(dec.morning),
    insideNextMorning: dec.morning.inside === true,
    vesselSame: dec.morning.vesselId === eve.vesselId,
    nextEvening: nextEve ? { loopDay: nextEve.loopDay, class: atHavenPos(nextEve) ? 'haven' : 'away', inCombat: !!nextEve.inCombat, gameOver: !!nextEve.gameOver } : null,
  };
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

function analyzeDirs(dirs) {
  const byPolicy = {}; // policy -> { files, seeds }
  const cross = {}; // seed -> day -> { csFrom, csArrival }
  // First pass: collect creekseek cross-stack records.
  for (const dir of dirs) {
    for (const { inst } of readDir(dir)) {
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
  }
  const result = {
    dirs, haven: HAVEN, policies: {}, pooled: null,
    surprises: [], havenCoordViolations: [],
    offerRows: [], entryRows: [],
  };
  const pooledBands = { 'A<=3': { n: 0, offered: 0 }, 'B4-5': { n: 0, offered: 0 }, 'C>=6': { n: 0, offered: 0 } };
  const pooledTiles = {};
  const pooledEntry = { fail: [], success: [] };
  for (const dir of dirs) {
    for (const { file, inst } of readDir(dir)) {
      const pol = inst.policy || 'unknown';
      const P = (byPolicy[pol] = byPolicy[pol] || {
        files: 0, seeds: [], evenings: 0, evaluated: 0, offered: 0,
        bands: { 'A<=3': { n: 0, offered: 0 }, 'B4-5': { n: 0, offered: 0 }, 'C>=6': { n: 0, offered: 0 } },
        kinds: {}, excluded: {}, tiles: {}, entryFail: 0, entrySuccess: 0,
        entryFailNoNextMorning: 0, entrySuccessNoNextMorning: 0,
      });
      P.files++; P.seeds.push(inst.seed);
      for (const eve of inst.evenings || []) {
        P.evenings++;
        if (eve.tile === 'haven' && (eve.mapPx !== 4 || eve.mapPy !== 4)) {
          result.havenCoordViolations.push({ seed: inst.seed, policy: pol, day: eve.loopDay, mapPx: eve.mapPx, mapPy: eve.mapPy });
        }
        const cls = classifyOffer(eve);
        if (cls.surprise) result.surprises.push({ seed: inst.seed, policy: pol, day: eve.loopDay, outcome: eve.eveningOutcome, travelledHome: !!eve.travelledHome });
        P.kinds[cls.kind] = (P.kinds[cls.kind] || 0) + 1;
        if (!cls.evaluated) { P.excluded[cls.excludedReason] = (P.excluded[cls.excludedReason] || 0) + 1; }
        // Offer table row.
        if (cls.evaluated) {
          P.evaluated++; if (cls.offered) P.offered++;
          const x = cross[inst.seed] && cross[inst.seed][eve.loopDay];
          const dep = departureOf(eve, x || null, pol);
          const band = bandOf(dep.distance);
          if (band) {
            P.bands[band].n++; if (cls.offered) P.bands[band].offered++;
            pooledBands[band].n++; if (cls.offered) pooledBands[band].offered++;
          }
          const tkey = (dep.mapPx === null ? 'unpinned' : dep.mapPx + ',' + dep.mapPy) + '|' + (dep.tile || '?');
          const T = (P.tiles[tkey] = P.tiles[tkey] || { n: 0, offered: 0, kinds: {} });
          T.n++; if (cls.offered) T.offered++; T.kinds[cls.kind] = (T.kinds[cls.kind] || 0) + 1;
          const PT = (pooledTiles[tkey] = pooledTiles[tkey] || { n: 0, offered: 0, kinds: {} });
          PT.n++; if (cls.offered) PT.offered++; PT.kinds[cls.kind] = (PT.kinds[cls.kind] || 0) + 1;
          result.offerRows.push({
            seed: inst.seed, policy: pol, day: eve.loopDay, kind: cls.kind,
            offered: cls.offered, departure: dep, band,
            eveningTile: eve.tile, eveningMap: [eve.mapPx, eve.mapPy],
            travelledHome: !!eve.travelledHome, outcome: eve.eveningOutcome,
          });
        }
        // Entry cohorts: haven-tile evenings only (atHaven by tile/inside).
        if (atHavenPos(eve)) {
          if (ENTRY_FAIL.has(eve.eveningOutcome)) {
            P.entryFail++;
            const nm = nextMorning(inst, eve);
            if (!nm) P.entryFailNoNextMorning++;
            const row = { seed: inst.seed, policy: pol, day: eve.loopDay, outcome: eve.eveningOutcome, travelledHome: !!eve.travelledHome, inside: eve.inside, eveningKcal: eve.kcal, nextMorning: nm };
            result.entryRows.push(row); pooledEntry.fail.push(row);
          } else if (ENTRY_OK.has(eve.eveningOutcome)) {
            P.entrySuccess++;
            const nm = nextMorning(inst, eve);
            if (!nm) P.entrySuccessNoNextMorning++;
            const row = { seed: inst.seed, policy: pol, day: eve.loopDay, outcome: eve.eveningOutcome, travelledHome: !!eve.travelledHome, inside: eve.inside, eveningKcal: eve.kcal, nextMorning: nm };
            pooledEntry.success.push(row);
          }
        }
      }
    }
  }
  // Summarize entry cohorts (with next morning only).
  function summarize(rows) {
    const withNm = rows.filter((r) => r.nextMorning);
    const mean = (f) => {
      const vs = withNm.map(f).filter((v) => v !== null && v !== undefined);
      if (!vs.length) return null;
      return vs.reduce((a, b) => a + b, 0) / vs.length;
    };
    const share = (f) => {
      if (!withNm.length) return null;
      return withNm.filter(f).length / withNm.length;
    };
    return {
      n: rows.length, nWithNextMorning: withNm.length,
      meanOvernightKcalDelta: mean((r) => r.nextMorning.kcalDelta),
      shareStillAtHavenNextMorning: share((r) => r.nextMorning.stillAtHaven),
      shareInsideNextMorning: share((r) => r.nextMorning.insideNextMorning),
      shareVesselSame: share((r) => r.nextMorning.vesselSame),
      shareNextEveningHaven: (() => {
        const vs = withNm.filter((r) => r.nextMorning.nextEvening);
        return vs.length ? vs.filter((r) => r.nextMorning.nextEvening.class === 'haven').length / vs.length : null;
      })(),
      shareNextEveningInCombat: (() => {
        const vs = withNm.filter((r) => r.nextMorning.nextEvening);
        return vs.length ? vs.filter((r) => r.nextMorning.nextEvening.inCombat).length / vs.length : null;
      })(),
    };
  }
  result.pooled = { bands: pooledBands, tiles: pooledTiles, entryFail: summarize(pooledEntry.fail), entrySuccess: summarize(pooledEntry.success) };
  result.policies = byPolicy;
  result.entryFailRows = pooledEntry.fail;
  result.entrySuccessRowsCount = pooledEntry.success.length;
  return result;
}

function daysDump(file, days) {
  const inst = JSON.parse(fs.readFileSync(file, 'utf8'));
  const out = { seed: inst.seed, policy: inst.policy, days: [] };
  for (const d of days) {
    const eve = (inst.evenings || []).find((e) => e.loopDay === d) || null;
    const morning = ((inst.decisions || []).find((x) => x.loopDay === d) || {}).morning || null;
    const nextMorning = ((inst.decisions || []).find((x) => x.loopDay === d + 1) || {}).morning || null;
    out.days.push({ day: d, morning, evening: eve, nextMorning });
  }
  return out;
}

function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--census') {
    const outFile = args[args.length - 1];
    const dirs = args.slice(1, -1);
    const res = analyzeDirs(dirs);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, JSON.stringify(res, null, 2) + '\n');
    console.error('offergeo census: dirs=' + dirs.join(','));
    for (const [pol, P] of Object.entries(res.policies)) {
      console.error('  ' + pol + ': files=' + P.files + ' evenings=' + P.evenings + ' evaluated=' + P.evaluated + ' offered=' + P.offered + ' bands=' + JSON.stringify(P.bands));
    }
    console.error('  pooled bands=' + JSON.stringify(res.pooled.bands) + ' surprises=' + res.surprises.length + ' havenCoordViolations=' + res.havenCoordViolations.length);
    console.error('  entry fail=' + res.pooled.entryFail.n + ' success=' + res.pooled.entrySuccess.n);
    return;
  }
  if (args[0] === '--days') {
    const file = args[1];
    const days = args[2].split(',').map((s) => parseInt(s.trim(), 10));
    const outFile = args[3];
    const res = daysDump(file, days);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, JSON.stringify(res, null, 2) + '\n');
    console.error('offergeo days dump: ' + file + ' days=' + days.join(','));
    return;
  }
  console.error('usage: analyze-offergeo-b.js --census <dir...> <outFile> | --days <seedFile> <day,day...> <outFile>');
  process.exit(2);
}

if (require.main === module) main();
module.exports = { manhattan, bandOf, classifyOffer, departureOf, nextMorning, analyzeDirs, daysDump, HAVEN, ENTRY_FAIL, ENTRY_OK };

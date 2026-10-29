#!/usr/bin/env node
// analyze-rubbleroute-b.js — 12-step rubble route-around DIAG analysis
// (sim-rubbleroute-b; prereg:
// evidence/2026-10-29/sim-rubbleroute-b-prereg.md).
//
// Reads the OFF and ON corpora, answers the four preregistered
// questions per seed, checks guards (a) OFF reproduction,
// (c) divergence audit, (d) unclassified == 0, and the
// completeness bar (0 untraced detour evenings). Guard (b)
// determinism is a byte-compare run outside this analyzer
// (shell cmp of the judged ON file vs a scratch re-run).
//
// Usage:
//   node scripts/analyze-rubbleroute-b.js --off <dir> --on <dir>
//     [--out <analysis.json>]
// Defaults: evidence/2026-10-29/sim-rubbleroute-b-corpus-off|on,
// out: evidence/2026-10-29/sim-rubbleroute-b-analysis.json
'use strict';
const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
function arg(name, def) {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
}
const OFFDIR = arg('--off', path.join(__dirname, '..', 'evidence', '2026-10-29', 'sim-rubbleroute-b-corpus-off'));
const ONDIR = arg('--on', path.join(__dirname, '..', 'evidence', '2026-10-29', 'sim-rubbleroute-b-corpus-on'));
const OUT = arg('--out', path.join(__dirname, '..', 'evidence', '2026-10-29', 'sim-rubbleroute-b-analysis.json'));

const SEEDS = [13224, 13029];
const KNOWN_OUTCOMES = new Set([
  'game-over', 'blocked-combat', 'blocked-tent', 'already-inside',
  'completed', 'out-of-reach', 'travel-refused', 'travel-died',
  'travel-arrived-combat', 'detour-stopped', 'detour-nopath',
  'detour-died', 'walk-interrupted-combat', 'walk-no-path',
  'no-go-inside-button', 'entry-refused', 'not-attempted-away',
  'haven-unknown', 'step-error', 'policy-no-record',
]);
const SENSE_RE = /travel|detour|around|route|rubble|creek|camp|slept|night|way home|walk home/i;

function load(dir, seed, leg) {
  const f = path.join(dir, `rubbleroute-b-${leg}-s${seed}.json`);
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

function isClassifiedBlocktype(e) {
  const b = e.blocktype;
  if (!b) return false;
  if (!b.blockType || !b.probeAgrees) return false;
  if (b.probeError || b.routeAroundError) return false;
  return true;
}

const SLEEP_MARKER_RE = /sleeping rough|cold ground|camp wild|wake stiff/i;
const DAWN_RE = /^— DAY \d+ DAWN —/;
// The driver's "overnight" slice is sleep lines PLUS the harness's
// morning wait-to-boundary segments (see tracer header): split at
// the first dawn marker so sleep markers are judged on the sleep
// portion only, never on daytime ambient chatter.
function splitOvernight(lines) {
  const ls = lines || [];
  const i = ls.findIndex((l) => DAWN_RE.test(l));
  if (i < 0) return { sleepLines: ls, morningAmbient: [] };
  return { sleepLines: ls.slice(0, i), morningAmbient: ls.slice(i) };
}

function traceCompleteness(e, onFile) {
  const missing = [];
  const d = e.detour;
  if (!d) missing.push('detour-record');
  else {
    if (!Array.isArray(d.path)) missing.push('path');
    if (!Array.isArray(d.steps)) missing.push('steps');
    else if (d.steps.some((s) => s.moved === undefined)) missing.push('step-moved-flags');
    if (d.stepsWalked === undefined) missing.push('stepsWalked');
    if (d.kcalBeforeDetour === undefined) missing.push('kcalBeforeDetour');
    if (d.kcalAfterDetour === undefined) missing.push('kcalAfterDetour');
    if (d.ticksBeforeDetour === undefined) missing.push('ticksBeforeDetour');
  }
  if (e.mapPx === undefined || e.mapPx === null) missing.push('evening-position');
  if (e.inside === undefined) missing.push('evening-inside');
  const morning = onFile.mornings.find((m) => m.loopDay === e.loopDay + 1);
  if (!morning) missing.push('next-morning');
  return { complete: missing.length === 0, missing, morning: morning || null };
}

function firstDiff(offEv, onEv) {
  const n = Math.max(offEv.length, onEv.length);
  for (let i = 0; i < n; i++) {
    const a = offEv[i], b = onEv[i];
    if (!a || !b) return { loopDay: (a || b).loopDay, field: 'row-count', off: a ? a.eveningOutcome : null, on: b ? b.eveningOutcome : null };
    for (const f of ['eveningOutcome', 'mapPx', 'mapPy', 'inside', 'tile', 'kcal']) {
      if (a[f] !== b[f]) return { loopDay: a.loopDay, field: f, off: a[f], on: b[f], offOutcome: a.eveningOutcome, onOutcome: b.eveningOutcome };
    }
  }
  return null;
}

const perSeed = {};
let untracedTotal = 0, unclassifiedTotal = 0;
for (const seed of SEEDS) {
  const off = load(OFFDIR, seed, 'off');
  const on = load(ONDIR, seed, 'on');
  const offRefused = off.evenings.filter((e) => e.eveningOutcome === 'travel-refused');
  const onRefused = on.evenings.filter((e) => e.eveningOutcome === 'travel-refused');
  const onDetours = on.evenings.filter((e) => e.detourAttempted);
  const onHopRefusals = on.evenings.filter((e) =>
    e.detourAttempted || e.eveningOutcome === 'travel-refused');

  const detourRows = onDetours.map((e) => {
    const tc = traceCompleteness(e, on);
    if (!tc.complete) untracedTotal++;
    const d = e.detour || {};
    const steps = Array.isArray(d.steps) ? d.steps : [];
    const walkedPath = steps.filter((s) => s.moved).map((s) => [s.to.mapPx, s.to.mapPy]);
    const entrySteps = (e.delegated && e.delegated.walkTarget) ? e.delegated.walkTarget.steps : null;
    const morning = tc.morning;
    // Sense: matching lines from the detour day + the following overnight.
    const dayHits = (e.sayDayLines || []).filter((l) => SENSE_RE.test(l));
    const overHits = morning ? (morning.overnightSayLines || []).filter((l) => SENSE_RE.test(l)) : [];
    const overSplit = morning ? splitOvernight(morning.overnightSayLines) : { sleepLines: [], morningAmbient: [] };
    return {
      loopDay: e.loopDay, gameDay: e.gameDay,
      outcome: e.eveningOutcome,
      sleepLines: overSplit.sleepLines,
      sleepMarkers: overSplit.sleepLines.filter((l) => SLEEP_MARKER_RE.test(l)),
      bfsPath: d.path || null, bfsLength: Array.isArray(d.path) ? d.path.length : null,
      stepsWalked: d.stepsWalked !== undefined ? d.stepsWalked : null,
      steps: steps.map((s) => ({ from: [s.from.mapPx, s.from.mapPy], to: [s.to.mapPx, s.to.mapPy], moved: s.moved, combatLive: s.combatLive, stepError: s.stepError || null })),
      walkedPath,
      stoppedReason: d.stoppedReason || null, rescued: !!d.rescued,
      kcalBeforeDetour: d.kcalBeforeDetour !== undefined ? d.kcalBeforeDetour : null,
      kcalAfterDetour: d.kcalAfterDetour !== undefined ? d.kcalAfterDetour : null,
      kcalWalkDelta: (d.kcalAfterDetour !== undefined && d.kcalBeforeDetour !== undefined) ? (d.kcalAfterDetour - d.kcalBeforeDetour) : null,
      ticksBeforeDetour: d.ticksBeforeDetour !== undefined ? d.ticksBeforeDetour : null,
      ticksEveningPostEntry: e.dayTicks !== undefined ? e.dayTicks : null,
      entryWalkSteps: entrySteps,
      arrivalTile: e.tile, arrivalMap: [e.mapPx, e.mapPy], arrivalInside: e.inside,
      morningAfter: morning ? { loopDay: morning.loopDay, tile: morning.tile, map: [morning.mapPx, morning.mapPy], inside: morning.inside, kcal: morning.kcal } : null,
      traceComplete: tc.complete, traceMissing: tc.missing,
      senseDayHits: dayHits, senseOvernightHits: overHits,
    };
  });

  // OFF refused evenings: sense read (day lines + following overnight).
  const offRefusedRows = offRefused.map((e) => {
    const morning = off.mornings.find((m) => m.loopDay === e.loopDay + 1);
    const dayHits = (e.sayDayLines || []).filter((l) => SENSE_RE.test(l));
    const overHits = morning ? (morning.overnightSayLines || []).filter((l) => SENSE_RE.test(l)) : [];
    const overSplit = morning ? splitOvernight(morning.overnightSayLines) : { sleepLines: [], morningAmbient: [] };
    return {
      loopDay: e.loopDay, gameDay: e.gameDay,
      sleepLines: overSplit.sleepLines,
      sleepMarkers: overSplit.sleepLines.filter((l) => SLEEP_MARKER_RE.test(l)),
      blockType: e.blocktype ? e.blocktype.blockType : null,
      blockedTile: e.blocktype ? e.blocktype.blockedTile : null,
      departure: e.preStepMap, routeAroundLength: e.blocktype ? e.blocktype.routeAroundLength : null,
      routeAroundPath: e.blocktype ? e.blocktype.routeAroundPath : null,
      eveningKcal: e.kcal,
      morningAfter: morning ? { loopDay: morning.loopDay, tile: morning.tile, map: [morning.mapPx, morning.mapPy], inside: morning.inside, kcal: morning.kcal } : null,
      senseDayHits: dayHits, senseOvernightHits: overHits,
      classified: isClassifiedBlocktype(e),
    };
  });

  const unclassified = [];
  for (const e of off.evenings.concat(on.evenings)) {
    if (!KNOWN_OUTCOMES.has(e.eveningOutcome)) unclassified.push({ seed, leg: e === off.evenings ? 'off' : 'on', loopDay: e.loopDay, outcome: e.eveningOutcome });
  }
  // Refused evenings with unclassified blocktype count separately per leg.
  const refusedUnclassified = [];
  for (const [leg, file] of [['off', off], ['on', on]]) {
    for (const e of file.evenings.filter((x) => x.eveningOutcome === 'travel-refused')) {
      if (!isClassifiedBlocktype(e)) refusedUnclassified.push({ seed, leg, loopDay: e.loopDay });
    }
  }
  unclassifiedTotal += unclassified.length + refusedUnclassified.length;

  const diff = firstDiff(off.evenings, on.evenings);
  const firstDetourDay = onDetours.length ? onDetours[0].loopDay : null;

  perSeed[seed] = {
    off: {
      daysAlive: off.daysAlive, endReason: off.endReason, maxWaveUnlocked: off.maxWaveUnlocked,
      refusedCount: offRefused.length, refusedLoopDays: offRefused.map((e) => e.loopDay),
      refusedRows: offRefusedRows,
    },
    on: {
      daysAlive: on.daysAlive, endReason: on.endReason, maxWaveUnlocked: on.maxWaveUnlocked,
      detourCount: onDetours.length, detourLoopDays: onDetours.map((e) => e.loopDay),
      residualRefusedCount: onRefused.length, residualRefusedLoopDays: onRefused.map((e) => e.loopDay),
      detourRows,
    },
    offerRateOnLeg: onHopRefusals.length ? (onDetours.length / onHopRefusals.length) : null,
    offRefusedReencountered: (() => {
      // OFF-refused loopDays that are hop refusals (detour or residual refused) on the ON leg.
      const hopDays = new Set(onHopRefusals.map((e) => e.loopDay));
      const re = offRefused.filter((e) => hopDays.has(e.loopDay)).map((e) => e.loopDay);
      const notRe = offRefused.filter((e) => !hopDays.has(e.loopDay)).map((e) => e.loopDay);
      return { reencountered: re, notReencountered: notRe, rate: offRefused.length ? re.length / offRefused.length : null };
    })(),
    divergence: { firstDiff: diff, firstDetourLoopDay: firstDetourDay,
      auditPass: !diff || (firstDetourDay !== null && diff.loopDay >= firstDetourDay) },
    unclassified: { unknownOutcomes: unclassified, refusedUnclassified },
  };
}

const analysis = {
  seeds: SEEDS,
  perSeed,
  totals: { untracedDetourEvenings: untracedTotal, unclassifiedEvenings: unclassifiedTotal },
  wall: {
    note: 'NOT OBSERVABLE on 30-day pre-seat legs: no national/table/wins fields exist in these traces.',
    wave4_5: SEEDS.map((s) => ({ seed: s, offMaxWave: perSeed[s].off.maxWaveUnlocked, onMaxWave: perSeed[s].on.maxWaveUnlocked })),
    medianSurvivalDays: SEEDS.map((s) => ({ seed: s, off: perSeed[s].off.daysAlive, on: perSeed[s].on.daysAlive })),
  },
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(analysis, null, 1));
console.log('wrote ' + OUT);
for (const seed of SEEDS) {
  const p = perSeed[seed];
  console.log(`seed ${seed}: OFF refused ${p.off.refusedCount} [${p.off.refusedLoopDays}] | ON detours ${p.on.detourCount} [${p.on.detourLoopDays}] residual refused ${p.on.residualRefusedCount} | offerRateOnLeg ${p.offerRateOnLeg} | reencounter ${p.offRefusedReencountered.rate} | divergence firstDiff ${p.divergence.firstDiff ? JSON.stringify(p.divergence.firstDiff) : 'none'} auditPass ${p.divergence.auditPass}`);
  for (const r of p.on.detourRows) {
    console.log(`  detour loopDay ${r.loopDay}: bfsLen ${r.bfsLength} walked ${r.stepsWalked} outcome ${r.outcome} rescued ${r.rescued} stopped ${r.stoppedReason} kcalDelta ${r.kcalWalkDelta} ticksBefore ${r.ticksBeforeDetour} ticksPostEntry ${r.ticksEveningPostEntry} entrySteps ${r.entryWalkSteps} arrival ${r.arrivalTile} ${r.arrivalMap} inside ${r.arrivalInside} morning ${r.morningAfter ? r.morningAfter.tile + ' ' + r.morningAfter.map + ' inside ' + r.morningAfter.inside + ' kcal ' + r.morningAfter.kcal : 'NONE'} traceComplete ${r.traceComplete}`);
  }
}
console.log(`totals: untraced=${untracedTotal} unclassified=${unclassifiedTotal}`);

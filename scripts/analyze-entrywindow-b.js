#!/usr/bin/env node
// analyze-entrywindow-b.js — entry-window census analyzer (stage 2a) +
// before/after analyzer for a later judged pilot (same pair as fertrot).
// Reads a driver .jsonl (one JSON object per seed, stdout of
// fertrot-b-driver.js) and prints one summary JSON object per seed
// plus a band summary to stdout. Reuses the haulsize analyzer for the
// per-seed decomposition (day rows, failed-trip classification,
// finished-pack definition) so both arms share identical definitions.
//
// PRIMARY (per prereg, judged as a pair):
//   failedTripDayShare = pooled failed-trip days / pooled loopDays
//     (failed = >= 1 forage attempt, 0 successes), GO needs armed
//     share <= baseline share - 0.10 (10 percentage points);
//   meanDailyHaul = band mean of seed mean-daily-hauls (mean over
//     loopDays of day-row edible + shelled kcal, multisweep
//     definition), GO needs armed >= baseline (not down).
// COST BARS: median survival (inst.daysAlive) armed >= 0.8x baseline;
//   starvation deaths armed <= baseline + 1.
// DIAGNOSTICS ONLY (never rescue a primary miss): pooled mean
// finished-pack value on successful-trip days with a final live
// return, unload total, FAILED_WORKED_OUT share, fertrot counters
// (penalized menus, barren/fertile tiles, visited tiles) + pre-sweep
// predictor census (success rate by pre-sweep availableCells bucket).
'use strict';
const fs = require('fs');
const haul = require('./analyze-haulsize-b');

function isStarvationDeath(d) {
  try { return /starv|starved|hunger/.test(JSON.stringify(d || '').toLowerCase()); } catch (e) { return false; }
}

function analyzeSeedEntrywindow(inst) {
  const base = haul.analyzeSeed(inst);
  const liveByDay = new Map();
  for (const r of base.returns) liveByDay.set(r.loopDay, r);
  let finishedSum = 0, finishedN = 0;
  for (const d of base.dayRows) {
    if (d.successes <= 0) continue;
    const fin = liveByDay.get(d.loopDay);
    if (!fin) continue;
    finishedSum += fin.finished; finishedN++;
  }
  const totalDays = base.dayRows.length;
  const haulPerDay = totalDays
    ? base.dayRows.reduce((t, d) => t + (d.edibleKcal || 0) + (d.shelledKcal || 0), 0) / totalDays : 0;
  const failedDays = base.dayRows.filter((d) => d.attempts > 0 && d.successes === 0);
  const failedWorkedOut = failedDays.filter((d) => d.failedCategory === 'FAILED_WORKED_OUT').length;
  const deaths = inst.deaths || [];
  // Entry-window census: every recorded forage attempt, bucketed by
  // the PRE-SWEEP entry-window harvest count (3x3 around the entry
  // cell, sweep's own test) — the stage-2a predictor — plus the
  // whole-tile preAvail bucket for the fertrot comparison, split by
  // attempt ordinal (1st try of the day's trip vs later tries, whose
  // entry depends on the trip chain) and by failure reason.
  const ewBuckets = { zero: { attempts: 0, successes: 0 }, oneTwo: { attempts: 0, successes: 0 },
    threePlus: { attempts: 0, successes: 0 }, unknown: { attempts: 0, successes: 0 } };
  const ewByOrdinal = { first: { attempts: 0, successes: 0, zeroAttempts: 0, zeroSuccesses: 0 },
    later: { attempts: 0, successes: 0, zeroAttempts: 0, zeroSuccesses: 0 } };
  const failByReason = {};
  const failWindowGt0 = { attempts: 0 };
  let forageAttempts = 0, penalizedMenus = 0, emptyTiles = 0;
  for (const day of (inst.days || [])) {
    const ec = day.entrywindow || {};
    penalizedMenus += ec.penalizedMenus || 0; emptyTiles += ec.emptyTiles || 0;
  }
  for (const day of (inst.days || [])) {
    for (const f of (day.forages || [])) {
      forageAttempts++;
      const w = (f.entryWindow && typeof f.entryWindow.harvest === 'number') ? f.entryWindow.harvest : null;
      const b = (w == null) ? ewBuckets.unknown : (w === 0) ? ewBuckets.zero
        : (w <= 2) ? ewBuckets.oneTwo : ewBuckets.threePlus;
      b.attempts++; if (f.ok) b.successes++;
      const ord = (f.attemptOrdinal === 1) ? ewByOrdinal.first : ewByOrdinal.later;
      ord.attempts++; if (f.ok) ord.successes++;
      if (w === 0) { ord.zeroAttempts++; if (f.ok) ord.zeroSuccesses++; }
      if (!f.ok) {
        const r = f.failReason || 'other';
        failByReason[r] = (failByReason[r] || 0) + 1;
        if (w != null && w > 0) failWindowGt0.attempts++;
      }
    }
  }
  for (const k of Object.keys(ewBuckets)) {
    const b = ewBuckets[k];
    b.rate = b.attempts ? +(b.successes / b.attempts).toFixed(3) : null;
  }
  for (const k of Object.keys(ewByOrdinal)) {
    const o = ewByOrdinal[k];
    o.rate = o.attempts ? +(o.successes / o.attempts).toFixed(3) : null;
    o.zeroRate = o.zeroAttempts ? +(o.zeroSuccesses / o.zeroAttempts).toFixed(3) : null;
  }
  // Whole-tile predictor (fertrot comparison) on the same attempts.
  const tileBuckets = { zero: { attempts: 0, successes: 0 }, few: { attempts: 0, successes: 0 },
    fertile: { attempts: 0, successes: 0 }, unknown: { attempts: 0, successes: 0 } };
  for (const day of (inst.days || [])) {
    for (const f of (day.forages || [])) {
      const b = (f.preAvail == null) ? tileBuckets.unknown
        : (f.preAvail === 0) ? tileBuckets.zero
        : (f.preAvail >= 6) ? tileBuckets.fertile : tileBuckets.few;
      b.attempts++; if (f.ok) b.successes++;
    }
  }
  for (const k of Object.keys(tileBuckets)) {
    const b = tileBuckets[k];
    b.rate = b.attempts ? +(b.successes / b.attempts).toFixed(3) : null;
  }
  // Away days (fertrot 60108 lesson, secondary judged metric): a day
  // counts as away at start/end when the snapshot position differs
  // from the haven coordinates recorded in the same snapshot.
  let awayDayStarts = 0, awayDayEnds = 0, awayKnown = 0;
  for (const day of (inst.days || [])) {
    const hs = (day.start || {}).haven, he = (day.end || {}).haven;
    const ss = day.start || {}, se = day.end || {};
    if (hs && ss.pos && (ss.pos.x !== hs.x || ss.pos.y !== hs.y)) awayDayStarts++;
    if (he && se.pos && (se.pos.x !== he.x || se.pos.y !== he.y)) awayDayEnds++;
    if (hs || he) awayKnown++;
  }
  // Prediction accuracy: travelTo records where detail was present
  // before the move (non-haven only). Forage-relevant = travels that
  // immediately precede a forage attempt on the same day.
  let predTotal = 0, predMatch = 0, predDetailMissing = 0, predHaven = 0;
  const forageTravelKeys = new Set();
  for (const day of (inst.days || [])) {
    const travels = day.travels || [];
    (day.forages || []).forEach((f, i) => {
      // The travel immediately before this attempt is the last travel
      // recorded before the attempt's position in the day's travel
      // list is unknowable from order alone; use the attempt's own
      // travelEntryMatch field (driver-captured at attempt time).
      if (f.travelEntryMatch === true) predMatch++;
      if (f.travelEntryMatch === true || f.travelEntryMatch === false) predTotal++;
    });
    for (const t of travels) {
      if (!t.moved) continue;
      if (t.destType === 'haven') predHaven++;
      else if (!t.detailPresentBefore) predDetailMissing++;
    }
  }
  return Object.assign({}, base, {
    policy: inst.policy || null,
    totalDays,
    failedTripDayShare: totalDays ? failedDays.length / totalDays : null,
    meanDailyHaul: +haulPerDay.toFixed(1),
    finishedPooledMean: finishedN ? +(finishedSum / finishedN).toFixed(1) : null,
    finishedN,
    failedWorkedOutShare: failedDays.length ? failedWorkedOut / failedDays.length : null,
    starvationDeaths: deaths.filter(isStarvationDeath).length,
    survivalDays: inst.daysAlive,
    awayDayStarts, awayDayEnds,
    entrywindow: { forageAttempts, penalizedMenus, emptyTiles, predictor: ewBuckets, byOrdinal: ewByOrdinal,
      failByReason, failWindowGt0: failWindowGt0.attempts,
      prediction: { compared: predTotal, matched: predMatch,
        rate: predTotal ? +(predMatch / predTotal).toFixed(3) : null,
        detailMissingTravels: predDetailMissing, havenTravels: predHaven } },
    predictor: tileBuckets,
  });
}

function bandSummary(seedRows) {
  const totalDays = seedRows.reduce((t, s) => t + (s.totalDays || 0), 0);
  const failed = seedRows.reduce((t, s) => t + (s.failedTripDays || 0), 0);
  const surv = seedRows.map((s) => s.survivalDays || 0).sort((a, b) => a - b);
  return {
    seeds: seedRows.map((s) => s.seed),
    failedTripDays: failed, totalDays,
    failedTripDayShare: totalDays ? +(failed / totalDays).toFixed(3) : null,
    meanDailyHaul: seedRows.length ? +(seedRows.reduce((t, s) => t + (s.meanDailyHaul || 0), 0) / seedRows.length).toFixed(1) : null,
    finishedPooledMean: (() => { let sum = 0, n = 0; for (const s of seedRows) { sum += (s.finishedPooledMean || 0) * (s.finishedN || 0); n += s.finishedN || 0; } return n ? +(sum / n).toFixed(1) : null; })(),
    medianSurvival: surv.length ? surv[Math.floor(surv.length / 2)] : null,
    starvationDeaths: seedRows.reduce((t, s) => t + (s.starvationDeaths || 0), 0),
    unloadTotal: seedRows.reduce((t, s) => t + (s.unloadTotal || 0), 0),
    tripDays: seedRows.reduce((t, s) => t + (s.tripDays || 0), 0),
    maxWave: Math.max(0, ...seedRows.map((s) => s.maxWaveUnlocked || 0)),
    collapses: seedRows.filter((s) => /village-lost|village-dead|collapse/i.test(String(s.endReason || ''))).length,
    awayDayStarts: seedRows.reduce((t, s) => t + (s.awayDayStarts || 0), 0),
    awayDayEnds: seedRows.reduce((t, s) => t + (s.awayDayEnds || 0), 0),
    entrywindow: (() => {
      const ew = { zero: { attempts: 0, successes: 0 }, oneTwo: { attempts: 0, successes: 0 },
        threePlus: { attempts: 0, successes: 0 }, unknown: { attempts: 0, successes: 0 } };
      const ord = { first: { attempts: 0, successes: 0, zeroAttempts: 0, zeroSuccesses: 0 },
        later: { attempts: 0, successes: 0, zeroAttempts: 0, zeroSuccesses: 0 } };
      const failByReason = {}; let failWindowGt0 = 0, forageAttempts = 0;
      let penalizedMenus = 0, emptyTiles = 0;
      let predTotal = 0, predMatch = 0, predDetailMissing = 0, predHaven = 0;
      for (const sr of seedRows) {
        const e = sr.entrywindow || {};
        forageAttempts += e.forageAttempts || 0;
        penalizedMenus += e.penalizedMenus || 0; emptyTiles += e.emptyTiles || 0;
        for (const k of Object.keys(ew)) { ew[k].attempts += ((e.predictor || {})[k] || {}).attempts || 0; ew[k].successes += ((e.predictor || {})[k] || {}).successes || 0; }
        for (const k of Object.keys(ord)) { const o = (e.byOrdinal || {})[k] || {}; ord[k].attempts += o.attempts || 0; ord[k].successes += o.successes || 0; ord[k].zeroAttempts += o.zeroAttempts || 0; ord[k].zeroSuccesses += o.zeroSuccesses || 0; }
        for (const [k, v] of Object.entries(e.failByReason || {})) failByReason[k] = (failByReason[k] || 0) + v;
        failWindowGt0 += e.failWindowGt0 || 0;
        const pr = e.prediction || {}; predTotal += pr.compared || 0; predMatch += pr.matched || 0;
        predDetailMissing += pr.detailMissingTravels || 0; predHaven += pr.havenTravels || 0;
      }
      for (const k of Object.keys(ew)) ew[k].rate = ew[k].attempts ? +(ew[k].successes / ew[k].attempts).toFixed(3) : null;
      for (const k of Object.keys(ord)) { const o = ord[k]; o.rate = o.attempts ? +(o.successes / o.attempts).toFixed(3) : null; o.zeroRate = o.zeroAttempts ? +(o.zeroSuccesses / o.zeroAttempts).toFixed(3) : null; }
      return { forageAttempts, penalizedMenus, emptyTiles, predictor: ew, byOrdinal: ord, failByReason, failWindowGt0,
        prediction: { compared: predTotal, matched: predMatch,
          rate: predTotal ? +(predMatch / predTotal).toFixed(3) : null,
          detailMissingTravels: predDetailMissing, havenTravels: predHaven } };
    })(),
    predictor: (() => {
      const out = { zero: { attempts: 0, successes: 0 }, few: { attempts: 0, successes: 0 },
        fertile: { attempts: 0, successes: 0 }, unknown: { attempts: 0, successes: 0 } };
      for (const s of seedRows) for (const k of Object.keys(out)) {
        out[k].attempts += (s.predictor[k].attempts || 0);
        out[k].successes += (s.predictor[k].successes || 0);
      }
      for (const k of Object.keys(out)) out[k].rate = out[k].attempts ? +(out[k].successes / out[k].attempts).toFixed(3) : null;
      return out;
    })(),
  };
}

function compareBands(baseline, armed) {
  const shareDelta = (baseline.failedTripDayShare != null && armed.failedTripDayShare != null)
    ? +(armed.failedTripDayShare - baseline.failedTripDayShare).toFixed(3) : null;
  const haulDelta = (baseline.meanDailyHaul != null && armed.meanDailyHaul != null)
    ? +(armed.meanDailyHaul - baseline.meanDailyHaul).toFixed(1) : null;
  const go = shareDelta != null && shareDelta <= -0.10
    && haulDelta != null && haulDelta >= 0
    && (armed.starvationDeaths <= baseline.starvationDeaths + 1)
    && (baseline.medianSurvival ? armed.medianSurvival >= 0.8 * baseline.medianSurvival : true);
  return { shareDelta, shareBar: -0.10, haulDelta, haulBar: 0,
    costStarvationDelta: armed.starvationDeaths - baseline.starvationDeaths,
    costMedianSurvivalRatio: (baseline.medianSurvival && baseline.medianSurvival > 0)
      ? +(armed.medianSurvival / baseline.medianSurvival).toFixed(3) : null,
    go };
}

async function main() {
  const files = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const compare = process.argv.includes('--compare');
  if (!files.length) { console.error('usage: analyze-entrywindow-b.js <jsonl> [--compare <jsonl2>]'); process.exit(2); }
  const load = (f) => fs.readFileSync(f, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
  const bands = files.map((f) => {
    const rows = load(f).map(analyzeSeedEntrywindow);
    return { file: f, policy: rows[0] ? rows[0].policy : null, seeds: rows, band: bandSummary(rows) };
  });
  const out = { bands };
  if (compare && bands.length >= 2) out.comparison = compareBands(bands[0].band, bands[1].band);
  for (const b of bands) {
    console.error('entrywindow policy=' + b.policy + ' seeds=' + b.band.seeds.join(',') +
      ' failedShare=' + b.band.failedTripDayShare + ' meanDailyHaul=' + b.band.meanDailyHaul +
      ' finished=' + b.band.finishedPooledMean + ' medianSurv=' + b.band.medianSurvival +
      ' starvDeaths=' + b.band.starvationDeaths + ' unload=' + b.band.unloadTotal);
  }
  if (out.comparison) console.error('entrywindow COMPARE shareDelta=' + out.comparison.shareDelta +
    ' haulDelta=' + out.comparison.haulDelta + ' GO=' + out.comparison.go);
  process.stdout.write(JSON.stringify(out, null, 2) + '\n');
}

if (require.main === module) main().catch((e) => { console.error('ENTRYWINDOW ANALYZE CRASH', e && (e.stack || e)); process.exit(2); });
module.exports = { analyzeSeedEntrywindow, bandSummary, compareBands, isStarvationDeath };

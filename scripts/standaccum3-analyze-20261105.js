// standaccum3-analyze-20261105.js — standing-accumulation part 3 analyzer
// (arm sim-standaccum3-b). Pure function over per-seed corpus rows; no
// game reads, no re-scoring. Killer fates come from vetprod-analyze's
// killerFates (single source of truth, reused not re-implemented).
//
// FLAT-20 (prereg, all four must hold): (a) endRaw <= 25; (b) total
// wave-2+ fights >= 15; (c) over the final min(50, runDays) days of
// snapshots max(raw)-min(raw) <= 5 AND >= 3 wave-2+ fights in that
// window; (d) gated == raw on the last snapshot day (no hold can bind
// below t4=100, so a violation is an instrument anomaly, not a flat
// seed). Peaks initialize to 0, not null (encounterprod fix).
// SAME-SHAPE (the 99145 mechanism): end war 0 AND end w3pts 0 AND end
// diplomacy 0 AND end feasts <= 1.
// ACTIVITY-TRACKING (for the DIAG-NO leg): endRaw >= 100 OR
// (rawPeak - rawFirst) >= 50.
// Verdict (fresh band only; anchor is a reproduction, not a band
// member): DIAG-GO iff anchor reproduces AND >= 1 fresh FLAT-20 seed
// with SAME-SHAPE; DIAG-NO iff 0 fresh FLAT-20 AND >= 6 of 8 fresh
// activity-tracking; UNDERPOWERED iff < 4 fresh meet the activity
// floor; INSUFFICIENT-DATA iff > 2 fresh seeds carry instrument
// errors. A fresh FLAT-20 seed with a DIFFERENT decomposition counts
// in the flat-20 count but does NOT satisfy the GO leg — reported as
// a second mechanism.
// Usage: node scripts/standaccum3-analyze-20261105.js <per-seed-dir>
//   Prints a JSON summary.
'use strict';
const fs = require('fs');
const path = require('path');
const VETPROD = require(path.join(__dirname, 'vetprod-analyze-20261104'));

const ANCHOR_SEED = 99145;

function livingOnDay(fates, d) {
  return fates.filter(function (f) {
    return f.firstDay <= d && (f.deathDay == null || d < f.deathDay);
  }).length;
}

function killsByWave(row) {
  const byWave = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  (row.waveKillLog || []).forEach(function (e) { const w = (e.w | 0); if (byWave[w] != null) byWave[w]++; });
  return byWave;
}

function analyzeSeed(row) {
  const fates = VETPROD.killerFates(row);
  const daily = row.daily || [];
  const last = daily[daily.length - 1] || {};
  const endRaw = (last.raw != null) ? last.raw : 0;
  const endGated = (last.gated != null) ? last.gated : 0;
  const fights = row.fights || [];
  const w2plusFights = fights.filter(function (f) { return (f.wave | 0) >= 2; }).length;
  const w3fights = fights.filter(function (f) { return (f.wave | 0) === 3; }).length;
  const w4fights = fights.filter(function (f) { return (f.wave | 0) >= 4; }).length;
  const w5fights = fights.filter(function (f) { return (f.wave | 0) >= 5; }).length;
  const kbw = killsByWave(row);
  const w3kills = kbw[3];
  const w3outcomes = {};
  fights.filter(function (f) { return (f.wave | 0) === 3; }).forEach(function (f) {
    const o = (f.outcome == null) ? 'null' : String(f.outcome);
    w3outcomes[o] = (w3outcomes[o] | 0) + 1;
  });
  // Flatness window: final min(50, runDays) days of snapshots.
  const lastDay = daily.length ? daily[daily.length - 1].day : 0;
  const winStart = lastDay - 49;
  const winSnaps = daily.filter(function (s) { return s.day >= winStart; });
  const winRaws = winSnaps.map(function (s) { return s.raw; }).filter(function (r) { return r != null; });
  const flatBand = winRaws.length ? (Math.max.apply(null, winRaws) - Math.min.apply(null, winRaws)) : null;
  const winW2Fights = fights.filter(function (f) { return (f.wave | 0) >= 2 && f.day >= winStart; }).length;
  const rawVals = daily.map(function (s) { return s.raw; }).filter(function (r) { return r != null; });
  const rawPeak = rawVals.length ? Math.max.apply(null, rawVals) : 0;
  const rawFirst = rawVals.length ? rawVals[0] : 0;
  const gatedPeak = daily.reduce(function (m, d) { return (d.gated != null && d.gated > m) ? d.gated : m; }, 0);
  // Clause checks.
  const clauseA = endRaw <= 25;
  const clauseB = w2plusFights >= 15;
  const clauseC = flatBand != null && flatBand <= 5 && winW2Fights >= 3;
  const clauseD = endGated === endRaw;
  const failedClauses = [];
  if (!clauseA) failedClauses.push('A(endRaw>25)');
  if (!clauseB) failedClauses.push('B(w2+fights<15)');
  if (!clauseC) failedClauses.push('C(band=' + flatBand + ',winW2=' + winW2Fights + ')');
  if (!clauseD) failedClauses.push('D(gated!=raw)');
  const flat20 = clauseA && clauseB && clauseC && clauseD;
  // Same-shape decomposition at end.
  const endWar = (last.war != null) ? last.war : null;
  const endDiplomacy = (last.diplomacy != null) ? last.diplomacy : null;
  const endPlenty = (last.plenty != null) ? last.plenty : null;
  const endW3pts = (last.w3pts != null) ? last.w3pts : null;
  const endFeasts = (last.feasts != null) ? last.feasts : null;
  const sameShape = endWar === 0 && endW3pts === 0 && endDiplomacy === 0 && endFeasts != null && endFeasts <= 1;
  // Premise (standaccum2 lesson): L(d) >= 2 ever.
  const living2Days = daily.filter(function (s) { return livingOnDay(fates, s.day) >= 2; }).map(function (s) { return s.day; });
  const maxLiving = daily.reduce(function (m, s) { const L = livingOnDay(fates, s.day); return L > m ? L : m; }, 0);
  const mismatches = daily.filter(function (s) {
    const r5 = s.readiness5;
    return r5 ? (livingOnDay(fates, s.day) !== (r5.veterans | 0)) : false;
  }).length;
  const activityTracking = endRaw >= 100 || (rawPeak - rawFirst) >= 50;
  const days = [];
  daily.forEach(function (s) {
    days.push({
      day: s.day, raw: s.raw, gated: s.gated, capped: s.capped, peak: s.peak,
      war: s.war, diplomacy: s.diplomacy, plenty: s.plenty,
      warPts: s.warPts, w3pts: s.w3pts, w4pts: s.w4pts, w5pts: s.w5pts,
      links: s.links, linksSeasoned: s.linksSeasoned, linksRegionalDirect: s.linksRegionalDirect,
      feasts: s.feasts, feastLogLen: s.feastLogLen,
      defer4: s.defer4 ? s.defer4.deferred : null, defer4short: s.defer4 ? s.defer4.short : null,
      defer5: s.defer5 ? s.defer5.deferred : null, defer5short: s.defer5 ? s.defer5.short : null,
      living: livingOnDay(fates, s.day),
    });
  });
  return {
    seed: row.seed, run: row.run, days: row.days, endReason: row.endReason,
    won: !!row.won, scaleRank: row.scaleRank, unlockedWave: row.unlockedWave, maxWave: row.maxWave,
    w2plusFights: w2plusFights, w3fights: w3fights, w3kills: w3kills,
    w3killRate: w3fights ? (w3kills / w3fights) : null, w3outcomes: w3outcomes,
    w4fights: w4fights, w5fights: w5fights, killsByWave: kbw,
    endRaw: endRaw, endGated: endGated, rawPeak: rawPeak, rawFirst: rawFirst, gatedPeak: gatedPeak,
    endWar: endWar, endDiplomacy: endDiplomacy, endPlenty: endPlenty,
    endWarPts: (last.warPts != null) ? last.warPts : null,
    endW3pts: endW3pts, endW4pts: (last.w4pts != null) ? last.w4pts : null, endW5pts: (last.w5pts != null) ? last.w5pts : null,
    endLinks: (last.links != null) ? last.links : null,
    endLinksSeasoned: (last.linksSeasoned != null) ? last.linksSeasoned : null,
    endLinksRegionalDirect: (last.linksRegionalDirect != null) ? last.linksRegionalDirect : null,
    endLinksTotal: (last.linksTotal != null) ? last.linksTotal : null,
    endFeasts: endFeasts, endFeastQualityHist: last.feastQualityHist || null,
    endPerType3: last.perType3 || null, endPerType4: last.perType4 || null,
    endCapped: (last.capped != null) ? last.capped : null, endPeak: (last.peak != null) ? last.peak : null,
    endDefer4: last.defer4 || null, endDefer5: last.defer5 || null,
    flatBand: flatBand, winW2Fights: winW2Fights, flat20: flat20, failedClauses: failedClauses,
    sameShape: sameShape,
    activityTracking: activityTracking,
    killersEver: fates.length, killers: fates,
    maxLiving: maxLiving, living2Days: living2Days,
    mismatchDays: mismatches, snapshotDays: daily.length,
    instrumentErrors: (row.instrumentErrors || []).length,
    dayTable: days,
  };
}

function analyzeRows(rows) {
  const seeds = rows.map(analyzeSeed);
  const anchor = seeds.filter(function (s) { return s.seed === ANCHOR_SEED; })[0] || null;
  const fresh = seeds.filter(function (s) { return s.seed !== ANCHOR_SEED; });
  const cleanFresh = fresh.filter(function (s) { return s.instrumentErrors === 0; });
  const errFresh = fresh.filter(function (s) { return s.instrumentErrors > 0; });
  const totalErr = seeds.reduce(function (m, s) { return m + s.instrumentErrors; }, 0);
  const anchorReproduces = !!anchor && anchor.instrumentErrors === 0 && anchor.flat20 && anchor.sameShape;
  const flatFresh = cleanFresh.filter(function (s) { return s.flat20; });
  const flatSameShape = flatFresh.filter(function (s) { return s.sameShape; });
  const activityFloorFresh = cleanFresh.filter(function (s) { return s.w2plusFights >= 15; });
  const trackingFresh = cleanFresh.filter(function (s) { return s.activityTracking; });
  let verdict;
  if (errFresh.length > 2) verdict = 'INSUFFICIENT-DATA';
  else if (activityFloorFresh.length < 4) verdict = 'UNDERPOWERED';
  else if (anchorReproduces && flatSameShape.length >= 1) verdict = 'DIAG-GO';
  else if (flatFresh.length === 0 && trackingFresh.length >= 6) verdict = 'DIAG-NO';
  else if (flatFresh.length === 0) verdict = 'UNDERPOWERED';
  else verdict = 'DIAG-NO'; // flat-20 seeds exist but with a DIFFERENT decomposition: the 99145 mechanism is not reproduced; the new mechanism is named in secondMechanismSeeds
  const dayList = fresh.map(function (s) { return s.days; }).sort(function (a, b) { return a - b; });
  const medianDays = dayList.length ? ((dayList[Math.floor((dayList.length - 1) / 2)] + dayList[Math.ceil((dayList.length - 1) / 2)]) / 2) : null;
  const wall = {
    wins: fresh.filter(function (s) { return s.won; }).length,
    national: fresh.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
    table: 0,
    wave4unlocks: fresh.filter(function (s) { return (s.unlockedWave | 0) >= 4 || (s.maxWave | 0) >= 4; }).length,
    wave4faced: fresh.filter(function (s) { return s.w4fights > 0; }).length,
    wave4kills: fresh.reduce(function (m, s) { return m + s.killsByWave[4]; }, 0),
    wave5unlocks: fresh.filter(function (s) { return (s.unlockedWave | 0) >= 5; }).length,
    wave5faced: fresh.filter(function (s) { return s.w5fights > 0; }).length,
    medianDays: medianDays,
  };
  const premise = {
    seedsWithLiving2: cleanFresh.filter(function (s) { return s.living2Days.length > 0; }).map(function (s) { return s.seed; }),
    count: cleanFresh.filter(function (s) { return s.living2Days.length > 0; }).length,
  };
  return {
    verdict: verdict, n: seeds.length, nFresh: fresh.length,
    anchorReproduces: anchorReproduces,
    anchor: anchor ? { seed: anchor.seed, flat20: anchor.flat20, sameShape: anchor.sameShape, failedClauses: anchor.failedClauses, endRaw: anchor.endRaw, endWar: anchor.endWar, endDiplomacy: anchor.endDiplomacy, endPlenty: anchor.endPlenty, endW3pts: anchor.endW3pts, endFeasts: anchor.endFeasts, w2plusFights: anchor.w2plusFights, w3fights: anchor.w3fights, w3kills: anchor.w3kills } : null,
    flatFreshSeeds: flatFresh.map(function (s) { return s.seed; }),
    flatSameShapeSeeds: flatSameShape.map(function (s) { return s.seed; }),
    secondMechanismSeeds: flatFresh.filter(function (s) { return !s.sameShape; }).map(function (s) { return s.seed; }),
    trackingFreshCount: trackingFresh.length,
    activityFloorCount: activityFloorFresh.length,
    totalInstrumentErrors: totalErr, errFreshSeeds: errFresh.map(function (s) { return s.seed; }),
    premise: premise,
    wall: wall, seeds: seeds,
  };
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.indexOf('standaccum3-s') === 0 && f.endsWith('.json'); }).sort();
  const rows = files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });
  return analyzeRows(rows);
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: standaccum3-analyze-20261105.js <per-seed-dir>'); process.exit(2); }
  console.log(JSON.stringify(analyzeDir(dir), null, 2));
}

module.exports = { analyzeSeed: analyzeSeed, analyzeRows: analyzeRows, analyzeDir: analyzeDir, ANCHOR_SEED: ANCHOR_SEED };

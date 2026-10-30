#!/usr/bin/env node
// analyze-bladequota-a.js — aggregates per-seed blade-quota JSONs into the
// headline rates, decomposition votes, wall numbers and "what it would
// take" arithmetic for sim-bladequota-a. Pure aggregation; no sims.
// Usage: node scripts/analyze-bladequota-a.js [perSeedDir] [outJson]
// Defaults: evidence/2026-10-30/perseed-bladequota-a,
//   evidence/2026-10-30/sim-bladequota-a-analysis.json
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const dir = process.argv[2] || path.join(REPO, 'evidence', '2026-10-30', 'perseed-bladequota-a');
const outPath = process.argv[3] || path.join(REPO, 'evidence', '2026-10-30', 'sim-bladequota-a-analysis.json');

function medianOf(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort(function (a, b) { return a - b; });
  return s[Math.floor(s.length / 2)];
}
function meanOf(arr) {
  if (!arr.length) return null;
  return +(arr.reduce(function (a, b) { return a + b; }, 0) / arr.length).toFixed(2);
}

const files = fs.readdirSync(dir).filter(function (f) { return /^s\d+\.json$/.test(f); }).sort();
const perSeed = [];
const wall = { won: 0, nationalEver: 0, nationalFinal: 0, tableWaiting: 0, tableEntered: 0,
  wave4: 0, wave5: 0, days: [], deaths: 0, deathCauses: {} };
const classVotes = {};
const offerable = { peak: 0, final: 0 };
let classifiable = 0, reachedAllied = 0, reachedTotal = 0, shortfall = 0;
const trustGaps = [], opinionGaps = [], peakYields = [], peakTotals = [], linkCounts = [];
const counterfactualReach = { allTrusted: 0, noRefusals: 0, noCap: 0, allFixed: 0 };
const freeFaceLoss = [];

files.forEach(function (f) {
  const row = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const p = row.peak, fin = row.final;
  const hasLinkOrOmen = (p && (p.links > 0 || Object.keys(row.omenSeen || {}).length > 0));
  if (hasLinkOrOmen) classifiable++;
  const cls = p ? p.classification : 'ERROR';
  classVotes[cls] = (classVotes[cls] || 0) + 1;
  if (p) {
    if (p.alliedYield >= 10) reachedAllied++; else shortfall++;
    if (p.totalYield >= 10) reachedTotal++;
    if (p.offerable) offerable.peak++;
    peakYields.push(p.alliedYield); peakTotals.push(p.totalYield); linkCounts.push(p.links);
    const cf = p.counterfactual || {};
    if (cf.allTrusted >= 10) counterfactualReach.allTrusted++;
    if (cf.noRefusals >= 10) counterfactualReach.noRefusals++;
    if (cf.noCap >= 10) counterfactualReach.noCap++;
    if (cf.allFixed >= 10) counterfactualReach.allFixed++;
    (p.linksDetail || []).forEach(function (l) {
      if (!l.refused) {
        if (l.trust < 70) trustGaps.push(70 - l.trust);
        if (l.opinion < 10) opinionGaps.push(10 - l.opinion);
      }
      freeFaceLoss.push(l.cappedLoss || 0);
    });
  }
  if (fin && fin.offerable) offerable.final++;
  wall.won += row.won ? 1 : 0;
  wall.nationalEver += row.nationalEver ? 1 : 0;
  wall.nationalFinal += row.nationalFinal ? 1 : 0;
  wall.tableWaiting += row.tableWaiting ? 1 : 0;
  wall.tableEntered += row.tableEntered ? 1 : 0;
  if (row.waveUnlocked >= 4) wall.wave4++;
  if (row.waveUnlocked >= 5) wall.wave5++;
  wall.days.push(row.gameDays);
  wall.deaths += row.deathCount || 0;
  Object.keys(row.deathCauses || {}).forEach(function (k) {
    wall.deathCauses[k] = (wall.deathCauses[k] || 0) + row.deathCauses[k];
  });
  // Supplementary: best total yield on ANY day (peak is defined by allied
  // yield per the prereg; total at that day can be lower than the run's
  // best total day when the haven pool fluctuates).
  let maxTotal = null, maxTotalDay = null;
  (row.daily || []).forEach(function (d) {
    if (d.totalYield != null && (maxTotal == null || d.totalYield > maxTotal)) {
      maxTotal = d.totalYield; maxTotalDay = d.day;
    }
  });
  perSeed.push({
    seed: row.seed, gameDays: row.gameDays, endReason: row.endReason,
    peakDay: p ? p.day : null, peakAllied: p ? p.alliedYield : null,
    peakTotal: p ? p.totalYield : null, peakLinks: p ? p.links : null,
    maxTotalOverRun: maxTotal, maxTotalDay: maxTotalDay,
    peakClass: cls, peakOfferable: p ? p.offerable : null,
    finalAllied: fin ? fin.alliedYield : null, finalTotal: fin ? fin.totalYield : null,
    finalLinks: fin ? fin.links : null, finalOfferable: fin ? fin.offerable : null,
    omenSeen: row.omenSeen, finalOmen: row.finalOmen,
    maxRank: row.maxRank, nationalEver: row.nationalEver, won: row.won,
    waveUnlocked: row.waveUnlocked, deathCount: row.deathCount,
    counterfactual: p ? p.counterfactual : null,
  });
});

const n = perSeed.length;
const shortfallSeeds = n - reachedAllied;
let majorityConstraint = null, majorityShare = 0;
Object.keys(classVotes).forEach(function (k) {
  if (k === 'REACHED') return;
  const share = shortfallSeeds ? classVotes[k] / shortfallSeeds : 0;
  if (share > majorityShare) { majorityShare = share; majorityConstraint = k; }
});

const out = {
  seeds: n, seedList: perSeed.map(function (r) { return r.seed; }),
  headline: {
    peakAlliedReach: reachedAllied + '/' + n,
    peakTotalReach: reachedTotal + '/' + n,
    peakAlliedRate: n ? +(reachedAllied / n).toFixed(3) : null,
    peakTotalRate: n ? +(reachedTotal / n).toFixed(3) : null,
    medianPeakAllied: medianOf(peakYields), meanPeakAllied: meanOf(peakYields),
    medianPeakTotal: medianOf(peakTotals), medianPeakLinks: medianOf(linkCounts),
  },
  classifiable: classifiable + '/' + n,
  classVotes: classVotes,
  shortfallSeeds: shortfallSeeds,
  majorityConstraint: majorityConstraint, majorityShare: +majorityShare.toFixed(3),
  diagGo: classifiable >= 12 && majorityShare > 0.5,
  diagNote: 'DIAG-GO requires >= 12 classifiable (pilot band of 8 cannot satisfy it alone; the 16-seed confirm decides it) AND a strict-majority constraint.',
  offerable: offerable,
  counterfactualReach: counterfactualReach,
  whatItWouldTake: {
    linksNeededAlliedOnlyBase: 5, linksNeededWithHaven3Base: 4,
    linksNeededAlliedOnlyTrusted: 2,
    medianTrustGapSub70: medianOf(trustGaps), meanTrustGapSub70: meanOf(trustGaps),
    medianOpinionGapSub10: medianOf(opinionGaps),
    totalFreeFaceCappedLossAtPeak: freeFaceLoss.reduce(function (a, b) { return a + b; }, 0),
  },
  wall: {
    won: wall.won + '/' + n, nationalEver: wall.nationalEver + '/' + n,
    nationalFinal: wall.nationalFinal + '/' + n, tableWaiting: wall.tableWaiting + '/' + n,
    tableEntered: wall.tableEntered + '/' + n, wave4: wall.wave4 + '/' + n, wave5: wall.wave5 + '/' + n,
    medianSurvival: medianOf(wall.days), maxSurvival: wall.days.length ? Math.max.apply(null, wall.days) : null,
    deaths: wall.deaths, deathCauses: wall.deathCauses,
  },
  perSeed: perSeed,
};
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));

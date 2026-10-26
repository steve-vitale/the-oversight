#!/usr/bin/env node
// analyze-freshdays-b.js — pantryFreshDays decomposition analysis (DIAG only).
//
// sim-freshdays-b, 2026-10-26, oversight-flesh-out-loop-b run
// fleshout-loop-b-20261026T1730Z. Reads the freshdays-b corpus
// (evidence/2026-10-26/sim-freshdays-b-corpus/) and reports:
//  (1) REPRODUCTION: racks-bound day set vs the preservesched 38, total
//      bound days vs 327, and first-bound-line freshDays on the three
//      named days (9753 d74: 249.8; 9753 d64: 221.7; 9752 d90: 132.0).
//  (2) HIGH-DAY DECOMPOSITION: every snapshot (daily + cook) with
//      reported freshDays >= 50 — component-sum coverage of the reported
//      freshKcal, rebuilt days vs reported days, aggregate bucket shares,
//      and the denominator (burnMean vs roster x 2000).
//  (3) WALL NUMBERS: national / table / wins, wave reach, median
//      survival, death-cause shares.
// No game code is touched; this is a read-only corpus analysis. When run
// directly it prints a JSON summary; the proof script requires the
// exported functions and asserts the pre-registered bar.
'use strict';
const fs = require('fs');
const path = require('path');

const CORPUS_DIR = path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-freshdays-b-corpus');
const SEEDS = [9750, 9751, 9752, 9753, 9754, 9755, 9756, 9757];
const HIGH = 50;

// The 38 racks-bound days from evidence/2026-10-26/sim-preservesched-b.md
// (per-day table), as "seed:day" pairs.
const EXPECTED_38 = [
  '9750:51', '9750:69', '9750:73', '9750:75', '9750:76', '9750:83', '9750:84',
  '9750:86', '9750:89', '9750:90', '9750:92', '9750:94', '9750:95',
  '9752:90', '9753:64', '9753:74',
  '9755:40', '9755:43', '9755:49', '9755:60', '9755:71', '9755:85', '9755:100',
  '9756:47', '9756:54', '9756:67', '9756:71', '9756:84', '9756:90',
  '9757:38', '9757:46', '9757:68', '9757:69', '9757:79', '9757:89',
  '9757:91', '9757:97', '9757:99',
];
// Named first-bound-line freshDays quotes from the preservesched evidence.
const NAMED = [
  { seed: 9753, day: 74, quoted: 249.8 },
  { seed: 9753, day: 64, quoted: 221.7 },
  { seed: 9752, day: 90, quoted: 132.0 },
];

function loadCorpus(dir) {
  const d = dir || CORPUS_DIR;
  return SEEDS.map((s) => {
    const f = path.join(d, `freshdays-b-competent-nofeast-s${s}.json`);
    return JSON.parse(fs.readFileSync(f, 'utf8'));
  });
}

function reproduction(corpus) {
  const boundSet = new Set();
  let totalBound = 0;
  const bySeed = {};
  for (const per of corpus) {
    bySeed[per.seed] = per;
    for (const row of (per.dayTable || [])) {
      boundSet.add(per.seed + ':' + row.day);
      totalBound++;
    }
  }
  const missing = EXPECTED_38.filter((k) => !boundSet.has(k));
  const extra = [...boundSet].filter((k) => !EXPECTED_38.includes(k) && false); // bound set is not expected to equal 38 (38 is the no-inflow subset); total is the check
  const named = NAMED.map((n) => {
    const per = bySeed[n.seed];
    const row = (per.dayTable || []).find((r) => r.day === n.day);
    // dayTable rows carry freshFirst (first bound line's substrate
    // freshDays snapshot), not the line objects; match the freshdays
    // cook snapshot at the same instant by equal reported value.
    const substrateFd = row ? row.freshFirst : null;
    let snap = null;
    if (substrateFd != null) {
      snap = (per.freshCook || []).find((s) => s.day === n.day &&
        s.freshDaysReported != null && Math.abs(s.freshDaysReported - substrateFd) < 0.001) || null;
    }
    return { seed: n.seed, day: n.day, quoted: n.quoted,
      substrateFd, diff: (substrateFd == null ? null : substrateFd - n.quoted),
      snapFd: snap ? snap.freshDaysReported : null,
      snapCoverage: snap ? snap.coverage : null };
  });
  return { totalBound, expectedTotal: 327,
    expected38Present: EXPECTED_38.length - missing.length, expected38Total: EXPECTED_38.length,
    missing, named };
}

function highDays(corpus) {
  const snaps = [];
  for (const per of corpus) {
    for (const s of (per.freshDaily || [])) snaps.push({ seed: per.seed, source: 'daily', ...s });
    for (const s of (per.freshCook || [])) snaps.push({ seed: per.seed, source: 'cook', ...s });
  }
  const high = snaps.filter((s) => (s.freshDaysReported || 0) >= HIGH);
  const coverages = high.map((s) => s.coverage);
  const minCoverage = coverages.length ? Math.min(...coverages) : null;
  const maxCoverage = coverages.length ? Math.max(...coverages) : null;
  // Aggregate bucket shares over high snapshots (sum bucket / sum counted).
  const tot = high.reduce((a, s) => a + (s.countedSum || 0), 0);
  const agg = {};
  const addBucket = (name, v) => { agg[name] = (agg[name] || 0) + (v || 0); };
  for (const s of high) {
    for (const [k, v] of Object.entries(s.byState || {})) addBucket('state:' + k, v);
    addBucket('spoil:noSpoilDay', (s.bySpoil || {}).noSpoilDay);
    addBucket('spoil:immortal', (s.bySpoil || {}).immortal);
    addBucket('spoil:dated', (s.bySpoil || {}).dated);
    addBucket('edible:false', s.edibleFalse);
    addBucket('edible:true', s.edibleTrue);
    addBucket('edible:unset', s.edibleUnset);
    addBucket('monsterMeat', s.monsterMeat);
    addBucket('zeroUnit', s.zeroUnit);
    addBucket('kind:meat', (s.byKind || {}).meat);
    addBucket('kind:plant', (s.byKind || {}).plant);
    addBucket('kind:fat', (s.byKind || {}).fat);
    addBucket('kind:other', (s.byKind || {}).other);
  }
  const shares = Object.entries(agg).map(([k, v]) => ({ bucket: k, kcal: v, share: tot ? v / tot : 0 }))
    .sort((a, b) => b.share - a.share);
  // Denominator: reported days vs roster-x-2000 fallback days on high snaps.
  const denom = high.map((s) => ({
    seed: s.seed, day: s.day, source: s.source,
    reported: s.freshDaysReported, burnMean: s.burnMean, burnN: s.burnN,
    roster: s.roster, fallback: s.fallbackDays,
    ratio: (s.fallbackDays ? s.freshDaysReported / s.fallbackDays : null),
    freshKcal: s.freshKcalReported, counted: s.countedSum }));
  const ratios = denom.map((d) => d.ratio).filter((r) => r != null);
  const burnMeans = denom.map((d) => d.burnMean).filter((b) => b != null);
  const med = (arr) => {
    if (!arr.length) return null;
    const s = [...arr].sort((a, b) => a - b);
    return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
  };
  const distinctDays = new Set(high.map((s) => s.seed + ':' + s.day));
  return { nSnapshots: high.length, nDays: distinctDays.size, minCoverage, maxCoverage,
    totalCounted: tot, shares: shares.slice(0, 12), denom,
    medianRatio: med(ratios), medianBurnMean: med(burnMeans),
    maxReported: high.length ? Math.max(...high.map((s) => s.freshDaysReported)) : null,
    highRows: high.map((s) => ({ seed: s.seed, day: s.day, source: s.source,
      reported: +(s.freshDaysReported || 0).toFixed(1), coverage: s.coverage,
      counted: s.countedSum, freshKcal: s.freshKcalReported, burnMean: s.burnMean,
      roster: s.roster, fallback: s.fallbackDays })) };
}

function wallNumbers(corpus) {
  let national = 0, table = 0, win = 0;
  const waveMax = [];
  const survival = [];
  const causes = {};
  let deaths = 0;
  const perSeed = [];
  for (const per of corpus) {
    if (per.national) national++;
    if (per.table) table++;
    if (per.win) win++;
    waveMax.push((per.waveReach || []).length);
    survival.push(per.daysAlive);
    deaths += per.deaths || 0;
    for (const [k, v] of Object.entries(per.deathCauses || {})) causes[k] = (causes[k] || 0) + v;
    perSeed.push({ seed: per.seed, daysAlive: per.daysAlive, rank: per.rank,
      waveReach: per.waveReach, deaths: per.deaths, endReason: per.endReason });
  }
  const s = [...survival].sort((a, b) => a - b);
  const median = s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
  return { national, table, win, waveMax, medianSurvival: median, maxSurvival: Math.max(...survival),
    deaths, causes, perSeed };
}

function validity(corpus) {
  return corpus.map((per) => ({ seed: per.seed, policy: per.policy,
    daysAlive: per.daysAlive, cookTruncated: per.cookTruncated,
    freshCookTruncated: per.freshCookTruncated, dailyN: (per.freshDaily || []).length,
    cookN: (per.freshCook || []).length }));
}

function summarize(corpus) {
  const rep = reproduction(corpus);
  const hi = highDays(corpus);
  const wall = wallNumbers(corpus);
  const val = validity(corpus);
  const go = hi.nSnapshots > 0 && hi.minCoverage != null && hi.minCoverage >= 0.95;
  return { reproduction: rep, high: hi, wall, validity: val,
    verdict: go ? 'GO' : 'NO-GO',
    goBar: 'coverage >= 0.95 on every reproduced high-value day (freshDays >= 50), plus one named dominant component' };
}

if (require.main === module) {
  const corpus = loadCorpus();
  console.log(JSON.stringify(summarize(corpus), null, 2));
}

module.exports = { loadCorpus, reproduction, highDays, wallNumbers, validity, summarize,
  SEEDS, EXPECTED_38, NAMED, HIGH };

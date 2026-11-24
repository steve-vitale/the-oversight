// standingconfirm-b-summarize-20261124.js — summarize the 16-seed confirm
// corpus with the reused gearready analyzer. Pure read of per-seed JSONs;
// prints a per-seed table in the pilot's shape + pooled frozen-bar verdict.
// Usage: node scripts/standingconfirm-b-summarize-20261124.js
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'standing-gearready-b-analyze-20261124'));
const DIR = path.join(REPO, 'evidence', '2026-11-24', 'perseed-standing-gearready-b');
const SEEDS = [];
for (let s = 109310; s <= 109325; s++) SEEDS.push(s);
const rows = [];
for (const seed of SEEDS) {
  const f = path.join(DIR, 'standing-gearready-b-s' + seed + '-standingconfirm-b.json');
  if (!fs.existsSync(f)) { console.error('MISSING ' + f); process.exit(2); }
  rows.push(JSON.parse(fs.readFileSync(f, 'utf8')));
}
const sum = AN.summarizeAll(rows);
for (const s of sum.per) {
  console.log(JSON.stringify({
    seed: s.seed, days: s.days, end: s.endReason, scale: s.scaleRank,
    maxW: s.maxWave, endUW: s.endUnlockedWave, readyDays: s.readyDayCount,
    door: s.doorOpenDay, bestCapped: s.bestCapped, bestSplit: s.bestSplit,
    bestRaw: s.bestRaw, warKills: s.warKills, feasts: s.feastCount,
    ladder: s.ladderEnd, d199: s.daysAt199, d199defer5: s.daysAt199Defer5,
    d199cap: s.daysAt199Cap, nationalBlock: s.nationalBlock,
    w4faced: s.wave4Faced, w5faced: s.wave5Faced,
    diploMax: s.bestSplit.diplomacy, maxLinks: s.nationalBlockDetail ? s.nationalBlockDetail.maxActiveLinks : null,
    maxCounting: s.nationalBlockDetail ? s.nationalBlockDetail.maxCounting : null,
    readyBlockedStanding: s.readyBlockedStandingDays,
    standingOkNotReady: s.standingOkNotReadyDays,
    unclassifiedDeltas: s.unclassifiedDeltas.length, instrumentErrors: s.instrumentErrors,
    unclassifiedReleases: s.unclassifiedReleases.length,
    mismatchDays: s.mismatchDays.length,
  }));
}
console.log('POOLED ' + JSON.stringify(sum.pooled, null, 2));

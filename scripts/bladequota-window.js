#!/usr/bin/env node
// bladequota-window.js — offerable-window analysis for blade-quota legs.
// For each per-seed JSON in a dir, reports the sounded-call yield inside
// the window where the call is actually offerable (Herald omen stage >= 2):
// first stage-2 day + yield there, max allied/total yield in the window.
// Peak yield (prereg headline) can predate the omen; the window numbers
// are the ones a real player could ever act on.
// Usage: node scripts/bladequota-window.js [perSeedDir]
'use strict';
const fs = require('fs');
const path = require('path');
const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-30', 'perseed-bladequota-a-leadcourt');
const out = [];
fs.readdirSync(dir).filter(function (f) { return /^s\d+\.json$/.test(f); }).sort().forEach(function (f) {
  const r = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const off = (r.daily || []).filter(function (x) { return x.omenStage != null && x.omenStage >= 2; });
  const first = off[0] || null;
  const row = {
    seed: r.seed, policy: r.policy,
    peakAllied: r.peak ? r.peak.alliedYield : null, peakDay: r.peak ? r.peak.day : null,
    firstStage2Day: first ? first.day : null,
    yieldAtFirstStage2: first ? (first.alliedYield + '/' + first.totalYield) : null,
    offerableDays: off.length,
    maxAlliedInWindow: off.length ? Math.max.apply(null, off.map(function (x) { return x.alliedYield; })) : null,
    maxTotalInWindow: off.length ? Math.max.apply(null, off.map(function (x) { return x.totalYield; })) : null,
    finalAllied: r.final ? r.final.alliedYield : null,
  };
  out.push(row);
  console.log(JSON.stringify(row));
});

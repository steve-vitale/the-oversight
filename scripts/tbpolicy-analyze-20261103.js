// tbpolicy-analyze-20261103.js — analyzer for the TB-policy arm.
// Pure functions over tbpolicy-driver per-seed JSON. Primary metric:
// kills per TB exposure (linked kill rows on TB exposures / TB started).
// Secondary: median % of wave-4 monster HP dealt per TB fight, median
// player turns per TB fight, flee share (tbEnd 'fled' / TB started),
// barrier-push share (fights with >= 1 flee push / TB started).
// Usage: node scripts/tbpolicy-analyze-20261103.js <dir> [run-tag]
// Prints JSON summary to stdout.
'use strict';
const fs = require('fs');
const path = require('path');

function median(xs) {
  const s = xs.filter(function (x) { return x != null && Number.isFinite(x); }).sort(function (a, b) { return a - b; });
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : +((s[m - 1] + s[m]) / 2).toFixed(1);
}

function summarizeSeed(j) {
  const tb = j.tbDerived || [];
  const kills = tb.reduce(function (a, d) { return a + (d.kills || 0); }, 0);
  const killing = tb.filter(function (d) { return (d.kills || 0) > 0; }).length;
  const fled = tb.filter(function (d) { return d.result === 'fled'; }).length;
  const pushed = tb.filter(function (d) { return (d.barrierPushes || 0) > 0; }).length;
  return {
    seed: j.seed, days: j.days, endReason: j.endReason, identity: j.identity,
    spawnsW4: j.spawnsW4, tbStarted: tb.length, fieldsW4: j.fieldsW4,
    tbKills: kills, tbKillingExposures: killing,
    killsPerTbExposure: tb.length ? +(kills / tb.length).toFixed(4) : null,
    killingRate: tb.length ? +(killing / tb.length).toFixed(4) : null,
    medianHpDealtPct: median(tb.map(function (d) { return d.hpDealtPct; })),
    medianPlayerTurns: median(tb.map(function (d) { return d.playerTurns; })),
    fleeShare: tb.length ? +(fled / tb.length).toFixed(4) : null,
    fled: fled, pushedFights: pushed,
    pushShare: tb.length ? +(pushed / tb.length).toFixed(4) : null,
    barrierPushesW4: j.barrierPushesW4, zipMismatch: j.tbTurnsZipMismatch,
    errors: (j.instrumentErrors || []).length,
  };
}

function summarizeAll(files) {
  const seeds = files.map(function (f) { return summarizeSeed(JSON.parse(fs.readFileSync(f, 'utf8'))); });
  const tb = [];
  files.forEach(function (f) { const j = JSON.parse(fs.readFileSync(f, 'utf8')); (j.tbDerived || []).forEach(function (d) { tb.push(d); }); });
  const kills = tb.reduce(function (a, d) { return a + (d.kills || 0); }, 0);
  const killing = tb.filter(function (d) { return (d.kills || 0) > 0; }).length;
  const fled = tb.filter(function (d) { return d.result === 'fled'; }).length;
  const pushed = tb.filter(function (d) { return (d.barrierPushes || 0) > 0; }).length;
  const days = seeds.map(function (s) { return s.days; }).sort(function (a, b) { return a - b; });
  return {
    seeds: seeds.length, perSeed: seeds,
    pooled: {
      tbStarted: tb.length, tbKills: kills, tbKillingExposures: killing,
      killsPerTbExposure: tb.length ? +(kills / tb.length).toFixed(4) : null,
      killingRate: tb.length ? +(killing / tb.length).toFixed(4) : null,
      medianHpDealtPct: median(tb.map(function (d) { return d.hpDealtPct; })),
      medianPlayerTurns: median(tb.map(function (d) { return d.playerTurns; })),
      fleeShare: tb.length ? +(fled / tb.length).toFixed(4) : null,
      fled: fled, pushedFights: pushed,
      pushShare: tb.length ? +(pushed / tb.length).toFixed(4) : null,
      medianSurvival: median(days),
      villagesLost: seeds.filter(function (s) { return s.endReason === 'village-lost'; }).length,
    },
  };
}

if (require.main === module) {
  const dir = process.argv[2];
  const tag = process.argv[3] || '';
  if (!dir) { console.error('usage: node tbpolicy-analyze-20261103.js <dir> [run-tag]'); process.exit(2); }
  const files = fs.readdirSync(dir).filter(function (f) { return f.startsWith('tbpolicy-s') && f.endsWith('.json') && (!tag || f.indexOf('-' + tag + '.json') >= 0); })
    .sort().map(function (f) { return path.join(dir, f); });
  if (!files.length) { console.error('no per-seed files in ' + dir); process.exit(2); }
  console.log(JSON.stringify(summarizeAll(files), null, 2));
}
module.exports = { summarizeSeed: summarizeSeed, summarizeAll: summarizeAll, median: median };

// tributedeliv-analyze-20261111.js — tribute-delivery diag analyzer
// (arm sim-tributedeliv-b). Reads the per-seed corpus in
// evidence/2026-11-11/perseed-tributedeliv-b/, classifies EVERY ready-day
// with the instrument's classifyDay, and judges DIAG-GO iff 0
// UNCLASSIFIED. Writes evidence/2026-11-11/tributedeliv-b-summary.json.
// Usage: node scripts/tributedeliv-analyze-20261111.js [--dir <dir>] [--out <file>]
// Exit 0 = DIAG-GO (100% classified), 1 = DIAG-NO-GO (unclassified > 0).
'use strict';
const fs = require('fs');
const path = require('path');
const TD = require('./tributedeliv-instrument-20261111');

const args = process.argv.slice(2);
function argVal(name, dflt) {
  const i = args.indexOf(name);
  return (i >= 0 && args[i + 1]) ? args[i + 1] : dflt;
}
const DIR = argVal('--dir', path.join(__dirname, '..', 'evidence', '2026-11-11', 'perseed-tributedeliv-b'));
const OUT = argVal('--out', path.join(__dirname, '..', 'evidence', '2026-11-11', 'tributedeliv-b-summary.json'));

const files = fs.readdirSync(DIR).filter(function (f) { return f.indexOf('tributedeliv-s') === 0 && f.endsWith('.json'); }).sort();
if (!files.length) { console.error('ANALYZE STOP: no per-seed files in ' + DIR); process.exit(2); }

const perSeed = [];
let totReady = 0, totClassified = 0, totUnclassified = 0, totDeliverablePair = 0, totAttempts = 0;
const codeTotals = {};
const splitTotals = {}; // "veterans/payable" -> ready-days
const unclassifiedRows = [];

for (const f of files) {
  const run = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const daily = run.daily || [];
  const attempts = run.attempts || [];
  const readyRows = [];
  let deliverablePairDays = 0;
  const codes = {};
  for (const rec of daily) {
    if (!rec.tribute || !rec.tribute.ready) continue;
    const code = TD.classifyDay(rec, attempts);
    const key = (rec.tribute.veterans | 0) + '/' + (rec.tribute.payable | 0);
    splitTotals[key] = (splitTotals[key] || 0) + 1;
    if ((rec.tribute.payable | 0) >= 2) deliverablePairDays++;
    if (code === 'UNCLASSIFIED' || code === null) {
      totUnclassified++;
      unclassifiedRows.push({ seed: run.seed, day: rec.day, tribute: rec.tribute, deliverySeen: rec.deliverySeen });
      codes.UNCLASSIFIED = (codes.UNCLASSIFIED || 0) + 1;
    } else {
      totClassified++;
      codes[code] = (codes[code] || 0) + 1;
      codeTotals[code] = (codeTotals[code] || 0) + 1;
    }
    readyRows.push({ day: rec.day, veterans: rec.tribute.veterans, payable: rec.tribute.payable, code: code, scholarIsVeteran: !!rec.scholarIsVeteran, deliverySeen: rec.deliverySeen ? rec.deliverySeen.count : null, delivered: rec.delivered || null });
    totReady++;
  }
  totDeliverablePair += deliverablePairDays;
  totAttempts += attempts.length;
  const firstReady = readyRows.length ? readyRows[0].day : null;
  const lastReady = readyRows.length ? readyRows[readyRows.length - 1].day : null;
  perSeed.push({
    seed: run.seed, run: run.run, days: run.days, endReason: run.endReason,
    won: run.won, scaleRank: run.scaleRank, maxWave: run.maxWave, standing: run.standing,
    tributeEnd: run.tribute, retrace: run.retrace || null,
    readyDays: readyRows.length, firstReadyDay: firstReady, lastReadyDay: lastReady,
    deliverablePairDays: deliverablePairDays, codes: codes,
    attempts: attempts, tributeSays: run.tributeSays || [],
    instrumentErrors: (run.instrumentErrors || []).length,
    readyRows: readyRows,
  });
}

const daysSorted = perSeed.map(function (s) { return s.days; }).sort(function (a, b) { return a - b; });
const medianDays = daysSorted.length ? daysSorted[Math.floor(daysSorted.length / 2)] : null;
const summary = {
  arm: 'tributedeliv', dir: path.relative(path.join(__dirname, '..'), DIR),
  seeds: perSeed.map(function (s) { return s.seed; }),
  primary: { readyDays: totReady, classified: totClassified, unclassified: totUnclassified, pctClassified: totReady ? totClassified / totReady : null },
  verdict: totUnclassified === 0 && totReady > 0 ? 'DIAG-GO' : (totReady === 0 ? 'DIAG-NO-GO-NO-READY-DAYS' : 'DIAG-NO-GO'),
  codeTotals: codeTotals,
  readySplitByVeteransPayable: splitTotals,
  deliverablePairDays: totDeliverablePair,
  attemptsTotal: totAttempts,
  wall: {
    national: perSeed.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
    wins: perSeed.filter(function (s) { return s.won; }).length,
    wave5Unlocks: perSeed.filter(function (s) { return (s.maxWave | 0) >= 5; }).length,
    wave4Unlocks: perSeed.filter(function (s) { return (s.maxWave | 0) >= 4; }).length,
    medianSurvivalDays: medianDays,
    survived: perSeed.filter(function (s) { return s.endReason !== 'village-lost'; }).length,
  },
  unclassifiedRows: unclassifiedRows,
  perSeed: perSeed,
};

fs.writeFileSync(OUT, JSON.stringify(summary, null, 2) + '\n');
console.log('seeds: ' + summary.seeds.join(','));
console.log('ready-days: ' + totReady + ' classified: ' + totClassified + ' unclassified: ' + totUnclassified);
console.log('codes: ' + JSON.stringify(codeTotals));
console.log('split veterans/payable: ' + JSON.stringify(splitTotals));
console.log('deliverable-pair days: ' + totDeliverablePair + ' attempts: ' + totAttempts);
console.log('wall: national ' + summary.wall.national + '/' + perSeed.length + ' wins ' + summary.wall.wins + ' wave5 ' + summary.wall.wave5Unlocks + ' wave4 ' + summary.wall.wave4Unlocks + ' median ' + medianDays + 'd');
console.log('verdict: ' + summary.verdict);
console.log('summary: ' + path.relative(path.join(__dirname, '..'), OUT));
process.exit(summary.verdict === 'DIAG-GO' ? 0 : 1);

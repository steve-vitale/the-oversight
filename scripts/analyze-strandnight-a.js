#!/usr/bin/env node
// analyze-strandnight-a.js — stranded-night bedding-line census.
// Usage: node scripts/analyze-strandnight-a.js --dir <corpus-dir>
// Reads strandnight-trace-a.js corpora (one file per seed; the driver
// is a bankfood-trace-b.js adaptation, so files keep the
// bankfood-b-nighttravel-s<seed>.json stem) and extracts DISTINCT
// 0-action stranded nights, per the sim-strandnight-a prereg:
//   a night is a bankfood evening record with mode 'flip',
//   skip 'no-gather-target', actions.length == 0, and
//   clockAfter == clockBefore and kcalAfter == kcalBefore
//   (0-action sanity; a record meeting the first three but moving
//   clock/kcal is flagged ANOMALY and excluded from the count).
// A night CARRIES a bedding-down line iff the BEDDING_RE below
// matches any line in the FULL night transcript for that loop-day:
// daily-phase lines (row.daySayFull, falling back to
// row.eveningSayTail) OR sleep-phase lines (row.nightSay).
// The dawn wake line ('You spent the night out here...') is NOT a
// bedding-down line: it is reported separately as nightOut.
// Daily-only and sleep-only tallies are reported alongside the
// primary (full-transcript) tally, so a corpus-slice blank is
// never mistaken for a player-visible blank.
// Output: one JSON report on stdout. Never writes into the repo.
'use strict';
const fs = require('fs');
const path = require('path');

const BEDDING_RE = /you settle into|sleeping rough|bed down|beds down|make camp|camp wild|spend the night/i;
const NIGHTOUT_RE = /spent the night out here/i;

function beddingLines(lines) {
  if (!Array.isArray(lines)) return [];
  return lines.filter((l) => typeof l === 'string' && BEDDING_RE.test(l));
}
function nightOutLines(lines) {
  if (!Array.isArray(lines)) return [];
  return lines.filter((l) => typeof l === 'string' && NIGHTOUT_RE.test(l));
}
function isZeroActionNight(eve) {
  if (!eve || eve.mode !== 'flip' || eve.skip !== 'no-gather-target') return false;
  if (!Array.isArray(eve.actions) || eve.actions.length !== 0) return false;
  if (eve.clockAfter !== eve.clockBefore || eve.kcalAfter !== eve.kcalBefore) return 'anomaly';
  return true;
}
function judgeNight(seed, row) {
  // row: a strandnight driver evening row (has .bankfoodEvening).
  const eve = row.bankfoodEvening;
  const zero = isZeroActionNight(eve);
  if (zero !== true) return null;
  const dailyLines = Array.isArray(row.daySayFull) ? row.daySayFull
    : (Array.isArray(row.eveningSayTail) ? row.eveningSayTail : []);
  const nightLines = Array.isArray(row.nightSay) ? row.nightSay : [];
  const dailyBedding = beddingLines(dailyLines);
  const sleepBedding = beddingLines(nightLines);
  const nightOut = nightOutLines(nightLines);
  return {
    key: seed + '/' + row.loopDay,
    seed: parseInt(seed, 10), loopDay: row.loopDay,
    tile: row.tile || null, mx: row.mx, my: row.my,
    clockBefore: eve.clockBefore, kcalBefore: eve.kcalBefore,
    packEdibleBefore: eve.packBefore ? eve.packBefore.edibleKcal : null,
    sleepFired: !!row.sleepFired,
    dailyBedding, sleepBedding,
    carriesBedding: (dailyBedding.length + sleepBedding.length) > 0,
    carriesDailyOnly: dailyBedding.length > 0,
    carriesSleepOnly: sleepBedding.length > 0,
    nightOut: nightOut.length > 0,
    nightSayCount: nightLines.length,
    dailySayCount: dailyLines.length,
  };
}
function analyzeCorpora(corpora) {
  // corpora: [{ seed, evenings }] already parsed. Pure: no disk.
  const nights = [], anomalies = [];
  for (const corpus of corpora) {
    const seed = String(corpus.seed);
    const rows = corpus.evenings || [];
    for (const row of rows) {
      if (!row.bankfoodEvening) continue;
      const eve = row.bankfoodEvening;
      if (eve.mode === 'flip' && eve.skip === 'no-gather-target' && Array.isArray(eve.actions) && eve.actions.length === 0
        && (eve.clockAfter !== eve.clockBefore || eve.kcalAfter !== eve.kcalBefore)) {
        anomalies.push({ key: seed + '/' + row.loopDay, seed: parseInt(seed, 10), loopDay: row.loopDay,
          clockBefore: eve.clockBefore, clockAfter: eve.clockAfter, kcalBefore: eve.kcalBefore, kcalAfter: eve.kcalAfter });
        continue;
      }
      const judged = judgeNight(seed, row);
      if (judged) nights.push(judged);
    }
  }
  // Distinct by construction (one row per seed+loopDay per corpus);
  // dedupe defensively in case a corpus is ever concatenated.
  const seen = new Set(), distinct = [];
  for (const n of nights) { if (!seen.has(n.key)) { seen.add(n.key); distinct.push(n); } }
  return {
    files: corpora.length,
    distinctNights: distinct.length,
    carryingBedding: distinct.filter((n) => n.carriesBedding).length,
    carryingDailyOnly: distinct.filter((n) => n.carriesDailyOnly).length,
    carryingSleepOnly: distinct.filter((n) => n.carriesSleepOnly).length,
    withNightOut: distinct.filter((n) => n.nightOut).length,
    sleepFired: distinct.filter((n) => n.sleepFired).length,
    anomalies,
    nights: distinct,
  };
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter((x) => /^bankfood-b-nighttravel-s\d+\.json$/.test(x)).sort();
  const corpora = files.map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  const r = analyzeCorpora(corpora);
  r.corpusDir = dir;
  return r;
}

if (require.main === module) {
  const a = {};
  for (let i = 2; i < process.argv.length; i += 2) a[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
  if (!a.dir) { console.error('usage: analyze-strandnight-a.js --dir <corpus-dir>'); process.exit(2); }
  console.log(JSON.stringify(analyzeDir(a.dir), null, 2));
}

module.exports = { BEDDING_RE, NIGHTOUT_RE, beddingLines, nightOutLines, isZeroActionNight, judgeNight, analyzeCorpora, analyzeDir };

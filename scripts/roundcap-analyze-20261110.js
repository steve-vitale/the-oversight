// roundcap-analyze-20261110.js — sim-roundcap-b wild-corpus analyzer.
// Pure functions over the roundcap-wild corpus
// (evidence/2026-11-10/perseed-roundcap-b/*.json). No sims.
// Reports the round-cap walk-away census on the fresh band:
//   round-cap walk-away = field-fight row with roundCap === true
//     (engine-set, fieldFights.js:2578; rounds === 15 alone is ambiguous —
//     a morale flee can land in round 15).
// For each: beast HP at cap (buckets <=10 / <=20 / <=30 / >30), fighter HP
// at cap (vHpLeft, vHpStart), wave, monster id, one-strike-from-dead
// (mHpLeft <= vStrikeMax, instrument-computed from the fighter's wb) and
// the stricter oneStrikeStrict (mHpLeft <= vStrikeMin), plus
// trail-chaining — whether the same beast instance (instId) is met again
// later with entryHp == this fight's mHpLeft, and that meeting's outcome.
// Also counts neighboring shapes separately: round-cap rows by outcome
// (vFlee / mFlee / judges), caps at each wave, and all field fights by
// outcome. Wall numbers come from the finishersize analyzer, same shape
// as vetfinish / volleysoft.
// Usage: node scripts/roundcap-analyze-20261110.js [dir]
//   (default: evidence/2026-11-10/perseed-roundcap-b)
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const FSA = require(path.join(REPO, 'scripts', 'finishersize-analyze-20261106'));

function bucket(mHpLeft) {
  if (mHpLeft == null) return 'unknown';
  if (mHpLeft <= 10) return '<=10';
  if (mHpLeft <= 20) return '<=20';
  if (mHpLeft <= 30) return '<=30';
  return '>30';
}

function analyzeFiles(files) {
  const objs = files.map(function (f) { return JSON.parse(fs.readFileSync(f, 'utf8')); });
  const wall = FSA.analyzeFiles(files);
  const rows = [];
  objs.forEach(function (o) {
    (o.fieldFights || []).forEach(function (r) {
      const row = Object.assign({}, r);
      row.seed = o.seed;
      rows.push(row);
    });
  });
  const caps = rows.filter(function (r) { return r.roundCap === true; });
  const capRows = caps.map(function (r) {
    // Trail-chaining: later fight, same instance, entry == this mHpLeft.
    let next = null;
    if (r.instId) {
      const later = rows.filter(function (x) {
        return x.instId === r.instId && x.seq > r.seq && x.seed === r.seed;
      });
      const chained = later.filter(function (x) { return x.entryHp === r.mHpLeft; });
      if (chained.length) {
        next = { day: chained[0].day, entryHp: chained[0].entryHp, outcome: chained[0].outcome,
          rounds: chained[0].rounds, mHpLeft: chained[0].mHpLeft, roundCap: !!chained[0].roundCap };
      }
    }
    return { seed: r.seed, day: r.day, mid: r.mid, wave: r.wave, vid: r.vid,
      isScholar: !!r.isScholar, entryHp: r.entryHp, entryMaxHp: r.entryMaxHp,
      entryFrac: r.entryFrac, rounds: r.rounds, outcome: r.outcome,
      vHpStart: r.vHpStart, vHpLeft: r.vHpLeft, vHpLeftFrac: (r.vHpStart ? +(r.vHpLeft / r.vHpStart).toFixed(3) : null),
      mHpLeft: r.mHpLeft, mHpLeftFrac: r.mHpLeftFrac, mDealt: r.mDealt,
      vWb: r.vWb, vStrikeMin: r.vStrikeMin, vStrikeMax: r.vStrikeMax,
      vWeapon: r.vWeapon || null, bucket: bucket(r.mHpLeft),
      oneStrike: !!r.oneStrike, oneStrikeStrict: !!r.oneStrikeStrict,
      chainedNext: next };
  });
  const byBucket = {};
  capRows.forEach(function (x) { byBucket[x.bucket] = (byBucket[x.bucket] || 0) + 1; });
  const byWave = {};
  capRows.forEach(function (x) { const k = 'w' + x.wave; byWave[k] = (byWave[k] || 0) + 1; });
  const byOutcome = {};
  capRows.forEach(function (x) { byOutcome[x.outcome] = (byOutcome[x.outcome] || 0) + 1; });
  const fieldByWave = {};
  rows.forEach(function (r) { const k = 'w' + r.wave; fieldByWave[k] = (fieldByWave[k] || 0) + 1; });
  const fieldOutcomes = {};
  rows.forEach(function (r) { fieldOutcomes[r.outcome] = (fieldOutcomes[r.outcome] || 0) + 1; });
  const nearDead = capRows.filter(function (x) { return x.mHpLeft != null && x.mHpLeft <= 30; });
  return {
    wall: wall,
    seeds: objs.map(function (o) { return o.seed; }),
    fieldFights: rows.length,
    fieldByWave: fieldByWave,
    fieldOutcomes: fieldOutcomes,
    roundCaps: capRows,
    roundCapCount: capRows.length,
    roundCapByBucket: byBucket,
    roundCapByWave: byWave,
    roundCapByOutcome: byOutcome,
    nearDeadCount: nearDead.length,
    nearDeadOneStrike: nearDead.filter(function (x) { return x.oneStrike; }).length,
    nearDeadOneStrikeStrict: nearDead.filter(function (x) { return x.oneStrikeStrict; }).length,
    instrumentErrors: objs.reduce(function (n, o) { return n + ((o.instrumentErrors || []).length); }, 0),
  };
}

if (require.main === module) {
  const dir = process.argv[2] || path.join(REPO, 'evidence', '2026-11-10', 'perseed-roundcap-b');
  const files = fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); })
    .map(function (x) { return path.join(dir, x); });
  console.log(JSON.stringify(analyzeFiles(files), null, 2));
}
module.exports = { analyzeFiles: analyzeFiles, bucket: bucket };

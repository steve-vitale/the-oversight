// repro-funeralmend-driver.js — STAGE 0b (gate before any judged run with
// the funeralmend driver): re-run a corpus seed with the FUNERALMEND driver
// (oneRun) and compare the judged fields to the committed per-seed file.
//
// The build MUST be OFF for this check: set FUNERALMEND=0 in the
// environment (HOLDBUILD_UPKEEP/HOLDBUILD_RECLIMB are no-ops — that build
// is reverted in this branch). Compares everything except anchorCommit
// (the run's HEAD differs by construction) and the FIVE additive snapshot
// fields (pd/wpHolders/wpUpkeep/wpReclimb/fm, which the corpus files do
// not carry) plus dissolutionLines/arm/run/filename. The additive fields
// are RAW state reads and must not change any judged field — a FAIL here
// means the recorder itself diverges the run (the 2026-11-15 pilot-off
// incident: Game.winPlanStats() called stateOf(), which created
// village.winPlan, and winPlanHavenTick then seeded plans days early —
// 100201 w1 1->2 by day 5). Writes nothing into the repo.
// Usage: RUN=funeralmend-b FUNERALMEND=0
//   node scripts/repro-funeralmend-driver.js <seed> <policy> [corpusDir]
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const REPO = path.join(__dirname, '..');
const driver = require(path.join(REPO, 'scripts', 'funeralmend-driver-20261114'));

const seed = parseInt(process.argv[2] || '100201', 10);
const policy = process.argv[3] || 'competent-answercourt-b';
const corpusDir = process.argv[4] || 'evidence/2026-11-14/perseed-answercourt-confirm-b';

function hash(v) { return crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex').slice(0, 16); }
const ADDITIVE = ['pd', 'wpHolders', 'wpUpkeep', 'wpReclimb', 'fm'];
function stripSeries(series) {
  return (series || []).map(function (r) {
    var x = {};
    Object.keys(r).forEach(function (k) { if (ADDITIVE.indexOf(k) < 0) x[k] = r[k]; });
    return x;
  });
}
function stripTop(rec) {
  var x = {};
  Object.keys(rec || {}).forEach(function (k) {
    if (k === 'dissolutionLines' || k === 'arm' || k === 'run' || k === 'anchorCommit') return;
    x[k] = rec[k];
  });
  x.series = stripSeries(rec.series);
  return x;
}

(async function () {
  const file = path.join(REPO, corpusDir, 'answercourt-b-s' + seed + '-' + policy + '-answercourt-confirm-b.json');
  if (!fs.existsSync(file)) { console.log(JSON.stringify({ seed, policy, pass: false, err: 'corpus file missing: ' + file })); process.exit(2); }
  const corpus = JSON.parse(fs.readFileSync(file, 'utf8'));
  const fresh = await driver.oneRun(seed, policy);
  const fields = ['days', 'gameDays', 'endReason', 'won', 'over', 'villageLost',
    'scaleRank', 'maxWave', 'standing', 'standingRaw', 'waveKills', 'series',
    'events', 'verbEvents', 'linkLines', 'seatTakes', 'tableChoices',
    'tableState', 'earnedPaths', 'deaths', 'villagerCombatDeaths',
    'capSummary', 'ctxCounters', 'driveEnd', 'instrumentErrors', 'samples'];
  const diffs = [];
  const c = stripTop(corpus), f = stripTop(fresh);
  for (const fld of fields) {
    const a = hash(c[fld]);
    const b = hash(f[fld]);
    if (a !== b) diffs.push({ field: fld, corpusHash: a, freshHash: b });
  }
  const natDay = (d) => { for (const r of (d.series || [])) if (r.scale === 'national' || r.scale === 'global') return r.d; return null; };
  console.log(JSON.stringify({
    seed, policy, pass: diffs.length === 0, diffs,
    corpus: { days: corpus.days, endReason: corpus.endReason, scaleRank: corpus.scaleRank, natDay: natDay(corpus), maxWave: corpus.maxWave, standing: corpus.standing, deaths: (corpus.deaths || []).length, verbEvents: (corpus.verbEvents || []).length, anchorCommit: corpus.anchorCommit },
    fresh: { days: fresh.days, endReason: fresh.endReason, scaleRank: fresh.scaleRank, natDay: natDay(fresh), maxWave: fresh.maxWave, standing: fresh.standing, deaths: (fresh.deaths || []).length, verbEvents: (fresh.verbEvents || []).length, anchorCommit: fresh.anchorCommit },
  }, null, 2));
  process.exit(diffs.length === 0 ? 0 : 1);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

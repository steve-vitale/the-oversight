// repro-holdbuild-b.js — STAGE 0 (gate before any judged run): re-run a
// corpus seed with the UNMODIFIED recovered driver (oneRun) and compare
// the judged fields to the committed per-seed file.
//
// The build MUST be OFF for this check: set HOLDBUILD_UPKEEP=0 and
// HOLDBUILD_RECLIMB=0 in the environment (with both off the tick behaves
// exactly as the old code). Compares everything except anchorCommit
// (the run's HEAD differs by construction) and prints PASS/FAIL per
// field. Writes nothing into the repo.
// Usage: RUN=answercourt-confirm-b HOLDBUILD_UPKEEP=0 HOLDBUILD_RECLIMB=0
//   node scripts/repro-holdbuild-b.js <seed> <policy> [corpusDir]
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const REPO = path.join(__dirname, '..');
const driver = require(path.join(REPO, 'scripts', 'answercourt-driver-20261114'));

const seed = parseInt(process.argv[2] || '100203', 10);
const policy = process.argv[3] || 'competent-answercourt-b';
const corpusDir = process.argv[4] || 'evidence/2026-11-14/perseed-answercourt-confirm-b';

function hash(v) { return crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex').slice(0, 16); }

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
  for (const f of fields) {
    const a = hash(corpus[f]);
    const b = hash(fresh[f]);
    if (a !== b) diffs.push({ field: f, corpusHash: a, freshHash: b });
  }
  // Scalar spot values for the report.
  const natDay = (d) => { for (const r of (d.series || [])) if (r.scale === 'national' || r.scale === 'global') return r.d; return null; };
  console.log(JSON.stringify({
    seed, policy, pass: diffs.length === 0, diffs,
    corpus: { days: corpus.days, endReason: corpus.endReason, scaleRank: corpus.scaleRank, natDay: natDay(corpus), maxWave: corpus.maxWave, standing: corpus.standing, deaths: (corpus.deaths || []).length, verbEvents: (corpus.verbEvents || []).length, anchorCommit: corpus.anchorCommit },
    fresh: { days: fresh.days, endReason: fresh.endReason, scaleRank: fresh.scaleRank, natDay: natDay(fresh), maxWave: fresh.maxWave, standing: fresh.standing, deaths: (fresh.deaths || []).length, verbEvents: (fresh.verbEvents || []).length, anchorCommit: fresh.anchorCommit },
  }, null, 2));
  process.exit(diffs.length === 0 ? 0 : 1);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

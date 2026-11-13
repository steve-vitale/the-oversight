// freezeline-check-analyze-20261113.js — judge the step-1 CHECK leg
// against the prereg (evidence/2026-11-13/sim-freezeline-a-prereg.md).
// Reads evidence/2026-11-13/perseed-freezeline-a-check/*.json and prints
// per-seed freeze counts, max per seed-day, survival numbers, and the
// verdict: REPRODUCES (maxPerDay >= 2 on any seed) or KILLED-ON-CHECK
// (maxPerDay <= 1 on every seed).
// Usage: node scripts/freezeline-check-analyze-20261113.js [glob-dir]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const dir = process.argv[2] || path.join(REPO, 'evidence', '2026-11-13', 'perseed-freezeline-a-check');

function judge(maxPerDay) { return maxPerDay >= 2 ? 'REPRODUCES' : 'KILLED-ON-CHECK'; }

function main() {
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
  if (!files.length) { console.error('FREEZELINE-ANALYZE STOP: no per-seed JSON in ' + dir); process.exit(2); }
  let total = 0, worst = 0, worstSeed = null, worstDay = null, reproduces = false;
  const rows = [];
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    total += d.freezeCount;
    if (d.maxPerDay > worst) { worst = d.maxPerDay; worstSeed = d.seed; worstDay = d.maxPerDayDay; }
    if (d.maxPerDay >= 2) reproduces = true;
    rows.push({
      seed: d.seed, days: d.days, endReason: d.endReason, won: d.won,
      maxWave: d.maxWave, standing: d.standing, scaleRank: d.scaleRank,
      freezeCount: d.freezeCount, maxPerDay: d.maxPerDay, maxPerDayDay: d.maxPerDayDay,
      siblingCount: d.siblingCount, vetkillCount: d.vetkillCount,
      deaths: (d.deaths || []).length, anchor: (d.anchorCommit || '').slice(0, 12),
    });
  }
  for (const r of rows) console.log(JSON.stringify(r));
  const verdict = reproduces ? 'REPRODUCES' : 'KILLED-ON-CHECK';
  console.log(JSON.stringify({ verdict: verdict, totalFreeze: total, worstMaxPerDay: worst, worstSeed: worstSeed, worstDay: worstDay, seeds: rows.length }));
  return { verdict: verdict, total: total, worst: worst, worstSeed: worstSeed, worstDay: worstDay, rows: rows };
}

if (require.main === module) main();
module.exports = { main: main, judge: judge };

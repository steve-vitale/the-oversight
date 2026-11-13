// applystatus-check-analyze-20261113.js — judge the check leg against
// the prereg (sim-applystatus-a-prereg.md): REPRODUCES if any identical
// applyStatus freeze line fires >=2 times on the same seed-day on any
// check seed; KILLED-ON-CHECK otherwise. Also reports the freezeline-a
// control total (after-leg value across this band: 21) and bellow counts.
// Usage: node scripts/applystatus-check-analyze-20261113.js [dir]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const dir = process.argv[2] || path.join(REPO, 'evidence', '2026-11-13', 'perseed-applystatus-a-check');

function judge(maxGroupSize) { return maxGroupSize >= 2 ? 'REPRODUCES' : 'KILLED-ON-CHECK'; }

function main() {
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
  if (!files.length) { console.error('APPLYSTATUS ANALYZE STOP: no per-seed JSONs in ' + dir); process.exit(2); }
  let totalApply = 0, totalFz = 0, totalBellow = 0, worstGroup = 0, worstSeed = null;
  console.log('seed | days | end | maxWave | standing | rank | apply | max/day | worst group (size day text) | fz-ctrl | bellows');
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    totalApply += j.applyCount; totalFz += j.freezelineCount; totalBellow += j.bellowCount;
    const mg = j.maxGroup || { size: 0, day: null, line: null };
    if (mg.size > worstGroup) { worstGroup = mg.size; worstSeed = j.seed; }
    console.log([j.seed, j.days, j.endReason, j.maxWave, j.standing, j.scaleRank,
      j.applyCount, j.maxPerDay + (j.maxPerDayDay != null ? ' d' + j.maxPerDayDay : ''),
      mg.size + (mg.day != null ? ' d' + mg.day + ' ' + (mg.line || '').slice(0, 70) : ''),
      j.freezelineCount, j.bellowCount].join(' | '));
  }
  console.log('TOTAL apply=' + totalApply + ' freezeline-control=' + totalFz + ' (freezeline-a after-leg: 21) bellows=' + totalBellow + ' worstGroup=' + worstGroup + (worstSeed != null ? ' seed ' + worstSeed : ''));
  console.log('VERDICT: ' + judge(worstGroup));
}

if (require.main === module) main();
module.exports = { main: main, judge: judge };

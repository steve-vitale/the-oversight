// classify-togrescreen-b-20261104.js — outcome-class classifier for the tog rescreen arm.
// Seeds-parameterized copy of classify-toggle-b-20261104.js (same class rules).
// Usage: node scripts/classify-togrescreen-b-20261104.js <dir> <prefix> [seed,seed,...]
//   default seeds 89801-89808.
// Reads per-seed probe JSONs (any variant prefix) and prints one row per seed:
//   class: scattered | won-lesser | won-full | sat-<seat> | survived | other
//   wave5: unlockedWave>=5 OR satWaves.w5>0 (r118's uw5 seed read uw5 via
//          satWaves/wavesFaced; both signals are reported, either flags it)
//   fights/kills/vDie: census fight outcomes (committed + fast tallies alike)
// Usage: node scripts/classify-toggle-b-20261104.js <dir> <prefix>
//   e.g. node scripts/classify-toggle-b-20261104.js evidence/2026-11-04/perseed-toggle-b vfull-
const fs = require('fs');
const path = require('path');
const dir = process.argv[2], prefix = process.argv[3];
if (!dir || !prefix) { console.error('usage: classify-toggle-b-20261104.js <dir> <prefix>'); process.exit(2); }
const rows = [];
const SEEDS = process.argv[4] ? process.argv[4].split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite) : [89801, 89802, 89803, 89804, 89805, 89806, 89807, 89808];
for (const seed of SEEDS) {
  const fp = path.join(dir, prefix + seed + '.json');
  if (!fs.existsSync(fp)) { rows.push({ seed, class: 'MISSING' }); continue; }
  const d = JSON.parse(fs.readFileSync(fp, 'utf8'));
  const fights = ((d.fightCensus && d.fightCensus.fights) || []);
  const kills = fights.filter(f => f.outcome === 'vKill').length;
  const vDie = fights.filter(f => f.outcome === 'vDie').length;
  const uw = (d.veterans && d.veterans.unlockedWave) || 0;
  const w5sat = (d.satWaves && d.satWaves.w5) || 0;
  const wave5 = uw >= 5 || w5sat > 0;
  let cls;
  if (d.satDay != null && d.satSeatKind) cls = 'won-' + d.satSeatKind;
  else if (d.endReason === 'village-lost') cls = 'scattered';
  else if (d.satDay != null) cls = 'sat-unknown';
  else cls = 'other';
  rows.push({ seed, class: cls, satDay: d.satDay != null ? d.satDay : null,
    wave5, uw, w5sat, gameDays: d.gameDays, alive: d.census ? d.census.alive : null,
    fights: fights.length, kills, vDie,
    killsW4: fights.filter(f => f.outcome === 'vKill').length });
}
for (const r of rows) console.log(JSON.stringify(r));
const done = rows.filter(r => r.class !== 'MISSING');
console.log('TALLY ' + JSON.stringify({
  n: done.length,
  wonLesser: done.filter(r => r.class === 'won-lesser').length,
  scattered: done.filter(r => r.class === 'scattered').length,
  wave5seeds: done.filter(r => r.wave5).map(r => r.seed),
  medianDays: done.map(r => r.gameDays).sort((a, b) => a - b)[Math.floor(done.length / 2)],
}));

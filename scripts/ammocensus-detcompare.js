// ammocensus-detcompare.js — trajectory comparison for the determinism
// legs (recorder on vs off, same seed). Compares days, endReason,
// deaths (day/kind/who/cause), final waveKillLog, standing, scaleRank,
// maxWave; optionally compares the recorder rows themselves (on vs on).
// Usage: node scripts/ammocensus-detcompare.js <fileA.json> <fileB.json> [--rows]
// Exit 0 when identical on all compared fields, 1 otherwise.
'use strict';
const fs = require('fs');

function load(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { console.error('DETCOMPARE STOP: cannot read ' + p + ': ' + e.message); process.exit(2); }
}
function canon(v) { return JSON.stringify(v); }

const args = process.argv.slice(2);
const compareRows = args.indexOf('--rows') !== -1;
const files = args.filter(function (a) { return a !== '--rows'; });
if (files.length !== 2) { console.error('Usage: node scripts/ammocensus-detcompare.js <A.json> <B.json> [--rows]'); process.exit(2); }
const A = load(files[0]);
const B = load(files[1]);
const diffs = [];
function cmp(name, a, b) {
  if (canon(a) !== canon(b)) diffs.push(name + ': A=' + canon(a) + ' B=' + canon(b));
}
cmp('seed', A.seed, B.seed);
cmp('days', A.days, B.days);
cmp('gameDays', A.gameDays, B.gameDays);
cmp('endReason', A.endReason, B.endReason);
cmp('won', A.won, B.won);
cmp('over', A.over, B.over);
cmp('villageLost', A.villageLost, B.villageLost);
cmp('scaleRank', A.scaleRank, B.scaleRank);
cmp('maxWave', A.maxWave, B.maxWave);
cmp('unlockedWave', A.unlockedWave, B.unlockedWave);
cmp('standing', A.standing, B.standing);
cmp('endPantryKcal', A.endPantryKcal, B.endPantryKcal);
cmp('deaths', A.deaths, B.deaths);
const logA = ((A.daily || []).slice(-1)[0] || {}).waveKillLog || null;
const logB = ((B.daily || []).slice(-1)[0] || {}).waveKillLog || null;
cmp('finalWaveKillLog', logA, logB);
cmp('ready4', A.ready4, B.ready4);
cmp('ready5', A.ready5, B.ready5);
if (compareRows) {
  cmp('w4meetings', A.w4meetings, B.w4meetings);
  cmp('w4gates', A.w4gates, B.w4gates);
}
if (diffs.length) {
  console.log('DETCOMPARE DIVERGENT (' + diffs.length + ' fields):');
  diffs.forEach(function (d) { console.log('  - ' + d.slice(0, 400)); });
  process.exit(1);
}
console.log('DETCOMPARE IDENTICAL: ' + files[0] + ' == ' + files[1] + (compareRows ? ' (incl. recorder rows)' : ''));

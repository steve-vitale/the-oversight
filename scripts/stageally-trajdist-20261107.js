// stageally-trajdist-20261107.js — trajectory-distance measurement
// (arm sim-stageally-confirm2-b, blank 2 from the 0230Z list). Pure
// function over corpus JSON; no game reads, no re-scoring. Attribution
// helper only: a flipped verdict gets a distance read, never a new bar.
//
// Per-seed distance between two legs of the SAME seed (baseline vs
// staged, or same-policy across corpora):
//   D = |d wave-4 kills| + |d standing|/100 + |d maxWave|
//       + |d survival days|/150 + (pair formed on exactly one leg ? 1 : 0)
// Components are reported alongside the composite; the composite is a
// summary, not a threshold. No GO/NO-GO line is drawn on it.
// Usage:
//   node scripts/stageally-trajdist-20261107.js <dirA> <dirB>
//   (compares same seed+policy rows across two corpora, prints JSON)
//   node scripts/stageally-trajdist-20261107.js <dir>  (within-corpus
//   baseline-vs-staged per-seed distances)
'use strict';
const fs = require('fs');
const path = require('path');

function w4Kills(row) {
  return ((row.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); })).length;
}
function pairDays(row) {
  return (row.daily || []).filter(function (d) {
    return d.readiness5 && ((d.readiness5.veterans | 0) >= 2);
  }).length;
}
function features(row) {
  return {
    seed: row.seed,
    policy: row.policy,
    days: row.days != null ? row.days : 0,
    standing: row.standing != null ? row.standing : 0,
    maxWave: row.maxWave != null ? row.maxWave : 1,
    w4Kills: w4Kills(row),
    pairDays: pairDays(row),
  };
}
function distance(a, b) {
  const fa = features(a);
  const fb = features(b);
  const dKills = Math.abs(fa.w4Kills - fb.w4Kills);
  const dStanding = Math.abs(fa.standing - fb.standing) / 100;
  const dMaxWave = Math.abs(fa.maxWave - fb.maxWave);
  const dDays = Math.abs(fa.days - fb.days) / 150;
  const dPair = ((fa.pairDays > 0) !== (fb.pairDays > 0)) ? 1 : 0;
  return {
    seed: fa.seed,
    a: fa.policy + '@' + (a.run || '?'),
    b: fb.policy + '@' + (b.run || '?'),
    dKills: dKills, dStanding: +dStanding.toFixed(3), dMaxWave: dMaxWave,
    dDays: +dDays.toFixed(3), dPair: dPair,
    pairDaysA: fa.pairDays, pairDaysB: fb.pairDays,
    composite: +(dKills + dStanding + dMaxWave + dDays + dPair).toFixed(3),
  };
}
function readDir(dir, prefix) {
  prefix = prefix || 'stageally-s';
  return fs.readdirSync(dir).filter(function (f) { return f.indexOf(prefix) === 0 && f.endsWith('.json'); })
    .map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });
}
function withinCorpus(dir) {
  const rows = readDir(dir);
  const out = [];
  rows.filter(function (r) { return r.policy === 'baseline'; }).forEach(function (b) {
    const a = rows.filter(function (r) { return r.policy === 'staged' && r.seed === b.seed; })[0];
    if (a) out.push(distance(b, a));
  });
  return out.sort(function (x, y) { return x.seed - y.seed; });
}
function acrossCorpora(dirA, dirB) {
  const ra = readDir(dirA);
  const rb = readDir(dirB);
  const out = [];
  ra.forEach(function (a) {
    const b = rb.filter(function (r) { return r.seed === a.seed && r.policy === a.policy; })[0];
    if (b) out.push(distance(a, b));
  });
  return out.sort(function (x, y) { return (x.seed - y.seed) || (x.a < y.a ? -1 : 1); });
}

if (require.main === module) {
  const dirA = process.argv[2];
  const dirB = process.argv[3];
  if (!dirA) { console.error('usage: stageally-trajdist-20261107.js <dirA> [<dirB>]'); process.exit(2); }
  const result = dirB
    ? { mode: 'across-corpora', dirA: dirA, dirB: dirB, rows: acrossCorpora(dirA, dirB) }
    : { mode: 'within-corpus', dir: dirA, rows: withinCorpus(dirA) };
  console.log(JSON.stringify(result, null, 2));
}

module.exports = { features: features, distance: distance, readDir: readDir,
  withinCorpus: withinCorpus, acrossCorpora: acrossCorpora };

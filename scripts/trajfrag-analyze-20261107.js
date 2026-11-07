// trajfrag-analyze-20261107.js — trajectory-fragility analyzer
// (arm sim-trajfrag-b). Reads the trajfrag corpus
// (evidence/2026-11-07/perseed-trajfrag-b/, default, or $CORPUS) and
// prints one JSON object per seed: CLASS on both legs, fragile/stable,
// first diverging event, plus pooled wall numbers. No game code, no
// writes — read-only.
// Usage: node scripts/trajfrag-analyze-20261107.js [--corpus <dir>]
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const TRAJ = require(path.join(REPO, 'scripts', 'trajfrag-instrument-20261107'));

let corpus = path.join(REPO, 'evidence', '2026-11-07', 'perseed-trajfrag-b');
const ci = process.argv.indexOf('--corpus');
if (ci >= 0 && process.argv[ci + 1]) corpus = process.argv[ci + 1];

const files = fs.readdirSync(corpus).filter(function (f) { return /^trajfrag-s\d+-trajfrag-(unperturbed|perturbed)\.json$/.test(f); });
const bySeed = {};
files.forEach(function (f) {
  const j = JSON.parse(fs.readFileSync(path.join(corpus, f), 'utf8'));
  const s = j.seed;
  bySeed[s] = bySeed[s] || {};
  bySeed[s][j.perturbed ? 'perturbed' : 'unperturbed'] = j;
});

const seeds = Object.keys(bySeed).map(Number).sort(function (a, b) { return a - b; });
const out = { corpus: corpus, seeds: [], wall: {}, flips: 0, total: 0 };
const wallLegs = { unperturbed: { national: 0, table: 0, wins: 0, w4unlock: 0, w5unlock: 0, surv: [] }, perturbed: { national: 0, table: 0, wins: 0, w4unlock: 0, w5unlock: 0, surv: [] } };
seeds.forEach(function (seed) {
  const pair = bySeed[seed];
  if (!pair.unperturbed || !pair.perturbed) {
    out.seeds.push({ seed: seed, error: 'missing leg', hasUnperturbed: !!pair.unperturbed, hasPerturbed: !!pair.perturbed });
    return;
  }
  const u = pair.unperturbed, p = pair.perturbed;
  const cd = TRAJ.classDiff(u, p);
  const div = TRAJ.firstDivergence(u, p);
  const entry = {
    seed: seed,
    fragile: cd.fragile, diffs: cd.diffs,
    unperturbed: cd.a, perturbed: cd.b,
    firstDivergence: div.first, dailyDiff: div.daily, killDiff: div.kills, deathDiff: div.deaths,
    errors: (u.instrumentErrors || []).length + (p.instrumentErrors || []).length,
    anchors: { unperturbed: u.anchorCommit, perturbed: p.anchorCommit },
  };
  out.seeds.push(entry);
  out.total += 1;
  if (cd.fragile) out.flips += 1;
  [u, p].forEach(function (leg, i) {
    const w = i === 0 ? wallLegs.unperturbed : wallLegs.perturbed;
    const rank = leg.scaleRank || '';
    if (rank === 'national' || rank === 'global') w.national += 1;
    // Table: this per-seed record carries no table-sitting event (the
    // stageally instrument does not capture tableSeat); wins are 0, so
    // 0 sittings is the instrument's reading — same basis as the confirm.
    if (leg.won) { w.wins += 1; }
    if ((leg.unlockedWave | 0) >= 4) w.w4unlock += 1;
    if ((leg.unlockedWave | 0) >= 5) w.w5unlock += 1;
    w.surv.push(leg.days);
  });
});
function median(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
Object.keys(wallLegs).forEach(function (k) {
  const w = wallLegs[k];
  w.medianSurvival = median(w.surv);
  w.n = w.surv.length;
});
out.wall = wallLegs;
out.flipRate = out.total ? (out.flips / out.total) : null;
console.log(JSON.stringify(out, null, 2));

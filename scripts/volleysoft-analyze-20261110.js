// volleysoft-analyze-20261110.js — sim-volleysoft-b wild-corpus analyzer.
// Pure functions over the volleysoft-wild corpus
// (evidence/2026-11-10/perseed-volleysoft-b/*.json). No sims.
// Reports the volley-softened window on the fresh band:
//   volley-softened meeting = wave >= 4, volley.dmg > 0, entryFrac >= 0.15,
//   post-volley frac (entryHp - volley.dmg)/entryMaxHp < 0.15, post-volley HP > 0.
// For each: remainder, what happened next (outcome / rounds / vHpLeft /
// mDealt), and trail-chaining — whether the same instance (instId) is met
// again later with entryHp == this fight's mHpLeft, and that meeting's
// outcome. Also counts the neighboring shapes separately: volley kills,
// volley-touched meetings already below break at entry, and every
// fsNoCommitWhy === 'volley-damage' row.
// Usage: node scripts/volleysoft-analyze-20261110.js [dir]
//   (default: evidence/2026-11-10/perseed-volleysoft-b)
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const FSA = require(path.join(REPO, 'scripts', 'finishersize-analyze-20261106'));

function isVolleySoftened(r) {
  if (!r || (r.wave | 0) < 4) return false;
  const vdmg = (r.volley && r.volley.dmg) || 0;
  if (!(vdmg > 0)) return false;
  if (r.entryHp == null || r.entryMaxHp == null) return false;
  if (!(r.entryFrac >= 0.15)) return false;
  const post = r.entryHp - vdmg;
  if (!(post > 0)) return false;
  return (post / r.entryMaxHp) < 0.15;
}
function isVolleyTouchedBelowBreak(r) {
  // Neighboring shape: met already below break AND the volley dealt damage
  // (wall-delivered, volley-touched) — NOT volley-softened by the prereg bar.
  if (!r || (r.wave | 0) < 4) return false;
  const vdmg = (r.volley && r.volley.dmg) || 0;
  return vdmg > 0 && r.entryFrac != null && r.entryFrac < 0.15;
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
  const w4 = rows.filter(function (r) { return (r.wave | 0) >= 4; });
  const vs = w4.filter(isVolleySoftened).map(function (r) {
    const post = r.entryHp - r.volley.dmg;
    // Trail-chaining: later fight, same instance, entry == this mHpLeft.
    let next = null;
    if (r.instId) {
      const later = rows.filter(function (x) {
        return x.instId === r.instId && x.seq > r.seq && x.seed === r.seed;
      });
      const chained = later.filter(function (x) { return x.entryHp === r.mHpLeft; });
      if (chained.length) {
        next = { day: chained[0].day, entryHp: chained[0].entryHp, outcome: chained[0].outcome,
          rounds: chained[0].rounds, mHpLeft: chained[0].mHpLeft };
      }
    }
    return { seed: r.seed, day: r.day, mid: r.mid, vid: r.vid,
      entryHp: r.entryHp, entryMaxHp: r.entryMaxHp, entryFrac: r.entryFrac,
      volley: r.volley, remainder: post, remainderFrac: +(post / r.entryMaxHp).toFixed(3),
      fsWhy: r.fsNoCommitWhy || null, outcome: r.outcome, rounds: r.rounds,
      vHpLeft: r.vHpLeft, mHpLeft: r.mHpLeft, mDealt: r.mDealt,
      regenSuspect: !!r.regenSuspect, chainedNext: next };
  });
  const touched = w4.filter(isVolleyTouchedBelowBreak);
  const volleyKills = w4.filter(function (r) {
    const vdmg = (r.volley && r.volley.dmg) || 0;
    return vdmg > 0 && r.entryHp != null && (r.entryHp - vdmg) <= 0 && r.outcome === 'vKill';
  });
  const volleyDamageRows = w4.filter(function (r) { return r.fsNoCommitWhy === 'volley-damage'; });
  const volleyRows = w4.filter(function (r) { return r.volley && (r.volley.dmg | 0) > 0; });
  return {
    wall: wall,
    seeds: objs.map(function (o) { return o.seed; }),
    w4fieldRows: w4.length,
    volleyRows: volleyRows.length,
    volleySoftened: vs,
    volleySoftenedCount: vs.length,
    volleySoftenedOutcomes: (function () { const o = {}; vs.forEach(function (x) { o[x.outcome] = (o[x.outcome] || 0) + 1; }); return o; })(),
    volleyTouchedBelowBreak: touched.length,
    volleyKills: volleyKills.length,
    volleyDamageWhyRows: volleyDamageRows.length,
    instrumentErrors: objs.reduce(function (n, o) { return n + ((o.instrumentErrors || []).length); }, 0),
  };
}

if (require.main === module) {
  const dir = process.argv[2] || path.join(REPO, 'evidence', '2026-11-10', 'perseed-volleysoft-b');
  const files = fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); })
    .map(function (x) { return path.join(dir, x); });
  console.log(JSON.stringify(analyzeFiles(files), null, 2));
}
module.exports = { analyzeFiles: analyzeFiles, isVolleySoftened: isVolleySoftened,
  isVolleyTouchedBelowBreak: isVolleyTouchedBelowBreak };

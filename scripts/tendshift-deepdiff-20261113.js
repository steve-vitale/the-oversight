// tendshift-deepdiff-20261113.js — deep-identity comparison for
// arm sim-tendshift-a: interaction corpus vs baseline corpus on the
// same matched-band seeds.
//
// METHOD (pre-registered in evidence/2026-11-13/
// sim-tendshift-a-prereg.md): per-day 4-field signature
// (vetsW3.count, vetsW4.count, waveKillLog length, roster length)
// + full daily-snapshot deep-diff. Snapshots are paired
// INDEX-ALIGNED, never day-keyed: each corpus carries TWO snapshots
// stamped with the loss day (the daily snapshot plus the final
// post-run snapshot), and a day-keyed map pairs the wrong two — the
// gap-candidates prereg §0 correction. Veteran killers in the
// instrument are keyed `by`, not `vid`.
//
// Usage:
//   node scripts/tendshift-deepdiff-20261113.js <dirA> <dirB> [seed ...]
//   (defaults: dirA = perseed-tendshift-a-baseline,
//    dirB = perseed-tendshift-a-interaction, seeds 190391–190398)
// Exits 0 when every compared seed was read; the per-seed verdict
// (DEEP-IDENTICAL vs DIVERGES) is printed, never the exit code.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const RUN = 'tendshift-pilot';
const MODE = 'master';

function perSeedFile(seed, dir) {
  return path.join(dir, 'tendshift-s' + seed + '-' + RUN + '-' + MODE + '.json');
}

// The 4-field signature of one daily snapshot. NOT deaths-so-far.
function signatureOf(snap) {
  if (!snap) return null;
  return [
    (snap.vetsW3 && snap.vetsW3.count) || 0,
    (snap.vetsW4 && snap.vetsW4.count) || 0,
    (snap.waveKillLog || []).length,
    (snap.roster || []).length,
  ];
}

function sigEqual(a, b) {
  if (!a || !b) return a === b;
  return a.length === b.length && a.every(function (v, i) { return v === b[i]; });
}

// Stable stringify: object keys sorted, so key order never counts
// as a difference.
function stableStringify(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(stableStringify).join(',') + ']';
  const keys = Object.keys(v).sort();
  return '{' + keys.map(function (k) { return JSON.stringify(k) + ':' + stableStringify(v[k]); }).join(',') + '}';
}

function deepEqual(a, b) {
  return stableStringify(a) === stableStringify(b);
}

// First differing field path between two values, for the report.
// Returns null when equal.
function firstDiffPath(a, b, prefix) {
  prefix = prefix || '';
  if (deepEqual(a, b)) return null;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return prefix || '(value)';
  }
  if (Array.isArray(a) !== Array.isArray(b)) return prefix || '(shape)';
  if (Array.isArray(a)) {
    const n = Math.max(a.length, b.length);
    for (let i = 0; i < n; i++) {
      if (i >= a.length || i >= b.length) return prefix + '[' + i + ']';
      const d = firstDiffPath(a[i], b[i], prefix + '[' + i + ']');
      if (d) return d;
    }
    return prefix || '(array)';
  }
  const keys = {};
  for (const k of Object.keys(a)) keys[k] = true;
  for (const k of Object.keys(b)) keys[k] = true;
  for (const k of Object.keys(keys).sort()) {
    if (!(k in a) || !(k in b)) return prefix ? prefix + '.' + k : k;
    const d = firstDiffPath(a[k], b[k], prefix ? prefix + '.' + k : k);
    if (d) return d;
  }
  return prefix || '(object)';
}

// Pair two daily arrays INDEX-ALIGNED (never day-keyed) and compare.
// Returns the first signature divergence and the first full
// deep-diff divergence, each as { index, dayA, dayB } (days are the
// snapshots' own stamps, reported only — the pairing is by index).
function compareSeed(dailyA, dailyB) {
  const a = dailyA || [];
  const b = dailyB || [];
  const n = Math.min(a.length, b.length);
  let firstSig = null;
  let firstFull = null;
  let sigDiffDays = 0;
  for (let i = 0; i < n; i++) {
    const sa = signatureOf(a[i]);
    const sb = signatureOf(b[i]);
    if (!sigEqual(sa, sb)) {
      sigDiffDays++;
      if (!firstSig) firstSig = { index: i, dayA: a[i].day, dayB: b[i].day, sigA: sa, sigB: sb };
    }
    if (!firstFull && !deepEqual(a[i], b[i])) {
      firstFull = { index: i, dayA: a[i].day, dayB: b[i].day, path: firstDiffPath(a[i], b[i]) };
    }
  }
  const lengthDiff = a.length !== b.length ? { lenA: a.length, lenB: b.length } : null;
  return {
    identical: !firstSig && !firstFull && !lengthDiff,
    firstSig: firstSig,
    firstFull: firstFull,
    sigDiffDays: sigDiffDays,
    compared: n,
    lengthDiff: lengthDiff,
  };
}

// Day-keyed pairing (the WRONG method, kept only so the proof can
// demonstrate the mis-pairing on duplicate loss-day stamps).
function compareSeedDayKeyed(dailyA, dailyB) {
  const byDayB = {};
  for (const s of (dailyB || [])) byDayB[s.day] = s; // last one wins
  let firstFull = null;
  let compared = 0;
  for (const s of (dailyA || [])) {
    const t = byDayB[s.day];
    if (!t) continue;
    compared++;
    if (!firstFull && !deepEqual(s, t)) {
      firstFull = { day: s.day, path: firstDiffPath(s, t) };
    }
  }
  return { identical: !firstFull, firstFull: firstFull, compared: compared };
}

function main() {
  const dirA = process.argv[2] || path.join(REPO, 'evidence', '2026-11-13', 'perseed-tendshift-a-baseline');
  const dirB = process.argv[3] || path.join(REPO, 'evidence', '2026-11-13', 'perseed-tendshift-a-interaction');
  const seeds = process.argv.slice(4).map(function (s) { return parseInt(s, 10); }).filter(Number.isFinite);
  const list = seeds.length ? seeds : SEEDS;
  let ok = true;
  for (const seed of list) {
    const fa = perSeedFile(seed, dirA);
    const fb = perSeedFile(seed, dirB);
    if (!fs.existsSync(fa) || !fs.existsSync(fb)) {
      console.log('seed ' + seed + ': MISSING ' + (!fs.existsSync(fa) ? fa : fb));
      ok = false;
      continue;
    }
    const a = JSON.parse(fs.readFileSync(fa, 'utf8'));
    const b = JSON.parse(fs.readFileSync(fb, 'utf8'));
    const c = compareSeed(a.daily, b.daily);
    if (c.identical) {
      console.log('seed ' + seed + ': DEEP-IDENTICAL (' + c.compared + ' snapshots)');
    } else {
      const sig = c.firstSig ? ('first sig-diff idx ' + c.firstSig.index + ' (day ' + c.firstSig.dayA + ' vs ' + c.firstSig.dayB + ': ' + JSON.stringify(c.firstSig.sigA) + ' vs ' + JSON.stringify(c.firstSig.sigB) + ', ' + c.sigDiffDays + ' sig-diff days)') : 'no sig-diff';
      const full = c.firstFull ? ('first full-diff idx ' + c.firstFull.index + ' (day ' + c.firstFull.dayA + ' vs ' + c.firstFull.dayB + ': ' + c.firstFull.path + ')') : 'no full-diff';
      const len = c.lengthDiff ? (' LENGTH ' + c.lengthDiff.lenA + ' vs ' + c.lengthDiff.lenB) : '';
      console.log('seed ' + seed + ': DIVERGES — ' + sig + '; ' + full + len);
    }
  }
  process.exit(ok ? 0 : 1);
}

if (require.main === module) main();

module.exports = {
  SEEDS: SEEDS, RUN: RUN, MODE: MODE,
  signatureOf: signatureOf, sigEqual: sigEqual,
  stableStringify: stableStringify, deepEqual: deepEqual,
  firstDiffPath: firstDiffPath,
  compareSeed: compareSeed, compareSeedDayKeyed: compareSeedDayKeyed,
  perSeedFile: perSeedFile,
};

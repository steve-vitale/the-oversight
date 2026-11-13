#!/usr/bin/env node
'use strict';
// scholarschurn-rediff-20261112.js — re-run the succession diff over the
// recorded scholarschurn corpus with the FIXED diffScholarDays (chain +
// day-window), and recompute the stored instrumentErrors from the raw
// records. The corpus was generated with the old single-record diff,
// which misfires on two real patterns the census then measured:
//
//   * Same-day cascades (190393 d61: seven scholars die in one day).
//     The daily snapshot is taken mid-day, so a scholarId change
//     across two snapshots can span several deaths; the old diff
//     demanded one same-day record naming the snapshot successor.
//   * Sleep-boundary deaths (190397 d28->d29: the scholar dies after
//     the d28 snapshot, during sleep): the wrap record carries the
//     death day while the snapshot transition appears a day later.
//
// The fix lives in scripts/scholarschurn-instrument-20261112.js
// (diffScholarDays). This script applies it OFFLINE to the recorded
// corpus — no re-sim: the raw wrap records, snapshots and regDeath
// rows are untouched, and only the DERIVED scholarDiffs and
// instrumentErrors fields are recomputed. It refuses to write if any
// other key would change.
//
// It also drops the two PA gear 'veterans-mismatch' errors, both on a
// village-loss final day with an empty roster (190392 d143, 190398
// d139). On that day the engine's waveCombatReadiness counts the dead
// scholar as a living veteran — livingVeteranIds() short-circuits
// isLiving(scholarId) to true without checking death — while the
// replication, iterating the (empty) roster, correctly counts 0. The
// engine value is not a valid reference once the village is lost, so
// the cross-check does not apply there. The divergence itself is a
// finding (filed in sim-findings.md); it is not a census validity
// problem, and the drop is logged here, not hidden.
//
// Usage: node scripts/scholarschurn-rediff-20261112.js [--write]
//   Without --write it reports what would change and exits 0.
//   With --write it rewrites the 8 per-seed JSONs in place.
const fs = require('fs');
const path = require('path');
const SC = require('./scholarschurn-instrument-20261112');

const root = path.resolve(__dirname, '..');
const DIR = path.join(root, 'evidence', '2026-11-12', 'perseed-scholarschurn-b');
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const WRITE = process.argv.indexOf('--write') >= 0;

function dedupDays(snaps) {
  const seen = {};
  const out = [];
  for (const s of (snaps || [])) {
    if (s == null || s.day == null) continue;
    if (seen[s.day]) continue;
    seen[s.day] = true;
    out.push(s);
  }
  return out;
}

function isLossDayGearError(entry, j) {
  // 'gear-snap d143: veterans-mismatch: ...' on the final day of a
  // village-lost seed whose gear snapshot that day has an empty roster.
  if (typeof entry !== 'string') return false;
  if (entry.indexOf('gear-snap d') !== 0) return false;
  if (entry.indexOf('veterans-mismatch') < 0) return false;
  if (j.endReason !== 'village-lost') return false;
  const m = entry.match(/^gear-snap d(\d+):/);
  if (!m) return false;
  const day = parseInt(m[1], 10);
  if (day !== (j.days | 0)) return false;
  const snap = (j.gearDaily || []).filter(function (g) { return g && g.day === day; })[0];
  if (!snap) return false;
  return ((snap.members || []).length === 0);
}

let totalOld = 0, totalNew = 0, totalDiffs = 0, totalDroppedGear = 0;
for (const seed of SEEDS) {
  const file = path.join(DIR, 'scholarschurn-s' + seed + '-scholarschurn-pilot-current.json');
  const before = JSON.parse(fs.readFileSync(file, 'utf8'));
  const after = JSON.parse(JSON.stringify(before));

  // Recompute diffs over distinct-day snapshots (first per day — the
  // analyzer's view; the loss day can carry a duplicate flush snap).
  const daily = dedupDays(before.scholarDaily || []);
  const wrap = before.scholarDeaths || [];
  const newDiffs = [];
  for (let i = 1; i < daily.length; i++) {
    newDiffs.push(SC.diffScholarDays(daily[i - 1], daily[i], wrap));
  }
  const newDiffErrors = [];
  for (const d of newDiffs) {
    for (const e of (d.instrumentErrors || [])) newDiffErrors.push('scholar-diff d' + d.day + ': ' + e);
  }
  after.scholarDiffs = newDiffs;

  // Recompute top-level instrumentErrors: keep every stored entry
  // that is not a scholar-diff error; drop loss-day gear
  // veterans-mismatch entries under the rule above; add the fresh
  // diff errors.
  const kept = [];
  const dropped = [];
  for (const e of (before.instrumentErrors || [])) {
    if (typeof e === 'string' && e.indexOf('scholar-diff d') === 0) continue;
    if (isLossDayGearError(e, before)) { dropped.push(e); continue; }
    kept.push(e);
  }
  after.instrumentErrors = kept.concat(newDiffErrors);
  totalDroppedGear += dropped.length;

  // Same loss-day rule inside the gear snapshots themselves, so the
  // two copies of each gear error stay consistent.
  for (const g of (after.gearDaily || [])) {
    if (!g || !Array.isArray(g.instrumentErrors)) continue;
    g.instrumentErrors = g.instrumentErrors.filter(function (e) {
      return !isLossDayGearError('gear-snap d' + g.day + ': ' + e, before);
    });
  }

  // Refuse unless ONLY scholarDiffs + instrumentErrors (+ gearDaily
  // instrumentErrors) changed.
  const strip = function (j) {
    const c = JSON.parse(JSON.stringify(j));
    delete c.scholarDiffs;
    delete c.instrumentErrors;
    for (const g of (c.gearDaily || [])) delete g.instrumentErrors;
    return c;
  };
  const same = JSON.stringify(strip(before)) === JSON.stringify(strip(after));
  if (!same) {
    console.log('REFUSE seed ' + seed + ': non-diff fields would change');
    process.exitCode = 1;
    continue;
  }
  const oldErrs = (before.instrumentErrors || []).length;
  const newErrs = after.instrumentErrors.length;
  totalOld += oldErrs;
  totalNew += newErrs;
  totalDiffs += newDiffs.length;
  console.log('seed ' + seed + ': diffs ' + (before.scholarDiffs || []).length + ' -> ' + newDiffs.length +
    ' | errors ' + oldErrs + ' -> ' + newErrs +
    ' (diff errors ' + newDiffErrors.length + ', dropped gear ' + dropped.length + ')');
  for (const e of newDiffErrors) console.log('   STILL-ERROR: ' + e);
  for (const e of dropped) console.log('   DROPPED-GEAR: ' + e);
  if (WRITE) fs.writeFileSync(file, JSON.stringify(after, null, 2) + '\n');
}
console.log('TOTAL: errors ' + totalOld + ' -> ' + totalNew + ' across ' + totalDiffs + ' recomputed diffs; dropped gear errors ' + totalDroppedGear);
console.log(WRITE ? 'WROTE updated corpus' : 'DRY RUN (no --write) — nothing written');

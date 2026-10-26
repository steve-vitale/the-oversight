#!/usr/bin/env node
// d2scan-b.js — D2 v2, the causal-order fix for the decomposition bar.
//
// Defect fixed (see evidence/2026-10-25/sim-d2fix-b.md, pre-registered):
// the old D2 treated every step zero as an independent rival cause.
// In a chain it is not: (1) a top-of-chain zero ENTAILS every
// downstream zero (no cook -> no conversion -> no preserved stock ->
// the racks-full guard can never fire), so downstream zeros are
// shadows, not candidates; (2) the racks-full guard is an INHIBITOR,
// so it causes a zero by FIRING (guard shut while a cook resolves
// and surplus waits), never by being absent — raw guard days are
// never candidates, only guard-BLOCKING days are, and only under
// the conjunction: blocking day under ON, batches 0 on that side,
// a cook resolving on that side.
//
// This module is pure (no I/O, no game code) so the next staffing
// diag can reuse it: scanPair({off:{pd0,pd1}, on:{pd0,pd1}}) where
// each cell is a per-seed file object (or a synthetic cell with
// the same fields). CLI mode reads 4 corpus files from a directory
// given as argv[2] with an optional filename prefix argv[3].
//   node scripts/d2scan-b.js <corpusDir> [prefix]
// Default corpus: evidence/2026-10-25/sim-onzero9754-b-corpus,
// prefix "onzero9754-b" (assign files excluded: the CLI loads only
// the main 4 cells; the assign sub-proof lives in test-d2fix-b.js).
'use strict';

const villagerCooking = (d) => {
  let t = 0;
  for (const [k, v] of Object.entries(d.cookingByVid || {})) if (k !== 'player') t += v;
  return t;
};
// A snapshot day is guard-BLOCKING iff the guard fires for at least
// one skill level AND after-reserve surplus exists AND a cook is
// staffed that day. LOOSE (documented): the snapshot does not carry
// the staffed cook's skill, so a day where only a low-skill cap is
// exceeded may count though a high-skill cook would not be blocked.
// Candidacy additionally requires a cook resolving (villagerCooking
// > 0) and batches == 0 on that side, which bounds the risk: a
// guard-blocked village has resolving cooks and zero batches.
const blockingDays = (d) => (d.snapshots || []).filter((s) =>
  s && Object.values(s.racksFull || {}).some(Boolean) &&
  (s.afterReserveKcal || 0) > 0 && (s.cooks || []).length > 0).length;

const cellFields = (d) => ({
  villagerCooking: villagerCooking(d),
  eligibleDays: (d.snapAgg || {}).daysEligibleGt0,
  afterReserveDays: (d.snapAgg || {}).daysAfterReserveGt0,
  batches: d.preserveVillagerBatches,
  resolutions: d.preserveVillagerResolutions,
  blockingDays: blockingDays(d),
  racksFullDays: (d.snapAgg || {}).racksFullDays || {},
});

const THROUGHPUT = ['villagerCooking', 'eligibleDays', 'afterReserveDays'];
// Entailment edges (pruner -> pruned): eligible pile -> after-reserve
// surplus (after-reserve is computed FROM the eligible pile).
const ENTAILS = { eligibleDays: ['afterReserveDays'] };

function scanPair(pair) {
  const f = {};
  for (const arm of ['off', 'on']) for (const side of ['pd0', 'pd1'])
    f[`${arm}/${side}`] = cellFields(pair[arm][side]);
  // Null-pair: no contrast at all (OFF and ON identical per side on
  // every scan field) -> nothing is attributable to the arm.
  const identical = ['pd0', 'pd1'].every((side) =>
    JSON.stringify(f[`off/${side}`]) === JSON.stringify(f[`on/${side}`]));
  if (identical) {
    return { status: 'NO-STEP', named: null, throughput: [], shadows: [],
      inhibitor: false, detail: 'null pair: OFF and ON identical, no contrast to explain', fields: f };
  }
  // Throughput candidates: ON == 0 both sides, OFF > 0 at least one.
  const raw = THROUGHPUT.filter((st) =>
    f['on/pd0'][st] === 0 && f['on/pd1'][st] === 0 &&
    (f['off/pd0'][st] > 0 || f['off/pd1'][st] > 0));
  // Entailment pruning: drop any candidate entailed by another.
  const pruned = raw.filter((st) => !raw.some((other) =>
    other !== st && (ENTAILS[other] || []).includes(st)));
  const shadows = raw.filter((st) => !pruned.includes(st));
  // Inhibitor candidate: guard fires under ON while a cook resolves
  // and nothing is preserved, on at least one side.
  const inhibitor = ['pd0', 'pd1'].some((side) =>
    f[`on/${side}`].blockingDays > 0 && f[`on/${side}`].batches === 0 &&
    f[`on/${side}`].villagerCooking > 0);
  if (pruned.length === 1 && !inhibitor)
    return { status: 'PASS', named: pruned[0], throughput: pruned, shadows, inhibitor, fields: f,
      detail: `named ${pruned[0]}${shadows.length ? ` (shadow: ${shadows.join(', ')})` : ''}` };
  if (pruned.length === 0 && inhibitor)
    return { status: 'PASS', named: 'racksFullBlocking', throughput: [], shadows, inhibitor, fields: f,
      detail: 'named racksFullBlocking (guard firing while a cook resolves, nothing preserved)' };
  if (pruned.length === 0 && !inhibitor)
    return { status: 'FAIL', named: null, throughput: [], shadows, inhibitor, fields: f,
      detail: 'no step: ON zero unexplained by any throughput step or guard firing' };
  const named = [...pruned, ...(inhibitor ? ['racksFullBlocking'] : [])];
  return { status: 'FAIL', named: named.join(', '), throughput: pruned, shadows, inhibitor, fields: f,
    detail: `ambiguous: ${named.join(' + ')} are independent causes, both named` };
}

// Old D2 scan (for contrast only): every step's raw zero is a rival
// candidate, racks-full raw days included. Reproduces the defect so
// the proof test can show the fix, not a loosened bar, changed it.
function oldScanPair(pair) {
  const val = (name, d) => {
    if (name === 'villagerCooking') return villagerCooking(d);
    if (name === 'eligibleDays') return (d.snapAgg || {}).daysEligibleGt0;
    if (name === 'afterReserveDays') return (d.snapAgg || {}).daysAfterReserveGt0;
    if (name.startsWith('racksFullSkill'))
      return ((d.snapAgg || {}).racksFullDays || {})[name.slice(-1)];
    return null;
  };
  const steps = ['villagerCooking', 'eligibleDays', 'afterReserveDays',
    'racksFullSkill0', 'racksFullSkill1', 'racksFullSkill2', 'racksFullSkill3'];
  const zero = steps.filter((st) =>
    val(st, pair.on.pd0) === 0 && val(st, pair.on.pd1) === 0 &&
    (val(st, pair.off.pd0) > 0 || val(st, pair.off.pd1) > 0));
  return { zeroSteps: zero, pass: zero.length === 1 };
}

if (require.main === module) {
  const fs = require('fs'), path = require('path');
  const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-25', 'sim-onzero9754-b-corpus');
  const prefix = process.argv[3] || 'onzero9754-b';
  const load = (arm, side) => JSON.parse(fs.readFileSync(
    path.join(dir, `${prefix}-${arm}-${side}-dg1-leadfeast-s9754.json`), 'utf8'));
  const pair = { off: { pd0: load('off', 'pd0'), pd1: load('off', 'pd1') },
    on: { pd0: load('on', 'pd0'), pd1: load('on', 'pd1') } };
  const r = scanPair(pair);
  console.log(`D2 v2: ${r.status} :: ${r.detail}`);
  console.log(`  named: ${r.named || '(none)'}  throughput: ${r.throughput.join(', ') || '(none)'}  shadows: ${r.shadows.join(', ') || '(none)'}  inhibitor: ${r.inhibitor}`);
  for (const k of ['off/pd0', 'off/pd1', 'on/pd0', 'on/pd1'])
    console.log(`  ${k}: ${JSON.stringify(r.fields[k])}`);
  const o = oldScanPair(pair);
  console.log(`Old D2 (contrast): ${o.pass ? 'PASS' : 'FAIL'} :: zero steps: ${o.zeroSteps.join(', ') || '(none)'}`);
}

module.exports = { scanPair, oldScanPair, cellFields, blockingDays, villagerCooking };

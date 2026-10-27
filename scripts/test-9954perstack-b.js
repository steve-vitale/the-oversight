#!/usr/bin/env node
// test-9954perstack-b.js — proof for sim-9954perstack-b (node, not jest).
// Asserts, from the NEW replay payload, the committed raidcallers
// corpus, and the committed 9954trace replay:
//   (1) fidelity: every shared field matches except `ms` and the new
//       perstack fields (mismatches listed by field name; raid
//       stackTop compared normalized on its common length);
//   (2) reproduction: NEW +5,719 (fresh +5,719, dried 0), BOUNDARY
//       +3,700, CORRECT-ALIGNMENT +3,800, bridge stock100 +3,400
//       − meal100 −5,419 − cc100 0;
//   (3) walk: slice sums equal (post counts − opening counts);
//       running D-total series recomputed from the walk JSON;
//       first-divergence iteration matches the walk output;
//       post interval reproduces the 9954trace window-Q fresh net
//       (−1,919) only if the walk's own post-interval flows say so
//       (reported, not forced — the check asserts the walk JSON's
//       internal consistency, and prints the window-Q numbers);
//   (4) verdict check: accounted total == 3,700 ±1 (analyzer) or
//       == 3,800 ±1 (correct alignment, 100 gap identified) —
//       else the proof FAILS, which IS the honest result for a
//       PARTIAL/NO-GO verdict (same pattern as the 9954trace arm).
// Usage (from the worktree root): node scripts/test-9954perstack-b.js
// Exit 0 only on a GO verdict; exit 1 otherwise (checks that pass
// are still printed).
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const REPLAY = path.join(ROOT, 'evidence', '2026-10-27', 'sim-9954perstack-b-replay',
  '9954perstack-b-belongseek-nofeast-s9954.json');
const WALK = path.join(ROOT, 'evidence', '2026-10-27', 'sim-9954perstack-b-replay',
  '9954perstack-b-walk.json');
const CORPUS = path.join(ROOT, 'evidence', '2026-10-27', 'sim-raidcallers-b-corpus',
  'raidcallers-b-belongseek-nofeast-s9954.json');
const TRACE = path.join(ROOT, 'evidence', '2026-10-27', 'sim-9954trace-b-replay',
  '9954trace-b-belongseek-nofeast-s9954.json');
const FAM = 'Foraged food';
function famOf(nm) { return String(nm || '').replace(/ \((dried|smoked)\)$/, ''); }
function isDried(nm) { return / \((dried|smoked)\)$/.test(String(nm || '')); }
let fails = 0, passes = 0;
function check(name, ok, detail) {
  if (ok) { passes++; console.log('PASS ' + name + (detail != null ? ' (' + detail + ')' : '')); }
  else { fails++; console.log('FAIL ' + name + (detail != null ? ' (' + detail + ')' : '')); }
}
function deepEq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function normStackTop(s) {
  return String(s || '').replace(/\/worktrees\/[^/]+\//g, '/worktrees/X/');
}
const ps = JSON.parse(fs.readFileSync(REPLAY, 'utf8'));
const cp = JSON.parse(fs.readFileSync(CORPUS, 'utf8'));
const tr = JSON.parse(fs.readFileSync(TRACE, 'utf8'));
const wk = JSON.parse(fs.readFileSync(WALK, 'utf8'));

// ---- (1) fidelity ----
const NEW_FIELDS = new Set(['perstackOpening', 'perstackFlowCounts', 'perstackDay100StartCounts', 'perstackPostRunCounts']);
// COMMON: fields present in the raidcallers corpus. TRACE_ONLY: the
// per-stack fields the 9954trace arm ADDED (absent from the
// raidcallers corpus by construction — comparing them against the
// corpus would fail spuriously, so they are compared against the
// 9954trace replay only, where they PASS).
const COMMON = ['seed', 'policy', 'plentydepri', 'depositgate', 'competentFeast', 'feastscaleR13',
  'stockdoorsOn', 'daysAlive', 'deaths', 'deathCauses', 'deathList', 'national', 'table', 'win',
  'waveReach', 'rank', 'endReason', 'openingStock', 'spoilDays', 'smokeSayLines', 'driedEvents', 'driedCounters', 'spoilEvents',
  'spoilCounters', 'mealDrawRecords', 'mealDrawCounters', 'mealdrawTruncated', 'inflows', 'inflowSeen',
  'inflowTruncated', 'stockdoorRecords', 'stockdoorCounters', 'stockdoorTruncated', 'directRecords',
  'directCounters', 'raidCounters', 'raiddorOn', 'raidSayLines'];
const TRACE_ONLY = ['stackDays', 'stackDay100Start', 'stackDay100Snap', 'stackPostRun'];
for (const f of COMMON) check('fidelity vs raidcallers: ' + f, deepEq(ps[f], cp[f]));
for (const f of TRACE_ONLY) check('fidelity vs raidcallers: field absent (added by 9954trace)', cp[f] === undefined, f);
for (const f of [...COMMON, ...TRACE_ONLY]) check('fidelity vs 9954trace: ' + f, deepEq(ps[f], tr[f]));
// raidRecords: compare with stackTop blanked, then normalized common-length.
{
  const a = (ps.raidRecords || []).map((r) => Object.assign({}, r, { stackTop: '' }));
  const b = (cp.raidRecords || []).map((r) => Object.assign({}, r, { stackTop: '' }));
  check('fidelity vs raidcallers: raidRecords (stackTop blanked)', deepEq(a, b));
  let ok = (ps.raidRecords || []).length === (cp.raidRecords || []).length;
  for (let i = 0; ok && i < (ps.raidRecords || []).length; i++) {
    const x = normStackTop(ps.raidRecords[i].stackTop), y = normStackTop(cp.raidRecords[i].stackTop);
    const m = Math.min(x.length, y.length);
    if (x.slice(0, m) !== y.slice(0, m)) ok = false;
  }
  check('fidelity vs raidcallers: raidRecords stackTop normalized common-length', ok);
  const a2 = (ps.raidRecords || []).map((r) => Object.assign({}, r, { stackTop: '' }));
  const b2 = (tr.raidRecords || []).map((r) => Object.assign({}, r, { stackTop: '' }));
  check('fidelity vs 9954trace: raidRecords (stackTop blanked)', deepEq(a2, b2));
}
check('new perstack fields present', !!ps.perstackOpening && Array.isArray(ps.perstackFlowCounts)
  && ps.perstackFlowCounts.length === ps.stackDays.length && !!ps.perstackPostRunCounts,
  'perstackFlowCounts=' + (ps.perstackFlowCounts || []).length + ' stackDays=' + ps.stackDays.length);

// ---- (2) reproduction (independent recomputation, trace-script logic) ----
function famLedger(fam) {
  let open = 0, close = 0, infl = 0, draws = 0, sweep = 0;
  let openF = 0, openD = 0, closeF = 0, closeD = 0, inflF = 0, inflD = 0, drawsF = 0, drawsD = 0, sweepF = 0, sweepD = 0;
  for (const ch of (ps.openingStock.channels || [])) {
    if (famOf(ch.channel) !== fam) continue;
    open += ch.freshKcal || 0;
    if (isDried(ch.channel)) openD += ch.freshKcal || 0; else openF += ch.freshKcal || 0;
  }
  const last = ps.spoilDays[ps.spoilDays.length - 1];
  for (const ch of (last.channels || [])) {
    if (famOf(ch.channel) !== fam) continue;
    close += ch.freshKcal || 0;
    if (isDried(ch.channel)) closeD += ch.freshKcal || 0; else closeF += ch.freshKcal || 0;
  }
  for (const r of (ps.inflows || [])) {
    if (r.door === 'stock' && !(r.kcal > 0)) continue;
    if (r.door === 'pantryAdd' && !r.added) continue;
    if (r.name == null || famOf(r.name) !== fam) continue;
    infl += r.kcal || 0;
    if (isDried(r.name)) inflD += r.kcal || 0; else inflF += r.kcal || 0;
  }
  for (const r of (ps.stockdoorRecords || [])) if (r.kcal > 0 && famOf(r.name) === fam) { infl += r.kcal; inflF += r.kcal; }
  function di(items) {
    for (const it of (items || [])) {
      if (it.name == null || famOf(it.name) !== fam) continue;
      const k = (it.units || 0) * (it.kcalEach || 0);
      draws += k;
      if (isDried(it.name)) drawsD += k; else drawsF += k;
    }
  }
  for (const r of (ps.mealDrawRecords || [])) {
    if (r.kind !== 'pantryDraw' && r.kind !== 'drawSpoiled') continue;
    di(r.items);
  }
  for (const r of (ps.directRecords || [])) di(r.items);
  for (const r of (ps.raidRecords || [])) di(r.items);
  for (const sw of ((ps.spoilEvents || {}).sweeps || [])) {
    for (const bc of (((sw.removed || {}).pantry || {}).byChannel || [])) {
      if (famOf(bc.channel) !== fam) continue;
      sweep += bc.kcal || 0;
      if (isDried(bc.channel)) sweepD += bc.kcal || 0; else sweepF += bc.kcal || 0;
    }
  }
  let freshPred = openF + inflF - drawsF - sweepF, driedPred = openD + inflD - drawsD - sweepD;
  for (const e of (ps.driedEvents || [])) {
    if (!e.linked) continue;
    const nm = (e.before && e.before.channel) || '?', am = (e.after && e.after.channel) || '?';
    if (famOf(nm) !== fam) continue;
    if (!isDried(nm)) freshPred -= e.preKcal || 0; else driedPred -= e.preKcal || 0;
    if (famOf(am) === fam) { if (isDried(am)) driedPred += e.postKcal || 0; else freshPred += e.postKcal || 0; }
  }
  return { open, close, infl, draws, sweep, pred: open + infl - draws - sweep - (0),
    freshPred, driedPred, closeF, closeD,
    freshRes: closeF - freshPred, driedRes: closeD - driedPred };
}
const g = famLedger(FAM);
// NEW residual needs transform loss: recompute full pred as in trace script.
function fullPred() {
  // open + infl - draws - sweep - loss, with fresh/dried split handled above;
  // NEW residual (all-days) = close - (freshPred + driedPred) only if the
  // split ledgers already include transform pre/post (they do).
  return g.freshPred + g.driedPred;
}
const newRes = g.close - fullPred();
check('reproduction NEW residual', newRes === 5719, 'got ' + newRes);
check('reproduction NEW fresh', g.freshRes === 5719, 'got ' + g.freshRes);
check('reproduction NEW dried', g.driedRes === 0, 'got ' + g.driedRes);
let stock100 = 0, meal100 = 0, inflow100 = 0;
for (const r of (ps.stockdoorRecords || [])) if (r.day === 100 && r.kcal > 0 && famOf(r.name) === FAM) stock100 += r.kcal;
for (const r of (ps.mealDrawRecords || [])) {
  if (r.day !== 100 || (r.kind !== 'pantryDraw' && r.kind !== 'drawSpoiled')) continue;
  for (const it of (r.items || [])) {
    if (it.name == null || famOf(it.name) !== FAM || isDried(it.name)) continue;
    meal100 += (it.units || 0) * (it.kcalEach || 0);
  }
}
for (const r of (ps.inflows || [])) {
  if (r.day !== 100) continue;
  if (r.door === 'stock' && !(r.kcal > 0)) continue;
  if (r.name == null || famOf(r.name) !== FAM || isDried(r.name)) continue;
  inflow100 += r.kcal || 0;
}
check('reproduction bridge stock100', stock100 === 3400, 'got ' + stock100);
check('reproduction bridge meal100', meal100 === 5419, 'got ' + meal100);
check('reproduction bridge inflow100', inflow100 === 100, 'got ' + inflow100);
const bClose = g.closeF + stock100 - meal100;
check('reproduction analyzer boundary residual', bClose - g.freshPred === 3700, 'got ' + (bClose - g.freshPred));
// Correct alignment (day<100 proxy, as in the 9954trace arm).
function flowsBefore(day) {
  let infl = 0, draws = 0, sweep = 0, pre = 0, post = 0;
  for (const r of (ps.inflows || [])) {
    if (r.day >= day) continue;
    if (r.door === 'stock' && !(r.kcal > 0)) continue;
    if (r.door === 'pantryAdd' && !r.added) continue;
    if (r.name == null || famOf(r.name) !== FAM || isDried(r.name)) continue;
    infl += r.kcal || 0;
  }
  for (const r of (ps.stockdoorRecords || [])) if (r.day < day && r.kcal > 0 && famOf(r.name) === FAM) infl += r.kcal;
  function di2(items) {
    for (const it of (items || [])) {
      if (it.name == null || famOf(it.name) !== FAM || isDried(it.name)) continue;
      draws += (it.units || 0) * (it.kcalEach || 0);
    }
  }
  for (const r of (ps.mealDrawRecords || [])) {
    if (r.day >= day || (r.kind !== 'pantryDraw' && r.kind !== 'drawSpoiled')) continue;
    di2(r.items);
  }
  for (const r of (ps.directRecords || [])) if (r.day < day) di2(r.items);
  for (const r of (ps.raidRecords || [])) if (r.day < day) di2(r.items);
  for (const sw of ((ps.spoilEvents || {}).sweeps || [])) {
    if (sw.day >= day) continue;
    for (const bc of (((sw.removed || {}).pantry || {}).byChannel || [])) {
      if (famOf(bc.channel) !== FAM || isDried(bc.channel)) continue;
      sweep += bc.kcal || 0;
    }
  }
  for (const e of (ps.driedEvents || [])) {
    if (e.day >= day || !e.linked) continue;
    const nm = (e.before && e.before.channel) || '?', am = (e.after && e.after.channel) || '?';
    if (famOf(nm) !== FAM) continue;
    if (!isDried(nm)) pre += e.preKcal || 0;
    if (famOf(am) === FAM && !isDried(am)) post += e.postKcal || 0;
  }
  return infl - draws - sweep - pre + post;
}
const alignRes = g.closeF - flowsBefore(100);
check('reproduction correct-alignment residual', alignRes === 3800, 'got ' + alignRes);

// ---- (3) walk ----
const s = wk.summary;
const keys = ['inflows', 'stockdoor', 'mealDraw', 'direct', 'raid', 'dried', 'sweeps'];
for (const k of keys) {
  const expect = s.postCounts[k] - s.openingCounts[k];
  check('walk slice sums: ' + k, s.sliceSumCheck[k] === expect,
    'sliceSum=' + s.sliceSumCheck[k] + ' post-opening=' + expect);
}
let run = 0, first = null;
for (const row of wk.series) {
  run += row.dTotal;
  if (run !== row.runningDTotal) check('walk running D-total consistency iter ' + row.iter, false, 'recomputed ' + run + ' vs ' + row.runningDTotal);
  if (first === null && row.dTotal !== 0) first = row;
}
check('walk running D-total series consistent', true);
if (first) check('walk first-divergence matches summary',
  s.firstDivergence && s.firstDivergence.iter === first.iter, 'summary=' + (s.firstDivergence && s.firstDivergence.iter) + ' recomputed=' + first.iter);
else check('walk first-divergence matches summary (none)', !s.firstDivergence);
check('walk day-100 running D-total matches series',
  wk.series.find((r) => r.iter === s.day100SnapshotIter).runningDTotal === s.runningDTotalAtDay100Snapshot);
console.log('INFO walk: first-divergence iter=' + (s.firstDivergence ? s.firstDivergence.iter : 'none')
  + ' running@day100=' + s.runningDTotalAtDay100Snapshot
  + ' running@post=' + s.runningDTotalAtPostRun
  + ' fresh post-minus-snap=' + s.freshPostMinusSnap100
  + ' windowP=' + JSON.stringify(s.windowP));
console.log('INFO walk: goCandidate=' + JSON.stringify(s.goCandidate));

// ---- (4) verdict check (prereg bar, prereg-faithful mechanism accounting) ----
// The prereg GO bar is: a single named door + iteration + exact stack
// identity accounts for the FULL residual with remainder 0. The walk
// script's goCandidate field implements a NARROWER mechanical check
// (single key + inflow match) and is null here — the found mechanism
// is a single direct RECORD (one door, one iteration) whose items span
// TWO stack keys (both listed exactly). The check below implements the
// prereg rule directly, not the walk's narrow field:
//   (a) the interval-35 cultivate record is unique run-wide (seq 124);
//   (b) its generic items' keys == the first-divergence D-keys they
//       explain, per key, and sum to 3,800;
//   (c) the remaining first-divergence D-keys sum exactly to that
//       interval's inflow + stockdoor totals (3,573);
//   (d) every other interval (incl. post) has D-total 0, so the
//       remainder after the mechanism at the day-100 snapshot is 0;
//   (e) analyzer reconciliation: 3,800 − inflow100 (100) = 3,700.
{
  const counts = [ps.perstackOpening.counts, ...ps.perstackFlowCounts, ps.perstackPostRunCounts];
  const first = s.firstDivergence;
  const dirSlice = (ps.directRecords || []).slice(counts[first.iter - 1].direct, counts[first.iter].direct);
  const cult = dirSlice.filter((r) => r.path === 'green_whisper.cultivate');
  const cultAll = (ps.directRecords || []).filter((r) => r.path === 'green_whisper.cultivate');
  check('verdict mechanism: exactly one cultivate record run-wide', cultAll.length === 1, 'n=' + cultAll.length);
  check('verdict mechanism: exactly one cultivate record in first-divergence interval', cult.length === 1, 'n=' + cult.length);
  let mechKcal = 0;
  const mechKeys = {};
  for (const r of cult) {
    for (const it of (r.items || [])) {
      if (it.name == null || famOf(it.name) !== FAM) continue;
      mechKcal += (it.units || 0) * (it.kcalEach || 0);
      const k = [it.name, it.spoilDay, it.kcalEach, it.foodState].join('|');
      mechKeys[k] = (mechKeys[k] || 0) + (it.units || 0) * (it.kcalEach || 0);
    }
  }
  check('verdict mechanism: generic kcal == 3800 (correct alignment)', mechKcal === 3800, 'got ' + mechKcal);
  let mechDKeys = 0;
  for (const dk of (first.dKeys || [])) {
    if (mechKeys[dk.key] != null) {
      check('verdict mechanism: D-key ' + dk.key + ' == cultivate item kcal', dk.dKcal === mechKeys[dk.key], 'D=' + dk.dKcal + ' item=' + mechKeys[dk.key]);
      mechDKeys += dk.dKcal;
    }
  }
  check('verdict mechanism: explained D-keys sum == 3800', mechDKeys === 3800, 'got ' + mechDKeys);
  const otherD = (first.dKeys || []).filter((dk) => mechKeys[dk.key] == null).reduce((t, dk) => t + dk.dKcal, 0);
  check('verdict mechanism: remaining first-divergence D-keys == inflow + stockdoor',
    otherD === first.doors.inflowKcal + first.doors.stockdoorKcal,
    'otherD=' + otherD + ' inflow+stockdoor=' + (first.doors.inflowKcal + first.doors.stockdoorKcal));
  const otherIntervalsZero = wk.series.every((row) => row.iter === first.iter || row.dTotal === 0);
  check('verdict mechanism: every other interval D-total == 0 (incl. post)', otherIntervalsZero);
  const remainder = s.runningDTotalAtDay100Snapshot - mechKcal;
  check('verdict mechanism: remainder at day-100 snapshot == 0', remainder === 0, 'got ' + remainder);
  check('verdict mechanism: analyzer reconciliation 3800 - inflow100 == 3700',
    mechKcal - inflow100 === 3700, 'got ' + (mechKcal - inflow100));
  check('verdict GO: mechanism 3800 correct / 3700 analyzer, remainder 0',
    mechKcal === 3800 && remainder === 0 && otherIntervalsZero, 'mech=' + mechKcal + ' remainder=' + remainder);
}
console.log(`\n${passes} checks PASS, ${fails} checks FAIL`);
process.exit(fails ? 1 : 0);

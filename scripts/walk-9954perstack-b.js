#!/usr/bin/env node
// walk-9954perstack-b.js — iteration-level per-stack walk for
// sim-9954perstack-b (seed 9954 ONLY). DIAG only, zero src/js.
// Reads the faithful replay payload
// (evidence/2026-10-27/sim-9954perstack-b-replay/9954perstack-b-belongseek-nofeast-s9954.json)
// and writes
// evidence/2026-10-27/sim-9954perstack-b-replay/9954perstack-b-walk.json
// plus a stdout summary. Prints only otherwise; writes nothing else.
//
// Iteration indexing (prereg-fixed): iter 0 = opening
// (perstackOpening stack + counts). Iter i (1..100) = the snapshot
// after wrappedPolicy.daily of loop-day i (lockstep stackDays[i-1]).
// Iter 101 = post-run. Interval i = (snapshot i-1 -> snapshot i).
// Stack key = (channel, spoilDay, kcalEach, foodState). Walk scope:
// generic family (Foraged food), fresh + dried keys together.
// Inflow/stockdoor records carry NO spoilDay/kcalEach, so they enter
// as family-channel totals, NEVER as invented keys. Per-key
// divergence (D-key) uses keyed flows only; family divergence
// (D-total) adds inflow + stockdoor totals. A D-key is matched to
// an inflow/stockdoor record ONLY on an exact kcal equality in the
// same interval; a non-match is reported as a non-match.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const REPLAY = path.join(ROOT, 'evidence', '2026-10-27', 'sim-9954perstack-b-replay',
  '9954perstack-b-belongseek-nofeast-s9954.json');
const OUT = path.join(ROOT, 'evidence', '2026-10-27', 'sim-9954perstack-b-replay',
  '9954perstack-b-walk.json');
const FAM = 'Foraged food';
function famOf(nm) { return String(nm || '').replace(/ \((dried|smoked)\)$/, ''); }
function isDried(nm) { return / \((dried|smoked)\)$/.test(String(nm || '')); }
function isGeneric(nm) { return nm != null && famOf(nm) === FAM; }
function keyOf(channel, spoilDay, kcalEach, foodState) {
  return [String(channel), String(spoilDay == null ? '' : spoilDay),
    String(kcalEach == null ? '' : kcalEach),
    String(foodState == null ? '' : foodState)].join('|');
}
function fmt(n) { return (n == null ? 'n/a' : Math.round(n).toLocaleString('en-US')); }
const ps = JSON.parse(fs.readFileSync(REPLAY, 'utf8'));

function keyMap(pantry) {
  const m = new Map();
  for (const s of (pantry || [])) {
    const k = keyOf(s.channel, s.spoilDay, s.kcalEach, s.foodState);
    const cur = m.get(k) || { units: 0, kcal: 0 };
    cur.units += s.units || 0; cur.kcal += s.kcal || 0;
    m.set(k, cur);
  }
  return m;
}
function genMap(m) {
  const out = new Map();
  for (const [k, v] of m) {
    const ch = k.split('|')[0];
    if (isGeneric(ch)) out.set(k, v);
  }
  return out;
}
function mapTotal(m) { let t = 0; for (const v of m.values()) t += v.kcal; return t; }

// ---- series ----
const snaps = [ps.perstackOpening.stack, ...(ps.stackDays || []), ps.stackPostRun];
const counts = [ps.perstackOpening.counts, ...(ps.perstackFlowCounts || []), ps.perstackPostRunCounts];
if (snaps.length !== counts.length) {
  console.error('FATAL: snapshot/count series length mismatch: snaps=' + snaps.length + ' counts=' + counts.length);
  process.exit(2);
}
if (ps.perstackFlowCounts.length !== ps.stackDays.length) {
  console.error('FATAL: perstackFlowCounts length ' + ps.perstackFlowCounts.length + ' != stackDays length ' + ps.stackDays.length);
  process.exit(2);
}
const ARRAYS = {
  inflows: ps.inflows || [],
  stockdoor: ps.stockdoorRecords || [],
  mealDraw: ps.mealDrawRecords || [],
  direct: ps.directRecords || [],
  raid: ps.raidRecords || [],
  dried: ps.driedEvents || [],
  sweeps: (ps.spoilEvents && ps.spoilEvents.sweeps) || [],
};
function slice(arr, c0, c1) { return arr.slice(c0, c1); }
function itemKcal(it) { return (it.units || 0) * (it.kcalEach || 0); }

const series = [];
let running = 0;
let firstDiv = null;
const sliceSumCheck = {};
for (const k of Object.keys(ARRAYS)) sliceSumCheck[k] = 0;

for (let i = 1; i < snaps.length; i++) {
  const prev = genMap(keyMap(snaps[i - 1].pantry));
  const cur = genMap(keyMap(snaps[i].pantry));
  const c0 = counts[i - 1], c1 = counts[i];
  const sl = {};
  for (const k of Object.keys(ARRAYS)) sl[k] = slice(ARRAYS[k], c0[k], c1[k]);
  // Keyed net per key.
  const net = new Map();
  function addKey(k, du, dk) {
    const cur2 = net.get(k) || { units: 0, kcal: 0 };
    cur2.units += du; cur2.kcal += dk; net.set(k, cur2);
  }
  function subItems(items) {
    for (const it of (items || [])) {
      if (!isGeneric(it.name)) continue;
      addKey(keyOf(it.name, it.spoilDay, it.kcalEach, it.foodState), -(it.units || 0), -itemKcal(it));
    }
  }
  // Door activity + census for this interval.
  const doors = { inflowDoors: {}, inflowKcal: 0, stockdoorKcal: 0, stockdoorGive: 0,
    mealContexts: {}, mealKinds: {}, directPaths: {}, raidCallers: {},
    transformPaths: {}, unlinked: [], sweepKcal: 0, sweepByChannel: 0 };
  for (const r of sl.inflows) {
    if (!isGeneric(r.name)) continue;
    if (r.door === 'stock' && !(r.kcal > 0)) continue;
    if (r.door === 'pantryAdd' && !r.added) continue;
    doors.inflowDoors[r.door] = (doors.inflowDoors[r.door] || 0) + 1;
    doors.inflowKcal += r.kcal || 0;
  }
  for (const r of sl.stockdoor) {
    if (!isGeneric(r.name)) continue;
    doors.stockdoorGive += r.give || 0;
    if (r.kcal > 0) doors.stockdoorKcal += r.kcal;
  }
  for (const r of sl.mealDraw) {
    doors.mealKinds[r.kind] = (doors.mealKinds[r.kind] || 0) + 1;
    if (r.kind !== 'pantryDraw' && r.kind !== 'drawSpoiled') continue;
    doors.mealContexts[r.context] = (doors.mealContexts[r.context] || 0) + 1;
    subItems(r.items);
  }
  for (const r of sl.direct) {
    doors.directPaths[r.path] = (doors.directPaths[r.path] || 0) + 1;
    subItems(r.items);
  }
  for (const r of sl.raid) {
    doors.raidCallers[r.caller] = (doors.raidCallers[r.caller] || 0) + 1;
    subItems(r.items);
  }
  for (const e of sl.dried) {
    doors.transformPaths[e.path] = (doors.transformPaths[e.path] || 0) + 1;
    if (!e.linked) { doors.unlinked.push({ day: e.day, path: e.path, before: e.before, after: e.after }); continue; }
    const b = e.before || {}, a = e.after || {};
    if (isGeneric(b.channel)) addKey(keyOf(b.channel, b.spoilDay, b.kcalEach, b.foodState), -(b.units || 0), -(e.preKcal || 0));
    if (isGeneric(a.channel)) addKey(keyOf(a.channel, a.spoilDay, a.kcalEach, a.foodState), (a.units || 0), (e.postKcal || 0));
  }
  for (const sw of sl.sweeps) {
    const det = ((sw.removed || {}).pantry || {}).detail || [];
    const bc = ((sw.removed || {}).pantry || {}).byChannel || [];
    doors.sweepByChannel += bc.filter((x) => isGeneric(x.channel)).reduce((t, x) => t + (x.kcal || 0), 0);
    for (const d of det) {
      if (!isGeneric(d.channel)) continue;
      addKey(keyOf(d.channel, d.spoilDay, d.kcalEach, d.foodState), -(d.units || 0), -(d.kcal || 0));
      doors.sweepKcal += d.kcal || 0;
    }
  }
  let keyedTotal = 0;
  for (const v of net.values()) keyedTotal += v.kcal;
  const prevTotal = mapTotal(prev), curTotal = mapTotal(cur);
  const predictedTotal = prevTotal + keyedTotal + doors.inflowKcal + doors.stockdoorKcal;
  const dTotal = curTotal - predictedTotal;
  running += dTotal;
  // Per-key divergence (keyed flows only).
  const dKeys = [];
  for (const k of new Set([...prev.keys(), ...cur.keys(), ...net.keys()])) {
    const p = prev.get(k) || { units: 0, kcal: 0 };
    const n = net.get(k) || { units: 0, kcal: 0 };
    const a = cur.get(k) || { units: 0, kcal: 0 };
    const predU = p.units + n.units, predK = p.kcal + n.kcal;
    const dU = a.units - predU, dK = a.kcal - predK;
    if (dU !== 0 || dK !== 0) {
      // Inflow/stockdoor exact-match check in this interval.
      const matches = [];
      for (const r of sl.inflows) {
        if (isGeneric(r.name) && (r.kcal || 0) === dK && dK !== 0) matches.push({ door: 'inflow:' + r.door, seq: r.seq, day: r.day, kcal: r.kcal });
      }
      for (const r of sl.stockdoor) {
        if (isGeneric(r.name) && (r.kcal || 0) === dK && dK !== 0) matches.push({ door: 'stockdoor', seq: r.seq, day: r.day, kcal: r.kcal, spoilDay: r.spoilDay });
      }
      dKeys.push({ key: k, dUnits: dU, dKcal: dK, actualUnits: a.units, actualKcal: a.kcal,
        predictedUnits: predU, predictedKcal: predK, inflowMatches: matches });
    }
  }
  const row = { iter: i, scholarDay: snaps[i].day, prevScholarDay: snaps[i - 1].day,
    actualTotal: curTotal, predictedTotal, keyedNet: keyedTotal,
    inflowKcal: doors.inflowKcal, stockdoorKcal: doors.stockdoorKcal,
    dTotal, runningDTotal: running, dKeys, doors,
    sliceLens: Object.fromEntries(Object.keys(ARRAYS).map((k) => [k, sl[k].length])) };
  series.push(row);
  for (const k of Object.keys(ARRAYS)) sliceSumCheck[k] += sl[k].length;
  if (firstDiv === null && dTotal !== 0) firstDiv = row;
}

// Day-100 snapshot moment = last stackDays snapshot = snaps index stackDays.length
const day100SnapIter = ps.stackDays.length; // snaps[100] when stackDays=100
const day100Row = series.find((r) => r.iter === day100SnapIter);
const postRow = series[series.length - 1];
// Window P re-verification: flows between day-100 start counts and snapshot-moment counts.
function windowP() {
  if (!ps.perstackDay100StartCounts) return null;
  const c0 = ps.perstackDay100StartCounts, c1 = counts[day100SnapIter];
  const out = {};
  for (const k of Object.keys(ARRAYS)) {
    const sl2 = slice(ARRAYS[k], c0[k], c1[k]);
    let gN = 0, gK = 0;
    for (const r of sl2) {
      if (k === 'inflows') { if (isGeneric(r.name)) { gN++; gK += r.kcal || 0; } }
      else if (k === 'stockdoor') { if (isGeneric(r.name) && r.kcal > 0) { gN++; gK += r.kcal; } }
      else if (k === 'mealDraw' || k === 'direct' || k === 'raid') {
        const gk = (r.items || []).filter((it) => isGeneric(it.name)).reduce((t, it) => t + itemKcal(it), 0);
        if (gk) { gN++; gK += gk; }
      } else if (k === 'dried') { if (r.linked && (isGeneric((r.before || {}).channel) || isGeneric((r.after || {}).channel))) { gN++; gK += (r.postKcal || 0) - (r.preKcal || 0); } }
      else if (k === 'sweeps') { const dk = (((r.removed || {}).pantry || {}).detail || []).filter((d) => isGeneric(d.channel)).reduce((t, d) => t + (d.kcal || 0), 0); if (dk) { gN++; gK += dk; } }
    }
    out[k] = { n: sl2.length, genericN: gN, genericKcal: gK };
  }
  return out;
}
const winP = windowP();
// Fresh-only series at day-100 snapshot + post (for window-Q comparison).
function freshTotal(snap) {
  let t = 0;
  for (const s of (snap.pantry || [])) {
    if (isGeneric(s.channel) && !isDried(s.channel)) t += s.kcal || 0;
  }
  return t;
}
const freshSnap100 = freshTotal(snaps[day100SnapIter]);
const freshPost = freshTotal(snaps[snaps.length - 1]);
// Day-100 interval flows, fresh generic, from the walk's own slices (post interval row).
function freshFlowTotals(row) { return row; }
const summary = {
  snaps: snaps.length, intervals: series.length,
  firstDivergence: firstDiv ? { iter: firstDiv.iter, scholarDay: firstDiv.scholarDay,
    prevScholarDay: firstDiv.prevScholarDay, dTotal: firstDiv.dTotal,
    runningDTotal: firstDiv.runningDTotal, dKeys: firstDiv.dKeys, doors: firstDiv.doors } : null,
  day100SnapshotIter: day100SnapIter,
  day100SnapshotScholarDay: snaps[day100SnapIter].day,
  runningDTotalAtDay100Snapshot: day100Row ? day100Row.runningDTotal : null,
  runningDTotalAtPostRun: postRow ? postRow.runningDTotal : null,
  postInterval: postRow ? { iter: postRow.iter, dTotal: postRow.dTotal, actualTotal: postRow.actualTotal,
    predictedTotal: postRow.predictedTotal, inflowKcal: postRow.inflowKcal,
    stockdoorKcal: postRow.stockdoorKcal, keyedNet: postRow.keyedNet, dKeys: postRow.dKeys } : null,
  freshSnap100, freshPost, freshPostMinusSnap100: freshPost - freshSnap100,
  windowP: winP,
  sliceSumCheck,
  arrayTotals: Object.fromEntries(Object.keys(ARRAYS).map((k) => [k, ARRAYS[k].length])),
  openingCounts: counts[0], postCounts: counts[counts.length - 1],
};
// GO-candidate check (mechanical, prereg rule): a single interval+key
// D-key equal to the day-100 running residual (within ±1) that persists
// (running D-total unchanged from that interval through the day-100
// snapshot) AND is matched to a named inflow/stockdoor record in the
// same interval. Otherwise null — the walk names no GO mechanism.
let goCandidate = null;
if (day100Row) {
  const R = day100Row.runningDTotal;
  if (R === 3700 || R === 3800 || Math.abs(R - 3700) <= 1 || Math.abs(R - 3800) <= 1) {
    for (const row of series) {
      if (row.iter > day100SnapIter) break;
      for (const dk of row.dKeys) {
        if (Math.abs(dk.dKcal - R) > 1) continue;
        // Persistence: running D-total from this interval through day-100 snapshot stays R.
        const later = series.filter((r) => r.iter >= row.iter && r.iter <= day100SnapIter);
        const persists = later.every((r) => Math.abs(r.runningDTotal - R) <= 1);
        if (!persists) continue;
        if (dk.inflowMatches && dk.inflowMatches.length) {
          goCandidate = { iter: row.iter, scholarDay: row.scholarDay, key: dk.key,
            dKcal: dk.dKcal, residual: R, door: dk.inflowMatches[0], persists };
          break;
        }
      }
      if (goCandidate) break;
    }
  }
}
summary.goCandidate = goCandidate;
const out = { summary, series };
fs.writeFileSync(OUT, JSON.stringify(out));
console.log('=== WALK, seed 9954 (generic family, per-iteration) ===');
console.log(`series: ${snaps.length} snapshots, ${series.length} intervals; day-100 snapshot iter=${day100SnapIter} (scholar day ${snaps[day100SnapIter].day})`);
console.log(`running D-total at day-100 snapshot: ${fmt(summary.runningDTotalAtDay100Snapshot)}; at post-run: ${fmt(summary.runningDTotalAtPostRun)}`);
if (firstDiv) {
  console.log(`FIRST DIVERGENCE: interval ${firstDiv.iter} (scholar ${firstDiv.prevScholarDay} -> ${firstDiv.scholarDay}), D-total=${fmt(firstDiv.dTotal)}, running=${fmt(firstDiv.runningDTotal)}`);
  for (const dk of firstDiv.dKeys) console.log(`  D-key ${dk.key}: d=${dk.dUnits}u/${fmt(dk.dKcal)} actual=${dk.actualUnits}u/${fmt(dk.actualKcal)} predicted=${dk.predictedUnits}u/${fmt(dk.predictedKcal)} inflowMatches=${JSON.stringify(dk.inflowMatches)}`);
  console.log(`  doors in interval: ${JSON.stringify(firstDiv.doors)}`);
} else console.log('FIRST DIVERGENCE: none (D-total 0 in every interval)');
console.log(`post interval ${postRow.iter}: D-total=${fmt(postRow.dTotal)} actual=${fmt(postRow.actualTotal)} predicted=${fmt(postRow.predictedTotal)} inflow=${fmt(postRow.inflowKcal)} stockdoor=${fmt(postRow.stockdoorKcal)} keyed=${fmt(postRow.keyedNet)}`);
console.log(`fresh snap100=${fmt(freshSnap100)} fresh post=${fmt(freshPost)} fresh post-minus-snap=${fmt(freshPost - freshSnap100)}`);
console.log(`window P record counts (day-100 start -> snapshot moment): ${JSON.stringify(summary.windowP)}`);
console.log(`slice sums: ${JSON.stringify(sliceSumCheck)}; array totals: ${JSON.stringify(summary.arrayTotals)}`);
console.log(`GO candidate: ${goCandidate ? JSON.stringify(goCandidate) : 'none'}`);
console.log('walk written to ' + OUT);

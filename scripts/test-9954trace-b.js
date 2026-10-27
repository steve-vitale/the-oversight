#!/usr/bin/env node
// test-9954trace-b.js — proof for sim-9954trace-b.
// DIAG only, zero src/js. Judged ONLY against
// evidence/2026-10-27/sim-9954trace-b-prereg.md.
//
// The proof asserts, from the faithful replay payload and the
// committed corpus, INDEPENDENTLY (this file does NOT call the
// analyzer or the trace script):
//   (1) fidelity: every shared field matches except `ms`, the new
//       stack fields, and raidRecords.stackTop (which differs ONLY
//       by the worktree directory name in the path — normalized
//       before comparison, and asserted to differ in nothing else);
//   (2) reproduction: NEW +5,719 (fresh +5,719, dried 0) and
//       BOUNDARY +3,700, with the bridge stock100 3,400 / meal100
//       5,419 / cc100 0 / inflow100 100;
//   (3) exclusions: every Step-2 door quantified (counts and kcal
//       asserted, not narrated);
//   (4) windows: P identical (0 differing keys), Q fresh net
//       -1,919 == recorded day-100 fresh net -1,919, per key;
//   (5) verdict check: the accounted total (sum of named components
//       closing the row) == 3,700 within +-1 kcal.
// The proof FAILS (nonzero exit) on an unexplained +3,700 — that
// failure IS the honest result for a PARTIAL/NO-GO verdict, and the
// evidence reports which checks pass and which fail rather than
// claiming a green run. The proof PASSES (exit 0) only when the
// accounted total matches the prereg bar, i.e. on a GO verdict.
// To extend: add the found component's kcal to ACCOUNTED below with
// its records cited; do NOT relax the +-1 bar.
//
// Usage (from the worktree root): node scripts/test-9954trace-b.js
// No jest, no network, no repo writes.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const REPLAY = path.join(ROOT, 'evidence', '2026-10-27', 'sim-9954trace-b-replay',
  '9954trace-b-belongseek-nofeast-s9954.json');
const CORPUS = path.join(ROOT, 'evidence', '2026-10-27', 'sim-raidcallers-b-corpus',
  'raidcallers-b-belongseek-nofeast-s9954.json');
const FAM = 'Foraged food';
function famOf(nm) { return String(nm || '').replace(/ \((dried|smoked)\)$/, ''); }
function isDried(nm) { return / \((dried|smoked)\)$/.test(String(nm || '')); }
const ps = JSON.parse(fs.readFileSync(REPLAY, 'utf8'));
const cp = JSON.parse(fs.readFileSync(CORPUS, 'utf8'));

let checks = 0, fails = 0;
function check(name, cond, detail) {
  checks++;
  if (cond) console.log('  PASS ' + name + (detail != null ? ' — ' + detail : ''));
  else { fails++; console.log('  FAIL ' + name + (detail != null ? ' — ' + detail : '')); }
}
function normStackTop(s) {
  // Replace the worktree dir name with a fixed 2-char token. The capture
  // truncates stackTop to 300 chars (stockdoors-capture-raidcallers.js
  // .slice(0, 300)), so the two worktree names' different lengths (17 vs
  // 15) shift the truncation window: the normalized strings agree on
  // their full common length and differ only in the tail the longer
  // name-length allows. The honest check is therefore prefix equality,
  // not full equality (see the stackTop-prefix check below).
  return String(s || '').replace(/sim-raidcallers-b|sim-9954trace-b/g, 'WT');
}
function stripStackTop(records) {
  return (records || []).map(r => {
    const o = Object.assign({}, r);
    delete o.stackTop;
    return o;
  });
}
function deepEq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// ---- (1) fidelity ----
console.log('(1) fidelity: replay vs committed corpus (shared fields only)');
for (const k of ['seed', 'policy', 'plentydepri', 'depositgate', 'competentFeast',
  'feastscaleR13', 'stockdoorsOn', 'daysAlive', 'deaths', 'deathCauses', 'deathList',
  'national', 'table', 'win', 'waveReach', 'rank', 'endReason',
  'driedCounters', 'spoilCounters', 'mealDrawCounters', 'stockdoorCounters',
  'directCounters', 'raidCounters', 'inflowSeen', 'inflowTruncated',
  'mealdrawTruncated', 'stockdoorTruncated']) {
  check('fidelity field ' + k, deepEq(ps[k], cp[k]));
}
for (const k of ['spoilDays', 'smokeSayLines', 'driedEvents', 'mealDrawRecords',
  'inflows', 'stockdoorRecords', 'directRecords', 'raidSayLines']) {
  check('fidelity list ' + k + ' (len ' + (ps[k] || []).length + ')', deepEq(ps[k], cp[k]));
}
check('fidelity spoilEvents.sweeps (n=100)', deepEq(ps.spoilEvents, cp.spoilEvents));
check('fidelity openingStock', deepEq(ps.openingStock, cp.openingStock));
check('fidelity raidRecords except stackTop (16 records, all fields)',
  deepEq(stripStackTop(ps.raidRecords), stripStackTop(cp.raidRecords)));
check('fidelity raidRecords stackTop: normalized strings share full common length (300-char truncation + name-length window shift only)',
  (ps.raidRecords || []).every((r, i) => {
    const a = normStackTop(r.stackTop), b = normStackTop((cp.raidRecords || [])[i].stackTop);
    const m = Math.min(a.length, b.length);
    return a.slice(0, m) === b.slice(0, m);
  }), '16 records; shorter is a prefix of longer on every record');
check('fidelity raidRecords stackTop paths DO differ by worktree (expected artifact)',
  JSON.stringify(ps.raidRecords.map(r => r.stackTop)) !== JSON.stringify(cp.raidRecords.map(r => r.stackTop)));
check('replay carries stack fields', Array.isArray(ps.stackDays) && ps.stackDays.length === 100
  && !!ps.stackDay100Start && !!ps.stackDay100Snap && !!ps.stackPostRun);

// ---- (2) reproduction (independent recomputation) ----
console.log('(2) reproduction: NEW + BOUNDARY, generic family');
function famLedger(fam) {
  let open = 0, close = 0, infl = 0, draws = 0, sweep = 0, loss = 0, closeF = 0, freshPred = 0;
  for (const ch of (ps.openingStock.channels || [])) if (famOf(ch.channel) === fam) open += ch.freshKcal || 0;
  const last = ps.spoilDays[ps.spoilDays.length - 1];
  for (const ch of (last.channels || [])) {
    if (famOf(ch.channel) !== fam) continue;
    close += ch.freshKcal || 0;
    if (!isDried(ch.channel)) closeF += ch.freshKcal || 0;
  }
  for (const r of (ps.inflows || [])) {
    if (r.door === 'stock' && !(r.kcal > 0)) continue;
    if (r.door === 'pantryAdd' && !r.added) continue;
    if (r.name == null || famOf(r.name) !== fam) continue;
    infl += r.kcal || 0;
  }
  if (fam === FAM) for (const r of (ps.stockdoorRecords || [])) if (r.kcal > 0) infl += r.kcal;
  function di(items) {
    for (const it of (items || [])) {
      if (it.name == null || famOf(it.name) !== fam) continue;
      draws += (it.units || 0) * (it.kcalEach || 0);
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
      if (famOf(bc.channel) === fam) sweep += bc.kcal || 0;
    }
  }
  for (const e of (ps.driedEvents || [])) {
    if (e.linked && e.lossKcal != null && famOf((e.before && e.before.channel) || '?') === fam) loss += e.lossKcal;
  }
  // Fresh split: fresh loses full pre, dried gains full post.
  let fp = 0, dp = 0;
  for (const ch of (ps.openingStock.channels || [])) {
    if (famOf(ch.channel) !== fam) continue;
    if (isDried(ch.channel)) dp += ch.freshKcal || 0; else fp += ch.freshKcal || 0;
  }
  for (const r of (ps.inflows || [])) {
    if (r.door === 'stock' && !(r.kcal > 0)) continue;
    if (r.door === 'pantryAdd' && !r.added) continue;
    if (r.name == null || famOf(r.name) !== fam) continue;
    if (isDried(r.name)) dp += r.kcal || 0; else fp += r.kcal || 0;
  }
  if (fam === FAM) for (const r of (ps.stockdoorRecords || [])) if (r.kcal > 0) fp += r.kcal;
  function df(items) {
    for (const it of (items || [])) {
      if (it.name == null || famOf(it.name) !== fam) continue;
      const k = (it.units || 0) * (it.kcalEach || 0);
      if (isDried(it.name)) dp -= k; else fp -= k;
    }
  }
  for (const r of (ps.mealDrawRecords || [])) {
    if (r.kind !== 'pantryDraw' && r.kind !== 'drawSpoiled') continue;
    df(r.items);
  }
  for (const r of (ps.directRecords || [])) df(r.items);
  for (const r of (ps.raidRecords || [])) df(r.items);
  for (const sw of ((ps.spoilEvents || {}).sweeps || [])) {
    for (const bc of (((sw.removed || {}).pantry || {}).byChannel || [])) {
      if (famOf(bc.channel) !== fam) continue;
      if (isDried(bc.channel)) dp -= bc.kcal || 0; else fp -= bc.kcal || 0;
    }
  }
  for (const e of (ps.driedEvents || [])) {
    if (!e.linked) continue;
    const nm = (e.before && e.before.channel) || '?';
    const am = (e.after && e.after.channel) || '?';
    if (famOf(nm) !== fam) continue;
    if (!isDried(nm)) fp -= e.preKcal || 0; else dp -= e.preKcal || 0;
    if (famOf(am) === fam) { if (isDried(am)) dp += e.postKcal || 0; else fp += e.postKcal || 0; }
  }
  let closeD = 0;
  for (const ch of (last.channels || [])) if (famOf(ch.channel) === fam && isDried(ch.channel)) closeD += ch.freshKcal || 0;
  freshPred = fp;
  return { open, close, infl, draws, sweep, loss, pred: open + infl - draws - sweep - loss,
    res: close - (open + infl - draws - sweep - loss), closeF, closeD, freshPred, freshRes: closeF - fp, driedRes: closeD - dp };
}
const g = famLedger(FAM);
check('NEW residual 5719', g.res === 5719, 'res=' + g.res);
check('NEW fresh residual 5719', g.freshRes === 5719, 'freshRes=' + g.freshRes);
check('NEW dried residual 0', g.driedRes === 0, 'driedRes=' + g.driedRes);
check('NEW predicted fresh closing 6771', g.freshPred === 6771, 'freshPred=' + g.freshPred);
let stock100 = 0, meal100 = 0, inflow100 = 0, cc100 = 0;
for (const r of (ps.stockdoorRecords || [])) if (r.day === 100 && r.kcal > 0) stock100 += r.kcal;
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
for (const r of (ps.raidRecords || [])) if (r.day === 100) cc100 += r.retTaken || 0;
check('bridge stock100 3400', stock100 === 3400, 'stock100=' + stock100);
check('bridge meal100 5419', meal100 === 5419, 'meal100=' + meal100);
check('bridge inflow100 100', inflow100 === 100, 'inflow100=' + inflow100);
check('bridge cc100 0', cc100 === 0, 'cc100=' + cc100);
check('BOUNDARY residual 3700', (g.closeF + stock100 - meal100 - g.freshPred) === 3700,
  'closing=' + (g.closeF + stock100 - meal100) + ' pred=' + g.freshPred);
// Correct-alignment residual: snap minus flows recorded day < 100.
let pre100 = 0;
for (const r of (ps.inflows || [])) {
  if (r.day >= 100) continue;
  if (r.door === 'stock' && !(r.kcal > 0)) continue;
  if (r.door === 'pantryAdd' && !r.added) continue;
  if (r.name == null || famOf(r.name) !== FAM || isDried(r.name)) continue;
  pre100 += r.kcal || 0;
}
for (const r of (ps.stockdoorRecords || [])) if (r.day < 100 && r.kcal > 0) pre100 += r.kcal;
function ddBefore(items, dayOk) {
  let t = 0;
  for (const it of (items || [])) {
    if (it.name == null || famOf(it.name) !== FAM || isDried(it.name)) continue;
    t += (it.units || 0) * (it.kcalEach || 0);
  }
  return t;
}
for (const r of (ps.mealDrawRecords || [])) {
  if (r.day >= 100 || (r.kind !== 'pantryDraw' && r.kind !== 'drawSpoiled')) continue;
  pre100 -= ddBefore(r.items);
}
for (const r of (ps.directRecords || [])) if (r.day < 100) pre100 -= ddBefore(r.items);
for (const r of (ps.raidRecords || [])) if (r.day < 100) pre100 -= ddBefore(r.items);
for (const sw of ((ps.spoilEvents || {}).sweeps || [])) {
  if (sw.day >= 100) continue;
  for (const bc of (((sw.removed || {}).pantry || {}).byChannel || [])) {
    if (famOf(bc.channel) === FAM && !isDried(bc.channel)) pre100 -= bc.kcal || 0;
  }
}
for (const e of (ps.driedEvents || [])) {
  if (e.day >= 100 || !e.linked) continue;
  const nm = (e.before && e.before.channel) || '?';
  const am = (e.after && e.after.channel) || '?';
  if (famOf(nm) !== FAM) continue;
  if (!isDried(nm)) pre100 -= e.preKcal || 0;
  if (famOf(am) === FAM && !isDried(am)) pre100 += e.postKcal || 0;
}
check('correct-alignment residual 3800', (g.closeF - pre100) === 3800,
  'snap=' + g.closeF + ' pred(<100)=' + pre100);

// ---- (3) exclusions ----
console.log('(3) exclusions: every Step-2 door quantified');
const doorCount = {};
for (const r of (ps.inflows || [])) doorCount[r.door] = (doorCount[r.door] || 0) + 1;
check('inflow doors stock/deposit/pantryAdd 166/20/10',
  doorCount.stock === 166 && doorCount.deposit === 20 && doorCount.pantryAdd === 10, JSON.stringify(doorCount));
check('inflow generic doors: stock only (121)',
  (ps.inflows || []).filter(r => r.name != null && famOf(r.name) === FAM).every(r => r.door === 'stock')
  && (ps.inflows || []).filter(r => r.name != null && famOf(r.name) === FAM).length === 121);
check('inflow excluded records 0',
  (ps.inflows || []).filter(r => r.door === 'stock' && !(r.kcal > 0)).length === 0
  && (ps.inflows || []).filter(r => r.door === 'pantryAdd' && !r.added).length === 0);
const directPaths = {};
for (const r of (ps.directRecords || [])) directPaths[r.path] = (directPaths[r.path] || 0) + 1;
check('direct paths player-take/npc-adult-pantry/green_whisper.cultivate 257/4/1',
  directPaths['player-take'] === 257 && directPaths['npc-adult-pantry'] === 4 && directPaths['green_whisper.cultivate'] === 1,
  JSON.stringify(directPaths));
check('alien-raid direct paths 0',
  (ps.directRecords || []).filter(r => /raid|alien|playground/i.test(r.path || '')).length === 0);
const raidCallers = {};
for (const r of (ps.raidRecords || [])) raidCallers[r.caller] = (raidCallers[r.caller] || 0) + 1;
check('raid callers payTribute/villageAgencyDaily/answerAccord/answerAidBeg/answerNationalChoice 10/3/1/1/1',
  raidCallers.payTribute === 10 && raidCallers.villageAgencyDaily === 3 && raidCallers.answerAccord === 1
  && raidCallers.answerAidBeg === 1 && raidCallers.answerNationalChoice === 1, JSON.stringify(raidCallers));
const otherWant = Math.max(...(ps.mealDrawRecords || []).filter(r => r.context === 'other').map(r => r.want || 0));
check('feast re-check: other max want 1496 < 1500 floor', otherWant === 1496, 'max=' + otherWant);
check('dried unlinked events 0', (ps.driedEvents || []).filter(e => !e.linked).length === 0);
check('dried paths cook-racks/cook-racks-split 111/10',
  (ps.driedEvents || []).filter(e => e.path === 'cook-racks').length === 111
  && (ps.driedEvents || []).filter(e => e.path === 'cook-racks-split').length === 10);
check('sweep violations 0',
  (ps.spoilEvents.sweeps || []).reduce((t, s) => t + (s.violations.pantry.removedNotSpoiledKcal || 0) + (s.violations.pantry.keptSpoiledKcal || 0), 0) === 0);
const sw100 = (ps.spoilEvents.sweeps || []).find(s => s.day === 100);
const sw101 = (ps.spoilEvents.sweeps || []).find(s => s.day === 101);
check('day-100 sweep removes nothing from pantry', sw100 && sw100.removed.pantry.byChannel.length === 0);
check('day-101 sweep removes nothing from pantry', sw101 && sw101.removed.pantry.byChannel.length === 0);
check('stockdoor give-kcal gap 49',
  (ps.stockdoorRecords || []).reduce((t, r) => t + (r.give || 0), 0) - (ps.stockdoorRecords || []).reduce((t, r) => t + (r.kcal || 0), 0) === 49);
check('stockdoor zero-kcal records 124, give sum 8564',
  (ps.stockdoorRecords || []).filter(r => !(r.kcal > 0)).length === 124
  && (ps.stockdoorRecords || []).filter(r => !(r.kcal > 0)).reduce((t, r) => t + (r.give || 0), 0) === 8564);
check('mealCall records carry no items (summary, not a door)',
  (ps.mealDrawRecords || []).filter(r => r.kind === 'mealCall').every(r => !r.items));
check('all-family NEW residuals match genericremainder (Foraged 5719, Fish 20, Purslane 30, Winner -600, rest 0)',
  (() => {
    const want = { 'Foraged food': 5719, 'Fish catch': 20, Purslane: 30, "Winner's share (alien rations)": -600 };
    for (const fam of ['Blackberry', 'Fish catch', 'Foraged food', 'Garden harvest', 'Muscadine Grapes', 'Purslane', 'System-replicated stew', "Winner's share (alien rations)"]) {
      if (famLedger(fam).res !== (want[fam] || 0)) return false;
    }
    return true;
  })());

// ---- (4) windows ----
console.log('(4) windows P and Q');
function keyMap(snap) {
  const m = new Map();
  for (const s of (snap.pantry || [])) {
    const k = [s.channel, s.spoilDay, s.kcalEach, s.foodState].join('|');
    const cur = m.get(k) || { units: 0, kcal: 0 };
    cur.units += s.units || 0; cur.kcal += s.kcal || 0;
    m.set(k, cur);
  }
  return m;
}
const mStart = keyMap(ps.stackDay100Start), mSnap = keyMap(ps.stackDay100Snap), mPost = keyMap(ps.stackPostRun);
let pDiff = 0;
for (const k of new Set([...mStart.keys(), ...mSnap.keys()])) {
  const a = mStart.get(k) || { units: 0, kcal: 0 }, b = mSnap.get(k) || { units: 0, kcal: 0 };
  if (a.units !== b.units || a.kcal !== b.kcal) pDiff++;
}
check('window P identical (0 differing keys, all channels)', pDiff === 0, 'diffs=' + pDiff);
let qFresh = 0;
for (const k of new Set([...mSnap.keys(), ...mPost.keys()])) {
  if (!k.startsWith('Foraged food|')) continue;
  const a = mSnap.get(k) || { kcal: 0 }, b = mPost.get(k) || { kcal: 0 };
  qFresh += b.kcal - a.kcal;
}
check('window Q fresh net -1919 == recorded day-100 fresh net -1919',
  qFresh === -1919 && (inflow100 + stock100 - meal100) === -1919, 'Q=' + qFresh);
check('window Q fresh keys: stockdoor 103/200 +3400, inflow 106/100 +100, draws -5419',
  (() => {
    const d = {};
    for (const k of new Set([...mSnap.keys(), ...mPost.keys()])) {
      if (!k.startsWith('Foraged food|')) continue;
      const a = mSnap.get(k) || { kcal: 0 }, b = mPost.get(k) || { kcal: 0 };
      d[k] = b.kcal - a.kcal;
    }
    return d['Foraged food|103|200|'] === 3400 && d['Foraged food|106|100|'] === 100
      && (d['Foraged food|99|200|'] + d['Foraged food|100|200|'] + d['Foraged food|100|219|'] + d['Foraged food|101|200|']) === -5419;
  })());

// ---- (5) verdict check ----
console.log('(5) verdict check (prereg GO bar: accounted == 3700 +- 1)');
// ACCOUNTED: sum of named components closing the +3,700 row, with records
// cited. NONE found in this arm: the day-100 timing candidate is excluded
// (windows P/Q), not a closure, so it contributes 0 to ACCOUNTED. A future
// arm that names a component adds its kcal here with its records cited.
const ACCOUNTED = 0;
check('VERDICT: accounted == 3700 +- 1 (GO bar)', Math.abs(ACCOUNTED - 3700) <= 1, 'accounted=' + ACCOUNTED);

console.log(`\n${checks - fails}/${checks} checks pass (${fails} fail)`);
if (fails === 1 && Math.abs(ACCOUNTED - 3700) > 1) {
  console.log('VERDICT: PARTIAL (prereg) — fidelity + reproduction + exclusions + windows all pass;');
  console.log('  the day-100 timing candidate is excluded with numbers (P=0, Q recorded exactly),');
  console.log('  raising the unexplained floor from 300 to 3,700 (analyzer) / 3,800 (correct alignment);');
  console.log('  no door closes the full +3,700, so the row is NOT GO. This nonzero exit IS the honest result.');
}
process.exit(fails ? 1 : 0);

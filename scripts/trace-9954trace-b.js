#!/usr/bin/env node
// trace-9954trace-b.js — wider per-stack trace for sim-9954trace-b.
// DIAG only, zero src/js. Reads the faithful replay payload
// (evidence/2026-10-27/sim-9954trace-b-replay/9954trace-b-belongseek-nofeast-s9954.json)
// and the committed raidcallers corpus, and prints:
//   (1) the NEW -> BOUNDARY reproduction for seed 9954 (generic family);
//   (2) the day-100 boundary windows P (start -> snapshot moment) and
//       Q (snapshot moment -> post-run) per stack key, all channels;
//   (3) the correct-alignment residual (+3,800) and the analyzer's
//       boundary residual (+3,700), with the +100 inflow difference;
//   (4) the wider door census (all families, all doors);
//   (5) the day-36 same-day-split worked example (why per-day R(d)
//       oscillates: flows recorded day d split across same-day snapshots).
// Prints only; writes nothing. Usage (from the worktree root):
//   node scripts/trace-9954trace-b.js
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
function fmt(n) { return (n == null ? 'n/a' : Math.round(n).toLocaleString('en-US')); }
const ps = JSON.parse(fs.readFileSync(REPLAY, 'utf8'));
const cp = JSON.parse(fs.readFileSync(CORPUS, 'utf8'));

// ---- NEW-definition family ledger (independent recomputation) ----
function famLedger(fam) {
  let open = 0, close = 0, infl = 0, draws = 0, sweep = 0, loss = 0;
  let openF = 0, openD = 0, closeF = 0, closeD = 0;
  let inflF = 0, inflD = 0, drawsF = 0, drawsD = 0, sweepF = 0, sweepD = 0;
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
  if (fam === FAM) {
    for (const r of (ps.stockdoorRecords || [])) { if (r.kcal > 0) { infl += r.kcal; inflF += r.kcal; } }
  }
  function drawItems(items, sign) {
    for (const it of (items || [])) {
      if (it.name == null || famOf(it.name) !== fam) continue;
      const k = (it.units || 0) * (it.kcalEach || 0);
      draws += k;
      if (isDried(it.name)) drawsD += k; else drawsF += k;
    }
  }
  for (const r of (ps.mealDrawRecords || [])) {
    if (r.kind !== 'pantryDraw' && r.kind !== 'drawSpoiled') continue;
    drawItems(r.items);
  }
  for (const r of (ps.directRecords || [])) drawItems(r.items);
  for (const r of (ps.raidRecords || [])) drawItems(r.items);
  for (const sw of ((ps.spoilEvents || {}).sweeps || [])) {
    for (const bc of (((sw.removed || {}).pantry || {}).byChannel || [])) {
      if (famOf(bc.channel) !== fam) continue;
      sweep += bc.kcal || 0;
      if (isDried(bc.channel)) sweepD += bc.kcal || 0; else sweepF += bc.kcal || 0;
    }
  }
  for (const e of (ps.driedEvents || [])) {
    if (!e.linked || e.lossKcal == null) continue;
    const nm = (e.before && e.before.channel) || '?';
    if (famOf(nm) !== fam) continue;
    loss += e.lossKcal || 0;
  }
  // Fresh/dried split ledgers: fresh loses full pre, dried gains full post.
  let freshPred = openF, driedPred = openD;
  freshPred += inflF; driedPred += inflD;
  freshPred -= drawsF; driedPred -= drawsD;
  freshPred -= sweepF; driedPred -= sweepD;
  for (const e of (ps.driedEvents || [])) {
    if (!e.linked) continue;
    const nm = (e.before && e.before.channel) || '?';
    const am = (e.after && e.after.channel) || '?';
    if (famOf(nm) !== fam) continue;
    if (!isDried(nm)) freshPred -= e.preKcal || 0; else driedPred -= e.preKcal || 0;
    if (famOf(am) === fam) { if (isDried(am)) driedPred += e.postKcal || 0; else freshPred += e.postKcal || 0; }
  }
  return { open, close, infl, draws, sweep, loss,
    pred: open + infl - draws - sweep - loss, res: close - (open + infl - draws - sweep - loss),
    openF, openD, closeF, closeD, freshPred, driedPred,
    freshRes: closeF - freshPred, driedRes: closeD - driedPred };
}
const g = famLedger(FAM);
console.log('=== (1) REPRODUCTION, seed 9954, generic (Foraged food) ===');
console.log(`NEW: open=${fmt(g.open)} close=${fmt(g.close)} (fresh ${fmt(g.closeF)} + dried ${fmt(g.closeD)})`);
console.log(`     infl=${fmt(g.infl)} draws=${fmt(g.draws)} sweep=${fmt(g.sweep)} loss=${fmt(g.loss)}`);
console.log(`     predicted=${fmt(g.pred)} NEW residual=${fmt(g.res)} (fresh ${fmt(g.freshRes)}, dried ${fmt(g.driedRes)})`);
// Boundary bridge + correct-alignment residual.
let stock100 = 0, meal100 = 0, inflow100 = 0;
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
const bClose = g.closeF + stock100 - meal100; // analyzer boundary closing (fresh only)
const bPred = g.freshPred; // NEW predicted fresh closing (all-days flows)
console.log(`BOUNDARY bridge: stock100=${fmt(stock100)} meal100=${fmt(meal100)} inflow100=${fmt(inflow100)} cc100=0`);
console.log(`     analyzer boundary closing=${fmt(bClose)} predicted=${fmt(bPred)} boundary residual=${fmt(bClose - bPred)}`);
// Correct-alignment residual: snapshot minus flows recorded day < 100 (append-order:
// every flow record dated < 100 precedes every day-100 snapshot record).
function flowsBefore(day, freshOnly) {
  let infl = 0, draws = 0, sweep = 0, pre = 0, post = 0;
  for (const r of (ps.inflows || [])) {
    if (r.day >= day) continue;
    if (r.door === 'stock' && !(r.kcal > 0)) continue;
    if (r.door === 'pantryAdd' && !r.added) continue;
    if (r.name == null || famOf(r.name) !== FAM || (freshOnly && isDried(r.name))) continue;
    infl += r.kcal || 0;
  }
  if (!freshOnly || true) {
    for (const r of (ps.stockdoorRecords || [])) if (r.day < day && r.kcal > 0) infl += r.kcal;
  }
  function di(items) {
    for (const it of (items || [])) {
      if (it.name == null || famOf(it.name) !== FAM || (freshOnly && isDried(it.name))) continue;
      draws += (it.units || 0) * (it.kcalEach || 0);
    }
  }
  for (const r of (ps.mealDrawRecords || [])) {
    if (r.day >= day || (r.kind !== 'pantryDraw' && r.kind !== 'drawSpoiled')) continue;
    di(r.items);
  }
  for (const r of (ps.directRecords || [])) if (r.day < day) di(r.items);
  for (const r of (ps.raidRecords || [])) if (r.day < day) di(r.items);
  for (const sw of ((ps.spoilEvents || {}).sweeps || [])) {
    if (sw.day >= day) continue;
    for (const bc of (((sw.removed || {}).pantry || {}).byChannel || [])) {
      if (famOf(bc.channel) !== FAM || (freshOnly && isDried(bc.channel))) continue;
      sweep += bc.kcal || 0;
    }
  }
  for (const e of (ps.driedEvents || [])) {
    if (e.day >= day || !e.linked) continue;
    const nm = (e.before && e.before.channel) || '?';
    const am = (e.after && e.after.channel) || '?';
    if (famOf(nm) !== FAM) continue;
    if (freshOnly) { if (!isDried(nm)) pre += e.preKcal || 0; if (famOf(am) === FAM && !isDried(am)) post += e.postKcal || 0; }
  }
  return { infl, draws, sweep, pre, post, pred: infl - draws - sweep - pre + post };
}
const bef100 = flowsBefore(100, true);
const alignRes = g.closeF - bef100.pred;
console.log(`CORRECT-ALIGNMENT residual at snapshot moment: snap fresh=${fmt(g.closeF)} predicted(from flows day<100)=${fmt(bef100.pred)} residual=${fmt(alignRes)}`);
console.log(`     (analyzer 3,700 vs correct-alignment 3,800: difference = inflow100 ${fmt(inflow100)}, empirically post-snapshot, misattributed pre-snapshot by the analyzer)`);

// ---- (2) Windows P and Q per stack key ----
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
console.log('\n=== (2) WINDOWS P and Q, per stack key (all channels) ===');
console.log(`snapshots: start day=${ps.stackDay100Start.day} (${ps.stackDay100Start.pantry.length} stacks), snap day=${ps.stackDay100Snap.day} (${ps.stackDay100Snap.pantry.length} stacks), post day=${ps.stackPostRun.day} (${ps.stackPostRun.pantry.length} stacks)`);
let pDiff = 0;
for (const k of new Set([...mStart.keys(), ...mSnap.keys()])) {
  const a = mStart.get(k) || { units: 0, kcal: 0 }, b = mSnap.get(k) || { units: 0, kcal: 0 };
  if (a.units !== b.units || a.kcal !== b.kcal) { console.log(`  P DIFF ${k}: start ${a.units}u/${a.kcal} -> snap ${b.units}u/${b.kcal}`); pDiff++; }
}
console.log(`Window P (start -> snapshot moment): ${pDiff === 0 ? 'IDENTICAL, all keys (net 0)' : pDiff + ' differing keys'}`);
console.log('Window Q (snapshot moment -> post-run) diffs:');
for (const k of new Set([...mSnap.keys(), ...mPost.keys()])) {
  const a = mSnap.get(k) || { units: 0, kcal: 0 }, b = mPost.get(k) || { units: 0, kcal: 0 };
  if (a.units !== b.units || a.kcal !== b.kcal) console.log(`  Q ${k}: snap ${a.units}u/${a.kcal} -> post ${b.units}u/${b.kcal} (delta ${b.units - a.units}u/${b.kcal - a.kcal})`);
}
let qFresh = 0;
for (const k of new Set([...mSnap.keys(), ...mPost.keys()])) {
  const ch = k.split('|')[0];
  if (ch !== 'Foraged food') continue;
  const a = mSnap.get(k) || { kcal: 0 }, b = mPost.get(k) || { kcal: 0 };
  qFresh += b.kcal - a.kcal;
}
console.log(`Window Q fresh generic net=${fmt(qFresh)}; recorded day-100 fresh net=${fmt(inflow100 + stock100 - meal100)} (inflow ${fmt(inflow100)} + stockdoor ${fmt(stock100)} - meals ${fmt(meal100)})`);

// ---- (4) Wider door census ----
console.log('\n=== (4) WIDER DOOR CENSUS, seed 9954 (replay = corpus, fidelity-proved) ===');
const doorCount = {};
for (const r of (ps.inflows || [])) doorCount[r.door] = (doorCount[r.door] || 0) + 1;
console.log('inflow doors:', JSON.stringify(doorCount));
console.log('inflow generic doors:', JSON.stringify((() => { const c = {}; for (const r of (ps.inflows || [])) if (r.name != null && famOf(r.name) === FAM) c[r.door] = (c[r.door] || 0) + 1; return c; })()));
console.log('inflow excluded: stock<=0:', (ps.inflows || []).filter(r => r.door === 'stock' && !(r.kcal > 0)).length,
  'pantryAdd-unadded:', (ps.inflows || []).filter(r => r.door === 'pantryAdd' && !r.added).length);
console.log('direct paths:', JSON.stringify((() => { const c = {}; for (const r of (ps.directRecords || [])) c[r.path] = (c[r.path] || 0) + 1; return c; })()));
console.log('raid callers:', JSON.stringify((() => { const c = {}; for (const r of (ps.raidRecords || [])) c[r.caller] = (c[r.caller] || 0) + 1; return c; })()));
console.log('meal kinds:', JSON.stringify((() => { const c = {}; for (const r of (ps.mealDrawRecords || [])) c[r.kind] = (c[r.kind] || 0) + 1; return c; })()),
  'contexts:', JSON.stringify((() => { const c = {}; for (const r of (ps.mealDrawRecords || [])) c[r.context] = (c[r.context] || 0) + 1; return c; })()));
const otherWant = Math.max(...(ps.mealDrawRecords || []).filter(r => r.context === 'other').map(r => r.want || 0));
console.log(`meal 'other' max want=${otherWant} (feast cost floor 1500)`);
console.log('dried paths:', JSON.stringify((() => { const c = {}; for (const e of (ps.driedEvents || [])) c[e.path] = (c[e.path] || 0) + 1; return c; })()),
  'kinds:', JSON.stringify((() => { const c = {}; for (const e of (ps.driedEvents || [])) c[e.kind] = (c[e.kind] || 0) + 1; return c; })()),
  'unlinked:', (ps.driedEvents || []).filter(e => !e.linked).length);
const sweepDays = (ps.spoilEvents.sweeps || []).map(s => s.day);
console.log(`sweeps: n=${sweepDays.length} day range ${Math.min(...sweepDays)}..${Math.max(...sweepDays)}; day-100 removed pantry:`,
  JSON.stringify(((ps.spoilEvents.sweeps || []).find(s => s.day === 100) || { removed: { pantry: { byChannel: [] } } }).removed.pantry.byChannel),
  '; day-101 removed pantry:',
  JSON.stringify(((ps.spoilEvents.sweeps || []).find(s => s.day === 101) || { removed: { pantry: { byChannel: [] } } }).removed.pantry.byChannel));
console.log('sweep violations (removed-not-spoiled + kept-spoiled kcal):',
  (ps.spoilEvents.sweeps || []).reduce((t, s) => t + (s.violations.pantry.removedNotSpoiledKcal || 0) + (s.violations.pantry.keptSpoiledKcal || 0), 0));
console.log('stockdoor zero-kcal records:', (ps.stockdoorRecords || []).filter(r => !(r.kcal > 0)).length,
  'give sum:', (ps.stockdoorRecords || []).filter(r => !(r.kcal > 0)).reduce((t, r) => t + (r.give || 0), 0),
  'give-kcal gap:', (ps.stockdoorRecords || []).reduce((t, r) => t + (r.give || 0), 0) - (ps.stockdoorRecords || []).reduce((t, r) => t + (r.kcal || 0), 0));
console.log('alien-raid direct paths:', JSON.stringify((ps.directRecords || []).filter(r => /raid|alien|playground/i.test(r.path || '')).map(r => r.path)));
console.log('all-family NEW residuals:');
const fams = [...new Set([...(ps.spoilDays[ps.spoilDays.length - 1].channels || []).map(c => famOf(c.channel)),
  ...(ps.inflows || []).filter(r => r.name != null).map(r => famOf(r.name))])].sort();
for (const fam of fams) { const L = famLedger(fam); console.log(`  ${fam}: close=${fmt(L.close)} pred=${fmt(L.pred)} RES=${fmt(L.res)}`); }

// ---- (5) Day-36 same-day split example ----
console.log('\n=== (5) DAY-36 SAME-DAY SPLIT (why per-day R(d) oscillates) ===');
const d36 = ps.stackDays.map((s, i) => [i, s]).filter(([i, s]) => s.day === 36);
console.log(`stackDays entries with day 36: ${d36.length}`);
for (const [i, s] of d36) {
  const tot = s.pantry.filter(x => x.channel === 'Foraged food').reduce((t, x) => t + x.kcal, 0);
  console.log(`  stackDays[${i}] day 36 fresh total=${fmt(tot)}`);
}
if (d36.length === 2) {
  const a = keyMap(d36[0][1]), b = keyMap(d36[1][1]);
  console.log('  keys removed between the two day-36 snapshots (fresh only):');
  for (const k of new Set([...a.keys(), ...b.keys()])) {
    if (!k.startsWith('Foraged food|')) continue;
    const x = a.get(k) || { units: 0, kcal: 0 }, y = b.get(k) || { units: 0, kcal: 0 };
    if (x.kcal !== y.kcal) console.log(`    ${k}: ${x.units}u/${x.kcal} -> ${y.units}u/${y.kcal}`);
  }
  console.log('  (these removed stacks are day-36 cook-racks transform pre-stacks: 6 events, pre 186+200+500+13+468+1200=2,567; the 227+127 transforms fired after the second snapshot — same recorded day, different snapshot side)');
}
console.log('\nFidelity note: replay vs corpus compared in scripts/test-9954trace-b.js (all shared fields equal except ms and stackTop worktree paths).');

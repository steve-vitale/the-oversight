#!/usr/bin/env node
// VENDORED for sim-raidday100-judge-b from sim-raidday100-b's same-named scripts; only filenames, corpus dir, file prefix, mode string, staging dir, and capture require changed; ledger math and internal raid field names (raidRecords/raiddorOn/RAIDDOORS) unchanged for analyzer compatibility. Sibling raiddor files untouched.
// trace-raidday100-judge-b.js — day-by-day (snapshot-sequence) ledger trace
// for sim-raidday100-judge-b. DIAG only, zero src/js. VENDORED from
// ledgerbound's trace; the only change is that raid-unanswered draws
// are included in the transition flows (other _removePantryKcal caller
// paths are listed as INFO, never counted).
//
// For one seed + family, it reconstructs the analyzer's NEW-definition
// family ledger as a SEQUENCE over the spoilDays snapshots:
//   openingStock -> snapshot[0] -> snapshot[1] -> ... -> snapshot[last]
// and attributes each transition's flows by record day:
//   interval (prevDay, snapDay]  (primary alignment; duplicates give an
//   empty interval, which is itself informative).
// Per transition it prints actual freshKcal delta (snapshot diff),
// predicted delta (inflow - draws - sweep - transformLoss, NEW
// definition incl. stockdoor inflow for the generic family and
// drawSpoiled + direct draws), and the step divergence. It also prints
// the cumulative divergence series and the final divergence, which
// must equal the analyzer's newResidual for the family-seed
// (cross-check). A persistent divergence — a step after which the
// cumulative divergence never returns to zero — localizes the
// residual to a snapshot transition; the itemized flows of that
// interval are then printed so the flow (or its absence, i.e. a
// boundary artifact) can be named with per-record evidence.
//
// Usage: node scripts/trace-ledgerbound-b.js <corpusDir> <seed> <family>
//   family: e.g. "Muscadine Grapes", "Burdock", "Lamb's Quarters",
//   "Foraged food", "Fish". Prints all transitions with nonzero step
//   divergence plus the cumulative series summary.
'use strict';
const fs = require('fs');
const path = require('path');

function famOf(nm) { return String(nm || '').replace(/ \((dried|smoked)\)$/, ''); }
function fmt(n) { return (n == null ? 'n/a' : Math.round(n).toLocaleString('en-US')); }

const dir = process.argv[2];
const seed = parseInt(process.argv[3], 10);
const family = process.argv[4];
if (!dir || !seed || !family) {
  console.error('usage: node scripts/trace-ledgerbound-b.js <corpusDir> <seed> <family>');
  process.exit(2);
}
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
const file = files.find(f => f.indexOf('-s' + seed + '.json') >= 0);
if (!file) { console.error('no corpus file for seed ' + seed); process.exit(2); }
const ps = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));

// ---- per-day family flows (NEW definition, same honesty rules as the analyzer)
const flowByDay = new Map(); // day -> {inflow, draws, sweep, loss, items:[]}
function dayRec(day) {
  if (!flowByDay.has(day)) flowByDay.set(day, { inflow: 0, draws: 0, sweep: 0, loss: 0, items: [] });
  return flowByDay.get(day);
}
for (const r of (ps.inflows || [])) {
  if (r.door === 'stock' && !(r.kcal > 0)) continue;
  if (r.door === 'pantryAdd' && !r.added) continue;
  if (r.name == null || famOf(r.name) !== family) continue;
  const d = dayRec(r.day); d.inflow += r.kcal || 0;
  d.items.push(`inflow ${r.door} ${r.name} +${r.kcal} (day ${r.day}, seq ${r.seq})`);
}
for (const r of (ps.stockdoorRecords || [])) {
  if (family !== 'Foraged food' || !(r.kcal > 0)) continue;
  const d = dayRec(r.day); d.inflow += r.kcal || 0;
  d.items.push(`stockdoor give=${r.give} +${r.kcal} (day ${r.day}, vDay ${r.vDay}, spoilDay ${r.spoilDay})`);
}
for (const r of (ps.mealDrawRecords || [])) {
  if (r.kind !== 'pantryDraw' && r.kind !== 'drawSpoiled') continue;
  for (const it of (r.items || [])) {
    if (it.name == null || famOf(it.name) !== family) continue;
    const kcal = (it.units || 0) * (it.kcalEach || 0);
    const d = dayRec(r.day); d.draws += kcal;
    d.items.push(`draw ${r.kind} ctx=${r.context} ${it.name} ${it.units}u x ${it.kcalEach} = -${kcal} (day ${r.day}, spoilDay ${it.spoilDay})`);
  }
}
for (const r of (ps.directRecords || [])) {
  for (const it of (r.items || [])) {
    if (it.name == null || famOf(it.name) !== family) continue;
    const kcal = (it.units || 0) * (it.kcalEach || 0);
    const d = dayRec(r.day); d.draws += kcal;
    d.items.push(`direct ${r.path} ${it.name} ${it.units}u x ${it.kcalEach} = -${kcal} (day ${r.day}, spoilDay ${it.spoilDay})`);
  }
}
for (const r of (ps.raidRecords || [])) {
  for (const it of (r.items || [])) {
    if (it.name == null || famOf(it.name) !== family) continue;
    const kcal = (it.units || 0) * (it.kcalEach || 0);
    const d = dayRec(r.day);
    if (r.path === 'raid-unanswered') {
      d.draws += kcal;
      d.items.push(`raid-unanswered caller=${r.caller} ${it.name} ${it.units}u x ${it.kcalEach} = -${kcal} (day ${r.day}, spoilDay ${it.spoilDay}, asked ${r.asked}, ret ${r.retTaken})`);
    } else {
      d.items.push(`INFO removepantry (NOT counted) ${r.path} ${it.name} ${it.units}u x ${it.kcalEach} = -${kcal} (day ${r.day}, spoilDay ${it.spoilDay})`);
    }
  }
}
for (const sw of ((ps.spoilEvents || {}).sweeps || [])) {
  const pan = (sw.removed || {}).pantry || {};
  for (const bc of (pan.byChannel || [])) {
    if (famOf(bc.channel) !== family) continue;
    const d = dayRec(sw.day); d.sweep += bc.kcal || 0;
    d.items.push(`sweep ${bc.channel} -${bc.kcal} (day ${sw.day})`);
  }
}
for (const e of (ps.driedEvents || [])) {
  const nm = (e.before && e.before.channel) || '?';
  if (famOf(nm) !== family) continue;
  if (!e.linked || e.lossKcal == null) continue;
  const d = dayRec(e.day); d.loss += e.lossKcal || 0;
  d.items.push(`transform ${e.path} ${nm} loss -${e.lossKcal} pre=${e.preKcal} post=${e.postKcal} (day ${e.day})`);
}

// ---- snapshot series (opening + each spoilDays entry, in order)
function famTotal(channels) {
  let t = 0;
  for (const ch of (channels || [])) if (famOf(ch.channel) === family) t += ch.freshKcal || 0;
  return t;
}
const snaps = [{ day: 0, total: famTotal((ps.openingStock || {}).channels), label: 'opening' }];
for (const sd of (ps.spoilDays || [])) snaps.push({ day: sd.day, total: famTotal(sd.channels), label: 'spoilDays' });

// ---- transitions
let cumDiv = 0;
const steps = [];
const lastSnapDay = snaps[snaps.length - 1].day;
const postHorizon = []; // flows dated after the last snapshot: counted in
// the ledger but never reflected in any snapshot (horizon boundary).
for (let i = 1; i < snaps.length; i++) {
  const prev = snaps[i - 1], cur = snaps[i];
  let inflow = 0, draws = 0, sweep = 0, loss = 0; const items = [];
  for (const [day, f] of flowByDay) {
    if (day > prev.day && day <= cur.day) { inflow += f.inflow; draws += f.draws; sweep += f.sweep; loss += f.loss; items.push(...f.items); }
  }
  const actual = cur.total - prev.total;
  const predicted = inflow - draws - sweep - loss;
  const stepDiv = actual - predicted;
  cumDiv += stepDiv;
  steps.push({ i, prevDay: prev.day, curDay: cur.day, prevTotal: prev.total, curTotal: cur.total,
    actual, predicted, inflow, draws, sweep, loss, stepDiv, cumDiv, items });
}
let postNet = 0;
for (const [day, f] of flowByDay) {
  if (day > lastSnapDay) { postNet += f.inflow - f.draws - f.sweep - f.loss; postHorizon.push(...f.items.map(t => `day ${day}: ${t}`)); }
}
const analyzerCheck = (() => {
  // Recompute the analyzer's newResidual for this family-seed directly.
  let opening = snaps[0].total, closing = snaps[snaps.length - 1].total;
  let inflow = 0, draws = 0, sweep = 0, loss = 0;
  for (const f of flowByDay.values()) { inflow += f.inflow; draws += f.draws; sweep += f.sweep; loss += f.loss; }
  return (closing - opening) - (inflow - draws - sweep - loss);
})();

console.log(`trace seed=${seed} family="${family}" snapshots=${snaps.length} opening=${fmt(snaps[0].total)} closing=${fmt(snaps[snaps.length - 1].total)}`);
console.log(`within-horizon cumulative divergence=${fmt(cumDiv)}  post-horizon net (flows day > ${lastSnapDay})=${fmt(postNet)}  analyzer-style newResidual=${fmt(analyzerCheck)}  identity (cumDiv - postNet == analyzerCheck): ${cumDiv - postNet === analyzerCheck}`);
if (postHorizon.length) {
  console.log(`POST-HORIZON flows (dated after the last snapshot — counted in the ledger, never reflected in closing):`);
  for (const it of postHorizon) console.log(`    ${it}`);
}
console.log(`nonzero step divergences:`);
for (const s of steps) {
  if (s.stepDiv === 0) continue;
  console.log(`  transition #${s.i} days (${s.prevDay} -> ${s.curDay}]: actual=${fmt(s.actual)} predicted=${fmt(s.predicted)} (in=${fmt(s.inflow)} draws=${fmt(s.draws)} sweep=${fmt(s.sweep)} loss=${fmt(s.loss)}) stepDiv=${fmt(s.stepDiv)} cumDiv=${fmt(s.cumDiv)}`);
}
// Persistent divergence: first step after which cumDiv never returns to 0.
let persistent = null;
for (let k = 0; k < steps.length; k++) {
  if (steps[k].cumDiv !== 0 && steps.slice(k).every(s => s.cumDiv !== 0)) { persistent = steps[k]; break; }
}
if (persistent) {
  console.log(`\nPERSISTENT divergence starts at transition #${persistent.i} (days ${persistent.prevDay} -> ${persistent.curDay}], stepDiv=${fmt(persistent.stepDiv)}, final cumDiv=${fmt(cumDiv)}`);
  console.log(`(snapshot/flow day numbering lags by ~1 transition on controls: inflow and draws on the same day are reflected in different transitions. So flows are printed for a WINDOW of transitions around the persistent step, not just the step itself.)`);
  for (const s of steps.filter(x => Math.abs(x.i - persistent.i) <= 2)) {
    console.log(`  window transition #${s.i} days (${s.prevDay} -> ${s.curDay}]: actual=${fmt(s.actual)} predicted=${fmt(s.predicted)} stepDiv=${fmt(s.stepDiv)} cumDiv=${fmt(s.cumDiv)}`);
    for (const it of s.items) console.log(`      ${it}`);
    if (!s.items.length) console.log(`      (NO recorded flows in this interval)`);
  }
} else if (cumDiv !== 0) {
  console.log(`\nno single persistent step (cumulative divergence ${fmt(cumDiv)} arises across steps that later cancel — see nonzero steps above)`);
} else {
  console.log(`\nno persistent divergence: family closes over the snapshot series`);
}

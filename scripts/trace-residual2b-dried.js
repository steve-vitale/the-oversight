#!/usr/bin/env node
// trace-residual2b-dried.js — single-channel (exact channel name) ledger
// trace for sim-residual2b. DIAG only, zero src/js.
//
// The family trace (trace-residual2b.js) aggregates base + dried channels,
// so a dried-only movement is netted against the base channel. This script
// traces ONE exact channel (e.g. "Lamb's Quarters (dried)") over the
// spoilDays snapshot series, with BOTH freshKcal and spoiledKcal series:
//
//   fresh delta = transformIn(post) - transformOut(pre) + inflow
//                 - draws - sweep
//   spoiled delta is reported alongside: a fresh drop matched by an equal
//   spoiled rise on the same transition is a fresh->spoiled reclassification
//   (the stack crossed its spoilDay+bonus boundary between snapshots),
//   NOT a missing flow — the ledger counts freshKcal only.
//
// Flows by record day, interval (prevDay, snapDay], same alignment as the
// family trace. Flows dated after the last snapshot are POST-HORIZON.
// Draws counted: pantryDraw + drawSpoiled meal records and direct records
// with items whose name equals the channel EXACTLY. Sweeps: spoilEvents
// pantry byChannel with channel equal to the channel EXACTLY. Transforms:
// driedEvents with after.channel == channel (in, +postKcal) or
// before.channel == channel (out, -preKcal). Inflows/stockdoor records
// with name equal to the channel EXACTLY (expected: none for dried).
//
// Usage: node scripts/trace-residual2b-dried.js <corpusDir> <seed> <channel>
'use strict';
const fs = require('fs');
const path = require('path');
function fmt(n) { return (n == null ? 'n/a' : Math.round(n).toLocaleString('en-US')); }
const dir = process.argv[2];
const seed = parseInt(process.argv[3], 10);
const channel = process.argv[4];
if (!dir || !seed || !channel) {
  console.error('usage: node scripts/trace-residual2b-dried.js <corpusDir> <seed> <channel>');
  process.exit(2);
}
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
const file = files.find(f => f.indexOf('-s' + seed + '.json') >= 0);
if (!file) { console.error('no corpus file for seed ' + seed); process.exit(2); }
const ps = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));

const flowByDay = new Map();
function dayRec(day) {
  if (!flowByDay.has(day)) flowByDay.set(day, { tin: 0, tout: 0, inflow: 0, draws: 0, sweep: 0, items: [] });
  return flowByDay.get(day);
}
for (const r of (ps.inflows || [])) {
  if (r.door === 'stock' && !(r.kcal > 0)) continue;
  if (r.door === 'pantryAdd' && !r.added) continue;
  if (r.name !== channel) continue;
  const d = dayRec(r.day); d.inflow += r.kcal || 0;
  d.items.push(`inflow ${r.door} ${r.name} +${r.kcal} (day ${r.day}, seq ${r.seq})`);
}
for (const r of (ps.stockdoorRecords || [])) {
  if (r.name !== channel || !(r.kcal > 0)) continue;
  const d = dayRec(r.day); d.inflow += r.kcal || 0;
  d.items.push(`stockdoor give=${r.give} +${r.kcal} (day ${r.day}, vDay ${r.vDay}, spoilDay ${r.spoilDay})`);
}
for (const r of (ps.mealDrawRecords || [])) {
  if (r.kind !== 'pantryDraw' && r.kind !== 'drawSpoiled') continue;
  for (const it of (r.items || [])) {
    if (it.name !== channel) continue;
    const kcal = (it.units || 0) * (it.kcalEach || 0);
    const d = dayRec(r.day); d.draws += kcal;
    d.items.push(`draw ${r.kind} ctx=${r.context} ${it.name} ${it.units}u x ${it.kcalEach} = -${kcal} (day ${r.day}, spoilDay ${it.spoilDay})`);
  }
}
for (const r of (ps.directRecords || [])) {
  for (const it of (r.items || [])) {
    if (it.name !== channel) continue;
    const kcal = (it.units || 0) * (it.kcalEach || 0);
    const d = dayRec(r.day); d.draws += kcal;
    d.items.push(`direct ${r.path} ${it.name} ${it.units}u x ${it.kcalEach} = -${kcal} (day ${r.day}, spoilDay ${it.spoilDay})`);
  }
}
for (const sw of ((ps.spoilEvents || {}).sweeps || [])) {
  const pan = (sw.removed || {}).pantry || {};
  for (const bc of (pan.byChannel || [])) {
    if (bc.channel !== channel) continue;
    const d = dayRec(sw.day); d.sweep += bc.kcal || 0;
    d.items.push(`sweep ${bc.channel} -${bc.kcal} (day ${sw.day})`);
  }
}
for (const e of (ps.driedEvents || [])) {
  const before = (e.before && e.before.channel) || null;
  const after = (e.after && e.after.channel) || null;
  if (after === channel) {
    const d = dayRec(e.day); d.tin += e.postKcal || 0;
    d.items.push(`transform-in ${e.path} ${before} -> ${after} +${e.postKcal} pre=${e.preKcal} post=${e.postKcal} linked=${!!e.linked} (day ${e.day})`);
  }
  if (before === channel) {
    const d = dayRec(e.day); d.tout += e.preKcal || 0;
    d.items.push(`transform-out ${e.path} ${before} -> ${after} -${e.preKcal} pre=${e.preKcal} post=${e.postKcal} linked=${!!e.linked} (day ${e.day})`);
  }
}

function chTotal(channels, key) {
  let t = 0;
  for (const ch of (channels || [])) if (ch.channel === channel) t += ch[key] || 0;
  return t;
}
const snaps = [{ day: 0, fresh: chTotal((ps.openingStock || {}).channels, 'freshKcal'), spoiled: chTotal((ps.openingStock || {}).channels, 'spoiledKcal'), label: 'opening' }];
for (const sd of (ps.spoilDays || [])) snaps.push({ day: sd.day, fresh: chTotal(sd.channels, 'freshKcal'), spoiled: chTotal(sd.channels, 'spoiledKcal'), label: 'spoilDays' });

let cumDiv = 0;
const steps = [];
const lastSnapDay = snaps[snaps.length - 1].day;
for (let i = 1; i < snaps.length; i++) {
  const prev = snaps[i - 1], cur = snaps[i];
  let tin = 0, tout = 0, inflow = 0, draws = 0, sweep = 0; const items = [];
  for (const [day, f] of flowByDay) {
    if (day > prev.day && day <= cur.day) { tin += f.tin; tout += f.tout; inflow += f.inflow; draws += f.draws; sweep += f.sweep; items.push(...f.items); }
  }
  const actualFresh = cur.fresh - prev.fresh;
  const actualSpoiled = cur.spoiled - prev.spoiled;
  const predicted = tin - tout + inflow - draws - sweep;
  const stepDiv = actualFresh - predicted;
  cumDiv += stepDiv;
  steps.push({ i, prevDay: prev.day, curDay: cur.day, prevFresh: prev.fresh, curFresh: cur.fresh,
    prevSpoiled: prev.spoiled, curSpoiled: cur.spoiled, actualFresh, actualSpoiled, predicted,
    tin, tout, inflow, draws, sweep, stepDiv, cumDiv, items });
}
let postNet = 0; const postHorizon = [];
for (const [day, f] of flowByDay) {
  if (day > lastSnapDay) { postNet += f.tin - f.tout + f.inflow - f.draws - f.sweep; postHorizon.push(...f.items.map(t => `day ${day}: ${t}`)); }
}
let allTin = 0, allTout = 0, allIn = 0, allDr = 0, allSw = 0;
for (const f of flowByDay.values()) { allTin += f.tin; allTout += f.tout; allIn += f.inflow; allDr += f.draws; allSw += f.sweep; }
const analyzerCheck = (snaps[snaps.length - 1].fresh - snaps[0].fresh) - (allTin - allTout + allIn - allDr - allSw);

console.log(`dried-trace seed=${seed} channel="${channel}" snapshots=${snaps.length} openingFresh=${fmt(snaps[0].fresh)} closingFresh=${fmt(snaps[snaps.length - 1].fresh)} openingSpoiled=${fmt(snaps[0].spoiled)} closingSpoiled=${fmt(snaps[snaps.length - 1].spoiled)}`);
console.log(`within-horizon cumulative fresh divergence=${fmt(cumDiv)}  post-horizon net (flows day > ${lastSnapDay})=${fmt(postNet)}  analyzer-style residual=${fmt(analyzerCheck)}  identity (cumDiv - postNet == analyzerCheck): ${cumDiv - postNet === analyzerCheck}`);
if (postHorizon.length) {
  console.log(`POST-HORIZON flows:`);
  for (const it of postHorizon) console.log(`    ${it}`);
}
console.log(`nonzero fresh step divergences (with spoiled delta on the same transition):`);
for (const s of steps) {
  if (s.stepDiv === 0) continue;
  console.log(`  transition #${s.i} days (${s.prevDay} -> ${s.curDay}]: fresh ${fmt(s.prevFresh)} -> ${fmt(s.curFresh)} (actual=${fmt(s.actualFresh)}) predicted=${fmt(s.predicted)} (tin=${fmt(s.tin)} tout=${fmt(s.tout)} in=${fmt(s.inflow)} draws=${fmt(s.draws)} sweep=${fmt(s.sweep)}) stepDiv=${fmt(s.stepDiv)} cumDiv=${fmt(s.cumDiv)} spoiled ${fmt(s.prevSpoiled)} -> ${fmt(s.curSpoiled)} (delta=${fmt(s.actualSpoiled)})${s.actualSpoiled === -s.stepDiv && s.stepDiv !== 0 ? '  <-- RECLASSIFICATION: spoiled delta exactly offsets fresh stepDiv' : ''}`);
}
let persistent = null;
for (let k = 0; k < steps.length; k++) {
  if (steps[k].cumDiv !== 0 && steps.slice(k).every(s => s.cumDiv !== 0)) { persistent = steps[k]; break; }
}
if (persistent) {
  console.log(`\nPERSISTENT divergence starts at transition #${persistent.i} (days ${persistent.prevDay} -> ${persistent.curDay}], stepDiv=${fmt(persistent.stepDiv)}, final cumDiv=${fmt(cumDiv)}`);
  for (const s of steps.filter(x => Math.abs(x.i - persistent.i) <= 2)) {
    console.log(`  window transition #${s.i} days (${s.prevDay} -> ${s.curDay}]: fresh ${fmt(s.prevFresh)} -> ${fmt(s.curFresh)} spoiled ${fmt(s.prevSpoiled)} -> ${fmt(s.curSpoiled)} predicted=${fmt(s.predicted)} stepDiv=${fmt(s.stepDiv)} cumDiv=${fmt(s.cumDiv)}`);
    for (const it of s.items) console.log(`      ${it}`);
    if (!s.items.length) console.log(`      (NO recorded flows in this interval)`);
  }
} else if (cumDiv !== 0) {
  console.log(`\nno single persistent step (cumulative divergence ${fmt(cumDiv)} arises across steps that later cancel — see nonzero steps above)`);
} else {
  console.log(`\nno persistent divergence: channel closes over the snapshot series`);
}

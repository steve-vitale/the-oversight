// analyze-windowcarry-b.js — pure reads over windowcarry corpora.
// Compares control (trace driver) vs variant vs OFF (probe driver) legs
// on identical seeds for ONE woodwarm leg (guard or ON), and judges the
// prereg's census bars (strand counts, runs, det-gate, guardrails, and
// the causal-link clause: a rescued evening inside the control strand
// range whose preceding evening's pack held known kcal — carried
// staples physically present at the creek the night before the rescue).
// Usage: node scripts/analyze-windowcarry-b.js <guard|on> <controlDir>
//   <variantDir> <offDir> <outJson>
// Per-seed output: creek/still/rescued counts + still day lists,
// strand runs, vessel deaths, daysAlive, maxWave, departs (with
// window violations), strand mornings, and the linked-rescue list.
'use strict';
const fs = require('fs');
const path = require('path');

function strandOf(d) {
  const creek = [], still = [], rescued = [];
  const runs = [];
  let run = [];
  const flush = () => { if (run.length) runs.push(run); run = []; };
  for (const e of (d.evenings || [])) {
    const wc = e.woodcarry || {};
    if (wc.bucket !== 'creek') { flush(); continue; }
    creek.push(e.loopDay);
    if (wc.rescued) { rescued.push(e.loopDay); flush(); }
    else { still.push(e.loopDay); run.push(e.loopDay); }
  }
  flush();
  return { creek, still, rescued, runs };
}
function ticksShortCount(d) {
  let n = 0;
  for (const e of (d.evenings || [])) {
    const b = (e.woodcarry && e.woodcarry.bridge) || {};
    if (b.skip === 'ticks-short') n++;
  }
  return n;
}
function eveningByLoopDay(d) {
  const m = {};
  for (const e of (d.evenings || [])) m[e.loopDay] = e;
  return m;
}
function analyzeSeed(filePath) {
  const d = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const s = strandOf(d);
  const wc = d.windowcarryStore || { departRecords: [] };
  const departs = (wc.departRecords || []).filter((r) => r.acted);
  const windowViolations = departs.filter((r) => r.loopDay > 7).map((r) => r.loopDay);
  const strandMornings = (d.mornings || []).filter((m) => m.strandMorning).map((m) => ({
    loopDay: m.loopDay, kcal: m.kcal, known: m.pack ? m.pack.kcalKnown : null,
    wood: m.morningWood,
  }));
  const evenings = (d.evenings || []).map((e) => ({
    loopDay: e.loopDay, bucket: (e.woodcarry || {}).bucket || null,
    rescued: !!((e.woodcarry || {}).rescued),
    packKnown: e.pack ? e.pack.kcalKnown : null, kcal: e.kcal || null,
    ticksShort: ((e.woodcarry && e.woodcarry.bridge) || {}).skip === 'ticks-short',
  }));
  return {
    seed: d.seed, arm: d.arm || null, errs: d.errCount,
    daysAlive: d.daysAlive, endReason: d.endReason, maxWaveUnlocked: d.maxWaveUnlocked,
    waveKills: d.waveKills, deaths: d.deaths || [],
    creek: s.creek, still: s.still, rescued: s.rescued, runs: s.runs,
    ticksShort: ticksShortCount(d),
    departs: departs.map((r) => ({ loopDay: r.loopDay, units: r.units, kcalPacked: r.kcalPacked, knownBefore: r.knownBefore, knownAfter: r.knownAfter })),
    departSkips: (wc.departRecords || []).filter((r) => !r.acted).map((r) => ({ loopDay: r.loopDay, skip: r.skip })),
    windowViolations, storeDailyCount: wc.dailyCount || null, storeSeenStill: !!wc.seenStill,
    strandMornings, evenings,
  };
}
// Linked rescue: D in the control still range, variant evening D rescued,
// variant evening D-1 pack known-kcal > 0 (carried staples at the creek
// the night before the rescue). Returns the list of such D.
function linkedRescues(controlStill, variant) {
  const byDay = {};
  for (const e of variant.evenings) byDay[e.loopDay] = e;
  const out = [];
  for (const D of variant.rescuedList || []) {
    if (!controlStill.includes(D)) continue;
    const prev = byDay[D - 1];
    if (prev && (prev.packKnown || 0) > 0) out.push({ day: D, prevPackKnown: prev.packKnown });
  }
  return out;
}

function main() {
  const leg = process.argv[2];
  const controlDir = process.argv[3];
  const variantDir = process.argv[4];
  const offDir = process.argv[5];
  const out = process.argv[6] || null;
  if (!leg || !controlDir || !variantDir || !offDir) {
    console.error('usage: analyze-windowcarry-b.js <guard|on> <controlDir> <variantDir> <offDir> <outJson>');
    process.exit(2);
  }
  const load = (dir) => {
    const o = {};
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
      const a = analyzeSeed(path.join(dir, f));
      o[a.seed] = a;
    }
    return o;
  };
  const control = load(controlDir);
  const variant = load(variantDir);
  const off = load(offDir);
  const seeds = Object.keys(control).map(Number).sort((a, b) => a - b);
  const perSeed = {};
  let detMatch = true;
  const detMismatches = [];
  for (const seed of seeds) {
    const c = control[seed], v = variant[seed], o = off[seed];
    if (!v || !o) { console.error('MISSING leg for seed ' + seed); process.exit(2); }
    const detOk = JSON.stringify([o.creek, o.still, o.rescued]) === JSON.stringify([c.creek, c.still, c.rescued]);
    if (!detOk) { detMatch = false; detMismatches.push(seed); }
    // Linked rescues on the variant leg against this seed's control range.
    const vWithRescued = Object.assign({}, v, { rescuedList: v.rescued });
    const links = linkedRescues(c.still, vWithRescued);
    perSeed[seed] = { control: c, variant: v, off: o, detOk, linkedRescues: links };
  }
  const result = { leg, seeds, perSeed, detMatch, detMismatches };
  if (out) fs.writeFileSync(out, JSON.stringify(result, null, 2));
  for (const seed of seeds) {
    const { control: c, variant: v, off: o, detOk, linkedRescues: links } = perSeed[seed];
    console.log('seed ' + seed + ' det=' + detOk);
    console.log('  control still=' + JSON.stringify(c.still) + ' runs=' + JSON.stringify(c.runs) + ' days=' + c.daysAlive + ' ticksShort=' + c.ticksShort + ' maxWave=' + c.maxWaveUnlocked);
    console.log('  variant still=' + JSON.stringify(v.still) + ' runs=' + JSON.stringify(v.runs) + ' days=' + v.daysAlive + ' ticksShort=' + v.ticksShort + ' maxWave=' + v.maxWaveUnlocked);
    console.log('  variant departs=' + JSON.stringify(v.departs) + ' windowViolations=' + JSON.stringify(v.windowViolations));
    console.log('  variant strandMornings=' + JSON.stringify(v.strandMornings));
    console.log('  variant linkedRescues=' + JSON.stringify(links) + ' rescued=' + JSON.stringify(v.rescued));
    console.log('  deaths control=' + JSON.stringify(c.deaths) + ' variant=' + JSON.stringify(v.deaths));
  }
  console.log('det-gate match=' + detMatch + ' mismatches=' + JSON.stringify(detMismatches));
}

if (require.main === module) main();
module.exports = { strandOf, ticksShortCount, analyzeSeed, linkedRescues };

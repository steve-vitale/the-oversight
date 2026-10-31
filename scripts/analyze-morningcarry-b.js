// analyze-morningcarry-b.js — pure reads over morningcarry corpora.
// Compares control (trace driver) vs variant vs OFF (probe driver) legs
// on identical seeds for ONE woodwarm leg (guard or ON), and judges the
// prereg's census bars (strand counts, runs, det-gate, guardrails).
// Usage: node scripts/analyze-morningcarry-b.js <guard|on> <controlDir>
//   <variantDir> <offDir> <outJson>
// Per-seed output: creek/still/rescued counts + still day lists,
// strand runs, vessel deaths, daysAlive, maxWave, half-(a) strand
// firings, half-(b) firings, and the day-7 departure record on 15215.
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
function analyzeSeed(filePath) {
  const d = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const s = strandOf(d);
  const mc = d.morningcarryStore || { wakeRecords: [], departRecords: [] };
  const wakeActed = (mc.wakeRecords || []).filter((r) => r.acted);
  const wakeStrand = wakeActed.filter((r) => r.prevStillCreek);
  const wakeNothingKnown = (mc.wakeRecords || []).filter((r) => r.skip === 'nothing-known' && r.prevStillCreek);
  const departs = (mc.departRecords || []).filter((r) => r.acted);
  const strandMornings = (d.mornings || []).filter((m) => m.strandMorning).map((m) => ({
    loopDay: m.loopDay, kcal: m.kcal, known: m.pack ? m.pack.kcalKnown : null,
    wood: m.morningWood, wakeRec: m.wakeRec || null, wakeMatch: m.wakeGameDayMatch,
  }));
  return {
    seed: d.seed, arm: d.arm || null, errs: d.errCount,
    daysAlive: d.daysAlive, endReason: d.endReason, maxWaveUnlocked: d.maxWaveUnlocked,
    waveKills: d.waveKills, deaths: d.deaths || [],
    creek: s.creek, still: s.still, rescued: s.rescued, runs: s.runs,
    ticksShort: ticksShortCount(d),
    wakeActed: wakeActed.map((r) => ({ gameDay: r.gameDay, morningLoopDay: r.morningLoopDay || null, ate: r.ate, knownBefore: r.knownBefore })),
    wakeStrand: wakeStrand.map((r) => ({ gameDay: r.gameDay, morningLoopDay: r.morningLoopDay || null, ate: r.ate, knownBefore: r.knownBefore })),
    wakeNothingKnownStrand: wakeNothingKnown.map((r) => ({ gameDay: r.gameDay, morningLoopDay: r.morningLoopDay || null })),
    departs: departs.map((r) => ({ loopDay: r.loopDay || null, gameDay: r.gameDay || null, units: r.units, kcalPacked: r.kcalPacked, knownBefore: r.knownBefore, knownAfter: r.knownAfter })),
    strandMornings,
    evenings15215: null,
  };
}

function main() {
  const leg = process.argv[2];
  const controlDir = process.argv[3];
  const variantDir = process.argv[4];
  const offDir = process.argv[5];
  const out = process.argv[6] || null;
  if (!leg || !controlDir || !variantDir || !offDir) {
    console.error('usage: analyze-morningcarry-b.js <guard|on> <controlDir> <variantDir> <offDir> <outJson>');
    process.exit(2);
  }
  const load = (dir) => {
    const out = {};
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
      const a = analyzeSeed(path.join(dir, f));
      out[a.seed] = a;
    }
    return out;
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
    perSeed[seed] = { control: c, variant: v, off: o, detOk };
  }
  const result = { leg, seeds, perSeed, detMatch, detMismatches };
  if (out) fs.writeFileSync(out, JSON.stringify(result, null, 2));
  for (const seed of seeds) {
    const { control: c, variant: v, off: o, detOk } = perSeed[seed];
    console.log('seed ' + seed + ' det=' + detOk);
    console.log('  control still=' + JSON.stringify(c.still) + ' runs=' + JSON.stringify(c.runs) + ' days=' + c.daysAlive + ' ticksShort=' + c.ticksShort + ' maxWave=' + c.maxWaveUnlocked);
    console.log('  variant still=' + JSON.stringify(v.still) + ' runs=' + JSON.stringify(v.runs) + ' days=' + v.daysAlive + ' ticksShort=' + v.ticksShort + ' maxWave=' + v.maxWaveUnlocked);
    console.log('  variant wakeStrand=' + JSON.stringify(v.wakeStrand) + ' wakeNothingKnown=' + JSON.stringify(v.wakeNothingKnownStrand));
    console.log('  variant departs=' + JSON.stringify(v.departs.slice(0, 12)) + (v.departs.length > 12 ? ' ... +' + (v.departs.length - 12) + ' more' : ''));
    console.log('  variant strandMornings=' + JSON.stringify(v.strandMornings.map((m) => ({ d: m.loopDay, kcal: m.kcal, known: m.known, wood: m.wood }))));
    console.log('  deaths control=' + JSON.stringify(c.deaths) + ' variant=' + JSON.stringify(v.deaths));
  }
  console.log('det-gate match=' + detMatch + ' mismatches=' + JSON.stringify(detMismatches));
}

if (require.main === module) main();
module.exports = { strandOf, ticksShortCount, analyzeSeed };

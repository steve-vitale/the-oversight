#!/usr/bin/env node
// analyze-strandbank-b.js — pure reads over strandbank sweep corpora.
// Census ONLY (sim-strandbank-b, DIAG): for each seed, per leg (guard
// and ON, never pooled), the strand census from the fedevening prereg
// definitions, imported verbatim from scripts/analyze-fedevening-b.js:
//   still = woodcarry bucket creek + rescued false
//   rescued = woodcarry bucket creek + rescued true
//   creek = still + rescued
//   strand = maximal run of still evenings on consecutive loop-days
//   vessel-at-haven check: an evening with inside true / tile haven is
//   not a creek evening under any definition.
// Secondary count ONLY (never a strand definition, never judged):
//   awayWoodShort = evenings NOT at haven (inside !== true and tile
//   !== 'haven') with eveningWood a number < 4 — the "slept away, any
//   cause, wood < 4" figure the prereg allows to be REPORTED. It cannot
//   turn a 0-strand census into a published set.
// Usage: node scripts/analyze-strandbank-b.js <guardDir> <onDir> <outJson>
'use strict';
const fs = require('fs');
const path = require('path');
const { strandOf } = require('./analyze-fedevening-b');

// strandChecked: the prereg's census definitions WITH the vessel-at-haven
// check applied. strandOf (imported above) counts bucket==='creek' alone;
// the prereg's definitions add "an evening with inside true / tile haven
// is not a creek evening under any definition". On this base that line
// bites exactly once per leg: seed 16506 evening 25 carries bucket
// creek + rescued true while the vessel sits at haven (travel-refused
// classification artifact) — raw strandOf counts it rescued, the
// prereg definition does not count it as a creek evening at all.
// The haven evening still BREAKS a run (it is not filtered out: runs
// are maximal runs on consecutive loop-days, so a haven night between
// two still nights must split them, never merge them). Raw bucket
// counts are reported alongside for transparency; the verdict reads
// the haven-checked counts, and on this sweep both agree on still=0.
function strandChecked(d) {
  const creek = [], still = [], rescued = [];
  const runs = [];
  let run = [];
  const flush = () => { if (run.length) runs.push(run); run = []; };
  for (const e of (d.evenings || [])) {
    if (e.inside === true || e.tile === 'haven') { flush(); continue; }
    const wc = e.woodcarry || {};
    if (wc.bucket !== 'creek') { flush(); continue; }
    creek.push(e.loopDay);
    if (wc.rescued) { rescued.push(e.loopDay); flush(); }
    else { still.push(e.loopDay); run.push(e.loopDay); }
  }
  flush();
  return { creek, still, rescued, runs };
}

function awayWoodShort(d) {
  const out = [];
  for (const e of (d.evenings || [])) {
    const atHaven = e.inside === true || e.tile === 'haven';
    if (atHaven) continue;
    if (typeof e.eveningWood === 'number' && e.eveningWood < 4) out.push(e.loopDay);
  }
  return out;
}
function awayEvenings(d) {
  const out = [];
  for (const e of (d.evenings || [])) {
    if (e.inside === true || e.tile === 'haven') continue;
    out.push(e.loopDay);
  }
  return out;
}
function analyzeSeed(filePath) {
  const d = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const s = strandChecked(d);
  const raw = strandOf(d);
  return {
    seed: d.seed, errs: d.errCount, daysAlive: d.daysAlive,
    endReason: d.endReason, maxWaveUnlocked: d.maxWaveUnlocked,
    creek: s.creek, still: s.still, rescued: s.rescued, runs: s.runs,
    rawCreek: raw.creek, rawStill: raw.still, rawRescued: raw.rescued,
    away: awayEvenings(d), awayWoodShort: awayWoodShort(d),
    evenings: (d.evenings || []).length, mornings: (d.mornings || []).length,
  };
}
function loadDir(dir) {
  const o = {};
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
    const a = analyzeSeed(path.join(dir, f));
    o[a.seed] = a;
  }
  return o;
}
function main() {
  const guardDir = process.argv[2];
  const onDir = process.argv[3];
  const out = process.argv[4] || null;
  if (!guardDir || !onDir) {
    console.error('usage: analyze-strandbank-b.js <guardDir> <onDir> <outJson>');
    process.exit(2);
  }
  const guard = loadDir(guardDir);
  const on = loadDir(onDir);
  const seeds = Object.keys(guard).map(Number).sort((a, b) => a - b);
  const perSeed = {};
  let totalStill = 0, totalCreek = 0, seedsWithStrand = 0;
  for (const seed of seeds) {
    const g = guard[seed], o = on[seed];
    if (!o) { console.error('MISSING ON leg for seed ' + seed); process.exit(2); }
    perSeed[seed] = { guard: g, on: o };
    totalStill += g.still.length + o.still.length;
    totalCreek += g.creek.length + o.creek.length;
    if (g.runs.length || o.runs.length) seedsWithStrand++;
    console.log('seed ' + seed +
      ' guard still=' + JSON.stringify(g.still) + ' runs=' + JSON.stringify(g.runs) +
      ' rescued=' + JSON.stringify(g.rescued) + ' rawRescued=' + JSON.stringify(g.rawRescued) +
      ' away=' + JSON.stringify(g.away) + ' awayWoodShort=' + JSON.stringify(g.awayWoodShort) +
      ' days=' + g.daysAlive + ' errs=' + g.errs +
      ' | on still=' + JSON.stringify(o.still) + ' runs=' + JSON.stringify(o.runs) +
      ' rescued=' + JSON.stringify(o.rescued) + ' rawRescued=' + JSON.stringify(o.rawRescued) +
      ' away=' + JSON.stringify(o.away) + ' awayWoodShort=' + JSON.stringify(o.awayWoodShort) +
      ' days=' + o.daysAlive + ' errs=' + o.errs);
  }
  const result = {
    seeds, perSeed, totalStill, totalCreek, seedsWithStrand,
    legs: seeds.length * 2,
    verdict: totalStill > 0 ? 'STRAND SET RE-DERIVED' : 'SUBSTRATE-MISSING STANDS',
  };
  if (out) fs.writeFileSync(out, JSON.stringify(result, null, 2));
  console.log('total still=' + totalStill + ' creek=' + totalCreek +
    ' seedsWithStrand=' + seedsWithStrand + ' legs=' + result.legs +
    ' verdict=' + result.verdict);
}
if (require.main === module) main();
module.exports = { strandChecked, awayWoodShort, awayEvenings, analyzeSeed, loadDir };

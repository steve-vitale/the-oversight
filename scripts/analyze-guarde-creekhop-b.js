#!/usr/bin/env node
// analyze-guarde-creekhop-b.js — FIDELITY ANALYZER (sim-guarde-creekhop-b).
// Prereg: evidence/2026-11-02/sim-guarde-creekhop-b-prereg.md
// Reads creekhop-b-recorder JSONL (file path arg, or stdin) and prints:
//   - per-seed day-5 start + forced moved-pattern;
//   - control-gate comparison vs a prior homewardac shadow jsonl
//     (--prior <path>): day-5 start + moved-pattern per seed;
//   - fidelity table: E-pass hops, E-pass moved, E-pass refused
//     (with blockType census from entry blockers + engineBlock),
//     E-fail moved (pocket entries), E-fail refused;
//   - verdict inputs per the prereg header (final verdict is
//     written by the worker in the evidence file, not here).
// Usage: node scripts/analyze-guarde-creekhop-b.js <recorder.jsonl>
//        [--prior <homewardac-shadow.jsonl>] [--seeds 69501,...,69508]
// Exit 2 on seed-set mismatch (default expected set = PILOT_SEEDS).
'use strict';
const fs = require('fs');
const PILOT_SEEDS = [69501, 69502, 69503, 69504, 69505, 69506, 69507, 69508];
function parseArgs(argv) {
  const out = { file: null, prior: null, seeds: PILOT_SEEDS };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--prior') out.prior = argv[++i];
    else if (argv[i] === '--seeds') out.seeds = argv[++i].split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
    else if (!out.file) out.file = argv[i];
  }
  return out;
}
function readJsonl(path) {
  const text = path ? fs.readFileSync(path, 'utf8') : fs.readFileSync(0, 'utf8');
  return text.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
}
function main() {
  const args = parseArgs(process.argv.slice(2));
  const legs = readJsonl(args.file);
  const bySeed = new Map(legs.map((l) => [l.seed, l]));
  const got = legs.map((l) => l.seed).sort((a, b) => a - b);
  const want = [...args.seeds].sort((a, b) => a - b);
  if (JSON.stringify(got) !== JSON.stringify(want)) {
    console.error('SEED-SET MISMATCH got=' + got.join(',') + ' want=' + want.join(','));
    process.exit(2);
  }
  let priorBySeed = null;
  if (args.prior) {
    priorBySeed = new Map();
    for (const r of readJsonl(args.prior)) {
      const d5 = (r.days || [])[4] || {};
      priorBySeed.set(r.seed, { start: d5.start && d5.start.pos, moved: ((d5.construct || {}).steps || []).map((s) => !!s.moved) });
    }
  }
  let totalHops = 0, ePass = 0, ePassMoved = 0, eFailMoved = 0, eFailRefused = 0;
  const refused = [];
  let legsAtHaven = 0;
  for (const seed of want) {
    const leg = bySeed.get(seed);
    const attempted = (leg.hops || []).filter((h) => h.attempted);
    const movedPat = attempted.map((h) => !!h.moved);
    const atHaven = leg.day5Start && leg.day5Start.x === 4 && leg.day5Start.y === 4;
    if (atHaven) legsAtHaven++;
    let ctrl = 'n/a';
    if (priorBySeed && priorBySeed.has(seed)) {
      const p = priorBySeed.get(seed);
      const sameStart = p.start && leg.day5Start && p.start.x === leg.day5Start.x && p.start.y === leg.day5Start.y;
      const sameMoved = JSON.stringify(p.moved) === JSON.stringify(movedPat);
      ctrl = (sameStart && sameMoved) ? 'PASS' : 'FAIL start=' + JSON.stringify(p.start) + ' moved=' + JSON.stringify(p.moved);
    }
    console.log('SEED ' + seed + ' day5Start=' + JSON.stringify(leg.day5Start) + ' moved=' + JSON.stringify(movedPat) + ' control=' + ctrl + (leg.error ? ' ERROR=' + leg.error : ''));
    for (const h of attempted) {
      totalHops++;
      const eOk = h.E && h.E.ok;
      if (eOk) {
        ePass++;
        if (h.moved) ePassMoved++;
        else refused.push({ seed, from: h.from, to: h.to,
          entryTypes: ((h.entry && h.entry.blockers) || []).map((b) => b.blockType),
          engineType: h.engineBlock && h.engineBlock.blockType,
          tile: h.tile, swimmer: h.swimmer });
      } else {
        if (h.moved) eFailMoved++; else eFailRefused++;
      }
    }
  }
  const ePassRefused = ePass - ePassMoved;
  const fidelity = ePass ? (ePassMoved / ePass) : null;
  console.log('FIDELITY totalForcedHops=' + totalHops + ' ePass=' + ePass + ' ePassMoved=' + ePassMoved +
    ' ePassRefused=' + ePassRefused + ' fidelity=' + (fidelity === null ? 'null' : fidelity.toFixed(4)) +
    ' eFailMoved=' + eFailMoved + ' eFailRefused=' + eFailRefused + ' legsAtHaven=' + legsAtHaven + '/8');
  const census = {};
  for (const r of refused) {
    const k = 'entry[' + r.entryTypes.join(',') + '] engine[' + (r.engineType || 'null') + ']';
    census[k] = (census[k] || 0) + 1;
    console.log('REFUSED seed=' + r.seed + ' ' + r.from.x + ',' + r.from.y + '->' + r.to.x + ',' + r.to.y +
      ' entryTypes=' + JSON.stringify(r.entryTypes) + ' engineType=' + r.engineType +
      ' tile=' + JSON.stringify(r.tile) + ' swimmer=' + r.swimmer);
  }
  console.log('CENSUS ' + JSON.stringify(census));
  const unclassified = refused.filter((r) => !((r.entryTypes && r.entryTypes.length) || r.engineType)).length;
  let verdict = 'UNDECIDED';
  if (legsAtHaven < 4 || ePass === 0) verdict = 'SUBSTRATE-FAIL';
  else if (unclassified > 0) verdict = 'DIAG-ERROR';
  else if (fidelity !== null && fidelity >= 0.95) verdict = 'FIDELITY-GO';
  else verdict = 'DIAG';
  console.log('VERDICT-INPUT ' + verdict + ' unclassifiedRefusals=' + unclassified);
}
if (require.main === module) main();
module.exports = { PILOT_SEEDS };

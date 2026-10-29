#!/usr/bin/env node
// analyze-creekremedy-b.js — creek-remedy feasibility DIAG analyzer.
// Usage: node scripts/analyze-creekremedy-b.js --on <dir> [--off <dir>] [--out <file>]
// Reads the ON corpus (recorder ON), pools creek evenings, computes
// the prereg primary metric (bridge-feasible share + Wilson 95%
// interval), the binding constraint, and secondary distributions.
// The OFF dir is used only for the per-seed evening-count
// cross-check (OFF vs ON legs must run the same loop-days).
// Writes JSON to --out (or stdout when omitted). Never judges:
// the verdict lives in the evidence file, against the prereg.
'use strict';
const fs = require('fs');
const path = require('path');

function args() {
  const a = {};
  for (let i = 2; i < process.argv.length; i += 2) a[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
  return a;
}
function wilson(k, n) {
  if (!n) return { lo: null, hi: null };
  const z = 1.96, p = k / n, d = 1 + (z * z) / n;
  const c = p + (z * z) / (2 * n), m = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);
  return { lo: Math.max(0, (c - m) / d), hi: Math.min(1, (c + m) / d) };
}
function dist(vals) {
  const xs = vals.filter((v) => v !== null && v !== undefined).sort((a, b) => a - b);
  if (!xs.length) return { n: 0, min: null, median: null, max: null };
  return { n: xs.length, min: xs[0], median: xs[Math.floor(xs.length / 2)], max: xs[xs.length - 1] };
}

const { on, off, out } = args();
if (!on) { console.error('FATAL: --on <dir> required'); process.exit(2); }
const onFiles = fs.readdirSync(on).filter((f) => f.endsWith('.json')).sort();
const perSeed = {};
const creek = [];
let totalEvenings = 0, travelRefused = 0, otherRefused = 0, unclassified = 0;
let recorderErrs = 0, recorderErrors = [];
for (const f of onFiles) {
  const inst = JSON.parse(fs.readFileSync(path.join(on, f), 'utf8'));
  const rows = inst.evenings || [];
  totalEvenings += rows.length;
  const refused = rows.filter((r) => r.eveningOutcome === 'travel-refused');
  travelRefused += refused.length;
  const recs = (rows.map((r) => r.creekRemedy).filter(Boolean));
  const seedCreek = recs.filter((r) => r.isCreek && !r.probeError);
  const seedOther = recs.filter((r) => !r.isCreek && r.hopReturnKind && !/^block:creek$/.test(r.hopReturnKind));
  const seedUncl = recs.filter((r) => !r.isCreek && /^block:creek$/.test(r.hopReturnKind || ''));
  otherRefused += seedOther.length; unclassified += seedUncl.length;
  creek.push(...seedCreek.map((r) => Object.assign({ seed: inst.seed }, r)));
  const st = inst.creekRemedyStore || {};
  recorderErrs += (st.errs || 0);
  if (st.errors) recorderErrors.push(...st.errors);
  perSeed[inst.seed] = {
    evenings: rows.length, daysAlive: inst.daysAlive, endReason: inst.endReason,
    travelRefused: refused.length, creek: seedCreek.length, otherRefused: seedOther.length,
    unclassified: seedUncl.length, feasible: seedCreek.filter((r) => r.feasible).length,
    floorFeasible: seedCreek.filter((r) => r.floorFeasible).length,
    recorderErrs: st.errs || 0,
    blockedTiles: [...new Set(seedCreek.map((r) => r.blockedTile ? (r.blockedTile.x + ',' + r.blockedTile.y) : '?'))],
    routeLengths: seedCreek.map((r) => r.routeAroundLength),
  };
}
const feasible = creek.filter((r) => r.feasible).length;
const floorFeasible = creek.filter((r) => r.floorFeasible).length;
const bindingCounts = {};
for (const r of creek) { if (!r.feasible) bindingCounts[r.binding || 'other'] = (bindingCounts[r.binding || 'other'] || 0) + 1; }
let binding = null, bindingN = 0;
for (const [k, v] of Object.entries(bindingCounts)) if (v > bindingN) { binding = k; bindingN = v; }
const woodDeficits = creek.filter((r) => r.binding === 'wood-short').map((r) => 4 - (r.woodPlayer || 0));
const kcalShortfalls = creek.filter((r) => r.binding === 'kcal-short').map((r) => 60 - (r.kcal || 0));
const offCheck = {};
if (off) {
  for (const f of fs.readdirSync(off).filter((x) => x.endsWith('.json')).sort()) {
    const inst = JSON.parse(fs.readFileSync(path.join(off, f), 'utf8'));
    offCheck[inst.seed] = { evenings: (inst.evenings || []).length, travelRefused: (inst.evenings || []).filter((r) => r.eveningOutcome === 'travel-refused').length };
  }
}
const result = {
  onDir: on, offDir: off || null,
  seeds: Object.keys(perSeed).map(Number).sort((a, b) => a - b),
  totalEvenings, travelRefused, creekN: creek.length, otherRefused, unclassified,
  feasible, floorFeasible,
  share: creek.length ? feasible / creek.length : null,
  wilson95: wilson(feasible, creek.length),
  floorShare: creek.length ? floorFeasible / creek.length : null,
  binding, bindingCounts, woodDeficits, kcalShortfalls,
  woodDist: dist(creek.map((r) => r.woodPlayer)),
  pileDist: dist(creek.map((r) => r.woodPile)),
  kcalDist: dist(creek.map((r) => r.kcal)),
  dayTicksDist: dist(creek.map((r) => r.dayTicks)),
  rollsDay: creek.filter((r) => r.rollsDay).length,
  swimmerTrue: creek.filter((r) => r.swimmer === true).length,
  routeLengths: creek.map((r) => r.routeAroundLength),
  routeNull: creek.filter((r) => r.routeAroundLength === null).length,
  recorderErrs, recorderErrors,
  perSeed, offCheck,
  priorCrossCheck: { '11636': 10, '11707': 6, '12027': 1 },
};
const text = JSON.stringify(result, null, 2);
if (out) fs.writeFileSync(out, text + '\n');
else console.log(text);

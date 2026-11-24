#!/usr/bin/env node
// analyze-launchready-b.js — launch-fitness census from the ragecarry
// confirm corpus (no new sims).
//
// Joins v4departs rows to dawnbidCensus rows on (vid, day) and reports:
// holder HP at departure (joined census health), armed share at departure,
// and flee HP fractions. Arm leg is primary; control leg is reference.
//
// Usage: node scripts/analyze-launchready-b.js [armDir] [ctlDir]
// Outputs JSON to stdout. Deterministic.
'use strict';
const fs = require('fs');
const path = require('path');

const ARM = process.argv[2] ||
  path.join(__dirname, '..', 'evidence', '2026-11-24', 'perseed-ragecarry-b-confirm-arm');
const CTL = process.argv[3] ||
  path.join(__dirname, '..', 'evidence', '2026-11-24', 'perseed-ragecarry-b-confirm-ctl');

function loadLeg(dir) {
  return fs.readdirSync(dir)
    .filter((f) => /\.json$/.test(f))
    .sort()
    .map((f) => path.join(dir, f));
}

function quantile(sorted, q) {
  if (!sorted.length) return null;
  const i = (sorted.length - 1) * q;
  const lo = Math.floor(i), hi = Math.ceil(i);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
}

function dist(values) {
  const s = values.slice().sort((a, b) => a - b);
  if (!s.length) return { n: 0, min: null, q1: null, median: null, q3: null, max: null };
  return {
    n: s.length, min: s[0], q1: quantile(s, 0.25),
    median: quantile(s, 0.5), q3: quantile(s, 0.75), max: s[s.length - 1],
  };
}

function analyzeLeg(dir) {
  const out = {
    dir, files: 0, seeds: [],
    departsTotal: 0, departsByResult: {},
    joined: 0, joinRate: null,
    healthAtDepart: [], healthByResult: {},
    armedShare: [], armedShareByResult: {},
    fleeHpFrac: [],
    parseErrors: [],
  };
  loadLeg(dir).forEach((file) => {
    let d;
    try { d = JSON.parse(fs.readFileSync(file, 'utf8')); }
    catch (e) { out.parseErrors.push({ file: path.basename(file), error: String(e) }); return; }
    out.files += 1;
    out.seeds.push(d.seed);
    const census = {};
    (d.dawnbidCensus || []).forEach((c) => { census[c.vid + '|' + c.day] = c; });
    (d.v4departs || []).forEach((dep) => {
      out.departsTotal += 1;
      out.departsByResult[dep.result] = (out.departsByResult[dep.result] || 0) + 1;
      const c = census[dep.vid + '|' + dep.day];
      if (c && typeof c.holderHealth === 'number') {
        out.joined += 1;
        out.healthAtDepart.push(c.holderHealth);
        const r = dep.result;
        out.healthByResult[r] = out.healthByResult[r] || [];
        out.healthByResult[r].push(c.holderHealth);
      }
      if (dep.partySize > 0 && typeof dep.partyArmed === 'number') {
        const share = dep.partyArmed / dep.partySize;
        out.armedShare.push(share);
        const r = dep.result;
        out.armedShareByResult[r] = out.armedShareByResult[r] || [];
        out.armedShareByResult[r].push(share);
      }
    });
    (d.v4encounters || []).forEach((enc) => {
      if (typeof enc.fleeHpFrac === 'number') out.fleeHpFrac.push(enc.fleeHpFrac);
    });
  });
  out.joinRate = out.departsTotal ? out.joined / out.departsTotal : null;
  const h = dist(out.healthAtDepart);
  const healthDist = h;
  healthDist.shareLt25 = out.healthAtDepart.length
    ? out.healthAtDepart.filter((x) => x < 25).length / out.healthAtDepart.length : null;
  healthDist.shareLt50 = out.healthAtDepart.length
    ? out.healthAtDepart.filter((x) => x < 50).length / out.healthAtDepart.length : null;
  const res = {
    dir: out.dir, files: out.files, seeds: out.seeds.sort((a, b) => a - b),
    departsTotal: out.departsTotal, departsByResult: out.departsByResult,
    joined: out.joined, joinRate: out.joinRate,
    healthAtDepart: healthDist,
    healthByResult: {},
    armedShare: dist(out.armedShare),
    armedShareByResult: {},
    fleeHpFrac: dist(out.fleeHpFrac),
    parseErrors: out.parseErrors,
  };
  Object.keys(out.healthByResult).sort().forEach((r) => {
    res.healthByResult[r] = dist(out.healthByResult[r]);
  });
  Object.keys(out.armedShareByResult).sort().forEach((r) => {
    res.armedShareByResult[r] = dist(out.armedShareByResult[r]);
  });
  return res;
}

function main() {
  const arm = analyzeLeg(ARM);
  const ctl = analyzeLeg(CTL);
  process.stdout.write(JSON.stringify({ arm, ctl }, null, 2) + '\n');
}

if (require.main === module) main();
module.exports = { analyzeLeg, dist };

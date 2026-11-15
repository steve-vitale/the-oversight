// compare-succpolity-repro.js — REPRO GATE for sim-succpolity-b
// (prereg, binding). Compares the 6 re-run baseline cells
// (seeds 100201, 100203, 100208 x both policies, env defaults,
// driver scripts/succpolity-driver-20261114.js, RUN=repro) against
// the committed answercourt-confirm corpus files, field-for-field on:
// series (scaleRank per day, link roll, pantry, deaths), verbEvents,
// capSummary, deaths, waveKills, standing, endReason, days.
// Normalized away (driver literals / additive instrument fields, not
// behavior): anchorCommit, run, arm, env, dissolutionLines, and the
// additive prSg field in each link-roll entry. Any other difference
// FAILS the cell — and the gate: STOP, report, do not re-baseline.
// Usage: node scripts/compare-succpolity-repro.js
//   reads evidence/2026-11-14/perseed-succpolity-b-repro/ +
//   evidence/2026-11-14/perseed-answercourt-confirm-b/
//   exits 0 iff all 6 cells match, else 1.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const REPRO_DIR = path.join(REPO, 'evidence', '2026-11-14', 'perseed-succpolity-b-repro');
const CORPUS_DIR = path.join(REPO, 'evidence', '2026-11-14', 'perseed-answercourt-confirm-b');
const SEEDS = [100201, 100203, 100208];
const POLICIES = ['competent-scaleclimb-b', 'competent-answercourt-b'];

function canon(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
  const keys = Object.keys(v).sort();
  return '{' + keys.map(function (k) { return JSON.stringify(k) + ':' + canon(v[k]); }).join(',') + '}';
}

// Strip the normalized-away fields, recursively for the link roll.
function normalize(rec) {
  const c = JSON.parse(JSON.stringify(rec));
  delete c.anchorCommit;
  delete c.run;
  delete c.arm;
  delete c.env;
  delete c.dissolutionLines;
  for (const sn of (c.series || [])) {
    for (const l of (sn.linksRoll || [])) delete l.prSg;
  }
  return c;
}

function firstDiff(a, b, pathIn) {
  if (canon(a) === canon(b)) return null;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return (pathIn || '(root)') + ': ' + JSON.stringify(a) + ' !== ' + JSON.stringify(b);
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
      return (pathIn || '(root)') + ': array length ' + (a && a.length) + ' vs ' + (b && b.length);
    }
    for (let i = 0; i < a.length; i++) {
      const d = firstDiff(a[i], b[i], (pathIn || '') + '[' + i + ']');
      if (d) return d;
    }
    return null;
  }
  const keys = new Set(Object.keys(a).concat(Object.keys(b)));
  for (const k of keys) {
    if (!(k in a)) return (pathIn ? pathIn + '.' : '') + k + ': missing in repro';
    if (!(k in b)) return (pathIn ? pathIn + '.' : '') + k + ': extra in repro';
    const d = firstDiff(a[k], b[k], (pathIn ? pathIn + '.' : '') + k);
    if (d) return d;
  }
  return null;
}

function main() {
  let pass = 0, fail = 0;
  for (const seed of SEEDS) {
    for (const pol of POLICIES) {
      const reproFile = path.join(REPRO_DIR, 'succpolity-b-s' + seed + '-' + pol + '-repro.json');
      const corpusFile = path.join(CORPUS_DIR, 'answercourt-b-s' + seed + '-' + pol + '-answercourt-confirm-b.json');
      const label = 'seed ' + seed + ' ' + pol;
      if (!fs.existsSync(reproFile)) { console.log('FAIL ' + label + ' — repro file missing: ' + reproFile); fail++; continue; }
      if (!fs.existsSync(corpusFile)) { console.log('FAIL ' + label + ' — corpus file missing: ' + corpusFile); fail++; continue; }
      const repro = normalize(JSON.parse(fs.readFileSync(reproFile, 'utf8')));
      const corpus = normalize(JSON.parse(fs.readFileSync(corpusFile, 'utf8')));
      const d = firstDiff(corpus, repro, '');
      if (d) {
        console.log('FAIL ' + label + ' — first difference: ' + d);
        fail++;
      } else {
        console.log('PASS ' + label + ' — field-for-field match (modulo anchorCommit/run/arm/env/dissolutionLines/prSg)');
        pass++;
      }
    }
  }
  console.log('repro gate: ' + pass + ' passed, ' + fail + ' failed');
  if (fail) process.exit(1);
}

if (require.main === module) main();
module.exports = { normalize: normalize, firstDiff: firstDiff, canon: canon };

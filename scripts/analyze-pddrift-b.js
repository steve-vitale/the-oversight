#!/usr/bin/env node
// analyze-pddrift-b.js — PLENTYDEPRI rot-drift BISECTION analyzer
// (sim-pddrift-b, 2026-10-24, oversight-flesh-out-loop-b, axis food-economy).
//
// Reads the pddrift-b corpus (per-seed JSONs tagged with anchorCommit),
// aggregates per anchor x policy x PD side, and prints the paired rows:
//   rot/100d = sum(rotFreshKcal + rotPreservedKcal) / sum(daysAlive) * 100
//   ratio = rot100d(pd1) / rot100d(pd0)  (SAME operationalization as the
//   depinteraction / bufferdepri / pdtradeoff substrate runs).
//
// NORMALIZATION (backlog #870 — the pdtradeoff analyzer normalized
// medianSurvival but NOT wall-clock diag.ms, so its byte check could never
// fully pass): normalizeForCompare() strips BOTH `ms` (wall-clock, in the
// diag block and any top-level copy) and `medianSurvival` (an analyzer
// patch, not a measurement) before any byte-reproduce comparison. The
// corpus per-seed files carry diag only inside summaries; per-seed files
// carry no ms — normalize() is still applied defensively to every field
// it knows, so a future schema addition of ms cannot silently re-break
// the check. `--compare <a.json> <b.json>` exits 0 iff the normalized
// files are byte-identical, else 2 with the first differing field.
//
// FAMILY BANDS (pre-registered in the evidence header): OLD <= 0.75,
// NEW >= 0.85, 0.75-0.85 = AMBIGUOUS. A candidate pair "steps" iff the
// parent ratio is OLD and the commit ratio is NEW. A pair "exonerates"
// iff both ratios sit in the SAME family, or move by < 0.10 with no
// family change. Anything else is "no step shown" (not an exoneration).
//
// Usage: node scripts/analyze-pddrift-b.js [CORPUS_DIR]
//        node scripts/analyze-pddrift-b.js --compare <a.json> <b.json>
// Env: REPORT=<path> writes the same report to a file.
'use strict';
const fs = require('fs');
const path = require('path');

function normalize(obj) {
  // Deep-strip ms + medianSurvival (wall-clock / analyzer-patch fields).
  if (Array.isArray(obj)) return obj.map(normalize);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k === 'ms' || k === 'medianSurvival') continue;
      out[k] = normalize(v);
    }
    return out;
  }
  return obj;
}
function firstDiff(a, b, trail) {
  trail = trail || '';
  if (typeof a !== typeof b) return trail + ` type ${typeof a} vs ${typeof b}`;
  if (a && typeof a === 'object') {
    const ka = Object.keys(a), kb = Object.keys(b);
    for (const k of ka) if (!(k in b)) return trail + '/' + k + ' missing in b';
    for (const k of kb) if (!(k in a)) return trail + '/' + k + ' missing in a';
    for (const k of ka) { const d = firstDiff(a[k], b[k], trail + '/' + k); if (d) return d; }
    return null;
  }
  return a === b ? null : trail + ` ${JSON.stringify(a)} vs ${JSON.stringify(b)}`;
}

if (process.argv[2] === '--compare') {
  const [aPath, bPath] = process.argv.slice(3);
  if (!aPath || !bPath) { console.error('FATAL: --compare needs two files'); process.exit(2); }
  let a, b;
  try { a = normalize(JSON.parse(fs.readFileSync(aPath, 'utf8'))); }
  catch (e) { console.error('FATAL: cannot read', aPath, e.message); process.exit(2); }
  try { b = normalize(JSON.parse(fs.readFileSync(bPath, 'utf8'))); }
  catch (e) { console.error('FATAL: cannot read', bPath, e.message); process.exit(2); }
  const sa = JSON.stringify(a), sb = JSON.stringify(b);
  if (sa === sb) { console.log('COMPARE IDENTICAL (ms + medianSurvival normalized out)'); process.exit(0); }
  console.log('COMPARE DIFFER: first diff:', firstDiff(a, b, ''));
  process.exit(2);
}

const CORPUS = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-24', 'pddrift-b-corpus');
const REPORT = process.env.REPORT || '';
let files = [];
try { files = fs.readdirSync(CORPUS).filter(f => f.startsWith('pddrift-b-') && f.endsWith('.json')); }
catch (e) { console.error('FATAL: cannot read corpus dir', CORPUS, e.message); process.exit(2); }
if (!files.length) { console.error('FATAL: no pddrift-b per-seed files in', CORPUS); process.exit(2); }

const groups = new Map(); // anchor|policy|pd -> rows
for (const f of files.sort()) {
  let row;
  try { row = JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8')); }
  catch (e) { console.error('FATAL: cannot parse', f, e.message); process.exit(2); }
  if (!row.anchorCommit || typeof row.daysAlive !== 'number') {
    console.error('FATAL: schema violation in', f, '(anchorCommit + daysAlive required)'); process.exit(2);
  }
  const key = row.anchorCommit + '|' + row.policy + '|' + row.plentydepri;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(row);
}

function family(r) { return r <= 0.75 ? 'OLD' : (r >= 0.85 ? 'NEW' : 'AMBIG'); }
function med(xs) { const s = xs.slice().sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; }

const anchors = new Map(); // anchor|policy -> {pd0, pd1}
for (const [key, rows] of groups) {
  const [anchor, policy, pd] = key.split('|');
  const ak = anchor + '|' + policy;
  if (!anchors.has(ak)) anchors.set(ak, {});
  const rot = rows.reduce((a, r) => a + r.rotFreshKcal + r.rotPreservedKcal, 0);
  const days = rows.reduce((a, r) => a + r.daysAlive, 0);
  anchors.get(ak)['pd' + pd] = {
    n: rows.length, rot100d: days ? rot / days * 100 : 0,
    medSurv: med(rows.map(r => r.daysAlive)),
    national: rows.filter(r => r.national).length,
    table: rows.filter(r => r.table).length,
    maxWave: Math.max.apply(null, rows.map(r => (r.waveReach || []).length ? Math.max.apply(null, r.waveReach) : 1)),
    deaths: rows.reduce((a, r) => a + Object.values(r.deathCauses || {}).reduce((x, y) => x + y, 0), 0),
  };
}

const lines = [];
lines.push('pddrift-b analyzer: per-anchor PD=1/PD=0 rot/100d (leadfeast/dg1 reduced contrast unless policy says otherwise)');
lines.push('anchor(policy) | pd0 rot/100d | pd1 rot/100d | ratio | family | n | medSurv c->a | national c->a | table c->a | maxWave');
const ratios = new Map();
for (const [ak, sides] of [...anchors.entries()].sort()) {
  if (!sides.pd0 || !sides.pd1) { lines.push(ak + ' | INCOMPLETE (missing a PD side)'); continue; }
  const ratio = sides.pd0.rot100d ? sides.pd1.rot100d / sides.pd0.rot100d : 0;
  ratios.set(ak, ratio);
  lines.push(`${ak} | ${Math.round(sides.pd0.rot100d)} | ${Math.round(sides.pd1.rot100d)} | ${ratio.toFixed(3)}x | ${family(ratio)} | ${sides.pd0.n}/${sides.pd1.n} | ${sides.pd0.medSurv}->${sides.pd1.medSurv} | ${sides.pd0.national}->${sides.pd1.national} | ${sides.pd0.table}->${sides.pd1.table} | ${sides.pd0.maxWave}/${sides.pd1.maxWave}`);
}
lines.push('');
lines.push('candidate pairs (parent -> commit, same policy leadfeast):');
const pairs = [
  ['c76a5248', 'd581d6cf2', 'r42 conversation fizzle/grief/winddown'],
  ['ac8cbe37', '7d6f735c9', 'r30 convoThreadAbout'],
  ['f8097b37', 'db7c5f211', 'bloodrestraint (default-off)'],
  ['efc180aa', '85e42a22a', 'r39 _sdNextAct dedup'],
];
for (const [parent, commit, label] of pairs) {
  const rp = [...ratios.entries()].find(([k]) => k.split('|')[0].startsWith(parent) && k.endsWith('|leadfeast'));
  const rc = [...ratios.entries()].find(([k]) => k.split('|')[0].startsWith(commit) && k.endsWith('|leadfeast'));
  if (!rp || !rc) { lines.push(`  ${label}: MISSING anchor data (${parent} or ${commit})`); continue; }
  const [pk, pv] = rp, [ck, cv] = rc;
  const step = family(pv) === 'OLD' && family(cv) === 'NEW';
  const ex = family(pv) === family(cv) || Math.abs(cv - pv) < 0.10;
  lines.push(`  ${label}: ${pk.split('|')[0]} ${pv.toFixed(3)}x (${family(pv)}) -> ${ck.split('|')[0]} ${cv.toFixed(3)}x (${family(cv)}) : ${step ? 'STEP' : (ex ? 'EXONERATED' : 'NO STEP SHOWN')}`);
}
const report = lines.join('\n') + '\n';
console.log(report);
if (REPORT) fs.writeFileSync(REPORT, report);
process.exit(0);

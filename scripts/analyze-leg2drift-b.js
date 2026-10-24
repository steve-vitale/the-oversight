#!/usr/bin/env node
// analyze-leg2drift-b.js — leg-2 PLENTYDEPRI rot-drift BISECTION analyzer
// (sim-leg2drift-b, 2026-10-24, oversight-flesh-out-loop-b, axis food-economy).
//
// Derived from scripts/analyze-pddrift-b.js (same aggregation + --compare
// normalization: ms and medianSurvival stripped). Deltas for leg 2:
//   1. Candidate pairs are the leg-2 window (see evidence header):
//      07a3ede32 -> fa10e1ca8 (ledger revert)
//      0b151e0e1 -> 2c2336dd9 (social)
//      1f24a4ef0 -> 75fdd9258 (preserver widening)
//      75fdd9258 -> be55cfc2c (havenGrowth; parent IS the previous commit)
//   2. STEP direction is leg-2 direction: a pair STEPS iff the family
//      changes (NEW->OLD is the leg-2 step; OLD->NEW is also reported
//      as a step with its direction, never silently folded into one).
//      EXONERATED iff both ratios sit in the SAME family, or move by
//      < 0.10 with no family change. Anything else is NO STEP SHOWN.
//   3. Per-seed-median ratio (backlog #891, pre-registered alongside the
//      aggregate): per seed, rot/100d = (rotFresh+rotPreserved)/daysAlive
//      * 100; per-side median across seeds; medRatio = med(pd1)/med(pd0).
//      Both ratios are printed for every anchor; if they disagree on
//      family, the anchor line says DISAGREE and no family verdict is
//      forced from the aggregate alone.
//   4. Wall section: per anchor national/table/wins, maxWave, median
//      survival, plus corpus-wide death-cause shares (report-only).
//   5. Pre-reg-adjusted pair verdicts (backlog #909, sim-leg2decide-b):
//      every pair line prints the aggregate-only label AND the
//      median-dispute-adjusted verdict (DISPUTED when the median
//      disagrees on family at either anchor or on the step); the
//      aggregate label alone must never be read as the verdict.
//
// Family bands (pre-registered): OLD <= 0.75, NEW >= 0.85,
// 0.75-0.85 = AMBIG (no forced verdict).
//
// Usage: node scripts/analyze-leg2drift-b.js [CORPUS_DIR]
//        node scripts/analyze-leg2drift-b.js --compare <a.json> <b.json>
// Env: REPORT=<path> writes the same report to a file.
'use strict';
const fs = require('fs');
const path = require('path');

function normalize(obj) {
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

const CORPUS = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-24', 'leg2drift-b-corpus');
const REPORT = process.env.REPORT || '';
let files = [];
try { files = fs.readdirSync(CORPUS).filter(f => f.startsWith('leg2drift-b-') && f.endsWith('.json')); }
catch (e) { console.error('FATAL: cannot read corpus dir', CORPUS, e.message); process.exit(2); }
if (!files.length) { console.error('FATAL: no leg2drift-b per-seed files in', CORPUS); process.exit(2); }

const groups = new Map();
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

const anchors = new Map();
const deathTotals = {};
let totalConfigs = 0, totalNational = 0, totalTable = 0, totalWins = 0, totalDeaths = 0;
for (const [key, rows] of groups) {
  const [anchor, policy, pd] = key.split('|');
  const ak = anchor + '|' + policy;
  if (!anchors.has(ak)) anchors.set(ak, {});
  const rot = rows.reduce((a, r) => a + r.rotFreshKcal + r.rotPreservedKcal, 0);
  const days = rows.reduce((a, r) => a + r.daysAlive, 0);
  const perSeedRot100 = rows.map(r => (r.daysAlive ? (r.rotFreshKcal + r.rotPreservedKcal) / r.daysAlive * 100 : 0));
  anchors.get(ak)['pd' + pd] = {
    n: rows.length, rot100d: days ? rot / days * 100 : 0,
    medRot100: med(perSeedRot100),
    medSurv: med(rows.map(r => r.daysAlive)),
    national: rows.filter(r => r.national).length,
    table: rows.filter(r => r.table).length,
    wins: rows.filter(r => r.win).length,
    maxWave: Math.max.apply(null, rows.map(r => (r.waveReach || []).length ? Math.max.apply(null, r.waveReach) : 1)),
    wave45: rows.filter(r => (r.waveReach || []).includes(4) || (r.waveReach || []).includes(5)).length,
  };
  for (const r of rows) {
    totalConfigs++;
    if (r.national) totalNational++;
    if (r.table) totalTable++;
    if (r.win) totalWins++;
    for (const [c, n] of Object.entries(r.deathCauses || {})) { deathTotals[c] = (deathTotals[c] || 0) + n; totalDeaths += n; }
  }
}

const lines = [];
lines.push('leg2drift-b analyzer: per-anchor PD=1/PD=0 rot/100d (leadfeast/dg1 reduced contrast unless policy says otherwise)');
lines.push('anchor(policy) | pd0 rot/100d | pd1 rot/100d | aggRatio | aggFamily | medRatio | medFamily | agree? | n | medSurv c->a | national c->a | table c->a | wins c->a | maxWave');
const ratios = new Map(), medRatios = new Map();
for (const [ak, sides] of [...anchors.entries()].sort()) {
  if (!sides.pd0 || !sides.pd1) { lines.push(ak + ' | INCOMPLETE (missing a PD side)'); continue; }
  const ratio = sides.pd0.rot100d ? sides.pd1.rot100d / sides.pd0.rot100d : 0;
  const medRatio = sides.pd0.medRot100 ? sides.pd1.medRot100 / sides.pd0.medRot100 : 0;
  ratios.set(ak, ratio); medRatios.set(ak, medRatio);
  const agree = family(ratio) === family(medRatio) ? 'agree' : 'DISAGREE';
  lines.push(`${ak} | ${Math.round(sides.pd0.rot100d)} | ${Math.round(sides.pd1.rot100d)} | ${ratio.toFixed(3)}x | ${family(ratio)} | ${medRatio.toFixed(3)}x | ${family(medRatio)} | ${agree} | ${sides.pd0.n}/${sides.pd1.n} | ${sides.pd0.medSurv}->${sides.pd1.medSurv} | ${sides.pd0.national}->${sides.pd1.national} | ${sides.pd0.table}->${sides.pd1.table} | ${sides.pd0.wins}->${sides.pd1.wins} | ${sides.pd0.maxWave}/${sides.pd1.maxWave}`);
}
lines.push('');
lines.push('candidate pairs (parent -> commit, same policy leadfeast; leg-2 step direction is NEW->OLD):');
const pairs = [
  ['07a3ede32', 'fa10e1ca8', 'ledger revert'],
  ['0b151e0e1', '2c2336dd9', 'social (invisible friendship)'],
  ['1f24a4ef0', '75fdd9258', 'preserver widening'],
  ['75fdd9258', 'be55cfc2c', 'havenGrowth (siege composed; parent IS preserver commit)'],
];
for (const [parent, commit, label] of pairs) {
  const rp = [...ratios.entries()].find(([k]) => k.split('|')[0].startsWith(parent) && k.endsWith('|leadfeast'));
  const rc = [...ratios.entries()].find(([k]) => k.split('|')[0].startsWith(commit) && k.endsWith('|leadfeast'));
  const mp = [...medRatios.entries()].find(([k]) => k.split('|')[0].startsWith(parent) && k.endsWith('|leadfeast'));
  const mc = [...medRatios.entries()].find(([k]) => k.split('|')[0].startsWith(commit) && k.endsWith('|leadfeast'));
  if (!rp || !rc) { lines.push(`  ${label}: MISSING anchor data (${parent} or ${commit})`); continue; }
  const [pk, pv] = rp, [ck, cv] = rc;
  const step = family(pv) !== family(cv) && family(pv) !== 'AMBIG' && family(cv) !== 'AMBIG';
  const ex = family(pv) === family(cv) || Math.abs(cv - pv) < 0.10;
  const verdict = step ? `STEP ${family(pv)}->${family(cv)}` : (ex ? 'EXONERATED' : 'NO STEP SHOWN');
  // PRE-REG-ADJUSTED VERDICT (backlog #909, sim-leg2decide-b): the
  // aggregate-only label above OVERSTATES verdicts when the median
  // disputes it (1630Z: preserver STEP + social EXONERATED were both
  // disputed). The adjusted verdict is DISPUTED whenever the median
  // disagrees with the aggregate on family at either anchor, or on
  // the step (present/absent/direction); otherwise it repeats the
  // aggregate label. Both labels are always printed; neither hides.
  let adjusted = verdict;
  if (mp && mc) {
    const [, mpv] = mp, [, mcv] = mc;
    const medStep = family(mpv) !== family(mcv) && family(mpv) !== 'AMBIG' && family(mcv) !== 'AMBIG';
    const medDir = medStep ? `${family(mpv)}->${family(mcv)}` : 'no-step';
    const aggDir = step ? `${family(pv)}->${family(cv)}` : 'no-step';
    const disputed = family(pv) !== family(mpv) || family(cv) !== family(mcv) || aggDir !== medDir;
    if (disputed) adjusted = `DISPUTED (aggregate: ${verdict}; median: ${medStep ? 'STEP ' + medDir : 'no-step'})`;
  }
  lines.push(`  ${label}: ${pk.split('|')[0]} ${pv.toFixed(3)}x (${family(pv)}) -> ${ck.split('|')[0]} ${cv.toFixed(3)}x (${family(cv)}) : ${verdict} | pre-reg-adjusted: ${adjusted}`);
}
lines.push('');
lines.push(`WALL (all anchors, both sides): configs ${totalConfigs}, national ${totalNational}, table ${totalTable}, wins ${totalWins}, deaths ${totalDeaths}`);
lines.push('death-cause shares (top 15):');
const sortedDeaths = Object.entries(deathTotals).sort((a, b) => b[1] - a[1]).slice(0, 15);
for (const [c, n] of sortedDeaths) lines.push(`  ${c}: ${n} (${totalDeaths ? (n / totalDeaths * 100).toFixed(1) : '0.0'}%)`);
const report = lines.join('\n') + '\n';
console.log(report);
if (REPORT) fs.writeFileSync(REPORT, report);
process.exit(0);

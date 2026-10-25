#!/usr/bin/env node
// analyze-leg2decide-b.js — DECIDING-metric analyzer for sim-leg2decide-b
// (oversight-flesh-out-loop-b-20261024T1830Z, axis food-economy).
//
// Reads the FRESH leg2decide corpus only (default
// evidence/2026-10-24/leg2decide-b-corpus/, never leg2drift-b-corpus/ —
// the 1630Z corpus is NOT re-judged here). Pair under test, ONLY pair:
//   parent 1f24a4ef04a857d33138fd0845cfa83df688285c ->
//   commit 75fdd92587ad9d83bb12f05da535cdfb49255835
// contrast leadfeast/dg1, 100d death-aware horizons.
//
// DECIDING METRIC (pre-registered in evidence/2026-10-24/sim-leg2decide-b.md
// BEFORE any sim ran): per seed s and anchor A,
//   rot100d(A, side, s) = (rotFreshKcal + rotPreservedKcal) / daysAlive * 100
//   r(A, s) = rot100d(A, pd1, s) / rot100d(A, pd0, s)
//   M(A) = median of r(A, s) across seeds
//   MEDIAN STEP RATIO = M(commit) / M(parent)
// VERDICT: < 0.80x STEP CONFIRMED; >= 0.90x STEP REFUTED; else INCONCLUSIVE.
// Everything else printed here (aggregate sum ratio, ratio-of-medians,
// median of per-seed step ratios, per-anchor levels) is DIAGNOSTIC ONLY
// and can never overturn the deciding verdict.
//
// Usage: node scripts/analyze-leg2decide-b.js [CORPUS_DIR]
// Env: REPORT=<path> writes the same report to a file.
// Exit: 0 always on a complete corpus (the verdict is data, not a failure);
//   2 (FATAL) on a missing/incomplete corpus or schema violation.
'use strict';
const fs = require('fs');
const path = require('path');

const PARENT = '1f24a4ef04a857d33138fd0845cfa83df688285c';
const COMMIT = '75fdd92587ad9d83bb12f05da535cdfb49255835';

function med(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  if (!s.length) return null;
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function quartiles(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  if (!s.length) return [null, null, null];
  const q = (p) => s[Math.min(s.length - 1, Math.floor(p * s.length))];
  return [q(0.25), med(s), q(0.75)];
}

const CORPUS = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-24', 'leg2decide-b-corpus');
const REPORT = process.env.REPORT || '';
let files = [];
try { files = fs.readdirSync(CORPUS).filter(f => f.startsWith('leg2drift-b-') && f.endsWith('.json')); }
catch (e) { console.error('FATAL: cannot read corpus dir', CORPUS, e.message); process.exit(2); }
if (!files.length) { console.error('FATAL: no leg2drift-b per-seed files in', CORPUS); process.exit(2); }

// Group: anchor -> side -> seed -> row. FATAL on schema violations.
const data = new Map(); // anchor -> { pd0: Map, pd1: Map }
for (const f of files.sort()) {
  let row;
  try { row = JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8')); }
  catch (e) { console.error('FATAL: cannot parse', f, e.message); process.exit(2); }
  if (!row.anchorCommit || typeof row.daysAlive !== 'number' || typeof row.seed !== 'number') {
    console.error('FATAL: schema violation in', f, '(anchorCommit + daysAlive + seed required)'); process.exit(2);
  }
  if (!data.has(row.anchorCommit)) data.set(row.anchorCommit, { pd0: new Map(), pd1: new Map() });
  const side = row.plentydepri === 1 ? 'pd1' : 'pd0';
  data.get(row.anchorCommit)[side].set(row.seed, row);
}

function anchorStats(anchor) {
  const g = data.get(anchor);
  if (!g) return null;
  const seeds = [...g.pd0.keys()].filter(s => g.pd1.has(s)).sort((a, b) => a - b);
  const rot100 = (side, s) => {
    const r = g[side].get(s);
    return r.daysAlive ? (r.rotFreshKcal + r.rotPreservedKcal) / r.daysAlive * 100 : 0;
  };
  const ratios = [];
  const excluded = [];
  for (const s of seeds) {
    const d0 = rot100('pd0', s);
    if (!d0) { excluded.push(s); continue; }
    ratios.push({ seed: s, r: rot100('pd1', s) / d0, pd0: d0, pd1: rot100('pd1', s) });
  }
  const sumRot = (side) => [...g[side].values()].reduce((a, r) => a + r.rotFreshKcal + r.rotPreservedKcal, 0);
  const sumDays = (side) => [...g[side].values()].reduce((a, r) => a + r.daysAlive, 0);
  const agg0 = sumDays('pd0') ? sumRot('pd0') / sumDays('pd0') * 100 : 0;
  const agg1 = sumDays('pd1') ? sumRot('pd1') / sumDays('pd1') * 100 : 0;
  const med0 = med([...g.pd0.values()].map(r => r.daysAlive ? (r.rotFreshKcal + r.rotPreservedKcal) / r.daysAlive * 100 : 0));
  const med1 = med([...g.pd1.values()].map(r => r.daysAlive ? (r.rotFreshKcal + r.rotPreservedKcal) / r.daysAlive * 100 : 0));
  return {
    seeds, n: seeds.length, ratios,
    excluded,
    M: med(ratios.map(x => x.r)),
    aggRatio: agg0 ? agg1 / agg0 : 0,
    agg0, agg1,
    ratioOfMedians: med0 ? med1 / med0 : 0,
    med0, med1,
    national: [...g.pd0.values()].filter(r => r.national).length + [...g.pd1.values()].filter(r => r.national).length,
    wins: [...g.pd0.values()].filter(r => r.win).length + [...g.pd1.values()].filter(r => r.win).length,
  };
}

const p = anchorStats(PARENT);
const c = anchorStats(COMMIT);
if (!p || !c) { console.error('FATAL: missing preserver pair anchor data (parent and/or commit absent)'); process.exit(2); }
const missing = [];
for (const [name, st, want] of [['parent', p, null], ['commit', c, null]]) {
  const have = new Set(st.seeds);
  void want; void name;
  if (st.excluded.length) missing.push(`${name} excluded zero-pd0 seeds: ${st.excluded.join(',')}`);
}
if (p.n !== c.n) {
  console.error(`FATAL: paired seed count mismatch parent=${p.n} commit=${c.n}`); process.exit(2);
}
const commonSeeds = p.seeds.filter(s => c.seeds.includes(s));
if (commonSeeds.length !== p.n) {
  console.error('FATAL: parent/commit seed sets differ'); process.exit(2);
}
const stepRatios = commonSeeds.map(s => {
  const rp = p.ratios.find(x => x.seed === s).r;
  const rc = c.ratios.find(x => x.seed === s).r;
  return { seed: s, step: rp ? rc / rp : 0, rp, rc };
});
const stepRatio = (p.M && c.M) ? c.M / p.M : 0;
const medStepRatio = med(stepRatios.map(x => x.step));
const verdict = stepRatio < 0.80 ? 'STEP CONFIRMED' : (stepRatio >= 0.90 ? 'STEP REFUTED' : 'INCONCLUSIVE');

const lines = [];
lines.push('leg2decide-b analyzer: DECIDING metric on the preserver-step pair ONLY (fresh 9266-9281 corpus)');
lines.push(`parent  ${PARENT} | commit ${COMMIT} | contrast leadfeast/dg1 | seeds ${p.n} (paired)`);
lines.push('');
lines.push('DECIDING METRIC: M(A) = median over seeds of per-seed pd1/pd0 rot/100d ratio; step = M(commit)/M(parent)');
lines.push(`  M(parent) = ${p.M.toFixed(3)}x | M(commit) = ${c.M.toFixed(3)}x | MEDIAN STEP RATIO = ${stepRatio.toFixed(3)}x`);
lines.push(`  VERDICT (pre-registered bands <0.80 CONFIRMED / >=0.90 REFUTED / else INCONCLUSIVE): ${verdict}`);
lines.push('');
lines.push('DIAGNOSTIC ONLY (cannot overturn the verdict):');
lines.push(`  aggregate sum ratio: parent ${p.aggRatio.toFixed(3)}x (pd0 ${Math.round(p.agg0)} pd1 ${Math.round(p.agg1)}) -> commit ${c.aggRatio.toFixed(3)}x (pd0 ${Math.round(c.agg0)} pd1 ${Math.round(c.agg1)}) | aggregate step ${p.aggRatio ? (c.aggRatio / p.aggRatio).toFixed(3) : 'n/a'}x`);
lines.push(`  ratio-of-medians (1630Z secondary style): parent ${p.ratioOfMedians.toFixed(3)}x -> commit ${c.ratioOfMedians.toFixed(3)}x | step ${p.ratioOfMedians ? (c.ratioOfMedians / p.ratioOfMedians).toFixed(3) : 'n/a'}x`);
lines.push(`  median of per-seed step ratios: ${medStepRatio.toFixed(3)}x`);
lines.push(`  wall (both anchors, both sides): configs ${2 * (p.n + c.n)}, national ${p.national + c.national}, wins ${p.wins + c.wins}`);
if (missing.length) lines.push('  notes: ' + missing.join('; '));
lines.push('');
lines.push('PER-SEED RATIO DISTRIBUTION (the skew evidence — read this, not just the median):');
lines.push('seed | r(parent) | r(commit) | per-seed step r(commit)/r(parent)');
for (const x of stepRatios) lines.push(`  ${x.seed} | ${x.rp.toFixed(3)} | ${x.rc.toFixed(3)} | ${x.step.toFixed(3)}`);
const [pq1, pq2, pq3] = quartiles(p.ratios.map(x => x.r));
const [cq1, cq2, cq3] = quartiles(c.ratios.map(x => x.r));
const [sq1, sq2, sq3] = quartiles(stepRatios.map(x => x.step));
lines.push(`  parent ratios sorted: ${p.ratios.map(x => x.r).sort((a, b) => a - b).map(v => v.toFixed(3)).join(', ')} (Q1 ${pq1.toFixed(3)} med ${pq2.toFixed(3)} Q3 ${pq3.toFixed(3)})`);
lines.push(`  commit ratios sorted: ${c.ratios.map(x => x.r).sort((a, b) => a - b).map(v => v.toFixed(3)).join(', ')} (Q1 ${cq1.toFixed(3)} med ${cq2.toFixed(3)} Q3 ${cq3.toFixed(3)})`);
lines.push(`  per-seed steps sorted: ${stepRatios.map(x => x.step).sort((a, b) => a - b).map(v => v.toFixed(3)).join(', ')} (Q1 ${sq1.toFixed(3)} med ${sq2.toFixed(3)} Q3 ${sq3.toFixed(3)})`);
const report = lines.join('\n') + '\n';
console.log(report);
if (REPORT) fs.writeFileSync(REPORT, report);
process.exit(0);

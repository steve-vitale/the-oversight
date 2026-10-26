#!/usr/bin/env node
// test-cattailband-b.js — proof for sim-cattailband-b (measurement only).
//
// Checks, all independent of scripts/analyze-cattailband-b.js (own loops):
//  1. Corpus validity: 8 files, seeds 9760–9767, competent-nofeast policy
//     fields, spoilvolOn true, no truncation flags, spoil records present.
//  2. Independent GO-leg recomputation (legs 2–4; leg 1 det-gate is
//     compared from DET_OFF/DET_ON stdout-JSON files when supplied):
//     leg 2 sweep integrity, leg 3 appearance BY INFLOW RECORD COUNT,
//     leg 4 ratio + share. Prints the prereg verdict implied by the legs.
//  3. Supporting cross-check (warning-only, never asserted): re-run
//     inflow totals vs the lqpersist corpus inflow totals per seed —
//     any drift is base-move drift to name in the evidence, not a
//     proof failure.
//  4. Hygiene: 0 src/js files modified, 0 sibling capture files
//     modified, no modified TRACKED files at proof time (new untracked
//     arm files are allowed).
//  5. Det-gate (when DET_OFF/DET_ON are set): inflow records, mealdraw
//     records, death lists, and wall fields byte-identical excluding
//     spoilvol fields and `ms`.
//
// Exit 0 = proof green. A leg failure is NOT a proof failure: the proof
// verifies the measurement, and the verdict (GO / NO-GO / DIAG-NO-GO)
// is whatever the legs imply. Only broken measurement (missing corpus,
// bad integrity, failed det-gate, dirty tracked files) fails the proof.
//
// Usage:
//   node scripts/test-cattailband-b.js
//   DET_OFF=/tmp/det-off.json DET_ON=/tmp/det-on.json node scripts/test-cattailband-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'evidence', '2026-10-26', 'sim-cattailband-b-corpus');
const LQ_DIR = path.join(ROOT, 'evidence', '2026-10-26', 'sim-lqpersist-b-corpus');
let failures = 0;
function check(cond, msg) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + msg);
  if (!cond) failures += 1;
}

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort();
check(files.length === 8, `corpus has 8 files (got ${files.length})`);
const corpus = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
const seeds = corpus.map(d => d.seed).sort((a, b) => a - b);
check(JSON.stringify(seeds) === JSON.stringify([9760, 9761, 9762, 9763, 9764, 9765, 9766, 9767]),
  `corpus seeds are 9760-9767 (got ${seeds.join(',')})`);
for (const d of corpus) {
  check(d.policy === 'competent-nofeast' && d.competentFeast === 0 && d.plentydepri === 0 &&
    d.depositgate === 1 && d.feastscaleR13 === 0 && d.spoilvolOn === true,
    `seed ${d.seed} policy fields competent-nofeast, spoilvolOn=true`);
  check(!d.inflowTruncated && !d.mealdrawTruncated, `seed ${d.seed} no truncation flags`);
  check(Array.isArray((d.spoilEvents || {}).sweeps) && d.spoilEvents.sweeps.length > 0,
    `seed ${d.seed} spoil sweeps present (${(d.spoilEvents || {}).sweeps.length})`);
  check(Array.isArray(d.spoilDays) && d.spoilDays.length > 0, `seed ${d.seed} day-end snapshots present`);
}

// Independent leg recomputation (own loops, not the analyzer's).
let violRemoved = 0, violKept = 0, totSweeps = 0;
const stats = {}; // channel -> {inflow, draws, sweep, seedsByRecs}
function st(c) { if (!stats[c]) stats[c] = { inflow: 0, draws: 0, sweep: 0, seedsByRecs: 0 }; return stats[c]; }
for (const d of corpus) {
  const perSeedRecs = {};
  for (const r of (d.inflows || [])) {
    if (r.name == null) continue;
    const c = String(r.name);
    perSeedRecs[c] = (perSeedRecs[c] || 0) + 1;
    if (r.door === 'stock' && !(r.kcal > 0)) continue;
    if (r.door === 'pantryAdd' && !r.added) continue;
    st(c).inflow += r.kcal || 0;
  }
  for (const c of Object.keys(perSeedRecs)) st(c).seedsByRecs += 1;
  for (const r of (d.mealDrawRecords || [])) {
    if (r.kind !== 'pantryDraw') continue;
    for (const it of (r.items || [])) {
      if (it.name == null) continue;
      st(String(it.name)).draws += (it.units || 0) * (it.kcalEach || 0);
    }
  }
  for (const sw of ((d.spoilEvents || {}).sweeps || [])) {
    totSweeps += 1;
    const v = ((sw.violations || {}).pantry || {});
    violRemoved += v.removedNotSpoiledKcal || 0;
    violKept += v.keptSpoiledKcal || 0;
    for (const bc of (((sw.removed || {}).pantry || {}).byChannel || [])) {
      st(String(bc.channel)).sweep += bc.kcal || 0;
    }
  }
}
const lq = stats["Lamb's Quarters"] || { inflow: 0, draws: 0, sweep: 0, seedsByRecs: 0 };
const cat = stats.Cattail || { inflow: 0, draws: 0, sweep: 0, seedsByRecs: 0 };
console.log(`LEG2 integrity: removedNotSpoiled=${violRemoved} keptSpoiled=${violKept} sweeps=${totSweeps}`);
console.log(`LEG3 appearance (by inflow record count): LQ=${lq.seedsByRecs} Cattail=${cat.seedsByRecs}`);
console.log(`LEG4 pooled: LQ inflow=${lq.inflow} draws=${lq.draws} sweep=${lq.sweep}; ` +
  `Cattail inflow=${cat.inflow} draws=${cat.draws} sweep=${cat.sweep}`);
const ratio = lq.sweep > 0 ? cat.sweep / lq.sweep : null;
const share = (cat.inflow - cat.draws) > 0 ? cat.sweep / (cat.inflow - cat.draws) : null;
console.log(`LEG4a ratio=${ratio == null ? 'n/a' : ratio.toFixed(3)} (bar >= 1.50)`);
console.log(`LEG4b share=${share == null ? 'n/a' : share.toFixed(3)} (bar >= 0.50)`);
check(violRemoved === 0 && violKept === 0, 'leg2: sweep integrity 0/0 (measurement sound)');
const leg3 = lq.seedsByRecs >= 2 && cat.seedsByRecs >= 2;
const leg4 = ratio != null && ratio >= 1.5 && share != null && share >= 0.5;
let verdict;
if (!leg3) verdict = 'DIAG-NO-GO (leg3 appearance fails; leg4 UNMEASURED)';
else if (!leg4) verdict = 'NO-GO (leg4 fails as barred)';
else verdict = 'GO';
console.log(`VERDICT implied by legs 2-4 (leg 1 det-gate below): ${verdict}`);
// Cattail must be present in sweep removals on its growing seeds if the
// sink story is even testable; report, do not assert a verdict leg.
for (const d of corpus) {
  const catSweep = ((d.spoilEvents || {}).sweeps || []).reduce((t, sw) =>
    t + (((sw.removed || {}).pantry || {}).byChannel || [])
      .filter(bc => bc.channel === 'Cattail').reduce((s, bc) => s + (bc.kcal || 0), 0), 0);
  const catIn = (d.inflows || []).filter(r => r.name === 'Cattail').reduce((s, r) => s + (r.kcal || 0), 0);
  if (catIn > 0) console.log(`  seed ${d.seed}: Cattail inflow=${catIn} pantry sweep-removed=${catSweep}`);
}

// Supporting cross-check: re-run inflow totals vs lqpersist corpus
// (warning-only; drift is evidence content, not proof failure).
try {
  const lqFiles = fs.readdirSync(LQ_DIR).filter(f => f.endsWith('.json')).sort();
  const lqBySeed = {};
  for (const f of lqFiles) {
    const d = JSON.parse(fs.readFileSync(path.join(LQ_DIR, f), 'utf8'));
    const tot = {};
    for (const r of (d.inflows || [])) {
      if (r.door === 'stock' && !(r.kcal > 0)) continue;
      if (r.door === 'pantryAdd' && !r.added) continue;
      tot[String(r.name)] = (tot[String(r.name)] || 0) + (r.kcal || 0);
    }
    lqBySeed[d.seed] = tot;
  }
  for (const d of corpus) {
    const tot = {};
    for (const r of (d.inflows || [])) {
      if (r.door === 'stock' && !(r.kcal > 0)) continue;
      if (r.door === 'pantryAdd' && !r.added) continue;
      tot[String(r.name)] = (tot[String(r.name)] || 0) + (r.kcal || 0);
    }
    const old = lqBySeed[d.seed] || {};
    const keys = new Set([...Object.keys(tot), ...Object.keys(old)]);
    let diffs = 0;
    for (const k of keys) if ((tot[k] || 0) !== (old[k] || 0)) diffs += 1;
    console.log(`CROSSCHECK seed ${d.seed}: inflow channels differing from lqpersist corpus: ${diffs}` +
      (diffs ? ` (re-run Cattail=${tot.Cattail || 0} vs lqpersist ${old.Cattail || 0}; LQ=${tot["Lamb's Quarters"] || 0} vs ${old["Lamb's Quarters"] || 0})` : ''));
  }
} catch (e) { console.log('CROSSCHECK skipped: ' + e.message); }

// Det-gate comparison (leg 1), when DET_OFF/DET_ON are supplied.
function stripForDet(d) {
  const c = JSON.parse(JSON.stringify(d));
  delete c.ms; delete c.spoilvolOn; delete c.spoilEvents; delete c.spoilCounters;
  delete c.spoilDays; delete c.spoilSayLines;
  return c;
}
if (process.env.DET_OFF && process.env.DET_ON) {
  const off = stripForDet(JSON.parse(fs.readFileSync(process.env.DET_OFF, 'utf8')));
  const on = stripForDet(JSON.parse(fs.readFileSync(process.env.DET_ON, 'utf8')));
  const same = JSON.stringify(off) === JSON.stringify(on);
  check(same, 'leg1 det-gate: SPOILVOL=0 vs 1 identical on inflow/mealdraw/deaths/wall (spoilvol fields + ms excluded)');
  if (!same) {
    const keys = new Set([...Object.keys(off), ...Object.keys(on)]);
    for (const k of keys) {
      if (JSON.stringify(off[k]) !== JSON.stringify(on[k])) console.log(`  det-gate diff on key: ${k}`);
    }
  }
} else {
  console.log('LEG1 det-gate: not compared (DET_OFF/DET_ON unset — run the det-gate pair and re-run with them set)');
}

// Hygiene: no modified tracked files, no src/js or sibling-capture mods.
const status = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf8' });
const modifiedTracked = status.split('\n').filter(l => l && !l.startsWith('??')).map(l => l.slice(3));
check(modifiedTracked.length === 0, `no modified tracked files at proof time (got ${modifiedTracked.length}: ${modifiedTracked.join(', ')})`);
const srcMods = modifiedTracked.filter(f => f.startsWith('src/js/'));
check(srcMods.length === 0, `0 src/js files modified (got ${srcMods.length})`);
const sib = ['scripts/spoilvol-capture.js', 'scripts/sweep-spoilvol-b.js', 'scripts/inflow-capture.js', 'scripts/mealdraw-capture.js'];
const sibMods = modifiedTracked.filter(f => sib.includes(f));
check(sibMods.length === 0, `0 sibling capture files modified (got ${sibMods.length})`);

console.log(failures === 0 ? 'PROOF GREEN' : `PROOF FAILURES: ${failures}`);
process.exit(failures === 0 ? 0 : 1);

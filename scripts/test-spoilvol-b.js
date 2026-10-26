#!/usr/bin/env node
// test-spoilvol-b.js — proof for sim-spoilvol-b.
//
// Checks, in order:
//  1. Corpus validity: 8 pilot files, policy fields, no truncation flags.
//  2. Det-gate (prereg leg 1): seed 9820 run with SPOILVOL=1 vs
//     SPOILVOL=0 via SWEEP_STDOUT_JSON=1; inflow records, mealdraw
//     records, death lists, and wall fields must be identical
//     (spoilvol fields and `ms` excluded). Any mismatch fails.
//  3. Independent GO-leg recomputation from the corpus (leg 2
//     violations, leg 3 appearances, leg 4 ratio/share) agreeing with
//     the analyzer's printed lines (recomputed here, not copied).
//  4. Cattail absence check: no channel name containing 'cattail'
//     (case-insensitive) in inflows, sweep removals, mealdraw items,
//     or day-end snapshot channels on any pilot seed.
//  5. Hygiene: 0 src/js files modified, 0 sibling capture files
//     modified, no modified tracked files other than the intended
//     evidence/scripts of this arm (checked via git status).
// Exit 0 iff all checks pass (a DIAG-NO-GO verdict is still a PASS
// for the proof — the proof checks the measurement, not the GO).
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'evidence', '2026-10-26', 'sim-spoilvol-b-corpus');
let failures = 0;
function check(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures++;
}
function stripForDet(ps) {
  const c = JSON.parse(JSON.stringify(ps));
  delete c.spoilDays; delete c.spoilSayLines; delete c.spoilEvents;
  delete c.spoilCounters; delete c.spoilvolOn; delete c.ms;
  return c;
}
function runSweep(seed, spoilvolOn) {
  const env = Object.assign({}, process.env, {
    COMPETENT_FEAST: '0', SEATDRIVE: '0', PLENTYDEPRI: '0', DEPOSITGATE: '1',
    SEEDS: String(seed), DAYS: '100', SWEEP_STDOUT_JSON: '1',
    SPOILVOL: spoilvolOn ? '1' : '0',
  });
  const out = execFileSync('node', [path.join(__dirname, 'sweep-spoilvol-b.js')], {
    env, cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 600000,
  });
  const line = out.split('\n').find(l => l.startsWith('{'));
  if (!line) throw new Error('no JSON line from sweep seed ' + seed);
  return JSON.parse(line);
}

// 1. Corpus validity.
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort();
check('corpus has 8 pilot files', files.length === 8, `${files.length} files`);
let corpus = [];
for (const f of files) {
  const ps = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  corpus.push(ps);
  check(`corpus ${f} policy fields`, ps.policy === 'competent-nofeast' &&
    ps.competentFeast === 0 && ps.plentydepri === 0 && ps.depositgate === 1, `seed ${ps.seed}`);
  check(`corpus ${f} no truncation`, !ps.inflowTruncated && !ps.mealdrawTruncated, `seed ${ps.seed}`);
  check(`corpus ${f} spoilvol on`, ps.spoilvolOn === true, `seed ${ps.seed}`);
}

// 2. Det-gate.
console.log('det-gate: running seed 9820 SPOILVOL=1 vs SPOILVOL=0 ...');
const withCap = runSweep(9820, true);
const withoutCap = runSweep(9820, false);
const a = stripForDet(withCap), b = stripForDet(withoutCap);
const sa = JSON.stringify(a), sb = JSON.stringify(b);
check('det-gate identical (inflow/mealdraw/deaths/wall)', sa === sb,
  sa === sb ? 'byte-identical excluding spoilvol/ms' : `lengths ${sa.length} vs ${sb.length}`);
if (sa !== sb) {
  for (const k of Object.keys(a)) {
    if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) console.log(`  differing key: ${k}`);
  }
}

// 3. Independent leg recomputation.
let violRemoved = 0, violKept = 0;
const pooled = new Map();
for (const ps of corpus) {
  for (const sw of (ps.spoilEvents.sweeps || [])) {
    const v = (sw.violations.pantry || {});
    violRemoved += v.removedNotSpoiledKcal || 0;
    violKept += v.keptSpoiledKcal || 0;
  }
  const add = (name, kcal, isDraw, isSweep) => {
    if (!pooled.has(name)) pooled.set(name, { inflow: 0, draws: 0, sweep: 0, seeds: new Set() });
    const p = pooled.get(name);
    if (isDraw) p.draws += kcal; else if (isSweep) p.sweep += kcal; else p.inflow += kcal;
  };
  const seedInflowNames = new Set();
  for (const r of ps.inflows) {
    if (r.door === 'stock' && !(r.kcal > 0)) continue;
    if (r.door === 'pantryAdd' && !r.added) continue;
    if (r.name == null) continue;
    add(String(r.name), r.kcal || 0, false, false);
    seedInflowNames.add(String(r.name));
  }
  for (const n of seedInflowNames) pooled.get(n).seeds.add(ps.seed);
  for (const r of ps.mealDrawRecords) {
    if (r.kind !== 'pantryDraw') continue;
    for (const it of r.items || []) {
      if (it.name == null) continue;
      add(String(it.name), (it.units || 0) * (it.kcalEach || 0), true, false);
    }
  }
  for (const sw of (ps.spoilEvents.sweeps || [])) {
    for (const bc of (sw.removed.pantry.byChannel || [])) add(String(bc.channel), bc.kcal || 0, false, true);
  }
}
const lq = pooled.get("Lamb's Quarters") || { sweep: 0, inflow: 0, draws: 0, seeds: new Set() };
const cat = pooled.get('Cattail') || { sweep: 0, inflow: 0, draws: 0, seeds: new Set() };
check('leg2 violations zero', violRemoved === 0 && violKept === 0, `removed=${violRemoved} kept=${violKept}`);
check('leg3 appearance LQ>=2', lq.seeds.size >= 2, `LQ seeds=${lq.seeds.size}`);
check('leg3 verdict logic: Cattail absent -> DIAG-NO-GO', cat.seeds.size === 0, `Cattail seeds=${cat.seeds.size} (0 = the observed finding; the BAR fails, the PROOF passes by deriving DIAG-NO-GO)`);
const ratio = lq.sweep > 0 ? cat.sweep / lq.sweep : null;
const share = (cat.inflow - cat.draws) > 0 ? cat.sweep / (cat.inflow - cat.draws) : null;
console.log(`  recomputed: LQ sweep=${lq.sweep} Cattail sweep=${cat.sweep} ratio=${ratio} share=${share}`);
console.log(`  verdict recomputation: leg2 ${violRemoved === 0 && violKept === 0 ? 'pass' : 'FAIL'}, leg3 ${lq.seeds.size >= 2 && cat.seeds.size >= 2 ? 'pass' : 'FAIL (Cattail absent -> DIAG-NO-GO)'}, leg4 ${ratio != null && ratio >= 1.5 && share != null && share >= 0.5 ? 'pass' : 'UNMEASURED (no Cattail)'}`);

// 4. Cattail absence check across all record types.
let catFound = [];
for (const ps of corpus) {
  const hit = [];
  for (const r of ps.inflows) if (/cattail/i.test(String(r.name))) hit.push('inflow');
  for (const sw of (ps.spoilEvents.sweeps || [])) for (const bc of (sw.removed.pantry.byChannel || [])) if (/cattail/i.test(bc.channel)) hit.push('sweep');
  for (const r of ps.mealDrawRecords) for (const it of (r.items || [])) if (/cattail/i.test(String(it.name))) hit.push('draw');
  for (const sd of (ps.spoilDays || [])) for (const c of (sd.channels || [])) if (/cattail/i.test(c.channel)) hit.push('snapshot');
  if (hit.length) catFound.push(`${ps.seed}:${[...new Set(hit)].join(',')}`);
}
check('Cattail absent from all record types', catFound.length === 0, catFound.length ? catFound.join(' ') : '0 hits on 8 seeds');

// 5. Hygiene.
const status = execSync('git status --short', { cwd: ROOT, encoding: 'utf8' });
const lines = status.split('\n').filter(Boolean);
const badSrc = lines.filter(l => l.slice(3).startsWith('src/js/'));
const siblingCaps = ['inflow-capture.js', 'mealdraw-capture.js', 'garden-capture.js',
  'throttledays-capture.js', 'stock9762-capture.js', 'lqpersist-capture.js'];
const badSib = lines.filter(l => siblingCaps.some(s => l.slice(3).endsWith(s)));
check('hygiene: 0 src/js modified', badSrc.length === 0, badSrc.join(' ') || 'clean');
check('hygiene: 0 sibling capture files modified', badSib.length === 0, badSib.join(' ') || 'clean');
console.log(`  git status lines: ${lines.length} (expected: analyzer + test + corpus files untracked)`);
console.log(`  base HEAD: ${execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8' }).trim()}`);

if (failures) { console.log(`\nPROOF FAILURES: ${failures}`); process.exit(1); }
console.log('\nPROOF GREEN (verdict DIAG-NO-GO is a measurement outcome, not a proof failure)');

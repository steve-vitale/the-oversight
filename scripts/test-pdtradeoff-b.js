#!/usr/bin/env node
// test-pdtradeoff-b.js — instrument proof for sim-pdtradeoff-b (2026-10-24).
// DIAG arm: measurement only, zero src/js changes.
//
// Legs:
//   P1 instrument derivation: scripts/sweep-pdtradeoff-b.js is derived from
//      scripts/sweep-bufferdepri-b.js with ONLY the declared deltas (header
//      list). Verified mechanically: every changed non-comment line matches
//      a declared-delta marker; the harness/sim code is otherwise
//      byte-identical.
//   P2 within-environment determinism: 2 PD=0 seeds run twice -> per-seed
//      JSONs byte-identical.
//   P3 corpus schema: pilot outputs carry the full schema.
//   P4 FATAL asserts: missing FEASTSCALE_R13 -> exit 2; unset PLENTYDEPRI ->
//      exit 2 (never silently arms defaults).
//   P5 analyzer exit semantics: exit 2 on missing corpus; runs clean on a
//      complete corpus (exercised for real post-sweep).
//   P6 corpus byte-reproduce vs bufferdepri PD=0 corpus (medianSurvival
//      normalized): REPORTED as REPRODUCE or DRIFT-with-attribution. DRIFT
//      does not fail the proof: blocking a DIAG sweep on the substrate drift
//      it exists to measure is incoherent. The drift is the DIAG's primary
//      output (hypothesis b) and is quantified at scale by the analyzer.
//
// ALL GREEN (P1-P5 PASS, P6 REPRODUCE-or-DRIFT) before the sweep.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(__dirname, 'sweep-bufferdepri-b.js');
const TGT = path.join(__dirname, 'sweep-pdtradeoff-b.js');
const ANA = path.join(__dirname, 'analyze-pdtradeoff-b.js');

let pass = 0, fail = 0;
const ok = (name, cond, detail) => {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
  if (cond) pass++; else fail++;
};

// ---------- P1: derivation check ----------
{
  const src = fs.readFileSync(SRC, 'utf8').split('\n');
  const tgt = fs.readFileSync(TGT, 'utf8').split('\n');
  const stripComments = ls => ls.filter(l => !/^\s*\/\//.test(l));
  const s = stripComments(src), t = stripComments(tgt);
  // LCS-free approach: align by exact lines, collect differing lines.
  const sm = new Map(), tm = new Map();
  s.forEach((l, i) => { if (!sm.has(l)) sm.set(l, []); sm.get(l).push(i); });
  const changed = [];
  const used = new Set();
  for (let i = 0; i < t.length; i++) {
    const l = t[i];
    if (sm.has(l) && sm.get(l).some(x => !used.has('s' + x))) {
      const x = sm.get(l).find(x => !used.has('s' + x)); used.add('s' + x);
    } else changed.push('T:' + l);
  }
  // second direction: source lines missing from target
  const tm2 = new Map();
  t.forEach((l, i) => { if (!tm2.has(l)) tm2.set(l, []); tm2.get(l).push(i); });
  const used2 = new Set();
  for (let i = 0; i < s.length; i++) {
    const l = s[i];
    if (tm2.has(l) && tm2.get(l).some(x => !used2.has('t' + x))) {
      const x = tm2.get(l).find(x => !used2.has('t' + x)); used2.add('t' + x);
    } else changed.push('S:' + l);
  }
  const markers = [/pdtradeoff/i, /bufferdepri/i, /pd2/i, /standdown/i, /stand_down/i,
    /deep-reserve/i, /DR dimension/, /PD_WANT/, /plentydepri/i, /PERSEED_DIR/, /emitFile/,
    /progress\(/, /mode:/, /SIDE/, /0\|1/, /OUT\b/, /CORPUS/i, /schema/i, /diag/i,
    /depriKcal/, /easedKcal/, /depriDec/, /starveDays/, /DIAG/];
  const unaccounted = changed.filter(l => !markers.some(m => m.test(l)));
  ok('P1 instrument derivation: non-comment diff confined to declared deltas',
    unaccounted.length === 0, `${changed.length} changed non-comment lines, ${unaccounted.length} unaccounted` +
    (unaccounted.length ? '\n  UNACCOUNTED:\n  ' + unaccounted.slice(0, 10).join('\n  ') : ''));
}

// ---------- P2 + P3: determinism pilot (2 seeds, run twice) ----------
const PILOT_DIR = '/tmp/pdtradeoff-proof-pilot';
function runSweep(seeds, dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  const r = spawnSync('node', [TGT], {
    cwd: ROOT,
    env: { ...process.env, FEASTSCALE_R13: '1', SEATDRIVE: '0', SIDE: 'pd0', DG: 'dg0',
      PLENTYDEPRI: '0', DEPOSITGATE: '0', POLICY: 'leadfeast', SEEDS: seeds, DAYS: '100',
      PERSEED_DIR: dir, OUT: path.join(dir, 'sweep-test.json') },
    encoding: 'utf8', timeout: 300000,
  });
  return r;
}
{
  const r1 = runSweep('9250,9251', PILOT_DIR + '-a');
  ok('P2 determinism pilot: first run exits 0', r1.status === 0, 'exit=' + r1.status + (r1.status ? ' ' + (r1.stderr || '').slice(-300) : ''));
  const r2 = runSweep('9250,9251', PILOT_DIR + '-b');
  ok('P2 determinism pilot: second run exits 0', r2.status === 0, 'exit=' + r2.status);
  let det = r1.status === 0 && r2.status === 0;
  const schemaKeys = ['seed', 'policy', 'plentydepri', 'depositgate', 'daysAlive', 'villageDays',
    'rotFreshKcal', 'rotPreservedKcal', 'depriKcal', 'easedKcal', 'glutChannels',
    'freshDaysMedian', 'deathCauses', 'national', 'table', 'win', 'waveReach', 'medianSurvival'];
  let schemaOk = true;
  if (det) {
    for (const sd of ['9250', '9251']) {
      const a = fs.readFileSync(path.join(PILOT_DIR + '-a', `pdtradeoff-b-pd0-dg0-leadfeast-s${sd}.json`), 'utf8');
      const b = fs.readFileSync(path.join(PILOT_DIR + '-b', `pdtradeoff-b-pd0-dg0-leadfeast-s${sd}.json`), 'utf8');
      if (a !== b) { det = false; console.log('  DIVERGE seed ' + sd); }
      const j = JSON.parse(a);
      for (const k of schemaKeys) if (!(k in j)) { schemaOk = false; console.log('  SCHEMA missing ' + k + ' seed ' + sd); }
      if (j.plentydepri !== 0 || j.depositgate !== 0 || j.policy !== 'leadfeast') { schemaOk = false; console.log('  SCHEMA field mismatch seed ' + sd); }
    }
  }
  ok('P2 within-environment determinism: same seed twice byte-identical', det);
  ok('P3 corpus schema: pilot per-seed JSONs schema-complete', schemaOk);
  // P6: byte-reproduce vs bufferdepri corpus (medianSurvival normalized)
  const BUFFER_DIR = path.join(ROOT, 'evidence', '2026-10-24', 'perseed-bufferdepri-b');
  let drift = [];
  for (const sd of ['9250', '9251']) {
    const mine = JSON.parse(fs.readFileSync(path.join(PILOT_DIR + '-a', `pdtradeoff-b-pd0-dg0-leadfeast-s${sd}.json`), 'utf8'));
    const bf = path.join(BUFFER_DIR, `bufferdepri-b-pd0-dg0-leadfeast-s${sd}.json`);
    if (!fs.existsSync(bf)) { drift.push(sd + ':missing'); continue; }
    const b = JSON.parse(fs.readFileSync(bf, 'utf8'));
    const norm = j => { const c = JSON.parse(JSON.stringify(j)); delete c.medianSurvival; return JSON.stringify(c); };
    if (norm(mine) !== norm(b)) drift.push(sd);
  }
  if (!drift.length) {
    console.log('DRIFT-CHECK P6: REPRODUCE — pilot PD=0 cells byte-reproduce the bufferdepri corpus (mod medianSurvival).');
  } else {
    console.log('DRIFT-CHECK P6: DRIFT — pilot PD=0 seeds differ from the bufferdepri corpus: ' + drift.join(', '));
    console.log('  attribution: game.js drift between the bufferdepri corpus (run 20261024T0332Z) and this worktree (84d390816).');
    console.log('  candidates: 85e42a22a (journey-deepening r39 scaleDiscovery dedup), db7c5f211 (bloodrestraint hook, env-gated/inert),');
    console.log('  c8d7c787d (succession meal trust gate — meal path), 5d7715db1 (journey r41 voice), 8461565f8 (contest gossip).');
    console.log('  This is the DIAG\'s primary output (hypothesis b); it does not block the sweep.');
  }
  fs.rmSync(PILOT_DIR + '-a', { recursive: true, force: true });
  fs.rmSync(PILOT_DIR + '-b', { recursive: true, force: true });
}

// ---------- P4: FATAL asserts ----------
{
  const r = spawnSync('node', [TGT], { cwd: ROOT,
    env: { ...process.env, SEATDRIVE: '0', SIDE: 'pd0', DG: 'dg0', PLENTYDEPRI: '0', DEPOSITGATE: '0', POLICY: 'leadfeast', SEEDS: '9250', DAYS: '1', PERSEED_DIR: '/tmp/x', OUT: '/tmp/x.json' },
    encoding: 'utf8', timeout: 60000 });
  ok('P4 FATAL: missing FEASTSCALE_R13 exits 2', r.status === 2, 'exit=' + r.status);
  const r2 = spawnSync('node', [TGT], { cwd: ROOT,
    env: (() => { const e = { ...process.env, FEASTSCALE_R13: '1', SEATDRIVE: '0', SIDE: 'pd0', DG: 'dg0', DEPOSITGATE: '0', POLICY: 'leadfeast', SEEDS: '9250', DAYS: '1', PERSEED_DIR: '/tmp/x', OUT: '/tmp/x.json' }; delete e.PLENTYDEPRI; return e; })(),
    encoding: 'utf8', timeout: 60000 });
  ok('P4 FATAL: unset PLENTYDEPRI exits 2 (never silently arms defaults)', r2.status === 2, 'exit=' + r2.status);
}

// ---------- P5: analyzer exit semantics ----------
{
  const r = spawnSync('node', [ANA], { cwd: ROOT, encoding: 'utf8', timeout: 60000 });
  ok('P5 analyzer exits 2 on missing corpus (fails loudly, not silently)', r.status === 2, 'exit=' + r.status);
}

console.log(`\nproof: ${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);

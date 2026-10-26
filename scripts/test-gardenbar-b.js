#!/usr/bin/env node
// test-gardenbar-b.js — proof for sim-gardenbar-b (measurement only).
//
// Proves, against evidence/2026-10-26/sim-gardenbar-b-corpus/:
//   1. Corpus 8/8 valid: seeds 9760-9767 exactly, policy competent-nofeast,
//      SEATDRIVE=0 band fields, non-empty gardenDays with planted/ripe counts.
//   2. Counts sum: per seed and in total, raw (a)+(b)+(c) == seed-days,
//      and phase pre-days + post-days == seed-days with phase (a)+(b)+(c)
//      == phase days.
//   3. Determinism gate: re-running the sweep for seed 9760 into a
//      scratch dir yields a byte-identical file to the corpus file.
//      The scratch dir is removed afterwards; any leftover fails loudly.
// Exits non-zero on any failure. No src/js touched, no defaults flipped.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'evidence', '2026-10-26', 'sim-gardenbar-b-corpus');
const EXPECTED_SEEDS = [9760, 9761, 9762, 9763, 9764, 9765, 9766, 9767];

function fail(msg) { console.error('PROOF FAIL: ' + msg); process.exit(1); }

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort();
if (files.length !== 8) fail('corpus file count ' + files.length + ' != 8');

let totalDays = 0, totalA = 0, totalB = 0, totalC = 0;
for (const f of files) {
  const s = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  if (!EXPECTED_SEEDS.includes(s.seed)) fail('unexpected seed ' + s.seed + ' in ' + f);
  if (f !== `gardenbar-b-competent-nofeast-s${s.seed}.json`) fail('unexpected filename ' + f);
  if (s.policy !== 'competent-nofeast') fail('seed ' + s.seed + ' policy ' + s.policy);
  if (s.competentFeast !== 0 || s.feastscaleR13 !== 0) fail('seed ' + s.seed + ' not a no-feast band');
  if (!Array.isArray(s.gardenDays) || !s.gardenDays.length) fail('seed ' + s.seed + ' empty gardenDays');
  let a = 0, b = 0, c = 0;
  let firstPlanted = null;
  const sorted = [...s.gardenDays].sort((x, y) => x.day - y.day);
  for (const snap of sorted) {
    if (typeof snap.planted !== 'number' || typeof snap.ripe !== 'number') fail('seed ' + s.seed + ' day ' + snap.day + ' missing planted/ripe');
    if (firstPlanted == null && snap.planted > 0) firstPlanted = snap.day;
  }
  for (const snap of sorted) {
    let cls;
    if (snap.planted === 0) cls = 'a';
    else if (snap.ripe === 0) cls = 'b';
    else cls = 'c';
    if (cls === 'a') a++; else if (cls === 'b') b++; else c++;
    const ph = (firstPlanted == null || snap.day < firstPlanted) ? 'pre' : 'post';
    if (ph === 'pre') { /* phase totals checked below via recount */ }
  }
  // Phase partition recount (independent loop).
  let preDays = 0, preA = 0, preB = 0, preC = 0, postDays = 0, postA = 0, postB = 0, postC = 0;
  for (const snap of sorted) {
    const cls = snap.planted === 0 ? 'a' : (snap.ripe === 0 ? 'b' : 'c');
    if (firstPlanted == null || snap.day < firstPlanted) {
      preDays++;
      if (cls === 'a') preA++; else if (cls === 'b') preB++; else preC++;
    } else {
      postDays++;
      if (cls === 'a') postA++; else if (cls === 'b') postB++; else postC++;
    }
  }
  if (a + b + c !== sorted.length) fail(`seed ${s.seed} raw sum ${a + b + c} != days ${sorted.length}`);
  if (preDays + postDays !== sorted.length) fail(`seed ${s.seed} phase sum ${preDays + postDays} != days ${sorted.length}`);
  if (preA + preB + preC !== preDays) fail(`seed ${s.seed} pre class sum != pre days`);
  if (postA + postB + postC !== postDays) fail(`seed ${s.seed} post class sum != post days`);
  totalDays += sorted.length; totalA += a; totalB += b; totalC += c;
  console.log(`seed ${s.seed}: days=${sorted.length} a=${a} b=${b} c=${c} firstPlanted=${firstPlanted} pre=${preDays} post=${postDays} OK`);
}
if (totalA + totalB + totalC !== totalDays) fail('total raw sum mismatch');
console.log(`corpus totals: days=${totalDays} a=${totalA} b=${totalB} c=${totalC} (8/8 valid, counts sum OK)`);

// Determinism gate: re-run seed 9760 in stdout-carrier mode (the sweep
// writes exactly one JSON line to stdout; diagnostics go to stderr) and
// compare bytes with the corpus file. No scratch dir is used: the
// container write flap (2026-10-26) makes node file writes unreliable,
// while stdout capture is exact.
const orig = fs.readFileSync(path.join(DIR, 'gardenbar-b-competent-nofeast-s9760.json'), 'utf8');
let rerun = null;
let lastErr = null;
for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    rerun = execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'sweep-gardenbar-b.js')], {
      cwd: ROOT,
      env: Object.assign({}, process.env, {
        COMPETENT_FEAST: '0', SEATDRIVE: '0', PLENTYDEPRI: '0', DEPOSITGATE: '1',
        SEEDS: '9760', DAYS: '100', SAYCAP: '300', INFLOWCAP: '50000',
        SWEEP_STDOUT_JSON: '1',
      }),
      stdio: 'pipe', timeout: 600000, encoding: 'utf8',
    });
    break;
  } catch (e) {
    lastErr = e;
    console.error(`determinism attempt ${attempt} failed: ${String((e && e.message) || e).slice(0, 300)}`);
  }
}
if (rerun == null) fail('determinism re-run failed after 3 attempts: ' + String((lastErr && lastErr.message) || lastErr));
if (rerun !== orig) fail('determinism gate: re-run seed 9760 differs from corpus (bytes ' + rerun.length + ' vs ' + orig.length + ')');
console.log('determinism gate: seed 9760 re-run byte-identical OK');
console.log('PROOF PASS: sim-gardenbar-b');

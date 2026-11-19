// test-rageholder-survey-b.js — proof test, arm sim-rageholder-survey-b.
// Proves the instrument, not the verdict:
//  §1 analyzer selftest (holder counting incl. the laterage-b
//      127-encounter / 3-holder shape, mismatch kinds, ranking,
//      wall, mislabel guard — 6 checks).
//  §2 driver smoke: one 5-day seed runs the survey driver end to
//      end (exit 0, 0 instrument errors, corpus file self-describes
//      mode/arm/substrate flags); the smoke corpus is deleted
//      afterwards, so the test leaves no files behind.
//  §3 substrate honesty: the driver refuses a wrong MODE and the
//      analyzer refuses a non-rageholder corpus (mislabel guards).
//  §4 D1 repeatability: the same seed run twice at 30d gives
//      identical encounter + holder counts (the survey verdict rests
//      on counts, so the counts must be deterministic).
// Usage: node scripts/test-rageholder-survey-b.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execFileSync, spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');

let total = 0, passed = 0;
function check(name, cond) {
  total++;
  if (cond) { passed++; }
  else console.log('FAIL: ' + name);
}

function baseEnv(over) {
  return Object.assign({}, process.env, {
    SENSEEXPED: '1', PARTYSIZE4: '1', VETREENGAGE: '1', FLEEREPAIR2: '1', FIGHTALLY2: '1',
    MODE: 'rageholder', RUN: 'rageholder-survey-b-smoke',
  }, over || {});
}

function runDriver(outdir, seeds, days, run) {
  const env = baseEnv({ OUTDIR: outdir, SEEDS: seeds, DAYS: String(days), RUN: run });
  return spawnSync('node', [path.join(REPO, 'scripts', 'rageholder-driver-b.js')], { cwd: REPO, env: env, encoding: 'utf8', timeout: 300000 });
}

function readCorpusFile(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return /\.json$/.test(f); });
  if (files.length !== 1) return { files: files, data: null };
  let d = null;
  try { d = JSON.parse(fs.readFileSync(path.join(dir, files[0]), 'utf8')); } catch (e) {}
  return { files: files, data: d };
}

// §1 — analyzer selftest (subprocess; must exit 0).
try {
  const out = execFileSync('node', [path.join(REPO, 'scripts', 'analyze-rageholder-survey-b.js'), '--selftest'], { cwd: REPO, encoding: 'utf8' });
  check('§1 analyzer --selftest 6/6', /6 passed, 0 failed/.test(out));
} catch (e) {
  check('§1 analyzer --selftest 6/6', false);
  console.log('  selftest output: ' + String((e.stdout || '') + (e.stderr || '')).slice(0, 500));
}

// §2 — driver smoke (5 days, seed 106121, throwaway corpus dir).
const SMOKE_DIR = path.join(REPO, 'evidence', '2026-11-19', 'perseed-rageholder-survey-b-smoke');
try { fs.rmSync(SMOKE_DIR, { recursive: true, force: true }); } catch (e) {}
let smoke = runDriver('perseed-rageholder-survey-b-smoke', '106121', 5, 'rageholder-survey-b-smoke');
check('§2 driver smoke exits 0', smoke.status === 0);
if (smoke.status !== 0) console.log('  smoke stderr: ' + String(smoke.stderr || '').slice(0, 800));
let s = { files: [], data: null };
try { s = readCorpusFile(SMOKE_DIR); } catch (e) {}
check('§2 driver smoke writes exactly 1 corpus file', s.files.length === 1);
if (s.files.length === 1) {
  const d = s.data;
  check('§2 corpus file self-describes mode/arm', !!d && d.mode === 'rageholder' && d.arm === 'rageholder-survey-b' && d.seed === 106121);
  check('§2 corpus file self-describes substrate', !!d && d.senseexpedPresent === true && d.fightally2Present === true && d.ragePresent === true && d.senseexpedFlag === '1' && d.fightally2Flag === '1');
  check('§2 corpus file has 0 instrument errors', !!d && (d.instrumentErrors || []).length === 0);
  check('§2 corpus file carries v4encounters array', !!d && Array.isArray(d.v4encounters));
  check('§2 corpus file carries wall fields', !!d && d.days === 5 && typeof d.scaleRank === 'string' && (d.maxWave | 0) >= 1);
}
try { fs.rmSync(SMOKE_DIR, { recursive: true, force: true }); } catch (e) {}
check('§2 smoke corpus deleted afterwards', !fs.existsSync(SMOKE_DIR));

// §3 — mislabel guards.
let badMode = spawnSync('node', [path.join(REPO, 'scripts', 'rageholder-driver-b.js')], { cwd: REPO, env: baseEnv({ MODE: 'wrong', OUTDIR: 'perseed-rageholder-survey-b-smoke', SEEDS: '106121', DAYS: '5' }), encoding: 'utf8', timeout: 60000 });
check('§3 driver refuses wrong MODE', badMode.status !== 0 && /MODE must be rageholder/.test(String(badMode.stderr || '')));
// Analyzer refuses a non-rageholder corpus: point it at the
// laterage corpus dir (same date, different arm).
let badCorpus = spawnSync('node', [path.join(REPO, 'scripts', 'analyze-rageholder-survey-b.js'), path.join(REPO, 'evidence', '2026-11-19', 'perseed-laterage-b')], { cwd: REPO, encoding: 'utf8', timeout: 60000 });
check('§3 analyzer refuses non-rageholder corpus', badCorpus.status !== 0 && /CORPUS MISMATCH/.test(String(badCorpus.stderr || '') + String(badCorpus.stdout || '')));

// §4 — D1 repeatability: same seed, 30d, twice; counts identical.
const D1A = path.join(REPO, 'evidence', '2026-11-19', 'perseed-rageholder-survey-b-d1a');
const D1B = path.join(REPO, 'evidence', '2026-11-19', 'perseed-rageholder-survey-b-d1b');
try { fs.rmSync(D1A, { recursive: true, force: true }); } catch (e) {}
try { fs.rmSync(D1B, { recursive: true, force: true }); } catch (e) {}
const d1a = runDriver('perseed-rageholder-survey-b-d1a', '106121', 30, 'rageholder-survey-b-d1a');
const d1b = runDriver('perseed-rageholder-survey-b-d1b', '106121', 30, 'rageholder-survey-b-d1b');
check('§4 D1 runs exit 0', d1a.status === 0 && d1b.status === 0);
let da = null, db = null;
try { da = readCorpusFile(D1A).data; } catch (e) {}
try { db = readCorpusFile(D1B).data; } catch (e) {}
if (da && db) {
  const holders = function (d) { return (d.v4encounters || []).filter(function (e) { return e.holdsRage; }).length; };
  check('§4 D1 identical encounter counts', (da.v4encounters || []).length === (db.v4encounters || []).length);
  check('§4 D1 identical holder counts', holders(da) === holders(db));
  check('§4 D1 identical fired counts', (da.v4encounters || []).filter(function (e) { return e.rageFired; }).length === (db.v4encounters || []).filter(function (e) { return e.rageFired; }).length);
} else {
  check('§4 D1 identical encounter counts', false);
  check('§4 D1 identical holder counts', false);
  check('§4 D1 identical fired counts', false);
}
try { fs.rmSync(D1A, { recursive: true, force: true }); } catch (e) {}
try { fs.rmSync(D1B, { recursive: true, force: true }); } catch (e) {}
check('§4 D1 corpora deleted afterwards', !fs.existsSync(D1A) && !fs.existsSync(D1B));

console.log('test-rageholder-survey-b: ' + passed + '/' + total + ' passed');
if (passed !== total) process.exit(1);

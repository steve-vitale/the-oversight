// test-laterage-b.js — proof test, arm sim-laterage-b.
// Proves the instrument, not the verdict:
//  §1 analyzer selftest (fire-round + post-fire-delay taxonomy,
//      16 checks incl. the Fatima d118 shape, morale-hold
//      non-attribution, never-lands, multi-fire / undoubled /
//      strike-on-fire-round anomalies, summarize rates).
//  §2 driver smoke: one 5-day seed runs the judged driver end to
//      end (exit 0, 0 instrument errors, corpus file self-describes
//      mode/arm/substrate flags); the smoke corpus is deleted
//      afterwards, so the test leaves no files behind.
//  §3 substrate honesty: the driver refuses a wrong MODE and the
//      analyzer refuses a non-laterage corpus (mislabel guards).
// Usage: node scripts/test-laterage-b.js
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

// §1 — analyzer selftest (subprocess; must exit 0).
try {
  const out = execFileSync('node', [path.join(REPO, 'scripts', 'analyze-laterage-b.js'), '--selftest'], { cwd: REPO, encoding: 'utf8' });
  check('§1 analyzer --selftest 16/16', /16 passed, 0 failed/.test(out));
} catch (e) {
  check('§1 analyzer --selftest 16/16', false);
  console.log('  selftest output: ' + String((e.stdout || '') + (e.stderr || '')).slice(0, 500));
}

// §2 — driver smoke (5 days, seed 106111, throwaway corpus dir).
const SMOKE_DIR = path.join(REPO, 'evidence', '2026-11-19', 'perseed-laterage-b-smoke');
try { fs.rmSync(SMOKE_DIR, { recursive: true, force: true }); } catch (e) {}
const env = Object.assign({}, process.env, {
  SENSEEXPED: '1', PARTYSIZE4: '1', VETREENGAGE: '1', FLEEREPAIR2: '1', FIGHTALLY2: '1',
  MODE: 'laterage', OUTDIR: 'perseed-laterage-b-smoke', SEEDS: '106111', DAYS: '5', RUN: 'laterage-b-smoke',
});
let smoke = spawnSync('node', [path.join(REPO, 'scripts', 'laterage-driver-b.js')], { cwd: REPO, env: env, encoding: 'utf8', timeout: 300000 });
check('§2 driver smoke exits 0', smoke.status === 0);
if (smoke.status !== 0) console.log('  smoke stderr: ' + String(smoke.stderr || '').slice(0, 800));
let smokeFiles = [];
try { smokeFiles = fs.readdirSync(SMOKE_DIR).filter(function (f) { return /\.json$/.test(f); }); } catch (e) {}
check('§2 driver smoke writes exactly 1 corpus file', smokeFiles.length === 1);
if (smokeFiles.length === 1) {
  let d = null;
  try { d = JSON.parse(fs.readFileSync(path.join(SMOKE_DIR, smokeFiles[0]), 'utf8')); } catch (e) {}
  check('§2 corpus file self-describes mode/arm', !!d && d.mode === 'laterage' && d.arm === 'laterage-b' && d.seed === 106111);
  check('§2 corpus file self-describes substrate', !!d && d.senseexpedPresent === true && d.fightally2Present === true && d.ragePresent === true && d.senseexpedFlag === '1' && d.fightally2Flag === '1');
  check('§2 corpus file has 0 instrument errors', !!d && (d.instrumentErrors || []).length === 0);
  check('§2 corpus file carries v4encounters array', !!d && Array.isArray(d.v4encounters));
  check('§2 corpus file carries wall fields', !!d && d.days === 5 && typeof d.scaleRank === 'string' && (d.maxWave | 0) >= 1);
}
try { fs.rmSync(SMOKE_DIR, { recursive: true, force: true }); } catch (e) {}
check('§2 smoke corpus deleted afterwards', !fs.existsSync(SMOKE_DIR));

// §3 — mislabel guards.
let badMode = spawnSync('node', [path.join(REPO, 'scripts', 'laterage-driver-b.js')], { cwd: REPO, env: Object.assign({}, env, { MODE: 'wrong' }), encoding: 'utf8', timeout: 60000 });
check('§3 driver refuses wrong MODE', badMode.status !== 0 && /MODE must be laterage/.test(String(badMode.stderr || '')));
// Analyzer refuses a non-laterage corpus: point it at the
// freestrike corpus dir (same date, different arm).
let badCorpus = spawnSync('node', [path.join(REPO, 'scripts', 'analyze-laterage-b.js'), '--dir', path.join(REPO, 'evidence', '2026-11-19', 'perseed-freestrike-b-ctl')], { cwd: REPO, encoding: 'utf8', timeout: 60000 });
check('§3 analyzer refuses non-laterage corpus', badCorpus.status !== 0 && /CORPUS MISMATCH/.test(String(badCorpus.stderr || '') + String(badCorpus.stdout || '')));

console.log('test-laterage-b: ' + passed + '/' + total + ' passed');
if (passed !== total) process.exit(1);

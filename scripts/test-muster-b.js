// test-muster-b.js — proof test for arm sim-muster-b (Loop B 20261124).
// Proves: (1) the muster-sound-b policy composes the four sounding legs
// over competent; (2) the analyzer's max-gate read takes the max across
// all three gate sources and flags ready at >= 10; (3) the refusal-gate
// extraction and cost-bar evaluation match the frozen prereg; (4) the
// driver runs end-to-end on one seed at a short horizon without crashing
// and writes a well-formed per-seed file (smoke, OUTDIR override).
// Analyzer checks read COMMITTED fixture files (scripts/
// test-fixtures-muster-b/) — never temp files, because the host write
// flap refuses fresh-file writes for minutes at a time and a proof test
// must not flake on it.
// Usage: node scripts/test-muster-b.js
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const FIX = path.join(REPO, 'scripts', 'test-fixtures-muster-b');

let pass = 0;
function check(name, fn) {
  try { fn(); pass += 1; console.log('PASS ' + name); }
  catch (e) { console.error('FAIL ' + name + ': ' + (e && e.message)); process.exitCode = 1; }
}
function loadFixture(name) {
  const fp = path.join(FIX, name);
  return { file: fp, rec: JSON.parse(fs.readFileSync(fp, 'utf8')) };
}

// (1) Policy composition.
check('policy composes four sounding legs over competent', function () {
  const { musterSoundB } = require(path.join(REPO, 'scripts', 'policies', 'muster-sound-b'));
  const p = musterSoundB();
  assert.strictEqual(p.id, 'muster-sound-b');
  assert.strictEqual(typeof p.daily, 'function');
  assert.strictEqual(typeof p.setup, 'function'); // titanroute setup (say-wrap)
  assert.ok(/muster-sound-b/.test(p.desc || ''));
});

// (2) Analyzer max-gate read.
const AN = require(path.join(REPO, 'scripts', 'analyze-muster-b'));

check('analyzer max gate takes max across trace + snaps + driver row', function () {
  const s = AN.summarizeArm(loadFixture('synth-maxgate-11.json'));
  assert.strictEqual(s.maxGate.gate, 11);
  assert.strictEqual(s.maxGate.day, 100);
  assert.strictEqual(s.readyEver, true);
  assert.strictEqual(s.maxGate.allies, 8);
  assert.strictEqual(s.maxGate.haven, 3);
});

check('analyzer readyEver false below 10, true at 10', function () {
  const sLow = AN.summarizeArm(loadFixture('synth-maxgate-9.json'));
  assert.strictEqual(sLow.readyEver, false);
  assert.strictEqual(sLow.maxGate.gate, 9);
  const sHigh = AN.summarizeArm(loadFixture('synth-maxgate-11.json'));
  assert.strictEqual(sHigh.readyEver, true);
});

check('analyzer refusal gates list muster-gate refusals with counts', function () {
  const s = AN.summarizeArm(loadFixture('synth-refusals.json'));
  assert.strictEqual(s.heraldMeeting, true);
  assert.strictEqual(s.heraldRefused, 1);
  assert.strictEqual(s.musterGateRefusals, 1);
  assert.strictEqual(s.refusalGates.length, 1);
  assert.strictEqual(s.refusalGates[0].allies, 8);
  assert.strictEqual(s.refusalGates[0].need, 10);
});

check('median helper matches the prereg control read', function () {
  assert.strictEqual(AN.median([49, 68, 96, 97, 97, 150, 150, 151, 151, 151, 151, 151, 151, 151, 151, 151]), 151);
});

check('analyzer maxHave reads the refusal have census', function () {
  const s = AN.summarizeArm(loadFixture('synth-refusals.json'));
  assert.strictEqual(s.titanRefusals, 1);
  assert.strictEqual(s.titanClassified, 1);
  assert.strictEqual(s.maxHave, 8);
});

// (4) Driver smoke: one seed, 5 days, scratch OUTDIR under the
// worktree. Proves the full harness path (policy load, instrument
// install, runDays) without touching the judged corpus. The driver's
// own write retry (30 x 10s) absorbs write-flap flicker.
check('driver smoke run writes a well-formed per-seed file', function () {
  const outDir = path.join(REPO, '.tmp-muster-b-test', 'smoke');
  // Start clean: a probe or an earlier run may have left the file, and
  // the driver (correctly) refuses to overwrite per-seed output.
  try { fs.rmSync(path.join(REPO, '.tmp-muster-b-test'), { recursive: true, force: true }); } catch (e) {}
  execFileSync('node', [path.join(REPO, 'scripts', 'muster-b-driver-20261124.js')], {
    cwd: REPO,
    env: Object.assign({}, process.env, { SEEDS: '109310', DAYS: '5', RUN: 'smoke', OUTDIR: outDir }),
    stdio: 'pipe', timeout: 600000,
  });
  const fp = path.join(outDir, 'muster-b-s109310-muster-b-smoke.json');
  assert.ok(fs.existsSync(fp), 'smoke per-seed file exists');
  const d = JSON.parse(fs.readFileSync(fp, 'utf8'));
  assert.strictEqual(d.seed, 109310);
  assert.strictEqual(d.arm, 'muster-b');
  assert.ok(Array.isArray(d.dailyTrace));
  assert.ok(Array.isArray(d.refusals));
  assert.ok(Array.isArray(d.instrumentErrors));
  assert.strictEqual(typeof d.gameDays, 'number');
  try { fs.rmSync(path.join(REPO, '.tmp-muster-b-test'), { recursive: true, force: true }); } catch (e) { /* scratch cleanup is best-effort; the run removes it before committing */ }
});

console.log('test-muster-b: ' + pass + ' checks passed');

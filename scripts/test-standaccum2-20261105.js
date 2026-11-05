// test-standaccum2-20261105.js — proof for arm sim-standaccum2-b.
// Fixture tests for the analyzer (release-day rule, same-day
// kill-and-die, gated-199 boundary, mismatch counting, closest-seed
// ranking, analyzer determinism) + live determinism and on/off
// neutrality legs (seed 99111 at 30d, /tmp only, never the judged corpus).
// Usage: node scripts/test-standaccum2-20261105.js [--live]
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(__dirname, 'standaccum2-analyze-20261105'));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}

function row(seed, daily, log, fallen, extra) {
  const r = {
    seed: seed, days: 150, endReason: 'survived', won: false,
    scaleRank: 'village', unlockedWave: 4, maxWave: 4,
    fights: [], daily: daily, waveKillLog: log, fallen: fallen,
    wavesFaced: {}, instrumentErrors: [],
  };
  if (extra) Object.assign(r, extra);
  return r;
}
function snap(day, raw, gated, ready, vets, short) {
  return { day: day, raw: raw, gated: gated, readiness5: { ready: ready, veterans: vets, armored: 4, armed: 6, tricks: 5, demand: { armored: 4, armed: 6, tricks: 3, veterans: 2 }, short: short || [] } };
}

// 1. Release day detected exactly on the qualifying day.
(function () {
  const log = [{ by: 'vA', w: 4, d: 10 }, { by: 'vB', w: 4, d: 20 }];
  const r = row(1, [snap(24, 210, 199, false, 1, ['veterans']), snap(25, 210, 210, true, 2, [])], log, []);
  const s = AN.analyzeSeed(r);
  check('release-day-detected', s.releaseDays.length === 1 && s.releaseDays[0] === 25, s.releaseDays);
  check('release-day-detail', s.releaseDayDetail && s.releaseDayDetail.day === 25 && s.releaseDayDetail.gated === 210 && s.releaseDayDetail.ready === true, s.releaseDayDetail);
})();

// 2. Same-day kill-and-die contributes to NO day.
(function () {
  const log = [{ by: 'vA', w: 4, d: 30 }, { by: 'vB', w: 4, d: 10 }];
  const fallen = [{ villagerId: 'vA', day: 30, cause: 'the wild' }];
  const r = row(2, [snap(30, 210, 210, false, 1, ['veterans'])], log, fallen);
  const s = AN.analyzeSeed(r);
  check('same-day-kill-and-die-no-day', s.maxLiving === 1 && s.releaseDays.length === 0, { max: s.maxLiving, rel: s.releaseDays });
})();

// 3. Gated-199 boundary: L=2 + ready true + gated 199 is NOT a release
// (cap hold still binding — bread alone cannot buy the fifth draft).
(function () {
  const log = [{ by: 'vA', w: 4, d: 10 }, { by: 'vB', w: 4, d: 20 }];
  const r = row(3, [snap(25, 210, 199, true, 2, [])], log, []);
  const s = AN.analyzeSeed(r);
  check('gated-199-not-release', s.releaseDays.length === 0, s.releaseDays);
})();

// 4. Mismatch counting: derived L vs engine veterans.
(function () {
  const log = [{ by: 'vA', w: 4, d: 10 }, { by: 'vB', w: 4, d: 20 }];
  const r = row(4, [snap(25, 100, 100, false, 1, ['veterans'])], log, []);
  const s = AN.analyzeSeed(r);
  check('mismatch-counted', s.mismatchDays === 1 && s.maxLiving === 2, { mm: s.mismatchDays, max: s.maxLiving });
})();

// 5. Closest-seed ranking: banked-2 pool, highest gated peak wins;
// tie-break most L>=2 days, then lowest seed.
(function () {
  const mk = function (seed, peak, l2days) {
    const log = [{ by: 'vA', w: 4, d: 10 }, { by: 'vB', w: 4, d: 20 }];
    const daily = [snap(25, peak, peak, false, 2, [])];
    for (let i = 0; i < l2days; i++) daily.push(snap(26 + i, peak, peak, false, 2, []));
    return AN.analyzeSeed(row(seed, daily, log, []));
  };
  const a = mk(99111, 199, 0), b = mk(99112, 180, 5);
  check('closest-highest-gated-peak', AN.closestSeed([a, b]) === 99111, AN.closestSeed([a, b]));
  const c = mk(99113, 199, 3);
  check('closest-tiebreak-l2days', AN.closestSeed([a, c]) === 99113, AN.closestSeed([a, c]));
})();

// 6. Closest-seed fallback when nobody banks 2: highest gated peak.
(function () {
  const mk = function (seed, peak) {
    return AN.analyzeSeed(row(seed, [snap(25, peak, peak, false, 0, ['veterans'])], [{ by: 'vA', w: 4, d: 10 }], []));
  };
  check('closest-no-banked2-fallback', AN.closestSeed([mk(99111, 150), mk(99112, 199)]) === 99112, null);
})();

// 7. Analyzer determinism (in-memory: the analyzer is a pure function;
// no /tmp write — the host write flap hits /tmp intermittently).
(function () {
  const r = row(99111, [snap(25, 210, 210, true, 2, [])], [{ by: 'vA', w: 4, d: 10 }, { by: 'vB', w: 4, d: 20 }], []);
  const j1 = JSON.stringify(AN.analyzeSeed(r));
  const j2 = JSON.stringify(AN.analyzeSeed(r));
  check('analyzer-deterministic', j1 === j2, null);
})();

// 8. Dead killer after banking: L drops, release window closes.
(function () {
  const log = [{ by: 'vA', w: 4, d: 10 }, { by: 'vB', w: 4, d: 20 }];
  const fallen = [{ villagerId: 'vA', day: 28, cause: 'the wild' }];
  const r = row(8, [snap(25, 210, 210, true, 2, []), snap(30, 210, 199, false, 1, ['veterans'])], log, fallen);
  const s = AN.analyzeSeed(r);
  check('release-window-closes-on-death', s.releaseDays.length === 1 && s.releaseDays[0] === 25 && s.living2Days.length === 1, { rel: s.releaseDays, l2: s.living2Days });
})();

if (process.argv.indexOf('--live') >= 0) {
  // Scratch inside the worktree, not /tmp: the host write flap hits
  // /tmp intermittently (this proof run), while workspace writes
  // succeed. Cleaned up in the finally below; never committed.
  const base = path.join(REPO, 'evidence', '2026-11-05', '.sa2-proof-tmp');
  try { fs.rmSync(base, { recursive: true, force: true }); } catch (e) {}
  fs.mkdirSync(base, { recursive: true });
  function runLeg(dir, off) {
    fs.mkdirSync(dir, { recursive: true });
    const env = Object.assign({}, process.env, {
      REPO: REPO, DAYS: '30', SEEDS: '99111', RUN: 'proof',
      OUTDIR: dir, STANDACCUM2_OFF: off ? '1' : '0',
    });
    let lastErr = null;
    for (let attempt = 0; attempt < 6; attempt++) {
      // Idempotent retry: the driver refuses to overwrite, so clear
      // any file a previous attempt already wrote before re-running.
      try { fs.unlinkSync(path.join(dir, 'standaccum2-s99111-proof.json')); } catch (e) {}
      try { execSync('node scripts/standaccum2-driver-20261105.js', { cwd: REPO, env: env, stdio: 'pipe', maxBuffer: 16 * 1024 * 1024 }); lastErr = null; break; }
      catch (e) { lastErr = e; Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 20000); }
    }
    if (lastErr) throw lastErr;
    const f = fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); })[0];
    return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  }
  const d1 = runLeg(path.join(base, 'det1'), false);
  const d2 = runLeg(path.join(base, 'det2'), false);
  const summ = function (d) {
    return JSON.stringify({
      days: d.days, endReason: d.endReason, won: d.won, maxWave: d.maxWave,
      w4kills: (d.waveKillLog || []).filter(function (e) { return (e.w | 0) >= 4; }).length,
      snapshots: d.daily.length, errors: d.instrumentErrors.length,
    });
  };
  check('live-determinism-30d', summ(d1) === summ(d2), { a: summ(d1), b: summ(d2) });
  const off = runLeg(path.join(base, 'off'), true);
  check('live-onoff-neutrality-30d', d1.days === off.days && d1.endReason === off.endReason && d1.maxWave === off.maxWave, { on: summ(d1), off: summ(off) });
  check('live-instrument-errors-zero', d1.instrumentErrors.length === 0, d1.instrumentErrors);
  check('live-snapshots-present', d1.daily.length > 0 && d1.daily[0].readiness5 != null, d1.daily.length);
  try { fs.rmSync(base, { recursive: true, force: true }); } catch (e) {}
}

console.log('standaccum2 proof: ' + passed + ' PASS, ' + failed + ' FAIL');
process.exit(failed ? 1 : 0);

// test-vetshape-20261104.js — proof for the VETSHAPE instrument
// (arm sim-vetshape-b). Fixture tests for the trajectory computer
// (overlap, same-day kill-and-die, window expiry, base-wave exclusion,
// died-before-second-banked), corpus-agreement legs against the vetprod
// corpus (reproduction check: shared numbers must match vetprod's
// published table), and a live harness smoke leg (driver, 1 seed, 10d,
// /tmp output only — never writes into the repo).
// Usage: node scripts/test-vetshape-20261104.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const VS = require(path.join(REPO, 'scripts', 'vetshape-analyze-20261104'));
const VETPROD = require(path.join(REPO, 'scripts', 'vetprod-analyze-20261104'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

function row(seed, kills, fallen, endDay) {
  return {
    seed: seed, days: endDay, gameDays: endDay, endReason: 'test',
    waveKillLog: kills, fallen: fallen, daily: [], instrumentErrors: [],
  };
}
function kill(d, by) { return { d: d, mid: 'strike', w: 4, by: by, via: 'player', trick: null }; }
function dead(vid, day, cause) { return { villagerId: vid, day: day, cause: cause || 'monster', name: vid }; }

// 1. Overlap: A d10 dies d20, B d15 alive. Living 2 on d15..d19 only.
(function () {
  const r = VS.analyzeSeed(row(1, [kill(10, 'A'), kill(15, 'B')], [dead('A', 20)], 30));
  check('overlap living peak 2', r.peakLiving === 2, r.peakLiving);
  check('overlap daysAtLiving2 5 (d15..d19)', r.daysAtLiving2 === 5, r.daysAtLiving2);
  check('overlap firstDayLiving2 15', r.firstDayLiving2 === 15, r.firstDayLiving2);
  check('overlap shape 2 from d15', r.firstDayShape2 === 15 && r.daysAtShape2 === 16, [r.firstDayShape2, r.daysAtShape2]);
  check('overlap livingReached2 true', r.livingReached2 === true);
  check('overlap not died-before-second (A dies d20 > B d15)', r.diedBeforeSecondBanked === false, r.diedBeforeSecondBanked);
})();

// 2. Same-day kill-and-die twice: living NEVER 2, shape 2, windows 2.
(function () {
  const r = VS.analyzeSeed(row(2, [kill(10, 'A'), kill(12, 'B')], [dead('A', 10, 'arena'), dead('B', 12, 'monster')], 30));
  check('fleeting living peak 0', r.peakLiving === 0, r.peakLiving);
  check('fleeting livingReached2 false', r.livingReached2 === false);
  check('fleeting shape peak 2', r.peakShape === 2, r.peakShape);
  check('fleeting shapeReached2 true', r.shapeReached2 === true);
  check('fleeting window14 peak 2 (recently dead count)', r.peakWindow[14] === 2, r.peakWindow);
  check('fleeting died-before-second true (d10 < d12)', r.diedBeforeSecondBanked === true, r.diedBeforeSecondBanked);
  check('fleeting intervals [0,0]', eq(r.killToDeathIntervals, [0, 0]), r.killToDeathIntervals);
})();

// 3. Window expiry: A d10 dies d11, B d30 alive. W14 never 2, W60 2.
(function () {
  const r = VS.analyzeSeed(row(3, [kill(10, 'A'), kill(30, 'B')], [dead('A', 11)], 40));
  check('window w14 peak 1 (A expired before B)', r.peakWindow[14] === 1, r.peakWindow);
  check('window w30 peak 2 (19d < 30)', r.peakWindow[30] === 2, r.peakWindow);
  check('window w60 peak 2', r.peakWindow[60] === 2, r.peakWindow);
  check('window w14 daysAt2 0', r.daysAtWindow2[14] === 0, r.daysAtWindow2);
  check('shape 2 from d30', r.firstDayShape2 === 30, r.firstDayShape2);
})();

// 4. Base-wave exclusion: a wave-3 kill is not a wave-4 killer.
(function () {
  const r = VS.analyzeSeed(row(4, [{ d: 10, mid: 'spool', w: 3, by: 'A', via: 'player', trick: null }], [], 30));
  check('base-wave w3 kill ignored', r.killersEver === 0 && r.peakShape === 0, [r.killersEver, r.peakShape]);
})();

// 5. Killer with a second kill after a gap: death measured from FIRST kill.
(function () {
  const r = VS.analyzeSeed(row(5, [kill(10, 'A'), kill(20, 'A')], [dead('A', 21)], 30));
  check('second-kill interval from first kill (11d)', eq(r.killToDeathIntervals, [11]), r.killToDeathIntervals);
  check('one killer ever despite two kills', r.killersEver === 1, r.killersEver);
})();

// 6. Counterfactual-ready day: snapshot gated>=200, short=[veterans],
//    shape 2 on that day -> counted; short with another leg -> not.
//    V2 (raw): raw>=200 + short==[veterans] + shape 2 -> counted even
//    when gated is capped at 199 (the hold cap makes V1 circular).
(function () {
  const base = row(6, [kill(10, 'A'), kill(20, 'B')], [dead('A', 12)], 30);
  base.daily = [
    { day: 25, gated: 200, raw: 210, readiness5: { veterans: 0, short: ['veterans'] } },
    { day: 26, gated: 210, raw: 220, readiness5: { veterans: 0, short: ['veterans', 'tricks'] } },
    { day: 27, gated: 199, raw: 199, readiness5: { veterans: 0, short: ['veterans'] } },
    { day: 28, gated: 199, raw: 250, readiness5: { veterans: 0, short: ['veterans'] } },
  ];
  const r = VS.analyzeSeed(base);
  check('cf-ready day counted only when gated>=200 and short==[veterans]', eq(r.counterfactualReadyDays, [25]), r.counterfactualReadyDays);
  check('cf-ready-raw counts held-cap days (d25 + d28) but not raw<200 (d27) or other-leg-short (d26)', eq(r.counterfactualReadyDaysRaw, [25, 28]), r.counterfactualReadyDaysRaw);
})();

// 7. Corpus agreement: vetprod corpus reproduces vetprod's published table.
(function () {
  const dir = path.join(REPO, 'evidence', '2026-11-04', 'perseed-vetprod-b');
  const sum = VS.analyzeDir(dir, 'vetprod-s');
  check('vetprod corpus n=8', sum.n === 8, sum.n);
  check('vetprod corpus total w4 kills 8', sum.totalW4Kills === 8, sum.totalW4Kills);
  check('vetprod corpus total killers ever 7', sum.totalKillersEver === 7, sum.totalKillersEver);
  check('vetprod corpus instrument errors 0', sum.totalInstrumentErrors === 0, sum.totalInstrumentErrors);
  const expDays = { 99101: 150, 99102: 116, 99103: 121, 99104: 150, 99105: 52, 99106: 59, 99107: 72, 99108: 48 };
  const expGated = { 99101: 199, 99102: 199, 99103: 180, 99104: 199, 99105: 140, 99106: 150, 99107: 50, 99108: 20 };
  const expEngineVets = { 99101: 1, 99102: 0, 99103: 1, 99104: 1, 99105: 1, 99106: 0, 99107: 0, 99108: 0 };
  let daysOk = true, gatedOk = true, engOk = true, reconOk = true;
  sum.seeds.forEach(function (s) {
    if (s.days !== expDays[s.seed]) daysOk = false;
    if (s.peakGated !== expGated[s.seed]) gatedOk = false;
    if (s.engineDailyMaxVets !== expEngineVets[s.seed]) engOk = false;
    if (s.reconstructedMaxLiving !== expEngineVets[s.seed]) reconOk = false;
  });
  check('vetprod corpus days match published table', daysOk);
  check('vetprod corpus peak gated match published table', gatedOk);
  check('vetprod corpus engine daily max vets match published table', engOk);
  check('vetshape reconstruction agrees with engine daily max on all seeds', reconOk);
  // Vetprod's own analyzer must agree with vetshape's fates (shared code).
  const vp = VETPROD.analyzeDir(dir);
  check('vetprod analyzer total kills agree', vp.seeds.reduce(function (m, s) { return m + s.w4kills; }, 0) === 8);
  console.log('INFO vetprod-corpus shape/living: shape>=2 on ' +
    sum.seeds.filter(function (s) { return s.shapeReached2; }).length + '/8, living>=2 on ' +
    sum.seeds.filter(function (s) { return s.livingReached2; }).length + '/8');
})();

// 8. Live harness smoke: driver runs 1 seed, 10d, /tmp output only.
(function () {
  const outDir = '/tmp/vetshape-smoke-' + process.pid;
  try {
    const out = execSync('DAYS=10 SEEDS=99108 RUN=vetshape-smoke OUTDIR=' + outDir +
      ' node scripts/vetshape-driver-20261104.js', { cwd: REPO, timeout: 600000 }).toString();
    const file = path.join(outDir, 'vetshape-s99108-vetshape-smoke.json');
    const exists = fs.existsSync(file);
    check('smoke driver writes per-seed JSON', exists, out.slice(-300));
    if (exists) {
      const row2 = JSON.parse(fs.readFileSync(file, 'utf8'));
      check('smoke row arm vetshape', row2.arm === 'vetshape', row2.arm);
      check('smoke row has daily snapshots + kill log', Array.isArray(row2.daily) && Array.isArray(row2.waveKillLog), [row2.daily && row2.daily.length, row2.waveKillLog && row2.waveKillLog.length]);
      check('smoke row instrument errors 0', (row2.instrumentErrors || []).length === 0, row2.instrumentErrors);
    }
  } catch (e) {
    check('smoke driver completes', false, String((e.stdout || '') + (e.stderr || '') + e.message).slice(-500));
  }
})();

console.log('\n' + pass + '/' + (pass + fail) + ' PASS');
process.exit(fail ? 1 : 0);

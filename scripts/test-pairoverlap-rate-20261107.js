// test-pairoverlap-rate-20261107.js — proof for the rate
// instrument (arm sim-pairoverlap-rate-b). The lever mechanism is
// already proven by scripts/test-pairoverlap-20261107.js (34/34
// PASS, re-run on this base); this test proves the NEW instrument
// only: starvation deaths per 100 village-days and its bar.
// Fixtures: rate arithmetic (including the zero-days guard),
// the rate-bar rule against the OLD arm's frozen numbers (the old
// confirm MUST fail the bar — the instrument is not a rescue
// re-score — and the old pilot MUST pass it), analyzer reuse
// (guardRows still catches a pre-yield divergence), and a live leg
// via the driver in /tmp (neutrality on seed 53001, feastdrive vs
// pairoverlap, with the rate computed from the two live corpora).
// Exit non-zero on any failure. The live leg writes nothing into
// the repo.
// Usage: node scripts/test-pairoverlap-rate-20261107.js
'use strict';
const path = require('path');
const fs = require('fs');
const cp = require('child_process');
const REPO = path.join(__dirname, '..');
const RATE = require(path.join(REPO, 'scripts', 'pairoverlap-rate-analyze-20261107'));
const ANALYZE = require(path.join(REPO, 'scripts', 'pairoverlap-analyze-20261107'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function close(a, b, eps) { return Math.abs(a - b) <= (eps || 1e-9); }
// The prereg's tolerance rule: TOL = max(0.15, 0.5 x baseline rate).
function tolFor(baselineRate) { return Math.max(0.15, 0.5 * baselineRate); }
function rateBarPass(baselineRate, armedRate) {
  return armedRate != null && baselineRate != null && armedRate <= baselineRate + tolFor(baselineRate);
}

// ---------- rate arithmetic ----------
(function () {
  check('rate-old-confirm-baseline', close(RATE.starveRate(3, 1239), 0.24213075060532688, 1e-9),
    'got ' + RATE.starveRate(3, 1239));
  check('rate-old-confirm-armed', close(RATE.starveRate(8, 1221), 0.6552006552006552, 1e-9),
    'got ' + RATE.starveRate(8, 1221));
  check('rate-old-pilot-baseline', close(RATE.starveRate(2, 974), 0.2053388090349076, 1e-9),
    'got ' + RATE.starveRate(2, 974));
  check('rate-old-pilot-armed', close(RATE.starveRate(3, 1026), 0.29239766081871343, 1e-9),
    'got ' + RATE.starveRate(3, 1026));
  check('rate-zero-deaths', RATE.starveRate(0, 100) === 0, 'got ' + RATE.starveRate(0, 100));
  check('rate-zero-days-unknown', RATE.starveRate(5, 0) === null, 'got ' + RATE.starveRate(5, 0));
  check('rate-one-per-400', close(RATE.starveRate(1, 400), 0.25, 1e-9), 'got ' + RATE.starveRate(1, 400));
  // rateSummary aggregates per-seed days/deaths (not medians).
  const s = RATE.rateSummary([
    { seed: 1, days: 141, starveDeaths: 4 },
    { seed: 2, days: 70, starveDeaths: 0 },
  ]);
  check('rate-summary-aggregates', s.villageDays === 211 && s.starveDeaths === 4 &&
    close(s.starveRate, 4 * 100 / 211, 1e-9) && s.perSeed.length === 2 &&
    close(s.perSeed[0].starveRate, 4 * 100 / 141, 1e-9),
    JSON.stringify(s));
  // One long-lived hungry seed (the 53303 shape: 4 deaths in 141
  // days) rates 2.84/100d on its own — the rate exposes it, while
  // the band rate stays honest about the other seeds.
  check('rate-exposes-long-lived-seed', close(RATE.starveRate(4, 141), 2.8368794326241136, 1e-9),
    'got ' + RATE.starveRate(4, 141));
})();

// ---------- rate-bar rule on the OLD arm's frozen numbers ----------
// These numbers are read from the frozen corpora, not hand-typed:
// loadCorpus over the committed pairoverlap-b corpora must reproduce
// the evidence file's rates exactly (0.24 vs 0.66 confirm).
(function () {
  const cb = ANALYZE.loadCorpus(path.join(REPO, 'evidence', '2026-11-07', 'perseed-pairoverlap-b-confirm-baseline'));
  const ca = ANALYZE.loadCorpus(path.join(REPO, 'evidence', '2026-11-07', 'perseed-pairoverlap-b-confirm-armed'));
  const rb = RATE.rateSummary(cb);
  const ra = RATE.rateSummary(ca);
  check('rate-frozen-confirm-corpora', rb.villageDays === 1239 && rb.starveDeaths === 3 &&
    ra.villageDays === 1221 && ra.starveDeaths === 8,
    JSON.stringify({ b: rb, a: ra }));
  // The old confirm MUST FAIL the rate bar: delta +0.41/100d against
  // a tolerance of max(0.15, 0.5 x 0.24) = 0.15. If this fixture
  // ever passes, the instrument has been loosened into a rescue.
  check('rate-bar-old-confirm-fails', rateBarPass(rb.starveRate, ra.starveRate) === false &&
    close(tolFor(rb.starveRate), 0.15, 1e-9),
    'baseline=' + rb.starveRate + ' armed=' + ra.starveRate + ' tol=' + tolFor(rb.starveRate));
  const pb = ANALYZE.loadCorpus(path.join(REPO, 'evidence', '2026-11-07', 'perseed-pairoverlap-b-baseline'));
  const pa = ANALYZE.loadCorpus(path.join(REPO, 'evidence', '2026-11-07', 'perseed-pairoverlap-b-armed'));
  const rpb = RATE.rateSummary(pb);
  const rpa = RATE.rateSummary(pa);
  check('rate-frozen-pilot-corpora', rpb.villageDays === 974 && rpb.starveDeaths === 2 &&
    rpa.villageDays === 1026 && rpa.starveDeaths === 3,
    JSON.stringify({ b: rpb, a: rpa }));
  // The old pilot MUST PASS the rate bar: delta +0.087/100d against
  // a tolerance of 0.15. The instrument admits a small cost on
  // longer-lived villages while catching the confirm's failure.
  check('rate-bar-old-pilot-passes', rateBarPass(rpb.starveRate, rpa.starveRate) === true,
    'baseline=' + rpb.starveRate + ' armed=' + rpa.starveRate + ' tol=' + tolFor(rpb.starveRate));
  // Tolerance rule shape: the floor binds on quiet baselines, the
  // slope binds on hungry ones.
  check('rate-tol-floor-binds', close(tolFor(0.10), 0.15, 1e-9), 'got ' + tolFor(0.10));
  check('rate-tol-slope-binds', close(tolFor(0.80), 0.40, 1e-9), 'got ' + tolFor(0.80));
})();

// ---------- analyzer reuse: the guard still guards ----------
(function () {
  const rows = function (days) { return days.map(function (d) { return { day: d, pairDay: d >= 5, feasts: d >= 3 ? 1 : 0 }; }); };
  const g = ANALYZE.guardRows(rows([1, 2, 3, 4, 5, 6]),
    [{ day: 1, pairDay: false, feasts: 0 }, { day: 2, pairDay: false, feasts: 0 },
     { day: 3, pairDay: false, feasts: 1 }, { day: 4, pairDay: false, feasts: 9 },
     { day: 5, pairDay: true, feasts: 1 }, { day: 6, pairDay: true, feasts: 1 }], 5);
  check('rate-guard-pre-yield-caught', g.pass === false && g.firstDiffDay === 4,
    JSON.stringify(g));
})();

// ---------- live leg via the driver (in /tmp) ----------
// Neutrality on 53001, feastdrive vs pairoverlap, 150d: daily rows
// exact before the first yield day, and the rate computed from the
// two live corpora (the instrument reads what the driver writes).
async function liveLegs() {
  const tmpBase = '/tmp/pairoverlap-rate-proof-baseline';
  const tmpArmed = '/tmp/pairoverlap-rate-proof-armed';
  [tmpBase, tmpArmed].forEach(function (d) { try { cp.execSync('rm -rf ' + d); } catch (e) {} });
  function runDriver(outdir, run, policy, seeds) {
    const env = Object.assign({}, process.env, { DAYS: '150', SEEDS: seeds, RUN: run, POLICY: policy, OUTDIR: outdir });
    cp.execSync('node scripts/pairoverlap-driver-20261107.js', { cwd: REPO, env: env, stdio: 'pipe', timeout: 900000 });
  }
  try {
    runDriver(tmpBase, 'pairoverlap-rate-proof-baseline', 'feastdrive', '53001');
    runDriver(tmpArmed, 'pairoverlap-rate-proof-armed', 'pairoverlap', '53001');
  } catch (e) {
    check('live-rate-runs', false, 'driver failed: ' + String((e && e.stdout) || (e && e.message) || e).slice(0, 400));
  }
  try {
    const b = JSON.parse(fs.readFileSync(tmpBase + '/pairoverlap-s53001-pairoverlap-rate-proof-baseline.json', 'utf8'));
    const a = JSON.parse(fs.readFileSync(tmpArmed + '/pairoverlap-s53001-pairoverlap-rate-proof-armed.json', 'utf8'));
    check('live-rate-runs', b.days > 0 && a.days > 0 && (b.instrumentErrors || []).length === 0 &&
      (a.instrumentErrors || []).length === 0,
      'days=' + b.days + '/' + a.days + ' errs=' + JSON.stringify(b.instrumentErrors) + '/' + JSON.stringify(a.instrumentErrors));
    const aFirstYield = (a.pairoverlapStats || {}).firstYieldDay;
    const g = ANALYZE.guardRows(b.daily || [], a.daily || [], aFirstYield);
    const overallOk = (g.firstDiffDayOverall == null) || (aFirstYield == null) ||
      ((g.firstDiffDayOverall | 0) >= (aFirstYield | 0));
    check('live-rate-neutrality', g.pass === true && overallOk,
      'firstDiff=' + g.firstDiffDay + ' overall=' + g.firstDiffDayOverall + ' firstYield=' + aFirstYield);
    check('live-rate-same-anchor', b.anchorCommit === a.anchorCommit && b.anchorCommit !== 'unknown',
      'anchors ' + b.anchorCommit + ' / ' + a.anchorCommit);
    // The rate instrument reads the live corpora: one seed each,
    // rates are finite (or null only if a seed lived zero days —
    // impossible here since days > 0 was just asserted).
    const rb = RATE.rateSummary([{ seed: b.seed, days: b.days,
      starveDeaths: Array.isArray(b.teleDeaths) ? b.teleDeaths.filter(function (d) { return /starv/i.test(((d.cause || '') + ' ' + (d.kind || ''))); }).length : 0 }]);
    const ra = RATE.rateSummary([{ seed: a.seed, days: a.days,
      starveDeaths: Array.isArray(a.teleDeaths) ? a.teleDeaths.filter(function (d) { return /starv/i.test(((d.cause || '') + ' ' + (d.kind || ''))); }).length : 0 }]);
    check('live-rate-computes', rb.starveRate != null && ra.starveRate != null &&
      rb.villageDays === b.days && ra.villageDays === a.days,
      'baseline=' + JSON.stringify(rb) + ' armed=' + JSON.stringify(ra));
    console.log('LIVE-RATE 53001: firstYieldDay=' + aFirstYield + ' yields=' +
      ((a.pairoverlapStats || {}).yields | 0) + ' baselineRate=' + rb.starveRate +
      ' armedRate=' + ra.starveRate + ' pairDays=' +
      (a.daily || []).filter(function (d) { return d.pairDay; }).length + ' (baseline ' +
      (b.daily || []).filter(function (d) { return d.pairDay; }).length + ')');
  } catch (e) {
    check('live-rate-reads', false, 'live corpus unreadable: ' + String((e && e.message) || e).slice(0, 200));
  }

  console.log(pass + '/' + (pass + fail) + ' PASS');
  process.exit(fail ? 1 : 0);
}
liveLegs().catch(function (e) { console.error(e.stack); process.exit(1); });

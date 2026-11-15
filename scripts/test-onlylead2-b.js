// test-onlylead2-b.js — proof for the covenant-road 200d arm sim-onlylead2-b
// (run fleshout-loop-b-20261115T1130Z). The covenant road on a 200d horizon:
// does the Founding Council stage when the policy walks it for 200 days?
//
// §1 STATIC (synthetic series): the analyzer's multi-gate classification
// (ONLYLEAD2 — `blockers` names EVERY failing gate, not just the first;
// `blocker` stays the first gate for backward compatibility) + the
// driver extensions (dirStem per RUN, LINK_LINES_CAP 900).
// §2 GAME (live 200d smoke on seed 100421, covenant leg, via the
// onlylead driver): the 200d instrument captures a full per-day series +
// shape-candidate roll with 0 instrument errors, and a determinism leg
// (same seed+policy twice → identical series). Seed 100421 is the
// probe's substrate-negative seed (competent-only: dead d93, max known
// opinion 8, never 10) — the smoke proves the 200d instrument on a
// short-lived village WITHOUT prejudging the pilot (no covenant beat
// can stage there; the pilot's GO count is untouched).
// Shared harness only (scripts/sim-harness.js via the driver) — never
// copied eval boilerplate; Math.random seeded BEFORE eval by the
// harness; Game.save never stubbed.
// Usage: node scripts/test-onlylead2-b.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { classifyShape, analyzeShapes } = require(path.join(REPO, 'scripts', 'analyze-onlylead-b'));
const { oneRun, dirStem, LINK_LINES_CAP } = require(path.join(REPO, 'scripts', 'onlylead-driver-20261115'));

let PASS = 0, FAIL = 0;
function check(name, cond, extra) {
  if (cond) { PASS++; console.log('  PASS ' + name); }
  else { FAIL++; console.log('  FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

// --- synthetic series builder (same shape as test-onlylead-b.js) --------
// daySpec: array of per-day overrides; each day defaults to a quiet
// village day (no candidates, no pending beat, rung day 62).
function mkRec(days, verbEvents) {
  const series = [];
  for (let d = 1; d <= days.length; d++) {
    const o = days[d - 1] || {};
    series.push({
      d: d,
      shapeCands: o.shapeCands || { lead: null, conquest: null, belong: null, covenant: null, trade: null },
      road: o.road || { nPrimSeas: 0, nConq: 0, nConqSeas: 0, nCovFormed: 0, nCovSeas: 0, nTradeFormed: 0, nTradeSeas: 0, bestBelong: null },
      netDay: 32, rungDay: 62, rungMet: d >= 62,
      pendingNational: o.pendingNational || null,
      nationalLive: !!o.nationalLive,
      scaleRefused: false, exiled: false,
    });
  }
  return { seed: 999998, policy: 'competent-covenant-b', days: days.length, series: series, verbEvents: verbEvents || [], instrumentErrors: [] };
}
function cand(shape, size) { return { shape: shape, size: size, primary: shape === 'belong' ? 'village_1' : 'haven', led: shape === 'lead' || shape === 'conquest' }; }
function road(o) {
  return { nPrimSeas: 0, nConq: 0, nConqSeas: 0, nCovFormed: 0, nCovSeas: 0, nTradeFormed: 0, nTradeSeas: 0, bestBelong: null, ...(o || {}) };
}
function quietDays(n) { const a = []; for (let i = 0; i < n; i++) a.push({}); return a; }

async function sectionStatic() {
  console.log('§1 static — multi-gate classification + driver extensions');
  // (a) belong double failure, 100404-like: trust 100, arrears 20,000,
  // age 33, foreign realm 3 — the DIAG named only arrears.
  {
    const days = quietDays(100);
    for (let i = 20; i < 100; i++) days[i] = { road: road({ bestBelong: { other: 'village_1', trust: 100, arrears: 20000, age: 33, foreignSize: 3 } }) };
    const r = classifyShape(mkRec(days), 'belong');
    check('belong double failure names arrears + foreign-small', r.outcome === 'blocked' && r.blocker === 'belong-arrears:20000' && JSON.stringify(r.blockers) === JSON.stringify(['belong-arrears:20000', 'belong-foreign-small:3']), r);
  }
  // (b) belong double failure, 100408-like: trust 100, arrears 5,000,
  // age 15, primary with NO foreign polity (size 0).
  {
    const days = quietDays(100);
    for (let i = 20; i < 100; i++) days[i] = { road: road({ bestBelong: { other: 'village_1', trust: 100, arrears: 5000, age: 15, foreignSize: 0 } }) };
    const r = classifyShape(mkRec(days), 'belong');
    check('belong double failure names arrears + foreign-small:0', r.outcome === 'blocked' && r.blocker === 'belong-arrears:5000' && JSON.stringify(r.blockers) === JSON.stringify(['belong-arrears:5000', 'belong-foreign-small:0']), r);
  }
  // (c) belong four-way failure: trust 40, arrears 100, age 5, foreign 2.
  {
    const days = quietDays(100);
    for (let i = 20; i < 100; i++) days[i] = { road: road({ bestBelong: { other: 'village_1', trust: 40, arrears: 100, age: 5, foreignSize: 2 } }) };
    const r = classifyShape(mkRec(days), 'belong');
    check('belong four-way failure names all four gates in order', r.outcome === 'blocked' && JSON.stringify(r.blockers) === JSON.stringify(['belong-trust-short:40', 'belong-arrears:100', 'belong-age-short:5d', 'belong-foreign-small:2']), r);
  }
  // (d) belong single failure stays single (backward compat with the
  // frozen taxonomy — `blocker` is still the first gate).
  {
    const days = quietDays(100);
    for (let i = 20; i < 100; i++) days[i] = { road: road({ bestBelong: { other: 'village_1', trust: 44, arrears: 0, age: 30, foreignSize: 5 } }) };
    const r = classifyShape(mkRec(days), 'belong');
    check('belong single failure: blockers holds the one gate', r.outcome === 'blocked' && r.blocker === 'belong-trust-short:44' && JSON.stringify(r.blockers) === JSON.stringify(['belong-trust-short:44']), r);
  }
  // (e) qualified branch, rung-gate + shadowed both: covenant qualifies
  // days 40–45 (all before rung 62) while a lead beat is pending.
  {
    const days = quietDays(100);
    for (let i = 39; i < 45; i++) {
      days[i] = { shapeCands: { lead: cand('lead', 4), conquest: null, belong: null, covenant: cand('covenant', 4), trade: null }, pendingNational: { shape: 'lead', primary: 'haven', day: 42 } };
    }
    const r = classifyShape(mkRec(days), 'covenant');
    check('rung-gate + shadowed both named', r.outcome === 'blocked' && r.blocker === 'covenant-rung-gate' && JSON.stringify(r.blockers) === JSON.stringify(['covenant-rung-gate', 'covenant-shadowed:lead']), r);
  }
  // (f) staged shape: no failing gates.
  {
    const days = quietDays(70);
    days[61] = { shapeCands: { lead: null, conquest: null, belong: null, covenant: cand('covenant', 4), trade: null }, road: road({ nCovFormed: 3, nCovSeas: 3 }), pendingNational: { shape: 'covenant', primary: 'haven', day: 62 } };
    days[62] = { shapeCands: { lead: null, conquest: null, belong: null, covenant: cand('covenant', 4), trade: null }, road: road({ nCovFormed: 3, nCovSeas: 3 }), nationalLive: true };
    const rec = mkRec(days, [{ day: 62, verb: 'answerNationalChoice', caller: 'policy', shape: 'covenant', result: 'sat' }]);
    const r = classifyShape(rec, 'covenant');
    check('staged covenant: blockers empty', r.outcome === 'staged' && r.sat === 1 && r.blocker === null && JSON.stringify(r.blockers) === JSON.stringify([]), r);
  }
  // (g) UNCLASSIFIED: no failing gates named (nothing to name).
  {
    const days = quietDays(100);
    for (let i = 61; i < 90; i++) {
      days[i] = { shapeCands: { lead: null, conquest: null, belong: null, covenant: cand('covenant', 4), trade: null }, road: road({ nCovFormed: 3, nCovSeas: 3 }) };
    }
    const r = classifyShape(mkRec(days), 'covenant');
    check('UNCLASSIFIED: blockers empty', r.outcome === 'UNCLASSIFIED' && r.blocker === null && JSON.stringify(r.blockers) === JSON.stringify([]), r);
  }
  // (h) best belong link fully passing but shape never qualified: the
  // old code would have misnamed 'belong-foreign-small:5' (5 is not
  // small); the new code refuses to name a gate that is not failing.
  {
    const days = quietDays(100);
    for (let i = 20; i < 100; i++) days[i] = { road: road({ bestBelong: { other: 'village_1', trust: 60, arrears: 0, age: 30, foreignSize: 5 } }) };
    const r = classifyShape(mkRec(days), 'belong');
    check('fully-passing best link, never qualified → UNCLASSIFIED', r.outcome === 'UNCLASSIFIED' && r.blocker === null && JSON.stringify(r.blockers) === JSON.stringify([]), r);
  }
  // (i) driver dir stem: per-RUN corpora dirs, old RUNs map as before.
  {
    check('dirStem onlylead2-b', dirStem('onlylead2-b') === 'perseed-onlylead2-b', dirStem('onlylead2-b'));
    check('dirStem onlylead-b unchanged', dirStem('onlylead-b') === 'perseed-onlylead-b', dirStem('onlylead-b'));
    check('dirStem covenant-b unchanged', dirStem('covenant-b') === 'perseed-covenant-b', dirStem('covenant-b'));
  }
  // (j) linkLines cap raised for the 200d horizon.
  check('LINK_LINES_CAP is 900', LINK_LINES_CAP === 900, LINK_LINES_CAP);
  // (k) blockedByAll rollup counts every named gate.
  {
    const days = quietDays(100);
    for (let i = 20; i < 100; i++) days[i] = { road: road({ bestBelong: { other: 'village_1', trust: 100, arrears: 20000, age: 33, foreignSize: 3 } }) };
    const out = analyzeShapes([mkRec(days)]);
    const bb = out.byShape.belong;
    check('rollup blockedByAll counts both gates', bb.blockedBy['belong-arrears:20000'] === 1 && bb.blockedByAll['belong-arrears:20000'] === 1 && bb.blockedByAll['belong-foreign-small:3'] === 1, bb);
  }
}

async function sectionGame() {
  console.log('§2 game — live 200d smoke, seed 100421, covenant leg');
  const cov = await oneRun(100421, 'competent-covenant-b', { days: 200 });
  check('covenant 200d smoke ran', cov && cov.series && cov.series.length > 0, cov && cov.series && cov.series.length);
  check('covenant 0 instrument errors', (cov.instrumentErrors || []).length === 0, cov.instrumentErrors);
  check('covenant shape-candidate roll present every day', cov.series.every(function (sn) { return sn.shapeCands && sn.road && typeof sn.rungDay === 'number'; }), null);
  check('covenant road counts present every day', cov.series.every(function (sn) { return sn.road && typeof sn.road.nPrimSeas === 'number' && typeof sn.road.nCovFormed === 'number'; }), null);
  check('covenant death-aware horizon (village lost before 200d)', cov.days < 200 && cov.villageLost === true, { days: cov.days, villageLost: cov.villageLost, endReason: cov.endReason });
  check('covenant linkLines within the 900 cap', (cov.linkLines || []).length <= 900, { linkLines: (cov.linkLines || []).length });
  check('covenant no peer link formed on the substrate-negative seed', ((cov.capSummary || {}).proposeAccepted | 0) === 0, cov.capSummary);
  const base = await oneRun(100421, 'competent-scaleclimb-b', { days: 200 });
  check('baseline 200d smoke ran', base && base.series && base.series.length > 0, base && base.series && base.series.length);
  check('baseline 0 instrument errors', (base.instrumentErrors || []).length === 0, base.instrumentErrors);
  check('baseline shape-candidate roll present every day', base.series.every(function (sn) { return sn.shapeCands && sn.road && typeof sn.rungDay === 'number'; }), null);
  const again = await oneRun(100421, 'competent-covenant-b', { days: 200 });
  check('determinism: identical series on re-run', JSON.stringify(again.series) === JSON.stringify(cov.series), null);
  check('determinism: identical verb events on re-run', JSON.stringify(again.verbEvents) === JSON.stringify(cov.verbEvents), null);
}

(async function () {
  await sectionStatic();
  await sectionGame();
  console.log('test-onlylead2-b: ' + PASS + ' passed, ' + FAIL + ' failed');
  process.exitCode = FAIL ? 1 : 0;
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

// test-onlylead-b.js — proof for the DIAG arm sim-onlylead-b
// (run fleshout-loop-b-20261115T1055Z). WHY only the lead shape stages?
//
// §1 STATIC (fake Game / synthetic series): the analyzer's per-shape
// classification + frozen blocker taxonomy, one synthetic case per
// branch — RED→GREEN: this test was written BEFORE the analyzer.
// §2 GAME (live 60d smoke on seed 100401, both policies, via the
// onlylead driver): the daily shape-candidate roll is captured on
// every snapshot, 0 instrument errors, and a determinism leg
// (same seed+policy twice → identical series).
// Shared harness only (scripts/sim-harness.js via the driver) — never
// copied eval boilerplate; Math.random seeded BEFORE eval by the
// harness; Game.save never stubbed.
// Usage: node scripts/test-onlylead-b.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { classifyShape, analyzeShapes } = require(path.join(REPO, 'scripts', 'analyze-onlylead-b'));
const { oneRun } = require(path.join(REPO, 'scripts', 'onlylead-driver-20261115'));

let PASS = 0, FAIL = 0;
function check(name, cond, extra) {
  if (cond) { PASS++; console.log('  PASS ' + name); }
  else { FAIL++; console.log('  FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

// --- synthetic series builder -------------------------------------------
// daySpec: array of per-day overrides; each day defaults to a quiet
// village day (no candidates, no pending beat, rung day 90).
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
  return { seed: 999999, policy: 'competent-answercourt-b', days: days.length, series: series, verbEvents: verbEvents || [], instrumentErrors: [] };
}
function cand(shape, size) { return { shape: shape, size: size, primary: shape === 'belong' ? 'village_1' : 'haven', led: shape === 'lead' || shape === 'conquest' }; }
function road(o) {
  return { nPrimSeas: 0, nConq: 0, nConqSeas: 0, nCovFormed: 0, nCovSeas: 0, nTradeFormed: 0, nTradeSeas: 0, bestBelong: null, ...(o || {}) };
}
function quietDays(n) { const a = []; for (let i = 0; i < n; i++) a.push({}); return a; }

async function sectionStatic() {
  console.log('§1 static — shape classification + blocker taxonomy');
  // (a) lead staged, sat.
  {
    const days = quietDays(70);
    days[61] = { shapeCands: { lead: cand('lead', 4), conquest: null, belong: null, covenant: null, trade: null }, road: road({ nPrimSeas: 3 }), pendingNational: { shape: 'lead', primary: 'haven', day: 62 } };
    days[62] = { shapeCands: { lead: cand('lead', 4), conquest: null, belong: null, covenant: null, trade: null }, road: road({ nPrimSeas: 3 }), nationalLive: true };
    const rec = mkRec(days, [{ day: 62, verb: 'answerNationalChoice', caller: 'policy', shape: 'lead', result: 'sat' }]);
    const r = classifyShape(rec, 'lead');
    check('lead staged sat', r.outcome === 'staged' && r.sat === 1 && r.answers === 1 && r.blocker === null, r);
    check('lead qualifiedDays counts staging days', r.qualifiedDays === 2 && r.firstQualDay === 62, r);
  }
  // (b) lead-subs-short:2 — never qualifies, max 2 seasoned subs.
  {
    const days = quietDays(100);
    for (let i = 40; i < 100; i++) days[i] = { road: road({ nPrimSeas: 2 }) };
    const r = classifyShape(mkRec(days), 'lead');
    check('lead-subs-short:2', r.outcome === 'blocked' && r.blocker === 'lead-subs-short:2', r);
  }
  // (c) conquest-no-raids — 0 conquered subs ever.
  {
    const days = quietDays(100);
    for (let i = 40; i < 100; i++) days[i] = { road: road({ nPrimSeas: 3 }) };
    const r = classifyShape(mkRec(days), 'conquest');
    check('conquest-no-raids', r.outcome === 'blocked' && r.blocker === 'conquest-no-raids', r);
  }
  // (d) conquest-mixed:2-of-3 — 2 conquered of 3 seasoned subs.
  {
    const days = quietDays(100);
    for (let i = 40; i < 100; i++) days[i] = { road: road({ nPrimSeas: 3, nConq: 2, nConqSeas: 2 }) };
    const r = classifyShape(mkRec(days), 'conquest');
    check('conquest-mixed:2-of-3', r.outcome === 'blocked' && r.blocker === 'conquest-mixed:2-of-3', r);
  }
  // (e) belong-no-sub-link — Haven never a subordinate.
  {
    const r = classifyShape(mkRec(quietDays(100)), 'belong');
    check('belong-no-sub-link', r.outcome === 'blocked' && r.blocker === 'belong-no-sub-link', r);
  }
  // (f) belong-trust-short:44.
  {
    const days = quietDays(100);
    for (let i = 20; i < 100; i++) days[i] = { road: road({ bestBelong: { other: 'village_1', trust: 44, arrears: 0, age: 30, foreignSize: 5 } }) };
    const r = classifyShape(mkRec(days), 'belong');
    check('belong-trust-short:44', r.outcome === 'blocked' && r.blocker === 'belong-trust-short:44', r);
  }
  // (g) belong-arrears:2 — trust/age/foreign met, arrears block.
  {
    const days = quietDays(100);
    for (let i = 20; i < 100; i++) days[i] = { road: road({ bestBelong: { other: 'village_1', trust: 55, arrears: 2, age: 30, foreignSize: 5 } }) };
    const r = classifyShape(mkRec(days), 'belong');
    check('belong-arrears:2', r.outcome === 'blocked' && r.blocker === 'belong-arrears:2', r);
  }
  // (h) belong-age-short:9d.
  {
    const days = quietDays(100);
    for (let i = 20; i < 100; i++) days[i] = { road: road({ bestBelong: { other: 'village_1', trust: 55, arrears: 0, age: 9, foreignSize: 5 } }) };
    const r = classifyShape(mkRec(days), 'belong');
    check('belong-age-short:9d', r.outcome === 'blocked' && r.blocker === 'belong-age-short:9d', r);
  }
  // (i) belong-foreign-small:3 — good standing, foreign realm too small.
  {
    const days = quietDays(100);
    for (let i = 20; i < 100; i++) days[i] = { road: road({ bestBelong: { other: 'village_1', trust: 55, arrears: 0, age: 30, foreignSize: 3 } }) };
    const r = classifyShape(mkRec(days), 'belong');
    check('belong-foreign-small:3', r.outcome === 'blocked' && r.blocker === 'belong-foreign-small:3', r);
  }
  // (j) covenant-no-peer-links.
  {
    const r = classifyShape(mkRec(quietDays(100)), 'covenant');
    check('covenant-no-peer-links', r.outcome === 'blocked' && r.blocker === 'covenant-no-peer-links', r);
  }
  // (k) covenant-seasoned-short:2-of-3.
  {
    const days = quietDays(100);
    for (let i = 20; i < 100; i++) days[i] = { road: road({ nCovFormed: 3, nCovSeas: 2 }) };
    const r = classifyShape(mkRec(days), 'covenant');
    check('covenant-seasoned-short:2-of-3', r.outcome === 'blocked' && r.blocker === 'covenant-seasoned-short:2-of-3', r);
  }
  // (l) trade-no-peer-links / trade-seasoned-short:1-of-2.
  {
    const r1 = classifyShape(mkRec(quietDays(100)), 'trade');
    check('trade-no-peer-links', r1.outcome === 'blocked' && r1.blocker === 'trade-no-peer-links', r1);
    const days = quietDays(100);
    for (let i = 20; i < 100; i++) days[i] = { road: road({ nTradeFormed: 2, nTradeSeas: 1 }) };
    const r2 = classifyShape(mkRec(days), 'trade');
    check('trade-seasoned-short:1-of-2', r2.outcome === 'blocked' && r2.blocker === 'trade-seasoned-short:1-of-2', r2);
  }
  // (m) covenant-shadowed:lead — covenant qualifies while a lead beat is pending.
  {
    const days = quietDays(100);
    for (let i = 61; i < 70; i++) {
      days[i] = { shapeCands: { lead: cand('lead', 4), conquest: null, belong: null, covenant: cand('covenant', 4), trade: null }, pendingNational: { shape: 'lead', primary: 'haven', day: 62 } };
    }
    const r = classifyShape(mkRec(days), 'covenant');
    check('covenant-shadowed:lead', r.outcome === 'blocked' && r.blocker === 'covenant-shadowed:lead' && r.qualifiedDays === 9, r);
  }
  // (n) belong-rung-gate — belong qualifies only before the rung day (62).
  {
    const days = quietDays(100);
    for (let i = 30; i < 61; i++) {
      days[i] = { shapeCands: { lead: null, conquest: null, belong: cand('belong', 4), covenant: null, trade: null }, road: road({ bestBelong: { other: 'village_1', trust: 60, arrears: 0, age: 30, foreignSize: 5 } }) };
    }
    const r = classifyShape(mkRec(days), 'belong');
    check('belong-rung-gate', r.outcome === 'blocked' && r.blocker === 'belong-rung-gate', r);
  }
  // (o) UNCLASSIFIED — qualifies after the rung, nothing pending/live, never stages.
  {
    const days = quietDays(100);
    for (let i = 61; i < 90; i++) {
      days[i] = { shapeCands: { lead: null, conquest: null, belong: null, covenant: cand('covenant', 4), trade: null }, road: road({ nCovFormed: 3, nCovSeas: 3 }) };
    }
    const r = classifyShape(mkRec(days), 'covenant');
    check('mystery qualification is UNCLASSIFIED', r.outcome === 'UNCLASSIFIED' && r.blocker === null, r);
  }
  // (p) analyzeShapes rollup counts UNCLASSIFIED per leg.
  {
    const days = quietDays(100);
    for (let i = 61; i < 90; i++) days[i] = { shapeCands: { lead: null, conquest: null, belong: null, covenant: cand('covenant', 4), trade: null }, road: road({ nCovFormed: 3, nCovSeas: 3 }) };
    const out = analyzeShapes([mkRec(days)]);
    check('rollup counts 1 UNCLASSIFIED', out.unclassified === 1 && out.perSeed['999999-competent-answercourt-b'].shapes.covenant.outcome === 'UNCLASSIFIED', out);
  }
  // (q) staged beat without a verb event still classifies as staged (series truth).
  {
    const days = quietDays(70);
    days[61] = { shapeCands: { lead: cand('lead', 4), conquest: null, belong: null, covenant: null, trade: null }, road: road({ nPrimSeas: 3 }), pendingNational: { shape: 'lead', primary: 'haven', day: 62 } };
    const r = classifyShape(mkRec(days), 'lead');
    check('staged via series even with no answer event', r.outcome === 'staged' && r.answers === 0, r);
  }
}

async function sectionGame() {
  console.log('§2 game — live 60d smoke, seed 100401, both policies');
  const base = await oneRun(100401, 'competent-scaleclimb-b', { days: 60 });
  check('baseline smoke ran', base && base.series && base.series.length > 0, base && base.series && base.series.length);
  check('baseline 0 instrument errors', (base.instrumentErrors || []).length === 0, base.instrumentErrors);
  check('baseline shape-candidate roll present every day', base.series.every(function (sn) { return sn.shapeCands && sn.road && typeof sn.rungDay === 'number'; }), null);
  check('baseline road counts present', base.series.every(function (sn) { return sn.road && typeof sn.road.nPrimSeas === 'number' && typeof sn.road.nCovFormed === 'number'; }), null);
  const armed = await oneRun(100401, 'competent-answercourt-b', { days: 60 });
  check('armed smoke ran', armed && armed.series && armed.series.length > 0, armed && armed.series && armed.series.length);
  check('armed 0 instrument errors', (armed.instrumentErrors || []).length === 0, armed.instrumentErrors);
  check('armed shape-candidate roll present every day', armed.series.every(function (sn) { return sn.shapeCands && sn.road && typeof sn.rungDay === 'number'; }), null);
  // Determinism leg: same seed+policy twice → identical series.
  const again = await oneRun(100401, 'competent-scaleclimb-b', { days: 60 });
  check('determinism: identical series on re-run', JSON.stringify(again.series) === JSON.stringify(base.series), null);
  check('determinism: identical verb events on re-run', JSON.stringify(again.verbEvents) === JSON.stringify(base.verbEvents), null);
  // The candidate roll must agree with the engine's own havenPolity read.
  const mismatch = base.series.filter(function (sn) { return (sn.havenPolity ? sn.havenPolity.shape : null) !== (sn.shapeCands.lead ? 'lead' : (sn.shapeCands.conquest ? 'conquest' : (sn.shapeCands.belong ? 'belong' : (sn.shapeCands.covenant ? 'covenant' : (sn.shapeCands.trade ? 'trade' : null))))); }).length;
  check('candidate roll agrees with _havenPolity (lead-first priority)', mismatch === 0, { mismatch: mismatch });
}

(async function () {
  await sectionStatic();
  await sectionGame();
  console.log('test-onlylead-b: ' + PASS + ' passed, ' + FAIL + ' failed');
  process.exitCode = FAIL ? 1 : 0;
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

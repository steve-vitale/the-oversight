// test-polityfrag-20261104.js — proof for the polityfrag analyzer
// (arm sim-polityfrag-b). Fixture tests for drop/recovery
// classification, hold-share, never-diplomacy reasons, and the
// judgeGo bar, plus a live harness smoke test: loadGame +
// diplo instrument + 2-day leadcourt run, 0 instrument errors.
// Writes nothing to the repo (in-memory only).
// Usage: node scripts/test-polityfrag-20261104.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'test-polityfrag-analyze-20261104'));
const INST = require(path.join(REPO, 'scripts', 'diplo-instrument-20261104'));

let pass = 0, fail = 0;
function eq(name, got, want) {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + ' got=' + g + ' want=' + w); }
}
function baseOut(over) {
  return Object.assign({
    seed: 1, policy: 'leadcourt', run: 'test', anchorCommit: 'test',
    days: 10, endReason: 'horizon', won: false, villageLost: false,
    scaleRank: 'village', maxWave: 1, endUnlockedWave: 1, endCallMovedPeak: false,
    daily: [], proposalEvents: [], courtshipEvents: [], travelCalls: [],
    linkFormedEvents: [], deathEvents: [], sayLines: [], wrapCounts: {},
    instrumentErrors: [],
  }, over || {});
}
function link(id, trust, seasoned, status) {
  return { id: id, kind: null, primary: 'haven', subordinate: 'v' + id, status: status || 'active',
    trust: trust, seasoned: seasoned, regionalPlus: seasoned };
}
function snap(day, diplo, detail, extra) {
  const seasoned = detail.filter(function (d) { return d.seasoned; }).length;
  const regional = detail.filter(function (d) { return d.regionalPlus; }).length;
  return Object.assign({ day: day, tile: { x: 4, y: 4 }, insideHaven: true, ovs: [],
    onVillageTile: null,
    linkFunnel: { total: detail.length, active: detail.filter(function (d) { return d.status === 'active'; }).length,
      seasoned: seasoned, regionalPlus: regional, seasonedNotRegional: seasoned - regional, detail: detail },
    pending: { counter: false, accord: false, national: false, global: false, counterDetail: null },
    standing: { total: diplo, war: 0, diplomacy: diplo, plenty: 0, warPts: 0, links: 0, feasts: 0 },
    capped: diplo, peak: null, scaleRank: 'village', readiness5: { ready: false },
    w4faced: false, w5faced: false, roster: [], livingCount: 3, pantryKcal: 10000 }, extra || {});
}
function daysRange(a, b, fn) { const out = []; for (let d = a; d <= b; d++) out.push(fn(d)); return out; }

// 1. Holds: diplomacy 102 throughout, no drop.
eq('holds trajectory', AN.analyzeSeed(baseOut({ daily: daysRange(60, 90, function (d) {
  return snap(d, 102, [link('l1', 70, true), link('l2', 80, true), link('l3', 60, true)]); }) })).trajectory, 'holds');
eq('holds holdShare', AN.analyzeSeed(baseOut({ daily: daysRange(60, 90, function (d) {
  return snap(d, 102, [link('l1', 70, true)]); }) })).holdShare, 1);
// 2. Collapse by trust-unseason, last-tend recorded.
(function () {
  const daily = [].concat(
    daysRange(60, 88, function (d) { return snap(d, 102, [link('l1', 70, true), link('l2', 80, true), link('l3', 54, true)]); }),
    daysRange(89, 100, function (d) { return snap(d, 0, [link('l1', 70, true), link('l2', 80, true), link('l3', 38, false)]); }));
  const s = AN.analyzeSeed(baseOut({ daily: daily,
    courtshipEvents: [{ day: 56, fn: 'tendLink', target: 'l3' }, { day: 110, fn: 'tendLink', target: 'l3' }] }));
  eq('collapse trajectory', s.trajectory, 'collapses');
  eq('collapse drop cause', s.drops[0].cause, 'trust-unseason');
  eq('collapse drop day', s.drops[0].dropDay, 89);
  eq('collapse unseasoned link', s.drops[0].unseasoned[0].id, 'l3');
  eq('collapse last tend', s.drops[0].lastTendByLink.l3, 56);
  eq('collapse post-drop tend excluded', s.drops[0].lastTendByLink.l3 !== 110, true);
  eq('collapse classified', s.classified, true);
  eq('collapse holdShare', s.holdShare, 29 / 41);
})();
// 3. Flicker: drop then recovery with a re-seasoned link.
(function () {
  const daily = [].concat(
    daysRange(60, 88, function (d) { return snap(d, 102, [link('l1', 70, true), link('l2', 80, true), link('l3', 54, true)]); }),
    daysRange(89, 119, function (d) { return snap(d, 0, [link('l1', 70, true), link('l2', 80, true), link('l3', 38, false)]); }),
    daysRange(120, 130, function (d) { return snap(d, 102, [link('l1', 70, true), link('l2', 80, true), link('l3', 45, true)]); }));
  const s = AN.analyzeSeed(baseOut({ daily: daily,
    courtshipEvents: [{ day: 110, fn: 'tendLink', target: 'l3' }] }));
  eq('flicker trajectory', s.trajectory, 'flickers');
  eq('flicker recovery day', s.recoveries[0].day, 120);
  eq('flicker reseasoned', s.recoveries[0].reseasonedLinks, ['l3']);
  eq('flicker classified', s.classified, true);
})();
// 4. Broken cause + re-proposal after the break.
(function () {
  const daily = [].concat(
    daysRange(60, 88, function (d) { return snap(d, 102, [link('l1', 70, true), link('l2', 80, true), link('l3', 60, true)]); }),
    daysRange(89, 100, function (d) { return snap(d, 0, [link('l1', 70, true), link('l2', 80, true), link('l3', 0, false, 'broken')]); }));
  const s = AN.analyzeSeed(baseOut({ daily: daily,
    proposalEvents: [{ day: 95, fn: 'proposeLink', target: 'v9', ret: { id: 'lx' } }],
    linkFormedEvents: [{ day: 95, link: { id: 'lx', primary: 'haven', subordinate: 'v9' } }] }));
  eq('broken drop cause', s.drops[0].cause, 'broken');
  eq('broken day', s.firstBreakDay, 89);
  eq('reproposal after break', s.reproposals, [{ day: 95, fn: 'proposeLink', target: 'v9' }]);
  eq('broken classified', s.classified, true);
})();
// 5. Never-diplomacy: max 2 seasoned at once.
eq('never reason', AN.analyzeSeed(baseOut({ daily: daysRange(1, 50, function (d) {
  return snap(d, 0, [link('l1', 70, true), link('l2', 80, true)]); }) })).neverReason,
  'never-3-seasoned-at-once (max 2)');
eq('never trajectory', AN.analyzeSeed(baseOut({ daily: daysRange(1, 50, function (d) {
  return snap(d, 0, [link('l1', 70, true)]); }) })).trajectory, 'never');
eq('never classified', AN.analyzeSeed(baseOut({ daily: daysRange(1, 50, function (d) {
  return snap(d, 0, [link('l1', 70, true)]); }) })).classified, true);
// 6. Unknown cause: diplomacy drops with no funnel change -> unclassified.
(function () {
  const daily = [].concat(
    daysRange(60, 88, function (d) { return snap(d, 102, []); }),
    daysRange(89, 100, function (d) { return snap(d, 0, []); }));
  const s = AN.analyzeSeed(baseOut({ daily: daily }));
  eq('unknown cause', s.drops[0].cause, 'unknown');
  eq('unknown unclassified', s.classified, false);
})();
// 7. judgeGo bars.
function sum(firstDiploDay, classified, errors) {
  return { firstDiploDay: firstDiploDay, classified: classified, instrumentErrors: errors || 0 };
}
eq('judgeGo GO', AN.judgeGo([
  sum(60, true), sum(60, true), sum(60, true), sum(null, true),
  sum(null, true), sum(null, true), sum(70, false), sum(null, false),
]).verdict, 'DIAG-GO');
eq('judgeGo too few classified', AN.judgeGo([
  sum(60, true), sum(60, true), sum(60, true), sum(null, true),
  sum(null, true), sum(null, false), sum(70, false), sum(null, false),
]).verdict, 'DIAG-NO-CANDIDATE');
eq('judgeGo too few diplo', AN.judgeGo([
  sum(60, true), sum(60, true), sum(null, true), sum(null, true),
  sum(null, true), sum(null, true), sum(70, false), sum(null, false),
]).verdict, 'DIAG-NO-CANDIDATE');
eq('judgeGo insufficient', AN.judgeGo([
  sum(60, true, 1), sum(60, true, 1), sum(60, true, 1), sum(null, true),
  sum(null, true), sum(null, true), sum(70, false), sum(null, false),
]).verdict, 'INSUFFICIENT-DATA');

// Live harness smoke: leadcourt 2-day run, instrument clean.
(async function () {
  try {
    const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
    const { leadcourt } = require(path.join(REPO, 'scripts', 'policies', 'leadcourt'));
    const { Game } = await loadGame({ seed: 99401, mode: 'polityfrag-smoke', fullTelemetry: false });
    await setupGame(Game);
    const inst = INST.install(Game);
    const s0 = inst.snapshot();
    eq('smoke snapshot ovs array', Array.isArray(s0.ovs), true);
    eq('smoke snapshot funnel shape', typeof (s0.linkFunnel && s0.linkFunnel.total), 'number');
    eq('smoke snapshot ovs non-empty', (s0.ovs || []).length > 0, true);
    await quietLog(async function () { await runDays(Game, leadcourt, { days: 2, manifest: undefined, sampleEvery: 30 }); });
    inst.snapshot();
    eq('smoke instrument errors zero', inst.t.instrumentErrors.length, 0);
    eq('smoke snapshots taken', inst.t.daily.length >= 2, true);
    inst.uninstall();
  } catch (e) {
    fail++;
    console.log('FAIL live smoke: ' + (e && e.stack ? e.stack.slice(0, 500) : e));
  }
  console.log('TOTAL ' + pass + ' pass, ' + fail + ' fail');
  process.exitCode = fail ? 1 : 0;
})().catch(function (e) { console.log('FAIL harness: ' + e.stack); process.exitCode = 1; });

// test-recovery-tend-20261104.js — proof for the tend-through leg
// (arm sim-recovery-tend-b). Fixture tests for: the variant policy
// (ONLY the 20,000 tend gate removed), the wrapper's survival bands,
// low-pantry tend counting, post-drop days lived, and the prereg GO
// judge, plus the reused polityfrag analyzer's drop/recovery
// classification, plus a live harness smoke test: loadGame +
// diplo instrument + 2-day leadcourt-tendthrough run, 0 instrument
// errors. Writes nothing to the repo (in-memory only).
// Usage: node scripts/test-recovery-tend-20261104.js
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const WRAP = require(path.join(REPO, 'scripts', 'test-recovery-tend-analyze-20261104'));
const AN = require(path.join(REPO, 'scripts', 'test-polityfrag-analyze-20261104'));
const INST = require(path.join(REPO, 'scripts', 'diplo-instrument-20261104'));

let pass = 0, fail = 0;
function eq(name, got, want) {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + ' got=' + g + ' want=' + w); }
}

// 1. Variant policy: ONLY the tend gate removed.
const policyText = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'leadcourt-tendthrough.js'), 'utf8');
const leadText = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'leadcourt.js'), 'utf8');
eq('variant has no 20000 tend gate', policyText.indexOf('pantryKcal(Game) > 20000'), -1);
eq('variant keeps weekly check', policyText.indexOf('link.tendedWeek !== week') >= 0, true);
eq('variant keeps Haven-primary tend', policyText.indexOf("link.primary === 'haven'") >= 0, true);
eq('variant keeps proposal gate 12000', policyText.indexOf('pantryKcal(Game) > 12000') >= 0, true);
eq('variant keeps counter rich gate 25000', policyText.indexOf('pantryKcal(Game) > 25000') >= 0, true);
eq('variant keeps answer logic', policyText.indexOf('answerCounter') >= 0 && policyText.indexOf('answerNationalChoice') >= 0, true);
eq('baseline still has 20000 tend gate', leadText.indexOf('pantryKcal(Game) > 20000') >= 0, true);
const pol = require(path.join(REPO, 'scripts', 'policies', 'leadcourt-tendthrough')).leadcourtTendthrough;
eq('variant id', pol.id, 'leadcourt-tendthrough');
eq('variant daily fn', typeof pol.daily, 'function');

// 2. Survival bands.
eq('band A horizon', WRAP.bandFor(300, 'horizon'), 'A');
eq('band B', WRAP.bandFor(200, 'lost'), 'B');
eq('band C', WRAP.bandFor(143, 'lost'), 'C');
eq('band D', WRAP.bandFor(98, 'lost'), 'D');
eq('band edge 150', WRAP.bandFor(150, 'lost'), 'B');
eq('band edge 100', WRAP.bandFor(100, 'lost'), 'C');

// 3. GO judge fixtures (prereg: >=2 of 99402/99403/99411 hold-or-recover AND <=1 regression).
function sum(seed, heldOrRecovered, regressed, errors) {
  return { seed: seed, heldOrRecovered: heldOrRecovered, regressed: regressed, instrumentErrors: errors || 0 };
}
eq('judge GO 2 successes', WRAP.judgeGo([
  sum(99402, true, false), sum(99403, true, false), sum(99411, false, false), sum(99401, false, false),
]).verdict, 'GO');
eq('judge GO with 1 regression', WRAP.judgeGo([
  sum(99402, true, true), sum(99403, true, false), sum(99411, false, false), sum(99401, false, false),
]).verdict, 'GO');
eq('judge NO-GO 1 success', WRAP.judgeGo([
  sum(99402, true, false), sum(99403, false, false), sum(99411, false, false), sum(99401, false, false),
]).verdict, 'NO-GO');
eq('judge NO-GO 2 regressions', WRAP.judgeGo([
  sum(99402, true, true), sum(99403, true, true), sum(99411, false, false), sum(99401, false, false),
]).verdict, 'NO-GO');
eq('judge recovery counts as success', WRAP.judgeGo([
  sum(99402, true, false), sum(99403, false, false), sum(99411, true, false), sum(99401, false, false),
]).verdict, 'GO');

// 4. Summarize: low-pantry tends + post-drop days, on fixtures.
function link(id, trust, seasoned, status) {
  return { id: id, kind: null, primary: 'haven', subordinate: 'v' + id, status: status || 'active',
    trust: trust, seasoned: seasoned, regionalPlus: seasoned };
}
function snap(day, diplo, detail, pantry) {
  const seasoned = detail.filter(function (d) { return d.seasoned; }).length;
  return { day: day, tile: { x: 4, y: 4 }, insideHaven: true, ovs: [], onVillageTile: null,
    linkFunnel: { total: detail.length, active: detail.filter(function (d) { return d.status === 'active'; }).length,
      seasoned: seasoned, regionalPlus: seasoned, seasonedNotRegional: 0, detail: detail },
    pending: { counter: false, accord: false, national: false, global: false, counterDetail: null },
    standing: { total: diplo, war: 0, diplomacy: diplo, plenty: 0, warPts: 0, links: 0, feasts: 0 },
    capped: diplo, peak: null, scaleRank: 'village', readiness5: { ready: false },
    w4faced: false, w5faced: false, roster: [], livingCount: 3, pantryKcal: pantry == null ? 10000 : pantry };
}
function daysRange(a, b, fn) { const out = []; for (let d = a; d <= b; d++) out.push(fn(d)); return out; }
(function () {
  const daily = [].concat(
    daysRange(60, 88, function (d) { return snap(d, 102, [link('l1', 70, true), link('l2', 80, true), link('l3', 54, true)], 30000); }),
    daysRange(89, 100, function (d) { return snap(d, 0, [link('l1', 70, true), link('l2', 80, true), link('l3', 38, false)], 5000); }));
  const out = { seed: 99402, policy: 'leadcourt-tendthrough', run: 'test', anchorCommit: 'test',
    days: 100, endReason: 'lost', won: false, villageLost: true, scaleRank: 'regional',
    maxWave: 4, endUnlockedWave: 4, endCallMovedPeak: false, daily: daily,
    proposalEvents: [], courtshipEvents: [
      { day: 70, fn: 'tendLink', target: 'l3' },
      { day: 95, fn: 'tendLink', target: 'l3' },
      { day: 96, fn: 'tendLink', target: 'l1' },
    ],
    travelCalls: [], linkFormedEvents: [], deathEvents: [], sayLines: [], wrapCounts: {}, instrumentErrors: [] };
  const s = WRAP.summarize(out);
  eq('summarize trajectory collapses', s.trajectory, 'collapses');
  eq('summarize post-drop days', s.postDropDaysLived, [11]);
  eq('summarize tend total', s.tendTotal, 3);
  eq('summarize low-pantry tends', s.lowPantryTends, 2);
  eq('summarize band vs baseline', s.survivalBand + '/' + s.baselineBand + '/' + s.regressed, 'C/C/false');
})();

// 5. Reused analyzer: recovery still classifies (drop then re-season).
(function () {
  const daily = [].concat(
    daysRange(60, 88, function (d) { return snap(d, 102, [link('l1', 70, true), link('l2', 80, true), link('l3', 54, true)]); }),
    daysRange(89, 119, function (d) { return snap(d, 0, [link('l1', 70, true), link('l2', 80, true), link('l3', 38, false)]); }),
    daysRange(120, 130, function (d) { return snap(d, 102, [link('l1', 70, true), link('l2', 80, true), link('l3', 45, true)]); }));
  const s = AN.analyzeSeed({ seed: 1, policy: 'leadcourt-tendthrough', run: 'test', anchorCommit: 'test',
    days: 130, endReason: 'lost', won: false, villageLost: true, scaleRank: 'regional', maxWave: 4,
    endUnlockedWave: 4, endCallMovedPeak: false, daily: daily, proposalEvents: [],
    courtshipEvents: [{ day: 110, fn: 'tendLink', target: 'l3' }], travelCalls: [],
    linkFormedEvents: [], deathEvents: [], sayLines: [], wrapCounts: {}, instrumentErrors: [] });
  eq('reused analyzer flickers', s.trajectory, 'flickers');
  eq('reused analyzer recovery day', s.recoveries[0].day, 120);
  eq('reused analyzer classified', s.classified, true);
})();

// Live harness smoke: tendthrough 2-day run, instrument clean.
(async function () {
  try {
    const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
    const { Game } = await loadGame({ seed: 99401, mode: 'recovery-tend-smoke', fullTelemetry: false });
    await setupGame(Game);
    const inst = INST.install(Game);
    const s0 = inst.snapshot();
    eq('smoke snapshot ovs array', Array.isArray(s0.ovs), true);
    eq('smoke snapshot funnel shape', typeof (s0.linkFunnel && s0.linkFunnel.total), 'number');
    await quietLog(async function () { await runDays(Game, pol, { days: 2, manifest: undefined, sampleEvery: 30 }); });
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

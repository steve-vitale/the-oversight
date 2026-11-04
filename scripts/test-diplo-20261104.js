// test-diplo-20261104.js — proof for the diplo instrument + analyzer
// (arm sim-diplo-b). Fixture tests for stage attribution and the
// proposal-outcome classifier, plus a live harness smoke test:
// loadGame + install + snapshot shape + a refused proposeLink call
// recorded without breaking the game.
// Usage: node scripts/test-diplo-20261104.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'diplo-analyze-20261104'));
const INST = require(path.join(REPO, 'scripts', 'diplo-instrument-20261104'));

let pass = 0, fail = 0;
function eq(name, got, want) {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + ' got=' + g + ' want=' + w); }
}
function baseOut(over) {
  return Object.assign({
    seed: 1, policy: 'competent', run: 'test', anchorCommit: 'test',
    days: 10, endReason: 'horizon', won: false, villageLost: false,
    scaleRank: 'village', maxWave: 1, endUnlockedWave: 1, endCallMovedPeak: false,
    daily: [], proposalEvents: [], courtshipEvents: [], travelCalls: [],
    linkFormedEvents: [], deathEvents: [], sayLines: [], wrapCounts: {},
    instrumentErrors: [],
  }, over || {});
}
function snap(day, ovs, extra) {
  return Object.assign({ day: day, tile: { x: 4, y: 4 }, insideHaven: true,
    ovs: ovs, onVillageTile: null, linkFunnel: { total: 0, active: 0, seasoned: 0, regionalPlus: 0, seasonedNotRegional: 0, detail: [] },
    pending: { counter: false, accord: false, national: false, global: false, counterDetail: null },
    standing: null, capped: null, peak: null, scaleRank: 'village', readiness5: { ready: false },
    w4faced: false, w5faced: false, roster: [], livingCount: 3, pantryKcal: 10000 }, extra || {});
}
function ov(id, known, opinion) {
  return { id: id, name: id, x: 1, y: 1, opinion: opinion, known: known, generated: true,
    rumored: false, isSplinter: false, parentVillage: null, codexGiven: false, allied: false, linkWith: null };
}

// 1. No villages at all -> S0-none.
eq('stage S0-none', AN.summarizeSeed(baseOut({ daily: [snap(1, [])] })).furthest, 'S0-none');
// 2. Villages exist, none known -> S0.
eq('stage S0', AN.summarizeSeed(baseOut({ daily: [snap(1, [ov('v1', false, 0)])] })).furthest, 'S0');
// 3. Known, opinion 0, no travel/proposals -> S1.
eq('stage S1', AN.summarizeSeed(baseOut({ daily: [snap(1, [ov('v1', true, 0)])] })).furthest, 'S1');
// 4. Known, opinion 12, no travel/proposals -> S2.
eq('stage S2', AN.summarizeSeed(baseOut({ daily: [snap(1, [ov('v1', true, 12)])] })).furthest, 'S2');
// 5. Known, opinion 12, village-tile day, no proposals -> S3.
eq('stage S3', AN.summarizeSeed(baseOut({ daily: [snap(1, [ov('v1', true, 12)], { onVillageTile: 'v1' })] })).furthest, 'S3');
// 6. Proposal refused (null return, no link/counter) -> S4-refused-only.
eq('stage S4-refused-only', AN.summarizeSeed(baseOut({
  daily: [snap(1, [ov('v1', true, 12)])],
  proposalEvents: [{ day: 1, fn: 'proposeLink', target: 'v1', ret: null }],
})).furthest, 'S4-refused-only');
// 7. Proposal declined (non-null return, no link/counter) -> S5.
eq('stage S5', AN.summarizeSeed(baseOut({
  daily: [snap(1, [ov('v1', true, 12)])],
  proposalEvents: [{ day: 1, fn: 'proposeLink', target: 'v1', ret: { score: 30 } }],
})).furthest, 'S5');
// 8. Link formed, never seasoned -> S6.
eq('stage S6', AN.summarizeSeed(baseOut({
  daily: [snap(1, [ov('v1', true, 12)])],
  linkFormedEvents: [{ day: 5, link: { id: 'l1', kind: 'subordinate', primary: 'haven', subordinate: 'v1' } }],
})).furthest, 'S6');
// 9. Seasoned but never regional+ -> S7.
eq('stage S7', AN.summarizeSeed(baseOut({
  daily: [snap(1, [ov('v1', true, 12)], { linkFunnel: { total: 1, active: 1, seasoned: 1, regionalPlus: 0, seasonedNotRegional: 1, detail: [] } })],
  linkFormedEvents: [{ day: 5, link: { id: 'l1', kind: 'subordinate', primary: 'haven', subordinate: 'v1' } }],
})).furthest, 'S7');
// 10. Regional+ -> S8.
eq('stage S8', AN.summarizeSeed(baseOut({
  daily: [snap(1, [ov('v1', true, 12)], { linkFunnel: { total: 1, active: 1, seasoned: 1, regionalPlus: 1, seasonedNotRegional: 0, detail: [] } })],
  linkFormedEvents: [{ day: 5, link: { id: 'l1', kind: 'subordinate', primary: 'haven', subordinate: 'v1' } }],
})).furthest, 'S8');
// 11. Classifier: accepted via link within 2 days.
eq('classify accepted', AN.classifyProposal({ day: 10, target: 'v1' },
  baseOut({ linkFormedEvents: [{ day: 11, link: { id: 'l1', primary: 'haven', subordinate: 'v1' } }] })), 'accepted');
// 12. Classifier: countered via pendingCounter within 2 days.
eq('classify countered', AN.classifyProposal({ day: 10, target: 'v1' },
  baseOut({ daily: [snap(11, [], { pending: { counter: true, accord: false, national: false, global: false, counterDetail: null } })] })), 'countered');
// 13. Classifier: refused on null return with nothing following.
eq('classify refused', AN.classifyProposal({ day: 10, target: 'v1', ret: null }, baseOut({})), 'refused');
// 14. Classifier: link after 3 days does NOT count as accepted.
eq('classify late-link declined', AN.classifyProposal({ day: 10, target: 'v1', ret: { score: 30 } },
  baseOut({ linkFormedEvents: [{ day: 14, link: { id: 'l1', primary: 'haven', subordinate: 'v1' } }] })), 'declined');
// 15. judgeGo: 6/8 same stage -> DIAG-GO.
eq('judgeGo majority', AN.judgeGo([
  { furthest: 'S1', instrumentErrors: 0, ovMax: 2 }, { furthest: 'S1', instrumentErrors: 0, ovMax: 2 },
  { furthest: 'S1', instrumentErrors: 0, ovMax: 2 }, { furthest: 'S1', instrumentErrors: 0, ovMax: 2 },
  { furthest: 'S1', instrumentErrors: 0, ovMax: 2 }, { furthest: 'S1', instrumentErrors: 0, ovMax: 2 },
  { furthest: 'S2', instrumentErrors: 0, ovMax: 2 }, { furthest: 'S0', instrumentErrors: 0, ovMax: 2 },
]).verdict, 'DIAG-GO');
// 16. judgeGo: scattered -> DIAG-NO-CANDIDATE.
eq('judgeGo scattered', AN.judgeGo([
  { furthest: 'S1', instrumentErrors: 0, ovMax: 2 }, { furthest: 'S2', instrumentErrors: 0, ovMax: 2 },
  { furthest: 'S3', instrumentErrors: 0, ovMax: 2 }, { furthest: 'S1', instrumentErrors: 0, ovMax: 2 },
  { furthest: 'S2', instrumentErrors: 0, ovMax: 2 }, { furthest: 'S3', instrumentErrors: 0, ovMax: 2 },
  { furthest: 'S1', instrumentErrors: 0, ovMax: 2 }, { furthest: 'S2', instrumentErrors: 0, ovMax: 2 },
]).verdict, 'DIAG-NO-CANDIDATE');
// 17. judgeGo: > 2 bad seeds -> INSUFFICIENT-DATA.
eq('judgeGo insufficient', AN.judgeGo([
  { furthest: 'S1', instrumentErrors: 1, ovMax: 2 }, { furthest: 'S1', instrumentErrors: 1, ovMax: 2 },
  { furthest: 'S1', instrumentErrors: 1, ovMax: 2 }, { furthest: 'S1', instrumentErrors: 0, ovMax: 2 },
  { furthest: 'S1', instrumentErrors: 0, ovMax: 2 }, { furthest: 'S1', instrumentErrors: 0, ovMax: 2 },
  { furthest: 'S1', instrumentErrors: 0, ovMax: 2 }, { furthest: 'S1', instrumentErrors: 0, ovMax: 2 },
]).verdict, 'INSUFFICIENT-DATA');

// Live harness smoke: install, snapshot, refused propose recorded.
(async function () {
  try {
    const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
    const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
    const { Game } = await loadGame({ seed: 99301, mode: 'diplo-smoke', fullTelemetry: false });
    await setupGame(Game);
    const inst = INST.install(Game);
    const s0 = inst.snapshot();
    eq('smoke snapshot ovs array', Array.isArray(s0.ovs), true);
    eq('smoke snapshot funnel shape', typeof (s0.linkFunnel && s0.linkFunnel.total), 'number');
    eq('smoke snapshot ovs non-empty', (s0.ovs || []).length > 0, true);
    // A propose to an unknown/unseen target must record (and not throw).
    let ret = 'no-call';
    try {
      const ovs = (Game.state.otherVillages || []);
      const unknown = ovs.find(function (v) { return v && !(Game.knowsVillage && Game.knowsVillage(v)); });
      const target = unknown ? unknown.id : (ovs[0] ? ovs[0].id : null);
      if (target) ret = Game.proposeLink(target, { asSubordinate: false, tributeKcalPerWeek: 4000 });
    } catch (e) { ret = 'threw:' + String(e.message).slice(0, 60); }
    eq('smoke propose recorded', inst.t.proposalEvents.length >= 1, true);
    eq('smoke propose did not throw', typeof ret !== 'string' || ret.indexOf('threw:') !== 0, true);
    await quietLog(async function () { await runDays(Game, competent, { days: 2, manifest: undefined, sampleEvery: 30 }); });
    eq('smoke instrument errors zero', inst.t.instrumentErrors.length, 0);
    inst.uninstall();
  } catch (e) {
    fail++;
    console.log('FAIL live smoke: ' + (e && e.stack ? e.stack.slice(0, 500) : e));
  }
  console.log('TOTAL ' + pass + ' pass, ' + fail + ' fail');
  process.exitCode = fail ? 1 : 0;
})().catch(function (e) { console.log('FAIL harness: ' + e.stack); process.exitCode = 1; });

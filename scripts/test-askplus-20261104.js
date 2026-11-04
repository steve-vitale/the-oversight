// test-askplus-20261104.js — proof for arm sim-askplus-a.
// Fixture tests (policy gating, shape classifier, diplomacy series,
// GO-bar judge semantics) + one live harness smoke (2-day run, seed
// 12345 — NOT a judged seed — snapshot shape, 0 instrument errors).
// Plain node asserts; exits non-zero on any failure.
// Usage: node scripts/test-askplus-20261104.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { competentAskplus, askCourtship } = require(path.join(REPO, 'scripts', 'policies', 'competent-askplus'));
const AN = require(path.join(REPO, 'scripts', 'diplo-analyze-askplus-20261104'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
function fakeGame(opts) {
  const o = opts || {};
  const calls = { propose: [], tend: [], counter: [], accord: [], defense: [], national: [], global: [] };
  const Game = {
    state: {
      scholar: { day: o.day || 0 },
      village: { pantry: [{ kcalEach: 1, units: o.pantry || 0 }], roster: o.roster || ['a', 'b', 'c', 'd', 'e', 'f'] },
      otherVillages: o.ovs || [],
      pendingCounter: o.pendingCounter || null,
      pendingAccord: o.pendingAccord || null,
      pendingNational: o.pendingNational || null,
      pendingGlobal: o.pendingGlobal || null,
    },
    _week: function () { return o.week || 0; },
    hierarchyState: function () { return o.links || []; },
    knowsVillage: function () { return o.known !== false; },
    linkWith: function () { return o.linked ? { id: 'x' } : null; },
    proposeLink: function (id, opts2) { calls.propose.push([id, opts2]); return { ok: true }; },
    tendLink: function (id) { calls.tend.push(id); },
    answerCounter: function (a) { calls.counter.push(a); },
    answerAccord: function (a) { calls.accord.push(a); },
    answerDefenseCall: function (id, a) { calls.defense.push([id, a]); },
    answerNationalChoice: function (a) { calls.national.push(a); },
    answerGlobalChoice: function (a) { calls.global.push(a); },
    _calls: calls,
  };
  return Game;
}

// 1. Policy shape.
check('policy id', competentAskplus.id === 'competent-askplus', competentAskplus.id);
check('policy daily is a function', typeof competentAskplus.daily === 'function');
check('policy desc names the borrow', /leadcourt/i.test(competentAskplus.desc || ''), competentAskplus.desc);

// 2. Proposal gating.
(function () {
  const ctx = {};
  const g = fakeGame({ day: 24, pantry: 50000, ovs: [{ id: 'v1' }] });
  askCourtship(g, ctx);
  check('no propose before day 25', g._calls.propose.length === 0, g._calls.propose);
})();
(function () {
  const ctx = {};
  const g = fakeGame({ day: 25, pantry: 12000, ovs: [{ id: 'v1' }] });
  askCourtship(g, ctx);
  check('no propose at exactly pantry 12000 (needs >)', g._calls.propose.length === 0, g._calls.propose);
})();
(function () {
  const ctx = {};
  const g = fakeGame({ day: 25, pantry: 12001, ovs: [{ id: 'v1' }, { id: 'v2' }] });
  askCourtship(g, ctx);
  check('proposes once on day 25 when pantry > 12000', g._calls.propose.length === 1, g._calls.propose);
  check('proposal args match leadcourt', g._calls.propose[0][1] && g._calls.propose[0][1].asSubordinate === false && g._calls.propose[0][1].tributeKcalPerWeek === 4000, g._calls.propose[0]);
  askCourtship(g, ctx);
  // Leadcourt-faithful: one proposal per daily invocation; a second
  // invocation the same day moves to the next candidate (v2), and a
  // third finds both on cooldown. The harness calls daily once a day,
  // so one invocation == one day in real runs.
  check('second invocation same day moves to next candidate', g._calls.propose.length === 2 && g._calls.propose[1][0] === 'v2', g._calls.propose);
  askCourtship(g, ctx);
  check('third invocation same day proposes nothing (both on cooldown)', g._calls.propose.length === 2, g._calls.propose);
  const g2 = fakeGame({ day: 30, pantry: 50000, ovs: [{ id: 'v1' }] });
  askCourtship(g2, ctx); // cooldown: v1 proposed day 25, 25+7=32 > 30
  check('7-day cooldown respected', g2._calls.propose.length === 0, g2._calls.propose);
  const g3 = fakeGame({ day: 32, pantry: 50000, ovs: [{ id: 'v1' }] });
  askCourtship(g3, ctx); // 25+7=32, not > 32? condition is (cool+7 > day) skip; 32 > 32 false -> propose
  check('cooldown lifts after 7 days', g3._calls.propose.length === 1, g3._calls.propose);
})();
(function () {
  const ctx = {};
  const links = [1, 2, 3].map(function (i) { return { id: 'l' + i, status: 'active', primary: 'haven', conquered: false, tendedWeek: 0 }; });
  const g = fakeGame({ day: 30, pantry: 50000, ovs: [{ id: 'v9' }], links: links });
  askCourtship(g, ctx);
  check('no propose at subs >= 3', g._calls.propose.length === 0, g._calls.propose);
})();
(function () {
  const ctx = {};
  const g = fakeGame({ day: 30, pantry: 50000, ovs: [{ id: 'v1' }], linked: true });
  askCourtship(g, ctx);
  check('no propose to already-linked village', g._calls.propose.length === 0, g._calls.propose);
})();

// 3. National/global are NOT answered (the documented adaptation).
(function () {
  const ctx = {};
  const g = fakeGame({ day: 30, pantry: 50000, ovs: [], pendingNational: { shape: 'lead' }, pendingGlobal: {} });
  askCourtship(g, ctx);
  check('pendingNational NOT answered', g._calls.national.length === 0, g._calls.national);
  check('pendingGlobal NOT answered', g._calls.global.length === 0, g._calls.global);
})();

// 4. Counter answers + tending.
(function () {
  const ctx = {};
  const g = fakeGame({ day: 10, pantry: 26000, pendingCounter: {} });
  askCourtship(g, ctx);
  check('rich pantry sweetens counter', g._calls.counter[0] === 'sweeten', g._calls.counter);
  const ctx2 = {};
  const g2 = fakeGame({ day: 10, pantry: 15000, pendingCounter: {} });
  askCourtship(g2, ctx2);
  check('lean pantry accepts counter', g2._calls.counter[0] === 'accept', g2._calls.counter);
  const ctx3 = {};
  const g3 = fakeGame({ day: 10, pantry: 21000, week: 5, links: [{ id: 'l1', status: 'active', primary: 'haven', tendedWeek: 4 }] });
  askCourtship(g3, ctx3);
  check('weekly tend fires when pantry > 20000', g3._calls.tend.length === 1, g3._calls.tend);
  const ctx4 = {};
  const g4 = fakeGame({ day: 10, pantry: 21000, week: 5, links: [{ id: 'l1', status: 'active', primary: 'haven', tendedWeek: 5 }] });
  askCourtship(g4, ctx4);
  check('no double-tend in same week', g4._calls.tend.length === 0, g4._calls.tend);
})();

// 5. Shape classifier.
check('shape LEAD', AN.linkShape({ primary: 'haven', subordinate: 'v1' }) === 'LEAD');
check('shape BELONG', AN.linkShape({ primary: 'v1', subordinate: 'haven' }) === 'BELONG');
check('shape LEAGUE covenant', AN.linkShape({ kind: 'covenant', a: 'haven', b: 'v1' }) === 'LEAGUE');
check('shape LEAGUE trade', AN.linkShape({ kind: 'trade', a: 'haven', b: 'v1' }) === 'LEAGUE');
check('shape OTHER', AN.linkShape({ kind: 'weird' }) === 'OTHER');

// 6. Diplomacy series extraction on a fabricated per-seed JSON.
(function () {
  const snap = function (day, diplo, reg, seas) {
    return {
      day: day, scholarId: 'p', tile: { x: 0, y: 0 }, ovs: [],
      linkFunnel: { total: 0, active: 0, seasoned: seas, regionalPlus: reg, seasonedNotRegional: 0, detail: [] },
      pending: { counter: false, accord: false, national: false, global: false },
      standing: { total: diplo, war: 0, diplomacy: diplo, plenty: 0 }, capped: diplo,
      peak: 0, scaleRank: 'village', readiness5: null, w4faced: false, w5faced: false,
      roster: [], livingCount: 0, pantryKcal: 0,
    };
  };
  const out = {
    seed: 1, policy: 'competent-askplus', run: 'askplus', anchorCommit: 'test',
    days: 3, gameDays: 3, endReason: 'x', won: false, villageLost: false, scaleRank: 'village',
    maxWave: 1, endUnlockedWave: 1, peakBeforeEndCall: 0, peakAfterEndCall: 0, endCallMovedPeak: false,
    daily: [snap(1, 0, 0, 0), snap(2, 34, 1, 1), snap(3, 0, 0, 0)],
    proposalEvents: [{ day: 2, fn: 'proposeLink', target: 'v1', ret: { ok: true } }],
    courtshipEvents: [{ day: 2, fn: 'tendLink', target: 'l1' }],
    travelCalls: [], linkFormedEvents: [{ day: 2, link: { primary: 'haven', subordinate: 'v1' } }],
    deathEvents: [], sayLines: [], wrapCounts: {}, instrumentErrors: [],
  };
  const s = AN.summarizeSeed(out);
  check('maxDiplomacy reads the series peak', s.maxDiplomacy === 34, s.maxDiplomacy);
  check('endDiplomacy reads the final snapshot (fragility visible)', s.endDiplomacy === 0, s.endDiplomacy);
  check('diploPositiveDays counts >0 snapshots', s.diploPositiveDays === 1, s.diploPositiveDays);
  check('regionalPlusDays counts', s.regionalPlusDays === 1, s.regionalPlusDays);
  check('link shape counted LEAD', s.linkShapeCounts.LEAD === 1, s.linkShapeCounts);
  check('tend counted', s.tendCalls === 1, s.tendCalls);
  check('proposal counted', s.proposalCalls === 1, s.proposalCalls);
})();

// 7. GO-bar judge semantics.
(function () {
  const mk = function (props, links, endDiplo, bad) {
    return { proposalCalls: props, linksFormed: links, endDiplomacy: endDiplo, instrumentErrors: bad || 0, ovMax: 5 };
  };
  const go = [mk(2, 1, 34), mk(1, 1, 68), mk(1, 0, 34), mk(1, 1, 0), mk(1, 0, 0), mk(1, 0, 0), mk(0, 0, 0), mk(0, 0, 0)];
  // propSeeds=6, linkSeeds=3, diploSeeds=3 -> GO
  check('judge GO at exactly the bar', AN.judgeAskplus(go).verdict === 'GO', AN.judgeAskplus(go));
  const nogo = go.slice(); nogo[0] = mk(0, 0, 0);
  check('judge NO-GO below proposal bar', AN.judgeAskplus(nogo).verdict === 'NO-GO', AN.judgeAskplus(nogo));
  const bad = go.map(function (x, i) { return i < 3 ? mk(1, 1, 34, 1) : x; });
  check('judge INSUFFICIENT-DATA with >2 bad seeds', AN.judgeAskplus(bad).verdict === 'INSUFFICIENT-DATA', AN.judgeAskplus(bad));
})();

// 7b. Counter-accepted correction: a counter answered and a link formed
// the next day must read as counter-accepted, not plain accepted.
(function () {
  const snap = function (day) {
    return {
      day: day, scholarId: 'p', tile: { x: 0, y: 0 }, ovs: [],
      linkFunnel: { total: 0, active: 0, seasoned: 0, regionalPlus: 0, seasonedNotRegional: 0, detail: [] },
      pending: { counter: false, accord: false, national: false, global: false },
      standing: { total: 0, war: 0, diplomacy: 0, plenty: 0 }, capped: 0,
      peak: 0, scaleRank: 'village', readiness5: null, w4faced: false, w5faced: false,
      roster: [], livingCount: 0, pantryKcal: 0,
    };
  };
  const out = {
    seed: 2, policy: 'competent-askplus', run: 'askplus', anchorCommit: 'test',
    days: 3, gameDays: 3, endReason: 'x', won: false, villageLost: false, scaleRank: 'village',
    maxWave: 1, endUnlockedWave: 1, peakBeforeEndCall: 0, peakAfterEndCall: 0, endCallMovedPeak: false,
    daily: [snap(1), snap(2), snap(3)],
    proposalEvents: [{ day: 1, fn: 'proposeLink', target: 'v1', ret: { ok: true } }],
    courtshipEvents: [{ day: 1, fn: 'answerCounter', target: null }],
    travelCalls: [], linkFormedEvents: [{ day: 2, link: { primary: 'v1', subordinate: 'haven' } }],
    deathEvents: [], sayLines: [], wrapCounts: {}, instrumentErrors: [],
  };
  const s = AN.summarizeSeed(out);
  check('counter-answered + next-day link reads counter-accepted', s.proposalOutcomes['counter-accepted'] === 1 && !s.proposalOutcomes.accepted, s.proposalOutcomes);
  check('counter-accepted link shapes BELONG', s.linkShapeCounts.BELONG === 1, s.linkShapeCounts);
})();

// 8. Strict say-line recount excludes capture-noise classes.
(function () {
  const out = { sayLines: [
    { line: 'COUNTER LEARNED: something' },
    { line: 'A keepsake bond with someone' },
    { line: 'Word will travel: Haven is clean hands (Opinion +2 with every village that knows you)' },
    { line: 'Haven proposes a bond to village_1' },
  ] };
  const r = AN.strictSayLines(out);
  check('strict recount keeps proposal + word-travel, drops noise', r.strictCount === 2 && r.wordTravel === 1, r);
})();

// 9. Live harness smoke (seed 12345, NOT a judged seed).
(async function () {
  try {
    const H = require(path.join(REPO, 'scripts', 'sim-harness'));
    const INST = require(path.join(REPO, 'scripts', 'diplo-instrument-20261104'));
    const { Game } = await H.loadGame({ seed: 12345, mode: 'askplus-smoke', fullTelemetry: false });
    await H.setupGame(Game);
    const inst = INST.install(Game);
    const wrapped = Object.assign({}, competentAskplus, {
      daily: function (Gm, ctx) {
        try { return competentAskplus.daily(Gm, ctx); } finally { inst.snapshot(); }
      },
    });
    let result = null;
    await H.quietLog(async function () { result = await H.runDays(Game, wrapped, { days: 2, manifest: undefined, sampleEvery: 30 }); });
    try { inst.snapshot(); } catch (e) { /* reported via instrumentErrors below */ }
    const t = inst.t;
    try { inst.uninstall(); } catch (e) {}
    check('smoke ran 2 days', result && result.days === 2, result);
    check('smoke snapshots recorded', t.daily.length >= 2, t.daily.length);
    check('smoke snapshot has standing + linkFunnel shape', !!(t.daily[0] && t.daily[0].standing && t.daily[0].linkFunnel), t.daily[0]);
    check('smoke 0 instrument errors', t.instrumentErrors.length === 0, t.instrumentErrors);
  } catch (e) {
    check('smoke harness runs without throwing', false, String(e && e.stack || e).slice(0, 500));
  }
  console.log('askplus proof: ' + pass + ' PASS, ' + fail + ' FAIL');
  process.exit(fail ? 1 : 0);
})();

// test-diplo-a.js — proof for the diplo instrument + analyzer
// (arm sim-diplo-a, run fleshout-20261110T1815Z). Zero src/js.
// RED->GREEN where a behavior is asserted: the classification, analyzer
// and neutrality tests fail before the instrument/analyzer exist
// (MODULE_NOT_FOUND on require) and pass after.
//
// Live legs use short miniatures on seed 150201 (the talkturn band — NOT
// a judged seed for this arm; the judged band is 170201–170208) and write
// nothing into the repo.
'use strict';
const assert = require('assert');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DI = require(path.join(REPO, 'scripts', 'diplo-instrument-20261110'));
const AN = require(path.join(REPO, 'scripts', 'diplo-analyze-20261110'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const INST = require(path.join(REPO, 'scripts', 'secondlink-instrument-20261110'));
const TT = require(path.join(REPO, 'scripts', 'talkturn-driver-20261110'));

let passed = 0, failed = 0;
function ok(name, fn) {
  try { fn(); passed++; console.log('PASS ' + name); }
  catch (e) { failed++; console.log('FAIL ' + name + ': ' + (e && e.message)); }
}
async function aok(name, fn) {
  try { await fn(); passed++; console.log('PASS ' + name); }
  catch (e) { failed++; console.log('FAIL ' + name + ': ' + (e && e.message)); }
}

// ---- Fixture builders (mirror the judged per-seed JSON shape) ----
function fakeLink(other, extra) {
  return Object.assign({
    key: 'haven|' + other, other: other, kind: null,
    primary: 'haven', subordinate: other, a: null, b: null,
    age: 5, trust: 30, conquered: false, status: 'active',
    seasoned: false, regional: false, reason: 'too-young',
  }, extra || {});
}
function fakeDay(day, extra) {
  return Object.assign({
    day: day, scholarId: 'scholar', standing: 100, scaleRank: 'village',
    polity: null, pending: { counter: false, accord: false, national: false, global: false },
    pendingRaises: [], raiseState: [], links: [], linkTotal: 0,
    villages: [], scholarLore: [], linkTickRoll: 0.6,
    raisers: [], eligibleRaisers: 0,
  }, extra || {});
}
function fakeDiploDay(day, extra) {
  return Object.assign({
    day: day,
    flags: { networkLive: false, nationalLive: false, globalLive: false, scaleRefused: false },
    pendingNational: null, pendingGlobal: null, pendingCounter: null, pendingAccord: false,
    foreignPolities: { count: 0, maxSize: 0, any4plus: false, entries: [] },
    linkKinds: { total: 0, primarySub: 0, covenant: 0, trade: 0, conquered: 0, active: 0 },
  }, extra || {});
}
function fakeSeed(extra) {
  return Object.assign({
    seed: 170201, days: 30, gameDays: 30, endReason: 'horizon', won: false,
    scaleRank: 'village', maxWave: 3, standing: 100, linkTotal: 0,
    instrumentErrors: [], daily: [fakeDay(1)], diploDaily: [fakeDiploDay(1)],
    bondEvents: [], stageCalls: [], acceptCalls: [], declineCalls: [],
    proposeCalls: [], linkTickCalls: 0,
    formLinkCalls: [], formPeerLinkCalls: [], verbCalls: [], wrapLive: {},
    talk: { talks: 0, turns: 0, linkPicks: 0, bondPicks: 0, talksWithRaiserPending: 0, deepConvos: 0, deepTurns: 0, talkEvents: [], turnEvents: [] },
    deaths: [],
  }, extra || {});
}

// ---- Unit: formation-path classification from stacks ----
ok('classifyFormPath: all six paths + other', function () {
  const mk = function (fn) { return 'Error\n    at Object._formLink (hierarchy.js:1:1)\n    at Object.' + fn + ' (hierarchy.js:2:2)\n    at daily (policy.js:3:3)'; };
  assert.strictEqual(DI.classifyFormPath(mk('proposeLink')), 'propose');
  assert.strictEqual(DI.classifyFormPath(mk('answerCounter')), 'counter');
  assert.strictEqual(DI.classifyFormPath(mk('answerRaid')), 'raid');
  assert.strictEqual(DI.classifyFormPath(mk('_ladderRewardLink')), 'ladder');
  assert.strictEqual(DI.classifyFormPath(mk('_proposePeer')), 'peer-propose');
  assert.strictEqual(DI.classifyFormPath(mk('somethingElse')), 'other');
  assert.strictEqual(DI.classifyFormPath(''), 'other');
  assert.strictEqual(DI.classifyFormPath(null), 'other');
});
ok('classifyPeerFormPath: peer-counter / peer-propose / other', function () {
  const mk = function (fn) { return 'Error\n    at Object._formPeerLink (hierarchy.js:1:1)\n    at Object.' + fn + ' (hierarchy.js:2:2)'; };
  assert.strictEqual(DI.classifyPeerFormPath(mk('answerCounter')), 'peer-counter');
  assert.strictEqual(DI.classifyPeerFormPath(mk('_proposePeer')), 'peer-propose');
  assert.strictEqual(DI.classifyPeerFormPath(mk('proposeLink')), 'other');
});
ok('classifyReturn: formed / counter / true / null / number / str', function () {
  assert.strictEqual(DI.classifyReturn({ id: 'link_1' }), 'formed');
  assert.strictEqual(DI.classifyReturn('counter'), 'counter');
  assert.strictEqual(DI.classifyReturn(true), 'true');
  assert.strictEqual(DI.classifyReturn(null), 'null');
  assert.strictEqual(DI.classifyReturn(undefined), 'null');
  assert.strictEqual(DI.classifyReturn(1500), 'number');
  assert.strictEqual(DI.classifyReturn('deferred'), 'str:deferred');
});

// ---- Unit: analyzer fixtures ----
ok('analyzer: link formed via propose is classified propose, first link', function () {
  const j = fakeSeed({
    daily: [
      fakeDay(1),
      fakeDay(15, { links: [fakeLink('village_2')], linkTotal: 1 }),
      fakeDay(30, { links: [fakeLink('village_2', { age: 20 })], linkTotal: 1 }),
    ],
    formLinkCalls: [{ day: 15, targetId: 'village_2', path: 'propose', birth: '_formLink', kind: null }],
  });
  const r = AN.analyzeSeed(j);
  assert.strictEqual(r.formation.paths.propose, 1);
  assert.strictEqual(r.formation.unclassified, 0);
  assert.strictEqual(r.formation.linksEver, 1);
  assert.strictEqual(r.formation.first.path, 'propose');
  assert.strictEqual(r.formation.first.day, 15);
  assert.deepStrictEqual(r.formation.distinctTargets, ['village_2']);
  assert.strictEqual(r.firstLink.other, 'village_2');
});
ok('analyzer: ladder first link + counter staged then answered', function () {
  const j = fakeSeed({
    daily: [
      fakeDay(1),
      fakeDay(12, { links: [fakeLink('village_0')], linkTotal: 1 }),
      fakeDay(20, { links: [fakeLink('village_0', { age: 13 }), fakeLink('village_1')], linkTotal: 2 }),
      fakeDay(30, { links: [fakeLink('village_0', { age: 23 }), fakeLink('village_1', { age: 10 })], linkTotal: 2 }),
    ],
    formLinkCalls: [
      { day: 12, targetId: 'village_0', path: 'ladder', birth: '_formLink', kind: null },
      { day: 20, targetId: 'village_1', path: 'counter', birth: '_formLink', kind: null },
    ],
    proposeCalls: [{ day: 19, villageId: 'village_1', outcome: 'counter' }],
    verbCalls: [
      { day: 20, verb: 'answerCounter', target: null, how: 'accept', outcome: 'formed', retNumber: null },
    ],
  });
  const r = AN.analyzeSeed(j);
  assert.strictEqual(r.formation.paths.ladder, 1);
  assert.strictEqual(r.formation.paths.counter, 1);
  assert.strictEqual(r.formation.first.path, 'ladder');
  assert.strictEqual(r.verbs['answerCounter:formed'], 1);
  assert.strictEqual(r.verbs['answerCounter:total'], 1);
});
ok('analyzer: unclassified formation path is counted, not hidden', function () {
  const j = fakeSeed({
    daily: [fakeDay(1), fakeDay(9, { links: [fakeLink('village_3')], linkTotal: 1 })],
    formLinkCalls: [{ day: 9, targetId: 'village_3', path: 'other', birth: '_formLink', kind: null }],
  });
  const r = AN.analyzeSeed(j);
  assert.strictEqual(r.formation.unclassified, 1);
  assert.strictEqual(r.formation.paths.other, 1);
});
ok('analyzer: person-bond accept/decline by chance band, staged fate reconciled', function () {
  const j = fakeSeed({
    bondEvents: [
      { day: 5, initiator: 'ana', target: 'bo', kind: 'person', outcome: 'accepted', chance: 80, reason: null },
      { day: 6, initiator: 'cy', target: 'di', kind: 'person', outcome: 'refused', chance: 20, reason: null },
      { day: 7, initiator: 'eli', target: 'scholar', kind: 'person', outcome: 'staged', chance: null, reason: null },
      { day: 8, initiator: 'eli', target: 'scholar', kind: 'person', outcome: 'accepted', chance: null, reason: null },
      { day: 9, initiator: 'fay', target: 'scholar', kind: 'person', outcome: 'staged', chance: null, reason: null },
      { day: 12, initiator: 'fay', target: 'scholar', kind: 'person', outcome: 'expired', chance: null, reason: null },
    ],
    daily: [fakeDay(1), fakeDay(30)],
  });
  const r = AN.analyzeSeed(j);
  assert.strictEqual(r.person.staged, 2);
  assert.strictEqual(r.person.stagedFates.accepted, 1);
  assert.strictEqual(r.person.stagedFates.expired, 1);
  assert.strictEqual(r.person.decisions.accepted, 1);
  assert.strictEqual(r.person.decisions.refused, 1);
  assert.strictEqual(r.person.chanceBands['75-95'], 1);
  assert.strictEqual(r.person.chanceBands['5-24'], 1);
  assert.strictEqual(r.person.reconcile.bad.length, 0);
});
ok('analyzer: staged person-bond with no decision and not at end is irreconcilable', function () {
  const j = fakeSeed({
    bondEvents: [
      { day: 7, initiator: 'eli', target: 'scholar', kind: 'person', outcome: 'staged', chance: null, reason: null },
    ],
    daily: [fakeDay(1), fakeDay(30)],
  });
  const r = AN.analyzeSeed(j);
  assert.strictEqual(r.person.reconcile.bad.length, 1);
  assert.strictEqual(r.person.reconcile.bad[0].vid, 'eli');
});
ok('analyzer: foreign polity >=4 detected with first day', function () {
  const j = fakeSeed({
    diploDaily: [
      fakeDiploDay(1),
      fakeDiploDay(10, { foreignPolities: { count: 2, maxSize: 4, any4plus: true, entries: [{ primary: 'village_0', subs: ['village_1', 'village_2', 'village_3'], day: 9 }] } }),
      fakeDiploDay(30, { foreignPolities: { count: 2, maxSize: 4, any4plus: true, entries: [{ primary: 'village_0', subs: ['village_1', 'village_2', 'village_3'], day: 9 }] } }),
    ],
  });
  const r = AN.analyzeSeed(j);
  assert.strictEqual(r.foreign.any4plus, true);
  assert.strictEqual(r.foreign.first4plusDay, 10);
  assert.strictEqual(r.foreign.maxSize, 4);
  assert.strictEqual(r.foreign.maxCount, 2);
});
ok('analyzer: polity first day + shape from snapshots; seasoned at end', function () {
  const j = fakeSeed({
    daily: [
      fakeDay(1),
      fakeDay(40, { links: [fakeLink('village_0', { age: 35, trust: 45, seasoned: true })], linkTotal: 1, polity: { shape: 'lead', size: 4, villages: ['haven', 'village_0'] } }),
      fakeDay(60, { links: [fakeLink('village_0', { age: 55, trust: 50, seasoned: true })], linkTotal: 1, polity: { shape: 'lead', size: 4, villages: ['haven', 'village_0'] } }),
    ],
    diploDaily: [fakeDiploDay(1), fakeDiploDay(40, { flags: { networkLive: true, nationalLive: true, globalLive: false, scaleRefused: false } })],
  });
  const r = AN.analyzeSeed(j);
  assert.strictEqual(r.polity.ever, true);
  assert.strictEqual(r.polity.firstDay, 40);
  assert.strictEqual(r.polity.shape, 'lead');
  assert.strictEqual(r.national.firstDay, 40);
  assert.strictEqual(r.seasonedAtEnd, 1);
});
ok('neutralityCheck: identical passes; days / standing / missing fail with reasons', function () {
  const base = { days: 100, standing: 250 };
  assert.deepStrictEqual(AN.neutralityCheck(base, base), { daysExact: true, standingExact: true, mismatch: null });
  assert.strictEqual(AN.neutralityCheck({ days: 99, standing: 250 }, base).mismatch.why, 'days');
  assert.strictEqual(AN.neutralityCheck({ days: 100, standing: 200 }, base).mismatch.why, 'standing');
  assert.strictEqual(AN.neutralityCheck(null, base).mismatch.why, 'missing-leg-file');
  assert.strictEqual(AN.neutralityCheck(base, null).mismatch.why, 'missing-leg-file');
});

// ---- Live legs ----
async function miniRun(seed, days, talkMode) {
  TT.setTalkFlag(talkMode);
  const { Game } = await loadGame({ seed: seed, mode: 'competent-diplo-test', fullTelemetry: false });
  await setupGame(Game);
  const inst = INST.install(Game);
  const di = DI.install(Game);
  const rec = TT.createTalkRecorder(Game);
  rec.install();
  let lastSnapDay = -1;
  const gday = function () { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } };
  const wrapped = Object.assign({}, competent, {
    daily: function (Gm, ctx) {
      try { return competent.daily(Gm, ctx); } finally {
        try {
          inst.installTeleLazy();
          rec.snapshotDay();
          const d = gday();
          if (d !== lastSnapDay) { lastSnapDay = d; inst.snapshot(); di.snapshot(); }
        } catch (e) {}
      }
    },
  });
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: days, manifest: undefined, sampleEvery: 30 }); });
  try { inst.snapshot(); } catch (e) {}
  try { di.snapshot(); } catch (e) {}
  inst.uninstall(); di.uninstall(); rec.uninstall();
  let standing = null;
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  TT.setTalkFlag('control');
  return {
    days: result.days, standing: standing,
    errors: inst.t.instrumentErrors.concat(di.t.instrumentErrors).concat(rec.t.errors),
    bondEvents: inst.t.bondEvents,
    formLinkCalls: di.t.formLinkCalls, formPeerLinkCalls: di.t.formPeerLinkCalls,
    verbCalls: di.t.verbCalls, wrapLive: di.t.wrapLive,
    talks: rec.t.talks, turns: rec.t.turns,
  };
}

(async function () {
  await aok('live: diplo instrument installs, all wraps present, zero errors on 12d armed', async function () {
    const r = await miniRun(150201, 12, 'armed');
    assert.strictEqual(r.errors.length, 0, 'instrument errors: ' + JSON.stringify(r.errors));
    assert.ok(r.talks > 0, 'talks recorded');
    assert.ok(r.turns > 0, 'held turns recorded');
    console.log('    (12d armed: days=' + r.days + ' talks=' + r.talks + ' turns=' + r.turns + ' bondEvents=' + r.bondEvents.length + ')');
  });

  await aok('live: verb wraps intercept — one recorded call per verb on a fixture game', async function () {
    const { Game } = await loadGame({ seed: 150201, mode: 'competent-diplo-test', fullTelemetry: false });
    await setupGame(Game);
    const origFormLink = Game._formLink;
    const origFormPeer = Game._formPeerLink;
    const di = DI.install(Game);
    assert.notStrictEqual(Game._formLink, origFormLink, '_formLink wrapped');
    assert.notStrictEqual(Game._formPeerLink, origFormPeer, '_formPeerLink wrapped');
    const verbs = [
      ['proposeCovenant', ['village_0']], ['proposeTrade', ['village_0']],
      ['raidVillage', ['village_0']], ['answerCounter', ['accept']],
      ['answerAccord', ['gift']], ['answerNationalChoice', ['feast']],
      ['answerGlobalChoice', ['feast']], ['bidForPrimacy', ['link_x']],
      ['tendLink', ['link_x']],
    ];
    verbs.forEach(function (spec) {
      try { Game[spec[0]].apply(Game, spec[1]); } catch (e) { /* guard returns vary; the wrap records either way */ }
    });
    di.uninstall();
    assert.strictEqual(Game._formLink, origFormLink, '_formLink restored');
    assert.strictEqual(Game._formPeerLink, origFormPeer, '_formPeerLink restored');
    assert.strictEqual(di.t.instrumentErrors.length, 0, 'install errors: ' + JSON.stringify(di.t.instrumentErrors));
    verbs.forEach(function (spec) {
      const seen = di.t.verbCalls.filter(function (v) { return v.verb === spec[0]; }).length;
      assert.strictEqual(seen, 1, spec[0] + ' recorded exactly once, got ' + seen);
      assert.strictEqual(di.t.wrapLive[spec[0]], true, spec[0] + ' wrap live');
    });
    console.log('    (verbs recorded: ' + di.t.verbCalls.map(function (v) { return v.verb + ':' + v.outcome; }).join(', ') + ')');
  });

  await aok('live: 30d armed miniature forms a link with a classified path (no other)', async function () {
    const r = await miniRun(150201, 30, 'armed');
    assert.strictEqual(r.errors.length, 0, 'instrument errors: ' + JSON.stringify(r.errors));
    assert.ok(r.formLinkCalls.length >= 1, 'at least one link formed in 30d, got ' + r.formLinkCalls.length);
    assert.strictEqual(r.wrapLive._formLink, true, '_formLink wrap observed live');
    r.formLinkCalls.forEach(function (c) {
      assert.notStrictEqual(c.path, 'other', 'formation path classified, got other: ' + JSON.stringify(c));
    });
    const linkStaged = r.bondEvents.filter(function (e) { return e.kind === 'link' && e.outcome === 'staged'; }).length;
    assert.ok(linkStaged >= 1, 'at least one link raise staged, got ' + linkStaged);
    console.log('    (30d armed: days=' + r.days + ' formations=' + JSON.stringify(r.formLinkCalls.map(function (c) { return c.path + '@d' + c.day; })) + ' linkStaged=' + linkStaged + ')');
  });

  await aok('live: 12d determinism — same seed twice, identical diplo counters', async function () {
    const a = await miniRun(150201, 12, 'armed');
    const b = await miniRun(150201, 12, 'armed');
    const pick = function (r) { return { days: r.days, standing: r.standing, talks: r.talks, turns: r.turns, bondEvents: r.bondEvents, formLinks: r.formLinkCalls, verbs: r.verbCalls }; };
    assert.deepStrictEqual(pick(a), pick(b), '12d armed deterministic');
    console.log('    (12d armed x2: days=' + a.days + ' standing=' + a.standing + ')');
  });

  await aok('live: 12d neutrality miniature — instrument ON vs OFF, days + standing identical', async function () {
    async function shortRun(withInst) {
      TT.setTalkFlag('control');
      const { Game } = await loadGame({ seed: 150201, mode: 'competent-diplo-test', fullTelemetry: false });
      await setupGame(Game);
      let inst = null, di = null;
      if (withInst) { inst = INST.install(Game); di = DI.install(Game); }
      let lastSnapDay = -1;
      const gday = function () { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } };
      const wrapped = Object.assign({}, competent, {
        daily: function (Gm, ctx) {
          try { return competent.daily(Gm, ctx); } finally {
            try {
              if (inst) inst.installTeleLazy();
              const d = gday();
              if (inst && d !== lastSnapDay) { lastSnapDay = d; inst.snapshot(); di.snapshot(); }
            } catch (e) {}
          }
        },
      });
      let result = null;
      await quietLog(async function () { result = await runDays(Game, wrapped, { days: 12, manifest: undefined, sampleEvery: 30 }); });
      if (inst) inst.uninstall();
      if (di) di.uninstall();
      let standing = null;
      try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
      TT.setTalkFlag('control');
      return { days: result.days, standing: standing, errors: inst ? inst.t.instrumentErrors.concat(di.t.instrumentErrors) : [] };
    }
    const on = await shortRun(true);
    const off = await shortRun(false);
    assert.strictEqual(on.errors.length, 0, 'ON errors: ' + JSON.stringify(on.errors));
    assert.strictEqual(on.days, off.days, 'ON days == OFF days: ' + on.days + ' vs ' + off.days);
    assert.strictEqual(on.standing, off.standing, 'ON standing == OFF standing: ' + on.standing + ' vs ' + off.standing);
    console.log('    (12d neutral miniature: days=' + on.days + ' standing=' + on.standing + ')');
  });

  console.log('test-diplo-a: ' + passed + ' passed, ' + failed + ' failed');
  process.exitCode = failed ? 1 : 0;
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

// test-journey-scale-r109-sit-20261107.js — proof for journey-scale r109.
// Fixture tests for the sit+modal composition (gates, seat verb, door rule,
// raise-talk record) + a live harness smoke leg (97001 armed, short, /tmp).
// Green BEFORE any judged sim.
// Usage: node scripts/test-journey-scale-r109-sit-20261107.js
'use strict';
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const SIT = require(path.join(REPO, 'scripts', 'policies', 'scalecourt-nogate-morntrace3-linkraise-sit'));
const LR = require(path.join(REPO, 'scripts', 'policies', 'scalecourt-nogate-morntrace3-linkraise'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const MP = require(path.join(REPO, 'scripts', 'policies', 'modalplay'));

let passed = 0;
function check(name, fn) {
  try { fn(); passed += 1; console.log('ok ' + passed + ' - ' + name); }
  catch (e) { console.error('FAIL - ' + name + '\n  ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join('\n  ') : e)); process.exitCode = 1; }
}
function withEnv(env, fn) {
  const saved = {};
  for (const k of Object.keys(env)) { saved[k] = process.env[k]; if (env[k] === undefined) delete process.env[k]; else process.env[k] = env[k]; }
  try { return fn(); } finally { for (const k of Object.keys(env)) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; } }
}

// --- Fake Game (linkraise half — the r108 fixture shape) ------------------
function fakeGame(overrides) {
  const calls = { talkTo: [], convoTurn: [], endConvo: [], acceptLinkRaise: [] };
  const g = {
    over: false,
    state: {
      scholar: { day: 10 },
      village: { pantry: [], roster: ['scholar1', 'rosa', 'leo'], trust: { rosa: 30, leo: 25 }, linkRaises: {} },
      otherVillages: [],
      pendingCounter: null, pendingAccord: null, pendingNational: null, pendingGlobal: null,
    },
    villagerId: 'scholar1',
    representative: function () { return { id: 'leo', standing: 40 }; },
    regionalStanding: function () { return 0; },
    villageStandingOf: function () { return 0; },
    isAllied: function () { return false; },
    knowsVillage: function () { return true; },
    linkWith: function (vid) { return (g._linkedVillage === vid) ? { id: 'link_x' } : null; },
    hierarchyState: function () { return []; },
    getPerson: function (vid) { return { id: vid, dead: false }; },
    acceptLinkRaise: function (vid) { calls.acceptLinkRaise.push(vid); return { ok: true, villageId: g._acceptVillage }; },
    talkTo: function (vid) { calls.talkTo.push(vid); g._convoActive = true; return 'Hello.'; },
    convoGet: function () { return { active: !!g._convoActive, exchanges: 0, transcript: g._transcript || [] }; },
    convoChoices: function () { return g._choices || []; },
    convoTurn: function (vid, id) {
      calls.convoTurn.push(id);
      if (id === 'link:accept') {
        if (g._acceptLinks) g._linkedVillage = g._acceptVillage;
        g.acceptLinkRaise(vid);
      }
      return { line: 'x', choices: [], ended: !!g._endAfterTurn, transcript: [] };
    },
    endConvo: function (vid, how) { calls.endConvo.push([vid, how]); g._convoActive = false; },
    _calls: calls,
    _convoActive: false, _choices: [], _acceptLinks: false, _acceptVillage: null, _linkedVillage: null,
    _endAfterTurn: false, _transcript: [],
  };
  if (overrides) Object.assign(g, overrides);
  return g;
}
function raiseGame(villageId, opinion, raiser) {
  const g = fakeGame();
  g.state.otherVillages = [{ id: villageId, name: villageId, opinion: opinion }];
  g.state.village.linkRaises = {};
  g.state.village.linkRaises[raiser || 'rosa'] = { villageId: villageId, day: 10 };
  return g;
}

// --- Fake Game (table half — seat preview + modal) ------------------------
function tableGame(overrides) {
  const calls = { takeSeat: [], tableOptions: [], previews: 0 };
  const g = {
    over: false, won: false,
    state: { scholar: { day: 120, tableChoices: null }, village: { roster: ['scholar1'], trust: {} } },
    villagerId: 'scholar1',
    _pg: { tableDone: false, tableWaiting: true, tableAnnounced: true, arc: 4 },
    _preview: { seat: 'lesser', ready: true, why: null },
    _earned: [
      { id: 'beloved', earned: true, strength: 40 },
      { id: 'feared', earned: true, strength: 60 },
      { id: 'relay', earned: true, strength: 60 },
      { id: 'assimilated', earned: true, strength: 10 },
    ],
    _modalOptions: null,
    progState: function () { return g._pg; },
    getPerson: function (vid) { return { id: vid, dead: false }; },
    tablePreview: function () { calls.previews += 1; return g._preview; },
    tableTakeSeat: function (sitterId) {
      calls.takeSeat.push(sitterId === undefined ? null : sitterId);
      if (!g._preview || !g._preview.ready) return { ok: false, msg: 'not ready' };
      g._pg.tableDone = true;
      g.state.scholar.tableChoices = { frame: 'the Table', prompt: 'Choose your door.', options: (g._modalOptions || [{ id: 'path:beloved', label: 'Beloved' }, { id: 'path:feared', label: 'Feared' }, { id: 'path:relay', label: 'Relay' }]).slice() };
      return { ok: true, msg: '' };
    },
    tableEarnedPaths: function () { return g._earned.slice(); },
    chooseTableOption: function (id) {
      calls.tableOptions.push(id);
      g.state.scholar.tableChoices = null; // the pick resolves the offer
      return null;
    },
    _calls: calls,
  };
  if (overrides) Object.assign(g, overrides);
  return g;
}

// --- Policy shape --------------------------------------------------------
check('policy: sit wrapper composes linkraise (own id, same re-exports)', function () {
  assert.strictEqual(SIT.sitPolicy.id, 'scalecourt-linkraise-sit');
  assert.strictEqual(typeof SIT.sitPolicy.daily, 'function');
  assert.strictEqual(SIT.resetLinkraiseStats, LR.resetLinkraiseStats);
  assert.strictEqual(SIT.linkraiseStats, LR.linkraiseStats);
  assert.strictEqual(SIT.COURT_READY, 55);
});

// --- Seat drive (direct, fake Game) --------------------------------------
check('seat: preview ready + scholar alive + not exiled -> takeSeat called once, seat taken', function () {
  const g = tableGame();
  const ctx = {};
  SD.driveSeat(g, ctx);
  assert.strictEqual(g._calls.takeSeat.length, 1);
  assert.strictEqual(ctx.sdSeatAttempts, 1);
  assert.strictEqual(ctx.sdSeatTaken, 1);
  assert.strictEqual(ctx.sdSeatDay, 120);
  assert.strictEqual(ctx.sdSeatKind, 'lesser');
  assert.strictEqual(g._pg.tableDone, true);
});
check('seat: preview null -> no attempt, no error', function () {
  const g = tableGame({ _preview: null });
  const ctx = {};
  SD.driveSeat(g, ctx);
  assert.strictEqual(g._calls.takeSeat.length, 0);
  assert.strictEqual(ctx.sdSeatAttempts || 0, 0);
  assert.strictEqual(ctx.sdPreviewSeen || 0, 0);
});
check('seat: preview not ready -> seen, never attempted', function () {
  const g = tableGame({ _preview: { seat: 'lesser', ready: false, why: 'deeds short' } });
  const ctx = {};
  SD.driveSeat(g, ctx);
  assert.strictEqual(ctx.sdPreviewSeen, 1);
  assert.strictEqual(ctx.sdSeatAttempts || 0, 0);
  assert.strictEqual(g._calls.takeSeat.length, 0);
});
check('seat: exiled scholar -> guard refusal, never an attempt', function () {
  const g = tableGame();
  g.state.scholar.exiled = true;
  const ctx = {};
  SD.driveSeat(g, ctx);
  assert.strictEqual(ctx.sdGuardRefused, 1);
  assert.strictEqual(ctx.sdSeatAttempts || 0, 0);
  assert.strictEqual(g._calls.takeSeat.length, 0);
});
check('seat: tableDone already -> nothing driven', function () {
  const g = tableGame();
  g._pg.tableDone = true;
  const ctx = {};
  SD.driveSeat(g, ctx);
  assert.strictEqual(g._calls.takeSeat.length, 0);
  assert.strictEqual(ctx.sdSeatAttempts || 0, 0);
});

// --- Modal drain (direct, fake Game) --------------------------------------
check('modal: door rule picks highest-strength earned door, tie-break by preference (feared over relay at 60)', function () {
  withEnv({ MODALPLAY: '1' }, function () {
    const g = tableGame();
    const ctx = {};
    g.tableTakeSeat();
    MP.drainModal(g, ctx);
    assert.deepStrictEqual(g._calls.tableOptions, ['path:feared']);
    assert.strictEqual(ctx.mpDoorsPlayed, 1);
    assert.strictEqual(ctx.mpAnswers, 1);
  });
});
check('modal: no earned door offered -> no honest pick, no call', function () {
  withEnv({ MODALPLAY: '1' }, function () {
    const g = tableGame({ _earned: [{ id: 'witness', earned: false, strength: 0 }] });
    const ctx = {};
    g.tableTakeSeat();
    MP.drainModal(g, ctx);
    assert.strictEqual(g._calls.tableOptions.length, 0);
    assert.strictEqual(ctx.mpDoorNoHonest, 1);
  });
});
check('modal: beat rule never picks the trial', function () {
  const g = tableGame();
  const ctx = {};
  const pick = MP.pickOption(g, [{ id: 'trial:combat', label: 'Trial by combat' }, { id: 'beat:cold', label: 'Cold open' }], ctx);
  assert.ok(pick && pick.id === 'beat:cold');
  assert.strictEqual(ctx.mpTrialSkipped, 1);
});
check('modal: gate off -> drain is inert (pure delegation)', function () {
  withEnv({ MODALPLAY: undefined }, function () {
    const g = tableGame();
    const ctx = {};
    g.tableTakeSeat();
    MP.drainModal(g, ctx);
    assert.strictEqual(g._calls.tableOptions.length, 0);
    assert.strictEqual(ctx.mpAnswers || 0, 0);
  });
});

// --- Composition (fake base — the same nesting the sit module uses) -------
check('composition: sit opens the modal and the drain plays it the SAME daily, then base daily runs', function () {
  withEnv({ SEATDRIVE: '1', MODALPLAY: '1' }, function () {
    const order = [];
    const base = { id: 'fake-base', daily: function (G, ctx) { order.push('base'); } };
    const composed = SD.withSeatDrive(MP.withModalPlay(base, 'fake-modal', 'd'), 'fake-sit', 'd');
    const g = tableGame();
    const ctx = {};
    composed.daily(g, ctx);
    assert.deepStrictEqual(order, ['base']);
    assert.strictEqual(g._calls.takeSeat.length, 1, 'seat taken');
    assert.deepStrictEqual(g._calls.tableOptions, ['path:feared'], 'door played the same dawn');
    assert.strictEqual(ctx.sdSeatTaken, 1);
    assert.strictEqual(ctx.mpDoorsPlayed, 1);
  });
});
check('composition: gates off -> pure delegation, no verb called, base daily still runs', function () {
  withEnv({ SEATDRIVE: '0', MODALPLAY: undefined }, function () {
    const order = [];
    const base = { id: 'fake-base', daily: function (G, ctx) { order.push('base'); } };
    const composed = SD.withSeatDrive(MP.withModalPlay(base, 'fake-modal', 'd'), 'fake-sit', 'd');
    const g = tableGame();
    const ctx = {};
    composed.daily(g, ctx);
    assert.deepStrictEqual(order, ['base']);
    assert.strictEqual(g._calls.takeSeat.length, 0, 'no sit when gated off');
    assert.strictEqual(g._calls.tableOptions.length, 0, 'no drain when gated off');
    assert.strictEqual(ctx.sdSeatTaken || 0, 0);
    assert.strictEqual(ctx.mpDoorsPlayed || 0, 0);
  });
});

// --- Raise-talk record (r109 read-only addition) ---------------------------
check('raise-talk: accepted raise records the transcript; counters unchanged', function () {
  LR.resetLinkraiseStats();
  const g = raiseGame('emberhold', 20);
  g._choices = [{ id: 'link:accept', label: '"All right. Let\'s ask them."' }];
  g._acceptLinks = true;
  g._acceptVillage = 'emberhold';
  g._transcript = [
    { who: 'them', text: "I've heard good things about Emberhold. We should link with them." },
    { who: 'you', text: "All right — let's ask them." },
  ];
  LR.linkRaiseDrive(g, {});
  assert.strictEqual(LR.linkraiseStats().raisesAnswered, 1);
  assert.strictEqual(LR.linkraiseStats().raisesLinked, 1);
  assert.strictEqual(LR.linkraiseStats().errors, 0);
  const talks = LR.linkraiseStats().raiseTalks;
  assert.strictEqual(talks.length, 1);
  assert.strictEqual(talks[0].outcome, 'accepted');
  assert.strictEqual(talks[0].village, 'emberhold');
  assert.strictEqual(talks[0].lines.length, 2);
  assert.strictEqual(talks[0].lines[0].text, "I've heard good things about Emberhold. We should link with them.");
  // The record mutates no game state: the raise is still there, no new keys.
  assert.deepStrictEqual(Object.keys(g.state.village.linkRaises), ['rosa']);
});
check('raise-talk: talk-failed raise records an empty transcript, still counted', function () {
  LR.resetLinkraiseStats();
  const g = raiseGame('emberhold', 20);
  g.talkTo = function (vid) { g._calls.talkTo.push(vid); return null; };
  g.convoGet = function () { return { active: false, transcript: [] }; };
  LR.linkRaiseDrive(g, {});
  assert.strictEqual(LR.linkraiseStats().raisesTalkFailed, 1);
  const talks = LR.linkraiseStats().raiseTalks;
  assert.strictEqual(talks.length, 1);
  assert.strictEqual(talks[0].outcome, 'talk-failed');
  assert.deepStrictEqual(talks[0].lines, []);
});
check('raise-talk: reset clears the record', function () {
  LR.resetLinkraiseStats();
  assert.deepStrictEqual(LR.linkraiseStats().raiseTalks, []);
});

// --- Live smoke leg ------------------------------------------------------
// Armed driver, seed 97001, DAYCAP=60, evidence to /tmp (never the repo).
// Asserts wiring only: the run completes, the census carries the sit/modal
// ledgers with 0 policy errors, the regional corpus has rows, the recorder
// reports 0 errors. (60 days is before day 90, so no seat can price yet —
// the sit path is pinned by the fixture tests above, not the smoke.)
check('live smoke: armed driver seed 97001 DAYCAP=60 completes, ledgers clean', function () {
  const tmp = '/tmp/journey-scale-r109-smoke';
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  execFileSync('node', ['scripts/journey-scale-r109-20261107.js'], {
    cwd: REPO,
    env: Object.assign({}, process.env, { SEEDS: '97001', DAYCAP: '60', EVIDIR: tmp }),
    stdio: 'pipe', timeout: 600000,
  });
  const trust = JSON.parse(fs.readFileSync(path.join(tmp, 'journey-scale-r109-trust-97001.json'), 'utf8'));
  assert.ok(trust.census, 'trust json has a census');
  assert.ok(trust.census.linkraise, 'census carries the linkraise ledger');
  assert.strictEqual(trust.census.linkraise.errors, 0, '0 policy errors on the smoke leg');
  assert.ok(trust.census.sitStats, 'census carries the sit ledger');
  assert.ok(trust.census.modalStats, 'census carries the modal ledger');
  assert.strictEqual(trust.census.sit, true, 'smoke ran the armed leg');
  assert.strictEqual(trust.census.sitStats.driveError, 0, '0 sit-drive errors');
  assert.strictEqual(trust.census.modalStats.driveError, 0, '0 modal-drive errors');
  const reg = JSON.parse(fs.readFileSync(path.join(tmp, 'journey-scale-r109-regional-97001.json'), 'utf8'));
  assert.ok((reg.daily || []).length > 0, 'regional corpus has rows');
  assert.strictEqual((reg.instrumentErrors || []).length, 0, '0 recorder errors on the smoke leg');
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
});

console.log(passed + ' passed');

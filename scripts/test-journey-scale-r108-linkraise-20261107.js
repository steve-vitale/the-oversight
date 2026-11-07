// test-journey-scale-r108-linkraise-20261107.js — proof for journey-scale r108.
// Fixture tests for the link-raise policy step (gating, conversation raise
// answers, non-answers) + a live harness smoke leg (97001 armed, short,
// /tmp). Green BEFORE any judged sim.
// Usage: node scripts/test-journey-scale-r108-linkraise-20261107.js
'use strict';
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const LR = require(path.join(REPO, 'scripts', 'policies', 'scalecourt-nogate-morntrace3-linkraise'));
const LD = require(path.join(REPO, 'scripts', 'policies', 'competent-linkdrive-b'));

let passed = 0;
function check(name, fn) {
  try { fn(); passed += 1; console.log('ok ' + passed + ' - ' + name); }
  catch (e) { console.error('FAIL - ' + name + '\n  ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join('\n  ') : e)); process.exitCode = 1; }
}

// --- Fake Game -----------------------------------------------------------
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
    convoGet: function () { return { active: !!g._convoActive, exchanges: 0 }; },
    convoChoices: function () { return g._choices || []; },
    convoTurn: function (vid, id) {
      calls.convoTurn.push(id);
      // Faithful to the real engine: bondTurn routes link:accept through
      // G.acceptLinkRaise (the instrument's wrapped verb), so the verb is
      // only ever reached via a conversation turn — never bare.
      if (id === 'link:accept') {
        if (g._acceptLinks) g._linkedVillage = g._acceptVillage;
        g.acceptLinkRaise(vid);
      }
      return { line: 'x', choices: [], ended: !!g._endAfterTurn, transcript: [] };
    },
    endConvo: function (vid, how) { calls.endConvo.push([vid, how]); g._convoActive = false; },
    _calls: calls,
    _convoActive: false, _choices: [], _acceptLinks: false, _acceptVillage: null, _linkedVillage: null,
    _endAfterTurn: false,
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

// --- Policy shape --------------------------------------------------------
check('policy: linkraise wraps scalecourt (same base id family, own id)', function () {
  assert.strictEqual(LR.linkraisePolicy.id, 'scalecourt-linkraise');
  assert.strictEqual(typeof LR.linkraisePolicy.daily, 'function');
  assert.strictEqual(LR.COURT_READY, 55);
  assert.strictEqual(typeof LR.linkRaiseDrive, 'function');
  assert.strictEqual(typeof LR.resetLinkraiseStats, 'function');
  assert.strictEqual(typeof LR.linkraiseStats, 'function');
});

// --- Raise gating --------------------------------------------------------
check('no raises: no talks, no answers, no errors', function () {
  LR.resetLinkraiseStats();
  const g = fakeGame();
  LR.linkRaiseDrive(g, {});
  assert.strictEqual(g._calls.talkTo.length, 0);
  assert.strictEqual(g._calls.acceptLinkRaise.length, 0);
  assert.deepStrictEqual(LR.linkraiseStats().errors, 0);
});
check('not-ready raise (det sub < 55): skipped, never talked to', function () {
  LR.resetLinkraiseStats();
  const g = raiseGame('emberhold', -30); // sub: 38+20-15+10+0 = 53 < 55
  LR.linkRaiseDrive(g, {});
  assert.strictEqual(g._calls.talkTo.length, 0);
  assert.strictEqual(LR.linkraiseStats().raisesSkippedNotReady, 1);
  assert.strictEqual(LR.linkraiseStats().raisesAnswered, 0);
});
check('dead raiser: skipped no-raiser, never talked to', function () {
  LR.resetLinkraiseStats();
  const g = raiseGame('emberhold', 20);
  g.getPerson = function () { return { id: 'rosa', dead: true }; };
  LR.linkRaiseDrive(g, {});
  assert.strictEqual(g._calls.talkTo.length, 0);
  assert.strictEqual(LR.linkraiseStats().raisesSkippedNoRaiser, 1);
});
check('already-linked village: skipped, never talked to', function () {
  LR.resetLinkraiseStats();
  const g = raiseGame('emberhold', 20);
  g._linkedVillage = 'emberhold';
  LR.linkRaiseDrive(g, {});
  assert.strictEqual(g._calls.talkTo.length, 0);
  assert.strictEqual(LR.linkraiseStats().raisesSkippedLinked, 1);
});
check('unknown raised village: skipped no-village', function () {
  LR.resetLinkraiseStats();
  const g = raiseGame('nowhere', 20);
  g.state.otherVillages = [];
  LR.linkRaiseDrive(g, {});
  assert.strictEqual(g._calls.talkTo.length, 0);
  assert.strictEqual(LR.linkraiseStats().raisesSkippedNoVillage, 1);
});

// --- Conversation answers ------------------------------------------------
check('ready raise + link:accept offered: answered in conversation, link forms', function () {
  LR.resetLinkraiseStats();
  const g = raiseGame('emberhold', 20);
  g._choices = [{ id: 'link:accept', label: '"All right. Let\'s ask them."' }];
  g._acceptLinks = true;
  g._acceptVillage = 'emberhold';
  LR.linkRaiseDrive(g, {});
  assert.strictEqual(g._calls.talkTo.length, 1);
  assert.strictEqual(g._calls.talkTo[0], 'rosa');
  assert.ok(g._calls.convoTurn.indexOf('link:accept') !== -1);
  assert.strictEqual(g._calls.acceptLinkRaise.length, 1);
  assert.strictEqual(LR.linkraiseStats().raisesAnswered, 1);
  assert.strictEqual(LR.linkraiseStats().raisesLinked, 1);
  assert.strictEqual(LR.linkraiseStats().firstRaiseAnswerDay, 10);
  assert.strictEqual(LR.linkraiseStats().firstRaiseTalkDay, 10);
});
check('ready raise + link:accept NOT offered: not-offered, no verb called, no decline', function () {
  LR.resetLinkraiseStats();
  const g = raiseGame('emberhold', 20);
  g._choices = [{ id: 'goon', label: 'Go on.' }, { id: 'leave', label: 'Leave.' }];
  g._endAfterTurn = false;
  LR.linkRaiseDrive(g, {});
  assert.strictEqual(g._calls.talkTo.length, 1);
  assert.strictEqual(g._calls.acceptLinkRaise.length, 0);
  assert.ok(g._calls.convoTurn.indexOf('link:decline') === -1);
  assert.strictEqual(LR.linkraiseStats().raisesNotOffered, 1);
  assert.strictEqual(LR.linkraiseStats().raisesAnswered, 0);
});
check('talk fails (no active convo): talk-failed, no verb called', function () {
  LR.resetLinkraiseStats();
  const g = raiseGame('emberhold', 20);
  g.talkTo = function (vid) { g._calls.talkTo.push(vid); return null; }; // no convo opens
  g.convoGet = function () { return { active: false }; };
  LR.linkRaiseDrive(g, {});
  assert.strictEqual(g._calls.acceptLinkRaise.length, 0);
  assert.strictEqual(LR.linkraiseStats().raisesTalkFailed, 1);
});
check('at most one answer per day: second ready raise left pending', function () {
  LR.resetLinkraiseStats();
  const g = raiseGame('emberhold', 20);
  g.state.otherVillages.push({ id: 'stonehollow', name: 'stonehollow', opinion: 20 });
  g.state.village.linkRaises.leo = { villageId: 'stonehollow', day: 9 };
  g._choices = [{ id: 'link:accept', label: '"All right."' }];
  g._acceptLinks = true;
  g._acceptVillage = 'stonehollow'; // oldest raise (leo, d9) answered first
  LR.linkRaiseDrive(g, {});
  assert.strictEqual(LR.linkraiseStats().raisesAnswered, 1);
  assert.strictEqual(g._calls.acceptLinkRaise.length, 1);
  assert.strictEqual(g._calls.talkTo.length, 1);
  assert.strictEqual(g._calls.talkTo[0], 'leo');
});

// --- Live smoke leg ------------------------------------------------------
// Armed driver, seed 97001, DAYCAP=60, evidence to /tmp (never the repo).
// Asserts wiring only: the run completes, the census carries the linkraise
// ledger with 0 policy errors, the regional corpus has rows, the recorder
// reports 0 errors. (60 days may stage no raise at all on this seed —
// answers are scored by the judged run, not the smoke.)
check('live smoke: armed driver seed 97001 DAYCAP=60 completes, ledger clean', function () {
  const tmp = '/tmp/journey-scale-r108-smoke';
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  execFileSync('node', ['scripts/journey-scale-r108-20261107.js'], {
    cwd: REPO,
    env: Object.assign({}, process.env, { SEEDS: '97001', DAYCAP: '60', EVIDIR: tmp }),
    stdio: 'pipe', timeout: 600000,
  });
  const trust = JSON.parse(fs.readFileSync(path.join(tmp, 'journey-scale-r108-trust-97001.json'), 'utf8'));
  assert.ok(trust.census, 'trust json has a census');
  assert.ok(trust.census.linkraise, 'census carries the linkraise ledger');
  assert.strictEqual(trust.census.linkraise.errors, 0, '0 policy errors on the smoke leg');
  const reg = JSON.parse(fs.readFileSync(path.join(tmp, 'journey-scale-r108-regional-97001.json'), 'utf8'));
  assert.ok((reg.daily || []).length > 0, 'regional corpus has rows');
  assert.strictEqual((reg.instrumentErrors || []).length, 0, '0 recorder errors on the smoke leg');
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
});

console.log(passed + ' passed');

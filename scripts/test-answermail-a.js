// test-answermail-a.js — proof for arm sim-answermail-a.
// Fixture tests for the answer-the-mail policy (accord gift, weekly
// tend gating, renegotiation gift, demand honor, NEVER proposes) + a
// live harness smoke leg (99104 answermail, short, /tmp). Green BEFORE
// any judged sim.
// Usage: node scripts/test-answermail-a.js
'use strict';
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AM = require(path.join(REPO, 'scripts', 'policies', 'competent-answermail-a'));

let passed = 0;
function check(name, fn) {
  try { fn(); passed += 1; console.log('ok ' + passed + ' - ' + name); }
  catch (e) { console.error('FAIL - ' + name + '\n  ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join('\n  ') : e)); process.exitCode = 1; }
}

// --- Fake Game -----------------------------------------------------------
function fakeGame(overrides) {
  const calls = { proposeLink: [], answerAccord: [], tendLink: [],
    answerRenegotiation: [], answerDemand: [] };
  const g = {
    over: false,
    state: {
      scholar: { day: 10 },
      village: { pantry: [], roster: ['scholar1', 'rosa', 'leo'] },
      otherVillages: [],
      pendingCounter: null, pendingAccord: null, pendingNational: null, pendingGlobal: null,
    },
    _week: function () { return 2; },
    hierarchyState: function () { return g._links || []; },
    _links: [],
    proposeLink: function (vid, opts) { calls.proposeLink.push([vid, opts]); return { id: 'link_x' }; },
    answerAccord: function (how) { calls.answerAccord.push(how); return true; },
    tendLink: function (id) { calls.tendLink.push(id); return g._tendRet === undefined ? 1500 : g._tendRet; },
    answerRenegotiation: function (id, how) { calls.answerRenegotiation.push([id, how]); return 'gift'; },
    answerDemand: function (id, acc) { calls.answerDemand.push([id, acc]); return true; },
    _calls: calls,
  };
  if (overrides) Object.assign(g, overrides);
  return g;
}
function pantryGame(kcal) {
  const g = fakeGame();
  g.state.village.pantry = [{ kcalEach: kcal, units: 1 }];
  return g;
}
function leadLink(id, opts) {
  return Object.assign({ id: id, status: 'active', primary: 'haven', subordinate: 'emberhold', trust: 35, day: 0, tendedWeek: 1 }, opts || {});
}

// --- Accord --------------------------------------------------------------
check('accord: pendingAccord answered with gift, counted once', function () {
  AM.resetAnswermailStats();
  const g = pantryGame(20000);
  g.state.pendingAccord = { linkId: 'l1', day: 9 };
  AM.answerTheMail(g, {});
  assert.deepStrictEqual(g._calls.answerAccord, ['gift']);
  assert.strictEqual(AM.answermailStats().accordAnswers, 1);
});
check('accord: no pending accord, no answer call', function () {
  AM.resetAnswermailStats();
  const g = pantryGame(20000);
  AM.answerTheMail(g, {});
  assert.deepStrictEqual(g._calls.answerAccord, []);
  assert.strictEqual(AM.answermailStats().accordAnswers, 0);
});
check('accord: answered even on a bare pantry (engine prices it)', function () {
  AM.resetAnswermailStats();
  const g = pantryGame(0);
  g.state.pendingAccord = { linkId: 'l1', day: 9 };
  AM.answerTheMail(g, {});
  assert.deepStrictEqual(g._calls.answerAccord, ['gift']);
});

// --- Tend ----------------------------------------------------------------
check('tend: LEAD link tended weekly when pantry > 20000', function () {
  AM.resetAnswermailStats();
  const g = pantryGame(25000);
  g._links = [leadLink('l1')];
  AM.answerTheMail(g, {});
  assert.deepStrictEqual(g._calls.tendLink, ['l1']);
  const s = AM.answermailStats();
  assert.strictEqual(s.tends, 1);
  assert.strictEqual(s.tendsPaidKcal, 1500);
});
check('tend: blocked when pantry <= 20000, counted', function () {
  AM.resetAnswermailStats();
  const g = pantryGame(20000);
  g._links = [leadLink('l1')];
  AM.answerTheMail(g, {});
  assert.deepStrictEqual(g._calls.tendLink, []);
  assert.strictEqual(AM.answermailStats().tendsBlockedPantry, 1);
});
check('tend: skipped when already tended this week', function () {
  AM.resetAnswermailStats();
  const g = pantryGame(25000);
  g._links = [leadLink('l1', { tendedWeek: 2 })]; // _week() returns 2
  AM.answerTheMail(g, {});
  assert.deepStrictEqual(g._calls.tendLink, []);
  assert.strictEqual(AM.answermailStats().tends, 0);
});
check('tend: BELONG link is never tended', function () {
  AM.resetAnswermailStats();
  const g = pantryGame(25000);
  g._links = [leadLink('l1', { primary: 'emberhold', subordinate: 'haven' })];
  AM.answerTheMail(g, {});
  assert.deepStrictEqual(g._calls.tendLink, []);
});
check('tend: broken link is never tended', function () {
  AM.resetAnswermailStats();
  const g = pantryGame(25000);
  g._links = [leadLink('l1', { status: 'broken' })];
  AM.answerTheMail(g, {});
  assert.deepStrictEqual(g._calls.tendLink, []);
});

// --- Renegotiation + demand ----------------------------------------------
check('renegotiation: staged beat answered with gift, counted', function () {
  AM.resetAnswermailStats();
  const g = pantryGame(25000);
  g._links = [leadLink('l1', { pendingRenegotiation: { day: 9 } })];
  AM.answerTheMail(g, {});
  assert.deepStrictEqual(g._calls.answerRenegotiation, [['l1', 'gift']]);
  assert.strictEqual(AM.answermailStats().renegotiationAnswers, 1);
});
check('renegotiation: no staged beat, no answer call', function () {
  AM.resetAnswermailStats();
  const g = pantryGame(25000);
  g._links = [leadLink('l1')];
  AM.answerTheMail(g, {});
  assert.deepStrictEqual(g._calls.answerRenegotiation, []);
});
check('demand: pending demand honored, kind counted', function () {
  AM.resetAnswermailStats();
  const g = pantryGame(25000);
  g._links = [leadLink('l1', { pendingDemand: { kind: 'grain' } })];
  AM.answerTheMail(g, {});
  assert.deepStrictEqual(g._calls.answerDemand, [['l1', true]]);
  const s = AM.answermailStats();
  assert.strictEqual(s.demandAnswers, 1);
  assert.strictEqual(s.demandKinds.grain, 1);
});

// --- Never proposes ------------------------------------------------------
check('never proposes: proposeLink is never called by any beat', function () {
  AM.resetAnswermailStats();
  const g = pantryGame(25000);
  g.state.pendingAccord = { linkId: 'l1', day: 9 };
  g.state.pendingCounter = { linkId: 'l1' };
  g.state.pendingNational = { shape: 'lead', day: 9 };
  g._links = [leadLink('l1', { pendingRenegotiation: { day: 9 }, pendingDemand: { kind: 'grain' } })];
  AM.answerTheMail(g, {});
  assert.deepStrictEqual(g._calls.proposeLink, []);
  assert.strictEqual(AM.answermailStats().proposeCalls, 0);
});
check('policy exports: answermail composition keeps id and daily', function () {
  assert.strictEqual(AM.answermailPolicy.id, 'competent-answermail-a');
  assert.strictEqual(typeof AM.answermailPolicy.daily, 'function');
  assert.strictEqual(typeof AM.resetAnswermailStats, 'function');
  assert.strictEqual(typeof AM.answermailStats, 'function');
});
check('robustness: missing verbs do not throw', function () {
  AM.resetAnswermailStats();
  const g = fakeGame();
  delete g.answerAccord; delete g.tendLink; delete g.answerRenegotiation; delete g.answerDemand;
  g.state.pendingAccord = { linkId: 'l1', day: 9 };
  g._links = [leadLink('l1', { pendingRenegotiation: { day: 9 }, pendingDemand: { kind: 'grain' } })];
  AM.answerTheMail(g, {});
  assert.strictEqual(AM.answermailStats().errors, 0);
});

// --- Instrument v3: cap-phantom proof -----------------------------------
// _trustGain returns the requested amount even when the 100-cap absorbs
// it; the wrap must log the ACTUAL move (see prereg amendment 4).
check('instrument v3: cap-phantom proof (wrap applied 0/3/8, unified [3,8])', function () {
  const out = execFileSync('node', [path.join(REPO, 'scripts', 'test-trustgain-cap-phantom.js')], { timeout: 600000 }).toString();
  assert.ok(/cap-phantom proof passed/.test(out), 'cap-phantom proof output; got ' + out);
});

// --- Live harness smoke leg ----------------------------------------------
check('live smoke: 99104 answermail 60d runs, instrument errors 0, accord answered', function () {
  const outDir = fs.mkdtempSync(path.join('/tmp', 'answermail-proof-'));
  const env = Object.assign({}, process.env, {
    SEEDS: '99104', DAYS: '60', RUN: 'answermail-proof', POLICY: 'answermail', OUTDIR: outDir,
  });
  const out = execFileSync('node', [path.join(REPO, 'scripts', 'answermail-driver-20261110.js')], { env: env, timeout: 600000 }).toString();
  const line = JSON.parse(out.trim().split('\n').pop());
  assert.strictEqual(line.seed, 99104);
  assert.strictEqual(line.errors, 0, 'instrument errors 0; got ' + line.errors);
  assert.ok(line.snapshots >= line.days - 2, 'daily snapshots present; got ' + line.snapshots + ' for ' + line.days + ' days');
  const file = path.join(outDir, 'answermail-s99104-answermail-proof.json');
  const run = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.ok(run.answermailStats, 'answermail stats captured');
  // 99104 forms its link d43 (trustgrowth-b); a 60d armed run must have
  // answered the accord at least once — the mail got answered, not just loaded.
  assert.ok(run.answermailStats.accordAnswers >= 1, 'accord answered; stats=' + JSON.stringify(run.answermailStats));
  assert.strictEqual(run.answermailStats.proposeCalls, 0, 'never proposes');
  console.log('    smoke: days=' + run.days + ' scale=' + run.scaleRank + ' links=' + ((run.daily[run.daily.length - 1] || {}).linkTotal || 0)
    + ' accord=' + run.answermailStats.accordAnswers + ' tends=' + run.answermailStats.tends);
});

console.log(passed + ' checks passed');

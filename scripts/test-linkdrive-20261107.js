// test-linkdrive-20261107.js — proof for arm sim-linkdrive-b.
// Fixture tests for the link-forming drive policy (gating, conversation
// raise answers, holding verbs, non-answers) + a live harness smoke leg
// (53006 staged+linkdrive, short, /tmp). Green BEFORE any judged sim.
// Usage: node scripts/test-linkdrive-20261107.js
'use strict';
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const LD = require(path.join(REPO, 'scripts', 'policies', 'competent-linkdrive-b'));

let passed = 0;
function check(name, fn) {
  try { fn(); passed += 1; console.log('ok ' + passed + ' - ' + name); }
  catch (e) { console.error('FAIL - ' + name + '\n  ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join('\n  ') : e)); process.exitCode = 1; }
}

// --- Fake Game -----------------------------------------------------------
function fakeGame(overrides) {
  const calls = { proposeLink: [], answerCounter: [], answerAccord: [], tendLink: [],
    payTribute: [], answerDemand: [], talkTo: [], convoTurn: [], endConvo: [],
    acceptLinkRaise: [], answerNationalChoice: [], answerGlobalChoice: [] };
  const g = {
    over: false,
    state: {
      scholar: { day: 10 },
      village: { pantry: [], roster: ['scholar1', 'rosa', 'leo'], trust: { rosa: 30, leo: 25 }, linkRaises: {} },
      otherVillages: [],
      pendingCounter: null, pendingAccord: null, pendingNational: null, pendingGlobal: null,
    },
    villagerId: 'scholar1',
    _week: function () { return 2; },
    representative: function () { return { id: 'leo', standing: 40 }; },
    regionalStanding: function () { return 0; },
    villageStandingOf: function () { return 0; },
    isAllied: function () { return false; },
    knowsVillage: function () { return true; },
    linkWith: function () { return null; },
    hierarchyState: function () { return g._links || []; },
    _links: [],
    getPerson: function (vid) { return { id: vid, dead: false }; },
    proposeLink: function (vid, opts) { calls.proposeLink.push([vid, opts]); return g._proposeRet === undefined ? { id: 'link_x' } : g._proposeRet; },
    answerCounter: function (how) { calls.answerCounter.push(how); return { id: 'link_c' }; },
    answerAccord: function (how) { calls.answerAccord.push(how); return true; },
    tendLink: function (id) { calls.tendLink.push(id); return 1500; },
    payTribute: function (id) { calls.payTribute.push(id); return 4000; },
    answerDemand: function (id, acc) { calls.answerDemand.push([id, acc]); return true; },
    acceptLinkRaise: function (vid) { calls.acceptLinkRaise.push(vid); return { ok: true }; },
    answerNationalChoice: function (x) { calls.answerNationalChoice.push(x); },
    answerGlobalChoice: function (x) { calls.answerGlobalChoice.push(x); },
    talkTo: function (vid) { calls.talkTo.push(vid); g._convoActive = true; return 'Hello.'; },
    convoGet: function () { return { active: !!g._convoActive, exchanges: 0 }; },
    convoChoices: function () { return g._choices || []; },
    convoTurn: function (vid, id) {
      calls.convoTurn.push(id);
      if (id === 'link:accept' && g._acceptLinks) g._linkedVillage = g._acceptVillage;
      return { line: 'x', choices: [], ended: false, transcript: [] };
    },
    endConvo: function (vid, how) { calls.endConvo.push([vid, how]); g._convoActive = false; },
    _calls: calls,
    _convoActive: false, _choices: [], _acceptLinks: false, _acceptVillage: null, _linkedVillage: null,
  };
  if (overrides) Object.assign(g, overrides);
  return g;
}
function pantryGame(kcal) {
  const g = fakeGame();
  g.state.village.pantry = [{ kcalEach: kcal, units: 1 }];
  return g;
}
function village(id, opinion) {
  return { id: id, name: id, opinion: opinion };
}

// --- detJudge fixtures (same rule as the recorder) -----------------------
check('detJudge: rep 40 + opinion 20, not allied, even strength', function () {
  const g = fakeGame();
  g.regionalStanding = function () { return 100; };
  g.villageStandingOf = function () { return 50; };
  const d = LD.detJudge(g, village('v1', 20));
  assert.deepStrictEqual(d, { prim: 78, sub: 86 });
});
check('detJudge: opinion 0, no generosity term', function () {
  const g = fakeGame();
  const d = LD.detJudge(g, village('v1', 0));
  // prim: 38 + 20 + 0 - 10 = 48; sub: 38 + 20 + 0 + 10 + 0 = 68
  assert.deepStrictEqual(d, { prim: 48, sub: 68 });
});
check('detJudge: allied +15', function () {
  const g = fakeGame();
  g.isAllied = function () { return true; };
  const d = LD.detJudge(g, village('v1', 20));
  assert.strictEqual(d.sub, 86 + 15);
});
check('detJudge: null input returns zero-input defaults, never throws', function () {
  // Defensive by design: every sub-read is guarded, so a null Game still
  // yields the base numbers (prim 38 - 10 = 28, sub 38 + 10 = 48).
  assert.deepStrictEqual(LD.detJudge(null, null), { prim: 28, sub: 48 });
});

// --- isSeasoned ----------------------------------------------------------
check('isSeasoned: 30d + trust 40 is seasoned; 29d or trust 39 is not', function () {
  assert.strictEqual(LD.isSeasoned({ day: 0, trust: 40 }, 30), true);
  assert.strictEqual(LD.isSeasoned({ day: 0, trust: 40 }, 29), false);
  assert.strictEqual(LD.isSeasoned({ day: 0, trust: 39 }, 30), false);
});

// --- Propose gating ------------------------------------------------------
check('propose: blocked when pantry <= 12000', function () {
  LD.resetLinkdriveStats();
  const g = pantryGame(12000);
  g.state.otherVillages = [village('emberhold', 20)];
  LD.linkDrive(g, {});
  assert.strictEqual(g._calls.proposeLink.length, 0);
  assert.strictEqual(LD.linkdriveStats().proposeBlockedPantry, 1);
});
check('propose: as-subordinate 4000 on courtship-ready known village', function () {
  LD.resetLinkdriveStats();
  const g = pantryGame(20000);
  g.state.otherVillages = [village('emberhold', 20), village('stonebridge', 0)];
  LD.linkDrive(g, {});
  assert.strictEqual(g._calls.proposeLink.length, 1);
  assert.deepStrictEqual(g._calls.proposeLink[0], ['emberhold', { asSubordinate: true, tributeKcalPerWeek: 4000 }]);
  assert.strictEqual(LD.linkdriveStats().proposeAccepted, 1);
});
check('propose: no propose when no village is courtship-ready', function () {
  LD.resetLinkdriveStats();
  const g = pantryGame(20000);
  g.state.otherVillages = [village('emberhold', -30)]; // detSub 53 < 55
  LD.linkDrive(g, {});
  assert.strictEqual(g._calls.proposeLink.length, 0);
  assert.strictEqual(LD.linkdriveStats().proposeNotReady, 1);
});
check('propose: blocked at 3 active links', function () {
  LD.resetLinkdriveStats();
  const g = pantryGame(20000);
  g.state.otherVillages = [village('emberhold', 20)];
  g._links = [
    { id: 'l1', status: 'active', primary: 'haven', subordinate: 'a', day: 1, trust: 30 },
    { id: 'l2', status: 'active', primary: 'haven', subordinate: 'b', day: 1, trust: 30 },
    { id: 'l3', status: 'active', primary: 'c', subordinate: 'haven', day: 1, trust: 30 },
  ];
  LD.linkDrive(g, {});
  assert.strictEqual(g._calls.proposeLink.length, 0);
  assert.strictEqual(LD.linkdriveStats().proposeBlockedCap, 1);
});
check('propose: blocked while a counter is pending', function () {
  LD.resetLinkdriveStats();
  const g = pantryGame(20000);
  g.state.otherVillages = [village('emberhold', 20)];
  // pendingCounter present AND answerCounter available: step 1 answers it,
  // then step 4 must still not propose (the counter answer formed a link,
  // and proposeLink would be blocked by the fresh counter state — here the
  // fake answerCounter leaves pendingCounter set, so the block is direct).
  g.state.pendingCounter = { targetId: 'emberhold', day: 9 };
  g.answerCounter = function () { g._calls.answerCounter.push('accept'); return { id: 'link_c' }; };
  LD.linkDrive(g, {});
  assert.strictEqual(g._calls.answerCounter.length, 1);
  assert.strictEqual(LD.linkdriveStats().counterAnswers, 1);
});
check('propose: counter return counted, not accepted', function () {
  LD.resetLinkdriveStats();
  const g = pantryGame(20000);
  g.state.otherVillages = [village('emberhold', 20)];
  g._proposeRet = 'counter';
  LD.linkDrive(g, {});
  assert.strictEqual(LD.linkdriveStats().proposeCounter, 1);
  assert.strictEqual(LD.linkdriveStats().proposeAccepted, 0);
});
check('propose: unknown village is never proposed (perception law)', function () {
  LD.resetLinkdriveStats();
  const g = pantryGame(20000);
  g.state.otherVillages = [village('emberhold', 20)];
  g.knowsVillage = function () { return false; };
  LD.linkDrive(g, {});
  assert.strictEqual(g._calls.proposeLink.length, 0);
  assert.strictEqual(LD.linkdriveStats().proposeNotReady, 1);
});

// --- Counter / accord answering ------------------------------------------
check('accord: pendingAccord answered with gift', function () {
  LD.resetLinkdriveStats();
  const g = pantryGame(20000);
  g.state.pendingAccord = { linkId: 'l1', day: 9 };
  LD.linkDrive(g, {});
  assert.deepStrictEqual(g._calls.answerAccord, ['gift']);
  assert.strictEqual(LD.linkdriveStats().accordAnswers, 1);
});
check('national/global beats are never answered', function () {
  LD.resetLinkdriveStats();
  const g = pantryGame(20000);
  g.state.pendingNational = { shape: 'lead', day: 9 };
  g.state.pendingGlobal = { day: 9 };
  LD.linkDrive(g, {});
  assert.strictEqual(g._calls.answerNationalChoice.length, 0);
  assert.strictEqual(g._calls.answerGlobalChoice.length, 0);
  assert.strictEqual(LD.linkdriveStats().nationalPendingDays, 1);
  assert.strictEqual(LD.linkdriveStats().globalPendingDays, 1);
});

// --- Raise answering ------------------------------------------------------
function raiseGame(opinion) {
  const g = pantryGame(20000);
  g.state.otherVillages = [village('emberhold', opinion)];
  g.state.village.linkRaises = { rosa: { vid: 'rosa', villageId: 'emberhold', day: 9, kind: 'link' } };
  g._choices = [{ id: 'link:accept', label: 'x' }, { id: 'link:decline', label: 'y' }, { id: 'goon', label: 'z' }];
  g._acceptLinks = true;
  g._acceptVillage = 'emberhold';
  g.linkWith = function (vid) { return g._linkedVillage === vid ? { id: 'link_x' } : null; };
  return g;
}
check('raise: courtship-ready raise answered in conversation via link:accept', function () {
  LD.resetLinkdriveStats();
  const g = raiseGame(20);
  LD.linkDrive(g, {});
  assert.deepStrictEqual(g._calls.talkTo, ['rosa']);
  assert.ok(g._calls.convoTurn.indexOf('link:accept') !== -1);
  assert.strictEqual(g._calls.convoTurn.indexOf('link:decline'), -1);
  assert.strictEqual(g._calls.acceptLinkRaise.length, 0, 'never the bare verb');
  assert.strictEqual(LD.linkdriveStats().raisesAnswered, 1);
  assert.strictEqual(LD.linkdriveStats().raisesLinked, 1);
  assert.deepStrictEqual(g._calls.endConvo, [['rosa', 'left']]);
});
check('raise: not-ready village is skipped, never talked to', function () {
  LD.resetLinkdriveStats();
  const g = raiseGame(-30); // detSub 53 < 55
  LD.linkDrive(g, {});
  assert.strictEqual(g._calls.talkTo.length, 0);
  assert.strictEqual(g._calls.convoTurn.length, 0);
  assert.strictEqual(LD.linkdriveStats().raisesSkippedNotReady, 1);
  assert.strictEqual(LD.linkdriveStats().raisesAnswered, 0);
});
check('raise: dead raiser is skipped', function () {
  LD.resetLinkdriveStats();
  const g = raiseGame(20);
  g.getPerson = function () { return { id: 'rosa', dead: true }; };
  LD.linkDrive(g, {});
  assert.strictEqual(g._calls.talkTo.length, 0);
  assert.strictEqual(LD.linkdriveStats().raisesSkippedNoRaiser, 1);
});
check('raise: link:accept not offered within 5 turns counts not-offered', function () {
  LD.resetLinkdriveStats();
  const g = raiseGame(20);
  g._choices = [{ id: 'goon', label: 'z' }];
  LD.linkDrive(g, {});
  assert.strictEqual(LD.linkdriveStats().raisesNotOffered, 1);
  assert.strictEqual(LD.linkdriveStats().raisesAnswered, 0);
  assert.strictEqual(g._calls.convoTurn.indexOf('link:decline'), -1);
});
check('raise: accept staging a counter counts countered, not linked', function () {
  LD.resetLinkdriveStats();
  const g = raiseGame(20);
  g._acceptLinks = false; // link:accept taken but no link formed...
  g.state.pendingCounter = null;
  // ...and a counter staged by the accept: simulate by having linkWith
  // false and pendingCounter set after the turn.
  const origTurn = g.convoTurn;
  g.convoTurn = function (vid, id) {
    const r = origTurn.call(g, vid, id);
    if (id === 'link:accept') g.state.pendingCounter = { targetId: 'emberhold', day: 10 };
    return r;
  };
  LD.linkDrive(g, {});
  assert.strictEqual(LD.linkdriveStats().raisesCountered, 1);
  assert.strictEqual(LD.linkdriveStats().raisesLinked, 0);
});

// --- Holding: tend LEAD / pay BELONG --------------------------------------
check('tend: LEAD link below the bar is tended weekly; seasoned is not', function () {
  LD.resetLinkdriveStats();
  const g = pantryGame(30000);
  g._links = [
    { id: 'l1', status: 'active', primary: 'haven', subordinate: 'a', day: 5, trust: 30, tendedWeek: 1 },
    { id: 'l2', status: 'active', primary: 'haven', subordinate: 'b', day: 1, trust: 45, tendedWeek: 1 }, // seasoned: age 9? day 10-1=9 <30 -> below bar! use day -30
  ];
  g._links[1].day = -30; // age 40, trust 45 -> seasoned
  LD.linkDrive(g, {});
  assert.deepStrictEqual(g._calls.tendLink, ['l1']);
  assert.strictEqual(LD.linkdriveStats().tends, 1);
  assert.strictEqual(LD.linkdriveStats().tendsPaidKcal, 1500);
});
check('tend: blocked when pantry <= 20000', function () {
  LD.resetLinkdriveStats();
  const g = pantryGame(20000);
  g._links = [{ id: 'l1', status: 'active', primary: 'haven', subordinate: 'a', day: 5, trust: 30, tendedWeek: 1 }];
  LD.linkDrive(g, {});
  assert.strictEqual(g._calls.tendLink.length, 0);
  assert.strictEqual(LD.linkdriveStats().tendsBlockedPantry, 1);
});
check('tend: BELONG link is never tended (engine refuses it)', function () {
  LD.resetLinkdriveStats();
  const g = pantryGame(30000);
  g._links = [{ id: 'l1', status: 'active', primary: 'emberhold', subordinate: 'haven', day: 5, trust: 30, tributeKcalPerWeek: 4000, tributePaidWeek: 1 }];
  LD.linkDrive(g, {});
  assert.strictEqual(g._calls.tendLink.length, 0);
});
check('belong: tribute paid in full when current week unpaid and pantry covers', function () {
  LD.resetLinkdriveStats();
  const g = pantryGame(30000);
  g._links = [{ id: 'l1', status: 'active', primary: 'emberhold', subordinate: 'haven', day: 5, trust: 30, tributeKcalPerWeek: 4000, tributePaidWeek: 1 }];
  LD.linkDrive(g, {});
  assert.deepStrictEqual(g._calls.payTribute, ['l1']);
  assert.strictEqual(LD.linkdriveStats().tributePays, 1);
  assert.strictEqual(LD.linkdriveStats().tributePaidKcal, 4000);
});
check('belong: tribute blocked when pantry cannot cover the owed week', function () {
  LD.resetLinkdriveStats();
  const g = pantryGame(3000);
  g._links = [{ id: 'l1', status: 'active', primary: 'emberhold', subordinate: 'haven', day: 5, trust: 30, tributeKcalPerWeek: 4000, tributePaidWeek: 1 }];
  LD.linkDrive(g, {});
  assert.strictEqual(g._calls.payTribute.length, 0);
  assert.strictEqual(LD.linkdriveStats().tributeBlockedPantry, 1);
});
check('belong: pending demand is honored', function () {
  LD.resetLinkdriveStats();
  const g = pantryGame(30000);
  g._links = [{ id: 'l1', status: 'active', primary: 'emberhold', subordinate: 'haven', day: 5, trust: 30, tributeKcalPerWeek: 4000, tributePaidWeek: 2, pendingDemand: { kind: 'tribute', costKcal: 2000 } }];
  LD.linkDrive(g, {});
  assert.deepStrictEqual(g._calls.answerDemand, [['l1', true]]);
  assert.strictEqual(LD.linkdriveStats().demandAnswers, 1);
  assert.strictEqual(LD.linkdriveStats().demandKinds.tribute, 1);
});
check('policy exports: staged composition keeps id and rally fight hook', function () {
  assert.strictEqual(LD.linkdrivePolicy.id, 'competent-linkdrive-b');
  assert.strictEqual(typeof LD.linkdrivePolicy.daily, 'function');
  assert.strictEqual(typeof LD.linkdrivePolicy.fight, 'function');
  assert.strictEqual(typeof LD.linkdrivePolicy.pending, 'function');
});

// --- Live harness smoke leg ----------------------------------------------
check('live smoke: 53006 staged+linkdrive 60d runs, instrument errors 0, drive fires', function () {
  const outDir = fs.mkdtempSync(path.join('/tmp', 'linkdrive-proof-'));
  const env = Object.assign({}, process.env, {
    SEEDS: '53006', DAYS: '60', RUN: 'linkdrive-proof', POLICY: 'linkdrive', OUTDIR: outDir,
  });
  const out = execFileSync('node', [path.join(REPO, 'scripts', 'linkdrive-driver-20261107.js')], { env: env, timeout: 600000 }).toString();
  const line = JSON.parse(out.trim().split('\n').pop());
  assert.strictEqual(line.seed, 53006);
  assert.strictEqual(line.errors, 0, 'instrument errors 0; got ' + line.errors);
  // Snapshots start on day 2 (the regionalstep driver pattern: a 150d run
  // carries 149 snapshots) — days-2 is the floor, not days.
  assert.ok(line.snapshots >= line.days - 2, 'daily snapshots present; got ' + line.snapshots + ' for ' + line.days + ' days');
  const file = path.join(outDir, 'linkdrive-s53006-linkdrive-proof.json');
  const run = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.ok(run.linkdriveStats, 'linkdrive stats captured');
  // The drive must have evaluated the propose gate at least once (proposed
  // or recorded a gate-block reason) — the lever fired, not just loaded.
  const ld = run.linkdriveStats;
  const gateEvals = ld.proposeCalls + ld.proposeBlockedPantry + ld.proposeBlockedCap
    + ld.proposeBlockedPending + ld.proposeNotReady + ld.proposeNoCandidate;
  assert.ok(gateEvals > 0, 'propose gate evaluated; stats=' + JSON.stringify(ld));
  assert.ok((ld.proposeCalls + ld.raisesAnswered) > 0, 'drive proposed or answered a raise; stats=' + JSON.stringify(ld));
  console.log('    smoke: days=' + run.days + ' scale=' + run.scaleRank + ' links=' + ((run.daily[run.daily.length - 1] || {}).everLinks || 0)
    + ' propose=' + ld.proposeCalls + ' raisesAnswered=' + ld.raisesAnswered + ' tends=' + ld.tends);
});

console.log(passed + ' checks passed');

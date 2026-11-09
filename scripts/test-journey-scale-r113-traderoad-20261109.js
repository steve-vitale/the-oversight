// test-journey-scale-r113-traderoad-20261109.js — proof for journey-scale r113.
// Fixture tests for the r113 trade-road policy (beat picks, viability,
// sub count), the traderoad instrument (wrapper delegation, trade
// snapshot, wild-fight watch, uninstall restore) + a live harness smoke
// leg (97901, DAYCAP 60, /tmp). Green BEFORE any judged sim.
// Usage: node scripts/test-journey-scale-r113-traderoad-20261109.js
'use strict';
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const TR = require(path.join(REPO, 'scripts', 'policies', 'scalecourt-traderoad-r113'));
const TRI = require(path.join(REPO, 'scripts', 'traderoad-instrument-20261109'));

let passed = 0;
function check(name, fn) {
  try { fn(); passed += 1; console.log('ok ' + passed + ' - ' + name); }
  catch (e) { console.error('FAIL - ' + name + '\n  ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join('\n  ') : e)); process.exitCode = 1; }
}

// --- Fake Game (the trade-road read surface + the two wrapped verbs) ------
function fakeGame(overrides) {
  const g = {
    villagerId: 'me',
    state: {
      scholar: { day: 40 },
      village: { roster: ['me', 'v1', 'v2', 'v3'] },
      otherVillages: [
        { id: 'ov1', opinion: 12 },
        { id: 'ov2', opinion: 4 },
        { id: 'ov3', opinion: 25 },
      ],
      pendingCounter: null,
      pendingNational: null,
    },
    hierarchyState: function () { return g._links || []; },
    knowsVillage: function (v) { return true; },
    linkWith: function (vid) { return (g._links || []).some(l => l && ((l.a === vid && l.b === 'haven') || (l.b === vid && l.a === 'haven') || l.subordinate === vid)); },
    answerNationalChoice: function (how) { g._answered = how; return 'answered-' + how; },
    fieldFight: function (vid, mdef, m, opts) {
      assert.strictEqual(this, g, 'fieldFight receives the Game as this');
      if (mdef && mdef.id === 'herald') return { outcome: 'vDie', rounds: 9 };
      return { outcome: 'evade', rounds: 0 };
    },
  };
  Object.assign(g, overrides || {});
  return g;
}

check('tradeBeatPick: trade signs, covenant walks while the window is open and pacts when it closes, others base', () => {
  assert.strictEqual(TR.tradeBeatPick('trade', true), 'sign', 'trade signs while the window is open');
  assert.strictEqual(TR.tradeBeatPick('trade', false), 'sign', 'trade signs when the window is closed too');
  assert.strictEqual(TR.tradeBeatPick('covenant', true), 'walk', 'covenant walks while the window is open');
  assert.strictEqual(TR.tradeBeatPick('covenant', false), 'pact', 'covenant pacts once the window closes');
  assert.strictEqual(TR.tradeBeatPick('lead', true), 'feast', 'lead feasts (cannot be walked from)');
  assert.strictEqual(TR.tradeBeatPick('lead', false), 'feast', 'lead feasts when dead too');
  assert.strictEqual(TR.tradeBeatPick('belong', true), 'swear', 'belong swears (never walk — it breaks the link)');
  assert.strictEqual(TR.tradeBeatPick('conquest', true), 'mercy', 'conquest shows mercy');
  assert.strictEqual(TR.tradeBeatPick('weird-shape', true), 'feast', 'unknown shape falls back to feast');
});

check('tradeSealed / subCount read live links, never throw', () => {
  const g = fakeGame();
  g._links = [
    { status: 'active', kind: 'trade', a: 'haven', b: 'ov1', chartered: false, trust: 45, day: 5 },
    { status: 'active', kind: 'covenant', a: 'haven', b: 'ov2', trust: 50, day: 5 },
    { status: 'active', primary: 'haven', subordinate: 'ov3', trust: 60, day: 3 },
  ];
  assert.strictEqual(TR.tradeSealed(g), false, 'no chartered link yet');
  assert.strictEqual(TR.subCount(g), 1, 'one Haven-primary subordinate');
  g._links[0].chartered = true;
  assert.strictEqual(TR.tradeSealed(g), true, 'a chartered trade link seals the road');
  assert.strictEqual(TR.subCount({}), 0, 'missing hierarchyState reads 0 subs, not a crash');
  assert.strictEqual(TR.tradeSealed({}), false, 'missing hierarchyState reads unsealed, not a crash');
});

check('tradeViable: the count rule — live trade links + climbable villages must reach 3', () => {
  const g = fakeGame();
  g._links = [];
  assert.strictEqual(TR.tradeViable(g), true, '3 unlinked known villages = 3 formable routes');
  g.state.otherVillages = [{ id: 'ov1', opinion: 4 }, { id: 'ov2', opinion: 9 }];
  assert.strictEqual(TR.tradeViable(g), false, '2 climbable villages cannot make 3 routes: road dead');
  g.state.pendingCounter = { kind: 'trade' };
  assert.strictEqual(TR.tradeViable(g), true, 'a pending counter counts as a route in negotiation');
  g.state.pendingCounter = null;
  g.state.otherVillages = [{ id: 'ov1', opinion: 4 }, { id: 'ov2', opinion: 9 }];
  g._links = [{ status: 'active', kind: 'trade', a: 'haven', b: 'ov9', chartered: false, trust: 20, day: 30 }];
  assert.strictEqual(TR.tradeViable(g), true, '1 live trade link + 2 climbable villages = 3 routes');
  g.state.otherVillages = [{ id: 'ov2', opinion: 9 }];
  assert.strictEqual(TR.tradeViable(g), false, '1 live trade link + 1 climbable village = 2 routes: dead');
  g.state.otherVillages = [{ id: 'ov1', opinion: 4 }, { id: 'ov2', opinion: 9 }];
  g._links[0].chartered = true;
  assert.strictEqual(TR.tradeViable(g), false, 'sealed road is done — normal answers resume');
  assert.strictEqual(TR.tradeViable({}), false, 'missing state reads dead (fail-closed), not a crash');
  assert.strictEqual(TR.tradePool(g), 2, 'tradePool counts unlinked known villages regardless of opinion');
});

check('tradeWindowOpen: open before day 120 while unsealed, closed at 120 or once sealed', () => {
  const g = fakeGame();
  g._links = [];
  assert.strictEqual(TR.tradeWindowOpen(g, 40), true, 'day 40, unsealed: window open');
  assert.strictEqual(TR.tradeWindowOpen(g, 119), true, 'day 119: still open');
  assert.strictEqual(TR.tradeWindowOpen(g, 120), false, 'day 120: window closed');
  assert.strictEqual(TR.tradeWindowOpen(g, 200), false, 'day 200: window closed');
  assert.strictEqual(TR.tradeWindowOpen(g), true, 'no day passed: reads the scholar day (40)');
  g._links = [{ status: 'active', kind: 'trade', a: 'haven', b: 'ov9', chartered: true, trust: 50, day: 10 }];
  assert.strictEqual(TR.tradeWindowOpen(g, 40), false, 'sealed charter closes the window');
  assert.strictEqual(TR.tradeWindowOpen({}, 40), true, 'stateless game with an explicit day reads open (nothing sealed, day in window)');
  assert.strictEqual(TR.TRADE_WINDOW_END, 120, 'window end is 120');
});

check('sub-cap predicate: hold at 1 sub while the window is open, lift when sealed or closed', () => {
  const g = fakeGame();
  g._links = [
    { status: 'active', primary: 'haven', subordinate: 'ov1', trust: 60, day: 3 },
    { status: 'active', primary: 'haven', subordinate: 'ov2', trust: 55, day: 4 },
  ];
  // Window open (day 40) and unsealed: the guard holds — even at 1 sub.
  g.state.otherVillages = [{ id: 'ov3', opinion: 25 }, { id: 'ov4', opinion: 12 }, { id: 'ov5', opinion: 8 }];
  assert.strictEqual(TR.subCount(g) >= 1 && TR.tradeWindowOpen(g, 40), true, 'subs present + window open = hold the raise');
  // Sealed: the guard lifts.
  g._links.push({ status: 'active', kind: 'trade', a: 'haven', b: 'ov3', chartered: true, trust: 50, day: 10 });
  assert.strictEqual(TR.subCount(g) >= 1 && TR.tradeWindowOpen(g, 40), false, 'sealed charter lifts the guard');
  g._links.pop();
  // Window closed (day 130): the guard lifts.
  assert.strictEqual(TR.subCount(g) >= 1 && TR.tradeWindowOpen(g, 130), false, 'closed window lifts the guard');
  // Zero subs: the guard never fires (the first link is always allowed).
  g._links = [];
  assert.strictEqual(TR.subCount(g) >= 1 && TR.tradeWindowOpen(g, 40), false, '0 subs never trips the guard');
  // Cap 1, not cap 2: a single sub already trips it.
  g._links = [{ status: 'active', primary: 'haven', subordinate: 'ov1', trust: 60, day: 3 }];
  assert.strictEqual(TR.subCount(g) >= 1 && TR.tradeWindowOpen(g, 40), true, '1 sub trips the cap-1 guard');
});

check('instrument wrappers forward args and return the original return verbatim', () => {
  const g = fakeGame();
  const orig = { answerNationalChoice: g.answerNationalChoice, fieldFight: g.fieldFight };
  g.state.pendingNational = { shape: 'covenant', day: 40 };
  const beatRep = { sentinel: 1 };
  g.answerNationalChoice = function () { return beatRep; };
  orig.answerNationalChoice = g.answerNationalChoice;
  const tr = TRI.install(g);
  assert.strictEqual(g.answerNationalChoice('walk'), beatRep, 'answerNationalChoice return passes through by reference');
  assert.strictEqual(tr.t.beatAnswers.length, 1, 'one beat answer logged');
  assert.strictEqual(tr.t.beatAnswers[0].day, 40, 'beat answer day-attributed');
  assert.strictEqual(tr.t.beatAnswers[0].shape, 'covenant', 'beat shape read BEFORE the call');
  assert.strictEqual(tr.t.beatAnswers[0].how, 'walk', 'beat answer logged');
  const rec = g.fieldFight('v1', { id: 'herald', wave: 4 }, null, {});
  assert.deepStrictEqual(rec, { outcome: 'vDie', rounds: 9 }, 'fieldFight return passes through');
  assert.strictEqual(tr.t.wildFights.length, 1, 'one wild fight logged');
  assert.strictEqual(tr.t.wildFights[0].cls, 'villager', 'v1 is a villager fight');
  assert.strictEqual(tr.t.wildFights[0].mid, 'herald', 'monster id logged');
  assert.strictEqual(tr.t.wildFights[0].wave, 4, 'wave read from the monster def');
  assert.strictEqual(tr.t.wildFights[0].outcome, 'vDie', 'outcome logged');
  assert.strictEqual(tr.t.wildFights[0].rounds, 9, 'rounds logged');
  assert.strictEqual(tr.t.errors.length, 0, 'no instrument errors');
  tr.uninstall();
  assert.strictEqual(g.answerNationalChoice, orig.answerNationalChoice, 'uninstall restores answerNationalChoice');
  assert.strictEqual(g.fieldFight, orig.fieldFight, 'uninstall restores fieldFight');
});

check('fieldFight classifies the scholar by the live vid + day-joined rule, and evades as evades', () => {
  const g = fakeGame();
  const tr = TRI.install(g);
  g.fieldFight('me', { id: 'herald', wave: 4 }, null, {});
  assert.strictEqual(tr.t.wildFights[0].cls, 'scholar', 'current scholar vid is a scholar fight');
  g.fieldFight('v2', { id: 'deer', wave: 1 }, null, {});
  assert.strictEqual(tr.t.wildFights[1].cls, 'villager', 'other vid is a villager fight');
  assert.strictEqual(tr.t.wildFights[1].outcome, 'evade', 'evade outcome kept');
  assert.strictEqual(tr.t.wildFights[1].wave, 1, 'wave-1 fight recorded too (the baseline they do win)');
  // Succession: 'v1' becomes the scholar on day 41. A fight logged
  // by 'me' (yesterday's scholar) still classifies scholar.
  tr.snapshot({}); // day 40, scholar 'me'
  g.villagerId = 'v1';
  g.state.scholar.day = 41;
  g.fieldFight('me', { id: 'herald', wave: 4 }, null, {});
  assert.strictEqual(tr.t.wildFights[2].cls, 'scholar', 'yesterday scholar vid stays scholar after succession');
  assert.strictEqual(tr.t.errors.length, 0, 'no instrument errors');
  tr.uninstall();
});

check('snapshot reads the trade-road state (subs, trade, seasoned, viability, candidates)', () => {
  const g = fakeGame();
  g._links = [
    { status: 'active', kind: 'trade', a: 'haven', b: 'ov1', chartered: false, trust: 45, day: 5 },
    { status: 'active', kind: 'trade', a: 'haven', b: 'ov2', chartered: false, trust: 30, day: 35 },
    { status: 'active', kind: 'covenant', a: 'haven', b: 'ov3', trust: 50, day: 5 },
    { status: 'active', primary: 'haven', subordinate: 'ovX', trust: 60, day: 3 },
  ];
  const tr = TRI.install(g);
  tr.snapshot({});
  assert.strictEqual(tr.t.daily.length, 1, 'one daily row');
  const d = tr.t.daily[0];
  assert.strictEqual(d.day, 40, 'day');
  assert.strictEqual(d.subs, 1, 'subs read');
  assert.strictEqual(d.trN, 2, 'trade links read');
  assert.strictEqual(d.trSeasoned, 1, 'seasoned trade read (d5+35d, trust 45; the d35 link is 5 days old)');
  assert.strictEqual(d.covN, 1, 'covenant links read');
  assert.strictEqual(d.viable, false, '2 trade links and no climbable pool cannot reach 3 routes');
  assert.strictEqual(d.sealed, false, 'unsealed');
  assert.strictEqual(d.charteredLinks, 0, 'no chartered links');
  // Candidates: ov1 is trade-linked, ov3 covenant-linked, ov2 is below
  // the opinion bar — so 0. An unlinked village at the bar counts.
  assert.strictEqual(d.candidates, 0, 'linked/below-bar villages are not candidates');
  assert.strictEqual(d.pool, 0, 'linked villages leave no climbable pool');
  g.state.otherVillages.push({ id: 'ov4', opinion: 30 });
  tr.snapshot({});
  assert.strictEqual(tr.t.daily[1].candidates, 1, 'an unlinked village at opinion >= 10 is a candidate');
  assert.strictEqual(tr.t.daily[1].pool, 1, 'an unlinked known village is in the climbable pool');
  assert.strictEqual(tr.t.daily[1].viable, true, 'still viable with the pool village');
  assert.strictEqual(d.pendingCounter, false, 'no pending counter');
  assert.strictEqual(d.pendingShape, null, 'no pending beat');
  assert.strictEqual(tr.t.errors.length, 0, 'no instrument errors');
  tr.uninstall();
});

check('snapshot survives missing optionals (no hierarchy, no villages)', () => {
  const g = fakeGame();
  delete g.hierarchyState;
  delete g.knowsVillage;
  delete g.linkWith;
  g.state.otherVillages = undefined;
  const tr = TRI.install(g);
  tr.snapshot({});
  const d = tr.t.daily[0];
  assert.strictEqual(d.subs, 0, 'missing hierarchy reads 0 subs');
  assert.strictEqual(d.trN, 0, 'missing hierarchy reads 0 trade');
  assert.strictEqual(d.candidates, 0, 'missing villages read 0 candidates');
  assert.strictEqual(d.viable, false, 'missing reads fail closed to not-viable');
  assert.ok(tr.t.errors.length >= 0, 'errors array exists');
  tr.uninstall();
});

check('missing wrapped method is an instrument error, not a crash', () => {
  const g = fakeGame();
  delete g.fieldFight;
  const tr = TRI.install(g);
  assert.ok(tr.t.errors.some(e => /fieldFight/.test(e.where)), 'missing fieldFight recorded');
  tr.snapshot({});
  assert.strictEqual(tr.t.daily.length, 1, 'snapshot still runs');
  tr.uninstall();
});

check('finalize dumps daily + beat answers + wild fights + scholar map', () => {
  const g = fakeGame();
  const tr = TRI.install(g);
  g.state.pendingNational = { shape: 'trade', day: 40 };
  g.answerNationalChoice('sign');
  g.fieldFight('v1', { id: 'herald', wave: 4 }, null, {});
  tr.snapshot({});
  const fin = tr.finalize();
  assert.strictEqual(fin.beatAnswers.length, 1, 'beat answer in finalize');
  assert.strictEqual(fin.beatAnswers[0].shape, 'trade', 'trade beat logged');
  assert.strictEqual(fin.beatAnswers[0].how, 'sign', 'sign logged');
  assert.strictEqual(fin.wildFights.length, 1, 'wild fight in finalize');
  assert.deepStrictEqual(fin.scholarVidsByDay, { 40: 'me' }, 'scholar-vid map has the snapshot day');
  assert.strictEqual(fin.errors.length, 0, 'no instrument errors');
  tr.uninstall();
});

check('live smoke leg: seed 97901, DAYCAP 60, /tmp — 0 instrument errors, trade rows + wild fights present', () => {
  const tmp = fs.mkdtempSync(path.join('/tmp', 'journey-scale-r113-smoke-'));
  execFileSync('node', [path.join(REPO, 'scripts', 'journey-scale-r113-20261109.js')], {
    cwd: REPO,
    env: Object.assign({}, process.env, { SEEDS: '97901', DAYCAP: '60', EVIDIR: tmp }),
    stdio: 'pipe', timeout: 600000,
  });
  const trust = JSON.parse(fs.readFileSync(path.join(tmp, 'journey-scale-r113-trust-97901.json'), 'utf8'));
  assert.ok(trust.census, 'trust json has a census');
  assert.ok(trust.census.ladderChain, 'census carries the ladder-chain rollup');
  assert.strictEqual(trust.census.ladderChain.errors, 0, '0 ladder instrument errors on the smoke leg');
  assert.ok(trust.census.tradeRoad, 'census carries the trade-road rollup');
  assert.strictEqual(trust.census.tradeRoad.errors, 0, '0 traderoad instrument errors on the smoke leg');
  assert.ok(trust.census.tradeRoad.rows > 0, 'trade-road daily rows present');
  assert.ok(trust.census.wildW4, 'census carries the wild-w4 rollup');
  assert.strictEqual(trust.census.wildW4.errors, 0, '0 wild-watch instrument errors on the smoke leg');
  assert.ok(trust.census.wildW4.rows > 0, 'wild fights recorded on the smoke leg');
  const tr = JSON.parse(fs.readFileSync(path.join(tmp, 'journey-scale-r113-traderoad-97901.json'), 'utf8'));
  assert.ok(Array.isArray(tr.daily), 'traderoad corpus has a daily array');
  assert.ok(tr.daily.length > 0, 'traderoad daily rows present');
  assert.ok(Array.isArray(tr.beatAnswers), 'traderoad corpus has beat answers');
  assert.ok(Array.isArray(tr.wildFights), 'traderoad corpus has wild fights');
  assert.ok(tr.wildFights.length > 0, 'wild-fight log is non-empty');
  assert.ok(tr.wildFights.every(f => f.cls === 'scholar' || f.cls === 'villager' || f.cls === 'unknown'), 'wild fights carry a class');
  assert.strictEqual((tr.instrumentErrors || []).length, 0, '0 instrument errors in the traderoad corpus');
  const txt = fs.readFileSync(path.join(tmp, 'journey-scale-r113-traderoad-97901.txt'), 'utf8').split('\n').filter(Boolean);
  assert.ok(txt.length > 0, 'traderoad txt has rows');
  assert.ok(/^d\d+ subs=/.test(txt[0]), 'traderoad row shape');
  const wf = fs.readFileSync(path.join(tmp, 'journey-scale-r113-wildfights-97901.txt'), 'utf8').split('\n').filter(Boolean);
  assert.ok(wf.length > 0, 'wildfights txt has rows');
  assert.ok(/^d\d+ (scholar|villager|unknown) /.test(wf[0]), 'wildfight row shape');
  const vet = JSON.parse(fs.readFileSync(path.join(tmp, 'journey-scale-r113-vetkill-97901.json'), 'utf8'));
  assert.ok(Array.isArray(vet.waveKillLog), 'vetkill corpus has a waveKillLog array');
  assert.strictEqual((vet.instrumentErrors || []).length, 0, '0 instrument errors in the vetkill corpus');
  const reg = JSON.parse(fs.readFileSync(path.join(tmp, 'journey-scale-r113-regional-97901.json'), 'utf8'));
  assert.ok((reg.daily || []).length > 0, 'regional corpus has rows');
  assert.strictEqual((reg.instrumentErrors || []).length, 0, '0 recorder errors on the smoke leg');
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
});

console.log(passed + ' passed');

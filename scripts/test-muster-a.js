// test-muster-a — fixtures for the muster-diag probe (sim-muster-a).
// Synthetic-Game fixtures only (no days run, no judged seeds): they
// prove the probe's snapshot math, call counting, wrap discipline,
// and refusal-text gating before the pilot sweep is judged.
// Usage: node scripts/test-muster-a.js
'use strict';
const assert = require('assert');
const { layerOn, newStore, installMusterDiag, snapshotRefusal, uniqueAllies, havenBlades, MUSTER_RE } = require('./policies/muster-diag');

let passed = 0;
function t(name, fn) { fn(); passed++; console.log('ok - ' + name); }

// Fake Game with a herald muster, two active links, one refusing.
function fakeGame() {
  const state = {
    scholar: { day: 74 },
    village: { roster: ['v-scholar', 'v-ana', 'v-bo'] },
    titans: {
      musters: { herald: { allies: [
        { villageId: 'ovA', vid: 'a1', hp: 100 },
        { villageId: 'ovA', vid: 'a1', hp: 90 }, // duplicate: unique counts 1
        { villageId: 'ovA', vid: 'a2', hp: 0 },  // dead: filtered
        { villageId: 'ovB', vid: 'b1', hp: 50 },
      ], haven: [{ vid: 'v-ana' }, { vid: 'v-scholar' }] } }, // scholar excluded -> 1 valid
      omens: { herald: { stage: 2, day: 60 } },
      outcomes: [{ titan: 'herald', outcome: 'refused' }],
      slain: {},
    },
  };
  const villages = {
    ovA: { name: 'Ash', opinion: 20, roster: [
      { id: 'a1', alive: true, age: 30, health: 100 },
      { id: 'a2', alive: true, age: 30, health: 0 },
      { id: 'a3', alive: true, age: 30, health: 100 },
      { id: 'a4', alive: false, age: 30, health: 100 },
    ] },
    ovB: { name: 'Birch', opinion: -20, roster: [
      { id: 'b1', alive: true, age: 30, health: 100 },
    ] },
  };
  const G = {
    state: state, villagerId: 'v-scholar', data: { titans: { _coalition: { baseBlades: 2, trustedBlades: 6, trustedAt: 70, trustedOpinion: 10 } } },
    say: function () { return 'said'; },
    _otherVillage: function (id) { return villages[id] || null; },
    _linkOther: function (link) { return link.other; },
    hierarchyState: function () {
      return [
        { status: 'active', other: 'ovA', trust: 80, arrears: 0 }, // trusted: quota 6, faces free: a3 only (a1 committed, a2 health 0, a4 dead) -> yield min(6-2,1)=1? already counts raw allies per village: a1,a2 = 2 -> quota-already=4, faces 1 -> 1
        { status: 'active', other: 'ovB', trust: 50, arrears: 0 }, // opinion -20 -> refuses
        { status: 'dormant', other: 'ovA', trust: 90, arrears: 0 }, // inactive: ignored
      ];
    },
    titanHavenBlades: function (m) { return (m.haven || []).filter(function (h) { return h.vid !== 'v-scholar'; }); },
    titanVolunteers: function () { return ['v-ana', 'v-bo']; },
    titanMusterReady: function () { return false; },
    soundTitanCall: function () { return { allies: [] }; },
    titanCommitOwn: function () { return 'confirm'; },
    titanWarCouncil: function () { return { allies: 0 }; },
    titanSelfDo: function () { return null; },
  };
  return G;
}

t('layerOn follows MUSTER env', function () {
  const prev = process.env.MUSTER;
  process.env.MUSTER = '1'; assert.strictEqual(layerOn(), true);
  delete process.env.MUSTER; assert.strictEqual(layerOn(), false);
  if (prev !== undefined) process.env.MUSTER = prev;
});

t('refusal regex parses have/need', function () {
  const text = '⛔ THE HERALD does not notice you the way prey notices a hunter. You cannot face this alone — sound the call, muster 10 allied blades (you have 0).';
  const m = MUSTER_RE.exec(text);
  assert.strictEqual(m[1], '10'); assert.strictEqual(m[2], '0');
});

t('uniqueAllies dedupes, drops dead hp, keeps missing home person', function () {
  const G = fakeGame();
  const uniq = uniqueAllies(G, G.state.titans.musters.herald);
  assert.deepStrictEqual(uniq.map(function (a) { return a.villageId + ':' + a.vid; }).sort(), ['ovA:a1', 'ovB:b1']);
  const kept = uniqueAllies(G, { allies: [{ villageId: 'ovMissing', vid: 'x1', hp: 100 }] });
  assert.strictEqual(kept.length, 1);
});

t('havenBlades excludes the scholar', function () {
  const G = fakeGame();
  assert.strictEqual(havenBlades(G, G.state.titans.musters.herald).length, 1);
});

t('snapshot carries all components C0-C9', function () {
  const G = fakeGame();
  const store = newStore();
  const snap = snapshotRefusal(G, store, '⛔ THE HERALD does not notice you — muster 10 allied blades (you have 3).', 3, 10);
  assert.strictEqual(snap.day, 74);
  assert.strictEqual(snap.musterExists, true);
  assert.strictEqual(snap.alliesRaw, 4); // raw, incl dup + dead hp
  assert.strictEqual(snap.alliesUnique, 2);
  assert.strictEqual(snap.havenValid, 1);
  assert.strictEqual(snap.readyManual, false); // 2 + 1 < 10
  assert.strictEqual(snap.readyGame, false);
  assert.strictEqual(snap.omenStage, 2);
  assert.strictEqual(snap.linksActive, 2);
  assert.strictEqual(snap.callYield, 1); // ovA yields 1, ovB refuses
  const ovA = snap.links.find(function (l) { return l.villageId === 'ovA'; });
  const ovB = snap.links.find(function (l) { return l.villageId === 'ovB'; });
  assert.strictEqual(ovA.quota, 6); assert.strictEqual(ovA.facesFree, 1); assert.strictEqual(ovA.wouldYield, 1);
  assert.strictEqual(ovB.wouldRefuse, true); assert.strictEqual(ovB.wouldYield, 0);
  assert.strictEqual(snap.callOffered, true);
  assert.strictEqual(snap.commitOffered, true);
  assert.strictEqual(snap.volunteers, 2);
  assert.strictEqual(snap.outcomesPrior, 1);
  assert.deepStrictEqual(snap.callsSoFar, { soundTitanCall: 0, titanCommitOwn: 0, titanSelfDo: 0, titanWarCouncil: 0 });
});

t('snapshot with no muster and no omen is all-zero, not a crash', function () {
  const G = fakeGame();
  G.state.titans = { musters: {}, omens: {}, outcomes: [], slain: {} };
  G.hierarchyState = function () { return []; };
  const snap = snapshotRefusal(G, newStore(), '⛔ THE HERALD does not notice you — muster 10 allied blades (you have 0).', 0, 10);
  assert.strictEqual(snap.musterExists, false);
  assert.strictEqual(snap.alliesRaw, 0);
  assert.strictEqual(snap.alliesUnique, 0);
  assert.strictEqual(snap.havenValid, 0);
  assert.strictEqual(snap.linksActive, 0);
  assert.strictEqual(snap.callYield, 0);
  assert.strictEqual(snap.omenStage, null);
  assert.strictEqual(snap.callOffered, false);
  assert.strictEqual(snap.commitOffered, false);
});

t('snapshot with omen stage 1 offers nothing', function () {
  const G = fakeGame();
  G.state.titans.musters = {};
  G.state.titans.omens = { herald: { stage: 1, day: 60 } };
  G.hierarchyState = function () { return []; };
  const snap = snapshotRefusal(G, newStore(), '⛔ THE HERALD does not notice you — muster 10 allied blades (you have 0).', 0, 10);
  assert.strictEqual(snap.omenStage, 1);
  assert.strictEqual(snap.callOffered, false);
});

t('say wrap snapshots only muster refusals, delegates, counts verbs', function () {
  const G = fakeGame();
  const store = newStore();
  installMusterDiag(G, store);
  assert.strictEqual(store.installed, true);
  assert.strictEqual(G.say('hello'), 'said');
  assert.strictEqual(store.refusals.length, 0);
  G.say('⛔ THE HERALD does not notice you the way prey notices a hunter. You cannot face this alone — sound the call, muster 10 allied blades (you have 0).');
  assert.strictEqual(store.refusals.length, 1);
  assert.strictEqual(store.refusals[0].have, 0);
  assert.strictEqual(store.refusals[0].need, 10);
  G.soundTitanCall('herald');
  G.titanCommitOwn('herald');
  G.titanWarCouncil('herald');
  G.titanSelfDo('titan:call:herald');
  G.titanSelfDo('titan:commit:herald');
  assert.strictEqual(store.callTotals.soundTitanCall, 1);
  assert.strictEqual(store.callTotals.titanCommitOwn, 1);
  assert.strictEqual(store.callTotals.titanWarCouncil, 1);
  assert.strictEqual(store.callTotals.titanSelfDo, 2);
  assert.strictEqual(store.calls.titanSelfDo['titan:call:herald'], 1);
  assert.strictEqual(store.commitReturns.length, 1);
  assert.strictEqual(store.commitReturns[0].kind, 'confirm');
});

t('install is idempotent: second install does not double-count', function () {
  const G = fakeGame();
  const store = newStore();
  installMusterDiag(G, store);
  installMusterDiag(G, store);
  G.soundTitanCall('herald');
  assert.strictEqual(store.callTotals.soundTitanCall, 1);
});

t('engine throw inside a wrapped verb is rethrown unchanged', function () {
  const G = fakeGame();
  G.soundTitanCall = function () { throw new Error('boom-test'); };
  const store = newStore();
  installMusterDiag(G, store);
  assert.throws(function () { G.soundTitanCall('herald'); }, /boom-test/);
  assert.strictEqual(store.callTotals.soundTitanCall, 1);
});

t('missing verb is a counted error, never a crash', function () {
  const G = fakeGame();
  delete G.titanSelfDo;
  const store = newStore();
  installMusterDiag(G, store);
  assert.ok(store.errs >= 1);
  assert.strictEqual(store.installed, true);
});

console.log('PASS test-muster-a: ' + passed + ' fixtures');

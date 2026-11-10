#!/usr/bin/env node
// scripts/test-bindingtrace-b.js — proof test for the bindingtrace-b recorder
// (sim-bindingtrace-b, 2026-11-10, flesh-out loop B, axis scale-onramp).
//
// Proves, WITHOUT a game load:
//   (1) belongGood: the valued-subordinate bar (trust >= 50, arrears 0,
//       age >= 14) on synthetic links — every boundary;
//   (2) foreignSizeFor: polity size as polityOf computes it (primary +
//       Haven + foreign subs);
//   (3) classifyBelong: the FIRST-failing-link classification on synthetic
//       recorder data — every chain stage;
//   (4) recorder purity on a mock Game: recordDaily twice produces
//       identical snapshots, writes NOTHING to game state (deep-equal
//       before/after), and draws NO RNG (Math.random patched to throw);
//   (5) event legs on a mock Game: counter staged -> link formed via
//       counter (accept-sub vs sweeten-primary), belong good first-day,
//       foreign-realm first-day, LEAD-mask day counting, Binding death-why
//       attribution (exiled answerer).
// Exit 1 on any failure. Run: node scripts/test-bindingtrace-b.js
'use strict';
const assert = require('assert');
const { belongGood, foreignSizeFor, classifyBelong, recordDaily, ensureBT } = require('./policies/bindingtrace-b');

let pass = 0;
function check(name, fn) {
  try { fn(); pass++; console.log(`  PASS ${name}`); }
  catch (e) { console.error(`  FAIL ${name}: ${(e && e.message) || e}`); process.exitCode = 1; }
}

// (1) belongGood
check('belongGood: trust 50, arrears 0, age 14 -> true (exact bar)', () => {
  assert.strictEqual(belongGood({ status: 'active', subordinate: 'haven', trust: 50, arrears: 0, day: 10 }, 24), true);
});
check('belongGood: trust 49 -> false', () => {
  assert.strictEqual(belongGood({ status: 'active', subordinate: 'haven', trust: 49, arrears: 0, day: 10 }, 24), false);
});
check('belongGood: arrears 1 -> false', () => {
  assert.strictEqual(belongGood({ status: 'active', subordinate: 'haven', trust: 60, arrears: 1, day: 10 }, 24), false);
});
check('belongGood: age 13 -> false', () => {
  assert.strictEqual(belongGood({ status: 'active', subordinate: 'haven', trust: 60, arrears: 0, day: 10 }, 23), false);
});
check('belongGood: Haven-primary link is never a belong link', () => {
  assert.strictEqual(belongGood({ status: 'active', subordinate: 'v1', trust: 90, arrears: 0, day: 1 }, 50), false);
});
check('belongGood: broken link -> false', () => {
  assert.strictEqual(belongGood({ status: 'broken', subordinate: 'haven', trust: 90, arrears: 0, day: 1 }, 50), false);
});

// (2) foreignSizeFor
check('foreignSizeFor: primary + Haven + 2 subs = 4 (realm)', () => {
  assert.strictEqual(foreignSizeFor('v2', [{ primary: 'v2', subs: ['v3', 'v4'] }]), 4);
});
check('foreignSizeFor: primary + Haven + 1 sub = 3 (pact, not realm)', () => {
  assert.strictEqual(foreignSizeFor('v2', [{ primary: 'v2', subs: ['v3'] }]), 3);
});
check('foreignSizeFor: no foreign record for the primary = 2', () => {
  assert.strictEqual(foreignSizeFor('v9', [{ primary: 'v2', subs: ['v3', 'v4'] }]), 2);
});
check('foreignSizeFor: empty foreign list = 2', () => {
  assert.strictEqual(foreignSizeFor('v2', []), 2);
});

// (3) classifyBelong — every chain stage, first failing link named
function baseD(over) {
  return Object.assign({
    first: {
      foreignPairDay: null, foreignTripleDay: null, foreignRealmDay: null,
      firstCounterDay: null, firstBelongLinkDay: null,
      firstBelongGoodDay: null, firstBelongQualifyDay: null,
      firstBindingStagedDay: null, firstBindingAnsweredDay: null,
    },
    maxForeignSize: 0, belongQualifyDays: 0, leadMaskDays: 0, maskStageDays: 0,
    nationalLiveViaLead: false, bindingBeats: [],
  }, over || {});
}
check('classify: no foreign realm at all -> no-foreign-realm', () => {
  assert.deepStrictEqual(classifyBelong(baseD()), { stage: 'none', link: 'no-foreign-realm' });
});
check('classify: foreign realm but no belong link -> foreign-realm-no-belong-link', () => {
  const d = baseD({ first: Object.assign(baseD().first, { foreignRealmDay: 60 }) });
  assert.deepStrictEqual(classifyBelong(d), { stage: 'B0', link: 'foreign-realm-no-belong-link' });
});
check('classify: belong link formed, never good -> belong-link-never-good', () => {
  const d = baseD({ first: Object.assign(baseD().first, { foreignRealmDay: 60, firstBelongLinkDay: 40 }) });
  assert.deepStrictEqual(classifyBelong(d), { stage: 'B1', link: 'belong-link-never-good' });
});
check('classify: belong good, realm never 4 while good -> belong-good-no-realm', () => {
  const d = baseD({ first: Object.assign(baseD().first, { foreignRealmDay: 90, firstBelongLinkDay: 40, firstBelongGoodDay: 55 }) });
  assert.deepStrictEqual(classifyBelong(d), { stage: 'B2', link: 'belong-good-no-realm' });
});
check('classify: qualified, LEAD staged the beat -> masked-by-lead', () => {
  const d = baseD({ first: Object.assign(baseD().first, { firstBelongQualifyDay: 70 }), maskStageDays: 1 });
  assert.deepStrictEqual(classifyBelong(d), { stage: 'B3', link: 'masked-by-lead' });
});
check('classify: qualified, national already live via LEAD -> masked-by-lead-national-live', () => {
  const d = baseD({ first: Object.assign(baseD().first, { firstBelongQualifyDay: 70 }), nationalLiveViaLead: true });
  assert.deepStrictEqual(classifyBelong(d), { stage: 'B3', link: 'masked-by-lead-national-live' });
});
check('classify: Binding staged then died exiled -> binding-died:exiled-answerer', () => {
  const d = baseD({
    first: Object.assign(baseD().first, { firstBelongQualifyDay: 70, firstBindingStagedDay: 77 }),
    bindingBeats: [{ shape: 'belong', stagedDay: 77, resolvedDay: 78, outcome: 'died', deathWhy: 'exiled-answerer' }],
  });
  assert.deepStrictEqual(classifyBelong(d), { stage: 'B4', link: 'binding-died:exiled-answerer' });
});
check('classify: Binding walked -> binding-walked', () => {
  const d = baseD({
    first: Object.assign(baseD().first, { firstBelongQualifyDay: 70, firstBindingStagedDay: 77 }),
    bindingBeats: [{ shape: 'belong', stagedDay: 77, resolvedDay: 77, outcome: 'refused', deathWhy: null }],
  });
  assert.deepStrictEqual(classifyBelong(d), { stage: 'B4', link: 'binding-walked' });
});
check('classify: Binding answered -> binding-answered (chain complete)', () => {
  const d = baseD({
    first: Object.assign(baseD().first, { firstBelongQualifyDay: 70, firstBindingStagedDay: 77, firstBindingAnsweredDay: 77 }),
    bindingBeats: [{ shape: 'belong', stagedDay: 77, resolvedDay: 77, outcome: 'answered', deathWhy: null, nationalDay: 77 }],
  });
  assert.deepStrictEqual(classifyBelong(d), { stage: 'B5', link: 'binding-answered' });
});

// (4)+(5) mock Game legs
function mockGame(stateOver, links) {
  const state = Object.assign({
    scholar: { day: 30, exiled: false },
    networkLive: true, networkLiveDay: 10,
    nationalLive: false, nationalShape: null, globalLive: false, scaleRefused: false,
    pendingNational: null, pendingCounter: null, _natDefer: {},
    _regionStir: 0, _regionStirKinds: [],
    foreignPolities: [],
  }, stateOver || {});
  return {
    state,
    _links: links || [],
    hierarchyState() { return this._links; },
    _linkSeasoned(l) { return (this.state.scholar.day - (l.day | 0)) >= 30 && (l.trust | 0) >= 40; },
    scaleRank() { return this.state.nationalLive ? 'national' : (this.state.networkLive ? 'regional' : 'village'); },
  };
}
function snapOf(ctx) {
  const D = ctx._bindingtrace;
  // The classification surface: first-days, counters, links, beats. (The
  // per-day counters belongQualifyDays/traj grow per CALL by design — the
  // harness calls daily once per day — so they are excluded here.)
  return JSON.stringify({ first: D.first, counters: D.counters, linkForms: D.linkForms, maskStageDays: D.maskStageDays, maxForeignSize: D.maxForeignSize, bindingBeats: D.bindingBeats });
}

check('purity: recordDaily twice identical, no game-state write, no RNG', () => {
  const G = mockGame({}, [
    { id: 'l1', status: 'active', primary: 'haven', subordinate: 'v1', day: 5, trust: 55 },
    { id: 'l2', status: 'active', primary: 'v2', subordinate: 'haven', day: 10, trust: 52 },
  ]);
  G.state.foreignPolities = [{ primary: 'v2', subs: ['v3', 'v4'], day: 12 }];
  const before = JSON.stringify(G.state) + '|' + JSON.stringify(G._links);
  const ctx = {};
  const realRandom = Math.random;
  Math.random = () => { throw new Error('RNG drawn by recorder'); };
  try {
    recordDaily(G, ctx);
    const one = snapOf(ctx);
    recordDaily(G, ctx);
    const two = snapOf(ctx);
    // Second call adds a second traj point but the classification surface
    // (first-days, counters, links, beats) must be unchanged.
    assert.strictEqual(one, two);
  } finally { Math.random = realRandom; }
  assert.strictEqual(JSON.stringify(G.state) + '|' + JSON.stringify(G._links), before);
});

check('events: counter staged then accept-sub link forms, belong good + qualify recorded', () => {
  const ctx = {};
  const G = mockGame({ scholar: { day: 40, exiled: false } }, []);
  // Day 40: a counter is pending for v2 (they'll TAKE Haven).
  G.state.pendingCounter = { targetId: 'v2', asSubordinate: true, day: 40 };
  recordDaily(G, ctx);
  let D = ctx._bindingtrace;
  assert.strictEqual(D.counters.length, 1);
  assert.strictEqual(D.counters[0].outcome, null);
  assert.strictEqual(D.first.firstCounterDay, 40);
  // Day 41: counter answered, link formed Haven-subordinate at trust 30
  // (the formation trust); foreign realm of v2 already size 4.
  G.state.scholar.day = 41;
  G.state.pendingCounter = null;
  G.state.foreignPolities = [{ primary: 'v2', subs: ['v3', 'v4'], day: 12 }];
  G._links = [{ id: 'lx', status: 'active', primary: 'v2', subordinate: 'haven', day: 41, trust: 30 }];
  recordDaily(G, ctx);
  D = ctx._bindingtrace;
  assert.strictEqual(D.linkForms.length, 1);
  assert.strictEqual(D.linkForms[0].role, 'subordinate');
  assert.strictEqual(D.linkForms[0].viaCounter, true);
  assert.strictEqual(D.counters[0].outcome, 'accept-sub');
  assert.strictEqual(D.first.firstBelongLinkDay, 41);
  assert.strictEqual(D.first.firstBelongGoodDay, null); // trust 30 < 50, age 0
  // Day 60: the link has been tended to trust 55 and is 19 days old.
  G.state.scholar.day = 60;
  G._links = [{ id: 'lx', status: 'active', primary: 'v2', subordinate: 'haven', day: 41, trust: 55 }];
  recordDaily(G, ctx);
  D = ctx._bindingtrace;
  assert.strictEqual(D.first.firstBelongGoodDay, 60);
  assert.strictEqual(D.first.firstBelongQualifyDay, 60);
  assert.strictEqual(D.belongQualifyDays, 1);
  assert.strictEqual(D.first.foreignRealmDay, 41);
  assert.deepStrictEqual(classifyBelong(D), { stage: 'B3', link: 'qualified-never-staged' });
});

check('events: sweeten-primary link does NOT count as a belong link', () => {
  const ctx = {};
  const G = mockGame({ scholar: { day: 40, exiled: false } }, []);
  G.state.pendingCounter = { targetId: 'v2', asSubordinate: true, day: 40 };
  recordDaily(G, ctx);
  G.state.scholar.day = 41;
  G.state.pendingCounter = null;
  G._links = [{ id: 'ly', status: 'active', primary: 'haven', subordinate: 'v2', day: 41, trust: 30 }];
  recordDaily(G, ctx);
  const D = ctx._bindingtrace;
  assert.strictEqual(D.linkForms[0].role, 'primary');
  assert.strictEqual(D.counters[0].outcome, 'sweeten-primary');
  assert.strictEqual(D.first.firstBelongLinkDay, null);
  assert.deepStrictEqual(classifyBelong(D), { stage: 'none', link: 'no-foreign-realm' });
});

check('events: counter with no link resolves no-link (sweeten failed)', () => {
  const ctx = {};
  const G = mockGame({ scholar: { day: 40, exiled: false } }, []);
  G.state.pendingCounter = { targetId: 'v2', asSubordinate: true, day: 40 };
  recordDaily(G, ctx);
  G.state.scholar.day = 41;
  G.state.pendingCounter = null;
  recordDaily(G, ctx);
  const D = ctx._bindingtrace;
  assert.strictEqual(D.counters[0].outcome, 'no-link');
  assert.strictEqual(D.linkForms.length, 0);
});

check('events: LEAD-mask day counted when a lead beat stages while belong qualifies', () => {
  const ctx = { _binddiag: { beats: [{ shape: 'lead', stagedDay: 77, resolvedDay: 77, outcome: 'answered', nationalDay: 77 }] } };
  const G = mockGame({ scholar: { day: 77, exiled: false }, nationalLive: true, nationalShape: 'lead' }, [
    { id: 'l1', status: 'active', primary: 'haven', subordinate: 'v1', day: 20, trust: 55 },
    { id: 'l2', status: 'active', primary: 'haven', subordinate: 'v3', day: 22, trust: 61 },
    { id: 'l3', status: 'active', primary: 'haven', subordinate: 'v4', day: 25, trust: 44 },
    { id: 'lx', status: 'active', primary: 'v2', subordinate: 'haven', day: 10, trust: 52 },
  ]);
  G.state.foreignPolities = [{ primary: 'v2', subs: ['v5', 'v6'], day: 12 }];
  recordDaily(G, ctx);
  const D = ctx._bindingtrace;
  assert.strictEqual(D.belongQualifyDays, 1);
  assert.strictEqual(D.leadMaskDays, 1);
  assert.strictEqual(D.maskStageDays, 1);
  assert.strictEqual(D.nationalLiveViaLead, true);
  assert.deepStrictEqual(classifyBelong(D), { stage: 'B3', link: 'masked-by-lead' });
});

check('events: belong beat died while scholar exiled -> deathWhy exiled-answerer', () => {
  const ctx = { _binddiag: { beats: [{ shape: 'belong', stagedDay: 77, resolvedDay: 78, outcome: 'died', nationalDay: null }] } };
  const G = mockGame({ scholar: { day: 78, exiled: true } }, [
    { id: 'lx', status: 'active', primary: 'v2', subordinate: 'haven', day: 10, trust: 52 },
  ]);
  G.state.foreignPolities = [{ primary: 'v2', subs: ['v3', 'v4'], day: 12 }];
  recordDaily(G, ctx);
  const D = ctx._bindingtrace;
  assert.strictEqual(D.bindingBeats.length, 1);
  assert.strictEqual(D.bindingBeats[0].deathWhy, 'exiled-answerer');
  assert.strictEqual(D.first.firstBindingStagedDay, 77);
  assert.deepStrictEqual(classifyBelong(D), { stage: 'B4', link: 'binding-died:exiled-answerer' });
});

check('events: belong beat died with link gone -> deathWhy belong-link-gone', () => {
  const ctx = { _binddiag: { beats: [{ shape: 'belong', stagedDay: 77, resolvedDay: 78, outcome: 'died', nationalDay: null }] } };
  const G = mockGame({ scholar: { day: 78, exiled: false } }, []);
  recordDaily(G, ctx);
  const D = ctx._bindingtrace;
  assert.strictEqual(D.bindingBeats[0].deathWhy, 'belong-link-gone');
});

console.log(`\ntest-bindingtrace-b: ${pass} checks passed${process.exitCode ? ' (FAILURES ABOVE)' : ''}`);

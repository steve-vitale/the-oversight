#!/usr/bin/env node
// scripts/test-tendtrust-b.js — proof test for the tendtrust-b recorder
// (sim-tendtrust-b, 2026-11-08, flesh-out loop B, axis scale-onramp).
//
// Proves, WITHOUT a game load:
//   (1) tendsNeeded / bufferTends: the sizing arithmetic (ceil division,
//       zero shortfall -> 0, zero/unknown lift -> null, never a simulation);
//   (2) snapTT: seasoned-sub counts, LEAD shortfall, per-link trust gaps
//       and days-to-season on synthetic link sets;
//   (3) recorder purity on a mock Game: recordPre+recordPost twice
//       produces identical trajectory points, writes NOTHING to game state
//       (deep-equal before/after), and draws NO RNG (Math.random patched
//       to throw);
//   (4) tend detection incl. the same-day inference: a tendedWeek flip
//       between pre and post snapshots records the tend with trust
//       before/after, measured lift, pantry pre/post, and the parsed note
//       gain — even when a same-day trust event would mask an end-of-day
//       read;
//   (5) refused tends: a substrate attempt (ctx.tendTrusts) with no flip
//       is recorded as refused with the mourning window that explains it;
//   (6) gate-blocked opportunities: a dipping link on a thin pantry is
//       recorded, a dipping link on a rich pantry is not;
//   (7) overnight deltas: engine-side trust moves between post and the
//       next pre are recorded with history-kind attribution;
//   (8) national-loss dips: a nationalLive true->false flip records which
//       seasoned link dipped below 40, by how much;
//   (9) same-day beat inference: a nationalLive flip with no open beat
//       records an inferred same-day stage+answer beat.
// Exit 1 on any failure. Run: node scripts/test-tendtrust-b.js
'use strict';
const assert = require('assert');
const { tendsNeeded, bufferTends, snapTT, recordPre, recordPost, ensureTT, noteGainFromHistory, historyKindsAdded } = require('./policies/tendtrust-b');

let pass = 0;
function check(name, fn) {
  try { fn(); pass++; console.log(`  PASS ${name}`); }
  catch (e) { console.error(`  FAIL ${name}: ${(e && e.message) || e}`); process.exitCode = 1; }
}

// (1) sizing arithmetic
check('tendsNeeded: shortfall 3 at lift 8 -> 1 tend', () => {
  assert.strictEqual(tendsNeeded(3, 8), 1);
});
check('tendsNeeded: shortfall 8 at lift 8 -> exactly 1 tend', () => {
  assert.strictEqual(tendsNeeded(8, 8), 1);
});
check('tendsNeeded: shortfall 9 at lift 8 -> 2 tends', () => {
  assert.strictEqual(tendsNeeded(9, 8), 2);
});
check('tendsNeeded: shortfall 0 -> 0 tends (already seasoned)', () => {
  assert.strictEqual(tendsNeeded(0, 8), 0);
});
check('tendsNeeded: shortfall 7 at lift 4 -> 2 tends', () => {
  assert.strictEqual(tendsNeeded(7, 4), 2);
});
check('tendsNeeded: lift 0 -> null (no finite tend count closes it)', () => {
  assert.strictEqual(tendsNeeded(5, 0), null);
});
check('bufferTends: dip 5 at lift 8 -> 1 tend of headroom', () => {
  assert.strictEqual(bufferTends(5, 8), 1);
});
check('bufferTends: dip 16 at lift 8 -> 2 tends of headroom', () => {
  assert.strictEqual(bufferTends(16, 8), 2);
});

// (2) snapTT on synthetic links
function mockGame(over) {
  const state = {
    scholar: { day: 70 },
    village: { pantry: [{ kcalEach: 15000, units: 1 }] },
    otherVillages: [
      { id: 'v1', pantryKcal: 5000 },
      { id: 'v2', pantryKcal: 3000 },
      { id: 'v3', pantryKcal: 8000 },
      { id: 'v4', pantryKcal: 1000 },
    ],
    networkLive: true, networkLiveDay: 30,
    nationalLive: false, globalLive: false, scaleRefused: false,
    pendingNational: null,
    foreignPolities: [],
  };
  const links = [
    { id: 'l1', status: 'active', primary: 'haven', subordinate: 'v1', day: 20, trust: 55, conquered: false, history: [] },
    { id: 'l2', status: 'active', primary: 'haven', subordinate: 'v2', day: 22, trust: 61, conquered: false, history: [] },
    { id: 'l3', status: 'active', primary: 'haven', subordinate: 'v3', day: 25, trust: 44, conquered: false, history: [] },
    { id: 'l4', status: 'active', primary: 'haven', subordinate: 'v4', day: 60, trust: 33, conquered: false, history: [] },
  ];
  const G = {
    state, _links: links,
    scaleRank: () => (state.nationalLive ? 'national' : state.networkLive ? 'regional' : 'village'),
    hierarchyState: () => links,
    _linkSeasoned: (l, forConquest, forPolity) => {
      if (!l || l.status !== 'active') return false;
      if ((state.scholar.day - (l.day || 0)) < 30) return false;
      if (forConquest) return true;
      return (l.trust || 0) >= 40;
    },
    _week: () => Math.floor(state.scholar.day / 7),
    won: false,
  };
  if (over) over(G, state, links);
  return G;
}
check('mock snap: 3 seasoned subs qualify LEAD, shortfall 0', () => {
  const G = mockGame();
  const s = snapTT(G);
  assert.strictEqual(s.subs, 4);
  assert.strictEqual(s.seasonedSubs, 3);
  assert.strictEqual(s.shortfallSubs, 0);
  assert.strictEqual(s.leadQ, true);
  assert.strictEqual(s.pantry, 15000);
  const young = s.links.find(l => l.id === 'l4');
  assert.strictEqual(young.seasoned, false);
  assert.strictEqual(young.trustGap, 7);
  assert.strictEqual(young.daysToSeason, 20);
  assert.strictEqual(young.subPantry, 1000);
});
check('mock snap: 2 seasoned subs, shortfall 1, gaps named per link', () => {
  const G = mockGame((g, st, links) => { links[2].trust = 38; });
  const s = snapTT(G);
  assert.strictEqual(s.seasonedSubs, 2);
  assert.strictEqual(s.shortfallSubs, 1);
  assert.strictEqual(s.leadQ, false);
  const dipping = s.links.find(l => l.id === 'l3');
  assert.strictEqual(dipping.trustGap, 2);
  assert.strictEqual(dipping.daysToSeason, 0);
});

// (3) recorder purity
check('recordPre+recordPost twice: identical points, no state writes, no RNG', () => {
  const G = mockGame();
  const before = JSON.stringify(G.state);
  const beforeLinks = JSON.stringify(G._links);
  const realRandom = Math.random;
  Math.random = () => { throw new Error('RNG drawn by recorder'); };
  try {
    const ctx = {};
    recordPre(G, ctx); recordPost(G, ctx);
    const firstPoint = JSON.stringify(ctx._tendtrust.traj[0]);
    recordPre(G, ctx); recordPost(G, ctx);
    assert.strictEqual(JSON.stringify(ctx._tendtrust.traj[0]), firstPoint);
    assert.strictEqual(ctx._tendtrust.traj.length, 2);
    assert.strictEqual(ctx._tendtrust.days, 2);
    assert.strictEqual(ctx._tendtrust.errs, 0);
    assert.strictEqual(ctx._tendtrust.tends.length, 0);
  } finally { Math.random = realRandom; }
  assert.strictEqual(JSON.stringify(G.state), before, 'recorder wrote to game state');
  assert.strictEqual(JSON.stringify(G._links), beforeLinks, 'recorder wrote to links');
});

// (4) tend detection incl. same-day masking
check('tend detected by tendedWeek flip with lift +8 and parsed note gain', () => {
  const G = mockGame((g, st, links) => { links[3].trust = 33; links[3].day = 30; });
  const ctx = {};
  recordPre(G, ctx); // day 70, l4 trust 33, tendedWeek null, pantry 15000
  // The inner daily tends l4: tendedWeek stamps, trust +8, note lands.
  // A same-day tribute event would ALSO move trust — the flip, not the
  // end-of-day trust, is what identifies the tend.
  G._links[3].tendedWeek = 10;
  G._links[3].trust = 41;
  G._links[3].history.push({ day: 70, kind: 'tended', note: 'Haven sent grain (1,500 kcal, trust +8); the bond is fed.' });
  recordPost(G, ctx);
  assert.strictEqual(ctx._tendtrust.tends.length, 1);
  const t = ctx._tendtrust.tends[0];
  assert.strictEqual(t.linkId, 'l4');
  assert.strictEqual(t.trustBefore, 33);
  assert.strictEqual(t.trustAfter, 41);
  assert.strictEqual(t.lift, 8);
  assert.strictEqual(t.noteGain, 8);
  assert.strictEqual(t.pantryPre, 15000);
  assert.strictEqual(t.pantryPost, 15000);
  assert.strictEqual(t.week, 10);
});
check('tend lift is measured, not assumed: partial pantry tend lifts +5', () => {
  const G = mockGame((g, st, links) => { links[3].trust = 33; links[3].day = 30; });
  const ctx = {};
  recordPre(G, ctx);
  G._links[3].tendedWeek = 10;
  G._links[3].trust = 38;
  G._links[3].history.push({ day: 70, kind: 'tended', note: 'Haven sent grain (950 kcal, trust +5); the bond is fed.' });
  recordPost(G, ctx);
  assert.strictEqual(ctx._tendtrust.tends[0].lift, 5);
  assert.strictEqual(ctx._tendtrust.tends[0].noteGain, 5);
});
check('noteGainFromHistory parses the tended note, ignores other kinds', () => {
  const hist = [
    { day: 70, kind: 'tribute', note: 'v1 paid. The pantry grows.' },
    { day: 70, kind: 'tended', note: 'Haven sent grain (1,500 kcal, trust +8); the bond is fed.' },
  ];
  assert.strictEqual(noteGainFromHistory(hist, 70), 8);
  assert.strictEqual(noteGainFromHistory(hist, 69), null);
  assert.strictEqual(noteGainFromHistory([], 70), null);
});
check('historyKindsAdded finds only the new entries', () => {
  const before = [{ day: 70, kind: 'tribute', note: 'paid.' }];
  const after = before.concat([{ day: 71, kind: 'tended', note: 'grain.' }]);
  assert.deepStrictEqual(historyKindsAdded(before, after), ['tended']);
  assert.deepStrictEqual(historyKindsAdded(after, before), []);
});

// (5) refused tends
check('substrate attempt with no flip is a refused tend with the mourning window', () => {
  const G = mockGame((g, st, links) => { links[3].trust = 33; links[3].day = 30; links[3].mourningUntil = 74; });
  const ctx = { tendTrusts: [] };
  recordPre(G, ctx);
  // The substrate attempted the tend (the attempt is the recorder's
  // cross-check input, recorded as the substrate saw it). tendLink refused
  // in mourning: no tendedWeek stamp, no trust move.
  ctx.tendTrusts.push({ day: 70, id: 'l4', trust: 33 });
  ctx.tended = 1;
  recordPost(G, ctx);
  assert.strictEqual(ctx._tendtrust.tends.length, 0);
  assert.strictEqual(ctx._tendtrust.tendAttempts.length, 1);
  assert.strictEqual(ctx._tendtrust.tendAttempts[0].flipped, false);
  assert.strictEqual(ctx._tendtrust.tendAttempts[0].mourningUntil, 74);
});

// (6) gate-blocked opportunities
check('dipping link on a thin pantry is gate-blocked; on a rich pantry it is not', () => {
  const thin = mockGame((g, st, links) => { links[3].trust = 33; links[3].day = 30; });
  const ctxThin = {};
  recordPre(thin, ctxThin); recordPost(thin, ctxThin);
  assert.strictEqual(ctxThin._tendtrust.gateBlocked.length, 1);
  assert.strictEqual(ctxThin._tendtrust.gateBlocked[0].linkId, 'l4');
  assert.strictEqual(ctxThin._tendtrust.gateBlocked[0].pantryPre, 15000);
  const rich = mockGame((g, st, links) => { links[3].trust = 33; links[3].day = 30; });
  rich.state.village.pantry = [{ kcalEach: 25000, units: 1 }];
  const ctxRich = {};
  recordPre(rich, ctxRich); recordPost(rich, ctxRich);
  assert.strictEqual(ctxRich._tendtrust.gateBlocked.length, 0);
});
check('a tended-this-week link is not gate-blocked', () => {
  const G = mockGame((g, st, links) => { links[3].trust = 33; links[3].day = 30; links[3].tendedWeek = 10; });
  const ctx = {};
  recordPre(G, ctx); recordPost(G, ctx);
  assert.strictEqual(ctx._tendtrust.gateBlocked.length, 0);
});

// (7) overnight deltas
check('overnight tribute shortfall is recorded with its history kind', () => {
  const G = mockGame((g, st, links) => { links[2].trust = 45; });
  const ctx = {};
  recordPre(G, ctx); recordPost(G, ctx); // day 70, l3 trust 45
  G.state.scholar.day = 71;
  G._links[2].trust = 43;
  G._links[2].history.push({ day: 71, kind: 'tribute', note: 'v3 paid thin: 1,000 of 4,000 kcal. Arrears +3,000.' });
  recordPre(G, ctx);
  assert.strictEqual(ctx._tendtrust.overnight.length, 1);
  const o = ctx._tendtrust.overnight[0];
  assert.strictEqual(o.linkId, 'l3');
  assert.strictEqual(o.delta, -2);
  assert.deepStrictEqual(o.kinds, ['tribute']);
});

// (8) national-loss dips
check('national loss records the link that dipped below 40', () => {
  const G = mockGame((g, st, links) => { links[2].trust = 44; });
  const ctx = {};
  G.state.nationalLive = true; G.state.nationalShape = 'lead';
  recordPre(G, ctx); recordPost(G, ctx); // day 70, national, l3 seasoned at 44
  // Eight days of trajectory so the dip has a "7 days ago" anchor.
  for (let d = 71; d <= 77; d++) { G.state.scholar.day = d; recordPre(G, ctx); recordPost(G, ctx); }
  G.state.scholar.day = 78;
  G._links[2].trust = 38;
  G.state.nationalLive = false;
  recordPre(G, ctx); recordPost(G, ctx);
  assert.strictEqual(ctx._tendtrust.nationalLost.length, 1);
  const loss = ctx._tendtrust.nationalLost[0];
  assert.strictEqual(loss.day, 78);
  assert.strictEqual(loss.dips.length, 1);
  assert.strictEqual(loss.dips[0].id, 'l3');
  assert.strictEqual(loss.dips[0].trustThen, 44);
  assert.strictEqual(loss.dips[0].trustNow, 38);
  assert.strictEqual(loss.dips[0].dip, 6);
});

// (10) engine tend promotion: a 'tended' history entry added overnight
// (the villagers' own win-plan drive) promotes into the tend log once,
// with its lift parsed from the note — and never duplicates.
check('engine tend promotes from an overnight tended entry, exactly once', () => {
  const G = mockGame((g, st, links) => { links[3].trust = 33; links[3].day = 30; });
  const ctx = {};
  recordPre(G, ctx); recordPost(G, ctx); // day 70, l4 trust 33
  G.state.scholar.day = 71;
  G._links[3].trust = 41;
  G._links[3].tendedWeek = 10;
  G._links[3].history.push({ day: 71, kind: 'tended', note: 'Haven sent grain (1,500 kcal, trust +8); the bond is fed.' });
  recordPre(G, ctx); // overnight: the engine tend lands here
  assert.strictEqual(ctx._tendtrust.tends.length, 1);
  const t = ctx._tendtrust.tends[0];
  assert.strictEqual(t.source, 'engine-winplan');
  assert.strictEqual(t.linkId, 'l4');
  assert.strictEqual(t.trustBefore, 33);
  assert.strictEqual(t.trustAfter, 41);
  assert.strictEqual(t.lift, 8);
  assert.strictEqual(t.noteGain, 8);
  assert.strictEqual(t.measuredDelta, 8);
  recordPost(G, ctx);
  // The next morning the same entry is already in lastPost: no duplicate.
  G.state.scholar.day = 72;
  recordPre(G, ctx);
  assert.strictEqual(ctx._tendtrust.tends.length, 1);
});
check('engine tend + succession shake the same night still promotes (delta 0)', () => {
  const G = mockGame((g, st, links) => { links[3].trust = 33; links[3].day = 30; });
  const ctx = {};
  recordPre(G, ctx); recordPost(G, ctx); // day 70, l4 trust 33
  G.state.scholar.day = 71;
  // Tend (+8) and a leader-death shake (-8) land the same night: the
  // trust delta is 0, so a delta-only detector would miss the tend.
  G._links[3].trust = 33;
  G._links[3].tendedWeek = 10;
  G._links[3].history.push({ day: 71, kind: 'tended', note: 'Haven sent grain (1,500 kcal, trust +8); the bond is fed.' });
  G._links[3].history.push({ day: 71, kind: 'succession', note: 'The speaker fell; the bond shakes.' });
  recordPre(G, ctx);
  assert.strictEqual(ctx._tendtrust.overnight.length, 0); // net delta 0: no overnight event
  assert.strictEqual(ctx._tendtrust.tends.length, 1);
  assert.strictEqual(ctx._tendtrust.tends[0].source, 'engine-winplan');
  assert.strictEqual(ctx._tendtrust.tends[0].lift, 8); // from the note, not the 0 delta
  assert.strictEqual(ctx._tendtrust.tends[0].measuredDelta, 0);
});
check('policy tend carries source policy', () => {
  const G = mockGame((g, st, links) => { links[3].trust = 33; links[3].day = 30; });
  const ctx = {};
  recordPre(G, ctx);
  G._links[3].tendedWeek = 10;
  G._links[3].trust = 41;
  G._links[3].history.push({ day: 70, kind: 'tended', note: 'Haven sent grain (1,500 kcal, trust +8); the bond is fed.' });
  recordPost(G, ctx);
  assert.strictEqual(ctx._tendtrust.tends.length, 1);
  assert.strictEqual(ctx._tendtrust.tends[0].source, 'policy');
});
// (9) same-day beat inference
check('nationalLive flip with no open beat infers a same-day stage+answer', () => {
  const G = mockGame();
  const ctx = {};
  recordPre(G, ctx); recordPost(G, ctx); // day 70, regional, no pending
  G.state.nationalLive = true; G.state.nationalShape = 'lead'; G.state.nationalDay = 71;
  G.state.scholar.day = 71;
  recordPre(G, ctx); recordPost(G, ctx);
  assert.strictEqual(ctx._tendtrust.beats.length, 1);
  assert.strictEqual(ctx._tendtrust.beats[0].outcome, 'answered');
  assert.strictEqual(ctx._tendtrust.beats[0].shape, 'lead');
  assert.strictEqual(ctx._tendtrust.beats[0].inferred, 'same-day');
  assert.strictEqual(ctx._tendtrust.first.nationalDay, 71);
});

console.log(`\ntest-tendtrust-b: ${pass} checks passed${process.exitCode ? ' (FAILURES ABOVE)' : ''}`);
if (process.exitCode) process.exit(1);

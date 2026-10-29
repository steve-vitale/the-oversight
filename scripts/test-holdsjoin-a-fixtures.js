#!/usr/bin/env node
// scripts/test-holdsjoin-a-fixtures.js — fixtures for the holdsjoin analyzer.
// Synthetic rows only; no game code, no RNG, no corpus reads.
// Proves, before the judged numbers are trusted:
//  (1) a murkcap-style tighten-overwrite between picks joins as
//      OVERWRITTEN-BY-VERDICT while the departlag-only class reads
//      SUPERSEDED (the pick-only misread the caveat names);
//  (2) chain splitting at terminal actions (two overwrites, same
//      (vid, mid, huntDay) = two chains, not one);
//  (3) danger dedup inside one evaluation (lever pre-check duplicate
//      does not double-count);
//  (4) held-split bucketing (danger / heal / sick-early / never-checked);
//  (5) a departed chain that was ever danger-held reports as
//      held-then-departed, not as a danger-held terminal;
//  (6) a verdict-less overwrite is DETECTED (counted), not hidden;
//  (7) fresh-pick-in-call chains take their mid from post.
'use strict';
const assert = require('assert');
const A = require('./test-holdsjoin-a.js');

let n = 0;
function check(name, fn) { fn(); n++; console.log('ok - ' + name); }

function huntPick(vid, mid, part, day, huntDay) {
  return { vid, part, day, dayPart: 0, chosen: { kind: 'HUNT', huntMid: mid, huntDay },
    preSightings: [], gates: { armed: true, sheltered: false, postFleeResting: false, maxD: 3 } };
}
function otherPick(vid, kind, part, day) {
  return { vid, part, day, dayPart: 0, chosen: { kind, huntMid: null, huntDay: null },
    preSightings: [], candidate: null, gates: { armed: true, sheltered: false, postFleeResting: false, maxD: 3 } };
}
function ev(vid, mid, huntDay, part, day, action, opts) {
  const o = opts || {};
  return { vid, part, day, dayPart: o.dayPart || 0, atHaven: true, freshPickInCall: !!o.fresh,
    pre: { kind: 'HUNT', state: 'ready', huntMid: o.preMid === undefined ? mid : o.preMid, huntDay },
    post: { kind: o.postKind || 'HUNT', state: o.postState || 'ready', huntMid: mid, huntDay },
    danger: o.danger || [], heal: o.heal || [], tighten: o.tighten || [], depart: o.depart || [],
    action, sub: o.sub || null, reason: o.reason || null };
}
function row(picks, evals, deaths) {
  return { seed: 99999, days: 180, funnel: { picks }, returns: { departures: [], drops: [] },
    departhold: { evaluations: evals }, deathsList: deaths || [] };
}

// (1) Murkcap-style: pick, tighten-overwrite, next pick (forage).
check('murkcap-style overwrite beats pick-only supersession', () => {
  const pick = huntPick('visjoin_102', 'murkcap', 420, 105, 106);
  const ow = ev('visjoin_102', 'murkcap', 106, 429, 108, 'overwritten', {
    danger: [{ vid: 'visjoin_102', tx: 5, ty: 4, score: 4, verdict: 'tighten' }],
    tighten: [{ preKind: 'HUNT', postKind: 'HAVEN_CHORE', postState: 'indoor' }],
    sub: 'tighten-overwrite', postKind: 'HAVEN_CHORE', postState: 'indoor' });
  const r = row([pick, otherPick('visjoin_102', 'FORAGE', 435, 109)], [ow]);
  const lag = A.classifyDepartlag(pick, r);
  assert.strictEqual(lag.cls, 'SUPERSEDED', 'departlag-only must read superseded, got ' + lag.cls);
  const j = A.joinPick(r, pick);
  assert.strictEqual(j.joinedCls, 'OVERWRITTEN-BY-VERDICT', 'joined must be overwrite, got ' + j.joinedCls);
  assert.strictEqual(j.reclassified, true);
  assert.strictEqual(j.neverChecked, false);
});

// (2) Two overwrites, same (vid, mid, huntDay) = two chains.
check('chain splits at terminal overwrite', () => {
  const e1 = ev('visjoin_102', 'murkcap', 106, 429, 108, 'overwritten', {
    danger: [{ vid: 'visjoin_102', tx: 5, ty: 4, score: 4, verdict: 'tighten' }], sub: 'tighten-overwrite' });
  const e2 = ev('visjoin_102', 'murkcap', 106, 432, 109, 'overwritten', {
    danger: [{ vid: 'visjoin_102', tx: 5, ty: 4, score: 5, verdict: 'tighten' }], sub: 'tighten-overwrite' });
  const r = row([], [e1, e2]);
  const chains = A.buildChains(r);
  assert.strictEqual(chains.length, 2, 'expected 2 chains, got ' + chains.length);
  const c1 = A.classifyChain(r, chains[0]), c2 = A.classifyChain(r, chains[1]);
  assert.strictEqual(c1.terminal, 'OVERWRITTEN');
  assert.strictEqual(c2.terminal, 'OVERWRITTEN');
  assert.strictEqual(c1.terminalOverwriteVerdict, 'tighten');
  assert.strictEqual(c2.terminalOverwriteVerdict, 'tighten');
});

// (3) Exact-duplicate danger records dedupe inside one evaluation.
check('danger dedup inside one evaluation', () => {
  const d = { vid: 'v1', tx: 3, ty: 5, score: 2, verdict: 'ask' };
  const e = ev('v1', 'murkcap', 19, 76, 20, 'held-ready', { danger: [d, Object.assign({}, d)], sub: 'other-held' });
  assert.strictEqual(A.dedupeDanger(e).length, 1);
  assert.deepStrictEqual(A.verdictsOf(e), ['ask']);
});

// (4a) Danger-held bucket: other-held eval, terminal held.
check('held bucket danger-held', () => {
  const e = ev('v1', 'murkcap', 19, 76, 20, 'held-ready', {
    danger: [{ vid: 'v1', tx: 3, ty: 5, score: 2, verdict: 'ask' }], sub: 'other-held' });
  const r = row([], [e]);
  const c = A.classifyChain(r, A.buildChains(r)[0]);
  assert.strictEqual(c.terminal, 'HELD-TO-HORIZON-OR-UNRECORDED');
  assert.strictEqual(A.heldBucket(c), 'danger-held');
});
// (4b) Heal-held bucket: heal sat-out, no danger verdict.
check('held bucket heal-held', () => {
  const e = ev('v1', 'murkcap', 19, 76, 20, 'held-ready', {
    danger: [{ vid: 'v1', tx: 3, ty: 5, score: 1, verdict: 'go' }],
    heal: [{ ret: false, satOut: true }], sub: 'heal-sat-out' });
  const r = row([], [e]);
  const c = A.classifyChain(r, A.buildChains(r)[0]);
  assert.strictEqual(A.heldBucket(c), 'heal-held');
});
// (4c) Sick-early bucket: early-return only, no danger, no heal sat-out.
check('held bucket sick-early-held', () => {
  const e = ev('v1', 'murkcap', 19, 76, 20, 'held-ready', { sub: 'no-attempt-early-return', reason: 'sick' });
  const r = row([], [e]);
  const c = A.classifyChain(r, A.buildChains(r)[0]);
  assert.strictEqual(A.heldBucket(c), 'sick-early-held');
});
// (4d) Never-checked: HUNT pick replaced by a needs pick, zero evals.
check('never-checked pick with zero evaluations', () => {
  const pick = huntPick('v1', 'eulogy', 536, 135, 132);
  const r = row([pick, otherPick('v1', 'EAT', 539, 135)], []);
  const j = A.joinPick(r, pick);
  assert.strictEqual(j.neverChecked, true);
  assert.strictEqual(j.joinedCls, 'superseded-by-needs-pick');
});

// (5) Held-then-departed: other-held eval then departed eval.
check('held-then-departed is not a danger-held terminal', () => {
  const e1 = ev('v1', 'murkcap', 19, 76, 20, 'held-ready', {
    danger: [{ vid: 'v1', tx: 3, ty: 5, score: 2, verdict: 'ask' }], sub: 'other-held' });
  const e2 = ev('v1', 'murkcap', 19, 80, 21, 'departed', {
    danger: [{ vid: 'v1', tx: 3, ty: 5, score: 1, verdict: 'go' }],
    depart: [{ vid: 'v1', preKind: 'HUNT', postKind: 'HUNT', postState: 'out', ret: true }] });
  const r = row([], [e1, e2]);
  const chains = A.buildChains(r);
  assert.strictEqual(chains.length, 1, 'hold + depart is one chain');
  const c = A.classifyChain(r, chains[0]);
  assert.strictEqual(c.terminal, 'DEPARTED');
  assert.strictEqual(c.hasNonGoDanger, true);
  assert.strictEqual(A.heldBucket(c), 'danger-held', 'bucket fn still answers danger-held; terminal decides bucketing');
});

// (6) Verdict-less overwrite is detected, not hidden.
check('verdict-less overwrite detected', () => {
  const e = ev('v1', 'murkcap', 19, 76, 20, 'overwritten', { danger: [], sub: 'tighten-overwrite' });
  const r = row([], [e]);
  const c = A.classifyChain(r, A.buildChains(r)[0]);
  assert.strictEqual(c.terminal, 'OVERWRITTEN');
  assert.strictEqual(c.terminalOverwriteVerdictless, true);
  assert.strictEqual(c.terminalOverwriteVerdict, 'NONE');
});

// (2b) Interleaved villagers do NOT fragment a chain.
check('interleaved villagers share no chain fragmentation', () => {
  const a1 = ev('v1', 'murkcap', 19, 76, 20, 'held-ready', { sub: 'no-attempt-early-return', reason: 'sick' });
  const b1 = ev('v2', 'murkcap', 19, 77, 20, 'held-ready', { sub: 'no-attempt-early-return', reason: 'sick' });
  const a2 = ev('v1', 'murkcap', 19, 80, 21, 'departed', {
    danger: [{ vid: 'v1', tx: 3, ty: 5, score: 1, verdict: 'go' }],
    depart: [{ vid: 'v1', preKind: 'HUNT', postKind: 'HUNT', postState: 'out', ret: true }] });
  const r = row([], [a1, b1, a2]);
  const chains = A.buildChains(r);
  assert.strictEqual(chains.length, 2, 'expected 2 chains (v1, v2), got ' + chains.length);
  const v1 = chains.filter(c => c.vid === 'v1');
  assert.strictEqual(v1.length, 1, 'v1 must be one chain, not fragmented');
  assert.strictEqual(v1[0].evals.length, 2);
  assert.strictEqual(A.classifyChain(r, v1[0]).terminal, 'DEPARTED');
});

// (7) Fresh-pick-in-call chain takes mid from post.
check('fresh-pick-in-call chain mid from post', () => {
  const e = ev('v1', null, 19, 76, 20, 'held-ready', { fresh: true, preMid: null });
  e.pre.huntMid = null; e.post.huntMid = 'murkcap'; e.post.huntDay = 19;
  const r = row([], [e]);
  const chains = A.buildChains(r);
  assert.strictEqual(chains.length, 1);
  assert.strictEqual(chains[0].mid, 'murkcap');
});

console.log('FIXTURES GREEN (' + n + '/' + n + ')');

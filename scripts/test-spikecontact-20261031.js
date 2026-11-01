#!/usr/bin/env node
// test-spikecontact-20261031.js — sim-spikecontact-a proof test.
//
// Proves the spike separation + contact instrument classification on
// fixtures (including fixtures replicating the old corpora's known
// fights, so a parser regression fails loudly): parse rules
// (first-per-round lead strikes, ally/volley/ambush exclusion,
// 0-damage dropped), committed classification at the LAST commit
// line, 1-strike flight classification (spike-only), and the
// weapon-instrument split with its lie kinds. No game code loaded,
// no sims run.
//
// Usage: node scripts/test-spikecontact-20261031.js
'use strict';
const assert = require('assert');
const A = require('./spikecontact-analyze-20261031.js');
const P = require('./spikecontact-parse-20261031.js');
const C = require('./spikecontact-contact-20261031.js');

let n = 0;
function check(name, fn) { fn(); n++; console.log('ok ' + n + ' - ' + name); }

function row(base) {
  return Object.assign({ day: 1, vid: 'v1', mid: 'chorus_line', wave: 3, outcome: 'mFlee',
    rounds: 1, mDealt: 0, mHpLeft: 0, mMaxHp: 300, intent: 'engage', caller: 'wild',
    minHpFrac: 0.9, twoblowLastTwo: null, log: [] }, base);
}

// --- parse rules ---
check('parse: lead strikes first-per-round, ally excluded, 0-damage dropped', () => {
  const log = [
    'Emma walks straight into Chorus Line. No avoiding it.',
    'R1: Emma strikes for 31 (x1.2) (284 left)',
    'R1: Ally strikes for 5 (279 left)',
    'R2: Emma strikes for 0 (bright frame — mirage miss)',
    'R2: Emma strikes for 30 (x1.3) (249 left)',
    'R2: Ally strikes again, louder — 4 (245 left). (Live Broadcast)',
    'Chorus Line breaks — wounded past its line, it turns and runs.',
  ];
  const p = P.parseLeadStrikes(log);
  assert.deepStrictEqual(p.strikes, [{ round: 1, dmg: 31 }, { round: 2, dmg: 30 }]);
  assert.strictEqual(p.damageSum, 31 + 5 + 0 + 30 + 4);
  assert.strictEqual(p.truncated, false);
});
check('parse: volley + ambush count toward damageSum, never toward lead strikes', () => {
  const log = [
    'Emma sees the beast coming and nocks an arrow — the fight opens at range (2 shots).',
    '  loosed — it takes the beast for 7 (293 left).',
    'Emma was already waiting — ambush! Opening strike for 9.',
    'R1: Emma strikes for 20 (264 left)',
    'Chorus Line breaks — wounded past its line, it turns and runs.',
  ];
  const p = P.parseLeadStrikes(log);
  assert.deepStrictEqual(p.strikes, [{ round: 1, dmg: 20 }]);
  assert.strictEqual(p.damageSum, 7 + 9 + 20);
});
check('parse: truncated log detected (round line last, no outcome line)', () => {
  const p = P.parseLeadStrikes(['R1: Emma strikes for 20 (280 left)', 'R2: Emma strikes for 22 (258 left)']);
  assert.strictEqual(p.truncated, true);
});

// --- committed classification (LAST commit moment) ---
check('committed: Emma-style both (max 36 >= 22, last-two 71 >= 22)', () => {
  const strikes = [31, 31, 30, 30, 29, 36, 35, 35, 36];
  const log = strikes.map((d, i) => `R${i + 1}: Emma strikes for ${d} (x1.2) (0 left)`);
  log.push('Emma holds — Chorus Line is two blows from falling, and they are still strong enough to finish it. (Committed finish, two-blow)');
  log.push('R10: Emma strikes for 35 (0 left)');
  log.push("The lead falls — the pack's coordination shatters. The rest scatter or die.");
  const r = A.analyzeCommitted(row({ outcome: 'vKill', committedFinish: true, committedRounds: 1,
    twoblowCommitMhp: 22, twoblowCommitSum: 71, twoblowCommitVhpFrac: 0.65, log }));
  assert.strictEqual(r.cls, 'both');
  assert.strictEqual(r.maxStrike, 36);
});
check('committed: Kate-d93-style last-two-only (max 24 < 35, last-two 44 >= 35)', () => {
  const strikes = [19, 18, 22, 19, 24, 24, 20, 22, 22];
  const log = strikes.map((d, i) => `R${i + 1}: Gabriela strikes for ${d} (0 left)`);
  log.push('Gabriela holds — Chorus Line is two blows from falling, and they are still strong enough to finish it. (Committed finish, two-blow)');
  log.push('R10: Gabriela dances on the downbeat.');
  log.push('Chorus Line breaks — wounded past its line, it turns and runs.');
  const r = A.analyzeCommitted(row({ committedFinish: true, committedRounds: 1,
    twoblowCommitMhp: 35, twoblowCommitSum: 44, twoblowCommitVhpFrac: 0.82, log }));
  assert.strictEqual(r.cls, 'last-two-only');
});
check('committed: last-commit moment — first-commit parse must NOT match last-commit truth', () => {
  // Kate-d75 shape: first commit at 33 HP (last-two 34), second at 15 HP (last-two 36).
  const log = [
    'R1: Kate strikes for 18 (0 left)', 'R2: Kate strikes for 21 (0 left)',
    'R3: Kate strikes for 18 (0 left)', 'R4: Kate strikes for 16 (0 left)',
    'R5: Kate strikes for 18 (0 left)',
    'Kate holds — Chorus Line is two blows from falling, and they are still strong enough to finish it. (Committed finish, two-blow)',
    'R6: Kate strikes for 18 (0 left)',
    'Kate holds — Chorus Line is two blows from falling, and they are still strong enough to finish it. (Committed finish, two-blow)',
    'Chorus Line breaks — wounded past its line, it turns and runs.',
  ];
  // Engine truth = LAST commit (36, 15 HP): strikes before it are 18,21,18,16,18,18.
  const r = A.analyzeCommitted(row({ committedFinish: true, committedRounds: 2,
    twoblowCommitMhp: 15, twoblowCommitSum: 36, twoblowCommitVhpFrac: 0.85, log }));
  assert.strictEqual(r.cls, 'both');
  assert.deepStrictEqual(r.strikesBeforeCommit, [18, 21, 18, 16, 18, 18]);
});
check('committed: parse-vs-engine mismatch is UNCLASSIFIED, never forced', () => {
  const log = ['R1: Emma strikes for 20 (0 left)', 'R2: Emma strikes for 22 (0 left)',
    'Emma holds — Chorus Line is two blows from falling, and they are still strong enough to finish it. (Committed finish, two-blow)',
    "The lead falls — the pack's coordination shatters. The rest scatter or die."];
  const r = A.analyzeCommitted(row({ outcome: 'vKill', committedFinish: true,
    twoblowCommitMhp: 10, twoblowCommitSum: 999, log }));
  assert.strictEqual(r.cls, 'UNCLASSIFIED');
  assert.strictEqual(r.reason, 'parse-vs-engine-mismatch');
});

// --- flight classification ---
check('flight: 1-strike Callback is spike-only (55 >= 25, last-two impossible)', () => {
  const log = [
    "Joaquín has Crossbow but no arrows — the string stays drawn, useless.",
    'R1: Joaquín strikes for 55 (x1.3) (25 left)',
    'The Callback breaks — wounded past its line, it turns and runs.',
  ];
  const r = A.analyzeFlight(row({ mid: 'callback', mDealt: 55, mHpLeft: 25,
    twoblowLastTwo: [55], log }));
  assert.strictEqual(r.cls, 'spike-only');
  assert.strictEqual(r.lastTwoSum, null);
});
check('flight: Emma-repeat-style last-two-only with gate-3 hint', () => {
  const strikes = [25, 24, 26, 23, 24, 27, 25, 26, 28, 29];
  const log = strikes.map((d, i) => `R${i + 1}: Emma strikes for ${d} (0 left)`);
  log.push('Chorus Line breaks — wounded past its line, it turns and runs.');
  const r = A.analyzeFlight(row({ mDealt: 258, mHpLeft: 45, minHpFrac: 0.47,
    twoblowLastTwo: [28, 29], log }));
  assert.strictEqual(r.cls, 'last-two-only');
  assert.strictEqual(r.blockHint, 'gate3-likely-minHpFrac-below-0.60');
});
check('flight: neither when neither definition covers remaining HP', () => {
  const log = ['R1: Emma strikes for 20 (0 left)', 'R2: Emma strikes for 22 (0 left)',
    'Chorus Line breaks — wounded past its line, it turns and runs.'];
  const r = A.analyzeFlight(row({ mDealt: 42, mHpLeft: 100, twoblowLastTwo: [20, 22], log }));
  assert.strictEqual(r.cls, 'neither');
});
check('flight: baseline reconciliation validates without engine fields', () => {
  const log = ['R1: Emma strikes for 31 (0 left)', 'R2: Emma strikes for 30 (0 left)',
    'Chorus Line breaks — wounded past its line, it turns and runs.'];
  const r = A.analyzeFlight(row({ mDealt: 61, mHpLeft: 30, twoblowLastTwo: null, log }));
  assert.strictEqual(r.cls, 'both'); // max 31 >= 30 and last-two 61 >= 30
});
check('flight: baseline reconciliation mismatch is UNCLASSIFIED', () => {
  const log = ['R1: Emma strikes for 31 (0 left)', 'R2: Emma strikes for 30 (0 left)',
    'Chorus Line breaks — wounded past its line, it turns and runs.'];
  const r = A.analyzeFlight(row({ mDealt: 999, mHpLeft: 40, twoblowLastTwo: null, log }));
  assert.strictEqual(r.cls, 'UNCLASSIFIED');
  assert.strictEqual(r.reason, 'reconciliation-mismatch');
});

// --- contact instrument split ---
check('instrument: bow + arrows is FINISHABLE, no lie', () => {
  const r = C.classifyInstrument({ rangedEqId: 'bow_crude', rangedEqName: 'Crude bow', ammoAtContact: 3, meleeEqId: null, meleeCarriedIds: [] });
  assert.strictEqual(r.cls, 'FINISHABLE');
  assert.strictEqual(r.rangedUsable, true);
  assert.strictEqual(r.lie, false);
});
check('instrument: bow, no arrows, no melee is NO-REAL-INSTRUMENT + bow lie', () => {
  const r = C.classifyInstrument({ rangedEqId: 'bow_crude', rangedEqName: 'Crude bow', ammoAtContact: 0, meleeEqId: null, meleeCarriedIds: [] });
  assert.strictEqual(r.cls, 'NO-REAL-INSTRUMENT');
  assert.strictEqual(r.lie, true);
  assert.strictEqual(r.lieKind, 'bow-no-arrows');
});
check('instrument: sling, no arrows, melee held is FINISHABLE + sling lie', () => {
  const r = C.classifyInstrument({ rangedEqId: 'sling_phase', rangedEqName: 'Phase sling', ammoAtContact: 0, meleeEqId: 'spear_fire', meleeEqName: 'Fire-hardened spear', meleeCarriedIds: [] });
  assert.strictEqual(r.cls, 'FINISHABLE');
  assert.strictEqual(r.lie, true);
  assert.strictEqual(r.lieKind, 'sling-no-arrows');
  assert.strictEqual(r.meleeHeld, true);
});
check('instrument: no ranged, no melee is NO-REAL-INSTRUMENT + no-ranged lie', () => {
  const r = C.classifyInstrument({ rangedEqId: null, rangedEqName: null, ammoAtContact: null, meleeEqId: null, meleeCarriedIds: [] });
  assert.strictEqual(r.cls, 'NO-REAL-INSTRUMENT');
  assert.strictEqual(r.lieKind, 'no-ranged-at-all');
});
check('instrument: carried (unequipped) melee counts as melee held', () => {
  const r = C.classifyInstrument({ rangedEqId: null, rangedEqName: null, ammoAtContact: null, meleeEqId: null, meleeCarriedIds: ['knife_bone'] });
  assert.strictEqual(r.cls, 'FINISHABLE');
  assert.strictEqual(r.meleeHeld, true);
});
check('instrument: old-corpus row without instrument fields is INSTRUMENT-UNCLASSIFIED', () => {
  const r = C.classifyInstrument({ mHpStart: 10, mMaxHp: 300 });
  assert.strictEqual(r.cls, 'INSTRUMENT-UNCLASSIFIED');
});

console.log(`test-spikecontact-20261031: ${n} checks passed`);

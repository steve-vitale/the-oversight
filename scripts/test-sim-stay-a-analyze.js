#!/usr/bin/env node
// scripts/test-sim-stay-a-analyze.js — proof tests for the analyzer.
// Synthetic rows only: no sims, no repo writes. Pins the prereg judge:
// G2 signals (round-4+ survival, damage conversion, DPR doubling),
// the G3 death guard, G1 corpus validity, and the det-gate identity
// comparison. Peacemaker 0-damage drive-offs must NOT count as
// conversions.
'use strict';
const assert = require('assert');
const { decompose, judgePilot, corpusValid, compareDetgate } = require('./sim-stay-a-analyze');

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('  PASS ' + name); }

function row(seed, fights, extra) {
  return Object.assign({
    seed, days: 180, waveReach: 4, won: 0, nationalEver: 0, nationalFinal: 0,
    table: 0, entered: 0, deaths: {}, deathTotal: 0, starvationDeaths: 0,
    fieldparty: { meetings: [], diag: { errs: 0, overflow: {} } },
    wrapDiag: { errs: 0 }, ammo: { instrumentErrors: [], pocketOverflow: 0, fights: [] },
    wave4Fights: fights,
  }, extra || {});
}
function fight(o) {
  return Object.assign({
    day: 10, vid: 'v1', leaderName: 'A', mid: 'm1', caller: 'resolve',
    mHpStart: 800, outcome: 'vFlee', rounds: 1, mDealt: 11, vTaken: 60,
    vHpLeft: 30, mHpLeft: 789, joined: false, allyDealt: 0, allyTaken: 0,
    allyDied: null, engineAllies: 0, volleyDmg: 0, volleyShots: 0,
  }, o);
}
// Baseline: 10 fought fights, 6 fled / 2 died / 1 drive-off (0 dmg) / 1 kill of a 1-HP beast.
const baseFights = [
  fight({ outcome: 'vFlee' }), fight({ outcome: 'vFlee' }), fight({ outcome: 'vFlee' }),
  fight({ outcome: 'vFlee' }), fight({ outcome: 'vFlee' }), fight({ outcome: 'vFlee' }),
  fight({ outcome: 'vDie' }), fight({ outcome: 'vDie' }),
  fight({ outcome: 'mFlee', mDealt: 0 }),
  fight({ outcome: 'vKill', mHpStart: 1, mDealt: 10 }),
];
const baseRows = [row(75101, baseFights)];
const base = { valid: corpusValid(baseRows, [75101]), dec: decompose(baseRows) };

ok('baseline decomposition: shares, DPR, no healthy conversion', () => {
  assert.strictEqual(base.dec.fought, 10);
  assert.strictEqual(base.dec.shares.fled, 0.6);
  assert.strictEqual(base.dec.shares.died, 0.2);
  assert.strictEqual(base.dec.medianDpr, 11);
  assert.strictEqual(base.dec.healthyDamageConv, 0); // 0-dmg drive-off + 1-HP kill excluded
  assert.strictEqual(base.dec.round4plusSurvived, 0);
});

// Candidate GO: one round-4+ surviving fight, death share unchanged.
const candGoFights = baseFights.slice();
candGoFights[0] = fight({ outcome: 'vFlee', rounds: 4, mDealt: 44 });
const candGo = { valid: true, dec: decompose([row(75101, candGoFights)]) };
ok('judge PILOT-GO on round-4+ surviving fight with guard held', () => {
  const j = judgePilot(base, candGo, true);
  assert.strictEqual(j.verdict, 'PILOT-GO');
  assert.strictEqual(j.g2StayingSignal, true);
  assert.strictEqual(j.g3DeathGuard, true);
});
// Candidate with the same signal but deaths +10pp: NO-GO (flees→deaths).
const candDeathFights = baseFights.slice();
candDeathFights[0] = fight({ outcome: 'vFlee', rounds: 4, mDealt: 44 });
candDeathFights[1] = fight({ outcome: 'vDie' });
const candDeath = { valid: true, dec: decompose([row(75101, candDeathFights)]) };
ok('judge NO-GO when deaths rise past the guard', () => {
  const j = judgePilot(base, candDeath, true);
  assert.strictEqual(j.verdict, 'NO-GO');
  assert.strictEqual(j.g3DeathGuard, false);
});
// Candidate with no signal: NO-GO.
ok('judge NO-GO with no staying signal', () => {
  const j = judgePilot(base, { valid: true, dec: decompose([row(75101, baseFights)]) }, true);
  assert.strictEqual(j.verdict, 'NO-GO');
  assert.strictEqual(j.g2StayingSignal, false);
});
// Invalid corpus: NO-GO regardless of signal.
ok('judge NO-GO on invalid corpus', () => {
  const bad = row(75101, candGoFights, { wrapDiag: { errs: 1 } });
  const j = judgePilot(base, { valid: corpusValid([bad], [75101]), dec: decompose([bad]) }, true);
  assert.strictEqual(j.verdict, 'NO-GO');
  assert.strictEqual(j.g1CorpusValid, false);
});
// Sense leg missing: NO-GO even with a signal.
ok('judge NO-GO when sense leg not read', () => {
  const j = judgePilot(base, candGo, false);
  assert.strictEqual(j.verdict, 'NO-GO');
  assert.strictEqual(j.g4Sense, false);
});
// Damage conversion counts: mFlee with mDealt >= 100 on a healthy beast.
ok('damage drive-off counts as conversion; Peacemaker does not', () => {
  const d = decompose([row(75101, [fight({ outcome: 'mFlee', mDealt: 120 })])]);
  assert.strictEqual(d.healthyDamageConv, 1);
});
// Det-gate identity: identical rows ok; one changed fight not ok.
ok('det-gate identity comparison', () => {
  assert.strictEqual(compareDetgate(baseRows, [row(75101, baseFights)]).ok, true);
  const changed = baseFights.slice();
  changed[0] = fight({ outcome: 'vDie' });
  assert.strictEqual(compareDetgate(baseRows, [row(75101, changed)]).ok, false);
});

console.log(`test-sim-stay-a-analyze: ${pass}/8 PASS`);

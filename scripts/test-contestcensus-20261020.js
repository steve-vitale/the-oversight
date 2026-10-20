#!/usr/bin/env node
// test-contestcensus-20261020.js — proof test for scripts/analyze-contestcensus-20261020.js
// (flesh-out loop run fleshout-20261020T2145Z, arm sim-contestcensus).
// DIAGNOSTIC: zero new sims, zero src/js — pure data analysis over the
// committed per-seed corpora in evidence/2026-10-20/.
//
// RED->GREEN fixtures: contest death, sealed death, haven-encounter death,
// raid death, kill-fight death, attrition, survivor, censored. Then a
// reconciliation fixture: census() over hand-built rows must account for
// every wave-4+ kill exactly once (census + censored + non-scholar) and the
// counts must reconcile with the input waveKillLog entries.
//
// No game modules are eval'd (no harness needed); the test writes nothing
// into the repo.
'use strict';
const assert = require('assert');
const path = require('path');

const A = require(path.join(__dirname, 'analyze-contestcensus-20261020.js'));

let pass = 0, fail = 0;
function check(name, fn) {
  try { fn(); pass++; console.log('  PASS ' + name); }
  catch (e) { fail++; console.log('  FAIL ' + name + ' :: ' + e.message); }
}

const K = (over) => Object.assign(
  { day: 70, mid: 'strike', wave: 4, by: 'scholar1', via: 'player', pyrrhic: false,
    ctx: { day: 70, scholarVid: 'scholar1', scholarHp: 97, partyVids: [] } }, over);
const D = (over) => Object.assign(
  { day: 79, who: 'scholar1', cause: 'combat', atHaven: false, inTb: true,
    onExped: false, loc: [4, 4], partyVids: [], scholarHp: 40, noFlee: false,
    opps: [{ mid: 'suburb', wave: 3 }], arena: false, raidNight: false,
    allies: [], fightOver: true }, over);

// --- fixture classification ---
check('F1 contest death of recovering champion -> contest', () => {
  const cls = A.classify(K(), D({ cause: 'contest', atHaven: true, inTb: false, arena: false, hp: null }));
  assert.strictEqual(cls, 'contest');
});
check('F2 noFlee death -> sealed-fight', () => {
  const cls = A.classify(K(), D({ noFlee: true, atHaven: false, inTb: true }));
  assert.strictEqual(cls, 'sealed-fight');
});
check('F3 arena contest death -> sealed-fight (arena path)', () => {
  const cls = A.classify(K(), D({ arena: true, atHaven: false, inTb: false }));
  assert.strictEqual(cls, 'sealed-fight');
});
check('F4 haven encounter alone -> haven-encounter', () => {
  const cls = A.classify(K(), D({ atHaven: true, inTb: true, raidNight: false, allies: [] }));
  assert.strictEqual(cls, 'haven-encounter');
});
check('F5 same-day death -> kill-fight', () => {
  const cls = A.classify(K(), D({ day: 70, cause: 'combat', atHaven: true, inTb: true }));
  assert.strictEqual(cls, 'kill-fight');
});
check('F6 raid-night combat -> raid', () => {
  const cls = A.classify(K(), D({ atHaven: true, inTb: true, raidNight: true }));
  assert.strictEqual(cls, 'raid');
});
check('F7 starvation -> attrition', () => {
  const cls = A.classify(K(), D({ cause: 'starvation', atHaven: true, inTb: false }));
  assert.strictEqual(cls, 'attrition');
});
check('F8 no death in window -> alive', () => {
  const death = A.findKillerDeath([D({ day: 200, who: 'scholar1' })], K(), 30);
  assert.strictEqual(death, null);
  assert.strictEqual(A.classify(K(), null), 'alive');
});
check('F9 missing cause+flags -> unexplained (not silently alive)', () => {
  const cls = A.classify(K(), D({ cause: null, atHaven: null, inTb: null, onExped: null, noFlee: null, arena: null, raidNight: null }));
  assert.strictEqual(cls, 'unexplained');
});
check('F10 named unknown cause -> other:<cause> (classified, not unexplained)', () => {
  const cls = A.classify(K(), D({ cause: 'The Eulogy', atHaven: true, inTb: false }));
  assert.strictEqual(cls, 'other:The Eulogy');
});
check('F11 censored: kill+30d beyond run end', () => {
  assert.strictEqual(A.isCensored(K({ day: 175 }), 180, 30), true);
  assert.strictEqual(A.isCensored(K({ day: 150 }), 180, 30), false);
});
check('F12 contest with noFlee also set -> contest wins (named-next priority)', () => {
  const cls = A.classify(K(), D({ cause: 'contest', noFlee: true }));
  assert.strictEqual(cls, 'contest');
});

// --- reconciliation: every w4+ kill accounted exactly once ---
check('R1 census reconciles counts with waveKillLog entries', () => {
  const rows = [
    { file: 'f1', policy: 'leadfeast', seed: 64001, arm: 'control',
      r: { gameDays: 180, kills: [K(), K({ day: 80, by: 'scholar2', ctx: { scholarVid: 'scholar2' } })],
           deaths: [D({ day: 79, who: 'scholar1', cause: 'contest' })] } },
    { file: 'f2', policy: 'belongfeast', seed: 64002, arm: 'control',
      r: { gameDays: 180, kills: [K({ day: 175, mid: 'influencer' })], deaths: [] } }, // censored
    { file: 'f3', policy: 'leadfeast', seed: 64003, arm: 'control',
      r: { gameDays: 180,
           kills: [K({ day: 60, mid: 'congregation', by: 'villager9', via: 'companion', ctx: {} })], // non-scholar
           deaths: [] } },
  ];
  const res = A.census(rows, 30);
  assert.strictEqual(res.totals.w4kills, 4, 'four w4+ kills in');
  assert.strictEqual(res.rows.length, 2, 'two censused (both scholar kills, uncensored)');
  assert.strictEqual(res.censored.length, 1, 'one censored');
  assert.strictEqual(res.nonScholar.length, 1, 'one non-scholar');
  assert.strictEqual(res.rows[0].cls, 'contest');
  assert.strictEqual(res.rows[1].cls, 'alive');
  assert.deepStrictEqual(res.unexplained, [], 'zero unexplained');
  assert.strictEqual(res.rows.length + res.censored.length + res.nonScholar.length, res.totals.w4kills,
    'every kill accounted exactly once');
});
check('R2 findKillerDeath picks the earliest death in window', () => {
  const deaths = [D({ day: 85, who: 'scholar1' }), D({ day: 75, who: 'scholar1', cause: 'contest' })];
  const got = A.findKillerDeath(deaths, K(), 30);
  assert.strictEqual(got.day, 75);
  assert.strictEqual(A.classify(K(), got), 'contest');
});

console.log(`\n${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);

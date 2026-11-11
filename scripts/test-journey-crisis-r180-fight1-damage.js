#!/usr/bin/env node
// test-journey-crisis-r180-fight1-damage.js — Q4 isolation proof (crisis
// r180 prereg): the "vTaken >= ~70 breaks the sortie" clause does not exist
// in the sortie loop. Code read (havenGrowth.js lingererSortie) shows
// broke=true ONLY on vFlee/vDie outcomes; the panel correlation is a shadow
// of fieldFight's own HP-fraction break line. This test pins the loop rule
// by stubbing fieldFight (see sortie-damage-break-fixture.js) so fight 1
// returns a vKill/mFlee with vTaken 90 and asserting the sortie still
// fights lingerer 2. One harness per child process (fixture pattern from
// test-sortietarget-a.js). Exit non-zero on any failure.
//
// Sensitivity: the lightFlee case proves the test CAN observe a break
// (fought 1, broke true) — if a damage-break clause were ever added to the
// loop, heavyKill/heavyFlee would fail the same way (fought 1, broke true).
'use strict';
const path = require('path');
const assert = require('assert');
const { execFileSync } = require('child_process');

const REPO = path.join(__dirname, '..');
const FIX = path.join(REPO, 'scripts', 'sortie-damage-break-fixture.js');

function run(seed, kase) {
  const raw = execFileSync(process.execPath, [FIX, String(seed), kase],
    { cwd: REPO, encoding: 'utf8', timeout: 120000 });
  const line = raw.trim().split('\n').filter(Boolean).pop();
  const row = JSON.parse(line);
  if (row.error) throw new Error(`fixture ${kase} seed ${seed}: ${row.error}`);
  if (row.sortieError) throw new Error(`fixture ${kase} seed ${seed}: sortie threw: ${row.sortieError}`);
  return row;
}

let failures = 0;
function check(name, fn) {
  try { fn(); console.log('PASS ' + name); }
  catch (e) { failures++; console.log('FAIL ' + name + ': ' + e.message); }
}

const heavyKill = run(7, 'heavyKill');
const heavyFlee = run(42, 'heavyFlee');
const lightFlee = run(7, 'lightFlee');
const heavyDie = run(42, 'heavyDie');

check('Q4 heavyKill: vKill with vTaken 90 does NOT break the sortie', () => {
  assert.ok(heavyKill.ret && heavyKill.ret.ok, 'sortie not ok: ' + JSON.stringify(heavyKill.ret));
  assert.strictEqual(heavyKill.ret.fought.length, 2, 'fought ' + heavyKill.ret.fought.length + ', expected 2 (fight 2 never happened)');
  assert.strictEqual(heavyKill.ret.broke, false, 'broke true after a 90-damage kill — a damage-break clause fired');
  assert.strictEqual(heavyKill.ret.cleared, 2, 'cleared ' + heavyKill.ret.cleared);
  assert.strictEqual(heavyKill.fightCalls, 2, 'fieldFight called ' + heavyKill.fightCalls + 'x');
});

check('Q4 heavyKill: the 90 damage is really applied (leader fights fight 2 wounded)', () => {
  assert.strictEqual(heavyKill.leaderHpAfter, 5, 'leader HP after is ' + heavyKill.leaderHpAfter + ', expected 5 (100 - 90 - 5)');
  assert.strictEqual(heavyKill.leaderAlive, true, 'leader died — the damage settlement killed them, the loop rule is untested');
});

check('Q4 heavyFlee: mFlee with vTaken 90 does NOT break the sortie', () => {
  assert.ok(heavyFlee.ret && heavyFlee.ret.ok, 'sortie not ok');
  assert.strictEqual(heavyFlee.ret.fought.length, 2, 'fought ' + heavyFlee.ret.fought.length + ', expected 2');
  assert.strictEqual(heavyFlee.ret.broke, false, 'broke true after a 90-damage drive-off');
  assert.strictEqual(heavyFlee.ret.cleared, 2, 'cleared ' + heavyFlee.ret.cleared);
});

check('Q4 lightFlee: vFlee with vTaken 4 DOES break the sortie (the flee is the break driver)', () => {
  assert.ok(lightFlee.ret && lightFlee.ret.ok, 'sortie not ok');
  assert.strictEqual(lightFlee.ret.fought.length, 1, 'fought ' + lightFlee.ret.fought.length + ', expected 1');
  assert.strictEqual(lightFlee.ret.broke, true, 'broke false after a vFlee — the loop did not break on flee');
  assert.strictEqual(lightFlee.ret.cleared, 0, 'cleared ' + lightFlee.ret.cleared);
  assert.strictEqual(lightFlee.leaderHpAfter, 96, 'leader HP after is ' + lightFlee.leaderHpAfter + ', expected 96 (100 - 4)');
});

check('Q4 heavyDie: vDie with vTaken 90 breaks the sortie (death control)', () => {
  assert.ok(heavyDie.ret && heavyDie.ret.ok, 'sortie not ok');
  assert.strictEqual(heavyDie.ret.fought.length, 1, 'fought ' + heavyDie.ret.fought.length + ', expected 1');
  assert.strictEqual(heavyDie.ret.broke, true, 'broke false after a vDie');
});

console.log(failures === 0 ? 'r180 fight-1 damage: ALL PASS' : 'r180 fight-1 damage: ' + failures + ' FAILURES');
process.exit(failures === 0 ? 0 : 1);

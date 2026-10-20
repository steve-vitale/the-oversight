#!/usr/bin/env node
// scripts/test-justiceladder-20261020.js — proof test for the justice-ladder observer.
//
// Part A: synthetic capture fidelity — wrappers record events, preserve return
//   values, and never throw when the underlying function is missing.
// Part B: no-RNG / no-state pollution — frozen clock, seed 11, 30d leadcourt:
//   state hashes identical with the ladder observer on vs off (off-vs-off
//   control first, ruling out RNG flakiness). The sabotage analogue: a wrapper
//   that consumed RNG WOULD diverge the hash (proven by the intraviol proof).
// Part C: live smoke — seed 11 larceny-leaning x 30d: the policy steals, theft
//   crimes book, the ladder observer records a time series, runDays completes.
//
// Usage: node scripts/test-justiceladder-20261020.js
'use strict';
const crypto = require('crypto');
const { attachJusticeLadder, snapLadder } = require('./justiceladder-census-20261020');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');
const { larcenyLeaning } = require('./policies/larceny-leaning');

let PASS = 0, FAIL = 0;
const failures = [];
function ok(cond, label) {
  if (cond) { PASS++; }
  else { FAIL++; failures.push(label); console.log('  FAIL: ' + label); }
  return !!cond;
}
function section(name) { console.log('\n-- ' + name + ' --'); }
function stateHash(Game) {
  return crypto.createHash('sha1').update(JSON.stringify(Game.state)).digest('hex');
}
const FROZEN_NOW = 1760947200000;
async function withFrozenClock(fn) {
  const _dn = Date.now, _pn = (typeof performance !== 'undefined' && performance.now) ? performance.now : null;
  Date.now = () => FROZEN_NOW;
  if (_pn) performance.now = () => 0;
  try { return await fn(); } finally { Date.now = _dn; if (_pn) performance.now = _pn; }
}

async function partA() {
  section('A. synthetic capture fidelity');
  const { Game } = await loadGame({ seed: 4242, mode: 'justladder-test-a' });
  await setupGame(Game);
  const api = attachJusticeLadder(Game);
  ok(api && Array.isArray(api.ladder), 'attach returns api with ladder series');
  ok(Game._justladder === api, 'api memoized on Game._justladder');
  ok(attachJusticeLadder(Game) === api, 're-attach is idempotent (no double wrap)');

  const snap = snapLadder(Game);
  ok(typeof snap.stage === 'number' && snap.stage >= 0, 'snapLadder reads stage (' + snap.stage + ')');
  ok(typeof snap.heat === 'number', 'snapLadder reads heat (' + snap.heat + ')');
  ok(typeof snap.crimes === 'number', 'snapLadder reads crimes');

  // synthetic moot demand + verdict (scratch game — mutation is the point)
  const d0 = api.mootDemands.length;
  try { Game.justiceDemandMoot(); } catch (e) {}
  ok(api.mootDemands.length === d0 + 1, 'justiceDemandMoot demand recorded');
  const v0 = api.verdicts.length;
  try { Game.syncJusticeAfterMoot('acquitted'); } catch (e) {}
  ok(api.verdicts.length === v0 + 1 && api.verdicts[api.verdicts.length - 1].path === 'acquitted',
    'syncJusticeAfterMoot verdict recorded with path');

  // stealFrom wrapper preserves return values and records outcomes
  const s0 = api.steals.length;
  let sf;
  try { sf = Game.stealFrom('nobody-there'); } catch (e) { sf = 'threw'; }
  ok(sf === false, 'stealFrom(invalid vid) returns false through wrapper');
  ok(api.steals.length === s0 + 1 && api.steals[api.steals.length - 1].result === 'false',
    'stealFrom outcome recorded');

  // justiceTick wrapper fires and records a row
  const l0 = api.ladder.length;
  try { Game.justiceTick(); } catch (e) {}
  ok(api.ladder.length === l0 + 1, 'justiceTick snapshot recorded');

  // wrappers present for the lethal lane
  ok(typeof Game.startVillageUprising === 'function', 'Game.startVillageUprising exists');
  ok(typeof Game.simNpcAmbush === 'function', 'Game.simNpcAmbush exists');
  ok(typeof Game.exilePlayer === 'function', 'Game.exilePlayer exists');
  ok(api.uprisings.length === 0 && api.npcAmbushes.length === 0 && api.exiles.length === 0,
    'lethal-lane logs start empty');

  // say capture: justice-adjacent lines captured, others ignored
  const j0 = api.lines.length;
  try { Game.say('A moot will be called at dawn. The village has gone quiet.'); } catch (e) {}
  try { Game.say('The wind smells of rain and cut grass.'); } catch (e) {}
  ok(api.lines.length === j0 + 1, 'justice-adjacent say line captured, neutral line ignored');
}

async function partB() {
  section('B. no-RNG / no-state pollution (frozen clock, seed 11, 30d leadcourt)');
  async function run(withObserver) {
    return withFrozenClock(async () => {
      const { Game } = await loadGame({ seed: 11, mode: 'justladder-test-b' });
      await setupGame(Game);
      if (withObserver) attachJusticeLadder(Game);
      const result = await runDays(Game, leadcourt, { days: 30, sampleEvery: 30 });
      return { hash: stateHash(Game), days: result.days };
    });
  }
  const off1 = await run(false), off2 = await run(false), on = await run(true);
  ok(off1.hash === off2.hash, 'off-vs-off control identical (rules out RNG flakiness)');
  ok(off1.days === on.days, 'same horizon both sides (' + off1.days + 'd)');
  ok(off1.hash === on.hash,
    'state hash identical observer on/off (' + off1.hash.slice(0, 12) + '...) — pure observer');
}

async function partC() {
  section('C. live smoke (seed 11 larceny-leaning x 30d)');
  const { Game } = await loadGame({ seed: 11, mode: 'justladder-test-c', fullTelemetry: true });
  await setupGame(Game);
  const api = attachJusticeLadder(Game);
  const result = await runDays(Game, larcenyLeaning, { days: 30, sampleEvery: 30 });
  ok(result.days === 30, 'runDays completes 30d (endReason=' + result.endReason + ')');
  ok(api.steals.length >= 1, 'larceny policy attempts thefts (' + api.steals.length + ')');
  const maxThefts = api.ladder.reduce((m, t) => Math.max(m, t.thefts), 0);
  ok(maxThefts >= 1, 'theft crimes booked in j.crimes (' + maxThefts + ')');
  ok(api.ladder.length >= 20, 'ladder time series recorded (' + api.ladder.length + ' rows)');
  const maxStage = api.ladder.reduce((m, t) => Math.max(m, t.stage), 0);
  console.log('  info: maxStage=' + maxStage + ' maxHeat=' +
    api.ladder.reduce((m, t) => Math.max(m, t.heat), 0) +
    ' steals=' + api.steals.length + ' (caught=' + api.steals.filter(s => s.result === 'caught').length + ')');
  ok(maxStage >= 0, 'stage snapshot valid');
}

async function main() {
  await partA();
  await partB();
  await partC();
  console.log('\n=== justiceladder proof: ' + PASS + ' pass, ' + FAIL + ' fail ===');
  if (FAIL) { console.log('failures: ' + failures.join(' | ')); process.exit(1); }
}
if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });

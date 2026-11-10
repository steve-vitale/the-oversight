// test-trustgain-cap-phantom.js — proof for instrument v3 (arm
// sim-answermail-a, prereg amendment 4). Loads the real game via
// sim-harness (own process: one harness per process), installs the
// trustgrowth instrument, and drives Game._trustGain through a
// fabricated link at three trust levels:
//   trust 100 + 1 -> cap absorbs it: wrap logs applied 0, no setter event
//   trust 97  + 8 -> partial cap: wrap logs applied 3, setter logs +3
//   trust 50  + 8 -> full gain: wrap logs applied 8, setter logs +8
// unifyEvents must then reconcile to exactly +3 and +8 (the phantom
// +1 dropped, the +3/+8 wraps deduped against their setter twins).
// Usage: node scripts/test-trustgain-cap-phantom.js
'use strict';
const assert = require('assert');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
const INST = require(path.join(REPO, 'scripts', 'trustgrowth-instrument-20261109'));
const ANALYZE = require(path.join(REPO, 'scripts', 'trustgrowth-analyze-20261109'));

(async function () {
  const { Game } = await loadGame({ seed: 120102, mode: 'cap-phantom-proof', fullTelemetry: false });
  await setupGame(Game); // initializes Game.state (scholar day); _trustGain reads it
  const inst = INST.install(Game);
  assert.strictEqual(inst.gainWrapped, true, 'trustGain wrap installed');
  const link = { id: 'test-link-cap', trust: 100, primary: 'haven', subordinate: 'emberhold' };
  inst.instrumentLink(link);

  const retCap = Game._trustGain(link, 1);
  assert.strictEqual(link.trust, 100, 'capped trust does not move');
  assert.strictEqual(retCap, 1, 'game still returns the requested amount (the lie, documented)');

  link.trust = 97;
  const retPart = Game._trustGain(link, 8);
  assert.strictEqual(link.trust, 100, 'partial cap lands at 100');
  assert.strictEqual(retPart, 8, 'game returns 8 for a +3 move');

  link.trust = 50;
  const retFull = Game._trustGain(link, 8);
  assert.strictEqual(link.trust, 58, 'uncapped gain lands whole');
  assert.strictEqual(retFull, 8, 'game returns 8 for a +8 move');

  const gains = inst.t.gains;
  assert.strictEqual(gains.length, 3, 'three wrap events; got ' + gains.length);
  assert.deepStrictEqual(gains.map(function (g) { return [g.requested, g.applied, g.returned]; }),
    [[1, 0, 1], [8, 3, 8], [8, 8, 8]],
    'wrap logs ACTUAL applied (0/3/8), return kept as `returned`; got ' + JSON.stringify(gains.map(function (g) { return [g.requested, g.applied, g.returned]; })));

  // The test's own manual resets (link.trust = 97 / 50) are also setter
  // writes; only the _trustGain-framed ones are the game's moves.
  const setters = inst.t.events.filter(function (e) { return /_trustGain/.test(e.stack || ''); });
  assert.strictEqual(setters.length, 2, 'two _trustGain setter events (no-op cap write skipped); got ' + setters.length);
  assert.deepStrictEqual(setters.map(function (e) { return e.delta; }), [3, 8], 'setter deltas are the real moves');

  const out = { events: setters, gains: gains, daily: [] };
  const unified = ANALYZE.unifyEvents(out);
  assert.deepStrictEqual(unified.map(function (e) { return e.delta; }), [3, 8],
    'unified log is exactly +3 and +8 (phantom dropped, wraps deduped); got ' + JSON.stringify(unified.map(function (e) { return e.delta; })));

  assert.strictEqual(inst.t.instrumentErrors.length, 0, 'instrument errors 0; got ' + JSON.stringify(inst.t.instrumentErrors));
  inst.uninstall();
  console.log('cap-phantom proof passed: wrap applied [0,3,8], setters [3,8], unified [3,8]');
  process.exit(0);
})().catch(function (e) { console.error('FAIL cap-phantom proof\n' + (e && e.stack ? e.stack : e)); process.exit(1); });

#!/usr/bin/env node
// test-eggroad-a-20261026.js — proof tests for the eggroad pilot probe.
//
// 1. sitAllowed: false without networkFallen, true with it (staged state).
// 2. eggroadCensus: reads real staged state (titan slain flags, network
//    summon/fall, overtime tier) — never invented values.
// 3. Live smoke: 1 seed x 5 days under the eggroad policy — the daily
//    titan driver + sit-gate wrap run without throwing, and the end
//    census populates every chain field.
// Usage: node scripts/test-eggroad-a-20261026.js (no env required)
'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const P = require('./probe-eggroad-a-20261026');

async function main() {
  const { Game } = await loadGame({ seed: 88101, mode: 'endgame-r40', fullTelemetry: true });
  await setupGame(Game);

  // --- 1. sit gate ---
  try { delete Game.progState().networkFallen; } catch (e) {}
  assert.strictEqual(P.sitAllowed(Game), false, 'sit must be refused before the key falls');
  Game.progState().networkFallen = true;
  assert.strictEqual(P.sitAllowed(Game), true, 'sit must be allowed once the key falls');
  delete Game.progState().networkFallen;

  // --- 2. census reads staged state ---
  Game.state.titans = Game.state.titans || { omens: {}, musters: {}, slain: {}, cast: null };
  Game.state.titans.slain = { herald: true, nielsen: false, finale: false };
  Game.state.titans.omens = { herald: { stage: 2, day: 50, warned: {} }, nielsen: { stage: 1, day: 60, warned: {} } };
  Game.progState().networkSummoned = true;
  Game.progState().overtime = 3;
  const c = P.eggroadCensus(Game);
  assert.strictEqual(c.titans.herald.slain, true, 'census must report staged herald slain');
  assert.strictEqual(c.titans.herald.omenStage, 2, 'census must report staged herald omen stage');
  assert.strictEqual(c.titans.nielsen.omenStage, 1, 'census must report staged nielsen omen stage');
  assert.strictEqual(c.networkSummoned, true, 'census must report staged network summon');
  assert.strictEqual(c.overtimeTier, 3, 'census must report staged overtime tier');
  assert.ok(c.seat !== undefined && c.ready4 !== undefined && c.ready5 !== undefined && c.standing !== undefined, 'census must populate every chain field');
  delete Game.progState().networkSummoned;
  delete Game.progState().overtime;
  Game.state.titans.slain = {};
  Game.state.titans.omens = {};

  // --- 3. live smoke: 5 days under the eggroad policy ---
  const policy = P.eggroadPolicy();
  const origTakeSeat = Game.tableTakeSeat ? Game.tableTakeSeat.bind(Game) : null;
  if (origTakeSeat) {
    Game.tableTakeSeat = function () {
      if (!P.sitAllowed(Game)) return { ok: false, msg: '' };
      return origTakeSeat.apply(this, arguments);
    };
  }
  await runDays(Game, policy, { days: 5, manifest: undefined, sampleEvery: 1 });
  const c2 = P.eggroadCensus(Game);
  assert.ok(c2.day >= 5, 'smoke must advance days, got ' + c2.day);
  assert.ok(c2.seat !== undefined && c2.titans && c2.titans.herald, 'smoke census must populate chain fields');
  console.log('eggroad-a proof: sit-gate 2/2, census staged-state 5/5, live smoke day=' + c2.day + ' seat=' + c2.seat + ' — GREEN');
}

main().catch(e => { console.error('eggroad-a proof FAILED:', e); process.exit(1); });

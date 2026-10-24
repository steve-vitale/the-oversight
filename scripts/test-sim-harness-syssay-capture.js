#!/usr/bin/env node
// test-sim-harness-syssay-capture.js — proof for the sim-harness
// captureSysSay opt-in (gap 349/610: syssay-deaf probes). Loads the game
// once with a capture array, calls Game.sysSay, and asserts the System
// voice lands in the array instead of the default no-op. Default behavior
// (silenced, no array) is unchanged by construction — the opt-in branch
// only runs when an array is supplied.
'use strict';
const assert = require('assert');
const { loadGame } = require('./sim-harness');

(async () => {
  const cap = [];
  const { Game } = await loadGame({ seed: 42, mode: 'mvc', captureSysSay: cap });
  assert.strictEqual(typeof Game.sysSay, 'function', 'sysSay is a function after load');
  Game.sysSay('SYSTEM TEST LINE');
  assert.ok(cap.some(s => s.includes('SYSTEM TEST LINE')),
    'captureSysSay received System voice, got: ' + JSON.stringify(cap));
  console.log('PASS 349/610 captureSysSay routes System voice into the probe array: ' + JSON.stringify(cap));
  console.log('ALL SYSSAY-CAPTURE PROOFS PASS');
})().catch(e => { console.error('FAIL: ' + (e && e.stack || e)); process.exit(1); });

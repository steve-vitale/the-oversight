#!/usr/bin/env node
// Harness for combat break-it round 3 (2026-10-08).
// Load the actual current runtime through the shared seeded harness. The
// copied October 8 list omitted live input/settlement modules and made async
// probes fail before exercising their assertions. One load per process;
// subsequent scenes reset the run, never re-evaluate or reseed captured RNG.
const H = require('./sim-harness');
const ROOT = H.ROOT;
const mulberry32 = H.mulberry32;
const SEED = parseInt(process.env.SEED || '20261008', 10);
const FILES = H.nodeScriptFiles();
let loaded;

async function newCombatReadyGame() {
  if (!loaded) loaded = H.loadGame({ seed: SEED, mode: 'godpath', narration: true });
  const { Game, loadFails } = await loaded;
  if (loadFails.length) throw new Error('Combat runtime load failed: ' + loadFails.join('; '));
  Game.genRoster('Breaker');
  Game.newGame('Breaker', null, Game.generatedRoster[0].id);
  Game.depart();
  return Game;
}

// Spawn a minimal synthetic fight: player + one monster at known coords.
// Returns the monster fighter key.
function synthFight(Game, monId, opts = {}) {
  const s = Game.state.scholar;
  s.mx = 4; s.my = 4;
  Game.state.systemArrived = false;
  Game.resetPerFightFlags();
  const mdef = Game.data.monsters.find(m => m.id === monId);
  if (!mdef) throw new Error('unknown monster ' + monId);
  const mk = 'm_test';
  Game.tbfight = {
    id: 'ftest',
    fighters: [
      { key: 'p', kind: 'player', name: 'You', emoji: '🧑', hp: opts.php || 100, maxHp: 100,
        speed: opts.pspeed || 6, mx: 4, my: 4, alive: true, fled: false,
        moveLeft: opts.moves != null ? opts.moves : 3, acted: false, aimed: false },
      { key: mk, kind: 'monster', monsterId: monId, mdef, name: 'TestMonster', emoji: '👹',
        hp: opts.mhp || 30, maxHp: opts.mhp || 30, speed: opts.mspeed || 3, mx: 6, my: 4,
        alive: true, fled: false, telegraph: null, hesitate: 0, blind: 0, stunned: 0,
        threatQueue: [] },
    ],
    over: false, round: 1, order: ['p', mk], turnIdx: 0,
  };
  return mk;
}

// BROWSER-PATH helpers: the real browser runs with window defined, which
// flips tbAfterPlayerAction onto the async (setTimeout) chain. These helpers
// install a synchronous-drain setTimeout so the async chain runs
// deterministically in node. Returns a restore function.
function browserPath(drainCap) {
  const events = [];
  global.window = { __breakit: true, dispatchEvent(event) { events.push(event); return true; } };
  const queue = [];
  const realSetTimeout = global.setTimeout;
  let drained = 0;
  global.setTimeout = (fn, ms) => { queue.push(fn); return queue.length; };
  return {
    queue,
    events,
    get drained() { return drained; },
    pump(max) {
      const n = max == null ? (drainCap || 500) : max;
      let c = 0;
      while (queue.length && c < n) { const fn = queue.shift(); c++; drained++; fn(); }
      return c;
    },
    restore() { global.setTimeout = realSetTimeout; delete global.window; },
  };
}

module.exports = { ROOT, SEED, newCombatReadyGame, synthFight, mulberry32, browserPath, FILES };

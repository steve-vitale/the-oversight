// Shared harness for the break-monsters break-it run.
// Seeds ONE resettable RNG as Math.random BEFORE eval (modules capture it at load),
// then evals the FULL src/js/*.js list in index.html order (minus DOM-only
// app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js and generated build.js).
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const ORDER = require('./lib/browser-script-files')(ROOT);

// Resettable shared RNG (mulberry32). Install BEFORE eval.
let _s = 1;
function rng() {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function seedRng(seed) { _s = seed >>> 0 || 1; }
Math.random = rng; // installed before any module captures it

// fetch() stub: load JSON from the worktree (data files are fetched at runtime).
global.fetch = (f) => Promise.resolve({
  json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))),
});

// window stub for the eval phase only (equipment.js needs it at load).
global.window = global;

function loadGame() {
  for (const f of ORDER) {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    try { eval(src); }
    catch (e) {
      throw new Error(`eval failed for ${f}: ${e.message}`);
    }
  }
  delete global.window; // runtime checks then take the sync path
  return globalThis.Scattering.Game;
}

async function freshGame(seed) {
  seedRng(seed);
  const Game = loadGame();
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  return Game;
}

module.exports = { ROOT, ORDER, seedRng, rng, loadGame, freshGame };

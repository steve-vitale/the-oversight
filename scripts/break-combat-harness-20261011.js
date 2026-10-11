#!/usr/bin/env node
// Break-it combat harness (2026-10-11). Loads the FULL src/js/*.js list in
// index.html order minus DOM-only (app.js/sprites.js/tile-scenes.js/
// move-anim.js/drama.js). Seeds Math.random BEFORE eval (modules capture it
// at load). Stubs window for eval (equipment.js), deletes it after so combat
// takes the sync path.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEED = parseInt(process.env.SEED || '20261011', 10);
const rng = mulberry32(SEED);
Math.random = rng;
function reseed(s) { const r = mulberry32(s); Math.random = r; return r; }

global.window = global; // eval-time stub for equipment.js
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
global.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };

const FILES = fs.readFileSync('/tmp/harness-list.txt', 'utf8').trim().split('\n');
for (const f of FILES) {
  const code = fs.readFileSync(path.join(ROOT, f), 'utf8');
  try { eval(code); }
  catch (e) { console.error('EVAL FAIL', f, e.message); process.exit(1); }
}
delete global.window; // runtime: sync combat path

const Game = globalThis.Scattering.Game;
const sayLog = [];
const _say = Game.say.bind(Game);
Game.say = function (...a) { sayLog.push(a.join(' ')); return _say(...a); };

async function boot() {
  await Game.init();
  Game.genRoster('Breaker');
  Game.newGame('Breaker', null, Game.generatedRoster[0].id);
  Game.depart();
  return Game;
}

// Minimal synthetic fight: player + fighters. fighters: array of fighter defs.
function synthFight(Game, fighters, opts = {}) {
  const s = Game.state.scholar;
  s.mx = 4; s.my = 4; s.hp = opts.php || 100;
  Game.state.systemArrived = false;
  if (Game.resetPerFightFlags) Game.resetPerFightFlags();
  const pf = { key: 'p', kind: 'player', name: 'You', emoji: '🧑', hp: opts.php || 100, maxHp: 100,
    speed: 6, mx: 4, my: 4, alive: true, fled: false, moveLeft: 6, acted: false, aimed: false };
  const all = [pf, ...fighters];
  Game.tbfight = { fighters: all, over: false, round: 1, order: all.map(f => f.key), turnIdx: 0 };
  Game._pendingPack = null;
  return pf;
}

function monFighter(Game, monId, key, mx, my, hp) {
  const mdef = Game.data.monsters.find(m => m.id === monId);
  if (!mdef) throw new Error('unknown monster ' + monId);
  return { key, kind: 'monster', monsterId: monId, mdef, name: 'Test ' + monId, emoji: '👹',
    hp: hp || 30, maxHp: hp || 30, speed: 3, mx, my, alive: true, fled: false,
    telegraph: null, hesitate: 0, blind: 0, stunned: 0 };
}

function allyFighter(vid, mx, my, hp, varmor) {
  return { key: 'v_' + vid, kind: 'villager', villagerId: vid, name: 'Ally' + vid, emoji: '🧑',
    hp: hp || 40, maxHp: hp || 40, speed: 4, mx, my, alive: true, fled: false, varmor: varmor || 0 };
}

module.exports = { ROOT, SEED, reseed, boot, synthFight, monFighter, allyFighter, sayLog, Game };

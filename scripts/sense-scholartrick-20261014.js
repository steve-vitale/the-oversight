#!/usr/bin/env node
// Sense + mid-attribution supplemental for scholartrick (one rich seed).
// Prints: scholar observation mids, discovery mids, and the scholar beats
// in narrative context.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { runDays, setupGame } = require('./sim-harness');
const { belongseek } = require('./policies/belongseek');
const ROOT = path.resolve(__dirname, '..');
const SEED = parseInt(process.env.SEEDS || '55', 10);

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

(async () => {
  Math.random = mulberry32(SEED);
  global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
  const order = execSync(`grep -o 'src/js/[^\"'\"'\"']*\\.js' index.html`, { cwd: ROOT })
    .toString().split('\n')
    .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
  global.window = global;
  const gameIdx = order.indexOf('src/js/game.js');
  const evalFile = (f) => { const module = { exports: {} }; const exports = module.exports; eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); };
  order.forEach((f, i) => { if (gameIdx < 0 || i < gameIdx) evalFile(f); });
  if (gameIdx >= 0) evalFile(order[gameIdx]);
  global.Game = globalThis.Scattering.Game;
  order.forEach((f, i) => { if (i > gameIdx) evalFile(f); });
  delete global.window;
  await new Promise(r => setTimeout(r, 0));
  const Game = globalThis.Scattering.Game;
  const sayLines = [];
  Game.say = function (s) { sayLines.push(String(s)); };
  Game.sysSay = function () {};
  Game.audioEvent = function () {};
  if (Game.drama === undefined) Game.drama = function () {};
  await Game.init();
  await setupGame(Game);

  const obsMids = {}, discMids = [];
  const o = Game.noteScholarTrickObservation;
  Game.noteScholarTrickObservation = function (mid) { obsMids[mid] = (obsMids[mid] || 0) + 1; return o.call(this, mid); };
  const od = Game.discoverMonsterCounter;
  Game.discoverMonsterCounter = function (mid, via) { if (via === 'scholar-observed') discMids.push(mid); return od.call(this, mid, via); };

  const policy = Object.assign({}, belongseek);
  const result = await runDays(Game, policy, { days: 180, sampleEvery: 10 });
  console.log(`seed ${SEED}: days=${result.days} end=${result.endReason} wave=${result.maxWaveUnlocked}`);
  console.log('\nscholar observation mids:', JSON.stringify(obsMids, null, 1));
  console.log('\nscholar-channel discoveries:', JSON.stringify(discMids));
  console.log('\n--- scholar beats in context ---');
  const beats = sayLines.filter(s => /lived to tell it|see the pattern|COUNTER LEARNED/.test(s));
  beats.slice(0, 12).forEach(b => console.log('  ' + b.slice(0, 220)));
  console.log(`\n(${beats.length} scholar beats total across ${sayLines.length} say lines)`);
})().catch(e => { console.error('CRASH:', e); process.exit(2); });

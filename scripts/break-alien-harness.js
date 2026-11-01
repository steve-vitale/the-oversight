// Shared harness for break-it alien-players tests (Steve 2026-10-08).
// Boots the FULL src/js/*.js list in index.html order (minus DOM-only
// app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js), with one shared
// resettable RNG installed BEFORE eval (modules capture Math.random at load).
// PARITY RULE (break-it 2026-10-10 r13): this list must match index.html's
// <script> order exactly (minus the DOM-only five). Drift breaks tests
// silently — r12's eligibility suite went red the day waveLedger.js shipped
// because unlockedWave() moved to the wave ledger and the harness never
// loaded it. When index.html gains a node-safe script, add it here.
// window stubbed for eval, deleted before playing (sync combat path).
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let _seed = 20261008;
const RNG = {
  reset(s) { _seed = (s >>> 0) || 1; },
  next() { _seed = (_seed * 1664525 + 1013904223) >>> 0; return _seed / 4294967296; },
};
Math.random = RNG.next.bind(RNG);

global.fetch = (f) => Promise.resolve({
  json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, decodeURIComponent(new URL(f, 'https://fixture.invalid/').pathname).slice(1)), 'utf8'))),
});

global.window = global;
require('./lib/browser-script-files')(ROOT).forEach(f => eval(fs.readFileSync(path.join(ROOT, f), 'utf8')));
delete global.window;

const Game = globalThis.Scattering.Game;

let log = [];
const _say = Game.say.bind(Game), _sys = Game.sysSay.bind(Game);
Game.say = t => { log.push(['say', String(t)]); return _say(t); };
Game.sysSay = t => { log.push(['sys', String(t)]); return _sys(t); };
function sayText() { return log.filter(([k]) => k === 'say').map(([, t]) => t).join('\n'); }
function sysText() { return log.filter(([k]) => k === 'sys').map(([, t]) => t).join('\n'); }
function allText() { return log.map(([, t]) => t).join('\n'); }
function clearLog() { log = []; }

function fresh(day) {
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  try { Game.ensureVillagerPositions(); } catch (e) {}
  const s = Game.state.scholar;
  s.day = day || 15;
  Game.state.systemArrived = true;
  s.hp = 100; s.maxHp = 100; s.kcal = 3000; s.trauma = 0;
  s.mx = 4; s.my = 4;
  Game.state.over = false;
  clearLog();
  return s;
}

module.exports = { Game, ROOT, RNG, fresh, sayText, sysText, allText, clearLog };

// Boot: data load is async (Game.init). Callers must `await boot()` once.
async function boot() {
  await Game.init();
  return { Game, RNG, fresh, sayText, sysText, allText, clearLog };
}
module.exports.boot = boot;

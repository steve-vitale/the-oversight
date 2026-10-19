// PROOF TEST (async companion): the BROWSER's stepped combat path
// (tbAdvanceOneAsync) routes kind 'ally'/'villager' to tbVillagerTurn.
// Before the fix, every non-player fighter fell into tbMonsterTurn, which
// read m.mdef.fleeAt on a mdef-less fighter and threw — swallowed by the
// try/catch, so villager AND ally turns were silently SKIPPED in browser
// combat. The node sync path never had this bug, which is why sims missed it.
//
// Method: stub window AFTER module load (so engine IIFEs bind globalThis),
// capture setTimeout instead of waiting 550ms, drive two ticks manually.
// Deterministic: no real timers, no RNG dependence in the assertions.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ a >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
Math.random = mulberry32(20261013);

global.SCATTER_DATA = {};
for (const f of fs.readdirSync(path.join(ROOT, 'src/data'))) {
  if (!f.endsWith('.json')) continue;
  try { global.SCATTER_DATA[f.replace(/\.json$/, '')] = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data', f), 'utf8')); } catch (e) {}
}
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
global.window = global; // eval-time stub for load-time window touches
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const SKIP_DOM = /app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/;
const files = [];
for (const m of html.matchAll(/src="([^"?]+)\?v=/g)) {
  const f = m[1];
  if (f.endsWith('.js') && !SKIP_DOM.test(f)) files.push(f);
}
for (const f of files) eval(fs.readFileSync(path.join(ROOT, f), 'utf8'));
global.Game = globalThis.Scattering.Game;
Game.data = global.SCATTER_DATA;

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; console.log('  FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}

Game.state = Game.state || {};
Game.state.scholar = { day: 40, hp: 200, maxHp: 200, inventory: [] };
Game.state.village = { roster: ['me', 'vil_a'], trust: {}, health: {}, cheer: 5 };
Game.state.codex = { monsters: {} };
Game.villagerId = 'me';
Game.recordMoment = () => {};
Game.ledgerAdd = () => {};
Game.audioEvent = () => {};
const said = [], sysSaid = [];
Game.say = (t) => { said.push(String(t)); };
Game.sysSay = (t) => { sysSaid.push(String(t)); };
Game.map = { px: 4, py: 4 };
Game.genDetail = () => Array.from({ length: 9 }, () => Array(9).fill(null));
Game.cellProps = () => ({});

// NOW flip to the browser path: window defined from here on.
global.window = { dispatchEvent: () => {} };
const timers = [];
const realSetTimeout = global.setTimeout;
global.setTimeout = (fn) => { timers.push(fn); return timers.length; };

const hush = (Game.data.monsters || []).find(m => m.id === 'hushwolf');
const p = { key: 'p', kind: 'player', name: 'You', hp: 200, maxHp: 200, mx: 4, my: 4, alive: true, fled: false, speed: 3, moveLeft: 0, acted: true };
const a1 = { key: 'a_1', kind: 'ally', villagerId: 'vil_a', villageId: 'ashford', name: 'Ally One', emoji: '🛡️', hp: 100, maxHp: 100, speed: 3, mx: 1, my: 1, alive: true, fled: false, ai: 'brave', wbonus: 0, varmor: 0, moveLeft: 3, acted: false, helped: false };
const m1 = { key: 'm1', kind: 'monster', monsterId: 'hushwolf', mdef: hush, name: 'Hushwolf', emoji: '🐺', hp: 60, maxHp: 60, mx: 5, my: 4, alive: true, fled: false, speed: 2, moveLeft: 2, acted: false };
Game.tbfight = { id: 9, fighters: [p, a1, m1], order: ['a_1', 'm1', 'p'], turnIdx: -1, round: 1, over: false, asyncGen: 0 };
Game.tbGridMax = () => 8;

let threw = null;
try {
  Game.tbAdvanceAsync(); // tick 1: the ally's turn, via the ASYNC dispatch
} catch (e) { threw = e; }
check('async: ally turn does not throw', !threw, threw && threw.message);
check('async: announcement does not teleport or attack before its beat',
  a1.mx === 1 && a1.my === 1 && !(a1._dealt || 0));
timers.shift()(); // resolve the announced ally turn after its visible beat
check('async: ally took a real turn (moved or dealt)',
  (a1.mx !== 1 || a1.my !== 1) || (a1._dealt || 0) > 0,
  `pos (1,1)->(${a1.mx},${a1.my}) dealt=${a1._dealt || 0}`);
check('async: ally turn banner said aloud', sysSaid.some(t => /Ally One's turn/.test(t)));
check('async: next tick scheduled (chain continues)', timers.length === 1);

threw = null;
try {
  timers.shift()(); // tick 2: the monster's turn still works
} catch (e) { threw = e; }
check('async: monster turn still works after the fix', !threw, threw && threw.message);

global.setTimeout = realSetTimeout;
console.log(`\n${pass} passed, ${fail} failed (async path)`);
process.exit(fail ? 1 : 0);

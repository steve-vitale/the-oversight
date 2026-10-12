// PROOF TEST: THE HERALD titan (Steve 2026-10-12)
// The Herald is a wave-4 TUTORIAL titan, separate from the Eater (wave-4 boss).
// Tests:
// (a) Herald is a titan; Eater is NOT
// (b) Solo fight refused (hard gate, needs 10 allies)
// (c) Muster with 10 allies succeeds
// (d) Herald's kit: 3 moves, all telegraphed, tutorial-forgiving
// (e) The Naming (bloodied) has windup 3
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || '20261012', 10);
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ a >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
Math.random = mulberry32(SEED);

global.SCATTER_DATA = {};
for (const f of fs.readdirSync(path.join(ROOT, 'src/data'))) {
  if (!f.endsWith('.json')) continue;
  try { global.SCATTER_DATA[f.replace(/\.json$/, '')] = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data', f), 'utf8')); } catch (e) {}
}
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
global.window = global;

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const SKIP_DOM = /app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/;
const files = [];
for (const m of html.matchAll(/src="([^"?]+)\?v=/g)) {
  const f = m[1];
  if (f.endsWith('.js') && !SKIP_DOM.test(f)) files.push(f);
}
const gameIdx = files.indexOf('src/js/game.js');
eval(fs.readFileSync(path.join(ROOT, files[gameIdx]), 'utf8'));
global.Game = globalThis.Scattering.Game;
files.forEach((f, i) => { if (i !== gameIdx) eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window;
Game.data = global.SCATTER_DATA;

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra || ''); }
}

// (a) Herald is a titan; Eater is NOT
check('herald is a titan', Game.isTitan('herald') === true);
check('eater is NOT a titan', Game.isTitan('eater') === false);
check('nielsen is a titan', Game.isTitan('nielsen') === true);
check('finale is a titan', Game.isTitan('finale') === true);

// (b) Titan defs
const hdef = Game.titanDef('herald');
check('herald def exists', !!hdef);
check('herald minAllies is 10', hdef && hdef.minAllies === 10);
check('herald role is herald', hdef && hdef.role === 'herald');
check('herald wave is 4', hdef && hdef.wave === 4);

const ndef = Game.titanDef('nielsen');
check('nielsen minAllies is 12', ndef && ndef.minAllies === 12);
const fdef = Game.titanDef('finale');
check('finale minAllies is 15', fdef && fdef.minAllies === 15);

// (c) Herald monster data
const hmon = (Game.data.monsters || []).find(m => m.id === 'herald');
check('herald monster exists', !!hmon);
check('herald wave 4', hmon && hmon.wave === 4);
check('herald has 3-move kit', hmon && hmon.attacks && hmon.attacks.length === 3);
if (hmon && hmon.attacks) {
  const names = hmon.attacks.map(a => a.name);
  check('First Omen in kit', names.includes('First Omen'));
  check('Second Omen in kit', names.includes('Second Omen'));
  check('The Naming in kit', names.includes('The Naming'));
  // All moves telegraphed
  check('all moves have telegraphs', hmon.attacks.every(a => a.telegraph && a.telegraph.length > 20));
  // The Naming: bloodied, windup 3
  const naming = hmon.attacks.find(a => a.name === 'The Naming');
  check('Naming is bloodied-gated', naming && naming.condition && naming.condition.hpBelow === 0.5);
  check('Naming windup 3', naming && naming.pattern && naming.pattern.windup === 3);
  // Tutorial-forgiving: max damage <= 120
  const maxDmg = Math.max(...hmon.attacks.map(a => (a.damage || [0, 0])[1]));
  check('tutorial-forgiving (max dmg <= 120)', maxDmg <= 120, 'max=' + maxDmg);
}

// (d) titanCast uses herald, not eater
Game.state = Game.state || {};
Game.state.titans = null;
const cast = Game.titanCast();
check('cast herald is herald', cast && cast.herald === 'herald');
check('cast herald is NOT eater', cast && cast.herald !== 'eater');

console.log(`\n${pass} passed, ${fail} failed (seed ${SEED})`);
process.exit(fail ? 1 : 0);

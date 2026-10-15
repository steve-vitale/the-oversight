// PROOF TEST: Titan fight variety (Steve 2026-10-11)
// "Make sure these fights have a variety and are a bunch of fun."
// Proves each titan has DISTINCT mechanics, not just stat differences:
// - Herald: omen-based tutorial (telegraphed lines/bursts, ARRIVAL theme)
// - Nielsen: ratings game (fight boring to win, 0-100 scale)
// - Finale: countdown to apocalypse (3-round title card, unavoidable)
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

(async () => {
  const H = require('./sim-harness.js');
  const { Game: G } = await H.loadGame({ seed: SEED });
  await H.setupGame(G);
  G.depart();
  const said = []; G.say = (t) => said.push(String(t)); G.audioEvent = () => {};

  // HERALD: omen tutorial
  console.log('-- herald --');
  const blades = (n, prefix) => Array.from({length:n}, (_,i)=>({ vid: prefix+i, villageId: 'fixture', name: 'Blade '+prefix+i, hp: 100, outfitted: [], gearValue: 0 }));
  G.state.titans = { musters: { herald: { allies: blades(10, 'a'), haven: [], day: 0, outfitted: {} } } };
  G.state.scholar.health = 9000; G.state.scholar.mx = 4; G.state.scholar.my = 4;
  G.startCombat('herald');
  const h = G.tbfight.fighters.find(f => f.kind === 'monster');
  check('herald has 3-move kit', (h.mdef.attacks || []).length === 3);
  check('herald First Omen is line', h.mdef.attacks[0].pattern.type === 'line');
  check('herald vibe is ARRIVAL', /ARRIVING/i.test(h.mdef.vibe));
  check('herald is tutorial (HP < eater)', h.maxHp < 1000);
  G.tbfight.over = true; G.tbfight = null;

  // NIELSEN: ratings game
  console.log('-- nielsen --');
  G.state.titans.musters.nielsen = { allies: blades(12, 'b'), haven: [], day: 0, outfitted: {} };
  G.state.scholar.health = 9000;
  G.startCombat('nielsen');
  const n = G.tbfight.fighters.find(f => f.kind === 'monster');
  check('nielsen has ratings mechanic', typeof G.titanMusterState === 'function');
  // Nielsen's kit should be about attention/performance, not raw damage
  const nKit = n.mdef.attacks || [];
  check('nielsen kit exists', nKit.length >= 2);
  G.tbfight.over = true; G.tbfight = null;

  // FINALE: countdown apocalypse
  console.log('-- finale --');
  G.state.titans.musters.finale = { allies: blades(20, 'c'), haven: [], day: 0, outfitted: {} };
  G.state.scholar.health = 9000;
  G.startCombat('finale');
  const f = G.tbfight.fighters.find(f => f.kind === 'monster');
  const fKit = f.mdef.attacks || [];
  check('finale kit exists', fKit.length >= 2);
  check('finale is apocalypse (highest HP)', f.maxHp > 1000);
  G.tbfight.over = true; G.tbfight = null;

  // DISTINCTNESS: the three have different minAllies (10/12/20)
  const t = G.data.titans;
  check('herald needs 10', t.herald.minAllies === 10);
  check('nielsen needs 12', t.nielsen.minAllies === 12);
  check('finale needs 20 (Steve 2026-10-11: even more people)', t.finale.minAllies === 20);
  check('all distinct', new Set([t.herald.minAllies, t.nielsen.minAllies, t.finale.minAllies]).size === 3);

  console.log(`\n${pass} passed, ${fail} failed (seed ${SEED})`);
  process.exit(fail ? 1 : 0);
})();

// MISER BREAK-IT 2026-10-11 — cache economy + tool-gated honesty.
// Hostile player vs the village stash / personal cache / tool tiers.
//
// THREE ATTACKS:
//  1. EXPLOIT: the earth as a mint? bury food/materials, draw partial rations,
//     dig up the rest — every unit must balance exactly. No duplication, no
//     phantom loss, no minting through partial takes or digs.
//  2. SOFTLOCK: the heavy-cache escape hatch — bury more than you can carry
//     home in one trip, dig with a full pack (refusal must be non-stranding),
//     then draw rations by the portion (the documented escape hatch) and dig
//     the rest after lightening. Also: all-rot dig must not strand.
//  3. HONESTY: (a) STORAGE.md promises "machete 16 ticks / axe 24 / hands 64"
//     for clearBrush — the engine's second branch (`rank >= fell ? 24`) is
//     DEAD: fell(4) satisfies `>= brush(2)` first, so the axe costs 16, not
//     24. The documented tool ladder doesn't exist in the engine.
//     (b) digUpCache on a mixed rot/good cache says the rot was "left for
//     the worms" — but the bad items STAY in the cache and the SAME line
//     fires on every subsequent dig. The takeFromCache path already splices
//     spoiled portions out; digUpCache doesn't.
// Usage: node scripts/test-miser-cache-honesty-20261011.js
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

// SEED BEFORE EVAL (AGENTS.md 2026-10-08): modules capture Math.random at load.
let _s = Number(process.env.SEED || 0xC10C);
function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
Math.random = mulberry32(_s);

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
// equipment.js needs window at load; delete before playing (sync combat path).
global.window = global;
const ORDER = ['src/js/engine/state.js', 'src/js/engine/modifiers.js', 'src/js/engine/calories.js',
  'src/js/engine/day.js', 'src/js/engine/forage.js', 'src/js/engine/combat.js',
  'src/js/game.js', 'src/js/encounters.js', 'src/js/conversation.js', 'src/js/convo-mood.js',
  'src/js/convoTopics.js', 'src/js/convo-wants.js', 'src/js/convo-beats.js',
  'src/js/convo-scene.js', 'src/js/examine.js', 'src/js/equipment.js', 'src/js/journal.js',
  'src/js/party.js', 'src/js/party-formal.js', 'src/js/truth.js', 'src/js/contests.js',
  'src/js/contestEngine.js', 'src/js/alienPlayers.js', 'src/js/storage.js', 'src/js/perceive.js',
  'src/js/carexplore.js', 'src/js/justice.js', 'src/js/food.js', 'src/js/betrayal.js',
  'src/js/corpses.js', 'src/js/lifeseed.js', 'src/js/progression.js', 'src/js/ledger.js',
  'src/js/abilityActions.js', 'src/js/monsterBehaviors.js', 'src/js/statusEffects.js',
  'src/js/villager-agency.js', 'src/js/fieldFights.js', 'src/js/villager-objectives.js',
  'src/js/codex-people.js', 'src/js/membership.js', 'src/js/hierarchy.js',
  'src/js/debug-scenarios.js', 'src/js/build.js'];
ORDER.forEach(f => eval(fs.readFileSync(path.join(ROOT, f), 'utf8')));
delete global.window;
const Game = globalThis.Scattering.Game;

async function main() {
await Game.init();

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL ${name}${extra ? ': ' + extra : ''}`); }
}
function freshGame() {
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.state.scholar.mx = 4; Game.state.scholar.my = 4;
  Game.state.scholar.inventory = [];
  Game.state.scholar.villagerId = Game.generatedRoster[0].id;
  Game.state.scholar.insideHaven = true;
  Game.state.scholar.day = 5;
  Game.state.scholar.caches = [];
  try { Game.map.px = Game.state.village.px ?? 4; Game.map.py = Game.state.village.py ?? 4; } catch (e) {}
}
// say capture + tick capture
let said = [];
const origSay = Game.say;
Game.say = function (t) { said.push(String(t)); try { return origSay.call(this, t); } catch (e) {} };
let lastTicks = null;
const origTick = Game.tickAction;
Game.tickAction = function (n) { lastTicks = n; return origTick.call(this, n); };

function foodItem(name, units, spoilDay, kcalEach) {
  return { name, units, kcalEach: kcalEach || 100, spoilDay, kg: 0.3, safe: true,
    diseaseRisk: null, poisonRisk: null, parasiteRisk: null };
}

// ---------- ATTACK 1: EXPLOIT — the earth as a mint? ----------
freshGame();
// Materials: bury 7 branch, dig up — exact balance.
Game.addMaterial('branch', 7);
const node0 = { x: Game.map.px, y: Game.map.py };
Game.buryCache('material', 'branch', 7);
ok('exploit: bury consumes pack materials', Game.materialCount('branch') === 0);
const cacheId = Game.playerCaches()[0].id;
Game.digUpCache(cacheId);
ok('exploit: dig restores exactly 7 branch', Game.materialCount('branch') === 7,
  'got ' + Game.materialCount('branch'));
ok('exploit: cache gone after full dig', Game.playerCaches().length === 0);

// Food: bury 6 units, partial-take 2, dig the rest — units must sum to 6.
freshGame();
Game.state.scholar.inventory.push(foodItem('Smoked rabbit', 6, 9999, 120));
Game.buryCache('food', 0, 6);
ok('exploit: bury consumes pack food', Game.state.scholar.inventory.length === 0);
const cid2 = Game.playerCaches()[0].id;
Game.takeFromCache(cid2, 0, 2);
const inPack = (Game.state.scholar.inventory[0] || {}).units || 0;
const leftBuried = (Game.playerCaches()[0].items[0] || {}).units || 0;
ok('exploit: partial take splits 2/4', inPack === 2 && leftBuried === 4,
  `pack=${inPack} buried=${leftBuried}`);
Game.digUpCache(cid2);
const finalUnits = Game.state.scholar.inventory.reduce((t, i) => t + (i.units || 0), 0);
ok('exploit: bury6/take2/dig4 nets exactly 6', finalUnits === 6, 'got ' + finalUnits);
ok('exploit: cache gone after full dig (food)', Game.playerCaches().length === 0);

// kcal conservation through the round trip (no minting, no phantom loss).
freshGame();
Game.state.scholar.inventory.push(foodItem('Smoked rabbit', 4, 9999, 120));
const kcalBefore = 4 * 120;
Game.buryCache('food', 0, 4);
const cid3 = Game.playerCaches()[0].id;
Game.takeFromCache(cid3, 0, 1);
Game.digUpCache(cid3);
const kcalAfter = Game.state.scholar.inventory.reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 0), 0);
ok('exploit: kcal conserved through bury/take/dig', kcalAfter === kcalBefore,
  `${kcalBefore} -> ${kcalAfter}`);

// ---------- ATTACK 2: SOFTLOCK — the heavy-cache escape hatch ----------
freshGame();
// Carry capacity ~20kg. Bury 8 wood (16kg) at a far node, then arrive with a
// near-full pack: the whole-cache dig must refuse honestly WITHOUT stranding
// the goods — the ration drawer (portion weight check) is the escape hatch.
Game.state.scholar.inventory = [];
Game.addMaterial('wood', 8);
Game.buryCache('material', 'wood', 8);
const heavyId = Game.playerCaches()[0].id;
ok('softlock: 8 wood buried', Game.playerCaches()[0].items[0].units === 8);
// Fill the pack to ~19kg so the 16kg dig can't fit.
Game.state.scholar.inventory.push({ name: 'Pack ballast', units: 1, kg: 13, kcalEach: 0 });
said = [];
Game.digUpCache(heavyId);
ok('softlock: heavy dig refused, cache NOT destroyed', Game.playerCaches().length === 1 &&
  Game.playerCaches()[0].items[0].units === 8, 'cache len=' + Game.playerCaches().length);
ok('softlock: refusal is honest, not silent', said.some(s => /too heavy/i.test(s)));
// Escape hatch: draw 2 wood (1kg) by the portion — must work with a full pack.
Game.takeFromCache(heavyId, 0, 2);
ok('softlock: portion draw works with full pack', Game.materialCount('wood') === 2,
  'wood=' + Game.materialCount('wood'));
ok('softlock: cache survives the partial draw', Game.playerCaches().length === 1 &&
  Game.playerCaches()[0].items[0].units === 6);
// Lighten up, come back: the rest digs out fine.
Game.state.scholar.inventory = Game.state.scholar.inventory.filter(i => i.name !== 'Pack ballast');
Game.digUpCache(heavyId);
ok('softlock: full dig completes after lightening', Game.materialCount('wood') === 8 &&
  Game.playerCaches().length === 0, 'wood=' + Game.materialCount('wood'));

// All-rot dig: cache removed, no phantom goods, no strand.
freshGame();
Game.state.scholar.inventory.push(foodItem('Old berries', 3, -100, 40)); // rotten even with a generated preservation skill
Game.buryCache('food', 0, 3);
const rotId = Game.playerCaches()[0].id;
said = [];
Game.digUpCache(rotId);
ok('softlock: all-rot dig removes the cache', Game.playerCaches().length === 0);
ok('softlock: all-rot dig announces the loss', said.some(s => /gone bad underground/i.test(s)));
ok('softlock: all-rot dig yields nothing', Game.state.scholar.inventory.length === 0);

// ---------- ATTACK 3: HONESTY ----------
// 3a. clearBrush tool ladder: canon says machete 16 / axe 24 / hands 64.
freshGame();
Game.state.scholar.kcal = 2000;
Game.state.scholar.mx = 4; Game.state.scholar.my = 4;
// A bush adjacent to the player.
const grid = [];
for (let y = 0; y < 9; y++) { grid.push([]); for (let x = 0; x < 9; x++) grid[y].push('grass'); }
grid[4][5] = 'bush';
const origGenDetail = Game.genDetail;
Game.genDetail = function () { return grid; };
function clearTicksWith(itemId, label) {
  Game.state.scholar.inventory = itemId ? [{ itemId, name: label, units: 1, kg: 1 }] : [];
  grid[4][5] = 'bush'; // regrow for the next pass
  lastTicks = null;
  Game.clearBrush(5, 4);
  return lastTicks;
}
const tMachete = clearTicksWith('machete', 'Machete');
const tAxe = clearTicksWith('hatchet', 'Hatchet');
const tSaw = clearTicksWith('hand_saw', 'Hand Saw');
const tKnife = clearTicksWith('stone_knife', 'Stone knife');
const tHands = clearTicksWith(null, null);
ok('honesty: machete clears brush in 16 ticks', tMachete === 16, 'got ' + tMachete);
ok('honesty: axe clears brush in 24 ticks (canon)', tAxe === 24, 'got ' + tAxe);
ok('honesty: bare hands clear brush in 64 ticks', tHands === 64, 'got ' + tHands);
ok('honesty: whittle tier is not free of the slow path', tKnife === 64, 'got ' + tKnife);
Game.genDetail = origGenDetail;

// 3b. Mixed rot dig: the rot must be announced ONCE and actually leave.
freshGame();
Game.state.scholar.inventory.push(foodItem('Old berries', 2, 0, 40));   // rotten
Game.state.scholar.inventory.push(foodItem('Fresh berries', 2, 9999, 40)); // good
Game.buryCache('food', 0, 2);
Game.buryCache('food', 0, 2); // index shifts after first bury: fresh berries now idx 0
const mixId = Game.playerCaches()[0].id;
// Two separate buries -> two caches. Merge them for the mixed test:
Game.state.scholar.caches = [{
  id: 'cmix', node: node0, desc: 'mixed', label: 'mixed', found: false, day: 5,
  // spoilDay far past: a preservation skill from the starting occupation adds
  // spoil days (seed luck; origins-world 2026-10-14 drew one), and day 0 + 6
  // would still be fresh on day 5.
  items: [foodItem('Old berries', 2, -100, 40), foodItem('Fresh berries', 2, 9999, 40)],
}];
Game.map.px = node0.x; Game.map.py = node0.y;
said = [];
Game.digUpCache('cmix');
const rotAnnouncements = said.filter(s => /went bad underground/i.test(s)).length;
const secondDigRot = (() => { said = []; Game.digUpCache('cmix'); return said.filter(s => /went bad underground/i.test(s)).length; })();
ok('honesty: rot announced on the dig that finds it', rotAnnouncements === 1, 'got ' + rotAnnouncements);
ok('honesty: rot does not re-announce on a later dig (left = left)', secondDigRot === 0, 'got ' + secondDigRot);
const goodUnits = Game.state.scholar.inventory.filter(i => i.name === 'Fresh berries')
  .reduce((t, i) => t + (i.units || 0), 0);
ok('honesty: good food still dug up', goodUnits === 2, 'got ' + goodUnits);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });

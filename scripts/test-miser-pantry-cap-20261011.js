// MISER BREAK-IT 2026-10-11 — pantry cap bypass + cache save/load.
//
// THREE ATTACKS:
//  1. EXPLOIT: the Donate button (donateToPantry) is a pantry writer like any
//     other — but it pushes directly into v.pantry, bypassing pantryAdd, the
//     documented cap choke point. The break-it food r5 wave gated every other
//     writer (homecoming haul, putAwayFinished, stockSurplus, pantryAdd
//     itself) — donateToPantry was missed. A miser with a full pantry can
//     donate without limit: infinite stash, granary spoilage bonus on
//     unlimited food, "Expand storage" rendered pointless.
//  2. SOFTLOCK: bury a cache, Game.save(), Game.load() — the buried goods
//     must survive the round trip (no item limbo), and digUpCache must still
//     return them.
//  3. HONESTY: donating onto an existing stack when the pantry is nearly
//     full must not merge past the cap either; a refused donation must leave
//     the food in the pack and say so honestly.
// Usage: node scripts/test-miser-pantry-cap-20261011.js
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

// SEED BEFORE EVAL (AGENTS.md 2026-10-08): modules capture Math.random at load.
let _s = Number(process.env.SEED || 0xC10C);
function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
Math.random = mulberry32(_s);

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
global.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
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
  Game.state.village.pantry = [];
  try { Game.map.px = Game.state.village.px ?? 4; Game.map.py = Game.state.village.py ?? 4; } catch (e) {}
}
let said = [];
const origSay = Game.say;
Game.say = function (t) { said.push(String(t)); try { return origSay.call(this, t); } catch (e) {} };
function clearSaid() { said = []; }

function foodItem(name, units, spoilDay, kcalEach) {
  return { name, units, kcalEach: kcalEach || 100, spoilDay, kg: 0.3, safe: true,
    diseaseRisk: null, poisonRisk: null, parasiteRisk: null, foodState: 'cooked' };
}

// Fill the pantry to the cap through the cap-ENFORCING writer (pantryAdd).
function fillToCap() {
  const cap = Game.pantryCapKcal();
  let n = 0;
  while (Game.pantryKcalLive(Game.state.village) + 5000 <= cap) {
    ok; // no-op guard
    const added = Game.pantryAdd(foodItem('Smoked meat', 10, 99, 500));
    if (!added) break;
    if (++n > 100) break;
  }
  return cap;
}

// ---- ATTACK 1: donate past a full pantry ----
freshGame();
const cap = fillToCap();
const before = Game.pantryKcalLive(Game.state.village);
ok('setup: pantry at cap via pantryAdd', before <= cap && before > cap - 10000, `pantry=${before} cap=${cap}`);
Game.state.scholar.inventory = [foodItem('Smoked meat', 20, 99, 500)]; // 10,000 kcal
clearSaid();
Game.donateToPantry(0);
const after = Game.pantryKcalLive(Game.state.village);
ok('ATTACK1 held: donate past cap refused, pantry unchanged', after <= cap, `pantry=${after} cap=${cap} (was ${before})`);
ok('ATTACK1 held: food stays in pack', Game.state.scholar.inventory.length === 1, `pack=${Game.state.scholar.inventory.length}`);
ok('ATTACK1 held: refusal is honest', said.some(s => /full/i.test(s) && /pantry/i.test(s)), said.slice(-2).join(' | '));

// ---- ATTACK 1b: merge onto an existing stack past the cap ----
// (pantry full of 'Smoked meat'; donating more of the SAME item merges.)
freshGame();
fillToCap();
Game.state.scholar.inventory = [foodItem('Smoked meat', 5, 99, 500)];
clearSaid();
Game.donateToPantry(0);
const afterB = Game.pantryKcalLive(Game.state.village);
ok('ATTACK1b held: merge-donation past cap refused', afterB <= cap, `pantry=${afterB} cap=${cap}`);

// ---- HONESTY/REGRESSION: donation with room still works ----
freshGame();
Game.state.scholar.inventory = [foodItem('Dried berries', 10, 99, 200)]; // 2000 kcal
clearSaid();
Game.donateToPantry(0);
ok('donation with room lands in pantry', Game.state.village.pantry.length === 1 && Game.pantryKcalLive(Game.state.village) === 2000,
  `pantry=${JSON.stringify(Game.state.village.pantry.map(p=>p.units))}`);
ok('donation with room leaves the pack', Game.state.scholar.inventory.length === 0);
ok('donation with room says what happened', said.some(s => /Donated/i.test(s)), said.join(' | '));

// ---- ATTACK 2: buried cache survives save/load (no item limbo) ----
freshGame();
Game.state.scholar.inventory = [foodItem('Dried berries', 8, 99, 200)];
clearSaid();
Game.buryCache('food', 0, 8);
const cachesBefore = Game.playerCaches().length;
ok('setup: cache buried', cachesBefore === 1 && Game.state.scholar.inventory.length === 0);
const descBefore = Game.playerCaches()[0].desc;
const saveRes = Game.save();
ok('save reports success', saveRes === true || saveRes === undefined, `save returned ${saveRes}`);
const runKey = Game.state.runKey;
Game.state.scholar.caches = []; // simulate a fresh in-memory state, as load would replace
const loaded = Game.load(runKey);
ok('save/load round trip succeeds', !!loaded, `load returned ${loaded}`);
const cachesAfter = Game.playerCaches().length;
ok('ATTACK2 held: cache survives save/load', cachesAfter === 1, `caches after load=${cachesAfter}`);
ok('ATTACK2 held: cache contents intact', cachesAfter === 1 && (Game.playerCaches()[0].items[0].units || 0) === 8 && Game.playerCaches()[0].desc === descBefore,
  cachesAfter ? JSON.stringify(Game.playerCaches()[0].items[0]) : 'no cache');
// and it can still be dug up — goods retrievable, not stranded
clearSaid();
Game.digUpCache(Game.playerCaches()[0].id);
const packKcal = Game.state.scholar.inventory.reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
ok('ATTACK2 held: buried food retrievable after load', packKcal === 1600, `pack kcal=${packKcal}`);
ok('ATTACK2 held: cache consumed on dig', Game.playerCaches().length === 0);

// ---- ATTACK 3: the ledger under-reports multi-unit section traffic ----
// donateTool/_depositStashedItem/takeTool/_takeStashedItem used to log every
// give/take as 1× while the entry kept its real unit count — the village's
// social memory counted wrong. Donate a 3-stack, take it back, read the ledger.
freshGame();
Game.state.scholar.inventory = [{ itemId: 'multitool', name: 'Multitool', units: 3, kcalEach: 0, kg: 0.24 }];
Game.donateTool(0);
const toolEntry = Game.stashState().tools.find(t => t.itemId === 'multitool');
ok('setup: multi-unit tool donated whole', !!toolEntry && toolEntry.units === 3, JSON.stringify(toolEntry));
let ledgerTxt = Game.stashLedgerText(5);
ok('ATTACK3 held: ledger records the real give count', /left 3× Multitool/.test(ledgerTxt), `ledger="${ledgerTxt.split('\n')[0]}"`);
Game.takeTool('multitool');
ledgerTxt = Game.stashLedgerText(5);
ok('ATTACK3 held: ledger records the real take count', /took 3× Multitool/.test(ledgerTxt), `ledger="${ledgerTxt.split('\n')[0]}"`);
const backInPack = Game.state.scholar.inventory.find(i => (i.itemId || i.id) === 'multitool');
ok('ATTACK3 held: all 3 units return to the pack', !!backInPack && backInPack.units === 3, JSON.stringify(backInPack));

console.log(`\n${pass} passed, ${fail} failed (SEED=${(_s >>> 0).toString(16)})`);
process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });

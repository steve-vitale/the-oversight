// PROOF: contest grantWeapon must teach gear recipe L1 (backlog #698, run fleshout-20261020T1915Z).
// CANON: docs/CANON.md — GEAR RECIPE DISCOVERY (Steve 2026-10-09): handling a
// gear item with a recipe (equipping it, looting it from a corpse) teaches L1.
// DESIGN CALL (2026-10-20): contest grants ARE real grants ("yours to keep,"
// Steve 2026-10-08) and the contestChoose grantWeapon block equips directly —
// so it must call the canonical hook, exactly like the game.js equip path.
// BUG (sim-spearfund arm, run fleshout-20261020T1215Z): contestChoose wrote
// s2.equipped[wslot] directly and never called noteGearHandled — a
// contest-granted spear taught recipe L0.
// FIX: src/js/contests.js, contestChoose d.grantWeapon block — call
//   try { this.noteGearHandled(def.id); } catch (e) {}
// after the direct equip (same shape as game.js equip path).
// Usage: node scripts/test-contestgrant-20261020.js
// Expect: RED on pre-fix code (recipe L0), GREEN after the fix (L1).
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = 20261020;

// ---------- data preload ----------
const PAIRS = [
  ['plants.json', 'plants'], ['biomes.json', 'biomes'], ['monsters.json', 'monsters'],
  ['villagers.json', 'villagers'], ['abilities.json', 'abilities'], ['items.json', 'items'],
  ['background_survivors.json', 'background_survivors'], ['cell_defs.json', 'cellDefs'],
  ['animals.json', 'animals'], ['recipes.json', 'recipes'], ['books.json', 'books'],
  ['relicEnhancements.json', 'relicEnhancements'], ['locations.json', 'locations'],
  ['characterGen.json', 'characterGen'], ['synergies.json', 'synergies'],
  ['knowledge.json', 'knowledge'], ['nameCultures.json', 'nameCultures'],
  ['originPicker.json', 'originPicker'], ['foreignSpeech.json', 'foreignSpeech'],
  ['lifeseeds.json', 'lifeseeds'], ['arrivalText.json', 'arrivalText'],
  ['justiceVoice.json', 'justiceVoice'], ['alienPlayers.json', 'alienPlayers'],
  ['regions.json', 'regions'],
  ['monsterBehaviors.json', 'monsterBehaviors'], ['contests.json', 'contests'],
  ['events.json', 'events'], ['statusEffects.json', 'statusEffects'], ['cooking.json', 'cooking'],
];
global.SCATTER_DATA = {};
for (const [f, key] of PAIRS) {
  try { global.SCATTER_DATA[key] = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data', f), 'utf8')); }
  catch (e) {}
}

// ---------- seeded RNG BEFORE eval ----------
function mulberry32(a) {
  return function() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let _rng = mulberry32(SEED);
function rng() { return _rng(); }
rng.reset = (s) => { _rng = mulberry32(s); };
Math.random = rng;

// ---------- eval FULL script list, minus DOM-only ----------
global.window = global;
const LIST = ['engine/state.js', 'engine/modifiers.js', 'engine/calories.js', 'engine/day.js',
  'engine/forage.js', 'engine/combat.js', 'game.js', 'encounters.js', 'conversation.js',
  'convo-mood.js', 'convoTopics.js', 'convo-wants.js', 'convo-dialogue.js', 'convo-beats.js',
  'convo-scene.js', 'examine.js', 'equipment.js', 'journal.js', 'party.js', 'party-formal.js',
  'truth.js', 'contests.js', 'contestEngine.js', 'alienPlayers.js', 'storage.js', 'perceive.js',
  'carexplore.js', 'justice.js', 'food.js', 'betrayal.js', 'corpses.js', 'lifeseed.js',
  'progression.js', 'ledger.js', 'abilityActions.js', 'monsterBehaviors.js', 'statusEffects.js',
  'villager-agency.js', 'fieldFights.js', 'villager-objectives.js', 'codex-people.js',
  'membership.js', 'hierarchy.js', 'debug-scenarios.js', 'build.js'];
for (const f of LIST) {
  try { eval(fs.readFileSync(path.join(ROOT, 'src/js', f), 'utf8')); }
  catch (e) { console.error('EVAL FAIL ' + f + ': ' + e.message); process.exit(2); }
}
delete global.window;
const Game = globalThis.Scattering.Game;
Game.data = global.SCATTER_DATA;

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
function sec(t) { console.log('\n### ' + t); }
function freshGame() {
  rng.reset(SEED);
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const s = Game.state.scholar;
  s.day = 30; Game.state.systemArrived = true;
  s.health = 100; s.kcal = 2000; s.trauma = 0;
  Game.state.over = false;
  Game.state.activeContest = null;
}
function recipeLevel(id) {
  const r = ((Game.state.codex || {}).recipes || {})[id] || {};
  return r.level || 0;
}
function grantFixture(itemId, noteText) {
  Game.state.activeContest = {
    phaseIdx: 0, contestId: 'fixture-grant', kind: 'show',
    phases: [{ choices: [{ label: 'Take it', do: { grantWeapon: itemId, note: noteText || ('You take the ' + itemId + '.') } }] }],
  };
  Game.state.activeContest.phase = 'playing';
  return Game.contestChoose(0);
}

// ================= RED: contest grant teaches L0 =================
sec('FIXTURE 1 — contest grant of hunting_spear must teach recipe L1');
{
  freshGame();
  ok('pre: spear recipe unknown', recipeLevel('hunting_spear') === 0, 'level=' + recipeLevel('hunting_spear'));
  grantFixture('hunting_spear');
  const s = Game.state.scholar;
  const eq = Object.values(s.equipped || {});
  ok('grant equips the spear (sanity)', eq.some(e => e && e.itemId === 'hunting_spear'));
  ok('grant teaches spear recipe L1', recipeLevel('hunting_spear') >= 1, 'level=' + recipeLevel('hunting_spear'));
  const rec = ((Game.state.codex || {}).recipes || {})['hunting_spear'] || {};
  ok('taught as discovery (not free L2+)', rec.via === 'discovery', 'via=' + rec.via);
}

sec('FIXTURE 2 — contest grant of stone_knife must teach recipe L1 (all grant sites flow through one block)');
{
  freshGame();
  Game.state.codex.recipes = {}; // stone_knife starts L3 in a fresh game; clear to isolate the grant teach
  ok('pre: knife recipe unknown', recipeLevel('stone_knife') === 0, 'level=' + recipeLevel('stone_knife'));
  grantFixture('stone_knife');
  ok('grant teaches knife recipe L1', recipeLevel('stone_knife') >= 1, 'level=' + recipeLevel('stone_knife'));
}

sec('FIXTURE 3 — no downgrade: re-grant at L2+ stays L2+');
{
  freshGame();
  Game.learnRecipe('hunting_spear', 2);
  ok('pre: spear recipe L2', recipeLevel('hunting_spear') === 2);
  grantFixture('hunting_spear');
  ok('re-grant keeps L2 (no downgrade)', recipeLevel('hunting_spear') === 2, 'level=' + recipeLevel('hunting_spear'));
}

sec('FIXTURE 4 — sense check: grant beat fires once, no doubled beats');
{
  freshGame();
  const said = [];
  const orig = Game.sysSay;
  Game.sysSay = function(t) { said.push(String(t)); };
  grantFixture('hunting_spear', 'You take a spear. Three waves. No rest.');
  Game.sysSay = orig;
  const beats = said.filter(t => /spear/i.test(t));
  ok('exactly one spear-take beat', beats.length === 1, 'beats=' + JSON.stringify(beats));
}

console.log('\nRESULT ' + pass + ' pass, ' + fail + ' fail');
process.exit(fail ? 1 : 0);

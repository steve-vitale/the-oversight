// test-table-deferral-epilogue-20261014.js — journey-endgame r11 blank.
// A table finale resolved before day 90 voices the full win epilogue
// ("You won. Say it plainly: you won.") and THEN the win-day-floor deferral
// ("Ninety days... come back") — the epilogue claims a win the table has not
// granted. The epilogue must be deferral-aware: frame the ending as written,
// not yet won — and the real win at 90+ must still say it plainly.
// Usage: node scripts/test-table-deferral-epilogue-20261014.js [SEED] (x3 seeds)
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || process.argv[2] || '84001', 10);

const PAIRS = [
  ['plants.json', 'plants'], ['biomes.json', 'biomes'], ['monsters.json', 'monsters'],
  ['villagers.json', 'villagers'], ['abilities.json', 'abilities'], ['items.json', 'items'],
  ['background_survivors.json', 'background_survivors'], ['cell_defs.json', 'cellDefs'],
  ['animals.json', 'animals'], ['recipes.json', 'recipes'], ['books.json', 'books'],
  ['relicEnhancements.json', 'relicEnhancements'], ['locations.json', 'locations'],
  ['characterGen.json', 'characterGen'], ['knowledge.json', 'knowledge'],
  ['nameCultures.json', 'nameCultures'], ['originPicker.json', 'originPicker'],
  ['foreignSpeech.json', 'foreignSpeech'], ['lifeseeds.json', 'lifeseeds'],
  ['arrivalText.json', 'arrivalText'], ['justiceVoice.json', 'justiceVoice'],
  ['alienPlayers.json', 'alienPlayers'], ['regions.json', 'regions'],
  ['dramaEffects.json', 'dramaEffects'], ['monsterBehaviors.json', 'monsterBehaviors'],
  ['contests.json', 'contests'], ['events.json', 'events'],
  ['statusEffects.json', 'statusEffects'], ['cooking.json', 'cooking'],
];
global.SCATTER_DATA = {};
for (const [f, key] of PAIRS) {
  try { global.SCATTER_DATA[key] = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data', f), 'utf8')); }
  catch (e) { global.SCATTER_DATA[key] = (key === 'contests' || key === 'items' || key === 'monsters') ? [] : {}; }
}
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

global.window = global;
const LIST = ['engine/state.js', 'engine/modifiers.js', 'engine/calories.js', 'engine/day.js',
  'engine/forage.js', 'engine/combat.js', 'game.js', 'encounters.js', 'conversation.js',
  'convo-mood.js', 'convoTopics.js', 'convo-wants.js', 'convo-dialogue.js', 'convo-beats.js',
  'convo-scene.js', 'voice-piper.js', 'examine.js', 'equipment.js', 'journal.js', 'party.js',
  'party-formal.js', 'truth.js', 'galactic-cast.js', 'contests.js', 'broadcast.js',
  'contestEngine.js', 'alienPlayers.js', 'storage.js', 'perceive.js', 'carexplore.js',
  'justice.js', 'food.js', 'betrayal.js', 'corpses.js', 'corruption.js', 'lifeseed.js',
  'progression.js', 'ledger.js', 'abilityActions.js', 'monsterBehaviors.js',
  'statusEffects.js', 'villager-agency.js', 'fieldFights.js', 'villager-objectives.js',
  'codex-people.js', 'membership.js', 'hierarchy.js', 'comms.js', 'table.js', 'pods.js',
  'table-feared.js', 'table-beloved.js', 'table-witness.js',
  'debug-scenarios.js', 'build.js'];
for (const f of LIST) {
  try { eval(fs.readFileSync(path.join(ROOT, 'src/js', f), 'utf8')); }
  catch (e) { console.error('EVAL FAIL ' + f + ': ' + e.message); process.exit(2); }
}
delete global.window;
const Game = globalThis.Scattering.Game;
Game.data = global.SCATTER_DATA;

let pass = 0, fail = 0;
const failures = [];
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; failures.push(name); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

const said = [];
function freshState(day) {
  rng.reset(SEED);
  Game.state = {
    scholar: { day: day, id: 'scholar1', name: 'Amina Diallo' },
    village: { day: day, pantryKcal: 20000, takenPromises: {}, trust: {} },
    systemArrived: true,
    systemFavorsOwed: 0,
  };
  Game.data.villagers = [
    { id: 'scholar1', name: 'Amina Diallo', gender: 'f' },
    { id: 'v1', name: 'Tom', gender: 'm' },
  ];
  Game.villagerId = 'scholar1';
  said.length = 0;
  Game.say = (t) => { said.push(String(t)); };
  Game.sysSay = (t) => { said.push('[sys] ' + String(t)); };
  Game.won = false; Game.over = false;
}

function runFinale(day) {
  freshState(day);
  // the sting needs pod history: a shrugged intrusion, light branch.
  Game.podRemember('shrugged', { intrusion: 'camera' });
  const T = Game.tableState();
  T.phase = 'finals'; T.path = 'feared'; T.branch = 'light'; T.beat = 3;
  Game.tableResolveFinal('final:mercy');
  return { text: said.join('\n'), T };
}

// ---------- A. pre-90 finale: the contradiction ----------
console.log('\n### A. finale at day 80 (< 90 floor)');
{
  const { text, T } = runFinale(80);
  ok('win is deferred, not granted', T.winDeferred === true && !Game.won, 'winDeferred=' + T.winDeferred + ' won=' + Game.won);
  ok('deferral beat still speaks', /THE TABLE WAITS/.test(text));
  const claimed = /Say it plainly: you won/.test(text);
  ok('epilogue does NOT claim the win before the floor', !claimed, claimed ? 'contradiction present' : '');
  ok('deferred framing is voiced', /not yet|waits on time|ninety dawns/i.test(text), 'no deferral-aware epilogue line');
  ok('pods sting still lands', /still napping/.test(text) && /looking away/.test(text));
}

// ---------- B. post-90 finale: the real win unchanged ----------
console.log('\n### B. finale at day 120 (>= 90 floor)');
{
  const { text, T } = runFinale(120);
  ok('win granted', Game.won === true && T.phase === 'done', 'won=' + Game.won + ' phase=' + T.phase);
  ok('real win still says it plainly', /Say it plainly: you won/.test(text));
  ok('pods sting still lands', /still napping/.test(text) && /looking away/.test(text));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (failures.length) { console.log('failures:'); failures.forEach(f => console.log('  - ' + f)); }
process.exit(fail ? 1 : 0);

// test-table-opener-20261014.js — journey-endgame r11 blank #2.
// The village must acknowledge the table: while it sits unanswered (or
// during the win-day-floor deferral), and once after it resolves,
// villagers open with it — ahead of secrets and small talk, once per
// villager per sitting. The 'table' thread id must label as 'the table'
// in resume/recap lines (never the raw tid).
// Usage: node scripts/test-table-opener-20261014.js [SEED] (x3 seeds)
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || process.argv[2] || '84011', 10);

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
function freshState() {
  rng.reset(SEED);
  Game.state = {
    scholar: { day: 70, id: 'scholar1', name: 'Amina Diallo' },
    village: { day: 70, pantryKcal: 20000, takenPromises: {}, trust: { v1: 50 }, conv: {} },
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
  // table sitting #1, in progress
  const pg = Game.progState();
  pg.tableSittingId = 1; pg.tableWaiting = true; pg.tableDone = true;
  const T = Game.tableState();
  T.phase = 'paths'; T.seat = 'lesser'; T.winDeferred = false;
}
function tableStateFor(mode) {
  // mode: 'waiting' | 'deferred' | 'resolved' | 'never'
  const pg = Game.progState();
  const T = Game.tableState();
  delete pg.tableSittingId; delete pg.tableWaiting; delete pg.tableDone;
  delete T.phase; delete T.winDeferred; delete T.seat;
  if (mode === 'never') return;
  pg.tableSittingId = 1;
  if (mode === 'waiting') { pg.tableWaiting = true; pg.tableDone = true; T.phase = 'paths'; }
  if (mode === 'deferred') { pg.tableWaiting = true; pg.tableDone = false; T.phase = 'paths'; T.winDeferred = true; }
  if (mode === 'resolved') { pg.tableWaiting = false; pg.tableDone = true; T.phase = 'done'; }
}

// ---------- A. no sitting: hook stays silent ----------
console.log('\n### A. table never sat');
{
  freshState(); tableStateFor('never');
  ok('opener null when the table never sat', Game.convoTableOpener('v1') === null);
  ok('sitting predicate false', Game.convoTableSitting() === false);
}

// ---------- B. waiting: opener fires, once ----------
console.log('\n### B. table waiting');
{
  freshState(); tableStateFor('waiting');
  ok('sitting predicate true', Game.convoTableSitting() === true);
  const o1 = Game.convoTableOpener('v1');
  ok('opener fires', !!o1 && !!o1.line, JSON.stringify(o1));
  ok('thread is table', o1 && o1.thread === 'table');
  ok('line mentions the table', o1 && /table|ring|sky is waiting/i.test(o1.line));
  const o2 = Game.convoTableOpener('v1');
  ok('once per villager per sitting', o2 === null);
}

// ---------- C. deferral: deferral-aware line ----------
console.log('\n### C. win-day-floor deferral');
{
  freshState(); tableStateFor('deferred');
  const o = Game.convoTableOpener('v1');
  ok('opener fires in deferral', !!o && !!o.line);
  ok('deferral line names the wait', o && /ninety dawns|waiting on the days/i.test(o.line), o && o.line);
  ok('no premature win claim', o && !/you won/i.test(o.line));
}

// ---------- D. resolved: one remark, then silence ----------
console.log('\n### D. table resolved');
{
  freshState(); tableStateFor('resolved');
  const o1 = Game.convoTableOpener('v1');
  ok('opener fires once after resolution', !!o1 && /light|done|meant something/i.test(o1.line), o1 && o1.line);
  ok('second call silent', Game.convoTableOpener('v1') === null);
}

// ---------- E. thread label never leaks the tid ----------
console.log('\n### E. topic label');
{
  freshState();
  const label = Game.convoTopicLabel('v1', 'table');
  ok("label is 'the table'", label === 'the table', label);
  ok('no raw tid in label', !/\btable\b/.test(label) || label === 'the table');
}

console.log(`\n${pass} passed, ${fail} failed`);
if (failures.length) { console.log('failures:'); failures.forEach(f => console.log('  - ' + f)); }
process.exit(fail ? 1 : 0);

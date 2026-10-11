// GALACTIC CAST proof (2026-10-11) — src/js/galactic-cast.js + show/contest hooks.
// Registry starts all stage 0; show sponsor cards advance 0→1; signed producer
// notes advance toward 2; stage-0 names NEVER leak; cooldowns hold; stages monotonic.
// Usage: node scripts/test-galactic-cast.js [SEED] — run x3 seeds.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || process.argv[2] || '777001', 10);

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
  'codex-people.js', 'membership.js', 'hierarchy.js', 'debug-scenarios.js', 'build.js'];
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

const PIDS = ['vex_marlowe', 'countess_sable', 'sarge', 'dr_fenwick', 'pip_quindle'];
const NAMES = ['Vex Marlowe', 'Countess Sable', 'Sarge', 'Dr. Fenwick', 'Pip Quindle',
  'Marlowe', 'Sable', 'Fenwick', 'Quindle'];
function leaksName(text) {
  return NAMES.some(n => String(text).includes(n));
}

function freshState(day) {
  rng.reset(SEED);
  Game.state = { scholar: { day: day || 1 }, village: {} };
  delete Game.state.gcast;
}

sec('registry starts at stage 0 for all five');
freshState(1);
ok('five personae registered', (Game.CAST_PERSONAS || []).length === 5);
ok('all stage 0', PIDS.every(p => Game.castStage(p) === 0));
ok('castKnows false at 0', PIDS.every(p => !Game.castKnows(p)));
ok('displayName generic at 0', PIDS.every(p => Game.castDisplayName(p) === 'a sponsor'));
ok('custom generic respected', Game.castDisplayName('vex_marlowe', 'the producers') === 'the producers');

sec('show sponsor card: 0 -> 1 on domain match');
freshState(10);
// Force the chance gate: run many trials on vex's domain show; at least one must fire.
let fired = null, trials = 0;
for (let i = 0; i < 60 && !fired; i++) { trials++; fired = Game.castShowSponsor('stare_down'); }
ok('sponsor card fires on domain show', !!fired, 'trials=' + trials);
ok('sponsor card names a persona', fired && leaksName(fired));
const st1 = Game.castState();
const advanced1 = PIDS.filter(p => Game.castStage(p) === 1);
ok('exactly one persona advanced to 1', advanced1.length === 1, JSON.stringify(advanced1));
ok('met_on_show flag set', !!((st1.flags[advanced1[0]] || {}).met_on_show));
ok('cooldown set', (st1.cooldowns[advanced1[0]] || 0) === 10);

sec('cooldown holds: same persona cannot fire twice in 5 days');
freshState(10);
Game.advanceCastStage('vex_marlowe', 1, 'test');
Game.castState().cooldowns['vex_marlowe'] = 10; // just fired
let vexFired = false;
for (let i = 0; i < 60; i++) {
  const line = Game.castShowSponsor('stare_down');
  if (line && line.includes('Vex Marlowe')) { vexFired = true; break; }
}
ok('vex on cooldown stays silent', !vexFired);

sec('non-domain show never fires a card');
freshState(10);
let anyFire = false;
for (let i = 0; i < 60; i++) { if (Game.castShowSponsor('grudge_pudding')) { anyFire = true; break; } }
ok('no card for off-domain show', !anyFire);

sec('producer demand: unsigned at stage 0, signed at stage >= 1');
freshState(20);
let unsigned = Game.castProducerDemand();
ok('stage-0 demand unsigned', unsigned && !unsigned.pid && unsigned.line.includes('producers') && !leaksName(unsigned.line));
Game.advanceCastStage('countess_sable', 1, 'test');
Game.castState().cooldowns['countess_sable'] = -999;
let signed = null;
for (let i = 0; i < 60 && !signed; i++) { const d = Game.castProducerDemand(); if (d.pid) signed = d; }
ok('signed demand issued', !!signed, JSON.stringify(signed && signed.pid));
ok('signed demand carries sign-off', signed && /—/.test(signed.line));
ok('signed note advances toward stage 2', signed && Game.castStage(signed.pid) === 2);
ok('interfered_contest flag set', signed && !!((Game.castState().flags[signed.pid] || {}).interfered_contest));

sec('castSignOff never leaks stage-0 names');
freshState(30);
let leak = false;
for (let i = 0; i < 100; i++) { if (leaksName(Game.castSignOff())) { leak = true; break; } }
ok('empty sign-off when nobody known', !leak && Game.castSignOff() === '');
Game.advanceCastStage('sarge', 2, 'test');
Game.castState().cooldowns['sarge'] = -999;
const so = Game.castSignOff();
ok('sign-off names known persona', so.includes('Sarge'));

sec('stages are monotonic');
freshState(40);
Game.advanceCastStage('dr_fenwick', 3, 'test-followup');
Game.advanceCastStage('dr_fenwick', 1, 'should-not-lower');
ok('stage never decreases', Game.castStage('dr_fenwick') === 3);

sec('show/contest paths never set stages 3+');
freshState(50);
for (let i = 0; i < 200; i++) { Game.castShowSponsor('karaoke'); Game.castProducerDemand(); }
const maxStage = Math.max.apply(null, PIDS.map(p => Game.castStage(p)));
ok('max stage reachable via show/contest is 2', maxStage <= 2, 'max=' + maxStage);

sec('displayName resolves real name once heard');
freshState(60);
Game.advanceCastStage('pip_quindle', 1, 'test');
ok('name shown at stage 1', Game.castDisplayName('pip_quindle') === 'Pip Quindle');

console.log('\n==== RESULT: ' + pass + ' pass, ' + fail + ' fail ====');
process.exit(fail ? 1 : 0);

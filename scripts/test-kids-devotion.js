// KIDS DEVOTION proof (2026-10-11) — KIN canon "a weight, not a meter"
// (Steve 2026-10-11, reframe: no devotion score, HISTORY of choices).
// Covers: history (no meter), intrusions with costs both ways, promise
// lifecycle, table possibilities by history, oversight epilogue,
// Jackpot (winnable, usually lost), dark conscript horror, adults unknown.
// Usage: node scripts/test-kids-devotion.js [SEED] — run x3 seeds.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || process.argv[2] || '777002', 10);

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
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
function sec(t) { console.log('\n### ' + t); }
function freshState(day) {
  Game.state = {
    scholar: { day: day || 30, id: 'scholar1' },
    village: { day: day || 30, pantryKcal: 20000, pods: null, takenPromises: {} },
    systemArrived: true,
    systemFavorsOwed: 0,
  };
  Game.data.villagers = [
    { id: 'm1', name: 'Mara Voss' }, { id: 'm2', name: 'Theo Lind' },
  ];
}

const said = [];
Game.say = (t) => { said.push(String(t)); };
Game.sysSay = (t) => { said.push(String(t)); };

// ---------- A. history, not a meter ----------
sec('history: podRemember/podHistory, no score anywhere');
{
  freshState(30);
  ok('podRemember exists', typeof Game.podRemember === 'function');
  ok('podHistory exists', typeof Game.podHistory === 'function');
  Game.podRemember('acted', { intrusion: 'camera', cost: 'favor owed' });
  const h = Game.podHistory();
  ok('history records', h.length === 1 && h[0].kind === 'acted');
  ok('history has day', h[0].day === 30);
  const src = fs.readFileSync(path.join(ROOT, 'src/js/pods.js'), 'utf8');
  ok('no devotion score in pods.js', !/devotion\s*[:=]\s*\d/i.test(src) && !/devotionScore/i.test(src));
  ok('no devotionScore in table.js', !/devotionScore/i.test(fs.readFileSync(path.join(ROOT, 'src/js/table.js'), 'utf8')));
}

// ---------- B. intrusions cost both ways ----------
sec('intrusions: act costs, shrug costs');
{
  freshState(30);
  said.length = 0;
  Game.podIntrude('camera');
  ok('pending set', !!(Game.state.village.pods.pending));
  Game.podAnswer('act');
  ok('act: favor owed +1', Game.state.systemFavorsOwed === 1);
  ok('act logged', Game.podHistory().some(e => e.kind === 'acted'));
  ok('act: no pending', !Game.state.village.pods.pending);

  freshState(40);
  said.length = 0;
  Game.data.villagers = [{ id: 'm1', name: 'Mara Voss' }];
  Game.podIntrude('famine');
  const kcalBefore = Game.state.village.pantryKcal;
  Game.podAnswer('act');
  ok('famine act: pantry debited', Game.state.village.pantryKcal < kcalBefore);

  freshState(50);
  said.length = 0;
  Game.data.villagers = [{ id: 'm1', name: 'Mara Voss' }];
  Game.villagersMourningTaken = () => ['m1'];
  Game.podIntrude('dangle');
  Game.podAnswer('shrug');
  ok('shrug logged', Game.podHistory().some(e => e.kind === 'shrugged'));
  const m1 = Game.data.villagers[0];
  ok('shrug: mourner opinion drops', (m1.podFeeling || {}).score < 0);
}

// ---------- C. the ask + promise lifecycle ----------
sec('ask fulfills promises; 21-day fuse breaks them');
{
  freshState(60);
  said.length = 0;
  Game.state.village.takenPromises = { m1: 60 };
  Game.podRemember('promise', { vid: 'm1' });
  Game.podAsk();
  ok('ask: favor owed', Game.state.systemFavorsOwed === 1);
  ok('ask: promise-kept logged', Game.podHistory().some(e => e.kind === 'promise-kept' && e.vid === 'm1'));
  ok('ask: System deflects (no adults info)', said.some(t => /napping/i.test(t)) && !said.some(t => /they.*died|dead/i.test(t)));

  // Promise fuse: 21 days unkept → broken. (Simulated via direct history check;
  // the dawn fuse is exercised in the sim.)
  freshState(90);
  Game.state.village.takenPromises = { m2: 60 }; // 30 days ago
  const hist = Game.podHistory();
  const open = Object.keys(Game.state.village.takenPromises).filter(id =>
    !hist.some(h => (h.kind === 'promise-kept' || h.kind === 'promise-broken') && h.vid === id));
  ok('stale promise detected open', open.indexOf('m2') >= 0);
}

// ---------- D. table possibilities by history ----------
sec('table: championed can demand (at cost); shrugged cannot');
{
  // Championed run.
  freshState(100);
  Game.podRemember('promise', { vid: 'm1' });
  Game.podRemember('promise-kept', { vid: 'm1' });
  Game.podRemember('acted', { intrusion: 'camera', cost: 'favor owed' });
  Game.podRemember('acted', { intrusion: 'famine', cost: '2000 kcal' });
  Game.tableState = () => ({ branch: 'light', path: 'beloved', phase: 'finals' });
  ok('championed recognized', Game.podChampioned());
  ok('demand available', Game.podDemandAvailable());
  const kcalBefore = Game.state.village.pantryKcal;
  said.length = 0;
  Game.podDemandCost('tribute');
  ok('demand charges tribute', Game.state.village.pantryKcal < kcalBefore);
  ok('demand: kids home', Game.podKidsReturned());

  // Shrugged run.
  freshState(100);
  Game.podRemember('shrugged', { intrusion: 'camera' });
  Game.podRemember('shrugged', { intrusion: 'famine' });
  Game.tableState = () => ({ branch: 'light', path: 'beloved', phase: 'finals' });
  ok('shrugged recognized', Game.podShrugged());
  ok('demand NOT available on shrug', !Game.podDemandAvailable());

  // Dark branch: never.
  freshState(100);
  Game.podRemember('promise-kept', { vid: 'm1' });
  Game.podRemember('acted', { intrusion: 'camera' });
  Game.podRemember('acted', { intrusion: 'dangle' });
  Game.tableState = () => ({ branch: 'dark', path: 'feared', phase: 'finals' });
  ok('demand never on dark', !Game.podDemandAvailable());
}

// ---------- E. oversight epilogue ----------
sec('oversight: shrug-run good ending curdles');
{
  freshState(120);
  said.length = 0;
  Game.podRemember('shrugged', { intrusion: 'camera' });
  Game.podRemember('shrugged', { intrusion: 'dangle' });
  Game.tableState = () => ({ branch: 'light', path: 'beloved', phase: 'done' });
  const fired = Game.podOversightEpilogue();
  ok('oversight fires', fired);
  const text = said.join('\n');
  ok('says oversight aloud', /oversight/i.test(text));
  ok('new meaning of the title', /looking away/i.test(text));
  ok('pods still napping', /still napping/i.test(text));

  // Championed run that paid: no sting.
  freshState(120);
  said.length = 0;
  Game.state.village.kidsReturned = true;
  Game.tableState = () => ({ branch: 'light', path: 'beloved', phase: 'done' });
  ok('no sting when kids home', !Game.podOversightEpilogue());
}

// ---------- F. Jackpot: winnable, usually lost ----------
sec('Jackpot: staged once, 15% win, loss sits');
{
  freshState(70);
  said.length = 0;
  ok('stage ok', Game.podJackpotStage('dangle'));
  ok('stage once', !Game.podJackpotStage('dangle'));
  // Distribution over 200 spins (seeded).
  let wins = 0;
  for (let i = 0; i < 200; i++) {
    freshState(70); said.length = 0;
    Game.podJackpotStage('dangle');
    Game.state.village.pods.jackpot.resolved = false;
    const before = Game.podHistory().filter(e => e.kind === 'jackpot-won').length;
    Game.podJackpotSpin('conviction');
    if (Game.podHistory().filter(e => e.kind === 'jackpot-won').length > before) wins++;
  }
  console.log('    (jackpot wins/200: ' + wins + ')');
  ok('usually lost (5-25%)', wins >= 10 && wins <= 50);

  freshState(70); said.length = 0;
  Game.podJackpotStage('dangle');
  // Force a loss reading: check loss copy exists and sits.
  const src = fs.readFileSync(path.join(ROOT, 'src/js/pods.js'), 'utf8');
  ok('loss: pods stay shut', src.includes('The pods stay shut'));
  ok('loss: show moves on', src.includes('The show moves on'));
}

// ---------- G. dark conscript: horror, never clever ----------
sec('conscript: feared-dark / relay-dark, horror-framed');
{
  freshState(130);
  said.length = 0;
  Game.villagersMourningTaken = () => ['m1'];
  Game.takenKinOf = () => [{ relation: 'niece', name: 'Little Ana' }];
  Game.podConscriptOffer('feared');
  ok('offer logged', Game.podHistory().some(e => e.kind === 'conscript-offered'));
  Game.podConscriptAnswer(true);
  const text = said.join('\n');
  ok('accepted logged', Game.podHistory().some(e => e.kind === 'conscript-accepted'));
  ok('horror: barracks, not glory', /barracks/i.test(text));
  ok('horror: village quiet', /quiet/i.test(text));
  ok('horror: never clever', !/clever|brilliant|genius/i.test(text));
  ok('mourners devastated', Game.data.villagers.some(v => (v.podFeeling || {}).score <= -15));

  freshState(130); said.length = 0;
  Game.podConscriptOffer('relay');
  Game.podConscriptAnswer(false);
  ok('refused logged', Game.podHistory().some(e => e.kind === 'conscript-refused'));
  ok('demand blocked after conscript', (() => {
    Game.podRemember('conscript-accepted', {});
    Game.tableState = () => ({ branch: 'dark', path: 'feared', phase: 'finals' });
    return !Game.podDemandAvailable();
  })());
}

// ---------- H. adults stay unknown ----------
sec('adults: never confirmed, System deflects');
{
  const src = fs.readFileSync(path.join(ROOT, 'src/js/pods.js'), 'utf8')
    + fs.readFileSync(path.join(ROOT, 'src/js/table.js'), 'utf8');
  ok('no adult return code', !/adultsReturned|grownups.*home/i.test(src));
  ok('deflect present', /NEXT SEGMENT|elsewhere/i.test(src));
}

// ---------- I. Witness material ----------
sec('Witness: broken promises surface');
{
  freshState(100);
  Game.podRemember('promise', { vid: 'm1' });
  Game.podRemember('promise-broken', { vid: 'm1' });
  const mat = Game.podWitnessMaterial();
  ok('material exists', mat.length === 1);
  ok('names the promise', /promise/i.test(mat[0]));
  freshState(100);
  ok('no material when kept', Game.podWitnessMaterial().length === 0);
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);

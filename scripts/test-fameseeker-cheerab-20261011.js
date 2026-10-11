// A/B: cheer-everything vs quiet-everything — isolate cheer's favor contribution.
// Counts apClubBoon grants (wacky curios) per strategy over 120 days.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || process.argv[2] || '424242', 10);

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
const LIST = ['engine/state.js', 'engine/modifiers.js', 'engine/combat.js',
  'engine/calories.js', 'engine/day.js', 'engine/forage.js',
  'game.js', 'encounters.js', 'conversation.js', 'convo-mood.js',
  'convoTopics.js', 'convo-wants.js', 'convo-dialogue.js', 'convo-beats.js',
  'convo-scene.js', 'examine.js', 'equipment.js', 'journal.js', 'party.js',
  'party-formal.js', 'truth.js', 'contests.js', 'broadcast.js', 'contestEngine.js',
  'alienPlayers.js', 'storage.js', 'perceive.js', 'carexplore.js', 'justice.js',
  'food.js', 'betrayal.js', 'corpses.js', 'corruption.js', 'lifeseed.js',
  'progression.js', 'waveLedger.js', 'feastBuff.js', 'ledger.js', 'abilityActions.js',
  'monsterBehaviors.js', 'partyTactics.js', 'sigW3a.js', 'statusEffects.js',
  'sigW3b.js', 'metaProgression.js', 'sigW3c.js', 'villager-agency.js',
  'fieldFights.js', 'villager-objectives.js', 'codex-people.js', 'membership.js',
  'havenGrowth.js', 'hierarchy.js', 'comms.js', 'safetynets.js', 'villageAgency.js',
  'debug-scenarios.js', 'build.js'];
for (const f of LIST) {
  const code = fs.readFileSync(path.join(ROOT, 'src/js', f), 'utf8');
  try { eval.call(global, code + '\n//# sourceURL=' + f); }
  catch (e) { console.error('EVAL FAIL', f, e.message); process.exit(2); }
}
delete global.window;

const Game = globalThis.Scattering.Game;
Game.data = global.SCATTER_DATA;
const said = [];
Game.sysSay = function(t) { said.push(String(t)); };
Game.say = function(t) { said.push(String(t)); };
Game.audioEvent = function() {};
Game.drama = function() {};
Game.tele = function() {};
Game.recordMoment = function() {};
Game.contestLearn = function() {};
Game.villagerGainXP = function() {};
Game.kcalCap = function() { return 2400; };
Game.maxHealth = function() { return 100; };
Game.havenViewership = function() { return (this.state.village || {}).viewership || 0; };
Game.unlockedWave = function() { return 2; };
Game.monsterWavePool = function() { return (this.data.monsters || []).filter(m => (m.wave || 1) <= 1); };

function bootGame() {
  rng.reset(SEED);
  said.length = 0;
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  try { Game.depart(); } catch (e) {}
  const s = Game.state.scholar;
  s.day = 15;
  Game.state.systemArrived = true;
  s.health = 100; s.kcal = 2000; s.trauma = 0; s.exiled = false;
  s.inventory = s.inventory || [];
  Game.state.over = false;
  Game.state.activeContest = null;
  Game.state.pendingContest = null;
  Game.state.arenaContest = null;
  Game.state.broadcast = null;
  Game.state.notability = {};
  Game.state.showBudget = { week: Math.floor(s.day / 7), used: 0 };
  const v = Game.state.village;
  v.viewership = 50; v._lastWeekViewership = 50; v._peakViewership = 50;
  try { Game.apState(); } catch (e) {}
}
function showbizFavor() {
  try { const ap = Game.apState(); return ((ap.fanClubs || {}).showbiz || 0); } catch (e) { return 0; }
}
function setShowbiz(n) {
  const ap = Game.apState();
  ap.fanClubs = ap.fanClubs || { fight: 0, survival: 0, social: 0, showbiz: 0 };
  ap.fanClubs.showbiz = n; Game.apSyncFavor();
}

function run(strategy) {
  bootGame();
  setShowbiz(0);
  let boons = 0, maxFavor = 0, days50 = 0, pulls = 0;
  const origBoon = Game.apClubBoon;
  Game.apClubBoon = function() {
    const r = origBoon.call(this);
    if (r) boons++;
    return r;
  };
  for (let day = 15; day < 135; day++) {
    Game.state.scholar.day = day;
    Game.state.scholar.kcal = 2000;
    try { Game.apDailyTick(); } catch (e) {}
    const f = showbizFavor(); if (f > maxFavor) maxFavor = f;
    if (f >= 50) days50++;
    if ((day - 15) % 4 === 0) {
      let show = null;
      try { show = Game.pickShow(); } catch (e) {}
      if (!show) continue;
      const vids = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
      if (!vids.length) continue;
      const pid = vids[pulls % vids.length];
      pulls++;
      try {
        const phases = Game.showWatchPhases(show, pid);
        Game.state.activeContest = { kind: 'show', showId: show.id, showName: show.name, participant: pid, phase: 'intro', phaseIdx: 0, phases };
        const label = strategy === 'cheer' ? /cheer/i : /quiet/i;
        const ch = phases[0].choices.findIndex(c => label.test(c.label));
        Game.contestChoose(ch < 0 ? 0 : ch);
      } catch (e) {}
      Game.state.activeContest = null;
    }
  }
  Game.apClubBoon = origBoon;
  return { boons, maxFavor, days50, pulls };
}

for (const strat of ['cheer', 'quiet']) {
  const r = run(strat);
  console.log(`${strat}: pulls=${r.pulls} maxFavor=${r.maxFavor} days>=50=${r.days50} boons(curios)=${r.boons}`);
}

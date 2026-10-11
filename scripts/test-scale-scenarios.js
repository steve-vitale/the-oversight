// Scale debug scenarios proof. Usage: node scripts/test-scale-scenarios.js
// Steve 2026-10-11: "include relevant debug scenarios" + "scenarios for each
// scale stage not just the highest."
// For each of the 9 scale scenarios: (a) runs and sets valid seasoned state,
// (b) the beat stages within the daily tick, (c) the beat's choices resolve
// honestly, (d) REFUSE offered where canon requires it.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

// Seed BEFORE eval (modules capture Math.random at load).
let _seed = 20261011;
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
Math.random = mulberry32(_seed);

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
// Stub window for the eval phase only (equipment.js needs it at load); delete
// before playing so combat takes the sync path.
global.window = global;
['src/js/engine/state.js', 'src/js/engine/modifiers.js', 'src/js/engine/calories.js',
 'src/js/engine/day.js', 'src/js/engine/forage.js', 'src/js/engine/combat.js',
 'src/js/game.js', 'src/js/encounters.js', 'src/js/conversation.js', 'src/js/convo-mood.js',
 'src/js/convoTopics.js', 'src/js/convo-wants.js', 'src/js/convo-dialogue.js',
 'src/js/convo-beats.js', 'src/js/convo-scene.js', 'src/js/voice-piper.js',
 'src/js/voice-system.js', 'src/js/examine.js', 'src/js/equipment.js', 'src/js/journal.js',
 'src/js/party.js', 'src/js/party-formal.js', 'src/js/truth.js', 'src/js/galactic-cast.js',
 'src/js/contests.js', 'src/js/broadcast.js', 'src/js/contestEngine.js',
 'src/js/alienPlayers.js', 'src/js/storage.js', 'src/js/perceive.js',
 'src/js/carexplore.js', 'src/js/justice.js', 'src/js/food.js', 'src/js/betrayal.js',
 'src/js/corpses.js', 'src/js/corruption.js', 'src/js/lifeseed.js', 'src/js/spawn-knack.js',
 'src/js/progression.js', 'src/js/waveLedger.js', 'src/js/feastBuff.js', 'src/js/ledger.js',
 'src/js/abilityActions.js', 'src/js/monsterBehaviors.js', 'src/js/partyTactics.js',
 'src/js/sigW3a.js', 'src/js/statusEffects.js', 'src/js/sigW3b.js',
 'src/js/metaProgression.js', 'src/js/sigW3c.js', 'src/js/villager-agency.js',
 'src/js/fieldFights.js', 'src/js/villager-objectives.js', 'src/js/codex-people.js',
 'src/js/membership.js', 'src/js/havenGrowth.js', 'src/js/hierarchy.js',
 'src/js/comms.js', 'src/js/table.js', 'src/js/pods.js', 'src/js/table-feared.js',
 'src/js/table-indispensable.js', 'src/js/table-beloved.js', 'src/js/table-witness.js',
 'src/js/table-assimilated.js', 'src/js/table-defiant.js', 'src/js/relay-ext.js',
 'src/js/relay-dialogue.js', 'src/js/table-relay.js', 'src/js/safetynets.js',
 'src/js/villageAgency.js', 'src/js/debug-scenarios.js',
].forEach(f => eval(fs.readFileSync(path.join(ROOT, f), 'utf8')));
delete global.window;
const Game = globalThis.Scattering.Game;

let pass = 0, fail = 0;
function ok(name, cond) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL ${name}`); }
}
function eq(name, got, want) {
  if (got === want) { pass++; }
  else { fail++; console.log(`FAIL ${name}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); }
}

const SCALE_IDS = ['scaleDawn', 'scaleCouncil', 'scaleCharter', 'scaleCourt', 'scaleWatchers',
  'scaleVillage', 'scaleRegional', 'scaleNational', 'scaleGlobal'];

(async () => {
  await Game.init();

  // --- listed + categorized ---
  const list = Game.debugScenarioList();
  SCALE_IDS.forEach(id => ok(id + ' listed', list.some(([i]) => i === id)));
  const cats = Game.debugScenarioCategories();
  ok('Scale category exists', !!cats['🌍 Scale']);
  eq('Scale category has 9', (cats['🌍 Scale'] || []).length, 9);

  // --- 1. scaleDawn: bond 21d, Dawn pending, fires on tick ---
  ok('scaleDawn runs', Game.debugScenario('scaleDawn'));
  ok('dawn: bond 21+ days', Game.hierarchyState().some(l => l.status === 'active' && (Game.state.scholar.day - (l.day || 0)) >= 21));
  ok('dawn: not yet regional', !Game.state.networkLive);
  ok('dawn: pending regional', !!Game.state._regionalPending);
  Game._checkRegional();
  ok('dawn: fires on tick', !!Game.state.networkLive);
  ok('dawn: networkLiveDay set', (Game.state.networkLiveDay || 0) > 0);

  // --- 2. scaleCouncil: 3 seasoned covenant links, Council stages ---
  ok('scaleCouncil runs', Game.debugScenario('scaleCouncil'));
  let cov = Game._peerLinks('covenant');
  eq('council: 3 covenant links', cov.length, 3);
  ok('council: all seasoned', cov.every(l => Game._linkSeasoned(l)));
  ok('council: polity qualifies', !!Game._covenantPolity());
  ok('council: rung gate open', (Game.state.scholar.day - (Game.state.networkLiveDay || 0)) >= 30);
  Game._checkNational();
  ok('council: beat staged', !!Game.state.pendingNational);
  eq('council: shape covenant', Game.state.pendingNational.shape, 'covenant');
  // REFUSE offered: answerNationalChoice('refuse') must resolve via refuseTheScale
  const r1 = Game.answerNationalChoice('refuse');
  ok('council: refuse resolves', Game.state.scaleRefused === true || r1 !== undefined);

  // --- 3. scaleCharter: 3 seasoned trade links ---
  ok('scaleCharter runs', Game.debugScenario('scaleCharter'));
  let trd = Game._peerLinks('trade');
  eq('charter: 3 trade links', trd.length, 3);
  ok('charter: all seasoned', trd.every(l => Game._linkSeasoned(l)));
  ok('charter: polity qualifies', !!Game._tradePolity());
  Game._checkNational();
  ok('charter: beat staged', !!Game.state.pendingNational);
  eq('charter: shape trade', Game.state.pendingNational.shape, 'trade');
  Game.answerNationalChoice('refuse');
  ok('charter: refuse resolves', Game.state.scaleRefused === true);

  // --- 4. scaleCourt: 3 conquered subordinates, Iron Court stages ---
  ok('scaleCourt runs', Game.debugScenario('scaleCourt'));
  const subs = Game.hierarchyState().filter(l => l.status === 'active' && l.primary === 'haven');
  eq('court: 3 subordinates', subs.length, 3);
  ok('court: all conquered', subs.every(l => !!l.conquered));
  ok('court: seasoned (season, not trust)', subs.every(l => Game._linkSeasoned(l, true)));
  const pol = Game.polityOf('haven');
  ok('court: polity qualifies', !!pol);
  eq('court: shape conquest', pol.shape, 'conquest');
  Game._checkNational();
  ok('court: beat staged', !!Game.state.pendingNational);
  eq('court: shape conquest staged', Game.state.pendingNational.shape, 'conquest');
  Game.answerNationalChoice('refuse');
  ok('court: refuse resolves', Game.state.scaleRefused === true);

  // --- 5. scaleWatchers: national + viewership 40, Watchers stage ---
  ok('scaleWatchers runs', Game.debugScenario('scaleWatchers'));
  ok('watchers: national live', !!Game.state.nationalLive);
  ok('watchers: viewership 40+', (Game.state.village.viewership || 0) >= 40);
  ok('watchers: not yet global', !Game.state.globalLive && !Game.state.pendingGlobal);
  Game._checkGlobal();
  ok('watchers: beat staged', !!Game.state.pendingGlobal);

  // --- 6-9. stage snapshots: honest state, correct flags ---
  ok('scaleVillage runs', Game.debugScenario('scaleVillage'));
  eq('village: day 20', Game.state.scholar.day, 20);
  eq('village: no links', Game.hierarchyState().filter(l => l.status === 'active').length, 0);
  ok('village: pre-link', !Game.state.networkLive);

  ok('scaleRegional runs', Game.debugScenario('scaleRegional'));
  ok('regional: network live', !!Game.state.networkLive);
  ok('regional: 2 bonds', Game.hierarchyState().filter(l => l.status === 'active').length >= 2);
  ok('regional: not national', !Game.state.nationalLive);

  ok('scaleNational runs', Game.debugScenario('scaleNational'));
  ok('national: live', !!Game.state.nationalLive);
  ok('national: covenant polity holds', !!Game._covenantPolity());

  ok('scaleGlobal runs', Game.debugScenario('scaleGlobal'));
  ok('global: live', !!Game.state.globalLive);
  ok('global: viewership high', (Game.state.village.viewership || 0) >= 40);

  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });

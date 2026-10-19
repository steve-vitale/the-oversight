#!/usr/bin/env node
// Knowledge-gated villager quests: prepared blind/learned states, actual
// offering, teaching and delivery. Starting familiarity remains legitimate.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('quest-knowledge-gate');
const SEED = Number(process.env.SEED || 20261007);
function withRolls(values, fn) {
  const original = Math.random;
  let i = 0;
  Math.random = () => i < values.length ? values[i++] : original();
  try { return fn(); } finally { Math.random = original; }
}
const pantryKcal = Game => (Game.state.village.pantry || []).reduce((n, item) => n + (item.kcalEach || 0) * (item.units || 1), 0);
const units = (Game, id) => Game.state.scholar.inventory.filter(item => item.plantId === id).reduce((n, item) => n + item.units, 0);
(async () => {
  const Game = await K.load({ seed: SEED });
  Game.debugRegion = 'na_eastern_woodlands';
  K.newRun(Game);
  const scholar = Game.state.scholar;
  const starting = Game.state.codex.plants.dandelion;
  const startRef = Game.questPlantRef('dandelion', 3);
  console.log('starting-knowledge', JSON.stringify({ seed: SEED, region: Game.state.region, dandelion: starting, reference: startRef }));
  T.ok('quest reference honors starting Codex knowledge', (starting?.level >= 1) === /dandelion/i.test(startRef));
  const offer = choice => {
    scholar.activeQuest = null;
    withRolls([0, 0, choice], () => Game.maybeOfferQuest());
    return scholar.activeQuest;
  };

  // Prepared ignorance is a fixture, not a claim that all new characters
  // lack these familiar species. Do not erase knowledge in runtime code.
  delete Game.state.codex.plants.dandelion;
  delete Game.state.codex.plants.blackberry;
  T.ok('blind fixture is unknown through the actual gate', !Game.plantKnown('dandelion') && !Game.plantKnown('blackberry'));
  const blindRef = Game.questPlantRef('dandelion', 3);
  T.ok('unknown quest reference describes without naming', !/dandelion/i.test(blindRef) && /3×/.test(blindRef));
  const blindOffers = [0, 0.5, 0.999].map(offer);
  T.ok('blind offering produces real visit quests', blindOffers.every(q => q?.type === 'visit'));
  T.ok('every blind offer hides unlearned species names', blindOffers.every(q => q && !/dandelion|blackberr/i.test(q.text)));
  T.ok('no blind offer is an unactionable bring quest', blindOffers.every(q => q && q.type !== 'bring'));

  const teacher = Game.state.village.roster.find(id => id !== Game.villagerId);
  Game.grantKnowledge('plant', 'dandelion', 2, { type: 'taught', by: teacher });
  T.ok('actual teaching opens the name gate', Game.plantKnown('dandelion'));
  T.ok('learned quest reference names and pluralizes', /^3 Dandelions$/.test(Game.questPlantRef('dandelion', 3)));
  const bring = offer(0.999);
  T.ok('learned species becomes an actual named bring quest', bring?.type === 'bring' && bring.plant === 'dandelion' && /3 Dandelions/.test(bring.text));
  T.ok('offered giver is a real current villager', !!bring && Game.state.village.roster.includes(bring.giver));
  scholar.inventory.push({ plantId: 'dandelion', name: 'Dandelion', units: 3, kcalEach: 45, spoilDay: scholar.day + 3, kg: 0.1 });
  const beforeUnits = units(Game, 'dandelion'), beforePantry = pantryKcal(Game);
  Game.checkQuest('forage');
  T.ok('actual identified-haul turn-in clears the quest', scholar.activeQuest === null);
  T.ok('turn-in consumes exactly the promised three units', units(Game, 'dandelion') === beforeUnits - 3);
  T.ok('turn-in delivers the actual 500-kcal pantry reward', pantryKcal(Game) === beforePantry + 500);
  T.done();
})().catch(error => { console.error(error); process.exitCode = 1; });

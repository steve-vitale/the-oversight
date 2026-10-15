// Forage rot deadline: identify it or lose it. Usage: node scripts/test-forage-rot.js
// The forager's blind haul lands on the counter (prepStash) as unknown lumps
// with a ~2-day spoilage clock. (Since 2026-10-11 a food-background villager
// may experiment on one lump a day — villagerExperimentBeat.) If nobody
// learns what they are (test cautiously, be taught, sort with a
// knower), they rot. This is the identification pressure the knowledge loop
// runs on — the test pins it down.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
// Loader: scripts/godpath/lib.js — index.html script order, seeded
// Math.random, frozen Date.now (flake fix 2026-10-14; the old
// hand-rolled eval list was unseeded and missed modules).
const K = require('./godpath/lib');
let Game;

let pass = 0, fail = 0;
function ok(name, cond) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL ${name}`); }
}

function freshGame() {
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.returnToVillage();
  return Game.state.scholar;
}
function forget(pid) {
  delete (Game.state.codex.plants || {})[pid];
  const v = Game.state.village || {}, me = Game.villagerId;
  for (const store of [v.familiar, v.taught, v.plantKnowledge]) {
    if (store && Array.isArray(store[me])) store[me] = store[me].filter(x => x !== pid);
  }
}
const lump = (comp, day) => ({
  name: 'unknown shoots', units: Object.values(comp).reduce((t, e) => t + e.units, 0),
  unit: 'shoot', foodKind: 'plant', foodState: 'unknown', edible: false,
  kcalEach: 0, kg: 1.2, spoilDay: day + 2, lump: comp,
});

(async () => {
  Game = await K.load({ seed: Number(process.env.SEED || 20261005) }); // narration silenced (was Game.say = () => {})

  // 1. ROT: an unidentified lump rots off the counter in ~2 days.
  {
    const s = freshGame();
    s.prepStash = [lump({ dandelion: { units: 7, day: s.day }, chickweed: { units: 5, day: s.day } }, s.day)];
    ok('lump starts on the counter', s.prepStash.length === 1);
    // Pin (flake fix 2026-10-14): since VILLAGER EXPERIMENTS (2026-10-11) a
    // villager with a food background may taste-test the lump overnight and
    // split out the identified species — on seeds that dealt such a villager
    // the counter no longer held exactly one unidentified lump. This section
    // is about the rot clock on what stays UNIDENTIFIED, so the experiment
    // beat is held off here (the 3 identification paths are sections 2-3).
    // Likewise the character's own food.spoilage_days modifier (a rolled
    // background can grant +3, preservation_instinct style) moves the rot
    // day; this checks the BASE clock, so the bonus is pinned to 0.
    const realExperiment = Game.villagerExperimentBeat;
    const realBonus = Game.spoilBonusDays;
    Game.villagerExperimentBeat = function () {};
    Game.spoilBonusDays = () => 0;
    try {
      Game.endDay();
      ok('lump survives one night', s.prepStash.length === 1);
      Game.endDay();
      ok('unidentified lump rots by day 3', s.prepStash.length === 0);
    } finally { Game.villagerExperimentBeat = realExperiment; Game.spoilBonusDays = realBonus; }
  }

  // 2. TEST CAUTIOUSLY: the careful protocol identifies the plurality species.
  // (dandelion is 'safe', so no RNG risk branch fires — deterministic.)
  {
    const s = freshGame();
    s.inventory = [lump({ dandelion: { units: 7, day: s.day }, chickweed: { units: 5, day: s.day } }, s.day)];
    // Pin (flake fix 2026-10-14): a rolled background can already know
    // dandelion, and then testCautiously refuses ("already know this one")
    // and the split never happens. Start from not knowing either species.
    forget('dandelion'); forget('chickweed');
    ok('precondition: dandelion starts unknown', !Game.plantKnown('dandelion'));
    Game.testCautiously(0, {}, s.inventory);
    ok('cautious test identifies the plurality species', Game.plantKnown('dandelion'));
    const food = s.inventory.find(i => i.plantId === 'dandelion');
    ok('identified species splits out as real food', !!food && food.kcalEach === 45 && food.edible === true);
    ok('minority species stays an unknown lump', s.inventory.some(i => i.lump && i.lump.chickweed));
  }

  // 3. TAUGHT: sorting with a knower at camp teaches you, and the named
  // species comes out as real food with honest calories.
  {
    const s = freshGame();
    const v = Game.state.village;
    forget('blackberry'); forget('elderberry'); // same background pin as section 2
    ok('precondition: blackberry starts unknown', !Game.plantKnown('blackberry'));
    const teacher = (Game.villagePeople() || []).find(p => p.id !== Game.villagerId);
    v.plantKnowledge = v.plantKnowledge || {};
    v.plantKnowledge[teacher.id] = ['blackberry'];
    // teacher must be AT camp for whoKnowsLump
    try { if (Game.npcNode(teacher.id)) { Game.npcNode(teacher.id).nx = Game.map.px; Game.npcNode(teacher.id).ny = Game.map.py; } } catch (e) {}
    s.prepStash = [{
      name: 'unknown berries', units: 8, unit: 'handful', foodKind: 'plant',
      foodState: 'unknown', edible: false, kcalEach: 0, kg: 0.8,
      spoilDay: s.day + 2,
      lump: { blackberry: { units: 5, day: s.day }, elderberry: { units: 3, day: s.day } },
    }];
    const knowers = Game.whoKnowsLump(s.prepStash[0]);
    ok('a knower is found at camp', knowers.some(w => w.id === teacher.id));
    Game.sortBag(teacher.id, 0);
    ok('sorting with a knower teaches you', Game.plantKnown('blackberry'));
    const food = s.prepStash.find(i => i.plantId === 'blackberry');
    ok('taught species comes out as real food', !!food && food.kcalEach === 65 && food.edible === true);
  }

  console.log(`\nforage-rot: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST ERROR:', e.message); process.exit(1); });

#!/usr/bin/env node
// Water/fire reality audit (Steve 2026-10-08): measure, then tune.
// Q1: fire at haven too simple? Q2: water too easy / dirty never drunk?
// Q3: water weight (1L=1kg)? Q4: consumption amounts? Q5: heat/exertion scaling?
// PLUS: creek/disease death-pipeline skips (break-it travel&map flag).
const K = require('./godpath/lib');
const SEED = Number(process.env.SEED || 20261008);
let pass = 0, fail = 0;
const messages = [];
function ok(name, cond) { if (cond) pass++; else { fail++; console.log('FAIL ' + name); } }
function freshGame(Game) {
  Game.say = () => {};
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.dayPart = 1;
  messages.length = 0;
  Game.say = text => messages.push(String(text));
}
(async () => {
  const Game = await K.load({ seed: SEED });
  Game.debugRegion = 'na_eastern_woodlands';

  // ---- Q3: WATER WEIGHT 1L = 1kg ----
  freshGame(Game);
  ok('waterWeight counts 1kg per liter', (() => {
    Game.state.scholar.water = [{ liters: 1, quality: 'clean' }, { liters: 1, quality: 'clean' }, { liters: 1, quality: 'risky' }];
    return Game.waterWeight() === 3;
  })());

  // ---- Q5: HYDRATION BURN SCALES ----
  const hb = globalThis.Scattering.calories.hydrationBurn;
  const idleCold = hb({}, { weather: 'cold', dayTicks: 0 });
  const hardClear = hb({}, { weather: 'clear', dayTicks: 512 });
  const midRain = hb({}, { weather: 'rain', dayTicks: 256 });
  ok('idle cold day burns less than hard clear day', idleCold < hardClear);
  ok('exertion increases burn', hb({}, { weather: 'rain', dayTicks: 512 }) > hb({}, { weather: 'rain', dayTicks: 0 }));
  ok('clear sweats more than cold', hb({}, { weather: 'clear', dayTicks: 100 }) > hb({}, { weather: 'cold', dayTicks: 100 }));
  console.log(`  INFO hydration burn: idle-cold=${idleCold}, mid-rain=${midRain}, hard-clear=${hardClear} (was flat 35)`);

  // ---- Q4: VILLAGERS DRINK ----
  freshGame(Game);
  const village = Game.state.village;
  const living = village.roster.filter(id => id !== Game.villagerId && !Game.vpOf(id)?.dead);
  const npcCount = living.length;
  if (!npcCount) throw new Error('No living NPCs for water proof');
  const bottles = JSON.stringify(Game.state.scholar.water);
  village.water = { clean: npcCount * 2 + 5, dirty: 0 };
  const v0 = village.water.clean;
  Game.villageDrinks();
  ok('full supply serves exactly 2L per living NPC', v0 - village.water.clean === npcCount * 2);
  ok('full supply is not rationed', !village.waterRationed);
  ok('NPC water draw does not consume the bearer bottles', JSON.stringify(Game.state.scholar.water) === bottles);
  village.water.clean = npcCount * 2 - 1;
  messages.length = 0;
  const rationStart = village.water.clean;
  Game.villageDrinks();
  ok('scarce supply serves exactly 1L per living NPC', rationStart - village.water.clean === npcCount);
  ok('scarce supply enters the authored ration state', village.waterRationed === true);
  ok('entering rations is announced', messages.some(text => /half rations/.test(text)));
  const rationMessages = messages.filter(text => /half rations/.test(text)).length;
  village.water.clean = npcCount * 2 - 1;
  Game.villageDrinks();
  ok('continued rationing does not repeat its transition beat', messages.filter(text => /half rations/.test(text)).length === rationMessages);
  village.water.clean = npcCount * 2 + 5;
  Game.villageDrinks();
  ok('restocked supply restores full cups and announces recovery', village.waterRationed === false && messages.some(text => /full cups again/.test(text)));
  console.log('  water-rations', JSON.stringify({ living: npcCount, fullPerHead: 2, scarcePerHead: 1 }));

  // dirty drinking sets the flag; sickness tick fires gut rot
  freshGame(Game);
  Game.state.village.water = { clean: 0, dirty: 30 };
  Game.villageDrinks();
  ok('dirty drinking sets drankDirty flag', !!Game.state.village.drankDirty);
  let gut = 0;
  for (let i = 0; i < 30; i++) {
    Game.state.village.sick = {};
    Game.state.village.drankDirty = true;
    Game.villageSicknessTick();
    for (const s of Object.values(Game.state.village.sick)) if (s.name === 'gut rot') gut++;
  }
  ok('gut rot fires on dirty water', gut > 0);
  console.log(`  INFO gut rot cases in 30 forced dirty days: ${gut}`);

  // ---- Q2: WATER DUTY HAULS DIRTY; HEARTH BOILS WITH WOOD ----
  freshGame(Game);
  const cleanStart = Game.state.village.water.clean;
  const ids = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  Game.state.village.assignments = { [ids[0]]: { task: 'water', assignedDay: 1 } };
  Game.resolveAssignments();
  ok('water duty hauls dirty (not clean)', Game.state.village.water.dirty > 0 && Game.state.village.water.clean === cleanStart);
  const woodBefore = Game.state.village.wood;
  Game.hearthBoil();
  ok('hearth boils dirty clean', Game.state.village.water.clean > 20);
  ok('boiling consumes village wood', Game.state.village.wood < woodBefore);
  // no wood -> no boiling -> dirty stays
  freshGame(Game);
  Game.state.village.water = { clean: 0, dirty: 12 };
  Game.state.village.wood = 0;
  Game.hearthBoil();
  ok('no wood means no boiling (dirty stays risky)', Game.state.village.water.dirty === 12 && Game.state.village.water.clean === 0);

  // ---- DEATH PIPELINE: wound / famine / sickness / thirst ----
  // wound death in villageLives
  freshGame(Game);
  const wid = (Game.state.village.roster || []).filter(id => id !== Game.villagerId)[0];
  Game.state.village.health = Game.state.village.health || {};
  Game.state.village.health[wid] = 1;
  // force the wound path: call hurtVillager lethal (same as villageLives wound death)
  const corpsesBefore = (Game.corpses ? Game.corpses() : []).length;
  Game.hurtVillager(wid, 50, 'wound');
  ok('lethal wound marks dead', !!((Game.vpOf(wid) || {}).dead));
  ok('lethal wound leaves corpse', (Game.corpses ? Game.corpses() : []).length > corpsesBefore);
  ok('lethal wound removes from roster', !(Game.state.village.roster || []).includes(wid));

  // sickness death cleans up v.sick (no "on the mend" for a corpse)
  freshGame(Game);
  const sid = (Game.state.village.roster || []).filter(id => id !== Game.villagerId)[0];
  Game.state.village.health = Game.state.village.health || {};
  Game.state.village.health[sid] = 1;
  Game.state.village.sick = { [sid]: { name: 'gut rot', daysLeft: 1, severity: 2 } };
  Game.villageSicknessTick();
  ok('sickness death marks dead', !!((Game.vpOf(sid) || {}).dead));
  ok('sickness death clears sick record', !Game.state.village.sick[sid]);

  // thirst death
  freshGame(Game);
  const tid = (Game.state.village.roster || []).filter(id => id !== Game.villagerId)[0];
  Game.state.village.water = { clean: 0, dirty: 0 };
  Game.state.village.health = Game.state.village.health || {};
  Game.state.village.health[tid] = 3;
  Game.villageDrinks();
  ok('thirst death marks dead', !!((Game.vpOf(tid) || {}).dead));

  // ---- Q1: FIRE — hearth is village infrastructure; field fire needs fuel ----
  freshGame(Game);
  ok('player takeWood draws from village pile', (() => {
    Game.state.village.wood = 5;
    const before = Game.woodCount();
    Game.location = 'haven';
    Game.takeWood();
    return Game.woodCount() === before + 4 && Game.state.village.wood === 1;
  })());

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });

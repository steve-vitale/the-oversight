// Hunter-loop fixes (2026-10-05):
//  1. Deadfall was UNcraftable — the recipe demanded material 'bait', which no
//     game action produces. Fix: 'bait' is satisfied by any edible food item.
//  2. night_hunting L2/L3 were unreachable — nothing ever granted the skill
//     except background L1. Fix: night stalks/strikes earn practice XP,
//     L1 at 3, L2 at 8, L3 at 16.
// Usage: node scripts/test-hunter-fixes.js
// Shared seeded runtime. Controlled craft/catch rolls below are proof inputs,
// not campaign balance evidence. No retry-until-success or survival quota.
const K = require('./godpath/lib');
const SEED = Number(process.env.SEED || 20261017);
let Game;
function withRoll(value, fn) {
  const prior = Math.random;
  Math.random = () => value;
  try { return fn(); } finally { Math.random = prior; }
}
function wildTile() {
  for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
    const tile = Game.tileAt(x, y);
    if (tile && !['haven', 'ruin'].includes(tile.type)) {
      Game.map.px = x; Game.map.py = y; return tile;
    }
  }
  throw Error('No wild tile in prepared woodland landing');
}
function units(s, predicate) {
  return s.inventory.filter(predicate).reduce((n, i) => n + (i.units || 0), 0);
}

let pass = 0, fail = 0;
function ok(name, cond) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL ${name}`); }
}
function fresh() {
  Game.genRoster('Columbus, Ohio');
  Game.generatedRoster[0].occupationId = 'hunting_guide';
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  wildTile();
  const scholar = Game.state.scholar;
  scholar.insideHaven = false;
  scholar.monster = null;
  return scholar;
}
function clearLog() { Game.log.length = 0; }
function lastSay() { return Game.log.slice(-1)[0] || ''; }

(async () => {
  Game = await K.load({ seed: SEED, narration: true });
  Game.debugRegion = 'na_eastern_woodlands';

  // ---- 1. deadfall bait ----
  let s = fresh();
  Game.learnRecipe('deadfall', 3);
  s.inventory = [{ material: 'stick', units: 4, name: 'Stick' },
    { material: 'stone', units: 2, name: 'Stone' }];
  s.tools = [];
  // strip starting rations — the no-food case must really have no food
  s.inventory = s.inventory.filter(i => !((i.kcalEach || 0) > 0));
  clearLog();
  ok('deadfall without food: blocked', Game.craft('deadfall') === null);
  ok('deadfall without food: honest bait message', /bait/i.test(lastSay()));
  // berries count as bait
  s.inventory.push({ name: 'Blackberries', units: 7, kcalEach: 40, foodState: 'raw', plantId: 'blackberry', spoilDay: 999 });
  const material = m => units(s, i => i.material === m);
  const bait = () => units(s, i => i.plantId === 'blackberry');
  const random = Math.random;
  ok('prepared learned craft retains failure odds', Game.modTarget('craft.success', 0.85) < 0.999999);
  const failed = withRoll(0.999999, () => Game.craft('deadfall'));
  ok('failed learned craft grants no deadfall', !failed && s.tools.length === 0);
  ok('failed craft consumes one complete material set', material('stick') === 2 && material('stone') === 1 && bait() === 6);
  const made = withRoll(0.01, () => Game.craft('deadfall'));
  ok('deadfall with berries as bait: crafts', !!made);
  ok('success consumes one complete material set', material('stick') === 0 && material('stone') === 0 && bait() === 5);
  ok('deadfall lands in tools with authored uses', s.tools.some(t => t.recipeId === 'deadfall' && t.uses === 5));
  ok('controlled craft restores seeded RNG', Math.random === random);
  // snare still crafts the old way (regression)
  Game.learnRecipe('snare', 3);
  s.inventory.push({ material: 'vine', units: 2, name: 'Vine' }, { material: 'stick', units: 2, name: 'Stick' });
  const snare = withRoll(0.01, () => Game.craft('snare'));
  ok('snare still crafts normally', !!snare);
  const snareMats = Game.data.recipes.find(r => r.id === 'snare').materials;
  ok('snare consumes its authored material set', material('vine') === 2 - snareMats.vine && material('stick') === 2 - snareMats.stick);
  const tile = Game.playerTile(), ticks = s.dayTicks;
  ok('setTrap deadfall', Game.setTrap('deadfall') === true);
  const trap = tile.traps.find(t => t.recipeId === 'deadfall');
  ok('placement transfers tool to wild tile and pays sixteen ticks', !!trap && !s.tools.some(t => t.recipeId === 'deadfall') && s.dayTicks === ticks + 16);
  const carcasses = () => units(s, i => i.foodState === 'carcass');
  tile.wildlife = {};
  const empty = carcasses();
  withRoll(0.01, () => Game.checkTraps());
  ok('empty ground creates no carcass or wear', carcasses() === empty && trap.uses === 5);
  tile.wildlife = { cottontail_rabbit: 6 }; // below authored capacity (8)
  withRoll(0.999999, () => Game.checkTraps());
  ok('miss preserves stock, carcasses and uses', carcasses() === empty && tile.wildlife.cottontail_rabbit === 6 && trap.uses === 5);
  const checkTraps = Game.checkTraps;
  let calls = 0, dawn;
  Game.checkTraps = function (...args) {
    calls++;
    const before = { stock: tile.wildlife.cottontail_rabbit || 0, carcasses: carcasses(), uses: trap.uses };
    const result = withRoll(0.01, () => checkTraps.apply(this, args));
    dawn = { before, stock: tile.wildlife.cottontail_rabbit || 0, carcasses: carcasses(), uses: trap.uses, shy: tile.trapShy.deadfall?.level };
    return result;
  };
  const day = s.day;
  try { Game.endDay(); } finally { Game.checkTraps = checkTraps; }
  ok('real dawn calls checkTraps once', calls === 1);
  ok('dawn delivers one real carcass unit', dawn && dawn.carcasses === dawn.before.carcasses + 1);
  ok('catch removes one animal from stock at check time', dawn && dawn.before.stock > 0 && dawn.stock === dawn.before.stock - 1);
  ok('catch spends one use and teaches shyness', dawn && dawn.uses === dawn.before.uses - 1 && dawn.shy === 1);
  ok('real dawn advances day in living run', s.day === day + 1 && !Game.over && !Game.villageLost);
  ok('proof restores runtime method and seeded RNG', Game.checkTraps === checkTraps && Math.random === random);

  // ---- 2. night_hunting practice path ----
  s = fresh();
  Game.state.codex.skills = {};
  s.nightHuntXP = 0;
  Game.dayPart = 3;
  s.dayTicks = 3 * Game.TIME.TICKS_PER_PART;
  const detail = Game.genDetail(Game.map.px, Game.map.py);
  detail[4][4] = 'grass'; detail[4][5] = 'grass';
  ok('isNight for the drill', Game.isNight() === true);
  function nightStalk() {
    s.dayTicks = Game.dayPart * Game.TIME.TICKS_PER_PART;
    s.mx = 4; s.my = 4; s.kcal = 2400;
    s.animal = { id: 'cottontail_rabbit', mx: 7, my: 4, aware: 0.1, stamina: 3, pstate: 'graze' };
    clearLog();
    const ticks = s.dayTicks;
    const result = Game.stalkAnimal();
    ok('actual stalk moves and pays food and time', result === true && s.mx === 5 && s.kcal === 2385 && s.dayTicks === ticks + 1);
    s.animal = null;
  }
  nightStalk(); nightStalk();
  ok('2 night stalks: no skill yet', !Game.skillKnown('night_hunting', 1) && s.nightHuntXP === 2);
  nightStalk();
  ok('3rd night stalk: night_hunting L1 learned', Game.skillKnown('night_hunting', 1));
  ok('L1 announcement names the skill', /Night Hunting/.test(Game.log.join(' ')));
  for (let i = 0; i < 4; i++) nightStalk();
  ok('7 XP does not grant L2 early', s.nightHuntXP === 7 && !Game.skillKnown('night_hunting', 2));
  nightStalk(); // xp = 8
  ok('8 XP: night_hunting L2 learned', Game.skillKnown('night_hunting', 2));
  for (let i = 0; i < 7; i++) nightStalk();
  ok('15 XP does not grant L3 early', s.nightHuntXP === 15 && !Game.skillKnown('night_hunting', 3));
  nightStalk(); // xp = 16
  ok('16 XP: night_hunting L3 learned', Game.skillKnown('night_hunting', 3));
  // day stalks teach nothing
  const xpBefore = s.nightHuntXP;
  Game.dayPart = 1;
  nightStalk();
  ok('day stalk grants no night XP', s.nightHuntXP === xpBefore && !Game.skillKnown('night_hunting', 4));
  // night strikes grant XP too
  Game.dayPart = 3;
  s.dayTicks = 3 * Game.TIME.TICKS_PER_PART;
  const xpBeforeStrike = s.nightHuntXP;
  s.mx = 4; s.my = 4; s.kcal = 2400;
  s.animal = { id: 'cottontail_rabbit', mx: 5, my: 4, aware: 0.1, stamina: 3, pstate: 'graze' };
  s.equipped = { weapon: { itemId: 'fire_hardened_spear', name: 'Fire-hardened spear', range: 2 } };
  clearLog();
  Game.huntAnimal();
  ok('night strike grants night XP', s.nightHuntXP === xpBeforeStrike + 1);
  // The earned tier remains recognized after another actual strike.
  ok('L2 still recognized after more XP', Game.skillKnown('night_hunting', 2));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('CRASH:', e); process.exit(1); });

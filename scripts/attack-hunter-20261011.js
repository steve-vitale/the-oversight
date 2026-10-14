#!/usr/bin/env node
// HOSTILE HUNTER: adversarial playtest (2026-10-11 playtest loop, archetype 5).
// Steve's directive: play as a HOSTILE player trying to break hunting.
// Attacks:
//   E1 EXPLOIT: trap-shyness must relax 1 level / 3 quiet days (the code's own
//      rule). Do empty-ground dawns count as quiet? (spoiler: they `continue`
//      before the relaxation block — shyness freezes on hunted-out ground)
//   E2 EXPLOIT: snare-wire shortcut on a FRESH game (scholar.tools undefined)
//      — the 2026-10-10 tools-guard fix must hold: wire consumed, 2-use trap
//      placed, no crash, time cost + message run.
//   E3 EXPLOIT: village-square trapline — set traps on the haven tile. If the
//      haven backfills wildlife, home becomes a free trapline (no expedition
//      cost). Held only if haven tiles hold no game.
//   S1 SOFTLOCK: carcass double-clean — cleaning the same carcass twice must
//      not print meat twice (energy duplication) or corrupt the stack.
//   S2 SOFTLOCK: strike loop always terminates — 60 strikes at a deer must
//      end the encounter (kill/bolt/release), never spin forever.
//   H1 HONESTY: encButcherHonesty's "Cleans to ~X kcal x N raw portions" must
//      equal what carcassToMeat actually delivers — incl. the bear fat-aware
//      0.75 cap (meat + fat <= 0.95 gross).
//   H2 HONESTY: "Watching the mechanism work teaches the shape of it" — the
//      first witnessed trap catch must grant the recipe L1 (the learnability
//      promise), and the line must actually be said.
//   H3 HONESTY: villagerHuntResolve's comment claims the kill is "butchered at
//      the animal's real kcal ... the same butcherYieldFrac the player gets".
//      Verify numerically whether the duty's flat 0.6/0.78 matches the
//      player's shared helper.
// Usage: node scripts/attack-hunter-20261011.js [SEED]
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || process.argv[2] || '20261011', 10);

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
  ['monsterBehaviors.json', 'monsterBehaviors'],
  ['contests.json', 'contests'], ['events.json', 'events'],
  ['statusEffects.json', 'statusEffects'], ['cooking.json', 'cooking'],
];
global.SCATTER_DATA = {};
for (const [f, key] of PAIRS) {
  try { global.SCATTER_DATA[key] = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data', f), 'utf8')); }
  catch (e) { global.SCATTER_DATA[key] = []; }
}
// SEED BEFORE EVAL (2026-10-08): modules capture Math.random at load.
function mulberry32(a) {
  return function () {
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

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
global.window = global;
const ORDER = ['src/js/engine/state.js', 'src/js/engine/modifiers.js', 'src/js/engine/calories.js',
  'src/js/engine/day.js', 'src/js/engine/forage.js', 'src/js/engine/combat.js',
  'src/js/game.js', 'src/js/encounters.js', 'src/js/conversation.js', 'src/js/convo-mood.js',
  'src/js/convoTopics.js', 'src/js/convo-wants.js', 'src/js/convo-dialogue.js', 'src/js/convo-beats.js',
  'src/js/convo-scene.js', 'src/js/examine.js', 'src/js/equipment.js', 'src/js/journal.js', 'src/js/party.js',
  'src/js/party-formal.js', 'src/js/truth.js', 'src/js/contests.js', 'src/js/broadcast.js',
  'src/js/contestEngine.js', 'src/js/alienPlayers.js', 'src/js/storage.js', 'src/js/perceive.js',
  'src/js/carexplore.js', 'src/js/justice.js', 'src/js/food.js', 'src/js/betrayal.js', 'src/js/corpses.js',
  'src/js/corruption.js', 'src/js/lifeseed.js', 'src/js/progression.js', 'src/js/waveLedger.js',
  'src/js/feastBuff.js', 'src/js/ledger.js', 'src/js/abilityActions.js', 'src/js/monsterBehaviors.js',
  'src/js/partyTactics.js', 'src/js/sigW3a.js', 'src/js/statusEffects.js', 'src/js/sigW3b.js',
  'src/js/metaProgression.js', 'src/js/sigW3c.js', 'src/js/villager-agency.js', 'src/js/fieldFights.js',
  'src/js/villager-objectives.js', 'src/js/codex-people.js', 'src/js/membership.js', 'src/js/hierarchy.js',
  'src/js/comms.js', 'src/js/safetynets.js', 'src/js/villageAgency.js', 'src/js/debug-scenarios.js',
  'src/js/build.js'];
for (const f of ORDER) {
  try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
  catch (e) { console.error('EVAL FAIL ' + f + ': ' + e.message); process.exit(2); }
}
delete global.window;
const Game = globalThis.Scattering.Game;
Game.data = global.SCATTER_DATA;
Game.unlockedWave = function () { return 1; };
Game.monsterWavePool = function () { return (this.data.monsters || []).filter(m => (m.wave || 1) <= 1); };

let pass = 0, fail = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; fails.push(name); console.log('  FAIL ' + name + ' — ' + (extra || '')); }
}
const said = [];
Game.say = function (m) { said.push(String(m)); };
Game.sysSay = function (m) { said.push(String(m)); };
Game.drama = function () { };
Game.feedback = function (m) { said.push('[fb] ' + String(m)); };

function freshGame() {
  rng.reset(SEED);
  said.length = 0;
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const s = Game.state.scholar;
  s.health = 100; s.kcal = 3000; s.trauma = 0;
  s.mx = 4; s.my = 4;
  Game.state.over = false;
  Game.state.activeContest = null; Game.state.pendingContest = null;
  return s;
}
function give(itemId, n) {
  const s = Game.state.scholar;
  const idef = (Game.data.items || []).find(i => i.id === itemId) || {};
  s.inventory.push({ itemId, name: idef.name || itemId, units: n || 1, kcalEach: 0, kg: 0.1 });
}
function flatGrid() {
  const g = [];
  for (let y = 0; y < 9; y++) g.push(new Array(9).fill('grass'));
  return g;
}

(async () => {
  await Game.init();

  console.log('== E1. TRAP-SHYNESS RELAXES ON EMPTY-GROUND DAWNS ==');
  {
    freshGame();
    const s = Game.state.scholar;
    const t = Game.tileAt(3, 4);
    t.detail = flatGrid();
    t.wildlife = {}; // hunted-out ground — nothing to catch
    t.type = 'meadow';
    const day0 = s.day;
    t.traps = [{ recipeId: 'snare', mx: 4, my: 4, setDay: day0, uses: 10 }];
    t.trapShy = { snare: { level: 3, day: day0 } };
    // 12 quiet dawns on empty ground
    for (let d = 1; d <= 12; d++) {
      s.day = day0 + d;
      Game.checkTraps();
    }
    const lvl = (t.trapShy.snare || {}).level;
    check('shyness relaxes 3 -> <=1 over 12 quiet empty dawns', lvl <= 1, 'level=' + lvl);
    // and when game returns, the relaxed trap is not still at level 3
    check('no frozen shyness on rested ground', lvl < 3, 'level=' + lvl);
  }

  console.log('== E2. SNARE-WIRE SHORTCUT, FRESH GAME ==');
  {
    freshGame();
    const s = Game.state.scholar;
    s.tools = undefined; // fresh-game shape: never crafted
    give('snare_wire', 1);
    const t = Game.playerTile();
    t.detail = flatGrid(); t.type = 'meadow';
    let r = null, threw = null;
    try { r = Game.setTrap('snare'); } catch (e) { threw = e.message; }
    const trap = (t.traps || [])[0];
    const wireLeft = (s.inventory || []).filter(i => i.itemId === 'snare_wire')
      .reduce((n, i) => n + (i.units || 1), 0);
    check('no crash with tools undefined', threw === null, threw);
    check('wire snare placed', r === true && !!trap, 'r=' + r);
    check('improvised 2-use trap', trap && trap.uses === 2, 'uses=' + (trap && trap.uses));
    check('wire consumed', wireLeft === 0, 'wireLeft=' + wireLeft);
    check('uses said out loud', said.some(m => /improvised, 2 uses/i.test(m)), said.slice(-3).join(' | '));
  }

  console.log('== E3. VILLAGE-SQUARE TRAPLINE ==');
  {
    freshGame();
    const s = Game.state.scholar;
    // find the haven tile by scanning (village px/py are region coords)
    let hx = -1, hy = -1;
    for (let y = 0; y < 9 && hx < 0; y++) for (let x = 0; x < 9; x++) {
      const tt = Game.map.tiles[y][x];
      if (tt && (tt.type === 'haven' || tt.isHaven)) { hx = x; hy = y; break; }
    }
    check('haven tile exists on map', hx >= 0, 'not found');
    if (hx < 0) { console.log('  (skipping haven trapline)'); }
    else {
    Game.map.px = hx; Game.map.py = hy;
    const t = Game.playerTile();
    check('standing on haven tile', t.type === 'haven' || t.isHaven, 'type=' + t.type);
    t.traps = [{ recipeId: 'snare', mx: 4, my: 4, setDay: s.day, uses: 10 }];
    delete t.wildlife; // force backfill path
    s.day += 1;
    const before = JSON.stringify(s.inventory.length);
    Game.checkTraps();
    const caught = said.some(m => /TRAP:.*caught/i.test(m));
    check('no free meat at home (haven holds no game)', !caught, 'caught=' + caught);
    } // end haven branch
  }

  console.log('== S1. CARCASS DOUBLE-CLEAN ==');
  {
    freshGame();
    const s = Game.state.scholar;
    const deer = (Game.data.animals || []).find(a => a.id === 'white_tailed_deer');
    s.inventory.push(Game.foodCarcass(deer, deer.calories, s.day, 'hunted'));
    give('stone_knife', 1);
    const cIdx = s.inventory.findIndex(i => i.foodState === 'carcass');
    check('carcass present to clean', cIdx >= 0, '');
    Game.learnTechnique && Game.learnTechnique('clean', 'trial');
    Game.cleanCarcass(cIdx);
    const meat = s.inventory.filter(i => i.foodState === 'cleaned');
    check('one clean -> meat exists', meat.length > 0, 'meat=' + meat.length);
    said.length = 0;
    const kcalAfter = (s.inventory || []).reduce((t, i) => t + ((i.kcalEach || 0) + (i.hiddenKcal || 0)) * (i.units || 1), 0);
    const cIdx2 = s.inventory.findIndex(i => i.foodState === 'carcass');
    Game.cleanCarcass(cIdx2 >= 0 ? cIdx2 : 999); // nothing is a carcass anymore
    check('second clean prints no new meat', (s.inventory || []).reduce((t, i) => t + ((i.kcalEach || 0) + (i.hiddenKcal || 0)) * (i.units || 1), 0) === kcalAfter,
      'kcal changed on second clean');
    check('second clean says so honestly', said.some(m => /no carcasses/i.test(m)), said.join(' | ').slice(0, 120));
  }

  console.log('== S2. STRIKE LOOP TERMINATES ==');
  {
    let ended = 0, spins = 0;
    for (let seed = 1; seed <= 6; seed++) {
      rng.reset(SEED + seed);
      freshGame();
      const s = Game.state.scholar;
      const t = Game.playerTile();
      t.detail = flatGrid(); t.type = 'meadow';
      t.wildlife = { white_tailed_deer: 3 };
      const cfg = Game.encPreyCfg('white_tailed_deer');
      s.animal = { id: 'white_tailed_deer', mx: 6, my: 4, aware: 0.5, stamina: cfg.stamina, pstate: 'graze', edgeTurns: 0, wild: true };
      s.mx = 5; s.my = 4; // adjacent — strike range
      const spearDef = Game.data.items.find(i => i.weapon && (i.weapon.range || 1) >= 2 && i.weapon.type === 'melee');
      s.equipped = s.equipped || {};
      if (spearDef) s.equipped.melee = { itemId: spearDef.id, name: spearDef.name };
      s.kcal = 30000; // strikes cost kcal; don't starve mid-proof
      let turns = 0;
      while (s.animal && turns < 150) {
        // hostile player: strike when adjacent via the REAL strike verb,
        // otherwise close in one honest tile per turn (no teleporting)
        const a = s.animal;
        const d = Math.max(Math.abs(a.mx - s.mx), Math.abs(a.my - s.my));
        if (d <= 1) { try { Game.huntAnimal(); } catch (e) { Game.animalTurn(); } }
        else {
          const nx = Math.max(0, Math.min(8, s.mx + Math.sign(a.mx - s.mx)));
          const ny = Math.max(0, Math.min(8, s.my + Math.sign(a.my - s.my)));
          s.mx = nx; s.my = ny;
          Game.animalTurn();
        }
        turns++;
        if (!s.animal) break;
      }
      if (!s.animal) ended++; else { spins++; console.log(`   seed ${seed}: SPUN at pstate=${s.animal.pstate} mx=${s.animal.mx} my=${s.animal.my}`); }
    }
    check('encounter ends within 150 honest turns, 6/6 seeds', ended === 6 && spins === 0, `ended=${ended} spins=${spins}`);
  }

  console.log('== H1. BUTCHER FOOTER == PROMISE ==');
  {
    freshGame();
    const s = Game.state.scholar;
    Game.learnTechnique && Game.learnTechnique('clean', 'trial');
    for (const id of ['white_tailed_deer', 'black_bear']) {
      const animal = (Game.data.animals || []).find(a => a.id === id);
      const footer = Game.encButcherHonesty(animal.calories, animal);
      const m = footer.match(/Cleans to ~(\d+) kcal × (\d+) raw portions/);
      check(id + ': footer parses', !!m, footer.slice(0, 80));
      if (!m) continue;
      const fPer = +m[1], fUnits = +m[2];
      s.inventory.length = 0;
      s.inventory.push(Game.foodCarcass(animal, animal.calories, s.day, 'hunted'));
      give('stone_knife', 1);
      said.length = 0;
      Game.cleanCarcass(0);
      const meat = s.inventory.find(i => i.foodState === 'cleaned' && /meat/i.test(i.plantId || ''));
      const gotPer = meat ? Math.round(meat.kcalEach) : -1;
      const gotUnits = meat ? meat.units : -1;
      check(id + ': footer per-portion == delivered', gotPer === fPer, `footer ${fPer} vs got ${gotPer}`);
      check(id + ': footer units == delivered', gotUnits === fUnits, `footer ${fUnits} vs got ${gotUnits}`);
      if (id === 'black_bear') {
        const fat = s.inventory.find(i => i.foodKind === 'fat');
        const meatKcal = (meat.kcalEach || 0) * (meat.units || 1);
        const fatKcal = fat ? (fat.hiddenKcal || 0) * (fat.units || 1) : 0;
        check('bear: meat+fat <= 0.95 gross (no energy creation)',
          meatKcal + fatKcal <= Math.round(animal.calories * 0.95) + 1,
          `meat ${meatKcal} + fat ${fatKcal} vs gross ${animal.calories}`);
      }
    }
  }

  console.log('== H2. TRAP LEARNABILITY PROMISE ==');
  {
    freshGame();
    const s = Game.state.scholar;
    const t = Game.playerTile();
    t.detail = flatGrid(); t.type = 'meadow';
    t.wildlife = { cottontail_rabbit: 4 };
    t.traps = [{ recipeId: 'snare', mx: 4, my: 4, setDay: s.day, uses: 10 }];
    Game.state.codex.recipes = Game.state.codex.recipes || {};
    delete Game.state.codex.recipes.snare;
    const _r = Math.random;
    Math.random = () => 0.0; // force the catch
    s.day += 1;
    said.length = 0;
    Game.checkTraps();
    Math.random = _r;
    const lvl = ((Game.state.codex.recipes || {}).snare || {}).level || 0;
    check('first witnessed catch grants snare L1', lvl >= 1, 'level=' + lvl);
    check('the shape-of-it line is said', said.some(m => /shape of it/i.test(m)),
      said.filter(m => /TRAP|shape/i.test(m)).join(' | ').slice(0, 160));
    check('catch itself narrated', said.some(m => /TRAP:.*caught/i.test(m)), '');
  }

  console.log('== H3. VILLAGER-HUNT FRAC VS butcherYieldFrac ==');
  {
    freshGame();
    const s = Game.state.scholar;
    Game.learnTechnique && Game.learnTechnique('clean', 'trial');
    const deer = (Game.data.animals || []).find(a => a.id === 'white_tailed_deer');
    const playerFrac = Game.butcherYieldFrac('hunted', deer.id);
    // the duty's flat numbers, from the source
    const dutyBase = 0.6, dutySkilled = 0.78;
    check('player helper base is 0.40 (knows clean)', Math.abs(playerFrac - 0.40) < 1e-9, 'playerFrac=' + playerFrac);
    check('duty base 0.6 != player 0.40 (comment claims "the same")', Math.abs(dutyBase - playerFrac) > 0.01,
      `duty ${dutyBase} vs player ${playerFrac} — comment lies, needs honest wording`);
    // with Field Dressing L3 the player reaches 0.40*2.197
    const skilled = Math.min(0.95, 0.40 * 2.197);
    check('duty skilled 0.78 != player skilled ~0.88', Math.abs(dutySkilled - skilled) > 0.01,
      `duty ${dutySkilled} vs player ${skilled.toFixed(3)}`);
  }

  console.log(`\nRESULT: ${pass} pass, ${fail} fail`);
  if (fails.length) { console.log('FAILS: ' + fails.join(' | ')); process.exit(1); }
})();

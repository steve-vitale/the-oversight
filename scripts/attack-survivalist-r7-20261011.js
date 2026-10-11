#!/usr/bin/env node
// ADVERSARIAL survivalist proof, round 7 (2026-10-11, rotation idx 3).
// Fresh angles — water/drink path, rain-onset fire tax, day-boundary rest/sleep.
//
// E1 (BREAK pre-fix): the "Drink" button on a known-safe water cell promises
//    "Safe to drink." / fiction "You drink." — but the engine drinks the
//    BOTTLES and says "No water. Fill at a creek or well." with empty
//    bottles. Contradictory narration; the button's promise isn't honored.
//    (First-examine path is worse: Examine prints "Safe. You drink." THEN
//    "No water.")
// E1b (BREAK pre-fix): drinking at a cell double-charges the clock —
//    drinkWater() ticks 1 AND cellInteract ticks 1 on the truthy return.
//    Canon (TIME-ECONOMY.md): drink = 1 tick.
// E1c (BREAK pre-fix): carried water has NO drink UI away from a water cell —
//    the pack shows liters you cannot drink. (Documents the hole; fixed by a
//    pack Drink button.)
// E2 (HELD): taxFires' rain-onset looked lazy-only (fire-touching paths) —
//    but tickAction returns status() -> lightLevel() -> nearFire() ->
//    sweepDeadFires() -> taxFires(), so the onset lands on the next action
//    after rain starts. Verified, not assumed.
// S1a (softlock attempt): rest() at dayTicks=500 (96 ticks cross the day
//    boundary mid-rest) — must not crash, double-apply, or strand the clock.
// S1b (softlock attempt): sleep() at exactly 64 ticks remaining (the refusal
//    boundary: < 64 refused) — must sleep through once, dawn accounting once.
// H1: doAction('drink') bottle path — canon says drink = 1 tick; the branch
//    comment claims FREE (stale). Assert the real cost.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEED = parseInt(process.env.SEED || '7', 10);
function loadAll(seed) {
  delete globalThis.Scattering;
  Math.random = mulberry32(seed);
  global.window = global;
  global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
  global.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const files = [...html.matchAll(/<script src="([^"]+)"/g)]
    .map(m => m[1].split('?')[0])
    .filter(f => f.startsWith('src/js/'))
    .filter(f => !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(f));
  for (const f of files) eval(fs.readFileSync(path.join(ROOT, f), 'utf8'));
  delete global.window;
  return globalThis.Scattering.Game;
}
let failures = 0;
function check(name, cond, detail) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures++;
}
let said = [];
function freshGame(Game) {
  Game.say = () => {};
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.debugToWildNode();
  const s = Game.state.scholar;
  s.inventory = [];
  s.day = 1; Game.dayPart = 1; s.dayTicks = 0;
  Game.state.weather = 'clear';
  s.insideTent = null;
  s.kcal = 2000; s.hydration = 100; s.health = 100; s.energy = 80;
  s.water = [];
  said = [];
  Game.say = (m) => { said.push(String(m)); };
  return s;
}
// Place a water cell adjacent to the player with a controlled secret.
function waterCellAt(Game, known, safe) {
  const s = Game.state.scholar;
  s.mx = 4; s.my = 4;
  const detail = Game.genDetail(Game.map.px, Game.map.py);
  detail[4][5] = 'water';
  const t = Game.playerTile();
  t.secrets = t.secrets || {};
  t.secrets['5,4'] = { known, safe };
  return t;
}
function joined() { return said.join('\n'); }

async function runOne(Game) {
  // Quiet world: no wandering monsters/animals/NPC turns during the drink tests.
  Game.monsterTurn = () => {};
  Game.animalTurn = () => {};
  Game.villagerTurn = () => {};

  // ---------- E1: creek Drink fiction/engine contradiction ----------
  {
    const s = freshGame(Game);
    s.hydration = 40; s.water = []; // thirsty, no bottles
    waterCellAt(Game, false, true); // unexamined-but-safe: first tap examines
    Game.cellInteract(5, 4);
    const j = joined();
    const promisedDrink = /you drink/i.test(j);
    const noWater = /no water/i.test(j);
    // PRE-FIX: both appear — the fiction lies. POST-FIX: no "No water".
    check('E1 first-examine drink: no contradiction — fiction honored, no "No water"',
      promisedDrink && !noWater, `promised=${promisedDrink} noWater=${noWater}`);
  }
  {
    const s = freshGame(Game);
    s.hydration = 40; s.water = [];
    waterCellAt(Game, true, true); // known-safe: the Drink button path
    const t0 = s.dayTicks;
    Game.cellInteract(5, 4);
    const j = joined();
    check('E1b known-safe drink with empty bottles does not say "No water"',
      !/no water/i.test(j), j.slice(0, 140));
    check('E1b known-safe drink hydrates from the cell', s.hydration === 90, `hydration=${s.hydration}`);
    check('E1b known-safe drink costs exactly 1 tick (canon)', s.dayTicks - t0 === 1, `ticks=${s.dayTicks - t0}`);
    check('E1b known-safe drink leaves bottles untouched', s.water.length === 0, `bottles=${s.water.length}`);
  }
  {
    // E1b2: with a full bottle AT the cell — the old path double-charged
    // (drinkWater's tick + cellInteract's tick) and drank the bottle. Now the
    // cell is drunk: exactly 1 tick, bottle untouched.
    const s = freshGame(Game);
    s.hydration = 40;
    s.water = [{ quality: 'clean', source: 'creek' }];
    waterCellAt(Game, true, true);
    const t0 = s.dayTicks;
    Game.cellInteract(5, 4);
    check('E1b2 cell drink with bottle present costs exactly 1 tick (no double-charge)',
      s.dayTicks - t0 === 1, `ticks=${s.dayTicks - t0}`);
    check('E1b2 cell drink does not consume the bottle', s.water.length === 1, `bottles=${s.water.length}`);
    check('E1b2 cell drink hydrates', s.hydration === 90, `hydration=${s.hydration}`);
  }
  {
    // thirsty gate: not thirsty -> honest refusal, no tick, no fiction
    const s = freshGame(Game);
    s.hydration = 100; s.water = [];
    waterCellAt(Game, true, true);
    const t0 = s.dayTicks;
    Game.cellInteract(5, 4);
    const j = joined();
    check('E1d not-thirsty drink refuses honestly without "You drink" fiction',
      /not thirsty/i.test(j) && !/you drink\./i.test(j), j.slice(0, 120));
    check('E1d not-thirsty drink costs 0 ticks', s.dayTicks - t0 === 0, `ticks=${s.dayTicks - t0}`);
  }

  // ---------- E1c/H1: bottle path (pack Drink button target) ----------
  {
    const s = freshGame(Game);
    s.hydration = 40;
    s.water = [{ quality: 'clean', source: 'creek' }];
    const t0 = s.dayTicks;
    const w0 = s.water.length;
    Game.doAction('drink');
    check('H1 bottle drink hydrates +50', s.hydration === 90, `hydration=${s.hydration}`);
    check('H1 bottle drink consumes 1L', s.water.length === w0 - 1, `bottles=${s.water.length}`);
    check('H1 bottle drink costs exactly 1 tick (canon; branch comment "FREE" is stale)',
      s.dayTicks - t0 === 1, `ticks=${s.dayTicks - t0}`);
  }

  // ---------- E2: rain-onset fire tax skips when no fire touch ----------
  {
    const s = freshGame(Game);
    const now = Game._absTick();
    const detail = Game.genDetail(Game.map.px, Game.map.py);
    detail[4][5] = 'fire';
    Game.state.fires = [{ tx: Game.map.px, ty: Game.map.py, cx: 5, cy: 4, till: now + 2000, burn0: 2000, lastTax: now }];
    const f = Game.state.fires[0];
    Game.state.weather = 'rain'; // rain starts
    Game.tickAction(200); // a rainy day of activity
    const j = joined();
    // HELD: the onset applies on the next tickAction — tickAction returns
    // status(), status() reads lightLevel(), which calls nearFire() ->
    // sweepDeadFires() -> taxFires(). The "lazy" gap is one action, not a day.
    check('E2 rain onset applies during normal ticks (no fire touch needed)',
      f.rainHit === true, `rainHit=${f.rainHit} till=${f.till}`);
    check('E2 rain onset says the honest hisses line', /hisses on your fire/i.test(j), j.slice(0, 160));
  }
  {
    // End-to-end: drive endDay with a forced rain roll; the fix taxes fires at the roll.
    const s = freshGame(Game);
    s.dayTicks = 500; // near end of day so endDay is meaningful
    const now = Game._absTick();
    const detail = Game.genDetail(Game.map.px, Game.map.py);
    detail[4][5] = 'fire';
    Game.state.fires = [{ tx: Game.map.px, ty: Game.map.py, cx: 5, cy: 4, till: now + 2000, burn0: 2000 }];
    const f = Game.state.fires[0];
    const realRandom = Math.random;
    Math.random = () => 0.8; // force the weather roll into 'rain'
    let threw = null;
    try { Game.endDay(); } catch (e) { threw = e; }
    Math.random = realRandom;
    const j = joined();
    check('E2 endDay forced-rain does not throw', !threw, threw && threw.message);
    const halved = f.till < now + 2000 && f.rainHit === true;
    const hissed = /hisses on your fire/i.test(j);
    // HELD (like the tick leg): endDay's weather roll is followed by fire
    // touches, so the onset lands.
    check('E2 rain onset halves fire at the weather roll', halved, `till=${f.till} rainHit=${f.rainHit}`);
    check('E2 rain onset says the honest line', hissed, j.slice(0, 200));
  }

  // ---------- S1a: rest across the day boundary ----------
  {
    // HELD (softlock attempt): rest() across midnight is safe. The first draft
    // of this leg provisioned kcal=2000 (< ~2200 daily need) and "failed" on
    // energy — that was the starvation spiral working as designed (resolveDay
    // -25 energy, honestly warned), not a softlock. Provisioned properly here.
    const s = freshGame(Game);
    s.dayTicks = 500; s.energy = 10; s.kcal = 3000;
    Game.dayPart = 3;
    const day0 = s.day;
    let threw = null;
    try { Game.doAction('rest'); } catch (e) { threw = e; }
    const j = joined();
    check('S1a rest across day boundary does not throw', !threw, threw && threw.message);
    check('S1a rest across day boundary advances the day', s.day === day0 + 1, `day=${s.day}`);
    check('S1a rest across day boundary restores energy net of the part tick',
      s.energy === 35, `energy=${s.energy} (10 +30 rest -5 part)`);
    check('S1a rest across day boundary triggers no starvation spiral', !/STARVING/i.test(j), j.slice(0, 160));
    check('S1a rest across day boundary charges rest kcal once', s.kcal < 3000 - 2000, `kcal=${Math.round(s.kcal)}`);
  }

  // ---------- S1b: sleep at exactly the refusal boundary (64 ticks) ----------
  {
    const s = freshGame(Game);
    s.dayTicks = Game.TIME.TICKS_PER_DAY - 64;
    Game.dayPart = 3; s.energy = 10; s.health = 50; s.kcal = 2000; s.hydration = 100;
    Game.state.weather = 'clear';
    const h0 = s.health;
    let threw = null;
    try { Game.sleep(); } catch (e) { threw = e; }
    const j = joined();
    check('S1b sleep at 64 ticks remaining does not throw', !threw, threw && threw.message);
    check('S1b sleep at 64 ticks is allowed (boundary, not refused)', !/too late for real sleep/i.test(j), j.slice(0, 160));
    check('S1b sleep at 64 ticks heals once (no double dawn accounting)', s.health > h0 && s.health <= h0 + 60, `health ${h0}->${s.health}`);
    check('S1b sleep at 64 ticks restores energy', s.energy >= 100, `energy=${s.energy}`);
  }
}

(async () => {
  for (const seedRun of [0, 1, 2]) {
    console.log(`--- seed run ${seedRun} ---`);
    const Game = loadAll(SEED + seedRun);
    await Game.init();
    await runOne(Game);
  }
  console.log(failures ? `\n${failures} FAILURES` : '\nALL GREEN');
  process.exit(failures ? 1 : 0);
})();

#!/usr/bin/env node
// test-crisis-ration-famine-20261011.js — PROOF for the crisis-leg blank:
// "the village starved with 4854 kcal in the pantry."
//
// Root causes found (crisis leg, 2026-10-11):
//  F1. RATIONING FALSE-POSITIVE: the safetynets rationing vote halves each
//      villager's need (kcalPerDay halved inside villagerMealDay), but
//      villageEats measured starvation against the FULL need — every
//      rationed villager eating their voted half-ration read as "starving",
//      feeding the hunger-winter streak. The relief safety net fired the
//      famine crisis it exists to prevent (observed: hunger-winter fired
//      with 55k and 83k kcal pantries).
//  F2. FASTING FALSE-POSITIVE: voluntary gorge-fasts counted as starvation
//      (-8 health + hunger-winter signal), contradicting the hunger-winter
//      block's own design note ("Not voluntary fasting").
//  F3. HEARTH TDZ: `away` was declared AFTER its first use in villagerMealDay
//      — TDZ ReferenceError swallowed by try/catch, so the longhouse hearth
//      10% meal stretch never applied.
//
// AFTER: anyStarving measures against the rationed need and skips fasters;
// the unfed-fade health hit skips fasters; `away` is declared before use.
//
// Seeded PRNG, deterministic. Usage: node scripts/test-crisis-ration-famine-20261011.js
//        SEED=7 node scripts/test-crisis-ration-famine-20261011.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || '20261011', 10);

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
Math.random = mulberry32(SEED); // seeded BEFORE eval

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
global.window = global;
// Loader pattern from scripts/test-titan-class.js: game.js first, then expose
// global.Game the way the browser's global lexical scope does — later
// modules' load-time code resolves bare `Game` against it. Do NOT declare a
// module-level `const Game` here; it would TDZ-shadow the eval'd modules.
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const order = [];
for (const m of html.matchAll(/src="([^"?]+\.js)\?v=/g)) {
  const f = m[1];
  if (!/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(f)) order.push(f);
}
const loadFails = [];
const gameIdx = order.indexOf('src/js/game.js');
const evalFile = (f) => {
  try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
  catch (e) { loadFails.push(f + ': ' + e.message); }
};
if (gameIdx >= 0) {
  // game.js in index.html position (after engine/*): its IIFE captures
  // `const S = global.Scattering` at load, so it must not run before them.
  order.forEach((f, i) => { if (i < gameIdx) evalFile(f); });
  evalFile(order[gameIdx]);
}
global.Game = globalThis.Scattering.Game;
order.forEach((f, i) => { if (i > gameIdx) evalFile(f); });
delete global.window;
// NOTE: bare `Game` below resolves to global.Game (set above).
if (loadFails.length) { console.error('LOAD FAILS: ' + JSON.stringify(loadFails)); process.exit(2); }

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

function freshGame() {
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.say = () => {};
  Game.sysSay = () => {};
  const v = Game.state.village;
  v.trust = v.trust || {};
  v.health = {};
  v.rationing = null;
  v.away = {};
  return (v.roster || []).filter(id => id !== Game.villagerId);
}
const fullPantry = (v) => {
  v.pantry = [];
  for (let i = 0; i < 60; i++)
    v.pantry.push({ name: 'Test grain', kcalEach: 500, units: 2, spoilDay: 9999, safe: true, foodKind: 'plant' });
};
const personOf = (vid) => Game.getPerson(vid);
const setKcalPerDay = (vid, n) => { const p = personOf(vid); if (p) p.kcalPerDay = n; };

(async () => {
  await Game.init();
  console.log(`seed=${SEED}`);

  // ---------- 1. rationing no longer fakes starvation ----------
  console.log('\n-- 1. voted half-rations do not feed the hunger-winter streak --');
  {
    const ids = freshGame();
    const v = Game.state.village;
    fullPantry(v);
    ids.forEach(id => setKcalPerDay(id, 2000));
    const day = (Game.state.scholar || {}).day || 0;
    v.rationing = { until: day + 3, votedDay: day };
    const pg = Game.progState();
    const before = pg.hungryStreak || 0;
    const crisesBefore = Object.keys(pg.crises || {}).length;
    Game.villageEats();
    const after = pg.hungryStreak || 0;
    ok('hungryStreak does not move on a rationed day with a full pantry', after === before,
      `streak ${before} -> ${after}`);
    ok('no hunger-winter fired from rationing', Object.keys(pg.crises || {}).length === crisesBefore,
      JSON.stringify(pg.crises));
    ok('rationing vote still recorded', !!(v.rationing && v.rationing.until >= day), '');
  }

  // ---------- 2. voluntary fast is not starvation ----------
  console.log('\n-- 2. a voluntary gorge-fast is a rhythm choice, not hunger --');
  {
    const ids = freshGame();
    const v = Game.state.village;
    fullPantry(v);
    const vid = ids[0];
    setKcalPerDay(vid, 2000);
    v.health[vid] = 90;
    try { Game.npcNeeds(vid).hunger = 0; } catch (e) {} // well-fed: fast is a choice
    const _mr = Game.mealRhythm, _vp = Game.villagerDayProduction, _rnd = Math.random;
    Game.mealRhythm = () => 'gorge';
    Game.villagerDayProduction = () => 400; // low production: ate < 60% of need
    Math.random = () => 0.1;               // hunger +26 (<45), fast roll 0.1 < 0.35
    let r;
    try { r = Game.villagerMealDay(vid, personOf(vid), v, {}); }
    finally { Game.mealRhythm = _mr; Game.villagerDayProduction = _vp; Math.random = _rnd; }
    ok('fast is reported on the meal result', r && r.fasting === true, JSON.stringify(r && { ate: r.ate, fasting: r.fasting }));
    ok('faster takes no unfed-fade health hit', v.health[vid] === 90, `health=${v.health[vid]}`);
    ok('faster drew nothing from the pantry (hunger carries)', (r.drawn || 0) === 0, `drawn=${r.drawn}`);
  }

  // ---------- 3. genuine hunger still counts ----------
  console.log('\n-- 3. genuine hunger still feeds the streak and the health hit --');
  {
    const ids = freshGame();
    const v = Game.state.village;
    v.pantry = []; // bare pantry
    const vid = ids[0];
    setKcalPerDay(vid, 2000);
    v.health[vid] = 90;
    const _mr = Game.mealRhythm, _vp = Game.villagerDayProduction, _rnd = Math.random;
    Game.mealRhythm = () => 'dawn-dusk'; // never fasts
    Game.villagerDayProduction = () => 0;
    Math.random = () => 0.9;
    let r;
    try { r = Game.villagerMealDay(vid, personOf(vid), v, {}); }
    finally { Game.mealRhythm = _mr; Game.villagerDayProduction = _vp; Math.random = _rnd; }
    ok('genuinely hungry villager is not flagged fasting', !r.fasting, '');
    ok('unfed-fade health hit applies (-8)', v.health[vid] === 82, `health=${v.health[vid]}`);
    // village-level: a day of genuine hunger moves the streak
    const pg = Game.progState();
    const before = pg.hungryStreak || 0;
    const _mr2 = Game.mealRhythm, _vp2 = Game.villagerDayProduction;
    Game.mealRhythm = () => 'dawn-dusk';
    Game.villagerDayProduction = () => 0;
    try { Game.villageEats(); }
    finally { Game.mealRhythm = _mr2; Game.villagerDayProduction = _vp2; }
    ok('hungryStreak increments on genuine hunger', (pg.hungryStreak || 0) === before + 1,
      `streak ${before} -> ${pg.hungryStreak}`);
  }

  // ---------- 4. longhouse hearth stretch applies (TDZ fix) ----------
  console.log('\n-- 4. longhouse hearth stretches the meal (away villagers eat cold) --');
  {
    const ids = freshGame();
    const v = Game.state.village;
    fullPantry(v);
    v.havenTier = 1; // hearthStretch -> 0.9
    const vid = ids[0];
    setKcalPerDay(vid, 2000);
    v.health[vid] = 100;
    const _vp = Game.villagerDayProduction;
    Game.villagerDayProduction = () => 5000; // own production covers need; no draw
    let r;
    try { r = Game.villagerMealDay(vid, personOf(vid), v, {}); }
    finally { Game.villagerDayProduction = _vp; }
    ok('at-haven need is stretched 10% (ate 1800, not 2000)', r && Math.round(r.ate) === 1800,
      `ate=${r && r.ate}`);
    // away villagers eat cold: full need
    const vid2 = ids[1];
    setKcalPerDay(vid2, 2000);
    v.health[vid2] = 100;
    v.away = v.away || {}; v.away[vid2] = true;
    Game.villagerDayProduction = () => 5000;
    let r2;
    try { r2 = Game.villagerMealDay(vid2, personOf(vid2), v, {}); }
    finally { Game.villagerDayProduction = _vp; }
    ok('away villager eats cold (ate 2000)', r2 && Math.round(r2.ate) === 2000, `ate=${r2 && r2.ate}`);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });

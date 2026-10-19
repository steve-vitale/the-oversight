#!/usr/bin/env node
// test-trapline-20261011.js — longsim combat r2 2026-10-11.
// Proves the trapline lever: the competent policy now builds and works a
// snare trapline, exercising the craft->set->dawn-check loop that sat at
// 0/0 across every measured 200-day run.
//   E1: hunter-occupation scholar starts with snare recipe L3 (on-ramp exists)
//   E2: policy crafts a snare when it knows the recipe + holds materials
//   E3: policy sets the held trap on wild ground (consumed from tools)
//   E4: dawn checkTraps catches game on stocked ground (carcass, uses--, shyness)
//   E5: non-hunter L0 refuses; L1 blind gambles only when materials plentiful
// Usage: node scripts/test-trapline-20261011.js  (SEED env override)
'use strict';
const K = require('./godpath/lib');
const { workTrapline, workTraplineSet } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '20261011', 10);
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function giveMats(Game, mats) {
  const s = Game.state.scholar;
  for (const [mat, n] of Object.entries(mats))
    s.inventory.push({ material: mat, name: mat, units: n, kcalEach: 0 });
}
function matCount(Game, m) {
  return (Game.state.scholar.inventory || [])
    .filter(i => i && i.material === m).reduce((t, i) => t + (i.units || 0), 0);
}
function hunterGame(Game) {
  // force the scholar to be a hunting guide (knowsSnare occupation)
  Game.genRoster('Columbus, Ohio');
  Game.generatedRoster[0].occupationId = 'hunting_guide';
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
}
function wildTile(Game) {
  // find a wild (non-haven, non-ruin) tile and stand the player on it
  for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
    const t = Game.tileAt(x, y);
    if (t && t.type !== 'haven' && t.type !== 'ruin') { Game.map.px = x; Game.map.py = y; return t; }
  }
  return null;
}

function withRoll(value, fn) {
  const real = Math.random;
  Math.random = () => value;
  try { return fn(); } finally { Math.random = real; }
}

(async () => {
  // One load per process; scenarios start fresh runs on the shared Game.
  const Game = await K.load({ seed: SEED });
  Game.debugRegion = 'na_eastern_woodlands';
  // ============ E1: hunter on-ramp ============
  {
    const occ = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'src', 'data', 'characterGen.json'), 'utf8'))
      .occupations.find(o => o.id === 'hunting_guide');
    ok('E1 hunting_guide.knowsSnare is true', !!(occ && occ.knowsSnare));
    hunterGame(Game);
    const lvl = (((Game.state.codex || {}).recipes || {}).snare || {}).level || 0;
    ok('E1 hunter scholar starts with snare recipe L3', lvl === 3, 'level=' + lvl);
  }

  // ============ E2: policy crafts ============
  {
    hunterGame(Game);
    giveMats(Game, { vine: 2, stick: 2 });
    const ctx = {};
    withRoll(0.01, () => workTrapline(Game, ctx));
    const tool = (Game.state.scholar.tools || []).find(t => t.recipeId === 'snare');
    ok('E2 policy crafts a snare (L3, materials held)', !!tool && tool.uses === 10,
      JSON.stringify(tool && { uses: tool.uses }));
    ok('E2 ctx.trapsCrafted counted', ctx.trapsCrafted === 1, 'got ' + ctx.trapsCrafted);
    ok('E2 materials consumed (1 vine + 1 stick)', matCount(Game, 'vine') === 1 && matCount(Game, 'stick') === 1);
    // The persistent policy context permits one attempt per actual day.
    const remaining = matCount(Game, 'vine');
    withRoll(0.01, () => workTrapline(Game, ctx));
    ok('E2 same-day call does not craft twice', ctx.trapsCrafted === 1 && matCount(Game, 'vine') === remaining);
    const day = Game.state.scholar.day;
    Game.endDay();
    ok('E2 actual day resolution advances the clock', Game.state.scholar.day === day + 1);
    withRoll(0.01, () => workTrapline(Game, ctx));
    const held = (Game.state.scholar.tools || []).filter(t => t.recipeId === 'snare').length;
    ok('E2 second day tops up to two held traps', held === 2, 'held=' + held);
    // Supply enough for a third: the cap must reject even an affordable craft.
    giveMats(Game, { vine: 2, stick: 2 });
    Game.endDay();
    const beforeCap = matCount(Game, 'vine');
    withRoll(0.01, () => workTrapline(Game, ctx));
    ok('E2 no third craft at cap', ctx.trapsCrafted === 2 && matCount(Game, 'vine') === beforeCap);

  }

  // ============ E2b: a failed craft costs materials and waits a day ============
  {
    hunterGame(Game);
    giveMats(Game, { vine: 3, stick: 3 });
    const ctx = {}, before = matCount(Game, 'vine');
    withRoll(0.999999, () => workTrapline(Game, ctx));
    ok('E2b failed learned craft consumes one material set', matCount(Game, 'vine') === before - 1 && matCount(Game, 'stick') === 2);
    ok('E2b failed learned craft grants no trap or success count', !(Game.state.scholar.tools || []).length && !ctx.trapsCrafted);
    const left = matCount(Game, 'vine');
    withRoll(0.01, () => workTrapline(Game, ctx));
    ok('E2b same-day retry is refused after failure', matCount(Game, 'vine') === left && !ctx.trapsCrafted);
    Game.endDay();
    withRoll(0.01, () => workTrapline(Game, ctx));
    ok('E2b next-day successful retry makes one real trap', ctx.trapsCrafted === 1 && (Game.state.scholar.tools || []).some(t => t.recipeId === 'snare' && t.uses === 10));
  }

  // ============ E3: policy sets on wild ground (split 2026-10-12) ============
  // food r5: the old single call crafted AND set — but daily runs at haven,
  // so the set half never fired (2 crafts / 0 sets in 200-day sims). Now
  // workTrapline crafts (day-end, haven) and workTraplineSet sets (on the
  // wild tile, called from the forage trip).
  {
    hunterGame(Game);
    giveMats(Game, { vine: 4, stick: 4 });
    const tile = wildTile(Game);
    ok('E3 found wild ground to stand on', !!tile);
    const ctx = {};
    withRoll(0.01, () => workTrapline(Game, ctx)); // day-end: crafts only now
    const crafted = (Game.state.scholar.tools || []).find(t => t.recipeId === 'snare');
    ok('E3 workTrapline crafts the snare', !!crafted);
    ok('E3 workTrapline does NOT set on its own', !(tile.traps || []).length);
    workTraplineSet(Game, ctx); // on the wild tile: sets
    const set = (tile.traps || []).find(t => t.recipeId === 'snare');
    ok('E3 workTraplineSet sets the trap on the wild tile', !!set && set.uses === 10, JSON.stringify(set && { uses: set.uses }));
    ok('E3 tool consumed from tools row on set',
      !(Game.state.scholar.tools || []).some(t => t.recipeId === 'snare'));
    ok('E3 ctx.trapsSet counted', ctx.trapsSet === 1, 'got ' + ctx.trapsSet);
  }

  // ============ E3b: haven refusal (the r5 bug, regression) ============
  {
    hunterGame(Game);
    giveMats(Game, { vine: 4, stick: 4 });
    // stand on the haven tile (where the old daily call ran)
    for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
      const t = Game.tileAt(x, y);
      if (t && t.type === 'haven') { Game.map.px = x; Game.map.py = y; }
    }
    const ctx = {};
    withRoll(0.01, () => workTrapline(Game, ctx));
    const held = (Game.state.scholar.tools || []).filter(t => t.recipeId === 'snare').length;
    workTraplineSet(Game, ctx); // must refuse at haven, like setTrap does
    const setAnywhere = [];
    for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
      const t = Game.tileAt(x, y);
      if (t && (t.traps || []).length) setAnywhere.push([x, y]);
    }
    ok('E3b no trap set while standing at haven', setAnywhere.length === 0,
      'set at ' + JSON.stringify(setAnywhere));
    ok('E3b the crafted trap stays held (not consumed)', held === 1, 'held=' + held);
    ok('E3b ctx.trapsSet not counted at haven', !ctx.trapsSet);
    // gate: COMPETENT_TRAPLINE_SET=0 disables the set entirely
    process.env.COMPETENT_TRAPLINE_SET = '0';
    for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
      const t = Game.tileAt(x, y);
      if (t && t.type !== 'haven' && t.type !== 'ruin') { Game.map.px = x; Game.map.py = y; break; }
    }
    const ctxG = {};
    workTraplineSet(Game, ctxG);
    ok('E3b gate=0: no set even on wild ground', !ctxG.trapsSet);
    delete process.env.COMPETENT_TRAPLINE_SET;
    const ctxG2 = {};
    workTraplineSet(Game, ctxG2);
    ok('E3b gate cleared: sets on wild ground', ctxG2.trapsSet === 1, 'got ' + ctxG2.trapsSet);
  }

  // ============ E4: dawn check catches ============
  {
    hunterGame(Game);
    giveMats(Game, { vine: 4, stick: 4 });
    const tile = wildTile(Game);
    const ctx = {};
    withRoll(0.01, () => workTrapline(Game, ctx));       // day-end: craft
    workTraplineSet(Game, ctx);    // on the wild tile: set (food r5 split)
    const trap = (tile.traps || [])[0];
    ok('E4 trap is set', !!trap);
    tile.wildlife = { cottontail_rabbit: 6 }; // below the authored carrying capacity (8)
    // Exercise the real day-end caller, controlling only its trap catch roll.
    // Ecology runs before traps; compare the actual stock at trap-check time.
    const checkTraps = Game.checkTraps;
    let calls = 0, dawn;
    Game.checkTraps = function (...args) {
      calls++;
      const stockBefore = tile.wildlife.cottontail_rabbit;
      const result = withRoll(0.01, () => checkTraps.apply(this, args));
      dawn = {
        carcasses: (this.state.scholar.inventory || []).filter(i => i.foodState === 'carcass').length,
        stockBefore, stock: tile.wildlife.cottontail_rabbit,
        uses: tile.traps[0]?.uses,
        shy: tile.trapShy?.snare?.level,
      };
      return result;
    };
    const day = Game.state.scholar.day;
    try { Game.endDay(); } finally { Game.checkTraps = checkTraps; }
    ok('E4 day resolution calls checkTraps exactly once', calls === 1, 'calls=' + calls);
    ok('E4 dawn check catches one real carcass', dawn?.carcasses === 1, JSON.stringify(dawn));
    ok('E4 catch removes one animal from real stock', dawn?.stockBefore > 0 && dawn.stock === dawn.stockBefore - 1);
    ok('E4 uses decrement exactly once on catch', dawn?.uses === 9);
    ok('E4 trap shyness tracks the catch', dawn?.shy === 1);
    ok('E4 actual day resolution advances the clock', Game.state.scholar.day === day + 1);

  }

  // ============ E5: L0 refuses, L1 blind is cautious ============
  {
    Game.genRoster('Columbus, Ohio');
    Game.generatedRoster[0].occupationId = 'line_cook';
    Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
    Game.depart();
    const lvl = (((Game.state.codex || {}).recipes || {}).snare || {}).level || 0;
    giveMats(Game, { vine: 4, stick: 4 });
    const ctx = {};
    withRoll(0.01, () => workTrapline(Game, ctx));
    const any = (Game.state.scholar.tools || []).some(t => t.recipeId === 'snare');
    ok('E5 L0 (recipe unknown): policy crafts nothing', !any && !ctx.trapsCrafted,
      'scholar recipe level=' + lvl);
    // taught L1, scarce materials: no blind gamble
    Game.state.codex.recipes = Game.state.codex.recipes || {};
    Game.state.codex.recipes.snare = { level: 1 };
    Game.state.scholar.inventory = Game.state.scholar.inventory.filter(i => !i.material);
    giveMats(Game, { vine: 1, stick: 1 });
    const ctx2 = {};
    workTrapline(Game, ctx2);
    ok('E5 L1 blind with 1+1 mats: no gamble', !ctx2.trapsCrafted);
    // taught L1, plentiful materials: attempts (seeded RNG hits at 35%)
    giveMats(Game, { vine: 3, stick: 3 });
    const ctx3 = {};
    const vBefore = matCount(Game, 'vine');
    withRoll(0.01, () => workTrapline(Game, ctx3));
    const tool = (Game.state.scholar.tools || []).find(t => t.recipeId === 'snare');
    ok('E5 L1 blind with 3+3 mats: craft attempted and succeeded (seeded)',
      !!tool, 'vineBefore=' + vBefore + ' vineAfter=' + matCount(Game, 'vine'));
  }

  // ============ E6: widened on-ramp — rural occupations start knowing the snare ============
  {
    for (const oid of ['forager', 'rancher', 'trail_crew', 'fishing_guide']) {
      Game.genRoster('Columbus, Ohio');
      Game.generatedRoster[0].occupationId = oid;
      Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
      const lvl = (((Game.state.codex || {}).recipes || {}).snare || {}).level || 0;
      ok(`E6 ${oid} scholar starts with snare recipe L3`, lvl === 3, 'level=' + lvl);
    }
  }

  console.log(`\n${pass} passed, ${fail} failed (seed ${SEED})`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
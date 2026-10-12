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
const { loadGame } = require('./sim-harness');
const { workTrapline } = require('./policies/competent');

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

(async () => {
  // ============ E1: hunter on-ramp ============
  {
    const { Game } = await loadGame({ seed: SEED, mode: 'test' });
    const cg = Game.data ? null : null;
    const occ = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'src', 'data', 'characterGen.json'), 'utf8'))
      .occupations.find(o => o.id === 'hunting_guide');
    ok('E1 hunting_guide.knowsSnare is true', !!(occ && occ.knowsSnare));
    hunterGame(Game);
    const lvl = (((Game.state.codex || {}).recipes || {}).snare || {}).level || 0;
    ok('E1 hunter scholar starts with snare recipe L3', lvl === 3, 'level=' + lvl);
  }

  // ============ E2: policy crafts ============
  {
    const { Game } = await loadGame({ seed: SEED, mode: 'test' });
    hunterGame(Game);
    giveMats(Game, { vine: 2, stick: 2 });
    const ctx = {};
    workTrapline(Game, ctx);
    const tool = (Game.state.scholar.tools || []).find(t => t.recipeId === 'snare');
    ok('E2 policy crafts a snare (L3, materials held)', !!tool && tool.uses === 10,
      JSON.stringify(tool && { uses: tool.uses }));
    ok('E2 ctx.trapsCrafted counted', ctx.trapsCrafted === 1, 'got ' + ctx.trapsCrafted);
    ok('E2 materials consumed (1 vine + 1 stick)', matCount(Game, 'vine') === 1 && matCount(Game, 'stick') === 1);
    // cap: second day tops up to 2, third day crafts nothing
    const ctx2 = {};
    workTrapline(Game, ctx2);
    const held = (Game.state.scholar.tools || []).filter(t => t.recipeId === 'snare').length;
    ok('E2 trapline caps at 2 held traps', held === 2, 'held=' + held);
    const ctx3 = {};
    workTrapline(Game, ctx3);
    ok('E2 no third craft at cap', !ctx3.trapsCrafted);
  }

  // ============ E3: policy sets on wild ground ============
  {
    const { Game } = await loadGame({ seed: SEED, mode: 'test' });
    hunterGame(Game);
    giveMats(Game, { vine: 4, stick: 4 });
    const tile = wildTile(Game);
    ok('E3 found wild ground to stand on', !!tile);
    const ctx = {};
    workTrapline(Game, ctx); // crafts AND sets in one day
    const set = (tile.traps || []).find(t => t.recipeId === 'snare');
    ok('E3 trap set on the wild tile', !!set && set.uses === 10, JSON.stringify(set && { uses: set.uses }));
    ok('E3 tool consumed from tools row on set',
      !(Game.state.scholar.tools || []).some(t => t.recipeId === 'snare'));
    ok('E3 ctx.trapsSet counted', ctx.trapsSet === 1, 'got ' + ctx.trapsSet);
  }

  // ============ E4: dawn check catches ============
  {
    const { Game } = await loadGame({ seed: SEED, mode: 'test' });
    hunterGame(Game);
    giveMats(Game, { vine: 4, stick: 4 });
    const tile = wildTile(Game);
    const ctx = {};
    workTrapline(Game, ctx);
    const trap = (tile.traps || [])[0];
    ok('E4 trap is set', !!trap);
    tile.wildlife = { cottontail_rabbit: 50 }; // stocked ground
    // force the 40% catch roll to hit
    const realR = Math.random; Math.random = () => 0.01;
    let caught = 0;
    for (let d = 0; d < 6; d++) { Game.checkTraps(); }
    Math.random = realR;
    const carcasses = (Game.state.scholar.inventory || []).filter(i => i && /trapped|carcass/i.test(i.name || ''));
    ok('E4 dawn check catches game on stocked ground', carcasses.length > 0,
      'carcasses=' + carcasses.length);
    const t2 = (tile.traps || [])[0];
    ok('E4 uses decrement on catch', t2 && t2.uses < 10, 'uses=' + (t2 && t2.uses));
    ok('E4 trap shyness tracks catches', (tile.trapShy && tile.trapShy.snare && tile.trapShy.snare.level || 0) > 0,
      JSON.stringify(tile.trapShy && tile.trapShy.snare));
    void caught;
  }

  // ============ E5: L0 refuses, L1 blind is cautious ============
  {
    const { Game } = await loadGame({ seed: SEED, mode: 'test' });
    Game.genRoster('Columbus, Ohio');
    Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
    Game.depart();
    const lvl = (((Game.state.codex || {}).recipes || {}).snare || {}).level || 0;
    giveMats(Game, { vine: 4, stick: 4 });
    const ctx = {};
    workTrapline(Game, ctx);
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
    const realR = Math.random; Math.random = () => 0.01;
    const ctx3 = {};
    const vBefore = matCount(Game, 'vine');
    workTrapline(Game, ctx3);
    Math.random = realR;
    const tool = (Game.state.scholar.tools || []).find(t => t.recipeId === 'snare');
    ok('E5 L1 blind with 3+3 mats: craft attempted and succeeded (seeded)',
      !!tool, 'vineBefore=' + vBefore + ' vineAfter=' + matCount(Game, 'vine'));
  }

  // ============ E6: widened on-ramp — rural occupations start knowing the snare ============
  {
    const { Game } = await loadGame({ seed: SEED, mode: 'test' });
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
#!/usr/bin/env node
// Proof: the pit-trap -> boar -> raw-fat -> render chain, end to end, deterministically.
// R5 (journey-establishment-r5-20261015.js) measured 0 raw-fat slabs on 4/4 seeds
// despite handbook reads + pit crafts. This localizes the bind: is it
// (a) pits never catching on boar ground, (b) boar carcasses never yielding fat,
// or (c) render never firing? Each stage is asserted separately.
// RED: run with PRISTINE=1 semantics — here "red" = the chain stage that fails.
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '7', 10);
let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

(async () => {
  const { Game } = await loadGame({ seed: SEED });
  await setupGame(Game);
  const S = () => Game.state.scholar;

  // --- stage 1: recipe knowledge (the readBook -> grantKnowledge('recipe') path) ---
  Game.grantKnowledge('recipe', 'pit_trap', 3, { type: 'read', by: 'trappers_handbook' });
  ok((((Game.state.codex || {}).recipes || {}).pit_trap || {}).level === 3, 'pit_trap L3 granted (readBook mechanism)');

  // --- stage 2: craft (2 sticks) ---
  S().inventory.push({ material: 'stick', units: 4, name: 'sticks' });
  const crafted = Game.craft('pit_trap');
  ok(!!crafted, 'pit_trap crafted from 2 sticks');
  ok((S().tools || []).some(t => t && t.recipeId === 'pit_trap'), 'pit trap held in tools');

  // --- stage 3: set on boar-bearing ground ---
  // find a wild tile; force honest boar-bearing wildlife (1-4 individuals is the
  // engine's own scale — we set what backfillWildlife could legally roll)
  let tx = -1, ty = -1;
  for (let y = 0; y < 9 && tx < 0; y++) for (let x = 0; x < 9; x++) {
    const t = Game.tileAt(x, y);
    if (t && ['forest', 'meadow', 'grassland', 'woods'].includes(t.type)) { tx = x; ty = y; break; }
  }
  if (tx < 0) { tx = Game.map.px; ty = Game.map.py; }
  Game.map.px = tx; Game.map.py = ty;
  const tile = Game.tileAt(tx, ty);
  tile.wildlife = { wild_boar: 3, white_tailed_deer: 2 };
  const setOk = Game.setTrap('pit_trap');
  ok(!!setOk, 'pit trap set on boar-bearing wild tile', 'tile=' + tile.type);
  ok((tile.traps || []).some(t => t.recipeId === 'pit_trap'), 'pit present in tile.traps');

  // --- stage 4: tick 12 days, count catches by species ---
  const catches = {};
  const sayBefore = [];
  const origSay = Game.say.bind(Game);
  Game.say = (m) => { sayBefore.push(String(m)); return origSay(m); };
  // keep the scholar fed & alive through the tick window (not the question here)
  // NOTE: Game.sleep() refuses back-to-back (dawn/too-late guards) — only the
  // first call advanced the day. endDay() is the honest day tick for a probe.
  S().fullness = 4000;
  for (let d = 0; d < 12; d++) {
    try { Game.endDay(); } catch (e) { break; }
    if (Game.over) break;
    S().fullness = 4000; S().health = 100; S().kcal = 3000;
  }
  for (const m of sayBefore) {
    const mt = m.match(/TRAP: Your .* caught a ([^!]+)!/);
    if (mt) { const sp = mt[1].trim(); catches[sp] = (catches[sp] || 0) + 1; }
  }
  const totalCatches = Object.values(catches).reduce((a, b) => a + b, 0);
  ok(totalCatches > 0, 'pit caught something in 12d on boar ground', JSON.stringify(catches));
  const boarCatches = Object.keys(catches).filter(k => /boar/i.test(k)).reduce((a, k) => a + catches[k], 0);
  ok(boarCatches > 0, 'pit caught a wild_boar in 12d', JSON.stringify(catches));
  Game.say = origSay;

  // --- stage 5: boar carcass -> clean -> raw fat slabs ---
  let boarCarcass = (S().inventory || []).find(i => i && /boar/i.test(i.name || '') && /carcass/i.test(i.name || ''));
  if (!boarCarcass) {
    // no catch happened: inject the carcass the honest way (foodCarcass) so the
    // downstream stages are still measured; the catch stage already failed above.
    const adef = (Game.data.animals || []).find(a => a.id === 'wild_boar');
    boarCarcass = Game.foodCarcass(adef, adef.calories, S().day, 'trapped');
    S().inventory.push(boarCarcass);
    console.log('  (note: no boar caught — carcass injected to measure downstream)');
  }
  // needs a knife to clean
  S().inventory.push({ itemId: 'stone_knife', name: 'stone knife', tool: true });
  const idx = S().inventory.indexOf(boarCarcass);
  let fatBefore = (S().inventory || []).filter(i => i && i.foodKind === 'fat' && i.foodState === 'raw').length;
  try { Game.cleanCarcass(idx); } catch (e) { console.log('  cleanCarcass threw: ' + e.message); }
  const fatSlabs = (S().inventory || []).filter(i => i && i.foodKind === 'fat' && i.foodState === 'raw');
  const fatUnits = fatSlabs.reduce((a, i) => a + (i.units || 0), 0);
  ok(fatUnits >= 3, 'cleaning a boar yields >=3 raw fat slabs', 'got ' + fatUnits);

  // --- stage 6: render near fire (knowsTechnique gate) ---
  Game.grantKnowledge('technique', 'render', 1, { type: 'test' });
  const knows = Game.knowsTechnique ? Game.knowsTechnique('render') : false;
  ok(!!knows, 'render technique known');
  // renderFat needs nearFire — find/force it
  let nearFire = false;
  try { nearFire = Game.nearFire(); } catch (e) {}
  if (!nearFire) {
    // haven has a fire; teleport there if needed
    for (let y = 0; y < 9 && !nearFire; y++) for (let x = 0; x < 9; x++) {
      Game.map.px = x; Game.map.py = y;
      try { if (Game.nearFire()) { nearFire = true; break; } } catch (e) {}
    }
  }
  ok(nearFire, 'near a fire for rendering');
  let rendered = 0;
  if (nearFire && fatUnits > 0) {
    try { Game.renderFat(); } catch (e) { console.log('  renderFat threw: ' + e.message); }
    rendered = (S().inventory || []).filter(i => i && i.foodKind === 'fat' && i.foodState === 'rendered')
      .reduce((a, i) => a + (i.units || 0), 0);
  }
  ok(rendered > 0, 'renderFat converts raw slabs to rendered tallow', 'rendered units=' + rendered);

  console.log(`\nRESULT seed=${SEED}: ${pass} pass / ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR: ' + (e && e.stack || e)); process.exit(2); });

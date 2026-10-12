#!/usr/bin/env node
// test-titan-load-20261012.js — PROOF that titans.js loads on the standard
// module path (and therefore in the browser).
//
// BUG (found 2026-10-12, combat matrix): titans.js referenced bare `Game` at
// load time, but game.js's `const Game` is IIFE-scoped — never a global. Every
// other late module binds `const Game = (globalThis.Scattering||{}).Game`
// (pods.js etc.); titans.js didn't, so the IIFE threw ReferenceError at
// Object.assign(Game, ...) and the ENTIRE titan system (solo gate, omens,
// coalition warfare, pool filter) silently never attached — in node AND in
// the browser. The old proof test masked it with a `global.Game` workaround.
// FIX: one-line binding at the titans IIFE top, pods.js convention.
//
// Before fix: 'titans.js loads with zero failures' FAILS (loadFails lists the
// ReferenceError/TDZ throw) and every check after it fails.
// After fix: ALL PASS.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const SEED = Number(process.env.SEED || 7);
let fails = 0;
const check = (name, cond, detail) => {
  if (!cond) { fails++; console.log('FAIL ' + name + (detail ? ' :: ' + detail : '')); }
  else console.log('ok   ' + name);
};
(async () => {
  const { Game, loadFails } = await loadGame({ seed: SEED });
  const titanFail = (loadFails || []).filter(f => /titans/.test(f));
  check('titans.js loads with zero failures', titanFail.length === 0, JSON.stringify(titanFail).slice(0, 160));
  check('Game.isTitan attached', typeof Game.isTitan === 'function');
  if (typeof Game.isTitan === 'function') {
    check('eater/nielsen/finale are titans', Game.isTitan('eater') && Game.isTitan('nielsen') && Game.isTitan('finale'));
    check('ordinary monsters are not titans', !Game.isTitan('gallowdeer') && !Game.isTitan('hushwolf'));
  }
  await setupGame(Game);
  const said = [];
  Game.say = m => said.push(String(m));
  Game.sysSay = m => said.push(String(m));
  const r = Game.startCombat('nielsen');
  check('solo titan hard-refused (null)', r === null);
  check('refusal said aloud', said.some(t => /cannot face this alone/i.test(t)));
  check('refusal names the muster', said.some(t => /allied blades/i.test(t)));
  let poolOk = false, poolErr = '';
  try { poolOk = !Game.monsterWavePool().some(m => Game.isTitan(m.id)); }
  catch (e) { poolErr = e.message; }
  check('wave pool excludes titans', poolOk, poolErr);
  console.log(fails ? `\n${fails} FAILURES` : '\nALL PASS');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('CRASH:', e); process.exit(2); });

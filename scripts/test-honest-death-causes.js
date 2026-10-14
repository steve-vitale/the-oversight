#!/usr/bin/env node
// test-honest-death-causes.js — PROOF: overnight deaths report honest causes.
// RED: every overnight death labeled 'starvation' regardless of actual killer.
// GREEN: dehydration kills report 'dehydration', true starvation reports
// 'starvation', pre-existing wounds report 'wounds'.
// (player-survivability 2026-10-14)
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function testDehydrationLabeled() {
  const { Game } = await loadGame({ seed: 777001, mode: 'deathcause-proof' });
  await setupGame(Game);
  const s = Game.state.scholar;
  // full belly, zero water — dehydration should kill overnight
  s.kcal = 2400;
  s.hydration = 1; // will hit 0 after burn
  s.health = 10;   // low enough that -12 dehydration kills
  s.wounds = [];
  s.diseases = {};
  let gotCause = null;
  let t = Game;
  while (t && !Object.prototype.hasOwnProperty.call(t, 'playerDeath')) t = Object.getPrototypeOf(t);
  const orig = t.playerDeath;
  t.playerDeath = function (cause) { gotCause = cause; return orig.call(this, cause); };
  // run resolveDay directly
  const res = Game.state && require('./sim-harness'); // placeholder
  // Instead: drive one endDay via the engine
  const S = globalThis.Scattering;
  const r = S.calories.resolveDay(s, Game.state.village, {});
  t.playerDeath = orig;
  const pass = r.killedBy === 'dehydration' && !r.ok;
  console.log(`dehydration kill: killedBy=${r.killedBy} ok=${r.ok} -> ${pass ? 'PASS' : 'FAIL'}`);
  return pass;
}

async function testStarvationLabeled() {
  const { Game } = await loadGame({ seed: 777002, mode: 'deathcause-proof' });
  await setupGame(Game);
  const s = Game.state.scholar;
  // empty belly, full water — starvation should kill
  s.kcal = 100; // after 2200 burn: -2100 deficit -> ~13.6 damage
  s.hydration = 100;
  s.health = 10;
  s.wounds = [];
  s.diseases = {};
  const S = globalThis.Scattering;
  const r = S.calories.resolveDay(s, Game.state.village, {});
  const pass = r.killedBy === 'starvation' && !r.ok;
  console.log(`starvation kill: killedBy=${r.killedBy} ok=${r.ok} -> ${pass ? 'PASS' : 'FAIL'}`);
  return pass;
}

async function testWoundsLabeled() {
  const { Game } = await loadGame({ seed: 777003, mode: 'deathcause-proof' });
  await setupGame(Game);
  const s = Game.state.scholar;
  // already at 0 HP from wounds entering the night
  s.kcal = 2400;
  s.hydration = 100;
  s.health = 0;
  s.wounds = [{ type: 'gash', severity: 2 }];
  s.diseases = {};
  const S = globalThis.Scattering;
  const r = S.calories.resolveDay(s, Game.state.village, {});
  const pass = r.killedBy === 'wounds' && !r.ok;
  console.log(`wounds kill: killedBy=${r.killedBy} ok=${r.ok} -> ${pass ? 'PASS' : 'FAIL'}`);
  return pass;
}

async function testHealthySurvives() {
  const { Game } = await loadGame({ seed: 777004, mode: 'deathcause-proof' });
  await setupGame(Game);
  const s = Game.state.scholar;
  s.kcal = 2400;
  s.hydration = 100;
  s.health = 100;
  s.wounds = [];
  s.diseases = {};
  const S = globalThis.Scattering;
  const r = S.calories.resolveDay(s, Game.state.village, {});
  const pass = r.ok && r.killedBy === null;
  console.log(`healthy: ok=${r.ok} killedBy=${r.killedBy} -> ${pass ? 'PASS' : 'FAIL'}`);
  return pass;
}

async function main() {
  const results = [];
  results.push(await testDehydrationLabeled());
  results.push(await testStarvationLabeled());
  results.push(await testWoundsLabeled());
  results.push(await testHealthySurvives());
  const allPass = results.every(Boolean);
  console.log(`\n${results.filter(Boolean).length}/${results.length} GREEN`);
  process.exit(allPass ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(1); });

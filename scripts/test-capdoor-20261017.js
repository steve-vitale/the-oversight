#!/usr/bin/env node
// scripts/test-capdoor-20261017.js — proof for the sim-capdoor-b lever
// (sim-findings #453): refuse-with-voice at the pantry cap door.
//
// Modes (CAPDOOR env gates the lever; default OFF):
//   units   — stockSurplus returns kcal actually stored; refusal beats are
//             deterministic (RED on pristine: returns undefined).
//   caller  — villagerMealDay integration: ledger records stored-only, the
//             refusal beat fires, refused share is eaten (RED on pristine:
//             recorded != received).
//   digest  — write a trajectory digest of a cap-pinned villagerMealDay
//             scenario (for the det-gate: armed+CAPDOOR-unset vs pristine).
//   smoke   — short 20-day armed run completes, no exceptions.
//
// RED->GREEN: run with CAPDOOR=1 on pristine game.js (units/caller FAIL),
// apply the patch, re-run (units/caller PASS). Det-gate compares digest
// files across the two code versions with CAPDOOR unset.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const MODE = process.argv[2] || 'units';
const CAPDOOR_ON = process.env.CAPDOOR === '1';

let failures = 0;
function check(name, cond, detail) {
  if (cond) { console.log(`  PASS ${name}`); }
  else { failures++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

async function boot(seed) {
  const { Game } = await loadGame({ seed: seed || 4401, mode: 'capdoor-proof', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}
function villageOf(Game) { return Game.state.village; }
// Pin the pantry at (or near) cap with honest 'Foraged food' stacks.
function pinPantry(Game, v, targetKcal) {
  v.pantry = v.pantry || [];
  const freshDay = v.day + 3;
  let guard = 0;
  while (Game.pantryKcal() < targetKcal && guard++ < 500) {
    const room = targetKcal - Game.pantryKcal();
    const units = Math.max(1, Math.ceil(room / 200));
    v.pantry.push({ name: 'Foraged food', kcalEach: 200, units, spoilDay: freshDay, safe: true, kg: 0.2 });
  }
}
function firstLivingVid(Game, v) {
  for (const vid of (v.roster || [])) {
    const h = (v.health && v.health[vid] !== undefined) ? v.health[vid] : 100;
    if (h > 0) return vid;
  }
  throw new Error('no living villager');
}

async function unitsPhase() {
  console.log(`== capdoor units (CAPDOOR=${CAPDOOR_ON ? '1' : 'unset'}) ==`);
  const Game = await boot(4401);
  const v = villageOf(Game);
  const cap = Game.pantryCapKcal();
  check('pantry cap is positive', cap > 0, 'cap=' + cap);

  // G1: full refusal — pantry at cap, share offered, nothing stored.
  pinPantry(Game, v, cap);
  check('pantry pinned at cap', Game.pantryKcal() >= cap, Game.pantryKcal() + '/' + cap);
  const r1 = Game.stockSurplus(v, 5000);
  check('G1 full refusal returns 0 (kcal stored)', typeof r1 === 'number' && r1 === 0,
    'returned ' + JSON.stringify(r1));
  check('G1 pantry unchanged', Game.pantryKcal() >= cap);

  // G2: partial — exactly 400 kcal of room, 5000 offered.
  v.pantry = [];
  pinPantry(Game, v, cap - 400);
  const before = Game.pantryKcal();
  const r2 = Game.stockSurplus(v, 5000);
  check('G2 partial returns 400', r2 === 400, 'returned ' + JSON.stringify(r2));
  check('G2 pantry grew exactly 400', Game.pantryKcal() - before === 400,
    'delta=' + (Game.pantryKcal() - before));

  // G3: crumb — rounds to zero units, eaten not stored.
  const r3 = Game.stockSurplus(v, 50);
  check('G3 crumb returns 0', r3 === 0, 'returned ' + JSON.stringify(r3));

  // G4: normal deposit — below cap, full share stored.
  v.pantry = [];
  const r4 = Game.stockSurplus(v, 1000);
  check('G4 below-cap deposit returns 1000', r4 === 1000, 'returned ' + JSON.stringify(r4));

  // G5: the beat is deterministic — same args, same string, no RNG draws.
  const b1 = Game.capDoorBeat('Mara', 5000, 0);
  const b2 = Game.capDoorBeat('Mara', 5000, 0);
  check('G5 beat deterministic', b1 === b2);
  check('G5 beat names facts', /Mara/.test(b1) && /5,000/.test(b1) && /full/.test(b1), b1);
  const bp = Game.capDoorBeat('Mara', 5000, 400);
  check('G5 partial beat names what fit', /only 400 kcal fit/.test(bp), bp);
  const draws = [];
  const realRandom = Math.random;
  Math.random = function () { draws.push(1); return realRandom(); };
  try { Game.capDoorBeat('Mara', 5000, 0); } finally { Math.random = realRandom; }
  check('G5 beat draws zero RNG', draws.length === 0, draws.length + ' draws');
}

async function callerPhase() {
  console.log(`== capdoor caller (CAPDOOR=${CAPDOOR_ON ? '1' : 'unset'}) ==`);
  if (!CAPDOOR_ON) { console.log('  SKIP — caller phase needs CAPDOOR=1'); return; }
  const Game = await boot(4402);
  const v = villageOf(Game);
  const cap = Game.pantryCapKcal();
  const vid = firstLivingVid(Game, v);
  const person = Game.getPerson(vid);
  v.trust = v.trust || {}; v.trust[vid] = 100; // trustFactor 1.0
  pinPantry(Game, v, cap);
  const said = [];
  const oSay = Game.say.bind(Game);
  Game.say = function (m) { said.push(String(m)); return oSay(m); };
  const oProd = Game.villagerDayProduction;
  Game.villagerDayProduction = function () { return 6000; }; // fixed surplus source
  const givesBefore = ((v.gives || {})[vid]) || 0;
  const panBefore = Game.pantryKcal();
  Game.npcNeeds(vid).hunger = 100; // pin high so the refused-eat is observable
  const hungerBefore = Game.npcNeeds(vid).hunger || 0;
  let err = null;
  try { Game.villagerMealDay(vid, person, v, { cookId: null }); }
  catch (e) { err = e; }
  Game.villagerDayProduction = oProd;
  check('H1 no exception in villagerMealDay', err === null, err && err.message);
  const givesDelta = (((v.gives || {})[vid]) || 0) - givesBefore;
  const panDelta = Game.pantryKcal() - panBefore;
  check('H2 ledger records exactly what was received', givesDelta === panDelta,
    `recorded=${givesDelta} received=${panDelta}`);
  check('H3 full refusal: nothing recorded, nothing stored', givesDelta === 0 && panDelta === 0,
    `recorded=${givesDelta} received=${panDelta}`);
  const beat = said.find(s => /carries .* kcal of surplus to the pantry/.test(s));
  check('H4 refusal beat fired', !!beat, said.length + ' lines captured');
  if (beat) console.log('  beat: ' + beat);
  const hungerAfter = Game.npcNeeds(vid).hunger || 0;
  check('H5 refused share eaten (hunger eased)', hungerAfter === 0,
    `before=${hungerBefore} after=${hungerAfter}`);

  // H6: partial refusal — 400 kcal of room, voice names what fit.
  const v2 = villageOf(Game);
  const vid2 = firstLivingVid(Game, v2);
  v2.trust = v2.trust || {}; v2.trust[vid2] = 100;
  v2.pantry = [];
  pinPantry(Game, v2, cap - 400);
  said.length = 0;
  Game.villagerDayProduction = function () { return 6000; };
  const g2b = ((v2.gives || {})[vid2]) || 0;
  const p2b = Game.pantryKcal();
  try { Game.villagerMealDay(vid2, Game.getPerson(vid2), v2, { cookId: null }); } catch (e) { err = e; }
  Game.villagerDayProduction = oProd;
  const g2d = (((v2.gives || {})[vid2]) || 0) - g2b;
  const p2d = Game.pantryKcal() - p2b;
  check('H6 partial: recorded == received == 400', g2d === 400 && p2d === 400,
    `recorded=${g2d} received=${p2d}`);
  const b2 = said.find(s => /only 400 kcal fit/.test(s));
  check('H6 partial beat names what fit', !!b2, (b2 || '(none)'));
}

async function digestPhase() {
  // Trajectory digest of a cap-pinned villagerMealDay scenario. Run with
  // CAPDOOR unset on armed and pristine code; digests must be byte-identical.
  const out = process.argv[3] || ('/tmp/capdoor-digest-' + Date.now() + '.json');
  const seed = parseInt(process.argv[4] || '4403', 10);
  const Game = await boot(seed);
  const v = villageOf(Game);
  const cap = Game.pantryCapKcal();
  const oProd = Game.villagerDayProduction;
  Game.villagerDayProduction = function () { return 6000; };
  const said = [];
  const oSay = Game.say.bind(Game);
  Game.say = function (m) { said.push(String(m)); return oSay(m); };
  pinPantry(Game, v, cap);
  const vids = [];
  for (const vid of (v.roster || [])) {
    if (vids.length >= 3) break;
    const h = (v.health && v.health[vid] !== undefined) ? v.health[vid] : 100;
    if (h > 0) vids.push(vid);
  }
  for (const vid of vids) {
    v.trust = v.trust || {}; v.trust[vid] = 100;
    Game.villagerMealDay(vid, Game.getPerson(vid), v, { cookId: null });
  }
  Game.villagerDayProduction = oProd;
  const digest = {
    seed, capdoor: CAPDOOR_ON,
    gives: v.gives, takes: v.takes,
    pantryKcal: Game.pantryKcal(),
    hunger: vids.map(vid => Game.npcNeeds(vid).hunger),
    health: vids.map(vid => (v.health || {})[vid]),
    sayCount: said.length,
    sayHash: said.join('\n').length + ':' + said.slice(0, 5).join('|').length,
    sayLines: said,
  };
  fs.writeFileSync(out, JSON.stringify(digest, null, 1));
  console.log('digest written: ' + out);
}

async function smokePhase() {
  console.log(`== capdoor smoke (CAPDOOR=${CAPDOOR_ON ? '1' : 'unset'}) ==`);
  const { belongfeast } = require('./policies/feastscale');
  const Game = await boot(4404);
  await quietLog(async () => {
    await runDays(Game, Object.assign({}, belongfeast), { days: 20, sampleEvery: 10 });
  });
  const v = villageOf(Game);
  check('S1 20-day run completes', (Game.state.scholar || {}).day >= 10,
    'day=' + ((Game.state.scholar || {}).day || 0));
  check('S2 village object intact', !!v && Array.isArray(v.roster));
  console.log('  day=' + ((Game.state.scholar || {}).day || 0) +
    ' pantryKcal=' + Game.pantryKcal() + ' pop=' + (v.roster || []).length);
}

(async () => {
  try {
    if (MODE === 'units') await unitsPhase();
    else if (MODE === 'caller') await callerPhase();
    else if (MODE === 'digest') await digestPhase();
    else if (MODE === 'smoke') await smokePhase();
    else { console.error('unknown mode: ' + MODE); process.exit(2); }
  } catch (e) {
    failures++;
    console.log('  FAIL harness threw: ' + (e && e.stack || e));
  }
  console.log(failures ? `RESULT: ${failures} FAILURES` : 'RESULT: ALL PASS');
  process.exit(failures ? 1 : 0);
})();

#!/usr/bin/env node
// scripts/test-cisterncheck-b.js — proof for sim-cisterncheck-b (backlog #732)
// WATER-HAUL INTO A FULL CISTERN: a person checks the cistern before walking
// to the creek. Full cistern -> no water trip (redirect to wood/stone);
// partial space -> carry only what fits.
//
// Fixtures:
//   A. cistern 0 space   -> (RED: overflow beat fires) / (GREEN: no dispatch,
//      redirect beat, 0 water added, ledger cisternRedirects=1)
//   B. cistern 4L space  -> (RED: "only holds 4L more" beat) / (GREEN: carry
//      exactly 4L, full-delivery beat, no overflow beat)
//   C. cistern ample     -> behavior UNCHANGED vs control (paired, same seed)
//   D. voice gate        -> two redirects same day: ledger 2, ONE beat (gated)
// Det-gate: paired CISTERNCHECK_OFF=1 vs armed, same seed — Math.random
// streams byte-identical after the fixture (one draw each: R(10,14) vs
// R(5,9)/R(1,2)); trajectories differ only in the avoided trips.
// Sense: prints before/after beats for the assessor to read.
//
// Usage: node scripts/test-cisterncheck-b.js   (exit 0 = ALL GREEN)
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'cisterncheck-proof' });
  await setupGame(Game);
  return Game;
}
function captureSay(Game) {
  const beats = [];
  const orig = Game.say.bind(Game);
  Game.say = (m) => { beats.push(String(m)); return orig(m); };
  return beats;
}
// A non-scholar, living, rostered villager with maxed trust (tmult 1.2 ->
// eff >= 1.2 -> water roll >= 12L deterministic floor for the fixtures).
function pickVillager(Game) {
  const v = Game.state.village;
  const vid = (v.roster || []).find(id => id !== Game.villagerId && !(v.dead || {})[id]);
  if (!vid) throw new Error('no usable villager');
  v.trust = v.trust || {};
  v.trust[vid] = 80;
  return vid;
}
function setCistern(Game, spaceL) {
  const cap = Game.waterCapL();
  Game.state.village.water = { clean: 0, dirty: Math.max(0, cap - spaceL) };
  return cap;
}
function assignWater(Game, vid) {
  const v = Game.state.village;
  v.assignments = v.assignments || {};
  v.assignments[vid] = { task: 'water' };
}
function waterOf(Game) {
  const w = Game.state.village.water || {};
  return (w.clean || 0) + (w.dirty || 0);
}

async function fixtureA(seed, env) {
  // Full cistern. env: {} armed | {CISTERNCHECK_OFF:'1'} control.
  for (const k of ['CISTERNCHECK_OFF', 'CISTERNCHECK_GATE']) delete process.env[k];
  Object.assign(process.env, env, { CISTERNCHECK_GATE: '0' }); // ungated voice for counting
  const Game = await freshGame(seed);
  const beats = captureSay(Game);
  const vid = pickVillager(Game);
  setCistern(Game, 0);
  const before = waterOf(Game);
  const woodBefore = Game.state.village.wood || 0;
  assignWater(Game, vid);
  Game.resolveAssignments();
  const v = Game.state.village;
  return {
    Game, beats,
    overflowBeat: beats.some(b => /cistern only holds/.test(b)),
    redirectBeat: beats.filter(b => /eyes the cistern/.test(b)).length,
    waterDelta: waterOf(Game) - before,
    woodDelta: (v.wood || 0) - woodBefore,
    redirects: v.cisternRedirects || 0,
    overflowHauls: v.cisternOverflowHauls || 0,
    rngTail: Array.from({ length: 10 }, () => Math.random()),
  };
}

async function fixtureB(seed, env) {
  // 4L of space: control must waste (overflow beat), armed must carry <= 4L.
  for (const k of ['CISTERNCHECK_OFF', 'CISTERNCHECK_GATE']) delete process.env[k];
  Object.assign(process.env, env);
  const Game = await freshGame(seed);
  const beats = captureSay(Game);
  pickVillager(Game); // trust 80 -> eff 1.2 -> roll >= 12L
  const cap = setCistern(Game, 4);
  const before = cap - 4;
  const vids = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = vids[0];
  Game.state.village.trust[vid] = 80;
  assignWater(Game, vid);
  Game.resolveAssignments();
  const v = Game.state.village;
  const added = waterOf(Game) - before;
  const m = beats.map(b => b.match(/returns with (\d+)L/)).find(Boolean);
  return {
    Game, beats,
    carried: m ? parseInt(m[1], 10) : null,
    added,
    overflowBeat: beats.some(b => /cistern only holds/.test(b)),
    fullBeat: beats.some(b => /returns with \d+L of creek water/.test(b)),
    overflowHauls: v.cisternOverflowHauls || 0,
    overflowL: v.cisternOverflowL || 0,
    rngTail: Array.from({ length: 10 }, () => Math.random()),
  };
}

async function run() {
  console.log('== RED (CISTERNCHECK_OFF=1: the old always-haul shape) ==');
  // A: the fixture asserting NEW behavior must FAIL on old code.
  const redA = await fixtureA(7001, { CISTERNCHECK_OFF: '1' });
  ok(redA.overflowBeat, 'RED-A control fires the overflow beat (bug signature)', 'expected the old code to dispatch into 0 space');
  ok(redA.redirects === 0, 'RED-A control has no redirect ledger');
  // B: control must fire the partial overflow beat.
  const redB = await fixtureB(7002, { CISTERNCHECK_OFF: '1' });
  ok(redB.overflowBeat, 'RED-B control fires "only holds 4L more" (bug signature)');
  ok((redB.carried || 0) > 4, 'RED-B control carries MORE than the 4L space', 'carried=' + redB.carried);
  ok(redB.overflowHauls === 1 && redB.overflowL > 0, 'RED-B control ledger counts the overflow haul', JSON.stringify({ h: redB.overflowHauls, L: redB.overflowL }));

  console.log('== GREEN (fix armed) ==');
  // A: full cistern -> no dispatch.
  const gA = await fixtureA(7001, {});
  ok(!gA.overflowBeat, 'A full cistern -> NO overflow beat');
  ok(gA.waterDelta === 0, 'A full cistern -> 0L added', 'delta=' + gA.waterDelta);
  ok(gA.redirects === 1, 'A redirect ledger = 1');
  ok(gA.redirectBeat === 1, 'A redirect beat voiced (ungated)', 'n=' + gA.redirectBeat);
  ok(gA.woodDelta > 0, 'A labor reallocated to wood (not wasted)', 'wood+' + gA.woodDelta);
  ok(gA.overflowHauls === 0, 'A no overflow ledger');
  // B: 4L space -> carry exactly what fits.
  const gB = await fixtureB(7002, {});
  ok(!gB.overflowBeat, 'B 4L space -> NO overflow beat');
  ok(gB.carried === 4, 'B carry capped at the 4L space', 'carried=' + gB.carried);
  ok(gB.added === 4, 'B added == carried (full delivery)', 'added=' + gB.added);
  ok(gB.fullBeat, 'B full-delivery beat (no "only holds" tail)');
  ok(gB.overflowHauls === 0, 'B no overflow ledger');
  // C: ample cistern -> UNCHANGED vs control (paired, same seed).
  for (const k of ['CISTERNCHECK_OFF', 'CISTERNCHECK_GATE']) delete process.env[k];
  const cCtrl = await (async () => {
    process.env.CISTERNCHECK_OFF = '1';
    const Game = await freshGame(7003);
    const beats = captureSay(Game);
    const vid = pickVillager(Game);
    setCistern(Game, 1000);
    const before = waterOf(Game);
    assignWater(Game, vid);
    Game.resolveAssignments();
    const m = beats.map(b => b.match(/returns with (\d+)L/)).find(Boolean);
    const r = { beats, carried: m ? parseInt(m[1], 10) : null, added: waterOf(Game) - before, rngTail: Array.from({ length: 10 }, () => Math.random()) };
    delete process.env.CISTERNCHECK_OFF;
    return r;
  })();
  const cArm = await (async () => {
    const Game = await freshGame(7003);
    const beats = captureSay(Game);
    const vid = pickVillager(Game);
    setCistern(Game, 1000);
    const before = waterOf(Game);
    assignWater(Game, vid);
    Game.resolveAssignments();
    const m = beats.map(b => b.match(/returns with (\d+)L/)).find(Boolean);
    return { beats, carried: m ? parseInt(m[1], 10) : null, added: waterOf(Game) - before, rngTail: Array.from({ length: 10 }, () => Math.random()) };
  })();
  ok(cCtrl.carried === cArm.carried && cCtrl.added === cArm.added, 'C ample cistern -> identical carry', `ctrl=${cCtrl.carried}/${cCtrl.added} arm=${cArm.carried}/${cArm.added}`);
  ok(JSON.stringify(cCtrl.beats) === JSON.stringify(cArm.beats), 'C ample cistern -> identical beats');
  ok(JSON.stringify(cCtrl.rngTail) === JSON.stringify(cArm.rngTail), 'C ample cistern -> RNG stream aligned');
  // D: voice gate — two redirects same day -> ledger 2, ONE beat (default gate).
  for (const k of ['CISTERNCHECK_OFF', 'CISTERNCHECK_GATE']) delete process.env[k];
  const dG = await freshGame(7004);
  const dBeats = captureSay(dG);
  const dv = dG.state.village;
  const two = (dv.roster || []).filter(id => id !== dG.villagerId).slice(0, 2);
  two.forEach(id => { dv.trust[id] = 80; });
  setCistern(dG, 0);
  dv.assignments = {};
  two.forEach(id => { dv.assignments[id] = { task: 'water' }; });
  dG.resolveAssignments();
  ok((dv.cisternRedirects || 0) === 2, 'D two redirects same day -> ledger 2', 'n=' + dv.cisternRedirects);
  ok(dBeats.filter(b => /eyes the cistern/.test(b)).length === 1, 'D voice gated: ONE redirect beat per day');

  console.log('== DET-GATE (paired streams byte-identical except avoided trips) ==');
  ok(JSON.stringify(redA.rngTail) === JSON.stringify(gA.rngTail), 'A paired Math.random tails byte-identical (one draw each)');
  ok(JSON.stringify(redB.rngTail) === JSON.stringify(gB.rngTail), 'B paired Math.random tails byte-identical (one draw each)');

  console.log('== SENSE (read the beats) ==');
  console.log('--- BEFORE (control, full cistern) ---');
  redA.beats.filter(b => /💧/.test(b)).forEach(b => console.log('  ' + b));
  console.log('--- AFTER (armed, full cistern) ---');
  gA.beats.filter(b => /💧|🪵/.test(b)).forEach(b => console.log('  ' + b));
  console.log('--- BEFORE (control, 4L space) ---');
  redB.beats.filter(b => /💧/.test(b)).forEach(b => console.log('  ' + b));
  console.log('--- AFTER (armed, 4L space) ---');
  gB.beats.filter(b => /💧/.test(b)).forEach(b => console.log('  ' + b));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
run().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });

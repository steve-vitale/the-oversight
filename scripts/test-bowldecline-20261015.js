#!/usr/bin/env node
// scripts/test-bowldecline-20261015.js — MECHANISM PROOF for the bowldecline
// policy layer (loop B 2026-10-15, finding #340). The CRITICAL FIRST GATE:
// prove an honest decline path EXISTS in the engine before any sim spend.
// If this fails, the arm is KILLED AT PROOF (evidence-only commit).
//
// PART A — the decline path is honest in the engine:
//   bowl declined -> no pantry draw -> no v.takes write -> packed meal eaten
//   via Game.eat() -> hunger satisfied -> decline narrated (no silent skip).
// PART B — REAL RED on the pristine base (gate OFF): the unlayered meal
//   DOES draw and DOES write v.takes (this is the bar the arm attacks), and
//   the layer with the gate off leaves villageMeal untouched.
// PART C — det-gate: BOWLDECLINE=0 layered run byte-identical to unlayered
//   (same seed, same base policy, 30d; Game.state JSON hash compared).
//
// Uses the shared kit (scripts/sim-harness.js) — never copies eval
// boilerplate. Seeded RNG before eval (loadGame). Never stubs Game.save.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { layerBowlDecline, hasFullPackedMeal, wouldServeBowl } = require('./policies/bowldecline');
const { leadcourt } = require('./policies/leadcourt');

let failures = 0;
function check(name, cond, detail) {
  if (cond) { console.log(`  PASS ${name}`); }
  else { failures++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function scholarVid(Game) {
  try { return Game.state.scholar.villagerId || Game.villagerId; } catch (e) { return null; }
}
function captureSay(Game) {
  const beats = [];
  const oSay = Game.say;
  Game.say = function (t) { try { beats.push(String(t)); } catch (e) {} return oSay.apply(Game, arguments); };
  return { beats, restore() { Game.say = oSay; } };
}

async function partA() {
  console.log('\nPART A — honest decline path (BOWLDECLINE=1)');
  process.env.BOWLDECLINE = '1';
  const { Game, manifest } = await loadGame({ seed: 11, mode: 'bowldecline-proof-a' });
  await setupGame(Game);
  // The scholar must be at the haven fire for the bowl to be offered.
  check('scholar at haven (pantryInReach)', !!(Game.pantryInReach && Game.pantryInReach()),
    'mechanism not reachable in harness — KILL AT PROOF');
  if (!(Game.pantryInReach && Game.pantryInReach())) return;
  const scholar = Game.state.scholar, v = Game.state.village;
  const vid = scholarVid(Game);
  // Make sure the pantry CAN serve a bowl (else the control proves nothing).
  if (pantryKcal(Game) < 5000) { try { Game.stockPantry(20000, 'test grain'); } catch (e) {} }
  check('pantry stocked (>=5000 kcal)', pantryKcal(Game) >= 5000, pantryKcal(Game) + ' kcal');
  // Room in the bank + one full packed meal in the pack.
  scholar.kcal = 400;
  scholar.inventory.push({ name: 'smoked fish bundle', kcalEach: 300, units: 3 });
  check('wouldServeBowl true', wouldServeBowl(Game) === true);
  check('hasFullPackedMeal true (900 kcal stack)', hasFullPackedMeal(Game) === true);
  const takesBefore = ((v.takes || {})[vid]) || 0;
  const pantryBefore = pantryKcal(Game);
  const kcalBefore = scholar.kcal;
  const invUnitsBefore = scholar.inventory.reduce((t, i) => t + ((i.kcalEach || 0) > 0 ? (i.units || 0) : 0), 0);
  const cap = captureSay(Game);
  const layered = layerBowlDecline(leadcourt);
  try { layered.setup(Game, {}); } catch (e) { check('layered.setup runs', false, e.message); }
  check('wrap installed when gate on', Game._bowlDeclineWrapped === true);
  let out = 'threw';
  try { out = Game.villageMeal(); } catch (e) { out = 'THREW: ' + e.message; }
  cap.restore();
  const takesAfter = ((v.takes || {})[vid]) || 0;
  const text = cap.beats.join('\n');
  check('villageMeal did not throw', out !== 'threw' && !String(out).startsWith('THREW'), String(out).slice(0, 120));
  check('NO v.takes draw (bowl never drawn)', takesAfter === takesBefore,
    `takes ${takesBefore} -> ${takesAfter}`);
  check('pantry untouched', pantryKcal(Game) === pantryBefore,
    `${pantryBefore} -> ${pantryKcal(Game)}`);
  check('packed meal eaten (kcal rose via Game.eat)', scholar.kcal > kcalBefore,
    `kcal ${kcalBefore} -> ${scholar.kcal}`);
  check('pack food consumed', scholar.inventory.reduce((t, i) => t + ((i.kcalEach || 0) > 0 ? (i.units || 0) : 0), 0) < invUnitsBefore);
  check('decline narrated (not silent)', /wave it off|pass it along|Not tonight/.test(text), text.slice(0, 200));
  check('packed-eat narrated', /packed food instead/.test(text));
  check('lastPlayerMeal = 0 (no-meal bookkeeping)', v.lastPlayerMeal === 0, String(v.lastPlayerMeal));
  check('decline telemetry recorded', Array.isArray(Game._bowlDeclines) && Game._bowlDeclines.length === 1,
    JSON.stringify(Game._bowlDeclines));
  delete process.env.BOWLDECLINE;
}

async function partB() {
  console.log('\nPART B — REAL RED on pristine base (gate OFF)');
  delete process.env.BOWLDECLINE;
  const { Game } = await loadGame({ seed: 11, mode: 'bowldecline-proof-b' });
  await setupGame(Game);
  const scholar = Game.state.scholar, v = Game.state.village;
  const vid = scholarVid(Game);
  if (pantryKcal(Game) < 5000) { try { Game.stockPantry(20000, 'test grain'); } catch (e) {} }
  scholar.kcal = 400;
  // The layer is present but the GATE is off: setup must not wrap.
  const layered = layerBowlDecline(leadcourt);
  try { layered.setup(Game, {}); } catch (e) { check('layered.setup runs (gate off)', false, e.message); }
  check('no wrap installed when gate off', !Game._bowlDeclineWrapped,
    'gate-off layer wrapped villageMeal — det-gate broken');
  const takesBefore = ((v.takes || {})[vid]) || 0;
  const cap = captureSay(Game);
  let out = 'threw';
  try { out = Game.villageMeal(); } catch (e) { out = 'THREW: ' + e.message; }
  cap.restore();
  const takesAfter = ((v.takes || {})[vid]) || 0;
  const text = cap.beats.join('\n');
  check('pristine meal DRAWS (RED: v.takes increases)', takesAfter > takesBefore,
    `takes ${takesBefore} -> ${takesAfter} — if this fails there is no bar to attack`);
  check('pristine meal beat', /Village meal: \+/.test(text), text.slice(0, 160));
}

async function partC() {
  console.log('\nPART C — det-gate: BOWLDECLINE=0 run byte-identical to unlayered (30d, seed 11)');
  // NOTE: the harness freezes Date.now() but state.pacing.lastTs/dayMinutes
  // use performance.now() — DECISION-FREE wall-clock observation telemetry
  // (sim-harness.js:156, game.js:28900). It differs run-to-run even for the
  // SAME policy twice (verified in diagnosis), so the honest det-gate strips
  // the pacing subtree and requires everything else byte-identical.
  function stripWallClock(state) {
    const s = JSON.parse(JSON.stringify(state));
    try { delete s.pacing; } catch (e) {}
    return JSON.stringify(s);
  }
  async function runOnce(layered) {
    const { Game, manifest } = await loadGame({ seed: 11, mode: 'bowldecline-proof-c' });
    await setupGame(Game);
    const policy = layered ? layerBowlDecline(leadcourt) : Object.assign({}, leadcourt);
    await runDays(Game, policy, { days: 30, manifest });
    return stripWallClock(Game.state);
  }
  delete process.env.BOWLDECLINE;
  const a = await runOnce(false);
  process.env.BOWLDECLINE = '0';
  const b = await runOnce(true);
  delete process.env.BOWLDECLINE;
  check('byte-identical Game.state minus wall-clock pacing (gate off vs unlayered)', a === b,
    a === b ? '' : `lengths ${a.length} vs ${b.length}`);
}

(async () => {
  try {
    await partA();
    await partB();
    await partC();
  } catch (e) {
    failures++;
    console.log('FATAL ' + (e && e.stack || e));
  }
  console.log(failures === 0 ? '\nMECHANISM PROOF: ALL GREEN — decline path exists, gate inert when off.' :
    `\nMECHANISM PROOF: ${failures} FAILURE(S) — arm ${failures > 0 ? 'KILLED AT PROOF' : ''}.`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('FATAL', e); process.exit(1); });

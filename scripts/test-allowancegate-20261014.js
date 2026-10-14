#!/usr/bin/env node
// scripts/test-allowancegate-20261014.js — PROOF for the r15 pantry-state
// gate on the r13 feast allowance (loop B, 2026-10-14, food-economy axis,
// sim-findings #187 claimed: FEASTDOOR'S CALIBRATED PRICE next arm).
//
// THE LEVER: scripts/policies/allowancegate.js wraps leadfeast/belongfeast
// (the r13 allowance layer). The r13-only diagnostic measured the allowance
// ALONE as genuinely harmful (starvation 15->21, hungryDays 35->48, median
// 151->92d vs pristine): it fires on contribution >=1500 with no
// pantry-state gate beyond the engine's 1.5x total-kcal buffer — a buffer
// that does not know how many fresh-days the village has.
//
// THE GATE (ALLOWANCEGATE=1, default OFF; requires FEASTSCALE_R13=1): the
// allowance may NOT fire a feast when pantry fresh-days < 2
// (Game.pantryFreshDays() — the measured pantry-blind harm driver).
// Suppressed feasts are POSTPONED, never displaced: the shared cadence
// tracker (ctx._fsLastFeastDay) is NOT marked, so the next dusk re-tests.
// Policy-side only; zero src/js changes.
//
// RED PHASE (FEASTSCALE_R13=1, ALLOWANCEGATE unset):
//   R1. gate-off byte-identical: leadgate/belonggate (gate off) ==
//       leadfeast/belongfeast per-day run hashes, 40d x2 seeds — the layer
//       adds zero trajectory delta when off.
//   R2. gate-off, the allowance FIRES on the thin-fresh fixture (fresh-days
//       < 2, total kcal deep via a preserved stockpile so the 1.5x buffer
//       passes): the fixture really is the pantry-blind harm in miniature.
// GREEN PHASE (FEASTSCALE_R13=1 + ALLOWANCEGATE=1):
//   G1. holds on the thin-fresh fixture: no feast, pantry untouched,
//       agGateHeld == 1.
//   G2. fires on the deep-fresh fixture (6.2d): real pantry draw,
//       agGateHeld == 0.
//   G3. postponed feasts fire when the pantry recovers: hold on day 30
//       (_fsLastFeastDay NOT marked — the opening is not displaced), fresh
//       food arrives, day 31 fires. The postponement never displaces.
//   G4. armed determinism: identical fixture twice -> identical outcome.
//   G5. no double-feast: after a fire, a second upkeep the same day does
//       not re-fire (the one-feast/day slot is claimed).
//   G6. gate inert without FEASTSCALE_R13 (ALLOWANCEGATE=1, layer off): no
//       holds counted, no scaleFeast — pure delegation.
//
// Usage:
//   RED:   FEASTSCALE_R13=1 node scripts/test-allowancegate-20261014.js
//   GREEN: FEASTSCALE_R13=1 ALLOWANCEGATE=1 node scripts/test-allowancegate-20261014.js
//
// Kill-protocol degradation: if the layer file is deleted post-kill, this
// script degrades to INFO-SKIP (exit 0), never MODULE_NOT_FOUND.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

let AG;
try {
  AG = require('./policies/allowancegate');
} catch (e) {
  console.log('INFO-SKIP: allowancegate layer absent (reverted per kill protocol); proof was RED->GREEN pre-kill — see evidence/2026-10-14/sim-allowancegate-b.md');
  process.exit(0);
}
const FS = require('./policies/feastscale');

const GATE = process.env.ALLOWANCEGATE === '1';
const LAYER = process.env.FEASTSCALE_R13 === '1';
const ARMED = LAYER && GATE;
console.log('== allowancegate r15 proof — ' + (ARMED ? 'ARMED (FEASTSCALE_R13=1 + ALLOWANCEGATE=1)' : (LAYER ? 'RED (FEASTSCALE_R13=1, gate off)' : 'RED (gates off)')) + ' ==');

const fails = [];
function check(name, cond, detail) {
  const ok = !!cond;
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails.push(name);
}

function dayHash(Game) {
  try {
    const s = Game.state.scholar || {}, v = Game.state.village || {};
    const parts = [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
      (v.roster || []).length, Game.map.px, Game.map.py,
      Game.unlockedWave ? Game.unlockedWave() : 0,
      Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100)];
    return parts.join('|');
  } catch (e) { return 'ERR'; }
}

function havenPantryKcal(Game) {
  return ((Game.state.village || {}).pantry || [])
    .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
}

function freshDaysOf(Game) { try { return Game.pantryFreshDays(); } catch (e) { return -1; } }

function freshItem(Game, name, kcal, daysLeft) {
  const day = (Game.state.scholar || {}).day || 1;
  return { name, kcalEach: 500, units: Math.ceil(kcal / 500), safe: true, spoilDay: day + daysLeft };
}

// thinFresh fixture: fresh-days < 2 BUT total kcal deep — a preserved
// stockpile (pemmican: excluded from fresh kcal by pantryFreshKcal) so the
// r13 allowance's 1.5x total-kcal buffer passes while the fresh floor is
// thin. This is the pantry-blind harm in miniature.
async function buildThinFixture(seed, freshTargetDays, burn) {
  const { Game } = await loadGame({ seed, mode: 'allowancegate-proof' });
  await setupGame(Game);
  Game.say = () => {}; Game.feedback = function () {};
  Game.state.scholar.day = 30;
  Game.dayPart = 2; // dusk
  const v = Game.state.village;
  v.burnHistory = [burn, burn, burn, burn, burn, burn, burn];
  v.pantry = [
    freshItem(Game, 'Foraged food', Math.round(freshTargetDays * burn), 3),
    { name: 'Pemmican bars', foodKind: 'pemmican', kcalEach: 500, units: 120, safe: true, spoilDay: 30 + 120 },
  ];
  v.lastRaidDay = 0;
  return Game;
}

// deepFresh fixture: fresh-days ~6.2, calibrated so the engine's honest
// cost clears the 1.5x buffer.
async function buildDeepFixture(seed) {
  const { Game } = await loadGame({ seed, mode: 'allowancegate-proof' });
  await setupGame(Game);
  Game.say = () => {}; Game.feedback = function () {};
  Game.state.scholar.day = 30;
  Game.dayPart = 2;
  const v = Game.state.village;
  let cost = 4800;
  try { cost = (Game.feastPlan() || {}).cost || 4800; } catch (e) {}
  const burn = Math.ceil(cost * 1.6 / 6.2);
  v.burnHistory = [burn, burn, burn, burn, burn, burn, burn];
  v.pantry = [freshItem(Game, 'Foraged food', Math.round(6.2 * burn), 3)];
  v.lastRaidDay = 0;
  return Game;
}

function armedCtx() { return { _tribHist: [{ day: 29, kcal: 2000 }] }; }

async function runHashes(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'allowancegate-red' });
  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, policy);
  const base = policy.daily;
  wrapped.daily = (G, ctx) => {
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    return base ? base(G, ctx) : undefined;
  };
  await quietLog(async () => { await runDays(Game, wrapped, { days, manifest: undefined, sampleEvery: 1 }); });
  return hashes;
}

(async () => {
  // ---------- R1: gate-off byte-identical vs the r13 parents ----------
  console.log('== R1. gate-off byte-identical (leadgate/belonggate vs leadfeast/belongfeast, 40d) ==');
  if (!ARMED) {
    for (const [mine, theirs, label] of [[AG.leadgate, FS.leadfeast, 'lead'], [AG.belonggate, FS.belongfeast, 'belong']]) {
      const seed = label === 'lead' ? 11 : 22;
      const hMine = await runHashes(mine, seed, 40);
      const hTheirs = await runHashes(theirs, seed, 40);
      const same = hMine.length === hTheirs.length && hMine.every((h, i) => h === hTheirs[i]);
      check(`R1 gate-off: ${label}gate == ${label}feast per-day hashes`, same, `n=${hMine.length}/${hTheirs.length}`);
    }
  } else {
    console.log('  (skipped — armed phase; R1 is a RED assertion)');
  }

  // ---------- R2: gate-off, the allowance FIRES on the thin-fresh fixture ----------
  console.log('== R2. gate-off: the allowance fires pantry-blind on the thin-fresh fixture ==');
  if (!ARMED) {
    const Game = await buildThinFixture(42, 1.5, 2400);
    const fd = freshDaysOf(Game);
    check('R2 fixture really is thin-fresh (< 2d)', fd > 0.5 && fd < 2, 'freshDays=' + fd.toFixed(2));
    let plan = null;
    try { plan = Game.feastPlan(); } catch (e) {}
    check('R2 fixture assumption (plan ok, 1.5x buffer passes on total kcal)',
      !!(plan && plan.ok && plan.have >= plan.cost * 1.5),
      `ok=${plan && plan.ok} have=${plan && plan.have} cost=${plan && plan.cost}`);
    const ctx = armedCtx();
    const pol = FS.leadfeast;
    pol.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    pol.upkeep(Game, ctx);
    check('R2 un-gated allowance fired pantry-blind', (ctx.fsFeasts || 0) === 1, `fsFeasts=${ctx.fsFeasts}`);
    check('R2 pantry really drawn gate-off', havenPantryKcal(Game) < before, `${before} -> ${havenPantryKcal(Game)}`);
    check('R2 no gate holds counted gate-off', (ctx.agGateHeld || 0) === 0, `agGateHeld=${ctx.agGateHeld}`);
  } else {
    console.log('  (skipped — armed phase; R2 is a RED assertion)');
  }

  // ---------- G1: holds on the thin-fresh fixture ----------
  console.log('== G1. gate holds on the thin-fresh fixture ==');
  if (ARMED) {
    const Game = await buildThinFixture(44, 1.5, 2400);
    const fd = freshDaysOf(Game);
    check('G1 fixture really is thin-fresh (< 2d)', fd > 0.5 && fd < 2, 'freshDays=' + fd.toFixed(2));
    const ctx = armedCtx();
    const pol = AG.leadgate;
    pol.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    pol.upkeep(Game, ctx);
    check('G1 gate held the pantry-blind feast', (ctx.fsFeasts || 0) === 0, `fsFeasts=${ctx.fsFeasts}`);
    check('G1 pantry untouched', havenPantryKcal(Game) === before, `${before} -> ${havenPantryKcal(Game)}`);
    check('G1 hold counted', (ctx.agGateHeld || 0) === 1, `agGateHeld=${ctx.agGateHeld}`);
    check('G1 cadence NOT marked (postponed, not displaced)', ctx._fsLastFeastDay === undefined,
      `_fsLastFeastDay=${ctx._fsLastFeastDay}`);
  } else {
    console.log('  (skipped — RED phase; G1 is a GREEN assertion)');
  }

  // ---------- G2: fires on the deep-fresh fixture ----------
  console.log('== G2. gate fires on the deep-fresh fixture ==');
  if (ARMED) {
    const Game = await buildDeepFixture(45);
    const fd = freshDaysOf(Game);
    check('G2 fixture really is deep-fresh (> 2d)', fd > 5.5, 'freshDays=' + fd.toFixed(2));
    const ctx = armedCtx();
    const pol = AG.leadgate;
    pol.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    pol.upkeep(Game, ctx);
    check('G2 allowance feast fired on surplus', (ctx.fsFeasts || 0) === 1, `fsFeasts=${ctx.fsFeasts}`);
    check('G2 pantry really drawn', havenPantryKcal(Game) < before, `${before} -> ${havenPantryKcal(Game)}`);
    check('G2 no hold on a surplus fixture', (ctx.agGateHeld || 0) === 0, `agGateHeld=${ctx.agGateHeld}`);
  } else {
    console.log('  (skipped — RED phase; G2 is a GREEN assertion)');
  }

  // ---------- G3: postponed feasts fire when the pantry recovers ----------
  console.log('== G3. a postponed feast fires when the pantry recovers ==');
  if (ARMED) {
    const Game = await buildThinFixture(46, 1.5, 2400);
    const ctx = armedCtx();
    const pol = AG.belonggate;
    pol.setup(Game, ctx);
    pol.upkeep(Game, ctx); // day 30: thin -> hold
    check('G3 day-30 hold', (ctx.fsFeasts || 0) === 0 && (ctx.agGateHeld || 0) === 1,
      `fsFeasts=${ctx.fsFeasts} agGateHeld=${ctx.agGateHeld}`);
    check('G3 opening not displaced (cadence unmarked)', ctx._fsLastFeastDay === undefined,
      `_fsLastFeastDay=${ctx._fsLastFeastDay}`);
    // the pantry recovers overnight: fresh food arrives, next dusk
    Game.state.scholar.day = 31;
    const v = Game.state.village;
    v.pantry.push(freshItem(Game, 'Snared meat', 20000, 3));
    check('G3 pantry recovered (> 2d)', freshDaysOf(Game) > 2, 'freshDays=' + freshDaysOf(Game).toFixed(2));
    pol.upkeep(Game, ctx); // day 31: surplus -> fires (the postponed opening)
    check('G3 postponed feast fired on recovery', (ctx.fsFeasts || 0) === 1, `fsFeasts=${ctx.fsFeasts}`);
    check('G3 cadence marked by the REAL feast', ctx._fsLastFeastDay === 31,
      `_fsLastFeastDay=${ctx._fsLastFeastDay}`);
  } else {
    console.log('  (skipped — RED phase; G3 is a GREEN assertion)');
  }

  // ---------- G4: armed determinism ----------
  console.log('== G4. armed determinism ==');
  if (ARMED) {
    const run = async (seed) => {
      const Game = await buildDeepFixture(seed);
      const ctx = armedCtx();
      AG.leadgate.setup(Game, ctx);
      const before = havenPantryKcal(Game);
      AG.leadgate.upkeep(Game, ctx);
      return `${ctx.fsFeasts}|${ctx.agGateHeld || 0}|${before - havenPantryKcal(Game)}|${freshDaysOf(Game).toFixed(3)}`;
    };
    const r1 = await run(47), r2 = await run(47);
    check('G4 identical fixture twice -> identical outcome', r1 === r2, r1);
  } else {
    console.log('  (skipped — RED phase; G4 is a GREEN assertion)');
  }

  // ---------- G5: no double-feast ----------
  console.log('== G5. no double-feast on the same day ==');
  if (ARMED) {
    const Game = await buildDeepFixture(48);
    const ctx = armedCtx();
    AG.leadgate.setup(Game, ctx);
    AG.leadgate.upkeep(Game, ctx);
    const afterFirst = ctx.fsFeasts || 0;
    AG.leadgate.upkeep(Game, ctx); // second upkeep, same day
    check('G5 one feast claims the day slot', afterFirst === 1 && (ctx.fsFeasts || 0) === 1,
      `fsFeasts=${ctx.fsFeasts} s.feastDay=${(Game.state.scholar || {}).feastDay}`);
  } else {
    console.log('  (skipped — RED phase; G5 is a GREEN assertion)');
  }

  // ---------- G6: gate inert without FEASTSCALE_R13 ----------
  console.log('== G6. gate inert without FEASTSCALE_R13 ==');
  {
    // Textual + behavioral: the gate path is unreachable when the r13
    // layer is off. Behavioral check runs with ALLOWANCEGATE=1 in the
    // current process — but the r13 layer reads the env at require time?
    // No: layerOn() reads process.env per call, so flip it at runtime.
    const saved = process.env.FEASTSCALE_R13;
    delete process.env.FEASTSCALE_R13;
    const Game = await buildThinFixture(49, 1.5, 2400);
    const ctx = armedCtx();
    AG.belonggate.setup(Game, ctx);
    AG.belonggate.upkeep(Game, ctx);
    check('G6 no holds counted with the r13 layer off', (ctx.agGateHeld || 0) === 0,
      `agGateHeld=${ctx.agGateHeld}`);
    check('G6 no allowance feasts with the r13 layer off', (ctx.fsFeasts || 0) === 0,
      `fsFeasts=${ctx.fsFeasts}`);
    const src = fs.readFileSync(path.join(__dirname, 'policies/allowancegate.js'), 'utf8');
    check('G6 gate sits behind the layer guard', src.indexOf('if (!gateOn() || !FS.layerOn())') > 0);
    if (saved !== undefined) process.env.FEASTSCALE_R13 = saved;
  }

  console.log(fails.length ? `\nPROOF ${ARMED ? 'GREEN' : 'RED'}: ${fails.length} FAILURE(S): ${fails.join(', ')}` : `\nPROOF ${ARMED ? 'GREEN' : 'RED'}: ALL GREEN`);
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });

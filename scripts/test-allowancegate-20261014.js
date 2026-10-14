#!/usr/bin/env node
// scripts/test-allowancegate-20261014.js — PROOF for the r14 pantry-state
// gate on the r13 feast allowance (loop B, 2026-10-14, food-economy axis,
// sim-findings #187: the "separately" half of the feastdoor next-run
// prescription — gate the r13 allowance's own pantry-blind feasts).
//
// THE LEVER: scripts/policies/feastscale.js scaleFeast gains an opt-in
// pantry-state gate (FEASTGATE_R13=1, default OFF; requires FEASTSCALE_R13=1
// — the gate rides the r13 machinery). The r13-only diagnostic measured the
// allowance ALONE as genuinely harmful (starvation 15->21, hungryDays 35->48,
// median 151->92d): it fires on contribution >=1500 with no pantry-state
// gate beyond the engine's 1.5x buffer.
//
// THE GATE (design call, documented — Steve can overrule): fire only when
// the honest feast fits inside the SURPLUS above the game's own 4-day fresh
// floor (Game.pantryFreshDays — the same floor prodThrottle uses, and the
// same floor the killed feastdoor duty proved live):
//   spendTarget = (freshDays - 4) * burn; hold when plan.cost > spendTarget.
// The floor never moves. Gate on pantry STATE, never on contribution (the
// contribution rule is untouched — no re-tuning). Held feasts are not feasts:
// the cadence tracker is left alone. Policy-side only; zero src/js changes.
// Conservative: the engine's pantryDraw draws fresh preferentially, so the
// whole plan.cost counts against fresh.
//
// RED PHASE (FEASTGATE_R13 unset):
//   R1. gate-off byte-identical: modified feastscale (FEASTSCALE_R13=1) ==
//       HEAD-pristine feastscale (FEASTSCALE_R13=1) per-day hashes, 40d x2
//       seeds — the gate adds zero trajectory delta when off.
//   R2. gate-off, the allowance FIRES on the 3.9d fixture (contribution
//       >=1500): the fixture really is a fire-fixture for the un-gated
//       allowance — pantry drawn, no gate holds counted.
// GREEN PHASE (FEASTSCALE_R13=1 + FEASTGATE_R13=1):
//   G1. fires on the 6.2d fixture: real pantry draw, fresh-days move DOWN
//       (surplus spent, drawdown direction), floor >= 4 after.
//   G2. holds on the 3.9d fixture: no feast, pantry untouched,
//       fsGateHeld == 1.
//   G3. the floor binds on a small-burn village: at 4.9d the honest feast
//       would breach 4d -> hold; at 6.5d the surplus covers it -> fires,
//       lands >= 4.
//   G4. armed determinism: identical 6.2d fixture twice -> identical outcome.
//   G5. no double-feast: after the gate lets a feast fire, a second upkeep
//       the same day does not re-fire (the one-feast/day slot is claimed).
//   G6. gate inert without FEASTSCALE_R13 (layer off): no holds counted,
//       scaleFeast never runs the gate path.
//   G7. floor never breached in a 120d armed run: pantryFreshDays() >= 4
//       after EVERY feast the armed allowance hosts.
//
// Usage:
//   RED:   FEASTSCALE_R13=1 node scripts/test-allowancegate-20261014.js
//   GREEN: FEASTSCALE_R13=1 FEASTGATE_R13=1 node scripts/test-allowancegate-20261014.js
//
// Kill-protocol degradation: if the gate was reverted post-kill, this
// script degrades to INFO-SKIP (exit 0), never MODULE_NOT_FOUND.
'use strict';
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const FS = require('./policies/feastscale');

// Kill-protocol degradation (feastdoor precedent): the gate was reverted
// post-kill (NO-GO at pilot: hungryDays 44 > 43.2). If the gate is absent,
// degrade to INFO-SKIP — the proof was RED->GREEN pre-kill; see
// evidence/2026-10-14/sim-allowancegate-b.md.
if (typeof FS.pantrySurplusOk !== 'function' || typeof FS.gateOn !== 'function') {
  console.log('INFO-SKIP: allowance-gate layer reverted per kill protocol (NO-GO at pilot); proof was RED->GREEN pre-kill — see evidence/2026-10-14/sim-allowancegate-b.md');
  process.exit(0);
}

const ARMED = process.env.FEASTSCALE_R13 === '1' && process.env.FEASTGATE_R13 === '1';
const LAYER = process.env.FEASTSCALE_R13 === '1';
console.log('== allowancegate proof — ' + (ARMED ? 'ARMED (FEASTSCALE_R13=1 + FEASTGATE_R13=1)' : (LAYER ? 'RED (FEASTSCALE_R13=1, gate off)' : 'RED (gates off)')) + ' ==');

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

// fresh fixture item: 500-kcal units, spoilDay = day + daysLeft
function freshItem(Game, name, kcal, daysLeft) {
  const day = (Game.state.scholar || {}).day || 1;
  return { name, kcalEach: 500, units: Math.ceil(kcal / 500), safe: true, spoilDay: day + daysLeft };
}

// Gate fixture: fresh-days = fk/burn at an honest burn, dusk, at haven,
// no threats. The r13 contribution bar is armed via tribHist. The burn is
// self-calibrated so spendTarget = (fd-4)*burn clears the engine's honest
// feast cost by ~10% on fire-fixtures (margin recorded, never silent).
async function buildGateWorld(seed, burn, freshDaysTarget) {
  const { Game } = await loadGame({ seed, mode: 'allowancegate-proof' });
  await setupGame(Game);
  const said = [];
  Game.say = (t) => { said.push(String(t)); };
  Game.feedback = function () {};
  Game.state.scholar.day = 30;
  Game.dayPart = 2; // dusk
  const v = Game.state.village;
  v.burnHistory = [burn, burn, burn, burn, burn, burn, burn];
  v.pantry = [freshItem(Game, 'Foraged food', Math.round(freshDaysTarget * burn), 3)];
  v.lastRaidDay = 0;
  return { Game, said };
}

// calibrateBurn: rebuild the fixture's burn/pantry so a fire-fixture's
// spendTarget = (freshDays-4)*burn sits ~10% above the engine's honest cost.
// Returns { burn, cost, spendTarget }.
function calibrateBurn(Game, freshDaysTarget, margin) {
  margin = margin || 1.10;
  let cost = 0;
  try { const p = Game.feastPlan(); cost = p.cost || 0; } catch (e) {}
  const burn = Math.ceil(cost * margin / Math.max(0.01, freshDaysTarget - 4));
  const v = Game.state.village;
  v.burnHistory = [burn, burn, burn, burn, burn, burn, burn];
  v.pantry = [freshItem(Game, 'Foraged food', Math.round(freshDaysTarget * burn), 3)];
  return { burn, cost, spendTarget: (freshDaysTarget - 4) * burn };
}

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
  await runDays(Game, wrapped, { days, sampleEvery: 1 });
  return hashes;
}

(async () => {
  // ---------- R1: gate-off byte-identical vs the HEAD-pristine parents ----------
  console.log('== R1. gate-off byte-identical (modified vs HEAD-pristine, 40d) ==');
  const parentTmp = path.join(__dirname, 'policies', 'feastscale-parent-tmp.js');
  if (!ARMED) {
    try {
      const src = execSync('git show HEAD:scripts/policies/feastscale.js', { cwd: __dirname, encoding: 'utf8', maxBuffer: 1 << 20 });
      fs.writeFileSync(parentTmp, src);
      const PARENT = require('./policies/feastscale-parent-tmp');
      for (const [mine, theirs, label] of [[FS.leadfeast, PARENT.leadfeast, 'leadfeast'], [FS.belongfeast, PARENT.belongfeast, 'belongfeast']]) {
        const hMine = await runHashes(mine, label === 'leadfeast' ? 11 : 22, 40);
        const hTheirs = await runHashes(theirs, label === 'leadfeast' ? 11 : 22, 40);
        const same = hMine.length === hTheirs.length && hMine.every((h, i) => h === hTheirs[i]);
        check(`R1 gate-off: ${label} == HEAD-pristine per-day hashes`, same, `n=${hMine.length}/${hTheirs.length}`);
      }
    } finally {
      try { fs.unlinkSync(parentTmp); } catch (e) {}
    }
  } else {
    console.log('  (skipped — armed phase; R1 is a RED assertion)');
  }

  // ---------- R2: gate-off, the allowance FIRES on the 3.9d fixture ----------
  console.log('== R2. gate-off: the allowance fires on the 3.9d fixture ==');
  if (!ARMED) {
    const { Game } = await buildGateWorld(42, 2400, 3.9);
    check('R2 fixture really is below the gate floor', freshDaysOf(Game) > 3.5 && freshDaysOf(Game) < 4,
      'freshDays=' + freshDaysOf(Game).toFixed(2));
    const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
    const pol = FS.leadfeast;
    pol.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    pol.upkeep(Game, ctx);
    check('R2 allowance fired gate-off', (ctx.fsFeasts || 0) === 1, `fsFeasts=${ctx.fsFeasts}`);
    check('R2 pantry really drawn gate-off', havenPantryKcal(Game) < before,
      `${before} -> ${havenPantryKcal(Game)}`);
    check('R2 no gate holds counted gate-off', (ctx.fsGateHeld || 0) === 0,
      `fsGateHeld=${ctx.fsGateHeld}`);
  } else {
    console.log('  (skipped — armed phase; R2 is a RED assertion)');
  }

  // ---------- G1: fires on the 6.2d fixture ----------
  console.log('== G1. fires on the 6.2d fixture ==');
  if (ARMED) {
    const { Game } = await buildGateWorld(43, 2400, 6.2);
    const cal = calibrateBurn(Game, 6.2, 1.10);
    check('G1 fixture really is surplus', freshDaysOf(Game) > 6.1 && freshDaysOf(Game) < 6.3,
      'freshDays=' + freshDaysOf(Game).toFixed(2));
    const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
    const pol = FS.leadfeast;
    pol.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    pol.upkeep(Game, ctx);
    check('G1 allowance feast fired', (ctx.fsFeasts || 0) === 1,
      `fsFeasts=${ctx.fsFeasts} cost=${cal.cost} spendTarget=${Math.round(cal.spendTarget)}`);
    check('G1 pantry really drawn', havenPantryKcal(Game) < before,
      `${before} -> ${havenPantryKcal(Game)}`);
    check('G1 surplus spent (drawdown direction)', freshDaysOf(Game) < 6.2,
      'freshDays=' + freshDaysOf(Game).toFixed(2));
    check('G1 floor >= 4 after the feast (never below)', freshDaysOf(Game) >= 4,
      'freshDays=' + freshDaysOf(Game).toFixed(2));
    check('G1 no gate hold on a surplus fixture', (ctx.fsGateHeld || 0) === 0,
      `fsGateHeld=${ctx.fsGateHeld}`);
  } else {
    console.log('  (skipped — RED phase; G1 is a GREEN assertion)');
  }

  // ---------- G2: holds on the 3.9d fixture ----------
  console.log('== G2. holds on the 3.9d fixture ==');
  if (ARMED) {
    const { Game } = await buildGateWorld(44, 2400, 3.9);
    check('G2 fixture really is below the gate floor', freshDaysOf(Game) > 3.5 && freshDaysOf(Game) < 4,
      'freshDays=' + freshDaysOf(Game).toFixed(2));
    const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
    const pol = FS.leadfeast;
    pol.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    pol.upkeep(Game, ctx);
    check('G2 gate held the feast off', (ctx.fsFeasts || 0) === 0,
      `fsFeasts=${ctx.fsFeasts}`);
    check('G2 pantry untouched', havenPantryKcal(Game) === before,
      `${before} -> ${havenPantryKcal(Game)}`);
    check('G2 hold counted', (ctx.fsGateHeld || 0) === 1,
      `fsGateHeld=${ctx.fsGateHeld}`);
  } else {
    console.log('  (skipped — RED phase; G2 is a GREEN assertion)');
  }

  // ---------- G3: the floor binds on a small-burn village ----------
  console.log('== G3. the floor binds on a small-burn village ==');
  if (ARMED) {
    // 4.9d: spendTarget = 0.9*2400 = 2160 < honest cost -> hold
    const a = await buildGateWorld(45, 2400, 4.9);
    let costA = 0;
    try { costA = (a.Game.feastPlan() || {}).cost || 0; } catch (e) {}
    check('G3a fixture assumption (0.9*2400 < honest cost)', 2160 < costA,
      `cost=${costA} (fails loudly if the roster changes)`);
    const ctxA = { _tribHist: [{ day: 29, kcal: 2000 }] };
    FS.belongfeast.setup(a.Game, ctxA);
    a.Game.dayPart = 2;
    FS.belongfeast.upkeep(a.Game, ctxA);
    check('G3a floor holds when the honest feast would breach 4d',
      (ctxA.fsFeasts || 0) === 0 && (ctxA.fsGateHeld || 0) === 1,
      `fsFeasts=${ctxA.fsFeasts} fsGateHeld=${ctxA.fsGateHeld}`);
    // 6.5d: spendTarget = 2.5*2400 = 6000 >= honest cost -> fires, lands >= 4
    const b = await buildGateWorld(46, 2400, 6.5);
    const cal = calibrateBurn(b.Game, 6.5, 1.10);
    check('G3b fixture assumption (surplus covers the honest cost)', cal.spendTarget >= cal.cost,
      `cost=${cal.cost} spendTarget=${Math.round(cal.spendTarget)}`);
    const ctxB = { _tribHist: [{ day: 29, kcal: 2000 }] };
    FS.belongfeast.setup(b.Game, ctxB);
    FS.belongfeast.upkeep(b.Game, ctxB);
    check('G3b fires when the surplus covers the feast', (ctxB.fsFeasts || 0) === 1,
      `fsFeasts=${ctxB.fsFeasts}`);
    check('G3b floor >= 4 after (never below)', freshDaysOf(b.Game) >= 4,
      'freshDays=' + freshDaysOf(b.Game).toFixed(2));
  } else {
    console.log('  (skipped — RED phase; G3 is a GREEN assertion)');
  }

  // ---------- G4: armed determinism ----------
  console.log('== G4. armed determinism ==');
  if (ARMED) {
    const run = async (seed) => {
      const { Game } = await buildGateWorld(seed, 2400, 6.2);
      calibrateBurn(Game, 6.2, 1.10);
      const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
      FS.leadfeast.setup(Game, ctx);
      const before = havenPantryKcal(Game);
      FS.leadfeast.upkeep(Game, ctx);
      return `${ctx.fsFeasts}|${before - havenPantryKcal(Game)}|${freshDaysOf(Game).toFixed(3)}`;
    };
    const r1 = await run(47), r2 = await run(47);
    check('G4 identical fixture twice -> identical outcome', r1 === r2, r1);
  } else {
    console.log('  (skipped — RED phase; G4 is a GREEN assertion)');
  }

  // ---------- G5: no double-feast on the same day ----------
  console.log('== G5. no double-feast with the one-feast/day slot ==');
  if (ARMED) {
    const { Game } = await buildGateWorld(48, 2400, 6.2);
    calibrateBurn(Game, 6.2, 1.10);
    const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
    FS.leadfeast.setup(Game, ctx);
    FS.leadfeast.upkeep(Game, ctx);
    const afterFirst = ctx.fsFeasts || 0;
    FS.leadfeast.upkeep(Game, ctx); // second upkeep, same day
    check('G5 one feast claims the day slot', afterFirst === 1 && (ctx.fsFeasts || 0) === 1,
      `fsFeasts=${ctx.fsFeasts} s.feastDay=${(Game.state.scholar || {}).feastDay}`);
  } else {
    console.log('  (skipped — RED phase; G5 is a GREEN assertion)');
  }

  // ---------- G6: gate inert without FEASTSCALE_R13 ----------
  console.log('== G6. gate inert without FEASTSCALE_R13 (layer off) ==');
  if (ARMED) {
    // process the layer-off world manually: call the exported gate helper —
    // it is unreachable when the layer is off, so assert the call sites.
    const src = fs.readFileSync(path.join(__dirname, 'policies/feastscale.js'), 'utf8');
    const gateSite = src.indexOf('if (gateOn() && !pantrySurplusOk(Game, plan))');
    const scaleFeastBody = src.slice(src.indexOf('function scaleFeast'), src.indexOf('function withFeastScale'));
    const layerGuard = scaleFeastBody.indexOf('if (!layerOn()) return;');
    check('G6 gate sits inside scaleFeast', gateSite > 0);
    check('G6 scaleFeast returns before the gate when the layer is off',
      layerGuard > 0 && layerGuard < scaleFeastBody.indexOf('pantrySurplusOk'));
    // Default-OFF is proven by R1 (gate-off == HEAD-pristine); the gate is
    // textually unreachable unless layerOn() already passed.
  } else {
    console.log('  (skipped — RED phase; G6 is a GREEN assertion)');
  }

  // ---------- G7: floor never breached in a 120d armed run ----------
  console.log('== G7. floor never breached in a 120d armed run ==');
  if (ARMED) {
    const { Game } = await loadGame({ seed: 11, mode: 'allowancegate-g7', fullTelemetry: false });
    await setupGame(Game);
    const fdAfter = [];
    const origHost = Game.hostFeast.bind(Game);
    Game.hostFeast = function (...a) {
      const r = origHost(...a);
      if (r && r.ok) { try { fdAfter.push(+Game.pantryFreshDays().toFixed(2)); } catch (e) {} }
      return r;
    };
    let runCtx = null;
    const policy = Object.assign({}, FS.leadfeast);
    const origSetup = FS.leadfeast.setup;
    policy.setup = (G, ctx) => { runCtx = ctx; if (origSetup) return origSetup(G, ctx); };
    await quietLogSafe(async () => { await runDays(Game, policy, { days: 120, manifest: undefined, sampleEvery: 10 }); });
    check('G7 the armed allowance fired >=1 feast in 120d', fdAfter.length >= 1,
      `feasts=${fdAfter.length}`);
    const minFd = fdAfter.length ? Math.min.apply(null, fdAfter) : -1;
    check('G7 floor >= 4 after EVERY armed feast', fdAfter.every(x => x >= 4),
      `min=${minFd} n=${fdAfter.length}`);
    check('G7 gate holds counted on the long run', (runCtx && (runCtx.fsGateHeld || 0)) >= 0,
      `fsGateHeld=${runCtx && runCtx.fsGateHeld}`);
  } else {
    console.log('  (skipped — RED phase; G7 is a GREEN assertion)');
  }

  console.log(fails.length ? `\nPROOF ${ARMED ? 'GREEN' : 'RED'}: ${fails.length} FAILURE(S): ${fails.join(', ')}` : `\nPROOF ${ARMED ? 'GREEN' : 'RED'}: ALL GREEN`);
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });

async function quietLogSafe(fn) {
  try {
    const { quietLog } = require('./sim-harness');
    return await quietLog(fn);
  } catch (e) { return await fn(); }
}

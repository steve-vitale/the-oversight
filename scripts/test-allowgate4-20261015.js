#!/usr/bin/env node
// scripts/test-allowgate4-20261015.js — PROOF for the allowgate4 arm (loop
// B, 2026-10-15, food-economy axis, sim-findings #187 — re-run of r14's
// 4-day-floor gate under noise-calibrated bounds, candidate-counted holds): re-arm of
// r14's 4-day-floor pantry-state gate as a SEPARATE policy layer on the r13
// feast allowance, with hold telemetry counted on FEAST CANDIDATES ONLY
// (r15's telemetry blank fixed).
//
// THE LEVER: scripts/policies/allowgate2.js wraps leadfeast/belongfeast.
// THE GATE (ALLOWGATE2=1, default OFF; requires FEASTSCALE_R13=1): on a
// feast the allowance would actually fire (full r13 candidacy chain passes),
// compute spendTarget = (freshDays - 4) * burn and HOLD when plan.cost >
// spendTarget. Suppressed feasts POSTPONED, never displaced: the shared
// cadence tracker (ctx._fsLastFeastDay) is NOT marked. Hold counted ONLY
// for candidates (ctx.ag2GateHeld per-hold). Policy-side only; zero src/js
// changes.
//
// RED PHASE (FEASTSCALE_R13=1, ALLOWGATE2 unset):
//   R1. gate-off byte-identical: leadgate2/belonggate2 (gate off) ==
//       leadfeast/belongfeast per-day run hashes, 40d x2 seeds.
//   R2. gate-off, the allowance FIRES on the 3.9d fixture (fresh-days < 4
//       but the 1.5x buffer passes): the harm mechanism in miniature — the
//       un-gated allowance drops the fixture's fresh-days toward ~1.9.
// GREEN PHASE (FEASTSCALE_R13=1 + ALLOWGATE2=1):
//   G1. holds on the 3.9d fixture: no feast, pantry untouched,
//       ag2GateHeld == 1, cadence NOT marked.
//   G2. fires on the 6.2d fixture: real pantry draw, ag2GateHeld == 0, and
//       the 4-day floor is honored (freshDays lands >= 4).
//   G3. postponed feasts fire when the pantry recovers: day-30 hold with
//       cadence unmarked; fresh food arrives; day-31 fires and marks
//       _fsLastFeastDay=31.
//   G4. armed determinism: identical fixture twice -> identical outcome.
//   G5. no double-feast: a second upkeep the same day does not re-fire.
//   G6. gate inert without FEASTSCALE_R13 (ALLOWGATE2=1, layer off): no
//       holds counted, no allowance feasts; textual guard present.
//   G7. 60d armed run: the 4-day floor holds after EVERY feast (min
//       post-feast freshDays >= 3.99) — the floor invariant live.
//
// Usage:
//   RED:   FEASTSCALE_R13=1 node scripts/test-allowgate4-20261015.js
//   GREEN: FEASTSCALE_R13=1 ALLOWGATE2=1 node scripts/test-allowgate4-20261015.js
//
// Kill-protocol degradation: if the layer file is deleted post-kill, this
// script degrades to INFO-SKIP (exit 0), never MODULE_NOT_FOUND.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

let AG2;
try {
  AG2 = require('./policies/allowgate2');
} catch (e) {
  console.log('INFO-SKIP: allowgate2 layer absent (reverted per kill protocol); proof was RED->GREEN pre-decision — see evidence/2026-10-15/sim-allowgate4-b.md');
  process.exit(0);
}
const FS = require('./policies/feastscale');

const GATE = process.env.ALLOWGATE2 === '1';
const LAYER = process.env.FEASTSCALE_R13 === '1';
const ARMED = LAYER && GATE;
console.log('== allowgate4 proof — ' + (ARMED ? 'ARMED (FEASTSCALE_R13=1 + ALLOWGATE2=1)' : (LAYER ? 'RED (FEASTSCALE_R13=1, gate off)' : 'RED (gates off)')) + ' ==');

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

// buildFixture: pantry with `freshTargetDays` of fresh food at `burn`/day.
// The 3.9d fixture is the r14 harm miniature: fresh floor thin (< 4d) while
// total kcal still clears the engine's 1.5x buffer, so the un-gated
// allowance fires pantry-blind. The 6.2d fixture is deep surplus.
async function buildFixture(seed, freshTargetDays, burn) {
  const { Game } = await loadGame({ seed, mode: 'allowgate4-proof' });
  await setupGame(Game);
  Game.say = () => {}; Game.feedback = function () {};
  Game.state.scholar.day = 30;
  Game.dayPart = 2; // dusk
  const v = Game.state.village;
  v.burnHistory = [burn, burn, burn, burn, burn, burn, burn];
  v.pantry = [freshItem(Game, 'Foraged food', Math.round(freshTargetDays * burn), 3)];
  v.lastRaidDay = 0;
  return Game;
}

function armedCtx() { return { _tribHist: [{ day: 29, kcal: 2000 }] }; }

async function runHashes(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'allowgate4-red' });
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
  console.log('== R1. gate-off byte-identical (leadgate2/belonggate2 vs leadfeast/belongfeast, 40d) ==');
  if (!ARMED) {
    for (const [mine, theirs, label] of [[AG2.leadgate2, FS.leadfeast, 'lead'], [AG2.belonggate2, FS.belongfeast, 'belong']]) {
      const seed = label === 'lead' ? 11 : 22;
      const hMine = await runHashes(mine, seed, 40);
      const hTheirs = await runHashes(theirs, seed, 40);
      const same = hMine.length === hTheirs.length && hMine.every((h, i) => h === hTheirs[i]);
      check(`R1 gate-off: ${label}gate2 == ${label}feast per-day hashes`, same, `n=${hMine.length}/${hTheirs.length}`);
    }
  } else {
    console.log('  (skipped — armed phase; R1 is a RED assertion)');
  }

  // ---------- R2: gate-off, the allowance FIRES pantry-blind on the 3.9d fixture ----------
  console.log('== R2. gate-off: the allowance fires pantry-blind on the 3.9d fixture ==');
  if (!ARMED) {
    const Game = await buildFixture(42, 3.9, 2400);
    const fd = freshDaysOf(Game);
    check('R2 fixture really is sub-floor fresh (< 4d)', fd > 3 && fd < 4, 'freshDays=' + fd.toFixed(2));
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
    const fdAfter = freshDaysOf(Game);
    check('R2 pantry really drawn gate-off (fresh floor raided)', havenPantryKcal(Game) < before && fdAfter < fd,
      `${before} -> ${havenPantryKcal(Game)} kcal; freshDays ${fd.toFixed(2)} -> ${fdAfter.toFixed(2)}`);
    check('R2 no gate holds counted gate-off', (ctx.ag2GateHeld || 0) === 0, `ag2GateHeld=${ctx.ag2GateHeld}`);
  } else {
    console.log('  (skipped — armed phase; R2 is a RED assertion)');
  }

  // ---------- G1: holds on the 3.9d fixture ----------
  console.log('== G1. gate holds on the 3.9d fixture ==');
  if (ARMED) {
    const Game = await buildFixture(44, 3.9, 2400);
    const fd = freshDaysOf(Game);
    check('G1 fixture really is sub-floor fresh (< 4d)', fd > 3 && fd < 4, 'freshDays=' + fd.toFixed(2));
    check('G1 engine exposes pantryFreshKcal (burn reconstruction is honest)',
      typeof Game.pantryFreshKcal === 'function');
    const burn = AG2.burnAt(Game);
    check('G1 burn reconstructed ~2400', Math.abs(burn - 2400) < 60, 'burn=' + Math.round(burn));
    let plan = null;
    try { plan = Game.feastPlan(); } catch (e) {}
    const spendTarget = (fd - 4) * burn;
    check('G1 fixture is a real candidate the floor refuses (cost > spendTarget)',
      !!(plan && plan.ok && plan.have >= plan.cost * 1.5 && plan.cost > spendTarget),
      `cost=${plan && plan.cost} spendTarget=${Math.round(spendTarget)}`);
    const ctx = armedCtx();
    const pol = AG2.leadgate2;
    pol.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    pol.upkeep(Game, ctx);
    check('G1 gate held the pantry-blind feast', (ctx.fsFeasts || 0) === 0, `fsFeasts=${ctx.fsFeasts}`);
    check('G1 pantry untouched', havenPantryKcal(Game) === before, `${before} -> ${havenPantryKcal(Game)}`);
    check('G1 hold counted (candidate-only telemetry)', (ctx.ag2GateHeld || 0) === 1, `ag2GateHeld=${ctx.ag2GateHeld}`);
    check('G1 cadence NOT marked (postponed, not displaced)', ctx._fsLastFeastDay === undefined,
      `_fsLastFeastDay=${ctx._fsLastFeastDay}`);
  } else {
    console.log('  (skipped — RED phase; G1 is a GREEN assertion)');
  }

  // ---------- G2: fires on the 6.2d fixture, floor honored ----------
  console.log('== G2. gate fires on the 6.2d fixture, floor honored ==');
  if (ARMED) {
    const Game = await buildFixture(45, 6.2, 2400);
    const fd = freshDaysOf(Game);
    check('G2 fixture really is deep-fresh (> 6d)', fd > 6, 'freshDays=' + fd.toFixed(2));
    const ctx = armedCtx();
    const pol = AG2.leadgate2;
    pol.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    pol.upkeep(Game, ctx);
    check('G2 allowance feast fired on surplus', (ctx.fsFeasts || 0) === 1, `fsFeasts=${ctx.fsFeasts}`);
    check('G2 pantry really drawn', havenPantryKcal(Game) < before, `${before} -> ${havenPantryKcal(Game)}`);
    check('G2 no hold on a surplus fixture', (ctx.ag2GateHeld || 0) === 0, `ag2GateHeld=${ctx.ag2GateHeld}`);
    const fdAfter = freshDaysOf(Game);
    check('G2 the 4-day floor is honored (lands >= 4)', fdAfter >= 4,
      `freshDays ${fd.toFixed(2)} -> ${fdAfter.toFixed(2)}`);
  } else {
    console.log('  (skipped — RED phase; G2 is a GREEN assertion)');
  }

  // ---------- G3: postponed feasts fire when the pantry recovers ----------
  console.log('== G3. a postponed feast fires when the pantry recovers ==');
  if (ARMED) {
    const Game = await buildFixture(46, 3.9, 2400);
    const ctx = armedCtx();
    const pol = AG2.belonggate2;
    pol.setup(Game, ctx);
    pol.upkeep(Game, ctx); // day 30: sub-floor -> hold
    check('G3 day-30 hold', (ctx.fsFeasts || 0) === 0 && (ctx.ag2GateHeld || 0) === 1,
      `fsFeasts=${ctx.fsFeasts} ag2GateHeld=${ctx.ag2GateHeld}`);
    check('G3 opening not displaced (cadence unmarked)', ctx._fsLastFeastDay === undefined,
      `_fsLastFeastDay=${ctx._fsLastFeastDay}`);
    // the pantry recovers overnight: fresh food arrives, next dusk
    Game.state.scholar.day = 31;
    const v = Game.state.village;
    v.pantry.push(freshItem(Game, 'Snared meat', 25000, 3));
    check('G3 pantry recovered (> 4d)', freshDaysOf(Game) > 4, 'freshDays=' + freshDaysOf(Game).toFixed(2));
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
      const Game = await buildFixture(seed, 6.2, 2400);
      const ctx = armedCtx();
      AG2.leadgate2.setup(Game, ctx);
      const before = havenPantryKcal(Game);
      AG2.leadgate2.upkeep(Game, ctx);
      return `${ctx.fsFeasts}|${ctx.ag2GateHeld || 0}|${before - havenPantryKcal(Game)}|${freshDaysOf(Game).toFixed(3)}`;
    };
    const r1 = await run(47), r2 = await run(47);
    check('G4 identical fixture twice -> identical outcome', r1 === r2, r1);
  } else {
    console.log('  (skipped — RED phase; G4 is a GREEN assertion)');
  }

  // ---------- G5: no double-feast ----------
  console.log('== G5. no double-feast on the same day ==');
  if (ARMED) {
    const Game = await buildFixture(48, 6.2, 2400);
    const ctx = armedCtx();
    AG2.leadgate2.setup(Game, ctx);
    AG2.leadgate2.upkeep(Game, ctx);
    const afterFirst = ctx.fsFeasts || 0;
    AG2.leadgate2.upkeep(Game, ctx); // second upkeep, same day
    check('G5 one feast claims the day slot', afterFirst === 1 && (ctx.fsFeasts || 0) === 1,
      `fsFeasts=${ctx.fsFeasts} s.feastDay=${(Game.state.scholar || {}).feastDay}`);
  } else {
    console.log('  (skipped — RED phase; G5 is a GREEN assertion)');
  }

  // ---------- G6: gate inert without FEASTSCALE_R13 ----------
  console.log('== G6. gate inert without FEASTSCALE_R13 ==');
  {
    const saved = process.env.FEASTSCALE_R13;
    delete process.env.FEASTSCALE_R13;
    const Game = await buildFixture(49, 3.9, 2400);
    const ctx = armedCtx();
    AG2.belonggate2.setup(Game, ctx);
    AG2.belonggate2.upkeep(Game, ctx);
    check('G6 no holds counted with the r13 layer off', (ctx.ag2GateHeld || 0) === 0,
      `ag2GateHeld=${ctx.ag2GateHeld}`);
    check('G6 no allowance feasts with the r13 layer off', (ctx.fsFeasts || 0) === 0,
      `fsFeasts=${ctx.fsFeasts}`);
    const src = fs.readFileSync(path.join(__dirname, 'policies/allowgate2.js'), 'utf8');
    check('G6 gate sits behind the layer guard', src.indexOf('if (!gateOn() || !FS.layerOn())') > 0);
    if (saved !== undefined) process.env.FEASTSCALE_R13 = saved;
  }

  // ---------- G7: the 4-day floor holds after EVERY feast in a 60d armed run ----------
  console.log('== G7. the 4-day floor holds after every feast in a 60d armed run ==');
  if (ARMED) {
    const { Game } = await loadGame({ seed: 11, mode: 'allowgate4-g7' });
    await setupGame(Game);
    const base = AG2.leadgate2;
    const policy = Object.assign({}, base);
    const postFeastFd = [];
    let seenFeasts = 0, runCtx = null;
    const origSetup = base.setup;
    policy.setup = (G, ctx) => { runCtx = ctx; if (origSetup) return origSetup(G, ctx); };
    const origUpkeep = base.upkeep.bind(base);
    policy.upkeep = (G, ctx) => {
      const beforeFeasts = ctx.fsFeasts || 0;
      origUpkeep(G, ctx);
      if ((ctx.fsFeasts || 0) > beforeFeasts) {
        postFeastFd.push({ day: (G.state.scholar || {}).day || 0, fd: +freshDaysOf(G).toFixed(2) });
        seenFeasts++;
      }
    };
    await quietLog(async () => { await runDays(Game, policy, { days: 60, manifest: undefined, sampleEvery: 10 }); });
    const minFd = postFeastFd.length ? Math.min.apply(null, postFeastFd.map(x => x.fd)) : 999;
    check('G7 feasts actually fired in the 60d armed run', seenFeasts > 0, `n=${seenFeasts}`);
    check('G7 floor >= 4 after EVERY feast', minFd >= 3.99,
      `min post-feast freshDays=${minFd} over ${postFeastFd.length} feasts`);
  } else {
    console.log('  (skipped — RED phase; G7 is a GREEN assertion)');
  }

  console.log(fails.length ? `\nPROOF ${ARMED ? 'GREEN' : 'RED'}: ${fails.length} FAILURE(S): ${fails.join(', ')}` : `\nPROOF ${ARMED ? 'GREEN' : 'RED'}: ALL GREEN`);
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });

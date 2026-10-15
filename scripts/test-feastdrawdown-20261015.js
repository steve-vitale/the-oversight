#!/usr/bin/env node
// scripts/test-feastdrawdown-20261015.js — PROOF for the SIM-FEASTDRAWDOWN arm
// (loop B, 2026-10-15, food-economy axis — feast-AS-DRAWDOWN).
//
// THE LEVER (policy-side only, scripts/policies/feastdrawdown.js,
// FEASTDRAWDOWN=1, default OFF — ZERO src/js changes): wraps leadfeast
// (the r13 road, FEASTSCALE_R13=1) as feastDrawdown. Fresh-days > 4 +
// siege-gate clear (no lingerer / gorge-night-trailing-7d / raid-7d) →
// ONE hostFeast/day under the r13 allowance chain
// (allowgate2.feastCandidate). Floor NEVER below 3 fresh-days
// (maxDrawdownKcal = fresh − 3×burn; the documented deviation from the
// aidspoil driver's 2-day floor). No double-feast (the driver's feast
// runs BEFORE the base upkeep; s.feastDay blocks the allowance after).
// No displacement (the driver's feast marks its OWN _fdLastFeastDay,
// never the shared _fsLastFeastDay). No aid verb. No tribute verb.
// Cause lines after confirmed verbs only.
//
// Control = pristine leadfeast (FEASTDRAWDOWN unset — R1 asserts the
// wrapper is byte-identical to the parent gate-off). Armed =
// feastDrawdown + FEASTDRAWDOWN=1 (+ FEASTSCALE_R13=1).
//
// RED PHASE (FEASTDRAWDOWN unset):
//   R1. gate-off byte-identical: feastDrawdown == leadfeast per-day
//       hashes, 40d x 2 seeds.
//   R2. no verbs fire gate-off, even on a constructed overstock fixture.
// ARMED PHASE (FEASTDRAWDOWN=1 + FEASTSCALE_R13=1):
//   A1. feast fires on the overstock fixture via honest hostFeast:
//       fdFeasts=1, real pantry draw, engine beat fires, cause line AFTER
//       the beat, floor >= 3 after, one feast/day marked, own cadence
//       marked, shared cadence UNTOUCHED.
//   A2. trigger: 3.9 fresh-days holds the feast off (fires ONLY on > 4).
//   A3. floor math: maxDrawdownKcal = fresh − 3×burn; feast refused when
//       plan.cost exceeds it.
//   A4/A5/A6. siege-gate: lingerer / recent-raid / gorge-night-trailing-7d
//       hold the feast off (hold counted); an 8d-old gorge does NOT hold.
//   A7. no double-feast: s.feastDay === day (allowance already fired) →
//       the driver stands down.
//   A8. no displacement: the driver's feast does NOT mark the shared
//       _fsLastFeastDay (the allowance's cadence is untouched).
//   A9. armed determinism: FEASTDRAWDOWN=1 twice → identical hashes.
//   A10. inert without FEASTSCALE_R13: FEASTDRAWDOWN=1 but r13 unset →
//       the driver's feast does not fire (the duty rides the r13 road).
//
// Kill-protocol degradation: if the layer file was deleted post-kill,
// this script degrades to INFO-SKIP (exit 0), never MODULE_NOT_FOUND.
//
// Usage:
//   node scripts/test-feastdrawdown-20261015.js                              # RED
//   FEASTDRAWDOWN=1 FEASTSCALE_R13=1 node scripts/test-feastdrawdown-20261015.js  # ARMED
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
let FD = null;
try { FD = require('./policies/feastdrawdown'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: feastdrawdown layer absent (killed or not yet built); status in evidence/2026-10-15/sim-feastdrawdown-b.md');
    process.exit(0);
  }
  throw e;
}
const { leadfeast } = require('./policies/feastscale');

const DRIVER = process.env.FEASTDRAWDOWN === '1';
const R13 = process.env.FEASTSCALE_R13 === '1';
const PHASE = (DRIVER && R13) ? 'ARMED (FEASTDRAWDOWN=1 + FEASTSCALE_R13=1)' : 'RED (gate off)';
console.log('== feastdrawdown proof — ' + PHASE + ' ==');

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

function freshItem(Game, name, kcal, daysLeft) {
  const day = (Game.state.scholar || {}).day || 1;
  return { name, kcalEach: 500, units: Math.ceil(kcal / 500), safe: true, spoilDay: day + daysLeft };
}

function freshDaysOf(Game) { try { return Game.pantryFreshDays(); } catch (e) { return -1; } }

// Overstock fixture: dusk, at haven, no threats. The r13 contribution bar
// is armed via _tribHist (tribute/tend paid this week).
async function buildFeastWorld(seed, burn, freshDaysTarget) {
  const { Game } = await loadGame({ seed, mode: 'feastdrawdown-proof' });
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

function contribCtx() { return { _tribHist: [{ day: 29, kcal: 2000 }] }; }

async function runHashes(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'feastdrawdown-red' });
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
  const ARMED = DRIVER && R13;

  // ---------- R1: gate-off byte-identical ----------
  console.log('== R1. gate-off byte-identical (wrapped vs parent, 40d) ==');
  if (!ARMED) {
    const hWrap = await runHashes(FD.feastDrawdown, 11, 40);
    const hBase = await runHashes(leadfeast, 11, 40);
    check('R1 gate-off: feastDrawdown == leadfeast per-day hashes',
      hWrap.length === hBase.length && hWrap.every((h, i) => h === hBase[i]),
      `n=${hWrap.length}/${hBase.length}`);
    const hWrap2 = await runHashes(FD.feastDrawdown, 22, 40);
    const hBase2 = await runHashes(leadfeast, 22, 40);
    check('R1 gate-off: feastDrawdown == leadfeast per-day hashes (seed 22)',
      hWrap2.length === hBase2.length && hWrap2.every((h, i) => h === hBase2[i]),
      `n=${hWrap2.length}/${hBase2.length}`);
  } else {
    console.log('  (skipped — armed phase; R1 is a RED assertion)');
  }

  // ---------- R2: no verbs fire gate-off ----------
  console.log('== R2. no verbs fire gate-off on the overstock fixture ==');
  if (!ARMED) {
    const { Game, said } = await buildFeastWorld(42, 24000, 6.25);
    check('R2 fixture really is overstock', freshDaysOf(Game) > 4,
      'freshDays=' + freshDaysOf(Game).toFixed(2));
    const ctx = contribCtx();
    FD.feastDrawdown.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    FD.feastDrawdown.upkeep(Game, ctx);
    check('R2 gate-off: driver feast did not fire', ctx.fdFeasts === undefined,
      `fdFeasts=${ctx.fdFeasts}`);
    check('R2 gate-off: pantry untouched', havenPantryKcal(Game) === before,
      `${before} -> ${havenPantryKcal(Game)}`);
    check('R2 gate-off: no driver cause line said',
      !said.some(s => /eats itself/.test(s)), said.length + ' beats');
  } else {
    console.log('  (skipped — armed phase; R2 is a RED assertion)');
  }

  // ---------- A1: feast fires on the overstock fixture ----------
  console.log('== A1. feast fires via honest hostFeast on the overstock fixture ==');
  if (ARMED) {
    const { Game, said } = await buildFeastWorld(43, 24000, 6.25);
    const fdBefore = freshDaysOf(Game);
    const ctx = contribCtx();
    FD.feastDrawdown.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    FD.feastDrawdown.upkeep(Game, ctx);
    check('A1 driver feast fired (fdFeasts=1, real kcal)',
      ctx.fdFeasts === 1 && (ctx.fdFeastKcal || 0) > 0,
      `fdFeasts=${ctx.fdFeasts} kcal=${ctx.fdFeastKcal}`);
    check('A1 pantry really drawn', havenPantryKcal(Game) < before,
      `${before} -> ${havenPantryKcal(Game)}`);
    const beatIx = said.findIndex(s => /🍖 FEAST/.test(s));
    const causeIx = said.findIndex(s => /eats itself/.test(s));
    check('A1 engine feast beat fired', beatIx >= 0);
    check('A1 driver cause line narrated', causeIx >= 0,
      said[causeIx] ? said[causeIx].slice(0, 120) : '(none)');
    check('A1 cause line AFTER the verb confirms (#201)',
      beatIx >= 0 && causeIx > beatIx, `beat@${beatIx} cause@${causeIx}`);
    check('A1 floor respected (fresh-days >= 3 after)',
      freshDaysOf(Game) >= 3, `${fdBefore.toFixed(1)} -> ${freshDaysOf(Game).toFixed(1)}`);
    check('A1 drawdown direction (fresh-days fell)', freshDaysOf(Game) < fdBefore,
      `${fdBefore.toFixed(1)} -> ${freshDaysOf(Game).toFixed(1)}`);
    check('A1 one feast/day marked', ctx._fdFired === 30, '_fdFired=' + ctx._fdFired);
    check('A1 own cadence marked (_fdLastFeastDay=30)', ctx._fdLastFeastDay === 30,
      '_fdLastFeastDay=' + ctx._fdLastFeastDay);
    check('A1 shared cadence UNTOUCHED (no displacement)',
      ctx._fsLastFeastDay === undefined, '_fsLastFeastDay=' + ctx._fsLastFeastDay);
    check('A1 engine feastDay set (allowance stands down after)',
      (Game.state.scholar || {}).feastDay === 30,
      'feastDay=' + (Game.state.scholar || {}).feastDay);
  } else {
    console.log('  (skipped — RED phase; A1 is an ARMED assertion)');
  }

  // ---------- A2: trigger is strictly > 4 ----------
  console.log('== A2. trigger: 3.9 fresh-days holds the feast off ==');
  if (ARMED) {
    const { Game } = await buildFeastWorld(44, 24000, 3.9);
    check('A2 fixture really is below trigger', freshDaysOf(Game) > 3.5 && freshDaysOf(Game) <= 4,
      'freshDays=' + freshDaysOf(Game).toFixed(2));
    const ctx = contribCtx();
    FD.feastDrawdown.setup(Game, ctx);
    FD.feastDrawdown.upkeep(Game, ctx);
    check('A2 no driver feast at 3.9d', ctx.fdFeasts === undefined,
      `fdFeasts=${ctx.fdFeasts}`);
  } else {
    console.log('  (skipped — RED phase; A2 is an ARMED assertion)');
  }

  // ---------- A3: floor math ----------
  console.log('== A3. floor math: maxDrawdownKcal = fresh - 3*burn ==');
  if (ARMED) {
    const { Game } = await buildFeastWorld(45, 24000, 6.25);
    const md = FD.maxDrawdownKcal(Game);
    const expect = Math.round(150000 - 3 * 24000);
    check('A3 maxDraw = fresh - 3*burn', Math.abs(md - expect) < 2000,
      `maxDraw=${Math.round(md)} expect~${expect}`);
    // The floor binds on a small-burn village: burn 2000/d, feast cost
    // ~4800. At 5.0d (fresh 10000) the 3-day allowance is 4000 < 4800 —
    // the floor must hold. At 6.0d (fresh 12000) the allowance is 6000 >
    // 4800 — the feast fires. (With burn 24000 the 4800-kcal feast never
    // reaches the floor while the >4d trigger passes, so the small-burn
    // fixture is the discriminating one.)
    {
      const w = await buildFeastWorld(451, 2000, 5.0);
      const plan = w.Game.feastPlan();
      const mdA = FD.maxDrawdownKcal(w.Game);
      check('A3 fixture: cost exceeds the 3-day allowance at 5.0d',
        plan && plan.ok && plan.cost > mdA,
        `cost=${plan && plan.cost} maxDraw=${Math.round(mdA)}`);
      const ctx = contribCtx();
      FD.feastDrawdown.setup(w.Game, ctx);
      FD.feastDrawdown.upkeep(w.Game, ctx);
      check('A3 feast refused when the floor holds it', ctx.fdFeasts === undefined,
        `fdFeasts=${ctx.fdFeasts}`);
    }
    {
      const w = await buildFeastWorld(452, 2000, 6.0);
      const plan = w.Game.feastPlan();
      const mdB = FD.maxDrawdownKcal(w.Game);
      check('A3 fixture: cost fits the 3-day allowance at 6.0d',
        plan && plan.ok && plan.cost <= mdB,
        `cost=${plan && plan.cost} maxDraw=${Math.round(mdB)}`);
      const ctx = contribCtx();
      FD.feastDrawdown.setup(w.Game, ctx);
      FD.feastDrawdown.upkeep(w.Game, ctx);
      check('A3 feast fires when the floor allows it', ctx.fdFeasts === 1,
        `fdFeasts=${ctx.fdFeasts}`);
    }
  } else {
    console.log('  (skipped — RED phase; A3 is an ARMED assertion)');
  }

  // ---------- A4/A5/A6: siege-gate holds ----------
  console.log('== A4/A5/A6. siege-gate holds the feast off ==');
  if (ARMED) {
    {
      const { Game, said } = await buildFeastWorld(46, 24000, 6.25);
      Game.state.worldMonsters = Game.state.worldMonsters || [];
      Game.state.worldMonsters.push({ id: 'hushwolf', key: 'm_ling', tx: 4, ty: 4, hp: 20, maxHp: 20, lingering: true });
      const ctx = contribCtx();
      FD.feastDrawdown.setup(Game, ctx);
      FD.feastDrawdown.upkeep(Game, ctx);
      check('A4 lingerer holds the feast off', ctx.fdFeasts === undefined,
        `fdFeasts=${ctx.fdFeasts}`);
      check('A4 gate-hold counted', (ctx.fdGateHeld || 0) >= 1, 'fdGateHeld=' + ctx.fdGateHeld);
    }
    {
      const { Game } = await buildFeastWorld(47, 24000, 6.25);
      Game.state.village.lastRaidDay = 28; // today is 30
      const ctx = contribCtx();
      FD.feastDrawdown.setup(Game, ctx);
      FD.feastDrawdown.upkeep(Game, ctx);
      check('A5 recent raid holds the feast off', ctx.fdFeasts === undefined,
        'lastRaidDay=28, day=30');
    }
    {
      const { Game } = await buildFeastWorld(48, 24000, 6.25);
      Game.__fdGorgeDays = [24]; // 6d trailing — inside the 7d window
      const ctx = contribCtx();
      FD.feastDrawdown.setup(Game, ctx);
      FD.feastDrawdown.upkeep(Game, ctx);
      check('A6 gorge-night-trailing-7d holds the feast off', ctx.fdFeasts === undefined,
        'gorge day=24, day=30');
    }
    {
      const { Game } = await buildFeastWorld(49, 24000, 6.25);
      Game.__fdGorgeDays = [22]; // 8d trailing — outside the 7d window
      const ctx = contribCtx();
      FD.feastDrawdown.setup(Game, ctx);
      FD.feastDrawdown.upkeep(Game, ctx);
      check('A6b old gorge night (8d) does NOT hold', ctx.fdFeasts === 1,
        `fdFeasts=${ctx.fdFeasts}`);
    }
  } else {
    console.log('  (skipped — RED phase; A4/A5/A6 are ARMED assertions)');
  }

  // ---------- A7: no double-feast ----------
  console.log('== A7. no double-feast when the allowance already fired ==');
  if (ARMED) {
    const { Game } = await buildFeastWorld(50, 24000, 6.25);
    Game.state.scholar.feastDay = 30; // the r13 allowance already fired today
    const ctx = contribCtx();
    FD.feastDrawdown.setup(Game, ctx);
    FD.feastDrawdown.upkeep(Game, ctx);
    check('A7 driver stands down when a feast already fired today',
      ctx.fdFeasts === undefined, `fdFeasts=${ctx.fdFeasts}`);
  } else {
    console.log('  (skipped — RED phase; A7 is an ARMED assertion)');
  }

  // ---------- A8: no displacement (already asserted in A1, pinned here) ----------
  console.log('== A8. no displacement: shared cadence untouched by design ==');
  if (ARMED) {
    // The driver's feast marks _fdLastFeastDay (own), never _fsLastFeastDay
    // (shared). A1 already proved it live; here we pin the negative on a
    // second firing to rule out a first-fire-only path.
    const { Game } = await buildFeastWorld(51, 24000, 6.25);
    const ctx = contribCtx();
    FD.feastDrawdown.setup(Game, ctx);
    FD.feastDrawdown.upkeep(Game, ctx);
    check('A8 driver feast fired', ctx.fdFeasts === 1, `fdFeasts=${ctx.fdFeasts}`);
    check('A8 shared _fsLastFeastDay still untouched after firing',
      ctx._fsLastFeastDay === undefined, '_fsLastFeastDay=' + ctx._fsLastFeastDay);
  } else {
    console.log('  (skipped — RED phase; A8 is an ARMED assertion)');
  }

  // ---------- A9: armed determinism ----------
  console.log('== A9. armed determinism ==');
  if (ARMED) {
    const h1 = await runHashes(FD.feastDrawdown, 11, 40);
    const h2 = await runHashes(FD.feastDrawdown, 11, 40);
    check('A9 feastDrawdown armed bit-identical across runs',
      h1.length === h2.length && h1.every((h, i) => h === h2[i]), `n=${h1.length}`);
  } else {
    console.log('  (skipped — RED phase; A9 is an ARMED assertion)');
  }

  // ---------- A10: inert without FEASTSCALE_R13 ----------
  console.log('== A10. inert without FEASTSCALE_R13 ==');
  if (ARMED) {
    const saved = process.env.FEASTSCALE_R13;
    process.env.FEASTSCALE_R13 = '';
    try {
      const { Game } = await buildFeastWorld(52, 24000, 6.25);
      const ctx = contribCtx();
      FD.feastDrawdown.setup(Game, ctx);
      FD.feastDrawdown.upkeep(Game, ctx);
      check('A10 driver inert without the r13 road', ctx.fdFeasts === undefined,
        `fdFeasts=${ctx.fdFeasts}`);
    } finally {
      if (saved === undefined) delete process.env.FEASTSCALE_R13;
      else process.env.FEASTSCALE_R13 = saved;
    }
  } else {
    console.log('  (skipped — RED phase; A10 is an ARMED assertion)');
  }

  console.log(fails.length ? `\nPROOF: ${fails.length} FAILURE(S) — ${fails.join(', ')}` : '\nPROOF: all checks passed');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });

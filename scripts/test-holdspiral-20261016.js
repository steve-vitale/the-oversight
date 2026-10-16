#!/usr/bin/env node
// scripts/test-holdspiral-20261016.js — PROOF for the sim-holdspiral-b arm
// (loop B, 2026-10-16, food-economy axis, sim-findings #187 heterogeneity
// note from the allowgate5 confirm).
//
// THE LEVER: scripts/policies/allowgate6.js wraps belonggate2/leadgate2
// (the landed 4-day-floor gate). THE VALVE (ALLOWGATE6=1, default OFF;
// requires FEASTSCALE_R13=1 + ALLOWGATE2=1): after N consecutive
// candidate-only holds (default N=3, ALLOWGATE6_N override) on a
// persistently marginal pantry, suspend the hold and allow the allowance
// feast — the village decides to feast anyway rather than let the feast
// engine strand. Zero src/js changes.
//
// RED PHASE (FEASTSCALE_R13=1 + ALLOWGATE2=1, ALLOWGATE6 unset):
//   R1. valve-off byte-identical: leadgate6/belonggate6 (valve off) ==
//       leadgate2/belonggate2 per-day run hashes, 40d x2 seeds (the
//       det-gate: the layer adds zero trajectory delta when off).
//   R2. valve-off, the strand in miniature: 3 consecutive candidate-only
//       holds on the 3.9d fixture (days 30/31/32) -> ag2GateHeld=3,
//       fsFeasts=0, NO release — the heterogeneity failure mode.
// GREEN PHASE (FEASTSCALE_R13=1 + ALLOWGATE2=1 + ALLOWGATE6=1):
//   G1. the release fires on the Nth consecutive hold: holds 1,2 then
//       day-32 release — fsFeasts=1, ag6Releases=1, ag6Holds reset to 0,
//       cadence marked (_fsLastFeastDay=32), pantry really drawn.
//   G2. the N knob is real (ALLOWGATE6_N=2): release on the 2nd hold.
//   G3. the release feast is a real feast: cadence marked by the release;
//       a same-day second upkeep does not re-fire (no double feast).
//   G4. valve inert without ALLOWGATE2: the allowance fires immediately on
//       the 3.9d fixture (no holds, no releases); textual guard present.
//   G5. valve inert without FEASTSCALE_R13: no holds, no feasts, no releases.
//   G6. armed determinism: identical fixture twice -> identical outcome.
//   G7. the release narrates the decision: a Game.say line with the
//       village's decision ('decides to feast anyway') is emitted, and the
//       release-day context (day, fresh-days, tier) is recorded.
//
// Usage:
//   RED:   FEASTSCALE_R13=1 ALLOWGATE2=1 node scripts/test-holdspiral-20261016.js
//   GREEN: FEASTSCALE_R13=1 ALLOWGATE2=1 ALLOWGATE6=1 node scripts/test-holdspiral-20261016.js
//
// Kill-protocol degradation: if the layer file is deleted post-kill, this
// script degrades to INFO-SKIP (exit 0), never MODULE_NOT_FOUND.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

let AG2, AG6;
try {
  AG2 = require('./policies/allowgate2');
} catch (e) {
  console.log('INFO-SKIP: allowgate2 layer absent (reverted per kill protocol); proof was RED->GREEN pre-decision — see evidence/2026-10-16/sim-holdspiral-b.md');
  process.exit(0);
}
try {
  AG6 = require('./policies/allowgate6');
} catch (e) {
  console.log('INFO-SKIP: allowgate6 layer absent (reverted per kill protocol); proof was RED->GREEN pre-decision — see evidence/2026-10-16/sim-holdspiral-b.md');
  process.exit(0);
}
const FS = require('./policies/feastscale');

const LAYER = process.env.FEASTSCALE_R13 === '1';
const GATE = process.env.ALLOWGATE2 === '1';
const VALVE = process.env.ALLOWGATE6 === '1';
const ARMED = LAYER && GATE && VALVE;
console.log('== holdspiral proof — ' + (ARMED ? 'ARMED (FEASTSCALE_R13=1 + ALLOWGATE2=1 + ALLOWGATE6=1)' : (LAYER && GATE ? 'RED (FEASTSCALE_R13=1 + ALLOWGATE2=1, valve off)' : 'RED (gates off)')) + ' ==');

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

// buildFixture: pantry with `freshTargetDays` of fresh food at `burn`/day
// (the allowgate5 3.9d fixture: sub-floor fresh while total kcal clears the
// engine's 1.5x buffer).
async function buildFixture(seed, freshTargetDays, burn) {
  const { Game } = await loadGame({ seed, mode: 'holdspiral-proof' });
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

// duskUpkeep: run one dusk upkeep on the fixture at the given day.
function duskUpkeep(Game, pol, ctx, day) {
  Game.state.scholar.day = day;
  Game.dayPart = 2;
  pol.upkeep(Game, ctx);
}

async function runHashes(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'holdspiral-red' });
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
  // ---------- R1: valve-off byte-identical vs the gate's products ----------
  console.log('== R1. valve-off byte-identical (leadgate6/belonggate6 vs leadgate2/belonggate2, 40d) ==');
  if (!ARMED) {
    for (const [mine, theirs, label] of [[AG6.leadgate6, AG2.leadgate2, 'lead'], [AG6.belonggate6, AG2.belonggate2, 'belong']]) {
      const seed = label === 'lead' ? 11 : 22;
      const hMine = await runHashes(mine, seed, 40);
      const hTheirs = await runHashes(theirs, seed, 40);
      const same = hMine.length === hTheirs.length && hMine.every((h, i) => h === hTheirs[i]);
      check(`R1 valve-off: ${label}gate6 == ${label}gate2 per-day hashes`, same, `n=${hMine.length}/${hTheirs.length}`);
    }
  } else {
    console.log('  (skipped — armed phase; R1 is a RED assertion)');
  }

  // ---------- R2: valve-off, the strand in miniature ----------
  console.log('== R2. valve-off: 3 consecutive candidate-only holds strand the fixture (the heterogeneity mechanism) ==');
  if (!ARMED) {
    const Game = await buildFixture(52, 3.9, 2400);
    const fd = freshDaysOf(Game);
    check('R2 fixture really is sub-floor fresh (< 4d)', fd > 3 && fd < 4, 'freshDays=' + fd.toFixed(2));
    const ctx = armedCtx();
    const pol = AG6.leadgate6;
    pol.setup(Game, ctx);
    duskUpkeep(Game, pol, ctx, 30);
    duskUpkeep(Game, pol, ctx, 31);
    duskUpkeep(Game, pol, ctx, 32);
    check('R2 three consecutive candidate-only holds counted', (ctx.ag2GateHeld || 0) === 3, `ag2GateHeld=${ctx.ag2GateHeld}`);
    check('R2 the fixture is stranded: zero feasts, valve inert', (ctx.fsFeasts || 0) === 0 && (ctx.ag6Releases || 0) === 0,
      `fsFeasts=${ctx.fsFeasts} ag6Releases=${ctx.ag6Releases}`);
    check('R2 no hold-chain state without the valve', ctx.ag6Holds === undefined, `ag6Holds=${ctx.ag6Holds}`);
    check('R2 cadence never marked (every opening postponed)', ctx._fsLastFeastDay === undefined,
      `_fsLastFeastDay=${ctx._fsLastFeastDay}`);
  } else {
    console.log('  (skipped — armed phase; R2 is a RED assertion)');
  }

  // ---------- G1: the release fires on the Nth consecutive hold ----------
  console.log('== G1. the valve releases on the 3rd consecutive hold ==');
  if (ARMED) {
    const Game = await buildFixture(53, 3.9, 2400);
    check('G1 fixture really is sub-floor fresh (< 4d)', freshDaysOf(Game) > 3 && freshDaysOf(Game) < 4);
    const ctx = armedCtx();
    const pol = AG6.belonggate6;
    pol.setup(Game, ctx);
    duskUpkeep(Game, pol, ctx, 30);
    check('G1 day-30: hold 1, no release yet', (ctx.ag2GateHeld || 0) === 1 && (ctx.ag6Releases || 0) === 0,
      `holds=${ctx.ag2GateHeld} releases=${ctx.ag6Releases} ag6Holds=${ctx.ag6Holds}`);
    duskUpkeep(Game, pol, ctx, 31);
    check('G1 day-31: hold 2, still no release', (ctx.ag2GateHeld || 0) === 2 && (ctx.ag6Releases || 0) === 0,
      `holds=${ctx.ag2GateHeld} releases=${ctx.ag6Releases} ag6Holds=${ctx.ag6Holds}`);
    const before = havenPantryKcal(Game);
    duskUpkeep(Game, pol, ctx, 32);
    check('G1 day-32: hold 3 counted by the gate', (ctx.ag2GateHeld || 0) === 3, `ag2GateHeld=${ctx.ag2GateHeld}`);
    check('G1 the release feast fired', (ctx.fsFeasts || 0) === 1 && (ctx.ag6Releases || 0) === 1,
      `fsFeasts=${ctx.fsFeasts} ag6Releases=${ctx.ag6Releases}`);
    check('G1 the pantry was really drawn by the release', havenPantryKcal(Game) < before,
      `${before} -> ${havenPantryKcal(Game)} kcal`);
    check('G1 cadence marked by the release feast (not postponed)', ctx._fsLastFeastDay === 32,
      `_fsLastFeastDay=${ctx._fsLastFeastDay}`);
    check('G1 the hold chain resets after a release', (ctx.ag6Holds || 0) === 0, `ag6Holds=${ctx.ag6Holds}`);
    check('G1 release-day context recorded', Array.isArray(ctx.ag6ReleaseDays) && ctx.ag6ReleaseDays.length === 1 && ctx.ag6ReleaseDays[0].day === 32,
      JSON.stringify(ctx.ag6ReleaseDays));
  } else {
    console.log('  (skipped — RED phase; G1 is a GREEN assertion)');
  }

  // ---------- G2: the N knob is real ----------
  console.log('== G2. ALLOWGATE6_N=2 releases on the 2nd hold ==');
  if (ARMED) {
    const saved = process.env.ALLOWGATE6_N;
    process.env.ALLOWGATE6_N = '2';
    const Game = await buildFixture(54, 3.9, 2400);
    const ctx = armedCtx();
    AG6.leadgate6.setup(Game, ctx);
    duskUpkeep(Game, AG6.leadgate6, ctx, 30);
    check('G2 N=2: hold 1, no release yet', (ctx.ag2GateHeld || 0) === 1 && (ctx.ag6Releases || 0) === 0);
    duskUpkeep(Game, AG6.leadgate6, ctx, 31);
    check('G2 N=2: the release fires on the 2nd hold', (ctx.fsFeasts || 0) === 1 && (ctx.ag6Releases || 0) === 1,
      `fsFeasts=${ctx.fsFeasts} ag6Releases=${ctx.ag6Releases}`);
    if (saved !== undefined) process.env.ALLOWGATE6_N = saved; else delete process.env.ALLOWGATE6_N;
  } else {
    console.log('  (skipped — RED phase; G2 is a GREEN assertion)');
  }

  // ---------- G3: no double-feast on the release day ----------
  console.log('== G3. the release feast claims the day slot (no double-feast) ==');
  if (ARMED) {
    const Game = await buildFixture(55, 3.9, 2400);
    const ctx = armedCtx();
    AG6.belonggate6.setup(Game, ctx);
    duskUpkeep(Game, AG6.belonggate6, ctx, 30);
    duskUpkeep(Game, AG6.belonggate6, ctx, 31);
    duskUpkeep(Game, AG6.belonggate6, ctx, 32); // release
    const afterRelease = { feasts: ctx.fsFeasts || 0, releases: ctx.ag6Releases || 0 };
    duskUpkeep(Game, AG6.belonggate6, ctx, 32); // second upkeep, same day
    check('G3 one release claims the day slot', afterRelease.feasts === 1 && (ctx.fsFeasts || 0) === 1 && (ctx.ag6Releases || 0) === 1,
      `fsFeasts=${ctx.fsFeasts} ag6Releases=${ctx.ag6Releases} s.feastDay=${(Game.state.scholar || {}).feastDay}`);
  } else {
    console.log('  (skipped — RED phase; G3 is a GREEN assertion)');
  }

  // ---------- G4: valve inert without ALLOWGATE2 ----------
  console.log('== G4. valve inert without ALLOWGATE2 (requires the gate) ==');
  if (ARMED) {
    const saved = process.env.ALLOWGATE2;
    delete process.env.ALLOWGATE2;
    const Game = await buildFixture(56, 3.9, 2400);
    const ctx = armedCtx();
    AG6.leadgate6.setup(Game, ctx);
    duskUpkeep(Game, AG6.leadgate6, ctx, 30);
    check('G4 no gate: the allowance fires immediately (no hold, no valve work)',
      (ctx.fsFeasts || 0) === 1 && (ctx.ag2GateHeld || 0) === 0 && (ctx.ag6Releases || 0) === 0,
      `fsFeasts=${ctx.fsFeasts} ag2GateHeld=${ctx.ag2GateHeld} ag6Releases=${ctx.ag6Releases}`);
    const src = fs.readFileSync(path.join(__dirname, 'policies/allowgate6.js'), 'utf8');
    check('G4 valve sits behind the gate guard', src.indexOf('!AG2.gateOn()') > 0);
    if (saved !== undefined) process.env.ALLOWGATE2 = saved;
  } else {
    console.log('  (skipped — RED phase; G4 is a GREEN assertion)');
  }

  // ---------- G5: valve inert without FEASTSCALE_R13 ----------
  console.log('== G5. valve inert without FEASTSCALE_R13 ==');
  {
    const saved = process.env.FEASTSCALE_R13;
    delete process.env.FEASTSCALE_R13;
    const Game = await buildFixture(57, 3.9, 2400);
    const ctx = armedCtx();
    AG6.belonggate6.setup(Game, ctx);
    duskUpkeep(Game, AG6.belonggate6, ctx, 30);
    duskUpkeep(Game, AG6.belonggate6, ctx, 31);
    check('G5 no holds, no feasts, no releases with the r13 layer off',
      (ctx.ag2GateHeld || 0) === 0 && (ctx.fsFeasts || 0) === 0 && (ctx.ag6Releases || 0) === 0,
      `holds=${ctx.ag2GateHeld} feasts=${ctx.fsFeasts} releases=${ctx.ag6Releases}`);
    const src = fs.readFileSync(path.join(__dirname, 'policies/allowgate6.js'), 'utf8');
    check('G5 valve sits behind the layer guard', src.indexOf('!FS.layerOn()') > 0);
    if (saved !== undefined) process.env.FEASTSCALE_R13 = saved;
  }

  // ---------- G6: armed determinism ----------
  console.log('== G6. armed determinism ==');
  if (ARMED) {
    const run = async (seed) => {
      const Game = await buildFixture(seed, 3.9, 2400);
      const ctx = armedCtx();
      AG6.leadgate6.setup(Game, ctx);
      const before = havenPantryKcal(Game);
      duskUpkeep(Game, AG6.leadgate6, ctx, 30);
      duskUpkeep(Game, AG6.leadgate6, ctx, 31);
      duskUpkeep(Game, AG6.leadgate6, ctx, 32);
      return `${ctx.fsFeasts}|${ctx.ag2GateHeld || 0}|${ctx.ag6Releases || 0}|${before - havenPantryKcal(Game)}|${freshDaysOf(Game).toFixed(3)}`;
    };
    const r1 = await run(58), r2 = await run(58);
    check('G6 identical fixture twice -> identical outcome', r1 === r2, r1);
  } else {
    console.log('  (skipped — RED phase; G6 is a GREEN assertion)');
  }

  // ---------- G7: the release narrates the decision ----------
  console.log('== G7. the release reads as a person deciding ==');
  if (ARMED) {
    const Game = await buildFixture(59, 3.9, 2400);
    const said = [];
    Game.say = function (t) { said.push(String(t)); };
    const ctx = armedCtx();
    AG6.belonggate6.setup(Game, ctx);
    duskUpkeep(Game, AG6.belonggate6, ctx, 30);
    duskUpkeep(Game, AG6.belonggate6, ctx, 31);
    const saidBefore = said.length;
    duskUpkeep(Game, AG6.belonggate6, ctx, 32); // release
    const newLines = said.slice(saidBefore);
    const decisionLine = newLines.find(t => t.indexOf('decides to feast anyway') > 0);
    check('G7 a decision line is said on release', !!decisionLine, decisionLine ? decisionLine.slice(0, 120) + '…' : 'no line');
    check('G7 the decision line is spoken, not counted (names the decider, cites the hold chain)',
      !!decisionLine && decisionLine.indexOf('held dusks in a row') > 0,
      decisionLine ? 'ok' : 'missing');
    check('G7 the release feast beat follows the decision (the feast reads as decided, then eaten)',
      said.length > saidBefore + 1 && /🍖|feast/i.test(newLines[newLines.length - 1]),
      newLines.length + ' new lines, last=' + (newLines[newLines.length - 1] || '').slice(0, 60));
  } else {
    console.log('  (skipped — RED phase; G7 is a GREEN assertion)');
  }

  console.log(fails.length ? `\nPROOF RED — ${fails.length} failure(s): ${fails.join(', ')}` : '\nPROOF GREEN — all checks passed');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });

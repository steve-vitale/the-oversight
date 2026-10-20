#!/usr/bin/env node
// scripts/test-pantryguard-b2.js — proof for the PANTRY-GUARD lever
// (fleshout loop B, 2026-10-20, arm sim-pantryguard-b2).
//
// Pre-registered lever: scripts/policies/pantryguard.js (policy-side, ZERO
// src/js changes), PANTRYGUARD=1 default OFF, requires FEASTSCALE_R13=1.
// Wraps leadfeast/belongfeast. When fragile (fresh-days < 3 OR pantry < 5x
// the 7-day mean burn): (1) donateDeep — donate down to a half-day pack
// buffer; (2) meal discipline — villageMeal draws at most half the normal
// want from the pantry; takeFromPantry deferred; (3) forage-first — the day's
// first work block is a haul trip.
//
// RED (PANTRYGUARD unset): armed policy ≡ base policy, bit-identical outcome
// vectors (the OFF gate is neutral).
// GREEN (PANTRYGUARD=1): the trigger fires, and each of the three behaviors
// is observable: fragile detection, forced haul, halved meal want, deferred
// takes, deep donation.
// SMOKE=1: honesty gate — short live runs proving the layer is LIVE (fragile
// behaviors actually fire on a drained pantry), not silently gated off.
//
// Usage:
//   FEASTSCALE_R13=1 node scripts/test-pantryguard-b2.js            # RED+GREEN
//   FEASTSCALE_R13=1 PANTRYGUARD=1 SMOKE=1 node scripts/test-pantryguard-b2.js  # + SMOKE
'use strict';
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const FS = require('./policies/feastscale');
const PG = require('./policies/pantryguard');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ok   ${name}${detail ? ' — ' + detail : ''}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

const BASE = { leadfeast: FS.leadfeast, belongfeast: FS.belongfeast };
const ARMED = { leadfeast: PG.pglead, belongfeast: PG.pgbelong };

function outKey(o) {
  const dk = Object.keys(o.deaths).sort().map(k => `${k}:${o.deaths[k]}`).join(',');
  return [o.days, o.endReason, o.hungryDays, o.starveDeaths, dk, o.fsFeasts, o.wave].join('|');
}

async function outcomeVector(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: `pgproof-${policy.id}` });
  await setupGame(Game);
  let runCtx = null;
  const pol = Object.assign({}, policy);
  const oSetup = policy.setup;
  pol.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
  let result = null;
  await quietLog(async () => { result = await runDays(Game, pol, { days, manifest: undefined, sampleEvery: 181 }); });
  const deaths = {};
  let starve = 0;
  for (const d of (result.samples.deaths || [])) {
    const k = String(d.cause || d.kind || 'unknown');
    deaths[k] = (deaths[k] || 0) + 1;
    if (/starv/i.test(k)) starve++;
  }
  let hungry = 0;
  try { hungry = (Game.state.village || {}).hungryDays || 0; } catch (e) {}
  return {
    days: result.days, endReason: result.endReason, hungryDays: hungry,
    starveDeaths: starve, deaths, fsFeasts: (runCtx && runCtx.fsFeasts) || 0,
    wave: result.maxWaveUnlocked || 1,
  };
}

// A small cooked pantry that is fragile by the fresh-days leg:
// 2000 fresh kcal / (12 pop * 2000) = 0.08 fresh-days < 3.
function makeFragilePantry(Game) {
  const items = [];
  for (let i = 0; i < 10; i++) {
    items.push({ name: 'Test stew', kcalEach: 200, units: 1, foodState: 'cooked', foodKind: 'meal', edible: true, spoilDay: 99999 });
  }
  Game.state.village.pantry = items;
}

async function main() {
  console.log('PANTRY-GUARD proof — base SHA: ' + require('child_process').execSync('git rev-parse HEAD', { cwd: __dirname }).toString().trim());

  // ---------- RED: PANTRYGUARD unset → armed ≡ base, bit-identical ----------
  console.log('\nRED (PANTRYGUARD unset — the OFF gate must be neutral):');
  delete process.env.PANTRYGUARD;
  check('R0 layer reports off', PG.layerOn() === false);
  for (const pid of ['leadfeast', 'belongfeast']) {
    for (const seed of [4801, 4802]) {
      const a = await outcomeVector(ARMED[pid], seed, 40);
      const b = await outcomeVector(BASE[pid], seed, 40);
      check(`R1 ${pid} s${seed} armed-off ≡ base`, outKey(a) === outKey(b), outKey(a));
    }
  }

  // ---------- GREEN: PANTRYGUARD=1 — the lever is real ----------
  console.log('\nGREEN (PANTRYGUARD=1 — the lever fires):');
  process.env.PANTRYGUARD = '1';
  check('G0 layer reports on', PG.layerOn() === true);

  // G1: the fragile trigger — a well-stocked pantry is not fragile, an
  // emptied pantry is fragile. (Substrate fact, documented: the game-start
  // pantry sits at ~2 fresh-days, so the guard fires from day 1 until the
  // pantry is built — the lever defends thin pantries, including new ones.)
  {
    const { Game } = await loadGame({ seed: 4801, mode: 'pgproof-g1' });
    await setupGame(Game);
    const ctx = {};
    const fd0 = PG.freshDaysNow(Game);
    console.log(`  info G1: game-start freshDays=${fd0} (guard fires from day 1 by the fresh-days leg)`);
    for (let i = 0; i < 40; i++) {
      Game.state.village.pantry.push({ name: 'Test smoked meat', kcalEach: 5000, units: 1, foodState: 'smoked', foodKind: 'meat', edible: true, spoilDay: 99999 });
    }
    check('G1a stocked pantry not fragile', PG.isFragile(Game, ctx) === false, `freshDays=${PG.freshDaysNow(Game)}`);
    Game.state.village.pantry = [];
    check('G1b emptied pantry fragile (fresh-days leg)', PG.isFragile(Game, ctx) === true, `freshDays=${PG.freshDaysNow(Game)}`);
  }

  // G2: live forced-fragile run — the three dawn behaviors fire.
  {
    const { Game } = await loadGame({ seed: 4803, mode: 'pgproof-g2' });
    await setupGame(Game);
    let runCtx = null, drained = false;
    const pol = Object.assign({}, PG.pglead);
    const oSetup = pol.setup, oDaily = pol.daily;
    pol.setup = (G, ctx) => { runCtx = ctx; return oSetup(G, ctx); };
    pol.daily = (G, ctx) => {
      const d = (G.state.scholar || {}).day || 0;
      // Partial drain (to ~10%): absolute zero collapses the village in ~2d
      // (real engine behavior, not the lever) — the guard's trigger needs a
      // thin pantry, not a dead one.
      if (!drained && d >= 1) {
        const p = G.state.village.pantry || [];
        G.state.village.pantry = p.slice(0, Math.max(1, Math.floor(p.length / 10)));
        drained = true;
      }
      return oDaily(G, ctx);
    };
    let result = null;
    await quietLog(async () => { result = await runDays(Game, pol, { days: 4, manifest: undefined, sampleEvery: 181 }); });
    check('G2a fragile days counted', (runCtx.pgFragileDays || 0) >= 1, `pgFragileDays=${runCtx.pgFragileDays || 0}`);
    check('G2b forced haul fired first', (runCtx.pgForcedHaul || 0) >= 1, `pgForcedHaul=${runCtx.pgForcedHaul || 0}`);
    check('G2c run survived the drain', result.days >= 4, `days=${result.days}`);
  }

  // G3: meal discipline — the want at the pantryDraw choke point is halved.
  {
    const mkGame = async (armed) => {
      if (armed) process.env.PANTRYGUARD = '1'; else delete process.env.PANTRYGUARD;
      const { Game } = await loadGame({ seed: 4804, mode: `pgproof-g3-${armed ? 'a' : 'b'}` });
      await setupGame(Game);
      const ctx = {};
      // The want-spy goes on BEFORE setup: the guard's halving wrapper (if
      // installed) calls through the saved pantryDraw ref, so the spy sees
      // the HALVED want on the armed side.
      let wantSeen = null;
      const preDraw = Game.pantryDraw.bind(Game);
      Game.pantryDraw = function (v, want, opts) { wantSeen = want; return preDraw(v, want, opts); };
      const pol = armed ? PG.pglead : FS.leadfeast;
      if (pol.setup) pol.setup(Game, ctx);
      makeFragilePantry(Game);
      Game.state.scholar.kcal = 500; // room for a full share: want = min(share, room)
      const before = PG.pantryKcal(Game);
      Game.villageMeal();
      const taken = before - PG.pantryKcal(Game);
      return { wantSeen, taken, ctx };
    };
    const b = await mkGame(false);
    const a = await mkGame(true);
    process.env.PANTRYGUARD = '1';
    check('G3a control want is the full share', b.wantSeen === 1000, `want=${b.wantSeen}`);
    check('G3b armed want is halved', a.wantSeen === Math.ceil(b.wantSeen / 2), `want=${a.wantSeen} vs ${b.wantSeen}`);
    check('G3c armed takes strictly less', a.taken < b.taken && a.taken > 0, `taken ${a.taken} < ${b.taken}`);
    check('G3d half-meal counted', (a.ctx.pgHalfMeals || 0) === 1, `pgHalfMeals=${a.ctx.pgHalfMeals || 0}`);
  }

  // G4: takeFromPantry deferral while fragile.
  {
    const { Game } = await loadGame({ seed: 4805, mode: 'pgproof-g4' });
    await setupGame(Game);
    const ctx = {};
    PG.pglead.setup(Game, ctx);
    // Stock the pantry first: the game-start pantry is fragile by the
    // fresh-days leg (~2 fresh-days), so delegation needs a built pantry.
    for (let i = 0; i < 40; i++) {
      Game.state.village.pantry.push({ name: 'Test smoked meat', kcalEach: 5000, units: 1, foodState: 'smoked', foodKind: 'meat', edible: true, spoilDay: 99999 });
    }
    const fdFull = PG.isFragile(Game, ctx);
    const pk0 = PG.pantryKcal(Game);
    const r0 = Game.takeFromPantry(0);
    const pk0b = PG.pantryKcal(Game);
    check('G4a stocked pantry: not fragile, take delegates (not deferred)',
      fdFull === false && (ctx.pgDeferredTakes || 0) === 0 && (r0 !== null || pk0b < pk0),
      `fragile=${fdFull} deferred=${ctx.pgDeferredTakes || 0} took=${r0 !== null}`);
    // fragile: takes deferred
    Game.state.village.pantry = [];
    makeFragilePantry(Game); // small fragile pantry with takable items
    const pk1 = PG.pantryKcal(Game);
    const r = Game.takeFromPantry(0);
    check('G4b fragile: take deferred (null)', r === null, `returned ${r}`);
    check('G4c fragile: pantry untouched', PG.pantryKcal(Game) === pk1, `pantry ${pk1} -> ${PG.pantryKcal(Game)}`);
    check('G4d deferral counted', (ctx.pgDeferredTakes || 0) >= 1, `pgDeferredTakes=${ctx.pgDeferredTakes || 0}`);
  }

  // G5: donateDeep — donates down to the half-day buffer.
  {
    const { Game } = await loadGame({ seed: 4806, mode: 'pgproof-g5' });
    await setupGame(Game);
    const ctx = {};
    const s = Game.state.scholar;
    const cap = Game.kcalCap();
    s.inventory = [];
    for (let i = 0; i < 12; i++) s.inventory.push({ name: 'Test jerky', kcalEach: 200, units: 1, edible: true, foodState: 'smoked' });
    const pack0 = s.inventory.reduce((t, it) => t + it.kcalEach * it.units, 0);
    const n = PG.donateDeep(Game, ctx);
    const pack1 = (s.inventory || []).reduce((t, it) => t + (it.kcalEach || 0) * (it.units || 1), 0);
    check('G5a donateDeep donated', n > 0 && pack1 < pack0, `donated ${n} items, pack ${pack0} -> ${pack1}`);
    check('G5b pack kept ≈ half-day buffer', pack1 >= cap * 0.5 - 200 && pack1 < cap * 0.5 + 200, `pack=${pack1}, half-cap=${cap * 0.5}`);
    check('G5c deep donations counted', (ctx.pgDonatedDeep || 0) === n, `pgDonatedDeep=${ctx.pgDonatedDeep || 0}`);
  }

  // G6: armed determinism spot-check — same seed twice, identical vectors.
  {
    const a = await outcomeVector(PG.pglead, 4807, 40);
    const b = await outcomeVector(PG.pglead, 4807, 40);
    check('G6 armed side deterministic (40d)', outKey(a) === outKey(b), outKey(a));
  }

  // ---------- SMOKE=1: honesty gate — the layer is LIVE ----------
  if (process.env.SMOKE === '1') {
    console.log('\nSMOKE=1 (honesty gate — the layer must observably fire):');
    let fired = 0, ran = 0;
    for (const pid of ['leadfeast', 'belongfeast']) {
      for (const seed of [4801, 4802]) {
        const { Game } = await loadGame({ seed, mode: `pgsmoke-${pid}` });
        await setupGame(Game);
        let runCtx = null, drained = false;
        const pol = Object.assign({}, ARMED[pid]);
        const oS = pol.setup, oD = pol.daily;
        pol.setup = (G, ctx) => { runCtx = ctx; return oS(G, ctx); };
        pol.daily = (G, ctx) => {
          const d = (G.state.scholar || {}).day || 0;
          if (!drained && d >= 6) {
            const p = G.state.village.pantry || [];
            G.state.village.pantry = p.slice(0, Math.max(1, Math.floor(p.length / 10)));
            drained = true;
          }
          return oD(G, ctx);
        };
        let result = null;
        await quietLog(async () => { result = await runDays(Game, pol, { days: 12, manifest: undefined, sampleEvery: 181 }); });
        ran++;
        const ok = (runCtx.pgFragileDays || 0) >= 1 && (runCtx.pgForcedHaul || 0) >= 1 && result.days >= 12;
        if (ok) fired++;
        check(`SMOKE ${pid} s${seed} layer live`, ok,
          `fragile=${runCtx.pgFragileDays || 0} forcedHaul=${runCtx.pgForcedHaul || 0} deep=${runCtx.pgDonatedDeep || 0} halfMeals=${runCtx.pgHalfMeals || 0} deferred=${runCtx.pgDeferredTakes || 0} days=${result.days}`);
      }
    }
    check('SMOKE all runs fired the layer', fired === ran, `${fired}/${ran}`);
  }

  console.log(`\n${pass} passed, ${fail} failed.`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });

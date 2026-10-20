#!/usr/bin/env node
// scripts/test-inflowguard-b.js — proof for the INFLOW-GUARD lever
// (fleshout loop B, 2026-10-20, arm sim-inflowguard-b).
//
// The named next of the KILLED sim-pantryguard-b2 arm: scholar-exempt,
// inflow-only. Pre-registered lever: scripts/policies/inflowguard.js
// (policy-side, ZERO src/js changes), INFLOWGUARD=1 default OFF, requires
// FEASTSCALE_R13=1. Wraps leadfeast/belongfeast. When fragile (fresh-days < 3
// OR pantry < 5x the 7-day mean burn): (1) forage-first — the day's first
// work block is a haul trip; (2) donate-deep — walk into the hall and donate
// edible pack items down to a half-day pack buffer, after the parent's
// sortHaul. NO take deferral, NO meal halving — the scholar eats normally.
//
// RED (INFLOWGUARD unset): armed policy ≡ base policy, bit-identical outcome
// vectors (the OFF gate is neutral).
// GREEN (INFLOWGUARD=1): the trigger fires, and each behavior is observable:
// fragile detection, forced haul, deep donation — AND the scholar-exempt
// guarantee: meal want NOT halved, takes NOT deferred.
// SMOKE=1: honesty gate — short live runs proving the layer is LIVE (fragile
// behaviors actually fire on a drained pantry), not silently gated off.
//
// Usage:
//   FEASTSCALE_R13=1 node scripts/test-inflowguard-b.js            # RED+GREEN
//   FEASTSCALE_R13=1 INFLOWGUARD=1 SMOKE=1 node scripts/test-inflowguard-b.js  # + SMOKE
'use strict';
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const FS = require('./policies/feastscale');
const IG = require('./policies/inflowguard');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ok   ${name}${detail ? ' — ' + detail : ''}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

const BASE = { leadfeast: FS.leadfeast, belongfeast: FS.belongfeast };
const ARMED = { leadfeast: IG.iglead, belongfeast: IG.igbelong };

function outKey(o) {
  const dk = Object.keys(o.deaths).sort().map(k => `${k}:${o.deaths[k]}`).join(',');
  return [o.days, o.endReason, o.hungryDays, o.starveDeaths, dk, o.fsFeasts, o.wave].join('|');
}

async function outcomeVector(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: `igproof-${policy.id}` });
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

// A small pantry that is fragile by the fresh-days leg:
// 2000 kcal / (12 pop * 2000) = 0.08 fresh-days < 3.
function makeFragilePantry(Game) {
  const items = [];
  for (let i = 0; i < 10; i++) {
    items.push({ name: 'Test stew', kcalEach: 200, units: 1, foodState: 'cooked', foodKind: 'meal', edible: true, spoilDay: 99999 });
  }
  Game.state.village.pantry = items;
}

async function main() {
  console.log('INFLOW-GUARD proof — base SHA: ' + require('child_process').execSync('git rev-parse HEAD', { cwd: __dirname }).toString().trim());

  // ---------- RED: INFLOWGUARD unset → armed ≡ base, bit-identical ----------
  console.log('\nRED (INFLOWGUARD unset — the OFF gate must be neutral):');
  delete process.env.INFLOWGUARD;
  check('R0 layer reports off', IG.layerOn() === false);
  for (const pid of ['leadfeast', 'belongfeast']) {
    for (const seed of [4901, 4902]) {
      const a = await outcomeVector(ARMED[pid], seed, 40);
      const b = await outcomeVector(BASE[pid], seed, 40);
      check(`R1 ${pid} s${seed} armed-off ≡ base`, outKey(a) === outKey(b), outKey(a));
    }
  }

  // ---------- GREEN: INFLOWGUARD=1 — the lever is real ----------
  console.log('\nGREEN (INFLOWGUARD=1 — the lever fires):');
  process.env.INFLOWGUARD = '1';
  check('G0 layer reports on', IG.layerOn() === true);

  // G0b: loud STOP when the substrate flag is wrong.
  {
    let threw = false;
    delete process.env.FEASTSCALE_R13;
    try {
      const { Game } = await loadGame({ seed: 4901, mode: 'igproof-g0b' });
      await setupGame(Game);
      IG.iglead.daily(Game, {});
    } catch (e) { threw = /INFLOWGUARD STOP/.test(String(e && e.message)); }
    process.env.FEASTSCALE_R13 = '1';
    check('G0b INFLOWGUARD=1 without FEASTSCALE_R13=1 throws loud', threw);
  }

  // G1: the fragile trigger — a well-stocked pantry is not fragile, an
  // emptied pantry is fragile by the fresh-days leg.
  {
    const { Game } = await loadGame({ seed: 4901, mode: 'igproof-g1' });
    await setupGame(Game);
    const ctx = {};
    for (let i = 0; i < 40; i++) {
      Game.state.village.pantry.push({ name: 'Test smoked meat', kcalEach: 5000, units: 1, foodState: 'smoked', foodKind: 'meat', edible: true, spoilDay: 99999 });
    }
    check('G1a stocked pantry not fragile', IG.isFragile(Game, ctx) === false, `freshDays=${IG.freshDaysNow(Game).toFixed(1)}`);
    Game.state.village.pantry = [];
    check('G1b emptied pantry fragile (fresh-days leg)', IG.isFragile(Game, ctx) === true, `freshDays=${IG.freshDaysNow(Game).toFixed(2)}`);
  }

  // G1c: the burn leg — a steadily draining pantry trips the 5x-burn rule
  // even when fresh-days are fine.
  {
    const { Game } = await loadGame({ seed: 4902, mode: 'igproof-g1c' });
    await setupGame(Game);
    const ctx = {};
    // 100 fresh-days of pantry; drain 45k kcal/day for 5 days — burn = 45k,
    // pantry ends at ~23k < 5x45k = 225k, so the burn leg fires.
    for (let i = 0; i < 40; i++) {
      Game.state.village.pantry.push({ name: 'Test smoked meat', kcalEach: 5000, units: 1, foodState: 'smoked', foodKind: 'meat', edible: true, spoilDay: 99999 });
    }
    const fd = IG.freshDaysNow(Game);
    check('G1c setup: fresh-days leg does not fire', fd >= 3, `freshDays=${fd.toFixed(1)}`);
    let p = pantryNow(Game);
    for (let d = 0; d < 5; d++) {
      IG.snapshotDawn(Game, ctx);
      p = pantryNow(Game);
      Game.state.village.pantry = shrinkPantry(Game, p - 45000);
    }
    IG.snapshotDawn(Game, ctx);
    check('G1d burn leg fires on a steadily draining pantry', IG.isFragile(Game, ctx) === true,
      `pantry=${pantryNow(Game)} freshDays=${IG.freshDaysNow(Game).toFixed(1)}`);
  }

  // G2: live forced-fragile run — forage-first fires on fragile dawns.
  {
    const { Game } = await loadGame({ seed: 4903, mode: 'igproof-g2' });
    await setupGame(Game);
    let runCtx = null, drained = false;
    const pol = Object.assign({}, IG.iglead);
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
    check('G2a fragile days counted', (runCtx.igFragileDays || 0) >= 1, `igFragileDays=${runCtx.igFragileDays || 0}`);
    check('G2b forced haul fired first', (runCtx.igForcedHaul || 0) >= 1, `igForcedHaul=${runCtx.igForcedHaul || 0}`);
    check('G2c run survived the drain', result.days >= 4, `days=${result.days}`);
  }

  // G3: THE SCHOLAR-EXEMPT GUARANTEE — the defining difference from
  // pantryguard-b2. Meal want NOT halved; takes NOT deferred.
  {
    const mkGame = async (armed) => {
      if (armed) process.env.INFLOWGUARD = '1'; else delete process.env.INFLOWGUARD;
      const { Game } = await loadGame({ seed: 4904, mode: `igproof-g3-${armed ? 'a' : 'b'}` });
      await setupGame(Game);
      const ctx = {};
      // The want-spy goes on BEFORE setup: if the guard halved wants (it
      // must NOT), the spy would see it.
      let wantSeen = null;
      const preDraw = Game.pantryDraw.bind(Game);
      Game.pantryDraw = function (v, want, opts) { wantSeen = want; return preDraw(v, want, opts); };
      const pol = armed ? IG.iglead : FS.leadfeast;
      if (pol.setup) pol.setup(Game, ctx);
      makeFragilePantry(Game); // fragile: pantryguard halved here; we must not
      Game.state.scholar.kcal = 500; // room for a full share: want = min(share, room)
      const before = IG.pantryKcal(Game);
      Game.villageMeal();
      const taken = before - IG.pantryKcal(Game);
      // takeFromPantry while fragile: must DELEGATE (not deferred-null).
      // The engine's take is itself hall-gated ("The pantry is in the hall.
      // Your hands are not."), so walk in first — the layer adds no gate.
      // NOTE: the engine's takeFromPantry returns null even on SUCCESS
      // (game.js: "Took X." then `return null`), so delegation is proved by
      // the pantry losing the item, not by the return value.
      putScholarAtHaven(Game);
      try { Game.enterBuilding(); } catch (e) {}
      const plen0 = (Game.state.village.pantry || []).length;
      Game.takeFromPantry(0);
      const plen1 = (Game.state.village.pantry || []).length;
      return { wantSeen, taken, delegated: plen1 === plen0 - 1, pantryAfter: IG.pantryKcal(Game), before };
    };
    const b = await mkGame(false);
    const a = await mkGame(true);
    process.env.INFLOWGUARD = '1';
    check('G3a control want is the full share', b.wantSeen === 1000, `want=${b.wantSeen}`);
    check('G3b armed want is NOT halved (scholar-exempt)', a.wantSeen === b.wantSeen, `armed want=${a.wantSeen} vs control ${b.wantSeen}`);
    check('G3c armed takes the full share', a.taken === b.taken && a.taken > 0, `armed taken=${a.taken} vs control ${b.taken}`);
    check('G3d fragile takeFromPantry delegates (not deferred)', a.delegated === true && b.delegated === true,
      `armed delegated=${a.delegated} control delegated=${b.delegated}`);
  }

  // G4: donateDeep — walks into the hall, donates down to the half-day buffer.
  // (donateToPantry is hall-gated by the engine, so the test teleports the
  // scholar to the haven node first — enterBuilding refuses from the wild.)
  {
    const { Game } = await loadGame({ seed: 4905, mode: 'igproof-g4' });
    await setupGame(Game);
    putScholarAtHaven(Game);
    const ctx = {};
    const s = Game.state.scholar;
    const cap = Game.kcalCap();
    s.inventory = [];
    for (let i = 0; i < 12; i++) s.inventory.push({ name: 'Test jerky', kcalEach: 200, units: 1, edible: true, foodState: 'smoked' });
    const pack0 = s.inventory.reduce((t, it) => t + it.kcalEach * it.units, 0);
    const n = IG.donateDeep(Game, ctx);
    const pack1 = (s.inventory || []).reduce((t, it) => t + (it.kcalEach || 0) * (it.units || 1), 0);
    check('G4a donateDeep donated', n > 0 && pack1 < pack0, `donated ${n} items, pack ${pack0} -> ${pack1}`);
    check('G4b pack kept ≈ half-day buffer', pack1 >= cap * 0.5 - 200 && pack1 <= cap * 0.5 + 200, `pack=${pack1}, half-cap=${cap * 0.5}`);
    check('G4c deep donations counted', (ctx.igDonatedDeep || 0) === n, `igDonatedDeep=${ctx.igDonatedDeep || 0}`);
  }

  // G5: armed determinism spot-check — same seed twice, identical vectors.
  {
    const a = await outcomeVector(IG.iglead, 4906, 40);
    const b = await outcomeVector(IG.iglead, 4906, 40);
    check('G5 armed side deterministic (40d)', outKey(a) === outKey(b), outKey(a));
  }

  // ---------- SMOKE=1: honesty gate — the layer is LIVE ----------
  if (process.env.SMOKE === '1') {
    console.log('\nSMOKE=1 (honesty gate — the layer must observably fire):');
    let fired = 0, ran = 0;
    for (const pid of ['leadfeast', 'belongfeast']) {
      for (const seed of [4901, 4902]) {
        const { Game } = await loadGame({ seed, mode: `igsmoke-${pid}` });
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
        // The layer is LIVE when fragile days are counted and forced hauls
        // fire. Deep donation binding depends on pack surplus at end of day
        // (the scholar eats from the haul first) — reported, not gated:
        // hallWalks proves the donate-deep code path ran.
        const ok = (runCtx.igFragileDays || 0) >= 1 && (runCtx.igForcedHaul || 0) >= 1 && result.days >= 12;
        if (ok) fired++;
        check(`SMOKE ${pid} s${seed} layer live`, ok,
          `fragile=${runCtx.igFragileDays || 0} forcedHaul=${runCtx.igForcedHaul || 0} hallWalks=${runCtx.igHallWalks || 0} deep=${runCtx.igDonatedDeep || 0} days=${result.days}`);
      }
    }
    check('SMOKE all runs fired the layer', fired === ran, `${fired}/${ran}`);
  }

  console.log(`\n${pass} passed, ${fail} failed.`);
  process.exit(fail ? 1 : 0);
}

function pantryNow(Game) {
  return ((Game.state.village || {}).pantry || [])
    .reduce((t, i) => t + ((i && i.kcalEach > 0) ? i.kcalEach * (i.units || 1) : 0), 0);
}
// putScholarAtHaven: test-only teleport so the hall-gated engine verbs
// (enterBuilding/takeFromPantry/donateToPantry) work in direct-call tests.
// enterBuilding refuses anywhere but the haven node (game.js 11143+), and
// takeFromPantry/donateToPantry refuse remote hands (havenStoresAccess).
function putScholarAtHaven(Game) {
  try {
    const v = Game.state.village || {};
    const hx = v.px ?? 4, hy = v.py ?? 4;
    if (Game.map) { Game.map.px = hx; Game.map.py = hy; }
  } catch (e) {}
}
// shrinkPantry: drop items from the end until total <= target (partial drain).
function shrinkPantry(Game, target) {
  const p = ((Game.state.village || {}).pantry || []).slice();
  let total = p.reduce((t, i) => t + ((i && i.kcalEach > 0) ? i.kcalEach * (i.units || 1) : 0), 0);
  while (p.length && total > target) {
    const it = p.pop();
    total -= ((it && it.kcalEach > 0) ? it.kcalEach * (it.units || 1) : 0);
  }
  Game.state.village.pantry = p;
  return p;
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });

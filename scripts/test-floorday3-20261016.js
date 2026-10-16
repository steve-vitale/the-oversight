#!/usr/bin/env node
// scripts/test-floorday3-20261016.js — PROOF for the FLOORDAY3 arm
// (loop B, 2026-10-16, food-economy axis — finding #200 named next).
//
// The killed overdraw4's 2-day drawdown floor (maxDrawdownKcal = fresh -
// 2*burn) is the #200 starvation suspect. This arm rebuilds that layer
// verb-verbatim (scripts/policies/floorday3.js) with ONLY the floor
// constant gated: FLOORDAY3 unset (default) = 2-day floor; FLOORDAY3=1 =
// 3-day floor. Same code runs both sweep sides; the env var selects the
// floor. floorDaysN() reads process.env LIVE, so one process proves both
// sides and their difference.
//
// RED (FLOORDAY3 unset): the 2-day floor — the old exposure.
//   R1. floor formula purity: maxDrawdownKcal == fresh - 2*burn, exact.
//   R2. behavioral: a feast whose cost sits between the floors FIRES
//       (candidacy non-null + upkeep integration both).
// GREEN (FLOORDAY3=1): the 3-day floor.
//   R3. floor formula purity: maxDrawdownKcal == fresh - 3*burn, exact;
//       md(2day) - md(3day) == exactly one day's burn.
//   R4. behavioral: the same deep feast is HELD at the 3-day floor.
// BOTH SIDES:
//   R5. normal-cost feast (below the 3-day floor) fires both sides —
//       the floor is a ceiling, not a ban.
//   R6. aid verb IDENTICAL both sides (the aid's 1500 floor cannot
//       discriminate above the overstock trigger — the floor change's
//       blast radius is the feast only).
//   R7. siege gate holds all verbs off, both sides.
//   R8. tribute timing untouched — the layer never pays tribute (negative
//       assertion, static + behavioral).
// DET-GATE: 2 seeds x 2 sides, 40d, byte-identical per-day hashes on rerun
//   (r27 rule — the sweep's control side is pinned).
// SMOKE: layer-live markers honest on both sides.
//
// Policy-side only: no src/js changes.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-floorday3-20261016.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
let FD3 = null;
try { FD3 = require('./policies/floorday3'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: floorday3 layer deleted per kill protocol (invisible effect, 2026-10-16)');
    process.exit(0);
  }
  throw e;
}
const { leadfeast, belongfeast } = require('./policies/feastscale');

const fails = [];
function check(name, cond, detail) {
  const ok = !!cond;
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails.push(name);
}

function freshItem(Game, name, kcal, daysLeft) {
  const day = (Game.state.scholar || {}).day || 1;
  return { name, kcalEach: 500, units: Math.ceil(kcal / 500), safe: true, spoilDay: day + daysLeft };
}

function addThinSubLink(Game) {
  Game.state.otherVillages = (Game.state.otherVillages || []).concat([
    { id: 'thinval', name: 'Thinvale', pantryKcal: 1000, population: 10, day: 0, roster: [] },
  ]);
  const m = Game.mshipState();
  m.links = m.links || [];
  m.links.push({
    id: 'link_thin', primary: 'haven', subordinate: 'thinval',
    day: 0, trust: 30, status: 'active', tributeKcalPerWeek: 4000,
    tributePaidKcal: 0, tributeWeek: -1, tributePaidWeek: -1,
    arrears: 0, history: [], mourningUntil: 0,
  });
  return m.links[m.links.length - 1];
}

function addOwedTributeLink(Game) {
  Game.state.otherVillages = (Game.state.otherVillages || []).concat([
    { id: 'bigkeep', name: 'Bigkeep', pantryKcal: 50000, population: 20, day: 0, roster: [] },
  ]);
  const m = Game.mshipState();
  m.links = m.links || [];
  m.links.push({
    id: 'link_owed', primary: 'bigkeep', subordinate: 'haven',
    day: 0, trust: 50, status: 'active', tributeKcalPerWeek: 4000,
    tributePaidKcal: 0, tributeWeek: -1, tributePaidWeek: -1,
    arrears: 0, history: [], mourningUntil: 0,
  });
  return m.links[m.links.length - 1];
}

async function buildOverstockWorld(seed) {
  const { Game } = await loadGame({ seed, mode: 'floorday3-proof' });
  await setupGame(Game);
  const said = [];
  Game.say = (t) => { said.push(String(t)); };
  Game.feedback = function () {};
  Game.state.scholar.day = 30;
  const v = Game.state.village;
  v.burnHistory = [24000, 23500, 24200, 23800, 24100, 23900, 24000];
  v.pantry = [freshItem(Game, 'Foraged food', 150000, 3)]; // 6.25 fresh-days
  v.lastRaidDay = 0;
  addThinSubLink(Game);
  return { Game, said };
}

function freshDaysOf(Game) { try { return Game.pantryFreshDays(); } catch (e) { return -1; } }
function havenPantryKcal(Game) {
  return ((Game.state.village || {}).pantry || [])
    .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
}

// a feast plan with a chosen cost, built on the engine's real plan.
// IMPORTANT: capture the real plan BEFORE patching (the patched version
// must not call itself).
function feastFixture(Game, ctx, cost) {
  Game.mshipState().links = [];
  Game.dayPart = 2; // dusk
  const day = Game.state.scholar.day;
  ctx._fsLastFeastDay = day; // block the base's own feast: the layer's verb alone is measured
  ctx._tribHist = [{ day: day - 1, kcal: 2000 }];
  const realPlan = Game.feastPlan();
  const fake = Object.assign({}, realPlan, { ok: true, cost, have: cost * 2 });
  Game.feastPlan = function () { return fake; };
}

async function runHashes(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'floorday3-det' });
  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, policy);
  const base = policy.daily;
  wrapped.daily = (G, ctx) => {
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    return base ? base(G, ctx) : undefined;
  };
  await quietLog(async () => { await runDays(Game, wrapped, { days, sampleEvery: 1 }); });
  return hashes;
}

function setSide(side) {
  if (side === '3day') process.env.FLOORDAY3 = '1';
  else delete process.env.FLOORDAY3;
  return FD3.floorDaysN();
}

(async () => {
  console.log('== floorday3 proof — RED(2-day, FLOORDAY3 unset) + GREEN(3-day, FLOORDAY3=1) ==');

  // ---------- R1/R3: floor formula purity, both env values, one process ----------
  console.log('== R1/R3. floor formula purity (one process, live env toggle) ==');
  {
    const { Game } = await buildOverstockWorld(42);
    const fresh = 150000, burn = FD3.burnAt(Game);
    setSide('2day');
    const md2 = FD3.maxDrawdownKcal(Game);
    check('R1 (2-day): maxDrawdownKcal == fresh - 2*burn exact',
      md2 === Math.round(fresh - 2 * burn), `md2=${md2} expect=${Math.round(fresh - 2 * burn)}`);
    check('R1: floorDaysN() reads 2 with FLOORDAY3 unset', FD3.floorDaysN() === 2);
    setSide('3day');
    const md3 = FD3.maxDrawdownKcal(Game);
    check('R3 (3-day): maxDrawdownKcal == fresh - 3*burn exact',
      md3 === Math.round(fresh - 3 * burn), `md3=${md3} expect=${Math.round(fresh - 3 * burn)}`);
    check('R3: floorDaysN() reads 3 with FLOORDAY3=1', FD3.floorDaysN() === 3);
    check('R3: md(2day) - md(3day) == exactly one day of burn',
      Math.abs((md2 - md3) - burn) < 1, `delta=${md2 - md3} burn=${burn.toFixed(1)}`);
  }

  // ---------- R2/R4: behavioral RED->GREEN on the deep feast ----------
  console.log('== R2/R4. deep feast between the floors: 2-day FIRES, 3-day HOLDS ==');
  {
    // unit-level: feastCandidacy under both env values
    for (const side of ['2day', '3day']) {
      const { Game } = await buildOverstockWorld(43);
      setSide('2day'); const md2 = FD3.maxDrawdownKcal(Game);
      setSide('3day'); const md3 = FD3.maxDrawdownKcal(Game);
      setSide(side);
      const cost = Math.round((md2 + md3) / 2); // midpoint of the 2-day-only window
      const between = cost <= md2 && cost > md3;
      const ctx = {};
      FD3.floorday3lead.setup(Game, ctx);
      feastFixture(Game, ctx, cost);
      const cand = FD3.feastCandidacy(Game, ctx);
      const fired = !!cand;
      check(`R2/R4 (${side}): deep feast cost inside the 2-day-only window`,
        between, `cost=${cost} md2=${Math.round(md2)} md3=${Math.round(md3)}`);
      check(`R2/R4 (${side}): candidacy ${side === '2day' ? 'FIRES (old exposure)' : 'HELD (floor bites)'}`,
        fired === (side === '2day'), `candidacy=${fired ? 'plan' : 'null'}`);
    }
    // integration: full upkeep, layer verb alone (scaleFeast clock blocked)
    for (const side of ['2day', '3day']) {
      const { Game } = await buildOverstockWorld(44);
      setSide('2day'); const md2 = FD3.maxDrawdownKcal(Game);
      setSide('3day'); const md3 = FD3.maxDrawdownKcal(Game);
      setSide(side);
      const cost = Math.round((md2 + md3) / 2); // midpoint of the window
      const ctx = {};
      const pol = FD3.floorday3lead;
      pol.setup(Game, ctx);
      feastFixture(Game, ctx, cost);
      const before = havenPantryKcal(Game);
      await quietLog(async () => { pol.upkeep(Game, ctx); });
      const fired = ctx.fd3Feasts === 1;
      check(`R2/R4 upkeep (${side}): ${side === '2day' ? 'feast fired, pantry drawn' : 'feast held, pantry untouched'}`,
        fired === (side === '2day'),
        `fd3Feasts=${ctx.fd3Feasts} pantry ${before}->${havenPantryKcal(Game)}`);
      if (side === '2day') {
        check('R2: floor drained TO ~2 fresh-days (the exposure)', freshDaysOf(Game) >= 1.9 && freshDaysOf(Game) < 3.1,
          'fdAfter=' + freshDaysOf(Game).toFixed(2));
      }
    }
  }

  // ---------- R5: normal feast fires both sides ----------
  console.log('== R5. normal-cost feast (below the 3-day floor) fires on BOTH sides ==');
  // cost reference: below the 3-day floor on the same fixture, for both sides
  const { Game: gRef } = await buildOverstockWorld(45);
  setSide('3day');
  const md3ref = FD3.maxDrawdownKcal(gRef);
  const normalCost = Math.round(md3ref - 20000);
  for (const side of ['2day', '3day']) {
    const { Game } = await buildOverstockWorld(45);
    setSide(side);
    const ctx = {};
    const pol = FD3.floorday3lead;
    pol.setup(Game, ctx);
    feastFixture(Game, ctx, normalCost);
    await quietLog(async () => { pol.upkeep(Game, ctx); });
    check(`R5 (${side}): normal feast fires (floor is a ceiling, not a ban)`,
      ctx.fd3Feasts === 1, `fd3Feasts=${ctx.fd3Feasts} cost=${normalCost} md3ref=${Math.round(md3ref)}`);
  }

  // ---------- R6: aid verb identical both sides ----------
  console.log('== R6. aid verb IDENTICAL both sides (the floor cannot discriminate the aid) ==');
  for (const side of ['2day', '3day']) {
    const { Game, said } = await buildOverstockWorld(46);
    setSide(side);
    const md = FD3.maxDrawdownKcal(Game);
    const ctx = {};
    const pol = FD3.floorday3lead;
    pol.setup(Game, ctx);
    const subBefore = (Game.state.otherVillages.find(v => v.id === 'thinval') || {}).pantryKcal;
    await quietLog(async () => { pol.daily(Game, ctx); });
    const subAfter = (Game.state.otherVillages.find(v => v.id === 'thinval') || {}).pantryKcal;
    check(`R6 (${side}): aid fires (md=${Math.round(md)} >= 1500, overstock trigger passed)`,
      ctx.fd3Aid === 1 && subAfter > subBefore,
      `fd3Aid=${ctx.fd3Aid} sub ${subBefore}->${subAfter}`);
    check(`R6 (${side}): cause line after the confirmed verb`,
      said.some(s => /not the rot/.test(s)));
  }

  // ---------- R7: siege gate holds both sides ----------
  console.log('== R7. siege gate holds all verbs off, both sides ==');
  for (const side of ['2day', '3day']) {
    const { Game } = await buildOverstockWorld(47);
    setSide(side);
    Game.state.village.lastRaidDay = Game.state.scholar.day; // raid yesterday
    const ctx = {};
    const pol = FD3.floorday3lead;
    pol.setup(Game, ctx);
    Game.dayPart = 2;
    await quietLog(async () => { pol.daily(Game, ctx); });
    await quietLog(async () => { pol.upkeep(Game, ctx); });
    check(`R7 (${side}): verbs held on recent raid`,
      ctx.fd3Aid === undefined && ctx.fd3Feasts === undefined && (ctx.fd3GateHeld || 0) > 0,
      `aid=${ctx.fd3Aid} feasts=${ctx.fd3Feasts} gateHeld=${ctx.fd3GateHeld}`);
  }

  // ---------- R8: tribute untouched ----------
  console.log('== R8. tribute timing untouched — the layer never pays tribute ==');
  {
    const src = require('fs').readFileSync(__dirname + '/policies/floorday3.js', 'utf8');
    const calls = (src.match(/[^.]payTribute\(/g) || []).length;
    check('R8 static: no direct payTribute call in the layer (wrapper restores only)', calls === 0, `calls=${calls}`);
    for (const side of ['2day', '3day']) {
      const { Game, said } = await buildOverstockWorld(48);
      setSide(side);
      addOwedTributeLink(Game);
      const ctx = {};
      const pol = FD3.floorday3belong;
      pol.setup(Game, ctx);
      await quietLog(async () => { pol.daily(Game, ctx); });
      check(`R8 (${side}): no layer tribute verb exists (fd3Tribute never set)`,
        ctx.fd3Tribute === undefined, `fd3Tribute=${ctx.fd3Tribute}`);
      check(`R8 (${side}): no early-tribute cause line`,
        !said.some(s => /while the grain is still good|Tribute paid early/i.test(s)));
    }
  }

  // ---------- DET-GATE: byte-identical reruns both sides ----------
  console.log('== DET-GATE. 2 seeds x 2 sides, 40d, byte-identical per-day hashes ==');
  for (const side of ['2day', '3day']) {
    setSide(side);
    for (const seed of [11, 22]) {
      const h1 = await runHashes(FD3.floorday3lead, seed, 40);
      const h2 = await runHashes(FD3.floorday3lead, seed, 40);
      const same = h1.length === h2.length && h1.every((h, i) => h === h2[i]);
      check(`det-gate (${side}, seed ${seed}): rerun byte-identical`, same, `n=${h1.length}/${h2.length}`);
    }
  }

  // ---------- SMOKE: layer-live markers ----------
  console.log('== SMOKE. layer-live markers honest both sides ==');
  for (const side of ['2day', '3day']) {
    setSide(side);
    const { Game } = await loadGame({ seed: 201, mode: 'floorday3-smoke' });
    await setupGame(Game);
    const base = FD3.floorday3lead;
    let runCtx = null;
    const pol = Object.assign({}, base);
    const oSetup = base.setup;
    pol.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
    await quietLog(async () => { await runDays(Game, pol, { days: 15, sampleEvery: 30 }); });
    check(`SMOKE (${side}): policy id`, base.id === 'floorday3lead', base.id);
    check(`SMOKE (${side}): feast-event log exists (layer ran)`,
      !!(runCtx && Array.isArray(runCtx._fd3FeastEvents)));
    check(`SMOKE (${side}): floorDaysN honest`, FD3.floorDaysN() === (side === '3day' ? 3 : 2));
  }
  delete process.env.FLOORDAY3;

  console.log(fails.length ? `\nPROOF FAILED: ${fails.join(', ')}` : '\nPROOF GREEN: all checks passed.');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e && e.stack || e); process.exit(2); });

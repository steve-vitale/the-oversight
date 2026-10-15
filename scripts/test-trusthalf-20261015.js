#!/usr/bin/env node
// test-trusthalf-20261015.js — proof for the loop-B ARM 2 trusthalf layer
// (food-economy #272/#157, 2026-10-15). Real RED -> GREEN on a live Game.
//
// RED (gate off): hungry scholar + stocked pantry + empty pack ->
//   base.upkeep does the natural pattern (takeFromPantry calls fire).
// NON-AGGRESSION (gate off byte-identical): raw base vs wrapped policy
//   (TRUSTHALF unset), 20 days, same seed -> identical day hashes.
// GREEN (gate on): at haven -> voluntary takeFromPantry calls are REFUSED
//   (real takes == 0), the refused counter climbs, pack food still gets eaten
//   (Game.eat works), the hatch does NOT fire while a meal is coming.
// HATCH (gate on): hungry scholar + empty pack + at the hall + no meal coming
//   (estranged at the old fire) -> a REAL take fires through the honest path
//   (pantry loses kcal, scholar gains it), hatchTakes == 1, the break is
//   narrated (never silent).
// PASS-THROUGH (gate on): away from the hall (physically impossible) -> the
//   call reaches the original verb, the ENGINE's own refusal speaks.
// MEAL UNTOUCHED (gate on): at haven, Game.villageMeal() still fires, feeds
//   the scholar, writes v.takes — the policy never declines the meal.
// NO PREFILL (gate on): a fed scholar attempts nothing.
// GUARANTEE (gate on): pack thinner than one day's need -> exactly one
//   banking forage trip per daily (guaranteeTrips), none when the pack is
//   banked to the floor, none when the scholar is too hurt (skipped count).
//
// If the base policy never took from the pantry voluntarily, the RED phase
// could not go RED — that is the brief's pre-check stop condition.
'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
// KILL PROTOCOL (loop B ARM2 NO-GO at pilot, 2026-10-15): the trusthalf layer
// was deleted after the median-survival guardrail missed. Degrade gracefully
// so the retained proof documents the pre-kill result instead of crashing.
let th = null;
try { th = require('./policies/trusthalf'); } catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: trusthalf layer deleted per kill protocol (NO-GO at pilot); proof was 78/78 RED->GREEN pre-kill — see evidence/2026-10-15/sim-trusthalf-b.md');
    process.exit(0);
  }
  throw e;
}

let pass = 0;
function ok(cond, msg) {
  if (!cond) { console.error('FAIL: ' + msg); process.exit(1); }
  pass++;
  console.log('  ok: ' + msg);
}
function withEnv(k, v, fn) {
  const old = process.env[k];
  return Promise.resolve().then(() => {
    if (v === undefined) delete process.env[k]; else process.env[k] = v;
    return fn();
  }).finally(() => {
    if (old === undefined) delete process.env[k]; else process.env[k] = old;
  });
}
function dayHash(Game) {
  try {
    const s = (Game.state || {}).scholar || {}, v = (Game.state || {}).village || {};
    return [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0), (v.roster || []).length,
      Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100)].join('|');
  } catch (e) { return 'ERR'; }
}
async function runHashed(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'trusthalf-test' });
  await setupGame(Game);
  const hashes = [];
  const p = Object.assign({}, policy);
  const od = policy.daily;
  p.daily = (G, ctx) => { hashes.push(dayHash(G)); return od ? od(G, ctx) : undefined; };
  await quietLog(() => runDays(Game, p, { days }));
  return hashes;
}
function pantryKcal(Game) {
  return ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
}
function havenXY(Game) {
  const v = Game.state.village || {};
  return [(v.px !== undefined && v.px !== null) ? v.px : 4, (v.py !== undefined && v.py !== null) ? v.py : 4];
}
function parkAtHaven(Game) {
  const [hx, hy] = havenXY(Game);
  Game.map.px = hx; Game.map.py = hy;
  try { Game.state.scholar.insideHaven = true; } catch (e) {}
}
function parkAway(Game) {
  const [hx, hy] = havenXY(Game);
  Game.map.px = hx + 3; Game.map.py = hy + 3;
  try { Game.state.scholar.insideHaven = false; } catch (e) {}
}
function takeCounter(Game) {
  const c = { single: 0, singleKcal: 0, bulk: 0 };
  const os = Game.takeFromPantry.bind(Game);
  Game.takeFromPantry = function (idx) {
    const k0 = pantryKcal(Game);
    const r = os(idx);
    c.single++;
    c.singleKcal += Math.max(0, k0 - pantryKcal(Game));
    return r;
  };
  const ob = Game.takeFromPantryBulk.bind(Game);
  Game.takeFromPantryBulk = function (sel) {
    const r = ob(sel);
    c.bulk++;
    return r;
  };
  return c;
}
function sayCapture(Game) {
  const lines = [];
  const os = Game.say.bind(Game);
  Game.say = function (msg) { lines.push(String(msg)); return os(msg); };
  return lines;
}
async function fixture(policyId) {
  process.env.POLICY = policyId;
  const base = th.basePolicyForRun();
  const { Game } = await loadGame({ seed: 11, mode: 'trusthalf-test' });
  await setupGame(Game);
  await quietLog(() => runDays(Game, base, { days: 10 }));
  const pk = pantryKcal(Game);
  if (pk < 3000) throw new Error('fixture pantry too thin: ' + Math.round(pk) + ' kcal');
  const s = Game.state.scholar;
  s.kcal = 0;
  s.health = 100;
  s.inventory = [];
  try { s.water = []; } catch (e) {}
  parkAtHaven(Game);
  return { Game, base, pkBefore: pk };
}

async function main() {
  for (const policyId of ['belongseek', 'leadfeast']) {
    console.log('=== policy ' + policyId + ' ===');
    process.env.POLICY = policyId;

    console.log('PART 0 — module + gate');
    ok(typeof th.policyForRun === 'function', 'policyForRun exported');
    ok(typeof th.hatchOpen === 'function', 'hatchOpen exported');
    ok(typeof th.packEdibleKcal === 'function', 'packEdibleKcal exported');
    await withEnv('TRUSTHALF', undefined, async () => { ok(!th.layerOn(), 'gate OFF when TRUSTHALF unset'); });
    await withEnv('TRUSTHALF', '1', async () => { ok(th.layerOn(), 'gate ON when TRUSTHALF=1'); });

    console.log('PART 1 — RED (gate off): the natural voluntary-take pattern');
    await withEnv('TRUSTHALF', undefined, async () => {
      const { Game, base } = await fixture(policyId);
      const c = takeCounter(Game);
      const ctx = {};
      if (base.setup) base.setup(Game, ctx);
      await quietLog(() => base.upkeep(Game, ctx));
      ok(c.single > 0, `RED: base.upkeep fires ${c.single} real takeFromPantry calls (voluntary pantry takes exist)`);
      ok(c.singleKcal > 0, `RED: those takes drew ${Math.round(c.singleKcal)} kcal — the bind the arm targets is real`);
    });

    console.log('PART 2 — NON-AGGRESSION: gate-off wrapped == raw base');
    const hBase = await withEnv('TRUSTHALF', undefined, () => runHashed(th.basePolicyForRun(), 22, 20));
    const hWrap = await withEnv('TRUSTHALF', undefined, () => runHashed(th.policyForRun(), 22, 20));
    ok(hBase.length === hWrap.length && hBase.every((h, i) => h === hWrap[i]),
      `NON-AGGRESSION: 20-day day-hashes byte-identical (${hBase.length} days)`);

    console.log('PART 3 — GREEN (gate on, at haven): voluntary takes refused, no hatch');
    await withEnv('TRUSTHALF', '1', async () => {
      const { Game } = await fixture(policyId);
      const c = takeCounter(Game);
      const policy = th.policyForRun();
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      await quietLog(() => policy.upkeep(Game, ctx));
      ok(c.singleKcal === 0, 'GREEN: 0 real kcal taken from the pantry while a meal is coming');
      ok(policy._trusthalf.refused > 0, `GREEN: ${policy._trusthalf.refused} voluntary takes refused at the gate`);
      ok(policy._trusthalf.hatchTakes === 0, 'GREEN: hatch did NOT fire at the haven with a stocked pantry (meal coming)');
    });

    console.log('PART 4 — HATCH (gate on, estranged at the old fire): real take, narrated');
    await withEnv('TRUSTHALF', '1', async () => {
      const { Game } = await fixture(policyId);
      parkAtHaven(Game);
      try {
        const jv = (Game.state.otherVillages || [])[0];
        if (jv) Game.state.scholar.joinedVillage = jv.id;
      } catch (e) {}
      ok(!th.mealComing(Game), 'HATCH setup: no meal is coming (estranged at the old fire)');
      ok(th.takePossible(Game), 'HATCH setup: the take is physically possible');
      const c = takeCounter(Game);
      const lines = sayCapture(Game);
      const policy = th.policyForRun();
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      const k0 = Game.state.scholar.kcal || 0;
      await quietLog(() => { Game.takeFromPantry(0); try { Game.eat(); } catch (e) {} });
      ok(c.single === 1, 'HATCH: the take reached the original verb (a REAL take, ledger-recorded)');
      ok(c.singleKcal > 0, `HATCH: pantry lost ${Math.round(c.singleKcal)} kcal (honest draw, not silent)`);
      ok(policy._trusthalf.hatchTakes === 1, 'HATCH: hatchTakes counter == 1');
      ok((Game.state.scholar.kcal || 0) > k0, 'HATCH: scholar ate — survival first');
      const narrated = lines.some(l => /discipline breaks/i.test(l));
      ok(narrated, 'HATCH: the break of discipline was narrated (never silent)');
    });

    console.log('PART 4b — PASS-THROUGH: physically impossible takes reach the engine');
    await withEnv('TRUSTHALF', '1', async () => {
      const { Game } = await fixture(policyId);
      parkAway(Game);
      ok(!th.takePossible(Game), 'PASS-THROUGH setup: the take is physically impossible away from the hall');
      const c = takeCounter(Game);
      const lines = sayCapture(Game);
      const policy = th.policyForRun();
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      await quietLog(() => { Game.takeFromPantry(0); });
      ok(c.single === 1, 'PASS-THROUGH: the call reached the original verb (not swallowed)');
      ok(c.singleKcal === 0, 'PASS-THROUGH: nothing was drawn (engine refusal)');
      ok(policy._trusthalf.hatchTakes === 0, 'PASS-THROUGH: not counted as a hatch (no food changed hands)');
      ok(policy._trusthalf.refused === 0, 'PASS-THROUGH: not counted as a refusal either (the engine spoke)');
      const engineSpoke = lines.some(l => /pantry is in the hall/i.test(l));
      ok(engineSpoke, "PASS-THROUGH: the engine's own refusal line spoke (not silenced)");
    });

    console.log('PART 5 — HATCH closed when fed, or when the pack has food');
    await withEnv('TRUSTHALF', '1', async () => {
      const { Game } = await fixture(policyId);
      parkAway(Game);
      const policy = th.policyForRun();
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      Game.state.scholar.kcal = 1500;
      ok(!th.hatchOpen(Game), 'HATCH-CLOSED: bar above the hunger line -> hatch shut');
      Game.state.scholar.kcal = 0;
      Game.state.scholar.inventory = [{ name: 'Dried beans', kcalEach: 750, units: 2, spoilDay: 999, edible: true }];
      ok(!th.hatchOpen(Game), 'HATCH-CLOSED: pack has edible food -> hatch shut (no pre-fill excuse)');
      Game.state.scholar.inventory = [];
      parkAtHaven(Game);
      try {
        const jv = (Game.state.otherVillages || [])[0];
        if (jv) Game.state.scholar.joinedVillage = jv.id;
      } catch (e) {}
      ok(th.hatchOpen(Game), 'HATCH-OPEN: hungry + empty pack + at hall + no meal coming -> hatch open');
      try { delete Game.state.scholar.joinedVillage; } catch (e) {}
      ok(!th.hatchOpen(Game), 'HATCH-CLOSED: same, but the meal is coming -> hatch shut');
      parkAway(Game);
      try {
        const jv = (Game.state.otherVillages || [])[0];
        if (jv) Game.state.scholar.joinedVillage = jv.id;
      } catch (e) {}
      ok(!th.hatchOpen(Game), 'HATCH-CLOSED: away from the hall -> no discipline to break (engine refuses)');
    });

    console.log('PART 6 — MEAL UNTOUCHED (gate on): the village meal still feeds');
    await withEnv('TRUSTHALF', '1', async () => {
      const { Game } = await fixture(policyId);
      parkAtHaven(Game);
      const vid = Game.state.scholar.villagerId;
      const takes0 = (((Game.state.village || {}).takes || {})[vid]) || 0;
      const policy = th.policyForRun();
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      let meal = null;
      await quietLog(() => { meal = Game.villageMeal(); });
      ok((Game.state.scholar.kcal || 0) > 0, 'MEAL: the scholar was fed by the village meal');
      const takes1 = (((Game.state.village || {}).takes || {})[vid]) || 0;
      ok(takes1 > takes0, `MEAL: v.takes still written (+${Math.round(takes1 - takes0)} — documented, carries no per-take penalty)`);
      ok(policy._trusthalf.hatchTakes === 0 && policy._trusthalf.refused === 0,
        'MEAL: the meal is not a pantry take — gate counters untouched');
    });

    console.log('PART 7 — NO PREFILL: a fed scholar attempts nothing');
    await withEnv('TRUSTHALF', '1', async () => {
      const { Game } = await fixture(policyId);
      Game.state.scholar.kcal = Game.kcalCap ? Game.kcalCap() : 2400;
      Game.state.scholar.inventory = [];
      const policy = th.policyForRun();
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      await quietLog(() => policy.upkeep(Game, ctx));
      ok(policy._trusthalf.refused === 0 && policy._trusthalf.hatchTakes === 0,
        'NO-PREFILL: fed scholar makes zero pantry calls (competentEat never wakes)');
    });

    console.log('PART 8 — GUARANTEE: thin pack banks a trip, full pack does not');
    await withEnv('TRUSTHALF', '1', async () => {
      // G8a: empty pack -> one daily -> exactly one banking trip attempt
      const { Game } = await fixture(policyId);
      const policy = th.policyForRun();
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      Game.state.scholar.kcal = 2000; // not hungry: upkeep-style takes stay out of the way
      Game.state.scholar.health = 100;
      Game.state.scholar.inventory = [];
      const floor = Game.kcalCap ? Game.kcalCap() : 2400;
      ok(th.packEdibleKcal(Game) < floor, `GUARANTEE setup: pack ${th.packEdibleKcal(Game)} < floor ${floor}`);
      await quietLog(() => policy.daily(Game, ctx));
      ok(policy._trusthalf.guaranteeTrips === 1,
        `GUARANTEE: thin pack -> exactly 1 banking trip (got ${policy._trusthalf.guaranteeTrips})`);
      // G8b: banked pack -> no trip
      const { Game: Game2 } = await fixture(policyId);
      const policy2 = th.policyForRun();
      const ctx2 = {};
      if (policy2.setup) policy2.setup(Game2, ctx2);
      Game2.state.scholar.kcal = 2000;
      Game2.state.scholar.health = 100;
      Game2.state.scholar.inventory = [{ name: 'Smoked meat', kcalEach: 600, units: 6, spoilDay: 999, edible: true }];
      ok(th.packEdibleKcal(Game2) >= floor, 'GUARANTEE setup: pack banked to the floor');
      await quietLog(() => policy2.daily(Game2, ctx2));
      ok(policy2._trusthalf.guaranteeTrips === 0, 'GUARANTEE: banked pack -> no banking trip');
      // G8c: at most one per day
      const { Game: Game3 } = await fixture(policyId);
      const policy3 = th.policyForRun();
      const ctx3 = {};
      if (policy3.setup) policy3.setup(Game3, ctx3);
      Game3.state.scholar.kcal = 2000;
      Game3.state.scholar.health = 100;
      Game3.state.scholar.inventory = [];
      await quietLog(() => policy3.daily(Game3, ctx3));
      Game3.state.scholar.inventory = []; // keep the pack thin
      Game3.state.scholar.health = 100;
      await quietLog(() => policy3.daily(Game3, ctx3));
      ok(policy3._trusthalf.guaranteeTrips === 2, `GUARANTEE: at most one per day (2 days -> ${policy3._trusthalf.guaranteeTrips})`);
      // G8d: too hurt to work the green
      const { Game: Game4 } = await fixture(policyId);
      const policy4 = th.policyForRun();
      const ctx4 = {};
      if (policy4.setup) policy4.setup(Game4, ctx4);
      Game4.state.scholar.kcal = 2000;
      Game4.state.scholar.health = 20;
      Game4.state.scholar.inventory = [];
      await quietLog(() => policy4.daily(Game4, ctx4));
      ok(policy4._trusthalf.guaranteeTrips === 0 && policy4._trusthalf.guaranteeSkipped === 1,
        'GUARANTEE: hurt scholar (hp 20) -> no trip, counted as skipped');
    });
  }
  console.log(`\nTRUSTHALF PROOF: ${pass} assertions passed (RED->GREEN on live Game)`);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });

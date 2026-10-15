#!/usr/bin/env node
// test-bankleg-20261015.js — proof for the loop-B ARM 3 bankleg layer
// (food-economy #264, 2026-10-15). Real RED -> GREEN on a live Game.
//
// Rebuilt from the trusthalf contract (78/78 pre-kill) with the NEW
// low-exposure guarantee leg: the banking leg uses ONLY haven-adjacent
// verbs (garden harvest, fish at haven, haven-forage) and never visits a
// wild tile. "Haven-adjacent" is defined exactly: the scholar's tile is
// identical before and after the leg.
//
// RED (gate off): hungry scholar + stocked pantry + empty pack ->
//   base.upkeep does the natural pattern (takeFromPantry calls fire).
// NON-AGGRESSION (gate off byte-identical): raw base vs wrapped policy
//   (BANKLEG unset), 20 days, same seed -> identical day hashes.
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
//   banking leg per daily (guaranteeLegs), none when the pack is banked to
//   the floor, none when the scholar is too hurt (skipped count), none when
//   away from haven (skipped count — never a wild leg).
// EXPOSURE (gate on): the tile of EVERY guarantee leg is asserted identical
//   before/after (haven-adjacent, zero wild visits); a travelTo spy proves
//   the leg issues zero travel calls and only the three haven verbs fire.
//
// If the base policy never took from the pantry voluntarily, the RED phase
// could not go RED — that is the brief's pre-check stop condition.
'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
// KILL PROTOCOL (loop B ARM3 NO-GO at pilot, 2026-10-15): the bankleg layer
// was deleted after the pre-registered primary missed. Degrade gracefully
// so the retained proof documents the pre-kill result instead of crashing.
let bl = null;
try { bl = require('./policies/bankleg'); } catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: bankleg layer deleted per kill protocol (NO-GO at pilot); proof was 106/106 RED->GREEN pre-kill — see evidence/2026-10-15/sim-bankleg-b.md');
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
  const { Game } = await loadGame({ seed, mode: 'bankleg-test' });
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
  const base = bl.basePolicyForRun();
  const { Game } = await loadGame({ seed: 11, mode: 'bankleg-test' });
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
    ok(typeof bl.policyForRun === 'function', 'policyForRun exported');
    ok(typeof bl.basePolicyForRun === 'function', 'basePolicyForRun exported');
    ok(typeof bl.hatchOpen === 'function', 'hatchOpen exported');
    ok(typeof bl.takePossible === 'function', 'takePossible exported');
    ok(typeof bl.mealComing === 'function', 'mealComing exported');
    ok(typeof bl.packEdibleKcal === 'function', 'packEdibleKcal exported');
    ok(typeof bl.pantryKcal === 'function', 'pantryKcal exported');
    await withEnv('BANKLEG', undefined, async () => { ok(!bl.layerOn(), 'gate OFF when BANKLEG unset'); });
    await withEnv('BANKLEG', '1', async () => { ok(bl.layerOn(), 'gate ON when BANKLEG=1'); });

    console.log('PART 1 — RED (gate off): the natural voluntary-take pattern');
    await withEnv('BANKLEG', undefined, async () => {
      const { Game, base } = await fixture(policyId);
      const c = takeCounter(Game);
      const ctx = {};
      if (base.setup) base.setup(Game, ctx);
      await quietLog(() => base.upkeep(Game, ctx));
      ok(c.single > 0, `RED: base.upkeep fires ${c.single} real takeFromPantry calls (voluntary pantry takes exist)`);
      ok(c.singleKcal > 0, `RED: those takes drew ${Math.round(c.singleKcal)} kcal — the bind the arm targets is real`);
    });

    console.log('PART 2 — NON-AGGRESSION: gate-off wrapped == raw base');
    const hBase = await withEnv('BANKLEG', undefined, () => runHashed(bl.basePolicyForRun(), 22, 20));
    const hWrap = await withEnv('BANKLEG', undefined, () => runHashed(bl.policyForRun(), 22, 20));
    ok(hBase.length === hWrap.length && hBase.every((h, i) => h === hWrap[i]),
      `NON-AGGRESSION: 20-day day-hashes byte-identical (${hBase.length} days)`);

    console.log('PART 3 — GREEN (gate on, at haven): voluntary takes refused, no hatch');
    await withEnv('BANKLEG', '1', async () => {
      const { Game } = await fixture(policyId);
      const c = takeCounter(Game);
      const policy = bl.policyForRun();
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      await quietLog(() => policy.upkeep(Game, ctx));
      ok(c.singleKcal === 0, 'GREEN: 0 real kcal taken from the pantry while a meal is coming');
      ok(policy._bankleg.refused > 0, `GREEN: ${policy._bankleg.refused} voluntary takes refused at the gate`);
      ok(policy._bankleg.hatchTakes === 0, 'GREEN: hatch did NOT fire at the haven with a stocked pantry (meal coming)');
    });

    console.log('PART 4 — HATCH (gate on, estranged at the old fire): real take, narrated');
    await withEnv('BANKLEG', '1', async () => {
      const { Game } = await fixture(policyId);
      parkAtHaven(Game);
      try {
        const jv = (Game.state.otherVillages || [])[0];
        if (jv) Game.state.scholar.joinedVillage = jv.id;
      } catch (e) {}
      ok(!bl.mealComing(Game), 'HATCH setup: no meal is coming (estranged at the old fire)');
      ok(bl.takePossible(Game), 'HATCH setup: the take is physically possible');
      const c = takeCounter(Game);
      const lines = sayCapture(Game);
      const policy = bl.policyForRun();
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      const k0 = Game.state.scholar.kcal || 0;
      await quietLog(() => { Game.takeFromPantry(0); try { Game.eat(); } catch (e) {} });
      ok(c.single === 1, 'HATCH: the take reached the original verb (a REAL take, ledger-recorded)');
      ok(c.singleKcal > 0, `HATCH: pantry lost ${Math.round(c.singleKcal)} kcal (honest draw, not silent)`);
      ok(policy._bankleg.hatchTakes === 1, 'HATCH: hatchTakes counter == 1');
      ok((Game.state.scholar.kcal || 0) > k0, 'HATCH: scholar ate — survival first');
      const narrated = lines.some(l => /discipline breaks/i.test(l));
      ok(narrated, 'HATCH: the break of discipline was narrated (never silent)');
    });

    console.log('PART 4b — PASS-THROUGH: physically impossible takes reach the engine');
    await withEnv('BANKLEG', '1', async () => {
      const { Game } = await fixture(policyId);
      parkAway(Game);
      ok(!bl.takePossible(Game), 'PASS-THROUGH setup: the take is physically impossible away from the hall');
      const c = takeCounter(Game);
      const lines = sayCapture(Game);
      const policy = bl.policyForRun();
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      await quietLog(() => { Game.takeFromPantry(0); });
      ok(c.single === 1, 'PASS-THROUGH: the call reached the original verb (not swallowed)');
      ok(c.singleKcal === 0, 'PASS-THROUGH: nothing was drawn (engine refusal)');
      ok(policy._bankleg.hatchTakes === 0, 'PASS-THROUGH: not counted as a hatch (no food changed hands)');
      ok(policy._bankleg.refused === 0, 'PASS-THROUGH: not counted as a refusal either (the engine spoke)');
      const engineSpoke = lines.some(l => /pantry is in the hall/i.test(l));
      ok(engineSpoke, "PASS-THROUGH: the engine's own refusal line spoke (not silenced)");
    });

    console.log('PART 5 — HATCH closed when fed, or when the pack has food');
    await withEnv('BANKLEG', '1', async () => {
      const { Game } = await fixture(policyId);
      parkAway(Game);
      const policy = bl.policyForRun();
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      Game.state.scholar.kcal = 1500;
      ok(!bl.hatchOpen(Game), 'HATCH-CLOSED: bar above the hunger line -> hatch shut');
      Game.state.scholar.kcal = 0;
      Game.state.scholar.inventory = [{ name: 'Dried beans', kcalEach: 750, units: 2, spoilDay: 999, edible: true }];
      ok(!bl.hatchOpen(Game), 'HATCH-CLOSED: pack has edible food -> hatch shut (no pre-fill excuse)');
      Game.state.scholar.inventory = [];
      parkAtHaven(Game);
      try {
        const jv = (Game.state.otherVillages || [])[0];
        if (jv) Game.state.scholar.joinedVillage = jv.id;
      } catch (e) {}
      ok(bl.hatchOpen(Game), 'HATCH-OPEN: hungry + empty pack + at hall + no meal coming -> hatch open');
      try { delete Game.state.scholar.joinedVillage; } catch (e) {}
      ok(!bl.hatchOpen(Game), 'HATCH-CLOSED: same, but the meal is coming -> hatch shut');
      parkAway(Game);
      try {
        const jv = (Game.state.otherVillages || [])[0];
        if (jv) Game.state.scholar.joinedVillage = jv.id;
      } catch (e) {}
      ok(!bl.hatchOpen(Game), 'HATCH-CLOSED: away from the hall -> no discipline to break (engine refuses)');
    });

    console.log('PART 6 — MEAL UNTOUCHED (gate on): the village meal still feeds');
    await withEnv('BANKLEG', '1', async () => {
      const { Game } = await fixture(policyId);
      parkAtHaven(Game);
      const vid = Game.state.scholar.villagerId;
      const takes0 = (((Game.state.village || {}).takes || {})[vid]) || 0;
      const policy = bl.policyForRun();
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      let meal = null;
      await quietLog(() => { meal = Game.villageMeal(); });
      ok((Game.state.scholar.kcal || 0) > 0, 'MEAL: the scholar was fed by the village meal');
      const takes1 = (((Game.state.village || {}).takes || {})[vid]) || 0;
      ok(takes1 > takes0, `MEAL: v.takes still written (+${Math.round(takes1 - takes0)} — documented, carries no per-take penalty)`);
      ok(policy._bankleg.hatchTakes === 0 && policy._bankleg.refused === 0,
        'MEAL: the meal is not a pantry take — gate counters untouched');
    });

    console.log('PART 7 — NO PREFILL: a fed scholar attempts nothing');
    await withEnv('BANKLEG', '1', async () => {
      const { Game } = await fixture(policyId);
      Game.state.scholar.kcal = Game.kcalCap ? Game.kcalCap() : 2400;
      Game.state.scholar.inventory = [];
      const policy = bl.policyForRun();
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      await quietLog(() => policy.upkeep(Game, ctx));
      ok(policy._bankleg.refused === 0 && policy._bankleg.hatchTakes === 0,
        'NO-PREFILL: fed scholar makes zero pantry calls (competentEat never wakes)');
    });

    console.log('PART 8 — GUARANTEE: thin pack banks a leg, full pack does not');
    await withEnv('BANKLEG', '1', async () => {
      // G8a: empty pack -> one daily -> exactly one banking leg
      const { Game } = await fixture(policyId);
      const policy = bl.policyForRun();
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      Game.state.scholar.kcal = 2000; // not hungry: upkeep-style takes stay out of the way
      Game.state.scholar.health = 100;
      Game.state.scholar.inventory = [];
      const floor = Game.kcalCap ? Game.kcalCap() : 2400;
      ok(bl.packEdibleKcal(Game) < floor, `GUARANTEE setup: pack ${bl.packEdibleKcal(Game)} < floor ${floor}`);
      await quietLog(() => policy.daily(Game, ctx));
      ok(policy._bankleg.guaranteeLegs === 1,
        `GUARANTEE: thin pack -> exactly 1 banking leg (got ${policy._bankleg.guaranteeLegs})`);
      // G8b: banked pack -> no leg
      const { Game: Game2 } = await fixture(policyId);
      const policy2 = bl.policyForRun();
      const ctx2 = {};
      if (policy2.setup) policy2.setup(Game2, ctx2);
      Game2.state.scholar.kcal = 2000;
      Game2.state.scholar.health = 100;
      Game2.state.scholar.inventory = [{ name: 'Smoked meat', kcalEach: 600, units: 6, spoilDay: 999, edible: true }];
      ok(bl.packEdibleKcal(Game2) >= floor, 'GUARANTEE setup: pack banked to the floor');
      await quietLog(() => policy2.daily(Game2, ctx2));
      ok(policy2._bankleg.guaranteeLegs === 0, 'GUARANTEE: banked pack -> no banking leg');
      // G8c: at most one per day
      const { Game: Game3 } = await fixture(policyId);
      const policy3 = bl.policyForRun();
      const ctx3 = {};
      if (policy3.setup) policy3.setup(Game3, ctx3);
      Game3.state.scholar.kcal = 2000;
      Game3.state.scholar.health = 100;
      Game3.state.scholar.inventory = [];
      await quietLog(() => policy3.daily(Game3, ctx3));
      Game3.state.scholar.inventory = []; // keep the pack thin
      Game3.state.scholar.health = 100;
      await quietLog(() => policy3.daily(Game3, ctx3));
      ok(policy3._bankleg.guaranteeLegs === 2, `GUARANTEE: at most one per day (2 days -> ${policy3._bankleg.guaranteeLegs})`);
      // G8d: too hurt to work the green
      const { Game: Game4 } = await fixture(policyId);
      const policy4 = bl.policyForRun();
      const ctx4 = {};
      if (policy4.setup) policy4.setup(Game4, ctx4);
      Game4.state.scholar.kcal = 2000;
      Game4.state.scholar.health = 20;
      Game4.state.scholar.inventory = [];
      await quietLog(() => policy4.daily(Game4, ctx4));
      ok(policy4._bankleg.guaranteeLegs === 0 && policy4._bankleg.guaranteeSkipped === 1,
        'GUARANTEE: hurt scholar (health 20) -> no leg, counted as skipped');
      // G8e: away from haven -> no leg, counted as skipped (never a wild leg)
      const { Game: Game5 } = await fixture(policyId);
      const policy5 = bl.policyForRun();
      const ctx5 = {};
      if (policy5.setup) policy5.setup(Game5, ctx5);
      Game5.state.scholar.kcal = 2000;
      Game5.state.scholar.health = 100;
      Game5.state.scholar.inventory = [];
      parkAway(Game5);
      await quietLog(() => policy5.daily(Game5, ctx5));
      ok(policy5._bankleg.guaranteeLegs === 0 && policy5._bankleg.guaranteeSkipped >= 1,
        'GUARANTEE: away from haven -> no leg, counted as skipped (the leg never goes wild)');
    });

    console.log('PART 9 — EXPOSURE: every guarantee leg is haven-adjacent');
    await withEnv('BANKLEG', '1', async () => {
      const { Game } = await fixture(policyId);
      const policy = bl.policyForRun();
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      Game.state.scholar.kcal = 2000;
      Game.state.scholar.health = 100;
      Game.state.scholar.inventory = [];
      parkAtHaven(Game);
      // Spy the travel verb and the three haven verbs during direct leg calls.
      const travels = [];
      const oTravel = Game.travelTo.bind(Game);
      Game.travelTo = function (x, y) { travels.push([x, y]); return oTravel(x, y); };
      const verbs = { garden: 0, fish: 0, forage: 0, other: [] };
      const oHarvest = Game.harvestGarden.bind(Game);
      Game.harvestGarden = function () { verbs.garden++; return oHarvest(); };
      const oFish = Game.fish.bind(Game);
      Game.fish = function () { verbs.fish++; return oFish(); };
      const oDo = Game.doAction.bind(Game);
      Game.doAction = function (a, o) {
        if (a === 'forage') verbs.forage++;
        else verbs.other.push(String(a));
        return oDo(a, o);
      };
      const M = policy._bankleg;
      for (let i = 0; i < 3; i++) {
        Game.state.scholar.inventory = []; // keep the pack thin
        Game.state.scholar.health = 100;
        parkAtHaven(Game);
        const x0 = Game.map.px, y0 = Game.map.py;
        const r = bl._guaranteeLeg(Game, ctx, M);
        const x1 = Game.map.px, y1 = Game.map.py;
        ok(r === 'fired', `EXPOSURE leg ${i}: thin pack at haven -> leg fired`);
        ok(x0 === x1 && y0 === y1, `EXPOSURE leg ${i}: tile identical before/after (${x0},${y0}) — haven-adjacent`);
      }
      ok(travels.length === 0, `EXPOSURE: zero travelTo calls across 3 legs (got ${travels.length}) — no wild tile visit`);
      ok(verbs.other.length === 0, `EXPOSURE: only haven verbs fired (garden=${verbs.garden} fish=${verbs.fish} forage=${verbs.forage})`);
      ok(M.guaranteeLegs === 3, `EXPOSURE: 3 legs counted (got ${M.guaranteeLegs})`);
    });
  }
  console.log(`\nBANKLEG PROOF: ${pass} assertions passed (RED->GREEN on live Game)`);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });

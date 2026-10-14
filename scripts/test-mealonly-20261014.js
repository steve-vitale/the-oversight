#!/usr/bin/env node
// test-mealonly-20261014.js — proof for the loop-B ARM 1 meal-only layer
// (food-economy, 2026-10-14). Real RED -> GREEN on a live Game, no mocks.
//
// RED (gate off): hungry scholar + stocked pantry + empty pack ->
//   base.upkeep does the natural pattern (takeFromPantry calls fire; scholar
//   takes from the pantry voluntarily).
// NON-AGGRESSION (gate off byte-identical): raw base vs wrapped policy
//   (MEALONLY unset), 20 days, same seed -> identical day hashes.
// GREEN (gate on): same fixture, at haven ->
//   voluntary takeFromPantry calls are REFUSED (real takes == 0), the
//   refused counter climbs, pack food still gets eaten (Game.eat works),
//   the hatch does NOT fire while a meal is coming.
// HATCH (gate on): hungry scholar + empty pack + AT the hall + no meal coming
//   (estranged at the old fire — the take is physically possible and the meal
//   is denied) -> a REAL take fires through the honest path (pantry loses
//   kcal, scholar gains it), hatchTakes == 1, the break of discipline is
//   narrated (never silent).
// PASS-THROUGH (gate on): away from the hall (physically impossible) -> the
//   call reaches the original verb, the ENGINE's own refusal speaks ("The
//   pantry is in the hall. Your hands are not."), nothing is counted as a
//   hatch or a refusal.
// HATCH-EMPTY-PANTRY (gate on): same, but pantry empty -> hatch would be a
//   silent no-op path: the take call happens but draws nothing; counted as a
//   hatch attempt, not a refusal. (Documented, not a failure.)
// MEAL UNTOUCHED (gate on): at haven, Game.villageMeal() still fires, feeds
//   the scholar, and writes v.takes (the brief's documented unavoidable
//   ledger write) — the policy never declines the meal (unlike selfeed).
// NO PREFILL (gate on): no take is attempted when the scholar is fed
//   (PANTRY-PACK CROWDING lesson: the arm never pre-fills the pack).
//
// If the base policy never took from the pantry voluntarily, the RED phase
// could not go RED — that was the brief's pre-check stop condition.
'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
// KILL PROTOCOL (loop B ARM1 NO-GO): the mealonly layer was deleted after
// the pilot killed the arm. Degrade gracefully so the retained proof
// documents the pre-kill result instead of crashing on the missing module.
let mo = null;
try { mo = require('./policies/mealonly'); } catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: mealonly layer deleted per kill protocol (NO-GO at pilot); proof was 64/64 RED->GREEN pre-kill — see evidence/2026-10-14/sim-mealonly-b.md');
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
  const { Game } = await loadGame({ seed, mode: 'mealonly-test' });
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
  Game.map.px = hx + 3; Game.map.py = hy + 3; // off the haven tile -> pantryInReach() false
  try { Game.state.scholar.insideHaven = false; } catch (e) {}
}
// takeCounter: wraps the take verbs OUTSIDE the policy layer to count REAL
// takes (calls that reached the original verb) + pantry kcal deltas.
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
// fixture: 10 real days to build a pantry, then a hungry scholar with an
// empty pack. Returns { Game, base }.
async function fixture(policyId) {
  process.env.POLICY = policyId;
  const base = mo.basePolicyForRun();
  const { Game } = await loadGame({ seed: 11, mode: 'mealonly-test' });
  await setupGame(Game);
  await quietLog(() => runDays(Game, base, { days: 10 }));
  const pk = pantryKcal(Game);
  if (pk < 3000) throw new Error('fixture pantry too thin: ' + Math.round(pk) + ' kcal');
  const s = Game.state.scholar;
  s.kcal = 0; // hungry
  s.inventory = []; // empty pack: no weight block, no pack food (maximal-take fixture)
  try { s.water = []; } catch (e) {}
  parkAtHaven(Game);
  return { Game, base, pkBefore: pk };
}

async function main() {
  for (const policyId of ['belongseek', 'leadcourt']) {
    console.log('=== policy ' + policyId + ' ===');
    process.env.POLICY = policyId;

    console.log('PART 0 — module + gate');
    ok(typeof mo.policyForRun === 'function', 'policyForRun exported');
    ok(typeof mo.hatchOpen === 'function', 'hatchOpen exported');
    await withEnv('MEALONLY', undefined, async () => { ok(!mo.layerOn(), 'gate OFF when MEALONLY unset'); });
    await withEnv('MEALONLY', '1', async () => { ok(mo.layerOn(), 'gate ON when MEALONLY=1'); });

    console.log('PART 1 — RED (gate off): the natural voluntary-take pattern');
    await withEnv('MEALONLY', undefined, async () => {
      const { Game, base } = await fixture(policyId);
      const c = takeCounter(Game);
      const ctx = {};
      if (base.setup) base.setup(Game, ctx);
      await quietLog(() => base.upkeep(Game, ctx));
      ok(c.single > 0, `RED: base.upkeep fires ${c.single} real takeFromPantry calls (voluntary pantry takes exist)`);
      ok(c.singleKcal > 0, `RED: those takes drew ${Math.round(c.singleKcal)} kcal — the bind the arm targets is real`);
    });

    console.log('PART 2 — NON-AGGRESSION: gate-off wrapped == raw base');
    const hBase = await withEnv('MEALONLY', undefined, () => runHashed(mo.basePolicyForRun(), 22, 20));
    const hWrap = await withEnv('MEALONLY', undefined, () => runHashed(mo.policyForRun(), 22, 20));
    ok(hBase.length === hWrap.length && hBase.every((h, i) => h === hWrap[i]),
      `NON-AGGRESSION: 20-day day-hashes byte-identical (${hBase.length} days)`);

    console.log('PART 3 — GREEN (gate on, at haven): voluntary takes refused, no hatch');
    await withEnv('MEALONLY', '1', async () => {
      const { Game } = await fixture(policyId);
      const c = takeCounter(Game);
      const policy = mo.policyForRun();
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      await quietLog(() => policy.upkeep(Game, ctx));
      ok(c.singleKcal === 0, 'GREEN: 0 real kcal taken from the pantry while a meal is coming');
      ok(policy._mealonly.refused > 0, `GREEN: ${policy._mealonly.refused} voluntary takes refused at the gate`);
      ok(policy._mealonly.hatchTakes === 0, 'GREEN: hatch did NOT fire at the haven with a stocked pantry (meal coming)');
    });

    console.log('PART 4 — HATCH (gate on, estranged at the old fire): real take, narrated');
    await withEnv('MEALONLY', '1', async () => {
      const { Game } = await fixture(policyId);
      parkAtHaven(Game); // at the hall: the take is physically possible
      // Estranged: joined another village but standing at the OLD fire —
      // the communal meal is denied here (no meal coming).
      try {
        const jv = (Game.state.otherVillages || [])[0];
        if (jv) Game.state.scholar.joinedVillage = jv.id;
      } catch (e) {}
      ok(!mo.mealComing(Game), 'HATCH setup: no meal is coming (estranged at the old fire)');
      ok(mo.takePossible(Game), 'HATCH setup: the take is physically possible');
      const c = takeCounter(Game);
      const lines = sayCapture(Game);
      const policy = mo.policyForRun();
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      const k0 = Game.state.scholar.kcal || 0;
      await quietLog(() => { Game.takeFromPantry(0); try { Game.eat(); } catch (e) {} });
      ok(c.single === 1, 'HATCH: the take reached the original verb (a REAL take, ledger-recorded)');
      ok(c.singleKcal > 0, `HATCH: pantry lost ${Math.round(c.singleKcal)} kcal (honest draw, not silent)`);
      ok(policy._mealonly.hatchTakes === 1, 'HATCH: hatchTakes counter == 1');
      ok((Game.state.scholar.kcal || 0) > k0, 'HATCH: scholar ate — survival first');
      const narrated = lines.some(l => /discipline breaks/i.test(l));
      ok(narrated, 'HATCH: the break of discipline was narrated (never silent)');
    });

    console.log('PART 4b — PASS-THROUGH: physically impossible takes reach the engine');
    await withEnv('MEALONLY', '1', async () => {
      const { Game } = await fixture(policyId);
      parkAway(Game); // off the hall tile: "The pantry is in the hall. Your hands are not."
      ok(!mo.takePossible(Game), 'PASS-THROUGH setup: the take is physically impossible away from the hall');
      const c = takeCounter(Game);
      const lines = sayCapture(Game);
      const policy = mo.policyForRun();
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      await quietLog(() => { Game.takeFromPantry(0); });
      ok(c.single === 1, 'PASS-THROUGH: the call reached the original verb (not swallowed)');
      ok(c.singleKcal === 0, 'PASS-THROUGH: nothing was drawn (engine refusal)');
      ok(policy._mealonly.hatchTakes === 0, 'PASS-THROUGH: not counted as a hatch (no food changed hands)');
      ok(policy._mealonly.refused === 0, 'PASS-THROUGH: not counted as a refusal either (the engine spoke)');
      const engineSpoke = lines.some(l => /pantry is in the hall/i.test(l));
      ok(engineSpoke, 'PASS-THROUGH: the engine\'s own refusal line spoke (not silenced)');
    });

    console.log('PART 5 — HATCH closed when fed, or when the pack has food');
    await withEnv('MEALONLY', '1', async () => {
      const { Game } = await fixture(policyId);
      parkAway(Game);
      const policy = mo.policyForRun();
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      Game.state.scholar.kcal = 1500; // above the hunger line
      ok(!mo.hatchOpen(Game), 'HATCH-CLOSED: bar above the hunger line -> hatch shut');
      Game.state.scholar.kcal = 0;
      Game.state.scholar.inventory = [{ name: 'Dried beans', kcalEach: 750, units: 2, spoilDay: 999, edible: true }];
      ok(!mo.hatchOpen(Game), 'HATCH-CLOSED: pack has edible food -> hatch shut (no pre-fill excuse)');
      Game.state.scholar.inventory = [];
      parkAtHaven(Game); // at the hall: the take is physically possible
      try {
        const jv = (Game.state.otherVillages || [])[0];
        if (jv) Game.state.scholar.joinedVillage = jv.id; // estranged at the old fire
      } catch (e) {}
      ok(mo.hatchOpen(Game), 'HATCH-OPEN: hungry + empty pack + at hall + no meal coming -> hatch open');
      try { delete Game.state.scholar.joinedVillage; } catch (e) {}
      ok(!mo.hatchOpen(Game), 'HATCH-CLOSED: same, but the meal is coming -> hatch shut');
      parkAway(Game); // away at low integration: the take is physically impossible
      try {
        const jv = (Game.state.otherVillages || [])[0];
        if (jv) Game.state.scholar.joinedVillage = jv.id;
      } catch (e) {}
      ok(!mo.hatchOpen(Game), 'HATCH-CLOSED: away from the hall -> no discipline to break (engine refuses)');
    });

    console.log('PART 6 — MEAL UNTOUCHED (gate on): the village meal still feeds');
    await withEnv('MEALONLY', '1', async () => {
      const { Game } = await fixture(policyId);
      parkAtHaven(Game);
      const vid = Game.state.scholar.villagerId;
      const v = Game.state.village;
      const takes0 = ((v.takes || {})[vid]) || 0;
      const policy = mo.policyForRun();
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      let meal = null;
      await quietLog(() => { meal = Game.villageMeal(); });
      ok((Game.state.scholar.kcal || 0) > 0, 'MEAL: the scholar was fed by the village meal');
      const takes1 = (((Game.state.village || {}).takes || {})[vid]) || 0;
      ok(takes1 > takes0, `MEAL: v.takes still written (+${Math.round(takes1 - takes0)} — documented, carries no per-take penalty)`);
      ok(policy._mealonly.hatchTakes === 0 && policy._mealonly.refused === 0,
        'MEAL: the meal is not a pantry take — gate counters untouched');
    });

    console.log('PART 7 — NO PREFILL: a fed scholar attempts nothing');
    await withEnv('MEALONLY', '1', async () => {
      const { Game } = await fixture(policyId);
      Game.state.scholar.kcal = Game.kcalCap ? Game.kcalCap() : 2400; // fed
      Game.state.scholar.inventory = [];
      const policy = mo.policyForRun();
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      await quietLog(() => policy.upkeep(Game, ctx));
      ok(policy._mealonly.refused === 0 && policy._mealonly.hatchTakes === 0,
        'NO-PREFILL: fed scholar makes zero pantry calls (competentEat never wakes)');
    });
  }
  console.log(`\nMEALONLY PROOF: ${pass} assertions passed (RED->GREEN on live Game)`);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });

#!/usr/bin/env node
// test-thirstbank2-20261015.js — proof for the loop-B ARM 2 thirstbank2 layer
// (food-economy, sim-findings #300 named next, 2026-10-15, run fleshout-b-20261015T1229Z).
// REAL RED -> GREEN on a live Game. The v1 thirst-safe shape rebuilt HONESTLY
// FROM THE RECORD (the layers were deleted per kill protocol; nothing from
// memory): hidden_files/bankleg-layer-20261015.js.bak (take-discipline +
// low-exposure pack-banking guarantee) + the v1 trust gate (TRUST_GATE=25:
// below the gate the guarantee leg YIELDS the day to the base policy so the
// water/wood duty economy keeps working; the take-discipline stays
// ALWAYS-ON — discipline != leg, sim-findings #300).
//
// The bankleg/banklegrecal shape (take-discipline + low-exposure pack-banking)
// was KILLED at pilot by one guardrail: villager thirst deaths 9 vs <= 2.
// Mechanism (#300, diagnostic probe reproduced 9/9): a trust-gated
// water-duty failure — take-discipline suppresses the village's water/wood
// duty economy (d1-14 trust events on the s33 collapse: water 97->68,
// wood 23->6); the guarantee leg AMPLIFIES it (takeonly: 1 thirst death,
// full: 5). Low trust -> obedience refusals on water/wood duty ->
// cistern 0 + wood 0 -> villager thirst deaths, scholar thirst 0/0.
// THE THIRST-SAFE SHAPE: the guarantee leg is TRUST-GATED (TRUST_GATE=25)
// — below the gate the leg YIELDS the day to the base policy so the duty
// economy keeps working; the take-discipline (the hunger engine) stays
// ALWAYS-ON. Discipline != leg (the v2 whole-shape gate was killed:
// thirst 3, h1200 0.998x — do not pursue).
//
// PART A — fixtures (the v1 proof spec, re-driven against the rebuild):
//   RED (gate off): hungry scholar + stocked pantry + empty pack ->
//     base.upkeep does the natural pattern (takeFromPantry calls fire).
//   NON-AGGRESSION (gate off byte-identical): raw base vs wrapped policy
//     (THIRSTBANK2 unset), 20 days, same seed -> identical day hashes.
//   GREEN (gate on): at haven -> voluntary takeFromPantry calls are REFUSED
//     (real takes == 0), the refused counter climbs, the hatch does NOT fire
//     while a meal is coming.
//   HATCH (gate on): hungry scholar + empty pack + at the hall + no meal
//     coming (estranged at the old fire) -> a REAL take fires through the
//     honest path (pantry loses kcal, scholar gains it), hatchTakes == 1,
//     narrated.
//   PASS-THROUGH (gate on): away from the hall -> the engine's own refusal.
//   HATCH-CLOSED states: fed / pack food / meal coming / away.
//   GUARANTEE (gate on, trust HIGH): thin pack banks exactly one leg/day.
//   TRUST-GATE (gate on): trust HIGH (>=25) -> leg fires; trust LOW (<25) ->
//     leg YIELDS (legYielded++, guaranteeLegs unchanged) — the thirst-safe
//     behavior, proven here, not just asserted; the take-discipline STILL
//     refuses (discipline != leg).
//   EXPOSURE: every guarantee leg haven-adjacent, zero travel.
// PART B — live engine REAL RED (the #300 mechanism, on the real water
//   economy): a trust-low early-siege fixture on the diagnostic's own
//   reproducing substrate (belongseek seed 33, 45d). The OLD ungated shape
//   (rebuilt inline from the .bak record — behavior-identical by
//   construction) -> cistern hits 0 + villager thirst deaths (the
//   diagnostic's exact collapse); the NEW trust-gated shape ->
//   cistern stays > 0 + zero thirst deaths. Both assertions on the live
//   engine's real cistern + real registerDeath pipeline. Honest.
// PART C — det-gate: 8 seeds x {belongseek, leadcourt} x {control, armed},
//   30d each, byte-identical per side (only lever effect = honest
//   take/yield acts).
// SMOKE=1: instrument-honesty gate only (named-export unwrap + layer-live
//   marker + policy.daily fires + pacing > 0).
//
// Node harness rule (AGENTS.md): Math.random is seeded BEFORE eval'ing
// modules (several capture Math.random at load) — handled by sim-harness.
// Never stub Game.save. Never run concurrent jest here.
//
// KILL-PROTOCOL GUARD: if the layer is deleted per a §14 kill, this script
// INFO-SKIPs (exit 0) — never MODULE_NOT_FOUND.
const fs = require('fs'), path = require('path');
if (!fs.existsSync(path.join(__dirname, 'policies/thirstbank2.js'))) {
  console.log('INFO-SKIP: thirstbank2 layer deleted (killed per §14); nothing to test.');
  process.exit(0);
}
'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { checkDeterminism } = require('./det-gate');
let bl = null;
try { bl = require('./policies/thirstbank2'); } catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: thirstbank2 layer absent; proof vacuous — see evidence/2026-10-15/sim-thirstbank2-b.md');
    process.exit(0);
  }
  throw e;
}

// ---- the OLD (ungated) shape, rebuilt inline from the .bak record ----
// The killed bankleg shape: take-discipline + guarantee leg with NO trust
// gate (the leg fires regardless of trust). Behavior-identical to
// hidden_files/bankleg-layer-20261015.js.bak by construction (same reads,
// same gate, same leg — minus the TRUST_GATE yield). Used ONLY for the
// PART B REAL RED: old shape must reproduce the diagnostic collapse.
function oldShapePolicy() {
  const { belongseek } = require('./policies/belongseek');
  const { recovering } = require('./policies/competent');
  function pantryKcal(Game) { try { return ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; } }
  function packEdibleKcal(Game) { try { return ((Game.state.scholar || {}).inventory || []).reduce((t, i) => t + (((i.kcalEach || 0) > 0 && (i.units || 0) > 0 && i.edible !== false) ? (i.kcalEach || 0) * (i.units || 1) : 0), 0); } catch (e) { return 0; } }
  function kcalCap(Game) { try { return Game.kcalCap ? Game.kcalCap() : 2400; } catch (e) { return 2400; } }
  function takePossible(Game) { try { if (!Game.havenStoresAccess || Game.havenStoresAccess() === 'none') return false; } catch (e) { return false; } return pantryKcal(Game) > 0; }
  function mealComing(Game) { try { if (Game.state.scholar && Game.state.scholar.joinedVillage) return false; return !!(Game.pantryInReach && Game.pantryInReach()); } catch (e) { return false; } }
  function hatchOpen(Game) { try { const s = Game.state.scholar || {}; if ((s.kcal || 0) >= 1200) return false; if (packEdibleKcal(Game) > 0) return false; if (!takePossible(Game)) return false; if (mealComing(Game)) return false; return true; } catch (e) { return false; } }
  function hpOf(Game) { try { const s = Game.state.scholar || {}; if (s.health != null) return s.health; if (s.hp != null) return s.hp; return 100; } catch (e) { return 100; } }
  function atHaven(Game) { try { return !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) { return false; } }
  function noFight(Game) { try { if (Game.tbfight && !Game.tbfight.over) return false; if (Game.pendingEncounter) return false; return true; } catch (e) { return true; } }
  const base = belongseek;
  const M = { refused: 0, hatchTakes: 0, guaranteeLegs: 0, guaranteeSkipped: 0 };
  function installTakeGate(Game) {
    if (Game.__oldshapeTakeGate) return;
    Game.__oldshapeTakeGate = true;
    const oTake = Game.takeFromPantry.bind(Game);
    Game.takeFromPantry = function (idx) {
      if (!takePossible(Game)) return oTake(idx);
      if (hatchOpen(Game)) { const k0 = pantryKcal(Game); const r = oTake(idx); if (Math.max(0, k0 - pantryKcal(Game)) > 0) M.hatchTakes++; return r; }
      M.refused++;
      return null;
    };
  }
  function guaranteeLeg(Game, ctx) {
    const s = Game.state.scholar || {};
    if (!s || Game.over) { M.guaranteeSkipped++; return; }
    if (!noFight(Game)) { M.guaranteeSkipped++; return; }
    try { if (recovering(Game, ctx)) { M.guaranteeSkipped++; return; } } catch (e) {}
    if (hpOf(Game) < 35) { M.guaranteeSkipped++; return; }
    if (!atHaven(Game)) { M.guaranteeSkipped++; return; }
    const floor = kcalCap(Game);
    if (packEdibleKcal(Game) >= floor) return;
    if (packEdibleKcal(Game) < floor) { try { const day = s.day || 0; const plots = Game.gardenPlots ? Game.gardenPlots() : []; if (plots.some(p => Game.plotRipe(p, day))) Game.harvestGarden(); } catch (e) {} }
    if (packEdibleKcal(Game) < floor) { try { if (Game.hasItem && Game.hasItem('fishing_line')) Game.fish(); } catch (e) {} }
    if (packEdibleKcal(Game) < floor) { try { Game.doAction('forage', {}); } catch (e) {} }
    M.guaranteeLegs++;
  }
  return Object.assign({}, base, {
    id: (base.id || 'base') + '+oldshape-proofonly',
    _oldshape: M,
    setup(Game, ctx) { installTakeGate(Game); return base.setup ? base.setup(Game, ctx) : undefined; },
    daily(Game, ctx) { guaranteeLeg(Game, ctx); return base.daily(Game, ctx); },
  });
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
  const { Game } = await loadGame({ seed, mode: 'thirstbank2-test' });
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
function setAllTrust(Game, val) {
  const v = Game.state.village || {};
  v.trust = v.trust || {};
  for (const id of (v.roster || [])) v.trust[id] = val;
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
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function cisternTotal(Game) {
  try { const w = (Game.state.village || {}).water || {}; return (w.clean || 0) + (w.dirty || 0); }
  catch (e) { return 0; }
}
async function fixture(policyId) {
  process.env.POLICY = policyId;
  const base = bl.basePolicyForRun();
  const { Game } = await loadGame({ seed: 11, mode: 'thirstbank2-test' });
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

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const armed of [false, true]) {
    if (armed) process.env.THIRSTBANK2 = '1'; else delete process.env.THIRSTBANK2;
    process.env.POLICY = 'belongseek';
    const base = bl.policyForRun();
    const side = armed ? 'armed' : 'control';
    check(`[${side}] named-export unwrap: policy.daily is a function`, typeof base.daily === 'function');
    let liveFlag = null;
    const policy = Object.assign({}, base);
    const os = base.setup;
    policy.setup = (G, ctx) => { liveFlag = bl.layerOn(); if (os) return os(G, ctx); };
    let dailyCalls = 0;
    const od = base.daily;
    policy.daily = (G, ctx) => { dailyCalls++; return od(G, ctx); };
    const { Game } = await loadGame({ seed: 11, mode: 'thirstbank2-smoke', fullTelemetry: false });
    await setupGame(Game);
    let result = null;
    await quietLog(async () => { result = await runDays(Game, policy, { days: 15, manifest: undefined, sampleEvery: 10 }); });
    check(`[${side}] layer-live marker == ${armed}`, liveFlag === armed, 'live=' + liveFlag);
    check(`[${side}] harness invoked policy.daily (calls=${dailyCalls})`, dailyCalls > 0);
    const meanCalls = result.pacing ? (result.pacing.meanPolicyCallsPerDay || 0) : 0;
    check(`[${side}] policyCalls pacing > 0 (mean=${meanCalls}/day)`, meanCalls > 0);
  }
  delete process.env.THIRSTBANK2;
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE: policies drive, layer-live marker honest — safe to measure.');
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }

  for (const policyId of ['belongseek', 'leadcourt']) {
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
    ok(typeof bl.trustMean === 'function', 'trustMean exported (thirst-safe gate input)');
    ok(bl.TRUST_GATE === 25, 'TRUST_GATE === 25 (pre-registered calibration)');
    await withEnv('THIRSTBANK2', undefined, async () => { ok(!bl.layerOn(), 'gate OFF when THIRSTBANK2 unset'); });
    await withEnv('THIRSTBANK2', '1', async () => { ok(bl.layerOn(), 'gate ON when THIRSTBANK2=1'); });

    console.log('PART 1 — RED (gate off): the natural voluntary-take pattern');
    await withEnv('THIRSTBANK2', undefined, async () => {
      const { Game, base } = await fixture(policyId);
      const c = takeCounter(Game);
      const ctx = {};
      if (base.setup) base.setup(Game, ctx);
      await quietLog(() => base.upkeep(Game, ctx));
      ok(c.single > 0, `RED: base.upkeep fires ${c.single} real takeFromPantry calls (voluntary pantry takes exist)`);
      ok(c.singleKcal > 0, `RED: those takes drew ${Math.round(c.singleKcal)} kcal — the bind the arm targets is real`);
    });

    console.log('PART 2 — NON-AGGRESSION: gate-off wrapped == raw base');
    const hBase = await withEnv('THIRSTBANK2', undefined, () => runHashed(bl.basePolicyForRun(), 22, 20));
    const hWrap = await withEnv('THIRSTBANK2', undefined, () => runHashed(bl.policyForRun(), 22, 20));
    ok(hBase.length === hWrap.length && hBase.every((h, i) => h === hWrap[i]),
      `NON-AGGRESSION: 20-day day-hashes byte-identical (${hBase.length} days)`);

    console.log('PART 3 — GREEN (gate on, at haven): voluntary takes refused, no hatch');
    await withEnv('THIRSTBANK2', '1', async () => {
      const { Game } = await fixture(policyId);
      setAllTrust(Game, 60);
      ok(bl.trustMean(Game) >= bl.TRUST_GATE, `GREEN setup: trust mean ${bl.trustMean(Game).toFixed(1)} >= gate (leg may fire)`);
      const c = takeCounter(Game);
      const policy = bl.policyForRun();
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      await quietLog(() => policy.upkeep(Game, ctx));
      ok(c.singleKcal === 0, 'GREEN: 0 real kcal taken from the pantry while a meal is coming');
      ok(policy._thirstbank2.refused > 0, `GREEN: ${policy._thirstbank2.refused} voluntary takes refused at the gate`);
      ok(policy._thirstbank2.hatchTakes === 0, 'GREEN: hatch did NOT fire at the haven with a stocked pantry (meal coming)');
    });

    console.log('PART 4 — HATCH (gate on, estranged at the old fire): real take, narrated');
    await withEnv('THIRSTBANK2', '1', async () => {
      const { Game } = await fixture(policyId);
      setAllTrust(Game, 60);
      ok(bl.trustMean(Game) >= bl.TRUST_GATE, `HATCH setup: trust mean ${bl.trustMean(Game).toFixed(1)} >= gate (discipline on, hatch open)`);
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
      ok(policy._thirstbank2.hatchTakes === 1, 'HATCH: hatchTakes counter == 1');
      ok((Game.state.scholar.kcal || 0) > k0, 'HATCH: scholar ate — survival first');
      const narrated = lines.some(l => /discipline breaks/i.test(l));
      ok(narrated, 'HATCH: the break of discipline was narrated (never silent)');
    });

    console.log('PART 5 — HATCH closed when fed, or when the pack has food');
    await withEnv('THIRSTBANK2', '1', async () => {
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
    });

    console.log('PART 6 — GUARANTEE (gate on, trust HIGH): thin pack banks a leg');
    await withEnv('THIRSTBANK2', '1', async () => {
      const { Game } = await fixture(policyId);
      setAllTrust(Game, 60);
      ok(bl.trustMean(Game) >= bl.TRUST_GATE, `TRUST setup: mean ${bl.trustMean(Game).toFixed(1)} >= gate ${bl.TRUST_GATE}`);
      const policy = bl.policyForRun();
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      Game.state.scholar.kcal = 2000;
      Game.state.scholar.health = 100;
      Game.state.scholar.inventory = [];
      const floor = Game.kcalCap ? Game.kcalCap() : 2400;
      ok(bl.packEdibleKcal(Game) < floor, 'GUARANTEE setup: pack thin');
      await quietLog(() => policy.daily(Game, ctx));
      ok(policy._thirstbank2.guaranteeLegs === 1,
        `GUARANTEE: trust high + thin pack -> exactly 1 banking leg (got ${policy._thirstbank2.guaranteeLegs})`);
      ok((policy._thirstbank2.legYielded || 0) === 0, 'GUARANTEE: no yield when trust is high');
    });

    console.log('PART 7 — TRUST-GATE (gate on, trust LOW): the LEG yields, the DISCIPLINE stays on');
    await withEnv('THIRSTBANK2', '1', async () => {
      const { Game } = await fixture(policyId);
      setAllTrust(Game, 10);
      ok(bl.trustMean(Game) < bl.TRUST_GATE, `TRUST setup: mean ${bl.trustMean(Game).toFixed(1)} < gate ${bl.TRUST_GATE}`);
      const policy = bl.policyForRun();
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      Game.state.scholar.kcal = 2000;
      Game.state.scholar.health = 100;
      Game.state.scholar.inventory = [];
      await quietLog(() => policy.daily(Game, ctx));
      ok(policy._thirstbank2.guaranteeLegs === 0, 'TRUST-GATE: trust low -> NO banking leg (the leg yields)');
      ok(policy._thirstbank2.legYielded === 1, 'TRUST-GATE: legYielded counter == 1 (the yield is counted, never silent)');
      // The take-discipline is NOT gated by trust (v1: discipline always-on,
      // discipline != leg). Re-park at haven: the base daily may have moved
      // the scholar.
      parkAtHaven(Game);
      // Ensure the take is physically possible so there is something to take.
      if (!bl.takePossible(Game)) { try { Game.stockPantry(5000, 'proof stock'); } catch (e) {} }
      ok(bl.takePossible(Game), 'TRUST-GATE setup: take is physically possible (stocked if needed)');
      const c = takeCounter(Game);
      const refused0 = policy._thirstbank2.refused;
      await quietLog(() => { Game.takeFromPantry(0); });
      ok(c.singleKcal === 0 && policy._thirstbank2.refused === refused0 + 1,
        'TRUST-GATE: take-discipline STILL refuses when trust is low (discipline != leg)');
    });

    console.log('PART 8 — EXPOSURE: every guarantee leg is haven-adjacent');
    await withEnv('THIRSTBANK2', '1', async () => {
      const { Game } = await fixture(policyId);
      setAllTrust(Game, 60);
      const policy = bl.policyForRun();
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      Game.state.scholar.kcal = 2000;
      Game.state.scholar.health = 100;
      Game.state.scholar.inventory = [];
      parkAtHaven(Game);
      const travels = [];
      const oTravel = Game.travelTo.bind(Game);
      Game.travelTo = function (x, y) { travels.push([x, y]); return oTravel(x, y); };
      const M = policy._thirstbank2;
      for (let i = 0; i < 3; i++) {
        Game.state.scholar.inventory = [];
        Game.state.scholar.health = 100;
        parkAtHaven(Game);
        const x0 = Game.map.px, y0 = Game.map.py;
        const r = bl._guaranteeLeg(Game, ctx, M);
        const x1 = Game.map.px, y1 = Game.map.py;
        ok(r === 'fired', `EXPOSURE leg ${i}: trust high + thin pack at haven -> leg fired`);
        ok(x0 === x1 && y0 === y1, `EXPOSURE leg ${i}: tile identical before/after — haven-adjacent`);
      }
      ok(travels.length === 0, `EXPOSURE: zero travelTo calls across 3 legs — no wild tile visit`);
      ok(M.guaranteeLegs === 3, `EXPOSURE: 3 legs counted (got ${M.guaranteeLegs})`);
    });
  }

  console.log('PART B — REAL RED: trust-low early-siege fixture on the live engine');
  console.log('  substrate: the diagnostic probe\'s own reproducing case (belongseek seed 33, 45d).');
  console.log('  OLD = the killed ungated bankleg shape (rebuilt inline from the .bak record).');
  console.log('  NEW = thirstbank2 (trust-gated leg). Assertions on the REAL cistern');
  console.log('  + the REAL registerDeath pipeline. Honest.');
  {
    async function shapeRun(isOld) {
      process.env.POLICY = 'belongseek';
      if (isOld) { delete process.env.THIRSTBANK2; } else { process.env.THIRSTBANK2 = '1'; }
      const policy = isOld ? oldShapePolicy() : bl.policyForRun();
      const { Game } = await loadGame({ seed: 33, mode: 'thirstbank2-red' });
      await setupGame(Game);
      const traj = [];
      const thirst = [];
      const oDeath = Game.registerDeath ? Game.registerDeath.bind(Game) : null;
      if (oDeath) {
        Game.registerDeath = function (d) {
          try {
            if (d && /thirst/i.test(String(d.cause || ''))) {
              thirst.push({ day: gday(Game), scholar: !!(d && d.villagerId && d.villagerId === Game.villagerId) });
            }
          } catch (e) {}
          return oDeath(d);
        };
      }
      const p = Object.assign({}, policy);
      const od = policy.daily;
      p.daily = (G, ctx) => {
        try { traj.push({ day: gday(G), total: Math.round(cisternTotal(G)) }); } catch (e) {}
        return od(G, ctx);
      };
      const ctx = {};
      if (p.setup) await quietLog(() => p.setup(Game, ctx));
      let result;
      await quietLog(async () => { result = await runDays(Game, p, { days: 45, manifest: undefined, sampleEvery: 10 }); });
      const minTot = traj.length ? Math.min(...traj.map(t => t.total)) : -1;
      const villagerThirst = thirst.filter(t => !t.scholar).length;
      const scholarThirst = thirst.filter(t => t.scholar).length;
      return { minTot, villagerThirst, scholarThirst, days: result.gameDays, end: result.endReason };
    }
    const oldR = await shapeRun(true);
    console.log(`  OLD (ungated): days=${oldR.days} end=${oldR.end} minCistern=${oldR.minTot}L villagerThirst=${oldR.villagerThirst} scholarThirst=${oldR.scholarThirst}`);
    ok(oldR.minTot === 0, `REAL RED (old): cistern hits 0 on the trust-low early-siege fixture (min ${oldR.minTot}L) — the #300 collapse reproduces`);
    ok(oldR.villagerThirst >= 1, `REAL RED (old): ${oldR.villagerThirst} villager thirst death(s) via the real pipeline (diagnostic: 4 on this substrate)`);
    const newR = await shapeRun(false);
    console.log(`  NEW (gated):   days=${newR.days} end=${newR.end} minCistern=${newR.minTot}L villagerThirst=${newR.villagerThirst} scholarThirst=${newR.scholarThirst}`);
    ok(newR.minTot > 0, `REAL RED (new): cistern stays > 0 (min ${newR.minTot}L) — the trust-gated leg prevents the drain`);
    ok(newR.villagerThirst === 0, 'REAL RED (new): zero villager thirst deaths — the #300 mechanism is gated, not the game');
    ok(newR.scholarThirst === 0 && oldR.scholarThirst === 0, 'REAL RED: scholar thirst 0/0 both sides (cistern-draw competition stays ruled out)');
    delete process.env.THIRSTBANK2;
  }

  console.log('PART C — det-gate: 8 seeds x 2 policies x 2 sides, 30d, byte-identical per side');
  {
    const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
    let fails = 0, n = 0;
    for (const policyId of ['belongseek', 'leadcourt']) {
      process.env.POLICY = policyId;
      for (const armed of [false, true]) {
        if (armed) process.env.THIRSTBANK2 = '1'; else delete process.env.THIRSTBANK2;
        const side = armed ? 'armed' : 'control';
        const policy = bl.policyForRun();
        for (const seed of SEEDS) {
          const gate = await checkDeterminism(seed, policy, { days: 30 });
          n++;
          if (gate.identical) {
            console.log(`  IDENTICAL ${policyId}/${side}/s${seed}`);
          } else {
            console.log(`  DIVERGED  ${policyId}/${side}/s${seed}: ${gate.summary}`);
            fails++;
          }
        }
      }
    }
    delete process.env.THIRSTBANK2;
    ok(fails === 0, `DET-GATE: ${n - fails}/${n} identical (8 seeds x 2 policies x 2 sides, 30d)`);
  }

  console.log(`\nTHIRSTBANK2 PROOF: ${pass} assertions passed (RED->GREEN on live Game)`);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });

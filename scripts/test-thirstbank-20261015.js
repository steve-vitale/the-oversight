#!/usr/bin/env node
// test-thirstbank-20261015.js — proof for the loop-B ARM 1 thirstbank layer
// (food-economy, sim-findings #286/#264/#299, 2026-10-15, run fleshout-b-20261015T0927Z).
// REAL RED -> GREEN on a live Game. The v1 thirst-safe shape rebuilt from
// hidden_files/bankleg-layer-20261015.js.bak + the TRUST_GATE=25 yield leg:
// take-discipline ALWAYS-ON (the hunger engine) + low-exposure guarantee leg
// that YIELDS below trust 25 so the water/wood duty economy keeps working.
//
// KILL-PROTOCOL GUARD: if the layer is deleted per a §14 kill, this script
// INFO-SKIPs (exit 0) — never MODULE_NOT_FOUND.
const fs = require('fs'), path = require('path');
if (!fs.existsSync(path.join(__dirname, 'policies/thirstbank.js'))) {
  console.log('INFO-SKIP: thirstbank layer deleted (killed per §14); nothing to test.');
  process.exit(0);
}

// The bankleg/banklegrecal shape (take-discipline + low-exposure pack-banking)
// was KILLED TWICE at pilot by one guardrail: villager thirst deaths 9 vs <= 2.
// Mechanism (evidence/2026-10-15/sim-thirstsafe-b.md): a trust-gated
// water-duty failure — take-discipline suppresses the village's water/wood
// duty economy (d1-14 trust events on the s33 collapse: water 97->68,
// wood 23->6); the guarantee leg AMPLIFIES it (takeonly: 1 thirst death,
// full: 5). Low trust -> obedience refusals on water/wood duty ->
// cistern 0 + wood 0 -> villager thirst deaths, scholar thirst 0/0.
// THE V1 THIRST-SAFE SHAPE: the guarantee leg is TRUST-GATED
// (TRUST_GATE=25) — below the gate the leg YIELDS the day to the base
// policy so the duty economy keeps working; the take-discipline
// (the hunger engine) stays ALWAYS-ON. Discipline != leg.
// RED (gate off): hungry scholar + stocked pantry + empty pack ->
//   base.upkeep does the natural pattern (takeFromPantry calls fire).
// NON-AGGRESSION (gate off byte-identical): raw base vs wrapped policy
//   (THIRSTBANK unset), 20 days, same seed -> identical day hashes.
// GREEN (gate on): at haven -> voluntary takeFromPantry calls are REFUSED
//   (real takes == 0), the refused counter climbs, the hatch does NOT fire
//   while a meal is coming.
// HATCH (gate on): hungry scholar + empty pack + at the hall + no meal coming
//   (estranged at the old fire) -> a REAL take fires through the honest path
//   (pantry loses kcal, scholar gains it), hatchTakes == 1, narrated.
// PASS-THROUGH (gate on): away from the hall -> the engine's own refusal.
// HATCH-CLOSED states: fed / pack food / meal coming / away.
// GUARANTEE (gate on, trust HIGH): thin pack banks exactly one leg/day.
// TRUST-GATE (gate on): trust HIGH (>=25) -> leg fires; trust LOW (<25) ->
//   leg YIELDS (legYielded++, guaranteeLegs unchanged) — the thirst-safe
//   behavior, proven here, not just asserted; the take-discipline STILL
//   refuses (discipline != leg).
// EXPOSURE: every guarantee leg haven-adjacent, zero travel.
//'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
let bl = null;
try { bl = require('./policies/thirstbank'); } catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: thirstbank layer absent; proof vacuous — see evidence/2026-10-15/sim-thirstbank-b.md');
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
  const { Game } = await loadGame({ seed, mode: 'thirstbank-test' });
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
async function fixture(policyId) {
  process.env.POLICY = policyId;
  const base = bl.basePolicyForRun();
  const { Game } = await loadGame({ seed: 11, mode: 'thirstbank-test' });
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
    await withEnv('THIRSTBANK', undefined, async () => { ok(!bl.layerOn(), 'gate OFF when THIRSTBANK unset'); });
    await withEnv('THIRSTBANK', '1', async () => { ok(bl.layerOn(), 'gate ON when THIRSTBANK=1'); });

    console.log('PART 1 — RED (gate off): the natural voluntary-take pattern');
    await withEnv('THIRSTBANK', undefined, async () => {
      const { Game, base } = await fixture(policyId);
      const c = takeCounter(Game);
      const ctx = {};
      if (base.setup) base.setup(Game, ctx);
      await quietLog(() => base.upkeep(Game, ctx));
      ok(c.single > 0, `RED: base.upkeep fires ${c.single} real takeFromPantry calls (voluntary pantry takes exist)`);
      ok(c.singleKcal > 0, `RED: those takes drew ${Math.round(c.singleKcal)} kcal — the bind the arm targets is real`);
    });

    console.log('PART 2 — NON-AGGRESSION: gate-off wrapped == raw base');
    const hBase = await withEnv('THIRSTBANK', undefined, () => runHashed(bl.basePolicyForRun(), 22, 20));
    const hWrap = await withEnv('THIRSTBANK', undefined, () => runHashed(bl.policyForRun(), 22, 20));
    ok(hBase.length === hWrap.length && hBase.every((h, i) => h === hWrap[i]),
      `NON-AGGRESSION: 20-day day-hashes byte-identical (${hBase.length} days)`);

    console.log('PART 3 — GREEN (gate on, at haven): voluntary takes refused, no hatch');
    await withEnv('THIRSTBANK', '1', async () => {
      const { Game } = await fixture(policyId);
      setAllTrust(Game, 60);
      ok(bl.trustMean(Game) >= bl.TRUST_GATE, `GREEN setup: trust mean ${bl.trustMean(Game).toFixed(1)} >= gate (leg may fire)`);
      const c = takeCounter(Game);
      const policy = bl.policyForRun();
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      await quietLog(() => policy.upkeep(Game, ctx));
      ok(c.singleKcal === 0, 'GREEN: 0 real kcal taken from the pantry while a meal is coming');
      ok(policy._thirstbank.refused > 0, `GREEN: ${policy._thirstbank.refused} voluntary takes refused at the gate`);
      ok(policy._thirstbank.hatchTakes === 0, 'GREEN: hatch did NOT fire at the haven with a stocked pantry (meal coming)');
    });

    console.log('PART 4 — HATCH (gate on, estranged at the old fire): real take, narrated');
    await withEnv('THIRSTBANK', '1', async () => {
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
      ok(policy._thirstbank.hatchTakes === 1, 'HATCH: hatchTakes counter == 1');
      ok((Game.state.scholar.kcal || 0) > k0, 'HATCH: scholar ate — survival first');
      const narrated = lines.some(l => /discipline breaks/i.test(l));
      ok(narrated, 'HATCH: the break of discipline was narrated (never silent)');
    });

    console.log('PART 5 — HATCH closed when fed, or when the pack has food');
    await withEnv('THIRSTBANK', '1', async () => {
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
    await withEnv('THIRSTBANK', '1', async () => {
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
      ok(policy._thirstbank.guaranteeLegs === 1,
        `GUARANTEE: trust high + thin pack -> exactly 1 banking leg (got ${policy._thirstbank.guaranteeLegs})`);
      ok((policy._thirstbank.legYielded || 0) === 0, 'GUARANTEE: no yield when trust is high');
    });

    console.log('PART 7 — TRUST-GATE (gate on, trust LOW): the LEG yields, the DISCIPLINE stays on');
    await withEnv('THIRSTBANK', '1', async () => {
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
      ok(policy._thirstbank.guaranteeLegs === 0, 'TRUST-GATE: trust low -> NO banking leg (the leg yields)');
      ok(policy._thirstbank.legYielded === 1, 'TRUST-GATE: legYielded counter == 1 (the yield is counted, never silent)');
      // The take-discipline is NOT gated by trust (v1: discipline always-on,
      // discipline != leg). Re-park at haven: the base daily may have moved
      // the scholar.
      parkAtHaven(Game);
      // Ensure the take is physically possible so there is something to take.
      if (!bl.takePossible(Game)) { try { Game.stockPantry(5000, 'proof stock'); } catch (e) {} }
      ok(bl.takePossible(Game), 'TRUST-GATE setup: take is physically possible (stocked if needed)');
      const c = takeCounter(Game);
      const refused0 = policy._thirstbank.refused;
      await quietLog(() => { Game.takeFromPantry(0); });
      ok(c.singleKcal === 0 && policy._thirstbank.refused === refused0 + 1,
        'TRUST-GATE: take-discipline STILL refuses when trust is low (discipline != leg)');
    });

    console.log('PART 8 — EXPOSURE: every guarantee leg is haven-adjacent');
    await withEnv('THIRSTBANK', '1', async () => {
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
      const M = policy._thirstbank;
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
  console.log(`\nTHIRSTBANK PROOF: ${pass} assertions passed (RED->GREEN on live Game)`);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });

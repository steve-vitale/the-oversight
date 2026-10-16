#!/usr/bin/env node
'use strict';
// KILL PROTOCOL (2026-10-16: pilot NO-GO 1.176 vs 0.70): the lever is
// reverted — src/js/game.js no longer carries apexRouteOn. INFO-SKIP
// instead of crashing on the missing lever.
(function () {
  const fs = require('fs');
  const path = require('path');
  try {
    const gj = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'game.js'), 'utf8');
    if (gj.indexOf('apexRouteOn') === -1) {
      console.log('SKIP test-apexroute-20261016 (lever reverted per kill protocol — apexRouteOn absent from src/js/game.js)');
      process.exit(0);
    }
  } catch (e) {}
})();
// test-apexroute-20261016.js — proof for the apexroute lever (sim-apexroute,
// 2026-10-16, scale-onramp axis): engine-side villager apex-avoidance routing.
//
// PROVES:
//   1. UNIT (synthetic, RED→GREEN): the memory + routing gates on known
//      inputs — apexWeight census weights, record/no-op gate, heat + 14d
//      decay boundary, path heat, cold-dir choice + all-hot fallback,
//      pantry gate (village tier, not scholar kcal), objDanger heat moves
//      the verdict, expeditionLeg sidesteps a hot next tile (live game).
//      RED = APEXROUTE unset: recording is a no-op, heat is 0, routing
//      walks straight through. GREEN = APEXROUTE=1: sightings record,
//      heat diverts.
//   2. DET-GATE: APEXROUTE unset — 4 pairs x 40d, plain-repeat +
//      instr-repeat + plain==instr via dayHash, ends agree, and no
//      apexSights trace left behind (zero-trace gate-off).
//   3. SMOKE: 15d x 2 policies, APEXROUTE=1, pre-seeded hot tiles — runs
//      complete, gates fire on real departures (reroute/heat/sidestep
//      counters > 0), no crash.
//
// Node harness rules: full src/js list in index.html order via sim-harness
// (minus DOM-only files); Math.random seeded BEFORE eval; never stub
// Game.save; --cacheDirectory=/tmp/jest-cache-sim-apexroute for any jest.
const assert = require('assert');
const TF = require('./policies/tribfloor');
const FFS = require('./fieldfightsrc-20261016');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}
function setGate(on) {
  if (on) process.env.APEXROUTE = '1'; else delete process.env.APEXROUTE;
}

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'apexroute-test' });
  await setupGame(Game);
  return Game;
}

// ---------------------------------------------------------------------
// UNIT: pure memory + gate logic on a loaded game (RED then GREEN).
async function units() {
  console.log('UNIT: apex memory + routing gates (RED→GREEN)');
  const Game = await freshGame(4242);
  const W = (fn, self) => Game[fn].bind(self || Game);

  // 1. census weights
  check('eater weight 3', Game.apexWeight('eater') === 3);
  check('reunion weight 2', Game.apexWeight('reunion') === 2);
  check('eulogy (wave 4) weight 1', Game.apexWeight('eulogy') === 1);
  check('audit (wave 4) weight 1', Game.apexWeight('audit') === 1);
  check('bulldozer (wave 1) weight 0', Game.apexWeight('bulldozer') === 0);
  check('unknown species weight 0', Game.apexWeight('nope_not_real') === 0);

  // 2. RED: gate off → recording is a no-op, zero trace
  setGate(false);
  const rOff = Game.recordApexSighting(5, 4, 'eater', 'v_x');
  check('RED record returns false', rOff === false);
  check('RED no memory created', Game.state.village.apexSights === undefined);
  check('RED heat 0 on would-be-hot tile', Game.apexHeatAt(5, 4) === 0);
  check('RED path heat 0', Game.apexPathHeat(4, 4, 6, 4) === 0);

  // 3. GREEN: recording, heat, decay
  setGate(true);
  Game.state.scholar.day = 100;
  const rOn = Game.recordApexSighting(5, 4, 'eater', 'v_x');
  check('GREEN record returns true', rOn === true);
  check('GREEN heat 3 at sighting tile', Game.apexHeatAt(5, 4) === 3);
  check('GREEN cold neighbor 0', Game.apexHeatAt(5, 5) === 0);
  Game.recordApexSighting(6, 4, 'reunion', 'v_y');
  check('GREEN reunion heat 2', Game.apexHeatAt(6, 4) === 2);
  // freshest wins on re-sight
  Game.state.scholar.day = 105;
  Game.recordApexSighting(5, 4, 'audit', 'v_z');
  check('GREEN re-sight refreshes (audit w1)', Game.apexHeatAt(5, 4) === 1);
  // decay boundary: 14d old hot, 15d old cold
  Game.state.scholar.day = 119; // 119-105=14
  check('14d-old sighting still hot', Game.apexHeatAt(5, 4) === 1);
  Game.state.scholar.day = 120; // 120-105=15
  check('15d-old sighting decayed', Game.apexHeatAt(5, 4) === 0);
  Game.state.scholar.day = 120; // 120-105=15: the (5,4) refresh decayed; (6,4)@100 is 20d old — both cold now

  // 4. path heat along the Chebyshev walk
  Game.recordApexSighting(4, 6, 'eater', 'v_x'); // day 120
  check('path heat finds mid-path sighting', Game.apexPathHeat(4, 4, 4, 7) === 3);
  check('path heat 0 off the path', Game.apexPathHeat(4, 4, 7, 4) === 0);
  check('path heat includes destination tile', Game.apexPathHeat(4, 4, 4, 6) === 3);

  // 5. cold-dir choice
  const cd = Game.apexColdDir(4, 4, 2);
  check('cold dir returned when one exists', Array.isArray(cd) && cd.length === 2);
  if (cd) {
    const tx = Math.max(0, Math.min(8, 4 + cd[0] * 2)), ty = Math.max(0, Math.min(8, 4 + cd[1] * 2));
    check('cold dir path is cold', Game.apexPathHeat(4, 4, tx, ty) === 0, JSON.stringify(cd));
  }
  // all-hot fallback: heat every tile at dist 1 in all 8 dirs
  Game.state.village.apexSights = {};
  for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]) {
    Game.recordApexSighting(4 + dx, 4 + dy, 'reunion', 'v_x');
  }
  check('all-hot → null (never strands)', Game.apexColdDir(4, 4, 1) === null);
  Game.state.village.apexSights = {};

  // 6. pantry gate: village tier, never scholar kcal
  const realTier = Game.villageFoodTier;
  Game.villageFoodTier = () => 'secure';
  check('secure → caution affordable', Game.apexPantryOk() === true);
  Game.villageFoodTier = () => 'abundant';
  check('abundant → caution affordable', Game.apexPantryOk() === true);
  Game.villageFoodTier = () => 'tight';
  check('tight → food missions win', Game.apexPantryOk() === false);
  Game.villageFoodTier = () => 'starving';
  check('starving → food missions win', Game.apexPantryOk() === false);
  Game.villageFoodTier = realTier;

  // 7. objDanger heat moves the verdict (deterministic — no RNG in objDanger)
  const v = Game.state.village;
  const vid = (v.roster || []).find(id => id !== Game.villagerId);
  assert(vid, 'need a villager');
  Game.villageFoodTier = () => 'secure';
  Game.state.scholar.day = 100;
  Game.recordApexSighting(5, 4, 'eater', vid); // hot path tile
  setGate(false);
  const dgOff = Game.objDanger(vid, 6, 4, 4, 4);
  setGate(true);
  const dgOn = Game.objDanger(vid, 6, 4, 4, 4);
  check('RED objDanger ignores hot ground', dgOn.score - dgOff.score === 3,
    `off=${dgOff.score} on=${dgOn.score}`);
  check('GREEN heat recorded in apexStats', (v.apexStats.heat | 0) >= 1);
  Game.villageFoodTier = () => 'tight';
  const dgTight = Game.objDanger(vid, 6, 4, 4, 4);
  check('tight pantry: no heat added', dgTight.score === dgOff.score,
    `tight=${dgTight.score} off=${dgOff.score}`);
  Game.villageFoodTier = realTier;
  Game.state.village.apexSights = {};
  setGate(false);
}

// ---------------------------------------------------------------------
// UNIT-B: expeditionLeg sidestep on a live game (RED→GREEN).
async function legProbe() {
  console.log('UNIT-B: expeditionLeg sidestep (live game, RED→GREEN)');
  for (const gate of [false, true]) {
    const Game = await freshGame(gate ? 777 : 777);
    const v = Game.state.village;
    const hx = v.px ?? 4, hy = v.py ?? 4;
    const vid = (v.roster || []).find(id => id !== Game.villagerId);
    assert(vid, 'need a villager');
    Game.stockPantry(60000, 'test-secure');
    Game.state.scholar.day = 100;
    setGate(gate);
    if (gate) Game.recordApexSighting(hx + 1, hy, 'eater', vid); // the next tile is hot
    // TABLE SANCTITY guard: no encounters during the routing probe — the
    // probe is about the leg choice, and the guard is the engine's own.
    const realTA = Game.tableActive;
    Game.tableActive = () => true;
    const st = Game.agencyState();
    Game.agencyOf(vid);
    Game.npcSetNode(vid, hx, hy);
    st.exped[vid] = {
      tx: hx + 2, ty: hy, dist: 2, legs: 0,
      sinceDay: 100, sincePart: 0, duration: 20, finds: [], encounters: [],
    };
    Game.expeditionLeg(vid, hx, hy, false);
    Game.tableActive = realTA;
    const n = Game.npcNode(vid);
    const stepped = !(n.nx === hx + 1 && n.ny === hy);
    const stats = v.apexStats || {};
    if (!gate) {
      check('RED leg walks straight through hot tile', !stepped && n.nx === hx + 1 && n.ny === hy,
        `at ${n.nx},${n.ny}`);
      check('RED no apex trace', v.apexSights === undefined && v.apexStats === undefined);
    } else {
      check('GREEN leg sidesteps the hot tile', stepped, `at ${n.nx},${n.ny}`);
      check('GREEN sidestep counted', (stats.sidestep | 0) === 1, JSON.stringify(stats));
      check('GREEN sidestep tile is cold', Game.apexHeatAt(n.nx, n.ny) === 0);
    }
    setGate(false);
  }
}

// ---------------------------------------------------------------------
// DET-GATE: APEXROUTE unset — 4 pairs x 40d, plain/instr repeats.
async function detGate() {
  console.log('DET-GATE: APEXROUTE unset — trajectory-identical (4 pairs x 40d)');
  setGate(false);
  const pairs = [
    ['leadfeast', 117], ['leadfeast', 228], ['belongfeast', 117], ['belongfeast', 228],
  ];
  const baseFor = (p) => p === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  let green = 0;
  for (const [policyId, seed] of pairs) {
    const hashes = [];
    for (let rep = 0; rep < 2; rep++) {
      const useInstr = rep === 1;
      const base = baseFor(policyId);
      const policy = useInstr ? FFS.withFieldFightSrc(base, policyId + '-ffs', policyId + ' [FFS]') : base;
      const { Game } = await loadGame({ seed, mode: 'apexroute-detgate' });
      await setupGame(Game);
      let ctx = null;
      const oSetup = policy.setup;
      const wrapped = Object.assign({}, policy);
      wrapped.setup = (G, c) => { ctx = c; return oSetup ? oSetup(G, c) : undefined; };
      const oDaily = policy.daily;
      wrapped.daily = (G, c) => {
        hashes.push(rep + ':' + Game.state.scholar.day + ':' + dayHash(Game));
        return oDaily ? oDaily(G, c) : undefined;
      };
      await quietLog(async () => { await runDays(Game, wrapped, { days: 40, manifest: undefined, sampleEvery: 40 }); });
      hashes.push(rep + ':END:' + dayHash(Game));
      // zero-trace: gate-off must leave no apex memory behind
      const trace = Game.state.village.apexSights !== undefined || Game.state.village.apexStats !== undefined;
      if (trace) { console.log(`  FAIL zero-trace violated (${policyId} s${seed} rep ${rep})`); fail++; }
      void ctx;
    }
    const a = hashes.filter(h => h.startsWith('0:')).join('\n');
    const b = hashes.filter(h => h.startsWith('1:')).join('\n');
    // plain==instr: strip the rep prefix and compare
    const norm = (s) => s.split('\n').map(l => l.slice(2)).join('\n');
    if (norm(a) === norm(b)) { green++; console.log(`  PASS pair ${policyId} s${seed} identical`); }
    else { fail++; console.log(`  FAIL pair ${policyId} s${seed} DIVERGED (gate off — must be identical)`); }
  }
  console.log(`DET-GATE: ${green}/${pairs.length} identical.`);
  if (green < pairs.length) { console.error('DET GATE FAILED.'); process.exit(4); }
}

// ---------------------------------------------------------------------
// SMOKE: 15d x 2 policies, APEXROUTE=1, pre-seeded hot tiles.
async function smoke() {
  console.log('SMOKE: 15d x 2 policies, APEXROUTE=1, hot tiles pre-seeded');
  setGate(true);
  for (const policyId of ['leadfeast', 'belongfeast']) {
    const base = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
    const { Game } = await loadGame({ seed: 999, mode: 'apexroute-smoke' });
    await setupGame(Game);
    const v = Game.state.village;
    const hx = v.px ?? 4, hy = v.py ?? 4;
    const vid = (v.roster || []).find(id => id !== Game.villagerId);
    Game.state.scholar.day = 1;
    // pre-seed a hot ring: every tile at dist 1-2 in all directions (14d
    // memory covers the 15d smoke; day-1 sightings).
    for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) {
      if (!dx && !dy) continue;
      Game.recordApexSighting(hx + dx, hy + dy, 'reunion', vid);
    }
    Game.stockPantry(60000, 'test-secure');
    const wrapped = Object.assign({}, base);
    await quietLog(async () => { await runDays(Game, wrapped, { days: 15, manifest: undefined, sampleEvery: 15 }); });
    const stats = v.apexStats || {};
    const fired = (stats.reroute | 0) + (stats.heat | 0) + (stats.sidestep | 0);
    check(`${policyId}: run completed 15d`, (Game.state.scholar.day || 0) >= 15, `day=${Game.state.scholar.day}`);
    check(`${policyId}: gates fired on real departures`, fired > 0, JSON.stringify(stats));
    check(`${policyId}: sightings recorded`, (stats.sights | 0) >= 24, `sights=${stats.sights}`);
  }
  setGate(false);
}

(async () => {
  try {
    await units();
    await legProbe();
    await detGate();
    await smoke();
  } catch (e) {
    console.error('TEST CRASH:', e);
    process.exit(2);
  }
  console.log(`\nDONE — ${pass} pass, ${fail} fail.`);
  process.exit(fail ? 1 : 0);
})();

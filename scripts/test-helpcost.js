#!/usr/bin/env node
'use strict';
// test-helpcost.js — proof for the sim-helpcost cost-accounting instrument
// (scripts/policies/helpcost.js).
//
// RED/GREEN: a fixture Game with an apex raid crisis + a runner on the road
// proves the gap (RED: naked base policy → costSummary null, no cost
// accounting) and the instrument (GREEN: wrapped → episode + away-parts
// counted, runner-death situation recorded, gate-off pure).
// DET-GATE: withHelpCost(TF.leadfeast) HELPCALL-unset vs naked TF.leadfeast,
// identical seeds × 60d — game-true fields byte-identical.
// SMOKE: HELPCALL=1 armed stacks 20d — clean ends, cost block present.
const assert = require('assert');
const HCK = require('./policies/helpcost');
const TF = require('./policies/tribfloor');

let pass = 0;
function ok(name, fn) { try { fn(); pass++; console.log(`  ok ${pass} ${name}`); } catch (e) { console.error(`  FAIL ${name}: ${e.message}`); process.exitCode = 1; } }

// ---- fixture Game ----
function fakeGame() {
  const state = { scholar: { day: 5 }, village: { roster: ['vid1', 'vid2'], npcAbilities: { vid1: ['a', 'b'] } }, aidRunners: [] };
  let crisis = null;
  return {
    state,
    aidCrisis() { return crisis; },
    setCrisis(c) { crisis = c; },
    aidPartsFor() { return 2; },
    npcTemper() { return 'bold'; },
  };
}
function baseStub() {
  const rec = { calls: 0 };
  const p = { id: 'stub', daily(Game, ctx) { rec.calls++; return 'base'; } };
  return { p, rec };
}

// ---- RED: the gap the instrument fills ----
ok('RED: naked base on the fixture -> costSummary null (no cost accounting)', () => {
  const G = fakeGame();
  G.setCrisis({ kind: 'monster', name: 'Big Ugly', wave: 3, raiders: true, sinceDay: 5, calls: [], resolved: false });
  G.state.aidRunners.push({ vid: 'vid1', targetId: 'v9', phase: 'out', parts: 2, partsLeft: 2, mishap: null });
  const { p } = baseStub();
  p.daily(G, {});
  assert.strictEqual(HCK.costSummary(G), null, 'no instrument -> no summary');
});

// ---- GREEN: the instrument counts ----
ok('GREEN: apex episode census (wave-3 raid) counts once, sub-apex/non-raid/resolved ignored', () => {
  const G = fakeGame();
  const { p } = baseStub();
  const w = HCK.withHelpCost(p, 't', 't');
  G.setCrisis({ kind: 'monster', name: 'Big Ugly', wave: 3, raiders: true, sinceDay: 5, calls: [], resolved: false });
  w.daily(G, {});
  w.daily(G, {}); // same crisis object: still one episode, two crisis-days
  let s = HCK.costSummary(G);
  assert.strictEqual(s.apexRaidEpisodes, 1);
  assert.strictEqual(s.apexCrisisDays, 2);
  G.setCrisis({ kind: 'monster', name: 'Small', wave: 2, raiders: true, sinceDay: 6, calls: [], resolved: false });
  w.daily(G, {});
  G.setCrisis({ kind: 'monster', name: 'Door', wave: 4, raiders: false, sinceDay: 6, calls: [], resolved: false });
  w.daily(G, {});
  G.setCrisis({ kind: 'monster', name: 'Old', wave: 4, raiders: true, sinceDay: 4, calls: [], resolved: true });
  w.daily(G, {});
  s = HCK.costSummary(G);
  assert.strictEqual(s.apexRaidEpisodes, 1, 'only the wave>=3 raid crisis counts');
});

ok('GREEN: placement context records runner situation (parts/temper/abilities/danger)', () => {
  const G = fakeGame();
  const { p } = baseStub();
  const w = HCK.withHelpCost(p, 't', 't');
  G.state.hcLedger = { calls: [{ day: 5, wave: 3, tier: 'runner', ret: 'sent', targetId: 'v9', runner: 'vid1' }], verdicts: [] };
  G.state.aidRunners.push({ vid: 'vid1', targetId: 'v9', phase: 'out', parts: 2, partsLeft: 2, mishap: 'hurt' });
  w.daily(G, {});
  const s = HCK.costSummary(G);
  assert.strictEqual(s.placements, 1);
  const c = s.placementCtx[0];
  assert.strictEqual(c.parts, 2);
  assert.strictEqual(c.temper, 'bold');
  assert.strictEqual(c.abilities, 2);
  assert.strictEqual(c.danger, 0.18, 'engine formula 0.12+0.02*3');
  assert.strictEqual(c.mishap, 'hurt');
  assert.strictEqual(s.runnerDeaths.length, 0);
});

ok('GREEN: died placement -> aid-runner death with full situation', () => {
  const G = fakeGame();
  const { p } = baseStub();
  const w = HCK.withHelpCost(p, 't', 't');
  G.state.hcLedger = { calls: [{ day: 9, wave: 5, tier: 'runner', ret: 'died', targetId: 'v7', runner: 'vid2' }], verdicts: [] };
  w.daily(G, {});
  const s = HCK.costSummary(G);
  assert.strictEqual(s.runnerDeaths.length, 1);
  assert.strictEqual(s.runnerDeaths[0].wave, 5);
  assert.strictEqual(s.runnerDeaths[0].danger, 0.22, 'engine formula 0.12+0.02*5');
  assert.strictEqual(s.runnerDeaths[0].runner, 'vid2');
});

ok('GREEN: runner-away day windows — episode windows + finalize (day-parts live in the part census)', () => {
  const G = fakeGame();
  const { p } = baseStub();
  const w = HCK.withHelpCost(p, 't', 't');
  // day 5: runner out, no crisis
  G.state.aidRunners.push({ vid: 'vid1', targetId: 'v9', phase: 'out', parts: 3, partsLeft: 3, mishap: null });
  w.daily(G, {});
  // day 6: apex crisis active; day 7: runner home -> window finalized
  G.state.scholar.day = 6;
  G.setCrisis({ kind: 'monster', name: 'Big Ugly', wave: 4, raiders: true, sinceDay: 6, calls: [], resolved: false });
  w.daily(G, {});
  G.state.scholar.day = 7;
  G.state.aidRunners.length = 0;
  G.setCrisis(null);
  w.daily(G, {});
  const s = HCK.costSummary(G);
  assert.strictEqual(s.runnerTrips, 1);
  assert.strictEqual(s.tripWindows.length, 1);
  assert.deepStrictEqual([s.tripWindows[0].firstDay, s.tripWindows[0].lastDay], [5, 6]);
  assert.strictEqual(s.tripWindows[0].open, false);
});

ok('GREEN: per-part census counts engine-true away day-parts + the crisis subset', () => {
  const G = fakeGame();
  // fake commsTick mirroring the engine: partsLeft-- once per part, the
  // entry leaves the part it hits 0.
  G.commsTick = function () {
    const rs = this.state.aidRunners;
    for (let i = rs.length - 1; i >= 0; i--) {
      rs[i].partsLeft--;
      if (rs[i].partsLeft <= 0) rs.splice(i, 1);
    }
  };
  HCK.installPartCensus(G);
  assert.ok(G.commsTick.__hcPartWrapped, 'wrap installed');
  G.state.aidRunners.push({ vid: 'vid1', targetId: 'v9', phase: 'out', parts: 2, partsLeft: 2, mishap: null });
  G.commsTick(); // partsLeft 2->1, observed away (no crisis)
  G.setCrisis({ kind: 'monster', name: 'Big Ugly', wave: 4, raiders: true, sinceDay: 6, calls: [], resolved: false });
  G.commsTick(); // partsLeft 1->0, observed away + in-crisis
  G.commsTick(); // runner home: nothing observed
  const s = HCK.costSummary(G);
  assert.strictEqual(s.runnerAwayDayParts, 2, 'exactly the engine leg: 2 parts');
  assert.strictEqual(s.absenceCrisisDayParts, 1, 'only the second part was in-crisis');
  assert.strictEqual(s.runnerTrips, 0, 'day census never ran — no windows, and that is fine');
});

ok('GREEN: part census is install-once, pure (no state writes, no RNG)', () => {
  const G = fakeGame();
  G.commsTick = function () {};
  HCK.installPartCensus(G);
  const once = G.commsTick;
  HCK.installPartCensus(G);
  assert.strictEqual(G.commsTick, once, 'install-once');
  const before = JSON.stringify(Object.keys(G.state).sort());
  const realRandom = Math.random;
  Math.random = () => { throw new Error('RNG read by part census'); };
  try { G.commsTick(); } finally { Math.random = realRandom; }
  assert.strictEqual(JSON.stringify(Object.keys(G.state).sort()), before, 'no Game.state writes');
});

ok('GREEN: gate-off purity — no state writes, no RNG reads, base called once', () => {
  const G = fakeGame();
  const before = JSON.stringify(Object.keys(G.state).sort());
  const { p, rec } = baseStub();
  const w = HCK.withHelpCost(p, 't', 't');
  const realRandom = Math.random;
  Math.random = () => { throw new Error('RNG read by instrument'); };
  try { w.daily(G, {}); } finally { Math.random = realRandom; }
  assert.strictEqual(rec.calls, 1, 'base.daily called exactly once');
  assert.strictEqual(JSON.stringify(Object.keys(G.state).sort()), before, 'no Game.state writes (hcLedger not created)');
  assert.strictEqual(HCK.costSummary(G).placements, 0);
});

ok('GREEN: observe survives hostile reads (aidCrisis throws)', () => {
  const G = fakeGame();
  G.aidCrisis = () => { throw new Error('hostile'); };
  const { p } = baseStub();
  const w = HCK.withHelpCost(p, 't', 't');
  w.daily(G, {}); // must not throw
  assert.strictEqual(HCK.costSummary(G).apexRaidEpisodes, 0);
});

async function engineTrue() {
  const { loadGame, setupGame, quietLog, runDays } = require('./sim-harness');
  // E1: real Game, fixture raid crisis (havenRaidTick sets crisis.raiders in
  // real runs; the fixture sets it directly, documented) -> census counts it.
  {
    const { Game } = await loadGame({ seed: 970, mode: 'helpcost-proof', fullTelemetry: false });
    await setupGame(Game, null, 'courtship');
    const crisis = Game.raiseAidCrisis('Proof Raid', 4);
    assert.ok(crisis, 'raiseAidCrisis returns the crisis');
    crisis.raiders = true; // fixture: the raid-raised flag havenRaidTick sets
    const w = HCK.withHelpCost(TF.leadfeast, 'proof', 'proof');
    delete process.env.HELPCALL;
    w.daily(Game, {});
    const s = HCK.costSummary(Game);
    assert.strictEqual(s.apexRaidEpisodes, 1, 'engine-true apex episode counted');
    console.log(`  ok ${++pass} engine-true: apex census on the real Game`);
  }
  // E2: installPartCensus on the real Game -> engine-true away day-parts.
  {
    const { Game } = await loadGame({ seed: 970, mode: 'helpcost-proof', fullTelemetry: false });
    await setupGame(Game, null, 'courtship');
    const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
    assert.ok(vid, 'roster vid exists');
    HCK.installPartCensus(Game);
    // 'back' leg with 1 part left: the next commsTick walks the runner home
    // (entry spliced) — the honest return path, no fake village needed.
    Game.state.aidRunners = [{ vid, targetId: 'v1', phase: 'back', parts: 2, partsLeft: 1, mishap: null }];
    Game.commsTick();
    const s = HCK.costSummary(Game);
    assert.strictEqual(s.runnerAwayDayParts, 1, 'the final away part is counted');
    assert.strictEqual((Game.state.aidRunners || []).length, 0, 'runner returned');
    // and a fresh 2-part out leg counts 2 away parts across two ticks.
    Game.state.aidRunners = [{ vid, targetId: 'v1', phase: 'out', parts: 2, partsLeft: 2, mishap: null }];
    Game.commsTick();
    Game.commsTick();
    const s2 = HCK.costSummary(Game);
    assert.strictEqual(s2.runnerAwayDayParts, 3, '1 + 2 away parts total');
    console.log(`  ok ${++pass} engine-true: per-part away day-parts on the real Game`);
  }
  // DET-GATE: gate-off wrapper vs naked tribfloor, identical seeds x 60d.
  // The part census is installed on BOTH sides (it is sweep-harness code,
  // identical both sides) — this pins its neutrality too.
  async function gateFields(seed, policy) {
    const { Game } = await loadGame({ seed, mode: 'helpcost-gate', fullTelemetry: false });
    await setupGame(Game, null, 'courtship');
    HCK.installPartCensus(Game);
    let result;
    await quietLog(async () => { result = await runDays(Game, policy, { days: 60, manifest: { seed } }); });
    const deaths = (result.samples || {}).deaths || [];
    const cc = {};
    for (const d of deaths) cc[String((d && d.cause) || 'unknown')] = (cc[String((d && d.cause) || 'unknown')] || 0) + 1;
    let pg = {};
    try { pg = Game.progState ? Game.progState() : {}; } catch (e) {}
    const scaleRows = ((result.samples || {}).scale || []);
    return {
      endReason: result.endReason, gameDays: result.gameDays, nDeaths: deaths.length, causeCounts: cc,
      won: !!Game.won ? 1 : 0,
      national: scaleRows.some(r => r[1] === 'national' || r[1] === 'global') ? 1 : 0,
      table: (pg.tableWaiting || pg.tableDone) ? 1 : 0,
      maxWave: result.maxWaveUnlocked || 1,
    };
  }
  delete process.env.HELPCALL;
  for (const seed of [970, 971]) {
    const a = await gateFields(seed, HCK.withHelpCost(TF.leadfeast, 'gate', 'gate'));
    const b = await gateFields(seed, TF.leadfeast);
    assert.deepStrictEqual(a, b, `det-gate seed ${seed}: wrapped-control vs naked tribfloor byte-identical`);
    console.log(`  ok ${++pass} det-gate seed ${seed}: byte-identical (end=${a.endReason} gameDays=${a.gameDays} deaths=${a.nDeaths})`);
  }
  // SMOKE: armed stacks 20d, HELPCALL=1 — clean ends, cost block present.
  process.env.HELPCALL = '1';
  for (const [pid, pol] of [['leadfeast', HCK.leadCost], ['belongfeast', HCK.belongCost]]) {
    const { Game } = await loadGame({ seed: 970, mode: 'helpcost-smoke', fullTelemetry: false });
    await setupGame(Game, null, 'courtship');
    let result;
    await quietLog(async () => { result = await runDays(Game, pol, { days: 20, manifest: { seed: 970 } }); });
    const s = HCK.costSummary(Game);
    assert.ok(s && typeof s.apexRaidEpisodes === 'number', 'cost block present');
    assert.ok(['village-dead', 'village-lost', undefined].includes(result.endReason) || typeof result.endReason === 'string', 'clean end');
    console.log(`  ok ${++pass} SMOKE ${pid} 20d: end=${result.endReason} gameDays=${result.gameDays} cost=${JSON.stringify({ ep: s.apexRaidEpisodes, trips: s.runnerTrips })}`);
  }
  delete process.env.HELPCALL;
}

engineTrue().then(() => {
  console.log(`\nproof: ${pass} green, exit ${process.exitCode || 0}`);
}).catch(e => { console.error('FATAL', e); process.exit(1); });

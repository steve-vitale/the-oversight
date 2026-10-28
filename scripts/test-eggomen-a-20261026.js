#!/usr/bin/env node
// test-eggomen-a-20261026.js — P2 proof: the finale omen's scale leg.
//
// Pins the sim-eggomen-a variant (titans.js titanDawnTick): the FINALE's
// omen needs wave >= 5 + regional (was national); a nielsen cast keeps
// the national leg; herald, wave legs, dice, muster machinery untouched.
//
// Method: one loaded game, gate-input staging (the repo's own tests
// override Game.scaleRank the same way — see test-wave3-5-20261010.js).
// titanDawnTick reads Game.unlockedWave() / Game.scaleRank() at call time,
// so overriding those two inputs stages exactly what changed; every other
// titan machine (omen staging, advance, placement, muster, upkeep) runs
// real. Each negative case carries a positive control (the herald omen)
// so titanDawnTick's silent catch-all cannot mask a broken setup as a
// false "no omen" pass.
//
// Usage: node scripts/test-eggomen-a-20261026.js [SEED=88201]
// Writes nothing into the repo; stdout only. Exit 0 iff all checks pass.
'use strict';
const H = require('./sim-harness');
const SEED = parseInt(process.env.SEED || '88201', 10);

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

function omenOf(G, tid) {
  try { return ((G.state.titans || {}).omens || {})[tid] || null; } catch (e) { return null; }
}

// Tick dawn until tid's omen exists or maxTicks run out. Returns the
// tick count on appearance, or -1.
function daysToOmen(G, tid, maxTicks) {
  for (let i = 0; i < maxTicks; i++) {
    G.state.scholar.day = 100 + i;
    G.titanDawnTick();
    if (omenOf(G, tid)) return i + 1;
  }
  return -1;
}

function stage(G, wave, rank, apoc) {
  G.state.titans = { omens: {}, musters: {}, slain: {}, cast: { herald: 'herald', apocalypse: apoc } };
  G.state.scholar.day = 100;
  G.unlockedWave = () => wave;
  G.scaleRank = () => rank;
}

(async () => {
  const { Game: G } = await H.loadGame({ seed: SEED });
  await H.setupGame(G);
  try { G.depart(); } catch (e) {}
  const realScaleRank = G.scaleRank;
  const realUnlockedWave = G.unlockedWave;
  console.log('== EGGOMEN P2 PROOF, SEED ' + SEED + ' ==');

  // 1. P2-POS: finale, wave 5, regional -> omen appears.
  stage(G, 5, 'regional', 'finale');
  const d1 = daysToOmen(G, 'finale', 60);
  ok('P2 finale omen fires at wave 5 + regional', d1 > 0, 'no omen in 60 ticks');

  // 2. G3-unit: finale, wave 5, national -> omen appears (no regression
  // where national already held).
  stage(G, 5, 'national', 'finale');
  const d2 = daysToOmen(G, 'finale', 60);
  ok('G3 finale omen still fires at wave 5 + national', d2 > 0, 'no omen in 60 ticks');

  // 3. G2-unit: finale, wave 4, regional -> NO omen; herald control fires.
  stage(G, 4, 'regional', 'finale');
  const d3 = daysToOmen(G, 'finale', 200);
  const h3 = omenOf(G, 'herald');
  ok('G2 no finale omen below wave 5', d3 < 0, 'omen appeared at wave 4');
  ok('G2 control: herald omen fires at wave 4 + regional', !!h3, 'tick machinery dead');

  // 4. G4-unit: nielsen cast, wave 5, regional -> NO apocalypse omen;
  // herald control fires.
  stage(G, 5, 'regional', 'nielsen');
  const d4 = daysToOmen(G, 'nielsen', 200);
  const h4 = omenOf(G, 'herald');
  ok('G4 no nielsen-cast omen at regional (national leg kept)', d4 < 0, 'nielsen omen appeared');
  ok('G4 control: herald omen fires at wave 5 + regional', !!h4, 'tick machinery dead');

  // 5. Herald unchanged: wave 4, regional, herald cast -> herald appears.
  stage(G, 4, 'regional', 'herald');
  const d5 = daysToOmen(G, 'herald', 60);
  ok('herald omen unchanged at wave 4 + regional', d5 > 0, 'no herald omen in 60 ticks');

  // 6. Real gate functions (restored, not staged).
  G.scaleRank = realScaleRank;
  G.state.globalLive = false; G.state.nationalLive = false; G.state.networkLive = true;
  ok('real scaleRank: networkLive -> regional', G.scaleRank() === 'regional', 'got ' + G.scaleRank());
  G.state.networkLive = false; G.state.nationalLive = true;
  ok('real scaleRank: nationalLive -> national', G.scaleRank() === 'national', 'got ' + G.scaleRank());
  G.unlockedWave = realUnlockedWave;
  G.state.globalLive = false; G.state.nationalLive = false; G.state.networkLive = false;
  ok('real unlockedWave: fresh game below wave 5 (the wall)', G.unlockedWave() < 5, 'got ' + G.unlockedWave());

  console.log('== ' + pass + ' PASS, ' + fail + ' FAIL ==');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('PROOF ERROR', e && e.stack || e); process.exit(1); });

#!/usr/bin/env node
// scripts/test-scholarcare.js — proof of mechanism for the scholarcare layer
// (axis scale-onramp, sim-scholarcare 2026-10-20).
//
// PROVES:
//  1. RED: with SCHOLARCARE unset, careRound is a no-op (the base never tends
//     itself — the "base tends others, never the scholar" finding).
//  2. GREEN: with SCHOLARCARE=1, a sick/wounded wave-4 killer at Haven gets
//     self-care via honest engine verbs: folkRemedy fires on own sickness,
//     doAction('rest') heals own wounds, counters record the drive.
//  3. GATE: with SCHOLARCARE=1 but NO wave-4 kill, the drive stays off.
//  4. DET: with SCHOLARCARE unset, withScholarcare(base) runs byte-identical
//     trajectories to bare base (the wrapper is pure delegation when off).
//  5. WRAPPER: wrapped.upkeep fires the drive after base upkeep.
//
// Uses the shared sim kit (sim-harness), seeded RNG before eval. No stubs.
'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const SC = require('./policies/scholarcare');
const { competent } = require('./policies/competent');

const SEED = 424242;

function atHaven(Game) {
  try { return !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) { return false; }
}

async function fixture() {
  delete process.env.SCHOLARCARE;
  const { Game } = await loadGame({ seed: SEED, mode: 'scholarcare', fullTelemetry: false });
  await setupGame(Game);
  const ctx = {};
  return { Game, ctx };
}

async function makeSickWoundedKiller(Game) {
  // A real wave-4 kill in the engine's own log, by the scholar's vid.
  Game.recordWaveKill('influencer', Game.villagerId, 'player', null);
  // Mundane sickness via the single contraction path; honest wound via
  // the damage choke point; fed/watered so rest can rebuild tissue.
  const ok = Game.contractDisease('gutrot', {});
  assert.ok(ok, 'contractDisease(gutrot) must take');
  Game.addHealth(-40);
  Game.state.scholar.kcal = 2000;
  Game.state.scholar.hydration = 80;
  try { if (Game.fillWater) Game.fillWater(); } catch (e) {}
  try { if (Game.boilWater) Game.boilWater(); } catch (e) {}
}

async function main() {
  let pass = 0;
  const ok = (name, cond, extra) => {
    if (!cond) { console.error(`FAIL ${name}${extra ? ' — ' + extra : ''}`); process.exitCode = 1; }
    else { pass++; console.log(`ok ${pass} ${name}`); }
  };

  // ---- 1. RED: gate off -> the base never tends itself.
  {
    const { Game, ctx } = await fixture();
    await makeSickWoundedKiller(Game);
    const hpBefore = (Game.state.scholar.health || 100);
    const sickBefore = (Game.sickDiseases() || []).length;
    ok('red: scholar starts at Haven', atHaven(Game));
    ok('red: fixture is sick', sickBefore === 1, `sick=${sickBefore}`);
    ok('red: fixture is wounded', hpBefore < 85, `hp=${hpBefore}`);
    SC.careRound(Game, ctx);
    ok('red: gate-off careRound does nothing', ctx.scCareDays === undefined, JSON.stringify(ctx));
    ok('red: wounds untouched', (Game.state.scholar.health || 100) === hpBefore);
    ok('red: sickness untouched', (Game.sickDiseases() || []).length === sickBefore);
  }

  // ---- 2. GREEN: gate on -> self-care via honest verbs.
  {
    const { Game, ctx } = await fixture();
    await makeSickWoundedKiller(Game);
    process.env.SCHOLARCARE = '1';
    const hpBefore = (Game.state.scholar.health || 100);
    const e0 = (Game.sickDiseases() || [])[0] || {};
    const dpBefore = e0.dayPartsLeft || 0;
    ok('green: killer gate recognized', SC.scholarKilledWave4(Game));
    SC.careRound(Game, ctx);
    ok('green: drive fired', ctx.scCareDays === 1, `scCareDays=${ctx.scCareDays}`);
    ok('green: sick day counted', ctx.scSickDays === 1);
    ok('green: wounded day counted', ctx.scWoundedDays === 1);
    const folkTotal = (ctx.scFolkFluids || 0) + (ctx.scFolkTea || 0) + (ctx.scFolkRest || 0);
    ok('green: folk remedy tried on self', folkTotal === 1, JSON.stringify(ctx));
    ok('green: rest taken for wounds', ctx.scRests === 1, `scRests=${ctx.scRests}`);
    const hpAfter = (Game.state.scholar.health || 100);
    ok('green: rest healed the scholar', hpAfter > hpBefore, `hp ${hpBefore} -> ${hpAfter}`);
    const e1 = (Game.sickDiseases() || [])[0];
    const eased = !e1 || (e1.dayPartsLeft || 0) <= dpBefore;
    ok('green: sickness eased or cured by own hands', eased,
      `dayPartsLeft ${dpBefore} -> ${e1 ? e1.dayPartsLeft : 'cured'}`);
    delete process.env.SCHOLARCARE;
  }

  // ---- 3. GATE: no wave-4 kill -> drive stays off even with SCHOLARCARE=1.
  {
    const { Game, ctx } = await fixture();
    process.env.SCHOLARCARE = '1';
    Game.addHealth(-40);
    Game.contractDisease('gutrot', {});
    SC.careRound(Game, ctx);
    ok('gate: non-killer gets no self-care drive', ctx.scCareDays === undefined,
      JSON.stringify(ctx));
    delete process.env.SCHOLARCARE;
  }

  // ---- 4. DET: gate-off wrapper is byte-identical to bare base.
  {
    const runTraj = async (policy, seed) => {
      const { Game } = await loadGame({ seed, mode: 'scholarcare', fullTelemetry: false });
      await setupGame(Game);
      const hashes = [];
      const p2 = Object.assign({}, policy);
      const oDaily = policy.daily;
      p2.daily = (G, cx) => {
        let r;
        if (oDaily) { try { r = oDaily(G, cx); } catch (e) {} }
        try { hashes.push((G.state.scholar.day | 0) + ':' + dayHash(G)); } catch (e) {}
        return r;
      };
      await quietLog(async () => { await runDays(Game, p2, { days: 60, sampleEvery: 30 }); });
      return hashes;
    };
    delete process.env.SCHOLARCARE;
    const wrapped = SC.withScholarcare(competent, 'sc-det', 'competent + scholarcare (off)');
    const hBare = await runTraj(competent, 99);
    const hWrap = await runTraj(wrapped, 99);
    ok('det: gate-off wrapper byte-identical to bare base',
      JSON.stringify(hBare) === JSON.stringify(hWrap),
      `bare=${hBare.length} wrapped=${hWrap.length}`);
  }

  // ---- 5. WRAPPER: wrapped.upkeep fires the drive after base upkeep.
  {
    const { Game, ctx } = await fixture();
    await makeSickWoundedKiller(Game);
    process.env.SCHOLARCARE = '1';
    const wrapped = SC.withScholarcare(competent, 'sc-up', 'competent + scholarcare');
    await quietLog(async () => { try { wrapped.upkeep(Game, ctx); } catch (e) { assert.fail('upkeep threw: ' + e.message); } });
    ok('wrapper: drive fired through upkeep', ctx.scCareDays === 1, `scCareDays=${ctx.scCareDays}`);
    delete process.env.SCHOLARCARE;
  }

  console.log(`\n${process.exitCode ? 'FAILED' : 'ALL GREEN'} (${pass} checks)`);
}

main().catch(e => { console.error('HARNESS ERROR:', e && e.stack); process.exit(1); });

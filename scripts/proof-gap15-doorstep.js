#!/usr/bin/env node
// proof-gap15-doorstep.js — gap-batch item 15: r88's HAVEN-DOORSTEP step
// rescued scholars (31 of 32 triggered steps ate) but only ever looked at
// the scholar — non-scholars had no classifier and no rescue. This tree
// ports the step into competent.js (doorstepStep, end of daily) with a
// villager branch sharing the same enter-hall + pantry-take path: a living
// villager AT Haven with the scholar (not away), hunger >= 70, gets a
// giveFood 'meal', pantry-funded when the pack is thin, once the scholar
// holds >= 500 kcal (keepPromiseFood's floor).
//
// Parts: (a) fake-Game fixture for both branches and every skip (away,
// not-hungry, no food, leader floor, tent); (b) live forced step per seed
// (fresh game, scholar outside + starving, one villager at hunger 95 ->
// scholar ate AND villager fed); (c) natural runDays panel on identical
// seeds/days, before (master competent.js: no doorstepStep at all) vs
// after, counting doorstep triggers/ate/fed and needy villager-days
// (present + hunger >= 70 at daily time) as the denominator check.
//
// Usage: node scripts/proof-gap15-doorstep.js
//   SEEDS=85101,85102 DAYS=30 node scripts/proof-gap15-doorstep.js
//   POLICY_FILE=<path> PROOF_ARM=after node scripts/proof-gap15-doorstep.js
//     (child mode: prints one JSON line to stdout, progress to stderr)
// Writes nothing into the repo.
'use strict';
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const MAIN_REPO = path.resolve(REPO, '..', '..', 'the-scattering');
const POLICY_AFTER = path.join(REPO, 'scripts', 'policies', 'competent.js');
const POLICY_BEFORE = path.join(MAIN_REPO, 'scripts', 'policies', 'competent.js');
const SEEDS = (process.env.SEEDS || '85101,85102,85103,85104').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '30', 10) || 30;

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

function food(name, kcalEach, units, foodState) {
  return { name, kcalEach, units, foodState: foodState || 'cooked' };
}

function fakeGame(opts) {
  const scholar = {
    kcal: opts.kcal, hydration: opts.hyd, insideHaven: !!opts.inside, insideTent: !!opts.tent,
    inventory: (opts.pack || []).map(i => Object.assign({}, i)), water: (opts.water || []).slice(),
  };
  const pantry = (opts.pantry || []).map(i => Object.assign({}, i));
  const hunger = Object.assign({}, opts.hunger || {});
  const village = { roster: opts.roster, pantry, away: opts.away || {}, assignments: {} };
  const Game = {
    over: false, villagerId: 'scholar',
    map: { px: 4, py: 4 },
    state: { scholar, village },
    getPerson: (id) => ({ id, dead: false }),
    npcNeeds: (id) => ({ hunger: hunger[id] || 0 }),
    playerAtHaven: () => true,
    inCombat: () => false,
    kcalCap: () => 2000,
    isSpoiled: () => false,
    havenStoresAccess: () => (scholar.insideHaven ? 'inside' : 'none'),
    playerTile: () => ({ type: 'haven' }),
    enterBuilding: () => { if (scholar.insideHaven || scholar.insideTent) return false; scholar.insideHaven = true; return true; },
    takeFromPantry: (i) => {
      const it = pantry[i];
      if (!it || it.units <= 0) return;
      it.units -= 1;
      const ex = scholar.inventory.find(x => x.name === it.name);
      if (ex) ex.units += 1; else scholar.inventory.push(Object.assign({}, it, { units: 1 }));
      if (it.units <= 0) pantry.splice(i, 1);
    },
    eat: () => {
      const it = scholar.inventory.find(x => (x.kcalEach || 0) > 0 && (x.units || 0) > 0 && x.edible !== false);
      if (!it) return;
      it.units -= 1; scholar.kcal += it.kcalEach;
      scholar.inventory = scholar.inventory.filter(x => x.units > 0);
    },
    fillWater: () => { scholar.water.push({ units: 1 }); },
    boilWater: () => {},
    doAction: (a) => { if (a === 'drink' && scholar.water.length) { scholar.water.pop(); scholar.hydration = Math.min(100, scholar.hydration + 40); } },
    giveFood: (vid) => {
      let units = 0, taken = 0;
      for (const it of scholar.inventory) {
        if (taken >= 3) break;
        if ((it.kcalEach || 0) <= 0 || (it.units || 0) <= 0) continue;
        const take = Math.min(it.units, 3 - taken);
        it.units -= take; taken += take;
      }
      scholar.inventory = scholar.inventory.filter(x => x.units > 0);
      if (taken === 0) return null;
      hunger[vid] = Math.max(0, (hunger[vid] || 0) - 60);
      return { ok: true, units: taken };
    },
    say: () => {},
  };
  return { Game, scholar, pantry, hunger };
}

function runFixture() {
  console.log('== fixture: doorstepStep branches + skips (fake Game) ==');
  const after = require(POLICY_AFTER);
  check('after policy exports doorstepStep', typeof after.doorstepStep === 'function');
  const beforeSrc = fs.existsSync(POLICY_BEFORE) ? fs.readFileSync(POLICY_BEFORE, 'utf8') : '';
  check('before policy has no doorstep step', beforeSrc && !beforeSrc.includes('doorstepStep') && !beforeSrc.includes('HAVEN-DOORSTEP'),
    beforeSrc ? 'before file unexpectedly contains a doorstep step' : 'before policy file not found at ' + POLICY_BEFORE);
  if (typeof after.doorstepStep !== 'function') return;
  const D = after.doorstepStep;
  {
    const ctx = {};
    const { Game, scholar, hunger } = fakeGame({
      kcal: 100, hyd: 10, inside: false, pack: [food('Trail mix', 400, 2)], pantry: [food('Stew', 500, 5)],
      roster: ['scholar', 'v1', 'v2', 'v3'], hunger: { v1: 95, v2: 20, v3: 95 }, away: { v3: true }, water: [],
    });
    D(Game, ctx);
    check('scholar branch: hungry outsider eats + drinks', scholar.kcal > 100 && scholar.hydration > 10 && ctx.doorstepScholarTrig === 1 && ctx.doorstepScholarAte === 1 && ctx.doorstepScholarDrank === 1,
      `kcal=${scholar.kcal} hyd=${scholar.hydration} ctx=${JSON.stringify(ctx)}`);
    check('villager branch: hungry present villager fed, others untouched', hunger.v1 < 95 && hunger.v2 === 20 && hunger.v3 === 95 && ctx.doorstepVillagerTrig === 1 && ctx.doorstepVillagerFed === 1,
      `hunger=${JSON.stringify(hunger)} ctx=${JSON.stringify(ctx)}`);
  }
  {
    // No food anywhere: the scholar gains nothing, stays under the 500
    // floor, and the villager branch stops at the leader floor before it
    // ever reaches the no-food count — hungers unchanged either way.
    const ctx = {};
    const { Game, scholar, hunger } = fakeGame({
      kcal: 100, hyd: 50, inside: false, pack: [], pantry: [],
      roster: ['scholar', 'v1'], hunger: { v1: 95 },
    });
    D(Game, ctx);
    check('no food anywhere: scholar noGain, leader floor stops villager branch, hungers unchanged', scholar.kcal === 100 && hunger.v1 === 95 && ctx.doorstepScholarNoGain === 1 && ctx.doorstepVillagerSkippedLeader === 1 && !ctx.doorstepVillagerFed,
      `kcal=${scholar.kcal} ctx=${JSON.stringify(ctx)}`);
  }
  {
    // Fed scholar, empty pack and pantry: the villager branch reaches its
    // own no-food count.
    const ctx = {};
    const { Game, scholar, hunger } = fakeGame({
      kcal: 1900, hyd: 80, inside: true, pack: [], pantry: [],
      roster: ['scholar', 'v1'], hunger: { v1: 95 },
    });
    D(Game, ctx);
    check('fed scholar, no food at hand: villager noFood counted, hunger unchanged', hunger.v1 === 95 && ctx.doorstepVillagerNoFood === 1 && !ctx.doorstepVillagerFed,
      `hunger=${JSON.stringify(hunger)} ctx=${JSON.stringify(ctx)}`);
  }
  {
    const ctx = {};
    const { Game, scholar, hunger } = fakeGame({
      kcal: 1900, hyd: 80, inside: true, pack: [food('Trail mix', 400, 2)], pantry: [food('Stew', 500, 5)],
      roster: ['scholar', 'v1'], hunger: { v1: 95 },
    });
    D(Game, ctx);
    check('fed scholar: scholar branch silent, villager still fed', !ctx.doorstepScholarTrig && hunger.v1 < 95 && ctx.doorstepVillagerFed === 1,
      `hunger=${JSON.stringify(hunger)} ctx=${JSON.stringify(ctx)}`);
  }
  {
    const ctx = {};
    const { Game, scholar, hunger } = fakeGame({
      kcal: 400, hyd: 80, inside: true, pack: [food('Trail mix', 400, 2)], pantry: [],
      roster: ['scholar', 'v1'], hunger: { v1: 95 },
    });
    D(Game, ctx);
    check('leader floor: scholar under 500 kcal keeps pack, villager not fed', scholar.kcal === 400 && hunger.v1 === 95 && ctx.doorstepVillagerSkippedLeader === 1 && !ctx.doorstepVillagerFed,
      `kcal=${scholar.kcal} hunger=${JSON.stringify(hunger)} ctx=${JSON.stringify(ctx)}`);
  }
  {
    const ctx = {};
    const { Game, scholar, hunger } = fakeGame({
      kcal: 1500, hyd: 80, inside: false, tent: true, pack: [food('Trail mix', 400, 3)], pantry: [food('Stew', 500, 5)],
      roster: ['scholar', 'v1'], hunger: { v1: 95 },
    });
    D(Game, ctx);
    check('tent: scholar branch skipped (no hall from a tent), villager fed from pack', !ctx.doorstepScholarTrig && scholar.insideHaven === false && hunger.v1 < 95 && ctx.doorstepVillagerFed === 1,
      `inside=${scholar.insideHaven} hunger=${JSON.stringify(hunger)} ctx=${JSON.stringify(ctx)}`);
  }
}

async function runLiveForced(arm, policyFile) {
  console.log(`== live forced step per seed (${arm}) ==`);
  const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const pol = require(policyFile);
  const out = [];
  for (const seed of SEEDS) {
    if (arm === 'before') { out.push({ seed, note: 'no doorstepStep export in before policy' }); continue; }
    const { Game } = await loadGame({ seed, mode: 'gap15-proof', fullTelemetry: false });
    await setupGame(Game);
    const s = Game.state.scholar || {};
    s.insideHaven = false; s.kcal = 100; s.hydration = 50;
    const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
    let hungerBefore = null;
    try { hungerBefore = Game.npcNeeds(vid).hunger; Game.npcNeeds(vid).hunger = 95; } catch (e) {}
    const ctx = {};
    pol.doorstepStep(Game, ctx);
    let hungerAfter = null;
    try { hungerAfter = Game.npcNeeds(vid).hunger; } catch (e) {}
    out.push({ seed, vid, scholarKcalBefore: 100, scholarKcalAfter: s.kcal, hungerBefore: 95, hungerAfter, ctx });
    console.log(`  seed ${seed}: scholar kcal 100->${s.kcal} villager hunger 95->${hungerAfter} ctx=${JSON.stringify(ctx)}`);
  }
  return out;
}

async function runPanelChild(arm, policyFile) {
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const pol = require(policyFile);
  const base = pol.competent;
  const rows = [];
  for (const seed of SEEDS) {
    const { Game } = await loadGame({ seed, mode: 'gap15-panel', fullTelemetry: false });
    await setupGame(Game);
    let seenCtx = null, needyDays = 0;
    const sampleNeedy = (Gm) => {
      try {
        const v = Gm.state.village || {};
        for (const id of (v.roster || [])) {
          if (id === Gm.villagerId) continue;
          let person = null;
          try { person = Gm.getPerson(id); } catch (e) {}
          if (!person || person.dead) continue;
          if (v.away && v.away[id]) continue;
          let h = 0;
          try { h = (Gm.npcNeeds(id) || {}).hunger || 0; } catch (e) {}
          if (h >= 70) needyDays++;
        }
      } catch (e) {}
    };
    const wrapped = Object.assign({}, base, {
      upkeep(Gm, ctx) { seenCtx = ctx; return base.upkeep(Gm, ctx); },
      daily(Gm, ctx) { seenCtx = ctx; sampleNeedy(Gm); const r = base.daily(Gm, ctx); return r; },
    });
    let result = null;
    await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS }); });
    const starvDeaths = ((result.samples || {}).deaths || []).filter(d => /starv|hunger|kcal/i.test(d.cause || '')).length;
    const c = seenCtx || {};
    rows.push({
      seed, endReason: result.endReason, gameDays: result.gameDays,
      needyVillagerDays: needyDays,
      scholarTrig: c.doorstepScholarTrig || 0, scholarAte: c.doorstepScholarAte || 0, scholarNoGain: c.doorstepScholarNoGain || 0,
      villagerTrig: c.doorstepVillagerTrig || 0, villagerFed: c.doorstepVillagerFed || 0, villagerNoGain: c.doorstepVillagerNoGain || 0,
      starvDeaths,
    });
    console.error(`  [${arm}] seed ${seed} done: ${JSON.stringify(rows[rows.length - 1])}`);
  }
  return { arm, seeds: SEEDS, days: DAYS, rows };
}

(async () => {
  const arm = process.env.PROOF_ARM;
  if (arm) {
    const policyFile = process.env.POLICY_FILE || (arm === 'before' ? POLICY_BEFORE : POLICY_AFTER);
    const out = await runPanelChild(arm, policyFile);
    console.log(JSON.stringify(out));
    return;
  }
  runFixture();
  const forced = await runLiveForced('after', POLICY_AFTER);
  check('live forced: scholar ate on every seed', forced.every(r => r.scholarKcalAfter > 100),
    JSON.stringify(forced.map(r => `${r.seed}:${r.scholarKcalAfter}`)));
  check('live forced: villager fed on every seed (hunger fell)', forced.every(r => r.hungerAfter < 95),
    JSON.stringify(forced.map(r => `${r.seed}:${r.hungerAfter}`)));
  check('live forced: ctx counts show trig+fed on every seed', forced.every(r => r.ctx.doorstepScholarTrig === 1 && r.ctx.doorstepScholarAte === 1 && r.ctx.doorstepVillagerTrig >= 1 && r.ctx.doorstepVillagerFed >= 1),
    JSON.stringify(forced.map(r => JSON.stringify(r.ctx))));
  const runArm = (a) => {
    const env = Object.assign({}, process.env, { PROOF_ARM: a, POLICY_FILE: a === 'before' ? POLICY_BEFORE : POLICY_AFTER });
    const r = spawnSync(process.execPath, [__filename], { cwd: REPO, env, encoding: 'utf8' });
    if (r.status !== 0) {
      console.log(r.stdout || '');
      console.log(r.stderr || '');
      throw new Error(`panel child ${a} exited ${r.status}`);
    }
    const lines = (r.stdout || '').trim().split('\n').filter(Boolean);
    return JSON.parse(lines[lines.length - 1]);
  };
  console.log(`== natural panel: ${SEEDS.length} seeds x ${DAYS} days, before vs after ==`);
  const before = runArm('before');
  const after = runArm('after');
  const sum = (rows, k) => rows.reduce((t, r) => t + (r[k] || 0), 0);
  console.log(`  BEFORE needyDays=${sum(before.rows, 'needyVillagerDays')} scholarTrig=${sum(before.rows, 'scholarTrig')} villagerTrig=${sum(before.rows, 'villagerTrig')} starvDeaths=${sum(before.rows, 'starvDeaths')}`);
  console.log(`  AFTER  needyDays=${sum(after.rows, 'needyVillagerDays')} scholarTrig=${sum(after.rows, 'scholarTrig')} scholarAte=${sum(after.rows, 'scholarAte')} villagerTrig=${sum(after.rows, 'villagerTrig')} villagerFed=${sum(after.rows, 'villagerFed')} starvDeaths=${sum(after.rows, 'starvDeaths')}`);
  for (const r of after.rows) console.log(`  AFTER seed ${r.seed}: needy=${r.needyVillagerDays} scholar ${r.scholarAte}/${r.scholarTrig} villager ${r.villagerFed}/${r.villagerTrig} end=${r.endReason} starvDeaths=${r.starvDeaths}`);
  for (const r of before.rows) console.log(`  BEFORE seed ${r.seed}: needy=${r.needyVillagerDays} scholar ${r.scholarAte}/${r.scholarTrig} villager ${r.villagerFed}/${r.villagerTrig} end=${r.endReason} starvDeaths=${r.starvDeaths}`);
  check('panel: before has no doorstep step at all', sum(before.rows, 'scholarTrig') === 0 && sum(before.rows, 'villagerTrig') === 0);
  const st = sum(after.rows, 'scholarTrig'), sa = sum(after.rows, 'scholarAte');
  if (st > 0) check('panel: scholar ate rate >= 90% of triggered (r88 bar: 31/32)', sa / st >= 0.9, `${sa}/${st}`);
  else console.log('  (panel scholar triggers 0 — scholar rate carried by the forced step, not this panel)');
  const vt = sum(after.rows, 'villagerTrig'), vf = sum(after.rows, 'villagerFed');
  if (vt > 0) check('panel: villager fed rate >= 90% of triggered (comparable to scholar 31/32)', vf / vt >= 0.9, `${vf}/${vt}`);
  else console.log('  (panel villager triggers 0 — villager rate carried by the forced step, not this panel)');
  console.log(`\nproof-gap15-doorstep: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e && e.stack); process.exit(1); });

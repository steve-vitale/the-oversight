#!/usr/bin/env node
// scripts/test-tributerhythm-b.js — proof for the TRIBUTE-RHYTHM gate
// (fleshout loop B, 2026-10-19, arm sim-tributerhythm-b).
//
// RED (neutrality / determinism):
//   R1: TRIBUTERHYTHM unset — leadrhythm/belongrhythm delegate byte-identical
//       to leadfeast/belongfeast (outcome vectors + pantry series identical).
//   R2: TRIBUTERHYTHM=1 — 8 configs x 2 runs bit-identical (ON-side
//       determinism; the gate itself draws no RNG).
// GREEN (mechanism):
//   G1: staged feastPlan wrapper — fragile pantry + tribute-armed
//       contribution -> plan refused, trBlocked=1; donation-armed ->
//       passes; env unset -> pure delegation.
//   G2: full-run before/after on identical seeds — ON diverges from OFF
//       only through blocked feasts (trBlocked==0 runs are bit-identical;
//       blocked runs show fewer-or-equal feasts and the held kcal).
//
// Harness rules: seed Math.random BEFORE eval (loadGame does it), never stub
// Game.save, one harness per process (sequential runs here).
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const FS = require('./policies/feastscale');
const TR = require('./policies/tributerhythm');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function setEnv(v) {
  if (v) process.env.TRIBUTERHYTHM = '1'; else delete process.env.TRIBUTERHYTHM;
  process.env.FEASTSCALE_R13 = '1';
}

async function oneRun(seed, policy, days) {
  const { Game } = await loadGame({ seed, mode: 'tributerhythm-proof' });
  await setupGame(Game);
  let runCtx = null;
  const p = Object.assign({}, policy);
  const oSetup = policy.setup;
  p.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
  let result;
  await quietLog(async () => { result = await runDays(Game, p, { days, manifest: undefined, sampleEvery: 10 }); });
  const deaths = (result.samples.deaths || []).map(d => `${d.day}:${d.cause || d.kind}`).sort();
  const v = Game.state.village || {};
  const out = {
    days: result.days, endReason: result.endReason,
    hungryDays: v.hungryDays || 0, starveDeaths: deaths.filter(d => /starv/i.test(d)).length,
    deaths, wave: result.maxWaveUnlocked || 1,
    feasts: (runCtx && (runCtx.fsFeasts || runCtx.feasts)) || 0,
    trBlocked: (runCtx && runCtx.trBlocked) || 0,
    trArmedFragile: (runCtx && runCtx.trArmedFragile) || 0,
  };
  // pantry series fingerprint (every 10d)
  out.pantry = (result.samples.pantry || []).map(s => Math.round(s[1] || 0)).join(',');
  return out;
}
const vec = o => [o.days, o.endReason, o.hungryDays, o.starveDeaths, o.wave, o.feasts, o.pantry].join('|');

async function main() {
  console.log('== RED R1: OFF delegation pin (TRIBUTERHYTHM unset) ==');
  setEnv(false);
  for (const [armedPid, basePid, armed, base] of [
    ['leadrhythm', 'leadfeast', TR.leadrhythm, FS.leadfeast],
    ['belongrhythm', 'belongfeast', TR.belongrhythm, FS.belongfeast],
  ]) {
    for (const seed of [11, 22]) {
      const a = await oneRun(seed, armed, 40);
      const b = await oneRun(seed, base, 40);
      ok(`R1 ${armedPid}==${basePid} seed ${seed} (40d)`, vec(a) === vec(b) && a.trBlocked === 0,
        `armed=${vec(a).slice(0, 60)} base=${vec(b).slice(0, 60)}`);
    }
  }

  console.log('== RED R2: ON determinism (TRIBUTERHYTHM=1, 8 configs x 2) ==');
  setEnv(true);
  for (const [pid, pol] of [['leadrhythm', TR.leadrhythm], ['belongrhythm', TR.belongrhythm]]) {
    for (const seed of [11, 22, 33, 44]) {
      const a = await oneRun(seed, pol, 40);
      const b = await oneRun(seed, pol, 40);
      ok(`R2 ${pid} seed ${seed} bit-identical`, vec(a) === vec(b) && JSON.stringify(a.deaths) === JSON.stringify(b.deaths),
        `run1=${vec(a).slice(0, 50)} run2=${vec(b).slice(0, 50)}`);
    }
  }

  console.log('== GREEN G1: staged gate decisions ==');
  setEnv(true);
  {
    const { Game } = await loadGame({ seed: 11, mode: 'tributerhythm-g1' });
    await setupGame(Game);
    const day = (Game.state.scholar || {}).day || 0;
    const ctx = {};
    // stage: fragile pantry (strip it to crumbs)
    try {
      const v = Game.state.village || {};
      for (const it of (v.pantry || [])) { it.units = 0; }
    } catch (e) {}
    let fd = 999;
    try { fd = Game.pantryFreshDays(); } catch (e) {}
    ok('G1a pantry staged fragile (freshDays<3)', fd < 3, `freshDays=${fd}`);
    // stage: tribute-armed contribution (tribute paid, no donations)
    ctx._tribHist = [{ day, kcal: 2000 }];
    ctx._givesHist = [{ day: day - 7, g: 0 }];
    try { (Game.state.village.gives = Game.state.village.gives || {})[Game.villagerId] = 0; } catch (e) {}
    const d1 = TR.gateDecision(Game, ctx);
    ok('G1b tribute-armed+fragile -> blocked', d1.blocked === true && d1.trib >= 1500 && d1.gives < 1500,
      JSON.stringify({ blocked: d1.blocked, gives: d1.gives, trib: d1.trib }));
    // the wrapper refuses the plan
    const restore = TR.wrapFeastPlan(Game, ctx);
    const plan = Game.feastPlan();
    ok('G1c feastPlan wrapper refuses (ok=false), trBlocked=1',
      plan && plan.ok === false && ctx.trBlocked === 1, `ok=${plan && plan.ok} trBlocked=${ctx.trBlocked}`);
    restore();
    // donation-armed passes while fragile
    const ctx2 = { _tribHist: [{ day, kcal: 2000 }], _givesHist: [{ day: day - 7, g: 0 }] };
    try { Game.state.village.gives[Game.villagerId] = 2000; } catch (e) {}
    const d2 = TR.gateDecision(Game, ctx2);
    ok('G1d donation-armed+fragile -> NOT blocked', d2.blocked === false && d2.gives >= 1500,
      JSON.stringify({ blocked: d2.blocked, gives: d2.gives }));
    // healthy pantry: tribute rhythm counts again
    setEnv(true);
    const ctx3 = { _tribHist: [{ day, kcal: 2000 }], _givesHist: [{ day: day - 7, g: 0 }] };
    try {
      Game.state.village.gives[Game.villagerId] = 0;
      (Game.state.village.pantry || []).push({ name: 'smoked meat x40', units: 40, kcalEach: 2500, foodState: 'smoked', foodKind: 'meat' });
    } catch (e) {}
    let fd3 = 0;
    try { fd3 = Game.pantryFreshDays(); } catch (e) {}
    const d3 = TR.gateDecision(Game, ctx3);
    ok('G1e not-fragile (freshDays>=3) -> NOT blocked', d3.blocked === false && d3.fragile === false,
      `fragile=${d3.fragile} fresh=${(+fd3).toFixed(1)}`);
    // env unset: wrapper delegates to the real plan
    setEnv(false);
    const ctx4 = { _tribHist: [{ day, kcal: 2000 }], _givesHist: [{ day: day - 7, g: 0 }] };
    const restore4 = TR.wrapFeastPlan(Game, ctx4);
    let threw = false, plan4 = null;
    try { plan4 = Game.feastPlan(); } catch (e) { threw = true; }
    restore4();
    ok('G1f env unset -> wrapper delegates (no refusal, no throw)',
      !threw && !(plan4 && plan4.why && /tribute-rhythm/.test(plan4.why)) && (ctx4.trBlocked || 0) === 0,
      `threw=${threw} why=${plan4 && plan4.why}`);
  }

  console.log('== GREEN G2: ON diverges from OFF only through blocked feasts (40d) ==');
  for (const [pid, armed, base] of [['lead', TR.leadrhythm, FS.leadfeast], ['belong', TR.belongrhythm, FS.belongfeast]]) {
    for (const seed of [11, 22, 33, 44]) {
      setEnv(false);
      const c = await oneRun(seed, base, 40);
      setEnv(true);
      const a = await oneRun(seed, armed, 40);
      if (a.trBlocked === 0) {
        ok(`G2 ${pid} seed ${seed}: no blocks -> bit-identical`, vec(a) === vec(c),
          `armed=${vec(a).slice(0, 50)} control=${vec(c).slice(0, 50)}`);
      } else {
        ok(`G2 ${pid} seed ${seed}: ${a.trBlocked} blocked -> feasts held (${a.feasts}<=${c.feasts})`,
          a.feasts <= c.feasts, `armed feasts=${a.feasts} control=${c.feasts}`);
      }
    }
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });

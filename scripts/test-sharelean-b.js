#!/usr/bin/env node
// test-sharelean-b.js — proof for the share_surplus lean valve (sim-sharelean-b).
//
// RED:  SHARELEAN unset -> wrapped policy is byte-identical to the base policy
//       (2 seeds x 2 policies, 40d: trajectory rows + say-stream + deaths).
//       SHARELEAN=1 without FEASTSCALE_R13=1 -> loud SHARELEAN STOP.
// GREEN: layer reports on; lean trigger (stocked pantry not lean, drained
//       pantry lean); valve engages on lean days and re-tags the funnel
//       (armed stockSurplus calls == 0 vs control > 0, moved kcal > 0);
//       no leaked wraps; armed side deterministic; trust restored.
// SMOKE: the live-run checks prove the layer is LIVE, not silently gated.
// SENSE: prints the valve's voice lines from a lean run for human reading.
//
// Usage: FEASTSCALE_R13=1 node scripts/test-sharelean-b.js
'use strict';
const { execSync } = require('child_process');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const SL = require('./policies/sharelean');
const { belongsharelean, leadsharelean } = SL;
const { belongfeast, leadfeast } = require('./policies/feastscale');

const BASE_SHA = execSync('git rev-parse --short HEAD', { cwd: __dirname }).toString().trim();
const SEEDS = [5201, 5202];
const DAYS = 40;
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  const v = (Game.state || {}).village || {};
  return ((v.pantry || [])).reduce((t, it) => t + (it.kcalEach || 0) * (it.units || 1), 0);
}

// runCfg: one 40d run with trajectory + say capture. opts: {policy, seed,
// drainAtDay} — drainAtDay empties the pantry at the start of that loop-day
// (forced-lean); stockFirst pre-stocks the pantry (forced-fat start).
async function runCfg(policy, seed, opts) {
  opts = opts || {};
  const savedSharelean = process.env.SHARELEAN;
  try {
    if (opts.sharelean) process.env.SHARELEAN = '1'; else delete process.env.SHARELEAN;
    const { Game } = await loadGame({ seed, mode: 'test-sharelean-b', fullTelemetry: false });
    await setupGame(Game);
    if (opts.stockFirst) Game.stockPantry(opts.stockFirst, 'Foraged food');
    const rec = { rows: [], dayMeta: [], deaths: 0, says: [], surCalls: 0, panCalls: 0 };
    const oTele = Game.tele;
    Game.tele = function (t, d) {
      let r; try { r = oTele.apply(this, arguments); } catch (e) { throw e; }
      try { if (t === 'death') rec.deaths++; } catch (e) {}
      return r;
    };
    const oSay = Game.say;
    Game.say = function (m) { try { rec.says.push(String(m)); } catch (e) {} return oSay.apply(this, arguments); };
    const oSur = Game.stockSurplus, oPan = Game.stockPantry;
    Game.stockSurplus = function () { rec.surCalls++; return oSur.apply(this, arguments); };
    Game.stockPantry = function () { rec.panCalls++; return oPan.apply(this, arguments); };
    const P = Object.assign({}, policy);
    const origDaily = policy.daily;
    const ctxSeen = {};
    P.daily = (G, ctx) => {
      Object.assign(ctxSeen, { evals: ctx._slEvals || 0, arms: ctx._slArms || 0, moved: ctx._slMovedKcal || 0, valveDays: ctx._slValveDays || 0, lean: !!ctx._slLeanDay });
      if (opts.drainAtDay && dayOf(G) + 1 === opts.drainAtDay) {
        try { G.state.village.pantry = []; G.state.village.pantryKcal = 0; } catch (e) {}
      }
      const r = origDaily(G, ctx);
      Object.assign(ctxSeen, { evals: ctx._slEvals || 0, arms: ctx._slArms || 0, moved: ctx._slMovedKcal || 0, valveDays: ctx._slValveDays || 0, lean: !!ctx._slLeanDay });
      rec.row = [dayOf(G), Math.round(pantryKcal(G)), ((G.state.village || {}).roster || []).length, rec.deaths].join(',');
      rec.rows.push(rec.row);
      // per-day funnel counters (meals run in the sleep AFTER this daily, so
      // day N's calls = counters[N+1] - counters[N])
      rec.dayMeta.push({ day: dayOf(G), lean: !!(ctx._slLeanDay), sur: rec.surCalls, pan: rec.panCalls, moved: Math.round(ctx._slMovedKcal || 0) });
      return r;
    };
    P._origSur = oSur; P._origPan = oPan; P._origVMD = Game.villagerMealDay; P._origSleep = Game.sleep;
    await runDays(Game, P, { days: opts.days || DAYS, manifest: null, sampleEvery: 181 });
    rec.ctx = ctxSeen;
    rec.armedLeft = (Game._slArmed === true);
    rec.vmdLeaked = (Game.villagerMealDay !== P._origVMD);
    rec.sleepLeaked = (Game.sleep !== P._origSleep);
    try { rec.surIntact = (Game.stockSurplus.toString().indexOf('rec.surCalls++') >= 0); } catch (e) { rec.surIntact = false; }
    return { rec, Game };
  } finally {
    if (savedSharelean === undefined) delete process.env.SHARELEAN; else process.env.SHARELEAN = savedSharelean;
  }
}
function trajHash(rec) {
  return require('crypto').createHash('sha256')
    .update(rec.rows.join('\n') + '\n###\n' + rec.says.join('\n')).digest('hex').slice(0, 16);
}

(async () => {
  console.log(`test-sharelean-b — base ${BASE_SHA}, FEASTSCALE_R13=${process.env.FEASTSCALE_R13}`);
  const pairs = [[belongsharelean, belongfeast, 'belong'], [leadsharelean, leadfeast, 'lead']];

  // ---------- RED: gate-off byte-identical ----------
  console.log('RED (SHARELEAN unset):');
  for (const [armed, base, nm] of pairs) {
    for (const seed of SEEDS) {
      const a = await runCfg(armed, seed, {});
      const b = await runCfg(base, seed, {});
      const ha = trajHash(a.rec), hb = trajHash(b.rec);
      ok(`R-off ${nm} s${seed}: armed≡base (${a.rec.rows.length}d, says ${a.rec.says.length})`,
        ha === hb && a.rec.deaths === b.rec.deaths, `armed ${ha} vs base ${hb}`);
    }
  }

  // ---------- RED: loud STOP on wrong substrate ----------
  console.log('RED (substrate gate):');
  {
    const saved = process.env.FEASTSCALE_R13;
    delete process.env.FEASTSCALE_R13;
    process.env.SHARELEAN = '1';
    let threw = null;
    try {
      const { Game } = await loadGame({ seed: 5201, mode: 'test-sharelean-b-stop', fullTelemetry: false });
      await setupGame(Game);
      belongsharelean.daily(Game, {});
    } catch (e) { threw = String((e && e.message) || e); }
    if (saved === undefined) delete process.env.FEASTSCALE_R13; else process.env.FEASTSCALE_R13 = saved;
    delete process.env.SHARELEAN;
    ok('R-stop: SHARELEAN=1 without FEASTSCALE_R13=1 throws loud STOP', /SHARELEAN STOP/.test(threw || ''), threw);
  }

  // ---------- GREEN ----------
  console.log('GREEN (SHARELEAN=1):');
  ok('G0: layerOn() true when SHARELEAN=1', (() => { process.env.SHARELEAN = '1'; const r = SL.layerOn(); delete process.env.SHARELEAN; return r; })());

  // G1: lean trigger — stocked pantry not lean (3d, no drain); drained pantry lean.
  {
    const { rec } = await runCfg(belongsharelean, 5201, { sharelean: true, stockFirst: 200000, days: 3 });
    ok('G1a: stocked pantry days not armed (fat posture)', rec.ctx.evals === 3 && rec.ctx.arms === 0 && rec.ctx.moved === 0,
      JSON.stringify(rec.ctx));
    const r2 = await runCfg(belongsharelean, 5201, { sharelean: true, drainAtDay: 2, days: 6 });
    ok('G1b: drained pantry arms the valve (lean posture)', r2.rec.ctx.arms > 0, JSON.stringify(r2.rec.ctx));
  }

  // G2: valve live — engages, re-tags the funnel, moves kcal.
  let armedRec = null, controlRec = null;
  {
    const a = await runCfg(leadsharelean, 5202, { sharelean: true, drainAtDay: 2 });
    const c = await runCfg(leadfeast, 5202, {});
    armedRec = a.rec; controlRec = c.rec;
    ok('SMOKE/G2a: valve moved kcal on lean days', armedRec.ctx.moved > 0 && armedRec.ctx.valveDays > 0,
      JSON.stringify(armedRec.ctx));
    { // G2b: per-day funnel attribution — zero stockSurplus calls on armed lean days
      let bad = 0, leanDays = 0;
      for (let i = 0; i + 1 < armedRec.dayMeta.length; i++) {
        if (armedRec.dayMeta[i].lean) {
          leanDays++;
          if (armedRec.dayMeta[i + 1].sur - armedRec.dayMeta[i].sur !== 0) bad++;
        }
      }
      ok('G2b: funnel re-tagged — zero stockSurplus calls on armed lean days',
        leanDays > 0 && bad === 0,
        `${bad} bad / ${leanDays} lean days (armed surCalls total ${armedRec.surCalls}, expected all on fat days)`);
    }
    ok('G2c: control still uses the share funnel', controlRec.surCalls > 0,
      `control surCalls=${controlRec.surCalls}`);
    ok('G2d: no leaked wraps after run', !a.rec.armedLeft && !a.rec.vmdLeaked && !a.rec.sleepLeaked,
      `armed=${a.rec.armedLeft} vmd=${a.rec.vmdLeaked} sleep=${a.rec.sleepLeaked}`);
    ok('G2e: outer stockSurplus counter intact (per-meal restore)', a.rec.surIntact);
  }

  // G3: trust restored — armed-vs-control trust-DRIFT comparison over one
  // drained-pantry day. The valve's finally must leave no residue: any
  // natural engine trust writes during the village day are deterministic on
  // the same seed, so armed drift must EXACTLY equal control drift.
  async function trustDrift(sharelean) {
    const saved = process.env.SHARELEAN;
    try {
      if (sharelean) process.env.SHARELEAN = '1'; else delete process.env.SHARELEAN;
      const { Game } = await loadGame({ seed: 5202, mode: 'test-sharelean-b-g3', fullTelemetry: false });
      await setupGame(Game);
      try { Game.state.village.pantry = []; Game.state.village.pantryKcal = 0; } catch (e) {}
      const P = Object.assign({}, leadsharelean);
      const origDaily = leadsharelean.daily;
      let before = null, after = null;
      P.daily = (G, ctx) => {
        const r = origDaily(G, ctx);
        if (dayOf(G) === 1) { try { before = JSON.stringify((G.state.village || {}).trust || {}); } catch (e) {} }
        return r;
      };
      const oSleep = Game.sleep;
      let slept = 0;
      Game.sleep = function () {
        const r = oSleep.apply(this, arguments);
        if (++slept === 1) { try { after = JSON.stringify((this.state.village || {}).trust || {}); } catch (e) {} }
        return r;
      };
      await runDays(Game, P, { days: 1, manifest: null, sampleEvery: 181 });
      Game.sleep = oSleep;
      const b = JSON.parse(before || '{}'), a = JSON.parse(after || '{}');
      const drift = {};
      for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
        const d = (a[k] || 0) - (b[k] || 0);
        if (d !== 0) drift[k] = d;
      }
      return JSON.stringify(drift);
    } finally {
      if (saved === undefined) delete process.env.SHARELEAN; else process.env.SHARELEAN = saved;
    }
  }
  {
    const dArmed = await trustDrift(true);
    const dControl = await trustDrift(false);
    ok('G3: armed trust-drift == control trust-drift (no valve residue)',
      dArmed === dControl, `armed ${dArmed} vs control ${dControl}`);
  }

  // G4: armed side deterministic.
  {
    const a1 = await runCfg(belongsharelean, 5201, { sharelean: true });
    const a2 = await runCfg(belongsharelean, 5201, { sharelean: true });
    ok('G4: armed run deterministic (repeat identical)', trajHash(a1.rec) === trajHash(a2.rec));
  }

  // ---------- SENSE ----------
  console.log('SENSE (valve voice lines from the lean run):');
  const valveLines = (armedRec ? armedRec.says : []).filter(s => s.indexOf('pulls together') >= 0);
  console.log(`  valve voiced on ${valveLines.length} day(s); moved ${armedRec ? armedRec.ctx.moved : 0} kcal total`);
  for (const l of valveLines.slice(0, 3)) console.log('  > ' + l);

  console.log(`\n${pass} passed, ${fail} failed — base ${BASE_SHA}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });

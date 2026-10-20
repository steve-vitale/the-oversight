#!/usr/bin/env node
// test-retagrot-b4.js — proof for the ROT re-tag with the STARVATION-BYPASS
// gate (sim-retagrot-b4).
//
// RED:  RETAGROT_B4 unset -> wrapped policy is byte-identical to the base
//       policy (2 seeds x 2 policies, 40d: trajectory rows + say-stream +
//       deaths). RETAGROT_B4=1 without FEASTSCALE_R13=1 -> loud RETAGROT_B4 STOP.
// GREEN: layer reports on; re-tag fires on real runs (moved kcal > 0); the
//       engine's stockSurplus IS called armed-side (the b-layer proof pinned
//       NEVER-called — b4 must differ); EVERY armed engine call happened while
//       the crisis gate was open (pantry < 5000 at the call, the engine's own
//       crisis-sharing quantity); EVERY re-tagged share happened while the
//       pantry was >= 5000 (crisis shares are NEVER intercepted); per-meal
//       save/restore; wrap installed exactly once; control still uses the
//       engine path; CAPDOOR=1 defers; armed side deterministic.
// SENSE: prints the re-tag's voice lines for human reading.
//
// Usage: FEASTSCALE_R13=1 node scripts/test-retagrot-b4.js
'use strict';
const { execSync } = require('child_process');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const RG = require('./policies/retagrot-b4');
const { belongretagrot4, leadretagrot4 } = RG;
const { belongfeast, leadfeast } = require('./policies/feastscale');

const BASE_SHA = execSync('git rev-parse --short HEAD', { cwd: __dirname }).toString().trim();
const SEEDS = [5401, 5402];
const DAYS = 40;
const CRISIS = 5000; // must equal the layer's CRISIS_LIMIT / engine gate
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function pantryKcalLive(Game) {
  const v = (Game.state || {}).village || {};
  return ((v.pantry || [])).reduce((t, it) => t + (it.kcalEach || 0) * (it.units || 1), 0);
}

// runCfg: one 40d run with trajectory + say capture. opts: {policy, seed,
// retagrot, capdoor} — retagrot sets RETAGROT_B4=1 for the run.
// The engine's stockSurplus is counter-wrapped BEFORE the layer wraps it, so
// the counter fires only when the layer DEFERS (bypass or CAPDOOR) — each
// firing records the live pantry kcal at the call, proving the bypass fired
// only while the crisis gate was open. The re-tag's stockPantry writes are
// likewise pantry-stamped, proving re-tags only fired on non-crisis shares.
async function runCfg(policy, seed, opts) {
  opts = opts || {};
  const savedRg = process.env.RETAGROT_B4, savedCap = process.env.CAPDOOR;
  try {
    if (opts.retagrot) process.env.RETAGROT_B4 = '1'; else delete process.env.RETAGROT_B4;
    if (opts.capdoor) process.env.CAPDOOR = '1'; else delete process.env.CAPDOOR;
    const { Game } = await loadGame({ seed, mode: 'test-retagrot-b4', fullTelemetry: false });
    await setupGame(Game);
    const rec = { rows: [], dayMeta: [], deaths: 0, says: [], engSurCalls: 0, engSurPantry: [], retagPantry: [], panCalls: 0 };
    const oTele = Game.tele;
    Game.tele = function (t, d) {
      let r; try { r = oTele.apply(this, arguments); } catch (e) { throw e; }
      try { if (t === 'death') rec.deaths++; } catch (e) {}
      return r;
    };
    const oSay = Game.say;
    Game.say = function (m) { try { rec.says.push(String(m)); } catch (e) {} return oSay.apply(this, arguments); };
    const oSurEng = Game.stockSurplus, oPan = Game.stockPantry;
    Game.stockSurplus = function () { rec.engSurCalls++; try { rec.engSurPantry.push(pantryKcalLive(Game)); } catch (e) {} return oSurEng.apply(this, arguments); };
    Game.stockPantry = function () { rec.panCalls++; try { rec.retagPantry.push(pantryKcalLive(Game)); } catch (e) {} return oPan.apply(this, arguments); };
    const P = Object.assign({}, policy);
    const origDaily = policy.daily;
    const ctxSeen = {};
    P.daily = (G, ctx) => {
      const r = origDaily(G, ctx);
      Object.assign(ctxSeen, {
        arms: ctx._rgArms || 0,
        moved: Math.round(ctx._rgMovedKcal || 0),
        days: ctx._rgDays || 0,
        bypassed: Math.round(ctx._rgBypassedKcal || 0),
        bypassDays: ctx._rgBypassDays || 0,
        retagPantryMin: ctx._rgRetagPantryMin,
      });
      rec.row = [dayOf(G), Math.round(pantryKcalLive(G)), ((G.state.village || {}).roster || []).length, rec.deaths].join(',');
      rec.rows.push(rec.row);
      return r;
    };
    P._oSurEng = oSurEng; P._mySur = Game.stockSurplus; P._myVmd = Game.villagerMealDay;
    await runDays(Game, P, { days: opts.days || DAYS, manifest: null, sampleEvery: 181 });
    rec.ctx = ctxSeen;
    rec.surRestored = (Game.stockSurplus === P._mySur); // per-meal save/restore
    rec.vmdInstalled = (Game._rgb4VmdWrapped === true && Game.villagerMealDay !== P._myVmd);
    // idempotence: exactly one vmd install even after many dailies
    rec.vmdStacked = false;
    try {
      const after = Game.villagerMealDay;
      const P2 = Object.assign({}, policy); P2.daily = policy.daily;
      P2.daily(Game, {}); P2.daily(Game, {});
      rec.vmdStacked = (Game.villagerMealDay !== after);
    } catch (e) {}
    return { rec, Game };
  } finally {
    if (savedRg === undefined) delete process.env.RETAGROT_B4; else process.env.RETAGROT_B4 = savedRg;
    if (savedCap === undefined) delete process.env.CAPDOOR; else process.env.CAPDOOR = savedCap;
  }
}
function trajHash(rec) {
  return require('crypto').createHash('sha256')
    .update(rec.rows.join('\n') + '\n###\n' + rec.says.join('\n')).digest('hex').slice(0, 16);
}

(async () => {
  console.log(`test-retagrot-b4 — base ${BASE_SHA}, FEASTSCALE_R13=${process.env.FEASTSCALE_R13}`);
  const pairs = [[belongretagrot4, belongfeast, 'belong'], [leadretagrot4, leadfeast, 'lead']];

  // ---------- RED: gate-off byte-identical ----------
  console.log('RED (RETAGROT_B4 unset):');
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
    process.env.RETAGROT_B4 = '1';
    let threw = null;
    try {
      const { Game } = await loadGame({ seed: 5401, mode: 'test-retagrot-b4-stop', fullTelemetry: false });
      await setupGame(Game);
      belongretagrot4.daily(Game, {});
    } catch (e) { threw = String((e && e.message) || e); }
    if (saved === undefined) delete process.env.FEASTSCALE_R13; else process.env.FEASTSCALE_R13 = saved;
    delete process.env.RETAGROT_B4;
    ok('R-stop: RETAGROT_B4=1 without FEASTSCALE_R13=1 throws loud STOP', /RETAGROT_B4 STOP/.test(threw || ''), threw);
  }

  // ---------- GREEN ----------
  console.log('GREEN (RETAGROT_B4=1):');
  ok('G0: layerOn() true when RETAGROT_B4=1', (() => { process.env.RETAGROT_B4 = '1'; const r = RG.layerOn(); delete process.env.RETAGROT_B4; return r; })());

  let armedRec = null, controlRec = null;
  {
    // belongfeast drives the pantry into the crisis gate within 90d (the scan
    // shows 87 engine-share calls / 52k bypassed kcal); leadfeast never opens
    // the gate in 40d or 90d, so the bypass assertions need the belong leg.
    const a = await runCfg(belongretagrot4, 5402, { retagrot: true, days: 90 });
    const c = await runCfg(belongfeast, 5402, { days: 90 });
    armedRec = a.rec; controlRec = c.rec;
    ok('G1a: re-tag fired — moved kcal > 0 on real runs', armedRec.ctx.moved > 0 && armedRec.ctx.days > 0,
      JSON.stringify(armedRec.ctx));
    ok('G1b: engine stockSurplus CALLED armed-side (bypass exists; b pinned NEVER)',
      armedRec.engSurCalls > 0, `engSurCalls=${armedRec.engSurCalls}`);
    const maxEngPan = armedRec.engSurPantry.length ? Math.max(...armedRec.engSurPantry) : -1;
    ok('G1c: every armed engine-share call fired while the crisis gate was open (pantry<5000 at each call)',
      armedRec.engSurCalls > 0 && maxEngPan < CRISIS, `max pantry at engine calls=${Math.round(maxEngPan)}`);
    // G1d uses the layer's own per-decision pantry stamp (ctx._rgRetagPantryMin):
    // counter-wrapping stockPantry would also catch the engine's non-share
    // harvest writes, which legitimately fire at low pantry.
    const minRetagPan = armedRec.ctx.retagPantryMin;
    ok('G1d: every re-tagged share fired on a NON-crisis pantry (>=5000 at each decision)',
      armedRec.ctx.moved > 0 && minRetagPan !== undefined && minRetagPan >= CRISIS, `min pantry at re-tag decisions=${Math.round(minRetagPan)}`);
    ok('G1e: bypass instrumentation counts the deferred crisis kcal', armedRec.ctx.bypassed > 0 && armedRec.ctx.bypassDays > 0,
      JSON.stringify({ bypassed: armedRec.ctx.bypassed, bypassDays: armedRec.ctx.bypassDays }));
    ok('G1f: control still uses the engine share path', controlRec.engSurCalls > 0,
      `control engSurCalls=${controlRec.engSurCalls}`);
    ok('G1g: per-meal stockSurplus save/restore intact', a.rec.surRestored);
    ok('G1h: vmd wrap installed exactly once (idempotent, persistent per-run)',
      a.rec.vmdInstalled && !a.rec.vmdStacked,
      `installed=${a.rec.vmdInstalled} stacked=${a.rec.vmdStacked}`);
    ok('G1i: armed differs from control (the lever moves kcal)', trajHash(armedRec) !== trajHash(controlRec));
  }

  // G2: CAPDOOR=1 defers — the engine path is used, no kcal re-tagged.
  {
    const a = await runCfg(belongretagrot4, 5401, { retagrot: true, capdoor: true });
    ok('G2: CAPDOOR=1 defers to the engine share path', a.rec.engSurCalls > 0 && Math.round(a.rec.ctx.moved || 0) === 0,
      `engSurCalls=${a.rec.engSurCalls} moved=${a.rec.ctx.moved}`);
  }

  // G3: armed side deterministic.
  {
    const a1 = await runCfg(belongretagrot4, 5401, { retagrot: true });
    const a2 = await runCfg(belongretagrot4, 5401, { retagrot: true });
    ok('G3: armed run deterministic (repeat identical)', trajHash(a1.rec) === trajHash(a2.rec));
  }

  // ---------- SENSE ----------
  console.log('SENSE (re-tag voice lines):');
  const voiceLines = (armedRec ? armedRec.says : []).filter(s => /surplus goes to the common store|common shelves|Surplus folds into the common store/.test(s));
  const uniq = [...new Set(voiceLines)];
  console.log(`  voiced on ${voiceLines.length} day(s), ${uniq.length} distinct variant(s), moved ${armedRec ? armedRec.ctx.moved : 0} kcal total, bypassed ${armedRec ? armedRec.ctx.bypassed : 0} kcal on ${armedRec ? armedRec.ctx.bypassDays : 0} day(s)`);
  for (const l of uniq.slice(0, 5)) console.log('  > ' + l);

  console.log(`\n${pass} passed, ${fail} failed — base ${BASE_SHA}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });

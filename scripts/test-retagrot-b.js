#!/usr/bin/env node
// test-retagrot-b.js — proof for the ROT re-tag (sim-retagrot-b).
//
// RED:  RETAGROT_B unset -> wrapped policy is byte-identical to the base policy
//       (2 seeds x 2 policies, 40d: trajectory rows + say-stream + deaths).
//       RETAGROT_B=1 without FEASTSCALE_R13=1 -> loud RETAGROT STOP.
// GREEN: layer reports on; re-tag fires on real runs (moved kcal > 0 and the
//       ENGINE's stockSurplus is never called armed-side while control still
//       uses it); no leaked wraps; armed side deterministic; CAPDOOR=1
//       defers to the engine path.
// SENSE: prints the re-tag's voice lines for human reading.
//
// Usage: FEASTSCALE_R13=1 node scripts/test-retagrot-b.js
'use strict';
const { execSync } = require('child_process');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const RG = require('./policies/retagrot-b');
const { belongretagrot, leadretagrot } = RG;
const { belongfeast, leadfeast } = require('./policies/feastscale');

const BASE_SHA = execSync('git rev-parse --short HEAD', { cwd: __dirname }).toString().trim();
const SEEDS = [5401, 5402];
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
// retagrot, capdoor} — retagrot sets RETAGROT_B=1 for the run.
// The engine's stockSurplus is counter-wrapped BEFORE the layer wraps it, so
// the counter fires only when the layer does NOT re-tag (the CAPDOOR path or
// control side).
async function runCfg(policy, seed, opts) {
  opts = opts || {};
  const savedRg = process.env.RETAGROT_B, savedCap = process.env.CAPDOOR;
  try {
    if (opts.retagrot) process.env.RETAGROT_B = '1'; else delete process.env.RETAGROT_B;
    if (opts.capdoor) process.env.CAPDOOR = '1'; else delete process.env.CAPDOOR;
    const { Game } = await loadGame({ seed, mode: 'test-retagrot-b', fullTelemetry: false });
    await setupGame(Game);
    const rec = { rows: [], dayMeta: [], deaths: 0, says: [], engSurCalls: 0, panCalls: 0 };
    const oTele = Game.tele;
    Game.tele = function (t, d) {
      let r; try { r = oTele.apply(this, arguments); } catch (e) { throw e; }
      try { if (t === 'death') rec.deaths++; } catch (e) {}
      return r;
    };
    const oSay = Game.say;
    Game.say = function (m) { try { rec.says.push(String(m)); } catch (e) {} return oSay.apply(this, arguments); };
    const oSurEng = Game.stockSurplus, oPan = Game.stockPantry;
    Game.stockSurplus = function () { rec.engSurCalls++; return oSurEng.apply(this, arguments); };
    Game.stockPantry = function () { rec.panCalls++; return oPan.apply(this, arguments); };
    const P = Object.assign({}, policy);
    const origDaily = policy.daily;
    const ctxSeen = {};
    P.daily = (G, ctx) => {
      const r = origDaily(G, ctx);
      Object.assign(ctxSeen, { arms: ctx._rgArms || 0, moved: Math.round(ctx._rgMovedKcal || 0), days: ctx._rgDays || 0 });
      rec.row = [dayOf(G), Math.round(pantryKcal(G)), ((G.state.village || {}).roster || []).length, rec.deaths].join(',');
      rec.rows.push(rec.row);
      return r;
    };
    P._oSurEng = oSurEng; P._mySur = Game.stockSurplus; P._myVmd = Game.villagerMealDay;
    await runDays(Game, P, { days: opts.days || DAYS, manifest: null, sampleEvery: 181 });
    rec.ctx = ctxSeen;
    rec.surRestored = (Game.stockSurplus === P._mySur); // per-meal save/restore
    rec.vmdInstalled = (Game._rgVmdWrapped === true && Game.villagerMealDay !== P._myVmd);
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
    if (savedRg === undefined) delete process.env.RETAGROT_B; else process.env.RETAGROT_B = savedRg;
    if (savedCap === undefined) delete process.env.CAPDOOR; else process.env.CAPDOOR = savedCap;
  }
}
function trajHash(rec) {
  return require('crypto').createHash('sha256')
    .update(rec.rows.join('\n') + '\n###\n' + rec.says.join('\n')).digest('hex').slice(0, 16);
}

(async () => {
  console.log(`test-retagrot-b — base ${BASE_SHA}, FEASTSCALE_R13=${process.env.FEASTSCALE_R13}`);
  const pairs = [[belongretagrot, belongfeast, 'belong'], [leadretagrot, leadfeast, 'lead']];

  // ---------- RED: gate-off byte-identical ----------
  console.log('RED (RETAGROT_B unset):');
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
    process.env.RETAGROT_B = '1';
    let threw = null;
    try {
      const { Game } = await loadGame({ seed: 5401, mode: 'test-retagrot-b-stop', fullTelemetry: false });
      await setupGame(Game);
      belongretagrot.daily(Game, {});
    } catch (e) { threw = String((e && e.message) || e); }
    if (saved === undefined) delete process.env.FEASTSCALE_R13; else process.env.FEASTSCALE_R13 = saved;
    delete process.env.RETAGROT_B;
    ok('R-stop: RETAGROT_B=1 without FEASTSCALE_R13=1 throws loud STOP', /RETAGROT STOP/.test(threw || ''), threw);
  }

  // ---------- GREEN ----------
  console.log('GREEN (RETAGROT_B=1):');
  ok('G0: layerOn() true when RETAGROT_B=1', (() => { process.env.RETAGROT_B = '1'; const r = RG.layerOn(); delete process.env.RETAGROT_B; return r; })());

  let armedRec = null, controlRec = null;
  {
    const a = await runCfg(leadretagrot, 5402, { retagrot: true });
    const c = await runCfg(leadfeast, 5402, {});
    armedRec = a.rec; controlRec = c.rec;
    ok('G1a: re-tag fired — moved kcal > 0 on real runs', armedRec.ctx.moved > 0 && armedRec.ctx.days > 0,
      JSON.stringify(armedRec.ctx));
    ok('G1b: engine stockSurplus NEVER called armed-side (full re-tag)',
      armedRec.engSurCalls === 0, `engSurCalls=${armedRec.engSurCalls} (pantry writes ${armedRec.panCalls})`);
    ok('G1c: control still uses the engine share path', controlRec.engSurCalls > 0,
      `control engSurCalls=${controlRec.engSurCalls}`);
    ok('G1d: per-meal stockSurplus save/restore intact', a.rec.surRestored);
    ok('G1d2: vmd wrap installed exactly once (idempotent, persistent per-run)',
      a.rec.vmdInstalled && !a.rec.vmdStacked,
      `installed=${a.rec.vmdInstalled} stacked=${a.rec.vmdStacked}`);
    ok('G1e: armed differs from control (the lever moves kcal)', trajHash(armedRec) !== trajHash(controlRec));
  }

  // G2: CAPDOOR=1 defers — the engine path is used, refusal honesty intact.
  {
    const a = await runCfg(belongretagrot, 5401, { retagrot: true, capdoor: true });
    ok('G2: CAPDOOR=1 defers to the engine share path', a.rec.engSurCalls > 0 && Math.round(a.rec.ctx.moved || 0) === 0,
      `engSurCalls=${a.rec.engSurCalls} moved=${a.rec.ctx.moved}`);
  }

  // G3: armed side deterministic.
  {
    const a1 = await runCfg(belongretagrot, 5401, { retagrot: true });
    const a2 = await runCfg(belongretagrot, 5401, { retagrot: true });
    ok('G3: armed run deterministic (repeat identical)', trajHash(a1.rec) === trajHash(a2.rec));
  }

  // ---------- SENSE ----------
  console.log('SENSE (re-tag voice lines):');
  const voiceLines = (armedRec ? armedRec.says : []).filter(s => /surplus goes to the common store|common shelves|Surplus folds into the common store/.test(s));
  const uniq = [...new Set(voiceLines)];
  console.log(`  voiced on ${voiceLines.length} day(s), ${uniq.length} distinct variant(s), moved ${armedRec ? armedRec.ctx.moved : 0} kcal total`);
  for (const l of uniq.slice(0, 5)) console.log('  > ' + l);

  console.log(`\n${pass} passed, ${fail} failed — base ${BASE_SHA}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });

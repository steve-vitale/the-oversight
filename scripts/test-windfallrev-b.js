#!/usr/bin/env node
// test-windfallrev-b.js — portion-scaled windfall feast + the two
// reconciliations (sim-windfallrev-b).
//
// The base layer's 38 pins live in scripts/test-portionwindfall-b.js (run it
// too — the rebuild must keep them GREEN). This file proves the NEW
// behaviors:
//   (3) WINDFALL_RECONCILE (default ON): a would-be FRESH ARMED grant (surge
//       armed + no buff live — the scavenger-rolling case) stands down when
//       a beast is circling or one was drawn within 3d. Refreshes (buff
//       live) and unarmed feasts fire normally. WINDFALL_RECONCILE=0
//       disables it for attribution.
//   (4) WINDFALL_YIELD_SMOKE (default ON): racks thin + whole doomed pile
//       fits one cook part (<=4000) + the drive recently absorbed food ->
//       stand down, counted. Racks full / pile too big / idle drive ->
//       fires. WINDFALL_YIELD_SMOKE=0 disables it for attribution.
//   Attribution detail: every fire records {buffLive, surgeArmed,
//       freshGrant, scavDrawn}; draws are tracked per day (parent's too).
//
// Kill protocol: if the layer was deleted, INFO-SKIP exit 0.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
let PW;
try {
  PW = require('./policies/portionwindfall');
} catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: sim-windfallrev-b layer killed per protocol (policies/portionwindfall.js absent); proof vacuous, exit 0.');
    process.exit(0);
  }
  throw e;
}
const { withPortionWindfall, doomedFresh, layerOn, reconcileOn, yieldSmokeOn } = PW;
const { leadfeast } = require('./policies/feastscale');

function freshStack(day, name, units, kcalEach, spoilIn) {
  return { name, kcalEach, units, spoilDay: day + spoilIn, foodKind: 'meat',
           foodState: 'fresh', safe: false, kg: 0.2, unit: 'portion' };
}

async function fixture() {
  const { Game } = await loadGame({ seed: 4242, mode: 'proof-windfallrev', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village;
  const s = Game.state.scholar;
  const day = s.day || 1;
  Game.dayPart = 2; // dusk
  Game.playerAtHaven = () => true;
  v.gives = v.gives || {};
  v.gives[Game.villagerId] = 0;
  const roster = (v.roster || []).length || 10;
  const bonus = (Game.spoilBonusDays ? Math.round(Game.spoilBonusDays()) : 0) || 0;
  v.pantry = [];
  v.pantry.push(freshStack(day, 'Deer meat', 30, 200, 1 - bonus));   // 6000, doomed
  v.pantry.push(freshStack(day, 'Turkey meat', 20, 150, 1 - bonus)); // 3000, doomed
  v.pantry.push(freshStack(day, 'Beans', 40, 100, 30));              // 4000, keeps
  return { Game, v, s, day, roster, bonus };
}

function ctxWithContrib(day) {
  return { _givesHist: [{ day: day - 7, g: 0 }], _fsLastFeastDay: day - 1,
           _tribHist: [{ day, kcal: 2000 }] };
}

(async () => {
  let fail = 0;
  const check = (name, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name); if (!cond) fail++; };
  const wrapped = withPortionWindfall(leadfeast, 'leadwindfallrev-test', 'test');
  const lines = [];
  const sayStub = (Game) => { Game.say = (st) => { lines.push(String(st)); }; };

  // ---------- R1: reconciliations default ON with the layer ----------
  {
    process.env.PORTIONWINDFALL = '1';
    delete process.env.WINDFALL_RECONCILE;
    delete process.env.WINDFALL_YIELD_SMOKE;
    check('R1 layer on', layerOn());
    check('R1 reconcile defaults ON', reconcileOn());
    check('R1 yield-smoke defaults ON', yieldSmokeOn());
  }

  // ---------- R2: independent disable flags ----------
  {
    process.env.PORTIONWINDFALL = '1';
    process.env.WINDFALL_RECONCILE = '0';
    process.env.WINDFALL_YIELD_SMOKE = '0';
    check('R2 reconcile disable-able', !reconcileOn());
    check('R2 yield-smoke disable-able', !yieldSmokeOn());
    check('R2 layer still on', layerOn());
    // the base layer still fires with both reconciliations off (9000 doomed)
    const { Game, day } = await fixture();
    sayStub(Game);
    const ctx = ctxWithContrib(day);
    wrapped.upkeep(Game, ctx);
    check('R2 base layer fires with reconciliations off', ctx._pwFeasts === 1);
    delete process.env.WINDFALL_RECONCILE;
    delete process.env.WINDFALL_YIELD_SMOKE;
    lines.length = 0;
  }

  // ---------- R3: scavenger yield engages on a fresh armed grant with a recent draw ----------
  {
    process.env.PORTIONWINDFALL = '1';
    const { Game, v, s, day } = await fixture();
    sayStub(Game);
    s.prog = s.prog || {}; s.prog.feastSurge = 1.5; // surge armed
    Game.feastedActive = () => false;               // no buff live -> fresh grant
    const ctx = ctxWithContrib(day);
    ctx._pwScavDrawDays = [day - 1];                // beast drawn yesterday
    wrapped.upkeep(Game, ctx);
    check('R3 fresh armed grant + recent draw: stands down', !ctx._pwFeasts);
    check('R3 suppression counted', ctx._pwReconSuppress === 1);
    check('R3 suppression day recorded', (ctx._pwReconSuppressDays || [])[0] === day);
    check('R3 no voice on stand-down', !lines.some(l => /won't keep till tomorrow/.test(l)));
    lines.length = 0;
  }

  // ---------- R3b: circling beast (live pending draw) also suppresses ----------
  {
    process.env.PORTIONWINDFALL = '1';
    const { Game, v, s, day } = await fixture();
    sayStub(Game);
    s.prog = s.prog || {}; s.prog.feastSurge = 1.5;
    Game.feastedActive = () => false;
    Game.feastDrawPending = () => ({ monsterId: 'hushwolf', day }); // circling now
    const ctx = ctxWithContrib(day);
    wrapped.upkeep(Game, ctx);
    check('R3b circling beast: stands down', !ctx._pwFeasts && ctx._pwReconSuppress === 1);
    lines.length = 0;
  }

  // ---------- R4: refresh (buff live) is NOT a fresh grant -> fires ----------
  {
    process.env.PORTIONWINDFALL = '1';
    const { Game, v, s, day } = await fixture();
    sayStub(Game);
    s.prog = s.prog || {}; s.prog.feastSurge = 1.5;
    Game.feastedActive = () => true; // buff live -> refresh, no new draw
    const ctx = ctxWithContrib(day);
    ctx._pwScavDrawDays = [day - 1];
    wrapped.upkeep(Game, ctx);
    check('R4 buff live (refresh): fires despite recent draw', ctx._pwFeasts === 1);
    const det = (ctx._pwFireDetail || [])[0] || {};
    check('R4 detail: buffLive true, freshGrant false', det.buffLive === true && det.freshGrant === false);
    lines.length = 0;
  }

  // ---------- R5: unarmed feast draws nothing -> fires ----------
  {
    process.env.PORTIONWINDFALL = '1';
    const { Game, v, s, day } = await fixture();
    sayStub(Game);
    // no feastSurge, no harvest_table -> unarmed
    Game.feastedActive = () => false;
    const ctx = ctxWithContrib(day);
    ctx._pwScavDrawDays = [day - 1];
    wrapped.upkeep(Game, ctx);
    check('R5 unarmed feast: fires despite recent draw', ctx._pwFeasts === 1);
    const det = (ctx._pwFireDetail || [])[0] || {};
    check('R5 detail: surgeArmed false, freshGrant false', det.surgeArmed === false && det.freshGrant === false);
    lines.length = 0;
  }

  // ---------- R6: smoke yield engages (racks thin, pile fits, drive active) ----------
  {
    process.env.PORTIONWINDFALL = '1';
    const { Game, v, s, day, roster, bonus } = await fixture();
    sayStub(Game);
    // rebuild: doomed 3800 (> 300*12=3600 trigger, <= 4000 budget) + keeps
    // + a preserved stack consistent with the ledger (drive absorbing)
    v.pantry = [];
    v.pantry.push(freshStack(day, 'Deer meat', 19, 200, 1 - bonus)); // 3800 doomed
    v.pantry.push(freshStack(day, 'Beans', 40, 100, 30));            // 4000 keeps (affordability)
    v.pantry.push({ name: 'Smoked meat', kcalEach: 180, units: 10, spoilDay: day + 20,
      foodKind: 'meat', foodState: 'preserved', safe: true });       // 1800 preserved
    const d = doomedFresh(Game);
    check('R6 fixture: doomed in (3600, 4000]', d.kcal > 300 * roster && d.kcal <= 4000);
    const ctx = ctxWithContrib(day);
    // drive active: preserved kcal rose over the last days (1000 -> 1500 -> 1800)
    ctx._pwPresKcal = { [day - 2]: 1000, [day - 1]: 1500 };
    wrapped.upkeep(Game, ctx);
    check('R6 racks thin + pile fits + drive active: stands down', !ctx._pwFeasts);
    check('R6 smoke yield counted', ctx._pwSmokeYield === 1);
    check('R6 smoke yield day recorded', (ctx._pwSmokeYieldDays || [])[0] === day);
    lines.length = 0;
  }

  // ---------- R7: pile too big for one cook part -> fires ----------
  {
    process.env.PORTIONWINDFALL = '1';
    const { Game, v, s, day } = await fixture(); // 9000 doomed
    sayStub(Game);
    const ctx = ctxWithContrib(day);
    ctx._pwPresKcal = { [day - 2]: 1000, [day - 1]: 1500 };
    wrapped.upkeep(Game, ctx);
    check('R7 pile 9000 > 4000 budget: fires (overflow valve)', ctx._pwFeasts === 1);
    check('R7 no smoke yield counted', !ctx._pwSmokeYield);
    lines.length = 0;
  }

  // ---------- R8: racks full -> fires ----------
  {
    process.env.PORTIONWINDFALL = '1';
    const { Game, v, s, day, roster, bonus } = await fixture();
    sayStub(Game);
    v.pantry = [];
    v.pantry.push(freshStack(day, 'Deer meat', 19, 200, 1 - bonus)); // 3800 doomed
    v.pantry.push(freshStack(day, 'Beans', 40, 100, 30));            // 4000 keeps
    // racks full: preserved stock above the engine's rackCap (125*12*13=19500 unskilled)
    v.pantry.push({ name: 'Smoked meat', kcalEach: 500, units: 50, spoilDay: day + 20,
      foodKind: 'meat', foodState: 'preserved', safe: true });       // 25000 preserved
    const ctx = ctxWithContrib(day);
    ctx._pwPresKcal = { [day - 2]: 20000, [day - 1]: 25000 };
    wrapped.upkeep(Game, ctx);
    check('R8 racks full: fires (smoke drive cannot absorb)', ctx._pwFeasts === 1);
    check('R8 no smoke yield counted', !ctx._pwSmokeYield);
    lines.length = 0;
  }

  // ---------- R8b: idle drive -> fires (fail-safe) ----------
  {
    process.env.PORTIONWINDFALL = '1';
    const { Game, v, s, day, roster, bonus } = await fixture();
    sayStub(Game);
    v.pantry = [];
    v.pantry.push(freshStack(day, 'Deer meat', 19, 200, 1 - bonus)); // 3800 doomed
    v.pantry.push(freshStack(day, 'Beans', 40, 100, 30));            // 4000 keeps
    const ctx = ctxWithContrib(day);
    // no preserved-kcal history -> drive never demonstrated -> no yield
    wrapped.upkeep(Game, ctx);
    check('R8b idle drive: fires (fail-safe toward the primary)', ctx._pwFeasts === 1);
    check('R8b no smoke yield counted', !ctx._pwSmokeYield);
    lines.length = 0;
  }

  // ---------- R9: windfall-drawn beast tracked; detail records it ----------
  {
    process.env.PORTIONWINDFALL = '1';
    const { Game, v, s, day, bonus } = await fixture();
    sayStub(Game);
    v.pantry = [];
    v.pantry.push(freshStack(day, 'Deer meat', 30, 200, 1 - bonus)); // 6000 doomed
    v.pantry.push(freshStack(day, 'Beans', 40, 100, 30));            // 4000 keeps
    const ctx = ctxWithContrib(day);
    const oHF = Game.hostFeast;
    Game.hostFeast = function () { return { ok: true, spent: 3200, draw: 'hushwolf' }; };
    wrapped.upkeep(Game, ctx);
    Game.hostFeast = oHF;
    check('R9 windfall fired', ctx._pwFeasts === 1);
    check('R9 windfall-drawn beast tracked', (ctx._pwScavDrawDays || []).length === 1 && ctx._pwScavDrawDays[0] === day);
    const det = (ctx._pwFireDetail || [])[0] || {};
    check('R9 detail records the drawn beast', det.scavDrawn === 'hushwolf');
    lines.length = 0;
  }

  // ---------- R10: gate-off RED — reconciliations leak nothing ----------
  {
    delete process.env.PORTIONWINDFALL;
    const { Game, day } = await fixture();
    sayStub(Game);
    const ctx = ctxWithContrib(day);
    wrapped.upkeep(Game, ctx);
    check('R10 gate off: no fire', !ctx._pwFeasts);
    check('R10 gate off: no recon suppression keys', ctx._pwReconSuppress === undefined && ctx._pwSmokeYield === undefined);
    check('R10 gate off: no preserved ledger', ctx._pwPresKcal === undefined);
    check('R10 gate off: no voice', !lines.some(l => /won't keep till tomorrow/.test(l)));
  }

  // ---------- R11: determinism with reconciliations on ----------
  {
    process.env.PORTIONWINDFALL = '1';
    const run = async () => {
      const { Game, s, day } = await fixture();
      sayStub(Game);
      s.prog = s.prog || {}; s.prog.feastSurge = 1.5;
      Game.feastedActive = () => false;
      const ctx = ctxWithContrib(day);
      ctx._pwScavDrawDays = [day - 1];
      wrapped.upkeep(Game, ctx);
      lines.length = 0;
      return (ctx._pwFeasts || 0) + ':' + (ctx._pwReconSuppress || 0) + ':' + (ctx._pwSmokeYield || 0);
    };
    const a = await run(), b = await run();
    check('R11 deterministic (' + a + ' vs ' + b + ')', a === b);
  }

  delete process.env.PORTIONWINDFALL;
  delete process.env.WINDFALL_RECONCILE;
  delete process.env.WINDFALL_YIELD_SMOKE;
  console.log(fail ? 'PROOF FAIL' : 'PROOF GREEN');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF ERROR', e); process.exit(2); });

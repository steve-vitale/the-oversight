#!/usr/bin/env node
// scripts/test-drawvol-20261016.js — PROOF for the DRAWVOL arm (loop B,
// 2026-10-16, food-economy axis — the sim-floorday3-b named next).
//
// THE LEVER (scripts/policies/drawvol.js): a daily drawdown-outflow budget
// (CAP kcal), live only when fresh-days < 6. Obligated outflow
// (payTribute/tendLink) is observed and consumes the budget but is NEVER
// held. Discretionary outflow (aid gives via answerAidBeg, feasts via
// hostFeast) is HELD once the day's cumulative outflow would exceed the
// cap — counted (drawvolHeld) and narrated as prudence (voice-only,
// deterministic, no RNG).
//
// DRAWDVOL=1 gate, default OFF. DRAWDVOL_CAP overrides the cap in kcal
// (fixtures use it to force engagement). Cap default 2500 = the measured
// margin (scripts/measure-drawvol-20261016.js: cap=2500 -> ~4 holds/8
// runs; cap>=4000 -> 0 holds, invisible).
//
// RED (DRAWDVOL unset):
//   R1. gate-off delegation byte-identical: wrapped vs bare belongfeast,
//       2 seeds x 40d, identical per-day hashes.
//   R2. gate off + fd 4.5 fixture: aid + feast BOTH fire (no holds possible).
// GREEN (DRAWDVOL=1):
//   G1. fd 4.5, DRAWDVOL_CAP=3000: aid beg + feast plan in one day -> aid
//       FIRES in daily (0+1500<=3000), feast HELD in upkeep
//       (1500+2000>3000). drawvolHeld=1, kind feast, feast drew nothing.
//   G2. obligated consumes budget before discretionary (DRAWDVOL_CAP=3000,
//       belong road): weekly tribute fires in daily (obligated>0), then the
//       aid beg is HELD (obligated+1500>3000). Control (tribute already
//       paid this week): the aid FIRES, zero holds.
//   G3. fd 7, DRAWDVOL_CAP=100 (tiny): aid + feast BOTH fire, zero holds —
//       the fd band dominates the budget.
//   G4. prudence narration: the hold beat fired, voice-only (the hold drew
//       nothing), deterministic (no Math.random/R() in drawvol.js, static),
//       carries the fresh-day number.
// DET-GATE: 2 seeds x 2 sides (unset / =1), 40d, byte-identical reruns.
// SMOKE: ids honest, capKcal() reads env, hold-event log exists.
//
// Policy-side only: no src/js changes, no edits to existing policy files.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-drawvol-20261016.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const DV = require('./policies/drawvol');
const { belongfeast } = require('./policies/feastscale');

const fails = [];
function check(name, cond, detail) {
  const ok = !!cond;
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails.push(name);
}

function freshItem(Game, name, kcal, daysLeft) {
  const day = (Game.state.scholar || {}).day || 1;
  return { name, kcalEach: 500, units: Math.ceil(kcal / 500), safe: true, spoilDay: day + daysLeft };
}

function addOwedTributeLink(Game) {
  Game.state.otherVillages = (Game.state.otherVillages || []).concat([
    { id: 'bigkeep', name: 'Bigkeep', pantryKcal: 50000, population: 20, day: 0, roster: [] },
  ]);
  const m = Game.mshipState();
  m.links = m.links || [];
  m.links.push({
    id: 'link_owed', primary: 'bigkeep', subordinate: 'haven',
    day: 0, trust: 50, status: 'active', tributeKcalPerWeek: 4000,
    tributePaidKcal: 0, tributeWeek: -1, tributePaidWeek: -1,
    arrears: 0, history: [], mourningUntil: 0,
  });
  return m.links[m.links.length - 1];
}

// fd-fixture world: fresh kcal tuned for a target fresh-days at burn 24k.
async function buildWorld(seed, freshKcal) {
  const { Game } = await loadGame({ seed, mode: 'drawvol-proof' });
  await setupGame(Game);
  const said = [];
  Game.say = (t) => { said.push(String(t)); };
  Game.feedback = function () {};
  Game.state.scholar.day = 30;
  const v = Game.state.village;
  v.burnHistory = [24000, 23500, 24200, 23800, 24100, 23900, 24000];
  v.pantry = [freshItem(Game, 'Foraged food', freshKcal, 3)];
  v.lastRaidDay = 0;
  return { Game, said };
}
function pantryKcal(Game) {
  return ((Game.state.village || {}).pantry || [])
    .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
}
function fdOf(Game) { try { return Game.pantryFreshDays(); } catch (e) { return -1; } }

// feast fixture: one candidacy, cost 2000, via scaleFeast only (eveningFeast
// stays gated: village.gives is 0, so its recentGives>=1500 gate fails).
function feastFixture(Game, ctx, cost) {
  Game.mshipState().links = [];
  Game.dayPart = 2; // dusk
  const day = Game.state.scholar.day;
  ctx._tribHist = [{ day: day - 1, kcal: 2000 }]; // scaleFeast contrib gate
  const realPlan = Game.feastPlan();
  // The engine recomputes cost = max(1500, 400*(invited+1)) inside
  // hostFeast — trim the guest list so the engine agrees with the fixture
  // cost (else have < recomputed cost and the engine refuses "Not today").
  const guests = (realPlan.guests || []).slice(0, Math.max(1, Math.round(cost / 400) - 1));
  const fake = Object.assign({}, realPlan, { ok: true, cost, have: cost * 2, guests });
  Game.feastPlan = function () { return fake; };
}
function aidFixture(Game, amount) {
  Game.state.pendingAidBeg = { villageId: 'thinval', amount: amount || 1500, face: 'a gaunt woman' };
}

function setSide(on, cap) {
  if (on) process.env.DRAWDVOL = '1'; else delete process.env.DRAWDVOL;
  if (cap) process.env.DRAWDVOL_CAP = String(cap); else delete process.env.DRAWDVOL_CAP;
}

async function runHashes(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'drawvol-det' });
  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, policy);
  const base = policy.daily;
  wrapped.daily = (G, ctx) => {
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    return base ? base(G, ctx) : undefined;
  };
  await quietLog(async () => { await runDays(Game, wrapped, { days, sampleEvery: 1 }); });
  return hashes;
}

(async () => {
  console.log('== drawvol proof — RED(DRAWDVOL unset) + GREEN(DRAWDVOL=1) ==');

  // ---------- R1: gate-off delegation byte-identical ----------
  console.log('== R1. gate-off delegation byte-identical (wrapped vs bare) ==');
  setSide(false);
  for (const seed of [11, 22]) {
    const hBare = await runHashes(belongfeast, seed, 40);
    const hWrap = await runHashes(DV.drawvolbelong, seed, 40);
    const same = hBare.length === hWrap.length && hBare.every((h, i) => h === hWrap[i]);
    check(`R1 (seed ${seed}): DRAWDVOL unset -> wrapped == bare`, same, `n=${hBare.length}/${hWrap.length}`);
  }

  // ---------- R2: gate off, fd 4.5 -> both verbs fire ----------
  console.log('== R2. gate OFF + fd 4.5: aid + feast BOTH fire (no holds possible) ==');
  {
    setSide(false);
    const { Game } = await buildWorld(43, 108000); // fd 4.5
    const fd = fdOf(Game);
    const ctx = {};
    DV.drawvollead.setup(Game, ctx);
    aidFixture(Game, 1500);
    feastFixture(Game, ctx, 2000);
    const before = pantryKcal(Game);
    await quietLog(async () => { await DV.drawvollead.daily(Game, ctx); });
    const aidFired = (ctx._dv ? ctx._dv.discretionary : 0) >= 1500 || ((Game.state.village || {}).pantry || []).length >= 0;
    await quietLog(async () => { await DV.drawvollead.upkeep(Game, ctx); });
    const after = pantryKcal(Game);
    check('R2: fixture is fd<6 (the prudence band)', fd > 4 && fd < 6, 'fd=' + fd.toFixed(2));
    check('R2: aid fired (gate off ignores the budget)', before - after >= 1500, `pantry ${before}->${after}`);
    check('R2: feast fired too (no holds with the layer off)', before - after >= 3400, `drawn=${before - after}`);
    check('R2: no hold counters exist with the layer off', ctx.drawvolHeld === undefined, `drawvolHeld=${ctx.drawvolHeld}`);
    void aidFired;
  }

  // ---------- G1: fd 4.5, cap 3000 -> aid fires, feast held ----------
  console.log('== G1. DRAWDVOL=1, fd 4.5, cap 3000: aid FIRES, feast HELD ==');
  let g1said = null;
  {
    setSide(true, 3000);
    const { Game, said } = await buildWorld(44, 108000);
    g1said = said;
    const ctx = {};
    DV.drawvollead.setup(Game, ctx);
    aidFixture(Game, 1500);
    feastFixture(Game, ctx, 2000);
    const before = pantryKcal(Game);
    await quietLog(async () => { await DV.drawvollead.daily(Game, ctx); });
    const afterAid = pantryKcal(Game);
    const aidDrew = before - afterAid;
    await quietLog(async () => { await DV.drawvollead.upkeep(Game, ctx); });
    const afterFeast = pantryKcal(Game);
    check('G1: aid fired in daily (0+1500<=3000)', aidDrew >= 1500 && aidDrew < 2000, `aidDrew=${aidDrew}`);
    check('G1: feast HELD in upkeep (1500+2000>3000)', afterAid - afterFeast === 0, `feastDrew=${afterAid - afterFeast}`);
    check('G1: drawvolHeld=1', ctx.drawvolHeld === 1, `drawvolHeld=${ctx.drawvolHeld}`);
    check('G1: hold event is kind=feast, cost=2000',
      ctx._dvHoldEvents.length === 1 && ctx._dvHoldEvents[0].kind === 'feast' && ctx._dvHoldEvents[0].cost === 2000,
      JSON.stringify(ctx._dvHoldEvents[0]));
    check('G1: day bucket accounts the aid as discretionary',
      ctx._dv.discretionary >= 1500 && ctx._dv.obligated === 0,
      `disc=${ctx._dv.discretionary} obl=${ctx._dv.obligated}`);
  }

  // ---------- G2: obligated consumes budget before discretionary ----------
  console.log('== G2. obligated consumes budget first (belong road, cap 3000) ==');
  {
    // armed: tribute fires, then the aid is held
    setSide(true, 3000);
    const { Game } = await buildWorld(45, 108000);
    addOwedTributeLink(Game);
    const ctx = {};
    DV.drawvolbelong.setup(Game, ctx);
    aidFixture(Game, 1500);
    await quietLog(async () => { await DV.drawvolbelong.daily(Game, ctx); });
    const b = ctx._dv;
    check('G2 armed: weekly tribute fired (obligated>0)', (b.obligated || 0) > 0, `obligated=${b.obligated}`);
    check('G2 armed: aid HELD (obligated+1500>3000)', ctx.drawvolHeld === 1 &&
      ctx._dvHoldEvents.length === 1 && ctx._dvHoldEvents[0].kind === 'aid',
      `held=${ctx.drawvolHeld} kind=${(ctx._dvHoldEvents[0] || {}).kind}`);
    check('G2 armed: the hold refused aloud (engine consequences, not silent)',
      (ctx.aidRefused || 0) >= 1, `aidRefused=${ctx.aidRefused}`);
    // control: tribute already paid this week -> aid FIRES
    const { Game: G2 } = await buildWorld(45, 108000);
    const link = addOwedTributeLink(G2);
    try { link.tributePaidWeek = (G2._week ? G2._week() : 0); } catch (e) {}
    const ctx2 = {};
    DV.drawvolbelong.setup(G2, ctx2);
    aidFixture(G2, 1500);
    await quietLog(async () => { await DV.drawvolbelong.daily(G2, ctx2); });
    check('G2 control: no tribute -> aid FIRES (0+1500<=3000)',
      (ctx2._dv.discretionary || 0) >= 1500 && (ctx2.drawvolHeld || 0) === 0,
      `disc=${ctx2._dv.discretionary} held=${ctx2.drawvolHeld}`);
  }

  // ---------- G3: fd>=6 dominates a tiny cap ----------
  console.log('== G3. fd 7 + cap 100: BOTH verbs fire, zero holds ==');
  {
    setSide(true, 100);
    const { Game } = await buildWorld(46, 168000); // fd 7
    const fd = fdOf(Game);
    const ctx = {};
    DV.drawvollead.setup(Game, ctx);
    aidFixture(Game, 1500);
    feastFixture(Game, ctx, 2000);
    const before = pantryKcal(Game);
    await quietLog(async () => { await DV.drawvollead.daily(Game, ctx); });
    await quietLog(async () => { await DV.drawvollead.upkeep(Game, ctx); });
    const drawn = before - pantryKcal(Game);
    check('G3: fixture is fd>=6', fd >= 6, 'fd=' + fd.toFixed(2));
    check('G3: aid + feast both fired despite the tiny cap', drawn >= 3400, `drawn=${drawn}`);
    check('G3: zero holds (the fd band dominates the budget)', (ctx.drawvolHeld || 0) === 0, `held=${ctx.drawvolHeld}`);
  }

  // ---------- G4: prudence narration ----------
  console.log('== G4. prudence narration: voice-only, deterministic, honest ==');
  {
    const src = fs.readFileSync(__dirname + '/policies/drawvol.js', 'utf8');
    check('G4 static: no Math.random in the layer', !/Math\.random/.test(src));
    check('G4 static: no R() draws in the layer', !/[^a-zA-Z]R\(\)/.test(src));
    const beat = (g1said || []).find(s => /fire waits for a fatter day/.test(s));
    check('G4: the hold beat fired', !!beat, beat ? beat.slice(0, 80) + '...' : 'none');
    check('G4: the beat carries the fresh-day number', /~?\d+ days of fresh/.test(beat || ''));
    check('G4: the beat reads as people deciding, not a policy executing',
      /elders decide|Not tonight/.test(beat || ''));
    console.log('  QUOTE (hold beat): ' + (beat || '(none)'));
  }

  // ---------- DET-GATE ----------
  console.log('== DET-GATE. 2 seeds x 2 sides, 40d reruns byte-identical ==');
  for (const [side, on, cap] of [['off', false, 0], ['on', true, 2500]]) {
    setSide(on, cap);
    for (const seed of [11, 22]) {
      const h1 = await runHashes(DV.drawvollead, seed, 40);
      const h2 = await runHashes(DV.drawvollead, seed, 40);
      const same = h1.length === h2.length && h1.every((h, i) => h === h2[i]);
      check(`det-gate (${side}, seed ${seed}): rerun byte-identical`, same, `n=${h1.length}/${h2.length}`);
    }
  }

  // ---------- SMOKE ----------
  console.log('== SMOKE. layer-live markers ==');
  {
    setSide(true, 0);
    check('SMOKE: capKcal() defaults to the measured 2500', DV.capKcal() === 2500, `cap=${DV.capKcal()}`);
    setSide(true, 777);
    check('SMOKE: DRAWDVOL_CAP overrides', DV.capKcal() === 777, `cap=${DV.capKcal()}`);
    check('SMOKE: FD_BAND is 6', DV.FD_BAND === 6);
    const { Game } = await loadGame({ seed: 982, mode: 'drawvol-smoke' });
    await setupGame(Game);
    const ctx = {};
    DV.drawvolbelong.setup(Game, ctx);
    check('SMOKE: policy id stays the substrate id', DV.drawvolbelong.id === 'belongfeast', DV.drawvolbelong.id);
    check('SMOKE: hold-event log exists (layer ran setup)', Array.isArray(ctx._dvHoldEvents));
    check('SMOKE: layerOn() true with DRAWDVOL=1', DV.layerOn() === true);
    setSide(false);
    check('SMOKE: layerOn() false with DRAWDVOL unset', DV.layerOn() === false);
  }

  delete process.env.DRAWDVOL;
  delete process.env.DRAWDVOL_CAP;
  console.log(fails.length ? `\nPROOF FAILED: ${fails.length} — ${fails.join('; ')}` : '\nPROOF GREEN: all checks passed.');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e && e.stack || e); process.exit(2); });

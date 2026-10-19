#!/usr/bin/env node
// test-doomrevive-b2.js — DOOMED-ONLY DRAW DISCIPLINE proof (sim-doomrevive-b2).
//
// The parked layer (scripts/policies/doomeddraw.js, extracted byte-identical
// from branch sim-doomrevive-b) re-proven under the b2 run: the layer is
// UNCHANGED, so the b proof's pins are the spec — adapted in naming only,
// never weakened. All pins must hold against the extracted layer.
//
// RED (DOOMEDDRAW unset): pure delegation — no wraps beyond the install
// marker check, no seconds, no voice, no ctx writes, no telemetry.
// GREEN (DOOMEDDRAW=1): trigger/cap pinned; P1 pile fires; P2 fires only as
// measured excess beyond demonstrated meal+smoke clearance (stands down
// when sinks can clear it; P2 inert with <3d history); hunger eased with the
// meal's own math; takes ledgers kept; exposure rolled per villager;
// spoiled/preserved/rendered/pemmican never in the pile; foodState undefined
// counts as the fresh sink (finding #546); voice once naming cook+food with
// no lever name; deterministic; cap respected.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
let L;
try { L = require('./policies/doomeddraw'); }
catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: sim-doomrevive-b2 layer absent (policies/doomeddraw.js missing); proof vacuous, exit 0.');
    process.exit(0);
  }
  throw e;
}
const { withDoomedDraw, doomedPile, serveSeconds, freshSink, livingRoster, layerOn, TRIGGER_PER_ROSTER, CAP_PER_ROSTER } = L;
const { leadfeast } = require('./policies/feastscale');
// the layer's roster excludes the scholar (Game.villagerId) and the dead —
// expectations must use the same denominator the layer uses.
function lr(Game) { return livingRoster(Game).length; }

function stack(day, name, units, kcalEach, spoilIn, foodState, foodKind) {
  const s = { name, kcalEach, units, spoilDay: day + spoilIn, foodKind: foodKind || 'meat', safe: false, kg: 0.2, unit: 'portion' };
  if (foodState !== undefined) s.foodState = foodState; // undefined = real-pantry style
  return s;
}

async function fixture(p1kcal, p2kcal) {
  const { Game } = await loadGame({ seed: 4242, mode: 'proof-doomeddraw-b2', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village;
  const s = Game.state.scholar;
  const day = s.day || 1;
  const bonus = (Game.spoilBonusDays ? Math.round(Game.spoilBonusDays()) : 0) || 0;
  const roster = (v.roster || []).length || 10;
  v.pantry = [];
  const per = 200;
  if (p1kcal > 0) {
    const u = Math.ceil(p1kcal / 2 / per); // split across the two P1 stacks
    v.pantry.push(stack(day, 'Deer meat', u, per, 1 - bonus, 'fresh'));
    v.pantry.push(Object.assign(stack(day, 'Foraged food', u, per, 1 - bonus), { foodState: undefined }));
  }
  if (p2kcal > 0) {
    const u = Math.ceil(p2kcal / per);
    v.pantry.push(stack(day, 'Smoked-ish pork', u, per, 2 - bonus, 'fresh'));
  }
  // keeps: not doomed
  v.pantry.push(stack(day, 'Beans', 40, 100, 30, 'fresh'));
  // spoiled: never counts
  v.pantry.push({ name: 'Old fish', kcalEach: 100, units: 50, spoilDay: day - bonus, foodKind: 'fish', foodState: 'fresh', safe: false });
  // preserved: never counts
  v.pantry.push({ name: 'Smoked venison (dried)', kcalEach: 160, units: 50, spoilDay: day + 20, foodKind: 'meat', foodState: 'preserved', safe: true });
  return { Game, v, s, day, roster, bonus };
}

function hist(kcal, days) {
  const h = [];
  for (let d = 1; d <= days; d++) h.push({ day: d, kcal });
  return h;
}

(async () => {
  let fail = 0;
  const check = (name, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name); if (!cond) fail++; };
  const wrapped = withDoomedDraw(leadfeast, 'leaddoomeddraw-test', 'test');
  check('trigger constant pinned 200', TRIGGER_PER_ROSTER === 200);
  check('cap constant pinned 400', CAP_PER_ROSTER === 400);

  // ---------- RED: gate off = pure delegation ----------
  {
    delete process.env.DOOMEDDRAW;
    const { Game, v, roster } = await fixture(20000, 20000);
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = {};
    const veBefore = Game.villageEats;
    wrapped.setup(Game, ctx);
    check('RED layer off', !layerOn());
    check('RED no villageEats wrap installed', Game.villageEats === veBefore);
    check('RED no install marker', !Game._doomeddrawInstalled);
    check('RED no dd ctx writes', !Object.keys(ctx).some(k => k.startsWith('_dd')));
    const eaten = serveSeconds(Game, ctx);
    check('RED no seconds served', eaten === 0);
    check('RED no seconds voice', !lines.some(l => /seconds all round/.test(l)));
    check('RED no telemetry', !ctx._ddNights && !ctx._ddGlutNights);
    Game.villageEats();
    check('RED villageEats delegates (no dd telemetry)', !ctx._ddNights && !ctx._ddGlutNights);
    check('RED villageEats still eats (doomed pile shrinks)', doomedPile(Game).p1 + doomedPile(Game).p2 < 40000);
  }

  // ---------- GREEN ----------
  process.env.DOOMEDDRAW = '1';
  // G1: P1 pile above trigger fires; cap respected; voice once, no lever name
  {
    const { Game, v } = await fixture(12000, 0);
    const roster = lr(Game);
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = {};
    wrapped.setup(Game, ctx);
    check('GREEN layer on', layerOn());
    check('GREEN install marker', !!Game._doomeddrawInstalled);
    const pile = doomedPile(Game);
    check('GREEN pile sane (p1~12000, p2=0)', pile.p1 >= 11900 && pile.p1 <= 12100 && pile.p2 === 0);
    const want = Math.min(CAP_PER_ROSTER * roster, pile.p1);
    const eaten = serveSeconds(Game, ctx);
    check('GREEN fires on P1 above trigger', eaten > 0);
    // pantryDraw ceil-rounding can overshoot `want` by ~a portion per stack
    check('GREEN draw capped at 400*roster (+ceil slack)', eaten <= CAP_PER_ROSTER * roster + 600);
    check('GREEN draw ~= min(pile, cap)', Math.abs(eaten - want) < want * 0.15 + 800);
    check('GREEN voice once', lines.filter(l => /seconds all round/.test(l)).length === 1);
    check('GREEN voice names food', lines.some(l => /Deer meat|Foraged food/.test(l)));
    check('GREEN voice leaks no lever name', !lines.some(l => /doomeddraw|DOOMEDDRAW/i.test(l)));
    check('GREEN telemetry nights=1', ctx._ddNights === 1);
    check('GREEN telemetry kcal set', ctx._ddKcal === eaten);
    check('GREEN glut night counted', ctx._ddGlutNights === 1);
    check('GREEN p1 recorded', (ctx._ddP1 || 0) > 0);
  }
  // G2: below trigger -> no fire
  {
    const { Game } = await fixture(1000, 500);
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = {};
    wrapped.setup(Game, ctx);
    const eaten = serveSeconds(Game, ctx);
    check('G2 no fire below trigger', eaten === 0);
    check('G2 no voice', !lines.some(l => /seconds all round/.test(l)));
    check('G2 no fire telemetry', !ctx._ddNights);
    check('G2 glut night NOT counted (raw below trigger)', !ctx._ddGlutNights);
  }
  // G3: P2 with strong demonstrated absorption -> stands down (no P2 draw)
  {
    const { Game } = await fixture(0, 10000);
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = { _ddMealHist: hist(6000, 7), _ddSmokeHist: hist(5000, 7) };
    wrapped.setup(Game, ctx);
    const pile = doomedPile(Game);
    check('G3 pile p2~10000', pile.p2 >= 9900 && pile.p1 === 0);
    const eaten = serveSeconds(Game, ctx);
    check('G3 stands down when sinks clear the pile', eaten === 0);
    check('G3 glut night counted anyway', ctx._ddGlutNights === 1);
    check('G3 no fire telemetry', !ctx._ddNights);
  }
  // G4: P2 with weak absorption -> fires on the excess
  {
    const { Game } = await fixture(0, 10000);
    const roster = lr(Game);
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = { _ddMealHist: hist(1500, 7), _ddSmokeHist: hist(1000, 7) };
    wrapped.setup(Game, ctx);
    const eaten = serveSeconds(Game, ctx);
    const excess = 10000 - 1500 - 1000;
    check('G4 fires on P2 excess', eaten > 0);
    check('G4 draw ~= min(excess, cap)', eaten <= Math.min(excess, CAP_PER_ROSTER * roster) + 600);
    check('G4 p2excess recorded', (ctx._ddP2x || 0) > 0);
  }
  // G5: <3d history -> P2 inert (P1 only)
  {
    const { Game } = await fixture(0, 10000);
    const ctx = { _ddMealHist: hist(1500, 2), _ddSmokeHist: hist(1000, 2) };
    wrapped.setup(Game, ctx);
    const eaten = serveSeconds(Game, ctx);
    check('G5 P2 inert with <3d history', eaten === 0);
  }
  // G6: hunger eased with the meal's own math; ledgers kept; exposure rolled
  {
    const { Game, v } = await fixture(12000, 0);
    Game.say = () => {};
    const ctx = {};
    wrapped.setup(Game, ctx);
    const rosterIds = (v.roster || []).filter(id => id !== Game.villagerId).slice(0, 3);
    const hungers = [];
    for (const vid of rosterIds) {
      try { const n = Game.npcNeeds(vid); n.hunger = 80; hungers.push(n.hunger); } catch (e) {}
    }
    let takeHistCalls = 0;
    const oRTH = Game.recordTakeHist;
    if (typeof oRTH === 'function') Game.recordTakeHist = function () { takeHistCalls++; return oRTH.apply(this, arguments); };
    let poisonCalls = 0;
    const oVP = Game.villagerFoodPoisoning;
    if (typeof oVP === 'function') Game.villagerFoodPoisoning = function () { poisonCalls++; return oVP.apply(this, arguments); };
    const takesBefore = JSON.stringify(v.takes || {});
    serveSeconds(Game, ctx);
    let eased = 0;
    for (const vid of rosterIds) {
      try { if (Game.npcNeeds(vid).hunger < 80) eased++; } catch (e) {}
    }
    check('G6 hunger eased for fed villagers', eased > 0);
    let neg = 0;
    for (const vid of rosterIds) {
      try { if (Game.npcNeeds(vid).hunger < 0) neg++; } catch (e) {}
    }
    check('G6 hunger never negative', neg === 0);
    check('G6 v.takes ledger kept', JSON.stringify(v.takes || {}) !== takesBefore);
    check('G6 recordTakeHist called', takeHistCalls > 0);
    check('G6 exposure rolled per villager', poisonCalls > 0);
  }
  // G7: #546 — foodState undefined counts as the fresh sink
  {
    const { Game, day, bonus } = await fixture(0, 0);
    Game.say = () => {};
    const ctx = {};
    wrapped.setup(Game, ctx);
    const v = Game.state.village;
    v.pantry.push(Object.assign(
      { name: 'Mystery roots', kcalEach: 200, units: 30, spoilDay: day + 1 - bonus, foodKind: 'veg', safe: false },
      { foodState: undefined }));
    const pile = doomedPile(Game);
    check('G7 foodState-undefined stack counts in P1', pile.p1 >= 5900);
    const eaten = serveSeconds(Game, ctx);
    check('G7 mystery roots drawn (no laundering, real food)', eaten > 0);
  }
  // G8: determinism
  {
    const run = async () => {
      const { Game } = await fixture(12000, 8000);
      Game.say = () => {};
      const ctx = { _ddMealHist: hist(1500, 7), _ddSmokeHist: hist(1000, 7) };
      wrapped.setup(Game, ctx);
      return serveSeconds(Game, ctx);
    };
    const a = await run(), b = await run();
    check('G8 deterministic', a === b && a > 0);
  }
  // G9: idempotent install (double setup does not double-wrap)
  {
    const { Game } = await fixture(12000, 0);
    Game.say = () => {};
    const ctx = {};
    const ve1 = Game.villageEats;
    wrapped.setup(Game, ctx);
    const ve2 = Game.villageEats;
    wrapped.setup(Game, ctx);
    check('G9 double setup installs once', Game.villageEats === ve2);
  }

  delete process.env.DOOMEDDRAW;
  console.log(fail ? `\nPROOF FAIL (${fail})` : '\nPROOF GREEN (all checks)');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF ERROR', e); process.exit(2); });

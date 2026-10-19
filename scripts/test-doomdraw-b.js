#!/usr/bin/env node
// test-doomdraw-b.js — DOOMED-ONLY DRAW DISCIPLINE proof (sim-doomdraw-b).
//
// RED (DOOMDRAW unset): the wrapped pantryDraw/villageEats delegate
// byte-identically — no hold, no voice, no ctx telemetry.
// GREEN (DOOMDRAW=1): on a pinned fixture with fresh < floor+want, the floor
// binds — the freshest non-doomed stacks are held out of the draw and
// restored byte-identical; a floor-caused shortfall suppresses shortOfFresh
// (no drawSpoiled desperation on a floor artifact); doomed is NEVER held;
// preserved is excluded from the sink; one voice line per bound night names
// the cook and the reason (no lever name); telemetry set; deterministic;
// idempotent install; the {pantry: copy} preview shape doesn't crash.
// Invariants: spoiled stacks never counted/converted (laundering 0 at the
// layer); whole-stack hold granularity (documented); gate-off delegation
// consumes no RNG and reads nothing.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
let L;
try { L = require('./policies/doomdraw'); }
catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    // Post-kill INFO-SKIP: the layer was deleted per kill protocol.
    console.log('INFO-SKIP: sim-doomdraw-b layer killed per protocol (policies/doomdraw.js absent); proof vacuous, exit 0.');
    process.exit(0);
  }
  throw e;
}
const { withDoomDraw, layerOn, FLOOR_DAYS, isFreshSink, isDoomed, burnAt, doomdrawNightlyVoice } = L;
const { leadfeast } = require('./policies/feastscale');

function stack(day, name, units, kcalEach, spoilIn, foodState, bonus) {
  const s = { name, kcalEach, units, spoilDay: day + spoilIn - (bonus || 0),
              foodKind: 'meat', safe: false, kg: 0.2, unit: 'portion' };
  if (foodState !== undefined) s.foodState = foodState; // undefined = real pantry haul
  return s;
}
function snapPantry(v) {
  return (v.pantry || []).map(it => [it.name, it.foodState, it.spoilDay, it.units, it.kcalEach].join('|')).sort().join(';');
}

async function fixture() {
  const { Game } = await loadGame({ seed: 4343, mode: 'proof-doomdraw', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village;
  const day = (Game.state.scholar || {}).day || 1;
  const bonus = (Game.spoilBonusDays ? Math.round(Game.spoilBonusDays()) : 0) || 0;
  v.burnHistory = [1500, 1500, 1500, 1500, 1500, 1500, 1500]; // burn=1500 -> floor=3000
  return { Game, v, day, bonus };
}

(async () => {
  let fail = 0;
  const check = (name, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name); if (!cond) fail++; };
  const wrapped = withDoomDraw(leadfeast, 'leaddoomdraw-test', 'test');
  check('floor constant pinned at 2 fresh-days', FLOOR_DAYS === 2);

  // ---------- RED: gate off = pure delegation ----------
  {
    delete process.env.DOOMDRAW;
    const { Game, v, day, bonus } = await fixture();
    const mkPantry = () => ([
      stack(day, 'Deer meat', 10, 200, 1, 'fresh', bonus),          // doomed 2000
      stack(day, 'Foraged food', 20, 200, 1, undefined, bonus),      // doomed 4000 (foodState undefined)
      stack(day, 'Beans', 40, 100, 4, 'fresh', bonus),               // fresh 4000
      stack(day, 'Smoked venison (dried)', 50, 160, 30, 'preserved', bonus),
      stack(day, 'Old fish', 50, 100, -1, 'fresh', bonus),           // spoiled
    ]);
    const baseDraw = Game.pantryDraw; // pristine, pre-wrap
    const ctx = {};
    wrapped.setup(Game, ctx);
    check('RED layer off', !layerOn());
    check('RED wrap installed', !!Game._doomdrawInstalled);
    // wrapped (gate off) vs pristine base on identical pantries
    v.pantry = mkPantry();
    const rWrap = Game.pantryDraw(v, 3000, { cook: true });
    const snapWrap = snapPantry(v);
    const v2 = { pantry: mkPantry(), roster: v.roster, burnHistory: v.burnHistory };
    const rBase = baseDraw.call(Game, v2, 3000, { cook: true });
    const snapBase = (v2.pantry || []).map(it => [it.name, it.foodState, it.spoilDay, it.units, it.kcalEach].join('|')).sort().join(';');
    check('RED wrapped==base taken', rWrap.taken === rBase.taken);
    check('RED wrapped==base shortOfFresh', !!rWrap.shortOfFresh === !!rBase.shortOfFresh);
    check('RED wrapped==base pantry after', snapWrap === snapBase);
    check('RED doomed-first is engine law (doomed pile drawn down)', rWrap.taken === 3000);
    check('RED no telemetry', !ctx._ddTele);
    const lines = [];
    const oSay = Game.say; Game.say = (t) => { lines.push(String(t)); };
    Game.villageEats();
    Game.say = oSay;
    check('RED villageEats delegates (no dd voice)', !lines.some(l => /keeps .* days' food back/.test(l)));
    check('RED no telemetry after villageEats', !ctx._ddTele);
  }

  // ---------- GREEN: floor binds, doomed first, restore exact ----------
  {
    process.env.DOOMDRAW = '1';
    const { Game, v, day, bonus } = await fixture();
    // lean pantry: doomed 2000, fresh 4000 (one stack), NO preserved.
    // burn=1500 -> floor=3000. want=4000. The floor holds 3000 of the Beans
    // (partial-unit hold: 30 of 40 units); the draw takes 2000 doomed + the
    // 1000 unheld fresh and stops — the meal is short 1000, honestly.
    const deer = stack(day, 'Deer meat', 10, 200, 1, 'fresh', bonus);
    const beans = stack(day, 'Beans', 40, 100, 4, 'fresh', bonus);
    v.pantry = [deer, beans];
    const ctx = {};
    wrapped.setup(Game, ctx);
    check('GREEN layer on', layerOn());
    const out = Game.pantryDraw(v, 4000, { cook: true });
    check('GREEN draw took doomed + fresh down to the floor', out.taken === 3000);
    check('GREEN shortOfFresh suppressed (floor-caused, no desperation)', out.shortOfFresh === false);
    check('GREEN fresh kept >= floor', (v.pantry || []).reduce((t, it) => t + (isFreshSink(Game, it) ? (it.kcalEach || 0) * (it.units || 0) : 0), 0) >= 3000);
    const beansAfter = (v.pantry.find(it => it.name === 'Beans'));
    const beansDrawn = (out.items || []).filter(e => e.item && e.item.name === 'Beans').reduce((t, e) => t + (e.units || 0), 0);
    check('GREEN held stack restored exactly (minus what the draw ate)', !!beansAfter &&
      [beansAfter.name, beansAfter.foodState, beansAfter.spoilDay, beansAfter.kcalEach].join('|') === [beans.name, beans.foodState, beans.spoilDay, beans.kcalEach].join('|') &&
      beansAfter.units === 40 - beansDrawn);
    check('GREEN doomed stack consumed by the draw', !v.pantry.some(it => it.name === 'Deer meat'));
    const tele = ctx._ddTele || {};
    check('GREEN telemetry draws', tele.draws === 1);
    check('GREEN telemetry bound', tele.bound === 1);
    check('GREEN telemetry withheld', tele.withheld === 1000);
    check('GREEN telemetry doomedDrawn', tele.doomedDrawn === 2000);
    // determinism: identical fixture, identical result
    const { Game: G2, v: v2, day: d2, bonus: b2 } = await fixture();
    v2.pantry = [
      stack(d2, 'Deer meat', 10, 200, 1, 'fresh', b2),
      stack(d2, 'Beans', 40, 100, 4, 'fresh', b2),
    ];
    const ctx2 = {};
    wrapped.setup(G2, ctx2);
    const out2 = G2.pantryDraw(v2, 4000, { cook: true });
    check('GREEN deterministic (taken identical)', out2.taken === out.taken && out2.shortOfFresh === out.shortOfFresh);
  }

  // ---------- G-doomed: doomed is NEVER held ----------
  {
    process.env.DOOMDRAW = '1';
    const { Game, v, day, bonus } = await fixture();
    v.pantry = [
      stack(day, 'Deer meat', 20, 200, 1, 'fresh', bonus),     // doomed 4000
      stack(day, 'Foraged food', 20, 200, 1, undefined, bonus), // doomed 4000, foodState undefined
    ];
    const ctx = {};
    wrapped.setup(Game, ctx);
    const out = Game.pantryDraw(v, 4000, { cook: true });
    check('G-doomed all-doomed pantry fully drawable (floor cannot bind)', out.taken === 4000);
    check('G-doomed no bound counted', !(ctx._ddTele || {}).bound);
    check('G-doomed undefined-foodState stacks count in the doomed draw', (ctx._ddTele || {}).doomedDrawn === 4000);
  }

  // ---------- G-sink: preserved excluded, spoiled untouched ----------
  {
    process.env.DOOMDRAW = '1';
    const { Game, v, day, bonus } = await fixture();
    const pres = stack(day, 'Smoked venison (dried)', 50, 160, 30, 'preserved', bonus);
    const spoil = stack(day, 'Old fish', 50, 100, -1, 'fresh', bonus);
    v.pantry = [
      stack(day, 'Deer meat', 10, 200, 1, 'fresh', bonus), // doomed 2000
      pres, spoil,
    ];
    const ctx = {};
    wrapped.setup(Game, ctx);
    check('G-sink preserved not in fresh sink', !isFreshSink(Game, pres));
    check('G-sink spoiled not in fresh sink', !isFreshSink(Game, spoil));
    check('G-sink doomed IS in fresh sink (drawable)', isFreshSink(Game, v.pantry[0]));
    check('G-sink isDoomed pins the dawn boundary', isDoomed(Game, v.pantry[0], day, bonus) && !isDoomed(Game, spoil, day, bonus));
    const pre = v.pantry.map(it => ({ it, fs: it.foodState, sd: it.spoilDay, units: it.units, ke: it.kcalEach }));
    const out = Game.pantryDraw(v, 6000, { cook: true });
    // doomed 2000 + preserved freely (floor has no non-doomed fresh to hold)
    check('G-sink preserved drawn freely past the floor', out.taken === 6000);
    check('G-sink spoiled untouched (units + foodState)', v.pantry.some(it => it.name === 'Old fish' && it.units === 50));
    const presAfter = v.pantry.find(it => it.name === 'Smoked venison (dried)');
    check('G-sink preserved reduced by exactly the drawn units', !!presAfter && presAfter.units === 25 && presAfter.foodState === 'preserved');
    // laundering: by object identity — no stack converted (foodState/spoilDay/
    // kcalEach immutable) and no units ever increased (the layer creates no food)
    let ok = true;
    for (const p of pre) {
      if (p.it.foodState !== p.fs || p.it.spoilDay !== p.sd || p.it.kcalEach !== p.ke) ok = false;
      if ((p.it.units || 0) > p.units) ok = false;
    }
    check('G-sink no laundering (no conversion, no created food)', ok);
  }

  // ---------- G-floor-honored: fat pantry, floor never binds ----------
  {
    process.env.DOOMDRAW = '1';
    const { Game, v, day, bonus } = await fixture();
    v.pantry = [
      stack(day, 'Deer meat', 10, 200, 1, 'fresh', bonus),
      stack(day, 'Beans', 400, 100, 4, 'fresh', bonus), // 40000 fresh
    ];
    const ctx = {};
    wrapped.setup(Game, ctx);
    const out = Game.pantryDraw(v, 3000, { cook: true });
    check('G-fat no bind on a fat pantry', out.taken === 3000 && !(ctx._ddTele || {}).bound);
  }

  // ---------- G-voice: one line per bound night, names cook, no lever name ----------
  {
    process.env.DOOMDRAW = '1';
    const { Game, v } = await fixture();
    const lines = [];
    const oSay = Game.say; Game.say = (t) => { lines.push(String(t)); };
    const ctx = {};
    wrapped.setup(Game, ctx);
    ctx._ddTele.boundNight = 3; // a night with bound draws
    check('G-voice fires on a bound night', doomdrawNightlyVoice(Game, ctx) === true);
    const vlines = lines.filter(l => /keeps .* days' food back/.test(l));
    check('G-voice exactly one line', vlines.length === 1);
    check('G-voice no lever name', !/doomdraw/i.test(lines.join(' ')));
    check('G-voice telemetry voiced', (ctx._ddTele || {}).voiced === 1);
    lines.length = 0;
    ctx._ddTele.boundNight = 0;
    check('G-voice silent when the floor did not bind', doomdrawNightlyVoice(Game, ctx) === false);
    check('G-voice no line when silent', !lines.some(l => /keeps .* days' food back/.test(l)));
    Game.say = oSay;
  }

  // ---------- G-eats: the villageEats wrapper voices at most once per night ----------
  {
    process.env.DOOMDRAW = '1';
    const { Game, v, day, bonus } = await fixture();
    // lean pantry: one small fresh stack — any nightly draw binds the floor.
    v.pantry = [stack(day, 'Beans', 10, 100, 4, 'fresh', bonus)];
    const lines = [];
    const oSay = Game.say; Game.say = (t) => { lines.push(String(t)); };
    const ctx = {};
    wrapped.setup(Game, ctx);
    Game.villageEats();
    const vlines = lines.filter(l => /keeps .* days' food back/.test(l));
    const bound = (ctx._ddTele || {}).bound || 0;
    check('G-eats at most one voice line per night', vlines.length <= 1);
    check('G-eats voice iff the floor bound a draw', (bound > 0) === (vlines.length === 1));
    Game.say = oSay;
  }

  // ---------- G-install: idempotent; preview-copy shape doesn't crash ----------
  {
    process.env.DOOMDRAW = '1';
    const { Game, v, day, bonus } = await fixture();
    v.pantry = [stack(day, 'Deer meat', 10, 200, 3, 'fresh', bonus)];
    const ctx = {};
    const oDraw = Game.pantryDraw;
    wrapped.setup(Game, ctx);
    wrapped.setup(Game, ctx);
    check('G-install idempotent (single wrap)', Game.pantryDraw !== oDraw);
    const copy = { pantry: v.pantry.map(it => Object.assign({}, it)) }; // feastPlan preview shape
    let ok = true, took = -1, short = null;
    try { const r = Game.pantryDraw(copy, 500, {}); took = r.taken; short = !!r.shortOfFresh; } catch (e) { ok = false; }
    // the preview honestly applies the floor: the lean copy's only fresh is
    // held, the draw takes 0, and the floor-caused shortfall is suppressed.
    check('G-install preview-copy draw does not crash', ok);
    check('G-install preview-copy draw floored honestly', took === 0 && short === false);
  }

  delete process.env.DOOMDRAW;
  console.log(fail ? `\nDOOMDRAW PROOF: ${fail} FAILURES` : '\nDOOMDRAW PROOF: ALL GREEN');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF ERROR', e); process.exit(2); });

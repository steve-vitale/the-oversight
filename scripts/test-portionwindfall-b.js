#!/usr/bin/env node
// test-portionwindfall-b.js — PORTION-SCALED windfall feast proof (sim-portionwindfall-b).
//
// RED (PORTIONWINDFALL unset): the wrapped policy delegates byte-identically —
// the windfall never fires, no voice line, no telemetry.
// GREEN (PORTIONWINDFALL=1): on a pinned fixture (dusk, haven, doomed fresh >
// 300*roster, contribution met, affordable) the windfall fires exactly once:
// feastDay set, the doomed pile drawn down by ~one portion (<=275*roster),
// ctx telemetry set, fire-day bookkeeping recorded, cadence reset.
// Invariants: gates hold (below the PROVEN 300*roster threshold / already
// feasted / unaffordable / no contribution / away from haven -> no fire);
// NO FREQUENCY CAP (fires with 2 windfalls in the last 7d — the cap-alone
// arm's culprit is not re-landed); spoiled never counts as doomed; real pantry
// stacks with foodState undefined count as the fresh sink (finding #546);
// preserved/rendered excluded; voice line carries no dev-artifact parenthetical
// (the windfallcap-b polish bug); deterministic.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
let withPortionWindfall, doomedFresh, portionHeads, PORTION_PER_HEAD, THRESHOLD_PER_HEAD, layerOn;
try {
  ({ withPortionWindfall, doomedFresh, portionHeads, PORTION_PER_HEAD,
     THRESHOLD_PER_HEAD, layerOn } = require('./policies/portionwindfall'));
} catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    // Post-kill INFO-SKIP (run fleshout-loop-b-20261018T1653Z): the layer
    // was deleted per kill protocol — proof vacuous. The layer was proven
    // GREEN pre-kill (38/38); the log lives in
    // evidence/2026-10-18/sim-portionwindfall-b.md.
    console.log('INFO-SKIP: sim-portionwindfall-b layer killed per protocol (policies/portionwindfall.js absent); proof vacuous, exit 0.');
    process.exit(0);
  }
  throw e;
}
const { leadfeast } = require('./policies/feastscale');

function freshStack(day, name, units, kcalEach, spoilIn) {
  return { name, kcalEach, units, spoilDay: day + spoilIn, foodKind: 'meat',
           foodState: 'fresh', safe: false, kg: 0.2, unit: 'portion' };
}

async function fixture() {
  const { Game } = await loadGame({ seed: 4242, mode: 'proof-portionwindfall', fullTelemetry: false });
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
  const spoiled = { name: 'Old fish', kcalEach: 100, units: 50, spoilDay: day - bonus,
    foodKind: 'fish', foodState: 'fresh', safe: false };
  v.pantry.push(spoiled);
  return { Game, v, s, day, roster, spoiled, bonus };
}

function ctxWithContrib(day) {
  // _fsLastFeastDay = yesterday cadence-blocks the base scaleFeast, so the
  // windfall is the only feast path under test (production: the windfall is
  // the overflow valve on days the normal feast doesn't fire).
  return { _givesHist: [{ day: day - 7, g: 0 }], _fsLastFeastDay: day - 1,
           _tribHist: [{ day, kcal: 2000 }] };
}

(async () => {
  let fail = 0;
  const check = (name, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name); if (!cond) fail++; };
  const wrapped = withPortionWindfall(leadfeast, 'leadportionwindfall-test', 'test');

  // ---------- RED: gate off = pure delegation ----------
  {
    delete process.env.PORTIONWINDFALL;
    const { Game, v, s, day } = await fixture();
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = ctxWithContrib(day);
    wrapped.upkeep(Game, ctx);
    check('RED layer off', !layerOn());
    check('RED no windfall fire', !ctx._pwFeasts);
    check('RED no windfall voice', !lines.some(l => /won't keep till tomorrow/.test(l)));
    check('RED no fire-day bookkeeping', !ctx._pwFireDays || ctx._pwFireDays.length === 0);
  }

  // ---------- GREEN: fires at the proven threshold, portion-capped ----------
  {
    process.env.PORTIONWINDFALL = '1';
    const { Game, v, s, day, roster } = await fixture();
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    let hostGuests = null;
    const oHF = Game.hostFeast;
    Game.hostFeast = function (opts) { hostGuests = (opts && opts.guests) || null; return oHF.apply(this, arguments); };
    const ctx = ctxWithContrib(day);
    const doomed = doomedFresh(Game);
    console.log('  doomed=' + Math.round(doomed.kcal) + ' threshold(300*roster)=' + (THRESHOLD_PER_HEAD * roster) + ' portionCap(275*roster)=' + (PORTION_PER_HEAD * roster));
    check('GREEN doomed exceeds 300*roster threshold', doomed.kcal > THRESHOLD_PER_HEAD * roster);
    check('GREEN spoiled excluded from doomed', doomed.kcal === 9000);
    wrapped.upkeep(Game, ctx);
    check('GREEN windfall fired once', ctx._pwFeasts === 1);
    check('GREEN feastDay set', s.feastDay === day);
    check('GREEN voice line said once', lines.filter(l => /won't keep till tomorrow/.test(l)).length === 1);
    check('GREEN voice has no dev parenthetical', !lines.some(l => /won't keep till tomorrow/.test(l) && /[()]/.test(l)));
    check('GREEN telemetry kcal', (ctx._pwKcal || 0) > 0);
    check('GREEN telemetry doomed', ctx._pwDoomed === 9000);
    check('GREEN cadence reset', ctx._fsLastFeastDay === day);
    check('GREEN fire day recorded', (ctx._pwFireDays || []).length === 1 && ctx._pwFireDays[0] === day);
    // THE PORTION CAP: spent <= 275*roster, doomed drawn down by ~one portion.
    const cap = PORTION_PER_HEAD * roster;
    console.log('  spent=' + Math.round(ctx._pwKcal) + ' doomedEaten=' + Math.round(ctx._pwDoomedEaten || 0) + ' cap=' + cap);
    check('GREEN portion: spent <= 275*roster', ctx._pwKcal <= cap);
    check('GREEN portion: doomed eaten ~= one portion', (ctx._pwDoomedEaten || 0) >= cap * 0.85 && (ctx._pwDoomedEaten || 0) <= cap);
    check('GREEN portion cap bit recorded (glut pile > 275*roster)', ctx._pwCapBit === 1);
    check('GREEN guest subset invited (7 of 11)', hostGuests && hostGuests.length === 7);
    const doomedLeft = doomedFresh(Game).kcal;
    console.log('  doomedLeft=' + Math.round(doomedLeft) + ' (must still exceed the trigger: the tail burns tomorrow)');
    check('GREEN glut tail survives for tomorrow', doomedLeft > THRESHOLD_PER_HEAD * roster);
    Game.hostFeast = oHF;
  }

  // ---------- G2: below the proven threshold -> no fire ----------
  {
    process.env.PORTIONWINDFALL = '1';
    const { Game, v, s, day, roster, bonus } = await fixture();
    v.pantry = v.pantry.filter(it => ((it.spoilDay || 0) + bonus) !== day + 1);
    v.pantry.push(freshStack(day, 'Berries', 10, 200, 1 - bonus)); // 2000 doomed < 3600
    const doomed = doomedFresh(Game);
    console.log('  doomed=' + Math.round(doomed.kcal) + ' threshold=' + (THRESHOLD_PER_HEAD * roster));
    check('G2 doomed below threshold', doomed.kcal <= THRESHOLD_PER_HEAD * roster);
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = ctxWithContrib(day);
    wrapped.upkeep(Game, ctx);
    check('G2 sub-threshold: no windfall', !ctx._pwFeasts);
    check('G2 sub-threshold: no voice', !lines.some(l => /won't keep till tomorrow/.test(l)));
  }

  // ---------- G2b: the band the b2 arm neutered fires here ----------
  {
    process.env.PORTIONWINDFALL = '1';
    const { Game, v, s, day, roster, bonus } = await fixture();
    v.pantry = v.pantry.filter(it => ((it.spoilDay || 0) + bonus) !== day + 1);
    v.pantry.push(freshStack(day, 'Berries', 25, 200, 1 - bonus)); // 5000: >3600 (fires), <6000 (b2 didn't)
    const doomed = doomedFresh(Game);
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = ctxWithContrib(day);
    wrapped.upkeep(Game, ctx);
    check('G2b band fires (proven threshold kept)', ctx._pwFeasts === 1);
  }

  // ---------- G3: NO FREQUENCY CAP (the cap-alone arm's culprit) ----------
  // 2 windfalls inside the 7d window -> the prior arm blocked; this one fires.
  {
    process.env.PORTIONWINDFALL = '1';
    const { Game, v, s, day } = await fixture();
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = ctxWithContrib(day);
    ctx._pwFireDays = [day - 2, day - 1];
    wrapped.upkeep(Game, ctx);
    check('G3 no frequency cap: fires despite 2 fires in 7d', ctx._pwFeasts === 1);
    check('G3 tail burn: fire day appended', (ctx._pwFireDays || []).length === 3 && ctx._pwFireDays[2] === day);
    check('G3 voice said', lines.some(l => /won't keep till tomorrow/.test(l)));
  }

  // ---------- G4: already feasted today -> no fire ----------
  {
    process.env.PORTIONWINDFALL = '1';
    const { Game, v, s, day } = await fixture();
    s.feastDay = day;
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = ctxWithContrib(day);
    wrapped.upkeep(Game, ctx);
    check('G4 already feasted: no windfall', !ctx._pwFeasts);
  }

  // ---------- G5b: unaffordable at the SCALED cost -> no fire ----------
  // doomed 4000 > 3600 trigger, but total pantry 4000 < 3200*1.5 = 4800.
  {
    process.env.PORTIONWINDFALL = '1';
    const { Game, v, s, day, roster, bonus } = await fixture();
    v.pantry = [];
    v.pantry.push(freshStack(day, 'Deer meat', 20, 200, 1 - bonus)); // 4000 doomed, nothing else
    const doomed = doomedFresh(Game);
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = ctxWithContrib(day);
    wrapped.upkeep(Game, ctx);
    check('G5b unaffordable: no windfall (doomed=' + Math.round(doomed.kcal) + ' but have<cost*1.5)', !ctx._pwFeasts);
  }

  // ---------- G6: no contribution -> no fire ----------
  {
    process.env.PORTIONWINDFALL = '1';
    const { Game, v, s, day } = await fixture();
    v.gives[Game.villagerId] = 0;
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = { _givesHist: [{ day: day - 7, g: 0 }], _fsLastFeastDay: day - 1,
                  _tribHist: [] };
    wrapped.upkeep(Game, ctx);
    check('G6 no contribution: no windfall', !ctx._pwFeasts);
  }

  // ---------- G7: away from haven -> no fire ----------
  {
    process.env.PORTIONWINDFALL = '1';
    const { Game, v, s, day } = await fixture();
    Game.playerAtHaven = () => false;
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = ctxWithContrib(day);
    wrapped.upkeep(Game, ctx);
    check('G7 away: no windfall', !ctx._pwFeasts);
  }

  // ---------- G8: real-world pantry shapes (finding #546) ----------
  {
    process.env.PORTIONWINDFALL = '1';
    const { Game, v, s, day, roster, bonus } = await fixture();
    v.pantry = [];
    const noState = { name: 'Foraged food', kcalEach: 200, units: 35, spoilDay: day + 1 - bonus,
      foodKind: 'mixed', safe: false }; // 7000, doomed, foodState undefined
    v.pantry.push(noState);
    v.pantry.push(freshStack(day, 'Smoked fish', 20, 100, 30)); // keeps
    const d = doomedFresh(Game);
    check('G8 undefined foodState counts as fresh sink', d.kcal === 7000);
  }
  {
    process.env.PORTIONWINDFALL = '1';
    const { Game, v, s, day, roster, bonus } = await fixture();
    v.pantry = [];
    v.pantry.push({ name: 'Smoked meat', kcalEach: 200, units: 40, spoilDay: day + 1 - bonus,
      foodKind: 'meat', foodState: 'preserved', safe: true }); // 8000 doomed but preserved
    v.pantry.push(freshStack(day, 'Deer meat', 30, 200, 1 - bonus)); // 6000 doomed fresh
    const d = doomedFresh(Game);
    check('G8b preserved excluded from doomed', d.kcal === 6000);
  }

  // ---------- G9: determinism ----------
  {
    process.env.PORTIONWINDFALL = '1';
    const run = async () => {
      const { Game, v, s, day } = await fixture();
      const lines = [];
      Game.say = (st) => { lines.push(String(st)); };
      const ctx = ctxWithContrib(day);
      wrapped.upkeep(Game, ctx);
      return (ctx._pwFeasts || 0) + ':' + lines.filter(l => /won't keep/.test(l)).length + ':' + Math.round(ctx._pwKcal || 0);
    };
    const a = await run(), b = await run();
    check('G9 deterministic (' + a + ' vs ' + b + ')', a === b);
  }

  // ---------- G10: portionHeads edge cases ----------
  check('G10 heads(12)=7', portionHeads(12) === 7);
  check('G10 heads(10)=5', portionHeads(10) === 5);
  check('G10 heads(4)=null (tiny-roster fallback)', portionHeads(4) === null);
  check('G10 heads(1)=null', portionHeads(1) === null);

  delete process.env.PORTIONWINDFALL;
  console.log(fail ? 'PROOF FAIL' : 'PROOF GREEN');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF ERROR', e); process.exit(2); });

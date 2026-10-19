#!/usr/bin/env node
// test-windyield-b.js — portion-scaled windfall feast + the racks-thin yield
// (sim-windyield-b).
//
// The base layer's pins are the b2 proven layer, behavior-identical:
// RED (WINDYIELD unset): pure delegation — no fire, no voice, no telemetry
//   (including yield keys), no fire-day bookkeeping.
// GREEN (WINDYIELD=1): on a pinned fixture (dusk, haven, doomed fresh >
//   300*roster, contribution met, affordable, RACKS FULL) the windfall fires
//   exactly once: feastDay set, the doomed pile drawn down by ~one portion
//   (<=275*roster), ctx telemetry set, fire-day bookkeeping recorded,
//   cadence reset.
// Invariants: gates hold (below the PROVEN 300*roster threshold / already
//   feasted / unaffordable / no contribution / away from haven -> no fire);
// NO FREQUENCY CAP (fires with 2 windfalls in the last 7d); spoiled never
// counts as doomed; real pantry stacks with foodState undefined count as
// the fresh sink (finding #546); preserved/rendered excluded; voice line
// carries no dev-artifact parenthetical; deterministic.
// THE YIELD (the one differentiator): racks thin (not racks-full per the
//   engine's own 125*roster*shelf math) -> stand down, counted, silent-
//   by-design; racks full -> fires. Yield-skips never touch the cadence
//   clock and never leak voice. The windfall converts nothing (laundering 0
//   by construction — pinned by the no-new-preserved-stacks check).
// Det-gate (scripts/detgate-windyield-b.js): wrapped+WINDYIELD-unset
// byte-identical to base over 40d (2 seeds x 2 policies).
//
// Kill protocol: if the layer was deleted, INFO-SKIP exit 0.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
let withWindyield, doomedFresh, portionHeads, racksFull, preservedKcal, cookShelf,
    PORTION_PER_HEAD, THRESHOLD_PER_HEAD, layerOn;
try {
  ({ withWindyield, doomedFresh, portionHeads, racksFull, preservedKcal, cookShelf,
     PORTION_PER_HEAD, THRESHOLD_PER_HEAD, layerOn } = require('./policies/windyield'));
} catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: sim-windyield-b layer killed per protocol (policies/windyield.js absent); proof vacuous, exit 0.');
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
  const { Game } = await loadGame({ seed: 4242, mode: 'proof-windyield', fullTelemetry: false });
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

// racksFullFor(fixtureParts): rebuild the pantry with a preserved stock that
// puts the racks FULL per the engine's own math (125*12*13=19500 unskilled).
function racksFullPantry(v, day, bonus, preservedKcalWant) {
  v.pantry = [];
  v.pantry.push(freshStack(day, 'Deer meat', 30, 200, 1 - bonus));   // 6000, doomed
  v.pantry.push(freshStack(day, 'Turkey meat', 20, 150, 1 - bonus)); // 3000, doomed
  v.pantry.push(freshStack(day, 'Beans', 40, 100, 30));              // 4000, keeps
  const units = Math.max(1, Math.round(preservedKcalWant));
  v.pantry.push({ name: 'Smoked meat', kcalEach: 1, units, spoilDay: day + 20,
    foodKind: 'meat', foodState: 'preserved', safe: true });
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
  const wrapped = withWindyield(leadfeast, 'leadwindyield-test', 'test');

  // ---------- RED: gate off = pure delegation ----------
  {
    delete process.env.WINDYIELD;
    const { Game, v, s, day } = await fixture();
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = ctxWithContrib(day);
    wrapped.upkeep(Game, ctx);
    check('RED layer off', !layerOn());
    check('RED no windfall fire', !ctx._wyFeasts);
    check('RED no windfall voice', !lines.some(l => /won't keep till tomorrow/.test(l)));
    check('RED no fire-day bookkeeping', !ctx._wyFireDays || ctx._wyFireDays.length === 0);
    check('RED no yield keys', ctx._wyYieldSkips === undefined && ctx._wyYieldSkipDays === undefined);
  }

  // ---------- GREEN: fires at the proven threshold, portion-capped (racks full) ----------
  {
    process.env.WINDYIELD = '1';
    const { Game, v, s, day, roster, bonus } = await fixture();
    racksFullPantry(v, day, bonus, 25000); // racks full: 25000 >= 19500
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    let hostGuests = null;
    const oHF = Game.hostFeast;
    Game.hostFeast = function (opts) { hostGuests = (opts && opts.guests) || null; return oHF.apply(this, arguments); };
    const ctx = ctxWithContrib(day);
    const doomed = doomedFresh(Game);
    console.log('  doomed=' + Math.round(doomed.kcal) + ' threshold(300*roster)=' + (THRESHOLD_PER_HEAD * roster) + ' portionCap(275*roster)=' + (PORTION_PER_HEAD * roster));
    check('GREEN doomed exceeds 300*roster threshold', doomed.kcal > THRESHOLD_PER_HEAD * roster);
    check('GREEN racks full', racksFull(Game, v, roster));
    wrapped.upkeep(Game, ctx);
    check('GREEN windfall fired once', ctx._wyFeasts === 1);
    check('GREEN no yield-skip on fire', !ctx._wyYieldSkips);
    check('GREEN feastDay set', s.feastDay === day);
    check('GREEN voice line said once', lines.filter(l => /won't keep till tomorrow/.test(l)).length === 1);
    check('GREEN voice has no dev parenthetical', !lines.some(l => /won't keep till tomorrow/.test(l) && /[()]/.test(l)));
    check('GREEN telemetry kcal', (ctx._wyKcal || 0) > 0);
    check('GREEN telemetry doomed', ctx._wyDoomed === 9000);
    check('GREEN cadence reset', ctx._fsLastFeastDay === day);
    check('GREEN fire day recorded', (ctx._wyFireDays || []).length === 1 && ctx._wyFireDays[0] === day);
    // THE PORTION CAP: spent <= 275*roster, doomed drawn down by ~one portion.
    const cap = PORTION_PER_HEAD * roster;
    console.log('  spent=' + Math.round(ctx._wyKcal) + ' doomedEaten=' + Math.round(ctx._wyDoomedEaten || 0) + ' cap=' + cap);
    check('GREEN portion: spent <= 275*roster', ctx._wyKcal <= cap);
    check('GREEN portion: doomed eaten ~= one portion', (ctx._wyDoomedEaten || 0) >= cap * 0.85 && (ctx._wyDoomedEaten || 0) <= cap);
    check('GREEN portion cap bit recorded (glut pile > 275*roster)', ctx._wyCapBit === 1);
    check('GREEN guest subset invited (7 of 11)', hostGuests && hostGuests.length === 7);
    const doomedLeft = doomedFresh(Game).kcal;
    console.log('  doomedLeft=' + Math.round(doomedLeft) + ' (must still exceed the trigger: the tail burns tomorrow)');
    check('GREEN glut tail survives for tomorrow', doomedLeft > THRESHOLD_PER_HEAD * roster);
    Game.hostFeast = oHF;
  }

  // ---------- G2: below the proven threshold -> no fire ----------
  {
    process.env.WINDYIELD = '1';
    const { Game, v, s, day, roster, bonus } = await fixture();
    racksFullPantry(v, day, bonus, 25000);
    // strip the doomed: keep only 2000 doomed
    v.pantry = v.pantry.filter(it => it.foodState === 'preserved' || ((it.spoilDay || 0) + bonus) !== day + 1);
    v.pantry.push(freshStack(day, 'Berries', 10, 200, 1 - bonus)); // 2000 doomed < 3600
    const doomed = doomedFresh(Game);
    console.log('  doomed=' + Math.round(doomed.kcal) + ' threshold=' + (THRESHOLD_PER_HEAD * roster));
    check('G2 doomed below threshold', doomed.kcal <= THRESHOLD_PER_HEAD * roster);
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = ctxWithContrib(day);
    wrapped.upkeep(Game, ctx);
    check('G2 sub-threshold: no windfall', !ctx._wyFeasts);
    check('G2 sub-threshold: no voice', !lines.some(l => /won't keep till tomorrow/.test(l)));
    check('G2 sub-threshold: no yield-skip (no genuine fire to yield)', !ctx._wyYieldSkips);
  }

  // ---------- G2b: the 5000 band fires (racks full) ----------
  {
    process.env.WINDYIELD = '1';
    const { Game, v, s, day, roster, bonus } = await fixture();
    racksFullPantry(v, day, bonus, 25000);
    v.pantry = v.pantry.filter(it => it.foodState === 'preserved' || ((it.spoilDay || 0) + bonus) !== day + 1);
    v.pantry.push(freshStack(day, 'Berries', 25, 200, 1 - bonus)); // 5000: >3600 (fires)
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = ctxWithContrib(day);
    wrapped.upkeep(Game, ctx);
    check('G2b band fires (proven threshold kept, racks full)', ctx._wyFeasts === 1);
  }

  // ---------- G3: NO FREQUENCY CAP ----------
  {
    process.env.WINDYIELD = '1';
    const { Game, v, s, day, bonus } = await fixture();
    racksFullPantry(v, day, bonus, 25000);
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = ctxWithContrib(day);
    ctx._wyFireDays = [day - 2, day - 1];
    wrapped.upkeep(Game, ctx);
    check('G3 no frequency cap: fires despite 2 fires in 7d', ctx._wyFeasts === 1);
    check('G3 tail burn: fire day appended', (ctx._wyFireDays || []).length === 3 && ctx._wyFireDays[2] === day);
    check('G3 voice said', lines.some(l => /won't keep till tomorrow/.test(l)));
  }

  // ---------- G4: already feasted today -> no fire ----------
  {
    process.env.WINDYIELD = '1';
    const { Game, v, s, day, bonus } = await fixture();
    racksFullPantry(v, day, bonus, 25000);
    s.feastDay = day;
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = ctxWithContrib(day);
    wrapped.upkeep(Game, ctx);
    check('G4 already feasted: no windfall', !ctx._wyFeasts);
  }

  // ---------- G5b: unaffordable at the SCALED cost -> no fire, no yield-skip ----------
  {
    process.env.WINDYIELD = '1';
    const { Game, v, s, day, roster, bonus } = await fixture();
    v.pantry = [];
    v.pantry.push(freshStack(day, 'Deer meat', 20, 200, 1 - bonus)); // 4000 doomed, nothing else
    const doomed = doomedFresh(Game);
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = ctxWithContrib(day);
    wrapped.upkeep(Game, ctx);
    check('G5b unaffordable: no windfall (doomed=' + Math.round(doomed.kcal) + ' but have<cost*1.5)', !ctx._wyFeasts);
    check('G5b unaffordable: no yield-skip (no genuine fire to yield)', !ctx._wyYieldSkips);
  }

  // ---------- G6: no contribution -> no fire ----------
  {
    process.env.WINDYIELD = '1';
    const { Game, v, s, day, bonus } = await fixture();
    racksFullPantry(v, day, bonus, 25000);
    v.gives[Game.villagerId] = 0;
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = { _givesHist: [{ day: day - 7, g: 0 }], _fsLastFeastDay: day - 1,
                  _tribHist: [] };
    wrapped.upkeep(Game, ctx);
    check('G6 no contribution: no windfall', !ctx._wyFeasts);
  }

  // ---------- G7: away from haven -> no fire ----------
  {
    process.env.WINDYIELD = '1';
    const { Game, v, s, day, bonus } = await fixture();
    racksFullPantry(v, day, bonus, 25000);
    Game.playerAtHaven = () => false;
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = ctxWithContrib(day);
    wrapped.upkeep(Game, ctx);
    check('G7 away: no windfall', !ctx._wyFeasts);
  }

  // ---------- G8: real-world pantry shapes (finding #546) ----------
  {
    process.env.WINDYIELD = '1';
    const { Game, v, s, day, roster, bonus } = await fixture();
    v.pantry = [];
    const noState = { name: 'Foraged food', kcalEach: 200, units: 35, spoilDay: day + 1 - bonus,
      foodKind: 'mixed', safe: false }; // 7000, doomed, foodState undefined
    v.pantry.push(noState);
    v.pantry.push(freshStack(day, 'Smoked fish', 20, 100, 30));              // keeps
    const d = doomedFresh(Game);
    check('G8 undefined foodState counts as fresh sink', d.kcal === 7000);
  }
  {
    process.env.WINDYIELD = '1';
    const { Game, v, s, day, roster, bonus } = await fixture();
    v.pantry = [];
    v.pantry.push({ name: 'Smoked meat', kcalEach: 200, units: 40, spoilDay: day + 1 - bonus,
      foodKind: 'meat', foodState: 'preserved', safe: true }); // 8000 doomed but preserved
    v.pantry.push(freshStack(day, 'Deer meat', 30, 200, 1 - bonus)); // 6000 doomed fresh
    const d = doomedFresh(Game);
    check('G8b preserved excluded from doomed', d.kcal === 6000);
  }

  // ---------- Y1: racks THIN -> yield skip (counted, silent, cadence untouched) ----------
  {
    process.env.WINDYIELD = '1';
    const { Game, v, s, day, roster, bonus } = await fixture(); // no preserved stock: thin
    check('Y1 fixture: racks thin', !racksFull(Game, v, roster));
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = ctxWithContrib(day);
    wrapped.upkeep(Game, ctx);
    check('Y1 thin racks: no windfall fire', !ctx._wyFeasts);
    check('Y1 thin racks: yield-skip counted', ctx._wyYieldSkips === 1);
    check('Y1 thin racks: skip day recorded', (ctx._wyYieldSkipDays || [])[0] === day);
    check('Y1 thin racks: doomed seen on skip', ctx._wyYieldDoomed === 9000);
    check('Y1 thin racks: silent-by-design (no voice)', !lines.some(l => /won't keep till tomorrow/.test(l)));
    check('Y1 thin racks: cadence clock untouched', ctx._fsLastFeastDay === day - 1);
    check('Y1 thin racks: doomed pile left for the smoke drive', doomedFresh(Game).kcal === 9000);
  }

  // ---------- Y2: racks FULL -> fires, never skips ----------
  {
    process.env.WINDYIELD = '1';
    const { Game, v, s, day, roster, bonus } = await fixture();
    racksFullPantry(v, day, bonus, 25000);
    check('Y2 fixture: racks full', racksFull(Game, v, roster));
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = ctxWithContrib(day);
    wrapped.upkeep(Game, ctx);
    check('Y2 full racks: fires', ctx._wyFeasts === 1);
    check('Y2 full racks: no yield-skip', !ctx._wyYieldSkips);
  }

  // ---------- Y3: the boundary — preserved == cap is full, cap-1 is thin ----------
  {
    process.env.WINDYIELD = '1';
    const { Game, v, s, day, roster, bonus } = await fixture();
    const cap = 125 * roster * 13; // unskilled shelf 15 -> 19500 at roster 12
    racksFullPantry(v, day, bonus, cap);
    check('Y3 preserved == cap: full', racksFull(Game, v, roster));
    racksFullPantry(v, day, bonus, cap - 1);
    check('Y3 preserved == cap-1: thin', !racksFull(Game, v, roster));
    check('Y3 no cook assigned: unskilled shelf 15', cookShelf(Game, v) === 15);
  }

  // ---------- Y4: big glut pile with thin racks YIELDS (the loosened test —
  //   windfallrev's 4000-budget fit requirement is gone) ----------
  {
    process.env.WINDYIELD = '1';
    const { Game, v, s, day, roster, bonus } = await fixture(); // 9000 doomed, thin racks
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = ctxWithContrib(day);
    wrapped.upkeep(Game, ctx);
    check('Y4 glut 9000 + thin racks: yields (no budget-fit requirement)', !ctx._wyFeasts && ctx._wyYieldSkips === 1);
  }

  // ---------- L1: the windfall converts nothing (laundering 0 by construction) ----------
  {
    process.env.WINDYIELD = '1';
    const { Game, v, s, day, roster, bonus } = await fixture();
    racksFullPantry(v, day, bonus, 25000);
    const presBefore = (v.pantry || []).filter(it => it.foodState === 'preserved' || it.foodState === 'rendered').length;
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = ctxWithContrib(day);
    wrapped.upkeep(Game, ctx);
    const presAfter = (v.pantry || []).filter(it => it.foodState === 'preserved' || it.foodState === 'rendered').length;
    check('L1 windfall converts nothing (no new preserved/rendered stacks)', presAfter === presBefore);
  }

  // ---------- G9: determinism ----------
  {
    process.env.WINDYIELD = '1';
    const run = async () => {
      const { Game, v, s, day, bonus } = await fixture();
      racksFullPantry(v, day, bonus, 25000);
      const lines = [];
      Game.say = (st) => { lines.push(String(st)); };
      const ctx = ctxWithContrib(day);
      wrapped.upkeep(Game, ctx);
      return (ctx._wyFeasts || 0) + ':' + (ctx._wyYieldSkips || 0) + ':' + lines.filter(l => /won't keep/.test(l)).length + ':' + Math.round(ctx._wyKcal || 0);
    };
    const a = await run(), b = await run();
    check('G9 deterministic (' + a + ' vs ' + b + ')', a === b);
  }

  // ---------- Y5: determinism of the yield path ----------
  {
    process.env.WINDYIELD = '1';
    const run = async () => {
      const { Game, v, s, day } = await fixture(); // thin racks
      const lines = [];
      Game.say = (st) => { lines.push(String(st)); };
      const ctx = ctxWithContrib(day);
      wrapped.upkeep(Game, ctx);
      return (ctx._wyFeasts || 0) + ':' + (ctx._wyYieldSkips || 0) + ':' + lines.filter(l => /won't keep/.test(l)).length;
    };
    const a = await run(), b = await run();
    check('Y5 yield deterministic (' + a + ' vs ' + b + ')', a === b);
  }

  // ---------- G10: portionHeads edge cases ----------
  check('G10 heads(12)=7', portionHeads(12) === 7);
  check('G10 heads(10)=5', portionHeads(10) === 5);
  check('G10 heads(4)=null (tiny-roster fallback)', portionHeads(4) === null);
  check('G10 heads(1)=null', portionHeads(1) === null);

  delete process.env.WINDYIELD;
  console.log(fail ? 'PROOF FAIL' : 'PROOF GREEN');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF ERROR', e); process.exit(2); });

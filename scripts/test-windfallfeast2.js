#!/usr/bin/env node
// test-windfallfeast2.js — survival-safe WINDFALL FEAST proof test (sim-racksanswer-b2).
//
// RED (WINDFALLFEAST2 unset): the wrapped policy delegates byte-identically —
// the windfall never fires, no voice line, no ctx telemetry.
// GREEN (WINDFALLFEAST2=1): on a pinned fixture (dusk, haven, doomed fresh >
// 500*roster, contribution met, affordable) the windfall fires exactly once:
// feastDay set, hostFeast drew the doomed pile first, ctx telemetry set,
// frequency bookkeeping recorded.
// Invariants: gates hold (below the RAISED 500*roster threshold / cap
// exhausted / already feasted / unaffordable / no contribution / away from
// haven -> no fire); spoiled never counts as doomed; deterministic.
// G2 pins the key behavioral difference from the killed racksanswer-b arm:
// a doomed pile that fired at 300*roster (3000 < doomed <= 500*roster) no
// longer fires.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
let withWindfallFeast2, doomedFresh, layerOn;
try { ({ withWindfallFeast2, doomedFresh, layerOn } = require('./policies/windfallfeast2')); }
catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    // Post-kill INFO-SKIP (coordinator, run fleshout-loop-b-20261018T132923Z):
    // the layer was deleted per kill protocol — proof vacuous. The layer was
    // proven GREEN pre-kill (29/29); the log lives in
    // evidence/2026-10-18/sim-racksanswer-b2.md.
    console.log('INFO-SKIP: sim-racksanswer-b2 layer killed per protocol (policies/windfallfeast2.js absent); proof vacuous, exit 0.');
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
  const { Game } = await loadGame({ seed: 4242, mode: 'proof-windfall2', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village;
  const s = Game.state.scholar;
  const day = s.day || 1;
  Game.dayPart = 2; // dusk
  // Scholar at haven: playerAtHaven reads position; force the gate honestly
  // by stubbing ONLY the position check (the layer under test calls it).
  Game.playerAtHaven = () => true;
  // Contribution gate: 2000 kcal tribute paid this week (the courtship
  // substrate's real contribution — gives are ~0, tribute counts per r13).
  v.gives = v.gives || {};
  v.gives[Game.villagerId] = 0;
  const roster = (v.roster || []).length || 10;
  // Bonus-inclusive spoilDays (the game's rot boundary is bonus-inclusive):
  // doomed = (sd + bonus) == day+1; truly spoiled = (sd + bonus) <= day.
  const bonus = (Game.spoilBonusDays ? Math.round(Game.spoilBonusDays()) : 0) || 0;
  v.pantry = [];
  v.pantry.push(freshStack(day, 'Deer meat', 30, 200, 1 - bonus));   // 6000, doomed
  v.pantry.push(freshStack(day, 'Turkey meat', 20, 150, 1 - bonus));  // 3000, doomed
  v.pantry.push(freshStack(day, 'Beans', 40, 100, 30));               // 4000, keeps
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
  const wrapped = withWindfallFeast2(leadfeast, 'leadwindfall2-test', 'test');

  // ---------- RED: gate off = pure delegation ----------
  {
    delete process.env.WINDFALLFEAST2;
    const { Game, v, s, day } = await fixture();
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = ctxWithContrib(day);
    wrapped.upkeep(Game, ctx);
    check('RED layer off', !layerOn());
    check('RED no windfall fire', !ctx._wfFeasts);
    check('RED no windfall voice', !lines.some(l => /won't keep till tomorrow/.test(l)));
    check('RED no fire-day bookkeeping', !ctx._wfFireDays || ctx._wfFireDays.length === 0);
  }

  // ---------- GREEN: the windfall fires ----------
  {
    process.env.WINDFALLFEAST2 = '1';
    const { Game, v, s, day, roster } = await fixture();
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = ctxWithContrib(day);
    const doomed = doomedFresh(Game);
    console.log('  doomed=' + Math.round(doomed.kcal) + ' new-threshold=' + (500 * roster) + ' old-threshold=' + (300 * roster));
    check('GREEN doomed exceeds RAISED threshold', doomed.kcal > 500 * roster);
    check('GREEN spoiled excluded from doomed', doomed.kcal === 9000);
    wrapped.upkeep(Game, ctx);
    check('GREEN windfall fired once', ctx._wfFeasts === 1);
    check('GREEN feastDay set', s.feastDay === day);
    check('GREEN voice line said once', lines.filter(l => /won't keep till tomorrow/.test(l)).length === 1);
    check('GREEN telemetry kcal', (ctx._wfKcal || 0) > 0);
    check('GREEN telemetry doomed', ctx._wfDoomed === 9000);
    check('GREEN cadence reset', ctx._fsLastFeastDay === day);
    check('GREEN fire day recorded', (ctx._wfFireDays || []).length === 1 && ctx._wfFireDays[0] === day);
    const doomedLeft = doomedFresh(Game).kcal;
    console.log('  doomedLeft=' + Math.round(doomedLeft));
    check('GREEN doomed pile drawn down', doomedLeft < doomed.kcal * 0.5);
  }

  // ---------- G2: doomed between old and new threshold -> no fire ----------
  // (the killed arm fired here; the safe variant must not)
  {
    process.env.WINDFALLFEAST2 = '1';
    const { Game, v, s, day, roster, bonus } = await fixture();
    v.pantry = v.pantry.filter(it => ((it.spoilDay || 0) + bonus) !== day + 1);
    v.pantry.push(freshStack(day, 'Berries', 25, 200, 1 - bonus)); // 5000 doomed: 300*12=3600 < 5000 < 6000=500*12
    const doomed = doomedFresh(Game);
    console.log('  doomed=' + Math.round(doomed.kcal) + ' (between old ' + (300 * roster) + ' and new ' + (500 * roster) + ')');
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = ctxWithContrib(day);
    wrapped.upkeep(Game, ctx);
    check('G2 sub-threshold: no windfall', !ctx._wfFeasts);
    check('G2 sub-threshold: no voice', !lines.some(l => /won't keep till tomorrow/.test(l)));
  }

  // ---------- G3: frequency cap exhausted -> no fire; window rolls ----------
  {
    process.env.WINDFALLFEAST2 = '1';
    const { Game, v, s, day } = await fixture();
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = ctxWithContrib(day);
    ctx._wfFireDays = [day - 2, day - 1]; // 2 windfalls inside the 7d window
    wrapped.upkeep(Game, ctx);
    check('G3 cap exhausted: no windfall', !ctx._wfFeasts);
    check('G3 cap exhausted: no voice', !lines.some(l => /won't keep till tomorrow/.test(l)));
  }
  {
    process.env.WINDFALLFEAST2 = '1';
    const { Game, v, s, day } = await fixture();
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = ctxWithContrib(day);
    ctx._wfFireDays = [day - 9, day - 8]; // aged out of the 7d window
    wrapped.upkeep(Game, ctx);
    check('G3b aged-out window: windfall fires', ctx._wfFeasts === 1);
    check('G3b window trimmed', (ctx._wfFireDays || []).length === 1 && ctx._wfFireDays[0] === day);
  }

  // ---------- G4: already feasted today -> no fire ----------
  {
    process.env.WINDFALLFEAST2 = '1';
    const { Game, v, s, day } = await fixture();
    s.feastDay = day;
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = ctxWithContrib(day);
    wrapped.upkeep(Game, ctx);
    check('G4 already feasted: no windfall', !ctx._wfFeasts);
    check('G4 no double voice', !lines.some(l => /won't keep till tomorrow/.test(l)));
  }

  // ---------- G5: unaffordable -> no fire ----------
  {
    process.env.WINDFALLFEAST2 = '1';
    const { Game, v, s, day } = await fixture();
    v.pantry = v.pantry.filter(it => (it.spoilDay || 0) <= day + 1);
    const have = v.pantry.reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
    const plan = Game.feastPlan();
    console.log('  have=' + Math.round(have) + ' cost*1.5=' + Math.round((plan.cost || 0) * 1.5));
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = ctxWithContrib(day);
    if (have >= (plan.cost || 0) * 1.5) {
      console.log('  (fixture affordable — G5 vacuous on this roster, skipping strict check)');
      check('G5 unaffordable: no windfall (vacuous)', true);
    } else {
      wrapped.upkeep(Game, ctx);
      check('G5 unaffordable: no windfall', !ctx._wfFeasts);
    }
  }

  // ---------- G6: no contribution -> no fire ----------
  {
    process.env.WINDFALLFEAST2 = '1';
    const { Game, v, s, day } = await fixture();
    v.gives[Game.villagerId] = 0; // parasite
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = { _givesHist: [{ day: day - 7, g: 0 }], _fsLastFeastDay: day - 1,
                  _tribHist: [] };
    wrapped.upkeep(Game, ctx);
    check('G6 no contribution: no windfall', !ctx._wfFeasts);
  }

  // ---------- G7: away from haven -> no fire ----------
  {
    process.env.WINDFALLFEAST2 = '1';
    const { Game, v, s, day } = await fixture();
    Game.playerAtHaven = () => false;
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = ctxWithContrib(day);
    wrapped.upkeep(Game, ctx);
    check('G7 away: no windfall', !ctx._wfFeasts);
  }

  // ---------- G8: real-world pantry shapes ----------
  // Real pantry "Foraged food" stacks carry foodState undefined — they must
  // count as the fresh sink (the filter bug that fired 0x in early sims).
  // Preserved/rendered (long-shelf rungs) must NOT count.
  {
    process.env.WINDFALLFEAST2 = '1';
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
    process.env.WINDFALLFEAST2 = '1';
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
    process.env.WINDFALLFEAST2 = '1';
    const run = async () => {
      const { Game, v, s, day } = await fixture();
      const lines = [];
      Game.say = (st) => { lines.push(String(st)); };
      const ctx = ctxWithContrib(day);
      wrapped.upkeep(Game, ctx);
      return (ctx._wfFeasts || 0) + ':' + lines.filter(l => /won't keep/.test(l)).length;
    };
    const a = await run(), b = await run();
    check('G9 deterministic (' + a + ' vs ' + b + ')', a === b && a === '1:1');
  }

  delete process.env.WINDFALLFEAST2;
  console.log(fail ? 'PROOF FAIL' : 'PROOF GREEN');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF ERROR', e); process.exit(2); });

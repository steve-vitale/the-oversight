#!/usr/bin/env node
// test-deathcause-b.js — proof for the starvechan instrument
// (sim-deathcause-b, flesh-out loop B, run fleshout-loop-b-20261022T1530Z).
//
// Pre-registered gates (evidence/2026-10-22/sim-deathcause-b.md):
// (a) RED: pristine runs carry no starvechan instrument state;
// (b) GREEN: 40d armed run records non-empty meal rows, rot scans, deposit
//     tags, scholar meals, at-haven flags; 0 instrument errors;
// (c) DET: instrumented (deathcensus + starvechan) vs pristine canonical
//     projection byte-identical, 2 seeds x 60d (all wraps RNG-clean);
// (d) REPEAT: same seed twice byte-identical incl. meal rows + starv payload;
// (e) classifier fixtures: synthetic starvation deaths exercise every
//     channel + unattributed + precedence ordering.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-deathcause-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const DC = require(path.join(REPO, 'scripts', 'deathcensus-instrument-20261021'));
const SC = require(path.join(REPO, 'scripts', 'starvechan-instrument-b'));
const { leadfeast } = require(path.join(REPO, 'scripts', 'policies', 'feastscale'));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

async function oneRun(seed, days, instrumented) {
  const { Game } = await loadGame({ seed: seed, mode: 'deathcause-b', fullTelemetry: false });
  let inst = null, sic = null, K = null, SK = null;
  if (instrumented) {
    inst = DC.install(Game); K = inst.K;
    sic = SC.install(Game); SK = sic.K;
  }
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, leadfeast, { days: days, manifest: undefined, sampleEvery: 30 }); });
  let fin = null, sfin = null;
  if (instrumented) {
    try { fin = DC.finalize(Game, K); } catch (e) { K.instrumentErrors.push('fin: ' + String((e && e.message) || e)); }
    try { sfin = SC.finalize(Game, SK, fin); } catch (e) { SK.errors.push('sfin: ' + String((e && e.message) || e)); }
    // Uninstall in REVERSE order of installation.
    try { sic.uninstall(); } catch (e) {}
    try { inst.uninstall(); } catch (e) {}
  }
  return { Game: Game, result: result, fin: fin, sfin: sfin, SK: SK };
}

function outcomeFields(Game, result) {
  var deathCauses = {};
  try {
    for (const dd of (result.samples.deaths || [])) {
      var k = String((dd && dd.cause) || 'unknown') + '|' + String((dd && dd.kind) || '?');
      deathCauses[k] = (deathCauses[k] || 0) + 1;
    }
  } catch (e) {}
  var endPop = -1, endPantry = -1;
  try { endPop = DC.livingPop(Game); } catch (e) {}
  try { endPantry = Math.round(DC.pantryKcal(Game)); } catch (e) {}
  return {
    days: result.days, gameDays: (Game.state.scholar || {}).day || 0,
    endReason: result.endReason, maxWaveUnlocked: result.maxWaveUnlocked || 1,
    endPop: endPop, endPantry: endPantry,
    scholarDeaths: (result.samples.deaths || []).filter(function (d) { return d && d.player; }).length,
    deathsTotal: (result.samples.deaths || []).length,
    deathCauses: deathCauses,
  };
}

(async () => {
  console.log('PART A: RED (pristine carries no starvechan state)');
  {
    const { Game } = await loadGame({ seed: 66201, mode: 'deathcause-b', fullTelemetry: false });
    const preMeal = Game.villagerMealDay, preSleep = Game.sleep, preDep = Game.depositPantryPieces,
      preRTV = Game.returnToVillage, preVM = Game.villageMeal, preDS = Game.drawSpoiled;
    ok('pristine Game has no starvechan markers', !Game._starvechan && !Game._scK,
      typeof Game._starvechan);
    const sic = SC.install(Game);
    ok('install wraps villagerMealDay', Game.villagerMealDay !== preMeal);
    sic.uninstall();
    ok('uninstall restores villagerMealDay', Game.villagerMealDay === preMeal);
    ok('uninstall restores sleep', Game.sleep === preSleep);
    ok('uninstall restores depositPantryPieces', Game.depositPantryPieces === preDep);
    ok('uninstall restores returnToVillage', Game.returnToVillage === preRTV);
    ok('uninstall restores villageMeal', Game.villageMeal === preVM);
    ok('uninstall restores drawSpoiled', Game.drawSpoiled === preDS);
    const src = fs.readFileSync(path.join(REPO, 'scripts', 'starvechan-instrument-b.js'), 'utf8');
    const codeOnly = src.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    const rndCalls = (codeOnly.match(/Math\.random\s*\(/g) || []).length;
    ok('instrument consumes no RNG (0 Math.random calls)', rndCalls === 0, rndCalls + ' calls');
    const writes = (codeOnly.match(/Game\.state\s*(\.\w+)?\s*\[[^\]]+\]\s*=[^=]/g) || []).concat(
      codeOnly.match(/Game\.state\s*=\s*[^=]/g) || []);
    ok('instrument writes no game state', writes.length === 0, writes.slice(0, 2).join(';'));
  }

  console.log('PART B: GREEN (armed 40d records meal rows, rot, deposits, scholar)');
  {
    const { fin, sfin, SK } = await oneRun(66202, 40, true);
    ok('meal rows non-empty', sfin.mealRowCount > 100, String(sfin.mealRowCount));
    const days = {};
    for (const m of SK.meals) days[m.d] = true;
    ok('meal rows span multiple days', Object.keys(days).length >= 20, String(Object.keys(days).length));
    const bad = SK.meals.filter(function (m) {
      return m.d == null || !m.vid || m.ate == null || m.drawn == null || m.gave == null ||
        typeof m.fasting !== 'boolean' || typeof m.away !== 'boolean' ||
        m.produced == null || m.expected == null || m.need == null;
    });
    ok('meal row schema', bad.length === 0, JSON.stringify(bad.slice(0, 1)));
    ok('haven-day rows non-empty', SK.havenDays.length >= 20, String(SK.havenDays.length));
    ok('rot scans non-empty', SK.rotDays.length >= 20, String(SK.rotDays.length));
    ok('rot scan schema', SK.rotDays.every(function (r) { return r.d != null && r.rotStock != null; }));
    ok('scholar meal rows recorded', sfin.scholarMealCount > 0, String(sfin.scholarMealCount));
    ok('deposit schema', SK.deposits.every(function (d) { return d.d != null && (d.src === 'homecoming' || d.src === 'other') && d.kcal != null; }));
    ok('0 starvechan errors', (SK.errors || []).length === 0, (SK.errors || []).slice(0, 2).join(';'));
    ok('0 deathcensus errors', fin.instrumentErrors.length === 0, fin.instrumentErrors.slice(0, 2).join(';'));
    // Death rows still reconcile with the harness (the new instrument must
    // not have broken the reused one); full reconcile is proven by the
    // deathcensus proof — here we assert the instrument adds no unexplained.
    ok('deathcensus still unexplained=0', fin.unexplained === 0, String(fin.unexplained));
  }

  console.log('PART C: DET (instrumented == pristine, 2 seeds x 60d)');
  for (const s of [66203, 66204]) {
    const a = await oneRun(s, 60, true);
    const b = await oneRun(s, 60, false);
    const fa = JSON.stringify(outcomeFields(a.Game, a.result));
    const fb = JSON.stringify(outcomeFields(b.Game, b.result));
    ok('s' + s + ' instrumented == pristine', fa === fb,
      fa === fb ? '' : ('A=' + fa.slice(0, 260) + ' B=' + fb.slice(0, 260)));
  }

  console.log('PART D: det-gate (paired re-run byte-identical)');
  {
    const a = await oneRun(66205, 60, true);
    const b = await oneRun(66205, 60, true);
    const fa = JSON.stringify({ m: a.SK.meals, d: a.SK.deposits, h: a.SK.homecomings, s: a.SK.scholarMeals, r: a.SK.rotLostByDay, e: a.SK.rotEaten, st: a.sfin.starv });
    const fb = JSON.stringify({ m: b.SK.meals, d: b.SK.deposits, h: b.SK.homecomings, s: b.SK.scholarMeals, r: b.SK.rotLostByDay, e: b.SK.rotEaten, st: b.sfin.starv });
    ok('paired re-run byte-identical (meals+deposits+starv)', fa === fb,
      'len ' + fa.length + ' vs ' + fb.length);
  }

  console.log('PART E: channel-classifier fixtures');
  function synth(over) {
    // Minimal synthetic K + KDCfin for classifyStarvation.
    var K = {
      meals: [], deposits: [], homecomings: [], scholarMeals: [], havenDays: [],
      rotLostByDay: {}, rotEaten: 0,
    };
    var D = 100, vid = 'v1';
    // The deceased: 14 days, ate 500/2000, drew 300 from pantry, produced 100.
    for (var d = 86; d <= 100; d++) {
      K.meals.push({ d: d, vid: vid, ate: 500, drawn: 300, gave: 0, fasting: false, away: false, produced: 100, expected: 2000, need: 2000 });
    }
    // The village: 11 others, ate 1900/2000 (coverage 0.95), produced 2200.
    for (var v = 2; v <= 12; v++) {
      for (var d2 = 86; d2 <= 100; d2++) {
        K.meals.push({ d: d2, vid: 'v' + v, ate: 1900, drawn: 500, gave: 800, fasting: false, away: false, produced: 2200, expected: 2000, need: 2000 });
      }
    }
    // haven days: scholar at haven every day; scholar meals 2100.
    for (var d3 = 86; d3 <= 100; d3++) {
      K.havenDays.push({ d: d3, atHaven: true });
      K.scholarMeals.push({ d: d3, meal: 2100, atHaven: true });
    }
    var KDCfin = {
      deaths: [{ day: 100, who: 'X', vid: vid, kind: 'villager', cause: 'starvation', pclass: 'starvation' }],
      daily: [],
    };
    for (var d4 = 86; d4 <= 100; d4++) KDCfin.daily.push({ day: d4, pantryKcal: 20000, nationalLive: true });
    if (over) over(K, KDCfin);
    return { K: K, KDCfin: KDCfin };
  }
  function classify(over) {
    var s = synth(over);
    var r = s.KDCfin.deaths[0];
    return SC.classifyStarvation(r, s.K, s.KDCfin);
  }
  {
    // distribution: deceased 0.25 coverage, village 0.95, pantry ample.
    const c = classify(null);
    ok('fixture distribution', c.channel === 'distribution', JSON.stringify(c));
  }
  {
    // inflow-failure: everyone starving, pantry empty, low inflow.
    const c = classify(function (K, KDCfin) {
      for (const m of K.meals) { m.ate = 500; m.drawn = 300; m.produced = 100; }
      for (const d of KDCfin.daily) d.pantryKcal = 800;
    });
    ok('fixture inflow-failure', c.channel === 'inflow-failure', JSON.stringify({ ch: c.channel, flags: c.channelFlags, inflow: c.trailing.inflow, need: c.trailing.need }));
  }
  {
    // rot wins precedence over inflow-failure: rotLost >= 20% inflow.
    const c = classify(function (K, KDCfin) {
      for (const m of K.meals) { m.ate = 500; m.drawn = 300; m.produced = 100; }
      for (const d of KDCfin.daily) d.pantryKcal = 800;
      for (let d = 86; d <= 100; d++) K.rotLostByDay[d] = 500; // 7500 total vs inflow ~21000*...
      K.deposits = [];
    });
    const inflow = c.trailing.inflow;
    ok('fixture rot (precedence over inflow-failure)', c.channel === 'rot',
      JSON.stringify({ ch: c.channel, flags: c.channelFlags, rotLost: c.trailing.rotLost, inflow: inflow }));
  }
  {
    // homecoming-timing: scholar away 12/14, haul arrives 2d after death.
    const c = classify(function (K, KDCfin) {
      for (const m of K.meals) { m.ate = 500; m.drawn = 300; m.produced = 100; }
      for (const d of KDCfin.daily) d.pantryKcal = 800;
      K.havenDays = [];
      for (let d = 86; d <= 100; d++) K.havenDays.push({ d: d, atHaven: d > 98 });
      K.scholarMeals = [];
      K.homecomings = [{ d: 102, pantryBefore: 800, pantryAfter: 6800, givenKcal: 6000, invBefore: 6500, invAfter: 500, awayBefore: true }];
    });
    ok('fixture homecoming-timing', c.channel === 'homecoming-timing', JSON.stringify({ ch: c.channel, flags: c.channelFlags }));
  }
  {
    // scholar-from-haul: scholar away, scholar ate 1.2x need, deceased starved,
    // village not covering (no distribution), pantry low, inflow low — and
    // precedence over inflow-failure.
    const c = classify(function (K, KDCfin) {
      for (const m of K.meals) { m.ate = 500; m.drawn = 300; m.produced = 100; }
      for (const d of KDCfin.daily) d.pantryKcal = 800;
      K.havenDays = [];
      for (let d = 86; d <= 100; d++) K.havenDays.push({ d: d, atHaven: d > 93 });
      K.scholarMeals = [];
      for (let d = 86; d <= 100; d++) K.scholarMeals.push({ d: d, meal: 2400, atHaven: d > 93 });
      K.homecomings = [];
    });
    ok('fixture scholar-from-haul (precedence over inflow-failure)', c.channel === 'scholar-from-haul',
      JSON.stringify({ ch: c.channel, flags: c.channelFlags, schAte: c.trailing.scholarAteNeed }));
  }
  {
    // unattributed: nothing fires (pantry 6000 >= 5000, coverage mixed, scholar present).
    const c = classify(function (K, KDCfin) {
      for (const m of K.meals) { m.ate = 1400; m.drawn = 700; m.produced = 1200; }
      for (const d of KDCfin.daily) d.pantryKcal = 6000;
    });
    ok('fixture unattributed', c.channel === 'unattributed', JSON.stringify({ ch: c.channel, flags: c.channelFlags }));
  }
  {
    // days-below-60 counts honestly: 15 rows at 500/2000 (d86..d100).
    const c = classify(null);
    ok('fixture daysBelow60=15', c.daysBelow60 === 15, String(c.daysBelow60));
    ok('fixture mealDays=15 (d86..d100)', c.mealDays === 15, String(c.mealDays));
  }

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(function (e) { console.error('FATAL', e && e.stack ? e.stack : e); process.exit(1); });

#!/usr/bin/env node
// test-surplusfeed-b.js — proof for the surplus-share governor (arm
// sim-surplusfeed-b, run fleshout-loop-b-20261018T1930Z).
//
// The lever: game.js surplusFeedGovernor(v, give), env-gated SURPLUSFEED=1
// (default OFF). At pantryFreshDays() > 4 it scales the villager's SHARED
// SURPLUS by 0.5 — eating is untouched. Hunger exemption (hungryStreak >= 3)
// mirrors PRODTHROTTLE.
//
// Fixtures:
//   1. GATE-OFF INERT: SURPLUSFEED unset -> returns give exactly, zero writes.
//   2. GLUT TRIMS SHARE: gate on + pantryFreshDays>4 -> give*0.5, telemetry
//      recorded, one-shot beat in the log.
//   3. LEAN NO TRIM: gate on + freshDays<=4 -> unchanged.
//   4. HUNGER EXEMPTION: gate on + glut + hungryStreak>=3 -> unchanged.
//   5. EATING INTACT: 30d headless run, gate on vs off, identical seed:
//      per-person-day ate never lower armed (eating code untouched); trim
//      events > 0 on armed (mechanism visible).
//   --trajectory: prints sha256 of the 40d trajectory (day, pantryKcal,
//      roster, deaths) for the bash-orchestrated det-gate (hunk-applied +
//      gate-off vs hunk-reverted must be byte-identical).
//
// Kill protocol: if the pilot sweep shows zero trim events on every pair,
// the mechanism is invisible in practice -> this test's fixture 5 becomes
// INFO-SKIP (exit 0) rather than a failure; the game.js hunk is reverted
// zero-trace.
'use strict';
const crypto = require('crypto');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

const SEED = 6401;
let failures = 0;
function ok(name, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
  if (!cond) failures++;
}

function freshKcal(Game) {
  return (((Game.state || {}).village || {}).pantry || [])
    .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
}

async function unitFixtures() {
  // narration: true keeps say() live so the easing beat is observable
  // (sim-harness stubs say to a no-op by default).
  const { Game } = await loadGame({ seed: SEED, mode: 'surplusfeed-b-test', fullTelemetry: false, narration: true });
  await setupGame(Game);
  const v = Game.state.village;
  const day = (Game.state.scholar || {}).day || 0;

  const glutPantry = () => {
    v.pantry = [];
    v.pantry.push({ name: 'Foraged food', kcalEach: 200, units: 1000, spoilDay: v.day + 3, safe: true, kg: 0.2 });
    v.burnHistory = [24000, 24000, 24000]; // 200k / 24k = 8.3 fresh days
  };
  const leanPantry = () => {
    v.pantry = [];
    v.pantry.push({ name: 'Foraged food', kcalEach: 200, units: 1, spoilDay: v.day + 3, safe: true, kg: 0.2 });
    v.burnHistory = [24000, 24000, 24000]; // 200 / 24k = 0.008 fresh days
  };

  // 1. GATE-OFF INERT
  delete process.env.SURPLUSFEED;
  glutPantry();
  const days = Game.pantryFreshDays();
  ok('glut fixture reads >4 fresh days', days > 4, 'freshDays=' + days.toFixed(2));
  const r1 = Game.surplusFeedGovernor(v, 1000);
  ok('gate-off returns give exactly', r1 === 1000, 'got ' + r1);
  ok('gate-off writes nothing', v._surplusFeed === undefined);

  // 2. GLUT TRIMS SHARE
  process.env.SURPLUSFEED = '1';
  glutPantry();
  const before = String((Game.log || []).map(String).join('\n'));
  const r2 = Game.surplusFeedGovernor(v, 1000);
  ok('glut trims share to half', r2 === 500, 'got ' + r2);
  const rec = v._surplusFeed && v._surplusFeed.days && v._surplusFeed.days[day];
  ok('trim telemetry recorded', !!(rec && rec.trim === 1 && rec.kcal === 500),
    JSON.stringify(rec || null));
  const after = String((Game.log || []).map(String).join('\n'));
  ok('easing beat in log', after.includes("groaning pantry shelves") && !before.includes("groaning pantry shelves"));

  // second trim same day: telemetry grows, no second beat (one-shot per stretch)
  const logLen = (Game.log || []).length;
  Game.surplusFeedGovernor(v, 800);
  const rec2 = v._surplusFeed.days[day];
  ok('telemetry accumulates', rec2.trim === 2 && rec2.kcal === 900, JSON.stringify(rec2));
  const beatLines = String((Game.log || []).map(String).join('\n')).split("groaning pantry shelves").length - 1;
  ok('beat is one-shot per stretch', beatLines === 1, beatLines + ' beat lines');

  // 3. LEAN NO TRIM
  leanPantry();
  const r3 = Game.surplusFeedGovernor(v, 1000);
  ok('lean pantry: no trim', r3 === 1000, 'got ' + r3);

  // 4. HUNGER EXEMPTION
  glutPantry();
  const oProg = Game.progState;
  Game.progState = () => ({ hungryStreak: 5 });
  const r4 = Game.surplusFeedGovernor(v, 1000);
  Game.progState = oProg;
  ok('hunger streak exempts', r4 === 1000, 'got ' + r4);

  delete process.env.SURPLUSFEED;
}

async function eatingIntact() {
  // 5. EATING INTACT + mechanism visible: 30d, identical seed, gate on vs off.
  const runs = {};
  for (const side of ['control', 'armed']) {
    if (side === 'armed') process.env.SURPLUSFEED = '1'; else delete process.env.SURPLUSFEED;
    const { Game } = await loadGame({ seed: SEED, mode: 'surplusfeed-b-eat-' + side, fullTelemetry: false });
    await setupGame(Game);
    let ate = 0, vdays = 0, surplus = 0;
    const oMeal = Game.villagerMealDay;
    Game.villagerMealDay = function () {
      const r = oMeal.apply(this, arguments);
      try { ate += (r && r.ate) || 0; vdays++; } catch (e) {}
      return r;
    };
    const oSur = Game.stockSurplus;
    Game.stockSurplus = function () {
      const r = oSur.apply(this, arguments);
      try { if (typeof r === 'number' && r > 0) surplus += r; } catch (e) {}
      return r;
    };
    await runDays(Game, leadfeast, { days: 30, manifest: null });
    let trims = 0, trimKcal = 0;
    try {
      const sf = (Game.state.village || {})._surplusFeed || {};
      for (const d of Object.keys(sf.days || {})) { trims += sf.days[d].trim; trimKcal += sf.days[d].kcal; }
    } catch (e) {}
    runs[side] = { atePerVday: vdays ? ate / vdays : 0, vdays, surplus, trims, trimKcal };
  }
  delete process.env.SURPLUSFEED;
  const c = runs.control, a = runs.armed;
  ok('mechanism visible (trim events > 0 on armed)', a.trims > 0, 'trims=' + a.trims);
  ok('surplus volume armed < control', a.surplus < c.surplus,
    'armed=' + Math.round(a.surplus) + ' control=' + Math.round(c.surplus));
  ok('eating never lower armed (per person-day)', a.atePerVday >= c.atePerVday - 1e-9,
    'armed=' + a.atePerVday.toFixed(1) + ' control=' + c.atePerVday.toFixed(1));
  console.log('INFO surplus trimmed kcal=' + Math.round(a.trimKcal) + ' over 30d seed ' + SEED);
}

async function trajectory() {
  // --trajectory: sha256 of 40d trajectory for the det-gate. Gate is OFF
  // here; the bash orchestration diffs this against the hunk-reverted tree.
  delete process.env.SURPLUSFEED;
  const seeds = [6401, 6402], days = 40, series = [];
  for (const seed of seeds) {
    const { Game } = await loadGame({ seed, mode: 'surplusfeed-b-det', fullTelemetry: false });
    await setupGame(Game);
    let deaths = 0;
    const oDie = Game.registerDeath;
    if (typeof oDie === 'function') Game.registerDeath = function () {
      try { deaths++; } catch (e) {}
      return oDie.apply(this, arguments);
    };
    const oSleep = Game.sleep;
    Game.sleep = function () {
      const r = oSleep.apply(this, arguments);
      try {
        series.push({
          seed, day: ((Game.state || {}).scholar || {}).day || 0,
          pk: Math.round(freshKcal(Game)),
          roster: (((Game.state || {}).village || {}).roster || []).length,
          deaths,
        });
      } catch (e) {}
      return r;
    };
    await runDays(Game, leadfeast, { days, manifest: null });
  }
  const h = crypto.createHash('sha256').update(JSON.stringify(series)).digest('hex');
  console.log('TRAJECTORY ' + h + ' points=' + series.length);
}

(async () => {
  if (process.argv.includes('--trajectory')) { await trajectory(); return; }
  await unitFixtures();
  await eatingIntact();
  console.log(failures === 0 ? 'ALL GREEN' : failures + ' FAILURES');
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('TEST CRASH', e); process.exit(2); });

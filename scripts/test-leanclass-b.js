#!/usr/bin/env node
// test-leanclass-b.js — determinism fixtures for the lean-regime divergence
// census (arm sim-leanclass-b, run fleshout-loop-b-20261019T0130Z).
//
// The census's attribution argument rests on two claims about the landed
// surplusfeed layer (game.js surplusFeedGovernor, env-gated SURPLUSFEED=1):
//   (a) gate-off path is inert: returns give exactly, zero writes, zero RNG.
//   (b) the governor never fires when pantryFreshDays() <= 4 (lean window).
// From (a): identical seed + identical env => byte-identical trajectory.
// From (a)+(b): control vs armed twins are identical up to the armed twin's
// first trim; any lean-regime divergence is then either post-trim (governor
// channel) or a harness determinism failure (artifact channel).
//
// Fixtures (all instrument-only, no game-code changes):
//   T1. same seed, same env (control), twice -> fingerprint series identical.
//   T2. control vs armed, same seed -> fingerprints identical through the
//       armed twin's first-trim day (first difference strictly later).
//   T3. full 180d armed run -> every trim event has fire-time freshDays > 4
//       (no lean-window trims).
// A miss on any fixture is instrument NO-GO (loud), never a lever verdict.
//
// Seeds 6401/6402 (pilot range) keep the census seeds 6417-6424 strictly fresh.
'use strict';
const crypto = require('crypto');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

let failures = 0;
function ok(name, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
  if (!cond) failures++;
}

function pantryKcal(Game) {
  return (((Game.state || {}).village || {}).pantry || [])
    .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
}
function livingCount(Game) {
  try {
    return (((Game.state || {}).village || {}).roster || [])
      .filter(id => { try { const p = Game.getPerson(id); return p && !p.dead; } catch (e) { return false; } }).length;
  } catch (e) { return -1; }
}

// Run one sim and return {fps, trims}: fps = per-dawn fingerprint series,
// trims = governor log [{day, give, r, fireFd}].
async function oneRun(seed, armed, days, policy) {
  if (armed) process.env.SURPLUSFEED = '1'; else delete process.env.SURPLUSFEED;
  const { Game } = await loadGame({ seed, mode: 'leanclass-test-' + (armed ? 'a' : 'c'), fullTelemetry: false });
  await setupGame(Game);
  const fps = [], trims = [];
  let ate = 0, share = 0;
  const oMeal = Game.villagerMealDay;
  if (typeof oMeal === 'function') Game.villagerMealDay = function () {
    const r = oMeal.apply(this, arguments);
    try { ate += (r && r.ate) || 0; } catch (e) {}
    return r;
  };
  const oSur = Game.stockSurplus;
  if (typeof oSur === 'function') Game.stockSurplus = function () {
    const r = oSur.apply(this, arguments);
    try { if (typeof r === 'number' && r > 0) share += r; } catch (e) {}
    return r;
  };
  const oGov = Game.surplusFeedGovernor;
  if (typeof oGov === 'function') Game.surplusFeedGovernor = function (v, give) {
    let fireFd = -1;
    try { fireFd = Game.pantryFreshDays(); } catch (e) {}
    const r = oGov.apply(this, arguments);
    try {
      if (armed && typeof r === 'number' && r < give) {
        trims.push({ day: (Game.state.scholar || {}).day || 0, give: Math.round(give), r: Math.round(r), fireFd: +Number(fireFd).toFixed(3) });
      }
    } catch (e) {}
    return r;
  };
  const oSleep = Game.sleep;
  if (typeof oSleep === 'function') Game.sleep = function () {
    const r = oSleep.apply(this, arguments);
    try {
      fps.push({
        day: ((Game.state || {}).scholar || {}).day || 0,
        live: livingCount(Game), pk: Math.round(pantryKcal(Game)),
        fd: +Number(Game.pantryFreshDays()).toFixed(3),
        ate: Math.round(ate), share: Math.round(share),
      });
    } catch (e) {}
    return r;
  };
  await runDays(Game, policy || leadfeast, { days, manifest: null });
  delete process.env.SURPLUSFEED;
  return { fps, trims };
}

function firstDiffDawn(a, b) {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) return a[i].day;
  }
  return a.length === b.length ? null : (a[n] || b[n]).day;
}

async function t1() {
  // T1: same seed, same env, twice -> byte-identical fingerprint series.
  const r1 = await oneRun(6401, false, 40);
  const r2 = await oneRun(6401, false, 40);
  const h1 = crypto.createHash('sha256').update(JSON.stringify(r1.fps)).digest('hex').slice(0, 16);
  const h2 = crypto.createHash('sha256').update(JSON.stringify(r2.fps)).digest('hex').slice(0, 16);
  ok('T1 twin determinism (same seed, same env)', h1 === h2 && r1.fps.length === r2.fps.length,
    'n=' + r1.fps.length + '/' + r2.fps.length + ' ' + h1 + '/' + h2);
}

async function t2() {
  // T2: control vs armed identical through the armed twin's first-trim day.
  const c = await oneRun(6402, false, 120);
  const a = await oneRun(6402, true, 120);
  const firstTrim = a.trims.length ? a.trims[0].day : null;
  const onset = firstDiffDawn(c.fps, a.fps);
  if (firstTrim === null) {
    ok('T2 mechanism visible on seed 6402 (trim fired)', false, 'no trims — cannot test post-trim identity');
    return;
  }
  ok('T2 identical through first-trim day', onset === null || onset > firstTrim,
    'firstTrimDay=' + firstTrim + ' onsetDay=' + onset);
}

async function t3() {
  // T3: no lean-window trims on a full 180d armed run.
  const a = await oneRun(6401, true, 180);
  const lean = a.trims.filter(t => t.fireFd <= 4);
  ok('T3 no lean-window trims (fireFd>4 for all)', lean.length === 0,
    a.trims.length + ' trims, ' + lean.length + ' with fireFd<=4' +
    (lean.length ? ' e.g. day ' + lean[0].day + ' fd=' + lean[0].fireFd : ''));
}

(async () => {
  await t1();
  await t2();
  await t3();
  console.log(failures === 0 ? 'ALL GREEN' : failures + ' FAILURES');
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('TEST CRASH', e); process.exit(2); });

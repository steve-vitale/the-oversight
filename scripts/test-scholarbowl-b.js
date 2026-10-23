#!/usr/bin/env node
// test-scholarbowl-b.js — proof for the scholar's bowl layer
// (scripts/layers/scholarbowl-b.js, SCHOLARBOWL=1).
//
// E0 unit (stubbed Game): gate-off is a noop; armed thin-day halves the
//   scholar's draw intent, voices once/day, deterministic lines, no RNG,
//   empty-pantry thin day halves but stays silent, thick day untouched.
// E1 det-gate: 60d sim, SCHOLARBOWL unset, install() vs not — digest-identical.
// E2 sim smoke (SCHOLARBOWL=1, 60d): completes, mechanism fires, 0 errors.
// E3 armed 60d re-run digest-identical (deterministic).
'use strict';
const assert = require('assert');
const crypto = require('crypto');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const layer = require('./layers/scholarbowl-b');

let passed = 0;
function ok(name, cond, extra) {
  if (!cond) { console.error('FAIL: ' + name + (extra ? ' — ' + extra : '')); process.exitCode = 1; return; }
  passed++; console.log('ok: ' + name);
}

function stubGame(opts) {
  opts = opts || {};
  const said = [];
  const g = {
    __simSeed: opts.seed || 67401,
    state: { scholar: { day: opts.day || 10 }, village: {} },
    _thin: opts.thin !== undefined ? opts.thin : true,
    _freshKcal: opts.freshKcal !== undefined ? opts.freshKcal : 5000,
    _sbHalve: false,
    say(s) { said.push(s); },
    tele() {},
    pantryFreshDays() { return this._thin ? 1.5 : 5.0; },
    pantryFreshKcal() { return this._freshKcal; },
    _wantSeen: null,
    pantryDraw(v, want, o) { this._wantSeen = want; return { taken: want }; },
    villageMeal() { this.pantryDraw({}, 1000, {}); return 'meal'; },
  };
  g._said = said;
  return g;
}

function withEnv(env, fn) {
  const prev = {};
  for (const k of Object.keys(env)) { prev[k] = process.env[k]; process.env[k] = env[k]; }
  try { return fn(); }
  finally {
    for (const k of Object.keys(env)) {
      if (prev[k] === undefined) delete process.env[k]; else process.env[k] = prev[k];
    }
  }
}

// ---------- E0 ----------
delete process.env.SCHOLARBOWL;
{
  const g = stubGame({ thin: true });
  const origMeal = g.villageMeal, origDraw = g.pantryDraw;
  const { tele, uninstall } = layer.install(g);
  ok('E0 gate-off: methods unwrapped', g.villageMeal === origMeal && g.pantryDraw === origDraw);
  ok('E0 gate-off: no namespace marker', g.villageMeal._scholarBowl === undefined);
  ok('E0 gate-off: tele all zero', JSON.stringify(tele) === JSON.stringify({ thinMeals: 0, halves: 0, savedKcal: 0, voices: 0, errors: 0, beatLines: [] }));
  ok('E0 gate-off: uninstall is noop-safe', (() => { uninstall(); return g.villageMeal === origMeal; })());
}
{
  // armed, thin day with food: half + voice
  const g = withEnv({ SCHOLARBOWL: '1' }, () => {
    const gg = stubGame({ thin: true, day: 10, seed: 67401 });
    layer.install(gg);
    gg.villageMeal();
    return gg;
  });
  ok('E0 armed thin: want halved 1000->500', g._wantSeen === 500, 'saw ' + g._wantSeen);
  ok('E0 armed thin: flag cleared after meal', g._sbHalve === false);
  ok('E0 armed thin: one voice line', g._said.length === 1, JSON.stringify(g._said));
  ok('E0 armed thin: line is player-voice bowl fiction',
    /🍽️/.test(g._said[0]) && /half/i.test(g._said[0]));
}
{
  // armed, second meal same day: no second voice, still halves
  const g = withEnv({ SCHOLARBOWL: '1' }, () => {
    const gg = stubGame({ thin: true, day: 10, seed: 67401 });
    layer.install(gg);
    gg.villageMeal(); gg.villageMeal();
    return gg;
  });
  ok('E0 armed thin x2: halves twice', g._wantSeen === 500);
  ok('E0 armed thin x2: still one voice/day', g._said.length === 1, 'said=' + g._said.length);
}
{
  // armed, thick day: untouched
  const g = withEnv({ SCHOLARBOWL: '1' }, () => {
    const gg = stubGame({ thin: false, day: 10, seed: 67401 });
    layer.install(gg);
    gg.villageMeal();
    return gg;
  });
  ok('E0 armed thick: want untouched', g._wantSeen === 1000, 'saw ' + g._wantSeen);
  ok('E0 armed thick: silent', g._said.length === 0);
}
{
  // armed, thin day, EMPTY pantry: halves the intent but stays silent
  // (the pristine "No food in the pantry" beat owns the empty bin)
  const g = withEnv({ SCHOLARBOWL: '1' }, () => {
    const gg = stubGame({ thin: true, day: 10, seed: 67401, freshKcal: 0 });
    layer.install(gg);
    gg.villageMeal();
    return gg;
  });
  ok('E0 armed thin empty: intent still halved', g._wantSeen === 500);
  ok('E0 armed thin empty: no voice on empty bin', g._said.length === 0);
}
{
  // armed: no Math.random consumed by the layer
  let rngCalls = 0;
  const realRandom = Math.random;
  Math.random = function () { rngCalls++; return realRandom(); };
  try {
    withEnv({ SCHOLARBOWL: '1' }, () => {
      const gg = stubGame({ thin: true, day: 10, seed: 67401 });
      layer.install(gg);
      gg.villageMeal(); gg.villageMeal();
    });
  } finally { Math.random = realRandom; }
  ok('E0 armed: layer consumes zero Math.random', rngCalls === 0, 'calls=' + rngCalls);
}
{
  // armed: deterministic voice across installs (same day+seed -> same line)
  const pick = (seed) => withEnv({ SCHOLARBOWL: '1' }, () => {
    const gg = stubGame({ thin: true, day: 33, seed });
    layer.install(gg);
    gg.villageMeal();
    return gg._said[0];
  });
  ok('E0 armed: voice deterministic same seed', pick(67401) === pick(67401));
  ok('E0 armed: voice varies across days', (() => {
    const a = withEnv({ SCHOLARBOWL: '1' }, () => {
      const gg = stubGame({ thin: true, day: 33, seed: 67401 }); layer.install(gg); gg.villageMeal(); return gg._said[0];
    });
    const b = withEnv({ SCHOLARBOWL: '1' }, () => {
      const gg = stubGame({ thin: true, day: 34, seed: 67401 }); layer.install(gg); gg.villageMeal(); return gg._said[0];
    });
    return a !== b;
  })(), 'lines repeat only by (day+seed)%5 — the anti-repetition check');
}
{
  // armed: uninstall restores originals
  const g = withEnv({ SCHOLARBOWL: '1' }, () => {
    const gg = stubGame({ thin: true });
    const origMeal = gg.villageMeal, origDraw = gg.pantryDraw;
    const { uninstall } = layer.install(gg);
    uninstall();
    return { gg, origMeal, origDraw };
  });
  ok('E0 armed: uninstall restores', g.gg.villageMeal === g.origMeal && g.gg.pantryDraw === g.origDraw);
  ok('E0 armed: namespace marker while installed', (() => {
    let marked = false;
    withEnv({ SCHOLARBOWL: '1' }, () => {
      const gg = stubGame({ thin: true });
      layer.install(gg);
      marked = gg.villageMeal._scholarBowl === 'SCHOLARBOWL_B' && gg.pantryDraw._scholarBowl === 'SCHOLARBOWL_B';
    });
    return marked;
  })());
}

// ---------- E1/E2/E3: sim proofs ----------
async function simDigest(opts) {
  const { loadGame, setupGame, runDays } = require('./sim-harness');
  const { leadfeast } = require('./policies/feastscale');
  const { Game, manifest } = await loadGame({ seed: opts.seed, mode: 'scholarbowl-proof' });
  await setupGame(Game, 'Columbus, Ohio');
  let tele = null;
  if (opts.installLayer) {
    const r = layer.install(Game);
    tele = r.tele;
    Game.__sbUninstall = r.uninstall;
  }
  const result = await runDays(Game, leadfeast, { days: 60, manifest });
  if (Game.__sbUninstall) Game.__sbUninstall();
  const snap = {
    day: Game.state.scholar.day,
    kcal: Math.round(Game.state.scholar.kcal || 0),
    pantry: Math.round(((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)),
    roster: ((Game.state.village || {}).roster || []).slice().sort().join(','),
    trust: Math.round((Game.state.village.trust || {})[Game.villagerId] || 0),
    deaths: (result.samples.deaths || []).length,
  };
  const digest = crypto.createHash('sha256').update(JSON.stringify(snap)).digest('hex').slice(0, 16);
  return { digest, snap, tele, deaths: result.samples.deaths };
}

(async () => {
  const seed = 67401;
  // Substrate fidelity (the deathcause-b / poolscholar-b / thindefer-b substrate):
  // FEASTSCALE_R13=1 / SEATDRIVE=0 for all sim proofs.
  const prevSub = { FEASTSCALE_R13: process.env.FEASTSCALE_R13, SEATDRIVE: process.env.SEATDRIVE };
  process.env.FEASTSCALE_R13 = '1'; process.env.SEATDRIVE = '0';
  try {
  // E1: gate-off det — install() called vs never installed, SCHOLARBOWL unset
  delete process.env.SCHOLARBOWL;
  const a = await simDigest({ seed, installLayer: false });
  const b = await simDigest({ seed, installLayer: true });
  ok('E1 det-gate: gate-off install is digest-identical', a.digest === b.digest,
    'no-install=' + a.digest + ' install=' + b.digest + ' ' + JSON.stringify(a.snap));

  // E2: armed smoke — mechanism fires, zero errors.
  // (withEnv is sync-only; the sim proofs are async, so set the env directly.)
  process.env.SCHOLARBOWL = '1';
  const c = await simDigest({ seed, installLayer: true });
  delete process.env.SCHOLARBOWL;
  ok('E2 armed smoke: sim completes', c.snap.day > 30, 'day=' + c.snap.day);
  ok('E2 armed smoke: thin meals seen', c.tele.thinMeals > 0, JSON.stringify(c.tele));
  ok('E2 armed smoke: halves applied', c.tele.halves > 0, JSON.stringify(c.tele));
  ok('E2 armed smoke: voices fired', c.tele.voices > 0, JSON.stringify(c.tele));
  ok('E2 armed smoke: saved kcal > 0', c.tele.savedKcal > 0, JSON.stringify(c.tele));
  ok('E2 armed smoke: zero layer errors', c.tele.errors === 0, JSON.stringify(c.tele));

  // E3: armed determinism — re-run digest-identical
  process.env.SCHOLARBOWL = '1';
  const d = await simDigest({ seed, installLayer: true });
  delete process.env.SCHOLARBOWL;
  ok('E3 armed det: digest-identical re-run', c.digest === d.digest,
    c.digest + ' vs ' + d.digest);
  ok('E3 armed det: tele-identical re-run', JSON.stringify({ ...c.tele, beatLines: c.tele.beatLines.length }) === JSON.stringify({ ...d.tele, beatLines: d.tele.beatLines.length }));

  console.log('\n' + passed + ' checks passed' + (process.exitCode ? ' (WITH FAILURES)' : ' — ALL GREEN'));
  } finally {
    if (prevSub.FEASTSCALE_R13 === undefined) delete process.env.FEASTSCALE_R13; else process.env.FEASTSCALE_R13 = prevSub.FEASTSCALE_R13;
    if (prevSub.SEATDRIVE === undefined) delete process.env.SEATDRIVE; else process.env.SEATDRIVE = prevSub.SEATDRIVE;
  }
})().catch(e => { console.error('HARNESS ERROR: ' + (e && e.stack || e)); process.exitCode = 1; });

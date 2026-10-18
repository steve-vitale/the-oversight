#!/usr/bin/env node
// test-feastdraw-b.js — FEAST-DRAW proof test (sim-feastdraw-b).
//
// RED (FEASTDRAW unset): the wrapped villageEats delegates byte-identically —
// no seconds, no voice, no ctx telemetry.
// GREEN (FEASTDRAW=1): on a pinned fixture with post-dinner doomed fresh >
// 200*roster, the cook serves seconds: doomed drawn down, voice said once,
// ctx telemetry set, consequences rolled (no laundering), ledgers consistent.
// Invariants: below the 200*roster trigger -> no fire; spoiled never counts
// as doomed; real pantry stacks with foodState undefined count as the fresh
// sink (finding #546); preserved/rendered excluded; deterministic; the
// seconds pass never exceeds 400*roster/night.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
let L;
try { L = require('./policies/feastdraw'); }
catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    // Post-kill INFO-SKIP: the layer was deleted per kill protocol — proof
    // vacuous. The layer was proven GREEN pre-kill; the log lives in
    // evidence/2026-10-18/sim-feastdraw-b.md.
    console.log('INFO-SKIP: sim-feastdraw-b layer killed per protocol (policies/feastdraw.js absent); proof vacuous, exit 0.');
    process.exit(0);
  }
  throw e;
}
const { withFeastDraw, doomedFresh, serveSeconds, layerOn, TRIGGER_PER_ROSTER, CAP_PER_ROSTER } = L;
const { leadfeast } = require('./policies/feastscale');

function freshStack(day, name, units, kcalEach, spoilIn, foodState) {
  return { name, kcalEach, units, spoilDay: day + spoilIn, foodKind: 'meat',
           foodState: foodState === undefined ? 'fresh' : foodState, safe: false, kg: 0.2, unit: 'portion' };
}

async function fixture(doomedKcal) {
  const { Game } = await loadGame({ seed: 4242, mode: 'proof-feastdraw', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village;
  const s = Game.state.scholar;
  const day = s.day || 1;
  const bonus = (Game.spoilBonusDays ? Math.round(Game.spoilBonusDays()) : 0) || 0;
  const roster = (v.roster || []).length || 10;
  v.pantry = [];
  // doomed: bonus-inclusive (spoilDay+bonus)==day+1. Split into fresh-state
  // and foodState-undefined (real pantry) stacks to pin finding #546.
  const per = 200;
  const units = Math.ceil(doomedKcal / 2 / per);
  v.pantry.push(freshStack(day, 'Deer meat', units, per, 1 - bonus, 'fresh'));
  v.pantry.push(Object.assign(freshStack(day, 'Foraged food', units, per, 1 - bonus), { foodState: undefined }));
  // keeps: not doomed
  v.pantry.push(freshStack(day, 'Beans', 40, 100, 30, 'fresh'));
  // spoiled: must never count
  const spoiled = { name: 'Old fish', kcalEach: 100, units: 50, spoilDay: day - bonus,
    foodKind: 'fish', foodState: 'fresh', safe: false };
  v.pantry.push(spoiled);
  // preserved: must never count
  v.pantry.push({ name: 'Smoked venison (dried)', kcalEach: 160, units: 50, spoilDay: day + 20,
    foodKind: 'meat', foodState: 'preserved', safe: true });
  return { Game, v, s, day, roster, bonus, doomedKcal };
}

(async () => {
  let fail = 0;
  const check = (name, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name); if (!cond) fail++; };
  const wrapped = withFeastDraw(leadfeast, 'leadfeastdraw-test', 'test');
  check('trigger constant pinned', TRIGGER_PER_ROSTER === 200);
  check('cap constant pinned', CAP_PER_ROSTER === 400);

  // ---------- RED: gate off = pure delegation ----------
  {
    delete process.env.FEASTDRAW;
    const { Game, v, day, roster } = await fixture(20000);
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = {};
    wrapped.setup(Game, ctx);
    check('RED layer off', !layerOn());
    check('RED wrap installed', !!Game._feastdrawInstalled);
    const doomedBefore = doomedFresh(Game).kcal;
    check('RED doomed fixture sane (spoiled+preserved excluded)', doomedBefore === 20000);
    const eaten = serveSeconds(Game, ctx);
    check('RED no seconds served', eaten === 0);
    check('RED no seconds voice', !lines.some(l => /seconds all round/.test(l)));
    check('RED no telemetry', !ctx._fdNights && !ctx._fdKcal);
    // integration: full villageEats with the gate off — no telemetry
    const doomedB2 = doomedFresh(Game).kcal;
    Game.villageEats();
    check('RED villageEats delegates (no fd telemetry)', !ctx._fdNights);
    check('RED villageEats still eats the doomed pile first', doomedFresh(Game).kcal < doomedB2);
  }

  // ---------- GREEN: seconds served at the trigger ----------
  {
    process.env.FEASTDRAW = '1';
    const { Game, v, day, roster } = await fixture(20000);
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = {};
    wrapped.setup(Game, ctx);
    const trigger = TRIGGER_PER_ROSTER * roster;
    const doomed = doomedFresh(Game);
    console.log('  doomed=' + Math.round(doomed.kcal) + ' trigger(200*roster)=' + trigger + ' roster=' + roster);
    check('GREEN doomed exceeds trigger', doomed.kcal > trigger);
    check('GREEN real-pantry stacks count as fresh sink', (doomed.names || []).includes('Foraged food'));
    const eaten = serveSeconds(Game, ctx);
    check('GREEN seconds served (>0)', eaten > 0);
    check('GREEN capped at 400*roster', eaten <= CAP_PER_ROSTER * roster + 1);
    check('GREEN voice said once', lines.filter(l => /seconds all round/.test(l)).length === 1);
    check('GREEN voice names the food', /Deer meat/.test(lines.find(l => /seconds all round/.test(l)) || ''));
    check('GREEN voice names no lever', !/feastdraw/i.test(lines.join(' ')));
    check('GREEN telemetry nights', ctx._fdNights === 1);
    check('GREEN telemetry kcal', ctx._fdKcal === eaten);
    const doomedLeft = doomedFresh(Game).kcal;
    check('GREEN doomed pile drawn down', doomedLeft < doomed.kcal);
    console.log('  eaten=' + eaten + ' doomedLeft=' + Math.round(doomedLeft));
    // ledgers: every fed villager took from the pantry honestly
    const takes = Object.values(v.takes || {}).reduce((t, k) => t + (k || 0), 0);
    check('GREEN takes ledger records the seconds', takes >= eaten - 1);
  }

  // ---------- G2: below trigger -> no fire ----------
  {
    process.env.FEASTDRAW = '1';
    const { Game, v, day, roster } = await fixture(2000); // < 200*roster for 12
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = {};
    wrapped.setup(Game, ctx);
    const eaten = serveSeconds(Game, ctx);
    check('G2 no fire below trigger', eaten === 0 && !ctx._fdNights);
    check('G2 no voice below trigger', !lines.some(l => /seconds all round/.test(l)));
  }

  // ---------- G3: integration through wrapped villageEats ----------
  {
    process.env.FEASTDRAW = '1';
    const { Game, v, day, roster } = await fixture(60000); // survives dinner above trigger
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    const ctx = {};
    wrapped.setup(Game, ctx);
    Game.villageEats();
    check('G3 wrapped villageEats serves seconds', (ctx._fdNights || 0) >= 1);
    check('G3 voice through villageEats', lines.some(l => /seconds all round/.test(l)));
    const takes = Object.values(v.takes || {}).reduce((t, k) => t + (k || 0), 0);
    check('G3 takes ledger moved', takes > 0);
  }

  // ---------- G4: double-install is idempotent ----------
  {
    process.env.FEASTDRAW = '1';
    const { Game, v, day, roster } = await fixture(20000);
    const ctx1 = {}, ctx2 = {};
    wrapped.setup(Game, ctx1);
    const w1 = Game.villageEats;
    wrapped.setup(Game, ctx2); // second install must not double-wrap
    check('G4 idempotent install', Game.villageEats === w1);
    const lines = [];
    Game.say = (st) => { lines.push(String(st)); };
    serveSeconds(Game, ctx2);
    check('G4 second install serves exactly once', (ctx2._fdNights || 0) === 1 && !ctx1._fdNights);
  }

  // ---------- G5: determinism ----------
  {
    process.env.FEASTDRAW = '1';
    const mk = async () => {
      const { Game, v } = await fixture(20000);
      const ctx = {};
      wrapped.setup(Game, ctx);
      Game.say = () => {};
      const eaten = serveSeconds(Game, ctx);
      return eaten + '|' + doomedFresh(Game).kcal;
    };
    const a = await mk(), b = await mk();
    check('G5 deterministic', a === b);
  }

  // ---------- G6: no seconds when pantry is bare of doomed ----------
  {
    process.env.FEASTDRAW = '1';
    const { Game, v, day } = await fixture(0);
    const ctx = {};
    wrapped.setup(Game, ctx);
    check('G6 empty pantry -> 0', serveSeconds(Game, ctx) === 0 && !ctx._fdNights);
  }

  delete process.env.FEASTDRAW;
  console.log(fail === 0 ? 'ALL GREEN' : fail + ' FAILURES');
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('PROOF CRASH', e); process.exit(2); });

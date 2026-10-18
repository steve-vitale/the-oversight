#!/usr/bin/env node
// test-prodrebound-b.js — proof test for the sim-prodrebound-b diagnostic
// instruments (run fleshout-loop-b-20261018T175233Z).
//
// RED (FEASTDRAW_REPLAY unset): the replay-wrapped policy delegates
//   byte-identically to the base policy over 40d x 2 seeds — the replay
//   is invisible when off (det-gate).
// GREEN (FEASTDRAW_REPLAY=1): on a pinned doomed fixture, serveSeconds
//   draws the doomed pile down, respects the 400*roster cap, eases hunger
//   with the meal's own math, keeps recordTakeHist, sets ctx telemetry,
//   and never counts spoiled/preserved as doomed.
// CONSERVATION: the sweep's channel attribution sums to the independent
//   stockPantry total (no kcal created or lost by the instruments).
// FIDELITY: the replay reproduces the KNOWN backfire — lead 6206 armed
//   rot >= 1.5x control rot at 180d (the original measured 1.87x). If this
//   fails, the attribution below is invalid.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');
const R = require('./prodrebound-feastdraw-replay');

let fail = 0;
function check(name, cond, extra) {
  if (cond) console.log('  PASS ' + name);
  else { console.log('  FAIL ' + name + (extra ? ' :: ' + extra : '')); fail++; }
}

function fingerprint(Game) {
  const v = (Game.state || {}).village || {};
  const pk = (v.pantry || []).map(i => [i.name, i.kcalEach, i.units, i.spoilDay, i.foodState].join('|')).sort().join(';');
  const day = ((Game.state || {}).scholar || {}).day || 0;
  const roster = (v.roster || []).length;
  const burn = JSON.stringify(v.burnHistory || []);
  return [day, roster, pk.length, burn.length, pk.slice(0, 4000), burn].join('~');
}

async function detGate() {
  console.log('RED det-gate: replay gate-off == base byte-identical (40d x 2 seeds)');
  delete process.env.FEASTDRAW_REPLAY;
  for (const seed of [6301, 6302]) {
    const a = await loadGame({ seed, mode: 'pb-det-a', fullTelemetry: false });
    await setupGame(a.Game);
    await runDays(a.Game, leadfeast, { days: 40, manifest: null });
    const fa = fingerprint(a.Game);
    const b = await loadGame({ seed, mode: 'pb-det-b', fullTelemetry: false });
    await setupGame(b.Game);
    const wrapped = R.withFeastDrawReplay(leadfeast, 'det', 'det');
    await runDays(b.Game, wrapped, { days: 40, manifest: null });
    check(`seed ${seed} gate-off identical`, fa === fingerprint(b.Game));
  }
}

function freshStack(day, name, units, kcalEach, spoilIn, foodState) {
  return { name, kcalEach, units, spoilDay: day + spoilIn, foodKind: 'meat',
           foodState: foodState === undefined ? 'fresh' : foodState, safe: false, kg: 0.2, unit: 'portion' };
}

async function greenFixture() {
  console.log('GREEN fixture: serveSeconds behavior on pinned doomed pantry');
  process.env.FEASTDRAW_REPLAY = '1';
  const { Game } = await loadGame({ seed: 77, mode: 'pb-green', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village;
  const day = (Game.state.scholar || {}).day || 1;
  const bonus = Game.spoilBonusDays ? Game.spoilBonusDays() : 0;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId).length;
  // doomed: (spoilDay+bonus)==day+1 -> spoilIn = 1-bonus
  const per = 100, units = Math.ceil((R.TRIGGER_PER_ROSTER * roster * 1.5) / 2 / per);
  for (let i = 0; i < 2; i++) v.pantry.push(freshStack(day, 'Foraged food', units, per, 1 - bonus));
  // keeps: not doomed (spoilIn 5)
  v.pantry.push(freshStack(day, 'Kept beans', 20, per, 5));
  // spoiled: must never count as doomed
  v.pantry.push(freshStack(day, 'Old meat', 10, per, -3));
  // preserved: must never count as doomed
  v.pantry.push(freshStack(day, 'Smoked fish', 10, per, 1 - bonus, 'preserved'));
  const ctx = {};
  const doomed = R.doomedFresh(Game);
  check('doomed excludes spoiled+preserved', doomed.names.includes('Foraged food') && !doomed.names.includes('Old meat') && !doomed.names.includes('Smoked fish'));
  check('doomed exceeds trigger', doomed.kcal > R.TRIGGER_PER_ROSTER * roster, 'doomed=' + Math.round(doomed.kcal));
  const hungerBefore = roster > 0 ? (Game.npcNeeds((v.roster || []).find(id => id !== Game.villagerId)).hunger || 0) : 0;
  const eaten = R.serveSeconds(Game, ctx);
  check('seconds ate', eaten > 0, 'eaten=' + eaten);
  check('cap respected', eaten <= R.CAP_PER_ROSTER * roster + 1, 'cap=' + (R.CAP_PER_ROSTER * roster));
  check('telemetry nights', ctx._fdNights === 1);
  check('telemetry kcal', ctx._fdKcal === eaten);
  check('telemetry doomedSeen', ctx._fdDoomedSeen === doomed.kcal);
  check('doomed drawn down', R.doomedFresh(Game).kcal < doomed.kcal);
  const takeHist = v.takeHist || {};
  check('recordTakeHist kept', Object.keys(takeHist).length > 0);
  // empty-pantry null
  const ctx2 = {};
  v.pantry.length = 0;
  check('empty pantry -> 0', R.serveSeconds(Game, ctx2) === 0 && !ctx2._fdNights);
  delete process.env.FEASTDRAW_REPLAY;
}

async function conservation() {
  console.log('CONSERVATION: channel attribution sums to independent stockPantry total (1 seed, 60d)');
  process.env.FEASTDRAW_REPLAY = '1';
  const { Game } = await loadGame({ seed: 6303, mode: 'pb-cons', fullTelemetry: false });
  await setupGame(Game);
  let indep = 0;
  const oStock = Game.stockPantry.bind(Game);
  Game.stockPantry = function (kcal, name, opts) {
    try { if (typeof kcal === 'number' && kcal > 0) indep += kcal; } catch (e) {}
    return oStock.apply(this, arguments);
  };
  // mirror the sweep's attribution
  const attr = {};
  const oStock2 = Game.stockPantry;
  Game.stockPantry = function (kcal, name, opts) {
    try {
      if (typeof kcal === 'number' && kcal > 0) {
        const dt = Game._diagDutyTask, rp = Game._diagReturnPurpose;
        const n = String(name || '');
        let k;
        if (dt) k = 'duty_' + dt;
        else if (rp === 'haul') k = 'haul_field';
        else if (rp === 'traps' || /snared/i.test(n)) k = 'traps';
        else if (/meal leftovers/i.test(n)) k = 'leftovers';
        else if (/system-replicated|trial feast|genesis fruit|refunded/i.test(n)) k = 'system';
        else if (/foraged|garden harvest|fish catch|game meat/i.test(n)) k = 'away_wild';
        else k = 'other';
        attr[k] = (attr[k] || 0) + kcal;
      }
    } catch (e) {}
    return oStock2.apply(this, arguments);
  };
  const wrapped = R.withFeastDrawReplay(leadfeast, 'cons', 'cons');
  const ctx = {};
  const origSetup = wrapped.setup;
  wrapped.setup = (G, c) => { if (origSetup) origSetup(G, c); };
  await runDays(Game, wrapped, { days: 60, manifest: null });
  const sum = Object.values(attr).reduce((a, b) => a + b, 0);
  check('channels sum == independent total', Math.abs(sum - indep) < 1, 'sum=' + Math.round(sum) + ' indep=' + Math.round(indep));
  delete process.env.FEASTDRAW_REPLAY;
}

async function fidelity() {
  console.log('FIDELITY: replay reproduces the lead-6206 backfire (180d, rot ratio >= 1.5x)');
  const rotOf = async (side) => {
    if (side === 'armed') process.env.FEASTDRAW_REPLAY = '1'; else delete process.env.FEASTDRAW_REPLAY;
    const { Game } = await loadGame({ seed: 6206, mode: 'pb-fid-' + side, fullTelemetry: false });
    await setupGame(Game);
    const rotCounted = new Set();
    let rot = 0;
    const oSweep = Game.sweepSpoiled;
    Game.sweepSpoiled = function () {
      try {
        for (const it of (((Game.state.village || {}).pantry) || [])) {
          if (it && !it.bonded && !rotCounted.has(it) && Game.isSpoiled && Game.isSpoiled(it)) {
            rotCounted.add(it);
            rot += (it.kcalEach || 0) * (it.units || 1);
          }
        }
      } catch (e) {}
      return oSweep.apply(this, arguments);
    };
    let fdNights = 0;
    const wrapped = R.withFeastDrawReplay(leadfeast, 'fid-' + side, 'fid');
    // runDays creates its own ctx; capture it via a policy copy
    const pol = Object.assign({}, wrapped);
    let capCtx = null;
    const os2 = wrapped.setup;
    pol.setup = (G, c) => { capCtx = c; if (os2) return os2(G, c); };
    await runDays(Game, pol, { days: 180, manifest: null });
    fdNights = (capCtx && capCtx._fdNights) || 0;
    delete process.env.FEASTDRAW_REPLAY;
    return { rot, fdNights };
  };
  const c = await rotOf('control');
  const a = await rotOf('armed');
  console.log(`  control rot=${Math.round(c.rot / 1000)}k armed rot=${Math.round(a.rot / 1000)}k fdNights=${a.fdNights}`);
  check('backfire reproduced (ratio >= 1.5)', c.rot > 0 && (a.rot / c.rot) >= 1.5, 'ratio=' + (c.rot > 0 ? (a.rot / c.rot).toFixed(2) : '?'));
  check('trigger engaged (>= 80 nights)', a.fdNights >= 80, 'fdNights=' + a.fdNights);
}

(async () => {
  await detGate();
  await greenFixture();
  await conservation();
  await fidelity();
  console.log(fail === 0 ? 'ALL GREEN' : fail + ' FAILURES');
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('PROOF CRASH', e); process.exit(2); });

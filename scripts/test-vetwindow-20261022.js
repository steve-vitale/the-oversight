#!/usr/bin/env node
// test-vetwindow-20261022.js — proof for scripts/policies/vetwindow.js
// (flesh-out loop, 2026-10-22, run fleshout-20261022T1215Z, arm
// sim-vetwindow, axis scale-onramp).
//
// RED->GREEN on the window-restraint design + det-gates + D2.
// Composition honesty is proved BEFORE any sweep; any gate failure =
// FAIL LOUDLY, no sweep.
//
// SUBSTRATE (pinned, the non-seat long substrate):
//   control   = VW.substrateFor(base) = AD.armedFor(base) (armorydrive
//               stack, ARMORYDRIVE=1, VETWINDOW unset)
//   vetwindow = VW.armedFor(base)     (withVetWindow OUTSIDE the same
//               stack, VETWINDOW=1)
// Env (asserted up front): FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1
//   WINDEFER=1 SEATDRIVE=0 KILLDISC=1. ARMORYDRIVE=1 always (the stack
//   needs it); VETWINDOW toggled per gate.
//
// Gates:
//   E0 module shape (exports, normBase, vwOn, substrateFor/armedFor id tags).
//   E1 DET: VETWINDOW unset -> armedFor trajectories byte-identical to
//      substrateFor (2 seeds x 60d) — "VETWINDOW-off reproduces control".
//   E2 env-gate: vwOn reads VETWINDOW exactly.
//   E3 synthetic RED->GREEN on the wrapper logic (fake base policy, real
//      Game reads):
//      E3a window-live fixtures (filled+shut=live; unfilled / open /
//          read-error = not live);
//      E3b vwFightWave reads max living monster wave (4 / 2 / 0 / fled
//          ignored);
//      E3c restraint FIRES on a wave-4 fight (barrier push, base NOT
//          called, turn spent);
//      E3d wave-3 fight DELEGATES (base called, no flee);
//      E3e gate off = zero counters, base called on wave-4.
//   E4 180d VETWINDOW=1 run completes on the real stack + deterministic
//      re-run (D2), KILLDISC v2 installed (the sweep's exact config).
//   E5 mechanism smoke: report the restraint counters from E4 (window
//      days, restrained fights, flees) — the smoke is completion +
//      honest counters, not a firing bar (the window may not go live on
//      the test seeds).
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//        KILLDISC=1 ARMORYDRIVE=1 VETWINDOW=1 node scripts/test-vetwindow-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
if (!fs.existsSync(path.join(REPO, 'scripts', 'policies', 'vetwindow.js'))) {
  console.error('RED: scripts/policies/vetwindow.js missing.');
  process.exit(1);
}

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`GATE STOP: ${k}=1 required (non-seat substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('GATE STOP: SEATDRIVE=0 required (non-seat substrate).'); process.exit(2); }
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'VGEARBEATS', 'TWOVETS', 'VGEAR', 'WAVE4ENGAGE']) {
  if (k in process.env) { console.error(`GATE STOP: ${k} must be unset (pinned substrate, nothing else).`); process.exit(2); }
}
if (process.env.ARMORYDRIVE !== '1') { console.error('GATE STOP: ARMORYDRIVE=1 required (the stack needs it).'); process.exit(2); }

const VW = require('./policies/vetwindow');
const AD = require('./policies/armorydrive');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const KD = require('./killdisc-instrument-20261021');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS', name); }
  else { fail++; console.log('FAIL', name, extra === undefined ? '' : String(extra).slice(0, 400)); }
}
function setVW(on) { if (on) process.env.VETWINDOW = '1'; else delete process.env.VETWINDOW; }

// Fake base policy: records delegation, never touches the engine.
function fakeBase() {
  return {
    id: 'fake-base', desc: 'test double',
    fight(Game, ctx) { ctx.baseFightCalled = (ctx.baseFightCalled || 0) + 1; return 'base-fight'; },
    daily(Game, ctx) { ctx.baseDailyCalled = (ctx.baseDailyCalled || 0) + 1; },
  };
}
function windowStubs(Game, veterans, uw) {
  Game.waveCombatReadiness = (w) => w === 5
    ? { veterans, demand: { veterans: 2 }, short: veterans >= 2 ? [] : ['veterans'] }
    : { veterans: 0, demand: {}, short: [] };
  Game.unlockedWave = () => uw;
}
function fakeFight(Game, mid, wave) {
  void wave;
  Game.tbfight = { over: false, fighters: [
    { kind: 'monster', hp: 1000, maxHp: 1000, monsterId: mid, fled: false },
  ] };
  Game.tbIsPlayerTurn = () => true;
  const rec = { exited: null, moved: null, ended: false };
  const p = { mx: 0, my: 4, moveLeft: 3, acted: false, hp: 100, maxHp: 100 };
  Game.tbFighter = (k) => (k === 'p' ? p : null);
  Game.map = { px: 5, py: 5 };
  Game.tbBarrierExit = (dx, dy) => { rec.exited = [dx, dy]; };
  Game.tbPlayerMove = (x, y) => { rec.moved = [x, y]; };
  Game.tbAfterPlayerAction = () => { rec.ended = true; };
  return rec;
}
async function realGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'vetwindow-test', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}

async function trajectory(seed, vwFlag, policyObj, days) {
  setVW(vwFlag);
  const { Game } = await loadGame({ seed, mode: 'vetwindow-det', fullTelemetry: false });
  const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
  const uninstall = KD.install(Game, t);
  await setupGame(Game);
  const hs = [];
  const oDaily = policyObj.daily;
  const policy = Object.assign({}, policyObj, {
    daily(G, ctx) {
      if (oDaily) { try { oDaily(G, ctx); } catch (e) {} }
      try { hs.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {}
    },
  });
  await quietLog(async () => { await runDays(Game, policy, { days: days || 60, sampleEvery: 30 }); });
  if (uninstall) { try { uninstall(); } catch (e) {} }
  if (t.instrumentErrors.length) throw new Error('instrument errors: ' + t.instrumentErrors.join('; '));
  setVW(true);
  return { traj: hs.join('|'), days: hs.length };
}

(async () => {
  // E0: shape.
  check('E0a: exports', ['vwOn', 'vwWindowLive', 'vwFightWave', 'vwFlee',
    'withVetWindow', 'normBase', 'substrateFor', 'armedFor']
    .every(k => typeof VW[k] === 'function'));
  check('E0b: normBase', VW.normBase('lead') === 'leadfeast' && VW.normBase('belongfeast') === 'belongfeast');
  check('E0c: armedFor id tag', String(VW.armedFor('leadfeast').id || '').indexOf('vetwindow') >= 0);
  check('E0d: substrateFor is the armorydrive stack (same id tag, not the vetwindow wrapper)',
    VW.substrateFor('leadfeast').id === AD.armedFor('leadfeast').id &&
    VW.substrateFor('belongfeast').id === AD.armedFor('belongfeast').id &&
    String(VW.substrateFor('leadfeast').id).indexOf('vetwindow') < 0);
  check('E0e: vwOn reads VETWINDOW', (() => { setVW(false); const a = VW.vwOn(); setVW(true); const b = VW.vwOn(); return a === false && b === true; })());

  // E1: VETWINDOW-off vetwindow == control byte-identical (60d x2).
  setVW(true); // ensure the gate starts on for the E0e restore
  const e1a1 = await trajectory(65411, false, VW.armedFor('leadfeast'), 60);
  const e1a2 = await trajectory(65411, false, VW.substrateFor('leadfeast'), 60);
  check('E1a: VETWINDOW-off vetwindow(leadfeast) == control byte-identical (s65411 60d)',
    e1a1.traj === e1a2.traj && e1a1.traj.length > 0, 'len ' + e1a1.traj.length + ' vs ' + e1a2.traj.length);
  const e1b1 = await trajectory(65412, false, VW.armedFor('belongfeast'), 60);
  const e1b2 = await trajectory(65412, false, VW.substrateFor('belongfeast'), 60);
  check('E1b: VETWINDOW-off vetwindow(belongfeast) == control byte-identical (s65412 60d)',
    e1b1.traj === e1b2.traj && e1b1.traj.length > 0);

  // E3: synthetic wrapper logic.
  setVW(true);
  {
    const G = await realGame(65413);
    windowStubs(G, 2, 4);
    check('E3a1: window live when bar filled + door shut', VW.vwWindowLive(G) === true);
    windowStubs(G, 1, 4);
    check('E3a2: window NOT live when bar unfilled', VW.vwWindowLive(G) === false);
    windowStubs(G, 2, 5);
    check('E3a3: window NOT live when door open', VW.vwWindowLive(G) === false);
    G.waveCombatReadiness = () => { throw new Error('boom'); };
    G.unlockedWave = () => 4;
    check('E3a4: window NOT live on read error (fail closed)', VW.vwWindowLive(G) === false);
  }
  {
    const G = await realGame(65414);
    fakeFight(G, 'strike', 4); // wave-4 monster
    check('E3b1: vwFightWave=4 on wave-4 fight', VW.vwFightWave(G) === 4);
    fakeFight(G, 'redactor', 3); // wave-3 monster
    check('E3b2: vwFightWave=3 on wave-3 fight', VW.vwFightWave(G) === 3);
    G.tbfight.fighters[0].fled = true;
    check('E3b3: fled monster ignored', VW.vwFightWave(G) === 0);
    G.tbfight = null;
    check('E3b4: no fight -> 0', VW.vwFightWave(G) === 0);
  }
  {
    // E3c: restraint FIRES on a wave-4 fight (window live).
    const G = await realGame(65415);
    windowStubs(G, 2, 4);
    const rec = fakeFight(G, 'strike', 4);
    const ctx = {};
    const P = VW.withVetWindow(fakeBase(), 't', 't');
    const r = P.fight(G, ctx);
    check('E3c1: restraint fires (barrier push, turn spent)',
      r === true && rec.exited !== null && rec.ended === true,
      'exited=' + JSON.stringify(rec.exited) + ' ended=' + rec.ended);
    check('E3c2: base NOT called under restraint', !ctx.baseFightCalled);
    check('E3c3: restraint counter', (ctx.vwRestrainedFights | 0) === 1 && (ctx.vwFlees | 0) === 1);
  }
  {
    // E3d: wave-3 fight DELEGATES (window live but wave < 4).
    const G = await realGame(65416);
    windowStubs(G, 2, 4);
    fakeFight(G, 'redactor', 3);
    const ctx = {};
    const P = VW.withVetWindow(fakeBase(), 't', 't');
    const r = P.fight(G, ctx);
    check('E3d1: wave-3 delegates to base', r === 'base-fight' && (ctx.baseFightCalled | 0) === 1);
    check('E3d2: no restraint counters on wave-3', !(ctx.vwRestrainedFights | 0) && !(ctx.vwFlees | 0));
  }
  {
    // E3e: gate off = zero counters, base called even on wave-4.
    setVW(false);
    const G = await realGame(65417);
    windowStubs(G, 2, 4);
    fakeFight(G, 'strike', 4);
    const ctx = {};
    const P = VW.withVetWindow(fakeBase(), 't', 't');
    const r = P.fight(G, ctx);
    check('E3e1: gate off delegates wave-4 to base', r === 'base-fight' && (ctx.baseFightCalled | 0) === 1);
    check('E3e2: gate off = zero restraint counters', ctx.vwRestrainedFights === undefined && ctx.vwFlees === undefined);
    const ctx2 = {};
    P.daily(G, ctx2);
    check('E3e3: gate off daily delegates, no window counter', (ctx2.baseDailyCalled | 0) === 1 && ctx2.vwWindowDays === undefined);
    setVW(true);
  }
  {
    // E3f: daily counts window days when live.
    const G = await realGame(65418);
    windowStubs(G, 2, 4);
    const ctx = {};
    const P = VW.withVetWindow(fakeBase(), 't', 't');
    P.daily(G, ctx);
    check('E3f: daily counts a live window day', (ctx.vwWindowDays | 0) === 1 && (ctx.baseDailyCalled | 0) === 1);
  }

  // E4: 180d VETWINDOW=1 run completes + D2.
  setVW(true);
  async function longRun(seed) {
    const { Game } = await loadGame({ seed, mode: 'vetwindow-e4', fullTelemetry: false });
    const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
    const uninstall = KD.install(Game, t);
    await setupGame(Game);
    const policy = VW.armedFor('leadfeast');
    let lastCtx = null;
    const wrapped = Object.assign({}, policy, {
      daily(G, ctx) { lastCtx = ctx; return policy.daily(G, ctx); },
    });
    let result;
    await quietLog(async () => { result = await runDays(Game, wrapped, { days: 180, manifest: undefined, sampleEvery: 30 }); });
    if (uninstall) { try { uninstall(); } catch (e) {} }
    return { days: result.days, endReason: result.endReason,
      vwWindowDays: (lastCtx && lastCtx.vwWindowDays) | 0,
      vwRestrainedFights: (lastCtx && lastCtx.vwRestrainedFights) | 0,
      vwFlees: (lastCtx && lastCtx.vwFlees) | 0,
      vwFleeFallback: (lastCtx && lastCtx.vwFleeFallback) | 0 };
  }
  const e4a = await longRun(65419);
  check('E4a: 180d VETWINDOW=1 run completes', e4a.days > 0, JSON.stringify(e4a));
  const e4b = await longRun(65419);
  check('E4b: D2 deterministic re-run (counters identical)',
    e4a.days === e4b.days && e4a.endReason === e4b.endReason &&
    e4a.vwWindowDays === e4b.vwWindowDays && e4a.vwRestrainedFights === e4b.vwRestrainedFights &&
    e4a.vwFlees === e4b.vwFlees,
    JSON.stringify({ a: e4a, b: e4b }));

  // E5: mechanism smoke — honest counters from the E4 run.
  console.log('E5 smoke counters (s65419 180d VETWINDOW=1):', JSON.stringify({
    windowDays: e4a.vwWindowDays, restrainedFights: e4a.vwRestrainedFights,
    flees: e4a.vwFlees, fleeFallback: e4a.vwFleeFallback,
  }));
  check('E5: run completed with counters reported', e4a.days > 0);

  console.log(`\nPROOF ${fail === 0 ? 'GREEN' : 'RED'}: ${pass} PASS, ${fail} FAIL`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('PROOF CRASH:', e && e.stack || e); process.exit(1); });

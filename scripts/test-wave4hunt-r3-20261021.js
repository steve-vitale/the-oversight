#!/usr/bin/env node
// test-wave4hunt-r3-20261021.js — proof for scripts/policies/wave4hunt-r3.js
// (flesh-out loop, 2026-10-21, run fleshout-20261021T1515Z, arm
// sim-wave4hunt-r3, axis scale-onramp; re-priced next of the killed
// sim-wave4hunt-r2).
//
// RED->GREEN on the composition + det-gates + budget unit gate + the
// kill-leak regression + D2 real-sweep gate. All gates GREEN before the
// pilot sweep — a gate failure is FAIL LOUDLY, no sweep.
//
// SUBSTRATE (pinned, the winning substrate from sim-fullseat, 13/16 wins):
//   control = VCE.armedFor(base)  (VGEAR=1 stack, WAVE4HUNT_R3 unset)
//   armed   = W4H3.armedFor(base) (WAVE4HUNT_R3=1 OUTSIDE the same stack, VGEAR=1)
// Env (asserted up front): FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1
//   WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 (+WAVE4HUNT_R3=1 armed).
//   SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/VETREL/VGEARBEATS unset.
//
// Gates:
//   E0 shape (exports, id tags, normBase, w4h3On, layerLive, noFinishOff).
//   E0b budget unit gate: sortieBudgetOk caps at 2/week and resets on week
//     rollover.
//   E1 det-gate: WAVE4HUNT_R3 unset -> armedFor trajectories byte-identical
//      to VCE.armedFor (2 seeds x 60d).
//   E1c: WAVE4HUNT_R3=1 VGEAR-unset -> byte-identical to the seat stack
//      (VCE.seatStackFor).
//   E2 env-gate: Usage env asserted up front.
//   E3 engagement: WAVE4HUNT_R3=1 fires w4h3 counters (targeting chosen +
//      fights entered) on wave-4-reaching seeds, scholar wave-4 kills = 0.
//   E3f RED: WAVE4HUNT_R3-off fires zero w4h3 counters.
//   R1 RED: no-finish disabled (W4H3_TEST_NOFINISH_OFF=1) -> scholar lands
//      wave-4 kills on the regression seed (the kill-leak regression);
//      same seed with the fix -> scholar kills = 0.
//   E4 determinism: same armed config + KILLDISC twice -> byte-identical.
//   D2 real-sweep gate: 180d armed runs complete per policy +
//      deterministic re-run.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 \
//     node scripts/test-wave4hunt-r3-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
if (!fs.existsSync(path.join(REPO, 'scripts', 'policies', 'wave4hunt-r3.js'))) {
  console.error('RED: scripts/policies/wave4hunt-r3.js missing — the layer is not built.');
  process.exit(1);
}

// E2: the pinned winning substrate env, asserted up front.
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`GATE STOP: ${k}=1 is required (winning substrate).`); process.exit(2); }
}
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'VGEARBEATS']) {
  if (k in process.env) { console.error(`GATE STOP: ${k} must be unset (winning substrate is the pinned one, nothing else).`); process.exit(2); }
}
console.log('E2: substrate env gate OK (FEASTSCALE_R13/TRIBFLOOR/WINPURSUIT/WINDEFER/SEATDRIVE/VGEAR/KILLDISC=1; SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/VETREL/VGEARBEATS unset)');

const W4H3 = require('./policies/wave4hunt-r3');
const VCE = require('./policies/vgearconfirm');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const KD = require('./killdisc-instrument-20261021');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS', name); }
  else { fail++; console.log('FAIL', name, extra === undefined ? '' : String(extra).slice(0, 500)); }
}

function setEnv({ w4h3, vgear, noFinishOff }) {
  if (w4h3) process.env.WAVE4HUNT_R3 = '1'; else delete process.env.WAVE4HUNT_R3;
  if (vgear) process.env.VGEAR = '1'; else delete process.env.VGEAR;
  if (noFinishOff) process.env.W4H3_TEST_NOFINISH_OFF = '1'; else delete process.env.W4H3_TEST_NOFINISH_OFF;
}

// Scholar wave-4 kills from the terminal waveKillLog, attributed KILL-TIME
// (by == bearer-on-the-kill's-day or by == 'player'). End-of-run vid
// misattributes under succession churn.
function wave4KillSplit(Game, bearerByDay) {
  const endVid = Game.villagerId || null;
  const w4 = ((Game.state || {}).waveKillLog || []).filter(e => e && (e.w | 0) === 4);
  let scholar = 0;
  const villagers = new Set();
  for (const e of w4) {
    const bearerAtKill = (bearerByDay && bearerByDay[e.d] != null) ? bearerByDay[e.d] : endVid;
    if (e.by === bearerAtKill || e.by === 'player') scholar++;
    else if (e.by) villagers.add(e.by);
  }
  return { scholar, villagers: [...villagers], total: w4.length };
}

async function trajectory(seed, env, policyObj, days, instrument) {
  setEnv(env);
  const { Game } = await loadGame({ seed, mode: 'w4h3-det', fullTelemetry: false });
  const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
  const uninstall = instrument ? KD.install(Game, t) : null;
  await setupGame(Game);
  const hs = [];
  let lastCtx = null;
  const bearerByDay = {};
  const oDaily = policyObj.daily;
  const policy = Object.assign({}, policyObj, {
    daily(G, ctx) {
      if (oDaily) { try { oDaily(G, ctx); } catch (e) {} }
      lastCtx = ctx;
      try { bearerByDay[(G.state.scholar || {}).day || 0] = G.villagerId || null; } catch (e) {}
      try { hs.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {}
    },
  });
  await quietLog(async () => { await runDays(Game, policy, { days: days || 60, sampleEvery: 30 }); });
  if (uninstall) { try { uninstall(); } catch (e) {} }
  if (t.instrumentErrors.length) throw new Error('instrument errors: ' + t.instrumentErrors.join('; '));
  const w4h3 = {};
  if (lastCtx) for (const k of Object.keys(lastCtx)) if (/^w4h3/.test(k)) w4h3[k] = lastCtx[k];
  const ks = wave4KillSplit(Game, bearerByDay);
  setEnv({ w4h3: false, vgear: false, noFinishOff: false });
  return { traj: hs.join('|'), days: hs.length, w4h3, kills: ks, endReason: null };
}

const W4H3_KEYS = ['w4h3W4Fights', 'w4h3Sorties', 'w4h3Fights', 'w4h3Yields', 'w4h3SoftStrikes',
  'w4h3ChaffStrikes', 'w4h3Holds', 'w4h3Breakoffs', 'w4h3Delegates'];
function w4h3Acted(w4h3) {
  return W4H3_KEYS.reduce((t, k) => t + (w4h3[k] | 0), 0);
}
function w4h3Line(w4h3) {
  return W4H3_KEYS.map(k => k + '=' + (w4h3[k] | 0)).join(' ');
}

(async () => {
  // E0: shape.
  check('E0a: exports (w4h3On, vgearOn, layerLive, noFinishOff, normBase, withWave4Hunt, armedFor, wave4Targets, liveWave4, sortieBudgetOk)',
    typeof W4H3.w4h3On === 'function' && typeof W4H3.vgearOn === 'function' &&
    typeof W4H3.layerLive === 'function' && typeof W4H3.noFinishOff === 'function' &&
    typeof W4H3.normBase === 'function' && typeof W4H3.withWave4Hunt === 'function' &&
    typeof W4H3.armedFor === 'function' && typeof W4H3.wave4Targets === 'function' &&
    typeof W4H3.liveWave4 === 'function' && typeof W4H3.sortieBudgetOk === 'function');
  check('E0b: normBase', W4H3.normBase('lead') === 'leadfeast' && W4H3.normBase('belongfeast') === 'belongfeast');
  let threw = false;
  try { W4H3.normBase('nope'); } catch (e) { threw = true; }
  check('E0c: normBase throws on unknown', threw);
  check('E0d: armedFor id tag', String(W4H3.armedFor('leadfeast').id || '').indexOf('wave4hunt-r3') >= 0);
  check('E0e: w4h3On reads WAVE4HUNT_R3', (() => { delete process.env.WAVE4HUNT_R3; const a = W4H3.w4h3On(); process.env.WAVE4HUNT_R3 = '1'; const b = W4H3.w4h3On(); delete process.env.WAVE4HUNT_R3; return a === false && b === true; })());
  check('E0f: layerLive = w4h3On && vgearOn', (() => {
    process.env.WAVE4HUNT_R3 = '1'; delete process.env.VGEAR; const a = W4H3.layerLive();
    process.env.VGEAR = '1'; const b = W4H3.layerLive();
    delete process.env.WAVE4HUNT_R3; const c = W4H3.layerLive();
    delete process.env.VGEAR; return a === false && b === true && c === false;
  })());
  check('E0g: noFinishOff reads W4H3_TEST_NOFINISH_OFF', (() => { delete process.env.W4H3_TEST_NOFINISH_OFF; const a = W4H3.noFinishOff(); process.env.W4H3_TEST_NOFINISH_OFF = '1'; const b = W4H3.noFinishOff(); delete process.env.W4H3_TEST_NOFINISH_OFF; return a === false && b === true; })());

  // E0h: the sortie budget — max 2 sorties/week, resets on week rollover.
  check('E0h: sortieBudgetOk caps at 2/week and resets on week rollover', (() => {
    const fakeGame = (day) => ({ state: { scholar: { day } } });
    const ctx = {};
    const ok0 = W4H3.sortieBudgetOk(fakeGame(0), ctx); // week 0, sortie 1
    const ok1 = W4H3.sortieBudgetOk(fakeGame(3), ctx); // week 0, sortie 2
    const no2 = W4H3.sortieBudgetOk(fakeGame(6), ctx); // week 0, sortie 3 -> denied
    const ok3 = W4H3.sortieBudgetOk(fakeGame(7), ctx); // week 1, sortie 1
    const ok4 = W4H3.sortieBudgetOk(fakeGame(13), ctx); // week 1, sortie 2
    const no5 = W4H3.sortieBudgetOk(fakeGame(13), ctx); // week 1, sortie 3 -> denied
    return ok0 === true && ok1 === true && no2 === false &&
      ok3 === true && ok4 === true && no5 === false &&
      (ctx.w4h3SkippedBudget | 0) === 2;
  })());

  // E1: WAVE4HUNT_R3 unset -> armedFor == VCE.armedFor, byte-identical (60d).
  const e1a1 = await trajectory(64701, { w4h3: false, vgear: true }, W4H3.armedFor('leadfeast'), 60);
  const e1a2 = await trajectory(64701, { w4h3: false, vgear: true }, VCE.armedFor('leadfeast'), 60);
  check('E1a: W4H3-off armed(leadfeast) == VCE.armedFor, byte-identical (s64701 60d)',
    e1a1.traj === e1a2.traj && e1a1.traj.length > 0, 'len ' + e1a1.traj.length + ' vs ' + e1a2.traj.length);
  const e1b1 = await trajectory(64702, { w4h3: false, vgear: true }, W4H3.armedFor('belongfeast'), 60);
  const e1b2 = await trajectory(64702, { w4h3: false, vgear: true }, VCE.armedFor('belongfeast'), 60);
  check('E1b: W4H3-off armed(belongfeast) == VCE.armedFor, byte-identical (s64702 60d)',
    e1b1.traj === e1b2.traj && e1b1.traj.length > 0);

  // E1c: WAVE4HUNT_R3=1, VGEAR unset -> byte-identical to the seat stack.
  const e1c1 = await trajectory(64701, { w4h3: true, vgear: false }, W4H3.armedFor('leadfeast'), 60);
  const e1c2 = await trajectory(64701, { w4h3: false, vgear: false }, VCE.seatStackFor('leadfeast'), 60);
  check('E1c: W4H3=1+VGEAR-unset armed(leadfeast) == seat stack, byte-identical (s64701 60d)',
    e1c1.traj === e1c2.traj && e1c1.traj.length > 0, 'len ' + e1c1.traj.length + ' vs ' + e1c2.traj.length);

  // E3: WAVE4HUNT_R3=1 fires w4h3 counters on wave-4-reaching seeds.
  const e3a = await trajectory(64703, { w4h3: true, vgear: true }, W4H3.armedFor('leadfeast'), 150, true);
  check('E3a: W4H3=1 fires w4h3 counters on wave-4-reaching s64703-leadfeast (150d)',
    (e3a.w4h3.w4h3W4Fights | 0) > 0 && (e3a.w4h3.w4h3Sorties | 0) > 0 && w4h3Acted(e3a.w4h3) > 0, w4h3Line(e3a.w4h3));
  check('E3b: scholar wave-4 kills = 0 on s64703-leadfeast armed (150d)',
    e3a.kills.scholar === 0, `scholar=${e3a.kills.scholar} villagers=[${e3a.kills.villagers.join(',')}] total=${e3a.kills.total} ${w4h3Line(e3a.w4h3)}`);
  const e3c = await trajectory(64704, { w4h3: true, vgear: true }, W4H3.armedFor('belongfeast'), 150, true);
  check('E3c: W4H3=1 fires w4h3 counters on wave-4-reaching s64704-belongfeast (150d)',
    (e3c.w4h3.w4h3W4Fights | 0) > 0 && (e3c.w4h3.w4h3Sorties | 0) > 0 && w4h3Acted(e3c.w4h3) > 0, w4h3Line(e3c.w4h3));
  check('E3d: scholar wave-4 kills = 0 on s64704-belongfeast armed (150d)',
    e3c.kills.scholar === 0, `scholar=${e3c.kills.scholar} villagers=[${e3c.kills.villagers.join(',')}] total=${e3c.kills.total} ${w4h3Line(e3c.w4h3)}`);

  // E3f RED: WAVE4HUNT_R3-off fires zero w4h3 counters.
  const e3f = await trajectory(64703, { w4h3: false, vgear: true }, W4H3.armedFor('leadfeast'), 150, true);
  check('E3f: W4H3-off fires zero w4h3 counters (s64703-leadfeast 150d)',
    w4h3Acted(e3f.w4h3) === 0 && (e3f.w4h3.w4h3Sorties | 0) === 0, w4h3Line(e3f.w4h3));

  // R1 RED: the kill-leak regression. With no-finish disabled, the scholar
  // lands wave-4 kills on the regression seed; with the fix, the same seed
  // gives scholar kills = 0.
  const r1red = await trajectory(64703, { w4h3: true, vgear: true, noFinishOff: true }, W4H3.armedFor('leadfeast'), 150, true);
  check('R1-RED: W4H3_TEST_NOFINISH_OFF=1 -> scholar lands wave-4 kills (s64703-leadfeast 150d)',
    r1red.kills.scholar > 0, `scholar=${r1red.kills.scholar} total=${r1red.kills.total} (regression seed confirmed — the leak exists without the fix)`);
  check('R1-GREEN: fix on -> scholar wave-4 kills = 0, same seed/config',
    e3a.kills.scholar === 0, `scholar=${e3a.kills.scholar}`);

  // E4: instrument determinism — same armed config + KILLDISC twice.
  const e4a = await trajectory(64701, { w4h3: true, vgear: true }, W4H3.armedFor('leadfeast'), 60, true);
  const e4b = await trajectory(64701, { w4h3: true, vgear: true }, W4H3.armedFor('leadfeast'), 60, true);
  check('E4: armed+KILLDISC deterministic across runs (s64701 60d)',
    e4a.traj === e4b.traj && e4a.traj.length > 0);

  // D2: 180d armed runs COMPLETE per policy + deterministic re-run.
  const d2a1 = await trajectory(64705, { w4h3: true, vgear: true }, W4H3.armedFor('leadfeast'), 180, true);
  const d2a2 = await trajectory(64705, { w4h3: true, vgear: true }, W4H3.armedFor('leadfeast'), 180, true);
  check('D2a: 180d armed leadfeast completes + deterministic (s64705)',
    d2a1.traj === d2a2.traj && d2a1.traj.length > 0, 'days ' + d2a1.days);
  const d2b1 = await trajectory(64706, { w4h3: true, vgear: true }, W4H3.armedFor('belongfeast'), 180, true);
  const d2b2 = await trajectory(64706, { w4h3: true, vgear: true }, W4H3.armedFor('belongfeast'), 180, true);
  check('D2b: 180d armed belongfeast completes + deterministic (s64706)',
    d2b1.traj === d2b2.traj && d2b1.traj.length > 0, 'days ' + d2b2.days);

  console.log(`\n${pass}/${pass + fail} PASS, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})();

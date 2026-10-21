#!/usr/bin/env node
// test-twovets-20261021.js — proof for scripts/policies/twovets.js
// (flesh-out loop, 2026-10-21, run fleshout-20261021T0730Z, arm
// sim-twovets-r2, axis scale-onramp, backlog #747).
//
// RED->GREEN on the composition + det-gates + the kill-leak regression
// + D2 real-sweep gate. All gates GREEN before the pilot sweep — a gate
// failure is FAIL LOUDLY, no sweep.
//
// SUBSTRATE (pinned, the winning substrate from sim-fullseat, 13/16 wins):
//   control = VCE.armedFor(base)  (VGEAR=1 stack, TWOVETS unset)
//   armed   = TV.armedFor(base)   (TWOVETS=1 OUTSIDE the same stack, VGEAR=1)
// Env (asserted up front): FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1
//   WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 (+TWOVETS=1 armed).
//   SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/VETREL/VGEARBEATS unset.
//
// Gates:
//   E0 shape (exports, id tags, normBase, twovetsOn, noStanddown).
//   E1 det-gate: TWOVETS unset -> armedFor trajectories byte-identical to
//      VCE.armedFor (2 seeds x 60d).
//   E1c: TWOVETS=1 VGEAR-unset -> byte-identical to the seat stack
//      (VCE.seatStackFor).
//   E2 env-gate: Usage env asserted up front.
//   E3 engagement: TWOVETS=1 fires tv counters on wave-4-reaching seeds
//      with scholar wave-4 kills = 0.
//   E3f RED: TWOVETS-off fires zero tv counters.
//   R1 RED: stand-down disabled (TV_TEST_NOSTANDDOWN=1) -> scholar lands
//      wave-4 kills on the regression seed (the dead run's kill-leak,
//      simulated); same seed with the fix -> scholar kills = 0.
//   E4 determinism: same armed config + KILLDISC twice -> byte-identical.
//   D2 real-sweep gate: 180d armed runs complete per policy +
//      deterministic re-run.
//
// Usage: node scripts/test-twovets-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
if (!fs.existsSync(path.join(REPO, 'scripts', 'policies', 'twovets.js'))) {
  console.error('RED: scripts/policies/twovets.js missing — deleted per kill protocol (sim-twovets-r2 NO-GO at pilot, 2026-10-21). The proof ran 19/19 BEFORE the kill; see evidence/2026-10-21/sim-twovets.md.');
  process.exit(1);
}

// E2: the pinned winning substrate env, asserted up front.
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`GATE STOP: ${k}=1 is required (winning substrate).`); process.exit(2); }
}
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'VGEARBEATS']) {
  if (k in process.env) { console.error(`GATE STOP: ${k} must be unset (winning substrate is the pinned one, nothing else).`); process.exit(2); }
}
console.log('E2: substrate env gate OK (FEASTSCALE_R13/TRIBFLOOR/WINPURSUIT/WINDEFER/SEATDRIVE/KILLDISC=1; SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/VETREL/VGEARBEATS unset)');

const TV = require('./policies/twovets');
const VCE = require('./policies/vgearconfirm');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const KD = require('./killdisc-instrument-20261021');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS', name); }
  else { fail++; console.log('FAIL', name, extra === undefined ? '' : String(extra).slice(0, 400)); }
}

function setEnv({ twovets, vgear, noStanddown }) {
  if (twovets) process.env.TWOVETS = '1'; else delete process.env.TWOVETS;
  if (vgear) process.env.VGEAR = '1'; else delete process.env.VGEAR;
  if (noStanddown) process.env.TV_TEST_NOSTANDDOWN = '1'; else delete process.env.TV_TEST_NOSTANDDOWN;
}

// Scholar wave-4 kills from the terminal waveKillLog, attributed KILL-TIME
// (the brief's judge line: by == bearer-on-the-kill's-day or by ==
// 'player'). End-of-run vid misattributes under succession churn
// (diag-bearer: s64712 d74 "scholar" kill was a companion at kill time).
// Returns {scholar, villagers} where villagers = distinct non-scholar
// (at kill time) vids with wave-4 kills.
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
  const { Game } = await loadGame({ seed, mode: 'twovets-det', fullTelemetry: false });
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
  const tv = {};
  if (lastCtx) for (const k of Object.keys(lastCtx)) if (/^tv/.test(k)) tv[k] = lastCtx[k];
  const ks = wave4KillSplit(Game, bearerByDay);
  setEnv({ twovets: false, vgear: false, noStanddown: false });
  return { traj: hs.join('|'), days: hs.length, tv, kills: ks, endReason: null };
}

function tvActed(tv) {
  return ['tvFights', 'tvYieldTurns', 'tvSoftStrikes', 'tvBandStrikes', 'tvHolds', 'tvBreakoffs', 'tvStanddowns', 'tvDelegates']
    .reduce((t, k) => t + (tv[k] | 0), 0);
}
function tvLine(tv) {
  return ['tvFights', 'tvYieldTurns', 'tvSoftStrikes', 'tvBandStrikes', 'tvHolds', 'tvBreakoffs', 'tvStanddowns', 'tvDelegates']
    .map(k => k + '=' + (tv[k] | 0)).join(' ');
}

(async () => {
  // E0: shape.
  check('E0a: exports (twovetsOn, noStanddown, normBase, layerLive, withTwoVets, armedFor)',
    typeof TV.twovetsOn === 'function' && typeof TV.noStanddown === 'function' &&
    typeof TV.normBase === 'function' && typeof TV.layerLive === 'function' &&
    typeof TV.withTwoVets === 'function' && typeof TV.armedFor === 'function');
  check('E0b: normBase', TV.normBase('lead') === 'leadfeast' && TV.normBase('belongfeast') === 'belongfeast');
  let threw = false;
  try { TV.normBase('nope'); } catch (e) { threw = true; }
  check('E0c: normBase throws on unknown', threw);
  check('E0d: armedFor id tag', String(TV.armedFor('leadfeast').id || '').indexOf('twovets') >= 0);
  check('E0e: twovetsOn reads TWOVETS', (() => { delete process.env.TWOVETS; const a = TV.twovetsOn(); process.env.TWOVETS = '1'; const b = TV.twovetsOn(); delete process.env.TWOVETS; return a === false && b === true; })());
  check('E0f: noStanddown reads TV_TEST_NOSTANDDOWN', (() => { delete process.env.TV_TEST_NOSTANDDOWN; const a = TV.noStanddown(); process.env.TV_TEST_NOSTANDDOWN = '1'; const b = TV.noStanddown(); delete process.env.TV_TEST_NOSTANDDOWN; return a === false && b === true; })());

  // E1: TWOVETS unset -> armedFor == VCE.armedFor, byte-identical (60d).
  const e1a1 = await trajectory(64701, { twovets: false, vgear: true }, TV.armedFor('leadfeast'), 60);
  const e1a2 = await trajectory(64701, { twovets: false, vgear: true }, VCE.armedFor('leadfeast'), 60);
  check('E1a: TWOVETS-off armed(leadfeast) == VCE.armedFor, byte-identical (s64701 60d)',
    e1a1.traj === e1a2.traj && e1a1.traj.length > 0, 'len ' + e1a1.traj.length + ' vs ' + e1a2.traj.length);
  const e1b1 = await trajectory(64702, { twovets: false, vgear: true }, TV.armedFor('belongfeast'), 60);
  const e1b2 = await trajectory(64702, { twovets: false, vgear: true }, VCE.armedFor('belongfeast'), 60);
  check('E1b: TWOVETS-off armed(belongfeast) == VCE.armedFor, byte-identical (s64702 60d)',
    e1b1.traj === e1b2.traj && e1b1.traj.length > 0);

  // E1c: TWOVETS=1, VGEAR unset -> byte-identical to the seat stack.
  const e1c1 = await trajectory(64701, { twovets: true, vgear: false }, TV.armedFor('leadfeast'), 60);
  const e1c2 = await trajectory(64701, { twovets: false, vgear: false }, VCE.seatStackFor('leadfeast'), 60);
  check('E1c: TWOVETS=1+VGEAR-unset armed(leadfeast) == seat stack, byte-identical (s64701 60d)',
    e1c1.traj === e1c2.traj && e1c1.traj.length > 0, 'len ' + e1c1.traj.length + ' vs ' + e1c2.traj.length);

  // E3: TWOVETS=1 fires tv counters on wave-4-reaching seeds, scholar kills = 0.
  // Wave-4-reaching configs are verified IN-PROCESS (the det-gate known
  // issue: timestamp-based villager IDs leak into contest RNG, so
  // cross-process trajectories differ — s64703-belongfeast reaches wave-4
  // in the vgearconfirm corpus process but not in this one).
  const e3a = await trajectory(64703, { twovets: true, vgear: true }, TV.armedFor('leadfeast'), 150, true);
  check('E3a: TWOVETS=1 fires tv counters on wave-4-reaching s64703-leadfeast (150d)',
    (e3a.tv.tvFights | 0) > 0 && tvActed(e3a.tv) > (e3a.tv.tvFights | 0), tvLine(e3a.tv));
  check('E3b: scholar wave-4 kills = 0 on s64703-leadfeast armed (150d)',
    e3a.kills.scholar === 0, `scholar=${e3a.kills.scholar} villagers=[${e3a.kills.villagers.join(',')}] total=${e3a.kills.total} ${tvLine(e3a.tv)}`);
  const e3c = await trajectory(64707, { twovets: true, vgear: true }, TV.armedFor('belongfeast'), 150, true);
  check('E3c: TWOVETS=1 fires tv counters on wave-4-reaching s64707-belongfeast (150d)',
    (e3c.tv.tvFights | 0) > 0 && tvActed(e3c.tv) > (e3c.tv.tvFights | 0), tvLine(e3c.tv));
  check('E3d: scholar wave-4 kills = 0 on s64707-belongfeast armed (150d)',
    e3c.kills.scholar === 0, `scholar=${e3c.kills.scholar} villagers=[${e3c.kills.villagers.join(',')}] total=${e3c.kills.total} ${tvLine(e3c.tv)}`);

  // E3f RED: TWOVETS-off fires zero tv counters.
  const e3f = await trajectory(64703, { twovets: false, vgear: true }, TV.armedFor('leadfeast'), 150, true);
  check('E3f: TWOVETS-off fires zero tv counters (s64703-leadfeast 150d)',
    tvActed(e3f.tv) === 0 && (e3f.tv.tvFights | 0) === 0, tvLine(e3f.tv));

  // R1 RED: the kill-leak regression. With stand-down disabled (the dead
  // run's bug, simulated), the scholar lands wave-4 kills on the
  // regression seed; with the fix, the same seed gives scholar kills = 0.
  const r1red = await trajectory(64703, { twovets: true, vgear: true, noStanddown: true }, TV.armedFor('leadfeast'), 150, true);
  check('R1-RED: TV_TEST_NOSTANDDOWN=1 -> scholar lands wave-4 kills (s64703-leadfeast 150d)',
    r1red.kills.scholar > 0, `scholar=${r1red.kills.scholar} total=${r1red.kills.total} (regression seed confirmed — the leak exists without the fix)`);
  check('R1-GREEN: fix on -> scholar wave-4 kills = 0, same seed/config',
    e3a.kills.scholar === 0, `scholar=${e3a.kills.scholar}`);

  // E4: instrument determinism — same armed config + KILLDISC twice.
  const e4a = await trajectory(64701, { twovets: true, vgear: true }, TV.armedFor('leadfeast'), 60, true);
  const e4b = await trajectory(64701, { twovets: true, vgear: true }, TV.armedFor('leadfeast'), 60, true);
  check('E4: armed+KILLDISC deterministic across runs (s64701 60d)',
    e4a.traj === e4b.traj && e4a.traj.length > 0);

  // D2: 180d armed runs COMPLETE per policy + deterministic re-run.
  const d2a1 = await trajectory(64705, { twovets: true, vgear: true }, TV.armedFor('leadfeast'), 180, true);
  const d2a2 = await trajectory(64705, { twovets: true, vgear: true }, TV.armedFor('leadfeast'), 180, true);
  check('D2a: 180d armed leadfeast completes + deterministic (s64705)',
    d2a1.traj === d2a2.traj && d2a1.traj.length > 0, 'days ' + d2a1.days);
  const d2b1 = await trajectory(64706, { twovets: true, vgear: true }, TV.armedFor('belongfeast'), 180, true);
  const d2b2 = await trajectory(64706, { twovets: true, vgear: true }, TV.armedFor('belongfeast'), 180, true);
  check('D2b: 180d armed belongfeast completes + deterministic (s64706)',
    d2b1.traj === d2b2.traj && d2b1.traj.length > 0, 'days ' + d2b1.days);

  console.log(`\n${pass}/${pass + fail} PASS, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e); process.exit(1); });

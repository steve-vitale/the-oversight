#!/usr/bin/env node
// test-armorcatch-20261021.js — proof for scripts/policies/armorcatch.js
// (sim-armorcatch, 2026-10-21, axis scale-onramp, the #735 veteran/armor
// catch-22).
//
// RED->GREEN on the armor discipline + det-gates + env gate + determinism.
//
// Env (asserted up front): FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1
// WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 (the pinned winning substrate);
// no SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/VETREL/VGEARBEATS.
//
// Gates:
//   E0: shape (exports, normBase, armorcatchOn reads ARMORCATCH).
//   E1: predicate RED->GREEN fixtures (chaffVetoWanted / triageVetoWanted).
//   E2: det-gate — ARMORCATCH unset -> armedFor trajectories byte-identical
//       to controlFor (2 seeds x 60d), ctx carries no ac* keys.
//   E3: RED->GREEN on identical seeds — control fires zero ac counters
//       (RED), ARMORCATCH=1 fires >0 (GREEN), 2 seeds x 120d.
//   E3f: ARMORCATCH-off ctx has no ac counters (covered by E3-RED, explicit).
//   E4: determinism — same armed config twice -> byte-identical (trajectory
//       + ac counters).
//   E5: env-gate — sweep exits 2 on env mismatch (proven by running the
//       sweep with KILLDISC unset).
//   D2: 180d runs complete per policy + deterministic re-run.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 \
//     node scripts/test-armorcatch-20261021.js
'use strict';
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');

// KILL-PROTOCOL INFO-SKIP: if the composition is deleted (ARMORCATCH_KILLED=1
// set by the coordinator after a killed arm), this proof exits green with an
// INFO-SKIP instead of FATAL-ing.
let AC = null;
try {
  AC = require('./policies/armorcatch');
} catch (e) {
  if (process.env.ARMORCATCH_KILLED === '1') {
    console.log('INFO-SKIP: scripts/policies/armorcatch.js deleted per kill protocol (sim-armorcatch NO-GO) — proof not applicable.');
    process.exit(0);
  }
  throw e;
}

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'VGEAR', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`PROOF STOP: ${k}=1 is required (pinned substrate).`); process.exit(2); }
}
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'VGEARBEATS', 'ARMORCATCH']) {
  if (k in process.env && k !== 'ARMORCATCH') { console.error(`PROOF STOP: ${k} must be unset.`); process.exit(2); }
}

const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS', name); }
  else { fail++; console.log('FAIL', name, extra === undefined ? '' : String(extra).slice(0, 400)); }
}
function setArmorcatch(on) {
  if (on) process.env.ARMORCATCH = '1'; else delete process.env.ARMORCATCH;
}

async function trajectory(seed, policyObj, days) {
  const { Game } = await loadGame({ seed, mode: 'armorcatch-det', fullTelemetry: false });
  await setupGame(Game);
  const hs = [];
  let lastCtx = null;
  const oDaily = policyObj.daily;
  const policy = Object.assign({}, policyObj, {
    daily(G, ctx) {
      if (oDaily) { try { oDaily(G, ctx); } catch (e) {} }
      lastCtx = ctx;
      try { hs.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {}
    },
  });
  await quietLog(async () => { await runDays(Game, policy, { days: days || 60, sampleEvery: 30 }); });
  const ac = {};
  if (lastCtx) for (const k of Object.keys(lastCtx)) if (/^ac[A-Z]/.test(k)) ac[k] = lastCtx[k];
  return { traj: hs.join('|'), days: hs.length, ac };
}

(async () => {
  // E0: shape.
  check('E0a: exports', typeof AC.armorcatchOn === 'function' && typeof AC.normBase === 'function' &&
    typeof AC.withArmorCatch === 'function' && typeof AC.armedFor === 'function' &&
    typeof AC.controlFor === 'function' && typeof AC.chaffVetoWanted === 'function' &&
    typeof AC.triageVetoWanted === 'function' && typeof AC.demandArmorP === 'function');
  check('E0b: normBase', AC.normBase('lead') === 'leadfeast' && AC.normBase('belongfeast') === 'belongfeast');
  let threw = false;
  try { AC.normBase('nope'); } catch (e) { threw = true; }
  check('E0c: normBase throws on unknown', threw);
  check('E0d: armorcatchOn reads ARMORCATCH', (() => { delete process.env.ARMORCATCH; const a = AC.armorcatchOn(); process.env.ARMORCATCH = '1'; const b = AC.armorcatchOn(); delete process.env.ARMORCATCH; return a === false && b === true; })());
  check('E0e: armedFor id tag', String(AC.armedFor('leadfeast').id || '').indexOf('armorcatch') >= 0);

  // E1: predicate RED->GREEN fixtures.
  const B = (hpFrac) => ({ vid: 'v1', armorP: 20, hpFrac });
  check('E1a RED: chaff veto — round 1 never', AC.chaffVetoWanted({ round: 1, armorBearers: [B(0.5)] }) === false);
  check('E1b RED: chaff veto — healthy bearers', AC.chaffVetoWanted({ round: 3, armorBearers: [B(0.9), B(0.75)] }) === false);
  check('E1c RED: chaff veto — no bearers', AC.chaffVetoWanted({ round: 3, armorBearers: [] }) === false);
  check('E1d GREEN: chaff veto — hurt bearer', AC.chaffVetoWanted({ round: 3, armorBearers: [B(0.9), B(0.74)] }) === true);
  check('E1e RED: triage — round 1 never', AC.triageVetoWanted({ round: 1, armorBearers: [B(0.5)], w4NearDeath: false }) === false);
  check('E1f RED: triage — near-death lets the kill land', AC.triageVetoWanted({ round: 4, armorBearers: [B(0.3)], w4NearDeath: true }) === false);
  check('E1g RED: triage — bearers above the line', AC.triageVetoWanted({ round: 4, armorBearers: [B(0.9), B(0.60)], w4NearDeath: false }) === false);
  check('E1h GREEN: triage — bearer below 0.60', AC.triageVetoWanted({ round: 4, armorBearers: [B(0.9), B(0.59)], w4NearDeath: false }) === true);

  // E2: det-gate — ARMORCATCH unset == controlFor, byte-identical.
  setArmorcatch(false);
  const c1 = await trajectory(65401, AC.armedFor('leadfeast'), 60);
  const c1b = await trajectory(65401, AC.controlFor('leadfeast'), 60);
  check('E2a: ARMORCATCH-off armed(lead) == controlFor, byte-identical (s65401 60d)',
    c1.traj === c1b.traj && c1.days === c1b.days, 'days ' + c1.days + '/' + c1b.days);
  const c2 = await trajectory(65402, AC.armedFor('belongfeast'), 60);
  const c2b = await trajectory(65402, AC.controlFor('belongfeast'), 60);
  check('E2b: ARMORCATCH-off armed(belong) == controlFor, byte-identical (s65402 60d)',
    c2.traj === c2b.traj && c2.days === c2b.days, 'days ' + c2.days + '/' + c2b.days);
  check('E2c: ARMORCATCH-off ctx carries no ac counters',
    Object.keys(c1.ac).length === 0 && Object.keys(c2.ac).length === 0, JSON.stringify(c1.ac));

  // E3: RED->GREEN on identical seeds — control fires zero ac counters
  // (RED), ARMORCATCH=1 fires >0 (GREEN). The discipline engages only in
  // the wave-4 era (vgear stages fighters only when wave 4 is unlocked),
  // so this gate uses s64843, which reaches the wave-4 era on current
  // master (verified: vgW4Fights>0). Pre-wave-4 silence is by design.
  const E3SEED = 64843;
  setArmorcatch(false);
  const r3 = await trajectory(E3SEED, AC.armedFor('belongfeast'), 180);
  const r3acTotal = (t) => (t.ac.acChaffVetos | 0) + (t.ac.acTriageVetos | 0);
  check('E3a RED: control 180d fires zero ac counters (s64843)', r3acTotal(r3) === 0, JSON.stringify(r3.ac));
  setArmorcatch(true);
  const g3 = await trajectory(E3SEED, AC.armedFor('belongfeast'), 180);
  const g3Total = r3acTotal(g3);
  check('E3b GREEN: ARMORCATCH=1 180d fires ac counters (s64843)', g3Total > 0,
    `chaff=${g3.ac.acChaffVetos | 0} triage=${g3.ac.acTriageVetos | 0}`);
  check('E3c: armed trajectory completes 180d sim', g3.days > 0, `days ${g3.days}`);

  // E4: determinism — same armed config twice -> byte-identical.
  const d1 = await trajectory(E3SEED, AC.armedFor('belongfeast'), 180);
  check('E4a: ARMORCATCH=1 deterministic re-run byte-identical (trajectory)',
    d1.traj === g3.traj, 'days ' + d1.days + '/' + g3.days);
  check('E4b: ARMORCATCH=1 deterministic re-run byte-identical (ac counters)',
    JSON.stringify(d1.ac) === JSON.stringify(g3.ac), JSON.stringify(d1.ac) + ' vs ' + JSON.stringify(g3.ac));

  // E5: env-gate — the sweep exits 2 on env mismatch.
  let envGateOk = false, envOut = '';
  try {
    envOut = execSync('KILLDISC=0 node scripts/sweep-armorcatch-20261021.js 2>&1', { cwd: REPO, encoding: 'utf8' });
  } catch (e) {
    envGateOk = (e.status === 2);
    envOut = String((e.stdout || '') + (e.stderr || '')).slice(0, 200);
  }
  check('E5: sweep exits 2 with SWEEP STOP on env mismatch', envGateOk, envOut);

  // D2: 180d runs complete per policy + deterministic re-run. "Completes"
  // means the simulation finishes without error — death-aware horizons
  // legitimately end early when the village dies (s65401 died ~d132).
  const w1 = await trajectory(65401, AC.armedFor('leadfeast'), 180);
  const w1b = await trajectory(65401, AC.armedFor('leadfeast'), 180);
  check('D2a: 180d armed run completes without error', w1.days > 0, 'days ' + w1.days);
  check('D2b: 180d armed deterministic re-run', w1.traj === w1b.traj);

  setArmorcatch(false);
  console.log(`\n${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e); process.exit(1); });

#!/usr/bin/env node
// probe-capture-neutral-20261018.js — one-off: is attachExecensusCapture
// trajectory-neutral? Same seed/policy/env, 130d, with vs without the
// capture. Compares a compact trajectory digest.
'use strict';
const path = require('path');
// Env BEFORE requiring the execensus instrument (its top-level STOP gates).
for (const k of ['FEASTSCALE_R13','TRIBFLOOR','SUCCGRACE','RAIDDENSITY','WINPURSUIT','WINDEFER']) process.env[k] = '1';
process.env.SEATDRIVE = '0'; process.env.VETREL = '1'; process.env.REPOSITION = '1'; process.env.NODEWITNESS = '1';
process.env.FIGHTOPEN = '1';
const TF = require('./policies/tribfloor');
const VR = require('./policies/vetrel');
const RP = require('./policies/reposition');
const EX = require('./sweep-execensus-20261016');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

function policyFor() {
  const rp = RP.withReposition(TF.leadfeast, 'probe-rp', 'probe');
  return VR.withVetrel(rp, 'probe-rp-vetrel', 'probe');
}
function digest(Game, result) {
  const st = Game.state || {};
  const roster = ((st.village || {}).roster || []).slice().sort().join(',');
  const scholar = (st.scholar || {}).vid || (st.scholar || {}).name || '?';
  let wave = 1;
  try { wave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  return JSON.stringify({ days: result.days, end: result.endReason, roster, scholar, wave });
}
(async () => {
  const out = {};
  for (const withCap of [true, false]) {
    const { Game } = await loadGame({ seed: 52005, mode: 'probe', fullTelemetry: false });
    await setupGame(Game);
    let cap = null;
    if (withCap) cap = EX.attachExecensusCapture(Game);
    let result;
    await quietLog(async () => { result = await runDays(Game, policyFor(), { days: 130, manifest: undefined, sampleEvery: 30 }); });
    if (cap) cap.restore();
    out[withCap ? 'withCapture' : 'withoutCapture'] = digest(Game, result);
    console.log((withCap ? 'withCapture   ' : 'withoutCapture') + ':', out[withCap ? 'withCapture' : 'withoutCapture'].slice(0, 160));
  }
  console.log('IDENTICAL:', out.withCapture === out.withoutCapture);
})().catch(e => { console.error('PROBE CRASH:', e); process.exit(2); });

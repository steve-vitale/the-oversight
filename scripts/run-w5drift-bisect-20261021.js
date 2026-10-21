#!/usr/bin/env node
// run-w5drift-bisect-20261021.js — paired same-seed spawn/engagement census
// for the wave-5 unlock drift bisect (sim-w5drift, run fleshout-20261021T1515Z).
// INSTRUMENT-ONLY: zero src/js changes, zero scripts/policies changes.
// Reuses the proven windowstay instrument stack (instr-windowstay-20261021.js
// on top of killdisc v2 + windowreach layer) — nothing re-derived.
// Usage: node scripts/run-w5drift-bisect-20261021.js <seed> <policyId> [days]
//   Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1
// Prints one JSON census object to stdout. Writes nothing to the repo.
'use strict';
const path = require('path');
const REPO = path.resolve(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const WS = require(path.join(REPO, 'scripts', 'instr-windowstay-20261021'));
const VCE = require(path.join(REPO, 'scripts', 'policies', 'vgearconfirm'));

const ENV_VARS = ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'VGEAR', 'KILLDISC'];

async function main() {
  const seed = parseInt(process.argv[2], 10);
  const policyId = process.argv[3] || 'belongfeast';
  const days = parseInt(process.argv[4], 10) || 180;
  if (!Number.isFinite(seed)) throw new Error('usage: run-w5drift-bisect-20261021.js <seed> <policyId> [days]');
  const envBad = ENV_VARS.filter(v => process.env[v] !== '1');
  if (envBad.length) throw new Error('env-gate FAILED (need =1): ' + envBad.join(','));

  const { Game } = await loadGame({ seed, mode: 'w5drift', fullTelemetry: false });
  const t = {
    kills: [], engagements: [], fieldFights: [], spawns: [],
    tbOutcomes: {}, census: [], dmg: {}, instrumentErrors: [], window: [],
    deathRecs: [], fightStarts: [],
  };
  const uninstall = WS.install(Game, t);
  await setupGame(Game);
  const policy = VCE.armedFor(policyId);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}

  const w3plus = a => (a || []).filter(r => (r.wave | 0) >= 3);
  const spawns3 = w3plus(t.spawns);
  const engStarted = (t.engagements || []).filter(e => e.started);
  const eng3 = w3plus(engStarted);
  const kills3 = w3plus(t.kills);
  const ff3 = w3plus(t.fieldFights);
  let w4day = null, w5day = null;
  for (const w of (t.window || [])) {
    if (w.unlocked === 4 && w4day == null) w4day = w.day;
    if (w.unlocked === 5 && w5day == null) w5day = w.day;
  }
  const lastW = (t.window || [])[(t.window || []).length - 1] || {};
  const census = {
    seed, policyId, days: result.days, gameDays: result.gameDays,
    endReason: result.endReason, won: !!Game.won,
    spawnsW3plus: spawns3.length,
    spawnsW3plusBySrc: { world: spawns3.filter(s => s.src === 'world').length, cast: spawns3.filter(s => s.src === 'cast').length },
    scholarTBStarted: engStarted.length,
    scholarTBW3plus: eng3.length,
    scholarTBRefusedW3plus: (t.engagements || []).filter(e => !e.started && (e.wave | 0) >= 3).length,
    villagerFieldFightsW3plus: ff3.length,
    fieldOutcomes: {},
    killsW3plus: kills3.length,
    killsW4plus: kills3.filter(k => (k.wave | 0) >= 4).length,
    w4unlockDay: w4day, w5unlockDay: w5day,
    peakRaw: lastW.peakRaw != null ? lastW.peakRaw : null,
    peakCapped: lastW.peakCapped != null ? lastW.peakCapped : null,
    endRaw: lastW.raw != null ? lastW.raw : null,
    endCapped: lastW.capped != null ? lastW.capped : null,
    living: lastW.living != null ? lastW.living : null,
    instrumentErrors: (t.instrumentErrors || []).length,
  };
  for (const f of ff3) census.fieldOutcomes[f.outcome] = (census.fieldOutcomes[f.outcome] || 0) + 1;
  console.log(JSON.stringify(census));
}

main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });

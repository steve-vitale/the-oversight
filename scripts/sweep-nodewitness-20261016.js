#!/usr/bin/env node
// sweep-nodewitness-20261016.js — the sim-nodewitness measurement sweep.
// GAME-CODE ARM (treatment, NODEWITNESS=1) vs identical-seed control
// (NODEWITNESS unset = zero trace) on IDENTICAL seeds, policies, env.
// Read-only attach to the engine (tele wrap + say-beat capture +
// end-of-run state reads).
//
// Substrate: PRE-SEAT (SEATDRIVE=0 explicit — unset means driver ON).
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
//   SEEDS=... POLICIES=leadfeast,belongfeast DAYS=180 ARM=treatment
// Treatment ALSO requires NODEWITNESS=1 in env.
// REPO defaults to this script's own tree (the treatment worktree). The
// control runs the same tree with NODEWITNESS unset — the layer is
// default-OFF, so control == pristine behavior (det-gate proven).
//
// Per-seed JSONs: evidence/2026-10-16/perseed-nodewitness/<policy>-s<seed>-<arm>.json
// Schema: exact numeric keys national/table/won/exiled (+ wins alias for telemetry-check).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
// PRE-SEAT: SEATDRIVE=0 explicit (unset = driver ON — the method note).
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }

const ARM = process.env.ARM || 'treatment';
if (ARM === 'treatment' && process.env.NODEWITNESS !== '1') {
  console.error('SWEEP STOP: ARM=treatment requires NODEWITNESS=1.'); process.exit(2);
}
if (ARM === 'control' && process.env.NODEWITNESS === '1') {
  console.error('SWEEP STOP: ARM=control must run with NODEWITNESS unset.'); process.exit(2);
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [931]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast']);
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-nodewitness');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-16', 'nodewitness-beats');
const BEAT_CAP = 3000;
const BEAT_LEN = 300;
// Node-witness beats (sense-testing material).
const TRICK_BEAT = /came back with|watched the|the fire listens|COUNTER LEARNED|pieced it together from a death/i;

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

function policyFor(policyId) {
  return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
}

// PRIMARY set (pre-registered): the apexhook pilot's 0-learning set —
// eater/audit/cancellation were never learned across 16 runs (0/16).
const PRIMARY_SET = ['eater', 'audit', 'cancellation'];
// The newly-hooked set's execution tally (apexhook's keys — the SECONDARY).
const APEX_TALLY_KEYS = ['poison', 'focus_followers', 'inefficient', 'wait:reunion-novel', 'continuity', 'offscript'];

async function oneRun(seed, policyId) {
  const policy = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'nodewitness', fullTelemetry: false });
  await setupGame(Game);

  const nodeReports = []; // counter_observed with via='node-witnessed'
  const discovered = [];
  const deaths = [];
  const sayBeats = [];
  const _t = Game.tele.bind(Game);
  Game.tele = function (type, data) {
    try {
      if (type === 'counter_observed' && data && data.via === 'node-witnessed')
        nodeReports.push({ day: gday(Game), id: data.id, n: data.n, vid: data.vid });
      else if (type === 'counter_discovered') discovered.push({ day: gday(Game), id: data && data.id, via: data && data.via });
      else if (type === 'death') deaths.push({ day: gday(Game), kind: data && data.kind, who: data && data.who, cause: data && data.cause, player: !!(data && data.player) });
    } catch (e) {}
    return _t(type, data);
  };
  const _s = Game.say.bind(Game);
  Game.say = function (t) {
    try {
      const s = String(t || '');
      if (TRICK_BEAT.test(s) && sayBeats.length < BEAT_CAP) sayBeats.push({ day: gday(Game), text: s.slice(0, BEAT_LEN) });
    } catch (e) {}
    return _s(t);
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  Game.tele = _t; Game.say = _s;

  const st = Game.state || {};

  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}

  const maxWave = result.maxWaveUnlocked || 1;
  const won = !!Game.won ? 1 : 0;
  const fTricks = Object.keys(st.villagerTricks || {});
  // PRIMARY signal: hyper-lethal trick learnings (end-of-run knowledge).
  const primaryLearned = fTricks.filter(id => PRIMARY_SET.includes(id));
  // ...and the witness channel's own discovery events for the primary set.
  const primaryWitnessDiscovered = discovered.filter(d => d.via === 'node-witnessed' && PRIMARY_SET.includes(d.id));
  const fieldDeaths = deaths.filter(d => !d.player).length;
  let trickTally = {};
  try { trickTally = Game._trickTally || {}; } catch (e) {}
  // SECONDARY signal: trick executions vs the newly-hooked set.
  const apexTally = {};
  let apexExecutions = 0;
  for (const k of APEX_TALLY_KEYS) { apexTally[k] = trickTally[k] || 0; apexExecutions += apexTally[k]; }

  const bySpecies = {};
  for (const w of nodeReports) bySpecies[w.id] = (bySpecies[w.id] || 0) + 1;
  const nodeWitnessDiscovered = discovered.filter(d => d.via === 'node-witnessed');

  const out = {
    seed, policyId, arm: ARM, repo: REPO,
    substrate: 'pre-seat (FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0 explicit)',
    days: result.days, endReason: result.endReason,
    national, table, won, wins: won, exiled: 0,
    maxWave, wave4Reached: maxWave >= 4 ? 1 : 0, wave5Reached: maxWave >= 5 ? 1 : 0,
    deaths: deaths.length, fieldDeaths, playerDeaths: deaths.length - fieldDeaths,
    deathCauses: deaths.reduce((o, d) => { const c = String(d.cause || '?').slice(0, 60); o[c] = (o[c] || 0) + 1; return o; }, {}),
    trickTally,
    apexTally, apexExecutions,
    nNodeWitnessReports: nodeReports.length,
    nodeWitnessBySpecies: bySpecies,
    nNodeWitnessDiscovered: nodeWitnessDiscovered.length,
    nodeWitnessDiscovered: nodeWitnessDiscovered.map(d => ({ day: d.day, id: d.id })),
    // PRIMARY: end-of-run learnings for the apexhook 0-learning set.
    primaryLearned, nPrimaryLearned: primaryLearned.length,
    primaryWitnessDiscovered: primaryWitnessDiscovered.map(d => ({ day: d.day, id: d.id })),
    nPrimaryWitnessDiscovered: primaryWitnessDiscovered.length,
    finalVillagerTricks: fTricks,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}-${ARM}.json`), JSON.stringify(out, null, 1));
  const beats = sayBeats.slice(0, 800);
  if (beats.length) {
    fs.mkdirSync(BEATS, { recursive: true });
    fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}-${ARM}.json`), JSON.stringify(beats, null, 1));
  }
  console.log(`  [${ARM} ${policyId} s${seed}] days=${result.days} end=${result.endReason} maxWave=${maxWave} nat=${national} won=${won} deaths=${deaths.length} nodeRep=${nodeReports.length} primaryLearned=${primaryLearned.length} apexExec=${apexExecutions}`);
  return out;
}

(async () => {
  for (const seed of SEEDS) {
    for (const policyId of POLICIES) {
      await oneRun(seed, policyId);
    }
  }
  console.log('sweep-nodewitness done.');
})().catch(e => { console.error('SWEEP CRASH', String(e && e.stack || e).slice(0, 1000)); process.exit(1); });

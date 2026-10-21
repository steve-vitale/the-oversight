#!/usr/bin/env node
// titanoutcome-sweep-20261021.js — sim-titanoutcome corpus sweep.
//
// 8 FRESH seeds (64801-64808, verified unused in scripts/) x {lead, belong}
// = 16 runs, 180d death-aware, on the vgearconfirm substrate:
//   VGEAR=1 FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
//   + TITANOUTCOME=1 (the read-only titan census instrument).
// Policy: VCE.armedFor (VILLAGERGEAR outside the winning seat stack).
//
// Per-seed JSONs carry the instrument census + the game-side
// state.titans.outcomes records + the two-direction cross-check, so the
// analyzer can judge attribution completeness (the #784 gate).
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-21/perseed-titanoutcome/ and prints a summary.
//
// Usage:
//   VGEAR=1 FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 \
//   TITANOUTCOME=1 SEEDS=64801,64802 POLICIES=lead \
//   node scripts/titanoutcome-sweep-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const VCE = require(path.join(REPO, 'scripts', 'policies', 'vgearconfirm'));
const TO = require(path.join(REPO, 'scripts', 'titanoutcome-instrument-20261021'));

// SUBSTRATE guard (the vgearconfirm winning substrate + the census instrument).
for (const k of ['VGEAR', 'FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'TITANOUTCOME']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (vgear substrate + titanoutcome instrument).`); process.exit(2); }
}
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'REPOSITION', 'VGEARBEATS']) {
  if (k in process.env) { console.error(`SWEEP STOP: ${k} must be unset (pinned substrate, nothing else).`); process.exit(2); }
}
if (TO.instrumentOn() !== true) { console.error('SWEEP STOP: TITANOUTCOME instrument off despite TITANOUTCOME=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [64801, 64802, 64803, 64804, 64805, 64806, 64807, 64808]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-21', 'perseed-titanoutcome');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

async function oneRun(seed, base) {
  const tag = base === 'lead' ? 'leadfeast' : 'belongfeast';
  const policy = VCE.armedFor(base);
  const { Game } = await loadGame({ seed, mode: 'titanoutcome', fullTelemetry: false });
  const t = { encounters: [], tbOutcomes: {}, dissolves: [], standdowns: [], census: [], instrumentErrors: [] };
  const uninstall = TO.install(Game, t);
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}

  const st = Game.state || {};
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0, national = 0, table = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  // Game-side outcome records (the #784 record) + terminal census state.
  const gameRecords = (((st.titans || {}).outcomes) || []).map(r => ({
    day: r.day | 0, titan: r.titan, outcome: r.outcome,
    result: r.result || null, endDay: r.endDay != null ? (r.endDay | 0) : null,
    orphan: !!r.orphan, detail: r.detail || null,
  }));
  const slain = {};
  try { for (const k of Object.keys((st.titans || {}).slain || {})) slain[k] = !!st.titans.slain[k]; } catch (e) {}
  const omensEnd = {};
  try { for (const k of Object.keys((st.titans || {}).omens || {})) omensEnd[k] = (((st.titans || {}).omens[k] || {}).stage | 0); } catch (e) {}

  // Instrument-side attribution.
  const attributed = (t.encounters || []).map(e => ({
    day: e.day | 0, titan: e.titan, started: !!e.started, stoodDown: !!e.stoodDown,
    omenStage: e.omenStage, musterAllies: e.musterAllies, havenBlades: e.havenBlades,
    ready: e.ready, need: e.need, have: e.have,
    class: TO.classifyOutcome(e, t.tbOutcomes),
  }));
  const byClass = {};
  let unexplained = 0;
  for (const a of attributed) {
    byClass[a.class] = (byClass[a.class] || 0) + 1;
    if (a.class === 'unresolved') unexplained++;
  }

  // Two-direction cross-check: instrument <-> game-side records.
  const crossCheck = TO.crossCheck(Game, t);

  const out = {
    seed, policy: 'vgear-' + tag, arm: 'titanoutcome',
    instrument: 'titanoutcome-v1',
    substrate: 'vgearconfirm substrate (VGEAR=1 FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 TITANOUTCOME=1)',
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    encounters: (t.encounters || []).length,
    attributed, byClass, unexplained,
    gameRecords, slain, omensEnd,
    standdowns: t.standdowns,
    dissolves: t.dissolves,
    censusDays: (t.census || []).length,
    crossCheck: { matched: crossCheck.matched, unexplained: crossCheck.unexplained },
    instrumentErrors: t.instrumentErrors,
  };
  const fp = path.join(EVID, `vgear-${tag}-s${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1) + '\n');
  return out;
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    for (const base of BASES) {
      try {
        const r = await oneRun(seed, base);
        rows.push(r);
        console.log(`done ${r.policy} s${seed}: wave4=${r.wave4} enc=${r.encounters} unexplained=${r.unexplained} xcheck-unexplained=${r.crossCheck.unexplained.length} errs=${r.instrumentErrors.length} end=${r.endReason} won=${r.won}`);
      } catch (e) {
        console.error(`FAILED ${base} s${seed}: ${e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e}`);
        process.exitCode = 1;
      }
    }
  }
  fs.writeFileSync(path.join(EVID, '_summary.json'), JSON.stringify(rows.map(r => ({
    seed: r.seed, policy: r.policy, maxWave: r.maxWave, wave4: r.wave4, national: r.national,
    table: r.table, won: r.won, encounters: r.encounters, byClass: r.byClass,
    unexplained: r.unexplained, crossCheckUnexplained: r.crossCheck.unexplained.length,
    gameRecords: r.gameRecords.length, instrumentErrors: r.instrumentErrors.length,
    gameDays: r.gameDays, endReason: r.endReason,
  })), null, 1) + '\n');
  console.log(`wrote ${rows.length} per-seed JSONs to ${EVID}`);
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e); process.exit(1); });

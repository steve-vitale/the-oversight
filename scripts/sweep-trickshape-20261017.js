#!/usr/bin/env node
// sweep-trickshape-20261017.js — the sim-trickshape fight-shape sweep.
// MEASUREMENT ONLY: read-only instrument attach to the base leadfeast/
// belongfeast sweep (zero src/js, zero policy changes).
// Shared read-only instrument: scripts/trickshape-instrument-20261017.js.
// Shape classifier: classifyShapeFight (same file).
//
// Substrate (pre-seat courtship): SEATDRIVE=0 EXPLICIT, FEASTSCALE_R13=1,
// TRIBFLOOR=1 (the base tribfloor policies leadfeast/belongfeast, untouched).
// reposition/vetrel/w3wire: OFF (no such layers composed by tribfloor;
// no w3wire hook exists in the tree). NODEWITNESS unset.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SEATDRIVE=0 \
//     SEEDS=1901,1902,1903,1904,1905,1906,1907,1908 \
//     POLICIES=leadfeast,belongfeast DAYS=180 \
//     node scripts/sweep-trickshape-20261017.js
//
// Per-seed JSONs: evidence/2026-10-17/perseed-trickshape/<policy>-s<seed>.json
// Schema: exact numeric keys national/table/won (+wins alias)/exiled for
// telemetry-check.js. Beats: evidence/2026-10-17/trickshape-beats/.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(ROOT, 'scripts', 'sim-harness'));
const TF = require(path.join(ROOT, 'scripts', 'policies', 'tribfloor'));
const { attachTrickshapeCapture, classifyShapeFight, kindOf } = require('./trickshape-instrument-20261017.js');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [1901]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast']);
const EVID = path.join(ROOT, 'evidence', '2026-10-17', 'perseed-trickshape');
const BEATS = path.join(ROOT, 'evidence', '2026-10-17', 'trickshape-beats');

function policyFor(policyId) {
  return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
}

async function oneRun(seed, policyId) {
  const policy = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'trickshape', fullTelemetry: false });
  await setupGame(Game);
  const cap = attachTrickshapeCapture(Game);

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  cap.restore();

  const st = Game.state || {};
  const wkl = st.waveKillLog || [];

  // Shape classification: one row per trick-bearing species per TB fight.
  const rows = [];
  let unattributed = 0;
  for (const t of cap.tbFights) {
    for (const mid of (t.mids || [])) {
      if (!t.kindByMid[mid]) t.kindByMid[mid] = kindOf(Game, mid);
    }
    const c = classifyShapeFight(t, wkl, Game);
    unattributed += c.unattributed;
    for (const r of c.rows) {
      rows.push(Object.assign({
        fightSeq: t.seq, day: t.day, started: t.started,
        seed: seed, policyId: policyId,
      }, r));
    }
  }

  // Wall metrics (schema-aligned for telemetry-check).
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  const won = !!Game.won ? 1 : 0;
  const fieldDeaths = cap.deaths.filter(d => !d.player).length;

  const out = {
    seed, policyId, arm: 'trickshape',
    substrate: 'pre-seat courtship (FEASTSCALE_R13=1 TRIBFLOOR=1, SEATDRIVE=0 explicit; NODEWITNESS unset; reposition/vetrel/w3wire OFF)',
    days: result.days, endReason: result.endReason,
    national, table, won, wins: won, exiled: 0,
    maxWave, wave3Reached: maxWave >= 3 ? 1 : 0, wave4Reached: maxWave >= 4 ? 1 : 0, wave5Reached: maxWave >= 5 ? 1 : 0,
    deaths: cap.deaths.length, fieldDeaths, playerDeaths: cap.deaths.length - fieldDeaths,
    nTbFights: cap.tbFights.length,
    nShapeRows: rows.length, nUnattributed: unattributed,
    rows,
    nCheckCalls: cap.checkCalls.length,
    nHits: cap.checkCalls.filter(c => c.hit).length,
    nDiscoveries: cap.discoveries.length,
    nFieldFires: cap.fieldFires.length,
    fieldFires: cap.fieldFires.slice(0, 300),
    monsterCounters: Object.keys(st.monsterCounters || {}),
    tbfightIntercepted: cap.tbfightIntercepted,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}.json`), JSON.stringify(out, null, 1));

  // Beats: per-fight transcripts for performed fights (sense material) +
  // trick-beat log + fight summaries.
  const perfSeqs = new Set(rows.filter(r => r.performed).map(r => r.fightSeq));
  const transcripts = {};
  for (const seq of perfSeqs) {
    const beats = (cap.fightBeats || {})[seq];
    if (beats && beats.length) transcripts[seq] = beats;
  }
  fs.mkdirSync(BEATS, { recursive: true });
  fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}.json`),
    JSON.stringify({
      transcripts: transcripts,
      trickBeats: (cap.sayBeats || []).filter(b => b && b.text).slice(0, 600),
      discoveries: cap.discoveries.slice(0, 200),
    }, null, 1));
  console.log(`  [shape ${policyId} s${seed}] days=${result.days} end=${result.endReason} maxWave=${maxWave} nat=${national} table=${table} won=${won} tbFights=${cap.tbFights.length} rows=${rows.length} unattr=${unattributed} perf=${rows.filter(r=>r.performed).length} fieldFires=${cap.fieldFires.length}`);
  return out;
}

(async () => {
  if (require.main !== module) return;
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      await oneRun(seed, policyId);
    }
  }
  console.log(`\nSWEEP DONE (trickshape) — per-seed JSONs in evidence/2026-10-17/perseed-trickshape/.`);
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });

module.exports = { oneRun, policyFor };

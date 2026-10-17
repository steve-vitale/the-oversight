#!/usr/bin/env node
// sweep-trickfunnel-20261016.js — the sim-trickfunnel funnel-census sweep.
// MEASUREMENT ONLY: read-only instrument attach to the base leadfeast/
// belongfeast sweep (zero src/js, zero policy changes).
// Shared read-only instrument: scripts/trickfunnel-instrument-20261016.js.
// Funnel classifier: classifyFunnelFight (same file).
//
// Substrate (pre-seat courtship): SEATDRIVE=0 EXPLICIT, FEASTSCALE_R13=1,
// TRIBFLOOR=1 (the base tribfloor policies leadfeast/belongfeast, untouched).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SEATDRIVE=0 \
//     SEEDS=1801,1802,1803,1804,1805,1806,1807,1808 \
//     POLICIES=leadfeast,belongfeast DAYS=180 \
//     node scripts/sweep-trickfunnel-20261016.js
//
// Per-seed JSONs: evidence/2026-10-16/perseed-trickfunnel/<policy>-s<seed>.json
// Schema: exact numeric keys national/table/won (+wins alias)/exiled for
// telemetry-check.js. Beats: evidence/2026-10-16/trickfunnel-beats/.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(ROOT, 'scripts', 'sim-harness'));
const TF = require(path.join(ROOT, 'scripts', 'policies', 'tribfloor'));
const { attachTrickfunnelCapture, classifyFunnelFight, kindOf } = require('./trickfunnel-instrument-20261016.js');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [1801]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast']);
const EVID = path.join(ROOT, 'evidence', '2026-10-16', 'perseed-trickfunnel');
const BEATS = path.join(ROOT, 'evidence', '2026-10-16', 'trickfunnel-beats');

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

function policyFor(policyId) {
  return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
}

async function oneRun(seed, policyId) {
  const policy = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'trickfunnel', fullTelemetry: false });
  await setupGame(Game);
  const cap = attachTrickfunnelCapture(Game);

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  cap.restore();

  const st = Game.state || {};
  const wkl = st.waveKillLog || [];

  // Funnel classification: one row per trick-bearing species per TB fight.
  const rows = [];
  let unattributed = 0;
  for (const t of cap.tbFights) {
    for (const mid of (t.mids || [])) {
      if (!t.kindByMid[mid]) t.kindByMid[mid] = kindOf(Game, mid);
    }
    const c = classifyFunnelFight(t, wkl);
    unattributed += c.unattributed;
    for (const r of c.rows) {
      rows.push({
        fightSeq: t.seq, day: t.day, started: t.started, result: t.result,
        mid: r.mid, kind: r.kind,
        contact: r.contact, known_at_start: r.known_at_start, known_at_end: r.known_at_end,
        discovered_in_fight: r.discovered_in_fight,
        condition_met: r.condition_met, n_hits: r.n_hits,
        performed: r.performed, n_perfs: r.n_perfs,
        kill_attributed: r.kill_attributed, attr_by: r.attr_by, attr_via: r.attr_via,
        survived: r.survived, dismissed: r.dismissed, unattributed: r.unattributed,
      });
    }
  }

  // Per-kind funnel rollup.
  const kinds = {};
  for (const r of rows) {
    const k = r.kind || 'unknown';
    const a = kinds[k] || (kinds[k] = {
      contact: 0, known_at_start: 0, condition_met: 0, performed: 0,
      kill_attributed: 0, survived: 0, dismissed: 0, unattributed: 0,
      species: {},
    });
    a.contact += r.contact;
    a.known_at_start += r.known_at_start || 0;
    a.condition_met += r.condition_met;
    a.performed += r.performed;
    a.kill_attributed += r.kill_attributed;
    a.survived += r.survived || 0;
    a.dismissed += r.dismissed;
    a.unattributed += r.unattributed;
    a.species[r.mid] = (a.species[r.mid] || 0) + 1;
  }

  // Wall metrics (schema-aligned for telemetry-check).
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  const won = !!Game.won ? 1 : 0;
  const fieldDeaths = cap.deaths.filter(d => !d.player).length;

  const out = {
    seed, policyId, arm: 'census',
    substrate: 'pre-seat courtship (FEASTSCALE_R13=1 TRIBFLOOR=1, SEATDRIVE=0 explicit; NODEWITNESS unset)',
    days: result.days, endReason: result.endReason,
    national, table, won, wins: won, exiled: 0,
    maxWave, wave3Reached: maxWave >= 3 ? 1 : 0, wave4Reached: maxWave >= 4 ? 1 : 0, wave5Reached: maxWave >= 5 ? 1 : 0,
    deaths: cap.deaths.length, fieldDeaths, playerDeaths: cap.deaths.length - fieldDeaths,
    deathCauses: cap.deaths.reduce((o, d) => { const c = String(d.cause || '?').slice(0, 60); o[c] = (o[c] || 0) + 1; return o; }, {}),
    nTbFights: cap.tbFights.length,
    nFunnelRows: rows.length, nUnattributed: unattributed,
    kinds, rows,
    nCheckCalls: cap.checkCalls.length,
    nHits: cap.checkCalls.filter(c => c.hit).length,
    nDiscoveries: cap.discoveries.length,
    discoveries: cap.discoveries.slice(0, 200),
    monsterCounters: Object.keys(st.monsterCounters || {}),
    nSayBeats: cap.sayBeats.length,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}.json`), JSON.stringify(out, null, 1));

  // Beats + fight summaries: sense-read material.
  const fightSummaries = cap.tbFights
    .filter(t => (t.mids || []).length > 0)
    .map(t => ({
      seq: t.seq, day: t.day, result: t.result, started: t.started,
      fights: (t.mids || []).map(mid => ({
        mid, kind: t.kindByMid[mid] || kindOf(Game, mid),
        knownAtStart: (t.knownAtStart || {})[mid],
        hits: ((t.hits || {})[mid] || []).map(h => ({ ev: h.evType, via: h.via })),
        perfs: (t.perfs || {})[mid] || [],
      })),
      pAlive: t.pAlive,
    }));
  if (cap.sayBeats.length || fightSummaries.length) {
    fs.mkdirSync(BEATS, { recursive: true });
    fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}.json`),
      JSON.stringify({
        beats: cap.sayBeats.slice(0, 800),
        discoveries: cap.discoveries.slice(0, 200),
        fightSummaries: fightSummaries.slice(0, 400),
      }, null, 1));
  }
  console.log(`  [census ${policyId} s${seed}] days=${result.days} end=${result.endReason} maxWave=${maxWave} nat=${national} table=${table} won=${won} tbFights=${cap.tbFights.length} rows=${rows.length} unattr=${unattributed} hits=${out.nHits}/${out.nCheckCalls} discovered=${out.nDiscoveries}`);
  return out;
}

(async () => {
  if (require.main !== module) return;
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      await oneRun(seed, policyId);
    }
  }
  console.log(`\nSWEEP DONE (census) — per-seed JSONs in evidence/2026-10-16/perseed-trickfunnel/.`);
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });

module.exports = { oneRun, policyFor };

#!/usr/bin/env node
// sweep-trickres-20261016.js — the sim-trickres resolution-measurement sweep.
// MEASUREMENT ARM (zero src/js, zero policy changes — scripts/ + evidence/ only).
// Read-only attach to the engine via scripts/trickres-instrument-20261016.js.
//
// Treatment = this tree (the landed counterwire layer). Control = base-commit
// archive via REPO= (af818ee2, parent of the first counterwire game-code commit).
// Identical seeds, policies, env; only the layer differs.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1
//   SEATDRIVE=0 NODEWITNESS=1 SEEDS=981,... POLICIES=leadfeast,belongfeast DAYS=180
//   ARM=treatment REPO=/path/to/base node scripts/sweep-trickres-20261016.js
// REPO defaults to this script's own tree (treatment).
//
// Per-seed JSONs: evidence/2026-10-16/perseed-trickres/<policy>-s<seed>-<arm>.json
// Schema: exact numeric keys national/table/won/exiled (+ wins alias for telemetry-check).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const { attachTrickresCapture } = require('./trickres-instrument-20261016.js');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('SWEEP STOP: NODEWITNESS=1 is required (the witness channel feeds learnings).'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [981]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast']);
const ARM = process.env.ARM || 'treatment';
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-trickres');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-16', 'trickres-beats');

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const scholarVid = (Game) => { try { return (Game.state.scholar || {}).villagerId || 'player'; } catch (e) { return 'player'; } };

function policyFor(policyId) {
  return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
}

async function oneRun(seed, policyId) {
  const policy = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'trickres', fullTelemetry: false });
  await setupGame(Game);
  const cap = attachTrickresCapture(Game);

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  cap.restore();

  const st = Game.state || {};
  const monsterById = {};
  try { for (const m of (Game.data.monsters || [])) monsterById[m.id] = m.wave || 1; } catch (e) {}

  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  const won = !!Game.won ? 1 : 0;
  const fieldDeaths = cap.deaths.filter(d => !d.player).length;
  let trickTally = {};
  try { trickTally = Game._trickTally || {}; } catch (e) {}

  // waveKillLog trick entries — the attribution channel the classifier joins on.
  const waveKillTricks = (st.waveKillLog || []).map(k => ({
    d: k.d, mid: k.mid, w: k.w || monsterById[k.mid] || null,
    by: k.by, via: k.via, trick: k.trick ? String(k.trick).slice(0, 160) : null,
  }));

  const out = {
    seed, policyId, arm: ARM, repo: REPO,
    substrate: 'pre-seat courtship (FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0 explicit, NODEWITNESS=1)',
    days: result.days, endReason: result.endReason,
    national, table, won, wins: won, exiled: 0,
    maxWave, wave3Reached: maxWave >= 3 ? 1 : 0, wave4Reached: maxWave >= 4 ? 1 : 0, wave5Reached: maxWave >= 5 ? 1 : 0,
    deaths: cap.deaths.length, fieldDeaths, playerDeaths: cap.deaths.length - fieldDeaths,
    deathCauses: cap.deaths.reduce((o, d) => { const c = String(d.cause || '?').slice(0, 60); o[c] = (o[c] || 0) + 1; return o; }, {}),
    trickTally,
    nDiscovered: cap.discoveries.length,
    discoveries: cap.discoveries.slice(0, 200),
    nFieldFights: cap.fieldFights.length, nTbFights: cap.tbFights.length,
    fieldFights: cap.fieldFights,
    tbFights: cap.tbFights,
    nWaveKillTricks: waveKillTricks.filter(k => k.trick).length,
    waveKillTricks: waveKillTricks,
    villagerTricks: Object.keys(st.villagerTricks || {}),
    monsterCounters: Object.keys(st.monsterCounters || {}),
    nSayBeats: cap.sayBeats.length,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}-${ARM}.json`), JSON.stringify(out, null, 1));
  // Beats + trick-fight log excerpts: sense-read material.
  const trickFightLogs = cap.fieldFights.filter(f => (f.trickTokens || []).length > 0 && (f.logExcerpt || []).length > 0)
    .slice(0, 40).map(f => ({ day: f.day, mid: f.mid, outcome: f.outcome, tokens: f.trickTokens, log: f.logExcerpt }));
  if (cap.sayBeats.length || trickFightLogs.length) {
    fs.mkdirSync(BEATS, { recursive: true });
    fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}-${ARM}.json`),
      JSON.stringify({ beats: cap.sayBeats.slice(0, 800), trickFightLogs }, null, 1));
  }
  const nTrickFights = cap.fieldFights.filter(f => (f.trickTokens || []).length > 0).length;
  console.log(`  [${ARM} ${policyId} s${seed}] days=${result.days} end=${result.endReason} maxWave=${maxWave} nat=${national} won=${won} fieldFights=${cap.fieldFights.length} trickFights=${nTrickFights} tbFights=${cap.tbFights.length} wkTricks=${waveKillTricks.filter(k => k.trick).length}`);
  return out;
}

(async () => {
  if (require.main !== module) return;
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      await oneRun(seed, policyId);
    }
  }
  console.log(`\nSWEEP DONE (${ARM}) — per-seed JSONs in evidence/2026-10-16/perseed-trickres/.`);
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });

module.exports = { oneRun, policyFor };

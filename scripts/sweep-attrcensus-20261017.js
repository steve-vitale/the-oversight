#!/usr/bin/env node
// sweep-attrcensus-20261017.js — the sim-attrcensus re-sweep (flesh-out loop,
// axis scale-onramp, run fleshout-20261017T1102Z).
//
// MEASUREMENT ONLY: read-only extended fight classifier (zero src/js, zero
// policy changes). Pre-registered in evidence/2026-10-17/sim-attrcensus.md:
// the existing trickfunnel per-seed rows lack per-species fighter mortality
// at tbEnd, and the engine's 'lost' path deliberately forfeits the kill
// ledger — so pyrrhic trick kills are invisible there. This sweep snapshots
// per-mid dead/alive at tbEnd plus the waveKillLog entries, closing the gap.
//
// Substrate (pre-seat courtship — SAME as trickfunnel): FEASTSCALE_R13=1,
// TRIBFLOOR=1, SEATDRIVE=0 explicit (the base tribfloor policies
// leadfeast/belongfeast, untouched). NODEWITNESS unset.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SEATDRIVE=0 \
//     SEEDS=1809,1810,1811,1812 POLICIES=leadfeast,belongfeast DAYS=180 \
//     node scripts/sweep-attrcensus-20261017.js
//
// Per-seed JSONs: evidence/2026-10-17/perseed-attrcensus/<policy>-s<seed>.json
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(ROOT, 'scripts', 'sim-harness'));
const TF = require(path.join(ROOT, 'scripts', 'policies', 'tribfloor'));
const TFUN = require('./trickfunnel-instrument-20261016.js');
const { attachAttrcensusCapture } = require('./attrcensus-instrument-20261017.js');
const { classifyExtended } = require('./attrcensus-classify-20261017.js');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [1809]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast']);
const EVID = path.join(ROOT, 'evidence', '2026-10-17', 'perseed-attrcensus');

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
void gday;

async function oneRun(seed, policyId) {
  const policy = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  const { Game } = await loadGame({ seed, mode: 'attrcensus', fullTelemetry: false });
  await setupGame(Game);
  const cap = attachAttrcensusCapture(Game, TFUN);
  if (!cap.tbfightIntercepted) { console.error('SWEEP STOP: tbfight interception failed.'); process.exit(2); }

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  cap.restore();

  const st = Game.state || {};
  const wkl = st.waveKillLog || [];

  // Fight-level classification: one record per trick-bearing mid with perfs.
  const fights = [];
  const classCounts = {};
  let nPerf = 0, nAttr = 0, nUnattr = 0, nReverse = 0;
  for (const t of cap.tbFights) {
    for (const mid of (t.mids || [])) {
      const perfs = (t.perfs[mid] || []).length;
      const wklSame = wkl
        .filter(k => k.mid === mid && Math.abs((k.d | 0) - (t.day | 0)) <= 1)
        .map(k => ({ d: k.d | 0, trick: k.trick || null, by: k.by || null, via: k.via || null }));
      const killAttributed = wklSame.some(e => e.trick) ? 1 : 0;
      if (perfs > 0) {
        nPerf++;
        if (killAttributed) { nAttr++; continue; }
        nUnattr++;
        const mort = (t.mortality || {})[mid] || { dead: 0, alive: 0 };
        const c = classifyExtended({
          mid: mid, kind: t.kindByMid[mid] || null, day: t.day, result: t.result,
          pAlive: t.pAlive, nPerfs: perfs,
          midDead: mort.dead, midAlive: mort.alive,
          wklSame: wklSame, killAttributed: false,
        });
        classCounts[c.cls] = (classCounts[c.cls] || 0) + 1;
        fights.push({
          seq: t.seq, day: t.day, result: t.result, mid: mid, kind: t.kindByMid[mid] || null,
          nPerfs: perfs, pAlive: t.pAlive === true ? 1 : (t.pAlive === false ? 0 : null),
          midDead: mort.dead, midAlive: mort.alive,
          killAttributed: 0, wklSame: wklSame,
          cls: c.cls, sub: c.sub, note: c.note,
        });
      } else if (killAttributed) {
        // c1 reverse-artifact: attributed with zero perfs (join over-attribution).
        nReverse++;
        fights.push({
          seq: t.seq, day: t.day, result: t.result, mid: mid, kind: t.kindByMid[mid] || null,
          nPerfs: 0, pAlive: t.pAlive === true ? 1 : (t.pAlive === false ? 0 : null),
          midDead: ((t.mortality || {})[mid] || {}).dead | 0, midAlive: ((t.mortality || {})[mid] || {}).alive | 0,
          killAttributed: 1, wklSame: wklSame,
          cls: 'c1', sub: 'reverse-artifact', note: 'kill attributed with zero perfs — ±1d join over-attribution',
        });
      }
    }
  }

  // Wall metrics (telemetry-check schema).
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const won = !!Game.won ? 1 : 0;

  const out = {
    seed: seed, policyId: policyId, arm: 'attrcensus',
    substrate: 'pre-seat courtship (FEASTSCALE_R13=1 TRIBFLOOR=1, SEATDRIVE=0 explicit; NODEWITNESS unset)',
    days: result.days, endReason: result.endReason,
    national: national, table: table, won: won, wins: won, exiled: 0,
    nTbFights: cap.tbFights.length,
    nPerf: nPerf, nAttr: nAttr, nUnattr: nUnattr, nReverse: nReverse,
    classCounts: classCounts,
    fights: fights,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}.json`), JSON.stringify(out, null, 1));
  console.log(JSON.stringify({ policy: policyId, seed: seed, days: result.days, end: result.endReason,
    tbFights: cap.tbFights.length, perf: nPerf, attr: nAttr, unattr: nUnattr, reverse: nReverse,
    classes: classCounts, national: national, table: table, won: won }));
  return out;
}

(async () => {
  if (require.main !== module) return;
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      await oneRun(seed, policyId);
    }
  }
  console.log('\nSWEEP DONE (attrcensus) — per-seed JSONs in evidence/2026-10-17/perseed-attrcensus/.');
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });

module.exports = { oneRun: oneRun };

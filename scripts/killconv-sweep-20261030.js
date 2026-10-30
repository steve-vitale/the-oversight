#!/usr/bin/env node
// killconv-sweep-20261030.js — sim-killconv-a measurement sweep.
//
// 8-seed pilot (85101-85108), extendable to 16 (85109-85116), 200d
// death-aware cap, on the competent scale-push stack:
//   withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast)))
// + KILLCONV v1 read-only instrument. Single-base measurement: every
// number is freshly measured on this worktree's base; no old bank is
// quoted as current.
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-30/perseed-killconv/leadfeast/s<seed>.json and prints
// a summary. No timestamps or timings are written, so re-runs are
// byte-comparable (fight ids are never persisted — see the instrument
// header; transcript snapshots are narration text, re-run identical).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 KILLCONV=1 \
//   SEEDS=85101,85102 node scripts/killconv-sweep-20261030.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const KC = require(path.join(REPO, 'scripts', 'killconv-instrument-20261030'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'KILLCONV']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
if (!WD.layerOn()) { console.error('SWEEP STOP: windefer layerOn() false despite WINDEFER=1.'); process.exit(2); }
if (!SD.layerOn()) { console.error('SWEEP STOP: seatdrive layerOn() false despite SEATDRIVE=1.'); process.exit(2); }
if (!FD.layerOn()) { console.error('SWEEP STOP: fullseat-diag layerOn() false despite FULLSEAT=1.'); process.exit(2); }
if (!KC.instrumentOn()) { console.error('SWEEP STOP: KILLCONV instrument off despite KILLCONV=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [85101, 85102, 85103, 85104, 85105, 85106, 85107, 85108]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '200', 10) || 200;
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-30', 'perseed-killconv');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers (WINPURSUIT=1 + WINDEFER=1)');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive (SEATDRIVE=1)');
  return FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder (FULLSEAT=1)');
}

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'killconv', fullTelemetry: false });
  const t = { kills: [], engagements: [], fieldFights: [], spawns: [], tbOutcomes: {}, census: [], transcripts: [], instrumentErrors: [] };
  const uninstall = KC.install(Game, t);

  await setupGame(Game);
  let result;
  const hashes = [];
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm));
      return policy.daily(Gm, ctx);
    },
  });
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  const end = KC.snapshotEnd(Game);

  const st = Game.state || {};
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  // Census-derived bar trajectory.
  let w4Day = null, w5Day = null, peakR4 = 0, peakR5 = 0, firstR4Day = null, firstR5Day = null;
  for (const c of t.census) {
    if ((c.uw | 0) >= 4 && w4Day === null) w4Day = c.day;
    if ((c.uw | 0) >= 5 && w5Day === null) w5Day = c.day;
    const v4 = c.r4 ? (c.r4.veterans | 0) : 0;
    const v5 = c.r5 ? (c.r5.veterans | 0) : 0;
    if (v4 > peakR4) peakR4 = v4;
    if (v5 > peakR5) peakR5 = v5;
    if (v4 >= 1 && firstR4Day === null) firstR4Day = c.day;
    if (v5 >= 2 && firstR5Day === null) firstR5Day = c.day;
  }

  const kills3 = t.kills.filter(k => (k.wave | 0) >= 3).sort((a, b) => a.day - b.day);
  const kills4 = t.kills.filter(k => (k.wave | 0) >= 4).sort((a, b) => a.day - b.day);
  const ff4 = t.fieldFights.filter(f => (f.wave | 0) >= 4).sort((a, b) => a.day - b.day);
  const sp4 = t.spawns.filter(s => (s.wave | 0) >= 4).sort((a, b) => a.day - b.day);
  const sp3 = t.spawns.filter(s => (s.wave | 0) === 3);
  const tb4 = [];
  for (const e of t.engagements) {
    if ((e.wave | 0) < 4) continue;
    const endOutcome = e.fightId ? (t.tbOutcomes[e.fightId] || null) : null;
    tb4.push({ day: e.day, mid: e.mid, wave: e.wave, started: !!e.started, end: endOutcome });
  }  tb4.sort((a, b) => a.day - b.day);

  // Death-cause shares from the harness sampler (raw rows kept for audit).
  let deaths = [];
  try { deaths = ((result.samples || {}).deaths || []).slice(); } catch (e) {}

  const out = {
    seed, policyId: 'leadfeast', instrument: 'killconv-v1',
    substrate: 'withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))), FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 + KILLCONV=1',
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    w4Day, w5Day,
    national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    peakR4Veterans: peakR4, peakR5Veterans: peakR5,
    r4BarReached: peakR4 >= 1 ? 1 : 0, r5BarReached: peakR5 >= 2 ? 1 : 0,
    firstR4Day, firstR5Day,
    endReadiness4: end.readiness4, endReadiness5: end.readiness5,
    endScaleRank: end.scaleRank, endTableWaiting: end.tableWaiting, endTableDone: end.tableDone,
    endDeedGateOk: end.deedGateOk, endWon: end.won, endVillageLost: end.villageLost,
    kills3Count: kills3.length, kills4Count: kills4.length,
    ff4Count: ff4.length, tb4Count: tb4.length, sp4Count: sp4.length,
    sp4VeteranCount: sp4.filter(s => s.veteran).length,
    sp3Count: sp3.length, sp3VeteranCount: sp3.filter(s => s.veteran).length,
    kills: kills3, fieldFights: ff4, tb: tb4, spawns: sp4,
    endWaveKillLog: end.waveKillLog, endLiving: end.living, endRoster: end.roster, endScholarVid: end.scholarVid,
    census: t.census,
    transcripts: t.transcripts,
    deaths,
    hashes,
    instrumentErrors: t.instrumentErrors,
  };
  const dir = path.join(EVID, 'leadfeast');
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, `s${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1) + '\n');
  return out;
}

(async () => {
  for (const seed of SEEDS) {
    try {
      const r = await oneRun(seed);
      console.log(`done s${seed}: maxWave=${r.maxWave} w4Day=${r.w4Day} w5Day=${r.w5Day} peakR5=${r.peakR5Veterans} kills4=${r.kills4Count} ff4=${r.ff4Count} tb4=${r.tb4Count} sp4=${r.sp4Count} nat=${r.national} table=${r.table} won=${r.won} end=${r.endReason} days=${r.gameDays} errs=${r.instrumentErrors.length}`);
    } catch (e) {
      console.error(`ERROR s${seed}: ${e && e.message}`);
      console.error(e && e.stack);
    }
  }
})();

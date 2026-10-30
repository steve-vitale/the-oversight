#!/usr/bin/env node
// w4party-sweep-20261030.js — sim-w4party-a measurement sweep.
//
// 8-seed pilot (85101-85108), extendable to 16 (85109-85116), 200d
// death-aware cap, on the competent scale-push stack:
//   withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast)))
// + W4PARTY v1 read-only instrument. Single-base measurement on the
// SAME seeds/policy as sim-killconv-a, so per-seed meeting counts
// must reproduce killconv's (pilot ff4: 0,0,1,0,0,4,1,0) — a
// mismatch voids the band (prereg INSUFFICIENT-DATA rule).
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-30/perseed-w4party/leadfeast/s<seed>.json and
// prints a summary. No timestamps or timings are written, so re-runs
// are byte-comparable (fight ids are never persisted; meeting logs
// are engine text, re-run identical).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 W4PARTY=1 \
//   SEEDS=85101,85102 node scripts/w4party-sweep-20261030.js
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
const WP = require(path.join(REPO, 'scripts', 'w4party-instrument-20261030'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'W4PARTY']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
if (!WD.layerOn()) { console.error('SWEEP STOP: windefer layerOn() false despite WINDEFER=1.'); process.exit(2); }
if (!SD.layerOn()) { console.error('SWEEP STOP: seatdrive layerOn() false despite SEATDRIVE=1.'); process.exit(2); }
if (!FD.layerOn()) { console.error('SWEEP STOP: fullseat-diag layerOn() false despite FULLSEAT=1.'); process.exit(2); }
if (!WP.instrumentOn()) { console.error('SWEEP STOP: W4PARTY instrument off despite W4PARTY=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [85101, 85102, 85103, 85104, 85105, 85106, 85107, 85108]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '200', 10) || 200;
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-30', 'perseed-w4party');
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
  const t = { meetings: [], tbFights: [], tbOutcomes: {}, instrumentErrors: [] };
  const uninstall = WP.install(Game, t);

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
  // Post-run wall reads (after uninstall; pure reads).
  const st = Game.state || {};
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}
  let deaths = [];
  try { deaths = ((result.samples || {}).deaths || []).slice(); } catch (e) {}

  const meetings = (t.meetings || []).sort((a, b) => a.day - b.day);
  const tb = (t.tbFights || []).sort((a, b) => a.day - b.day);
  const out = {
    seed, policyId: 'leadfeast', instrument: 'w4party-v1',
    substrate: 'withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))), FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 + W4PARTY=1',
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    ff4Count: meetings.length,
    ff4Kills: meetings.filter(m => m.outcome === 'vKill').length,
    tb4Count: tb.filter(x => x.started).length,
    tb4Started: tb.filter(x => x.started).length,
    meetings, tbFights: tb,
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
      console.log(`done s${seed}: maxWave=${r.maxWave} ff4=${r.ff4Count} ff4Kills=${r.ff4Kills} tb4started=${r.tb4Started} nat=${r.national} table=${r.table} won=${r.won} end=${r.endReason} days=${r.gameDays} errs=${r.instrumentErrors.length}`);
    } catch (e) {
      console.error(`ERROR s${seed}: ${e && e.message}`);
      console.error(e && e.stack);
    }
  }
})();

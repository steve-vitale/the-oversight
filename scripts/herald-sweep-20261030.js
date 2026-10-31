#!/usr/bin/env node
// herald-sweep-20261030.js — sim-herald-b measurement sweep.
//
// 8-seed pilot (85101-85108), extendable to 16 (85109-85116), 200d
// death-aware cap, on the competent scale-push stack:
//   withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast)))
// + HERALD v1 read-only instrument. Single-base measurement: every
// number is freshly measured on this worktree's base; no old bank is
// quoted as current.
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-31/perseed-herald/leadfeast/s<seed>.json and prints
// a summary. No timestamps or timings are written, and fight ids are
// never persisted, so re-runs are byte-comparable.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 \
//   SEEDS=85101,85102 node scripts/herald-sweep-20261030.js
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
const HI = require(path.join(REPO, 'scripts', 'herald-instrument-20261030'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
if (!WD.layerOn()) { console.error('SWEEP STOP: windefer layerOn() false despite WINDEFER=1.'); process.exit(2); }
if (!SD.layerOn()) { console.error('SWEEP STOP: seatdrive layerOn() false despite SEATDRIVE=1.'); process.exit(2); }
if (!FD.layerOn()) { console.error('SWEEP STOP: fullseat-diag layerOn() false despite FULLSEAT=1.'); process.exit(2); }
if (!HI.instrumentOn()) { console.error('SWEEP STOP: HERALD instrument off despite HERALD=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [85101, 85102, 85103, 85104, 85105, 85106, 85107, 85108]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '200', 10) || 200;
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-31', 'perseed-herald');
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
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  const t = { attempts: [], tbOutcomes: {}, fieldFights: [], kills: [], musterEvents: [], census: [], transcripts: [], instrumentErrors: [] };
  const uninstall = HI.install(Game, t);

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

  const st = Game.state || {};
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  let w4Day = null, w5Day = null;
  for (const c of t.census) {
    if ((c.uw | 0) >= 4 && w4Day === null) w4Day = c.day;
    if ((c.uw | 0) >= 5 && w5Day === null) w5Day = c.day;
  }

  // tbEnd outcomes as an id-free list (day/mid/result), joined to FOUGHT
  // attempts in order per (day, mid) so each fought attempt carries its
  // own end result without persisting any fight id.
  const tbList = Object.keys(t.tbOutcomes).map(k => t.tbOutcomes[k]).filter(v => v && v.mid).sort((a, b) => (a.day - b.day) || String(a.mid).localeCompare(String(b.mid)));
  const tbQueue = {};
  tbList.forEach(v => { const k = v.day + '|' + v.mid; (tbQueue[k] = tbQueue[k] || []).push(v.result); });
  const attempts4 = [];
  let attemptsOther = 0, attemptsUnresolvedMid = 0;
  for (const a of t.attempts) {
    if (!a.mid) { attemptsUnresolvedMid++; continue; }
    if ((a.wave | 0) < 4) { attemptsOther++; continue; }
    const row = Object.assign({}, a);
    if (row.cls === 'FOUGHT') {
      const k = row.day + '|' + row.mid;
      row.end = (tbQueue[k] && tbQueue[k].length) ? tbQueue[k].shift() : null;
    } else row.end = null;
    attempts4.push(row);
  }
  attempts4.sort((a, b) => a.day - b.day);

  let deaths = [];
  try { deaths = ((result.samples || {}).deaths || []).slice(); } catch (e) {}

  const out = {
    seed, policyId: 'leadfeast', instrument: 'herald-v1',
    substrate: 'withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))), FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 + HERALD=1',
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    w4Day, w5Day,
    national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    endScaleRank: (function () { try { return Game.scaleRank ? Game.scaleRank() : null; } catch (e) { return null; } })(),
    attempts4Count: attempts4.length, attemptsOtherCount: attemptsOther, attemptsUnresolvedMidCount: attemptsUnresolvedMid,
    fieldFights4Count: t.fieldFights.length, kills4Count: t.kills.length,
    attempts: attempts4, fieldFights: t.fieldFights, kills: t.kills,
    musterEvents: t.musterEvents, census: t.census,
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
      const att = r.attempts;
      const fought = att.filter(a => a.cls === 'FOUGHT').length;
      const refused = att.filter(a => a.cls === 'REFUSED').length;
      const herald = att.filter(a => a.mid === 'herald');
      console.log(`done s${seed}: maxWave=${r.maxWave} w4Day=${r.w4Day} w5Day=${r.w5Day} att4=${att.length} fought=${fought} refused=${refused} herald=${herald.length} ff4=${r.fieldFights4Count} kills4=${r.kills4Count} nat=${r.national} table=${r.table} won=${r.won} end=${r.endReason} days=${r.gameDays} errs=${r.instrumentErrors.length}`);
    } catch (e) {
      console.error(`ERROR s${seed}: ${e && e.message}`);
      console.error(e && e.stack);
    }
  }
})();

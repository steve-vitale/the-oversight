#!/usr/bin/env node
// wave3enc-sweep-20261031.js — sim-wave3enc-a encounter census sweep.
//
// Win-pursuit stack (identical to wavegate) + the NEW wave3enc-diag
// recorder (WAVE3ENC=1). DIAG ONLY: no game change, no policy edit,
// no muster verb, no call, no button press — the recorder is pure
// reads + post-delegation event recording (see wave3enc-diag.js).
// WAVEGATE=0/absent runs the identical stack WITHOUT the recorder
// (the det-gate's OFF leg); WAVE3ENC=1 wraps the recorder OUTSIDE
// fullseat-diag.
//
// I/O DISCIPLINE (prior-run lesson): a game-loaded process cannot
// reliably write files (the frozen clock makes retry sleeps return
// instantly). So this sweep writes NOTHING itself: it prints ONE
// JSON line per seed to stdout (progress goes to stderr), and the
// separate idle splitter (scripts/wave3enc-split-20261031.js) reads
// the stdout file and writes the per-seed JSONs with a resilient
// writer. Run in a single FOREGROUND exec with stdout/stderr
// redirected to files; never a backgrounded pipe.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 WAVE3ENC=1 \
//   SEEDS=<list> node scripts/wave3enc-sweep-20261031.js > out.jsonl 2> out.err
'use strict';
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const WE = require(path.join(REPO, 'scripts', 'policies', 'wave3enc-diag'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
if (!WD.layerOn()) { console.error('SWEEP STOP: windefer layerOn() false despite WINDEFER=1.'); process.exit(2); }
if (!SD.layerOn()) { console.error('SWEEP STOP: seatdrive layerOn() false despite SEATDRIVE=1.'); process.exit(2); }
if (!FD.layerOn()) { console.error('SWEEP STOP: fullseat-diag layerOn() false despite FULLSEAT=1.'); process.exit(2); }
const WAVE3ENC_ON = process.env.WAVE3ENC === '1';
if (WAVE3ENC_ON && !WE.layerOn()) { console.error('SWEEP STOP: wave3enc-diag layerOn() false despite WAVE3ENC=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '200', 10) || 200;
if (!SEEDS.length) { console.error('SWEEP STOP: SEEDS is empty.'); process.exit(2); }

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers (WINPURSUIT=1 + WINDEFER=1)');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive (SEATDRIVE=1)');
  const fd = FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder (FULLSEAT=1)');
  if (!WAVE3ENC_ON) return fd;
  return WE.withWave3encDiag(fd, 'lead-wave3enc', 'leadfeast + wave-3 encounter recorder (WAVE3ENC=1)');
}

async function oneRun(seed) {
  const policy = policyFor();
  const store = policy.wave3encStore || null;
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  if (store) WE.installWave3encDiag(Game, store);
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
  // Post-run engine cross-checks (trajectory-free: the run is over).
  let engineFinalUw = null, engineFinalStanding = null;
  try { engineFinalUw = (typeof Game.unlockedWave === 'function') ? (Game.unlockedWave() | 0) : null; } catch (e) {}
  try { engineFinalStanding = (typeof Game.villageStandingTotal === 'function') ? (Game.villageStandingTotal() | 0) : null; } catch (e) {}
  try { if (store && Game._wave3encUninstall) Game._wave3encUninstall(); } catch (e) {}

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
  const killLog = WE.copyKillLog(Game);

  const out = {
    seed, policyId: 'leadfeast', instrument: WAVE3ENC_ON ? 'wave3enc-v1' : 'wave3enc-off',
    substrate: 'withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))), FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1' + (WAVE3ENC_ON ? ' + WAVE3ENC=1' : ''),
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    endScaleRank: (function () { try { return Game.scaleRank ? Game.scaleRank() : null; } catch (e) { return null; } })(),
    engineFinalUw, engineFinalStanding,
    daily: store ? store.daily : [],
    fieldFights: store ? store.fieldFights : [],
    tbFights: store ? store.tbFights : [],
    killEvents: store ? store.killEvents : [],
    spawns: store ? store.spawns : [],
    sayLines: store ? store.sayLines : [],
    killLog,
    recorderErrs: store ? store.errs : 0,
    recorderErrors: store ? store.errors : [],
    recorderOverflow: store ? store.overflow : {},
    deaths,
    hashes,
  };
  return out;
}

(async () => {
  for (const seed of SEEDS) {
    try {
      const r = await oneRun(seed);
      console.log(JSON.stringify(r));
      console.error(`done s${seed}: daily=${(r.daily || []).length} ff=${(r.fieldFights || []).length} tb=${(r.tbFights || []).length} kills=${(r.killEvents || []).length} spawns=${(r.spawns || []).length} engineUw=${r.engineFinalUw} maxWave=${r.maxWave} nat=${r.national} table=${r.table} won=${r.won} end=${r.endReason} days=${r.gameDays} rank=${r.endScaleRank} errs=${r.recorderErrs}`);
    } catch (e) {
      console.error(`ERROR s${seed}: ${e && e.message}`);
      console.error(e && e.stack);
    }
  }
})();

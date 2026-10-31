#!/usr/bin/env node
// regtable-sweep-20261031.js — sim-regtable-a stdout sweep.
//
// Win-pursuit stack + fullseat-diag + wavegate-diag (base stack,
// identical to sim-wavegate-a) + the NEW regtable-diag recorder
// (REGTABLE=1), which wraps OUTSIDE wavegate-diag and records the
// seat the engine prices each day (full / lesser / none), the full
// gate's components, the rank, and the table flags.
//
// DIAG ONLY: no game change, no policy edit, no muster verb, no call,
// no button press — both recorders are pure reads.
//
// STDOUT RUNNER (prior-run lesson): the game-loaded process writes NO
// files — it prints exactly ONE JSON line per seed to stdout. A
// separate idle process (scripts/regtable-split-20261031.js, no game
// loaded) turns the stdout file into per-seed JSONs. Run as, in a
// foreground exec (never a backgrounded pipe):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 \
//   FULLSEAT=1 WAVEGATE=1 REGTABLE=1 SEEDS=<list> \
//   node scripts/regtable-sweep-20261031.js \
//   > evidence/2026-10-31/regtable-stdout-<tag>.jsonl \
//   2> evidence/2026-10-31/regtable-stderr-<tag>.log
// then: node scripts/regtable-split-20261031.js <jsonl> <outdir>
// For the det OFF leg, omit REGTABLE (wavegate stays ON in both legs).
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
const WG = require(path.join(REPO, 'scripts', 'policies', 'wavegate-diag'));
const RT = require(path.join(REPO, 'scripts', 'policies', 'regtable-diag'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'WAVEGATE']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false.'); process.exit(2); }
if (!WD.layerOn()) { console.error('SWEEP STOP: windefer layerOn() false.'); process.exit(2); }
if (!SD.layerOn()) { console.error('SWEEP STOP: seatdrive layerOn() false.'); process.exit(2); }
if (!FD.layerOn()) { console.error('SWEEP STOP: fullseat-diag layerOn() false.'); process.exit(2); }
if (!WG.layerOn()) { console.error('SWEEP STOP: wavegate-diag layerOn() false.'); process.exit(2); }
const REGTABLE_ON = process.env.REGTABLE === '1';
if (REGTABLE_ON && !RT.layerOn()) { console.error('SWEEP STOP: regtable-diag layerOn() false despite REGTABLE=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '200', 10) || 200;

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive');
  const fd = FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder');
  const wg = WG.withWavegateDiag(fd, 'lead-wavegate', 'leadfeast + wave-unlock gate decomposition recorder');
  if (!REGTABLE_ON) return wg;
  return RT.withRegtableDiag(wg, 'lead-regtable', 'leadfeast + regional-table seat recorder');
}

async function oneRun(seed) {
  const policy = policyFor();
  // The regtable wrapper copies the inner policy's props via
  // Object.assign, so policy.wavegateStore is present when regtable
  // wraps wavegate.
  const wgStore2 = policy.wavegateStore || null;
  const rtStore = policy.regtableStore || null;
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  // Install say captures OUTSIDE-in: wavegate first, then regtable, so
  // regtable's wrapper calls wavegate's wrapper calls the original.
  if (wgStore2) WG.installSayCapture(Game, wgStore2);
  if (rtStore) RT.installSayCapture(Game, rtStore);
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
  let engineFinalUw = null;
  try { engineFinalUw = (typeof Game.unlockedWave === 'function') ? (Game.unlockedWave() | 0) : null; } catch (e) {}
  // Uninstall in reverse order: regtable first, then wavegate.
  try { if (rtStore) RT.uninstallSayCapture(Game, rtStore); } catch (e) {}
  try { if (wgStore2) WG.uninstallSayCapture(Game, wgStore2); } catch (e) {}

  const st = Game.state || {};
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}
  let endOmenStage = null;
  try {
    const tit = st.titans || {};
    const om = tit.omens ? tit.omens.herald : null;
    if (om) endOmenStage = (om.stage != null ? om.stage : null);
  } catch (e) {}
  let deaths = [];
  try { deaths = ((result.samples || {}).deaths || []).slice(); } catch (e) {}

  const wgRows = wgStore2 ? wgStore2.rows : [];
  const lastWg = wgRows.length ? wgRows[wgRows.length - 1] : null;
  const rtRows = rtStore ? rtStore.rows : [];
  const out = {
    seed, policyId: 'leadfeast',
    instrument: REGTABLE_ON ? 'regtable-v1+wavegate-v1' : 'regtable-off+wavegate-v1',
    substrate: 'withRegtableDiag(withWavegateDiag(withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))))), FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 WAVEGATE=1' + (REGTABLE_ON ? ' + REGTABLE=1' : ''),
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    endScaleRank: (function () { try { return Game.scaleRank ? Game.scaleRank() : null; } catch (e) { return null; } })(),
    endOmenStage,
    derivedFinalUw: lastWg ? lastWg.uw : null,
    engineFinalUw,
    wavegateRows: wgRows,
    wavegateBeats: wgStore2 ? wgStore2.beats : [],
    wavegateErrs: wgStore2 ? wgStore2.errs : 0,
    rows: rtRows,
    beats: rtStore ? rtStore.beats : [],
    recorderErrs: rtStore ? rtStore.errs : 0,
    deaths,
    hashes,
  };
  return out;
}

(async () => {
  for (const seed of SEEDS) {
    try {
      const r = await oneRun(seed);
      // ONE JSON line per seed to stdout. Nothing else goes to stdout.
      process.stdout.write(JSON.stringify(r) + '\n');
      console.error(`done s${seed}: rows=${(r.rows || []).length} wgrows=${(r.wavegateRows || []).length} maxWave=${r.maxWave} nat=${r.national} table=${r.table} won=${r.won} end=${r.endReason} days=${r.gameDays} rank=${r.endScaleRank} errs=${r.recorderErrs} wgerrs=${r.wavegateErrs}`);
    } catch (e) {
      console.error(`ERROR s${seed}: ${e && e.message}`);
      console.error(e && e.stack);
    }
  }
})();

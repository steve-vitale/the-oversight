#!/usr/bin/env node
// wavegate-sweep-20261031.js — sim-wavegate-a gate-decomposition sweep.
//
// Win-pursuit stack + fullseat-diag (base stack, identical to the
// heraldcontact stack) + the NEW wavegate-diag recorder (WAVEGATE=1).
// DIAG ONLY: no game change, no policy edit, no muster verb, no call,
// no button press — the recorder is pure reads (see wavegate-diag.js).
// WAVEGATE=0/absent runs the identical stack WITHOUT the recorder
// (the det-gate's OFF leg); WAVEGATE=1 wraps the recorder OUTSIDE
// fullseat-diag.
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-31/perseed-wavegate/leadfeast/s<seed>.json
// (EVID env overrides for det scratch runs). No timestamps, so
// re-runs are byte-comparable.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 WAVEGATE=1 \
//   SEEDS=<list> node scripts/wavegate-sweep-20261031.js
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
const WG = require(path.join(REPO, 'scripts', 'policies', 'wavegate-diag'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
if (!WD.layerOn()) { console.error('SWEEP STOP: windefer layerOn() false despite WINDEFER=1.'); process.exit(2); }
if (!SD.layerOn()) { console.error('SWEEP STOP: seatdrive layerOn() false despite SEATDRIVE=1.'); process.exit(2); }
if (!FD.layerOn()) { console.error('SWEEP STOP: fullseat-diag layerOn() false despite FULLSEAT=1.'); process.exit(2); }
const WAVEGATE_ON = process.env.WAVEGATE === '1';
if (WAVEGATE_ON && !WG.layerOn()) { console.error('SWEEP STOP: wavegate-diag layerOn() false despite WAVEGATE=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '200', 10) || 200;
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-31', 'perseed-wavegate');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers (WINPURSUIT=1 + WINDEFER=1)');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive (SEATDRIVE=1)');
  const fd = FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder (FULLSEAT=1)');
  if (!WAVEGATE_ON) return fd;
  return WG.withWavegateDiag(fd, 'lead-wavegate', 'leadfeast + wave-unlock gate decomposition recorder (WAVEGATE=1)');
}

async function oneRun(seed) {
  const policy = policyFor();
  const store = policy.wavegateStore || null;
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  if (store) WG.installSayCapture(Game, store);
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
  try { if (store) WG.uninstallSayCapture(Game, store); } catch (e) {}

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

  const rows = store ? store.rows : [];
  const lastRow = rows.length ? rows[rows.length - 1] : null;
  const out = {
    seed, policyId: 'leadfeast', instrument: WAVEGATE_ON ? 'wavegate-v1' : 'wavegate-off',
    substrate: 'withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))), FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1' + (WAVEGATE_ON ? ' + WAVEGATE=1' : ''),
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    endScaleRank: (function () { try { return Game.scaleRank ? Game.scaleRank() : null; } catch (e) { return null; } })(),
    endOmenStage,
    derivedFinalUw: lastRow ? lastRow.uw : null,
    derivedFinalGated: lastRow ? lastRow.gated : null,
    engineFinalUw, engineFinalStanding,
    rows, beats: store ? store.beats : [],
    recorderErrs: store ? store.errs : 0,
    deaths,
    hashes,
  };
  const dir = path.join(EVID, 'leadfeast');
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, `s${seed}.json`);
  // Resilient write (resume 2026-10-31): the container EPERM flap
  // intermittently denies write(2) AFTER creating a 0-byte file —
  // it killed the det OFF leg 4x in a row (worktree AND /tmp) and
  // then held for 18+ minutes. The sim result is already computed
  // at this point, so retrying the post-run write cannot move any
  // trajectory; it only saves the computed JSON. The window is
  // deliberately long (180 x 10s = 30 min): the flap is
  // time-varying, and a computed 200-day sim must not be thrown
  // away for a 60-second write window. Loud failure after the
  // window, never a silent 0-byte file left standing as data (a
  // 0-byte result is deleted before throwing so a later retry
  // starts clean).
  const payload = JSON.stringify(out, null, 1) + '\n';
  let written = false, lastErr = null;
  for (let attempt = 1; attempt <= 180 && !written; attempt++) {
    try {
      fs.writeFileSync(fp, payload);
      const sz = fs.statSync(fp).size;
      if (sz > 0 && sz === Buffer.byteLength(payload)) written = true;
      else lastErr = new Error(`short write: ${sz} of ${Buffer.byteLength(payload)} bytes`);
    } catch (e) { lastErr = e; }
    if (!written) {
      if (attempt % 10 === 0) console.log(`  write s${seed} still waiting out flap (attempt ${attempt}, last: ${lastErr && lastErr.message})`);
      if (attempt < 180) { try { execSync('sleep 10'); } catch (e) {} }
    }
  }
  if (!written) { try { fs.unlinkSync(fp); } catch (e) {} throw lastErr || new Error('write failed'); }
  return out;
}

(async () => {
  for (const seed of SEEDS) {
    try {
      const r = await oneRun(seed);
      const rows = r.rows || [];
      const last = rows.length ? rows[rows.length - 1] : {};
      console.log(`done s${seed}: rows=${rows.length} derivedUw=${r.derivedFinalUw} engineUw=${r.engineFinalUw} gated=${r.derivedFinalGated} engineStanding=${r.engineFinalStanding} maxWave=${r.maxWave} nat=${r.national} table=${r.table} won=${r.won} end=${r.endReason} days=${r.gameDays} rank=${r.endScaleRank} omen=${r.endOmenStage} beats=${(r.beats || []).length} errs=${r.recorderErrs}`);
    } catch (e) {
      console.error(`ERROR s${seed}: ${e && e.message}`);
      console.error(e && e.stack);
    }
  }
})();

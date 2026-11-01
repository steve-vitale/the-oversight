#!/usr/bin/env node
// s87135traj-sweep.js — seed-87135 trajectory reproduction for sim-s87135-traj-a.
//
// Same policy stack as the 0515Z contact-finish confirm, PLUS the traj
// recorder (S87135TRAJ=1, pure reads) wrapped OUTSIDE the contactfinish
// recorder. DIAG ONLY: no game change. The two legs differ ONLY by
// src/js/fieldFights.js (rule ON = HEAD version; rule OFF = pre-rule blob
// swapped in by the coordinator, restored from backup afterwards).
//
// Usage (single FOREGROUND exec, stdout/stderr redirected):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 CONTACTFINISH=1 S87135TRAJ=1 \
//   SEEDS=87135 OUTDIR=<dir> node scripts/s87135traj-sweep.js 2> out.err
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const WE = require(path.join(REPO, 'scripts', 'policies', 'contactfinish-diag'));
const TJ = require(path.join(REPO, 'scripts', 'policies', 's87135traj-diag'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'CONTACTFINISH', 'S87135TRAJ']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required.`); process.exit(2); }
}
for (const [mod, name] of [[TF, 'tribfloor'], [WD, 'windefer'], [SD, 'seatdrive'], [FD, 'fullseat-diag'], [WE, 'contactfinish-diag'], [TJ, 's87135traj-diag']]) {
  if (!mod.layerOn()) { console.error(`SWEEP STOP: ${name} layerOn() false despite env=1.`); process.exit(2); }
}
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
  const cf = WE.withContactfinishDiag(fd, 'lead-contactfinish', 'leadfeast + spike/contact encounter recorder (CONTACTFINISH=1)');
  return TJ.withS87135TrajDiag(cf, 'lead-s87135traj', 'leadfeast + contactfinish + traj snapshot recorder (S87135TRAJ=1)');
}

async function oneRun(seed) {
  const policy = policyFor();
  const store = policy.contactfinishStore || null;
  const tstore = policy.s87135trajStore || null;
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  if (store) WE.installContactfinishDiag(Game, store);
  if (tstore) TJ.installS87135TrajTick(Game, tstore);
  await setupGame(Game);
  let result;
  const hashes = [];
  let seatSeen = null, fullSeatEver = 0, firstFullSeatDay = null;
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm));
      const r = policy.daily(Gm, ctx);
      try {
        const D = ctx && ctx._fullseatdiag;
        if (D) {
          seatSeen = D.bestSeat || seatSeen;
          if (D.seats && (D.seats.full | 0) > 0) fullSeatEver = 1;
          if (D.firstFullSeatDay != null && firstFullSeatDay == null) firstFullSeatDay = D.firstFullSeatDay;
        }
      } catch (e) {}
      return r;
    },
  });
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  let engineFinalUw = null, engineFinalStanding = null;
  try { engineFinalUw = (typeof Game.unlockedWave === 'function') ? (Game.unlockedWave() | 0) : null; } catch (e) {}
  try { engineFinalStanding = (typeof Game.villageStandingTotal === 'function') ? (Game.villageStandingTotal() | 0) : null; } catch (e) {}
  try { if (store && Game._contactfinishUninstall) Game._contactfinishUninstall(); } catch (e) {}

  const st = Game.state || {};
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  return {
    seed, policyId: 'leadfeast', instrument: 'contactfinish-v1+s87135traj-v1',
    substrate: 'withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))), FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 + CONTACTFINISH=1 + S87135TRAJ=1',
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won,
    bestSeat: seatSeen, fullSeat: fullSeatEver, firstFullSeatDay,
    days: result.days, gameDays, endReason: result.endReason,
    endScaleRank: (function () { try { return Game.scaleRank ? Game.scaleRank() : null; } catch (e) { return null; } })(),
    engineFinalUw, engineFinalStanding,
    daily: store ? store.daily : [],
    fieldFights: store ? store.fieldFights : [],
    tbFights: store ? store.tbFights : [],
    killEvents: store ? store.killEvents : [],
    pyrrhicEvents: store ? store.pyrrhicEvents : [],
    spawns: store ? store.spawns : [],
    sayLines: store ? store.sayLines : [],
    killLog: WE.copyKillLog(Game),
    recorderErrs: store ? store.errs : 0,
    recorderErrors: store ? store.errors : [],
    recorderOverflow: store ? store.overflow : {},
    trajSnaps: tstore ? tstore.snaps : [],
    trajTicks: tstore ? tstore.ticks : [],
    trajErrs: tstore ? tstore.errs : 0,
    trajErrors: tstore ? tstore.errors : [],
    deaths: ((result.samples || {}).deaths || []).slice(),
    hashes,
  };
}

function _sleepSync(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {}
}
function _writeResilient(fp, payload) {
  let lastErr = null;
  for (let attempt = 1; attempt <= 180; attempt++) {
    try {
      fs.writeFileSync(fp, payload);
      const sz = fs.statSync(fp).size;
      if (sz > 0 && sz === Buffer.byteLength(payload)) return true;
      lastErr = new Error('short write: ' + sz + ' of ' + Buffer.byteLength(payload) + ' bytes');
    } catch (e) { lastErr = e; }
    if (attempt % 10 === 0) console.error('  write waiting out flap (attempt ' + attempt + ', last: ' + (lastErr && lastErr.message) + ')');
    if (attempt < 180) _sleepSync(10000);
  }
  try { fs.unlinkSync(fp); } catch (e) {}
  throw lastErr || new Error('write failed');
}

(async () => {
  const OUTDIR = process.env.OUTDIR || null;
  if (OUTDIR) {
    fs.mkdirSync(path.join(OUTDIR, 'leadfeast'), { recursive: true });
  }
  for (const seed of SEEDS) {
    try {
      if (OUTDIR) {
        const fp = path.join(OUTDIR, 'leadfeast', 's' + seed + '.json');
        try {
          const parsed = JSON.parse(fs.readFileSync(fp, 'utf8'));
          if (parsed && parsed.seed === seed) { console.error('skip s' + seed + ': already present and valid'); continue; }
        } catch (e) {}
      }
      const r = await oneRun(seed);
      if (OUTDIR) {
        const payload = JSON.stringify(r, null, 1) + '\n';
        _writeResilient(path.join(OUTDIR, 'leadfeast', 's' + seed + '.json'), payload);
        console.error('wrote s' + seed + ' (' + Buffer.byteLength(payload) + ' bytes)');
      } else {
        console.log(JSON.stringify(r));
      }
      console.error(`done s${seed}: daily=${(r.daily || []).length} ff=${(r.fieldFights || []).length} traj=${(r.trajSnaps || []).length} kills=${(r.killEvents || []).length} spawns=${(r.spawns || []).length} engineUw=${r.engineFinalUw} maxWave=${r.maxWave} nat=${r.national} table=${r.table} won=${r.won} end=${r.endReason} days=${r.gameDays} rank=${r.endScaleRank} errs=${r.recorderErrs} trajErrs=${r.trajErrs}`);
    } catch (e) {
      console.error(`ERROR s${seed}: ${e && e.message}`);
      console.error(e && e.stack);
    }
  }
})();

#!/usr/bin/env node
// contactfinish-sweep-20261031.js — sim-contactfinish-a encounter census sweep.
//
// Win-pursuit stack (identical to wavegate) + the NEW contactfinish-diag
// recorder (CONTACTFINISH=1). DIAG ONLY: no game change, no policy edit,
// no muster verb, no call, no button press — the recorder is pure
// reads + post-delegation event recording (see twoblow-diag.js).
// CONTACTFINISH absent runs the identical stack WITHOUT the recorder
// (the det-gate's OFF leg); CONTACTFINISH=1 wraps the recorder
// OUTSIDE fullseat-diag.
//
// I/O DISCIPLINE (prior-run lesson): a game-loaded process cannot
// reliably write files (the frozen clock makes retry sleeps return
// instantly). So this sweep writes NOTHING itself: it prints ONE
// JSON line per seed to stdout (progress goes to stderr), and the
// separate idle splitter (scripts/contactfinish-split-20261031.js) reads
// the stdout file and writes the per-seed JSONs with a resilient
// writer. Run in a single FOREGROUND exec with stdout/stderr
// redirected to files; never a backgrounded pipe.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 CONTACTFINISH=1 \
//   SEEDS=<list> node scripts/contactfinish-sweep-20261031.js > out.jsonl 2> out.err
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
const WE = require(path.join(REPO, 'scripts', 'policies', 'contactfinish-diag'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
if (!WD.layerOn()) { console.error('SWEEP STOP: windefer layerOn() false despite WINDEFER=1.'); process.exit(2); }
if (!SD.layerOn()) { console.error('SWEEP STOP: seatdrive layerOn() false despite SEATDRIVE=1.'); process.exit(2); }
if (!FD.layerOn()) { console.error('SWEEP STOP: fullseat-diag layerOn() false despite FULLSEAT=1.'); process.exit(2); }
const CONTACTFINISH_ON = process.env.CONTACTFINISH === '1';
if (CONTACTFINISH_ON && !WE.layerOn()) { console.error('SWEEP STOP: contactfinish-diag layerOn() false despite CONTACTFINISH=1.'); process.exit(2); }

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
  if (!CONTACTFINISH_ON) return fd;
  return WE.withContactfinishDiag(fd, 'lead-contactfinish', 'leadfeast + spike/contact encounter recorder (CONTACTFINISH=1)');
}

async function oneRun(seed) {
  const policy = policyFor();
  const store = policy.contactfinishStore || null;
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  if (store) WE.installContactfinishDiag(Game, store);
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
  // Post-run engine cross-checks (trajectory-free: the run is over).
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
  let deaths = [];
  try { deaths = ((result.samples || {}).deaths || []).slice(); } catch (e) {}
  const killLog = WE.copyKillLog(Game);

  const out = {
    seed, policyId: 'leadfeast', instrument: CONTACTFINISH_ON ? 'contactfinish-v1' : 'contactfinish-off',
    substrate: 'withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))), FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1' + (CONTACTFINISH_ON ? ' + CONTACTFINISH=1' : ''),
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
    killLog,
    recorderErrs: store ? store.errs : 0,
    recorderErrors: store ? store.errors : [],
    recorderOverflow: store ? store.overflow : {},
    deaths,
    hashes,
  };
  return out;
}

// Resilient per-seed writer (sim-contactfinish-a, flap response):
// when OUTDIR is set, each seed's JSON goes straight to its per-seed
// file with retry + full-size verification (Atomics.wait sleeps are
// wall-clock, not game clock), and seeds already present and valid
// are skipped — so a flap-killed invocation resumes cleanly.
// Without OUTDIR the original stdout-only discipline stands.
const _fs = require('fs');
function _sleepSync(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {}
}
function _writeResilient(fp, payload) {
  // Splitter parity: 180 attempts x 10s = 30 min budget. The 60x5s
  // budget lost three consecutive seeds' files to one long flap
  // window (2026-11-01 02:25-02:37Z); do not shrink it again.
  let lastErr = null;
  for (let attempt = 1; attempt <= 180; attempt++) {
    try {
      _fs.writeFileSync(fp, payload);
      const sz = _fs.statSync(fp).size;
      if (sz > 0 && sz === Buffer.byteLength(payload)) return true;
      lastErr = new Error('short write: ' + sz + ' of ' + Buffer.byteLength(payload) + ' bytes');
    } catch (e) { lastErr = e; }
    if (attempt % 10 === 0) console.error('  write waiting out flap (attempt ' + attempt + ', last: ' + (lastErr && lastErr.message) + ')');
    if (attempt < 180) _sleepSync(10000);
  }
  try { _fs.unlinkSync(fp); } catch (e) {}
  throw lastErr || new Error('write failed');
}

(async () => {
  const OUTDIR = process.env.OUTDIR || null;
  if (OUTDIR) {
    const dir = path.join(OUTDIR, 'leadfeast');
    _fs.mkdirSync(dir, { recursive: true });
  }
  for (const seed of SEEDS) {
    try {
      if (OUTDIR) {
        const fp = path.join(OUTDIR, 'leadfeast', 's' + seed + '.json');
        try {
          const parsed = JSON.parse(_fs.readFileSync(fp, 'utf8'));
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
      console.error(`done s${seed}: daily=${(r.daily || []).length} ff=${(r.fieldFights || []).length} tb=${(r.tbFights || []).length} kills=${(r.killEvents || []).length} spawns=${(r.spawns || []).length} engineUw=${r.engineFinalUw} maxWave=${r.maxWave} nat=${r.national} table=${r.table} won=${r.won} end=${r.endReason} days=${r.gameDays} rank=${r.endScaleRank} errs=${r.recorderErrs}`);
    } catch (e) {
      console.error(`ERROR s${seed}: ${e && e.message}`);
      console.error(e && e.stack);
    }
  }
})();

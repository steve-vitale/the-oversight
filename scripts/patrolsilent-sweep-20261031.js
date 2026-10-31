#!/usr/bin/env node
// patrolsilent-sweep-20261031.js — sim-patrolsilent-a census sweep.
// Pocketdesign-sweep stack VERBATIM (S-PATROL: leadfeast + windefer +
// seatdrive + fullseat + delegate + deadfall) with the pocketdesign
// instrument stack REPLACED by the patrolsilent instrument only, so
// the dayHash trajectory comparison vs the pocketdesign corpus is a
// clean instrument-neutrality check: any hash mismatch means an
// instrument moved the trajectory and the census is NO-GO.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 PSILDIAG=1 \
//   SEEDS=85104,85107 DEADFALL_B=1 node scripts/patrolsilent-sweep-20261031.js
// EVID overrides the output root.
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
const DF = require(path.join(REPO, 'scripts', 'policies', 'deadfall-b'));
const DL = require(path.join(REPO, 'scripts', 'policies', 'delegate'));
const PS = require(path.join(REPO, 'scripts', 'patrolsilent-diag-20261031'));

// PSINSTR=0: paired neutrality leg — same stack, no instrument at
// all (no assignTask wrapper, no beat snapshots); output still
// carries hashes so the analyzer/proof can compare dayHash sequences.
// PSINSTR defaults to 1 (judged census leg).
const PSINSTR = (process.env.PSINSTR || '1') !== '0';
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (PSINSTR && process.env.PSILDIAG !== '1') { console.error('SWEEP STOP: PSILDIAG=1 is required on the instrument leg.'); process.exit(2); }
if (PSINSTR && !PS.instrumentOn()) { console.error('SWEEP STOP: PSILDIAG instrument off despite PSILDIAG=1.'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
if (!WD.layerOn()) { console.error('SWEEP STOP: windefer layerOn() false despite WINDEFER=1.'); process.exit(2); }
if (!SD.layerOn()) { console.error('SWEEP STOP: seatdrive layerOn() false despite SEATDRIVE=1.'); process.exit(2); }
if (!FD.layerOn()) { console.error('SWEEP STOP: fullseat-diag layerOn() false despite FULLSEAT=1.'); process.exit(2); }
if (process.env.DEADFALL_B !== '1') { console.error('SWEEP STOP: DEADFALL_B=1 required (staffed substrate).'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [85101, 85102, 85103, 85104, 85105, 85106, 85107, 85108]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '200', 10) || 200;
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-31', 'perseed-patrolsilent-a');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers (WINPURSUIT=1 + WINDEFER=1)');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive (SEATDRIVE=1)');
  const fd = FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder (FULLSEAT=1)');
  const dl = DL.withDelegate(fd, 'lead-delegate', 'leadfeast + full-seat stack + delegate (patrol-assigning player layer)');
  return DF.withDeadfall(dl, 'lead-deadfall-delegate', 'leadfeast + full-seat stack + delegate + deadfall staffing (DEADFALL_B=1)');
}

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'deadfall-diag', fullTelemetry: false });
  const t = { psBeats: [], psAssigns: [], psErrors: [], psBeatSeq: 0, _psCurBeat: null };
  const uninstallPS = PSINSTR ? PS.install(Game, t) : (function () {});

  await setupGame(Game);
  let result;
  const hashes = [];
  const wrapped = Object.assign({}, policy, {
    upkeep(Gm, ctx) {
      if (!PSINSTR) return policy.upkeep(Gm, ctx);
      try { PS.beginBeat(Gm, t); } catch (e) {}
      let r;
      try { r = policy.upkeep(Gm, ctx); } finally { try { PS.endBeat(Gm, t); } catch (e) {} }
      return r;
    },
    daily(Gm, ctx) {
      hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm));
      return policy.daily(Gm, ctx);
    },
  });
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  // Final beat-boundary state (assignments + leads at run end).
  let finalAssignments = {}, finalLeads = {};
  try {
    const asg = ((Game.state || {}).village || {}).assignments || {};
    for (const k of Object.keys(asg)) finalAssignments[k] = (asg[k] && asg[k].task) || null;
    const leads = ((Game.state || {}).village || {}).taskLeads || {};
    for (const k of Object.keys(leads)) finalLeads[k] = leads[k];
  } catch (e) {}
  try { uninstallPS(); } catch (e) {}
  const st = Game.state || {};
  let national = 0, table = 0, endWave = null, endRank = null;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; endRank = r; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { endWave = (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : null; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}
  let deaths = [];
  try { deaths = ((result.samples || {}).deaths || []).slice(); } catch (e) {}

  const out = {
    seed, policyId: 'lead-delegate-deadfall',
    instrument: PSINSTR ? 'patrolsilentdiag-v2' : 'none', arm: 'patrolsilent',
    substrate: 'withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))) + withDelegate + withDeadfall, FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 + PSILDIAG=1',
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    endUnlockedWave: endWave, endScaleRank: endRank,
    national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    deadfallHauls: Game._deadfallHauls || 0, deadfallSticks: Game._deadfallSticks || 0, deadfallFiber: Game._deadfallFiber || 0,
    psBeats: t.psBeats, psAssigns: t.psAssigns, psErrors: t.psErrors,
    finalAssignments, finalLeads,
    deaths, hashes,
  };
  // EPERM-flap-tolerant write (container write denials hit evidence
  // writes mid-run on 2026-10-31; one episode blocked /tmp for 2+
  // minutes — retry up to 5 min, then throw LOUDLY, never silently
  // drop: the caller marks the seed failed and the process exits
  // non-zero, so a re-run resumes instead of shipping a partial
  // corpus).
  (function writeWithRetry(file, text) {
    let lastErr = null;
    for (let i = 0; i < 300; i++) {
      try { fs.writeFileSync(file, text); return; } catch (e) { lastErr = e; }
      try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000); } catch (e) {}
    }
    throw lastErr;
  })(path.join(EVID, `s${seed}.json`), JSON.stringify(out, null, 1) + '\n');
  const patrolAttempts = t.psAssigns.filter(a => a.task === 'patrol').length;
  const atHavenBeats = t.psBeats.filter(b => b.atHaven).length;
  return { out, patrolAttempts, atHavenBeats };
}

(async () => {
  let failed = 0;
  for (const seed of SEEDS) {
    // Resume: a valid existing output for THIS base + THIS leg is
    // final — skip it (a flap-killed sweep resumes without redoing
    // finished seeds). 0-byte / unparseable / stale-base / wrong-leg
    // files are re-run, never trusted.
    const outFile = path.join(EVID, `s${seed}.json`);
    try {
      const prev = JSON.parse(fs.readFileSync(outFile, 'utf8'));
      if (prev && prev.seed === seed && prev.anchorCommit === ANCHOR &&
          prev.instrument === (PSINSTR ? 'patrolsilentdiag-v2' : 'none')) {
        console.log(`resume-skip s${seed}: valid ${prev.instrument} output on ${ANCHOR}`);
        continue;
      }
    } catch (e) { /* missing / corrupt / stale: re-run below */ }
    try {
      const { out, patrolAttempts, atHavenBeats } = await oneRun(seed);
      console.log(`done s${seed}: maxWave=${out.maxWave} nat=${out.national} table=${out.table} won=${out.won} end=${out.endReason} days=${out.gameDays} beats=${out.psBeats.length} atHaven=${atHavenBeats} assigns=${out.psAssigns.length} patrolAttempts=${patrolAttempts} errs=${out.psErrors.length} deadfall=${out.deadfallHauls}`);
    } catch (e) {
      failed++;
      console.error(`ERROR s${seed}: ${e && e.message}`);
      console.error(e && e.stack);
    }
  }
  if (failed) { console.error(`SWEEP FAILED: ${failed} seed(s) errored — corpus partial, re-run to resume.`); process.exitCode = 1; }
})();

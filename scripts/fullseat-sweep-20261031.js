#!/usr/bin/env node
// fullseat-sweep-20261031.js — sim-fullseat-a combined stdout sweep.
//
// Win-pursuit stack + fullseat-diag + wavegate-diag (the wavegate stack,
// identical) + vet2-diag (VET2=1) + regtable-diag (REGTABLE=1), composed
// OUTSIDE-in: regtable wraps vet2 wraps wavegate wraps fullseat wraps
// seatdrive wraps windefer wraps tribfloor. All four recorders are
// reused UNCHANGED (no policy file edited); this file only composes
// them, adds the both-writers kill capture copied from
// vet2-sweep-20261031.js, and captures the fullseat ctx summary
// (max reach, first full/lesser day, win snapshot) that fullseat-diag
// keeps on runDays' ctx rather than on a store.
//
// DIAG ONLY: no game change, no policy edit, no muster verb, no call,
// no button press — all recorders are pure reads.
//
// STDOUT-RUNNER (prior-run lesson): the game-loaded process writes NO
// files — it prints exactly ONE JSON line per seed to stdout. A
// separate idle process (scripts/fullseat-split-20261031.js, no game
// loaded) turns the stdout file into per-seed JSONs. Run it foreground:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 \
//   FULLSEAT=1 WAVEGATE=1 VET2=1 REGTABLE=1 SEEDS=<list> \
//   node scripts/fullseat-sweep-20261031.js > out.jsonl 2> out.err
//   node scripts/fullseat-split-20261031.js out.jsonl <evid-dir>
//
// For the det OFF leg, omit VET2 and REGTABLE (wavegate/fullseat stay
// ON in both legs, as in vet2-a/regtable-a) and omit the kill capture.
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
const V2 = require(path.join(REPO, 'scripts', 'policies', 'vet2-diag'));
const RT = require(path.join(REPO, 'scripts', 'policies', 'regtable-diag'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'WAVEGATE']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false.'); process.exit(2); }
if (!WD.layerOn()) { console.error('SWEEP STOP: windefer layerOn() false.'); process.exit(2); }
if (!SD.layerOn()) { console.error('SWEEP STOP: seatdrive layerOn() false.'); process.exit(2); }
if (!FD.layerOn()) { console.error('SWEEP STOP: fullseat-diag layerOn() false.'); process.exit(2); }
if (!WG.layerOn()) { console.error('SWEEP STOP: wavegate-diag layerOn() false.'); process.exit(2); }
const VET2_ON = process.env.VET2 === '1';
const REGTABLE_ON = process.env.REGTABLE === '1';
if (VET2_ON && !V2.layerOn()) { console.error('SWEEP STOP: vet2-diag layerOn() false despite VET2=1.'); process.exit(2); }
if (REGTABLE_ON && !RT.layerOn()) { console.error('SWEEP STOP: regtable-diag layerOn() false despite REGTABLE=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
if (!SEEDS.length) { console.error('SWEEP STOP: SEEDS required.'); process.exit(2); }
const DAYS = parseInt(process.env.DAYS || '200', 10) || 200;

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive');
  const fd = FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder');
  const wg = WG.withWavegateDiag(fd, 'lead-wavegate', 'leadfeast + wave-unlock gate decomposition recorder');
  let p = wg;
  if (VET2_ON) p = V2.withVet2Diag(p, 'lead-vet2', 'leadfeast + veterans-trajectory recorder');
  if (REGTABLE_ON) p = RT.withRegtableDiag(p, 'lead-regtable', 'leadfeast + regional-table seat recorder');
  return p;
}

// installKillCapture: verbatim logic from vet2-sweep-20261031.js — wraps
// BOTH waveKillLog writers (recordWaveKill + recordPyrrhicKill) with
// pure-observation call-throughs, kill-time scholar vid per kill.
function installKillCapture(Game, store) {
  const wrap = (method, src) => {
    const orig = Game[method];
    if (typeof orig !== 'function') { store.captureErrs = (store.captureErrs || 0) + 1; return function () {}; }
    Game[method] = function (monsterId, killerVid, via, detail) {
      try {
        const defs = (this.data && this.data.monsters) || [];
        const def = defs.find(m => m && m.id === monsterId);
        if (def) {
          store.kills.push({
            d: ((this.state || {}).scholar || {}).day || 0,
            mid: monsterId, w: (def.wave | 0) || 0,
            by: killerVid || null, via: via || 'unknown',
            trick: detail || null, src,
            scholarVid: this.villagerId || null,
            scholarStateVid: ((this.state || {}).scholar || {}).villagerId || null,
          });
          if (this.villagerId != null && ((this.state || {}).scholar || {}).villagerId != null
            && this.villagerId !== ((this.state || {}).scholar || {}).villagerId) {
            store.scholarVidMismatches = (store.scholarVidMismatches || 0) + 1;
          }
        }
      } catch (e) { store.captureErrs = (store.captureErrs || 0) + 1; }
      return orig.apply(this, arguments);
    };
    return function uninstall() { try { Game[method] = orig; } catch (e) {} };
  };
  const u1 = wrap('recordWaveKill', 'wavekill');
  const u2 = wrap('recordPyrrhicKill', 'pyrrhic');
  return function uninstall() { try { u1(); } catch (e) {} try { u2(); } catch (e) {} };
}

async function oneRun(seed) {
  const policy = policyFor();
  const wg = policy.wavegateStore || null;
  const v2 = policy.vet2Store || null;
  const rt = policy.regtableStore || null;
  const capStore = { kills: [], captureErrs: 0, scholarVidMismatches: 0 };
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  // Say captures OUTSIDE-in: wavegate first, then regtable (regtable's
  // wrapper calls wavegate's wrapper calls the original) — as in
  // regtable-sweep. Vet2 has no say capture.
  if (wg) WG.installSayCapture(Game, wg);
  if (rt) RT.installSayCapture(Game, rt);
  let uninstallKill = function () {};
  if (VET2_ON) uninstallKill = installKillCapture(Game, capStore);
  await setupGame(Game);
  let initialScholarVid = null;
  try { initialScholarVid = Game.villagerId || null; } catch (e) {}
  let result;
  const hashes = [];
  let ctxRef = null;
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      ctxRef = ctx;
      hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm));
      return policy.daily(Gm, ctx);
    },
  });
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  let engineFinalUw = null, engineFinalStanding = null;
  try { engineFinalUw = (typeof Game.unlockedWave === 'function') ? (Game.unlockedWave() | 0) : null; } catch (e) {}
  try { engineFinalStanding = (typeof Game.villageStandingTotal === 'function') ? (Game.villageStandingTotal() | 0) : null; } catch (e) {}
  try { if (rt) RT.uninstallSayCapture(Game, rt); } catch (e) {}
  try { if (wg) WG.uninstallSayCapture(Game, wg); } catch (e) {}
  try { uninstallKill(); } catch (e) {}

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
  let finalWaveKillLog = [];
  try { finalWaveKillLog = ((st.waveKillLog || []).map(e => ({ d: e.d, mid: e.mid, w: e.w, by: e.by, via: e.via, trick: e.trick || null }))); } catch (e) {}
  let endScholarVid = null;
  try { endScholarVid = Game.villagerId || null; } catch (e) {}

  const wgRows = wg ? wg.rows : [];
  const wgLast = wgRows.length ? wgRows[wgRows.length - 1] : null;
  const v2Rows = v2 ? v2.rows : [];
  const rtRows = rt ? rt.rows : [];
  // Fullseat ctx summary: snapshot the cumulative fields now (the ctx
  // object is mutated by the record path; these fields are final).
  let fullseat = null;
  try {
    const D = ctxRef && ctxRef._fullseatdiag;
    if (D) {
      fullseat = {
        days: D.days, errs: D.errs, max: D.max,
        bestSeat: D.bestSeat, seats: D.seats,
        firstFullSeatDay: D.firstFullSeatDay, firstFullSeatSnap: D.firstFullSeatSnap,
        firstLesserDay: D.firstLesserDay || null,
        indispEver: !!D.indispEver, firstIndispDay: D.firstIndispDay || null,
        winSnap: D.winSnap, winDay: D.winDay,
        sentDay: D.sentDay || null, surgeDay: D.surgeDay || null,
      };
    }
  } catch (e) {}

  const out = {
    seed, policyId: 'leadfeast',
    instrument: (VET2_ON ? 'vet2-v1+' : '') + (REGTABLE_ON ? 'regtable-v1+' : '') + 'wavegate-v1',
    substrate: 'withRegtableDiag(withVet2Diag(withWavegateDiag(withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast)))))), FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 WAVEGATE=1' + (VET2_ON ? ' + VET2=1' : '') + (REGTABLE_ON ? ' + REGTABLE=1' : ''),
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    endScaleRank: (function () { try { return Game.scaleRank ? Game.scaleRank() : null; } catch (e) { return null; } })(),
    derivedFinalUw: wgLast ? wgLast.uw : null,
    engineFinalUw, engineFinalStanding,
    wavegateRows: wgRows,
    wavegateBeats: wg ? wg.beats : [],
    wavegateErrs: wg ? wg.errs : 0,
    vetRows: v2Rows, vetErrs: v2 ? v2.errs : 0,
    regtableRows: rtRows,
    regtableBeats: rt ? rt.beats : [],
    regtableErrs: rt ? rt.errs : 0,
    fullseat,
    kills: capStore.kills, captureErrs: capStore.captureErrs,
    scholarVidMismatches: capStore.scholarVidMismatches,
    initialScholarVid, endScholarVid, finalWaveKillLog,
    deaths, hashes,
  };
  process.stdout.write(JSON.stringify(out) + '\n');
  console.error(`done s${seed}: wgRows=${wgRows.length} vetRows=${v2Rows.length} rtRows=${rtRows.length} kills=${capStore.kills.length} logLen=${finalWaveKillLog.length} derivedUw=${out.derivedFinalUw} engineUw=${engineFinalUw} maxWave=${maxWave} nat=${national} table=${table} won=${won} end=${result.endReason} days=${gameDays} rank=${out.endScaleRank} wgErrs=${out.wavegateErrs} vetErrs=${out.vetErrs} rtErrs=${out.regtableErrs} capErrs=${capStore.captureErrs}`);
  return out;
}

(async () => {
  for (const seed of SEEDS) {
    try {
      await oneRun(seed);
    } catch (e) {
      console.error(`ERROR s${seed}: ${e && e.message}`);
      console.error(e && e.stack);
    }
  }
})();

#!/usr/bin/env node
// vet2-sweep-20261031.js — sim-vet2-a veterans-trajectory sweep.
//
// Win-pursuit stack + fullseat-diag + wavegate-diag (the wavegate stack,
// identical) + the NEW vet2-diag recorder (VET2=1) + a sweep-side
// kill capture wrapping BOTH waveKillLog writers (recordWaveKill +
// recordPyrrhicKill; kill-time scholar/villager keying, the
// sim-compchan 2026-10-18 correction: NEVER end-of-run keying).
// DIAG ONLY: no game change, no policy edit, no muster verb, no call,
// no button press.
//
// STDOUT-RUNNER (infrastructure lesson): the game-loaded process never
// writes a file — the frozen clock makes retry sleeps return instantly
// inside it, and the container EPERM flap eats direct writes. This
// script prints EXACTLY ONE JSON line per seed to stdout (plus
// human-readable progress to stderr). A separate idle process
// (scripts/vet2-split-20261031.js, plain node, no game loaded)
// splits the stdout file into per-seed JSONs with a real-sleep
// retry loop. Run it foreground:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 WAVEGATE=1 VET2=1 \
//   SEEDS=<list> node scripts/vet2-sweep-20261031.js > out.jsonl 2> out.err
//   node scripts/vet2-split-20261031.js out.jsonl <evid-dir>
//
// VET2 unset runs the identical stack WITHOUT the vet2 layer and
// without the kill capture (the det-gate's OFF leg). WAVEGATE is
// required in both legs (the wavegate rows carry the end blockers,
// win/table days, and the rd-count cross-check).
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

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'WAVEGATE']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
if (!WD.layerOn()) { console.error('SWEEP STOP: windefer layerOn() false despite WINDEFER=1.'); process.exit(2); }
if (!SD.layerOn()) { console.error('SWEEP STOP: seatdrive layerOn() false despite SEATDRIVE=1.'); process.exit(2); }
if (!FD.layerOn()) { console.error('SWEEP STOP: fullseat-diag layerOn() false despite FULLSEAT=1.'); process.exit(2); }
if (!WG.layerOn()) { console.error('SWEEP STOP: wavegate-diag layerOn() false despite WAVEGATE=1.'); process.exit(2); }
const VET2_ON = process.env.VET2 === '1';
if (VET2_ON && !V2.layerOn()) { console.error('SWEEP STOP: vet2-diag layerOn() false despite VET2=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
if (!SEEDS.length) { console.error('SWEEP STOP: SEEDS required.'); process.exit(2); }
const DAYS = parseInt(process.env.DAYS || '200', 10) || 200;

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers (WINPURSUIT=1 + WINDEFER=1)');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive (SEATDRIVE=1)');
  const fd = FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder (FULLSEAT=1)');
  const wg = WG.withWavegateDiag(fd, 'lead-wavegate', 'leadfeast + wave-unlock gate decomposition recorder (WAVEGATE=1)');
  if (!VET2_ON) return wg;
  return V2.withVet2Diag(wg, 'lead-vet2', 'leadfeast + veterans-trajectory recorder (VET2=1)');
}

// installKillCapture(Game, store): wraps BOTH waveKillLog writers with
// pure-observation call-throughs — Game.recordWaveKill AND
// Game.recordPyrrhicKill (the pyrrhic path writes the log directly,
// bypassing recordWaveKill; the 87134 pilot caught exactly one such
// kill missing from the capture, cc2 MISMATCH — see the prereg
// amendment). Records ONLY raw call args + the scholar vid at the
// call moment (kill-time keying), tagged with src. No game-state
// writes, no RNG draws, no getPerson at kill time (names resolve in
// the analyzer from daily name maps / post-run reads). Kills whose
// monster def is missing are NOT recorded: both originals return
// early for those, so recording them would overcount the log.
// The pyrrhic call site (game.js tbEnd) never calls recordWaveKill,
// so the two wraps cannot double-capture one kill; the analyzer
// dedupes exact repeats anyway. Returns an uninstall function
// restoring both original methods.
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
  // Both layers expose their stores as own properties on the wrapper
  // they created, and Object.assign copies inner properties outward,
  // so wavegateStore survives on the outermost (vet2) wrapper.
  const wg = policy.wavegateStore || null;
  const v2 = policy.vet2Store || null;
  const capStore = { kills: [], captureErrs: 0, scholarVidMismatches: 0 };
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  if (wg) WG.installSayCapture(Game, wg);
  let uninstallKill = function () {};
  if (VET2_ON) uninstallKill = installKillCapture(Game, capStore);
  await setupGame(Game);
  let initialScholarVid = null;
  try { initialScholarVid = Game.villagerId || null; } catch (e) {}
  let result;
  const hashes = [];
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm));
      return policy.daily(Gm, ctx);
    },
  });
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  let engineFinalUw = null, engineFinalStanding = null;
  try { engineFinalUw = (typeof Game.unlockedWave === 'function') ? (Game.unlockedWave() | 0) : null; } catch (e) {}
  try { engineFinalStanding = (typeof Game.villageStandingTotal === 'function') ? (Game.villageStandingTotal() | 0) : null; } catch (e) {}
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
  let endOmenStage = null;
  try {
    const tit = st.titans || {};
    const om = tit.omens ? tit.omens.herald : null;
    if (om) endOmenStage = (om.stage != null ? om.stage : null);
  } catch (e) {}
  let deaths = [];
  try { deaths = ((result.samples || {}).deaths || []).slice(); } catch (e) {}
  let finalWaveKillLog = [];
  try { finalWaveKillLog = ((st.waveKillLog || []).map(e => ({ d: e.d, mid: e.mid, w: e.w, by: e.by, via: e.via, trick: e.trick || null }))); } catch (e) {}
  let endScholarVid = null;
  try { endScholarVid = Game.villagerId || null; } catch (e) {}

  const wgRows = wg ? wg.rows : [];
  const wgLast = wgRows.length ? wgRows[wgRows.length - 1] : null;
  const v2Rows = v2 ? v2.rows : [];
  const out = {
    seed, policyId: 'leadfeast', instrument: VET2_ON ? 'vet2-v1' : 'wavegate-only',
    substrate: 'withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))), FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 WAVEGATE=1' + (VET2_ON ? ' + VET2=1' : ''),
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    endScaleRank: (function () { try { return Game.scaleRank ? Game.scaleRank() : null; } catch (e) { return null; } })(),
    endOmenStage,
    derivedFinalUw: wgLast ? wgLast.uw : null,
    derivedFinalGated: wgLast ? wgLast.gated : null,
    engineFinalUw, engineFinalStanding,
    rows: wgRows, beats: wg ? wg.beats : [],
    recorderErrs: wg ? wg.errs : 0,
    vetRows: v2Rows, vetErrs: v2 ? v2.errs : 0,
    kills: capStore.kills, captureErrs: capStore.captureErrs,
    scholarVidMismatches: capStore.scholarVidMismatches,
    initialScholarVid, endScholarVid, finalWaveKillLog,
    deaths, hashes,
  };
  // ONE JSON line per seed on stdout — the splitter's input. Nothing
  // else on stdout, ever (progress goes to stderr).
  process.stdout.write(JSON.stringify(out) + '\n');
  console.error(`done s${seed}: wgRows=${wgRows.length} vetRows=${v2Rows.length} kills=${capStore.kills.length} logLen=${finalWaveKillLog.length} derivedUw=${out.derivedFinalUw} engineUw=${engineFinalUw} maxWave=${maxWave} nat=${national} table=${table} won=${won} end=${result.endReason} days=${gameDays} rank=${out.endScaleRank} wgErrs=${out.recorderErrs} vetErrs=${out.vetErrs} capErrs=${capStore.captureErrs}`);
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

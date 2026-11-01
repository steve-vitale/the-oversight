#!/usr/bin/env node
// latewin-sweep-20261101.js — sim-latewin-a timeline census sweep.
// Heraldcontact sweep (20261031) with the output dir changed to
// evidence/2026-11-01/perseed-latewin/leadfeast/ and a DAILY TIMELINE
// SNAPSHOT added (pure reads only, after the policy daily delegates
// inward). No other behavioral change: same policy stack, same
// recorders, same env guards, same 200d death-aware cap.
//
// Timeline row per simulated day: day, uw (unlockedWave), rank
// (scaleRank), omenStage + omenDay for the herald omen (RAW state
// read — state.titans.omens.herald, never created), won, table
// flags (progState tableWaiting/tableDone), seat (tableSeat()).
// Plus a say ring (last 800 lines, call-through wrapper) for the
// sense-test transcript. No timestamps, no fight ids persisted, so
// re-runs are byte-comparable.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 MUSTER=1 \
//   SEEDS=<selected> node scripts/latewin-sweep-20261101.js
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
const MD = require(path.join(REPO, 'scripts', 'policies', 'muster-diag'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD', 'MUSTER']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
if (!WD.layerOn()) { console.error('SWEEP STOP: windefer layerOn() false despite WINDEFER=1.'); process.exit(2); }
if (!SD.layerOn()) { console.error('SWEEP STOP: seatdrive layerOn() false despite SEATDRIVE=1.'); process.exit(2); }
if (!FD.layerOn()) { console.error('SWEEP STOP: fullseat-diag layerOn() false despite FULLSEAT=1.'); process.exit(2); }
if (!HI.instrumentOn()) { console.error('SWEEP STOP: HERALD instrument off despite HERALD=1.'); process.exit(2); }
if (!MD.layerOn()) { console.error('SWEEP STOP: MUSTER diag off despite MUSTER=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '200', 10) || 200;
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-11-01', 'perseed-latewin');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers (WINPURSUIT=1 + WINDEFER=1)');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive (SEATDRIVE=1)');
  return FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder (FULLSEAT=1)');
}

// Pure-read daily timeline snapshot. Never creates state: the omen
// is read only if state.titans.omens.herald already exists.
function snapTimeline(Game) {
  const row = { day: 0, uw: 1, rank: 'village', omenStage: null, omenDay: null, won: 0, tableWaiting: 0, tableDone: 0, seat: 'none' };
  try {
    const st = Game.state || {};
    row.day = ((st.scholar || {}).day) || 0;
    try { row.uw = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
    try { row.rank = Game.scaleRank ? Game.scaleRank() : 'village'; } catch (e) {}
    try {
      const om = st.titans && st.titans.omens && st.titans.omens.herald;
      if (om) { row.omenStage = (om.stage != null ? om.stage : null); row.omenDay = (om.day != null ? om.day : null); }
    } catch (e) {}
    try { row.won = Game.won ? 1 : 0; } catch (e) {}
    try {
      const pg = Game.progState ? Game.progState() : {};
      row.tableWaiting = pg.tableWaiting ? 1 : 0;
      row.tableDone = pg.tableDone ? 1 : 0;
    } catch (e) {}
    try { const t = Game.tableSeat ? Game.tableSeat() : null; row.seat = (t && t.seat) || 'none'; } catch (e) {}
  } catch (e) { row.error = String((e && e.message) || e); }
  return row;
}

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  const t = { attempts: [], tbOutcomes: {}, fieldFights: [], kills: [], musterEvents: [], census: [], transcripts: [], instrumentErrors: [] };
  const uninstall = HI.install(Game, t);
  const mstore = MD.newStore();
  MD.installMusterDiag(Game, mstore);

  // Say ring for the sense test (call-through, narration only).
  const sayRing = [];
  let sayOrig = null;
  try {
    sayOrig = Game.say;
    if (typeof sayOrig === 'function') {
      Game.say = function () {
        let line = '';
        try { line = Array.prototype.map.call(arguments, function (a) { return (a === undefined || a === null) ? '' : String(a); }).join(' '); } catch (e) {}
        try { sayRing.push({ day: ((Game.state || {}).scholar || {}).day || 0, line }); if (sayRing.length > 800) sayRing.splice(0, sayRing.length - 800); } catch (e) {}
        return sayOrig.apply(Game, arguments);
      };
    }
  } catch (e) { t.instrumentErrors.push('sayRing: ' + String((e && e.message) || e)); }

  await setupGame(Game);
  let result;
  const hashes = [];
  const timeline = [];
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm));
      const r = policy.daily(Gm, ctx);
      // Snapshot AFTER the policy daily delegates inward.
      timeline.push(snapTimeline(Gm));
      return r;
    },
  });
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  // Final snapshot: catches a win/table/omen change that landed
  // after the last daily call (Game.over breaks before daily).
  const finalRow = snapTimeline(Game);
  try { uninstall(); } catch (e) {}
  if (sayOrig && Game.say !== sayOrig) { try { Game.say = sayOrig; } catch (e) {} }

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

  let endOmenStage = null, endOmenDay = null, endMusterExists = false;
  try {
    const tit = st.titans || {};
    const om = tit.omens ? tit.omens.herald : null;
    if (om) { endOmenStage = (om.stage != null ? om.stage : null); endOmenDay = (om.day != null ? om.day : null); }
    endMusterExists = !!(tit.musters && tit.musters.herald);
  } catch (e) {}

  let deaths = [];
  try { deaths = ((result.samples || {}).deaths || []).slice(); } catch (e) {}

  const out = {
    seed, policyId: 'leadfeast', instrument: 'herald-v1+muster-diag+latewin-timeline',
    substrate: 'withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))), FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 + HERALD=1 + MUSTER=1',
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    w4Day, w5Day,
    national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    endScaleRank: (function () { try { return Game.scaleRank ? Game.scaleRank() : null; } catch (e) { return null; } })(),
    endOmenStage, endOmenDay, endMusterExists,
    timeline, finalRow,
    finalSayRing: sayRing.slice(-200),
    census: t.census,
    transcripts: t.transcripts,
    musterRefusals: mstore.refusals, musterCalls: mstore.callTotals,
    musterInstalled: mstore.installed,
    musterErrs: mstore.errs, musterErrors: mstore.errors,
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
      const tl = r.timeline || [];
      const w4 = tl.find(x => (x.uw | 0) >= 4);
      const win = tl.find(x => x.won);
      console.log(`done s${seed}: maxWave=${r.maxWave} censusW4=${r.w4Day} tlW4=${w4 ? w4.day : null} tlRows=${tl.length} win=${r.won} winDay=${win ? win.day : null} seatFinal=${r.finalRow.seat} nat=${r.national} table=${r.table} end=${r.endReason} days=${r.gameDays} endOmen=${r.endOmenStage} errs=${r.instrumentErrors.length}+${r.musterErrs}`);
    } catch (e) {
      console.error(`ERROR s${seed}: ${e && e.message}`);
      console.error(e && e.stack);
    }
  }
})();

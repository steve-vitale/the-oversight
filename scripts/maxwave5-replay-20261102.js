#!/usr/bin/env node
// maxwave5-replay-20261102.js — instrumented replay for sim-maxwave5-a.
// Same frozen policy stack / recorders / env flags as the arrearsscreen
// screen (scripts/arrearsscreen-replay-20261102.js), plus: a daily
// unlock trace (policy.daily snapshot), a spawnWorldMonster wrap, and
// end-state deed/waveKillLog capture. POLICY/INSTRUMENT ONLY — zero
// src/js changes. Prints one JSON line per seed to stdout, writes
// NOTHING itself.
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 MUSTER=1 \
//   DAYS=180 SEEDS=97309 node scripts/maxwave5-replay-20261102.js > evidence/2026-11-02/perseed-maxwave5-a/sweep.stdout 2> evidence/2026-11-02/perseed-maxwave5-a/sweep.stderr
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
const HI = require(path.join(REPO, 'scripts', 'herald-instrument-20261030'));
const MD = require(path.join(REPO, 'scripts', 'policies', 'muster-diag'));
const CLS = require(path.join(REPO, 'scripts', 'maxwave5-classify-20261102'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD', 'MUSTER']) {
  if (process.env[k] !== '1') { console.error('MAXWAVE5 STOP: ' + k + '=1 is required.'); process.exit(2); }
}
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers (WINPURSUIT=1 + WINDEFER=1)');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive (SEATDRIVE=1)');
  return FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder (FULLSEAT=1)');
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function waveOf(Game, mid) {
  try { const d = (Game.data.monsters || []).find(function (m) { return m.id === mid; }); return (d && d.wave) || 0; } catch (e) { return 0; }
}
function stackTop() {
  try {
    const st = (new Error().stack || '').split('\n').slice(2, 7).join(' | ');
    return st.slice(0, 600);
  } catch (e) { return ''; }
}
function facedByWave(Game) {
  const out = {};
  try {
    const ds = (typeof Game.deedState === 'function') ? Game.deedState() : {};
    const faced = (ds && ds.wavesFaced) || {};
    Object.keys(faced).forEach(function (mid) { const w = String(faced[mid] | 0); (out[w] = out[w] || []).push(mid); });
  } catch (e) {}
  return out;
}
function killLogByWave(Game) {
  const out = {};
  try {
    ((Game.state || {}).waveKillLog || []).forEach(function (e) {
      const w = String(waveOf(Game, e.mid) | 0); (out[w] = out[w] || []).push({ d: e.d || null, mid: e.mid, by: e.by || null, via: e.via || null });
    });
  } catch (e) {}
  return out;
}
function snapshot(Game) {
  const s = { day: gday(Game), uw: null, standing: null, peak: null, w4faced: 0, ledger: {} };
  try { s.uw = (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : null; } catch (e) {}
  try { s.standing = (typeof Game.villageStandingTotal === 'function') ? Game.villageStandingTotal() : null; } catch (e) {}
  try { s.peak = (typeof Game._standingPeakWave === 'function') ? Game._standingPeakWave() : null; } catch (e) {}
  try { s.w4faced = (typeof Game.waveEngaged === 'function') ? Game.waveEngaged(4) : 0; } catch (e) {}
  for (let w = 1; w <= 5; w++) { try { s.ledger[w] = (typeof Game.waveLedgerPoints === 'function') ? Game.waveLedgerPoints(w) : null; } catch (e) { s.ledger[w] = null; } }
  const fbw = facedByWave(Game);
  s.facedCounts = {}; Object.keys(fbw).forEach(function (w) { s.facedCounts[w] = fbw[w].length; });
  return s;
}

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  const t = { attempts: [], tbOutcomes: {}, fieldFights: [], kills: [], musterEvents: [], census: [], transcripts: [], instrumentErrors: [] };
  const uninstall = HI.install(Game, t);
  const mstore = MD.newStore();
  MD.installMusterDiag(Game, mstore);
  const spawns = [];
  const dailyTrace = [];
  const unlockLines = [];
  const instrumentErrors = [];
  // spawn wrap (installed before setupGame, like HI's wraps)
  try {
    const origSpawn = Game.spawnWorldMonster;
    if (typeof origSpawn === 'function') {
      Game.spawnWorldMonster = function (mdef, tx, ty, opts) {
        const id = (typeof mdef === 'string') ? mdef : (mdef && mdef.id);
        const row = { day: gday(Game), mid: id || null, wave: id ? waveOf(Game, id) : 0,
          titan: !!(opts && opts.titan), optsKeys: opts ? Object.keys(opts) : [], stackTop: stackTop() };
        try { spawns.push(row); } catch (e) {}
        return origSpawn.apply(this, arguments);
      };
    }
  } catch (e) { instrumentErrors.push('spawnWrap: ' + String(e && e.message)); }
  // unlock-beat lines
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string' && /MIRROR DRAFT|PRODUCERS|FINAL DRAFT/i.test(arg)) {
          unlockLines.push({ day: gday(Game), line: String(arg).slice(0, 400) });
        }
      } catch (e) {}
      return origSay.apply(this, arguments);
    };
  } catch (e) { instrumentErrors.push('sayWrap: ' + String(e && e.message)); }

  await setupGame(Game);
  let result;
  const hashes = [];
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      const r = policy.daily(Gm, ctx);
      try { dailyTrace.push(snapshot(Gm)); } catch (e) {}
      try { hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm)); } catch (e) {}
      return r;
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
  let w4DayTrace = null, w5DayTrace = null;
  for (const d of dailyTrace) {
    if ((d.uw | 0) >= 4 && w4DayTrace === null) w4DayTrace = d.day;
    if ((d.uw | 0) >= 5 && w5DayTrace === null) w5DayTrace = d.day;
  }
  let endUw = null;
  try { endUw = (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : null; } catch (e) {}
  const out = { seed, anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    w4Day, w5Day, w4DayTrace, w5DayTrace, endUnlockedWave: endUw,
    national, table, won, days: result.days, gameDays, endReason: result.endReason,
    endScaleRank: (function () { try { return Game.scaleRank ? Game.scaleRank() : null; } catch (e) { return null; } })(),
    dailyTrace, spawns, unlockLines,
    attempts: (t.attempts || []).map(function (a) { return { day: a.day, mid: a.mid, wave: a.wave, cls: a.cls, reason: a.reason || null, caller: a.caller || null, titan: !!a.titan }; }),
    fieldFights: t.fieldFights || [], kills: t.kills || [],
    census: t.census || [],
    deedFacedByWave: facedByWave(Game), waveKillLogByWave: killLogByWave(Game),
    waveKills: result.waveKills || {},
    endStanding: (function () { try { return (typeof Game.villageStanding === 'function') ? Game.villageStanding() : null; } catch (e) { return null; } })(),
    endPeak: (function () { try { return (typeof Game._standingPeakWave === 'function') ? Game._standingPeakWave() : null; } catch (e) { return null; } })(),
    deaths: ((result.samples || {}).deaths || []).slice(),
    instrumentErrors: instrumentErrors.concat(t.instrumentErrors || []), musterErrs: mstore.errs,
    hashes };
  out.classification = CLS.classifyReplay(out);
  return out;
}

(async () => {
  if (!SEEDS.length) { console.error('MAXWAVE5 STOP: SEEDS env required (comma list).'); process.exit(2); }
  for (const seed of SEEDS) {
    try {
      const r = await oneRun(seed);
      console.log(JSON.stringify({ seed: seed, maxwave5: r }));
      console.error(`done s${seed}: maxWave=${r.maxWave} w5Day=${r.w5Day} w5DayTrace=${r.w5DayTrace} verdict=${r.classification.verdict} spawns5=${r.classification.spawnClasses.length} playerFights5=${r.classification.playerFights5.length} villagerFights5=${r.classification.villagerFights5.length} deed5=${r.classification.deedFaced5.length} kills5=${r.classification.kills5.length} nat=${r.national} table=${r.table} won=${r.won} end=${r.endReason} days=${r.gameDays} errs=${r.instrumentErrors.length}`);
    } catch (e) {
      console.error(`FAIL s${seed}: ${e && e.stack ? e.stack : e}`);
      process.exitCode = 1;
    }
  }
})();

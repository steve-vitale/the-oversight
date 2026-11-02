#!/usr/bin/env node
// creekdetour-driver-20261102.js — before/after driver for sim-creekdetour-b
// (Loop B fleshout-20261102T1030Z, axis scale-onramp). One process per
// seed-arm; never two harnesses in one process. Prints one JSON summary
// line per seed to stdout and writes one per-seed JSON file into
// evidence/2026-11-02/perseed-creekdetour-b/ (sims write once, on
// purpose, into evidence/<date>/).
//
// INSTRUMENT/POLICY SEPARATION: this driver (instrument) MAY read
// Game.worldMonsters() to record tile-sharing. NEITHER policy
// (scripts/policies/titanroute.js, scripts/policies/creekdetour.js)
// may — both target only the heard lair tile. The verdict's "reached"
// metric requires BOTH the policy march record (arrived:true) AND an
// instrument daily-post sample with the scholar on the lair tile;
// disagreement is NO-DATA for that seed.
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 \
//   ARM=base|detour DAYS=180 SEEDS=97307,97301 node scripts/creekdetour-driver-20261102.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const TR = require(path.join(REPO, 'scripts', 'policies', 'titanroute'));
const CD = require(path.join(REPO, 'scripts', 'policies', 'creekdetour'));
const HI = require(path.join(REPO, 'scripts', 'herald-instrument-20261030'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD']) {
  if (process.env[k] !== '1') { console.error(`CREEKDETOUR STOP: ${k}=1 is required.`); process.exit(2); }
}
const ARM = process.env.ARM || 'base';
if (ARM !== 'base' && ARM !== 'detour') { console.error('CREEKDETOUR STOP: ARM must be base|detour.'); process.exit(2); }
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
if (!SEEDS.length) { console.error('CREEKDETOUR STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) { /* anchor stays unknown */ }

function basePolicy() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive');
  return FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder');
}
function policyFor() {
  const b = basePolicy();
  if (ARM === 'detour') return CD.withCreekDetour(b, 'lead-creekdetour', 'lead-fullseat + creekdetour march/call');
  return TR.withTitanRoute(b, 'lead-titanroute', 'lead-fullseat + titanroute march/call');
}

const ANCHORED_RE = /THE HERALD|Scouts found its lair|fed in the night|struck .* in the night|THE HERALD came|pads into the clearing|THE CALL GOES OUT|answers!|REFUSES/;
const LAIR_RE = /Scouts found its lair — tile (\d+),(\d+)/;

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  const t = { attempts: [], tbOutcomes: {}, fieldFights: [], kills: [], musterEvents: [], census: [], transcripts: [], instrumentErrors: [] };
  const uninstall = HI.install(Game, t);

  let lairTile = null;
  const anchoredLines = [];
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          if (ANCHORED_RE.test(arg) && anchoredLines.length < 400) {
            anchoredLines.push({ day: gday(Game), line: String(arg).slice(0, 500) });
            const lm = LAIR_RE.exec(arg);
            if (lm && !lairTile) lairTile = { x: parseInt(lm[1], 10), y: parseInt(lm[2], 10) };
          }
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  function heraldMon() {
    try {
      const mons = Game.worldMonsters ? Game.worldMonsters() : [];
      return (mons || []).find(function (m) { return m && m.id === 'herald'; }) || null;
    } catch (e) { return null; }
  }

  const samples = [];
  let capturedCtx = null;
  function sample(phase) {
    try {
      const hm = heraldMon();
      const sx = Game.map ? Game.map.px : null, sy = Game.map ? Game.map.py : null;
      samples.push({ day: gday(Game), phase: phase, sx: sx, sy: sy,
        htx: hm ? hm.tx : null, hty: hm ? hm.ty : null,
        same: !!(hm && sx != null && hm.tx === sx && hm.ty === sy),
        present: !!hm,
        stance: hm ? (hm.stance || null) : null });
    } catch (e) { errors.push('sample: ' + String(e.message).slice(0, 80)); }
  }

  const wrapped = Object.assign({}, policy, {
    setup(Gm, ctx) { capturedCtx = ctx; if (policy.setup) return policy.setup(Gm, ctx); },
    upkeep(Gm, ctx) { sample('upkeep'); if (policy.upkeep) return policy.upkeep(Gm, ctx); },
    daily(Gm, ctx) {
      sample('daily-pre');
      try { return policy.daily(Gm, ctx); } finally { sample('daily-post'); }
    },
  });

  await setupGame(Game);
  let result = null;
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) { errors.push('rank: ' + String(e.message).slice(0, 80)); }
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) { errors.push('prog: ' + String(e.message).slice(0, 80)); }
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) { /* won stays 0 */ }
  const gameDays = (st.scholar && st.scholar.day) || 0;
  const maxWave = result.maxWaveUnlocked || 1;
  const att = (t.attempts || []).filter(a => a.mid === 'herald');
  const shareDays = [];
  const shareSeen = {};
  for (const s of samples) {
    if (s.same && !shareSeen[s.day]) { shareSeen[s.day] = true; shareDays.push(s.day); }
  }
  let firstPresentDay = null, lastPresentDay = null;
  for (const s of samples) {
    if (s.present) { if (firstPresentDay === null) firstPresentDay = s.day; lastPresentDay = s.day; }
  }
  // March records: titan ctx for base, creekdetour ctx for detour.
  // Convert the refused-edges Set to a list so the JSON record is honest.
  let marchCtx = null;
  if (capturedCtx) {
    if (ARM === 'detour' && capturedCtx.creekdetour) {
      marchCtx = Object.assign({}, capturedCtx.creekdetour);
      if (marchCtx.refusedEdges instanceof Set) marchCtx.refusedEdges = Array.from(marchCtx.refusedEdges);
    } else if (ARM === 'base' && capturedCtx.titan) {
      marchCtx = capturedCtx.titan;
    }
  }
  const marches = (marchCtx && marchCtx.marches) || [];
  const policyReached = marches.some(m => m.arrived === true);
  const policyReachedDays = marches.filter(m => m.arrived === true).map(m => m.day);
  const policyWays = marches.filter(m => m.arrived === true).map(m => m.way || 'greedy');
  // Instrument cross-check: a daily-post sample on the heard lair tile.
  const instrReachedDays = [];
  if (lairTile) {
    for (const s of samples) {
      if (s.phase === 'daily-post' && s.sx === lairTile.x && s.sy === lairTile.y && !instrReachedDays.includes(s.day)) {
        instrReachedDays.push(s.day);
      }
    }
  }
  const instrReached = instrReachedDays.length > 0;
  const reached = policyReached && instrReached;
  const reachedStatus = (policyReached === instrReached) ? (reached ? 'reached' : 'not-reached') : 'NO-DATA';
  const out = { seed, arm: ARM, anchorCommit: ANCHOR,
    lairTile: lairTile, firstPresentDay: firstPresentDay, lastPresentDay: lastPresentDay,
    shareDays: shareDays, shareCount: shareDays.length,
    firstShareDay: shareDays.length ? shareDays[0] : null,
    attempts: att.map(a => ({ day: a.day, cls: a.cls, reason: a.reason || null, caller: a.caller || null })),
    attemptCount: att.length,
    callLines: anchoredLines.filter(l => /THE CALL GOES OUT/.test(l.line)),
    callCount: anchoredLines.filter(l => /THE CALL GOES OUT/.test(l.line)).length,
    anchoredLines: anchoredLines,
    samples: samples,
    maxWave: maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national: national, table: table, won: won,
    days: result.days, gameDays: gameDays, endReason: result.endReason,
    deaths: ((result.samples || {}).deaths || []).length,
    errors: errors.concat(t.instrumentErrors || []),
    marchCtx: marchCtx,
    policyReached: policyReached, policyReachedDays: policyReachedDays, policyWays: policyWays,
    instrReached: instrReached, instrReachedDays: instrReachedDays,
    reached: reached, reachedStatus: reachedStatus };
  return out;
}

(async () => {
  const outDir = path.join(REPO, 'evidence', '2026-11-02', 'perseed-creekdetour-b');
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const rec = await oneRun(seed);
    const file = path.join(outDir, `cd-${ARM}-s${seed}.json`);
    fs.writeFileSync(file, JSON.stringify(rec, null, 2) + '\n');
    const line = { seed: rec.seed, arm: rec.arm, lairTile: rec.lairTile,
      shareCount: rec.shareCount, shareDays: rec.shareDays,
      attemptCount: rec.attemptCount, callCount: rec.callCount,
      reached: rec.reached, reachedStatus: rec.reachedStatus,
      policyReachedDays: rec.policyReachedDays, policyWays: rec.policyWays,
      instrReachedDays: rec.instrReachedDays,
      maxWave: rec.maxWave, national: rec.national, table: rec.table, won: rec.won,
      gameDays: rec.gameDays, endReason: rec.endReason, deaths: rec.deaths,
      file: path.relative(REPO, file) };
    console.log(JSON.stringify(line));
  }
})().catch(e => { console.error(e.stack); process.exitCode = 1; });

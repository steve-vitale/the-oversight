#!/usr/bin/env node
// titanroute-driver-20261102.js — before/after driver for sim-titanroute-a
// (Loop A 20261102T0915Z, axis scale-onramp). One process per seed-arm;
// never two harnesses in one process. STDOUT-RUNNER PATTERN: prints one
// JSON summary line per seed to stdout and writes one per-seed JSON file
// into evidence/2026-11-02/perseed-titanroute-a/ (sims write once, on
// purpose, into evidence/<date>/).
//
// INSTRUMENT/POLICY SEPARATION: this driver (instrument) MAY read
// Game.worldMonsters() to record tile-sharing. The POLICY
// (scripts/policies/titanroute.js) may NOT — it targets only the heard
// lair tile. The verdict's tile-share metric comes from this driver.
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 \
//   ARM=route DAYS=180 SEEDS=97307,97301 node scripts/titanroute-driver-20261102.js
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
const HI = require(path.join(REPO, 'scripts', 'herald-instrument-20261030'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD']) {
  if (process.env[k] !== '1') { console.error(`TITANROUTE STOP: ${k}=1 is required.`); process.exit(2); }
}
const ARM = process.env.ARM || 'base';
if (ARM !== 'base' && ARM !== 'route') { console.error('TITANROUTE STOP: ARM must be base|route.'); process.exit(2); }
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
if (!SEEDS.length) { console.error('TITANROUTE STOP: SEEDS required.'); process.exit(2); }
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
  if (ARM === 'route') return TR.withTitanRoute(b, 'lead-titanroute', 'lead-fullseat + titanroute march/call');
  return b;
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

  function heraldMon() {    try {
      const mons = Game.worldMonsters ? Game.worldMonsters() : [];
      return (mons || []).find(function (m) { return m && m.id === 'herald'; }) || null;
    } catch (e) { return null; }
  }

  // Instrument samples: upkeep-pre (3x/day: morning/midday) + daily-pre/post.
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
  const titanCtx = capturedCtx ? (capturedCtx.titan || null) : null;
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
    titanCtx: titanCtx };
  return out;
}

(async () => {
  const outDir = path.join(REPO, 'evidence', '2026-11-02', 'perseed-titanroute-a');
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const rec = await oneRun(seed);
    const file = path.join(outDir, `tr-${ARM}-s${seed}.json`);
    fs.writeFileSync(file, JSON.stringify(rec, null, 2) + '\n');
    const line = { seed: rec.seed, arm: rec.arm, lairTile: rec.lairTile,
      shareCount: rec.shareCount, shareDays: rec.shareDays,
      attemptCount: rec.attemptCount, callCount: rec.callCount,
      maxWave: rec.maxWave, national: rec.national, table: rec.table, won: rec.won,
      gameDays: rec.gameDays, endReason: rec.endReason, deaths: rec.deaths,
      file: path.relative(REPO, file) };
    console.log(JSON.stringify(line));
  }
})().catch(e => { console.error(e.stack); process.exitCode = 1; });

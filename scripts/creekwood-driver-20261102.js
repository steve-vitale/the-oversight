#!/usr/bin/env node
// creekwood-driver-20261102.js — before/after driver for sim-creekwood-a
// (Loop B fleshout-20261102T1155Z, axis scale-onramp). One process per
// seed-arm; never two harnesses in one process. Prints one JSON summary
// line per seed to stdout and writes one per-seed JSON file into
// evidence/2026-11-02/perseed-creekwood-a/ (sims write once, on
// purpose, into evidence/<date>/).
//
// BASELINE here is the creekdetour arm (not titanroute): the candidate
// differs from it ONLY by the creekwood march (walk-toward-then-bridge
// + takeWood leg). Wood at first march day is instrumented in BOTH
// arms: the instrument samples Game.woodCount() + state.village.wood
// on every daily-pre, and the record reports the values on the first
// march day (daily-pre precedes the policy daily, so it is the
// pre-leg value in the candidate and the pre-march value in the
// baseline). INSTRUMENT/POLICY SEPARATION: this driver (instrument)
// MAY read Game.worldMonsters() to record tile-sharing. NEITHER policy
// may — both target only the heard lair tile.
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 \
//   ARM=base|creekwood DAYS=180 SEEDS=97396,97307 node scripts/creekwood-driver-20261102.js
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
const CD = require(path.join(REPO, 'scripts', 'policies', 'creekdetour'));
const CW = require(path.join(REPO, 'scripts', 'policies', 'creekwood'));
const HI = require(path.join(REPO, 'scripts', 'herald-instrument-20261030'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD']) {
  if (process.env[k] !== '1') { console.error(`CREEKWOOD STOP: ${k}=1 is required.`); process.exit(2); }
}
const ARM = process.env.ARM || 'base';
if (ARM !== 'base' && ARM !== 'creekwood') { console.error('CREEKWOOD STOP: ARM must be base|creekwood.'); process.exit(2); }
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
if (!SEEDS.length) { console.error('CREEKWOOD STOP: SEEDS required.'); process.exit(2); }
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
  if (ARM === 'creekwood') return CW.withCreekwood(b, 'lead-creekwood', 'lead-fullseat + creekwood march/call');
  return CD.withCreekDetour(b, 'lead-creekdetour', 'lead-fullseat + creekdetour march/call');
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
      let wood = null, pile = null;
      try { wood = Game.woodCount(); } catch (e) { /* stays null */ }
      try { pile = ((Game.state || {}).village || {}).wood; if (pile === undefined) pile = null; } catch (e) { /* stays null */ }
      samples.push({ day: gday(Game), phase: phase, sx: sx, sy: sy,
        htx: hm ? hm.tx : null, hty: hm ? hm.ty : null,
        same: !!(hm && sx != null && hm.tx === sx && hm.ty === sy),
        present: !!hm,
        stance: hm ? (hm.stance || null) : null,
        wood: wood, pile: pile });
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
  let marchCtx = null;
  if (capturedCtx) {
    if (ARM === 'creekwood' && capturedCtx.creekwood) {
      marchCtx = Object.assign({}, capturedCtx.creekwood);
      if (marchCtx.refusedEdges instanceof Set) marchCtx.refusedEdges = Array.from(marchCtx.refusedEdges);
    } else if (ARM === 'base' && capturedCtx.creekdetour) {
      marchCtx = Object.assign({}, capturedCtx.creekdetour);
      if (marchCtx.refusedEdges instanceof Set) marchCtx.refusedEdges = Array.from(marchCtx.refusedEdges);
    }
  }
  const marches = (marchCtx && marchCtx.marches) || [];
  const policyReached = marches.some(m => m.arrived === true);
  const policyReachedDays = marches.filter(m => m.arrived === true).map(m => m.day);
  const policyWays = marches.filter(m => m.arrived === true).map(m => m.way || 'greedy');
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
  // Wood at first march day (daily-pre sample on that day, both arms).
  let woodAtFirstMarch = null, pileAtFirstMarch = null, firstMarchDay = null;
  if (marches.length) {
    firstMarchDay = marches[0].day;
    const pre = samples.find(s => s.phase === 'daily-pre' && s.day === firstMarchDay);
    if (pre) { woodAtFirstMarch = pre.wood; pileAtFirstMarch = pre.pile; }
  }
  // Bridge-leg firings across all march days (candidate) / bridgeBlocked days.
  const bridgeDays = marches.filter(m => (m.bridgesUsed && m.bridgesUsed.length) || m.bridgeUsed).map(m => m.day);
  const bridgeBlockedDays = marches.filter(m => m.bridgeBlocked).map(m => ({ day: m.day, bridgeBlocked: m.bridgeBlocked }));
  const woodLegDays = marches.filter(m => m.woodLeg && m.woodLeg.length).map(m => ({ day: m.day, woodLeg: m.woodLeg }));
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
    reached: reached, reachedStatus: reachedStatus,
    firstMarchDay: firstMarchDay, woodAtFirstMarch: woodAtFirstMarch, pileAtFirstMarch: pileAtFirstMarch,
    bridgeDays: bridgeDays, bridgeBlockedDays: bridgeBlockedDays, woodLegDays: woodLegDays };
  return out;
}

(async () => {
  const outDir = path.join(REPO, 'evidence', '2026-11-02', 'perseed-creekwood-a');
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const rec = await oneRun(seed);
    const file = path.join(outDir, `cw-${ARM}-s${seed}.json`);
    fs.writeFileSync(file, JSON.stringify(rec, null, 2) + '\n');
    const line = { seed: rec.seed, arm: rec.arm, lairTile: rec.lairTile,
      shareCount: rec.shareCount, shareDays: rec.shareDays,
      attemptCount: rec.attemptCount, callCount: rec.callCount,
      reached: rec.reached, reachedStatus: rec.reachedStatus,
      policyReachedDays: rec.policyReachedDays, policyWays: rec.policyWays,
      instrReachedDays: rec.instrReachedDays,
      firstMarchDay: rec.firstMarchDay, woodAtFirstMarch: rec.woodAtFirstMarch, pileAtFirstMarch: rec.pileAtFirstMarch,
      bridgeDays: rec.bridgeDays, bridgeBlockedDays: rec.bridgeBlockedDays,
      maxWave: rec.maxWave, national: rec.national, table: rec.table, won: rec.won,
      gameDays: rec.gameDays, endReason: rec.endReason, deaths: rec.deaths,
      file: path.relative(REPO, file) };
    console.log(JSON.stringify(line));
  }
})().catch(e => { console.error(e.stack); process.exitCode = 1; });

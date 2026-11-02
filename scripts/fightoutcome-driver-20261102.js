#!/usr/bin/env node
// fightoutcome-driver-20261102.js — pilot driver for the standing
// fight-outcome recorder (sim-fightoutcome-recorder, Loop A 20261102,
// axis scale-onramp). One process per seed; never two harnesses in
// one process. Prints one JSON summary line per seed to stdout and
// writes one per-seed JSON file into
// evidence/2026-11-02/perseed-fightoutcome-a/ (sims write once, on
// purpose, into evidence/<date>/).
//
// Policy stack: closecommit only (titanroute + musterclose +
// mustergap over lead-fullseat) — the same stack laircontact and
// heralddepart used, so outcomes are comparable to those arms'
// attempt records. The driver itself is deliberately thin: all
// outcome capture lives in scripts/fightoutcome-recorder.js, and
// this file only runs the sim, snapshots daily herald/titan state
// for context, and writes the per-seed JSON carrying the outcome
// rows. A future arm reuses the recorder with its own driver.
//
// Hooks are read-only: zero RNG draws, zero game-state writes.
// The driver's own say wrap records anchored call lines and the
// lair tile only; fight transcripts come from the recorder.
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 \
//   DAYS=180 SEEDS=97418 RUN=r1 node scripts/fightoutcome-driver-20261102.js
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
const MC = require(path.join(REPO, 'scripts', 'policies', 'musterclose'));
const MG = require(path.join(REPO, 'scripts', 'policies', 'mustergap'));
const REC = require(path.join(REPO, 'scripts', 'fightoutcome-recorder'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD']) {
  if (process.env[k] !== '1') { console.error(`FIGHTOUTCOME STOP: ${k}=1 is required.`); process.exit(2); }
}
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const RUN = process.env.RUN || 'r1';
if (!SEEDS.length) { console.error('FIGHTOUTCOME STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) { /* anchor stays unknown */ }

function policyFor() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive');
  const fd = FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder');
  const rt = TR.withTitanRoute(fd, 'lead-titanroute', 'lead-fullseat + titanroute march/call');
  const mc = MC.withMusterClose(rt, 'lead-musterclose', 'lead-titanroute + musterclose deepening');
  return MG.withMusterGap(mc, 'lead-musterclose-commit', 'lead-musterclose + mustergap commit-own');
}

const ANCHORED_RE = /THE CALL GOES OUT|answers!|REFUSES|Haven commits its own|steps? forward\.|No one is free to march|already march|does not notice you|you have \d+|counts \d+ blades|muster is hungry|struck .* in the night|fed in the night|fire is quieter|Packed:/;
const LAIR_RE = /Scouts found its lair — tile (\d+),(\d+)/;

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  const t = { attempts: [], tbFights: [], tbOutcomes: {}, fieldFights: [], kills: [], titanOutcomesAppended: [], transcripts: [], instrumentErrors: [] };
  const uninstall = REC.install(Game, t);

  let lairTile = null;
  const anchoredLines = [];
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          if (ANCHORED_RE.test(arg) && anchoredLines.length < 800) {
            anchoredLines.push({ day: gday(Game), line: String(arg).slice(0, 500) });
          }
          const lm = LAIR_RE.exec(arg);
          if (lm && !lairTile) lairTile = { x: parseInt(lm[1], 10), y: parseInt(lm[2], 10) };
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  // Light daily context trace: call day, herald presence, titan
  // outcomes snapshot, muster presence. Not the judged data — the
  // outcome rows are — but it anchors each fight in the run.
  const dailyTrace = [];
  let capturedCtx = null;
  function maybeTrace() {
    try {
      const tc = capturedCtx && capturedCtx.titan;
      if (!tc || !tc.called || typeof tc.called !== 'object') return;
      const today = gday(Game);
      if (dailyTrace.some(function (r) { return r.day === today; })) return;
      let heraldPresent = false, heraldTile = null;
      try {
        const mons = Game.worldMonsters ? Game.worldMonsters() : [];
        const h = (mons || []).find(function (m) { return m && m.id === 'herald'; });
        if (h) { heraldPresent = true; heraldTile = { x: h.tx, y: h.ty }; }
      } catch (e) {}
      let titanOutcomes = null, musterPresent = null;
      try { titanOutcomes = JSON.parse(JSON.stringify((((Game.state || {}).titans || {}).outcomes || []))); } catch (e) { titanOutcomes = null; }
      try { musterPresent = !!(((Game.state || {}).titans || {}).musters || {}).herald; } catch (e) {}
      dailyTrace.push({ day: today, callDay: tc.called.day,
        scholarTile: (Game.map ? { x: Game.map.px, y: Game.map.py } : null),
        lairTile: (tc.lair || lairTile) || null,
        heraldPresent: heraldPresent, heraldTile: heraldTile,
        titanOutcomes: titanOutcomes, musterPresent: musterPresent });
    } catch (e) { errors.push('maybeTrace: ' + String(e.message).slice(0, 80)); }
  }

  const wrapped = Object.assign({}, policy, {
    setup(Gm, ctx) { capturedCtx = ctx; if (policy.setup) return policy.setup(Gm, ctx); },
    daily(Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally { maybeTrace(); }
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
  const titanCtx = capturedCtx ? (capturedCtx.titan || null) : null;
  const callDay = (titanCtx && titanCtx.called && typeof titanCtx.called === 'object') ? titanCtx.called.day : null;

  // Unresolved = a FOUGHT attempt with no outcome row (by fightSeq).
  // The analyzer re-derives this independently; the driver lists it
  // here so a per-seed file is self-describing.
  const outcomeSeqs = {};
  (t.tbFights || []).forEach(function (f) { if (f.fightSeq != null) outcomeSeqs[f.fightSeq] = true; });
  const unresolved = (t.attempts || []).filter(function (a) { return a.cls === 'FOUGHT'; })
    .filter(function (a) { return !outcomeSeqs[a.fightSeq]; })
    .map(function (a) { return { fightSeq: a.fightSeq, day: a.day, mid: a.mid }; });
  let titanOutcomesEnd = null;
  try { titanOutcomesEnd = JSON.parse(JSON.stringify((((Game.state || {}).titans || {}).outcomes || []))); } catch (e) { titanOutcomesEnd = null; }

  const out = { seed, arm: 'closecommit', run: RUN, anchorCommit: ANCHOR,
    lairTile: lairTile, callDay: callDay,
    dailyTrace: dailyTrace,
    attempts: t.attempts,
    tbFights: t.tbFights,
    tbOutcomes: t.tbOutcomes,
    tbEndNoop: t.tbEndNoop || 0,
    fieldFights: t.fieldFights,
    kills: t.kills,
    titanOutcomesAppended: t.titanOutcomesAppended,
    titanOutcomesEnd: titanOutcomesEnd,
    unresolved: unresolved,
    attemptCount: (t.attempts || []).length,
    tbFightCount: (t.tbFights || []).length,
    fieldFightCount: (t.fieldFights || []).length,
    callLines: anchoredLines.filter(l => /THE CALL GOES OUT/.test(l.line)),
    callCount: anchoredLines.filter(l => /THE CALL GOES OUT/.test(l.line)).length,
    anchoredLines: anchoredLines,
    maxWave: maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national: national, table: table, won: won,
    days: result.days, gameDays: gameDays, endReason: result.endReason,
    deaths: ((result.samples || {}).deaths || []).length,
    errors: errors.concat(t.instrumentErrors || []),
    titanCtx: titanCtx };
  return out;
}

(async () => {
  const outDir = path.join(REPO, 'evidence', '2026-11-02', 'perseed-fightoutcome-a');
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const rec = await oneRun(seed);
    const file = path.join(outDir, `fo-closecommit-s${seed}-${RUN}.json`);
    fs.writeFileSync(file, JSON.stringify(rec, null, 2) + '\n');
    const fought = rec.attempts.filter(function (a) { return a.cls === 'FOUGHT'; });
    const line = { seed: rec.seed, run: rec.run, callDay: rec.callDay,
      attemptCount: rec.attemptCount,
      fought: fought.map(function (a) { return { seq: a.fightSeq, day: a.day, mid: a.mid, titan: a.titan }; }),
      tbFights: rec.tbFights.map(function (f) { return { seq: f.fightSeq, day: f.day, mid: f.mid, engine: f.engineResult, norm: f.normalized }; }),
      unresolved: rec.unresolved,
      fieldFights: rec.fieldFightCount,
      titanOutcomes: (rec.titanOutcomesEnd || []).map(function (o) { return { day: o.day, titan: o.titan, outcome: o.outcome }; }),
      maxWave: rec.maxWave, national: rec.national, table: rec.table, won: rec.won,
      gameDays: rec.gameDays, endReason: rec.endReason, deaths: rec.deaths,
      errors: rec.errors.length, file: path.relative(REPO, file) };
    console.log(JSON.stringify(line));
  }
})().catch(e => { console.error(e.stack); process.exitCode = 1; });

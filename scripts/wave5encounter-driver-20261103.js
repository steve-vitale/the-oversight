#!/usr/bin/env node
// wave5encounter-driver-20261103.js — driver for the wave-5
// faced-wall diagnostic (run fleshout-20261103T0203Z). Wave-5
// generalization of the 1915Z wave-4 driver: identical closecommit
// stack, identical say capture, per-seed JSON to
// evidence/2026-11-03/perseed-w5faced-a/.
// One process per seed; never two harnesses in one process.
//
// Policy stack verbatim from scripts/fightoutcome-driver-20261102.js
// (closecommit: titanroute + musterclose + mustergap over
// lead-fullseat). The instrument (scripts/wave5encounter-
// instrument-20261103.js) is read-only: zero RNG draws, zero
// game-state writes. Say transcripts go to /tmp only, never to the
// repo. Per-seed JSON goes to evidence/2026-11-03/
// perseed-w5faced-a/ (sims write once, on purpose).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 \
//   DAYS=180 SEEDS=97339,98201 RUN=w5diag node scripts/wave5encounter-driver-20261103.js
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
const INST = require(path.join(REPO, 'scripts', 'wave5encounter-instrument-20261103'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD']) {
  if (process.env[k] !== '1') { console.error(`WAVE5ENCOUNTER STOP: ${k}=1 is required.`); process.exit(2); }
}
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const RUN = process.env.RUN || 'w5diag';
if (!SEEDS.length) { console.error('WAVE5ENCOUNTER STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive');
  const fd = FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder');
  const rt = TR.withTitanRoute(fd, 'lead-titanroute', 'lead-fullseat + titanroute march/call');
  const mc = MC.withMusterClose(rt, 'lead-musterclose', 'lead-titanroute + musterclose deepening');
  return MG.withMusterGap(mc, 'lead-musterclose-commit', 'lead-musterclose + mustergap commit-own');
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  const says = [];
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') says.push({ day: gday(Game), line: String(arg).slice(0, 600) });
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  const inst = INST.install(Game);
  const t = inst.t;
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (d !== lastSnapDay) { lastSnapDay = d; inst.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { inst.snapshot(); } catch (e) {}
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  let scaleRank = null, endGate = null, tableProg = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { endGate = FD.snapFullSeat(Game); } catch (e) { errors.push('snapFullSeat: ' + String(e.message).slice(0, 80)); }
  try { tableProg = (st.scholar && st.scholar.prog && st.scholar.prog.table) || null; } catch (e) {}
  let tableLatch = 0, tableWaiting = null, tableDone = null;
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) tableLatch = 1; tableWaiting = !!pg.tableWaiting; tableDone = !!pg.tableDone; } catch (e) {}

  const out = {
    seed, arm: 'closecommit', run: RUN, anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1,
    tableLatch: tableLatch,
    tableWaiting: tableWaiting, tableDone: tableDone,
    tableSeat: tableProg ? tableProg.seat : null,
    tablePath: tableProg ? tableProg.path : null,
    endGate: endGate,
    targetRows: t.targetRows, castRows: t.castRows, spawnRows: t.spawnRows,
    triggerRows: t.triggerRows, startRows: t.startRows, tbEndRows: t.tbEndRows,
    fieldRows: t.fieldRows, removeRows: t.removeRows, daily: t.daily,
    sayCount: says.length, instrumentErrors: t.instrumentErrors.concat(errors),
  };
  return { out: out, says: says };
}

(async () => {
  const outDir = path.join(REPO, 'evidence', '2026-11-03', 'perseed-w5faced-a');
  fs.mkdirSync(outDir, { recursive: true });
  const saysDir = process.env.SAYS_DIR || '/tmp/wave5encounter-says';
  fs.mkdirSync(saysDir, { recursive: true });
  for (const seed of SEEDS) {
    const { out, says } = await oneRun(seed);
    const file = path.join(outDir, `w5-closecommit-s${seed}-${RUN}.json`);
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    fs.writeFileSync(path.join(saysDir, `w5-says-s${seed}-${RUN}.jsonl`), says.map(s => JSON.stringify(s)).join('\n') + '\n');
    const w5 = function (rows) { return rows.filter(function (r) { return r.wave === 5; }); };
    const targetW5Count = out.targetRows.filter(function (r) { return r.target === 5; }).length;
    const line = {
      seed: out.seed, run: out.run, days: out.days, endReason: out.endReason,
      won: out.won, scaleRank: out.scaleRank, maxWave: out.maxWave,
      tableLatch: out.tableLatch, seat: out.tableSeat,
      gateW4: out.endGate ? out.endGate.w4 : null, gateW5: out.endGate ? out.endGate.w5 : null,
      targetW5: targetW5Count, castW5: w5(out.castRows).length,
      spawnW5: w5(out.spawnRows).length, triggerW5: w5(out.triggerRows).length,
      startW5: w5(out.startRows).length, fieldW5: w5(out.fieldRows).length,
      removeW5: w5(out.removeRows).length,
      tableWaiting: out.tableWaiting, tableDone: out.tableDone,
      says: out.sayCount, errors: out.instrumentErrors.length, file: path.relative(REPO, file),
    };
    console.log(JSON.stringify(line));
  }
})().catch(e => { console.error(e.stack); process.exitCode = 1; });

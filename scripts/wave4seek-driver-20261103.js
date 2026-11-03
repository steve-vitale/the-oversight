#!/usr/bin/env node
// wave4seek-driver-20261103.js — pilot driver, arm sim-wave4encounter-lever.
// One process per seed; never two harnesses in one process. Prints one JSON
// summary line per seed to stdout and writes one per-seed JSON file into
// evidence/2026-11-03/perseed-wave4seek/ (sims write once, on purpose).
// Full say transcripts go ONLY to /tmp (never the repo).
//
// Arms (env ARM): baseline = closecommit stack verbatim from
// scripts/fightoutcome-driver-20261102.js; variant = baseline +
// scripts/policies/wave4seek.js. Env flags (same seven as the 1715Z
// driver): FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
// SEATDRIVE=1 FULLSEAT=1 HERALD=1. Mode herald, 180d death-aware cap.
//   ARM=baseline|variant SEEDS=98301,98302 DAYS=180 RUN=w4pilot \
//     node scripts/wave4seek-driver-20261103.js
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
const W4 = require(path.join(REPO, 'scripts', 'policies', 'wave4seek'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD']) {
  if (process.env[k] !== '1') { console.error(`WAVE4SEEK STOP: ${k}=1 is required.`); process.exit(2); }
}
const ARM = process.env.ARM || '';
if (ARM !== 'baseline' && ARM !== 'variant') { console.error('WAVE4SEEK STOP: ARM=baseline|variant required.'); process.exit(2); }
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const RUN = process.env.RUN || 'w4pilot';
if (!SEEDS.length) { console.error('WAVE4SEEK STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive');
  const fd = FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder');
  const rt = TR.withTitanRoute(fd, 'lead-titanroute', 'lead-fullseat + titanroute march/call');
  const mc = MC.withMusterClose(rt, 'lead-musterclose', 'lead-titanroute + musterclose deepening');
  const cc = MG.withMusterGap(mc, 'lead-musterclose-commit', 'lead-musterclose + mustergap commit-own');
  if (ARM === 'variant') return W4.withWave4Seek(cc, 'lead-wave4seek', 'closecommit + wave4seek daily patrol');
  return cc;
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  const says = [];
  const deedFights = []; // {day, mid, wave} via recordDeedFight wrap (calls orig)
  const errors = [];
  let w4UnlockDay = null;
  let capturedCtx = null;
  const origSay = Game.say;
  // NOTE: say wrap installed BEFORE setupGame so nothing is missed; the
  // fightoutcome driver installed after setup, but its recorder needed
  // post-setup order for a different reason. Say wrapping is read-only.
  try {
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') says.push({ day: gday(Game), line: String(arg).slice(0, 500) });
      } catch (e) {}
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
  try {
    const origRdf = Game.recordDeedFight;
    if (typeof origRdf === 'function') {
      Game.recordDeedFight = function (mid) {
        try {
          const mdef = ((Game.data || {}).monsters || []).find(m => m.id === mid);
          deedFights.push({ day: gday(Game), mid: mid, wave: (mdef && mdef.wave) || 1 });
        } catch (e) {}
        return origRdf.apply(this, arguments);
      };
    }
  } catch (e) { errors.push('rdf-wrap: ' + String(e.message).slice(0, 80)); }

  const wrapped = Object.assign({}, policy, {
    setup(Gm, ctx) { capturedCtx = ctx; if (policy.setup) return policy.setup(Gm, ctx); },
    daily(Gm, ctx) {
      let r = null;
      try { r = policy.daily(Gm, ctx); } finally {
        try {
          if (w4UnlockDay === null && typeof Gm.unlockedWave === 'function' && Gm.unlockedWave() >= 4) w4UnlockDay = gday(Gm);
        } catch (e) {}
      }
      return r;
    },
  });

  await setupGame(Game);
  let result = null;
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });

  let faced = {};
  try { faced = JSON.parse(JSON.stringify(((typeof Game.deedState === 'function') ? Game.deedState().wavesFaced : {}) || {})); } catch (e) { errors.push('faced: ' + String(e.message).slice(0, 80)); }
  const w4Faced = Object.keys(faced).filter(mid => (faced[mid] | 0) === 4);
  const w5Faced = Object.keys(faced).filter(mid => (faced[mid] | 0) === 5);
  let rank = 'village';
  try { rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  let table = 0;
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  let unlocked = 1;
  try { unlocked = (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : 1; } catch (e) {}
  const ctx = capturedCtx || {};
  const out = { seed, arm: ARM, run: RUN, anchorCommit: ANCHOR,
    days: result.days, gameDays: ((Game.state || {}).scholar || {}).day || 0, endReason: result.endReason,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, w4UnlockDay,
    national: (rank === 'national' || rank === 'global') ? 1 : 0, rank, table,
    won: !!Game.won ? 1 : 0,
    faced, w4Faced, w4Count: w4Faced.length, w5Faced, w5Count: w5Faced.length,
    deedFights, w4DeedFights: deedFights.filter(d => d.wave === 4),
    patrols: (ctx.w4seek && ctx.w4seek.patrols) || 0,
    patrolDays: (ctx.w4seek && ctx.w4seek.patrolDays) || [],
    sayCount: says.length, errors };
  return { out, says };
}

(async () => {
  const outDir = path.join(REPO, 'evidence', '2026-11-03', 'perseed-wave4seek');
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const { out, says } = await oneRun(seed);
    const file = path.join(outDir, `w4-${ARM}-s${seed}-${RUN}.json`);
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    try { fs.writeFileSync(`/tmp/w4seek-says-${ARM}-s${seed}-${RUN}.json`, JSON.stringify(says) + '\n'); } catch (e) {}
    console.log(JSON.stringify({ seed: out.seed, arm: out.arm, days: out.days, endReason: out.endReason,
      maxWave: out.maxWave, unlockedWave: out.unlockedWave, w4UnlockDay: out.w4UnlockDay,
      w4Count: out.w4Count, w4Faced: out.w4Faced, w5Count: out.w5Count,
      patrols: out.patrols, national: out.national, table: out.table, won: out.won, errors: out.errors }));
  }
})().catch(e => { console.error('WAVE4SEEK FATAL: ' + (e && e.stack || e)); process.exit(1); });

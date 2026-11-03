#!/usr/bin/env node
// curiousw4-driver-20261103.js — pilot driver, arm sim-curiousw4-a.
// One process per seed; never two harnesses in one process. Prints one JSON
// summary line per seed to stdout and writes one per-seed JSON file into
// evidence/2026-11-03/perseed-curiousw4-a/ (sims write once, on purpose).
// Full say transcripts go ONLY to /tmp (never the repo).
//
// Arms (env ARM): baseline = closecommit stack verbatim from
// scripts/fightoutcome-driver-20261102.js; variant = baseline +
// scripts/policies/curiousw4.js. Env flags (same seven as the 1915Z
// driver): FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
// SEATDRIVE=1 FULLSEAT=1 HERALD=1. Mode herald, 180d death-aware cap.
//   ARM=baseline|variant SEEDS=98501,98502 DAYS=180 RUN=cpilot \
//     node scripts/curiousw4-driver-20261103.js
//
// Instrument wraps are read-only: the say wrap records lines, the
// kill-ledger wrap records via rows, the deed wrap records faced fights,
// the tele wrap records scholar deaths inside sig-pressed fights (the
// cost leg's fight-identity attribution — never a day join). No wrap
// draws RNG.
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
const { tableFlags } = require(path.join(REPO, 'scripts', 'fightoutcome-tableflags'));
let CW = null;
try { CW = require(path.join(REPO, 'scripts', 'policies', 'curiousw4')); }
catch (e) { CW = null; } // KILLED-arm tree: variant runs fail loudly below

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD']) {
  if (process.env[k] !== '1') { console.error(`CURIOUSW4 STOP: ${k}=1 is required.`); process.exit(2); }
}
const ARM = process.env.ARM || '';
if (ARM !== 'baseline' && ARM !== 'variant') { console.error('CURIOUSW4 STOP: ARM=baseline|variant required.'); process.exit(2); }
if (ARM === 'variant' && !CW) { console.error('CURIOUSW4 STOP: curiousw4 policy absent (arm KILLED or not built).'); process.exit(2); }
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const RUN = process.env.RUN || 'cpilot';
if (!SEEDS.length) { console.error('CURIOUSW4 STOP: SEEDS required.'); process.exit(2); }
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
  if (ARM === 'variant') return CW.withCuriousW4(cc, 'lead-curiousw4', 'closecommit + curiousw4 sig-verb layer');
  return cc;
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  const says = [];
  const deedFights = [];
  const killVia = [];
  const attributedDeaths = []; // scholar deaths inside a sig-pressed fight
  const errors = [];
  let w4UnlockDay = null;
  let capturedCtx = null;
  const sigFightIds = () => {
    try { return (capturedCtx && capturedCtx._curiousSigFightIds) || []; } catch (e) { return []; }
  };
  try {
    const origSay = Game.say;
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
  try {
    const origRwk = Game.recordWaveKill;
    if (typeof origRwk === 'function') {
      Game.recordWaveKill = function (mid, killerVid, via) {
        try {
          const mdef = ((Game.data || {}).monsters || []).find(m => m.id === mid);
          killVia.push({ day: gday(Game), mid: mid, wave: (mdef && mdef.wave) || 1, via: String(via || '') });
        } catch (e) {}
        return origRwk.apply(this, arguments);
      };
    }
  } catch (e) { errors.push('rwk-wrap: ' + String(e.message).slice(0, 80)); }
  try {
    const origTele = Game.tele;
    if (typeof origTele === 'function') {
      Game.tele = function (type, data) {
        let ret = null;
        try { ret = origTele.apply(this, arguments); } catch (e) { throw e; }
        try {
          if (type === 'death' && data && data.player) {
            const f = Game.tbfight;
            if (f && f.id != null && sigFightIds().indexOf(f.id) >= 0) {
              attributedDeaths.push({ day: gday(Game), fightId: f.id, who: String(data.who || ''), cause: String(data.cause || '') });
            }
          }
        } catch (e) {}
        return ret;
      };
    }
  } catch (e) { errors.push('tele-wrap: ' + String(e.message).slice(0, 80)); }

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
  let tf = { tableWaiting: 0, tableDone: 0, table: 0 };
  try { tf = tableFlags(Game.progState ? Game.progState() : {}); } catch (e) {}
  let unlocked = 1;
  try { unlocked = (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : 1; } catch (e) {}
  const ctx = capturedCtx || {};
  const cur = (ctx.curious) || { uses: [] };
  const deaths = ((result && result.samples && result.samples.deaths) || []).slice();
  const deathByCause = {};
  let starvationDeaths = 0, scholarDeaths = 0;
  for (const d of deaths) {
    const c = String((d && d.cause) || 'unknown');
    deathByCause[c] = (deathByCause[c] || 0) + 1;
    if (/starv|hunger|famine/i.test(c)) starvationDeaths++;
    try { if (d.player) scholarDeaths++; } catch (e) {}
  }
  let tricks = {}, obs = {};
  try { tricks = JSON.parse(JSON.stringify((Game.state || {}).villagerTricks || {})); } catch (e) {}
  try { obs = JSON.parse(JSON.stringify((Game.state || {}).villageCounterObs || {})); } catch (e) {}
  const w4mids = (((Game.data || {}).monsters || []).filter(m => m && (m.wave | 0) === 4).map(m => m.id));
  const w4Tricks = w4mids.filter(mid => tricks[mid]);
  const w4Obs = {};
  for (const mid of w4mids) if (obs[mid]) w4Obs[mid] = obs[mid];
  const sigDays = new Set((cur.uses || []).map(u => u.day));
  const sigLines = says.filter(s => sigDays.has(s.day) && /COUNTER LEARNED|Contradict|Heresy|Refuse|Suburb|Algorithm|Eulogy|Congregation|Strike|Influencer|Audit|Eater/i.test(s.line));
  const out = { seed, arm: ARM, run: RUN, anchorCommit: ANCHOR,
    days: result.days, gameDays: ((Game.state || {}).scholar || {}).day || 0, endReason: result.endReason,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, w4UnlockDay,
    national: (rank === 'national' || rank === 'global') ? 1 : 0, rank,
    tableWaiting: tf.tableWaiting, tableDone: tf.tableDone, table: tf.table,
    won: !!Game.won ? 1 : 0,
    faced, w4Faced, w4Count: w4Faced.length, w5Faced, w5Count: w5Faced.length,
    deedFights, w4DeedFights: deedFights.filter(d => d.wave === 4),
    killVia, w4KillVia: killVia.filter(k => k.wave === 4),
    sigUses: cur.uses || [], sigUseCount: (cur.uses || []).length,
    attributedDeaths, attributedDeathCount: attributedDeaths.length,
    scholarDeaths, villagerTricks: tricks, w4Tricks, w4Obs,
    sigLines: sigLines.slice(0, 120),
    deaths: deaths.length, deathByCause, starvationDeaths,
    sayCount: says.length, errors };
  return { out, says };
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function writeWithRetry(file, data) {
  // EPERM-flap hardening (2026-11-03): host writes flap OK/EPERM across
  // seconds, and a single failed write must not lose a finished seed run.
  // Retry for up to ~2 minutes before giving up loudly.
  let last = null;
  for (let i = 0; i < 60; i++) {
    try { fs.writeFileSync(file, data); return; } catch (e) { last = e; await sleep(2000); }
  }
  throw last;
}
async function mkdirWithRetry(dir) {
  let last = null;
  for (let i = 0; i < 60; i++) {
    try { fs.mkdirSync(dir, { recursive: true }); return; } catch (e) { last = e; await sleep(2000); }
  }
  throw last;
}
(async () => {
  const outDir = path.join(REPO, 'evidence', '2026-11-03', 'perseed-curiousw4-a');
  await mkdirWithRetry(outDir);
  for (const seed of SEEDS) {
    const { out, says } = await oneRun(seed);
    // Summary FIRST so a lost write never loses the judged numbers.
    console.log(JSON.stringify({ seed: out.seed, arm: out.arm, days: out.days, endReason: out.endReason,
      maxWave: out.maxWave, unlockedWave: out.unlockedWave, w4UnlockDay: out.w4UnlockDay,
      w4Count: out.w4Count, w4Faced: out.w4Faced, w5Count: out.w5Count,
      sigUses: out.sigUseCount, attributedDeaths: out.attributedDeathCount, scholarDeaths: out.scholarDeaths,
      w4Tricks: out.w4Tricks, national: out.national, tableDone: out.tableDone, tableWaiting: out.tableWaiting,
      won: out.won, deaths: out.deaths, starvation: out.starvationDeaths, errors: out.errors }));
    const file = path.join(outDir, `s-${ARM}-s${seed}-${RUN}.json`);
    await writeWithRetry(file, JSON.stringify(out, null, 2) + '\n');
    try { fs.writeFileSync(`/tmp/curiousw4-says-${ARM}-s${seed}-${RUN}.json`, JSON.stringify(says) + '\n'); } catch (e) {}
  }
})().catch(e => { console.error('CURIOUSW4 FATAL: ' + (e && e.stack || e)); process.exit(1); });

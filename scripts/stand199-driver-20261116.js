// stand199-driver-20261116.js — JUDGED driver, arm sim-stand199-b
// (DIAG: the standing-199 stall on the haventarget band — 5/8 seeds end
// at gated standing exactly 199, two reach 295/420). Per-seed, per-day
// gated + raw standing with a per-contribution breakdown (war /
// diplomacy / plenty), readiness-4/5 bars, living veteran vids, link
// roll with trust, and scaleRank/nationalLive per day (for the H4
// trust-lapse table). Two legs, zero src/js change: OFF = master as-is,
// recorder off (trajectory reference); ON = master as-is + recorder
// wraps only. Policy: competent verbatim
// (scripts/policies/competent.js), 150d death-aware.
// Instrument: REUSED scripts/standing199-instrument-20261110.js (arm
// sim-standing199-a — proven on band 170233-170240, 0 instrument
// errors, reconciliation exact). The driver augments each snapshot
// (driver-side only) with scaleRank + nationalLive pure reads.
// STAND199_RECORDER=off skips installing the instrument (D2 leg).
// Usage:
//   STAND199_RECORDER=off SEEDS=102701,102702 RUN=stand199-b-pilot node scripts/stand199-driver-20261116.js
//   STAND199_RECORDER=on  SEEDS=102701,102702 RUN=stand199-b-pilot node scripts/stand199-driver-20261116.js
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const INST = require(path.join(REPO, 'scripts', 'standing199-instrument-20261110'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'stand199-b-pilot';
const RECORDER = process.env.STAND199_RECORDER || 'on';
const OUTDIR = process.env.OUTDIR || ('perseed-stand199-b-' + RECORDER);
if (RECORDER !== 'off' && RECORDER !== 'on') { console.error('STAND199 STOP: STAND199_RECORDER must be off|on, got ' + JSON.stringify(RECORDER)); process.exit(2); }
const RECORDER_ON = RECORDER === 'on';

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
let POLICY_SHA = 'unknown';
try { POLICY_SHA = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8')).digest('hex'); } catch (e) {}

function sleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) {
    const t0 = process.hrtime.bigint();
    while (process.hrtime.bigint() - t0 < BigInt(ms) * 1000000n) {}
  }
}
// writeRobust: host write-flap guard (haventarget lesson). Retries a
// refused write; on total failure dumps to stdout with @@FALLBACK and
// returns false so the caller can fail loudly instead of silently
// losing the corpus.
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 480; i++) {
    try {
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, data);
        const back = fs.readFileSync(filePath, 'utf8');
        if (back.length !== data.length) throw new Error('readback length mismatch');
        return true;
      }
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp, 'utf8');
      if (back.length !== data.length) throw new Error('readback length mismatch');
      fs.renameSync(tmp, filePath);
      return true;
    } catch (e) {
      if (i === 479) { process.stdout.write('@@FALLBACK ' + filePath + '\n' + data + '\n'); return false; }
      sleepMs(250);
    }
  }
  return false;
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function safe(fn, fallback) { try { const v = fn(); return v === undefined ? fallback : v; } catch (e) { return fallback; } }
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || []).reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) { return 0; }
}
function aliveCount(Game) {
  try {
    const roster = ((Game.state || {}).village || {}).roster || [];
    let n = 0;
    for (let i = 0; i < roster.length; i++) {
      let dead = false;
      try { const p = Game.getPerson ? Game.getPerson(roster[i]) : null; if (p && p.dead) dead = true; } catch (e) {}
      if (!dead) n++;
    }
    return n;
  } catch (e) { return 0; }
}
function scaleRankOf(Game) { return safe(function () { return Game.scaleRank ? Game.scaleRank() : null; }, null); }
function nationalLiveOf(Game) { return safe(function () { return !!(Game.state || {}).nationalLive; }, false); }
// sigOf: the daily trajectory signature, identical shape on both legs
// (D2 compares OFF vs ON on exactly these fields).
function sigOf(Game) {
  const st = Game.villageStanding ? safe(function () { return Game.villageStanding(); }, null) : null;
  return {
    day: gday(Game),
    living: aliveCount(Game),
    pantryKcal: pantryKcal(Game),
    gated: safe(function () { return Game.villageStandingTotal ? Game.villageStandingTotal() : null; }, null),
    raw: st ? (st.total | 0) : null,
    war: st ? (st.war | 0) : null,
    diplomacy: st ? (st.diplomacy | 0) : null,
    plenty: st ? (st.plenty | 0) : null,
    capped: safe(function () { return Game.standingPlentyCappedTotal ? Game.standingPlentyCappedTotal() : null; }, null),
    peakWave: safe(function () { return Game._standingPeakWave ? Game._standingPeakWave() : null; }, null),
    scaleRank: scaleRankOf(Game),
    nationalLive: nationalLiveOf(Game),
  };
}

// Tight say filter (standaccum-b lesson: loose /held|feast/ fills the
// cap with fight/storm/keepsake noise). Only standing-line and hold-beat
// shapes, which is what the sense read needs.
const SAY_RE = /^Standing \d|HELD at wave|draft (stays|waits)|blood your fighters|fifth draft is not bought/;

async function oneRun(seed, opts) {
  opts = opts || {};
  const days = opts.days || DAYS;
  const recorderOn = opts.recorderOn != null ? !!opts.recorderOn : RECORDER_ON;
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-stand199-b', fullTelemetry: false });
  await setupGame(Game);
  const standSays = [];
  let sayCount = 0;
  const errors = [];
  let inst = null;
  const dailySig = [];
  if (recorderOn) {
    try {
      const origSay = Game.say;
      Game.say = function () {
        try {
          const arg = arguments.length ? arguments[0] : null;
          if (typeof arg === 'string') {
            sayCount++;
            if (SAY_RE.test(arg) && standSays.length < 150) standSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
          }
        } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
        return origSay.apply(this, arguments);
      };
    } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }
    inst = INST.install(Game);
  }
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (d !== lastSnapDay) {
            lastSnapDay = d;
            if (recorderOn) {
              const snap = inst.snapshot();
              // Driver-side augmentation only (instrument module
              // untouched): scaleRank + nationalLive for the H4 table.
              snap.scaleRank = scaleRankOf(Game);
              snap.nationalLive = nationalLiveOf(Game);
              dailySig.push({
                day: snap.day, living: snap.living, pantryKcal: pantryKcal(Game),
                gated: snap.gated, raw: snap.standing ? (snap.standing.total | 0) : null,
                war: snap.standing ? (snap.standing.war | 0) : null,
                diplomacy: snap.standing ? (snap.standing.diplomacy | 0) : null,
                plenty: snap.standing ? (snap.standing.plenty | 0) : null,
                capped: snap.capped, peakWave: snap.peakWave,
                scaleRank: snap.scaleRank, nationalLive: snap.nationalLive,
              });
            } else {
              dailySig.push(sigOf(Game));
            }
          }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: days, manifest: undefined, sampleEvery: 30 }); });
  if (recorderOn) {
    try {
      const snap = inst.snapshot();
      snap.scaleRank = scaleRankOf(Game);
      snap.nationalLive = nationalLiveOf(Game);
    } catch (e) {}
    try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }
  }

  const st = Game.state || {};
  let scaleRank = null, unlocked = null, memorial = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
  try { memorial = Game.memorialRoll ? Game.memorialRoll() : null; } catch (e) { memorial = null; errors.push('memorialRoll: ' + String(e.message).slice(0, 80)); }
  let standing = null;
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  let standingRaw = null;
  try { standingRaw = Game.villageStanding ? Game.villageStanding().total : null; } catch (e) {}
  let w3kills = 0, w4kills = 0, w5kills = 0;
  try {
    const log = st.waveKillLog || [];
    for (let i = 0; i < log.length; i++) {
      const w = (log[i] && log[i].w) | 0;
      if (w === 3) w3kills++;
      else if (w === 4) w4kills++;
      else if (w >= 5) w5kills++;
    }
  } catch (e) { errors.push('waveKillLog: ' + String(e.message).slice(0, 80)); }
  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (d) {
    return { day: d.day, kind: d.kind || null, who: d.who || null, cause: d.cause || null, player: !!d.player };
  });

  const out = {
    seed: seed, arm: 'stand199-b', run: RUN, leg: recorderOn ? 'on' : 'off',
    anchorCommit: ANCHOR, recorderOn: recorderOn,
    policySha: POLICY_SHA, policy: 'competent',
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked,
    standing: standing, standingRaw: standingRaw,
    memorial: memorial, deaths: deaths,
    w3kills: w3kills, w4kills: w4kills, w5kills: w5kills,
    daily: recorderOn ? inst.t.daily : null,
    dailySig: dailySig,
    standSays: standSays, sayCount: sayCount,
    instrumentErrors: (recorderOn ? inst.t.instrumentErrors : []).concat(errors),
  };
  return out;
}

if (require.main === module) (async function () {
  if (!SEEDS.length) { console.error('STAND199 STOP: SEEDS required.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-16', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'stand199-b-s' + seed + '-' + RUN + '-' + RECORDER + '.json');
    if (fs.existsSync(file)) { console.error('STAND199 STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  let failed = false;
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'stand199-b-s' + seed + '-' + RUN + '-' + RECORDER + '.json');
    const ok = writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    if (!ok) failed = true;
    const last = (out.daily && out.daily[out.daily.length - 1]) || {};
    const r5 = last.readiness5 || {};
    console.log(JSON.stringify({
      seed: out.seed, leg: out.leg, anchor: (out.anchorCommit || '').slice(0, 12),
      policySha: (out.policySha || '').slice(0, 12), recorderOn: out.recorderOn,
      days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, standingRaw: out.standingRaw,
      scaleRank: out.scaleRank,
      endGated: last.gated != null ? last.gated : (out.dailySig.length ? out.dailySig[out.dailySig.length - 1].gated : null),
      endRaw: last.standing ? last.standing.total : (out.dailySig.length ? out.dailySig[out.dailySig.length - 1].raw : null),
      endReady: r5.ready != null ? r5.ready : null,
      snapshots: out.daily ? out.daily.length : 0, sigDays: out.dailySig.length,
      deaths: out.deaths.length, w4kills: out.w4kills,
      errors: out.instrumentErrors.length, wrote: ok,
      file: path.relative(REPO, file),
    }));
  }
  if (failed) { console.error('STAND199 STOP: a corpus write fell back to stdout — see @@FALLBACK above.'); process.exit(3); }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun, sigOf: sigOf, writeRobust: writeRobust };

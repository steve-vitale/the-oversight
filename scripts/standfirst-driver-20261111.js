// standfirst-driver-20261111.js — standing points first-numbers pilot driver
// (arm sim-standfirst-b, run fleshout-loop-b-20261111T1131Z). Competent policy
// verbatim, 150d death-aware horizon, fresh band 190351–190358.
//
// Two legs on the same seeds; the ONLY difference is whether the
// instrument is installed:
//   STANDFIRST_MODE=control -> instrument ON (the judged leg)
//   STANDFIRST_MODE=neutral -> instrument OFF (no wraps, no snapshots;
//     end-of-run wall numbers only) — the neutrality leg.
// Per-seed JSON goes to evidence/2026-11-11/perseed-standfirst-b/
// (sims write once, on purpose). Refuses to overwrite an existing
// per-seed file. Writes use the fishstaff-b writeRobust pattern
// (tmp + readback + @@FALLBACK stdout after 60 retries) so an EPERM
// flap cannot silently lose a seed.
// Usage:
//   DAYS=150 SEEDS=190351,190352 RUN=standfirst-pilot STANDFIRST_MODE=control node scripts/standfirst-driver-20261111.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const SF = require(path.join(REPO, 'scripts', 'standfirst-instrument-20261111'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'standfirst-pilot';
const MODE = (process.env.STANDFIRST_MODE || 'control').toLowerCase();
const INST_ON = MODE !== 'neutral';
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-11', 'perseed-standfirst-b');

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 60; i++) {
    try {
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, data);
        const back = fs.readFileSync(filePath, 'utf8');
        if (back.length !== data.length) throw new Error('readback length mismatch');
        return;
      }
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp, 'utf8');
      if (back.length !== data.length) throw new Error('readback length mismatch');
      fs.renameSync(tmp, filePath);
      return;
    } catch (e) {
      if (i === 59) {
        process.stdout.write('@@FALLBACK ' + filePath + '\n' + data + '\n');
        return;
      }
      const t0 = Date.now(); while (Date.now() - t0 < 2000) {}
    }
  }
}

// Prereg regex (same early-game-only caveat as the siblings: the 200-line
// cap can exhaust early — narrowed to standing/ladder/overtime/feast/
// capstone language so generic flavor does not eat it).
const SAY_RE = /standing|ladder|STANDING|📡|OVERTIME|RERUN|feast|FEAST|bundle|BUNDLE|capstone|TRIBUTE|tribute|Respected Village|VILLAGE STANDING|REGIONAL STANDING|NATIONAL STANDING|carried this rung|next act|fifth draft|the wait stretches|Galactic Seat|table.*seat|seat.*table/i;

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-standfirst', fullTelemetry: false });
  const standingSays = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (SAY_RE.test(arg) && standingSays.length < 200) standingSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let sf = null;
  if (INST_ON) sf = SF.install(Game);
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (sf && d !== lastSnapDay) { lastSnapDay = d; sf.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { if (sf) sf.snapshot(); } catch (e) {}
  try { if (sf) sf.uninstall(); } catch (e) { errors.push('uninstall-sf: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  let scaleRank = null, unlocked = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
  let standing = null;
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  let ladder = null;
  try { ladder = Game.villageLadder ? Game.villageLadder() : null; } catch (e) {}
  let pantryKcal = 0;
  try {
    pantryKcal = ((st.village || {}).pantry || []).reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) {}

  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (d) {
    return { day: d.day, kind: d.kind || null, who: d.who || null, cause: d.cause || null, player: !!d.player };
  });

  const out = {
    seed: seed, arm: 'standfirst', run: RUN, mode: MODE,
    anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    ladder: ladder,
    endPantryKcal: pantryKcal,
    standingSays: standingSays, sayCount: sayCount,
    instrumentErrors: (sf ? sf.t.instrumentErrors : []).concat(errors),
    deaths: deaths,
  };
  if (sf) {
    out.ladderTickEvents = sf.t.ladderTickEvents;
    out.stageBeatEvents = sf.t.stageBeatEvents;
    out.capBeatEvents = sf.t.capBeatEvents;
    out.rewardEvents = sf.t.rewardEvents;
    out.cashOutEvents = sf.t.cashOutEvents;
    out.bankEvents = sf.t.bankEvents;
    out.capReadyEvents = sf.t.capReadyEvents;
    out.capDeliverEvents = sf.t.capDeliverEvents;
    out.bundleEvents = sf.t.bundleEvents;
    out.buyOutEvents = sf.t.buyOutEvents;
    out.feastEvents = sf.t.feastEvents;
    out.overtimeEvents = sf.t.overtimeEvents;
    out.teleEvents = sf.t.teleEvents;
    out.daily = sf.t.daily;
    out.wrapLive = sf.t.wrapLive;
    out.wrapCounts = sf.t.wrapCounts;
  }
  return out;
}

(async function () {
  if (!SEEDS.length) { console.error('STANDFIRST STOP: SEEDS required.'); process.exit(2); }
  if (MODE !== 'control' && MODE !== 'neutral') { console.error('STANDFIRST STOP: STANDFIRST_MODE must be control|neutral.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'standfirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('STANDFIRST STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'standfirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      ladderStage: out.ladder ? out.ladder.stage : null,
      ladderCounted: out.ladder ? out.ladder.counted : null,
      endPantryKcal: out.endPantryKcal,
      ladderTicks: out.ladderTickEvents ? out.ladderTickEvents.length : null,
      stageBeats: out.stageBeatEvents ? out.stageBeatEvents.length : null,
      capBeats: out.capBeatEvents ? out.capBeatEvents.length : null,
      rewards: out.rewardEvents ? out.rewardEvents.length : null,
      cashOuts: out.cashOutEvents ? out.cashOutEvents.length : null,
      banks: out.bankEvents ? out.bankEvents.length : null,
      capReady: out.capReadyEvents ? out.capReadyEvents.length : null,
      capDelivers: out.capDeliverEvents ? out.capDeliverEvents.length : null,
      bundles: out.bundleEvents ? out.bundleEvents.length : null,
      buyOuts: out.buyOutEvents ? out.buyOutEvents.length : null,
      feasts: out.feastEvents ? out.feastEvents.length : null,
      overtime: out.overtimeEvents ? out.overtimeEvents.length : null,
      tele: out.teleEvents ? out.teleEvents.length : null,
      snapshots: out.daily ? out.daily.length : null,
      standingSays: out.standingSays.length,
      deaths: out.deaths.length,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun };

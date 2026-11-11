// dutyfirst-driver-20261111.js — duties first-numbers pilot driver
// (arm sim-dutyfirst-b, run fleshout-loop-b-20261111T1131Z, adoption of the
// stranded 0835Z prereg). Competent policy verbatim, 150d death-aware
// horizon, fresh band 190311–190318.
//
// Two legs on the same seeds; the ONLY difference is whether the
// instrument is installed:
//   DUTYFIRST_MODE=control -> instrument ON (the judged leg)
//   DUTYFIRST_MODE=neutral -> instrument OFF (no wraps, no snapshots;
//     end-of-run wall numbers only) — the neutrality leg.
// Per-seed JSON goes to evidence/2026-11-11/perseed-dutyfirst-b/
// (sims write once, on purpose). Refuses to overwrite an existing
// per-seed file. Writes use the fishstaff-b writeRobust pattern
// (tmp + readback + @@FALLBACK stdout after 60 retries) so an EPERM
// flap cannot silently lose a seed.
// Usage:
//   DAYS=150 SEEDS=190311,190312 RUN=dutyfirst-pilot DUTYFIRST_MODE=control node scripts/dutyfirst-driver-20261111.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const DI = require(path.join(REPO, 'scripts', 'dutyfirst-instrument-20261111'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'dutyfirst-pilot';
const MODE = (process.env.DUTYFIRST_MODE || 'control').toLowerCase();
const INST_ON = MODE !== 'neutral';
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-11', 'perseed-dutyfirst-b');

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

// Duty say lines: the assignment/return lines (emoji-led), the refusal
// lines, the medic lines. 400 lines/seed cap (raised from trapfirst-a's
// 200 after its metric-review item (g)); cap truncation recorded per
// seed.
const SAY_RE = /📋|🌿|🏹|🪵|🪨|🍂|💧|🌱|🎣|🍲|🕯️|📖|🧵|🔭|⚔️|camp healer|no healer|cured them|is in no shape|can barely stand|face-to-face|Trust too low|haven't earned|Why should I listen|hesitates, then backs off|stopped asking|organizing the/i;

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-dutyfirst', fullTelemetry: false });
  const dutySays = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (SAY_RE.test(arg) && dutySays.length < 400) dutySays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let di = null;
  if (INST_ON) di = DI.install(Game);
  let lastSnapDay = -1;
  let lastCtx = null;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      lastCtx = ctx;
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (di && d !== lastSnapDay) { lastSnapDay = d; di.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { if (di) di.snapshot(); } catch (e) {}
  try { if (di) di.uninstall(); } catch (e) { errors.push('uninstall-di: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  let scaleRank = null, unlocked = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
  let standing = null;
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  let pantryKcal = 0;
  try {
    pantryKcal = ((st.village || {}).pantry || []).reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) {}

  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (d) {
    return { day: d.day, kind: d.kind || null, who: d.who || null, cause: d.cause || null, player: !!d.player };
  });

  const out = {
    seed: seed, arm: 'dutyfirst', run: RUN, mode: MODE,
    anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    dutySays: dutySays, sayCount: sayCount, sayCapped: dutySays.length >= 400,
    instrumentErrors: (di ? di.t.instrumentErrors : []).concat(errors),
    deaths: deaths,
  };
  if (di) {
    out.assignCalls = di.t.assignCalls;
    out.resolveCalls = di.t.resolveCalls;
    out.resolutions = di.t.resolutions;
    out.hunts = di.t.hunts;
    out.hurts = di.t.hurts;
    out.deposits = di.t.deposits;
    out.patrols = di.t.patrols;
    out.waveKills = di.t.waveKills;
    out.medicTicks = di.t.medicTicks;
    out.cureAttempts = di.t.cureAttempts;
    out.careTicks = di.t.careTicks;
    out.teleTrap = di.t.teleTrap;
    out.deeds = di.t.deeds;
    out.practiceReps = di.t.practiceReps;
    out.daily = di.t.daily;
    out.wrapLive = di.t.wrapLive;
  }
  return out;
}

(async function () {
  if (!SEEDS.length) { console.error('DUTYFIRST STOP: SEEDS required.'); process.exit(2); }
  if (MODE !== 'control' && MODE !== 'neutral') { console.error('DUTYFIRST STOP: DUTYFIRST_MODE must be control|neutral.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'dutyfirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('DUTYFIRST STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'dutyfirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      endPantryKcal: out.endPantryKcal,
      assignCalls: out.assignCalls ? out.assignCalls.length : null,
      resolveCalls: out.resolveCalls ? out.resolveCalls.length : null,
      resolutions: out.resolutions ? out.resolutions.length : null,
      hunts: out.hunts ? out.hunts.length : null,
      hurts: out.hurts ? out.hurts.length : null,
      deposits: out.deposits ? out.deposits.length : null,
      patrols: out.patrols ? out.patrols.length : null,
      waveKills: out.waveKills ? out.waveKills.length : null,
      medicTicks: out.medicTicks ? out.medicTicks.length : null,
      cureAttempts: out.cureAttempts ? out.cureAttempts.length : null,
      careTicks: out.careTicks ? out.careTicks.length : null,
      teleTrap: out.teleTrap ? out.teleTrap.length : null,
      deeds: out.deeds ? out.deeds.length : null,
      practiceReps: out.practiceReps ? out.practiceReps.length : null,
      snapshots: out.daily ? out.daily.length : null,
      dutySays: out.dutySays.length, sayCapped: out.sayCapped,
      deaths: out.deaths.length,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun };

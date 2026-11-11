// trapfirst-driver-20261110.js — trapping first-numbers pilot driver
// (arm sim-trapfirst-a, run fleshout-20261111T0315Z). Competent policy
// verbatim, 150d death-aware horizon, fresh band 180241–180248.
//
// Two legs on the same seeds; the ONLY difference is whether the
// instrument is installed:
//   TRAPFIRST_MODE=control -> instrument ON (the judged leg)
//   TRAPFIRST_MODE=neutral -> instrument OFF (no wraps, no snapshots;
//     end-of-run wall numbers only) — the neutrality leg.
// Per-seed JSON goes to evidence/2026-11-10/perseed-trapfirst-a/
// (sims write once, on purpose). Refuses to overwrite an existing
// per-seed file. Writes use the fishstaff-b writeRobust pattern
// (tmp + readback + @@FALLBACK stdout after 60 retries) so an EPERM
// flap cannot silently lose a seed.
// Usage:
//   DAYS=150 SEEDS=180241,180242 RUN=trapfirst-pilot TRAPFIRST_MODE=control node scripts/trapfirst-driver-20261110.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const TI = require(path.join(REPO, 'scripts', 'trapfirst-instrument-20261110'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'trapfirst-pilot';
const MODE = (process.env.TRAPFIRST_MODE || 'control').toLowerCase();
const INST_ON = MODE !== 'neutral';
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-10', 'perseed-trapfirst-a');

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

// Narrow trap regex: 'pit' only as a whole word (bare 'pit' would match
// 'despite'/'spit' and exhaust the cap on unrelated lines — the fishfirst-a
// metric-review lesson).
const SAY_RE = /🪤|trap|snare|trapline|deadfall|\bpit\b/i;

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-trapfirst', fullTelemetry: false });
  const trapSays = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (SAY_RE.test(arg) && trapSays.length < 200) trapSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let ti = null;
  if (INST_ON) ti = TI.install(Game);
  let lastSnapDay = -1;
  let lastCtx = null;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      lastCtx = ctx;
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (ti && d !== lastSnapDay) { lastSnapDay = d; ti.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { if (ti) ti.snapshot(); } catch (e) {}
  try { if (ti) ti.uninstall(); } catch (e) { errors.push('uninstall-ti: ' + String(e.message).slice(0, 80)); }

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
    seed: seed, arm: 'trapfirst', run: RUN, mode: MODE,
    anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    trapSays: trapSays, sayCount: sayCount,
    instrumentErrors: (ti ? ti.t.instrumentErrors : []).concat(errors),
    deaths: deaths,
  };
  if (ti) {
    out.trapSpecies = ti.t.trapSpecies;
    out.deposits = ti.t.deposits;
    out.carcasses = ti.t.carcasses;
    out.trapSets = ti.t.trapSets;
    out.trapCrafts = ti.t.trapCrafts;
    out.trapChecks = ti.t.trapChecks;
    out.luckRolls = ti.t.luckRolls;
    out.teleTrap = ti.t.teleTrap;
    out.teleEat = ti.t.teleEat;
    out.huntCalls = ti.t.huntCalls;
    out.deeds = ti.t.deeds;
    out.spawns = ti.t.spawns;
    out.cleans = ti.t.cleans;
    out.draws = ti.t.draws;
    out.eats = ti.t.eats;
    out.daily = ti.t.daily;
    out.wrapLive = ti.t.wrapLive;
  }
  return out;
}

(async function () {
  if (!SEEDS.length) { console.error('TRAPFIRST STOP: SEEDS required.'); process.exit(2); }
  if (MODE !== 'control' && MODE !== 'neutral') { console.error('TRAPFIRST STOP: TRAPFIRST_MODE must be control|neutral.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'trapfirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('TRAPFIRST STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'trapfirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      endPantryKcal: out.endPantryKcal,
      deposits: out.deposits ? out.deposits.length : null,
      carcasses: out.carcasses ? out.carcasses.length : null,
      trapSets: out.trapSets ? out.trapSets.length : null,
      trapCrafts: out.trapCrafts ? out.trapCrafts.length : null,
      trapChecks: out.trapChecks ? out.trapChecks.length : null,
      luckRolls: out.luckRolls ? out.luckRolls.length : null,
      teleTrap: out.teleTrap ? out.teleTrap.length : null,
      huntCalls: out.huntCalls ? out.huntCalls.length : null,
      deeds: out.deeds ? out.deeds.length : null,
      spawns: out.spawns ? out.spawns.length : null,
      cleans: out.cleans ? out.cleans.length : null,
      draws: out.draws ? out.draws.length : null,
      eats: out.eats ? out.eats.length : null,
      snapshots: out.daily ? out.daily.length : null,
      trapSays: out.trapSays.length,
      deaths: out.deaths.length,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun };

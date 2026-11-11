// fansfirst-driver-20261111.js — fans / audience first-numbers pilot driver
// (arm sim-fansfirst-a, run fleshout-20261111T0715Z). Competent policy
// verbatim, 150d death-aware horizon, fresh band 190371–190378.
//
// Two legs on the same seeds; the ONLY difference is whether the
// instrument is installed:
//   FANSFIRST_MODE=control -> instrument ON (the judged leg)
//   FANSFIRST_MODE=neutral -> instrument OFF (no wraps, no snapshots;
//     end-of-run wall numbers only) — the neutrality leg.
// Per-seed JSON goes to evidence/2026-11-11/perseed-fansfirst-a/
// (sims write once, on purpose). Refuses to overwrite an existing
// per-seed file. Writes use the fishstaff-b writeRobust pattern
// (tmp + readback + @@FALLBACK stdout after 60 retries) so an EPERM
// flap cannot silently lose a seed.
// Usage:
//   DAYS=150 SEEDS=190371,190372 RUN=fansfirst-pilot FANSFIRST_MODE=control node scripts/fansfirst-driver-20261111.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const FF = require(path.join(REPO, 'scripts', 'fansfirst-instrument-20261111'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'fansfirst-pilot';
const MODE = (process.env.FANSFIRST_MODE || 'control').toLowerCase();
const INST_ON = MODE !== 'neutral';
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-11', 'perseed-fansfirst-a');

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

// Sense corpus: fan/audience language. Same regex as the instrument
// (uncapped there); the driver caps at 300 lines/seed.
// Caveat (same as the siblings): the cap can exhaust early on a
// fan-chatty seed, so the per-seed count is a lower bound and the
// instrument's uncapped fanSays is the census source.
const SAY_RE = FF.FAN_SAY_RE;

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-fansfirst', fullTelemetry: false });
  const fanSays = [];
  let sayCount = 0;
  const errors = [];
  function wrapSay(name) {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') return;
      Game[name] = function () {
        try {
          const arg = arguments.length ? arguments[0] : null;
          if (typeof arg === 'string') {
            sayCount++;
            if (SAY_RE.test(arg) && fanSays.length < 300) fanSays.push({ day: gday(Game), src: name, line: String(arg).slice(0, 600) });
          }
        } catch (e) { errors.push(name + '-wrap: ' + String(e.message).slice(0, 80)); }
        return orig.apply(this, arguments);
      };
    } catch (e) { errors.push(name + '-wrap-install: ' + String(e.message).slice(0, 80)); }
  }
  // say + sysSay: the harness stubs them as SEPARATE no-ops
  // (sim-harness.js:242-243), so both wraps are needed and there
  // is no double-count in node.
  wrapSay('say');
  wrapSay('sysSay');

  await setupGame(Game);
  let ff = null;
  if (INST_ON) ff = FF.install(Game);
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (ff && d !== lastSnapDay) { lastSnapDay = d; ff.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { if (ff) ff.snapshot(); } catch (e) {}
  try { if (ff) ff.uninstall(); } catch (e) { errors.push('uninstall-ff: ' + String(e.message).slice(0, 80)); }

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
    seed: seed, arm: 'fansfirst', run: RUN, mode: MODE,
    anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    fanSays: fanSays, sayCount: sayCount,
    instrumentErrors: (ff ? ff.t.instrumentErrors : []).concat(errors),
    deaths: deaths,
  };
  if (ff) {
    out.favorEvents = ff.t.favorEvents;
    out.packageEvents = ff.t.packageEvents;
    out.wackyEvents = ff.t.wackyEvents;
    out.grantEvents = ff.t.grantEvents;
    out.clubLineEvents = ff.t.clubLineEvents;
    out.boonEvents = ff.t.boonEvents;
    out.feedEvents = ff.t.feedEvents;
    out.dailyEvents = ff.t.dailyEvents;
    out.personaPackageEvents = ff.t.personaPackageEvents;
    out.interferenceEvents = ff.t.interferenceEvents;
    out.trialEvents = ff.t.trialEvents;
    out.fanSaysFull = ff.t.fanSays;
    out.teleEvents = ff.t.teleEvents;
    out.daily = ff.t.daily;
    out.wrapLive = ff.t.wrapLive;
    out.wrapCounts = ff.t.wrapCounts;
    out.sayDropped = ff.t.sayDropped;
    out.teleWrapped = ff.t.teleWrapped;
  }
  return out;
}

(async function () {
  if (!SEEDS.length) { console.error('FANSFIRST STOP: SEEDS required.'); process.exit(2); }
  if (MODE !== 'control' && MODE !== 'neutral') { console.error('FANSFIRST STOP: FANSFIRST_MODE must be control|neutral.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'fansfirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('FANSFIRST STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'fansfirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      endPantryKcal: out.endPantryKcal,
      favor: out.favorEvents ? out.favorEvents.length : null,
      packages: out.packageEvents ? out.packageEvents.length : null,
      boons: out.boonEvents ? out.boonEvents.length : null,
      feeds: out.feedEvents ? out.feedEvents.length : null,
      dailies: out.dailyEvents ? out.dailyEvents.length : null,
      trials: out.trialEvents ? out.trialEvents.length : null,
      interference: out.interferenceEvents ? out.interferenceEvents.length : null,
      fanSaysFull: out.fanSaysFull ? out.fanSaysFull.length : null,
      snapshots: out.daily ? out.daily.length : null,
      fanSays: out.fanSays.length,
      deaths: out.deaths.length,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun };

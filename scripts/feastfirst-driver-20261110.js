// feastfirst-driver-20261110.js — feast/tribute first-numbers pilot driver
// (arm sim-feastfirst-a, run fleshout-20261111T0646Z). Competent policy
// verbatim, 150d death-aware horizon, fresh band 180265–180272.
//
// Two legs on the same seeds; the ONLY difference is whether the
// instrument is installed:
//   FEASTFIRST_MODE=control -> instrument ON (the judged leg)
//   FEASTFIRST_MODE=neutral -> instrument OFF (no wraps, no snapshots;
//     end-of-run wall numbers only) — the neutrality leg.
// Per-seed JSON goes to evidence/2026-11-10/perseed-feastfirst-a/
// (sims write once, on purpose). Refuses to overwrite an existing
// per-seed file. Writes use the fishstaff-b writeRobust pattern
// (tmp + readback + @@FALLBACK stdout after 60 retries) so an EPERM
// flap cannot silently lose a seed.
// Usage:
//   DAYS=150 SEEDS=180265,180266 RUN=feastfirst-pilot FEASTFIRST_MODE=control node scripts/feastfirst-driver-20261110.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const FI = require(path.join(REPO, 'scripts', 'feastfirst-instrument-20261110'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'feastfirst-pilot';
const MODE = (process.env.FEASTFIRST_MODE || 'control').toLowerCase();
const INST_ON = MODE !== 'neutral';
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-10', 'perseed-feastfirst-a');

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

const SAY_RE = /feast|🍖|tribute|bundle|FEASTED|keepsake|channel|surge|pellet|reactor|favor|🔔|pantry|guest of honor/i;

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-feastfirst', fullTelemetry: false });
  const feastSays = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (SAY_RE.test(arg) && feastSays.length < 200) feastSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let fi = null;
  if (INST_ON) fi = FI.install(Game);
  let lastSnapDay = -1;
  let lastCtx = null;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      lastCtx = ctx;
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (fi && d !== lastSnapDay) { lastSnapDay = d; fi.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { if (fi) fi.snapshot(); } catch (e) {}
  try { if (fi) fi.uninstall(); } catch (e) { errors.push('uninstall-fi: ' + String(e.message).slice(0, 80)); }

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
    seed: seed, arm: 'feastfirst', run: RUN, mode: MODE,
    anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    feastSays: feastSays, sayCount: sayCount,
    instrumentErrors: (fi ? fi.t.instrumentErrors : []).concat(errors),
    deaths: deaths,
  };
  if (fi) {
    out.feasts = fi.t.feasts;
    out.plans = fi.t.plans;
    out.grants = fi.t.grants;
    out.buyouts = fi.t.buyouts;
    out.surgeUses = fi.t.surgeUses;
    out.draws = fi.t.draws;
    out.drawFaces = fi.t.drawFaces;
    out.channels = fi.t.channels;
    out.keepsakeReady = fi.t.keepsakeReady;
    out.tributes = fi.t.tributes;
    out.pelletPasses = fi.t.pelletPasses;
    out.pantryDraws = fi.t.pantryDraws;
    out.pantryRemovals = fi.t.pantryRemovals;
    out.deposits = fi.t.deposits;
    out.daily = fi.t.daily;
    out.wrapLive = fi.t.wrapLive;
  }
  return out;
}

(async function () {
  if (!SEEDS.length) { console.error('FEASTFIRST STOP: SEEDS required.'); process.exit(2); }
  if (MODE !== 'control' && MODE !== 'neutral') { console.error('FEASTFIRST STOP: FEASTFIRST_MODE must be control|neutral.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'feastfirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('FEASTFIRST STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'feastfirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      endPantryKcal: out.endPantryKcal,
      feasts: out.feasts ? out.feasts.length : null,
      feastsOk: out.feasts ? out.feasts.filter(function (f) { return f.ok; }).length : null,
      plans: out.plans ? out.plans.length : null,
      grants: out.grants ? out.grants.length : null,
      buyouts: out.buyouts ? out.buyouts.length : null,
      surgeUses: out.surgeUses ? out.surgeUses.length : null,
      draws: out.draws ? out.draws.length : null,
      channels: out.channels ? out.channels.length : null,
      tributes: out.tributes ? out.tributes.length : null,
      pelletPasses: out.pelletPasses ? out.pelletPasses.length : null,
      pantryDraws: out.pantryDraws ? out.pantryDraws.length : null,
      pantryRemovals: out.pantryRemovals ? out.pantryRemovals.length : null,
      snapshots: out.daily ? out.daily.length : null,
      feastSays: out.feastSays.length,
      deaths: out.deaths.length,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun };

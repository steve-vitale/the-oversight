// cookfirst-driver-20261110.js — cooking first-numbers pilot driver
// (arm sim-cookfirst-a, run fleshout-20261110T1915Z). Competent policy
// verbatim, 150d death-aware horizon, fresh band 180201–180208.
//
// Two legs on the same seeds; the ONLY difference is whether the
// instrument is installed:
//   COOKFIRST_MODE=control -> instrument ON (the judged leg)
//   COOKFIRST_MODE=neutral -> instrument OFF (no wraps, no snapshots;
//     end-of-run wall numbers only) — the neutrality leg.
// Per-seed JSON goes to evidence/2026-11-10/perseed-cookfirst-a/
// (sims write once, on purpose). Refuses to overwrite an existing
// per-seed file.
// Usage:
//   DAYS=150 SEEDS=180201,180202 RUN=cookfirst-pilot COOKFIRST_MODE=control node scripts/cookfirst-driver-20261110.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const CI = require(path.join(REPO, 'scripts', 'cookfirst-instrument-20261110'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'cookfirst-pilot';
const MODE = (process.env.COOKFIRST_MODE || 'control').toLowerCase();
const INST_ON = MODE !== 'neutral';
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-10', 'perseed-cookfirst-a');

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

const SAY_RE = /cook|smoke|render|pemmican|rack|preserv|fire|feast|meal|dinner|hungry|starv|rot|spoil|recipe|taste|flavor|butcher|carcass|fat|tallow|jerky/i;

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-cookfirst', fullTelemetry: false });
  const cookSays = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (SAY_RE.test(arg) && cookSays.length < 200) cookSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let ci = null;
  if (INST_ON) ci = CI.install(Game);
  let lastSnapDay = -1;
  let lastCtx = null;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      lastCtx = ctx;
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (ci && d !== lastSnapDay) { lastSnapDay = d; ci.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { if (ci) ci.snapshot(); } catch (e) {}
  try { if (ci) ci.uninstall(); } catch (e) { errors.push('uninstall-ci: ' + String(e.message).slice(0, 80)); }

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
    seed: seed, arm: 'cookfirst', run: RUN, mode: MODE,
    anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    cookSays: cookSays, sayCount: sayCount,
    instrumentErrors: (ci ? ci.t.instrumentErrors : []).concat(errors),
    deaths: deaths,
  };
  if (ci) {
    out.transforms = ci.t.transforms;
    out.methodCalls = ci.t.methodCalls;
    out.learns = ci.t.learns;
    out.eats = ci.t.eats;
    out.draws = ci.t.draws;
    out.deeds = ci.t.deeds;
    out.daily = ci.t.daily;
    out.wrapLive = ci.t.wrapLive;
    out.sayLines = ci.t.sayLines;
  }
  return out;
}

(async function () {
  if (!SEEDS.length) { console.error('COOKFIRST STOP: SEEDS required.'); process.exit(2); }
  if (MODE !== 'control' && MODE !== 'neutral') { console.error('COOKFIRST STOP: COOKFIRST_MODE must be control|neutral.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'cookfirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('COOKFIRST STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'cookfirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      endPantryKcal: out.endPantryKcal,
      transforms: out.transforms ? out.transforms.length : null,
      methodCalls: out.methodCalls ? out.methodCalls.length : null,
      learns: out.learns ? out.learns.length : null,
      eats: out.eats ? out.eats.length : null,
      draws: out.draws ? out.draws.length : null,
      deeds: out.deeds ? out.deeds.length : null,
      snapshots: out.daily ? out.daily.length : null,
      cookSays: out.cookSays.length,
      deaths: out.deaths.length,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun };

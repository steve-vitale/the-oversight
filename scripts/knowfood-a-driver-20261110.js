// knowfood-a-driver-20261110.js — Knowledge FOOD, VILLAGER-SIDE rate
// revision pilot driver (arm sim-knowfood-a). Competent policy VERBATIM,
// default env, death-aware horizon (runDays ends on village death / win).
// Seeds run sequentially in one process via the shared harness (loadGame
// per seed, as the knowledge-b driver does).
//
// Two legs on the same seeds:
//   KNOWFOOD_A_MODE=on  (default): instrument installed — daily
//     snapshots + method wraps + say-line capture.
//   KNOWFOOD_A_MODE=off: no instrument at all — end-of-run wall
//     numbers + end-state digest only (neutrality leg).
// Per-seed JSON goes to evidence/2026-11-10/perseed-knowfood-a/
// (sims write once, on purpose). Refuses to overwrite an existing
// per-seed file. Output carries NO timestamps, so repeat runs on the
// same seed are byte-comparable for the determinism leg.
// Usage:
//   DAYS=100 SEEDS=170225,170226 RUN=knowfood-a-pilot KNOWFOOD_A_MODE=on node scripts/knowfood-a-driver-20261110.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const INST = require(path.join(REPO, 'scripts', 'knowfood-a-instrument-20261110'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '100', 10) || 100;
const RUN = process.env.RUN || 'knowfood-a-pilot';
const MODE = (process.env.KNOWFOOD_A_MODE || 'on').toLowerCase();
if (!SEEDS.length) { console.error('KNOWFOOD_A STOP: SEEDS required.'); process.exit(2); }
if (MODE !== 'on' && MODE !== 'off') { console.error('KNOWFOOD_A_MODE must be on|off.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-10', 'perseed-knowfood-a');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'knowfood-a-s' + seed + '-' + RUN + '-' + MODE + '.json');
  if (fs.existsSync(file)) { console.error('KNOWFOOD_A STOP: refusing to overwrite ' + file); process.exit(3); }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// Food / unknown-food / experiment say lines (sense-testing corpus).
const SAY_RE = /unknown flesh|threw out spoiled|eats what should have been thrown out|NOT food|Poison|It's food|cook it, or else|educationally sick|tongue goes numb|smallest taste|test it cautiously|strange meat|forage|haul|meat|taught|learn/i;

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-knowfood-a', fullTelemetry: false });
  const sayLines = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (SAY_RE.test(arg) && sayLines.length < 400) sayLines.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let inst = null;
  if (MODE === 'on') inst = INST.install(Game);
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (inst && d !== lastSnapDay) { lastSnapDay = d; inst.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { if (inst) inst.snapshot(); } catch (e) {}
  try { if (inst) inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  const v = st.village || {};
  let scaleRank = null, unlocked = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
  let standing = null;
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  let rosterAlive = 0;
  try {
    rosterAlive = (v.roster || []).filter(function (id) { try { const p = Game.getPerson(id); return p && !p.dead; } catch (e) { return false; } }).length;
  } catch (e) {}
  let pantryKcal = 0;
  try { pantryKcal = (v.pantry || []).reduce(function (s, it) { return s + ((it.kcalEach || 0) * (it.units || 1)); }, 0); } catch (e) {}
  const fallen = (v.fallen || []).map(function (f) { return { day: f.day || 0, cause: f.cause || null, name: f.name || null }; });
  const digest = {
    day: (st.scholar && st.scholar.day) || 0,
    rosterAlive: rosterAlive, pantryKcal: pantryKcal, standing: standing,
    waveUnlocked: unlocked, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, endReason: result.endReason || null,
    fallenCount: fallen.length,
  };

  const out = {
    seed: seed, arm: 'knowfood-a', run: RUN, mode: MODE, anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    scholarId: Game.villagerId || null,
    digest: digest, fallen: fallen,
    sayLines: sayLines, sayCount: sayCount,
    instrumentErrors: (inst ? inst.t.instrumentErrors : []).concat(errors),
  };
  if (inst) {
    out.daily = inst.t.daily;
    out.foodDraws = inst.t.foodDraws;
    out.otherDraws = inst.t.otherDraws;
    out.experimentBeats = inst.t.experimentBeats;
    out.spoiledDraws = inst.t.spoiledDraws;
    out.packMeals = inst.t.packMeals;
    out.produced = inst.t.produced;
  }
  const file = path.join(outDir, 'knowfood-a-s' + seed + '-' + RUN + '-' + MODE + '.json');
  fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
  console.log('KNOWFOOD_A seed ' + seed + ' mode ' + MODE + ' days ' + result.days + ' end ' + result.endReason + ' errors ' + out.instrumentErrors.length + ' -> ' + file);
}

(async function () {
  for (const seed of SEEDS) await oneRun(seed);
  console.log('KNOWFOOD_A done: ' + SEEDS.length + ' seeds, mode ' + MODE + ', run ' + RUN);
})().catch(function (e) { console.error('KNOWFOOD_A FATAL', e && e.stack || e); process.exit(1); });

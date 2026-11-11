// titanfirst-driver-20261111.js — titans + heralds first-numbers pilot driver
// (arm sim-titanfirst-a, run fleshout-loop-20261111T1115Z). Competent policy
// verbatim, 150d death-aware horizon, fresh band 190321–190328.
//
// Two legs on the same seeds; the ONLY difference is whether the
// instrument is installed:
//   TITANFIRST_MODE=control -> instrument ON (the judged leg)
//   TITANFIRST_MODE=neutral -> instrument OFF (no wraps, no snapshots;
//     end-of-run wall numbers only) — the neutrality leg.
// Per-seed JSON goes to evidence/2026-11-11/perseed-titanfirst-a/
// (sims write once, on purpose). Refuses to overwrite an existing
// per-seed file. Writes use the fishstaff-b writeRobust pattern
// (tmp + readback + @@FALLBACK stdout after 60 retries) so an EPERM
// flap cannot silently lose a seed.
// Usage:
//   DAYS=150 SEEDS=190321,190322 RUN=titanfirst-pilot TITANFIRST_MODE=control node scripts/titanfirst-driver-20261111.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const TF = require(path.join(REPO, 'scripts', 'titanfirst-instrument-20261111'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'titanfirst-pilot';
const MODE = (process.env.TITANFIRST_MODE || 'control').toLowerCase();
const INST_ON = MODE !== 'neutral';
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-11', 'perseed-titanfirst-a');

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

// Sense corpus: titan/herald/omen/muster language. Same regex as the
// instrument (uncapped there); the driver caps at 300 lines/seed.
// Caveat (same as the siblings): the cap can exhaust early on a
// refusal-spam seed, so the per-seed count is a lower bound and the
// instrument's uncapped titanSays is the census source.
const SAY_RE = TF.TITAN_SAY_RE;

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-titanfirst', fullTelemetry: false });
  const titanSays = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (SAY_RE.test(arg) && titanSays.length < 300) titanSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let tf = null;
  if (INST_ON) tf = TF.install(Game);
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (tf && d !== lastSnapDay) { lastSnapDay = d; tf.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { if (tf) tf.snapshot(); } catch (e) {}
  try { if (tf) tf.uninstall(); } catch (e) { errors.push('uninstall-tf: ' + String(e.message).slice(0, 80)); }

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
    seed: seed, arm: 'titanfirst', run: RUN, mode: MODE,
    anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    titanSays: titanSays, sayCount: sayCount,
    instrumentErrors: (tf ? tf.t.instrumentErrors : []).concat(errors),
    deaths: deaths,
  };
  if (tf) {
    out.startCombatEvents = tf.t.startCombatEvents;
    out.tbEndEvents = tf.t.tbEndEvents;
    out.fieldFightEvents = tf.t.fieldFightEvents;
    out.spawnEvents = tf.t.spawnEvents;
    out.removeEvents = tf.t.removeEvents;
    out.dawnEvents = tf.t.dawnEvents;
    out.actionEvents = tf.t.actionEvents;
    out.titanSaysFull = tf.t.titanSays;
    out.daily = tf.t.daily;
    out.wrapLive = tf.t.wrapLive;
    out.wrapCounts = tf.t.wrapCounts;
    out.nonTitanStartCombat = tf.t.nonTitanStartCombat;
    out.nonTitanTbEnd = tf.t.nonTitanTbEnd;
    out.nonTitanFieldFight = tf.t.nonTitanFieldFight;
    out.sayDropped = tf.t.sayDropped;
  }
  return out;
}

(async function () {
  if (!SEEDS.length) { console.error('TITANFIRST STOP: SEEDS required.'); process.exit(2); }
  if (MODE !== 'control' && MODE !== 'neutral') { console.error('TITANFIRST STOP: TITANFIRST_MODE must be control|neutral.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'titanfirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('TITANFIRST STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'titanfirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      endPantryKcal: out.endPantryKcal,
      startCombat: out.startCombatEvents ? out.startCombatEvents.length : null,
      tbEnds: out.tbEndEvents ? out.tbEndEvents.length : null,
      fieldFights: out.fieldFightEvents ? out.fieldFightEvents.length : null,
      spawns: out.spawnEvents ? out.spawnEvents.length : null,
      removals: out.removeEvents ? out.removeEvents.length : null,
      dawns: out.dawnEvents ? out.dawnEvents.length : null,
      actions: out.actionEvents ? out.actionEvents.length : null,
      titanSaysFull: out.titanSaysFull ? out.titanSaysFull.length : null,
      snapshots: out.daily ? out.daily.length : null,
      titanSays: out.titanSays.length,
      deaths: out.deaths.length,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun };

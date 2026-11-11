// siegefirst-driver-20261111.js — siege first-numbers pilot driver
// (arm sim-siegefirst-a, run fleshout-20261111T1118Z). Competent policy
// verbatim, 150d death-aware horizon, fresh band 210401–210408.
//
// Two legs on the same seeds; the ONLY difference is whether the
// instrument is installed:
//   SIEGEFIRST_MODE=control -> instrument ON (the judged leg)
//   SIEGEFIRST_MODE=neutral -> instrument OFF (no wraps, no snapshots;
//     end-of-run wall numbers only) — the neutrality leg.
// Per-seed JSON goes to evidence/2026-11-11/perseed-siegefirst-a/
// (sims write once, on purpose). Refuses to overwrite an existing
// per-seed file. Writes use the fishstaff-b writeRobust pattern
// (tmp + readback + @@FALLBACK stdout after 60 retries) so an EPERM
// flap cannot silently lose a seed.
// Usage:
//   DAYS=150 SEEDS=210401,210402 RUN=siegefirst-pilot SIEGEFIRST_MODE=control node scripts/siegefirst-driver-20261111.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const SI = require(path.join(REPO, 'scripts', 'siegefirst-instrument-20261111'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'siegefirst-pilot';
const MODE = (process.env.SIEGEFIRST_MODE || 'control').toLowerCase();
const INST_ON = MODE !== 'neutral';
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-11', 'perseed-siegefirst-a');

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

// Siege say regex: the siege word-family + the treeline/palisade/gorge
// vocabulary. 'raid' only as a whole word (bare 'raid' would match
// 'braid'/'afraid' and exhaust the cap — the fishfirst-a lesson).
const SAY_RE = /siege|besieg|treeline|palisade|gorge|lingering|lingerer|\braid\b|hold the line|chokepoint|the wall|barricade|under siege/i;

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-siegefirst', fullTelemetry: false });
  const siegeSays = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (SAY_RE.test(arg) && siegeSays.length < 200) siegeSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let si = null;
  if (INST_ON) si = SI.install(Game);
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (si && d !== lastSnapDay) { lastSnapDay = d; si.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { if (si) si.snapshot(); } catch (e) {}
  try { if (si) si.uninstall(); } catch (e) { errors.push('uninstall-si: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  let scaleRank = null, unlocked = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
  let standing = null;
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  let tableReached = false;
  try {
    const pg = (typeof Game.progState === 'function') ? Game.progState() : null;
    tableReached = !!(pg && pg.tableDone);
  } catch (e) {}
  let pantryKcal = 0;
  try {
    pantryKcal = ((st.village || {}).pantry || []).reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) {}

  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (d) {
    return { day: d.day, kind: d.kind || null, who: d.who || null, cause: d.cause || null, player: !!d.player };
  });

  const out = {
    seed: seed, arm: 'siegefirst', run: RUN, mode: MODE,
    anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank, table: tableReached,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    siegeSays: siegeSays, sayCount: sayCount,
    instrumentErrors: (si ? si.t.instrumentErrors : []).concat(errors),
    deaths: deaths,
  };
  if (si) {
    out.raids = si.t.raids;
    out.pillages = si.t.pillages;
    out.lingerDays = si.t.lingerDays;
    out.aidCrises = si.t.aidCrises;
    out.crisisFires = si.t.crisisFires;
    out.contests = si.t.contests;
    out.contestTicks = si.t.contestTicks;
    out.shelter = si.t.shelter;
    out.spawns = si.t.spawns;
    out.fights = si.t.fights;
    out.fightEnds = si.t.fightEnds;
    out.teleDeaths = si.t.deaths;
    out.contestFiredTele = si.t.contestFiredTele;
    out.daily = si.t.daily;
    out.wrapLive = si.t.wrapLive;
  }
  return out;
}

(async function () {
  if (!SEEDS.length) { console.error('SIEGEFIRST STOP: SEEDS required.'); process.exit(2); }
  if (MODE !== 'control' && MODE !== 'neutral') { console.error('SIEGEFIRST STOP: SIEGEFIRST_MODE must be control|neutral.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'siegefirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('SIEGEFIRST STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'siegefirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      endPantryKcal: out.endPantryKcal,
      raids: out.raids ? out.raids.length : null,
      raidsFired: out.raids ? out.raids.filter(function (r) { return r.fired; }).length : null,
      pillages: out.pillages ? out.pillages.length : null,
      lingerDays: out.lingerDays ? out.lingerDays.length : null,
      aidCrises: out.aidCrises ? out.aidCrises.length : null,
      crisisFires: out.crisisFires ? out.crisisFires.length : null,
      contests: out.contests ? out.contests.length : null,
      shelter: out.shelter ? out.shelter.length : null,
      spawns: out.spawns ? out.spawns.length : null,
      fights: out.fights ? out.fights.length : null,
      teleDeaths: out.teleDeaths ? out.teleDeaths.length : null,
      snapshots: out.daily ? out.daily.length : null,
      siegeSays: out.siegeSays.length,
      deaths: out.deaths.length,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun };

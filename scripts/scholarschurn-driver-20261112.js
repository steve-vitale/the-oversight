// scholarschurn-driver-20261112.js — scholar churn in the wild,
// diagnostic census (arm sim-scholarschurn-b, run
// fleshout-loop-b-20261112T2130Z). Competent policy verbatim, 150d
// death-aware horizon, seeds 190391-190398 — deliberately the SAME
// band as the r9/r10/pairarming corpora so the census is comparable
// to them (prereg: band reuse is prescribed for comparability, not a
// freshness violation).
//
// CURRENT MASTER, no fix-swap: the base (bd29d8bd7) already carries
// the r131 roster-check fix (ROSTER CHECK present in
// src/js/standing.js on this base). The vetfirst instrument runs ON
// (same wraps, same snapshots) plus the PA gear snapshot in the same
// finally block, plus the scholar instrument
// (scholarschurn-instrument-20261112.js): a playerDeath wrap
// (pre: dying scholar + location; post: successor) and a daily
// scholar snapshot.
//
// Per-seed JSON goes to evidence/2026-11-12/perseed-scholarschurn-b/
// (sims write once, on purpose). Refuses to overwrite an existing
// per-seed file. Writes use the fishstaff-b writeRobust pattern
// (tmp + readback + @@FALLBACK stdout after 60 retries) so an EPERM
// flap cannot silently lose a seed.
// Usage:
//   DAYS=150 SEEDS=190391,190392 RUN=scholarschurn-pilot node scripts/scholarschurn-driver-20261112.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const VF = require(path.join(REPO, 'scripts', 'vetfirst-instrument-20261111'));
const PA = require(path.join(REPO, 'scripts', 'pairarming-instrument-20261112'));
const SC = require(path.join(REPO, 'scripts', 'scholarschurn-instrument-20261112'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'scholarschurn-pilot';
const MODE = 'current'; // current master; no fix-swap (fix is in master)
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-12', 'perseed-scholarschurn-b');

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

// Scholar/succession lines for sense-testing: the death line, the
// "you're not her" line, the Codex sync / journal pickup lines, and
// the reactor-loss voice. (Veteran-kill lines stay in the pairarming
// SAY_RE family; this arm reads succession, not kills.)
const SCHOLAR_RE = /is dead|you're not|picks up the (journal|Codex)|doesn't pause for grief|already there, overlaying|reactor went with|mantle just|the village stops/i;

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-vetphantom', fullTelemetry: false });
  const scholarSays = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (SCHOLAR_RE.test(arg) && scholarSays.length < 400) scholarSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let vf = null;
  vf = VF.install(Game);
  let sc = null;
  sc = SC.install(Game);
  let lastSnapDay = -1;
  let lastCtx = null;
  function takeScholarSnapshot() {
    try {
      const d = gday(Game);
      const deathsToday = ((vf && vf.t && vf.t.deaths) || []).filter(function (r) { return r && r.day === d; }).map(function (r) { return r.villagerId; }).filter(Boolean);
      sc.snapshot(deathsToday);
    } catch (e) { errors.push('scholar-snap: ' + String(e.message).slice(0, 80)); }
  }
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      lastCtx = ctx;
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (vf && d !== lastSnapDay) {
            lastSnapDay = d;
            vf.snapshot();
            // Scholar snapshot in the SAME finally block, after vetfirst.
            takeScholarSnapshot();
          }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 1 }); });
  try {
    if (vf) vf.snapshot();
  } catch (e) {}
  try {
    const d = gday(Game);
    const last = sc.t.scholarDaily[sc.t.scholarDaily.length - 1];
    if (!sc.t.scholarDaily.length || !last || last.day !== d) takeScholarSnapshot();
  } catch (e) { errors.push('scholar-final: ' + String(e.message).slice(0, 80)); }
  try { if (vf) vf.uninstall(); } catch (e) { errors.push('uninstall-vf: ' + String(e.message).slice(0, 80)); }
  try { if (sc) sc.uninstall(); } catch (e) { errors.push('uninstall-sc: ' + String(e.message).slice(0, 80)); }

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
  let ready4 = null, ready5 = null, ladderVets4 = null, tribute = null, blooded = null;
  try { ready4 = Game.waveCombatReadiness ? Game.waveCombatReadiness(4) : null; } catch (e) { errors.push('ready4: ' + String(e.message).slice(0, 80)); }
  try { ready5 = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null; } catch (e) { errors.push('ready5: ' + String(e.message).slice(0, 80)); }
  try { ladderVets4 = (typeof Game._ladderLivingVeterans === 'function') ? Game._ladderLivingVeterans(4) : null; } catch (e) { errors.push('ladderVets4: ' + String(e.message).slice(0, 80)); }
  try { tribute = (typeof Game.ladderCapstoneReady === 'function') ? Game.ladderCapstoneReady('military_tribute') : null; } catch (e) { errors.push('tribute: ' + String(e.message).slice(0, 80)); }
  try { blooded = (typeof Game.villageBlooded === 'function') ? Game.villageBlooded() : null; } catch (e) { errors.push('blooded: ' + String(e.message).slice(0, 80)); }

  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (d) {
    return { day: d.day, kind: d.kind || null, who: d.who || null, cause: d.cause || null, player: !!d.player };
  });

  // Flat gear arrays (same shape as the pairarming corpus) for the
  // analyzer's hold detection, derived from the scholar snapshots.
  const gearDaily = (sc.t.scholarDaily || []).map(function (s) { return s.gear; });
  const gearDiffs = [];
  for (let i = 1; i < gearDaily.length; i++) {
    try {
      const diff = PA.diffGearDays(gearDaily[i - 1], gearDaily[i]);
      if (diff && diff.instrumentErrors && diff.instrumentErrors.length) {
        for (const m of diff.instrumentErrors) errors.push('gear-diff d' + diff.day + ': ' + m);
      }
      gearDiffs.push(diff);
    } catch (e) { errors.push('gear-diff: ' + String(e.message).slice(0, 80)); }
  }

  const out = {
    seed: seed, arm: 'scholarschurn', run: RUN, mode: MODE,
    anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    ready4: ready4, ready5: ready5, ladderVets4: ladderVets4,
    tribute: tribute, blooded: blooded,
    scholarSays: scholarSays, sayCount: sayCount,
    instrumentErrors: (vf ? vf.t.instrumentErrors : []).concat(sc ? sc.t.instrumentErrors : []).concat(errors),
    deaths: deaths,
    samples: result.samples || null,
    gearDaily: gearDaily,
    gearDiffs: gearDiffs,
    scholarDeaths: sc.t.scholarDeaths,
    scholarDaily: sc.t.scholarDaily,
    scholarDiffs: sc.t.scholarDiffs,
  };
  if (vf) {
    out.killCalls = vf.t.killCalls;
    out.pyrrhicCalls = vf.t.pyrrhicCalls;
    out.casts = vf.t.casts;
    out.spawns = vf.t.spawns;
    out.fights = vf.t.fights;
    out.teleCounts = vf.t.teleCounts;
    out.teleRows = vf.t.teleRows;
    out.regDeaths = vf.t.deaths;
    out.daily = vf.t.daily;
    out.wrapLive = vf.t.wrapLive;
  }
  return out;
}

if (require.main === module) (async function () {
  if (!SEEDS.length) { console.error('SCHOLARSCHURN STOP: SEEDS required.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'scholarschurn-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('SCHOLARSCHURN STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'scholarschurn-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, anchor: out.anchorCommit,
      days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      endPantryKcal: out.endPantryKcal,
      scholarDeaths: out.scholarDeaths.length,
      scholarDays: out.scholarDaily.length,
      successions: out.scholarDiffs.filter(function (d) { return d && d.succession; }).length,
      scholarSays: out.scholarSays.length,
      deaths: out.deaths.length,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun };

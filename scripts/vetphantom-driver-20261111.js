// vetphantom-driver-20261111.js — readiness-vs-ladder veteran phantom
// band driver (arm sim-vetphantom-b). Competent policy verbatim, 150d
// death-aware horizon, fresh band 190391–190398.
//
// TWO legs on the same seeds; the ONLY difference is src/js/standing.js:
//   VETPHANTOM_MODE=control -> pre-fix standing.js (journey-scale r131
//     fix 5d16916f4 REVERTED: no roster check in waveCombatReadiness)
//   VETPHANTOM_MODE=fix -> fixed standing.js (roster check present)
// The driver REFUSES to run when the on-disk standing.js does not match
// the requested leg (read for the "ROSTER CHECK" marker + sha256), so a
// leg can never be mislabeled. Swap the file between legs; do NOT commit
// between legs (anchorCommit is identical; standingSha differs).
//
// Both legs run the vetfirst instrument ON (same wraps, same snapshots),
// plus a live SHADOW old-rule count after every snapshot: distinct
// killers with wave-(w-1)+ kills whose vp record exists and is not
// marked dead, WITHOUT the roster check — the pre-fix rule computed on
// the same trajectory. On the fix leg, shadow-minus-instrument is the
// phantom days the fix prevented; on the control leg, the engine's own
// ready4/ready5 reads ARE the old rule, so shadow should equal them.
//
// Per-seed JSON goes to evidence/2026-11-11/perseed-vetphantom-b/
// (sims write once, on purpose). Refuses to overwrite an existing
// per-seed file. Writes use the fishstaff-b writeRobust pattern
// (tmp + readback + @@FALLBACK stdout after 60 retries) so an EPERM
// flap cannot silently lose a seed.
// Usage:
//   DAYS=150 SEEDS=190391,190392 RUN=vetphantom-pilot VETPHANTOM_MODE=control node scripts/vetphantom-driver-20261111.js
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const VF = require(path.join(REPO, 'scripts', 'vetfirst-instrument-20261111'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'vetphantom-pilot';
const MODE = (process.env.VETPHANTOM_MODE || 'control').toLowerCase();
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

// The leg guard: the on-disk standing.js must match the requested leg.
const standingPath = path.join(REPO, 'src', 'js', 'standing.js');
let STANDING_FIX = null, STANDING_SHA = 'unknown';
try {
  const text = fs.readFileSync(standingPath, 'utf8');
  STANDING_FIX = text.indexOf('ROSTER CHECK') !== -1;
  STANDING_SHA = crypto.createHash('sha256').update(text).digest('hex').slice(0, 12);
} catch (e) { console.error('VETPHANTOM STOP: cannot read standing.js: ' + e.message); process.exit(2); }
if (MODE === 'control' && STANDING_FIX) { console.error('VETPHANTOM STOP: mode=control but standing.js HAS the roster-check fix — revert it first.'); process.exit(2); }
if (MODE === 'fix' && !STANDING_FIX) { console.error('VETPHANTOM STOP: mode=fix but standing.js LACKS the roster-check fix — restore it first.'); process.exit(2); }

const outDir = path.join(REPO, 'evidence', '2026-11-11', 'perseed-vetphantom-b');

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

// Shadow old-rule count: distinct killer vids with a wave-minWave+ kill
// whose vp record exists and is not marked dead — NO roster check (the
// pre-fix waveCombatReadiness rule). Scholar counts (same as both rules).
function shadowOldCount(Game, minWave) {
  try {
    const log = (Game.state && Game.state.waveKillLog) || [];
    const scholarId = Game.villagerId;
    const seen = {};
    for (const e of log) {
      if (!e || !e.by || ((e.w | 0) < (minWave | 0))) continue;
      if (seen[e.by]) continue;
      if (e.by === scholarId) { seen[e.by] = true; continue; }
      let vp = null;
      try { vp = (typeof Game.vpOf === 'function') ? Game.vpOf(e.by) : null; } catch (err) { vp = null; }
      if (vp && !vp.dead) seen[e.by] = true;
    }
    return Object.keys(seen).length;
  } catch (e) { return null; }
}

const SAY_RE = /veteran|blooded|scarred|\belder\b|pack-leader|put down|killing blow|veteran kill|remember the name|MIRROR DRAFT|PRODUCERS|FINAL DRAFT|blood your fighters/i;

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-vetphantom', fullTelemetry: false });
  const vetSays = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (SAY_RE.test(arg) && vetSays.length < 400) vetSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let vf = null;
  vf = VF.install(Game);
  let lastSnapDay = -1;
  let lastCtx = null;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      lastCtx = ctx;
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (vf && d !== lastSnapDay) {
            lastSnapDay = d;
            vf.snapshot();
            // Shadow old-rule counts on the same trajectory, same day.
            try {
              const last = vf.t.daily[vf.t.daily.length - 1];
              if (last) last.shadow = { w3: shadowOldCount(Game, 3), w4: shadowOldCount(Game, 4) };
            } catch (e) { errors.push('shadow: ' + String(e.message).slice(0, 80)); }
          }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 1 }); });
  try {
    if (vf) {
      vf.snapshot();
      const last = vf.t.daily[vf.t.daily.length - 1];
      if (last) last.shadow = { w3: shadowOldCount(Game, 3), w4: shadowOldCount(Game, 4) };
    }
  } catch (e) {}
  try { if (vf) vf.uninstall(); } catch (e) { errors.push('uninstall-vf: ' + String(e.message).slice(0, 80)); }

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

  const out = {
    seed: seed, arm: 'vetphantom', run: RUN, mode: MODE,
    anchorCommit: ANCHOR, standingFix: STANDING_FIX, standingSha: STANDING_SHA,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    ready4: ready4, ready5: ready5, ladderVets4: ladderVets4,
    tribute: tribute, blooded: blooded,
    vetSays: vetSays, sayCount: sayCount,
    instrumentErrors: (vf ? vf.t.instrumentErrors : []).concat(errors),
    deaths: deaths,
    samples: result.samples || null,
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

(async function () {
  if (!SEEDS.length) { console.error('VETPHANTOM STOP: SEEDS required.'); process.exit(2); }
  if (MODE !== 'control' && MODE !== 'fix') { console.error('VETPHANTOM STOP: VETPHANTOM_MODE must be control|fix.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'vetphantom-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('VETPHANTOM STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'vetphantom-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, standingFix: out.standingFix, standingSha: out.standingSha,
      days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      endPantryKcal: out.endPantryKcal,
      killCalls: out.killCalls ? out.killCalls.length : null,
      snapshots: out.daily ? out.daily.length : null,
      vetSays: out.vetSays.length,
      deaths: out.deaths.length,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun };

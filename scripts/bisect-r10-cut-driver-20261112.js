// bisect-r10-cut-driver-20261112.js — survival-collapse BISECT ROUND-10 CUT leg
// (arm sim-bisect-r10-cut-a). Competent policy verbatim, 150d
// death-aware horizon, seeds 190391-190398 — deliberately the SAME
// band as the vetphantom fix leg: a bisect cut re-runs the same seeds
// on the round-10 cut base (c67a17564, the 389th commit in the window
// d229b58f5..203a32775 — the midpoint of the last 8 commits, 386–393,
// after round 9 read INCONCLUSIVE 4/8 at the 385th commit), so the
// survival count is comparable seed-for-seed. This is not a freshness
// violation; the prereg (evidence/2026-11-12/sim-bisect-r10-cut-a-prereg.md)
// says so before any sim.
//
// SINGLE leg, fix only — WITH A FIX-SWAP. This base PREDATES the
// r131 roster-check fix (5d16916f4), so the on-disk src/js/standing.js
// is the PRE-FIX version (sha256 98c8bfad70d7... — verified on THIS base, byte-identical to the merge-base pre-fix file). The fix standing.js
// (sha256 f8fda4295a99..., extracted with `git show
// 5157782a4:src/js/standing.js`) is swapped in UNCOMMITTED for the run
// and restored byte-identical afterwards (see the prereg). The driver
// REFUSES to run unless the on-disk standing.js carries the "ROSTER
// CHECK" marker AND its sha256 is exactly the fix sha, so a leg can
// never be mislabeled and an unswapped run can never be mistaken for
// a swapped one. standingSha is recorded per seed. The swapped file
// is never committed.
//
// The vetfirst instrument runs ON (same wraps, same snapshots), plus
// the live SHADOW old-rule count after every snapshot — identical to
// vetphantom-driver, so the per-seed JSONs are field-compatible with
// the vetphantom corpus and the same analyzer patterns apply.
//
// Per-seed JSON goes to evidence/2026-11-12/perseed-bisect-r10-cut-a/
// (sims write once, on purpose). Refuses to overwrite an existing
// per-seed file. Writes use the fishstaff-b writeRobust pattern
// (tmp + readback + @@FALLBACK stdout after 60 retries) so an EPERM
// flap cannot silently lose a seed.
// Usage:
//   DAYS=150 SEEDS=190391,190392 RUN=bisect-r10-cut-pilot node scripts/bisect-r10-cut-driver-20261112.js
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
const RUN = process.env.RUN || 'bisect-r10-cut-pilot';
const MODE = 'fix'; // single leg: the fix is swapped in; no control variant is rebuilt
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

// The leg guard (swap-aware): the on-disk standing.js must be the
// FIX version, swapped in uncommitted for this run — marker present
// AND sha256 exactly the vetphantom fix sha. The pre-fix merge
// version (98c8bfad70d7...) has no marker and a different sha, so an
// unswapped run is refused loudly instead of being mislabeled.
const EXPECTED_FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const PRE_FIX_SHA = '98c8bfad70d744353681895ff41115c36d5ee96b8046fa80c24e04e7bf72d69d';
function legGuard(standingText) {
  if (typeof standingText !== 'string') return { fix: false, shaFull: null, sha: 'unknown', ok: false };
  const shaFull = crypto.createHash('sha256').update(standingText).digest('hex');
  const fix = standingText.indexOf('ROSTER CHECK') !== -1;
  return { fix: fix, shaFull: shaFull, sha: shaFull.slice(0, 12), ok: fix && shaFull === EXPECTED_FIX_SHA };
}
const standingPath = path.join(REPO, 'src', 'js', 'standing.js');
// The leg guard is READ at require time (so oneRun records the swap
// it ran under) but ENFORCED only at the run entry point: requiring
// this module must never exit the process — the proof requires the
// driver to assert on legGuard on any tree, including one whose
// on-disk standing.js is not the fix swap. (sim-findings-a 2026-11-11:
// the top-level process.exit(2) made the proof base-state-bound —
// it died at require time on current master, whose standing.js
// carries the marker but a later sha.)
let STANDING_FIX = null, STANDING_SHA = 'unknown', STANDING_GUARD = null;
try {
  const text = fs.readFileSync(standingPath, 'utf8');
  const g = legGuard(text);
  STANDING_FIX = g.fix;
  STANDING_SHA = g.sha;
  STANDING_GUARD = g;
} catch (e) {
  STANDING_FIX = false;
  STANDING_SHA = 'unknown';
  STANDING_GUARD = { fix: false, shaFull: null, sha: 'unknown', ok: false, error: e && e.message };
}
// refuseUnlessSwapped(): the leg guard, enforced when the driver is
// actually RUN — a wrong or missing swap exits loudly (exit 2, no
// mislabeled run) instead of running.
function refuseUnlessSwapped() {
  const g = STANDING_GUARD;
  if (MODE === 'control') { console.error('BISECTR10CUT STOP: bisect-r10-cut has no control mode — the fix is swapped in.'); process.exit(2); }
  if (MODE === 'fix' && g && !g.ok) {
    if (g.error) console.error('BISECTR10CUT STOP: cannot read standing.js: ' + g.error);
    else if (!g.fix) console.error('BISECTR10CUT STOP: mode=fix but standing.js LACKS the roster-check fix — perform the fix-swap first (see prereg).');
    else console.error('BISECTR10CUT STOP: standing.js has the marker but sha ' + (g.shaFull || '').slice(0, 12) + ' is not the vetphantom fix sha f8fda4295a99 — wrong swap.');
    process.exit(2);
  }
}

const outDir = path.join(REPO, 'evidence', '2026-11-12', 'perseed-bisect-r10-cut-a');

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
    seed: seed, arm: 'bisect-r10-cut', run: RUN, mode: MODE,
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

if (require.main === module) (async function () {
  refuseUnlessSwapped();
  if (!SEEDS.length) { console.error('BISECTR10CUT STOP: SEEDS required.'); process.exit(2); }
  if (MODE !== 'control' && MODE !== 'fix') { console.error('BISECTR10CUT STOP: mode is fixed to fix.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'bisect-r10-cut-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('BISECTR10CUT STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'bisect-r10-cut-s' + seed + '-' + RUN + '-' + MODE + '.json');
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

module.exports = { oneRun: oneRun, legGuard: legGuard, EXPECTED_FIX_SHA: EXPECTED_FIX_SHA, PRE_FIX_SHA: PRE_FIX_SHA };

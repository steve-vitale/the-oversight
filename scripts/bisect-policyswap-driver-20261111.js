// bisect-policyswap-driver-20261111.js — survival-collapse BISECT
// POLICY-SWAP leg (arm sim-bisect-policyswap-a). 3f136f07e GAME CODE
// with the 5157782a4 competent POLICY, 150d death-aware horizon,
// seeds 190391–190398 — deliberately the SAME band as the vetphantom
// fix leg, anchor-a, anchor2-a, and merge-a: a bisect control
// re-runs the same seeds, so the survival count is comparable
// seed-for-seed. This is not a freshness violation; the prereg
// (evidence/2026-11-11/sim-bisect-policyswap-a-prereg.md) says so
// before any sim.
//
// SINGLE leg, fix only: the vetphantom fix (journey-scale r131
// roster check) is already on this base, so there is no pre-fix
// control variant to rebuild. WITH A POLICY-SWAP: the on-disk
// scripts/policies/competent.js must be the OLD (5157782a4)
// version, swapped in UNCOMMITTED for this run — the driver
// REFUSES to run unless its sha256 is exactly the recorded old
// sha, so an unswapped run is refused loudly, never mislabeled.
// The in-use policy sha is recorded per seed (policySha).
// The swapped file itself is NEVER committed; the 3f136f07e
// version is restored byte-identical after the run.
//
// The vetfirst instrument runs ON (same wraps, same snapshots), plus
// the live SHADOW old-rule count after every snapshot — identical to
// vetphantom-driver, so the per-seed JSONs are field-compatible with
// the vetphantom corpus and the same analyzer patterns apply.
//
// Per-seed JSON goes to evidence/2026-11-11/perseed-bisect-policyswap-a/
// (sims write once, on purpose). Refuses to overwrite an existing
// per-seed file. Writes use the fishstaff-b writeRobust pattern
// (tmp + readback + @@FALLBACK stdout after 60 retries) so an EPERM
// flap cannot silently lose a seed.
// Usage (ONE SEED PER NODE PROCESS — never two harnesses in one process):
//   DAYS=150 SEEDS=190391 RUN=bisect-policyswap-pilot node scripts/bisect-policyswap-driver-20261111.js
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
const RUN = process.env.RUN || 'bisect-policyswap-pilot';
const MODE = 'fix'; // single leg: the fix is on master; no control variant is rebuilt
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

// The policy-swap leg guard: the on-disk competent.js must be the
// OLD (5157782a4) version, swapped in uncommitted for this run.
// The NEW (124a99389) version has a different sha, so an unswapped
// run is refused loudly instead of being mislabeled.
const EXPECTED_OLD_POLICY_SHA = '0801abd82e527dbe6f97ab56c8f0ddb55744998a04a22f332b4bb9b943ecca05';
const CURRENT_POLICY_SHA = '17f3e4555d01d8502b88cd00e44ce7879c89c75ed214da210150204c0ba99ede';
const POLICY_VERSION = '5157782a4-competent';
function legGuard(policyText) {
  if (typeof policyText !== 'string') return { ok: false, shaFull: null, sha: 'unknown' };
  const shaFull = crypto.createHash('sha256').update(policyText).digest('hex');
  return { ok: shaFull === EXPECTED_OLD_POLICY_SHA, shaFull: shaFull, sha: shaFull.slice(0, 12) };
}

// The standing leg guard: the on-disk standing.js must carry the
// ROSTER CHECK marker with exactly the vetphantom fix sha.
const EXPECTED_STANDING_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
function standingGuard(standingText) {
  if (typeof standingText !== 'string') return { fix: false, shaFull: null, sha: 'unknown', ok: false };
  const shaFull = crypto.createHash('sha256').update(standingText).digest('hex');
  const fix = standingText.indexOf('ROSTER CHECK') !== -1;
  return { fix: fix, shaFull: shaFull, sha: shaFull.slice(0, 12), ok: fix && shaFull === EXPECTED_STANDING_SHA };
}

function readGuards() {
  const policyPath = path.join(REPO, 'scripts', 'policies', 'competent.js');
  const standingPath = path.join(REPO, 'src', 'js', 'standing.js');
  let policyText = null, standingText = null;
  try { policyText = fs.readFileSync(policyPath, 'utf8'); }
  catch (e) { console.error('BISECTPOLICYSWAP STOP: cannot read competent.js: ' + e.message); process.exit(2); }
  try { standingText = fs.readFileSync(standingPath, 'utf8'); }
  catch (e) { console.error('BISECTPOLICYSWAP STOP: cannot read standing.js: ' + e.message); process.exit(2); }
  const pg = legGuard(policyText);
  const sg = standingGuard(standingText);
  if (MODE === 'control') { console.error('BISECTPOLICYSWAP STOP: bisect-policyswap has no control mode — the fix is on master.'); process.exit(2); }
  if (MODE === 'fix' && !pg.ok) {
    if (pg.shaFull === CURRENT_POLICY_SHA) console.error('BISECTPOLICYSWAP STOP: competent.js is the NEW (124a99389) version sha ' + pg.sha + ' — perform the policy swap first (see prereg). Refusing to run unswapped.');
    else console.error('BISECTPOLICYSWAP STOP: competent.js sha ' + pg.sha + ' is not the old (5157782a4) policy sha 0801abd82e52 — wrong swap.');
    process.exit(2);
  }
  if (MODE === 'fix' && !sg.ok) {
    if (!sg.fix) console.error('BISECTPOLICYSWAP STOP: mode=fix but standing.js LACKS the roster-check fix — restore it first.');
    else console.error('BISECTPOLICYSWAP STOP: standing.js has the marker but sha ' + sg.sha + ' is not the vetphantom fix sha f8fda4295a99 — wrong standing.js.');
    process.exit(2);
  }
  return { policy: pg, standing: sg };
}

const outDir = path.join(REPO, 'evidence', '2026-11-11', 'perseed-bisect-policyswap-a');

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

const SAY_RE = /veteran|blooded|scarred|elder|pack-leader|put down|killing blow|veteran kill|remember the name|MIRROR DRAFT|PRODUCERS|FINAL DRAFT|blood your fighters/i;

async function oneRun(seed, guards) {
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
    seed: seed, arm: 'bisect-policyswap', run: RUN, mode: MODE,
    anchorCommit: ANCHOR, standingFix: guards.standing.fix, standingSha: guards.standing.sha,
    policySha: guards.policy.shaFull, policyVersion: POLICY_VERSION,
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

async function main() {
  if (!SEEDS.length) { console.error('BISECTPOLICYSWAP STOP: SEEDS required.'); process.exit(2); }
  if (MODE !== 'control' && MODE !== 'fix') { console.error('BISECTPOLICYSWAP STOP: mode is fixed to fix.'); process.exit(2); }
  const guards = readGuards();
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'bisect-policyswap-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('BISECTPOLICYSWAP STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed, guards);
    const file = path.join(outDir, 'bisect-policyswap-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, standingFix: out.standingFix, standingSha: out.standingSha,
      policySha: (out.policySha || '').slice(0, 12), policyVersion: out.policyVersion,
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
}

if (require.main === module) {
  main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
}

module.exports = {
  oneRun: oneRun, legGuard: legGuard, standingGuard: standingGuard,
  EXPECTED_OLD_POLICY_SHA: EXPECTED_OLD_POLICY_SHA,
  CURRENT_POLICY_SHA: CURRENT_POLICY_SHA,
  EXPECTED_STANDING_SHA: EXPECTED_STANDING_SHA,
  POLICY_VERSION: POLICY_VERSION,
};

// burnoffsets-driver-20261113.js — more reseed burn offsets
// (arm sim-burnoffsets-a). Competent policy verbatim, 150d
// death-aware horizon, seeds 190391-190398 — deliberately the SAME
// band as the vetphantom fix leg and the 0515Z deciding test: a
// burn-offset leg re-runs the same seeds on current master
// (f7352f946) PLUS a stream shift, so the gap-seed outcome is
// comparable seed-for-seed. This is not a freshness violation; the
// prereg (evidence/2026-11-13/sim-burnoffsets-a-prereg.md) says so
// before any sim.
//
// ONE leg per invocation, selected by BURN env (0 = baseline, no
// burn; 1 / 13 / 251 / 499 / 1999 = burn offsets). Legs run
// sequentially in prereg order. GO per offset (all conjunctive):
// saves >=1 of {190392, 190394} that the measured baseline LOSES,
// no regression on the baseline's survivors, median >= 0.8x baseline
// median, starvation <= baseline+2. Mode is competent-burnoffsets
// only — NO fix-swap (master already carries the r131 roster-check
// fix; the standing guard asserts the tree IS master, marker present
// AND sha exactly f935997640a0...).
//
// OWN POLICY: this leg runs current master's OWN competent.js
// (sha256 74a890f0844e...). The driver REFUSES to run unless the
// on-disk competent.js sha256 is exactly that sha, and records
// policySha per seed — a wrong-policy run is refused loudly, never
// mislabeled.
//
// NO-CODE-CHANGE GUARD (every leg): `git diff --name-only -- src/js`
// must be EMPTY — this arm carries NO code change at all (no swap,
// no cherry-pick). noCodeChange is recorded per seed.
//
// BURN: after setupGame (world generation is inside setupGame:
// genRoster + newGame + depart), Math.random() is called exactly
// BURN times. A burn — not a re-assignment — because five modules
// capture the mulberry32 function object into a module-scope alias
// at load (betrayal.js:87, comms.js:116, corruption.js:47,
// fieldFights.js:71, finale-campaign.js:28); a re-assignment would
// leave those aliases (including the fight engine) on the old
// stream, while a burn advances the ONE shared instance every call
// site reads. burnOffset is recorded per seed. The policy RNG
// (__policyRandom, derived from the manifest seed inside runDays)
// is untouched by the burn.
//
// The vetfirst instrument runs ON (same wraps, same snapshots), plus
// the live SHADOW old-rule count after every snapshot — identical to
// gap-candidates-driver, so the per-seed JSONs are field-compatible
// with the gap-candidates corpus and the same analyzer patterns apply.
//
// Per-seed JSON goes to evidence/2026-11-13/perseed-burnoffsets-a-b<N>/
// (sims write once, on purpose). Refuses to overwrite an existing
// per-seed file. Writes use the fishstaff-b writeRobust pattern
// (tmp + readback + @@FALLBACK stdout after 60 retries) so an EPERM
// flap cannot silently lose a seed.
// Usage:
//   BURN=0 DAYS=150 SEEDS=190391,190392 RUN=burnoffsets-pilot node scripts/burnoffsets-driver-20261113.js
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
const RUN = process.env.RUN || 'burnoffsets-pilot';
const BURN = parseInt(process.env.BURN || '0', 10);
const BURNS = [0, 1, 13, 251, 499, 1999];
const MODE = 'competent-burnoffsets';
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

// The standing guard (master-identity): the on-disk standing.js must
// be CURRENT MASTER's version — marker present AND sha256 exactly the
// master sha. A swapped or drifted standing.js is refused loudly.
const EXPECTED_STANDING_SHA = 'f935997640a0c1df1a1eb52d91172c7bc49cc2b9ab58fe9d77f58a17839388e9';
function standingGuard(standingText) {
  if (typeof standingText !== 'string') return { fix: false, shaFull: null, sha: 'unknown', ok: false };
  const shaFull = crypto.createHash('sha256').update(standingText).digest('hex');
  const fix = standingText.indexOf('ROSTER CHECK') !== -1;
  return { fix: fix, shaFull: shaFull, sha: shaFull.slice(0, 12), ok: fix && shaFull === EXPECTED_STANDING_SHA };
}
// The policy guard (own-policy): the on-disk competent.js must be
// current master's OWN version — sha256 exactly 74a890f0844e... Any
// other policy is refused loudly at the run entry point.
const EXPECTED_POLICY_SHA = '74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456';
function policyGuard(policyText) {
  if (typeof policyText !== 'string') return { shaFull: null, sha: 'unknown', ok: false };
  const shaFull = crypto.createHash('sha256').update(policyText).digest('hex');
  return { shaFull: shaFull, sha: shaFull.slice(0, 12), ok: shaFull === EXPECTED_POLICY_SHA };
}
const policyPath = path.join(REPO, 'scripts', 'policies', 'competent.js');
let POLICY_SHA = 'unknown', POLICY_GUARD = null;
try {
  const text = fs.readFileSync(policyPath, 'utf8');
  const g = policyGuard(text);
  POLICY_SHA = g.sha;
  POLICY_GUARD = g;
} catch (e) {
  POLICY_SHA = 'unknown';
  POLICY_GUARD = { shaFull: null, sha: 'unknown', ok: false, error: e && e.message };
}
function refuseUnlessPolicy() {
  const g = POLICY_GUARD;
  if (!g || !g.ok) {
    if (g && g.error) console.error('BURNOFFSETS STOP: cannot read scripts/policies/competent.js: ' + g.error);
    else console.error('BURNOFFSETS STOP: competent.js sha ' + ((g && g.shaFull) || '').slice(0, 12) + ' is not the current-master own-policy sha 74a890f0844e — check out f7352f946:scripts/policies/competent.js first (see prereg).');
    process.exit(2);
  }
}
// The no-code-change guard (every leg): `git diff --name-only --
// src/js` must be EMPTY. Pure checker exported for the proof test;
// the guard shells git and calls it.
function noCodeChangeOk(names) {
  if (!Array.isArray(names)) return false;
  return names.length === 0;
}
function noCodeChangeGuard() {
  let names = null, error = null;
  try {
    const out = execSync('git diff --name-only -- src/js', { cwd: REPO }).toString();
    names = out.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
  } catch (e) { error = (e && e.message) || String(e); }
  if (error) return { ok: false, error: error, names: names };
  return { ok: noCodeChangeOk(names), names: names };
}
function refuseUnlessNoCodeChange() {
  const g = noCodeChangeGuard();
  if (!g.ok) {
    if (g.error) console.error('BURNOFFSETS STOP: no-code-change guard error: ' + g.error);
    else console.error('BURNOFFSETS STOP: this arm carries NO src/js change — git diff lists: ' + (g.names || []).join(', ') + ' — restore the tree to master first (see prereg).');
    process.exit(2);
  }
}
const standingPath = path.join(REPO, 'src', 'js', 'standing.js');
// The standing guard is READ at require time (so oneRun records the
// standing it ran under) but ENFORCED only at the run entry point:
// requiring this module must never exit the process — the proof
// requires the driver to assert on standingGuard on any tree.
let STANDING_FIX = null, STANDING_SHA = 'unknown', STANDING_GUARD = null;
try {
  const text = fs.readFileSync(standingPath, 'utf8');
  const g = standingGuard(text);
  STANDING_FIX = g.fix;
  STANDING_SHA = g.sha;
  STANDING_GUARD = g;
} catch (e) {
  STANDING_FIX = false;
  STANDING_SHA = 'unknown';
  STANDING_GUARD = { fix: false, shaFull: null, sha: 'unknown', ok: false, error: e && e.message };
}
function refuseUnlessStanding() {
  const g = STANDING_GUARD;
  if (!g || !g.ok) {
    if (g && g.error) console.error('BURNOFFSETS STOP: cannot read standing.js: ' + g.error);
    else if (!g.fix) console.error('BURNOFFSETS STOP: standing.js LACKS the roster-check fix — this arm runs on current master only (see prereg).');
    else console.error('BURNOFFSETS STOP: standing.js has the marker but sha ' + (g.shaFull || '').slice(0, 12) + ' is not the current-master sha f935997640a0 — wrong base.');
    process.exit(2);
  }
}
function burnOffsetForLeg(burn) {
  if (BURNS.indexOf(burn) === -1) return null;
  return burn;
}

const outDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-burnoffsets-a-b' + BURN);

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// FLAP SHAPE (measured 2026-11-12 04:19–04:23Z): clear windows last
// ~1–2s and recur every ~2–3 min, so a 2s sampling interval can miss
// a whole window. Sample every 250ms (several samples inside any
// window) for up to 120s per file.
function sleepMs(ms) {
  try {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
  } catch (e) {
    const t0 = process.hrtime.bigint();
    while (process.hrtime.bigint() - t0 < BigInt(ms) * 1000000n) {}
  }
}
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 480; i++) {
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
      if (i === 479) {
        process.stdout.write('@@FALLBACK ' + filePath + '\n' + data + '\n');
        return;
      }
      sleepMs(250);
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
  const { Game } = await loadGame({ seed: seed, mode: MODE, fullTelemetry: false });
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
  // BURN LEG: shift the shared stream by a fixed burn AFTER world
  // generation (setupGame did genRoster + newGame + depart), so the
  // world is identical and only the play-phase dice shift. A burn,
  // not a re-assignment: module-scope aliases (fieldFights.js etc.)
  // hold the same mulberry32 instance, so a burn moves them too.
  // BURN=0 (baseline) burns nothing.
  let burnOffset = null;
  if (BURN > 0) {
    for (let i = 0; i < BURN; i++) Math.random();
    burnOffset = BURN;
  } else {
    burnOffset = 0;
  }
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
    seed: seed, arm: 'burnoffsets', run: RUN, mode: MODE,
    anchorCommit: ANCHOR, standingFix: STANDING_FIX, standingSha: STANDING_SHA,
    policySha: POLICY_SHA, burnOffset: burnOffset,
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
  refuseUnlessStanding();
  refuseUnlessPolicy();
  refuseUnlessNoCodeChange();
  if (burnOffsetForLeg(BURN) === null) { console.error('BURNOFFSETS STOP: unknown BURN ' + BURN + ' — allowed: ' + BURNS.join(', ') + '.'); process.exit(2); }
  if (!SEEDS.length) { console.error('BURNOFFSETS STOP: SEEDS required.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'burnoffsets-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('BURNOFFSETS STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'burnoffsets-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, standingFix: out.standingFix, standingSha: out.standingSha,
      policySha: out.policySha, burnOffset: out.burnOffset,
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

module.exports = { oneRun: oneRun, standingGuard: standingGuard, policyGuard: policyGuard, noCodeChangeOk: noCodeChangeOk, noCodeChangeGuard: noCodeChangeGuard, burnOffsetForLeg: burnOffsetForLeg, BURNS: BURNS, EXPECTED_STANDING_SHA: EXPECTED_STANDING_SHA, EXPECTED_POLICY_SHA: EXPECTED_POLICY_SHA };

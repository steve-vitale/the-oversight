// gap-candidates-driver-20261113.js — the +1 gap deciding test
// (arm sim-gap-candidates-a). Competent policy verbatim, 150d
// death-aware horizon, seeds 190391-190398 — deliberately the SAME
// band as the vetphantom fix leg: a deciding-test leg re-runs the
// same seeds on the collapse window's far end (203a32775) PLUS one
// candidate change cherry-picked uncommitted, so the gap-seed
// outcome is comparable seed-for-seed. This is not a freshness
// violation; the prereg (evidence/2026-11-13/
// sim-gap-candidates-a-prereg.md) says so before any sim.
//
// ONE leg per invocation, selected by LEG env:
//   r180      far end + 28875b1b1 (r180 draw-removal: reframed-recap
//             voiceLine skip + topic-ack skip)
//   joint     far end + 10fe7ee52 + ed33b42b8 + b09cf584e (r125 +
//             r129/r130 favour, TOGETHER)
//   reseed    far end + NO code change; the shared Math.random stream
//             is shifted by a fixed burn of 997 draws after
//             setupGame (world generation untouched)
//   r172      far end + bd0bf10e2 (one-confession-per-sitting guard)
//             — ONLY if legs 1-3 leave the question open
// Legs run sequentially in prereg order. GO per leg: saves >=1 of
// {190392, 190394} with no regression on the far-end survivors
// (190393, 190397, 190398). Mode is fix only — WITH A FIX-SWAP.
// This base PREDATES the r131 roster-check fix (5d16916f4), so the
// on-disk src/js/standing.js is the PRE-FIX version (sha256
// 75762cb2259d...). The fix standing.js (sha256 f8fda4295a99...,
// extracted with `git show 5157782a4:src/js/standing.js`) is swapped
// in UNCOMMITTED for the run and restored byte-identical afterwards
// (see the prereg). The driver REFUSES to run unless the on-disk
// standing.js carries the "ROSTER CHECK" marker AND its sha256 is
// exactly the fix sha, so a leg can never be mislabeled and an
// unswapped run can never be mistaken for a swapped one.
// standingSha is recorded per seed. The swapped file is never
// committed.
//
// OWN POLICY: this leg runs 203a32775's OWN competent.js (sha256
// a7ff5c516440...), the far-end base's policy by construction (the
// driver runs on the detached far-end checkout). The driver REFUSES
// to run unless the on-disk competent.js sha256 is exactly that sha,
// and records policySha per seed — a wrong-policy run is refused
// loudly, never mislabeled.
//
// CANDIDATE GUARD: the driver REFUSES to run unless the on-disk
// game code carries the leg's candidate marker strings (exact-match,
// per leg — see candidateGuard): the cherry-pick must actually be
// applied, not merely claimed. A leg run without its candidate is
// refused loudly, never mislabeled. candidateApplied is recorded
// per seed.
//
// NO-CODE-CHANGE GUARD (reseed leg only): the driver REFUSES to run
// unless `git diff --name-only -- src/js` lists exactly
// src/js/standing.js (the controlled swap) — the reseed leg must
// carry NO candidate code at all. noCodeChange is recorded per seed.
//
// RESEED BURN (reseed leg only): after setupGame (world generation
// is inside setupGame: genRoster + newGame + depart), Math.random()
// is called exactly RESEED_BURN (997) times. A burn — not a
// re-assignment — because five modules capture the mulberry32
// function object into a module-scope alias at load (betrayal.js,
// comms.js, corruption.js, fieldFights.js, finale-campaign.js);
// a re-assignment would leave those aliases (including the fight
// engine) on the old stream, while a burn advances the ONE shared
// instance every call site reads. reseedBurn is recorded per seed.
// The policy RNG (__policyRandom, derived from the manifest seed
// inside runDays) is untouched by the burn.
//
// The vetfirst instrument runs ON (same wraps, same snapshots), plus
// the live SHADOW old-rule count after every snapshot — identical to
// vetphantom-driver, so the per-seed JSONs are field-compatible with
// the vetphantom corpus and the same analyzer patterns apply.
//
// Per-seed JSON goes to evidence/2026-11-13/perseed-gap-candidates-a-<LEG>/
// (sims write once, on purpose). Refuses to overwrite an existing
// per-seed file. Writes use the fishstaff-b writeRobust pattern
// (tmp + readback + @@FALLBACK stdout after 60 retries) so an EPERM
// flap cannot silently lose a seed.
// Usage:
//   LEG=r180 DAYS=150 SEEDS=190391,190392 RUN=gap-candidates-pilot node scripts/gap-candidates-driver-20261113.js
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
const RUN = process.env.RUN || 'gap-candidates-pilot';
const LEG = process.env.LEG || 'r180';
const LEGS = ['r180', 'joint', 'reseed', 'r172'];
const MODE = 'fix'; // single leg: the fix is swapped in; no control variant is rebuilt
const RESEED_BURN = 997; // fixed pre-registered burn for the reseed leg (see header)
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

// The leg guard (swap-aware): the on-disk standing.js must be the
// FIX version, swapped in uncommitted for this run — marker present
// AND sha256 exactly the vetphantom fix sha. The pre-fix first-parent
// version (75762cb2259d...) has no marker and a different sha, so an
// unswapped run is refused loudly instead of being mislabeled.
const EXPECTED_FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const PRE_FIX_SHA = '75762cb2259da3d4d51c57de1548404b45d8269d36a4503341507ed807540e7c';
function legGuard(standingText) {
  if (typeof standingText !== 'string') return { fix: false, shaFull: null, sha: 'unknown', ok: false };
  const shaFull = crypto.createHash('sha256').update(standingText).digest('hex');
  const fix = standingText.indexOf('ROSTER CHECK') !== -1;
  return { fix: fix, shaFull: shaFull, sha: shaFull.slice(0, 12), ok: fix && shaFull === EXPECTED_FIX_SHA };
}
// The policy guard (own-policy): the on-disk competent.js must be
// 203a32775's OWN version — sha256 exactly a7ff5c516440... Any other
// policy (vetphantom-base 0801abd82e52..., current master
// 17f3e4555d01...) is refused loudly at the run entry point, never
// mislabeled. Read at require time, enforced only at run entry, same
// hermeticity rule as the standing guard.
const EXPECTED_POLICY_SHA = 'a7ff5c516440626621a2382e378e37704c2f5c56a69c4eab30f89461503a864a';
const VETPHANTOM_POLICY_SHA = '0801abd82e527dbe6f97ab56c8f0ddb55744998a04a22f332b4bb9b943ecca05';
function legGuardPolicy(policyText) {
  if (typeof policyText !== 'string') return { shaFull: null, sha: 'unknown', ok: false };
  const shaFull = crypto.createHash('sha256').update(policyText).digest('hex');
  return { shaFull: shaFull, sha: shaFull.slice(0, 12), ok: shaFull === EXPECTED_POLICY_SHA };
}
const policyPath = path.join(REPO, 'scripts', 'policies', 'competent.js');
let POLICY_SHA = 'unknown', POLICY_GUARD = null;
try {
  const text = fs.readFileSync(policyPath, 'utf8');
  const g = legGuardPolicy(text);
  POLICY_SHA = g.sha;
  POLICY_GUARD = g;
} catch (e) {
  POLICY_SHA = 'unknown';
  POLICY_GUARD = { shaFull: null, sha: 'unknown', ok: false, error: e && e.message };
}
function refuseUnlessPolicy() {
  const g = POLICY_GUARD;
  if (!g || !g.ok) {
    if (g && g.error) console.error('GAP-CANDIDATES STOP: cannot read scripts/policies/competent.js: ' + g.error);
    else console.error('GAP-CANDIDATES STOP: competent.js sha ' + ((g && g.shaFull) || '').slice(0, 12) + ' is not the first-parent own-policy sha a7ff5c516440 — check out 203a32775:scripts/policies/competent.js first (see prereg).');
    process.exit(2);
  }
}
// The candidate guard: the on-disk game code must carry the leg's
// candidate marker strings (exact-match, per leg) — the cherry-pick
// must actually be applied, not merely claimed. A leg run without
// its candidate is refused loudly, never mislabeled. Markers were
// verified present at 5157782a4 and absent at 203a32775 (git grep,
// before any sim; see the proof test §6, which re-checks them
// hermetically from git show text).
const CANDIDATES = {
  r180: {
    commits: ['28875b1b1'],
    label: 'r180 draw-removal (reframed-recap voiceLine skip + topic-ack skip)',
    markers: [
      { file: 'src/js/conversation.js', text: 'reframed ? line : this.voiceLine(vid, line)' },
      { file: 'src/js/convo-wants.js', text: 'convoAckLines().indexOf(m[1]) !== -1' },
    ],
  },
  joint: {
    commits: ['10fe7ee52', 'ed33b42b8', 'b09cf584e'],
    label: 'joint r125 + r129/r130 (secret answers + teach-plant + favour pools + cycle)',
    markers: [
      { file: 'src/js/conversation.js', text: 'convoSecretAnswerPool' },
      { file: 'src/js/villager-agency.js', text: 'convoTeachPlantLine' },
      { file: 'src/js/convo-wants.js', text: 'convoFavorBlockPool' },
      { file: 'src/js/convo-wants.js', text: 'convoFavorBlockLineCycle' },
    ],
  },
  r172: {
    commits: ['bd0bf10e2'],
    label: 'r172 one-confession-per-sitting guard',
    markers: [
      { file: 'src/js/truth.js', text: 'confessedThisSitting' },
    ],
  },
};
function candidateMarkersPresent(leg, texts) {
  const cand = CANDIDATES[leg];
  if (!cand) return { ok: false, leg: leg, error: 'unknown leg ' + leg, present: [], missing: [] };
  const present = [];
  const missing = [];
  for (const m of cand.markers) {
    const content = texts ? texts[m.file] : null;
    if (typeof content === 'string' && content.indexOf(m.text) !== -1) present.push(m.file + ':' + m.text);
    else missing.push(m.file + ':' + m.text);
  }
  return { ok: missing.length === 0, leg: leg, commits: cand.commits, present: present, missing: missing };
}
function candidateGuard(leg) {
  const cand = CANDIDATES[leg];
  if (!cand) return { ok: false, leg: leg, error: 'unknown leg ' + leg, present: [], missing: [] };
  const texts = {};
  const files = [];
  for (const m of cand.markers) if (files.indexOf(m.file) === -1) files.push(m.file);
  for (const f of files) {
    try { texts[f] = fs.readFileSync(path.join(REPO, f), 'utf8'); }
    catch (e) { return { ok: false, leg: leg, error: 'cannot read ' + f + ': ' + (e && e.message), present: [], missing: [] }; }
  }
  return candidateMarkersPresent(leg, texts);
}
// The no-code-change guard (reseed leg only): `git diff --name-only
// -- src/js` must list exactly src/js/standing.js (the controlled
// swap). Pure checker exported for the proof test; the guard shells
// git and calls it.
function noCodeChangeOk(names) {
  if (!Array.isArray(names)) return false;
  return names.length === 1 && names[0] === 'src/js/standing.js';
}
function noCodeChangeGuard() {
  let names = null, error = null;
  try {
    const out = execSync('git diff --name-only -- src/js', { cwd: REPO }).toString();
    names = out.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
  } catch (e) { error = (e && e.message) || String(e); }
  if (error) return { ok: false, leg: 'reseed', error: error, names: names };
  return { ok: noCodeChangeOk(names), leg: 'reseed', names: names };
}
let CANDIDATE_APPLIED = null;
function refuseUnlessCandidate() {
  if (LEG === 'reseed') {
    const g = noCodeChangeGuard();
    CANDIDATE_APPLIED = g.ok ? { leg: 'reseed', reseedBurn: RESEED_BURN, noCodeChange: true, srcJsDiff: g.names } : null;
    if (!g.ok) {
      if (g.error) console.error('GAP-CANDIDATES STOP: leg reseed no-code-change guard error: ' + g.error);
      else console.error('GAP-CANDIDATES STOP: leg reseed must carry NO src/js change except the standing.js swap — git diff lists: ' + (g.names || []).join(', ') + ' — restore the tree to far end + swap only (see prereg).');
      process.exit(2);
    }
    return;
  }
  const g = candidateGuard(LEG);
  CANDIDATE_APPLIED = g.ok ? { leg: LEG, commits: g.commits, markers: g.present } : null;
  if (!g.ok) {
    if (g.error) console.error('GAP-CANDIDATES STOP: leg ' + LEG + ' candidate guard error: ' + g.error);
    else console.error('GAP-CANDIDATES STOP: leg ' + LEG + ' candidate markers missing: ' + g.missing.join('; ') + ' — cherry-pick ' + (CANDIDATES[LEG] ? CANDIDATES[LEG].commits.join(' + ') : '?') + ' first (see prereg).');
    process.exit(2);
  }
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
  if (MODE === 'control') { console.error('GAP-CANDIDATES STOP: gap-candidates has no control mode — the fix is swapped in.'); process.exit(2); }
  if (MODE === 'fix' && g && !g.ok) {
    if (g.error) console.error('GAP-CANDIDATES STOP: cannot read standing.js: ' + g.error);
    else if (!g.fix) console.error('GAP-CANDIDATES STOP: mode=fix but standing.js LACKS the roster-check fix — perform the fix-swap first (see prereg).');
    else console.error('GAP-CANDIDATES STOP: standing.js has the marker but sha ' + (g.shaFull || '').slice(0, 12) + ' is not the vetphantom fix sha f8fda4295a99 — wrong swap.');
    process.exit(2);
  }
}

const outDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-gap-candidates-a-' + LEG);

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
  // RESEED LEG: shift the shared stream by a fixed burn AFTER world
  // generation (setupGame did genRoster + newGame + depart), so the
  // world is identical and only the play-phase dice shift. A burn,
  // not a re-assignment: module-scope aliases (fieldFights.js etc.)
  // hold the same mulberry32 instance, so a burn moves them too.
  let reseedBurn = null;
  if (LEG === 'reseed') {
    for (let i = 0; i < RESEED_BURN; i++) Math.random();
    reseedBurn = RESEED_BURN;
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
    seed: seed, arm: 'gap-candidates', run: RUN, mode: MODE,
    anchorCommit: ANCHOR, standingFix: STANDING_FIX, standingSha: STANDING_SHA,
    policySha: POLICY_SHA, candidateApplied: CANDIDATE_APPLIED, reseedBurn: reseedBurn,
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
  refuseUnlessPolicy();
  refuseUnlessCandidate();
  if (!SEEDS.length) { console.error('GAP-CANDIDATES STOP: SEEDS required.'); process.exit(2); }
  if (MODE !== 'control' && MODE !== 'fix') { console.error('GAP-CANDIDATES STOP: mode is fixed to fix.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'gap-candidates-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('GAP-CANDIDATES STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'gap-candidates-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, standingFix: out.standingFix, standingSha: out.standingSha,
      policySha: out.policySha, reseedBurn: out.reseedBurn,
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

module.exports = { oneRun: oneRun, legGuard: legGuard, legGuardPolicy: legGuardPolicy, candidateGuard: candidateGuard, candidateMarkersPresent: candidateMarkersPresent, noCodeChangeOk: noCodeChangeOk, noCodeChangeGuard: noCodeChangeGuard, CANDIDATES: CANDIDATES, RESEED_BURN: RESEED_BURN, EXPECTED_FIX_SHA: EXPECTED_FIX_SHA, PRE_FIX_SHA: PRE_FIX_SHA, EXPECTED_POLICY_SHA: EXPECTED_POLICY_SHA, VETPHANTOM_POLICY_SHA: VETPHANTOM_POLICY_SHA };

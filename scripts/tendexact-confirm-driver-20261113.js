// tendexact-confirm-driver-20261113.js — tendexact fresh-seed
// confirm (arm sim-tendexact-confirm-a). Competent policy verbatim,
// 150d death-aware horizon, FRESH seeds 190401-190408 — deliberately
// NOT the matched band: this arm tests whether the tendexact +1
// (re-derived on 190391-190398) generalizes off that band. Two legs
// on the collapse window's far end (203a32775) PLUS the roster-check
// fix swap, mode fix only:
//   baseline  far end + fix swap only (NO candidate — the comparison)
//   tendexact far end + fix swap + e6911eb80 (exact-split _removePantryKcal)
// The fix standing.js (sha256 f8fda4295a99..., extracted with `git show
// 5157782a4:src/js/standing.js`) is swapped in UNCOMMITTED for the run
// and restored byte-identical afterwards (see the prereg). The driver
// REFUSES to run unless the on-disk standing.js carries the "ROSTER
// CHECK" marker AND its sha256 is exactly the fix sha, so a leg can
// never be mislabeled and an unswapped run can never be mistaken for
// a swapped one. standingSha is recorded per seed. The swapped file
// is never committed.
//
// OWN POLICY: this leg runs 203a32775's OWN competent.js (sha256
// a7ff5c516440...), the far-end base's policy by construction (the
// driver runs on the detached far-end checkout). The driver REFUSES
// to run unless the on-disk competent.js sha256 is exactly that sha,
// and records policySha per seed — a wrong-policy run is refused
// loudly, never mislabeled.
//
// CANDIDATE GUARD: on the tendexact leg the driver REFUSES to run
// unless the on-disk game code carries the candidate's marker string
// (exact-match — see candidateGuard): the cherry-pick must actually
// be applied, not merely claimed. The baseline leg carries NO
// candidate; its guard is a no-candidate pass and candidateApplied
// is recorded as null. A tendexact leg run without its candidate is
// refused loudly, never mislabeled. candidateApplied is recorded
// per seed.
//
// The vetfirst instrument runs ON (same wraps, same snapshots), plus
// the live SHADOW old-rule count after every snapshot — identical to
// vetphantom-driver, so the per-seed JSONs are field-compatible with
// the vetphantom corpus and the same analyzer patterns apply.
//
// Per-seed JSON goes to evidence/2026-11-13/perseed-tendexact-confirm-a-<LEG>/
// (sims write once, on purpose). Refuses to overwrite an existing
// per-seed file. Writes use the fishstaff-b writeRobust pattern
// (tmp + readback + @@FALLBACK stdout after 60 retries) so an EPERM
// flap cannot silently lose a seed.
// Usage:
//   LEG=baseline DAYS=150 SEEDS=190401,190402 RUN=tendexact-confirm-pilot node scripts/tendexact-confirm-driver-20261113.js
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
const RUN = process.env.RUN || 'tendexact-confirm-pilot';
const LEG = process.env.LEG || 'baseline';
const LEGS = ['baseline', 'tendexact'];
const MODE = 'fix'; // single leg: the fix is swapped in; no control variant is rebuilt
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
    if (g && g.error) console.error('TENDCONFIRM STOP: cannot read scripts/policies/competent.js: ' + g.error);
    else console.error('TENDCONFIRM STOP: competent.js sha ' + ((g && g.shaFull) || '').slice(0, 12) + ' is not the first-parent own-policy sha a7ff5c516440 — check out 203a32775:scripts/policies/competent.js first (see prereg).');
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
  tendexact: {
    commits: ['e6911eb80'],
    label: 'tendexact exact-split _removePantryKcal',
    markers: [
      { file: 'src/js/hierarchy.js', text: 'EXACT SPLIT (tendexact-a' },
    ],
  },
};
function candidateMarkersPresent(leg, texts) {
  if (leg === 'baseline') return { ok: true, leg: leg, commits: [], present: [], missing: [], noCandidate: true };
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
  if (leg === 'baseline') return { ok: true, leg: leg, commits: [], present: [], missing: [], noCandidate: true };
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
let CANDIDATE_APPLIED = null;
function refuseUnlessCandidate() {
  if (LEG === 'baseline') { CANDIDATE_APPLIED = null; return; }
  const g = candidateGuard(LEG);
  CANDIDATE_APPLIED = g.ok ? { leg: LEG, commits: g.commits, markers: g.present } : null;
  if (!g.ok) {
    if (g.error) console.error('TENDCONFIRM STOP: leg ' + LEG + ' candidate guard error: ' + g.error);
    else console.error('TENDCONFIRM STOP: leg ' + LEG + ' candidate markers missing: ' + g.missing.join('; ') + ' — cherry-pick ' + (CANDIDATES[LEG] ? CANDIDATES[LEG].commits.join(' + ') : '?') + ' first (see prereg).');
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
  if (MODE === 'control') { console.error('TENDCONFIRM STOP: optb-rederive has no control mode — the fix is swapped in.'); process.exit(2); }
  if (MODE === 'fix' && g && !g.ok) {
    if (g.error) console.error('TENDCONFIRM STOP: cannot read standing.js: ' + g.error);
    else if (!g.fix) console.error('TENDCONFIRM STOP: mode=fix but standing.js LACKS the roster-check fix — perform the fix-swap first (see prereg).');
    else console.error('TENDCONFIRM STOP: standing.js has the marker but sha ' + (g.shaFull || '').slice(0, 12) + ' is not the vetphantom fix sha f8fda4295a99 — wrong swap.');
    process.exit(2);
  }
}

const outDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-tendexact-confirm-a-' + LEG);

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
    seed: seed, arm: 'tendexact-confirm', run: RUN, mode: MODE,
    anchorCommit: ANCHOR, standingFix: STANDING_FIX, standingSha: STANDING_SHA,
    policySha: POLICY_SHA, candidateApplied: CANDIDATE_APPLIED,
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
  if (!SEEDS.length) { console.error('TENDCONFIRM STOP: SEEDS required.'); process.exit(2); }
  if (MODE !== 'control' && MODE !== 'fix') { console.error('TENDCONFIRM STOP: mode is fixed to fix.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'tendexact-confirm-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('TENDCONFIRM STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'tendexact-confirm-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, standingFix: out.standingFix, standingSha: out.standingSha,
      policySha: out.policySha,
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

module.exports = { oneRun: oneRun, legGuard: legGuard, legGuardPolicy: legGuardPolicy, candidateGuard: candidateGuard, candidateMarkersPresent: candidateMarkersPresent, CANDIDATES: CANDIDATES, EXPECTED_FIX_SHA: EXPECTED_FIX_SHA, PRE_FIX_SHA: PRE_FIX_SHA, EXPECTED_POLICY_SHA: EXPECTED_POLICY_SHA, VETPHANTOM_POLICY_SHA: VETPHANTOM_POLICY_SHA };

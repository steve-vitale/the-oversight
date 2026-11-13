// masterregress-driver-20261113.js — master-regression DIAGNOSTIC BISECT
// (arm sim-masterregress-a). Competent policy verbatim, 150d
// death-aware horizon, seeds 190391-190398 — deliberately the SAME
// band as the vetphantom fix leg, the firstparent leg, the merge leg,
// the reconciled leg, and burnoffsets-b0: a bisect leg re-runs the
// same seeds on old code, so the survival count is comparable
// seed-for-seed. This is not a freshness violation; the prereg
// (evidence/2026-11-13/sim-masterregress-a-prereg.md) says so before
// any sim.
//
// FOUR legs, THREE bases, ONE driver (see the prereg's settled-ground
// section for why the naive range midpoint is NOT cut — the drop is
// already localized to the merge e4dbe581b by settled arms; this arm
// reproduces the split at the boundary with one driver and controls
// the last confound at the boundary):
//   far     base 203a32775, fix swapped in, own policy a7ff5c51... — expect 4/8
//   near    base f7352f946, NATIVE standing f9359976... (no swap), own policy 74a890f0... — expect 1/8
//   merge   base e4dbe581b, fix swapped in, own policy 26a87e49... — expect 1/8
//   mergeps base e4dbe581b, fix swapped in, FAR-END policy a7ff5c51... swapped in — expect <=2/8
//   smoke   (proof only) any base, marker-only standing guard, no policy guard,
//           corpus to /tmp, small DAYS — validates the driver end-to-end.
//
// The vetfirst instrument runs ON (same wraps, same snapshots), plus
// the live SHADOW old-rule count after every snapshot — identical to
// vetphantom-driver and the bisect drivers, so the per-seed JSONs are
// field-compatible with the firstparent / merge / burnoffsets-b0
// corpora and the same analyzer patterns apply. policySha is recorded
// per seed (policyswap-a precedent).
//
// Per-seed JSON goes to evidence/2026-11-13/perseed-masterregress-a-<leg>/
// (sims write once, on purpose). Refuses to overwrite an existing
// per-seed file. Writes use the reconciled-a writeRobust pattern
// (tmp + readback + @@FALLBACK stdout after 150 retries with
// Atomics.wait real-time backoff — the harness freezes Date.now, so a
// Date.now busy-wait burns instantly) so an EPERM flap cannot
// silently lose a seed.
// Usage:
//   LEG=far DAYS=150 SEEDS=190391,190392 RUN=masterregress-pilot node scripts/masterregress-driver-20261113.js
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
const RUN = process.env.RUN || 'masterregress-pilot';
const LEG = process.env.LEG || '';
const MODE = 'fix'; // single mode: the fix is swapped in (swap legs) or native (near leg)
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

// Per-leg substrate: anchor commit (short), standing expectation,
// policy expectation (exact sha256). Standing modes:
//   'swap'   — on-disk standing.js must be the vetphantom fix file
//              (marker + exact fix sha); the swap is performed
//              before the run, uncommitted, per the prereg.
//   'native' — on-disk standing.js must be the base's own file
//              (marker + exact native sha); no swap is performed.
//   'marker' — smoke mode only: marker present, any sha.
// Policy mode 'exact' enforces the leg's own-policy sha;
// 'any' (smoke only) skips the policy check.
const EXPECTED_FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const LEGS = {
  far: {
    anchor: '203a32775', standing: 'swap', standingSha: EXPECTED_FIX_SHA,
    policySha: 'a7ff5c516440626621a2382e378e37704c2f5c56a69c4eab30f89461503a864a',
    corpus: 'perseed-masterregress-a-far',
  },
  merge: {
    anchor: 'e4dbe581b', standing: 'swap', standingSha: EXPECTED_FIX_SHA,
    policySha: '26a87e4935787717822176e34423d536813c5fdcab99476e0f35215b30d39c24',
    corpus: 'perseed-masterregress-a-merge',
  },
  near: {
    anchor: 'f7352f946', standing: 'native',
    standingSha: 'f935997640a0c1df1a1eb52d91172c7bc49cc2b9ab58fe9d77f58a17839388e9',
    policySha: '74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456',
    corpus: 'perseed-masterregress-a-near',
  },
  mergeps: {
    anchor: 'e4dbe581b', standing: 'swap', standingSha: EXPECTED_FIX_SHA,
    policySha: 'a7ff5c516440626621a2382e378e37704c2f5c56a69c4eab30f89461503a864a',
    corpus: 'perseed-masterregress-a-mergeps',
  },
  smoke: {
    anchor: null, standing: 'marker', standingSha: null, policySha: null,
    corpus: null, // outDir overridden to /tmp below
  },
};

function sha256(text) { return crypto.createHash('sha256').update(text).digest('hex'); }

// legGuard(standingText, policyText): the swap-aware + policy-aware
// leg guard. Returns { fix, standingShaFull, standingSha, standingOk,
// policyShaFull, policySha, policyOk, ok } for the CURRENT leg.
// 'swap' legs require marker + exact fix sha; 'native' legs require
// marker + exact native sha; 'marker' (smoke) requires the marker only.
function legGuard(standingText, policyText) {
  const cfg = LEGS[LEG] || null;
  if (!cfg) return { ok: false, error: 'unknown LEG ' + JSON.stringify(LEG) };
  let s = { fix: false, shaFull: null, sha: 'unknown', ok: false };
  if (typeof standingText === 'string') {
    const full = sha256(standingText);
    s = { fix: standingText.indexOf('ROSTER CHECK') !== -1, shaFull: full, sha: full.slice(0, 12), ok: false };
    if (cfg.standing === 'swap') s.ok = s.fix && full === EXPECTED_FIX_SHA;
    else if (cfg.standing === 'native') s.ok = s.fix && full === cfg.standingSha;
    else if (cfg.standing === 'marker') s.ok = s.fix;
  }
  let p = { shaFull: null, sha: 'unknown', ok: false };
  if (typeof policyText === 'string') {
    const full = sha256(policyText);
    p = { shaFull: full, sha: full.slice(0, 12), ok: false };
    if (cfg.policySha === null) p.ok = true; // smoke: any policy
    else p.ok = full === cfg.policySha;
  }
  return { fix: s.fix, standingShaFull: s.shaFull, standingSha: s.sha, standingOk: s.ok, policyShaFull: p.shaFull, policySha: p.sha, policyOk: p.ok, ok: s.ok && p.ok };
}
const standingPath = path.join(REPO, 'src', 'js', 'standing.js');
const policyPath = path.join(REPO, 'scripts', 'policies', 'competent.js');
// The leg guard is READ at require time (so oneRun records the swap
// and policy it ran under) but ENFORCED only at the run entry point:
// requiring this module must never exit the process — the proof
// requires the driver to assert on legGuard on any tree, including
// one whose on-disk standing.js is not the leg's file.
let STANDING_FIX = null, STANDING_SHA = 'unknown', STANDING_GUARD = null;
let POLICY_SHA = 'unknown', POLICY_GUARD = null;
try {
  const st = fs.readFileSync(standingPath, 'utf8');
  let pol = null;
  try { pol = fs.readFileSync(policyPath, 'utf8'); } catch (e) { pol = null; }
  const g = legGuard(st, pol);
  STANDING_FIX = g.fix;
  STANDING_SHA = g.standingSha;
  STANDING_GUARD = g;
  POLICY_SHA = g.policySha;
  POLICY_GUARD = g;
} catch (e) {
  STANDING_FIX = false;
  STANDING_SHA = 'unknown';
  STANDING_GUARD = { fix: false, shaFull: null, sha: 'unknown', ok: false, error: e && e.message };
  POLICY_SHA = 'unknown';
  POLICY_GUARD = { ok: false, error: e && e.message };
}
// refuseUnlessLegOk(): the leg guards, enforced when the driver is
// actually RUN — a wrong base, wrong swap, or wrong policy exits
// loudly (exit 2, no mislabeled run) instead of running.
function refuseUnlessLegOk() {
  const cfg = LEGS[LEG];
  if (!cfg) { console.error('MASTERREGRESS STOP: unknown LEG ' + JSON.stringify(LEG) + ' (want far|merge|near|mergeps|smoke).'); process.exit(2); }
  // Anchor comparison is by prefix: ANCHOR is the 12-char HEAD while
  // the leg anchors are 9-char abbreviations (203a32775 vs
  // 203a327750a2 — a full-string comparison refuses the right base).
  if (cfg.anchor && ANCHOR.slice(0, cfg.anchor.length) !== cfg.anchor) {
    console.error('MASTERREGRESS STOP: LEG=' + LEG + ' requires anchor ' + cfg.anchor + ' but HEAD is ' + ANCHOR + ' — check out the leg base first.');
    process.exit(2);
  }
  const g = STANDING_GUARD;
  if (MODE === 'control') { console.error('MASTERREGRESS STOP: masterregress has no control mode — the fix is swapped in or native.'); process.exit(2); }
  if (!g || !g.standingOk) {
    if (g && g.error) console.error('MASTERREGRESS STOP: cannot read standing.js: ' + g.error);
    else if (g && !g.fix) console.error('MASTERREGRESS STOP: LEG=' + LEG + ' but standing.js LACKS the roster-check fix marker — perform the fix-swap first (see prereg).');
    else console.error('MASTERREGRESS STOP: standing.js has the marker but sha ' + ((g && g.standingShaFull) || '').slice(0, 12) + ' is not the leg ' + LEG + ' expected sha ' + String((cfg && cfg.standingSha) || 'marker-only').slice(0, 12) + ' — wrong swap.');
    process.exit(2);
  }
  if (!g.policyOk) {
    console.error('MASTERREGRESS STOP: LEG=' + LEG + ' but competent.js sha ' + String(g.policyShaFull || '').slice(0, 12) + ' is not the leg policy sha ' + String(cfg.policySha || 'any').slice(0, 12) + ' — wrong policy (own-policy rule).');
    process.exit(2);
  }
}

const outDir = LEG === 'smoke'
  ? path.join('/tmp', 'masterregress-smoke')
  : path.join(REPO, 'evidence', '2026-11-13', (LEGS[LEG] || {}).corpus || 'perseed-masterregress-a-UNKNOWN');

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 150; i++) {
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
      if (i === 149) {
        process.stdout.write('@@FALLBACK ' + filePath + '\n' + data + '\n');
        return;
      }
      // Real-time backoff: the harness freezes Date.now, so a
      // Date.now busy-wait burns instantly (reconciled-a §9).
      try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 2000); } catch (err) {}
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
    seed: seed, arm: 'masterregress', run: RUN, mode: MODE, leg: LEG,
    anchorCommit: ANCHOR, standingFix: STANDING_FIX, standingSha: STANDING_SHA,
    policySha: POLICY_SHA,
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
  refuseUnlessLegOk();
  if (!SEEDS.length) { console.error('MASTERREGRESS STOP: SEEDS required.'); process.exit(2); }
  if (MODE !== 'control' && MODE !== 'fix') { console.error('MASTERREGRESS STOP: mode is fixed to fix.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'masterregress-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('MASTERREGRESS STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'masterregress-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, leg: out.leg, mode: out.mode, standingFix: out.standingFix, standingSha: out.standingSha,
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

module.exports = { oneRun: oneRun, legGuard: legGuard, LEGS: LEGS, EXPECTED_FIX_SHA: EXPECTED_FIX_SHA };

// talktranscript-driver-20261114.js — OVE-48 SPOKEN-DRIVE transcript driver (arm
// sim-talktranscript-a, Loop A fleshout-20261115T0427Z). A copy of the
// ove48-mech driver with ONE change: the conversation-open recorder
// is the transcript instrument (scripts/talktranscript-instrument-20261114.js),
// which captures c.transcript beats at endConvo instead of Game.say
// lines. Same substrate (far end / subject + roster-check
// standing-fix swap), same seeds band 190457–190464, same 150d
// death-aware horizon, same competent own-policy per step
// (COMPETENT_TALK=1 on both talk legs) — plus per-seed `convo` records.
//
// Per-seed JSON goes to evidence/2026-11-14/
// perseed-talktranscript-<step>/ (sims write once, on purpose).
// Refuses to overwrite an existing per-seed file. Writes use the
// reconciled-a writeRobust pattern (tmp + readback + @@FALLBACK
// stdout after 150 retries with Atomics.wait real-time backoff —
// the harness freezes Date.now, so a Date.now busy-wait burns
// instantly) so an EPERM flap cannot silently lose a seed.
// Usage:
//   LEG=talktranscript STEP=t-talktranscript-base DAYS=150 SEEDS=190457,190458,... RUN=talktranscript-pilot node scripts/talktranscript-driver-20261114.js
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const VF = require(path.join(REPO, 'scripts', 'vetfirst-instrument-20261111'));
const REC = require(path.join(REPO, 'scripts', 'talktranscript-instrument-20261114'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'talktranscript-pilot';
const LEG = process.env.LEG || '';
const STEP = process.env.STEP || '';
const MODE = 'fix'; // single mode: the fix is swapped in at every step
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const EXPECTED_FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const LEGS = {
  talktranscript: {
    anchor: null, standing: 'marker', standingSha: null, policySha: null,
    corpus: null, // outDir overridden by STEP below
  },
  smoke: {
    anchor: null, standing: 'marker', standingSha: null, policySha: null,
    corpus: null, // outDir overridden to /tmp below
  },
};

function sha256(text) { return crypto.createHash('sha256').update(text).digest('hex'); }

function legGuard(standingText, policyText) {
  const cfg = LEGS[LEG] || null;
  if (!cfg) return { ok: false, error: 'unknown LEG ' + JSON.stringify(LEG) };
  let s = { fix: false, shaFull: null, sha: 'unknown', ok: false };
  if (typeof standingText === 'string') {
    const full = sha256(standingText);
    s = { fix: standingText.indexOf('ROSTER CHECK') !== -1, shaFull: full, sha: full.slice(0, 12), ok: false, swapped: full === EXPECTED_FIX_SHA };
    if (cfg.standing === 'swap') s.ok = s.fix && full === EXPECTED_FIX_SHA;
    else if (cfg.standing === 'native') s.ok = s.fix && full === cfg.standingSha;
    else if (cfg.standing === 'marker') s.ok = s.fix;
  }
  let p = { shaFull: null, sha: 'unknown', ok: false };
  if (typeof policyText === 'string') {
    const full = sha256(policyText);
    p = { shaFull: full, sha: full.slice(0, 12), ok: false };
    if (cfg.policySha === null) p.ok = true; // own-policy: any policy
    else p.ok = full === cfg.policySha;
  }
  return { fix: s.fix, standingShaFull: s.shaFull, standingSha: s.sha, standingOk: s.ok, standingSwapped: s.swapped === true, policyShaFull: p.shaFull, policySha: p.sha, policyOk: p.ok, ok: s.ok && p.ok };
}
const standingPath = path.join(REPO, 'src', 'js', 'standing.js');
const policyPath = path.join(REPO, 'scripts', 'policies', 'competent.js');
let STANDING_FIX = null, STANDING_SHA = 'unknown', STANDING_GUARD = null, STANDING_SWAPPED = null;
let POLICY_SHA = 'unknown', POLICY_GUARD = null;
try {
  const st = fs.readFileSync(standingPath, 'utf8');
  let pol = null;
  try { pol = fs.readFileSync(policyPath, 'utf8'); } catch (e) { pol = null; }
  const g = legGuard(st, pol);
  STANDING_FIX = g.fix;
  STANDING_SHA = g.standingSha;
  STANDING_GUARD = g;
  STANDING_SWAPPED = g.standingSwapped;
  POLICY_SHA = g.policySha;
  POLICY_GUARD = g;
} catch (e) {
  STANDING_FIX = false;
  STANDING_SHA = 'unknown';
  STANDING_SWAPPED = null;
  STANDING_GUARD = { fix: false, shaFull: null, sha: 'unknown', ok: false, error: e && e.message };
  POLICY_SHA = 'unknown';
  POLICY_GUARD = { ok: false, error: e && e.message };
}

function refuseUnlessLegOk() {
  const cfg = LEGS[LEG];
  if (!cfg) { console.error('TALKTRANSCRIPT STOP: unknown LEG ' + JSON.stringify(LEG) + ' (want talktranscript|smoke).'); process.exit(2); }
  if (LEG === 'talktranscript' && !STEP) { console.error('TALKTRANSCRIPT STOP: LEG=talktranscript requires STEP — refusing an unlabeled step.'); process.exit(2); }
  if (cfg.anchor && ANCHOR.slice(0, cfg.anchor.length) !== cfg.anchor) {
    console.error('TALKTRANSCRIPT STOP: LEG=' + LEG + ' requires anchor ' + cfg.anchor + ' but HEAD is ' + ANCHOR + ' — check out the leg base first.'); process.exit(2);
  }
  const g = STANDING_GUARD;
  if (MODE === 'control') { console.error('TALKTRANSCRIPT STOP: talktranscript has no control mode — the fix is swapped in at every step.'); process.exit(2); }
  if (!g || !g.standingOk) {
    if (g && g.error) console.error('TALKTRANSCRIPT STOP: cannot read standing.js: ' + g.error);
    else if (g && !g.fix) console.error('TALKTRANSCRIPT STOP: LEG=' + LEG + ' but standing.js LACKS the roster-check fix marker — perform the fix-swap first (see prereg).');
    else console.error('TALKTRANSCRIPT STOP: standing.js has the marker but sha ' + ((g && g.standingShaFull) || '').slice(0, 12) + ' is not the leg ' + LEG + ' expected sha ' + String((cfg && cfg.standingSha) || 'marker-only').slice(0, 12) + ' — wrong swap.');
    process.exit(2);
  }
  if (!g.policyOk) {
    console.error('TALKTRANSCRIPT STOP: LEG=' + LEG + ' but competent.js sha ' + String(g.policyShaFull || '').slice(0, 12) + ' is not the leg policy sha ' + String(cfg.policySha || 'any').slice(0, 12) + ' — wrong policy (own-policy rule).');
    process.exit(2);
  }
}

const outDir = LEG === 'smoke'
  ? path.join('/tmp', 'talktranscript-smoke')
  : path.join(REPO, 'evidence', '2026-11-14', 'perseed-talktranscript-' + STEP);

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

  // Conversation-open recorder: installed after loadGame, before
  // setupGame (same point as the say-wrap above). Pure observer.
  let rec = null;
  try { rec = REC.install(Game); } catch (e) { errors.push('convo-rec-install: ' + String(e.message).slice(0, 80)); }

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

  // Recorder finish + uninstall AFTER the run (uninstall restores the
  // original methods; finish snapshots the records first).
  let convo = null;
  try {
    if (rec) { convo = rec.finish(); rec.uninstall(); }
  } catch (e) { errors.push('convo-rec-finish: ' + String(e.message).slice(0, 80)); }

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
    seed: seed, arm: 'talktranscript', run: RUN, mode: MODE, leg: LEG, step: STEP,
    anchorCommit: ANCHOR, standingFix: STANDING_FIX, standingSha: STANDING_SHA, standingSwapped: STANDING_SWAPPED,
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
    convo: convo,
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
  if (!SEEDS.length) { console.error('TALKTRANSCRIPT STOP: SEEDS required.'); process.exit(2); }
  if (MODE !== 'control' && MODE !== 'fix') { console.error('TALKTRANSCRIPT STOP: mode is fixed to fix.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'talktranscript-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('TALKTRANSCRIPT STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'talktranscript-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, leg: out.leg, step: out.step, mode: out.mode, standingFix: out.standingFix, standingSha: out.standingSha, standingSwapped: out.standingSwapped,
      policySha: out.policySha,
      days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      endPantryKcal: out.endPantryKcal,
      killCalls: out.killCalls ? out.killCalls.length : null,
      snapshots: out.daily ? out.daily.length : null,
      vetSays: out.vetSays.length,
      convoOpens: out.convo ? out.convo.opens.length : null,
      convoDawnReads: out.convo ? out.convo.totals.dawnPriorityReads : null,
      deaths: out.deaths.length,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun, legGuard: legGuard, LEGS: LEGS, EXPECTED_FIX_SHA: EXPECTED_FIX_SHA };

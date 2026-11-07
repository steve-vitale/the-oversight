// stab-driver-20261107.js — staged-trajectory stability driver
// (arm sim-stageally-stab-b, run fleshout-loop-b-20261107T0530Z). DIAG
// only, zero src/js. Stageally-driver shape, all five policies; the
// ONLY difference between the unperturbed and perturbed legs of a
// seed-policy pair is the trajfrag displacement (one extra Math.random()
// draw at day 0, after setupGame, before runDays).
//
// DRAW CENSUS: after each loadGame a counting wrapper is installed on
// global Math.random (see scripts/stab-instrument-20261107.js). It
// delegates to the seeded closure, so trajectories cannot change — it
// only counts. Per-hook draw deltas bracket each policy-hook call:
// daily-base (competent.daily), daily-stage (stageParty — the invites
// subsystem), fight (rally + base fight), rally-verb
// (Game.tbPlayerRally, wrapped at the method), pending (record-only).
// For the staging policies (staged, norally, nopending) the driver's
// daily hook calls competent.daily then STAGED.stageParty directly —
// exactly the staged policy's daily body, split so the two parts can
// be bracketed separately (the policy calls its module-local
// stageParty, which the driver cannot bracket from outside). The
// proof test pins that equivalence against the policy source.
//
// Per-seed JSON goes to evidence/2026-11-07/perseed-stageally-stab-b/
// (sims write once, on purpose), or $OUTDIR when set (proof legs use
// /tmp). Refuses to overwrite. Death-aware horizon (runDays ends on
// village death / win). Seeds run sequentially in one process via the
// shared harness (loadGame per seed).
// Usage:
//   DAYS=150 SEEDS=53001..53008 RUN=stab-baseline-unperturbed POLICY=baseline node scripts/stab-driver-20261107.js
//   DAYS=150 SEEDS=53001..53008 RUN=stab-baseline-perturbed POLICY=baseline PERTURB=1 node scripts/stab-driver-20261107.js
//   DAYS=150 SEEDS=53001..53008 RUN=stab-staged-unperturbed POLICY=staged node scripts/stab-driver-20261107.js
//   DAYS=150 SEEDS=53001..53008 RUN=stab-staged-perturbed POLICY=staged PERTURB=1 node scripts/stab-driver-20261107.js
//   ... POLICY=norally|noinvites|nopending with RUN=stab-<policy>-unperturbed|perturbed
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const STAGED = require(path.join(REPO, 'scripts', 'policies', 'competent-stageally-a'));
const RALLY = require(path.join(REPO, 'scripts', 'policies', 'competent-rally-bankkiller-b'));
const NORALLY = require(path.join(REPO, 'scripts', 'policies', 'competent-stageally-norally-b'));
const NOINVITES = require(path.join(REPO, 'scripts', 'policies', 'competent-stageally-noinvites-b'));
const NOPENDING = require(path.join(REPO, 'scripts', 'policies', 'competent-stageally-nopending-b'));
const INST = require(path.join(REPO, 'scripts', 'stageally-instrument-20261106'));
const TRAJ = require(path.join(REPO, 'scripts', 'trajfrag-instrument-20261107'));
const STAB = require(path.join(REPO, 'scripts', 'stab-instrument-20261107'));

const POLICIES = {
  baseline: { policy: competent, mode: 'competent-stageally-baseline' },
  staged: { policy: STAGED.stagedPolicy, mode: 'competent-stageally-staged' },
  norally: { policy: NORALLY.policy, mode: 'competent-stageally-norally' },
  noinvites: { policy: NOINVITES.policy, mode: 'competent-stageally-noinvites' },
  nopending: { policy: NOPENDING.policy, mode: 'competent-stageally-nopending' },
};
const STAGING = { staged: true, norally: true, nopending: true };

function expandSeeds(raw) {
  const out = [];
  (raw || '').split(',').forEach(function (part) {
    const t = part.trim();
    if (!t) return;
    const m = t.match(/^(\d+)\.\.(\d+)$/);
    if (m) { for (let s = parseInt(m[1], 10); s <= parseInt(m[2], 10); s++) out.push(s); }
    else if (Number.isFinite(parseInt(t, 10))) out.push(parseInt(t, 10));
  });
  return out;
}

const SEEDS = expandSeeds(process.env.SEEDS);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'stab-pilot';
const PERTURB = process.env.PERTURB === '1';
const POLICY = process.env.POLICY || 'baseline';
if (!SEEDS.length) { console.error('STAB STOP: SEEDS required.'); process.exit(2); }
if (!POLICIES[POLICY]) { console.error('STAB STOP: POLICY must be baseline|staged|norally|noinvites|nopending.'); process.exit(2); }
if (RUN !== 'stab-' + POLICY + '-unperturbed' && RUN !== 'stab-' + POLICY + '-perturbed' && !/^stab-/.test(RUN)) {
  console.error('STAB STOP: RUN must be stab-<policy>-unperturbed|perturbed.'); process.exit(2);
}
if (PERTURB && RUN !== 'stab-' + POLICY + '-perturbed') { console.error('STAB STOP: PERTURB=1 requires RUN=stab-<policy>-perturbed.'); process.exit(2); }
if (!PERTURB && RUN === 'stab-' + POLICY + '-perturbed') { console.error('STAB STOP: RUN=stab-<policy>-perturbed requires PERTURB=1.'); process.exit(2); }
const policy = POLICIES[POLICY].policy;
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-07', 'perseed-stageally-stab-b');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'stab-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('STAB STOP: refusing to overwrite ' + file); process.exit(3); }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: POLICIES[POLICY].mode, fullTelemetry: false });
  // Draw census on (counting wrapper delegates to the seeded closure).
  const counter = STAB.installDrawCounter(100);
  const deathSays = [];
  const fightLines = [];
  const inviteLines = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (/dead|died|didn't come back|grave|buried|screams|starts digging|slain|is dead|veteran|blood your|HELD|draft waits|stood and fought/i.test(arg) && deathSays.length < 400) deathSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
          if (/ON ME|Rally|rally|line closes|hold the line|TOGETHER/i.test(arg) && fightLines.length < 200) fightLines.push({ day: gday(Game), line: String(arg).slice(0, 600) });
          if (/joins your party|JOINED THE PARTY|shakes their head|I work alone|I don't know you well enough/i.test(arg) && inviteLines.length < 100) inviteLines.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  const setupDraws = counter.total;
  const inst = INST.install(Game);
  const t = inst.t;
  // Rally-verb draw bracket: tbPlayerRally is called inside the rally
  // fight hook; wrap the method so its own draws are separable from
  // the base fight's draws inside the 'fight' bucket.
  let origRally = null;
  try {
    if (typeof Game.tbPlayerRally === 'function') {
      origRally = Game.tbPlayerRally;
      Game.tbPlayerRally = function () {
        const before = counter.total;
        try { return origRally.apply(this, arguments); }
        finally {
          const d = counter.total - before;
          counter.hooks.rallyVerb = (counter.hooks.rallyVerb || 0) + d;
          counter.hookCalls.rallyVerb = (counter.hookCalls.rallyVerb || 0) + 1;
        }
      };
    } else { errors.push('rally-wrap: Game.tbPlayerRally is not a function'); }
  } catch (e) { errors.push('rally-wrap-install: ' + String(e.message).slice(0, 80)); }

  const perDayDraws = [];
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try {
        if (STAGING[POLICY]) {
          // Staged daily, split for bracketing: base, then invites.
          STAB.hookDelta(counter, 'dailyBase', function () { try { competent.daily(Gm, ctx); } catch (e) {} });
          STAB.hookDelta(counter, 'dailyStage', function () { STAGED.stageParty(Gm, ctx); });
        } else {
          STAB.hookDelta(counter, 'dailyBase', function () { return policy.daily(Gm, ctx); });
        }
      } finally {
        try {
          const d = gday(Game);
          if (d !== lastSnapDay) {
            lastSnapDay = d;
            inst.snapshot();
            perDayDraws.push({ day: d, totalDraws: counter.total, hookDraws: STAB.hookDrawsTotal(counter) });
          }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });
  if (typeof policy.fight === 'function') {
    wrapped.fight = function (Gm, ctx) {
      return STAB.hookDelta(counter, 'fight', function () { return policy.fight(Gm, ctx); });
    };
  }
  if (typeof policy.pending === 'function') {
    wrapped.pending = function (Gm, ctx) {
      return STAB.hookDelta(counter, 'pending', function () { return policy.pending(Gm, ctx); });
    };
  }

  try { RALLY.resetBankkillerStats(); } catch (e) { errors.push('rally-reset: ' + String(e.message).slice(0, 80)); }
  try { STAGED.resetStageallyStats(); } catch (e) { errors.push('stageally-reset: ' + String(e.message).slice(0, 80)); }
  // THE DISPLACEMENT (perturbed leg only): one extra game-RNG draw at
  // day 0, after setupGame, before runDays. Recorded, never repeated.
  // It passes through the counting wrapper (total +1, no hook bucket).
  let displacedValue = null;
  if (PERTURB) displacedValue = TRAJ.displace();
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { inst.snapshot(); } catch (e) {}
  let fin = null;
  try { fin = inst.finalize(); } catch (e) { errors.push('finalize: ' + String(e.message).slice(0, 80)); }
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }
  try { if (origRally) Game.tbPlayerRally = origRally; } catch (e) {}
  const totalDraws = counter.total;
  try { counter.uninstall(); } catch (e) {}
  let rallyStats = null, stageStats = null;
  try { rallyStats = RALLY.bankkillerStats(); } catch (e) { errors.push('rally-stats: ' + String(e.message).slice(0, 80)); }
  try { stageStats = STAGED.stageallyStats(); } catch (e) { errors.push('stageally-stats: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  const out = {
    seed: seed, arm: 'stageally-stab', run: RUN, policy: POLICY, anchorCommit: ANCHOR,
    perturbed: PERTURB, displacedValue: displacedValue,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: fin ? fin.scaleRank : null,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: fin ? fin.unlockedWave : null, standing: fin ? fin.standing : null,
    readiness5: fin ? fin.readiness5 : null,
    fights: t.fights, daily: t.daily, killsLive: t.killsLive, scholarDeaths: t.scholarDeaths, killerTrack: t.killerTrack,
    rallyCalls: t.rallyCalls || [], tbFights: t.tbFights || [],
    bankkillerStats: rallyStats, stageallyStats: stageStats,
    deathSays: deathSays, fightLines: fightLines, inviteLines: inviteLines, sayCount: sayCount,
    waveKillLog: fin ? fin.waveKillLog : null, fallen: fin ? fin.fallen : null, wavesFaced: fin ? fin.wavesFaced : null,
    deadMap: fin ? fin.deadMap : null, endScholarId: fin ? fin.endScholarId : null,
    teleDeaths: (result.samples && result.samples.deaths) || null,
    instrumentErrors: t.instrumentErrors.concat(errors),
    rngDraws: {
      total: totalDraws, setup: setupDraws,
      hooks: counter.hooks, hookCalls: counter.hookCalls,
      engine: totalDraws - STAB.hookDrawsTotal(counter),
      sampled: counter.sampled, sampleEvery: counter.sampleEvery, samples: counter.samples,
      perDay: perDayDraws,
    },
  };
  return out;
}

(async function () {
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'stab-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const last = out.daily[out.daily.length - 1] || {};
    const r5 = last.readiness5 || {};
    const ss = out.stageallyStats || {};
    const rd = out.rngDraws || {};
    console.log(JSON.stringify({
      seed: out.seed, policy: out.policy, perturbed: out.perturbed,
      days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing,
      endReadyVets: r5.veterans != null ? r5.veterans : null,
      fights: out.fights.length, w4fights: out.fights.filter(function (f) { return (f.wave | 0) >= 4; }).length,
      w4kills: (out.waveKillLog || []).filter(function (e2) { return ((e2.w | 0) >= 4); }).length,
      rallyFires: out.bankkillerStats ? out.bankkillerStats.rallyFires : null,
      invites: ss.invites != null ? ss.invites : null,
      accepted: ss.accepted != null ? ss.accepted : null,
      partyDays2: out.daily.filter(function (d) { return (d.partySize | 0) >= 2; }).length,
      drawsTotal: rd.total, drawsSetup: rd.setup,
      drawsDailyBase: rd.hooks ? rd.hooks.dailyBase : null,
      drawsDailyStage: rd.hooks ? rd.hooks.dailyStage : null,
      drawsFight: rd.hooks ? rd.hooks.fight : null,
      drawsRallyVerb: rd.hooks ? rd.hooks.rallyVerb : null,
      drawsPending: rd.hooks ? rd.hooks.pending : null,
      drawsEngine: rd.engine,
      snapshots: out.daily.length, errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

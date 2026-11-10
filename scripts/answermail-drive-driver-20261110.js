// answermail-drive-driver-20261110.js — answer-the-mail DRIVE pilot driver
// (arm sim-answermail-drive-a, run fleshout-20261110T1215Z). Band
// 150201-150208 (FRESH — see the prereg for the freshness check), 150d
// death-aware, two legs through ONE driver:
//   POLICY=competent -> plain competent, ANSWERMAIL_DRIVE unset (baseline
//                        leg; the drive hook never runs — the per-seed
//                        JSON must show driveStats null on every seed)
//   POLICY=drive     -> competent + ANSWERMAIL_DRIVE=1 (armed leg; the
//                        ENGINE hook answers the mail on its daily tick,
//                        gated on a living available representative)
// The driver FAILS LOUDLY if POLICY=drive but ANSWERMAIL_DRIVE is not
// '1' in its own environment — a silently unarmed "armed" leg would
// judge the drive on data where it never ran. Each leg is a separate
// node invocation, so no env leaks between legs.
// Instrument: scripts/trustgrowth-instrument-20261109.js v3 reused
// VERBATIM (setter event log + seq intervals + _trustGain wrap). The
// per-seed JSON carries the same fields as the answermail corpus so
// scripts/trustgrowth-analyze-20261109.js runs on it unchanged, plus
// policy (leg), driveEnv, driveStats (Game.state.answermailDrive), and
// teleDeaths (for the starvation cost bar). Per-seed JSON goes to
// evidence/2026-11-10/perseed-answermail-drive-a/, or $OUTDIR when set
// (proof legs use /tmp). Refuses to overwrite an existing per-seed file.
// Usage:
//   DAYS=150 SEEDS=150201..150208 RUN=answermail-drive-base POLICY=competent node scripts/answermail-drive-driver-20261110.js
//   DAYS=150 SEEDS=150201..150208 RUN=answermail-drive-armed POLICY=drive ANSWERMAIL_DRIVE=1 node scripts/answermail-drive-driver-20261110.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const DR = require(path.join(REPO, 'scripts', 'policies', 'competent-answermail-drive-a'));
const INST = require(path.join(REPO, 'scripts', 'trustgrowth-instrument-20261109'));

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
const RUN = process.env.RUN || 'answermail-drive-base';
const POLICY_NAME = process.env.POLICY || 'competent';
const DRIVE_ON = process.env.ANSWERMAIL_DRIVE === '1';
if (!SEEDS.length) { console.error('ANSWERMAIL-DRIVE STOP: SEEDS required.'); process.exit(2); }
if (POLICY_NAME !== 'competent' && POLICY_NAME !== 'drive') { console.error('ANSWERMAIL-DRIVE STOP: POLICY must be competent|drive.'); process.exit(2); }
if (POLICY_NAME === 'drive' && !DRIVE_ON) {
  console.error('ANSWERMAIL-DRIVE STOP: POLICY=drive requires ANSWERMAIL_DRIVE=1 in the environment — refusing a silently unarmed armed leg.');
  process.exit(2);
}
if (POLICY_NAME === 'competent' && DRIVE_ON) {
  console.error('ANSWERMAIL-DRIVE STOP: POLICY=competent with ANSWERMAIL_DRIVE=1 — the control leg must run with the drive off.');
  process.exit(2);
}
const policy = (POLICY_NAME === 'drive') ? DR.drivePolicy : competent;
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-10', 'perseed-answermail-drive-a');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'answermail-drive-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('ANSWERMAIL-DRIVE STOP: refusing to overwrite ' + file); process.exit(3); }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'competent-answermail-drive-' + POLICY_NAME, fullTelemetry: false });
  const trustSays = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (/trust|tribute|tend|bond|polity|realm|season|link|accord|gesture|grain|grief/i.test(arg) && trustSays.length < 300) trustSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  const inst = INST.install(Game);
  const t = inst.t;
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (d !== lastSnapDay) { lastSnapDay = d; inst.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { inst.snapshot(); } catch (e) {}
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }
  let driveStats = null;
  try { driveStats = DR.driveStats(Game); } catch (e) { errors.push('drive-stats: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  let scaleRank = null, unlocked = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
  let standing = null;
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}

  const out = {
    seed: seed, arm: 'answermail-drive', run: RUN, policy: POLICY_NAME, anchorCommit: ANCHOR,
    driveEnv: DRIVE_ON, driveStats: driveStats,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    daily: t.daily, gains: t.gains, events: t.events, trustSays: trustSays, sayCount: sayCount,
    teleDeaths: (result.samples && result.samples.deaths) || null,
    instrumentErrors: t.instrumentErrors.concat(errors),
  };
  return out;
}

(async function () {
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'answermail-drive-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const last = out.daily[out.daily.length - 1] || {};
    const ds = out.driveStats || {};
    console.log(JSON.stringify({
      seed: out.seed, policy: out.policy, driveEnv: out.driveEnv, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      links: last.linkTotal != null ? last.linkTotal : null,
      accordAnswers: ds.accordAnswers | 0, tends: ds.tends | 0,
      renegAnswers: ds.renegotiationAnswers | 0, demandAnswers: ds.demandAnswers | 0,
      blockedNoAnswerer: ((ds.blockedDays || {}).noAnswerer | 0),
      starvation: ((out.teleDeaths || []).filter(function (e) { return e && e.cause === 'starvation'; })).length,
      deaths: (out.teleDeaths || []).length,
      gains: out.gains.length, events: out.events.length, snapshots: out.daily.length, errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

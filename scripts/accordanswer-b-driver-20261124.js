// accordanswer-b-driver-20261124.js — accord-answer probe driver
// (arm sim-accordanswer-b, run fleshout-loop-b-20261124T0840Z).
// Competent policy VERBATIM on both legs; the ONLY difference is
// the env gate: control = default env (drive off), arm =
// ANSWERMAIL_DRIVE=1 (the engine's daily auto-answer). Two legs,
// one driver, separate node invocations per leg (no env leak).
// Seeds run sequentially in one process via the shared harness
// (loadGame per seed). Per-seed JSON goes to
// evidence/2026-11-24/perseed-accordanswer-b/. Refuses to
// overwrite an existing per-seed file. After each CONTROL seed
// the driver compares the frozen reproduction fields against the
// havenlink corpus and STOPS (exit 3) on the first divergence —
// the replay is then abandoned and the arm reports the
// divergence instead of judging on a moved substrate.
// Usage:
//   DAYS=150 SEEDS=109301..109308 RUN=accordanswer-b-ctl POLICY=competent node scripts/accordanswer-b-driver-20261124.js
//   DAYS=150 SEEDS=109301..109308 RUN=accordanswer-b-arm POLICY=drive ANSWERMAIL_DRIVE=1 node scripts/accordanswer-b-driver-20261124.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const INST = require(path.join(REPO, 'scripts', 'accordanswer-b-instrument-20261124'));

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
const RUN = process.env.RUN || 'accordanswer-b-ctl';
const POLICY_NAME = process.env.POLICY || 'competent';
const DRIVE_ON = process.env.ANSWERMAIL_DRIVE === '1';
if (!SEEDS.length) { console.error('ACCORDANSWER STOP: SEEDS required.'); process.exit(2); }
if (POLICY_NAME !== 'competent' && POLICY_NAME !== 'drive') { console.error('ACCORDANSWER STOP: POLICY must be competent|drive.'); process.exit(2); }
if (POLICY_NAME === 'drive' && !DRIVE_ON) {
  console.error('ACCORDANSWER STOP: POLICY=drive requires ANSWERMAIL_DRIVE=1 in the environment — refusing a silently unarmed armed leg.');
  process.exit(2);
}
if (POLICY_NAME === 'competent' && DRIVE_ON) {
  console.error('ACCORDANSWER STOP: POLICY=competent with ANSWERMAIL_DRIVE=1 — the control leg must run with the drive off.');
  process.exit(2);
}
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-24', 'perseed-accordanswer-b');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'accordanswer-b-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('ACCORDANSWER STOP: refusing to overwrite ' + file); process.exit(3); }
}
const havenlinkDir = path.join(REPO, 'evidence', '2026-11-24', 'perseed-havenlink-b');

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-accordanswer-b-' + POLICY_NAME, fullTelemetry: false });
  const errors = [];
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
  let peakBeforeEndCall = null, endUnlockedWave = null, peakAfterEndCall = null;
  try { peakBeforeEndCall = Game._standingPeakWave ? Game._standingPeakWave() : null; } catch (e) {}
  try { endUnlockedWave = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('endUnlockedWave: ' + String(e.message).slice(0, 80)); }
  try { peakAfterEndCall = Game._standingPeakWave ? Game._standingPeakWave() : null; } catch (e) {}
  let otherVillages = [];
  try { otherVillages = inst.otherVillages(); } catch (e) { errors.push('otherVillages: ' + String(e.message).slice(0, 80)); }
  let driveStats = null;
  try { driveStats = (Game.state || {}).answermailDrive ? JSON.parse(JSON.stringify((Game.state || {}).answermailDrive)) : null; } catch (e) { errors.push('driveStats: ' + String(e.message).slice(0, 80)); }
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  let scaleRank = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  const out = {
    seed: seed, arm: 'accordanswer-b', run: RUN, policy: POLICY_NAME,
    anchorCommit: ANCHOR, driveEnv: DRIVE_ON, driveStats: driveStats,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1,
    endUnlockedWave: endUnlockedWave,
    peakBeforeEndCall: peakBeforeEndCall, peakAfterEndCall: peakAfterEndCall,
    endCallMovedPeak: (peakBeforeEndCall != null && peakAfterEndCall != null && (peakAfterEndCall | 0) > (peakBeforeEndCall | 0)),
    daily: t.daily, killEvents: t.killEvents, deathEvents: t.deathEvents,
    feastEvents: t.feastEvents, standingLines: t.standingLines, releaseLines: t.releaseLines, saySample: t.saySample,
    linkEvents: t.linkEvents, proposeEvents: t.proposeEvents, counterEvents: t.counterEvents,
    nationalEvents: t.nationalEvents, linkLines: t.linkLines,
    accordStageEvents: t.accordStageEvents, accordAnswerEvents: t.accordAnswerEvents,
    driveCallDays: t.driveCallDays,
    otherVillages: otherVillages,
    wrapCounts: t.wrapCounts,
    instrumentErrors: t.instrumentErrors.concat(errors),
  };
  return out;
}

(async function () {
  const AN = require(path.join(REPO, 'scripts', 'accordanswer-b-analyze-20261124'));
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'accordanswer-b-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const c = AN.classifySeed(out);
    let repro = null;
    if (POLICY_NAME === 'competent') {
      const hlFile = path.join(havenlinkDir, 'havenlink-b-s' + seed + '-havenlink-b.json');
      if (fs.existsSync(hlFile)) {
        const hl = JSON.parse(fs.readFileSync(hlFile, 'utf8'));
        repro = AN.reproductionCheck(out, hl);
      } else {
        repro = { seed: seed, match: false, mismatches: [{ field: 'havenlink-file', replay: 'present', pilot: 'MISSING ' + hlFile }] };
      }
    }
    const ds = out.driveStats || {};
    console.log(JSON.stringify({
      seed: out.seed, policy: out.policy, driveEnv: out.driveEnv, days: out.days, endReason: out.endReason, won: out.won,
      scaleRank: out.scaleRank, maxWave: out.maxWave, endUnlockedWave: out.endUnlockedWave,
      staged: c.staged.length, answered: c.answered.length, unanswered: c.unanswered.length,
      accordAnswers: ds.accordAnswers | 0, tends: ds.tends | 0,
      renegAnswers: ds.renegotiationAnswers | 0, demandAnswers: ds.demandAnswers | 0,
      driveCalls: c.driveCalls, errors: out.instrumentErrors.length,
      unclassified: c.unclassified, unclassifiedReasons: c.unclassifiedReasons,
      file: path.relative(REPO, file),
      reproMatch: repro ? repro.match : null, reproMismatches: repro ? repro.mismatches : null,
    }));
    if (repro && !repro.match) {
      console.error('ACCORDANSWER REPRO DIVERGENCE seed ' + seed + ': ' + JSON.stringify(repro.mismatches) + ' — replay abandoned, the substrate moved since the havenlink corpus.');
      process.exit(3);
    }
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

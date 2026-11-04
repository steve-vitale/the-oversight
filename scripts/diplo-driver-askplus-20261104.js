// diplo-driver-askplus-20261104.js — competent-plus-ask pilot driver
// (arm sim-askplus-a, run fleshout-20261104T0820Z). Same shape as
// scripts/diplo-driver-20261104.js (arm sim-diplo-b), with the policy
// set extended to competent|competent-askplus and the output directory
// moved to evidence/2026-11-04/perseed-askplus-a/ so diplo-b files are
// never overwritten. Diplo-b's driver file is NOT edited.
// Death-aware horizon (runDays ends on village death / win).
// Per-seed JSON is written once, on purpose. Refuses to overwrite.
// The daily snapshot never calls villageStandingTotal or unlockedWave
// (side-effecting); ONE end-of-run unlockedWave call is made AFTER the
// run and reported separately — never counted as a natural door-open.
// Usage:
//   DAYS=140 POLICY=competent-askplus SEEDS=99501,99502 RUN=askplus node scripts/diplo-driver-askplus-20261104.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const INST = require(path.join(REPO, 'scripts', 'diplo-instrument-20261104'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '140', 10) || 140;
const RUN = process.env.RUN || 'askplus';
const POLICY = process.env.POLICY || 'competent-askplus';
if (!SEEDS.length) { console.error('ASKPLUS STOP: SEEDS required.'); process.exit(2); }
if (POLICY !== 'competent' && POLICY !== 'competent-askplus') { console.error('ASKPLUS STOP: POLICY must be competent or competent-askplus.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-04', 'perseed-askplus-a');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'askplus-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('ASKPLUS STOP: refusing to overwrite ' + file); process.exit(3); }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const policy = (POLICY === 'competent-askplus')
    ? require(path.join(REPO, 'scripts', 'policies', 'competent-askplus')).competentAskplus
    : require(path.join(REPO, 'scripts', 'policies', 'competent')).competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-diplo-' + POLICY, fullTelemetry: false });
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
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  let scaleRank = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  const out = {
    seed: seed, policy: POLICY, arm: 'askplus', run: RUN, anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1,
    endUnlockedWave: endUnlockedWave,
    peakBeforeEndCall: peakBeforeEndCall, peakAfterEndCall: peakAfterEndCall,
    endCallMovedPeak: (peakBeforeEndCall != null && peakAfterEndCall != null && (peakAfterEndCall | 0) > (peakBeforeEndCall | 0)),
    daily: t.daily, proposalEvents: t.proposalEvents, courtshipEvents: t.courtshipEvents,
    travelCalls: t.travelCalls, linkFormedEvents: t.linkFormedEvents,
    deathEvents: t.deathEvents, sayLines: t.sayLines, wrapCounts: t.wrapCounts,
    instrumentErrors: t.instrumentErrors.concat(errors),
  };
  return out;
}

(async function () {
  const AN = require(path.join(REPO, 'scripts', 'diplo-analyze-askplus-20261104'));
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'askplus-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const s = AN.summarizeSeed(out);
    console.log(JSON.stringify({
      seed: out.seed, policy: out.policy, days: out.days, endReason: out.endReason, won: out.won,
      scaleRank: out.scaleRank, maxWave: out.maxWave, endUnlockedWave: out.endUnlockedWave,
      ovAtDay1: s.ovAtDay1, ovMax: s.ovMax, knownEver: s.knownEver,
      bestOpinion: s.bestOpinion, opinion10Villages: s.opinion10Villages,
      villageTileDays: s.villageTileDays, codexStudyCalls: s.codexStudyCalls,
      proposalCalls: s.proposalCalls, proposalOutcomes: s.proposalOutcomes,
      linksFormed: s.linksFormed, linkShapes: s.linkShapes,
      maxDiplomacy: s.maxDiplomacy, endDiplomacy: s.endDiplomacy,
      diploPositiveDays: s.diploPositiveDays, regionalPlusDays: s.regionalPlusDays,
      furthest: s.furthest,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

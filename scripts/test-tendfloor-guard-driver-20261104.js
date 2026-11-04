// test-tendfloor-guard-driver-20261104.js — floored tend-through CONFIRM driver
// (arm sim-tendfloor-guard-b). Two legs on identical fresh seeds:
//   POLICY=leadcourt-tendthrough RUN=tendfloor-guard-base   (baseline leg)
//   POLICY=leadcourt-tendfloor-b RUN=tendfloor-guard-armed  (armed leg)
// Death-aware 300d horizon, diplo instrument REUSED verbatim
// (zero src/js). Per-seed JSON goes to
// evidence/2026-11-04/perseed-tendfloor-guard-b/ (sims write once, on
// purpose). Refuses to overwrite an existing per-seed file. The
// daily snapshot never calls villageStandingTotal or
// unlockedWave (side-effecting); ONE end-of-run unlockedWave
// call is made AFTER the run and reported separately
// (endUnlockedWave, endCallMovedPeak) — never counted as a
// natural door-open.
// Usage:
//   DAYS=300 SEEDS=99217,99218 POLICY=leadcourt-tendfloor-b RUN=tendfloor-guard-armed node scripts/test-tendfloor-guard-driver-20261104.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const INST = require(path.join(REPO, 'scripts', 'diplo-instrument-20261104'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '300', 10) || 300;
const POLICY = process.env.POLICY || '';
const RUN = process.env.RUN || '';
const MAP = {
  'leadcourt-tendthrough': { run: 'tendfloor-guard-base', file: 'leadcourt-tendthrough', exp: 'leadcourtTendthrough' },
  'leadcourt-tendfloor-b': { run: 'tendfloor-guard-armed', file: 'leadcourt-tendfloor-b', exp: 'leadcourtTendfloorB' },
};
if (!SEEDS.length) { console.error('TENDFLOOR-GUARD STOP: SEEDS required.'); process.exit(2); }
if (!MAP[POLICY] || MAP[POLICY].run !== RUN) { console.error('TENDFLOOR-GUARD STOP: POLICY/RUN mismatch (allowed: leadcourt-tendthrough/tendfloor-guard-base, leadcourt-tendfloor-b/tendfloor-guard-armed).'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-04', 'perseed-tendfloor-guard-b');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'tendfloor-guard-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('TENDFLOOR-GUARD STOP: refusing to overwrite ' + file); process.exit(3); }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const policy = require(path.join(REPO, 'scripts', 'policies', MAP[POLICY].file))[MAP[POLICY].exp];
  const { Game } = await loadGame({ seed: seed, mode: 'tendfloor-guard-' + RUN, fullTelemetry: false });
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
    seed: seed, policy: POLICY, arm: 'tendfloor-guard', run: RUN, anchorCommit: ANCHOR,
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
  const AN = require(path.join(REPO, 'scripts', 'test-tendfloor-guard-analyze-20261104'));
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'tendfloor-guard-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const s = AN.summarizeLeg(out);
    console.log(JSON.stringify({
      seed: out.seed, policy: out.policy, days: out.days, endReason: out.endReason, won: out.won,
      scaleRank: out.scaleRank, maxWave: out.maxWave, endUnlockedWave: out.endUnlockedWave,
      firstDiploDay: s.firstDiploDay, diploDays: s.diploDays, holdShare: s.holdShare,
      drops: s.drops.length, recoveries: s.recoveries.length, trajectory: s.trajectory,
      classified: s.classified, errors: out.instrumentErrors.length,
      everW4: s.everW4, everW5: s.everW5, tendTotal: s.tendTotal,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

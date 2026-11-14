// standing99107-driver-20261114.js — standing-accumulation
// decomposition driver (arm sim-standing99107-b). Competent policy
// VERBATIM, default env, death-aware horizon (runDays ends on
// village death / win). Seeds run sequentially in one process via
// the shared harness (loadGame per seed). Per-seed JSON goes to
// evidence/2026-11-14/perseed-standing99107-b/ (sims write once,
// on purpose). Refuses to overwrite an existing per-seed file.
// The daily snapshot never calls villageStandingTotal or
// unlockedWave (side-effecting); ONE end-of-run unlockedWave call
// is made AFTER the run and reported separately
// (endUnlockedWave, endCallMovedPeak) — never counted as a natural
// door-open.
// Usage:
//   DAYS=150 SEEDS=99101,99102 RUN=standing99107-b node scripts/standing99107-driver-20261114.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const INST = require(path.join(REPO, 'scripts', 'standing99107-instrument-20261114'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'standing99107-b';
if (!SEEDS.length) { console.error('STANDING99107 STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-14', 'perseed-standing99107-b');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'standing99107-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('STANDING99107 STOP: refusing to overwrite ' + file); process.exit(3); }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-standing99107', fullTelemetry: false });
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
  // End-of-run unlock read, reported separately (never a natural door-open).
  let peakBeforeEndCall = null, endUnlockedWave = null, peakAfterEndCall = null;
  try { peakBeforeEndCall = Game._standingPeakWave ? Game._standingPeakWave() : null; } catch (e) {}
  try { endUnlockedWave = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('endUnlockedWave: ' + String(e.message).slice(0, 80)); }
  try { peakAfterEndCall = Game._standingPeakWave ? Game._standingPeakWave() : null; } catch (e) {}
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  let scaleRank = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  const out = {
    seed: seed, arm: 'standing99107-b', run: RUN, anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1,
    endUnlockedWave: endUnlockedWave,
    peakBeforeEndCall: peakBeforeEndCall, peakAfterEndCall: peakAfterEndCall,
    endCallMovedPeak: (peakBeforeEndCall != null && peakAfterEndCall != null && (peakAfterEndCall | 0) > (peakBeforeEndCall | 0)),
    daily: t.daily, killEvents: t.killEvents, deathEvents: t.deathEvents,
    feastEvents: t.feastEvents, standingLines: t.standingLines, saySample: t.saySample,
    wrapCounts: t.wrapCounts,
    instrumentErrors: t.instrumentErrors.concat(errors),
  };
  return out;
}

(async function () {
  const AN = require(path.join(REPO, 'scripts', 'standing99107-analyze-20261114'));
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'standing99107-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const s = AN.summarizeSeed(out);
    console.log(JSON.stringify({
      seed: out.seed, days: out.days, endReason: out.endReason, won: out.won,
      scaleRank: out.scaleRank, maxWave: out.maxWave, endUnlockedWave: out.endUnlockedWave,
      readyDays: s.readyDayCount, readyBlockedStanding: s.readyBlockedStandingDays,
      readyBlockedOther: s.readyBlockedOtherDays, doorOpenDay: s.doorOpenDay,
      bestCapped: s.bestCapped, bestRaw: s.bestRaw, bestSplit: s.bestSplit,
      warKills: s.warKills, diploLinks: s.diplomacyLinksEver.length,
      feasts: s.feastCount, ladderEnd: s.ladderEnd ? s.ladderEnd.tracks : null,
      reconMismatches: s.reconMismatches.length, unclassifiedDeltas: s.unclassifiedDeltas.length,
      unclassifiedReleases: s.unclassifiedReleases.length, mismatches: s.mismatchDays.length,
      errors: out.instrumentErrors.length, file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

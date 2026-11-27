// reunionwild2-b-driver-20261127.js — Reunionwild findings-cluster
// driver (arm sim-reunionwild2-b). Reuses the bloodcluster driver shape
// VERBATIM (competent policy, death-aware horizon, sequential seeds
// in one process via the shared harness) under the reunionwild2
// instrument (bloodcluster base + live-fight context on tbStarts +
// playerDeath wrap). Per-seed JSON goes to
// evidence/2026-11-27/perseed-reunionwild2-b/ (sims write once, on
// purpose). Refuses to overwrite an existing per-seed file.
// The daily snapshot never calls villageStandingTotal or
// unlockedWave (side-effecting); ONE end-of-run unlockedWave call
// is made AFTER the run and reported separately
// (endUnlockedWave, endCallMovedPeak) — never counted as a natural
// door-open.
// Usage:
//   DAYS=150 SEEDS=111501,111502 RUN=reunionwild2-b node scripts/reunionwild2-b-driver-20261127.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const INST = require(path.join(REPO, 'scripts', 'reunionwild2-b-instrument-20261127'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'reunionwild2-b';
if (!SEEDS.length) { console.error('REUNIONWILD2 STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-27', 'perseed-reunionwild2-b');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'reunionwild2-b-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('REUNIONWILD2 STOP: refusing to overwrite ' + file); process.exit(3); }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-reunionwild2-b', fullTelemetry: false });
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
  let endState = null;
  try {
    const v = st.village || {};
    endState = {
      scholarId: Game.villagerId || null,
      roster: (v.roster || []).slice(),
      exiles: ((v.exiles || []).map(function (x) { return { vid: x && x.vid, day: (x && x.day) | 0, how: (x && x.how) || 'left' }; })),
    };
  } catch (e) { errors.push('endState: ' + String(e.message).slice(0, 80)); }
  const out = {
    seed: seed, arm: 'reunionwild2-b', run: RUN, anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1,
    endUnlockedWave: endUnlockedWave,
    peakBeforeEndCall: peakBeforeEndCall, peakAfterEndCall: peakAfterEndCall,
    endCallMovedPeak: (peakBeforeEndCall != null && peakAfterEndCall != null && (peakAfterEndCall | 0) > (peakBeforeEndCall | 0)),
    endState: endState,
    daily: t.daily, killEvents: t.killEvents, deathEvents: t.deathEvents,
    feastEvents: t.feastEvents, standingLines: t.standingLines, releaseLines: t.releaseLines, saySample: t.saySample,
    fieldFights: t.fieldFights, tbStarts: t.tbStarts, tbKillCtx: t.tbKillCtx,
    playerDeaths: t.playerDeaths,
    wrapCounts: t.wrapCounts,
    instrumentErrors: t.instrumentErrors.concat(errors),
  };
  return out;
}

(async function () {
  const AN = require(path.join(REPO, 'scripts', 'reunionwild2-b-analyze-20261127'));
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'reunionwild2-b-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const s = AN.summarizeSeed(out);
    console.log(JSON.stringify({
      seed: out.seed, days: out.days, endReason: out.endReason, won: out.won,
      scaleRank: out.scaleRank, maxWave: out.maxWave, endUnlockedWave: out.endUnlockedWave,
      heraldCalls: s.heraldCalls, heraldGenuine: s.heraldGenuine,
      heraldRefusedLive: s.heraldRefusedLive, heraldRefusedNoLive: s.heraldRefusedNoLive,
      heraldVerdict: s.heraldVerdict,
      playerDeaths: (out.playerDeaths || []).length,
      sameDayDoubles: s.sameDayDoubles.length,
      w4Contacts: s.w4Contacts, w4Kills: s.w4Kills,
      errors: out.instrumentErrors.length, file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

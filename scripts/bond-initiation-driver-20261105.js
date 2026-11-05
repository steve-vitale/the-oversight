// bond-initiation-driver-20261105.js — bond-initiation build driver
// (Steve ruling 2026-11-04 22:32: villagers initiate bonds).
// Policy VERBATIM: competent only. Death-aware horizon (runDays ends
// on village death / win). Per-seed JSON goes to
// evidence/2026-11-05/perseed-bondinit-b/ (sims write once, on
// purpose). Refuses to overwrite an existing per-seed file.
// The driver is IDENTICAL for baseline and armed legs: on baseline
// (master before the build) proposeBond does not exist, so the
// instrument records 0 proposals — which IS the baseline. The leg
// is recorded in the JSON (RUN=baseline|armed).
// Usage:
//   DAYS=90 SEEDS=84101,84102 RUN=baseline node scripts/bond-initiation-driver-20261105.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const INST = require(path.join(REPO, 'scripts', 'bond-initiation-instrument-20261105'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '90', 10) || 90;
const RUN = process.env.RUN || 'baseline';
const POLICY = 'competent';
if (!SEEDS.length) { console.error('BONDINIT STOP: SEEDS required.'); process.exit(2); }
if (RUN !== 'baseline' && RUN !== 'armed') { console.error('BONDINIT STOP: RUN must be baseline|armed.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-05', 'perseed-bondinit-b');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'bondinit-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('BONDINIT STOP: refusing to overwrite ' + file); process.exit(3); }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const policy = require(path.join(REPO, 'scripts', 'policies', 'competent')).competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-bondinit', fullTelemetry: false });
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
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  let scaleRank = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  const out = {
    seed: seed, policy: POLICY, arm: 'bondinit', run: RUN, leg: RUN, anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1,
    daily: t.daily, proposalEvents: t.proposalEvents, decisionEvents: t.decisionEvents,
    bondTeleEvents: t.bondTeleEvents, linkEvents: t.linkEvents,
    convoEvents: t.convoEvents, sayLines: t.sayLines,
    instrumentErrors: t.instrumentErrors.concat(errors), wrapCounts: t.wrapCounts,
  };
  return out;
}

(async function () {
  const AN = require(path.join(REPO, 'scripts', 'bond-initiation-analyze-20261105'));
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'bondinit-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const s = AN.summarizeSeed(out);
    console.log(JSON.stringify({
      seed: out.seed, leg: RUN, days: out.days, endReason: out.endReason, won: out.won,
      scaleRank: out.scaleRank, maxWave: out.maxWave,
      proposalsPerson: s.proposalsPerson, proposalsPersonNpc: s.proposalsPersonNpc,
      accepted: s.accepted, refused: s.refused, acceptRate: s.acceptRate,
      linkRaises: s.linkRaises, proposeLinkCalls: s.proposeLinkCalls,
      bondsInitiated: s.bondsInitiated, bondsTotal: s.bondsTotal,
      bondsAccumulated: s.bondsAccumulated, gateFails: s.gateFails,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

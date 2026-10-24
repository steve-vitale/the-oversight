#!/usr/bin/env node
// sim-rerunclock-sense.js — sense-only narration:true replay of one
// config (arm sim-rerunclock). SENSE-TESTING LAW: read a transcript and
// judge meaning, coherence, consequences — never just counts.
// MARKED NON-MEASURED: narration shifts trajectories (proven by
// postunlock-b), so this replay NEVER enters the census. It exists only
// to sense-check one qualifying village (prefer a door-open or national
// config; fall back to a representative survivor).
// Writes the window transcript (window-open-14d..end, capped 400 lines)
// to OUT (default evidence/2026-10-24/perseed-rerunclock/
// sim-rerunclock-sense.txt) and prints a one-line summary.
// Usage: node scripts/sim-rerunclock-sense.js [SEED=73101 OUT=... DAYS=180]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const PI = require(path.join(REPO, 'scripts', 'postunlock-instrument'));
const RI = require(path.join(REPO, 'scripts', 'sim-rerunclock-instrument'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

const SEED = parseInt(process.env.SEED || '73101', 10);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const OUT = process.env.OUT || path.join(REPO, 'evidence', '2026-10-24', 'perseed-rerunclock', 'sim-rerunclock-sense.txt');

async function main() {
  const t = {};
  const { Game } = await loadGame({ seed: SEED, mode: 'rerunclock', fullTelemetry: false, narration: true });
  const uninstall = PI.install(Game, t);
  const policy = RI.wrapPolicy(competent, t);
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  const traj = RI.deriveTrajectory(t.rerunclockDaily, t.postunlockFights, t.postunlockDeaths, t.unlock,
    { endReason: result.endReason, days: result.days, national: 0 });
  const w5Day = t.unlock ? t.unlock.w5Day : null;
  const open = traj.windowOpen;
  let ring = t.sayRing || [];
  if (open != null) ring = ring.filter(s => s && s.day >= open - 14);
  if (ring.length > 400) ring = ring.slice(ring.length - 400);
  const header = [
    'SENSE-ONLY REPLAY — NON-MEASURED (narration shifts trajectories; never enters the census)',
    `seed=${SEED} policy=competent days=${result.days} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} w4Day=${t.unlock ? t.unlock.w4Day : null} w5Day=${w5Day} nationalDay=${traj.nationalDay} tierAtEnd=${traj.tierAtEnd} rerunAll=${traj.rerun.all} killerClass=${traj.killerClass} sayLive=${!!t.sayLive} ringLines=${ring.length}`,
    '',
  ].join('\n');
  const body = header + ring.map(s => `[d${s.day}] ${s.text}`).join('\n') + '\n';
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, body);
  console.log(`SENSE-DONE seed=${SEED} end=${result.endReason} w5Day=${w5Day} nationalDay=${traj.nationalDay} tierAtEnd=${traj.tierAtEnd} sayLive=${!!t.sayLive} ring=${ring.length} -> ${OUT}`);
}
if (require.main === module) {
  main().catch(e => { console.error('SENSE FAILED:', (e && e.stack) || e); process.exit(1); });
}
module.exports = { main };

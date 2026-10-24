#!/usr/bin/env node
// sim-doorready-sense.js — sense-only narration:true replay of one config
// (arm sim-doorready, run 2026-10-24). KILLED 2026-10-24 with the arm (see
// the sweep header): requires the deleted policy module; retained as method
// documentation. SENSE-TESTING LAW: read the
// transcript end-to-end and judge meaning, coherence, consequences.
// MARKED NON-MEASURED: narration shifts trajectories, so this replay NEVER
// enters the pilot census. It exists only to sense-check one village (a
// door-open village if the pilot found one, else one representative run).
// Writes the door-window transcript (door-14d..end, capped 400 lines) to
// OUT (default evidence/2026-10-24/perseed-doorready/sim-doorready-sense.txt).
//
// Usage:
//   node scripts/sim-doorready-sense.js [SEED=71901 POLICIES=doorready OUT=... DAYS=180]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const PI = require(path.join(REPO, 'scripts', 'postunlock-instrument'));
const DR = require(path.join(REPO, 'scripts', 'policies', 'doorready'));

const SEED = parseInt(process.env.SEED || '71901', 10);
const BASE = (process.env.POLICIES || 'doorready').split(',')[0].trim();
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const OUT = process.env.OUT || path.join(REPO, 'evidence', '2026-10-24', 'perseed-doorready', 'sim-doorready-sense.txt');

async function main() {
  const policy = BASE === 'doorready' ? DR.doorready() : DR.baseline();
  const { Game } = await loadGame({ seed: SEED, mode: 'doorready', fullTelemetry: false, narration: true });
  const t = {};
  const uninstall = PI.install(Game, t);
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  const w5Day = t.unlock ? t.unlock.w5Day : null;
  let ring = t.sayRing || [];
  if (w5Day != null) ring = ring.filter(s => s && s.day >= w5Day - 14);
  if (ring.length > 400) ring = ring.slice(ring.length - 400);
  const header = [
    'SENSE-ONLY REPLAY — NON-MEASURED (narration shifts trajectories; never enters the census)',
    `seed=${SEED} base=${BASE} policyId=${policy.id} days=${result.days} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} w4Day=${t.unlock ? t.unlock.w4Day : null} w5Day=${w5Day} sayLive=${!!t.sayLive} ringLines=${ring.length}`,
    '',
  ].join('\n');
  const body = header + ring.map(s => `[d${s.day}] ${s.text}`).join('\n') + '\n';
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, body);
  console.log(`SENSE-DONE seed=${SEED} base=${BASE} end=${result.endReason} w5Day=${w5Day} sayLive=${!!t.sayLive} ring=${ring.length} -> ${OUT}`);
}

if (require.main === module) {
  main().catch(e => { console.error('SENSE FAILED:', (e && e.stack) || e); process.exit(1); });
}
module.exports = { main };

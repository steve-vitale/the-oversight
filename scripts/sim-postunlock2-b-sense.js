#!/usr/bin/env node
// sim-postunlock2-b-sense.js — sense-only narration:true replay of one
// config (arm sim-postunlock2-b, run fleshout-20261024T0925Z).
// SENSE-TESTING LAW: the sense pass reads a transcript end-to-end and
// judges meaning, coherence, consequences — never just counts.
//
// MARKED NON-MEASURED: narration shifts trajectories (proven by
// postunlock-b: death day 151 vs 156 on the same config), so this replay
// NEVER enters the census. It exists only to sense-check one door-open
// village (or, if no config opened, one representative config).
// Writes the door-window transcript (door-14d..end, capped 400 lines)
// to OUT (default evidence/2026-10-24/perseed-postunlock2-b/
// sim-postunlock2-b-sense.txt) and prints a one-line summary.
//
// Usage (pinned substrate env, as the sweep):
//   node scripts/sim-postunlock2-b-sense.js [SEED=70804 POLICIES=lead OUT=... DAYS=180]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const WS = require(path.join(REPO, 'scripts', 'wallseg-sweep'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const PI = require(path.join(REPO, 'scripts', 'postunlock-instrument'));

const SEED = parseInt(process.env.SEED || '70804', 10);
const BASE = (process.env.POLICIES || 'lead').split(',')[0].trim();
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const OUT = process.env.OUT || path.join(REPO, 'evidence', '2026-10-24', 'perseed-postunlock2-b', 'sim-postunlock2-b-sense.txt');

async function main() {
  const policy = WS.policyFor(BASE);
  const { Game } = await loadGame({ seed: SEED, mode: 'wallseg', fullTelemetry: false, narration: true });
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

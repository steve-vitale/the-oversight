#!/usr/bin/env node
// scripts/test-meetrule-sense.js — SENSE-ONLY narration replay for
// sim-meetrule-a (NON-MEASURED, never census evidence).
//
// Why this script exists: the shared sweep's --sense mode writes its
// ring to a file, and the container EPERM write flap (see AGENTS.md:
// intermittent write(2) EPERM) failed that file write 4 times in a
// row (8 retries each) during this run, while stdout delivery kept
// working. This script runs the identical substrate (tableseat-
// nowait, seed from SENSE_SEED, 180d, narration on) and prints the
// ring to stdout instead of a file. Trajectories under narration
// differ from the measured corpus by design — nothing printed here
// enters any census number.
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const PI = require('./postunlock-instrument');

async function main() {
  const seed = parseInt(process.env.SENSE_SEED || '73672', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const { Game } = await loadGame({ seed, mode: 'meetrule-diag-sense-stdout', fullTelemetry: false, narration: true });
  const t = {};
  const uninstall = PI.install(Game, t);
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, tableseatNowait, { days, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  const ring = t.sayRing || [];
  let pg = {};
  try { pg = Game.progState ? Game.progState() : {}; } catch (e) {}
  console.log('SENSE-ONLY REPLAY — NON-MEASURED (narration shifts trajectories; never enters the census)');
  console.log('seed=' + seed + ' policy=tableseat-nowait days=' + result.days + ' gameDays=' + result.gameDays + ' endReason=' + result.endReason + ' maxWave=' + result.maxWaveUnlocked + ' sayLive=' + (!!t.sayLive) + ' ringLines=' + ring.length + ' tableWaiting=' + (!!pg.tableWaiting) + ' tableDone=' + (!!pg.tableDone));
  for (const s of ring) console.log('[d' + s.day + '] ' + s.text);
}
main().catch(e => { console.error('SENSE FAILED:', (e && e.stack) || e); process.exit(1); });

#!/usr/bin/env node
// sweep-scholarhome-20261021.js — run the 16-observation scholar_home
// conservation corpus: seeds 8951-8958 x {leadfeast, belongfeast}
// (competent-family base), 180d death-aware, substrate FEASTSCALE_R13=1
// SEATDRIVE=0 SURPLUSFEED-unset (asserted LOUD up front).
//
// Writes per-seed JSONs to evidence/2026-10-21/perseed-scholarhome-rot-b/
// and prints the corpus conservation summary to stdout.
'use strict';
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
process.chdir(ROOT);

const { loadGame, setupGame, runDays, manifest, quietLog } = require('./sim-harness');
const { install, finalize, assertSubstrate } = require('./scholarhome-conservation-20261021');
const { leadfeast, belongfeast } = require('./policies/feastscale');

assertSubstrate();

const SEEDS = [8951, 8952, 8953, 8954, 8955, 8956, 8957, 8958];
const POLICIES = [leadfeast, belongfeast];
const DAYS = 180;
const OUTDIR = path.join(ROOT, 'evidence', '2026-10-21', 'perseed-scholarhome-rot-b');
fs.mkdirSync(OUTDIR, { recursive: true });

function wallNumbers(Game, result) {
  let national = 0, table = 0, won = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  return { national, table, won };
}
function deathCauses(result) {
  const causes = {};
  for (const d of (result.samples && result.samples.deaths) || []) {
    const k = String((d && (d.cause || d.kind)) || 'unknown');
    causes[k] = (causes[k] || 0) + 1;
  }
  return causes;
}

(async () => {
  const corpus = [];
  for (const policy of POLICIES) {
    for (const seed of SEEDS) {
      const t0 = Date.now();
      const { Game } = await loadGame({ seed, mode: 'scholarhome-diag' });
      await setupGame(Game);
      const S = install(Game);
      const man = manifest(seed, policy.id);
      let result;
      await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: man }); });
      const cons = finalize(Game, S);
      const wall = wallNumbers(Game, result);
      const perSeed = {
        seed, policyId: policy.id,
        instrument: 'scholarhome-conservation-v1',
        substrate: 'FEASTSCALE_R13=1 SEATDRIVE=0 SURPLUSFEED-unset',
        anchorCommit: '1aadc167d',
        days: result.days, gameDays: result.gameDays, endReason: result.endReason,
        won: wall.won, national: wall.national, table: wall.table,
        maxWaveUnlocked: result.maxWaveUnlocked || 1,
        deathCauses: deathCauses(result),
        nDeaths: ((result.samples && result.samples.deaths) || []).length,
        conservation: cons.summary,
        sinkShares: cons.shares,
        inflowEvents: cons.summary.nDeposits,
        meanDepositKcal: cons.summary.meanDepositKcal,
        hookCalls: S.hookCalls,
        errors: S.errors,
      };
      const fp = path.join(OUTDIR, `${seed}-${policy.id}.json`);
      fs.writeFileSync(fp, JSON.stringify(perSeed, null, 1) + '\n');
      corpus.push(perSeed);
      console.log(`${policy.id} seed ${seed}: ${((Date.now() - t0) / 1000).toFixed(1)}s ` +
        `days=${result.gameDays} end=${result.endReason} won=${wall.won} nat=${wall.national} ` +
        `inflow=${Math.round(cons.summary.inflow)} attr=${(cons.summary.attributedShare * 100).toFixed(1)}% ` +
        `unexp=${(cons.summary.unexplainedShare * 100).toFixed(2)}% beats=${S.beats.length}`);
    }
  }
  // corpus summary
  const agg = (k) => corpus.reduce((t, r) => t + (r.conservation[k] || 0), 0);
  const shares = {};
  for (const r of corpus) for (const [k, v] of Object.entries(r.sinkShares)) shares[k] = (shares[k] || 0) + v;
  const n = corpus.length;
  const totInflow = agg('inflow');
  const totSinks = agg('sinksTotal');
  console.log('\n=== CORPUS (n=' + n + ') ===');
  console.log(`inflow total=${Math.round(totInflow)} sinks+residual=${Math.round(totSinks)} ` +
    `residual-in-pantry=${Math.round(agg('residual'))} unattributed=${Math.round(agg('unattributed'))}`);
  console.log(`unexplained share=${(agg('unattributed') / Math.max(1, totInflow) * 100).toFixed(3)}% ` +
    `(bar: <=2% equation, >=95% named)`);
  for (const k of Object.keys(shares).sort()) {
    console.log(`  sink ${k}: share=${(shares[k] / n * 100).toFixed(1)}%`);
  }
  const wall = {
    national: corpus.filter(r => r.national).length,
    table: corpus.filter(r => r.table).length,
    wins: corpus.filter(r => r.won).length,
    w4: corpus.filter(r => r.maxWaveUnlocked >= 4).length,
    w5: corpus.filter(r => r.maxWaveUnlocked >= 5).length,
    medDays: corpus.map(r => r.gameDays).sort((a, b) => a - b)[Math.floor(n / 2)],
    maxDays: Math.max(...corpus.map(r => r.gameDays)),
  };
  console.log(`wall: national=${wall.national}/${n} table=${wall.table}/${n} wins=${wall.wins}/${n} ` +
    `w4=${wall.w4}/${n} w5=${wall.w5}/${n} medDays=${wall.medDays} maxDays=${wall.maxDays}`);
  const dc = {};
  for (const r of corpus) for (const [k, v] of Object.entries(r.deathCauses)) dc[k] = (dc[k] || 0) + v;
  console.log('death causes: ' + Object.entries(dc).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(' '));
})().catch(e => { console.error('SWEEP FAILED:', e); process.exit(1); });

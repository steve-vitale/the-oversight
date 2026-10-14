#!/usr/bin/env node
// scripts/sweep-whiffguard-20261014.js — WHIFFGUARD before/after sweep.
//
// One (seed x policy x guard) run -> canonical trajectory JSON for
// byte-identical comparison. WHIFFGUARD=0 = BEFORE (pristine); unset/1 = AFTER.
// FOURTHLINK=1 selects the uncapped-LEAD road (fourthlink arm baseline).
//
// Usage:
//   SEED=44 POLICY=leadcourt FOURTHLINK=1 WHIFFGUARD=0 OUT=/tmp/wg-a1.json node scripts/sweep-whiffguard-20261014.js
//
// The canonical digest covers every trajectory field the loops measure:
// days, endReason, survival, wave unlock/reach, national/table/wins,
// Standing/ledger/scale samples, death causes, pantry/knowledge/codex.
'use strict';
process.env.FOURTHLINK = '1';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { fourthlink } = require('./policies/fourthlink');
const { belongseek } = require('./policies/belongseek');

const SEED = parseInt(process.env.SEED || '44', 10);
const POLICY = process.env.POLICY || 'leadcourt';
const OUT = process.env.OUT || '/tmp/wg-out.json';
const GUARD = process.env.WHIFFGUARD === '0' ? 0 : 1;

const POLICIES = { leadcourt: fourthlink, belongseek: belongseek };

function canonDeaths(result) {
  const causes = {};
  for (const d of ((result.samples || {}).deaths) || []) {
    const k = String((d.player ? 'player:' : 'villager:') + (d.cause || 'unknown'));
    causes[k] = (causes[k] || 0) + 1;
  }
  return causes;
}

(async () => {
  const t0 = Date.now();
  const policy = POLICIES[POLICY];
  if (!policy) { console.error('FATAL: unknown policy ' + POLICY); process.exit(2); }
  const { Game } = await loadGame({ seed: SEED, mode: 'whiffguard-' + POLICY });
  await setupGame(Game);
  const result = await runDays(Game, policy, { days: 180, sampleEvery: 10 });
  const s = result.samples || {};
  const rankVal = (r) => ({ village: 0, local: 1, regional: 2, national: 3, global: 4 }[String(r).toLowerCase()] ?? -1);
  let maxScaleRank = -1;
  for (const row of (s.scale || [])) {
    const v = rankVal(row && row[1]);
    if (v > maxScaleRank) maxScaleRank = v;
  }
  const canon = {
    seed: SEED, policy: POLICY, guard: GUARD,
    days: result.days, endReason: result.endReason,
    gameDays: result.gameDays,
    maxWaveUnlocked: result.maxWaveUnlocked,
    maxScaleRank: maxScaleRank,
    maxStanding: Math.max(0, ...((s.standing || []).map(r => r[1] || 0))),
    ledger: s.ledger, scale: s.scale, standing: s.standing,
    pop: s.pop, pantry: s.pantry, knowledge: s.knowledge,
    codexM: s.codexM, codexS: s.codexS, trust: s.trust,
    deaths: canonDeaths(result),
  };
  const elapsedSec = Math.round((Date.now() - t0) / 1000);
  fs.writeFileSync(OUT, JSON.stringify(canon) + '\n');
  console.error(`done seed=${SEED} policy=${POLICY} guard=${GUARD} days=${result.days} end=${result.endReason} elapsed=${elapsedSec}s -> ${OUT}`);
})().catch(e => { console.error('FATAL', e); process.exit(1); });

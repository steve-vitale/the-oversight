#!/usr/bin/env node
// MEASURE (deferroffer arm, 2026-10-14): A/A trajectory comparison, pristine vs fixed.
// 8 seeds (11/22/33/44/55/66/77/88) x leadfeast+tableWalk, 180d death-aware.
// Run once per code version:
//   node scripts/measure-deferroffer-20261014.js <out.json>
// then compare the two JSONs: per-day trajectory hashes must be byte-identical
// EXCEPT on deferring seeds, where divergence may begin exactly at the
// re-offer (day 90) and must be explainable (re-offer beats -> walked win).
'use strict';
// FEASTSCALE_R13=1: the wincensus baseline ran leadfeast under this flag —
// without it the policy never reaches the table at all (verified: 0/8 table
// vs wincensus 3/8). Set before the policy require, mirroring
// scripts/sweep-wincensus-20261014.js.
process.env.FEASTSCALE_R13 = process.env.FEASTSCALE_R13 || '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');
const { wrapWithTableWalk } = require('./wincensus-20261014');

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = 180;

function dayHash(Game) {
  try {
    const s = Game.state.scholar || {}, v = Game.state.village || {};
    const parts = [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
      (v.roster || []).length, Game.map.px, Game.map.py,
      Game.unlockedWave ? Game.unlockedWave() : 0,
      Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100)];
    return parts.join('|');
  } catch (e) { return 'ERR'; }
}

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'deferroffer-aa' });
  await setupGame(Game);
  const sayLines = [];
  const origSay = Game.say;
  Game.say = function (t) { sayLines.push(Game.state.scholar.day + ':' + String(t).slice(0, 60)); return origSay.call(this, t); };
  const policy = wrapWithTableWalk(leadfeast);
  const baseDaily = policy.daily.bind(policy);
  const hashes = [];
  const wrapped = Object.create(policy);
  wrapped.daily = function (G, ctx) {
    baseDaily(G, ctx);
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
  };
  const r = await runDays(Game, wrapped, { days: DAYS, sampleEvery: 1 });
  const s = Game.state.scholar || {};
  const waits = sayLines.filter(l => l.includes('THE TABLE WAITS'));
  const returns = sayLines.filter(l => l.includes('THE TABLE RETURNS'));
  return {
    seed, days: r.days, endReason: r.endReason,
    won: !!Game.won, over: !!Game.over, finalDay: s.day || 0,
    deferralDay: waits.length ? parseInt(waits[0].split(':')[0], 10) : null,
    reofferDay: returns.length ? parseInt(returns[0].split(':')[0], 10) : null,
    reofferBeats: returns.length,
    dayHashes: hashes,
  };
}

async function main() {
  const outPath = process.argv[2];
  if (!outPath) { console.error('usage: node scripts/measure-deferroffer-20261014.js <out.json>'); process.exit(2); }
  const fs = require('fs');
  const results = [];
  for (const seed of SEEDS) {
    const r = await runSeed(seed);
    console.log(`seed ${seed}: days=${r.days} end=${r.endReason} won=${r.won} deferral=${r.deferralDay} reoffer=${r.reofferDay}`);
    results.push(r);
  }
  fs.writeFileSync(outPath, JSON.stringify(results, null, 1));
  console.log('wrote ' + outPath);
}

main().catch(e => { console.error('HARNESS FAILURE:', e); process.exit(2); });

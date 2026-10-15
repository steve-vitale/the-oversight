#!/usr/bin/env node
// sweep-rangedehy-20261015.js — ranging-dehydration measurement sweep
// (ARM 3, loop B, 2026-10-15, sim-findings #290).
// INSTRUMENT ONLY — scripts/rangedehy-lib-20261015.js; zero src/js changes.
// 8 seeds x {leadcourt, belongseek}, 180d death-aware, ARMED only (this is
// a measurement instrument, not a before/after lever). A/A sanity: seeds
// 11/22 leadcourt run PRISTINE alongside; per-day state hashes must be
// byte-identical to the armed side (instrument honesty at full horizon).
//
// Usage:
//   SMOKE=1 node scripts/sweep-rangedehy-20261015.js   # 1 seed x 2 policies x 15d
//   node scripts/sweep-rangedehy-20261015.js           # full sweep (16 armed + 2 pristine)
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installRangeDehy } = require('./rangedehy-lib-20261015');
const { belongseek } = require('./policies/belongseek');
const { leadcourt } = require('./policies/leadcourt');

const POLICIES = { belongseek, leadcourt };
const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = 180;
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-rangedehy');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function dayHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const vw = v.water || {};
  return [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0), Math.round(s.hydration || 0),
    (s.water || []).length, Math.floor(vw.clean || 0), Math.floor(vw.dirty || 0),
    (v.roster || []).length, Game.villagerId].join('|');
}

function stdMetrics(Game, result) {
  const out = { won: false, rank: 'village', tableWaiting: false, maxWave: 1, gameDays: 0, deaths: {} };
  try { out.won = !!Game.won; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { out.tableWaiting = !!(Game.progState ? Game.progState() : {}).tableWaiting; } catch (e) {}
  try { out.maxWave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  try { out.gameDays = Game.state.scholar.day || 0; } catch (e) {}
  try {
    for (const d of ((result && result.samples && result.samples.deaths) || [])) {
      const k = (d.kind || 'unknown') + ':' + (d.cause || 'unknown');
      out.deaths[k] = (out.deaths[k] || 0) + 1;
    }
  } catch (e) {}
  return out;
}

async function oneRun(seed, policyId, days, armed) {
  const policy = POLICIES[policyId];
  const { Game } = await loadGame({ seed, mode: 'rangedehy-' + policyId + (armed ? '-a' : '-p'), fullTelemetry: false });
  await setupGame(Game);
  const track = armed ? installRangeDehy(Game) : null;
  let dailyCalls = 0;
  const od = policy.daily;
  const pwrap = Object.assign({}, policy);
  if (od) pwrap.daily = (G, ctx) => { dailyCalls++; return od(G, ctx); };
  // per-day state hash for the A/A sanity comparison
  const hs = [];
  const oed = Game.endDay.bind(Game);
  Game.endDay = function () {
    const r = oed.apply(this, arguments);
    try { hs.push(dayHash(this)); } catch (e) { hs.push('ERR'); }
    return r;
  };
  let result = null;
  await quietLog(async () => { result = await runDays(Game, pwrap, { days, sampleEvery: 10 }); });
  const m = stdMetrics(Game, result);
  const fin = track ? track.finalize() : null;
  return {
    seed, policyId, armed, days: m.gameDays, dailyCalls,
    won: m.won, rank: m.rank, national: (RANK_ORDER[m.rank] || 0) >= 2 ? 1 : 0,
    tableWaiting: m.tableWaiting, maxWave: m.maxWave, deaths: m.deaths,
    hashes: hs,
    instr: fin ? {
      nDehydration: fin.nDehydration, nFullyAttributed: fin.nFullyAttributed,
      coverage: fin.coverage, deaths: fin.deaths,
      nOtherDeaths: fin.nOtherDeaths,
      verbsAll: fin.verbsAll, nVerbCalls: fin.nVerbCalls,
      refusedFills: fin.refusedFills,
      rangedDays: fin.rangedDays, maxMapDist: fin.maxMapDist, awayNights: fin.awayNights,
      nDaily: fin.nDaily, aftermaths: fin.aftermaths,
      instrErrors: fin.instrErrors,
    } : null,
  };
}

async function main() {
  const smoke = process.env.SMOKE === '1';
  const seeds = smoke ? [11] : SEEDS;
  const days = smoke ? 15 : DAYS;
  const policyIds = Object.keys(POLICIES);
  fs.mkdirSync(EVID, { recursive: true });
  const rows = [];
  const t0 = Date.now();
  for (const policyId of policyIds) {
    for (const seed of seeds) {
      process.stderr.write(`rangedehy run policy=${policyId} seed=${seed} armed ...\n`);
      const row = await oneRun(seed, policyId, days, true);
      rows.push(row);
      fs.writeFileSync(path.join(EVID, `run-${policyId}-s${seed}.json`), JSON.stringify(row, null, 1));
      process.stderr.write(`  done: days=${row.days} dehy=${row.instr.nDehydration} cov=${row.instr.coverage} ranged=${row.instr.rangedDays}d maxDist=${row.instr.maxMapDist}\n`);
      // A/A sanity: pristine twin for leadcourt seeds 11/22
      if (!smoke && policyId === 'leadcourt' && (seed === 11 || seed === 22)) {
        process.stderr.write(`rangedehy run policy=${policyId} seed=${seed} pristine ...\n`);
        const prow = await oneRun(seed, policyId, days, false);
        const same = prow.hashes.length === row.hashes.length &&
          prow.hashes.every((h, i) => h === row.hashes[i]);
        prow.aaByteIdentical = same;
        fs.writeFileSync(path.join(EVID, `run-${policyId}-s${seed}-pristine.json`), JSON.stringify(prow, null, 1));
        process.stderr.write(`  A/A ${same ? 'BYTE-IDENTICAL' : 'DIVERGED'} (${prow.hashes.length} days)\n`);
        if (!same) { console.error('A/A DIVERGENCE — instrument is not trajectory-neutral'); process.exit(2); }
      }
    }
  }
  // summary
  const armed = rows.filter(r => r.armed);
  const med = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
  const deaths = {};
  for (const r of armed) for (const [k, v] of Object.entries(r.deaths)) deaths[k] = (deaths[k] || 0) + v;
  const dehyDeaths = [];
  for (const r of armed) for (const d of (r.instr.deaths || [])) dehyDeaths.push({ policy: r.policyId, seed: r.seed, rec: d });
  const summary = {
    seeds, days, policies: policyIds,
    nArmed: armed.length,
    nDehydration: dehyDeaths.length,
    nFullyAttributed: dehyDeaths.filter(d => d.rec.fullyAttributed).length,
    coverage: dehyDeaths.length ? +(dehyDeaths.filter(d => d.rec.fullyAttributed).length / dehyDeaths.length).toFixed(4) : null,
    instrErrors: armed.reduce((t, r) => t + r.instr.instrErrors.length, 0),
    wall: {
      national: armed.reduce((t, r) => t + r.national, 0) + '/' + armed.length,
      table: armed.reduce((t, r) => t + (r.tableWaiting ? 1 : 0), 0) + '/' + armed.length,
      won: armed.reduce((t, r) => t + (r.won ? 1 : 0), 0) + '/' + armed.length,
      w4: armed.filter(r => r.maxWave >= 4).length + '/' + armed.length,
      w5: armed.filter(r => r.maxWave >= 5).length + '/' + armed.length,
      maxWave: Math.max(...armed.map(r => r.maxWave)),
      medianDays: med(armed.map(r => r.days)),
      maxDays: Math.max(...armed.map(r => r.days)),
    },
    deaths,
  };
  fs.writeFileSync(path.join(EVID, 'summary.json'), JSON.stringify(summary, null, 1));
  console.log(JSON.stringify(summary, null, 1));
  console.error(`sweep done in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });

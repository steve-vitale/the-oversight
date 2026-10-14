#!/usr/bin/env node
// sweep-w5census-r26-20261014.js — wave-5 post-unlock death census (scale-onramp
// r26, diagnostic arm, loop A, 2026-10-14).
//
// DIAGNOSTIC, NOT A LEVER: this is measurement only — aggregate statistics on
// how wave-5 unlockers die. NO before/after comparison: the r25 finding
// (per-run nondeterminism) makes identical-seed before/after unmeasurable
// for this question, so no baseline arm is run here.
//
// Policy: leadfeast (leadcourt + FEASTSCALE_R13=1) — the policy that maximizes
// wave-5 unlocks (5/8 to wave-5 in r19). Seeds 11..88 (standard set), 180d
// death-aware. fullTelemetry: true — death attribution rides the tele stream
// (r17 instrument), and combat_start events give the fatal-fight context.
//
// Usage:
//   SEEDS="11,22,33,44,55,66,77,88" DAYS=180 OUT=evidence/2026-10-14/w5census-r26.json \
//     node scripts/sweep-w5census-r26-20261014.js
'use strict';
process.env.FEASTSCALE_R13 = '1';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');
const { stdSnapshot } = require('./sweep-compare');
const { buildCensusRows, pairFights, findChains, aggregateRows } = require('./w5census-lib');

const MONSTERS = require('../src/data/monsters.json');
const NAME_OF = {};
const MONSTER_NAMES = new Set();
for (const m of MONSTERS) {
  const n = m.name || m.id;
  NAME_OF[m.id] = n;
  MONSTER_NAMES.add(n);
  MONSTER_NAMES.add(m.id);
}
const nameOf = (mid) => NAME_OF[mid] || mid || '?';

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

async function runOne(seed, opts) {
  opts = opts || {};
  const days = opts.days || 180;
  const instrErrors = [];
  const { Game } = await loadGame({ seed, mode: 'w5census', fullTelemetry: true });
  await setupGame(Game);

  const track = {
    unlockDay: {},            // wave -> first day seen
    w5Standing: null,         // standing on the day wave 5 unlocked
    w5Rank: null,
    tableDays: [],            // days tableWaiting was true
    tenures: [],              // [{vid, startDay}] bearer tenures, in order
    maxRank: 0, maxArc: 1,
    exiledEver: false,
    firstW5Fight: null,       // day of first combat_start with wave>=5
  };
  let lastVid = null;
  // noteBearer: record a tenure when the mantle has moved. Called from the
  // daily hook AND right after every playerDeath (the mantle pass) and every
  // player death event — a successor who takes over and dies the same day
  // is never seen by a once-per-day sample (seed 22, 2026-10-14).
  const curDay = (G) => (((G.state || {}).scholar || {}).day || 0);
  const noteBearer = (G, vid, day) => {
    if (vid != null && vid !== lastVid) {
      track.tenures.push({ vid, startDay: day });
      lastVid = vid;
    }
  };
  const bearerOf = (G) => (G.villagerId != null ? G.villagerId : ((G.state || {}).scholar || {}).villagerId);
  if (typeof Game.playerDeath === 'function') {
    const origPD = Game.playerDeath;
    Game.playerDeath = function () {
      const r = origPD.apply(this, arguments);
      try { noteBearer(this, bearerOf(this), curDay(this)); } catch (e) { instrErrors.push('playerDeath hook: ' + e.message); }
      return r;
    };
  }
  if (typeof Game.tele === 'function') {
    const origTele = Game.tele;
    Game.tele = function (type, data) {
      // the dying bearer must hold the mantle at death: record it first
      try { if (type === 'death' && data && data.player && data.who && data.who !== '?') noteBearer(this, data.who, curDay(this)); }
      catch (e) { instrErrors.push('death hook: ' + e.message); }
      return origTele.apply(this, arguments);
    };
  }
  const origDaily = leadfeast.daily;
  const policy = Object.assign({}, leadfeast);
  policy.daily = (G, ctx) => {
    try {
      const s = (G.state || {}).scholar || {};
      const day = s.day || 0;
      const wv = (G.unlockedWave && G.unlockedWave()) || 1;
      for (let w = 1; w <= wv; w++) {
        if (track.unlockDay[w] == null) {
          track.unlockDay[w] = day;
          if (w === 5) {
            try { track.w5Standing = G.villageStanding ? ((G.villageStanding() || {}).total | 0) : null; } catch (e) {}
            try { track.w5Rank = G.scaleRank ? G.scaleRank() : null; } catch (e) {}
          }
        }
      }
      try { const pg = G.progState ? G.progState() : {}; if (pg.tableWaiting) track.tableDays.push(day); } catch (e) {}
      try { noteBearer(G, bearerOf(G), day); } catch (e) { instrErrors.push('tenure: ' + e.message); }
      try { const s2 = stdSnapshot(G); track.maxRank = Math.max(track.maxRank, RANK_ORDER[s2.rank] || 0); track.maxArc = Math.max(track.maxArc, s2.arc || 1); } catch (e) {}
      try { if (G.state && G.state.exiled) track.exiledEver = true; } catch (e) {}
    } catch (e) { instrErrors.push('daily: ' + e.message); }
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) { instrErrors.push('origDaily: ' + e.message); } }
  };

  const result = await quietLog(() => runDays(Game, policy, { days, sampleEvery: 10 }));
  const end = stdSnapshot(Game);

  // --- post-run census assembly ---
  const tele = (Game.state || {}).telemetry || [];
  const playerDeaths = [];
  for (const d of (result.samples.deaths || [])) {
    if (d.player) playerDeaths.push({ day: d.day, who: d.who, cause: d.cause });
  }
  const combatStarts = tele
    .filter(e => e.type === 'combat_start')
    .map(e => ({ day: e.day, mid: e.vs, wave: e.wave || null, pack: e.pack || 1 }));
  for (const c of combatStarts) {
    if (c.wave >= 5 && (track.firstW5Fight == null || c.day < track.firstW5Fight)) track.firstW5Fight = c.day;
  }
  const combatEnds = tele
    .filter(e => e.type === 'combat_end')
    .map(e => ({ day: e.day, result: e.result || null }));
  const pairs = pairFights(combatStarts, combatEnds);
  const U = track.unlockDay[5] != null ? track.unlockDay[5] : null;
  const { rows, reconciliation } = buildCensusRows({
    unlockDayW5: U,
    playerDeaths,
    tenures: track.tenures,
    combatStarts,
    pairs,
    nameOf,
    tableDays: track.tableDays,
    monsterNames: MONSTER_NAMES,
  });
  const reconciled = reconciliation.rows === reconciliation.postUnlockDeaths;

  const row = {
    seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    wave5Unlocked: U != null, unlockDayW5: U, unlockDay: track.unlockDay,
    w5Standing: track.w5Standing, w5Rank: track.w5Rank,
    firstW5Fight: track.firstW5Fight,
    maxArc: track.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === track.maxRank) || 'village',
    tableDays: track.tableDays.length, firstTableDay: track.tableDays.length ? track.tableDays[0] : null,
    exiled: track.exiledEver,
    tenures: track.tenures.length,
    tenureVids: track.tenures.map(t => t.vid),
    playerDeaths: playerDeaths.length,
    instrErrors: instrErrors.length,
    reconciliation: Object.assign({}, reconciliation, { reconciled }),
    census: rows,
    chains: findChains(rows),
  };
  if (opts.verbose !== false) {
    console.log(`  [leadfeast seed ${seed}] days=${row.days} end=${row.endReason} ` +
      `w5=${row.wave5Unlocked ? 'd' + U : 'no'} w5stand=${row.w5Standing} ` +
      `censusRows=${rows.length} recon=${reconciled ? 'OK' : 'FAIL'} ` +
      `instrErr=${instrErrors.length}`);
  }
  return row;
}

async function main() {
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',')
    .map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10);
  const out = process.env.OUT || 'evidence/2026-10-14/w5census-r26.json';
  const commit = (() => { try { return require('child_process').execSync('git rev-parse --short HEAD', { cwd: __dirname + '/..' }).toString().trim(); } catch (e) { return 'unknown'; } })();
  const runs = [];
  for (const seed of seeds) runs.push(await runOne(seed, { days }));
  const allRows = runs.flatMap(r => r.census.map(c => Object.assign({ seed: r.seed }, c)));
  const agg = aggregateRows(allRows);
  // chains are per-seed (a pooled chain mixes seeds); replace the pooled one
  agg.chains = runs.filter(r => r.chains && r.chains.length)
    .map(r => ({ seed: r.seed, chains: r.chains }));
  const unlockers = runs.filter(r => r.wave5Unlocked).length;
  const report = {
    label: 'w5census-r26', policy: 'leadfeast', seeds, days, commit,
    generated: new Date().toISOString(),
    note: 'DIAGNOSTIC ARM — measurement only. No before/after: per-run nondeterminism (r25) makes identical-seed before/after unmeasurable for this question.',
    runs,
    censusAggregate: agg,
    unlockers, censusRows: allRows.length,
    reconFailures: runs.filter(r => !r.reconciliation.reconciled).map(r => r.seed),
  };
  fs.writeFileSync(path.resolve(__dirname, '..', out), JSON.stringify(report, null, 1));
  console.log(`wrote ${out}`);
  console.log(`unlockers: ${unlockers}/${seeds.length}  census rows: ${allRows.length}  ` +
    `recon failures: ${report.reconFailures.length ? report.reconFailures.join(',') : 'none'}`);
  console.log('top causes:', agg.top3.map(c => `${c.cause}:${c.n} (${(c.share * 100).toFixed(0)}%)`).join('  '));
  console.log(`median days-post-unlock at death: ${agg.medianDaysPostUnlock}  table rate: ${(agg.tableRate * 100).toFixed(0)}%`);
  return report;
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { runOne, SEEDS: '11,22,33,44,55,66,77,88', POLICY: 'leadfeast' };

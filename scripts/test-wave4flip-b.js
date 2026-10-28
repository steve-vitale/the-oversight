#!/usr/bin/env node
// test-wave4flip-b.js — seed-10421 wave-4 flip bisection instrument
// (sim-wave4flip-b; prereg evidence/2026-10-28/sim-wave4flip-b-prereg.md
// committed BEFORE any judged sweep in this arm).
//
// Verbatim parameterization of the band() function of the committed
// scripts/test-caughtlift-fix-b.js: same loadGame({seed,
// mode: 'caughtlift-fix-band', fullTelemetry: false}), same
// competent-policy daily wrapper, same runDays({days: 100,
// sampleEvery: 10}), same wave metric (result.maxWaveUnlocked).
// Differences from the worker script, and ONLY these: seed list from
// argv, JSON rows printed for capture. Measurement only: zero src/js
// changes.
//
// Run: node scripts/test-wave4flip-b.js 10421
//      node scripts/test-wave4flip-b.js 10420 10421 10422 10423 10424 10425 10426 10427
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

async function band(seeds) {
  const RANK = { village: 0, regional: 1, national: 2, global: 3 };
  const rows = [];
  for (const seed of seeds) {
    const { Game } = await loadGame({ seed, mode: 'caughtlift-fix-band', fullTelemetry: false });
    let liftCalls = 0; const liftLines = [];
    const origUse = Game.useAbility;
    if (typeof origUse === 'function') {
      Game.useAbility = function (...args) {
        try { if (args[0] === 'thief' || (args[1] || '') === 'steal_pantry') liftCalls++; } catch (e) {}
        return origUse.apply(this, args);
      };
    }
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { const l = String(args[0] || ''); if (/Light Fingers/i.test(l) && liftLines.length < 50) liftLines.push(l); } catch (e) {}
        return origSay.apply(this, args);
      };
    }
    await setupGame(Game);
    const hist = { maxRank: 0, maxArc: 1, everTable: false };
    const base = competent;
    const policy = Object.assign({}, base);
    const origDaily = base.daily;
    policy.daily = (G, ctx) => {
      try {
        const pg = G.progState ? G.progState() : {};
        hist.maxArc = Math.max(hist.maxArc, pg.arc || 1);
        if (pg.tableWaiting) hist.everTable = true;
        const r = (G.scaleRank ? G.scaleRank() : 'village') || 'village';
        hist.maxRank = Math.max(hist.maxRank, RANK[r] || 0);
      } catch (e) {}
      if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
    };
    const result = await runDays(Game, policy, { days: 100, sampleEvery: 10 });
    const endRank = (() => { try { return Game.scaleRank() || 'village'; } catch (e) { return '?'; } })();
    const maxRank = Object.keys(RANK).find(k => RANK[k] === hist.maxRank) || 'village';
    const row = { seed, days: result.days, end: result.endReason, wave: result.maxWaveUnlocked || 1,
      arc: hist.maxArc, rank: maxRank, national: Math.max(hist.maxRank, RANK[endRank] || 0) >= 2 ? 1 : 0,
      table: hist.everTable ? 1 : 0, won: Game.won ? 1 : 0, liftCalls, liftLines: liftLines.length };
    rows.push(row);
    console.log(`  [band seed=${seed}] days=${row.days} end=${row.end} wave=${row.wave} arc=${row.arc} rank=${row.rank} national=${row.national} table=${row.table} won=${row.won} liftCalls=${liftCalls} liftLines=${liftLines.length}`);
    if (liftLines.length) console.log(`    LIFT LINES: ${JSON.stringify(liftLines)}`);
  }
  console.log('BAND ROWS ' + JSON.stringify(rows));
  return rows;
}

(async () => {
  const seeds = process.argv.slice(2).map(s => Number(s)).filter(n => Number.isFinite(n));
  if (!seeds.length) { console.error('usage: node scripts/test-wave4flip-b.js <seed...>'); process.exit(2); }
  await band(seeds);
})().catch(e => { console.error('BAND CRASH', e && e.stack || e); process.exit(2); });

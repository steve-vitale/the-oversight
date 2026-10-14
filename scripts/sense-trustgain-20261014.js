#!/usr/bin/env node
// scripts/sense-trustgain-20261014.js — SENSE-TESTING LAW sample run.
// Runs 2 combos with the daySays archive and prints trust-gain beats for
// the top channels, early/mid/late, so a human can judge whether gains
// read as people-level events or mechanical ticks.
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installTrustCensus, rankChannels, classifyWrite } = require('./trustgain-20261014');
const { leadcourt } = require('./policies/leadcourt');
const { belongseek } = require('./policies/belongseek');

async function oneRun(pid, policy, seed) {
  const { Game } = await loadGame({ seed, mode: `sense-${pid}` });
  await setupGame(Game);
  const census = installTrustCensus(Game);
  const base = policy;
  const wrapped = Object.assign({}, base);
  const origDaily = base.daily;
  wrapped.daily = (G, ctx) => {
    try { census.reproxy(); census.sampleDay(); } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  await quietLog(async () => { await runDays(Game, wrapped, { days: 120 }); });
  const vids = new Set(census.daySamples.map(s => s.vid));
  const { rows } = rankChannels(census, vids);
  console.log(`\n===== ${pid} seed ${seed} =====`);
  for (const ch of rows.filter(x => x.gainTotal > 0).slice(0, 3)) {
    const hitDays = [...new Set(census.writes.filter(w => classifyWrite(w) === ch.channel).map(w => w.day))].sort((a, b) => a - b);
    const pick = hitDays.length <= 2 ? hitDays : [hitDays[0], hitDays[hitDays.length - 1]];
    console.log(`\n--- ${ch.channel} (+${ch.gainTotal.toFixed(0)} x${ch.fires}) ---`);
    for (const d of pick) {
      const lines = (census.daySays[d] || []).filter(m => !/^\[/.test(m)).slice(0, 5);
      for (const m of lines) console.log(`  d${d}: ${m.slice(0, 160)}`);
    }
  }
}

async function main() {
  await oneRun('leadcourt', leadcourt, 55);
  await oneRun('belongseek', belongseek, 44);
}
main().catch(e => { console.error(e); process.exit(1); });

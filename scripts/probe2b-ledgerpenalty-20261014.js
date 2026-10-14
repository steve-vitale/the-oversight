#!/usr/bin/env node
// probe2b — minimal bisect: probe1's exact wrapper pattern, probe2's questions.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { belongseek } = require('./policies/belongseek');

async function main() {
  const { Game } = await loadGame({ seed: 11, mode: 'ledgerpenalty-probe2b' });
  await setupGame(Game);
  const vid = Game.villagerId;
  const rows = [];
  const base = belongseek;
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const s = G.state.scholar || {}, vv = G.state.village || {};
      rows.push({ day: s.day, trust: (vv.trust || {})[vid],
        tr7: G.takeRate7(vid), gr7: G.giveRate7(vid),
        histLen: (((vv.takeHist || {})[vid]) || []).length,
        takes: (vv.takes || {})[vid] || 0 });
    } catch (e) { rows.push({ err: e.message }); }
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  const r = await runDays(Game, policy, { days: 40, sampleEvery: 1 });
  console.log('days=' + r.days + ' rows=' + rows.length);
  for (const row of rows.filter(x => x.day < 12 || x.day % 10 === 0)) {
    console.log(JSON.stringify(row));
  }
}
main().catch(e => { console.error('THREW', e); process.exit(2); });

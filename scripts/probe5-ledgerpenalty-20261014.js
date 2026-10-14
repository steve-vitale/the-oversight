#!/usr/bin/env node
// probe5-ledgerpenalty-20261014.js — did the control scholar join another village?
// Tracks daily: vid, scholar name, joinedVillage, trust (original village),
// location, takes. belongseek:11.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { belongseek } = require('./policies/belongseek');

async function main() {
  const { Game } = await loadGame({ seed: 11, mode: 'ledgerpenalty-probe5' });
  await setupGame(Game);
  const vid = Game.villagerId;
  const rows = [];
  const base = belongseek;
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const s = G.state.scholar || {}, vv = G.state.village || {};
      rows.push({ day: s.day, vid: G.villagerId, name: s.name,
        joined: s.joinedVillage || null,
        trust: (vv.trust || {})[vid],
        takes: (vv.takes || {})[vid] || 0,
        px: G.map.px, py: G.map.py });
    } catch (e) { rows.push({ err: e.message }); }
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  const r = await runDays(Game, policy, { days: 60, sampleEvery: 1 });
  console.log(`days=${r.days} end=${r.endReason}`);
  const vids = [...new Set(rows.map(x => x.vid))];
  console.log('distinct vids:', vids.length, vids.join(','));
  for (const row of rows.filter(x => x.day <= 20 || x.day % 10 === 0)) {
    console.log(`d${row.day}: vid=${String(row.vid).slice(0,12)} name=${row.name} joined=${row.joined} trust=${row.trust} takes=${row.takes} at(${row.px},${row.py})`);
  }
}
main().catch(e => { console.error('THREW', e); process.exit(2); });

#!/usr/bin/env node
// one-off: trust-mentioning say lines on gain days.
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installTrustCensus } = require('./trustgain-20261014');
const { leadcourt } = require('./policies/leadcourt');
(async () => {
  const { Game } = await loadGame({ seed: 55, mode: 'sense2' });
  await setupGame(Game);
  const census = installTrustCensus(Game);
  const wrapped = Object.assign({}, leadcourt);
  const origDaily = leadcourt.daily;
  wrapped.daily = (G, ctx) => { try { census.reproxy(); census.sampleDay(); } catch (e) {} if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} } };
  await quietLog(async () => { await runDays(Game, wrapped, { days: 60 }); });
  const gainDays = new Set(census.writes.filter(w => w.delta > 0).map(w => w.day));
  let n = 0;
  for (const d of [...gainDays].sort((a, b) => a - b).slice(0, 40)) {
    for (const m of (census.daySays[d] || [])) {
      if (/trust/i.test(m)) { console.log(`d${d}: ${m.slice(0, 160)}`); if (++n > 16) break; }
    }
    if (n > 16) break;
  }
  console.log('trust-mentioning lines on gain days:', n);
  // also: what do the top gain days look like in full? pick day with most gains
  const byDay = {};
  for (const w of census.writes) if (w.delta > 0) byDay[w.day] = (byDay[w.day] || 0) + w.delta;
  const top = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0];
  console.log(`\nbiggest gain day: d${top[0]} (+${top[1].toFixed(0)} total)`);
  for (const m of (census.daySays[+top[0]] || []).slice(0, 25)) console.log('  | ' + m.slice(0, 150));
})().catch(e => { console.error(e); process.exit(1); });

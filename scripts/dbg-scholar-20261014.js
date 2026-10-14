#!/usr/bin/env node
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installTrustCensus, classifyWrite } = require('./trustgain-20261014');
const { leadcourt } = require('./policies/leadcourt');
(async () => {
  const { Game } = await loadGame({ seed: 44, mode: 'dbg-scholar' });
  await setupGame(Game);
  const census = installTrustCensus(Game);
  const wrapped = Object.assign({}, leadcourt);
  const origDaily = leadcourt.daily;
  wrapped.daily = (G, ctx) => { try { census.reproxy(); census.sampleDay(); } catch (e) {} if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} } };
  await quietLog(async () => { await runDays(Game, wrapped, { days: 12 }); });
  const m = new Map(census.daySamples.map(s => [s.day, s.vid]));
  console.log('sample days:', [...m.keys()].slice(0, 15).join(','));
  const ad = census.writes.filter(w => classifyWrite(w) === 'gain:assignment-deed').slice(0, 5);
  for (const w of ad) {
    console.log(`write day=${w.day} (type ${typeof w.day}) vid=${String(w.vid).slice(0, 12)} mapVid=${String(m.get(w.day)).slice(0, 12)} mapHasDay=${m.has(w.day)} match=${m.get(w.day) === w.vid}`);
  }
})().catch(e => { console.error(e); process.exit(1); });
